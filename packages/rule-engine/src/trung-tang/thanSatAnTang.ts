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
 * ⚠️ THÁNG 7 = SỬU, THÁNG 8 = HỢI — chốt cuối cùng, chủ dự án khẳng định 2026-08-16 kèm chữ
 * "chốt". Hai tháng này từng bị lật qua lật lại, ghi đủ để sau không ai đổi nhầm lần nữa:
 *   - file `tang1-loc-than-sat-hung.md` của skill xem-ngay-cao-cap: T7 = Sửu, T8 = Hợi
 *   - dòng `_sua_sat_chu_am` trong bảng dữ liệu hợp nhất: "Công sửa: T7 = Hợi, T8 = Sửu"
 *   - bảng chủ dự án gửi 2026-08-15: T7 = Hợi, T8 = Sửu (khớp dòng sửa ở trên)
 *   - ✔ CHỐT 2026-08-16: T7 = SỬU, T8 = HỢI — tức quay về đúng bản của skill. Dòng
 *     `_sua_sat_chu_am` mới là chỗ sai, KHÔNG phải skill. Không tự ý đổi lại 2 tháng này.
 * Mười tháng còn lại thì mọi nguồn đều khớp, chưa bao giờ có tranh chấp.
 *
 * Bảng chủ dự án gửi cũng xác nhận cách đọc gây nhầm: tháng 1 = TI = Tỵ, tháng 2 = TY = Tý.
 */
export const SAT_CHU_AM_THEO_THANG: readonly Chi[] = [
  "Tỵ", // tháng 1
  "Tý",
  "Mùi",
  "Mão",
  "Thân",
  "Tuất",
  "Sửu", // tháng 7 — CHỐT 2026-08-16
  "Hợi", // tháng 8 — CHỐT 2026-08-16
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

/**
 * Hung KHÔNG hoá được — phần RIÊNG của việc TANG SỰ, chồng thêm lên danh sách dùng chung
 * `TrachNhat.HUNG_TINH_KHONG_HOA_GIAI` (Kim Thần Thất Sát · Sát Chủ · Thọ Tử · Sát/Bạch Hổ nhập
 * Trung Cung — đúng ba nhóm ngoại lệ trong sơ đồ chủ dự án).
 *
 * Bốn mục dưới đây KHÔNG nằm trong danh sách chung vì chúng chỉ có nghĩa với việc âm. Chủ dự án
 * được hỏi thẳng "mấy cái này thì sao không hoá được" và chốt 2026-08-16: "không hoá được nhé".
 */
export const TAM_CAT_KHONG_GIAI_DUOC_RIENG_TANG_SU: readonly string[] = [
  "Nguyệt Phá (Trực Phá)",
  "Trùng Nhật",
  "Phục Nhật",
  "Xung tuổi vong",
];

/** Nhóm thần sát mà nguồn ghi rõ KHÔNG hoá giải được — đã phạm là phải đổi ngày, không trấn yểm. */
export const KHONG_HOA_GIAI_DUOC: readonly string[] = ["Kim Thần Thất Sát", "Tam Sát", "Nguyệt Phá", "Đại Hao", "Trực Phá"];

/*
 * TẦNG 3 (Tam Sát theo TỌA huyệt) ĐÃ ĐƯỢC GỠ KHỎI PHASE 1 — chủ dự án chốt 2026-08-16:
 * "cái gì liên quan tọa hướng mộ thì phải để phase 2".
 *
 * Bảng `TAM_SAT_THEO_TOA` + `isTamSatTheoToa()` và ô nhập tọa trên form vẫn nằm nguyên trong lịch
 * sử git (commit "Thần sát theo 4 tầng + lớp phương vị"), Phase 2 lấy lại được, không phải dựng
 * lại từ đầu. Dữ liệu gốc: `tam_sat_theo_toa` trong bảng dữ liệu hợp nhất, và sách "Sổ Tay Tang
 * Sự" Ch.14 mục "Tam sát niên, tháng nhựt" (năm Tỵ-Dậu-Sửu → Tam Sát ở Đông phương, v.v.).
 */

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
 *
 * ✔ ĐỐI CHỨNG NGUỒN SÁCH (Ch.14): "Tứ tuyệt: 1 ngày trước Lập Xuân, Lập Hạ, Lập Thu, Lập Đông.
 * Tứ ly: 1 ngày trước Xuân Phân, Hạ Chí, Thu Phân, Đông Chí." — khớp nguyên văn định nghĩa đang cài.
 */
export const TIET_TU_TUYET: readonly string[] = ["Lập Xuân", "Lập Hạ", "Lập Thu", "Lập Đông"];
export const TIET_TU_LY: readonly string[] = ["Xuân Phân", "Hạ Chí", "Thu Phân", "Đông Chí"];

/* ------------------------------------------------------------------------------------------
 * BỘ BẢNG CHỦ DỰ ÁN CUNG CẤP 2026-08-15 (dạng mã GIAP/AT/... đã quy về tên tiếng Việt).
 *
 * Bản gốc dùng `TY` cho CẢ Tý lẫn Tỵ, trong khi bảng quy ước kèm theo ghi Tý = `TY` (子) và
 * Tỵ = `TI` (巳). Các chỗ nhập nhằng được giải bằng QUY LUẬT NỘI TẠI của từng bảng, sau đó
 * CHỦ DỰ ÁN ĐÃ XÁC NHẬN LẠI TOÀN BỘ ngày 2026-08-15 — khớp đúng cách giải, không phải sửa gì:
 *   - `nguyet_yem`  T6 = Tỵ  (chuỗi đi lùi liên tục từ Tuất)
 *   - `nguyet_hai`  T1 = Tỵ  (chuỗi đi lùi từ Tỵ)
 *   - `nguyet_hinh` T1 = Tỵ
 *   - `tu_phe` mùa Đông = Bính Ngọ + Đinh Tỵ (Đông thuộc thuỷ, hoả tử)
 *
 * ⚠️ Riêng `tue_sat`: bản JSON ĐẦU TIÊN có khoá "TY" LẶP 2 LẦN — parse thẳng thì cái sau đè cái
 * trước, Tý nhận nhầm giá trị của Tỵ (Mùi -> Thìn) mà không có lỗi nào báo. Chủ dự án đã gửi lại
 * bản sửa dạng MẢNG theo nhóm tam hợp (hết trùng khoá), đối chiếu KHỚP 4/4 nhóm với bảng bên dưới.
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

/**
 * TẦNG 2 — Tứ Phế: cặp Can Chi ngày "tử" theo mùa (mùa lấy theo TIẾT KHÍ, không theo tháng lịch).
 *
 * ✔ ĐỐI CHỨNG NGUỒN SÁCH (Ch.14, dòng "Chánh Tứ Phế"): Xuân = Canh Thân/Tân Dậu, Hạ = Nhâm Tý/
 * Quý Hợi, Thu = Giáp Dần/Ất Mão, Đông = Bính Ngọ/Đinh Tỵ — khớp 4/4 mùa với bảng chủ dự án gửi,
 * và xác nhận luôn mùa Đông là Đinh TỴ (không phải Đinh Tý).
 */
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

/*
 * TAM ĐẠI CÁT TINH (Sát Cống · Trực Tinh · Nhân Chuyên) KHÔNG khai báo ở đây.
 *
 * Đây là thần sát TRẠCH NHẬT DÙNG CHUNG, không riêng việc âm — mọi module (xem ngày cao cấp, ký
 * hợp đồng, khai trương...) đều dùng được. Nên bảng + quy tắc hoá giải nằm ở tầng dùng chung
 * `trach-nhat/tamDaiCatTinh.ts`: `getTamDaiCatTinhTrongNgay()`, `apQuyTacHoaGiai()`,
 * `HUNG_TINH_KHONG_HOA_GIAI`.
 *
 * Đã đối chiếu runtime trước khi gỡ bản sao: 3 bảng x 3 nhóm tháng = 9/9 GIỐNG HỆT nhau. Giữ một
 * nguồn duy nhất để chủ dự án sửa bảng một lần là cả site đổi theo, không phải chép sang từng module.
 */

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

/* ------------------------------------------------------------------------------------------
 * CỐ Ý CHƯA CÀI — ghi lại để lần sau không ai "tiện tay" thêm vào sai chỗ:
 *
 * 1. NGŨ HOÀNG — chủ dự án chốt 2026-08-16: để dành cho PHASE 2 (module tọa hướng mộ theo Huyền
 *    Không Đại Quái). Dữ liệu cửu cung năm/tháng đã có sẵn trong `xem-ngay-cao-cap/` nên nối sang
 *    được về mặt kỹ thuật, nhưng Ngũ Hoàng là chuyện phương vị chuyên sâu, thuộc phạm vi Phase 2 —
 *    KHÔNG cài vào module này.
 *
 * 2. DIỆT SÁT, NGŨ MỘ, TRÙNG PHỤC, TỨ KỴ — chưa có bảng tra. Sách "Sổ Tay Tang Sự" chỉ NÊU TÊN
 *    trong danh sách kiêng của mục cải táng, không kèm bảng; bảng dữ liệu hợp nhất cũng không có.
 *    Không tự dựng bảng theo trí nhớ — chờ chủ dự án cung cấp.
 *    (Lưu ý: Tuế Sát và Kiếp Sát thì ĐÃ có, nằm trong bộ Tam Sát; "Diệt Sát" có thể là tên gọi
 *    khác của Tai Sát trong cùng bộ đó, nhưng chưa đủ căn cứ để khẳng định nên không gộp.)
 *
 * 3. PHỦ ĐẦU SÁT / ĐAO CÔ SÁT / LỖ BANG SÁT — sách CÓ bảng đủ (Ch.14, theo 4 mùa), nhưng nằm ở
 *    mục "Khởi công làm mả — KỴ", tức phạm vi KHỞI CÔNG XÂY MỘ, không phải hạ huyệt/an táng. Theo
 *    đúng nguyên tắc "thần sát phải đứng trong đúng phạm vi tác dụng", không đưa vào module này.
 *    Khi nào làm module chọn ngày khởi công xây mộ thì lấy bảng đó ra dùng.
 *
 * 4. SÁT CỐNG / TRỰC TINH / NHÂN CHUYÊN — chủ dự án chốt 2026-08-16: "bỏ qua, anh sẽ bổ sung".
 *    Đã tra kỹ: KHÔNG có trong bảng dữ liệu hợp nhất, KHÔNG có trong sách "Sổ Tay Tang Sự", cũng
 *    không có trong mã nguồn (kể cả tra theo tên anh em cùng vòng: Yêu tinh, Hoặc tinh, Hòa đao,
 *    Bốc mộc, Giác kỷ, Lập tảo). Chỉ tìm được đúng MỘT chỗ, trong "Kỳ Môn Độn Giáp Bí Kíp Đại
 *    Toàn" Quyển 11 mục "Lệ khởi Nhân chuyên Sát Cống": vòng 9 sao luân theo ngày, khởi điểm đổi
 *    theo tháng Mạnh/Trọng/Quý tính từ ngày Giáp Tý, trong đó Sát Cống–Thanh Long, Trực Tinh–Kim
 *    Quỹ, Nhân Chuyên–Kim Đường là ba sao ghép hoàng đạo.
 *    KHÔNG tự bê sang vì (a) đó là hệ KỲ MÔN, khác phạm vi việc âm của module này, và (b) bản OCR
 *    ghi sai tên ("Trục tinh", "Nhân chuyền", "Dác kỷ") mà chỉ có một nguồn nên không đối chiếu
 *    chéo được — chờ chủ dự án cung cấp bảng chuẩn.
 *
 * 5. CỬU PHI CUNG THANH LONG BẠCH HỔ — ĐÃ CHỐT 2026-08-16: "bỏ cửu phi cung đi, chưa tính vội".
 *    Sách (Ch.1 §6 và Ch.19) nói giờ hạ huyệt lấy theo "giờ Bạch Hổ nhập địa" của hệ này (rơi
 *    Càn/Khảm/Cấn), KHÁC hệ chưởng pháp module đang chạy. Đây là sai lệch CÓ Ý THỨC so với câu
 *    chữ sách, chủ dự án biết và chấp nhận: giờ động quan vẫn trừ lùi từ giờ hạ huyệt của chưởng
 *    pháp. Không cài Cửu Phi Cung cho tới khi có yêu cầu mới.
 * ------------------------------------------------------------------------------------------ */
