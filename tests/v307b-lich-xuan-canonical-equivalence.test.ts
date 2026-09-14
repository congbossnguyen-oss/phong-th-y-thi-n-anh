// V3-07B — PHASE A: LẬP XUÂN CANONICAL EQUIVALENCE.
//
// Chính thức hóa thành test tự động phát hiện V3-06 Track 2 (1000/1000 khớp): 2 implementation Lập
// Xuân ĐỘC LẬP trong repo cho kết quả GIỐNG HỆT:
//   - CANONICAL: calendar-core (qua resolveYearContext GANZHI_LICH_XUAN → getGanzhiYear{lichXuan}).
//   - SECONDARY: src/lib/bat-tu.ts::namBatTuCuaNgay (tự cài findLapXuanJD, hard-code +7).
//
// Mục đích: KHÓA sự tương đương này lại. Nếu tương lai hợp nhất (Phase G) hay sửa 1 trong 2 bản làm
// chúng lệch nhau, test này FAIL ngay — bảo vệ quyết định "calendar-core là nguồn canonical".
//
// KHÔNG xóa bản secondary trong phase này (còn nhiều caller Bát Tự/Tử Vi hợp pháp) — chỉ chứng minh
// tương đương + tài liệu hóa hướng deprecate (xem reports/V307B_TRACH_NHAT_MIGRATION.md).
import { describe, expect, it } from "vitest";
import { birthDateFromGregorian, resolveYearContext } from "@thien-anh/calendar-core";
import { namBatTuCuaNgay } from "../src/lib/bat-tu";

const TZ = "Asia/Ho_Chi_Minh";

describe("Lập Xuân: calendar-core (canonical) === bat-tu.ts (secondary) trên miền biên rộng", () => {
  it("khớp 100% năm Bát Tự cho mọi ngày Jan/Feb × nhiều giờ, 10 năm mẫu (không lệch 1 ca)", () => {
    const years = [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024, 2025, 2026];
    let total = 0;
    let mismatch = 0;
    const examples: string[] = [];
    for (const y of years) {
      for (let m = 1; m <= 2; m++) {
        for (let d = 1; d <= 28; d += 3) {
          for (const hour of [0, 6, 12, 18, 23]) {
            total++;
            const canonical = resolveYearContext(
              birthDateFromGregorian({ year: y, month: m, day: d, hour, timeZone: TZ }),
              "GANZHI_LICH_XUAN",
            ).year;
            const secondary = namBatTuCuaNgay(d, m, y, hour);
            if (canonical !== secondary) {
              mismatch++;
              if (examples.length < 5) examples.push(`${y}-${m}-${d} h${hour}: canonical=${canonical} secondary=${secondary}`);
            }
          }
        }
      }
    }
    expect(total).toBeGreaterThan(900);
    expect({ mismatch, examples }).toEqual({ mismatch: 0, examples: [] });
  });
});
