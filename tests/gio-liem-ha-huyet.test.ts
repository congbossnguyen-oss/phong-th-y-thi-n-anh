// Test khoá hành vi module THU PHÍ "Chọn giờ liệm – đóng quan – ngày giờ hạ huyệt".
//
// Nguồn đối chiếu: `spec-module-chon-ngay-gio-tang-le.md` (mục 14 "Test case đã kiểm chứng") và
// `bang-du-lieu-hop-nhat.json` (`hang_so`, `chuong_phap.quy_luat_bat_bien`,
// `chon_gio_liem.moc_chuyen_ngay`) do chủ dự án cung cấp.
//
// ⚠️ Đặc tả gốc có 2 mâu thuẫn NỘI TẠI đã phát hiện khi viết test — không tự ý chọn bên nào cho
// êm, mà khoá đúng hành vi hiện tại kèm ghi chú để chủ dự án chốt (xem chi tiết ở từng `it`):
//   (1) Công thức Cung_Giờ: mục 6 (đếm step từ giờ mất) khớp ca B nhưng sai ca A; công thức trực
//       tiếp mà engine đang dùng thì ngược lại — khớp ca A, lệch ca B.
//   (2) Cung Thìn: mục 3 + 10.3 loại Thìn khỏi NHAP_MO_DUNG_DUOC, nhưng ví dụ ca B ở mục 14 lại
//       chấm giờ Tỵ (→ cung Thìn) là "phương án cao điểm nhất", tức vẫn tính đủ +100.

import { describe, expect, it } from "vitest";
import { calculateGioLiemHaHuyet } from "@thien-anh/trachnhat-engine";
import { TrungTang } from "@thien-anh/rule-engine";

/** Ca A — Nam, sinh 1950, mất giờ Thìn ngày 25/7/2026 (mục 14 đặc tả). */
const caA = () =>
  calculateGioLiemHaHuyet({
    gioiTinh: "nam",
    namSinhDuongLich: 1950,
    namMat: 2026,
    thangMat: 7,
    ngayMat: 25,
    chiGioMat: "Thìn",
  });

/** Ca B — Nam, sinh 1947, mất 19h ngày 27/10/2039 (giờ Tuất), chôn sau 12 ngày. */
const caB = () =>
  calculateGioLiemHaHuyet({
    gioiTinh: "nam",
    namSinhDuongLich: 1947,
    namMat: 2039,
    thangMat: 10,
    ngayMat: 27,
    chiGioMat: "Tuất",
    soNgayDuKienToiChon: 12,
  });

describe("Chưởng pháp — 4 cung nền (mục 14 đặc tả)", () => {
  it("ca A: tuổi ta 77, tứ cung Mão / Dậu / Dậu / Dần", () => {
    const r = caA();
    expect(r.tuoiTa).toBe(77);
    expect(r.duoi10Tuoi).toBe(false);
    expect(r.bonCung).toEqual({ cungTuoi: "Mão", cungThang: "Dậu", cungNgay: "Dậu", cungGio: "Dần" });
  });

  it("ca B: tuổi ta 93, tứ cung Sửu / Tuất / Thân / Mùi (3/4 Nhập Mộ → tự hoá giải)", () => {
    const r = caB();
    expect(r.tuoiTa).toBe(93);
    expect(r.bonCung).toEqual({ cungTuoi: "Sửu", cungThang: "Tuất", cungNgay: "Thân", cungGio: "Mùi" });
    const nhapMo = [r.bonCung!.cungTuoi, r.bonCung!.cungThang, r.bonCung!.cungNgay, r.bonCung!.cungGio].filter(
      (c) => c && TrungTang.phanLoaiCung(c) === "nhap-mo",
    );
    expect(nhapMo).toHaveLength(3);
  });
});

describe("Giờ liệm / đóng quan", () => {
  it("ca A: phương án số 1 là giờ Mão, cung Sửu (Nhập Mộ) — khớp đặc tả mục 14", () => {
    const top = caA().gioLiemDongQuan![0]!;
    expect(top.chiGio).toBe("Mão");
    expect(top.cungGio).toBe("Sửu");
    expect(top.phanLoaiCung).toBe("nhap-mo");
    expect(top.cungDungDuoc).toBe(true);
  });

  it("không bao giờ đề xuất giờ Dần/Thân/Tỵ/Hợi cho liệm (loại tuyệt đối)", () => {
    for (const r of [caA(), caB()]) {
      for (const c of r.gioLiemDongQuan!) {
        expect(["Dần", "Thân", "Tỵ", "Hợi"]).not.toContain(c.chiGio);
      }
    }
  });

  it("luôn cách giờ mất ít nhất 8 tiếng (lọc thực tế `chon_gio_liem.loc_thuc_te_gio`)", () => {
    // Ca A mất giờ Thìn (idx 4). Mọi ứng viên phải cách >= 4 bậc chi (mỗi bậc 2 tiếng).
    const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
    for (const c of caA().gioLiemDongQuan!) {
      const step = (CHI.indexOf(c.chiGio) - CHI.indexOf("Thìn") + 12) % 12;
      expect(step * 2).toBeGreaterThanOrEqual(8);
    }
  });

  it("⚠️ MÂU THUẪN ĐẶC TẢ — ca B ra giờ Thìn (cung Sửu), đặc tả mục 14 ghi giờ Mão (cung Sửu)", () => {
    // Engine dùng công thức TRỰC TIẾP cung=f(Chi giờ) (khớp ca A), nên ca B: Mão → cung Tý (Thiên
    // Di) chứ không phải Sửu. Công thức "đếm step từ giờ mất" của mục 6 cho ra Mão → Sửu (khớp
    // mục 14 ca B) nhưng lại làm ca A sai. Hai ví dụ kiểm chứng của đặc tả loại trừ lẫn nhau —
    // giữ nguyên lựa chọn hiện tại (ưu tiên ca A) và khoá lại để phát hiện nếu ai đó đổi ngầm.
    const r = caB();
    expect(r.gioLiemDongQuan![0]!.chiGio).toBe("Thìn");
    expect(r.gioLiemDongQuan![0]!.cungGio).toBe("Sửu");
    expect(TrungTang.tinhCungTheoChiGio("nam", "Thân", "Mão")).toBe("Tý");
  });
});

describe("Cung dùng được — loại Thìn (Nhập Mộ) và Dậu (Thiên Di)", () => {
  it("bảng hằng số khớp `hang_so.nhap_mo_dung_duoc` / `thien_di_dung_duoc`", () => {
    expect([...TrungTang.NHAP_MO_DUNG_DUOC].sort()).toEqual(["Mùi", "Sửu", "Tuất"].sort());
    expect([...TrungTang.THIEN_DI_DUNG_DUOC].sort()).toEqual(["Mão", "Ngọ", "Tý"].sort());
    expect(TrungTang.laCungDungDuoc("Thìn")).toBe(false);
    expect(TrungTang.laCungDungDuoc("Dậu")).toBe(false);
    expect(TrungTang.laCungDungDuoc("Sửu")).toBe(true);
  });

  it("cung Thìn vẫn là Nhập Mộ nhưng chỉ được bậc 'bất đắc dĩ', xếp dưới Tuất/Sửu/Mùi", () => {
    // Chủ dự án chốt 2026-08-15: "Thìn vẫn là Nhập Mộ về mặt phân loại, nhưng khi module tự động
    // chọn giờ/ngày liệm hoặc hạ huyệt thì loại Thìn, ưu tiên Tuất–Sửu–Mùi... Thìn bị xem là Tứ Kỵ
    // nên bất đắc dĩ mới dùng." → không về 0 (0 = ngang cung Trùng Tang), mà là một bậc thấp riêng.
    const chung = { apDungThienDi: true, hoangDaoTen: "", hoangDaoLaCat: false, canGioDatBangDep: false, boiCanh: "liem" as const, chiGioThuocTuSinh: false };
    const diem = (cungGio: Parameters<typeof TrungTang.laCungDungDuoc>[0], phanLoaiCung: TrungTang.PhanLoaiCung) =>
      TrungTang.tinhDiemUngVien({ ...chung, phanLoaiCung, cungGio });

    expect(diem("Sửu", "nhap-mo")).toBe(100);
    expect(diem("Thìn", "nhap-mo")).toBe(20);
    expect(TrungTang.laNhapMoTuKy("Thìn")).toBe(true);
    expect(TrungTang.laNhapMoTuKy("Sửu")).toBe(false);

    // Thứ bậc bắt buộc: Nhập Mộ dùng được > Thiên Di dự phòng > Thìn (bất đắc dĩ) > cung Trùng Tang.
    expect(diem("Sửu", "nhap-mo")).toBeGreaterThan(diem("Tý", "thien-di"));
    expect(diem("Tý", "thien-di")).toBeGreaterThan(diem("Thìn", "nhap-mo"));
    expect(diem("Thìn", "nhap-mo")).toBeGreaterThan(diem("Dần", "trung-tang"));
  });

  it("Thìn KHÔNG chặn tầng Thiên Di dự phòng — vẫn giữ đúng nghĩa 'bất đắc dĩ'", () => {
    // Nếu trong ngày chỉ chạm được cung Thìn thì vẫn coi như chưa có Nhập Mộ dùng được, để Thiên
    // Di (Tý/Mão/Ngọ) được kích hoạt và đứng trên Thìn.
    const chung = { hoangDaoTen: "", hoangDaoLaCat: false, canGioDatBangDep: false, boiCanh: "liem" as const, chiGioThuocTuSinh: false };
    const thienDiKhiChiCoThin = TrungTang.tinhDiemUngVien({ ...chung, phanLoaiCung: "thien-di", cungGio: "Mão", apDungThienDi: true });
    const thinBatDacDi = TrungTang.tinhDiemUngVien({ ...chung, phanLoaiCung: "nhap-mo", cungGio: "Thìn", apDungThienDi: true });
    expect(thienDiKhiChiCoThin).toBeGreaterThan(thinBatDacDi);
  });

  it("tuổi cần tránh mặt: luôn có Long Hổ Kê Xà (Thìn/Dần/Dậu/Tỵ)", () => {
    // "Sách ghi rất rõ: người tuổi Thìn, Dần, Dậu, Tỵ không bao giờ được đứng nhìn nhập liệm."
    // Đây là việc KHÁC với điểm cung Thìn ở bảng xếp hạng giờ.
    for (const r of [caA(), caB()]) {
      expect([...r.tuoiCanTranh!.nhom1LongHoKeXa].sort()).toEqual(["Dần", "Dậu", "Thìn", "Tỵ"].sort());
    }
  });

  it("cung Dậu KHÔNG được cộng +40 dù vẫn mang nhãn Thiên Di", () => {
    const chung = { apDungThienDi: true, hoangDaoTen: "", hoangDaoLaCat: false, canGioDatBangDep: false, boiCanh: "liem" as const, chiGioThuocTuSinh: false };
    expect(TrungTang.tinhDiemUngVien({ ...chung, phanLoaiCung: "thien-di", cungGio: "Tý" })).toBe(40);
    expect(TrungTang.tinhDiemUngVien({ ...chung, phanLoaiCung: "thien-di", cungGio: "Dậu" })).toBe(0);
  });
});

describe("Quy luật bất biến (`chuong_phap.quy_luat_bat_bien`)", () => {
  it("Cung_Ngày thuộc nhóm Nhập Mộ → chỉ k=3/6/9/12 (Dần/Tỵ/Thân/Hợi) đạt Nhập Mộ", () => {
    const kNhapMo: number[] = [];
    for (let k = 1; k <= 12; k++) {
      if (TrungTang.phanLoaiCung(TrungTang.tinhCungGioHaHuyet("Tuất", k)) === "nhap-mo") kNhapMo.push(k);
    }
    expect(kNhapMo).toEqual([3, 6, 9, 12]);
    expect(TrungTang.nhapMoChiRoiVaoTuSinh("Tuất")).toBe(true);
    expect(TrungTang.nhapMoChiRoiVaoTuSinh("Dậu")).toBe(false);
  });
});

describe("Mốc chuyển ngày (`chon_gio_liem.moc_chuyen_ngay`)", () => {
  it("giờ Tý bắt đầu 23:00 của ngày dương liền TRƯỚC ngày trụ Can Chi", () => {
    const tyCandidate = caA().gioLiemDongQuan!.find((c) => c.chiGio === "Tý");
    expect(tyCandidate).toBeDefined();
    expect(tyCandidate!.khungGio.batDau).toBe("23:00");
    expect(tyCandidate!.khungGio.ketThuc).toBe("01:00");
    expect(tyCandidate!.khungGio.vatQuaNuaDem).toBe(true);
    // Ngày trụ là 26/7 nhưng mốc 23:00 rơi vào tối 25/7 — sai chỗ này là lệch hẳn 1 ngày tang lễ.
    expect(tyCandidate!.ngayDuongLich).toEqual({ nam: 2026, thang: 7, ngay: 26 });
    expect(tyCandidate!.khungGio.ngayBatDau).toEqual({ nam: 2026, thang: 7, ngay: 25 });
  });

  it("11 chi giờ còn lại nằm gọn trong ngày trụ", () => {
    for (const c of caA().gioLiemDongQuan!) {
      if (c.chiGio === "Tý") continue;
      expect(c.khungGio.vatQuaNuaDem).toBe(false);
      expect(c.khungGio.ngayBatDau).toEqual(c.ngayDuongLich);
    }
  });
});

describe("Ngày giờ hạ huyệt", () => {
  it("ca A: chôn trong 3 ngày → miễn trừ chọn ngày, mọi phương án rơi vào chính ngày mất", () => {
    const r = caA();
    expect(r.apDungMienTru3Ngay).toBe(true);
    for (const c of r.ngayGioHaHuyet!) {
      expect(c.ngayDuongLich).toEqual({ nam: 2026, thang: 7, ngay: 25 });
    }
  });

  it("ca B: chôn sau 12 ngày → có quét ngày, và ngày chọn không phạm Trùng nhật/xung tuổi vong", () => {
    const r = caB();
    expect(r.apDungMienTru3Ngay).toBe(false);
    expect(r.khongTimThayNgayHaHuyet).toBe(false);
    for (const c of r.ngayGioHaHuyet!) {
      expect(["Tỵ", "Hợi"]).not.toContain(c.canChiNgay.chi); // Trùng nhật
      expect(c.canChiNgay.chi).not.toBe("Tỵ"); // xung tuổi vong Hợi (sinh 1947 Đinh Hợi)
    }
  });
});

describe("Giờ động quan (mục 9b — trừ lùi từ giờ hạ huyệt)", () => {
  const input = {
    gioiTinh: "nam" as const,
    namSinhDuongLich: 1947,
    namMat: 2039,
    thangMat: 10,
    ngayMat: 27,
    chiGioMat: "Tuất" as const,
    soNgayDuKienToiChon: 12,
  };

  it("không nhập quãng đường → không tính (không tự đoán khoảng cách)", () => {
    expect(calculateGioLiemHaHuyet(input).gioDongQuan).toBeUndefined();
  });

  it("trả về một KHOẢNG: khuyến nghị sớm hơn muộn nhất đúng bằng đệm", () => {
    const r = calculateGioLiemHaHuyet({ ...input, thoiGianDiChuyenPhut: 90 });
    const dq = r.gioDongQuan!;
    expect(dq.thoiGianDiChuyenPhut).toBe(90);
    expect(dq.demPhut).toBe(45);
    // Hạ huyệt phương án 1 là giờ Mão (bắt đầu 05:00) → muộn nhất 03:30, khuyến nghị 02:45.
    expect(dq.theoHaHuyet.batDau).toBe("05:00");
    expect(dq.muonNhat.gio).toBe("03:30");
    expect(dq.khuyenNghiTu.gio).toBe("02:45");
  });

  it("cảnh báo khi khoảng động quan rơi vào đêm khuya", () => {
    const dq = calculateGioLiemHaHuyet({ ...input, thoiGianDiChuyenPhut: 90 }).gioDongQuan!;
    expect(dq.canhBao).toMatch(/đêm khuya/);
  });

  it("đệm cấu hình được", () => {
    const dq = calculateGioLiemHaHuyet({ ...input, thoiGianDiChuyenPhut: 30, demDongQuanPhut: 0 }).gioDongQuan!;
    expect(dq.demPhut).toBe(0);
    expect(dq.khuyenNghiTu.gio).toBe(dq.muonNhat.gio);
    expect(dq.muonNhat.gio).toBe("04:30");
  });

  it("từ chối quãng đường ngoài khoảng 5-480 phút", () => {
    expect(() => calculateGioLiemHaHuyet({ ...input, thoiGianDiChuyenPhut: 4 })).toThrow(/5-480/);
    expect(() => calculateGioLiemHaHuyet({ ...input, thoiGianDiChuyenPhut: 481 })).toThrow(/5-480/);
  });
});

describe("Chặn dưới 10 tuổi", () => {
  it("không luận trùng tang cho trẻ dưới 10 tuổi", () => {
    const r = calculateGioLiemHaHuyet({
      gioiTinh: "nam",
      namSinhDuongLich: 2020,
      namMat: 2026,
      thangMat: 7,
      ngayMat: 25,
      chiGioMat: "Thìn",
    });
    expect(r.duoi10Tuoi).toBe(true);
    expect(r.bonCung).toBeUndefined();
    expect(r.gioLiemDongQuan).toBeUndefined();
  });
});
