// Điều phối toàn luồng Luận Cơ Bản: lập lá số → vượng suy/Dụng Thần → Tầng 1 (findings) → Tầng 2+3
// (AI viết + hậu kiểm) cho từng giai đoạn → ghép thành BaoCaoCoBan.
import { tinhBatTu, type BatTuInput, type BatTuChart } from "../bat-tu";
import { phanTichBatTu, type TuTruInput, type BatTuAnalysis } from "../bat-tu-engine/engine";
import { taoFindingsCoBan } from "./findings-co-ban";
import { taoFindingsNangCao } from "./findings-nang-cao";
import { GIAI_DOAN_CO_BAN, GIAI_DOAN_NANG_CAO } from "./ai-narrative";
import { taoNoiDungGiaiDoanAnToan } from "./hau-kiem";
import { layContentSafety } from "./content-safety";
import { taoBieuDoDaiVan, taoBieuDoLuuNien } from "./luu-nien-dai-van";
import type { BaoCaoCoBan, BaoCaoNangCao, LaSoHienThi } from "./types";

export function laSoVaPhanTich(input: BatTuInput): { chart: BatTuChart; analysis: BatTuAnalysis } {
  const chart = tinhBatTu(input);
  const tt: TuTruInput = {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    gioiTinh: input.gender,
  };
  const analysis = phanTichBatTu(tt);
  return { chart, analysis };
}

const TEN_TRU_TIENG_VIET: Record<"year" | "month" | "day" | "hour", string> = {
  year: "Năm", month: "Tháng", day: "Ngày", hour: "Giờ",
};

export function laSoHienThi(chart: BatTuChart, analysis: BatTuAnalysis): LaSoHienThi {
  return {
    tuTru: (["year", "month", "day", "hour"] as const).map((k) => ({ tru: TEN_TRU_TIENG_VIET[k], can: chart[k].can, chi: chart[k].chi })),
    nhatChu: `${chart.day.can} (${chart.nhatChu.nguHanh}, ${chart.nhatChu.amDuong})`,
    capDoVuongSuy: analysis.vuongSuy.capDo,
    dungThan: analysis.dungThan.dungThan,
    hyThan: analysis.dungThan.hyThan,
    kyThan: analysis.dungThan.kyThan,
    dieuHauNote: analysis.dungThan.dieuHauNote ?? null,
  };
}

export async function taoBaoCaoCoBan(input: BatTuInput): Promise<BaoCaoCoBan> {
  const { chart, analysis } = laSoVaPhanTich(input);
  const findingsList = taoFindingsCoBan(chart, analysis);
  const laSo = laSoHienThi(chart, analysis);

  // A, B, C, G, H, J, L chạy SONG SONG cả 7 — L (Kết luận) chỉ cần `findingsList` (đã tính xong bằng
  // code phía trên, KHÔNG phải chờ AI viết xong 6 giai đoạn kia mới có), nên không có lý do kỹ thuật
  // nào bắt L phải chạy tuần tự sau — trước đây làm tuần tự khiến tổng thời gian tải trang gần gấp
  // đôi (~46-48s đo thực tế, gây cảm giác trang bị treo/lỗi). Gộp cả 7 vào 1 Promise.all giảm gần một
  // nửa thời gian chờ.
  const thuTuMa = ["A", "B", "C", "G", "H", "J"] as const;
  const findingsRongL = { maGiaiDoan: "L" as const, tenGiaiDoan: "Kết luận", ketQua: {}, canCu: [] };
  const cfgL = GIAI_DOAN_CO_BAN.find((c) => c.ma === "L")!;

  const ketQuaSongSong = await Promise.all([
    ...thuTuMa.map((ma) => {
      const cfg = GIAI_DOAN_CO_BAN.find((c) => c.ma === ma)!;
      const findings = findingsList.find((f) => f.maGiaiDoan === ma)!;
      return taoNoiDungGiaiDoanAnToan(cfg, laSo, findings);
    }),
    taoNoiDungGiaiDoanAnToan(cfgL, laSo, findingsRongL, findingsList),
  ]);

  const giaiDoan = ketQuaSongSong.filter((x): x is NonNullable<typeof x> => x !== null);

  const safety = layContentSafety();
  return {
    laSo,
    disclaimerDauBai: safety.disclaimer_bat_buoc,
    giaiDoan,
    disclaimerCuoiBai: safety.disclaimer_bat_buoc,
    ctaNangCao: "Bản Luận Nâng Cao sẽ đi sâu vào Thần Sát, gia đình - lục thân, sức khỏe, và trọn vẹn các giai đoạn vận trình từ nhỏ đến già.",
  };
}

export async function taoBaoCaoNangCao(input: BatTuInput): Promise<BaoCaoNangCao> {
  const { chart, analysis } = laSoVaPhanTich(input);
  const findingsList = taoFindingsNangCao(chart, analysis);
  const laSo = laSoHienThi(chart, analysis);

  // D, E, F, I, K (văn xuôi) + 2 lệnh chấm điểm đồ hình (Đại Vận, Lưu Niên 10 năm) — TẤT CẢ chạy
  // song song trong cùng 1 Promise.all, không có phụ thuộc dữ liệu giữa các mục.
  const thuTuMa = ["D", "E", "F", "I", "K"] as const;
  const [ketQuaGiaiDoan, daiVanBieuDo, luuNienBieuDo] = await Promise.all([
    Promise.all(
      thuTuMa.map((ma) => {
        const cfg = GIAI_DOAN_NANG_CAO.find((c) => c.ma === ma)!;
        const findings = findingsList.find((f) => f.maGiaiDoan === ma)!;
        return taoNoiDungGiaiDoanAnToan(cfg, laSo, findings);
      }),
    ),
    taoBieuDoDaiVan(chart, analysis, laSo),
    taoBieuDoLuuNien(chart, analysis, laSo, input.year),
  ]);

  const giaiDoan = ketQuaGiaiDoan.filter((x): x is NonNullable<typeof x> => x !== null);
  const safety = layContentSafety();
  return { laSo, giaiDoan, daiVanBieuDo, luuNienBieuDo, disclaimerCuoiBai: safety.disclaimer_bat_buoc };
}
