import { describe, it, expect } from "vitest";
import { quetSaiSinhKhac } from "../src/lib/luan-giai-toan-dien/kiem-sinh-khac";

describe("quetSaiSinhKhac — phát hiện câu sai chiều Ngũ Hành", () => {
  // --- PHẢI BẮT ĐƯỢC (câu sai chiều thật) ---
  it("bắt lỗi gốc 'Hỏa hao tổn Thủy' (Giai đoạn A cũ)", () => {
    const loi = quetSaiSinhKhac("hành Hỏa cần được tiết chế để tránh làm hao tổn sức mạnh của Thủy.");
    expect(loi.length).toBeGreaterThanOrEqual(1);
    expect(loi[0].x).toBe("Hỏa");
    expect(loi[0].y).toBe("Thủy");
    expect(loi[0].loai).toBe("hai");
  });

  it("bắt 'Thủy sinh Kim' (sai — Kim sinh Thủy)", () => {
    expect(quetSaiSinhKhac("Thủy sinh Kim nên Kim là hỷ thần.").length).toBeGreaterThanOrEqual(1);
  });

  it("bắt 'Thủy khắc Kim' (sai — Thủy không khắc Kim)", () => {
    expect(quetSaiSinhKhac("Trong lá số, Thủy khắc Kim khá mạnh.").length).toBeGreaterThanOrEqual(1);
  });

  it("bắt 'Mộc sinh Kim' (sai)", () => {
    expect(quetSaiSinhKhac("Mộc sinh Kim tạo nền tảng.").length).toBeGreaterThanOrEqual(1);
  });

  it("bắt 'Kim hại Thủy' (sai — Kim sinh Thủy, không hại)", () => {
    expect(quetSaiSinhKhac("Kim hại Thủy trong trường hợp này.").length).toBeGreaterThanOrEqual(1);
  });

  // --- KHÔNG ĐƯỢC BÁO NHẦM (câu đúng chiều) ---
  it("KHÔNG báo 'Kim sinh Thủy' (đúng)", () => {
    expect(quetSaiSinhKhac("Kim sinh Thủy, như người thầy nâng đỡ bản mệnh.")).toEqual([]);
  });

  it("KHÔNG báo 'Thủy khắc Hỏa' (đúng)", () => {
    expect(quetSaiSinhKhac("Thủy khắc Hỏa nên cần lưu ý.")).toEqual([]);
  });

  it("KHÔNG báo 'Hỏa khắc Kim' (đúng)", () => {
    expect(quetSaiSinhKhac("Hỏa khắc Kim làm Kim tổn hại.")).toEqual([]);
  });

  it("KHÔNG báo câu ĐÃ SỬA 'Hỏa ... làm suy yếu Kim' (đúng — Hỏa khắc Kim)", () => {
    const cau = "hành Hỏa là thứ cần tiết chế vì nó có xu hướng làm suy yếu Kim.";
    expect(quetSaiSinhKhac(cau)).toEqual([]);
  });

  it("KHÔNG báo 'Thổ sinh Kim', 'Hỏa sinh Thổ' (đúng)", () => {
    expect(quetSaiSinhKhac("Thổ sinh Kim, Hỏa sinh Thổ, mọi thứ tương sinh.")).toEqual([]);
  });

  it("KHÔNG báo từ ghép 'sinh trợ/sinh dưỡng' (không phải khẳng định có chiều)", () => {
    expect(quetSaiSinhKhac("Thủy cần được sinh trợ nên Kim là hỷ thần.")).toEqual([]);
    expect(quetSaiSinhKhac("nguồn sinh dưỡng nuôi dưỡng Thủy được duy trì nhờ Kim.")).toEqual([]);
  });

  it("KHÔNG báo 'tiết chế' (điều tiết, không phải tiết khí)", () => {
    expect(quetSaiSinhKhac("Hỏa cần được tiết chế để giữ Kim vững vàng.")).toEqual([]);
  });

  it("KHÔNG báo khi 2 hành ở 2 ý rời rạc, không có động từ quan hệ ở giữa", () => {
    expect(quetSaiSinhKhac("Dụng Thần là Kim, còn Hỏa là Kỵ Thần cần tránh.")).toEqual([]);
  });

  it("bắt đúng chiều 'hại' hợp lệ: 'Mộc hao tổn Thủy' đúng (Thủy sinh Mộc → Mộc rút khí Thủy)", () => {
    expect(quetSaiSinhKhac("Mộc hao tổn Thủy vì Thủy phải sinh Mộc.")).toEqual([]);
  });

  // --- Với ctx.nhatChu: bắt câu sai chiều diễn đạt gián tiếp qua "bản mệnh"/"Nhật Chủ" ---
  it("bắt lỗi Giai đoạn L 'Hỏa làm suy yếu ... bản mệnh' (Nhật Chủ Thủy → Hỏa không hại Thủy)", () => {
    const cau = "cần tránh Hỏa làm suy yếu cường độ bản mệnh trong giai đoạn này.";
    expect(quetSaiSinhKhac(cau)).toEqual([]); // không có ctx → không bắt (bản mệnh chưa resolve)
    expect(quetSaiSinhKhac(cau, { nhatChu: "Thủy" }).length).toBeGreaterThanOrEqual(1);
  });

  it("bắt lỗi Giai đoạn I 'Hỏa ... xung khắc ... Thủy' (Hỏa khắc Kim, không khắc Thủy)", () => {
    const cau = "Hỏa là Kỵ thần, giúp giảm bớt áp lực xung khắc lên hành Thủy của Nhật Chủ.";
    expect(quetSaiSinhKhac(cau, { nhatChu: "Thủy" }).length).toBeGreaterThanOrEqual(1);
  });

  it("KHÔNG báo nhầm 'Nhật Chủ Quý Thủy trung hòa' (không có động từ quan hệ)", () => {
    expect(quetSaiSinhKhac("Nhật Chủ Quý Thủy trung hòa, cần Kim nâng đỡ.", { nhatChu: "Thủy" })).toEqual([]);
  });

  it("KHÔNG báo 'Kim sinh Thủy nuôi dưỡng bản mệnh' (đúng — Kim sinh Thủy)", () => {
    expect(quetSaiSinhKhac("Kim sinh Thủy, nuôi dưỡng bản mệnh vững vàng.", { nhatChu: "Thủy" })).toEqual([]);
  });
});
