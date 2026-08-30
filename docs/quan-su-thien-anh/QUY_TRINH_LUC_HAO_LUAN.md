# Quy trình luận giải quẻ Lục Hào (bản đầy đủ, độc lập)

Tài liệu này là quy trình LUẬN GIẢI quẻ (không bao gồm phần hóa giải — phần đó là việc riêng của thầy, không đưa vào tài liệu dùng chung/app). Dùng để tự luận quẻ, dạy người khác luận, hoặc làm base prompt cho app. Đúc kết từ ~13 đầu sách (Vương Hổ Ứng, Nguyễn Huy Hoàng, Giả Bỉnh Nhiên, Học Viện Minh Việt) đã xử lý trong skill `hoa-giai-kinh-dich`. Khác với file spec app trước đó, file này KHÔNG tách lớp code/LLM — đây là quy trình luận giải thuần túy, tự đứng độc lập, không cần mở file nào khác.

---

## Nguyên tắc gốc — vì sao luận hay bị "chán"

Luận giải không phải "hào này xấu, hào kia tốt". Hai lỗi phổ biến khiến AI luận chán:

1. Kết luận suông — nói "tốt/xấu" mà không kèm bước suy luận sinh khắc/Không Vong/vượng suy cụ thể.
2. Dừng ở lớp trừu tượng — không "thủ tượng" hào/địa chi thành sự vật cụ thể trong đời thực.

Quy trình dưới đây có cơ chế chặn cả 2 lỗi này ở đúng bước tương ứng.

---

## Bước 0 — Kiểm tra input

Cần đủ trước khi luận (thiếu thì hỏi lại, không đoán):

- Ngày giờ lập quẻ (Can Chi Năm/Tháng/Ngày, tốt nhất có Nguyệt lệnh theo tiết khí thực — không phải tên tháng âm lịch danh nghĩa)
- Câu hỏi cụ thể — mỗi loại việc lấy Dụng thần khác nhau, không luận khi chưa rõ hỏi gì
- Đầy đủ 6 hào quẻ chính: Lục thân, Can Chi từng hào, hào Thế/Ứng, hào nào động
- Lục thần từng hào (Thanh Long/Chu Tước/Câu Trần/Đằng Xà/Bạch Hổ/Huyền Vũ) nếu có
- Quẻ biến (nếu có hào động): Lục thân + Can Chi
- Không Vong của tuần (tự tính nếu bảng không ghi — xem mục 2.1)
- Phục Thần (nếu Dụng thần không lộ trên quẻ chính)

---

## Bước 1 — Xác định Dụng thần

### 1.1. Bảng tra theo loại việc hỏi

| Việc hỏi | Dụng thần |
|---|---|
| Cầu tài, kinh doanh, buôn bán thường | Thê Tài (quy tắc THUẬN — Tài vượng/được sinh = tốt) |
| Đầu tư (chứng khoán, vàng, BĐS, hùn vốn rủi ro cao) | **Quy tắc NGƯỢC riêng** — cần Tài bị Huynh Đệ động khắc ("có chỗ đi") + Tử Tôn vượng sinh Tài ("có chỗ đến") mới là tốt. Tài yên ổn không ai khắc = tiền nằm im không sinh lời |
| Hợp tác, hùn vốn, liên doanh | KHÔNG dùng 1 lục thân cố định — khung Thế (ta)/Ứng (đối tác), xem mục 1.3 |
| Vay tiền / đòi nợ / bắt đền | KHÔNG dùng Thê Tài đơn giản — quy trình 2 bước riêng, xem mục 1.4 |
| Hợp đồng (ký kết nói chung) | Phụ Mẫu là Dụng thần chính + xét Thế-Ứng để biết thiện chí 2 bên |
| Hôn nhân đã cưới (vợ chồng hòa hợp không) | Thê Tài (nam hỏi vợ) / Quan Quỷ (nữ hỏi chồng) |
| Tình duyên (xem duyên, chọn vợ/chồng — TRƯỚC khi cưới) | Tài (nam) / Quan (nữ) — bảng riêng, xem mục 1.5, KHÁC hôn nhân đã cưới |
| Công danh, chức vụ, kiện tụng | Quan Quỷ |
| Thi đấu, giành giải, xếp hạng | Quan Quỷ (thi có thứ bậc) hoặc Phụ Mẫu (chỉ cần giấy chứng nhận) |
| Cạnh tranh với đối thủ (không qua trọng tài) | Huynh Đệ đại diện đối thủ; đối đầu trực diện 1-1 thì dùng Thế/Ứng *(suy luận mở rộng, chưa có nguồn trực tiếp)* |
| Sức khỏe, bệnh tật | Thế hào (bản thân); xét thêm Tử Tôn (thuốc men) |
| Con cái, học trò, vật nuôi | Tử Tôn |
| Thai sản (mẹ + con) | Tử Tôn + **Hào Thai** (khái niệm riêng) |
| Cha mẹ, nhà cửa, giấy tờ, mộ phần | Phụ Mẫu |
| Anh chị em, bạn bè, đối thủ nói chung | Huynh Đệ |
| Xuất hành, đi xa | 4 Dụng thần cùng lúc: Thế/Ứng/Phụ Mẫu/Tài, xem mục 1.6 |
| Bản thân / vận hạn chung | Hào Thế |
| Đối phương / người khác | Hào Ứng |
| Âm phần, mộ mả | Khác phong thủy nhà ở (dương trạch) — dùng bộ Dụng thần riêng của mảng âm trạch |
| Việc lạ, ít gặp (visa, cho thuê nhà, hàng xóm, đấu thầu, con dấu...) | Tra theo nguyên tắc suy luận tương tự, không có trong bảng chuẩn thì nói rõ "chưa chắc chắn" trước khi tự suy diễn |

### 1.2. Dụng thần lưỡng hiện (2 hào cùng lục thân đều hợp lệ)

Thứ tự ưu tiên chọn, áp dụng tuần tự tới khi phân biệt được:
1. Một tĩnh một động → chọn hào ĐỘNG.
2. Cả hai cùng trạng thái → chọn hào KHÔNG bị Không Vong/Nguyệt phá.
3. Vẫn ngang nhau → chọn hào đang Xung hoặc Hợp (biến động rõ hơn).
4. Vẫn ngang nhau → ưu tiên hào lâm Thế, sau đó mới đến lâm Ứng.
5. Địa Chi 2 hào giống hệt nhau → phân biệt bằng hào vị + Lục Thần.
6. Trường hợp đặc biệt lấy CẢ HAI làm Dụng thần song song (ví dụ 2 nguồn thu nhập, 2 căn nhà — không ép về 1 hào).

### 1.3. Hợp tác / hùn vốn / liên doanh

1. **Thực lực 2 bên**: Thế lâm Tài vượng = ta có vốn; Ứng lâm Tài vượng (hoặc cung Thê Tài của Ứng vượng) = đối phương có vốn.
2. **Thiện chí hợp tác**: Ứng sinh Thế/tương hợp = tốt nhất; Thế-Ứng tỷ hòa = tạm ổn; tương khắc/tương xung = xấu, dễ tranh chấp.
3. **Có sinh lời không**: Tài cần có "chỗ đi" (Huynh Đệ động khắc Tài — vốn được giải ngân) VÀ "chỗ đến" (Tử Tôn vượng sinh Tài) mới thực sự sinh lời bền lâu.
4. **Dấu hiệu đối tác không đáng tin**: Ứng lâm Huynh Đệ/Quan Quỷ mang Huyền Vũ (ám muội) hoặc Đằng Xà (nhiều tâm cơ) mà khắc Thế → nên tránh.

### 1.4. Vay tiền / đòi nợ / bắt đền

Phải trả lời ĐỘC LẬP 2 câu hỏi — thiếu 1 trong 2 là hỏng việc:

1. **Thái độ (Thế/Ứng)**:

   | Trạng thái hào Ứng | Thái độ đối phương |
   |---|---|
   | Ứng khắc Thế, vượng, không bị chế | Dứt khoát không muốn trả, có thể tranh chấp |
   | Ứng khắc Thế nhưng bị Không/Phá/chế | Miễn cưỡng trả vì giữ thể diện |
   | Ứng sinh Thế/tỷ hòa, vượng, không Không không Phá | Thực lòng nguyện ý |
   | Ứng sinh Thế nhưng bị khắc/Không/nhập Mộ | Lời hứa suông |
   | Ứng phát động sinh Thế | Chủ động mang tiền tới |
   | Thế khắc Ứng (nhất là phát động) | Mình chủ động đòi, có tính ép buộc |

2. **Khả năng (cung Thê Tài của Ứng)**: Thê Tài vượng tướng = thực sự có tiền; không xuất hiện/hưu tù/bị khắc = thực sự khó khăn. Ngoại lệ: ngân hàng/tổ chức tài chính lớn luôn mặc định "có tiền" — Tài suy chỉ hiểu là "chính sách thắt chặt". **Dấu hiệu giả vờ không có tiền**: Thê Tài lâm Không nhưng là hào ĐỘNG và bị Nhật xung thực → giả tượng, thực chất có tiền nhưng thoái thác.
3. **Hào chủ nhân thay Ứng** khi đối tượng nợ có quan hệ lục thân đặc thù: bạn bè/anh em → Huynh Đệ; nhà nước/kiện tụng → Quan Quỷ; cha mẹ/người trên → Phụ Mẫu.
4. **Phụ Mẫu = bằng chứng/giấy nợ**: phục tàng/bị phá = không có bằng chứng; vượng tướng = có bằng chứng vững, dùng pháp luật được.
5. **Quan Quỷ = quan phương/pháp luật**: phát động = phải nhờ pháp luật; sinh Thế = pháp luật ủng hộ; khắc Thế = kiện vô ích.
6. **Ứng Kỳ đòi được nợ**: ngày/tháng Thê Tài trực, ngày xung Không của Thê Tài, ngày xung phá kỵ thần đang khắc Thê Tài, ngày xung khai hợp, hoặc ngày xung/khắc Mộ đang giữ Thê Tài đối phương.

### 1.5. Tình duyên (xem duyên, chọn vợ/chồng)

| Người xem | Dụng thần | Ứng đại diện |
|---|---|---|
| Nhà trai xem cô dâu tương lai | Tài | Nhà gái |
| Nhà gái xem chú rể tương lai | Quan | Nhà trai |
| Nam tự xem lấy vợ | Tài | Người nữ |
| Nữ tự xem lấy chồng | Quan | Người nam |

Tài/Quan là Dụng thần CHÍNH, quan trọng hơn Ứng (khác đa số việc khác). Nguyên tắc: Tài/Quan hưu tù/phá/tán/Mộ/Tuyệt/Không = khó có đôi lứa xứng; miễn cưỡng thành hôn thì tổn thương nhau. Thế tĩnh lâm Không hoặc hóa thoái thần = thất vọng không thành. Quẻ phản ngâm hoặc nhiều hào loạn động = khó thành. Xem tính cách/ngoại hình theo ngũ hành Dụng thần: Kim vượng=thanh tú, Mộc vượng=xinh đẹp, Thổ vượng=đậm người, Thủy vượng=thông tuệ khéo nói. Xem đối phương đã có người yêu/kết hôn chưa: dùng Phục Thần — Quan phục dưới Tài=nam đã có vợ; Tài phục dưới Quan=nữ đã có chồng.

### 1.6. Xuất hành, đi xa

| Dụng thần | Trả lời | Diễn giải |
|---|---|---|
| Thế | Có nên đi? Có an toàn? | Hưu tù/Không/Phá/động hóa hung = không nên đi. Thế khắc Ứng = thuận lợi |
| Ứng | Nơi đến có thuận lợi? | Ứng gặp Mộ/Tuyệt hoặc động biến Quan Quỷ = dù cố đi cũng vô ích |
| Phụ Mẫu | Hành lý, xe thuyền | Vượng=nhiều/thuận; hưu tù=ít; động khắc Thế=trở ngại dọc đường |
| Tài | Lộ phí | Vượng=nhiều; hưu tù=ít; động hình khắc Thế=vì tiền mà gặp họa |

Tử Tôn trì Thế hoặc phát động = đi xa vạn dặm vẫn bình an (luôn là "cứu tinh"). Quan Quỷ trì Thế/khắc Thế = bất lợi, tai họa bất ngờ — theo Lục Thần: Huyền Vũ→cướp, Chu Tước→kiện tụng, Bạch Hổ→bệnh tật, Đằng Xà→nguy hiểm, Câu Trần→giam giữ, Thanh Long→cờ bạc.

---

## Bước 2 — Phân tích cát hung (≥2 tín hiệu mới kết luận, không kết luận suông)

Xét đủ các lớp sau — đây là nơi phần lớn AI luận chán vì chỉ dừng ở 1-2 lớp đầu:

### 2.1. Không Vong (tính theo tuần Giáp của ngày lập quẻ)

| Tuần (khởi từ) | Không Vong |
|---|---|
| Giáp Tý | Tuất, Hợi |
| Giáp Tuất | Thân, Dậu |
| Giáp Thân | Ngọ, Mùi |
| Giáp Ngọ | Thìn, Tị |
| Giáp Thìn | Dần, Mão |
| Giáp Dần | Tý, Sửu |

### 2.2. Vượng suy theo mùa (Nguyệt lệnh, tính theo tiết khí thực, không phải tên tháng âm lịch)

| Mùa | Vượng | Tướng | Hưu | Tù | Tử |
|---|---|---|---|---|---|
| Xuân (Dần Mão) | Mộc | Hỏa | Thủy | Kim | Thổ |
| Hạ (Tị Ngọ) | Hỏa | Thổ | Mộc | Thủy | Kim |
| Tứ quý (Thìn Tuất Sửu Mùi) | Thổ | Kim | Hỏa | Mộc | Thủy |
| Thu (Thân Dậu) | Kim | Thủy | Thổ | Hỏa | Mộc |
| Đông (Hợi Tý) | Thủy | Mộc | Kim | Thổ | Hỏa |

### 2.3. Cân lực hào — kết hợp cả Nhật + Nguyệt (chính xác hơn chỉ xét Nguyệt)

| Trạng thái với Nhật + Nguyệt | Kết luận |
|---|---|
| Được cả Nhật và Nguyệt sinh/phù | Vượng |
| Bị cả Nhật và Nguyệt xung | Thực phá — vô lực hoàn toàn |
| Bị cả Nhật và Nguyệt khắc | Suy cùng cực |
| Được Nhật sinh phù nhưng bị Nguyệt khắc | Trung hòa |
| Được Nguyệt sinh phù nhưng tiết khí cho Nhật | Trung hòa |
| Được Nhật sinh phù nhưng tiết khí cho Nguyệt | Trung hòa |
| Được Nhật sinh phù nhưng khắc xuất Nguyệt | Trung hòa, hơi vượng |

Thứ tự xét 1 hào: Nguyệt kiến? → Nguyệt phá? → Tam/Nhị hợp với Nguyệt? → sinh khắc thường; rồi lặp lại với Nhật. Đặc biệt: hào **vượng** bị Nhật xung = **ám động** (lợi, không phải suy); hào **hưu tù tĩnh** bị Nhật xung = **Nhật phá** (hại); hào **đang động** bị Nhật xung = **Nhật tán** (hại, mất tác dụng động).

### 2.4. Nguyệt phá

Hào bị Địa Chi Nguyệt lệnh xung (lục xung: Tý-Ngọ, Sửu-Mùi, Dần-Thân, Mão-Dậu, Thìn-Tuất, Tị-Hợi) → suy yếu nghiêm trọng bất kể vượng suy theo mùa. Giải: đợi qua tháng (Thực Phá) hoặc có địa chi khác Hợp giữ lại (Hợp Phá).

### 2.5. Lục thần theo Thiên Can ngày

| Can ngày | Hào 1 | Hào 2 | Hào 3 | Hào 4 | Hào 5 | Hào 6 |
|---|---|---|---|---|---|---|
| Giáp Ất | Thanh Long | Chu Tước | Câu Trần | Đằng Xà | Bạch Hổ | Huyền Vũ |
| Bính Đinh | Chu Tước | Câu Trần | Đằng Xà | Bạch Hổ | Huyền Vũ | Thanh Long |
| Mậu | Câu Trần | Đằng Xà | Bạch Hổ | Huyền Vũ | Thanh Long | Chu Tước |
| Kỷ | Đằng Xà | Bạch Hổ | Huyền Vũ | Thanh Long | Chu Tước | Câu Trần |
| Canh Tân | Bạch Hổ | Huyền Vũ | Thanh Long | Chu Tước | Câu Trần | Đằng Xà |
| Nhâm Quý | Huyền Vũ | Thanh Long | Chu Tước | Câu Trần | Đằng Xà | Bạch Hổ |

Ý nghĩa nhanh: Thanh Long=vui/háo sắc/quý nhân; Chu Tước=lời nói/thị phi/văn thư; Câu Trần=chậm chạp/kiến trúc/ràng buộc/u bướu; Đằng Xà=lo lắng/hư ảo/quái dị; Bạch Hổ=hung dữ/tang sự/tai nạn/phẫu thuật; Huyền Vũ=ám muội/trộm cắp/che giấu/dâm loạn.

### 2.6. Hào động — hồi đầu sinh/khắc, Tiến/Thoái Thần

- Hào động biến ra hào SINH cho hào gốc → **hồi đầu sinh** (tăng lực).
- Hào động biến ra hào KHẮC hào gốc → **hồi đầu khắc** (giảm lực/gây hại).
- Hào gốc SINH cho hào biến (không phải ngược lại) → gọi **sinh xuất/tiết khí** (hào gốc tự hao để nuôi hào biến), KHÔNG gọi hồi đầu sinh — hai tên đó chỉ dùng khi hào biến tác động NGƯỢC lại hào gốc.
- **Hóa Tiến Thần** (lực tăng dần theo thời gian): Dần→Mão, Tị→Ngọ, Thân→Dậu, Hợi→Tý (4 hành Mộc/Hỏa/Kim/Thủy); riêng Thổ đi vòng riêng: Sửu→Thìn→Mùi→Tuất→Sửu.
- **Hóa Thoái Thần** (lực giảm dần): chiều ngược lại — Mão→Dần, Ngọ→Tị, Dậu→Thân, Tý→Hợi; Thổ: Thìn→Sửu, Mùi→Thìn, Tuất→Mùi, Sửu→Tuất.
- Hào biến bị chính Nhật thần xung → lực biến bị cản tạm thời trong ngày đó, hết ngày xung thì hết cản.

### 2.7. Phục Thần (khi Dụng thần không lộ trên quẻ chính)

An theo bát cung gốc của quẻ để tìm Phi Thần tương ứng. Xét quan hệ:
- Phục sinh Phi: Phục Thần bị tiết khí, khó thấu lộ — thường bất lợi.
- Phi sinh Phục: Phục Thần được tiếp sức, dễ thấu lộ — thường thuận lợi.
- Phi khắc Phục: Phục Thần bị đè, khó ngoi lên.
- Phục khắc Phi: Phục Thần vẫn hao tổn nhưng còn sinh khí riêng.

### 2.8. 12 cung Trường Sinh (dùng tính Nhập Mộ và Ứng Kỳ)

| | Trường sinh | Mộc dục | Quan đới | Lâm Quan | Đế Vượng | Suy | Bệnh | Tử | Mộ | Tuyệt | Thai | Dưỡng |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Hỏa | Dần | Mão | Thìn | Tị | Ngọ | Mùi | Thân | Dậu | Tuất | Hợi | Tý | Sửu |
| Kim | Tị | Ngọ | Mùi | Thân | Dậu | Tuất | Hợi | Tý | Sửu | Dần | Mão | Thìn |
| Mộc | Hợi | Tý | Sửu | Dần | Mão | Thìn | Tị | Ngọ | Mùi | Thân | Dậu | Tuất |
| Thủy/Thổ | Thân | Dậu | Tuất | Hợi | Tý | Sửu | Dần | Mão | Thìn | Tị | Ngọ | Mùi |

→ 4 Mộ Khố: Kim mộ Sửu, Thủy/Thổ mộ Thìn, Mộc mộ Mùi, Hỏa mộ Tuất.

**4 dạng Nhập Mộ**: (1) nhập Mộ tại Nhật/Nguyệt — hào đúng vào Địa Chi Mộ của ngũ hành mình; (2) Hóa Mộ — hào động biến ra đúng Mộ Khố của chính nó; (3) nhập hào Mộ đang động trong quẻ; (4) Tùy Quỷ Nhập Mộ — riêng khi Thế/Dụng là Quan Quỷ và bị nhập Mộ, tình huống thêm bó buộc.

**Nguyên tắc cốt lõi**: không phải cứ nhập Mộ là xấu — Thế/Dụng đang **vượng** mà nhập Mộ chỉ là cản trở tạm ("mộ giả"), đợi ngày xung Mộ Khố lại thông; Thế/Dụng đang **hưu tù/bị khắc** mà nhập Mộ mới là "mộ thật", khó gỡ. Mộ Khố đã bị xung phá từ trước thì cũng hết tác dụng giam giữ.

### 2.9. Hợp / Xung / Tam hợp cục / Tam hình

- **Lục hợp**: Tý-Sửu, Dần-Hợi, Mão-Tuất, Thìn-Dậu, Tị-Thân, Ngọ-Mùi
- **Lục xung**: Tý-Ngọ, Sửu-Mùi, Dần-Thân, Mão-Dậu, Thìn-Tuất, Tị-Hợi
- **Tam hợp cục**: Hỏa cục Dần-Ngọ-Tuất; Thủy cục Thân-Tý-Thìn; Kim cục Tị-Dậu-Sửu; Mộc cục Hợi-Mão-Mùi
- **Tam hình**: bộ ba Dần-Tị-Thân (hình thật khi đủ 3); cặp Tý-Mão (tương hình, chỉ 2 chi)

**Điều kiện Tam hợp cục THỰC SỰ hình thành** (không phải đủ 3 chi là tự động thành):
1. Đủ 3 hào ĐỘNG mang đủ 3 chi của cục → chắc chắn nhất.
2. 2 hào động + mượn Nhật/Nguyệt làm chi thứ 3 — điều kiện: 1 trong 2 hào động phải là Đế Vượng của cục.
3. 2 hào cùng cục đang động + hào Đế Vượng của cục ĐỘNG HÓA ra đúng chi thứ 3 còn thiếu (nếu Đế Vượng chỉ nằm ở hào biến của hào khác thì KHÔNG tính).

Nếu 1 trong 3 chi của cục đang Không Vong/bị phá → cục coi như chưa hình thành thật, đợi Điền Thực. Nếu 1 chi đang nhập Mộ → đợi xung Mộ mới ứng.

**Ý nghĩa Hợp/Xung không cố định tốt/xấu** — phải xét vai trò hào trong quẻ: Hợp giữ được Kỵ Thần/Cừu Thần lại = tốt; Hợp giữ mất Dụng thần cần dùng = xấu. Xung làm "tán" — nếu là Kỵ Thần/Cừu Thần thì Xung là tốt (tan mất tác dụng); nếu là Dụng thần/điềm cát thì Xung là xấu (việc tốt cũng bị tán).

### 2.10. Nguyên Thần / Kỵ Thần / Cừu Thần

- **Nguyên Thần**: hào SINH Dụng thần — "cứu cánh", vượng và động thì cứu được Dụng thần suy.
- **Kỵ Thần**: hào KHẮC Dụng thần — "kẻ cản trở", nếu Dụng thần hưu tù mà Kỵ Thần động khắc thì việc thường hung.
- **Cừu Thần**: hào SINH Kỵ Thần đồng thời KHẮC Nguyên Thần — "kẻ thù gián tiếp", chặn đường cứu viện.
- Nguyên Thần/Kỵ Thần chỉ có tác dụng khi ĐỘNG — nếu chỉ xuất hiện mà không động thì coi như không ảnh hưởng.

### 2.11. Quy trình 10 bước tổng hợp (dùng làm checklist cuối)

1. Xét Dụng thần (và Thế/Ứng nếu liên quan "ta vs người", Phi/Phục nếu Dụng thần ẩn) — vượng/suy, Không/Mộ/Tuyệt/Phá, ai sinh ai khắc.
2. Xét Dụng thần có Không Vong THẬT hay không (phân biệt "bất Không" — đang vượng/động/được sinh/hào biến bị Không không tính — với "Không thật" — Nhật phá, hưu tù tĩnh, hoặc **Chân Không/Trực Không**: vừa Không Vong vừa đang Tử theo mùa).
3. Xét Nguyên Thần: nên vượng, nên động.
4. Xét Kỵ Thần: nên tĩnh, nên bị chế.
5. Xét Nhật/Nguyệt: không chỉ tính vượng suy mà là yếu tố quyết định thành-bại tổng thể.
6. Xét động tĩnh toàn bộ 6 hào: quẻ toàn tĩnh → trọng tâm chuyển sang Nhật/Nguyệt; quẻ loạn động (nhiều hào cùng động) → việc trắc trở.
7. Xét Tam hợp/Lục hợp cục: cục thuộc phe Dụng/Nguyên Thần = cát; thuộc phe Kỵ/Cừu Thần = đại hung.
8. Luận cát hung tổng hợp — dựa cả 7 bước trên, KHÔNG kết luận từ 1 yếu tố đơn lẻ.
9. Xác định Ứng Kỳ (xem Bước 4 bên dưới).
10. Xét thông tin phụ khác (Lục Thần bổ nghĩa, thần sát khác nếu có).

---

## Bước 3 — Thủ tượng: tìm nguyên nhân cốt lõi (bước hay bị bỏ qua, quan trọng nhất)

Phải "thủ tượng" được từng hào/địa chi đang đại diện sự vật cụ thể gì trong đời thực người hỏi — không dừng ở "tốt/xấu" chung chung.

**8 quái — thủ tượng cơ bản**: mỗi quái có phương vị, thân thể, đồ vật, con người, con vật riêng (Càn=Tây Bắc/đầu/kim loại/người cha/ngựa; Khôn=Tây Nam/bụng/đất đai/người mẹ/trâu bò; Chấn=Đông/chân/gỗ/con trưởng nam/rồng; Tốn=Đông Nam/đùi/gỗ mềm/con trưởng nữ/gà; Khảm=Bắc/tai/nước/con thứ nam/heo; Ly=Nam/mắt/lửa/con thứ nữ/chim trĩ; Cấn=Đông Bắc/tay/núi đá/con út nam/chó; Đoài=Tây/miệng/đầm/con út nữ/dê).

**12 địa chi — thủ tượng theo buổi sáng/ngày/đêm**, phản cung phương vị và vật phẩm phong thủy tương ứng.

**Ví dụ cách dùng**: hào Quan Quỷ động là Tuất Thổ lâm Câu Trần → Câu Trần chủ kiến trúc/chậm chạp, Tuất thuộc quái Càn (Tây Bắc) → không chỉ "có Quan Quỷ xấu" mà là "công trình/kiến trúc phía Tây Bắc nhà đang gây ảnh hưởng".

**Đào sâu thêm** (khi cần): thủ tượng chi tiết theo từng quẻ trong 64 quẻ (không chỉ đơn quái riêng lẻ) cho hình ảnh cụ thể hơn nữa.

---

## Bước 3.5 — Đối chiếu án lệ tương tự (nếu có sẵn ngân hàng án lệ)

Trước khi chốt kết luận, quét qua kho án lệ thực tế theo chủ đề (sức khỏe, tâm linh/ma quái, gia đình/hôn nhân, công việc/tài vận/pháp lý, phong thủy/nhà cửa). Nếu có case cùng chủ đề/kiểu tình huống, tham khảo cách tác giả luận (không phải cách chọn vật hóa giải — phần đó ngoài phạm vi tài liệu này).

**Chỉ lấy tinh thần luận giải, KHÔNG copy nguyên kết luận sang quẻ đang xem** — Dụng thần, sinh khắc, Không Vong của quẻ mới luôn phải tự tính lại từ đầu theo Bước 1-3. Không có case đủ gần thì bỏ qua bước này.

---

## Bước 4 — Ứng Kỳ: xác định "khi nào" (bước người hỏi thường quan tâm nhất, hay bị AI né tránh)

Áp dụng đúng quy luật tùy trạng thái Dụng thần lúc lập quẻ:

| Trạng thái Dụng thần | Ứng Kỳ |
|---|---|
| Tĩnh | Ngày/tháng Trị (trùng chi) hoặc Xung |
| Động | Ngày/tháng Trị của chính hào động; nếu Dụng thần an tĩnh đang chờ thì lấy ngày Hợp |
| Quá vượng, việc hung | Ngày/tháng SINH cho Dụng thần (vượng cực sinh họa — "vật cực tất phản") |
| Quá vượng, việc cát | Ngày/tháng nhập Mộ hoặc gặp Xung (cần "hãm" mới ứng, như lúa chín phải gặt) |
| Hưu tù gặp Trường Sinh | Ngày/tháng ứng cung Trường Sinh — NHƯNG nếu suy kiệt cùng cực (vd bệnh nguy) thì "gặp sinh" lại là điềm xấu |
| Nhập Mộ / bị Hợp giữ chân | Ngày/tháng Xung Mộ / Xung Hợp |
| Bị Nguyệt Phá | Ngày/tháng Điền Thực (trùng chi), Hợp, hoặc đơn giản sang tháng kế |
| Bị Tuần Không | Ngày/tháng Xung Không hoặc Điền Thực |
| Phục Tàng (ẩn dưới Phi Thần) | Ngày/tháng Xung Phục Thần, Trị Phục Thần, hoặc Xung Phi Thần |

**Bổ sung quan trọng**:
- Việc lớn/xa → ứng theo năm/tháng; việc nhỏ/gấp → ứng theo ngày/giờ.
- Đại tượng tốt mà bị khắc → Ứng Kỳ là ngày/tháng khắc lại chính cái đang khắc Dụng thần. Đại tượng hung mà bị khắc không ai cứu → Ứng Kỳ là ngày/tháng của chính hành đang khắc (họa đến đúng lúc kỵ thần vượng nhất).
- **Độc Phát/Độc Tĩnh** (5 hào 1 kiểu, 1 hào khác kiểu) → hào lẻ loi đó thường là chìa khóa quyết định tốc độ ứng nghiệm, ưu tiên xét trước.
- Nhiều trạng thái cùng lúc (vd vừa Không vừa Nguyệt phá) → Nguyệt phá (cản cả tháng) nặng hơn Không Vong (cản 10 ngày), xét trở ngại lớn trước.
- Gặp Lục Hợp cần có yếu tố kích động mới tính Ứng Kỳ — hợp suông với Nhật/Nguyệt hoặc hợp tĩnh chưa đủ, cần đợi ngày XUNG PHÁ cái hợp đó.
- Hợp/Xung "có mừng có lo" tùy loại việc: việc cát gặp hợp = mừng; việc buồn/xuất hành gặp hợp = dở (như bị vướng chân). Bệnh mới phát gặp hợp = kéo dài; bệnh lâu ngày gặp hợp = nguy hiểm (ngược lại với xung).

---

## Nguyên tắc đạo đức khi luận (bắt buộc, không thương lượng)

- Không luận mập mờ kiểu "nhanh thì tháng X, chậm thì tháng Y" để giữ khách quay lại — nói thẳng nguyên nhân cốt lõi và kết luận thực chất.
- Vấn đề sức khỏe nghiêm trọng → luôn nhắc đi khám bác sĩ; luận quẻ chỉ tham khảo thêm, không thay thế y tế.
- Chưa đủ dữ kiện để chắc chắn → nói rõ "chưa chắc chắn" thay vì đoán bừa cho có vẻ đầy đủ.

---

## Định dạng output chuẩn (4 phần — không bao gồm hóa giải)

1. **Xác định Dụng thần** — ngắn gọn, nêu rõ vì sao chọn Dụng thần đó.
2. **Phân tích cát hung** — đi qua các lớp ở Bước 2, mỗi ý nêu rõ suy luận sinh khắc/Không Vong/vượng suy đi kèm — **không kết luận suông**.
3. **Nguyên nhân cốt lõi** — 1 đoạn tổng hợp, dùng thủ tượng để cụ thể hóa vấn đề.
4. **Kết luận** — trả lời thẳng câu hỏi ban đầu, kèm Ứng Kỳ nếu người hỏi quan tâm "khi nào".

Phần hóa giải (chọn phương pháp, vật phẩm, thời điểm hành động) nằm ngoài phạm vi tài liệu này.

---

## Ghi chú về độ tin cậy nguồn

Phần lớn nội dung trên trích trực tiếp từ sách nguồn, có đối chiếu chéo nhiều tác giả khi trùng lặp. Hai chỗ được đánh dấu rõ là suy luận mở rộng (chưa có nguồn trực tiếp xác nhận): mục "Cạnh tranh không qua trọng tài" (Bước 1.1) và kỹ thuật so sánh nhiều phương án A/B/C (không đưa vào bản này vì cần bàn riêng — hỏi nếu cần). Khi luận thực tế gặp trường hợp không chắc chắn, nên nói rõ với khách thay vì áp dụng máy móc.
