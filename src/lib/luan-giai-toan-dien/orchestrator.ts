// Điều phối toàn luồng Luận Cơ Bản: lập lá số → vượng suy/Dụng Thần → Tầng 1 (findings) → Tầng 2+3
// (AI viết + hậu kiểm) cho từng giai đoạn → ghép thành BaoCaoCoBan.
import { tinhBatTu, type BatTuInput, type BatTuChart } from "../bat-tu";
import { phanTichBatTu, type TuTruInput, type BatTuAnalysis } from "../bat-tu-engine/engine";
import { taoFindingsCoBan } from "./findings-co-ban";
import { taoFindingsNangCao } from "./findings-nang-cao";
// ⚠️ Dùng LẠI y hệt findings-nang-cao.ts của tầng Nâng Cao — CHỈ để lấy findings THUẦN CODE (rẻ,
// không gọi AI) cho Giai đoạn L tổng hợp đủ A-K. Việc VIẾT VĂN D,E,F,I,K vẫn nằm ở taoBaoCaoNangCao()
// riêng, không đụng ở đây.
import { GIAI_DOAN_CO_BAN, GIAI_DOAN_NANG_CAO } from "./ai-narrative";
import { taoNoiDungGiaiDoanAnToan } from "./hau-kiem";
import { layContentSafety } from "./content-safety";
import { taoBieuDoDaiVan, taoBieuDoLuuNien } from "./luu-nien-dai-van";
import { taoDuLieuDoHinhFree } from "./free-template";
import type { BaoCaoCoBan, BaoCaoNangCao, LaSoHienThi } from "./types";

export function laSoVaPhanTich(input: BatTuInput): { chart: BatTuChart; analysis: BatTuAnalysis; tt: TuTruInput } {
  const chart = tinhBatTu(input);
  const tt: TuTruInput = {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    gioiTinh: input.gender,
  };
  const analysis = phanTichBatTu(tt);
  return { chart, analysis, tt };
}

const TEN_TRU_TIENG_VIET: Record<"year" | "month" | "day" | "hour", string> = {
  year: "Năm", month: "Tháng", day: "Ngày", hour: "Giờ",
};

export function laSoHienThi(chart: BatTuChart, analysis: BatTuAnalysis, input: BatTuInput): LaSoHienThi {
  return {
    tuTru: (["year", "month", "day", "hour"] as const).map((k) => ({ tru: TEN_TRU_TIENG_VIET[k], can: chart[k].can, chi: chart[k].chi })),
    gioiTinh: chart.gender,
    nhatChu: `${chart.day.can} (${chart.nhatChu.nguHanh}, ${chart.nhatChu.amDuong})`,
    capDoVuongSuy: analysis.vuongSuy.capDo,
    dungThan: analysis.dungThan.dungThan,
    hyThan: analysis.dungThan.hyThan,
    kyThan: analysis.dungThan.kyThan,
    dieuHauNote: analysis.dungThan.dieuHauNote ?? null,
    diemVuongSuy: analysis.vuongSuy.diem,
    ngaySinhDuong: { day: input.day, month: input.month, year: input.year, hour: input.hour, ...(input.minute !== undefined ? { minute: input.minute } : {}) },
  };
}

export async function taoBaoCaoCoBan(input: BatTuInput): Promise<BaoCaoCoBan> {
  const { chart, analysis } = laSoVaPhanTich(input);
  const findingsList = taoFindingsCoBan(chart, analysis, input.year); // input.year = năm sinh, để J liệt kê Lưu Niên
  const laSo = laSoHienThi(chart, analysis, input);

  // ⚠️ 1/9/2026: Giai đoạn L PHẢI tổng hợp từ ĐỦ 11 giai đoạn A-K, không chỉ 6 giai đoạn Cơ Bản như
  // trước (khi còn tách 2 gói, D/E/F/I/K "khách có thể chưa mua" nên L không được nhắc tới). Từ khi
  // gộp về 1 gói duy nhất, khách LUÔN nhận đủ cả 12 giai đoạn nên L phải biết đủ A-K.
  // taoFindingsNangCao() ở đây CHỈ lấy findings THUẦN CODE (rẻ, không gọi AI) — không tính lại phần
  // AI viết văn D,E,F,I,K (việc đó vẫn ở taoBaoCaoNangCao() riêng, chạy song song, không trùng lặp).
  const findingsNangCao = taoFindingsNangCao(chart, analysis);
  const findingsDayDuChoL = [...findingsList, ...findingsNangCao];

  // A, B, C, G, H, J, L chạy SONG SONG cả 7 — L (Kết luận) chỉ cần findings THUẦN CODE (đã tính xong
  // ở trên, KHÔNG phải chờ AI viết xong các giai đoạn kia mới có), nên không có lý do kỹ thuật nào
  // bắt L phải chạy tuần tự sau — trước đây làm tuần tự khiến tổng thời gian tải trang gần gấp đôi
  // (~46-48s đo thực tế, gây cảm giác trang bị treo/lỗi). Gộp cả 7 vào 1 Promise.all giảm gần một
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
    taoNoiDungGiaiDoanAnToan(cfgL, laSo, findingsRongL, findingsDayDuChoL),
  ]);

  const giaiDoan = ketQuaSongSong.filter((x): x is NonNullable<typeof x> => x !== null);

  // Đồ hình MỒI mời nâng cấp Nâng Cao — TÁI DÙNG heuristic thuần code của tầng Free (không gọi AI
  // thêm, đúng nguyên tắc "free/mồi thì không tốn chi phí AI"). Khác Nâng Cao thật: chỉ 1 điểm thô
  // (không tách 4 khía cạnh), Dụng Thần cố định theo nguyên cục (không tính lại theo từng Đại Vận).
  const doHinhMoi = taoDuLieuDoHinhFree(chart, analysis, input.year);
  const moiDaiVan = doHinhMoi.daiVan.map((v) => ({ nhan: `${v.startAge}-${v.endAge} tuổi`, canChi: `${v.can} ${v.chi}`, diem: v.diem }));
  const moiLuuNien = doHinhMoi.luuNien.map((v) => ({ nhan: String(v.year), canChi: `${v.can} ${v.chi}`, diem: v.diem }));

  const safety = layContentSafety();
  return {
    laSo,
    disclaimerDauBai: safety.disclaimer_bat_buoc,
    giaiDoan,
    disclaimerCuoiBai: safety.disclaimer_bat_buoc,
    ctaNangCao: "Bản Luận Nâng Cao sẽ đi sâu vào Thần Sát, gia đình - lục thân, sức khỏe, và trọn vẹn các giai đoạn vận trình từ nhỏ đến già.",
    moiDaiVan,
    moiLuuNien,
  };
}

export async function taoBaoCaoNangCao(input: BatTuInput): Promise<BaoCaoNangCao> {
  const { chart, analysis, tt } = laSoVaPhanTich(input);
  const findingsList = taoFindingsNangCao(chart, analysis);
  const laSo = laSoHienThi(chart, analysis, input);

  // D, E, F, I, K (văn xuôi) chạy song song với nhóm chấm điểm đồ hình.
  //
  // ⚠️ Hai lệnh chấm điểm chạy NỐI TIẾP nhau (không phải song song) là CỐ Ý: chúng dùng chung một
  // khối tri thức ~35k token đặt ở đầu prompt. Chạy nối tiếp thì lệnh Lưu Niên đọc lại được cache
  // của lệnh Đại Vận (0,1x) thay vì phải ghi cache mới (1,25x) — rẻ hơn hơn 10 lần cho phần đó.
  // Chạy song song sẽ khiến cả hai cùng trượt cache. Tổng thời gian gần như không đổi vì cặp này
  // vẫn chạy song song với 5 lệnh văn xuôi vốn đã tốn ngần ấy thời gian.
  const thuTuMa = ["D", "E", "F", "I", "K"] as const;
  const [ketQuaGiaiDoan, bieuDo] = await Promise.all([
    Promise.all(
      thuTuMa.map((ma) => {
        const cfg = GIAI_DOAN_NANG_CAO.find((c) => c.ma === ma)!;
        const findings = findingsList.find((f) => f.maGiaiDoan === ma)!;
        return taoNoiDungGiaiDoanAnToan(cfg, laSo, findings);
      }),
    ),
    (async () => {
      const daiVan = await taoBieuDoDaiVan(chart, tt, laSo);
      const luuNien = await taoBieuDoLuuNien(chart, tt, laSo, input.year);
      return { daiVan, luuNien };
    })(),
  ]);
  const { daiVan: daiVanBieuDo, luuNien: luuNienBieuDo } = bieuDo;

  const giaiDoan = ketQuaGiaiDoan.filter((x): x is NonNullable<typeof x> => x !== null);
  const safety = layContentSafety();
  return { laSo, giaiDoan, daiVanBieuDo, luuNienBieuDo, disclaimerCuoiBai: safety.disclaimer_bat_buoc };
}
