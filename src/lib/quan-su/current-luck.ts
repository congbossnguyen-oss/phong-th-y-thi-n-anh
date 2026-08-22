// QUÂN SƯ THIÊN ANH — Engine "Vận Trình Hiện Tại" (Current Luck).
//
// VAI TRÒ (khác Kinh Dịch): Kinh Dịch trả lời "SỰ VIỆC này thế nào?"; engine này chỉ trả lời
// "NGƯỜI này hiện đang ở vận thế nào?" — lớp CONTEXT bổ trợ, KHÔNG luận chính từng câu hỏi.
//
// ⚠️ TÁI DÙNG engine có sẵn, KHÔNG viết lại:
//   - Bát Tự: tinhBatTu (lá số + đại vận), tinhLuuNien, thapThanOf, CAN_NGU_HANH (bat-tu.ts)
//             + phanTichBatTu (Vượng Suy + Dụng/Hỷ/Kỵ/Cừu Thần) (bat-tu-engine/engine.ts)
//   - Tử Vi:  tinhTuVi (lớp phụ, chỉ lấy cung đại vận hiện tại + sao chính) (tu-vi/engine.ts)
//
// ⚠️ BẢN NHÁP: cách quy đại vận → 4 thanh chỉ số (Sự nghiệp/Tài chính/Cơ hội/Biến động) là 1 công
// thức MINH BẠCH, ĐƠN GIẢN để Thầy đọc và hiệu chỉnh — gắn cờ `coNhap: true` (giống module nghề
// nghiệp `module-ket-hop.ts`). Phần "vận tốt hay xấu" (danhGia) dựa trên Dụng Thần đã được engine
// bat-tu-engine tính (không bịa). Phần nhấn mạnh dimension theo Thập Thần là heuristic cần calibrate.

import { CAN_NGU_HANH, tinhBatTu, tinhLuuNien, thapThanOf, type BatTuChart } from "../bat-tu";
import { phanTichBatTu, type Hanh, type TuTruInput } from "../bat-tu-engine/engine";
import { tinhTuVi } from "../tu-vi/engine";
import type { NguHanh } from "../menh-nap-am";

export interface LuckInput {
  day: number;
  month: number;
  year: number;
  gender: "Nam" | "Nữ";
  hour?: number; // giờ sinh (0-23) — không có thì dùng 12 (giữa trưa) và gắn cờ gioSinhKnown=false
  nowYear?: number; // năm hiện tại để tính tuổi + lưu niên (mặc định năm hệ thống)
}

export type DanhGia = "tot" | "binh_thuong" | "xau";

export interface LuckDimension {
  key: "su-nghiep" | "tai-chinh" | "co-hoi" | "bien-dong";
  label: string;
  score: number; // 0-10 (số nguyên) để vẽ thanh
  /** Với "bien-dong": điểm CÀNG CAO = càng nhiều xáo trộn/cần thận trọng (KHÁC 3 thanh kia: cao = tốt). */
  higherIsBetter: boolean;
}

export interface LuckContext {
  nguon: "bat-tu"; // nguồn CHÍNH của điểm số (Tử Vi chỉ là context phụ)
  tuoiHienTai: number; // tuổi mụ = nowYear - namSinh + 1
  gioSinhKnown: boolean;

  daiVanHienTai: {
    tuoiBatDau: number;
    tuoiKetThuc: number;
    can: string;
    chi: string;
    thapThan: string;
    danhGia: DanhGia;
  };
  luuNienHienTai: {
    nam: number;
    can: string;
    chi: string;
    thapThan: string;
    danhGia: DanhGia;
  };
  dungThan: { dungThan: Hanh; hyThan: Hanh; kyThan: Hanh; cuuThan: Hanh; capDo: string; phuongPhap: string };

  dimensions: LuckDimension[]; // 4 thanh cho card "VẬN TRÌNH HIỆN TẠI"

  /** Dòng thời gian đại vận (mỗi giai đoạn gắn nhãn) — dùng cho biểu đồ timeline nếu cần. */
  timeline: { tuoiBatDau: number; tuoiKetThuc: number; nhan: string; danhGia: DanhGia; laHienTai: boolean }[];

  /** Lớp Tử Vi phụ (chỉ khi có giờ sinh) — cung đại vận hiện tại + sao chính. null nếu không chạy được. */
  tuVi: { daiVanCung: string; chinhTinh: string[]; ghiChu: string } | null;

  /** Lý do deterministic cho điểm số (để minh bạch, và cho LLM viết lại thành lời thường). */
  signals: string[];
  /** 2-4 dòng tóm tắt sẵn (deterministic) — LLM có thể viết lại theo giọng "quân sư đồng hành". */
  tomTat: string[];

  /** BẢN NHÁP — công thức dimension chưa hiệu chỉnh trên dữ liệu thật. Thầy cần calibrate. */
  coNhap: true;
}

// ---------------------------------------------------------------------------------------------
// Nhóm Thập Thần (để nhấn mạnh dimension).
const QUAN_SAT = new Set(["Chính Quan", "Thất Sát"]);
const TAI = new Set(["Chính Tài", "Thiên Tài"]);
const THUC_THUONG = new Set(["Thực Thần", "Thương Quan"]);
const AN = new Set(["Chính Ấn", "Thiên Ấn"]);
const KIEP_THUONG = new Set(["Kiếp Tài", "Thương Quan"]); // dễ gây biến động (cạnh tranh/hao/nghịch)

const LUC_XUNG_CHI: [number, number][] = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];
function chiXung(a: number, b: number): boolean {
  return LUC_XUNG_CHI.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

const clamp10 = (x: number) => Math.max(0, Math.min(10, Math.round(x)));

/** Độ thuận của 1 hành so với Dụng Thần: +2 Dụng, +1 Hỷ, -2 Kỵ, -1 Cừu, 0 trung. */
function favOf(element: NguHanh, dt: { dungThan: Hanh; hyThan: Hanh; kyThan: Hanh; cuuThan: Hanh }): number {
  if (element === dt.dungThan) return 2;
  if (element === dt.hyThan) return 1;
  if (element === dt.kyThan) return -2;
  if (element === dt.cuuThan) return -1;
  return 0;
}
function danhGiaOf(fav: number): DanhGia {
  return fav >= 1 ? "tot" : fav <= -1 ? "xau" : "binh_thuong";
}

// ---------------------------------------------------------------------------------------------

/**
 * Trích Vận Trình Hiện Tại của 1 người. CHỈ đọc/gom dữ liệu từ engine có sẵn — không luận sự việc.
 */
export function tinhVanTrinhHienTai(input: LuckInput): LuckContext {
  const nowYear = input.nowYear ?? new Date().getFullYear();
  const gioSinhKnown = typeof input.hour === "number";
  const hour = input.hour ?? 12;
  const tuoiMu = nowYear - input.year + 1;

  // 1) Lá số Bát Tự + đại vận (engine có sẵn).
  const chart: BatTuChart = tinhBatTu({ day: input.day, month: input.month, year: input.year, hour, gender: input.gender });
  const nhatChuIndex = chart.nhatChu.canIndex;

  // 2) Dụng/Hỷ/Kỵ/Cừu Thần (engine có sẵn).
  const tt: TuTruInput = {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    gioiTinh: input.gender,
  };
  const pt = phanTichBatTu(tt);
  const dt = { dungThan: pt.dungThan.dungThan, hyThan: pt.dungThan.hyThan, kyThan: pt.dungThan.kyThan, cuuThan: pt.dungThan.cuuThan };

  // 3) Đại vận hiện tại (giai đoạn chứa tuổi mụ; nếu trẻ hơn giai đoạn đầu → lấy giai đoạn đầu; già hơn → cuối).
  const dv =
    chart.daiVan.find((d) => tuoiMu >= d.startAge && tuoiMu <= d.endAge) ??
    (tuoiMu < chart.daiVan[0].startAge ? chart.daiVan[0] : chart.daiVan[chart.daiVan.length - 1]);
  const dvElement = CAN_NGU_HANH[dv.canIndex];
  const favDV = favOf(dvElement, dt);
  const thapThanDV = thapThanOf(dv.canIndex, nhatChuIndex);

  // 4) Lưu niên hiện tại (engine có sẵn).
  const ln = tinhLuuNien(nowYear, input.year, 1)[0];
  const lnElement = CAN_NGU_HANH[ln.canIndex];
  const favLN = favOf(lnElement, dt);
  const thapThanLN = thapThanOf(ln.canIndex, nhatChuIndex);

  // 5) 4 thanh chỉ số (BẢN NHÁP — công thức minh bạch, Thầy hiệu chỉnh).
  const base = 5 + 1.5 * favDV + 0.75 * favLN;
  const xungNhatChi = chiXung(dv.chiIndex, chart.day.chiIndex);
  const suNghiep = clamp10(base + (QUAN_SAT.has(thapThanDV) ? 1.5 : AN.has(thapThanDV) ? 0.5 : 0));
  const taiChinh = clamp10(base + (TAI.has(thapThanDV) ? 1.5 : THUC_THUONG.has(thapThanDV) ? 0.5 : 0));
  const coHoi = clamp10(base + (THUC_THUONG.has(thapThanDV) ? 1.5 : thapThanDV === "Chính Ấn" ? 0.5 : 0));
  const bienDong = clamp10(5 - 1.0 * favDV + (xungNhatChi ? 2 : 0) + (KIEP_THUONG.has(thapThanDV) ? 1.5 : 0));

  const dimensions: LuckDimension[] = [
    { key: "su-nghiep", label: "Sự nghiệp", score: suNghiep, higherIsBetter: true },
    { key: "tai-chinh", label: "Tài chính", score: taiChinh, higherIsBetter: true },
    { key: "co-hoi", label: "Cơ hội", score: coHoi, higherIsBetter: true },
    { key: "bien-dong", label: "Biến động", score: bienDong, higherIsBetter: false },
  ];

  // 6) Timeline đại vận.
  const timeline = chart.daiVan.map((d) => {
    const fav = favOf(CAN_NGU_HANH[d.canIndex], dt);
    return {
      tuoiBatDau: d.startAge,
      tuoiKetThuc: d.endAge,
      nhan: `${d.can} ${d.chi}`,
      danhGia: danhGiaOf(fav),
      laHienTai: d.startAge === dv.startAge,
    };
  });

  // 7) Lớp Tử Vi phụ — chỉ khi có giờ sinh (cung Mệnh/đại vận phụ thuộc giờ). Bọc try/catch vì
  // engine Tử Vi có thể ném RULE_NOT_DEFINED ở vài mốc, và có 3 lỗi đã biết (TUVI_ENGINE_AUDIT.md).
  let tuVi: LuckContext["tuVi"] = null;
  if (gioSinhKnown) {
    try {
      const zw = tinhTuVi({ day: input.day, month: input.month, year: input.year, hour, gender: input.gender, viewingYear: nowYear });
      const cung = zw.cungs.find((c) => tuoiMu >= c.daiVanTuoi[0] && tuoiMu <= c.daiVanTuoi[1]);
      if (cung) {
        tuVi = {
          daiVanCung: cung.cungName,
          chinhTinh: cung.chinhTinh.map((s) => s.name),
          ghiChu: "Lớp phụ — chỉ để đối chiếu định tính, KHÔNG quyết định điểm số. Tử Vi engine có 3 lỗi đã biết (xem TUVI_ENGINE_AUDIT.md).",
        };
      }
    } catch {
      tuVi = null; // Tử Vi lỗi ở mốc này → bỏ qua, vận trình vẫn chạy bằng Bát Tự.
    }
  }

  // 8) Tín hiệu + tóm tắt (deterministic; LLM có thể viết lại giọng đời thường).
  const signals: string[] = [
    `Đại vận hiện tại ${dv.can} ${dv.chi} (${thapThanDV}), hành ${dvElement} so với Dụng Thần ${dt.dungThan} → ${danhGiaOf(favDV)}.`,
    `Lưu niên ${nowYear} ${ln.can} ${ln.chi} (${thapThanLN}), hành ${lnElement} → ${danhGiaOf(favLN)}.`,
    xungNhatChi ? `Chi đại vận ${dv.chi} XUNG Nhật Chi ${chart.day.chi} → tăng biến động.` : `Chi đại vận không xung Nhật Chi → biến động nền thấp hơn.`,
    !gioSinhKnown ? "Không có giờ sinh → vận trình mang tính ước lượng (dùng giờ mặc định 12h)." : "",
  ].filter(Boolean);

  const tichCuc = [...dimensions].filter((d) => d.higherIsBetter);
  const manhNhat = [...tichCuc].sort((a, b) => b.score - a.score)[0];
  const yeuNhat = [...tichCuc].sort((a, b) => a.score - b.score)[0];
  const dongDeu = manhNhat.score === yeuNhat.score;
  const thoiVanChung = danhGiaOf(favDV + favLN >= 1 ? 1 : favDV + favLN <= -1 ? -1 : 0);
  const tomTat = [
    `Thời vận chung năm nay: ${thoiVanChung === "tot" ? "khá thuận" : thoiVanChung === "xau" ? "còn nhiều trắc trở" : "tạm ổn, chưa bứt phá"}.`,
    dongDeu
      ? `Các mặt sự nghiệp – tài chính – cơ hội đang khá đồng đều, chưa mặt nào bật hẳn lên.`
      : `Mặt nổi trội lúc này: ${manhNhat.label}; mặt cần bồi thêm: ${yeuNhat.label}.`,
    bienDong >= 7 ? "Giai đoạn nhiều xáo trộn — nên thận trọng, tránh quyết định vội." : "Mức xáo trộn ở ngưỡng vừa phải.",
  ];

  return {
    nguon: "bat-tu",
    tuoiHienTai: tuoiMu,
    gioSinhKnown,
    daiVanHienTai: { tuoiBatDau: dv.startAge, tuoiKetThuc: dv.endAge, can: dv.can, chi: dv.chi, thapThan: thapThanDV, danhGia: danhGiaOf(favDV) },
    luuNienHienTai: { nam: nowYear, can: ln.can, chi: ln.chi, thapThan: thapThanLN, danhGia: danhGiaOf(favLN) },
    dungThan: { ...dt, capDo: pt.vuongSuy.capDo, phuongPhap: pt.dungThan.phuongPhap },
    dimensions,
    timeline,
    tuVi,
    signals,
    tomTat,
    coNhap: true,
  };
}
