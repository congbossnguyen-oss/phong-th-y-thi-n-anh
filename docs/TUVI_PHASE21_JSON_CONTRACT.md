# TUVI PHASE 21 — TU VI JSON CONTRACT NORMALIZATION

Chuẩn hóa JSON output theo schema `TuVi_Engine_V2.md` §34/§35/§36 bằng **1 adapter thuần túy** —
**KHÔNG sửa `tinhTuVi()`/`TuViChart`**, không đổi bất kỳ rule tính toán nào, không đổi renderer.
**Không commit/push.**

---

## 1. Schema audit

Đọc lại chính xác §34 (Palace), §35 (StarInstance), §36 (JSON output chuẩn) của `TuVi_Engine_V2.md`.

| Schema field | Current field (`TuViChart`) | Match | Action |
|---|---|---|---|
| `meta.engineVersion` | không có | ❌ | MISSING_FIELD → thêm hằng số `"2.0.0"` (khớp §49) |
| `meta.profile` | không có | ❌ | MISSING_FIELD → thêm hằng số `"NAM_PHAI_NGUYEN_CAT"` |
| `meta.timezone` | không có | ❌ | MISSING_FIELD → thêm hằng số `"Asia/Ho_Chi_Minh"` |
| `input.gender` ("NAM"/"NU") | `input.gender` ("Nam"/"Nữ") | ⚠️ enum khác | Map qua bảng `GENDER_MAP` |
| `input.solarDate` (string ISO) | `input.day/month/year` (số rời) | ⚠️ khác dạng | Compose string, không tính lại |
| `input.time` ("HH:MM") | `input.hour` (số, KHÔNG có phút) | ⚠️ thiếu phút | MISSING_FIELD (phút) — luôn xuất ":00", ghi rõ trong adapter, KHÔNG tự thêm field phút vào `TuViInput` |
| `input.viewingYear` | `input.viewingYear` | ✅ | Map trực tiếp |
| `calendar.lunarDate` | `lunarDay/lunarMonth/lunarYear/lunarIsLeap` | ⚠️ khác dạng | Compose string |
| `calendar.yearCanChi/monthCanChi/dayCanChi/hourCanChi` | `yearPillar/monthPillar/dayPillar/hourPillar` (Phase 20, dạng object) | ⚠️ khác dạng | Compose string `"${can} ${chi}"`, KHÔNG tính lại |
| `thienBan.amDuong` (UPPER_SNAKE) | `amDuongNam` ("Dương Nam"...) | ⚠️ enum khác | Map qua bảng `AM_DUONG_MAP` |
| `thienBan.banMenh` | `banMenhNapAm` | ✅ (khác tên) | Rename |
| `thienBan.cuc` | `cucName` | ✅ (khác tên) | Rename |
| `thienBan.cucNumber` | `cucSo` | ✅ (khác tên) | Rename |
| `thienBan.menhQuai` | `menhQuai` | ✅ | Map trực tiếp |
| `thienBan.chuMenh`/`chuThan` | `chuMenh`/`chuThan` | ✅ | Map trực tiếp |
| `thienBan.menhIndex`/`thanIndex` | `menhChiIndex`/`thanChiIndex` | ✅ (khác tên) | Rename |
| `palaces[].index` | `cungs[].chiIndex` | ✅ (khác tên) | Rename |
| `palaces[].branch` | `cungs[].chiName` | ✅ (khác tên) | Rename |
| `palaces[].stem` | `cungs[].canName` | ✅ (khác tên) | Rename |
| `palaces[].palaceName` (enum có gạch dưới) | `cungs[].cungName` ("Mệnh", "Phụ Mẫu"...) | ⚠️ enum khác | Map qua bảng `PALACE_NAME_MAP` (12 cặp cố định) |
| `palaces[].isMenh/isThan` | `cungs[].isMenh/isThan` | ✅ | Map trực tiếp |
| `palaces[].stars: StarInstance[]` | `cungs[].chinhTinh[]` + `cungs[].phuTinh[]` (2 mảng riêng) | ⚠️ cấu trúc khác | Gộp thành 1 mảng, thêm `category` |
| `palaces[].daiVan.{startAge,endAge,label}` | `cungs[].daiVanTuoi: [number,number]` (không có label) | ⚠️ thiếu label | Compose `label = "${canName} ${chiName}"` (dùng đúng Can/Chi cung đó, không tính lại) |
| `palaces[].tieuHan` | không có | ❌ | MISSING_FIELD (Tiểu Hạn NOT_IMPLEMENTED — Phase 19), luôn `undefined` |
| `palaces[].luuNien` | không có | ❌ | MISSING_FIELD (Lưu Niên NOT_IMPLEMENTED — Phase 19), luôn `undefined` |
| `palaces[].trangSinh` | `cungs[].trangSinh` | ✅ | Map trực tiếp |
| `palaces[].markers.{tuan,triet}` | `cungs[].tuan/triet` (2 field rời) | ⚠️ cấu trúc khác | Gộp thành `markers` object |
| `StarInstance.id` | không có | ❌ | MISSING_FIELD → NEEDS_REVIEW, dùng `name` làm id (xem mục 7) |
| `StarInstance.name` | `chinhTinh[].name`/`phuTinh[].name` | ✅ | Map trực tiếp |
| `StarInstance.category` (6 giá trị, §33) | không có | ⚠️ | Chỉ map được `CHINH_TINH`/`PHU_TINH` (2/6 giá trị enum spec) — xem mục 7 |
| `StarInstance.element` | không có | ❌ | MISSING_FIELD, optional → `undefined` |
| `StarInstance.status` (chỉ chính tinh có) | `chinhTinh[].trangThai` | ⚠️ enum khác + chỉ 1 nhóm sao có | Map qua `STATUS_MAP`; phụ tinh → `undefined` (đúng vì không có status trong data gốc) |
| `StarInstance.transformation` | `chinhTinh[]/phuTinh[].tuHoa` | ⚠️ enum khác | Map qua `TU_HOA_MAP` |
| `StarInstance.isAnnual`/`isNatal` | không có | ❌ | MISSING_FIELD → suy ra CHẮC CHẮN `isAnnual=false, isNatal=true` cho MỌI sao (Lưu Niên chưa tồn tại trong engine — không phải suy đoán, là thực tế 100% dữ liệu hiện có) |
| `StarInstance.sourceRule` (bắt buộc, không optional) | không có | ❌ | MISSING_FIELD → NEEDS_REVIEW, chỉ điền được ở mức BUCKET (xem mục 7) |
| — (tuỳ chọn top-level Tứ Hóa summary) | `tuHoa: TuHoaResult` | — | EXTRA_FIELD (spec không có field cấp cao này — §17 chủ trương Tứ Hóa là property của sao) — GIỮ LẠI, không xóa dữ liệu thật |
| — | `banMenhElement` | — | EXTRA_FIELD (spec không liệt kê) — GIỮ LẠI |

**SCHEMA_UNDEFINED**: spec không định nghĩa format cụ thể cho `StarInstance.id` (chỉ nói `string`), không
định nghĩa 4/6 giá trị `category` còn lại (`CAT_TINH`/`SAT_TINH`/`LUU_TINH`/`VONG`) tương ứng với phụ tinh
cụ thể nào (§33 chỉ liệt kê tên enum, không map từng sao vào từng loại) — không tự đoán, xem mục 7.

---

## 2. Current → Target mapping

```
CURRENT ENGINE DATA (TuViChart, KHÔNG ĐỔI)
        ↓  (đọc thuần, không tính lại)
ADAPTER: toJsonContract() — src/lib/tu-vi/json-contract.ts
        ↓  (rename + enum transform + reshape)
EXPECTED SCHEMA (TuViJsonContract — khớp §34/§35/§36)
```

Không có bước "tạo lại dữ liệu bằng công thức thứ hai" ở bất kỳ đâu trong adapter — mọi giá trị output đều
đọc trực tiếp từ 1 field có sẵn trong `TuViChart` (hoặc compose chuỗi thuần từ các field đó), không có
`if/else` tính toán nghiệp vụ nào.

---

## 3. Adapter design

File mới: **`src/lib/tu-vi/json-contract.ts`** (không sửa `engine.ts`, `rules.ts`, `bat-tu.ts`).

- Export `toJsonContract(chart: TuViChart): TuViJsonContract` — hàm thuần (pure function), input/output
  rõ ràng, không side-effect, không mutate `chart` đầu vào (có test riêng xác nhận, mục 5).
- 5 bảng enum-mapping tĩnh (`GENDER_MAP`, `AM_DUONG_MAP`, `STATUS_MAP`, `TU_HOA_MAP`, `PALACE_NAME_MAP`) —
  mỗi bảng là 1 object literal cố định, không có logic suy luận.
- 2 hàm phụ trợ nội bộ: `toStarInstance()` (map 1 sao), `toPalace()` (map 1 cung, gọi `toStarInstance()`
  cho từng sao trong `chinhTinh`/`phuTinh` rồi gộp mảng).
- Export đầy đủ type `TuViJsonContract`, `TuViJsonPalace`, `TuViJsonStar` để nơi gọi (tương lai, nếu cần)
  có type-safety.

---

## 4. Backward compatibility

- `tinhTuVi()` và `TuViChart` — **0 dòng thay đổi**. `src/pages/lap-la-so-tu-vi.astro` (renderer) tiếp tục
  đọc `TuViChart` y hệt trước Phase 21 — **không đổi 1 dòng nào ở file này**.
- `toJsonContract()` là 1 lớp chuyển đổi TÙY CHỌN — không có nơi nào trong codebase hiện tại BẮT BUỘC phải
  gọi hàm này. Renderer không gọi `toJsonContract()` (chưa cần, không có yêu cầu UI hiển thị theo schema
  này) — giữ đúng tinh thần "không đổi renderer nếu không cần".
- Không có risk phá UI vì hàm mới hoàn toàn độc lập, chỉ ĐỌC `TuViChart` sau khi nó đã được tính xong.

---

## 5. Tests

File mới: **`tests/tu-vi-phase21-json-contract.test.ts`** — 67 test, chạy trên đủ GM-001 → GM-006
(11 test/GM × 6 = 66) + 1 test regression (không mutate chart gốc).

| Nhóm test (mỗi GM) | Nội dung |
|---|---|
| `meta` | Đủ field, đúng giá trị hằng số |
| `input` | Enum gender đúng, `solarDate`/`time` đúng format regex, khớp input gốc |
| `calendar` | 4 trụ dạng string khớp CHÍNH XÁC 4 pillar object (Phase 20) — không tính lại |
| `thienBan` | Enum `amDuong` hợp lệ, mọi field khớp 100% giá trị gốc trong `TuViChart` |
| `palaces` | Đúng 12 phần tử, đúng shape, `palaceName` đúng 1 trong 12 enum |
| `palaces` (Mệnh/Thân) | Đúng 1 cung `isMenh=true`, đúng 1 cung `isThan=true`, khớp `menhIndex`/`thanIndex` |
| `palaces[].stars` | Tổng đúng 14 chính tinh (không hơn không kém) trên toàn lá số |
| `palaces[].stars` | Mỗi chính tinh có `status` đúng enum, `isNatal=true`, `isAnnual=false`, `sourceRule` là string |
| `palaces[].stars` | Đúng 4 sao có `transformation`, đúng enum, khớp `chart.tuHoa` (Lộc/Quyền/Khoa/Kỵ) |
| `palaces[].daiVan` | Khớp `daiVanTuoi` gốc, `label` đúng format |
| `tuHoa` (EXTRA_FIELD) | Khớp 100% `chart.tuHoa` gốc |

Regression: gọi `toJsonContract()` nhiều lần liên tiếp, `JSON.stringify(chart)` trước/sau không đổi —
xác nhận adapter không mutate.

**Không sửa Golden Master. Không sửa expected value để ép pass.**

---

## 6. Regression

```
npx vitest run
```

```
Test Files  18 passed (18)
     Tests  558 passed | 5 expected fail (563)
```

- Trước Phase 21: 491 pass + 5 expected-fail (496 total).
- Sau Phase 21: 558 pass + 5 expected-fail (563 total) — **+67 test mới**, đúng bằng file mới.
- Unexpected failure: **0**.
- Đã kiểm tra TypeScript (`tsc --noEmit`): không phát sinh lỗi type nào liên quan `tu-vi`/`json-contract`
  (2 lỗi tồn tại sẵn ở `astro.config.mjs` và route PDF chứng chỉ — không liên quan, không đụng tới).
- **Không đổi**: vị trí sao (14 chính tinh + phụ tinh), status Nguyên Cát, Mệnh, Thân, Cục, Tứ Hóa, Đại
  Vận, 4 trụ Can Chi (Phase 20), Golden Master — xác nhận qua toàn bộ 491 test cũ pass nguyên vẹn +
  `engine.ts`/`rules.ts`/`bat-tu.ts` có `git diff` rỗng (0 thay đổi).

---

## 7. Remaining gaps

| Gap | Loại | Ghi chú |
|---|---|---|
| `StarInstance.id` format | NEEDS_REVIEW | Spec chỉ nói `string`, không định nghĩa format — adapter dùng `name` làm id (duy nhất trong phạm vi 1 cung, nhưng KHÔNG duy nhất toàn lá số nếu 1 sao tình cờ trùng tên ở nhiều cung — thực tế không xảy ra vì mỗi sao chỉ xuất hiện đúng 1 lần trong toàn lá số) |
| `StarInstance.category` chỉ có 2/6 giá trị enum | MISSING_FIELD | Spec §33 muốn phân loại `CAT_TINH`/`SAT_TINH`/`LUU_TINH`/`VONG` chi tiết hơn — engine hiện KHÔNG có bảng phân loại phụ tinh theo Cát/Sát/Tạp/Vòng (đã ghi từ Phase 19 mục §33-35). KHÔNG tự thêm bảng phân loại mới trong Phase 21 (đó là rule mới, ngoài phạm vi "chỉ xử lý JSON contract") |
| `StarInstance.sourceRule` chỉ ở mức bucket | NEEDS_REVIEW | Engine không lưu vết rule chính xác theo từng sao (chỉ có 2 nguồn lớn: `MAIN_STAR_STATUS` cho chính tinh, rải rác nhiều hàm/bảng cho phụ tinh) — sourceRule hiện là chuỗi mô tả nhóm, KHÔNG phải id rule chính xác từng sao. Nếu cần độ chính xác cao hơn, phải thêm cơ chế lưu vết rule per-star vào chính `engine.ts` — đây là thay đổi kiến trúc engine, ngoài phạm vi Phase 21 |
| `input.time` luôn ":00" | MISSING_FIELD | `TuViInput` không có field phút — không tự thêm (đổi input schema là ngoài phạm vi "chỉ xử lý JSON contract") |
| `palaces[].tieuHan`/`luuNien` luôn `undefined` | MISSING_FIELD | Tiểu Hạn/Lưu Niên chưa implement (Phase 19), field vẫn khai báo optional đúng schema, không giả lập giá trị |
| Toàn bộ shape KHÔNG áp dụng cho renderer | Ngoài phạm vi | Renderer vẫn dùng `TuViChart` gốc — nếu muốn renderer đọc từ `TuViJsonContract`, cần 1 chỉ thị riêng (rủi ro cao hơn vì đụng tới UI đang chạy thật) |

Không có mục nào bị đánh dấu CONFLICTED trong phase này — mọi khác biệt schema đều là MISSING_FIELD/
EXTRA_FIELD/NEEDS_REVIEW/SCHEMA_UNDEFINED thuần túy, không có trường hợp adapter phải "chọn bên" giữa
2 giá trị mâu thuẫn.

---

## KẾT LUẬN

Chỉ xử lý JSON contract qua 1 adapter thuần túy (`src/lib/tu-vi/json-contract.ts`), không sửa bất kỳ rule
tính toán nào (lịch, 4 trụ, Mệnh, Thân, 12 cung, Cục, 14 chính tinh, status Nguyên Cát, Tứ Hóa, phụ tinh,
Đại Vận, Golden Master — tất cả `git diff` rỗng). Renderer không bị đụng tới, không có rủi ro phá UI.
558 pass + 5 expected-fail, không unexpected failure, không structural regression. **KHÔNG COMMIT/PUSH.**
