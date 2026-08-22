# DIVINATION FLOW — Quân Sư Thiên Anh (Phase 3)

Quy trình hoàn chỉnh biến 1 câu hỏi trong Thư Viện thành 1 lần "hỏi Quân Sư": **chọn câu hỏi → thu thập thông tin → hướng dẫn an quẻ → lập quẻ → luận quẻ → kết luận**.

> ⚠️ **Không tự phát minh cách lập quẻ.** Toàn bộ việc lập quẻ dùng engine có sẵn `src/lib/luc-hao.ts` (đã audit, xem `ICHING_OUTPUT_SCHEMA.md`). Lớp nối: `src/lib/quan-su/divination.ts`.

## 1. Hai loại luồng theo `divination_method`

| Loại | Nhóm câu hỏi | Luồng |
|---|---|---|
| **Gieo quẻ Kinh Dịch** (`luc-hao`) | 14/15 nhóm | Có bước an quẻ (mục 2) — trọng tâm tài liệu này |
| **Chọn ngày giờ** (`trach-nhat`) | nhóm `chon-ngay-gio` | KHÔNG gieo quẻ — nhập khoảng thời gian + tuổi → `trachnhat-engine` trả danh sách ngày giờ tốt (xem `ENGINE_INTEGRATION.md` §5) |

## 2. Luồng 6 bước cho câu hỏi Kinh Dịch

Ví dụ: người dùng chọn **"Có nên rót tiền vào dự án này không?"** (`dau-tu-du-an`).

### BƯỚC 1 — Xác định đúng câu hỏi
- Hiển thị lại `title` + `subtitle` của câu hỏi để người dùng xác nhận đúng điều họ muốn hỏi.
- Nếu nhóm có `notice` (Sức khỏe, Kiện tụng) → hiện cảnh báo ngay tại đây, trước khi đi tiếp.
- Nguồn dữ liệu: `getQuestion(question_id)` từ Thư Viện (`src/lib/quan-su`).

### BƯỚC 2 — Thu thập dữ liệu cần thiết
- Render form từ `required_inputs` + `optional_inputs` của câu hỏi (data-driven, không hard-code).
- Với câu có dùng Bát Tự/Tử Vi (hầu hết): thu `ngay_sinh` (bắt buộc), `gio_sinh` (tùy chọn) → dùng vẽ **sơ đồ vận trình** sau này.
- `mo_ta_tinh_huong`: người dùng kể ngắn hoàn cảnh — đưa vào ngữ cảnh cho LLM (không ảnh hưởng quẻ).
- Nhóm "Quyết định" (`so-sanh-phuong-an`): thu `cac_phuong_an` (danh sách phương án) — sẽ gieo riêng 1 quẻ cho mỗi phương án (spec §4.9 Cách 1).

### BƯỚC 3 — Hướng dẫn an quẻ
- Hướng dẫn người dùng **tĩnh tâm nghĩ về câu hỏi**, rồi gieo quẻ theo phương pháp truyền thống: **3 đồng xu, gieo 6 lần** (mỗi lần cho 1 hào, từ dưới lên).
- Hai chế độ:
  - **Tự gieo** (khuyến khích, authentic): người dùng gieo 6 lần, app ghi lại giá trị mỗi lần (6/7/8/9). → `castLucHaoFromTosses(tosses, castInputNow())`.
  - **Gieo giúp**: app mô phỏng gieo (animation), người dùng chỉ cần chạm. → `castLucHaoRandom(castInputNow())`.
- Thời điểm gieo = **thời điểm hiện tại** (`castInputNow()`), quyết định Can Chi Ngày/Tháng/Giờ của quẻ.

### BƯỚC 4 — Lập quẻ + animation nhẹ
- Gọi hàm engine tương ứng (bước 3) → nhận `FullCastResult`.
- Hiển thị **animation nhẹ**: từng hào hiện dần từ dưới lên (đồng xu lật / nét hào vẽ dần), glow nhẹ khi xong (theo `UI_DESIGN_SYSTEM.md`). Không hoa mỹ quá — "vừa phải".

### BƯỚC 5 — Hiển thị kết quả quẻ (dữ liệu engine)
Hiển thị các thành phần từ `FullCastResult`:
- **Quẻ Chủ** (`chinh.name` + 6 hào)
- **Quẻ Biến** (`bien.name`, nếu có hào động)
- **Hào Động** (`dongPositions`)
- **Các dữ liệu theo engine**: Can Chi ngày/tháng/giờ, Nguyệt Lệnh, Nhật Thần, Tuần Không, và với mỗi hào: Lục Thân, Thế/Ứng, Nạp Giáp Can Chi, vượng suy... (xem `ICHING_OUTPUT_SCHEMA.md`).
- ⚠️ **UX:** KHÔNG đổ hết thuật ngữ ra ngay. Xem mục 3 — mặc định thu gọn phần kỹ thuật.

### BƯỚC 6 — Chạy Interpretation Engine
- Đóng gói payload: `buildInterpretationPayload(question, cast, { method, vanTrinh })` — gom câu hỏi + quẻ (nguyên văn) + sơ đồ vận trình (nếu có).
- Gửi payload cho Interpretation Engine (LLM) → nhận **KẾT QUẢ QUÂN SƯ** (xem `INTERPRETATION_ENGINE.md`).

## 3. Nguyên tắc UX hiển thị kết quả — "KẾT QUẢ QUÂN SƯ" trước

Người dùng bình thường KHÔNG cần nhìn thuật ngữ ngay. Thứ tự hiển thị:

```
┌─────────────────────────────────────────┐
│  KẾT QUẢ QUÂN SƯ                         │   ← hiện ĐẦU TIÊN, to, rõ
│  (bài luận mở bài/thân bài/kết luận,     │     giọng "quân sư đồng hành",
│   giọng đời thường, không thuật ngữ)      │     không thuật ngữ
├─────────────────────────────────────────┤
│  [ Xem luận giải chi tiết ▾ ]           │   ← bấm mới mở
│    • Quẻ chủ / quẻ biến / hào động       │
│    • Bảng 6 hào (Lục Thân, Thế/Ứng...)   │
│    • Can Chi ngày tháng, Tuần Không...   │
└─────────────────────────────────────────┘
```

- **Mặc định:** chỉ hiện "KẾT QUẢ QUÂN SƯ" (bài luận) — thứ người dùng thật sự cần.
- **"Xem luận giải chi tiết":** mở ra phần kỹ thuật (bảng quẻ, thuật ngữ) cho người muốn đào sâu.
- Đây đúng tinh thần định vị "quân sư đồng hành" (`PRODUCT_ARCHITECTURE.md` §7) — nói chuyện như người cố vấn, không như thầy bói đọc thuật ngữ.

## 4. Ánh xạ bước → code/dữ liệu

| Bước | Nguồn |
|---|---|
| 1. Xác định câu hỏi | `getQuestion()` (Thư Viện) + `notice` của nhóm |
| 2. Thu thập dữ liệu | `question.required_inputs` / `optional_inputs` |
| 3. Hướng dẫn an quẻ | UI + `castInputNow()` |
| 4. Lập quẻ | `castLucHaoFromTosses()` / `castLucHaoRandom()` → `luc-hao.ts` (engine) |
| 5. Hiển thị quẻ | `FullCastResult` (xem `ICHING_OUTPUT_SCHEMA.md`) |
| 6. Luận quẻ | `buildInterpretationPayload()` → Interpretation Engine (xem `INTERPRETATION_ENGINE.md`) |

## 5. Nơi thực thi (đề xuất kỹ thuật cho phase build UI)

- Lập quẻ nên chạy **server-side** (API route): client gửi 6 giá trị gieo của người dùng → server gọi `castLucHaoFromTosses` → lưu `FullCastResult` (bảng `iching_readings`, `DATABASE_SCHEMA.md`) → gọi Interpretation Engine → lưu `advisory_reports`. Vì sao: kết quả quẻ là authoritative (không để client sửa), và cần lưu lại lịch sử (`user_history`).
- Engine `luc-hao.ts` thuần TS, không phụ thuộc DOM → chạy được cả server lẫn client (hiện trang `gieo-que-kinh-dich.astro` gọi client-side; Quân Sư nên gọi server-side).
- **Chưa dựng UI hoàn chỉnh trong Phase 3** — tài liệu này + lớp `divination.ts` (đã test) là nền để phase sau ráp giao diện.
