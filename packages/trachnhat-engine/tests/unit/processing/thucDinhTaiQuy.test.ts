import { describe, expect, it } from "vitest";
import { tinhThucDinhTaiQuy } from "../../../src/processing/thucDinhTaiQuy.js";

describe("trachnhat-engine/processing/thucDinhTaiQuy — 3 ví dụ đối chiếu gốc trong sách (README mục 'Ví dụ đối chiếu gốc')", () => {
  it("Tài: Càn sơn, ngày Nhâm Thân -> Chân Tài (kinh doanh thủy sản hưng thịnh)", () => {
    const r = tinhThucDinhTaiQuy({ sonName: "Càn", mucTieu: "tai", loaiTrach: "am" });
    expect(r.quaiSon).toBe("Càn");
    const nhanh = r.nhanh[0]!;
    expect(nhanh.boMa.some((cc) => cc.can === "Nhâm" && cc.chi === "Thân")).toBe(true);
  });

  it("Đinh: Tân sơn (thuộc Đoài) -> đối ứng công thức thúc Đinh lấy bộ mã của Cấn", () => {
    const r = tinhThucDinhTaiQuy({ sonName: "Tân", mucTieu: "dinh", loaiTrach: "am" });
    expect(r.quaiSon).toBe("Đoài");
    expect(r.nhanh[0]!.quaiDungDeTra).toBe("Cấn");
    expect(r.nhanh[0]!.boMa.every((cc) => cc.can === "Bính")).toBe(true);
  });

  it("Quý: Tốn sơn, ngày Đinh Sửu -> khớp bộ mã Đoài (tiên thiên trùng vị trí Tốn)", () => {
    const r = tinhThucDinhTaiQuy({ sonName: "Tốn", mucTieu: "quy", loaiTrach: "am" });
    expect(r.nhanh[0]!.quaiDungDeTra).toBe("Đoài");
    expect(r.nhanh[0]!.boMa.some((cc) => cc.can === "Đinh" && cc.chi === "Sửu")).toBe(true);
  });
});

describe("trachnhat-engine/processing/thucDinhTaiQuy — case Tài: Chân/Giả/Vô Tài", () => {
  it("quét 1 năm ra đủ cả Chân Tài lẫn Giả Tài cho Càn sơn", () => {
    const r = tinhThucDinhTaiQuy({
      sonName: "Càn",
      mucTieu: "tai",
      loaiTrach: "am",
      khoangThoiGian: { tuNgay: { nam: 2026, thang: 1, ngay: 1 }, denNgay: { nam: 2026, thang: 12, ngay: 31 } },
    });
    const nhanh = r.nhanh[0]!;
    expect(nhanh.ngayPhuHop.some((n) => n.phanLoaiTai === "chanTai")).toBe(true);
    expect(nhanh.ngayPhuHop.some((n) => n.phanLoaiTai === "giaTai")).toBe(true);
    // Vô Tài không được liệt vào ngayPhuHop (không phải ngày "phù hợp").
    expect(nhanh.ngayPhuHop.every((n) => n.phanLoaiTai !== "voTai")).toBe(true);
  });

  it("2026-01-08 = Nhâm Ngọ, Càn sơn -> Chân Tài (khớp đúng 1 trong 6 tổ)", () => {
    const r = tinhThucDinhTaiQuy({
      sonName: "Càn",
      mucTieu: "tai",
      loaiTrach: "am",
      khoangThoiGian: { tuNgay: { nam: 2026, thang: 1, ngay: 8 }, denNgay: { nam: 2026, thang: 1, ngay: 8 } },
    });
    const ngay = r.nhanh[0]!.ngayPhuHop[0]!;
    expect(ngay.canChiNgay).toBe("Nhâm Ngọ");
    expect(ngay.phanLoaiTai).toBe("chanTai");
  });

  it("2026-01-10 = Giáp Thân, Càn sơn -> Giả Tài (Can Giáp thuộc bộ nạp nhưng Chi không nằm trong 6 tổ)", () => {
    const r = tinhThucDinhTaiQuy({
      sonName: "Càn",
      mucTieu: "tai",
      loaiTrach: "am",
      khoangThoiGian: { tuNgay: { nam: 2026, thang: 1, ngay: 10 }, denNgay: { nam: 2026, thang: 1, ngay: 10 } },
    });
    const ngay = r.nhanh[0]!.ngayPhuHop[0]!;
    expect(ngay.canChiNgay).toBe("Giáp Thân");
    expect(ngay.phanLoaiTai).toBe("giaTai");
  });
});

describe("trachnhat-engine/processing/thucDinhTaiQuy — case Đinh và Quý (khớp nhị phân)", () => {
  it("Đinh: 2026-01-02 = Bính Tý khớp bộ mã Cấn (đối ứng của Tân sơn/Đoài)", () => {
    const r = tinhThucDinhTaiQuy({
      sonName: "Tân",
      mucTieu: "dinh",
      loaiTrach: "am",
      khoangThoiGian: { tuNgay: { nam: 2026, thang: 1, ngay: 2 }, denNgay: { nam: 2026, thang: 1, ngay: 2 } },
    });
    expect(r.nhanh[0]!.ngayPhuHop).toHaveLength(1);
    expect(r.nhanh[0]!.ngayPhuHop[0]!.canChiNgay).toBe("Bính Tý");
    // Đinh không có trường phanLoaiTai (chỉ khớp/không khớp nhị phân).
    expect(r.nhanh[0]!.ngayPhuHop[0]!.phanLoaiTai).toBeUndefined();
  });

  it("Quý: quái tiên thiên trùng vị trí của Tân sơn (Đoài) là Khảm", () => {
    const r = tinhThucDinhTaiQuy({ sonName: "Tân", mucTieu: "quy", loaiTrach: "am" });
    expect(r.nhanh[0]!.quaiDungDeTra).toBe("Khảm");
  });
});

describe("trachnhat-engine/processing/thucDinhTaiQuy — cờ cảnh báo biên giới quái", () => {
  it("độ số cách biên giới (bội số 22.5°) trong ±1° -> canhBaoBienGioi=true", () => {
    const r = tinhThucDinhTaiQuy({ toaDoSo: 23.3, mucTieu: "tai", loaiTrach: "am" });
    expect(r.canhBaoBienGioi).toBe(true);
  });

  it("độ số ở giữa lòng quái -> canhBaoBienGioi=false", () => {
    const r = tinhThucDinhTaiQuy({ toaDoSo: 10, mucTieu: "tai", loaiTrach: "am" });
    expect(r.canhBaoBienGioi).toBe(false);
    expect(r.quaiSon).toBe("Khảm");
  });
});

describe("trachnhat-engine/processing/thucDinhTaiQuy — ràng buộc output bắt buộc", () => {
  it("doTinCay luôn xuất hiện; ghiChuApDungDuongTrach CHỈ xuất hiện khi loaiTrach='duong'", () => {
    const am = tinhThucDinhTaiQuy({ sonName: "Càn", mucTieu: "tai", loaiTrach: "am" });
    expect(am.doTinCay).toBe("cong-thuc-da-kiem-chung");
    expect(am.ghiChuApDungDuongTrach).toBeUndefined();

    const duong = tinhThucDinhTaiQuy({ sonName: "Càn", mucTieu: "tai", loaiTrach: "duong" });
    expect(duong.doTinCay).toBe("cong-thuc-da-kiem-chung");
    expect(duong.ghiChuApDungDuongTrach).toBeDefined();
  });

  it("mucTieu='all' trả về 3 nhánh TÁCH RIÊNG, không gộp thành 1 danh sách chung", () => {
    const r = tinhThucDinhTaiQuy({ sonName: "Càn", mucTieu: "all", loaiTrach: "am" });
    expect(r.nhanh).toHaveLength(3);
    expect(r.nhanh.map((n) => n.mucTieuNhanh).sort()).toEqual(["dinh", "quy", "tai"]);
  });

  it("thiếu cả toaDoSo lẫn sonName -> báo lỗi rõ ràng, không tự đoán", () => {
    expect(() => tinhThucDinhTaiQuy({ mucTieu: "tai", loaiTrach: "am" } as any)).toThrow();
  });
});
