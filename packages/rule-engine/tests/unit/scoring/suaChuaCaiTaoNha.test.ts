import { describe, expect, it } from "vitest";
import {
  classifyRenovationLevel,
  calculateDirectionRisk,
  calculateSiteSafety,
  calculateOwnerYearCompatibility,
  calculateSuaChuaDayBaseScore,
  calculateSuaChuaDayPurposeScore,
  calculateSuaChuaDayPersonal,
  calculateSuaChuaDayScore,
  getSuaChuaRating,
} from "../../../src/scoring/suaChuaCaiTaoNha.js";
import { getNguoiTuoi } from "../../../src/scoring/tuoiHopLamAn.js";
import { getPhuongViRuiRoTheoNam } from "../../../src/cung-menh-bat-trach/index.js";
import type { TrachCatDayBaseInput } from "../../../src/scoring/trachCatDayBase.js";

const NGAY_TOT: TrachCatDayBaseInput = {
  trucName: "Khai",
  hoangDaoHacDao: "hoàng đạo",
  nhiThapBatTuCatHung: "cát",
  thanSat: [],
  nguyetKy: false,
  tamNuong: false,
  duongCongKyNhat: false,
  satChu: false,
  thienDucHop: false,
  thienXa: false,
};

describe("scoring/suaChuaCaiTaoNha — phân loại mức độ", () => {
  it("digsGround luôn cho ra dong-tho, bất kể type là gì", () => {
    expect(classifyRenovationLevel({ type: "light", affectsStructure: false, digsGround: true })).toBe("dong-tho");
  });
  it("affectsStructure (không đào đất) cho ra lon", () => {
    expect(classifyRenovationLevel({ type: "light", affectsStructure: true, digsGround: false })).toBe("lon");
  });
  it("type ánh xạ đúng khi không có cờ đặc biệt", () => {
    expect(classifyRenovationLevel({ type: "light", affectsStructure: false, digsGround: false })).toBe("nhe");
    expect(classifyRenovationLevel({ type: "kitchen", affectsStructure: false, digsGround: false })).toBe("vua");
    expect(classifyRenovationLevel({ type: "roof", affectsStructure: false, digsGround: false })).toBe("lon");
    expect(classifyRenovationLevel({ type: "ground_breaking", affectsStructure: false, digsGround: false })).toBe("dong-tho");
  });
});

describe("scoring/suaChuaCaiTaoNha — rủi ro phương vị", () => {
  it("năm Tý: Thái Tuế tại Khảm, Tuế Phá tại Ly (đối xung Tý-Ngọ), Tam Sát tại Ly (cục Thân-Tý-Thìn)", () => {
    const r = getPhuongViRuiRoTheoNam("Tý");
    expect(r.thaiTueCung).toBe("Khảm");
    expect(r.tuePhaCung).toBe("Ly");
    expect(r.tamSatCung).toBe("Ly");
  });

  it("sửa đúng phương Thái Tuế của năm -> severity high trở lên", () => {
    const risk = calculateDirectionRisk("Tý", "Khảm", "vua");
    expect(risk.thaiTue).toBe(true);
    expect(["high", "critical"]).toContain(risk.severity);
  });

  it("sửa đúng phương Thái Tuế + động thổ -> critical", () => {
    const risk = calculateDirectionRisk("Tý", "Khảm", "dong-tho");
    expect(risk.severity).toBe("critical");
  });

  it("phương không phạm gì thì severity thấp (low)", () => {
    // Năm Tý: Thái Tuế/Tuế Phá/Tam Sát đều ở Khảm/Ly -> Chấn (Đông) không phạm gì.
    const risk = calculateDirectionRisk("Tý", "Chấn", "dong-tho");
    expect(risk.thaiTue).toBe(false);
    expect(risk.tuePha).toBe(false);
    expect(risk.tamSat).toBe(false);
    expect(risk.severity).toBe("low");
  });

  it("calculateSiteSafety lấy phương vị NẶNG NHẤT trong danh sách làm điểm chung", () => {
    const safety = calculateSiteSafety(2026, ["Khảm", "Chấn"], "dong-tho");
    expect(safety.phamNghiemTrong).toBe(true);
    expect(safety.diem).toBeLessThanOrEqual(2);
  });

  it("không phạm gì thì phamNghiemTrong = false, điểm cao", () => {
    const namChi = getPhuongViRuiRoTheoNam("Tý");
    expect(namChi).toBeDefined();
    const safety = calculateSiteSafety(2032, ["Chấn"], "nhe"); // 2032 = Nhâm Tý, kiểm tra Chấn vẫn an toàn
    expect(safety.phamNghiemTrong).toBe(false);
    expect(safety.diem).toBeGreaterThanOrEqual(8);
  });
});

describe("scoring/suaChuaCaiTaoNha — chủ nhà ↔ năm sửa chữa", () => {
  it("điểm trong khoảng 0-10", () => {
    const r = calculateOwnerYearCompatibility(1990, 2026);
    expect(r.diem).toBeGreaterThanOrEqual(0);
    expect(r.diem).toBeLessThanOrEqual(10);
  });

  it("năm sửa Xung Chi tuổi chủ cho điểm thấp hơn năm Tam Hợp", () => {
    // 1996 = Bính Tý -> chi chủ = Tý. Xung Tý = Ngọ. Tam hợp Tý: Thân-Tý-Thìn.
    const xung = calculateOwnerYearCompatibility(1996, 2026); // 2026 = Bính Ngọ
    const tamHop = calculateOwnerYearCompatibility(1996, 2028); // 2028 = Mậu Thân
    expect(tamHop.chiNamQuanHe.diem).toBeGreaterThan(xung.chiNamQuanHe.diem);
  });
});

describe("scoring/suaChuaCaiTaoNha — điểm ngày", () => {
  it("điểm nền trong khoảng 0-10", () => {
    const result = calculateSuaChuaDayBaseScore(NGAY_TOT);
    expect(result.diem).toBeGreaterThanOrEqual(0);
    expect(result.diem).toBeLessThanOrEqual(10);
  });

  it("Trực Mãn chỉ được ưu tiên cho mức Động Thổ, không phải mức Sửa chữa thường", () => {
    const ngayTrucMan: TrachCatDayBaseInput = { ...NGAY_TOT, trucName: "Mãn" };
    const dongTho = calculateSuaChuaDayPurposeScore(ngayTrucMan, "dong-tho");
    const vua = calculateSuaChuaDayPurposeScore(ngayTrucMan, "vua");
    expect(dongTho.diem).toBeGreaterThan(vua.diem);
  });

  it("điểm cá nhân (Ngũ Hành + Can + Chi + Ngũ Hành phương vị) trong khoảng 0-10", () => {
    const nguoi = getNguoiTuoi(1990);
    const result = calculateSuaChuaDayPersonal(nguoi, "Canh", "Tý", "Ly");
    expect(result.diem).toBeGreaterThanOrEqual(0);
    expect(result.diem).toBeLessThanOrEqual(10);
  });

  it("Chi ngày Xung Chi chủ cho điểm cá nhân thấp hơn Chi ngày Tam Hợp", () => {
    const nguoi = getNguoiTuoi(1996); // Bính Tý -> chi Tý
    const tamHop = calculateSuaChuaDayPersonal(nguoi, "Canh", "Thân", "Ly");
    const xung = calculateSuaChuaDayPersonal(nguoi, "Canh", "Ngọ", "Ly");
    expect(tamHop.diem).toBeGreaterThan(xung.diem);
  });

  it("phạm đại kỵ (Sát Chủ) bị chặn trần điểm dù mục đích/cá nhân tốt", () => {
    const nguoi = getNguoiTuoi(1990);
    const ngayDaiKy: TrachCatDayBaseInput = { ...NGAY_TOT, satChu: true };
    const ket = calculateSuaChuaDayScore(ngayDaiKy, "Canh", "Tý", "vua", nguoi, "Ly");
    expect(ket.diem).toBeLessThanOrEqual(3);
  });

  it("phân loại đúng ngưỡng", () => {
    expect(getSuaChuaRating(9.5)).toBe("rat-tot");
    expect(getSuaChuaRating(8.5)).toBe("tot");
    expect(getSuaChuaRating(7.5)).toBe("kha-tot");
    expect(getSuaChuaRating(5.5)).toBe("co-the-dung");
    expect(getSuaChuaRating(3.5)).toBe("khong-thuan");
    expect(getSuaChuaRating(1)).toBe("khong-nen-chon");
  });
});
