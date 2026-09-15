import { describe, expect, it } from "vitest";
import { buildChartId } from "../../../src/interpretation/chart-id.js";

const BASE_INPUT = { date: "2024-01-01", hour: 10, minute: 30, timeZone: "Asia/Shanghai" };
const BASE_PROFILE = { profileId: "classical-v1", version: "0.1.0" };

describe("daliuren-engine/interpretation/chart-id — buildChartId", () => {
  it("cùng input → cùng chartId (deterministic)", () => {
    const first = buildChartId(BASE_INPUT, BASE_PROFILE);
    const second = buildChartId({ ...BASE_INPUT }, { ...BASE_PROFILE });
    expect(first).toBe(second);
  });

  it("có algorithm tag 'sha256:' ở đầu chuỗi", () => {
    const id = buildChartId(BASE_INPUT, BASE_PROFILE);
    expect(id.startsWith("sha256:")).toBe(true);
    // 64 hex chars sau tag — độ dài digest SHA-256 chuẩn.
    expect(id.slice("sha256:".length)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("minute=undefined và minute=0 cho CÙNG chartId (chuẩn hoá khớp calendar/input.ts `input.minute ?? 0`)", () => {
    const withUndefinedMinute = buildChartId({ date: "2024-01-01", hour: 10, timeZone: "Asia/Shanghai" }, BASE_PROFILE);
    const withZeroMinute = buildChartId({ date: "2024-01-01", hour: 10, minute: 0, timeZone: "Asia/Shanghai" }, BASE_PROFILE);
    expect(withUndefinedMinute).toBe(withZeroMinute);
  });

  it("thay đổi date/hour/minute/timeZone/profileId/version → chartId ĐỔI", () => {
    const base = buildChartId(BASE_INPUT, BASE_PROFILE);
    expect(buildChartId({ ...BASE_INPUT, date: "2024-01-02" }, BASE_PROFILE)).not.toBe(base);
    expect(buildChartId({ ...BASE_INPUT, hour: 11 }, BASE_PROFILE)).not.toBe(base);
    expect(buildChartId({ ...BASE_INPUT, minute: 31 }, BASE_PROFILE)).not.toBe(base);
    expect(buildChartId({ ...BASE_INPUT, timeZone: "Asia/Tokyo" }, BASE_PROFILE)).not.toBe(base);
    expect(buildChartId(BASE_INPUT, { ...BASE_PROFILE, profileId: "classical-v2" })).not.toBe(base);
    expect(buildChartId(BASE_INPUT, { ...BASE_PROFILE, version: "0.2.0" })).not.toBe(base);
  });

  it("KHÔNG có tham số calculatedAt/gender/birthDate — đổi các giá trị đó (giả lập bằng cách gọi lại với input/profile hệt nhau) không ảnh hưởng chartId, vì hàm không nhận các field này", () => {
    // buildChartId() không có tham số cho calculatedAt/gender/birthDate theo thiết kế — gọi lại
    // với CÙNG input/profile PHẢI luôn ra cùng id, bất kể "thời điểm chạy" khác nhau thực tế.
    const first = buildChartId(BASE_INPUT, BASE_PROFILE);
    const second = buildChartId(BASE_INPUT, BASE_PROFILE);
    expect(first).toBe(second);
  });

  it("thứ tự canonical CỐ ĐỊNH — không phụ thuộc thứ tự khai báo property của object input/profile", () => {
    const reorderedInput = { timeZone: "Asia/Shanghai", minute: 30, hour: 10, date: "2024-01-01" };
    const reorderedProfile = { version: "0.1.0", profileId: "classical-v1" };
    expect(buildChartId(reorderedInput, reorderedProfile)).toBe(buildChartId(BASE_INPUT, BASE_PROFILE));
  });
});
