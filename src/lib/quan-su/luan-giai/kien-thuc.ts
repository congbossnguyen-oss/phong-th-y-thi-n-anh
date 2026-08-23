/**
 * TRI THỨC LUẬN GIẢI KINH DỊCH — nạp sẵn vào system prompt.
 *
 * Nguồn: skill `hoa-giai-kinh-dich` (đúc kết từ Vương Hổ Ứng và Nguyễn Huy Hoàng). Bản gốc nằm
 * ngoài dự án nên đã CHÉP vào `src/lib/quan-su/kien-thuc/` để deploy kèm — máy chủ không đọc được
 * thư mục skill của máy cá nhân.
 *
 * Nhập bằng `?raw` để Vite nhúng thẳng nội dung vào bundle, không phải đọc đĩa lúc chạy (đọc đĩa
 * hay hỏng khi deploy vì đường dẫn tương đối khác nhau giữa dev và bản build).
 *
 * GIAI ĐOẠN 1 chỉ nạp phần lõi (~6.900 từ). Ba tài liệu chuyên sâu theo mảng (bệnh tật, phong thủy,
 * thai sản) mà tài liệu kiến trúc nhắc tới KHÔNG có trong bản skill này — nên Giai đoạn 2 muốn làm
 * thì phải bổ sung nguồn trước, đừng tưởng chỉ cần bật lên là chạy.
 */
import quyTrinh from "../kien-thuc/quy-trinh.md?raw";
import nguyenTac from "../kien-thuc/nguyen-tac-luan-giai.md?raw";
import thuTuongBatQuai from "../kien-thuc/thu-tuong-bat-quai.md?raw";
import thuTuongDiaChi from "../kien-thuc/thu-tuong-dia-chi.md?raw";
import phuongPhapHoaGiai from "../kien-thuc/phuong-phap-hoa-giai.md?raw";

/**
 * Chuẩn hóa xuống dòng về LF. Git trên Windows tự đổi LF sang CRLF lúc checkout (đã bị đúng lỗi
 * này một lần: biểu thức cắt frontmatter không khớp nên cả khối YAML lọt vào prompt). Chuẩn hóa
 * ngay đầu vào để mọi xử lý phía sau chỉ phải lo một kiểu xuống dòng, và để prompt gửi lên model
 * giống hệt nhau ở mọi máy — quan trọng vì prompt caching băm theo nội dung, lệch một ký tự là
 * mất cache, tốn tiền hơn hẳn.
 */
function chuanHoa(md: string): string {
  return md.replace(/\r\n/g, "\n");
}

/** Bỏ khối frontmatter YAML ở đầu SKILL.md — siêu dữ liệu của skill, không phải tri thức luận. */
function boFrontmatter(md: string): string {
  const s = chuanHoa(md);
  return s.startsWith("---") ? s.replace(/^---\n[\s\S]*?\n---\n/, "") : s;
}

export const TRI_THUC_LOI = [
  "# QUY TRÌNH LUẬN GIẢI LỤC HÀO",
  boFrontmatter(quyTrinh).trim(),
  "\n# NGUYÊN TẮC LUẬN GIẢI (vượng suy, Không Vong)",
  chuanHoa(nguyenTac).trim(),
  "\n# THỦ TƯỢNG BÁT QUÁI",
  chuanHoa(thuTuongBatQuai).trim(),
  "\n# THỦ TƯỢNG ĐỊA CHI",
  chuanHoa(thuTuongDiaChi).trim(),
  "\n# CÁC PHƯƠNG PHÁP HÓA GIẢI",
  chuanHoa(phuongPhapHoaGiai).trim(),
].join("\n\n");
