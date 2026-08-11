# TUVI PHASE 16 — LOCK & IMPLEMENT NGUYÊN CÁT STATUS TABLE

**Không commit/push** (theo đúng yêu cầu). Toàn bộ thay đổi dưới đây nằm trong working tree, chưa đưa lên
git.

---

## 1. File/code đã thay đổi

| File | Thay đổi |
|---|---|
| [src/lib/tu-vi/rules.ts](../src/lib/tu-vi/rules.ts) | Thay 5 giá trị `"Chưa xác định"` trong `MAIN_STAR_STATUS` bằng giá trị Nguyên Cát (Vũ Khúc@Mão, Thiên Cơ@Ngọ, Thái Âm@Dần, Thất Sát@Mùi, Thiên Lương@Mùi → Đắc/Đắc/Hãm/Đắc/Đắc). Thêm hàm `getStarStatus(star, chiIndex)` tra thẳng bảng, ném lỗi `RULE_NOT_DEFINED` nếu star/chiIndex ngoài phạm vi thay vì suy luận. Type `TrangThaiSao` giữ nguyên (không xóa `"Chưa xác định"` khỏi type vì vẫn hợp lệ về mặt kiểu, chỉ không còn giá trị nào trong bảng dùng nó). **159/164 ô còn lại của bảng KHÔNG đổi giá trị** — đã là Nguyên Cát từ Phase 8. |
| [tests/tu-vi-phase16-nguyen-cat-status.test.ts](../tests/tu-vi-phase16-nguyen-cat-status.test.ts) | **MỚI** — 168 assertion `getStarStatus(star, branch) === expected` (14×12) + 8 test bảo vệ cấu trúc (đủ 14 sao, đủ 168 entries, không undefined, không còn "Chưa xác định", chỉ 5 giá trị hợp lệ, lỗi rõ ràng khi tra ngoài bảng, xác nhận riêng 5 ô Phase 8→16). |
| [tests/tu-vi-phase8-locked-rules.test.ts](../tests/tu-vi-phase8-locked-rules.test.ts) | Sửa đúng 1 `describe` block (7 test): 6 assertion trước đây kiểm tra 5 ô = `"Chưa xác định"` nay kiểm tra đúng giá trị Nguyên Cát mới; test tổng số ô unresolved đổi từ `toBe(5)` → `toBe(0)`. **Đây là cập nhật vì RULE đã đổi thật (theo chỉ thị Phase 16), không phải sửa expected để né fail** — cùng nguyên tắc đã áp dụng khi chuyển `it.fails()`→`it()` ở Phase 8. Không xóa file, không xóa test nào, không đổi bất kỳ assertion nào khác trong file (Thiên Việt, GM regression giữ nguyên 100%). |

**Không đổi**: `src/lib/tu-vi/engine.ts` (0 dòng thay đổi — công thức an sao, vị trí 12 cung, Mệnh/Thân/Cục/Tứ Hóa/Đại Vận/Mệnh Quái/Chủ Mệnh/Chủ Thân/phụ tinh/lịch âm dương/day boundary không đụng tới), `src/pages/lap-la-so-tu-vi.astro` (0 dòng thay đổi — renderer/UI không đụng tới, tự động hiển thị đúng vì đọc thẳng `MAIN_STAR_STATUS` qua engine).

---

## 2. Bảng status trước và sau

Toàn bộ 168 ô **giống hệt nhau** ngoại trừ đúng 5 ô sau (đây cũng là 5 ô duy nhất Phase 8 từng để `"Chưa xác định"`):

| Sao @ Cung | Trước (Phase 8→15) | Sau (Phase 16) |
|---|---|---|
| Vũ Khúc @ Mão | Chưa xác định | **Đắc** |
| Thiên Cơ @ Ngọ | Chưa xác định | **Đắc** |
| Thái Âm @ Dần | Chưa xác định | **Hãm** |
| Thất Sát @ Mùi | Chưa xác định | **Đắc** |
| Thiên Lương @ Mùi | Chưa xác định | **Đắc** |

159/164 ô còn lại: không đổi (đã lấy đúng Nguyên Cát từ Phase 8, chỉ đổi Ý NGHĨA — trước là "91,9% khớp GM, chờ thêm bằng chứng cho 5 ô", nay là "168/168 dùng Nguyên Cát làm nguồn chính thức duy nhất, không chờ GM nữa" theo đúng chỉ thị Phase 16 §"KHÔNG dùng Golden Master để suy ngược hoặc thay đổi status table").

Bảng đầy đủ 14×12 hiện tại — xem trực tiếp `MAIN_STAR_STATUS` trong [rules.ts](../src/lib/tu-vi/rules.ts) (đã đối chiếu khớp 100% với bảng chuẩn user cung cấp trong yêu cầu Phase 16, xác nhận bằng 168 test assertion ở mục 3).

---

## 3. 168/168 status assertions

```
npx vitest run tests/tu-vi-phase16-nguyen-cat-status.test.ts
```

Kết quả: **176/176 test pass** trong file này (168 assertion tra bảng + 8 test bảo vệ cấu trúc). Không có assertion nào fail, không có assertion nào bị skip.

---

## 4. Số test pass/fail (toàn bộ suite)

```
npx vitest run
```

```
Test Files  15 passed (15)
     Tests  442 passed | 5 expected fail (447)
```

So với trước Phase 16 (271 total = 266 pass + 5 expected-fail): **+176 test mới** (168 assertion Phase 16 + 8 guard), tổng khớp đúng 271+176=447. Số lượng test trong `tu-vi-phase8-locked-rules.test.ts` không đổi (chỉ sửa nội dung 6 assertion đã có, không thêm/bớt test nào trong file đó).

---

## 5. Test fail do Golden Master conflict

**5 test `it.fails()` giữ nguyên, KHÔNG đổi** (đúng như trước Phase 16, không liên quan tới status table — đây là conflict về VỊ TRÍ sao, không phải trạng thái Miếu/Vượng/Đắc/Bình/Hãm):

| Test | Golden Master | Lý do fail (đã biết từ trước, không phải do Phase 16) |
|---|---|---|
| GM-003: vị trí Thiên Lương | GM-003 | Vị trí sao, không liên quan status table |
| GM-005: vị trí Tham Lang | GM-005 | Vị trí sao |
| GM-005: vị trí Thất Sát | GM-005 | Vị trí sao |
| GM-006: vị trí Vũ Khúc + Phá Quân | GM-006 | Vị trí sao |
| GM-006: Tuần Không | GM-006 | Phụ tinh, không liên quan status table |

**Golden Master conflict về STATUS (không làm test nào fail, vì không có test cứng nào assert giá trị GM cũ cho các ô này)** — nhưng cần ghi nhận công khai theo đúng yêu cầu "không xóa Golden Master conflict":

| Sao @ Cung | GM ghi | Nguyên Cát (đang dùng) | Trạng thái |
|---|---|---|---|
| Vũ Khúc @ Mão | GM-003: Miếu | Đắc | CONFLICTED, đã chọn Nguyên Cát theo chỉ thị Phase 16 |
| Thiên Cơ @ Ngọ | GM-003: Bình | Đắc | CONFLICTED, đã chọn Nguyên Cát theo chỉ thị Phase 16 |
| Thái Âm @ Dần | GM-006: Miếu | Hãm | CONFLICTED, đã chọn Nguyên Cát theo chỉ thị Phase 16 |
| Thất Sát @ Mùi | GM-006: Bình | Đắc | CONFLICTED, đã chọn Nguyên Cát theo chỉ thị Phase 16 |
| Thiên Lương @ Mùi | Không có GM nào chạm Mùi | Đắc | Không conflict (không có GM để so) |

**GM-003/GM-005/GM-006 KHÔNG bị sửa** — dữ liệu gốc trong `TuVi_Golden_Master_Pack_V1.md` (file ngoài repo, do người dùng cung cấp) không đụng tới, chỉ engine không còn dùng chúng làm nguồn cho 5 ô status này nữa (đây là quyết định rule tường minh của Phase 16, không phải xóa/sửa bằng chứng).

---

## 6. Xác nhận không có structural regression

Chạy lại toàn bộ 12 test file KHÔNG liên quan status table (Mệnh/Thân/Cục/12 cung/vị trí sao/Tứ Hóa/Đại Vận/Mệnh Quái/Chủ Mệnh/Chủ Thân/phụ tinh) — **tất cả pass, không có gì đổi**:

- `tests/tu-vi-golden.test.ts` — pass (GM-001 full chart, kể cả vị trí 14 chính tinh, 12 cung, Cục, Mệnh Quái)
- `tests/tu-vi-golden-gm002-006.test.ts` — pass (trừ 5 `it.fails()` đã biết từ trước, không đổi)
- `tests/tu-vi-menh-quai-boundary.test.ts` — pass
- `tests/tu-vi-palace-stem.test.ts` — pass
- `tests/tu-vi-thien-viet.test.ts` — pass
- `tests/tu-vi-tu-hoa-full.test.ts` — pass
- `tests/tu-vi-phase8-locked-rules.test.ts` — pass, kể cả 2 describe block GM regression (`GM-001 Chủ Mệnh/Chủ Thân`, `GM-003 Chủ Mệnh/Chủ Thân`) không đổi 1 dòng
- `tests/tu-vi-position-status-separation.test.ts` (Phase 9) — pass, **đặc biệt quan trọng**: file này tồn tại chính để chứng minh thay đổi status table KHÔNG rò rỉ sang vị trí sao/tên cung/Mệnh/Thân/Cục/Đại Vận/Tứ Hóa — pass nghĩa là Phase 16 không gây structural regression theo đúng cơ chế bảo vệ đã dựng từ Phase 9.

**Kết luận: KHÔNG có structural regression.**

---

## 7. Xác nhận không sửa Golden Master

Không có thao tác ghi/sửa nào lên `TuVi_Golden_Master_Pack_V1.md` hay bất kỳ test nào assert cứng giá trị GM-003/GM-005/GM-006 bị đổi để né fail. 5 `it.fails()` giữ nguyên y hệt nội dung trước Phase 16.

---

## 8. Xác nhận không thay đổi công thức an sao

`git diff` (working tree, chưa commit) trên `src/lib/tu-vi/engine.ts` = rỗng (0 thay đổi). Toàn bộ vị trí Tử Vi/Thiên Phủ/12 chính tinh, offset vòng sao, công thức Cục/Mệnh/Thân/Đại Vận/Tứ Hóa/Mệnh Quái/Chủ Mệnh/Chủ Thân/phụ tinh/lịch âm dương/day boundary không đụng tới — xác nhận thêm qua mục 6 (Phase 9 regression file pass 100%).

---

## 9. Xác nhận UI không bị thay đổi ngoài status hiển thị

`git diff` trên `src/pages/lap-la-so-tu-vi.astro` = rỗng (0 thay đổi). Đã xác minh trực tiếp trên trình duyệt (dev server, candidate GM-SOURCE-B: 25/06/1955, giờ Mão, Nam):

- **Mệnh (Kỷ Mão): Vũ Khúc (Đ) — Thất Sát (H)** → hiển thị đúng "(Đ)" cho Vũ Khúc@Mão, khớp bảng mới.
- **Điền Trạch (Nhâm Ngọ): Thiên Cơ (Đ)** → hiển thị đúng "(Đ)" cho Thiên Cơ@Ngọ, khớp bảng mới.
- Không còn ký hiệu "(?)" (trước đây dùng cho `"Chưa xác định"`) ở bất kỳ đâu trên lá số.
- Không có hiện tượng đè chữ/overlap — layout 12 cung, phụ tinh, Tứ Hóa, Đại Vận hiển thị bình thường như trước.
- Chủ Mệnh/Chủ Thân của candidate này vẫn hiển thị "Chưa xác định (cần thêm dữ liệu)" — đúng, vì đây là phạm vi khác (Chủ Mệnh/Chủ Thân theo Chi năm sinh, KHÔNG thuộc phạm vi Phase 16 chỉ xử lý status 14 chính tinh).

---

## KẾT LUẬN

- 168/168 status table assertions: **PASS**
- Toàn bộ test suite: **442 pass + 5 expected-fail (đã phân loại, không liên quan status) = 447, không có unexpected failure**
- Structural regression: **KHÔNG CÓ**
- Golden Master: **KHÔNG bị sửa** — 4 điểm conflict được ghi nhận công khai ở mục 5, đã chọn dùng Nguyên Cát theo đúng chỉ thị Phase 16, không che giấu
- Công thức an sao: **KHÔNG đổi** (engine.ts 0 thay đổi)
- UI: **KHÔNG đổi code**, chỉ hiển thị đúng giá trị status mới do đọc thẳng từ bảng đã cập nhật — đã xác minh trực tiếp trên browser

**PHASE 16 COMPLETE. Không commit/push.**
