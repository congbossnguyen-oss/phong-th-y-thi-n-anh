# Module: Công cụ phong thủy tương tác

> Toàn bộ logic tính toán nằm ở `src/lib/` dưới dạng hàm thuần TypeScript (không gọi API ngoài, không lưu DB) — chạy được cả server-side lẫn có thể tái dùng client-side. 3 trang tương ứng: `lap-la-so-bat-tu.astro`, `gieo-que-kinh-dich.astro`, `tra-cuu-menh.astro`.

## 1. Lập lá số Bát Tự (Tứ Trụ) — `src/lib/bat-tu.ts`

Tính 4 trụ Can Chi (Năm/Tháng/Ngày/Giờ), Tàng Can, Thập Thần, Nạp Âm cho mỗi trụ, dựa trên thời gian sinh.

**Phạm vi cố ý giới hạn** (ghi rõ trong comment đầu file) — **không tính**:
- Đại Vận (cần độ chính xác tiết khí tới mức ngày/giờ khởi vận)
- Thần Sát đầy đủ
- Mệnh Cung, Thai Nguyên

Lý do: các phần này có nhiều dị bản giữa các trường phái, rủi ro sai cao nếu tự động suy diễn mà không có chuyên gia kiểm chứng.

### Cấu trúc dữ liệu chính

- `PillarInfo` — 1 trụ: `can`/`chi` (chữ), `napAm` + `napAmElement`, `tangCan` (mảng Can ẩn trong Chi kèm Thập Thần của từng Can ẩn), `thapThan` (Thập Thần của Can trụ so với Nhật Chủ), `truongSinh` (trạng thái Trường Sinh của Nhật Chủ tại Chi trụ, chỉ có ở 1 số trụ).
- `BatTuChart` — `{year, month, day, hour, nhatChu}`. `nhatChu` (Nhật Chủ) = Can của trụ Ngày, là mốc so sánh để tính Thập Thần cho 3 trụ còn lại.

### Thuật toán

- **Tàng Can**: bảng tra cứu tĩnh `TANG_CAN` (12 Chi → danh sách index Can ẩn, chính khí liệt kê trước, tạp khí sau).
- **Nạp Âm**: suy ra vị trí trong chu kỳ 60 Can Chi bằng cách dò tuần tự (tối đa 60 bước) tìm `cycle` sao cho `cycle % 10 == canIndex` và `cycle % 12 == chiIndex`, rồi tra bảng `NAP_AM` (30 mục, dùng chung `menh-nap-am.ts`).
- **Thập Thần** (`thapThanOf(canIndex, nhatChuIndex)`): so Ngũ Hành + Âm Dương của Can đang xét với Nhật Chủ, áp dụng quan hệ Sinh/Khắc Ngũ Hành để suy ra 1 trong 10 loại: Nhật Chủ, Tỷ Kiên, Kiếp Tài, Thực Thần, Thương Quan, Thiên Tài, Chính Tài, Thất Sát, Chính Quan, Thiên Ấn, Chính Ấn.
- **Trụ Tháng**: tính qua `getMonthChiIndex()` trong `src/lib/solar-term.ts` — dựa trên **tiết khí thực tế** (không dùng lịch âm dương lịch đơn thuần), vì ranh giới tháng Bát Tự theo tiết khí (Lập Xuân, Kinh Trập...) chứ không theo mùng 1 âm lịch.

## 2. Tính tiết khí (thiên văn) — `src/lib/solar-term.ts`

Hạ tầng tính toán hỗ trợ Bát Tự, không có trang riêng. Cung cấp: `jdFromDate()` (đổi ngày dương lịch sang Julian Day), `sunLongitude()` (kinh độ mặt trời biểu kiến), `getTietKhiAround()`, `getMonthChiIndex()` (suy ra Chi của trụ Tháng từ ngày sinh dựa trên 24 tiết khí).

## 3. Gieo quẻ Kinh Dịch — `src/lib/kinh-dich.ts`

Phương pháp: **gieo 3 đồng xu, lặp 6 lần** (mô phỏng số, không phải bốc mai hoa hay cỏ thi). Mỗi lần gieo cho 1 trong 4 giá trị hào: 6 (Lão Âm — hào biến), 7 (Thiếu Dương), 8 (Thiếu Âm), 9 (Lão Dương — hào biến).

**Phạm vi cố ý giới hạn** (comment đầu file) — chỉ tạo ra quẻ, **không luận giải sâu**: không tính Nạp Giáp, Lục Thân, Lục Thần, Thế/Ứng.

### Cấu trúc dữ liệu

- `TRIGRAMS` — 8 quái đơn (Càn, Đoài, Ly, Chấn, Tốn, Khảm, Cấn, Khôn) với ký hiệu Unicode (☰☱☲☳☴☵☶☷) và mảng hào nhị phân.
- `HEXAGRAM_NAMES` — bảng tra cứu đầy đủ tên 64 quẻ kép theo thứ tự Chu Dịch (King Wen), key dạng `"<Thượng quái>-<Hạ quái>"`.
- `buildHexagram(lines)` — ghép quái Thượng (3 hào trên) + Hạ (3 hào dưới) từ 6 hào gieo được, tra tên quẻ.
- `CastResult` — kết quả gieo: `rawLines` (6 giá trị hào thô 6/7/8/9, từ hào 1 dưới cùng đến hào 6 trên cùng) cùng quẻ dựng thành.

Trang `gieo-que-kinh-dich.astro` gọi `castHexagram()` để gieo ngẫu nhiên và hiển thị quẻ kết quả (bao gồm cả quẻ biến nếu có hào động 6/9).

## 4. Tra cứu mệnh theo năm sinh — `src/lib/menh-nap-am.ts`

Công cụ đơn giản nhất trong 3 công cụ — chỉ cần năm sinh dương lịch.

- `CAN` (10 Can), `CHI` (12 Chi), `CON_GIAP` (Chi → tên con giáp tiếng Việt).
- Công thức xác định vị trí trong chu kỳ 60 năm: `cycleIndex = ((year - 4) % 60 + 60) % 60` (mốc năm 4 sau Công Nguyên = Giáp Tý theo quy ước lịch Can Chi).
- `NAP_AM` — 30 mục Nạp Âm cố định (dữ liệu truyền thống, không tính toán, tra bảng thuần túy), mỗi mục có `name` (VD: "Hải Trung Kim") và `element` (1 trong 5 Ngũ Hành: Kim/Mộc/Thủy/Hỏa/Thổ).
- `NGU_HANH_MO_TA` — mô tả tính cách/màu sắc hợp mệnh theo từng Ngũ Hành, dùng để hiển thị diễn giải cho người dùng cuối (không chỉ trả về tên Nạp Âm khô khan).
- `tinhMenhTheoNamSinh(year)` — hàm tổng hợp: từ năm sinh → Can + Chi + con giáp + Nạp Âm + Ngũ Hành + mô tả.

## 5. Ghi chú thiết kế chung

Cả 3 công cụ đều là **tính toán thuần túy, không lưu trạng thái, không cần đăng nhập** — phù hợp làm công cụ thu hút traffic/lead cho website (người dùng dùng thử miễn phí, có thể dẫn tới CTA đặt lịch tư vấn hoặc mua khóa học chuyên sâu về Bát Tự/Kinh Dịch tương ứng trong [[04-module-khoa-hoc]]).
