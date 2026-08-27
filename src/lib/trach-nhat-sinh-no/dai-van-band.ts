/**
 * VÒNG 5 §1–§3 — Quy Đại Vận Bát Tự về 5 dải (Rất thuận…Nghịch), có xét xung nhật/nguyệt chi và
 * trọng số theo giai đoạn tuổi. Kỹ thuật so Ngũ Hành vận với Dụng/Hỷ/Kỵ Thần giống
 * `suyDaiVanDuPhong()` đã dùng ở module Định Hướng Nghề Nghiệp — không viết lại từ đầu, áp dụng lại
 * cho bối cảnh mới (băng đậm hơn vì đây là LỌC/XẾP HẠNG, không phải luận đơn lẻ).
 */
import type { BatTuChart, DaiVanPeriod, Gender } from "../bat-tu";
import { hanhCan, hanhChi, coLucXung, phanTichBatTuTaiDaiVan, type Hanh, type TuTruInput } from "../bat-tu-engine/engine";
import type { DaiVanBandItem } from "./types";

function ngamXungTai(canChi: DaiVanPeriod, chiCanXet: string): boolean {
  return coLucXung(canChi.chi, [chiCanXet]);
}

/**
 * Quy Đại Vận về 5 dải.
 *
 * ⚠️ NÂNG CẤP PHƯƠNG PHÁP 27/8/2026 — TÍNH LẠI DỤNG THẦN CHO TỪNG ĐẠI VẬN.
 * Trước đây so mọi Đại Vận với một bộ Dụng/Hỷ/Kỵ Thần CỐ ĐỊNH của nguyên cục. Điều đó trái phương
 * pháp: `vuong-suy.md` §6.1 ghi "xác định vượng suy trên nguyên cục tĩnh TRƯỚC, sau đó XÉT LẠI khi
 * tiến nhập Đại Vận"; `quan-he-can-chi.md` §4 (tầng thứ) xếp Đại Vận ở tầng trên mệnh cục, tức Đại
 * Vận nhập cục làm ĐỔI cục diện vượng suy. Một lá thân nhược đi vào vận Ấn/Tỷ mạnh có thể chuyển
 * sang thân vượng — lúc đó Dụng Thần đảo hẳn, và chấm bằng Dụng Thần cũ là chấm sai dấu.
 *
 * `phanTichBatTuTaiDaiVan()` (viết cho module Luận Giải Bát Tự Toàn Diện, đã kiểm chứng trên 3 lá
 * số thật) làm đúng việc đó, kèm CHỐT AN TOÀN: lá Nhóm 3 (Tòng cách, Cực vượng/Cực nhược) giữ
 * nguyên Dụng Thần cả đời, không tính lại — tránh lật ngược kết luận của lá Tòng cách.
 */
export function tinhDaiVanBand(
  chart: BatTuChart,
  dungThan: Hanh,
  hyThan: Hanh,
  kyThan: Hanh,
  ngaySinh: { year: number; month: number; day: number },
  gioiTinh?: Gender,
): DaiVanBandItem[] {
  const tt: TuTruInput = {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    ...(gioiTinh ? { gioiTinh } : {}),
  };

  return chart.daiVan.slice(0, 6).map((dv) => {
    const hanhVan = hanhCan(dv.can);
    const hanhChiVan = hanhChi(dv.chi);
    const xungNhatChi = ngamXungTai(dv, chart.day.chi);
    const xungNguyetChi = ngamXungTai(dv, chart.month.chi);

    // Dụng/Hỷ/Kỵ Thần TẠI vận này (có thể khác nguyên cục) — xem ghi chú phương pháp ở trên.
    let dtVan = dungThan, hyVan = hyThan, kyVan = kyThan, dungThanDoi = false;
    try {
      const taiVan = phanTichBatTuTaiDaiVan(tt, { can: dv.can, chi: dv.chi });
      dtVan = taiVan.dungThan.dungThan;
      hyVan = taiVan.dungThan.hyThan;
      kyVan = taiVan.dungThan.kyThan;
      dungThanDoi = taiVan.dungThanDoi;
    } catch { /* lỗi bất thường → lùi về Dụng Thần nguyên cục, không làm hỏng cả luồng */ }

    let diem = 0;
    if (hanhVan === dtVan) diem += 2; else if (hanhVan === hyVan) diem += 1; else if (hanhVan === kyVan) diem -= 2;
    if (hanhChiVan === dtVan) diem += 2; else if (hanhChiVan === hyVan) diem += 1; else if (hanhChiVan === kyVan) diem -= 2;
    if (xungNguyetChi) diem -= 2; // "động gốc; sự nghiệp gãy"
    if (xungNhatChi) diem -= 1.5; // "động thân; hôn nhân, sức khỏe biến động"

    const band: DaiVanBandItem["band"] = diem >= 3 ? "rat_thuan" : diem >= 1 ? "thuan" : diem >= -0.5 ? "trung_binh" : diem >= -2.5 ? "thu_thach" : "nghich";

    const trongSo: DaiVanBandItem["trongSo"] =
      dv.startAge < (chart.daiVan[0]?.startAge ?? 0) + 1 ? "thap"
      : dv.startAge >= 25 && dv.startAge < 45 ? "cao_nhat"
      : dv.startAge < 25 ? "cao"
      : "trung_binh";

    const namDuongLich = ngaySinh.year + dv.startAge;

    const dienGiaiParts: string[] = [
      `Can ${dv.can} (${hanhVan}) · Chi ${dv.chi} (${hanhChiVan}) so Dụng ${dtVan}/Hỷ ${hyVan}/Kỵ ${kyVan}`
      + (dungThanDoi ? ` — Dụng Thần vận này ĐỔI so với nguyên cục (${dungThan}), vì Đại Vận nhập cục làm chuyển vượng suy` : ""),
    ];
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
