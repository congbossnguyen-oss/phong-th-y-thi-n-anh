import { describe, expect, it } from "vitest";
import { thangHienTaiVN, HAN_MUC_LUOT_THEO_GOI } from "./usage";

describe("thangHienTaiVN — mốc tháng theo giờ Việt Nam", () => {
  it("định dạng yyyy-MM", () => {
    expect(thangHienTaiVN(new Date("2026-08-27T10:00:00Z"))).toBe("2026-08");
  });

  it("gần nửa đêm UTC vẫn tính đúng theo giờ VN (UTC+7) — có thể lệch sang ngày/tháng khác", () => {
    // 31/12/2025 23:00 UTC = 1/1/2026 06:00 VN -> tháng phải là 2026-01, không phải 2025-12.
    expect(thangHienTaiVN(new Date("2025-12-31T23:00:00Z"))).toBe("2026-01");
  });
});

describe("HAN_MUC_LUOT_THEO_GOI", () => {
  it("Cao cấp có hạn mức cao hơn Cơ bản", () => {
    expect(HAN_MUC_LUOT_THEO_GOI.cao_cap).toBeGreaterThan(HAN_MUC_LUOT_THEO_GOI.co_ban);
  });
});
