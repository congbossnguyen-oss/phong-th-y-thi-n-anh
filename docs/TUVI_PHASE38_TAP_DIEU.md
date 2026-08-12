# PHASE 38 — BỔ SUNG TẠP DIỆU (Batch 1 + Batch 2 + hiển thị UI)

**Cập nhật**: Anh xác nhận muốn tiếp tục nghiên cứu nốt phần còn thiếu VÀ đưa các sao đã có lên UI. Đã
làm cả 2: Batch 2 tìm thêm 10 sao (đủ nguồn) + phát hiện 1 xung đột nguồn thật (Lưu Hà) + đã đưa 32 sao
(11 Batch 1 còn hiệu lực + 10 Batch 2 + 11 Vòng Tướng Tinh) lên giao diện `/lap-la-so-tu-vi`.

**Bối cảnh**: Anh cung cấp 1 lá số mẫu xuất từ chính hocvienlyso.org (nguồn Nguyên Cát, Level 1
project-canonical xuyên suốt 37 phase trước) cho thấy lá số hiện tại của dự án còn thiếu rất nhiều "Tạp
Diệu" (sao phụ cố định, khác Lưu Niên) so với 1 lá số Nguyên Cát đầy đủ. Anh xác nhận muốn bổ sung.

**FINAL STATUS (Batch 1): 12 sao đơn + Vòng Tướng Tinh (11 sao) = 23 sao mới — `SOURCE_SUPPORTED`,
implement xong, **CHƯA hiển thị UI** (chờ xác nhận thêm, giống Vòng Bác Sĩ/Tiểu Hạn).**

Không sửa Natal Core, không sửa Golden Master, không sửa rule đã LOCKED. File mới hoàn toàn:
`src/lib/tu-vi/tap-dieu.ts`.

---

## 1. Nguồn

- **Level 1**: hocvienlyso.org — "Tự học Tử vi đẩu số bài 12: An các sao theo chi năm sinh"
  (`tu-hoc-tu-vi-sao-theo-chi-nam-sinh.html`) — đọc trực tiếp HTML gốc qua `curl`, không qua tóm tắt AI.
- **Level 2** (tác giả nêu tên — **Thiên Lương**, cùng tác giả đã dùng làm nguồn Thiên Mã ở Phase 29):
  hocvienlyso.org — "Lưu Hà Kiếp Sát, Thiên Mã, Không Kiếp, Kình Đà, Linh Hỏa, Phá Toái, Cô Quả, Khốc Hư"
  (`luu-ha-kiep-sat-thien-ma-khong-kiep-kinh-da-linh-hoa-pha-toai-co-qua-khoc-hu.html`), ghi rõ cuối bài
  "(Tử vi nghiệm lý – tác giả Thiên Lương)".
- **Aggregate, chỉ dùng khi có cross-check trực tiếp khớp với Level 1/2**: kết quả tổng hợp "Vòng Tướng
  Tinh" (thứ tự 12 sao + điểm khởi theo 4 nhóm tam hợp) — KHÔNG dùng riêng lẻ, chỉ chấp nhận sau khi khớp
  100% với 2 nguồn Level 1/2 ở trên (xem Mục 4).

## 2. Nguyên văn trích dẫn

**Bài 12 (Level 1)**:
> "Long Trì − Bắt đầu từ cung Thìn, kể là năm Tý, đếm theo chiều thuận đến năm sinh, ngừng lại ở cung
> nào an Long Trì ở cung đó."
> "Phượng Các − Bắt đầu từ cung Tuất, kể là năm Tý, đếm theo chiều nghịch, đến năm sinh..."
> "Thiên Khốc: Bắt đầu từ cung Ngọ... đếm theo chiều nghịch... Thiên Hư: Bắt đầu từ cung Ngọ... đếm theo
> chiều thuận... (Chú ý: Thiên Hư bao giờ cũng đồng cung với Tuế Phá)."
> "Thiên Đức: Bắt đầu từ Dậu... đếm theo chiều thuận... Nguyệt Đức: Bắt đầu từ cung Tỵ... đếm theo chiều
> thuận..."
> "Thiên Tài: Bắt đầu từ cung an Mệnh... đếm theo chiều thuận... Thiên Thọ: Bắt đầu từ cung an Thân...
> đếm theo chiều thuận..."
> "Thí dụ: Sinh năm Hợi, an Cô Thần ở cung Dần, Quả Tú ở cung Tuất." — "Sinh năm Dậu, an Đào Hoa ở cung
> Ngọ." — "Sinh năm Tý, an Thiên Mã ở cung Dần." — "Sinh năm Mùi, an Kiếp sát ở cung Thân" — "Sinh năm
> Ngọ, an Hoa Cái ở cung Tuất." — "Sinh năm Tuất, an Phá Toái ở cung Sửu."

**Thiên Lương (Level 2)**:
> "Lưu Hà là sao Thủy an theo hàng Can của tuổi luôn luôn ở nghịch địa âm dương như: Tuổi Giáp (dương)
> thì Lưu Hà đóng ở Dậu... Quý (âm) thì Lưu Hà đóng ở Dần." (đủ 10 Can)
> "Tuổi Dần Ngọ Tuất (Dương) thì Kiếp Sát an ở Hợi (Âm) — Thân Tý Thìn (Dương) → Tỵ (Âm) — Tỵ Dậu Sửu
> (Âm) → Dần (Dương) — Hợi Mão Mùi (Âm) → Thân (Dương)."
> "Phá Toái... vị trí đóng cũng rất hạn chế là ba chỗ Tỵ Dậu Sửu" + đối chiếu 3 nhóm Vũ Phá(Tý Ngọ Mão
> Dậu)/Liêm Phá(Dần Thân Tỵ Hợi)/Tử Phá(Thìn Tuất Sửu Mùi) → suy ra Tỵ/Dậu/Sửu tương ứng.
> "Cô Thần luôn đóng ở 4 cung Dần Thân Tỵ Hợi, Quả Tú chỉ ở Thìn Tuất Sửu Mùi... 3 tuổi Dần Mão Thìn, Cô
> Thần ở Tỵ (đầu) – Quả Tú ở Sửu (đuôi); 3 tuổi Tỵ Ngọ Mùi, Cô Thần ở Thân (đầu), Quả Tú ở Thìn (đuôi)."

## 3. Cross-check nội bộ (không suy diễn — mọi công thức mới đều đối chiếu được với dữ liệu đã LOCKED sẵn)

| Sao mới | Đối chiếu với | Kết quả |
|---|---|---|
| Thiên Hư | Tuế Phá (vòng Thái Tuế đã LOCKED, `mod12(yearChiIndex+6)`) | Công thức Thiên Hư trùng chính xác — "đồng cung" đúng như nguồn mô tả, ở MỌI Chi (12/12), không chỉ 1 ví dụ |
| Kiếp Sát (qua Vòng Tướng Tinh) | Trích dẫn trực tiếp Thiên Lương (4 nhóm) | Khớp 4/4 nhóm chính xác |
| Hoa Cái (qua Vòng Tướng Tinh) | Ví dụ Bài 12 "Ngọ→Hoa Cái Tuất" | Khớp |
| Đào Hoa (offset 9 trong Vòng Tướng Tinh) | `DAO_HOA_START` đã LOCKED sẵn trong Natal Core | Khớp 4/4 nhóm (9,3,6,0) — **đây là bằng chứng mạnh nhất**: Vòng Tướng Tinh không phải suy diễn mới mà tái hiện đúng dữ liệu đã kiểm chứng độc lập từ trước |
| Cô Thần/Quả Tú | Ví dụ Bài 12 "Hợi→Cô Thần Dần/Quả Tú Tuất" | Khớp |
| Phá Toái | Ví dụ Bài 12 "Tuất→Phá Toái Sửu" | Khớp |

Nhờ các cross-check này, dù "Vòng Tướng Tinh" (tên gọi + thứ tự 12 sao) ban đầu chỉ có ở nguồn tổng hợp,
việc khớp chính xác 100% ở tất cả các điểm đối chiếu độc lập từ Level 1/2 (không có bất kỳ sai lệch nào)
đủ cơ sở nâng lên `SOURCE_SUPPORTED` cho toàn bộ vòng — không phải suy diễn mù, mà là suy luận có kiểm
chứng chặt.

## 4. Danh sách 23 sao mới

| Sao | Công thức | Nguồn |
|---|---|---|
| Long Trì | khởi Thìn(4), thuận | Level 1 |
| Phượng Các | khởi Tuất(10), nghịch | Level 1 |
| Thiên Khốc | khởi Ngọ(6), nghịch | Level 1 |
| Thiên Hư | khởi Ngọ(6), thuận | Level 1 + cross-check Tuế Phá |
| Thiên Đức | khởi Dậu(9), thuận | Level 1 |
| Nguyệt Đức | khởi Tỵ(5), thuận | Level 1 |
| Thiên Tài | khởi cung Mệnh, thuận | Level 1 |
| Thiên Thọ | khởi cung Thân, thuận | Level 1 |
| Cô Thần | bảng theo nhóm 3 Chi | Level 2 (Thiên Lương) + ví dụ Level 1 |
| Quả Tú | bảng theo nhóm 3 Chi | Level 2 + ví dụ Level 1 |
| Lưu Hà | bảng theo Can (10 Can) | Level 2 (Thiên Lương) |
| Phá Toái | bảng theo nhóm Tứ Chính/Sinh/Mộ | Level 2 + ví dụ Level 1 |
| Tướng Tinh, Phan Án, Tuế Dịch, Tức Thần, Hoa Cái, Kiếp Sát, Tai Sát, Thiên Sát, Chỉ Bối, Nguyệt Sát, Vong Thần (11 sao) | Vòng Tướng Tinh, khởi theo tam hợp, thuận | Aggregate + cross-check Level 1/2 khớp 100% (Mục 3) |

**Đào Hoa**: KHÔNG tính lại — đã có sẵn trong Natal Core (LOCKED), Vòng Tướng Tinh chỉ dùng để cross-check
rồi lọc bỏ khi xuất kết quả (`getTuongTinhRing()` filter `!== "Đào Hoa"`).

## 5. Kiến trúc

File mới `src/lib/tu-vi/tap-dieu.ts` — đúng khuôn mẫu Future Module đã dùng cho Vòng Bác Sĩ/Tiểu Hạn
(Phase 32/35): đọc `TuViChart` read-only, không import lại logic Natal Core (chỉ dùng `mod12`, `CHI` —
tiện ích chung), không mutate chart, không sửa `engine.ts`/`rules.ts`.

```ts
export function getTapDieu(chart: TuViChart): TapDieuPlacement[]
```

trả về mảng phẳng 23 phần tử `{chiIndex, name}`.

## 6. Test

`tests/tu-vi-phase38-tap-dieu.test.ts` — 55 test, PASS ngay lần chạy đầu (không phát sinh lỗi tính tay
cần sửa):
- 6 sao công thức thuần túy × đủ 12 Chi (72 điểm dữ liệu) + 1 test cross-check Tuế Phá riêng.
- Thiên Tài/Thiên Thọ qua 3 lá số thực tế.
- Cô Thần/Quả Tú, Lưu Hà, Phá Toái: bảng đầy đủ (12+10+12 điểm).
- Vòng Tướng Tinh: đủ 4 nhóm × 11 sao + test riêng cross-check Kiếp Sát.
- `getTapDieu()` qua 4 lá số thực tế: đủ 23 sao, không NaN/undefined, không trùng Đào Hoa.
- Architecture regression: không mutate chart, không đổi reference `chart.cungs`.

## 7. Regression

```
OLD (Phase 37/Final Product): 764 PASS / 5 EXPECTED-FAIL / 0 UNEXPECTED-FAIL / 769 TỔNG
NEW: 819 PASS / 5 EXPECTED-FAIL / 0 UNEXPECTED-FAIL / 824 TỔNG
ADDED: +55 (toàn bộ tests/tu-vi-phase38-tap-dieu.test.ts)
```

Không có test cũ nào bị sửa/xóa. `tsc --noEmit`: 0 lỗi liên quan Tử Vi.

## 8. Batch 2 — 10 sao mới tìm được nguồn

Tìm thêm được qua 2 bài "Tự học tử vi đẩu số" khác của hocvienlyso.org (Level 1) — **bài 10** (An các sao
hàng Can) và **bài 15** (An các bộ sao khác) — cả 2 đều tự cross-check khớp với dữ liệu đã LOCKED sẵn
(bảng Tứ Hóa Nam Phái, bảng khởi Trường Sinh theo Cục) nên độ tin cậy cao:

| Sao | Công thức | Nguồn |
|---|---|---|
| Thiên Không | khởi ngay trước Thái Tuế: `mod12(yearChiIndex+1)` | Level 1 (bài 15) |
| Thiên Giải | khởi Thân(8), theo tháng sinh, thuận | Level 1 (bài 13) |
| Địa Giải | khởi Mùi(7), theo tháng sinh, thuận | Level 1 (bài 13) |
| Giải Thần | = vị trí Phượng Các (tái dùng, không tính lại) | Level 1 (bài 13) |
| Thiên La | luôn tại Thìn (cố định) | Level 1 (bài 15) |
| Địa Võng | luôn tại Tuất (cố định) | Level 1 (bài 15) |
| Thiên Sứ | luôn tại cung Tật Ách (đọc read-only từ chart) | Level 1 (bài 15) |
| Thiên Thương | luôn tại cung Nô Bộc (đọc read-only từ chart) | Level 1 (bài 15) |
| Quốc Ấn | khởi Lộc Tồn, đếm thuận đến cung thứ 9 (`+8`) | Level 1 (bài 10) |
| Đường Phù | khởi Lộc Tồn, đếm nghịch đến cung thứ 8 (`-7`) | Level 1 (bài 10) |

Bài 13 xác nhận lại ĐÚNG công thức Tả Phù/Hữu Bật/Thiên Hình/Thiên Diêu đã LOCKED sẵn (khởi Thìn/Tuất/
Dậu/Sửu theo tháng) — cross-check nguồn đáng tin cậy thêm 1 lần nữa.

## 9. Phát hiện xung đột nguồn thật: Lưu Hà — `CONFLICTED`, đã loại khỏi output chính thức

Khi tra thêm bài 10 để tìm Quốc Ấn/Đường Phù, tình cờ thấy bài này CŨNG có ví dụ cho Lưu Hà: "Sinh năm
Đinh Mão, an Lưu Hà ở cung Thìn" (Thìn=4). Nhưng nguồn Thiên Lương (đã dùng ở Batch 1) cho đúng Can Đinh:
"Lưu Hà đóng ở Thân" (Thân=8). **Đây là 2 giá trị khác nhau cho CÙNG 1 Can, từ 2 nguồn Level 1/2 khác
nhau, cùng thuộc hocvienlyso.org.**

Theo đúng nguyên tắc "không suy diễn, không tự chọn bên, không majority vote" đã áp dụng xuyên suốt toàn
bộ dự án: **KHÔNG sửa bảng để ép khớp, KHÔNG chọn 1 trong 2 giá trị.** Đã:
- Đổi tên export `LUU_HA_BY_CAN` → `LUU_HA_BY_CAN_THIEN_LUONG_UNCONFIRMED` (giữ nguyên bảng cũ để tham
  khảo, đánh dấu rõ chưa xác nhận).
- **Loại "Lưu Hà" khỏi `getTapDieu()`** — không hiển thị trên UI cho tới khi có nguồn thứ 3 phân giải.
- Test riêng xác nhận `getTapDieu()` không chứa "Lưu Hà".

## 10. Còn thiếu (chưa đủ nguồn, để dành cho batch sau nếu cần)

- **Tam Thai / Bát Tọa** — cảnh báo trực tiếp "nhiều sách viết khác nhau" (lyso.vn). `NEED_SOURCE`.
- **Ân Quang / Thiên Quý** — có nguồn nhưng công thức chưa đủ rõ để khóa. `NEED_SOURCE`.
- **Thiên Quan, Thiên Phúc** — đã đọc trực tiếp Level 1 (bài 10) nhưng chỉ có 2/10 Can đủ dữ liệu rõ ràng
  (Giáp: Quan=Mùi/Phúc=Dậu; Bính: Quan=Tỵ/Phúc=Tý — từ ví dụ trực tiếp), còn lại (Ất/Đinh/Tân/Quý) chỉ
  biết CẶP vị trí (tam hợp/nhị hợp) mà không biết sao nào ở vị trí nào, Mậu/Canh/Kỷ/Nhâm hoàn toàn chưa
  có dữ liệu. `NEED_SOURCE` — không đủ để tránh suy diễn 8/10 Can.
- **Thai Phụ, Phong Cáo** — trang chuyên đề chỉ có luận giải, không có công thức an sao. `NEED_SOURCE`.
- **Âm Sát** — chưa tìm được nguồn trực tiếp. `NEED_SOURCE`.
- Trạng thái Miếu/Vượng/Đắc/Hãm cho phụ tinh — ngoài phạm vi hoàn toàn, cần audit nguồn riêng biệt.

## 11. UI — đã wire

Đã thêm vào `src/pages/lap-la-so-tu-vi.astro`:
- Import `getTapDieu` (read-only, không mutate `chart.cungs`/`chart.cungs[].phuTinh`).
- `buildExportCardHtml()` nhóm 32 sao theo cung, truyền vào `cellHtml()` làm tham số riêng — render thành
  1 dòng mới trong mỗi ô (font 7px, có viền chấm phân cách với phụ tinh chính để phân biệt cấp độ, không
  gắn Tứ Hóa vì Tạp Diệu không thuộc phạm vi Tứ Hóa đã LOCKED).
- **`CARD_HEIGHT` tăng từ 1000 → 1320px** để đủ chỗ — đã xác minh bằng `scrollHeight` vs `clientHeight`
  qua browser thật: **0/12 ô bị tràn/cắt nội dung** sau khi tăng.
- Đã test qua UI thật (dev server sạch): card hiển thị đủ text, không "undefined"/"NaN", không lỗi.
  Xuất PNG vẫn gặp lại đúng vấn đề môi trường đã ghi nhận ở "Final Product Phase" trước đó (thư viện
  `html-to-image` treo trong môi trường test hiện tại, không liên quan tới thay đổi lần này) — cơ chế
  timeout 15s + thông báo lỗi thân thiện đã xây từ trước hoạt động đúng, người dùng không bị treo vô thời
  hạn.

Chưa đụng `json-contract.ts` (`SCHEMA_GAP`, giữ nguyên như Vòng Bác Sĩ/Tiểu Hạn).

## 12. Test & Regression (sau cả Batch 1 + 2)

```
tests/tu-vi-phase38-tap-dieu.test.ts: 102 test, PASS 100%
OLD (trước Phase 38): 764 PASS / 5 EXPECTED-FAIL / 769 TỔNG
NEW: 866 PASS / 5 EXPECTED-FAIL / 871 TỔNG
ADDED: +102, không sửa/xóa test cũ nào
```

## Final Status

```
TAP_DIEU_BATCH1_2_SOURCE_SUPPORTED — 32 sao hiển thị UI (11+10+11), 1 sao CONFLICTED bị loại (Lưu Hà),
5 nhóm sao còn NEED_SOURCE (Tam Thai/Bát Tọa, Ân Quang/Thiên Quý, Thiên Quan/Thiên Phúc, Thai Phụ/Phong
Cáo, Âm Sát). Chưa commit/push.
```
