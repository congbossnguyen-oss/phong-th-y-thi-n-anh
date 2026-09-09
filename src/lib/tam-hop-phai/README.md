# Module Tam Hợp Phái (web, thầy-only)

Port TypeScript 1:1 từ engine Python gốc (gói `tam-hop-web-module`). Công cụ **nội bộ** — chỉ tài
khoản quản trị dùng được; khách chỉ thấy màn "đang hoàn thiện".

## Các file

| File | Vai trò |
|---|---|
| `src/lib/tam-hop-phai/engine.ts` | Engine tra bảng thuần (không AI, không mạng). Port 1:1 từ `engine_reference.py`. |
| `src/lib/tam-hop-phai/ai-prompt.ts` | System prompt NGUYÊN VĂN + hàm thay biến `{{ket_qua_json}}`, `{{mo_ta_loan_dau_admin_nhap}}`. |
| `tests/tam-hop-phai-engine.test.ts` | Port 4 nhóm self-test + ca đầy đủ (đối chiếu `vi-du-output-python.txt`) + ca thiếu input. |
| `src/components/tools/TamHopPhai.astro` | Gate `isAdmin` + form GET + kết quả + nút AI (modal xác nhận). Engine chỉ chạy server-side. |
| `src/pages/dai-cat-loi/tam-hop-phai.astro` | Khung trang mỏng (BaseLayout + PageHero). URL `/dai-cat-loi/tam-hop-phai`. |
| `src/pages/api/dai-cat-loi/tam-hop-phai/luan-giai.ts` | Endpoint AI admin-only (403 nếu không phải admin). |

Chỗ chạm file chung duy nhất: thêm 2 dòng đăng ký `"tam-hop-luan-giai"` vào `src/lib/ai/goi-ai.ts`.

## Nguyên tắc (giữ đúng như bản Python)

- **Port 1:1**: toàn bộ bảng tra copy nguyên văn, không sửa/làm tròn/suy diễn.
- **Không đoán**: thiếu input nào → in cảnh báo ở `canh_bao`, không tự điền.
- **Bát Sát Huỳnh Tuyền**: luôn kèm cảnh báo "độ tin cậy TRUNG BÌNH".
- **Thầy-only**: tính toán + render kết quả chỉ chạy khi `Astro.locals.user?.isAdmin === true`; engine
  chỉ import trong frontmatter (server-side), không ở `<script>` client → khách không nhận dữ liệu engine.
- **AI tùy chọn**: chỉ gọi sau khi admin bấm xác nhận trong modal (không tự chạy khi load). Dùng lớp
  chung `goiAiToolUseVoiRetry` (route hiện tại: DeepSeek, ép `deepseek-chat`). Kết quả kèm nhãn cảnh báo.

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
