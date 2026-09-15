/**
 * Validator runtime cho InterpretationPackage — bổ sung cho ràng buộc compile-time (TypeScript
 * literal type chặn `resolution_status` sai), vì dữ liệu có thể đến từ nguồn NGOÀI kiểm soát
 * type (JSON từ DB/API) — đúng lo ngại nêu ở docs/daliuren/DA_LIU_REN_AI_BOUNDARY_TESTS.md
 * test IP-1..IP-6. Đây là "linter" theo docs/daliuren/DA_LIU_REN_INTERPRETATION_PACKAGE.md mục 3.
 */
import { worstConfidence } from "../interpretation/confidence.js";
import type { InterpretationPackage } from "../interpretation/interpretation-package.js";
import { DaLiuRenValidationError } from "./errors.js";

/**
 * Chạy đủ các kiểm tra tương ứng Layer 4 (`DA_LIU_REN_AI_BOUNDARY_TESTS.md` IP-1..IP-6, mở
 * rộng cho `calculationProvenanceIds`/Model C ở Phase 10.6.1): ném lỗi tường minh ngay tại vi
 * phạm ĐẦU TIÊN tìm thấy.
 */
export function validateInterpretationPackage(pkg: InterpretationPackage): void {
  const signalIds = new Set(pkg.signals.map((s) => s.signalId));

  // IP-1: mọi signal.ruleId phải xuất hiện trong verified_rules (đã được đánh giá).
  const verifiedRuleIds = new Set(pkg.verified_rules.map((r) => r.ruleId));
  for (const signal of pkg.signals) {
    if (!verifiedRuleIds.has(signal.ruleId)) {
      throw new DaLiuRenValidationError(
        "ORPHAN_SIGNAL_RULE_REF",
        `Signal "${signal.signalId}" trỏ tới ruleId "${signal.ruleId}" không có trong verified_rules.`,
      );
    }
    // IP-2: mọi signal.provenanceId (provenance của RULE) phải tồn tại trong pkg.provenance.
    if (!(signal.provenanceId in pkg.provenance)) {
      throw new DaLiuRenValidationError(
        "ORPHAN_RULE_PROVENANCE_REF",
        `Signal "${signal.signalId}" trỏ tới provenanceId "${signal.provenanceId}" không có trong provenance map.`,
      );
    }
    // IP-2b (Model C, Phase 10.6.1): mọi id trong calculationProvenanceIds (provenance của
    // Calculation Layer, KHÁC provenanceId của rule) cũng phải tồn tại trong pkg.provenance.
    for (const calcProvenanceId of signal.calculationProvenanceIds ?? []) {
      if (!(calcProvenanceId in pkg.provenance)) {
        throw new DaLiuRenValidationError(
          "ORPHAN_CALCULATION_PROVENANCE_REF",
          `Signal "${signal.signalId}" trỏ tới calculationProvenanceIds="${calcProvenanceId}" không có trong provenance map.`,
        );
      }
    }
  }

  for (const conflict of pkg.conflicts) {
    // IP-3: signalA/signalB phải tồn tại thật.
    if (!signalIds.has(conflict.signalA) || !signalIds.has(conflict.signalB)) {
      throw new DaLiuRenValidationError(
        "ORPHAN_CONFLICT_SIGNAL_REF",
        `Conflict "${conflict.conflictId}" trỏ tới signal không tồn tại (signalA=${conflict.signalA}, signalB=${conflict.signalB}).`,
      );
    }
    // IP-4: resolutionStatus PHẢI đúng 'UNRESOLVED' — phòng dữ liệu ngoài kiểm soát type (JSON).
    if ((conflict.resolutionStatus as string) !== "UNRESOLVED") {
      throw new DaLiuRenValidationError(
        "INVALID_CONFLICT_RESOLUTION",
        `Conflict "${conflict.conflictId}" có resolutionStatus="${conflict.resolutionStatus}" — ` +
          `chỉ 'UNRESOLVED' được phép ở v1. Rule engine KHÔNG được tự resolve conflict.`,
      );
    }
  }

  // IP-5: question_type không thuộc 6 loại READY/PARTIAL đủ điều kiện thì mọi rule cho loại đó
  // phải nằm trong unresolved_items — kiểm tra ngược: nếu có signal appliesTo=question_type mà
  // không phải READY/PARTIAL thì phải bị chặn từ Rule Registry (validateRuleRegistry) trước khi
  // tới bước này; ở đây chỉ kiểm tra tính nhất quán unresolved_items không rỗng bất thường.
  // (Không lặp lại logic QUESTION_TYPE_STATUS ở đây để tránh 2 nguồn sự thật — xem rule-registry.ts.)

  // IP-6 (Model C, Phase 10.6.1): overallLowestConfidence phải đúng worst-of của CẢ
  // ruleConfidence LẪN calculationConfidence trong mọi signal ĐÃ trigger (không chỉ 1 field như
  // trước Model C) — và PHẢI là `null` khi KHÔNG có signal nào triggered (Phase 10.5 §4/Phase
  // 10.6.1 §7: "không có signal" là trạng thái riêng biệt, KHÔNG phải mặc định A).
  const triggeredSignals = pkg.signals.filter((s) => s.triggered);
  if (triggeredSignals.length === 0) {
    if (pkg.confidence_summary.overallLowestConfidence !== null) {
      throw new DaLiuRenValidationError(
        "CONFIDENCE_SUMMARY_MISMATCH",
        `confidence_summary.overallLowestConfidence="${pkg.confidence_summary.overallLowestConfidence}" ` +
          `nhưng KHÔNG có signal nào triggered — phải là null (không tồn tại giá trị để báo cáo), ` +
          `KHÔNG được mặc định về A hay bất kỳ Confidence nào khác.`,
      );
    }
  } else {
    let worst = triggeredSignals[0]!.ruleConfidence;
    for (const signal of triggeredSignals) {
      worst = worstConfidence(worst, signal.ruleConfidence);
      worst = worstConfidence(worst, signal.calculationConfidence);
    }
    if (worst !== pkg.confidence_summary.overallLowestConfidence) {
      throw new DaLiuRenValidationError(
        "CONFIDENCE_SUMMARY_MISMATCH",
        `confidence_summary.overallLowestConfidence="${String(pkg.confidence_summary.overallLowestConfidence)}" ` +
          `nhưng worst-of(ruleConfidence, calculationConfidence) thực tế trong các signal đã trigger là "${worst}".`,
      );
    }
  }
}
