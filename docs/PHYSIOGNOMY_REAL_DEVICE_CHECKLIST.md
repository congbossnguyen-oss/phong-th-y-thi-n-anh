# Real Device Validation — /nhan-tuong

```text
iPhone:  NOT_TESTED — REAL DEVICE REQUIRED
Android: NOT_TESTED — REAL DEVICE REQUIRED

Automated: 539/539 PASS (12 tệp)
Đường thử: https://walking-dialogue-bookmark-zinc.trycloudflare.com/nhan-tuong
```

> **Không một mục thiết bị nào được ghi PASS.** Em không có iPhone/Android trong tay.
> Mọi thứ dưới đây đã sẵn sàng để anh (hoặc người test) bấm, nhưng cho tới khi có máy
> thật thì trạng thái đúng là `NOT_TESTED`, không phải `PASS`.

---

## 1. Audit flow — bằng code, không bằng trí nhớ

### Lệnh thật của repo

| Việc | Lệnh | Ghi chú |
|---|---|---|
| dev server | `astro dev` | script `dev` trong `package.json` |
| build | `npm run build` | = `build:packages && astro build` |
| test | `npx vitest run` | **repo KHÔNG có script `test`** |
| typecheck | `npx tsc --noEmit -p tsconfig.json` | **không có script**, `typescript` không phải dep trực tiếp |

### HTTPS tunnel

`cloudflared` 2026.9.3, quick tunnel (không cần tài khoản).
Host lấy từ biến môi trường `TUNNEL_HOST` tại [`astro.config.mjs:136`](../astro.config.mjs) —
**0 tệp trong `src/` hard-code URL tunnel**. Host lạ → **403** (đã kiểm).

```bash
cloudflared tunnel --url http://localhost:4321
```

```bash
npx astro dev stop; $env:TUNNEL_HOST="<hostname>"; npx astro dev
```

> Quick tunnel **bị Cloudflare thu hồi** sau một thời gian (`Unauthorized: Tunnel not
> found`) và tiến trình vẫn retry vô ích. URL cũ đã chết đúng như vậy; nếu trang trả
> 502 thì tạo tunnel mới rồi đặt lại `TUNNEL_HOST`.

### Route

`src/pages/nhan-tuong.astro` — `prerender = true`. **Một** trang, **hai** chế độ chọn
ở CLIENT theo `?mode=mobile`: `#nt-mode-desktop` / `#nt-mode-mobile`. Giữ prerender để
middleware bỏ qua (không truy vấn DB, không đọc cookie).

### Luồng trên điện thoại

6 màn: `ntm-intro` → `ntm-scan` → `ntm-voice-intro` → `ntm-recording` → `ntm-done`,
cộng `ntm-error`.
6 bước mặt: `front · left · right · near · pitch_down · pitch_up`.

### Camera

| Điểm | Ở đâu |
|---|---|
| chặn khi không phải secure context | `camera/index.ts:43` |
| `getUserMedia` gọi **trong** handler cử chỉ | `camera/index.ts:101` (yêu cầu của iOS) |
| `facingMode: "user"` | `camera/index.ts:81` |
| `playsinline` + `webkit-playsinline` + `muted` | `camera/index.ts:111-115` |

Thiếu `playsinline` là iOS bung fullscreen phá layout — đã xử lý.

### Nhận diện mặt & tư thế

`FaceLandmarker` nạp **trễ**, asset **local** (`public/mediapipe`, **26 MB** trên đĩa).
`numFaces: 2` để *phát hiện* nhiều mặt rồi báo lỗi, không phải để đo 2 mặt.

Tư thế đọc từ `facialTransformationMatrixes` theo **THỨ TỰ CỘT**
(`quality.ts:54` → `m[col * 4 + row]`). Đọc theo hàng là lấy nghịch đảo — lỗi này từng
làm đảo ngược thông báo "cúi xuống"/"ngẩng lên".

### Micro & giọng nói — flow **CÓ** dùng MediaRecorder

`NhanTuongMobile.astro:665` gọi `startRecording()`.
**Không hard-code `audio/webm`**: `pickSupportedMimeType()` dò theo thứ tự
`webm;codecs=opus → webm → mp4;codecs=mp4a.40.2 → mp4 → ogg;codecs=opus`, `try/catch`
nằm **trong** vòng lặp vì `isTypeSupported` có máy throw.

iOS Safari thường ra `audio/mp4`; Chrome Android ra `audio/webm`. `MediaRecorder` chỉ
có **từ iOS 14.3** — máy cũ hơn phải báo rõ, không im lặng.

### Feature JSON & đường truyền

```text
SCHEMA_VERSION              = "1.0"
FEATURE_SCHEMA_VERSION      = "physiognomy-feature-v1"
TRANSPORT_VERSION           = "physiognomy-session-feature-v1"
MAX_FEATURE_TRANSPORT_BYTES = 12 288      (payload thật ~5.6 KB)
MAX_BODY_BYTES (API)        = 16 384
SESSION_TTL_MS              = 15 phút (tính từ lúc TẠO phiên, KHÔNG phải từ lúc xong)
DESKTOP_POLL_MS             = 1 500
```

Máy tính poll mỗi 1.5s và **dừng poll** ngay khi thấy `complete`, nên payload giao
đúng một lần.

---

## 2. Tests tự động — chạy TRƯỚC khi ra máy thật

| Tệp | Số test |
|---|---:|
| `nhan-tuong-scan` | 36 |
| `nhan-tuong-phase1b` | 68 |
| `nhan-tuong-session` | 63 |
| `nhan-tuong-api` | 31 |
| `nhan-tuong-ux-patch` | 20 |
| `nhan-tuong-feature-layer` | 83 |
| `nhan-tuong-transport` | 58 |
| `nhan-tuong-transport-api` | 15 |
| `nhan-tuong-collection` | 27 |
| `nhan-tuong-pipeline` | 39 |
| `nhan-tuong-boundary` | 69 |
| `nhan-tuong-knowledge-source` | 30 |
| **Tổng** | **539 PASS / 0 FAIL** |

---

## 3. Chuẩn bị trước khi test

1. Dev server chạy với `TUNNEL_HOST` đúng host của tunnel đang sống.
2. Mở `https://<tunnel>/nhan-tuong` trên **máy tính** → QR hiện ra.
3. Dùng bảng **Thu dữ liệu nghiên cứu** (chỉ DEV) nếu muốn gắn nhãn `A-01`…`E-03`.
4. Quét QR bằng camera điện thoại.
5. Lần đầu sẽ **tải ~15.8 MB** MediaPipe qua tunnel — chậm, kiên nhẫn.

---

## 4. iPhone

**Ghi trước khi bắt đầu:**

```text
device model : ____________________   (vd iPhone 13)
OS           : ____________________   (vd iOS 18.1)
browser      : ____________________   (Safari / Chrome iOS — cả hai đều WebKit)
camera       : ____________________   (trước / sau)
orientation  : ____________________   (dọc / ngang)
```

| # | Mục | Kết quả | Ghi chú cần điền |
|---|---|---|---|
| 1 | camera permission | `NOT_TESTED` | prompt hiện ngay khi bấm BẮT ĐẦU? |
| 2 | camera stream | `NOT_TESTED` | có **bung fullscreen** không? FPS ≈ ? |
| 3 | face detection | `NOT_TESTED` | bao lâu từ lúc mở camera tới lúc bắt được mặt? |
| 4 | front | `NOT_TESTED` | yaw/pitch/roll đọc được, qua cổng ±8/±8/±5? |
| 5 | left | `NOT_TESTED` | **quay trái mà máy nhận là trái?** xem §6 |
| 6 | right | `NOT_TESTED` | |
| 7 | close (near) | `NOT_TESTED` | coverage đạt ≥ 0.62? |
| 8 | down (pitch_down) | `NOT_TESTED` | |
| 9 | up (pitch_up) | `NOT_TESTED` | |
| 10 | microphone permission | `NOT_TESTED` | prompt riêng hay gộp với camera? |
| 11 | voice | `NOT_TESTED` | đọc đúng câu mẫu, vạch mức có nhảy? |
| 12 | **MediaRecorder** | `NOT_TESTED` | **MIME thật là gì?** kỳ vọng `audio/mp4` |
| 13 | Feature JSON | `NOT_TESTED` | 29 feature, `featureStatus: "ok"`, payload ? bytes |
| 14 | desktop nhận payload | `NOT_TESTED` | tự chuyển màn, **không** cần reload? |

---

## 5. Android

```text
device model : ____________________   (vd Pixel 8 / Samsung A55)
OS           : ____________________   (vd Android 14)
browser      : ____________________   (Chrome / Samsung Internet)
camera       : ____________________
orientation  : ____________________
```

| # | Mục | Kết quả | Ghi chú cần điền |
|---|---|---|---|
| 1 | camera permission | `NOT_TESTED` | |
| 2 | camera stream | `NOT_TESTED` | FPS ≈ ? |
| 3 | face detection | `NOT_TESTED` | |
| 4 | front | `NOT_TESTED` | |
| 5 | left | `NOT_TESTED` | xem §6 |
| 6 | right | `NOT_TESTED` | |
| 7 | close (near) | `NOT_TESTED` | |
| 8 | down (pitch_down) | `NOT_TESTED` | |
| 9 | up (pitch_up) | `NOT_TESTED` | |
| 10 | microphone permission | `NOT_TESTED` | |
| 11 | voice | `NOT_TESTED` | |
| 12 | **MediaRecorder** | `NOT_TESTED` | **MIME thật?** kỳ vọng `audio/webm` |
| 13 | Feature JSON | `NOT_TESTED` | |
| 14 | desktop nhận payload | `NOT_TESTED` | |

---

## 6. ⚠️ Điểm nghi ngờ nhất — dấu của yaw

[`acquisition/thresholds.ts`](../src/features/physiognomy/acquisition/thresholds.ts):

```ts
export const YAW_SIGN_FOR_USER_LEFT: 1 | -1 = 1;
```

Hằng số này hiệu chuẩn từ **ảnh tĩnh** ở Phase 1C (ảnh 4, yaw +27.84°, nửa mặt phía
landmark 454 hẹp 0.053 ⇒ quay ra xa camera), rồi suy ra trái/phải **theo quy ước index
của MediaPipe** — phần suy luận đó **không đo được trực tiếp**.

**Nếu người test quay TRÁI mà máy đòi quay thêm hoặc nhận thành PHẢI**: đổi hằng số
thành `-1`. Chỉ một dòng, phần còn lại không phải sửa.

Đây là mục cần chú ý nhất trong cả buổi test.

---

## 7. Những điểm khác đáng soi

| Điểm | Vì sao đáng soi |
|---|---|
| Tải 26 MB MediaPipe qua quick tunnel | lần đầu rất chậm; nếu người test bỏ giữa chừng thì không phải lỗi code |
| `MediaRecorder` trên iOS < 14.3 | không có API; phải báo rõ, không im lặng |
| `numFaces: 2` | có người thứ hai trong khung → phải báo `multiple_faces`, không đo bừa |
| Xoay ngang máy | `playsinline` giữ video trong khung, nhưng chưa test đổi hướng giữa lúc quét |
| KV eventually consistent | máy tính có thể thấy `complete` trước khi payload tới → phải chịu được `featureProfile == null` |
| Quick tunnel bị thu hồi | URL chết giữa buổi test; xem §1 |
| **Phiên bị KV xoá sau 15 phút** | Đồng hồ chạy từ lúc TẠO phiên. `store.put` KHÔNG gia hạn, nên một lượt quét lâu vẫn chết đúng mốc đó. **Bấm tải dữ liệu ngay sau MỖI lượt**, đừng đợi xong cả người. |

---

## 8. Sau khi có kết quả thật

1. Điền bảng §4/§5, đổi `NOT_TESTED` thành `PASS`/`PARTIAL`/`FAIL` kèm số đo thật.
2. Xuất dữ liệu bằng nút **Tải dữ liệu người này**.
3. Chạy bộ đo:

```bash
node scripts/nhan-tuong-validate-features.mjs mau/
```

4. **Chỉ khi** đủ 5 người × 3 lượt × ≥2 máy mới được xét nâng `validated` — và vẫn cần
   nguồn cổ thư mới tới được tầng luận giải.

---

## 9. Trạng thái KHÔNG đổi trong phase này

```text
Measurement:  3 measured · 26 low_confidence · 0 unsupported   (GIỮ NGUYÊN)
              0 validated · 0 interpretationEligible
Knowledge:    VERIFIED SOURCES = 0        KNOWLEDGE_SOURCES = {}
Rule Engine:  BLOCKED
LLM:          chưa nối (REFUSING_PROVIDER)
```
