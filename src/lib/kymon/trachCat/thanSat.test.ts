import { describe, expect, it } from "vitest";
import { an12KienTinh, an12TrucThan, quanHeChi, xetKienTinh, xetTrucThan } from "./thanSat";

// Các test dưới đây đối chiếu TRỰC TIẾP với ví dụ đã giải sẵn trong nguồn
// zhicong-11.md ("Kỳ Môn Mệnh Trạch Nhật" — Đồng Khôn Nguyên). Đây là cách kiểm chứng chắc nhất:
// nếu engine dựng lại đúng kết quả mà sách tự tính ra, thì cách an vòng là đúng.

describe("an12KienTinh — đối chiếu ví dụ trong nguồn", () => {
  // Video 3, Càn tạo sinh tháng THÌN. Nguồn kết luận: "các ngày tốt [...] là Trừ (ngày Tỵ) -
  // Nguy (Ngày Hợi) - Định (Ngày Thân) - Chấp (ngày Dậu) là hoàng đạo cát nhật - ngoài ra ngày
  // Thành (Tý) - Khai (Dần) cũng có thể dùng".
  it("sinh tháng Thìn: Kiến tại Thìn, Trừ=Tỵ, Định=Thân, Chấp=Dậu, Nguy=Hợi, Thành=Tý, Khai=Dần", () => {
    const b = an12KienTinh("Thìn");
    expect(b["Thìn"]).toBe("Kiến");
    expect(b["Tỵ"]).toBe("Trừ");
    expect(b["Thân"]).toBe("Định");
    expect(b["Dậu"]).toBe("Chấp");
    expect(b["Hợi"]).toBe("Nguy");
    expect(b["Tý"]).toBe("Thành");
    expect(b["Dần"]).toBe("Khai");
  });

  // Video 6, mệnh tạo sinh tháng MÙI. Bảng trong nguồn: Thân=Trừ, Hợi=Định, Dần=Nguy,
  // Mão=Thành, Tỵ=Khai.
  it("sinh tháng Mùi: Thân=Trừ, Hợi=Định, Dần=Nguy, Mão=Thành, Tỵ=Khai", () => {
    const b = an12KienTinh("Mùi");
    expect(b["Mùi"]).toBe("Kiến");
    expect(b["Thân"]).toBe("Trừ");
    expect(b["Hợi"]).toBe("Định");
    expect(b["Dần"]).toBe("Nguy");
    expect(b["Mão"]).toBe("Thành");
    expect(b["Tỵ"]).toBe("Khai");
  });
});

describe("an12TrucThan — đối chiếu ví dụ trong nguồn", () => {
  // Video 3-4, sinh tháng THÌN → Thanh Long tại Thìn. Nguồn kết luận: "các ngày cát thần là:
  // Thìn (Thanh Long) - Tỵ (Minh đường) - Thân (Kim Quỹ) - Dậu (Thiên Đức) - Hợi (Ngọc Đường)
  // - Dần (Tư Mệnh)".
  it("sinh tháng Thìn: Thanh Long tại Thìn, Tỵ=Minh Đường, Thân=Kim Quỹ, Dậu=Thiên Đức, Hợi=Ngọc Đường, Dần=Tư Mệnh", () => {
    const b = an12TrucThan("Thìn");
    expect(b["Thìn"]).toBe("Thanh Long");
    expect(b["Tỵ"]).toBe("Minh Đường");
    expect(b["Thân"]).toBe("Kim Quỹ");
    expect(b["Dậu"]).toBe("Thiên Đức");
    expect(b["Hợi"]).toBe("Ngọc Đường");
    expect(b["Dần"]).toBe("Tư Mệnh");
  });

  // Video 6, sinh tháng MÙI → Thanh Long tại Tuất. Bảng trong nguồn: Thân=Tư Mệnh,
  // Hợi=Minh Đường, Dần=Kim Quỹ, Mão=Thiên Đức, Tỵ=Ngọc Đường.
  it("sinh tháng Mùi: Thanh Long tại Tuất, Thân=Tư Mệnh, Hợi=Minh Đường, Dần=Kim Quỹ, Mão=Thiên Đức, Tỵ=Ngọc Đường", () => {
    const b = an12TrucThan("Mùi");
    expect(b["Tuất"]).toBe("Thanh Long");
    expect(b["Thân"]).toBe("Tư Mệnh");
    expect(b["Hợi"]).toBe("Minh Đường");
    expect(b["Dần"]).toBe("Kim Quỹ");
    expect(b["Mão"]).toBe("Thiên Đức");
    expect(b["Tỵ"]).toBe("Ngọc Đường");
  });
});

describe("xếp loại cát/hung", () => {
  // Bài ca ở Trương Chí Xuân: "Trừ Nguy Định Chấp Thành Khai đều tốt lành hoàng [đạo].
  // Kiến Mãn Bình Thu đen, Bế Phá không may mắn."
  it("12 Kiến Tinh: Trừ/Nguy/Định/Chấp là cát, Thành/Khai trung cát, còn lại hung", () => {
    for (const k of ["Trừ", "Nguy", "Định", "Chấp"] as const) expect(xetKienTinh(k)).toBe("cat");
    for (const k of ["Thành", "Khai"] as const) expect(xetKienTinh(k)).toBe("trung_cat");
    for (const k of ["Kiến", "Mãn", "Bình", "Thu", "Bế", "Phá"] as const) {
      expect(xetKienTinh(k)).toBe("hung");
    }
  });

  it("12 Trực Thần: 6 cát thần theo nguồn, 6 còn lại hung", () => {
    for (const t of ["Thanh Long", "Minh Đường", "Kim Quỹ", "Thiên Đức", "Ngọc Đường", "Tư Mệnh"] as const) {
      expect(xetTrucThan(t)).toBe("cat");
    }
    for (const t of ["Thiên Hình", "Chu Tước", "Bạch Hổ", "Thiên Lao", "Huyền Vũ", "Câu Trần"] as const) {
      expect(xetTrucThan(t)).toBe("hung");
    }
  });
});

describe("quanHeChi — đối chiếu các nhận định rải rác trong nguồn", () => {
  it("tam hợp: Dần-Tuất, Mão-Mùi, Sửu-Tỵ (nguồn dùng để chọn ngày hợp tuổi chủ sự)", () => {
    expect(quanHeChi("Dần", "Tuất").tamHop).toBe(true);
    expect(quanHeChi("Mùi", "Mão").tamHop).toBe(true);
    expect(quanHeChi("Tỵ", "Sửu").tamHop).toBe(true);
  });

  it("lục hợp: Tuất-Mão (nguồn: 'ngày Tuất hợp với tuổi Mão của chủ sự')", () => {
    expect(quanHeChi("Tuất", "Mão").lucHop).toBe(true);
  });

  it("xung: Thân-Dần (nguồn loại giờ Thân vì 'xung với ngày Dần'), Ngọ-Tý, Mão-Dậu", () => {
    expect(quanHeChi("Thân", "Dần").xung).toBe(true);
    expect(quanHeChi("Ngọ", "Tý").xung).toBe(true);
    expect(quanHeChi("Mão", "Dậu").xung).toBe(true);
  });

  it("hình: Dần-Tỵ (nguồn: 'ngày Dần hình với tuổi Tỵ của chủ sự'), Mão-Tý", () => {
    expect(quanHeChi("Dần", "Tỵ").hinh).toBe(true);
    expect(quanHeChi("Mão", "Tý").hinh).toBe(true);
  });

  it("phá: Thìn-Sửu (nguồn: 'Ngày Thìn phá sửu không dùng được')", () => {
    expect(quanHeChi("Thìn", "Sửu").pha).toBe(true);
  });
});
