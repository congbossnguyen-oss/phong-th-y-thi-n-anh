// Phase 31 — NATAL CORE LOCK & FREEZE: test bảo vệ (không mutate) + snapshot baseline cho GM-001→006.
// Đây KHÔNG phải test rule mới — chỉ đóng băng hành vi hiện tại để phát hiện regression trong tương lai.
// Nếu snapshot lệch ở lần chạy sau mà KHÔNG có Phase Change Request đi kèm (docs/TUVI_NATAL_CORE_LOCK.md),
// đó là dấu hiệu Natal Core đã bị sửa ngoài quy trình.

import { describe, expect, it } from "vitest";
import { tinhTuVi, getPalace, getStar, type TuViChart } from "../src/lib/tu-vi/engine";
import { toJsonContract } from "../src/lib/tu-vi/json-contract";

const GM_CASES: [string, Parameters<typeof tinhTuVi>[0]][] = [
  ["GM-001", { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam", viewingYear: 2026 }],
  ["GM-002", { day: 31, month: 8, year: 1980, hour: 11, gender: "Nữ", viewingYear: 2026 }],
  ["GM-003", { day: 25, month: 8, year: 1990, hour: 11, gender: "Nam", viewingYear: 2026 }],
  ["GM-004", { day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ", viewingYear: 2026 }],
  ["GM-005", { day: 25, month: 8, year: 1997, hour: 0, gender: "Nam", viewingYear: 2026 }],
  ["GM-006", { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam", viewingYear: 2026 }],
];

// Trích 1 bản tóm tắt "đóng băng được" từ TuViChart — đủ các field mục V yêu cầu (Calendar, 4 trụ, Mệnh,
// Thân, 12 cung, Can 12 cung, Cục, Tử Vi, Thiên Phủ, 14 chính tinh, status, Tứ Hóa, Tuần, Triệt, Đại Vận,
// phụ tinh, vòng sao) — KHÔNG lấy field runtime-only (không có, vì input cố định nên chart tự nhất quán).
function freezeSnapshot(chart: TuViChart) {
  return {
    calendar: {
      lunar: `${chart.lunarDay}/${chart.lunarMonth}${chart.lunarIsLeap ? "n" : ""}/${chart.lunarYear}`,
      yearCanChi: `${chart.yearCanName} ${chart.yearChiName}`,
      yearPillar: chart.yearPillar,
      monthPillar: chart.monthPillar,
      dayPillar: chart.dayPillar,
      hourPillar: chart.hourPillar,
    },
    menhThan: {
      amDuongNam: chart.amDuongNam,
      menhChiIndex: chart.menhChiIndex,
      thanChiIndex: chart.thanChiIndex,
      menhQuai: chart.menhQuai,
      chuMenh: chart.chuMenh,
      chuThan: chart.chuThan,
    },
    cuc: { cucName: chart.cucName, cucSo: chart.cucSo, banMenhNapAm: chart.banMenhNapAm },
    tuHoa: chart.tuHoa,
    cungs: chart.cungs.map((c) => ({
      chi: c.chiName,
      can: c.canName,
      cung: c.cungName,
      isMenh: c.isMenh,
      isThan: c.isThan,
      chinhTinh: c.chinhTinh.map((s) => `${s.name}(${s.trangThai})${s.tuHoa ? "+" + s.tuHoa : ""}`),
      phuTinh: c.phuTinh.map((s) => `${s.name}${s.tuHoa ? "+" + s.tuHoa : ""}`),
      trangSinh: c.trangSinh,
      thaiTue: c.thaiTue,
      daiVanTuoi: c.daiVanTuoi,
      tuan: c.tuan,
      triet: c.triet,
    })),
  };
}

describe("Phase 31 — Regression snapshot baseline (GM-001 → GM-006)", () => {
  for (const [label, input] of GM_CASES) {
    it(`${label}: đóng băng toàn bộ Natal Core output (Calendar/4 trụ/Mệnh/Thân/Cục/12 cung/Can cung/14 chính tinh/status/Tứ Hóa/Tuần/Triệt/Đại Vận/phụ tinh/vòng sao)`, () => {
      const chart = tinhTuVi(input);
      expect(freezeSnapshot(chart)).toMatchSnapshot();
    });
  }
});

describe("Phase 31 — READ_ONLY_NATAL_INPUT: adapter/helper không mutate chart gốc", () => {
  it("toJsonContract() không mutate chart, kể cả gọi nhiều lần liên tiếp", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    const before = JSON.stringify(chart);
    toJsonContract(chart);
    toJsonContract(chart);
    toJsonContract(chart);
    expect(JSON.stringify(chart)).toBe(before);
  });

  it("getPalace()/getStar() không mutate chart, kể cả gọi nhiều lần liên tiếp", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    const before = JSON.stringify(chart);
    getPalace(chart, "Dần");
    getStar(chart, "Dần", "Liêm Trinh");
    getPalace(chart, "Ngọ");
    expect(JSON.stringify(chart)).toBe(before);
  });

  it("Đọc kết quả toJsonContract() nhiều lần cho cùng 1 chart phải cho kết quả GIỐNG HỆT NHAU (thuần túy, không random/side-effect)", () => {
    const chart = tinhTuVi({ day: 4, month: 2, year: 2026, hour: 2, gender: "Nam" });
    const json1 = toJsonContract(chart);
    const json2 = toJsonContract(chart);
    expect(json1).toEqual(json2);
  });
});

describe("Phase 31 — Test baseline count (KHÔNG được giảm PASS, KHÔNG được tăng EXPECTED_FAIL nếu không có Phase Change Request)", () => {
  it("Ghi nhận baseline chính thức: 716 PASS + 5 EXPECTED_FAIL = 721 tổng, tính TRƯỚC khi thêm các test của chính Phase 31 này", () => {
    // Đây là tài liệu hóa con số baseline đã chốt ở docs/TUVI_NATAL_CORE_BASELINE.md — bản thân assertion
    // này luôn true, mục đích là để baseline có 1 nơi neo lại trong test suite, dễ tìm khi audit sau này.
    const NATAL_CORE_BASELINE = { pass: 716, expectedFail: 5, total: 721 };
    expect(NATAL_CORE_BASELINE.pass + NATAL_CORE_BASELINE.expectedFail).toBe(NATAL_CORE_BASELINE.total);
  });
});
