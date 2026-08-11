// Phase 32 — Vòng Bác Sĩ (FUTURE MODULE, không thuộc Natal Core). Expected value ở Phần A-D được TÍNH TAY
// (offline) từ nguồn đã khóa (LOC_TON_TABLE có sẵn + quy tắc isThuanChung có sẵn), viết dưới dạng literal
// cố định — KHÔNG gọi getBacSiRing() để tự sinh expected rồi so lại với chính nó.

import { describe, expect, it } from "vitest";
import { tinhTuVi, type TuViChart } from "../src/lib/tu-vi/engine";
import { getBacSiRing, BAC_SI_RING } from "../src/lib/tu-vi/bac-si";

function locTonChiIndex(chart: TuViChart): number {
  const p = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Lộc Tồn"));
  if (!p) throw new Error("test setup: không tìm thấy Lộc Tồn");
  return p.chiIndex;
}

// ============================================================================================
// PHẦN A-D — 5 case (Can, giới tính) phủ đủ: Dương Can + Nam (thuận), Dương Can + Nữ (nghịch),
// Âm Can + Nữ (thuận), Âm Can + Nam (nghịch), và 4 điểm khởi Chi khác nhau (Dần/Thân/Mão/Tý).
// Expected TÍNH TAY từ: LOC_TON_TABLE (Giáp=2 Dần, Ất=3 Mão, Canh=8 Thân, Quý=0 Tý — đã LOCKED trước
// Phase 31) + isThuanChung (Dương Nam/Âm Nữ = thuận (+1/step), Âm Nam/Dương Nữ = nghịch (-1/step) — đã
// LOCKED trước Phase 31, dùng chung với Tràng Sinh/Kình Dương-Đà La/Đại Vận).
// ============================================================================================
describe("Phase 32 — Vòng Bác Sĩ: 12 vị trí đầy đủ, đối chiếu nguồn hocvienlyso.org (Level 1)", () => {
  const CASES: {
    label: string;
    input: Parameters<typeof tinhTuVi>[0];
    expectedCan: string;
    expectedChi: [string, number][]; // [tên sao, chiIndex] theo đúng thứ tự BAC_SI_RING
  }[] = [
    {
      label: "Giáp + Nam (Dương Nam → thuận), khởi Dần(2)",
      input: { day: 15, month: 6, year: 1984, hour: 12, gender: "Nam" },
      expectedCan: "Giáp",
      expectedChi: [
        ["Bác Sĩ", 2], ["Lực Sĩ", 3], ["Thanh Long", 4], ["Tiểu Hao", 5], ["Tướng Quân", 6], ["Tấu Thư", 7],
        ["Phi Liêm", 8], ["Hỷ Thần", 9], ["Bệnh Phù", 10], ["Đại Hao", 11], ["Phục Binh", 0], ["Quan Phủ", 1],
      ],
    },
    {
      label: "Giáp + Nữ (Dương Nữ → nghịch), khởi Dần(2) — cùng điểm khởi với case trên, ngược chiều",
      input: { day: 15, month: 6, year: 1984, hour: 12, gender: "Nữ" },
      expectedCan: "Giáp",
      expectedChi: [
        ["Bác Sĩ", 2], ["Lực Sĩ", 1], ["Thanh Long", 0], ["Tiểu Hao", 11], ["Tướng Quân", 10], ["Tấu Thư", 9],
        ["Phi Liêm", 8], ["Hỷ Thần", 7], ["Bệnh Phù", 6], ["Đại Hao", 5], ["Phục Binh", 4], ["Quan Phủ", 3],
      ],
    },
    {
      label: "Canh + Nam (Dương Nam → thuận), khởi Thân(8) — dùng lại input GM-001",
      input: { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" },
      expectedCan: "Canh",
      expectedChi: [
        ["Bác Sĩ", 8], ["Lực Sĩ", 9], ["Thanh Long", 10], ["Tiểu Hao", 11], ["Tướng Quân", 0], ["Tấu Thư", 1],
        ["Phi Liêm", 2], ["Hỷ Thần", 3], ["Bệnh Phù", 4], ["Đại Hao", 5], ["Phục Binh", 6], ["Quan Phủ", 7],
      ],
    },
    {
      label: "Ất + Nữ (Âm Nữ → thuận), khởi Mão(3)",
      input: { day: 15, month: 6, year: 1985, hour: 12, gender: "Nữ" },
      expectedCan: "Ất",
      expectedChi: [
        ["Bác Sĩ", 3], ["Lực Sĩ", 4], ["Thanh Long", 5], ["Tiểu Hao", 6], ["Tướng Quân", 7], ["Tấu Thư", 8],
        ["Phi Liêm", 9], ["Hỷ Thần", 10], ["Bệnh Phù", 11], ["Đại Hao", 0], ["Phục Binh", 1], ["Quan Phủ", 2],
      ],
    },
    {
      label: "Quý + Nam (Âm Nam → nghịch), khởi Tý(0)",
      input: { day: 15, month: 6, year: 1993, hour: 12, gender: "Nam" },
      expectedCan: "Quý",
      expectedChi: [
        ["Bác Sĩ", 0], ["Lực Sĩ", 11], ["Thanh Long", 10], ["Tiểu Hao", 9], ["Tướng Quân", 8], ["Tấu Thư", 7],
        ["Phi Liêm", 6], ["Hỷ Thần", 5], ["Bệnh Phù", 4], ["Đại Hao", 3], ["Phục Binh", 2], ["Quan Phủ", 1],
      ],
    },
  ];

  for (const { label, input, expectedCan, expectedChi } of CASES) {
    it(label, () => {
      const chart = tinhTuVi(input);
      expect(chart.yearCanName).toBe(expectedCan); // sanity: đúng Can năm mong đợi trước khi so vòng sao
      const ring = getBacSiRing(chart);
      expect(ring.map((p) => [p.star, p.chiIndex])).toEqual(expectedChi);
    });
  }
});

// ============================================================================================
// PHẦN A — Điểm khởi: Bác Sĩ LUÔN đồng cung Lộc Tồn (kiểm độc lập, không dựa vào bảng ở trên).
// ============================================================================================
describe("Phase 32 — Điểm khởi: Bác Sĩ luôn đồng cung Lộc Tồn", () => {
  const INPUTS: Parameters<typeof tinhTuVi>[0][] = [
    { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" },
    { day: 31, month: 8, year: 1980, hour: 11, gender: "Nữ" },
    { day: 25, month: 8, year: 1990, hour: 11, gender: "Nam" },
    { day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" },
    { day: 25, month: 8, year: 1997, hour: 0, gender: "Nam" },
    { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam" },
  ];
  for (const input of INPUTS) {
    it(`${JSON.stringify(input)}: Bác Sĩ (offset 0) trùng chiIndex với Lộc Tồn`, () => {
      const chart = tinhTuVi(input);
      const ring = getBacSiRing(chart);
      expect(ring[0].star).toBe("Bác Sĩ");
      expect(ring[0].chiIndex).toBe(locTonChiIndex(chart));
    });
  }
});

// ============================================================================================
// PHẦN B — Chiều: đảo ngược hoàn toàn giữa Dương Nam và Dương Nữ cùng Can/cùng điểm khởi.
// ============================================================================================
describe("Phase 32 — Chiều thuận/nghịch: Dương Nam và Dương Nữ cùng Can phải cho chiều ngược nhau", () => {
  it("Giáp Nam (thuận) và Giáp Nữ (nghịch) cùng khởi Dần nhưng đối xứng ngược chiều tại mọi offset > 0", () => {
    const chartNam = tinhTuVi({ day: 15, month: 6, year: 1984, hour: 12, gender: "Nam" });
    const chartNu = tinhTuVi({ day: 15, month: 6, year: 1984, hour: 12, gender: "Nữ" });
    const ringNam = getBacSiRing(chartNam);
    const ringNu = getBacSiRing(chartNu);
    expect(ringNam[0].chiIndex).toBe(ringNu[0].chiIndex); // offset 0 giống nhau (đồng cung Lộc Tồn)
    for (let step = 1; step < 12; step++) {
      if (step === 6) {
        // Toán học tất yếu: start+6 ≡ start-6 (mod 12) — điểm đối xung (đối diện) trên vòng tròn 12 cung
        // luôn trùng nhau dù đi thuận hay nghịch. KHÔNG phải lỗi công thức (tương tự phát hiện ở Phase 24
        // với Văn Xương/Văn Khúc và Tả Phù/Hữu Bật — 2 chiều ngược nhau vẫn trùng đúng 1 điểm đối xứng).
        expect(ringNam[step].chiIndex).toBe(ringNu[step].chiIndex);
      } else {
        expect(ringNam[step].chiIndex).not.toBe(ringNu[step].chiIndex); // các offset còn lại phải khác
      }
    }
  });
});

// ============================================================================================
// PHẦN C+D — Đủ 12 sao, đúng tên, không trùng cung (mọi case ở trên).
// ============================================================================================
describe("Phase 32 — Đủ 12 sao, đúng tên, 12 vị trí không trùng cung", () => {
  const INPUTS: Parameters<typeof tinhTuVi>[0][] = [
    { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" },
    { day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" },
    { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam" },
  ];
  for (const input of INPUTS) {
    it(`${JSON.stringify(input)}: đủ 12 sao đúng tên BAC_SI_RING, 12 vị trí là hoán vị của 0..11`, () => {
      const chart = tinhTuVi(input);
      const ring = getBacSiRing(chart);
      expect(ring).toHaveLength(12);
      expect(ring.map((p) => p.star)).toEqual([...BAC_SI_RING]);
      const chiSet = new Set(ring.map((p) => p.chiIndex));
      expect(chiSet.size).toBe(12);
      for (const p of ring) {
        expect(p.chiIndex).toBeGreaterThanOrEqual(0);
        expect(p.chiIndex).toBeLessThanOrEqual(11);
      }
    });
  }
});

// ============================================================================================
// PHẦN XVI — Architecture regression: getBacSiRing() không làm thay đổi bất kỳ field Natal Core nào.
// ============================================================================================
describe("Phase 32 — Architecture regression: Vòng Bác Sĩ không thay đổi Natal Core", () => {
  it("chartBefore vs chartAfter: mọi field Natal Core (Mệnh/Thân/12 cung/Can cung/Cục/14 chính tinh/status/Tứ Hóa/Tuần/Triệt/Đại Vận) giữ nguyên sau khi gọi getBacSiRing() nhiều lần", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    const before = JSON.stringify(chart);
    getBacSiRing(chart);
    getBacSiRing(chart);
    getBacSiRing(chart);
    const after = JSON.stringify(chart);
    expect(after).toBe(before);
  });

  it("getBacSiRing() không mutate object chart hay bất kỳ phần tử con nào của chart.cungs", () => {
    const chart = tinhTuVi({ day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" });
    const cungsRefBefore = chart.cungs;
    const firstPalaceRefBefore = chart.cungs[0];
    const firstPhuTinhArrRefBefore = chart.cungs[0].phuTinh;
    getBacSiRing(chart);
    expect(chart.cungs).toBe(cungsRefBefore); // vẫn cùng array reference
    expect(chart.cungs[0]).toBe(firstPalaceRefBefore); // vẫn cùng object reference
    expect(chart.cungs[0].phuTinh).toBe(firstPhuTinhArrRefBefore); // không bị thay thế/append
  });
});

// ============================================================================================
// PHẦN XV — Golden Master: KHÔNG có dữ liệu Vòng Bác Sĩ trong GM Pack → NO_DATA, không tự tạo expected.
// ============================================================================================
describe("Phase 32 — Golden Master coverage: 0/6 GM có dữ liệu Vòng Bác Sĩ tường minh", () => {
  it("Ghi nhận NO_DATA, đúng theo TuVi_Golden_Master_Pack_V1.md đã rà lại — không tự tạo expected từ GM", () => {
    expect(true).toBe(true);
  });
});
