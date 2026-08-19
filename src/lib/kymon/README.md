# Kỳ Môn Độn Giáp — engine lõi (Prompt 1 + Prompt 2)

Trạng thái: **chế độ Giờ ĐÃ CHỐT** (Prompt 1). **3 chế độ Giờ/Mệnh/1080 ĐÃ CHỐT** (Prompt 2), dùng chung 1 engine lõi đúng như SPEC yêu cầu. **Ngày/Tháng/Năm TẠM NGƯNG có chủ đích** (quyết định của Công, không phải lỗi/thiếu sót) — xem mục "Prompt 2" bên dưới. Chưa có giao diện, chưa có Tam Thắng/Lịch (Prompt 3).

Chạy test: `npx vitest run src/lib/kymon/`

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
- `engine.ts` — hàm `lapLaBan()` chính (dùng chung cho 6 chế độ, xem `layLaBanTuThoiThan()`), trả thêm `debugTrucSu` để đối chiếu tay khi cần.
- `engine.test.ts` — test bắt buộc theo lá mẫu SPEC mục 6 (chế độ Giờ).
- `engine.modes.test.ts` — test 6 chế độ (Prompt 2), theo `TEST_6_che_do.md`.
- `types.ts` — kiểu dữ liệu vào/ra (`LapLaBanInput` là discriminated union theo `cheDo`).

Tứ trụ (Năm/Tháng/Ngày/Giờ can-chi) dùng `@thien-anh/calendar-core` (package sẵn có trong monorepo) — đã đối chiếu khớp 100% với cả 2 lá mẫu tứ trụ trong SPEC/TEST.

## Prompt 2 — Giờ / Mệnh / 1080 (đang hỗ trợ) + Ngày / Tháng / Năm (tạm ngưng)

**Nguyên tắc dùng chung 1 engine**: mọi chế độ đều đi qua `layLaBanTuThoiThan()` — chỉ khác nhau ở 2 tham số đầu vào: `{canThoiThan, chiThoiThan}` (trụ nào làm thời thần) và `{cục, âm/dương}`. Với Giờ/Mệnh, **cục/âm-dương tra theo NGÀY DƯƠNG đã nhập** trong km_data.json. Chế độ 1080 nhập tay {cục, âm/dương, hoa giáp}, bỏ qua tra lịch.

**Đã xác nhận chắc chắn (test bắt buộc, `engine.modes.test.ts`), 12/12 pass:**
- Không truyền `cheDo` → mặc định `'gio'` (tương thích ngược với Prompt 1).
- **Mệnh = y hệt Giờ** khi cùng thời điểm (đúng SPEC: Mệnh chỉ khác input là giờ SINH thay vì giờ hiện tại, xử lý y hệt).
- Chế độ Giờ (17:43 19/08/2026) khớp đúng `TEST_6_che_do.md`: Trực Phù=Thiên Nhậm tại Khôn, Trực Sử=Sinh tại Đoài, cục Âm 1.
- Chế độ 1080: nhập thẳng {cục, âm/dương, hoa giáp}, cho kết quả giống hệt chế độ Giờ khi cùng dữ kiện (test chéo với lá mẫu chính SPEC mục 6: cục Âm 7 + hoa giáp Ất Hợi).
- Gọi `lapLaBan({cheDo: "ngay"|"thang"|"nam", ...})` báo lỗi rõ ràng ("tạm ngưng...") thay vì âm thầm trả kết quả chưa xác nhận — có test riêng cho hành vi này.

### Ngày / Tháng / Năm — TẠM NGƯNG có chủ đích (quyết định của Công, 19/08/2026)

**Lý do:** Ngày/Tháng/Năm là 3 hệ lập cục RIÊNG BIỆT trong lý thuyết Kỳ Môn (Nhật gia / Nguyệt gia / Niên gia Kỳ Môn) — khác hẳn **Thời gia Kỳ Môn** mà file Excel/km_data.json hỗ trợ (km_data.json chỉ có cục tra theo NGÀY, không có bảng riêng cho tháng/năm). Đối chiếu với `TEST_6_che_do.md` cho thấy rõ: dùng "cục theo ngày đã nhập" (nguyên tắc duy nhất có dữ liệu hỗ trợ) thì Trực Phù/Trực Sử của Ngày/Tháng KHÔNG khớp bullet-list mẫu.

**2 điểm mốc đã dò được** (giữ lại để dùng khi có đủ dữ liệu, KHÔNG đưa vào engine vì mới có 2 điểm — không đủ để suy ra quy luật an toàn):
- **Ngày** (trụ Ất Sửu, tại 19/08/2026): cần cục **8**, Âm (không phải cục 1 = cục theo ngày) mới khớp Trực Phù=Thiên Nhậm@Ly + Trực Sử=Sinh@Đoài như `TEST_6_che_do.md` ghi.
- **Tháng** (trụ Bính Thân, tại 19/08/2026): cần cục **7**, Âm mới khớp Trực Phù=Thiên Phụ@Ly + Trực Sử=Đỗ@Khôn.
- (Năm dùng cục theo ngày = 1 đã khớp sẵn, nhưng Công xác nhận đây vẫn là hệ Niên gia riêng, không suy rộng ra quy luật chung từ 1 điểm trùng hợp này.)

**Trạng thái code:** logic chọn trụ tháng/năm theo TIẾT KHÍ (đúng, đã verify qua `@thien-anh/calendar-core`) vẫn giữ nguyên trong hàm nội bộ `_layLaBanTheoLichNoiBo()` (`engine.ts`) — **chưa xóa, chỉ chưa export/chưa gọi** từ `lapLaBan()` công khai. Khi có đủ dữ liệu mẫu để xác định đúng công thức lập cục Nhật gia/Nguyệt gia/Niên gia, chỉ cần nối lại `truByCheDo` trong `_layLaBanTheoLichNoiBo` với nguồn cục đúng rồi mở lại type `CheDoHoTro` (`types.ts`) — không cần viết lại từ đầu.

**UI (Prompt 4, chưa làm):** menu chọn chế độ chỉ nên hiện 3 nút Giờ / Mệnh / 1080. KHÔNG hiện nút Ngày/Tháng/Năm dạng disabled — bỏ hẳn khỏi menu cho gọn, trừ khi sau này mở lại.

## Còn lại cho Prompt 3 (chưa làm)

- Tab Tam Thắng, Tab Lịch (mục 6C, 6D SPEC).
- Nhãn 12 cung Mệnh + vòng tuổi đại vận (Công đã nói tạm chưa làm — đúng như Prompt 2 yêu cầu, để placeholder).
- Nhãn KV theo THÁNG (mới có theo GIỜ), Mã/Mộ mới là best-effort chưa đối chiếu.
- Thiên Bàn Can ở các cung khác ngoài cung Trực Phù mới suy theo quy tắc "đi theo Sao", chỉ đối chiếu được 1-2 điểm/lá.
