/**
 * Phase 9 — deterministic post-generation grounding check (AI_GROUNDING_CONTRACT.md, resolved per
 * PHASE9_DECISIONS.md D1). RULE-BASED, never an LLM. Pure string ops → fully deterministic (D2).
 *
 * Given the trusted InterpretationObject[] and an untrusted generated narrative, flags any content not
 * traceable to the interpretation: invented planet/entity, invented house, invented date, invented
 * number/score, or forbidden predictive/probability/confidence/strength/recommendation semantics.
 *
 * It NEVER mutates interpretation data and NEVER rewrites the narrative — it only reports pass/fail + reasons.
 */

import type { InterpretationObject } from "../interpretation/types.js";

export type GroundingViolationCode =
  | "forbidden_semantics"
  | "invented_entity"
  | "invented_house"
  | "invented_date"
  | "invented_number";

export interface GroundingViolation {
  code: GroundingViolationCode;
  detail: string;
}

export interface GroundingResult {
  grounded: boolean;
  violations: GroundingViolation[];
}

/** Forbidden single-token words (VI + EN): prediction / probability / confidence / strength / recommendation / risk. */
const FORBIDDEN_WORDS: readonly string[] = [
  // prediction / future
  "sẽ", "sắp", "dự đoán", "tiên đoán", "will", "shall",
  // probability
  "khả năng", "xác suất", "likely", "probability", "chance", "odds", "percent",
  // confidence / certainty
  "tự tin", "chắc chắn", "chắc hẳn", "confidence", "confident", "certain",
  // strength / intensity
  "mạnh", "yếu", "strength", "strong", "weak", "intensity",
  // recommendation / advice
  "nên", "khuyên", "gợi ý", "recommend", "suggest", "should", "advice", "advise",
  // valence / risk (deterministic layer forbids these too)
  "tốt", "xấu", "nguy cơ", "rủi ro", "risk", "danger",
];

/** Multi-word forbidden phrases (substring, lowercased). */
const FORBIDDEN_PHRASES: readonly string[] = [
  "khuyến nghị", "đề nghị", "may mắn", "có lẽ", "going to",
];

/** Planet / sensitive-point names (VI + EN). Interpretations carry none, so any survivor is invented. */
const PLANET_WORDS: readonly string[] = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
  "rahu", "ketu", "ascendant", "lagna", "asc",
];
const PLANET_PHRASES: readonly string[] = [
  "mặt trời", "mặt trăng", "sao thủy", "sao kim", "sao hỏa", "sao mộc", "sao thổ",
  "thiên vương", "hải vương", "diêm vương", "la hầu", "kế đô",
];

const HOUSE_RE = /(?:nhà|cung|house|thứ)\s*\d+/g;
// Separators restricted to / and - so decimals (e.g. "0.85") fall through to the number scan, not dates.
const DATE_RE =
  /(?:\b\d{1,2}[/\-]\d{1,2}(?:[/\-]\d{2,4})?\b)|(?:\b(?:19|20)\d{2}\b)|(?:(?:ngày|tháng|năm)\s*\d+)/g;
const NUMBER_RE = /\d+(?:[.,]\d+)?/g;

/** Lowercased, letter/number/percent tokens for whole-word matching. */
function tokenize(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/[^\p{L}\p{N}%]+/u).filter(Boolean));
}

/**
 * Deterministic grounding check. `interpretations` is the trusted allowed source; `narrative` is untrusted.
 */
export function checkGrounding(
  narrative: string,
  interpretations: readonly InterpretationObject[],
): GroundingResult {
  const violations: GroundingViolation[] = [];
  const lower = narrative.toLowerCase();
  const tokens = tokenize(narrative);

  // 1. Forbidden semantics — on the raw text (before any stripping).
  for (const w of FORBIDDEN_WORDS) {
    const hit = w.includes(" ") ? lower.includes(w) : tokens.has(w);
    if (hit) violations.push({ code: "forbidden_semantics", detail: w });
  }
  for (const p of FORBIDDEN_PHRASES) {
    if (lower.includes(p)) violations.push({ code: "forbidden_semantics", detail: p });
  }

  // 2. Build the allowed set from provenance ids + derivable counts, then strip ids (longest-first).
  const allowedIds: string[] = [];
  const allowedCounts = new Set<string>();
  for (const it of interpretations) {
    for (const id of it.rules) allowedIds.push(id);
    for (const id of it.evidence) allowedIds.push(id);
    for (const id of it.supportingFactors) allowedIds.push(id);
    allowedCounts.add(String(it.rules.length));
    allowedCounts.add(String(it.evidence.length));
    allowedCounts.add(String(it.supportingFactors.length));
  }
  let stripped = lower;
  for (const id of [...new Set(allowedIds)].sort((a, b) => b.length - a.length)) {
    stripped = stripped.split(id.toLowerCase()).join(" ");
  }

  // 3. Invented entity (planets) — on the stripped text.
  const strippedTokens = tokenize(stripped);
  for (const w of PLANET_WORDS) {
    if (strippedTokens.has(w)) violations.push({ code: "invented_entity", detail: w });
  }
  for (const p of PLANET_PHRASES) {
    if (stripped.includes(p)) violations.push({ code: "invented_entity", detail: p });
  }

  // 4. Invented house.
  for (const m of stripped.match(HOUSE_RE) ?? []) {
    violations.push({ code: "invented_house", detail: m.trim() });
  }

  // 5. Invented date. Remove house/date matches from the number-scan copy so they aren't double-counted.
  let numberScan = stripped.replace(HOUSE_RE, " ");
  for (const m of numberScan.match(DATE_RE) ?? []) {
    violations.push({ code: "invented_date", detail: m.trim() });
  }
  numberScan = numberScan.replace(DATE_RE, " ");

  // 6. Invented number/score — any remaining number not derivable as an allowed count.
  for (const m of numberScan.match(NUMBER_RE) ?? []) {
    if (!allowedCounts.has(m)) violations.push({ code: "invented_number", detail: m });
  }

  return { grounded: violations.length === 0, violations };
}
