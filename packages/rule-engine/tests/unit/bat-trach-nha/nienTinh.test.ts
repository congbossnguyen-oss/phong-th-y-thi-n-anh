import { describe, expect, it } from "vitest";
import { tinhNienTinhHopMenh, SO_SAO_TOI_CUNG } from "../../../src/bat-trach-nha/nienTinh.js";

describe("bat-trach-nha — Niên Tinh hợp mệnh (ADDENDUM mục 2)", () => {
  it("8 số sao (trừ 5) đều quy đúng về 8 cung Lạc Thư chuẩn, khớp CUNG_INFO của engine phi tinh", () => {
    expect(SO_SAO_TOI_CUNG[1]).toBe("Khảm");
    expect(SO_SAO_TOI_CUNG[2]).toBe("Khôn");
    expect(SO_SAO_TOI_CUNG[3]).toBe("Chấn");
    expect(SO_SAO_TOI_CUNG[4]).toBe("Tốn");
    expect(SO_SAO_TOI_CUNG[6]).toBe("Càn");
    expect(SO_SAO_TOI_CUNG[7]).toBe("Đoài");
    expect(SO_SAO_TOI_CUNG[8]).toBe("Cấn");
    expect(SO_SAO_TOI_CUNG[9]).toBe("Ly");
    expect(SO_SAO_TOI_CUNG[5]).toBeUndefined();
  });

  it("sao trùng đúng cung bản mệnh -> Phục vị (cát, bình hòa) — kiểm nhất quán nội bộ với Du Niên", () => {
    // Mệnh Khảm (số 1) gặp năm Niên Tinh 1 nhập trung -> cùng cung Khảm -> Phục vị.
    const r = tinhNienTinhHopMenh("Khảm", 1);
    expect(r.apDung).toBe(true);
    if (r.apDung) {
      expect(r.tenKhi).toBe("Phục Vị");
      expect(r.hop).toBe(true);
    }
  });

  it("năm Ngũ Hoàng nhập trung (sao=5) -> không áp dụng, không suy diễn quy về Khôn/Cấn", () => {
    const r = tinhNienTinhHopMenh("Khảm", 5);
    expect(r.apDung).toBe(false);
    if (!r.apDung) {
      expect(r.ghiChu).toContain("Ngũ Hoàng");
    }
  });

  it("mệnh Khôn, sao 9 (Ly) nhập trung -> tra đúng Du Niên Khôn-Ly = Lục sát, không hợp (khớp ca mẫu SPEC)", () => {
    const r = tinhNienTinhHopMenh("Khôn", 9);
    expect(r.apDung).toBe(true);
    if (r.apDung) {
      expect(r.tenKhi).toBe("Lục Sát");
      expect(r.hop).toBe(false);
    }
  });
});
