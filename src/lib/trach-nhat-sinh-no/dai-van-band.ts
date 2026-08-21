/**
 * VÒNG 5 §1–§3 — Quy Đại Vận Bát Tự về 5 dải (Rất thuận…Nghịch), có xét xung nhật/nguyệt chi và
 * trọng số theo giai đoạn tuổi. Kỹ thuật so Ngũ Hành vận với Dụng/Hỷ/Kỵ Thần giống
 * `suyDaiVanDuPhong()` đã dùng ở module Định Hướng Nghề Nghiệp — không viết lại từ đầu, áp dụng lại
 * cho bối cảnh mới (băng đậm hơn vì đây là LỌC/XẾP HẠNG, không phải luận đơn lẻ).
 */
import type { BatTuChart, DaiVanPeriod } from "../bat-tu";
import { hanhCan, hanhChi, coLucXung, type Hanh } from "../bat-tu-engine/engine";
import type { DaiVanBandItem } from "./types";

function ngamXungTai(canChi: DaiVanPeriod, chiCanXet: string): boolean {
  return coLucXung(canChi.chi, [chiCanXet]);
}

export function tinhDaiVanBand(
  chart: BatTuChart,
  dungThan: Hanh,
  hyThan: Hanh,
  kyThan: Hanh,
  ngaySinh: { year: number; month: number; day: number },
): DaiVanBandItem[] {
  return chart.daiVan.slice(0, 6).map((dv) => {
    const hanhVan = hanhCan(dv.can);
    const hanhChiVan = hanhChi(dv.chi);
    const xungNhatChi = ngamXungTai(dv, chart.day.chi);
    const xungNguyetChi = ngamXungTai(dv, chart.month.chi);

    let diem = 0;
    if (hanhVan === dungThan) diem += 2; else if (hanhVan === hyThan) diem += 1; else if (hanhVan === kyThan) diem -= 2;
    if (hanhChiVan === dungThan) diem += 2; else if (hanhChiVan === hyThan) diem += 1; else if (hanhChiVan === kyThan) diem -= 2;
    if (xungNguyetChi) diem -= 2; // "động gốc; sự nghiệp gãy"
    if (xungNhatChi) diem -= 1.5; // "động thân; hôn nhân, sức khỏe biến động"

    const band: DaiVanBandItem["band"] = diem >= 3 ? "rat_thuan" : diem >= 1 ? "thuan" : diem >= -0.5 ? "trung_binh" : diem >= -2.5 ? "thu_thach" : "nghich";

    const trongSo: DaiVanBandItem["trongSo"] =
      dv.startAge < (chart.daiVan[0]?.startAge ?? 0) + 1 ? "thap"
      : dv.startAge >= 25 && dv.startAge < 45 ? "cao_nhat"
      : dv.startAge < 25 ? "cao"
      : "trung_binh";

    const namDuongLich = ngaySinh.year + dv.startAge;

    const dienGiaiParts: string[] = [`Can ${dv.can} (${hanhVan}) · Chi ${dv.chi} (${hanhChiVan}) so Dụng ${dungThan}/Hỷ ${hyThan}/Kỵ ${kyThan}`];
    if (xungNguyetChi) dienGiaiParts.push("xung nguyệt chi nguyên cục (trừ nặng)");
    if (xungNhatChi) dienGiaiParts.push("xung nhật chi nguyên cục (trừ nặng)");

    return {
      tuTuoi: dv.startAge,
      denTuoi: dv.endAge,
      namDuongLich,
      canChi: `${dv.can} ${dv.chi}`,
      band,
      trongSo,
      xungNhatChi,
      xungNguyetChi,
      dienGiai: dienGiaiParts.join("; ") + ".",
    };
  });
}
