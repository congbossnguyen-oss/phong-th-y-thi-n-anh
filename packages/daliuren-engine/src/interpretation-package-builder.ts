/**
 * InterpretationPackage builder — Phase 10.6.5. Nối đúng kiến trúc đã freeze xuyên suốt
 * Phase 10.2-10.6.4B:
 *
 *   Calculation Result → Rule Registry → Eligibility (Level 1 + Level 2, đã baked vào
 *   ValidatedRuleRegistry) → Evaluator (runEvaluator) → Signals → InterpretationPackage
 *
 * `conflicts` LUÔN `[]` — Phase 10.6.4B, Option A ("NO GENERIC CONFLICT DETECTION IN MVP") đã
 * chốt: không có predicate xung đột signal nào được bằng chứng dự án ủng hộ đủ mạnh (Phase
 * 10.6.4/10.6.4A — TD-4 đã bác bỏ "polarity trái dấu"; quy tắc Auxiliary-vs-Core duy nhất tìm
 * được không áp dụng được cho registry hiện có và tự nó chưa vận hành được). `[]` là giá trị
 * TRUNG THỰC với bằng chứng hiện có — KHÔNG PHẢI placeholder tạm sẽ "sửa sau", và KHÔNG được
 * coi là thiếu sót của builder này.
 *
 * `unresolved_items` LUÔN `[]` ở v1 — Phase 10.5 Audit #3 (Option B đã chọn): "chưa có rule
 * đăng ký cho question_type này" là sự thật về TIẾN ĐỘ SẢN PHẨM, không phải phát hiện DOMAIN
 * cho riêng lá số này — `verified_rules` rỗng đã tự nói lên điều đó, không cần thêm mục giả.
 */
import type { EngineMeta } from "@thien-anh/engine-contract";
import type { DaLiuRenCalculationResult } from "./da-liu-ren-calculation-result.js";
import type { QuestionType } from "./interpretation/question-type.js";
import type { Signal } from "./interpretation/signal.js";
import type { InterpretationPackage } from "./interpretation/interpretation-package.js";
import type { ProvenanceEntry } from "./interpretation/provenance.js";
import { worstConfidence, type Confidence } from "./interpretation/confidence.js";
import { buildChartId, type ChartIdentityInput, type ChartIdentityProfile } from "./interpretation/chart-id.js";
import { selectEligibleRules, type ValidatedRuleRegistry } from "./validation/rule-registry.js";
import { runEvaluator, type ValidatedEvaluatorRegistry } from "./validation/evaluator-registry.js";
import { validateInterpretationPackage } from "./validation/interpretation-package.js";
import { PRODUCTION_RULE_REGISTRY, PRODUCTION_EVALUATOR_REGISTRY, PRODUCTION_RULE_PROVENANCE, PRODUCTION_CALCULATION_PROVENANCE } from "./rules/registry.js";

/**
 * Danh sách TƯỜNG MINH AI (Tầng 3) KHÔNG được tự suy ra thêm — khớp bucket DO_NOT_IMPLEMENT đã
 * chốt xuyên suốt dự án (應期/ứng kỳ, 六親/lục thân, MỌI hình thức chấm điểm/scoring — xem
 * docs/daliuren/DA_LIU_REN_INTERPRETATION_GAPS.md mục "DO NOT IMPLEMENT"). Không phải liệt kê
 * đầy đủ mọi gap (những gap khác đã được `dependencies.unimplementedComponents` chặn từ Level 2,
 * không cần lặp lại ở đây) — chỉ liệt kê những suy luận cấm mà AI Spec đặc biệt nhấn mạnh.
 */
const FORBIDDEN_INFERENCES: readonly string[] = ["ung-ky", "luc-than", "scoring"];

export interface BuildInterpretationPackageInput {
  readonly calculation: DaLiuRenCalculationResult;
  readonly chartIdentity: ChartIdentityInput;
  readonly profile: ChartIdentityProfile;
  readonly engineMeta: EngineMeta;
  readonly questionType: QuestionType;
  /**
   * Phase 11-F (Gender=Option A) — optional, truyền xuống evaluator qua `runEvaluator`
   * (KHÔNG ảnh hưởng `chartId`, giữ đúng thiết kế cũ: gender KHÔNG nằm trong 8 field freeze).
   * KHÔNG viết rule nghiệp vụ đọc field này ở package hiện tại — chỉ mở đường truyền kiến trúc.
   */
  readonly gender?: "male" | "female";
  /** Mặc định PRODUCTION_RULE_REGISTRY — truyền riêng khi test với fixture khác. */
  readonly ruleRegistry?: ValidatedRuleRegistry;
  /** Mặc định PRODUCTION_EVALUATOR_REGISTRY. */
  readonly evaluatorRegistry?: ValidatedEvaluatorRegistry;
  /** Mặc định union PRODUCTION_RULE_PROVENANCE + PRODUCTION_CALCULATION_PROVENANCE. */
  readonly provenanceById?: Readonly<Record<string, ProvenanceEntry>>;
}

/**
 * Dựng 1 `InterpretationPackage` hoàn chỉnh cho 1 (calculation, questionType) — THUẦN, TẤT
 * ĐỊNH: không Date.now()/Math.random(), không sửa `calculation` hay bất kỳ registry nào đầu
 * vào. Ném lỗi tường minh (không silent) nếu thiếu ProvenanceEntry cho id nào đó được signal
 * tham chiếu, hoặc nếu package dựng ra không qua được `validateInterpretationPackage` — không
 * để 1 package sai lọt ra ngoài.
 *
 * KHÔNG gọi `calculateDaLiuRenChart` ở đây — caller PHẢI tự tính + kiểm tra `EngineResult.ok`
 * trước, chỉ truyền `DaLiuRenCalculationResult` đã unwrap (đúng convention mọi hàm khác trong
 * package này, xem `runEvaluator`/`resolveDayOrHourPillarProvenance`) — nếu calculation thất
 * bại, Interpretation KHÔNG chạy (Phase 10.6.1 §13, không đổi ở đây).
 */
export function buildInterpretationPackage(input: BuildInterpretationPackageInput): InterpretationPackage {
  const ruleRegistry = input.ruleRegistry ?? PRODUCTION_RULE_REGISTRY;
  const evaluatorRegistry = input.evaluatorRegistry ?? PRODUCTION_EVALUATOR_REGISTRY;
  const provenanceById = input.provenanceById ?? { ...PRODUCTION_RULE_PROVENANCE, ...PRODUCTION_CALCULATION_PROVENANCE };

  const chartId = buildChartId(input.chartIdentity, input.profile);
  const eligibleRules = selectEligibleRules(ruleRegistry, input.questionType);

  const verified_rules: Array<{ ruleId: string; triggered: boolean }> = [];
  const signals: Signal[] = [];

  const evaluationContext = input.gender !== undefined ? { gender: input.gender } : undefined;
  for (const rule of eligibleRules) {
    const result = runEvaluator(evaluatorRegistry, rule, input.calculation, evaluationContext);
    verified_rules.push({ ruleId: rule.ruleId, triggered: result.status === "triggered" });
    signals.push(...result.signals);
  }

  const referencedProvenanceIds = new Set<string>();
  for (const signal of signals) {
    referencedProvenanceIds.add(signal.provenanceId);
    for (const calculationProvenanceId of signal.calculationProvenanceIds ?? []) {
      referencedProvenanceIds.add(calculationProvenanceId);
    }
  }
  const provenance: Record<string, ProvenanceEntry> = {};
  for (const id of referencedProvenanceIds) {
    const entry = provenanceById[id];
    if (!entry) {
      throw new Error(
        `buildInterpretationPackage: thiếu ProvenanceEntry cho id "${id}" — signal tham chiếu id này nhưng provenanceById không có (kiểm tra lại PRODUCTION_RULE_PROVENANCE/PRODUCTION_CALCULATION_PROVENANCE hoặc provenanceById truyền vào).`,
      );
    }
    provenance[id] = entry;
  }

  const triggeredSignals = signals.filter((signal) => signal.triggered);
  let overallLowestConfidence: Confidence | null = null;
  if (triggeredSignals.length > 0) {
    overallLowestConfidence = triggeredSignals[0]!.ruleConfidence;
    for (const signal of triggeredSignals) {
      overallLowestConfidence = worstConfidence(overallLowestConfidence, signal.ruleConfidence);
      overallLowestConfidence = worstConfidence(overallLowestConfidence, signal.calculationConfidence);
    }
  }

  const interpretationPackage: InterpretationPackage = {
    chart_reference: {
      chartId,
      engineVersion: input.engineMeta.engineVersion,
      coreCalendarVersion: input.engineMeta.coreCalendarVersion,
      calculatedAt: input.engineMeta.calculatedAt,
    },
    question_type: input.questionType,
    verified_rules,
    signals,
    conflicts: [],
    unresolved_items: [],
    provenance,
    confidence_summary: { overallLowestConfidence },
    forbidden_inferences: FORBIDDEN_INFERENCES,
  };

  validateInterpretationPackage(interpretationPackage);
  return interpretationPackage;
}
