/**
 * LTX PROVIDER ADAPTER — mọi chi tiết riêng của LTX nằm TRỌN trong file này. Core không import file
 * này trực tiếp — luôn đi qua `registry.ts`.
 *
 * ⚠️ VIẾT LẠI HOÀN TOÀN 13/9/2026: bản đầu tiên nhắm nhầm sang fal.ai (`queue.fal.run`) — gọi thật
 * bằng key thật của anh Công trả về `401 Cannot access application "fal-ai/ltx-video"` (xác nhận key
 * KHÔNG phải key fal.ai). Đối chiếu lại: key lấy từ Developer Console chính thức của Lightricks tại
 * docs.ltx.io — một dịch vụ HOÀN TOÀN KHÁC fal.ai (domain khác, auth khác, schema khác). Đã viết lại
 * theo đúng tài liệu chính thức docs.ltx.io:
 *   - Base URL: `https://api.ltx.io` (KHÔNG phải queue.fal.run).
 *   - Auth: `Authorization: Bearer <token>` (KHÔNG phải `Key <token>` kiểu fal.ai).
 *   - Submit: POST `/v2/text-to-video` — body BẮT BUỘC `prompt`+`model`+`duration`+`resolution`
 *     (fal.ai không có 3 field bắt buộc này). Response 202: `{ id, created_at }` (không có status).
 *   - Poll: GET `/v2/text-to-video/{id}` — `status`: pending|processing|completed|failed;
 *     video ở `result.video_url` khi completed (docs.ltx.io ghi 2 cách khác nhau về tên key trong
 *     `result` — xử lý dự phòng: ưu tiên `result.video_url`, fallback lấy giá trị string đầu tiên
 *     trong `result` nếu field đó không tồn tại); lỗi ở `error.type`/`error.message` khi failed.
 *   - `model`/`resolution`/`duration` hợp lệ lấy từ docs.ltx.io/models/ltx-2-5#support-matrix
 *     (model `ltx-2-5-fast`, resolution `1280x720`, duration ∈ {6,8,10,...,20}s) — KHÔNG có field
 *     `negative_prompt`/`seed` trong schema thật, đã bỏ khỏi request (capabilities cập nhật tương ứng).
 *   - Không thấy endpoint hủy job trong tài liệu — `cancelGeneration` là no-op có ghi chú, giống Wan.
 *
 * ĐỔI DEFAULT_MODEL 13/9/2026: sau real visual benchmark (Knowledge → Scene → Prompt → LTX thật →
 * MP4 thật → human visual inspection PASS 6/6 tiêu chí — xem POST-BENCHMARK AUDIT), `ltx-2-3-fast`
 * được chốt làm DEFAULT VIDEO MODEL cho CONG AI VIDEO V1 (đủ rõ cho mục tiêu minh hoạ, rẻ hơn
 * `ltx-2-5-fast`). Support-matrix ở trên (resolution/duration) áp dụng cho CẢ `ltx-2-3-fast` VÀ
 * `ltx-2-5-fast` (đã xác nhận riêng qua docs.ltx.io/models/ltx-2-3 — cùng resolution/duration range).
 * `ltx-2-5-fast` vẫn dùng được bình thường bằng cách truyền `model` tường minh trong request.
 */
import { credentialProvider, type CredentialProvider } from "../credentials";
import {
  VideoProviderError,
  kiemTraDurationTrongKhoang,
  type ProviderInfo,
  type VideoGenerationRequest,
  type VideoJobHandle,
  type VideoJobResult,
  type VideoJobStatus,
  type VideoProvider,
} from "./types";

const DEFAULT_BASE_URL = "https://api.ltx.io";
const DEFAULT_MODEL = "ltx-2-3-fast";
const DEFAULT_RESOLUTION = "1280x720";
const DEFAULT_DURATION_SECONDS = 6; // giá trị NHỎ NHẤT hợp lệ theo support-matrix (rẻ/nhanh nhất cho smoke test)

const CAPABILITIES = {
  textToVideo: true,
  // image-to-video/audio-to-video là endpoint RIÊNG (/v2/image-to-video, /v2/audio-to-video) — chưa có adapter.
  imageToVideo: false,
  audioToVideo: false,
  durationRangeSeconds: { min: 6, max: 20 },
  resolutions: ["1280x720", "1920x1080", "2560x1440", "3840x2160", "720x1280", "1080x1920", "1440x2560", "2160x3840"],
  aspectRatios: ["16:9", "9:16"],
  maxDurationSeconds: 20,
  // Schema thật không có field seed/negative_prompt cho text-to-video.
  supportsSeed: false,
  supportsNegativePrompt: false,
  // STEP 6 §7: docs.ltx.io/v2/text-to-video KHÔNG có field aspect_ratio trong request body (chỉ
  // prompt/model/duration/resolution) — resolution TỰ mang aspect ratio (vd "1280x720"=16:9), nhưng
  // KHÔNG có field riêng để "yêu cầu" 1 aspect ratio độc lập với resolution. Khai false để
  // UI/provenance không hiểu lầm aspectRatio đã được áp dụng cho LTX (xem generateVideo bên dưới —
  // cố tình KHÔNG gửi field này lên request thật).
  supportsAspectRatio: false,
} as const;

function mapJobStatus(status: string | undefined): VideoJobStatus {
  switch (status) {
    case "pending":
      return "queued";
    case "processing":
      return "processing";
    case "completed":
      return "completed";
    case "failed":
      return "provider_error";
    default:
      return "provider_error";
  }
}

export class LTXProvider implements VideoProvider {
  readonly id = "ltx" as const;

  constructor(private readonly credentials: CredentialProvider = credentialProvider) {}

  getProviderInfo(): ProviderInfo {
    return { id: this.id, displayName: "LTX (Lightricks LTX.io)", capabilities: CAPABILITIES };
  }

  private async requireCredential() {
    const cred = await this.credentials.getCredential(this.id);
    if (!cred) {
      throw new VideoProviderError("auth_error", "Chưa cấu hình LTX_API_KEY trong .env.", false);
    }
    return { apiKey: cred.apiKey, baseUrl: (cred.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "") };
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const { apiKey, baseUrl } = await this.requireCredential();
      // Không có endpoint "whoami" trong tài liệu — dùng GET job-status với id giả: key hợp lệ trả
      // 404 (không tìm thấy job), key sai trả 401. Không tốn quota tạo video thật.
      const res = await fetch(`${baseUrl}/v2/text-to-video/khong-ton-tai`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return res.status !== 401 && res.status !== 403;
    } catch {
      return false;
    }
  }

  /**
   * STEP 6 §3: điền model/resolution/duration mặc định nếu request thiếu — trả về request ĐÃ RESOLVE
   * để bên gọi (job-manager) persist đúng giá trị sẽ thực sự gửi lên LTX, không lưu NULL.
   */
  resolveRequest(request: VideoGenerationRequest): VideoGenerationRequest {
    return {
      ...request,
      model: request.model || DEFAULT_MODEL,
      resolution: request.resolution || DEFAULT_RESOLUTION,
      durationSeconds: request.durationSeconds ?? DEFAULT_DURATION_SECONDS,
    };
  }

  async generateVideo(rawRequest: VideoGenerationRequest): Promise<VideoJobHandle> {
    const { apiKey, baseUrl } = await this.requireCredential();
    const request = this.resolveRequest(rawRequest);
    this.validateRequest(request);

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/v2/text-to-video`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: request.prompt,
          model: request.model,
          duration: request.durationSeconds,
          resolution: request.resolution,
        }),
      });
    } catch {
      throw new VideoProviderError("provider_error", "Lỗi mạng khi gọi LTX.", true);
    }

    if (res.status === 401 || res.status === 403) {
      throw new VideoProviderError("auth_error", "LTX từ chối API key.", false);
    }
    if (res.status === 429) {
      throw new VideoProviderError("rate_limit", "LTX báo vượt hạn mức tốc độ (rate limit).", true);
    }
    if (!res.ok) {
      const chiTiet = await res.text().catch(() => "");
      throw new VideoProviderError("provider_error", `LTX trả lỗi HTTP ${res.status}: ${chiTiet.slice(0, 300)}`, res.status >= 500);
    }

    const data = (await res.json()) as { id?: string };
    if (!data.id) {
      throw new VideoProviderError("provider_error", "Phản hồi LTX không có id job.", false);
    }
    return { externalJobId: data.id, status: "queued" };
  }

  async getGenerationStatus(externalJobId: string): Promise<VideoJobResult> {
    const { apiKey, baseUrl } = await this.requireCredential();

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/v2/text-to-video/${encodeURIComponent(externalJobId)}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    } catch {
      throw new VideoProviderError("provider_error", "Lỗi mạng khi tra cứu trạng thái LTX.", true);
    }

    if (res.status === 401 || res.status === 403) {
      throw new VideoProviderError("auth_error", "LTX từ chối API key.", false);
    }
    if (!res.ok) {
      throw new VideoProviderError("provider_error", `LTX trả lỗi HTTP ${res.status}.`, res.status >= 500);
    }

    const data = (await res.json()) as {
      status?: string;
      result?: Record<string, string>;
      error?: { type?: string; message?: string };
    };
    const status = mapJobStatus(data.status);

    if (status === "completed") {
      const videoUrl = data.result?.video_url ?? Object.values(data.result ?? {})[0];
      if (!videoUrl) {
        throw new VideoProviderError("download_error", "LTX báo hoàn tất nhưng không có URL video trong result.", false);
      }
      return { status: "completed", videoUrl };
    }
    if (status === "provider_error" && data.error) {
      return { status, errorMessage: `${data.error.type ?? "?"}: ${data.error.message ?? "không rõ"}` };
    }
    return { status };
  }

  /** Tài liệu chính thức không công bố endpoint hủy — no-op, job-manager tự đánh dấu "cancelled" ở DB của mình. */
  async cancelGeneration(_externalJobId: string): Promise<void> {
    return Promise.resolve();
  }

  private validateRequest(request: VideoGenerationRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new VideoProviderError("provider_error", "Thiếu prompt.", false);
    }
    // STEP 6 §4: enforce duration TRƯỚC khi gọi mạng — support-matrix thật (docs.ltx.io/models/ltx-2-5
    // VÀ docs.ltx.io/models/ltx-2-3, đã đối chiếu riêng từng model) xác nhận CẢ `ltx-2-3-fast` (default
    // từ 13/9/2026) lẫn `ltx-2-5-fast` chỉ nhận 6-20s. Bản STEP 2 không check gì vì lúc đó còn nhắm
    // nhầm model preview của fal.ai (không kiểm soát được duration) — model thật đã xác nhận range rõ
    // ràng nên không còn lý do bỏ qua. Dùng HÀM CHUNG với Wan, không tự viết lại phép so sánh min/max.
    const loiDuration = kiemTraDurationTrongKhoang(request.durationSeconds, CAPABILITIES);
    if (loiDuration) {
      throw new VideoProviderError("provider_error", `LTX: ${loiDuration}`, false);
    }
    if (request.audioInputUrl) {
      throw new VideoProviderError("provider_error", "LTX chưa hỗ trợ audio-to-video qua endpoint này.", false);
    }
    if (request.imageInputUrl) {
      throw new VideoProviderError("provider_error", "LTX chưa hỗ trợ image-to-video qua endpoint này.", false);
    }
  }
}
