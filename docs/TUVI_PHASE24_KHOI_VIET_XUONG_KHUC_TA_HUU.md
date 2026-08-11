# TUVI PHASE 24 — KHÔI VIỆT / XƯƠNG KHÚC / TẢ HỮU RULE AUDIT & LOCK

Audit + khóa rule cho Thiên Khôi, Thiên Việt, Văn Xương, Văn Khúc, Tả Phù, Hữu Bật. Không đụng Hỏa Tinh/
Linh Tinh/Địa Không/Địa Kiếp/Thiên Diêu/Thiên Y (giữ nguyên từ Phase 22/23). Không sửa Golden Master, 14
chính tinh, bảng Nguyên Cát. **Không commit/push.**

---

## BẢNG TỔNG HỢP

| Sao | Rule | Source | Implementation | GM | Evidence | Status | Action |
|---|---|---|---|---|---|---|---|
| Thiên Khôi | Theo Can năm, bảng nhóm Giáp/Mậu-Ất/Kỷ-Bính/Đinh-Canh/Tân-Nhâm/Quý | hoc.kabala.vn, "Sai lầm về an sao lập số" (Level 1 — cùng bài đã dùng cho Thiên Việt từ Phase 8) | **ĐÃ SỬA** — đổi từ bảng spec-literal (nhóm Giáp/Ất-Bính/Đinh-Mậu/Kỷ-Canh/Tân-Nhâm/Quý) sang bảng Nam Phái | 0/6 | Bảng khớp NGUYÊN VĂN nguồn, cùng nguồn đã xác nhận cho Thiên Việt | LOCKED | Đã sửa xong |
| Thiên Việt | Theo Can năm, cùng bảng/nguồn với Thiên Khôi | hoc.kabala.vn, "Sai lầm về an sao lập số" (Level 1, đã dùng từ Phase 8) | Không đổi — Phase 24 chỉ củng cố thêm bằng chứng | 0/6 | Bảng khớp NGUYÊN VĂN nguồn (tìm độc lập ra đúng bài đã cite từ Phase 8) | SOURCE_SUPPORTED, GOLDEN_MASTER_VERIFIED=FALSE | Không đổi |
| Văn Xương | Khởi Tuất tại giờ Tý, đếm nghịch | hocvienlyso.org, "Tự học tử vi bài 14" (Level 1) | Không đổi | 0/6 | Khớp CHÍNH XÁC công thức hiện tại | SOURCE_SUPPORTED (nâng từ DERIVED) | Không đổi, chỉ nâng nhãn |
| Văn Khúc | Khởi Thìn tại giờ Tý, đếm thuận | hocvienlyso.org, "Tự học tử vi bài 14" (Level 1) | Không đổi | 0/6 | Khớp CHÍNH XÁC | SOURCE_SUPPORTED (nâng từ DERIVED) | Không đổi, chỉ nâng nhãn |
| Tả Phù | Khởi Thìn tại tháng 1, đếm thuận | hocvienlyso.org, "Tự học tử vi đẩu số bài 13" (Level 1) | Không đổi | 0/6 | Khớp CHÍNH XÁC | SOURCE_SUPPORTED (nâng từ DERIVED) | Không đổi, chỉ nâng nhãn |
| Hữu Bật | Khởi Tuất tại tháng 1, đếm nghịch | hocvienlyso.org, "Tự học tử vi đẩu số bài 13" (Level 1) | Không đổi | 0/6 | Khớp CHÍNH XÁC | SOURCE_SUPPORTED (nâng từ DERIVED) | Không đổi, chỉ nâng nhãn |

---

## 1. Thiên Khôi — PHÁT HIỆN QUAN TRỌNG, ĐÃ SỬA

**Nguồn**: fetch trực tiếp `hoc.kabala.vn/sai-lam-ve-an-sao-lap-so/` (cùng bài đã dùng cho Thiên Việt từ
Phase 8) cho đoạn Khôi Việt:

> "Bộ Khôi Việt an theo hàng Can của năm sinh": Giáp/Mậu→Khôi Sửu/Việt Mùi; Ất/Kỷ→Khôi Tý/Việt Thân;
> Bính/Đinh→Khôi Hợi/Việt Dậu; Canh/Tân→Khôi Ngọ/Việt Dần; Nhâm/Quý→Khôi Mão/Việt Tỵ.

**Đối chiếu Thiên Việt trong bảng này với `THIEN_VIET_TABLE` hiện tại**: khớp **NGUYÊN VĂN 100%** cho cả
10 Can (Giáp/Mậu:Mùi, Ất/Kỷ:Thân, Bính/Đinh:Dậu, Canh/Tân:Dần, Nhâm/Quý:Tỵ) — đây là bằng chứng mạnh xác
nhận bài viết tìm được ĐÚNG LÀ nguồn Nam Phái đã chọn cho project (không còn chỉ là "nghi trùng tiêu đề"
như Phase 22/23, mà là xác nhận qua nội dung khớp tuyệt đối).

**Nhưng Thiên Khôi trong cùng bảng này KHÁC hoàn toàn** với `THIEN_KHOI_TABLE` cũ (vốn lấy từ
`TuVi_Engine_V2.md` §19, nhóm Can Giáp/Ất-Bính/Đinh-Mậu/Kỷ-Canh/Tân-Nhâm/Quý — một nhóm Can hoàn toàn khác
kiểu Giáp/Mậu-Ất/Kỷ-Bính/Đinh-Canh/Tân-Nhâm/Quý của nguồn Nam Phái). Đây chính là **"rủi ro 2 nguồn khác
nhau cho Khôi vs Việt"** đã được ghi nhận từ Phase 1 và nhắc lại nhiều lần (Phase 8, 18A) nhưng chưa từng
giải quyết vì "người dùng chỉ định cập nhật Thiên Việt, không đề cập Thiên Khôi".

**Quyết định Phase 24**: theo đúng mục X ("Chỉ sửa code nếu: 1. source Nam Phái đã đủ rõ, 2. implementation
hiện tại khác source, 3. không có conflict chưa giải quyết") — cả 3 điều kiện đều thỏa: nguồn rõ (bảng cụ
thể, cùng nguồn đã dùng cho Thiên Việt), code cũ khác nguồn (nhóm Can khác hẳn), không có nguồn nào khác
mâu thuẫn với bảng Nam Phái này cho Thiên Khôi. **Đã sửa `THIEN_KHOI_TABLE`** sang đúng bảng Nam Phái.

Không phụ thuộc giới tính (nguồn xác nhận rõ).

---

## 2. Thiên Việt — TÁI XÁC NHẬN, KHÔNG ĐỔI

Không đổi giá trị bảng. Phase 24 chỉ củng cố thêm 1 lớp bằng chứng độc lập: tìm lại đúng bài "Sai lầm về
an sao lập số" từ đầu (không dựa vào trích dẫn cũ trong `TuVi_Profile_NguyenCat_V1.md`), đối chiếu ra
khớp nguyên văn 100%. Giữ nguyên **SOURCE_SUPPORTED, GOLDEN_MASTER_VERIFIED=FALSE** — không có Golden
Master nào (0/6) ghi vị trí Thiên Việt. Không quay lại `Thiên Việt = Thiên Khôi + 6`. Không suy luận đối
xứng.

---

## 3. Văn Xương / Văn Khúc — XÁC NHẬN NGUỒN, KHÔNG ĐỔI CODE

**Nguồn**: `hocvienlyso.org/tu-hoc-tu-vi-bai-14-cac-sao-theo-gio-sinh.html` (Level 1, chính domain):

> "Văn Xương: Bắt đầu từ cung Tuất, kể là giờ Tý, đếm theo chiều nghịch, đến giờ sinh."
> "Văn Khúc: Bắt đầu từ cung Thìn, kể là giờ Tý, đếm theo chiều thuận, đến giờ sinh."
> [nguồn tự đối chiếu] "...khác với các sao khác như Hỏa tinh và Linh tinh, những sao đó có quy tắc thay
> đổi tùy theo nam/nữ (dương/âm)."

Khớp **CHÍNH XÁC** `vanXuongIndex = mod12(10 - hourChiIndex)` và `vanKhucIndex = mod12(4 + hourChiIndex)`
hiện tại — đã kiểm đủ 12/12 giá trị giờ sinh (mục 9). Nguồn tự xác nhận KHÔNG phụ thuộc giới tính, và còn
chủ động đối chiếu với Hỏa Tinh/Linh Tinh để làm rõ điểm khác biệt — củng cố thêm độ tin cậy cho phát hiện
SCHOOL_CONFLICT của Hỏa/Linh ở Phase 22/23 (cùng 1 nguồn family, phân biệt rõ nhóm nào phụ thuộc giới
tính, nhóm nào không).

**Theo mục X**: "Nếu source rõ nhưng code đúng: KHÔNG sửa code chỉ để refactor" — không đổi công thức,
chỉ nâng nhãn DERIVED → SOURCE_SUPPORTED trong comment.

---

## 4. Tả Phù / Hữu Bật — XÁC NHẬN NGUỒN, KHÔNG ĐỔI CODE

**Nguồn**: `hocvienlyso.org/tu-hoc-tu-vi-dau-bai-13-cac-sao-theo-thang-sinh.html` (Level 1):

> "Tả Phụ: Bắt đầu từ cung Thìn, kể là tháng Giêng, đếm theo chiều thuận, đến tháng sinh."
> "Hữu Bật: Bắt đầu từ cung Tuất, kể là tháng Giêng, đếm theo chiều nghịch, đến tháng sinh."

Khớp **CHÍNH XÁC** `taPhuIndex = mod12(4 + (lunarMonth-1))` và `huuBatIndex = mod12(10 - (lunarMonth-1))`
hiện tại — đã kiểm đủ 12/12 tháng sinh (mục 9). Nguồn không đề cập giới tính. Không sửa công thức, chỉ
nâng nhãn.

**Không suy luận Tả Phù/Hữu Bật từ Văn Xương/Văn Khúc hay ngược lại** — dù 4 công thức có cấu trúc tương
tự (khởi Thìn/Tuất, thuận/nghịch), mỗi cặp được audit và xác nhận ĐỘC LẬP từ 2 bài nguồn riêng biệt (bài
12/13 cho Tả Hữu theo tháng, bài 14 cho Xương Khúc theo giờ) — không giả định.

---

## 5. Tứ Hóa trên nhóm sao (Văn Xương/Văn Khúc/Tả Phù/Hữu Bật)

Không sửa logic Tứ Hóa. Test hiện có (`tu-vi-tu-hoa-full.test.ts`, từ Phase 2.2/18B) đã kiểm đủ 10/10 Can,
xác nhận cả 4 sao này nhận đúng nhãn Tứ Hóa khi Can năm sinh rơi vào chúng (5/10 Can: Bính→Văn Xương=Khoa,
Tân→Văn Xương=Kỵ, Kỷ→Văn Khúc=Kỵ, Tân→Văn Khúc=Khoa, Mậu→Hữu Bật=Khoa, Nhâm→Tả Phù=Khoa) — chạy lại PASS
nguyên vẹn sau khi sửa `THIEN_KHOI_TABLE` (không liên quan, không ảnh hưởng). Renderer vẫn hiển thị đúng
nhãn Tứ Hóa cho phụ tinh (fix từ Phase 18B) — không bị mất behavior.

---

## 6. Golden Master coverage (GM-001 → GM-006)

| Sao | GM-001 | GM-002 | GM-003 | GM-004 | GM-005 | GM-006 |
|---|---|---|---|---|---|---|
| Thiên Khôi | NO | NO | NO | NO | NO | NO |
| Thiên Việt | NO | NO | NO | NO | NO | NO |
| Văn Xương | NO | NO | NO | NO | NO | NO |
| Văn Khúc | NO | NO | NO | NO | NO | NO |
| Tả Phù | NO | NO | NO | NO | NO | NO |
| Hữu Bật | NO | NO | NO | NO | NO | NO |

Đã rà lại toàn bộ `TuVi_Golden_Master_Pack_V1.md` — phần "Principal stars" của cả 6 GM chỉ liệt kê 14
chính tinh, không một GM nào ghi vị trí phụ tinh. **Không có sao nào trong nhóm này được gọi VERIFIED chỉ
vì engine tự nhất quán** — toàn bộ 6 sao dừng ở mức SOURCE_SUPPORTED cao nhất (Thiên Khôi/Việt/Xương/Khúc/
Tả Phù/Hữu Bật), không có GM để nâng lên GOLDEN_MASTER_VERIFIED.

---

## 7. Implementation changes

`src/lib/tu-vi/rules.ts`:
1. **`THIEN_KHOI_TABLE`** — đổi giá trị (10 Can, nhóm lại theo Giáp/Mậu-Ất/Kỷ-Bính/Đinh-Canh/Tân-Nhâm/Quý).
2. Comment `THIEN_VIET_TABLE`, `taPhuIndex`/`huuBatIndex`, `vanKhucIndex`/`vanXuongIndex` — cập nhật nhãn
   nguồn (SOURCE_SUPPORTED, trích dẫn cụ thể), không đổi công thức các hàm này.

`tests/tu-vi-thien-viet.test.ts`:
- Cập nhật `EXPECTED_KHOI` sang bảng mới — đây là **THAY ĐỔI RULE THẬT** (nguồn Nam Phái xác nhận khác spec
  cũ), không phải sửa expected để né fail, cùng nguyên tắc đã áp dụng ở Phase 8 (it.fails→it) và Phase 16
  (khóa lại status table).
- Đơn giản hóa lại test Thiên Việt (bỏ so sánh "khác Khôi+6 cho từng Can" vì không còn ý nghĩa do 2/10 Can
  nay tình cờ trùng — vẫn giữ assertion tổng thể "không phải TẤT CẢ đều trùng").

`tests/tu-vi-phase24-khoi-viet-xuong-khuc-ta-huu.test.ts` — **MỚI**: test matrix đủ 12 Chi (Văn Xương/Văn
Khúc) + đủ 12 tháng (Tả Phù/Hữu Bật) + ghi nhận GM coverage.

**Không đổi**: `engine.ts` (không cần sửa gì — chỉ dùng lại `getThienKhoi()`/`getThienViet()` như cũ),
`lap-la-so-tu-vi.astro`, Golden Master, 14 chính tinh, bảng Nguyên Cát, Kình Dương/Đà La (Phase 23), Hỏa
Tinh/Linh Tinh/Địa Không/Địa Kiếp/Thiên Diêu/Thiên Y (giữ nguyên theo đúng chỉ thị).

---

## 8. Tests

```
npx vitest run
```

```
Test Files  20 passed (20)
     Tests  629 passed | 5 expected fail (634)
```

Trước Phase 24: 576 pass + 5 expected-fail (581). Sau: 629 pass + 5 expected-fail (634) — **+53 test mới**
(10 Thiên Khôi cập nhật giá trị + test file mới 43 test: 12+1 Văn Xương, 12+1 Văn Khúc, 12+1 Tả Phù, 12+1
Hữu Bật, 1 GM coverage). Đã xác minh trực tiếp trên browser (GM-001, Canh Thân): Thiên Khôi hiển thị đúng
tại Ngọ (cung Quan Lộc) — khớp bảng mới, toàn bộ phần còn lại của lá số (Mệnh, 14 chính tinh, Chủ Mệnh/
Thân, Tứ Hóa) không đổi.

**0 unexpected failure.** 5 expected-fail giữ nguyên y hệt (không liên quan nhóm sao này).

---

## 9. Golden Master impact

Không có GM nào ghi Thiên Khôi/Việt/Xương/Khúc/Tả Hữu — thay đổi `THIEN_KHOI_TABLE` không ảnh hưởng bất kỳ
assertion GM nào. Đã chạy lại `tu-vi-golden.test.ts` + `tu-vi-golden-gm002-006.test.ts` — pass nguyên vẹn.

---

## 10. Remaining uncertainties

| Vấn đề | Trạng thái |
|---|---|
| Thiên Khôi/Việt/Xương/Khúc/Tả Hữu — chưa có Golden Master ảnh thật xác nhận | NEED_GOLDEN_MASTER_REVIEW cho việc nâng lên GOLDEN_MASTER_VERIFIED (vẫn ở SOURCE_SUPPORTED) |
| hoc.kabala.vn có phải bản mirror chính xác 100% của bài Học Viện Lý Số gốc hay không | Đối chiếu nội dung Khôi/Việt khớp tuyệt đối — độ tin cậy cao, nhưng chưa từng thấy bản gốc trên chính domain hocvienlyso.org để so khớp từng chữ |

---

## FINAL REGRESSION — kiểm tra kiến trúc (mục XI)

Xác nhận KHÔNG thay đổi: Mệnh, Thân, 12 cung, Cục, 14 chính tinh, status Nguyên Cát, Tứ Hóa core, Đại Vận,
4 trụ Can Chi, Kình Dương/Đà La — tất cả các test cũ liên quan (GM-001→006, Phase 20, Phase 21, Phase 23)
chạy lại PASS nguyên vẹn, không assertion nào bị ảnh hưởng bởi thay đổi `THIEN_KHOI_TABLE`.

## FINAL CHECK

```
[x] Không đụng Hỏa Tinh
[x] Không đụng Linh Tinh
[x] Không đụng Địa Không
[x] Không đụng Địa Kiếp
[x] Không đụng Thiên Diêu
[x] Không đụng Thiên Y
[x] Không quay lại Khôi + 6 cho Thiên Việt
[x] Không trộn trường phái
[x] Không sửa Golden Master
[x] Không sửa Nguyên Cát status table
[x] Không làm mất Tứ Hóa phụ tinh
[x] Không có structural regression
[x] Không có unexpected failure
```

**KHÔNG COMMIT/PUSH.**
