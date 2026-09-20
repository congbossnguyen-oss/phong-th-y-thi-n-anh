# CONG TAIYI — Đại Lục Nhâm Interpretation — Phase 11-B Freeze

```
STATUS: FROZEN
```

Tài liệu đóng băng chính thức cho Phase 11-B (mở rộng Rule Registry từ 1 → 4 rule production).
Kế thừa nguyên trạng baseline `DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md` (Phase 10.6.6) — tài liệu
này KHÔNG thay thế, chỉ MỞ RỘNG phạm vi đóng băng sang 3 rule mới + correction đã áp dụng.

---

## 1. Audit verdict

```
B — PASS WITH NON-BLOCKING GAP
```

Nguồn: `DA_LIU_REN_PHASE_11B_POST_CORRECTION_AUDIT.md` (audit độc lập lần 2, sau correction).

- **P0**: 0
- **P1**: 0
- **P2**: 0
- **P3 còn lại**: 2, cả 2 NGOÀI PHẠM VI có chủ đích (xem mục 6) — không ảnh hưởng correctness.

---

## 2. Evidence chain (3 audit độc lập, không cái nào tin báo cáo implementer trước nó)

1. `DA_LIU_REN_PHASE_11B_INDEPENDENT_AUDIT.md` — audit lần 1, phát hiện P1 (confidence
   overstate ở R-HONNHAN-01/R-KIENTUNG-02) + 2 P2 (provenance thừa/thiếu, contract tự mâu thuẫn).
2. `DA_LIU_REN_PHASE_11B_CORRECTION_PLAN.md` — phân tích tối thiểu-an-toàn, xác định đúng root
   cause + đúng cơ chế sửa (tái dùng `resolveDayOrHourPillarProvenance`, không mechanism mới).
3. Correction implementation (đã commit — xem mục 8) — áp dụng đúng plan, 5 test mới +
   2 test cũ được sửa (không làm yếu, chỉ khớp thực tế N-rule/giá trị đúng).
4. `DA_LIU_REN_PHASE_11B_POST_CORRECTION_AUDIT.md` — audit lần 2, ĐỘC LẬP tái tạo toàn bộ
   evidence bằng script riêng (không dùng lại test file/script của lần trước làm oracle).

---

## 3. Test / Build evidence (tái xác nhận trước freeze)

| Kiểm tra | Kết quả |
|---|---|
| `daliuren-engine` tests | **377/377 PASS** |
| typecheck | **PASS** |
| package build | **PASS** |
| workspace build | **PASS** |
| Independent adversarial chart sweep | **2,154 lá số** (năm 2024, 618 Zi-hour), **0 vi phạm** trên 5 bất biến confidence/provenance |
| R-NHATTHAN-01 (4 golden case đóng băng) | **byte-identical**, tái tạo độc lập 3 lần (audit 1, correction, audit 2) |
| R-TIMDO-01 | **không đổi** — xác nhận qua diff source (0 dòng) + quét runtime riêng |
| Determinism | PASS (5x build cùng input → JSON hệt nhau) |
| Purity | PASS (evaluator không mutate `calculation` đầu vào) |

---

## 4. Confidence matrix — ĐÓNG BĂNG

| Rule | Normal hour | Zi-hour |
|---|---|---|
| R-NHATTHAN-01 | B | D |
| R-HONNHAN-01 | B | D |
| R-KIENTUNG-02 | B | D |
| R-TIMDO-01 | B *(worst-of luôn bị `TWELVE_GENERALS_DIRECTION_PROVENANCE`=B chi phối)* | không áp dụng *(không đọc `calendar.dayPillar`)* |

Cơ chế: `worstConfidence()` thuần so sánh thứ hạng trên provenance THẬT (`resolveDayOrHourPillarProvenance`
tái dùng nguyên vẹn từ R-NHATTHAN-01) — KHÔNG hard-code, KHÔNG scoring số học.

---

## 5. Provenance — ĐÓNG BĂNG

- **0 provenance ID mới** được tạo trong toàn bộ Phase 11-B (bao gồm cả correction) —
  `PRODUCTION_CALCULATION_PROVENANCE` (`rules/registry.ts`) giữ nguyên 8 entry.
- 3 provenance RULE mới (đúng 1/rule): `PROV-HONNHAN-01`, `PROV-TIMDO-01`, `PROV-KIENTUNG-02`.
- R-HONNHAN-01 KHÔNG trích `FOUR_LESSONS_PROVENANCE` (đã gỡ, đúng vì không đọc `fourLessons`).
- R-KIENTUNG-02 trích ĐỦ `FOUR_LESSONS_PROVENANCE` + `resolveDayOrHourPillarProvenance`.
- R-HONNHAN-01 trích ĐỦ `resolveDayOrHourPillarProvenance` + 3 `TWELVE_GENERALS_*`.

---

## 6. P3 còn lại — NGOÀI PHẠM VI, KHÔNG BLOCKING

Ghi rõ để tránh hiểu nhầm là "bị bỏ sót" — cả 2 mục này đã được `DA_LIU_REN_PHASE_11B_CORRECTION_PLAN.md`
chủ động xếp NGOÀI PHẠM VI correction (không liên quan P1/P2 đã sửa):

1. **TIM-DO**: thiếu test cô lập "method KHÔNG khớp yaoke/maoxing NHƯNG Huyền Vũ vẫn ở Sơ truyền"
   (mọi case âm hiện có đều trùng cả 2 điều kiện sai cùng lúc — gap mutation-coverage, không phải
   lỗi correctness đã biết).
2. **HON-NHAN**: thiếu test case "Can Ngày và Chi Ngày trùng vị trí Địa Bàn" (edge case lý thuyết,
   chưa có bằng chứng đang xử lý sai).

**Phase tương lai KHÔNG được tự ý mở 2 mục này thành 1 implementation phase riêng mà không có
brief tường minh** — nếu cần đóng, phải là 1 phase test-only có phạm vi khai báo rõ, giống đúng kỷ
luật đã áp dụng xuyên suốt dự án.

---

## 7. Frozen scope

**Đã đóng băng** (KHÔNG được sửa ngầm ở phase sau, phải qua 1 phase tường minh nếu cần đổi):
- `packages/daliuren-engine/src/rules/r-honnhan-01/**`
- `packages/daliuren-engine/src/rules/r-timdo-01/**`
- `packages/daliuren-engine/src/rules/r-kientung-02/**`
- `packages/daliuren-engine/src/rules/registry.ts` (4-rule `PRODUCTION_RULE_REGISTRY`/
  `PRODUCTION_EVALUATOR_REGISTRY`/`PRODUCTION_CALCULATION_PROVENANCE`, đúng thứ tự khai báo)
- `packages/daliuren-engine/src/rules/index.ts`
- Toàn bộ test tương ứng (`tests/unit/rules/{r-honnhan-01,r-timdo-01,r-kientung-02,
  multi-rule-integration}.test.ts`, cộng phần đã sửa của `r-nhatthan-01.test.ts`/
  `interpretation-package-builder.test.ts`)
- `docs/daliuren/DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md` (bao gồm erratum
  mục D1 — giá trị authoritative DUY NHẤT là bản đã đính chính, KHÔNG PHẢI đoạn gạch ngang)

**KHÔNG đổi bởi Phase 11-B** (kế thừa nguyên trạng từ baseline Phase 10.6.6, vẫn đóng băng):
- `packages/daliuren-engine/src/rules/r-nhatthan-01/**` — 0 dòng thay đổi trong TOÀN BỘ Phase
  11-B (implementation gốc lẫn correction).
- Model C (`interpretation/confidence.ts`, `interpretation/rule.ts`, `interpretation/signal.ts`).
- `interpretation/calendar-dependency-provenance.ts` (`resolveDayOrHourPillarProvenance` — TÁI
  DÙNG nguyên vẹn, không sửa 1 dòng).
- `validation/rule-registry.ts`, `validation/evaluator-registry.ts` (Level 1/2 gating).
- `interpretation-package-builder.ts`, `validation/interpretation-package.ts`.
- `interpretation/chart-id.ts`.
- Kiến trúc Conflict (Option A, `conflicts=[]` tuyệt đối).
- `CalculationProfile`/`profiles/classical-v1.ts` — vẫn CHỈ 1 profile, cùng ràng buộc kiến trúc đã
  biết từ Phase 10.6.3 (hard-code `CLASSICAL_V1_PROFILE` trong evaluator).
- Toàn bộ Calculation Layer (`calendar/`, `four-lessons/`, `three-transmissions/`,
  `twelve-generals/`, `nine-methods/`, v.v.) — không file `compute.ts`/`*.table.ts` nào bị chạm.

**Tuyên bố bắt buộc**: mọi phase TƯƠNG LAI muốn thay đổi ngữ nghĩa/kiến trúc đã đóng băng ở đây
(rule trigger, polarity, relation, provenance grade, confidence mechanism, registry ordering, hay
BẤT KỲ phần "KHÔNG đổi" nào liệt kê ở trên) PHẢI làm qua 1 phase tường minh RIÊNG, có brief rõ
ràng, có audit độc lập nếu ảnh hưởng confidence/provenance — KHÔNG được sửa ngầm, KHÔNG được coi
là "dọn dẹp nhỏ" đi kèm 1 tính năng khác.

---

## 8. Git

| | |
|---|---|
| Commit hash | `19dd4bf4a44a4b7ab997d927f89ee7404e9324c1` |
| Commit message | `fix(daliuren): correct phase 11b provenance confidence` |
| Branch | `quan-su-thien-anh` |
| Files trong commit | 24 (4 doc mới, 12 file rule mới [3 rule × 4 file], 3 file registry/index sửa, 5 file test mới/sửa) |
| Phạm vi | CHỈ `packages/daliuren-engine/` + 4 file `docs/daliuren/DA_LIU_REN_PHASE_11B_*` — không website, không `cloudflare-migration`, không `astrology-core`, không package nào khác |

---

## 9. Tuyên bố Freeze

```
CONG TAIYI DA LIU REN — PHASE 11-B

STATUS: FROZEN

VERDICT: B — PASS WITH NON-BLOCKING GAP (P1=0, P2=0)

COMMIT: 19dd4bf4a44a4b7ab997d927f89ee7404e9324c1

Rule Registry: 4 rule production (R-NHATTHAN-01, R-HONNHAN-01, R-TIMDO-01, R-KIENTUNG-02).
Confidence/provenance của R-HONNHAN-01/R-KIENTUNG-02 đã sửa đúng, xác nhận qua 3 vòng audit
độc lập + quét 2,154 lá số thật. R-NHATTHAN-01 byte-identical, R-TIMDO-01 không đổi.

FREEZE KHÔNG CÓ NGHĨA:
Đã đóng 2 gap P3 còn lại (TIM-DO method-isolation test, HON-NHAN same-position test) — cả 2
NGOÀI PHẠM VI có chủ đích, không ảnh hưởng correctness.

Mọi phase tương lai PHẢI bắt đầu từ baseline đã đóng băng này (kế thừa
DA_LIU_REN_MVP_COMPLETION_AND_FREEZE.md + freeze này) và KHÔNG được âm thầm thay đổi ngữ nghĩa/
kiến trúc/confidence/provenance đã đóng băng ở mục 7.
```
