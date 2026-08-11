# TUVI PHASE 20 — INTEGRATE FOUR PILLARS INTO TU VI ENGINE

Integration task: bổ sung output đủ 4 trụ Can Chi (năm/tháng/ngày/giờ) vào `tinhTuVi()`, tái sử dụng
NGUYÊN VẸN `tinhBatTu()` (`src/lib/bat-tu.ts`) — không viết thuật toán Can Chi thứ hai. **Không commit/push.**

---

## 1. API bat-tu.ts đã tái sử dụng

Đọc toàn bộ `src/lib/bat-tu.ts` (632 dòng) trước khi sửa. Hàm dùng: **`tinhBatTu(input: BatTuInput): BatTuChart`**
(export sẵn, không sửa 1 dòng nào trong file này).

| Trụ | Field trong `BatTuChart` | Input dùng | Thuật toán |
|---|---|---|---|
| Năm | `year: PillarInfo` | `year` (dương lịch) | 60 Giáp Tý theo `batTuYear` (đã trừ 1 nếu chưa qua Lập Xuân) |
| Tháng | `month: PillarInfo` | `day, month, year, hourFrac` | Chi tháng theo TIẾT KHÍ (`getMonthChiIndex`), Can tháng theo Ngũ Hổ Độn từ Can năm |
| Ngày | `day: PillarInfo` | `day, month, year, hour` | Julian Day liên tục, cộng 1 ngày nếu `hour >= 23` |
| Giờ | `hour: PillarInfo` | `hour` + Can ngày | Chi giờ = `floor(((hour+1)%24)/2)`; Can giờ = Ngũ Thử Độn từ Can ngày |

`PillarInfo` có sẵn `canIndex, chiIndex, can, chi` (đúng yêu cầu "tối thiểu stem/branch/stemIndex/branchIndex").

**Input mapping**: `BatTuInput = {day, month, year, hour, minute?, gender}` — khớp 1:1 với `TuViInput`
(`day, month, year, hour, gender, viewingYear?`), chỉ khác `viewingYear` (không ảnh hưởng Can Chi, không
truyền qua). Không có timezone/longitude riêng — cả `tinhTuVi()` và `tinhBatTu()` đều ngầm định giờ địa
phương Việt Nam (GMT+7), giống nhau, không có khác biệt input cần xử lý.

**So sánh day boundary với `tinhTuVi()` hiện tại**: `gioChiIndex` trong `engine.ts`
(`floor((((hour+1)%24)+24)%24/2)`) và `hourChiIndex` trong `bat-tu.ts` (`floor(((hour+1)%24)/2)`) là
**CÙNG MỘT CÔNG THỨC** (chỉ khác 1 lớp `%24+24` thừa nhưng vô hại toán học) — đã xác nhận bằng test khớp
100% trên cả 6 GM (mục 5).

---

## 2. Adapter/integration đã thêm

`src/lib/tu-vi/engine.ts`:

1. Import `tinhBatTu`, `type PillarInfo` từ `../bat-tu` (thêm vào import đã có sẵn `khongVongIndicesOf`).
2. Thêm type `CanChiPillar = Pick<PillarInfo, "can" | "chi" | "canIndex" | "chiIndex">` — lát cắt tối
   giản, KHÔNG mang theo `tangCan/thapThan/truongSinh` (khái niệm riêng Bát Tự, ngoài phạm vi Tử Vi).
3. Hàm phụ trợ `pillarOf(p: PillarInfo): CanChiPillar` — thuần map field, không tính toán gì thêm.
4. Trong `tinhTuVi()`, ngay sau khi có `input`: gọi **1 lần duy nhất**
   `tinhBatTu({day, month, year, hour, gender})`, rồi `pillarOf()` cho cả 4 trụ.
5. Thêm 4 field vào `TuViChart`: `yearPillar, monthPillar, dayPillar, hourPillar` (kiểu `CanChiPillar`).

**Không có công thức Can Chi thứ hai được viết ra** — toàn bộ 4 trụ đến thẳng từ 1 lệnh gọi `tinhBatTu()`.

---

## 3. Output schema trước/sau

**Trước** (`TuViChart`): không có field Can Chi tháng/ngày/giờ-Can nào — chỉ có `yearCanName`,
`yearChiName` (string rời), `gioChiName` (chỉ Chi, không Can), `lunarMonth`/`lunarDay` (số, không phải
Can Chi).

**Sau**: bổ sung thêm, KHÔNG xóa/đổi bất kỳ field cũ nào:

```ts
yearPillar: { can: string; chi: string; canIndex: number; chiIndex: number };
monthPillar: { can: string; chi: string; canIndex: number; chiIndex: number };
dayPillar: { can: string; chi: string; canIndex: number; chiIndex: number };
hourPillar: { can: string; chi: string; canIndex: number; chiIndex: number };
```

`yearCanName`/`yearChiName`/`gioChiName`/`lunarMonth`/`lunarDay` **giữ nguyên, không đổi** — 2 nguồn dữ
liệu (field cũ tự tính trong `tinhTuVi()`, field mới từ `tinhBatTu()`) tồn tại song song, đã kiểm chứng
khớp nhau ở phần overlap (mục 5), không mâu thuẫn.

---

## 4. 4 pillar examples

GM-001 (Nam Canh Thân 31/08/1980 11:30):

```
yearPillar:  Canh Thân
monthPillar: Giáp Thân
dayPillar:   Bính Tý
hourPillar:  Giáp Ngọ
```

GM-006 (Nam 04/02/2026 02:30, sát ranh giới Lập Xuân):

```
yearPillar:  Ất Tỵ    (KHÔNG phải Bính Ngọ — đúng yêu cầu spec §4.3/§7 GM-006)
monthPillar: Kỷ Sửu
dayPillar:   Kỷ Dậu
hourPillar:  Ất Sửu
```

---

## 5. Day boundary behavior

Đã audit trước khi sửa (mục III của yêu cầu): chạy song song `tinhTuVi()` và `tinhBatTu()` cho cả 6 GM +
6 mốc năm biên (1800/1900/2000/2001/2021/2026) bằng script tạm (đã xóa sau khi lấy dữ liệu, không đưa vào
repo).

**Kết quả: KHÔNG phát hiện CALENDAR_PROFILE_CONFLICT.**

- `yearPillar` (can+chi) khớp **100%** với `yearCanName`/`yearChiName` hiện có trên cả 6 GM và 6 mốc năm
  biên — kể cả GM-006 (sát ranh giới Lập Xuân, 04/02/2026) và các năm 1800/1900/2000/2001/2021/2026.
- `hourPillar.chi` khớp **100%** với `gioChiName` hiện có trên cả 6 GM.
- `dayPillar` dùng đúng quy tắc **"sinh từ 23h thuộc ngày hôm sau"** (đổi ngày tại `hour >= 23`, không
  phải tại `hour >= 0` của giờ Tý) — đây LÀ hành vi hiện tại của `bat-tu.ts`, được giữ nguyên, không tự
  đổi. Test riêng xác nhận giờ 22h và 23h cho `dayPillar` khác nhau đúng theo hành vi này (mục 7).
- **Không đổi profile day boundary theo bất kỳ hướng nào** — kể cả khi Phase 11A/15 từng ghi nhận khả năng
  tuvinamphai.vn dùng quy ước khác (MIDNIGHT thay vì ZI_HOUR) cho 1 candidate ngoài phạm vi 6 GM chính
  thức, Phase 20 **không** dùng phát hiện đó để đổi bất cứ gì — giữ nguyên hành vi `bat-tu.ts`.

**Kết luận**: không cần ghi `CALENDAR_PROFILE_CONFLICT` vì `tinhTuVi()` trước Phase 20 CHƯA từng có field
Can Chi tháng/ngày/giờ-Can nào để so sánh/xung đột — phần OVERLAP DUY NHẤT (năm + Chi giờ) đã kiểm chứng
khớp tuyệt đối.

---

## 6. Solar-term/month behavior

`monthPillar` lấy Chi tháng qua `getMonthChiIndex()` (tiết khí thật, dò bằng kinh độ mặt trời — xem
`solar-term.ts`), KHÔNG dùng `lunarMonth` (số tháng âm lịch, vẫn giữ nguyên dùng riêng cho công thức an
Tử Vi/Thiên Phủ/Mệnh/Thân — KHÔNG đổi). Đây là 2 khái niệm khác nhau tồn tại song song có chủ đích, đúng
tinh thần "không dùng tháng âm lịch số học đơn giản nếu bat-tu.ts đang dùng tiết khí" của yêu cầu Phase 20
mục VII — `monthPillar` mới thêm ĐÃ dùng đúng tiết khí (kế thừa từ `bat-tu.ts`), còn `lunarMonth` cũ vẫn
giữ nguyên vai trò cũ (an sao), không bị thay thế.

**Test tại ranh giới tiết khí**: mục "Phase 20 — boundary tiết khí / năm âm lịch" trong test file xác nhận
GM-006 (nằm sát ranh giới Lập Xuân 2026) cho đúng `yearPillar = Ất Tỵ` ở cả `tinhTuVi()` lẫn gọi trực tiếp
`tinhBatTu()` — đây là ranh giới tiết khí NHẠY CẢM NHẤT có sẵn trong bộ Golden Master, và đã pass.

---

## 7. Boundary tests

File mới: `tests/tu-vi-phase20-four-pillars.test.ts` (34 test). Nguyên tắc: **không tự bịa expected value**
cho mốc chưa có nguồn — chỉ test (a) khớp field cũ đã VERIFIED qua GM, hoặc (b) format hợp lệ + nhất quán
với gọi `tinhBatTu()` trực tiếp.

| Nhóm | Số test | Nội dung |
|---|---|---|
| GM-001 → GM-006 | 6×4=24 | Mỗi GM: yearPillar khớp yearCanName/yearChiName, hourPillar.chi khớp gioChiName, 4 trụ format hợp lệ, nhất quán 100% với gọi `tinhBatTu()` trực tiếp |
| Boundary năm (1800/1900/2000/2001/2021/2026) | 6 | 4 trụ hợp lệ, yearPillar/hourPillar khớp field cũ |
| Boundary giờ Tý (22h vs 23h) | 2 | `dayPillar` đổi đúng theo hành vi hiện tại của `bat-tu.ts`, không tự đổi quy tắc |
| Boundary tiết khí/năm âm lịch (GM-006) | 1 | `yearPillar = Ất Tỵ`, khớp cả 2 module |
| Regression (GM-001) | 1 | Mệnh/Thân/Cục/Mệnh Quái/Chủ Mệnh/Chủ Thân/Tứ Hóa/status/Đại Vận không đổi |

Tất cả 34/34 PASS.

---

## 8. Regression tests

```
npx vitest run
```

```
Test Files  17 passed (17)
     Tests  491 passed | 5 expected fail (496)
```

- Trước Phase 20: 457 pass + 5 expected-fail (462 total).
- Sau Phase 20: 491 pass + 5 expected-fail (496 total) — **+34 test mới** (đúng bằng file mới, không
  đổi số test ở bất kỳ file nào khác).
- Unexpected failure: **0**.
- Structural regression: **KHÔNG có** — xác nhận qua test regression riêng (mục 7) VÀ toàn bộ 12 test
  file cũ (chính tinh/status/Mệnh/Thân/Cục/Tứ Hóa/Đại Vận/phụ tinh/Triệt) pass nguyên vẹn.
- Đã xác minh trực tiếp trên browser (candidate GM-001): lá số vẫn tính đúng, render đúng, không có lỗi
  console nào phát sinh sau khi thêm import `tinhBatTu` vào `engine.ts`.

---

## 9. JSON contract status

Phase 19 phát hiện `TuViChart` không khớp schema `calendar.{yearCanChi,monthCanChi,dayCanChi,hourCanChi}`
dạng string lồng trong object `calendar` riêng theo spec §36. Phase 20 **KHÔNG** cố ép 4 trụ mới vào đúng
shape lồng nhau đó — vì `TuViChart` hiện tại là 1 shape PHẲNG hoàn toàn (không có `meta`/`calendar`/
`thienBan` như spec), việc thêm 1 sub-object `calendar` riêng chỉ cho 4 trụ trong khi mọi field khác vẫn
phẳng sẽ tạo ra 1 kiểu shape THỨ 3 không nhất quán với chính nó.

**Quyết định**: thêm 4 field mới theo ĐÚNG convention hiện có của project (phẳng, dùng shape
`{can, chi, canIndex, chiIndex}` giống hệt `PillarInfo` rút gọn của `bat-tu.ts` và giống `CungKetQua` đã
dùng `canName/chiName` kiểu tương tự) — không tạo thêm 1 kiểu dữ liệu mới, không tự rewrite kiến trúc JSON.

**ARCHITECTURE_CHANGE_REQUIRED** (giữ nguyên từ Phase 19, chưa giải quyết trong Phase 20): nếu muốn
`TuViChart` khớp đúng 100% schema spec §36 (`meta`, nested `calendar`, nested `thienBan`,
`palaces[].palaceName` thay vì `cungName`...), đây là 1 thay đổi kiến trúc lớn ảnh hưởng TOÀN BỘ chart
shape (không riêng 4 trụ), cần 1 phase riêng có phạm vi rõ ràng — không tự mở rộng scope trong Phase 20.

---

## 10. Files changed

| File | Thay đổi |
|---|---|
| `src/lib/tu-vi/engine.ts` | Thêm import `tinhBatTu`/`type PillarInfo`; thêm type `CanChiPillar`; thêm hàm `pillarOf()`; gọi `tinhBatTu()` 1 lần trong `tinhTuVi()`; thêm 4 field `yearPillar/monthPillar/dayPillar/hourPillar` vào `TuViChart` và giá trị trả về. Không xóa/đổi field nào cũ, không đổi bất kỳ dòng logic tính Mệnh/Thân/Cục/14 chính tinh/Tứ Hóa/Đại Vận/phụ tinh nào. |
| `tests/tu-vi-phase20-four-pillars.test.ts` | **MỚI** — 34 test (mục 7). |
| `src/lib/bat-tu.ts` | **KHÔNG sửa** (đúng yêu cầu — chỉ đọc, tái sử dụng nguyên vẹn). |
| `src/lib/tu-vi/rules.ts` | **KHÔNG sửa**. |
| `src/pages/lap-la-so-tu-vi.astro` | **KHÔNG sửa** — 4 trụ mới chưa được hiển thị trên UI (ngoài phạm vi Phase 20, đây là integration ở tầng data, không phải renderer). |

---

## 11. Remaining risks

| Vấn đề | Trạng thái | Ghi chú |
|---|---|---|
| `monthPillar`/`dayPillar`/`hourPillar.can` chưa có Golden Master độc lập | NEED_GOLDEN_MASTER_REVIEW | Chỉ `yearPillar` và `hourPillar.chi` có bằng chứng GM gián tiếp (qua field cũ); phần còn lại mới chỉ "format hợp lệ + nhất quán nội bộ" |
| JSON contract vẫn CONFLICTED với spec §36 | ARCHITECTURE_CHANGE_REQUIRED | Không tự mở rộng scope trong phase này, cần chỉ thị riêng nếu muốn rewrite toàn bộ shape |
| 4 trụ mới chưa hiển thị trên UI | Ngoài phạm vi Phase 20 | Cần 1 chỉ thị renderer riêng nếu muốn hiển thị (giống cách Phase 18B xử lý Tứ Hóa trên phụ tinh) |
| `bat-tu.ts` được gọi thêm 1 lần mỗi lần `tinhTuVi()` chạy (chi phí tính toán tăng nhẹ) | Chấp nhận được | Không đo hiệu năng chi tiết trong phase này — cả 2 module đều là phép tính thuần túy (pure function), không I/O, không đáng kể ở quy mô 1 lá số/request |

---

## SAFETY CHECK

```
[x] Không tạo thuật toán Can Chi thứ hai — toàn bộ 4 trụ từ 1 lệnh gọi tinhBatTu()
[x] Tái sử dụng bat-tu.ts — không sửa file này
[x] 4 trụ đều có Can + Chi (can/chi/canIndex/chiIndex)
[x] Không mất field cũ — yearCanName/yearChiName/gioChiName/lunarMonth/lunarDay giữ nguyên
[x] Không đổi rule Tử Vi — Mệnh/Thân/Cục/12 cung/14 chính tinh/status/Tứ Hóa/Đại Vận/Chủ Mệnh/Chủ Thân/
    phụ tinh/Thiên Việt/Kình Dương/Đà La/Hỏa-Linh-Không-Kiếp không đổi 1 dòng
[x] Không đổi status Nguyên Cát
[x] Không đổi Golden Master
[x] Không đổi day boundary âm thầm — đã audit kỹ, giữ nguyên hành vi bat-tu.ts, có test riêng xác nhận
[x] Không có unexpected failure (491 pass + 5 expected-fail không đổi, +34 test mới)
[x] Không có structural regression (xác nhận qua test + browser)
[x] Không commit/push
```

## KẾT LUẬN

Chỉ integration + test. Không mở rộng sang phụ tinh mới. Không làm Tiểu Hạn/Lưu Niên. **KHÔNG COMMIT/PUSH.**
