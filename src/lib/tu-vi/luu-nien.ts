// FUTURE MODULE — SAO LƯU NIÊN (Phase 44). An lại một số sao theo Can/Chi của NĂM ĐANG XEM (không phải
// năm sinh) — khác bản chất với toàn bộ Natal Core. Công thức do Công cung cấp trực tiếp (nguồn: Học Viện
// Lý Số), NHƯNG bảng ví dụ kiểm thử đi kèm bị lỗi nội bộ (cột Lưu Tang Môn và Lưu Bạch Hổ giống hệt nhau ở
// TẤT CẢ 10 dòng, trong khi định nghĩa lại nói Bạch Hổ là "đối cung" của Tang Môn — 2 cung đối nhau không
// thể trùng giá trị) — nên KHÔNG dùng bảng ví dụ đó để đối chiếu. Thay vào đó, mọi công thức bên dưới đều
// TÁI DÙNG NGUYÊN VẸN các hàm/bảng đã LOCKED cho Natal Core (rules.ts/tap-dieu.ts) — chỉ đổi tham số đầu
// vào từ Can/Chi năm SINH sang Can/Chi năm XEM:
//   - Lưu Thái Tuế/Tang Môn/Bạch Hổ: dùng đúng vòng THAI_TUE_STAGES đã khóa (Thái Tuế=+0, Tang Môn=+2,
//     Bạch Hổ=+8, luôn thuận) — khớp với chính mô tả công thức Công đưa ("Tang Môn thuận 2 cung từ Thái
//     Tuế", "Bạch Hổ đối cung Tang Môn": +2 và +8 cách nhau đúng 6 = đối cung, tự nhất quán).
//   - Lưu Thiên Khốc/Thiên Hư: dùng đúng thienKhocIndex()/thienHuIndex() đã khóa (tap-dieu.ts).
//   - Lưu Lộc Tồn: dùng đúng LOC_TON_TABLE đã khóa — đối chiếu khớp NGUYÊN VĂN 10/10 Can với bảng Công đưa.
//   - Lưu Kình Dương/Đà La: theo đúng mô tả Công đưa (+1 thuận / -1 nghịch từ Lộc Tồn, KHÔNG phụ thuộc
//     giới tính) — khác với Kình/Đà natal (vốn đảo chiều theo Dương Nam/Âm Nữ), vì đây là quy tắc Lưu
//     riêng do Công cung cấp, không suy diễn từ natal.
//   - Lưu Thiên Mã: dùng đúng THIEN_MA_START[tamHopGroup] đã khóa.
//   - Lưu Đào Hoa/Hồng Loan/Cô Thần/Quả Tú (mở rộng, tùy chọn): dùng đúng công thức Chi-năm đã khóa cho
//     bản Natal (DAO_HOA_START/hongLoanIndex/CO_THAN_BY_CHI/QUA_TU_BY_CHI), đổi input sang Chi năm xem.
//
// Lưu Hà KHÔNG nằm trong module này — Công tự ghi rõ "không phải sao Lưu niên lõi". Bản Lưu Hà (theo Can,
// GM-verified qua 10 lá số thật) đã có sẵn trong tap-dieu.ts, không đụng vào ở đây.
// Lưu Văn Xương/Văn Khúc: theo đúng ghi chú Công — KHÔNG an.

import { mod12, tamHopGroup, LOC_TON_TABLE, THIEN_MA_START, THAI_TUE_STAGES, DAO_HOA_START, hongLoanIndex, TU_HOA_TABLE } from "./rules";
import { thienKhocIndex, thienHuIndex, CO_THAN_BY_CHI, QUA_TU_BY_CHI } from "./tap-dieu";
import { CAN, CHI } from "../menh-nap-am";
import type { TuViChart } from "./engine";

export interface LuuNienPlacement {
  chiIndex: number;
  name: string;
}

// 9 sao lõi, theo đúng đặc tả Công cung cấp.
export function getLuuNienCore(viewYearCanName: string, viewYearChiIndex: number): LuuNienPlacement[] {
  const locTon = LOC_TON_TABLE[viewYearCanName];
  const group = tamHopGroup(viewYearChiIndex);
  return [
    { chiIndex: mod12(viewYearChiIndex + 0), name: "Thái Tuế" }, // THAI_TUE_STAGES[0]
    { chiIndex: mod12(viewYearChiIndex + 2), name: "Tang Môn" }, // THAI_TUE_STAGES[2]
    { chiIndex: mod12(viewYearChiIndex + 8), name: "Bạch Hổ" }, // THAI_TUE_STAGES[8], đối cung Tang Môn
    { chiIndex: thienKhocIndex(viewYearChiIndex), name: "Thiên Khốc" },
    { chiIndex: thienHuIndex(viewYearChiIndex), name: "Thiên Hư" },
    { chiIndex: locTon, name: "Lộc Tồn" },
    { chiIndex: mod12(locTon + 1), name: "Kình Dương" },
    { chiIndex: mod12(locTon - 1), name: "Đà La" },
    { chiIndex: THIEN_MA_START[group], name: "Thiên Mã" },
  ];
}

// 4 sao mở rộng (tùy chọn), theo đúng ghi chú Công: "cũng an theo Địa Chi năm".
export function getLuuNienExtended(viewYearChiIndex: number): LuuNienPlacement[] {
  const viewYearChiName = CHI[viewYearChiIndex];
  return [
    { chiIndex: DAO_HOA_START[tamHopGroup(viewYearChiIndex)], name: "Đào Hoa" },
    { chiIndex: hongLoanIndex(viewYearChiIndex), name: "Hồng Loan" },
    { chiIndex: CO_THAN_BY_CHI[viewYearChiName], name: "Cô Thần" },
    { chiIndex: QUA_TU_BY_CHI[viewYearChiName], name: "Quả Tú" },
  ];
}

// ============================================================================================
// LƯU TỨ HÓA (L.Hóa Lộc / L.Hóa Quyền / L.Hóa Khoa / L.Hóa Kỵ) — độc lập với Tứ Hóa NGUYÊN CỤC.
//
// Cơ chế (Công cung cấp 2026-08): dùng Thiên Can của NĂM LƯU NIÊN (không phải năm sinh) → tra sao được
// Hóa → tìm sao đó trên NATAL chart → đặt L.Hóa tại chính cung natal chứa sao gốc. KHÔNG đổi vị trí sao
// gốc, KHÔNG ghi đè Tứ Hóa nguyên cục (2 record riêng, có thể cùng cung).
//
// ⚠️ Dùng chung `TU_HOA_TABLE` (rules.ts) — đã đối chiếu khớp 100% bảng Lưu Tứ Hóa Công đưa, nên KHÔNG
// tạo bảng thứ hai (tránh trộn 2 hệ phái).
// ============================================================================================

function mod10(n: number): number { return ((n % 10) + 10) % 10; }

/** Thiên Can của một năm dương lịch theo lịch Can Chi (năm 4 = Giáp Tý). 2026 → Bính. */
export function canOfYear(year: number): string {
  return CAN[mod10(year - 4)];
}

export interface LuuTuHoa {
  can: string;
  hoaLoc: string;
  hoaQuyen: string;
  hoaKhoa: string;
  hoaKy: string;
}

/** Tra 4 sao Lưu Tứ Hóa theo Can của năm lưu niên (KHÔNG phụ thuộc lá số). */
export function getLuuTuHoa(year: number): LuuTuHoa {
  const can = canOfYear(year);
  const t = TU_HOA_TABLE[can];
  if (!t) throw new Error("RULE_NOT_DEFINED: getLuuTuHoa — Can năm lưu niên không hợp lệ: " + can);
  return { can, hoaLoc: t.loc, hoaQuyen: t.quyen, hoaKhoa: t.khoa, hoaKy: t.ky };
}

/** Tìm chiIndex của MỘT sao trên NATAL chart (chính tinh hoặc phụ tinh). null nếu không có mặt. */
export function findNatalStarChiIndex(chart: TuViChart, starName: string): number | null {
  for (const c of chart.cungs) {
    if (c.chinhTinh.some((s) => s.name === starName) || c.phuTinh.some((s) => s.name === starName)) return c.chiIndex;
  }
  return null;
}

/**
 * Đặt 4 Lưu Tứ Hóa vào đúng cung NATAL chứa sao gốc tương ứng. Trả `LuuNienPlacement[]` (đọc-only,
 * KHÔNG mutate `chart`). Sao gốc không có mặt trên lá số thì bỏ qua (không ném lỗi).
 */
export function applyLuuTuHoa(chart: TuViChart, year: number): LuuNienPlacement[] {
  const th = getLuuTuHoa(year);
  const out: LuuNienPlacement[] = [];
  const push = (starName: string, luuName: string) => {
    const idx = findNatalStarChiIndex(chart, starName);
    if (idx !== null) out.push({ chiIndex: idx, name: luuName });
  };
  push(th.hoaLoc, "L.Hóa Lộc");
  push(th.hoaQuyen, "L.Hóa Quyền");
  push(th.hoaKhoa, "L.Hóa Khoa");
  push(th.hoaKy, "L.Hóa Kỵ");
  return out;
}
