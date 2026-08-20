/**
 * NGÀY KHAI TRƯƠNG CAO CẤP — lớp Bát Tự mệnh chủ chồng lên bản Khai Trương thường.
 *
 * NGUYÊN TẮC BAO TRÙM (SPEC bắt buộc): bản cao cấp KHÔNG phải hệ tính song song. Điểm NỀN lấy nguyên
 * từ `calculateKhaiTruongScore()` của bản thường (đã gồm tương tác tuổi chủ ở mức Chi năm), rồi CỘNG
 * thêm lớp Bát Tự. Điểm nền của cùng 1 ngày ở 2 bản luôn bằng nhau. Ngày bị bản thường loại → cao cấp
 * cũng loại (Bát Tự không cứu ngày đã bị loại ở nền).
 *
 * 3 Lõi Bát Tự (chi tiết trong data/bat-tu-menh-chu-khai-truong.md):
 *   - Lõi 1 — Thập Thần hợp mục đích cầu tài: ưu tiên Thê Tài (Chính/Thiên Tài), kế Thực Thương.
 *   - Lõi 2 — quan hệ Chi ngày ứng viên với NHẬT CHI mệnh chủ (Chi năm đã tính ở nền, KHÔNG lặp).
 *   - Lõi 3 — Dụng Thần theo vượng suy (chỉ khi có giờ sinh): thân nhược → ưu Thực Thương, kỵ Tài
 *     thuần; thân vượng → Tài phát huy tối đa.
 *
 * Vượng suy dùng phương pháp ĐIỂM NGŨ HÀNH CÓ TRỌNG SỐ (thấu can 1, tàng can 0.5, nguyệt lệnh ×2) —
 * cùng phương pháp đã kiểm chứng ở `tinhdanh-engine` (Việt Danh Học). Không có giờ sinh → KHÔNG đoán
 * vượng suy (SPEC: thà thiếu còn hơn sai), báo `thieu_du_lieu`.
 */
import type { Data } from "@thien-anh/calendar-core";
import { tinhThapThan, NHOM_THE_TAI, type ThapThan } from "./kyHopDongCaoCap.js";
import { isTamHop } from "../trach-nhat/tamHop.js";
import { isLucHop } from "../trach-nhat/lucHop.js";
import { getLucXungChi } from "../trach-nhat/lucXung.js";
import { TU_HINH, getHaiThaiTueChi } from "../trach-nhat/thaiTue.js";
import type { KhaiTruongResult } from "./ngayKhaiTruong.js";

type Can = Data.Can;
type Chi = Data.Chi;
type NguHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

// Bảng chuẩn (đối chiếu tinhdanh-engine): Can → Ngũ Hành; Chi → tàng can (chỉ số Can 0..9).
const CAN_LIST: readonly Can[] = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI_LIST: readonly Chi[] = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const CAN_NGU_HANH: readonly NguHanh[] = ["Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy"];
// Tàng can theo Chi (index 0=Tý..11=Hợi), phần tử là chỉ số Can. Trùng bảng đã kiểm ở tinhdanh-engine.
const TANG_CAN: readonly number[][] = [
  [9], [5, 9, 7], [0, 2, 4], [1], [4, 1, 9], [2, 4, 6],
  [3, 5], [5, 3, 1], [6, 8, 4], [7], [4, 7, 3], [8, 0],
];
/** Hành nào SINH RA hành X — dùng tìm Ấn (hành sinh Nhật Chủ). */
const DUOC_SINH_BOI: Readonly<Record<NguHanh, NguHanh>> = { Hỏa: "Mộc", Thổ: "Hỏa", Kim: "Thổ", Thủy: "Kim", Mộc: "Thủy" };

function canIdx(c: Can): number { return CAN_LIST.indexOf(c); }
function chiIdx(c: Chi): number { return CHI_LIST.indexOf(c); }
function nguHanhCan(c: Can): NguHanh { return CAN_NGU_HANH[canIdx(c)]!; }

// ===========================================================================================
// VƯỢNG SUY (Lõi 3) — điểm ngũ hành có trọng số. Chỉ dùng khi có ĐỦ 4 trụ (có giờ sinh).
// ===========================================================================================
export type VuongSuy = "vượng" | "nhược";

/** Tứ Trụ mệnh chủ. Trụ giờ tùy chọn — thiếu thì KHÔNG xác định vượng suy. */
export interface TuTruChu {
  canNam: Can; chiNam: Chi;
  canThang: Can; chiThang: Chi;
  canNgay: Can; chiNgay: Chi;
  canGio?: Can; chiGio?: Chi;
}

export interface KetQuaVuongSuy {
  vuongSuy: VuongSuy;
  tyLePheNhatChu: number; // 0..1 — tỷ trọng phe sinh trợ Nhật Chủ (Ấn + Tỷ Kiếp)
  dacLenh: boolean; // Nhật Chủ có được lệnh tháng (nguyệt lệnh sinh trợ) không
  moTa: string;
}

/**
 * Xác định Nhật Chủ vượng hay nhược. Trả `null` nếu THIẾU trụ giờ (không đủ Tứ Trụ) — không đoán.
 * Phương pháp: cộng điểm 5 hành (thấu can 1, tàng can 0.5, tàng can trụ THÁNG ×2 cho nguyệt lệnh),
 * so phe sinh trợ Nhật Chủ (Tỷ Kiếp = đồng hành, Ấn = hành sinh Nhật Chủ) với tổng.
 */
export function xacDinhVuongSuy(t: TuTruChu): KetQuaVuongSuy | null {
  if (!t.canGio || !t.chiGio) return null;

  const diem: Record<NguHanh, number> = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
  const truCan: Can[] = [t.canNam, t.canThang, t.canNgay, t.canGio];
  const truChi: Chi[] = [t.chiNam, t.chiThang, t.chiNgay, t.chiGio];
  for (const c of truCan) diem[nguHanhCan(c)] += 1; // thấu can
  truChi.forEach((chi, i) => {
    const w = i === 1 ? 2 : 1; // trụ tháng (i=1) nhân đôi cho nguyệt lệnh
    for (const cIdx of TANG_CAN[chiIdx(chi)]!) diem[CAN_NGU_HANH[cIdx]!] += 0.5 * w;
  });

  const nhNhatChu = nguHanhCan(t.canNgay);
  const hanhAn = DUOC_SINH_BOI[nhNhatChu]; // Ấn = hành sinh Nhật Chủ
  const diemPhe = diem[nhNhatChu] + diem[hanhAn]; // Tỷ Kiếp + Ấn
  const tong = Object.values(diem).reduce((s, v) => s + v, 0);
  const tyLe = tong > 0 ? diemPhe / tong : 0;

  // Đắc lệnh: hành của tàng can chính (phần tử đầu) trụ tháng thuộc phe Nhật Chủ (đồng hành hoặc Ấn).
  const hanhNguyetLenh = CAN_NGU_HANH[TANG_CAN[chiIdx(t.chiThang)]![0]!]!;
  const dacLenh = hanhNguyetLenh === nhNhatChu || hanhNguyetLenh === hanhAn;

  // Ngưỡng 0.5: phe sinh trợ chiếm đa số → vượng. (Nguyệt lệnh đã được nhân đôi ở trên.)
  const vuongSuy: VuongSuy = tyLe >= 0.5 ? "vượng" : "nhược";
  return {
    vuongSuy,
    tyLePheNhatChu: Math.round(tyLe * 100) / 100,
    dacLenh,
    moTa: `Nhật Chủ ${t.canNgay} (${nhNhatChu}) ${vuongSuy} — phe sinh trợ chiếm ${Math.round(tyLe * 100)}% ${dacLenh ? "(đắc lệnh tháng)" : "(không đắc lệnh)"}.`,
  };
}

// ===========================================================================================
// LỚP CAO CẤP — cộng Bát Tự lên nền
// ===========================================================================================

/** Thông tin mệnh chủ đã rút gọn cho lớp chấm điểm. */
export interface NguoiChuKhaiTruong {
  canNhatChu: Can; // Can trụ NGÀY sinh = Nhật Chủ (Lõi 1 Thập Thần)
  chiNamSinh: Chi; // Chi năm sinh — đã dùng ở NỀN, ở đây chỉ để mô tả, KHÔNG chấm lại
  chiNgaySinh: Chi; // Nhật Chi (Lõi 2 — phần nền CHƯA xét)
  vuongSuy: VuongSuy | null; // Lõi 3 — null nếu thiếu giờ sinh
}

/** Điểm khai trương của từng Thập Thần (Lõi 1), thang 0-10. */
const DIEM_THAP_THAN: Record<ThapThan, number> = {
  "Chính Tài": 10, "Thiên Tài": 9.5, // Thê Tài — đúng mục đích mở dòng tiền
  "Thực Thần": 9, "Thương Quan": 8.5, // sinh Tài — rất hợp kinh doanh
  "Chính Quan": 6.5, "Thất Sát": 6, // Quan tinh — hợp ngành cần danh/giấy phép
  "Tỷ Kiên": 5, "Kiếp Tài": 4.5, // Tỷ Kiếp đoạt Tài — hợp góp vốn nhiều người
  "Chính Ấn": 4, "Thiên Ấn": 3.5, // Ấn chặn nguồn sinh Tài — thấp cho buôn bán
};

export interface KhaiTruongCaoCapResult {
  diemNen: number; // = base.diem (bằng khít bản thường)
  diemBatTu: number; // 0-10, lớp Bát Tự
  diemTong: number; // 0.65*nen + 0.35*batTu, làm tròn 1 số
  hasBatTu: boolean; // true khi có nhập ngày sinh chủ (bật cao cấp)
  thapThan: ThapThan | null;
  loi1Diem: number | null; // Thập Thần
  loi2Diem: number; // quan hệ Nhật Chi
  loi3ApDung: boolean; // Lõi 3 có chạy (đủ giờ)
  yeuTo: string[]; // dòng breakdown cho khách
  thieuDuLieu: string[];
}

const clamp10 = (x: number) => Math.max(0, Math.min(10, x));
const round1 = (x: number) => Math.round(x * 10) / 10;

/**
 * Chấm điểm cao cấp = nền (base.diem) + lớp Bát Tự.
 * `base`: kết quả `calculateKhaiTruongScore()` của bản thường (đã tính, truyền vào — KHÔNG tính lại).
 * `nguoiChu`: null → chạy y hệt bản thường (100% nền).
 */
export function calculateKhaiTruongCaoCapScore(
  base: KhaiTruongResult,
  canNgay: Can,
  chiNgay: Chi,
  nguoiChu: NguoiChuKhaiTruong | null,
): KhaiTruongCaoCapResult {
  const diemNen = base.diem;
  const thieuDuLieu: string[] = [];

  if (!nguoiChu) {
    return {
      diemNen, diemBatTu: diemNen, diemTong: diemNen, hasBatTu: false,
      thapThan: null, loi1Diem: null, loi2Diem: 0, loi3ApDung: false,
      yeuTo: [], thieuDuLieu,
    };
  }

  // --- Lõi 1: Thập Thần ---
  const thapThan = tinhThapThan(nguoiChu.canNhatChu, canNgay);
  let loi1 = DIEM_THAP_THAN[thapThan];
  const laTheTai = NHOM_THE_TAI.includes(thapThan);
  const laThucThuong = thapThan === "Thực Thần" || thapThan === "Thương Quan";

  // --- Lõi 3: điều chỉnh Lõi 1 theo vượng suy (chỉ khi có giờ) ---
  let loi3ApDung = false;
  if (nguoiChu.vuongSuy) {
    loi3ApDung = true;
    if (nguoiChu.vuongSuy === "nhược") {
      // Thân nhược: kỵ Tài thuần (hao thân), ưu tiên Thực Thương (sinh Tài mà không trực tiếp hao thân).
      if (laTheTai) loi1 = Math.max(0, loi1 - 2);
      if (laThucThuong) loi1 = Math.min(10, loi1 + 1);
    } else {
      // Thân vượng: đảm được Tài → Tài phát huy tối đa.
      if (laTheTai) loi1 = Math.min(10, loi1 + 1);
    }
  } else {
    thieuDuLieu.push("Chưa nhập giờ sinh chủ — chưa chạy Lõi 3 Dụng Thần (vượng suy), chỉ chạy Lõi 1-2.");
  }

  // --- Lõi 2: quan hệ Chi ngày ứng viên với NHẬT CHI mệnh chủ (Chi năm đã tính ở NỀN) ---
  // Thang quy về 0-10 quanh mốc 5 (bình hòa). Cộng hợp, trừ xung/hình/hại.
  let loi2 = 5;
  const nhatChi = nguoiChu.chiNgaySinh;
  const moTaLoi2: string[] = [];
  if (getLucXungChi(chiNgay) === nhatChi) { loi2 -= 3; moTaLoi2.push(`Lục Xung Nhật Chi ${nhatChi}`); }
  else if (isTamHop(chiNgay, nhatChi) || isLucHop(chiNgay, nhatChi)) { loi2 += 2.5; moTaLoi2.push(`hợp Nhật Chi ${nhatChi}`); }
  else if (TU_HINH.includes(chiNgay) && TU_HINH.includes(nhatChi) && chiNgay !== nhatChi) { loi2 -= 1.5; moTaLoi2.push(`Tam Hình với Nhật Chi ${nhatChi}`); }
  else if (getHaiThaiTueChi(nhatChi) === chiNgay) { loi2 -= 1.5; moTaLoi2.push(`Lục Hại Nhật Chi ${nhatChi}`); }
  loi2 = clamp10(loi2);

  // --- Hoà lớp Bát Tự: trung bình Lõi 1 (Thập Thần, trọng số chính) + Lõi 2 (Nhật Chi) ---
  const diemBatTu = clamp10(loi1 * 0.65 + loi2 * 0.35);

  // --- Tổng: nền 65% + Bát Tự 35% (SPEC), cộng TRƯỚC/không vượt đại kỵ vì nền đã cap ---
  const diemTong = round1(diemNen * 0.65 + diemBatTu * 0.35);

  const yeuTo: string[] = [
    `Nền khai trương ${round1(diemNen)}đ`,
    `Nhật Chủ ${nguoiChu.canNhatChu}: ngày Can ${canNgay} là ${thapThan}${laTheTai ? " (Thê Tài — đúng cầu tài)" : laThucThuong ? " (Thực Thương — sinh Tài)" : ""}`,
    ...(moTaLoi2.length ? [moTaLoi2.join(", ")] : [`bình hòa Nhật Chi ${nhatChi}`]),
    ...(loi3ApDung ? [`Dụng Thần: thân ${nguoiChu.vuongSuy}`] : []),
    `→ hợp mệnh ${round1(diemBatTu)}đ → tổng ${diemTong}đ`,
  ];

  return {
    diemNen, diemBatTu: round1(diemBatTu), diemTong, hasBatTu: true,
    thapThan, loi1Diem: round1(loi1), loi2Diem: round1(loi2), loi3ApDung,
    yeuTo, thieuDuLieu,
  };
}
