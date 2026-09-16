/**
 * WAN PROVIDER ADAPTER — mọi chi tiết riêng của Wan (Alibaba Cloud Model Studio / DashScope
 * "Wanxiang" video synthesis) nằm TRỌN trong file này. Core (job-manager, API routes, UI) không
 * import file này trực tiếp — luôn đi qua `registry.ts`.
 *
 * ĐỐI CHIẾU 13/9/2026 với tài liệu chính thức Alibaba Cloud Model Studio ("Wan — text-to-video API
 * reference", alibabacloud.com/help/en/model-studio/text-to-video-api-reference):
 *   - Endpoint/field bên dưới đã sửa để khớp field thật: `parameters.resolution` + `parameters.ratio`
 *     (KHÔNG phải `parameters.size` như bản viết lúc đầu — DashScope im lặng bỏ qua field lạ, không
 *     báo lỗi, nên field sai sẽ khiến resolution/tỉ lệ khung hình bị lờ đi mà không hề biết).
 *   - Tài liệu KHÔNG có endpoint cancel cho text-to-video — `cancelGeneration` cố tình là no-op phía
 *     Wan, job-manager vẫn đánh dấu "cancelled" ở DB của mình bất kể provider có hủy được hay không.
 *   - `img_url` (image-to-video) đã BỎ khỏi request: Alibaba tách image-to-video thành API/endpoint
 *     RIÊNG (`image-to-video-general-api-reference`), không phải field tùy chọn trên endpoint T2V này
 *     — gửi kèm sẽ bị lờ đi. `imageToVideo` hạ xuống `false` cho tới khi có adapter riêng cho endpoint đó.
 *   - Base URL mặc định dùng dạng "global" `dashscope.aliyuncs.com` (phổ biến cho tài khoản cá nhân/
 *     DevKey) — tài khoản dùng workspace/region riêng (dạng `{WorkspaceId}.{region}.maas.aliyuncs.com`)
 *     PHẢI set `WAN_API_BASE_URL` cho đúng, adapter không đoán được WorkspaceId.
 *   - Model id ví dụ trong tài liệu hiện là dạng có ngày tháng (vd `wan2.7-t2v-2026-06-12`) và các
 *     model "legacy" (`wanx2.1-t2v-turbo`, `wanx2.2-t2v-turbo`) — ID đổi theo thời gian, luôn set
 *     `request.model` tường minh thay vì tin tưởng DEFAULT_MODEL vẫn còn tồn tại.
 * Toàn bộ phần vendor-specific giới hạn trong file này — cần sửa tiếp thì chỉ sửa ở đây.
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

const DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/api/v1";
const DEFAULT_MODEL = "wanx2.1-t2v-turbo";

const CAPABILITIES = {
  textToVideo: true,
  // Hạ xuống false 13/9/2026 — tài liệu chính thức tách image-to-video thành endpoint riêng, endpoint
  // T2V dùng ở đây không nhận img_url. Bật lại khi có adapter riêng cho endpoint I2V thật.
  imageToVideo: false,
  audioToVideo: false,
  durationRangeSeconds: { min: 2, max: 15 },
  resolutions: ["720P", "1080P"],
  aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
  maxDurationSeconds: 15,
  supportsSeed: true,
  supportsNegativePrompt: true,
  // Model Studio nhận `parameters.ratio` thật (xem generateVideo bên dưới) — KHÁC LTX.
  supportsAspectRatio: true,
} as const;

/** DashScope trả trạng thái task theo tập giá trị riêng — map sang `VideoJobStatus` dùng chung. */
function mapTaskStatus(taskStatus: string | undefined): VideoJobStatus {
  switch (taskStatus) {
    case "PENDING":
      return "queued";
    case "RUNNING":
      return "processing";
    case "SUCCEEDED":
      return "completed";
    case "FAILED":
      return "provider_error";
    case "CANCELED":
      return "cancelled";
    // task_id chỉ có hiệu lực 24h — quá hạn tra cứu trả UNKNOWN, coi như hết thời gian chờ.
    case "UNKNOWN":
      return "timeout";
    default:
      return "provider_error";
  }
}

export class WanProvider implements VideoProvider {
  readonly id = "wan" as const;

  constructor(private readonly credentials: CredentialProvider = credentialProvider) {}

  getProviderInfo(): ProviderInfo {
    return { id: this.id, displayName: "Wan (Alibaba Wanxiang)", capabilities: CAPABILITIES };
  }

  private async requireCredential() {
    const cred = await this.credentials.getCredential(this.id);
    if (!cred) {
      throw new VideoProviderError("auth_error", "Chưa cấu hình WAN_API_KEY trong .env.", false);
    }
    return { apiKey: cred.apiKey, baseUrl: (cred.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "") };
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const { apiKey, baseUrl } = await this.requireCredential();
      // Endpoint nhẹ nhất để xác nhận key còn hợp lệ mà không tốn quota tạo video thật.
      const res = await fetch(`${baseUrl}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * STEP 6 §3: điền `model` mặc định nếu thiếu — KHÔNG có `DEFAULT_RESOLUTION`/`DEFAULT_DURATION`
   * riêng cho Wan (DashScope tự chọn nếu thiếu, chưa có bằng chứng giá trị mặc định thật là gì — bịa
   * ra 1 con số ở đây còn sai hơn để trống), nên chỉ resolve đúng field có default THẬT SỰ tồn tại.
   */
  resolveRequest(request: VideoGenerationRequest): VideoGenerationRequest {
    return { ...request, model: request.model || DEFAULT_MODEL };
  }

  async generateVideo(rawRequest: VideoGenerationRequest): Promise<VideoJobHandle> {
    const { apiKey, baseUrl } = await this.requireCredential();
    const request = this.resolveRequest(rawRequest);
    this.validateRequest(request);

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/services/aigc/video-generation/video-synthesis`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-DashScope-Async": "enable",
        },
        body: JSON.stringify({
          model: request.model,
          input: {
            prompt: request.prompt,
            negative_prompt: request.negativePrompt,
          },
          parameters: {
            resolution: request.resolution,
            ratio: request.aspectRatio,
            duration: request.durationSeconds,
            seed: request.seed,
          },
        }),
      });
    } catch {
      throw new VideoProviderError("provider_error", "Lỗi mạng khi gọi Wan.", true);
    }

    if (res.status === 401 || res.status === 403) {
      throw new VideoProviderError("auth_error", "Wan từ chối API key.", false);
    }
    if (res.status === 429) {
      throw new VideoProviderError("rate_limit", "Wan báo vượt hạn mức tốc độ (rate limit).", true);
    }
    if (!res.ok) {
      throw new VideoProviderError("provider_error", `Wan trả lỗi HTTP ${res.status}.`, res.status >= 500);
    }

    const data = (await res.json()) as { output?: { task_id?: string; task_status?: string } };
    const taskId = data.output?.task_id;
    if (!taskId) {
      throw new VideoProviderError("provider_error", "Phản hồi Wan không có task_id.", false);
    }
    return { externalJobId: taskId, status: mapTaskStatus(data.output?.task_status) };
  }

  async getGenerationStatus(externalJobId: string): Promise<VideoJobResult> {
    const { apiKey, baseUrl } = await this.requireCredential();

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/tasks/${encodeURIComponent(externalJobId)}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    } catch {
      throw new VideoProviderError("provider_error", "Lỗi mạng khi tra cứu trạng thái Wan.", true);
    }

    if (res.status === 401 || res.status === 403) {
      throw new VideoProviderError("auth_error", "Wan từ chối API key.", false);
    }
    if (!res.ok) {
      throw new VideoProviderError("provider_error", `Wan trả lỗi HTTP ${res.status}.`, res.status >= 500);
    }

    const data = (await res.json()) as {
      output?: { task_status?: string; video_url?: string; code?: string; message?: string };
    };
    const status = mapTaskStatus(data.output?.task_status);
    return {
      status,
      videoUrl: status === "completed" ? data.output?.video_url : undefined,
      errorMessage:
        status === "provider_error" && data.output
          ? `${data.output.code ?? "?"}: ${data.output.message ?? "không rõ"}`
          : undefined,
    };
  }

  /**
   * Tài liệu chính thức KHÔNG công bố endpoint hủy cho text-to-video (đối chiếu 13/9/2026) — cố tình
   * NO-OP thay vì gọi 1 URL đoán mò rồi im lặng nuốt lỗi (dễ gây hiểu lầm là đã hủy được phía Wan).
   * job-manager vẫn đánh dấu job "cancelled" ở DB của mình bất kể Wan có nhận biết hay không.
   */
  async cancelGeneration(_externalJobId: string): Promise<void> {
    return Promise.resolve();
  }

  private validateRequest(request: VideoGenerationRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new VideoProviderError("provider_error", "Thiếu prompt.", false);
    }
    // STEP 6 §4: kiểm tra CẢ min lẫn max (bản cũ chỉ check max) — dùng chung 1 hàm với LTX, capability
    // là source of truth duy nhất, không lặp lại số 2/15 ở nơi khác.
    const loiDuration = kiemTraDurationTrongKhoang(request.durationSeconds, CAPABILITIES);
    if (loiDuration) {
      throw new VideoProviderError("provider_error", `Wan: ${loiDuration}`, false);
    }
    if (request.audioInputUrl) {
      throw new VideoProviderError("provider_error", "Wan chưa hỗ trợ audio-to-video.", false);
    }
    if (request.imageInputUrl) {
      throw new VideoProviderError(
        "provider_error",
        "Endpoint Wan đang dùng (text-to-video) không nhận ảnh đầu vào — image-to-video là API riêng, chưa có adapter.",
        false,
      );
    }
  }
}
