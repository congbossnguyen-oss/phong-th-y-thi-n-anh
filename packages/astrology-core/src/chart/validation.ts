/**
 * Validate `NormalizedChart` — kiểm tra TÍNH TOÀN VẸN CẤU TRÚC (kiểu, khoảng giá trị, không
 * trùng lặp, tham chiếu enum hợp lệ). KHÔNG kiểm tra "đúng về mặt chiêm tinh" (vd. không tính
 * lại aspect để xác nhận `withinOrb` đúng hay sai) — đó là trách nhiệm của Chart Calculation
 * (Phase 3+), NormalizedChart chỉ là data contract, không phải calculator.
 *
 * Trả `AstrologyCoreError[]` (rỗng nếu hợp lệ), KHÔNG throw — đúng quy ước đã có từ Phase 1
 * (`validation/birthData.ts`).
 */
import type { AstrologyCoreError } from "../errors.js";
import { ZODIAC_SIGNS } from "./types.js";
import type {
  NormalizedAngle,
  NormalizedAspectInstance,
  NormalizedChart,
  NormalizedDignityResult,
  NormalizedHouse,
  NormalizedHouseCusp,
  NormalizedNodePosition,
  NormalizedPlanetPosition,
  NormalizedPointPosition,
} from "./types.js";

/**
 * Mã lỗi riêng cho NormalizedChart — KHÔNG dùng chung enum với `AstrologyCoreErrorCode` của
 * BirthData (Phase 1) vì đây là lớp lỗi hoàn toàn khác (toàn vẹn dữ liệu đã tính, không phải
 * input người dùng) — tránh nhét 2 domain lỗi khác nhau vào cùng 1 union đóng.
 */
export type NormalizedChartErrorCode =
  | "INVALID_LONGITUDE"
  | "INVALID_LATITUDE"
  | "INVALID_SIGN_DEGREE"
  | "INVALID_ZODIAC_SIGN"
  | "INVALID_HOUSE_NUMBER"
  | "MISSING_AYANAMSA_FOR_SIDEREAL"
  | "UNEXPECTED_AYANAMSA_FOR_TROPICAL"
  | "DUPLICATE_PLANET"
  | "DUPLICATE_HOUSE_NUMBER"
  | "DUPLICATE_HOUSE_CUSP"
  | "DUPLICATE_ANGLE_TYPE"
  | "INCOMPLETE_HOUSE_CUSPS"
  | "INCONSISTENT_RETROGRADE_FLAG"
  | "INVALID_ASPECT_ORB"
  | "ASPECT_SELF_REFERENCE"
  | "EMPTY_BIRTH_DATA_REF"
  | "EMPTY_SCHOOL"
  | "INVALID_SPEED"
  | "EMPTY_DIGNITY_SCHEME"
  | "EMPTY_DIGNITY_TYPE"
  | "EMPTY_DIGNITY_BODY"
  | "INVALID_DIGNITY_SCORE";

export interface NormalizedChartError extends Omit<AstrologyCoreError, "code"> {
  code: NormalizedChartErrorCode;
}

function err(code: NormalizedChartErrorCode, message: string, field: string, details?: Record<string, unknown>): NormalizedChartError {
  // KHÔNG gán `details: undefined` tường minh — exactOptionalPropertyTypes coi đó khác với
  // "không có field này" dù cùng thể hiện ra ngoài giống nhau khi đọc `.details`.
  return details === undefined ? { code, message, field } : { code, message, field, details };
}

const isFiniteNumber = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

export function validateNormalizedChart(chart: NormalizedChart): NormalizedChartError[] {
  const errors: NormalizedChartError[] = [];

  if (typeof chart.birthDataRef !== "string" || chart.birthDataRef.length === 0) {
    errors.push(err("EMPTY_BIRTH_DATA_REF", "birthDataRef không được rỗng.", "birthDataRef"));
  }
  if (typeof chart.school !== "string" || chart.school.length === 0) {
    errors.push(err("EMPTY_SCHOOL", "school không được rỗng.", "school"));
  }

  errors.push(...validateAyanamsaConsistency(chart));
  errors.push(...chart.planets.flatMap((p, i) => validatePlanet(p, i)));
  errors.push(...validateNoDuplicatePlanets(chart.planets));
  errors.push(...chart.points.flatMap((p, i) => validatePoint(p, i)));
  errors.push(...chart.nodes.flatMap((n, i) => validateNode(n, i)));
  errors.push(...chart.houses.flatMap((h, i) => validateHouse(h, i)));
  errors.push(...validateNoDuplicateHouseNumbers(chart.houses));
  errors.push(...chart.houseCusps.flatMap((c, i) => validateHouseCusp(c, i)));
  errors.push(...validateHouseCuspsCompleteness(chart.houseCusps));
  errors.push(...chart.angles.flatMap((a, i) => validateAngle(a, i)));
  errors.push(...validateNoDuplicateAngleTypes(chart.angles));
  errors.push(...chart.aspects.flatMap((a, i) => validateAspect(a, i)));
  errors.push(...chart.dignities.flatMap((d, i) => validateDignity(d, i)));

  return errors;
}

function validateAyanamsaConsistency(chart: NormalizedChart): NormalizedChartError[] {
  if (chart.zodiacType === "sidereal" && chart.ayanamsa === null) {
    return [err("MISSING_AYANAMSA_FOR_SIDEREAL", "zodiacType='sidereal' bắt buộc phải có ayanamsa.", "ayanamsa")];
  }
  if (chart.zodiacType === "tropical" && chart.ayanamsa !== null) {
    return [
      err(
        "UNEXPECTED_AYANAMSA_FOR_TROPICAL",
        "zodiacType='tropical' không được có ayanamsa (tropical không dùng ayanamsa).",
        "ayanamsa",
        { actual: chart.ayanamsa },
      ),
    ];
  }
  return [];
}

function validateLongitude(longitude: number, field: string): NormalizedChartError[] {
  if (!isFiniteNumber(longitude) || longitude < 0 || longitude >= 360) {
    return [err("INVALID_LONGITUDE", `${field} phải trong khoảng [0, 360): nhận ${String(longitude)}.`, field, { actual: longitude })];
  }
  return [];
}

function validateSign(sign: unknown, field: string): NormalizedChartError[] {
  if (!ZODIAC_SIGNS.includes(sign as (typeof ZODIAC_SIGNS)[number])) {
    return [err("INVALID_ZODIAC_SIGN", `${field} không phải 1 trong 12 cung hợp lệ: nhận "${String(sign)}".`, field, { actual: sign })];
  }
  return [];
}

function validatePlanet(p: NormalizedPlanetPosition, index: number): NormalizedChartError[] {
  const prefix = `planets[${index}]`;
  const errors: NormalizedChartError[] = [];
  errors.push(...validateLongitude(p.longitude, `${prefix}.longitude`));
  if (!isFiniteNumber(p.latitude) || p.latitude < -90 || p.latitude > 90) {
    errors.push(err("INVALID_LATITUDE", `${prefix}.latitude phải trong [-90, 90]: nhận ${String(p.latitude)}.`, `${prefix}.latitude`, { actual: p.latitude }));
  }
  if (!isFiniteNumber(p.signDegree) || p.signDegree < 0 || p.signDegree >= 30) {
    errors.push(err("INVALID_SIGN_DEGREE", `${prefix}.signDegree phải trong [0, 30): nhận ${String(p.signDegree)}.`, `${prefix}.signDegree`, { actual: p.signDegree }));
  }
  errors.push(...validateSign(p.sign, `${prefix}.sign`));
  if (p.house !== null && (!Number.isInteger(p.house) || p.house < 1 || p.house > 12)) {
    errors.push(err("INVALID_HOUSE_NUMBER", `${prefix}.house phải là 1-12 hoặc null: nhận ${String(p.house)}.`, `${prefix}.house`, { actual: p.house }));
  }
  if (!isFiniteNumber(p.speedDegreesPerDay)) {
    errors.push(err("INVALID_SPEED", `${prefix}.speedDegreesPerDay phải là số hữu hạn: nhận ${String(p.speedDegreesPerDay)}.`, `${prefix}.speedDegreesPerDay`));
  } else if (p.isRetrograde !== p.speedDegreesPerDay < 0) {
    errors.push(
      err(
        "INCONSISTENT_RETROGRADE_FLAG",
        `${prefix}.isRetrograde (${String(p.isRetrograde)}) không khớp dấu speedDegreesPerDay (${String(p.speedDegreesPerDay)}).`,
        `${prefix}.isRetrograde`,
      ),
    );
  }
  return errors;
}

function validateNoDuplicatePlanets(planets: NormalizedPlanetPosition[]): NormalizedChartError[] {
  const seen = new Set<string>();
  const errors: NormalizedChartError[] = [];
  for (const p of planets) {
    if (seen.has(p.body)) {
      errors.push(err("DUPLICATE_PLANET", `Hành tinh "${p.body}" xuất hiện nhiều hơn 1 lần trong planets[].`, "planets", { body: p.body }));
    }
    seen.add(p.body);
  }
  return errors;
}

function validatePoint(p: NormalizedPointPosition, index: number): NormalizedChartError[] {
  return validateLongitude(p.longitude, `points[${index}].longitude`);
}

function validateNode(n: NormalizedNodePosition, index: number): NormalizedChartError[] {
  return validateLongitude(n.longitude, `nodes[${index}].longitude`);
}

function validateHouse(h: NormalizedHouse, index: number): NormalizedChartError[] {
  const prefix = `houses[${index}]`;
  const errors: NormalizedChartError[] = [];
  if (!Number.isInteger(h.number) || h.number < 1 || h.number > 12) {
    errors.push(err("INVALID_HOUSE_NUMBER", `${prefix}.number phải là 1-12: nhận ${String(h.number)}.`, `${prefix}.number`, { actual: h.number }));
  }
  errors.push(...validateSign(h.sign, `${prefix}.sign`));
  return errors;
}

function validateNoDuplicateHouseNumbers(houses: NormalizedHouse[]): NormalizedChartError[] {
  const seen = new Set<number>();
  const errors: NormalizedChartError[] = [];
  for (const h of houses) {
    if (seen.has(h.number)) {
      errors.push(err("DUPLICATE_HOUSE_NUMBER", `Nhà số ${h.number} xuất hiện nhiều hơn 1 lần trong houses[].`, "houses", { number: h.number }));
    }
    seen.add(h.number);
  }
  return errors;
}

function validateHouseCusp(c: NormalizedHouseCusp, index: number): NormalizedChartError[] {
  const prefix = `houseCusps[${index}]`;
  const errors: NormalizedChartError[] = [];
  if (!Number.isInteger(c.houseNumber) || c.houseNumber < 1 || c.houseNumber > 12) {
    errors.push(err("INVALID_HOUSE_NUMBER", `${prefix}.houseNumber phải là 1-12: nhận ${String(c.houseNumber)}.`, `${prefix}.houseNumber`));
  }
  errors.push(...validateLongitude(c.longitude, `${prefix}.longitude`));
  return errors;
}

/**
 * Nếu houseCusps KHÔNG rỗng (chart có giờ sinh, có tính house), phải đủ đúng 12 cusp, không
 * trùng số nhà. Chart unknown-time (localTime=null ở BirthData) hợp lệ khi houseCusps RỖNG —
 * đây là "hệ quả tính toán" đã nêu ở DOMAIN_MODEL.md §1, không coi mảng rỗng là lỗi.
 */
function validateHouseCuspsCompleteness(cusps: NormalizedHouseCusp[]): NormalizedChartError[] {
  if (cusps.length === 0) return [];
  const errors: NormalizedChartError[] = [];
  const seen = new Set<number>();
  for (const c of cusps) {
    if (seen.has(c.houseNumber)) {
      errors.push(err("DUPLICATE_HOUSE_CUSP", `Cusp cho nhà số ${c.houseNumber} xuất hiện nhiều hơn 1 lần.`, "houseCusps", { houseNumber: c.houseNumber }));
    }
    seen.add(c.houseNumber);
  }
  if (cusps.length !== 12) {
    errors.push(err("INCOMPLETE_HOUSE_CUSPS", `houseCusps phải có đúng 12 phần tử khi không rỗng: nhận ${cusps.length}.`, "houseCusps", { actualCount: cusps.length }));
  }
  return errors;
}

function validateAngle(a: NormalizedAngle, index: number): NormalizedChartError[] {
  return validateLongitude(a.longitude, `angles[${index}].longitude`);
}

function validateNoDuplicateAngleTypes(angles: NormalizedAngle[]): NormalizedChartError[] {
  const seen = new Set<string>();
  const errors: NormalizedChartError[] = [];
  for (const a of angles) {
    if (seen.has(a.type)) {
      errors.push(err("DUPLICATE_ANGLE_TYPE", `Góc "${a.type}" xuất hiện nhiều hơn 1 lần trong angles[].`, "angles", { type: a.type }));
    }
    seen.add(a.type);
  }
  return errors;
}

function validateAspect(a: NormalizedAspectInstance, index: number): NormalizedChartError[] {
  const prefix = `aspects[${index}]`;
  const errors: NormalizedChartError[] = [];
  if (a.planetA === a.planetB) {
    errors.push(err("ASPECT_SELF_REFERENCE", `${prefix}: planetA và planetB không được trùng nhau ("${a.planetA}").`, prefix));
  }
  if (!isFiniteNumber(a.orb) || a.orb < 0) {
    errors.push(err("INVALID_ASPECT_ORB", `${prefix}.orb phải >= 0: nhận ${String(a.orb)}.`, `${prefix}.orb`, { actual: a.orb }));
  }
  return errors;
}

/**
 * Validate `NormalizedDignityResult` — trung lập trường phái (Phase 2.1, Approved Decision 2).
 * `sign` CHỈ validate khi CÓ mặt (tuỳ chọn — nhiều thành phần strength không dựa trên cung, vd.
 * Dig/Kaala/Cheshta Bala của Vedic Shadbala) — KHÔNG bắt buộc phải có như bản cũ.
 */
function validateDignity(d: NormalizedDignityResult, index: number): NormalizedChartError[] {
  const prefix = `dignities[${index}]`;
  const errors: NormalizedChartError[] = [];

  if (typeof d.scheme !== "string" || d.scheme.length === 0) {
    errors.push(err("EMPTY_DIGNITY_SCHEME", `${prefix}.scheme không được rỗng.`, `${prefix}.scheme`));
  }
  if (typeof d.type !== "string" || d.type.length === 0) {
    errors.push(err("EMPTY_DIGNITY_TYPE", `${prefix}.type không được rỗng.`, `${prefix}.type`));
  }
  if (typeof d.body !== "string" || d.body.length === 0) {
    errors.push(err("EMPTY_DIGNITY_BODY", `${prefix}.body không được rỗng.`, `${prefix}.body`));
  }
  if (!isFiniteNumber(d.score)) {
    errors.push(err("INVALID_DIGNITY_SCORE", `${prefix}.score phải là số hữu hạn: nhận ${String(d.score)}.`, `${prefix}.score`));
  }
  if (d.sign !== undefined) {
    errors.push(...validateSign(d.sign, `${prefix}.sign`));
  }

  return errors;
}
