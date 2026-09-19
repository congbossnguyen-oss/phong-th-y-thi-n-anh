/**
 * `western.FactorEngine` — Layer 7 Astrological Factors, TRƯỜNG PHÁI TÂY (Phase 5, ROADMAP.md).
 * Contract FROZEN — xem message "PHASE 5 FACTOR ENGINE — FINAL CONTRACT FREEZE".
 *
 * Trích xuất `Factor[]` từ một `NormalizedChart` Tây phương ĐÃ TÍNH (tái dùng output của
 * `western/planets.ts` + `western/houses.ts` + `western/aspects.ts` qua `buildWesternChart`) —
 * KHÔNG tự tính lại hành tinh/nhà/aspect, KHÔNG chuyển logic tính toán vào đây. Chỉ suy ra factor
 * từ dữ kiện chart có sẵn.
 *
 * PHẠM VI v1 (đúng 4 họ factor, FROZEN):
 *   1. planet-in-sign     — category "placement"
 *   2. planet-in-house    — category "placement" (CHỈ khi planet.house != null)
 *   3. aspect             — category "aspect"
 *   4. element / modality — category "sign_quality"
 *
 * strength: LUÔN 0 ở v1 (KHÔNG có polarity xác định-không-diễn-giải cho bất kỳ họ nào — benefic/
 * malefic chức năng phụ thuộc lá số/ascendant = diễn giải, harmonious/tense = diễn giải; theo
 * contract FROZEN, mọi polarity ngữ-cảnh/diễn-giải ⇒ strength=0). KHÔNG magnitude, KHÔNG epsilon,
 * KHÔNG scoring, KHÔNG dignity, KHÔNG rulership, KHÔNG dispositor, KHÔNG lĩnh vực đời sống.
 *
 * ABSENT vs PRESENT+strength=0: factor phụ thuộc input vắng mặt (vd. planet.house == null khi
 * unknown-time) thì KHÔNG được phát ra (ABSENT) — KHÔNG BAO GIỜ phát ra với strength=0 giả.
 *
 * ADR-003 (school isolation): file này CHỈ import `chart/` (dùng chung) + `factor/` (hợp đồng dùng
 * chung) — KHÔNG import `vedic/`. element/modality suy ra tại chỗ từ chỉ số `ZODIAC_SIGNS` (thuộc
 * tính PHỔ QUÁT của cung, không phải phương pháp riêng trường phái); helper private tương đương
 * trong `vedic/divisional.ts` KHÔNG thể (và không được) import xuyên trường phái — xem ghi chú
 * "shared zodiac-quality" trong báo cáo Phase 5 (cơ hội refactor tương lai, ngoài phạm vi v1).
 */

import type { NormalizedAspectInstance, NormalizedChart, NormalizedPlanetPosition, ZodiacSign } from "../chart/types.js";
import { ZODIAC_SIGNS } from "../chart/types.js";
import type { Factor, FactorEngine, FactorInput, FactorSchoolConfig } from "../factor/types.js";

/** Phiên bản engine — ADR-008. Ổn định cho v1; magnitude liên tục sẽ là "western.factors.v2". */
export const WESTERN_FACTORS_VERSION = "western.factors.v1";

const WESTERN_SCHOOL = "western";

/** strength v1 FROZEN = 0 cho mọi factor (không có polarity xác định-không-diễn-giải). */
const V1_STRENGTH = 0;

type Element = "fire" | "earth" | "air" | "water";
type Modality = "cardinal" | "fixed" | "mutable";

/** Nguyên tố lặp mỗi 4 cung theo thứ tự `ZODIAC_SIGNS` (Aries=fire, Taurus=earth, Gemini=air, Cancer=water, ...). Thuộc tính phổ quát của cung. */
const ELEMENTS: readonly [Element, Element, Element, Element] = ["fire", "earth", "air", "water"];
/** Tính chất lặp mỗi 3 cung theo thứ tự `ZODIAC_SIGNS` (Aries=cardinal, Taurus=fixed, Gemini=mutable, ...). */
const MODALITIES: readonly [Modality, Modality, Modality] = ["cardinal", "fixed", "mutable"];

function signElement(sign: ZodiacSign): Element {
  const el = ELEMENTS[ZODIAC_SIGNS.indexOf(sign) % 4];
  if (el === undefined) {
    // Không thể xảy ra: `sign` luôn ∈ ZODIAC_SIGNS nên indexOf ∈ [0,11], `% 4` ∈ [0,3] khớp đúng 4 phần tử — phòng vệ noUncheckedIndexedAccess.
    throw new Error(`signElement: cung không hợp lệ (${sign}).`);
  }
  return el;
}

function signModality(sign: ZodiacSign): Modality {
  const mod = MODALITIES[ZODIAC_SIGNS.indexOf(sign) % 3];
  if (mod === undefined) {
    throw new Error(`signModality: cung không hợp lệ (${sign}).`);
  }
  return mod;
}

function makeFactor(
  id: string,
  category: Factor["category"],
  inputs: FactorInput[],
  chartId: string,
  computedAt: Date,
): Factor {
  return {
    id,
    chartId,
    school: WESTERN_SCHOOL,
    category,
    inputs,
    strength: V1_STRENGTH,
    computedAt,
    version: WESTERN_FACTORS_VERSION,
  };
}

/** Họ 1 — planet-in-sign: `<body>_in_<sign>`. */
function planetInSignFactor(p: NormalizedPlanetPosition, chartId: string, computedAt: Date): Factor {
  return makeFactor(
    `${p.body}_in_${p.sign}`,
    "placement",
    [
      { type: "planet", ref: p.body },
      { type: "sign", ref: p.sign },
    ],
    chartId,
    computedAt,
  );
}

/** Họ 2 — planet-in-house: `<body>_in_house_<n>`. CHỈ gọi khi `p.house != null`. */
function planetInHouseFactor(p: NormalizedPlanetPosition, house: number, chartId: string, computedAt: Date): Factor {
  return makeFactor(
    `${p.body}_in_house_${house}`,
    "placement",
    [
      { type: "planet", ref: p.body },
      { type: "house", ref: `house_${house}` },
    ],
    chartId,
    computedAt,
  );
}

/** Họ 4 — element: `<body>_element_<element>`. */
function elementFactor(p: NormalizedPlanetPosition, chartId: string, computedAt: Date): Factor {
  return makeFactor(
    `${p.body}_element_${signElement(p.sign)}`,
    "sign_quality",
    [
      { type: "planet", ref: p.body },
      { type: "sign", ref: p.sign },
    ],
    chartId,
    computedAt,
  );
}

/** Họ 4 — modality: `<body>_modality_<modality>`. */
function modalityFactor(p: NormalizedPlanetPosition, chartId: string, computedAt: Date): Factor {
  return makeFactor(
    `${p.body}_modality_${signModality(p.sign)}`,
    "sign_quality",
    [
      { type: "planet", ref: p.body },
      { type: "sign", ref: p.sign },
    ],
    chartId,
    computedAt,
  );
}

/** Họ 3 — aspect: `aspect:<a>-<b>:<type>`. Tái dùng nguyên `chart.aspects[]` (chỉ chứa aspect trong orb từ `computeWesternAspects`). */
function aspectFactor(a: NormalizedAspectInstance, chartId: string, computedAt: Date): Factor {
  const rel = `${a.planetA}-${a.planetB}:${a.type}`;
  return makeFactor(
    `aspect:${rel}`,
    "aspect",
    [
      { type: "planet", ref: a.planetA },
      { type: "planet", ref: a.planetB },
      { type: "aspect", ref: rel },
    ],
    chartId,
    computedAt,
  );
}

/**
 * Trích xuất Western `Factor[]` từ một `NormalizedChart` Tây phương. HÀM THUẦN, deterministic
 * (thứ tự bám theo `chart.planets` rồi `chart.aspects`; `chartId`/`computedAt` lấy từ metadata) —
 * cùng chart ⇒ cùng `Factor[]`.
 */
export function extractWesternFactors(chart: NormalizedChart, schoolConfig: FactorSchoolConfig): Factor[] {
  // Isolation guard (ADR-003): engine Tây CHỈ xử lý chart + config Tây phương.
  if (chart.school !== WESTERN_SCHOOL) {
    throw new Error(`extractWesternFactors: chart.school="${chart.school}" — western engine chỉ nhận chart Tây phương.`);
  }
  if (schoolConfig.school !== WESTERN_SCHOOL) {
    throw new Error(`extractWesternFactors: schoolConfig.school="${schoolConfig.school}" — phải là "western".`);
  }

  const chartId = chart.metadata.calculationId;
  const computedAt = chart.metadata.calculatedAt;
  const factors: Factor[] = [];

  for (const p of chart.planets) {
    factors.push(planetInSignFactor(p, chartId, computedAt));
    factors.push(elementFactor(p, chartId, computedAt));
    factors.push(modalityFactor(p, chartId, computedAt));
    // planet-in-house CHỈ phát ra khi có nhà (unknown-time ⇒ house=null ⇒ factor ABSENT, KHÔNG phải strength=0).
    if (p.house !== null) {
      factors.push(planetInHouseFactor(p, p.house, chartId, computedAt));
    }
  }

  for (const a of chart.aspects) {
    factors.push(aspectFactor(a, chartId, computedAt));
  }

  return factors;
}

/** `western.FactorEngine` — implementation của interface dùng chung `FactorEngine` (ADR-003: riêng trường phái). */
export const westernFactorEngine: FactorEngine = {
  extractFactors: extractWesternFactors,
};
