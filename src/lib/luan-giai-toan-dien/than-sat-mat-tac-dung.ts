// Điều kiện "mất tác dụng" của Thần Sát — nguyên tắc chung áp dụng cho MỌI sao (nguyenTacChung
// trong than-sat.json + "nguyên tắc 2" trong than-sat.md): đồng trụ Không Vong, hoặc bị Hình/Xung/
// Hại trực tiếp trong tứ trụ. bat-tu.ts's chart.thanSat KHÔNG áp điều kiện này khi tính (chỉ tra vị
// trí thô) — module gốc chưa từng cần vì các trang hiện có chỉ LIỆT KÊ sao, không luận cát hung tự
// động. Ở đây Tầng 2 AI sẽ luận cát hung nên phải bù lại bước này.
//
// KHÔNG xoá sao khỏi danh sách khi phát hiện điều kiện trên — than-sat.md nói rõ đây là "giảm/mất
// tác dụng", mức độ tùy sao là Hỷ hay Kị (Không Vong tọa Hỷ thần → giảm cái tốt; tọa Kị thần → giảm
// cái xấu) — quyết định mang tính luận giải, để Tầng 2 AI tự cân nhắc, code chỉ nêu SỰ KIỆN cấu trúc.
//
// "Khắc" trong bộ tứ Hình/Xung/Khắc/Hại CHƯA đưa vào (không phải 1 quan hệ có bảng tra chuẩn như 3
// quan hệ kia — dễ suy diễn sai nếu tự đặt định nghĩa) — chỉ áp Không Vong/Xung/Hình/Hại, đã đủ 3/4
// điều kiện được nêu và đều có nguồn tra rõ ràng.
import type { BatTuChart } from "../bat-tu";
import { khongVongIndicesOf } from "../bat-tu";
import { CHI as CHI_LIST } from "../menh-nap-am";
import { coLucXung, chiChuan } from "../bat-tu-engine/engine";
import { docData } from "./content-loader";

type PillarKey = "year" | "month" | "day" | "hour";
interface QuanHeCanChiData {
  lucHai: [string, string][];
  tuongHinh: { tamHinh: string[][]; tuongHinh2Chi: [string, string][]; tuHinh: string[] };
}

export interface LyDoMatTacDung {
  khongVong: boolean;
  xung: boolean;
  hinh: boolean;
  hai: boolean;
  // Chi (ở TRỤ KHÁC) tạo ra quan hệ tương ứng — dùng chi GỐC của lá số để hiển thị/luận. Rỗng nếu
  // không có. Đây là phần chi tiết để Giai đoạn H (và mọi giai đoạn khác) đọc CHUNG, thay vì tự tính
  // lại (bug thật 1/9/2026: H tự so sánh chi RAW không qua chiChuan nên trượt Tị/Tỵ, nói ngược với I/F/L).
  xungVoi: string[];
  hinhVoi: string[];
  haiVoi: string[];
}

/**
 * NGUỒN CHÂN LÝ DUY NHẤT về quan hệ Hình/Xung/Hại/Không Vong theo từng trụ — MỌI giai đoạn (D, F, I,
 * H, và L khi tổng hợp) PHẢI đọc từ đây, KHÔNG tự tính lại. Chuẩn hoá chi qua chiChuan() để không lệ
 * thuộc cách viết Tị/Tỵ trong dữ liệu vs lá số.
 */
export function tinhMatTacDungTheoTru(chart: BatTuChart): Record<PillarKey, LyDoMatTacDung> {
  const quanHe = docData<QuanHeCanChiData>("quan-he-can-chi.json");
  const truList: PillarKey[] = ["year", "month", "day", "hour"];
  const chiTru: Record<PillarKey, string> = { year: chart.year.chi, month: chart.month.chi, day: chart.day.chi, hour: chart.hour.chi };

  // Không Vong tính theo TUẦN CỦA TRỤ NGÀY (quy ước chuẩn — xem than-sat.md mục Không Vong).
  const [kv1, kv2] = khongVongIndicesOf(chart.day.canIndex, chart.day.chiIndex);
  const chiKhongVong = new Set([chiChuan(CHI_LIST[kv1]), chiChuan(CHI_LIST[kv2])]);

  const ket = {} as Record<PillarKey, LyDoMatTacDung>;
  for (const tru of truList) {
    const chiXetChuan = chiChuan(chiTru[tru]);
    // Các trụ khác — giữ CẢ chi gốc (để hiển thị) LẪN chi chuẩn hoá (để đối chiếu dữ liệu).
    const khac = truList.filter((t) => t !== tru).map((t) => ({ goc: chiTru[t], chuan: chiChuan(chiTru[t]) }));

    const khongVong = chiKhongVong.has(chiXetChuan);

    const xungVoi = khac.filter((o) => coLucXung(chiXetChuan, [o.chuan])).map((o) => o.goc);
    const haiVoi = khac
      .filter((o) => quanHe.lucHai.some(([a, b]) => (a === chiXetChuan && b === o.chuan) || (b === chiXetChuan && a === o.chuan)))
      .map((o) => o.goc);

    const hinhVoiSet = new Set<string>();
    for (const bo of quanHe.tuongHinh.tamHinh) {
      if (!bo.includes(chiXetChuan)) continue;
      for (const o of khac) if (o.chuan !== chiXetChuan && bo.includes(o.chuan)) hinhVoiSet.add(o.goc);
    }
    for (const [a, b] of quanHe.tuongHinh.tuongHinh2Chi) {
      for (const o of khac) if ((a === chiXetChuan && b === o.chuan) || (b === chiXetChuan && a === o.chuan)) hinhVoiSet.add(o.goc);
    }
    const tuHinh = quanHe.tuongHinh.tuHinh.includes(chiXetChuan);
    const hinhVoi = [...hinhVoiSet];

    ket[tru] = {
      khongVong,
      xung: xungVoi.length > 0,
      hai: haiVoi.length > 0,
      hinh: hinhVoi.length > 0 || tuHinh,
      xungVoi,
      hinhVoi,
      haiVoi,
    };
  }
  return ket;
}

export function coMatTacDung(l: LyDoMatTacDung): boolean {
  return l.khongVong || l.xung || l.hinh || l.hai;
}

export function moTaLyDo(l: LyDoMatTacDung): string[] {
  const ds: string[] = [];
  if (l.khongVong) ds.push("Không Vong");
  if (l.xung) ds.push("Xung");
  if (l.hinh) ds.push("Hình");
  if (l.hai) ds.push("Hại");
  return ds;
}
