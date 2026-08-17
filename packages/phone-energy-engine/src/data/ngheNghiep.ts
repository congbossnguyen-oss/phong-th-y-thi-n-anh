/**
 * Nhóm nghề nghiệp và năng lượng hợp / cản với từng nhóm.
 *
 * ⚠️ NGUYÊN TẮC: mỗi ánh xạ dưới đây phải trích được từ mục **Sự nghiệp / Tài vận / Quý nhân** của
 * `mo-ta-8-tinh.md`. Trường `canCu` giữ nguyên văn câu gốc để sau này rà lại được. Không tự nghĩ ra
 * nghề nào mà tài liệu không nói tới.
 *
 * Danh sách nhóm cố ý ngắn và rộng: khách chọn từ danh sách thì engine mới đối chiếu được, còn để
 * khách gõ tự do thì không có cách nào khớp mà không đoán.
 */
import type { TenTinh } from "../types.js";

export interface NhomNghe {
  ma: string;
  ten: string;
  /** Năng lượng đẩy nghề này đi lên. */
  tinhHopNhat: readonly TenTinh[];
  /** Năng lượng kéo nghề này lại. */
  tinhCanTro: readonly TenTinh[];
  /** Nguyên văn câu trong `mo-ta-8-tinh.md` làm căn cứ. */
  canCu: string;
}

export const NHOM_NGHE: readonly NhomNghe[] = [
  {
    ma: "kinh_doanh",
    ten: "Kinh doanh, buôn bán, thương mại",
    tinhHopNhat: ["Ngũ Quỷ", "Thiên Y"],
    tinhCanTro: ["Phục Vị"],
    canCu:
      "Ngũ Quỷ: “hợp buôn bán/công tác nhiều”. Thiên Y: “Tiền tài đến từ tám phương”. Phục Vị: “thích thu nhập ổn định, cố định”.",
  },
  {
    ma: "lanh_dao",
    ten: "Lãnh đạo, quản lý",
    tinhHopNhat: ["Diên Niên", "Thiên Y"],
    tinhCanTro: ["Lục Sát", "Phục Vị"],
    canCu:
      "Diên Niên: “Thường là người lãnh đạo… có thể gánh vác một phương”. Thiên Y: “Dễ thành ông chủ hoặc cánh tay đắc lực của ông chủ”. Lục Sát: “chịu áp lực kém”. Phục Vị: “xử lý sự việc do dự”.",
  },
  {
    ma: "ky_thuat",
    ten: "Kỹ thuật, chuyên môn sâu",
    tinhHopNhat: ["Diên Niên", "Phục Vị"],
    tinhCanTro: ["Ngũ Quỷ"],
    canCu:
      "Diên Niên: “Năng lực chuyên nghiệp, làm lãnh đạo/kỹ thuật”. Phục Vị: “Kiên nhẫn, nghị lực”. Ngũ Quỷ: “Thường xuyên biến động, không an phận”.",
  },
  {
    ma: "on_dinh",
    ten: "Công chức, viên chức, đơn vị sự nghiệp",
    tinhHopNhat: ["Phục Vị", "Diên Niên"],
    tinhCanTro: ["Ngũ Quỷ", "Tuyệt Mệnh"],
    canCu:
      "Phục Vị: “Thích hợp việc làm ổn định (công chức, đơn vị sự nghiệp)”. Ngũ Quỷ: “Thường xuyên biến động, không an phận”. Tuyệt Mệnh: “dám liều, quyết định cảm tính”.",
  },
  {
    ma: "khoi_nghiep",
    ten: "Tự kinh doanh, khởi nghiệp, làm chủ",
    tinhHopNhat: ["Tuyệt Mệnh", "Thiên Y", "Diên Niên"],
    tinhCanTro: ["Phục Vị"],
    canCu:
      "Tuyệt Mệnh: “tự lập nghiệp — dám liều”. Thiên Y: “Dễ thành ông chủ”. Diên Niên: “có thể gánh vác một phương”. Phục Vị: “sợ mạo hiểm, sợ tổn thất”.",
  },
  {
    ma: "dau_tu",
    ten: "Đầu tư, tài chính, chứng khoán, bất động sản",
    tinhHopNhat: ["Tuyệt Mệnh", "Thiên Y"],
    tinhCanTro: ["Phục Vị"],
    canCu:
      "Tuyệt Mệnh: “đầu tư/cổ phiếu/bất động sản liên quan chặt với Tuyệt Mệnh”. Phục Vị: “sợ mạo hiểm, sợ tổn thất”.",
  },
  {
    ma: "noi_nang",
    ten: "Nghề dùng lời nói: bán hàng, MC, giảng dạy, luật",
    tinhHopNhat: ["Họa Hại", "Thiên Y"],
    tinhCanTro: ["Phục Vị"],
    canCu:
      "Họa Hại: “Miệng lưỡi lưu loát, hùng biện… các ngành nghề dùng miệng kiếm cơm (diễn giả, MC)”; “Mở miệng là được tài (nếu có thêm Thiên Y)”. Phục Vị: “không chủ động biểu đạt”.",
  },
  {
    ma: "quan_he",
    ten: "Quan hệ xã hội, PR, ngoại giao, dịch vụ",
    tinhHopNhat: ["Sinh Khí", "Lục Sát"],
    tinhCanTro: ["Diên Niên"],
    canCu:
      "Sinh Khí: “thích hợp công tác xã hội/PR”, “nhân duyên tốt”. Lục Sát: “Quan hệ xã hội, ngoại giao, nghề phục vụ”. Diên Niên: “tác phong cường thế, cố chấp”, “ít vận quý nhân”.",
  },
  {
    ma: "sang_tao",
    ten: "Sáng tạo, nghệ thuật, thiết kế, nội dung",
    tinhHopNhat: ["Ngũ Quỷ", "Lục Sát"],
    tinhCanTro: ["Diên Niên"],
    canCu:
      "Ngũ Quỷ: “Tài hoa dồi dào, tư tưởng hay thay đổi, phản ứng nhanh, năng lực học tập mạnh”. Lục Sát: “tư duy tinh tế”. Diên Niên: “khó biến báo”.",
  },
  {
    ma: "tam_linh",
    ten: "Tâm linh, mệnh lý, tôn giáo",
    tinhHopNhat: ["Thiên Y", "Ngũ Quỷ"],
    tinhCanTro: [],
    canCu:
      "Thiên Y: “thích tông giáo mệnh lý, giác quan thứ sáu mạnh”. Ngũ Quỷ: “mệnh lý tông giáo thích hợp”.",
  },
  {
    ma: "y_te",
    ten: "Y tế, chăm sóc, giáo dục",
    tinhHopNhat: ["Thiên Y", "Sinh Khí"],
    tinhCanTro: ["Họa Hại"],
    canCu:
      "Thiên Y: “Thiện lương… hay trợ giúp người”. Sinh Khí: “thích trợ giúp người”, “cứu mạng chi tinh”. Họa Hại: “Tính khí nóng nảy, dễ cãi vã thị phi”.",
  },
  {
    ma: "khac",
    ten: "Ngành khác / chưa đi làm",
    tinhHopNhat: [],
    tinhCanTro: [],
    canCu: "Không có nhóm tương ứng trong tài liệu — engine bỏ qua phần đối chiếu nghề nghiệp.",
  },
];

export function traNhomNghe(ma: string | undefined): NhomNghe | null {
  if (!ma) return null;
  return NHOM_NGHE.find((n) => n.ma === ma) ?? null;
}
