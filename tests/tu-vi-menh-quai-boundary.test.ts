// Regression test cho lỗi biên đã sửa (docs/TUVI_ENGINE_AUDIT.md mục E1.3): nhánh Nam trước năm 2000
// chỉ dùng `if (so <= 0)`, không xử lý `so > 9` — năm sinh tận "00" (1900, 1800) cho `so = 10`, không
// khớp bảng tra 1-9, trả về `undefined`. Đã sửa bằng 2 vòng lặp `while` đối xứng cho cả 2 nhánh.
//
// CHỈ kiểm tra hàm KHÔNG CRASH / KHÔNG trả undefined ở các mốc biên — KHÔNG khẳng định quái số cụ thể
// nào là "đúng" cho các năm 1800/1900/2000/2001/2021/2026 vì không có Golden Master độc lập nào xác
// nhận giá trị mong đợi cho các năm đó. Chỉ năm 1980 (GM-001/002) có Golden Master thật.

import { describe, expect, it } from "vitest";
import { tinhMenhQuai } from "../src/lib/tu-vi/rules";

const VALID_QUAI = new Set(["Khảm", "Khôn", "Chấn", "Tốn", "Càn", "Đoài", "Cấn", "Ly"]);
const BOUNDARY_YEARS = [1800, 1900, 2000, 2001, 2021, 2026];

describe("tinhMenhQuai — regression test biên năm '00' (mục E1.3)", () => {
  for (const year of BOUNDARY_YEARS) {
    for (const gender of ["Nam", "Nữ"] as const) {
      it(`năm ${year}, ${gender} — không trả undefined, luôn là 1 trong 8 quái hợp lệ`, () => {
        const result = tinhMenhQuai(year, gender);
        expect(result).toBeDefined();
        expect(VALID_QUAI.has(result)).toBe(true);
      });
    }
  }

  it("năm 1900, Nam — trước khi sửa sẽ ra so=10 (undefined); sau khi sửa phải là Khảm (so=1)", () => {
    // last2=0 -> sum=0 -> so = 10-0 = 10 -> while(so>9) so-=9 -> so=1 -> Khảm.
    expect(tinhMenhQuai(1900, "Nam")).toBe("Khảm");
  });

  it("năm 1800, Nam — cùng cơ chế biên như 1900 (last2=0)", () => {
    expect(tinhMenhQuai(1800, "Nam")).toBe("Khảm");
  });
});

describe("tinhMenhQuai — Golden Master thật (GM-001/GM-002, năm 1980)", () => {
  it("1980, Nam -> Khôn (VERIFIED, GM-001)", () => {
    expect(tinhMenhQuai(1980, "Nam")).toBe("Khôn");
  });
  it("1980, Nữ -> Tốn (VERIFIED, GM-002)", () => {
    expect(tinhMenhQuai(1980, "Nữ")).toBe("Tốn");
  });
});
