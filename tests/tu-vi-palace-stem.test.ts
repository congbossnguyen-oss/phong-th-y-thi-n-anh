// Test Can của 12 cung (Phase 2.1 theo yêu cầu audit fix) — dùng getPalaceStem(yearStem, palaceBranch)
// như spec §7 yêu cầu tường minh.
//
// QUAN TRỌNG: KHÔNG có Golden Master nào (cả TuVi_Engine_V2.md lẫn TuVi_Golden_Master_Pack_V1.md) cho
// giá trị Can-của-cung tường minh cho bất kỳ lá số nào — pack V1 chỉ liệt kê "Principal stars" theo
// Chi + tên cung, không có Can. Vì vậy các test dưới đây CHỈ kiểm tra tính TỰ NHẤT QUÁN (self-
// consistency) và các bất biến toán học của công thức (parity, uniqueness theo chu kỳ 60) — KHÔNG phải
// bằng chứng "đúng theo thực tế". Xác nhận độc lập vẫn ở trạng thái UNVERIFIED cho tới khi có ảnh lá số
// hiển thị rõ Can từng cung.
//
// Xác nhận GIÁN TIẾP duy nhất đang có: giá trị NGU_HO_DON["Canh"] (Mậu) được xác nhận gián tiếp qua Cục
// đúng ở GM-001/002/003 (nếu Can tại Dần sai, Nạp Âm/Cục sẽ không khớp Golden Master) — xem
// tests/tu-vi-golden.test.ts và tu-vi-golden-gm002-006.test.ts.

import { describe, expect, it } from "vitest";
import { getPalaceStem, tinhTuVi } from "../src/lib/tu-vi/engine";

const CAN_LIST = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];

describe("getPalaceStem — bất biến parity (Can-Chi hợp lệ theo chu kỳ Lục Thập Hoa Giáp)", () => {
  const CAN_INDEX: Record<string, number> = Object.fromEntries(CAN_LIST.map((c, i) => [c, i]));
  for (const can of CAN_LIST) {
    it(`Can năm ${can}: cả 12 cung đều cho Can-Chi hợp lệ (cùng tính chẵn/lẻ)`, () => {
      for (let chiIndex = 0; chiIndex < 12; chiIndex++) {
        const canName = getPalaceStem(can, chiIndex);
        const canIdx = CAN_INDEX[canName];
        expect(canIdx % 2).toBe(chiIndex % 2);
      }
    });
  }
});

describe("getPalaceStem — GM-001 (Canh Thân 1980): Can tại Dần gián tiếp VERIFIED qua Cục", () => {
  it("Can tại Dần = Mậu (đúng Ngũ Hổ Độn chuẩn: Ất/Canh khởi Mậu Dần) — xác nhận gián tiếp qua Cục=Thổ Ngũ", () => {
    expect(getPalaceStem("Canh", 2)).toBe("Mậu");
  });

  it("12 Can cung của GM-001, tự nhất quán với vị trí Mệnh/Thân/chính tinh đã có trong lá số thật", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    const expectedByChi: Record<string, string> = {
      Dần: "Mậu", Mão: "Kỷ", Thìn: "Canh", Tỵ: "Tân", Ngọ: "Nhâm", Mùi: "Quý",
      Thân: "Giáp", Dậu: "Ất", Tuất: "Bính", Hợi: "Đinh", Tý: "Mậu", Sửu: "Kỷ",
    };
    for (const cung of chart.cungs) {
      expect(cung.canName).toBe(expectedByChi[cung.chiName]);
    }
  });
});

describe("getPalaceStem — 12 cung phủ đủ cả 10 Can (2 cung trùng Can do 12 chi / 10 can không chia hết)", () => {
  for (const can of CAN_LIST) {
    it(`Can năm ${can}: 12 cung dùng đủ 10 Can khác nhau, đúng 2 cặp cung trùng Can (12 = 10 + 2)`, () => {
      const values = Array.from({ length: 12 }, (_, i) => getPalaceStem(can, i));
      const cans = new Set(values);
      expect(cans.size).toBe(10);
    });
  }
});
