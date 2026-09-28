# Audit ranh giới kiến trúc Nhân Tướng V1

Mục tiêu: **chứng minh kiến trúc thực sự có những ranh giới mà
[`PHYSIOGNOMY_ARCHITECTURE_V1.md`](PHYSIOGNOMY_ARCHITECTURE_V1.md) tuyên bố** — bằng đồ
thị import trích từ mã nguồn và bằng bản build thật, không bằng lời.

```text
TỔNG:  13 PASS · 2 PARTIAL · 0 FAIL · 0 NOT_TESTED
Sửa:   1 vi phạm (giao diện tự đấu lại pipeline) — đã sửa + khoá bằng test
Test:  2 836 PASS / 0 FAIL / 5 expected-fail (159 tệp; +51 test ranh giới mới)
Build: PASS
```

---

## 1. Đồ thị phụ thuộc thật

Trích bằng máy từ mọi `import` / `export … from` / `import()` trong `src/`, gom theo
tầng. Bảng dưới là **trạng thái sau khi sửa**.

```text
sensor     -> feature                 (hằng số/kiểu dùng chung)
feature    -> sensor                  (chỉ tệp gom src/features/physiognomy/index.ts)
feature    -> session                 ⚠ đi ngược — xem §1.2
transport  -> feature
session    -> transport               (type-only, trừ API)
contract   -> feature
rules      -> contract
rules      -> knowledge
interp     -> rules
pipeline   -> contract, feature, knowledge, rules
ui         -> feature, sensor, session, transport, pipeline
```

### 1.1 Cạnh CẤM — không cạnh nào tồn tại

30 cạnh cấm được khoá bằng test (`tests/nhan-tuong-boundary.test.ts`), gồm cả những
cạnh tài liệu nêu đích danh:

| Cạnh cấm | Trạng thái |
|---|---|
| `LLM → Feature` · `LLM → Rule` | **PASS** — adapter chỉ nhận `EvidenceBundle` |
| `Rule → Camera` · `Rule → Session` | **PASS** |
| `Knowledge → Sensor` | **PASS** — `source.ts` không import gì |
| `UI → Rule internals` | **PASS** sau khi sửa (§2) |
| `Feature → Knowledge / Rules / Interpretation` | **PASS** |
| `Contract → Knowledge / Rules / Session / Sensor` | **PASS** |
| `Session → Rules / Knowledge / Interpretation` | **PASS** |
| `Transport → Rules / Knowledge / Interpretation / Sensor` | **PASS** |

### 1.2 Hai chu trình — đều KHÔNG phải chu trình lúc chạy

| Chu trình | Bản chất |
|---|---|
| `feature → sensor → feature` | Chỉ qua **tệp gom** `features/physiognomy/index.ts`, vốn tái xuất mọi thứ. Không phải phụ thuộc thật. |
| `feature → session → transport → feature` | Cạnh quay ngược `session → transport` là **`import type`** (`session/types.ts:11`, `store.ts:25`) — TypeScript xoá lúc biên dịch. `session/steps.ts` chỉ import `./types`, không import ngược lên feature. |

Đã khoá bằng test: *"cạnh quay ngược từ session về transport phải là type-only"* và
*"không có chu trình nào chỉ gồm cạnh giá trị"*. Biến một cạnh type-only thành cạnh giá
trị là test đỏ ngay.

**Kết luận: PASS (không có chu trình runtime), nhưng xem §1.3.**

### 1.3 `feature → session` là cạnh đi NGƯỢC — **PARTIAL**

`src/features/physiognomy/features/extract.ts:40` import **giá trị** từ
`session/steps.ts`: `FRONT_LIMITS`, `TURN_MIN_DEG`, `NEAR_MIN_COVERAGE`, `COVERAGE_MIN/MAX`,
`BLUR_MIN`, `BRIGHTNESS_MIN/MAX`.

Đây là ngưỡng **chất lượng thu nhận**, về bản chất thuộc miền cảm biến/cổng chứ không
thuộc miền phiên. Chúng nằm ở `session/steps.ts` do quyết định của Phase 1C.

- Không nằm trong danh sách cạnh cấm.
- Không tạo chu trình runtime (`steps.ts` là lá).
- Nhưng **Feature Layer đang phụ thuộc vào một module tên là `session`**, điều đó sai
  về mặt tên gọi và sẽ gây hiểu nhầm khi ai đó sửa phiên.

**Khuyến nghị (KHÔNG làm ở phase audit này):** tách ngưỡng sang
`features/physiognomy/capture/thresholds.ts`, để `session/steps.ts` tái xuất lại cho
tương thích. Đây là refactor chạm vào mã Phase 1C đang PASS nên cần một phase riêng.

---

## 2. Vi phạm đã tìm ra và đã sửa

### `UI → Rule internals` + đấu lại cổng lần hai

**Trước:** bảng chẩn đoán trong `NhanTuongDesktop.astro` tự nạp
`measurement-contract/reliability`, `measurement-contract/policy`, `rules/rule`,
`rules/engine`, rồi **tự đấu lại pipeline**, kèm `sourceLookup` riêng của nó:

```ts
const gate = evaluateAll(rel, () => false);   // ← quyết định thứ hai về provenance
```

Hai vấn đề:

1. Cạnh `ui → rules` và `ui → contract` — đúng thứ tài liệu cấm.
2. `() => false` là **bản sao** của quyết định "feature này có nguồn không". Hiện trùng
   với thực tế (kho nguồn rỗng), nhưng nếu thêm nguồn thì bảng chẩn đoán sẽ âm thầm
   tiếp tục nói "không có nguồn" trong khi pipeline nói ngược lại.

**Sửa tối thiểu:** thêm `runPipelineOnFeatures()` vào `pipeline.ts` (lối vào từ danh
sách feature phẳng, vì bảng chẩn đoán chỉ có payload transport chứ không có profile),
rồi để bảng chẩn đoán gọi đúng pipeline thật. `runPhysiognomyPipeline()` nay uỷ quyền
cho nó.

**Sau:** `ui → rules` và `ui → contract` biến mất, thay bằng `ui → pipeline`.

**Khoá bằng test:** ba test mới — cạnh cấm `ui → rules`, cạnh cấm `ui → contract`, và
*"chỉ pipeline gọi `evaluateAll`"*.

---

## 3. Bảng kết quả theo từng ranh giới

| # | Ranh giới | Trạng thái | Bằng chứng | Tệp |
|---|---|---|---|---|
| 1 | Đồ thị phụ thuộc | **PASS** | 30/30 cạnh cấm vắng mặt | `tests/nhan-tuong-boundary.test.ts` |
| 1b | Chu trình | **PARTIAL** | 2 chu trình tĩnh, 0 chu trình runtime; `feature → session` đi ngược | §1.2, §1.3 |
| 2 | Feature Layer | **PASS** | không import knowledge/rules/interp/pipeline | `features/extract.ts`, `features/schema.ts` |
| 3 | Hợp đồng đo thuần | **PASS** | chạy pipeline 2 lần, `JSON.stringify(profile)` không đổi; hai lần chạy ra kết quả y hệt | test "hợp đồng đo là hàm thuần" |
| 4 | Một cổng duy nhất | **PASS** | `evaluateEligibility` định nghĩa **1** lần; chỉ `pipeline.ts` gọi `evaluateAll`; không tệp nào gán `eligible = true/false` | `measurement-contract/policy.ts:77` |
| 5 | Rule Engine | **PASS** | không `fetch`/`import()`/`process.env`/canvas/MediaPipe; chỉ nhận `EngineFeature[]` | `rules/engine.ts` |
| 6 | Kho nguồn | **PASS** | `Object.freeze({})`; không literal `citation`/`chapter`/`paragraph` nào trong `src/`; không nguồn dự phòng ẩn | `knowledge/source.ts:63` |
| 7 | Truy vết provenance | **PASS** | 5 ca A–E, xem §4 | `tests/nhan-tuong-pipeline.test.ts` |
| 8 | Ranh giới LLM | **PASS** | `explain(bundle: EvidenceBundle)`; provider mặc định TỪ CHỐI | `interpretation/index.ts` |
| 9 | Media thô | **PASS** | 10 tệp sau tầng feature: 0 chạm `getUserMedia`/`canvas`/`MediaRecorder`/`FaceLandmarker`/`arrayBuffer` | test "media thô không đi quá tầng cảm biến" |
| 10 | Transport | **PASS** | không mang rules/sources/interpretation/media; session không sửa profile | `features/transport.ts` |
| 11 | Session | **PASS** | không import rules/knowledge/interp | `session/store.ts`, `session/types.ts` |
| 12 | UI | **PASS** sau sửa | không đụng ruột engine, không nhúng tri thức, không tự chấm tư cách | §2 |
| 13 | Trạng thái feature | **PASS** | 3 measured / 26 low_confidence / 0 unsupported; cả 3 `provisional` + `eligible = false` | §5 |
| 14 | Chất lượng test | **PASS** | 6/6 test bắt buộc đều có, xem §6 | — |
| 15 | Bundle production | **PASS** | 10/10 chuỗi = 0; handler xuất chỉ còn `return 404` | §7 |
| 16 | An ninh | **PASS** | xem §8 | — |

---

## 4. Năm ca truy vết provenance

| Ca | Tình huống | Kết quả | Test |
|---|---|---|---|
| **A** | feature + luật + nguồn đều có | bằng chứng hợp lệ | "luật đủ hình dạng…" |
| **B** | thiếu nguồn | **chặn** `source_not_verified` | "luật đủ hình dạng nhưng KHÔNG có nguồn thật" |
| **C** | nguồn có nhưng `verificationStatus != verified` | **chặn** | "nguồn chưa xác minh hoặc thiếu locator" |
| **D** | feature `low_confidence` | **chặn** `measurement_not_measured` | "low_confidence KHÔNG tới được tầng luận giải" |
| **E** | feature `unsupported` | **chặn** | "unsupported → TỪ CHỐI" |

Đáng chú ý: ca B được chứng minh **hai lần**. Test *"pipeline khi MỌI cổng đều mở"* bơm
`sourceLookup: () => true` để mở cổng feature — engine **vẫn** tự tra kho nguồn thật và
chặn. **Không có đường tắt.**

---

## 5. Trạng thái feature — không đổi

```text
3 measured (face.pose.yaw/pitch/roll) · 26 low_confidence · 0 unsupported
cả 3 measured: validationStatus = provisional, interpretationEligible = false
0 feature ở mức validated
0 feature đủ tư cách luận giải
```

Đã xác nhận qua pipeline chạy thật trên trình duyệt:

```text
29 feature · 3 đo được · 0 đã kiểm chứng · 0 đủ tư cách luận giải
Luận giải: INSUFFICIENT_EVIDENCE — 1 luật xét, 1 bị bỏ qua, 0 khớp.
```

**Không nâng feature nào.**

---

## 6. Sáu test bắt buộc

| Yêu cầu | Có | Ở đâu |
|---|---|---|
| `low confidence → RuleEngine không đánh giá được` | ✓ | pipeline: "low_confidence KHÔNG tới được tầng luận giải" |
| `missing source → blocked` | ✓ | pipeline: "thiếu provenance KHÔNG tới được tầng luận giải" |
| `unverified source → blocked` | ✓ | pipeline: "nguồn chưa xác minh… đều KHÔNG dùng được" |
| `LLM chỉ nhận EvidenceBundle` | ✓ | pipeline: "interface chỉ nhận EvidenceBundle" |
| `raw media không tới interpretation` | ✓ | boundary: 10 tệp × 11 chuỗi cấm |
| `Feature Layer không import knowledge/rule` | ✓ | boundary: cạnh cấm, đồ thị thật |

Đây là test **ranh giới**, không phải test chi tiết cài đặt: chúng đọc đồ thị import và
bản build, nên vẫn đúng khi nội dung hàm thay đổi, và vẫn đỏ khi ai đó phá ranh giới.

---

## 7. Bundle production

Không chỉ grep mã nguồn — grep **bản build thật** (`dist/`, sau `astro build`):

| Chuỗi | Số tệp |
|---|---|
| `ntd-collect` · `nt-collect-v1` · `ntd-diag` · `renderDiagnostics` | 0 |
| `physiognomy-test-export-v1` · `suggestedFileName` · `dongBoMauDangQuet` | 0 |
| `physiognomy-pipeline-v1` · `physiognomy-rule-v1` · `physiognomy-knowledge-v1` | 0 |
| `TEST_RULE` · `OPEN_GATE_TEST` (luật chỉ có trong test) | 0 |
| `PhysiognomyDebugPanel` | 0 |

Handler xuất dữ liệu trong worker đã build:

```js
var GET = async ({ url }) => {
	return new Response("Not found", { status: 404 });
};
```

Không truy cập kho, không đọc tham số. **Không tồn tại**, chứ không phải "tồn tại rồi
từ chối".

---

## 8. An ninh

| Mục | Trạng thái | Bằng chứng |
|---|---|---|
| Cô lập phiên | PASS | `writeToken` một lần, connect lần hai → 409; token phiên A ghi phiên B → 403 |
| Cô lập người tham gia | PASS | payload mang sessionId khác → 400 `session_mismatch` |
| Cổng DEV | PASS | cắt lúc build, đã grep `dist/` |
| Cổng production | PASS | endpoint xuất còn đúng `return 404` |
| Kiểm schema | PASS | whitelist, trường lạ → **từ chối** (không bỏ qua) |
| Kiểm nguồn | PASS | `verified` **và** có locator mới dùng được |
| Không lưu media thô | PASS | không `FormData`/`blob`/`arrayBuffer` trong API |
| Không PII trong dữ liệu nghiên cứu | PASS | `^[A-Z0-9]{1,4}$`, chặn `@` và ≥7 chữ số |

---

## 9. Thay đổi trong phase audit này

```text
~ src/features/physiognomy/pipeline.ts           + runPipelineOnFeatures()
~ src/components/tools/NhanTuongDesktop.astro    bảng chẩn đoán gọi pipeline thật
+ tests/nhan-tuong-boundary.test.ts              51 test ranh giới
+ docs/PHYSIOGNOMY_ARCHITECTURE_BOUNDARY_AUDIT.md
```

Không thêm feature, không thêm nguồn, không thêm luật, không nâng status, không nối
LLM, không deploy, không commit.

---

## 10. Việc còn lại

1. **`feature → session` đi ngược** (§1.3) — tách ngưỡng thu nhận ra khỏi `session/steps.ts`.
   Cần một phase riêng vì chạm mã Phase 1C đang PASS.
2. `features/physiognomy/index.ts` là tệp gom tái xuất cả cảm biến lẫn feature, làm mờ
   ranh giới trong đồ thị tĩnh. Vô hại lúc chạy, nhưng nên tách nếu sau này thêm tầng.
3. `src/features/physiognomy/voice/recorder.ts:241` vẫn còn lỗi kiểu `Float32Array`
   có từ trước Phase 1D. Không ảnh hưởng build.
