import { describe, expect, it } from "vitest";
import { getVideoProvider, listVideoProviders } from "./registry";
import { LTXProvider } from "./ltx";
import { WanProvider } from "./wan";
import type { VideoProviderId } from "./types";

describe("registry — provider discovery", () => {
  it("liệt kê đủ 2 provider V1 (wan, ltx) kèm capability", () => {
    const providers = listVideoProviders();
    const ids = providers.map((p) => p.id).sort();
    expect(ids).toEqual(["ltx", "wan"]);
    for (const p of providers) {
      expect(p.capabilities.textToVideo).toBe(true);
    }
    // Wan: đã đối chiếu tài liệu chính thức, giới hạn thời lượng có thật (13/9/2026).
    expect(getVideoProvider("wan").getProviderInfo().capabilities.maxDurationSeconds).toBeGreaterThan(0);
  });

  it("getVideoProvider trả đúng loại adapter theo id", () => {
    expect(getVideoProvider("wan")).toBeInstanceOf(WanProvider);
    expect(getVideoProvider("ltx")).toBeInstanceOf(LTXProvider);
  });

  it("id không xác định thì throw thay vì trả về provider ngẫu nhiên", () => {
    expect(() => getVideoProvider("khong-ton-tai" as VideoProviderId)).toThrow();
  });
});
