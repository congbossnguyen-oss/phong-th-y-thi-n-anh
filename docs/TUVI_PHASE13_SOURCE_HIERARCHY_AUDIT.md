# TUVI PHASE 13 — STATUS SOURCE HIERARCHY AUDIT

Đánh giá CHẤT LƯỢNG bằng chứng (không phải SỐ LƯỢNG) cho 5 ô UNRESOLVED. **Không sửa
`src/lib/tu-vi/`, không sửa Golden Master, không sửa status table, không commit/push, không sửa bất kỳ
calculation nào.**

## Phân loại LEVEL nguồn (dùng xuyên suốt file này)

| Level | Định nghĩa |
|---|---|
| 1 | Ảnh lá số gốc / Golden Master source (GM-001→006, người dùng cung cấp từ ảnh thật) |
| 2 | Sách/tài liệu gốc của trường phái (chưa tìm được bản gốc nào ở Phase 12 — chỉ có bài diễn giải) |
| 3 | Phần mềm lập lá số độc lập (chưa dùng ở Phase 12 — chỉ đề xuất, chưa thực hiện) |
| 4 | Bài nghiên cứu có tác giả rõ (hocvienlyso.org — nhiều tác giả khác nhau, xem ghi chú) |
| 5 | Trang tổng hợp (lichngaytot.com và tương tự — không có tác giả cá nhân) |

**Nguyên tắc bắt buộc**: KHÔNG gộp các tác giả khác nhau trên hocvienlyso.org thành 1 nguồn duy nhất.
KHÔNG dùng số lượng nguồn để voting. KHÔNG kết luận chỉ vì 1 giá trị xuất hiện nhiều lần — phải kiểm tra
COMMON_ANCESTOR_SOURCE trước khi đếm là "nhiều nguồn đồng thuận".

---

## Ô 1 — Vũ Khúc @ Mão

### Evidence Matrix

| SOURCE_ID | Tác giả | Trường phái | Loại nguồn | Ngày/tài liệu | Giá trị status | Candidate/GM liên quan | Độc lập với GM? | Mức độ tin cậy |
|---|---|---|---|---|---|---|---|---|
| GM-003 | Không rõ (ảnh do người dùng cung cấp, gốc "Học Viện Lý Số Nguyên Cát" theo bối cảnh trước đó) | Nam Phái / Nguyên Cát | Level 1 | Không ghi ngày; `TuVi_Golden_Master_Pack_V1.md` | **Miếu** | GM-003 (Nam Canh Ngọ 1990) | — (chính là GM) | Cao (Level 1) nhưng đã ghi nhận nghi ngờ transcription ở phase trước cho 1 số ô KHÁC của cùng GM-003 (không phải ô này) |
| NC-1 | Không nêu tên cụ thể trong trích dẫn (`TuVi_Profile_NguyenCat_V1.md` §3.4 chỉ ghi "Học viện lý số, 'Đại cương về Sao Vũ Khúc'") | Nam Phái / Nguyên Cát (do người dùng chọn làm profile) | Level 4 (chưa xác minh được bản gốc) | Không ghi ngày | **Đắc** | Candidate Target B (25/06/1955, giờ Mão) | Có (không liên quan biên soạn GM Pack) | Trung bình — chưa xác minh được bài "Đại cương về Sao Vũ Khúc" có tồn tại đúng như trích hay không |
| WEB-2 | Dương Lương | Không ghi rõ trong bài (không xác nhận có phải Nam Phái Nguyên Cát hay không) | Level 4 | hocvienlyso.org/chinh-tinh-sao-vu-khuc.html, không ghi ngày trong nội dung đã fetch | **Đắc** | Candidate Target B | Có | Trung bình |

**COMMON_ANCESTOR_SOURCE**: KHÔNG XÁC ĐỊNH ĐƯỢC quan hệ giữa NC-1 và WEB-2. Tiêu đề NC-1 trích ("Đại
cương về Sao Vũ Khúc") KHÔNG khớp tiêu đề thật của WEB-2 ("Chính tinh: Sao Vũ Khúc", URL
`chinh-tinh-sao-vu-khuc.html`) — có thể là 2 bài khác nhau, có thể NC-1 trích nhầm tên, không đủ căn cứ
kết luận theo hướng nào. **Vì vậy KHÔNG được tính NC-1 + WEB-2 = "2 nguồn đồng thuận"** — phải coi là
tối đa 1-2 nguồn Level 4 chưa rõ ràng, không phải bằng chứng mạnh áp đảo Level 1.

### Kết quả: `CONFLICTED`

GM (Level 1) = Miếu. Nguồn Level 4 (1 hoặc 2, không chắc) = Đắc. Không đủ căn cứ để bác bỏ Level 1 chỉ
bằng Level 4 chưa xác minh nguồn gốc rõ ràng.

---

## Ô 2 — Thiên Cơ @ Ngọ

### Evidence Matrix

| SOURCE_ID | Tác giả | Trường phái | Loại nguồn | Ngày/tài liệu | Giá trị status | Candidate/GM liên quan | Độc lập với GM? | Mức độ tin cậy |
|---|---|---|---|---|---|---|---|---|
| GM-003 | Không rõ | Nam Phái / Nguyên Cát | Level 1 | `TuVi_Golden_Master_Pack_V1.md` | **Bình** | GM-003 | — | Cao (Level 1) |
| NC-2 | Không nêu tên cụ thể (`TuVi_Profile_NguyenCat_V1.md` §3.2, chỉ ghi "Học viện lý số / Tử Vi Nguyên Cát", không có tên bài) | Nam Phái / Nguyên Cát | Level 4 (không xác minh được bài gốc — trích dẫn còn mơ hồ hơn cả NC-1) | Không ghi | **Đắc** | Candidate Target B | Có | Thấp (không có cả tên bài để tra) |
| WEB-3a | Dương Lương (biên soạn), nội dung ghi theo **Vương Đình Chi** | **Có khả năng KHÁC trường phái** — Vương Đình Chi là tác giả có hệ thống riêng, từng được ghi nhận bất đồng với Thái Thứ Lang ở các sao khác (xem Phase 12 kết quả tìm kiếm) | Level 4 | hocvienlyso.org/sao-thien-co-vuong-dinh-chi.html | **Miếu** | Candidate Target B | Có | Trung bình, NHƯNG nghi vấn khác trường phái (xem dưới) |
| WEB-3b | Dương Lương (biên soạn), trích Lục Bân Triệu + Vương Đình Chi + Phan Tử Ngư, cuối bài dẫn "phongthuythuatso.vn" | Hỗn hợp 3 tác giả — không phải 1 trường phái thuần | Level 4 | hocvienlyso.org/dac-tinh-cua-sao-thien-co.html | **Miếu** (câu chữ giống hệt WEB-3a: "Sao Thiên cơ miếu ở Tý Ngọ, hãm ở Sửu Mùi") | Candidate Target B | Có (nhưng xem COMMON_ANCESTOR) | Không cộng dồn với WEB-3a |

**COMMON_ANCESTOR_SOURCE**: **CÓ** — WEB-3a và WEB-3b cùng do Dương Lương biên soạn trên cùng domain
hocvienlyso.org, cùng trích câu **giống hệt nhau từng chữ** ("Sao Thiên cơ miếu ở Tý Ngọ, hãm ở Sửu
Mùi"). Đây gần như chắc chắn là 1 bảng gốc được đăng lặp ở 2 URL khác nhau, KHÔNG PHẢI 2 bằng chứng độc
lập. Đánh dấu WEB-3a ≡ WEB-3b (tính là 1 nguồn duy nhất khi đánh giá).

**Nghi vấn khác trường phái**: nguồn "Miếu" đến từ Vương Đình Chi — một tác giả có hệ thống lý luận
riêng biệt, không chắc cùng họ Nam Phái Nguyên Cát mà `TuVi_Profile_NguyenCat_V1.md` đã chọn làm
`PROFILE_ID`. Theo đúng nguyên tắc của chính profile đó (mục 1: "Do NOT mix... status tables from one
school"), giá trị "Miếu" từ Vương Đình Chi **có thể không hợp lệ để đối chiếu trực tiếp** với profile
Nguyên Cát — đây không hẳn là "1 nguồn thứ 3 mâu thuẫn trong cùng hệ thống" mà có thể là "câu trả lời của
1 hệ thống khác cho 1 câu hỏi khác".

### Yêu cầu ghi rõ theo chỉ thị (không chọn bên)

```
GM = Bình
Source A (NC-2, Nguyên Cát) = Đắc
Source B (WEB-3a/3b, Vương Đình Chi qua Dương Lương — khả năng khác trường phái) = Miếu
```

### Kết quả: `CONFLICTED`

Đây là ô có mức độ bất định cao nhất trong 5 ô: 3 giá trị khác nhau, và giá trị thứ 3 (Miếu) còn nghi vấn
đến từ khác trường phái hoàn toàn — càng không có cơ sở chọn bên.

---

## Ô 3 — Thái Âm @ Dần

### Evidence Matrix

| SOURCE_ID | Tác giả | Trường phái | Loại nguồn | Ngày/tài liệu | Giá trị status | Candidate/GM liên quan | Độc lập với GM? | Mức độ tin cậy |
|---|---|---|---|---|---|---|---|---|
| GM-006 | Không rõ | Nam Phái / Nguyên Cát | Level 1 | `TuVi_Golden_Master_Pack_V1.md` | **Miếu** | GM-006 | — | Cao (Level 1), nhưng GM-006 đã có tiền sử 2 nghi vấn transcription khác (Mão/Hợi vị trí sao, Tuần Không) — không phải ở đúng ô này, nhưng hạ nhẹ độ tin cậy tổng thể của GM-006 so với các GM khác |
| NC-3 | Không nêu tên cụ thể (§3.8 trích "Học viện lý số, 'Tìm hiểu về Sao Thái Âm'") | Nam Phái / Nguyên Cát | Level 4 (chưa xác minh bài gốc) | Không ghi | **Hãm** | Candidate Target C | Có | Trung bình |
| WEB-4a | Không xác định trong nội dung đã fetch | Không xác định | Level 4 hoặc 5 (chưa rõ) | hocvienlyso.org/sao-thai-am.html | "Dần Mão Thìn thì thất huy" → **Hãm** (diễn giải, không dùng đúng chữ "Hãm") | Candidate Target C | Có | Thấp-Trung bình (thuật ngữ "thất huy" không phải "Hãm" trực tiếp, cần diễn giải) |
| WEB-4b | Không có tác giả cá nhân (trang tổng hợp) | Không xác định | Level 5 | lichngaytot.com/tu-vi/sao-thai-am-trong-la-so-tu-vi-304-218348.html | **Hãm** | Candidate Target C | Có, khác domain hoàn toàn với WEB-4a | Thấp (Level 5, trang tổng hợp phổ thông) |

**COMMON_ANCESTOR_SOURCE**: NC-3 và WEB-4a KHÔNG XÁC ĐỊNH ĐƯỢC có chung nguồn hay không (tiêu đề NC-3
trích "Tìm hiểu về Sao Thái Âm" không khớp chính xác — hocvienlyso có ít nhất 2 bài khác nhau về Thái Âm:
`sao-thai-am.html` và `binh-giai-sao-thai-am.html`, không rõ NC-3 lấy từ bài nào). WEB-4b (lichngaytot.com)
xác nhận độc lập về mặt xuất bản (khác domain, khác loại nguồn).

### Kết quả: `CONFLICTED`

GM (Level 1) = Miếu, đối lập với ít nhất 2 nhóm nguồn Level 4/5 (Nam Phái-liên-quan qua NC-3/WEB-4a, và
Level 5 độc lập qua WEB-4b) đều nghiêng Hãm. Dù số lượng nguồn thiên về Hãm nhiều hơn, **không dùng số
lượng để kết luận** — Level 1 vẫn chưa bị bác bỏ chắc chắn vì WEB-4a diễn giải gián tiếp ("thất huy") và
quan hệ NC-3/WEB-4a chưa rõ độc lập.

---

## Ô 4 — Thất Sát @ Mùi

### Evidence Matrix

| SOURCE_ID | Tác giả | Trường phái | Loại nguồn | Ngày/tài liệu | Giá trị status | Candidate/GM liên quan | Độc lập với GM? | Mức độ tin cậy |
|---|---|---|---|---|---|---|---|---|
| GM-006 | Không rõ | Nam Phái / Nguyên Cát | Level 1 | `TuVi_Golden_Master_Pack_V1.md` | **Bình** | GM-006 | — | Cao (Level 1), cùng lưu ý độ tin cậy GM-006 như Ô 3 |
| NC-4 | Không nêu tên cụ thể (§3.13 trích "Học viện lý số, 'Sao Thất Sát trong Tử Vi'") | Nam Phái / Nguyên Cát | Level 4 (chưa xác minh bài gốc) | Không ghi | **Đắc** | Candidate Target C | Có | Trung bình |
| WEB-5 | Không xác định trong nội dung đã fetch | Không xác định | Level 4 (chưa rõ tác giả cụ thể) | hocvienlyso.org/sao-that-sat-phan-1.html | "Miếu địa: Dần Thân Tý Ngọ. Vượng địa: Tỵ Hợi. **Đắc địa: Sửu Mùi.** Hãm địa: Mão Dậu Thìn Tuất." | Candidate Target C | Có | Trung bình |

**COMMON_ANCESTOR_SOURCE**: NC-4 trích tên bài "Sao Thất Sát trong Tử Vi", WEB-5 có tiêu đề thực tế
"Sao Thất Sát - Phần 1" — lại một lần nữa KHÔNG khớp tên chính xác, KHÔNG XÁC ĐỊNH ĐƯỢC độc lập hay
chung nguồn.

### Kết quả: `CONFLICTED`

Tương tự Ô 1 và Ô 3 — Level 1 (Bình) đối lập Level 4 chưa rõ độc lập (Đắc). Không đủ căn cứ bác bỏ Level
1.

---

## Ô 5 — Thiên Lương: TÁCH RIÊNG Sửu và Mùi, KHÔNG suy luận Mùi từ Sửu

### 5.1 Thiên Lương @ Sửu (không thuộc 5 ô mục tiêu Phase 13 — chỉ đối chiếu để KHÔNG lẫn sang Mùi)

| SOURCE_ID | Tác giả | Trường phái | Loại nguồn | Giá trị status | Ghi chú |
|---|---|---|---|---|---|
| GM-005 | Không rõ | Nam Phái / Nguyên Cát | Level 1 | **Đắc** | Đã KHÓA ở Phase 8 (`MAIN_STAR_STATUS["Thiên Lương"][1] = "Đắc"`), có bằng chứng Level 1 trực tiếp |
| WEB-1 | Dương Lương | Không xác định có cùng Nam Phái Nguyên Cát hay không | Level 4 | **Vượng** | hocvienlyso.org/sao-thien-luong-trong-tu-vi.html — MÂU THUẪN với Level 1 đã khóa |

Kết quả riêng cho Sửu (tham khảo, không phải mục tiêu Phase 13): `VERIFIED` (theo Level 1, đã khóa từ
Phase 8) — WEB-1 sai ở đây, làm giảm độ tin cậy WEB-1 nói chung, nhưng **KHÔNG được dùng kết quả Sửu để
suy ra Mùi** (2 ô riêng biệt, không có quy tắc bắt buộc chúng phải giống nhau về mặt dữ liệu thật, dù
`TuVi_Profile_NguyenCat_V1.md` trình bày 2 phương án gộp chung Sửu+Mùi).

### 5.2 Thiên Lương @ Mùi (ô mục tiêu thật sự của Phase 13)

| SOURCE_ID | Tác giả | Trường phái | Loại nguồn | Ngày/tài liệu | Giá trị status | Candidate/GM liên quan | Độc lập với GM? | Mức độ tin cậy |
|---|---|---|---|---|---|---|---|---|
| — | — | — | **Level 1: KHÔNG CÓ** | — | — | Không có GM nào trong 6 GM ghi Thiên Lương tại Mùi | — | — |
| NC-5 | Không nêu tên cụ thể | Nam Phái / Nguyên Cát | Level 4 | `TuVi_Profile_NguyenCat_V1.md` §3.12 | **CONFLICTED nội bộ nguồn** (Vượng hoặc Đắc, chính nguồn không chắc) | Candidate Target A | Có | Thấp (nguồn tự nhận không chắc) |
| WEB-1 | Dương Lương | Không xác định | Level 4 | hocvienlyso.org/sao-thien-luong-trong-tu-vi.html, 20/08/2022 | **Vượng** | Candidate Target A | Có | **Thấp** — cùng nguồn này đã cho giá trị SAI đã kiểm chứng được ở Sửu (mục 5.1), hạ thấp độ tin cậy cho Mùi |

### Kết quả: `INSUFFICIENT_EVIDENCE`

Khác với Ô 1-4 (đều có 1 giá trị Level 1 để đối lập), **Mùi hoàn toàn không có bằng chứng Level 1** — không
GM nào chạm tới. Nguồn duy nhất khả dụng (WEB-1) đã tự chứng minh kém tin cậy qua sai lệch ở Sửu. NC-5 tự
nhận không chắc chắn. Không đủ căn cứ để xếp CONFLICTED (cần ít nhất 2 nguồn đủ mạnh đối lập nhau) hay
VERIFIED — đúng nghĩa "chưa đủ bằng chứng", không phải "có bằng chứng nhưng mâu thuẫn".

---

## TỔNG KẾT

| Ô | Kết quả | Lý do ngắn gọn |
|---|---|---|
| Vũ Khúc @ Mão | `CONFLICTED` | Level 1 (Miếu) vs Level 4 chưa rõ độc lập (Đắc) |
| Thiên Cơ @ Ngọ | `CONFLICTED` | 3 giá trị (Bình/Đắc/Miếu), 1 giá trị nghi khác trường phái, mức bất định cao nhất |
| Thái Âm @ Dần | `CONFLICTED` | Level 1 (Miếu) vs nhiều Level 4/5 (Hãm), không đủ để bác Level 1 |
| Thất Sát @ Mùi | `CONFLICTED` | Level 1 (Bình) vs Level 4 chưa rõ độc lập (Đắc) |
| Thiên Lương @ Mùi | `INSUFFICIENT_EVIDENCE` | Không có Level 1 nào cho Mùi; nguồn Level 4 duy nhất đã mất tin cậy do sai ở Sửu |

**Không ô nào đạt `VERIFIED`.** Không có thay đổi nào được áp dụng vào `status table` — cả 5 ô giữ
nguyên `"Chưa xác định"` trong code, đúng theo yêu cầu không sửa calculation.
