/**
 * Fixture dùng chung cho test — SYNTHETIC, KHÔNG PHẢI dữ liệu từ 1 lá số thật (đúng cảnh báo
 * ở docs/daliuren/DA_LIU_REN_INTERPRETATION_PACKAGE.md mục 5). Khớp ví dụ minh hoạ trong tài
 * liệu đó, chỉ đủ để test shape/validator, không đại diện quy tắc đã kiểm chứng đầy đủ.
 */
import type { ProvenanceEntry } from "../../src/interpretation/provenance.js";
import type { RuleDefinition, EvaluatorRegistration } from "../../src/interpretation/rule.js";
import type { Signal } from "../../src/interpretation/signal.js";
import type { Conflict } from "../../src/interpretation/conflict.js";
import type { InterpretationPackage } from "../../src/interpretation/interpretation-package.js";

export const SYNTHETIC_PROVENANCE: Record<string, ProvenanceEntry> = {
  "R-SANCHUAN-KE-NHAT": {
    id: "R-SANCHUAN-KE-NHAT",
    ruleId: "R-SANCHUAN-KE-NHAT",
    sourceId: "liu-ren-da-quan-siku",
    sourceTitle: "六壬大全 (欽定四庫全書本)",
    sourceLocation: "卷三 軒轅肘後經",
    sourceType: "classical-fact",
    quote: "尅者為災",
    confidence: "A",
  },
  "R-HONNHAN-THIENHAU-LUCHOP": {
    id: "R-HONNHAN-THIENHAU-LUCHOP",
    ruleId: "R-HONNHAN-THIENHAU-LUCHOP",
    sourceId: "liu-ren-da-quan-bifa",
    sourceTitle: "六壬大全 毕法赋",
    sourceLocation: "pháp 40",
    sourceType: "classical-fact",
    quote: "谓干为夫支为妻...岂宜支干上乘天后六合以应私情",
    confidence: "A",
  },
  /** SYNTHETIC — đại diện 1 provenance Calculation Layer (KHÔNG PHẢI provenance của rule), chỉ để test shape `Signal.calculationProvenanceIds`. */
  "PROV-SYNTHETIC-CALC-FACT": {
    id: "PROV-SYNTHETIC-CALC-FACT",
    sourceId: "synthetic-fixture",
    sourceTitle: "SYNTHETIC — không phải provenance Calculation Layer thật",
    sourceType: "implementation-detail",
    confidence: "A",
    notes: "Chỉ dùng để test đường đi calculationProvenanceIds trong validator, không đại diện 1 field Calculation thật nào.",
  },
};

export const SYNTHETIC_RULES: RuleDefinition[] = [
  {
    ruleId: "R-SANCHUAN-KE-NHAT",
    layer: "core",
    topic: "三傳",
    description: "Sơ truyền khắc Can Ngày → Sự Thần: Tai",
    condition: "threeTransmissions.initial khắc calendar.dayPillar.can",
    provenanceId: "R-SANCHUAN-KE-NHAT",
    confidence: "A",
    dependencies: { calculationFields: ["threeTransmissions", "calendar.dayPillar"] },
  },
  {
    ruleId: "R-HONNHAN-THIENHAU-LUCHOP",
    layer: "core",
    topic: "婚姻",
    description: "Chi Ngày thừa Thiên Hậu + Lục Hợp → hôn thành",
    condition: "twelveGenerals tại vị trí dayPillar.chi là tianHou hoặc liuHe",
    provenanceId: "R-HONNHAN-THIENHAU-LUCHOP",
    confidence: "A",
    questionTypes: ["hon-nhan"],
    dependencies: { calculationFields: ["twelveGenerals", "calendar.dayPillar"] },
  },
];

export const SYNTHETIC_SIGNALS: Signal[] = [
  {
    signalId: "s1",
    ruleId: "R-SANCHUAN-KE-NHAT",
    category: "三傳",
    subject: "初傳",
    object: "日干",
    relation: "ke",
    polarity: "inauspicious",
    descriptionKey: "sanchuan.initial_ke_day",
    triggered: true,
    layer: "core",
    ruleConfidence: "A",
    calculationConfidence: "A",
    provenanceId: "R-SANCHUAN-KE-NHAT",
    calculationProvenanceIds: ["PROV-SYNTHETIC-CALC-FACT"],
  },
  {
    signalId: "s2",
    ruleId: "R-HONNHAN-THIENHAU-LUCHOP",
    category: "婚姻",
    polarity: "auspicious",
    descriptionKey: "honnhan.thienhau_luchop",
    triggered: true,
    layer: "core",
    ruleConfidence: "A",
    calculationConfidence: "A",
    provenanceId: "R-HONNHAN-THIENHAU-LUCHOP",
    appliesTo: "hon-nhan",
  },
];

/**
 * SYNTHETIC — evaluator GIẢ (mock) khớp 1-1 với SYNTHETIC_RULES, chỉ để chứng minh hạ tầng
 * Rule Registry/Evaluator Registry hoạt động đúng (Phase 10.6.2) — KHÔNG PHẢI logic domain
 * thật, luôn trả `status: "not-triggered"`, KHÔNG đọc/diễn giải field Calculation nào.
 */
export const SYNTHETIC_EVALUATOR_REGISTRATIONS: EvaluatorRegistration[] = [
  {
    ruleId: "R-SANCHUAN-KE-NHAT",
    evaluate: () => ({
      ruleId: "R-SANCHUAN-KE-NHAT",
      status: "not-triggered",
      inputs: {},
      signals: [],
      provenanceId: "R-SANCHUAN-KE-NHAT",
      ruleConfidence: "A",
      calculationConfidence: "A",
    }),
  },
  {
    ruleId: "R-HONNHAN-THIENHAU-LUCHOP",
    evaluate: () => ({
      ruleId: "R-HONNHAN-THIENHAU-LUCHOP",
      status: "not-triggered",
      inputs: {},
      signals: [],
      provenanceId: "R-HONNHAN-THIENHAU-LUCHOP",
      ruleConfidence: "A",
      calculationConfidence: "A",
    }),
  },
];

export const SYNTHETIC_CONFLICTS: Conflict[] = [
  {
    conflictId: "c1",
    signalA: "s1",
    signalB: "s2",
    reason: "Core signal tổng quát (tai) mâu thuẫn Core signal riêng cho hôn nhân (hôn thành)",
    resolutionStatus: "UNRESOLVED",
  },
];

export function buildSyntheticPackage(): InterpretationPackage {
  return {
    chart_reference: {
      chartId: "synthetic-001",
      engineVersion: "0.0.0-not-implemented",
      coreCalendarVersion: "0.0.0",
      calculatedAt: "2026-01-01T00:00:00Z",
    },
    question_type: "hon-nhan",
    verified_rules: SYNTHETIC_RULES.map((r) => ({ ruleId: r.ruleId, triggered: true })),
    signals: SYNTHETIC_SIGNALS,
    conflicts: SYNTHETIC_CONFLICTS,
    unresolved_items: [{ topic: "應期", reason: "FEATURE_NOT_IMPLEMENTED" }],
    provenance: SYNTHETIC_PROVENANCE,
    confidence_summary: { overallLowestConfidence: "A" },
    forbidden_inferences: ["ung-ky", "luc-than", "scoring"],
  };
}
