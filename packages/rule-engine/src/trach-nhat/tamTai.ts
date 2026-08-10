/**
 * Tam Tai — hạn 3 năm liên tiếp theo nhóm tuổi Tam Hợp cục (Thân-Tý-Thìn / Dần-Ngọ-Tuất /
 * Tỵ-Dậu-Sửu / Hợi-Mão-Mùi).
 *
 * Nguồn: "Ngọc Hạp Thông Thư – Hứa Chân Quân" (bản OCR), mục "TAM TAI HẠN KỲ ĐẠO TRẠCH THU
 * THÊ": "Thân Tý Thìn sinh người Dần, Mão, Thìn vi tam tai. Hợi, Mão, Mùi sinh Tý, Ngọ Mùi vi
 * tam tai. Dần, Ngọ, Tuất sinh Thân, Dậu, Sửu vi tam tai. Tỵ, Dậu, Sửu sinh người Hợi, Mão,
 * Mùi vi tam tai."
 *
 * ⚠️ Ghi nhận nghi vấn OCR: 2/4 nhóm dưới đây (Dần-Ngọ-Tuất, Hợi-Mão-Mùi) lệch với bảng Tam
 * Tai phổ biến ở đa số lịch vạn niên khác (bản phổ biến: Dần-Ngọ-Tuất → tam tai tại
 * Thân-Dậu-TUẤT [sách này ghi Sửu]; Hợi-Mão-Mùi → tam tai tại TỴ-Ngọ-Mùi [sách này ghi Tý]).
 * Giữ nguyên đúng văn bản gốc theo yêu cầu "bổ sung Ngọc Hạp Thông Thư", KHÔNG tự sửa theo
 * bản phổ biến — cần đối chiếu thêm nếu phát hiện sai lệch qua phản hồi thực tế.
 */
import { Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

export interface TamTaiGroup {
  /** 3 Chi hợp thành nhóm tuổi (tam hợp cục). */
  nhomTuoi: readonly [Chi, Chi, Chi];
  /** 3 Chi năm bị Tam Tai đối với nhóm tuổi này. */
  tamTaiTai: readonly [Chi, Chi, Chi];
}

export const TAM_TAI_GROUPS: readonly TamTaiGroup[] = [
  { nhomTuoi: ["Thân", "Tý", "Thìn"], tamTaiTai: ["Dần", "Mão", "Thìn"] },
  { nhomTuoi: ["Dần", "Ngọ", "Tuất"], tamTaiTai: ["Thân", "Dậu", "Sửu"] },
  { nhomTuoi: ["Tỵ", "Dậu", "Sửu"], tamTaiTai: ["Hợi", "Mão", "Mùi"] },
  { nhomTuoi: ["Hợi", "Mão", "Mùi"], tamTaiTai: ["Tý", "Ngọ", "Mùi"] },
] as const;

/** (Các) nhóm tuổi đang phạm Tam Tai trong năm có Chi cho trước. */
export function getNhomTuoiPhamTamTai(namChi: Chi): readonly (readonly [Chi, Chi, Chi])[] {
  return TAM_TAI_GROUPS.filter((g) => (g.tamTaiTai as readonly Chi[]).includes(namChi)).map((g) => g.nhomTuoi);
}
