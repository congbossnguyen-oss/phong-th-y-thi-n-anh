/**
 * THẦN SÁT AN TÁNG — bảng tra riêng cho việc ÂM (an táng, đào huyệt, nhập quan, đưa tang),
 * lấy từ khối `than_sat_an_tang` trong "bảng dữ liệu hợp nhất" chủ dự án cung cấp 2026-08-15.
 *
 * Vì sao đặt ở `trung-tang/` chứ không nhét vào `trach-nhat/`: các bảng dưới đây CHỈ đúng cho
 * việc âm. Riêng Sát Chủ có tới 4 hệ và chúng KHÁC nhau — `trach-nhat/satChu.ts` đang cài hệ
 * theo MÙA (dùng cho việc dương: khai trương, động thổ), không dùng được cho an táng.
 *
 * Cấu hình Sát Chủ đã được chủ dự án CHỐT (ghi trong `_meta.canh_bao` của bảng dữ liệu):
 *   - hệ ÂM  → LOẠI NGÀY
 *   - Giờ Sát Chủ → LOẠI GIỜ
 *   - hệ DƯƠNG → chỉ cảnh báo mềm, và theo `ghi_chu_pham_vi` thì việc dương không thuộc phạm vi
 *     module này nên không cài
 *   - hệ MÙA → TẮT
 *
 * Các bảng đã có sẵn ở `trach-nhat/` và ĐÃ ĐỐI CHIẾU KHỚP với bảng dữ liệu mới, nên dùng lại,
 * không chép lại ở đây: `kimThanThatSat.ts`, `tamNuong.ts`, `nguyetKy.ts`.
 */
import type { Data } from "@thien-anh/calendar-core";
import {
  TUE_DUC_THEO_CAN_NAM,
  TUE_DUC_HOP_THEO_CAN_NAM,
  NGUYET_DUC_THEO_THANG,
  NGUYET_DUC_HOP_THEO_THANG,
} from "../trach-nhat/catTinhTheoCan.js";

type Can = Data.Can;
type Chi = Data.Chi;

/**
 * NHÓM VIỆC mà Sát Chủ Âm thực sự chi phối (chủ dự án cung cấp 2026-08-15). Đây là điểm cốt lõi
 * của kiến trúc "thần sát × loại việc": KHÔNG phải cứ phạm là trừ điểm cho mọi việc như nhau —
 * cùng một ngày Sát Chủ Âm thì đánh rất nặng khi xét hạ huyệt/an táng, nhưng không được mang
 * cùng trọng số đó sang việc dương như ký hợp đồng, khai trương.
 *
 * Khai báo tường minh ngay cạnh bảng để luật này không bị dùng lan sang module việc dương. Module
 * giờ liệm – đóng quan – hạ huyệt nằm trọn trong nhóm này nên áp mức nặng nhất (loại thẳng).
 */
export const SAT_CHU_AM_NHOM_VIEC: readonly string[] = [
  "an_tang",
  "ha_huyet",
  "nhap_quan",
  "dong_quan",
  "cai_tang",
  "boc_mo",
  "dao_huyet",
  "xay_mo",
  "lap_ban_tho",
  "an_vi_bat_huong",
  "an_tuong",
];

/** Sát Chủ Âm có chi phối loại việc này không — dùng trước khi áp luật ở bất kỳ module nào khác. */
export function satChuAmApDungCho(loaiViec: string): boolean {
  return SAT_CHU_AM_NHOM_VIEC.includes(loaiViec);
}

/**
 * Sát Chủ ÂM theo tháng âm lịch — hệ dùng CHÍNH cho an táng. Độ tin cậy chủ dự án đánh giá mức B
 * ("đã xác nhận bảng truyền thống").
 *
 * ⚠️ Tháng 7 = Hợi, tháng 8 = Sửu là theo bản CHỦ DỰ ÁN ĐÃ SỬA (ghi trong `_sua_sat_chu_am`).
 * Một số nguồn khác (kể cả file của skill xem-ngay-cao-cap trong dự án) ghi ngược lại
 * T7 = Sửu, T8 = Hợi. Mười tháng còn lại thì mọi nguồn đều khớp. Không tự ý đổi 2 tháng này.
 *
 * Bảng riêng chủ dự án gửi 2026-08-15 (dạng mã TI/TY/...) đã đối chiếu KHỚP 12/12 với bảng này,
 * và xác nhận luôn cách đọc gây nhầm: tháng 1 = TI = Tỵ, tháng 2 = TY = Tý.
 */
export const SAT_CHU_AM_THEO_THANG: readonly Chi[] = [
  "Tỵ", // tháng 1
  "Tý",
  "Mùi",
  "Mão",
  "Thân",
  "Tuất",
  "Hợi", // tháng 7 — chủ dự án sửa
  "Sửu", // tháng 8 — chủ dự án sửa
  "Ngọ",
  "Dậu",
  "Dần",
  "Thìn", // tháng 12
];

/** Giờ Sát Chủ theo tháng âm lịch — loại thẳng Chi giờ này. */
export const GIO_SAT_CHU_THEO_THANG: readonly Chi[] = [
  "Dần", // tháng 1
  "Tỵ",
  "Thân",
  "Thìn",
  "Dậu",
  "Mão",
  "Dần", // tháng 7 (lặp lại chu kỳ 6 tháng)
  "Tỵ",
  "Thân",
  "Thìn",
  "Dậu",
  "Mão", // tháng 12
];

/** Thổ Tú theo tháng âm lịch — kỵ động thổ/đào huyệt. Là một cặp Can Chi ngày trọn vẹn. */
export const THO_TU_THEO_THANG: readonly { can: Can; chi: Chi }[] = [
  { can: "Bính", chi: "Tuất" }, // tháng 1
  { can: "Nhâm", chi: "Thìn" },
  { can: "Tân", chi: "Hợi" },
  { can: "Đinh", chi: "Tỵ" },
  { can: "Mậu", chi: "Tý" },
  { can: "Bính", chi: "Ngọ" },
  { can: "Ất", chi: "Sửu" },
  { can: "Quý", chi: "Mùi" },
  { can: "Giáp", chi: "Dần" },
  { can: "Mậu", chi: "Thân" },
  { can: "Tân", chi: "Mão" },
  { can: "Tân", chi: "Dậu" }, // tháng 12
];

/**
 * Trực kỵ an táng. Lưu ý CHÍNH TẢ: bảng dữ liệu ghi "Thâu", còn bộ Trực đang chạy trong dự án
 * (`trach-nhat/truc.ts`) đặt tên "Thu" — cùng một Trực, dùng tên của dự án để so khớp được.
 */
export const TRUC_KY_AN_TANG: readonly string[] = ["Khai", "Thu"];

/** Trực Phá — nằm trong nhóm "không hoá giải được", nặng hơn 2 Trực kỵ ở trên. */
export const TRUC_KHONG_HOA_GIAI: readonly string[] = ["Phá"];

/**
 * Hắc đạo kỵ an táng (5/6 sao hắc đạo, trừ Chu Tước). Tên đã quy về đúng bộ tên đang hiển thị
 * trên site: bảng dữ liệu ghi "Huyền Vũ"/"Câu Trận", dự án dùng "Nguyên Vũ"/"Câu Trần".
 */
export const HAC_DAO_KY_AN_TANG: ReadonlySet<string> = new Set(["Bạch Hổ", "Nguyên Vũ", "Câu Trần", "Thiên Hình", "Thiên Lao"]);

/** Nhóm thần sát mà nguồn ghi rõ KHÔNG hoá giải được — đã phạm là phải đổi ngày, không trấn yểm. */
export const KHONG_HOA_GIAI_DUOC: readonly string[] = ["Kim Thần Thất Sát", "Tam Sát", "Nguyệt Phá", "Đại Hao", "Trực Phá"];

/**
 * TẦNG 3 — Tam Sát theo TỌA huyệt (`tam_sat_theo_toa`). Đây là lớp "phương vị" mà chủ dự án nhấn
 * mạnh: không thể chỉ `ngày → thần sát → điểm`, phải có `ngày + tọa huyệt → luật riêng theo hướng`.
 *
 * Mỗi tọa kỵ trọn một bộ tam hợp. Ba chi trong bộ đó chính là ba sao của Tam Sát (Kiếp Sát – Tai
 * Sát – Tuế Sát), nên cài bảng này là đã phủ luôn ba tên gọi đó ở phạm vi phương vị.
 *
 * `kien_truc_danh_gia.buoc_1_hard_constraint` xếp Tam Sát vào nhóm "không hoá giải được" → LOẠI.
 */
export type ToaHuyet = "Đông" | "Tây" | "Nam" | "Bắc";

export const TAM_SAT_THEO_TOA: Readonly<Record<ToaHuyet, readonly Chi[]>> = {
  "Đông": ["Tỵ", "Dậu", "Sửu"],
  "Tây": ["Hợi", "Mão", "Mùi"],
  "Nam": ["Thân", "Tý", "Thìn"],
  "Bắc": ["Dần", "Ngọ", "Tuất"],
};

export function isTamSatTheoToa(chi: Chi, toa: ToaHuyet): boolean {
  return (TAM_SAT_THEO_TOA[toa] as readonly Chi[]).includes(chi);
}

/**
 * TẦNG 1 — Thái Tuế / Tuế Phá ở phạm vi NGÀY.
 *
 * Không phải bảng tra mà là quan hệ định nghĩa: ngày Thái Tuế = Chi ngày trùng Chi năm hành sự;
 * ngày Tuế Phá = Chi ngày xung Chi năm. Vì là quan hệ chứ không phải số liệu, cài được mà không
 * phải suy diễn thêm dữ liệu nào.
 */
export function isNgayThaiTue(chiNgay: Chi, chiNam: Chi): boolean {
  return chiNgay === chiNam;
}

/**
 * TẦNG 1 — Tứ Tuyệt / Tứ Ly. Cũng là ĐỊNH NGHĨA chứ không phải bảng tra:
 *
 * - Tứ Tuyệt = ngày liền TRƯỚC 4 tiết Lập Xuân / Lập Hạ / Lập Thu / Lập Đông (khí mùa cũ dứt).
 * - Tứ Ly    = ngày liền TRƯỚC Xuân Phân / Hạ Chí / Thu Phân / Đông Chí (âm dương phân ly).
 *
 * Ở đây chỉ khai báo TÊN TIẾT; việc quy ra ngày dương lịch thật do tầng facade làm, vì rule-engine
 * là hàm thuần, không tự đi tính thiên văn.
 */
export const TIET_TU_TUYET: readonly string[] = ["Lập Xuân", "Lập Hạ", "Lập Thu", "Lập Đông"];
export const TIET_TU_LY: readonly string[] = ["Xuân Phân", "Hạ Chí", "Thu Phân", "Đông Chí"];

/* ------------------------------------------------------------------------------------------
 * BỘ BẢNG CHỦ DỰ ÁN CUNG CẤP 2026-08-15 (dạng mã GIAP/AT/... đã quy về tên tiếng Việt).
 *
 * ⚠️ Bản gốc dùng `TY` cho CẢ Tý lẫn Tỵ, trong khi bảng quy ước kèm theo ghi Tỵ = `TI`. Chỗ nào
 * nhập nhằng đã được giải bằng QUY LUẬT NỘI TẠI của chính bảng đó (không đoán):
 *   - `tue_sat`: JSON có khoá "TY" LẶP 2 LẦN (nếu parse thẳng thì Tý bị đè thành Thìn). Giải theo
 *     tam hợp: Thân-Tý-Thìn→Mùi, Dần-Ngọ-Tuất→Sửu, Tỵ-Dậu-Sửu→Thìn, Hợi-Mão-Mùi→Tuất.
 *   - `nguyet_yem`: là chuỗi ĐI LÙI liên tục từ Tuất, nên T6 = Tỵ, T11 = Tý.
 *   - `nguyet_hai`: chuỗi đi lùi từ Tỵ, nên T1 = Tỵ, T6 = Tý.
 *   - `nguyet_hinh`: T1 = Tỵ, T2 = Tý.
 *   - `tu_phe` mùa Đông: Bính Ngọ + Đinh **Tỵ** (Đông thuộc thủy, hoả tử).
 * Tất cả các điểm này CẦN CHỦ DỰ ÁN XÁC NHẬN LẠI.
 *
 * Hai bảng dùng để đối chứng đã khớp 100% với thứ đang chạy trong dự án, cho thấy cùng một nguồn:
 * `phuc_nhat` trùng `CAN_PHUC_NHAT_THEO_THANG`, và `nguyet_duc` khớp quy tắc tam hợp với quy ước
 * tháng 1 = Dần (giống `CHI_THANG_CO_DINH`).
 * ------------------------------------------------------------------------------------------ */

/**
 * TẦNG 4 — cát thần Tuế Đức / Tuế Đức Hợp / Nguyệt Đức / Nguyệt Đức Hợp KHÔNG khai báo lại ở đây.
 * Bốn bảng này đã có trong `trach-nhat/catTinhTheoCan.ts` (cùng nguồn chủ dự án cung cấp
 * 2026-08-15, đã đối chiếu khớp 100%). Giữ MỘT nguồn duy nhất để sau này chủ dự án sửa bảng thì
 * không có bản sao nào âm thầm lệch đi — `tinhCatThanNgay` bên dưới đọc thẳng từ đó.
 */
/** TẦNG 1 — Tuế Sát theo CHI NĂM (giải từ tam hợp, xem ghi chú khoá lặp ở trên). */
export const TUE_SAT_THEO_CHI_NAM: Readonly<Record<Chi, Chi>> = {
  "Dần": "Sửu", "Ngọ": "Sửu", "Tuất": "Sửu",
  "Thân": "Mùi", "Tý": "Mùi", "Thìn": "Mùi",
  "Tỵ": "Thìn", "Dậu": "Thìn", "Sửu": "Thìn",
  "Hợi": "Tuất", "Mão": "Tuất", "Mùi": "Tuất",
};

/** TẦNG 1 — Nguyệt Yếm theo tháng (chuỗi đi lùi từ Tuất). */
export const NGUYET_YEM_THEO_THANG: readonly Chi[] = ["Tuất", "Dậu", "Thân", "Mùi", "Ngọ", "Tỵ", "Thìn", "Mão", "Dần", "Sửu", "Tý", "Hợi"];

/** TẦNG 2 — Nguyệt Hình / Nguyệt Hại theo tháng. */
export const NGUYET_HINH_THEO_THANG: readonly Chi[] = ["Tỵ", "Tý", "Thìn", "Thân", "Ngọ", "Sửu", "Dần", "Dậu", "Mùi", "Hợi", "Mão", "Tuất"];
export const NGUYET_HAI_THEO_THANG: readonly Chi[] = ["Tỵ", "Thìn", "Mão", "Dần", "Sửu", "Tý", "Hợi", "Tuất", "Dậu", "Thân", "Mùi", "Ngọ"];

/** TẦNG 2 — Tứ Phế: cặp Can Chi ngày "tử" theo mùa (mùa lấy theo TIẾT KHÍ, không theo tháng lịch). */
export type MuaTuPhe = "Xuân" | "Hạ" | "Thu" | "Đông";
export const TU_PHE_THEO_MUA: Readonly<Record<MuaTuPhe, readonly { can: Can; chi: Chi }[]>> = {
  "Xuân": [{ can: "Canh", chi: "Thân" }, { can: "Tân", chi: "Dậu" }],
  "Hạ": [{ can: "Nhâm", chi: "Tý" }, { can: "Quý", chi: "Hợi" }],
  "Thu": [{ can: "Giáp", chi: "Dần" }, { can: "Ất", chi: "Mão" }],
  "Đông": [{ can: "Bính", chi: "Ngọ" }, { can: "Đinh", chi: "Tỵ" }],
};

export function isTueSat(chiNgay: Chi, chiNam: Chi): boolean {
  return TUE_SAT_THEO_CHI_NAM[chiNam] === chiNgay;
}
export function isNguyetYem(chiNgay: Chi, thangAmLich: number): boolean {
  return NGUYET_YEM_THEO_THANG[thangAmLich - 1] === chiNgay;
}
export function isNguyetHinh(chiNgay: Chi, thangAmLich: number): boolean {
  return NGUYET_HINH_THEO_THANG[thangAmLich - 1] === chiNgay;
}
export function isNguyetHai(chiNgay: Chi, thangAmLich: number): boolean {
  return NGUYET_HAI_THEO_THANG[thangAmLich - 1] === chiNgay;
}
export function isTuPhe(canNgay: Can, chiNgay: Chi, mua: MuaTuPhe): boolean {
  return TU_PHE_THEO_MUA[mua].some((e) => e.can === canNgay && e.chi === chiNgay);
}

/** Cát thần đạt được của một ngày — dùng ở tầng 4 để nâng điểm / "hung hoá cát". */
export interface CatThanNgay {
  tueDuc: boolean;
  tueDucHop: boolean;
  nguyetDuc: boolean;
  nguyetDucHop: boolean;
}

export function tinhCatThanNgay(canNgay: Can, canNam: Can, thangAmLich: number): CatThanNgay {
  return {
    tueDuc: TUE_DUC_THEO_CAN_NAM[canNam] === canNgay,
    tueDucHop: TUE_DUC_HOP_THEO_CAN_NAM[canNam] === canNgay,
    nguyetDuc: NGUYET_DUC_THEO_THANG[thangAmLich - 1] === canNgay,
    nguyetDucHop: NGUYET_DUC_HOP_THEO_THANG[thangAmLich - 1] === canNgay,
  };
}

export function isSatChuAm(chiNgay: Chi, thangAmLich: number): boolean {
  return SAT_CHU_AM_THEO_THANG[thangAmLich - 1] === chiNgay;
}

export function isGioSatChu(chiGio: Chi, thangAmLich: number): boolean {
  return GIO_SAT_CHU_THEO_THANG[thangAmLich - 1] === chiGio;
}

export function isThoTu(canNgay: Can, chiNgay: Chi, thangAmLich: number): boolean {
  const e = THO_TU_THEO_THANG[thangAmLich - 1]!;
  return e.can === canNgay && e.chi === chiNgay;
}

export function isTrucKyAnTang(tenTruc: string): boolean {
  return TRUC_KY_AN_TANG.includes(tenTruc);
}

export function isTrucKhongHoaGiai(tenTruc: string): boolean {
  return TRUC_KHONG_HOA_GIAI.includes(tenTruc);
}

export function isHacDaoKyAnTang(tenSao: string): boolean {
  return HAC_DAO_KY_AN_TANG.has(tenSao);
}

/** Cảnh báo mềm gắn trên 1 ứng viên ngày/giờ — hiện nhãn cho gia chủ, KHÔNG tự loại. */
export interface CanhBaoThanSat {
  ma: string;
  nhan: string;
  /** true nếu nguồn ghi rõ không hoá giải được (đã bị loại thẳng, chỉ để giải thích lý do). */
  khongHoaGiai?: boolean;
}
