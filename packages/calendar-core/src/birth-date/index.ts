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
