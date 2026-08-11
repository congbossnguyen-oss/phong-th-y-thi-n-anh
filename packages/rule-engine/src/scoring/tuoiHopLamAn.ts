/**
 * TUỔI HỢP LÀM ĂN — đánh giá mức độ hợp nhau của 2 người khi hợp tác làm ăn/kinh doanh/đầu tư
 * (mã nội bộ `TUOI_HOP_LAM_AN`), chỉ từ năm sinh dương lịch của mỗi người. Hệ thống tự suy ra
 * Thiên Can, Địa Chi, Ngũ Hành bản mệnh (từ Nạp Âm) và Nạp Âm của từng năm — người dùng không
 * cần tự biết hay tự nhập Can/Chi/Ngũ Hành, không cần nhập giới tính.
 *
 * Toàn bộ trọng số nằm trong `TUOI_HOP_LAM_AN_SCORING_RULES` — tách riêng khỏi hàm tính điểm
 * để có thể điều chỉnh sau này mà không phải sửa thuật toán hay giao diện.
 *
 * ⚠️ Toàn bộ trọng số cộng/trừ điểm ở đây là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA cho đúng mục đích
 * "hợp tác làm ăn" — KHÔNG trích dẫn từ 1 trang sách cụ thể nào (khác với các module
 * `trach-nhat/*` vốn trích nguyên văn 1 nguồn xác định). Riêng các bảng quan hệ Can/Chi/Ngũ
 * Hành nền tảng (Ngũ Hợp Can, Lục Hợp/Tam Hợp/Tam Hình/Lục Hại/Lục Phá/Lục Xung Chi, Ngũ Hành
 * tương sinh/tương khắc) là kiến thức cố định không có dị bản — xem các file tương ứng trong
 * `trach-nhat/`.
 *
 * Nạp Âm (mục D, trọng số 10%): hệ thống hiện chỉ có TÊN + HÀNH của 30 Nạp Âm (đủ để suy ra
 * "Mệnh" ở mục C), CHƯA có bảng đối chiếu tương sinh/tương khắc riêng theo TỪNG CẶP TÊN Nạp Âm
 * cụ thể (vd. các ngoại lệ cổ điển kiểu "Kiếm Phong Kim không sợ Lư Trung Hỏa"). Theo đúng yêu
 * cầu của chủ dự án ("nếu chưa có dữ liệu thì bỏ qua, không tự đoán"), mục này giữ điểm trung
 * tính (không cộng/không trừ) — tránh trùng lặp với mục C (vốn đã dùng chính Ngũ Hành của Nạp
 * Âm làm "Mệnh"). Khi có nguồn dữ liệu bảng đối chiếu xác định, chỉ cần sửa
 * `calculateNapAmCompatibility`.
 */
import { getGanzhiYear, Data } from "@thien-anh/calendar-core";
import { isCanHop } from "../trach-nhat/canHop.js";
import { isTamHop } from "../trach-nhat/tamHop.js";
import { isLucHop } from "../trach-nhat/lucHop.js";
import { getLucXungChi } from "../trach-nhat/lucXung.js";
import { getHinhThaiTueChi, getHaiThaiTueChi, getPhaThaiTueChi, TU_HINH } from "../trach-nhat/thaiTue.js";
import { getNguHanhQuanHe } from "../trach-nhat/nguHanhQuanHe.js";

type Can = Data.Can;
type Chi = Data.Chi;
type NguHanh = Data.NguHanh;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

export const TUOI_HOP_LAM_AN_SCORING_RULES = {
  /** Trọng số từng nhóm tiêu chí — tổng = 1 (100%), khớp đặc tả mục 3. */
  trongSo: {
    can: 0.2,
    chi: 0.25,
    menh: 0.3,
    napAm: 0.1,
    tongHop: 0.15,
  },

  /** Điểm khởi điểm trung tính trên thang 0-10 cho mỗi nhóm tiêu chí, trước khi cộng/trừ. */
  diemNenTang: 5,

  can: {
    hopDiem: 3,
    sinhDiem: 1.5,
    binhHoaDiem: 0,
    /** Khắc "dị tính" (1 Can dương + 1 Can âm) — theo quy ước cổ điển nhẹ hơn khắc đồng tính. */
    khacDiem: -2,
    /** Khắc "đồng tính" (2 Can cùng dương hoặc cùng âm) — theo quy ước cổ điển khắc nặng hơn. */
    khacManhDiem: -3.5,
  },

  chi: {
    tamHopDiem: 3.5,
    lucHopDiem: 3,
    binhHoaDiem: 0,
    /** Hình/Hại/Phá — gộp chung 1 mức trừ (đặc tả nhóm 3 quan hệ này cùng 1 bậc). */
    hinhHaiPhaDiem: -1.5,
    /** Xung — trừ mạnh nhất, kể cả khi 1 cặp Chi vừa Xung vừa Hình (Xung luôn lấn át). */
    xungDiem: -3.5,
  },

  menh: {
    sinhDiem: 3,
    tuongHoaDiem: 1.5,
    khacDiem: -3,
  },

  napAm: {
    /** Chưa có dữ liệu bảng đối chiếu riêng theo tên Nạp Âm — luôn giữ điểm nền tảng (0 lệch). */
    diemLech: 0,
  },

  tongHop: {
    /** Ngưỡng Can/Chi/Mệnh coi là "tốt" để cộng thêm điểm khi CẢ 3 cùng đạt. */
    nguongTot: 7,
    congKhiCaBaTot: 1,
    /** Ngưỡng Can/Chi/Mệnh coi là "rất xấu" — chỉ cần 1 trong 3 chạm ngưỡng là trừ thêm. */
    nguongRatXau: 2,
    truKhiCoMotYeuToRatXau: 1,
  },
} as const;

export interface NguoiTuoi {
  namSinh: number;
  can: Can;
  chi: Chi;
  /** Ngũ Hành bản mệnh — suy từ Nạp Âm của năm sinh. */
  nguHanhMenh: NguHanh;
  napAm: { name: string; element: NguHanh };
}

export interface TuoiHopLamAnTieuChi {
  /** Điểm 0-10 của riêng nhóm tiêu chí này. */
  diem: number;
  /** Mô tả ngắn quan hệ đã xác định, vd "Tam hợp", "Khắc mạnh (đồng tính)". */
  moTa: string;
}

export type TuoiHopLamAnHang = "rat-hop" | "hop" | "binh-hoa" | "khong-thuan" | "khong-nen";

export interface TuoiHopLamAnResult {
  /** Điểm tổng 0-10, đã làm tròn 1 chữ số thập phân. */
  diem: number;
  hang: TuoiHopLamAnHang;
  /** Nhãn hiển thị kèm icon, vd "⭐ Rất hợp làm ăn". */
  nhan: string;
  can: TuoiHopLamAnTieuChi;
  chi: TuoiHopLamAnTieuChi;
  menh: TuoiHopLamAnTieuChi;
  napAm: TuoiHopLamAnTieuChi;
  tongHop: TuoiHopLamAnTieuChi;
  ketLuan: string;
}

const NHAN_THEO_HANG: Record<TuoiHopLamAnHang, string> = {
  "rat-hop": "⭐ Rất hợp làm ăn",
  "hop": "🟢 Hợp làm ăn",
  "binh-hoa": "🟡 Bình hòa / Có thể hợp tác",
  "khong-thuan": "🟠 Không thuận",
  "khong-nen": "🔴 Không nên hợp tác",
};

const KET_LUAN_THEO_HANG: Record<TuoiHopLamAnHang, string> = {
  "rat-hop": "Rất hợp",
  "hop": "Hợp",
  "binh-hoa": "Bình hòa",
  "khong-thuan": "Không thuận",
  "khong-nen": "Không nên ưu tiên",
};

function clamp10(diem: number): number {
  return Math.max(0, Math.min(10, diem));
}

function nguHanhCuaCan(can: Can): NguHanh {
  return Data.CAN_NGU_HANH[Data.CAN.indexOf(can)]!;
}

function amDuongCuaCan(can: Can): "Dương" | "Âm" {
  return Data.CAN_AM_DUONG[Data.CAN.indexOf(can)]!;
}

/** Địa Chi thuộc nhóm "tự hình" (Thìn/Ngọ/Dậu/Hợi) khi so với chính nó. */
function isHinh(chiA: Chi, chiB: Chi): boolean {
  if (chiA === chiB) return (TU_HINH as readonly Chi[]).includes(chiA);
  return getHinhThaiTueChi(chiA).includes(chiB);
}

function isHai(chiA: Chi, chiB: Chi): boolean {
  if (chiA === chiB) return false;
  return getHaiThaiTueChi(chiA) === chiB;
}

function isPha(chiA: Chi, chiB: Chi): boolean {
  if (chiA === chiB) return false;
  return getPhaThaiTueChi(chiA) === chiB;
}

function isXung(chiA: Chi, chiB: Chi): boolean {
  if (chiA === chiB) return false;
  return getLucXungChi(chiA) === chiB;
}

/** Suy Can/Chi/Nạp Âm của 1 năm sinh dương lịch (quy ước "năm con giáp" đại chúng, ranh giới 1/1 — không dùng Lập Xuân vì người dùng chỉ nhập năm, không nhập ngày sinh chính xác). */
function tinhCanChiNapAmNamSinh(namSinh: number): { can: Can; chi: Chi; napAm: { name: string; element: NguHanh } } {
  const pillar = getGanzhiYear(
    { year: namSinh, month: 1, day: 1, hour: 12, timeZone: DEFAULT_TIME_ZONE },
    { yearBoundary: "calendar" },
  );
  return { can: pillar.can, chi: pillar.chi, napAm: pillar.napAm };
}

export function getCan(namSinh: number): Can {
  return tinhCanChiNapAmNamSinh(namSinh).can;
}

export function getChi(namSinh: number): Chi {
  return tinhCanChiNapAmNamSinh(namSinh).chi;
}

export function getNapAm(namSinh: number): { name: string; element: NguHanh } {
  return tinhCanChiNapAmNamSinh(namSinh).napAm;
}

export function getMenhNguHanh(namSinh: number): NguHanh {
  return getNapAm(namSinh).element;
}

/** Dựng đầy đủ thông tin Can/Chi/Mệnh/Nạp Âm của 1 người từ năm sinh — dùng cho các hàm `calculate*Compatibility` bên dưới. */
export function getNguoiTuoi(namSinh: number): NguoiTuoi {
  const { can, chi, napAm } = tinhCanChiNapAmNamSinh(namSinh);
  return { namSinh, can, chi, nguHanhMenh: napAm.element, napAm };
}

export function calculateCanCompatibility(nguoi1: NguoiTuoi, nguoi2: NguoiTuoi): TuoiHopLamAnTieuChi {
  const R = TUOI_HOP_LAM_AN_SCORING_RULES;
  let diem = R.diemNenTang;

  if (isCanHop(nguoi1.can, nguoi2.can)) {
    diem += R.can.hopDiem;
    return { diem: clamp10(diem), moTa: `Ngũ hợp Thiên Can (${nguoi1.can}-${nguoi2.can})` };
  }

  const quanHe = getNguHanhQuanHe(nguHanhCuaCan(nguoi1.can), nguHanhCuaCan(nguoi2.can));
  switch (quanHe) {
    case "tuong-hoa":
      diem += R.can.binhHoaDiem;
      return { diem: clamp10(diem), moTa: `Bình hòa (cùng Ngũ Hành Can)` };
    case "a-sinh-b":
    case "b-sinh-a":
      diem += R.can.sinhDiem;
      return { diem: clamp10(diem), moTa: "Tương sinh" };
    case "a-khac-b":
    case "b-khac-a": {
      const dongTinh = amDuongCuaCan(nguoi1.can) === amDuongCuaCan(nguoi2.can);
      diem += dongTinh ? R.can.khacManhDiem : R.can.khacDiem;
      return { diem: clamp10(diem), moTa: dongTinh ? "Khắc mạnh (đồng tính)" : "Khắc" };
    }
  }
}

export function calculateChiCompatibility(nguoi1: NguoiTuoi, nguoi2: NguoiTuoi): TuoiHopLamAnTieuChi {
  const R = TUOI_HOP_LAM_AN_SCORING_RULES;
  const { chi: chiA } = nguoi1;
  const { chi: chiB } = nguoi2;
  let diem = R.diemNenTang;

  if (isTamHop(chiA, chiB)) {
    diem += R.chi.tamHopDiem;
    return { diem: clamp10(diem), moTa: "Tam hợp" };
  }
  if (isLucHop(chiA, chiB)) {
    diem += R.chi.lucHopDiem;
    return { diem: clamp10(diem), moTa: "Lục hợp" };
  }
  // Xung luôn lấn át Hình/Hại/Phá kể cả khi 1 cặp Chi phạm đồng thời cả 2 (vd. Dần-Thân,
  // Sửu-Mùi vừa Xung vừa Hình) — "Xung trực tiếp phải bị trừ mạnh" là ưu tiên cao nhất.
  if (isXung(chiA, chiB)) {
    diem += R.chi.xungDiem;
    return { diem: clamp10(diem), moTa: "Xung" };
  }

  const nhanHinhHaiPha: string[] = [];
  if (isHinh(chiA, chiB)) nhanHinhHaiPha.push("Hình");
  if (isHai(chiA, chiB)) nhanHinhHaiPha.push("Hại");
  if (isPha(chiA, chiB)) nhanHinhHaiPha.push("Phá");
  if (nhanHinhHaiPha.length > 0) {
    diem += R.chi.hinhHaiPhaDiem;
    return { diem: clamp10(diem), moTa: nhanHinhHaiPha.join(" + ") };
  }

  diem += R.chi.binhHoaDiem;
  return { diem: clamp10(diem), moTa: "Bình hòa" };
}

export function calculateMenhCompatibility(nguoi1: NguoiTuoi, nguoi2: NguoiTuoi): TuoiHopLamAnTieuChi {
  const R = TUOI_HOP_LAM_AN_SCORING_RULES;
  let diem = R.diemNenTang;
  const quanHe = getNguHanhQuanHe(nguoi1.nguHanhMenh, nguoi2.nguHanhMenh);

  switch (quanHe) {
    case "tuong-hoa":
      diem += R.menh.tuongHoaDiem;
      return { diem: clamp10(diem), moTa: `Đồng hành (cùng mệnh ${nguoi1.nguHanhMenh})` };
    case "a-sinh-b":
      diem += R.menh.sinhDiem;
      return { diem: clamp10(diem), moTa: `${nguoi1.nguHanhMenh} sinh ${nguoi2.nguHanhMenh}` };
    case "b-sinh-a":
      diem += R.menh.sinhDiem;
      return { diem: clamp10(diem), moTa: `${nguoi2.nguHanhMenh} sinh ${nguoi1.nguHanhMenh}` };
    case "a-khac-b":
      diem += R.menh.khacDiem;
      return { diem: clamp10(diem), moTa: `${nguoi1.nguHanhMenh} khắc ${nguoi2.nguHanhMenh}` };
    case "b-khac-a":
      diem += R.menh.khacDiem;
      return { diem: clamp10(diem), moTa: `${nguoi2.nguHanhMenh} khắc ${nguoi1.nguHanhMenh}` };
  }
}

export function calculateNapAmCompatibility(nguoi1: NguoiTuoi, nguoi2: NguoiTuoi): TuoiHopLamAnTieuChi {
  const R = TUOI_HOP_LAM_AN_SCORING_RULES;
  const diem = clamp10(R.diemNenTang + R.napAm.diemLech);
  return {
    diem,
    moTa: `${nguoi1.napAm.name} × ${nguoi2.napAm.name} — chưa có dữ liệu đối chiếu chi tiết theo tên Nạp Âm, giữ điểm trung tính`,
  };
}

function calculateTongHopCompatibility(
  can: TuoiHopLamAnTieuChi,
  chi: TuoiHopLamAnTieuChi,
  menh: TuoiHopLamAnTieuChi,
): TuoiHopLamAnTieuChi {
  const R = TUOI_HOP_LAM_AN_SCORING_RULES.tongHop;
  let diem = (can.diem + chi.diem + menh.diem) / 3;
  const ghiChu: string[] = [];

  if (can.diem >= R.nguongTot && chi.diem >= R.nguongTot && menh.diem >= R.nguongTot) {
    diem += R.congKhiCaBaTot;
    ghiChu.push("cả 3 yếu tố Can/Chi/Mệnh đều thuận lợi");
  }
  if (can.diem <= R.nguongRatXau || chi.diem <= R.nguongRatXau || menh.diem <= R.nguongRatXau) {
    diem -= R.truKhiCoMotYeuToRatXau;
    ghiChu.push("có ít nhất 1 yếu tố cốt lõi rất xấu, không thể chỉ nhìn yếu tố tốt nhất");
  }

  return {
    diem: clamp10(diem),
    moTa: ghiChu.length > 0 ? `Tổng hợp Can + Chi + Mệnh — ${ghiChu.join("; ")}` : "Tổng hợp Can + Chi + Mệnh",
  };
}

export function getBusinessCompatibilityRating(diem: number): TuoiHopLamAnHang {
  if (diem >= 9) return "rat-hop";
  if (diem >= 7) return "hop";
  if (diem >= 5) return "binh-hoa";
  if (diem >= 3) return "khong-thuan";
  return "khong-nen";
}

export function calculateBusinessCompatibility(nguoi1: NguoiTuoi, nguoi2: NguoiTuoi): TuoiHopLamAnResult {
  const R = TUOI_HOP_LAM_AN_SCORING_RULES.trongSo;

  const can = calculateCanCompatibility(nguoi1, nguoi2);
  const chi = calculateChiCompatibility(nguoi1, nguoi2);
  const menh = calculateMenhCompatibility(nguoi1, nguoi2);
  const napAm = calculateNapAmCompatibility(nguoi1, nguoi2);
  const tongHop = calculateTongHopCompatibility(can, chi, menh);

  let diem = can.diem * R.can + chi.diem * R.chi + menh.diem * R.menh + napAm.diem * R.napAm + tongHop.diem * R.tongHop;
  diem = clamp10(diem);
  diem = Math.round(diem * 10) / 10;

  const hang = getBusinessCompatibilityRating(diem);
  return {
    diem,
    hang,
    nhan: NHAN_THEO_HANG[hang],
    can,
    chi,
    menh,
    napAm,
    tongHop,
    ketLuan: KET_LUAN_THEO_HANG[hang],
  };
}

export function formatBusinessCompatibilityResult(result: TuoiHopLamAnResult): string {
  return [
    `${result.nhan} — ${result.diem}/10`,
    `Can: ${result.can.moTa}`,
    `Chi: ${result.chi.moTa}`,
    `Mệnh: ${result.menh.moTa}`,
    `Nạp âm: ${result.napAm.moTa}`,
  ].join("\n");
}
