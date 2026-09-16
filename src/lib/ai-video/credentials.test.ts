import { afterEach, describe, expect, it } from "vitest";
import { EnvCredentialProvider } from "./credentials";

describe("EnvCredentialProvider", () => {
  afterEach(() => {
    delete process.env.WAN_API_KEY;
    delete process.env.WAN_API_BASE_URL;
    delete process.env.LTX_API_KEY;
  });

  it("trả null khi chưa cấu hình biến môi trường — KHÔNG throw", async () => {
    const provider = new EnvCredentialProvider();
    await expect(provider.getCredential("wan")).resolves.toBeNull();
  });

  it("đọc đúng biến môi trường theo từng provider — wan và ltx KHÔNG lẫn nhau", async () => {
    process.env.WAN_API_KEY = "wan-secret-123";
    process.env.LTX_API_KEY = "ltx-secret-456";
    const provider = new EnvCredentialProvider();

    const wanCred = await provider.getCredential("wan");
    const ltxCred = await provider.getCredential("ltx");

    expect(wanCred?.apiKey).toBe("wan-secret-123");
    expect(ltxCred?.apiKey).toBe("ltx-secret-456");
  });

  it("baseUrl là optional — undefined khi không cấu hình, có giá trị khi cấu hình", async () => {
    process.env.WAN_API_KEY = "k";
    const provider = new EnvCredentialProvider();
    expect((await provider.getCredential("wan"))?.baseUrl).toBeUndefined();

    process.env.WAN_API_BASE_URL = "https://proxy.example.com";
    expect((await provider.getCredential("wan"))?.baseUrl).toBe("https://proxy.example.com");
  });

  it("chuỗi rỗng/khoảng trắng coi như CHƯA cấu hình", async () => {
    process.env.WAN_API_KEY = "   ";
    const provider = new EnvCredentialProvider();
    await expect(provider.getCredential("wan")).resolves.toBeNull();
  });
});
