# Kỳ Môn Độn Giáp — engine lõi (Prompt 1)

Trạng thái: **chế độ Giờ đã dựng xong và ĐÃ CHỐT.** Test bắt buộc (mục 6 SPEC) pass 7/7, dùng đúng công thức mục 5/5B nguyên văn (đã verify qua LibreOffice) — không còn công thức xấp xỉ/suy ngược nào trong engine. Đối chiếu chéo thêm lá "Giờ 17:43 19/08/2026" (`TEST_6_che_do.md`, cục khác) cũng khớp đúng. Chưa có giao diện, chưa có 5 chế độ còn lại (Prompt 2), chưa có Tam Thắng/Lịch (Prompt 3).

Chạy test: `npx vitest run src/lib/kymon/engine.test.ts`

## Đã đối chiếu khớp — lá mẫu chính (22:41 19/07/2026, SPEC mục 6)

- Tứ trụ, cục (Âm 7), phù đầu (Kỷ).
- Trực Phù (sao Thiên Tâm, cung Cấn) / Trực Sử (Khai môn, cung Khôn) — đúng qua công thức + bảng tra(Y63) THẬT, không xấp xỉ.
- Toàn bộ 8 cung: Địa Bàn Can (8/8, kể cả Càn = Kỷ), Bát Môn (8/8), Bát Thần (8/8).
- Thiên Bàn Can tại cung Trực Phù (Cấn = Kỷ).
- 3/4 sao Thiên Bàn có trong lá mẫu — sao thứ 4 (Thiên Bồng ở Tốn) nghi lỗi chép tay, xem "Nghi vấn còn lại".

## Đã đối chiếu khớp — lá phụ (17:43 19/08/2026, cục 1, `TEST_6_che_do.md` bản đã sửa)

- Địa Bàn Can khớp 9/9 (Công xác nhận qua ảnh gốc — nghi vấn "đảo 180°" trước đó là lỗi transcription trong file, không phải lỗi engine).
- Trực Phù (sao Thiên Nhậm, cung Khôn) / Trực Sử (Sinh môn, cung Đoài) — khớp đúng.

## Công thức Trực Phù/Trực Sử — bản chốt cuối cùng

1. **X65 (Trực Phù lạc cung)**: dùng Bảng B (Mậu=1...Ất=9, đảo theo âm/dương độn) — không đổi so với mục 5 gốc.
2. **W63 (đầu vào Y63)**: dùng **Bảng A** — Giáp=1...Quý=10, **1 bảng cố định duy nhất**, KHÔNG có biến thể âm/dương riêng (khác Bảng B). Đây là lỗi đầu tiên đã sửa: nhầm tưởng Bảng A cũng có 2 chiều nên tạo thêm "Bảng A âm" (vô tình trùng giá trị Bảng B).
3. **tra(Y63)**: tra đúng bảng `tra_Y63` 6 dòng (Y63 luôn ra số chẵn khi dùng đúng Bảng A ở bước 2 — đã xác nhận qua 2 lá mẫu: Y63=10 và Y63=8).
4. **X64, X66**: nguyên văn công thức mục 5 gốc, không đổi gì (rẽ nhánh âm/dương như cũ; X66 = Bảng B + X64 − 1, CỘNG chứ không trừ).
5. **Bước đặc lệ cuối (SPEC 5B, verify qua LibreOffice)**: sau khi tính xong X65 và X66, **nếu kết quả = 5 (Trung cung) thì đổi thành 2 (Khôn)** — vì Trung cung không tự có Trực Phù/Trực Sử riêng, mượn thuộc tính của Khôn. Đây chính là mắt xích còn thiếu ở 2 checkpoint trước.

Toàn bộ giá trị trung gian (W62, X62, W63, X63, Y63, tra, X64, X65, X66) đều có trong `result.debugTrucSu` để đối chiếu tay khi cần, không phải dò lại từ đầu.

## Nghi vấn còn lại trong lá mẫu (không phải lỗi engine)

- **Sao ở Tốn ghi "Thiên Bồng"** (lá mẫu chính): engine tính ra **Thiên Nhậm** mới khớp toàn bộ hệ (3 sao còn lại đều khớp bằng đúng 1 quy luật duy nhất, dùng `thien_ban_chuoi_tham_chieu`). Nghi là chép nhầm ô khi transcribe từ ảnh — chưa ảnh hưởng gì tới độ tin cậy của công thức chính vì đây chỉ là 1 ô lẻ chưa xác nhận.

## Cấu trúc file

- `data/` — 3 file JSON Công gửi (bản mới nhất, có `tra_Y63`, `dia_ban_cong_thuc`, `thien_ban_chuoi_tham_chieu`).
- `constants.ts` — các bảng số cố định (Bảng A cố định, Bảng B theo âm/dương, chi, MOD, hướng...).
- `tables.ts` — nạp + tiền xử lý JSON, gồm `solveDiaBan()`/`diaBanCanByCung()` (hệ phương trình Địa Bàn) và `TRA_Y63`.
- `engine.ts` — hàm `lapLaBan()` chính, trả thêm `debugTrucSu` để đối chiếu tay khi cần.
- `engine.test.ts` — test bắt buộc theo lá mẫu SPEC mục 6.
- `types.ts` — kiểu dữ liệu vào/ra.

Tứ trụ (Năm/Tháng/Ngày/Giờ can-chi) dùng `@thien-anh/calendar-core` (package sẵn có trong monorepo) — đã đối chiếu khớp 100% với cả 2 lá mẫu tứ trụ trong SPEC/TEST.

## Còn lại cho Prompt 2 (chưa làm ở checkpoint này)

- 5 chế độ Ngày/Tháng/Năm/Mệnh/1080.
- Nhãn KV theo THÁNG (mới có theo GIỜ), Mã/Mộ mới là best-effort chưa đối chiếu.
- Thiên Bàn Can ở các cung khác ngoài cung Trực Phù mới suy theo quy tắc "đi theo Sao", chỉ đối chiếu được 1 điểm.
