import { describe, expect, it } from "vitest";
import { doToCung, doToSon, huongToToa, canhBaoLapHuong, chuanHoaDo, HUONG_8_TOI_CUNG } from "../../../src/bat-trach-nha/toaHuong.js";

describe("bat-trach-nha — quy đổi độ số (data/03)", () => {
  it("chuẩn hóa độ về [0,360)", () => {
    expect(chuanHoaDo(370)).toBe(10);
    expect(chuanHoaDo(-10)).toBe(350);
    expect(chuanHoaDo(360)).toBe(0);
  });

  it("cung Khảm bắc qua mốc 0° — 0°, 340°, 20° đều thuộc Khảm", () => {
    expect(doToCung(0)).toBe("Khảm");
    expect(doToCung(340)).toBe("Khảm");
    expect(doToCung(20)).toBe("Khảm");
  });

  it("8 hướng chọn nhanh quy đúng về cung tương ứng qua độ trung tâm", () => {
    for (const [huong, cung] of Object.entries(HUONG_8_TOI_CUNG)) {
      // Kiểm gián tiếp qua bảng độ trung tâm đã dùng trong doTuDauVaoHuong, đối chiếu doToCung.
      const doTrungTam: Record<string, number> = { Bắc: 0, "Đông Bắc": 45, Đông: 90, "Đông Nam": 135, Nam: 180, "Tây Nam": 225, Tây: 270, "Tây Bắc": 315 };
      expect(doToCung(doTrungTam[huong]!)).toBe(cung);
    }
  });

  it("Tọa = Hướng + 180°, đóng vòng đúng", () => {
    expect(huongToToa(30)).toBe(210);
    expect(huongToToa(230)).toBe(50);
  });

  it("24 sơn: Tý ở đúng khoảng 352.5-7.5, Cấn ở đúng 45°", () => {
    expect(doToSon(0)).toBe("Tý");
    expect(doToSon(355)).toBe("Tý");
    expect(doToSon(45)).toBe("Cấn");
  });

  it("cảnh báo 4 chính hướng tuyệt đối (0/90/180/270)", () => {
    expect(canhBaoLapHuong(0).chinhHuongTuyetDoi).toBe(true);
    expect(canhBaoLapHuong(90).chinhHuongTuyetDoi).toBe(true);
    expect(canhBaoLapHuong(45).chinhHuongTuyetDoi).toBe(false);
  });

  it("cảnh báo ranh giới không vong (đúng mốc 22.5°, 67.5°...)", () => {
    expect(canhBaoLapHuong(22.5).ranhGioiKhongVong).toBe(true);
    expect(canhBaoLapHuong(45).ranhGioiKhongVong).toBe(false);
  });
});
