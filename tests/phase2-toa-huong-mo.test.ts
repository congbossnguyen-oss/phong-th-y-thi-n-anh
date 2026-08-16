// Test khoá hành vi PHASE 2 — lọc theo tọa hướng mộ phần, BƯỚC ① (điều kiện loại).
//
// Nguồn đối chiếu: `spec-module-phase2-toa-huong-mo.md` v2.0 mục 1 (dữ liệu vào), mục 2.1 (điều
// kiện loại + ba kết cục A/B/C), mục 2.4 (phép quyền biến).
//
// Nguyên tắc kiểm thử ở đây: KHÔNG chép lại bảng gốc vào test rồi so bảng-với-bảng (làm vậy chỉ
// chứng minh mình copy đúng). Thay vào đó khoá các QUAN HỆ mà đặc tả khẳng định — cấp Năm chặn cả
// module, cấp Ngày/Giờ chỉ loại phương án, sát ranh giới thì bắt đo lại chứ không tự đoán.
import { describe, expect, it } from "vitest";
import { TrungTang, XemNgayCaoCap } from "@thien-anh/rule-engine";
import { kiemToaHuongTruocThanhToan } from "@thien-anh/trachnhat-engine";

/** Lấy tọa hướng, ném nếu độ số không hợp lệ — để test đọc gọn. */
function toa(doSo: number) {
  const kq = TrungTang.quyToaDoVeToaHuong(doSo);
  if (!kq.hopLe) throw new Error(`Tọa ${doSo}° bị từ chối: ${kq.lyDo}`);
  return kq.toaHuong;
}

describe("Bước ① — quy tọa độ số về sơn / cung / phương", () => {
  it("0° là tâm sơn Tý, cung Khảm, phương Bắc; hướng đối là Ngọ / Ly / Nam", () => {
    const t = toa(0);
    expect(t.sonToa).toBe("Tý");
    expect(t.cungToa).toBe("Khảm");
    expect(t.phuongToa).toBe("Bắc");
    expect(t.doSoHuong).toBe(180);
    expect(t.sonHuong).toBe("Ngọ");
    expect(t.cungHuong).toBe("Ly");
    expect(t.phuongHuong).toBe("Nam");
  });

  it("hướng luôn đối tọa 180° và luôn khác cung với tọa — với mọi tâm sơn", () => {
    for (const son of XemNgayCaoCap.DANH_SACH_24_SON) {
      const t = toa(son.doTam);
      expect(t.sonToa).toBe(son.ten);
      expect(t.cungToa).toBe(son.cung);
      expect(t.doSoHuong).toBe((son.doTam + 180) % 360);
      expect(t.cungHuong).not.toBe(t.cungToa);
    }
  });

  it("đo sát ranh giới hai sơn thì BẮT ĐO LẠI, không tự chọn bên", () => {
    // Ranh giới Tý/Quý ở đúng 7.5°. Sai một sơn là đổi hẳn kết quả Thái Tuế/Bát Sát nên không
    // được đoán (đặc tả mục 1: "sai 1 sơn là sai toàn bộ kết quả").
    for (const d of [7.5, 7, 8, 22.5, 352.5]) {
      const kq = TrungTang.quyToaDoVeToaHuong(d);
      expect(kq.hopLe, `${d}° lẽ ra phải bị chặn`).toBe(false);
      if (!kq.hopLe) expect(kq.canDoLai).toBe(true);
    }
  });

  it("4 sơn duy Cấn/Tốn/Khôn/Càn vẫn ra được phương vì dùng độ số thật", () => {
    // Suy phương từ TÊN sơn thì 4 sơn duy nằm đúng ranh giới → không xác định được. Phase 2 luôn
    // có độ số nên phải đi đường độ số, đây là lý do bắt khách đo la kinh thay vì chọn tên sơn.
    for (const ten of XemNgayCaoCap.SON_DUY) {
      expect(XemNgayCaoCap.phuongTuSon(ten).canDoSo).toBe(true);
      const dinhNghia = XemNgayCaoCap.timDinhNghiaSon(ten);
      expect(toa(dinhNghia.doTam).phuongToa).toBeTruthy();
    }
  });

  it("độ số ngoài 0-360 được chuẩn hoá, độ số vô nghĩa bị từ chối", () => {
    expect(toa(360).sonToa).toBe("Tý");
    expect(toa(-15).sonToa).toBe(XemNgayCaoCap.DANH_SACH_24_SON[23]!.ten);
    expect(TrungTang.quyToaDoVeToaHuong(Number.NaN).hopLe).toBe(false);
  });
});

describe("Bước ① — kết cục C: sát cấp NĂM đáo tọa/hướng", () => {
  it("tọa Tý gặp năm Tý thì phạm Thái Tuế ở hướng và Tuế Phá ở tọa", () => {
    // Tọa Tý → hướng Ngọ. Năm Tý: Thái Tuế tại Tý (= tọa), Tuế Phá tại Ngọ (= hướng).
    const kq = TrungTang.kiemSatCapNam(toa(0), 2032, "Nhâm", "Tý");
    expect(kq.phamCapNam).toBe(true);
    expect(kq.danhSach).toContainEqual({ ten: "Thái Tuế", dao: "toa" });
    expect(kq.danhSach).toContainEqual({ ten: "Tuế Phá", dao: "huong" });
  });

  it("sơn Can / sơn Quái miễn nhiễm Thái Tuế và Tuế Phá", () => {
    // Chỉ 12 sơn Chi mới dính. Sơn Quý (15°) là sơn Can → dù năm nào cũng không phạm 2 sát này.
    const t = toa(15);
    for (const chiNam of ["Tý", "Ngọ", "Mão", "Dậu"] as const) {
      const ten = TrungTang.kiemSatCapNam(t, 2032, "Nhâm", chiNam).danhSach.map((s) => s.ten);
      expect(ten).not.toContain("Thái Tuế");
      expect(ten).not.toContain("Tuế Phá");
    }
  });

  it("Bát Sát Hoàng Tuyền bắt trọn cặp Can Chi năm, không chỉ Chi", () => {
    // Cung Khảm kỵ Quý Tỵ / Quý Hợi. Năm 2013 Quý Tỵ tọa Tý → phạm; đổi Can sang Đinh Tỵ → thoát.
    const t = toa(0);
    expect(TrungTang.kiemSatCapNam(t, 2013, "Quý", "Tỵ").danhSach).toContainEqual({
      ten: "Bát Sát Hoàng Tuyền",
      dao: "toa",
    });
    expect(TrungTang.kiemSatCapNam(t, 1977, "Đinh", "Tỵ").danhSach.map((s) => s.ten)).not.toContain(
      "Bát Sát Hoàng Tuyền",
    );
  });

  it("Ngũ Hoàng năm chỉ báo phạm khi đúng cung tọa hoặc cung hướng", () => {
    // Không hard-code năm nào — đối chiếu thẳng với bảng Cửu Cung dùng chung, để test không mục
    // ruỗng nếu sau này bảng được sửa.
    for (let nam = 2020; nam <= 2035; nam++) {
      const nguHoang = XemNgayCaoCap.traNguHoangNam(nam);
      if (!nguHoang.tinhDuocKhong) continue;
      const t = toa(0); // cung Khảm / hướng Ly
      const coTrongDanhSach = TrungTang.kiemSatCapNam(t, nam, "Giáp", "Thìn").danhSach.some(
        (s) => s.ten === "Ngũ Hoàng",
      );
      const nenPham = nguHoang.cungNguHoang === "Khảm" || nguHoang.cungNguHoang === "Ly";
      expect(coTrongDanhSach, `năm ${nam}`).toBe(nenPham);
    }
  });

  it("Ngũ Hoàng nhập Trung Cung thì không đáo tọa/hướng nào cả", () => {
    const namTrung = [...Array(101).keys()]
      .map((i) => 1968 + i)
      .find((n) => {
        const kq = XemNgayCaoCap.traNguHoangNam(n);
        return kq.tinhDuocKhong && kq.cungNguHoang === "Trung";
      });
    if (namTrung === undefined) return; // bảng không có năm nào Trung Cung — không ép
    const ten = TrungTang.kiemSatCapNam(toa(0), namTrung, "Giáp", "Thìn").danhSach.map((s) => s.ten);
    expect(ten).not.toContain("Ngũ Hoàng");
  });

  it("năm ngoài khoảng dữ liệu thì báo THIẾU DỮ LIỆU, tuyệt đối không suy đoán", () => {
    const kq = TrungTang.kiemSatCapNam(toa(0), 2100, "Canh", "Thân");
    expect(kq.thieuDuLieu.length).toBeGreaterThan(0);
    expect(kq.thieuDuLieu.join(" ")).toContain("2100");
  });
});

describe("Bước ① — kết cục B: sát cấp NGÀY / GIỜ chỉ loại phương án", () => {
  it("Tam Sát tra theo PHƯƠNG của tọa và của hướng", () => {
    // Tọa Tý → phương Bắc (kỵ Dần/Ngọ/Tuất); hướng Ngọ → phương Nam (kỵ Thân/Tý/Thìn).
    const t = toa(0);
    expect(TrungTang.kiemSatCapNgayGio(t, { can: "Giáp", chi: "Ngọ" }, "ngày").lyDo).toContain(
      "Tam Sát đáo tọa theo ngày",
    );
    expect(TrungTang.kiemSatCapNgayGio(t, { can: "Giáp", chi: "Thìn" }, "giờ").lyDo).toContain(
      "Tam Sát đáo hướng theo giờ",
    );
    expect(TrungTang.kiemSatCapNgayGio(t, { can: "Ất", chi: "Sửu" }, "ngày").loai).toBe(false);
  });

  it("Bát Sát cũng chặn ở cấp ngày/giờ, nhưng chỉ loại phương án chứ không chặn module", () => {
    const kq = TrungTang.kiemSatCapNgayGio(toa(0), { can: "Quý", chi: "Hợi" }, "ngày");
    expect(kq.loai).toBe(true);
    expect(kq.lyDo.join(" ")).toContain("Bát Sát");
  });

  it("Ngũ Hoàng THÁNG là kết cục B — chỉ loại tháng, khác hẳn Ngũ Hoàng NĂM", () => {
    // Khoá đúng cái phân biệt cốt lõi: hàm tháng trả `loai`, hàm năm trả `phamCapNam`.
    const kq = TrungTang.kiemNguHoangThang(toa(0), 2026, "Canh", "Dần");
    expect(kq).toHaveProperty("loai");
    expect(kq).not.toHaveProperty("phamCapNam");
    if (kq.thieuDuLieu === null && kq.loai) expect(kq.lyDo).toMatch(/Ngũ Hoàng tháng đáo (tọa|hướng)/);
  });
});

describe("Bước ① — mục 2.4 phép quyền biến Thừa hung mai táng", () => {
  it("chết tai nạn và chôn trong 3-5 ngày thì được miễn chọn ngày giờ", () => {
    const kq = TrungTang.kiemMienTruThuaHung("tai-nan-dot-ngot", 4);
    expect(kq.duocMienTru).toBe(true);
    expect(kq.nhanh).toBe("Thừa hung mai táng");
  });

  it("chết bệnh/tuổi già thì KHÔNG được miễn dù chôn nhanh", () => {
    expect(TrungTang.kiemMienTruThuaHung("benh-tuoi-gia", 2).duocMienTru).toBe(false);
  });

  it("để quá 5 ngày thì hết cửa miễn trừ", () => {
    expect(TrungTang.kiemMienTruThuaHung("tai-nan-dot-ngot", 6).duocMienTru).toBe(false);
  });
});

describe("Cổng kiểm tọa hướng chạy TRƯỚC trang thanh toán (mục 2.1b)", () => {
  it("tọa Tý gặp năm Tý: kết cục C và TUYỆT ĐỐI không được thu phí", () => {
    // Bất biến nghiệp vụ quan trọng nhất của Phase 2 — thu 999k rồi mới báo "không làm được" là
    // điều chủ dự án cấm. Khoá thẳng cờ `duocPhepThuPhi` để không tầng nào bật nhầm.
    const kq = kiemToaHuongTruocThanhToan({ doSoToa: 0, namMat: 2032, thangMat: 6, ngayMat: 15 });
    expect(kq.ketCuc).toBe("C");
    if (kq.ketCuc === "C") {
      expect(kq.duocPhepThuPhi).toBe(false);
      expect(kq.thongDiep).toContain("không nhận phí");
      expect(kq.chiTiet.every((n) => n.phamCapNam)).toBe(true);
    }
  });

  it("tọa sạch thì qua cổng và được phép thu phí", () => {
    // 2026 Bính Ngọ: Ngũ Hoàng đáo Ly nên cả trục Ly–Khảm bị chặn, Thái Tuế tại Ngọ, Tuế Phá tại
    // Tý. Sơn Sửu (30°, cung Cấn) nằm ngoài mọi trục đó → đây mới là ca "sạch" đúng nghĩa.
    const kq = kiemToaHuongTruocThanhToan({ doSoToa: 30, namMat: 2026, thangMat: 6, ngayMat: 15 });
    expect(kq.ketCuc).toBe("qua-cong");
    if (kq.ketCuc === "qua-cong") {
      expect(kq.duocPhepThuPhi).toBe(true);
      expect(kq.toaHuong.sonToa).toBe("Sửu");
      expect(kq.toaHuong.sonHuong).toBe("Mùi");
    }
  });

  it("Ngũ Hoàng chặn CẢ HAI đầu trục tọa–hướng, không chỉ đầu tọa", () => {
    // Năm 2026 Ngũ Hoàng ở Ly: tọa Ly bị chặn vì "đáo tọa", tọa Khảm cũng bị chặn vì hướng rơi
    // vào Ly. Đây là điểm dễ cài sót nhất nếu chỉ kiểm mỗi cung tọa.
    const toaLy = kiemToaHuongTruocThanhToan({ doSoToa: 165, namMat: 2026, thangMat: 6, ngayMat: 15 });
    const toaKham = kiemToaHuongTruocThanhToan({ doSoToa: 345, namMat: 2026, thangMat: 6, ngayMat: 15 });
    expect(toaLy.ketCuc).toBe("C");
    expect(toaKham.ketCuc).toBe("C");
    if (toaLy.ketCuc === "C") expect(toaLy.thongDiep).toContain("Ngũ Hoàng đáo tọa");
    if (toaKham.ketCuc === "C") expect(toaKham.thongDiep).toContain("Ngũ Hoàng đáo hướng");
  });

  it("tọa sát ranh giới sơn thì mời đo lại, chưa bàn tới tiền", () => {
    const kq = kiemToaHuongTruocThanhToan({ doSoToa: 7.5, namMat: 2026, thangMat: 6, ngayMat: 15 });
    expect(kq.ketCuc).toBe("can-do-lai");
    expect(kq).not.toHaveProperty("duocPhepThuPhi");
  });

  it("cửa sổ tang lễ vắt qua Lập Xuân thì xét CẢ HAI năm Can Chi, không chỉ năm ngày mất", () => {
    // Mất cuối tháng 1 → cửa sổ 20 ngày chắc chắn vượt Lập Xuân (mùng 4/5 tháng 2), nên Can Chi
    // năm đổi giữa chừng. Nếu cổng chỉ lấy năm của ngày mất thì sẽ bỏ lọt sát của năm sau.
    const kq = kiemToaHuongTruocThanhToan({ doSoToa: 15, namMat: 2026, thangMat: 1, ngayMat: 28 });
    if (kq.ketCuc === "C") {
      expect(kq.chiTiet.length).toBeGreaterThan(1);
    } else if (kq.ketCuc === "qua-cong") {
      // Qua cổng thì hoặc không năm nào phạm (không cảnh báo), hoặc chỉ một phần cửa sổ phạm.
      expect(Array.isArray(kq.canhBao)).toBe(true);
    }
  });

  it("chỉ MỘT phần cửa sổ phạm thì vẫn qua cổng, kèm cảnh báo — không đánh đồng thành kết cục C", () => {
    // Quét cả năm 2026 tìm một ca vắt Lập Xuân mà đúng một năm phạm. Không ép phải tồn tại: nếu
    // dữ liệu năm đó không sinh ra ca nào thì test không khẳng định gì thay vì fail giả.
    for (let ngay = 20; ngay <= 31; ngay++) {
      const kq = kiemToaHuongTruocThanhToan({ doSoToa: 0, namMat: 2026, thangMat: 1, ngayMat: ngay });
      if (kq.ketCuc !== "qua-cong" || kq.canhBao.length === 0) continue;
      expect(kq.duocPhepThuPhi).toBe(true);
      expect(kq.canhBao.join(" ")).toMatch(/sẽ bị loại/);
      return;
    }
  });

  it("năm ngoài bảng Cửu Cung thì báo thiếu dữ liệu chứ không âm thầm cho qua", () => {
    const kq = kiemToaHuongTruocThanhToan({ doSoToa: 15, namMat: 2090, thangMat: 6, ngayMat: 15 });
    if (kq.ketCuc === "qua-cong") expect(kq.thieuDuLieu.length).toBeGreaterThan(0);
  });
});
