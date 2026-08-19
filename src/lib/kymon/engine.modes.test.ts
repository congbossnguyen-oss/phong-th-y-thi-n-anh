import { describe, expect, it } from "vitest";
import { lapLaBan } from "./engine";

// TEST_6_che_do.md: cùng nhập 17:43 19/08/2026, chạy các chế độ Giờ/Mệnh/1080 (đang hỗ trợ
// chính thức — Ngày/Tháng/Năm tạm ngưng, xem README.md mục "Prompt 2").
const MOC = { nam: 2026, thang: 8, ngay: 19, gio: 17, phut: 43 };

describe("lapLaBan — 3 chế độ đang hỗ trợ: Giờ / Mệnh / 1080 (Prompt 2)", () => {
  it("mặc định (không truyền cheDo) = chế độ Giờ", () => {
    const macDinh = lapLaBan(MOC);
    const gio = lapLaBan({ ...MOC, cheDo: "gio" });
    expect(macDinh).toEqual(gio);
    expect(macDinh.cheDo).toBe("gio");
  });

  it("Mệnh (nhập giờ SINH) ra bàn 9 cung Y HỆT chế độ Giờ khi cùng thời điểm — đúng SPEC 6B", () => {
    const gio = lapLaBan({ ...MOC, cheDo: "gio" });
    const menh = lapLaBan({ ...MOC, cheDo: "menh" });
    expect(menh.cheDo).toBe("menh");
    expect(menh.cungList).toEqual(gio.cungList);
    expect(menh.trucPhu).toBe(gio.trucPhu);
    expect(menh.trucSu).toBe(gio.trucSu);
    expect(menh.phuDau).toBe(gio.phuDau);
    expect(menh.tuTru).toEqual(gio.tuTru);
  });

  it("chế độ Giờ (17:43 19/08/2026) khớp TEST_6_che_do.md: Trực Phù=Thiên Nhậm tại Khôn, Trực Sử=Sinh tại Đoài", () => {
    const r = lapLaBan({ ...MOC, cheDo: "gio" });
    expect(r.tuTru).toEqual({
      gio: { can: "Ất", chi: "Dậu" },
      ngay: { can: "Ất", chi: "Sửu" },
      thang: { can: "Bính", chi: "Thân" },
      nam: { can: "Bính", chi: "Ngọ" },
    });
    expect(r.cuc).toBe(1);
    expect(r.amDuong).toBe("-");
    expect(r.trucPhu).toBe("T.Nhậm");
    expect(r.trucPhuCung).toBe(2); // Khôn
    expect(r.trucSu).toBe("SINH");
    expect(r.trucSuCung).toBe(7); // Đoài
  });

  it("chế độ 1080: tự nhập cục+âm/dương+hoa giáp, bỏ qua tra lịch — khớp y hệt chế độ Giờ khi cùng dữ kiện (case1 SPEC mục 6)", () => {
    const gioMode = lapLaBan({ nam: 2026, thang: 7, ngay: 19, gio: 22, phut: 41 });
    const mode1080 = lapLaBan({ cheDo: "1080", soCuc: 7, amDuong: "-", hoaGiap: "Ất Hợi" });
    expect(mode1080.cheDo).toBe("1080");
    expect(mode1080.tuTru).toEqual({});
    expect(mode1080.trucPhu).toBe(gioMode.trucPhu);
    expect(mode1080.trucPhuCung).toBe(gioMode.trucPhuCung);
    expect(mode1080.trucSu).toBe(gioMode.trucSu);
    expect(mode1080.trucSuCung).toBe(gioMode.trucSuCung);
    expect(mode1080.cungList).toEqual(gioMode.cungList);
  });

  it("Ngày/Tháng/Năm tạm ngưng — báo lỗi rõ ràng thay vì âm thầm trả kết quả chưa xác nhận", () => {
    // @ts-expect-error cheDo "ngay"/"thang"/"nam" không còn nằm trong LapLaBanInputLich công khai.
    expect(() => lapLaBan({ ...MOC, cheDo: "ngay" })).toThrow(/tạm ngưng/);
    // @ts-expect-error như trên.
    expect(() => lapLaBan({ ...MOC, cheDo: "thang" })).toThrow(/tạm ngưng/);
    // @ts-expect-error như trên.
    expect(() => lapLaBan({ ...MOC, cheDo: "nam" })).toThrow(/tạm ngưng/);
  });
});
