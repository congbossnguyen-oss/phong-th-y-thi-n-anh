import { describe, expect, it } from "vitest";
import { validateInterpretationPackage } from "../../../src/validation/interpretation-package.js";
import { DaLiuRenValidationError, type DaLiuRenValidationErrorCode } from "../../../src/validation/errors.js";
import { buildSyntheticPackage } from "../fixtures.js";

/** Assert lỗi ném ra đúng loại `DaLiuRenValidationError` VÀ đúng `code` — dùng `code` ổn định thay vì so khớp chuỗi message (message có thể đổi theo bản dịch). */
function expectValidationErrorCode(fn: () => void, code: DaLiuRenValidationErrorCode): void {
  try {
    fn();
    expect.fail(`Kỳ vọng ném DaLiuRenValidationError(${code}) nhưng không có lỗi nào được ném.`);
  } catch (error) {
    expect(error).toBeInstanceOf(DaLiuRenValidationError);
    expect((error as DaLiuRenValidationError).code).toBe(code);
  }
}

describe("daliuren-engine/validation/interpretation-package", () => {
  it("package hợp lệ (fixture SYNTHETIC) không ném lỗi", () => {
    expect(() => validateInterpretationPackage(buildSyntheticPackage())).not.toThrow();
  });

  it("IP-1: phát hiện signal trỏ tới ruleId không có trong verified_rules", () => {
    const pkg = buildSyntheticPackage();
    const broken = { ...pkg, signals: [{ ...pkg.signals[0]!, ruleId: "R-KHONG-TON-TAI" }] };
    expectValidationErrorCode(() => validateInterpretationPackage(broken), "ORPHAN_SIGNAL_RULE_REF");
  });

  it("IP-2: phát hiện signal trỏ tới provenanceId không tồn tại", () => {
    const pkg = buildSyntheticPackage();
    const broken = { ...pkg, signals: [{ ...pkg.signals[0]!, provenanceId: "PROV-KHONG-TON-TAI" }] };
    expectValidationErrorCode(() => validateInterpretationPackage(broken), "ORPHAN_RULE_PROVENANCE_REF");
  });

  it("IP-3: phát hiện conflict trỏ tới signal không tồn tại", () => {
    const pkg = buildSyntheticPackage();
    const broken = { ...pkg, conflicts: [{ ...pkg.conflicts[0]!, signalB: "s-khong-ton-tai" }] };
    expectValidationErrorCode(() => validateInterpretationPackage(broken), "ORPHAN_CONFLICT_SIGNAL_REF");
  });

  it("IP-4: từ chối resolutionStatus khác 'UNRESOLVED' kể cả khi lọt qua type system (giả lập dữ liệu JSON ngoài kiểm soát)", () => {
    const pkg = buildSyntheticPackage();
    const brokenConflict = { ...pkg.conflicts[0]!, resolutionStatus: "AI_DECIDED" as "UNRESOLVED" };
    const broken = { ...pkg, conflicts: [brokenConflict] };
    expectValidationErrorCode(() => validateInterpretationPackage(broken), "INVALID_CONFLICT_RESOLUTION");
  });

  it("IP-6: phát hiện confidence_summary.overallLowestConfidence tính sai", () => {
    const pkg = buildSyntheticPackage();
    const withWeakSignal = {
      ...pkg,
      signals: [...pkg.signals, { ...pkg.signals[0]!, signalId: "s3", calculationConfidence: "D" as const }],
      // KHÔNG cập nhật confidence_summary — phải bị bắt lỗi vì thực tế thấp nhất giờ là D, không phải A.
    };
    expectValidationErrorCode(() => validateInterpretationPackage(withWeakSignal), "CONFIDENCE_SUMMARY_MISMATCH");
  });

  it("deterministic: validate cùng 1 package nhiều lần cho cùng kết quả (không ném lỗi lần nào, không có side effect)", () => {
    const pkg = buildSyntheticPackage();
    expect(() => validateInterpretationPackage(pkg)).not.toThrow();
    expect(() => validateInterpretationPackage(pkg)).not.toThrow();
    expect(() => validateInterpretationPackage(pkg)).not.toThrow();
  });

  it("IP-2b (Model C): phát hiện signal trỏ tới calculationProvenanceIds không tồn tại", () => {
    const pkg = buildSyntheticPackage();
    const broken = { ...pkg, signals: [{ ...pkg.signals[0]!, calculationProvenanceIds: ["PROV-KHONG-TON-TAI"] }] };
    expectValidationErrorCode(() => validateInterpretationPackage(broken), "ORPHAN_CALCULATION_PROVENANCE_REF");
  });

  describe("Empty-confidence semantics (Phase 10.5 §4 / Phase 10.6.1 §7): overallLowestConfidence = null khi KHÔNG có signal nào triggered", () => {
    it("package hợp lệ với 0 signal triggered + overallLowestConfidence=null → KHÔNG ném lỗi", () => {
      const pkg = buildSyntheticPackage();
      const empty = {
        ...pkg,
        signals: [],
        conflicts: [],
        confidence_summary: { overallLowestConfidence: null },
      };
      expect(() => validateInterpretationPackage(empty)).not.toThrow();
    });

    it("0 signal triggered nhưng overallLowestConfidence KHÔNG null → CONFIDENCE_SUMMARY_MISMATCH (không được mặc định về A)", () => {
      const pkg = buildSyntheticPackage();
      const wronglyDefaulted = {
        ...pkg,
        signals: [],
        conflicts: [],
        confidence_summary: { overallLowestConfidence: "A" as const },
      };
      expectValidationErrorCode(() => validateInterpretationPackage(wronglyDefaulted), "CONFIDENCE_SUMMARY_MISMATCH");
    });

    it("có signal triggered nhưng overallLowestConfidence=null → CONFIDENCE_SUMMARY_MISMATCH (null chỉ hợp lệ khi THỰC SỰ 0 signal triggered)", () => {
      const pkg = buildSyntheticPackage();
      const wronglyNulled = { ...pkg, confidence_summary: { overallLowestConfidence: null } };
      expectValidationErrorCode(() => validateInterpretationPackage(wronglyNulled), "CONFIDENCE_SUMMARY_MISMATCH");
    });

    it("IP-6 Model C: overallLowestConfidence phải là worst-of CẢ ruleConfidence LẪN calculationConfidence, không chỉ 1 field", () => {
      const pkg = buildSyntheticPackage();
      const weakCalculation = {
        ...pkg,
        signals: [{ ...pkg.signals[0]!, ruleConfidence: "A" as const, calculationConfidence: "D" as const }, pkg.signals[1]!],
        confidence_summary: { overallLowestConfidence: "A" as const }, // SAI — phải là "D" vì calculationConfidence="D"
      };
      expectValidationErrorCode(() => validateInterpretationPackage(weakCalculation), "CONFIDENCE_SUMMARY_MISMATCH");

      const corrected = { ...weakCalculation, confidence_summary: { overallLowestConfidence: "D" as const } };
      expect(() => validateInterpretationPackage(corrected)).not.toThrow();
    });

    it("signal KHÔNG triggered không ảnh hưởng overallLowestConfidence (chỉ tính signal đã trigger)", () => {
      const pkg = buildSyntheticPackage();
      const withUntriggeredWeakSignal = {
        ...pkg,
        signals: [...pkg.signals, { ...pkg.signals[0]!, signalId: "s-not-triggered", triggered: false, calculationConfidence: "D" as const }],
        // confidence_summary giữ nguyên "A" — signal D không triggered nên KHÔNG được tính.
      };
      expect(() => validateInterpretationPackage(withUntriggeredWeakSignal)).not.toThrow();
    });
  });
});
