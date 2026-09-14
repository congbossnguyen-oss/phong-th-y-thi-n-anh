// V3-07A HOTFIX REGRESSION — khóa hành vi "năm hiện tại theo Bát Tự" (ranh giới Lập Xuân, KHÔNG phải
// new Date().getFullYear()) cho 6 vị trí đã sửa (V307A_HOTFIX_SPEC.md). Dùng thời gian giả lập
// (vi.setSystemTime) — KHÔNG phụ thuộc ngày chạy test thật, đúng yêu cầu V307A_REGRESSION_IMPACT.md
// (trước hotfix: 0/9 vị trí có test bảo vệ khỏi lỗi ranh giới Lập Xuân).
//
// Lập Xuân 2026 rơi vào 04/02/2026 (giữa 02:30 và 12:00 giờ VN — xác nhận thực nghiệm ở V3-05/V3-06).
// Tết 2026 (Mùng 1 tháng Giêng âm lịch) là 17/02/2026 — SAU Lập Xuân năm nay, nên khoảng 04/02→16/02
// là khoảng "đã qua Lập Xuân nhưng dương lịch vẫn ghi 2026" — đúng ca đã dùng xuyên suốt V3-05/V3-06.
import { afterEach, describe, expect, it, vi } from "vitest";
import { namBatTuHienTai } from "../src/lib/bat-tu";
import { tinhVanKhi } from "../src/lib/quan-su/luan-van-khi/index";
import { taoBieuDoLuuNien } from "../src/lib/luan-giai-toan-dien/luu-nien-dai-van";
import { taoDuLieuDoHinhFree, taoGoiMoFree } from "../src/lib/luan-giai-toan-dien/free-template";
import { findingsJ } from "../src/lib/luan-giai-toan-dien/findings-co-ban";
import { laSoVaPhanTich } from "../src/lib/luan-giai-toan-dien/orchestrator";
import { tinhHopHon, type HopHonInput } from "../src/lib/hop-hon/index";

// Mốc giờ VN (UTC+7) quy đổi sẵn sang UTC cho vi.setSystemTime (Date luôn là 1 thời điểm UTC tuyệt đối).
const VN = {
  TRUOC_LAP_XUAN_2026: new Date("2026-01-20T05:00:00Z"), // 20/01/2026 12:00 VN — rõ ràng trước Lập Xuân
  DUNG_TRUOC_LAP_XUAN_2026: new Date("2026-02-03T19:00:00Z"), // 04/02/2026 02:00 VN — SÁT trước thời điểm Lập Xuân
  DUNG_SAU_LAP_XUAN_2026: new Date("2026-02-04T05:00:00Z"), // 04/02/2026 12:00 VN — SÁT sau thời điểm Lập Xuân
  SAU_LAP_XUAN_2026: new Date("2026-03-01T05:00:00Z"), // 01/03/2026 12:00 VN — rõ ràng sau Lập Xuân
  NAM_MOI_DUONG_LICH_2026: new Date("2025-12-31T17:00:00Z"), // 01/01/2026 00:00 VN — vừa qua Giao thừa dương lịch
  CUOI_2025_ON_DINH: new Date("2025-12-31T04:00:00Z"), // 31/12/2025 11:00 VN
};

afterEach(() => {
  vi.useRealTimers();
});

describe("namBatTuHienTai() — nguồn sự thật duy nhất cho cả 6 vị trí hotfix", () => {
  it("A. ngày thường (giữa năm) — khớp năm dương lịch", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T05:00:00Z"));
    expect(namBatTuHienTai()).toBe(2026);
  });

  it("B. trước Lập Xuân (20/01/2026) — vẫn là năm Bát Tự 2025, KHÔNG phải 2026", () => {
    vi.useFakeTimers();
    vi.setSystemTime(VN.TRUOC_LAP_XUAN_2026);
    expect(namBatTuHienTai()).toBe(2025);
  });

  it("C. đúng SÁT trước thời điểm Lập Xuân trong ngày 04/02/2026 — vẫn 2025", () => {
    vi.useFakeTimers();
    vi.setSystemTime(VN.DUNG_TRUOC_LAP_XUAN_2026);
    expect(namBatTuHienTai()).toBe(2025);
  });

  it("D. đúng SÁT sau thời điểm Lập Xuân, CÙNG NGÀY 04/02/2026 — đã sang 2026", () => {
    vi.useFakeTimers();
    vi.setSystemTime(VN.DUNG_SAU_LAP_XUAN_2026);
    expect(namBatTuHienTai()).toBe(2026);
  });

  it("E. sau Lập Xuân rõ ràng (01/03/2026) — 2026", () => {
    vi.useFakeTimers();
    vi.setSystemTime(VN.SAU_LAP_XUAN_2026);
    expect(namBatTuHienTai()).toBe(2026);
  });

  it("F. Giao thừa DƯƠNG LỊCH (đúng 00:00 01/01/2026 giờ VN) — VẪN LÀ 2025 (đúng bản chất Bát Tự, khác new Date().getFullYear() sẽ cho 2026)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(VN.NAM_MOI_DUONG_LICH_2026);
    expect(namBatTuHienTai()).toBe(2025);
    // Đối chứng: nếu dùng new Date().getFullYear() (bug đã sửa) sẽ SAI thành 2026 tại chính thời điểm này.
    expect(new Date().getFullYear()).toBe(2026);
  });
});

describe("1. tinhVanKhi() — src/lib/quan-su/luan-van-khi/index.ts", () => {
  const NGUOI = { day: 15, month: 6, year: 1990, hour: 10, gender: "Nam" as const };

  it("mặc định (không truyền nowYear) dưới thời gian giả lập trước Lập Xuân 2026 → khớp HỆT truyền tường minh nowYear=2025, KHÁC nowYear=2026", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(VN.TRUOC_LAP_XUAN_2026);
    const auto = await tinhVanKhi(NGUOI);
    vi.useRealTimers();

    const explicit2025 = await tinhVanKhi({ ...NGUOI, nowYear: 2025 });
    const explicit2026 = await tinhVanKhi({ ...NGUOI, nowYear: 2026 });

    expect(auto.chiTietDaiVanIndex).toBe(explicit2025.chiTietDaiVanIndex);
    expect(auto.danhSachDaiVan.map((d) => d.tongQuan)).toEqual(explicit2025.danhSachDaiVan.map((d) => d.tongQuan));
    // Chỉ so sánh khi 2025/2026 thực sự rơi khác Đại Vận (nếu cùng 1 Đại Vận thì 2 kết quả có thể trùng
    // — vẫn hợp lệ, không phải test sai; assertion dưới chỉ xác nhận auto KHÔNG lặng lẽ dùng 2026 sai).
    if (explicit2025.chiTietDaiVanIndex !== explicit2026.chiTietDaiVanIndex) {
      expect(auto.chiTietDaiVanIndex).not.toBe(explicit2026.chiTietDaiVanIndex);
    }
  });
});

describe("2. taoBieuDoLuuNien() — src/lib/luan-giai-toan-dien/luu-nien-dai-van.ts", () => {
  it("dưới thời gian giả lập trước Lập Xuân 2026, năm Lưu Niên đầu tiên phải là 2025, KHÔNG phải 2026", async () => {
    const { chart, tt } = laSoVaPhanTich({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    vi.useFakeTimers();
    vi.setSystemTime(VN.TRUOC_LAP_XUAN_2026);
    const ds = await taoBieuDoLuuNien(chart, tt, null, 1980);
    vi.useRealTimers();
    expect(ds[0]!.nhan).toBe("2025");
  });

  it("dưới thời gian giả lập SAU Lập Xuân 2026, năm Lưu Niên đầu tiên là 2026", async () => {
    const { chart, tt } = laSoVaPhanTich({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    vi.useFakeTimers();
    vi.setSystemTime(VN.SAU_LAP_XUAN_2026);
    const ds = await taoBieuDoLuuNien(chart, tt, null, 1980);
    vi.useRealTimers();
    expect(ds[0]!.nhan).toBe("2026");
  });
});

describe("3. taoDuLieuDoHinhFree()/taoGoiMoFree() — src/lib/luan-giai-toan-dien/free-template.ts", () => {
  const INPUT = { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" as const };

  it("taoDuLieuDoHinhFree: năm Lưu Niên đầu tiên đúng theo Bát Tự, không theo Gregorian, ở cả 2 phía biên Lập Xuân", () => {
    const { chart, analysis } = laSoVaPhanTich(INPUT);

    vi.useFakeTimers();
    vi.setSystemTime(VN.TRUOC_LAP_XUAN_2026);
    const truoc = taoDuLieuDoHinhFree(chart, analysis, 1980);
    vi.useRealTimers();
    expect(truoc.luuNien[0]!.year).toBe(2025);

    vi.useFakeTimers();
    vi.setSystemTime(VN.SAU_LAP_XUAN_2026);
    const sau = taoDuLieuDoHinhFree(chart, analysis, 1980);
    vi.useRealTimers();
    expect(sau.luuNien[0]!.year).toBe(2026);
  });

  it("taoGoiMoFree: chạy được dưới thời gian giả lập biên Lập Xuân, không throw, sinh câu văn hợp lệ (smoke test — hàm trả văn bản diễn giải, không phải danh sách năm để đối chiếu trực tiếp)", () => {
    const { chart, analysis } = laSoVaPhanTich(INPUT);
    vi.useFakeTimers();
    vi.setSystemTime(VN.TRUOC_LAP_XUAN_2026);
    const cauTruoc = taoGoiMoFree(chart, analysis);
    vi.useRealTimers();

    vi.useFakeTimers();
    vi.setSystemTime(VN.SAU_LAP_XUAN_2026);
    const cauSau = taoGoiMoFree(chart, analysis);
    vi.useRealTimers();

    expect(cauTruoc.length).toBeGreaterThan(20);
    expect(cauSau.length).toBeGreaterThan(20);
  });
});

describe("4. findingsJ() — src/lib/luan-giai-toan-dien/findings-co-ban.ts", () => {
  it("mặc định (không truyền namXem) dưới thời gian giả lập trước Lập Xuân 2026 → khớp HỆT truyền tường minh namXem=2025 (năm Lưu Niên đầu trong mucDoUuTien)", () => {
    const { chart, analysis } = laSoVaPhanTich({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });

    vi.useFakeTimers();
    vi.setSystemTime(VN.TRUOC_LAP_XUAN_2026);
    const auto = findingsJ(chart, analysis, undefined, 1980);
    vi.useRealTimers();

    const explicit2025 = findingsJ(chart, analysis, undefined, 1980, 2025);
    const explicit2026 = findingsJ(chart, analysis, undefined, 1980, 2026);

    const namLuuNien = (r: typeof auto) =>
      (r.ketQua.buKhuyet as { mucDoUuTien: { loai: string; namHoacTuoi: string }[] }).mucDoUuTien
        .filter((m) => m.loai === "LuuNien")
        .map((m) => m.namHoacTuoi);

    expect(namLuuNien(auto)).toEqual(namLuuNien(explicit2025));
    expect(namLuuNien(auto)).not.toEqual(namLuuNien(explicit2026));
    expect(namLuuNien(auto)[0]).toBe("2025");
  });
});

describe("5. tinhHopHon() — src/lib/hop-hon/index.ts", () => {
  const NGUOI_A = { day: 15, month: 6, year: 1990, hour: 10, gender: "Nam" as const };
  const NGUOI_B = { day: 20, month: 3, year: 1992, hour: 14, gender: "Nữ" as const };

  it("mặc định (không truyền namHienTai) dưới thời gian giả lập trước Lập Xuân 2026 → khớp HỆT truyền tường minh namHienTai=2025 (trục Đại Vận đồng bộ)", () => {
    const input: HopHonInput = { nguoiA: NGUOI_A, nguoiB: NGUOI_B };

    vi.useFakeTimers();
    vi.setSystemTime(VN.TRUOC_LAP_XUAN_2026);
    const auto = tinhHopHon(input);
    vi.useRealTimers();

    const explicit2025 = tinhHopHon({ ...input, namHienTai: 2025 });
    const explicit2026 = tinhHopHon({ ...input, namHienTai: 2026 });

    const trucDaiVan = (r: typeof auto) => r.cacTruc.find((t) => t.ma === "dai_van");

    expect(trucDaiVan(auto)).toEqual(trucDaiVan(explicit2025));
    if (JSON.stringify(trucDaiVan(explicit2025)) !== JSON.stringify(trucDaiVan(explicit2026))) {
      expect(trucDaiVan(auto)).not.toEqual(trucDaiVan(explicit2026));
    }
  });
});
