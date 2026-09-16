import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CredentialProvider } from "../credentials";
import { WanProvider } from "./wan";
import { VideoProviderError } from "./types";

const SECRET_KEY = "wan-super-secret-key-nao-cung-khong-duoc-lo";

function credentialStub(apiKey: string | null): CredentialProvider {
  return { getCredential: async () => (apiKey ? { apiKey } : null) };
}

describe("WanProvider", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("validateCredentials trả false (không throw) khi chưa cấu hình key", async () => {
    const provider = new WanProvider(credentialStub(null));
    await expect(provider.validateCredentials()).resolves.toBe(false);
  });

  it("generateVideo: thiếu key -> VideoProviderError auth_error, KHÔNG gọi fetch", async () => {
    const provider = new WanProvider(credentialStub(null));
    await expect(provider.generateVideo({ prompt: "a scene" })).rejects.toMatchObject({ status: "auth_error" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("generateVideo: thiếu prompt -> lỗi validate, KHÔNG gọi fetch (fail fast)", async () => {
    const provider = new WanProvider(credentialStub(SECRET_KEY));
    await expect(provider.generateVideo({ prompt: "" })).rejects.toThrow();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("generateVideo: vượt quá thời lượng tối đa của Wan -> lỗi validate trước khi gọi mạng", async () => {
    const provider = new WanProvider(credentialStub(SECRET_KEY));
    await expect(provider.generateVideo({ prompt: "a", durationSeconds: 999 })).rejects.toThrow();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("STEP 6 §4: DƯỚI thời lượng tối thiểu (2s) của Wan -> lỗi validate trước khi gọi mạng (bản cũ chỉ check max, không check min)", async () => {
    const provider = new WanProvider(credentialStub(SECRET_KEY));
    await expect(provider.generateVideo({ prompt: "a", durationSeconds: 1 })).rejects.toThrow();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("STEP 6 §4: đúng biên min(2s)/max(15s) -> PASS, không bị chặn", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ output: { task_id: "t", task_status: "PENDING" } }),
    });
    const provider = new WanProvider(credentialStub(SECRET_KEY));
    await expect(provider.generateVideo({ prompt: "a", durationSeconds: 2 })).resolves.toBeTruthy();
    await expect(provider.generateVideo({ prompt: "a", durationSeconds: 15 })).resolves.toBeTruthy();
  });

  it("STEP 6 §3: resolveRequest điền model mặc định nếu thiếu, giữ nguyên nếu đã có", () => {
    const provider = new WanProvider(credentialStub(SECRET_KEY));
    expect(provider.resolveRequest({ prompt: "a" }).model).toBe("wanx2.1-t2v-turbo");
    expect(provider.resolveRequest({ prompt: "a", model: "wan2.7-t2v-2026-06-12" }).model).toBe("wan2.7-t2v-2026-06-12");
  });

  it("STEP 6 §7: capability khai supportsAspectRatio=true (Wan CÓ gửi parameters.ratio thật)", () => {
    const provider = new WanProvider(credentialStub(SECRET_KEY));
    expect(provider.getProviderInfo().capabilities.supportsAspectRatio).toBe(true);
  });

  it("generateVideo: HTTP 401 -> auth_error", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 401, text: async () => "" });
    const provider = new WanProvider(credentialStub(SECRET_KEY));
    await expect(provider.generateVideo({ prompt: "a" })).rejects.toMatchObject({ status: "auth_error" });
  });

  it("generateVideo: HTTP 429 -> rate_limit (retryable)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 429, text: async () => "" });
    const provider = new WanProvider(credentialStub(SECRET_KEY));
    await expect(provider.generateVideo({ prompt: "a" })).rejects.toMatchObject({ status: "rate_limit", retryable: true });
  });

  it("generateVideo: thành công -> trả externalJobId + status queued", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ output: { task_id: "task-123", task_status: "PENDING" } }),
    });
    const provider = new WanProvider(credentialStub(SECRET_KEY));
    const handle = await provider.generateVideo({ prompt: "a scene" });
    expect(handle).toEqual({ externalJobId: "task-123", status: "queued" });
  });

  it("getGenerationStatus: SUCCEEDED -> completed kèm videoUrl", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ output: { task_status: "SUCCEEDED", video_url: "https://cdn/video.mp4" } }),
    });
    const provider = new WanProvider(credentialStub(SECRET_KEY));
    const result = await provider.getGenerationStatus("task-123");
    expect(result).toEqual({ status: "completed", videoUrl: "https://cdn/video.mp4", errorMessage: undefined });
  });

  it("BẢO MẬT: mọi lỗi ném ra KHÔNG BAO GIỜ chứa API key thật trong message", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500, text: async () => "server error" });
    const provider = new WanProvider(credentialStub(SECRET_KEY));
    try {
      await provider.generateVideo({ prompt: "a" });
      throw new Error("phải ném lỗi ở trên");
    } catch (err) {
      const message = err instanceof VideoProviderError ? err.message : String(err);
      expect(message).not.toContain(SECRET_KEY);
    }
  });
});
