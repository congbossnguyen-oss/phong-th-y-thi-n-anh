// Cách hiển thị GIÁ VẬT PHẨM ra ngoài trang — nguồn duy nhất cho mọi nơi hiển thị giá, để 4 chỗ (trang
// chủ, danh sách vật phẩm, trang chi tiết, khối Gương Bát Quái) không bao giờ hiện khác nhau.
//
// Yêu cầu Công: không hiện số tiền nữa, thay bằng chữ "Liên hệ" — giống cách các gói dịch vụ đang làm
// (services đều để priceFrom: "Liên hệ"), để việc báo giá diễn ra qua tư vấn.
//
// LƯU Ý: chỉ đổi phần HIỂN THỊ. Giá gốc (product.price) vẫn giữ nguyên trong dữ liệu và vẫn được dùng cho
// giỏ hàng/đơn hàng — nếu sau này Công muốn ẩn luôn số tiền ở giỏ hàng và trang thanh toán thì phải sửa
// thêm ở đó, vì 2 luồng này cần con số thật để tính tổng tiền và tạo mã QR chuyển khoản.
export const PRODUCT_PRICE_LABEL = "Liên hệ";

/** Nhãn giá hiển thị cho 1 vật phẩm. Luôn trả "Liên hệ" theo yêu cầu hiện tại. */
export function formatProductPrice(_price: number): string {
  return PRODUCT_PRICE_LABEL;
}
