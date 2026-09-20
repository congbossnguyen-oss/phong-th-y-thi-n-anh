/**
 * G10 — Golden matrix + invariants cho đường Âm lịch canonical VN (V3-38).
 * Kiểm: (1) resolver chính sách đúng offset & từ chối year-only; (2) canonical == kỳ vọng V3-37;
 * (3) mọi khác biệt legacy↔canonical thuộc {TIMEZONE, LEAP_MONTH, ΔT, NONE};
 * (4) cờ TẮT ⇒ resolveVnLunar === solarToLunar (byte-identical baseline);
 * (5) trụ Bát Tự BẤT BIẾN khi bật cờ.
 */
import { describe, it, expect } from "vitest";
import {
  getVietnameseLunarDate,
  getVietnameseSolarDateFromLunar,
  resolveVietnameseCalendarPolicy,
  VietnameseCalendarPolicyError,
} from "@thien-anh/calendar-core";
import { convertSolarToLunar, convertLunarToSolar } from "@thien-anh/trachnhat-engine";
import { solarToLunar } from "../src/lib/lunar-calendar";
import { resolveVnLunar } from "../src/lib/lunar-canonical";
import { tinhBatTu } from "../src/lib/bat-tu";

type Cls = "NONE" | "TIMEZONE" | "LEAP_MONTH" | "DELTA_T";
interface Row { label: string; y: number; m: number; d: number; canon: string; cls: Cls }

const s = (o: { day: number; month: number; year: number; isLeapMonth: boolean }) =>
  `${o.day}/${o.month}${o.isLeapMonth ? "L" : ""}/${o.year}`;

const MATRIX: Row[] = [
  { label: "1965 timezone", y: 1965, m: 2, d: 2, canon: "1/1/1965", cls: "TIMEZONE" },
  { label: "1968 canonical +7", y: 1968, m: 1, d: 29, canon: "1/1/1968", cls: "NONE" },
  { label: "1968 regional +8 meta", y: 1968, m: 1, d: 30, canon: "2/1/1968", cls: "NONE" },
  { label: "1969", y: 1969, m: 2, d: 17, canon: "2/1/1969", cls: "NONE" },
  { label: "1972 Tết", y: 1972, m: 2, d: 15, canon: "1/1/1972", cls: "NONE" },
  { label: "1975 boundary-13", y: 1975, m: 6, d: 13, canon: "4/5/1975", cls: "NONE" },
  { label: "1975 boundary-14", y: 1975, m: 6, d: 14, canon: "5/5/1975", cls: "NONE" },
  { label: "1988 Tết", y: 1988, m: 2, d: 17, canon: "1/1/1988", cls: "NONE" },
  { label: "2001 leap-4", y: 2001, m: 5, d: 23, canon: "1/4L/2001", cls: "LEAP_MONTH" },
  { label: "2004 leap-2", y: 2004, m: 3, d: 21, canon: "1/2L/2004", cls: "NONE" },
  { label: "2006 leap-7", y: 2006, m: 8, d: 24, canon: "1/7L/2006", cls: "NONE" },
  { label: "2009 leap-5", y: 2009, m: 6, d: 23, canon: "1/5L/2009", cls: "NONE" },
  { label: "2014 leap-9", y: 2014, m: 10, d: 24, canon: "1/9L/2014", cls: "LEAP_MONTH" },
  { label: "2017 leap-6", y: 2017, m: 7, d: 23, canon: "1/6L/2017", cls: "NONE" },
  { label: "2031 leap-3", y: 2031, m: 4, d: 22, canon: "2/3L/2031", cls: "LEAP_MONTH" },
  { label: "2033 leap-11", y: 2034, m: 1, d: 1, canon: "11/11L/2033", cls: "LEAP_MONTH" },
  { label: "2034 Tết", y: 2034, m: 2, d: 19, canon: "1/1/2034", cls: "LEAP_MONTH" },
  { label: "2060 Tết", y: 2060, m: 2, d: 2, canon: "1/1/2060", cls: "NONE" },
  { label: "2085 ΔT", y: 2085, m: 10, d: 19, canon: "2/9/2085", cls: "DELTA_T" },
  { label: "ordinary 2000-07-15", y: 2000, m: 7, d: 15, canon: "14/6/2000", cls: "NONE" },
];

describe("G10 resolver — offset & precision", () => {
  it("pre-1968 → +8; từ 1968-01-01 → +7 (không dùng mốc 13/08)", () => {
    expect(resolveVietnameseCalendarPolicy({ year: 1967, month: 12, day: 31 }).offsetHours).toBe(8);
    expect(resolveVietnameseCalendarPolicy({ year: 1968, month: 1, day: 1 }).offsetHours).toBe(7);
    expect(resolveVietnameseCalendarPolicy({ year: 2000, month: 7, day: 15 }).offsetHours).toBe(7);
  });
  it("từ chối year-only (không bịa 1/1)", () => {
    // @ts-expect-error thiếu month/day có chủ đích
    expect(() => resolveVietnameseCalendarPolicy({ year: 1990 })).toThrow(VietnameseCalendarPolicyError);
  });
  it("regional +8 chỉ là metadata trong cửa sổ 1968–1975", () => {
    expect(resolveVietnameseCalendarPolicy({ year: 1969, month: 2, day: 17 }).regionalAlternative?.offsetHours).toBe(8);
    expect(resolveVietnameseCalendarPolicy({ year: 1988, month: 2, day: 17 }).regionalAlternative).toBeNull();
  });
});

describe("G10 golden matrix — canonical + difference class", () => {
  for (const row of MATRIX) {
    it(`${row.label} [${row.y}-${row.m}-${row.d}] → ${row.canon} (${row.cls})`, () => {
      const C = getVietnameseLunarDate({ year: row.y, month: row.m, day: row.d });
      expect(s(C)).toBe(row.canon);
      const L = solarToLunar(row.d, row.m, row.y);
      const differ = s(L) !== s(C);
      if (row.cls === "NONE") expect(differ).toBe(false);
      else expect(differ).toBe(true);
    });
  }
});

describe("G10 flag OFF — byte-identical baseline", () => {
  it("resolveVnLunar === solarToLunar khi cờ TẮT (sweep 1950–2100)", () => {
    delete process.env.LUNAR_ENGINE;
    let mismatch = 0;
    for (let y = 1950; y <= 2100; y++) {
      for (const [m, d] of [[2, 10], [7, 15]] as const) {
        if (s(solarToLunar(d, m, y)) !== s(resolveVnLunar(d, m, y))) mismatch++;
      }
    }
    expect(mismatch).toBe(0);
  });
});

describe("G10 flag ON — Bát Tự pillars BẤT BIẾN", () => {
  const bat = (b: { year: any; month: any; day: any; hour: any }) =>
    `${b.year.can}${b.year.chi}|${b.month.can}${b.month.chi}|${b.day.can}${b.day.chi}|${b.hour.can}${b.hour.chi}`;
  const dates: Array<[number, number, number]> = [
    [1965, 2, 2], [1988, 2, 17], [2001, 5, 23], [2034, 2, 19], [2085, 10, 19], [2000, 7, 15], [2014, 10, 24],
  ];
  it("trụ Bát Tự giống hệt giữa cờ TẮT và BẬT", () => {
    for (const [y, m, d] of dates) {
      delete process.env.LUNAR_ENGINE;
      const off = bat(tinhBatTu({ day: d, month: m, year: y, hour: 10, gender: "Nam" }));
      process.env.LUNAR_ENGINE = "calendar-core";
      const on = bat(tinhBatTu({ day: d, month: m, year: y, hour: 10, gender: "Nam" }));
      expect(on).toBe(off);
    }
    delete process.env.LUNAR_ENGINE;
  });
});

describe("G10 inverse leap-month regression (V3-43 AUDIT-4/7)", () => {
  // Eager +8 candidate previously threw for +7-era leap months, aborting the correct +7 inverse.
  it("leap-month inverse in +7 era round-trips (1985, 1987) — no throw", () => {
    process.env.LUNAR_ENGINE = "calendar-core";
    try {
      for (const [y, m, d] of [[1985, 3, 21], [1987, 8, 24]] as const) {
        const L = getVietnameseLunarDate({ year: y, month: m, day: d });
        expect(L.isLeapMonth).toBe(true); // these solar days fall in a leap month
        const s = getVietnameseSolarDateFromLunar({ day: L.day, month: L.month, year: L.year, isLeapMonth: L.isLeapMonth });
        expect(`${s.day}/${s.month}/${s.year}`).toBe(`${d}/${m}/${y}`);
      }
    } finally {
      delete process.env.LUNAR_ENGINE;
    }
  });
});

describe("G10 inverse policy — 1968 boundary (V3-42 AUDIT-4)", () => {
  it("lunar 10/11/1967 → 11/12/1967 (không lệch)", () => {
    process.env.LUNAR_ENGINE = "calendar-core";
    try {
      const s = getVietnameseSolarDateFromLunar({ day: 10, month: 11, year: 1967, isLeapMonth: false });
      expect(`${s.day}/${s.month}/${s.year}`).toBe("11/12/1967");
    } finally {
      delete process.env.LUNAR_ENGINE;
    }
  });
  it("daily solar round-trip 1967-01-01…1968-12-31 khớp tuyệt đối", () => {
    process.env.LUNAR_ENGINE = "calendar-core";
    try {
      let fail = 0;
      for (const y of [1967, 1968]) {
        for (let m = 1; m <= 12; m++) {
          const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
          for (let d = 1; d <= dim; d++) {
            const L = getVietnameseLunarDate({ year: y, month: m, day: d });
            const b = getVietnameseSolarDateFromLunar({ day: L.day, month: L.month, year: L.year, isLeapMonth: L.isLeapMonth });
            if (!(b.day === d && b.month === m && b.year === y)) fail++;
          }
        }
      }
      expect(fail).toBe(0);
    } finally {
      delete process.env.LUNAR_ENGINE;
    }
  });
});

describe("G10 round-trip (flag ON) — Dương→Âm→Dương đối xứng (P1-B)", () => {
  const dates: Array<[number, number, number]> = [
    [1965, 2, 2], [1968, 1, 29], [1968, 1, 30], [1969, 2, 17], [1972, 2, 15], [1975, 6, 13],
    [1988, 2, 17], [2001, 5, 23], [2004, 3, 21], [2006, 8, 24], [2009, 6, 23], [2014, 10, 24],
    [2017, 7, 23], [2031, 4, 22], [2034, 1, 1], [2034, 2, 19], [2060, 2, 2], [2085, 10, 19], [2000, 7, 15],
  ];
  it("không lệch ngày cho mọi mốc (kể cả 1969)", () => {
    process.env.LUNAR_ENGINE = "calendar-core";
    try {
      for (const [y, m, d] of dates) {
        const f = convertSolarToLunar({ day: d, month: m, year: y });
        const b = convertLunarToSolar({ day: f.am.day, month: f.am.month, year: f.am.year, isLeapMonth: f.am.isLeapMonth });
        expect(`${b.duong.day}/${b.duong.month}/${b.duong.year}`).toBe(`${d}/${m}/${y}`);
      }
    } finally {
      delete process.env.LUNAR_ENGINE;
    }
  });
});
