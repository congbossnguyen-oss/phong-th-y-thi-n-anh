import { describe, expect, it } from "vitest";
import { lyDoChanTrialTheoThietBi, IP_TRIAL_TOI_DA } from "./trial";

// Test HÀM THUẦN quyết định chặn dùng thử (mức "Vừa") — không đụng DB.
describe("Chống lạm dụng dùng thử — lyDoChanTrialTheoThietBi", () => {
  it("chặn khi thiết bị đã từng dùng thử", () => {
    const loi = lyDoChanTrialTheoThietBi({ thietBiDaThu: true, soLuotIp: 0 });
    expect(loi).toBeTypeOf("string");
    expect(loi).toContain("Thiết bị này đã dùng thử");
  });

  it("cho phép khi thiết bị mới và IP dưới ngưỡng", () => {
    expect(lyDoChanTrialTheoThietBi({ thietBiDaThu: false, soLuotIp: 0 })).toBeNull();
    expect(lyDoChanTrialTheoThietBi({ thietBiDaThu: false, soLuotIp: IP_TRIAL_TOI_DA - 1 })).toBeNull();
  });

  it("chặn khi số lượt của IP đạt hoặc vượt ngưỡng", () => {
    expect(lyDoChanTrialTheoThietBi({ thietBiDaThu: false, soLuotIp: IP_TRIAL_TOI_DA })).toContain("Mạng của bạn");
    expect(lyDoChanTrialTheoThietBi({ thietBiDaThu: false, soLuotIp: IP_TRIAL_TOI_DA + 10 })).not.toBeNull();
  });

  it("ưu tiên báo lỗi thiết bị trước lỗi IP", () => {
    const loi = lyDoChanTrialTheoThietBi({ thietBiDaThu: true, soLuotIp: 999 });
    expect(loi).toContain("Thiết bị");
  });

  it("ngưỡng IP là 3 (nới để tránh chặn nhầm nhà/công ty)", () => {
    expect(IP_TRIAL_TOI_DA).toBe(3);
  });
});
