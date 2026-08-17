// Test khoá hành vi module NGÀY CƯỚI HỎI TỔNG HỢP.
//
// Nguồn đối chiếu: `modulengaycuoihoitonghop final.md` (v6) — mục 14a/14b (Hồng Loan/Thiên Hỷ),
// mục 21/22/24 (trọng số), mục 32 (xếp hạng), mục 36 (nguyên tắc không được vi phạm).
import { describe, expect, it } from "vitest";
import { CuoiHoi } from "@thien-anh/rule-engine";

const CHI_12 = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"] as const;

describe("Hồng Loan / Thiên Hỷ (mục 14b)", () => {
  it("khớp ví dụ nguyên văn đặc tả: Tý → Hồng Loan Mão, Thiên Hỷ Dậu", () => {
    expect(CuoiHoi.getHongLoan("Tý")).toBe("Mão");
    expect(CuoiHoi.getThienHy("Tý")).toBe("Dậu");
  });

  it("Thiên Hỷ LUÔN là đối xung của Hồng Loan — không có bảng riêng để lệch", () => {
    // Đây là lý do đặc tả bỏ hard-code bảng Thiên Hỷ: hai bảng rời nhau thì sớm muộn cũng lệch.
    for (const chi of CHI_12) {
      expect(CuoiHoi.getThienHy(chi), `chi ${chi}`).toBe(CuoiHoi.chiDoiXung(CuoiHoi.getHongLoan(chi)));
    }
  });

  it("đối xung là quan hệ hai chiều và cách nhau đúng 6 cung", () => {
    for (const chi of CHI_12) {
      const doi = CuoiHoi.chiDoiXung(chi);
      expect(CuoiHoi.chiDoiXung(doi)).toBe(chi);
      expect(doi).not.toBe(chi);
    }
  });

  it("mỗi Chi năm cho một Hồng Loan khác nhau — bảng là song ánh, không có Chi nào bị bỏ sót", () => {
    const ra = new Set(CHI_12.map((c) => CuoiHoi.getHongLoan(c)));
    expect(ra.size).toBe(12);
  });
});

describe("Hai lớp hỷ tinh — cá nhân và lưu niên KHÔNG được trộn (mục 14a)", () => {
  it("ngày trúng Hồng Loan cô dâu thì CHỈ cô dâu được tính, không lan sang chú rể", () => {
    // Cô dâu Dần → Hồng Loan Sửu. Chú rể Ngọ → Hồng Loan Dậu, Thiên Hỷ Mão.
    const kq = CuoiHoi.xetHyTinhNgay("Sửu", "Dần", "Ngọ", "Thìn");
    expect(kq.coDauHongLoan).toBe(true);
    expect(kq.chuReHongLoan).toBe(false);
    expect(kq.chuReThienHy).toBe(false);
    expect(kq.soDieuKienCaNhan).toBe(1);
    expect(kq.songHy).toBe(false);
  });

  it("chạm từ 2 hỷ tinh cá nhân trở lên thì bật song hỷ", () => {
    // Cô dâu Dần → Hồng Loan Sửu; chú rể Thân → Hồng Loan Mùi, Thiên Hỷ Sửu.
    // Ngày Sửu chạm cả Hồng Loan cô dâu lẫn Thiên Hỷ chú rể.
    const kq = CuoiHoi.xetHyTinhNgay("Sửu", "Dần", "Thân", "Thìn");
    expect(kq.coDauHongLoan).toBe(true);
    expect(kq.chuReThienHy).toBe(true);
    expect(kq.soDieuKienCaNhan).toBe(2);
    expect(kq.songHy).toBe(true);
  });

  it("chỉ trúng lưu niên mà không trúng cá nhân ai thì KHÔNG được tính là song hỷ", () => {
    // Nguyên tắc 14: cấm kết luận "ngày Hồng Loan nên tốt cho tất cả mọi người".
    const kq = CuoiHoi.xetHyTinhNgay("Mão", "Sửu", "Sửu", "Tý");
    expect(kq.luuNienHongLoan).toBe(true);
    expect(kq.soDieuKienCaNhan).toBe(0);
    expect(kq.songHy).toBe(false);
    // Và phải nói rõ đây là lưu niên, để người đọc không tưởng là hợp riêng cô dâu/chú rể.
    expect(kq.moTa.join(" ")).toContain("lưu niên");
  });

  it("lưu niên đóng góp ít hơn hẳn hỷ tinh cá nhân", () => {
    const chiCaNhan = CuoiHoi.tinhDiemHyTinh(
      { coDauHongLoan: true, coDauThienHy: false, chuReHongLoan: false, chuReThienHy: false, luuNienHongLoan: false, luuNienThienHy: false, songHy: false, moTa: [] },
      0,
    );
    const chiLuuNien = CuoiHoi.tinhDiemHyTinh(
      { coDauHongLoan: false, coDauThienHy: false, chuReHongLoan: false, chuReThienHy: false, luuNienHongLoan: true, luuNienThienHy: false, songHy: false, moTa: [] },
      0,
    );
    expect(chiCaNhan.diem).toBeGreaterThan(chiLuuNien.diem);
  });

  it("song hỷ là phần thưởng RIÊNG, không phải cộng tuyến tính", () => {
    const chung = { coDauHongLoan: true, coDauThienHy: false, chuReHongLoan: false, chuReThienHy: true, luuNienHongLoan: false, luuNienThienHy: false, moTa: [] };
    const co = CuoiHoi.tinhDiemHyTinh({ ...chung, songHy: true }, 0);
    const khong = CuoiHoi.tinhDiemHyTinh({ ...chung, songHy: false }, 0);
    expect(co.diem).toBeGreaterThan(khong.diem);
    expect(co.moTa.join(" ")).toContain("Song hỷ");
  });
});

describe("Cân điểm cặp đôi (mục 3, 23 + nguyên tắc 4)", () => {
  it("ngày lệch nặng phải thua ngày đều, dù trung bình cộng bằng nhau", () => {
    // Nguyên tắc 4: cấm để điểm cực cao của một người che điểm cực thấp của người kia.
    const deu = CuoiHoi.canDiemCapDoi(7, 7);
    const lech = CuoiHoi.canDiemCapDoi(9.8, 4.2); // trung bình cộng cũng là 7
    expect(lech).toBeLessThan(deu);
  });

  it("hai người bằng điểm thì không bị phạt gì", () => {
    expect(CuoiHoi.canDiemCapDoi(8, 8)).toBeCloseTo(8, 5);
  });

  it("chế độ ưu tiên nghiêng về đúng người được chọn", () => {
    const coDauCao = { coDau: 9, chuRe: 6 };
    const uuCoDau = CuoiHoi.canDiemCapDoi(coDauCao.coDau, coDauCao.chuRe, "uu-tien-co-dau");
    const uuChuRe = CuoiHoi.canDiemCapDoi(coDauCao.coDau, coDauCao.chuRe, "uu-tien-chu-re");
    expect(uuCoDau).toBeGreaterThan(uuChuRe);
  });

  it("không bao giờ trả điểm âm", () => {
    expect(CuoiHoi.canDiemCapDoi(10, 0)).toBeGreaterThanOrEqual(0);
  });
});

describe("Trọng số và xếp hạng", () => {
  it("trọng số ngày cộng đúng 100 (mục 21)", () => {
    const tong = Object.values(CuoiHoi.TRONG_SO_NGAY).reduce((a, b) => a + b, 0);
    expect(tong).toBe(100);
  });

  it("trọng số giờ cộng đúng 100 (mục 22)", () => {
    expect(Object.values(CuoiHoi.TRONG_SO_GIO).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("trọng số nội bộ cát tinh cộng đúng 100 (mục 14a)", () => {
    expect(Object.values(CuoiHoi.TRONG_SO_CAT_TINH).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("mỗi nghi lễ có tỷ trọng ngày+giờ bằng 100, và đón dâu nặng về GIỜ hơn ngày", () => {
    for (const [nghiLe, ty] of Object.entries(CuoiHoi.TY_TRONG_NGAY_GIO)) {
      expect(ty.ngay + ty.gio, nghiLe).toBe(100);
    }
    // Đón dâu là nghi lễ duy nhất giờ nặng hơn ngày (mục 24).
    expect(CuoiHoi.TY_TRONG_NGAY_GIO["don-dau"].gio).toBeGreaterThan(CuoiHoi.TY_TRONG_NGAY_GIO["don-dau"].ngay);
  });

  it("xếp hạng đúng mốc đặc tả mục 32", () => {
    expect(CuoiHoi.xepHangCuoiHoi(9.7)).toBe("dai-cat");
    expect(CuoiHoi.xepHangCuoiHoi(8.5)).toBe("rat-tot");
    expect(CuoiHoi.xepHangCuoiHoi(7.2)).toBe("tot");
    expect(CuoiHoi.xepHangCuoiHoi(6.0)).toBe("co-the-dung");
    expect(CuoiHoi.xepHangCuoiHoi(4.0)).toBe("khong-thuan");
    expect(CuoiHoi.xepHangCuoiHoi(1.0)).toBe("khong-nen-chon");
  });
});

describe("Phân biệt nghi lễ (mục 9 + nguyên tắc 13)", () => {
  it("chỉ THÀNH HÔN mới áp nhóm kỵ riêng của giá thú", () => {
    // Ăn hỏi (đính hôn) KHÔNG kỵ Khí Vãng Vong / Chu Đường / hoà thượng sát.
    expect(CuoiHoi.apKyRiengGiaThu("thanh-hon")).toBe(true);
    expect(CuoiHoi.apKyRiengGiaThu("an-hoi")).toBe(false);
    expect(CuoiHoi.apKyRiengGiaThu("don-dau")).toBe(false);
    expect(CuoiHoi.apKyRiengGiaThu("dang-ky-ket-hon")).toBe(false);
  });

  it("mỗi nghi lễ tra một bộ việc trạch nhật riêng, không dùng chung một bảng", () => {
    const viec = CuoiHoi.VIEC_TRACH_NHAT_THEO_NGHI_LE;
    expect(viec["don-dau"]).toContain("xuất hành"); // đón dâu mới có xuất hành
    expect(viec["an-hoi"]).not.toContain("xuất hành");
    expect(viec["dang-ky-ket-hon"]).toContain("ký kết");
  });
});

describe("Trung thực về dữ liệu còn thiếu (nguyên tắc 9, 12)", () => {
  it("nêu đích danh các mục chưa có dữ liệu, không im lặng bỏ qua", () => {
    const thieu = CuoiHoi.THIEU_DU_LIEU_CUOI_HOI.join(" ");
    // Chu Đường, Hoà Thượng Sát, Khí Vãng Vong đều đã có công thức (chủ dự án cấp 2026-08-17)
    // nên KHÔNG còn ở danh sách này nữa. Còn lại đúng những gì thật sự chưa có nguồn.
    for (const ten of ["Ni Cô Sát", "Quý Nhân Đăng Thiên Môn"]) {
      expect(thieu, `phải nêu rõ còn thiếu "${ten}"`).toContain(ten);
    }
  });

  it("nhóm kỵ riêng giá thú chưa được đưa vào danh sách loại thẳng khi chưa có công thức", () => {
    // Không được liệt vào danh sách loại thẳng rồi không có chỗ nào kiểm — đúng bài học "Đại Hao"
    // ở module tang lễ: danh sách cấm chỉ tồn tại trên giấy.
    for (const ten of CuoiHoi.KY_RIENG_THANH_HON) {
      expect(CuoiHoi.CUOI_HOI_LOAI_THANG).not.toContain(ten);
    }
  });
});

describe("Chu Đường (công thức chủ dự án cấp 2026-08-17)", () => {
  /** Bản JavaScript gốc — giữ nguyên trong test để đối chiếu, không dùng làm nguồn chạy thật. */
  function banGoc(ngayAmLich: number, thangDu: boolean): string {
    const L = ["PHU", "CO", "DUONG", "ONG", "DE", "TAO", "PHU", "TRU"];
    const S = ["PHU", "TAO", "DE", "ONG", "DUONG", "CO", "PHU", "TRU"];
    return (thangDu ? L : S)[(ngayAmLich - 1) % 8]!;
  }
  const SANG_MA_GOC: Record<string, string> = {
    "phu-chong": "PHU", co: "CO", duong: "DUONG", ong: "ONG",
    de: "DE", tao: "TAO", "phu-vo": "PHU", tru: "TRU",
  };

  it("khớp 100% bản gốc trên cả tháng đủ lẫn tháng thiếu", () => {
    for (const thangDu of [true, false]) {
      const soNgay = thangDu ? 30 : 29;
      for (let d = 1; d <= soNgay; d++) {
        expect(SANG_MA_GOC[CuoiHoi.getChuDuong(d, thangDu)], `${thangDu ? "tháng đủ" : "tháng thiếu"} ngày ${d}`).toBe(
          banGoc(d, thangDu),
        );
      }
    }
  });

  it("phân biệt được trực Phu (chồng) với trực Phụ (vợ) dù bản gốc ghi cùng chữ PHU", () => {
    // Đây là lý do phải cài theo VỊ TRÍ chứ không theo chuỗi: bản gốc để index 0 và index 6 cùng
    // là "PHU", nhưng vị trí 0 là 夫 (chồng) còn vị trí 6 là 婦 (vợ). Cài theo chuỗi là mất sạch
    // phân biệt "bất lợi cho chồng" với "bất lợi cho vợ" — tức mất đúng thứ mà nguồn nói.
    expect(CuoiHoi.getChuDuong(1, true)).toBe("phu-chong");
    expect(CuoiHoi.getChuDuong(7, true)).toBe("phu-vo");
    expect(CuoiHoi.luanChuDuong(1, true).batLoiChuRe).toBe(true);
    expect(CuoiHoi.luanChuDuong(1, true).batLoiCoDau).toBe(false);
    expect(CuoiHoi.luanChuDuong(7, true).batLoiCoDau).toBe(true);
    expect(CuoiHoi.luanChuDuong(7, true).batLoiChuRe).toBe(false);
  });

  it("vòng lặp đúng 8 ngày", () => {
    for (const thangDu of [true, false]) {
      for (let d = 1; d + 8 <= 29; d++) {
        expect(CuoiHoi.getChuDuong(d, thangDu)).toBe(CuoiHoi.getChuDuong(d + 8, thangDu));
      }
    }
  });

  it("phần giữa của tháng thiếu là đảo ngược của tháng đủ", () => {
    // Quan hệ này xác nhận cách đọc vị trí 0/6: hai đầu giữ nguyên vai trò, chỉ phần giữa đảo
    // chiều. Nếu sau này ai sửa một trong hai mảng mà quên mảng kia, test này gãy.
    const giuaDu = [2, 3, 4, 5, 6].map((d) => CuoiHoi.getChuDuong(d, true));
    const giuaThieu = [2, 3, 4, 5, 6].map((d) => CuoiHoi.getChuDuong(d, false));
    expect(giuaThieu).toEqual([...giuaDu].reverse());
  });

  it("6 trực chưa có luận thì KHÔNG bị coi là bất lợi — không tự suy diễn", () => {
    for (const d of [2, 3, 4, 5, 6, 8]) {
      const kq = CuoiHoi.luanChuDuong(d, true);
      if (kq.truc === "phu-chong" || kq.truc === "phu-vo") continue;
      expect(kq.batLoi, `trực ${kq.tenTruc} chưa có luận, không được tự cho là xấu`).toBe(false);
    }
    expect(CuoiHoi.TRUC_CHU_DUONG_CHUA_CO_LUAN).toHaveLength(6);
  });

  it("ngày âm lịch vô lý thì báo lỗi thay vì trả bừa", () => {
    expect(() => CuoiHoi.getChuDuong(0, true)).toThrow();
    expect(() => CuoiHoi.getChuDuong(31, true)).toThrow();
  });
});

describe("Hoà Thượng Sát (nguồn chủ dự án cấp 2026-08-17)", () => {
  // Bộ test bắt buộc — chép đúng mục 12 của tài liệu nguồn.
  const BANG: [string[], string[]][] = [
    [["Tỵ", "Ngọ", "Mùi"], ["Thân", "Tý", "Thìn"]],
    [["Thân", "Dậu", "Tuất"], ["Hợi", "Mão", "Mùi"]],
    [["Hợi", "Tý", "Sửu"], ["Dần", "Ngọ", "Tuất"]],
    [["Dần", "Mão", "Thìn"], ["Tỵ", "Dậu", "Sửu"]],
  ];

  it("đủ 12 tuổi chú rể kỵ đúng nhóm ngày của mình", () => {
    for (const [tuoi, ngayKy] of BANG) {
      for (const t of tuoi) {
        for (const ngay of ngayKy) {
          expect(CuoiHoi.xetHoaThuongSat(t as never, ngay as never).pham, `chú rể ${t} + ngày ${ngay}`).toBe(true);
        }
      }
    }
  });

  it("không phạm với ngày ngoài nhóm kỵ", () => {
    // Đúng 2 ca nguồn nêu ở mục 12.
    expect(CuoiHoi.xetHoaThuongSat("Ngọ", "Dần").pham).toBe(false);
    expect(CuoiHoi.xetHoaThuongSat("Dậu", "Tý").pham).toBe(false);
  });

  it("CHỦ MỆNH LÀ CHÚ RỂ — tuổi cô dâu không ảnh hưởng gì", () => {
    // Nguyên tắc nguồn: "Không dùng tuổi cô dâu để tính Hoà Thượng Sát". Hàm chỉ nhận tuổi chú
    // rể, nên sai kiểu này không thể lọt — test khoá luôn chữ ký hàm lẫn kết quả.
    const kq = CuoiHoi.xetHoaThuongSat("Ngọ", "Thân");
    expect(kq.pham).toBe(true);
    expect(kq.doiTuong).toBe("chu-re");
    expect(kq.lyDo).toContain("Chú rể tuổi Ngọ");
  });

  it("4 nhóm phủ trọn 12 Chi, không tuổi nào bị bỏ sót hay nằm hai nhóm", () => {
    const tatCa = CuoiHoi.HOA_THUONG_SAT_NHOM.flatMap((n) => n.nhomTuoi);
    expect(tatCa).toHaveLength(12);
    expect(new Set(tatCa).size).toBe(12);
  });

  it("NI CÔ SÁT phải giữ trạng thái chờ xác nhận — cấm suy ra bằng cách đảo bảng", () => {
    // Nguồn cấm thẳng `Ni Cô Sát = reverse(Hoà Thượng Sát)`. Test này chặn việc ai đó sau này
    // bật đại lên cho "đủ bộ".
    expect(CuoiHoi.NI_CO_SAT.batBuoc).toBe(false);
    expect(CuoiHoi.NI_CO_SAT.trangThai).toBe("CHO_XAC_NHAN");
    expect(CuoiHoi.NI_CO_SAT.congThuc).toBeNull();
  });

  it("mức độ phạt vẫn để trống — không tự chốt loại thẳng, cũng không tự cho cát tinh hoá giải", () => {
    // Nguồn: "Không được để cát tinh tự động xoá sát này khi chưa có CONFIG hoá giải; đồng thời
    // cũng không tự kết luận vĩnh viễn không hoá giải." Cả hai đầu đều phải để ngỏ.
    expect(CuoiHoi.MUC_DO_HOA_THUONG_SAT.hardBlock).toBe(false);
    expect(CuoiHoi.MUC_DO_HOA_THUONG_SAT.diemPhat).toBeNull();
    expect(CuoiHoi.MUC_DO_HOA_THUONG_SAT.catTinhHoaGiaiDuoc).toBeNull();
    expect(CuoiHoi.MUC_DO_HOA_THUONG_SAT.chiXetNgay).toBe(true);
  });
});

describe("Khí Vãng Vong (công thức chủ dự án cấp 2026-08-17)", () => {
  it("đủ 12 Tiết, khớp đúng con số nguồn", () => {
    const goc: Record<string, number> = {
      "Lập Xuân": 7, "Kinh Trập": 14, "Thanh Minh": 21,
      "Lập Hạ": 8, "Mang Chủng": 16, "Tiểu Thử": 24,
      "Lập Thu": 9, "Bạch Lộ": 18, "Hàn Lộ": 27,
      "Lập Đông": 10, "Đại Tuyết": 20, "Tiểu Hàn": 30,
    };
    expect(Object.keys(CuoiHoi.KHI_VANG_VONG_THEO_TIET)).toHaveLength(12);
    for (const [ten, moc] of Object.entries(goc)) {
      expect(CuoiHoi.KHI_VANG_VONG_THEO_TIET[ten], ten).toBe(moc);
    }
  });

  it("mỗi mùa là cấp số cộng theo đúng bước của mùa đó", () => {
    // Khoá QUY LUẬT chứ không chỉ khoá 12 con số rời — nếu ai gõ nhầm một số, test bắt được ngay.
    const mua: [keyof typeof CuoiHoi.BUOC_THEO_MUA, string[]][] = [
      ["Xuân", ["Lập Xuân", "Kinh Trập", "Thanh Minh"]],
      ["Hạ", ["Lập Hạ", "Mang Chủng", "Tiểu Thử"]],
      ["Thu", ["Lập Thu", "Bạch Lộ", "Hàn Lộ"]],
      ["Đông", ["Lập Đông", "Đại Tuyết", "Tiểu Hàn"]],
    ];
    for (const [tenMua, tiets] of mua) {
      const buoc = CuoiHoi.BUOC_THEO_MUA[tenMua];
      tiets.forEach((t, i) => {
        expect(CuoiHoi.KHI_VANG_VONG_THEO_TIET[t], `${tenMua} — ${t}`).toBe(buoc * (i + 1));
      });
    }
  });

  it("chỉ đúng ngày thứ N mới phạm, lệch 1 ngày là không", () => {
    expect(CuoiHoi.xetKhiVangVong("Lập Xuân", 7).pham).toBe(true);
    expect(CuoiHoi.xetKhiVangVong("Lập Xuân", 6).pham).toBe(false);
    expect(CuoiHoi.xetKhiVangVong("Lập Xuân", 8).pham).toBe(false);
    expect(CuoiHoi.xetKhiVangVong("Tiểu Hàn", 30).pham).toBe(true);
  });

  it("Trung Khí không có Khí Vãng Vong — không phải lỗi, chỉ là không áp dụng", () => {
    // 12 Trung Khí (Xuân Phân, Cốc Vũ, Tiểu Mãn...) nằm ngoài phép này.
    expect(CuoiHoi.tietCoKhiVangVong("Xuân Phân")).toBe(false);
    expect(CuoiHoi.xetKhiVangVong("Xuân Phân", 7).pham).toBe(false);
    expect(CuoiHoi.tietCoKhiVangVong("Lập Xuân")).toBe(true);
  });
});
