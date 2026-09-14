// V3-07B — CANONICAL BIRTH DATE + YEAR CONTEXT + METHOD YEAR CONTRACT (Phase B/C).
//
// Chứng minh nguyên tắc cốt lõi: BirthDate ≠ Year. Một BirthDate SINH RA NHIỀU context năm; PHƯƠNG
// PHÁP quyết định context nào nó xin. Calendar Core methodology-neutral. KHÔNG âm thầm fallback.
//
// Ranh giới thực nghiệm đã xác nhận (V3-05/V3-06 + verify V3-07B): năm 2026 — Lập Xuân ~04/02
// (giữa 02:30 và 05:00 VN tùy timezone), Tết = 17/02/2026.
import { describe, expect, it } from "vitest";
import {
  birthDateFromGregorianYear,
  birthDateFromGregorian,
  resolveYearContext,
  resolveAllAvailableYearContexts,
  resolveMethodYear,
  BirthDatePrecisionError,
  UnknownYearConventionError,
  InvalidBirthDateError,
  type MethodYearRequest,
} from "../../src/index.js";

const TZ = "Asia/Ho_Chi_Minh";

describe("BirthDate — biểu diễn chuẩn, giữ nguyên input + độ chính xác", () => {
  it("year-only: precision='year', không bịa tháng/ngày", () => {
    const bd = birthDateFromGregorianYear(1990, TZ);
    expect(bd.precision).toBe("year");
    expect(bd.gregorianYear).toBe(1990);
    expect(bd.gregorianMonth).toBeNull();
    expect(bd.gregorianDay).toBeNull();
    expect(bd.timeZone).toBe(TZ);
  });

  it("full date: precision='date'; có giờ: precision='datetime'; timezone được giữ", () => {
    const d = birthDateFromGregorian({ year: 2026, month: 2, day: 10, timeZone: TZ });
    expect(d.precision).toBe("date");
    const dt = birthDateFromGregorian({ year: 2026, month: 2, day: 10, hour: 12, timeZone: "Asia/Tokyo" });
    expect(dt.precision).toBe("datetime");
    expect(dt.timeZone).toBe("Asia/Tokyo");
    expect(dt.hour).toBe(12);
  });

  it("input không hợp lệ → InvalidBirthDateError (năm < 1, tháng/ngày sai, thiếu timezone)", () => {
    expect(() => birthDateFromGregorianYear(0, TZ)).toThrow(InvalidBirthDateError);
    expect(() => birthDateFromGregorianYear(1990, "")).toThrow(InvalidBirthDateError);
    expect(() => birthDateFromGregorian({ year: 2026, month: 13, day: 1, timeZone: TZ })).toThrow(InvalidBirthDateError);
  });
});

describe("resolveYearContext — 4 quy ước lịch (point 1-4)", () => {
  const bd = birthDateFromGregorian({ year: 2026, month: 2, day: 10, hour: 12, timeZone: TZ });

  it("1. GREGORIAN → nhãn năm thô, không trụ", () => {
    const r = resolveYearContext(bd, "GREGORIAN");
    expect(r.year).toBe(2026);
    expect(r.pillar).toBeNull();
    expect(r.lunarDate).toBeNull();
  });

  it("4. GANZHI_CALENDAR_BOUNDARY → Can Chi năm con giáp 1/1 (Bính Ngọ 2026)", () => {
    const r = resolveYearContext(bd, "GANZHI_CALENDAR_BOUNDARY");
    expect(r.year).toBe(2026);
    expect(r.pillar).not.toBeNull();
    expect(`${r.pillar!.can} ${r.pillar!.chi}`).toBe("Bính Ngọ");
  });

  it("3. GANZHI_LICH_XUAN → sau Lập Xuân 04/02 → năm 2026 (Bính Ngọ)", () => {
    const r = resolveYearContext(bd, "GANZHI_LICH_XUAN");
    expect(r.year).toBe(2026);
    expect(`${r.pillar!.can} ${r.pillar!.chi}`).toBe("Bính Ngọ");
  });

  it("2. LUNAR_TET → trước Tết 17/02 → năm Âm lịch 2025", () => {
    const r = resolveYearContext(bd, "LUNAR_TET");
    expect(r.year).toBe(2025);
    expect(r.lunarDate).not.toBeNull();
    expect(r.lunarDate!.year).toBe(2025);
  });

  it("boundary trước Lập Xuân (20/01/2026): LICH_XUAN → 2025 (Ất Tỵ) (point 7)", () => {
    const b = birthDateFromGregorian({ year: 2026, month: 1, day: 20, hour: 12, timeZone: TZ });
    const r = resolveYearContext(b, "GANZHI_LICH_XUAN");
    expect(r.year).toBe(2025);
    expect(`${r.pillar!.can} ${r.pillar!.chi}`).toBe("Ất Tỵ");
  });
});

describe("point 5 — MỘT BirthDate sinh ra NHIỀU context năm (BirthDate ≠ Year)", () => {
  it("cùng 1 BirthDate 10/02/2026 cho 4 context với 2 giá trị năm khác nhau (2026 và 2025)", () => {
    const bd = birthDateFromGregorian({ year: 2026, month: 2, day: 10, hour: 12, timeZone: TZ });
    const all = resolveAllAvailableYearContexts(bd);
    const byConv = Object.fromEntries(all.map((c) => [c.convention, c.year]));
    expect(byConv.GREGORIAN).toBe(2026);
    expect(byConv.GANZHI_CALENDAR_BOUNDARY).toBe(2026);
    expect(byConv.GANZHI_LICH_XUAN).toBe(2026);
    expect(byConv.LUNAR_TET).toBe(2025);
    // Cùng 1 dữ kiện gốc → nhiều "năm" hợp lệ khác nhau. Đây là điểm mấu chốt của toàn bộ kiến trúc.
    expect(new Set(Object.values(byConv)).size).toBeGreaterThan(1);
  });

  it("year-only chỉ dẫn xuất được 2 context không phụ thuộc ngày (GREGORIAN, GANZHI_CALENDAR)", () => {
    const y = birthDateFromGregorianYear(1990, TZ);
    const convs = resolveAllAvailableYearContexts(y).map((c) => c.convention);
    expect(convs).toEqual(["GREGORIAN", "GANZHI_CALENDAR_BOUNDARY"]);
  });
});

describe("point 9 — KHÔNG âm thầm fallback giữa các quy ước năm", () => {
  it("year-only + quy ước phụ thuộc ngày → ném BirthDatePrecisionError, KHÔNG bịa 1/1", () => {
    const y = birthDateFromGregorianYear(1990, TZ);
    expect(() => resolveYearContext(y, "GANZHI_LICH_XUAN")).toThrow(BirthDatePrecisionError);
    expect(() => resolveYearContext(y, "LUNAR_TET")).toThrow(BirthDatePrecisionError);
  });

  it("convention không hợp lệ → UnknownYearConventionError (không có mặc định ngầm)", () => {
    const y = birthDateFromGregorianYear(1990, TZ);
    // @ts-expect-error cố tình truyền convention sai để kiểm guard runtime
    expect(() => resolveYearContext(y, "SOMETHING_ELSE")).toThrow(UnknownYearConventionError);
  });
});

describe("point 8 — timezone được tôn trọng (cùng wall-clock, khác timezone → khác năm Lập Xuân)", () => {
  it("04/02/2026 03:00: VN → 2026 (Bính Ngọ), Tokyo → 2025 (Ất Tỵ)", () => {
    const vn = resolveYearContext(birthDateFromGregorian({ year: 2026, month: 2, day: 4, hour: 3, timeZone: "Asia/Ho_Chi_Minh" }), "GANZHI_LICH_XUAN");
    const tk = resolveYearContext(birthDateFromGregorian({ year: 2026, month: 2, day: 4, hour: 3, timeZone: "Asia/Tokyo" }), "GANZHI_LICH_XUAN");
    expect(vn.year).toBe(2026);
    expect(`${vn.pillar!.can} ${vn.pillar!.chi}`).toBe("Bính Ngọ");
    expect(tk.year).toBe(2025);
    expect(`${tk.pillar!.can} ${tk.pillar!.chi}`).toBe("Ất Tỵ");
    expect(vn.year).not.toBe(tk.year);
  });
});

describe("point 6 — MethodYearContract: khai báo tường minh + truy vết", () => {
  it("contract giữ method, convention, resolved, và BirthDate gốc", () => {
    const bd = birthDateFromGregorian({ year: 2026, month: 2, day: 10, hour: 12, timeZone: TZ });
    const req: MethodYearRequest = { method: "vi-du.tru-nam", convention: "GANZHI_LICH_XUAN" };
    const c = resolveMethodYear(req, bd);
    expect(c.method).toBe("vi-du.tru-nam");
    expect(c.convention).toBe("GANZHI_LICH_XUAN");
    expect(c.resolved.year).toBe(2026);
    expect(c.birthDate).toBe(bd); // giữ nguyên tham chiếu BirthDate gốc
  });

  it("resolveMethodYear với convention rác → UnknownYearConventionError", () => {
    const bd = birthDateFromGregorianYear(1990, TZ);
    // @ts-expect-error
    expect(() => resolveMethodYear({ method: "x", convention: "BAD" }, bd)).toThrow(UnknownYearConventionError);
  });
});

// ============================================================================================
// TẾT vs LẬP XUÂN SAFETY TEST — kiến trúc hỗ trợ CẢ HAI quyết định tương lai cho Mệnh Quái, bằng
// cách CHỈ đổi `convention` trong MethodYearRequest. Calendar Core KHÔNG đổi, BirthDate KHÔNG đổi.
// KHÔNG kích hoạt quyết định nào trong production — đây thuần là test kiến trúc (method "giả định").
// ============================================================================================
describe("Tết vs Lập Xuân — kiến trúc trung lập, hỗ trợ cả 2 tương lai (CHƯA quyết định gì)", () => {
  // Cùng MỘT người sinh 10/02/2026 (rơi giữa Lập Xuân 04/02 và Tết 17/02 → 2 quy ước cho 2 năm khác nhau).
  const birthDate = birthDateFromGregorian({ year: 2026, month: 2, day: 10, hour: 12, timeZone: TZ });

  it("Kịch bản A — Mệnh Quái CHỌN Tết: chỉ đổi convention → năm 2025", () => {
    const menhQuaiChonTet: MethodYearRequest = { method: "menh-quai.gia-dinh", convention: "LUNAR_TET" };
    const c = resolveMethodYear(menhQuaiChonTet, birthDate);
    expect(c.resolved.year).toBe(2025);
    expect(c.birthDate).toBe(birthDate);
  });

  it("Kịch bản B — Mệnh Quái CHỌN Lập Xuân: CÙNG BirthDate, chỉ đổi convention → năm 2026", () => {
    const menhQuaiChonLapXuan: MethodYearRequest = { method: "menh-quai.gia-dinh", convention: "GANZHI_LICH_XUAN" };
    const c = resolveMethodYear(menhQuaiChonLapXuan, birthDate);
    expect(c.resolved.year).toBe(2026);
    expect(c.birthDate).toBe(birthDate);
  });

  it("BẰNG CHỨNG kiến trúc: 2 kịch bản khác nhau CHỈ ở convention; BirthDate và cách resolve calendar y hệt", () => {
    const A = resolveMethodYear({ method: "menh-quai.gia-dinh", convention: "LUNAR_TET" }, birthDate);
    const B = resolveMethodYear({ method: "menh-quai.gia-dinh", convention: "GANZHI_LICH_XUAN" }, birthDate);
    // Cùng 1 BirthDate object (không phải chỉ bằng giá trị) → không có "input gốc thứ 2".
    expect(A.birthDate).toBe(B.birthDate);
    // Chỉ convention khác → năm khác. Đây là toàn bộ điểm khác biệt giữa 2 tương lai.
    expect(A.convention).not.toBe(B.convention);
    expect(A.resolved.year).not.toBe(B.resolved.year);
    // Cùng dùng calendar-core (resolved qua cùng resolveYearContext), không cần "hardcode Tết/Lập Xuân"
    // ở bất kỳ đâu trong kiến trúc — quyết định là 1 GIÁ TRỊ dữ liệu, không phải 1 nhánh code cứng.
  });
});
