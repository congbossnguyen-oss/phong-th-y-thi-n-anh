/**
 * Lỗi nghiệp vụ cố ý — message tiếng Việt, AN TOÀN hiện thẳng cho khách. Dùng ở các hàm lib (tạo
 * đơn, xác thực nghiệp vụ...) khi cần từ chối yêu cầu vì một lý do đã lường trước (giỏ hàng trống,
 * khóa học không tồn tại...). Route gọi các hàm này PHẢI phân biệt bằng `instanceof LoiNghiepVu` —
 * mọi lỗi khác (DB, mạng, cấu hình thiếu biến môi trường...) là bất ngờ, không được hiện nguyên văn
 * cho khách (dễ lộ chi tiết kỹ thuật như câu lệnh SQL, tên bảng, tên biến .env).
 */
export class LoiNghiepVu extends Error {}
