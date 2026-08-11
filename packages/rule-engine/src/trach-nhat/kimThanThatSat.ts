/**
 * Kim Thần Thất Sát — kỵ theo nhóm Can NĂM SINH của gia chủ, đối chiếu với Can-Chi NGÀY hiện
 * tại. Không cần biết năm sinh cụ thể để tra: cho 1 ngày bất kỳ, hàm dưới trả về (các) nhóm
 * Can năm sinh đang bị kỵ vào đúng ngày đó.
 *
 * Nguồn: "Ngọc Hạp Thông Thư – Hứa Chân Quân" (bản OCR), mục "CHIÊM KIM THẦN THẤT SÁT KỴ
 * PHÁP": "Giáp Kỷ niên ngày Ngọ Mùi. Ất Canh niên ngày Thìn Tỵ. Bính Tân niên ngày Tý Sửu +
 * Dần Mão. Đinh Nhâm niên ngày Tuất Hợi. Mậu Quý niên ngày Thân Dậu." Kỵ: động thổ, tu tạo.
 * Chủ dự án xác nhận lại đúng bộ dữ liệu này lần thứ 2 (2026-08-11, độc lập với lần xác nhận
 * đầu 2026-08-10), kèm danh sách việc đại kỵ chi tiết hơn (dùng để hiển thị trên giao diện,
 * xem `phong-thuy-thien-anh/src/pages/xem-ngay-tot-xau.astro`): xây/sửa nhà (động thổ, cất
 * nóc, đổ mái, nhập trạch), cưới hỏi (đám cưới, ăn hỏi), kinh doanh/xuất hành (khai trương, ký
 * hợp đồng lớn, đi xa), an táng (chôn cất, mai táng).
 *
 * ⚠️ Nhóm "Bính-Tân" sách ghi 4 Chi (Tý Sửu Dần Mão) trong khi 4 nhóm còn lại chỉ có 2 Chi
 * mỗi nhóm — giữ nguyên như sách, không tự cắt bớt cho đều.
 */
import { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

export interface KimThanThatSatGroup {
  canNamSinh: readonly Can[];
  chiNgayKy: readonly Chi[];
}

export const KIM_THAN_THAT_SAT: readonly KimThanThatSatGroup[] = [
  { canNamSinh: ["Giáp", "Kỷ"], chiNgayKy: ["Ngọ", "Mùi"] },
  { canNamSinh: ["Ất", "Canh"], chiNgayKy: ["Thìn", "Tỵ"] },
  { canNamSinh: ["Bính", "Tân"], chiNgayKy: ["Tý", "Sửu", "Dần", "Mão"] },
  { canNamSinh: ["Đinh", "Nhâm"], chiNgayKy: ["Tuất", "Hợi"] },
  { canNamSinh: ["Mậu", "Quý"], chiNgayKy: ["Thân", "Dậu"] },
] as const;

/** (Các) Can năm sinh bị kỵ Kim Thần Thất Sát vào ngày có Chi cho trước. */
export function getCanNamSinhKyKimThanThatSat(dayChi: Chi): readonly Can[] {
  return KIM_THAN_THAT_SAT.filter((g) => g.chiNgayKy.includes(dayChi)).flatMap((g) => g.canNamSinh);
}
