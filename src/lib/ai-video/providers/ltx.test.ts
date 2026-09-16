import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CredentialProvider } from "../credentials";
import { LTXProvider } from "./ltx";
import { VideoProviderError } from "./types";

const SECRET_KEY = "ltx-super-secret-key-nao-cung-khong-duoc-lo";

function credentialStub(apiKey: string | null): CredentialProvider {
  return { getCredential: async () => (apiKey ? { apiKey } : null) };
}

describe("LTXProvider (api.ltx.io)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("generateVideo: thiếu key -> VideoProviderError auth_error, KHÔNG gọi fetch", async () => {
    const provider = new LTXProvider(credentialStub(null));
    await expect(provider.generateVideo({ prompt: "a scene" })).rejects.toMatchObject({ status: "auth_error" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("generateVideo: image-to-video chưa được hỗ trợ qua endpoint text-to-video -> lỗi validate trước khi gọi mạng", async () => {
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    await expect(provider.generateVideo({ prompt: "a", imageInputUrl: "https://x/a.png" })).rejects.toThrow();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("generateVideo: dùng đúng header Authorization: Bearer (KHÔNG phải 'Key' kiểu fal.ai)", async () => {
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({ ok: true, status: 202, json: async () => ({ id: "job-1", created_at: "now" }) });
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    await provider.generateVideo({ prompt: "a scene" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.ltx.io/v2/text-to-video");
    expect((init as RequestInit).headers).toMatchObject({ Authorization: `Bearer ${SECRET_KEY}` });
  });

  it("generateVideo: body gửi đúng field bắt buộc (prompt/model/duration/resolution), có default khi thiếu (default V1 = ltx-2-3-fast từ 13/9/2026 sau benchmark)", async () => {
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({ ok: true, status: 202, json: async () => ({ id: "job-1", created_at: "now" }) });
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    await provider.generateVideo({ prompt: "a scene" });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({ prompt: "a scene", model: "ltx-2-3-fast", duration: 6, resolution: "1280x720" });
  });

  it("generateVideo: model ltx-2-5-fast VẪN dùng được khi truyền tường minh (không bị xoá khi đổi default)", async () => {
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({ ok: true, status: 202, json: async () => ({ id: "job-1", created_at: "now" }) });
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    await provider.generateVideo({ prompt: "a scene", model: "ltx-2-5-fast" });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.model).toBe("ltx-2-5-fast");
  });

  it("generateVideo: HTTP 401 -> auth_error", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 401, text: async () => "" });
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    await expect(provider.generateVideo({ prompt: "a" })).rejects.toMatchObject({ status: "auth_error" });
  });

  describe("STEP 6 §4: duration enforcement (support-matrix thật docs.ltx.io/models/ltx-2-5, 6-20s)", () => {
    const provider = new LTXProvider(credentialStub(SECRET_KEY));

    it.each([2, 5])("duration %is -> FAIL trước network (dưới min 6s)", async (durationSeconds) => {
      await expect(provider.generateVideo({ prompt: "a", durationSeconds })).rejects.toThrow();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("duration 21s -> FAIL trước network (trên max 20s)", async () => {
      await expect(provider.generateVideo({ prompt: "a", durationSeconds: 21 })).rejects.toThrow();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it.each([6, 20])("duration %is -> PASS (đúng biên min/max)", async (durationSeconds) => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, status: 202, json: async () => ({ id: "job-1", created_at: "now" }) });
      await expect(provider.generateVideo({ prompt: "a", durationSeconds })).resolves.toBeTruthy();
    });
  });

  it("STEP 6 §3: resolveRequest điền model/resolution/duration mặc định nếu thiếu (default V1 = ltx-2-3-fast), giữ nguyên nếu đã có", () => {
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    expect(provider.resolveRequest({ prompt: "a" })).toMatchObject({ model: "ltx-2-3-fast", resolution: "1280x720", durationSeconds: 6 });
    expect(provider.resolveRequest({ prompt: "a", model: "ltx-2-5-pro", resolution: "1920x1080", durationSeconds: 10 })).toMatchObject({
      model: "ltx-2-5-pro",
      resolution: "1920x1080",
      durationSeconds: 10,
    });
    // ltx-2-5-fast (default CŨ) vẫn resolve đúng khi truyền tường minh — không bị mất khả năng dùng.
    expect(provider.resolveRequest({ prompt: "a", model: "ltx-2-5-fast" })).toMatchObject({ model: "ltx-2-5-fast" });
  });

  it("STEP 6 §7: capability khai supportsAspectRatio=false, KHÔNG bao giờ gửi aspectRatio lên request thật", async () => {
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    expect(provider.getProviderInfo().capabilities.supportsAspectRatio).toBe(false);

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, status: 202, json: async () => ({ id: "job-1", created_at: "now" }) });
    await provider.generateVideo({ prompt: "a scene", aspectRatio: "16:9" });
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).not.toHaveProperty("aspect_ratio");
    expect(body).not.toHaveProperty("aspectRatio");
  });

  it("generateVideo: thành công -> trả id job làm externalJobId, status queued", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 202,
      json: async () => ({ id: "job-123", created_at: "2026-09-13T00:00:00Z" }),
    });
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    const handle = await provider.generateVideo({ prompt: "a scene" });
    expect(handle).toEqual({ externalJobId: "job-123", status: "queued" });
  });

  it("getGenerationStatus: pending/processing -> map đúng trạng thái, CHỈ 1 lần gọi mạng", async () => {
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ status: "processing", id: "job-1" }) });
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    const result = await provider.getGenerationStatus("job-1");
    expect(result).toEqual({ status: "processing" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("getGenerationStatus: completed -> lấy videoUrl từ result.video_url", async () => {
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "completed", id: "job-1", result: { video_url: "https://cdn/out.mp4" } }),
    });
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    const result = await provider.getGenerationStatus("job-1");
    expect(result).toEqual({ status: "completed", videoUrl: "https://cdn/out.mp4" });
  });

  it("getGenerationStatus: failed -> errorMessage lấy từ error.type/error.message", async () => {
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "failed", id: "job-1", error: { type: "generation_error", message: "model timed out" } }),
    });
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    const result = await provider.getGenerationStatus("job-1");
    expect(result.status).toBe("provider_error");
    expect(result.errorMessage).toContain("model timed out");
  });

  it("BẢO MẬT: mọi lỗi ném ra KHÔNG BAO GIỜ chứa API key thật trong message", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500, text: async () => "server error" });
    const provider = new LTXProvider(credentialStub(SECRET_KEY));
    try {
      await provider.generateVideo({ prompt: "a" });
      throw new Error("phải ném lỗi ở trên");
    } catch (err) {
      const message = err instanceof VideoProviderError ? err.message : String(err);
      expect(message).not.toContain(SECRET_KEY);
    }
  });
});
