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
    for (const ten of ["Khí Vãng Vong", "Chu Đường", "ni cô sát", "Quý Nhân Đăng Thiên Môn"]) {
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
