# Feature Layer Nhân Tướng — V1

`schemaVersion = "physiognomy-feature-v1"`

> **Tầng này KHÔNG phải Rule Engine và KHÔNG chứa kết luận nhân tướng.**
>
> Nó chỉ trả lời một câu: *camera đã quan sát/đo được đặc điểm gì?*
> Nó không trả lời: *đặc điểm đó tốt/xấu/phúc/họa thế nào?*
>
> Không có Knowledge Base, không gọi LLM, không một dòng luận giải nào.

---

## 1. Vị trí trong pipeline

```text
Camera
  ↓
MediaPipe FaceLandmarker (468 điểm + ma trận tư thế)
  ↓
Raw Landmarks + Pose + Quality          ← Phase 1B/1C đã có
  ↓
Feature Extraction                      ← PHASE 1D (tài liệu này)
  ↓
PhysiognomyFeatureProfile
  ↓
[Phase sau] Knowledge / Rule Engine / Interpretation   ← CHƯA XÂY
```

### Mã nguồn

| Tệp | Vai trò |
|---|---|
| `src/features/physiognomy/features/landmarks.ts` | Hợp đồng landmark: tên giải phẫu → index MediaPipe. **Một nơi duy nhất.** |
| `src/features/physiognomy/features/schema.ts` | Kiểu dữ liệu + version + cảnh báo cấp profile |
| `src/features/physiognomy/features/extract.ts` | Hàm thuần `buildFeatureProfile()` |
| `tests/nhan-tuong-feature-layer.test.ts` | 82 test |
| `tests/fixtures/canonical-face.json` | Golden fixture (mesh chuẩn của MediaPipe) |

### Đầu vào

```ts
buildFeatureProfile({
  sessionId, capturedAt,
  observations: ViewObservation[],   // mỗi phần tử = một bước của Phase 1C
})
```

`ViewObservation` = `{ step, landmarks, frameWidth, frameHeight, pose, quality }` — đúng
những thứ tầng camera đã có sẵn trên máy khách.

> **Giới hạn nối ghép, phải nói rõ:** protocol phiên Phase 1C hiện chỉ mang **6 con số**
> hình học mỗi bước (`faceWidth`, `faceHeight`, `faceShapeRatio`, 3 đình), **không mang
> 468 landmark**. Vì vậy Feature Layer chạy được **trên máy khách** (nơi có landmark),
> còn muốn dựng profile **ở server** thì phải mở rộng payload — việc đó **KHÔNG làm ở
> Phase 1D** vì yêu cầu ghi rõ không đổi session protocol.

---

## 2. Taxonomy

| Nhóm | Trạng thái V1 |
|---|---|
| `geometry` | 3 feature — 2 measured (mốc), 1 low_confidence |
| `faceShape` | 4 feature — tất cả low_confidence |
| `threeCourts` | 3 feature — 1 measured, 2 low_confidence |
| `fiveOfficials.eyes` | 7 feature — 1 measured, 6 low_confidence |
| `fiveOfficials.eyebrows` | 5 feature — tất cả low_confidence |
| `fiveOfficials.nose` | 3 feature — tất cả low_confidence |
| `fiveOfficials.mouth` | 2 feature — tất cả low_confidence |
| `fiveOfficials.ears` | **unsupported** |
| `twelvePalaces` | 12 cung — **measurement unsupported toàn bộ** |
| `pose` | 3 feature — measured (là số đo tư thế, không phải đặc điểm) |
| `quality` | 5 mức |
| `unsupported` | danh sách khoá |

---

## 3. Công thức đo

Mọi khoảng cách là **euclidean 2D theo pixel** rồi chia cho một mẫu số đã khai báo.
Không dùng hiệu toạ độ một trục (không bất biến với nghiêng đầu). Không có ngưỡng
pixel tuyệt đối nào.

| Khoá máy | Công thức | Mẫu số |
|---|---|---|
| `face.geometry.face_width` | `d(234,454) / frameWidth` | khung hình |
| `face.geometry.face_height` | `d(10,152) / frameHeight` | khung hình |
| `face.geometry.face_shape_ratio` | `d(10,152) / d(234,454)` | faceWidth |
| `face.shape.jaw_to_face_width` | `d(172,397) / faceWidth` | faceWidth |
| `face.shape.cheek_to_face_width` | `d(116,345) / faceWidth` | faceWidth |
| `face.shape.chin_to_face_height` | `d(17,152) / faceHeight` | faceHeight |
| `face.eyes.interocular_distance` | `d(133,362) / faceWidth` | faceWidth |
| `face.eyes.left_width` / `right_width` | `d(33,133)` / `d(362,263)` ÷ faceWidth | faceWidth |
| `face.eyes.left_height` / `right_height` | `d(159,145)` / `d(386,374)` ÷ faceWidth | faceWidth |
| `face.eyes.left_tilt` / `right_tilt` | góc có dấu của (khoé ngoài → khoé trong) so với **trục liên mắt** | trục liên mắt |
| `face.eyebrows.left_length` / `right_length` | `d(46,55)` / `d(276,285)` ÷ faceWidth | faceWidth |
| `face.eyebrows.left_height` / `right_height` | `d(105,133)` / `d(334,362)` ÷ faceHeight | faceHeight |
| `face.eyebrows.spacing` | `d(55,285) / faceWidth` | faceWidth |
| `face.nose.length` | `d(168,1) / faceHeight` | faceHeight |
| `face.nose.width` | `d(48,278) / faceWidth` | faceWidth |
| `face.nose.bridge_ratio` | `d(193,417) / d(48,278)` | **noseWidth** |
| `face.mouth.width` | `d(61,291) / faceWidth` | faceWidth |
| `face.mouth.height` | `d(0,17) / faceWidth` | faceWidth |
| `face.three_courts.{upper,middle,lower}` | chiếu lên **trục dọc của chính đầu** rồi chia tổng | tổng ba đình |

### Độ nghiêng khe mắt — vì sao bất biến với roll

Đo **so với trục liên mắt** (133 → 362) chứ không so với trục ảnh. Nghiêng đầu làm
cả khe mắt lẫn trục liên mắt cùng quay, nên tỉ số không đổi. Đã khoá bằng test ở
±10° và ±25°. Mắt trái được soi gương theo trục để hai bên so sánh được với nhau —
nếu không, khuôn mặt đối xứng sẽ ra hai dấu ngược nhau. Dương = khoé **ngoài** cao hơn.

### Tam Đình — công thức trục đầu 3D

Chiếu các mốc lên vector `đỉnh lưới → đỉnh cằm` trong không gian 3D thay vì lấy hiệu
toạ độ y của ảnh. Bằng chứng, cùng một người qua pitch +19° → −31° (Phase 1B-2):

| Công thức | Trung đình qua 3 tư thế | Biên độ |
|---|---|---|
| hiệu toạ độ ảnh | 0.4303 → 0.4924 → 0.3757 | 0.1168 |
| **trục đầu 3D** | 0.4260 → 0.4323 → 0.4320 | **0.0063** (tốt hơn 18.5×) |

---

## 4. Nguồn landmark

Toàn bộ index khai ở **một nơi duy nhất**: `features/landmarks.ts`.

```text
feature  →  tên giải phẫu (LM.eyeLInner)  →  index MediaPipe (133)
```

`extract.ts` **không được** viết index trần — có test khoá lại (`lm[133]` là test đỏ).
Đổi model hoặc sửa ánh xạ thì chỉ sửa một tệp.

Mọi index đã đối chiếu toạ độ trên `canonical_face_model.obj` (+X phải, +Y lên, +Z
trước) và toạ độ thật được ghi trong chú thích để kiểm lại mà không phải mở model.

---

## 5. Chuẩn hoá và phối cảnh

Mọi feature **bắt buộc khai báo mẫu số** (`normalizedBy`). Không feature nào tự chọn.

**Chuẩn hoá là CẦN nhưng KHÔNG ĐỦ.** Các bộ phận nằm ở những mặt phẳng độ sâu khác
nhau, nên tỉ số của hai đoạn ở hai mặt phẳng vẫn đổi theo khoảng cách chụp.

Thước đo khách quan: `depthMismatch` = |z trung bình của cặp điểm − z của mặt phẳng
chuẩn hoá| ÷ bề ngang mặt, đo trên canonical mesh.

| Feature | depthMismatch | Ghi chú |
|---|---|---|
| `chin_to_face_height` | 0.034 | thấp |
| `eyebrow_height` | 0.017 | thấp nhất |
| `nose.bridge_ratio` | **0.062** | tự chuẩn hoá trong cùng cái mũi |
| `jaw_to_face_width` | 0.118 | thấp |
| `nose.length` | 0.129 | |
| `cheek_to_face_width` | 0.269 | trung bình |
| `eye_width` | 0.385 | cao |
| `interocular_distance` | 0.404 | cao **về lý thuyết**, nhưng đo thật chỉ lệch 4.99% |
| `mouth_width` | 0.438 | cao |
| `nose.width` | 0.538 | cao nhất |

Mốc chuẩn hoá bề ngang mặt (234/454) nằm **lùi về sau** tận `z = −2.44`, gần vành tai,
trong khi mắt/mũi/miệng nhô ra trước `z = +3.8…+5.9`. Đó là lý do phần lớn tỉ lệ có
depthMismatch lớn.

---

## 6. Confidence và cách gán status

**Thứ tự ưu tiên, không đảo:**

1. Nếu Phase 1B-2 đã **ĐO** sai số trên ảnh thật của người thật → dùng số đó.
   Sai lệch ≤ 5% qua 6 tư thế → `measured`. Lớn hơn → `low_confidence`.
2. Nếu **chưa** đo sai số thật → `low_confidence`. **Không** suy ra `measured` từ lý
   thuyết. depthMismatch thấp *không đủ* để phong là đo được.
3. Cảm biến không thấy được → `unsupported`.

`confidence` = 1 − sai số đo thật, hoặc **0.50** khi chưa có số đo thật ("có số, chưa
biết tin được bao nhiêu").

| Feature | Sai số thật (Phase 1B-2) | confidence | status |
|---|---|---|---|
| `interocular_distance` | 4.99% (pitch) | 0.95 | **measured** |
| `three_courts.middle` | biên độ 0.0063 | 0.94 | **measured** |
| `nose.width` | 15.3% (yaw 28°) | 0.85 | low_confidence |
| `face_shape_ratio` | 17.6% (pitch) | 0.82 | low_confidence |
| `mouth.width` | 20.6% (pitch −31°) | 0.79 | low_confidence |
| `three_courts.lower` | biên độ 0.072 | 0.60 | low_confidence |
| `nose.length` | 44.1% (pitch −31°) | 0.56 | low_confidence |
| `three_courts.upper` | lệch hệ thống 46% | 0.25 | low_confidence |
| mọi feature còn lại | *chưa đo* | 0.35–0.50 | low_confidence |

---

## 7. Unsupported — không đoán

### Tai (耳)

Lưới 468 điểm của MediaPipe FaceLandmarker **không có landmark nào trên vành tai**.
Đây là giới hạn của model, **không phải phần chưa làm**. Trả `status = "unsupported"`,
không có field `value`.

### Thập Nhị Cung — cả 12 cung

`measurementStatus = "unsupported"` cho **toàn bộ 12 cung**, kể cả cung có bản đồ đúng.

**Hai trạng thái tách riêng, cố ý:**

| | Ý nghĩa | Nguồn kiểm |
|---|---|---|
| `mappingStatus` | vùng này có đúng về giải phẫu không | canonical mesh: z-spread ≤ 0.20, đường kính ≤ 0.45, 0 điểm contour, ≥ 4 điểm |
| `measurementStatus` | có đo được thứ cung này CẦN không | ảnh thật Phase 1B-2 |

11/12 cung `mappingStatus = "verified"`. Riêng **Nô Bộc (奴僕宮)** là `"unknown"`:
z-spread 0.3493 vượt ngưỡng 0.20 kể cả sau khi tách trái/phải — viền hàm cong thật
theo độ sâu, từ trước cằm ra tới góc hàm. Nô Bộc có `region = null` và **không cố đo**.

Bản đồ đúng **không** làm cho phép đo đáng tin. Thứ 12 cung cần là độ đầy đặn/lõm theo
trục z, mà:

- **0/12** cung đạt S/N ≥ 3 trên ảnh thật
- **9/12** cung **ĐỔI DẤU** khi chỉ đổi tư thế
- cung Phụ Mẫu đổi dấu khi chỉ cắt **3%** viền ảnh
- hai người xa lạ có profile z tương quan **r = 0.945–0.985** → trục z chủ yếu phản ánh
  *template*, không phải người này

### Độ đầy đặn / độ sâu — TUYỆT ĐỐI KHÔNG CÓ

Schema **không có** và **sẽ không có**: `foreheadFullness`, `cheekFullness`,
`noseFullness`, `palaceFullness`, hay bất kỳ tên thay thế nào. Có test quét mọi khoá
trong profile, cấm các chuỗi `fullness`, `depth`, `concave`, `convex`, `protrusion`,
`sunken`, `prominence`.

Dữ liệu z thô, nếu cần cho nghiên cứu nội bộ, nằm riêng ở `ExperimentalDepth`
(`src/features/physiognomy/types/index.ts`) với `enabled = false` mặc định, và **không
được** phơi thành physiognomy feature.

---

## 8. Dùng view nào cho việc gì

Phase 1C thu 6 góc. **KHÔNG trung bình mù tất cả** — mỗi góc méo theo một kiểu, cộng
lại chỉ ra một con số không thuộc về góc nào.

| View | Vai trò ở V1 |
|---|---|
| `front` | **nguồn chính** của toàn bộ feature hình học |
| `near` | **nguồn dự phòng** khi thiếu front hoặc front chất lượng kém |
| `left` / `right` | **không cấp số hình học nào.** Ảnh bán nghiêng: landmark nửa mặt khuất do model *nội suy* chứ không nhìn thấy. Giữ lại làm bằng chứng phủ tư thế. |
| `pitchDown` / `pitchUp` | **chỉ để đối chứng tư thế.** Pitch phá geometry nặng nhất (nose_length −44%). |

Mỗi feature ghi `sourceView` của chính nó. Có test khẳng định mọi feature hình học
trong một profile đều đến từ **đúng một** view.

---

## 9. Chất lượng

Năm mức, luật viết thẳng trong `gradeQuality()` và khoá bằng test:

| Mức | Điều kiện |
|---|---|
| `invalid` | không thấy khuôn mặt |
| `poor` | tư thế không đạt cổng của bước · khoảng cách không đạt · ảnh mờ · quá tối · quá sáng |
| `usable` | qua hết cổng, nhưng độ nét sát ngưỡng hoặc độ sáng ở rìa dải |
| `good` | qua hết, nét và sáng thoải mái |
| `excellent` | như `good`, và **chỉ** ở view chính diện/sát mặt với tư thế nằm trong **nửa** ngưỡng |

Cổng tư thế **phụ thuộc view**: bước "quay trái" mà yaw = 0 mới là hỏng. Dùng lại
nguyên ngưỡng Phase 1C (`FRONT_LIMITS`, `TURN_MIN_DEG`, `NEAR_MIN_COVERAGE`,
`COVERAGE_MIN/MAX`, `BLUR_MIN`, `BRIGHTNESS_MIN/MAX`) — **không sửa ngưỡng nào**.

**Cố ý không dùng chữ "accurate".** Chưa có ground truth nào để nói về độ chính xác.
Đây là mức dùng được của *ảnh*, không phải độ đúng của *số đo*. Có test cấm chuỗi này.

---

## 10. Truy vết (evidence)

Mỗi feature mang đủ:

```ts
{
  key: "face.nose.bridge_ratio",
  value: 0.4765,
  unit: "normalized_ratio",
  confidence: 0.5,
  method: "euclidean2d(bridgeL,bridgeR)/euclidean2d(alaL,alaR)",
  sourceLandmarks: [193, 417, 48, 278],
  status: "low_confidence",
  sourceView: "front",
  normalizedBy: "noseWidth",
  note: "…",
}
```

Rule Engine ở phase sau đọc `key` + `value` + `status`, và **không được đọc landmark
thô**. `sourceLandmarks` để con người kiểm chứng, không phải để engine tự tính lại.

Khoá máy: `face.<nhóm>.<tên>`, snake_case, **toàn tiếng Anh**. Nhãn tiếng Việt (nếu
cần) là chuyện của tầng hiển thị.

---

## 11. Golden fixture

`tests/fixtures/canonical-face.json` = `canonical_face_model.obj` của MediaPipe chiếu
trực giao vào khung 1000×1000 (khung **vuông** để phép xoay trong không gian pixel là
đẳng hướng).

Đây là **mesh template, không phải người thật**. Dùng làm **regression fixture**: đổi
công thức hay đổi landmark index thì test đỏ. **Không** dùng để khẳng định điều gì về
người thật. Vì vậy mọi kỳ vọng là **khoảng**, không phải số khớp tuyệt đối.

Giá trị trên fixture: `face_shape_ratio` 1.1525 · `interocular_distance` 0.2422 ·
`nose.width` 0.2099 · `mouth.width` 0.3205 · `bridge_ratio` 0.4765 · ba đình
0.1784 / 0.4063 / 0.4152.

Thượng đình 0.1784 thay vì 0.333 chính là bằng chứng của lệch hệ thống ~46%.

---

## 12. Giới hạn đã biết

1. **Chưa có ground truth người thật.** Tất cả sai số dựa trên 7 ảnh của **một** người
   (Phase 1B-2). Chưa có bộ 30–50 người.
2. **Phần lớn feature là `low_confidence`.** Chỉ 4 feature là `measured`:
   `interocular_distance`, `three_courts.middle`, và hai mốc khung hình. Đó là sự thật
   của cảm biến, không phải thiếu sót của tầng này.
3. **Thượng đình lệch hệ thống ~46%** vì lưới không có điểm ở chân tóc. Mọi khuôn mặt
   đều sẽ đọc ra "thượng đình khuyết" nếu tin con số này.
4. **Chiều cao mắt là độ mở mí**, không phải kích thước mắt. Pipeline chưa có cổng chặn
   chớp mắt (MediaPipe *có* blendshape `eyeBlink` nhưng chưa nối vào).
5. **Lông mày chỉ đo được hình dạng bờ, không thấy sợi lông.** Đậm/nhạt/tán loạn/mọc
   ngược đều không đo được.
6. **Miệng phụ thuộc biểu cảm** tại khoảnh khắc chụp.
7. **Trái/phải chưa cấp số nào.** Muốn có profile geometry thật cần góc ~90°, mà ở góc
   đó MediaPipe trả về **không gì cả** (đã thử ở Phase 1B-2).
8. **Feature Layer chưa nối vào luồng chạy.** Session protocol Phase 1C không mang
   landmark (xem §1).
9. `src/features/physiognomy/voice/recorder.ts:241` có một lỗi kiểu `Float32Array`
   (do đổi lib TypeScript), **có từ trước Phase 1D**, không ảnh hưởng build. Chưa sửa
   vì ngoài phạm vi phase này.

---

## 13. Những gì KHÔNG được suy ra từ tầng này

Tầng này **không cho phép** kết luận bất kỳ điều nào sau đây, dù trực tiếp hay gián tiếp:

- tướng tốt / tướng xấu / cát / hung / phú quý / bần hàn
- tính cách, trí tuệ, đạo đức, sức khoẻ
- vận mệnh, thời vận, sự nghiệp, hôn nhân, con cái
- phân loại khuôn mặt thành "kiểu" nào (`face_type`, `eye_type`, `nose_type`…)
- bất cứ điểm số tổng hợp nào (`destiny_score`, `fortune_score`…)
- độ đầy đặn / lõm của bất kỳ bộ vị nào

Một feature `low_confidence` **không được** nâng thành phân loại chắc chắn ở tầng trên.
Một feature `unsupported` **không được** thay bằng 0, bằng giá trị trung bình dân số,
hay bằng suy đoán từ feature khác.

Việc luận giải là của phase sau, và phase đó phải có bằng chứng riêng của nó.
