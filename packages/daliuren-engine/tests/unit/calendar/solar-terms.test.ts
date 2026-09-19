import { describe, expect, it } from "vitest";
import { getPrecedingMajorTerm, getPrecedingSolarTerm, getSolarTermsWindow } from "../../../src/calendar/solar-terms.js";
import { CalendarFoundationError } from "../../../src/calendar/errors.js";

/**
 * PUBLIC ALMANAC REFERENCE — thời điểm Hán tự almanac phổ biến (giờ Bắc Kinh, quy đổi UTC),
 * KHÔNG PHẢI lấy từ chạy chính package này. Đối chiếu độc lập đã thực hiện ở Phase 4
 * (docs/daliuren/DA_LIU_REN_CALENDAR_BOUNDARY_TESTS.md §2a) cho thấy sai số vài phút giữa
 * thuật toán Newton-Raphson của calendar-core và almanac phổ biến — dung sai ±30 phút dưới
 * đây RỘNG HƠN sai số đã ghi nhận (tối đa ~7 phút), nên vẫn là phép kiểm tra có ý nghĩa
 * (phát hiện lệch NGÀY/GIỜ lớn, vd tra nhầm năm) mà không giả vờ chính xác tới từng giây.
 */
function assertWithinTolerance(actualIso: string, almanacUtcIso: string, toleranceMinutes: number): void {
  const actualMs = new Date(actualIso).getTime();
  const almanacMs = new Date(almanacUtcIso).getTime();
  const diffMinutes = Math.abs(actualMs - almanacMs) / 60000;
  expect(diffMinutes).toBeLessThanOrEqual(toleranceMinutes);
}

describe("daliuren-engine/calendar/solar-terms", () => {
  describe("getSolarTermsWindow — gộp 3 năm (year-1, year, year+1)", () => {
    it("trả về đúng 72 tiết khí (24 x 3 năm), sắp xếp tăng dần theo thời gian", () => {
      const window = getSolarTermsWindow(2024);
      expect(window).toHaveLength(72);
      for (let i = 1; i < window.length; i++) {
        expect(window[i]!.occurredAt >= window[i - 1]!.occurredAt).toBe(true);
      }
    });

    it("chứa tiết khí của NĂM TRƯỚC (vd Đông Chí năm trước) — đây chính là gap đã ghi nhận Phase 4 §5 nếu KHÔNG gộp", () => {
      const window = getSolarTermsWindow(2024);
      const hasPriorYearTerm = window.some((term) => term.occurredAt.startsWith("2023-12"));
      expect(hasPriorYearTerm).toBe(true);
    });
  });

  describe("PUBLIC ALMANAC REFERENCE — Tiểu Hàn/Đại Hàn/Lập Xuân/Đông Chí (dung sai ±30 phút, KHÔNG tự suy từ implementation)", () => {
    it("Lập Xuân 2024 ≈ 2024-02-04 08:27 UTC (almanac: 16:27 giờ Bắc Kinh)", () => {
      const window = getSolarTermsWindow(2024);
      const lapXuan = window.find((t) => t.nameHan === "立春" && t.occurredAt.startsWith("2024-02"));
      expect(lapXuan).toBeDefined();
      assertWithinTolerance(lapXuan!.occurredAt, "2024-02-04T08:27:00Z", 30);
    });

    it("Lập Xuân 2025 ≈ 2025-02-03 14:10 UTC (almanac: 22:10 giờ Bắc Kinh)", () => {
      const window = getSolarTermsWindow(2025);
      const lapXuan = window.find((t) => t.nameHan === "立春" && t.occurredAt.startsWith("2025-02"));
      expect(lapXuan).toBeDefined();
      assertWithinTolerance(lapXuan!.occurredAt, "2025-02-03T14:10:00Z", 30);
    });

    it("Đông Chí 2023 ≈ 2023-12-22 03:27 UTC (almanac: 11:27 giờ Bắc Kinh)", () => {
      const window = getSolarTermsWindow(2023);
      const dongChi = window.find((t) => t.nameHan === "冬至" && t.occurredAt.startsWith("2023-12"));
      expect(dongChi).toBeDefined();
      assertWithinTolerance(dongChi!.occurredAt, "2023-12-22T03:27:00Z", 30);
    });
  });

  describe("SYNTHETIC/DEFINITIONAL TEST — thứ tự Đông Chí → Tiểu Hàn → Đại Hàn → Lập Xuân là ĐỊNH NGHĨA thiên văn cố định, không phụ thuộc năm nào", () => {
    it.each([1999, 2000, 2023, 2024, 2025, 2026])("năm %i: Tiểu Hàn < Đại Hàn < Lập Xuân theo đúng thứ tự thời gian", (year) => {
      const window = getSolarTermsWindow(year);
      const tieuHan = window.find((t) => t.nameHan === "小寒" && t.occurredAt.startsWith(`${year}-01`));
      const daiHan = window.find((t) => t.nameHan === "大寒" && t.occurredAt.startsWith(`${year}-01`));
      const lapXuan = window.find((t) => t.nameHan === "立春" && (t.occurredAt.startsWith(`${year}-02`) || t.occurredAt.startsWith(`${year}-01`)));

      expect(tieuHan).toBeDefined();
      expect(daiHan).toBeDefined();
      expect(lapXuan).toBeDefined();
      expect(tieuHan!.occurredAt < daiHan!.occurredAt).toBe(true);
      expect(daiHan!.occurredAt < lapXuan!.occurredAt).toBe(true);
    });
  });

  describe("getPrecedingSolarTerm / getPrecedingMajorTerm", () => {
    it("BOUNDARY TEST (Scenario D — sát ranh giới năm): thời điểm đầu tháng 1/2024, TRƯỚC Tiểu Hàn — trung khí gần nhất PHẢI là Đông Chí (năm trước), không throw do thiếu dữ liệu năm trước", () => {
      // Đây CHÍNH LÀ regression test cho gap Phase 4 §5: nếu getSolarTermsWindow không gộp
      // year-1, getSolarTerms(2024) một mình sẽ có trung khí đầu tiên là Đại Hàn (2024-01-20),
      // XẢY RA SAU thời điểm test — hàm sẽ throw "không tìm thấy" thay vì trả về Đông Chí.
      const instant = new Date("2024-01-01T00:00:00Z");
      const term = getPrecedingMajorTerm(instant, 2024);
      expect(term.nameHan).toBe("冬至");
      expect(term.kind).toBe("trungKhi");
    });

    it("thời điểm ngay sau Đại Hàn (giữa tháng 1) — trung khí gần nhất là Đại Hàn của chính năm đó", () => {
      const instant = new Date("2024-01-25T00:00:00Z");
      const term = getPrecedingMajorTerm(instant, 2024);
      expect(term.nameHan).toBe("大寒");
    });

    it("lọc theo kind: getPrecedingSolarTerm không truyền kind trả về tiết khí bất kỳ (có thể là 'tiet') gần nhất", () => {
      // 2024-01-10 nằm sau Tiểu Hàn (小寒, kind=tiet, 01-05) nhưng trước Đại Hàn (大寒, kind=trungKhi, 01-20).
      const instant = new Date("2024-01-10T00:00:00Z");
      const term = getPrecedingSolarTerm(instant, 2024);
      expect(term.nameHan).toBe("小寒");
      expect(term.kind).toBe("tiet");
    });

    it("INVALID_DATETIME_INPUT: năm không phải số nguyên", () => {
      expect(() => getSolarTermsWindow(2024.5)).toThrowError(CalendarFoundationError);
    });
  });
});
