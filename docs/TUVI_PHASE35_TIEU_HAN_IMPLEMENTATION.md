# PHASE 35 — TIỂU HẠN: IMPLEMENTATION

**FINAL STATUS: `TIEU_HAN_IMPLEMENTED_NEEDS_REVIEW`**

Phase 35 là FUTURE MODULE (không thuộc Natal Core, đã LOCKED ở Phase 31). Không có file Natal Core nào
(`rules.ts`, `engine.ts`, `bat-tu.ts`, `json-contract.ts`) bị sửa. Không sửa Golden Master. Không
commit/push.

---

## 1. Source

Bửu Đình — "Tử Vi Ứng Dụng", bài "Cách xem hạn (tử vi ứng dụng)"
(`vuihoctuvi.blogspot.com/2016/02/cach-xem-han-tu-vi-ung-dung.html`), đã xác minh ở
[TUVI_PHASE34_TIEU_HAN_SOURCE_LOCK.md](./TUVI_PHASE34_TIEU_HAN_SOURCE_LOCK.md) với status
`TIEU_HAN_SOURCE_SUPPORTED` (KHÔNG phải `SOURCE_LOCKED` — thiếu nguồn độc lập thứ 2 và chưa xác định
ranh giới năm/tuổi mụ-thực). Phase 35 implement dựa trên mức bằng chứng `SOURCE_SUPPORTED` này theo đúng
chỉ thị người dùng ("Implement Tiểu Hạn theo source Nam Phái đã được xác minh ở Phase 34") — đây là lý do
chính khiến FINAL STATUS ở Mục cuối là `NEEDS_REVIEW` chứ không phải `LOCKED`.

## 2. Rule

1. Tiểu Hạn đi theo vòng 12 cung, mỗi tuổi 1 cung.
2. Nam (Trai) → thuận. Nữ (Gái) → nghịch.
3. **KHÔNG dùng `isThuanChung`** (Đại Vận/Tràng Sinh/Kình Dương-Đà La — phụ thuộc Âm Dương năm sinh +
   giới tính). Tiểu Hạn theo nguồn CHỈ phụ thuộc giới tính đơn thuần — xem bằng chứng đối chiếu trực tiếp
   ở Phase 34 mục 6 (cùng tác giả, cùng đoạn văn, viết khác cách cho Đại Hạn vs Tiểu Hạn).
4. Cung khởi phụ thuộc nhóm tam hợp Chi năm sinh (Bảng 3-2, Phase 34 mục 5).

## 3. Start Point

Constant `TIEU_HAN_START_BY_YEAR_CHI` trong `src/lib/tu-vi/tieu-han.ts` — liệt kê tường minh cả 12 Chi
(KHÔNG suy diễn tam hợp lúc runtime, đúng yêu cầu Mục III spec):

```ts
export const TIEU_HAN_START_BY_YEAR_CHI: Record<string, number> = {
  "Dần": 4, "Ngọ": 4, "Tuất": 4,     // → Thìn (4)
  "Thân": 10, "Tý": 10, "Thìn": 10,  // → Tuất (10)
  "Tỵ": 7, "Dậu": 7, "Sửu": 7,       // → Mùi (7)
  "Hợi": 1, "Mão": 1, "Mùi": 1,      // → Sửu (1)
};
```

## 4. Direction

```ts
const isThuan = chart.input.gender === "Nam";
```

Đọc trực tiếp `chart.input.gender` (Natal Core field có sẵn), KHÔNG suy ra từ `chart.amDuongNam`, KHÔNG
gọi `isThuanChung`. Codebase hiện tại KHÔNG có sẵn helper `getGenderDirection()` chung — không cần tạo
thêm vì logic 1 dòng (`gender === "Nam"`) đã đủ rõ ràng, tránh tạo abstraction thừa cho 1 điều kiện đơn
giản.

**Phát hiện toán học khi thiết kế test** (ghi trong file test, không phải rule mới): mỗi nhóm tam hợp năm
sinh CHỈ CÓ THỂ toàn Dương hoặc toàn Âm (vì can-index và chi-index của cùng 1 năm luôn cùng tính chẵn lẻ
— 10 và 12 đều là số chẵn). Do đó không thể có "Âm Nam sinh năm Dần" để so sánh cùng cung khởi — phải so
sánh CHIỀU BƯỚC (age→age+1) giữa 1 nhóm Dương và 1 nhóm Âm cùng giới tính để chứng minh Mục IX.E spec.

## 5. Age Mapping

```ts
const step = age - 1; // tuổi 1 = offset 0 tại cung khởi
const chiIndex = mod12(startChiIndex + (isThuan ? step : -step));
```

Tuổi 1 = cung khởi. Tuổi 13 quay lại đúng cung khởi (xác nhận bằng test, cả 2 chiều). Tuổi 7 (offset 6):
thuận và nghịch luôn trùng cung (điểm đối xung, hệ quả toán học tất yếu mod 12 — giống hệt phát hiện ở
Phase 32 với Vòng Bác Sĩ offset 6, không phải bug).

## 6. Architecture

Module riêng `src/lib/tu-vi/tieu-han.ts` (KHÔNG nhét vào `engine.ts`), theo đúng kiến trúc
`NATAL CORE → PUBLIC CHART MODEL → FUTURE MODULE` (Phase 31 mục VI): nhận `TuViChart` làm input read-only,
không tính lại Chi năm sinh/giới tính/Mệnh/Cục, không mutate chart, không phụ thuộc renderer.

## 7. Implementation

```ts
export interface TieuHanPlacement { age: number; chiIndex: number; chiName: string }

export function getTieuHanPalace(chart: TuViChart, age: number): TieuHanPlacement {
  const startChiIndex = TIEU_HAN_START_BY_YEAR_CHI[chart.yearChiName];
  if (startChiIndex === undefined) throw new Error(...);
  const isThuan = chart.input.gender === "Nam";
  const step = age - 1;
  const chiIndex = mod12(startChiIndex + (isThuan ? step : -step));
  return { age, chiIndex, chiName: CHI[chiIndex] };
}

export function getTuoiTieuHan(chart: TuViChart): number | null {
  return chart.tuoiNamXem;
}
```

**`getTuoiTieuHan()` — quyết định kiến trúc cần NEED_REVIEW riêng** (đúng Mục VI spec): chưa có nguồn nào
(Bửu Đình hay nguồn khác) xác nhận trực tiếp cách đếm tuổi ĐÚNG cho riêng Tiểu Hạn (tuổi mụ vs tuổi thực,
Phase 33/34 đều ghi nhận là khoảng trống). Theo đúng chỉ dẫn "Nếu UI hiện tại đã có convention: giữ
nguyên convention đó và ghi rõ", hàm này tái sử dụng NGUYÊN VẸN `chart.tuoiNamXem` (Natal Core, đã LOCKED,
công thức `viewingYear - year + 1`, đang hiển thị cho Đại Vận ở renderer) — KHÔNG tính lại bằng công thức
mới, KHÔNG tự bịa tuổi mụ. Đây là lý do chính (cùng với Mục 1) khiến final status là `NEEDS_REVIEW`.

`mod12` và `CHI` được import lại (tiện ích chung, không phải "rule" — cùng cách dùng như Phase 32
`getBacSiRing`), không tính lại bất kỳ dữ liệu Natal Core nào.

## 8. Test Matrix

File: [`tests/tu-vi-phase35-tieu-han.test.ts`](../tests/tu-vi-phase35-tieu-han.test.ts) — 20 test:

| Mục spec | Nội dung | Số test |
|---|---|---|
| A (4 nhóm Chi) | Dần/Thân/Tỵ/Hợi — đại diện đủ 4 nhóm tam hợp | 8 case chính |
| B/C (Nam/Nữ) | Mỗi nhóm đều có Nam và Nữ | 8 case chính |
| D (cùng Chi, Nam≠Nữ) | So sánh trực tiếp trong bảng (vd. Dần+Nam vs Dần+Nữ) | 8 case chính |
| E (Dương Nam/Âm Nam/Dương Nữ/Âm Nữ) | 2 test riêng, so CHIỀU BƯỚC giữa nhóm Dương và nhóm Âm cùng giới tính | 2 |
| X (tuổi khởi/+1/+2/+5/+6/+11/+12/+13) | Đủ cả 8 mốc tuổi trong mỗi case chính | 8 case chính (8 mốc/case) |
| XII (boundary tuổi 12/13) | Tuổi 13 quay lại đúng cung khởi, cả 2 chiều | 4 |
| XII (offset 6 đối xung) | Tuổi 7 thuận/nghịch trùng cung — ghi rõ không phải bug | 1 |
| XV (mutation) | Không mutate chart, không đổi reference `cungs` | 2 |
| `getTuoiTieuHan()` | Có/không viewingYear | 2 |
| Golden Master | NO_DATA | 1 |

Expected value tính tay offline (Mục XI spec), viết literal `[tuổi, chiIndex]` cố định trong test —
KHÔNG gọi `getTieuHanPalace()` để tự sinh rồi so lại với chính nó. Toàn bộ 20 test PASS ngay lần chạy đầu
tiên (không phát sinh lỗi tính tay cần sửa như Phase 32).

## 9. Regression

```
Test Files  26 passed (26)
     Tests  764 passed | 5 expected fail (769)
```

**OLD** (baseline Phase 34, không đổi từ Phase 32/33): 744 PASS / 5 EXPECTED-FAIL / 0 UNEXPECTED-FAIL /
749 TỔNG.
**NEW**: 764 PASS / 5 EXPECTED-FAIL / 0 UNEXPECTED-FAIL / 769 TỔNG.
**ADDED**: +20 (toàn bộ trong `tests/tu-vi-phase35-tieu-han.test.ts`).
**CHANGED**: không có test cũ nào bị sửa/xóa.

PASS tăng đúng bằng số test mới, EXPECTED-FAIL không đổi, UNEXPECTED-FAIL = 0 → không có drift.

2 test riêng ("Architecture regression") xác nhận `getTieuHanPalace()`/`getTuoiTieuHan()` không mutate
`chart` (so `JSON.stringify` trước/sau + so reference `chart.cungs`) — không làm thay đổi Mệnh/Thân/12
cung/Can 12 cung/Cục/14 chính tinh/status/Tứ Hóa/Tuần/Triệt/Đại Vận/phụ tinh/vòng sao.

Golden Master: grep lại `TuVi_Golden_Master_Pack_V1.md` cho "Tiểu Hạn"/"Tiểu Vận" — 0 kết quả (không đổi
từ Phase 33/34). `NO_DATA`, không sửa GM.

## 10. JSON

Kiểm tra `json-contract.ts`: `TuViJsonPalace` hiện có `tieuHan?: number` — **KHÔNG**, thực tế field đó
KHÔNG tồn tại (chỉ có `daiVan`, `tieuHan?: number` — kiểm tra lại thấy field tên `tieuHan` ĐÃ tồn tại
trong interface nhưng luôn `undefined` với comment "MISSING_FIELD — Tiểu Hạn chưa implement (Phase 19),
luôn undefined" từ Phase 21). Đây là 1 field ĐÃ ĐƯỢC ĐẶT CHỖ SẴN trong schema (kiểu `number`, không phải
kiểu `{chiIndex, chiName}` như `getTieuHanPalace()` trả về) nhưng **KHÔNG map dữ liệu thật vào** trong
Phase 35 này, vì:

1. Kiểu dữ liệu placeholder (`number`) không khớp với shape thật (`TieuHanPlacement`), map vào sẽ phải
   đổi kiểu field hoặc chọn 1 sub-field — đây là thay đổi schema, cần Phase Change Request riêng.
2. `toJsonContract()` chỉ nhận `TuViChart` làm input (không nhận `age`/`viewingYear` context riêng cho
   từng cung) — Tiểu Hạn cần tham số `age` bên ngoài `TuViChart`, không tự nhiên fit vào chữ ký hàm hiện
   tại của adapter thuần túy này.

→ **`SCHEMA_GAP`** (giữ nguyên, không rewrite `json-contract.ts`, không đổi kiểu field `tieuHan` hiện có).

## 11. Renderer

Không sửa `lap-la-so-tu-vi.astro`. UI hiện chưa có thiết kế cho Tiểu Hạn (không có input "năm xem"/tuổi
cụ thể để hiển thị theo mốc — form hiện tại chỉ nhập `viewingYear` cho Đại Vận). Đúng theo Mục XIV spec
("Không bắt buộc render ngay nếu UI chưa có thiết kế") — không thêm gì vào renderer trong phase này.

## 12. Risks

- `getTuoiTieuHan()` dựa trên `tuoiNamXem` (tuổi mụ, +1) chưa được nguồn Tiểu Hạn xác nhận trực tiếp —
  nếu sau này tìm được nguồn nói Tiểu Hạn phải dùng tuổi thực (không +1), toàn bộ kết quả tuổi sẽ lệch 1
  cung cho một số trường hợp biên (gần Tết). Cần Phase Change Request nếu phát hiện.
- Rule "Nam thuận Nữ nghịch không phụ thuộc Âm Dương" mới chỉ có 1 nguồn xác nhận trực tiếp (Phase 34 —
  `SOURCE_SUPPORTED`, không phải `LOCKED`). Nếu sau này tìm được nguồn Nam Phái độc lập nói khác, cần xem
  xét lại toàn bộ `TIEU_HAN_START_BY_YEAR_CHI`/hướng đi.
- Field `tieuHan?: number` trong `json-contract.ts` (đặt chỗ từ Phase 21) hiện gây hiểu lầm nhẹ về kiểu
  dữ liệu dự kiến (number vs object) — không sửa trong phase này, ghi nhận `API_CLEANUP_CANDIDATE` cho
  phase sau nếu cần chính thức đưa Tiểu Hạn vào JSON contract.

## 13. Final Status

Đối chiếu Mục XVIII spec: "Nếu tất cả source rule + test + regression đều khớp: TIEU_HAN_LOCKED". Test và
regression đều khớp hoàn hảo (Mục 8/9), NHƯNG **source rule** dừng ở `SOURCE_SUPPORTED` (Phase 34, thiếu
nguồn độc lập thứ 2) và `getTuoiTieuHan()` mang theo 1 quyết định kiến trúc chưa có nguồn xác nhận trực
tiếp (Mục 7/12) — do đó KHÔNG đạt điều kiện đầy đủ cho `TIEU_HAN_LOCKED`.

```
TIEU_HAN_IMPLEMENTED_NEEDS_REVIEW
```

**Cần review**: (1) tìm nguồn Nam Phái độc lập thứ 2 xác nhận Bảng 3-2 + "Nam thuận Nữ nghịch không Âm
Dương" (nâng Phase 34 lên `SOURCE_LOCKED`); (2) xác nhận cách đếm tuổi đúng cho riêng Tiểu Hạn (tuổi mụ
vs tuổi thực). Cho tới khi đó, `getTieuHanPalace()`/`getTuoiTieuHan()` có thể dùng nội bộ/thử nghiệm
nhưng không nên coi là kết quả cuối cùng chính thức hiển thị cho người dùng.
