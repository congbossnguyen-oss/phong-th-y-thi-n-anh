# Quy trình tổng thể luận quẻ Lục Hào — spec cho app trên Claude Code

Tài liệu này đúc kết toàn bộ quy trình luận giải một quẻ Lục Hào đã lập sẵn, tổng hợp từ skill `hoa-giai-kinh-dich` (đã build trong phiên làm việc trước, dựa trên ~13 đầu sách của Vương Hổ Ứng, Nguyễn Huy Hoàng, Giả Bỉnh Nhiên, Học Viện Minh Việt). Mục tiêu: dùng làm spec kỹ thuật để build app luận quẻ trên Claude Code — tách rõ phần nào là **tính toán thuần túy** (nên code cứng, deterministic) và phần nào **cần LLM suy luận/phán đoán** (không nên code cứng, dễ sai khi ép thành rule).

---

## 1. Kiến trúc tổng quan

```
INPUT (quẻ đã lập + câu hỏi)
   │
   ├─► LỚP 1: CHUẨN HÓA & VALIDATE INPUT (code thuần)
   │
   ├─► LỚP 2: TÍNH TOÁN CƠ HỌC (code thuần — deterministic, không cần LLM)
   │      Không Vong, vượng suy, Nguyệt phá, Nhật thần tác động,
   │      hợp/xung/hình/hại, Tam hợp cục, Tiến/Thoái Thần,
   │      Trường Sinh 12 cung, Nhập Mộ, Phi/Phục Thần cơ học
   │
   ├─► LỚP 3: XÁC ĐỊNH DỤNG THẦN (rule-based + fallback LLM khi việc lạ)
   │
   ├─► LỚP 4: LUẬN CÁT HUNG TỔNG HỢP (cần LLM — tổng hợp nhiều lớp tín hiệu)
   │
   ├─► LỚP 5: THỦ TƯỢNG / NGUYÊN NHÂN CỐT LÕI (cần LLM — diễn giải biểu tượng)
   │
   ├─► LỚP 6: ỨNG KỲ — thời điểm ứng nghiệm (rule-based + LLM chọn rule đúng)
   │
   ├─► LỚP 7: HÓA GIẢI (cần LLM — sáng tạo trong khung nguyên tắc)
   │
   └─► OUTPUT (5 phần: Dụng thần → Phân tích → Nguyên nhân → Kết luận → Hóa giải)
```

**Nguyên tắc thiết kế quan trọng nhất:** Lớp 2 (tính toán cơ học) phải là code xác định (deterministic functions), KHÔNG giao cho LLM — vì đây là toán logic thuần túy (ngũ hành sinh khắc, lịch can chi, bảng tra) và LLM dễ tính sai/nhớ nhầm bảng khi làm thủ công. Ngược lại, lớp 4-5-7 (luận cát hung tổng hợp, thủ tượng, hóa giải) bắt buộc cần LLM vì đòi hỏi tổng hợp nhiều tín hiệu mâu thuẫn và diễn giải theo ngữ cảnh câu hỏi — không nên ép thành rule cứng.

---

## 2. Input schema cần có

Một quẻ hợp lệ để luận cần tối thiểu các trường sau:

| Trường | Mô tả | Bắt buộc |
|---|---|---|
| `ngay_gio_lap_que` | Can Chi Năm/Tháng/Ngày (Giờ nếu có) lúc lập quẻ | Có |
| `nguyet_lenh` | Tiết khí thực tế của tháng (không phải tên tháng âm lịch danh nghĩa) | Có |
| `cau_hoi` | Loại việc hỏi (cầu tài, bệnh, hôn nhân, phong thủy...) | Có — quyết định Dụng thần |
| `6_hao` | Với mỗi hào: Lục thân, Can Chi, hào Thế/Ứng, động/tĩnh | Có |
| `luc_than_tung_hao` | Thanh Long/Chu Tước/Câu Trần/Đằng Xà/Bạch Hổ/Huyền Vũ | Nên có (suy ra được từ Can ngày nếu thiếu) |
| `que_bien` | Lục thân + Can Chi quẻ biến (nếu có hào động) | Có nếu có hào động |
| `khong_vong` | Suy ra được từ ngày lập quẻ, không bắt buộc nhập tay | Tính được |
| `phuc_than` | Chỉ cần nếu Dụng thần không lộ trên quẻ chính | Tính được (an theo bát cung) |

**Lưu ý kiến trúc:** phần lớn field có thể **tính suy ra** từ 3 dữ kiện gốc (ngày lập quẻ + quẻ chính theo bát cung + hào động) thay vì bắt người dùng nhập tay — an Lục Thân, an Lục Thần, an Không Vong, an Phục Thần đều là thuật toán tra bảng thuần túy. Chỉ nên bắt nhập tay khi người dùng dán bảng có sẵn từ phần mềm khác (auto-parse) hoặc khi họ tự gieo quẻ thủ công.

---

## 3. LỚP 2 — Các module tính toán thuần túy (code cứng, có bảng tra chính xác)

Đây là phần quan trọng nhất để app "không bịa" — mọi bảng dưới đây đã được đối chiếu và có thể code thành hằng số/lookup table.

### 3.1. Ngũ hành cơ bản
- 10 Thiên Can → ngũ hành, 12 Địa Chi → ngũ hành
- Ngũ hành tương sinh: Mộc→Hỏa→Thổ→Kim→Thủy→Mộc
- Ngũ hành tương khắc: Mộc→Thổ→Thủy→Hỏa→Kim→Mộc

### 3.2. Không Vong (tính theo tuần Giáp của ngày lập quẻ)

| Tuần (khởi từ) | Không Vong |
|---|---|
| Giáp Tý | Tuất, Hợi |
| Giáp Tuất | Thân, Dậu |
| Giáp Thân | Ngọ, Mùi |
| Giáp Ngọ | Thìn, Tị |
| Giáp Thìn | Dần, Mão |
| Giáp Dần | Tý, Sửu |

Thuật toán: từ Can Chi ngày, quy về chu kỳ 60 Giáp Tý → xác định tuần → 2 chi cuối tuần (chưa dùng tới) là Không Vong.

### 3.3. Vượng suy theo mùa (Nguyệt lệnh, tính theo tiết khí)

| Mùa | Vượng | Tướng | Hưu | Tù | Tử |
|---|---|---|---|---|---|
| Xuân (Dần Mão) | Mộc | Hỏa | Thủy | Kim | Thổ |
| Hạ (Tị Ngọ) | Hỏa | Thổ | Mộc | Thủy | Kim |
| Tứ quý (Thìn Tuất Sửu Mùi) | Thổ | Kim | Hỏa | Mộc | Thủy |
| Thu (Thân Dậu) | Kim | Thủy | Thổ | Hỏa | Mộc |
| Đông (Hợi Tý) | Thủy | Mộc | Kim | Thổ | Hỏa |

### 3.4. Cân lực hào — kết hợp Nhật + Nguyệt (chi tiết hơn bảng trên)

| Trạng thái với Nhật + Nguyệt | Kết luận |
|---|---|
| Được cả Nhật và Nguyệt sinh/phù | Vượng |
| Bị cả Nhật và Nguyệt xung | Thực phá — vô lực hoàn toàn |
| Bị cả Nhật và Nguyệt khắc | Suy cùng cực |
| Được Nhật sinh phù nhưng bị Nguyệt khắc | Trung hòa |
| Được Nguyệt sinh phù nhưng tiết khí cho Nhật | Trung hòa |
| Được Nhật sinh phù nhưng tiết khí cho Nguyệt | Trung hòa |
| Được Nhật sinh phù nhưng khắc xuất Nguyệt | Trung hòa, hơi vượng |

Thứ tự ưu tiên khi xét 1 hào: (1) Nguyệt kiến? → Nguyệt phá? → Tam/Nhị hợp với Nguyệt? → sinh khắc thường; (2) rồi lặp lại với Nhật; (3) đặc biệt: hào vượng bị Nhật xung = **ám động** (lợi, không phải suy); hào hưu tù tĩnh bị Nhật xung = **Nhật phá** (hại); hào đang động bị Nhật xung = **Nhật tán** (hại).

### 3.5. 12 cung Trường Sinh (vòng đời ngũ hành — dùng tính Nhập Mộ, Ứng Kỳ)

| | Trường sinh | Mộc dục | Quan đới | Lâm Quan | Đế Vượng | Suy | Bệnh | Tử | Mộ | Tuyệt | Thai | Dưỡng |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Hỏa | Dần | Mão | Thìn | Tị | Ngọ | Mùi | Thân | Dậu | Tuất | Hợi | Tý | Sửu |
| Kim | Tị | Ngọ | Mùi | Thân | Dậu | Tuất | Hợi | Tý | Sửu | Dần | Mão | Thìn |
| Mộc | Hợi | Tý | Sửu | Dần | Mão | Thìn | Tị | Ngọ | Mùi | Thân | Dậu | Tuất |
| Thủy/Thổ | Thân | Dậu | Tuất | Hợi | Tý | Sửu | Dần | Mão | Thìn | Tị | Ngọ | Mùi |

→ 4 Mộ Khố: Kim mộ Sửu, Thủy/Thổ mộ Thìn, Mộc mộ Mùi, Hỏa mộ Tuất. Đây là cơ sở tính **Nhập Mộ** (4 dạng: nhập Mộ tại Nhật/Nguyệt, Hóa Mộ, nhập hào Mộ đang động, Tùy Quỷ Nhập Mộ).

### 3.6. Lục thần theo Thiên Can ngày

| Can ngày | Hào 1 | Hào 2 | Hào 3 | Hào 4 | Hào 5 | Hào 6 |
|---|---|---|---|---|---|---|
| Giáp Ất | Thanh Long | Chu Tước | Câu Trần | Đằng Xà | Bạch Hổ | Huyền Vũ |
| Bính Đinh | Chu Tước | Câu Trần | Đằng Xà | Bạch Hổ | Huyền Vũ | Thanh Long |
| Mậu | Câu Trần | Đằng Xà | Bạch Hổ | Huyền Vũ | Thanh Long | Chu Tước |
| Kỷ | Đằng Xà | Bạch Hổ | Huyền Vũ | Thanh Long | Chu Tước | Câu Trần |
| Canh Tân | Bạch Hổ | Huyền Vũ | Thanh Long | Chu Tước | Câu Trần | Đằng Xà |
| Nhâm Quý | Huyền Vũ | Thanh Long | Chu Tước | Câu Trần | Đằng Xà | Bạch Hổ |

### 3.7. Hợp / Xung / Hình / Tam hợp cục

- **Lục hợp Địa Chi**: Tý-Sửu, Dần-Hợi, Mão-Tuất, Thìn-Dậu, Tị-Thân, Ngọ-Mùi
- **Lục xung**: Tý-Ngọ, Sửu-Mùi, Dần-Thân, Mão-Dậu, Thìn-Tuất, Tị-Hợi
- **Tam hợp cục**: Hỏa cục Dần-Ngọ-Tuất, Thủy cục Thân-Tý-Thìn, Kim cục Tị-Dậu-Sửu, Mộc cục Hợi-Mão-Mùi
- **Tam hình**: bộ ba Dần-Tị-Thân (tam hình thật); cặp Tý-Mão (tương hình, chỉ 2 chi)
- **Điều kiện Tam hợp cục THỰC SỰ hình thành** (không phải cứ đủ 3 chi là tự động thành cục — xem mục 11 của `kien-thuc-bo-sung.md` để code chính xác 3 dạng điều kiện): (1) đủ 3 hào động mang 3 chi của cục; (2) 2 hào động + mượn Nhật/Nguyệt làm chi thứ 3, với điều kiện 1 trong 2 hào động phải là Đế Vượng của cục; (3) 2 hào động cùng cục + hào Đế Vượng động hóa ra đúng chi còn thiếu.
- **Tiến Thần / Thoái Thần**: nhóm Mộc/Hỏa/Kim/Thủy đi theo chiều Dần→Mão, Tị→Ngọ, Thân→Dậu, Hợi→Tý (Tiến) và ngược lại (Thoái); nhóm Thổ đi vòng riêng Sửu→Thìn→Mùi→Tuất→Sửu (Tiến) và ngược (Thoái).

### 3.8. An Phục Thần / Phi Thần

Khi Dụng thần không lộ trên quẻ chính, an theo bát cung gốc của quẻ để tìm hào Phục Thần và Phi Thần tương ứng — đây là thuật toán tra bảng bát cung tiêu chuẩn (64 quẻ × 8 cung), có thể code cứng thành bảng tra.

---

## 4. LỚP 3 — Xác định Dụng thần (rule-based, có fallback)

### 4.1. Bảng tra theo loại việc hỏi (rule cố định)

| Việc hỏi | Dụng thần |
|---|---|
| Cầu tài, kinh doanh, đầu tư | Thê Tài |
| Hôn nhân (nam hỏi vợ / nữ hỏi chồng) | Thê Tài (nam) / Quan Quỷ (nữ) |
| Công danh, chức vụ, thi cử, kiện tụng | Quan Quỷ |
| Sức khỏe, bệnh tật | Thế hào; xét thêm Tử Tôn (thuốc men) |
| Con cái, học trò, vật nuôi | Tử Tôn |
| Cha mẹ, nhà cửa, giấy tờ, hợp đồng, mộ phần | Phụ Mẫu |
| Anh chị em, bạn bè, đối thủ | Huynh Đệ |
| Bản thân / vận hạn chung | Hào Thế |
| Đối phương / người khác | Hào Ứng |
| Thai sản (mẹ + con) | Tử Tôn + **Hào Thai** (khái niệm riêng) |
| Hợp tác, hùn vốn, liên doanh | **KHÔNG dùng 1 lục thân cố định** — dùng khung Thế (ta) / Ứng (đối tác), xem mục 4.3 |
| Vay tiền / đòi nợ / bắt đền | **KHÔNG dùng Thê Tài đơn giản** — quy trình 2 bước riêng, xem mục 4.4 |
| Tình duyên (xem duyên, chọn vợ/chồng — TRƯỚC khi cưới) | Tài (nam) / Quan (nữ) — khác bảng riêng so với "Vợ chồng" đã cưới, xem mục 4.5 |
| Thi đấu, giành giải, xếp hạng | Quan Quỷ (thi có thứ bậc) hoặc Phụ Mẫu (chỉ nhận giấy chứng nhận) |
| Cạnh tranh với đối thủ (không phải thi có trọng tài) | Huynh Đệ đại diện đối thủ; nếu đối đầu trực diện 1-1 thì dùng Thế (ta) / Ứng (đối thủ) |
| Xuất hành, đi xa | 4 Dụng thần cùng lúc: Thế (bản thân), Ứng (nơi đến), Phụ Mẫu (hành lý/xe thuyền), Tài (lộ phí) — xem mục 4.6 |

### 4.2. Xử lý Dụng thần lưỡng hiện (2 hào cùng lục thân đều hợp lệ)

Thứ tự ưu tiên chọn (nên code thành hàm quyết định tuần tự):
1. Một tĩnh một động → chọn hào ĐỘNG.
2. Cả hai cùng trạng thái → chọn hào KHÔNG bị Không Vong/Nguyệt phá.
3. Vẫn ngang nhau → chọn hào đang Xung hoặc Hợp (biến động rõ hơn).
4. Vẫn ngang nhau → ưu tiên hào lâm Thế, sau đó mới đến lâm Ứng.
5. Nếu Địa Chi 2 hào giống hệt nhau → phân biệt bằng hào vị + Lục Thần.
6. Một số trường hợp đặc biệt phải lấy CẢ HAI làm Dụng thần song song (ví dụ 2 nguồn thu nhập, 2 căn nhà).

### 4.3. Hợp tác / hùn vốn / liên doanh — khung Thế-Ứng (nguồn: Tài Vận Bí Pháp Ch.IX Tiết 4)

Đây là 1 trong 4 kiểu "cầu tài" đặc biệt KHÔNG dùng lục thân cố định làm Dụng thần mà dùng quan hệ Thế-Ứng để so sánh 2 bên:

1. **Bước 1 — thực lực 2 bên**: Thế lâm Tài vượng = bên ta có vốn; Ứng lâm Tài vượng (hoặc cung Thê Tài của Ứng vượng) = đối phương có vốn. Ứng cung Phụ Mẫu vượng = công ty đối phương quy mô lớn; Ứng cung Quan Quỷ vượng = đối phương có nền tảng/quan hệ chính quyền.
2. **Bước 2 — thiện chí hợp tác** (xét sinh khắc Thế-Ứng):

   | Quan hệ Thế-Ứng | Ý nghĩa |
   |---|---|
   | Ứng sinh Thế hoặc Thế-Ứng tương hợp | Tốt nhất — đối phương thiện chí, hợp tác vui vẻ |
   | Thế-Ứng tỷ hòa | Trung bình, tạm ổn |
   | Thế-Ứng tương khắc/tương xung | Xấu — khó thống nhất, dễ tranh chấp (bên khắc là bên lấn át) |

3. **Bước 3 — có sinh lời không**: Tài phải có "chỗ đi" (thường là Huynh Đệ động khắc Thê Tài — nghĩa là vốn được giải ngân, thương vụ thành hình) VÀ có "chỗ đến" (Tử Tôn — căn nguyên của Tài — vượng tướng sinh Tài) thì mới thực sự sinh lời bền lâu. Tử Tôn hưu tù/nhập mộ/bị khắc → dù hợp tác thành cũng không có lợi nhuận lâu dài.
4. **Dấu hiệu đối tác không đáng tin**: hào Ứng lâm Huynh Đệ hoặc Quan Quỷ mà mang Huyền Vũ (ám muội) hoặc Đằng Xà (nhiều tâm cơ) — nếu hào này khắc Thế thì chắc chắn bất lợi, nên tránh hợp tác.

### 4.4. Vay tiền / đòi nợ / bắt đền — quy trình 2 bước (nguồn: Tài Vận Bí Pháp Ch.VII)

**Lưu ý quan trọng khi code:** đây KHÔNG phải áp dụng nguyên tắc "nghịch lý đầu tư" (Tài bị khắc/tiết mới tốt — chỉ áp dụng riêng cho ĐẦU TƯ ở mục 4.3 file gốc/domain đầu tư, xem mục 8). Đòi nợ dùng khung khác hẳn: phải trả lời ĐỘC LẬP 2 câu hỏi — đối phương có **muốn** trả không, và có **khả năng** trả không. Thiếu 1 trong 2 là hỏng việc.

1. **Xét thái độ — quan hệ Thế/Ứng** (Thế = mình, Ứng = đối phương):

   | Trạng thái hào Ứng | Thái độ đối phương |
   |---|---|
   | Ứng khắc Thế, vượng, không bị chế | Dứt khoát không muốn trả, có thể phát sinh tranh chấp |
   | Ứng khắc Thế nhưng bị Không/Phá/bị chế | Miễn cưỡng trả vì giữ thể diện |
   | Ứng sinh Thế hoặc tỷ hòa, vượng, không Không không Phá | Thực lòng nguyện ý |
   | Ứng sinh Thế nhưng bị khắc chế/Không/nhập Mộ | Lời hứa suông — muốn giúp nhưng vướng mắc riêng |
   | Ứng phát động sinh Thế | Chủ động mang tiền tới |
   | Thế khắc Ứng (nhất là phát động) | Mình chủ động đòi, có tính ép buộc |

2. **Xét khả năng — cung Thê Tài của Ứng**: Ứng cung có Thê Tài vượng tướng = đối phương thực sự có tiền; Thê Tài không xuất hiện hoặc hưu tù/bị khắc/phá = đối phương thực sự khó khăn (dù thái độ tốt cũng vô ích). Ngoại lệ: đối tượng là ngân hàng/tổ chức tài chính lớn thì mặc định luôn "có tiền" — Thê Tài suy chỉ nên hiểu là "chính sách tín dụng thắt chặt", không phải "họ hết tiền".
   - **Dấu hiệu giả vờ không có tiền**: Thê Tài lâm Không Vong nhưng là hào ĐỘNG và bị Nhật thần xung thực (phá Không) → "giả tượng không có tiền", thực chất đối phương có nhưng lấy cớ thoái thác.
3. **Hào chủ nhân thay Ứng** (khi đối tượng nợ có quan hệ lục thân đặc thù với người hỏi): cầu tài từ bạn bè/anh em → dùng **Huynh Đệ**; từ nhà nước/kiện tụng/bắt đền → dùng **Quan Quỷ**; từ cha mẹ/người trên → dùng **Phụ Mẫu**. Hào chủ nhân sinh Thế = đối phương muốn cho; khắc Thế = không muốn.
4. **Phụ Mẫu = bằng chứng/giấy nợ**: phục tàng hoặc bị phá = không có bằng chứng, khó xử lý nếu đối phương chối; vượng tướng (nhất là phát động sinh Thế) = có bằng chứng vững, có thể dùng pháp luật.
5. **Quan Quỷ = quan phương/pháp luật**: phát động = khả năng cao phải nhờ pháp luật; sinh Thế = pháp luật ủng hộ mình; khắc Thế = kiện cũng vô ích; sinh Ứng = đối phương có thế lực hậu thuẫn, bất lợi cho mình.
6. **Ứng Kỳ đòi được nợ**: ngày/tháng Thê Tài trực (đến lượt vượng), ngày xung Không của Thê Tài, ngày xung phá kỵ thần đang khắc Thê Tài, ngày xung khai hợp (nếu Thê Tài bị hợp giữ), hoặc ngày xung/khắc "kho" (Mộ) đang giữ Thê Tài của đối phương.

### 4.5. Tình duyên (xem duyên, chọn vợ/chồng — TRƯỚC khi cưới) — khác "Vợ chồng" đã kết hôn (nguồn: Minh Việt sơ cấp Ch.XII.IX)

| Người xem | Dụng thần | Ứng đại diện |
|---|---|---|
| Nhà trai xem cô dâu tương lai | **Tài** | Nhà gái |
| Nhà gái xem chú rể tương lai | **Quan** | Nhà trai |
| Nam tự xem lấy vợ | **Tài** | Người nữ |
| Nữ tự xem lấy chồng | **Quan** | Người nam |

Lưu ý: Tài/Quan mới là Dụng thần chính, quan trọng hơn Ứng (khác đa số việc khác coi Ứng là đại diện đối phương chính). Nguyên tắc cốt lõi: Tài/Quan hưu tù/phá/tán/Mộ/Tuyệt/Không = khó có đôi lứa xứng đáng, nếu miễn cưỡng thành hôn thì tổn thương nhau. Thế tĩnh lâm Không hoặc hóa thoái thần = thất vọng không thành; Thế động lâm Không = đợi ngày thực Không sẽ thành. Quẻ phản ngâm hoặc nhiều hào loạn động = khó thành. Xem tính cách/ngoại hình đối tượng theo ngũ hành của Dụng thần (Kim vượng = thanh tú, Mộc vượng = xinh đẹp, Thổ vượng = đậm người, Thủy vượng = thông tuệ khéo nói). Xem đối phương có đang có người yêu/đã kết hôn chưa: dùng Phục Thần — Quan phục dưới Tài = nam đã có vợ; Tài phục dưới Quan = nữ đã có chồng.

*("Vợ chồng" — mục dành cho các cặp ĐÃ kết hôn hỏi về mức độ hòa hợp/bền lâu — dùng nguồn khác trong `luan-doan-tong-hop--phan-2...md` mục VIII, không trộn lẫn 2 domain này.)*

### 4.6. Xuất hành, đi xa (nguồn: Minh Việt sơ cấp Ch.XII.XIV)

4 Dụng thần đồng thời, mỗi hào trả lời 1 khía cạnh khác nhau:

| Dụng thần | Trả lời câu hỏi | Diễn giải |
|---|---|---|
| **Thế** | Có nên đi không? Có an toàn không? | Hưu tù/Không/Phá/động hóa hung = không nên đi. Thế khắc Ứng = đi thuận lợi; Ứng khắc Thế = không nên đi |
| **Ứng** | Nơi đến có thuận lợi không? | Ứng gặp Mộ/Tuyệt hoặc động biến Quan Quỷ = dù cố đi cũng vô ích |
| **Phụ Mẫu** | Hành lý, xe thuyền | Vượng tướng = nhiều/thuận lợi; hưu tù = ít; vượng mà lâm Không = tưởng nhiều hóa ít; động khắc Thế = trở ngại xe thuyền/mưa gió dọc đường |
| **Tài** | Lộ phí, tiền bạc mang theo | Vượng tướng = nhiều; hưu tù = ít; động hình khắc Thế = vì tiền tài mà gặp họa |

Bổ sung: Tử Tôn trì Thế hoặc phát động = đi xa vạn dặm cũng bình an (Tử Tôn luôn là "cứu tinh" trong xuất hành, dù khắc hay sinh Thế). Quan Quỷ trì Thế hoặc khắc Thế = bất lợi, thấp thỏm lo sợ, tai họa bất ngờ. Quan Quỷ động theo Lục Thần chỉ loại rủi ro cụ thể: Huyền Vũ→cướp, Chu Tước→kiện tụng, Bạch Hổ→bệnh tật, Đằng Xà→phong ba nguy hiểm, Câu Trần→giam giữ, Thanh Long→cờ bạc/háo sắc. Thời điểm đến nơi: Thế động → ứng ngày hợp hoặc ngày Thế trị; Thế hóa thoái thần hoặc quẻ phản ngâm → giữa đường quay lại.

### 4.7. Thi đấu / xếp hạng / cạnh tranh (nguồn: FAQ Dụng thần đặc biệt, Ch.5 Nghi Hoặc Chỉ Mê + suy luận mở rộng)

- **Thi có ban giám khảo/xếp hạng chính thức** (thi đấu thể thao có trọng tài, cuộc thi có giải thưởng): Dụng thần = **Quan Quỷ** (đại diện thứ bậc/quyền uy) nếu thi có xếp hạng; hoặc **Phụ Mẫu** nếu chỉ xét có nhận được giấy chứng nhận/bằng khen hay không (không quan tâm thứ hạng). Nếu quẻ có 2 hào Quan Quỷ, ưu tiên hào trì Thế làm Dụng thần chính.
- **Cạnh tranh với đối thủ không qua trọng tài** (ví dụ cạnh tranh giành khách hàng, giành hợp đồng, giành vị trí công việc với ứng viên khác): đây là suy luận mở rộng từ bảng lục thân gốc (Huynh Đệ = "đối thủ cạnh tranh" đã có ở mục 4.1) — dùng hào **Huynh Đệ** đại diện đối thủ, nguyên tắc chung: Huynh Đệ suy/tĩnh/bị khắc chế = mình có lợi thế hơn; Huynh Đệ vượng/động/được sinh = đối thủ mạnh, bất lợi cho mình. **Nếu là đối đầu trực diện 1-1** (ví dụ 2 người cùng ganh đua 1 vị trí, 1 hợp đồng) có thể dùng khung **Thế (ta) / Ứng (đối thủ)** — Thế khắc Ứng = mình thắng thế; Ứng khắc Thế = đối thủ thắng thế. *(Lưu ý: nhánh "cạnh tranh không qua trọng tài" chưa tìm thấy một chương sách riêng biệt nào luận chi tiết — đây là suy luận hợp lý từ nguyên tắc lục thân + khung Thế-Ứng đã có, không phải trích dẫn nguyên văn 1 nguồn cụ thể, nên coi là mức tin cậy thấp hơn các mục khác, cần kiểm chứng thêm qua thực tế luận quẻ trước khi code cứng thành rule.)*

### 4.8. Khi việc hỏi không có trong bảng chuẩn (fallback)

Đây là nơi cần LLM tra cứu thêm dữ liệu mở rộng — trong skill gốc là các file FAQ (`phan-3-dung-than-dac-biet.md` — Dụng thần cho việc lạ như visa, cho thuê nhà, hàng xóm, đấu thầu...) và các file domain chuyên sâu (bệnh tật, phong thủy, thai sản, tài vận, âm phần, thời tiết, tuổi thọ, hôn nhân xem duyên, xuất hành, hành nhân, kiện tụng, tìm vật mất...). Kiến trúc app nên có **retrieval layer theo domain** để LLM chỉ nạp đúng phần kiến thức chuyên sâu liên quan tới câu hỏi, thay vì nhồi toàn bộ tài liệu vào context.

### 4.9. Câu hỏi dạng so sánh nhiều phương án (A/B/C) — CHƯA có trong nguồn, đề xuất có kiểm chứng

**Quan trọng: không có sách nguồn nào trong bộ tài liệu đã xử lý mô tả trực tiếp kỹ thuật "so sánh nhiều phương án trong 1 quẻ".** Nguyên lý cổ điển Lục Hào là **1 quẻ trả lời 1 sự việc cụ thể** — phần FAQ gốc (`phan-1-gieo-que-co-so.md` mục 5) xác nhận: khi gieo nhiều quẻ liên tiếp cho cùng 1 việc, mỗi quẻ phản ánh một GÓC ĐỘ/GIAI ĐOẠN khác nhau của cùng sự việc đó (ví dụ lúc đi / lúc về / tổng thể chuyến đi) — chứ KHÔNG phải cơ chế để so sánh các phương án độc lập với nhau. Vì vậy 2 hướng xử lý dưới đây là suy luận ngoại suy từ các nguyên tắc đã có (Dụng thần lưỡng hiện ở mục 4.2, khung hợp tác Thế-Ứng ở mục 4.3), CHƯA được sách nào xác nhận trực tiếp — khi build app nên gắn nhãn "phương pháp mở rộng, độ tin cậy thấp hơn" và cân nhắc thêm ý kiến chuyên gia trước khi dùng cho khách hàng thật:

- **Cách 1 (an toàn hơn, khuyến nghị chính)**: KHÔNG cố nhồi nhiều phương án vào 1 quẻ. Lập/nhận riêng 1 quẻ cho mỗi phương án dưới dạng câu hỏi Có/Không độc lập ("có nên chọn phương án A không") rồi so sánh mức độ cát hung + Ứng Kỳ giữa các quẻ. Đây là cách bám sát nguyên lý cổ điển nhất.
- **Cách 2 (nhanh hơn nhưng rủi ro suy diễn cao hơn)**: nếu quẻ có sẵn nhiều hào cùng lục thân Dụng thần (lưỡng hiện, tam hiện...), có thể thử gán mỗi hào đại diện 1 phương án theo vị trí/hào vị/thứ tự xuất hiện — áp dụng lại đúng bộ tiêu chí ở mục 4.2 (động/tĩnh, Không/Phá, Xung/Hợp...) cho TỪNG hào riêng biệt rồi so sánh hào nào "sạch" và vượng hơn để chọn phương án đó. Cách này chỉ nên dùng khi người dùng đã tự đặt câu hỏi rõ ràng kiểu "hào nào ứng phương án nào" lúc lập quẻ, không nên tự ý gán sau khi quẻ đã lập xong vì dễ suy diễn khiên cưỡng.

---

## 5. LỚP 4 — Quy trình 10 bước luận cát hung tổng hợp (cần LLM tổng hợp)

Đây là khung quy trình đầy đủ nhất tổng hợp được (đối chiếu 2 nguồn độc lập — Vương Hổ Ứng và Học Viện Minh Việt — cho kết quả nhất quán):

1. **Xét Dụng thần** (và Thế/Ứng nếu liên quan đến "ta vs người khác", và Phi/Phục nếu Dụng thần ẩn): vượng/suy, có Không Vong/nhập Mộ/Tuyệt/Phá không, được ai sinh trợ, bị ai khắc.
2. **Xét Dụng thần có Không Vong THẬT hay không** — phân biệt "bất Không" (đang vượng/đang động/được Nhật Nguyệt sinh/hào biến bị Không không tính/Phục Thần vượng/đã xuất Không) với "Không thật" (bị Nhật phá, hưu tù tĩnh, Phục Thần bị khắc, hoặc rơi vào **Chân Không/Trực Không** — vừa Không Vong vừa đang ở trạng thái Tử theo mùa).
3. **Xét Nguyên Thần** (hào sinh Dụng thần): nên vượng, nên động, không nên bị Không/Phá.
4. **Xét Kỵ Thần** (hào khắc Dụng thần): nên tĩnh, nên bị chế; nếu có Cừu Thần (sinh Kỵ Thần, khắc Nguyên Thần) càng nguy hiểm hơn.
5. **Xét Nhật/Nguyệt** — không chỉ tính vượng suy mà còn là yếu tố quyết định thành-bại tổng thể của quẻ.
6. **Xét động tĩnh toàn bộ 6 hào** — quẻ toàn tĩnh thì trọng tâm chuyển sang Nhật/Nguyệt; quẻ loạn động (nhiều hào cùng động) thì việc trắc trở, cần Dụng thần đủ mạnh mới giữ được cát.
7. **Xét Tam hợp/Lục hợp cục** — cục thuộc "phe" Dụng thần/Nguyên Thần thì cát; cục thuộc "phe" Kỵ Thần/Cừu Thần thì đại hung.
8. **Luận cát hung tổng hợp** — tổng hợp bước 1-7, KHÔNG kết luận chỉ dựa 1 yếu tố đơn lẻ.
9. **Xác định Ứng Kỳ** (xem mục 6 bên dưới).
10. **Xét thông tin phụ khác** — Lục Thần bổ nghĩa, thần sát, thủ tượng (xem mục 7).

---

## 6. LỚP 6 — Ứng Kỳ: 8 quy luật xác định mốc thời gian

Bước hay bị bỏ qua nhưng người hỏi thường quan tâm nhất ("khi nào"). Áp dụng đúng quy luật tùy trạng thái Dụng thần lúc lập quẻ:

| Trạng thái Dụng thần | Ứng Kỳ |
|---|---|
| Tĩnh | Ngày/tháng Trị (trùng chi) hoặc Xung |
| Động | Ngày/tháng Trị của chính hào động; nếu là hào an tĩnh đang chờ thì lấy ngày Hợp |
| Quá vượng, việc hung | Ngày/tháng SINH cho Dụng thần (vượng cực sinh họa) |
| Quá vượng, việc cát | Ngày/tháng Dụng thần nhập Mộ hoặc gặp Xung (cần "hãm" mới ứng, như lúa chín phải gặt) |
| Hưu tù gặp Trường Sinh | Ngày/tháng ứng cung Trường Sinh — NHƯNG nếu suy kiệt cùng cực (vd bệnh nguy) thì "gặp sinh" lại là điềm xấu, không phải hồi phục |
| Nhập Mộ / bị Hợp giữ chân | Ngày/tháng Xung Mộ / Xung Hợp |
| Bị Nguyệt Phá | Ngày/tháng Điền Thực (trùng chi), Hợp, hoặc đơn giản là sang tháng kế (qua tháng bất phá) |
| Bị Tuần Không | Ngày/tháng Xung Không hoặc Điền Thực (trùng chi, hết Không Vong) |
| Phục Tàng (ẩn dưới Phi Thần) | Ngày/tháng Xung Phục Thần, Trị Phục Thần, hoặc Xung Phi Thần (đánh bật Phi Thần) |

**Bổ sung quan trọng** (không có trong bảng gốc, cần thêm khi code):
- Việc lớn/xa → ứng theo năm/tháng; việc nhỏ/gấp → ứng theo ngày/giờ.
- Đại tượng tốt mà bị khắc → Ứng Kỳ là ngày/tháng khắc lại chính cái đang khắc Dụng thần. Đại tượng hung mà bị khắc (không ai cứu) → Ứng Kỳ là ngày/tháng của chính hành đang khắc (họa đến đúng lúc kỵ thần vượng nhất).
- Độc Phát/Độc Tĩnh (5 hào 1 kiểu, 1 hào khác kiểu) → hào lẻ loi đó thường là chìa khóa quyết định tốc độ ứng nghiệm, ưu tiên xét trước.
- Khi Dụng thần rơi vào NHIỀU trạng thái cùng lúc (vd vừa Không vừa Nguyệt phá) → Nguyệt phá (cản cả tháng) nặng hơn Không Vong (cản 10 ngày), xét thứ tự trở ngại lớn trước.

---

## 7. LỚP 5 & 7 — Thủ tượng và Hóa giải (bắt buộc LLM, không nên rule hóa)

### 7.1. Thủ tượng (tìm nguyên nhân cốt lõi)
Không dừng ở "tốt/xấu" mà phải diễn giải hào/địa chi thành **sự vật cụ thể trong đời thực**. Cần 2 lớp bảng tra làm nguyên liệu (nhưng việc GHÉP các lớp lại thành 1 hình ảnh cụ thể là việc của LLM, không code được):
- Thủ tượng 8 quái (phương vị, thân thể, đồ vật, con người, con vật)
- Thủ tượng 12 địa chi + thủ tượng chi tiết theo từng quẻ trong 64 quẻ (khi cần đào sâu hơn)
- Lục Thần bổ nghĩa (Thanh Long=vui/háo sắc, Chu Tước=lời nói/thị phi, Câu Trần=chậm/kiến trúc/u bướu, Đằng Xà=lo lắng/quái dị, Bạch Hổ=hung/tai nạn/phẫu thuật, Huyền Vũ=ám muội/trộm cắp)

### 7.2. Hóa giải
Nguyên tắc bắt buộc: chỉ hóa giải khi đã xác định thật sự có vấn đề (không bịa vấn đề để hóa giải); phương án phải bám sát chính Dụng thần + nguyên nhân cốt lõi vừa tìm ra; kết hợp ≥2 lớp thông tin (màu sắc + phương vị, hoặc thời gian + vật phẩm); công thức đặt vật phẩm chuẩn = **Lục thân (loại vật) + Địa chi (con vật cụ thể) + Quái cung (chất liệu) + Lục thần (màu sắc) + hào vị/quan hệ hợp (nơi đặt)**.

**Nguyên tắc đạo đức bắt buộc** (nên hard-code như guardrail, không để LLM tự quyết): không đề xuất sát sinh/thế mạng/bùa ngải hại người; không luận mập mờ giữ khách; luôn khuyên khám bác sĩ khi liên quan sức khỏe nghiêm trọng; nói rõ "chưa chắc chắn" khi thiếu dữ kiện thay vì đoán bừa.

---

## 8. Kiến trúc dữ liệu theo domain (retrieval, không nhồi hết vào 1 prompt)

App nên tổ chức kiến thức chuyên sâu thành các "domain pack" nạp theo nhu cầu câu hỏi, tương tự cấu trúc skill đã build:

| Domain | Đặc thù riêng |
|---|---|
| Bệnh tật | Bảng hào vị = bộ phận cơ thể, 10 thủ pháp xác định "lấy gì làm bệnh" |
| Phong thủy nhà ở | Bảng hào vị = hạng mục nhà (nền, giường, bếp, bàn thờ, cửa, đường, sông...) |
| Thai sản | Tử Tôn + Hào Thai (khái niệm riêng không dùng ở domain khác) |
| Tài vận (chung thân, buôn bán thường) | Thê Tài làm Dụng thần trực tiếp — quy tắc THUẬN (Tài vượng, được sinh = tốt) |
| Đầu tư (chứng khoán/vàng/BĐS) | **Nguyên tắc NGƯỢC riêng cho đầu tư** — cần Tài bị khắc/tiết mới là tốt (xem mục 4 file gốc `luan-doan-tai-van/phan-2`), KHÔNG áp dụng nguyên tắc này cho các mục tài vận khác |
| Hợp tác/hùn vốn/liên doanh | Khung Thế-Ứng, không dùng lục thân cố định — xem mục 4.3 |
| Vay/đòi nợ/bắt đền | Quy trình 2 bước độc lập (thái độ + khả năng), xem mục 4.4 |
| Hợp đồng (ký kết nói chung) | Phụ Mẫu làm Dụng thần chính + xét Thế-Ứng để biết thiện chí 2 bên |
| Âm phần/mộ phần | Khác phong thủy dương trạch |
| Thời tiết | Domain hoàn toàn khác — Dụng thần theo lục thân: Tử Tôn=nắng, Phụ Mẫu=mưa, Quan Quỷ=sấm chớp |
| Tuổi thọ, hôn nhân (xem duyên), sắp sinh, xuất hành, hành nhân, kiện tụng, vật bị mất | Mỗi domain có Dụng thần và bộ dấu hiệu cát hung riêng |
| Án lệ tham khảo | ~163 case thực tế đã hóa giải, dùng làm few-shot calibration cho LLM, KHÔNG copy nguyên vật phẩm sang case mới |

**Gợi ý kỹ thuật:** dùng embedding/keyword routing để chọn đúng 1-2 domain pack theo câu hỏi trước khi gọi LLM luận, tránh nhồi toàn bộ ~40 file kiến thức vào 1 context.

---

## 9. Output format chuẩn

1. **Xác định Dụng thần** — ngắn gọn, giải thích vì sao chọn
2. **Phân tích cát hung** — đi qua 10 bước ở mục 5, mỗi ý có suy luận sinh khắc/Không Vong/vượng suy đi kèm (không kết luận suông)
3. **Nguyên nhân cốt lõi** — dùng thủ tượng để cụ thể hóa
4. **Kết luận** — trả lời thẳng câu hỏi
5. **Ứng Kỳ** — mốc thời gian cụ thể (nếu người hỏi quan tâm hoặc câu hỏi ngụ ý cần biết "khi nào")
6. **Hóa giải** (chỉ khi quẻ xấu) — phương pháp cụ thể + thời điểm nên/không nên hành động

---

## 10. Việc CHƯA có đủ dữ liệu để code (cần bổ sung sau)

- **Bước 10 (thông tin phụ khác)** của quy trình 10 bước — nguồn OCR bị thiếu đoạn, chưa rõ đầy đủ các thần sát phụ khác ngoài Lục Thần.
- **Chọn số điện thoại / hóa giải biển số theo phong thủy Lục Hào** — sách nguồn (Minh Việt) chỉ quảng cáo khóa học, không có công thức thật; nếu app cần tính năng này phải tìm nguồn khác.
- **Cách quy đổi Serial tiền thành quái số chính xác** — công thức bị mất do lỗi OCR/ảnh, hiện chỉ có 1 ví dụ số đã kiểm chứng (không đủ để suy ngược công thức tổng quát).
- **Danh sách đầy đủ Tam Hình** ngoài bộ Dần-Tị-Thân và cặp Tý-Mão — cần đối chiếu thêm nguồn khác để chắc chắn đủ 12 chi.

---

## Ghi chú nguồn

Toàn bộ nội dung trên được đúc kết từ skill `hoa-giai-kinh-dich` đã xây dựng, dựa trên: Lục Hào Xu Cát Tị Hung Hóa Giải Bí Truyền, Lục Hào Hóa Giải Kinh Nghiệm Tâm Pháp, Lục Hào Nghi Hoặc Chỉ Mê, Lục Hào Quái Lệ Thuyết Chân, Lục Hào Quái Tượng Giải Mật (đều của Vương Hổ Ứng); Kinh Dịch Ứng Dụng — Xu Cát Tị Hung Tường Giải, Kinh Dịch Cơ Bản (Nguyễn Huy Hoàng); Tài Vận Bí Pháp (Giả Bỉnh Nhiên); Kinh Dịch Lục Hào Sơ Cấp (Học Viện Minh Việt). Một số chi tiết được đánh dấu rõ "không rõ/cần xác minh" ở mục 10 vì nguồn OCR bị lỗi hoặc thiếu — không nên tự suy diễn thêm khi code, nên tra cứu bản gốc giấy nếu cần độ chính xác tuyệt đối.
