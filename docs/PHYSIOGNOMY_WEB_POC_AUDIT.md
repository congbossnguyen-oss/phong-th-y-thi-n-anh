# PHYSIOGNOMY WEB POC — AUDIT ROUTE `/nhan-tuong`

**Ngày:** 2026-09-25
**Phạm vi:** Chỉ audit. Không sửa code, không cài package, không deploy, không tạo API/DB.
**File này là file mới chưa được track** — xoá hoặc commit tuỳ Công.

> Mọi kết luận dưới đây đều có `FILE → FUNCTION/COMPONENT → lý do`, và gắn nhãn `SAFE` / `WARNING` / `BLOCKER`.

---

## ⚠️ PHÁT HIỆN QUAN TRỌNG NHẤT — ĐỌC TRƯỚC

**`BLOCKER` — Repo có hai bản clone với hai kiến trúc deploy khác nhau, và bản Công hay mở KHÔNG phải production.**

| clone | branch | adapter | là production? |
|---|---|---|---|
| `phong-thuy-thien-anh` | `quan-su-thien-anh` | `@astrojs/node` ^11 (Render) | ❌ **KHÔNG** |
| `phong-thuy-thien-anh-cloudflare-migration` | `cloudflare-migration` | `@astrojs/cloudflare` ^14.2.3 (Workers) | ✅ **CÓ** |

Bằng chứng production chạy Cloudflare Workers:

```
$ curl -sSI https://phongthuythienanh.com/
Server: cloudflare
CF-Cache-Status: HIT
CF-RAY: a4067411fd85e6ca-HKG
(KHÔNG có bất kỳ header nào của Render)

$ curl -sSI https://phongthuythienanh.com/gio-hang     # route động, bỏ qua cache
Server: cloudflare
$ curl -sSI https://phongthuythienanh.com/api/thong-bao/gui-nhac-ngay-le   # cả trang 404
Server: cloudflare
```

Đã loại trừ khả năng "Cloudflare chỉ proxy trước Render": kiểm tra cả route tĩnh (cache HIT), route động (không cache) và cả một 404 — không chỗ nào lộ header origin Render.

Chính repo cũng tự ghi điều này, ở `src/middleware.ts:31-33`:

> ⚠️ 31/8/2026: nhánh production (cloudflare-migration) ĐÃ mở công khai `/quan-su/*` (Giai Đoạn A) — khối này ở nhánh main đang **LỆCH kiến trúc so với production**… **Đừng tưởng nhầm main = trạng thái thật.**

Ngược lại, `wrangler.jsonc:1-2` vẫn ghi *"CHƯA deploy, CHƯA đổi DNS"* — **comment này đã lỗi thời**, mâu thuẫn với chính middleware (ghi sau, 31/8) và với header thật.

**Hệ quả cho POC:** nếu xây `/nhan-tuong` trên clone `phong-thuy-thien-anh` (adapter Node), nó sẽ được viết cho một kiến trúc không chạy trên production. Phải xây trên **`phong-thuy-thien-anh-cloudflare-migration`**.

---

## A. CURRENT STACK

| Hạng mục | Giá trị | Nguồn |
|---|---|---|
| Framework | **Astro 7.2.4** (production) / 7.1.6 (main) | `package.json` |
| Deploy | **Cloudflare Workers** + Static Assets | `wrangler.jsonc`, `astro.config.mjs:98` |
| Điểm vào Worker | `src/worker-entry.ts` (tự viết, bọc `@astrojs/cloudflare/entrypoints/server` để thêm `scheduled()` cho Cron) | `wrangler.jsonc` `"main"` |
| Runtime flags | `nodejs_compat` đã bật | `wrangler.jsonc` `compatibility_flags` |
| Static assets | `./dist` → binding `ASSETS` | `wrangler.jsonc` `"assets"` |
| Routing | Astro file-based, `src/pages/**` — **301 route** | `find src/pages` |
| Render mode | **223 trang `prerender = false` (SSR) · 59 trang `prerender = true` (tĩnh)** | `grep -rl "prerender"` |
| Build system | Vite (qua Astro) + `@cloudflare/vite-plugin` | `astro.config.mjs` |
| Package manager | **npm** + workspaces `packages/*` | `package.json`, `package-lock.json` |
| Ngôn ngữ | **TypeScript** (`tsconfig.json`), component `.astro` | repo root |
| CSS/UI | **Tailwind CSS 4** qua `@tailwindcss/vite` (không dùng `@astrojs/tailwind`) | `astro.config.mjs` `vite.plugins` |
| **UI framework** | **KHÔNG CÓ.** Không React/Vue/Svelte/Preact/Solid | `grep "@astrojs/react\|vue\|svelte..."` → rỗng |
| Client logic | `<script>` thuần trong `.astro`, Vite bundle thành ESM — **34 trang đã dùng** | `grep -rl "<script" src/pages` |
| DB | Drizzle ORM 0.45 + Neon serverless Postgres | `package.json`, `db/` |
| CMS | Sanity client 7.26 | `package.json`, `studio/` |
| Auth | Session tự cài trong DB, cookie + IP binding | `src/lib/auth/session.ts`, `src/middleware.ts` |
| Node | yêu cầu `>=22.12.0`, máy đang có **v24.18.1** | `package.json` `engines` |
| Domain | `site: 'https://phongthuythienanh.com'` | `astro.config.mjs:80` |
| Layout duy nhất | `src/layouts/BaseLayout.astro` | `ls src/layouts` |
| Component công cụ | **25+ file** trong `src/components/tools/` | `ls src/components/tools` |

### `WARNING` — cả hai clone đang bẩn

```
phong-thuy-thien-anh           : 112 file thay đổi chưa commit
phong-thuy-thien-anh-cloudflare: 11 file thay đổi chưa commit
```

Bắt đầu việc mới trên cây làm việc bẩn dễ dẫn tới commit lẫn lộn. Nên tạo nhánh riêng cho POC từ `cloudflare-migration` sạch.

---

## B. `/nhan-tuong` ROUTE

### `SAFE` — Route CHƯA TỒN TẠI. Đường đi hoàn toàn trống.

Xác minh bằng **3 cách độc lập**:

```
1. find src/pages -iname "*nhan-tuong*"        (cả 2 clone)  -> rỗng
2. grep -ril "nhan-tuong|nhân tướng" src/ content/           -> rỗng
3. curl -o /dev/null -w "%{http_code}" https://phongthuythienanh.com/nhan-tuong
   -> HTTP 404
```

Không có redirect nào trỏ tới nó (`astro.config.mjs` `redirects` chỉ có `/lap-thai-at`). Không có xung đột tên. Không bị middleware chặn (xem §F).

### `FILE → COMPONENT → ROUTE` — khuôn mẫu đã có sẵn trong repo

Lấy nguyên khuôn từ `src/pages/tinh-trung-tang.astro` (một công cụ tĩnh, không cần đăng nhập — đúng hình dạng POC cần):

```
src/pages/tinh-trung-tang.astro          →  route /tinh-trung-tang
  ├─ import BaseLayout  from "../layouts/BaseLayout.astro"
  ├─ import PageHero    from "../components/ui/PageHero.astro"
  ├─ import Container   from "../components/ui/Container.astro"
  ├─ import TinhTrungTang from "../components/tools/TinhTrungTang.astro"   ← toàn bộ logic ở đây
  └─ export const prerender = true;                                        ← trang TĨNH
```

Nên POC đi đúng đường đó:

```
src/pages/nhan-tuong.astro               →  route /nhan-tuong
  └─ src/components/tools/NhanTuong.astro   ← camera + MediaPipe + voice + feature JSON
     export const prerender = true;
```

---

## C. CAMERA INTEGRATION

### `SAFE` — kiến trúc phù hợp hoàn toàn với `navigator.mediaDevices.getUserMedia()`

| Hạng mục | Trạng thái | Lý do / nguồn |
|---|---|---|
| **Vấn đề SSR** | ✅ **KHÔNG CÓ** | Trong Astro, `<script>` trong `.astro` **chỉ chạy ở client** (Vite bundle, ESM, defer). Phần frontmatter `---` mới chạy server. Chỉ cần: **không chạm `navigator`/`window` trong frontmatter.** Với `prerender = true` thì trang là HTML tĩnh, server không tham gia gì. |
| **Secure context / HTTPS** | ✅ SAFE | Production là `https://` (xác nhận bằng curl). `http://localhost` cũng là secure context → dev chạy được. |
| **CSP chặn?** | ✅ SAFE | Toàn repo chỉ có **1** chỗ đặt CSP: `src/pages/hoc-vien/khoa-hoc/[slug]/bai-hoc/[lessonSlug].astro:54` → `frame-ancestors 'self'` (chỉ chống nhúng iframe, không liên quan media/wasm). **Không có CSP toàn site.** |
| **Permissions-Policy** | ✅ SAFE | Không có header nào chặn `camera=()` / `microphone=()`. Đã grep toàn `src/` + config. |
| **viewport mobile** | ✅ SAFE | `src/layouts/BaseLayout.astro:72` → `<meta name="viewport" content="width=device-width, initial-scale=1" />` |
| **Front camera** | ✅ | `getUserMedia({ video: { facingMode: 'user' } })` |
| **Rear camera** | ✅ | `facingMode: 'environment'` — nhưng POC nhân tướng chỉ cần camera trước |
| **Tiền lệ trong repo** | ⚠️ **CHƯA CÓ** | `grep "getUserMedia\|mediaDevices"` trên `src/` → **rỗng**. Đây là lần đầu repo dùng camera. Không có vật cản, nhưng cũng không có code mẫu để sao. |

### `WARNING` — ba cái bẫy iOS Safari phải xử lý ngay từ đầu

1. **`playsinline` bắt buộc.** Thiếu attribute này, iOS Safari tự bung video ra fullscreen và phá layout:
   `<video autoplay muted playsinline></video>` — thiếu `muted` thì `autoplay` cũng bị chặn.
2. **Bắt buộc có cử chỉ người dùng.** `getUserMedia()` phải được gọi từ trong handler của một lần bấm/chạm thật. Không gọi được trong `onMount`/`DOMContentLoaded`. *Repo đã gặp đúng bài này với âm thanh — xem comment `src/components/quan-su/TourChaoMung.astro:552`: "chỉ PHÁT âm thanh mới cần cử chỉ".*
3. **Chỉ một `getUserMedia` sống một lúc.** iOS hay treo nếu mở stream mới khi stream cũ chưa `stop()`. Xem §H.

### Video resolution & frame processing — đề xuất

`Phase 1B` đã chứng minh: chỉ cần **vài frame tốt**, không cần stream liên tục (xem §H). Nên:
- `video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }`
- Không xử lý mọi frame. Chỉ chạy detector khi người dùng đã bấm "Quét", và dừng ngay khi đủ.

---

## D. MEDIAPIPE INTEGRATION

### `SAFE` — tích hợp được, nhưng phải lazy-load và đặt asset local

| Hạng mục | Kết luận |
|---|---|
| **Package đã có chưa?** | ❌ **CHƯA.** `grep "mediapipe\|tasks-vision\|tensorflow\|onnxruntime"` trên `package.json` **và** `package-lock.json` → rỗng. Cần thêm **đúng 1 dependency**: `@mediapipe/tasks-vision`. |
| **Model asset đặt đâu** | `public/mediapipe/face_landmarker.task` → Astro copy `public/` sang `dist/client/`, Cloudflare phục vụ qua Static Assets (`wrangler.jsonc` `"assets": { "directory": "./dist" }`). URL runtime: `/mediapipe/face_landmarker.task` |
| **WASM asset đặt đâu** | `public/mediapipe/wasm/` (chứa `vision_wasm_internal.js` + `.wasm`), nạp bằng `FilesetResolver.forVisionTasks('/mediapipe/wasm')` |
| **Giới hạn kích thước** | ✅ SAFE. Cloudflare Static Assets cho **25 MiB/file**. Model `face_landmarker.task` = **3.7 MB** (đã đo thật ở Phase 1B), WASM vài MB. Dư sức. |
| **Web Worker cần không?** | ❌ **Không cần cho POC.** MediaPipe Tasks Vision chạy trên main thread được. *Nên* chuyển sang worker ở V2 nếu UI bị giật trên máy yếu. |
| **CDN hay local** | ✅ **Local** — đúng ưu tiên của Công, và kiến trúc cho phép. Lợi thêm: không phụ thuộc jsDelivr, không rủi ro version trôi, và Cloudflare edge phục vụ ngay tại HKG (xem `CF-RAY: ...-HKG`). |
| **Lazy loading** | ✅ **Có tiền lệ sẵn trong repo** — 4 chỗ đã dùng đúng pattern này: `src/pages/gieo-que-kinh-dich.astro:763` `await import("html-to-image")`, `lap-la-so-bat-tu.astro:296,703`, `lap-la-so-tu-vi.astro:806`. Làm y hệt: `const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision")` bên trong handler nút "Bắt đầu quét". |
| **Bundle size** | `WARNING` — JS của `tasks-vision` vài trăm KB + WASM ~3 MB + model 3.7 MB ≈ **~7 MB tải lần đầu**. **Tuyệt đối không để vào bundle chính.** Nếu import tĩnh ở đầu component, mọi khách vào trang đều tải 7 MB. |

### `WARNING` — COOP/COEP: đừng bật

MediaPipe Tasks Vision có bản WASM **đa luồng** (cần `SharedArrayBuffer` → cần `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp`). **Không nên bật:** hai header đó sẽ phá mọi iframe/ảnh/script cross-origin trên toàn site (Sanity CDN, ảnh ngoài, nhúng video). Bản **đơn luồng không cần** SharedArrayBuffer và chạy thừa đủ cho POC. → **Giữ đơn luồng, không thêm header nào.**

### `WARNING` — file `_headers` có thể xung đột

Adapter tự sinh `dist/client/_headers` (hiện chứa `/_astro/* → Cache-Control: immutable`). Nếu Công tạo `public/_headers` để cache `/mediapipe/*`, Astro sẽ copy nó vào cùng đường dẫn đó → **có nguy cơ ghi đè header của adapter**. Phải kiểm chứng bằng một lần `npm run build` rồi đọc `dist/client/_headers` trước khi tin. Không bắt buộc cho POC (Cloudflare vẫn cache mặc định); chỉ là tối ưu.

---

## E. VOICE INTEGRATION

### `SAFE` — và đây là phần có tiền lệ vững nhất trong repo

**Web Audio API đã chạy thật trong kiến trúc này**, không phải giả định:

```
src/components/quan-su/TourChaoMung.astro
  :233  let khungAm: AudioContext | null = null;
  :234  function moKhungAm(): AudioContext | null {
  :236    khungAm = new (window.AudioContext || (window as any).webkitAudioContext)();
  :249  async function taiGoPhim(ctx: AudioContext): Promise<AudioBuffer | null>
  :552  // comment: AudioContext "suspended" — chỉ PHÁT mới cần cử chỉ người dùng
```

Chú ý cả fallback `webkitAudioContext` — người viết trước đã xử lý Safari. Dùng lại đúng khuôn này.

| Hạng mục | Kết luận |
|---|---|
| `MediaRecorder` | ⚠️ Chưa dùng ở đâu (`grep` → rỗng), nhưng không có vật cản. Chỉ cần `getUserMedia({ audio: true })` rồi `new MediaRecorder(stream)`. |
| Web Audio features | ✅ `AudioContext` → `createMediaStreamSource` → `AnalyserNode` cho RMS/năng lượng/cao độ thô. Không cần thư viện. |
| Speech-to-text | ✅ Không cần ở V1, đúng như yêu cầu. |
| Mục tiêu 10–20s | ✅ `MediaRecorder.start()` + `setTimeout(stop, 15000)` → `Blob` trong `ondataavailable`. |
| Upload server | ✅ **Không cần.** Blob giữ trong memory / `URL.createObjectURL` để nghe lại. Không tạo API route nào. |

### `WARNING` — codec MediaRecorder khác nhau giữa iOS và Android

Đừng hard-code `'audio/webm'`. iOS Safari (từ 14.3) trả về **`audio/mp4`**, Chrome Android trả `audio/webm`. Phải dò:

```js
const mime = ['audio/webm', 'audio/mp4'].find(t => MediaRecorder.isTypeSupported(t));
```

Hard-code `webm` là lỗi kinh điển làm iPhone im lặng không báo lỗi.

---

## F. PRIVACY

### `SAFE` — xử lý 100% client-side là khả thi, và kiến trúc thậm chí còn ủng hộ

Luồng mong muốn đạt được nguyên vẹn:

```
Camera → Browser → MediaPipe (WASM local) → Feature JSON     [không byte nào ra khỏi máy]
Microphone → Browser → Web Audio → audio features/Blob        [không upload]
```

**Ba lý do kiến trúc khiến điều này tự nhiên, không phải cố gắng:**

1. **`prerender = true` → trang là HTML tĩnh.** Server không nhận request nào khi người dùng quét. Cloudflare chỉ phục vụ file tĩnh từ edge.
2. **Middleware tự bỏ qua trang tĩnh.** `src/middleware.ts:11-13`:
   ```ts
   if (context.isPrerendered) {
     return next();
   }
   ```
   → Không truy vấn DB, không đọc cookie, không ghi log session cho `/nhan-tuong`.
3. **Middleware không chặn `/nhan-tuong`.** Chỉ chặn `/quan-su/*` và `/dai-cat-loi/xem-huong-nha-bat-trach/kiem-chung` (`src/middleware.ts:41-56`). Route mới mở công khai, không cần đăng nhập.

**Không cần chạm vào:** `db/`, Drizzle, Neon, `src/pages/api/**`, session, Sanity. Zero lưu dữ liệu khách ở POC — đúng yêu cầu.

### `WARNING` — vẫn nên có một dòng nói rõ với khách

Dù không upload gì, khách vẫn thấy prompt xin camera/mic. Nên có một câu ngay trên nút bấm: *"Ảnh và giọng nói được xử lý ngay trên máy của bạn, không gửi lên server, không lưu lại."* Đây vừa là sự thật kỹ thuật vừa là lợi thế bán hàng — và nó phải đúng, nên đừng lặng lẽ thêm upload sau này mà không sửa câu đó.

---

## G. MOBILE COMPATIBILITY

| Nền tảng | Trạng thái | Ghi chú |
|---|---|---|
| **Chrome Android** | ✅ SAFE | getUserMedia, MediaRecorder (`audio/webm`), WASM SIMD — đủ cả |
| **Safari iOS 15+** | ⚠️ WARNING | Cần `playsinline` + `muted`; MediaRecorder trả `audio/mp4`; phải có cử chỉ người dùng; `webkitAudioContext` fallback |
| **Safari iOS < 14.3** | ❌ Không có MediaRecorder | Cần phát hiện và báo "thiết bị chưa hỗ trợ ghi âm" — không để trang chết im |
| **Secure context** | ✅ SAFE | production `https://` đã xác nhận |
| **viewport** | ✅ SAFE | `BaseLayout.astro:72` |
| **Máy Android yếu** | ⚠️ WARNING | Xem §H |

---

## H. PERFORMANCE RISKS

| # | Rủi ro | Mức | Giảm thiểu |
|---|---|---|---|
| P1 | **~7 MB tải lần đầu** (WASM + model). Trên 4G Việt Nam là 10–30 giây | 🔴 Cao | Lazy-load sau cú bấm, có thanh tiến trình. Theo đúng pattern `await import()` đã có ở 4 chỗ trong repo |
| P2 | **Nạp model 3.7 MB vào RAM** trên Android 2–3 GB | 🟠 TB | Chỉ nạp khi cần; `faceLandmarker.close()` khi xong |
| P3 | **Frame rate trên CPU yếu** | 🟠 TB | Xem "phát hiện then chốt" bên dưới |
| P4 | **Initial page load** | 🟢 Thấp | `prerender = true` → HTML tĩnh từ edge Cloudflare (HKG, gần VN). Không đụng DB. Nhanh hơn 223 trang SSR hiện có |
| P5 | **Camera stream không được giải phóng** → đèn camera vẫn sáng, iOS treo lần quét sau | 🟠 TB | `stream.getTracks().forEach(t => t.stop())` trong cả `pagehide` **và** khi rời bước quét |
| P6 | **Memory leak** giữa các lần quét | 🟡 Thấp | `close()` landmarker + `revokeObjectURL` cho audio blob |

### Phát hiện then chốt — Phase 1B đã xoá gần hết rủi ro hiệu năng

`PHASE1B2_REALPOSE_ANSWERS.md` kết luận: **fullness theo trục z đã FAIL** (0/12 cung đạt S/N ≥ 3), và pose **phải bị khoá chặt** (yaw/pitch phá geometry tới 44%).

Cả hai điều đó **đơn giản hoá bài toán hiệu năng rất nhiều**:

- Không cần stream 30 fps. Chỉ cần **bắt đúng một khung chính diện tốt**.
- Ma trận `facial_transformation_matrixes` của MediaPipe đã được kiểm chứng hoạt động (Phase 1B §E1: yaw ổn định ±0.4° qua 10 biến thể). Dùng nó làm **cổng chất lượng**: chỉ chấp nhận khi `|yaw| < 8°` và `|pitch| < 8°`.
- Vòng lặp hợp lý: chạy detector ~5 fps (không phải 30), hiển thị "Giữ mặt thẳng…", và **thoát ngay khi có 1 frame qua cổng**. Rồi tắt camera.

→ Tải CPU thực tế thấp hơn một bậc so với "app quét mặt realtime" thông thường. `WARNING` P3 hạ xuống thấp.

---

## I. FILES THAT MUST CHANGE

Tất cả trên clone **`phong-thuy-thien-anh-cloudflare-migration`**, nhánh mới tách từ `cloudflare-migration`.

### Tạo mới (4 mục)
```
src/pages/nhan-tuong.astro                    route + BaseLayout + PageHero + prerender=true
src/components/tools/NhanTuong.astro          toàn bộ logic client (theo khuôn 25 component tools/ hiện có)
public/mediapipe/face_landmarker.task         3.7 MB — copy từ poc/assets/ của Phase 1B
public/mediapipe/wasm/                        vision_wasm_internal.js + .wasm (từ node_modules sau khi cài)
```

### Sửa (1 file, 1 dòng)
```
package.json                                  + "@mediapipe/tasks-vision": "^0.10.x"
```

### Có thể cần — phải kiểm chứng trước
```
public/_headers                               cache /mediapipe/* — XEM WARNING ở §D, nguy cơ ghi đè
                                              dist/client/_headers do adapter sinh ra
```

### TUYỆT ĐỐI KHÔNG chạm
```
src/middleware.ts        route mới không cần gating (§F)
astro.config.mjs         không cần đổi adapter/integration/header
wrangler.jsonc           không cần binding mới
db/ · drizzle · Neon     POC không lưu gì
src/pages/api/**         POC không gọi server
src/layouts/BaseLayout.astro   viewport đã đúng
```

**Tổng: 4 file mới + 1 dòng trong package.json.** Không sửa một dòng logic nào đang chạy.

---

## J. RECOMMENDED POC ARCHITECTURE

```
┌── QR CODE ────────────────────────────────────────────────────────┐
│  https://phongthuythienanh.com/nhan-tuong                         │
└────────────────────────────┬──────────────────────────────────────┘
                             ↓
┌── src/pages/nhan-tuong.astro ─────────────────────────────────────┐
│  export const prerender = true;        ← HTML TĨNH, edge Cloudflare│
│  BaseLayout + PageHero + Container     ← y hệt tinh-trung-tang.astro│
│  <NhanTuong />                                                     │
│  ⇒ middleware tự bỏ qua (isPrerendered), không DB, không cookie    │
└────────────────────────────┬──────────────────────────────────────┘
                             ↓
┌── src/components/tools/NhanTuong.astro ───────────────────────────┐
│  HTML: 4 bước tuần tự, mỗi bước một khối                           │
│                                                                    │
│  BƯỚC 1 · Giới thiệu + nút "Bắt đầu"                               │
│     └─ nói rõ: xử lý trên máy, không gửi server, không lưu         │
│                                                                    │
│  BƯỚC 2 · QUÉT MẶT   (bấm nút → mới chạy, KHÔNG tự động)           │
│     ├─ await import("@mediapipe/tasks-vision")     ← lazy, 7 MB    │
│     │    (đúng pattern gieo-que-kinh-dich.astro:763)               │
│     ├─ FilesetResolver.forVisionTasks("/mediapipe/wasm")           │
│     ├─ FaceLandmarker.createFromOptions({                          │
│     │      modelAssetPath: "/mediapipe/face_landmarker.task",      │
│     │      outputFacialTransformationMatrixes: true,  ← cổng pose  │
│     │      runningMode: "VIDEO", numFaces: 1 })                     │
│     ├─ getUserMedia({video:{facingMode:'user',width:{ideal:640}}}) │
│     ├─ <video autoplay muted playsinline>          ← bẫy iOS       │
│     ├─ vòng lặp ~5 fps: đọc pose từ ma trận 4×4                    │
│     │    CHẤP NHẬN khi |yaw|<8° và |pitch|<8°  (Phase 1B)          │
│     │    ngược lại: "Giữ mặt thẳng, đừng nghiêng đầu…"             │
│     └─ đủ 1 frame tốt → stop tracks + close() + sang bước 3        │
│                                                                    │
│  BƯỚC 3 · THU GIỌNG   (10–20 giây)                                 │
│     ├─ getUserMedia({audio:true})                                  │
│     ├─ MediaRecorder với mime dò được    ← webm/mp4, bẫy iOS       │
│     ├─ AudioContext + AnalyserNode → RMS/năng lượng                │
│     │    (khuôn sẵn: quan-su/TourChaoMung.astro:233-249)           │
│     └─ stop sau 15s → Blob giữ trong memory                        │
│                                                                    │
│  BƯỚC 4 · FEATURE JSON                                             │
│     ├─ hiện JSON trên trang + nút "Tải JSON" (Blob download)       │
│     └─ KHÔNG upload. Có thể lưu localStorage để test lại.          │
│                                                                    │
│  Dọn dẹp: pagehide + beforeunload → stop tracks, close landmarker  │
└───────────────────────────────────────────────────────────────────┘
```

### Hợp đồng dữ liệu đầu ra — chỉ những gì Phase 1B chứng minh đo được

Đây không phải chi tiết triển khai, mà là ranh giới: **đừng xuất field mà Phase 1B đã chứng minh không đáng tin.**

```
NÊN XUẤT (đã PASS ở Phase 1B)
  trung_dinh          head-axis 3D — biên độ 0.0063 dưới pitch thật
  eye_distance_n      sau hiệu chỉnh phối cảnh: 2.2%
  forehead_width_n    sau hiệu chỉnh phối cảnh: 3.0%
  pose {yaw,pitch,roll}, cam_z    từ ma trận biến đổi
  chat_luong {qua_cong_pose, do_net}

KHÔNG XUẤT (đã FAIL)
  fullness/12 cung    0/12 đạt S/N>=3, đổi dấu theo khung ảnh
  nose_length_n       pitch -44%
  mouth_width_n       pitch +21%
  face_shape_ratio    vỡ cả 4 trục

XUẤT KÈM CẢNH BÁO
  thuong_dinh / ha_dinh   biên độ 0.072 + lệch hệ thống 46% (không có landmark chân tóc)
```

Ghi luôn `landmarks_468` thô (x,y,z) vào JSON để sau này tính lại được mà không phải chụp lại khách.

### Vì sao đây là đường ngắn nhất
- Dùng đúng khuôn 25 component `tools/` đã có → không phát minh gì mới.
- `prerender = true` → không đụng SSR, DB, middleware, session.
- Lazy-load có tiền lệ 4 chỗ → không phải thử nghiệm.
- Web Audio có tiền lệ đang chạy → không phải thử nghiệm.
- **1 dependency mới, 4 file mới, 0 dòng logic cũ bị sửa.**

---

## K. ESTIMATED IMPLEMENTATION SCOPE

| Việc | Ước lượng | Rủi ro |
|---|---|---|
| Tách nhánh từ `cloudflare-migration` sạch | 10 phút | — |
| `npm i @mediapipe/tasks-vision` + copy WASM/model vào `public/` | 30 phút | Thấp |
| `src/pages/nhan-tuong.astro` theo khuôn `tinh-trung-tang.astro` | 30 phút | Thấp |
| Bước 2 — camera + lazy MediaPipe + cổng pose | **1–1.5 ngày** | **TB** — phần lớn thời gian là bẫy iOS |
| Bước 3 — MediaRecorder + Web Audio + dò mime | 0.5 ngày | TB — codec iOS |
| Bước 4 — feature JSON + tải xuống | 2–3 giờ | Thấp |
| Dọn dẹp stream/memory (P5, P6) | 2–3 giờ | TB — dễ bỏ sót, gây lỗi lần quét thứ hai |
| Test thật trên iPhone + Android yếu | 0.5 ngày | **Cao** — đây là chỗ hay phát sinh |
| **TỔNG** | **≈ 3–4 ngày làm việc** | |

Cộng thêm nếu muốn: tạo QR (5 phút, bất kỳ generator nào), một câu giải thích quyền riêng tư (đã tính trong bước 1).

**Không bao gồm** (đúng phạm vi POC): Rule Engine, Knowledge Base, LLM, thanh toán, tài khoản, lưu DB, luận giải.

---

## FINAL DECISION

### 1. Có thể xây POC `/nhan-tuong` trực tiếp trên repo hiện tại không?

**CÓ — nhưng phải trên clone `phong-thuy-thien-anh-cloudflare-migration`, không phải `phong-thuy-thien-anh`.**

Route trống hoàn toàn (xác minh 3 cách, production trả 404). Kiến trúc Astro + component `tools/` + `prerender = true` khớp đúng hình dạng POC cần: 4 file mới, 1 dependency, 0 dòng logic cũ bị sửa, không đụng DB/API/middleware/adapter.

`BLOCKER` duy nhất là **chọn đúng clone**: production chạy Cloudflare Workers (đã xác minh bằng header thật), còn clone `phong-thuy-thien-anh` dùng adapter Node cho Render và **chính middleware của repo ghi rõ nó lệch kiến trúc so với production**.

### 2. Kiến trúc MediaPipe FaceLandmarker Web + browser camera có phù hợp không?

**CÓ — và đây là lựa chọn đúng, không phải lựa chọn tạm.**

Lý do có bằng chứng, không phải suy đoán:
- Phase 1B đã **chạy thật** chính model `face_landmarker.task` này và xác nhận: 478 landmark, 52 blendshape, ma trận pose 4×4 hoạt động đúng (yaw ổn định ±0.4°). Bản web dùng cùng model, cùng API.
- Kiến trúc hiện tại **không có vật cản nào**: không CSP toàn site, không Permissions-Policy, không vấn đề SSR (script trong `.astro` chỉ chạy client), production đã HTTPS.
- Asset 3.7 MB + WASM nằm thoải mái dưới giới hạn 25 MiB/file của Cloudflare Static Assets.
- Lazy-load và Web Audio đều **đã có tiền lệ đang chạy** trong repo, không phải thử nghiệm.

Hai điều kiện bắt buộc: **giữ WASM đơn luồng** (đừng bật COOP/COEP, sẽ phá cả site) và **lazy-load** (đừng để 7 MB vào bundle chính).

### 3. Kiến trúc nào là đường ngắn nhất để đạt QR → Camera → Face Scan → Voice → Feature JSON?

```
QR  →  https://phongthuythienanh.com/nhan-tuong
       (URL production dùng làm QR target được ngay — đã xác nhận domain
        cấu hình trong astro.config.mjs:80 và phục vụ qua edge Cloudflare
        tại HKG, gần Việt Nam)
   ↓
src/pages/nhan-tuong.astro           prerender = true  → HTML tĩnh, edge, bỏ qua middleware
   ↓
src/components/tools/NhanTuong.astro <script> thuần, 4 bước tuần tự
   ↓
Bước 2  nút bấm → await import("@mediapipe/tasks-vision")  → getUserMedia
        → cổng pose từ ma trận 4×4 (|yaw|<8°, |pitch|<8°) → 1 frame tốt là dừng
   ↓
Bước 3  MediaRecorder (mime dò được) + AnalyserNode, 15 giây
   ↓
Bước 4  Feature JSON hiển thị + tải xuống. Không upload. Không lưu.
```

**Ngắn nhất vì nó không phát minh gì:** dùng lại khuôn `tinh-trung-tang.astro` + 25 component `tools/`, dùng lại pattern `await import()` đã có ở 4 chỗ, dùng lại khuôn `AudioContext` đã chạy ở `TourChaoMung.astro`. Toàn bộ phần mới chỉ là camera — thứ repo chưa từng dùng.

**Điều nên chốt trước khi viết dòng đầu tiên:** hợp đồng feature JSON ở §J. Phase 1B đã xác định rõ field nào đo được và field nào không. Xuất `fullness` 12 cung vào JSON bây giờ sẽ tạo ra một hợp đồng dữ liệu mà Phase sau phải phá bỏ — và tệ hơn, sẽ khiến người đọc JSON tin vào con số đã được chứng minh là không đáng tin.

---

*Audit only. Không sửa code, không cài package, không deploy. File này là file mới chưa track trong git.*
