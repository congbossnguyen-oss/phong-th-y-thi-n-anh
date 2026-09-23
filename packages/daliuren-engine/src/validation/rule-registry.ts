/**
 * Validator cho Rule Registry (Phase 5A mục 9-10) — CHẶN đăng ký rule cho question_type chưa
 * đủ căn cứ ("KHÔNG được tạo placeholder rule giả" cho nhóm UNVERIFIED/DO_NOT_IMPLEMENT).
 * Đây là "linter" đúng tinh thần docs/daliuren/DA_LIU_REN_INTERPRETATION_PACKAGE.md mục 3.
 *
 * Level 2 gating (Phase 10.4 Section 4 / Phase 10.5 Audit #2, Option A): 1 rule có
 * `dependencies.unimplementedComponents` khác rỗng, hoặc `.externalContext` chứa bất kỳ giá trị
 * nào KHÁC "gender", bị TỪ CHỐI Ở ĐÂY, tại build/test time — KHÔNG có runtime fallback, KHÔNG
 * tồn tại ở BẤT KỲ đâu tại runtime (kể cả `unresolved_items` của `InterpretationPackage`) một
 * khi đã bị từ chối. NGOẠI LỆ DUY NHẤT (Phase 11-F, Gender=Option A): `externalContext: ["gender"]`
 * được phép đăng ký — mọi externalContext khác (vd "birthDateBeyondCalendar") vẫn bị chặn tuyệt
 * đối, KHÔNG mở rộng thêm.
 */
import type { RuleDefinition } from "../interpretation/rule.js";
import type { ProvenanceEntry } from "../interpretation/provenance.js";
import { QUESTION_TYPE_STATUS, type QuestionType } from "../interpretation/question-type.js";
import { DaLiuRenValidationError } from "./errors.js";

/** question_type có được phép gắn rule mới hay không — READY/PARTIAL: có; UNVERIFIED/DO_NOT_IMPLEMENT: không. */
export function questionTypeAllowsRules(questionType: string): boolean {
  const status = QUESTION_TYPE_STATUS[questionType as keyof typeof QUESTION_TYPE_STATUS];
  return status === "READY" || status === "PARTIAL";
}

/**
 * Kiểm tra toàn bộ Rule Registry:
 *  1. `ruleId` không trùng lặp.
 *  2. `provenanceId` của mọi rule PHẢI tồn tại trong `provenanceById`.
 *  3. Nếu rule gắn `questionTypes`, MỌI phần tử phải thuộc nhóm được phép (READY/PARTIAL).
 * Ném lỗi tường minh ngay tại rule/provenance vi phạm đầu tiên tìm thấy — không âm thầm bỏ qua.
 */
export function validateRuleRegistry(
  rules: readonly RuleDefinition[],
  provenanceById: Readonly<Record<string, ProvenanceEntry>>,
): void {
  const seenRuleIds = new Set<string>();

  for (const rule of rules) {
    if (seenRuleIds.has(rule.ruleId)) {
      throw new DaLiuRenValidationError("DUPLICATE_ID", `Trùng ruleId: "${rule.ruleId}"`);
    }
    seenRuleIds.add(rule.ruleId);

    if (!(rule.provenanceId in provenanceById)) {
      throw new DaLiuRenValidationError(
        "ORPHAN_RULE_PROVENANCE_REF",
        `Rule "${rule.ruleId}" trỏ tới provenanceId "${rule.provenanceId}" không tồn tại trong registry.`,
      );
    }

    for (const questionType of rule.questionTypes ?? []) {
      if (!questionTypeAllowsRules(questionType)) {
        throw new DaLiuRenValidationError(
          "QUESTION_TYPE_NOT_ALLOWED",
          `Rule "${rule.ruleId}" đăng ký cho question_type "${questionType}" nhưng loại này ` +
            `đang ở trạng thái ${QUESTION_TYPE_STATUS[questionType]} — KHÔNG được tạo rule (kể cả placeholder) ` +
            `cho đến khi có đủ provenance. Xem docs/daliuren/DA_LIU_REN_QUESTION_TYPES_RESEARCH.md.`,
        );
      }
    }

    // Level 2 (Phase 10.4 Section 4 / Phase 10.5 Audit #2, Option A): dependency-capability —
    // rule KHÔNG được đăng ký nếu cần bất kỳ thành phần chưa implement hoặc bối cảnh ngoài
    // Calculation Layer nào, BẤT KỂ questionType đã pass Level 1 hay không.
    if ((rule.dependencies.unimplementedComponents?.length ?? 0) > 0) {
      throw new DaLiuRenValidationError(
        "RULE_DEPENDENCY_UNAVAILABLE",
        `Rule "${rule.ruleId}" cần thành phần Calculation CHƯA implement: ` +
          `${rule.dependencies.unimplementedComponents!.join(", ")} — KHÔNG được đăng ký cho đến khi ` +
          `thành phần đó được implement (xem docs/daliuren/DA_LIU_REN_INTERPRETATION_GAPS.md).`,
      );
    }
    // Phase 11-F (Gender=Option A, Decision Memo đã duyệt): "gender" là NGOẠI LỆ DUY NHẤT của
    // Level 2 — mọi externalContext KHÁC (vd "birthDateBeyondCalendar") vẫn bị chặn TUYỆT ĐỐI.
    const disallowedExternalContext = (rule.dependencies.externalContext ?? []).filter((ctx) => ctx !== "gender");
    if (disallowedExternalContext.length > 0) {
      throw new DaLiuRenValidationError(
        "RULE_DEPENDENCY_UNAVAILABLE",
        `Rule "${rule.ruleId}" cần bối cảnh ngoài Calculation Layer CHƯA được phép: ` +
          `${disallowedExternalContext.join(", ")} — KHÔNG được đăng ký (chỉ 8 field đã freeze của ` +
          `DaLiuRenCalculationResult, cộng ngoại lệ DUY NHẤT "gender" — Phase 11-F, được coi là ` +
          `AVAILABLE; xem rule-dependencies.ts).`,
      );
    }
  }
}

/**
 * Rule Registry ĐÃ QUA `validateRuleRegistry` — Phase 10.6.2 Section 2. Type CHẶN việc gọi
 * `selectEligibleRules`/`buildEvaluatorRegistry` trên 1 mảng `RuleDefinition[]` CHƯA validate
 * (chỉ `buildRuleRegistry` mới tạo ra được giá trị kiểu này) — Level 1 + Level 2 vì vậy LUÔN
 * đúng cho MỌI rule bên trong, không cần re-check ở tầng gọi sau.
 */
export interface ValidatedRuleRegistry {
  /** Đúng thứ tự đã truyền vào `buildRuleRegistry` — KHÔNG sắp lại theo confidence/questionType/bất kỳ giá trị suy ra nào (Phase 10.6.2 Section 6). */
  readonly rules: readonly RuleDefinition[];
}

/** Validate rồi bọc thành `ValidatedRuleRegistry` — ném lỗi (qua `validateRuleRegistry`) nếu bất kỳ rule nào vi phạm, KHÔNG trả về registry "một phần hợp lệ". */
export function buildRuleRegistry(
  rules: readonly RuleDefinition[],
  provenanceById: Readonly<Record<string, ProvenanceEntry>>,
): ValidatedRuleRegistry {
  validateRuleRegistry(rules, provenanceById);
  return { rules };
}

/** Tra `RuleDefinition` theo `ruleId` trong 1 registry đã validate — `undefined` nếu không có (KHÔNG throw, để caller tự quyết định ý nghĩa "không tìm thấy"). */
export function getRuleById(registry: ValidatedRuleRegistry, ruleId: string): RuleDefinition | undefined {
  return registry.rules.find((rule) => rule.ruleId === ruleId);
}

/**
 * Rule nào trong registry ĐÃ VALIDATE đủ điều kiện chạy cho 1 `questionType` — Phase 10.6.2
 * Section 5-6: Level 1 (questionType tổng quát có được phép hay không) + "rule này CÓ áp dụng
 * cho questionType này không" (universal nếu `questionTypes` vắng mặt, hoặc khớp danh sách).
 * Level 2 KHÔNG cần re-check ở đây — MỌI rule trong `registry.rules` đã pass Level 2 tại
 * `buildRuleRegistry` (type `ValidatedRuleRegistry` đảm bảo điều này, xem comment trên).
 *
 * THUẦN, TẤT ĐỊNH: giữ NGUYÊN thứ tự `registry.rules`, KHÔNG sắp xếp lại, KHÔNG mutate registry.
 */
export function selectEligibleRules(registry: ValidatedRuleRegistry, questionType: QuestionType): readonly RuleDefinition[] {
  if (!questionTypeAllowsRules(questionType)) {
    return [];
  }
  return registry.rules.filter((rule) => rule.questionTypes === undefined || rule.questionTypes.includes(questionType));
}
