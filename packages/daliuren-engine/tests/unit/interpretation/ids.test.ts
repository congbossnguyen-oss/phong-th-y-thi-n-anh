import { describe, expect, it } from "vitest";
import { buildConflictId, buildSignalId } from "../../../src/interpretation/ids.js";

describe("daliuren-engine/interpretation/ids (deterministic output)", () => {
  it("buildSignalId: cùng input luôn ra cùng output", () => {
    const a = buildSignalId("chart-1", "R-001", 0);
    const b = buildSignalId("chart-1", "R-001", 0);
    expect(a).toBe(b);
    expect(a).toBe("chart-1-R-001-0");
  });

  it("buildSignalId: input khác nhau (dù chỉ index) phải ra ID khác nhau", () => {
    expect(buildSignalId("chart-1", "R-001", 0)).not.toBe(buildSignalId("chart-1", "R-001", 1));
  });

  it("buildConflictId: không phụ thuộc thứ tự truyền signalA/signalB", () => {
    expect(buildConflictId("s1", "s2")).toBe(buildConflictId("s2", "s1"));
  });
});
