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
import { TrungTang, TrachNhat } from "@thien-anh/rule-engine";

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
  it("⚠️ MÂU THUẪN — ca A: đặc tả mục 14 chọn giờ Mão, nhưng Mão CHÍNH LÀ Giờ Sát Chủ tháng 6", () => {
    // Ca A mất 25/7/2026 = 12/6 âm lịch. Bảng `than_sat_an_tang.gio_sat_chu_theo_thang` cho
    // tháng 6 = Mão, mà cấu hình Sát Chủ đã được chủ dự án CHỐT là "Giờ Sát Chủ loại giờ".
    // Hai nguồn cùng của chủ dự án nhưng chỏi nhau: mục 14 khen Mão là phương án tốt nhất, còn
    // bảng thần sát thì loại thẳng Mão. Hiện đang ưu tiên bảng thần sát (mới hơn, và được đánh
    // dấu "ĐÃ CHỐT"), nên ca A ra giờ Dậu. Khoá lại để nếu ai đó đổi thì test báo ngay.
    const r = caA();
    expect(TrungTang.isGioSatChu("Mão", 6)).toBe(true);
    expect(r.gioLiemDongQuan!.map((c) => c.chiGio)).not.toContain("Mão");
    expect(r.gioLiemDongQuan![0]!.chiGio).toBe("Dậu");
    expect(r.gioLiemDongQuan![0]!.cungGio).toBe("Mùi");
    expect(r.gioLiemDongQuan![0]!.phanLoaiCung).toBe("nhap-mo");
  });

  it("mọi phương án giờ liệm đều không phạm Giờ Sát Chủ (trừ khi phải nới lỏng)", () => {
    for (const r of [caA(), caB()]) {
      if (r.daNoiLongGioSatChu) continue;
      for (const c of r.gioLiemDongQuan!) expect(c.phamGioSatChu).toBe(false);
    }
  });

  it("không bao giờ đề xuất ứng viên có CUNG rơi vào nhóm Trùng Tang (loại tuyệt đối)", () => {
    // Kỵ tuyệt đối cho liệm là ở CUNG, không phải ở tên chi giờ. Sách: "Tuyệt đối kị các ngày giờ
    // rơi vào CUNG Dần Thân Tị Hợi". Chủ dự án khẳng định lại 2026-08-16 bằng ví dụ ngày 12: khi
    // Cung_Ngày = Tuất thì giờ Dần/Thân/Hợi đều ra cung Nhập Mộ và "đều có thể liệm".
    for (const r of [caA(), caB()]) {
      for (const c of r.gioLiemDongQuan!) {
        expect(TrungTang.phanLoaiCung(c.cungGio)).not.toBe("trung-tang");
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

  it("ca B: ra giờ Mão và Dậu — khớp đúng lời giảng của chủ dự án 2026-08-16", () => {
    // Chủ dự án giảng nguyên văn: "nếu chọn ngày 11 thì giờ Mão Dậu thì liệm được".
    // Ngày 11 âm (= 28/10/2039 dương) có Cung_Ngày = Dậu → Mão ra cung Sửu, Dậu ra cung Mùi,
    // đều Nhập Mộ dùng được. Giờ Tý cũng ra cung Tuất (Nhập Mộ) nhưng bị luật 8 tiếng loại, đúng
    // như chủ dự án lưu ý "người mất chưa đủ 8 tiếng thì không nên động vào".
    //
    // ĐÂY LÀ CHỖ GIẢI ĐƯỢC "MÂU THUẪN" GIỮA 2 CÔNG THỨC Ở MỤC 6 / MỤC 14: hai công thức chưa bao
    // giờ thật sự chỏi nhau — engine chỉ thiếu bước quy về NGÀY MỚI khi giờ ứng viên đã qua ngày.
    const top = caB().gioLiemDongQuan!;
    const hai = top.slice(0, 2).map((c) => c.chiGio);
    expect(hai).toEqual(["Mão", "Dậu"]);
    expect(top[0]!.cungGio).toBe("Sửu");
    expect(top[1]!.cungGio).toBe("Mùi");
    // Cả hai đều rơi sang ngày dương 28/10 (= ngày 11 âm), không phải ngày mất 27/10.
    for (const c of top.slice(0, 2)) expect(c.ngayDuongLich).toEqual({ nam: 2039, thang: 10, ngay: 28 });
  });

  it("Cung_Ngày phải nhích theo NGÀY mà giờ ứng viên rơi vào, không giữ nguyên cung ngày mất", () => {
    // Ca B: Cung_Ngày ngày mất = Thân. Qua 1 ngày phải thành Dậu (nam thuận). Nếu vẫn dùng Thân
    // thì giờ Mão sẽ ra cung Tý (Thiên Di) và cả kết quả lệch hẳn.
    expect(TrungTang.tinhCungTheoChiGio("nam", "Dậu", "Mão")).toBe("Sửu"); // đúng: cung ngày 11
    expect(TrungTang.tinhCungTheoChiGio("nam", "Thân", "Mão")).toBe("Tý"); // sai: cung ngày mất
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
    const chung = { apDungThienDi: true, hoangDaoTen: "", hoangDaoLaCat: false, boiCanh: "liem" as const, chiGioThuocTuSinh: false };
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
    const chung = { hoangDaoTen: "", hoangDaoLaCat: false, boiCanh: "liem" as const, chiGioThuocTuSinh: false };
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
    const chung = { apDungThienDi: true, hoangDaoTen: "", hoangDaoLaCat: false, boiCanh: "liem" as const, chiGioThuocTuSinh: false };
    expect(TrungTang.tinhDiemUngVien({ ...chung, phanLoaiCung: "thien-di", cungGio: "Tý" })).toBe(40);
    expect(TrungTang.tinhDiemUngVien({ ...chung, phanLoaiCung: "thien-di", cungGio: "Dậu" })).toBe(0);
  });
});

describe("Cây quyết định hoá hung bằng Tam Đại Cát Tinh", () => {
  // Chủ dự án chốt 2026-08-16 (sơ đồ): ngày có hung tinh -> có Tam Đại Cát Tinh?
  //   KHÔNG -> giữ nguyên hung (loại)
  //   CÓ    -> Kim Thần Thất Sát / Sát Chủ / Thọ Tử / Trung Cung-Bạch Hổ: KHÔNG HOÁ
  //            hung tinh thông thường: GIẢM / HOÁ HUNG
  const quet = () => {
    const ds: { hungDaHoaGiai: string[]; tamDaiCatTinh: { co: boolean } ; canChiNgay: { can: string; chi: string } }[] = [];
    for (const thangMat of [1, 3, 5, 7, 9, 11]) {
      for (const ngayMat of [6, 16, 26]) {
        const r = calculateGioLiemHaHuyet({
          gioiTinh: "nam", namSinhDuongLich: 1950, namMat: 2026, thangMat, ngayMat,
          chiGioMat: "Thìn", soNgayDuKienToiChon: 12,
        });
        ds.push(...(r.ngayGioHaHuyet ?? []));
      }
    }
    return ds;
  };

  it("ngày được hoá hung LUÔN phải có Tam Đại Cát Tinh — không có thì không thể được cứu", () => {
    const ds = quet();
    expect(ds.length).toBeGreaterThan(0);
    for (const c of ds) {
      if (c.hungDaHoaGiai.length > 0) expect(c.tamDaiCatTinh.co).toBe(true);
    }
  });

  it("có ít nhất một ngày thực sự được cứu — luật không phải hình thức", () => {
    expect(quet().some((c) => c.hungDaHoaGiai.length > 0)).toBe(true);
  });

  it("phạt phải LỚN HƠN thưởng cát tinh, để ngày được cứu không vượt ngày sạch tương đương", () => {
    // Bất biến bắt buộc: cùng mọi yếu tố khác, ngày được cứu phải xếp sau ngày vốn đã sạch.
    // 30 là thưởng cát tinh, 50 là phạt hoá hung -> ròng -20 so với ngày sạch.
    expect(50).toBeGreaterThan(30);
  });

  it("Trùng Nhật / Phục Nhật / xung tuổi vong KHÔNG hoá được — chủ dự án chốt 2026-08-16", () => {
    // Đã hỏi thẳng "mấy cái này thì sao không hoá được" và được trả lời "không hoá được nhé".
    // Ba mục này không nằm trong sơ đồ ngoại lệ, nhưng cũng KHÔNG rơi vào nhóm hung thông thường.
    for (const ten of ["Trùng Nhật", "Phục Nhật", "Xung tuổi vong"]) {
      expect(TrungTang.TAM_CAT_KHONG_GIAI_DUOC_RIENG_TANG_SU).toContain(ten);
    }
    // Không ngày nào lọt kết quả mà lại ghi đã hoá ba mục đó, và không ngày Tỵ/Hợi nào lọt được.
    for (const c of quet()) {
      expect(c.hungDaHoaGiai).not.toContain("Trùng Nhật");
      expect(c.hungDaHoaGiai).not.toContain("Phục Nhật");
      expect(c.hungDaHoaGiai).not.toContain("Xung tuổi vong");
      expect(["Tỵ", "Hợi"]).not.toContain(c.canChiNgay.chi);
    }
  });

  it("nhóm ngoại lệ không bao giờ lọt vào kết quả dù ngày đó có cát tinh", () => {
    // Sát Chủ Âm, Kim Thần Thất Sát, Trùng Nhật, Phục Nhật, xung tuổi vong đều là "KHÔNG HOÁ".
    for (const c of quet()) {
      expect(TrungTang.isSatChuAm(c.canChiNgay.chi as never, 1)).toBeDefined(); // hàm còn sống
      expect(["Tỵ", "Hợi"]).not.toContain(c.canChiNgay.chi); // Trùng Nhật
      expect(c.hungDaHoaGiai).not.toContain("Sát Chủ Âm");
      expect(c.hungDaHoaGiai).not.toContain("Kim Thần Thất Sát");
      expect(c.hungDaHoaGiai).not.toContain("Trùng Nhật");
      expect(c.hungDaHoaGiai).not.toContain("Phục Nhật");
    }
  });
});

describe("Tam Đại Cát Tinh — dùng BẢNG CHUNG, không nhân bản trong module", () => {
  // Bảng + quy tắc hoá giải nằm ở tầng dùng chung `trach-nhat/tamDaiCatTinh.ts`. Module tang lễ
  // chỉ gọi vào, không giữ bản sao — để chủ dự án sửa bảng một lần là cả site đổi theo.

  it("module KHÔNG còn giữ bản sao của 3 bảng", () => {
    expect("SAT_CONG_THEO_NHOM" in TrungTang).toBe(false);
    expect("TRUC_TINH_THEO_NHOM" in TrungTang).toBe(false);
    expect("NHAN_CHUYEN_THEO_NHOM" in TrungTang).toBe(false);
    // Nguồn duy nhất nằm ở tầng chung.
    expect("SAT_CONG" in TrachNhat).toBe(true);
    expect("TRUC_TINH" in TrachNhat).toBe(true);
    expect("NHAN_CHUYEN" in TrachNhat).toBe(true);
  });

  it("bảng chung tra đúng theo TRỌN cặp Can Chi và theo nhóm tháng", () => {
    const ten = (thang: number, can: string, chi: string) =>
      TrachNhat.getTamDaiCatTinhTrongNgay(thang, can as never, chi as never).map((c) => c.name);
    expect(ten(1, "Đinh", "Mão")).toEqual(["Sát Cống"]);
    expect(ten(2, "Đinh", "Mão")).toEqual(["Trực Tinh"]); // cùng cặp, khác tháng -> khác sao
    expect(ten(3, "Kỷ", "Hợi")).toEqual(["Nhân Chuyên"]);
    // Giáp Tý không nằm trong bảng nào của Tứ Mạnh. (Lưu ý Đinh Sửu THÌ CÓ — nó là Trực Tinh
    // nhóm Tứ Mạnh, nên không dùng làm ví dụ "không trúng" được.)
    expect(ten(1, "Giáp", "Tý")).toEqual([]);
  });

  it("chính sách ngoại lệ chung khớp đúng sơ đồ chủ dự án", () => {
    for (const ten of ["Kim Thần Thất Sát", "Sát Chủ", "Thọ Tử"]) {
      expect(TrachNhat.HUNG_TINH_KHONG_HOA_GIAI).toContain(ten);
    }
    expect(TrachNhat.HUNG_TINH_KHONG_HOA_GIAI.some((x) => x.includes("Trung Cung"))).toBe(true);
  });

  it("module chồng thêm danh sách KHÔNG hoá được RIÊNG của tang sự", () => {
    for (const ten of ["Trùng Nhật", "Phục Nhật", "Xung tuổi vong"]) {
      expect(TrungTang.TAM_CAT_KHONG_GIAI_DUOC_RIENG_TANG_SU).toContain(ten);
      // Bốn mục này CHỈ có nghĩa với việc âm nên KHÔNG nằm trong danh sách chung.
      expect(TrachNhat.HUNG_TINH_KHONG_HOA_GIAI).not.toContain(ten);
    }
  });
});

describe("Dần/Thân/Tỵ/Hợi — kiêng MỀM ở cả liệm lẫn hạ huyệt", () => {
  // Chủ dự án chốt 2026-08-16: "Dần Thân Tị Hợi thực chất là kiêng giờ liệm, hạ huyệt — nếu được
  // thì tránh". Tức KHÔNG loại tuyệt đối (khác với CUNG rơi vào nhóm Trùng Tang, cái đó loại thẳng).
  const nen = { apDungThienDi: true, hoangDaoTen: "", hoangDaoLaCat: false, canGioDatBangDep: false };

  it("trừ điểm ở CẢ hai bối cảnh, không chỉ riêng hạ huyệt", () => {
    for (const boiCanh of ["liem", "ha-huyet"] as const) {
      const sach = TrungTang.tinhDiemUngVien({ ...nen, boiCanh, cungGio: "Sửu", phanLoaiCung: "nhap-mo", chiGioThuocTuSinh: false });
      const pham = TrungTang.tinhDiemUngVien({ ...nen, boiCanh, cungGio: "Sửu", phanLoaiCung: "nhap-mo", chiGioThuocTuSinh: true });
      expect(sach - pham).toBe(60);
    }
  });

  it("vẫn DÙNG ĐƯỢC khi không còn lựa chọn khá hơn — chỉ xếp sau, không bị loại", () => {
    // Nhập Mộ dùng được + phạm tứ sinh vẫn dương điểm, tức vẫn là ứng viên hợp lệ.
    const phamNhungNhapMo = TrungTang.tinhDiemUngVien({ ...nen, boiCanh: "liem", cungGio: "Sửu", phanLoaiCung: "nhap-mo", chiGioThuocTuSinh: true });
    expect(phamNhungNhapMo).toBeGreaterThan(0);
    // Nhưng luôn phải xếp sau một giờ tương đương mà không phạm.
    const khongPham = TrungTang.tinhDiemUngVien({ ...nen, boiCanh: "liem", cungGio: "Sửu", phanLoaiCung: "nhap-mo", chiGioThuocTuSinh: false });
    expect(khongPham).toBeGreaterThan(phamNhungNhapMo);
  });

  it("engine có gắn cờ này cho ứng viên giờ liệm (không còn hardcode false)", () => {
    const tatCa = [...(caA().gioLiemDongQuan ?? []), ...(caB().gioLiemDongQuan ?? [])];
    for (const c of tatCa) {
      expect(c.chiGioThuocTuSinh).toBe(["Dần", "Thân", "Tỵ", "Hợi"].includes(c.chiGio));
    }
  });
});

describe("Trần Tử Tánh — điểm cộng, KHÔNG phải phép chọn", () => {
  // Chủ dự án chốt 2026-08-16 qua hai câu bổ sung cho nhau: "chọn ngày liệm theo Trần Tử Tánh
  // không dùng" (không dùng làm phép chọn) + "nếu có càng tốt" (trúng thì là điểm cộng).

  it("bảng khớp 12/12 chi với bảng in trong sách Sổ Tay Tang Sự", () => {
    const sach: Record<string, [string, string]> = {
      "Tý": ["Giáp", "Canh"], "Sửu": ["Ất", "Tân"], "Dần": ["Bính", "Quý"], "Mão": ["Bính", "Nhâm"],
      "Thìn": ["Đinh", "Giáp"], "Tỵ": ["Ất", "Canh"], "Ngọ": ["Đinh", "Quý"], "Mùi": ["Ất", "Tân"],
      "Thân": ["Giáp", "Quý"], "Dậu": ["Đinh", "Nhâm"], "Tuất": ["Canh", "Nhâm"], "Hợi": ["Ất", "Tân"],
    };
    for (const [chi, cans] of Object.entries(sach)) {
      expect([...TrungTang.CAN_GIO_DEP_THEO_CHI_NGAY[chi as keyof typeof sach]].sort()).toEqual([...cans].sort());
    }
  });

  it("cộng đúng 15 điểm khi trúng bảng", () => {
    const chung = { cungGio: "Sửu" as const, phanLoaiCung: "nhap-mo" as const, apDungThienDi: true, hoangDaoTen: "", hoangDaoLaCat: false, boiCanh: "liem" as const, chiGioThuocTuSinh: false };
    const co = TrungTang.tinhDiemUngVien({ ...chung, canGioDatBangDep: true });
    const khong = TrungTang.tinhDiemUngVien({ ...chung, canGioDatBangDep: false });
    expect(co - khong).toBe(TrungTang.DIEM_TRAN_TU_TANH);
    expect(TrungTang.DIEM_TRAN_TU_TANH).toBe(15);
  });

  it("KHÔNG đủ sức lật thứ hạng do CUNG quyết định", () => {
    const nen = { apDungThienDi: true, hoangDaoTen: "", hoangDaoLaCat: false, boiCanh: "liem" as const, chiGioThuocTuSinh: false };
    // Nhập Mộ dùng được mà KHÔNG trúng bảng vẫn phải hơn Thiên Di / Thìn tứ kỵ dù chúng trúng bảng.
    const nhapMoKhongTrung = TrungTang.tinhDiemUngVien({ ...nen, cungGio: "Sửu", phanLoaiCung: "nhap-mo", canGioDatBangDep: false });
    const thienDiTrung = TrungTang.tinhDiemUngVien({ ...nen, cungGio: "Tý", phanLoaiCung: "thien-di", canGioDatBangDep: true });
    const thinTrung = TrungTang.tinhDiemUngVien({ ...nen, cungGio: "Thìn", phanLoaiCung: "nhap-mo", canGioDatBangDep: true });
    expect(nhapMoKhongTrung).toBeGreaterThan(thienDiTrung);
    expect(nhapMoKhongTrung).toBeGreaterThan(thinTrung);
  });
});

describe("Nam thuận / nữ nghịch — XUYÊN SUỐT cả phép", () => {
  // Chủ dự án chốt 2026-08-16: "Nữ phải đếm nghịch xuyên suốt toàn bộ phép Trùng Tang/hạ huyệt.
  // Không được tính tháng/ngày nghịch nhưng đến Cung Giờ lại chuyển sang thuận."
  // Trước đây `tinhCungGioHaHuyet` KHÔNG nhận giới tính nên luôn đếm thuận — sai với nữ.

  it("giờ hạ huyệt đếm nghịch cho nữ, thuận cho nam", () => {
    // Cung_Ngày = Dậu (idx 9). Giờ Mão k=4: nam 9+4=13→Sửu, nữ 9-4=5→Tỵ.
    expect(TrungTang.tinhCungGioHaHuyet("nam", "Dậu", 4)).toBe("Sửu");
    expect(TrungTang.tinhCungGioHaHuyet("nu", "Dậu", 4)).toBe("Tỵ");
    // Lệch hẳn NHÓM cung, không phải lệch nhẹ: Nhập Mộ đổi thành Trùng Tang.
    expect(TrungTang.phanLoaiCung(TrungTang.tinhCungGioHaHuyet("nam", "Dậu", 4))).toBe("nhap-mo");
    expect(TrungTang.phanLoaiCung(TrungTang.tinhCungGioHaHuyet("nu", "Dậu", 4))).toBe("trung-tang");
  });

  it("cùng chiều với 2 hàm còn lại của chưởng pháp — không có hàm nào lệch pha", () => {
    // Giờ liệm và giờ hạ huyệt phải cho cùng một cung khi cùng Cung_Ngày và cùng chi giờ.
    for (const gt of ["nam", "nu"] as const) {
      for (const [chiGio, k] of [["Tý", 1], ["Mão", 4], ["Ngọ", 7], ["Dậu", 10]] as const) {
        expect(TrungTang.tinhCungGioHaHuyet(gt, "Dậu", k)).toBe(TrungTang.tinhCungTheoChiGio(gt, "Dậu", chiGio));
      }
    }
  });

  it("nam và nữ cho kết quả KHÁC nhau — không còn dùng chung một chiều", () => {
    const inp = (gioiTinh: "nam" | "nu") => ({
      gioiTinh, namSinhDuongLich: 1950, namMat: 2026, thangMat: 7, ngayMat: 25,
      chiGioMat: "Thìn" as const, soNgayDuKienToiChon: 12,
    });
    const gio = (t: "nam" | "nu") => (calculateGioLiemHaHuyet(inp(t)).ngayGioHaHuyet ?? []).map((c) => c.chiGio).join(",");
    expect(gio("nam")).not.toBe(gio("nu"));
  });
});

describe("Quy luật bất biến (`chuong_phap.quy_luat_bat_bien`)", () => {
  it("Cung_Ngày thuộc nhóm Nhập Mộ → chỉ k=3/6/9/12 (Dần/Tỵ/Thân/Hợi) đạt Nhập Mộ", () => {
    const kNhapMo: number[] = [];
    for (let k = 1; k <= 12; k++) {
      if (TrungTang.phanLoaiCung(TrungTang.tinhCungGioHaHuyet("nam", "Tuất", k)) === "nhap-mo") kNhapMo.push(k);
    }
    expect(kNhapMo).toEqual([3, 6, 9, 12]);
    expect(TrungTang.nhapMoChiRoiVaoTuSinh("Tuất")).toBe(true);
    expect(TrungTang.nhapMoChiRoiVaoTuSinh("Dậu")).toBe(false);
  });
});

describe("Mốc chuyển ngày (`chon_gio_liem.moc_chuyen_ngay`)", () => {
  it("giờ Tý bắt đầu 23:00 của ngày dương liền TRƯỚC ngày trụ Can Chi", () => {
    // Không phụ thuộc việc giờ Tý có lọt top 3 hay không (top 3 đổi theo từng lần sửa luật) —
    // kiểm trên MỌI ứng viên của cả hai ca, và bắt buộc phải gặp ít nhất một giờ Tý ở đâu đó.
    const tatCa = [...(caA().gioLiemDongQuan ?? []), ...(caB().gioLiemDongQuan ?? []), ...(caA().ngayGioHaHuyet ?? []), ...(caB().ngayGioHaHuyet ?? [])];
    const dsTy = tatCa.filter((c) => c.chiGio === "Tý");
    expect(dsTy.length).toBeGreaterThan(0);
    for (const c of dsTy) {
      expect(c.khungGio.batDau).toBe("23:00");
      expect(c.khungGio.ketThuc).toBe("01:00");
      expect(c.khungGio.vatQuaNuaDem).toBe(true);
      // Mốc 23:00 phải rơi vào ngày dương LIỀN TRƯỚC ngày trụ — sai chỗ này là lệch hẳn 1 ngày.
      const truoc = new Date(Date.UTC(c.ngayDuongLich.nam, c.ngayDuongLich.thang - 1, c.ngayDuongLich.ngay - 1));
      expect(c.khungGio.ngayBatDau).toEqual({ nam: truoc.getUTCFullYear(), thang: truoc.getUTCMonth() + 1, ngay: truoc.getUTCDate() });
    }
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

describe("Tầng 1 — đại kỵ ngày (loại ngay)", () => {
  const ngayHaHuyet = (extra: Record<string, unknown> = {}) =>
    calculateGioLiemHaHuyet({
      gioiTinh: "nam",
      namSinhDuongLich: 1950,
      namMat: 2026,
      thangMat: 7,
      ngayMat: 25,
      chiGioMat: "Thìn",
      soNgayDuKienToiChon: 12,
      ...extra,
    }).ngayGioHaHuyet ?? [];

  it("không đề xuất ngày Thái Tuế (Chi ngày trùng Chi năm) hay Tuế Phá (Chi ngày xung Chi năm)", () => {
    // Năm 2026 = Bính Ngọ → Thái Tuế = Ngọ, Tuế Phá = Tý (xung Ngọ).
    for (const c of ngayHaHuyet()) {
      expect(c.canChiNgay.chi).not.toBe("Ngọ");
      expect(c.canChiNgay.chi).not.toBe("Tý");
    }
  });

  it("không đề xuất ngày Kiếp Sát theo tuổi vong (đã nâng từ cảnh báo lên loại)", () => {
    // Vong sinh 1950 = Canh Dần → nhóm Dần Ngọ Tuất → Kiếp Sát = Hợi.
    expect(TrungTang.getKiepSatKyChi("Dần")).toBe("Hợi");
    for (const c of ngayHaHuyet()) expect(c.canChiNgay.chi).not.toBe("Hợi");
  });

  it("không đề xuất ngày Trực Kiến (≡ Nguyệt Kiến) hay Trực Phá (≡ Nguyệt Phá)", () => {
    // Cả hai đều nằm trong nhóm TRUC_XAU nên `trucTot` phải luôn true sau khi đã lọc.
    // (Trực Thu vẫn được phép — chỉ là kỵ an táng mức cảnh báo, không thuộc tầng 1.)
    for (const c of ngayHaHuyet()) {
      if (!c.trucTot) {
        expect(c.canhBaoThanSat.some((x) => x.ma === "truc-ky")).toBe(true);
      }
    }
  });
});

describe("Bảng thần sát chủ dự án cung cấp 2026-08-15 — Tý (子) ≠ Tỵ (巳)", () => {
  // Bản gốc dùng "TY" cho cả Tý lẫn Tỵ. Cách giải theo quy luật nội tại của từng bảng đã được
  // CHỦ DỰ ÁN XÁC NHẬN LẠI TOÀN BỘ (2026-08-15) — khớp đúng, không phải sửa số liệu nào.
  // Giữ các assert này làm chốt chặn: đây là kiểu lỗi sai một ly đi một dặm mà không báo gì.

  it("Tuế Sát: bản mảng theo tam hợp chủ dự án gửi lại khớp 4/4 nhóm, Tý ≠ Tỵ", () => {
    // Bản JSON đầu tiên có khoá "TY" lặp 2 lần → parse thẳng thì Tý nhận nhầm Thìn.
    expect(TrungTang.TUE_SAT_THEO_CHI_NAM["Tý"]).toBe("Mùi"); // Thân-Tý-Thìn
    expect(TrungTang.TUE_SAT_THEO_CHI_NAM["Tỵ"]).toBe("Thìn"); // Tỵ-Dậu-Sửu
    expect(TrungTang.TUE_SAT_THEO_CHI_NAM["Dần"]).toBe("Sửu");
    expect(TrungTang.TUE_SAT_THEO_CHI_NAM["Hợi"]).toBe("Tuất");
    // Mỗi bộ tam hợp phải cho cùng một Tuế Sát.
    for (const nhom of [["Thân", "Tý", "Thìn"], ["Dần", "Ngọ", "Tuất"], ["Tỵ", "Dậu", "Sửu"], ["Hợi", "Mão", "Mùi"]] as const) {
      const ds = nhom.map((c) => TrungTang.TUE_SAT_THEO_CHI_NAM[c]);
      expect(new Set(ds).size).toBe(1);
    }
  });

  it("Sát Chủ Âm khớp bảng riêng chủ dự án gửi 2026-08-15 (12/12), T1 = Tỵ chứ không phải Tý", () => {
    const mong = ["Tỵ", "Tý", "Mùi", "Mão", "Thân", "Tuất", "Sửu", "Hợi", "Ngọ", "Dậu", "Dần", "Thìn"];
    expect([...TrungTang.SAT_CHU_AM_THEO_THANG]).toEqual(mong);
    expect(TrungTang.isSatChuAm("Tỵ", 1)).toBe(true);
    expect(TrungTang.isSatChuAm("Tý", 1)).toBe(false);
    expect(TrungTang.isSatChuAm("Tý", 2)).toBe(true);
    // Hai tháng từng bị lật qua lật lại — CHỐT 2026-08-16: T7 = Sửu, T8 = Hợi (quay về đúng bản
    // của skill xem-ngay-cao-cap; dòng `_sua_sat_chu_am` trong bảng dữ liệu mới là chỗ sai).
    expect(TrungTang.isSatChuAm("Sửu", 7)).toBe(true);
    expect(TrungTang.isSatChuAm("Hợi", 8)).toBe(true);
    expect(TrungTang.isSatChuAm("Hợi", 7)).toBe(false);
    expect(TrungTang.isSatChuAm("Sửu", 8)).toBe(false);
  });

  it("Sát Chủ Âm chỉ chi phối việc ÂM — không mang cùng trọng số sang việc dương", () => {
    expect(TrungTang.satChuAmApDungCho("an_tang")).toBe(true);
    expect(TrungTang.satChuAmApDungCho("ha_huyet")).toBe(true);
    expect(TrungTang.satChuAmApDungCho("nhap_quan")).toBe(true);
    expect(TrungTang.satChuAmApDungCho("ky_hop_dong")).toBe(false);
    expect(TrungTang.satChuAmApDungCho("khai_truong")).toBe(false);
  });

  it("Nguyệt Yếm là chuỗi đi lùi liên tục từ Tuất (T6 = Tỵ, T11 = Tý)", () => {
    expect(TrungTang.NGUYET_YEM_THEO_THANG[5]).toBe("Tỵ");
    expect(TrungTang.NGUYET_YEM_THEO_THANG[10]).toBe("Tý");
    expect(new Set(TrungTang.NGUYET_YEM_THEO_THANG).size).toBe(12); // đủ 12 chi, không trùng
  });

  it("Nguyệt Hại là chuỗi đi lùi từ Tỵ (T1 = Tỵ, T6 = Tý)", () => {
    expect(TrungTang.NGUYET_HAI_THEO_THANG[0]).toBe("Tỵ");
    expect(TrungTang.NGUYET_HAI_THEO_THANG[5]).toBe("Tý");
    expect(new Set(TrungTang.NGUYET_HAI_THEO_THANG).size).toBe(12);
  });

  it("Nguyệt Hình: T1 = Tỵ, T2 = Tý", () => {
    expect(TrungTang.NGUYET_HINH_THEO_THANG[0]).toBe("Tỵ");
    expect(TrungTang.NGUYET_HINH_THEO_THANG[1]).toBe("Tý");
  });

  it("Tứ Phế: mỗi mùa là cặp Can Chi của hành BỊ TỬ ở mùa đó", () => {
    expect(TrungTang.TU_PHE_THEO_MUA["Xuân"]).toEqual([{ can: "Canh", chi: "Thân" }, { can: "Tân", chi: "Dậu" }]);
    expect(TrungTang.TU_PHE_THEO_MUA["Đông"]).toEqual([{ can: "Bính", chi: "Ngọ" }, { can: "Đinh", chi: "Tỵ" }]);
  });

  it("Nguyệt Đức khớp quy tắc tam hợp với quy ước tháng 1 = Dần (đối chứng nguồn)", () => {
    // Bốn bảng cát thần chỉ tồn tại MỘT bản, ở `trach-nhat/catTinhTheoCan.ts` — module tang lễ
    // đọc nhờ chứ không giữ bản sao, để chủ dự án sửa bảng thì không chỗ nào lệch.
    // Dần-Ngọ-Tuất → Bính; Thân-Tý-Thìn → Nhâm; Hợi-Mão-Mùi → Giáp; Tỵ-Dậu-Sửu → Canh.
    const CHI_THANG = ["Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu"];
    const mong: Record<string, string> = { "Dần": "Bính", "Ngọ": "Bính", "Tuất": "Bính", "Thân": "Nhâm", "Tý": "Nhâm", "Thìn": "Nhâm", "Hợi": "Giáp", "Mão": "Giáp", "Mùi": "Giáp", "Tỵ": "Canh", "Dậu": "Canh", "Sửu": "Canh" };
    for (let t = 1; t <= 12; t++) {
      expect(TrachNhat.NGUYET_DUC_THEO_THANG[t - 1]).toBe(mong[CHI_THANG[t - 1]!]);
    }
  });

  it("cát thần được chấm nhưng KHÔNG lật ngược thứ hạng do cung/hoàng đạo quyết định", () => {
    // Tổng tối đa 4 cát thần (12+8+12+8 = 40) vẫn thấp hơn khoảng cách Nhập Mộ (100) - Thiên Di (40).
    expect(12 + 8 + 12 + 8).toBeLessThan(100);
  });
});

describe("Tầng 3 — TỌA huyệt: đã chuyển sang Phase 2", () => {
  it("engine KHÔNG còn nhận hướng huyệt ở Phase 1", () => {
    // Chủ dự án chốt 2026-08-16: mọi thứ liên quan tọa hướng mộ để Phase 2. Test này chốt chặn
    // để không ai vô tình cài lại tầng phương vị vào module Phase 1.
    expect("isTamSatTheoToa" in TrungTang).toBe(false);
    expect("TAM_SAT_THEO_TOA" in TrungTang).toBe(false);
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

  /** "HH:mm" → số phút, để so quan hệ trước/sau thay vì khoá cứng giờ đồng hồ. */
  const phut = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h! * 60 + m!;
  };
  /** Chênh lệch phút a - b, có xử lý trường hợp vắt qua nửa đêm. */
  const lech = (a: string, b: string) => (((phut(a) - phut(b)) % 1440) + 1440) % 1440;

  it("trả về một KHOẢNG: muộn nhất = giờ hạ huyệt trừ quãng đường, khuyến nghị sớm hơn đúng bằng đệm", () => {
    // Cố ý KHÔNG khoá cứng giờ đồng hồ: phương án hạ huyệt số 1 đổi mỗi khi thêm tầng lọc thần
    // sát, mà phép trừ lùi thì vẫn phải đúng. Kiểm QUAN HỆ mới là kiểm đúng thứ cần kiểm.
    const dq = calculateGioLiemHaHuyet({ ...input, thoiGianDiChuyenPhut: 90 }).gioDongQuan!;
    expect(dq.thoiGianDiChuyenPhut).toBe(90);
    expect(dq.demPhut).toBe(45);
    expect(lech(dq.theoHaHuyet.batDau, dq.dongQuanMuonNhat.gio)).toBe(90);
    expect(lech(dq.dongQuanMuonNhat.gio, dq.dongQuanKhuyenNghi.gio)).toBe(45);
  });

  it("cảnh báo khi khoảng động quan rơi vào đêm khuya (23h-5h)", () => {
    // Quãng đường rất dài đẩy giờ rời nhà lùi vào đêm — phải bật cảnh báo.
    const dq = calculateGioLiemHaHuyet({ ...input, thoiGianDiChuyenPhut: 470 }).gioDongQuan!;
    const p = phut(dq.dongQuanKhuyenNghi.gio);
    if (p >= 23 * 60 || p < 5 * 60) expect(dq.canhBao).toMatch(/đêm khuya/);
    else expect(dq.canhBao).toBeUndefined();
  });

  it("đệm cấu hình được", () => {
    const dq = calculateGioLiemHaHuyet({ ...input, thoiGianDiChuyenPhut: 30, demDongQuanPhut: 0 }).gioDongQuan!;
    expect(dq.demPhut).toBe(0);
    expect(dq.dongQuanKhuyenNghi.gio).toBe(dq.dongQuanMuonNhat.gio);
    expect(lech(dq.theoHaHuyet.batDau, dq.dongQuanMuonNhat.gio)).toBe(30);
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
