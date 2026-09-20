/**
 * Layer 8 — Rule Engine (shared contract types). Phase 6, Batch 0.
 * Đúng `docs/astrology-module/ARCHITECTURE/RULE_ENGINE_SPEC.md` + `ADR/ADR-005-Rule-Engine-Architecture.md`
 * + `SECURITY_MODEL.md` §3 + `ADR/ADR-008-Versioning-Strategy.md`, và hợp đồng Phase 6 đã FREEZE
 * (D1–D6).
 *
 * Model A: MỘT generic RuleEngine (zero embedded astrological knowledge) + RuleSet data theo từng
 * trường phái. Toàn bộ kiến thức chiêm tinh nằm trong DỮ LIỆU `RuleSet`, KHÔNG nằm trong engine.
 *
 * KHÔNG hard-code semantics chiêm tinh Tây/Vệ Đà vào các type generic dưới đây. Trường camelCase
 * theo đúng quy ước toàn package (khác pseudocode snake_case trong spec).
 *
 * Phase 6 Batch 0–2 = types + evaluator + validation. KHÔNG có rule content (Batch 3), KHÔNG
 * Evidence (Phase 7), KHÔNG Scoring, KHÔNG Interpretation, KHÔNG Vedic RuleSet.
 */

import type { SchoolId } from "../chart/types.js";
import type { Factor, FactorId } from "../factor/types.js";

/** Định danh rule ổn định — vd. "WESTERN.PLACEMENT.001". */
export type RuleId = string;

/**
 * Toán tử so sánh cho `factorThreshold` — RESERVED trong schema/type (D3/hợp đồng), NHƯNG evaluator
 * V1 KHÔNG dùng `factorThreshold` (mọi Factor.strength = 0 ở `western.factors.v1`). RuleSet V1 dùng
 * `factorThreshold` sẽ bị validator TỪ CHỐI (xem `validate.ts`).
 */
export type ConditionComparator = ">=" | ">" | "<=" | "<" | "==" | "!=";

/**
 * D1 (FROZEN): ConditionExpr là JSON tagged-node tree, discriminated union theo `op`. Tập toán tử
 * ĐÓNG (closed operator set) — KHÔNG scripting, KHÔNG eval, KHÔNG callback, KHÔNG open shape.
 * V1 evaluation dùng: factorPresent / and / or / not. `factorThreshold` chỉ RESERVED (không đánh giá).
 */
export type ConditionExpr =
  | { readonly op: "factorPresent"; readonly pattern: FactorId }
  | {
      // RESERVED — không dùng trong V1 evaluation; RuleSet V1 chứa node này bị validator từ chối.
      readonly op: "factorThreshold";
      readonly pattern: FactorId;
      readonly comparator: ConditionComparator;
      readonly value: number;
    }
  | { readonly op: "and"; readonly args: readonly ConditionExpr[] }
  | { readonly op: "or"; readonly args: readonly ConditionExpr[] }
  | { readonly op: "not"; readonly arg: ConditionExpr };

/** D4: loại nguồn của rule. Enum ĐÓNG (đối chiếu `EVIDENCE_ENGINE_SPEC.md` `SourceRef.source_type`). */
export type RuleSourceType = "classical_text" | "geometric_rule" | "derived";

/** D4: metadata trích dẫn nguồn — các field thư mục là TUỲ CHỌN ở V1 (rule geometric không cần). */
export interface SourceRef {
  sourceType: RuleSourceType;
  tradition?: string;
  author?: string;
  work?: string;
  edition?: string;
  page?: string;
}

/** D2: metadata cho tầng Scoring (Phase 7) — engine Phase 6 KHÔNG đọc field này để tính strength. */
export interface RuleWeighting {
  domain: string;
  weight: number;
}

/** Một rule khai báo (dữ liệu, không phải code). */
export interface Rule {
  id: RuleId;
  school: SchoolId;
  /** Phiên bản riêng của rule này (semver-ish). */
  version: string;
  /** Phiên bản của RuleSet chứa rule này (ADR-008) — phải khớp `RuleSet.version`. */
  rulesetVersion: string;
  /** Các rule phải đã fired trước (dependency ordering). Rỗng nếu không có. */
  prerequisites: RuleId[];
  /** Cây điều kiện khai báo trên Factor[]. */
  conditions: ConditionExpr;
  /** D2: TUỲ CHỌN — metadata Phase-7 Scoring, KHÔNG được engine V1 dùng. */
  weighting?: RuleWeighting;
  /** D4: TUỲ CHỌN — trích dẫn nguồn (geometric rule có thể bỏ). */
  source?: SourceRef;
}

/** Bộ rule theo một trường phái (Model A: dữ liệu, engine dùng chung). */
export interface RuleSet {
  school: SchoolId;
  /** ruleset_version (ADR-008). */
  version: string;
  rules: Rule[];
}

/** Kết quả đánh giá một rule. `strength` là gương boolean của `fired` (D3), KHÔNG phải score. */
export interface RuleEvaluation {
  ruleId: RuleId;
  fired: boolean;
  /** D3 (FROZEN): fired ⇒ 1.0; not fired ⇒ 0.0. KHÔNG mang magnitude/scoring. */
  strength: number;
  /** Các FactorId thực sự khớp khi đánh giá điều kiện (deterministic pre-order, đã dedup). */
  factorIdsUsed: FactorId[];
}

/**
 * `RULE_ENGINE_SPEC.md` §Interface. MỘT engine generic dùng chung cho mọi trường phái (Model A) —
 * chỉ nhận `Factor[]` + `RuleSet`, KHÔNG gọi Chart/Astronomical/ephemeris. Deterministic.
 */
export interface RuleEngine {
  evaluate(factors: readonly Factor[], ruleset: RuleSet): RuleEvaluation[];
}
