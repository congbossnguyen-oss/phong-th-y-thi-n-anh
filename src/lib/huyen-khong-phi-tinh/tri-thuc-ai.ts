/**
 * Tri thức nguồn nhúng CỨNG (không đọc file lúc chạy) cho lớp AI luận Huyền Không Phi Tinh.
 *
 * ⚠️ Production chạy Cloudflare Worker — KHÔNG có filesystem, nên không thể đọc
 * docs/huyen-khong-phi-tinh/references/*.md lúc runtime. 2 hằng số dưới đây COPY NGUYÊN VĂN nội
 * dung 2 file nguồn liên quan trực tiếp tới việc AI luận chi tiết + hóa giải, để prompt AI chỉ
 * được dùng đúng những gì có trong nguồn (không tự sáng tác) mà vẫn chạy được trên Worker.
 *
 * Đối chiếu lại với file gốc nếu docs/huyen-khong-phi-tinh/references/ có cập nhật:
 *   - quy-trinh-luan-khi-co-tinh-ban.md
 *   - c-hoa-giai-sat-khi.md
 */

export const QUY_TRINH_LUAN = `# Quy trình luận khi đã có sẵn Tinh Bàn

## Bước 3 — Xác định vượng/suy của 9 sao theo vận
Đối chiếu vận hiện tại với bảng vượng/suy: sao đương vận (VƯỢNG) > sao sinh khí/vận kế tiếp (SINH)
> sao suy khí/vận vừa qua (SUY) > sao tử khí/2 vận trước (TỬ). Các sao còn lại ngoài 4 mức này ghi
"TỬ/XA" — KHÔNG tự gán "tiến khí" cho số cụ thể nào (nguồn không định nghĩa rõ).

## Bước 4 — Kiểm tra Trung Cung
Đọc bộ 3 sao tại Trung Cung, xét khí toàn cục xuất phát từ đây (gốc chi phối lưu chuyển khí ra 8
cung). Kiểm tra riêng Phản Ngâm/Phục Ngâm nếu Ngũ Hoàng nhập Trung Cung.

## Bước 5 — Luận từng cung (8 cung, theo thứ tự cố định: Trung → Càn → Khảm → Cấn → Chấn → Tốn → Ly
→ Khôn → Đoài), với MỖI cung chạy đủ 10 bước:
1. Xác định cung và ý nghĩa gốc (phương vị, người đại diện, bộ phận cơ thể).
2. Đọc bộ 3 sao: Vận tinh — Sơn tinh — Hướng tinh.
3. Xác định đúng vị trí từng sao (không nhầm Sơn/Hướng/Vận).
4. Xét ngũ hành sinh–khắc giữa 3 sao trong cung.
5. Luận ý nghĩa từng sao riêng lẻ.
6. Luận tổ hợp sao — kiểm tra 5 danh cục cổ điển (Tứ Nhất Đồng Cung, Cửu Thất Hợp Triệt, Nhị Ngũ
   Giao Gia, Tam Thất Điệp Chí/Xuyên Tâm Sát, Giao Kiếm Sát — đã có sẵn trong dữ liệu "danh_cuc" ở
   tinh bàn nếu có); nếu tổ hợp không khớp danh cục nào, luận theo sinh-khắc ngũ hành thuần túy,
   KHÔNG suy diễn ý nghĩa không có căn cứ.
7. Xét vượng–suy (Bước 3) VÀ đắc cách/thất cách theo loan đầu THỰC TẾ tại cung đó — đây là 2 lớp
   RIÊNG, phải xét cả hai: 1 sao có thể vượng nhưng thất cách (loan đầu không đúng), hoặc suy
   nhưng đắc cách. NẾU không có dữ liệu loan đầu cho cung này (khách không khai), PHẢI nói rõ
   "chưa đủ dữ liệu loan đầu để xét đắc/thất cách tại cung này" — TUYỆT ĐỐI không tự đoán loan đầu.
8. Kết hợp hình pháp: cửa, nước, bếp, giường, đường đi... tại cung đó có gì trên thực tế (dùng
   đúng dữ liệu Nhóm B được cung cấp).
9. Luận ứng sự: tài lộc, sức khỏe, hôn nhân, công danh, nhân đinh... ứng với người/bộ phận cơ thể
   mà cung đó đại diện.
10. Kết luận mức độ cát–hung của riêng cung này (thang: đại cát / cát / bình / hung / đại hung).

## Bước 6 — Kiểm tra toàn bàn sau khi luận xong 8 cung
Phân bố các sao đặc biệt (2, 5, 7, 9...) — sao nào lặp nhiều cung, sao hung có tập trung vào khu
vực sinh hoạt chính không.

## Bước 7 — Kiểm tra trục Sơn–Hướng (trọng tâm nhất)
Sơn tinh tại Tọa có đắc vị không, Hướng tinh tại Hướng có đắc vị không, có phạm Thượng Sơn Hạ Thủy
không, có phải Song Tinh Đáo Hướng/Đáo Tọa không (tốt hay xấu tùy đắc/thất cách).

## Bước 8 — Kiểm tra liên kết giữa các cung
Đánh giá luân chuyển khí giữa các cung liền kề (cửa/hành lang/cầu thang nối cung nào với cung
nào), quan hệ sinh hay khắc giữa các cung kế cận.

## Bước 9 — Xác định điểm kích hoạt
Rà: Cửa chính · Cửa phụ · Ban công · Đường · Cầu thang · Bếp · Hồ nước · Giường ngủ · Bàn làm việc
— đối chiếu cát/hung của cung chứa từng điểm để biết nên giữ, kích hoạt thêm, hay cần hóa giải.

## Bước 10 — Kết luận toàn bàn
Đánh giá theo từng chủ đề: Tài lộc, Nhân đinh, Sức khỏe, Công danh, Hôn nhân. Xác định cung nên
kích hoạt (sao vượng/sinh + đắc cách nhưng loan đầu chưa tận dụng hết), cung cần giữ tĩnh (sao
suy/tử hoặc Ngũ Hoàng — tránh động). Đưa thứ tự ưu tiên xử lý (ưu tiên trục Sơn-Hướng và điểm kích
hoạt chính như cửa/bếp/giường trước, cung phụ sau).

## Khi hỏi về 1 năm/tháng cụ thể (lưu niên/lưu nguyệt)
Dùng đúng Niên tinh/Nguyệt tinh đã tính sẵn trong dữ liệu cung cấp (không tự tính lại). Cảnh báo
Ngũ Hoàng/Nhị Hắc lưu niên nếu trùng cung đang kích hoạt (cửa/bếp/giường), nói rõ đây là ảnh hưởng
CỦA RIÊNG năm/tháng đó, không phải cách cục cố định của tinh bàn.`;

export const HOA_GIAI_SAT_KHI = `# Hóa Giải Sát Khí theo Huyền Không Phi Tinh — ưu tiên theo mức đồng thuận nhiều thầy

Nguồn: "Phương Pháp Hóa Giải Sát Khí Theo Huyền Không Phi Tinh" (Trương Giác Minh, chuyển ngữ Phan
Tổ Ý) — tuyển trích nhiều đại sư cổ điển/cận đại. LUÔN ưu tiên trình bày điểm nhiều thầy độc lập
cùng đồng ý trước; nếu chỉ 1 nguồn nêu, PHẢI nói rõ "đây là 1 trường phái, chưa có nguồn thứ 2 đối
chiếu" khi đề xuất cho khách.

## Mức độ đồng thuận (ưu tiên dùng các mục đồng thuận cao trước)
- ĐỒNG THUẬN CAO NHẤT (4 nguồn độc lập): "Sát khí nên tĩnh, không nên động" — tuyệt đối tránh động
  thổ/xây sửa/để vật hay chuyển động tại phương có sát (Ngũ Hoàng, Nhị Hắc, Tam Sát, Thái Tuế...).
  Động lớn (phá dỡ, đào đất, máy móc) lẫn động nhỏ (bể cá, tivi, loa đài, cửa đóng mở nhiều) đều kỵ.
- ĐỒNG THUẬN CAO (5 nguồn): dùng vật phẩm hành Kim (đồng, chuông kim loại, tiền xu) để hóa Ngũ
  Hoàng/Nhị Hắc — nguyên lý Thổ sinh Kim (tiết khí). TUYỆT ĐỐI không dùng Hỏa/vật hành Hỏa tại
  phương Ngũ Hoàng (Hỏa sinh Thổ → tăng sát).
- ĐỒNG THUẬN VỪA (2 nguồn): An Nhẫn Thủy (nước muối + đồng tiền) hóa Ngũ Hoàng; kích hoạt phương
  Bát Bạch (Cấn) hóa Ngũ Hoàng (Thổ Cấn tiêu bớt Hỏa Liêm Trinh).
- 1 NGUỒN DUY NHẤT (nói rõ khi dùng): kích Lục Bạch hóa Nhị Hắc; kích Tam Bích/Tốn hóa Tam Bích Xi
  Vưu; kích Bát Bạch hóa Thất Xích Phá Quân; gõ chuông/tụng kinh kim loại tại Ngũ Hoàng.

Thứ tự ưu tiên xử lý CHUNG: tránh (không ở/không đặt vật quan trọng tại phương đó) > không kích
hoạt (đừng làm nó "động") > hóa giải bằng vật phẩm (biện pháp cuối).

## Ngũ Hoàng (sát mạnh nhất — hung bất kể sinh hay khắc)
Ứng bệnh theo ngũ hành phương: Đông/Đông Nam (Mộc) → gan, chân, da. Nam (Hỏa) → mắt, tim mạch,
chảy máu. Tây Nam/Đông Bắc (Thổ) → dạ dày, tiêu hóa, da. Tây/Tây Bắc (Kim) → hô hấp, phổi, túi
mật. Bắc (Thủy) → thận, lưng, tiết niệu.

Phương pháp hóa giải (ưu tiên theo thứ tự đồng thuận):
1. (5 nguồn) Đồ đồng/vật phẩm hành Kim tại cửa/phương Ngũ Hoàng: cặp kỳ lân đồng, đồng tiền đồng
   dưới thảm, khung cửa viền thép, tranh đồng, 6 đồng tiền cổ, chuông đồng (nhà nhiều gió lớn
   KHÔNG nên dùng chuông gió vì dễ phạm "Thanh Sát" do âm thanh hỗn loạn).
2. (2 nguồn) An Nhẫn Thủy: bình chứa nước muối hạt (~2 cân muối thô) + đồng tiền đồng, đậy kín,
   đặt đúng phương Ngũ Hoàng.
3. (2 nguồn) Kích hoạt phương Bát Bạch (nguồn ghi "chỉ truyền cho đệ tử", không tiết lộ kỹ thuật).
4. (1 nguồn) Gõ chuông/tụng kinh âm thanh kim loại tại phương Ngũ Hoàng.
5. (1 nguồn) Nếu Ngũ Hoàng ngay cửa chính: tốt nhất dời cửa; nếu không thể, treo 1 chuông đồng lớn
   + 6 chuông đồng nhỏ tại cửa.

Trường hợp CỰC HUNG không hóa giải được (chỉ nêu để cảnh báo tránh, KHÔNG gợi ý hóa giải):
Ngũ Hoàng gặp Lực Sĩ (không hóa giải được); Ngũ Hoàng + Tam Thất (tứ chi thương nặng); Ngũ Hoàng +
Tam Nhị (mẹ mất bất thường); Ngũ Hoàng + Lục Thất (tranh quyền, kiện tụng lớn); Ngũ Hoàng + Nhị Ngũ
(bệnh chết kèm chuyện quái dị); Ngũ Hoàng + Thất Cửu (tai họa lớn liên quan máu đổ).

## Nhị Hắc (Bệnh Phù) — 1 nguồn, chưa có nguồn thứ 2
Kích hoạt phương Lục Bạch (Càn-Khôn phối hợp, "Thiên Địa Định Vị") để trung hòa. Nếu Nhị Hắc ở
cửa: treo 1 chuông đồng tại cửa (ứng dụng nguyên lý Kim tiết Thổ đồng thuận cao — đáng tin hơn
phần kích Lục Bạch).

## Tam Bích (Xi Vưu — tranh chấp, kiện tụng) — 1 nguồn
Kích hoạt phương Tam Bích (Chấn) hoặc Tứ Lục (Tốn) — "Lôi Phong Tương Bạc".

## Thất Xích (Phá Quân — trộm cướp, hỏa tai khi thất vận) — 1 nguồn
Kích hoạt phương Bát Bạch (Cấn) — "Sơn Trạch Thông Khí".

## Cửu Thất Hợp Triệt, Nhị Ngũ Giao Gia, Tam Thất Điệp Chí, Giao Kiếm Sát
Không có phương pháp hóa giải riêng ngoài nguyên tắc chung: dùng Kim tiết Thổ cho Nhị Ngũ; tránh
động, tránh đặt vật sắc nhọn cho Cửu Thất/Tam Thất/Giao Kiếm Sát.

## Giới hạn — PHẢI tuân thủ khi luận
- KHÔNG bịa thêm phương pháp hóa giải ngoài danh sách trên.
- KHÔNG gợi ý hóa giải cho các trường hợp "CỰC HUNG không hóa giải được" ở trên — chỉ được cảnh
  báo tránh phạm phải.
- Với mục chỉ có "1 nguồn duy nhất", PHẢI ghi rõ trong câu trả lời rằng đây là 1 trường phái, chưa
  có nguồn thứ 2 đối chiếu, để khách tự cân nhắc mức tin cậy.`;
