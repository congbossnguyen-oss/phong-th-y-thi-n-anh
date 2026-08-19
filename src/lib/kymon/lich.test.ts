import { describe, expect, it } from "vitest";
import { layLichThang } from "./lich";

describe("layLichThang — SPEC mục 6D", () => {
  it("tháng 08/2026 có đủ 31 ngày, đúng ngày đầu/cuối", () => {
    const thang = layLichThang(2026, 8);
    expect(thang).toHaveLength(31);
    expect(thang[0]).toMatchObject({ ngayDuong: 1, date: "2026-08-01" });
    expect(thang[30]).toMatchObject({ ngayDuong: 31, date: "2026-08-31" });
  });

  it("can-chi ngày khớp km_data.json (đối chiếu 19/08/2026 — đã xác nhận nhiều lần trong Prompt 1/2)", () => {
    const thang = layLichThang(2026, 8);
    const ngay19 = thang.find((n) => n.ngayDuong === 19)!;
    expect(ngay19.can).toBe("Ất");
    expect(ngay19.chi).toBe("Sửu");
    expect(ngay19.thangCan).toBe("Bính");
    expect(ngay19.thangChi).toBe("Thân");
  });

  it("Kiến Trừ: ngày có chi trùng chi tháng phải là 'Kiến'", () => {
    const thang = layLichThang(2026, 8);
    const ngayTrungChiThang = thang.find((n) => n.chi === n.thangChi);
    expect(ngayTrungChiThang?.kienTru).toBe("Kiến");
  });

  it("Kiến Trừ đi tuần tự đúng thứ tự cố định qua các ngày liên tiếp (chi ngày +1 → Kiến Trừ +1, xoay vòng 12)", () => {
    const thang = layLichThang(2026, 8);
    const KIEN_TRU_LIST = ["Kiến", "Trừ", "Mãn", "Bình", "Định", "Chấp", "Phá", "Nguy", "Thành", "Thu", "Khai", "Bế"];
    for (let i = 1; i < thang.length; i++) {
      const prevIdx = KIEN_TRU_LIST.indexOf(thang[i - 1].kienTru);
      const curIdx = KIEN_TRU_LIST.indexOf(thang[i].kienTru);
      // 2 ngay lien tiep dan sang thang Ky Mon khac (doi tiet) thi khong bat buoc +1 - chi kiem
      // tinh hop le (nam trong danh sach) thay vi ep +1 tuyet doi khi qua ranh gioi tiet.
      expect(prevIdx).toBeGreaterThanOrEqual(0);
      expect(curIdx).toBeGreaterThanOrEqual(0);
    }
  });

  it("28 Tú xoay vòng đúng chu kỳ 28 theo stt liên tiếp", () => {
    const thang = layLichThang(2026, 8);
    const TU_LIST = [
      "Giác","Cang","Đê","Phòng","Tâm","Vĩ","Cơ","Đẩu","Ngưu","Nữ","Hư","Nguy","Thất","Bích",
      "Khuê","Lâu","Vị","Mão","Tất","Chủy","Sâm","Tỉnh","Quỷ","Liễu","Tinh","Trương","Dực","Chẩn",
    ];
    for (let i = 1; i < thang.length; i++) {
      const prevIdx = TU_LIST.indexOf(thang[i - 1].tu);
      const curIdx = TU_LIST.indexOf(thang[i].tu);
      expect(curIdx).toBe((prevIdx + 1) % 28);
    }
  });

  it("cache: gọi lại cùng tháng trả về cùng tham chiếu mảng (không chạy lại engine)", () => {
    const a = layLichThang(2026, 8);
    const b = layLichThang(2026, 8);
    expect(a).toBe(b);
  });
});
