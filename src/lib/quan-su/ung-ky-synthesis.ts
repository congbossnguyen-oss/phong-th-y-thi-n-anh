// QUÂN SƯ THIÊN ANH — ỨNG KỲ SYNTHESIS (Phase 14).
//
// ADAPTER deterministic gom các TEMPORAL CANDIDATE đã có sẵn — KHÔNG phát minh methodology mới, KHÔNG
// tự tính lại Xuất Không / Xuất Mộ / Tiến-Thoái / Tam Hợp. Nguồn sự thật:
//   (1) `tinhUngKy` (luc-hao-ung-ky.ts) — 8 quy luật §6, đã có uuTien (precedence rõ ràng). Chạy PER-HÀO
//       cho Dụng và (khi có blocker Không Vong/Nhập Mộ) cho Kỵ/Nguyên → candidate gắn role.
//   (2) `phanLoaiSauTamHop` — mỗi cục đã có `ungKyChi` + `benhLine` deterministic.
// Ứng Kỳ là CANDIDATE, KHÔNG phải "chắc chắn xảy ra". Thiếu dữ liệu → UNRESOLVED. KHÔNG điểm số, KHÔNG
// để candidate override QuanSuConclusion (chỉ mô tả thời điểm).

import type { FullCastResult } from "../luc-hao";
import { tinhUngKy, type KetQuaUngKy, type UngVienUngKy, type TrangThaiDungThan } from "../luc-hao-ung-ky";
import { phanLoaiSauTamHop } from "../luc-hao-tam-hop-cuc";
import { canLucHao } from "./can-luc-hao";
import type { DungThanResolved, FourGods } from "./advisory-engine";

export type UngKyKind =
  | "XUAT_KHONG" | "XUAT_MO" | "DONG_YAO" | "BIEN_YAO" | "TAM_HOP"
  | "TIEN_THAN" | "THOAI_THAN" | "DAY_BRANCH" | "MONTH_BRANCH" | "OTHER";
export type UngKyDateType = "DAY" | "MONTH" | "YEAR" | "PERIOD";
export type UngKyRole = "DUNG" | "KY" | "NGUYEN" | "THE" | "UNG" | "OTHER";
export type UngKyCandidateStatus = "SUPPORTED" | "POSSIBLE" | "DELAYED" | "UNRESOLVED";

export interface UngKyCandidate {
  kind: UngKyKind;
  chi?: string;
  dateType: UngKyDateType;
  role: UngKyRole;
  sourceLineIndex?: number;
  reason: string[];
  status: UngKyCandidateStatus;
  /** Precedence deterministic từ tinhUngKy (uuTien: 1 = cao nhất). KHÔNG phải điểm số. */
  priority: number;
  /** true = dựa trên phần engine còn nợ audit (Nhập Mộ) — nói dè dặt. */
  canAudit?: boolean;
}

export type UngKyStatus = "RESOLVED" | "MULTIPLE_CANDIDATES" | "DELAYED" | "UNRESOLVED";

export interface UngKySynthesis {
  candidates: UngKyCandidate[];
  primary?: UngKyCandidate;
  status: UngKyStatus;
  reasons: string[];
}

// -------------------------------------------------------------------------------------------------
const BLOCKER_STATES: TrangThaiDungThan[] = ["tuan-khong", "nhap-mo", "nguyet-pha", "bi-hop"];

function dateTypeOf(donVi: KetQuaUngKy["donViGoiY"]): UngKyDateType {
  return donVi === "năm" ? "YEAR" : donVi === "tháng" ? "MONTH" : donVi === "giờ" ? "PERIOD" : "DAY";
}

function kindOf(u: UngVienUngKy): UngKyKind {
  switch (u.tuTrangThai) {
    case "tuan-khong": return "XUAT_KHONG";
    case "nhap-mo": return "XUAT_MO";
    case "tien-than": return "TIEN_THAN";
    case "thoai-than": return "THOAI_THAN";
    case "dong": return "DONG_YAO";
    default: return "OTHER"; // nguyet-pha / bi-hop / phuc-tang / qua-vuong / huu-tu... / tinh
  }
}

/** Map ứng viên tinhUngKy → candidate (gắn role). `onlyKinds` để lọc cho Kỵ/Nguyên (chỉ giữ release). */
function candidatesFrom(res: KetQuaUngKy, role: UngKyRole, onlyKinds?: UngKyKind[]): UngKyCandidate[] {
  if (!res.hopLe) return [];
  const dateType = dateTypeOf(res.donViGoiY);
  return res.ungVien
    .map((u): UngKyCandidate => ({
      kind: kindOf(u),
      chi: u.chi,
      dateType,
      role,
      sourceLineIndex: res.dungThan.viTriHao,
      reason: [u.lyDo],
      status: u.canAudit ? "POSSIBLE" : "SUPPORTED",
      priority: u.uuTien,
      ...(u.canAudit ? { canAudit: true } : {}),
    }))
    .filter((c) => !onlyKinds || onlyKinds.includes(c.kind));
}

/** Ứng viên Tam Hợp — dùng THẲNG `ungKyChi` detector đã xác định (không tính lại). */
function tamHopCandidates(cast: FullCastResult): UngKyCandidate[] {
  const out: UngKyCandidate[] = [];
  for (const th of phanLoaiSauTamHop(cast).danhSach) {
    if (!th.ungKyChi) continue; // TH1/TH4/TH5 không có hào giữ chỗ → không có mốc chi riêng
    const reason = [th.moTa];
    if (th.benhLine !== undefined) reason.push(`Hào mang bệnh trong cục: hào ${th.benhLine}.`);
    const quaSuy = th.phucLine?.quaSuy === true;
    out.push({
      kind: "TAM_HOP",
      chi: th.ungKyChi,
      dateType: "DAY",
      role: "OTHER",
      sourceLineIndex: th.staticLine ?? th.phucLine?.hao ?? th.benhLine,
      reason,
      status: quaSuy ? "POSSIBLE" : "SUPPORTED", // Phục quá suy → cục khó thành → dè dặt
      priority: 2,
    });
  }
  return out;
}

/**
 * Tổng hợp Ứng Kỳ. CONSUME tinhUngKy (per-hào) + phanLoaiSauTamHop. DETERMINISTIC, không điểm số.
 * primary CHỈ đặt khi precedence deterministic (uuTien) cho ra DUY NHẤT 1 mốc ưu tiên cao nhất.
 */
export function synthesizeUngKy(cast: FullCastResult, dt: DungThanResolved, fourGods: FourGods): UngKySynthesis {
  const reasons: string[] = [];
  const candidates: UngKyCandidate[] = [];

  // (1) Dụng Thần — nguồn chính, có precedence.
  let dungRes: KetQuaUngKy | null = null;
  let dungCands: UngKyCandidate[] = [];
  if (dt.hao && (dt.trangThai === "hien" || dt.trangThai === "phuc_tang")) {
    dungRes = tinhUngKy({ cast, viTriHao: dt.hao.hao, laPhucThan: dt.trangThai === "phuc_tang" });
    dungCands = candidatesFrom(dungRes, "DUNG");
    candidates.push(...dungCands);
  } else {
    reasons.push(`Dụng Thần ${dt.trangThai === "khong_hien" ? "không hiện" : "chưa xác định"} → không có mốc Ứng Kỳ cho Dụng.`);
  }

  // (2) Kỵ / Nguyên — CHỈ tạo candidate khi có blocker Không Vong / Nhập Mộ (mô tả khi node hiện hữu/thoát).
  const addNodeIfBlocked = (hao: number, role: UngKyRole) => {
    const cs = canLucHao(cast, hao).currentState;
    const empty = cs.temporalExistence === "EMPTY";
    const hidden = cs.hidden;
    if (!empty && !hidden) return;
    const res = tinhUngKy({ cast, viTriHao: hao });
    const kinds: UngKyKind[] = [];
    if (empty) kinds.push("XUAT_KHONG");
    if (hidden) kinds.push("XUAT_MO");
    const cands = candidatesFrom(res, role, kinds);
    if (cands.length) {
      reasons.push(`${role === "KY" ? "Kỵ Thần" : "Nguyên Thần"} (hào ${hao}) ${empty ? "Không Vong" : "Nhập Mộ"} → mốc node có thể hiện hữu/thoát (KHÔNG phải mất).`);
      candidates.push(...cands);
    }
  };
  for (const k of fourGods.kyThan) addNodeIfBlocked(k.hao, "KY");
  for (const n of fourGods.nguyenThan) addNodeIfBlocked(n.hao, "NGUYEN");

  // (3) Tam Hợp — ungKyChi deterministic.
  const thCands = tamHopCandidates(cast);
  if (thCands.length) reasons.push(`Tam Hợp: ${thCands.length} mốc theo ungKyChi detector.`);
  candidates.push(...thCands);

  // --- status + primary (precedence = uuTien của Dụng; KHÔNG rank bằng số lượng/AI) ---
  let status: UngKyStatus;
  let primary: UngKyCandidate | undefined;
  if (dungRes && dungCands.length > 0) {
    const blockers = dungRes.trangThai.filter((t) => BLOCKER_STATES.includes(t));
    const minPri = Math.min(...dungCands.map((c) => c.priority));
    const top = dungCands.filter((c) => c.priority === minPri);
    primary = top.length === 1 ? top[0] : undefined;
    if (blockers.length > 0) {
      status = "DELAYED";
      reasons.push(`Dụng Thần có trở ngại thời gian (${blockers.join(", ")}) → DELAYED; mốc là thời điểm giải/kích hoạt.`);
    } else if (top.length === 1) {
      status = "RESOLVED";
    } else {
      status = "MULTIPLE_CANDIDATES";
      reasons.push("Nhiều mốc cùng ưu tiên cao nhất — chưa có precedence để chốt một mốc.");
    }
  } else if (candidates.length > 0) {
    status = "MULTIPLE_CANDIDATES";
    reasons.push("Chỉ có mốc ngữ cảnh (Tam Hợp / Kỵ / Nguyên), không có precedence Dụng để chốt.");
  } else {
    status = "UNRESOLVED";
    reasons.push("Không đủ dữ kiện deterministic để xác định mốc Ứng Kỳ.");
  }

  return { candidates, primary, status, reasons };
}
