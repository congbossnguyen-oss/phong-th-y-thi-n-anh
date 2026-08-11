// Golden Master GM-002 → GM-006 — theo docs/TuVi_Golden_Master_Pack_V1.md (người dùng cung cấp).
//
// NGUYÊN TẮC (theo đúng yêu cầu Phase 3): KHÔNG sửa engine để ép test pass, KHÔNG sửa Golden Master để
// khớp engine. Field nào phát hiện dữ liệu trong pack có khả năng transcription-error (mâu thuẫn với
// công thức đã VERIFIED ở GM-001, hoặc mâu thuẫn nội bộ) thì dùng `it.fails()` + ghi rõ
// NEED_GOLDEN_MASTER_REVIEW thay vì hard-assert giá trị đang nghi ngờ, và KHÔNG hard-assert theo hướng
// "engine luôn đúng" — `it.fails()` nghĩa là "hiện tại lệch nhau, cần người dùng xác nhận lại nguồn".
//
// Test này KHÔNG coi 107 test cũ (chỉ GM-001) là bằng chứng độc lập — đây là nguồn dữ liệu ĐỘC LẬP THỨ
// HAI trở đi, lần đầu tiên cho phép phân biệt "công thức đúng nói chung" khỏi "công thức chỉ tình cờ
// khớp 1 ví dụ".

import { describe, expect, it } from "vitest";
import { getPalace, getStar, tinhTuVi } from "../src/lib/tu-vi/engine";
import { TU_HOA_TABLE } from "../src/lib/tu-vi/rules";

// ============================================================================================
// GM-002 — Nữ Canh Thân 1980 11:30 (cùng ngày giờ GM-001, đổi giới tính — "Test A")
// ============================================================================================
describe("GM-002 — Nữ Canh Thân 1980 11:30", () => {
  const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nữ", viewingYear: 2026 });

  it("Calendar / Thiên Bàn", () => {
    expect(chart.lunarDay).toBe(21);
    expect(chart.lunarMonth).toBe(7);
    expect(chart.lunarYear).toBe(1980);
    expect(chart.yearCanName).toBe("Canh");
    expect(chart.yearChiName).toBe("Thân");
    expect(chart.amDuongNam).toBe("Dương Nữ");
    expect(chart.banMenhNapAm).toBe("Thạch Lựu Mộc");
    expect(chart.cucName).toBe("Thổ Ngũ Cục");
  });

  it("Mệnh Quái = Tốn (khác GM-001 = Khôn dù cùng ngày sinh — VERIFIED giới tính ảnh hưởng Mệnh Quái)", () => {
    expect(chart.menhQuai).toBe("Tốn");
  });

  it("Mệnh = Dần, Thân = Dần (giống GM-001 — giới tính không ảnh hưởng vị trí Mệnh/Thân)", () => {
    expect(chart.menhChiIndex).toBe(2);
    expect(chart.thanChiIndex).toBe(2);
  });

  it("Chủ Mệnh/Chủ Thân giống GM-001 (cùng năm sinh Canh Thân)", () => {
    expect(chart.chuMenh).toBe("Liêm Trinh");
    expect(chart.chuThan).toBe("Thiên Lương");
  });

  it("Đại Vận: tuổi khởi 5, hướng NGHỊCH (đảo chiều so với GM-001 — VERIFIED giới tính đảo hướng Đại Vận)", () => {
    const menh = getPalace(chart, "Dần");
    expect(menh.daiVanTuoi).toEqual([5, 14]);
    // Nghịch: cung kế tiếp (Sửu, step 1) phải có tuổi 15-24; Mão (step -1/nghịch trước) phải KHÔNG phải bước kế.
    const suu = getPalace(chart, "Sửu");
    expect(suu.daiVanTuoi).toEqual([15, 24]);
  });

  it("14 chính tinh: vị trí giống hệt GM-001 (Test A — natal chart không đổi theo giới tính)", () => {
    expect(getStar(chart, "Dần", "Liêm Trinh").trangThai).toBe("Vượng");
    expect(getStar(chart, "Ngọ", "Vũ Khúc").trangThai).toBe("Vượng");
    expect(getStar(chart, "Ngọ", "Thiên Phủ").trangThai).toBe("Miếu");
    expect(getStar(chart, "Mùi", "Thái Dương").trangThai).toBe("Đắc");
    expect(getStar(chart, "Mùi", "Thái Âm").trangThai).toBe("Đắc");
    expect(getStar(chart, "Thân", "Tham Lang").trangThai).toBe("Đắc");
    expect(getStar(chart, "Dậu", "Thiên Cơ").trangThai).toBe("Miếu");
    expect(getStar(chart, "Dậu", "Cự Môn").trangThai).toBe("Miếu");
    expect(getPalace(chart, "Tuất").chinhTinh.some((s) => s.name === "Tử Vi")).toBe(true);
    expect(getStar(chart, "Tuất", "Thiên Tướng").trangThai).toBe("Vượng");
    expect(getStar(chart, "Hợi", "Thiên Lương").trangThai).toBe("Hãm");
    expect(getStar(chart, "Tý", "Thất Sát").trangThai).toBe("Miếu");
    expect(getStar(chart, "Thìn", "Phá Quân").trangThai).toBe("Đắc");
    expect(getStar(chart, "Tỵ", "Thiên Đồng").trangThai).toBe("Đắc");
  });

  it("Tuần Không = Tý-Sửu (cùng năm Canh Thân như GM-001)", () => {
    expect(getPalace(chart, "Tý").tuan).toBe(true);
    expect(getPalace(chart, "Sửu").tuan).toBe(true);
  });
});

// ============================================================================================
// GM-003 — Nam Canh Ngọ 1990 11:30
// ============================================================================================
describe("GM-003 — Nam Canh Ngọ 1990 11:30", () => {
  const chart = tinhTuVi({ day: 25, month: 8, year: 1990, hour: 11, gender: "Nam", viewingYear: 2026 });

  it("Calendar / Thiên Bàn", () => {
    expect(chart.lunarDay).toBe(6);
    expect(chart.lunarMonth).toBe(7);
    expect(chart.lunarYear).toBe(1990);
    expect(chart.yearCanName).toBe("Canh");
    expect(chart.yearChiName).toBe("Ngọ");
    expect(chart.amDuongNam).toBe("Dương Nam");
    expect(chart.banMenhNapAm).toBe("Lộ Bàng Thổ");
    expect(chart.cucName).toBe("Thổ Ngũ Cục");
    expect(chart.menhQuai).toBe("Khảm");
  });

  it("Mệnh = Dần, Thân = Dần", () => {
    expect(chart.menhChiIndex).toBe(2);
    expect(chart.thanChiIndex).toBe(2);
  });

  // PHASE 8 (docs/TUVI_ENGINE_PHASE8_REPORT.md): khóa Chủ Mệnh/Chủ Thân đã đổi sang Chi NĂM SINH
  // (Ngọ, VERIFIED qua chính GM-003 này) thay vì Chi cung Mệnh — nâng từ it.fails() lên assertion thật.
  it("Chủ Mệnh = Phá Quân (VERIFIED — khóa Chi năm sinh Ngọ, Phase 8)", () => {
    expect(chart.chuMenh).toBe("Phá Quân");
  });
  it("Chủ Thân = Hỏa Tinh (VERIFIED — khóa Chi năm sinh Ngọ, Phase 8)", () => {
    expect(chart.chuThan).toBe("Hỏa Tinh");
  });

  it("Đại Vận: tuổi khởi 5, hướng Thuận", () => {
    expect(getPalace(chart, "Dần").daiVanTuoi).toEqual([5, 14]);
    expect(getPalace(chart, "Mão").daiVanTuoi).toEqual([15, 24]); // thuận: bước kế = Mão
  });

  it("14 chính tinh: 13/14 vị trí xác nhận rõ ràng (không tính Thiên Lương — xem ghi chú NEED_GOLDEN_MASTER_REVIEW)", () => {
    expect(getStar(chart, "Tý", "Cự Môn")).toBeTruthy();
    expect(getStar(chart, "Sửu", "Thiên Tướng")).toBeTruthy();
    expect(getStar(chart, "Dần", "Thiên Đồng")).toBeTruthy();
    expect(getStar(chart, "Mão", "Vũ Khúc")).toBeTruthy();
    expect(getStar(chart, "Mão", "Thất Sát")).toBeTruthy();
    expect(getStar(chart, "Thìn", "Thái Dương")).toBeTruthy();
    expect(getPalace(chart, "Tỵ").chinhTinh.length).toBe(0);
    expect(getStar(chart, "Ngọ", "Thiên Cơ")).toBeTruthy();
    expect(getStar(chart, "Mùi", "Tử Vi")).toBeTruthy();
    expect(getStar(chart, "Mùi", "Phá Quân")).toBeTruthy();
    expect(getStar(chart, "Dậu", "Thiên Phủ")).toBeTruthy();
    expect(getStar(chart, "Tuất", "Thái Âm")).toBeTruthy();
    expect(getStar(chart, "Hợi", "Liêm Trinh")).toBeTruthy();
    expect(getStar(chart, "Hợi", "Tham Lang")).toBeTruthy();
  });

  // NEED_GOLDEN_MASTER_REVIEW: pack ghi "Thân Thiên Di: Thiên Lương(M)", nhưng công thức offset+5 từ
  // Thiên Phủ (đã VERIFIED qua GM-001: Thiên Phủ@Ngọ -> Thiên Lương@Hợi) áp cho GM-003 (Thiên Phủ@Dậu)
  // cho ra Thiên Lương@Dần, không phải Thân. Vì công thức đã verified độc lập ở GM-001 và tự nhất quán
  // (Thiên Phủ vị trí khớp đúng pack ở Dậu), nghi ngờ đây là lỗi transcription trong pack, KHÔNG sửa
  // công thức chỉ vì 1 điểm dữ liệu mới mâu thuẫn với 1 điểm đã verified trước đó.
  it.fails("Thiên Lương ở Thân theo pack (NEED_GOLDEN_MASTER_REVIEW — engine hiện tính ra Dần)", () => {
    expect(getStar(chart, "Thân", "Thiên Lương")).toBeTruthy();
  });
});

// ============================================================================================
// GM-004 — Nữ Đinh Sửu 1997 11:30
// ============================================================================================
describe("GM-004 — Nữ Đinh Sửu 1997 11:30", () => {
  const chart = tinhTuVi({ day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ", viewingYear: 2026 });

  it("Calendar / Thiên Bàn", () => {
    expect(chart.lunarDay).toBe(23);
    expect(chart.lunarMonth).toBe(7);
    expect(chart.lunarYear).toBe(1997);
    expect(chart.yearCanName).toBe("Đinh");
    expect(chart.yearChiName).toBe("Sửu");
    expect(chart.amDuongNam).toBe("Âm Nữ");
    expect(chart.banMenhNapAm).toBe("Giản Hạ Thủy");
    expect(chart.cucName).toBe("Kim Tứ Cục");
    expect(chart.menhQuai).toBe("Chấn");
  });

  it("Mệnh = Dần, Thân = Dần", () => {
    expect(chart.menhChiIndex).toBe(2);
    expect(chart.thanChiIndex).toBe(2);
  });

  // PHASE 8: khóa Chi năm sinh Sửu, VERIFIED qua chính GM-004 này (+ GM-005 cùng năm, khác giờ/giới
  // tính, ra cùng kết quả — bằng chứng loại trừ gender/Mệnh-chi khỏi biến số, xem TUVI_RULE_FORENSICS.md).
  it("Chủ Mệnh = Cự Môn (VERIFIED — khóa Chi năm sinh Sửu, Phase 8)", () => {
    expect(chart.chuMenh).toBe("Cự Môn");
  });
  it("Chủ Thân = Thiên Tướng (VERIFIED — khóa Chi năm sinh Sửu, Phase 8)", () => {
    expect(chart.chuThan).toBe("Thiên Tướng");
  });

  it("Tứ Hóa PHẢI là bộ của Can Đinh, KHÔNG được là bộ Can Canh (điểm test đặc biệt pack yêu cầu)", () => {
    expect(chart.tuHoa).toEqual(TU_HOA_TABLE["Đinh"]);
    expect(chart.tuHoa).not.toEqual(TU_HOA_TABLE["Canh"]);
    expect(chart.tuHoa.loc).toBe("Thái Âm");
    expect(chart.tuHoa.quyen).toBe("Thiên Đồng");
    expect(chart.tuHoa.khoa).toBe("Thiên Cơ");
    expect(chart.tuHoa.ky).toBe("Cự Môn");
  });

  it("Đại Vận: tuổi khởi 4 (Kim Tứ Cục), hướng Thuận", () => {
    expect(getPalace(chart, "Dần").daiVanTuoi).toEqual([4, 13]);
    expect(getPalace(chart, "Mão").daiVanTuoi).toEqual([14, 23]); // thuận
  });

  it("14 chính tinh: đủ 12/12 cung khớp, không có ô nào NEED_GOLDEN_MASTER_REVIEW", () => {
    expect(getStar(chart, "Dần", "Vũ Khúc")).toBeTruthy();
    expect(getStar(chart, "Dần", "Thiên Tướng")).toBeTruthy();
    expect(getStar(chart, "Mão", "Thái Dương")).toBeTruthy();
    expect(getStar(chart, "Mão", "Thiên Lương")).toBeTruthy();
    expect(getStar(chart, "Thìn", "Thất Sát")).toBeTruthy();
    expect(getStar(chart, "Tỵ", "Thiên Cơ")).toBeTruthy();
    expect(getStar(chart, "Ngọ", "Tử Vi")).toBeTruthy();
    expect(getPalace(chart, "Mùi").chinhTinh.length).toBe(0);
    expect(getStar(chart, "Thân", "Phá Quân")).toBeTruthy();
    expect(getPalace(chart, "Dậu").chinhTinh.length).toBe(0);
    expect(getStar(chart, "Tuất", "Liêm Trinh")).toBeTruthy();
    expect(getStar(chart, "Tuất", "Thiên Phủ")).toBeTruthy();
    expect(getStar(chart, "Hợi", "Thái Âm")).toBeTruthy();
    expect(getStar(chart, "Tý", "Tham Lang")).toBeTruthy();
    expect(getStar(chart, "Sửu", "Thiên Đồng")).toBeTruthy();
    expect(getStar(chart, "Sửu", "Cự Môn")).toBeTruthy();
  });
});

// ============================================================================================
// GM-005 — Nam Đinh Sửu 1997 00:30 (giờ Tý — "Test B" so với GM-004)
// ============================================================================================
describe("GM-005 — Nam Đinh Sửu 1997 00:30", () => {
  const chart = tinhTuVi({ day: 25, month: 8, year: 1997, hour: 0, gender: "Nam", viewingYear: 2026 });

  it("Calendar / Thiên Bàn (cùng ngày âm GM-004, khác giờ)", () => {
    expect(chart.lunarDay).toBe(23);
    expect(chart.lunarMonth).toBe(7);
    expect(chart.lunarYear).toBe(1997);
    expect(chart.yearCanName).toBe("Đinh");
    expect(chart.yearChiName).toBe("Sửu");
    expect(chart.amDuongNam).toBe("Âm Nam");
    expect(chart.banMenhNapAm).toBe("Giản Hạ Thủy");
    expect(chart.cucName).toBe("Thổ Ngũ Cục"); // khác GM-004 (Kim Tứ Cục) vì Mệnh cung khác
    expect(chart.menhQuai).toBe("Chấn");
  });

  it("TEST B (bắt buộc theo pack) — Mệnh = Thân (chi 8), KHÁC GM-004 (Mệnh = Dần, chi 2)", () => {
    expect(chart.menhChiIndex).toBe(8);
    expect(chart.thanChiIndex).toBe(8);
  });

  // PHASE 8: khóa Chi năm sinh Sửu — GM-005 (Nam, Mệnh=Thân) và GM-004 (Nữ, Mệnh=Dần) cùng năm Đinh Sửu
  // cho cùng kết quả Chủ Mệnh/Chủ Thân, đúng bằng chứng đã dùng để khóa rule ở Phase 8.
  it("Chủ Mệnh = Cự Môn (VERIFIED — khóa Chi năm sinh Sửu, Phase 8)", () => {
    expect(chart.chuMenh).toBe("Cự Môn");
  });
  it("Chủ Thân = Thiên Tướng (VERIFIED — khóa Chi năm sinh Sửu, Phase 8)", () => {
    expect(chart.chuThan).toBe("Thiên Tướng");
  });

  it("Tứ Hóa vẫn là bộ Can Đinh (không đổi theo giờ sinh)", () => {
    expect(chart.tuHoa).toEqual(TU_HOA_TABLE["Đinh"]);
  });

  it("Đại Vận: tuổi khởi 5 (Thổ Ngũ Cục), hướng Nghịch", () => {
    const menh = getPalace(chart, "Thân");
    expect(menh.daiVanTuoi).toEqual([5, 14]);
    const mui = getPalace(chart, "Mùi");
    expect(mui.daiVanTuoi).toEqual([15, 24]); // nghịch: bước kế = Mùi (lùi 1 từ Thân)
  });

  it("14 chính tinh: 10/14 vị trí xác nhận rõ ràng (Dần/Tuất — xem ghi chú NEED_GOLDEN_MASTER_REVIEW)", () => {
    expect(getStar(chart, "Tý", "Liêm Trinh")).toBeTruthy();
    expect(getStar(chart, "Tý", "Thiên Tướng")).toBeTruthy();
    expect(getStar(chart, "Sửu", "Thiên Lương")).toBeTruthy();
    expect(getStar(chart, "Mão", "Thiên Đồng")).toBeTruthy();
    expect(getStar(chart, "Thìn", "Vũ Khúc")).toBeTruthy();
    expect(getStar(chart, "Tỵ", "Thái Dương")).toBeTruthy();
    expect(getStar(chart, "Ngọ", "Phá Quân")).toBeTruthy();
    expect(getStar(chart, "Mùi", "Thiên Cơ")).toBeTruthy();
    expect(getStar(chart, "Thân", "Tử Vi")).toBeTruthy();
    expect(getStar(chart, "Thân", "Thiên Phủ")).toBeTruthy();
    expect(getStar(chart, "Dậu", "Thái Âm")).toBeTruthy();
    expect(getStar(chart, "Hợi", "Cự Môn")).toBeTruthy();
  });

  // NEED_GOLDEN_MASTER_REVIEW: pack ghi "Dần Phúc Đức: Tham Lang(V)" và "Tuất Thiên Di: Thất Sát(M)".
  // Theo công thức đã VERIFIED (Thiên Phủ@Thân -> Tham Lang offset+2 -> Tuất; và quy tắc cung-tên
  // Mệnh+2=Phúc Đức đã verified qua GM-001..004 -> Phúc Đức phải ở Tuất, không phải Dần), engine hiện
  // tính Tham Lang@Tuất (=Phúc Đức) và Thất Sát@Dần (=Thiên Di) — NGƯỢC LẠI với pack. 2 công thức độc
  // lập (vòng sao + tên cung) đều tự nhất quán và khớp mọi GM khác, nên nghi ngờ đây là lỗi transcription
  // (đảo hàng Dần/Tuất) trong pack hơn là lỗi engine — nhưng KHÔNG tự khẳng định, chỉ báo need-review.
  it.fails("Tham Lang ở Dần theo pack (NEED_GOLDEN_MASTER_REVIEW — engine tính ra Tuất)", () => {
    expect(getStar(chart, "Dần", "Tham Lang")).toBeTruthy();
  });
  it.fails("Thất Sát ở Tuất theo pack (NEED_GOLDEN_MASTER_REVIEW — engine tính ra Dần)", () => {
    expect(getStar(chart, "Tuất", "Thất Sát")).toBeTruthy();
  });
});

// ============================================================================================
// TEST B (đối chiếu trực tiếp GM-004 vs GM-005) — chống lỗi Tý=0/Tý=1, bắt buộc theo pack mục 2.
// ============================================================================================
describe("Test B — GM-004 vs GM-005: đổi giờ Ngọ -> Tý phải đổi cung Mệnh", () => {
  it("GM-004 (giờ Ngọ) Mệnh=Dần, GM-005 (giờ Tý) Mệnh=Thân — không được cả 2 cùng ra Dần", () => {
    const gm004 = tinhTuVi({ day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" });
    const gm005 = tinhTuVi({ day: 25, month: 8, year: 1997, hour: 0, gender: "Nam" });
    expect(gm004.menhChiIndex).toBe(2); // Dần
    expect(gm005.menhChiIndex).toBe(8); // Thân
    expect(gm004.menhChiIndex).not.toBe(gm005.menhChiIndex);
  });
});

// ============================================================================================
// GM-006 — Nam 04/02/2026 02:30 (Dương 2026 nhưng Âm 2025, Ất Tỵ — CALENDAR BOUNDARY, quan trọng nhất)
// ============================================================================================
describe("GM-006 — Nam 04/02/2026 02:30 (calendar/tiết khí boundary)", () => {
  const chart = tinhTuVi({ day: 4, month: 2, year: 2026, hour: 2, gender: "Nam", viewingYear: 2026 });

  it("TEST C (bắt buộc theo pack) — Dương lịch 2026 nhưng Âm lịch năm 2025, Can Chi năm Ất Tỵ", () => {
    expect(chart.lunarYear).toBe(2025);
    expect(chart.lunarDay).toBe(17);
    expect(chart.lunarMonth).toBe(12);
    expect(chart.yearCanName).toBe("Ất");
    expect(chart.yearChiName).toBe("Tỵ");
    // Không được lấy Gregorian 2026 làm năm sinh Can Chi (Bính Ngọ).
    expect(chart.yearCanName).not.toBe("Bính");
    expect(chart.yearChiName).not.toBe("Ngọ");
  });

  it("Bản mệnh, Cục, Mệnh Quái", () => {
    expect(chart.amDuongNam).toBe("Âm Nam");
    expect(chart.banMenhNapAm).toBe("Phú Đăng Hỏa");
    expect(chart.cucName).toBe("Hỏa Lục Cục");
    expect(chart.menhQuai).toBe("Khôn");
  });

  it("TEST D (bắt buộc theo pack) — Mệnh (Tý) và Thân (Dần) KHÔNG đồng cung, Thân cư Phúc Đức", () => {
    expect(chart.menhChiIndex).toBe(0); // Tý
    expect(chart.thanChiIndex).toBe(2); // Dần
    expect(chart.menhChiIndex).not.toBe(chart.thanChiIndex);
    const dan = getPalace(chart, "Dần");
    expect(dan.isThan).toBe(true);
    expect(dan.cungName).toBe("Phúc Đức");
  });

  // PHASE 8: khóa Chi năm sinh Tỵ, VERIFIED qua chính GM-006 này.
  it("Chủ Mệnh = Vũ Khúc (VERIFIED — khóa Chi năm sinh Tỵ, Phase 8)", () => {
    expect(chart.chuMenh).toBe("Vũ Khúc");
  });
  it("Chủ Thân = Thiên Cơ (VERIFIED — khóa Chi năm sinh Tỵ, Phase 8)", () => {
    expect(chart.chuThan).toBe("Thiên Cơ");
  });

  it("Tứ Hóa là bộ Can Ất", () => {
    expect(chart.tuHoa).toEqual(TU_HOA_TABLE["Ất"]);
    expect(chart.tuHoa.loc).toBe("Thiên Cơ");
    expect(chart.tuHoa.quyen).toBe("Thiên Lương");
    expect(chart.tuHoa.khoa).toBe("Tử Vi");
    expect(chart.tuHoa.ky).toBe("Thái Âm");
  });

  it("Đại Vận: tuổi khởi 6 (Hỏa Lục Cục), hướng Nghịch", () => {
    expect(getPalace(chart, "Tý").daiVanTuoi).toEqual([6, 15]);
  });

  it("14 chính tinh: 10/12 cung xác nhận rõ ràng (Mão/Hợi — xem ghi chú NEED_GOLDEN_MASTER_REVIEW)", () => {
    expect(getStar(chart, "Tý", "Thái Dương")).toBeTruthy();
    expect(getStar(chart, "Sửu", "Thiên Phủ")).toBeTruthy();
    expect(getStar(chart, "Dần", "Thiên Cơ")).toBeTruthy();
    expect(getStar(chart, "Dần", "Thái Âm")).toBeTruthy();
    expect(getStar(chart, "Thìn", "Cự Môn")).toBeTruthy();
    expect(getStar(chart, "Tỵ", "Thiên Tướng")).toBeTruthy();
    expect(getStar(chart, "Ngọ", "Thiên Lương")).toBeTruthy();
    expect(getStar(chart, "Mùi", "Liêm Trinh")).toBeTruthy();
    expect(getStar(chart, "Mùi", "Thất Sát")).toBeTruthy();
    expect(getStar(chart, "Tuất", "Thiên Đồng")).toBeTruthy();
    expect(getPalace(chart, "Thân").chinhTinh.length).toBe(0);
    expect(getPalace(chart, "Dậu").chinhTinh.length).toBe(0);
  });

  // NEED_GOLDEN_MASTER_REVIEW: pack ghi "Mão Huynh Đệ: Vũ Khúc(H), Phá Quân(H)" và dòng Hợi bị chính
  // pack tự đánh dấu không chắc chắn ("Hợi Huynh?* [theo mapping trong ảnh]"). Theo quy tắc tên cung đã
  // verified (Mệnh=Tý -> Huynh Đệ = Mệnh-1 = Hợi, không phải Mão), engine gán "Huynh Đệ" cho Hợi (khớp
  // đúng công thức + khớp phần "Huynh?" mà pack tự nhận không chắc), và gán Mão = "Điền Trạch" (chứa Tử
  // Vi/Tham Lang). Vì chính pack đã cảnh báo dòng này không chắc chắn, không hard-assert theo pack.
  it.fails("Vũ Khúc + Phá Quân ở Mão theo pack (NEED_GOLDEN_MASTER_REVIEW — engine tính ra Hợi, và cung Mão đã verified là Điền Trạch không phải Huynh Đệ)", () => {
    expect(getStar(chart, "Mão", "Vũ Khúc")).toBeTruthy();
    expect(getStar(chart, "Mão", "Phá Quân")).toBeTruthy();
  });

  // NEED_GOLDEN_MASTER_REVIEW: pack ghi "Tuần: Tý-Sửu" — TRÙNG HỆT với GM-001 (năm Canh Thân, khác hẳn
  // năm Ất Tỵ của GM-006). Theo đúng công thức Tuần Không (đã verified khớp GM-001 qua UI thủ công trước
  // đây), năm Ất Tỵ (cycleIndex 41, thuộc tuần Giáp Thìn) phải cho Tuần Không = Dần-Mão, không phải
  // Tý-Sửu. Nghi ngờ đây là dữ liệu bị copy nhầm từ GM-001 khi soạn pack, không sửa engine theo giá trị
  // này.
  it.fails("Tuần Không = Tý-Sửu theo pack (NEED_GOLDEN_MASTER_REVIEW — engine tính ra Dần-Mão theo Can Chi năm Ất Tỵ)", () => {
    expect(getPalace(chart, "Tý").tuan).toBe(true);
    expect(getPalace(chart, "Sửu").tuan).toBe(true);
  });
});
