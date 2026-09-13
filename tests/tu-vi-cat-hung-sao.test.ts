// Thêm 14/9/2026 — anh Công xem lá số thật, báo 4 sao đang bị xếp NHẦM cột Cát (trái) trong khi bản
// chất là sao XẤU, phải nằm cột Hung (phải): Tướng Quân, Trực Phù, Đẩu Quân, Tức Thần.
//
// Cùng lúc anh Công liệt kê thêm 9 sao khác (Bạch Hổ, Tiểu Hao, Linh Tinh, Thiên Hình, Tang Môn,
// Thiên Khốc, Hỏa Tinh, Thiên Hư, Âm Sát) làm đối chứng — kiểm tra lại thì 9 sao này ĐÃ ĐÚNG Hung sẵn
// trong CAT_HUNG_BY_SAO từ trước, không cần sửa. Test này khóa CẢ 13 sao (4 sao sửa + 9 sao đối chứng)
// để không ai vô tình sửa nhầm về Cát lần nữa.
import { describe, expect, it } from "vitest";
import { CAT_HUNG_BY_SAO, isCat } from "../src/lib/tu-vi/hien-thi-sao";

describe("CAT_HUNG_BY_SAO / isCat — 4 sao anh Công sửa 14/9/2026 (trước ghi nhầm Cát, nay Hung)", () => {
  it.each(["Tướng Quân", "Trực Phù", "Đẩu Quân", "Tức Thần"])("%s phải là Hung", (sao) => {
    expect(CAT_HUNG_BY_SAO[sao]).toBe("Hung");
    expect(isCat(sao)).toBe(false);
  });
});

describe("CAT_HUNG_BY_SAO — 9 sao đối chứng anh Công nêu cùng lúc, đã đúng Hung từ trước (không đổi)", () => {
  it.each([
    "Bạch Hổ", "Tiểu Hao", "Linh Tinh", "Thiên Hình", "Tang Môn",
    "Thiên Khốc", "Hỏa Tinh", "Thiên Hư", "Âm Sát",
  ])("%s phải là Hung", (sao) => {
    expect(CAT_HUNG_BY_SAO[sao]).toBe("Hung");
    expect(isCat(sao)).toBe(false);
  });
});
