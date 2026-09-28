# Phase 1D-3 — Validate feature `measured` trên người thật

```text
REAL_IMAGE_VALIDATION   = DONE     (1 người · 7 ảnh · 6 bắt được mặt · 2 qua cổng chính diện)
REAL_DEVICE_VALIDATION  = PENDING  (0 mẫu — chưa có ai quét bằng điện thoại thật)

KẾT QUẢ: 7 measured  →  3 measured
```

Đây là **validate tầng đo**, không phải Rule Engine. Không KB, không LLM, không một
chữ luận giải nào.

---

## 1. Bảy feature `measured` trước khi audit

Đọc thẳng từ `src/features/physiognomy/features/extract.ts`, không lấy từ tài liệu.

| Feature | Công thức | Chuẩn hoá | Landmark | Nhạy tư thế | Conf. | Bằng chứng |
|---|---|---|---|---|---:|---|
| `face.geometry.face_width` | `d2(234,454)` / frameWidth | **khung hình** | 234, 454 | không trực tiếp | 0.90 | A |
| `face.geometry.face_height` | `d2(10,152)` / frameHeight | **khung hình** | 10, 152 | không trực tiếp | 0.90 | A |
| `face.eyes.interocular_distance` | `d2(133,362)` / faceWidth | faceWidth | 133, 362 | pitch 4.99% (1B-2) | 0.95 | B |
| `face.three_courts.middle` | chiếu trục đầu 3D | tổng ba đình | 10, 105, 334, 2, 152 | pitch 0.0063 (1B-2) | 0.94 | B |
| `face.pose.yaw` | ma trận biến đổi, cột-chính | — | — | chính nó là tư thế | 0.90 | B |
| `face.pose.pitch` | ma trận biến đổi, cột-chính | — | — | chính nó là tư thế | 0.90 | B |
| `face.pose.roll` | ma trận biến đổi, cột-chính | — | — | chính nó là tư thế | 0.90 | B |

---

## 2. Ba mức bằng chứng

| Mức | Nghĩa | Đã có |
|---|---|---|
| **A — Synthetic** | mesh chuẩn MediaPipe / fixture sinh ra | `tests/fixtures/canonical-face.json`, 82 + 58 test |
| **B — Real image** | ảnh người thật đã có từ Phase 1B | **7 ảnh, 1 người** |
| **C — Real device** | camera thật trên điện thoại/trình duyệt thật | **CHƯA CÓ MẪU NÀO** |

> Fixture mesh chuẩn **không phải** bằng chứng về người thật. Nó là mẫu mà MediaPipe
> hồi quy về, nên mọi feature đều "hoàn hảo" trên đó theo định nghĩa. Chỉ dùng làm
> regression test.

---

## 3. Đo lại trên ảnh người thật

Port **đúng công thức đang ship** sang Python (`poc/revalidate.py`) — mục đích là kiểm
thứ đang chạy, không phải một phiên bản tương tự.

### 3.1 Sáu ảnh bắt được mặt (ảnh 5 detector trả về rỗng)

| Ảnh | yaw | pitch | roll | face_width | face_height | interocular | middle | Qua cổng chính diện |
|---|---:|---:|---:|---:|---:|---:|---:|:---:|
| 1 | −0.62 | −1.11 | −2.17 | 0.4620 | 0.4438 | 0.3046 | 0.4260 | **✓** |
| 2 | +1.99 | −8.90 | −2.00 | 0.3347 | 0.2986 | 0.2822 | 0.4304 | ✗ pitch |
| 3 | −2.27 | +1.28 | −1.27 | 0.6702 | 0.6693 | 0.3286 | 0.4385 | **✓** |
| 4 | +27.84 | −3.50 | +0.41 | 0.4349 | 0.4387 | 0.2779 | 0.4524 | ✗ yaw |
| 6 | +2.21 | +18.51 | −2.84 | 0.5200 | 0.4508 | 0.3198 | 0.4323 | ✗ pitch |
| 7 | +1.23 | −31.12 | −2.81 | 0.4833 | 0.3826 | 0.2898 | 0.4320 | ✗ pitch |

**Chỉ 2/7 ảnh qua cổng chính diện.** Đây đã là một phát hiện: cổng `±8°/±8°/±5°` khá
chặt với ảnh chụp tự nhiên.

### 3.2 Độ nhạy

`amp` = biên độ (max − min). `%` = biên độ / trung bình.

| Feature | Crop 0–5% | Thu phóng ảnh 0.6–1.3× | Độ sáng γ 0.6–1.8 | Giữa 2 lần chụp **qua cổng** | Cả 6 tư thế |
|---|---|---|---|---|---|
| `face_width` | **10.6–10.9%** | 0.12–0.57% | 0.45–0.56% | **36.8%** | **69.3%** |
| `face_height` | **10.9–11.3%** | 0.22–0.29% | 0.30–0.46% | **40.5%** | **82.9%** |
| `interocular_distance` | 0.98–1.71% | 0.35–1.93% | 1.10–1.13% | **7.56%** | 16.9% |
| `three_courts.middle` | 1.33–1.88% | 0.49–0.94% | 1.52–1.87% | **2.90%** | 6.07% |
| `pose.yaw` | 0.29–0.44° | 0.17–0.47° | 0.15–0.16° | — | — |
| `pose.pitch` | 0.98–1.10° | 0.71–0.82° | 0.36–1.10° | — | — |
| `pose.roll` | 0.14–0.19° | 0.08–0.17° | 0.09–0.61° | — | — |

**Một cảnh báo về phương pháp phải nói thẳng:** cột "thu phóng ảnh" dùng `cv2.resize`,
**KHÔNG tương đương với việc bước tới gần camera**. Resize giữ nguyên phối cảnh; đổi cự
ly thì phối cảnh đổi. Cự ly thật chỉ quan sát được giữa ảnh 1 và ảnh 3 (face_width
0.462 → 0.670) — và đó chính là cột lệch nhiều nhất.

### 3.3 Đọc kết quả

- **`face_width` / `face_height`**: mẫu số là **khung hình**, nên chúng đo *cách đóng
  khung* chứ không đo *khuôn mặt*. Cùng một người, 6 lần chụp lệch 69% và 83%; cắt 5%
  viền là đổi ~11%. Thu phóng ảnh không đổi (0.1–0.6%) đúng như dự đoán, vì tỉ lệ
  mặt/khung được giữ nguyên.
- **`interocular_distance`**: bền với crop (≤1.7%), thu phóng (≤1.9%), độ sáng (≤1.1%).
  Nhưng **hai lần chụp khác cự ly mà cả hai đều qua cổng chính diện vẫn lệch 7.56%**.
  Đúng như `depthMismatch = 0.404` đã báo trước: khoé mắt (z ≈ +3.76) và mốc chuẩn hoá
  234/454 (z ≈ −2.44) nằm ở hai mặt phẳng độ sâu khác nhau.
  Con số 4.99% của Phase 1B-2 là biến thiên **trong một loạt ảnh cùng cự ly**, không
  phải giữa các lần chụp — dùng nó làm căn cứ cho `measured` là đọc sai phạm vi.
- **`three_courts.middle`**: bền nhất trong bốn chỉ số hình học. Crop ≤1.9%, thu phóng
  ≤0.9%, độ sáng ≤1.9%, pitch 0.0063. Giữa hai lần chụp qua cổng: 2.90% — **dưới ngưỡng
  5%**. Yaw 28° đẩy lên 6.07%, nhưng góc đó đã bị cổng chặn.
- **`pose`**: nhiễu tuyệt đối yaw ≤0.47°, pitch ≤1.10°, roll ≤0.61° qua cả crop, thu
  phóng và độ sáng — nhỏ hơn nhiều so với cổng 8°/20°. Phần trăm cho tư thế là **vô
  nghĩa** (mẫu số quanh 0), phải đọc bằng độ tuyệt đối.

---

## 4. Tiêu chí `measured`

Một feature chỉ được `measured` khi **đủ cả bảy**:

1. Có bằng chứng trên ảnh **người thật** (không phải mesh chuẩn).
2. Công thức không phụ thuộc thang pixel thô / cách đóng khung.
3. Độ nhạy tư thế nằm trong giới hạn đã kiểm (≤5% giữa các lần chụp hợp lệ).
4. Confidence tương ứng với chất lượng thật.
5. Không có sai lệch hệ thống nghiêm trọng.
6. Không phụ thuộc một máy/camera cụ thể.
7. Có test regression bảo vệ.

Thiếu bất kỳ điều nào → `low_confidence`. **Giảm số `measured` không phải thất bại.**

---

## 5. Phán quyết

| Feature | 1 | 2 | 3 | 4 | 5 | 6 | 7 | Kết luận |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| `face.geometry.face_width` | ✓ | **✗** | — | ✓ | **✗** | ? | ✓ | **HẠ** → low_confidence |
| `face.geometry.face_height` | ✓ | **✗** | — | ✓ | **✗** | ? | ✓ | **HẠ** → low_confidence |
| `face.eyes.interocular_distance` | ✓ | ✓ | **✗** 7.56% | ✓ | ✓ | **?** | ✓ | **HẠ** → low_confidence |
| `face.three_courts.middle` | ✓ | ✓ | ✓ 2.90% | ✓ | ✓ | **?** | ✓ | **HẠ** → low_confidence (chỉ vì #6) |
| `face.pose.yaw` | ✓ | ✓ | ✓ 0.47° | ✓ | ✓ | ✓ | ✓ | **GIỮ** measured |
| `face.pose.pitch` | ✓ | ✓ | ✓ 1.10° | ✓ | ✓ | ✓ | ✓ | **GIỮ** measured |
| `face.pose.roll` | ✓ | ✓ | ✓ 0.61° | ✓ | ✓ | ✓ | ✓ | **GIỮ** measured |

`?` = chưa kiểm được vì **chỉ có một người và một máy ảnh**.

### Vì sao `three_courts.middle` vẫn bị hạ dù đạt #3

Nó là ứng viên mạnh nhất: bền với crop, thu phóng, độ sáng và pitch, và 2.90% giữa hai
lần chụp hợp lệ. Nhưng bằng chứng là **1 người / 2 lần chụp hợp lệ / 1 máy ảnh**.
Tiêu chí #6 ("không phụ thuộc một máy/camera cụ thể") chưa kiểm được. Nâng lên
`measured` với n=2 là bịa độ tin cậy.

Confidence hạ từ 0.94 → **0.70**, vẫn cao nhất trong ba đình, để tầng trên còn phân
biệt được nó với `upper` (0.25) và `lower` (0.60).

### Vì sao `pose` được giữ

Ba trục tư thế là **số đọc trực tiếp từ cảm biến**, không phải suy ra qua tỉ lệ. Nhiễu
đã lượng hoá (≤1.1°) và nhỏ hơn cổng một bậc. Nhưng phải nhắc lại: **chúng là siêu dữ
liệu thu nhận, không phải đặc điểm nhân tướng.** Mặt nghiêng không mang ý nghĩa gì.

### Kết quả

```text
7 measured  →  3 measured   (và cả 3 đều là siêu dữ liệu thu nhận)
22 low_confidence  →  26 low_confidence
0 unsupported  →  0 unsupported
```

**Hiện KHÔNG có feature hình học nào đạt `measured`.** Có test khoá lại điều này: bất
kỳ feature nào mang status `measured` mà khoá không bắt đầu bằng `face.pose.` sẽ làm
test đỏ.

---

## 6. Phân tích cổng all-or-nothing

### Vì sao V1 đang all-or-nothing?

```text
pose thiếu/lệch → poseValidFor() = false → gradeQuality() = "poor"
                → pickGeometryView() bỏ qua (< "usable")
                → KHÔNG view nào cấp số → mọi feature hình học = null
```

Không phải quyết định có chủ đích mà là **hệ quả** của việc gom mọi kiểm tra chất lượng
vào một hạng duy nhất rồi dùng hạng đó để chọn view. Đúng ở V1 vì Phase 1B-2 cho thấy
tư thế phá **hầu hết** chỉ số hình học (nose_length −44% ở pitch −31°), nên khi tư thế
hỏng thì phần lớn số đo cũng hỏng — chặn cả cụm là an toàn.

### Có feature nào vẫn đo được khi tư thế hỏng không?

Có, và dữ liệu Phase 1D-3 chỉ ra cụ thể:

| Feature | Biên độ qua cả 6 tư thế (yaw 28° / pitch −31°…+19°) |
|---|---|
| `three_courts.middle` | **6.07%** — vẫn dùng được |
| `interocular_distance` | 16.9% |
| `face_shape_ratio` | 17.6% (Phase 1B-2) |
| `nose.length` | 44.1% (Phase 1B-2) |

`three_courts.middle` chỉ lệch 6.07% qua **toàn bộ** dải tư thế, tức là ở view
`pitchDown`/`pitchUp` nó vẫn có nghĩa — mà V1 đang vứt đi.

### Có nên chuyển sang gating theo từng feature ở V2?

**Nên, nhưng chưa đủ bằng chứng để làm bây giờ.** Muốn làm thì cần:

- một bảng `poseTolerance` cho từng feature, đo trên **nhiều người**, không phải một;
- `confidence` phải thành **hàm của tư thế thật** chứ không còn là hằng số:
  `c = c_base × f(|yaw|, |pitch|)`;
- `sourceView` có thể khác nhau giữa các feature trong cùng một profile — hợp đồng
  transport đã chịu được (mỗi feature mang `w` riêng), nhưng test hiện đang khẳng định
  "mọi feature đến từ đúng một view" và sẽ phải sửa;
- ngữ nghĩa sai số đổi: hiện `confidence` nói "tin được bao nhiêu **nếu** ảnh qua cổng";
  sang V2 nó phải nói "tin được bao nhiêu **ở tư thế này**".

**Quyết định: GIỮ NGUYÊN V1.** Với một người và hai lần chụp hợp lệ, dựng bảng dung sai
theo tư thế là bịa số. Ghi lại làm việc của V2 sau khi có bộ mẫu ở §7.

---

## 7. Kế hoạch đo trên máy thật

`REAL_DEVICE_VALIDATION = PENDING`. Bộ đo đã sẵn sàng, chỉ thiếu mẫu.

### Cỡ mẫu tối thiểu

| | Tối thiểu | Vì sao |
|---|---|---|
| Người | **5** | dưới mức này không tách được biến thiên cá nhân khỏi nhiễu |
| Lần quét / người | **3** | cần ≥2 để có biên độ; 3 để thấy được giá trị lạc |
| Máy | **≥2** loại | tiêu chí #6 ("không phụ thuộc một camera") |

= **15 lượt quét**, mỗi lượt 6 góc. Không cần đủ mọi tổ hợp.

### Lấy mẫu

Mỗi người quét 3 lượt, mỗi lượt một điều kiện khác nhau:

| Điều kiện | Cách làm |
|---|---|
| `trong-nha` | ánh sáng phòng bình thường, cầm điện thoại cách mặt một sải tay |
| `sang` | quay mặt về phía cửa sổ hoặc bật đèn trắng |
| `hoi-toi` | tắt bớt đèn, vẫn còn nhìn rõ mặt |

Cự ly là **biến quan trọng nhất** (nó gây ra 7.56% của `interocular_distance`), nên
trong ba lượt hãy cố ý đổi khoảng cách cầm máy, đừng giữ nguyên.

### Thu kết quả

Sau mỗi lượt, lấy mã phiên hiện trên máy tính rồi:

```bash
curl -s "http://localhost:4321/api/nhan-tuong/session?id=<MÃ>" > mau/A__trong-nha.json
```

Tên tệp phải đúng dạng `<người>__<điều-kiện>.json` — bộ đo gom nhóm theo tên tệp.

### Chạy bộ đo

```bash
node scripts/nhan-tuong-do-lai.mjs mau/
```

Nó in ra, cho từng feature: độ phân tán **trong-người** (xấu nhất) và **giữa-người**;
rồi đối chiếu với ngưỡng ở §4. Với feature đơn vị độ nó dùng **độ tuyệt đối**, không
dùng phần trăm.

**Một feature ổn định trong-người nhưng không phân biệt được giữa-người thì đo cũng vô
dụng** — bộ đo nói rõ điều này thay vì chỉ khoe con số đẹp.

### Nâng status thế nào

Bộ đo chỉ trả lời tiêu chí #3 và #4. Còn #1/#2/#5/#6/#7 phải xét bằng tay. Nâng bất kỳ
feature nào lên `measured` phải: sửa `extract.ts`, cập nhật test, và ghi số đo vào tài
liệu này — không nâng dựa vào cảm giác.

---

## 8. Blocker còn lại

1. **Không có mẫu máy thật.** Đây là blocker chính và chỉ anh mở được — cần 5 người.
2. **Chỉ một người trong bằng chứng ảnh.** Mọi số ở §3 là của cùng một khuôn mặt; chưa
   biết gì về biến thiên giữa người với người.
3. **Chỉ một máy ảnh.** Tiêu chí #6 chưa kiểm được với bất kỳ feature nào.
4. **Chỉ 2/7 ảnh qua cổng chính diện**, nên "giữa các lần chụp" chỉ có n=2. Con số
   7.56% và 2.90% đều dựa trên hai điểm — đủ để **hạ** status (một phản ví dụ là đủ để
   bác bỏ), nhưng **không** đủ để nâng.
5. **Cột thu phóng không phải cột cự ly.** `cv2.resize` giữ phối cảnh; chỉ máy thật mới
   cho biết cự ly ảnh hưởng bao nhiêu.
6. **Ảnh 5 detector trả về rỗng** — chưa rõ vì sao (nghi góc quá lớn). Không điều tra
   thêm vì ngoài phạm vi.

---

## 9. Những gì KHÔNG được suy ra từ tài liệu này

Không có feature nào ở đây cho phép kết luận về tính cách, sức khoẻ, tài lộc, vận mệnh
hay tướng tốt/xấu. Ba feature còn `measured` đều là **số đo tư thế đầu**, tức siêu dữ
liệu thu nhận. Việc luận giải chưa được xây dựng và không nằm trong phạm vi phase này.
