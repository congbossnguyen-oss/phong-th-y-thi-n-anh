# PHASE 32 — VÒNG BÁC SĨ: SOURCE RESEARCH + IMPLEMENTATION

**FINAL STATUS: `BAC_SI_LOCKED`**

Phase 32 là **FUTURE MODULE** (không thuộc Natal Core, đã LOCKED ở Phase 31 —
[TUVI_NATAL_CORE_LOCK.md](./TUVI_NATAL_CORE_LOCK.md)). Không có bất kỳ file Natal Core nào
(`rules.ts`, `engine.ts`, `bat-tu.ts`, `json-contract.ts`) bị sửa trong phase này. Không sửa Golden
Master. Không commit/push.

---

## 1. Executive Summary

Tìm được nguồn Nam Phái Level 1 (hocvienlyso.org — cùng nguồn project đã dùng khóa Triệt/Tràng
Sinh/Thái Tuế các phase trước) xác nhận **đầy đủ cả 4 điều kiện bắt buộc** của Mục X spec Phase 32: 12
tên sao đúng thứ tự, điểm khởi (đồng cung Lộc Tồn), chiều đi (thuận/nghịch theo đúng quy tắc
`isThuanChung` đã có sẵn), và không phát hiện conflict với 2 nguồn cross-check độc lập khác. Do đó
**implement được**, không dừng ở audit.

Đã tạo module mới độc lập `src/lib/tu-vi/bac-si.ts` (`getBacSiRing(chart)`), đọc read-only từ
`TuViChart` (PUBLIC CHART MODEL), tái sử dụng nguyên vẹn vị trí Lộc Tồn đã có và quy tắc `isThuanChung`
đã có — không tính lại, không tạo logic thứ hai, không sửa bất kỳ file Natal Core nào.

## 2. Source Research

Câu hỏi bắt buộc (Mục IV spec) và kết quả:

| # | Câu hỏi | Kết quả |
|---|---|---|
| 1 | Vòng Bác Sĩ gồm chính xác bao nhiêu sao? | 12 sao |
| 2 | Tên chính xác từng sao? | Bác Sĩ, Lực Sĩ, Thanh Long, Tiểu Hao, Tướng Quân, Tấu Thư, Phi Liêm, Hỷ Thần, Bệnh Phù, Đại Hao, Phục Binh, Quan Phủ |
| 3 | Điểm khởi? | Đồng cung với Lộc Tồn (Bác Sĩ = offset 0) |
| 4 | Input dùng gì? | Vị trí Lộc Tồn đã tính (từ Can năm sinh, `LOC_TON_TABLE` đã LOCKED) |
| 5 | Khởi từ Lộc Tồn hay yếu tố khác? | Từ Lộc Tồn — nguồn nói rõ, không phải suy diễn |
| 6 | Chiều đi? | Thuận hoặc nghịch tùy Âm Dương Nam Nữ |
| 7 | Chiều phụ thuộc gì? | Âm/Dương năm sinh kết hợp Nam/Nữ — **giống hệt quy tắc Tràng Sinh đã LOCKED** (Dương Nam/Âm Nữ = thuận, Âm Nam/Dương Nữ = nghịch). Không phụ thuộc Can/Chi riêng lẻ, không phụ thuộc Cục. |
| 8 | Thứ tự đầy đủ của vòng? | Xem câu 2, đúng thứ tự tuần tự theo offset 0→11 |
| 9 | Có variant giữa các trường phái? | Không phát hiện — 3 nguồn độc lập kiểm tra đều khớp 100%, không có SOURCE_CONFLICT/SCHOOL_CONFLICT |
| 10 | Nam Phái project đang chọn variant nào? | Variant duy nhất tìm được, không phải chọn giữa nhiều variant |

## 3. Source Hierarchy

- **Level 1 (chính, dùng để LOCK)**: [hocvienlyso.org/vong-loc-ton.html](https://hocvienlyso.org/vong-loc-ton.html)
  — đọc trực tiếp HTML nguồn (curl, KHÔNG qua tóm tắt AI, tránh lặp lại lỗi "AI search summary tự mâu
  thuẫn" đã gặp ở Phase 26/27/29 với Thiên Mã). Nguyên văn trích tại Mục 5.
- **Cross-check độc lập, không dùng để LOCK riêng nhưng xác nhận KHÔNG có conflict**:
  - [thanglongdaoquan.vn/tim-hieu-ve-vong-loc-ton-trong-tu-vi](https://thanglongdaoquan.vn/tim-hieu-ve-vong-loc-ton-trong-tu-vi/)
    — khớp 100% cả 12 tên sao, cả bảng Can→vị trí Lộc Tồn (khớp chính xác `LOC_TON_TABLE` hiện có của
    project), cả điểm khởi "Bác Sĩ luôn đồng cung Lộc Tồn", cả chiều "Dương Nam, Âm Nữ theo chiều thuận
    còn Âm Nam, Dương Nữ theo chiều nghịch".
  - tuvicaimenh.com (qua kết quả tìm kiếm tổng hợp) — khớp 12 tên sao, khớp "Dương nam - Âm nữ an thuận;
    Âm nam - Dương nữ an nghịch", khớp "sao Bác Sĩ luôn đồng cung Lộc Tồn".
- **Không dùng nhiều site sao chép cùng 1 bài để giả lập nhiều nguồn độc lập**: 3 nguồn trên có cấu trúc
  HTML/domain khác nhau, không phải cùng 1 bài đăng lại — được coi là cross-check hợp lệ theo tinh thần
  Mục III spec (dù không loại trừ khả năng chúng có chung 1 tổ tiên xa hơn trong truyền thống Nam Phái,
  không có cách xác minh sâu hơn trong phạm vi phase này).

## 4. Rule Reconstruction

```
Bác Sĩ    = vị trí Lộc Tồn (offset 0)
Lực Sĩ    = offset 1
Thanh Long = offset 2
Tiểu Hao  = offset 3
Tướng Quân = offset 4
Tấu Thư   = offset 5
Phi Liêm  = offset 6
Hỷ Thần   = offset 7
Bệnh Phù  = offset 8
Đại Hao   = offset 9
Phục Binh = offset 10
Quan Phủ  = offset 11

hướng offset: +1/step nếu Dương Nam hoặc Âm Nữ (isThuanChung = true)
              -1/step nếu Âm Nam hoặc Dương Nữ (isThuanChung = false)
```

Không phải rule mới về mặt cấu trúc — đây CHÍNH XÁC là mẫu hình đã dùng cho Vòng Tràng Sinh (Phase 26) và
Đại Vận: 1 điểm khởi cố định theo 1 bảng tra cứu có sẵn (ở đây là Lộc Tồn, thay vì Tràng Sinh dùng Cục),
cộng 1 chuỗi 12 tên cố định, đi theo `isThuanChung`.

## 5. Nguyên văn nguồn (Mục V spec — bắt buộc ghi URL/title/author/level/nội dung/evidence)

**Nguồn**: hocvienlyso.org — bài "Vòng Lộc tồn" (`https://hocvienlyso.org/vong-loc-ton.html`)
**Author**: không ghi tên tác giả cá nhân trên trang (đặc điểm chung của các bài hocvienlyso.org đã dùng
xuyên suốt project).
**School**: Nam Phái (cùng site đã dùng làm nguồn Level 1 cho Triệt, Tràng Sinh, Thái Tuế, Tả Hữu, Xương
Khúc, Thiên Hình, Địa Không/Địa Kiếp các phase trước).
**Source level**: Level 1 (project-canonical, theo đúng phân cấp đã dùng từ Phase 15 trở đi).
**Evidence trực tiếp** (trích nguyên văn từ HTML gốc, đọc qua `curl`, KHÔNG qua tóm tắt AI):

> "Vòng Lộc tồn bao gồm 15 sao là Lộc tồn, Bác sĩ, Lực sĩ, Kình dương, Thanh long, Tiểu hao, Tướng quân,
> Tấu thư, Phi liêm, Hỷ thần, Bệnh phù, Đại hao, Phục binh, Quan phủ, Đà la."
>
> "Vòng Bác Sĩ cũng có tên gọi khác vòng Lộc Tồn vì Bác Sĩ đứng cùng một cung với Lộc Tồn, gồm mười hai
> sao mỗi sao an một cung trên lá số: Bác Sĩ, Lực Sĩ, Thanh Long, Tiểu Hao, Tướng Quân, Tấu Thư, Phi
> Liêm, Hỉ Thần, Bệnh Phù, Đại Hao, Phục Binh, Quan Phủ."
>
> "Vòng này an theo hai chiều thuận nghịch âm dương, cũng như vòng Tràng Sinh Tử Vi Việt an theo chiều
> thuận đối với Dương Nam Âm Nữ và nghịch đối với Âm Nam Dương Nữ."

**Common ancestor**: không xác định được — khác với trường hợp Thiên Việt/Kình-Đà/Thiên Khôi ở Phase
22/24 (nơi 3 bài hóa ra là CÙNG 1 bài "Sai lầm về an sao lập số"), 3 nguồn ở đây có nội dung/cấu trúc câu
khác nhau dù kết luận giống nhau — không có bằng chứng cụ thể để khẳng định/phủ nhận common ancestor.

## 6. 12-Star Table

| Offset | Tên sao | Ghi chú |
|---|---|---|
| 0 | Bác Sĩ | đồng cung Lộc Tồn |
| 1 | Lực Sĩ | |
| 2 | Thanh Long | |
| 3 | Tiểu Hao | 1 trong cặp Song Hao (với Đại Hao) |
| 4 | Tướng Quân | |
| 5 | Tấu Thư | |
| 6 | Phi Liêm | |
| 7 | Hỷ Thần | nguồn ghi "Hỉ Thần" — biến thể chính tả, project dùng "Hỷ Thần" cho thống nhất với "Thiên Hỷ" đã có sẵn trong engine |
| 8 | Bệnh Phù | |
| 9 | Đại Hao | 1 trong cặp Song Hao |
| 10 | Phục Binh | |
| 11 | Quan Phủ | |

Constant hóa tại `BAC_SI_RING` trong `src/lib/tu-vi/bac-si.ts` — không hard-code rải rác.

## 7. Start Point

Đồng cung Lộc Tồn. Implementation KHÔNG tính lại Lộc Tồn bằng `LOC_TON_TABLE` — đọc thẳng vị trí đã có
sẵn trong `chart.cungs[].phuTinh` (tìm phần tử có `name === "Lộc Tồn"`), đúng yêu cầu "Nếu Natal Core đã
có vị trí Lộc Tồn: Vòng Bác Sĩ phải dùng vị trí đó" (Mục VII spec).

## 8. Direction

`isThuanChung` — tái sử dụng nguyên vẹn, suy ra từ `chart.amDuongNam` (field public sẵn có trên
`TuViChart`, không cần thêm field mới): `"Dương Nam"` hoặc `"Âm Nữ"` → thuận; `"Âm Nam"` hoặc `"Dương
Nữ"` → nghịch. Không tạo helper thuận/nghịch thứ hai.

## 9. School Conflict

**Không phát hiện.** 3 nguồn kiểm tra (hocvienlyso.org, thanglongdaoquan.vn, tuvicaimenh.com) đồng nhất
100% về: số lượng sao (12), tên sao, thứ tự sao, điểm khởi (đồng cung Lộc Tồn), và quy tắc chiều đi
(Dương Nam/Âm Nữ thuận, Âm Nam/Dương Nữ nghịch). Không có SOURCE_CONFLICT, không có SCHOOL_CONFLICT.

## 10. Implementation

Điều kiện Mục X spec — đối chiếu:

1. Source Nam Phái đủ rõ — ✅ (Level 1, trích dẫn trực tiếp, Mục 5).
2. 12 sao đã xác định — ✅.
3. Chiều đã xác định — ✅.
4. Điểm khởi đã xác định — ✅.
5. Không còn conflict ảnh hưởng rule — ✅.

→ **IMPLEMENT**. File mới: [`src/lib/tu-vi/bac-si.ts`](../src/lib/tu-vi/bac-si.ts).

```ts
export const BAC_SI_RING: readonly string[] = [
  "Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư",
  "Phi Liêm", "Hỷ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ",
];

export function getBacSiRing(chart: TuViChart): BacSiPlacement[] { /* pure, read-only */ }
```

- Deterministic, pure, không mutate input — xác nhận bằng test (Mục 13).
- Không phụ thuộc renderer.
- Không duplicate logic Natal Core: dùng `mod12` (tiện ích chung, không phải "rule") từ `rules.ts`, không
  import `LOC_TON_TABLE` hay tính lại Can năm.
- Không sửa `engine.ts`/`rules.ts`/`json-contract.ts`/`bat-tu.ts`.

## 11. Data Model

Vòng Bác Sĩ **KHÔNG** được thêm vào `TuViChart`/`CungKetQua` (Natal Core). Đây là 1 function riêng biệt
ở tầng Future Module, nhận `TuViChart` (Public Chart Model) làm input read-only và trả về mảng
`BacSiPlacement[]` độc lập — đúng kiến trúc `NATAL CORE → PUBLIC CHART MODEL → FUTURE MODULE` đã định
nghĩa ở Phase 31 ([TUVI_NATAL_CORE_LOCK.md](./TUVI_NATAL_CORE_LOCK.md) Mục VI). Không sửa semantics của
bất kỳ field Natal Core nào.

## 12. JSON

Kiểm tra `json-contract.ts`: `TuViJsonStar.category` hiện chỉ nhận `"CHINH_TINH" | "PHU_TINH"` (union
đóng), không có chỗ cho nhóm "vòng sao" (§33 CAT_TINH/SAT_TINH/LUU_TINH/VONG đã được Phase 21 ghi nhận
`MISSING_FIELD một phần` từ trước). Không có field cấp cao nào khác dành cho vòng sao phụ.

→ **`SCHEMA_GAP`**. Không rewrite `json-contract.ts`, không thêm field mới vào nó trong phase này (thêm
field mới đòi hỏi mở union `category` hoặc thêm mảng `vongSao` cấp `TuViJsonPalace` — đó là thay đổi
schema cần Phase Change Request riêng, ngoài phạm vi "implement nếu đủ nguồn" của Phase 32).

## 13. Renderer

Renderer hiện tại (`lap-la-so-tu-vi.astro`) chỉ đọc `chart.cungs[].phuTinh`/`chinhTinh` — không có cơ chế
generic nào bao phủ dữ liệu nằm ngoài `chart.cungs` (như kết quả `getBacSiRing()`, vì Mục 11 đã quyết
định không nhét vào `phuTinh`). Card xuất ảnh hiện đã kín chỗ (font 8-11px trong ô 720×1000px cho 4x4
lưới) — thêm 12 nhãn sao mới vào mỗi ô là 1 thay đổi UI đáng kể, không phải "thay đổi tối thiểu".

→ **Quyết định**: KHÔNG sửa renderer trong Phase 32. Đây là lựa chọn có chủ đích (không phải bỏ sót) —
đúng tinh thần "Nếu cần UI mới: chỉ thay đổi tối thiểu", và spec không bắt buộc phải hiển thị ngay khi
LOCK. Việc hiển thị UI (nếu cần) nên là 1 phase riêng có thiết kế layout rõ ràng.

## 14. Test Matrix

File: [`tests/tu-vi-phase32-bac-si.test.ts`](../tests/tu-vi-phase32-bac-si.test.ts) — 18 test, biên soạn
theo đúng 8 mục A-H của spec:

| Mục | Nội dung | Số test |
|---|---|---|
| A | Điểm khởi (Bác Sĩ đồng cung Lộc Tồn) | 6 (1 dedicated describe, đủ 6 input GM-001→006) + phủ lại trong 5 case chính |
| B | Chiều (Dương Nam vs Dương Nữ cùng Can phải ngược chiều, trừ điểm đối xung tất yếu toán học tại offset 6) | 1 |
| C | Đủ 12 sao đúng tên | 3 |
| D | 12 vị trí không trùng cung | 3 (gộp cùng C) |
| E | Nhiều Can (Giáp/Canh/Ất/Quý — 4 Can, đủ 2 Dương + 2 Âm) | 5 case chính |
| F | Nhiều Chi (điểm khởi Dần/Thân/Mão/Tý — 4 vị trí khác nhau) | 5 case chính |
| G | Nam/Nữ | 5 case chính (đủ cả 2) |
| H | Âm/Dương | 5 case chính (đủ cả 2) |

Expected value ở 5 case chính được **tính tay offline** từ `LOC_TON_TABLE` (đã LOCKED, khớp độc lập với
bảng của thanglongdaoquan.vn) + quy tắc `isThuanChung` (đã LOCKED), viết thành literal cố định trong test
— không gọi `getBacSiRing()` để tự sinh rồi so lại với chính nó (đúng yêu cầu "KHÔNG:
`getBacSiRing(input) === getBacSiRing(input)`" của Mục XIV spec).

**Lỗi phát hiện khi viết test — đã sửa, ghi nhận minh bạch**: giả định ban đầu "mọi offset > 0 giữa chiều
thuận và chiều nghịch (cùng điểm khởi) đều phải khác nhau" là SAI về mặt toán học — tại offset = 6
(±6 mod 12), 2 chiều luôn trùng nhau (điểm đối xung/đối diện trên vòng tròn 12 cung). Phát hiện qua chạy
test thật (`expected 8 not to be 8`), sửa bằng cách loại trừ đúng điểm đối xứng đó, KHÔNG nới lỏng test
một cách mơ hồ. Đây là lỗi thứ 2 cùng loại trong toàn bộ 32 phase (lỗi đầu tiên: Phase 24, Văn Xương/Văn
Khúc và Tả Phù/Hữu Bật) — cùng một nguyên nhân toán học (2 chuỗi offset ngược chiều nhau trên modulo 12
luôn giao nhau đúng 2 điểm: offset 0 và offset 6), không phải lỗi rule.

## 15. Regression

Xem chi tiết baseline tại Mục XVIII bên dưới (trong file này) — không có file nào thuộc Natal Core bị
sửa, không có test cũ nào bị xóa/sửa. Xác nhận qua `npx vitest run` sau khi hoàn tất Phase 32:

```
Test Files  25 passed (25)
     Tests  744 passed | 5 expected fail (749)
```

---

## XVI. Architecture Regression (đối chiếu spec Mục XVI/XVII)

2 test riêng biệt trong `tests/tu-vi-phase32-bac-si.test.ts` (describe "Architecture regression"):

1. So sánh `JSON.stringify(chart)` toàn bộ trước/sau khi gọi `getBacSiRing(chart)` 3 lần liên tiếp —
   xác nhận không có bất kỳ field Natal Core nào (Mệnh/Thân/12 cung/Can cung/Cục/14 chính tinh/status/
   Tứ Hóa/Tuần/Triệt/Đại Vận) bị thay đổi.
2. So sánh **reference** (không chỉ giá trị) của `chart.cungs`, `chart.cungs[0]`, `chart.cungs[0].phuTinh`
   trước/sau — xác nhận `getBacSiRing()` không tạo bản sao mới rồi gán đè, không append phần tử vào mảng
   `phuTinh` có sẵn (tức không "âm thầm" biến Bác Sĩ thành 1 phụ tinh trộn lẫn vào Natal Core).

## XVIII. Test Suite (OLD/NEW/ADDED)

| | PASS | EXPECTED-FAIL | UNEXPECTED-FAIL | TỔNG |
|---|---|---|---|---|
| **OLD** (baseline Phase 31, sau khi Phase 31 tự thêm test bảo vệ) | 726 | 5 | 0 | 731 |
| **NEW** (sau Phase 32) | 744 | 5 | 0 | 749 |
| **ADDED** | +18 (toàn bộ trong `tests/tu-vi-phase32-bac-si.test.ts`) | +0 | +0 | +18 |
| **CHANGED** | Không có test cũ nào bị sửa/xóa | — | — | — |

PASS tăng đúng bằng số test mới thêm, EXPECTED-FAIL không đổi, UNEXPECTED-FAIL = 0 → đạt yêu cầu Mục
XVIII spec.

## Final Status

```
BAC_SI_LOCKED
```

Điều kiện LOCK (đối chiếu Mục XX-XXI spec): source Nam Phái Level 1 đủ rõ, 12 sao xác định, chiều xác
định, điểm khởi xác định, không còn conflict, implementation dùng lại đúng dữ liệu/quy tắc Natal Core đã
có (không tính lại, không mutate), test đầy đủ 8 mục A-H, regression suite tăng thuần túy không giảm/không
tăng expected-fail. Không có Golden Master data cho vòng này (`NO_DATA`, không phải blocker cho LOCK —
đúng tinh thần Mục XV spec: "Golden Master không có dữ liệu Bác Sĩ → NO_DATA. Không tự tạo expected.").
