# PRODUCT ARCHITECTURE — Quân Sư Thiên Anh (Phase 1)

## 1. Sản phẩm này là gì

**Quân Sư Thiên Anh** là một hệ thống **cố vấn ra quyết định**, không phải chatbot hỏi-đáp tự do. Người dùng không gõ câu hỏi tùy ý — họ chọn một vấn đề đang gặp phải từ một thư viện câu hỏi đã định nghĩa sẵn (Question Library), hệ thống dẫn dắt họ qua một luồng nhập liệu phù hợp, rồi trả lời bằng một **kết luận + khuyến nghị hành động** cụ thể — không phải một đoạn văn luận giải chung chung.

## 2. Nguyên tắc cốt lõi (không thương lượng)

1. **Kinh Dịch là engine luận đoán chính — và phải đủ sức trả lời hầu hết vấn đề trong cuộc sống.** Theo đúng chỉ đạo của Thầy (2026-08-22): Kinh Dịch không chỉ là trục kỹ thuật, mà là nơi gánh phần lớn việc luận giải chi tiết cho từng câu hỏi cụ thể. Mọi câu hỏi trong Quân Sư đều đi qua một quẻ Kinh Dịch (gieo quẻ + luận Lục Hào) làm trục chính. Bộ quy tắc luận giải theo từng nhóm câu hỏi cần được Thầy biên soạn — xem khung mẫu ở `KINH_DICH_INTERPRETATION_TEMPLATE.md`.
2. **Bát Tự, Tử Vi chỉ đưa ra một sơ đồ vận trình của chủ thể — không bàn luận nhiều.** Theo đúng lời Thầy: đây là 1 biểu đồ timeline (các giai đoạn đại vận + lưu niên hiện tại, mỗi giai đoạn gắn nhãn tốt/bình thường/xấu — xem `ENGINE_INTEGRATION.md` §3), KHÔNG phải đoạn văn luận giải, KHÔNG tự luận chi tiết từng vấn đề, KHÔNG đưa toàn bộ lá số vào mọi câu hỏi. Vai trò của 2 engine này hẹp hơn 1 "engine ngữ cảnh" thông thường: chỉ vẽ ra "bức tranh vận trình" làm phông nền cho Kinh Dịch luận, không cạnh tranh vai trò luận chi tiết với Kinh Dịch.
3. **KHÔNG dùng Kỳ Môn Độn Giáp và KHÔNG dùng Phong Thủy nhà ở (Bát Trạch/Huyền Không) trong app này.** ⚠️ Quyết định trực tiếp từ Thầy ZHI GONG (2026-08-22): Quân Sư Thiên Anh giữ phạm vi đơn giản — 1 người cố vấn dễ hiểu cho người bình thường, không phải công cụ chuyên sâu đòi hỏi nhiều lớp luận giải. Hai engine này KHÔNG nằm trong `required_engines` của bất kỳ `question_definition` nào ở giai đoạn hiện tại. Đây không phải "để dành xây sau" mặc định — chỉ mở lại nếu Thầy chủ động yêu cầu.
4. **Nhóm "Chọn ngày giờ" vẫn giữ được** nhưng dùng `trachnhat-engine` (đã có sẵn, đơn giản, không phải Kỳ Môn) — xem `ENGINE_INTEGRATION.md` §6.
5. **Không viết lại engine đang hoạt động.** Theo `EXISTING_ENGINE_AUDIT.md`, toàn bộ engine tính toán (`calendar-core`, `rule-engine`, `trachnhat-engine`, `tu-vi/`, `luc-hao.ts`, `bat-tu.ts`, `bat-tu-engine/`) được coi là ổn định và phải được TÁI SỬ DỤNG, không viết lại. (`kymon/` cũng ổn định nhưng không dùng trong app này theo mục 3.)

## 3. Quan hệ với sản phẩm hiện có (Đại Cát Lợi)

Thiên Anh hiện đã có 24 công cụ trạch cát tự động (`/dai-cat-loi` + 7 công cụ độc lập) — đây là các **máy tính đơn lẻ**: nhập vào → engine tính → hiển thị kết quả thô (trực, hoàng đạo, thần sát...). Người dùng tự đọc và tự quyết định.

Quân Sư Thiên Anh là một **tầng khác hẳn**, không thay thế Đại Cát Lợi:

| | Đại Cát Lợi (hiện có) | Quân Sư Thiên Anh (Phase 1 trở đi) |
|---|---|---|
| Điểm vào | Chọn thẳng 1 công cụ tính toán | Chọn 1 vấn đề đang gặp phải |
| Vai trò engine | Engine là sản phẩm — hiển thị kết quả tính toán | Engine là nguyên liệu — Kinh Dịch dẫn dắt, engine khác chỉ bổ trợ khi cần |
| Đầu ra | Bảng dữ liệu (trực, sao, giờ tốt...) | Kết luận + khuyến nghị hành động |
| Số engine dùng / lượt | 1 | 1 (Kinh Dịch, bắt buộc) + 0-4 engine ngữ cảnh tùy câu hỏi |

Quân Sư Thiên Anh **gọi lại** các engine của Đại Cát Lợi (`trachnhat-engine` cho nhóm "Chọn ngày giờ", `kymon/` khi cần thời điểm) làm nguyên liệu đầu vào, không xây engine tính toán song song.

## 4. Sơ đồ luồng tổng quát

```
USER
  ↓
APP SHELL                    (khung ứng dụng mobile-first/PWA)
  ↓
QUESTION LIBRARY              (thư viện câu hỏi theo 20 nhóm, xem QUESTION_SCHEMA.md)
  ↓
QUESTION FLOW                 (luồng hỏi-đáp thu thập required_inputs/optional_inputs)
  ↓
DIVINATION / INPUT FLOW       (gieo quẻ Kinh Dịch + thu thập ngày sinh nếu câu hỏi cần)
  ↓
KINH DỊCH ENGINE               (bắt buộc — tái dùng src/lib/luc-hao.ts)
  ↓
OPTIONAL CONTEXT ENGINES       (chỉ gọi engine nào question.required_engines liệt kê)
  ├── BÁT TỰ      → bat-tu.ts (lập lá số) + bat-tu-engine/engine.ts (luận vượng suy/dụng thần)
  ├── TỬ VI       → src/lib/tu-vi/engine.ts
  └── TRẠCH NHẬT  → trachnhat-engine (chỉ cho nhóm "chọn ngày giờ")
      (KHÔNG dùng Kỳ Môn, KHÔNG dùng Phong Thủy nhà ở — quyết định phạm vi của Thầy)
  ↓
INTERPRETATION ENGINE          (LLM tổng hợp — tái dùng hạ tầng chart-profile/)
  ↓
QUÂN SƯ ORCHESTRATOR            (điều phối toàn bộ luồng trên — thành phần MỚI)
  ↓
CONCLUSION                      (kết luận ngắn gọn, rõ ràng)
  ↓
ACTION RECOMMENDATION           (hành động cụ thể, có thể kèm mốc thời gian nếu có Kỳ Môn/Trạch Nhật)
```

Xem bản đồ chi tiết từng tầng nối với code cụ thể nào trong `SYSTEM_ARCHITECTURE.md`.

## 5. Question Library — không cho hỏi tự do

Người dùng luôn bắt đầu từ 20 nhóm vấn đề (danh sách đầy đủ + cấu trúc dữ liệu ở `QUESTION_SCHEMA.md`): Sự nghiệp, Công việc, Kinh doanh, Tài chính, Đầu tư, Bất động sản, Hợp tác, Vay/cho vay, Đòi nợ, Tình duyên, Hôn nhân, Thi cử, Thi đấu/cạnh tranh, Kiện tụng/tranh chấp, Sức khỏe, Xuất hành, Chọn ngày giờ, Quyết định A/B/C.

Thư viện này phải **mở rộng được bằng dữ liệu, không cần sửa code** — theo đúng mẫu hình đã chứng minh hiệu quả trong codebase hiện tại: `src\lib\dai-cat-loi-tools.ts` là 1 registry trung tâm liệt kê toàn bộ công cụ Đại Cát Lợi bằng dữ liệu, không hard-code từng trang. Question Library nên đi theo mẫu hình y hệt.

## 6. Định vị người dùng & tầng giá

Theo `[[project_thien-anh-tu-dong-hoa]]` — Thầy ưu tiên tự động hóa, hạn chế tư vấn 1-1 thủ công. Quân Sư Thiên Anh đúng hướng này: mỗi câu hỏi là một "phiên tư vấn tự động" (`divination_session`), có `pricing_tier` riêng theo độ phức tạp (câu hỏi chỉ cần Kinh Dịch = tier thấp; câu hỏi cần Kinh Dịch + Bát Tự + Tử Vi + Kỳ Môn = tier cao). Tầng "tư vấn 1-1 trả phí cao" của Thầy vẫn giữ nguyên, không bị thay thế — Quân Sư là lớp tự động phục vụ số đông.

## 7. Phong cách sản phẩm (tóm tắt — chi tiết ở UI_DESIGN_SYSTEM.md)

Modern Mystical / Oriental / Premium / Spiritual / Elegant. Tránh: đỏ vàng chóe, rồng phượng cliché, giao diện Trung Hoa cổ điển nặng nề. Đây là điểm khác biệt có chủ đích với các công cụ Đại Cát Lợi hiện tại (đang phục vụ số đông, phong cách phổ thông hơn) — Quân Sư định vị cao cấp hơn.

**Giọng nói sản phẩm — "quân sư đồng hành":** đúng như cái tên, Quân Sư Thiên Anh không nói chuyện như thầy bói phán từ xa bằng thuật ngữ — mà như 1 người cố vấn đứng cạnh khách, cùng nhìn vấn đề, nói thẳng và thực tế, luôn hướng tới "vậy giờ nên làm gì" chứ không dừng ở "tốt hay xấu". Chuyên môn thật (thuật ngữ Kinh Dịch/Bát Tự/Tử Vi) chỉ dùng trong bước phân tích nội bộ — mọi thứ hiển thị cho khách phải dịch sang lời thường. Chi tiết + ví dụ đối chiếu ở `KINH_DICH_INTERPRETATION_TEMPLATE.md` Phần D.

## 8. Phạm vi Phase 1 (nhắc lại điều kiện nghiệm thu)

Phase 1 CHỈ tạo tài liệu kiến trúc, KHÔNG viết code sản phẩm. Không phá engine cũ. Có kiến trúc rõ ràng, Question Library schema, routing câu hỏi↔engine, database schema, design system, roadmap các phase tiếp theo. Không tự ý xây tính năng ngoài phạm vi này.
