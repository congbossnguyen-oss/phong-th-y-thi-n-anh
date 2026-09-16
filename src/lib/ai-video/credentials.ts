/**
 * CREDENTIAL ABSTRACTION cho CONG AI VIDEO — một cửa duy nhất để lấy API key/base URL của mỗi
 * Video Provider (Wan, LTX, ...).
 *
 * VÌ SAO TÁCH RIÊNG lớp này thay vì để WanProvider/LTXProvider tự đọc `process.env`: V1 dùng key do
 * operator (anh Công) cấu hình 1 lần trong `.env` (giống ANTHROPIC_API_KEY/SEPAY_API_TOKEN đã có ở
 * chart-profile/api-key.ts), nhưng sau này nếu chuyển sang BYOK (mỗi user tự nhập key riêng, lưu
 * trong DB) thì chỉ cần viết thêm 1 implementation MỚI của `CredentialProvider` — provider Wan/LTX
 * và job-manager không cần sửa gì, vì chúng chỉ biết gọi `credentialProvider.getCredential(id)`.
 *
 *   V1:  .env → EnvCredentialProvider → VideoProvider
 *   V2:  DB/Settings UI → DbCredentialProvider (chưa xây) → VideoProvider   (không đổi contract)
 *
 * Không log/không throw kèm giá trị key thật ở đây — lỗi chỉ nói THIẾU biến nào, không in giá trị.
 */
import type { VideoProviderId } from "./providers/types";

export interface AiVideoCredential {
  apiKey: string;
  /** Cho phép override base URL (vd dùng gateway trung gian/proxy) — để trống dùng mặc định của adapter. */
  baseUrl?: string;
}

export interface CredentialProvider {
  /** Trả về null nếu chưa cấu hình — bên gọi tự quyết định coi là "chưa sẵn sàng", không throw ở đây. */
  getCredential(providerId: VideoProviderId): Promise<AiVideoCredential | null>;
}

/** Tên biến môi trường (API key / base URL override) cho mỗi Video Provider. */
const BIEN_MOI_TRUONG: Record<VideoProviderId, { apiKey: string; baseUrl: string }> = {
  wan: { apiKey: "WAN_API_KEY", baseUrl: "WAN_API_BASE_URL" },
  ltx: { apiKey: "LTX_API_KEY", baseUrl: "LTX_API_BASE_URL" },
};

/**
 * Đọc biến môi trường — ưu tiên `process.env` (giá trị thật lúc chạy trên Node adapter), rồi mới
 * tới `import.meta.env` (phục vụ chạy dev cục bộ bằng file .env) — cùng thứ tự đã dùng ở
 * chart-profile/api-key.ts để tránh lặp lại sự cố "khoá cấp lúc chạy nhưng code chỉ đọc lúc build".
 */
function bienMoiTruong(ten: string): string {
  const tuRuntime = typeof process !== "undefined" ? process.env?.[ten] : undefined;
  const tuBuild = (import.meta.env as Record<string, string | undefined> | undefined)?.[ten];
  return (tuRuntime || tuBuild || "").trim();
}

/** V1: credential operator-level đọc thẳng từ `.env` — không có UI nhập key theo từng user. */
export class EnvCredentialProvider implements CredentialProvider {
  async getCredential(providerId: VideoProviderId): Promise<AiVideoCredential | null> {
    const bien = BIEN_MOI_TRUONG[providerId];
    const apiKey = bienMoiTruong(bien.apiKey);
    if (!apiKey) return null;
    const baseUrl = bienMoiTruong(bien.baseUrl) || undefined;
    return { apiKey, baseUrl };
  }
}

/** Instance dùng chung toàn app cho V1 — đổi sang implementation khác (BYOK) ở đúng 1 chỗ này. */
export const credentialProvider: CredentialProvider = new EnvCredentialProvider();
