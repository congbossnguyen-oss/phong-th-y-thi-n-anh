import { describe, expect, it } from "vitest";
import {
  boMaCuaQuai,
  khopDinhQuy,
  phanLoaiTai,
  quaiDungDeTraBoMa,
  quaiTuDoSo,
  quaiTuTenSon,
} from "../../../src/thuc-dinh-tai-quy/index.js";

describe("rule-engine/thuc-dinh-tai-quy — Bước A: xác định quái", () => {
  it("từ tên sơn — tra thẳng sonList trong nap-giap-tien-thien.json", () => {
    expect(quaiTuTenSon("Càn")).toBe("Càn");
    expect(quaiTuTenSon("Tân")).toBe("Đoài");
    expect(quaiTuTenSon("Nhâm")).toBe("Khảm");
  });

  it("từ độ số — trong lòng quái thì không cảnh báo biên giới", () => {
    expect(quaiTuDoSo(10)).toEqual({ quai: "Khảm", canhBaoBienGioi: false });
    expect(quaiTuDoSo(350)).toEqual({ quai: "Khảm", canhBaoBienGioi: false });
  });

  it("từ độ số — cách biên giới quái (bội số 22.5°) trong ±1° -> canhBaoBienGioi=true, KHÔNG tự chọn bừa", () => {
    const tren = quaiTuDoSo(23.3);
    const duoi = quaiTuDoSo(21.7);
    expect(tren.canhBaoBienGioi).toBe(true);
    expect(duoi.canhBaoBienGioi).toBe(true);
    expect(tren.quai).toBe("Cấn");
    expect(duoi.quai).toBe("Khảm");
  });
});

describe("rule-engine/thuc-dinh-tai-quy — Bước B: quái dùng để tra bộ mã theo mục tiêu", () => {
  it("tai -> giữ nguyên quái sơn", () => {
    expect(quaiDungDeTraBoMa("Càn", "tai")).toBe("Càn");
  });
  it("dinh -> quái chính phối đối ứng (Đoài <-> Cấn)", () => {
    expect(quaiDungDeTraBoMa("Đoài", "dinh")).toBe("Cấn");
    expect(quaiDungDeTraBoMa("Cấn", "dinh")).toBe("Đoài");
  });
  it("quy -> quái tiên thiên trùng vị trí (Tốn -> Đoài, theo ví dụ gốc trong sách)", () => {
    expect(quaiDungDeTraBoMa("Tốn", "quy")).toBe("Đoài");
  });
});

describe("rule-engine/thuc-dinh-tai-quy — Bước C: phân loại Chân/Giả/Vô Tài", () => {
  it("Chân Tài: Càn sơn, ngày Nhâm Thân (ví dụ gốc sách, kinh doanh thủy sản hưng thịnh)", () => {
    expect(phanLoaiTai("Nhâm", "Thân", "Càn")).toBe("chanTai");
  });
  it("Giả Tài: Can khớp bộ nạp của quái nhưng Chi không nằm trong 6 tổ", () => {
    // Càn nạp Giáp/Nhâm; Nhâm Dần không nằm trong 6 tổ boMaCanChi của Càn (chỉ có Nhâm Ngọ/Thân/Tuất).
    expect(phanLoaiTai("Nhâm", "Dần", "Càn")).toBe("giaTai");
  });
  it("Vô Tài: Can không thuộc bộ nạp giáp của quái", () => {
    expect(phanLoaiTai("Ất", "Sửu", "Càn")).toBe("voTai");
  });
});

describe("rule-engine/thuc-dinh-tai-quy — Đinh/Quý: khớp nhị phân, không có Chân/Giả", () => {
  it("Quý ví dụ gốc sách: Tân sơn Càn hướng (Tốn) + ngày Đinh Sửu -> khớp bộ mã Đoài", () => {
    const boMa = boMaCuaQuai(quaiDungDeTraBoMa("Tốn", "quy"));
    expect(khopDinhQuy("Đinh", "Sửu", boMa)).toBe(true);
  });
  it("Đinh ví dụ gốc sách: Tân sơn (Đoài) -> bộ mã Cấn phải đúng 6 tổ nạp Bính", () => {
    const boMa = boMaCuaQuai(quaiDungDeTraBoMa("Đoài", "dinh"));
    expect(boMa.every((cc) => cc.can === "Bính")).toBe(true);
    expect(boMa).toHaveLength(6);
  });
});
