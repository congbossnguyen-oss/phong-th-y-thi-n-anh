import { describe, expect, it } from "vitest";
import { tinhDauThuChonNgay } from "../../../src/processing/dauThuChonNgay.js";

describe("trachnhat-engine/processing/dauThuChonNgay", () => {
  it("ví dụ đã kiểm chứng trong nguồn: nhà tọa Ngọ, ngày 18/9/2018 -> Tam Nguyên Thần Cách + 1 Phá Quân ở Tháng", () => {
    const result = tinhDauThuChonNgay({
      toaNha: "Ngọ",
      ngayGiamDinh: { nam: 2018, thang: 9, ngay: 18 },
      chiGio: "Sửu",
      timeZone: "Asia/Ho_Chi_Minh",
    });

    expect(result.sonDau.hanh).toBe("Hỏa");
    expect(result.gioHeadline).toEqual({ chiGio: "Sửu", tuChon: true });

    // Tứ Trụ đúng theo nguồn: Năm Mậu Tuất, Tháng Tân Dậu, Ngày Quý Sửu, Giờ Quý Sửu.
    expect(`${result.tuTru[0]!.can} ${result.tuTru[0]!.chi}`).toBe("Mậu Tuất");
    expect(`${result.tuTru[1]!.can} ${result.tuTru[1]!.chi}`).toBe("Tân Dậu");
    expect(`${result.tuTru[2]!.can} ${result.tuTru[2]!.chi}`).toBe("Quý Sửu");
    expect(`${result.tuTru[3]!.can} ${result.tuTru[3]!.chi}`).toBe("Quý Sửu");

    // Lục Thân từng trụ đúng theo bảng đối chiếu trong nguồn.
    expect(result.tuTru[0]!.vaiTro).toBe("Nguyên Thần"); // Năm: Mậu hóa Hỏa, đồng hành Sơn Đầu
    expect(result.tuTru[1]!.vaiTro).toBe("Phá Quân"); // Tháng: Tân hóa Thủy, khắc Sơn Đầu
    expect(result.tuTru[2]!.vaiTro).toBe("Nguyên Thần"); // Ngày: Quý hóa Hỏa
    expect(result.tuTru[3]!.vaiTro).toBe("Nguyên Thần"); // Giờ: Quý hóa Hỏa

    expect(result.cachCuc).toContain("Tam Nguyên Thần Cách");
    expect(result.soLuongVai["Nguyên Thần"]).toBe(3);
    expect(result.soLuongVai["Phá Quân"]).toBe(1);

    // Vòng Trường Sinh của Phá Quân (hóa khí Thủy) tại Chi Dậu (trụ Tháng) = Mộc Dục (nguồn đối chiếu).
    expect(result.tuTru[1]!.truongSinh).toBe("Mộc Dục");

    expect(result.canhBao.some((c) => c.includes("Phá Quân"))).toBe(true);
  });

  it("Sơn Đầu là 1 trong 4 sơn duy, không có toaDoSo -> thiếu dữ liệu về phương (không ảnh hưởng điểm)", () => {
    const result = tinhDauThuChonNgay({
      toaNha: "Cấn",
      ngayGiamDinh: { nam: 2018, thang: 9, ngay: 18 },
    });
    expect(result.sonDau.phuong).toBeNull();
    expect(result.thieuDuLieu.some((t) => t.includes("sơn duy"))).toBe(true);
  });

  it("12 giờ đề xuất được xếp hạng giảm dần theo điểm", () => {
    const result = tinhDauThuChonNgay({
      toaNha: "Ngọ",
      ngayGiamDinh: { nam: 2018, thang: 9, ngay: 18 },
    });
    expect(result.gioDeXuat).toHaveLength(12);
    for (let i = 1; i < result.gioDeXuat.length; i++) {
      expect(result.gioDeXuat[i]!.diem).toBeLessThanOrEqual(result.gioDeXuat[i - 1]!.diem);
    }
  });

  it("lớp lọc dân gian tùy chọn: 13/9/2026 (mùng 3 ÂL) -> phạm Tam Nương Sát", () => {
    const result = tinhDauThuChonNgay({
      toaNha: "Ngọ",
      ngayGiamDinh: { nam: 2026, thang: 9, ngay: 13 },
    });
    expect(result.amLich.ngay).toBe(3);
    const tamNuong = result.thanSatDanGian.find((t) => t.ten === "Tam Nương Sát");
    expect(tamNuong).toBeDefined();
    expect(tamNuong!.diem).toBeLessThan(0);
    expect(result.canhBao.some((c) => c.includes("Tam Nương Sát"))).toBe(true);
    expect(result.breakdown.some((b) => b.nhan.includes("Tam Nương Sát"))).toBe(true);
  });

  it("Tứ Tuyệt: khớp NGÀY TRƯỚC Lập Xuân theo giờ VN (UTC+7), không lệch theo mốc UTC — Lập Xuân 2026 rơi 3/2 19:54 UTC = 4/2 02:54 giờ VN, nên ngày trước là 3/2 chứ không phải 2/2", () => {
    const ngay2 = tinhDauThuChonNgay({ toaNha: "Ngọ", ngayGiamDinh: { nam: 2026, thang: 2, ngay: 2 } });
    expect(ngay2.thanSatDanGian.some((t) => t.ten === "Tứ Tuyệt")).toBe(false);
    const ngay3 = tinhDauThuChonNgay({ toaNha: "Ngọ", ngayGiamDinh: { nam: 2026, thang: 2, ngay: 3 } });
    expect(ngay3.thanSatDanGian.some((t) => t.ten === "Tứ Tuyệt")).toBe(true);
  });

  it("Thiên Khắc Địa Xung Ngày-Tháng: 14/9/2026 -> Tháng Đinh Dậu, Ngày Tân Mão (Đinh Hỏa khắc Tân Kim, Dậu xung Mão)", () => {
    const result = tinhDauThuChonNgay({ toaNha: "Ngọ", ngayGiamDinh: { nam: 2026, thang: 9, ngay: 14 }, chiGio: "Ngọ" });
    expect(`${result.tuTru[1]!.can} ${result.tuTru[1]!.chi}`).toBe("Đinh Dậu");
    expect(`${result.tuTru[2]!.can} ${result.tuTru[2]!.chi}`).toBe("Tân Mão");
    expect(result.thanSatDanGian.some((t) => t.ten === "Ngày-Tháng Thiên Khắc Địa Xung")).toBe(true);
  });

  it("muc xếp hạng khớp với điểm (rat_tot >= 80 > kha >= 30 > trung_binh >= 0 > nen_tranh)", () => {
    const result = tinhDauThuChonNgay({
      toaNha: "Ngọ",
      ngayGiamDinh: { nam: 2018, thang: 9, ngay: 18 },
      chiGio: "Sửu",
    });
    if (result.diem >= 80) expect(result.muc).toBe("rat_tot");
    else if (result.diem >= 30) expect(result.muc).toBe("kha");
    else if (result.diem >= 0) expect(result.muc).toBe("trung_binh");
    else expect(result.muc).toBe("nen_tranh");
  });
});

describe("trachnhat-engine/processing/dauThuChonNgayTimNgay", () => {
  it("quét 1 khoảng ngày, xếp hạng giảm dần theo điểm", async () => {
    const { timNgayDauThuChonNgay } = await import("../../../src/processing/dauThuChonNgayTimNgay.js");
    const result = timNgayDauThuChonNgay({
      toaNha: "Ngọ",
      tuNgay: { nam: 2018, thang: 9, ngay: 15 },
      denNgay: { nam: 2018, thang: 9, ngay: 25 },
    });
    expect(result.tongSoNgayQuet).toBe(11);
    expect(result.thongKe.ratTot + result.thongKe.kha + result.thongKe.trungBinh + result.thongKe.nenTranh).toBe(11);
    expect(result.ketQua.length).toBeGreaterThan(0);
    for (let i = 1; i < result.ketQua.length; i++) {
      expect(result.ketQua[i]!.diem).toBeLessThanOrEqual(result.ketQua[i - 1]!.diem);
    }
  });
});
