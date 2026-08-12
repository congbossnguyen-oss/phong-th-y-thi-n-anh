// Phase 41 — AN 12 NGUYỆT HẠN. Quy tắc + ví dụ gốc do Công cung cấp: Mệnh = Th1, đi NGHỊCH theo 12 địa
// chi thì cung kế tiếp = Th12, rồi Th11... cho tới Th2. Input duy nhất là vị trí cung Mệnh.

import { describe, expect, it } from "vitest";
import { tinhTuVi } from "../src/lib/tu-vi/engine";
import { getNguyetHan, nguyetHanLabel, nguyetHanMonth } from "../src/lib/tu-vi/nguyet-han";

const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

describe("12 Nguyệt Hạn — ví dụ gốc của Công: Mệnh tại Sửu", () => {
  // Bảng chép NGUYÊN VĂN từ ví dụ Công đưa, không suy diễn thêm.
  const EXPECTED: Record<string, number> = {
    "Sửu": 1, "Tý": 12, "Hợi": 11, "Tuất": 10, "Dậu": 9, "Thân": 8,
    "Mùi": 7, "Ngọ": 6, "Tỵ": 5, "Thìn": 4, "Mão": 3, "Dần": 2,
  };
  const menhSuu = 1;

  for (const [chiName, month] of Object.entries(EXPECTED)) {
    it(`${chiName} → Th${month}`, () => {
      expect(nguyetHanMonth(menhSuu, CHI.indexOf(chiName))).toBe(month);
      expect(nguyetHanLabel(menhSuu, CHI.indexOf(chiName))).toBe(`Th${month}`);
    });
  }
});

describe("12 Nguyệt Hạn — tính chất bất biến với mọi vị trí cung Mệnh", () => {
  for (let menh = 0; menh < 12; menh++) {
    it(`Mệnh tại ${CHI[menh]}: đủ 12 nhãn Th1..Th12, không trùng, không thiếu`, () => {
      const months = Array.from({ length: 12 }, (_, c) => nguyetHanMonth(menh, c));
      expect([...months].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it(`Mệnh tại ${CHI[menh]}: chính cung Mệnh luôn là Th1`, () => {
      expect(nguyetHanMonth(menh, menh)).toBe(1);
    });

    it(`Mệnh tại ${CHI[menh]}: đi NGHỊCH 1 cung từ Mệnh là Th12 (chiều nghịch, không phải thuận)`, () => {
      const nghich1 = ((menh - 1) % 12 + 12) % 12;
      expect(nguyetHanMonth(menh, nghich1)).toBe(12);
      // Đối chứng: đi THUẬN 1 cung phải là Th2 — nếu đảo chiều thì test này sẽ bắt được.
      const thuan1 = (menh + 1) % 12;
      expect(nguyetHanMonth(menh, thuan1)).toBe(2);
    });
  }
});

describe("12 Nguyệt Hạn — KHÔNG phụ thuộc tháng sinh âm lịch", () => {
  // Hai lá số cùng cung Mệnh nhưng KHÁC tháng sinh âm lịch phải cho cùng bảng Nguyệt Hạn. Đây là chốt
  // chặn quan trọng nhất: nếu ai đó sau này lỡ đưa lunarMonth vào công thức, test này fail ngay.
  it("Cùng cung Mệnh + khác tháng sinh → bảng Nguyệt Hạn giống hệt nhau", () => {
    const charts = [
      tinhTuVi({ day: 13, month: 8, year: 1996, hour: 11, gender: "Nam" }),
      tinhTuVi({ day: 31, month: 8, year: 1997, hour: 11, gender: "Nữ" }),
      tinhTuVi({ day: 4, month: 2, year: 2026, hour: 1, gender: "Nam" }),
    ];
    for (const chart of charts) {
      const table = getNguyetHan(chart);
      // Bảng chỉ phụ thuộc menhChiIndex — dựng lại từ mình menhChiIndex phải ra y hệt.
      const rebuilt = Array.from({ length: 12 }, (_, chiIndex) => ({
        chiIndex,
        month: nguyetHanMonth(chart.menhChiIndex, chiIndex),
        monthlyLabel: nguyetHanLabel(chart.menhChiIndex, chiIndex),
      }));
      expect(table).toEqual(rebuilt);
    }
  });

  it("getNguyetHan trả đúng 12 mục, sắp theo chiIndex tăng dần", () => {
    const chart = tinhTuVi({ day: 13, month: 8, year: 1996, hour: 11, gender: "Nam" });
    const table = getNguyetHan(chart);
    expect(table).toHaveLength(12);
    expect(table.map((t) => t.chiIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(table[chart.menhChiIndex].monthlyLabel).toBe("Th1");
  });
});
