/**
 * VÒNG 2 — Lọc cứng L1–L8, đúng `references/02-bo-loc-cung.md`. Nhị phân, loại thẳng, không chấm
 * điểm/không bù trừ. Tái dùng `tinhBatTu()` (lập lá số, không viết lại) + bảng tra + hàm của
 * `bat-tu-engine/engine.ts` (đã export thêm để dùng chung, không nhân bản logic).
 */
import { tinhBatTu, type BatTuChart, type Gender } from "../bat-tu";
import {
  hanhCan, hanhChi, hanhSinhCho, coLucXung, pheCua, tinhVuongSuy, TANG, TAM_HOP, TAM_HOI,
  type Hanh, type TuTruInput,
} from "../bat-tu-engine/engine";
import { loadTrachNhatConfig } from "./config";
import type { BirthCandidate, HardFilterReason } from "./types";

export interface HardFilterOutcome {
  chart: BatTuChart;
  reasons: HardFilterReason[]; // rỗng = qua hết
}

const HANH_5: Hanh[] = ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"];

/** Toàn bộ ngũ hành có mặt (chính khí Can/Chi + tàng can) trong tứ trụ — dùng cho L4 + L8. */
function tapNguHanhCoMat(chart: BatTuChart): Set<Hanh> {
  const s = new Set<Hanh>();
  for (const tru of [chart.year, chart.month, chart.day, chart.hour]) {
    s.add(hanhCan(tru.can));
    s.add(hanhChi(tru.chi));
    for (const t of tru.tangCan) s.add(hanhCan(t.can));
  }
  return s;
}

/** Nhật Can có thông căn ở bất kỳ chi nào không (bản khí hoặc tàng can bất kỳ, chưa xét chất lượng). */
function coCan(chart: BatTuChart): boolean {
  const nhatChuHanh = hanhCan(chart.day.can);
  return [chart.year, chart.month, chart.day, chart.hour].some((tru) =>
    tru.tangCan.some((t) => hanhCan(t.can) === nhatChuHanh),
  );
}

/** Hành X có "căn" (làm bản khí — tàng can đầu tiên — ở bất kỳ chi nào) không — dùng cho L8 dấu hiệu 3. */
function hanhCoCanBanKhi(hanh: Hanh, chart: BatTuChart): boolean {
  return [chart.year, chart.month, chart.day, chart.hour].some((tru) => hanhCan(tru.tangCan[0]?.can ?? "") === hanh);
}

/** Trọng số 1 hành trên toàn cục: chính khí (tàng can[0]) = 1.0, dư/trung khí = 0.4 (theo config L8). */
function trongSoNguHanh(chart: BatTuChart, wChinhKhi: number, wPhu: number): Record<Hanh, number> {
  const w: Record<Hanh, number> = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
  for (const tru of [chart.year, chart.month, chart.day, chart.hour]) {
    w[hanhCan(tru.can)] += 1; // thiên can thấu, tính như chính khí
    tru.tangCan.forEach((t, i) => { w[hanhCan(t.can)] += i === 0 ? wChinhKhi : wPhu; });
  }
  return w;
}

export function locCungL1L8(input: {
  date: BirthCandidate["date"];
  hourRepr: number;
  chiGio: string;
  gender: Gender;
}): HardFilterOutcome {
  const cfg = loadTrachNhatConfig();
  const chart = tinhBatTu({ day: input.date.day, month: input.date.month, year: input.date.year, hour: input.hourRepr, gender: input.gender });
  const reasons: HardFilterReason[] = [];

  // L1 — Trụ ngày xung trụ tháng → loại cả ngày.
  if (coLucXung(chart.day.chi, [chart.month.chi])) {
    reasons.push({ code: "L1", title: "Trụ ngày xung trụ tháng", explanation: `Chi ngày ${chart.day.chi} xung Chi tháng ${chart.month.chi} — loại cả ngày này (mọi giờ).` });
  }
  // L2 — Trụ ngày xung trụ giờ → loại giờ đó.
  if (coLucXung(chart.day.chi, [chart.hour.chi])) {
    reasons.push({ code: "L2", title: "Trụ ngày xung trụ giờ", explanation: `Chi ngày ${chart.day.chi} xung Chi giờ ${chart.hour.chi}.` });
  }
  // L3 — Nhật Can vô căn.
  if (!coCan(chart)) {
    reasons.push({ code: "L3", title: "Nhật Can vô căn", explanation: `Can ngày ${chart.day.can} (${hanhCan(chart.day.can)}) không có địa chi nào tàng chứa cùng hành.` });
  }
  // L4 — Không đủ 5 hành (kể cả tàng can).
  // ⚠️ Tiêu chí 2 nguyên văn: "Tứ trụ gốc đủ cả 5 hành LÀ TỐT NHẤT" — là mong muốn lý tưởng, không
  // phải điều kiện loại. Khi `L4_bat_buoc_du_5_hanh` = false thì không loại nữa; hành khuyết vẫn bị
  // trừ điểm ở lĩnh vực Sức khỏe (benh-tat.md §Nguyên tắc nền (a)).
  const tapHanh = tapNguHanhCoMat(chart);
  if (tapHanh.size < 5 && (cfg.hard_filters.L4_bat_buoc_du_5_hanh ?? true)) {
    const thieu = HANH_5.filter((h) => !tapHanh.has(h));
    reasons.push({ code: "L4", title: "Tứ trụ không đủ 5 hành", explanation: `Thiếu hành: ${thieu.join(", ")} (tính cả tàng can).` });
  }
  // L5 — Trụ giờ xung trụ tháng.
  // ⚠️ KHÔNG NẰM TRONG 9 TIÊU CHÍ. Tiêu chí 6 nguyên văn chỉ nói "TRỤ NGÀY không xung trụ giờ và trụ
  // tháng" (đó là L1 + L2) — hoàn toàn không nhắc "trụ giờ xung trụ tháng". Config gốc cũng tự đánh
  // ⚠️ "quy ước, cùng lý L1". Cùng lối xử lý đã áp cho L4/L7: không loại nữa (xung giờ–tháng không
  // động trực tiếp tới Nhật Chủ), chuyển thành TRỪ ĐIỂM ở lĩnh vực Gia đạo vì Trụ Tháng là cung cha
  // mẹ/anh em (`luc-than.md` §0). Đặt `L5_bat_buoc_khong_xung_gio_thang` = true để siết lại như cũ.
  if (coLucXung(chart.hour.chi, [chart.month.chi]) && (cfg.hard_filters.L5_bat_buoc_khong_xung_gio_thang ?? true)) {
    reasons.push({ code: "L5", title: "Trụ giờ xung trụ tháng", explanation: `Chi giờ ${chart.hour.chi} xung Chi tháng ${chart.month.chi} (quy ước ⚠️, cùng lý do L1).` });
  }
  // L6 — Giờ Tý. TẮT mặc định từ 27/8/2026 (xem config._note_L6): lý do "bệnh viện không mổ" đã mất
  // hiệu lực khi anh Công chốt chấm đủ 12 canh giờ; lý do còn lại (mốc đổi ngày) là vấn đề XÁC ĐỊNH
  // lá số chứ không phải lá số xấu → giữ lại và cảnh báo, không loại.
  if (cfg.hard_filters.L6_loai_gio_ty && input.chiGio === "Tý") {
    reasons.push({ code: "L6", title: "Giờ Tý (23h–01h)", explanation: "Mốc đổi ngày nhạy cảm — loại theo cấu hình (tắt được qua config)." });
  }
  // L7 — Không có Ấn tinh trong nguyên cục (phải có mặt VÀ có căn).
  const nhatChuHanh = hanhCan(chart.day.can);
  const anHanh = hanhSinhCho(nhatChuHanh);
  const anCoMat = tapHanh.has(anHanh);
  const anCoCan = hanhCoCanBanKhi(anHanh, chart);
  // ⚠️ Tiêu chí 8 nguyên văn: "Phải có Ấn trong nhà (Ấn tinh CÓ MẶT ngay trong nguyên cục)" — chỉ
  // yêu cầu CÓ MẶT. Yêu cầu "và có căn" là diễn giải chặt thêm của module (thủ phạm loại nhiều nhất,
  // ~45%). Khi `L7_bat_buoc_an_co_can` = false thì chỉ loại khi Ấn VẮNG MẶT hẳn; Ấn có mặt mà không
  // căn vẫn bị trừ điểm ở lĩnh vực Gia đạo (luc-than.md §0 "Ấn tinh thiếu chỗ dựa").
  const batBuocAnCoCan = cfg.hard_filters.L7_bat_buoc_an_co_can ?? true;
  if (!anCoMat || (batBuocAnCoCan && !anCoCan)) {
    reasons.push({ code: "L7", title: "Không có Ấn tinh trong nguyên cục", explanation: `Ấn (hành ${anHanh}) ${!anCoMat ? "không có mặt" : "có mặt nhưng không có căn (chỉ thấu can trơ trọi hoặc chỉ ở dư/trung khí)"} trong tứ trụ.` });
  }
  // L8 — Vùng nghi ngờ Tòng Cách, chạm 1 trong 4 dấu hiệu → loại.
  const w = trongSoNguHanh(chart, cfg.L8_tong_cach_nghi_ngo.trong_so_chinh_khi, cfg.L8_tong_cach_nghi_ngo.trong_so_du_trung_khi);
  const tongW = Object.values(w).reduce((s, v) => s + v, 0) || 1;
  const hanhManhNhat = HANH_5.reduce((best, h) => (w[h] > w[best] ? h : best), HANH_5[0]!);
  const tyLeManhNhat = (w[hanhManhNhat] / tongW) * 100;
  if (tyLeManhNhat >= cfg.L8_tong_cach_nghi_ngo.mot_hanh_chiem_toi_thieu_phan_tram) {
    reasons.push({ code: "L8", title: "Nghi ngờ Tòng Cách — 1 hành chiếm ưu thế tuyệt đối", explanation: `Hành ${hanhManhNhat} chiếm ${Math.round(tyLeManhNhat)}% trọng số toàn cục (ngưỡng ${cfg.L8_tong_cach_nghi_ngo.mot_hanh_chiem_toi_thieu_phan_tram}%) — khoanh vùng nghi Tòng, loại theo nguyên tắc thà bỏ sót.` });
  }
  // Dấu hiệu 2 — Nhật Chủ VÔ CĂN HOÀN TOÀN, đồng thời hành KHẮC (Quan Sát) hoặc hành TIẾT (Thực
  // Thương) của Nhật Chủ ĐẮC LỆNH (nắm Chi tháng). Phân biệt đúng phe bằng pheCua(), không đọc thô.
  if (!coCan(chart)) {
    const hanhNguyetLenh = hanhChi(chart.month.chi);
    const pheNguyetLenh = pheCua(hanhNguyetLenh, nhatChuHanh);
    if (pheNguyetLenh === "quan_sat" || pheNguyetLenh === "thuc_thuong") {
      reasons.push({ code: "L8", title: "Nghi ngờ Tòng Cách — vô căn mà hành khắc/tiết đắc lệnh", explanation: `Nhật Chủ vô căn hoàn toàn, đồng thời Chi tháng ${chart.month.chi} (${hanhNguyetLenh}) thuộc ${pheNguyetLenh === "quan_sat" ? "Quan Sát (khắc)" : "Thực Thương (tiết)"} và đang nắm lệnh — khoanh vùng nghi Tòng.` });
    }
  }
  // Dấu hiệu 3 — Nhật Chủ đủ điều kiện VƯỢNG mà trong cục KHÔNG có Quan Sát lẫn Thực Thương nào có
  // căn (không gì tiết/khắc bớt). Gọi thẳng tinhVuongSuy() của bat-tu-engine (thuần công thức, rẻ)
  // thay vì chờ tới bước chấm cấu trúc — để giữ đúng thứ tự "lọc cứng trước" của tài liệu.
  {
    const ttL8: TuTruInput = {
      nam: { can: chart.year.can, chi: chart.year.chi },
      thang: { can: chart.month.can, chi: chart.month.chi },
      ngay: { can: chart.day.can, chi: chart.day.chi },
      gio: { can: chart.hour.can, chi: chart.hour.chi },
      gioiTinh: input.gender,
    };
    const vs = tinhVuongSuy(ttL8);
    const laVuong = ["Vượng", "Cường vượng", "Cực cường"].includes(vs.capDo);
    if (laVuong) {
      const hanhQuanSat = HANH_5.find((h) => pheCua(h, nhatChuHanh) === "quan_sat");
      const hanhThucThuong = HANH_5.find((h) => pheCua(h, nhatChuHanh) === "thuc_thuong");
      const quanSatCoCan = !!hanhQuanSat && hanhCoCanBanKhi(hanhQuanSat, chart);
      const thucThuongCoCan = !!hanhThucThuong && hanhCoCanBanKhi(hanhThucThuong, chart);
      if (!quanSatCoCan && !thucThuongCoCan) {
        reasons.push({ code: "L8", title: "Nghi ngờ Tòng Cách — thân vượng mà không có gì tiết/khắc", explanation: `Nhật Chủ ${vs.capDo.toLowerCase()} nhưng trong cục không có Quan Sát (${hanhQuanSat}) lẫn Thực Thương (${hanhThucThuong}) nào có căn — khoanh vùng nghi Tòng Vượng.` });
      }
    }
  }
  // Dấu hiệu 4: tam hợp/tam hội TRỌN 3 chi, hành cục không phải hành nhật chủ.
  const chiTuTru = [chart.year.chi, chart.month.chi, chart.day.chi, chart.hour.chi];
  for (const [bo, hoaHanh] of [...Object.entries(TAM_HOP), ...Object.entries(TAM_HOI)]) {
    const chisBo = bo.split("-");
    const coDu3 = chisBo.every((c) => chiTuTru.includes(c));
    if (coDu3 && hoaHanh !== nhatChuHanh) {
      reasons.push({ code: "L8", title: "Nghi ngờ Tòng Cách — đủ cục Tam Hợp/Tam Hội", explanation: `Đủ 3 chi tạo cục ${bo} (hành ${hoaHanh}), khác hành Nhật Chủ (${nhatChuHanh}) — khoanh vùng nghi Tòng.` });
    }
  }

  return { chart, reasons };
}
