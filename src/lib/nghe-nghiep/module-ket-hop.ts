/**
 * MODULE KẾT HỢP BÁT TỰ × TỬ VI — Chỉ số Đồng Thuận (Phase 3), đúng
 * `handoff/docs/ket-hop-2-he.md`.
 *
 * Nguyên tắc cốt lõi (mục 1 tài liệu): % = MỨC ĐỒNG THUẬN của HAI HỆ ĐỘC LẬP cùng chỉ một hướng —
 * KHÔNG phải "xác suất đúng nghề". Luôn kèm bậc tin cậy + cờ "bản nháp — chưa calibrate".
 *
 * ⚠️ 2 timeline (Đại Vận Bát Tự / Đại Hạn Tử Vi) KHÔNG gộp — chỉ đánh dấu vùng đồng thuận. Module
 * này CHỈ tính % đồng thuận + hướng hợp nhất khi Cao/Trung; không tự luận thêm huyền học.
 *
 * Trọng số 0.40/0.30/0.30 và ngưỡng 75/50: `ket-hop-2-he.md` mục 7 dặn ĐƯA VÀO CONFIG
 * (career_mapping.agreement_weights) để không hard-code — nhưng file config chưa có khối đó. Tạm để
 * hằng số có cờ THIEN_ANH_MODEL/nháp ở đây; khi bổ sung config sẽ đọc từ file.
 */
import type { ModuleNgheBatTuResult, CareerVector5Truc } from "./module-bat-tu";
import type { ModuleNgheTuViResult, Truc } from "./module-tu-vi";
import type { DomainKey } from "./config";

// ⚠️ Bản nháp THIEN_ANH_MODEL — chờ calibrate trên ≥20 lá số thật (ket-hop-2-he.md mục 6).
const AGREEMENT_WEIGHTS = { truc: 0.4, huong: 0.3, nganh: 0.3 } as const;
const NGUONG = { cao: 75, trung: 50 } as const;

const TRUC_5: Truc[] = ["specialist", "authority", "management", "business", "investment"];

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((s, v, i) => s + v * b[i]!, 0);
  const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (na === 0 || nb === 0) return 0;
  return dot / (na * nb); // 0..1 (vector không âm)
}

function topDomains(mod: { domainScore: { priority: { domain: DomainKey }[]; suitable: { domain: DomainKey }[]; possible: { domain: DomainKey }[] } }, n = 6): DomainKey[] {
  return [...mod.domainScore.priority, ...mod.domainScore.suitable, ...mod.domainScore.possible]
    .map((x) => x.domain)
    .slice(0, n);
}

export type BacTinCay = "cao" | "trung" | "thap";

export interface KetHopResult {
  /** true nếu THIẾU dữ liệu 1 trong 2 hệ để tính đồng thuận (vd chưa có AI luận Bát Tự/Tử Vi). */
  insufficient: boolean;
  /** % đồng thuận 0..100 (làm tròn). null khi insufficient. */
  agreement: number | null;
  bac: BacTinCay | null;
  thanhPhan: {
    trung5Truc: number | null;
    trungHuongQK: number | null;
    trungNganh: number | null;
  };
  /** Ngành cả 2 hệ CÙNG đề xuất (giao Top-6) — hướng đáng tin nhất. */
  nganhHopNhat: DomainKey[];
  phanKy: boolean;
  /**
   * Chỉ có khi phân kỳ (bậc THẤP): cách ĐỌC THEO TẦNG + lộ trình bắc cầu, đúng
   * `handoff/docs/ket-hop-2-he.md` mục 4 — KHÔNG ép hai hệ về một câu trả lời.
   */
  docTheoTang: {
    batTu: string;
    tuVi: string;
    loTrinh: string;
  } | null;
  ketLuanNgan: string;
  /** LUÔN kèm — đây là bản nháp, chưa calibrate. */
  coNhap: true;
  chiTiet: string[];
}

export function tinhKetHop(batTu: ModuleNgheBatTuResult, tuVi: ModuleNgheTuViResult): KetHopResult {
  const chiTiet: string[] = [];
  const btVec = batTu.careerVector.vector;
  const tvVec = tuVi.careerVector.vector;
  const btAxis = batTu.axis.axis;
  const tvAxis = tuVi.axis.axis;

  const thieuVec = !btVec || !tvVec;
  const thieuAxis = btAxis === null || tvAxis === null;
  const thieuNganh = batTu.domainScore.insufficient || tuVi.domainScore.insufficient;

  if (thieuVec || thieuAxis || thieuNganh) {
    const ly: string[] = [];
    if (thieuVec) ly.push("thiếu Career Vector 1 trong 2 hệ");
    if (thieuAxis) ly.push("thiếu trục Quan Lộc↔Kinh Doanh");
    if (thieuNganh) ly.push("thiếu điểm ngành");
    return {
      insufficient: true, agreement: null, bac: null,
      thanhPhan: { trung5Truc: null, trungHuongQK: null, trungNganh: null },
      nganhHopNhat: [], phanKy: false, docTheoTang: null,
      ketLuanNgan: `Chưa đủ dữ liệu để tính đồng thuận (${ly.join("; ")}). Cần AI luận đủ cả 2 hệ.`,
      coNhap: true, chiTiet: ly,
    };
  }

  // a) Trùng 5 trục — cosine similarity → 0..100
  const a = TRUC_5.map((t) => btVec![t as keyof CareerVector5Truc]);
  const b = TRUC_5.map((t) => tvVec![t]);
  const trung5Truc = Math.round(cosineSimilarity(a, b) * 100);
  chiTiet.push(`Trùng 5 trục (cosine) = ${trung5Truc}%`);

  // b) Trùng hướng Quan Lộc ↔ Kinh Doanh
  const sameSide = Math.sign(btAxis!) === Math.sign(tvAxis!) || btAxis === 0 || tvAxis === 0 ? 100 : 0;
  const closeness = 100 - Math.abs(btAxis! - tvAxis!) / 2;
  const trungHuong = Math.round(0.6 * sameSide + 0.4 * closeness);
  chiTiet.push(`Trùng hướng Q↔K = 0.6×${sameSide} + 0.4×${Math.round(closeness)} = ${trungHuong}% (BT ${btAxis} / TV ${tvAxis})`);

  // c) Trùng ngành — Jaccard Top-6
  const btTop = topDomains(batTu);
  const tvTop = topDomains(tuVi);
  const setBt = new Set(btTop);
  const giao = tvTop.filter((d) => setBt.has(d));
  const hop = new Set([...btTop, ...tvTop]);
  const trungNganh = hop.size === 0 ? 0 : Math.round((giao.length / hop.size) * 100);
  chiTiet.push(`Trùng ngành (Jaccard Top-6) = ${giao.length}/${hop.size} = ${trungNganh}%`);

  const agreement = Math.round(
    AGREEMENT_WEIGHTS.truc * trung5Truc + AGREEMENT_WEIGHTS.huong * trungHuong + AGREEMENT_WEIGHTS.nganh * trungNganh,
  );

  const bac: BacTinCay = agreement >= NGUONG.cao ? "cao" : agreement >= NGUONG.trung ? "trung" : "thap";
  const phanKy = bac === "thap";

  // Đọc theo TẦNG khi phân kỳ (ket-hop-2-he.md mục 4): Bát Tự = bản chất/năng lực nền;
  // Tử Vi = biểu hiện/môi trường. Lộ trình bắc cầu tùy hai hệ nghiêng hướng nào.
  const huong = (axis: number): "kinh_doanh" | "to_chuc" | "can_bang" =>
    axis >= 15 ? "kinh_doanh" : axis <= -15 ? "to_chuc" : "can_bang";
  const HUONG_LABEL = { kinh_doanh: "tự chủ – kinh doanh – thương mại", to_chuc: "làm trong tổ chức, theo hệ thống", can_bang: "cân bằng, chưa nghiêng rõ" } as const;
  const btH = huong(btAxis!);
  const tvH = huong(tvAxis!);
  let loTrinh: string;
  if (btH === "kinh_doanh" && tvH === "to_chuc") {
    loTrinh =
      "Giai đoạn đầu nên vào tổ chức / doanh nghiệp lớn để tích lũy chuyên môn, quan hệ và vốn (đúng hình ảnh nghề bên Tử Vi); khi đủ nền tảng thì tách ra tự chủ – kinh doanh, đúng cách tạo tiền gốc của Bát Tự.";
  } else if (btH === "to_chuc" && tvH === "kinh_doanh") {
    loTrinh =
      "Bản chất hợp đường tổ chức / chuyên môn sâu (Bát Tự) — giữ đây làm nền ổn định; đồng thời dùng hình ảnh nghề năng động bên Tử Vi để mở rộng quan hệ, làm dự án hoặc kinh doanh phụ song song, không rời nền tổ chức.";
  } else {
    loTrinh =
      "Hai hệ chưa cùng một hướng rõ rệt — ưu tiên các nhóm ngành mà CẢ HAI cùng gợi ý, và thử nghiệm ở quy mô nhỏ trước khi cam kết dài hạn theo một hướng.";
  }
  const docTheoTang = phanKy
    ? {
        batTu: `Bản chất / năng lực nền — nghiêng ${HUONG_LABEL[btH]}. Đây là cách người này thật sự giỏi và tạo ra giá trị.`,
        tuVi: `Biểu hiện / môi trường xã hội — nghiêng ${HUONG_LABEL[tvH]}. Đây là hình ảnh nghề và môi trường dễ phát tiết.`,
        loTrinh,
      }
    : null;

  const ketLuanNgan =
    bac === "cao"
      ? "Hai hệ HỘI TỤ mạnh — cùng chỉ một hướng nghề, độ tin cậy cao."
      : bac === "trung"
        ? "Hai hệ đồng thuận MỘT PHẦN — có hướng chính chung, kèm vài điểm cần lưu ý."
        : "Hai hệ PHÂN KỲ — Bát Tự (năng lực nền/tạo tiền) và Tử Vi (hình ảnh nghề/môi trường) chỉ hướng khác nhau; nên đọc theo tầng, không ép một kết luận.";

  return {
    insufficient: false,
    agreement,
    bac,
    thanhPhan: { trung5Truc, trungHuongQK: trungHuong, trungNganh },
    nganhHopNhat: giao,
    phanKy,
    docTheoTang,
    ketLuanNgan,
    coNhap: true,
    chiTiet,
  };
}
