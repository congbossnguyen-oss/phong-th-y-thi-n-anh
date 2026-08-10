// Unit test cho module Quái Phản Ngâm (calculateFanYin) — CHỈ CẤP QUÁI, theo spec:
// "MODULE: QUÁI PHẢN NGÂM — LỤC HÀO, VERSION: 1.0".
//
// Không xét: địa chi từng hào, nạp giáp từng hào, hào phản ngâm, hào phục ngâm, phục ngâm,
// cát hung, luận đoán — module chỉ nhận diện Quái Phản Ngâm ở cấp quái (Thượng Quái/Hạ Quái).

import { describe, expect, it } from "vitest";
import { calculateFanYin } from "../src/lib/luc-hao";

describe("calculateFanYin — mapping 4 cặp đối quái phản ngâm", () => {
  it("Càn ↔ Tốn là phản ngâm (2 chiều)", () => {
    expect(calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Khảm" }, { upperTrigram: "Tốn", lowerTrigram: "Khảm" }).outerFanYin).toBe(true);
    expect(calculateFanYin({ upperTrigram: "Tốn", lowerTrigram: "Khảm" }, { upperTrigram: "Càn", lowerTrigram: "Khảm" }).outerFanYin).toBe(true);
  });

  it("Khảm ↔ Ly là phản ngâm (2 chiều)", () => {
    expect(calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Khảm" }, { upperTrigram: "Càn", lowerTrigram: "Ly" }).innerFanYin).toBe(true);
    expect(calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Ly" }, { upperTrigram: "Càn", lowerTrigram: "Khảm" }).innerFanYin).toBe(true);
  });

  it("Cấn ↔ Khôn là phản ngâm (2 chiều)", () => {
    expect(calculateFanYin({ upperTrigram: "Cấn", lowerTrigram: "Càn" }, { upperTrigram: "Khôn", lowerTrigram: "Càn" }).outerFanYin).toBe(true);
    expect(calculateFanYin({ upperTrigram: "Khôn", lowerTrigram: "Càn" }, { upperTrigram: "Cấn", lowerTrigram: "Càn" }).outerFanYin).toBe(true);
  });

  it("Chấn ↔ Đoài là phản ngâm (2 chiều)", () => {
    expect(calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Chấn" }, { upperTrigram: "Càn", lowerTrigram: "Đoài" }).innerFanYin).toBe(true);
    expect(calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Đoài" }, { upperTrigram: "Càn", lowerTrigram: "Chấn" }).innerFanYin).toBe(true);
  });
});

describe("calculateFanYin — phân loại 4 trường hợp", () => {
  it("A. Ngoại quái phản ngâm => type = 'outer'", () => {
    const r = calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Khảm" }, { upperTrigram: "Tốn", lowerTrigram: "Khảm" });
    expect(r.type).toBe("outer");
    expect(r.enabled).toBe(true);
    expect(r.label).toBe("Ngoại Quái Phản Ngâm");
    expect(r.innerFanYin).toBe(false);
    expect(r.outerFanYin).toBe(true);
  });

  it("B. Nội quái phản ngâm => type = 'inner'", () => {
    const r = calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Khảm" }, { upperTrigram: "Càn", lowerTrigram: "Ly" });
    expect(r.type).toBe("inner");
    expect(r.enabled).toBe(true);
    expect(r.label).toBe("Nội Quái Phản Ngâm");
    expect(r.innerFanYin).toBe(true);
    expect(r.outerFanYin).toBe(false);
  });

  it("C. Cả nội + ngoại phản ngâm => type = 'inner_outer'", () => {
    const r = calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Khảm" }, { upperTrigram: "Tốn", lowerTrigram: "Ly" });
    expect(r.type).toBe("inner_outer");
    expect(r.enabled).toBe(true);
    expect(r.label).toBe("Toàn Quái Phản Ngâm");
    expect(r.innerFanYin).toBe(true);
    expect(r.outerFanYin).toBe(true);
  });

  it("D. Không có phản ngâm => type = 'none'", () => {
    const r = calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Khảm" }, { upperTrigram: "Cấn", lowerTrigram: "Chấn" });
    expect(r.type).toBe("none");
    expect(r.enabled).toBe(false);
    expect(r.label).toBe("");
    expect(r.innerFanYin).toBe(false);
    expect(r.outerFanYin).toBe(false);
  });

  it("Output data giữ đúng nguyên bản upper/lower đầu vào (không suy diễn tên quẻ)", () => {
    const r = calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Khảm" }, { upperTrigram: "Càn", lowerTrigram: "Ly" });
    expect(r.originalUpper).toBe("Càn");
    expect(r.originalLower).toBe("Khảm");
    expect(r.changedUpper).toBe("Càn");
    expect(r.changedLower).toBe("Ly");
  });
});

describe("calculateFanYin — tích hợp qua lucHaoCastManual (quẻ không biến)", () => {
  it("Không có hào động => fanYin.enabled=false, type='none' (không tự động coi là Phản Ngâm)", async () => {
    const { lucHaoCastManual } = await import("../src/lib/luc-hao");
    // Bát Thuần Càn, không đánh dấu hào động nào => bien = null
    const cast = lucHaoCastManual([1, 1, 1, 1, 1, 1], [], { day: 10, month: 8, year: 2026, hour: 8, minute: 0 });
    expect(cast.bien).toBeNull();
    expect(cast.fanYin.enabled).toBe(false);
    expect(cast.fanYin.type).toBe("none");
  });
});
