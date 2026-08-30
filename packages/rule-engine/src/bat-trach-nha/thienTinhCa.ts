/**
 * BÁT TRẠCH NHÀ — Thiên Tinh Ca (24 thiên tinh: 12 cát/12 hung, mỗi khí Du Niên chia thành 3
 * thiên tinh có lĩnh vực riêng). Nguồn: gói build `data/08-thien-tinh-ca-24-tinh.md`.
 *
 * ⚠️ CHỈ 13/24 sao đã gán chắc chắn vào khí (bản OCV văn vần cổ bị đảo chữ nặng) — data/00 MĐ-4:
 * phần thiếu để trống "đang bổ sung", KHÔNG suy diễn 11 sao còn lại.
 */
import type { KhiBatTrach } from "../cung-menh-bat-trach/duNienBatQuai.js";

export interface ThienTinh {
  ten: string;
  chuVe: string;
}

/** Thiên tinh ĐÃ xác định chắc chắn theo khí (data/08 mục 3) — có thể 0, 1 hoặc 2 sao/khí. */
export const THIEN_TINH_THEO_KHI: Record<KhiBatTrach, ThienTinh[]> = {
  "sinh-khi": [{ ten: "Văn Xương", chuVe: "Nghiên cứu học thuật, thư họa, kim thạch, âm nhạc, kịch nghệ, điêu khắc — hợp phòng học, phòng sáng tác, nghệ thuật" }],
  "thien-y": [
    { ten: "Thiên Toàn", chuVe: "Được quý nhân nâng đỡ, hưởng lộc, danh tiếng đẹp, thông minh sáng suốt, danh lợi song thu" },
    { ten: "Thiên Điền", chuVe: "Nông nghiệp, chăn nuôi, làm vườn, sản xuất thực phẩm, xuất khẩu — hợp bất động sản, nông trại, kho xưởng" },
  ],
  "dien-nien": [{ ten: "Thiên Tiền", chuVe: "Trời phú tài lộc, lợi mọi ngành thương mại — hợp phòng kinh doanh, két, bàn làm việc chủ doanh nghiệp" }],
  "phuc-vi": [{ ten: "Tư Lộc", chuVe: "Văn võ song toàn, nắm trọng trách và quyền lực, vinh quang gia tộc, danh tiếng lưu truyền lâu dài" }],
  "luc-sat": [
    { ten: "Thiên Quyền", chuVe: "Bần hèn, ô uế, gia cảnh thấp kém, phóng đãng trụy lạc, không được hàng xóm kính trọng" },
    { ten: "Bại Thương", chuVe: "Phá sản do kinh doanh thua lỗ/tai họa nước lửa/bị liên lụy/kiện tụng; cũng chủ nhiều con gái, thiếu người nối dõi" },
  ],
  "hoa-hai": [
    { ten: "Quyển Thiệt", chuVe: "Họa từ miệng mà ra, chuyện vặt trong nhà dẫn đến kiện tụng công đường, tranh chấp suốt đời" },
    { ten: "Thiên Tặc", chuVe: "Trộm cướp khó phòng, ra ngoài dễ gặp cướp bóc, bị hãm hại hoặc tổn thất tài sản" },
  ],
  "ngu-quy": [
    { ten: "Ngọc Hành", chuVe: "Cần phòng hỏa hoạn; phụ nữ dễ sảy thai, khó sinh, nuôi con khó" },
    { ten: "Quán Tác", chuVe: "Độc ác vô tình, phá hoại hòa thuận, tích tụ sát khí; chủ tai họa lao ngục, khó thoát trừng phạt pháp luật" },
  ],
  "tuyet-menh": [
    { ten: "Thi Khí", chuVe: "Chết không lành, chết bất đắc kỳ tử ngoài đường, thương vong do vũ khí sắc" },
    { ten: "Dao Quang", chuVe: "Ánh chớp lóe rồi tắt — có chuyển biến tốt cũng cực ngắn ngủi, tài sản tụ tán vô thường" },
  ],
};

/** Có sao đã xác định cho khí này không (để UI ẩn phần "đang bổ sung" khi rỗng, hoặc hiện khi có). */
export function coThienTinh(khi: KhiBatTrach): boolean {
  return THIEN_TINH_THEO_KHI[khi].length > 0;
}
