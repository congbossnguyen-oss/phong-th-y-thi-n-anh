# Module Tam Hợp Phái (web, thầy-only)

Port TypeScript 1:1 từ engine Python gốc (gói `tam-hop-web-module`). Công cụ **nội bộ** — chỉ tài
khoản quản trị dùng được; khách chỉ thấy màn "đang hoàn thiện".

> **Cập nhật 10/9/2026 — ĐÃ GỠ LỚP AI** (anh Công: *"không cần AI vì đây là công cụ anh kiểm tra
> cho khách"*). Chỉ còn engine tra bảng; phần luận cát/hung do Thầy trực tiếp từ số liệu. Đã xóa
> `ai-prompt.ts` + route `luan-giai.ts` + nút/modal/script AI trong component. Entry
> `"tam-hop-luan-giai"` trong `goi-ai.ts` để nguyên (cấu hình thừa vô hại, không còn nơi gọi) —
> giống cách xử lý ở Huyền Không Phi Tinh.

## Các file

| File | Vai trò |
|---|---|
| `src/lib/tam-hop-phai/engine.ts` | Engine tra bảng thuần (không AI, không mạng). Port 1:1 từ `engine_reference.py`. |
| `tests/tam-hop-phai-engine.test.ts` | Port 4 nhóm self-test + ca đầy đủ (đối chiếu `vi-du-output-python.txt`) + ca thiếu input. |
| `src/components/tools/TamHopPhai.astro` | Gate `isAdmin` + form GET + kết quả engine (không AI). Engine chỉ chạy server-side. |
| `src/pages/dai-cat-loi/tam-hop-phai.astro` | Khung trang mỏng (BaseLayout + PageHero). URL `/dai-cat-loi/tam-hop-phai`. |

## Nguyên tắc (giữ đúng như bản Python)

- **Port 1:1**: toàn bộ bảng tra copy nguyên văn, không sửa/làm tròn/suy diễn.
- **Không đoán**: thiếu input nào → in cảnh báo ở `canh_bao`, không tự điền.
- **Bát Sát Huỳnh Tuyền**: luôn kèm cảnh báo "độ tin cậy TRUNG BÌNH".
- **Thầy-only**: tính toán + render kết quả chỉ chạy khi `Astro.locals.user?.isAdmin === true`; engine
  chỉ import trong frontmatter (server-side), không ở `<script>` client → khách không nhận dữ liệu engine.
- **KHÔNG dùng AI** (gỡ 10/9/2026): engine cho kết quả tra bảng đầy đủ, phần luận cát/hung do Thầy
  trực tiếp đối chiếu loan đầu thực địa — thống nhất với hướng đã chọn ở Huyền Không Phi Tinh.

## Chạy / kiểm thử

```bash
npx vitest run tests/tam-hop-phai-engine.test.ts    # self-test engine, phải pass 100%
```

Kiểm tay: mở `/dai-cat-loi/tam-hop-phai` khi CHƯA đăng nhập → chỉ thấy "đang hoàn thiện" (Network
tab không có JSON engine). Đăng nhập admin → nhập ca đầy đủ 195°/Tuất/Khôn/Mão/Dần/Thân, đối chiếu
`data/vi-du-output-python.txt` trong gói gốc.

## Ngoài phạm vi (chưa làm)

Tier/thanh toán, Loan Đầu auto-vision, 120 phân kim, tích hợp đa trường phái, và **gắn thẻ công khai**
trong `phong-thuy-chinh-phai.astro` (để sau, khi duyệt + có ảnh bìa).
