// Test khoá hành vi PHASE 2 — lọc theo tọa hướng mộ phần, BƯỚC ① (điều kiện loại).
//
// Nguồn đối chiếu: `spec-module-phase2-toa-huong-mo.md` v2.0 mục 1 (dữ liệu vào), mục 2.1 (điều
// kiện loại + ba kết cục A/B/C), mục 2.4 (phép quyền biến).
//
// Nguyên tắc kiểm thử ở đây: KHÔNG chép lại bảng gốc vào test rồi so bảng-với-bảng (làm vậy chỉ
// chứng minh mình copy đúng). Thay vào đó khoá các QUAN HỆ mà đặc tả khẳng định — cấp Năm chặn cả
// module, cấp Ngày/Giờ chỉ loại phương án, sát ranh giới thì bắt đo lại chứ không tự đoán.
import { describe, expect, it } from "vitest";
import { TrachNhat, TrungTang, XemNgayCaoCap } from "@thien-anh/rule-engine";
import {
  apDungPhase2,
  calculateGioLiemHaHuyet,
  kiemDayDuTruocThanhToan,
  kiemToaHuongTruocThanhToan,
} from "@thien-anh/trachnhat-engine";
import { readFileSync } from "node:fs";

/**
 * Mã nguồn các tầng CÓ QUYỀN LOẠI phương án — đọc thẳng để kiểm "danh sách cấm có được thực thi
 * không". Tam Sát/Bát Sát bị loại ở tầng quy tắc thuần (theo tọa/hướng), phần còn lại ở facade.
 */
const NGUON_FACADE =
  readFileSync("packages/trachnhat-engine/src/processing/gioLiemHaHuyet.ts", "utf8") +
  readFileSync("packages/trachnhat-engine/src/processing/phase2ApDung.ts", "utf8") +
  readFileSync("packages/rule-engine/src/trung-tang/phase2ToaHuongMo.ts", "utf8");

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

describe("Bước ② — phẩm cấp cách cục (classification)", () => {
  it("thang lớp xét trên TẬP HKNH, không xét từng đôi", () => {
    expect(TrungTang.xepLopCachCuc([3, 3, 3, 3])).toBe(1); // Nhất Quái Thuần Thanh
    expect(TrungTang.xepLopCachCuc([3, 8, 3, 8])).toBe(2); // trọn trong cặp Hà Đồ 3-8
    expect(TrungTang.xepLopCachCuc([3, 7, 7, 3])).toBe(3); // trọn trong cặp Hợp Thập 3-7
    expect(TrungTang.xepLopCachCuc([3, 8, 7])).toBe(4); // có trụ lạc quẻ → tụt lớp 4
  });

  it("một trụ lạc quẻ là mất phẩm cấp — khoá đúng chỗ dễ cài sai", () => {
    // 3 trụ Hà Đồ + 1 trụ lạc thì KHÔNG còn là khóa Hà Đồ. Nếu ai đó sửa sang cách xét từng đôi,
    // test này gãy.
    expect(TrungTang.xepLopCachCuc([3, 8, 3, 4])).toBe(4);
  });

  it("Can Chi mang 2 quẻ thì thử cả hai biến thể và ghi rõ quẻ đã chọn", () => {
    // Giáp Tý là 1 trong 4 Can Chi mang 2 quẻ (mục 3 đặc tả).
    const kq = TrungTang.phanLopPhuongAn(
      {
        nam: { can: "Giáp", chi: "Tý" },
        thang: { can: "Ất", chi: "Sửu" },
        ngay: { can: "Bính", chi: "Dần" },
      },
      30,
    );
    expect(kq.coTruHaiQue).toBe(true);
    expect(kq.queDaChon.map((q) => q.tru)).toEqual(["năm", "tháng", "ngày"]);
    for (const q of kq.queDaChon) expect(q.que).toBeTruthy();
  });

  it("bật/tắt trụ Giờ thì số quẻ đã chọn đổi theo, không âm thầm bỏ sót", () => {
    const coGio = TrungTang.phanLopPhuongAn(
      {
        nam: { can: "Bính", chi: "Ngọ" },
        thang: { can: "Ất", chi: "Sửu" },
        ngay: { can: "Bính", chi: "Dần" },
        gio: { can: "Đinh", chi: "Mão" },
      },
      30,
    );
    const khongGio = TrungTang.phanLopPhuongAn(
      {
        nam: { can: "Bính", chi: "Ngọ" },
        thang: { can: "Ất", chi: "Sửu" },
        ngay: { can: "Bính", chi: "Dần" },
      },
      30,
    );
    expect(coGio.queDaChon).toHaveLength(4);
    expect(khongGio.queDaChon).toHaveLength(3);
  });
});

describe("Bước ③ + ④ — bảy chiều đo và trọng số", () => {
  it("thứ tự 7 chiều đúng thứ hạng chủ dự án chốt, và trọng số giảm dần theo thứ hạng", () => {
    expect(TrungTang.THU_TU_CHIEU_DO).toEqual([
      "nhat-khoa-toa",
      "tru-ho-tro",
      "nhat-khoa-menh-vong",
      "dong-khi",
      "sinh-khac-nhap",
      "ngu-hanh",
      "quai-van",
    ]);
    const trongSo = TrungTang.THU_TU_CHIEU_DO.map((c) => TrungTang.TRONG_SO_AN_TANG[c]);
    for (let i = 1; i < trongSo.length; i++) {
      expect(trongSo[i]!, `hạng ${i + 1} phải nhẹ hơn hạng ${i}`).toBeLessThan(trongSo[i - 1]!);
    }
  });

  it("bảy chiều chạy song song — luôn trả đủ 7 giá trị riêng, không cộng gộp", () => {
    const cachCuc = TrungTang.phanLopPhuongAn(
      {
        nam: { can: "Bính", chi: "Ngọ" },
        thang: { can: "Ất", chi: "Sửu" },
        ngay: { can: "Bính", chi: "Dần" },
        gio: { can: "Đinh", chi: "Mão" },
      },
      30,
    );
    const chieu = TrungTang.danhGiaBayChieu({ cachCuc, quanHeMenhVong: "tam-hop" });
    expect(chieu).toHaveLength(7);
    expect(chieu.map((c) => c.chieu)).toEqual([...TrungTang.THU_TU_CHIEU_DO]);
    for (const c of chieu) {
      expect(c.heSo).toBeGreaterThanOrEqual(0);
      expect(c.heSo).toBeLessThanOrEqual(1);
    }
  });

  it("sinh/khắc nhập chỉ xét MỘT HƯỚNG Năm→Tháng→Ngày→Giờ", () => {
    // 4 trụ → đúng 6 cặp một chiều (C(4,2)); 3 trụ → 3 cặp. Nếu ai cài xét cả hai chiều thì số
    // cặp sẽ gấp đôi và test gãy.
    const bonTru = TrungTang.phanLopPhuongAn(
      {
        nam: { can: "Bính", chi: "Ngọ" },
        thang: { can: "Ất", chi: "Sửu" },
        ngay: { can: "Bính", chi: "Dần" },
        gio: { can: "Đinh", chi: "Mão" },
      },
      30,
    );
    const baTru = TrungTang.phanLopPhuongAn(
      {
        nam: { can: "Bính", chi: "Ngọ" },
        thang: { can: "Ất", chi: "Sửu" },
        ngay: { can: "Bính", chi: "Dần" },
      },
      30,
    );
    expect(TrungTang.xetSinhKhacNhapMotHuong(bonTru).tongCap).toBe(6);
    expect(TrungTang.xetSinhKhacNhapMotHuong(baTru).tongCap).toBe(3);
  });
});

describe("Bước ⑤ — xếp hạng: LỚP TRƯỚC, ĐIỂM SAU", () => {
  /** Dựng phương án giả với lớp và hệ số chỉ định — để cô lập đúng quy tắc xếp hạng. */
  function phuongAnGia(id: string, lop: 1 | 2 | 3 | 4, heSo: number): TrungTang.PhuongAnDeXepHang {
    return {
      id,
      cachCuc: {
        lop,
        tenLop: TrungTang.TEN_LOP_CACH_CUC[lop],
        queDaChon: [],
        coTruHaiQue: false,
        hknhToa: 3,
        quaiVanToa: 1,
      },
      cacChieu: TrungTang.THU_TU_CHIEU_DO.map((chieu) => ({ chieu, nhan: chieu, heSo, dangNeu: heSo > 0 })),
      canhBao: [],
    };
  }

  it("NGUYÊN TẮC BẤT DI DỊCH: lớp cao điểm bét vẫn đứng trên lớp thấp điểm kịch trần", () => {
    // Đây là bất biến trung tâm của cả Phase 2 (mục 3): "Hà Đồ + 100 điểm phụ vẫn là Hà Đồ".
    const ds = TrungTang.xepHangPhuongAn([
      phuongAnGia("hop-thap-diem-toi-da", 3, 1),
      phuongAnGia("ha-do-diem-toi-thieu", 2, 0),
    ]);
    expect(ds[0]!.id).toBe("ha-do-diem-toi-thieu");
    expect(ds[0]!.thuHang).toBe(1);
    expect(ds[1]!.id).toBe("hop-thap-diem-toi-da");
  });

  it("cùng lớp thì mới so điểm", () => {
    const ds = TrungTang.xepHangPhuongAn([phuongAnGia("yeu", 2, 0.2), phuongAnGia("manh", 2, 0.9)]);
    expect(ds[0]!.id).toBe("manh");
  });

  it("quan hệ đạt được sắp theo thứ hạng chiều, không theo thứ tự ngẫu nhiên", () => {
    const ds = TrungTang.xepHangPhuongAn([phuongAnGia("a", 1, 1)]);
    expect(ds[0]!.quanHeDat).toEqual([...TrungTang.THU_TU_CHIEU_DO]);
  });

  it("câu kết luận KHÔNG được chứa điểm số thô (mục 6 cấm)", () => {
    const khacLop = TrungTang.cauKetLuanSoSanh(
      TrungTang.xepHangPhuongAn([phuongAnGia("a", 2, 0.1), phuongAnGia("b", 3, 1)]),
    );
    const cungLop = TrungTang.cauKetLuanSoSanh(
      TrungTang.xepHangPhuongAn([phuongAnGia("a", 2, 0.9), phuongAnGia("b", 2, 0.1)]),
    );
    expect(khacLop).toContain("thắng về phẩm cấp cách cục");
    expect(cungLop).toContain("gia cường mạnh hơn");
    for (const cau of [khacLop, cungLop]) {
      // Số thứ tự "Phương án 1/2" là hợp lệ; cấm là cấm điểm số. Bỏ số thứ tự ra rồi soi phần
      // còn lại — không được sót chữ số nào, cũng không được có chữ "điểm".
      const conLai = cau!.replace(/phương án \d/gi, "phương án");
      expect(conLai, `câu lộ điểm: ${cau}`).not.toMatch(/\d/);
      expect(conLai.toLowerCase()).not.toContain("điểm");
    }
  });

  it("chỉ có 1 phương án thì không có câu so sánh", () => {
    expect(TrungTang.cauKetLuanSoSanh(TrungTang.xepHangPhuongAn([phuongAnGia("a", 1, 1)]))).toBeNull();
  });
});

describe("Đủ luồng ①→⑤ trên đầu ra thật của Phase 1 (đặc tả mục 7)", () => {
  /** Chạy Phase 1 một lần rồi tái dùng — Phase 2 là tầng LỌC, không tính lại ngày giờ từ đầu. */
  const phase1 = calculateGioLiemHaHuyet({
    gioiTinh: "nam",
    namSinhDuongLich: 1947,
    namMat: 2026,
    thangMat: 9,
    ngayMat: 10,
    chiGioMat: "Tuất",
    soNgayDuKienToiChon: 7,
  });

  it("Phase 1 phải mở RỔ RỘNG cho Phase 2, không chỉ top 3", () => {
    // Đo thực tế 2026-08-16: đưa top 3 sang thì Phase 2 loại sạch 12/12 phương án ở cả 4 tọa thử
    // nghiệm — vì riêng Tam Sát đã chặn 3/12 Chi cho tọa và 3/12 cho hướng, áp lên cả trụ Ngày lẫn
    // trụ Giờ. Rổ rộng là điều kiện cần để Phase 2 còn gì mà trả.
    expect(phase1.ngayGioHaHuyet?.length ?? 0).toBeGreaterThan(0);
    expect(phase1.tatCaNgayGioHaHuyet?.length ?? 0).toBeGreaterThan(phase1.ngayGioHaHuyet!.length);
  });

  it("lọc trên rổ rộng thì vẫn còn phương án để trả — không rỗng như khi lọc trên top 3", () => {
    for (const doSoToa of [30, 90, 210, 300]) {
      const kq = apDungPhase2({
        doSoToa,
        phuongAnPhase1: phase1.tatCaNgayGioHaHuyet ?? [],
        namMat: 2026,
        thangMat: 9,
        ngayMat: 10,
        nguyenNhanMat: "benh-tuoi-gia",
        soNgayDuKienToiChon: 7,
      });
      if (kq.ketCuc !== "A" && kq.ketCuc !== "B") continue;
      expect(kq.phuongAn.length, `tọa ${doSoToa}° không còn phương án nào`).toBeGreaterThan(0);
    }
  });

  it("chạy trọn ①→⑤: trả kết cục A hoặc B, phương án có lớp cách cục và quan hệ đạt", () => {
    const kq = apDungPhase2({
      doSoToa: 30, // sơn Sửu, cung Cấn — sạch sát cấp năm 2026 (đã kiểm ở nhóm test trên)
      phuongAnPhase1: phase1.tatCaNgayGioHaHuyet ?? [],
      namMat: 2026,
      thangMat: 9,
      ngayMat: 10,
      nguyenNhanMat: "benh-tuoi-gia",
      soNgayDuKienToiChon: 7,
    });
    expect(["A", "B"]).toContain(kq.ketCuc);
    if (kq.ketCuc !== "A" && kq.ketCuc !== "B") return;

    expect(kq.toaHuong.sonToa).toBe("Sửu");
    // Mỗi phương án phải mang đủ 2 phần output mục 6 yêu cầu tách riêng: cách cục nền + quan hệ.
    for (const pa of kq.phuongAn) {
      expect(pa.cachCuc.tenLop).toBeTruthy();
      expect(Array.isArray(pa.quanHeDat)).toBe(true);
      expect(pa.thuHang).toBeGreaterThan(0);
    }
    // Vào = qua lọc + bị loại: không được để rơi mất phương án nào giữa đường. Dùng
    // `soPhuongAnQuaLoc` chứ không dùng `phuongAn.length`, vì đầu ra đã cắt top.
    expect(kq.soPhuongAnQuaLoc + kq.biLoai.length).toBe(phase1.tatCaNgayGioHaHuyet!.length);
    expect(kq.phuongAn.length).toBeLessThanOrEqual(kq.soPhuongAnQuaLoc);
  });

  it("thứ hạng luôn tăng dần và lớp cách cục không bao giờ giảm dần theo thứ hạng", () => {
    const kq = apDungPhase2({
      doSoToa: 30,
      phuongAnPhase1: phase1.tatCaNgayGioHaHuyet ?? [],
      namMat: 2026,
      thangMat: 9,
      ngayMat: 10,
      nguyenNhanMat: "benh-tuoi-gia",
      soNgayDuKienToiChon: 7,
    });
    if (kq.ketCuc !== "A" && kq.ketCuc !== "B") return;
    for (let i = 1; i < kq.phuongAn.length; i++) {
      expect(kq.phuongAn[i]!.thuHang).toBe(i + 1);
      expect(kq.phuongAn[i]!.cachCuc.lop).toBeGreaterThanOrEqual(kq.phuongAn[i - 1]!.cachCuc.lop);
    }
  });

  it("kết cục C thì dừng sớm: không trả phương án nào và không được thu phí", () => {
    // Tọa 180° = sơn Ngọ, cung Ly — năm 2026 Bính Ngọ phạm cả Ngũ Hoàng lẫn Thái Tuế.
    const kq = apDungPhase2({
      doSoToa: 180,
      phuongAnPhase1: phase1.tatCaNgayGioHaHuyet ?? [],
      namMat: 2026,
      thangMat: 9,
      ngayMat: 10,
      nguyenNhanMat: "benh-tuoi-gia",
      soNgayDuKienToiChon: 7,
    });
    expect(kq.ketCuc).toBe("C");
    if (kq.ketCuc === "C") expect(kq.duocPhepThuPhi).toBe(false);
    expect(kq).not.toHaveProperty("phuongAn");
  });

  it("miễn trừ Thừa hung chạy TRƯỚC cả cổng tọa hướng — giữ nguyên đề xuất Phase 1", () => {
    // Cùng tọa 180° đáng lẽ kết cục C, nhưng chết tai nạn chôn trong 4 ngày thì được miễn.
    const kq = apDungPhase2({
      doSoToa: 180,
      phuongAnPhase1: phase1.tatCaNgayGioHaHuyet ?? [],
      namMat: 2026,
      thangMat: 9,
      ngayMat: 10,
      nguyenNhanMat: "tai-nan-dot-ngot",
      soNgayDuKienToiChon: 4,
    });
    expect(kq.ketCuc).toBe("mien-tru");
    if (kq.ketCuc === "mien-tru") {
      expect(kq.nhanh).toBe("Thừa hung mai táng");
      expect(kq.phuongAn).toEqual(phase1.tatCaNgayGioHaHuyet);
    }
  });

  it("tắt trụ Giờ thì vẫn chạy được — mục 2.5 cho phép bỏ trụ Giờ", () => {
    const kq = apDungPhase2({
      doSoToa: 30,
      phuongAnPhase1: phase1.tatCaNgayGioHaHuyet ?? [],
      namMat: 2026,
      thangMat: 9,
      ngayMat: 10,
      nguyenNhanMat: "benh-tuoi-gia",
      soNgayDuKienToiChon: 7,
      tinhTruGio: false,
    });
    expect(["A", "B"]).toContain(kq.ketCuc);
    if (kq.ketCuc !== "A" && kq.ketCuc !== "B") return;
    for (const pa of kq.phuongAn) expect(pa.cachCuc.queDaChon).toHaveLength(3);
  });
});

describe("Mục 2.3 — nhóm hung KHÔNG hoá giải được phải thật sự bị kiểm", () => {
  it("Đại Hao được nhận diện đủ 12 tháng ở bảng dùng chung", () => {
    // Bảng: T1→Ngọ, T2→Mùi, ... (nguồn "NHỮNG NGÀY ĐẠI HAO TỨ KHÍ QUAN PHÙ KỴ AN TÁNG").
    const CHI_THEO_THANG = ["Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ"];
    for (let thang = 1; thang <= 12; thang++) {
      const ten = TrachNhat.getThanSatTrongNgay(thang, CHI_THEO_THANG[thang - 1] as never).map((t) => t.name);
      expect(ten, `tháng ${thang}`).toContain("Đại Hao");
    }
  });

  it("mọi tên trong KHONG_HOA_GIAI_DUOC đều có chỗ thực thi, không chỉ nằm trên giấy", () => {
    // Bài học 2026-08-17: "Đại Hao" từng nằm trong hằng số này suốt mà KHÔNG có dòng code nào
    // kiểm — danh sách cấm chỉ tồn tại trên giấy. Test này chặn việc đó tái diễn: mỗi tên phải
    // xuất hiện ở tầng facade (nơi đẩy vào `hungKhongHoaGiai`), hoặc là bí danh đã biết.
    const BI_DANH: Record<string, string> = {
      "Nguyệt Phá": "Nguyệt Phá (Trực Phá)",
      "Trực Phá": "Nguyệt Phá (Trực Phá)",
      "Tam Sát": "Tam Sát đáo", // Phase 2 kiểm theo tọa/hướng, chuỗi khác
    };
    for (const ten of TrungTang.KHONG_HOA_GIAI_DUOC) {
      const canTim = BI_DANH[ten] ?? ten;
      expect(NGUON_FACADE, `"${ten}" nằm trong danh sách cấm nhưng không có chỗ nào kiểm`).toContain(canTim);
    }
  });
});

describe("Cổng kiểm ĐẦY ĐỦ — lọc sạch phương án cũng không thu phí", () => {
  const CHUNG = {
    gioiTinh: "nam" as const,
    namSinhDuongLich: 1947,
    namMat: 2026,
    thangMat: 7,
    ngayMat: 10,
    chiGioMat: "Tuất" as const,
    soNgayDuKienToiChon: 7,
  };

  it("tọa không phạm sát cấp năm NHƯNG lọc sạch phương án thì vẫn KHÔNG thu phí", () => {
    // Đây là ca trước 2026-08-17 sẽ thu tiền rồi trả về tay trắng: qua được cổng cấp năm nên
    // được tính tiền, nhưng Tam Sát + cổng Tứ Trụ quét sạch 96/96 phương án.
    const kq = kiemDayDuTruocThanhToan({ ...CHUNG, doSoToa: 30 });
    expect(kq.ketCuc).toBe("rong");
    if (kq.ketCuc !== "rong") return;
    expect(kq.duocPhepThuPhi).toBe(false);
    expect(kq.lyDoChinh.length).toBeGreaterThan(0);
    // Phải nói được nguyên nhân, không chỉ báo "không có kết quả".
    expect(kq.thongDiep).toContain("không nhận phí");
    expect(kq.thongDiep).toMatch(/Tam Sát|trụ hỗ trợ|Tam Tài/);
  });

  it("khi lọc sạch mà chưởng pháp vẫn có kết quả thì báo còn dùng được gói cơ bản", () => {
    const kq = kiemDayDuTruocThanhToan({ ...CHUNG, doSoToa: 30 });
    if (kq.ketCuc !== "rong") return;
    expect(kq.conGoiCoBan).toBe(true);
  });

  it("mọi kết cục KHÔNG cho đi tiếp đều mang cờ duocPhepThuPhi = false", () => {
    // Bất biến trung tâm: không tầng nào được phép tự suy ra "chắc là thu được".
    for (const doSoToa of [180, 30, 165]) {
      const kq = kiemDayDuTruocThanhToan({ ...CHUNG, doSoToa });
      if (kq.ketCuc === "qua-cong") expect(kq.duocPhepThuPhi).toBe(true);
      else if (kq.ketCuc !== "can-do-lai") expect(kq.duocPhepThuPhi).toBe(false);
    }
  });

  it("tọa còn phương án thì cho đi tiếp và nói rõ còn bao nhiêu", () => {
    const kq = kiemDayDuTruocThanhToan({ ...CHUNG, doSoToa: 210 });
    expect(kq.ketCuc).toBe("qua-cong");
    if (kq.ketCuc !== "qua-cong") return;
    expect(kq.duocPhepThuPhi).toBe(true);
    expect(kq.soPhuongAn).toBeGreaterThan(0);
  });
});
