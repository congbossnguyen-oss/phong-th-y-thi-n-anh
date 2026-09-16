/**
 * HỢP ĐỒNG PROVIDER cho CONG AI VIDEO — core (scene-planner, prompt-builder, job-manager, API routes,
 * UI) chỉ được phép biết tới các type/interface trong file này. KHÔNG import thẳng WanProvider hay
 * LTXProvider ở bất kỳ đâu ngoài `registry.ts` — nếu thấy mình sắp làm vậy nghĩa là đang phá vỡ
 * abstraction (core "không được biết chi tiết implementation của Wan hoặc LTX").
 */

export type VideoProviderId = "wan" | "ltx";

export interface ProviderCapabilities {
  textToVideo: boolean;
  imageToVideo: boolean;
  audioToVideo: boolean;
  durationRangeSeconds: { min: number; max: number };
  resolutions: readonly string[];
  aspectRatios: readonly string[];
  maxDurationSeconds: number;
  supportsSeed: boolean;
  supportsNegativePrompt: boolean;
  /**
   * STEP 6 §7: true nếu provider THẬT SỰ nhận field `aspectRatio` và áp dụng nó lên video sinh ra.
   * LTX KHÔNG có field này trong request body thật (docs.ltx.io/v2/text-to-video chỉ có
   * prompt/model/duration/resolution) — khai `false` để không ai (UI/provenance) hiểu lầm là
   * aspectRatio đã được áp dụng cho LTX. Wan CÓ gửi qua `parameters.ratio` — khai `true`.
   */
  supportsAspectRatio: boolean;
}

export interface ProviderInfo {
  id: VideoProviderId;
  displayName: string;
  capabilities: ProviderCapabilities;
}

/**
 * Schema request THỐNG NHẤT — không phải field nào provider nào cũng dùng được, đó là lý do có
 * `ProviderCapabilities` để mỗi adapter tự khai capability rồi validate request theo đúng khả năng
 * thật của mình (xem `validateRequest` trong wan.ts/ltx.ts) thay vì core phải biết luật riêng từng bên.
 */
export interface VideoGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  model?: string;
  durationSeconds?: number;
  resolution?: string;
  aspectRatio?: string;
  fps?: number;
  seed?: number;
  /** Ảnh gốc cho image-to-video — URL công khai provider tải được. */
  imageInputUrl?: string;
  /** Audio đồng bộ cho audio-to-video (nếu provider hỗ trợ). */
  audioInputUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Trạng thái job — bao trùm cả luồng thành công (Phase 10) lẫn các loại lỗi cần phân biệt để hiển thị
 * đúng nguyên nhân cho admin (hết hạn mức, sai key, provider lỗi, lỗi tải file, ...).
 */
export type VideoJobStatus =
  | "queued"
  | "submitted"
  | "processing"
  | "completed"
  | "downloading"
  | "ready"
  | "failed"
  | "cancelled"
  | "timeout"
  | "auth_error"
  | "rate_limit"
  | "provider_error"
  | "download_error";

export const TRANG_THAI_LOI: ReadonlySet<VideoJobStatus> = new Set([
  "failed",
  "cancelled",
  "timeout",
  "auth_error",
  "rate_limit",
  "provider_error",
  "download_error",
]);

export const TRANG_THAI_KET_THUC: ReadonlySet<VideoJobStatus> = new Set(["ready", ...TRANG_THAI_LOI]);

export interface VideoJobHandle {
  externalJobId: string;
  status: VideoJobStatus;
}

export interface VideoJobResult {
  status: VideoJobStatus;
  /** URL video khi status = "completed"/"ready" — không tải/re-host lại, dùng thẳng URL provider trả. */
  videoUrl?: string;
  errorMessage?: string;
}

/**
 * Lỗi chuẩn hoá — mọi adapter PHẢI ném đúng loại này (không để lộ HTTP body thô có thể chứa dữ liệu
 * nhạy cảm, không bao giờ chứa API key) để job-manager map thẳng sang `status` lưu trong DB.
 */
export class VideoProviderError extends Error {
  readonly status: VideoJobStatus;
  readonly retryable: boolean;

  constructor(status: VideoJobStatus, message: string, retryable = false) {
    super(message);
    this.name = "VideoProviderError";
    this.status = status;
    this.retryable = retryable;
  }
}

export interface VideoProvider {
  readonly id: VideoProviderId;

  getProviderInfo(): ProviderInfo;

  /** Gọi 1 endpoint rẻ/nhẹ của provider để xác nhận key còn dùng được — dùng cho "Test Connection". */
  validateCredentials(): Promise<boolean>;

  /**
   * STEP 6 §3: điền model/resolution/duration MẶC ĐỊNH của CHÍNH provider này nếu request thiếu —
   * KHÔNG gọi mạng, thuần đồng bộ. Bên gọi (job-manager) PHẢI gọi hàm này rồi mới persist job, để DB
   * lưu đúng giá trị SẼ THỰC SỰ được gửi lên provider, thay vì lưu NULL trong khi adapter âm thầm
   * dùng default nội bộ (bug provenance đã audit ở STEP 5 §7). `generateVideo()` cũng tự gọi hàm này
   * ở đầu — gọi 2 lần trên cùng 1 request đã resolve là vô hại (idempotent, không có default nào để
   * điền thêm lần 2).
   */
  resolveRequest(request: VideoGenerationRequest): VideoGenerationRequest;

  /** Submit job tạo video — KHÔNG chờ tới khi xong (async), trả về handle để poll. */
  generateVideo(request: VideoGenerationRequest): Promise<VideoJobHandle>;

  getGenerationStatus(externalJobId: string): Promise<VideoJobResult>;

  cancelGeneration(externalJobId: string): Promise<void>;
}

/**
 * STEP 6 §4: kiểm tra chung "duration có nằm trong khoảng provider cho phép hay không" — CHỈ 1 chỗ
 * viết logic so sánh min/max, mỗi adapter tự truyền `CAPABILITIES` của mình vào (source of truth vẫn
 * là capability tự khai, không hard-code số ở đây). Trả `null` nếu hợp lệ hoặc chưa xác định
 * (durationSeconds undefined — "chưa chỉ định" không phải "invalid", để provider tự dùng default).
 */
export function kiemTraDurationTrongKhoang(
  durationSeconds: number | undefined,
  capabilities: Pick<ProviderCapabilities, "durationRangeSeconds">,
): string | null {
  if (durationSeconds === undefined) return null;
  const { min, max } = capabilities.durationRangeSeconds;
  if (durationSeconds < min || durationSeconds > max) {
    return `Thời lượng ${durationSeconds}s ngoài khoảng cho phép (${min}-${max}s).`;
  }
  return null;
}
