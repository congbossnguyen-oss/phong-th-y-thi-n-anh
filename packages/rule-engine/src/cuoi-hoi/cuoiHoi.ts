/**
 * MODULE NGÀY CƯỚI HỎI TỔNG HỢP — lớp quy tắc thuần.
 *
 * Đặc tả: `modulengaycuoihoitonghop final.md` (v6).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * KẾT QUẢ KHẢO SÁT KHO 2026-08-17 — ĐẶC TẢ MỤC 0 ĐÃ LỖI THỜI Ở NHIỀU CHỖ
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * Đặc tả ghi mấy thứ dưới đây là "CHƯA CÓ Ở ĐÂU, phải xây mới". Rà lại thì ĐÃ CÓ SẴN, nên module
 * này gọi thẳng vào chứ KHÔNG viết lại (nguyên tắc chủ dự án: "thần sát hay cách tính thì dùng
 * chung rồi"):
 *
 *   - Tiểu Lục Nhâm (mục 19)        → `trach-nhat/tieuLucNham.ts`  — `getTieuLucNham(...)`
 *   - Xuất hành cá nhân (mục 20)    → `scoring/xuatHanhCaNhanTongHop.ts`
 *   - Thiên Giải / Địa Giải (mục 14)→ `trach-nhat/thanSat.ts`
 *   - Hợp tuổi cặp đôi (mục 5)      → `chon-tuoi-ket-hon/tongHop.ts`
 *   - Hoàng Đạo, 28 Tú, Trực,
 *     Tam Nương, Nguyệt Kỵ, nạp âm  → tầng trạch nhật dùng chung
 *
 * THẬT SỰ CÒN THIẾU (không tự bịa, chờ nguồn):
 *   - Hồng Loan → đã bổ sung ở `hongLoanThienHy.ts` vì đặc tả mục 14b cho công thức đầy đủ.
 *   - Khí Vãng Vong, Chu Đường bất lợi, hoà thượng sát / ni cô sát, Giờ Quý Nhân Đăng Thiên Môn:
 *     CHƯA có bảng nào trong kho. Xem `THIEU_DU_LIEU_CUOI_HOI` bên dưới — module KHÔNG tính các
 *     mục này và nói rõ ra, thay vì im lặng bỏ qua.
 */
import type { Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

/** 4 nghi lễ của chuỗi cưới hỏi (mục 1). */
export type NghiLeCuoiHoi = "an-hoi" | "don-dau" | "thanh-hon" | "dang-ky-ket-hon";

export const TEN_NGHI_LE: Readonly<Record<NghiLeCuoiHoi, string>> = {
  "an-hoi": "Ăn hỏi",
  "don-dau": "Đón dâu",
  "thanh-hon": "Thành hôn",
  "dang-ky-ket-hon": "Đăng ký kết hôn",
};

/** Chế độ ưu tiên khi cân điểm hai người (mục 3). */
export type UuTienCuoiHoi = "can-bang" | "uu-tien-co-dau" | "uu-tien-chu-re";

/**
 * ⚠️ CÁC MỤC CHƯA CÓ DỮ LIỆU — module phải BÁO RA, không được lặng lẽ coi như đã xét.
 *
 * Đặc tả nguyên tắc 9: "Thiếu dữ liệu → bỏ tiêu chí + chuẩn hoá trọng số", và nguyên tắc 12:
 * không gọi engine chưa có như thể đã có.
 */
export const THIEU_DU_LIEU_CUOI_HOI: readonly string[] = [
  // Chu Đường đã có công thức (chủ dự án cấp 2026-08-17) → xem `chuDuong.ts`, đã gỡ khỏi danh sách.
  // Nhưng 6/8 trực còn lại chưa có luận — xem `TRUC_CHU_DUONG_CHUA_CO_LUAN`.
  "Ni Cô Sát — nguồn CẤM suy ra bằng cách đảo bảng Hoà Thượng Sát; chờ nguồn riêng",
  "Mức độ phạt của Hoà Thượng Sát — nguồn nói rõ chưa đủ căn cứ để tự chốt loại thẳng hay trừ bao nhiêu",
  "Giờ Quý Nhân Đăng Thiên Môn — chưa số hoá",
];

/**
 * Trọng số chấm điểm NGÀY (mục 21).
 *
 * ⚠️ Đây là con số ĐẶC TẢ ĐỀ XUẤT, chưa hiệu chỉnh trên ca thật — giống bài học ở module tang lễ,
 * phải để một chỗ duy nhất cho dễ chỉnh, không rải rác trong logic.
 */
export const TRONG_SO_NGAY: Readonly<Record<string, number>> = {
  ngayVoiCoDau: 20,
  ngayVoiChuRe: 20,
  nghiKyTheoNghiLe: 25,
  catTinhHonNhan: 15,
  trachCatTongThe: 10,
  hoangDaoTrucTu: 10,
};

/** Trọng số chấm điểm GIỜ (mục 22). */
export const TRONG_SO_GIO: Readonly<Record<string, number>> = {
  gioVoiCoDau: 20,
  gioVoiChuRe: 20,
  theoNghiLe: 20,
  tieuLucNham: 20,
  gioHoangDao: 10,
  huongXuatHanh: 10,
};

/** Tỷ trọng ngày/giờ theo từng nghi lễ (mục 24). Đón dâu nặng về giờ hơn hẳn. */
export const TY_TRONG_NGAY_GIO: Readonly<Record<NghiLeCuoiHoi, { ngay: number; gio: number }>> = {
  "an-hoi": { ngay: 60, gio: 40 },
  "don-dau": { ngay: 45, gio: 55 },
  "thanh-hon": { ngay: 60, gio: 40 },
  "dang-ky-ket-hon": { ngay: 50, gio: 50 },
};

/**
 * Chia 100% BÊN TRONG mục "cát tinh hôn nhân" (mục 14a) — không phải trọng số cấp cao nhất.
 * Cá nhân hai người chiếm 60%, lưu niên chỉ 20%: đúng nguyên tắc "lưu niên là bối cảnh phụ".
 */
export const TRONG_SO_CAT_TINH: Readonly<Record<string, number>> = {
  hyTinhCoDau: 30,
  hyTinhChuRe: 30,
  hyTinhLuuNien: 20,
  catTinhKhac: 20,
};

/** Thưởng thêm khi ngày chạm từ 2 điều kiện hỷ tinh CÁ NHÂN trở lên (mục 14a). */
export const THUONG_SONG_HY = 15;

/**
 * Xếp hạng theo điểm 0-10 (mục 32).
 *
 * Dải điểm lấy nguyên đặc tả. Lưu ý "KHÔNG NÊN CHỌN" chỉ là nhãn — việc loại thẳng do
 * `CUOI_HOI_LOAI_THANG` quyết định, không phải do điểm thấp.
 */
export type HangCuoiHoi = "dai-cat" | "rat-tot" | "tot" | "co-the-dung" | "khong-thuan" | "khong-nen-chon";

export const TEN_HANG: Readonly<Record<HangCuoiHoi, string>> = {
  "dai-cat": "ĐẠI CÁT",
  "rat-tot": "RẤT TỐT",
  tot: "TỐT",
  "co-the-dung": "CÓ THỂ DÙNG",
  "khong-thuan": "KHÔNG THUẬN",
  "khong-nen-chon": "KHÔNG NÊN CHỌN",
};

export function xepHangCuoiHoi(diem10: number): HangCuoiHoi {
  if (diem10 >= 9) return "dai-cat";
  if (diem10 >= 8) return "rat-tot";
  if (diem10 >= 7) return "tot";
  if (diem10 >= 5) return "co-the-dung";
  if (diem10 >= 3) return "khong-thuan";
  return "khong-nen-chon";
}

/**
 * Cân điểm hai người (mục 3 + mục 23).
 *
 * KHÔNG lấy trung bình đơn thuần: đặc tả nguyên tắc 4 cấm để điểm cực cao của một người che điểm
 * cực thấp của người kia. Càng lệch thì phạt càng nặng — một ngày 9.8 cho chú rể nhưng 4.0 cho cô
 * dâu thì không phải ngày cưới tốt.
 */
export function canDiemCapDoi(diemCoDau: number, diemChuRe: number, uuTien: UuTienCuoiHoi = "can-bang"): number {
  const lech = Math.abs(diemCoDau - diemChuRe);
  // Phạt theo NỬA độ lệch: lệch 4 điểm thì trừ 2 — đủ nặng để đẩy ngày lệch xuống dưới ngày đều,
  // nhưng không xoá sạch giá trị của ngày tốt cho cả hai mà hơi nghiêng một bên.
  const phatLech = lech / 2;
  const trungBinh =
    uuTien === "uu-tien-co-dau"
      ? diemCoDau * 0.65 + diemChuRe * 0.35
      : uuTien === "uu-tien-chu-re"
        ? diemChuRe * 0.65 + diemCoDau * 0.35
        : (diemCoDau + diemChuRe) / 2;
  return Math.max(0, trungBinh - phatLech);
}

/**
 * Đại kỵ LOẠI THẲNG cho cưới hỏi (mục 15).
 *
 * Chỉ liệt những mục đã có dữ liệu thật trong kho. Ba mục riêng của Thành hôn (Khí Vãng Vong,
 * Chu Đường, hoà thượng sát) CHƯA có công thức nên không nằm ở đây — xem `THIEU_DU_LIEU_CUOI_HOI`.
 */
export const CUOI_HOI_LOAI_THANG: readonly string[] = [
  "Kim Thần Thất Sát",
  "Thọ Tử",
  "Thụ Tử",
  "Sát Chủ",
  "Nguyệt Tận",
  "Trực Phá",
  "Trực Bế",
];

/**
 * Nghi lễ nào kỵ thêm gì (mục 9).
 *
 * ⚠️ Ăn hỏi (đính hôn) KHÔNG kỵ Khí Vãng Vong / Chu Đường / hoà thượng sát — chỉ Thành hôn (giá
 * thú) mới kỵ. Đặc tả nhấn mạnh không được gộp chung một bộ kỵ cho cả hai nghi lễ (nguyên tắc 13).
 * Hiện ba mục đó chưa có dữ liệu, nhưng vẫn khai báo sẵn ranh giới để sau này nối vào đúng chỗ.
 */
export const KY_RIENG_THANH_HON: readonly string[] = ["Khí Vãng Vong", "Chu Đường bất lợi", "Hoà thượng sát / ni cô sát"];

/** Nghi lễ này có áp nhóm kỵ riêng của giá thú không. */
export function apKyRiengGiaThu(nghiLe: NghiLeCuoiHoi): boolean {
  return nghiLe === "thanh-hon";
}

/**
 * Việc trạch nhật tương ứng mỗi nghi lễ, để tra bảng Nghi/Kỵ dùng chung.
 * Đón dâu thiên về xuất hành; đăng ký kết hôn thiên về ký kết/giao dịch (mục 11, 13).
 */
export const VIEC_TRACH_NHAT_THEO_NGHI_LE: Readonly<Record<NghiLeCuoiHoi, readonly string[]>> = {
  "an-hoi": ["đính hôn", "nạp lễ", "cưới hỏi"],
  "don-dau": ["xuất hành", "giá thú", "cưới hỏi"],
  "thanh-hon": ["giá thú", "cưới hỏi"],
  "dang-ky-ket-hon": ["ký kết", "giao dịch", "giá thú"],
};

export interface DiemHyTinh {
  /** 0-100, đã gộp cả 3 lớp và thưởng song hỷ. */
  diem: number;
  moTa: string[];
}

/**
 * Điểm cát tinh hôn nhân từ kết quả hỷ tinh (mục 14a).
 *
 * `diemCatTinhKhac` là 0-100, do tầng facade tính từ thần sát cát của ngày (Thiên Đức, Nguyệt Đức,
 * Thiên Xá, Thiên Giải, Địa Giải…) — tách ra để lớp thuần này không phải biết bảng thần sát.
 */
export function tinhDiemHyTinh(
  hyTinh: { coDauHongLoan: boolean; coDauThienHy: boolean; chuReHongLoan: boolean; chuReThienHy: boolean; luuNienHongLoan: boolean; luuNienThienHy: boolean; songHy: boolean; moTa: string[] },
  diemCatTinhKhac: number,
): DiemHyTinh {
  const coDau = hyTinh.coDauHongLoan || hyTinh.coDauThienHy ? 100 : 0;
  const chuRe = hyTinh.chuReHongLoan || hyTinh.chuReThienHy ? 100 : 0;
  const luuNien = hyTinh.luuNienHongLoan || hyTinh.luuNienThienHy ? 100 : 0;

  const diem =
    (coDau * TRONG_SO_CAT_TINH.hyTinhCoDau! +
      chuRe * TRONG_SO_CAT_TINH.hyTinhChuRe! +
      luuNien * TRONG_SO_CAT_TINH.hyTinhLuuNien! +
      Math.max(0, Math.min(100, diemCatTinhKhac)) * TRONG_SO_CAT_TINH.catTinhKhac!) /
    100;

  // Song hỷ là phần THƯỞNG RIÊNG, không phải cộng tuyến tính (mục 14a nhấn mạnh).
  const tong = Math.min(100, diem + (hyTinh.songHy ? THUONG_SONG_HY : 0));
  const moTa = [...hyTinh.moTa];
  if (hyTinh.songHy) moTa.push("Song hỷ — chạm từ 2 hỷ tinh cá nhân trở lên");
  return { diem: tong, moTa };
}

/** Chi năm sinh → dùng cho hỷ tinh. Tách hàm để facade không phải tự suy Chi từ năm. */
export function chiNamSinh(namSinh: number, chiTheoNam: (nam: number) => Chi): Chi {
  return chiTheoNam(namSinh);
}
