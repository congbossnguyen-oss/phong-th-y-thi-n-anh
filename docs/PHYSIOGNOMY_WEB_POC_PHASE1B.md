# PHYSIOGNOMY WEB POC — PHASE 1B

**Ngày:** 2026-09-25
**Clone:** `phong-thuy-thien-anh-cloudflare-migration` (clone production Cloudflare)
**Branch:** `feat/physiognomy-web-poc`, HEAD nguồn `cc4724b`
**Kết quả:** `READY FOR REAL DEVICE TEST` — chi tiết ở cuối

Tiếp từ `docs/PHYSIOGNOMY_WEB_POC_PHASE1.md`. Mục tiêu: hoàn thiện mọi thứ kiểm chứng được bằng code/browser, trước khi Công cầm iPhone + Android thật.

---

## 0. REPOSITORY SAFETY

| Kiểm tra | Kết quả |
|---|---|
| Đúng clone production | ✅ `phong-thuy-thien-anh-cloudflare-migration` |
| Đúng branch | ✅ `feat/physiognomy-web-poc` |
| Không reset | ✅ |
| Không stash | ✅ (môi trường cảnh báo stack stash dùng chung giữa worktree; có 1 entry của người khác — không chạm) |
| Không xoá thay đổi của Công | ✅ |
| Không merge production | ✅ |

### `git status` TRƯỚC khi sửa (23 mục)
```
 M package-lock.json · package.json · src/lib/ai/goi-ai.ts
 M src/pages/huyen-mon-tam-thuc.astro · src/pages/quan-su/dich-vu-vip.astro
?? .claude/ · docs/PHYSIOGNOMY_WEB_POC_AUDIT.md · docs/PHYSIOGNOMY_WEB_POC_PHASE1.md
?? packages/daliuren-engine/ · public/dai-luc-nham-banner.webp · public/mediapipe/
?? src/components/tools/DaiLucNham.astro · src/components/tools/HkdqLuanNha.astro
?? src/components/tools/NhanTuong.astro · src/features/ · src/lib/hkdq-luan-nha/
?? src/lib/huyen-khong-dai-quai/ · src/pages/dai-cat-loi/dai-luc-nham.astro
?? src/pages/dai-cat-loi/hkdq-luan-nha.astro · src/pages/nhan-tuong.astro
?? tests/hkdq-luan-nha-engine.test.ts · tests/huyen-khong-dai-quai.test.ts
?? tests/nhan-tuong-scan.test.ts
```

### `git status` SAU khi sửa — khác biệt đúng 4 mục
```
> ?? tests/nhan-tuong-phase1b.test.ts          ← của tôi (test mới)
> M  public/images/vip/huyen-khong-dai-quai.webp   ← của Công
> M  src/pages/dai-cat-loi/phong-thuy-chinh-phai.astro  ← của Công
> ?? hkdq-web-module/                          ← của Công
```

⚠️ **Công đang làm việc song song trên cùng worktree** (hkdq-luan-nha, dai-luc-nham, goi-ai.ts). Tôi chỉ chạm file POC của mình. Nếu commit, nên `git add` có chọn lọc chứ đừng `git add -A`.

### `git diff --stat` — file đã theo dõi
```
 package.json        |  8 +-       ← trong đó CHỈ 1 dòng của tôi:
 package-lock.json   | 1858 ++--      + "@mediapipe/tasks-vision": "^1.0.1"
 (5 file còn lại đều là việc của Công)
```

### File POC (đều là file mới, chưa track)
```
  30  src/pages/nhan-tuong.astro
 840  src/components/tools/NhanTuong.astro
 374  src/features/physiognomy/types/index.ts          ← hợp đồng dữ liệu
 517  src/features/physiognomy/geometry/index.ts
 260  src/features/physiognomy/capture/quality.ts
 284  src/features/physiognomy/voice/recorder.ts
 247  src/features/physiognomy/camera/index.ts
 195  src/features/physiognomy/capture/state-machine.ts
 166  src/features/physiognomy/voice/features.ts
 130  src/features/physiognomy/index.ts
 119  src/features/physiognomy/landmarker/index.ts
 336  tests/nhan-tuong-scan.test.ts
 795  tests/nhan-tuong-phase1b.test.ts               ← mới ở 1B
────
4293 dòng mã + test   ·   26 MB asset (public/mediapipe)
```

---

## 1. MAPPING FIXES — 12 cung

### Phương pháp: 4 tiêu chí khách quan trên canonical mesh của MediaPipe
Tất cả chuẩn hoá theo bề ngang mặt. Không tin comment/README của repo nào.

| Tiêu chí | Ngưỡng | Vì sao |
|---|---|---|
| `z-spread` | ≤ 0.20 | Vùng phải nằm trên MỘT bề mặt giải phẫu. Trộn nhiều mặt thì `mean(z)` vô nghĩa |
| đường kính xy | ≤ 0.45 | Vùng phải đủ gọn để còn là "bộ vị" |
| điểm contour | = 0 | Vành mắt/môi là ĐƯỜNG BIÊN — lấy mean của một vành thì không đo được gì |
| số điểm | ≥ 4 | Ít hơn thì mean không ổn định |

Script kiểm: `poc/audit_palaces_v2.py`, `poc/design_regions.py` (trong workspace nghiên cứu, ngoài repo).

### Hiện trạng TRƯỚC khi sửa
```
cung           n   z-spread  đ.kính xy  #contour   đánh giá
phuThe        10     0.4041     1.0179         4   Z-SPREAD LỚN · QUÁ RỘNG · 4 contour
noBoc         12     0.3810     0.8768         0   Z-SPREAD LỚN · QUÁ RỘNG
dienTrach     15     0.1621     0.2937         6   6 điểm contour
tuNu          10     0.1533     0.8436         0   QUÁ RỘNG
huynhDe       20     0.1621     0.7465         0   QUÁ RỘNG
thienDi       10     0.1053     0.7465         0   QUÁ RỘNG
phucDuc       12     0.1732     0.6698         0   QUÁ RỘNG
menh          18     0.1080     0.5987         0   QUÁ RỘNG (ranh giới)
quanLoc        3     0.0524     0.2768         0   QUÁ ÍT ĐIỂM
phuMau         6     0.0511     0.5922         0   ok (nhưng 3 điểm/bên)
taiBach/tatAch                                     ok
```

### Phát hiện gốc rễ: bản port Phase 1 đã LÀM PHẲNG cấu trúc trái/phải
Bản đồ gốc `ljtnine/face` dùng `List<List<Int>>` — tức **các nhóm**. Bản port của tôi ở Phase 1 gộp hai bên thành một mảng phẳng. Đó là nguyên nhân 6 cung bị "QUÁ RỘNG": không phải vùng sai, mà là **lấy mean của cả hai bên mặt**, triệt tiêu chính sự khác biệt trái/phải mà tướng học quan tâm.

→ Phase 1B trả lại **cấu trúc song phương**: `{ left, right }`, `right = null` cho cung trên đường giữa.

### Năm cung được thiết kế lại

| cung | trước → sau | cách làm |
|---|---|---|
| **夫妻 Phu Thê** | z-spread **0.4041 → 0.1049** · đ.kính **1.0179 → 0.1855** · contour **4 → 0** | Bản cũ `[33,133,234,127,162]` trộn khoé mắt (z≈+3.2/+3.8) với viền mặt/thái dương (z≈−2.4/−1.0) — chênh **6.2 đơn vị** trong cùng một vùng, khiến S/N = **1.01** ở Phase 1B-2 (tín hiệu đúng bằng nhiễu). Vùng mới: chỉ các đỉnh **lateral hơn khoé mắt ngoài**, cùng dải z, không lấn viền mặt |
| **田宅 Điền Trạch** | z-spread **0.1621 → 0.0469** · contour **6 → 0** | Bản cũ trộn 9 điểm lông mày với 6 điểm **vành contour mắt**. Vùng mới: mặt mi trên giữa mày và mắt, giới hạn x theo đúng bề ngang con mắt. Đây là vùng **chặt thứ hai** trong 12 |
| **命宮 Mệnh (印堂)** | z-spread **0.1080 → 0.0182** · đ.kính **0.5987 → 0.1821** | Bản cũ trải từ đỉnh trán xuống hai đầu mày. 印堂 đúng ra CHỈ là vùng giữa hai đầu mày, trên sống mũi. Vùng mới **chặt nhất trong 12** |
| **官祿 Quan Lộc (中正)** | 3 → 5 điểm · z-spread 0.0524 → **0.0491** | Mở rộng sang mặt giữa trán, đủ điểm để mean ổn định |
| **父母 Phụ Mẫu (日月角)** | 3 → **5 điểm mỗi bên** | Mở rộng quanh nhật/nguyệt giác |

### Bảng kết quả 12 cung sau khi sửa

| cung | mapping | z-spread | đ.kính | contour | song phương |
|---|---|---|---|---|---|
| menh (印堂) | ✅ verified | 0.0182 | 0.1821 | 0 | giữa |
| dienTrach | ✅ verified | 0.0469 | 0.1871 | 0 | L/R |
| quanLoc | ✅ verified | 0.0491 | 0.2527 | 0 | giữa |
| phuThe | ✅ verified | 0.1049 | 0.1855 | 0 | L/R |
| thienDi | ✅ verified | 0.1053 | 0.3604 | 0 | L/R |
| tatAch | ✅ verified | 0.1218 | 0.1815 | 0 | giữa |
| phuMau | ✅ verified | 0.1220 | 0.2017 | 0 | L/R |
| tuNu | ✅ verified | 0.1533 | 0.2635 | 0 | L/R |
| taiBach | ✅ verified | 0.1556 | 0.3092 | 0 | giữa |
| huynhDe | ✅ verified | 0.1621 | 0.2937 | 0 | L/R |
| phucDuc | ✅ verified | 0.1732 | 0.2924 | 0 | L/R |
| **noBoc** | ⚠️ **unknown** | **0.3493** | 0.3967 | 0 | L/R |

**11/12 verified · 1/12 unknown.**

`noBoc` (奴僕宮 / 地閣 hai bên) vượt ngưỡng **kể cả sau khi đã tách trái/phải**: viền hàm cong thật theo độ sâu, từ trước cằm ra tới góc hàm. Không làm cho mạch lạc được nếu không chia nhỏ thêm, mà chia nhỏ thì không còn khớp 地閣 cổ truyền. → Để `unknown` kèm `note` giải thích, **không ép thành measured**.

### Tách rõ hai loại độ tin
Đây là điểm quan trọng của thiết kế:
```ts
palaces.phuThe = {
  status:  "unsupported",   // PHÉP ĐO: độ đầy đặn theo z -> không đo được đáng tin
  mapping: "verified",      // BẢN ĐỒ VÙNG: đã kiểm bằng canonical mesh -> đúng
  metrics: { zSpread: 0.1049, diameter: 0.1855, contourPoints: 0 },
}
```
**Bản đồ đúng KHÔNG làm cho phép đo đáng tin.** Vẫn `status: "unsupported"` cho cả 12 cung, vì Phase 1B-2 đã chứng minh 0/12 đạt S/N ≥ 3 và 9/12 đổi dấu theo pose. Sửa mapping là để **sau này** dùng được (vẽ overlay, đổi sensor), không phải để mở cửa cho luận giải bây giờ.

---

## 2. FEATURE CONTRACT

`src/features/physiognomy/types/index.ts` · `schemaVersion: "1.0"`

### Bốn trạng thái, dùng đúng chỗ

| status | nghĩa | ví dụ trong POC |
|---|---|---|
| `measured` | Đo trực tiếp, sai số đã biết và chấp nhận được | `eyeDistance` (4.99% pitch) · `faceHeight` · `fiveOrgans.eye` · **trung đình** |
| `estimated` | Tính được nhưng có sai lệch hệ thống / mốc neo yếu. **Bắt buộc có `note`** | `noseLength` (44.1% pitch) · `mouthWidth` (20.6%) · `faceShapeRatio` (vỡ 4 trục) · thượng/hạ đình |
| `unsupported` | Sensor hiện tại KHÔNG đo được đáng tin. Không phải "chưa làm" | `fiveOrgans.ear` (lưới không có landmark vành tai) · `faceRegions.ears` · cả 12 cung |
| `unknown` | Lần quét này không đủ dữ liệu | `threeCourts` khi landmark suy biến · `pose` khi thiếu ma trận |

### Kỷ luật đã khoá bằng test
- **Không dùng `0` làm giá trị thiếu** → `unsupported`/`unknown` luôn `value: null`. (0 là giá trị hợp lệ; dùng 0 để báo thiếu là mời người đọc hiểu sai.)
- **Không dùng `null` mà không có status giải thích** → test đi đệ quy toàn bộ JSON: mọi `Measurement` có `value === null` PHẢI có `status !== "measured"` **và** có `note`.
- **Không có tên field phán xét** → test đi đệ quy mọi KHOÁ, cấm: `fullness`, `palacedepth`, `depthscore`, `destiny`, `personality`, `fortune`, `goodbad`, `luck`, `physiognomyscore`, `facescore`.
  Cố tình **không cấm cả chữ "score"**: `blurScore`/`lightingScore` là chỉ số **chất lượng ảnh**, hoàn toàn hợp lệ — test khẳng định hai field này PHẢI tồn tại.
- `experimentalDepth` chỉ có đúng 2 khoá: `{ enabled: false, warning }` — test khoá điều này, không cho lọt số nào vào.

> Bài học từ chính test này: bản đầu tôi cấm cả **chuỗi** `丰隆`/`低陷` trong JSON, và test đổ — vì phần văn bản `reason` có nhắc hai từ đó để **giải thích vì sao KHÔNG đo được**. Cấm phải cấm **tên field**, không cấm văn bản giải thích. Nếu cấm cả văn bản thì hoá ra bắt hệ thống im lặng về chính giới hạn của nó.

---

## 3. CAMERA LIFECYCLE

### Vòng đời tường minh
```
idle → requesting → active → capture → stopped
```
`stopped` là trạng thái **CUỐI** — handle đã stopped không mở lại được, phải `openCamera()` mới. Cố ý như vậy vì iOS treo khi dùng lại stream đã chết. `markCapturing()` chỉ đổi trạng thái khi đang `active`, **không hồi sinh** stream đã stop (có test).

### `release()` idempotent, một chỗ duy nhất tắt track
```ts
for (const track of stream.getTracks()) { try { track.stop(); } catch {} }
video.pause(); video.srcObject = null;
```
Idempotent là bắt buộc vì nó được gọi từ nhiều đường ra **cùng lúc**: `pagehide`, `beforeunload`, nút Huỷ, và lúc chụp xong. Không idempotent thì lần thứ hai throw trên track đã chết.

### Đường thoát đã nối
| Đường | Xử lý |
|---|---|
| chụp xong | `camera.release()` + `releaseLandmarker()` ngay, không giữ stream qua bước giọng nói |
| nút Huỷ | `releaseAll()` → về `idle` |
| rời trang | `pagehide` **và** `beforeunload` (pagehide bắt được back/forward cache của iOS, nơi beforeunload KHÔNG chạy) |
| tab bị ẩn | `visibilitychange` → dừng vòng lặp, không đốt CPU/pin trong nền |
| lỗi bất kỳ | `fail()` → `releaseAll()` |

### Test (stub `navigator.mediaDevices`, không cần camera thật)
| Ca | Kết quả |
|---|---|
| permission denied | ✅ `kind: "denied"`, không rò stream |
| no camera | ✅ `kind: "not_found"` |
| camera bị app khác chiếm | ✅ `kind: "other"` + lý do "chiếm dụng" |
| không HTTPS | ✅ `kind: "unsupported"` và **KHÔNG hề xin quyền** (chặn trước) |
| thành công | ✅ `state === "active"`, đặt đủ `playsinline` + `webkit-playsinline` + `muted` |
| `release()` × 3 | ✅ mỗi track stop **đúng 1 lần**, `state === "stopped"`, `srcObject === null` |
| retry sau deny | ✅ lần hai thành công, không dính lỗi cũ |
| chỉ xin video | ✅ `audio: false` — micro xin riêng ở bước giọng nói |

---

## 4. MICROPHONE LIFECYCLE

| Hạng mục | Thực hiện |
|---|---|
| `getUserMedia({audio:true})` | Gọi TRONG handler cú bấm (yêu cầu iOS). `autoGainControl: false` — AGC bóp biên độ làm `energyRms` mất ý nghĩa so sánh |
| permission denied | Throw `"DENIED"` → UI hiện cảnh báo, **vẫn đi tiếp được** tới `feature_extraction` (khuôn mặt đã chụp xong, không nên vứt cả lần quét) |
| start | `recorder.start(1000)` — timeslice 1s vì Safari đôi khi chỉ phát `dataavailable` ở cuối, mất trắng nếu tab treo giữa đường |
| stop | `stop()` → chờ event `stop` → gộp Blob → giải mã PCM |
| cancel | `abort()` — dừng recorder + tắt track, không trả dữ liệu |
| retry | `restart()` xoá sạch state, bật lại nút |
| component destroy | `releaseAll()` ở `pagehide`/`beforeunload` gọi `recorder.abort()` |
| tự dừng | 20s (timeout trong recorder **và** timeout ở component — hai lớp) |
| upload | ❌ **Không.** Blob chỉ trong memory; `URL.revokeObjectURL` sau khi xong |

---

## 5. iOS MIME STRATEGY

### Thương lượng, không hard-code
```ts
export const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",     // Chrome/Android — nén tốt nhất
  "audio/webm",
  "audio/mp4;codecs=mp4a.40.2", // iOS Safari — KHÔNG hỗ trợ webm
  "audio/mp4",
  "audio/ogg;codecs=opus",      // Firefox cũ
];
pickSupportedMimeType(isSupported = defaultSupportCheck): string | null
```
- `isSupported` là tham số **tiêm được** → test mock được 4 kịch bản trình duyệt mà không cần thiết bị.
- `try/catch` đặt **trong vòng lặp**, không chỉ trong `defaultSupportCheck`: một bản Safari cũ throw ở đúng một loại MIME vẫn phải cho thử tiếp các loại còn lại. (Lỗi này do chính test bắt được — bản đầu chỉ catch ở tầng ngoài.)
- Trả `null` → **không truyền** `mimeType` cho MediaRecorder, để trình duyệt tự chọn. Vẫn tốt hơn là throw.
- MIME **thực tế** mà recorder chọn được ghi vào `voice.mimeType` (đọc từ `recorder.mimeType`, không phải từ cái ta yêu cầu).

### Test mock
| Kịch bản | Kết quả |
|---|---|
| Chrome/Android (webm) | ✅ `audio/webm;codecs=opus` |
| **iOS Safari (chỉ mp4)** | ✅ `audio/mp4;codecs=mp4a.40.2`, **và khẳng định KHÔNG chứa "webm"** |
| mp4 trần (không codec string) | ✅ `audio/mp4` |
| Firefox cũ (chỉ ogg) | ✅ `audio/ogg;codecs=opus` |
| không hỗ trợ gì | ✅ `null` |
| `isTypeSupported` throw | ✅ không sập, bỏ loại đó thử tiếp |
| thứ tự ưu tiên | ✅ webm đứng trước mp4 |

---

## 6. POSE GATE

### Tách `poseRaw` / `poseStatus`
```ts
interface HeadPose {
  yaw: number | null; pitch: number | null; roll: number | null;  // SỐ ĐO THÔ
  status: "pass" | "fail" | "unknown";                            // PHÁN QUYẾT
  exceeded: Array<"yaw" | "pitch" | "roll">;                       // trục nào vượt
  limits: { yaw: 8, pitch: 8, roll: 5 };                           // ngưỡng đi kèm dữ liệu
}
```
Cố ý tách để không ai nhầm pose thành đặc điểm nhân tướng. **`status: "fail"` nghĩa là "chụp lại", KHÔNG phải "tướng xấu".** `status: "unknown"` khi thiếu ma trận pose — **không đoán bừa thành pass** (có test).

Ngưỡng `limits` đi kèm ngay trong dữ liệu để người đọc JSON sau này biết nó được chấm theo mốc nào, không phải tra tài liệu.

`CaptureQuality` giờ chứa `pose` lồng, **không còn** `yaw/pitch/roll` phẳng (test khoá shape này).

---

## 7. DEBUG PANEL

`PhysiognomyDebugPanel` — hiện đúng các mục yêu cầu:
```
Camera: ACTIVE · 640x480        Face width: 693.0 px
Face: DETECTED                  Face height: 887.2 px
Face count: 1                   Blur: 0.001947
Yaw: -0.62°                     Lighting: 0.5121
Pitch: -1.11°                   Coverage: 0.462
Roll: -2.17°                    Quality: PASS
Pose: PASS                      Voice: RECORDING → COMPLETE
Landmarker: ready               MIME: audio/webm;codecs=opus
                                Feature extraction: PASS
```

### KHÔNG xuất hiện production — đã xác minh, không phải hứa
Markup bọc trong `{import.meta.env.DEV && (...)}`. Vite thay biểu thức đó bằng literal `false` lúc build nên **toàn bộ khối HTML không được render ra** — không phải chỉ bị ẩn bằng CSS.

Cố tình **bỏ `?debug=1`**: nếu còn cửa đó thì panel vẫn mở được trên production, trái yêu cầu.

```
grep -c trong dist/                     HTML   JS
  PhysiognomyDebugPanel                   0     0
  nt-debug-panel                          0     0
  nt-debug-rows                           0     0
  setDbg                                  0     0
```

> Hai lần trả giá để đạt số 0 này:
> 1. Bản đầu dùng `import.meta.env.DEV || ?debug=1` → `?debug=1` vẫn mở được panel trên production.
> 2. Sau khi bọc markup trong `{DEV && ...}`, grep vẫn ra **1** lần chuỗi `PhysiognomyDebugPanel` — hoá ra **Astro GIỮ LẠI comment HTML** trong output, và chính comment tôi viết ("kiểm chứng: grep ... trong dist/") đã làm chuỗi đó lọt vào HTML. Đã chuyển ghi chú vào frontmatter (không bao giờ render).

---

## 8. MOBILE UX

### Đo trên bản BUILD PRODUCTION (không phải dev server) — 4 viewport
| viewport | overflow trong POC | nút < 44px | text bị cắt | khung dẫn hướng nằm trong video |
|---|---|---|---|---|
| **375×812** (iPhone SE/13 mini) | ✅ 0 | ✅ 0 | ✅ 0 | ✅ (video 292px) |
| **390×844** (iPhone 14/15) | ✅ 0 | ✅ 0 | ✅ 0 | ✅ (307px) |
| **412×915** (Pixel) | ✅ 0 | ✅ 0 | ✅ 0 | ✅ (329px) |
| **360×800** (Android phổ thông) | ✅ 0 | ✅ 0 | ✅ 0 | ✅ (277px) |

Kiểm cả **7 màn hình** ở từng viewport (bằng cách bỏ `hidden` từng section), không chỉ màn hình đầu.

### Đã sửa: vùng chạm 42px → 44px
`BTN_MD` của `Button.astro` cho ra **42px** — đủ cho web desktop nhưng thiếu 2px so với ngưỡng tối thiểu (WCAG 2.5.5 / Apple HIG) cho một trang khách vào bằng **QR trên điện thoại**. Thêm `min-h-11` vào class của POC; **không sửa `Button.astro` dùng chung** (ngoài phạm vi).

> Đã trả giá: `min-h-11` ban đầu không vào build vì **static server của tôi đang giữ file trong `dist/`**, làm `astro build` đổ ở bước `emptyDir` (file lock của Windows) — mà tôi lại grep output nên không thấy lỗi. Bài học: đọc `tail` của build, đừng grep.

### `WARNING` — horizontal scroll, KHÔNG phải của POC
Ở 375px: `scrollWidth = 461` vs `clientWidth = 375`. 25 phần tử tràn, **tất cả `inNhanTuong: false`** — là header của site (`js-search-open`, icon nav) và SVG trang trí `SacredMotif` trong `PageHero` (vòng tròn rộng 480px).

Kiểm chứng đây là lỗi **site-wide có sẵn**:
```
/nhan-tuong        vw=375  scrollW=461   (POC)
/tinh-trung-tang   vw=375  scrollW=461   (trang có sẵn)
/xem-ngay-tot-xau  vw=375  scrollW=461   (trang có sẵn)
```
Giống hệt nhau. **Không sửa** — ngoài phạm vi POC, và sửa header là đụng vào 301 trang khác. Ghi lại để Công quyết riêng.

### Còn lại
- `<video>` có đủ `playsinline` + `webkit-playsinline` + `muted` trong HTML **build** (không chỉ trong source)
- Video không tự fullscreen: chưa kiểm chứng được — **cần iPhone thật**

---

## 9. TESTS

### POC: **104 test, tất cả PASS**
`tests/nhan-tuong-scan.test.ts` (36) + `tests/nhan-tuong-phase1b.test.ts` (68)

| Nhóm | Số | Nội dung đáng chú ý |
|---|---|---|
| **Geometry** | 8 | `faceHeight`/`faceShapeRatio`/`eyeDistance`/`mouthWidth`/`noseWidth` **bất biến với roll 20–25°** · khoảng cách mày–mắt bất biến với roll (field từng dùng `deltaY`) · tỉ lệ bất biến với scale ảnh · ba đình head-axis bất biến với roll **và** pitch ±25° · landmark suy biến → `unknown` chứ không trả số bịa |
| **Pose** | 9 | ngưỡng 8/8/5 · từng trục · nhiều trục cùng vượt · thiếu ma trận → `unknown` · **chỉ có 3 trạng thái kỹ thuật, không có trạng thái nào mang nghĩa nhân tướng** · `decomposePose` đọc column-major |
| **Camera** | 10 | denied · not_found · bị chiếm dụng · không HTTPS (chặn trước khi xin quyền) · `state === active` · `release()` idempotent (stop đúng 1 lần/track) · `srcObject = null` · retry · `markCapturing` không hồi sinh stream đã stop · `audio: false` |
| **Voice** | 12 | 7 test MIME (4 trình duyệt + throw + null + thứ tự) · cao độ sin 150 Hz sai < 5% · im lặng → `null` không phải 0 · cờ experimental · **không field nào ánh xạ sang kết luận nhân tướng** |
| **JSON** | 9 | `schemaVersion` · **không tên field phán xét** (đệ quy mọi khoá) · `experimentalDepth` đúng 2 khoá · **mọi `value: null` phải có status + note** (đệ quy) · `ear` null không phải 0 · đủ 4 status dùng đúng chỗ · pose có cả thô và status · 468 landmark |
| **12 cung** | 11 | đủ 12 · `verified` phải đạt cả 4 tiêu chí · **chưa đạt thì phải `unknown` kèm note, không ép thành verified** · noBoc là cung duy nhất unknown · Phu Thê không còn contour/viền mặt · Điền Trạch không còn contour · song phương giữ L/R riêng · cung giữa `right = null` · index trong [0,467] không trùng · **mapping verified nhưng phép đo vẫn unsupported** |
| **State machine** | 9 | luồng 12 bước · chặn nhảy tắt · không ngõ cụt · lỗi chữa được giữ camera · lỗi dừng hẳn không giữ · `face_too_large` chữa được |
| **UX messages** | 6 | "Đưa điện thoại gần hơn." · "Lùi điện thoại ra một chút." · "Chỉ để một người trong khung." · pose bắt đầu bằng "Vui lòng" · **chỉ nhắc MỘT lý do pose** |
| **Regression** | 3 | index 133 · mốc 234/454 · quy ước column-major |

### Hai lỗi do test bắt được — và cách phân định
Bốn test đổ ở lần chạy đầu. Phân định **lỗi code** vs **lỗi test** chứ không sửa bừa cho xanh:

1. **`faceShapeRatio` trượt 7% ở roll 20°** → **lỗi bộ sinh dữ liệu TEST**, không phải lỗi code.
   Bộ sinh của tôi quay khuôn mặt trong không gian **toạ độ chuẩn hoá**. Nhưng MediaPipe chuẩn hoá `x` theo bề ngang ảnh và `y` theo chiều cao — khi W ≠ H (640×480) thì không gian đó **bị kéo dãn theo trục**, nên quay trong đó rồi nhân lại với (W,H) KHÔNG phải một phép quay thật trong mặt phẳng ảnh. Pixel ảnh là vuông, nên đã sửa bộ sinh sang **pixel space**. Code sản xuất đúng từ đầu — nhưng chỉ khẳng định được điều đó sau khi sửa test và thấy nó pass.
2. **Ba đình trượt 0.0107 ở pitch 18°** → cùng nguyên nhân, cùng cách sửa.
3. **`isTypeSupported` throw làm sập** → **lỗi code thật**, đã hardened (`try/catch` vào trong vòng lặp).
4. **`丰隆` xuất hiện trong JSON** → **test quá thô**, đã đổi sang kiểm **tên khoá** (xem §2).

### FULL SUITE
```
Test Files  2 failed | 148 passed (150)
Tests       3 failed | 2446 passed | 5 expected fail (2454)
```
**3 lỗi là `environmental timeout`** — y như Phase 1, ở đúng 2 file cũ:
- `tests/g10-lunar-policy-golden.test.ts` (round-trip lịch 1967–1968, ~7.1s)
- `tests/phase2-toa-huong-mo.test.ts` (2 test, ~6.2s)

Cả hai vượt mốc mặc định 5000ms. Chạy lại với `--testTimeout=90000` → **83/83 PASS**. Cả hai file **không import gì** của POC (`grep -l physiognomy` → rỗng). **Không sửa code không liên quan.**

---

## 10. BUILD

```
npx astro build   →   Complete!
/nhan-tuong/index.html được PRERENDER
```

| Kiểm tra | Kết quả |
|---|---|
| Chunk trang | `NhanTuong…js` **36 KB** |
| MediaPipe | `vision_bundle…js` **152 KB** — chunk RIÊNG, chỉ nạp khi `await import()` |
| Asset | `dist/client/mediapipe/` đủ 5 file (`.task` 3.76 MB · WASM SIMD 11.76 MB · nosimd 10.96 MB) |
| WASM content-type | `application/wasm` ✅ |
| Debug panel | 0/0 trong cả HTML và JS |
| `min-h-11` | có trong HTML (2) và CSS (1) |

---

## 11. REMAINING DEVICE-ONLY TESTS

Những thứ **không có cách nào** kiểm bằng code. Browser pane chặn camera/micro, và không có iPhone/Android ở đây.

| # | Chỉ thiết bị thật trả lời được |
|---|---|
| D1 | `detectForVideo` trên `<video>` sống — fps thực tế trên Android tầm thấp |
| D2 | Thời gian tải **15.8 MB** trên 4G Việt Nam |
| D3 | Video có tự bung fullscreen trên iOS Safari không (`playsinline` có thật sự hiệu lực) |
| D4 | MIME mà `MediaRecorder` chọn trên iOS (kỳ vọng `audio/mp4`) |
| D5 | Đèn camera có tắt khi rời trang (`pagehide` trên iOS) |
| D6 | Prompt quyền camera/micro hiện đúng chỗ, sau cử chỉ thật |
| D7 | Cổng pose ±8° có quá chặt trong thực tế không (khách có chụp nổi không) |
| D8 | Nhiều mặt thật trong khung → `multiple_faces` |
| D9 | `AudioContext` resume trên iOS sau cử chỉ |
| D10 | Nhiệt/pin sau vài lần quét liên tiếp |

---

# DEVICE TEST CHECKLIST

Mở `https://phongthuythienanh.com/nhan-tuong` (sau khi deploy) hoặc dev server qua HTTPS/tunnel.

## iPhone Safari
- [ ] **Camera permission** — prompt hiện sau khi bấm "BẮT ĐẦU QUÉT" (không tự hiện lúc vào trang)
- [ ] **Face detection** — thấy khung dẫn hướng đổi sang màu vàng khi mặt vào đúng
- [ ] **Pose gate** — nghiêng đầu > 5° thì hiện "Vui lòng giữ đầu ngay"; ngẩng/chúc > 8° hiện đúng chữ "ngẩng lên"/"chúc xuống"
- [ ] **Capture** — đủ 3 frame ổn định thì tự chụp, hiện ảnh đã chụp
- [ ] **Microphone permission** — prompt riêng, sau khi bấm "BẮT ĐẦU NÓI"
- [ ] **MediaRecorder** — ghi được, thanh mức nhảy theo giọng
- [ ] **MIME** — mở debug panel (dev) hoặc tải JSON, xác nhận `voice.mimeType` là `audio/mp4…` **chứ không phải webm**
- [ ] **Voice capture** — đếm giây chạy, tự dừng ở 20s, hoặc bấm XONG dừng sớm
- [ ] **Cleanup** — rời trang (hoặc bấm Home) → **đèn camera tắt**, quay lại trang không bị treo
- [ ] **Retry** — từ chối quyền rồi cho phép lại → quét được, không dính lỗi cũ
- [ ] **Không fullscreen** — `<video>` nằm gọn trong khung, không bung toàn màn hình
- [ ] **Không horizontal scroll trong khối POC** (header của site có thể vẫn tràn — lỗi có sẵn)

## Android Chrome
- [ ] **Camera permission** — prompt sau cử chỉ
- [ ] **Face detection** — khung dẫn hướng phản hồi
- [ ] **Pose gate** — 3 trục báo đúng
- [ ] **Capture** — tự chụp khi ổn định
- [ ] **Microphone permission** — prompt riêng
- [ ] **MediaRecorder** — ghi được
- [ ] **MIME** — kỳ vọng `audio/webm;codecs=opus`
- [ ] **Voice capture** — đủ 10–20s
- [ ] **Cleanup** — rời trang → camera nhả
- [ ] **Retry** — deny rồi allow → chạy lại được
- [ ] **Máy tầm thấp** — đo fps thực tế, xem UI có giật; thời gian tải 15.8 MB trên 4G

## Ghi lại khi test
Với mỗi máy: model · phiên bản OS · thời gian tải model · fps quan sát được · `voice.mimeType` · có nóng máy không. Những số này là đầu vào để quyết định có cần chuyển sang Web Worker hay giảm độ phân giải.

---

# `READY FOR REAL DEVICE TEST`

Mọi thứ kiểm chứng được bằng code/browser đã PASS:

- ✅ Bản đồ 12 cung: **11/12 verified** theo 4 tiêu chí khách quan trên canonical mesh · 1/12 `unknown` trung thực kèm lý do · trả lại cấu trúc song phương
- ✅ Phu Thê z-spread **0.4041 → 0.1049** · Điền Trạch **0.1621 → 0.0469** · Mệnh **0.1080 → 0.0182**
- ✅ Không còn `deltaY` ở bất kỳ phép đo nào — có test bất biến roll/yaw/pitch
- ✅ Hợp đồng dữ liệu: 4 status dùng đúng chỗ, không `0` làm giá trị thiếu, không `null` không lời giải thích, không tên field phán xét
- ✅ Pose gate 8/8/5, tách `poseRaw`/`poseStatus`, `unknown` khi thiếu dữ liệu
- ✅ Camera lifecycle 5 trạng thái, `release()` idempotent, 10 test bằng stub
- ✅ Micro lifecycle đủ 7 ca, không lưu server
- ✅ MIME thương lượng, 7 test mock 4 trình duyệt
- ✅ Debug panel **0/0 trong production**, đã xác minh bằng grep
- ✅ Mobile UX sạch ở **cả 4 viewport × 7 màn hình**; vùng chạm 44px
- ✅ **104 test POC pass** · build production thành công · chunk lazy 36 KB vs 152 KB

Ba lỗi còn lại trong full suite là **`environmental timeout`** ở 2 file không liên quan (83/83 pass khi nới timeout).

**Chặn duy nhất còn lại là thiết bị thật.** 10 hạng mục ở §11 không có cách nào kiểm bằng code.

---

*Chỉ thu dữ liệu. Không Rule Engine, không Knowledge Base, không LLM, không kết luận nhân tướng, không database, không customer storage, chưa deploy.*
