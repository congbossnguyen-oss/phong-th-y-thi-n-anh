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

  it("Bát Sát tra đúng đủ 8/8 TRẠCH (tọa) theo khẩu quyết con giáp — data/05 mục 2", () => {
    // "Khảm long, Khôn thỏ, Chấn sơn hầu, Tốn kê, Càn mã, Đoài xà đầu, Cấn hổ, Ly trư".
    expect(kiemBatSat("Khảm").sonPham).toBe("Thìn"); // long
    expect(kiemBatSat("Khôn").sonPham).toBe("Mão"); // thỏ
    expect(kiemBatSat("Chấn").sonPham).toBe("Thân"); // hầu
    expect(kiemBatSat("Tốn").sonPham).toBe("Dậu"); // kê
    expect(kiemBatSat("Càn").sonPham).toBe("Ngọ"); // mã
    expect(kiemBatSat("Đoài").sonPham).toBe("Tỵ"); // xà
    expect(kiemBatSat("Cấn").sonPham).toBe("Dần"); // hổ
    expect(kiemBatSat("Ly").sonPham).toBe("Hợi"); // trư
  });

  it("Bát Sát theo TỌA: nhà tọa Bắc (Khảm) hướng Nam (180°) -> Bát Sát tại Thìn (ca anh Công đính chính 30/8/2026)", () => {
    // Trước đây tra nhầm theo HƯỚNG (Ly/Nam -> Hợi) là NGƯỢC. Đúng: theo TỌA (Khảm/Bắc) -> Thìn.
    const r = tinhHungSatDacBiet(180);
    expect(r.batSat.cungToa).toBe("Khảm");
    expect(r.batSat.sonPham).toBe("Thìn");
  });

  it("tổng hợp hướng Đông Bắc (45°, tọa Tây Nam/Khôn) -> Hoàng Tuyền theo HƯỚNG (sơn Cấn, áp dụng) + Bát Sát theo TỌA (Khôn -> Mão) + Kiếp Sát theo TỌA sơn (Khôn -> Ất)", () => {
    const r = tinhHungSatDacBiet(45);
    expect(r.hoangTuyen.apDung).toBe(true);
    expect(r.batSat.cungToa).toBe("Khôn");
    expect(r.batSat.sonPham).toBe("Mão");
    // Tọa 225° = sơn Khôn -> Kiếp Sát Ất (bảng anh Công).
    expect(r.kiepSat.sonToa).toBe("Khôn");
    expect(r.kiepSat.sonKiepSat).toBe("Ất");
  });
});
