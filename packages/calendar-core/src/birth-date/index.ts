/**
 * Canonical BirthDate + Year Context + MethodYearContract (V3-07B Phase B/C).
 * Điểm gom export cho tầng "ngày sinh chuẩn" của calendar-core.
 */
export {
  type BirthDate,
  type BirthDatePrecision,
  type OriginalCalendar,
  InvalidBirthDateError,
  birthDateFromGregorianYear,
  birthDateFromGregorian,
  hasCalendarDate,
} from "./birthDate.js";

export {
  type YearConvention,
  type ResolvedYearContext,
  YEAR_CONVENTIONS,
  BirthDatePrecisionError,
  UnknownYearConventionError,
  resolveYearContext,
  resolveAllAvailableYearContexts,
} from "./yearContext.js";

export {
  type MethodYearRequest,
  type MethodYearContract,
  resolveMethodYear,
} from "./methodYearContract.js";

export {
  type VnPolicyDateInput,
  type VnRegionalAlternative,
  type VietnameseCalendarPolicy,
  VietnameseCalendarPolicyError,
  VN_POLICY_UNIFY_DATE_KEY,
  policyOffsetToFixedZone,
  resolveVietnameseCalendarPolicy,
  getVietnameseLunarDate,
  vnLunarZone,
  vnInverseZone,
  getVietnameseSolarDateFromLunar,
} from "./vnCalendarPolicy.js";

export {
  LUNAR_ENGINE_ENV_VAR,
  LUNAR_ENGINE_ON_VALUE,
  LUNAR_ENGINE_PUBLIC_VAR,
  isCanonicalVnLunarEnabled,
} from "./lunarEngineFlag.js";
