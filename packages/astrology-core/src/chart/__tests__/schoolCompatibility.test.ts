/**
 * Kiểm tra đúng 4 yêu cầu "school isolation / contract purity" của Phase 2:
 * - NormalizedChart phải nhận được cả fixture tương thích Western LẪN Vedic bằng CÙNG một
 *   type/validator, không cần nhánh rẽ theo school.
 * - Không field nào trong contract là bắt buộc phải chứa nội dung diễn giải.
 * - Không có field/khoá đặc thù trường phái nào rò rỉ vào contract chung.
 */
import { describe, expect, it } from "vitest";
import { validateNormalizedChart } from "../validation.js";
import { serializeNormalizedChart } from "../serialization.js";
import { fullVedicChart, fullWesternChart, minimalValidChart } from "./fixtures.js";

const GENERIC_CHART_KEYS = [
  "metadata",
  "birthDataRef",
  "school",
  "zodiacType",
  "ayanamsa",
  "houseSystem",
  "planets",
  "points",
  "houses",
  "houseCusps",
  "angles",
  "aspects",
  "dignities",
  "nodes",
].sort();

describe("NormalizedChart — tương thích Western", () => {
  it("fixture Western hợp lệ qua ĐÚNG cùng 1 validator dùng chung, không cần nhánh riêng cho Western", () => {
    const chart = fullWesternChart();
    expect(chart.school).toBe("western");
    expect(chart.zodiacType).toBe("tropical");
    expect(chart.ayanamsa).toBeNull();
    expect(validateNormalizedChart(chart)).toEqual([]);
  });
});

describe("NormalizedChart — tương thích Vedic", () => {
  it("fixture Vedic hợp lệ qua ĐÚNG cùng 1 validator dùng chung, không cần nhánh riêng cho Vedic", () => {
    const chart = fullVedicChart();
    expect(chart.school).toBe("vedic");
    expect(chart.zodiacType).toBe("sidereal");
    expect(chart.ayanamsa).toBe("lahiri");
    expect(chart.houseSystem).toBe("whole_sign");
    expect(validateNormalizedChart(chart)).toEqual([]);
  });

  it("KHÔNG giả định tropical/Placidus mặc định — Vedic tự chọn sidereal/whole_sign/lahiri mà không bị validator từ chối", () => {
    const chart = fullVedicChart();
    const errors = validateNormalizedChart(chart);
    expect(errors.filter((e) => e.code === "MISSING_AYANAMSA_FOR_SIDEREAL" || e.code === "UNEXPECTED_AYANAMSA_FOR_TROPICAL")).toEqual([]);
  });
});

describe("NormalizedChart — không field nào bắt buộc phải là nội dung diễn giải", () => {
  it("chart tối thiểu (mọi mảng rỗng, không câu chữ diễn giải nào) vẫn HỢP LỆ", () => {
    // Đây chính là bằng chứng runtime rằng contract không ép buộc bất kỳ nội dung
    // luận giải/ý nghĩa nào — một NormalizedChart hoàn toàn "câm" (không yoga, không mô tả
    // tính cách, không dự đoán) vẫn thoả mãn validator.
    expect(validateNormalizedChart(minimalValidChart())).toEqual([]);
  });

  it("không có field string tự do nào trong fixture đầy đủ chứa văn phong diễn giải (heuristic: không câu hoàn chỉnh tiếng Anh/Việt)", () => {
    const suspiciousPatterns = [/you (are|will|may)/i, /bạn (là|sẽ|có thể)/i, /personality/i, /prediction/i, /tính cách/i, /vận mệnh/i];
    const json = serializeNormalizedChart(fullWesternChart()) + serializeNormalizedChart(fullVedicChart());
    for (const pattern of suspiciousPatterns) {
      expect(json).not.toMatch(pattern);
    }
  });
});

describe("NormalizedChart — không rò rỉ dữ liệu đặc thù trường phái vào contract chung", () => {
  it("chart Western chỉ có ĐÚNG các key của contract chung, không thêm key riêng kiểu 'firdaria'/'profection'", () => {
    expect(Object.keys(fullWesternChart()).sort()).toEqual(GENERIC_CHART_KEYS);
  });

  it("chart Vedic chỉ có ĐÚNG các key của contract chung, không thêm key riêng kiểu 'dasha'/'nakshatra'/'varga'", () => {
    expect(Object.keys(fullVedicChart()).sort()).toEqual(GENERIC_CHART_KEYS);
  });

  it("cả hai school dùng chung ĐÚNG MỘT bộ khoá NormalizedChart — không lệch nhau field nào", () => {
    expect(Object.keys(fullWesternChart()).sort()).toEqual(Object.keys(fullVedicChart()).sort());
  });
});
