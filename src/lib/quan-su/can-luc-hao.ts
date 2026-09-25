// QUÂN SƯ THIÊN ANH — CÂN LỰC HÀO (HaoStrength).
//
// Module dùng CHUNG cho MỌI hào (Dụng/Nguyên/Kỵ/Thế/Ứng/Phi/Phục) — KHÔNG tạo riêng strength cho từng
// loại. Chỉ ĐỌC dữ kiện engine đã tính trên `FullCastResult` (Ngũ Hành, Vượng/Suy, Trường Sinh, quan hệ
// Nhật/Nguyệt, hào biến, Không Vong, Nhập Mộ, Ám Động...) rồi kết luận trạng thái Vượng/Suy theo
// methodology Thầy đã khóa ở Phase 10A/10B. TUYỆT ĐỐI KHÔNG scoring / trọng số / ngưỡng / +1-1 / 0-100.
//
// KIẾN TRÚC (không collapse thành 1 số): base force (7 case Nhật/Nguyệt) + các trục riêng
//   temporalExistence (Không Vong) · breakState (Nguyệt/Nhật/Tuế Phá) · burialState (Nhập Mộ)
//   transformationState (hóa biến) · yearState (Thái Tuế/Tuế Phá) · currentState (mô tả tổng hợp).
//
// ⚠️ CASE 6 — nguồn ghi "Hào sinh Tháng + Tháng khắc Hào": hai vế loại trừ nhau về ngũ hành (không thể
// đồng thời đúng). Cả 2 cách đọc đều cho kết luận TRUNG HÒA; chỉ cách đọc "Hào sinh Tháng (tiết khí)"
// mới khiến Case 6 KHÁC Case 4 (không trùng lặp). Vì vậy cài theo vế "Hào sinh Tháng". Kết luận KHÔNG
// tự chế (Trung Hòa là do Thầy khóa); chỉ giải quyết mâu thuẫn văn tự theo cách duy nhất không thoái hóa.
// → Cần Thầy xác nhận lại wording Case 6 (xem báo cáo Phase 10C).

import type { FullCastResult, HaoInfo } from "../luc-hao";
import { LUC_HOP_PAIRS, chiXungVoi, chiTaiGiaiDoanTruongSinh } from "../luc-hao";
import { CHI, type NguHanh } from "../menh-nap-am";
import { CHI_NGU_HANH } from "../bat-tu";
import type { TruongSinhStage } from "../bat-tu";
import { nguHanhTac } from "./advisory-engine";
import { tienThoaiCuaHao } from "../luc-hao-tien-thoai-than";

/** Lực nền — kết luận Vượng/Suy có ngữ cảnh, KHÔNG phải điểm số. */
export type BaseForce = "Rất Vượng" | "Vượng" | "Trung Hòa" | "Suy";

export interface HaoStrengthState {
  lineIndex: number; // 1-6
  nguHanh: NguHanh;
  isDong: boolean;

  /** Lực nền từ quan hệ Nhật/Nguyệt (7 case đã khóa) + tác động hào động. */
  baseForce: BaseForce;

  /** Trạng thái theo Năm — Thái Tuế KHÔNG = Vượng; Tuế Phá = suy rất mạnh (chỉ ghi nhận, không đổi baseForce). */
  yearState: { thaiTue: boolean; tuePha: boolean };

  /** FACT engine đã tính (đọc, không tính lại). */
  temporalState: {
    khongVong: boolean; // Tuần Không của Ngày → hiện hữu EMPTY (KHÔNG = lực 0)
    nguyetPha: boolean;
    nhatPha: boolean;
    tuePha: boolean;
  };

  /** Quan hệ với Nhật/Nguyệt + tác động hào động. */
  interactionState: {
    nhatSupport: "sinh" | "khac" | "hao" | "dong-hanh" | "none"; // Nhật ĐỐI VỚI hào
    nguyetSupport: "sinh" | "khac" | "hao" | "dong-hanh" | "none";
    tietLuc: boolean; // hào sinh/khắc Nhật hoặc Nguyệt (bị tiết)
    dongSinh: boolean; // có hào ĐỘNG khác đến sinh hào này
    dongKhac: boolean; // có hào ĐỘNG khác đến khắc hào này
    amDong: boolean; // hào Vượng + Nhật xung (engine đã derive)
  };

  /** Trạng thái vòng Trường Sinh so với Ngày/Tháng (chứa Mộ, Tuyệt...). */
  growthState: { nhat: TruongSinhStage; nguyet: TruongSinhStage };

  /** Nhập Mộ — phân biệt Mộ tĩnh (Nhật/Nguyệt Mộ) với Hóa Mộ (hào biến). */
  burialState: { nhapMo: boolean; hoaMo: boolean };

  /** Hóa biến (chỉ khi hào động + có biến). */
  transformationState: {
    hoaHop: boolean;
    hoiDauSinh: boolean;
    hoaTien: boolean;
    hoiDauKhac: boolean;
    hoaXung: boolean;
    hoaMo: boolean;
    hoaTuyet: boolean;
    hoaThoai: boolean;
  };

  /** Kết luận tổng hợp — mô tả định tính, KHÔNG phải số. base giữ nguyên; effective phản ánh hóa biến/tổn thương. */
  currentState: {
    base: BaseForce;
    effective: BaseForce; // sau khi tính Hóa Tiến/Thoái/Hồi Đầu Sinh (nâng/hạ) — Phá/Hồi Đầu Khắc/Không Vong KHÔNG hạ effective
    reduced: boolean; // có tổn thương (Phá / Hồi Đầu Khắc / Hóa Xung/Mộ/Tuyệt) — giảm lực nhưng GIỮ base
    restrained: boolean; // Hóa Hợp — bị níu chân
    hidden: boolean; // Nhập Mộ tĩnh — ẩn/tàng
    temporalExistence: "PRESENT" | "EMPTY"; // Không Vong
    reasons: string[];
  };

  provenance: string[];
}

// -------------------------------------------------------------------------------------------------
const CANH_SUPPORT = (rel: ReturnType<typeof nguHanhTac>): "sinh" | "khac" | "hao" | "dong-hanh" | "none" => {
  // rel = nguHanhTac(hàoNH, targetNH): a = hào, b = target(Nhật/Nguyệt).
  if (rel === "b-sinh-a") return "sinh"; // target sinh hào → được sinh
  if (rel === "b-khac-a") return "khac"; // target khắc hào → bị khắc
  if (rel === "a-sinh-b" || rel === "a-khac-b") return "hao"; // hào sinh/khắc target → bị tiết/hao
  if (rel === "ti-hoa") return "dong-hanh";
  return "none";
};

function hasRel(h: HaoInfo, type: string, source?: "DAY" | "MONTH" | "CHANGED_YAO" | "YAO"): boolean {
  return h.relations.some((r) => r.type === type && (source === undefined || r.source === source));
}

/** Có hào ĐỘNG khác (≠ chính nó) mà ngũ hành sinh/khắc hào này không. */
function taxDongTacDong(cast: FullCastResult, self: HaoInfo): { dongSinh: boolean; dongKhac: boolean } {
  let dongSinh = false;
  let dongKhac = false;
  for (const pos of cast.dongPositions) {
    if (pos === self.hao) continue;
    const d = cast.chinh.hao[pos - 1];
    if (!d) continue;
    const rel = nguHanhTac(d.nguHanh, self.nguHanh); // a = hào động, b = self
    if (rel === "a-sinh-b") dongSinh = true;
    if (rel === "a-khac-b") dongKhac = true;
  }
  return { dongSinh, dongKhac };
}

/**
 * Lực nền theo 7 case Nhật/Nguyệt Thầy đã khóa (Phase 10A/10B). Ngũ hành sinh/khắc + Nhị Hợp (Ngày);
 * Nguyệt Phá/Nhật Phá/Không Vong KHÔNG tính ở đây (là trục tổn thương riêng). Lâm Nhật/Nguyệt Kiến →
 * Vượng (rule đặc biệt, bỏ qua 7 case).
 */
function tinhBaseForce(
  self: HaoInfo,
  dayChiIndex: number,
  monthChiIndex: number,
  dong: { dongSinh: boolean; dongKhac: boolean },
  prov: string[],
): BaseForce {
  const lineChi = self.chiIndex;
  const lineNH = self.nguHanh;

  // Rule đặc biệt: Lâm Nhật Kiến / Lâm Nguyệt Kiến → Vượng.
  if (lineChi === dayChiIndex || lineChi === monthChiIndex) {
    prov.push("Lâm Nhật/Nguyệt Kiến (Chi hào trùng Chi Ngày hoặc Tháng) → Vượng (rule đặc biệt).");
    return "Vượng";
  }

  const dayNH = CHI_NGU_HANH[dayChiIndex];
  const monthNH = CHI_NGU_HANH[monthChiIndex];
  const dayRel = nguHanhTac(lineNH, dayNH); // a = hào, b = Ngày
  const monthRel = nguHanhTac(lineNH, monthNH);
  const dayNhiHop = LUC_HOP_PAIRS.some(([x, y]) => (x === lineChi && y === dayChiIndex) || (y === lineChi && x === dayChiIndex));

  const daySinh = dayRel === "b-sinh-a";
  const daySame = dayRel === "ti-hoa";
  const daySupport = daySinh || dayNhiHop || daySame; // Ngày sinh / Nhị Hợp / đồng hành
  const monthSinh = monthRel === "b-sinh-a";
  const monthKhac = monthRel === "b-khac-a";
  const lineSinhMonth = monthRel === "a-sinh-b"; // hào sinh Tháng (tiết)
  const lineKhacMonth = monthRel === "a-khac-b"; // hào khắc Tháng
  const dayKhac = dayRel === "b-khac-a";
  const lineDrainsDay = dayRel === "a-sinh-b" || dayRel === "a-khac-b"; // hào sinh/khắc Ngày

  // Case 2/1/3 — Ngày trợ + Tháng sinh.
  if (daySupport && monthSinh) {
    if (dayNhiHop) { prov.push("Case 2: Ngày Nhị Hợp hào + Tháng sinh hào → Rất Vượng."); return "Rất Vượng"; }
    prov.push(`Case ${daySinh ? 1 : 3}: Ngày ${daySinh ? "sinh" : "đồng hành"} hào + Tháng sinh hào → Vượng.`);
    return "Vượng";
  }
  // Case 7 — Ngày trợ + hào khắc Tháng.
  if (daySupport && lineKhacMonth) { prov.push("Case 7: Ngày trợ + hào khắc Tháng → vẫn Vượng."); return "Vượng"; }
  // Case 4 — Ngày trợ + Tháng khắc hào → Trung Hòa (có thể được hào động nâng).
  if (daySupport && monthKhac) {
    prov.push("Case 4: Ngày trợ + Tháng khắc hào → Trung Hòa.");
    return napHaoDong("Trung Hòa", dong, prov);
  }
  // Case 6 — Ngày trợ + hào sinh Tháng (tiết) → Trung Hòa (đọc theo vế 'Hào sinh Tháng', xem chú thích đầu file).
  if (daySupport && lineSinhMonth) {
    prov.push("Case 6: Ngày trợ + hào sinh Tháng (tiết khí) → Trung Hòa.");
    return napHaoDong("Trung Hòa", dong, prov);
  }
  // Case 5 — hào bị tiết (sinh/khắc Nhật/Nguyệt) HOẶC Nhật/Nguyệt khắc hào.
  if (dayKhac || monthKhac) { prov.push("Nhật/Nguyệt khắc hào → Suy (Case 5 nhánh khắc trực tiếp)."); return "Suy"; }
  if (lineDrainsDay || lineSinhMonth || lineKhacMonth) {
    prov.push("Case 5: hào bị tiết (sinh/khắc Nhật/Nguyệt) → xét hào động.");
    return napHaoDong("Trung Hòa", dong, prov);
  }
  // Ngoài 7 case đã khóa — mặc định Trung Hòa (không tự chế Vượng/Suy), vẫn cho hào động điều chỉnh.
  prov.push("Ngoài 7 case đã khóa (quan hệ Nhật/Nguyệt trung tính) → tạm Trung Hòa.");
  return napHaoDong("Trung Hòa", dong, prov);
}

/** Điều chỉnh Trung Hòa theo hào động (§IV): động sinh → Vượng; động khắc → Suy; không quyết → giữ. */
function napHaoDong(base: BaseForce, dong: { dongSinh: boolean; dongKhac: boolean }, prov: string[]): BaseForce {
  if (base !== "Trung Hòa") return base;
  if (dong.dongSinh && !dong.dongKhac) { prov.push("Có hào động đến sinh → nâng lên Vượng."); return "Vượng"; }
  if (dong.dongKhac && !dong.dongSinh) { prov.push("Có hào động đến khắc → hạ xuống Suy."); return "Suy"; }
  return base;
}

/** Nâng/hạ effective theo hóa biến (§VII): Tiến → Rất Vượng; Hồi Đầu Sinh → ≥Vượng; Thoái → Suy. */
const RANK: Record<BaseForce, number> = { "Suy": 0, "Trung Hòa": 1, "Vượng": 2, "Rất Vượng": 3 };
function capBac(a: BaseForce, atLeast: BaseForce): BaseForce {
  return RANK[a] >= RANK[atLeast] ? a : atLeast;
}

/**
 * CÂN LỰC HÀO — trạng thái lực của 1 hào (1-6) trên quẻ chính. Pure/deterministic, không LLM, không số.
 */
export function canLucHao(cast: FullCastResult, lineIndex: number): HaoStrengthState {
  const self = cast.chinh.hao[lineIndex - 1];
  if (!self) throw new Error(`canLucHao: hào ${lineIndex} không tồn tại`);
  const prov: string[] = [];

  const dayChiIndex = CHI.indexOf(cast.dayChi);
  const monthChiIndex = CHI.indexOf(cast.monthChi);
  const yearChiIndex = CHI.indexOf(cast.yearChi);
  const dong = taxDongTacDong(cast, self);

  const baseForce = tinhBaseForce(self, dayChiIndex, monthChiIndex, dong, prov);

  // Trục Năm — Thái Tuế (Chi hào trùng Chi Năm) / Tuế Phá (Chi Năm xung Chi hào). Không đổi baseForce.
  const thaiTue = self.chiIndex === yearChiIndex;
  const tuePha = self.chiIndex === chiXungVoi(yearChiIndex);
  if (thaiTue) prov.push("Thái Tuế: Chi hào trùng Chi Năm — sự việc nhập năm (KHÔNG đồng nghĩa Vượng).");
  if (tuePha) prov.push("Tuế Phá: Chi Năm xung Chi hào — suy rất mạnh (trục tổn thương, giữ base).");

  const nguyetPha = hasRel(self, "Nguyệt Phá");
  const nhatPha = hasRel(self, "Nhật Phá");
  const amDong = hasRel(self, "Ám Động");
  const khongVong = self.xunKong;

  // Nhập Mộ — phân biệt Mộ tĩnh (DAY/MONTH) với Hóa Mộ (CHANGED_YAO).
  const hoaMo = hasRel(self, "Nhập Mộ", "CHANGED_YAO");
  const nhapMoTinh = hasRel(self, "Nhập Mộ", "DAY") || hasRel(self, "Nhập Mộ", "MONTH");

  // Hóa biến (chỉ khi hào động + có biến).
  const hb = self.isDong ? cast.bien?.hao[lineIndex - 1] ?? null : null;
  const tt = self.isDong ? tienThoaiCuaHao(cast, lineIndex) : null;
  let hoaHop = false, hoiDauSinh = false, hoiDauKhac = false, hoaXung = false, hoaTuyet = false;
  const hoaTien = tt?.loai === "tien-than";
  const hoaThoai = tt?.loai === "thoai-than";
  if (hb) {
    hoaHop = LUC_HOP_PAIRS.some(([x, y]) => (x === self.chiIndex && y === hb.chiIndex) || (y === self.chiIndex && x === hb.chiIndex));
    hoaXung = hb.chiIndex === chiXungVoi(self.chiIndex);
    const rel = nguHanhTac(hb.nguHanh, self.nguHanh); // a = biến, b = gốc
    hoiDauSinh = rel === "a-sinh-b";
    hoiDauKhac = rel === "a-khac-b";
    hoaTuyet = hb.chiIndex === chiTaiGiaiDoanTruongSinh(self.nguHanh, "Tuyệt");
  }

  // currentState — base giữ nguyên; effective nâng/hạ theo hóa biến; Phá/Hồi Đầu Khắc/Không Vong = giảm/EMPTY (giữ base).
  let effective = baseForce;
  const reasons: string[] = [];
  if (hoaTien) { effective = capBac(effective, "Rất Vượng"); reasons.push("Hóa Tiến Thần → rất Vượng."); }
  if (hoiDauSinh) { effective = capBac(effective, "Vượng"); reasons.push("Hồi Đầu Sinh → tăng lực."); }
  if (hoaThoai) { effective = "Suy"; reasons.push("Hóa Thoái Thần → hào động mất lực → Suy."); }

  const reduced = nguyetPha || nhatPha || tuePha || hoiDauKhac || hoaXung || hoaMo || hoaTuyet;
  if (nguyetPha) reasons.push("Nguyệt Phá → giảm lực (KHÔNG xóa nền lực).");
  if (nhatPha) reasons.push("Nhật Phá → giảm lực.");
  if (tuePha) reasons.push("Tuế Phá → giảm lực mạnh.");
  if (hoiDauKhac) reasons.push("Hồi Đầu Khắc → giảm lực nhưng GIỮ nền lực.");
  if (hoaXung) reasons.push("Hóa Xung → hào biến mất lực.");
  if (hoaMo) reasons.push("Hóa Mộ → hào biến mất lực (khác Nhập Mộ tĩnh).");
  if (hoaTuyet) reasons.push("Hóa Tuyệt → giảm lực (giữ nền nếu nền rất mạnh).");
  const restrained = hoaHop;
  if (hoaHop) reasons.push("Hóa Hợp → còn lực nhưng bị níu chân, giảm tương tác.");
  const hidden = nhapMoTinh;
  if (nhapMoTinh) reasons.push("Nhập Mộ (tĩnh) → ẩn/tàng, chưa phát huy (chờ Xung Mộ).");
  if (khongVong) reasons.push("Không Vong → hiện hữu EMPTY, lực nền giữ nguyên (chờ Xuất Không/Ứng Kỳ).");

  const dayRel = nguHanhTac(self.nguHanh, CHI_NGU_HANH[dayChiIndex]);
  const monthRel = nguHanhTac(self.nguHanh, CHI_NGU_HANH[monthChiIndex]);

  return {
    lineIndex,
    nguHanh: self.nguHanh,
    isDong: self.isDong,
    baseForce,
    yearState: { thaiTue, tuePha },
    temporalState: { khongVong, nguyetPha, nhatPha, tuePha },
    interactionState: {
      nhatSupport: CANH_SUPPORT(dayRel),
      nguyetSupport: CANH_SUPPORT(monthRel),
      tietLuc: dayRel === "a-sinh-b" || dayRel === "a-khac-b" || monthRel === "a-sinh-b" || monthRel === "a-khac-b",
      dongSinh: dong.dongSinh,
      dongKhac: dong.dongKhac,
      amDong,
    },
    growthState: { nhat: self.growthDay, nguyet: self.growthMonth },
    burialState: { nhapMo: nhapMoTinh, hoaMo },
    transformationState: { hoaHop, hoiDauSinh, hoaTien, hoiDauKhac, hoaXung, hoaMo, hoaTuyet, hoaThoai },
    currentState: {
      base: baseForce,
      effective,
      reduced,
      restrained,
      hidden,
      temporalExistence: khongVong ? "EMPTY" : "PRESENT",
      reasons,
    },
    provenance: prov,
  };
}
