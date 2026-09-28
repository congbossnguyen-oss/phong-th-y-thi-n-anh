# Phase 1D-2 — Audit: Feature Profile → Session

> **✅ ĐÃ IMPLEMENT.** Hợp đồng cuối cùng và số đo thực tế nằm ở
> [`PHYSIOGNOMY_FEATURE_TRANSPORT_V1.md`](PHYSIOGNOMY_FEATURE_TRANSPORT_V1.md).
>
> Sai khác duy nhất so với audit này: mục 6 đề xuất *nhận* `featureSchemaVersion` lạ
> rồi đánh dấu `partial`; bản implement **từ chối** (400 `bad_schema_version`) theo
> đúng yêu cầu của phase triển khai. Chặt hơn, nới ra sau dễ hơn siết vào.
>
> Số đo cuối: payload **5 601 B** (6 view) / **5 655 B** (1 view), ngân sách 12 KB,
> giới hạn API 16 KB. Bản ghi KV 2 207 B → 7 430 B.

**Chỉ audit. Không sửa implementation, không đổi session protocol, không đổi API/UI.**
Mọi con số dưới đây đo bằng `Buffer.byteLength(JSON.stringify(x), "utf8")` trên fixture
thật (`tests/fixtures/canonical-face.json`), không ước lượng.

---

## 0. Phát hiện quan trọng nhất

> **Giới hạn chặn không phải KV mà là `MAX_BODY_BYTES = 16 * 1024` ở
> `src/pages/api/nhan-tuong/session.ts:46`.**
>
> Profile đầy đủ nặng **27 643 bytes**. Gửi nguyên qua API hiện tại sẽ bị **từ chối
> 413** ngay ở dòng 148, trước cả khi chạm KV. Đây là lý do bắt buộc phải có transport
> type riêng — không phải chuyện tiết kiệm băng thông.

---

## 1. Schema thực tế (đọc từ source, không từ tài liệu)

| Chỉ số | Giá trị |
|---|---|
| `MeasuredFeature` trong profile | **30** (có 1 trùng lặp → 29 khoá khác nhau) |
| Object node | 502 |
| Độ sâu tối đa | 5 |
| Tổng index trong mọi `sourceLandmarks` | **69** |
| Tập `sourceLandmarks` khác nhau | 24 |
| Chuỗi `note` khác nhau | 21 |

### Trùng lặp tìm được

`face.geometry.face_shape_ratio` xuất hiện **2 lần**: một ở `geometry`, một ở
`faceShape`. Cùng một object, cùng giá trị. Đây là chủ ý ở Phase 1D (dáng mặt muốn có
tỉ lệ cao/rộng bên cạnh 3 feature kia) nhưng với wire protocol thì là dữ liệu thừa —
transport nên phẳng hoá theo `key` và khử trùng.

### Field chỉ phục vụ đọc/gỡ lỗi

| Field | Bytes | Tính chất |
|---|---|---|
| `note` (21 chuỗi, 30 chỗ) | **7 758** | **TĨNH** — giống hệt nhau với mọi người |
| `twelvePalaces` (12 cung) | **8 775** | **TĨNH** — toàn bộ `unsupported`, không một con số nào của người này |
| `notices` | 695 | **TĨNH** |
| `method` | 1 214 | tĩnh theo khoá, nhưng là provenance |
| `sourceLandmarks` | **283** | tĩnh theo khoá, nhưng là provenance |
| `views` | 1 453 | **động** — chất lượng + pose từng góc |

**16 533 / 27 643 bytes (60%) là văn bản tĩnh**, suy lại được từ `schemaVersion`.

### Field derive lại được

- `unsupported[]` — suy được bằng cách lọc `status === "unsupported"`
- `geometry.face_shape_ratio` — trùng `faceShape.face_shape_ratio`
- `twelvePalaces` toàn bộ — hằng số của `physiognomy-feature-v1`
- `note`, `notices` — hằng số của `physiognomy-feature-v1`
- `views[*].contributedFeatures` — suy được từ `sourceView` của từng feature

---

## 2. Serialization

```text
FULL PROFILE:        27 643 bytes   (1 view)
                     27 536 bytes   (6 view)
PRODUCTION PROFILE:  12 145 bytes   (bỏ note + notices)
MINIMAL PROFILE:      5 866 bytes   (bỏ thêm method, sourceLandmarks, twelvePalaces, views)
```

Chi tiết theo khối (1 view):

| Khối | Bytes | % |
|---|---:|---:|
| `twelvePalaces` | 8 775 | 32% |
| `note` (tổng) | 7 758 | 28% |
| `views` | 1 453 | 5% |
| `method` (tổng) | 1 214 | 4% |
| `notices` | 695 | 3% |
| `sourceLandmarks` (tổng) | **283** | **1%** |
| còn lại (giá trị, status, confidence, quality…) | ~7 465 | 27% |

### Kích thước KHÔNG tăng theo số view

**6 view (27 536 B) còn nhỏ hơn 1 view (27 643 B).**

Không phải sai số đo. Ở V1 chỉ **một** view cấp số (`front`, dự phòng `near`); năm view
còn lại chỉ đóng góp `{present, quality, pose}` ≈ 60 bytes mỗi cái. Bản 1 view lại
*to hơn* vì `quality.reasons` phải ghi `"Thiếu view: left, right, near, pitchDown, pitchUp"`.

→ **Không cần lo chuyện nhân 6.** Chi phí là hằng số.

---

## 3. Transport payload đề xuất

```text
PhysiognomySessionFeaturePayload   →   5 223 bytes
```

Còn thừa **11 161 bytes** trong hạn mức 16 KB của API.

```ts
interface PhysiognomySessionFeaturePayload {
  transportVersion: "physiognomy-session-feature-v1";
  featureSchemaVersion: "physiognomy-feature-v1";   // bản feature nào sinh ra payload này
  sessionId: string;
  capturedAt: number;

  /** View nào cấp số. Suy ra được nhưng rẻ và desktop cần hiển thị. */
  primaryView: ViewName;
  /** Chất lượng từng góc; view không thu được thì null. */
  viewQuality: Record<ViewName, QualityGrade | null>;

  quality: {
    overall: QualityGrade;
    faceDetected: boolean;
    poseValid: boolean;
    distanceValid: boolean;
    blur: number | null;
    brightness: number | null;
    coverage: number | null;
  };

  /** PHẲNG, khử trùng theo `k`. Khoá viết tắt để tiết kiệm mà vẫn đủ provenance. */
  features: Array<{
    k: string;              // key            "face.nose.bridge_ratio"
    v: number | null;       // value
    u: FeatureUnit;         // unit
    c: number;              // confidence
    s: FeatureStatus;       // status
    m: string;              // method
    w: ViewName | null;     // source view
    l: number[];            // source landmarks
  }>;
}
```

**KHÔNG dùng `PhysiognomyFeatureProfile` làm wire protocol.** Lý do đo được: 60% của nó
là văn bản tĩnh; và bản thân nó vượt giới hạn body của API.

### Raw landmarks transport: **NO**

Không gửi 468 toạ độ landmark. Lý do, theo thứ tự quan trọng:

1. **Sinh trắc thô.** 468 toạ độ 3D là một face template dựng lại được — thuộc loại dữ
   liệu không được đưa vào phiên POC (mục 8).
2. **Kích thước.** 468 điểm × 3 số ≈ 22 KB/view, 6 view ≈ 132 KB → vượt xa 16 KB.
3. **Không cần.** Rule Engine phase sau đọc `key`/`value`/`status`, **không được** đọc
   landmark thô (nguyên tắc đã chốt ở Phase 1D §10).

`sourceLandmarks` trong payload chỉ là **chỉ số** (`[193, 417, 48, 278]`) — hằng số của
model, giống nhau với mọi người, **không phải dữ liệu sinh trắc**.

### Về ý tưởng `landmarkSetId`

**Đề xuất: KHÔNG làm.** Đo thật: toàn bộ `sourceLandmarks` chỉ tốn **283 bytes = 1%**
profile. Gộp thành bảng tra sẽ tiết kiệm khoảng 150–200 bytes, đổi lại thêm một bảng
phải version riêng và một bước dereference cho người đọc JSON. Không đáng.

Phần provenance đắt hơn là `method` (1 214 B). Tổng chi phí provenance trong transport
đo được là **1 799 bytes** (5 223 → 3 424 nếu bỏ `m` + `l`) — **34% payload**. Vẫn nên
giữ: bỏ provenance thì mất luôn khả năng trả lời "rule này dựa trên feature nào, đo
bằng công thức gì", mà đó là mục đích của cả Feature Layer.

---

## 4. Điểm tích hợp

Trạng thái phiên hiện tại: `waiting → connected → face_front … face_pitch_up → voice →
complete` (`session/types.ts:21-32`).

### Đề xuất: gắn vào chính hành động `complete` đang có

```text
6 bước mặt PASS  →  voice PASS
        ↓
[trên điện thoại] feature extraction   ← buildFeatureProfile(), hàm thuần, có sẵn landmark
        ↓
[trên điện thoại] feature validation   ← kiểm version + kích thước + khoá lạ
        ↓
toTransportPayload(profile)            ← 5 223 bytes
        ↓
POST { action:"complete", sessionId, writeToken, featureProfile }
        ↓
status = complete  →  desktop nhận ở lần poll cuối
```

Bốn lý do chọn điểm này, đều kiểm được từ source:

1. **Không thêm lượt ghi KV.** `completeSession()` đã `store.put()` một lần
   (`store.ts:322`). Nhét payload vào cùng lượt đó là 0 chi phí thêm. KV giới hạn
   1 ghi/giây trên mỗi khoá; phiên hiện đã ghi 8 lần (6 bước + voice + complete) —
   không nên thêm lần thứ 9.
2. **Không phình mỗi lần poll.** `publicView()` trả `result` là `null` cho tới khi
   `status === "complete"` (`types.ts:157`). Payload chỉ xuất hiện ở lần poll cuối.
3. **Giao đúng một lần.** Desktop `stopPolling()` ngay khi thấy `complete`
   (`NhanTuongDesktop.astro:377-378`). Không có chuyện tải lại 5 KB mỗi 1.5 giây.
4. **Trích feature phải ở máy khách.** Chỉ máy khách có 468 landmark. Server không có
   và không nên có (mục 8).

### Kích thước sau tích hợp

| | Hiện tại | Sau khi thêm |
|---|---:|---:|
| `SessionRecord` trong KV | 2 207 B | **7 430 B** |
| `publicView` mỗi lần poll (chưa complete) | 2 506 B | **2 506 B** (không đổi) |
| `publicView` ở lần poll cuối | 2 506 B | **7 729 B** (một lần) |

### Phương án đã cân nhắc và loại

- **Action `feature` riêng** — thêm một lượt ghi KV và một round-trip, đổi lại không
  được gì. Loại.
- **Trích feature ở server** — server không có landmark, và đưa landmark lên server là
  đưa dữ liệu sinh trắc thô vào phiên. Loại.
- **Gửi kèm từng bước** — mỗi bước một profile riêng là 6 × 5 KB, mà 5 view trong số đó
  không cấp số nào. Loại.

---

## 5. Failure semantics

### Đề xuất: **feature extraction hỏng KHÔNG làm phiên `failed`**

Thu ảnh và trích feature là hai việc khác nhau. 6 snapshot đã thu được vẫn có giá trị
nguyên vẹn dù bước trích có hỏng — và người dùng đã bỏ công quay đủ 6 góc.

```text
face capture PASS + feature extraction FAIL
        → status = complete
        → featureProfile = null
        → featureStatus = "unavailable" + featureError = "<lý do>"
```

Đề xuất thêm một field cấp phiên (chưa implement):

```ts
featureStatus: "ok" | "partial" | "unavailable";
```

| Giá trị | Khi nào | Phiên |
|---|---|---|
| `ok` | có payload, mọi feature đúng schema | `complete` |
| `partial` | có payload nhưng `quality.overall` ≤ `usable`, hoặc view chính diện thiếu (phải lùi về `near`) | `complete` |
| `unavailable` | trích lỗi, payload sai version, hoặc quá cỡ | `complete` |

**Chỉ những lỗi sau mới được làm phiên `failed`** (đều đã có ở Phase 1C, không đổi):
không kết nối được, sai `writeToken`, phiên hết hạn, người dùng huỷ.

Lý do: `failed` hiện có nghĩa "không thu được dữ liệu". Đổi nghĩa nó thành "thu được
nhưng không tính ra số" sẽ làm desktop báo sai cho khách, và phá ngữ nghĩa Phase 1C
đang PASS.

---

## 6. Versioning — hai version tách riêng

```text
featureSchemaVersion : "physiognomy-feature-v1"           ← hình dạng của FEATURE
transportVersion     : "physiognomy-session-feature-v1"   ← hình dạng của WIRE
```

Hai thứ đổi vì hai lý do khác nhau và phải đổi độc lập:

- Thêm một feature mới, đổi công thức, đổi status → **feature schema** tăng.
- Đổi cách nén, đổi tên khoá viết tắt, đổi cấu trúc payload → **transport** tăng.

Quy tắc kiểm ở server đề xuất:

| Trường hợp | Xử lý |
|---|---|
| `transportVersion` lạ | **REJECT 400** — server không đoán được cách đọc |
| `featureSchemaVersion` lạ nhưng transport đúng | **NHẬN**, lưu nguyên, đánh dấu `featureStatus = "partial"` — số vẫn đọc được vì cấu trúc `features[]` là phẳng |
| thiếu cả hai | **REJECT 400** |

---

## 7. Cloudflare KV

**Phù hợp, không cần migration.**

| Hạn mức KV | Giá trị | Sau tích hợp | Tỉ lệ dùng |
|---|---|---|---|
| Kích thước value | 25 MiB | 7 430 B | **0.03%** |
| Độ dài key | 512 B | `nt:sess:M6ZQGDKGTB` = 18 B | 3.5% |
| Ghi / giây / key | 1 | 8 lần, cách nhau theo thao tác người | an toàn |
| TTL tối thiểu | 60 s | 900 s | an toàn |

Không cần Durable Object, không cần DB, không đổi binding. `KvSessionStore.put()`
(`store.ts:108-112`) giữ nguyên.

**Một điểm cần lưu ý (không phải chặn):** KV là *eventually consistent* giữa các vùng.
Phiên hiện đã sống với điều này (mobile ghi, desktop đọc, đã PASS trên máy thật), và
payload lớn hơn không làm thay đổi tính chất đó. Nhưng nếu lần poll cuối rơi vào cửa sổ
chưa đồng bộ, desktop sẽ thấy `complete` mà `featureProfile` chưa tới — nên desktop
**phải chịu được** `featureProfile == null` ở trạng thái `complete`, đúng như ngữ nghĩa
`unavailable` ở mục 5.

---

## 8. Security

| Mục | Hiện trạng | Sau tích hợp |
|---|---|---|
| Session token | `writeToken` 24 ký tự, `crypto.getRandomValues`, cấp một lần ở `connect`, connect lần hai trả **409** | không đổi |
| `writeToken` lộ qua poll | **Không** — `publicView()` cố tình không trả (`types.ts:135`) | không đổi |
| PII | **Không có** — không tên, ngày sinh, số điện thoại | payload **không được** thêm PII |
| Ảnh/video khuôn mặt | **Không** — không có `FormData`/`blob`/`arrayBuffer` trong API | vẫn không |
| Audio blob | **Không** vào KV — chỉ `{passed, durationMs, mimeType, sampleRate, hasAudio}` | vẫn không |
| Landmark thô | **Không** | **vẫn không** — chỉ chỉ số, xem mục 3 |
| Lộ qua URL | `sessionId` nằm trong URL của QR | không đổi — payload đi bằng **POST body**, không bao giờ qua query string |
| Ghi log | Không có `console.log` nào trong API/store | giữ nguyên |
| TTL | 15 phút, KV tự xoá | giữ nguyên |

### Một rủi ro phải nói thẳng

Các tỉ lệ khuôn mặt **không định danh được một người** khi đứng riêng, nhưng chúng là
**một dạng template khuôn mặt yếu**. Theo Nghị định 13/2023 về bảo vệ dữ liệu cá nhân,
dữ liệu sinh trắc học dùng để nhận dạng là dữ liệu cá nhân nhạy cảm.

Khuyến nghị cho phase sau, **không phải thay đổi bây giờ**:

- Giữ nguyên TTL 15 phút và KV tự xoá. **Không** chuyển sang lưu dài hạn khi chưa có
  đồng ý riêng của khách.
- **Không** gắn payload với bất kỳ định danh khách hàng nào (email, SĐT, mã đơn).
- Nếu sau này cần lưu lâu, phải là quyết định có văn bản đồng ý, không phải hệ quả kỹ thuật.

---

## 9. Test matrix cho phase tích hợp (chưa viết ở task này)

| # | Test | Kỳ vọng |
|---|---|---|
| 1 | Feature extraction từ 6 quan sát | PASS — đã có 82 test ở Phase 1D |
| 2 | `toTransportPayload()` giữ đủ 8 field provenance | PASS |
| 3 | Kích thước payload | **< 8 KB**, cảnh báo ở 12 KB, REJECT ở 16 KB |
| 4 | Payload khử trùng `face_shape_ratio` | 29 feature, không phải 30 |
| 5 | `complete` **không** kèm profile | PASS — `featureStatus = "unavailable"`, phiên vẫn `complete` |
| 6 | `complete` **có** profile | PASS — `featureStatus = "ok"`, desktop nhận ở poll cuối |
| 7 | Profile sai cấu trúc (thiếu `features`, `k` không phải chuỗi) | **REJECT 400** |
| 8 | Payload quá cỡ (> 16 KB) | **REJECT 413** trước khi chạm KV |
| 9 | `transportVersion` lạ | **REJECT 400** |
| 10 | `featureSchemaVersion` lạ, transport đúng | NHẬN + `featureStatus = "partial"` |
| 11 | Cross-session: phiên A gửi profile bằng token phiên B | **REJECT 403** |
| 12 | Ghi profile hai lần vào cùng phiên | **REJECT 409** (phiên đã `complete`) |
| 13 | Khoá lạ trong payload (`forehead_fullness`) | **BỊ LOẠI** — `parseSnapshot()` đã có pattern whitelist, làm tương tự |
| 14 | `featureProfile == null` lúc `complete` | Desktop hiển thị được, không nổ |
| 15 | Không có feature nào chứa `fullness`/`depth` | PASS |

---

## 10. Cần implement ở phase sau

Theo thứ tự phụ thuộc:

1. `features/transport.ts` — `PhysiognomySessionFeaturePayload` + `toTransportPayload()`
   + `parseTransportPayload()` (whitelist khoá, giống `parseSnapshot()` đang có).
2. Nối `buildFeatureProfile()` vào `NhanTuongMobile.astro`: gom `ViewObservation` ở mỗi
   bước (landmark đã có sẵn trong vòng lặp, **không** phải chụp lại).
3. Mở rộng action `complete` ở API: nhận `featureProfile`, kiểm version + cỡ + whitelist.
4. Thêm `featureStatus` + `featureProfile` vào `SessionRecord` và `PhysiognomySessionResult`.
5. Desktop hiển thị: số feature đo được / low_confidence / unsupported. **Vẫn không
   luận giải.**
6. 15 test ở mục 9.

Việc 2–5 **đổi session protocol**, nên phải là một phase riêng được duyệt — không làm
kèm ở đây.
