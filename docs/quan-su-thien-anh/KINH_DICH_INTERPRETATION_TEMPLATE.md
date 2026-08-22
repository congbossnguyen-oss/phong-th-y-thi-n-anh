# KINH DỊCH INTERPRETATION TEMPLATE — khung để Thầy điền nội dung

## Vì sao file này quan trọng nhất trong bộ tài liệu Phase 1

Theo hướng Thầy chốt (2026-08-22): **Kinh Dịch không chỉ là "engine chính" theo nghĩa kỹ thuật — nó phải đủ sức trả lời hầu hết vấn đề trong cuộc sống.** Bát Tự/Tử Vi thu hẹp lại còn đúng 1 việc: kể câu chuyện tổng thể theo đại vận/lưu niên, cho gia chủ biết thời vận hiện tại đang xấu hay tốt — KHÔNG tự luận chi tiết từng vấn đề.

Điều này đổi trọng tâm kỹ thuật: "Interpretation Engine" (`ENGINE_INTEGRATION.md` §8) không thể chỉ là 1 lời gọi LLM chung chung — nó cần một bộ quy tắc luận giải Kinh Dịch THEO TỪNG NHÓM CÂU HỎI, do Thầy biên soạn từ chuyên môn/sách nguồn của Thầy (đúng tinh thần các module Bát Tự/Tử Vi hiện có trong code — luôn trích rõ nguồn tài liệu, không đoán mò). Đệ không tự viết nội dung luận giải được — đây là khung rỗng để Thầy điền.

File này khi điền xong sẽ trở thành tài liệu tham chiếu nạp cho Interpretation Engine ở Phase 3 (tương tự cách `handoff/knowledge/luan-giai-bat-tu/` đang làm cho module luận nghề nghiệp) — xem `ENGINE_INTEGRATION.md` §8.

⚠️ **Cập nhật 2026-08-22 (lần 2):** Thầy đã bổ sung `LUAN_QUE_LUC_HAO_SPEC.md` đầy đủ hơn nhiều — **Phần A và Phần B bên dưới coi như xong**, không cần Thầy điền thêm nữa. Chi tiết đối chiếu ở ngay dưới đây. Việc còn lại CHỈ còn Phần C/D/E.

---

## Phần A — Bảng Dụng Thần theo nhóm câu hỏi — ĐÃ ĐỦ, không cần điền thêm

Đối chiếu với `LUAN_QUE_LUC_HAO_SPEC.md` mục 4.1 và các mục con 4.3-4.9, cả 18 nhóm đều đã có Dụng Thần:

| Nhóm câu hỏi | Nguồn trong spec |
|---|---|
| Sự nghiệp / Công việc / Thi cử / Kiện tụng | mục 4.1 — Quan Quỷ |
| Kinh doanh / Tài chính / Đầu tư | mục 4.1 + mục 8 (đầu tư có nguyên tắc NGƯỢC riêng, khác tài vận thường) — Thê Tài |
| Bất động sản | mục 4.1 — Phụ Mẫu |
| Hợp tác | mục 4.3 — khung Thế-Ứng riêng, không dùng 1 lục thân cố định |
| Vay / cho vay / Đòi nợ | mục 4.4 — quy trình 2 bước (thái độ + khả năng), khác nguyên tắc ngược của đầu tư |
| Tình duyên | mục 4.5 — Tài (nam hỏi) / Quan (nữ hỏi), khác bảng Hôn nhân đã cưới |
| Hôn nhân | mục 4.1 — Thê Tài (nam) / Quan Quỷ (nữ), ghi chú tách biệt "Vợ chồng đã cưới" khỏi "Tình duyên" |
| Thi đấu / cạnh tranh | mục 4.7 — Quan Quỷ (thi có trọng tài) hoặc Huynh Đệ/Thế-Ứng (cạnh tranh không trọng tài) — ⚠️ nhánh "không trọng tài" tự nhận độ tin cậy thấp hơn, chưa có nguồn sách riêng xác nhận |
| Sức khỏe | mục 4.1 — Hào Thế + Tử Tôn |
| Xuất hành | mục 4.6 — 4 Dụng thần đồng thời (Thế/Ứng/Phụ Mẫu/Tài), mỗi hào trả lời 1 khía cạnh |
| Quyết định A/B/C | mục 4.9 — ⚠️ tự nhận "CHƯA có trong nguồn sách nào", đề xuất 2 cách xử lý (gieo riêng từng phương án — khuyến nghị chính; hoặc gán hào theo lưỡng/tam hiện — rủi ro suy diễn cao hơn). Đây là chỗ DUY NHẤT trong Phần A còn cần Thầy quyết định cách nào trước khi code, không phải thiếu Dụng Thần mà là thiếu QUYẾT ĐỊNH SẢN PHẨM |
| Chọn ngày giờ | _(không qua Kinh Dịch — dùng trach-nhat-engine, xem ENGINE_INTEGRATION.md §5)_ |

**1 việc nhỏ còn cần Thầy xác nhận:** mục 4.9 (Quyết định A/B/C) đề xuất "Cách 1" (gieo riêng 1 quẻ cho mỗi phương án rồi so sánh) là an toàn hơn "Cách 2" (gán hào trong 1 quẻ) — Thầy đồng ý dùng Cách 1 làm mặc định không?

## Phần B — Nguyên tắc đọc quẻ cho từng nhóm — ĐÃ ĐỦ

Có đầy đủ trong `LUAN_QUE_LUC_HAO_SPEC.md` mục 5 (quy trình 10 bước, dùng chung cho mọi nhóm) và mục 6 (8 quy luật Ứng Kỳ). Domain nào có sắc thái riêng đã được tách rõ ở mục 8 (bảng domain) — với Quân Sư Thiên Anh chỉ cần dùng đúng các domain khớp 18 nhóm đang có, bỏ qua domain ngoài phạm vi (Phong thủy nhà ở, Âm phần, Thời tiết — các domain này có trong spec nhưng KHÔNG dùng cho Quân Sư, đúng quyết định đã chốt ở `PRODUCT_ARCHITECTURE.md` §2).

**Phát hiện đáng chú ý (vẫn cần làm ở Phase 3):** 5 bộ test "golden" đã có sẵn trong code (`luc-hao.ts`, xem `EXISTING_ENGINE_AUDIT.md` mục 7.4) tên là Fan Yin, Fu Yin, Xún Kōng (Tuần Không), Trường Sinh, Nguyệt Kiến-Nhật Thần — khớp gần như trực tiếp với "Lớp 2" (tính toán cơ học) trong spec mục 3. Rất có thể phần tính toán cứng đã có sẵn trong code — việc cần làm ở đầu Phase 3 là đối chiếu từng bảng trong spec với code thật để xác nhận khớp, không phải code từ đầu.

## Phần C — Phối hợp Kinh Dịch × Vận trình Bát Tự/Tử Vi — ĐÃ CÓ TIỀN LỆ, tái dùng thay vì bịa mới

⚠️ Cập nhật 2026-08-22: Theo chỉ dẫn của Thầy, đệ đã đọc kỹ 2 module đang chạy thật có xử lý đúng tình huống "nhiều nguồn luận không đồng nhất":

**Module "Định Hướng Nghề Nghiệp"** (`src\lib\nghe-nghiep\module-ket-hop.ts`, có tài liệu gốc `handoff\docs\ket-hop-2-he.md`) — đây là tiền lệ SÁT NHẤT với tình huống Kinh Dịch × vận trình, vì cả 2 module đều đang trả lời CÙNG 1 câu hỏi kiểu "hướng này có thuận không". Cách họ làm:

1. Tính **"Mức Đồng Thuận"** (KHÔNG gọi là "xác suất đúng" — tài liệu gốc nhấn mạnh đây chỉ là độ khớp giữa 2 phương pháp độc lập, không phải độ chính xác) — công thức mẫu: `0.4 × độ khớp vector 5 trục + 0.3 × trùng hướng chính + 0.3 × trùng danh sách top ngành`.
2. Chia 3 mức: **Cao (≥75%)** → gộp thành 1 kết luận thống nhất. **Trung (50-74%)** → nêu hướng chính + các lưu ý lệch. **Thấp (<50%, gọi là "phân kỳ")** → **KHÔNG ép ra 1 câu trả lời** — thay vào đó "đọc theo tầng": mỗi nguồn được gắn nhãn nó đại diện cho điều gì (Bát Tự = năng lực nền/cách kiếm tiền thật; Tử Vi = hình ảnh xã hội/vẻ ngoài nghề nghiệp), rồi đưa thêm 1 câu "lộ trình" gợi ý cách đi qua cả 2 (ví dụ: "nên làm tổ chức trước, tích lũy rồi mới chuyển sang kinh doanh").
3. Luôn gắn cờ "bản nháp — chưa hiệu chỉnh" cho tới khi được kiểm chứng trên đủ số lá số thật.

**Module "Chọn Ngày Giờ Sinh Cho Bé"** (`src\lib\trach-nhat-sinh-no\`) — tiền lệ cho tình huống KHÁC (2 nguồn trả lời 2 câu hỏi khác nhau, không phải cùng 1 câu hỏi): Bát Tự chọn NGÀY, Tử Vi chỉ chọn GIỜ trong ngày đã chọn — không cộng điểm chéo, và Tử Vi có quyền **phủ quyết** (nếu gặp dấu hiệu nghiêm trọng) bất kể Bát Tự đã xếp hạng tốt thế nào.

**Áp dụng cho Quân Sư Thiên Anh:** Vì Kinh Dịch và vận trình Bát Tự/Tử Vi đều đang trả lời cùng 1 câu "việc này thuận hay không thuận lúc này" → nên dùng **mẫu hình "Định Hướng Nghề Nghiệp"** (tính mức đồng thuận, đọc theo tầng khi lệch nhau), KHÔNG dùng mẫu hình "chọn ngày sinh cho bé" (phủ quyết) — vì Kinh Dịch không chỉ trả lời 1 phần nhỏ như Tử Vi trong ví dụ chọn giờ, mà theo nguyên tắc cốt lõi đã chốt, Kinh Dịch mới là tiếng nói chính.

**Đề xuất cụ thể** (Thầy xác nhận hoặc sửa):
- Quẻ Kinh Dịch = tiếng nói CHÍNH cho SỰ VIỆC cụ thể đang hỏi (giống vai trò "năng lực nền/cách kiếm tiền thật" của Bát Tự trong ví dụ nghề nghiệp).
- Sơ đồ vận trình Bát Tự/Tử Vi = tiếng nói PHÔNG NỀN, trả lời "thời điểm nói chung có thuận hay không" (giống vai trò "hình ảnh xã hội" của Tử Vi).
- Khi quẻ tốt + vận tốt → kết luận thống nhất, mạnh dạn khuyên nên làm.
- Khi quẻ tốt + vận xấu (hoặc ngược lại) → không ép 1 câu trả lời — nói rõ "việc này bản thân nó thuận (theo quẻ), nhưng thời điểm chung quanh đang không thuận (theo vận), nên cân nhắc làm nhưng thận trọng hơn / có thể lùi thời điểm nếu được" — đúng tinh thần "đọc theo tầng" đã có tiền lệ.
- Khi cả 2 đều xấu → khuyên rõ ràng nên hoãn/không nên làm.

Thầy xem đề xuất này có đúng ý muốn không, hay muốn chỉnh lại cách phối hợp?

## Phần D — Khuôn kết luận: ĐÃ CÓ CHỈ ĐẠO chính, còn vài chi tiết nhỏ

⚠️ Cập nhật 2026-08-23 — Thầy đã chốt phần quan trọng nhất: **luận chi tiết, nhưng không dùng nhiều thuật ngữ chuyên môn, viết theo cấu trúc Mở bài — Thân bài — Kết luận** (văn phong 1 bài viết bình thường, không phải bảng liệt kê kỹ thuật).

**Tách rõ 2 lớp khác nhau (Thầy nhấn mạnh thêm 2026-08-23):**

| Lớp | Ai/cái gì làm | Có được dùng thuật ngữ không |
|---|---|---|
| **Phân tích nội bộ** | Quá trình luận thật của Thầy (khi Thầy điền Phần E, hoặc quá trình 10 bước trong `LUAN_QUE_LUC_HAO_SPEC.md`) | Có — Dụng Thần, Không Vong, Nguyệt Phá... cứ dùng bình thường, đây là chuyên môn thật, cần chính xác |
| **Bài viết đưa cho khách** | Interpretation Engine viết lại từ kết quả phân tích nội bộ | KHÔNG — phải dịch hết sang lời thường |

**Giọng điệu bài viết đưa cho khách = "quân sư đồng hành"** — không phải giọng thầy bói phán truyền từ xa, mà giọng 1 người bạn/cố vấn đang đứng cạnh, cùng nhìn vấn đề với khách, nói chuyện thẳng thắn và thực tế, đưa ra hướng đi cụ thể chứ không chỉ phán tốt/xấu. Ví dụ đối chiếu:

- ❌ Giọng thầy bói/thuật ngữ: "Dụng Thần Quan Quỷ lâm Không Vong, bị Nguyệt phá, khó thành."
- ✅ Giọng quân sư đồng hành: "Việc này lúc này chưa thuận lắm — không phải vì con đường sai, mà vì đang chưa đúng lúc. Cứ chuẩn bị sẵn, đừng vội, đợi thêm 1 nhịp nữa sẽ dễ hơn."

Quy tắc: mọi thuật ngữ trong bước phân tích PHẢI được "phiên dịch" thành hình ảnh/tình huống đời thường trước khi đưa vào `than_bai`/`ket_luan` — không chỉ đơn giản là bỏ tên thuật ngữ đi mà giữ nguyên câu, mà phải diễn đạt lại hoàn toàn theo cách 1 người bình thường sẽ nói với bạn mình.

**Ý nghĩa kỹ thuật của việc này:** `LUAN_QUE_LUC_HAO_SPEC.md` mục 9 định nghĩa "Output format chuẩn" gồm 6 phần rời (Dụng thần → Phân tích → Nguyên nhân → Kết luận → Ứng Kỳ → Hóa giải) — đây là cấu trúc PHÂN TÍCH NỘI BỘ, giúp đảm bảo luận đủ bước, không bỏ sót. Nhưng đó KHÔNG phải là thứ hiển thị thẳng cho khách hàng. Cần 1 bước "viết lại" — gộp 6 phần đó thành bài văn liền mạch 3 đoạn:

| Đoạn văn khách đọc | Gộp từ các bước phân tích nội bộ |
|---|---|
| **Mở bài** | Tóm tắt ngắn gọn: câu hỏi là gì, quẻ nói chung là thuận hay không thuận |
| **Thân bài** | Đi sâu — dùng Phân tích cát hung (bước 2) + Nguyên nhân cốt lõi/thủ tượng (bước 3) + Ứng Kỳ nếu người hỏi cần biết "khi nào" (bước 5) — nhưng kể bằng lời thường, ví dụ đời thường, KHÔNG nói "Dụng Thần bị Không Vong" mà nói kiểu "việc này đang có 1 trở ngại tạm thời, chưa phải mất hẳn, chỉ là chưa tới lúc" |
| **Kết luận** | Chốt câu trả lời thẳng (bước 4) + hóa giải/khuyến nghị hành động nếu cần (bước 6) |

Điều này áp dụng cho MỌI nhóm câu hỏi — không cần viết riêng giọng văn cho từng nhóm nữa, chỉ cần 1 quy tắc chung này. `output_schema` trong `QUESTION_SCHEMA.md` cần sửa lại theo đúng 3 đoạn này (đã cập nhật, xem file đó).

**Còn lại vài chi tiết nhỏ Thầy xác nhận thêm khi rảnh (không gấp):**
- Nhóm Sức khỏe: câu "không thay thế chẩn đoán bác sĩ" Thầy muốn diễn đạt cụ thể thế nào cho tự nhiên, không cứng nhắc.
- Nhóm Kiện tụng: khi quẻ xấu, cách nói giảm nhẹ để không gây hoang mang nhưng vẫn trung thực — có ví dụ câu mẫu nào Thầy hay dùng không.

## Phần E — Ví dụ mẫu đã luận sẵn (để làm chuẩn đối chiếu)

Cần 2-3 quẻ thật Thầy đã luận trước đây (hoặc luận mẫu ngay bây giờ) theo đúng format: input (câu hỏi + quẻ gieo được) → output (kết luận + khuyến nghị hành động) — dùng làm "golden example" để sau này kiểm tra Interpretation Engine luận có đúng tinh thần Thầy muốn không, giống cách `luc-hao.ts` đã có 5 bộ golden test kỹ thuật.

```
Ví dụ mẫu #1
Câu hỏi: _(Thầy điền, vd "Có nên chuyển việc không?")_
Quẻ gieo được: _(Thầy điền, hoặc để đệ dựng UI gieo quẻ demo rồi Thầy chọn quẻ mẫu)_
Vận trình liên quan: _(Thầy điền, vd "đang đại vận Thực Thần, lưu niên năm nay hợp")_
Kết luận đúng theo Thầy: _(Thầy điền)_
Khuyến nghị hành động đúng theo Thầy: _(Thầy điền)_
```

---

## Việc cần làm sau khi Thầy điền xong

1. Đệ chuyển nội dung Thầy điền thành tài liệu tham chiếu có cấu trúc (giống `handoff/knowledge/luan-giai-bat-tu/`) để nạp cho Interpretation Engine.
2. Đối chiếu Phần A/B với logic thực tế đang có trong `src/lib/luc-hao.ts` — xác nhận engine hiện tại đã tính đủ các yếu tố Thầy cần dùng (vượng suy, Không Vong, Nguyệt Phá, sinh khắc Thế/Ứng, biến hào) hay cần bổ sung.
3. Việc này nên làm ở đầu Phase 3 (`ROADMAP.md`), trước khi viết Interpretation Engine thật.
