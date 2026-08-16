/**
 * TAM ĐẠI CÁT TINH — Sát Cống · Trực Tinh · Nhân Chuyên.
 *
 * Nguồn: Đổng Công Tuyển Trạch Nhật Yếu Lãm, bảng chủ dự án cung cấp trực tiếp 2026-08-16.
 *
 * Cách an: chia 12 tháng âm thành 3 nhóm, rồi so CẢ CAN LẪN CHI của ngày (không phải chỉ Can hoặc
 * chỉ Chi như phần lớn thần sát trong `thanSat.ts`) với danh sách trụ ngày của nhóm tháng đó.
 *   • Tứ Mạnh  — tháng 1, 4, 7, 10
 *   • Tứ Trọng — tháng 2, 5, 8, 11
 *   • Tứ Quý   — tháng 3, 6, 9, 12
 *
 * ⚠️ CẤU TRÚC ĐÁNG CHÚ Ý (đã báo chủ dự án, giữ nguyên theo bảng gốc): ba bảng LỆCH NHAU ĐÚNG MỘT
 * NHÓM THÁNG. Cụ thể `Trực Tinh (Tứ Trọng)` trùng khít `Sát Cống (Tứ Mạnh)`, và
 * `Trực Tinh (Tứ Quý)` trùng khít `Sát Cống (Tứ Trọng)`. Đây có thể là quy luật thật của phương
 * pháp (cùng một bộ 7 trụ ngày xoay vòng qua các nhóm tháng), cũng có thể là bảng bị chép lệch.
 * Có test khoá lại quan hệ này để nếu sau chủ dự án sửa bảng thì lộ ra ngay.
 */
import { Data } from "@thien-anh/calendar-core";
import type { CatHung } from "./catHung.js";

type Can = Data.Can;
type Chi = Data.Chi;

/** Một trụ ngày (Can + Chi) trong bảng tra. */
export interface TruNgay {
  can: Can;
  chi: Chi;
}

export type NhomThang = "Tứ Mạnh" | "Tứ Trọng" | "Tứ Quý";

/** Tháng âm lịch → nhóm. Tháng 1,4,7,10 = Tứ Mạnh; 2,5,8,11 = Tứ Trọng; 3,6,9,12 = Tứ Quý. */
export function getNhomThang(lunarMonth: number): NhomThang {
  if (lunarMonth < 1 || lunarMonth > 12) {
    throw new Error(`Tháng âm lịch không hợp lệ: ${lunarMonth}`);
  }
  const du = lunarMonth % 3;
  if (du === 1) return "Tứ Mạnh";
  if (du === 2) return "Tứ Trọng";
  return "Tứ Quý";
}

const t = (can: Can, chi: Chi): TruNgay => ({ can, chi });

export const SAT_CONG: Readonly<Record<NhomThang, readonly TruNgay[]>> = {
  "Tứ Mạnh": [
    t("Đinh", "Mão"), t("Bính", "Tý"), t("Ất", "Dậu"), t("Giáp", "Ngọ"),
    t("Quý", "Mão"), t("Nhâm", "Tý"), t("Tân", "Dậu"),
  ],
  "Tứ Trọng": [
    t("Bính", "Dần"), t("Ất", "Hợi"), t("Giáp", "Thân"), t("Quý", "Tỵ"),
    t("Nhâm", "Dần"), t("Tân", "Hợi"), t("Canh", "Thân"),
  ],
  "Tứ Quý": [
    t("Kỷ", "Sửu"), t("Giáp", "Tuất"), t("Quý", "Mùi"), t("Nhâm", "Thìn"),
    t("Tân", "Sửu"), t("Canh", "Tuất"), t("Kỷ", "Mùi"),
  ],
};

export const TRUC_TINH: Readonly<Record<NhomThang, readonly TruNgay[]>> = {
  "Tứ Mạnh": [
    t("Mậu", "Thìn"), t("Đinh", "Sửu"), t("Bính", "Tuất"), t("Ất", "Mùi"),
    t("Giáp", "Thìn"), t("Quý", "Sửu"), t("Nhâm", "Tuất"),
  ],
  "Tứ Trọng": [
    t("Đinh", "Mão"), t("Bính", "Tý"), t("Ất", "Dậu"), t("Giáp", "Ngọ"),
    t("Quý", "Mão"), t("Nhâm", "Tý"), t("Tân", "Dậu"),
  ],
  "Tứ Quý": [
    t("Bính", "Dần"), t("Ất", "Hợi"), t("Giáp", "Thân"), t("Quý", "Tỵ"),
    t("Nhâm", "Dần"), t("Tân", "Hợi"), t("Canh", "Thân"),
  ],
};

/**
 * Nhân Chuyên (人专).
 *
 * ⚠️ Nhóm Tứ Quý có 7 trụ trong khi 2 nhóm kia 6 trụ, và nguồn ghi rõ có DỊ BẢN ở vị trí thứ 3:
 * một bản truyền khác chép "Đinh Mão" thay cho "Kỷ Hợi". Ở đây dùng bản Đổng Công (Kỷ Hợi) đúng
 * như chủ dự án chỉ định — KHÔNG tự chọn bản kia, cũng không tự cắt bớt cho đủ 6.
 */
export const NHAN_CHUYEN: Readonly<Record<NhomThang, readonly TruNgay[]>> = {
  "Tứ Mạnh": [
    t("Tân", "Mùi"), t("Canh", "Thìn"), t("Kỷ", "Sửu"),
    t("Mậu", "Tuất"), t("Đinh", "Mùi"), t("Bính", "Thìn"),
  ],
  "Tứ Trọng": [
    t("Canh", "Ngọ"), t("Kỷ", "Mão"), t("Mậu", "Tý"),
    t("Đinh", "Dậu"), t("Bính", "Ngọ"), t("Ất", "Mão"),
  ],
  "Tứ Quý": [
    t("Kỷ", "Tỵ"), t("Mậu", "Dần"), t("Kỷ", "Hợi"),
    t("Bính", "Thân"), t("Ất", "Tỵ"), t("Giáp", "Dần"), t("Quý", "Hợi"),
  ],
};

/** Dị bản Tứ Quý của Nhân Chuyên — giữ lại để đối chiếu, KHÔNG dùng để chấm điểm. */
export const NHAN_CHUYEN_TU_QUY_DI_BAN: readonly TruNgay[] = [
  t("Kỷ", "Tỵ"), t("Mậu", "Dần"), t("Đinh", "Mão"),
  t("Bính", "Thân"), t("Ất", "Tỵ"), t("Giáp", "Dần"), t("Quý", "Hợi"),
];

export type TenTamDaiCatTinh = "Sát Cống" | "Trực Tinh" | "Nhân Chuyên";

export interface TamDaiCatTinhEntry {
  name: TenTamDaiCatTinh;
  catHung: CatHung;
  nhomThang: NhomThang;
  nguon: string;
}

const NGUON = "Đổng Công Tuyển Trạch Nhật Yếu Lãm — bảng chủ dự án cung cấp 2026-08-16";

function trungTru(ds: readonly TruNgay[], can: Can, chi: Chi): boolean {
  return ds.some((x) => x.can === can && x.chi === chi);
}

/**
 * Tam Đại Cát Tinh có mặt trong một ngày. Một ngày có thể trúng nhiều sao cùng lúc.
 *
 * @param lunarMonth Tháng âm lịch 1-12 (quyết định nhóm Tứ Mạnh/Trọng/Quý).
 * @param canNgay Thiên Can của trụ NGÀY.
 * @param chiNgay Địa Chi của trụ NGÀY.
 */
export function getTamDaiCatTinhTrongNgay(
  lunarMonth: number,
  canNgay: Can,
  chiNgay: Chi,
): TamDaiCatTinhEntry[] {
  const nhom = getNhomThang(lunarMonth);
  const ds: TamDaiCatTinhEntry[] = [];

  if (trungTru(SAT_CONG[nhom], canNgay, chiNgay)) {
    ds.push({ name: "Sát Cống", catHung: "cát", nhomThang: nhom, nguon: NGUON });
  }
  if (trungTru(TRUC_TINH[nhom], canNgay, chiNgay)) {
    ds.push({ name: "Trực Tinh", catHung: "cát", nhomThang: nhom, nguon: NGUON });
  }
  if (trungTru(NHAN_CHUYEN[nhom], canNgay, chiNgay)) {
    ds.push({ name: "Nhân Chuyên", catHung: "cát", nhomThang: nhom, nguon: NGUON });
  }

  return ds;
}

// ---------------------------------------------------------------------------------------
// Quy tắc hoá giải hung tinh
// ---------------------------------------------------------------------------------------

/**
 * Các hung tinh mà Tam Đại Cát Tinh KHÔNG hoá giải được (sơ đồ chủ dự án cung cấp 2026-08-16).
 *
 * Sơ đồ gốc:
 *   Ngày có hung tinh → có Tam Đại Cát Tinh?
 *     KHÔNG → giữ nguyên hung
 *     CÓ    → xét ngoại lệ: Kim Thần Thất Sát · Sát Chủ/Thọ Tử · Trung Cung/Bạch Hổ
 *             → ba nhóm này KHÔNG HOÁ
 *             → còn lại là hung tinh thông thường → GIẢM / HOÁ HUNG
 */
export const HUNG_TINH_KHONG_HOA_GIAI: readonly string[] = [
  "Kim Thần Thất Sát",
  "Sát Chủ",
  "Thọ Tử",
  "Thụ Tử", // cùng một sao, `thanSat.ts` đang ghi "Thụ Tử"
  "Sát nhập Trung Cung",
  "Bạch Hổ nhập Trung Cung",
];

/**
 * Hung tinh CHƯA CÓ QUY TẮC HOÁ GIẢI — không thuộc nhóm hoá giải được, cũng không thuộc nhóm
 * khẳng định không hoá giải được. Engine KHÔNG được tự quyết một trong hai.
 *
 * Chỉ đạo chủ dự án 2026-08-17: bảng phân loại có ghi Dương Công Kỵ là "✅ Có*" kèm chú "theo quy
 * tắc riêng", nhưng quy tắc riêng đó chưa được cung cấp. Cấm suy diễn rằng Sát Cống / Trực Tinh /
 * Nhân Chuyên hoá giải được nó; cũng cấm tự kết luận là không hoá giải được.
 *
 * Hệ quả bắt buộc:
 *   • Không bao giờ rơi vào `daHoaGiai` — kể cả khi ngày có đủ cả ba cát tinh.
 *   • Cảnh báo phải được GIỮ NGUYÊN, không bị xoá khi có Tam Đại Cát Tinh.
 *   • Ngày phạm không tự động thành "dùng được" chỉ vì có cát tinh.
 *
 * Khi chủ dự án cung cấp quy tắc thật, chỉ cần chuyển tên sao sang `HUNG_TINH_KHONG_HOA_GIAI`
 * (nếu không cứu được) hoặc bỏ khỏi mảng này (nếu là hung tinh thường) — không phải sửa engine.
 */
export const HUNG_TINH_CHUA_CO_QUY_TAC: readonly string[] = [
  "Dương Công Kỵ",
  "Dương Công Kỵ Nhật", // biến thể tên đang dùng ở lớp chấm điểm
];

/** Kết cục của một hung tinh sau khi áp quy tắc Tam Đại Cát Tinh. */
export type TrangThaiHoaGiai =
  /** Được Tam Đại Cát Tinh giảm/hoá. */
  | "HOA_GIAI"
  /** Nằm trong nhóm ngoại lệ — cát tinh không cứu được, giữ nguyên đại kỵ. */
  | "KHONG_HOA_GIAI"
  /** Chưa có quy tắc để kết luận — engine không được tự quyết. Cảnh báo phải giữ nguyên. */
  | "CHUA_CO_QUY_TAC_HOA_GIAI";

/** Một hung tinh kèm kết cục của nó — để tầng hiển thị nói đúng từng sao. */
export interface HungTinhSauHoaGiai {
  ten: string;
  trangThai: TrangThaiHoaGiai;
}

/**
 * Trước đây Sát/Bạch Hổ nhập Trung Cung nằm ở đây vì chưa có công thức. Nay ĐÃ CÓ — xem
 * `nhapTrungCung.ts`, công thức `(dayIndex + 5) % 9 === 0` chủ dự án cung cấp 2026-08-16.
 *
 * Giữ mảng rỗng thay vì xoá hẳn để tầng gọi (`thieuDuLieu`) không phải sửa, và để chỗ này còn dấu
 * vết nếu sau lại phát sinh ngoại lệ chưa có công thức.
 */
export const NGOAI_LE_CHUA_CO_CONG_THUC: readonly string[] = [];

export interface KetQuaHoaGiai {
  /** Có ít nhất một trong ba sao. */
  coTamDaiCatTinh: boolean;
  tenCatTinh: TenTamDaiCatTinh[];
  /** Hung tinh được giảm/hoá nhờ Tam Đại Cát Tinh. */
  daHoaGiai: string[];
  /** Hung tinh vẫn giữ nguyên vì nằm trong danh sách ngoại lệ. */
  khongHoaGiai: string[];
  /**
   * Hung tinh chưa có quy tắc hoá giải — engine không kết luận. Cảnh báo giữ nguyên, tầng gọi
   * PHẢI hiển thị và KHÔNG được coi như đã hoá giải.
   */
  chuaCoQuyTac: string[];
  /** Toàn bộ hung tinh kèm kết cục từng cái, đúng thứ tự đầu vào. */
  chiTiet: HungTinhSauHoaGiai[];
}

/** Phân loại một hung tinh — nguồn sự thật duy nhất cho cả 3 nhóm. */
export function phanLoaiHungTinh(ten: string, coTamDaiCatTinh: boolean): TrangThaiHoaGiai {
  // Xét "chưa có quy tắc" TRƯỚC mọi nhánh khác: kể cả khi không có cát tinh, kết luận vẫn là
  // "chưa biết", không được rơi vào nhánh mặc định nào.
  if (HUNG_TINH_CHUA_CO_QUY_TAC.includes(ten)) return "CHUA_CO_QUY_TAC_HOA_GIAI";
  if (!coTamDaiCatTinh) return "KHONG_HOA_GIAI";
  if (HUNG_TINH_KHONG_HOA_GIAI.includes(ten)) return "KHONG_HOA_GIAI";
  return "HOA_GIAI";
}

/**
 * Áp quy tắc hoá giải cho danh sách hung tinh của một ngày.
 *
 * Không có Tam Đại Cát Tinh thì mọi hung tinh giữ nguyên — hàm vẫn trả về đầy đủ để tầng gọi
 * không phải tự phân nhánh.
 */
export function apQuyTacHoaGiai(
  catTinh: readonly TamDaiCatTinhEntry[],
  hungTinh: readonly string[],
): KetQuaHoaGiai {
  const tenCatTinh = catTinh.map((c) => c.name);
  const coTamDaiCatTinh = tenCatTinh.length > 0;

  const daHoaGiai: string[] = [];
  const khongHoaGiai: string[] = [];
  const chuaCoQuyTac: string[] = [];
  const chiTiet: HungTinhSauHoaGiai[] = [];

  for (const ten of hungTinh) {
    const trangThai = phanLoaiHungTinh(ten, coTamDaiCatTinh);
    chiTiet.push({ ten, trangThai });
    if (trangThai === "HOA_GIAI") daHoaGiai.push(ten);
    else if (trangThai === "CHUA_CO_QUY_TAC_HOA_GIAI") chuaCoQuyTac.push(ten);
    else khongHoaGiai.push(ten);
  }

  return { coTamDaiCatTinh, tenCatTinh, daHoaGiai, khongHoaGiai, chuaCoQuyTac, chiTiet };
}
