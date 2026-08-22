# ROADMAP — Quân Sư Thiên Anh

## Phase 1 — Kiến trúc (tài liệu này thuộc phase này)

**Trạng thái: hoàn tất.**

Sản phẩm: 10 tài liệu kiến trúc (`PRODUCT_ARCHITECTURE.md`, `SYSTEM_ARCHITECTURE.md`, `QUESTION_SCHEMA.md`, `DATABASE_SCHEMA.md`, `ENGINE_INTEGRATION.md`, `UI_DESIGN_SYSTEM.md`, `ROADMAP.md`, `EXISTING_ENGINE_AUDIT.md`, `KINH_DICH_INTERPRETATION_TEMPLATE.md`, `QUESTION_LIBRARY_SEED.md`) + 1 tài liệu chuyên môn Thầy cung cấp (`LUAN_QUE_LUC_HAO_SPEC.md` — quy trình luận Lục Hào đầy đủ, trích từ skill `hoa-giai-kinh-dich`). Không có code sản phẩm mới. Không đụng vào engine hiện có.

**2 quyết định phạm vi Thầy đã chốt trong Phase 1 (không còn treo):**
1. Bát Tự dùng cả 2 module theo đúng thứ tự có sẵn (`bat-tu.ts` lập lá số → `bat-tu-engine/engine.ts` luận vượng suy/dụng thần) — không phải chọn 1 trong 2, xem `EXISTING_ENGINE_AUDIT.md` §7.1.
2. **Không dùng Kỳ Môn Độn Giáp, không dùng Phong Thủy nhà ở (Bát Trạch/Huyền Không) trong app này** — giữ Quân Sư Thiên Anh đơn giản, dễ hiểu, đóng vai "1 ông cố vấn cho người bình thường". Kinh Dịch gánh phần lớn việc luận giải chi tiết; Bát Tự/Tử Vi chỉ kể "vận đang tốt hay xấu" qua đại vận/lưu niên.

**Quyết định còn treo, cần Thầy chốt trước khi bắt đầu Phase 2:**
1. `LUAN_QUE_LUC_HAO_SPEC.md` (bản cập nhật 2026-08-22) đã trả lời xong Phần A + Phần B của `KINH_DICH_INTERPRETATION_TEMPLATE.md` — chỉ còn 1 việc nhỏ: xác nhận cách xử lý câu hỏi "Quyết định A/B/C" (spec đề xuất gieo riêng từng phương án). Phần C (phối hợp với sơ đồ vận trình)/D (giọng văn kết luận)/E (ví dụ mẫu) của template vẫn CHƯA làm — đây giờ là việc quan trọng nhất còn lại trước Phase 3.
2. Quân Sư dùng theme thị giác riêng (`--qs-*`) hay thống nhất theme mới cho toàn site (xem `UI_DESIGN_SYSTEM.md` §7).
3. `question_categories` quản lý bằng code hay bằng Sanity CMS (xem `DATABASE_SCHEMA.md` §5).

## Phase 2 — Nền tảng kỹ thuật (chưa cho khách dùng)

Mục tiêu: dựng được đường ống dữ liệu đầu-cuối cho 1 nhóm câu hỏi thí điểm, chạy nội bộ, chưa public.

- Đọc chi tiết schema Drizzle hiện có, đối chiếu với `DATABASE_SCHEMA.md`, viết migration thật cho các bảng thực sự mới.
- Trích xuất logic gieo quẻ + luận Lục Hào từ `gieo-que-kinh-dich.astro` thành hàm gọi được (không đổi hành vi).
- Viết 3 adapter đầu tiên: `kinh-dich-adapter.ts`, `bat-tu-adapter.ts`, `tu-vi-adapter.ts` (theo `ENGINE_INTEGRATION.md` §3-4).
- Viết Question Library registry (data-driven) với 2-3 `question_definition` thí điểm thuộc category **Sự nghiệp** — chọn category này trước vì Bát Tự/Tử Vi/chart-profile đã trưởng thành nhất ở đây (theo audit).
- Viết Orchestrator khung (chưa cần Interpretation Engine thật — có thể trả kết luận giả lập để test luồng).
- Rà lại `docs\TUVI_ENGINE_AUDIT.md`, xác nhận 3 lỗi đã biết có ảnh hưởng field Quân Sư dùng không.
- Song song: Thầy điền `KINH_DICH_INTERPRETATION_TEMPLATE.md` (không phụ thuộc code, có thể làm song song với việc dựng nền tảng kỹ thuật).

## Phase 3 — Interpretation Engine + thí điểm nội bộ

- Chuyển nội dung `LUAN_QUE_LUC_HAO_SPEC.md` + phần Thầy điền thêm ở `KINH_DICH_INTERPRETATION_TEMPLATE.md` thành tài liệu tham chiếu có cấu trúc cho LLM (tương đương `handoff/knowledge/luan-giai-bat-tu/` nhưng cho Kinh Dịch).
- Đối chiếu "Lớp 2 — tính toán cơ học" trong `LUAN_QUE_LUC_HAO_SPEC.md` mục 3 (Không Vong, vượng suy, Nguyệt Phá, Trường Sinh, sinh khắc Thế/Ứng, biến hào) với logic thực tế trong `src/lib/luc-hao.ts` — nghi vấn phần lớn đã có sẵn (5 bộ golden test đặt tên khớp), việc chính là xác nhận khớp, không phải code từ đầu.
- Xây `interpretation-engine.ts` dựa trên hạ tầng `chart-profile/` (cache, cost logging), nạp tài liệu tham chiếu Kinh Dịch vừa biên soạn.
- Nối Orchestrator thật với Interpretation Engine cho category Sự nghiệp.
- Test nội bộ với Thầy + vài người dùng thân thiết — đối chiếu kết luận AI đưa ra với "ví dụ mẫu" Thầy đã điền ở Phần E của template, kiểm tra chi phí LLM/lượt, đúng giọng văn (gần gũi, không thuật ngữ khó theo nguyên tắc giao tiếp đã thống nhất).
- Bắt đầu áp dụng `UI_DESIGN_SYSTEM.md` cho khu vực Quân Sư.

## Phase 4 — Mở rộng nhóm câu hỏi + Trạch Nhật

- Thêm các category còn lại theo thứ tự ưu tiên kinh doanh (đề xuất: Kinh doanh, Tài chính, Đầu tư, Hôn nhân, Tình duyên trước — vì đã có Bát Tự/Tử Vi context sẵn sàng).
- Tích hợp `trach-nhat-adapter.ts` cho category "Chọn ngày giờ" (xem `ENGINE_INTEGRATION.md` §5) — map trực tiếp `question_id` → hàm có sẵn trong `trachnhat-engine`.
- Bắt đầu tính `pricing_tier` thật, nối với thanh toán SePay hiện có (bảng `premium_reports` → `payments`).
- Mở `family_profiles` cho các câu hỏi cần 2 hồ sơ (hôn nhân, hợp tác).

## Phase 5 — Đánh giá và mở rộng (nếu cần)

- Đánh giá dữ liệu Phase 2-4: câu hỏi nào khách hỏi nhiều nhất → ưu tiên cải thiện chất lượng luận giải nhóm đó trước khi mở rộng thêm.
- Nếu Thầy quyết định mở lại Kỳ Môn hoặc Phong Thủy nhà ở sau này, đây là lúc bàn — không nằm trong roadmap mặc định, chỉ mở khi có yêu cầu rõ ràng (xem `PRODUCT_ARCHITECTURE.md` §2 mục 3).

## Rủi ro xuyên suốt cần theo dõi mọi phase

- **`packages/*` không đồng bộ tự động** với package gốc — mỗi lần Phase 2+ động vào engine, nhớ đồng bộ thủ công hoặc dựng script.
- **Chưa có `KINH_DICH_INTERPRETATION_TEMPLATE.md` đã điền** — Phase 3 không thể bắt đầu nghiêm túc nếu thiếu, vì đây là nơi mang phần lớn chất lượng luận giải của toàn app.
- **Chi phí LLM** — Interpretation Engine gọi LLM mỗi lượt hỏi, cần theo dõi cost logging từ Phase 3, tránh vỡ mô hình giá `pricing_tier`.
- **An toàn nội dung** — nhóm Sức khỏe/Kiện tụng/Tài chính có `safety_rules` nghiêm ngặt hơn, cần review kỹ trước khi public từng nhóm này, không launch đại trà cùng lúc.
