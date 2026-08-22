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

import { tinhBatTu, tinhLuuNien, thapThanOf, type BatTuChart } from "../bat-tu";
import { coLucXung, hanhCan, hanhChi, phanTichBatTu, type Hanh, type TuTruInput } from "../bat-tu-engine/engine";
import { tinhTuVi } from "../tu-vi/engine";

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
    band: Band; // 5 dải: rat_thuan/thuan/trung_binh/thu_thach/nghich (xét Can+Chi+xung)
    danhGia: DanhGia;
  };
  luuNienHienTai: {
    nam: number;
    can: string;
    chi: string;
    thapThan: string;
    band: Band;
    danhGia: DanhGia;
  };
  dungThan: { dungThan: Hanh; hyThan: Hanh; kyThan: Hanh; cuuThan: Hanh; capDo: string; phuongPhap: string };

  dimensions: LuckDimension[]; // 4 thanh cho card "VẬN TRÌNH HIỆN TẠI"

  /** Dòng thời gian đại vận (mỗi giai đoạn gắn nhãn) — dùng cho biểu đồ timeline nếu cần. */
  timeline: { tuoiBatDau: number; tuoiKetThuc: number; nhan: string; band: Band; danhGia: DanhGia; laHienTai: boolean }[];

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

const clamp10 = (x: number) => Math.max(0, Math.min(10, Math.round(x)));

type DungHy = { dungThan: Hanh; hyThan: Hanh; kyThan: Hanh };
export type Band = "rat_thuan" | "thuan" | "trung_binh" | "thu_thach" | "nghich";

// Chấm 1 trụ Can Chi so với Dụng/Hỷ/Kỵ Thần — XÉT CẢ CAN LẪN CHI (không chỉ Can). Công thức lấy
// NGUYÊN từ trach-nhat-sinh-no/dai-van-band.ts (đã chạy production, kiểm chứng): Can/Chi = Dụng +2,
// Hỷ +1, Kỵ -2. Theo đúng convention của dự án là REPLICATE công thức nhỏ này giữa các module (bản
// gốc cũng replicate lại từ suyDaiVanDuPhong của module nghề nghiệp) để module độc lập nhau.
function scorePillar(can: string, chi: string, dt: DungHy): number {
  let d = 0;
  const hc = hanhCan(can);
  const hh = hanhChi(chi);
  if (hc === dt.dungThan) d += 2; else if (hc === dt.hyThan) d += 1; else if (hc === dt.kyThan) d -= 2;
  if (hh === dt.dungThan) d += 2; else if (hh === dt.hyThan) d += 1; else if (hh === dt.kyThan) d -= 2;
  return d;
}

// Ngưỡng dải giống hệt dai-van-band.ts.
function bandOf(score: number): Band {
  return score >= 3 ? "rat_thuan" : score >= 1 ? "thuan" : score >= -0.5 ? "trung_binh" : score >= -2.5 ? "thu_thach" : "nghich";
}
// Quy dải về mức -2..+2 để đưa vào công thức 4 thanh (giữ nguyên thang cũ).
function bandFav(band: Band): number {
  return band === "rat_thuan" ? 2 : band === "thuan" ? 1 : band === "trung_binh" ? 0 : band === "thu_thach" ? -1 : -2;
}
function danhGiaFromBand(band: Band): DanhGia {
  return band === "rat_thuan" || band === "thuan" ? "tot" : band === "trung_binh" ? "binh_thuong" : "xau";
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
  const dt: DungHy = { dungThan: pt.dungThan.dungThan, hyThan: pt.dungThan.hyThan, kyThan: pt.dungThan.kyThan };
  const dtFull = { ...dt, cuuThan: pt.dungThan.cuuThan };

  // 3) Đại vận hiện tại (giai đoạn chứa tuổi mụ; nếu trẻ hơn giai đoạn đầu → lấy giai đoạn đầu; già hơn → cuối).
  const dv =
    chart.daiVan.find((d) => tuoiMu >= d.startAge && tuoiMu <= d.endAge) ??
    (tuoiMu < chart.daiVan[0].startAge ? chart.daiVan[0] : chart.daiVan[chart.daiVan.length - 1]);
  const thapThanDV = thapThanOf(dv.canIndex, nhatChuIndex);
  // Chấm đại vận: Can + Chi so Dụng/Hỷ/Kỵ, cộng trừ xung Nhật/Nguyệt chi (dai-van-band.ts).
  const xungNhatChi = coLucXung(dv.chi, [chart.day.chi]);
  const xungNguyetChi = coLucXung(dv.chi, [chart.month.chi]);
  const scoreDV = scorePillar(dv.can, dv.chi, dt) + (xungNguyetChi ? -2 : 0) + (xungNhatChi ? -1.5 : 0);
  const bandDV = bandOf(scoreDV);
  const favDV = bandFav(bandDV);

  // 4) Lưu niên hiện tại (engine có sẵn) — cũng chấm Can + Chi (xung Thái Tuế nhẹ hơn).
  const ln = tinhLuuNien(nowYear, input.year, 1)[0];
  const thapThanLN = thapThanOf(ln.canIndex, nhatChuIndex);
  const xungLnNhatChi = coLucXung(ln.chi, [chart.day.chi]);
  const scoreLN = scorePillar(ln.can, ln.chi, dt) + (xungLnNhatChi ? -1 : 0);
  const bandLN = bandOf(scoreLN);
  const favLN = bandFav(bandLN);

  // 5) 4 thanh chỉ số (BẢN NHÁP — công thức minh bạch, Thầy hiệu chỉnh).
  // base dựa trên dải đại vận + lưu niên (đã xét Can+Chi+xung). Cách gán dimension theo Thập Thần
  // khớp bảng thap_than_nghe.json của module nghề (Quan/Sát→sự nghiệp, Tài→tài chính, Thực/Thương→cơ hội).
  const base = 5 + 1.5 * favDV + 0.75 * favLN;
  const suNghiep = clamp10(base + (QUAN_SAT.has(thapThanDV) ? 1.5 : AN.has(thapThanDV) ? 0.5 : 0));
  const taiChinh = clamp10(base + (TAI.has(thapThanDV) ? 1.5 : THUC_THUONG.has(thapThanDV) ? 0.5 : 0));
  const coHoi = clamp10(base + (THUC_THUONG.has(thapThanDV) ? 1.5 : thapThanDV === "Chính Ấn" ? 0.5 : 0));
  const bienDong = clamp10(5 - 1.0 * favDV + (xungNhatChi || xungNguyetChi ? 2 : 0) + (KIEP_THUONG.has(thapThanDV) ? 1.5 : 0));

  const dimensions: LuckDimension[] = [
    { key: "su-nghiep", label: "Sự nghiệp", score: suNghiep, higherIsBetter: true },
    { key: "tai-chinh", label: "Tài chính", score: taiChinh, higherIsBetter: true },
    { key: "co-hoi", label: "Cơ hội", score: coHoi, higherIsBetter: true },
    { key: "bien-dong", label: "Biến động", score: bienDong, higherIsBetter: false },
  ];

  // 6) Timeline đại vận — mỗi giai đoạn chấm Can+Chi+xung (như đại vận hiện tại).
  const timeline = chart.daiVan.map((d) => {
    const sc = scorePillar(d.can, d.chi, dt) + (coLucXung(d.chi, [chart.month.chi]) ? -2 : 0) + (coLucXung(d.chi, [chart.day.chi]) ? -1.5 : 0);
    const b = bandOf(sc);
    return {
      tuoiBatDau: d.startAge,
      tuoiKetThuc: d.endAge,
      nhan: `${d.can} ${d.chi}`,
      band: b,
      danhGia: danhGiaFromBand(b),
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
    `Đại vận hiện tại ${dv.can} ${dv.chi} (${thapThanDV}) — Can ${hanhCan(dv.can)} · Chi ${hanhChi(dv.chi)} so Dụng ${dt.dungThan}/Hỷ ${dt.hyThan}/Kỵ ${dt.kyThan} → dải "${bandDV}".`,
    `Lưu niên ${nowYear} ${ln.can} ${ln.chi} (${thapThanLN}) — Can ${hanhCan(ln.can)} · Chi ${hanhChi(ln.chi)} → dải "${bandLN}".`,
    xungNguyetChi ? `Chi đại vận ${dv.chi} XUNG Nguyệt Chi ${chart.month.chi} (động gốc) → hạ vận + tăng biến động.` : xungNhatChi ? `Chi đại vận ${dv.chi} XUNG Nhật Chi ${chart.day.chi} (động thân) → tăng biến động.` : `Đại vận không xung Nhật/Nguyệt chi → biến động nền thấp hơn.`,
    !gioSinhKnown ? "Không có giờ sinh → vận trình mang tính ước lượng (dùng giờ mặc định 12h)." : "",
  ].filter(Boolean);

  const tichCuc = [...dimensions].filter((d) => d.higherIsBetter);
  const manhNhat = [...tichCuc].sort((a, b) => b.score - a.score)[0];
  const yeuNhat = [...tichCuc].sort((a, b) => a.score - b.score)[0];
  const dongDeu = manhNhat.score === yeuNhat.score;
  const thoiVanChung: DanhGia = favDV + favLN >= 1 ? "tot" : favDV + favLN <= -1 ? "xau" : "binh_thuong";
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
    daiVanHienTai: { tuoiBatDau: dv.startAge, tuoiKetThuc: dv.endAge, can: dv.can, chi: dv.chi, thapThan: thapThanDV, band: bandDV, danhGia: danhGiaFromBand(bandDV) },
    luuNienHienTai: { nam: nowYear, can: ln.can, chi: ln.chi, thapThan: thapThanLN, band: bandLN, danhGia: danhGiaFromBand(bandLN) },
    dungThan: { ...dtFull, capDo: pt.vuongSuy.capDo, phuongPhap: pt.dungThan.phuongPhap },
    dimensions,
    timeline,
    tuVi,
    signals,
    tomTat,
    coNhap: true,
  };
}
