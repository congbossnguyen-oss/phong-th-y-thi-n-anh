/**
 * RuleSet schema validation + load guard (Layer 8) — Phase 6, Batch 2.
 * `SECURITY_MODEL.md` §3: RuleSet là CONTENT (untrusted-until-validated), phải schema-validate
 * TRƯỚC khi load/evaluate, reject-on-violation (không load một phần). Tập toán tử ConditionExpr là
 * ĐÓNG — bất kỳ op lạ / node sai hình dạng / field thừa đều bị từ chối. Validator này là kiểm tra
 * CẤU TRÚC thuần (không dependency, không eval, không Function) trên `unknown` JSON đã parse.
 *
 * Quy ước lỗi theo Phase 1+ (`chart/validation.ts`): trả `RuleSetError[]` (rỗng nếu hợp lệ), KHÔNG
 * throw. `loadRuleSet` là guard: validate rồi mới trả về RuleSet đã định kiểu.
 */

import type { AstrologyCoreError } from "../errors.js";
import type { RuleSet, RuleSourceType } from "./types.js";

export type RuleSetErrorCode =
  | "INVALID_RULESET_SHAPE"
  | "EMPTY_RULESET_SCHOOL"
  | "EMPTY_RULESET_VERSION"
  | "INVALID_RULES_ARRAY"
  | "UNKNOWN_FIELD"
  | "DUPLICATE_RULE_ID"
  | "INVALID_RULE_SHAPE"
  | "EMPTY_RULE_ID"
  | "EMPTY_RULE_SCHOOL"
  | "RULE_SCHOOL_MISMATCH"
  | "EMPTY_RULE_VERSION"
  | "EMPTY_RULE_RULESET_VERSION"
  | "RULESET_VERSION_MISMATCH"
  | "INVALID_PREREQUISITES"
  | "MISSING_PREREQUISITE"
  | "PREREQUISITE_CYCLE"
  | "INVALID_CONDITION_SHAPE"
  | "UNKNOWN_OPERATOR"
  | "FACTOR_THRESHOLD_UNSUPPORTED_V1"
  | "INVALID_WEIGHTING"
  | "INVALID_SOURCE";

export interface RuleSetError extends Omit<AstrologyCoreError, "code"> {
  code: RuleSetErrorCode;
}

const VALID_SOURCE_TYPES: ReadonlySet<RuleSourceType> = new Set(["classical_text", "geometric_rule", "derived"]);

const RULESET_KEYS: ReadonlySet<string> = new Set(["school", "version", "rules"]);
const RULE_KEYS: ReadonlySet<string> = new Set(["id", "school", "version", "rulesetVersion", "prerequisites", "conditions", "weighting", "source"]);
const WEIGHTING_KEYS: ReadonlySet<string> = new Set(["domain", "weight"]);
const SOURCE_KEYS: ReadonlySet<string> = new Set(["sourceType", "tradition", "author", "work", "edition", "page"]);

function err(code: RuleSetErrorCode, message: string, field: string, details?: Record<string, unknown>): RuleSetError {
  return details === undefined ? { code, message, field } : { code, message, field, details };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function unknownKeyErrors(obj: Record<string, unknown>, allowed: ReadonlySet<string>, path: string): RuleSetError[] {
  const out: RuleSetError[] = [];
  for (const key of Object.keys(obj)) {
    if (!allowed.has(key)) {
      out.push(err("UNKNOWN_FIELD", `Trường không được phép: "${key}".`, `${path}.${key}`));
    }
  }
  return out;
}

/** Xác thực đệ quy một ConditionExpr node. Từ chối op lạ, node sai hình dạng, field thừa, và (V1) factorThreshold. */
function validateCondition(node: unknown, path: string): RuleSetError[] {
  if (!isObject(node)) {
    return [err("INVALID_CONDITION_SHAPE", "ConditionExpr phải là một object.", path)];
  }
  const op = node["op"];
  if (typeof op !== "string") {
    return [err("INVALID_CONDITION_SHAPE", "ConditionExpr thiếu 'op' dạng string.", `${path}.op`)];
  }
  switch (op) {
    case "factorPresent": {
      const out = unknownKeyErrors(node, new Set(["op", "pattern"]), path);
      if (!isNonEmptyString(node["pattern"])) {
        out.push(err("INVALID_CONDITION_SHAPE", "factorPresent.pattern phải là string không rỗng (FactorId chính xác ở V1).", `${path}.pattern`));
      }
      return out;
    }
    case "factorThreshold": {
      // RESERVED trong type nhưng KHÔNG dùng ở V1 — từ chối để không có rule dựa trên toán tử không được đánh giá.
      return [
        err(
          "FACTOR_THRESHOLD_UNSUPPORTED_V1",
          "factorThreshold không được sử dụng trong Rule Engine V1 (mọi Factor.strength = 0 ở western.factors.v1).",
          `${path}.op`,
        ),
      ];
    }
    case "and":
    case "or": {
      const out = unknownKeyErrors(node, new Set(["op", "args"]), path);
      const args = node["args"];
      if (!Array.isArray(args) || args.length === 0) {
        out.push(err("INVALID_CONDITION_SHAPE", `${op}.args phải là mảng không rỗng.`, `${path}.args`));
        return out;
      }
      args.forEach((child, i) => out.push(...validateCondition(child, `${path}.args[${i}]`)));
      return out;
    }
    case "not": {
      const out = unknownKeyErrors(node, new Set(["op", "arg"]), path);
      if (!("arg" in node)) {
        out.push(err("INVALID_CONDITION_SHAPE", "not.arg là bắt buộc.", `${path}.arg`));
        return out;
      }
      out.push(...validateCondition(node["arg"], `${path}.arg`));
      return out;
    }
    default:
      return [err("UNKNOWN_OPERATOR", `Toán tử ConditionExpr không hợp lệ: "${op}".`, `${path}.op`)];
  }
}

function validateWeighting(node: unknown, path: string): RuleSetError[] {
  if (!isObject(node)) return [err("INVALID_WEIGHTING", "weighting phải là object.", path)];
  const out = unknownKeyErrors(node, WEIGHTING_KEYS, path);
  if (!isNonEmptyString(node["domain"])) out.push(err("INVALID_WEIGHTING", "weighting.domain phải là string không rỗng.", `${path}.domain`));
  if (!isFiniteNumber(node["weight"])) out.push(err("INVALID_WEIGHTING", "weighting.weight phải là số hữu hạn.", `${path}.weight`));
  return out;
}

function validateSource(node: unknown, path: string): RuleSetError[] {
  if (!isObject(node)) return [err("INVALID_SOURCE", "source phải là object.", path)];
  const out = unknownKeyErrors(node, SOURCE_KEYS, path);
  if (!VALID_SOURCE_TYPES.has(node["sourceType"] as RuleSourceType)) {
    out.push(err("INVALID_SOURCE", 'source.sourceType phải là "classical_text" | "geometric_rule" | "derived".', `${path}.sourceType`));
  }
  for (const key of ["tradition", "author", "work", "edition", "page"] as const) {
    if (key in node && node[key] !== undefined && typeof node[key] !== "string") {
      out.push(err("INVALID_SOURCE", `source.${key} phải là string nếu có mặt.`, `${path}.${key}`));
    }
  }
  return out;
}

/** Xác thực toàn bộ một RuleSet (từ JSON `unknown`). Trả mảng lỗi rỗng nếu hợp lệ. */
export function validateRuleSet(candidate: unknown): RuleSetError[] {
  if (!isObject(candidate)) {
    return [err("INVALID_RULESET_SHAPE", "RuleSet phải là một object.", "$")];
  }
  const errors: RuleSetError[] = [];
  errors.push(...unknownKeyErrors(candidate, RULESET_KEYS, "$"));

  const school = candidate["school"];
  const version = candidate["version"];
  if (!isNonEmptyString(school)) errors.push(err("EMPTY_RULESET_SCHOOL", "RuleSet.school không được rỗng.", "$.school"));
  if (!isNonEmptyString(version)) errors.push(err("EMPTY_RULESET_VERSION", "RuleSet.version không được rỗng.", "$.version"));

  const rules = candidate["rules"];
  if (!Array.isArray(rules)) {
    errors.push(err("INVALID_RULES_ARRAY", "RuleSet.rules phải là mảng.", "$.rules"));
    return errors;
  }

  const idSet = new Set<string>();
  const seenIds = new Set<string>();

  rules.forEach((rawRule, i) => {
    const path = `$.rules[${i}]`;
    if (!isObject(rawRule)) {
      errors.push(err("INVALID_RULE_SHAPE", "Rule phải là object.", path));
      return;
    }
    errors.push(...unknownKeyErrors(rawRule, RULE_KEYS, path));

    const id = rawRule["id"];
    if (!isNonEmptyString(id)) {
      errors.push(err("EMPTY_RULE_ID", "Rule.id không được rỗng.", `${path}.id`));
    } else {
      if (seenIds.has(id)) errors.push(err("DUPLICATE_RULE_ID", `Rule.id trùng lặp: "${id}".`, `${path}.id`));
      seenIds.add(id);
      idSet.add(id);
    }

    if (!isNonEmptyString(rawRule["school"])) {
      errors.push(err("EMPTY_RULE_SCHOOL", "Rule.school không được rỗng.", `${path}.school`));
    } else if (isNonEmptyString(school) && rawRule["school"] !== school) {
      errors.push(err("RULE_SCHOOL_MISMATCH", `Rule.school ("${String(rawRule["school"])}") phải khớp RuleSet.school ("${school}").`, `${path}.school`));
    }

    if (!isNonEmptyString(rawRule["version"])) errors.push(err("EMPTY_RULE_VERSION", "Rule.version không được rỗng.", `${path}.version`));

    const rsv = rawRule["rulesetVersion"];
    if (!isNonEmptyString(rsv)) {
      errors.push(err("EMPTY_RULE_RULESET_VERSION", "Rule.rulesetVersion không được rỗng.", `${path}.rulesetVersion`));
    } else if (isNonEmptyString(version) && rsv !== version) {
      errors.push(err("RULESET_VERSION_MISMATCH", `Rule.rulesetVersion ("${rsv}") phải khớp RuleSet.version ("${version}").`, `${path}.rulesetVersion`));
    }

    const prereqs = rawRule["prerequisites"];
    if (!Array.isArray(prereqs) || !prereqs.every((p) => isNonEmptyString(p))) {
      errors.push(err("INVALID_PREREQUISITES", "Rule.prerequisites phải là mảng string (có thể rỗng).", `${path}.prerequisites`));
    }

    if (!("conditions" in rawRule)) {
      errors.push(err("INVALID_CONDITION_SHAPE", "Rule.conditions là bắt buộc.", `${path}.conditions`));
    } else {
      errors.push(...validateCondition(rawRule["conditions"], `${path}.conditions`));
    }

    if ("weighting" in rawRule && rawRule["weighting"] !== undefined) {
      errors.push(...validateWeighting(rawRule["weighting"], `${path}.weighting`));
    }
    if ("source" in rawRule && rawRule["source"] !== undefined) {
      errors.push(...validateSource(rawRule["source"], `${path}.source`));
    }
  });

  // Prerequisite integrity: mọi prereq phải tồn tại; không được có chu trình.
  errors.push(...validatePrerequisiteGraph(rules, idSet));

  return errors;
}

function validatePrerequisiteGraph(rules: readonly unknown[], idSet: ReadonlySet<string>): RuleSetError[] {
  const errors: RuleSetError[] = [];
  const graph = new Map<string, string[]>();

  rules.forEach((rawRule, i) => {
    if (!isObject(rawRule)) return;
    const id = rawRule["id"];
    const prereqs = rawRule["prerequisites"];
    if (!isNonEmptyString(id) || !Array.isArray(prereqs)) return;
    const deps: string[] = [];
    prereqs.forEach((p, j) => {
      if (!isNonEmptyString(p)) return;
      if (!idSet.has(p)) {
        errors.push(err("MISSING_PREREQUISITE", `Prerequisite "${p}" không tồn tại trong RuleSet.`, `$.rules[${i}].prerequisites[${j}]`));
      } else {
        deps.push(p);
      }
    });
    graph.set(id, deps);
  });

  // Phát hiện chu trình (DFS 3-màu) — deterministic theo thứ tự id đã sắp xếp.
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  for (const id of graph.keys()) color.set(id, WHITE);

  let cycleReported = false;
  function visit(id: string): boolean {
    color.set(id, GRAY);
    for (const dep of graph.get(id) ?? []) {
      const c = color.get(dep) ?? WHITE;
      if (c === GRAY) return true;
      if (c === WHITE && visit(dep)) return true;
    }
    color.set(id, BLACK);
    return false;
  }

  for (const id of [...graph.keys()].sort()) {
    if ((color.get(id) ?? WHITE) === WHITE && visit(id)) {
      errors.push(err("PREREQUISITE_CYCLE", `Phát hiện chu trình prerequisite liên quan rule "${id}".`, `$.rules`));
      cycleReported = true;
      break; // một báo cáo cycle là đủ (reject toàn bộ RuleSet).
    }
  }
  void cycleReported;

  return errors;
}

/** Load guard: validate rồi mới trả RuleSet đã định kiểu. Reject-on-violation (không load một phần). */
export function loadRuleSet(candidate: unknown): { ok: true; ruleSet: RuleSet } | { ok: false; errors: RuleSetError[] } {
  const errors = validateRuleSet(candidate);
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, ruleSet: candidate as RuleSet };
}
