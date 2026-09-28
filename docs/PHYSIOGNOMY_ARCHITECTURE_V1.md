# Kiến trúc Nhân Tướng V1 — bộ khung đầu-cuối

> **Dựng khung trước, bằng chứng sau.** Toàn bộ đường đi từ cảm biến tới luận giải đã
> tồn tại và chạy được. Nhưng **hiện KHÔNG một feature nào đi tới được tầng luận giải**,
> và đó là trạng thái ĐÚNG — không phải lỗi, không phải phần chưa làm.

---

## 1. Sơ đồ

```text
CAMERA                     MediaPipe FaceLandmarker, chỉ trên máy khách
  ↓ 468 landmark (KHÔNG BAO GIỜ rời máy)
FEATURE LAYER              "đo được gì"          → measurementStatus
  ↓ PhysiognomyFeatureProfile (29 feature, đủ 8 trường provenance)
TRANSPORT                  ~5.6 KB, bỏ 60% văn bản tĩnh
  ↓ physiognomy-session-feature-v1
SESSION / KV               2.2 KB → 7.4 KB, TTL 15 phút
  ↓
MEASUREMENT CONTRACT       "đã kiểm chứng chưa"  → validationStatus
  ↓ FeatureReliability
ELIGIBILITY GATE           "đủ tư cách luận giải chưa"  ← MỘT nơi duy nhất
  ↓ EligibilityVerdict
RULE ENGINE                hàm thuần, chỉ nhận khoá feature
  ↓ RuleResult[]
EVIDENCE BUNDLE            chuỗi truy vết feature → luật → nguồn
  ↓
INTERPRETATION             chỉ gói lại, KHÔNG tự sinh kiến thức
  ↓
[QUÂN SƯ]                  chưa nối
```

## 2. Tệp

| Tầng | Tệp | Phiên bản |
|---|---|---|
| Hợp đồng đo | `src/features/physiognomy/measurement-contract/reliability.ts` | `physiognomy-reliability-v1` |
| Cổng tư cách | `src/features/physiognomy/measurement-contract/policy.ts` | `physiognomy-eligibility-v1` |
| Kho nguồn | `src/knowledge/physiognomy/source.ts` | `physiognomy-knowledge-v1` |
| Luật | `src/rules/physiognomy/rule.ts` | `physiognomy-rule-v1` |
| Engine | `src/rules/physiognomy/engine.ts` | `physiognomy-engine-v1` |
| Luận giải + adapter LLM | `src/interpretation/physiognomy/index.ts` | `physiognomy-interpretation-v1` |
| Pipeline | `src/features/physiognomy/pipeline.ts` | `physiognomy-pipeline-v1` |
| Báo cáo phương sai | `scripts/nhan-tuong-validate-features.mjs` | — |

## 3. Hợp đồng đo — hai câu hỏi tách riêng

```text
Feature Layer         "đã ĐO ĐƯỢC gì"           → measurementStatus
Measurement Contract  "đã ĐƯỢC KIỂM CHỨNG chưa" → validationStatus
```

Một feature có thể `measured` mà vẫn chưa được luận giải: đo được không có nghĩa là đã
chứng minh trên đủ người, đủ máy, đủ điều kiện.

### Thang bằng chứng

```text
synthetic → real_image → real_device → multi_person → multi_device → production_validated
```

**Fixture không bao giờ nâng được status.** Mesh chuẩn là thứ MediaPipe hồi quy về, nên
mọi feature đều "hoàn hảo" trên đó theo định nghĩa. Có test khoá điều này.

### `FeatureReliability`

`featureKey · measurementStatus · validationStatus · confidence · evidenceLevel ·
sampleCount · participantCount · deviceCount · distanceTested · poseTested ·
lightingTested · knownLimitations · lastValidatedAt · schemaVersion`

`measurementStatus` và `confidence` **lấy từ Feature Layer**, không chép tay — hai tầng
không bao giờ lệch nhau.

### Trạng thái hiện tại

| Nhóm | Số | evidenceLevel | validationStatus |
|---|---:|---|---|
| Ba trục tư thế | 3 | `real_image` | `provisional` |
| `interocular_distance`, `three_courts.middle` | 2 | `real_image` | `provisional` |
| Có bằng chứng ảnh thật khác | 8 | `real_image` | `unvalidated` |
| Chưa kiểm người thật | 16 | `synthetic` | `unvalidated` |

**0 feature ở mức `validated`.**

## 4. Cổng tư cách — một nơi duy nhất

`evaluateEligibility()` là hàm DUY NHẤT trả lời "được luận giải chưa". Cổng rải rác là
cách một hệ thống âm thầm nới lỏng chính nó.

**FAIL CLOSED.** Đủ *tất cả* mới qua:

| Điều kiện | Ngưỡng |
|---|---|
| `measurementStatus` | `measured` |
| `validationStatus` | `validated` |
| `evidenceLevel` | ≥ `multi_device` |
| người tham gia | ≥ 5 |
| loại máy | ≥ 2 |
| lượt quét | ≥ 15 |
| đã kiểm cự ly / tư thế / ánh sáng | cả ba |
| nguồn cổ thư đã xác minh | ≥ 1 |

Trả **đủ** lý do chứ không dừng ở lý do đầu tiên — để bảng chẩn đoán nói được vì sao.

## 5. Kho nguồn — CỐ Ý RỖNG

`KNOWLEDGE_SOURCES = {}`

Không nhập nguồn nào, vì chưa ai đối chiếu bản in thật. Nhập bừa tên sách, tác giả, số
chương hay câu trích do mô hình sinh ra sẽ tạo ra thứ nguy hiểm hơn cả việc không có
gì: **một chuỗi provenance trông như thật.**

Hệ quả có chủ đích: không luật nào có nguồn → không gì tới được tầng luận giải.

`KnowledgeSource` đòi: `sourceId · title · author · era · tradition · edition ·
locator · text · language · provenance · citation · verificationStatus`.
Nguồn chỉ dùng được khi `verified` **và** `locator` trỏ tới chương/mục/trang/đoạn cụ thể.

## 6. Luật

`PhysiognomyRule`: `ruleId · domain · featureRequirements · conditions · interpretation ·
sourceRefs · confidence · applicability · limitations · status`.

Luật **chỉ nhận khoá feature**. Không ảnh, không landmark, không phiên — có test quét
chuỗi để khoá.

Kho hiện có **một luật nháp** `THREE_COURTS_MIDDLE_001`: `min`/`max` đều `null`,
`sourceRefs` rỗng, `interpretation` rỗng, `status: "draft"`. Nó tồn tại để minh hoạ
schema và để test chứng minh cổng chặn được nó. **Ngưỡng cổ truyền phải đọc từ bản in,
không suy từ trí nhớ.**

## 7. Rule Engine

`evaluate({ features, eligibility, rules }) → RuleResult[]`

Thứ tự kiểm cố ý: **hình dạng luật → nguồn → feature**. Kiểm nguồn trước feature để một
luật không có provenance bị chặn ngay, kể cả khi phép đo hoàn hảo.

`matched` có **ba** giá trị, không phải hai:

| | Nghĩa |
|---|---|
| `null` | luật bị **bỏ qua** — thiếu điều kiện, chưa hề chạy |
| `false` | đã chạy và **không khớp** |
| `true` | đã chạy và khớp |

Phân biệt này quan trọng: "chưa xét" khác hẳn "đã xét và không đúng".

## 8. Bó bằng chứng và luận giải

```text
FeatureEvidence  →  RuleEvidence  →  SourceEvidence
   giá trị, method,     ruleId, matched,    sourceId, citation,
   sourceView, eligible  skipReasons        locator, verificationStatus
```

Thiếu một mắt xích → `interpretationEligible = false`.

`interpret()` chỉ **gói lại** thứ luật đã chứng minh. Câu chữ **chép** từ
`rule.interpretation` (vốn chép từ nguồn) — tầng này không viết lại chữ nào.

Hiện luôn trả `INSUFFICIENT_EVIDENCE`, kèm lý do theo từng feature.

## 9. Adapter LLM — chỉ khung

```ts
interface PhysiognomyExplanationProvider {
  explain(bundle: EvidenceBundle): Promise<{ok:true;text:string} | {ok:false;code:"INSUFFICIENT_EVIDENCE";reason:string}>;
}
```

Chữ ký ép ranh giới: đầu vào **chỉ có** `EvidenceBundle`. Không có đường nào để ảnh,
landmark, phiên hay Internet lọt vào.

Provider mặc định `REFUSING_PROVIDER` **từ chối mọi thứ** — để nếu ai quên cắm mô hình
thật thì kết quả là "không giải thích được", chứ không phải im lặng.

## 10. Báo cáo phương sai

`scripts/nhan-tuong-validate-features.mjs` tách phương sai theo từng nguồn thay vì nhìn
một con số phần trăm:

```text
withinPerson · betweenPerson · device · distance · pose · lighting
```

Cảnh báo quan trọng nhất: **`STABLE_BUT_NON_DISCRIMINATIVE`** — feature ổn định nhưng
phương sai giữa người ≈ 0 thì đo cũng vô dụng, nó không phân biệt được ai với ai.

Chạy trên 15 mẫu tổng hợp: **29/29 feature bị gắn cảnh báo này**, đúng như mong đợi vì
mọi mẫu dùng chung một fixture.

## 11. Bảng chẩn đoán (chỉ DEV)

Hiện sau khi phiên hoàn tất, chạy lại **đúng pipeline thật** trên payload vừa nhận:

```text
29 feature · 3 đo được · 0 đã kiểm chứng · 0 đủ tư cách luận giải

Feature                      Giá trị   Đo              Kiểm chứng    Tin   Luận giải  Vì sao
face.pose.yaw                0         measured        provisional   0.9   KHÔNG      validation_not_validated, evidence_level_too_low
face.three_courts.middle     0.4063    low_confidence  provisional   0.7   KHÔNG      measurement_not_measured, validation_not_validated

Luận giải: INSUFFICIENT_EVIDENCE — 1 luật xét, 1 bị bỏ qua, 0 khớp.
```

**0 dấu vết trong bản build production** — đã kiểm bằng grep `dist/`.

## 12. Ranh giới an toàn

| | |
|---|---|
| Ảnh / video / âm thanh | không vào KV, Rule Engine, Kho nguồn hay Luận giải |
| 468 landmark thô | không rời máy khách |
| `sourceLandmarks` trong bằng chứng | chỉ **chỉ số**, hằng số của model |
| Rule Engine | không `fetch`, không `import()`, không `canvas` — test quét chuỗi |
| Adapter LLM | không `fetch`, không `process.env` |

## 13. Blocker còn lại

1. **Không có dữ liệu người thật.** 15 mẫu đã thu đều dùng mesh chuẩn. Cần 5 người thật
   × 3 lượt × ≥2 máy.
2. **Kho nguồn rỗng.** Cần bản in/scan thật của cổ thư, điền `locator` tới chương–trang.
   Không có nguồn thì kể cả feature hoàn hảo cũng không luận giải được — theo thiết kế.
3. **Không luật nào chạy được.** Ngưỡng cổ truyền phải lấy từ nguồn ở mục 2.
4. **`three_courts.middle` là ứng viên mạnh nhất** (2.90% giữa hai lần chụp hợp lệ)
   nhưng mẫu mới có 1 người / 1 máy.
5. Chưa nối Quân Sư, chưa cắm mô hình giải thích.

## 14. Những gì tầng này KHÔNG làm

Không Rule Engine tự sinh luật · không Knowledge Base bịa · không LLM tự luận · không
kết luận tính cách, sức khoẻ, tài lộc, vận mệnh, tướng tốt/xấu · không dùng trục z để
suy độ đầy đặn · không thêm cung mới · không nâng status bằng fixture.
