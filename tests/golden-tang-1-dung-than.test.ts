import { describe, it, expect } from "vitest";
import { tinhBatTu } from "../src/lib/bat-tu";
import { phanTichBatTu, type TuTruInput } from "../src/lib/bat-tu-engine/engine";

// GOLDEN Tầng 1 — KHÓA kết quả engine (phương pháp Dụng Thần + Dụng/Hỷ/Kỵ/Cứu + vượng suy + có Điều
// Hậu hay không) cho bộ lá số phủ đủ 4 phương pháp. Deterministic, KHÔNG gọi AI. Mỗi lần sửa engine
// (bat-tu-engine) hay dữ liệu ảnh hưởng Tầng 1, chạy bộ này TRƯỚC — số liệu lệch = báo động regression.
//
// Case chuẩn (anchor) đã kiểm chứng tay kỹ: "Hà" = Dần-Thân-Tỵ-Tuất (Thông Quan, Dụng Kim). Các case
// còn lại tìm bằng brute-force để phủ Phù Ức (thân nhược/vượng/trung hòa/cực nhược/cực cường),
// Thông Quan, Thuận Thế, và Điều Hậu (dieuHauNote xuất hiện).

interface KyVong {
  phuongPhap: string;
  dungThan: string;
  hyThan: string;
  kyThan: string;
  cuuThan: string;
  capDo: string;
  coDieuHau: boolean;
}
interface GoldenCase {
  ten: string;
  input: { year: number; month: number; day: number; hour: number; gender: "Nam" | "Nữ" };
  kyVong: KyVong;
}

// prettier-ignore
const BO_GOLDEN: GoldenCase[] = [
  { ten: "Hà (anchor) — Thông Quan, Dụng Kim", input: { year: 1998, month: 8, day: 14, hour: 20, gender: "Nữ" },
    kyVong: { phuongPhap: "Thông Quan", dungThan: "Kim", hyThan: "Thổ", kyThan: "Hỏa", cuuThan: "Mộc", capDo: "Trung hòa", coDieuHau: false } },
  { ten: "Thông Quan (no DH) — Canh Thân/Quý Mùi", input: { year: 1958, month: 9, day: 3, hour: 19, gender: "Nam" },
    kyVong: { phuongPhap: "Thông Quan", dungThan: "Kim", hyThan: "Thổ", kyThan: "Hỏa", cuuThan: "Mộc", capDo: "Trung hòa", coDieuHau: false } },
  { ten: "Thông Quan (DH) — Nhâm Thìn/Quý Hợi", input: { year: 1958, month: 11, day: 11, hour: 1, gender: "Nam" },
    kyVong: { phuongPhap: "Thông Quan", dungThan: "Kim", hyThan: "Thổ", kyThan: "Hỏa", cuuThan: "Mộc", capDo: "Trung hòa", coDieuHau: true } },
  { ten: "Phù Ức thân Nhược (no DH) — Ất Mùi", input: { year: 1958, month: 3, day: 19, hour: 19, gender: "Nam" },
    kyVong: { phuongPhap: "Phù Ức", dungThan: "Mộc", hyThan: "Thủy", kyThan: "Kim", cuuThan: "Thổ", capDo: "Nhược", coDieuHau: false } },
  { ten: "Phù Ức thân Vượng (no DH) — Kỷ Mùi", input: { year: 1958, month: 2, day: 11, hour: 1, gender: "Nam" },
    kyVong: { phuongPhap: "Phù Ức", dungThan: "Kim", hyThan: "Thổ", kyThan: "Hỏa", cuuThan: "Mộc", capDo: "Vượng", coDieuHau: false } },
  { ten: "Phù Ức Trung hòa (no DH) — Đinh Mão", input: { year: 1958, month: 2, day: 19, hour: 1, gender: "Nam" },
    kyVong: { phuongPhap: "Phù Ức", dungThan: "Thổ", hyThan: "Hỏa", kyThan: "Mộc", cuuThan: "Thủy", capDo: "Trung hòa", coDieuHau: false } },
  { ten: "Phù Ức Cực nhược (no DH) — Quý Mão", input: { year: 1958, month: 3, day: 27, hour: 7, gender: "Nam" },
    kyVong: { phuongPhap: "Phù Ức", dungThan: "Kim", hyThan: "Thổ", kyThan: "Hỏa", cuuThan: "Mộc", capDo: "Cực nhược", coDieuHau: false } },
  { ten: "Phù Ức Cực cường (no DH) — Mậu Ngọ", input: { year: 1958, month: 4, day: 11, hour: 7, gender: "Nam" },
    kyVong: { phuongPhap: "Phù Ức", dungThan: "Kim", hyThan: "Thổ", kyThan: "Hỏa", cuuThan: "Mộc", capDo: "Cực cường", coDieuHau: false } },
  { ten: "Phù Ức thân Nhược (DH) — Canh Thìn mùa Đông", input: { year: 1958, month: 1, day: 3, hour: 13, gender: "Nam" },
    kyVong: { phuongPhap: "Phù Ức", dungThan: "Thổ", hyThan: "Hỏa", kyThan: "Mộc", cuuThan: "Thủy", capDo: "Nhược", coDieuHau: true } },
  { ten: "Phù Ức Cực cường (DH) — Mậu Tý mùa Hè", input: { year: 1958, month: 5, day: 11, hour: 7, gender: "Nam" },
    kyVong: { phuongPhap: "Phù Ức", dungThan: "Mộc", hyThan: "Thủy", kyThan: "Hỏa", cuuThan: "Thổ", capDo: "Cực cường", coDieuHau: true } },
  { ten: "Thuận Thế (no DH) — Quý Mão cực nhược", input: { year: 1958, month: 3, day: 27, hour: 13, gender: "Nam" },
    kyVong: { phuongPhap: "Thuận Thế", dungThan: "Thổ", hyThan: "Hỏa", kyThan: "Thủy", cuuThan: "Kim", capDo: "Cực nhược", coDieuHau: false } },
  { ten: "Thuận Thế (DH) — Ất Tỵ cực nhược mùa Hè", input: { year: 1958, month: 7, day: 27, hour: 19, gender: "Nữ" },
    kyVong: { phuongPhap: "Thuận Thế", dungThan: "Thổ", hyThan: "Hỏa", kyThan: "Mộc", cuuThan: "Thủy", capDo: "Cực nhược", coDieuHau: true } },
];

function chuKy(input: GoldenCase["input"]): KyVong {
  const chart = tinhBatTu(input);
  const tt: TuTruInput = {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    gioiTinh: input.gender,
  };
  const a = phanTichBatTu(tt);
  const dt = a.dungThan;
  return {
    phuongPhap: dt.phuongPhap,
    dungThan: dt.dungThan,
    hyThan: dt.hyThan,
    kyThan: dt.kyThan,
    cuuThan: dt.cuuThan,
    capDo: a.vuongSuy.capDo,
    coDieuHau: !!dt.dieuHauNote,
  };
}

describe("GOLDEN Tầng 1 — khóa phương pháp + Dụng/Hỷ/Kỵ/Cứu Thần", () => {
  for (const c of BO_GOLDEN) {
    it(c.ten, () => {
      expect(chuKy(c.input)).toEqual(c.kyVong);
    });
  }

  it("bộ golden phủ đủ 4 phương pháp (Phù Ức, Thông Quan, Thuận Thế) + có case Điều Hậu", () => {
    const pps = new Set(BO_GOLDEN.map((c) => c.kyVong.phuongPhap));
    expect(pps.has("Phù Ức")).toBe(true);
    expect(pps.has("Thông Quan")).toBe(true);
    expect(pps.has("Thuận Thế")).toBe(true);
    expect(BO_GOLDEN.some((c) => c.kyVong.coDieuHau)).toBe(true);
    expect(BO_GOLDEN.length).toBeGreaterThanOrEqual(10);
  });
});
