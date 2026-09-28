# Phase 1C — Real Device HTTPS Test (runbook)

Tunnel HTTPS **tạm thời** để test camera/mic thật trên iPhone Safari + Android Chrome.
Không phải production URL. Không lưu URL tunnel vào source. Không commit.

```text
Phone → https://<tunnel>.trycloudflare.com → PC localhost:4321
```

## Trạng thái: CHƯA CHẠY ĐƯỢC — thiếu `cloudflared`

Đã kiểm tra: `cloudflared`, `ngrok`, `localtunnel`, `tailscale`, `devtunnel` — **không
có cái nào** trên PATH, trong `Program Files`, `~/.cloudflared`, `node_modules/.bin`,
hay bất kỳ đâu trong user profile. Theo yêu cầu: **không tự cài.**

### Cài cloudflared (chính thức, chọn 1)

```bash
winget install --id Cloudflare.cloudflared
```

Hoặc tải binary trực tiếp từ Cloudflare:
`https://github.com/cloudflare/cloudflared/releases/latest` → `cloudflared-windows-amd64.exe`
(đổi tên thành `cloudflared.exe`, để vào một thư mục có trong PATH).

Tài liệu: `https://developers.cloudflare.com/cloudflare-tunnel/downloads/`

Quick tunnel (`--url`) **không cần tài khoản Cloudflare**, URL đổi mỗi lần chạy.

## Blocker thứ hai đã tìm ra và sửa trước: Vite chặn Host lạ

Vite 8 trả **403 "Blocked request"** cho mọi `Host` header không nằm trong
`server.allowedHosts`. Tunnel sẽ chết ngay từ request đầu tiên. Đã xác minh:

```
Host: abc-def-ghi.trycloudflare.com  →  403   (cả trang lẫn API)
```

Sửa ở `astro.config.mjs` (khối `vite.server`, **chỉ ảnh hưởng `astro dev`** — runtime
Cloudflare Workers không đọc khối này): đọc host từ biến môi trường `TUNNEL_HOST`,
**không hard-code URL tunnel**. Sau khi sửa:

| Host | Kết quả |
|---|---|
| `test-tunnel.trycloudflare.com` (đã set `TUNNEL_HOST`) | 200 / API 201 |
| `evil.example.com` | 403 — vẫn chặn |
| `localhost` | 200 |
| `192.168.96.102` | 200 |
| `/api/doi-lich-am-duong` | 200 |

## Chạy test (3 terminal)

**1 — tunnel**, lấy URL in ra màn hình:

```bash
cloudflared tunnel --url http://localhost:4321
```

**2 — restart dev server với đúng host của tunnel** (bỏ `https://`, chỉ lấy hostname):

```bash
npx astro dev stop; $env:TUNNEL_HOST="abc-def-ghi.trycloudflare.com"; npx astro dev
```

**3 — mở trên PC:** `https://<tunnel>/nhan-tuong`

QR tự sinh URL HTTPS vì `mobileUrl()` dựng từ `location.origin` — không cần sửa gì.
Banner cảnh báo LAN cũng tự tắt vì host không còn là loopback.

## Checklist trên máy thật

Quét QR bằng camera điện thoại (iPhone Safari, rồi Android Chrome), rồi lần lượt:

- [ ] Camera permission — hiện prompt, cho phép
- [ ] Chính diện · Quay trái · Quay phải · Sát mặt · Cúi xuống · Ngẩng lên
- [ ] Microphone permission
- [ ] Voice recording
- [ ] Complete → desktop tự nhận kết quả, không reload

Điểm cần soi kỹ (đã sửa theo lý thuyết, **chưa xác minh trên máy thật**):

- **Dấu yaw** — `YAW_SIGN_FOR_USER_LEFT = 1` ở `src/features/physiognomy/session/steps.ts`.
  Hiệu chuẩn từ ảnh Phase 1C, chưa test live. Nếu quay trái mà máy báo quay phải → đổi `-1`.
- **iOS MIME** — `pickSupportedMimeType()` dò động, không hard-code `audio/webm`.
  iOS Safari thường ra `audio/mp4`.
- **Tải WASM qua tunnel** — MediaPipe ~15.8 MB. Quick tunnel chậm, lần đầu có thể lâu.

## Dọn dẹp sau khi test

```bash
# Ctrl-C ở terminal tunnel
npx astro dev stop; npx astro dev     # restart không còn TUNNEL_HOST
```

Không có gì để xoá trong source: URL tunnel chỉ sống trong biến môi trường của shell.
