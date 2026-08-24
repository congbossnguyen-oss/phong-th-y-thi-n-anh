import { beforeAll, describe, expect, it } from "vitest";
import { lapLaBan } from "./engine";
import type { LapLaBanResult } from "./types";

// Lá bàn mẫu SPEC_cho_Claude_Code.md mục 6: 22:41 ngày 19/07/2026 (dương lịch).
// Một số ô sao Thiên Bàn trong lá mẫu được chính Công đánh dấu "Thiên ?" (chưa chắc chắn
// từ ảnh chụp) — các ô đó KHÔNG được assert ở đây, chỉ assert những gì lá mẫu ghi rõ.
describe("lapLaBan — chế độ Giờ (Prompt 1)", () => {
  let result: LapLaBanResult;
  beforeAll(async () => {
    result = await lapLaBan({ nam: 2026, thang: 7, ngay: 19, gio: 22, phut: 41 });
  });

  it("tứ trụ khớp lá mẫu", () => {
    expect(result.tuTru.gio).toEqual({ can: "Ất", chi: "Hợi" });
    expect(result.tuTru.ngay).toEqual({ can: "Giáp", chi: "Ngọ" });
    expect(result.tuTru.thang).toEqual({ can: "Ất", chi: "Mùi" });
    expect(result.tuTru.nam).toEqual({ can: "Bính", chi: "Ngọ" });
  });

  it("cục, âm dương, phù đầu khớp lá mẫu", () => {
    expect(result.cuc).toBe(7);
    expect(result.amDuong).toBe("-");
    expect(result.phuDau).toBe("Kỷ");
  });

  it("Trực Phù = sao Thiên Tâm tại Cấn (cung 8), Trực Sử = Khai môn tại Khôn (cung 2)", () => {
    expect(result.trucPhu).toBe("T.Tâm");
    expect(result.trucPhuCung).toBe(8);
    expect(result.trucSu).toBe("KHAI");
    expect(result.trucSuCung).toBe(2);
  });

  function cung(so: number) {
    const c = result.cungList.find((x) => x.soCung === so);
    if (!c) throw new Error(`Thiếu cung ${so}`);
    return c;
  }

  it("Cấn (cung 8, ĐB) — đầy đủ vì là cung Trực Phù", () => {
    const c = cung(8);
    expect(c.saoThienBan).toBe("T.Tâm");
    expect(c.mon).toBe("ĐỖ");
    expect(c.than).toBe("T.Phù");
    expect(c.diaBanCan).toBe("Ất");
    expect(c.thienBanCan).toBe("Kỷ");
  });

  it("Khôn (cung 2, TN) — đầy đủ vì là cung Trực Sử", () => {
    const c = cung(2);
    expect(c.saoThienBan).toBe("T.Phò"); // Thiên Phụ
    expect(c.mon).toBe("KHAI");
    expect(c.than).toBe("B.Hổ"); // Bạch Hổ
    expect(c.diaBanCan).toBe("Quý");
  });

  it("Càn (cung 6, TB) — công thức Địa Bàn mới (SPEC 5B) giải ra Kỷ, khớp nhãn phụ '+Kỷ' trong lá mẫu (không phải 'Đinh' như dòng chính — xem README)", () => {
    const c = cung(6);
    expect(c.saoThienBan).toBe("T.Nhuế"); // Thiên Nhuế
    expect(c.mon).toBe("SINH");
    expect(c.than).toBe("T.Âm"); // Thái Âm
    expect(c.diaBanCan).toBe("Kỷ");
  });

  it("4 cung còn lại (môn + thần + diaBanCan, bỏ qua sao 'Thiên ?')", () => {
    const tonCung4 = cung(4); // Tốn, ĐN
    expect(tonCung4.mon).toBe("TỬ");
    expect(tonCung4.than).toBe("C.Địa"); // Cửu Địa
    expect(tonCung4.diaBanCan).toBe("Tân");

    const lyCung9 = cung(9); // Ly, N
    expect(lyCung9.mon).toBe("KINH");
    expect(lyCung9.than).toBe("H.Vũ"); // Huyền Vũ
    expect(lyCung9.diaBanCan).toBe("Bính");

    const chanCung3 = cung(3); // Chấn, Đ
    expect(chanCung3.mon).toBe("CẢNH");
    expect(chanCung3.than).toBe("C.Thiên"); // Cửu Thiên
    expect(chanCung3.diaBanCan).toBe("Nhâm");

    const doaiCung7 = cung(7); // Đoài, T
    expect(doaiCung7.mon).toBe("HƯU");
    expect(doaiCung7.than).toBe("L.Hợp"); // Lục Hợp
    expect(doaiCung7.diaBanCan).toBe("Mậu");

    const khamCung1 = cung(1); // Khảm, B
    expect(khamCung1.mon).toBe("THƯƠNG");
    expect(khamCung1.than).toBe("Đ.Xà"); // Đằng Xà
    expect(khamCung1.diaBanCan).toBe("Đinh");
  });
});
