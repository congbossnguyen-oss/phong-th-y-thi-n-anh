// Điều phối toàn luồng Luận Cơ Bản: lập lá số → vượng suy/Dụng Thần → Tầng 1 (findings) → Tầng 2+3
// (AI viết + hậu kiểm) cho từng giai đoạn → ghép thành BaoCaoCoBan.
import { tinhBatTu, type BatTuInput, type BatTuChart } from "../bat-tu";
import { phanTichBatTu, type TuTruInput, type BatTuAnalysis } from "../bat-tu-engine/engine";
import { taoFindingsCoBan } from "./findings-co-ban";
import { taoFindingsNangCao } from "./findings-nang-cao";
import { GIAI_DOAN_CO_BAN, GIAI_DOAN_NANG_CAO } from "./ai-narrative";
import { taoNoiDungGiaiDoanAnToan } from "./hau-kiem";
import { layContentSafety } from "./content-safety";
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

export function laSoHienThi(chart: BatTuChart, analysis: BatTuAnalysis): LaSoHienThi {
  return {
    tuTru: (["year", "month", "day", "hour"] as const).map((k) => ({ tru: k, can: chart[k].can, chi: chart[k].chi })),
    nhatChu: `${chart.day.can} (${chart.nhatChu.nguHanh}, ${chart.nhatChu.amDuong})`,
    capDoVuongSuy: analysis.vuongSuy.capDo,
    dungThan: analysis.dungThan.dungThan,
    hyThan: analysis.dungThan.hyThan,
    kyThan: analysis.dungThan.kyThan,
  };
}

export async function taoBaoCaoCoBan(input: BatTuInput): Promise<BaoCaoCoBan> {
  const { chart, analysis } = laSoVaPhanTich(input);
  const findingsList = taoFindingsCoBan(chart, analysis);
  const laSo = laSoHienThi(chart, analysis);

  // A, B, C, G, H, J độc lập nhau — chạy song song để rút ngắn thời gian chờ (6 lệnh AI cùng lúc).
  const thuTuMa = ["A", "B", "C", "G", "H", "J"] as const;
  const ketQuaSongSong = await Promise.all(
    thuTuMa.map((ma) => {
      const cfg = GIAI_DOAN_CO_BAN.find((c) => c.ma === ma)!;
      const findings = findingsList.find((f) => f.maGiaiDoan === ma)!;
      return taoNoiDungGiaiDoanAnToan(cfg, laSo, findings);
    }),
  );

  // L (Kết luận) PHẢI chạy SAU — cần tổng hợp findings của cả 6 giai đoạn trên.
  const cfgL = GIAI_DOAN_CO_BAN.find((c) => c.ma === "L")!;
  const findingsRong = { maGiaiDoan: "L" as const, tenGiaiDoan: "Kết luận", ketQua: {}, canCu: [] };
  const noiDungL = await taoNoiDungGiaiDoanAnToan(cfgL, laSo, findingsRong, findingsList);

  const giaiDoan = [...ketQuaSongSong, noiDungL].filter((x): x is NonNullable<typeof x> => x !== null);

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

  // D, E, I, K độc lập nhau, chạy song song. F cần thêm lượt kiểm duyệt riêng (canKiemDuyet) nên
  // đã tự xử lý bên trong taoNoiDungGiaiDoanAnToan — vẫn chạy song song với các giai đoạn khác được.
  const thuTuMa = ["D", "E", "F", "I", "K"] as const;
  const ketQua = await Promise.all(
    thuTuMa.map((ma) => {
      const cfg = GIAI_DOAN_NANG_CAO.find((c) => c.ma === ma)!;
      const findings = findingsList.find((f) => f.maGiaiDoan === ma)!;
      return taoNoiDungGiaiDoanAnToan(cfg, laSo, findings);
    }),
  );

  const giaiDoan = ketQua.filter((x): x is NonNullable<typeof x> => x !== null);
  const safety = layContentSafety();
  return { laSo, giaiDoan, disclaimerCuoiBai: safety.disclaimer_bat_buoc };
}
