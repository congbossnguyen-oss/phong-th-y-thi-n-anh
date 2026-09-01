// Khoá hành vi coTruongRong() — bắt case thật đã xảy ra 1/9/2026 (11/12 cung Tử Vi rỗng, JSON vẫn
// hợp lệ theo schema). Không gọi AI thật (rẻ, chạy mỗi lần CI).

import { describe, expect, it } from "vitest";
import { coTruongRong } from "../src/lib/tu-vi/luan-giai/kiemTraDayDu";

describe("coTruongRong", () => {
  it("chuỗi có nội dung thật -> không rỗng", () => {
    expect(coTruongRong("Cung này có nội dung.")).toBe(false);
  });

  it("chuỗi rỗng / toàn khoảng trắng -> rỗng", () => {
    expect(coTruongRong("")).toBe(true);
    expect(coTruongRong("   ")).toBe(true);
  });

  it("undefined/null KHÔNG bị coi là rỗng (trường không bắt buộc, cố ý không có)", () => {
    expect(coTruongRong(undefined)).toBe(false);
    expect(coTruongRong(null)).toBe(false);
  });

  it("mảng rỗng -> rỗng; mảng có phần tử thật -> không rỗng", () => {
    expect(coTruongRong([])).toBe(true);
    expect(coTruongRong(["Nên làm A", "Nên làm B"])).toBe(false);
  });

  it("mảng có 1 phần tử rỗng lẫn trong đó -> rỗng (đệ quy)", () => {
    expect(coTruongRong(["Nên làm A", ""])).toBe(true);
  });

  it("object lồng nhau, 1 trường con rỗng -> rỗng (đệ quy)", () => {
    expect(coTruongRong({ a: "có nội dung", b: "" })).toBe(true);
    expect(coTruongRong({ a: "có nội dung", b: "cũng có" })).toBe(false);
  });

  it("case thật 1/9/2026: 11/12 cung rỗng, chỉ Phụ Mẫu có nội dung -> phát hiện rỗng", () => {
    const cungCoNoiDung = {
      ketLuanNhanh: "Tốt", phanTichCauTruc: "...", diemManh: "...", diemYeu: "...",
      nguyenNhan: "...", khaNangUngNghiem: "...", khuyenNghi: "...",
    };
    const cungRong = {
      ketLuanNhanh: "", phanTichCauTruc: "", diemManh: "", diemYeu: "",
      nguyenNhan: "", khaNangUngNghiem: "", khuyenNghi: "",
    };
    const ketQuaGiaLap = {
      luanThienBan: "...",
      chuDe: { hocVan: "...", ngheNghiep: "...", taiChinh: "...", honNhan: "...", sucKhoe: "...", khoKhan: "...", dinhHuong: "..." },
      cung: {
        phu_mau: cungCoNoiDung,
        phuc_duc: cungRong, dien_trach: cungRong, quan_loc: cungRong, no_boc: cungRong,
        thien_di: cungRong, tat_ach: cungRong, tai_bach: cungRong, tu_tuc: cungRong,
        phu_the: cungRong, huynh_de: cungRong, menh: cungRong,
      },
    };
    expect(coTruongRong(ketQuaGiaLap)).toBe(true);
  });

  it("kết quả đầy đủ thật (không mô phỏng lỗi) -> không rỗng", () => {
    const cungDayDu = {
      ketLuanNhanh: "Tốt", phanTichCauTruc: "Chính tinh Tử Vi đắc địa...", diemManh: "Có quý nhân phù trợ.",
      diemYeu: "Cần chú ý sức khỏe.", nguyenNhan: "Do cung Tật Ách có sát tinh.",
      khaNangUngNghiem: "Rõ nhất giai đoạn 30-40 tuổi.", khuyenNghi: "Nên khám sức khỏe định kỳ.",
    };
    const ketQuaGiaLap = {
      luanThienBan: "Lá số có cách cục...",
      chuDe: { hocVan: "...", ngheNghiep: "...", taiChinh: "...", honNhan: "...", sucKhoe: "...", khoKhan: "...", dinhHuong: "..." },
      cung: Object.fromEntries(
        ["phu_mau", "phuc_duc", "dien_trach", "quan_loc", "no_boc", "thien_di", "tat_ach", "tai_bach", "tu_tuc", "phu_the", "huynh_de", "menh"].map(
          (k) => [k, cungDayDu],
        ),
      ),
    };
    expect(coTruongRong(ketQuaGiaLap)).toBe(false);
  });

  it("Nâng Cao: toXauSoVoiHanKhac vắng mặt ở Tiểu Hạn (đúng thiết kế) không bị tính là rỗng", () => {
    const hanDayDu = {
      doanMoDau: "...", quanTamNhieuNhat: "...",
      suKienQuanTrong: { congViec: "...", taiBach: "...", tinhCam: "...", conCai: "...", sucKhoe: "..." },
      toXauSoVoiHanKhac: undefined,
      loiKhuyenNen: ["A", "B"], loiKhuyenKhongNen: ["C", "D"], chotLai: "...",
    };
    expect(coTruongRong(hanDayDu)).toBe(false);
  });
});
