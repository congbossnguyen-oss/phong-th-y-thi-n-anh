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
import type { NguHanh } from "../menh-nap-am";

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

/**
 * Lời khuyên BÁM THEO TÍN HIỆU QUẺ cụ thể (khác nhau giữa các quẻ, không phải template chung theo
 * verdict) — trả 0-1 câu ưu tiên đặt đầu để tránh mọi câu hỏi cùng verdict ra lời khuyên y hệt.
 */
function khuyenTheoTinHieu(resolved: DungThanResolved, cast: QuanSuInterpretationPayload["cast"]): string | null {
  const dt = resolved.hao;
  if (resolved.trangThai === "phuc_tang") return "Điều anh/chị hỏi đang ẩn chưa lộ (Dụng Thần phục tàng) — chưa nên thúc ép, chờ khi việc rõ đầu mối hãy quyết.";
  if (!dt || resolved.trangThai !== "hien") return null;
  if (dt.xunKong) return "Dụng Thần đang Tuần Không (như việc còn trống, chưa tới lúc) — đừng vội, chờ qua ngày/tháng xung Không thì hãy động.";
  if (dt.relations.some((r) => r.type === "Nguyệt Phá")) return "Dụng Thần bị Nguyệt Phá — cả tháng này bất lợi, nên lùi sang tháng khác (tháng xung lại chỗ phá) rồi tính.";
  if (dt.relations.some((r) => r.type === "Khắc")) return "Dụng Thần đang bị Nhật/Nguyệt khắc chế — cần hóa giải nguồn khắc hoặc tìm thế được sinh phò trước khi tiến.";
  if (dt.vuongSuy === "Tù" || dt.vuongSuy === "Tử") return "Dụng Thần suy nhược (mùa không phò) — nên chờ tới mùa Dụng Thần vượng, hoặc mượn nguyên thần sinh phò rồi hãy làm.";
  // Hào động là kỵ thần khắc Dụng Thần?
  for (const pos of cast.dongPositions) {
    const hg = cast.chinh.hao[pos - 1];
    if (hg.hao !== dt.hao && nguHanhTac(hg.nguHanh, dt.nguHanh) === "a-khac-b") {
      return `Có hào động (${hg.lucThan}) đang khắc Dụng Thần — đề phòng đúng nguồn đó gây trở ngại; xử lý gốc này thì việc mới thông.`;
    }
    // Dụng Thần động hóa thoái / hồi đầu khắc.
    if (hg.hao === dt.hao && cast.bien) {
      const hb = cast.bien.hao[pos - 1];
      if (nguHanhTac(hb.nguHanh, hg.nguHanh) === "a-khac-b") return "Dụng Thần động biến hồi đầu khắc (việc dễ quay lại hại mình) — cân nhắc rất kỹ, tránh dấn sâu.";
    }
  }
  if (dt.vuongSuy === "Vượng" && dt.relations.some((r) => r.type === "Sinh" || r.type === "Lâm Nhật" || r.type === "Lâm Nguyệt"))
    return "Dụng Thần vượng lại được Nhật/Nguyệt phò — thế đang lên, chuẩn bị đủ là tiến được, đừng bỏ lỡ nhịp thuận.";
  return null;
}

function khuyen(verdict: Verdict, payload: QuanSuInterpretationPayload, luck: LuckContext | null, resolved: DungThanResolved, _cham: ChamKetQua): string[] {
  const acts: string[] = [];
  const theoTin = khuyenTheoTinHieu(resolved, payload.cast);
  if (theoTin) acts.push(theoTin); // lời khuyên riêng theo quẻ, đặt đầu
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
  // Hành động cuối theo an toàn / vận trình. Với việc an toàn cao (sức khỏe/pháp lý) BẮT BUỘC giữ
  // lại — nên chèn thẳng vào vị trí cuối của 3 câu, không để bị slice mất khi đã có lời khuyên riêng.
  if (payload.question.safety_level === "cao") {
    const canhBao = payload.question.category === "suc-khoe" ? "Với sức khỏe, hãy tham vấn bác sĩ — đây chỉ là góc nhìn tham khảo." : "Với việc pháp lý, hãy tham vấn luật sư trước khi hành động.";
    const ba = acts.slice(0, 2);
    ba.push(canhBao);
    return ba;
  }
  if (luck && luck.dimensions.find((d) => d.key === "bien-dong")!.score >= 7) {
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

// ---------------------------------------------------------------------------------------------
// LUẬN SÂU (rule-based, deterministic) — narrate CÁC TÍN HIỆU engine đã tính thành lời luận Lục Hào
// đúng phép, KHÔNG tự tính thêm thuật toán. Bao: Dụng Thần vượng suy so Nhật/Nguyệt, lưỡng hiện,
// từng hào động (quan hệ với Dụng Thần + Lục Thú + hóa biến hồi đầu/tiến-thoái/hóa Không/nhập Mộ),
// Tam Hợp cục, Ứng Kỳ. Dùng ngôn ngữ xác suất, không phán tuyệt đối.
const VUONG_SUY_Y: Record<VerdictVuong, string> = {
  "Vượng": "đang vượng, có khí lực — chủ về mạnh, dễ thành",
  "Tướng": "được tướng khí (mùa sinh cho), khá có lực",
  "Hưu": "hưu khí (đã qua thời) — sức đã kém",
  "Tù": "bị tù hãm — suy nhược",
  "Tử": "tử khí — rất yếu, phải được sinh phò mới đứng được",
};
type VerdictVuong = "Vượng" | "Tướng" | "Hưu" | "Tù" | "Tử";

const LUC_THU_Y: Record<string, string> = {
  "Thanh Long": "chủ hỉ sự, tài lộc, việc chính đáng hanh thông",
  "Chu Tước": "chủ văn thư, tin tức, giấy tờ — nhưng cũng dễ khẩu thiệt, tranh cãi",
  "Câu Trần": "chủ ruộng đất, nhà cửa — việc trì trệ, chậm, dây dưa",
  "Đằng Xà": "chủ chuyện bất ngờ, quái dị, lo âu vướng bận, mộng mị",
  "Bạch Hổ": "chủ tật bệnh, tang thương, thị phi — nhưng động vào việc quân/pháp/mạnh bạo lại thành uy lực",
  "Huyền Vũ": "chủ ám muội, hao ngầm, trộm cắp, tình cảm riêng tư mờ ám",
};

/** Quan hệ ngũ hành của a ĐỐI VỚI b: a sinh b / a khắc b / b sinh a / b khắc a / cùng hành. */
function nguHanhTac(a: NguHanh, b: NguHanh): "a-sinh-b" | "a-khac-b" | "b-sinh-a" | "b-khac-a" | "ti-hoa" {
  if (a === b) return "ti-hoa";
  if (SINH[a] === b) return "a-sinh-b";
  if (KHAC[a] === b) return "a-khac-b";
  if (SINH[b] === a) return "b-sinh-a";
  if (KHAC[b] === a) return "b-khac-a";
  return "ti-hoa";
}

/**
 * Luận 1 hào ĐỘNG so với Dụng Thần + Lục Thú + hóa biến. `dtNguHanh`/`dtHaoNum` CHỈ truyền khi Dụng
 * Thần HIỆN RÕ trên quẻ (phục tàng thì để null — không so ngũ hành với hào chủ, tránh sai vì hào
 * chủ khác ngũ hành với phục thần).
 */
function luanMotHaoDong(
  pos: number,
  cast: QuanSuInterpretationPayload["cast"],
  dtNguHanh: NguHanh | null,
  dtHaoNum: number | null,
  tienThoai: QuanSuInterpretationPayload["tien_thoai_than"],
): string {
  const hg = cast.chinh.hao[pos - 1];
  const hb = cast.bien?.hao[pos - 1] ?? null;
  const parts: string[] = [`Hào ${pos} (${hg.lucThan}, ${hg.lucThu}) động`];

  // Quan hệ với Dụng Thần — chỉ luận khi Dụng Thần hiện rõ (dtNguHanh != null).
  if (dtHaoNum !== null && hg.hao === dtHaoNum) {
    parts.push("CHÍNH LÀ Dụng Thần động — biến hóa của nó quyết định trực tiếp việc hỏi");
  } else if (dtNguHanh) {
    const qh = nguHanhTac(hg.nguHanh, dtNguHanh);
    if (qh === "a-sinh-b") parts.push("là nguyên thần đến sinh phò Dụng Thần (lực trợ, tốt)");
    else if (qh === "a-khac-b") parts.push("là kỵ thần khắc Dụng Thần (bất lợi, cần đề phòng)");
    else if (qh === "ti-hoa") parts.push("cùng hành với Dụng Thần (trợ thế, nhưng nếu là Huynh Đệ thì kèm cạnh tranh/hao)");
    else if (qh === "b-sinh-a") parts.push("hút khí Dụng Thần (Dụng Thần sinh nó → bị tiết hao lực)");
    else if (qh === "b-khac-a") parts.push("bị Dụng Thần khắc (Dụng Thần chế được nó)");
  }

  // Lục Thú của hào động.
  const ltY = LUC_THU_Y[hg.lucThu];
  if (ltY) parts.push(`Lục Thú ${hg.lucThu} ${ltY}`);

  // Hóa biến (hồi đầu sinh/khắc, tiến/thoái, hóa Không, nhập Mộ).
  if (hb) {
    const hoi = nguHanhTac(hb.nguHanh, hg.nguHanh); // biến hào TÁC ĐỘNG lên hào gốc
    if (hoi === "a-khac-b") parts.push("biến ra hào HỒI ĐẦU KHẮC (việc quay lại hại chính mình — xấu)");
    else if (hoi === "a-sinh-b") parts.push("biến ra hào HỒI ĐẦU SINH (được nuôi dưỡng, hậu vận tốt)");
    const tt = tienThoai.danhSach.find((d) => d.viTriHao === pos);
    if (tt) parts.push(tt.loai === "tien-than" ? "hóa TIẾN THẦN (đà việc tiến tới, tăng dần)" : "hóa THOÁI THẦN (đà việc thoái lui, giảm dần)");
    if (hb.xunKong) parts.push("hào biến rơi Tuần Không (hóa Không — chuyển biến chưa thành, còn treo)");
    if (hg.relations.some((r) => r.type === "Nhập Mộ" && r.source === "CHANGED_YAO")) parts.push("động biến NHẬP MỘ (việc bị vùi, khó phát lộ — cần chờ xung Mộ)");
  }
  return parts.join("; ") + ".";
}

function luanChiTiet(payload: QuanSuInterpretationPayload, resolved: DungThanResolved): string {
  const cast = payload.cast;
  const dt = resolved.hao;
  const secs: string[] = [];

  // 1) Quẻ + Can Chi thời điểm.
  const que = cast.bien ? `${cast.chinh.name} → biến ${cast.bien.name}` : cast.chinh.name;
  secs.push(`▪ Quẻ: ${que}. ${cast.canChiText}. Nguyệt Lệnh ${cast.nguyetLenh}, Nhật Thần ${cast.nhatThan}, Tuần Không ${cast.tuanKhong}.`);

  // 2) Dụng Thần: trạng thái + vượng suy + quan hệ Nhật/Nguyệt + lưỡng hiện.
  const dtLines: string[] = [`▪ Dụng Thần: ${resolved.lyDo}`];
  if (dt && resolved.trangThai === "hien") {
    dtLines.push(`  – Vượng suy: Dụng Thần ${VUONG_SUY_Y[dt.vuongSuy as VerdictVuong] ?? dt.vuongSuy} (xét theo Nguyệt Lệnh).`);
    const qhNhatNguyet: string[] = [];
    for (const r of dt.relations) {
      if (r.type === "Sinh") qhNhatNguyet.push(`được ${r.source === "DAY" ? "Nhật Thần" : "Nguyệt Kiến"} sinh phò`);
      else if (r.type === "Khắc") qhNhatNguyet.push(`bị ${r.source === "DAY" ? "Nhật Thần" : "Nguyệt Kiến"} khắc chế`);
      else if (r.type === "Lâm Nhật") qhNhatNguyet.push("lâm Nhật Thần (đắc thế ngày)");
      else if (r.type === "Lâm Nguyệt") qhNhatNguyet.push("lâm Nguyệt Kiến (đắc lệnh tháng)");
      else if (r.type === "Nguyệt Phá") qhNhatNguyet.push("bị Nguyệt Phá (phá cả tháng, chờ qua tháng xung mới cứu)");
      else if (r.type === "Nhật Phá") qhNhatNguyet.push("bị Nhật Phá (suy, khó đứng vững)");
      else if (r.type === "Ám Động") qhNhatNguyet.push("ám động (có lực ngầm)");
    }
    if (dt.xunKong) qhNhatNguyet.push("rơi Tuần Không (chưa tới lúc, còn trống — chờ ngày xung Không / xuất Không)");
    if (qhNhatNguyet.length) dtLines.push(`  – So với Nhật/Nguyệt: Dụng Thần ${qhNhatNguyet.join(", ")}.`);
    // Lưỡng hiện.
    if (payload.question.dung_than_hint.kind === "luc-than") {
      const target = payload.question.dung_than_hint.value;
      const soLan = cast.chinh.hao.filter((h) => h.lucThan === target).length;
      if (soLan > 1) {
        dtLines.push(`  – LƯỠNG HIỆN: ${target} xuất hiện ${soLan} lần trên quẻ. Nguyên tắc chọn: ưu tiên hào ĐANG ĐỘNG (hào "lên tiếng"); nếu đều tĩnh thì lấy hào không rơi Không Vong / không bị Phá; nếu 1 hào Không 1 hào thực thì lấy hào thực. Hai hào cùng hiện thường ứng "có hai đầu mối / hai lựa chọn" cho việc hỏi — cần soi bối cảnh để chốt đúng hào.`);
      }
    }
  } else if (resolved.trangThai === "phuc_tang") {
    dtLines.push("  – Dụng Thần PHỤC TÀNG (ẩn dưới hào khác): điều hỏi chưa lộ, thường là chưa tới lúc — chờ ngày Dụng Thần được dẫn ra (trùng/xung hào phi phục, hoặc gặp Trường Sinh).");
  }
  secs.push(dtLines.join("\n"));

  // 3) Hào động.
  if (cast.dongPositions.length === 0) {
    secs.push("▪ Quẻ TĨNH (không hào động): việc ít biến động, phần lớn giữ nguyên hiện trạng — luận chủ yếu theo vượng suy Dụng Thần và thế cục Thế/Ứng ở trên. Ứng nghiệm thường chờ tới ngày/tháng xung hoặc trùng Dụng Thần.");
  } else {
    // Chỉ so ngũ hành hào động ↔ Dụng Thần khi Dụng Thần HIỆN rõ (phục tàng: hào chủ khác ngũ hành).
    const dtNguHanh = resolved.trangThai === "hien" ? dt?.nguHanh ?? null : null;
    const dtHaoNum = resolved.trangThai === "hien" ? dt?.hao ?? null : null;
    const dongLines = cast.dongPositions.map((pos) => "  – " + luanMotHaoDong(pos, cast, dtNguHanh, dtHaoNum, payload.tien_thoai_than));
    secs.push("▪ Hào động (phần chủ động, quyết định của quẻ):\n" + dongLines.join("\n"));
  }

  // 4) Tam Hợp cục.
  if (payload.tam_hop_cuc.co && payload.tam_hop_cuc.danhSach.length) {
    const th = payload.tam_hop_cuc.danhSach.map((c) => c.moTa ?? "").filter(Boolean);
    if (th.length) secs.push("▪ Tam Hợp cục: " + th.join(" "));
  }

  // 5) Ứng Kỳ (mốc thời gian) — lấy ứng viên ưu tiên cao nhất.
  if (payload.ung_ky && payload.ung_ky.hopLe && payload.ung_ky.ungVien.length) {
    const uv = payload.ung_ky.ungVien[0];
    secs.push(`▪ Ứng kỳ (thời điểm ứng nghiệm gợi ý): quanh ${uv.chi} (theo ${payload.ung_ky.donViGoiY}) — ${uv.lyDo}`);
  }

  secs.push("(Luận theo phép Lục Hào từ số liệu quẻ; kết quả mang tính tham khảo, ứng nghiệm còn tùy thời điểm và người trong cuộc.)");
  return secs.join("\n\n");
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
    quanSuKhuyen: khuyen(ketLuan, payload, luck, resolved, cham),
    luanGiaiChiTiet: luanChiTiet(payload, resolved),
    coNhap: true,
    proseLaDemo: true,
  };
}
