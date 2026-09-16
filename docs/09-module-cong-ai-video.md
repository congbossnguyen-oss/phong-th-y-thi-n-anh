# Module CONG AI VIDEO (nội bộ)

> Feng Shui Knowledge → Scene → Prompt → AI Video Generation → Video Clip.
> **V1 = công cụ nội bộ cho admin (anh Công)**, không phải tính năng bán cho khách. Không gating,
> không thanh toán, không quota — chỉ cần đăng nhập với tài khoản `isAdmin = true`.

## Vì sao module này khác các module còn lại

Repo hiện tại là website SSR đa người dùng (Astro + Node adapter), không phải app desktop — nên
kiến trúc "Settings > AI Providers, mỗi user tự nhập API key, lưu OS keychain" (bản gốc của brief
CONG AI VIDEO) không áp dụng được thẳng. Quyết định đã chốt (13/9/2026):

- **Đối tượng dùng**: chỉ admin, không mở cho khách ở V1.
- **API key Wan/LTX**: operator-level trong `.env` (giống `ANTHROPIC_API_KEY`/`SEPAY_API_TOKEN`),
  KHÔNG có UI cho từng user tự nhập.
- Nhưng: không có chỗ nào trong `src/lib/ai-video/` đọc thẳng `process.env` — mọi thứ đi qua
  `credentials.ts` (`CredentialProvider`) để dọn đường cho V2 (BYOK) chỉ cần đổi 1 implementation.

## Kiến trúc

```text
src/lib/ai-video/
├── credentials.ts        CredentialProvider — V1: EnvCredentialProvider (đọc .env)
├── providers/
│   ├── types.ts            VideoProvider contract, capabilities, job status, lỗi chuẩn hoá
│   ├── registry.ts          getVideoProvider(id) — điểm DUY NHẤT biết tên Wan/LTX
│   ├── wan.ts                adapter Wan (Alibaba DashScope Wanxiang)
│   └── ltx.ts                adapter LTX (Lightricks, kiểu queue API)
├── job-manager.ts          vòng đời job: create → submit → poll → ready/failed/...
├── scene-planner.ts         chủ đề + kiến thức có sẵn → Scene[] có cấu trúc đầy đủ (knowledge tách
│                            riêng khỏi visualDescription/camera/movement/..., grounded, không tự bịa)
├── prompt-builder.ts        Scene → prompt AI Video phẳng (thuần templating, đúng thứ tự ưu tiên
│                            visualDescription→camera→movement→environment→lighting→style→constraints)
└── cost.ts                  ước tính chi phí từ handoff/config/gia-ai-video.json

db/schema.ts                 bảng ai_video_jobs (trạng thái job — xem job-manager.ts)
src/pages/api/internal/ai-video/  scenes.ts, generate.ts, jobs/index.ts (danh sách job của chính admin),
                                   jobs/[id].ts, jobs/[id]/cancel.ts
src/pages/cong-ai-video/index.astro  UI admin duy nhất (poll trạng thái job bằng vanilla JS, có mục
                                      "Lịch sử job đã tạo" đọc lại từ DB — video cũ không mất khi rời trang)
```

**Core không import `wan.ts`/`ltx.ts` trực tiếp** — luôn qua `registry.ts`. Thêm provider mới
(Hunyuan, CogVideo, ...) chỉ cần thêm 1 file adapter + 1 dòng trong `registry.ts`.

## Ràng buộc "không tự bịa quy tắc phong thủy" (viết lại đầy đủ ở STEP 3, 13/9/2026)

`scene-planner.ts` tách 3 tầng KHÔNG được trộn lẫn: **KNOWLEDGE** (`knowledgeStatement`, nguyên văn)
≠ **VISUALIZATION** (`visualDescription`/`camera`/`movement`/...) ≠ **PROMPT** (do `prompt-builder.ts`
ghép, không nằm trong Scene Planner). Ràng buộc "không bịa" ép Ở KIẾN TRÚC qua 2 lớp độc lập, không
chỉ lời dặn trong system prompt:

1. **`knowledgeStatement` luôn do HỆ THỐNG gán** từ knowledge gốc SAU khi LLM trả lời — field này
   KHÔNG nằm trong JSON schema yêu cầu LLM trả về, nên LLM không có đường nào "diễn giải lại" kiến
   thức nguồn dù chỉ 1 chữ.
2. **Blocklist cụm từ "kết luận chuyên môn"** (`CUM_TU_KET_LUAN_NHAY_CAM` trong scene-planner.ts, vd
   "gây mất tài lộc", "ảnh hưởng hôn nhân") quét mọi field LLM được quyền viết — cụm nào xuất hiện mà
   KHÔNG có trong chính `knowledgeStatement` gốc thì scene đó bị TỪ CHỐI (không sửa âm thầm) và thay
   bằng bản mặc định grounded 100% (hiển thị nguyên văn knowledge, không diễn giải) — ghi rõ trong
   `warnings` trả về, không giấu việc này.

Đây là heuristic đơn giản (so khớp chuỗi con), KHÔNG phải kiểm duyệt ngữ nghĩa đầy đủ — đủ chặn các
trường hợp hallucination rõ ràng phổ biến, mở rộng danh sách khi gặp case mới.

## ⚠️ Cần làm trước khi dùng thật

1. **Migration DB chưa được tạo/áp dụng.** Tôi (Claude) không chạy `db:generate`/`db:migrate` vì
   lệnh đó chạm tới Neon Postgres thật của anh Công — cần anh Công tự chạy:
   ```bash
   npm run db:generate   # tạo file migration mới từ thay đổi trong db/schema.ts (bảng ai_video_jobs)
   npm run db:migrate    # áp dụng lên Neon thật
   ```
2. **Điền `.env`**: `LTX_API_KEY` đã có và đã xác minh gọi thật thành công (xem "Provider status").
   `WAN_API_KEY` vẫn CHƯA có — cần điền để test Wan. LTX.io hiện hết credit (`insufficient_funds_error`
   ở lượt test thứ 2) — nạp thêm để dùng tiếp.
3. **Giá trong `handoff/config/gia-ai-video.json` là ước tính**, cần đối chiếu lại với hoá đơn thật.

## Provider status (STEP 2 — 13/9/2026)

| | Wan | LTX |
|---|---|---|
| API verified (đối chiếu tài liệu chính thức) | YES | YES |
| Generation verified (gọi thật, nhận job) | **NO — thiếu `WAN_API_KEY`, chưa test** | **YES** — job `b595cb18b27547f092df20de40963262` submit → processing → completed trong ~20s |
| Download verified (tải MP4 thật) | NO | **YES** — `result.video_url` tải về 6.727.084 bytes, `Content-Type: video/mp4` |

**LTX**: key thật ban đầu điền vào `.env` là key của **fal.ai**, nhưng adapter (`ltx.ts`) lúc đó viết
theo tài liệu fal.ai trong khi model thật anh Công dùng là **LTX.io (Lightricks Developer Console,
docs.ltx.io)** — 2 dịch vụ HOÀN TOÀN KHÁC NHAU (domain, auth, schema khác hẳn). Gọi thật trả lỗi rõ
ràng (`401 Cannot access application "fal-ai/ltx-video"`), xác nhận key không phải fal.ai. Sau khi
anh Công xác nhận nguồn key là docs.ltx.io, đã VIẾT LẠI HOÀN TOÀN `ltx.ts` theo đúng tài liệu chính
thức đó — gọi thật lần 2 thành công trọn vòng đời job.

Lần thử thứ 2 (job `47a5366ba36f4471abab4ca127928709`) bị `insufficient_funds_error` ("Required: 54
cents") — **không phải lỗi code**, tài khoản LTX.io hết credit sau lượt tạo đầu tiên. Đã xác minh
download bằng cách gọi lại đúng job đã `completed` ở lượt 1 (không tốn thêm phí — chỉ là GET trạng
thái + tải file, không tạo job mới).

**Bug đã sửa trong lúc test**: vòng lặp poll của smoke test thiếu điều kiện thoát khi status là
`"completed"` (chỉ thoát ở `TRANG_THAI_KET_THUC`/`"ready"`, không có `"completed"`) — khiến lần chạy
đầu cứ poll tới hết 240s dù job đã xong sau ~16s. Đã sửa trong `real-api.smoke.test.ts`, không phải
lỗi ở `job-manager.ts` (nơi đó xử lý đúng vì tự chuyển `completed`→`ready`).

**Wan**: chưa có `WAN_API_KEY` thật, giữ nguyên PENDING CREDENTIALS theo đúng phạm vi STEP này.

Smoke test đã viết sẵn: `src/lib/ai-video/smoke/real-api.smoke.test.ts`. Tự động skip trừ khi có
CẢ HAI: key thật trong `.env` VÀ cờ `RUN_AI_VIDEO_SMOKE_TEST=1` — chỉ xét "có key" không đủ, vì `.env`
production luôn có key (app cần để chạy), nếu vậy mọi lần `vitest run`/CI thường ngày sẽ âm thầm tốn
tiền gọi API thật. Chạy thật (tốn tiền theo giá API):
```bash
RUN_AI_VIDEO_SMOKE_TEST=1 npx vitest run src/lib/ai-video/smoke --testTimeout=300000
```
Test sẽ: gửi prompt đơn giản → nhận job id → poll trạng thái mỗi 8s (tối đa 4 phút) → tải MP4 về
`generated/test/` → kiểm tra file tồn tại và > 10KB. Không log API key.

### Các điểm đã sửa khi đối chiếu tài liệu thật

- **Wan**: `parameters.size` → `parameters.resolution` + `parameters.ratio` (field cũ sai tên, bị
  DashScope lờ đi không báo lỗi — resolution/tỉ lệ khung hình trước đó KHÔNG hề được áp dụng dù
  request "thành công"). Bỏ `img_url` (image-to-video là API/endpoint riêng của Alibaba, không phải
  field trên endpoint text-to-video này) — `imageToVideo` hạ về `false`. Thêm trạng thái `UNKNOWN` →
  `timeout` (task_id hết hạn sau 24h). `cancelGeneration` đổi thành no-op có ghi chú rõ — tài liệu
  không công bố endpoint hủy cho text-to-video, gọi 1 URL đoán mò dễ gây hiểu lầm.
- **LTX — VIẾT LẠI HOÀN TOÀN**: bản đầu (đối chiếu OpenAPI schema của fal.ai) hoá ra SAI NỀN TẢNG —
  key thật anh Công dùng là của **docs.ltx.io** (Lightricks Developer Console), không phải fal.ai.
  Gọi thật xác nhận bằng lỗi rõ ràng (`401 Cannot access application "fal-ai/ltx-video"`). Viết lại
  theo đúng docs.ltx.io: base URL `https://api.ltx.io` (không phải `queue.fal.run`), auth
  `Authorization: Bearer` (không phải `Key`), submit `POST /v2/text-to-video` với body BẮT BUỘC
  `prompt`+`model`+`duration`+`resolution` (model mặc định LÚC ĐÓ `ltx-2-5-fast` — đã đổi thành
  `ltx-2-3-fast` từ 13/9/2026 sau benchmark, xem mục "Default Model" bên dưới, resolution `1280x720`,
  duration ∈ {6,8,...,20}s theo support-matrix — KHÔNG có `negative_prompt`/`seed` trong schema thật,
  `supportsNegativePrompt`/`supportsSeed` hạ về `false`), poll `GET /v2/text-to-video/{id}` trả
  `status: pending|processing|completed|failed` + `result.video_url` khi xong + `error.type`/
  `error.message` khi lỗi. Đã GỌI THẬT thành công trọn vòng đời (xem "Provider status" trên).

## STEP 6 — Architecture Fix (13/9/2026)

STEP 5 audit tìm 2 FAIL + 4 WARN. STEP 6 vá đúng các issue đó, không thêm feature:

1. **Grounding bypass đã đóng** — blocklist tách thành `grounding.ts` (`checkSceneGrounding`), dùng
   CHUNG bởi `scene-planner.ts` VÀ `scene-validator.ts`. Vì `prompt-builder.buildPrompt()` luôn gọi
   `assertValidScene()` trước, và route `/api/internal/ai-video/generate` luôn gọi `buildPrompt()`,
   nên 1 Scene tự tạo gửi thẳng lên `/generate` (bỏ qua `/scenes`) giờ vẫn bị chặn nếu chứa kết luận
   phong thủy bịa đặt — có test riêng (`generate.test.ts`) gọi thẳng route để chứng minh.
2. **Bug giá theo độ phân giải đã sửa** — `cost.ts` có `normalizeResolution()` quy MỌI định dạng
   provider trả về (`"1080P"`, `"1920x1080"`, `"720p"`...) về 1 trong 5 giá trị canonical trước khi
   tính giá. `gia-ai-video.json` đổi từ `he_so_1080p` sang `he_so_theo_resolution` (map theo canonical).
3. **Provenance model/resolution đã chính xác** — `VideoProvider` có thêm `resolveRequest()`
   (implement riêng từng adapter, biết default CỦA CHÍNH MÌNH). `job-manager.createAndSubmitJob` gọi
   hàm này TRƯỚC khi persist — DB giờ luôn lưu đúng model/resolution/duration SẼ THỰC SỰ được gửi,
   không còn NULL dù UI không truyền.
4. **Duration được enforce trước khi gọi mạng** — hàm dùng chung `kiemTraDurationTrongKhoang()`
   (`types.ts`) so `durationSeconds` với `capabilities.durationRangeSeconds` của từng provider (Wan
   giờ check cả min lẫn max, LTX từ chỗ không check gì sang enforce đủ 6-20s). UI (`index.astro`) tự
   đổi min/max/gợi ý theo provider đang chọn, lấy trực tiếp từ capability — không hard-code số.
5. **Retry tối thiểu, có giới hạn** — `submitJob` tự thử lại (tối đa 2 lần, backoff 800ms) CHỈ khi lỗi
   `retryable:true` (429/5xx); `pollJob` khi gặp lỗi tạm thời lúc tra cứu trạng thái thì KHÔNG đánh dấu
   job kết thúc (chỉ ghi `errorMessage`) — lần poll tự nhiên tiếp theo của UI (~5s) đóng vai trò retry,
   không thêm queue/sleep chặn request.
6. **Idempotency dựa trên dữ liệu hiện có, không thêm cột DB** — `createAndSubmitJob` tự kiểm tra job
   CÙNG (createdBy, provider, model, prompt, duration, resolution) mà CÒN ĐANG HOẠT ĐỘNG (chưa tới
   trạng thái kết thúc) trước khi tạo mới — double-click trả về đúng job đang chạy, không generate 2
   lần. Job cũ đã kết thúc (ready/failed/...) KHÔNG tính là trùng, nên render lại y hệt vẫn tạo được.
7. **Aspect ratio khai đúng sự thật** — `ProviderCapabilities.supportsAspectRatio`: `true` cho Wan
   (thật sự gửi `parameters.ratio`), `false` cho LTX (docs.ltx.io không có field này, resolution tự
   mang aspect ratio) — không còn im lặng "giả vờ" aspectRatio có tác dụng với LTX.

## Default Model — LTX-2.3 Fast (13/9/2026)

`DEFAULT_MODEL` trong `ltx.ts` đã đổi từ `ltx-2-5-fast` → **`ltx-2-3-fast`** sau real visual benchmark
(Knowledge → Scene → Prompt → LTX thật → MP4 thật → tự xem trực tiếp bằng mắt qua 4 frame lấy mẫu):
cửa và giường hiện rõ, cùng trục, camera tĩnh không làm mất quan hệ không gian — PASS đủ 6/6 tiêu chí
(door visible / bed visible / spatial relationship / camera preserves meaning / no contradiction /
overall comprehension). Rẻ hơn `ltx-2-5-fast` ($0.03/s vs $0.09/s ở 720p) và đủ rõ cho mục tiêu MINH
HOẠ (không cần cinematic).

`ltx-2-5-fast` **vẫn dùng được** — không xoá, không đổi giá — chỉ cần truyền `model: "ltx-2-5-fast"`
tường minh trong request (`resolveRequest()` chỉ điền default khi request không chỉ định gì).

Giá `ltx-2-3-fast` trong `gia-ai-video.json` là giá CHÍNH THỨC do anh Công cung cấp (không phải suy
đoán từ lỗi provider như `ltx-2-5-fast`): 720p $0.03/s, 1080p $0.06/s, 1440p $0.12/s, 4K $0.24/s —
khớp đúng con số thật đã quan sát ở benchmark (6s × $0.03 = $0.18 = "Required: 18 cents" mà LTX từng báo).

## Cách test thủ công

1. Đăng nhập bằng tài khoản `isAdmin = true`.
2. Vào `/cong-ai-video`.
3. Nhập chủ đề (vd "5 lỗi phong thủy phòng ngủ") + dán kiến thức nguồn (mỗi dòng 1 ý).
4. Bấm "Chia cảnh" → chọn 1 cảnh → chọn provider (Wan/LTX) → "Tạo video".
5. Trang tự poll `/api/internal/ai-video/jobs/[id]` mỗi 5s cho tới khi có video hoặc báo lỗi.
