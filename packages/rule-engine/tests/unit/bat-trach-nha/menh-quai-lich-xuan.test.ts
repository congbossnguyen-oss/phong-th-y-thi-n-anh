// V3-10 — MỆNH QUÁI BÁT TRẠCH THEO LẬP XUÂN (Decision A, boundary tests).
//
// Ranh giới đã xác nhận thực nghiệm (V3-05/V3-08): năm 2026 Lập Xuân ~04/02, Tết 17/02; năm 1990
// Tết 27/01 < Lập Xuân 04/02; năm 2005 Lập Xuân 04/02 < Tết 09/02. Giá trị Mệnh Quái kỳ vọng = công
// thức số-năm áp lên NĂM LẬP XUÂN hiệu dụng (đã đối chiếu với calculateCungPhi ở V3-08/V3-10).
//
// Import SOURCE cungPhi để thấy bản đã migrate; BirthDate từ calendar-core (dist).
import { describe, expect, it } from "vitest";
import {
  calculateCungPhiBatTrach,
  calculateCungPhi,
  BAT_TRACH_MENH_QUAI_YEAR,
} from "../../../src/cung-menh-bat-trach/cungPhi.js";
import { luanBatTrachToiThieu } from "../../../src/bat-trach-nha/engine.js";
import { birthDateFromGregorian, birthDateFromGregorianYear, BirthDatePrecisionError } from "@thien-anh/calendar-core";

const TZ = "Asia/Ho_Chi_Minh";
const bd = (y: number, m: number, d: number) => birthDateFromGregorian({ year: y, month: m, day: d, timeZone: TZ });

describe("Bát Trạch Mệnh Quái — khai báo contract Lập Xuân", () => {
  it("BAT_TRACH_MENH_QUAI_YEAR dùng đúng convention GANZHI_LICH_XUAN đã có ở V3-07B", () => {
    expect(BAT_TRACH_MENH_QUAI_YEAR).toEqual({ method: "bat-trach.cung-phi", convention: "GANZHI_LICH_XUAN" });
  });
});

describe("Bát Trạch Mệnh Quái — ca biên Lập Xuân (Nam & Nữ)", () => {
  // [nhãn, y, m, d, LX hiệu dụng, truocLapXuan, Nam, Nữ]
  const cases: [string, number, number, number, number, boolean, string, string][] = [
    ["ordinary giữa năm 1989-06-15", 1989, 6, 15, 1989, false, "Khôn", "Tốn"],
    ["1990-01-20 trước Lập Xuân", 1990, 1, 20, 1989, true, "Khôn", "Tốn"],
    ["1990-02-01 sau Tết(27/01) trước Lập Xuân(04/02)", 1990, 2, 1, 1989, true, "Khôn", "Tốn"],
    ["1990-02-10 sau Lập Xuân", 1990, 2, 10, 1990, false, "Khảm", "Cấn"],
    ["2005-02-06 sau Lập Xuân(04/02) trước Tết(09/02)", 2005, 2, 6, 2005, false, "Tốn", "Khôn"],
    ["2026-01-20 trước Lập Xuân", 2026, 1, 20, 2025, true, "Khôn", "Tốn"],
    ["2026-02-04 ~Lập Xuân (mặc định 12h → sau)", 2026, 2, 4, 2026, false, "Khảm", "Cấn"],
    ["2026-02-10 sau Lập Xuân trước Tết(17/02)", 2026, 2, 10, 2026, false, "Khảm", "Cấn"],
    ["2026-02-20 sau cả hai", 2026, 2, 20, 2026, false, "Khảm", "Cấn"],
  ];
  for (const [label, y, m, d, lx, truoc, nam, nu] of cases) {
    it(`${label} → LX=${lx}, Nam=${nam}, Nữ=${nu}`, () => {
      const kqNam = calculateCungPhiBatTrach(bd(y, m, d), "nam");
      const kqNu = calculateCungPhiBatTrach(bd(y, m, d), "nu");
      expect(kqNam.namLapXuan).toBe(lx);
      expect(kqNam.namDuongLich).toBe(y);
      expect(kqNam.truocLapXuan).toBe(truoc);
      expect(kqNam.quyUoc).toBe("Lập Xuân");
      expect(kqNam.cung).toBe(nam);
      expect(kqNu.cung).toBe(nu);
    });
  }
});

describe("Bát Trạch Mệnh Quái — thay đổi CÓ CHỦ Ý so với Gregorian thô (chỉ ở ca biên)", () => {
  it("1990-01-20: Lập Xuân=Khôn (LX 1989) KHÁC Gregorian thô=Khảm (năm 1990) — đây là thay đổi được duyệt", () => {
    expect(calculateCungPhiBatTrach(bd(1990, 1, 20), "nam").cung).toBe("Khôn"); // mới (Lập Xuân)
    expect(calculateCungPhi(1990, "nam")).toBe("Khảm"); // cũ (Gregorian thô) — hàm giữ nguyên cho module deferred
  });
  it("ngày sau Lập Xuân: Lập Xuân TRÙNG Gregorian (không đổi) — vd 1990-02-10 cả hai = Khảm", () => {
    expect(calculateCungPhiBatTrach(bd(1990, 2, 10), "nam").cung).toBe("Khảm");
    expect(calculateCungPhi(1990, "nam")).toBe("Khảm");
  });
});

describe("Bát Trạch Mệnh Quái — KHÔNG âm thầm chấp nhận năm-đơn (V3-09 Critical Input Rule)", () => {
  it("BirthDate chỉ có năm → ném BirthDatePrecisionError, KHÔNG bịa 1/1", () => {
    const yearOnly = birthDateFromGregorianYear(1990, TZ);
    expect(() => calculateCungPhiBatTrach(yearOnly, "nam")).toThrow(BirthDatePrecisionError);
  });
});

describe("luanBatTrachToiThieu — dùng Lập Xuân + phơi bày minh bạch (Decision F)", () => {
  it("ca biên 1990-01-20: cungMenh theo Lập Xuân + menhQuaiQuyUoc.truocLapXuan=true", () => {
    const ket = luanBatTrachToiThieu({ ngaySinh: { year: 1990, month: 1, day: 20 }, gioiTinh: "nam", huong: { kieu: "do", do: 180 } });
    expect(ket.cungMenh).toBe("Khôn");
    expect(ket.menhQuaiQuyUoc.quyUoc).toBe("Lập Xuân");
    expect(ket.menhQuaiQuyUoc.namLapXuan).toBe(1989);
    expect(ket.menhQuaiQuyUoc.namDuongLich).toBe(1990);
    expect(ket.menhQuaiQuyUoc.truocLapXuan).toBe(true);
  });
  it("ca thường 1989-06-15: truocLapXuan=false, namLapXuan=namDuongLich", () => {
    const ket = luanBatTrachToiThieu({ ngaySinh: { year: 1989, month: 6, day: 15 }, gioiTinh: "nam", huong: { kieu: "do", do: 180 } });
    expect(ket.menhQuaiQuyUoc.truocLapXuan).toBe(false);
    expect(ket.menhQuaiQuyUoc.namLapXuan).toBe(1989);
  });
});
