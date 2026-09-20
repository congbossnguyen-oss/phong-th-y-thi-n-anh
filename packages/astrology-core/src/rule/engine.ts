/**
 * Generic RuleEngine evaluator (Layer 8) — Phase 6, Batch 1.
 * Zero embedded astrological knowledge: đánh giá một `ConditionExpr` tree trên `Factor[]` và không
 * gì khác (Model A, ADR-005). KHÔNG gọi Chart/Astronomical/ephemeris. HÀM THUẦN, deterministic.
 *
 * Giả định: `ruleset` ĐÃ được `validateRuleSet`/`loadRuleSet` xác thực (acyclic, prerequisites tồn
 * tại, không có `factorThreshold`, operator hợp lệ). Evaluator vẫn phòng vệ (throw) với các trạng
 * thái "không thể xảy ra" để không im lặng cho kết quả sai.
 *
 * Semantics đã chọn & test (nhất quán hợp đồng FROZEN, deterministic):
 *  - FactorPresent(pattern): TRUE nếu tồn tại Factor có id === pattern (KHỚP CHÍNH XÁC id ở V1 —
 *    KHÔNG glob/regex, tránh bề mặt scripting/ReDoS; "pattern" hiểu là FactorId chính xác ở V1).
 *    KHÔNG dùng Factor.strength để quyết định present (mọi strength=0 ở v1 vẫn present).
 *  - And: TRUE nếu MỌI con TRUE. Or: TRUE nếu CÓ ÍT NHẤT một con TRUE. Not: đảo boolean con.
 *  - KHÔNG short-circuit khi thu thập trace: duyệt toàn bộ cây theo PRE-ORDER (args theo thứ tự
 *    mảng), `factorIdsUsed` = danh sách id mà một node factorPresent KHỚP (present), dedup giữ lần
 *    xuất hiện đầu. Độc lập thứ tự chèn/Set-iteration.
 *  - Prerequisites: rule chỉ fired khi conditions TRUE VÀ mọi prerequisite đã fired. Nếu có
 *    prerequisite chưa fired ⇒ fired=false, strength=0, factorIdsUsed=[] (không đánh giá conditions).
 *  - Output: một RuleEvaluation cho mỗi rule, SẮP XẾP theo ruleId tăng dần (deterministic).
 */

import type { Factor, FactorId } from "../factor/types.js";
import type { ConditionExpr, Rule, RuleEngine, RuleEvaluation, RuleSet } from "./types.js";

interface ExprResult {
  value: boolean;
  used: FactorId[];
}

function evaluateExpr(expr: ConditionExpr, presentIds: ReadonlySet<FactorId>): ExprResult {
  switch (expr.op) {
    case "factorPresent": {
      const present = presentIds.has(expr.pattern);
      return { value: present, used: present ? [expr.pattern] : [] };
    }
    case "and": {
      let value = true;
      const used: FactorId[] = [];
      for (const child of expr.args) {
        const r = evaluateExpr(child, presentIds);
        if (!r.value) value = false;
        used.push(...r.used);
      }
      return { value, used };
    }
    case "or": {
      let value = false;
      const used: FactorId[] = [];
      for (const child of expr.args) {
        const r = evaluateExpr(child, presentIds);
        if (r.value) value = true;
        used.push(...r.used);
      }
      return { value, used };
    }
    case "not": {
      const r = evaluateExpr(expr.arg, presentIds);
      return { value: !r.value, used: r.used };
    }
    case "factorThreshold":
      // RESERVED, không dùng ở V1 — RuleSet hợp lệ (đã validate) KHÔNG chứa node này. Phòng vệ.
      throw new Error("evaluateExpr: 'factorThreshold' không được hỗ trợ trong Rule Engine V1 (đáng lẽ đã bị validator từ chối).");
    default: {
      const _exhaustive: never = expr;
      throw new Error(`evaluateExpr: operator không hợp lệ: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

function dedupePreserveOrder(ids: readonly FactorId[]): FactorId[] {
  const seen = new Set<FactorId>();
  const out: FactorId[] = [];
  for (const id of ids) {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

/**
 * Đánh giá toàn bộ RuleSet trên Factor[]. Deterministic: cùng Factor[] + cùng RuleSet ⇒ cùng
 * RuleEvaluation[] (bằng nhau và cùng thứ tự).
 */
export function evaluateRules(factors: readonly Factor[], ruleset: RuleSet): RuleEvaluation[] {
  const presentIds: ReadonlySet<FactorId> = new Set(factors.map((f) => f.id));
  const rulesById = new Map<string, Rule>();
  for (const rule of ruleset.rules) {
    rulesById.set(rule.id, rule);
  }

  const memo = new Map<string, RuleEvaluation>();
  const inProgress = new Set<string>(); // phòng vệ cycle (đáng lẽ validator đã chặn).

  function evaluateRule(id: string): RuleEvaluation {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    if (inProgress.has(id)) {
      throw new Error(`evaluateRules: phát hiện chu trình prerequisite tại rule "${id}" (đáng lẽ đã bị validator từ chối).`);
    }
    const rule = rulesById.get(id);
    if (rule === undefined) {
      throw new Error(`evaluateRules: prerequisite "${id}" không tồn tại trong RuleSet (đáng lẽ đã bị validator từ chối).`);
    }
    inProgress.add(id);

    const prerequisitesFired = rule.prerequisites.every((pid) => evaluateRule(pid).fired);

    let result: RuleEvaluation;
    if (!prerequisitesFired) {
      result = { ruleId: id, fired: false, strength: 0, factorIdsUsed: [] };
    } else {
      const { value, used } = evaluateExpr(rule.conditions, presentIds);
      result = {
        ruleId: id,
        fired: value,
        strength: value ? 1 : 0,
        factorIdsUsed: dedupePreserveOrder(used),
      };
    }

    inProgress.delete(id);
    memo.set(id, result);
    return result;
  }

  for (const rule of ruleset.rules) {
    evaluateRule(rule.id);
  }

  return [...memo.values()].sort((a, b) => (a.ruleId < b.ruleId ? -1 : a.ruleId > b.ruleId ? 1 : 0));
}

/** Engine dùng chung (Model A) — một instance cho mọi trường phái; chỉ khác nhau ở dữ liệu RuleSet. */
export const ruleEngine: RuleEngine = {
  evaluate: evaluateRules,
};
