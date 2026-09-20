import { describe, expect, it } from "vitest";

import type { NormalizedChart } from "../../chart/types.js";
import type { Factor } from "../../factor/types.js";
import type { Rule, RuleEvaluation, RuleSet, SourceRef } from "../../rule/types.js";
import { EvidenceTraceIntegrityError } from "../types.js";
import {
  EVIDENCE_ENGINE_VERSION,
  makeEvidenceId,
  recordEvidence,
  traceByInterpretation,
  traceToBirthData,
} from "../engine.js";

const CID = "calc-1";
const COND = { op: "factorPresent", pattern: "x" } as const;
const CLASSICAL: SourceRef = { sourceType: "classical_text", author: "Ptolemy", work: "Tetrabiblos" };

function rule(id: string, source?: SourceRef): Rule {
  return { id, school: "western", version: "1.0.0", rulesetVersion: "test.v1", prerequisites: [], conditions: COND, ...(source ? { source } : {}) };
}
function ruleset(rules: Rule[]): RuleSet {
  return { school: "western", version: "test.v1", rules };
}
function ev(ruleId: string, factorIdsUsed: string[] = [], fired = true): RuleEvaluation {
  return { ruleId, fired, strength: fired ? 1 : 0, factorIdsUsed };
}
function factor(id: string): Factor {
  return { id, chartId: CID, school: "western", category: "placement", inputs: [], strength: 0, computedAt: new Date(0), version: "western.factors.v1" };
}
function chart(calculationId = CID, birthDataRef = "bd-1"): NormalizedChart {
  return { metadata: { calculationId }, birthDataRef } as unknown as NormalizedChart;
}

describe("recordEvidence", () => {
  it("1. dựng Evidence với đủ trường provenance", () => {
    const e = recordEvidence(ev("R", ["f1"]), ruleset([rule("R", CLASSICAL)]), CID);
    expect(e).toEqual({ evidenceId: "calc-1:R", interpretationId: null, ruleId: "R", factorIds: ["f1"], calculationId: "calc-1", source: CLASSICAL });
  });
  it("2. interpretationId luôn null lúc record", () => {
    expect(recordEvidence(ev("R"), ruleset([rule("R")]), CID).interpretationId).toBeNull();
  });
  it("3. source sao chép từ Rule tương ứng", () => {
    expect(recordEvidence(ev("R"), ruleset([rule("R", CLASSICAL)]), CID).source).toEqual(CLASSICAL);
  });
  it("4. factorIds sao chép từ RuleEvaluation.factorIdsUsed (copy, không share ref)", () => {
    const used = ["a", "b"];
    const e = recordEvidence(ev("R", used), ruleset([rule("R")]), CID);
    expect(e.factorIds).toEqual(["a", "b"]);
    used.push("c");
    expect(e.factorIds).toEqual(["a", "b"]);
  });
  it("5. calculationId sao chép nguyên vẹn", () => {
    expect(recordEvidence(ev("R"), ruleset([rule("R")]), "calc-XYZ").calculationId).toBe("calc-XYZ");
  });
  it("6. evidenceId xác định = calculationId:ruleId (không random UUID)", () => {
    expect(recordEvidence(ev("R"), ruleset([rule("R")]), CID).evidenceId).toBe(makeEvidenceId(CID, "R"));
    expect(makeEvidenceId(CID, "R")).toBe("calc-1:R");
  });
  it("7. cùng input ⇒ cùng Evidence (deep equal)", () => {
    const rs = ruleset([rule("R", CLASSICAL)]);
    expect(recordEvidence(ev("R", ["f1"]), rs, CID)).toEqual(recordEvidence(ev("R", ["f1"]), rs, CID));
  });
  it("8. không phụ thuộc thời gian/ngẫu nhiên/env — hai lần gọi cách nhau vẫn đồng nhất", () => {
    const rs = ruleset([rule("R")]);
    const a = recordEvidence(ev("R", ["f1"]), rs, CID);
    const b = recordEvidence(ev("R", ["f1"]), rs, CID);
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).not.toMatch(/\d{13}/); // không nhúng timestamp ms.
  });
  it("16. sourceType được giữ nguyên qua Evidence", () => {
    expect(recordEvidence(ev("R"), ruleset([rule("R", { sourceType: "derived" })]), CID).source?.sourceType).toBe("derived");
  });
  it("17. geometric_rule không thư mục → source = null (không lỗi)", () => {
    expect(recordEvidence(ev("G"), ruleset([rule("G")]), CID).source).toBeNull();
  });
  it("15. Evidence KHÔNG mang dữ kiện chart thô — chỉ đúng 6 trường provenance", () => {
    const e = recordEvidence(ev("R", ["f1"]), ruleset([rule("R", CLASSICAL)]), CID);
    expect(Object.keys(e).sort()).toEqual(["calculationId", "evidenceId", "factorIds", "interpretationId", "ruleId", "source"]);
  });
});

describe("traceByInterpretation", () => {
  it("9. trả đúng các Evidence gắn interpretationId", () => {
    const evs = [
      { ...recordEvidence(ev("R1"), ruleset([rule("R1")]), CID), interpretationId: "I1" },
      { ...recordEvidence(ev("R2"), ruleset([rule("R2")]), CID), interpretationId: "I2" },
    ];
    expect(traceByInterpretation(evs, "I1").map((e) => e.ruleId)).toEqual(["R1"]);
  });
  it("10. thứ tự deterministic theo evidenceId dù input xáo trộn", () => {
    const mk = (rid: string) => ({ ...recordEvidence(ev(rid), ruleset([rule(rid)]), CID), interpretationId: "I" });
    const out = traceByInterpretation([mk("Rc"), mk("Ra"), mk("Rb")], "I");
    expect(out.map((e) => e.evidenceId)).toEqual(["calc-1:Ra", "calc-1:Rb", "calc-1:Rc"]);
  });
});

describe("traceToBirthData", () => {
  const evId = makeEvidenceId(CID, "R");
  const baseCtx = () => ({ evidences: [recordEvidence(ev("R", ["f1"]), ruleset([rule("R", CLASSICAL)]), CID)], ruleset: ruleset([rule("R", CLASSICAL)]), factors: [factor("f1")], chart: chart() });

  it("11. resolve thành công tới birthDataRef", () => {
    expect(traceToBirthData(evId, baseCtx())).toEqual({
      evidence: baseCtx().evidences[0], ruleId: "R", factorIds: ["f1"], calculationId: CID, birthDataRef: "bd-1",
    });
  });
  it("12. đứt xích Evidence→Chart (calculationId lệch) → TRACE_INTEGRITY_ERROR", () => {
    expect(() => traceToBirthData(evId, { ...baseCtx(), chart: chart("calc-OTHER") })).toThrow(EvidenceTraceIntegrityError);
  });
  it("13. thiếu Rule trong ruleset → lỗi", () => {
    expect(() => traceToBirthData(evId, { ...baseCtx(), ruleset: ruleset([]) })).toThrow(/Evidence→Rule/);
  });
  it("14. thiếu Factor → lỗi", () => {
    expect(() => traceToBirthData(evId, { ...baseCtx(), factors: [] })).toThrow(/Evidence→Factor/);
  });
  it("evidenceId không tồn tại → lỗi", () => {
    expect(() => traceToBirthData("nope", baseCtx())).toThrow(EvidenceTraceIntegrityError);
  });
  it("chart thiếu birthDataRef → lỗi", () => {
    expect(() => traceToBirthData(evId, { ...baseCtx(), chart: chart(CID, "") })).toThrow(/Chart→BirthData/);
  });
});

describe("determinism tổng thể", () => {
  it("18. record nhiều RuleEvaluation ⇒ mảng Evidence đồng nhất qua các lần chạy", () => {
    const rs = ruleset([rule("R1", CLASSICAL), rule("R2")]);
    const evals = [ev("R1", ["f1"]), ev("R2", ["f2", "f3"])];
    const run = () => evals.map((e) => recordEvidence(e, rs, CID));
    expect(run()).toEqual(run());
    expect(EVIDENCE_ENGINE_VERSION).toBe("evidence.v1");
  });
});
