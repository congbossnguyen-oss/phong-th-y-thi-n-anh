# SYSTEM ARCHITECTURE — Quân Sư Thiên Anh (Phase 1)

## 1. Mục đích tài liệu

Ánh xạ pyramid kiến trúc trong `PRODUCT_ARCHITECTURE.md` sang thành phần code cụ thể: cái gì tái dùng nguyên trạng, cái gì là adapter mỏng, cái gì thực sự mới. Không mô tả cách triển khai chi tiết (đó là việc của Phase 2) — chỉ định vị ranh giới trách nhiệm.

## 2. Bản đồ tầng → code

| Tầng | Trạng thái | Thành phần |
|---|---|---|
| APP SHELL | Mới (nhẹ) | Route mới `src/pages/quan-su/*` trong app Astro hiện có — dùng lại layout, auth session, Tailwind tokens hiện có |
| QUESTION LIBRARY | Mới | Registry dữ liệu `src/lib/quan-su/question-library.ts`, theo mẫu `dai-cat-loi-tools.ts` |
| QUESTION FLOW | Mới | Component thu thập `required_inputs`/`optional_inputs` theo từng `question_definition` |
| DIVINATION / INPUT FLOW | Tái dùng phần lớn | Gieo quẻ tái dùng UI/logic của `src/pages/gieo-que-kinh-dich.astro`; thu thập ngày sinh tái dùng pattern input đã có ở `lap-la-so-bat-tu.astro`/`lap-la-so-tu-vi` |
| KINH DỊCH ENGINE | Tái dùng nguyên trạng | `src/lib/luc-hao.ts` (916 dòng, đã kiểm chứng bằng 5 bộ golden test) |
| CONTEXT ENGINES | Tái dùng nguyên trạng + adapter mỏng | Bát Tự: `bat-tu.ts` (lập lá số) → `bat-tu-engine/engine.ts` (luận vượng suy/dụng thần); Tử Vi: `tu-vi/engine.ts`; Trạch Nhật: `trachnhat-engine` (chỉ nhóm "chọn ngày giờ"). **Không dùng Kỳ Môn (`kymon/`) và không dùng Phong Thủy nhà ở — quyết định phạm vi của Thầy (2026-08-22), xem `PRODUCT_ARCHITECTURE.md` §2.** |
| INTERPRETATION ENGINE | Tái dùng hạ tầng, mở rộng prompt | Dựa trên `src/lib/chart-profile/` (llm.ts, cache.ts, ghi-log-chi-phi.ts, knowledge.ts) — đây là nơi DUY NHẤT hiện tại gọi LLM lúc chạy, đã có cache theo hash + cost logging |
| QUÂN SƯ ORCHESTRATOR | Mới | `src/lib/quan-su/orchestrator.ts` — thành phần trung tâm mới, xem mục 4 |
| CONCLUSION / ACTION RECOMMENDATION | Mới | Định dạng bởi `output_schema` của từng `question_definition`, xem `QUESTION_SCHEMA.md` |

## 3. Nguyên tắc ranh giới: Orchestrator không tính toán, chỉ điều phối

Quân Sư Orchestrator **không được** tự tính Can Chi, tự luận sao, hay tự đoán quẻ. Nó chỉ:

1. Đọc `question_definition` (từ Question Library) để biết `required_engines`, `divination_method`, `interpretation_rules`.
2. Gọi Kinh Dịch engine (bắt buộc) với input người dùng vừa cung cấp (gieo quẻ).
3. Với mỗi engine trong `required_engines`, gọi engine đó qua đúng adapter đã có, lấy **chỉ phần dữ liệu cần** (context budget — xem mục 5), không dump toàn bộ lá số.
4. Gộp (Kinh Dịch + context engines) thành 1 object ngữ cảnh, đưa cho Interpretation Engine.
5. Interpretation Engine (LLM, theo `interpretation_rules`) sinh CONCLUSION + ACTION RECOMMENDATION theo đúng `output_schema`.
6. Ghi lại phiên vào `divination_sessions`/`advisory_reports` (xem `DATABASE_SCHEMA.md`).

Việc tách bạch này giữ đúng nguyên tắc "không viết lại engine cũ" — Orchestrator là lớp điều phối mỏng nằm TRÊN các engine, không chèn vào giữa.

## 4. Chuỗi gọi (sequence, mức khái niệm)

```
User chọn câu hỏi
        │
        ▼
Question Flow thu thập input theo question_definition
        │
        ▼
Orchestrator.run(question_id, userInput)
        │
        ├─► luc-hao.ts: gieoQue(...) + luanQue(...)         [luôn chạy]
        │
        ├─► nếu "bát tự" ∈ required_engines:
        │       bat-tu.ts: tinhBatTu(ngaySinh) → bat-tu-engine/engine.ts: phanTichBatTu(...)
        │       adapter chỉ trả về vận trình/dụng thần liên quan, không full lá số
        │
        ├─► nếu "tử vi" ∈ required_engines:
        │       tu-vi/engine.ts: layVanTrinh(ngaySinh)            [chỉ lấy vận trình]
        │
        ├─► nếu "trach-nhat" ∈ required_engines (nhóm "chọn ngày giờ"):
        │       trachnhat-engine: hàm tương ứng question_id (vd calculateNgayKhaiTruongRange)
        │
        (KHÔNG có nhánh Kỳ Môn/Phong Thủy — 2 engine này không dùng trong app này, xem PRODUCT_ARCHITECTURE.md §2)
        │
        ▼
Gộp ngữ cảnh (Kinh Dịch + context đã lọc)
        │
        ▼
Interpretation Engine (LLM, dựa trên hạ tầng chart-profile/)
        │
        ▼
CONCLUSION + ACTION RECOMMENDATION → lưu advisory_reports → trả về Question Flow
```

## 5. "Context budget" — vì sao không dump toàn bộ lá số

Nguyên tắc cốt lõi #2 của đề bài: Bát Tự/Tử Vi chỉ cung cấp vận trình/đại vận/lưu niên/đặc điểm nền, KHÔNG tự động đưa toàn bộ lá số dài dòng vào mọi câu hỏi. Về mặt hệ thống, điều này có 2 lý do kỹ thuật:

1. **Chi phí LLM** — `chart-profile/ghi-log-chi-phi.ts` đã cho thấy gọi LLM có chi phí thật, cần theo dõi. Nhồi toàn bộ lá số vào mọi câu hỏi làm phình prompt không cần thiết.
2. **Chất lượng luận giải** — mỗi `question_definition` nên định nghĩa rõ trong `interpretation_rules` là engine ngữ cảnh cần trả về TRƯỜNG NÀO (ví dụ chỉ cần "đại vận hiện tại + lưu niên năm nay", không cần toàn bộ 12 cung Tử Vi).

Vì vậy mỗi adapter (Bát Tự/Tử Vi/Kỳ Môn) nên có 2 lớp hàm: hàm tính đầy đủ (đã có, không đổi) và hàm "trích context" mỏng gọi hàm đầy đủ rồi chỉ chọn ra trường cần cho Quân Sư — đây là phần MỚI cần viết ở Phase 2, không phải sửa engine gốc.

## 6. Rủi ro hệ thống cần theo dõi (từ audit, không phải việc Phase 1 phải sửa)

- **`packages/*` không đồng bộ tự động với package gốc** — nếu Phase 2 thêm hàm "trích context" vào một engine gốc, phải nhớ copy sang `phong-thuy-thien-anh/packages/*` trước khi build, hoặc dựng script sync (đề xuất cho Phase 2).
- **2 bản Bát Tự song song** (`bat-tu.ts` vs `bat-tu-engine/engine.ts`) — cần Thầy chốt trước khi Orchestrator gọi vào bản nào.
- **3 lỗi đã biết trong Tử Vi engine** (xem `EXISTING_ENGINE_AUDIT.md` mục 7.2) — cần đánh giá có ảnh hưởng dữ liệu Quân Sư dùng hay không trước khi launch.

## 7. Vị trí trong app hiện có

Quân Sư Thiên Anh là một khu vực mới trong app Astro hiện tại (`phong-thuy-thien-anh`), không phải app/repo riêng — tận dụng auth session-cookie, Sanity CMS (nếu cần nội dung mô tả câu hỏi), Neon Postgres/Drizzle (bảng mới, xem `DATABASE_SCHEMA.md`), và hạ tầng thanh toán SePay đã có sẵn cho `pricing_tier` trả phí.
