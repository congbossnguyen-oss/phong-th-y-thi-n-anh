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
// AN-LỆ (worked cases, Vương Hổ Ứng — Chương 17). Tuyển tập 153 case trong 8 file chunk (~49.000 từ
// tổng cộng) — nạp CẢ 8 sẽ làm knowledge phồng ~8x, hại prompt caching. Bounded deterministic:
// nạp MỤC LỤC đầy đủ (nhận biết cả 153 case theo chủ đề + kỷ luật cách dùng) + 1 chunk đầu tiên theo
// đúng thứ tự sách (chunk-01, ~35 case đầy đủ) làm mẫu few-shot. Mở rộng = thêm chunk-02... về sau.
import anLeMucLuc from "../kien-thuc/an-le/00-INDEX.md?raw";
import anLeTap1 from "../kien-thuc/an-le/chunk-01.md?raw";

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
  // AN-LỆ: đặt CUỐI khối tri thức (sau toàn bộ phương pháp) — án lệ là mẫu đối chiếu, không phải
  // phương pháp bắt buộc. Header nêu rõ kỷ luật: chỉ tham chiếu cách luận/tinh thần hóa giải, KHÔNG
  // copy sang quẻ hiện tại, kết quả engine/rule ưu tiên cao hơn, chỉ nhắc án lệ có mặt đầy đủ ở đây.
  "\n# AN-LỆ / WORKED CASES — CHỈ DÙNG LÀM MẪU ĐỐI CHIẾU (KHÔNG COPY SANG QUẺ HIỆN TẠI)",
  [
    "Đây là án lệ có thật (Vương Hổ Ứng, Chương 17), dùng để tham khảo CÁCH LẬP LUẬN và tinh thần chọn cách hóa giải.",
    "KỶ LUẬT BẮT BUỘC:",
    "- Án lệ KHÔNG phải bằng chứng cho quẻ đang xem. Luôn tự tính lại Dụng Thần / sinh khắc / Không Vong của quẻ hiện tại theo quy trình.",
    "- Kết quả engine/rule của quẻ hiện tại có quyền ưu tiên CAO HƠN án lệ khi mâu thuẫn.",
    "- KHÔNG copy kết luận / vật phẩm / con số của án lệ sang quẻ khác nếu dữ liệu không tương ứng.",
    "- CHỈ được tham chiếu án lệ có mặt ĐẦY ĐỦ trong phần này (hiện nạp Tập 1/8); KHÔNG bịa án lệ, KHÔNG bịa nguồn.",
    "- Mục lục dưới liệt kê cả 153 case để nhận biết chủ đề; phần thân đầy đủ chỉ có Tập 1/8.",
  ].join("\n"),
  "\n## MỤC LỤC ÁN LỆ (153 case, theo chủ đề)",
  chuanHoa(anLeMucLuc).trim(),
  "\n## ÁN LỆ ĐẦY ĐỦ — TẬP 1/8 (mẫu few-shot đối chiếu)",
  chuanHoa(anLeTap1).trim(),
].join("\n\n");
