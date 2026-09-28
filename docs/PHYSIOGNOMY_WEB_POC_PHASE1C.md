# PHASE 1C — QR + MOBILE SCANNER + DESKTOP CONTROLLER

**Ngày:** 2026-09-25
**Clone:** `phong-thuy-thien-anh-cloudflare-migration` · **Branch:** `feat/physiognomy-web-poc`
**Kết quả:** mọi thứ kiểm chứng được bằng code/browser đã chạy. Còn chờ test trên iPhone/Android thật.

---

## A. AUDIT TRƯỚC KHI CODE

| Câu hỏi | Kết quả audit |
|---|---|
| Framework/router | Astro 7.2.4, file-based routing `src/pages/**`, 301 route |
| Client state | Không có store nào — `<script>` thuần trong `.astro`, Vite bundle ESM. Không React/Vue/Svelte |
| Build/deploy Cloudflare | `@astrojs/cloudflare` 14.2.3 → Workers. Điểm vào tự viết `src/worker-entry.ts`, cấu hình `wrangler.jsonc`, static assets từ `./dist` qua binding `ASSETS` |
| **WebSocket / Durable Object** | ❌ **KHÔNG CÓ.** `grep WebSocket\|DurableObject\|durable_objects` trên `wrangler.jsonc` + `worker-entry.ts` → rỗng |
| **KV / D1 / state backend** | ⚠️ KV binding `SESSION` (id `6d7b9d11…`) **đã được cấp** trong `wrangler.jsonc` nhưng chưa dùng ở code. Có Neon Postgres + Drizzle (18 bảng) |
| Cách đọc env trong Workers | Qua module `cloudflare:workers` (`cf.env.X`) — **không** phải `Astro.locals.runtime.env` (đã bỏ từ Astro v6). Tiền lệ: `src/lib/kymon/tables.ts:51` |
| QR library | ❌ Không có. Đã thêm `qrcode-generator@2.0.4` (zero-dep) |

### Kiến trúc đã chọn: **KV + máy tính POLL**

Theo đúng thứ tự ưu tiên trong yêu cầu:

1. ~~WebSocket~~ — không có hạ tầng. Thêm Durable Object = binding mới + class runtime mới + sửa `wrangler.jsonc` → đúng thứ yêu cầu gọi là "backend lớn".
2. ~~Neon Postgres~~ — nhất quán mạnh và đã wired, nhưng phải thêm bảng + **chạy migration lên DB production** chỉ để demo. Nặng và rủi ro hơn mức cần cho POC.
3. ✅ **Cloudflare KV** — binding đã có sẵn, không cấp hạ tầng mới, **có TTL sẵn** nên hết hạn phiên miễn phí.

```
MÁY TÍNH                      CLOUDFLARE                    ĐIỆN THOẠI
  POST create        ─────►   KV: nt:sess:<id>
  ◄─ sessionId
  vẽ QR (SVG, lazy)
                                                    ◄──── quét QR
                              ◄──── POST connect ────────  nhận writeToken
  GET poll 1.5s      ─────►   đọc KV
  ◄─ SessionPublicView                                     6 bước khuôn mặt
                              ◄──── POST step ×6 ────────  (cần writeToken)
  vẽ ✓ dần                    ◄──── POST voice ─────────
                              ◄──── POST complete ──────
  ◄─ result                                                hiện "Đã hoàn tất"
```

**Tiền tố khoá `nt:sess:` là bắt buộc, không phải cho đẹp.** Log dev server xác nhận adapter thật sự dùng namespace đó:
```
[@astrojs/cloudflare] Enabling sessions with Cloudflare KV with the "SESSION" KV binding.
```
Comment trong `wrangler.jsonc` nói app không dùng Astro Sessions, nhưng **adapter vẫn tự bật** vì binding tồn tại. Nếu không đặt tiền tố thì hai bên có thể đụng khoá nhau.

**Trừu tượng để đổi được về sau:** `SessionStore` là interface với 3 method. Có 2 implementation: `KvSessionStore` (Workers) và `MemorySessionStore` (Node/vitest/`astro dev`). `resolveStore()` chọn theo `navigator.userAgent === "Cloudflare-Workers"`. Muốn đổi sang Durable Object thì viết implementation thứ ba, phần còn lại không phải sửa.

---

## 1. FILES CHANGED

### Tạo mới — 7 file mã + 2 test
```
 48  src/pages/nhan-tuong.astro                        route, prerender=true, chọn mode ở client
219  src/pages/api/nhan-tuong/session.ts               API phiên (điểm ĐỘNG duy nhất)
413  src/components/tools/NhanTuongDesktop.astro       QR + theo dõi tiến độ
577  src/components/tools/NhanTuongMobile.astro        6 bước mặt + giọng nói
201  src/features/physiognomy/session/types.ts         hợp đồng phiên + snapshot
254  src/features/physiognomy/session/steps.ts         định nghĩa 6 bước + cổng đạt
351  src/features/physiognomy/session/store.ts         SessionStore + KV + memory + nghiệp vụ
629  tests/nhan-tuong-session.test.ts                  63 test nghiệp vụ + cổng bước
390  tests/nhan-tuong-api.test.ts                      31 test HTTP thật
────
3082 dòng mới ở Phase 1C
```

### Sửa — 2 file
```
package.json / package-lock.json   + "qrcode-generator": "^2.0.4"   (zero-dep, 1 dòng)
```

### Xoá — 1 file
```
src/components/tools/NhanTuong.astro   component một-lần-chụp của Phase 1, đã bị thay bằng
                                       Desktop + Mobile. File của chính tôi, chưa track, xoá
                                       để không để lại code chết.
```

### Dùng lại nguyên vẹn từ Phase 1/1B (không sửa một dòng)
`camera/` · `landmarker/` · `geometry/` · `capture/quality.ts` · `capture/state-machine.ts` · `voice/recorder.ts` · `voice/features.ts` · `types/index.ts`

### `git status`: trước 28 mục → sau 32 mục, khác biệt **đúng 5 dòng**
```
- ?? src/components/tools/NhanTuong.astro          (xoá — của tôi)
+ ?? src/components/tools/NhanTuongDesktop.astro
+ ?? src/components/tools/NhanTuongMobile.astro
+ ?? src/pages/api/nhan-tuong/
+ ?? tests/nhan-tuong-api.test.ts
+ ?? tests/nhan-tuong-session.test.ts
```
Không dù`git add -A`, `reset --hard`, `clean`, `stash`. **Toàn bộ thay đổi song song của Công còn nguyên** (hkdq-luan-nha, dai-luc-nham, goi-ai.ts, phong-thuy-chinh-phai.astro, hkdq-web-module/, ảnh vip).

---

## 2. KIẾN TRÚC SESSION

### Trạng thái — đúng 11 giá trị theo yêu cầu
```ts
"waiting" | "connected" | "face_front" | "face_left" | "face_right" | "face_near"
| "face_pitch_down" | "face_pitch_up" | "voice" | "complete" | "failed"
```
Trạng thái = **bước vừa xong**. Xong đủ 6 bước → tự chuyển `voice`.

### URL — dựng từ origin hiện tại, KHÔNG hard-code
```ts
const u = new URL(location.pathname, location.origin);
u.searchParams.set("session", id);
u.searchParams.set("mode", "mobile");
```
Kiểm chứng trong browser: `http://localhost:4400/nhan-tuong/?session=ACNR6NT8WY&mode=mobile` — không có chuỗi `phongthuythienanh` nào bị nhúng cứng.

### Bảo mật (§J)

| Yêu cầu | Thực hiện |
|---|---|
| ID đủ ngẫu nhiên | `crypto.getRandomValues`, 10 ký tự từ bộ 31 ký tự ≈ **50 bit**. Không có WebCrypto thì **throw**, không rơi về `Math.random` |
| Không chứa thông tin cá nhân | Chỉ chữ/số từ `ABCDEFGHJKMNPQRSTUVWXYZ23456789`. Bỏ `0 O 1 I L` để khách đọc/gõ tay được nếu QR không quét nổi |
| Không có dữ liệu nhạy cảm trong URL | URL chỉ có `session` + `mode`. Không tên, ngày sinh, số điện thoại |
| Hết hạn | TTL **15 phút**, kiểm cả lúc đọc (kho) lẫn lúc ghi (nghiệp vụ). KV có `expirationTtl` nên tự dọn |
| **Dùng một lần** | `connectSession` chỉ thành công **một lần**. Máy thứ hai quét lại cùng QR → `409 already_connected` |
| Không ghi đè phiên khác | `writeToken` (24 ký tự) sinh ở lần connect đầu, chỉ trả cho đúng điện thoại đó. Mọi lệnh ghi phải kèm token. Token phiên A ghi vào phiên B → **403** |
| Không lộ token | `publicView()` cố tình không có `writeToken`. Test đọc nguyên văn response và khẳng định chuỗi token không xuất hiện |

Thêm ngoài yêu cầu: `Cache-Control: no-store` trên GET (phiên là dữ liệu sống, không được để CDN cache), và giới hạn body **16 KB** để chặn ai nhét ảnh base64 vào API số đo.

---

## 3. CAMERA FLOW (6 bước)

### Ngưỡng — và hiệu chuẩn dấu yaw bằng ảnh thật

| bước | cổng đạt |
|---|---|
| `front` | \|yaw\|≤8° · \|pitch\|≤8° · \|roll\|≤5° · coverage 0.25–0.85 |
| `left` | `yaw × YAW_SIGN_FOR_USER_LEFT ≥ 20°` |
| `right` | `yaw × (−YAW_SIGN_FOR_USER_LEFT) ≥ 20°` |
| `near` | coverage ≥ **0.62** — dùng KÍCH THƯỚC MẶT TƯƠNG ĐỐI, **không dùng trục z** |
| `pitch_down` | `pitch ≥ +20°` |
| `pitch_up` | `pitch ≤ −20°` |

Chung mọi bước: đúng 1 mặt · blur ≥ 0.0015 · sáng 0.18–0.92 · **3 frame liên tiếp** (~0.6s ở 5 fps).

**Hiệu chuẩn dấu yaw — đo, không đoán.** Chạy lại ảnh 4 (yaw = +27.84°) và đo hai nửa mặt:
```
nửa phía landmark 234 = 619.7 px  (rộng → hướng về camera)
nửa phía landmark 454 =  32.6 px  (hẹp  → BỊ QUAY RA XA camera, tỉ lệ 0.053)
→ yaw DƯƠNG = nửa mặt phía landmark 454 quay ra xa camera
```
Bước từ đó sang "trái/phải của chủ thể" dựa vào quy ước index của MediaPipe (454 ở nửa mặt bên trái), **không đo được trực tiếp**. Nên gói vào **một hằng số duy nhất** `YAW_SIGN_FOR_USER_LEFT: 1 | -1` kèm mục checklist. Nếu trên máy thật khách quay trái mà không nhận, đổi hằng số thành `-1` là xong — không phải sửa gì khác.

Quy ước pitch thì **đã kiểm chứng trên ảnh thật** ở Phase 1B-2: ảnh 6 (chúc xuống) = +18.51°, ảnh 7 (ngẩng lên) = −31.12°.

### Vì sao 20° chứ không nhiều hơn
Nhiễu pose đo được ở Phase 1B-2 là ±1.5° → 20° là hơn **13 lần nhiễu**, chắc chắn người dùng chủ động quay. Nhưng không được đòi lớn hơn: ảnh bán diện (~80°) ở Phase 1B-2 làm **detector trả về KHÔNG GÌ CẢ**.

### Không có nút chụp
Đủ 3 frame đạt → tự chốt bước, gửi snapshot, sang bước sau. Xong bước 6 → **tắt camera + `releaseLandmarker()` ngay**, không giữ stream qua bước giọng nói.

### `warnings` tách khỏi `reasons`
Quay quá 45° vẫn **ĐẠT**, chỉ đẩy cảnh báo vào `warnings`. Bản đầu tôi nhét vào `reasons` làm `passed` hoá `false` — một cảnh báo "quay khá nhiều rồi" lại vô tình chặn bước nó chỉ muốn nhắc. Test khoá điều này.

---

## 4. FEATURE SNAPSHOT

Đúng hình dạng yêu cầu ở §F, không thêm không bớt:
```ts
{ step, timestamp,
  quality:  { faceDetected, confidence, brightness, blur },
  pose:     { yaw, pitch, roll },
  geometry: { faceWidth, faceHeight, faceShapeRatio, middleCourt, upperCourt, lowerCourt } }
```

**Không có** `forehead_fullness`, `nose_fullness`, `cheek_fullness` — và API **chủ động loại bỏ** trường lạ: `parseSnapshot()` chỉ lấy đúng các trường đã khai. Test gửi `forehead_fullness: 0.82` + `nose_fullness: 0.7` và khẳng định chúng **không xuất hiện** trong dữ liệu phiên.

**Về `confidence`:** MediaPipe Face Landmarker **không trả điểm tin cậy** cho face mesh (khác face detection). Nên field này chứa `coverage` (tỉ lệ mặt/khung) kèm ghi chú ở cả `steps.ts` lẫn chỗ dựng snapshot — thay vì bịa ra một con số 0..1 trông như xác suất.

---

## 5. VOICE FLOW

Câu đọc: *"Xin chào bạn đến với Phong Thủy Thiên Anh"*. Thời lượng **10 giây**, tự dừng.

```ts
{ passed, durationMs, mimeType, sampleRate, hasAudio }
```
`passed` = pipeline chạy được **và có tiếng thật** (`durationMs > 500 && blob.size > 0`). Không speech-to-text, không phán xét nội dung nói — đúng phạm vi §G.

MIME dò động (đã có từ Phase 1B): webm/opus → webm → mp4/aac → mp4 → ogg. `mimeType` lưu là **MIME thật recorder chọn**, đọc từ `recorder.mimeType`, không phải cái ta yêu cầu. API cắt 80 ký tự.

---

## 6. QR

`qrcode-generator@2.0.4` — **zero dependency**, MIT. Không dùng external QR API. So sánh: `qrcode@1.5.4` kéo theo 3 dep (pngjs, yargs, dijkstrajs) → loại.

Render thành **SVG** (crisp ở mọi độ phân giải, không cần canvas), mức sửa lỗi **M** (~15%), viền trắng 2 module. Nạp trễ → chỉ máy tính tải 24 KB đó, điện thoại không tải.

Kiểm chứng trong browser: QR 41×41 module, 678 module đen, encode đúng URL có `session=` + `mode=mobile`.

---

## 7. PRIVACY

| Yêu cầu | Thực hiện |
|---|---|
| Không upload ảnh | ✅ Frame chỉ vào canvas trong memory |
| Không upload video | ✅ |
| Không upload audio | ✅ Blob chỉ trong memory |
| Chỉ lưu state cần cho POC | ✅ Phiên chứa: id, status, mốc thời gian, 6 snapshot số đo, metadata giọng nói |
| Không lưu tên/ngày sinh/SĐT | ✅ Không có field nào nhận thứ đó |
| Text hiển thị trên mobile | ✅ Đúng nguyên văn hai câu yêu cầu ở §O |

Trang `/nhan-tuong` vẫn `prerender = true` → `src/middleware.ts` tự bỏ qua (`if (context.isPrerendered) return next()`) → không truy vấn DB, không đọc cookie, không ghi session đăng nhập. Chỉ `/api/nhan-tuong/session` là động.

Câu hiển thị dùng được vì implementation **đúng** như vậy:
> *"Dữ liệu kiểm tra được xử lý trên thiết bị trong phạm vi POC."*
> *"Hệ thống không lưu ảnh/video khuôn mặt nếu chưa có sự đồng ý riêng."*

---

## 8. PERFORMANCE

```
Mở trang (cả 2 chế độ):
  NhanTuongDesktop…js     8 KB
  NhanTuongMobile…js     24 KB
  CartScript…js           4 KB          → 36 KB
Chunk LAZY (không nạp lúc mở trang):
  vision_bundle…js      152 KB   chỉ điện thoại, chỉ sau khi bấm BẮT ĐẦU
  qrcode…js              24 KB   chỉ máy tính, chỉ khi vẽ QR
  + WASM 11.76 MB + model 3.76 MB   chỉ điện thoại
```
**Máy tính KHÔNG nạp MediaPipe, KHÔNG mở camera.** Đúng yêu cầu §N.

---

## 9. TESTS

### POC: **198 test, tất cả PASS** (4 file)
```
tests/nhan-tuong-scan.test.ts       36   (Phase 1)
tests/nhan-tuong-phase1b.test.ts    68   (Phase 1B)
tests/nhan-tuong-session.test.ts    63   (MỚI — nghiệp vụ phiên + cổng 6 bước)
tests/nhan-tuong-api.test.ts        31   (MỚI — HTTP thật)
```

**Session (24):** tạo phiên · TTL 15 phút · id không có ký tự nhập nhằng · **2000 id không trùng** · token dài hơn id · connect lần đầu · **dùng một lần (409)** · id không tồn tại · hết hạn · đã hoàn tất · chuyển trạng thái từng bước · 6 bước xong → `voice` · complete + completedAt · đã complete thì chặn ghi · fail + lý do · lý do cắt 300 ký tự · **token sai → bad_token** · phiên chưa connect thì mọi token đều sai · **cách ly phiên A/B** · `publicView` không lộ token · bước lạ bị chặn · đọc sau hết hạn → null · ghi vào phiên hết hạn

**Cổng 6 bước (28):** không mặt/nhiều mặt/mờ/tối/cháy sáng chặn mọi bước · front đạt · yaw/pitch/roll vượt ngưỡng · mặt quá nhỏ/quá sát · thiếu pose → không đoán bừa · **left/right đúng chiều mới đạt, sai chiều không đạt** · progress 0→1 · quay quá nhiều vẫn đạt (cảnh báo ở `warnings`) · near đủ gần · ngưỡng near > ngưỡng thường · **near không xét pose** · pitch down/up đúng dấu · thứ tự 6 bước · `nextStep` tuần tự · mỗi bước có nhãn+hướng dẫn+nhắc · mỗi bước có status riêng

**API HTTP (31):** create 201 · không trả token ở create · action lạ 400 · body không JSON 400 · GET thiếu id 400 · id lạ 404 · phiên mới `waiting` · **`Cache-Control: no-store`** · **GET không bao giờ lộ token** · connect 200/409/404/400 · thiếu token 401 · token sai 403 · step đúng 200 · step lạ 400 · thiếu quality/pose/geometry 400 · số không hợp lệ 400 · **null được chấp nhận (chưa đo được ≠ lỗi)** · **trường lạ bị loại bỏ** · **body > 16 KB → 413** · voice đúng/thiếu trường/mimeType cắt 80/null · tích hợp trọn luồng · sau complete chặn ghi · fail + lý do · cách ly A/B · kết quả không chứa trường phán xét

### Tích hợp đầu-cuối trên **Workers runtime thật** (`wrangler dev --local`)
```
1. desktop create    → sessionId = MQ9XZVRTF5
2. mobile connect    → writeToken
3. connect lần 2     → HTTP 409                    ✓ phiên dùng một lần
4. 6 bước            → face_front … face_pitch_up → voice
5. voice             → gửi xong
6. complete          → {"status":"complete"}
7. desktop poll      → stepsDone 6/6 · voice PASS audio/mp4 · overall "pass"
                       writeToken lộ? KHÔNG
```

**Xác nhận dùng KV THẬT, không rơi về memory:**
```
$ npx wrangler kv key list --binding SESSION --local
[ { "name": "nt:sess:MQ9XZVRTF5", "expiration": 1790309837 } ]
```
Đúng tiền tố, đúng TTL.

### Desktop TỰ NHẬN kết quả — đo trong browser thật, không reload
```
mốc                     màn hình     tick 6 bước    giọng nói
trước khi kết nối       chờ QR       ○○○○○○         Chưa kiểm tra
sau connect             tiến độ      ○○○○○○         Chưa kiểm tra
sau 3 bước              tiến độ      ✓✓✓○○○         Chưa kiểm tra
sau 6 bước + voice      tiến độ      ✓✓✓✓✓✓         Đã nhận (10.2s)
sau complete            hoàn tất     ✓✓✓✓✓✓         PASS (6/6) · PASS · PASS
```

### Mobile UX — 4 viewport × 6 màn hình, trên bản BUILD production
| viewport | overflow trong POC | nút < 44px | text bị cắt | khung dẫn hướng trong video |
|---|---|---|---|---|
| 375×812 | ✅ 0 | ✅ 0 | ✅ 0 | ✅ (video 299px) |
| 390×844 | ✅ 0 | ✅ 0 | ✅ 0 | ✅ (314px) |
| 412×915 | ✅ 0 | ✅ 0 | ✅ 0 | ✅ (336px) |
| 360×800 | ✅ 0 | ✅ 0 | ✅ 0 | ✅ (284px) |

`<video>` có đủ `playsinline` + `webkit-playsinline` + `muted` trong HTML **build**.

### Mode guard
`?mode=mobile` → khối desktop ẩn, **và desktop KHÔNG tạo phiên** (`desktopQrCreated: false`). Không có phiên rỗng rác trong KV.

Session sai → *"Không kết nối được phiên: Phiên không tồn tại hoặc đã hết hạn."*, nút BẮT ĐẦU bị vô hiệu hoá, không sập.

### FULL SUITE
```
Test Files  2 failed | 150 passed (152)
Tests       3 failed | 2540 passed | 5 expected fail (2548)
```
3 lỗi là **`environmental timeout`** — y như Phase 1 và 1B, ở đúng 2 file cũ (`g10-lunar-policy-golden`, `phase2-toa-huong-mo`), vượt mốc mặc định 5000ms. Chạy `--testTimeout=90000` → **83/83 PASS**. Hai file không import gì của POC. **Không sửa code không liên quan.**

---

## 10. BA LỖI DO TEST/BUILD BẮT ĐƯỢC

**1. Test `Response` body đọc hai lần** — helper `get()` gọi `res.json()` rồi test lại gọi `res.text()`. Body của `Response` chỉ đọc được MỘT lần, nên 3 test đổ. Sửa helper trả cả `json` lẫn `text` từ một lần đọc. *Lỗi test, không phải lỗi code.*

**2. Test hết hạn dùng mốc quá khứ** — truyền `now = 1_700_000_000_000` (2023) nên phiên chết ngay khi vừa tạo so với `Date.now()` thật (2026). Đó là hành vi ĐÚNG, nhưng không phải điều test muốn kiểm. *Lỗi test.*

**3. `warnings` lẫn vào `reasons`** — cảnh báo "quay khá nhiều" làm `passed` hoá `false`. *Lỗi thiết kế thật*, đã tách hai mảng.

---

## ⚠️ 11. TÔI ĐÃ LÀM HỎNG DEV SERVER CỦA CÔNG — VÀ ĐÃ SỬA

Dev server của Công đang chạy ở `:4321` (uptime ~35 phút) **trước khi** tôi chạy `npm install`. Hai lần cài (`@mediapipe/tasks-vision` ở Phase 1, `qrcode-generator` ở phase này) làm mất cache dep của Vite, nên **mọi route động trả HTTP 500**:
```
The file does not exist at ".../node_modules/.vite/deps_ssr/@astrojs_cloudflare_entrypoints_server.js"
```
Trang tĩnh vẫn 200, nên lỗi dễ bị bỏ qua.

**Đã sửa:** `astro dev stop` → `rm -rf node_modules/.vite` → `astro dev --background`. Lần đầu khởi động lại vượt mốc timeout 30s của wrapper (máy phải tối ưu lại dep từ đầu); lần sau thì lên bình thường. Đã kiểm chứng route động sống lại, gồm **cả route của Công**:
```
POST /api/nhan-tuong/session        → {"sessionId":"YXZTM8NHVA", ...}
GET  /api/doi-lich-am-duong?...     → HTTP 200   (route của Công, không phải của tôi)
GET  /nhan-tuong                    → HTTP 200
```
Dev server hiện chạy bình thường ở `:4321`.

**Bài học cho lần sau:** chạy `npm install` khi có dev server đang chạy sẽ làm hỏng nó. Nên `astro dev stop` trước, hoặc báo trước.

---

## 12. KNOWN LIMITATIONS

| # | Vấn đề | Mức |
|---|---|---|
| L1 | **Chưa test trên iPhone/Android thật.** Toàn bộ camera/micro/6 bước chỉ chạy qua API và viewport mô phỏng | 🔴 |
| L2 | **`YAW_SIGN_FOR_USER_LEFT` chưa xác nhận trên người thật.** Suy từ quy ước index MediaPipe, không đo được trực tiếp. Nếu ngược thì "quay trái" không nhận — sửa 1 hằng số | 🟠 |
| L3 | **KV nhất quán theo thời gian.** Cùng colo thì đọc thấy gần như ngay; khác colo có thể tới 60s. Máy tính + điện thoại cùng phòng → cùng colo (HKG) → thực tế ổn. Nếu tiến độ trên máy tính bị trễ, đường nâng cấp là Durable Object (viết 1 implementation `SessionStore`) | 🟠 |
| L4 | **Chunk mobile 24 KB vẫn tải trên máy tính** (và ngược lại desktop 8 KB tải trên điện thoại) vì cả hai component nằm chung một trang tĩnh. Muốn bỏ hẳn thì phải SSR hoặc dynamic import | 🟡 |
| L5 | Tải 15.8 MB (WASM + model) lần đầu trên điện thoại. Chưa đo trên 4G thật | 🟠 |
| L6 | Ngưỡng 20° / coverage 0.62 **chưa hiệu chuẩn trên người thật** — có thể quá chặt hoặc quá lỏng | 🟠 |
| L7 | `quality.confidence` là `coverage`, **không phải xác suất** — MediaPipe face mesh không trả confidence. Đã ghi chú ở code, nhưng người đọc JSON vẫn có thể hiểu sai tên field | 🟡 |
| L8 | Phiên hết hạn giữa lúc đang quét → điện thoại báo lỗi và phải lấy QR mới. Chưa có gia hạn tự động | 🟡 |
| L9 | Nếu điện thoại đóng trang giữa đường, phiên nằm ở trạng thái dở dang tới khi TTL hết. Máy tính không biết phân biệt "đang làm" với "đã bỏ" | 🟡 |
| L10 | Chưa có rate limit trên API. POC chạy nội bộ nên chưa cần, nhưng mở công khai thì phải thêm | 🟡 |
| L11 | Bản đồ 12 cung của Phase 1B **chưa dùng ở Phase 1C** — snapshot chỉ lưu ba đình + hình học cơ bản theo đúng hợp đồng §F | ⚪ cố ý |
| L12 | `noBoc` vẫn `mapping: "unknown"` từ Phase 1B | ⚪ cố ý |

---

# BÁO CÁO NGẮN

```
PHASE 1C RESULT

Files changed:
  + 7 file mã (3082 dòng) + 2 test file
  + 1 dependency (qrcode-generator, zero-dep)
  − 1 file của chính tôi (NhanTuong.astro, đã bị thay)
  Không đụng file nào của Công

Tests:
  198 PASS / 0 FAIL   (POC, 4 file)
  2540 PASS / 3 FAIL  (full suite — 3 lỗi là environmental timeout ở 2 file
                       không liên quan; --testTimeout=90000 → 83/83 PASS)

Build:              PASS  (/nhan-tuong/index.html prerender; chunk lazy đúng)
Desktop:            PASS  (QR 41×41, tự nhận tiến độ ○○○○○○ → ✓✓✓✓✓✓ → PASS 6/6)
Mobile:             PASS  (4 viewport × 6 màn hình sạch; mode guard đúng)
Session:            PASS  (dùng một lần 409 · cách ly A/B 403 · không lộ token · TTL 15')
QR:                 PASS  (SVG, encode đúng URL, dựng từ origin hiện tại)
Camera:             PARTIAL — logic 6 bước PASS bằng unit test; chưa chạy camera thật
Voice:              PARTIAL — pipeline + MIME PASS bằng test mock; chưa ghi âm thật

Known limitations:  12 mục ở §12. Chặn chính: L1 (thiết bị thật), L2 (dấu yaw), L3 (KV)
```

---

# M. DEVICE TEST CHECKLIST

Chạy trên `astro dev` (`:4321`) qua HTTPS/tunnel, hoặc staging. **Chưa deploy production.**

## iPhone Safari
- [ ] **QR scan** — camera hệ thống quét QR trên màn hình máy tính, mở đúng trang
- [ ] **Session connect** — hiện "✓ Điện thoại đã kết nối", nút BẮT ĐẦU sáng lên
- [ ] **Camera permission** — prompt hiện sau khi bấm BẮT ĐẦU (không tự hiện lúc vào trang)
- [ ] **front** — nhìn thẳng → khung viền chuyển vàng → tự chốt
- [ ] **left** — ⚠️ **XÁC NHẬN CHIỀU**. Nếu quay trái mà không nhận, đổi `YAW_SIGN_FOR_USER_LEFT` thành `-1` trong `src/features/physiognomy/session/steps.ts`
- [ ] **right** — quay phải nhận đúng
- [ ] **near** — đưa máy gần, coverage đạt 0.62
- [ ] **pitch down** — cúi xuống nhận đúng (không phải ngẩng)
- [ ] **pitch up** — ngẩng lên nhận đúng
- [ ] **Microphone permission** — prompt riêng, sau khi bấm BẮT ĐẦU GHI
- [ ] **MediaRecorder** — ghi được, thanh mức nhảy theo giọng
- [ ] **MIME** — kỳ vọng `audio/mp4…`, **không phải webm**. Xem trên máy tính hoặc debug panel
- [ ] **Voice capture** — đếm giây chạy, tự dừng ở 10s
- [ ] **leave/reopen** — rời trang giữa lúc quét rồi mở lại: **phiên dùng một lần nên phải lấy QR mới** — xác nhận thông báo rõ ràng, không treo
- [ ] **Camera cleanup** — rời trang → **đèn camera tắt**
- [ ] **No fullscreen** — `<video>` nằm gọn trong khung, không bung toàn màn hình
- [ ] **Desktop nhận kết quả** — máy tính hiện PASS (6/6) mà không cần reload

## Android Chrome
- [ ] **QR scan** · **Session connect** · **Camera permission**
- [ ] **front** · **left** · **right** · **near** · **pitch down** · **pitch up**
- [ ] **Microphone** · **Voice recording** · **MIME** (kỳ vọng `audio/webm;codecs=opus`)
- [ ] **Cleanup** — rời trang → camera nhả
- [ ] **Performance/FPS** — máy tầm thấp: đo fps thực tế, thời gian tải 15.8 MB trên 4G, có nóng máy không

## Ghi lại khi test
Với mỗi máy: model · phiên bản OS · thời gian tải model · fps quan sát được · `voice.mimeType` · **chiều quay trái/phải có đúng không**. Riêng mục cuối quyết định giá trị của `YAW_SIGN_FOR_USER_LEFT`.

---

*Chưa Rule Engine. Chưa Knowledge Base. Chưa LLM. Chưa luận giải nhân tướng. Chưa dùng trục z để suy độ đầy/lõm. Chưa deploy production.*
