import { describe, it, expect } from "vitest";
import { cannhacHomNay, laNgayLe, noiDungThongBao, tieuDeThongBao, ngayVietNam, canChiNamAm } from "./ngay-le-am-lich";
import { lunarToSolar, solarToLunar } from "../lunar-calendar";

describe("nhắc mùng Một / ngày Rằm", () => {
  it("Can Chi năm âm đúng với mốc đã biết", () => {
    expect(canChiNamAm(2026)).toBe("Bính Ngọ");
    expect(canChiNamAm(2025)).toBe("Ất Tỵ");
    expect(canChiNamAm(2024)).toBe("Giáp Thìn");
  });

  it("suốt năm 2026 chỉ nhận đúng ngày mùng 1 và 15 âm", () => {
    let soNgayLe = 0;
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 28; d++) {
        const g = { ngay: d, thang: m, nam: 2026 };
        const am = solarToLunar(d, m, 2026);
        const ketQua = laNgayLe(g);
        if (am.day === 1 || am.day === 15) {
          expect(ketQua, `${d}/${m} âm ${am.day}`).not.toBeNull();
          soNgayLe++;
        } else {
          expect(ketQua, `${d}/${m} âm ${am.day}`).toBeNull();
        }
      }
    }
    expect(soNgayLe).toBeGreaterThan(15); // ~24 ngày lễ/năm
  });

  it("kiểu 'bao-truoc' bắn đúng vào HÔM TRƯỚC ngày lễ", () => {
    // Rằm tháng 7 âm năm 2026 (lễ Vu Lan) — mốc dễ kiểm chứng.
    const ram = lunarToSolar(15, 7, 2026);
    const homTruoc = new Date(Date.UTC(ram.y, ram.m - 1, ram.d - 1));
    const g = { ngay: homTruoc.getUTCDate(), thang: homTruoc.getUTCMonth() + 1, nam: homTruoc.getUTCFullYear() };

    const le = cannhacHomNay(g, "bao-truoc");
    expect(le).not.toBeNull();
    expect(le!.loai).toBe("ram");
    expect(le!.am.ngay).toBe(15);
    expect(le!.duong).toEqual({ ngay: ram.d, thang: ram.m, nam: ram.y });
    // Chính ngày lễ thì kiểu "bao-truoc" KHÔNG được bắn (tránh gửi trùng hai hôm liền).
    expect(cannhacHomNay({ ngay: ram.d, thang: ram.m, nam: ram.y }, "bao-truoc")).toBeNull();
  });

  it("kiểu 'dung-hom-do' bắn đúng vào CHÍNH ngày lễ", () => {
    const mung1 = lunarToSolar(1, 8, 2026);
    const le = cannhacHomNay({ ngay: mung1.d, thang: mung1.m, nam: mung1.y }, "dung-hom-do");
    expect(le).not.toBeNull();
    expect(le!.loai).toBe("mung-mot");
    expect(le!.am.ngay).toBe(1);
  });

  it("lời nhắn đọc xuôi và không viết tắt", () => {
    const ram = lunarToSolar(15, 7, 2026);
    const le = cannhacHomNay({ ngay: ram.d, thang: ram.m, nam: ram.y }, "dung-hom-do")!;
    const noiDung = noiDungThongBao(le);
    console.log(`\n  Tiêu đề: ${tieuDeThongBao(le)}\n  Nội dung: ${noiDung}\n`);
    expect(noiDung).toContain("Quý bằng hữu nhớ lưu tâm chuyện thờ cúng");
    expect(noiDung).not.toMatch(/\b(ko|dc|đc|k)\b/);
  });

  it("ngayVietNam() lấy theo giờ Việt Nam chứ không theo giờ máy chủ UTC", () => {
    // 23:30 UTC ngày 5 = 06:30 sáng ngày 6 giờ Việt Nam (UTC+7).
    const g = ngayVietNam(new Date("2026-03-05T23:30:00Z"));
    expect(g).toEqual({ ngay: 6, thang: 3, nam: 2026 });
  });
});
