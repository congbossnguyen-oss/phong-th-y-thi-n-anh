import { describe, expect, it } from "vitest";
import { computeCalendarData } from "../../../src/calendar/foundation.js";
import { computeHeavenEarthPlate, heavenPlateAt } from "../../../src/heaven-earth-plate/compute.js";
import { computeFourLessons } from "../../../src/four-lessons/compute.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import type { ChartInput } from "../../../src/types/chart.js";
import type { CalendarData } from "../../../src/types/calendar-data.js";
import type { MonthGeneral } from "../../../src/types/month-general.js";
import type { FourLessons } from "../../../src/types/four-lessons.js";
import type { Can, Chi } from "../../../src/types/ganzhi.js";
import { computeNineMethodSelection, selectMaoXing } from "../../../src/nine-methods/compute.js";
import { NineMethodsError } from "../../../src/nine-methods/errors.js";
import { MAOXING_PROVENANCE, YAOKE_PROVENANCE, BIEZE_PROVENANCE, BAZHUAN_SELECTION_PROVENANCE, FANYIN_WUQIN_PROVENANCE } from "../../../src/nine-methods/provenance.js";
import { computeYiMa } from "../../../src/yi-ma/compute.js";
import { YI_MA_PROVENANCE } from "../../../src/yi-ma/provenance.js";

/**
 * Golden cases (Phase 9B) — TẤT CẢ giá trị kỳ vọng (4 khóa + Sơ truyền) đã XÁC MINH ĐỘC LẬP
 * bằng cách chạy THỰC SỰ (không phải chỉ dò tay) 1 bản trích xuất độc lập của
 * `d1210182010/daliuren-web-engine` (commit d5cb9a7, app/repo_core/shipan/shipan.py — class
 * TianPan/SiKe/SanChuan, cùng các lớp phụ trợ ganzhiwuxin.py) — KHÔNG lấy output từ
 * implementation mới của chính package này. Xem nine-methods/provenance.ts cho trích dẫn đầy
 * đủ. Template `CalendarData` dùng lại lá số 2024-01-01 00:30 Asia/Shanghai đã verify (Phase
 * 5B-1/8B) — CHỈ mượn shape, ghi đè `dayPillar`/`hourPillar` theo từng case.
 */
const TEMPLATE_CALENDAR = computeCalendarData({ date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" }, CLASSICAL_V1_PROFILE);

function calendarWith(dayCan: Can, dayChi: Chi, hourChi: Chi): CalendarData {
  return {
    ...TEMPLATE_CALENDAR,
    dayPillar: { ...TEMPLATE_CALENDAR.dayPillar, can: dayCan, chi: dayChi },
    hourPillar: { ...TEMPLATE_CALENDAR.hourPillar, chi: hourChi },
  };
}

const MONTH_GENERAL_TY: MonthGeneral = { zhi: "Tý", classicalName: "thầnHậu" };
const MONTH_GENERAL_SUU: MonthGeneral = { zhi: "Sửu", classicalName: "đạiCát" };

function buildFourLessons(monthGeneral: MonthGeneral, dayCan: Can, dayChi: Chi, hourChi: Chi): { fourLessons: FourLessons; heavenEarthPlate: ReturnType<typeof computeHeavenEarthPlate>["heavenEarthPlate"] } {
  const calendarData = calendarWith(dayCan, dayChi, hourChi);
  const { heavenEarthPlate } = computeHeavenEarthPlate(monthGeneral, calendarData);
  const { fourLessons } = computeFourLessons(calendarData, heavenEarthPlate);
  return { fourLessons, heavenEarthPlate };
}

describe("daliuren-engine/nine-methods/compute — computeNineMethodSelection", () => {
  describe("Test A — 賊克法 (zeike, nhánh 賊 duy nhất — golden case TÁI DÙNG từ Phase 9A: monthGeneral=Sửu hourChi=Tý dayCan=Giáp dayChi=Tý)", () => {
    it("4 khóa + Sơ truyền khớp CHÍNH XÁC output thật của repo A (重審卦)", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_SUU, "Giáp", "Tý", "Tý");
      expect(fourLessons.lesson1).toEqual({ upper: "Mão", lower: "Giáp" });
      expect(fourLessons.lesson2).toEqual({ upper: "Thìn", lower: "Mão" });
      expect(fourLessons.lesson3).toEqual({ upper: "Sửu", lower: "Tý" });
      expect(fourLessons.lesson4).toEqual({ upper: "Dần", lower: "Sửu" });

      const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Giáp");
      expect(selection.method).toBe("zeike");
      expect(selection.initial).toBe("Thìn");
    });
  });

  describe("Test B — 比用法 (biyong, nhánh 知一卦: monthGeneral=Tý hourChi=Sửu dayCan=Giáp dayChi=Tý)", () => {
    it("4 khóa + Sơ truyền khớp CHÍNH XÁC output thật của repo A", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Giáp", "Tý", "Sửu");
      expect(fourLessons.lesson1).toEqual({ upper: "Sửu", lower: "Giáp" });
      expect(fourLessons.lesson2).toEqual({ upper: "Tý", lower: "Sửu" });
      expect(fourLessons.lesson3).toEqual({ upper: "Hợi", lower: "Tý" });
      expect(fourLessons.lesson4).toEqual({ upper: "Tuất", lower: "Hợi" });

      const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Giáp");
      expect(selection.method).toBe("biyong");
      expect(selection.initial).toBe("Tý");
    });
  });

  describe("Test C — 涉害法 main branch (shehai, nhánh 涉害卦 độ sâu tối đa duy nhất: monthGeneral=Tý hourChi=Dần dayCan=Giáp dayChi=Thìn)", () => {
    it("4 khóa + Sơ truyền khớp CHÍNH XÁC output thật của repo A", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Giáp", "Thìn", "Dần");
      expect(fourLessons.lesson1).toEqual({ upper: "Tý", lower: "Giáp" });
      expect(fourLessons.lesson2).toEqual({ upper: "Tuất", lower: "Tý" });
      expect(fourLessons.lesson3).toEqual({ upper: "Dần", lower: "Thìn" });
      expect(fourLessons.lesson4).toEqual({ upper: "Tý", lower: "Dần" });

      const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Giáp");
      expect(selection.method).toBe("shehai");
      expect(selection.initial).toBe("Dần");
    });
  });

  describe("Test D — 伏吟 activation (throws INSUFFICIENT_EVIDENCE_FUYIN_SELECTION, KHÔNG đoán công thức chọn giá trị: monthGeneral=Tý hourChi=Tý dayCan=Giáp dayChi=Tý)", () => {
    it("kích hoạt đúng (repo A cũng xác nhận đây là 伏吟 qua 支阳神==支) rồi throw tường minh", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Giáp", "Tý", "Tý");
      // Xác nhận ĐÂY THẬT SỰ là trường hợp 伏吟 theo đúng activation check (lesson3.upper===lesson3.lower).
      expect(fourLessons.lesson3.upper).toBe(fourLessons.lesson3.lower);

      try {
        computeNineMethodSelection(fourLessons, heavenEarthPlate, "Giáp");
        expect.fail("Kỳ vọng ném NineMethodsError nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(NineMethodsError);
        expect((error as NineMethodsError).code).toBe("INSUFFICIENT_EVIDENCE_FUYIN_SELECTION");
      }
    });
  });

  describe("Test E — 返吟 CÓ khắc (delegate sang 賊克, thành công: monthGeneral=Tý hourChi=Ngọ dayCan=Giáp dayChi=Dần)", () => {
    it("kích hoạt 返吟 đúng (repo A xác nhận qua 支阳神.六冲(支)) rồi delegate ra kết quả khớp output thật của repo A (重審卦)", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Giáp", "Dần", "Ngọ");
      expect(fourLessons.lesson1).toEqual({ upper: "Thân", lower: "Giáp" });
      expect(fourLessons.lesson2).toEqual({ upper: "Dần", lower: "Thân" });
      expect(fourLessons.lesson3).toEqual({ upper: "Thân", lower: "Dần" });
      expect(fourLessons.lesson4).toEqual({ upper: "Dần", lower: "Thân" });

      const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Giáp");
      expect(selection.method).toBe("zeike");
      expect(selection.initial).toBe("Dần");
      expect(selection.methodSubcase).toMatch(/返吟/);
    });
  });

  describe("Test F (Phase 9C) — 返吟 VÔ khắc hoàn toàn (nay THÀNH CÔNG qua 驛馬, golden case: monthGeneral=Tý hourChi=Ngọ dayCan=Đinh dayChi=Sửu)", () => {
    it("kích hoạt 返吟 đúng, Tứ Khóa vô khắc (repo A: nhánh 無依卦/驛馬), initial/middle/final khớp CHÍNH XÁC output thật của repo A: (Hợi, Mùi, Sửu) — KHÔNG qua heavenPlateAt chain", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Đinh", "Sửu", "Ngọ");
      expect(fourLessons.lesson1).toEqual({ upper: "Sửu", lower: "Đinh" });
      expect(fourLessons.lesson2).toEqual({ upper: "Mùi", lower: "Sửu" });
      expect(fourLessons.lesson3).toEqual({ upper: "Mùi", lower: "Sửu" });
      expect(fourLessons.lesson4).toEqual({ upper: "Sửu", lower: "Mùi" });

      const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Đinh");
      expect(selection.method).toBe("fanyin");
      expect(selection.initial).toBe("Hợi");
      expect(selection.middle).toBe("Mùi");
      expect(selection.final).toBe("Sửu");
      expect(selection.provenanceId).toBe(FANYIN_WUQIN_PROVENANCE.id);

      // KHÔNG qua chain: heavenPlateAt(initial="Hợi") KHÔNG bằng middle ở đây (chứng minh TYPE B).
      expect(heavenPlateAt(heavenEarthPlate, "Hợi")).not.toBe(selection.middle);
    });
  });

  describe("Test G — ngoài phạm vi TOÀN BỘ cascade đã implement (không phải 伏吟/返吟, vô khắc trực tiếp, 遙克/昴星/別責/八專 đều không áp dụng) — throw INSUFFICIENT_EVIDENCE_BEYOND_ZEIKE_CASCADE", () => {
    it("fixture TỔNG HỢP (không tương ứng lá số thật; test defensive tại tầng unit cho input shape) throw đúng lỗi sau khi đã thử hết CẢ 9 pháp", () => {
      // 4 khóa tự dựng: mọi cặp upper/lower đều CÙNG Ngũ Hành => không khắc nội bộ khóa nào
      // (loại 賊克/比用/涉害); dayCan=Nhâm(Thủy) không khắc/bị khắc bởi Khóa 2/3/4 (loại 遙克);
      // CHỈ 2 giá trị upper phân biệt {Tý,Dần} (loại 昴星 [cần 4] LẪN 別責 [cần đúng 3]);
      // Nhâm-Tý KHÔNG phải 1 trong 5 ngày 八專 (loại 八專).
      const fourLessons: FourLessons = {
        lesson1: { upper: "Tý", lower: "Nhâm" }, // Tý=Thủy, Nhâm=Thủy — không khắc
        lesson2: { upper: "Tý", lower: "Tý" }, // trùng upper với lesson1; Thủy-Thủy — không khắc
        lesson3: { upper: "Dần", lower: "Mão" }, // Dần=Mộc, Mão=Mộc — không khắc; KHÔNG kích hoạt 伏吟 (Dần≠Mão) lẫn 返吟 (Dần không đối xung Mão)
        lesson4: { upper: "Dần", lower: "Dần" }, // trùng upper với lesson3; Mộc-Mộc — không khắc
      };
      const { heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Nhâm", "Tý", "Sửu");

      // Xác nhận đúng tiền đề: chỉ 2 giá trị upper phân biệt, không phải ngày 八專.
      expect(new Set([fourLessons.lesson1.upper, fourLessons.lesson2.upper, fourLessons.lesson3.upper, fourLessons.lesson4.upper]).size).toBe(2);

      try {
        computeNineMethodSelection(fourLessons, heavenEarthPlate, "Nhâm");
        expect.fail("Kỳ vọng ném NineMethodsError nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(NineMethodsError);
        expect((error as NineMethodsError).code).toBe("INSUFFICIENT_EVIDENCE_BEYOND_ZEIKE_CASCADE");
      }
    });
  });

  describe("Test K (Phase 9C) — 別責法 Dương (golden case: monthGeneral=Tý hourChi=Hợi dayCan=Bính dayChi=Thìn)", () => {
    it("4 khóa + initial/middle/final khớp CHÍNH XÁC output thật của repo A: (Hợi, Ngọ, Ngọ) — middle===final, KHÔNG qua chain", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Bính", "Thìn", "Hợi");
      expect(fourLessons.lesson1).toEqual({ upper: "Ngọ", lower: "Bính" });
      expect(fourLessons.lesson2).toEqual({ upper: "Mùi", lower: "Ngọ" });
      expect(fourLessons.lesson3).toEqual({ upper: "Tỵ", lower: "Thìn" });
      expect(fourLessons.lesson4).toEqual({ upper: "Ngọ", lower: "Tỵ" });
      expect(new Set([fourLessons.lesson1.upper, fourLessons.lesson2.upper, fourLessons.lesson3.upper, fourLessons.lesson4.upper]).size).toBe(3);

      const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Bính");
      expect(selection.method).toBe("bieze");
      expect(selection.initial).toBe("Hợi");
      expect(selection.middle).toBe("Ngọ");
      expect(selection.final).toBe("Ngọ");
      expect(selection.middle).toBe(selection.final);
      expect(selection.provenanceId).toBe(BIEZE_PROVENANCE.id);
    });
  });

  describe("Test L (Phase 9C) — 別責法 Âm (golden case: monthGeneral=Tý hourChi=Sửu dayCan=Tân dayChi=Dậu)", () => {
    it("4 khóa + initial/middle/final khớp CHÍNH XÁC output thật của repo A: (Sửu, Dậu, Dậu) — Sơ truyền dịch Chi TRỰC TIẾP, KHÔNG qua heavenPlateAt", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Tân", "Dậu", "Sửu");
      expect(fourLessons.lesson1).toEqual({ upper: "Dậu", lower: "Tân" });
      expect(fourLessons.lesson2).toEqual({ upper: "Thân", lower: "Dậu" });
      expect(fourLessons.lesson3).toEqual({ upper: "Thân", lower: "Dậu" });
      expect(fourLessons.lesson4).toEqual({ upper: "Mùi", lower: "Thân" });
      expect(new Set([fourLessons.lesson1.upper, fourLessons.lesson2.upper, fourLessons.lesson3.upper, fourLessons.lesson4.upper]).size).toBe(3);

      const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Tân");
      expect(selection.method).toBe("bieze");
      expect(selection.initial).toBe("Sửu");
      expect(selection.middle).toBe("Dậu");
      expect(selection.final).toBe("Dậu");
      expect(selection.provenanceId).toBe(BIEZE_PROVENANCE.id);
    });
  });

  describe("Test M (Phase 9C) — 八專法 Dương (golden case: monthGeneral=Tý hourChi=Sửu dayCan=Canh dayChi=Thân — 1 trong 5 ngày 八專)", () => {
    it("4 khóa + initial/middle/final khớp CHÍNH XÁC output thật của repo A: (Dậu, Mùi, Mùi)", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Canh", "Thân", "Sửu");
      expect(fourLessons.lesson1).toEqual({ upper: "Mùi", lower: "Canh" });
      expect(fourLessons.lesson2).toEqual({ upper: "Ngọ", lower: "Mùi" });
      expect(fourLessons.lesson3).toEqual({ upper: "Mùi", lower: "Thân" });
      expect(fourLessons.lesson4).toEqual({ upper: "Ngọ", lower: "Mùi" });

      const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Canh");
      expect(selection.method).toBe("bazhuan");
      expect(selection.initial).toBe("Dậu");
      expect(selection.middle).toBe("Mùi");
      expect(selection.final).toBe("Mùi");
      expect(selection.middle).toBe(selection.final);
      expect(selection.provenanceId).toBe(BAZHUAN_SELECTION_PROVENANCE.id);
    });
  });

  describe("Test N (Phase 9C) — 八專法 Âm (golden case: monthGeneral=Tý hourChi=Sửu dayCan=Đinh dayChi=Mùi — 1 trong 5 ngày 八專)", () => {
    it("4 khóa + initial/middle/final khớp CHÍNH XÁC output thật của repo A: (Mão, Ngọ, Ngọ) — Sơ truyền dịch từ Khóa4.upper, KHÔNG phải Khóa1", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Đinh", "Mùi", "Sửu");
      expect(fourLessons.lesson1).toEqual({ upper: "Ngọ", lower: "Đinh" });
      expect(fourLessons.lesson2).toEqual({ upper: "Tỵ", lower: "Ngọ" });
      expect(fourLessons.lesson3).toEqual({ upper: "Ngọ", lower: "Mùi" });
      expect(fourLessons.lesson4).toEqual({ upper: "Tỵ", lower: "Ngọ" });

      const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Đinh");
      expect(selection.method).toBe("bazhuan");
      expect(selection.initial).toBe("Mão");
      expect(selection.middle).toBe("Ngọ");
      expect(selection.final).toBe("Ngọ");
      expect(selection.provenanceId).toBe(BAZHUAN_SELECTION_PROVENANCE.id);
    });
  });

  describe("Test O (Phase 9C) — 驛馬 module (yi-ma/) độc lập", () => {
    it("khớp CHÍNH XÁC bảng Algorithm Spec §10, cả 4 tam hợp cục", () => {
      expect(computeYiMa("Dần").yiMa).toBe("Thân");
      expect(computeYiMa("Ngọ").yiMa).toBe("Thân");
      expect(computeYiMa("Tuất").yiMa).toBe("Thân");
      expect(computeYiMa("Thân").yiMa).toBe("Dần");
      expect(computeYiMa("Tý").yiMa).toBe("Dần");
      expect(computeYiMa("Thìn").yiMa).toBe("Dần");
      expect(computeYiMa("Tỵ").yiMa).toBe("Hợi");
      expect(computeYiMa("Dậu").yiMa).toBe("Hợi");
      expect(computeYiMa("Sửu").yiMa).toBe("Hợi");
      expect(computeYiMa("Hợi").yiMa).toBe("Tỵ");
      expect(computeYiMa("Mão").yiMa).toBe("Tỵ");
      expect(computeYiMa("Mùi").yiMa).toBe("Tỵ");
    });

    it("provenanceId trỏ đúng YI_MA_PROVENANCE thật, confidence B", () => {
      const result = computeYiMa("Sửu");
      expect(result.provenanceId).toBe(YI_MA_PROVENANCE.id);
      expect(YI_MA_PROVENANCE.confidence).toBe("B");
    });
  });

  describe("ARCHITECTURE (Phase 9C) — TYPE A (chain) vs TYPE B (explicit) đúng theo pháp", () => {
    it("賊克/比用/涉害/遙克/昴星/返吟-có-khắc (TYPE A): selection KHÔNG có middle/final tường minh", () => {
      const zeikeCase = buildFourLessons(MONTH_GENERAL_SUU, "Giáp", "Tý", "Tý"); // Test A
      const zeikeSelection = computeNineMethodSelection(zeikeCase.fourLessons, zeikeCase.heavenEarthPlate, "Giáp");
      expect(zeikeSelection.middle).toBeUndefined();
      expect(zeikeSelection.final).toBeUndefined();
    });

    it("別責/八專/返吟-vô-khắc (TYPE B): selection CÓ middle/final tường minh, middle===final cho riêng 別責/八專", () => {
      const biezeCase = buildFourLessons(MONTH_GENERAL_TY, "Bính", "Thìn", "Hợi"); // Test K
      const biezeSelection = computeNineMethodSelection(biezeCase.fourLessons, biezeCase.heavenEarthPlate, "Bính");
      expect(biezeSelection.middle).toBeDefined();
      expect(biezeSelection.final).toBe(biezeSelection.middle);

      const bazhuanCase = buildFourLessons(MONTH_GENERAL_TY, "Canh", "Thân", "Sửu"); // Test M
      const bazhuanSelection = computeNineMethodSelection(bazhuanCase.fourLessons, bazhuanCase.heavenEarthPlate, "Canh");
      expect(bazhuanSelection.middle).toBeDefined();
      expect(bazhuanSelection.final).toBe(bazhuanSelection.middle);
    });
  });

  describe("Test I (Remediation) — 遙克法 (yaoke, golden case ĐỘC LẬP: monthGeneral=Tý hourChi=Sửu dayCan=Ất dayChi=Dậu — quét thấy trong lần chạy thật repo A đầu Phase 9B, chưa dùng vì 遙克 lúc đó ngoài phạm vi)", () => {
    it("4 khóa + Sơ truyền khớp CHÍNH XÁC output thật của repo A (遙克卦, dedup=1, KHÔNG cần delegate 比用)", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Ất", "Dậu", "Sửu");
      expect(fourLessons.lesson1).toEqual({ upper: "Mão", lower: "Ất" });
      expect(fourLessons.lesson2).toEqual({ upper: "Dần", lower: "Mão" });
      expect(fourLessons.lesson3).toEqual({ upper: "Thân", lower: "Dậu" });
      expect(fourLessons.lesson4).toEqual({ upper: "Mùi", lower: "Thân" });

      const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Ất");
      expect(selection.method).toBe("yaoke");
      expect(selection.initial).toBe("Thân");
      expect(selection.provenanceId).toBe(YAOKE_PROVENANCE.id);
    });
  });

  describe("Test J (Remediation) — dispatcher: 遙克 được thử TRƯỚC 昴星 đúng thứ tự cascade", () => {
    it("case Test I cũng thỏa tiên quyết 昴星 (4 khóa phân biệt, `selectMaoXing` không throw) — dispatcher chính PHẢI báo cáo method='yaoke' + đúng provenance của 遙克, KHÔNG được 'nhảy cóc' báo method='maoxing'", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Ất", "Dậu", "Sửu");

      // Xác nhận fixture NÀY cũng thỏa tiên quyết của 昴星 (không throw) — nếu 昴星 tự nó KHÔNG
      // thể áp dụng, test này không chứng minh được gì về THỨ TỰ ưu tiên giữa 2 pháp.
      expect(() => selectMaoXing(fourLessons, heavenEarthPlate)).not.toThrow();

      const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Ất");
      expect(selection.method).toBe("yaoke");
      expect(selection.provenanceId).not.toBe(MAOXING_PROVENANCE.id);
    });
  });

  describe("Test H — 昴星法 (selectMaoXing — Remediation: NAY ĐÃ wired vào dispatcher chính sau 遙克, xem Test J; test này kiểm hàm độc lập)", () => {
    it("Sơ truyền = Thiên Bàn tại cung Dậu, khi Tứ Khóa đủ 4 khóa không trùng lặp", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Giáp", "Tý", "Sửu");
      const selection = selectMaoXing(fourLessons, heavenEarthPlate);
      expect(selection.method).toBe("maoxing");
      // heavenPlateAt(Dậu) cho case này (đã verify Phase 9A convention: monthGeneral=Tý(idx0), hourChi=Sửu(idx1) => heavenPlate[j] = EARTH_PLATE[(0+(j-1)+12)%12]).
      // Dậu index=9 => heavenPlate[9] = EARTH_PLATE[(0+8)%12] = EARTH_PLATE[8] = Thân.
      expect(selection.initial).toBe("Thân");
    });

    it("throw khi Tứ Khóa KHÔNG đủ 4 khóa không trùng lặp (dùng lại fixture Test E, chỉ 2 giá trị upper phân biệt)", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_TY, "Giáp", "Dần", "Ngọ");
      expect(() => selectMaoXing(fourLessons, heavenEarthPlate)).toThrow(NineMethodsError);
    });
  });

  describe("DETERMINISM", () => {
    it("gọi nhiều lần cùng input cho kết quả hệt nhau", () => {
      const { fourLessons, heavenEarthPlate } = buildFourLessons(MONTH_GENERAL_SUU, "Giáp", "Tý", "Tý");
      const first = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Giáp");
      const second = computeNineMethodSelection(fourLessons, heavenEarthPlate, "Giáp");
      expect(second).toEqual(first);
    });
  });
});
