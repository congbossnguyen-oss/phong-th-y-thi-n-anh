// QUÂN SƯ THIÊN ANH — Advisory Engine: biến kết quả Kinh Dịch + vận trình thành BÁO CÁO CỐ VẤN.
//
// ⚠️ RANH GIỚI CỨNG: engine này KHÔNG tự tính bất kỳ thuật toán huyền học nào (quẻ/hào/đại vận/dụng
// thần/sao). Nó chỉ ĐỌC các tín hiệu ĐÃ ĐƯỢC engine khác tính (FullCastResult của luc-hao.ts:
// vượng suy, Không Vong, quan hệ Nhật/Nguyệt; LuckContext của current-luck.ts) rồi:
//   1. Chấm điểm 0-100 theo QUY TẮC MINH BẠCH (không tùy tiện) — deterministic.
//   2. Suy KẾT LUẬN (verdict) từ điểm + điều kiện.
//   3. Rút "điểm thuận / điểm lưu ý" từ bảng chấm điểm.
// Phần văn xuôi (xu hướng, khuyên, luận chi tiết) HIỆN là bản demo template; khi có LLM + Phần E của
// Thầy, LLM chỉ DIỄN GIẢI lại các dữ kiện này thành lời — không được tự tính thêm.
//
// ⚠️ coNhap: trọng số chấm điểm là bản nháp minh bạch, cần Thầy calibrate (xem ADVISORY_REPORT_SCHEMA.md).

import type { QuanSuInterpretationPayload } from "./divination";
import type { LuckContext } from "./current-luck";
import type { HaoInfo, LucThan, QueDayDu } from "../luc-hao";

export type Verdict = "NEN" | "KHONG_NEN" | "NEN_CHO" | "CO_DIEU_KIEN" | "CHUA_DU_DU_LIEU";

export const VERDICT_LABEL: Record<Verdict, string> = {
  NEN: "NÊN",
  KHONG_NEN: "KHÔNG NÊN",
  NEN_CHO: "NÊN CHỜ",
  CO_DIEU_KIEN: "CÓ THỂ LÀM NHƯNG CÓ ĐIỀU KIỆN",
  CHUA_DU_DU_LIEU: "CHƯA ĐỦ DỮ LIỆU",
};

export interface ScoreItem {
  factor: string; // tên yếu tố
  delta: number; // cộng/trừ vào điểm
  reason: string; // giải thích ngắn (đọc được)
  loai: "thuan" | "luu_y" | "trung_tinh";
}

export interface VanTrinhTomTat {
  daiVan: string; // "Ất Dậu (bình thường)"
  namHienTai: string; // "2026 Bính Ngọ (nghịch)"
  chiBao: { label: string; score: number; higherIsBetter: boolean }[]; // 2-4 chỉ báo
}

export interface AdvisoryReport {
  // 1. KẾT LUẬN
  ketLuan: Verdict;
  ketLuanLabel: string;
  // 2. MỨC ĐỘ THUẬN
  mucDoThuan: number; // 0-100 (deterministic)
  bangChamDiem: ScoreItem[]; // minh bạch điểm từ đâu
  // 3. XU HƯỚNG
  xuHuong: string;
  // 4. ĐIỂM THUẬN (đúng 3)
  diemThuan: string[];
  // 5. ĐIỂM CẦN LƯU Ý (đúng 3)
  diemLuuY: string[];
  // 6. VẬN TRÌNH (null nếu không có ngày sinh)
  vanTrinh: VanTrinhTomTat | null;
  // 7. QUÂN SƯ KHUYÊN (đúng 3 hành động)
  quanSuKhuyen: string[];
  // 8. LUẬN GIẢI CHI TIẾT (chỉ hiện khi người dùng yêu cầu)
  luanGiaiChiTiet: string;

  // Cờ chất lượng
  coNhap: true; // trọng số chấm điểm là bản nháp — Thầy calibrate
  proseLaDemo: true; // đoạn văn xu hướng/khuyên/chi tiết là demo tới khi có LLM
}

// ---------------------------------------------------------------------------------------------
// Ngũ hành sinh/khắc (cho quan hệ Thế-Ứng).
const SINH: Record<string, string> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
const KHAC: Record<string, string> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };

// ---------------------------------------------------------------------------------------------
// Xác định hào Dụng Thần để chấm điểm — ĐỌC từ dung_than_hint (do engine/divination cung cấp),
// KHÔNG tự luận. Trả về hào + trạng thái (hiện / phục tàng / không hiện).
interface DungThanResolved {
  hao: HaoInfo | null; // hào để chấm điểm
  target: LucThan | "the-hao" | null;
  trangThai: "hien" | "phuc_tang" | "khong_hien";
  lyDo: string;
}

/** Chọn 1 hào trong nhiều hào cùng Lục Thân (lưỡng hiện) — theo LUAN_QUE_LUC_HAO_SPEC §4.2. */
function chonLuongHien(cands: HaoInfo[]): HaoInfo {
  const dong = cands.filter((h) => h.isDong);
  if (dong.length === 1) return dong[0];
  const pool = dong.length > 1 ? dong : cands;
  const sach = pool.filter((h) => !h.xunKong && !h.relations.some((r) => r.type === "Nguyệt Phá" || r.type === "Nhật Phá"));
  const pool2 = sach.length > 0 ? sach : pool;
  const theHao = pool2.find((h) => h.theUng === "Thế");
  return theHao ?? pool2[0];
}

function resolveDungThan(chinh: QueDayDu, hint: QuanSuInterpretationPayload["question"]["dung_than_hint"]): DungThanResolved {
  if (hint.kind === "the-hao" || hint.kind === "framework") {
    const the = chinh.hao.find((h) => h.theUng === "Thế") ?? null;
    return {
      hao: the,
      target: "the-hao",
      trangThai: the ? "hien" : "khong_hien",
      lyDo: hint.kind === "framework" ? "Loại việc cần khung riêng — bản này tạm chấm theo Hào Thế (chính anh/chị)." : "Chấm theo Hào Thế (chính anh/chị).",
    };
  }
  // kind === "luc-than"
  const target = hint.value;
  const cands = chinh.hao.filter((h) => h.lucThan === target);
  if (cands.length > 0) {
    return { hao: chonLuongHien(cands), target, trangThai: "hien", lyDo: `Dụng Thần ${target} hiện trên quẻ.` };
  }
  // Không hiện trên quẻ chính → tìm Phục Thần.
  const phuc = chinh.hao.find((h) => h.phucThan?.lucThan === target);
  if (phuc) {
    return { hao: phuc, target, trangThai: "phuc_tang", lyDo: `Dụng Thần ${target} phục tàng (ẩn) dưới hào ${phuc.hao} — chưa lộ rõ.` };
  }
  return { hao: null, target, trangThai: "khong_hien", lyDo: `Dụng Thần ${target} không hiện trên quẻ, cũng không phục tàng — quẻ chưa nói rõ điều anh/chị hỏi.` };
}

// ---------------------------------------------------------------------------------------------
// Chấm điểm 0-100 theo QUY TẮC MINH BẠCH (bản nháp — Thầy calibrate).
const VUONG_SUY_DIEM: Record<string, number> = { "Vượng": 12, "Tướng": 6, "Hưu": -2, "Tù": -8, "Tử": -12 };

interface ChamKetQua {
  diem: number;
  items: ScoreItem[];
  timingBlocker: boolean; // trở ngại kiểu "chưa tới lúc" (Không Vong / Nguyệt Phá) — dẫn tới NÊN CHỜ
}

function chamDiem(resolved: DungThanResolved, chinh: QueDayDu, luck: LuckContext | null): ChamKetQua {
  const items: ScoreItem[] = [];
  let diem = 50;
  let timingBlocker = false;
  const add = (factor: string, delta: number, reason: string) => {
    if (delta === 0) return;
    diem += delta;
    items.push({ factor, delta, reason, loai: delta > 0 ? "thuan" : "luu_y" });
  };

  const hao = resolved.hao;
  if (hao && resolved.trangThai === "hien") {
    // Vượng suy theo Nguyệt Lệnh.
    add("Vượng suy", VUONG_SUY_DIEM[hao.vuongSuy] ?? 0, `Hào chủ (${hao.lucThan}) ${hao.vuongSuy} theo tháng.`);
    // Không Vong = trở ngại thời điểm.
    if (hao.xunKong) { add("Không Vong", -12, "Hào chủ rơi Tuần Không — như việc chưa tới lúc, còn trống."); timingBlocker = true; }
    // Quan hệ với Nhật/Nguyệt.
    for (const r of hao.relations) {
      if (r.type === "Sinh") add("Được sinh", 7, `Được ${r.source === "DAY" ? "Nhật Thần" : "Nguyệt Kiến"} sinh phò.`);
      else if (r.type === "Khắc") add("Bị khắc", -7, `Bị ${r.source === "DAY" ? "Nhật Thần" : "Nguyệt Kiến"} khắc chế.`);
      else if (r.type === "Nguyệt Phá") { add("Nguyệt Phá", -14, "Bị Nguyệt Phá — trở ngại cả tháng."); timingBlocker = true; }
      else if (r.type === "Nhật Phá") { add("Nhật Phá", -10, "Bị Nhật Phá — suy, khó đứng vững."); timingBlocker = true; }
      else if (r.type === "Ám Động") add("Ám động", 5, "Ám động — có lực ngầm hỗ trợ.");
      else if (r.type === "Lâm Nhật" || r.type === "Lâm Nguyệt") add("Đương lệnh", 6, "Hào chủ đương lệnh (trùng Nhật/Nguyệt) — có thế.");
      else if (r.type === "Hợp") add("Được hợp", 3, "Có hợp — dễ thành hình nhưng cần đúng thời.");
      else if (r.type === "Xung") add("Bị xung", -3, "Có xung — dễ dao động.");
      else if (r.type === "Hại") add("Bị hại", -3, "Có hại ngầm — cần đề phòng tiểu tiết.");
    }
  } else if (resolved.trangThai === "phuc_tang") {
    add("Phục tàng", -10, "Điều anh/chị hỏi đang ẩn, chưa lộ ra — thường là chưa tới lúc.");
    timingBlocker = true;
  }

  // Thế - Ứng (ta vs việc/đối phương): dùng ngũ hành 2 hào.
  const the = chinh.hao.find((h) => h.theUng === "Thế");
  const ung = chinh.hao.find((h) => h.theUng === "Ứng");
  if (the && ung) {
    const t = the.nguHanh, u = ung.nguHanh;
    if (SINH[u] === t) add("Ứng sinh Thế", 5, "Phía bên kia/việc có xu hướng thuận về mình.");
    else if (KHAC[u] === t) add("Ứng khắc Thế", -6, "Phía bên kia/việc đang lấn át mình.");
    else if (KHAC[t] === u) add("Thế khắc Ứng", 3, "Mình đang ở thế chủ động.");
    else if (SINH[t] === u) add("Thế sinh Ứng", -2, "Mình đang hao tổn cho việc/người khác.");
  }

  // Vận trình (phông nền) — nhẹ hơn quẻ.
  if (luck) {
    const bandFav: Record<string, number> = { rat_thuan: 2, thuan: 1, trung_binh: 0, thu_thach: -1, nghich: -2 };
    const dv = bandFav[luck.daiVanHienTai.band] ?? 0;
    const ln = bandFav[luuNienBand(luck)] ?? 0;
    if (dv !== 0) add("Đại vận", dv * 5, `Thời vận lớn đang ${luck.daiVanHienTai.danhGia === "tot" ? "thuận" : luck.daiVanHienTai.danhGia === "xau" ? "nghịch" : "tạm ổn"}.`);
    if (ln !== 0) add("Lưu niên", ln * 2.5, `Năm nay ${luck.luuNienHienTai.danhGia === "tot" ? "thuận" : luck.luuNienHienTai.danhGia === "xau" ? "khó" : "tạm"}.`);
  }

  diem = Math.max(0, Math.min(100, Math.round(diem)));
  return { diem, items, timingBlocker };
}

function luuNienBand(luck: LuckContext): string {
  return luck.luuNienHienTai.band;
}

// ---------------------------------------------------------------------------------------------
// Verdict từ điểm + điều kiện.
function suyKetLuan(resolved: DungThanResolved, cham: ChamKetQua): Verdict {
  if (resolved.trangThai === "khong_hien") return "CHUA_DU_DU_LIEU";
  const d = cham.diem;
  if (d >= 72) return "NEN";
  if (d < 42) return "KHONG_NEN";
  // 42-71
  if (cham.timingBlocker) return "NEN_CHO";
  if (d >= 58) return "CO_DIEU_KIEN";
  return "NEN_CHO";
}

// ---------------------------------------------------------------------------------------------
// Văn xuôi DEMO (deterministic) — LLM sẽ viết lại giọng "quân sư đồng hành" khi có Phần E.
function topN(items: ScoreItem[], loai: "thuan" | "luu_y", n: number, padWith: string): string[] {
  const picked = items
    .filter((i) => i.loai === loai)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, n)
    .map((i) => i.reason);
  while (picked.length < n) picked.push(padWith);
  return picked;
}

function moTaXuHuong(verdict: Verdict, diem: number): string {
  switch (verdict) {
    case "NEN": return `Nhìn tổng thể, hướng này đang khá thuận (mức thuận ${diem}/100). Các dấu hiệu nghiêng về việc có thể tiến hành.`;
    case "CO_DIEU_KIEN": return `Hướng này làm được, nhưng chưa trọn vẹn (mức thuận ${diem}/100) — có vài điều kiện cần chuẩn bị trước khi bắt tay.`;
    case "NEN_CHO": return `Việc chưa đến độ chín (mức thuận ${diem}/100). Trở ngại chủ yếu mang tính thời điểm hơn là bản chất — nên chờ thêm một nhịp.`;
    case "KHONG_NEN": return `Các dấu hiệu đang nghịch (mức thuận ${diem}/100). Lúc này chưa phải thời điểm phù hợp để dấn tới.`;
    case "CHUA_DU_DU_LIEU": return `Quẻ chưa phản ánh rõ điều anh/chị hỏi. Có thể câu hỏi cần cụ thể hơn, hoặc nên gieo lại khi tâm đã thật tĩnh.`;
  }
}

function khuyen(verdict: Verdict, payload: QuanSuInterpretationPayload, luck: LuckContext | null): string[] {
  const acts: string[] = [];
  switch (verdict) {
    case "NEN":
      acts.push("Chuẩn bị kỹ phần việc trong tầm tay rồi tiến hành, đừng chần chừ quá lâu.");
      acts.push("Tận dụng đà thuận nhưng vẫn giữ phương án lui an toàn.");
      break;
    case "CO_DIEU_KIEN":
      acts.push("Liệt kê 1-2 điều kiện còn thiếu và giải quyết trước khi bắt đầu.");
      acts.push("Bắt đầu ở quy mô nhỏ, thử nghiệm rồi mới mở rộng.");
      break;
    case "NEN_CHO":
      acts.push("Chưa vội quyết — dùng thời gian này để chuẩn bị và thu thập thêm thông tin.");
      acts.push("Đặt một mốc xem lại (vài tuần đến một tháng) rồi cân nhắc lại.");
      break;
    case "KHONG_NEN":
      acts.push("Tạm dừng ý định hiện tại, tránh dồn nguồn lực vào lúc bất lợi.");
      acts.push("Nhìn lại mục tiêu — có thể có hướng khác an toàn hơn.");
      break;
    case "CHUA_DU_DU_LIEU":
      acts.push("Làm rõ lại điều mình thực sự muốn hỏi rồi gieo lại.");
      acts.push("Bổ sung thông tin (ngày giờ sinh, bối cảnh) để luận sát hơn.");
      break;
  }
  // Hành động thứ 3 theo an toàn / vận trình.
  if (payload.question.safety_level === "cao") {
    acts.push(payload.question.category === "suc-khoe" ? "Với sức khỏe, hãy tham vấn bác sĩ — đây chỉ là góc nhìn tham khảo." : "Với việc pháp lý, hãy tham vấn luật sư trước khi hành động.");
  } else if (luck && luck.dimensions.find((d) => d.key === "bien-dong")!.score >= 7) {
    acts.push("Giai đoạn này nhiều xáo trộn — giữ tâm bình tĩnh, tránh quyết định trong lúc nóng.");
  } else {
    acts.push("Giữ tâm bình tĩnh và quyết định dựa trên cả lý trí lẫn hoàn cảnh thực tế.");
  }
  return acts.slice(0, 3);
}

function vanTrinhTomTat(luck: LuckContext | null): VanTrinhTomTat | null {
  if (!luck) return null;
  const nhan = (d: "tot" | "binh_thuong" | "xau") => (d === "tot" ? "thuận" : d === "xau" ? "nghịch" : "bình thường");
  return {
    daiVan: `${luck.daiVanHienTai.can} ${luck.daiVanHienTai.chi} (${nhan(luck.daiVanHienTai.danhGia)})`,
    namHienTai: `${luck.luuNienHienTai.nam} ${luck.luuNienHienTai.can} ${luck.luuNienHienTai.chi} (${nhan(luck.luuNienHienTai.danhGia)})`,
    chiBao: luck.dimensions.map((d) => ({ label: d.label, score: d.score, higherIsBetter: d.higherIsBetter })),
  };
}

function luanChiTiet(resolved: DungThanResolved, cast: QuanSuInterpretationPayload["cast"]): string {
  const que = cast.bien ? `${cast.chinh.name} → biến ${cast.bien.name}` : cast.chinh.name;
  const dong = cast.dongPositions.length ? cast.dongPositions.join(", ") : "không có";
  const dt = resolved.lyDo;
  const bang = `${cast.canChiText}. Tuần Không: ${cast.tuanKhong}. Nguyệt Lệnh: ${cast.nguyetLenh}, Nhật Thần: ${cast.nhatThan}.`;
  return `Quẻ: ${que}. Hào động: ${dong}. ${dt} ${bang}\n(Đây là các dữ kiện engine đã tính. Luận giải sâu theo phép Kinh Dịch sẽ do Quân Sư đảm nhận khi hoàn thiện.)`;
}

// ---------------------------------------------------------------------------------------------
/**
 * Sinh BÁO CÁO CỐ VẤN từ payload. Điểm số + verdict deterministic; văn xuôi hiện là demo.
 */
export function buildAdvisoryReport(payload: QuanSuInterpretationPayload): AdvisoryReport {
  const luck = payload.van_trinh;
  const resolved = resolveDungThan(payload.cast.chinh, payload.question.dung_than_hint);
  const cham = chamDiem(resolved, payload.cast.chinh, luck);
  const ketLuan = suyKetLuan(resolved, cham);

  // Nếu chưa đủ dữ liệu, điểm để về ngưỡng thấp-trung tính (không khẳng định).
  const mucDoThuan = ketLuan === "CHUA_DU_DU_LIEU" ? Math.min(cham.diem, 45) : cham.diem;

  return {
    ketLuan,
    ketLuanLabel: VERDICT_LABEL[ketLuan],
    mucDoThuan,
    bangChamDiem: cham.items,
    xuHuong: moTaXuHuong(ketLuan, mucDoThuan),
    diemThuan: topN(cham.items, "thuan", 3, "Chưa có thêm dấu hiệu thuận nổi bật khác."),
    diemLuuY: topN(cham.items, "luu_y", 3, "Chưa có thêm điểm cần lưu ý nổi bật khác."),
    vanTrinh: vanTrinhTomTat(luck),
    quanSuKhuyen: khuyen(ketLuan, payload, luck),
    luanGiaiChiTiet: luanChiTiet(resolved, payload.cast),
    coNhap: true,
    proseLaDemo: true,
  };
}
