import { describe, expect, it } from "vitest";
import { Calendar, Data, Timezone } from "@thien-anh/calendar-core";
import { computeBenMing, computeXingNian } from "../../../src/ben-ming-xing-nian/compute.js";
import { BEN_MING_YEAR_BOUNDARY_CONVENTION_PROVENANCE, XING_NIAN_AGE_CONVENTION_PROVENANCE, XING_NIAN_FORMULA_PROVENANCE } from "../../../src/ben-ming-xing-nian/provenance.js";
import type { Can, Chi } from "../../../src/types/ganzhi.js";

function properMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Can-Chi của năm Y qua công thức modulo ĐÃ FREEZE (Phase 11-E, 78/78 MATCH) — kiểm chứng ĐỘC LẬP với computeBenMing (không gọi lại nó). */
function expectedYearCanChi(Y: number): { can: Can; chi: Chi } {
  return { can: Data.CAN[properMod(Y - 4, 10)]!, chi: Data.CHI[properMod(Y - 4, 12)]! };
}

const TZ = "Asia/Shanghai";

describe("daliuren-engine/ben-ming-xing-nian/compute — computeBenMing (BIRTH_YEAR_CONVENTION=LICHUN)", () => {
  it("[B1] trước Lập Xuân (giữa tháng 1) → dùng Can-Chi năm TRƯỚC", () => {
    const { benMing } = computeBenMing("2024-01-15", TZ);
    expect(benMing).toEqual(expectedYearCanChi(2023));
  });

  it("[B3] sau Lập Xuân (cuối tháng 2, an toàn cách xa mốc dao động 3-5/2) → dùng Can-Chi CHÍNH năm đó", () => {
    const { benMing } = computeBenMing("2024-02-20", TZ);
    expect(benMing).toEqual(expectedYearCanChi(2024));
  });

  it("[B4] cuối năm dương lịch (31/12) → đã qua Lập Xuân từ lâu → dùng Can-Chi CHÍNH năm đó", () => {
    const { benMing } = computeBenMing("2023-12-31", TZ);
    expect(benMing).toEqual(expectedYearCanChi(2023));
  });

  it("[B5] đầu năm dương lịch (01/01) → chưa tới Lập Xuân của chính năm đó → dùng Can-Chi năm TRƯỚC", () => {
    const { benMing } = computeBenMing("2024-01-01", TZ);
    expect(benMing).toEqual(expectedYearCanChi(2023));
  });

  it("[B2] ĐÚNG ngày Lập Xuân (dynamic, tính qua Calendar.getSolarTerms — không hardcode ngày 4/2): với hour:0 mặc định (known limitation, xem provenance), LUÔN rơi vào nhánh 'trước Lập Xuân' vì thời điểm Lập Xuân thật luôn > 00:00 giờ địa phương", () => {
    const year = 2024;
    const lichXuan = Calendar.getSolarTerms(year).find((t) => t.name === "Lập Xuân");
    if (!lichXuan) throw new Error("test setup lỗi: không tìm thấy Lập Xuân trong getSolarTerms(2024)");

    const utcInstant = new Date(
      Date.UTC(
        lichXuan.dateTimeUtc.year,
        lichXuan.dateTimeUtc.month - 1,
        lichXuan.dateTimeUtc.day,
        lichXuan.dateTimeUtc.hour,
        lichXuan.dateTimeUtc.minute,
        Math.floor(lichXuan.dateTimeUtc.second),
      ),
    );
    const local = Timezone.utcToZonedTime(utcInstant, TZ);
    // Xác nhận thời điểm Lập Xuân thật KHÔNG rơi đúng 00:00:00 local — nếu rơi đúng 00:00:00 thì
    // test này không còn minh họa đúng "known limitation" (xác suất cực thấp nhưng guard rõ ràng).
    expect(local.hour === 0 && local.minute === 0 && local.second === 0).toBe(false);

    const birthDateOnLichXuanDay = `${local.year}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;
    const { benMing } = computeBenMing(birthDateOnLichXuanDay, TZ);
    // hour:0 (mặc định) < thời điểm Lập Xuân thật (luôn > 00:00) → nhánh "trước Lập Xuân" → năm TRƯỚC.
    expect(benMing).toEqual(expectedYearCanChi(local.year - 1));
  });

  it("KHÔNG phụ thuộc gender — computeBenMing() không nhận tham số gender (đảm bảo ở mức chữ ký hàm, B6/B7/B8 tự động thỏa mãn)", () => {
    expect(computeBenMing.length).toBe(2); // (birthDate, timeZone) — không có tham số thứ 3
  });

  it("cycleIndex trả về khớp đúng với can/chi (self-consistent, dùng cho computeXingNian tái sử dụng)", () => {
    const { benMing, cycleIndex } = computeBenMing("2024-06-01", TZ);
    const rebuilt = Calendar.buildPillar(cycleIndex, cycleIndex);
    expect({ can: rebuilt.can, chi: rebuilt.chi }).toEqual(benMing);
  });

  it("Invalid birthDate format → throw rõ ràng, không âm thầm trả kết quả sai", () => {
    expect(() => computeBenMing("2024/01/01", TZ)).toThrow(/YYYY-MM-DD/);
    expect(() => computeBenMing("2024-13-01", TZ)).toThrow(/không tồn tại trong lịch/);
  });

  it("provenanceId trỏ đúng entry PROJECT CONVENTION (confidence KHÔNG PHẢI A)", () => {
    const { yearBoundaryProvenanceId } = computeBenMing("2024-06-01", TZ);
    expect(yearBoundaryProvenanceId).toBe(BEN_MING_YEAR_BOUNDARY_CONVENTION_PROVENANCE.id);
    expect(BEN_MING_YEAR_BOUNDARY_CONVENTION_PROVENANCE.confidence).not.toBe("A");
  });

  it("DETERMINISM: cùng input → cùng output", () => {
    const first = computeBenMing("2024-06-01", TZ);
    const second = computeBenMing("2024-06-01", TZ);
    expect(second).toEqual(first);
  });
});

describe("daliuren-engine/ben-ming-xing-nian/compute — computeXingNian (AGE_CONVENTION=XUSUI)", () => {
  /** birthCycleIndex cố định = 0 (Giáp Tý) — thuần synthetic, không cần gắn với ngày sinh thật (computeXingNian chỉ nhận cycleIndex nguyên). */
  const BIRTH_CYCLE = 0;
  const currentCycleForAge = (age: number) => properMod(BIRTH_CYCLE + (age - 1), 60);

  it("[X1] male age 1 = 丙寅", () => {
    const { xingNian } = computeXingNian(currentCycleForAge(1), BIRTH_CYCLE, "male");
    expect(xingNian).toEqual({ can: "Bính", chi: "Dần", ageXuSui: 1 });
  });

  it("[X1'] female age 1 = 壬申", () => {
    const { xingNian } = computeXingNian(currentCycleForAge(1), BIRTH_CYCLE, "female");
    expect(xingNian).toEqual({ can: "Nhâm", chi: "Thân", ageXuSui: 1 });
  });

  it("[male] age 2 = 丁卯 (thuận: Can+1, Chi+1)", () => {
    const { xingNian } = computeXingNian(currentCycleForAge(2), BIRTH_CYCLE, "male");
    expect(xingNian).toEqual({ can: "Đinh", chi: "Mão", ageXuSui: 2 });
  });

  it("[female] age 2 = 辛未 (nghịch: Can-1, Chi-1 — khớp nguồn thứ cấp hiện đại, xem provenance)", () => {
    const { xingNian } = computeXingNian(currentCycleForAge(2), BIRTH_CYCLE, "female");
    expect(xingNian).toEqual({ can: "Tân", chi: "Mùi", ageXuSui: 2 });
  });

  it("[X3] male age 10 — kiểm chứng ĐỘC LẬP qua Calendar.buildPillar (anchor Bính Dần cycleIndex=2, +9 bước)", () => {
    const { xingNian } = computeXingNian(currentCycleForAge(10), BIRTH_CYCLE, "male");
    const expectedPillar = Calendar.buildPillar(2 + 9, 2 + 9);
    expect(xingNian).toEqual({ can: expectedPillar.can, chi: expectedPillar.chi, ageXuSui: 10 });
  });

  it("[X4] male age 11 = 丙子 (đã xác nhận nguyên văn 《靈轄經》qua 《六壬神定經》§35)", () => {
    const { xingNian } = computeXingNian(currentCycleForAge(11), BIRTH_CYCLE, "male");
    expect(xingNian).toEqual({ can: "Bính", chi: "Tý", ageXuSui: 11 });
  });

  it("[X5] male age 20 — kiểm chứng ĐỘC LẬP qua Calendar.buildPillar", () => {
    const { xingNian } = computeXingNian(currentCycleForAge(20), BIRTH_CYCLE, "male");
    const expectedPillar = Calendar.buildPillar(2 + 19, 2 + 19);
    expect(xingNian).toEqual({ can: expectedPillar.can, chi: expectedPillar.chi, ageXuSui: 20 });
  });

  it("[X6] male age 21 = 丙戌 (đã xác nhận nguyên văn 《靈轄經》qua 《六壙神定經》§35)", () => {
    const { xingNian } = computeXingNian(currentCycleForAge(21), BIRTH_CYCLE, "male");
    expect(xingNian).toEqual({ can: "Bính", chi: "Tuất", ageXuSui: 21 });
  });

  it(
    "[X9] female age 11 = 壬戌 (Nhâm Tuất) theo mô hình ĐỐI XỨNG đã implement — " +
      "KHÔNG PHẢI '壬午' (Nhâm Ngọ) trích trong nguồn cổ văn (DA_LIU_REN_BENMING_XINGNIAN_SOURCE_RESEARCH.md " +
      "Round 2 mục E/F) — mâu thuẫn CHƯA GIẢI QUYẾT, xem provenance.ts XING_NIAN_FORMULA_PROVENANCE.notes. " +
      "Test này khẳng định hành vi THẬT của implementation (đối xứng, tự nhất quán), KHÔNG khẳng định đây " +
      "là cách đọc cổ văn ĐÚNG duy nhất.",
    () => {
      const { xingNian } = computeXingNian(currentCycleForAge(11), BIRTH_CYCLE, "female");
      expect(xingNian).toEqual({ can: "Nhâm", chi: "Tuất", ageXuSui: 11 });
    },
  );

  it("[X7] boundary chuyển vòng: currentCycleIndex cách birthCycleIndex đủ 60 bước (vd tuổi 61 thật) → Can-Chi VÀ ageXuSui TÍNH RA đều TRÙNG HỆT age 1 — '終而複始' (hết vòng quay lại từ đầu). Đây là hệ quả TẤT YẾU của công thức `((currentCycleIndex-birthCycleIndex) mod 60)+1` (frozen contract của owner) — vì chỉ nhận cycleIndex (đã mod 60) làm input, hàm KHÔNG THỂ phân biệt tuổi 1 với tuổi 61/121/... — ageXuSui trả về LUÔN thuộc [1,60], không phải giới hạn/lỗi của implementation.", () => {
    const age1 = computeXingNian(currentCycleForAge(1), BIRTH_CYCLE, "male");
    const age61 = computeXingNian(currentCycleForAge(61), BIRTH_CYCLE, "male");
    expect(age61.xingNian).toEqual(age1.xingNian); // currentCycleForAge(61) === currentCycleForAge(1) sau mod 60, nên input THẬT SỰ giống hệt nhau
  });

  it("[X7'] boundary chuyển vòng: age 71 (nữ) TRÙNG HỆT age 11 (nữ)", () => {
    const age11 = computeXingNian(currentCycleForAge(11), BIRTH_CYCLE, "female");
    const age71 = computeXingNian(currentCycleForAge(71), BIRTH_CYCLE, "female");
    expect(age71.xingNian.can).toBe(age11.xingNian.can);
    expect(age71.xingNian.chi).toBe(age11.xingNian.chi);
  });

  it("[X10] male THUẬN vs female NGHỊCH — cùng age 2, hướng đối lập rõ ràng (Đinh Mão tiến 1 bước từ Bính Dần; Tân Mùi lùi 1 bước từ Nhâm Thân)", () => {
    const male2 = computeXingNian(currentCycleForAge(2), BIRTH_CYCLE, "male");
    const female2 = computeXingNian(currentCycleForAge(2), BIRTH_CYCLE, "female");
    expect(male2.xingNian).toEqual({ can: "Đinh", chi: "Mão", ageXuSui: 2 });
    expect(female2.xingNian).toEqual({ can: "Tân", chi: "Mùi", ageXuSui: 2 });
  });

  it("ageXuSui = 虛歲 (tuổi mụ): birthCycle === currentCycle → ageXuSui = 1 (năm sinh = tuổi 1, KHÔNG PHẢI 0)", () => {
    const { xingNian } = computeXingNian(30, 30, "male");
    expect(xingNian.ageXuSui).toBe(1);
  });

  it("provenanceId trỏ đúng 2 entry tách biệt (CLASSICAL FACT cho formula, PROJECT CONVENTION cho age)", () => {
    const { formulaProvenanceId, ageConventionProvenanceId } = computeXingNian(currentCycleForAge(1), BIRTH_CYCLE, "male");
    expect(formulaProvenanceId).toBe(XING_NIAN_FORMULA_PROVENANCE.id);
    expect(ageConventionProvenanceId).toBe(XING_NIAN_AGE_CONVENTION_PROVENANCE.id);
    expect(XING_NIAN_AGE_CONVENTION_PROVENANCE.confidence).not.toBe("A");
  });

  it("DETERMINISM: cùng input → cùng output", () => {
    const first = computeXingNian(currentCycleForAge(5), BIRTH_CYCLE, "male");
    const second = computeXingNian(currentCycleForAge(5), BIRTH_CYCLE, "male");
    expect(second).toEqual(first);
  });
});

describe("daliuren-engine/ben-ming-xing-nian/compute — tích hợp BenMing→XingNian (cùng 1 lượt chiêm thật)", () => {
  it("computeBenMing().cycleIndex dùng được TRỰC TIẾP làm birthCycleIndex cho computeXingNian() — không cần chuyển đổi", () => {
    const { cycleIndex: birthCycleIndex } = computeBenMing("1990-06-15", TZ);
    // Giả lập "hiện tại" = đúng năm sinh (tuổi 1) để kiểm tra đường nối 2 hàm hoạt động đúng.
    const { xingNian } = computeXingNian(birthCycleIndex, birthCycleIndex, "male");
    expect(xingNian).toEqual({ can: "Bính", chi: "Dần", ageXuSui: 1 });
  });
});
