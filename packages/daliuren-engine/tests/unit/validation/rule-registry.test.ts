import { describe, expect, it } from "vitest";
import { validateRuleRegistry, questionTypeAllowsRules } from "../../../src/validation/rule-registry.js";
import { DaLiuRenValidationError } from "../../../src/validation/errors.js";
import { SYNTHETIC_PROVENANCE, SYNTHETIC_RULES } from "../fixtures.js";
import type { RuleDefinition } from "../../../src/interpretation/rule.js";

describe("daliuren-engine/validation/rule-registry", () => {
  it("registry hợp lệ (fixture) không ném lỗi", () => {
    expect(() => validateRuleRegistry(SYNTHETIC_RULES, SYNTHETIC_PROVENANCE)).not.toThrow();
  });

  it("phát hiện ruleId trùng lặp", () => {
    const duplicated: RuleDefinition[] = [...SYNTHETIC_RULES, SYNTHETIC_RULES[0]!];
    expect(() => validateRuleRegistry(duplicated, SYNTHETIC_PROVENANCE)).toThrow(DaLiuRenValidationError);
  });

  it("phát hiện rule trỏ tới provenanceId không tồn tại", () => {
    const broken: RuleDefinition[] = [{ ...SYNTHETIC_RULES[0]!, provenanceId: "KHONG-TON-TAI" }];
    expect(() => validateRuleRegistry(broken, SYNTHETIC_PROVENANCE)).toThrow(/provenanceId/);
  });

  it("CHẶN đăng ký rule cho question_type UNVERIFIED (vd 'su-nghiep') — không được tạo placeholder rule giả", () => {
    expect(questionTypeAllowsRules("su-nghiep")).toBe(false);
    expect(questionTypeAllowsRules("tinh-cam")).toBe(false);

    const badRule: RuleDefinition = {
      ...SYNTHETIC_RULES[1]!,
      ruleId: "R-SUNGHIEP-GIA-DINH",
      questionTypes: ["su-nghiep"],
    };
    expect(() => validateRuleRegistry([badRule], SYNTHETIC_PROVENANCE)).toThrow(/QUESTION_TYPE_NOT_ALLOWED|su-nghiep/);
  });

  it("CHO PHÉP rule cho question_type PARTIAL (vd 'kien-tung') — chỉ chặn UNVERIFIED/DO_NOT_IMPLEMENT", () => {
    expect(questionTypeAllowsRules("kien-tung")).toBe(true);
    expect(questionTypeAllowsRules("quan-chuc")).toBe(true);
  });

  describe("Level 2 — dependency capability gating (Phase 10.4 Section 4 / Phase 10.6.1)", () => {
    it("TỪ CHỐI rule có dependencies.unimplementedComponents khác rỗng — dù questionType hợp lệ (PARTIAL)", () => {
      const blocked: RuleDefinition = {
        ...SYNTHETIC_RULES[0]!,
        ruleId: "R-CAN-12-TRUONG-SINH",
        questionTypes: ["kien-tung"], // PARTIAL — pass Level 1, nhưng PHẢI vẫn bị chặn ở Level 2
        dependencies: { calculationFields: ["fourLessons"], unimplementedComponents: ["shiErChangSheng"] },
      };
      expect(() => validateRuleRegistry([blocked], SYNTHETIC_PROVENANCE)).toThrow(/RULE_DEPENDENCY_UNAVAILABLE|shiErChangSheng/);
    });

    it("TỪ CHỐI rule có dependencies.externalContext khác rỗng", () => {
      const blocked: RuleDefinition = {
        ...SYNTHETIC_RULES[0]!,
        ruleId: "R-CAN-GENDER",
        dependencies: { calculationFields: ["twelveGenerals"], externalContext: ["gender"] },
      };
      expect(() => validateRuleRegistry([blocked], SYNTHETIC_PROVENANCE)).toThrow(/RULE_DEPENDENCY_UNAVAILABLE|gender/);
    });

    it("CHO PHÉP rule có dependencies chỉ gồm calculationFields (unimplementedComponents/externalContext rỗng hoặc vắng mặt)", () => {
      const ok: RuleDefinition = {
        ...SYNTHETIC_RULES[0]!,
        ruleId: "R-CAN-OK",
        dependencies: { calculationFields: ["fourLessons", "calendar.dayPillar"], unimplementedComponents: [], externalContext: [] },
      };
      expect(() => validateRuleRegistry([ok], SYNTHETIC_PROVENANCE)).not.toThrow();
    });

    it("validateRuleRegistry KHÔNG trả về giá trị nào (void) khi ném lỗi — không có 'danh sách rejected rules' nào được trả ra để dùng lại sau (không có kênh nào khác ngoài throw ngay tại build/test time)", () => {
      const blocked: RuleDefinition = {
        ...SYNTHETIC_RULES[1]!,
        ruleId: "R-THICU-LIANMUGUIREN",
        questionTypes: ["thi-cu"],
        dependencies: { calculationFields: ["twelveGenerals"], unimplementedComponents: ["lianMuGuiRen"] },
      };
      expect(() => validateRuleRegistry([blocked], SYNTHETIC_PROVENANCE)).toThrow(DaLiuRenValidationError);
    });
  });
});
