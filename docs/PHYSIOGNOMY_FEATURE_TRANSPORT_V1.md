# Feature Transport V1 — hợp đồng cuối

`transportVersion = "physiognomy-session-feature-v1"`

Audit dẫn tới bản này: [`PHYSIOGNOMY_FEATURE_TRANSPORT_AUDIT.md`](PHYSIOGNOMY_FEATURE_TRANSPORT_AUDIT.md)
Tầng feature: [`PHYSIOGNOMY_FEATURE_LAYER_V1.md`](PHYSIOGNOMY_FEATURE_LAYER_V1.md)

> Tầng này chỉ đổi **hình dạng** dữ liệu, không đổi **ý nghĩa**. Không Rule Engine,
> không Knowledge Base, không LLM, không một chữ luận giải nào.

---

## 1. Hai lớp biểu diễn

```text
PhysiognomyFeatureProfile          ← CHUẨN NỘI BỘ
  · đầy đủ, tự giải thích, có `note` cho người đọc
  · KHÔNG BAO GIỜ bị cắt gọt chỉ để payload nhỏ đi
        │
        │  toPhysiognomySessionFeaturePayload()   ← hàm thuần, deterministic
        ▼
PhysiognomySessionFeaturePayload   ← BIỂU DIỄN MẠNG
  · chỉ dữ liệu RIÊNG của người này
  · mọi thứ tĩnh suy lại được từ `featureSchemaVersion`
```

Tệp: `src/features/physiognomy/features/transport.ts`

---

## 2. Kích thước thật

| | Profile nội bộ | Payload | Cả body request | Giảm |
|---|---:|---:|---:|---:|
| **1 view** | 27 643 B | **5 655 B** | 5 759 B | 79.5% |
| **6 view** | 27 536 B | **5 601 B** | 5 705 B | 79.7% |

| Ngưỡng | Giá trị | Dư |
|---|---:|---:|
| `MAX_FEATURE_TRANSPORT_BYTES` | 12 288 B | 6 687 B (54%) |
| `MAX_BODY_BYTES` của API | 16 384 B | 10 679 B (65%) |

Đếm bằng `TextEncoder` — **byte UTF-8 thật**, không phải số ký tự.

6 view **không lớn hơn** 1 view: ở V1 chỉ một view cấp số, năm view còn lại chỉ đóng
góp `{present, quality, pose}`.

---

## 3. Hợp đồng payload

```ts
interface PhysiognomySessionFeaturePayload {
  transportVersion: "physiognomy-session-feature-v1";
  featureSchemaVersion: "physiognomy-feature-v1";
  sessionId: string;
  capturedAt: number;
  primaryView: ViewName | null;
  views: Record<ViewName, {
    present: boolean;
    quality: QualityGrade;
    pose: { yaw: number | null; pitch: number | null; roll: number | null };
  }>;
  quality: {
    overall: QualityGrade;
    faceDetected: boolean;
    poseValid: boolean;
    distanceValid: boolean;
    blur: number | null;
    brightness: number | null;
    coverage: number | null;
  };
  features: Array<{
    k: string;            // key
    v: number | null;     // value
    u: FeatureUnit;       // unit
    c: number;            // confidence
    s: FeatureStatus;     // status
    m: string;            // method
    w: ViewName | null;   // sourceView
    l: number[];          // sourceLandmarks
  }>;
}
```

Khoá một chữ cái không phải để "tối ưu cho vui": tên đầy đủ lặp 29 lần tốn ~1.4 KB.
Bảng nghĩa máy đọc được nằm ở `FIELD_MEANING` trong cùng tệp.

`features` **phẳng và khử trùng**: đúng **29** feature, mỗi khoá đúng một lần.

---

## 4. Trường bị loại khỏi transport

| Trường | Bytes tiết kiệm | Vì sao loại |
|---|---:|---|
| `note` (21 chuỗi, 30 chỗ) | ~7 758 | TĨNH — giống hệt mọi người, suy từ `featureSchemaVersion` |
| `twelvePalaces` (12 cung) | ~8 775 | TĨNH — toàn bộ `unsupported`, không một con số nào của người này |
| `notices` | ~695 | TĨNH |
| `unsupported[]` | nhỏ | suy được bằng cách lọc `s === "unsupported"` |
| `views[*].contributedFeatures` | ~1 000 | suy được từ `w` của từng feature |
| `geometry.face_shape_ratio` trùng | ~200 | profile nội bộ có ở hai nhóm; trên dây chỉ một |

**Không bao giờ có trên dây:** ảnh, video, âm thanh, 468 toạ độ landmark, cấu trúc thô
của MediaPipe (`faceLandmarks`, `facialTransformationMatrixes`, `faceBlendshapes`).

`l` (`sourceLandmarks`) chỉ là **chỉ số** `[193, 417, 48, 278]` — hằng số của model,
giống nhau ở mọi người, **không phải dữ liệu sinh trắc**. Toàn bộ chỉ tốn 283 B, nên
**không** dùng `landmarkSetId` (đo rồi: tiết kiệm ~1%, đổi lại thêm một bảng phải
version riêng).

---

## 5. Provenance được giữ thế nào

Tám trường, không được thiếu trường nào: `k v u c s m w l`.
Có test khoá: mọi feature phải có đúng 8 khoá này, không hơn không kém.

Chi phí provenance đo được: **1 799 B** trong 5 601 B (32%). Vẫn giữ, vì bỏ đi là mất
khả năng trả lời "rule này dựa trên feature nào, đo bằng công thức gì, từ góc nào" —
mục đích của cả Feature Layer.

**Kỷ luật ngữ nghĩa, ép ở cả hai đầu:**

- `s === "unsupported"` ⟺ `v === null`. Cả mapper lẫn parser đều từ chối trường hợp lệch.
- `v` không bao giờ là `0` thay cho "thiếu".
- `low_confidence` giữ nguyên `low_confidence` — **không** được nâng thành `measured`.

---

## 6. Failure semantics

Thu ảnh và trích feature là **hai việc khác nhau**. Trích hỏng không xoá công người
dùng đã bỏ ra để quay đủ 6 góc.

```text
6 bước mặt PASS + trích feature HỎNG
        → status = "complete"          (KHÔNG phải "failed")
        → featureStatus = "unavailable"
        → featureProfile = null
        → featureError = "<lý do cụ thể>"
```

| `featureStatus` | Khi nào |
|---|---|
| `"none"` | máy khách không gửi gì — client cũ, hoặc chưa tới bước đó. **Mặc định** |
| `"ok"` | có payload, đã qua kiểm |
| `"unavailable"` | máy khách báo trích hỏng, kèm lý do |

Mapper báo hỏng rõ ràng thay vì payload giả:

| Mã | Khi nào |
|---|---|
| `schema_mismatch` | profile không phải bản schema transport biết đọc |
| `duplicate_key` | cùng khoá cho hai giá trị khác nhau (lỗi tầng feature) |
| `no_measurement` | **không** feature nào có số — gửi đi chỉ làm máy tính tưởng đã đo được |
| `oversize` | vượt ngân sách. **KHÔNG cắt bớt feature cho vừa** |

**Chỉ 4 lỗi cũ mới làm phiên `failed`** (Phase 1C, không đổi): không kết nối được,
sai `writeToken`, phiên hết hạn, người dùng huỷ.

---

## 7. Versioning

```text
featureSchemaVersion : "physiognomy-feature-v1"           ← hình dạng FEATURE
transportVersion     : "physiognomy-session-feature-v1"   ← hình dạng WIRE
```

Đổi vì hai lý do khác nhau nên phải tăng độc lập.

| Trường hợp | Xử lý |
|---|---|
| `transportVersion` lạ | **400** `bad_transport_version` |
| `featureSchemaVersion` lạ | **400** `bad_schema_version` |

> **Lệch so với audit:** audit §6 đề xuất *nhận* schema lạ rồi đánh dấu `partial`.
> Bản implement **từ chối** cả hai, theo đúng yêu cầu ở §5 và ma trận test §8 của
> Phase 1D-2. Chặt hơn, và nới ra sau này dễ hơn siết vào.

---

## 8. Validate ở API

`POST { action: "complete", sessionId, writeToken, featureProfile? , featureError? }`

**WHITELIST** — trường lạ là **TỪ CHỐI**, không phải bỏ qua. Cố ý: nếu máy khách nhét
`imageBase64` hay `landmarks` vào, ta muốn biết ngay chứ không muốn nó trôi qua.

| Kiểm | Mã lỗi | HTTP |
|---|---|---|
| body > 16 KB | — | **413** (trước khi chạm kho) |
| không phải object | `not_object` | 400 |
| trường lạ (cấp cao, trong `views`, trong `quality`, trong feature) | `unknown_field` | 400 |
| `transportVersion` sai | `bad_transport_version` | 400 |
| `featureSchemaVersion` sai | `bad_schema_version` | 400 |
| `sessionId` khác phiên đang ghi | `session_mismatch` | 400 |
| khoá feature lặp | `duplicate_key` | 400 |
| khoá feature sai định dạng `^face\.[a-z0-9_]+\.[a-z0-9_]+$` | `bad_shape` | 400 |
| `unsupported` mà có giá trị, hoặc `null` mà status khác | `bad_shape` | 400 |
| `confidence` ngoài [0,1] · `sourceLandmarks` ngoài 0..467 · thiếu `method` | `bad_shape` | 400 |
| payload > 12 KB | `oversize` | 400 |
| sai `writeToken` | `bad_token` | **403** |

---

## 9. Tích hợp phiên

```text
điện thoại: 6 bước mặt → voice
        ↓  buildFeatureProfile()   (landmark đã có sẵn trong vòng lặp, không chụp lại)
        ↓  toPhysiognomySessionFeaturePayload()
POST complete { featureProfile }
        ↓  parse + validate
        ↓  completeSession()  →  MỘT lượt put KV (không thêm lượt nào)
KV: nt:sess:<id>   2 207 B → 7 430 B
        ↓  máy tính poll
publicView(): result.featureProfile   ← null cho tới khi complete
        ↓  stopPolling() ngay khi thấy complete
máy tính hiển thị tóm tắt KỸ THUẬT
```

**State machine KHÔNG đổi.** `waiting → connected → face_* → voice → complete` giữ
nguyên. Ba trường mới (`featureStatus`, `featureProfile`, `featureError`) đều **tuỳ
chọn** trong `SessionRecord`; bản ghi cũ trong KV đọc lên vẫn hợp lệ, `buildResult()`
lấy mặc định `"none" / null / null`.

Máy tính hiển thị: đếm `measured` / `low_confidence` / `unsupported` + góc cấp số.
**Không một chữ nào nói tốt/xấu.**

---

## 10. Ranh giới an toàn

| | |
|---|---|
| `writeToken` | không bao giờ lộ qua poll (đã có test) |
| PII | không có, và payload là whitelist nên không nhét thêm được |
| Ảnh / video / âm thanh | không bao giờ vào KV |
| Landmark thô | không bao giờ rời máy khách |
| URL | payload đi bằng POST body, không bao giờ qua query string |
| TTL | 15 phút, KV tự xoá |

Các tỉ lệ khuôn mặt **không định danh được một người** khi đứng riêng, nhưng là **một
dạng template khuôn mặt yếu**. Theo Nghị định 13/2023, dữ liệu sinh trắc dùng để nhận
dạng là dữ liệu cá nhân nhạy cảm. Vì vậy: giữ TTL 15 phút, **không** gắn với bất kỳ
định danh khách hàng nào, **không** lưu dài hạn khi chưa có đồng ý riêng.

---

## 11. Tương thích ngược

| Tình huống | Hành vi |
|---|---|
| Client Phase 1C (không gửi feature) | `complete` bình thường, `featureStatus = "none"` |
| Bản ghi KV ghi trước Phase 1D-2 | đọc lên hợp lệ, ba trường mới lấy mặc định |
| Máy tính cũ đọc `result` mới | ba trường mới là thêm, không đổi trường nào đang có |
| `featureProfile` là `null` lúc `complete` | máy tính hiển thị được, không nổ (đã có test) |

---

## 12. Giới hạn còn lại

1. **Ở V1, một lần quét thật thì HOẶC mọi feature có số, HOẶC không cái nào có.**
   `gradeQuality` đòi `poseValid`; pose thiếu → hạng `poor` → không view nào cấp số →
   mọi giá trị `null` → mapper trả `no_measurement`. Nên thực tế **chưa có payload nào
   mang feature `unsupported` lẫn với feature có số**. Hành vi giữ `unsupported` vẫn
   được kiểm bằng test trên profile dựng thẳng, để khi V2 có tình huống hỗn hợp thì
   đường đi đã đúng sẵn.
2. **Chưa test trên máy thật với camera.** Toàn bộ đường đi đã kiểm bằng unit test và
   bằng trình duyệt thật (payload 5 601 B → API → KV → máy tính hiển thị
   `7/29 measured · 22 low · 0 unsupported · front`), nhưng landmark đến từ mesh
   chuẩn chứ không từ khuôn mặt thật.
3. **`views[*].contributedFeatures` trong profile nội bộ có khoá lặp**
   (`face.geometry.face_shape_ratio` hai lần) vì nó được gom từ cả hai nhóm. Không
   ảnh hưởng transport (đã khử trùng), nhưng là một vết bẩn nhỏ của Phase 1D.
4. `src/features/physiognomy/voice/recorder.ts:241` vẫn có lỗi kiểu `Float32Array`
   **có từ trước Phase 1D**, không ảnh hưởng build. Ngoài phạm vi phase này.
