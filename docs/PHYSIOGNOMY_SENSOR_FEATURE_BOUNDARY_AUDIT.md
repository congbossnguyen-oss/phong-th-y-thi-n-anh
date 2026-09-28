# Audit: tách ngưỡng thu nhận khỏi miền Phiên

```text
PHÂN LOẠI: PASS
Feature Layer không còn import GIÁ TRỊ từ session. Giá trị 11/11 không đổi.
Test 2 854 PASS / 0 FAIL / 5 expected-fail (159 tệp) · Build PASS.
Một vấn đề TỒN TẠI TỪ TRƯỚC được ghi nhận, không sửa (ngoài phạm vi): §7.
```

> **Đính chính đường dẫn trong yêu cầu.** Yêu cầu ghi `src/session/steps.ts` — tệp này
> **không tồn tại**. Đường dẫn thật: `src/features/physiognomy/session/steps.ts`.

---

## A. Trước

Trích bằng máy, không giả định:

```text
src/features/physiognomy/features/extract.ts:40
  import { BLUR_MIN, BRIGHTNESS_MAX, BRIGHTNESS_MIN, COVERAGE_MAX,
           COVERAGE_MIN, FRONT_LIMITS, NEAR_MIN_COVERAGE, TURN_MIN_DEG }
    from "../session/steps";                      ← 8 GIÁ TRỊ, phụ thuộc runtime

src/features/physiognomy/features/extract.ts:41
  import type { FaceStep } from "../session/types";   ← type-only
src/features/physiognomy/features/schema.ts:15
  import type { FaceStep } from "../session/types";   ← type-only
```

`YAW_SIGN_FOR_USER_LEFT` chỉ xuất hiện trong **chú thích** ở `extract.ts:679`, không
phải import — đã kiểm.

### Phân loại 16 export của `session/steps.ts`

| Symbol | Loại | Quyết định |
|---|---|---|
| `FRONT_LIMITS` | ngưỡng thu nhận | **CHUYỂN** |
| `TURN_MIN_DEG` · `TURN_SAFE_MAX_DEG` | ngưỡng thu nhận | **CHUYỂN** |
| `NEAR_MIN_COVERAGE` · `COVERAGE_MIN` · `COVERAGE_MAX` | ngưỡng thu nhận | **CHUYỂN** |
| `BLUR_MIN` · `BRIGHTNESS_MIN` · `BRIGHTNESS_MAX` | ngưỡng thu nhận | **CHUYỂN** |
| `STEP_STABLE_FRAMES` | tham số vòng lặp thu nhận | **CHUYỂN** |
| `YAW_SIGN_FOR_USER_LEFT` | quy ước dấu của cảm biến | **CHUYỂN** |
| `STEP_DEFS` · `StepDefinition` | nhãn + câu hướng dẫn cho UI | ở lại |
| `StepInput` · `StepVerdict` | hình dạng vào/ra của máy trạng thái | ở lại |
| `evaluateStep` · `nextStep` | máy trạng thái bước | ở lại |

`TURN_SAFE_MAX_DEG`, `STEP_STABLE_FRAMES` và `YAW_SIGN_FOR_USER_LEFT` chuyển cùng dù
Feature Layer không dùng: chúng thuộc **cùng một miền** với 8 cái kia. Tách đôi một cặp
liên quan chặt (`TURN_MIN_DEG` / `TURN_SAFE_MAX_DEG`) để đúng chữ "tối thiểu" sẽ làm mã
khó đọc hơn, không phải ít trừu tượng hơn.

---

## B. Sau

Module mới: **`src/features/physiognomy/acquisition/thresholds.ts`** — một **LÁ** trong
đồ thị, không import gì cả.

Đường dẫn khác gợi ý của yêu cầu (`acquisition-thresholds.ts` ở gốc) vì repo đã có
convention thư mục-theo-miền (`camera/`, `capture/`, `session/`, `features/`). Đặt vào
thư mục riêng `acquisition/` cho nó thành một tầng rõ ràng trong đồ thị, thay vì lẫn
vào `capture/` (vốn thuộc miền cảm biến — Feature Layer phụ thuộc vào đó lại là một
cạnh đi ngược khác).

```text
acquisition   (LÁ — không import gì)
   ↑              ↑
feature       session
```

`session/steps.ts` **import** các ngưỡng để chạy `evaluateStep`, và **tái xuất** chúng
để mọi nơi đang import từ tệp cũ (UI mobile, các test Phase 1C) không gãy.

---

## C. Quyền sở hữu

| Symbol | Owner trước | Owner sau | Giá trị đổi? |
|---|---|---|---|
| `YAW_SIGN_FOR_USER_LEFT` | `session/steps.ts` | `acquisition/thresholds.ts` | **NO** (1) |
| `FRONT_LIMITS` | `session/steps.ts` | `acquisition/thresholds.ts` | **NO** (`{yaw:8,pitch:8,roll:5}`) |
| `TURN_MIN_DEG` | `session/steps.ts` | `acquisition/thresholds.ts` | **NO** (20) |
| `TURN_SAFE_MAX_DEG` | `session/steps.ts` | `acquisition/thresholds.ts` | **NO** (45) |
| `NEAR_MIN_COVERAGE` | `session/steps.ts` | `acquisition/thresholds.ts` | **NO** (0.62) |
| `COVERAGE_MIN` | `session/steps.ts` | `acquisition/thresholds.ts` | **NO** (0.25) |
| `COVERAGE_MAX` | `session/steps.ts` | `acquisition/thresholds.ts` | **NO** (0.85) |
| `BLUR_MIN` | `session/steps.ts` | `acquisition/thresholds.ts` | **NO** (0.0015) |
| `BRIGHTNESS_MIN` | `session/steps.ts` | `acquisition/thresholds.ts` | **NO** (0.18) |
| `BRIGHTNESS_MAX` | `session/steps.ts` | `acquisition/thresholds.ts` | **NO** (0.92) |
| `STEP_STABLE_FRAMES` | `session/steps.ts` | `acquisition/thresholds.ts` | **NO** (3) |

Kiểm bằng hai cách độc lập:

1. Nạp cả hai module, so từng giá trị với snapshot → **11/11 khớp**.
2. Test `session/steps` tái xuất **đúng cùng một đối tượng** (`toBe`, không phải
   `toEqual`) → không phải bản sao.

---

## D. Đồ thị import

| Cạnh | Kết quả | Bằng chứng |
|---|---|---|
| **Feature → Session (giá trị)** | **PASS** | 0 cạnh. Còn lại chỉ 2 `import type { FaceStep }` |
| **Acquisition → Session** | **PASS** | 0 — module không import gì |
| **Session → Acquisition** | **PASS** | có, đúng chiều cho phép |
| **Feature → Acquisition** | **PASS** | có, đúng chiều cho phép |
| **Feature → Pipeline** | **PASS** | 0 |
| **Feature → Knowledge / Rules / Interpretation** | **PASS** | 0 |
| **Acquisition → mọi tầng khác** | **PASS** | 0 (9 cạnh cấm mới đều vắng) |

Đồ thị đầy đủ sau refactor:

```text
acquisition  ← LÁ
feature     -> acquisition, sensor(barrel), session(type-only)
session     -> acquisition, transport(type-only)
sensor      -> feature
transport   -> feature
contract    -> feature
rules       -> contract, knowledge
interp      -> rules
pipeline    -> contract, feature, interp, knowledge, rules
ui          -> feature, pipeline, sensor, session, transport
```

39 cạnh cấm được khoá bằng test; **không cạnh nào tồn tại**.

---

## E. ⚠️ Lỗi trong chính bộ trích đồ thị — đã sửa

Trong lúc refactor, cạnh `feature → acquisition` vừa thêm **không hề xuất hiện** trong
đồ thị. Nguyên nhân: regex của cả bộ trích lẫn test ranh giới dùng

```
(?:import|export)\s[^;\n]*?from
                      ↑ loại trừ xuống dòng
```

nên **bỏ sót MỌI import viết nhiều dòng**:

```ts
import {
  BLUR_MIN,
  ...
} from "../acquisition/thresholds";
```

Nghĩa là **audit ranh giới ở phase trước chạy trên đồ thị THIẾU**, và 51 test ranh giới
xanh một cách sai. Đã sửa thành `[^;]*?` (câu lệnh import luôn kết thúc bằng `;` nên đó
là biên an toàn).

Sau khi sửa, ba cạnh trước đây bị giấu lộ ra:

| Cạnh mới lộ | Có bị cấm không |
|---|---|
| `pipeline → interp` | không — đúng chiều |
| `sensor → feature` (thêm `capture/quality.ts`) | không |
| `ui → session` (thêm `NhanTuongDesktop.astro`) | không |

**Kết luận của phase trước vẫn đúng**, nhưng giờ mới dựa trên dữ liệu đầy đủ. Đã ghi
chú thích dài trong test để không ai vô tình đổi lại.

---

## F. Regression

| Bộ test | Số test |
|---|---|
| `nhan-tuong-boundary` | **69** (51 → 69: +18 test A/B/C và cạnh cấm mới) |
| `nhan-tuong-feature-layer` | 83 |
| `nhan-tuong-session` | 63 |
| `nhan-tuong-transport` | 58 |
| `nhan-tuong-transport-api` | 15 |
| `nhan-tuong-pipeline` | 39 |
| `nhan-tuong-scan` | 36 |
| `nhan-tuong-phase1b` | 68 |
| `nhan-tuong-api` | 31 |
| `nhan-tuong-ux-patch` | 20 |
| `nhan-tuong-collection` | 27 |
| **Toàn bộ** | **2 854 PASS / 0 FAIL / 5 expected-fail** (159 tệp) |

### Một test phải sửa

`nhan-tuong-ux-patch` → *"không đụng quy ước sensor"* đọc **văn bản nguồn** của
`session/steps.ts` để khẳng định `YAW_SIGN_FOR_USER_LEFT: 1 | -1 = 1`. Sau khi chuyển,
định nghĩa nằm ở tệp khác nên test đỏ.

Đây là test bám **vị trí cài đặt**, không bám hành vi. Ý định của nó (giá trị không
đổi) vẫn đúng, nên đã trỏ sang chủ sở hữu mới và thêm một khẳng định rằng `steps.ts`
vẫn tái xuất. **Không đổi giá trị nào.**

### Hành vi giữ nguyên (Test D)

`pose`, `blur`, cổng chính diện, `turn`, và toàn bộ measurement status vẫn PASS:
`nhan-tuong-session` 63/63, `nhan-tuong-phase1b` 68/68, `nhan-tuong-feature-layer`
83/83, `nhan-tuong-pipeline` 39/39. Trạng thái feature **không đổi**:
`3 measured · 26 low_confidence · 0 unsupported`.

---

## G. Bundle production

`astro build` PASS (27.06s). Grep bản build thật:

| Chuỗi | Số tệp |
|---|---|
| `ntd-collect` · `ntd-diag` · `renderDiagnostics` · `nt-collect-v1` | 0 |
| `physiognomy-test-export-v1` · `dongBoMauDangQuet` | 0 |
| `TEST_RULE` · `OPEN_GATE_TEST` (luật chỉ có trong test) | 0 |
| `physiognomy-pipeline-v1` | 0 |

Ngưỡng thu nhận **vẫn** có trong bundle client (UI mobile cần chúng để chấm bước) —
đúng như trước refactor, không đổi.

---

## §7. Trùng lặp TỒN TẠI TỪ TRƯỚC — ghi nhận, KHÔNG sửa

`src/features/physiognomy/capture/quality.ts` giữ **bản sao riêng** của 5 ngưỡng, cùng
giá trị, khác tên:

| `capture/quality.ts` | `acquisition/thresholds.ts` | Giá trị |
|---|---|---|
| `MIN_FACE_COVERAGE` | `COVERAGE_MIN` | 0.25 |
| `MAX_FACE_COVERAGE` | `COVERAGE_MAX` | 0.85 |
| `MIN_BLUR_SCORE` | `BLUR_MIN` | 0.0015 |
| `MIN_LIGHTING` | `BRIGHTNESS_MIN` | 0.18 |
| `MAX_LIGHTING` | `BRIGHTNESS_MAX` | 0.92 |

Có từ Phase 1/1C, **không phải do phase này tạo ra**. Refactor này không làm tệ thêm:
trước có 2 chủ sở hữu (`steps.ts` + `quality.ts`), sau vẫn 2 (`thresholds.ts` +
`quality.ts`).

Theo yêu cầu §7 ("duplicate đã tồn tại từ trước… ghi vào audit"), **không sửa**.

**Rủi ro thật:** đổi `BLUR_MIN` mà quên `MIN_BLUR_SCORE` thì cổng chất lượng của
`evaluateStep` và của `qualityToErrorState` sẽ lệch nhau — cùng một khuôn mặt, hai câu
trả lời khác nhau. Hiện chưa lệch vì giá trị bằng nhau.

**Khuyến nghị (phase riêng):** cho `capture/quality.ts` import từ
`acquisition/thresholds.ts` và giữ tên cũ làm alias. Nhỏ, nhưng chạm cổng chất lượng
Phase 1B đang PASS nên cần bộ test riêng.

Đã kiểm thêm: **không có magic number mới**, không có ngưỡng dự phòng nào khác. Test
*"mỗi ngưỡng chỉ được ĐỊNH NGHĨA một lần"* khoá 11 tên vào đúng một tệp.

---

## Files changed

```text
+ src/features/physiognomy/acquisition/thresholds.ts      chủ sở hữu mới, 11 hằng, LÁ
~ src/features/physiognomy/session/steps.ts               import + tái xuất, sửa header
~ src/features/physiognomy/features/extract.ts            import từ acquisition
~ tests/nhan-tuong-boundary.test.ts                       sửa regex + 18 test mới (69)
~ tests/nhan-tuong-ux-patch.test.ts                       trỏ sang chủ sở hữu mới
+ docs/PHYSIOGNOMY_SENSOR_FEATURE_BOUNDARY_AUDIT.md
```

Không thêm feature · không thêm nguồn · không thêm luật · không đổi giá trị · không đổi
status · không đổi transport schema · không đổi session protocol · không nối LLM ·
không deploy · không commit.

---

## Blocker còn lại

1. **Trùng lặp `capture/quality.ts`** (§7) — cần một phase riêng.
2. **`feature → session` type-only vẫn còn** (`FaceStep`). Yêu cầu §6 Test A chỉ đòi
   bỏ **value import**, và điều đó đã đạt. Muốn sạch hẳn thì phải chuyển `FaceStep` /
   `FACE_STEPS` sang miền thu nhận — việc này chạm session protocol nên **ngoài phạm vi**.
3. `src/features/physiognomy/voice/recorder.ts:241` vẫn còn lỗi kiểu `Float32Array` có
   từ trước Phase 1D. Không ảnh hưởng build.
