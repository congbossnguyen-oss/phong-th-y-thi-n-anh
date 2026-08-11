// Test Tứ Hóa đủ 10 Thiên Can (Phase 2.2 theo yêu cầu audit fix).
//
// Phần 1: TU_HOA_TABLE (rules.ts) khớp transcription 1:1 với TuVi_Engine_V2.md §17 cho cả 10 Can — đây
// là kiểm tra KHÔNG cần Golden Master (so khớp với chính văn bản spec, phát hiện lỗi gõ/sai bảng).
//
// Phần 2: FIX regression (docs/TUVI_ENGINE_AUDIT.md mục E1.1) — với MỖI Can trong 10 Can, cả 4 sao
// Lộc/Quyền/Khoa/Kỵ đều phải được gắn nhãn `tuHoa` lên đúng StarInstance thật trong lá số (dù là chính
// tinh hay phụ tinh), KHÔNG được rơi mất bất kỳ nhãn nào. Trước khi sửa, 5/10 Can (Bính, Mậu, Kỷ, Tân,
// Nhâm) có ít nhất 1 nhãn trỏ tới phụ tinh (Văn Xương/Văn Khúc/Hữu Bật/Tả Phù) và bị rơi mất hoàn toàn.
//
// Test dùng năm sinh 1984-1993 (10 năm liên tiếp, mỗi năm 1 Can khác nhau) — chỉ để kiểm tra logic gắn
// nhãn hoạt động đúng cho MỌI Can, KHÔNG khẳng định đây là Golden Master (không có ảnh lá số tham chiếu
// cho các năm này).

import { describe, expect, it } from "vitest";
import { tinhTuVi, type TuViChart } from "../src/lib/tu-vi/engine";
import { TU_HOA_TABLE } from "../src/lib/tu-vi/rules";

const CAN_YEARS: [string, number][] = [
  ["Giáp", 1984], ["Ất", 1985], ["Bính", 1986], ["Đinh", 1987], ["Mậu", 1988],
  ["Kỷ", 1989], ["Canh", 1990], ["Tân", 1991], ["Nhâm", 1992], ["Quý", 1993],
];

describe("TU_HOA_TABLE — transcription khớp spec §17 cho đủ 10 Can", () => {
  const EXPECTED: Record<string, [string, string, string, string]> = {
    "Giáp": ["Liêm Trinh", "Phá Quân", "Vũ Khúc", "Thái Dương"],
    "Ất": ["Thiên Cơ", "Thiên Lương", "Tử Vi", "Thái Âm"],
    "Bính": ["Thiên Đồng", "Thiên Cơ", "Văn Xương", "Liêm Trinh"],
    "Đinh": ["Thái Âm", "Thiên Đồng", "Thiên Cơ", "Cự Môn"],
    "Mậu": ["Tham Lang", "Thái Âm", "Hữu Bật", "Thiên Cơ"],
    "Kỷ": ["Vũ Khúc", "Tham Lang", "Thiên Lương", "Văn Khúc"],
    "Canh": ["Thái Dương", "Vũ Khúc", "Thái Âm", "Thiên Đồng"],
    "Tân": ["Cự Môn", "Thái Dương", "Văn Khúc", "Văn Xương"],
    "Nhâm": ["Thiên Lương", "Tử Vi", "Tả Phù", "Vũ Khúc"],
    "Quý": ["Phá Quân", "Cự Môn", "Thái Âm", "Tham Lang"],
  };
  for (const [can, [loc, quyen, khoa, ky]] of Object.entries(EXPECTED)) {
    it(`Can ${can}: Lộc=${loc}, Quyền=${quyen}, Khoa=${khoa}, Kỵ=${ky}`, () => {
      expect(TU_HOA_TABLE[can]).toEqual({ loc, quyen, khoa, ky });
    });
  }
});

function findTuHoaTag(chart: TuViChart, starName: string): string | undefined {
  for (const cung of chart.cungs) {
    const ct = cung.chinhTinh.find((s) => s.name === starName);
    if (ct) return ct.tuHoa;
    const pt = cung.phuTinh.find((s) => s.name === starName);
    if (pt) return pt.tuHoa;
  }
  return undefined;
}

describe("FIX regression — Tứ Hóa gắn đúng lên StarInstance thật cho đủ 10 Can (mục E1.1)", () => {
  for (const [can, year] of CAN_YEARS) {
    it(`Can ${can} (năm ${year}): cả 4 nhãn Lộc/Quyền/Khoa/Kỵ đều gắn được lên 1 sao thật trong lá số`, () => {
      const chart = tinhTuVi({ day: 15, month: 6, year, hour: 11, gender: "Nam", viewingYear: 2026 });
      expect(chart.yearCanName).toBe(can);
      const expected = TU_HOA_TABLE[can];
      expect(findTuHoaTag(chart, expected.loc)).toBe("Lộc");
      expect(findTuHoaTag(chart, expected.quyen)).toBe("Quyền");
      expect(findTuHoaTag(chart, expected.khoa)).toBe("Khoa");
      expect(findTuHoaTag(chart, expected.ky)).toBe("Kỵ");
    });
  }

  it("Trước fix: Can Bính/Mậu/Kỷ/Tân/Nhâm có Hóa Khoa hoặc Hóa Kỵ trỏ tới phụ tinh (Văn Xương/Văn Khúc/Hữu Bật/Tả Phù)", () => {
    // Xác nhận đúng 5 Can này thực sự là những Can "nguy hiểm" (target là phụ tinh, không phải chính
    // tinh) — nếu fix không hoạt động, findTuHoaTag ở trên sẽ trả về undefined cho các Can này.
    const CHINH_TINH_14 = new Set([
      "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh",
      "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương", "Thất Sát", "Phá Quân",
    ]);
    const affected = Object.entries(TU_HOA_TABLE)
      .filter(([, v]) => [v.loc, v.quyen, v.khoa, v.ky].some((name) => !CHINH_TINH_14.has(name)))
      .map(([can]) => can)
      .sort();
    expect(affected).toEqual(["Bính", "Kỷ", "Mậu", "Nhâm", "Tân"].sort());
  });
});
