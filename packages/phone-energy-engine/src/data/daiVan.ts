/**
 * Vận thế (đại vận) tính từ 12 số CCCD + nhu cầu từ trường theo giai đoạn tuổi.
 *
 * Nguồn: `data/dai-van-tuoi.md`, chủ dự án cung cấp 2026-08-17.
 *
 * ⚠️ Công thức này tính vận thế của CHÍNH NGƯỜI ĐÓ từ CCCD (Tiên Thiên) — không phải cách gán tuổi
 * cho từng cặp trong số điện thoại, và cũng không dùng cách tách "cặp gốc bỏ qua 0/5" của Bát tinh.
 */
import type { TenTinh } from "../types.js";

/** Số cặp trượt tối đa dựng được từ 12 chữ số CCCD. */
export const SO_CAP_TOI_DA = 11;

/** Cặp đầu tiên phủ 10 năm đầu đời. */
export const SO_NAM_CAP_DAU = 10;

/** Mỗi cặp sau phủ 5 năm. */
export const SO_NAM_MOI_CAP = 5;

/** Cặp có chứa số 5 thì cộng thêm 10 năm, thành 15 năm. */
export const SO_NAM_CONG_THEM_NEU_CO_5 = 10;

export interface NhuCauGiaiDoan {
  tuTuoi: number;
  denTuoi: number;
  nhuCau: string;
  catTinhUuTien: readonly TenTinh[];
  ghiChu?: string;
}

export const NHU_CAU_THEO_TUOI: readonly NhuCauGiaiDoan[] = [
  {
    tuTuoi: 20,
    denTuoi: 30,
    nhuCau: "Tình yêu và sự nghiệp",
    catTinhUuTien: ["Thiên Y", "Sinh Khí"],
  },
  {
    tuTuoi: 30,
    denTuoi: 40,
    nhuCau: "Sự nghiệp và tài phú",
    catTinhUuTien: ["Diên Niên", "Thiên Y"],
  },
  {
    tuTuoi: 40,
    denTuoi: 60,
    nhuCau: "Ổn định tài phú và sức khỏe",
    catTinhUuTien: ["Diên Niên"],
    ghiChu: "hạn chế Họa Hại và Lục Sát",
  },
  {
    tuTuoi: 60,
    denTuoi: 200,
    nhuCau: "Tâm linh, an yên nội tâm",
    catTinhUuTien: ["Phục Vị"],
    ghiChu: "hạn chế các hung tinh biến động như Ngũ Quỷ, Tuyệt Mệnh",
  },
];

/**
 * Vượt quá 11 cặp (khoảng trên 55-60 tuổi) — chủ dự án CHỐT 2026-08-17: trả `thieuDuLieu`,
 * KHÔNG áp quy tắc "lấy số cuối CCCD ghép số 1" vì quy tắc đó chưa được xác nhận chắc chắn.
 */
export const MA_THIEU_DU_LIEU_VUOT_TUOI = "van_the_vuot_11_cap";

export const MO_TA_THIEU_DU_LIEU_VUOT_TUOI =
  "Tuổi hiện tại vượt quá phạm vi 11 cặp mà 12 số căn cước phủ được. Tài liệu có nêu một quy tắc nối tiếp nhưng chưa được xác nhận chắc chắn, nên phần vận thế sau mốc này chưa luận được.";
