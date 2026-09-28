# Phase LAN — Test PC ⇄ Điện thoại cùng Wi-Fi

Phạm vi: **chỉ** sửa phần cần cho local LAN testing. Không đổi kiến trúc production,
không đổi Cloudflare, không thêm dependency, không `npm install`, không
reset/stash/clean, không `git add -A`, không đụng Rule Engine/KB/LLM, không đổi
session protocol.

## Kết quả

| Mục | Giá trị |
|---|---|
| LAN IP dùng để test | `192.168.96.102` (Wi-Fi "ZHI GONG", DHCP) |
| URL mở trên PC | `http://192.168.96.102:4321/nhan-tuong` |
| URL encode trong QR | `http://192.168.96.102:4321/nhan-tuong?session=<ID>&mode=mobile` |
| Desktop | **PASS** |
| Mobile | **PASS (phần phiên)** — camera bị chặn vì HTTP, xem mục HTTPS |
| Session | **PASS** |
| API | **PASS** |
| Tests | **198/198 PASS** (4 file POC) |
| Build | **PASS** (`astro build`, server built 32.55s) |

## Audit: hoá ra không cần sửa gì về mạng

1. `astro.config.mjs:85-87` đã có `server: { host: true }` từ trước → dev server đã
   bind mọi interface (`::`), terminal đã in `Network: http://192.168.96.102:4321/`.
   **Không sửa file này.**
2. `mobileUrl()` trong `NhanTuongDesktop.astro` vốn dựng URL từ `location.origin`
   → mở trang PC bằng LAN IP thì QR đã tự mang LAN IP. Không hard-code IP, không
   rewrite localhost→IP (rewrite là đoán mò: một máy có nhiều interface).
3. Windows Firewall đã có sẵn 2 rule Inbound Allow cho
   `C:\program files\nodejs\node.exe` trên profile **Public**, đúng profile của
   Wi-Fi đang dùng. **Không cần mở thêm port, không đụng firewall.**

→ Nguyên nhân ban đầu chỉ là mở trang bằng `localhost`. Đã thêm cảnh báo DEV-only.

## Hai thay đổi thật sự

### 1. `NhanTuongDesktop.astro` — cảnh báo DEV khi mở bằng localhost

Banner `#ntd-lan-warn` bọc trong `import.meta.env.DEV &&`, chỉ hiện khi
`location.hostname` là loopback, hướng người test sang dòng `Network:` ở terminal.
Đã verify build: **0 dấu vết trong `dist/`.**

Đã thử một endpoint `/api/nhan-tuong/dev-lan` đọc `os.networkInterfaces()` để tự
điền IP — **trả về rỗng** vì dev server chạy trong workerd (adapter Cloudflare),
shim `node:os` không có interface thật. Đã xoá endpoint thay vì để code chết.

### 2. `NhanTuongMobile.astro` — tách "kết nối phiên" khỏi "kiểm tra camera"

Trước: `checkBrowserSupport()` chạy **trước** `post("connect")`. Trên LAN,
`window.isSecureContext === false` → không kết nối được phiên, dù phiên **không
cần camera**. Hệ quả: không test nổi giao tiếp Desktop↔Điện thoại.

Sau: connect trước, kiểm tra camera sau. Phiên kết nối được, nút BẮT ĐẦU vẫn
disable, và thông báo nói đúng lý do. Protocol không đổi (vẫn `connect` một lần,
vẫn `writeToken`).

## Giới hạn không vượt qua được: camera cần HTTPS

Trình duyệt chỉ miễn HTTPS cho `localhost`/`127.0.0.1`. `http://192.168.96.102:4321`
là **insecure context** → `getUserMedia` bị chặn ở tầng trình duyệt, không phải lỗi code.

Muốn quét mặt thật trên điện thoại, chọn một trong:

- **Android Chrome** — `chrome://flags/#unsafely-treat-insecure-origin-as-secure`,
  thêm `http://192.168.96.102:4321`, Relaunch. Nhanh nhất, chỉ để test.
- **Tunnel HTTPS** — `cloudflared tunnel --url http://localhost:4321` hoặc ngrok.
  Chạy được cả iOS. Cần cài tool ngoài (chưa cài, ngoài phạm vi phase này).
- **Dev server HTTPS** — mkcert + `vite.server.https`. Phải sửa `astro.config.mjs`
  và cài dependency → **không làm**, vượt phạm vi "chỉ sửa phần cần cho LAN".

**iOS Safari không có flag tương đương** → bắt buộc tunnel hoặc HTTPS thật.

## 8 test bắt buộc

| # | Test | Kết quả |
|---|---|---|
| 1 | PC localhost `/nhan-tuong` | PASS — HTTP 200 |
| 2 | PC LAN URL | PASS — HTTP 200 |
| 3 | Máy khác cùng Wi-Fi mở được | PASS — tab thứ hai qua LAN IP, 200, render đủ |
| 4 | QR chứa LAN host | PASS — `http://192.168.96.102:4321/...`, không có `localhost` |
| 5 | Mobile connect phiên | PASS — 200 `{"writeToken":"…","status":"connected"}` |
| 6 | Desktop nhận `connected` | PASS — tự chuyển sang màn tiến độ, không reload |
| 7 | Chạy ít nhất 1 face step | PASS — step `front` → `{"status":"face_front"}`, desktop tick ✓ Chính diện trong ~1.5s |
| 8 | `/api/doi-lich-am-duong` | PASS — 200, giống hệt trên localhost và LAN |

Test 7 gửi snapshot qua đúng API và đúng `writeToken` của phiên; phần *camera* của
bước này không chạy được trên HTTP (xem mục trên). Cross-session vẫn chặn: connect
lần hai vào cùng phiên trả **409**.

## Files changed

- `src/components/tools/NhanTuongDesktop.astro` — banner DEV `#ntd-lan-warn`,
  `isLoopbackHost`, `showLanHintIfNeeded()`, comment giải thích `mobileUrl()`
- `src/components/tools/NhanTuongMobile.astro` — đảo thứ tự connect/camera,
  thêm cờ `isInsecureLanOrigin`
- `src/pages/api/nhan-tuong/dev-lan.ts` — tạo rồi xoá (workerd không có interface thật)
- `astro.config.mjs` — **không sửa**
- `package.json` — **không sửa** ở phase này
