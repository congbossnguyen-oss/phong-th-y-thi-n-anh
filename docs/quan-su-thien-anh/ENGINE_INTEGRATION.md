# ENGINE INTEGRATION — Quân Sư Thiên Anh (Phase 1)

Tài liệu này định nghĩa **hợp đồng tích hợp** giữa Quân Sư Orchestrator và từng engine — engine nào gọi khi nào, qua adapter nào, trả về trường nào. Không mô tả lại nội dung engine (đã có ở `EXISTING_ENGINE_AUDIT.md`).

## 1. Nguyên tắc chung

- Orchestrator **không bao giờ import trực tiếp** vào code nội bộ của engine (vd không tự tính Can Chi bằng tay). Luôn qua public API đã có của package/module.
- Mỗi engine ngữ cảnh (Bát Tự/Tử Vi) cần 1 **adapter mỏng mới** đặt tại `src/lib/quan-su/adapters/`, có nhiệm vụ DUY NHẤT: gọi engine gốc, rồi lọc kết quả xuống đúng field trong `interpretation_rules.contextFields` (xem `QUESTION_SCHEMA.md` mục 3, `SYSTEM_ARCHITECTURE.md` mục 5). Adapter không được thêm logic luận giải riêng.
- Engine gốc (`calendar-core`, `rule-engine`, `trachnhat-engine`, `bat-tu.ts`, `bat-tu-engine/`, `tu-vi/`, `luc-hao.ts`) giữ nguyên, không sửa.
- **Không dùng `kymon/` và không xây engine Phong Thủy nhà ở trong app này** — quyết định phạm vi trực tiếp từ Thầy ZHI GONG (2026-08-22): Quân Sư Thiên Anh giữ đơn giản, dễ hiểu, đóng vai "1 ông cố vấn cho người bình thường". Mục 5 (Kỳ Môn) và mục 7 (Phong Thủy) của bản thảo trước đã bị loại — xem lịch sử thay đổi cuối file nếu cần đối chiếu.
- ⚠️ **Kinh Dịch không còn là "1 trong nhiều engine" — nó là nơi gánh phần lớn việc luận giải chi tiết.** Bát Tự/Tử Vi thu hẹp vai trò còn đúng 1 việc: cho biết vận trình tổng thể (đại vận/lưu niên) đang tốt hay xấu, KHÔNG tự luận chi tiết. Bộ quy tắc luận Kinh Dịch theo từng nhóm câu hỏi cần Thầy biên soạn — xem khung mẫu ở `KINH_DICH_INTERPRETATION_TEMPLATE.md`.

## 2. Kinh Dịch — engine bắt buộc

- **Engine gốc:** `src/lib/luc-hao.ts` + logic gieo quẻ trong `src/pages/gieo-que-kinh-dich.astro`.
- **Adapter mới:** `src/lib/quan-su/adapters/kinh-dich-adapter.ts`
  - Trách nhiệm: tách phần logic gieo quẻ + luận Lục Hào ra khỏi trang `.astro` (hiện đang nằm trong page, cần trích xuất thành hàm gọi được từ Orchestrator — đây là việc cần làm ở đầu Phase 2, không phải viết lại luận lý).
  - Input: dữ liệu gieo quẻ (theo cách người dùng gieo — xúc xắc ảo/thao tác chọn hào — giữ nguyên UI hiện có).
  - Output: nguyên trạng object luận Lục Hào đầy đủ (không cắt bớt — đây LÀ engine chính, không áp dụng context budget).
- **Khi nào gọi:** luôn luôn, mọi câu hỏi.
- **Việc cần làm trước khi tích hợp:** đọc kỹ `luc-hao.ts` (916 dòng) để xác nhận có hàm xuất sẵn tách biệt được khỏi trang `.astro` hay không — nếu logic đang gắn chặt vào DOM/UI, cần refactor tách logic/UI (KHÔNG đổi hành vi luận giải) trước khi Orchestrator gọi được.

## 3. Bát Tự — engine ngữ cảnh, chỉ trả lời "vận đang tốt hay xấu"

Đã đọc toàn văn `bat-tu.ts` và `bat-tu-engine/engine.ts` — đây là 2 bước nối tiếp, không phải 2 lựa chọn cạnh tranh (xem `EXISTING_ENGINE_AUDIT.md` mục 7.1 bản đã sửa). Gọi theo đúng thứ tự:

- **Bước 1 — lập lá số:** `src/lib/bat-tu.ts` → `tinhBatTu(input)`, cho ra `BatTuChart` đầy đủ (tứ trụ, đại vận...).
- **Bước 2 — luận vượng suy/dụng thần:** `src/lib/bat-tu-engine/engine.ts` → `phanTichBatTu(tt)`, nhận tứ trụ từ bước 1, trả về Vượng/Suy Nhật Chủ + Dụng/Hỷ/Kỵ/Cừu Thần.
- **Adapter mới:** `src/lib/quan-su/adapters/bat-tu-adapter.ts`
  - Input: `{ birthDate, birthTime?, timezone, gender }` — lấy từ `user_profiles`/`family_profiles`.
  - Gọi bước 1 rồi bước 2 (không đổi hàm gốc nào).
  - Trích ra CHỈ dữ liệu để dựng **sơ đồ vận trình** (timeline dạng biểu đồ, KHÔNG phải đoạn văn bàn luận): toàn bộ 10 giai đoạn đại vận (tuổi bắt đầu/kết thúc, Can Chi) mỗi giai đoạn gắn nhãn tốt/bình thường/xấu (đối chiếu hành của giai đoạn đó với Dụng/Hỷ Thần = tốt, với Kỵ/Cừu Thần = xấu), cộng thêm lưu niên năm đang hỏi.
  - Output đưa cho Interpretation Engine (và có thể hiển thị thẳng cho người dùng dưới dạng biểu đồ, xem `UI_DESIGN_SYSTEM.md` §5): dữ liệu dạng `VanTrinhTimeline` — KHÔNG đưa toàn bộ tứ trụ/thần sát/nạp âm/`dienGiai[]` chi tiết, KHÔNG kèm đoạn văn luận giải dài. Việc luận chi tiết từng vấn đề là việc của Kinh Dịch, không phải của Bát Tự trong kiến trúc này — Bát Tự chỉ đưa "sơ đồ", không bàn thêm.

```typescript
// Hình dạng dữ liệu "sơ đồ vận trình" — dùng chung cho cả Bát Tự và Tử Vi (mục 4)
interface VanTrinhTimeline {
  giaiDoan: {
    tuoiBatDau: number;
    tuoiKetThuc: number;
    nhan: string;        // vd "Canh Ngọ" (Bát Tự) hoặc tên đại vận Tử Vi
    danhGia: "tot" | "binh_thuong" | "xau";
  }[];
  luuNienHienTai: { nam: number; nhan: string; danhGia: "tot" | "binh_thuong" | "xau" };
}
```
- **Khi nào gọi:** khi `required_engines` của câu hỏi chứa `"bat-tu"`.
- **Tham khảo cách gọi:** `chart-profile/bat-tu-engine-adapter.ts` đã làm đúng thứ tự bước 1→2 này cho mục đích khác (luận nghề nghiệp qua LLM) — adapter mới của Quân Sư có thể tham khảo cấu trúc nhưng KHÔNG chỉnh sửa file đó, viết file adapter riêng.

## 4. Tử Vi — engine ngữ cảnh, chỉ trả lời "vận đang tốt hay xấu"

- **Engine gốc:** `src/lib/tu-vi/engine.ts` (`tinhTuVi()`).
- **Adapter mới:** `src/lib/quan-su/adapters/tu-vi-adapter.ts`, cùng nguyên tắc như Bát Tự: lập đầy đủ lá số (không đổi hàm gốc), trích ra CHỈ dữ liệu `VanTrinhTimeline` (xem khung dữ liệu ở mục 3) — các giai đoạn đại vận gắn nhãn tốt/bình thường/xấu dựa trên cung Mệnh và sao chính tại mỗi giai đoạn, cộng lưu niên hiện tại. Không đưa toàn bộ 12 cung, không kèm đoạn văn luận giải.
- **Khi nào gọi:** khi `required_engines` chứa `"tu-vi"`.
- ⚠️ **Điều kiện bắt buộc trước khi dùng cho khách trả phí:** đọc `docs\TUVI_ENGINE_AUDIT.md`, xác nhận 3 lỗi đã biết (Hóa Khoa/Kỵ bị rớt cho 4 phụ tinh; Thiên Việt tính sai; `tinhMenhQuai` lỗi biên năm "00") không rơi vào field mà Quân Sư đang trích xuất. Nếu có nguy cơ, cần Thầy quyết định: sửa engine gốc trước (ngoài phạm vi Phase 1) hay tạm loại field đó khỏi context.

## 5. Chọn ngày giờ — dùng `trachnhat-engine` trực tiếp

Với nhóm câu hỏi thuộc category "chọn-ngày-giờ", dùng `EngineRef` riêng `"trach-nhat"`:

- **Engine gốc:** `trachnhat-engine` — 30+ hàm sẵn có cho từng loại việc (khai trương, ký hợp đồng, cưới hỏi, xuất hành...).
- **Adapter mới:** `src/lib/quan-su/adapters/trach-nhat-adapter.ts` — chọn đúng hàm trong `trachnhat-engine` khớp với `question_id` (vd `question_id: "chon-ngay-khai-truong"` → gọi `calculateNgayKhaiTruongRange`).
- Đây gần như là việc **map 1-1** giữa `question_id` và hàm engine có sẵn — không cần logic phức tạp, vì `trachnhat-engine` đã tính đúng thứ cần.

## 6. Kỳ Môn và Phong Thủy nhà ở — KHÔNG dùng trong app này

Quyết định phạm vi trực tiếp từ Thầy ZHI GONG (2026-08-22): Quân Sư Thiên Anh giữ đơn giản, đóng vai "1 ông cố vấn cho người bình thường" — không đưa Kỳ Môn Độn Giáp (`src/lib/kymon/`) và không đưa Phong Thủy nhà ở (Bát Trạch/Huyền Không, hiện cũng chưa có engine) vào phạm vi. Không có adapter, không có `EngineRef` cho 2 mục này. Nếu Thầy đổi ý ở giai đoạn sau, đây sẽ là việc mở lại có chủ đích, không phải mặc định.

## 7. Interpretation Engine — tái dùng hạ tầng `chart-profile/`, và là nơi mang trọng lượng luận giải chính

⚠️ Vì Kinh Dịch gánh phần lớn việc trả lời chi tiết (không chỉ Bát Tự/Tử Vi), Interpretation Engine ở đây quan trọng hơn 1 lớp gọi LLM thông thường — nó cần một bộ quy tắc luận Kinh Dịch theo từng nhóm câu hỏi do Thầy biên soạn. Xem khung mẫu Thầy cần điền: `KINH_DICH_INTERPRETATION_TEMPLATE.md`.

- **Hạ tầng gốc:** `src/lib/chart-profile/` — `llm.ts`, `cache.ts` (cache theo hash), `ghi-log-chi-phi.ts` (cost logging), `knowledge.ts` (nạp tài liệu tham chiếu).
- **Không sửa** các file trên. Tạo module mới `src/lib/quan-su/interpretation-engine.ts` dùng lại các hàm tiện ích (cache, cost logging) theo cùng mẫu, nhưng với prompt/tài liệu tham chiếu riêng cho Quân Sư (không dùng chung tài liệu `handoff/knowledge/*` vốn dành cho luận nghề nghiệp Bát Tự/Tử Vi — Quân Sư cần tài liệu tham chiếu Kinh Dịch theo `KINH_DICH_INTERPRETATION_TEMPLATE.md`).
- **Input:** quẻ Kinh Dịch (đầy đủ, là nguồn luận chính) + nhận định ngắn "vận tốt/xấu" từ Bát Tự/Tử Vi (nếu có) + `interpretation_rules` của câu hỏi (bao gồm bảng Dụng Thần và ma trận phối hợp Thầy điền trong template).
- **Output:** khớp đúng `output_schema` của câu hỏi — bài luận 3 đoạn `mo_bai`/`than_bai`/`ket_luan` (xem `QUESTION_SCHEMA.md` mục 3), viết theo văn phong đời thường không thuật ngữ, theo chỉ đạo ở `KINH_DICH_INTERPRETATION_TEMPLATE.md` Phần D.

## 8. Bảng tổng hợp "khi nào gọi engine nào"

| Engine | `EngineRef` | Bắt buộc? | Điều kiện gọi |
|---|---|---|---|
| Kinh Dịch (Lục Hào) | (ngầm định, không cần khai báo) | Luôn luôn | Mọi câu hỏi — nguồn luận giải chính |
| Bát Tự | `"bat-tu"` | Tùy chọn | `required_engines` chứa — chỉ trả "vận tốt/xấu" |
| Tử Vi | `"tu-vi"` | Tùy chọn | `required_engines` chứa — chỉ trả "vận tốt/xấu" |
| Trạch Nhật | `"trach-nhat"` | Tùy chọn | Category "chọn-ngày-giờ" thuần túy |
| ~~Kỳ Môn~~ | — | **Không dùng trong app này** | Quyết định phạm vi của Thầy, 2026-08-22 |
| ~~Phong Thủy nhà ở~~ | — | **Không dùng trong app này** | Quyết định phạm vi của Thầy, 2026-08-22 |
