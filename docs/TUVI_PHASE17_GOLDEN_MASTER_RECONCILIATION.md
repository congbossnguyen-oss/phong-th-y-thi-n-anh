# TUVI PHASE 17 — GOLDEN MASTER RECONCILIATION

**Không sửa engine. Không sửa Golden Master. Không commit/push.** Đây là phase thuần đối chiếu (read-only):
chạy `tinhTuVi()` (không đổi) cho cả 6 Golden Master (GM-001→006, GM-002 là natal-chart trùng GM-001 nên
gộp chung), lấy toàn bộ 14 chính tinh với vị trí (Chi) + trạng thái Miếu/Vượng/Đắc/Bình/Hãm mà engine thực
sự tính ra, đối chiếu **từng ô một** với đúng văn bản `TuVi_Golden_Master_Pack_V1.md`, và đối chiếu với bảng
`MAIN_STAR_STATUS` hiện tại (Phase 16, nguồn Nguyên Cát duy nhất).

Phương pháp: dump toàn bộ `chart.cungs[].chinhTinh` cho cả 6 GM qua script tạm (không đụng `engine.ts`,
đã xóa script sau khi lấy dữ liệu), sau đó so khớp bằng tay từng dòng với bảng "Principal stars" trong
Golden Master Pack.

---

## TÓM TẮT KẾT QUẢ THEO TỪNG GM

| GM | Số cặp (sao, chi) engine tính ra | Khớp vị trí + trạng thái | Vị trí sai (known bug) | Trạng thái sai (vị trí đúng, status khác) |
|---|---:|---:|---:|---:|
| GM-001 / GM-002 (cùng natal chart) | 14 | 14/14 | 0 | 0 |
| GM-003 | 15 | 12/15 | 1 (Thiên Lương) | 2 (Vũ Khúc@Mão, Thiên Cơ@Ngọ) |
| GM-004 | 14 | 14/14 | 0 | 0 |
| GM-005 | 14 | 12/14 | 2 (Tham Lang, Thất Sát — hoán đổi vị trí cho nhau) | 0 (xem mục "phát hiện phụ" bên dưới) |
| GM-006 | 12 | 9/12 | 2 (Vũ Khúc, Phá Quân) | 2 (Thái Âm@Dần, Thất Sát@Mùi) |

**GM-001/002 và GM-004: sạch 100%, không một ô nào lệch** (cả vị trí lẫn trạng thái) — đây là 28 phép so
sánh độc lập (14 sao × 2 GM) không có bất kỳ sai lệch nào, củng cố độ tin cậy tổng thể của engine.

---

## PHÁT HIỆN QUAN TRỌNG NHẤT: Vũ Khúc @ Mão — 3 NGUỒN, 3 GIÁ TRỊ, KHÔNG NGUỒN NÀO KHỚP NHAU

Đây là phát hiện mới, chưa từng được nêu rõ ở các phase trước (Phase 8-15 chỉ so 2 chiều: Nguyên Cát vs
GM-003). Phase 17 phát hiện thêm: **GM-006 cũng tự khai báo giá trị cho đúng ô Vũ Khúc @ Mão**, và giá
trị đó KHÁC CẢ HAI nguồn còn lại:

| Nguồn | Giá trị Vũ Khúc @ Mão | Ghi chú |
|---|---|---|
| MAIN_STAR_STATUS hiện tại (Nguyên Cát, Phase 16) | **Đắc** | Đang dùng làm SOURCE OF TRUTH |
| GM-003 (Nam Canh Ngọ 1990) | **Miếu** | Vị trí đã xác nhận đúng (engine tự tính Vũ Khúc tại Mão cho GM-003, khớp ảnh) — so sánh SẠCH, không vướng bug vị trí |
| GM-006 (04/02/2026 02:30) | **Hãm** | Vị trí VƯỚNG known bug (xem bên dưới) — engine hiện tính Vũ Khúc của GM-006 rơi vào Hợi chứ không phải Mão, nên đây là giá trị GM tự khai trong ảnh gốc, không phải giá trị engine đang xuất ra |

**3 nguồn, 3 giá trị khác nhau hoàn toàn (Đắc / Miếu / Hãm), không có 2 nguồn nào trùng nhau.** Ngay cả
khi bỏ qua nguồn Nguyên Cát, bản thân **2 Golden Master GM-003 và GM-006 cũng không đồng thuận với nhau**
về ô này — đây là mức độ mâu thuẫn cao hơn hẳn 3 ô còn lại (nơi chỉ có 1 GM mỗi ô mâu thuẫn với Nguyên
Cát, không có mâu thuẫn nội bộ giữa các GM với nhau). Không có cơ sở để chọn bên trong phạm vi Phase 17
(chỉ đối chiếu, không quyết định) — ghi nhận và để lại cho quyết định ở phase sau nếu cần.

Đã rà toàn bộ 14×~80 cặp (sao, chi) xuất hiện trong cả 6 GM để tìm các trường hợp 2 GM cùng khai báo 1 ô
nhưng khác giá trị — **đây là trường hợp DUY NHẤT tìm được**. Tất cả các cặp (sao, chi) khác chỉ xuất hiện
trong đúng 1 GM.

---

## 4 XUNG ĐỘT STATUS ĐÃ BIẾT TỪ TRƯỚC (Phase 8-16) — XÁC NHẬN LẠI, KHÔNG PHÁT SINH THÊM

Đối chiếu trực tiếp (vị trí engine tính đúng, chỉ trạng thái khác) — đúng 4 ô, không hơn không kém, khớp
hoàn toàn với danh sách đã biết:

| Sao @ Cung | MAIN_STAR_STATUS (Nguyên Cát) | Golden Master | GM nguồn |
|---|---|---|---|
| Vũ Khúc @ Mão | Đắc | Miếu | GM-003 |
| Thiên Cơ @ Ngọ | Đắc | Bình | GM-003 |
| Thái Âm @ Dần | Hãm | Miếu | GM-006 |
| Thất Sát @ Mùi | Đắc | Bình | GM-006 |

Không phát hiện thêm ô nào mới ngoài 4 ô này trong số các cặp (sao, chi) mà engine tính ĐÚNG vị trí. Đây
là kết quả tốt: xác nhận Phase 8/16 đã khoanh vùng đúng và đủ phạm vi xung đột "sạch" (vị trí không tranh
cãi, chỉ trạng thái khác).

---

## 3 KNOWN POSITION BUG (không thuộc phạm vi Phase 17 — chỉ ghi nhận, không sửa)

Đây là các bug về VỊ TRÍ sao (engine đặt sai cung), đã có sẵn `it.fails()` test từ trước, KHÔNG liên quan
tới bảng status vừa khóa ở Phase 16. Phase 17 xác nhận lại bằng dump thực tế:

### GM-003 — Thiên Lương
Engine tính Thiên Lương tại **Dần** (cùng cung Mệnh). GM-003 ảnh gốc ghi Thiên Lương tại **Thân** (cung
Thiên Di), trạng thái Miếu. Vì vị trí engine tính đã sai, KHÔNG thể so sánh trạng thái một cách sạch —
không tính đây là 1 status conflict mới.

### GM-005 — Tham Lang ⇄ Thất Sát (hoán đổi vị trí)
Engine tính: Thất Sát tại Dần, Tham Lang tại Tuất.
GM-005 ảnh gốc ghi: Tham Lang tại Dần (Vượng), Thất Sát tại Tuất (Miếu).
→ Đây là 1 phép hoán đổi (swap) rõ ràng giữa 2 sao trong Vòng Thiên Phủ cho riêng trường hợp GM-005.

**Phát hiện phụ (contingent, không tính là xung đột chính thức vì còn vướng position bug)**: nếu giả định
vị trí đúng theo GM (Tham Lang@Dần, Thất Sát@Tuất) thay vì vị trí engine đang tính, thì trạng thái GM khai
báo tại các cung đó cũng KHÔNG khớp bảng hiện tại:
- Tham Lang @ Dần: bảng hiện tại = Đắc, GM-005 khai = Vượng.
- Thất Sát @ Tuất: bảng hiện tại = Hãm, GM-005 khai = Miếu.

Ghi nhận riêng, KHÔNG gộp vào danh sách 4 xung đột chính thức ở trên vì còn phụ thuộc vào việc sửa position
bug trước (ngoài phạm vi Phase 17 — "không sửa engine").

### GM-006 — Vũ Khúc + Phá Quân
Engine tính: Vũ Khúc + Phá Quân tại **Hợi** (cung Huynh Đệ). GM-006 ảnh gốc ghi Vũ Khúc + Phá Quân tại
**Mão** (cung Huynh Đệ theo cách đặt tên của GM-006 — 2 GM có Cục khác nhau nên tên cung tại cùng vị trí
tương đối có thể khác). Đây là lệch 4 cung (Mão→Hợi hoặc ngược lại), nhiều khả năng do lỗi offset trong
1 trong 2 vòng sao cho riêng Cục Hỏa Lục Cục — KHÔNG điều tra sâu thêm trong Phase 17 (đúng phạm vi "không
sửa engine").

**Phát hiện phụ**: GM-006 khai Phá Quân(Hãm) tại Mão — nếu so với bảng hiện tại, Phá Quân@Mão = Hãm, **KHỚP**
(dù vị trí sai, giá trị trạng thái tình cờ đúng). Còn Vũ Khúc(Hãm) tại Mão theo GM-006 thì KHÔNG khớp bảng
hiện tại (Đắc) — đây chính là giá trị thứ 3 đã nêu ở mục "phát hiện quan trọng nhất" bên trên.

---

## KẾT LUẬN PHASE 17

- **Không sửa engine, không sửa Golden Master** — đúng yêu cầu, toàn bộ phase chỉ đọc/đối chiếu.
- **28/28 phép so sánh sạch từ GM-001/002 + GM-004: khớp 100%.**
- **4 xung đột status đã biết (Phase 8-16) được xác nhận lại, không phát sinh thêm xung đột "sạch" nào mới.**
- **1 phát hiện mới quan trọng**: Vũ Khúc @ Mão không chỉ mâu thuẫn giữa Nguyên Cát và GM-003 như đã biết,
  mà còn có giá trị thứ 3 hoàn toàn khác từ GM-006 — nghĩa là ngay cả 2 Golden Master cũng không thống nhất
  với nhau ở ô này. Đây là ô rủi ro cao nhất trong toàn bộ hệ thống.
- **3 known position bug được xác nhận lại bằng dump thực tế** (Thiên Lương GM-003, Tham Lang⇄Thất Sát
  GM-005, Vũ Khúc+Phá Quân GM-006) — không thuộc phạm vi status reconciliation, không sửa.
- **2 phát hiện phụ (contingent)** về trạng thái tại vị trí GM-005 khai báo cho Tham Lang/Thất Sát — ghi
  nhận riêng, chưa tính là xung đột chính thức vì còn vướng position bug chưa sửa.

Không có thay đổi nào lên `src/lib/tu-vi/`, test suite, hay Golden Master trong phase này.
