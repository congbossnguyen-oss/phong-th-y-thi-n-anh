import { describe, expect, it } from "vitest";
import {
  validateRuleRegistry,
  questionTypeAllowsRules,
  buildRuleRegistry,
  getRuleById,
  selectEligibleRules,
} from "../../../src/validation/rule-registry.js";
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

  describe("buildRuleRegistry / getRuleById (Phase 10.6.2 Section 2)", () => {
    it("[A] giữ NGUYÊN thứ tự rules đã truyền vào — deterministic, không sắp lại", () => {
      const registry = buildRuleRegistry(SYNTHETIC_RULES, SYNTHETIC_PROVENANCE);
      expect(registry.rules).toEqual(SYNTHETIC_RULES);
      expect(registry.rules.map((r) => r.ruleId)).toEqual(SYNTHETIC_RULES.map((r) => r.ruleId));
    });

    it("[B] ném lỗi (không trả về registry một-phần) nếu có ruleId trùng lặp", () => {
      const duplicated: RuleDefinition[] = [...SYNTHETIC_RULES, SYNTHETIC_RULES[0]!];
      expect(() => buildRuleRegistry(duplicated, SYNTHETIC_PROVENANCE)).toThrow(DaLiuRenValidationError);
    });

    it("[C] tái sử dụng validateRuleRegistry — vẫn phát hiện provenanceId mồ côi khi build registry", () => {
      const broken: RuleDefinition[] = [{ ...SYNTHETIC_RULES[0]!, provenanceId: "KHONG-TON-TAI" }];
      expect(() => buildRuleRegistry(broken, SYNTHETIC_PROVENANCE)).toThrow(/provenanceId/);
    });

    it("getRuleById trả về đúng RuleDefinition theo ruleId, undefined nếu không có (không throw)", () => {
      const registry = buildRuleRegistry(SYNTHETIC_RULES, SYNTHETIC_PROVENANCE);
      expect(getRuleById(registry, "R-SANCHUAN-KE-NHAT")?.ruleId).toBe("R-SANCHUAN-KE-NHAT");
      expect(getRuleById(registry, "R-KHONG-TON-TAI")).toBeUndefined();
    });
  });

  describe("selectEligibleRules (Phase 10.6.2 Section 5-6)", () => {
    const registry = buildRuleRegistry(SYNTHETIC_RULES, SYNTHETIC_PROVENANCE);

    it("[D] Level 1: questionType KHÔNG được phép (UNVERIFIED) → danh sách rỗng, BẤT KỂ rule nào trong registry", () => {
      expect(selectEligibleRules(registry, "su-nghiep")).toEqual([]);
      expect(selectEligibleRules(registry, "tinh-cam")).toEqual([]);
    });

    it("rule KHÔNG khai báo questionTypes (universal/core) áp dụng cho MỌI questionType hợp lệ", () => {
      const eligibleForKienTung = selectEligibleRules(registry, "kien-tung");
      expect(eligibleForKienTung.map((r) => r.ruleId)).toContain("R-SANCHUAN-KE-NHAT");
      expect(eligibleForKienTung.map((r) => r.ruleId)).not.toContain("R-HONNHAN-THIENHAU-LUCHOP");
    });

    it("rule CÓ khai báo questionTypes chỉ áp dụng cho đúng questionType đó", () => {
      const eligibleForHonNhan = selectEligibleRules(registry, "hon-nhan");
      expect(eligibleForHonNhan.map((r) => r.ruleId).sort()).toEqual(["R-HONNHAN-THIENHAU-LUCHOP", "R-SANCHUAN-KE-NHAT"].sort());
    });

    it("[J] deterministic: gọi nhiều lần cùng registry/questionType cho CÙNG thứ tự kết quả, không mutate registry", () => {
      const first = selectEligibleRules(registry, "hon-nhan");
      const second = selectEligibleRules(registry, "hon-nhan");
      expect(second).toEqual(first);
      expect(registry.rules).toEqual(SYNTHETIC_RULES); // registry gốc không bị đổi thứ tự/nội dung
    });

    it("KHÔNG sắp xếp theo confidence — thứ tự kết quả LUÔN khớp thứ tự trong registry.rules (filter, không sort)", () => {
      const eligible = selectEligibleRules(registry, "hon-nhan");
      const expectedOrder = registry.rules.filter((r) => eligible.some((e) => e.ruleId === r.ruleId)).map((r) => r.ruleId);
      expect(eligible.map((r) => r.ruleId)).toEqual(expectedOrder);
    });
  });
});
