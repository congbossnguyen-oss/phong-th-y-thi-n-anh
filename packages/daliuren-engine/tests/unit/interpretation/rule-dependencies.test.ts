import { describe, expect, it } from "vitest";
import { calculationTopLevelFieldOf, type RuleDependencyDeclaration } from "../../../src/interpretation/rule-dependencies.js";

describe("daliuren-engine/interpretation/rule-dependencies — calculationTopLevelFieldOf", () => {
  it("field top-level thuần (không dấu chấm) trả về nguyên trạng", () => {
    expect(calculationTopLevelFieldOf("fourLessons")).toBe("fourLessons");
    expect(calculationTopLevelFieldOf("calendar")).toBe("calendar");
  });

  it("field dạng sub-path (documentation) chỉ lấy phần TRƯỚC dấu chấm đầu tiên", () => {
    expect(calculationTopLevelFieldOf("fourLessons.lesson1")).toBe("fourLessons");
    expect(calculationTopLevelFieldOf("calendar.dayPillar")).toBe("calendar");
    expect(calculationTopLevelFieldOf("calendar.dayPillar.can")).toBe("calendar");
  });

  it("RuleDependencyDeclaration cho phép unimplementedComponents/externalContext rỗng hoặc vắng mặt (AVAILABLE-only rule)", () => {
    const available: RuleDependencyDeclaration = { calculationFields: ["fourLessons", "calendar.dayPillar"] };
    expect(available.unimplementedComponents).toBeUndefined();
    expect(available.externalContext).toBeUndefined();

    const explicit: RuleDependencyDeclaration = {
      calculationFields: ["twelveGenerals"],
      unimplementedComponents: [],
      externalContext: [],
    };
    expect(explicit.unimplementedComponents).toEqual([]);
  });
});
