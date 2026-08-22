# APP SKELETON — Quân Sư Thiên Anh (khung chạy đầu-cuối)

Khung hoàn chỉnh nối mọi mảnh đã xây (Phase 1-4) thành 1 luồng bấm được từ đầu đến cuối. Phần luận giải Kinh Dịch hiện là **bản demo** (chưa gọi AI thật) — khung để sẵn chỗ, thay engine thật sau.

## 1. Luồng chạy

```
/quan-su                         → "Anh đang quan tâm điều gì?" (15 nhóm)
  └─ /quan-su/[category]          → danh sách câu hỏi trong nhóm
       └─ /quan-su/hoi/[id]       → Bước 1 xác định câu hỏi → Bước 2 nhập thông tin
                                    → Bước 3 an quẻ (gieo 6 lần) → animation hiện 6 hào
                                    → POST /api/quan-su/luan
                                         └─ orchestrator: gieo quẻ (engine) + vận trình (engine)
                                            + luận (DEMO) → KẾT QUẢ QUÂN SƯ
                                    → hiện "KẾT QUẢ QUÂN SƯ" + card vận trình + "xem chi tiết"
```

## 2. File đã tạo

| File | Vai trò |
|---|---|
| `src/lib/quan-su/orchestrator.ts` | `runQuanSu()` — điều phối: gieo quẻ → vận trình → luận → kết quả |
| `src/lib/quan-su/interpretation-stub.ts` | `interpretDemo()` — **bản DEMO** luận giải (đóng gói dữ kiện thành Mở/Thân/Kết, KHÔNG phán đoán thật) |
| `src/pages/api/quan-su/luan.ts` | API POST: nhận câu hỏi + gieo + ngày sinh → orchestrator → JSON |
| `src/pages/quan-su/index.astro` | Màn "Anh đang quan tâm điều gì?" (15 nhóm) |
| `src/pages/quan-su/[category].astro` | Danh sách câu hỏi 1 nhóm |
| `src/pages/quan-su/hoi/[id].astro` | Luồng 6 bước: input → an quẻ (animation) → kết quả |
| `src/styles/quan-su.css` | Style sub-brand (Modern Mystical) dùng chung |
| `tests/quan-su-orchestrator.test.ts` | 7 test chạy đầu-cuối |

Tổng test Quân Sư: **43 pass**.

## 3. Nguyên tắc giữ đúng trong khung

- **Gieo quẻ chạy server** (`/api/quan-su/luan` gọi `luc-hao.ts`) — client chỉ gửi 6 kết quả tung xu, không tự tính quẻ.
- **KẾT QUẢ QUÂN SƯ hiện trước**, "Xem luận giải chi tiết" (bảng quẻ kỹ thuật) bấm mới mở — đúng UX đã chốt.
- **Card Vận Trình** hiện 4 thanh, không đổ toàn bộ lá số.
- Nhóm nhạy cảm (sức khỏe/kiện tụng) → cảnh báo an toàn hiện ở cả trang nhóm lẫn trong kết luận.
- Nhóm "chọn ngày giờ" (trach-nhat) → trang báo sẽ nối bộ Đại Cát Lợi sẵn có (không gieo quẻ).

## 4. Còn là DEMO / chờ hoàn thiện

- **Luận giải thật:** thay `interpretation-stub.ts` bằng `interpretation-engine.ts` gọi LLM (cần Thầy điền Phần E + hạ tầng chart-profile). Xem `INTERPRETATION_ENGINE.md`.
- **Lưu lịch sử:** hiện chưa lưu DB (`divination_sessions`/`advisory_reports`) — mới chạy realtime. Nối DB ở phase sau (`DATABASE_SCHEMA.md`).
- **Nhóm chọn ngày giờ:** chưa nối `trachnhat-engine` vào luồng Quân Sư (dùng tạm thông báo).
- **Calibrate 4 thanh vận trình** (CURRENT_LUCK_ENGINE.md §4) — chờ Thầy.
- **Giao diện:** bản khung tối giản, chưa phải giao diện cuối cùng (đúng phạm vi).
