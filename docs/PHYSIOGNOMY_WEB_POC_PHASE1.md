# PHYSIOGNOMY WEB POC — PHASE 1

**Ngày:** 2026-09-25
**Clone:** `phong-thuy-thien-anh-cloudflare-migration` (clone production Cloudflare)
**Branch:** `feat/physiognomy-web-poc`, tách từ `cloudflare-migration` @ `cc4724b`
**Kết quả:** `PARTIAL PASS` — chi tiết ở §Kết luận

---

## PHASE A — Repository safety ✅

| Kiểm tra | Kết quả |
|---|---|
| Đúng clone | ✅ `phong-thuy-thien-anh-cloudflare-migration` |
| Branch nguồn | ✅ `cloudflare-migration` @ `cc4724b` |
| Không merge/cherry-pick từ clone kia | ✅ Không chạm `phong-thuy-thien-anh` |
| Không xoá/reset thay đổi của Công | ✅ 12 file dirty **giữ nguyên** qua `git checkout -b` (thao tác này không chạm working tree) |
| Branch POC | ✅ `feat/physiognomy-web-poc` |

12 file dirty là việc khác đang làm (daliuren-engine, huyền không đại quái, dai-luc-nham) — **không trùng một file nào** với POC. Không dùng `git stash` (môi trường cảnh báo stack stash dùng chung giữa các worktree).

---

## 1. FILES CHANGED

### Tạo mới — 11 file mã + 1 test + 6 asset
```
src/pages/nhan-tuong.astro                             route, prerender = true
src/components/tools/NhanTuong.astro                   UI 6 màn hình + toàn bộ script client

src/features/physiognomy/types/index.ts                HỢP ĐỒNG DỮ LIỆU schema V1
src/features/physiognomy/index.ts                      assembler + cảnh báo cấp lần quét
src/features/physiognomy/camera/index.ts               vòng đời camera, bẫy iOS, giải phóng stream
src/features/physiognomy/capture/state-machine.ts      21 trạng thái, đồ thị cạnh hợp lệ
src/features/physiognomy/capture/quality.ts            cổng chất lượng + phân rã pose + blur/lighting
src/features/physiognomy/landmarker/index.ts           nạp trễ MediaPipe, asset local
src/features/physiognomy/geometry/index.ts             đo hình học, ba đình head-axis, bản đồ 12 cung
src/features/physiognomy/voice/recorder.ts             MediaRecorder + dò MIME + giải mã PCM
src/features/physiognomy/voice/features.ts             4 đặc trưng âm thanh (experimental)

tests/nhan-tuong-scan.test.ts                          36 test cho phần logic thuần

public/mediapipe/face_landmarker.task                  3.76 MB
public/mediapipe/wasm/vision_wasm_internal.js          0.32 MB
public/mediapipe/wasm/vision_wasm_internal.wasm        11.76 MB  (bản SIMD)
public/mediapipe/wasm/vision_wasm_nosimd_internal.js   0.32 MB
public/mediapipe/wasm/vision_wasm_nosimd_internal.wasm 10.96 MB  (iOS Safari < 16.4)
```

### Sửa — 2 file, chỉ thêm 1 dependency
```
package.json        + "@mediapipe/tasks-vision": "^1.0.1"
package-lock.json   theo npm install
```

**Không sửa một dòng logic nào đang chạy.** Không chạm `middleware.ts`, `astro.config.mjs`, `wrangler.jsonc`, `db/`, `src/pages/api/**`, `BaseLayout.astro`.

> ⚠️ `package.json` cũng đang có thay đổi của Công (thêm `daliuren-engine` vào `build:packages` + dependencies). `npm install` đã **giữ nguyên** những thay đổi đó, chỉ thêm dòng mới.

---

## 2. FEATURE JSON CONTRACT

`src/features/physiognomy/types/index.ts` · `schemaVersion: "1.0"` · `modelVersion: "mediapipe/face_landmarker@float16-1"`

### Nguyên tắc: field nào chưa đo được thì ghi status, không ghi số bịa

Mỗi số đo là một `Measurement`, không bao giờ là số trần:
```ts
{ value: number | null, status, unit, normalizedBy?, note? }
status: "measured" | "estimated" | "unsupported" | "unknown"
```
`unsupported`/`unknown` luôn trả `value: null` — **không dùng `0` làm giá trị thiếu** (0 là giá trị hợp lệ; dùng 0 để báo thiếu là mời người đọc hiểu sai). Có test khoá điều này.

### 1. Metadata
`scanId` (chỉ để đối chiếu log trong phiên, KHÔNG phải id khách) · `timestamp` · `modelVersion` · `schemaVersion` · `device{userAgent, viewport, devicePixelRatio, wasmSimd}`

### 2. Capture Quality
`faceDetected` · `faceCount` · `blurScore` · `lightingScore` · `faceCoverage` · `yaw` · `pitch` · `roll` · `captureQuality: pass|warn|fail` · `reasons[]` (câu tiếng Việt hiển thị được luôn)

### 3. Geometry — status lấy từ bằng chứng Phase 1B-2, không tự gán
| field | status | sai lệch đo trên ảnh thật |
|---|---|---|
| `faceWidth` | measured | mốc chuẩn hoá (px) |
| `faceHeight` | measured | ổn định |
| `eyeDistance` | **measured** | 4.99% (pitch) — ổn định nhất |
| `noseWidth` | estimated | 15.30% (yaw 28°) |
| `mouthWidth` | estimated | 20.57% (pitch −31°) |
| `noseLength` | estimated | **44.12%** (pitch −31°) — kém nhất |
| `faceShapeRatio` | estimated | vỡ cả 4 trục (17.63% pitch) |
| `jawWidth` | estimated | chưa đo riêng ở Phase 1B |
| `referencePx` | — | px thô để tính lại sau |

Mọi chỉ số là **tỉ lệ không đơn vị**, chuẩn hoá theo `faceWidth`/`faceHeight`. **Không có ngưỡng pixel cố định nào** trong toàn bộ codebase POC.

### 4. Structural Regions
- `landmarks` — 468 điểm thô (x,y,z), giữ để tính lại mà không phải chụp lại khách
- `faceRegions` — 8 vùng `measured` (hộp bao 2D) + `ears: unsupported`
- `fiveOrgans` — `eye: measured` · `eyebrow/nose/mouth: estimated` · **`ear: unsupported, value null`** (lưới 468 điểm không có landmark nào trên vành tai — giới hạn của model, không phải chưa làm)
- `threeCourts` — `method: "headAxis3d"`, **`middle: measured`** · `upper/lower: estimated`
- `twelvePalaces` — **`status: "unsupported"` cho cả 12 cung**, kèm `reason` nêu rõ ba lý do, và vẫn giữ `landmarkIndices` để truy vết

### 5. Depth — TẮT mặc định
```ts
experimentalDepth: { enabled: false, warning: DEPTH_WARNING }
```
**Cố ý KHÔNG có field nào kiểu `foreheadFullness: 0.82` hay `mingPalaceDepth: 0.71`.** Đã kiểm chứng bằng grep trong JSON thật: `hasFullnessField: false`.

### 6. Voice
`voiceCaptured` · `durationMs` · `mimeType` · `sampleRate` · `channels`, và `features` **tất cả đánh dấu `experimental: true`** + `warning`: `pitchHz` · `energyRms` · `speechRate` · `spectralFeatures{centroidHz, zeroCrossingRate}`. **Không có field nào ánh xạ âm thanh sang kết luận nhân tướng.**

### JSON thật đo trên ảnh mặt thật (trong browser)
```json
{ "schemaVersion":"1.0",
  "captureQuality":{"captureQuality":"pass","yaw":-0.62,"pitch":-1.11,"roll":-2.17,
                    "faceCoverage":0.462,"blurScore":0.001947,"lightingScore":0.5121},
  "geometry":{"faceWidth":693.04,"faceHeight":1.2808,"eyeDistance":0.3046,
              "noseWidth":0.321,"noseLength":0.2597,"mouthWidth":0.3492,"jawWidth":0.7881},
  "structural":{"threeCourts":{"method":"headAxis3d","upper":0.1676,"middle":0.4260,"lower":0.4064},
                "fiveOrgans":{"eye":0.1913,"eyebrow":0.1657,"nose":0.321,"mouth":0.3492,"ear":null},
                "twelvePalaces":{"status":"unsupported"}},
  "experimentalDepth":{"enabled":false},
  "notices":[ 6 cảnh báo ] }
```
`faceWidth = 693.04 px` khớp **chính xác** con số 693.0 mà Phase 1B đo bằng Python trên cùng ảnh.

---

## 3. CAMERA FLOW

### State machine — 21 trạng thái
Luồng hạnh phúc: `idle → requesting_camera → camera_ready → detecting_face → guiding_user → stable_capture → face_captured → voice_intro → requesting_microphone → recording_voice → voice_captured → feature_extraction → complete`

Lỗi chia **hai loại**, vì UX khác nhau hoàn toàn:
- **Chữa được** (`no_face`, `multiple_faces`, `face_too_small`, `pose_invalid`, `blur_invalid`) → quay về `guiding_user`, **camera vẫn mở**, chỉ nhắc khách sửa tư thế. Không bắt xin quyền lại.
- **Dừng hẳn** (`camera_denied`, `unsupported_browser`, `processing_error`) → làm lại từ đầu.
- `microphone_denied` là ngoại lệ: **vẫn đi tiếp được** tới `feature_extraction`, vì khuôn mặt đã chụp xong rồi, không nên vứt cả lần quét chỉ vì khách không muốn nói.

Đồ thị cạnh chặn nhảy tắt: `canTransition("idle","face_captured") === false`. Cạnh sai **không throw** — chỉ ghi `lastError` (một cạnh sai giữa lúc camera đang chạy không đáng làm sập cả trang).

### Cổng chất lượng — Phase D
```
yaw  ≤ ±8°     pitch ≤ ±8°     roll ≤ ±5°
faceCoverage 0.25..0.85    blurScore ≥ 0.0015    lighting 0.18..0.92
```
Pose lấy từ **ma trận biến đổi của MediaPipe**, không suy từ độ bất đối xứng landmark (cách `ljtnine/face` và `mcp-gwansang` làm).

Ngưỡng này **chỉ** quyết định ảnh có đo được hay không. Mặt nghiêng không phải tướng xấu.

### Không quét liên tục
- **~5 fps** (`FRAME_INTERVAL_MS = 200`), không phải 30 fps — Phase 1B đã chứng minh chỉ cần một frame chính diện tốt
- Cần **3 frame liên tiếp** đạt chuẩn (≈0.6s) mới chụp — loại nhiễu một-frame
- Đạt chuẩn → chụp ảnh cho khách xem → **tắt camera + `releaseLandmarker()` ngay**, không giữ stream sống qua các bước sau
- `video: 640×480 ideal`, `frameRate ideal 15`
- Giải phóng ở **cả** `pagehide` và `beforeunload` — `pagehide` bắt được trường hợp iOS Safari đưa trang vào back/forward cache, nơi `beforeunload` KHÔNG chạy (thiếu cái này là đèn camera vẫn sáng)
- `visibilitychange`: tab bị ẩn → dừng vòng lặp, không đốt CPU/pin trong nền

---

## 4. FACE LANDMARKER INTEGRATION

| Hạng mục | Thực hiện |
|---|---|
| Nạp trễ | ✅ `await import("@mediapipe/tasks-vision")` bên trong handler nút — cùng pattern repo đã dùng ở `gieo-que-kinh-dich.astro:763` |
| Không chặn bundle đầu | ✅ **Đã kiểm chứng bằng build thật**: trang tải `NhanTuong…js` **32 KB**; `vision_bundle.B6dSGpK9.js` **152 KB** nằm chunk RIÊNG |
| WASM local | ✅ `/mediapipe/wasm` qua `FilesetResolver.forVisionTasks()` |
| Model local | ✅ `/mediapipe/face_landmarker.task` |
| COOP/COEP | ✅ **KHÔNG bật.** Dùng WASM đơn luồng — bật COOP/COEP sẽ phá mọi iframe/ảnh/script cross-origin toàn site |
| CSP toàn site | ✅ Không thay đổi |
| Delegate | `CPU` — WebGL trên một số Android yếu hay lỗi context; CPU đủ cho ~5 fps |
| `numFaces` | `2` — để **phát hiện được** trường hợp nhiều mặt rồi báo `multiple_faces` |
| Gọi nhiều lần | An toàn: cache instance, hai lần gọi song song chia nhau cùng Promise (không tải 15 MB hai lần) |

### Kích thước thật (ĐÍNH CHÍNH audit trước)
Audit Phase WEB-POC ước WASM "~3 MB". **Số thật là 11.76 MB.** Tổng tải lần đầu cho một thiết bị: **~15.8 MB** (`FilesetResolver` chỉ tải 1 trong 2 bản WASM). Đã sửa lại trong comment của `landmarker/index.ts`.

### Kiểm chứng đường asset local (browser thật)
```
loadLandmarker()  →  loadOk: true, 335 ms (localhost, desktop)
  phases: downloading_runtime(1ms) → downloading_model(39ms) → initialising(335ms) → ready

/mediapipe/face_landmarker.task           200 · 3 758 596 bytes
/mediapipe/wasm/vision_wasm_internal.wasm 200 · 11 756 954 bytes · application/wasm  ✅
/mediapipe/wasm/vision_wasm_internal.js   200 ·    323 377 bytes · text/javascript
```

---

## 5. VOICE FLOW

| Hạng mục | Thực hiện |
|---|---|
| MIME | ✅ **Dò động** qua `MediaRecorder.isTypeSupported()`, thứ tự: `webm;codecs=opus` → `webm` → `mp4;codecs=mp4a.40.2` → `mp4` → `ogg;codecs=opus`. **Không hard-code `audio/webm`** |
| Thời lượng | tối thiểu 8s · mục tiêu 15s · **tự dừng ở 20s** |
| `timeslice` | `recorder.start(1000)` — Safari đôi khi chỉ phát `dataavailable` ở cuối nếu không có timeslice, mất trắng nếu tab treo giữa đường |
| `autoGainControl` | **Tắt** — AGC bóp biên độ, làm `energyRms` mất ý nghĩa so sánh |
| Thanh mức | `AudioContext` + `AnalyserNode`, có fallback `webkitAudioContext` (cùng cách `TourChaoMung.astro:236` đã làm) |
| Safari suspended | `audioCtx.resume()` ngay trong cử chỉ người dùng |
| Đặc trưng | 4 chỉ số, không thư viện ngoài: cao độ (tự tương quan, ngưỡng tương quan 0.3 để loại khung vô thanh), RMS trên khung có tiếng, speechRate (onset/giây — **không phải** speech-to-text), trọng tâm phổ (DFT thưa 64 dải) + ZCR |
| Upload | ❌ **Không.** Blob chỉ trong memory |
| Máy cũ | `checkVoiceSupport()` báo rõ "iOS cần 14.3 trở lên", nút bị disable, khách vẫn hoàn tất được bằng "Bỏ qua bước này" |

---

## 6. PRIVACY

| Cam kết | Thực hiện | Bằng chứng |
|---|---|---|
| Không upload ảnh | ✅ | Không có `fetch`/`XHR` nào gửi media trong toàn bộ `src/features/physiognomy/` |
| Không upload video | ✅ | Frame chỉ vào canvas trong memory |
| Không upload voice | ✅ | Blob chỉ trong memory |
| Không lưu biometric server-side | ✅ | Không tạo API route, không chạm `db/`, không chạm Drizzle |
| Blob giải phóng sau khi xong | ✅ | `URL.revokeObjectURL` cho ảnh chụp và cho JSON tải xuống |
| Trang không gọi server | ✅ | `prerender = true` → HTML tĩnh; `middleware.ts:11-13` tự bỏ qua trang prerender (`if (context.isPrerendered) return next()`) → **không query DB, không đọc cookie, không ghi session** |

Câu hiển thị cho khách — dùng vì implementation **đúng** như vậy:
> *"Ảnh và giọng nói của bạn được xử lý trên thiết bị trong phiên thử nghiệm này và không được lưu lên máy chủ."*

Kiểm chứng giải phóng: sau khi camera bị từ chối, `document.getElementById('nt-video').srcObject === null` → **stream đã tắt, không rò camera**.

---

## 7. iOS COMPATIBILITY

| Bẫy | Xử lý | Vị trí |
|---|---|---|
| Video bung fullscreen | `playsinline` + `webkit-playsinline` + `muted` đặt **cả** bằng attribute trong HTML **và** bằng property trong JS (một số bản Safari chỉ đọc attribute) | `NhanTuong.astro` + `camera/index.ts` |
| Bắt buộc cử chỉ người dùng | `getUserMedia` cho **camera** và **micro** đều gọi trong handler `click`. Module không tự gọi lúc nạp | `NhanTuong.astro` |
| `play()` resolve trước khi có kích thước | `waitForFirstFrame()` chờ `videoWidth > 0` (timeout 10s) — đọc sớm ra 0 và mọi phép đo sau đó sai | `camera/index.ts` |
| MIME khác Android | Dò động, không hard-code | `voice/recorder.ts` |
| `AudioContext` suspended | `resume()` trong cử chỉ + fallback `webkitAudioContext` | `voice/recorder.ts` |
| back/forward cache | `pagehide` (không chỉ `beforeunload`) | `NhanTuong.astro` |
| Chỉ 1 stream sống | `release()` idempotent, gọi ở mọi đường ra | `camera/index.ts` |
| SIMD (Safari < 16.4) | Ship cả `vision_wasm_nosimd_internal.*`; `FilesetResolver` tự chọn | `public/mediapipe/wasm/` |
| MediaRecorder < iOS 14.3 | `checkVoiceSupport()` báo rõ, cho bỏ qua | `voice/recorder.ts` |

⚠️ **Tất cả đều là xử lý theo tài liệu, CHƯA test trên iPhone thật** — xem §9.

---

## 8. ANDROID COMPATIBILITY

| Hạng mục | Trạng thái |
|---|---|
| `getUserMedia` · `MediaRecorder` (webm/opus) · WASM SIMD | Chrome Android hỗ trợ đủ |
| `delegate: "CPU"` | Chọn CPU thay GPU vì WebGL trên Android yếu hay lỗi context |
| ~5 fps · 640×480 | Giảm tải cho máy yếu |
| Tải 15.8 MB | ⚠️ Trên 4G Việt Nam là 10–30 giây — có thông báo pha rõ ràng, không vẽ % giả (fetch nằm trong WASM nên không lấy được tiến độ byte thật) |
| Bộ nhớ | `close()` landmarker ngay khi chụp xong |

⚠️ **CHƯA test trên Android thật** — xem §9.

---

## 9. TESTS

### ✅ Đã test — 36 unit test, tất cả pass
`tests/nhan-tuong-scan.test.ts` — `npx vitest run` → **36 passed**

- **State machine (9 test):** luồng hạnh phúc 12 bước; chặn nhảy tắt `idle → face_captured`; chặn `camera_ready → recording_voice`; **mọi trạng thái đều có đường ra** (không ngõ cụt); lỗi chữa được giữ camera; lỗi dừng hẳn không giữ camera; `microphone_denied → feature_extraction` hợp lệ; bỏ qua giọng nói hợp lệ
- **Cổng chất lượng (12 test):** pass; `no_face`; `multiple_faces`; `face_too_small`; mặt quá sát → **warn không fail**; yaw/pitch/roll vượt ngưỡng; **hướng chúc/ngẩng đúng chữ**; blur; quá tối; cháy sáng → warn; ngưỡng đúng `{8,8,5}`
- **Phân rã pose (5 test):** ma trận đơn vị; xoay X/Y/Z riêng lẻ; **regression test khoá quy ước column-major**
- **Hợp đồng dữ liệu (3 test):** `unsupported` trả `null` không trả `0`; `estimated` bắt buộc có `note`; `measured` ghi rõ chuẩn hoá theo gì
- **Landmark index (4 test):** khoá lỗi 133 (không key nào chứa "brow" trỏ vào 133); mốc gò má 234/454; đủ 12 cung; mọi index trong [0,467]

### ✅ Đã test — build + tích hợp thật
| Kiểm tra | Kết quả |
|---|---|
| `npx astro build` | ✅ Thành công, `/nhan-tuong/index.html` **được prerender** |
| Tách chunk lazy | ✅ Trang 32 KB · `vision_bundle` 152 KB chunk riêng |
| Asset copy sang `dist/client/mediapipe/` | ✅ Đủ 5 file |
| Full test suite | 2356 passed · **3 failed ở 2 file KHÔNG liên quan** (`g10-lunar-policy-golden`, `phase2-toa-huong-mo`) — đều là **timeout mốc 5000ms** trong code lịch/trạch nhật. Chạy lại với `--testTimeout=60000` → **83/83 pass**. Hai file này không import gì của POC. **Lỗi có sẵn, không do POC** |

### ✅ Đã test — browser thật (Chrome desktop, viewport mobile 375×812)
| Ca | Kết quả |
|---|---|
| Trang render, Screen 1 đúng | ✅ Không lỗi console |
| Nạp `FaceLandmarker` với asset local | ✅ 335 ms, 4 pha đúng thứ tự, WASM đúng `application/wasm` |
| **Camera bị từ chối** | ✅ Sang màn hình lỗi, câu tiếng Việt đúng, **`srcObject === null`** (stream đã giải phóng) |
| Assembler → JSON | ✅ `hasFullnessField: false` · `ear: null` + unsupported · 12 cung unsupported · `depthEnabled: false` · 468 landmark · 6 notices |
| **Detect trên 4 ảnh mặt thật** | ✅ 237 ms/ảnh 1500×2000; `faceWidth = 693.04 px` khớp **chính xác** Phase 1B (693.0); pose khớp Python **cả 4 ảnh** |
| Cổng pose trên ảnh thật | ✅ ảnh chính diện → `pass`; yaw 27.8° → `pose_invalid` "quay ngang"; pitch +18.5° → **"chúc xuống"**; pitch −31.1° → **"ngẩng lên"** |

### 🐛 BUG TÌM RA NHỜ TEST THẬT — đã sửa
**MediaPipe Tasks Vision (JS) trả `matrix.data` theo THỨ TỰ CỘT, khác Python.** Code ban đầu đọc row-major → lấy được ma trận **chuyển vị**, mà với ma trận quay chuyển vị = nghịch đảo, nên toàn bộ góc sai.

Đối chiếu 4 ảnh thật với số đo Python của Phase 1B-2:
```
ảnh     đúng (col-major)       sai (row-major)
1.jpg    -0.62/ -1.11/ -2.17    +0.58/ +1.13/ +2.18
4.jpg   +27.84/ -3.50/ +0.41   -27.75/ +4.17/ -2.31
6.jpg    +2.21/+18.51/ -2.84    -1.19/-18.60/ +3.40
7.jpg    +1.23/-31.12/ -2.81    -2.50/+31.05/ +1.77
```
Hậu quả nếu không sửa: câu nhắc **"chúc xuống"/"ngẩng lên" bị ngược**. Và lưu ý ảnh 4 — không phải đảo dấu thuần (pitch 4.17 vs 3.50), nên **không thể chữa bằng cách đổi dấu**, phải đọc đúng thứ tự. Đã sửa `quality.ts` + thêm regression test khoá quy ước.

### ❌ CHƯA TEST ĐƯỢC — và đây là lý do không PASS
Browser pane **chặn truy cập camera/micro** (`"the page requested camera access, which is blocked in the Browser pane"`). Nên **chưa** chạy được:

| Phase K yêu cầu | Trạng thái |
|---|---|
| Desktop Chrome — quét mặt thật qua camera | ❌ chặn |
| Desktop Safari | ❌ không có |
| Android Chrome — camera + micro permission | ❌ không có thiết bị |
| iPhone Safari — camera, micro, fullscreen bug, MIME | ❌ không có thiết bị |
| Ca lỗi: không có camera · camera từ chối | ⚠️ "camera từ chối" đã test ✅; "không có camera" chưa |
| Ca lỗi: micro từ chối | ❌ chưa |
| Ca lỗi: không thấy mặt · hai mặt · mặt quá nhỏ | ⚠️ logic đã test bằng unit test; chưa test qua camera thật |
| Ca lỗi: yaw/pitch vượt ngưỡng · ảnh mờ | ✅ **đã test trên 4 ảnh thật** (đường ảnh tĩnh) |

Toàn bộ vòng lặp `detectForVideo` trên `<video>` sống, `MediaRecorder` thật, và 9 bẫy iOS ở §7 **chưa có một lần chạy nào trên thiết bị thật.**

---

## 10. KNOWN LIMITATIONS

| # | Giới hạn | Mức |
|---|---|---|
| L1 | **Chưa test trên thiết bị thật** (iPhone/Android). Camera + MediaRecorder + 9 bẫy iOS chỉ đúng theo tài liệu | 🔴 |
| L2 | **Tải 15.8 MB lần đầu.** Trên 4G Việt Nam 10–30 giây. Không có % tiến độ thật (fetch nằm trong WASM) | 🟠 |
| L3 | Repo nặng thêm **26 MB** vì ship cả 2 bản WASM. Runtime chỉ tải 1 bản, nhưng git/CI phải mang cả hai | 🟡 |
| L4 | **Thượng đình lệch hệ thống ~46%** — lưới 468 điểm không có đỉnh nào ở chân tóc. Đã ghi `estimated` + `note`, nhưng con số vẫn xuất ra JSON. Muốn đúng phải thêm segmentation chân tóc | 🟠 |
| L5 | `noseLength` lệch tới 44% theo pitch. Có cổng pose ±8° nên trong thực tế đỡ hơn, nhưng vẫn là field yếu nhất | 🟠 |
| L6 | **Thập Nhị Cung `unsupported`** — không phải chưa làm mà là công nghệ hiện tại không đo được (Phase 1B-2: 0/12 cung đạt S/N≥3, 9/12 đổi dấu theo pose) | ⚪ cố ý |
| L7 | `ear` `unsupported` — lưới không có landmark vành tai | ⚪ cố ý |
| L8 | `bbox` của `faceRegions` là **hộp bao 2D**, không phải đường viền thật của vùng | 🟡 |
| L9 | 2/12 bản đồ vùng gốc (Phu Thê, Điền Trạch) **sai giải phẫu** — đã ghi trong comment, giữ index để truy vết, nhưng chưa vẽ lại | 🟡 |
| L10 | `speechRate` là onset/giây, **không phải** số âm tiết/giây. Chưa hiệu chuẩn | ⚪ đã đánh dấu experimental |
| L11 | Trọng tâm phổ dùng **DFT thưa 64 dải**, không phải FFT đầy đủ. Đủ cho một con số thô | ⚪ có comment `ponytail:` |
| L12 | Chưa có `public/_headers` cache cho `/mediapipe/*`. Cloudflare vẫn cache mặc định. Thêm thì phải kiểm chứng không ghi đè `_headers` mà adapter tự sinh | 🟡 |
| L13 | `.task` phục vụ với `content-type` rỗng ở dev. Không ảnh hưởng (fetch dưới dạng arraybuffer), nhưng nên kiểm lại trên Cloudflare | 🟡 |
| L14 | Chỉ 1 khuôn mặt được test (`numFaces: 2` chưa test với 2 người thật trong khung) | 🟡 |

---

## 11. NEXT RECOMMENDED PHASE

**Không phải phase luận giải.** Việc cần làm ngay, theo thứ tự:

### Bước 1 — Test thiết bị thật (chặn mọi thứ phía sau)
Chạy dev server với HTTPS hoặc tunnel, mở trên iPhone và một Android tầm thấp. Đo:
- Thời gian tải 15.8 MB trên 4G thật
- fps thực tế của `detectForVideo` trên máy yếu
- MIME mà `MediaRecorder` chọn trên iOS (kỳ vọng `audio/mp4`)
- Đèn camera có tắt khi rời trang (`pagehide`)
- Video có bung fullscreen không

**Đây là việc duy nhất biến `PARTIAL PASS` thành `PASS`.** Không có gì thay thế được.

### Bước 2 — Sửa những thứ đã biết là sai (không cần thiết bị)
- Vẽ lại vùng **Phu Thê** (bỏ 234/127/162 và 454/356/389) và **Điền Trạch** — hỏng vì định nghĩa, không vì detector
- Rà nốt 6 cung "đáng ngờ" theo đúng cách đã dùng cho index 133
- Quyết định: có thêm segmentation chân tóc để chữa L4 không (mcp-gwansang đã chứng minh cách làm)

### Bước 3 — Thu dữ liệu hiệu chuẩn
POC chỉ ĐO. Trước khi luận giải được, cần biết **phân bố bình thường của người Việt** cho từng chỉ số `measured`. Hiện chưa có một con số tham chiếu nào. Dùng chính POC này thu 30–50 mẫu (có đồng ý) rồi tính phân vị — đó mới là nền cho ngưỡng, thay vì gõ tay như `ljtnine/face`.

### Chưa nên làm
Rule Engine / Knowledge Base / LLM. Lý do: chỉ có **4 field `measured`** (`eyeDistance`, `faceHeight`, `eye`, trung đình) và **chưa có phân bố tham chiếu nào**. Xây luận giải trên 4 con số không có mốc so sánh thì sẽ lại rơi vào đúng cái bẫy Phase 0 đã phát hiện ở Aura: ngưỡng gõ tay + LLM tự bịa.

---

## KẾT LUẬN

# `PARTIAL PASS`

### Đạt
- ✅ Phase A — branch an toàn, không mất một thay đổi nào của Công
- ✅ Phase B — hợp đồng dữ liệu V1 đủ 6 nhóm, `status` cho từng field, **không có field depth/fullness nào**, voice toàn bộ `experimental`
- ✅ Phase C — state machine 21 trạng thái, đồ thị chặn nhảy tắt, lỗi chia 2 loại đúng UX
- ✅ Phase D — cổng pose ±8/±8/±5, ~5 fps, chụp 1 frame rồi tắt camera, giải phóng ở mọi đường ra
- ✅ Phase E — 9 bẫy iOS xử lý theo tài liệu, MIME dò động
- ✅ Phase F — lazy-load **đã kiểm chứng bằng build** (32 KB vs 152 KB chunk riêng), asset local, không COOP/COEP, không đổi CSP
- ✅ Phase G — tách module đúng ranh giới: camera chỉ thu, geometry chỉ đo, voice chỉ thu
- ✅ Phase H — `PhysiognomyScanResult` + màn hình debug, **không một câu luận giải nào**
- ✅ Phase I — không upload gì, `prerender = true` nên trang không gọi server, đã kiểm chứng stream giải phóng
- ✅ Phase J — 6 màn hình theo đúng thiết kế, dùng style system hiện có
- ✅ Phase L — không Rule Engine, không KB, không LLM, không kết luận nhân tướng, không DB, không auth, không payment, không deploy
- ✅ 36 unit test pass · build thành công · detect khớp Phase 1B **chính xác** trên 4 ảnh thật
- ✅ **Tìm và sửa được một bug thật** (ma trận column-major) mà chỉ test trên ảnh thật mới lộ ra

### Chưa đạt
- ❌ **Phase K chưa hoàn thành.** Browser pane chặn camera/micro, và không có iPhone/Android để test. Vòng lặp camera sống, `MediaRecorder` thật, và toàn bộ 9 bẫy iOS **chưa chạy lần nào trên thiết bị thật**.

### Vì sao là PARTIAL PASS chứ không phải PASS
Mã đã viết xong, build được, test logic pass, và đường đo đã kiểm chứng khớp chính xác với Phase 1B trên ảnh thật. Nhưng một POC camera mà chưa từng mở camera trên điện thoại thì **không được gọi là PASS**. Bug ma trận column-major là bằng chứng: nó không lộ ra ở unit test, chỉ lộ khi đối chiếu với dữ liệu thật. Những bẫy iOS còn lại cũng cùng loại như vậy.

### Vì sao không phải BLOCKED
Không có vật cản kiến trúc nào. Route hoạt động, prerender đúng, asset serve đúng, chunk tách đúng, contract chạy đúng. Chỉ thiếu một buổi cầm điện thoại thật.

---

*Chỉ thu dữ liệu. Không Rule Engine, không Knowledge Base, không LLM, không kết luận nhân tướng. Chưa deploy.*
