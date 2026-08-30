/**
 * Tri thức nguồn nhúng CỨNG (không đọc file lúc chạy) cho lớp AI luận Huyền Không Phi Tinh.
 *
 * ⚠️ Production chạy Cloudflare Worker — KHÔNG có filesystem, nên không thể đọc
 * docs/huyen-khong-phi-tinh/references/*.md lúc runtime. Các hằng số dưới đây COPY NGUYÊN VĂN nội
 * dung các file nguồn liên quan trực tiếp tới việc AI luận chi tiết + hóa giải, để prompt AI chỉ
 * được dùng đúng những gì có trong nguồn (không tự sáng tác) mà vẫn chạy được trên Worker.
 *
 * Đối chiếu lại với file gốc nếu docs/huyen-khong-phi-tinh/references/ có cập nhật:
 *   - quy-trinh-luan-khi-co-tinh-ban.md
 *   - c-hoa-giai-sat-khi.md
 *   - h-81-cap-sao-va-hoa-giai.md   (thêm 30/8/2026)
 *   - i-thu-son-xuat-sat-cua-chinh-duong-khi.md   (thêm 30/8/2026)
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

export const Y_NGHIA_81_CAP_SAO = `# Ý nghĩa 81 cặp sao + Kích hoạt & Hóa giải theo từng sao (Trương Giác Minh, PHẦN 2)

## CẢNH BÁO CỦA CHÍNH TÁC GIẢ — bắt buộc tuân thủ khi dùng bảng dưới
Bất kỳ tổ hợp sao nào tự nó không có ý nghĩa gì cả. Ý nghĩa chỉ hé lộ khi phản chiếu tổ hợp đó với
yếu tố THỜI GIAN (vận), rồi lọc qua HÌNH và KHÍ (loan đầu thực tế), môi trường, hướng, vị trí, khối
lượng, tỷ lệ, cường độ. Ví dụ: cặp 5-7 trong Vận 7 thì sao 7 đang vượng, đủ sức khống chế sao 5 —
có thể tốt nếu có thủy/khoảng trống kích hoạt; ra ngoài Vận 7, sao 7 yếu, không còn khống chế nổi
sao 5. Cùng 1 cặp số, khác vận, khác loan đầu → kết quả khác hẳn.
DÙNG BẢNG NÀY ĐỂ LOẠI TRỪ BAN ĐẦU (nhận biết đang đối mặt tổ hợp nào), KHÔNG dùng để kết luận thẳng.
Điềm tốt chỉ ứng khi loan đầu tốt + đúng thời; điềm xấu có thể chỉ tiềm ẩn, cần môi trường xấu +
sai thời mới phát — PHẢI đối chiếu với Nhóm B (loan đầu) và Vượng/Suy đã tính sẵn trước khi kết
luận, không được trích thẳng "điềm báo" trong bảng làm kết luận cuối.

## Sao 1 — Nhất Bạch Tham Lang (Thủy). Thận, bàng quang, sinh sản, tai. Con trai thứ.
Đương vận: may mắn, giàu/nổi tiếng. Thất vận: mất kiểm soát, nóng nảy, dễ dính pháp luật.
1-1 dâm loạn · 1-2 xung đột vợ chồng, phụ khoa · 1-3 tai tiếng, trộm cắp · 1-4 thông minh/thi cử/
danh tiếng nếu đúng thời, ngược lại tình duyên xấu · 1-5 bệnh thận/sinh sản, ngộ độc · 1-6 cấp bậc
quân sự cao, lợi đàn ông lớn tuổi · 1-7 đào hoa/trộm cắp/lưu đày khi đất dốc nước chảy xa nhà ·
1-8 giàu khỏe tốt cho nghiên cứu, sỏi thận/điếc/bệnh da · 1-9 sinh sản/thành công, bệnh mắt/da/mất
tiền/tổn vợ.
Kích hoạt: sao 1 là Hướng tinh → bể cá có cá + máy sủi bọt (phải động), đặt phòng làm việc/ngủ.
Sao 1 là Sơn tinh → đá pha lê/thạch anh, tăng may mắn quan hệ.

## Sao 2 — Nhị Hắc Cự Môn (Thổ). Dạ dày, tử cung, bụng. Mẹ, phụ nữ lớn tuổi. CHỈ CÁT Ở VẬN 2, ngoài
vận là Hung Tinh/Bệnh Tinh. Đương vận: đáng tin cậy. Thất vận: bệnh tật, trì trệ, sẩy/sinh non.
2-1 ly hôn, đau bụng, phá thai · 2-2 dấu hiệu bệnh tật MẠNH NHẤT, góa phụ, không nên bỏ qua ·
2-3/3-2 Đấu Ngưu Sát, con trai quấy mẹ · 2-4 rối loạn lá lách, góa phụ · 2-5 ma ám (thiếu dữ liệu) ·
2-6 hôn nhân, tâm linh · 2-7 tiêu chảy, hỏa hoạn khi Sơn-Thủy xấu · 2-8 tùy Hình Khí · 2-9 kinh
doanh (thiếu dữ liệu).
Hóa giải sao 2 (3 cách): (1) chuông gió 6 thanh kim loại tại góc sao 2 đến, KHÔNG treo đầu giường.
(2) hồ lô đồng hoặc 6 xu kim loại đặt chỗ sao 2 đến; nếu tại giường ngủ → đặt hồ lô đồng cạnh
giường. (3) chỉ dùng vật phẩm KIM, không dùng Thủy (Thổ khắc Thủy) hay Hỏa (Hỏa sinh Thổ, mạnh
thêm).

## Sao 3 — Tam Bích Lộc Tồn (Mộc). Gan, túi mật, chân, tay. Con trai cả, đàn ông trung niên.
Đương vận: học tập, sáng tạo, thành tích. Thất vận: thị phi, kiện tụng, hen suyễn.
3-1 kiện tụng, bốc đồng, gan · 3-2 Đấu Ngưu Sát, mẹ-con xung đột · 3-3 tàn nhẫn, suy sụp thần kinh
· 3-4 căng thẳng nhưng TỐT cho bán hàng/vận chuyển · 3-5 cờ bạc, tai nạn xe, lá lách · 3-6 hại con
trưởng, đau đầu, mất tiền · 3-7 cướp/trộm/kiện tụng/bệnh · 3-8 hại trẻ nhỏ, sảy thai · 3-9 GIÀU CÓ,
NỔI TIẾNG, sinh con trai thông minh.
Hóa giải sao 3 thất vận: dùng HỎA tiết Mộc — đèn đỏ, tranh/tường màu đỏ. Tránh thiết bị điện hoạt
động thường xuyên (bếp điện, tivi) tại đây.

## Sao 4 — Tứ Lục Văn Khúc (Mộc). Gan, mật, đùi, phổi (Tốn). Con gái lớn. Sao ĐÀO HOA + nghệ thuật,
kéo theo rượu chè/không chung thủy. Đương vận: quý nhân, học tập, sáng tạo. Thất vận: tiếng xấu,
quyết định sai, dễ trầm cảm.
4-1 được ngưỡng mộ · 4-2 đe dọa phụ nữ, mẹ chồng-con dâu · 4-3 nam nữ vấn đề thần kinh, trộm cắp ·
4-4 đào hoa, hen suyễn, tự tử treo cổ · 4-5 ung thư vú, hô hấp · 4-6 hại con gái lớn, mất vợ, kiện
tụng · 4-7 kiện tụng, hôn nhân tan vỡ, dao · 4-8 cô độc, rối loạn tâm thần · 4-9 (thiếu dữ liệu).
Hóa giải/vận dụng sao 4: Thủy bổ trợ Mộc (thế 1-4) nhưng KHÔNG đặt quá nhiều Thủy (dễ quan hệ bất
chính vì có Đào Hoa). Là Văn Khúc Tinh → đặt tháp Văn Xương/bàn học/bàn làm việc tại đây lợi học
vấn công danh.

## Sao 5 — Ngũ Hoàng Liêm Trinh (Thổ). Tiêu hóa, tuyến tụy. Nguy hiểm nhất khi kết hợp sao 2, sao 5
khác, sao 9, hoặc tại cung Ly. Đương vận: quyền lực nhất. Thất vận: tai nạn, bệnh nan y.
5-1 ung thư sinh sản, điếc · 5-2 CÁI CHẾT CỦA CẢ VỢ CHỒNG, không nên bỏ qua · 5-3 hại con trưởng,
mất tiền · 5-4 ung thư vú, mất tiền đầu cơ · 5-5 CÁI CHẾT THƯƠNG TÂM/BẠO LỰC, xử lý càng sớm càng
tốt · 5-6 đau đầu, ung thư phổi/xương · 5-7 ngộ độc, bệnh nghiêm trọng · 5-8 gãy xương, ung thư
xương/mũi · 5-9 thiểu năng, ma túy.
Hóa giải sao 5 thất vận: kim loại TRỌNG LƯỢNG LỚN — chuông gió 6 thanh to, chuông đồng. Mỗi sáng
gõ 3 cái tại đó (làm Ngũ Hoàng "bận rộn", không gây hại).

## Sao 6 — Lục Bạch Vũ Khúc (Kim). Phổi, đại tràng, đầu. Cha, đàn ông cao tuổi. Sao quyền lực/tuổi
thọ/đạo đức — kết quả đến CHẬM. Đương vận: quyền lực, sự nghiệp. Thất vận: tiêu hao tài sản, cô lập.
6-1 văn chương, suy yếu người cha · 6-2 bệnh phụ khoa · 6-3 đau đầu, gãy chân · 6-4 ly thân · 6-5
đột quỵ, ung thư xương, mất việc · 6-6 kiện tụng nhưng TỐT TIỀN TÀI · 6-7 GIAO KIẾM SÁT, cướp có vũ
trang · 6-8 GIÀU CÓ NỔI TIẾNG, bất động sản, thừa kế · 6-9 bệnh phổi/não, con thách cha.
Vận dụng sao 6: thác nước 6 bậc (ngoài trời), phong thủy luân, hoặc 6 quả cầu pha lê. Đề phòng nếu
cùng cung có sao 7 → Giao Kiếm Sát.

## Sao 7 — Thất Xích Phá Quân (Kim). Ruột già, hàm trên, răng. Con gái út. Liên quan dao/vết cắt/
đàm tiếu. Đương vận: quyền lực, thăng tiến. Thất vận: bất ổn tinh thần, dính pháp luật.
7-1 cướp bóc, ngoại tình · 7-2 NGUY CƠ HỎA HOẠN (Nam/Tây Nam/Tây) · 7-3 lợi nhuận bất ngờ, rắc rối
tài chính · 7-4 hô hấp · 7-5 ngộ độc, ma túy · 7-6 GIAO KIẾM SÁT · 7-7 hai phụ nữ, nông cạn · 7-8
GIÀU, THÀNH CÔNG SỰ NGHIỆP · 7-9 tán tỉnh, NGUY CƠ CHÁY NỔ.
Hóa giải sao 7: mạnh hơn khi kết hợp 3-7/5-7/6-7. Dùng vật phẩm TIẾT CHẾ (không khắc chế) — ví dụ
1 con tê giác màu xanh nước biển (Thủy) để tiết chế Kim.

## Sao 8 — Bát Bạch Tả Phụ (Thổ). Bụng, xương nhỏ. Con trai út. Bạch Tinh may mắn (1,6,8), cao quý.
Đương vận: tài chính thuận, đầu tư dễ thành. Thất vận: tính khí thất thường, bạo lực gia đình.
8-1 sinh sản/tai · 8-2 vấn đề bụng, địa vị cao · 8-3 nguy hiểm trẻ nhỏ, không con · 8-4 nguy hiểm
trẻ nhỏ, ly hôn · 8-5 TỐT TÀI LỘC, ung thư mũi · 8-6 THÀNH CÔNG, thăng tiến · 8-7 THÀNH CÔNG TÌNH
YÊU, giàu có · 8-8 kết quả tuyệt vời nhưng cần điều chỉnh · 8-9 SỰ KIỆN VUI (đám cưới).
Hóa giải sao 8 thất vận: vấn đề chi tiết (núi nhân tạo/đảo kỵ long tùy cục Sơn-Hướng) — nguồn
khuyến nghị cần khảo sát thực tế, KHÔNG có công thức chung — nếu khách hỏi, nói rõ cần thầy khảo
sát trực tiếp thay vì tự đưa công thức.

## Sao 9 — Cửu Tử Hữu Bật (Hỏa). Con gái giữa. Điềm báo PHỤ THUỘC SAO ĐI KÈM — đi với sao tốt thì
nhân từ, đi với sao xấu thì khuếch đại tiêu cực (đặc biệt sao 2, sao 5). Đương vận: thăng tiến, may
mắn tình duyên. Thất vận: kiện tụng, dễ vi phạm pháp luật.
9-1 im lặng, bệnh da/mắt · 9-2 phụ khoa · 9-3 kiện tụng/tù, con trai thông minh · 9-4 quan hệ không
phù hợp · 9-5 thuốc/chấn thương/tử vong · 9-6 bệnh não/phổi · 9-7 NGUY CƠ HỎA HOẠN · 9-8 SỰ KIỆN
CHÚC MỪNG · 9-9 DANH TIẾNG.
Lưu ý: nhà chính hướng Ly (Nam) KHÔNG nên đặt bếp hướng Đoài (Tây) — dễ tạo 9-7 dẫn cháy nổ.

## NGUYÊN TẮC HÓA GIẢI — BẮC CẦU, KHÔNG KHẮC CHẾ (áp dụng mọi cặp sao, không riêng ví dụ)
"Đảm bảo dòng chảy của Khí được ưu tiên hơn kiểm soát/suy yếu/hỗ trợ/tăng cường." Luôn ưu tiên BẮC
CẦU (dẫn dòng sinh) giữa 2 sao thay vì tấn công/khắc chế trực tiếp — Khí khi có lựa chọn giữa tấn
công và hỗ trợ sẽ chọn con đường ÍT KHÁNG CỰ NHẤT, tức đi theo đường sinh. Khắc chế 1 sao hung
thường PHẢN TÁC DỤNG — sao bị khắc dễ bị kích động hơn.
Ví dụ mẫu (cặp 2-3, Đấu Ngưu Sát): thêm Kim khắc Mộc(3) trực tiếp → tác giả đánh giá THIẾU HIỂU
BIẾT, làm sao 3 kích động hơn. Cách đúng: kết hợp CẢ Kim VÀ Hỏa — Hỏa bắc cầu 3→9→2, Kim vừa kiểm
soát sao 3 vừa ngăn dòng khí kết thúc ở sự kiện sao 2 → dẫn dòng thành 3→9→2→6, kết thúc ở Kim.
Cách áp dụng cho cặp khác: nhìn dòng khí "kết thúc" ở sao nào, bố trí để nó kết thúc ở sao vô hại/
có lợi thay vì sao hung — KHÔNG mặc định dùng ngũ hành khắc chế trực tiếp sao xấu.
Riêng Vận 9: sao 9 (Cửu Tử) khi hiện diện cùng sao xấu ĐỦ KHẢ NĂNG xử lý/biến đổi điềm xấu.

## Giới hạn dữ liệu
Vài cặp thiếu nội dung do OCR nguồn: 2-5, 2-9, 4-9, 7-4 — PHẢI nói "nguồn không đủ dữ liệu cho tổ
hợp này" nếu khách hỏi đúng cặp đó, KHÔNG tự suy diễn nội dung thiếu. Bảng 9 cặp riêng cho Vận 9 (đã
có trong dữ liệu tinh bàn ở mục y_nghia_cap nếu van=9) cụ thể hơn về thời vận — ưu tiên dùng nó khi
đang luận nhà Vận 9, chỉ dùng bảng 81 cặp này cho vận khác hoặc khi cần chi tiết bệnh tật/nhân sự.`;

export const THU_SON_XUAT_SAT_VA_CHINH_THAN = `# Thu Sơn Xuất Sát · Luận Cửa Chính · Đường Khí · Chính-Linh-Chiếu Thần (MV_HKPT1 + Trương Giác Minh)

## 1. THU SƠN XUẤT SÁT — 4 quy tắc gốc (đã tính sẵn theo cung trong dữ liệu thu_son_xuat_sat)
Vượng/sinh khí trên SƠN BÀN → đưa lên chỗ CAO (núi/nhà cao/tủ cao/cây lớn) = Thu Sơn.
Vượng/sinh khí trên HƯỚNG BÀN → đưa xuống chỗ THẤP có nước (ao hồ/đường/khoảng trống/cửa) = Thu Sơn.
Tử/sát khí trên SƠN BÀN → đưa xuống chỗ THẤP/trống = Xuất Sát. Tử/sát khí trên HƯỚNG BÀN → đưa lên
chỗ CAO che chắn = Xuất Sát.
QUAN TRỌNG: "sao thất vận gặp đúng Thu Sơn Xuất Sát là CÁT" — sao xấu KHÔNG nhất thiết gây họa nếu
bố trí đúng; KHÔNG được kết luận cát hung chỉ từ con số sao mà bỏ qua vị trí cao/thấp thực tế
(dữ liệu Nhóm B đã khai).
Ứng dụng cách cục: Song Tinh Đáo Hướng — tại Tọa nếu Sơn tinh sinh khí thì cục "tọa mãn triều mãn"
(sau đầy trước đầy), nếu Sơn tinh suy thì "tọa không triều mãn" (sau trống trước đầy). Song Tinh
Đáo Tọa thường KHÔNG NÊN DÙNG trừ phi có đường cục đặc thù.

## 2. LUẬN CỬA CHÍNH
Thứ tự ưu tiên: (1) Sơn-Thủy trước — đặc biệt 3 cung Hướng → Tọa → Cửa Chính; (2) xử lý MÔI TRƯỜNG
BÊN NGOÀI trước, rồi mới tới nội thất; (3) sau khi xong Sơn-Thủy mới áp dụng Ngũ Hành thúc đẩy
dòng Khí. Câu chốt nguồn: "mong có một ngôi sao may mắn xuất hiện ở cửa chính."

Lý thuyết CHỦ-KHÁCH (ai quyết định khi luận 1 vị trí): cung mặt trước (Hướng) → Thủy(Hướng tinh)
là Chủ; cung mặt sau (Tọa) → Sơn là Chủ; phòng ngủ → Sơn là Chủ; văn phòng → Thủy là Chủ; cái đúng
thời là Chủ; cái tồn tại lâu hơn là Chủ; Tiên Thiên Quái là Chủ so với Hậu Thiên; sao trong TINH
BÀN là Chủ so với sao lưu niên. Ví dụ: bộ số 4-8 thì Thủy(8) là Chủ; bộ 8-4 thì Sơn(8) là Chủ —
luận khác nhau dù cùng 2 số. Cửa chính (nơi khí vào, mang tính động/Thủy) → thường lấy Hướng tinh
tại cung cửa làm Chủ, nhưng phải kiểm tra cửa nằm ở cung mặt trước hay mặt bên.

## 3. ĐƯỜNG KHÍ
"Đảm bảo dòng chảy Khí trong nhà được ưu tiên hơn kiểm soát/suy yếu/hỗ trợ/tăng cường." Xử lý cặp
sao xấu ưu tiên BẮC CẦU (thông khí) thay vì khắc chế trực tiếp — xem thêm nguyên tắc chi tiết ở
Y_NGHIA_81_CAP_SAO mục cuối. Đường khí vật lý: khí vào cửa chính → hành lang/cầu thang → các phòng;
PHẢI xét cung nào nối cung nào qua đường đi thực tế (dữ liệu cửa/bếp/giường/cầu thang ở Nhóm B) —
cung sao tốt nhưng bị bịt kín không phát huy; cung sao xấu nằm trên trục đường khí chính thì tác
hại khuếch đại.

## 4. CHÍNH THẦN — LINH THẦN — CHIẾU THẦN (số cung + quy tắc bố trí thủy đã tính sẵn trong dữ liệu
chinh_linh_than — mục này giải thích Ý NGHĨA để luận, không tính lại số)
Chính Thần = sao đương vận (vượng vị) → NÊN mở cửa thu khí, KỴ THẤY NƯỚC. Linh Thần = sao hợp thập
với đương vận (thoái vị) → CÓ NƯỚC LÀ CÁT (nước vượng tài, lý "dĩ suy vi vượng"). Đây là quy tắc
NGƯỢC TRỰC GIÁC — nhiều người đặt hồ nước ở phương đang vượng (Chính Thần) là SAI.
4 lưu ý khi dùng Linh Thần: (1) Linh Thần nằm trên HƯỚNG BÀN, Sơn tinh không nên đoạt Linh Thần;
(2) cung có Linh Thần nhất định phải "Thu Sơn Xuất Sát" mới "dẫn thủy nhập linh đường"; (3) nên mở
đường/cửa tại Linh Thần nhưng phải đúng phía thông khí sinh khí vượng; (4) không thể xuất quái
(không vượt phạm vi quẻ). Trường hợp tốt nhất: sao đương lệnh nhập sơn nhập hướng, đúng Chính Thần
+ Linh Thần (Linh Thần nhập thủy) → phát phúc rất nhanh.
Chiếu Thần = sao do sao đương vận hợp sinh khí mà thành — vận 6-9 nên thu thủy các phương số nhỏ
tương ứng làm chính cát Linh Thần/thúc cát Chiếu Thần (nguồn có dấu hiệu OCR lặp/mâu thuẫn nhẹ ở
câu này — khi luận ưu tiên bám đúng số Chính/Linh Thần đã tính sẵn, không tự diễn giải thêm).

## Giới hạn
Điều kiện "Chân Thành Môn" (Hướng tinh đương lệnh + không phải Ngũ Hoàng trừ Vận 5 + Sơn tinh phải
thoái/sát) là bổ sung MỚI, đã tính sẵn trong dữ liệu thanh_mon.kha_dung — CHƯA có ví dụ sách đối
chiếu riêng cho điều kiện 3 (khác 3 ví dụ gốc trong self-test chỉ kiểm điều kiện 1). Khi luận, nói
đúng là "theo điều kiện Chân Thành Môn đã tính", không khẳng định như đã kiểm chứng bằng ví dụ sách.`;
