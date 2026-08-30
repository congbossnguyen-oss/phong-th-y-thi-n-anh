import { describe, expect, it } from "vitest";
import { kiemHoangTuyen, kiemBatSat, tinhHungSatDacBiet } from "../../../src/bat-trach-nha/hungSat.js";

describe("bat-trach-nha — Hoàng Tuyền + Bát Sát (data/05)", () => {
  it("Hoàng Tuyền áp dụng đúng ở sơn Khôn, kỵ Canh/Đinh", () => {
    const r = kiemHoangTuyen("Khôn");
    expect(r.apDung).toBe(true);
    expect(r.sonKy).toEqual(["Canh", "Đinh"]);
  });

  it("Hoàng Tuyền áp dụng đúng ở sơn Tốn, kỵ Ất/Bính (xử lý nghi vấn số liệu — xem GHI-CHU)", () => {
    const r = kiemHoangTuyen("Tốn");
    expect(r.apDung).toBe(true);
    expect(r.sonKy).toEqual(["Ất", "Bính"]);
  });

  it("Hoàng Tuyền KHÔNG áp dụng ở 12 Địa Chi (vd sơn Tý, Ngọ)", () => {
    expect(kiemHoangTuyen("Tý").apDung).toBe(false);
    expect(kiemHoangTuyen("Ngọ").apDung).toBe(false);
  });

  it("Bát Sát tra đúng đủ 8/8 cung theo data/05 mục 2", () => {
    expect(kiemBatSat("Khảm").sonPham).toBe("Thìn");
    expect(kiemBatSat("Càn").sonPham).toBe("Ngọ");
  });

  it("tổng hợp: hướng chọn nhanh Đông Bắc (sơn Cấn, 45°) -> Hoàng Tuyền áp dụng + Bát Sát tra ra Dần", () => {
    const r = tinhHungSatDacBiet(45);
    expect(r.hoangTuyen.apDung).toBe(true);
    expect(r.batSat.sonPham).toBe("Dần");
  });
});
