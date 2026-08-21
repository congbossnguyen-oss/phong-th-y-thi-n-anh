/**
 * VÒNG 2 — Lọc cứng L1–L8, đúng `references/02-bo-loc-cung.md`. Nhị phân, loại thẳng, không chấm
 * điểm/không bù trừ. Tái dùng `tinhBatTu()` (lập lá số, không viết lại) + bảng tra + hàm của
 * `bat-tu-engine/engine.ts` (đã export thêm để dùng chung, không nhân bản logic).
 */
import { tinhBatTu, type BatTuChart, type Gender } from "../bat-tu";
import {
  hanhCan, hanhChi, hanhSinhCho, coLucXung, TANG, TAM_HOP, TAM_HOI, type Hanh,
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
  const tapHanh = tapNguHanhCoMat(chart);
  if (tapHanh.size < 5) {
    const thieu = HANH_5.filter((h) => !tapHanh.has(h));
    reasons.push({ code: "L4", title: "Tứ trụ không đủ 5 hành", explanation: `Thiếu hành: ${thieu.join(", ")} (tính cả tàng can).` });
  }
  // L5 — Trụ giờ xung trụ tháng (⚠️ quy ước, cùng lý L1 — xem 02-bo-loc-cung.md).
  if (coLucXung(chart.hour.chi, [chart.month.chi])) {
    reasons.push({ code: "L5", title: "Trụ giờ xung trụ tháng", explanation: `Chi giờ ${chart.hour.chi} xung Chi tháng ${chart.month.chi} (quy ước ⚠️, cùng lý do L1).` });
  }
  // L6 — Giờ Tý, mặc định loại (config bật/tắt được).
  if (cfg.hard_filters.L6_loai_gio_ty && input.chiGio === "Tý") {
    reasons.push({ code: "L6", title: "Giờ Tý (23h–01h)", explanation: "Mốc đổi ngày nhạy cảm, bệnh viện gần như không mổ khung này — loại mặc định (bật lại được qua config)." });
  }
  // L7 — Không có Ấn tinh trong nguyên cục (phải có mặt VÀ có căn).
  const nhatChuHanh = hanhCan(chart.day.can);
  const anHanh = hanhSinhCho(nhatChuHanh);
  const anCoMat = tapHanh.has(anHanh);
  const anCoCan = hanhCoCanBanKhi(anHanh, chart);
  if (!anCoMat || !anCoCan) {
    reasons.push({ code: "L7", title: "Không có Ấn tinh có căn trong nguyên cục", explanation: `Ấn (hành ${anHanh}) ${!anCoMat ? "không có mặt" : "có mặt nhưng không có căn (chỉ thấu can trơ trọi hoặc chỉ ở dư/trung khí)"} trong tứ trụ.` });
  }
  // L8 — Vùng nghi ngờ Tòng Cách, chạm 1 trong 4 dấu hiệu → loại.
  const w = trongSoNguHanh(chart, cfg.L8_tong_cach_nghi_ngo.trong_so_chinh_khi, cfg.L8_tong_cach_nghi_ngo.trong_so_du_trung_khi);
  const tongW = Object.values(w).reduce((s, v) => s + v, 0) || 1;
  const hanhManhNhat = HANH_5.reduce((best, h) => (w[h] > w[best] ? h : best), HANH_5[0]!);
  const tyLeManhNhat = (w[hanhManhNhat] / tongW) * 100;
  if (tyLeManhNhat >= cfg.L8_tong_cach_nghi_ngo.mot_hanh_chiem_toi_thieu_phan_tram) {
    reasons.push({ code: "L8", title: "Nghi ngờ Tòng Cách — 1 hành chiếm ưu thế tuyệt đối", explanation: `Hành ${hanhManhNhat} chiếm ${Math.round(tyLeManhNhat)}% trọng số toàn cục (ngưỡng ${cfg.L8_tong_cach_nghi_ngo.mot_hanh_chiem_toi_thieu_phan_tram}%) — khoanh vùng nghi Tòng, loại theo nguyên tắc thà bỏ sót.` });
  } else if (!coCan(chart) && hanhChi(chart.month.chi) !== nhatChuHanh) {
    // Hành khắc (Quan Sát) hoặc hành tiết (Thực Thương) của Nhật Chủ "đắc lệnh" — xấp xỉ bằng Chi
    // tháng thuộc đúng hành đó (đọc thô, không phân biệt khắc/tiết) — đủ cho mục đích KHOANH VÙNG.
    reasons.push({ code: "L8", title: "Nghi ngờ Tòng Cách — vô căn mà hành khác đắc lệnh", explanation: "Nhật Chủ vô căn hoàn toàn, đồng thời Chi tháng không thuộc hành Nhật Chủ (xấp xỉ 'đắc lệnh' của hành khắc/tiết) — khoanh vùng nghi Tòng." });
  }
  // ⚠️ CHƯA TÍCH HỢP (Giai đoạn 1): dấu hiệu 3 của L8 — "Nhật chủ đủ 4 điều kiện vượng VÀ không có
  // Quan Sát/Thực Thương nào có căn" — cần kết quả Vượng Suy 4-điều-kiện đầy đủ (chấm ở
  // structural-bat-tu.ts SAU bước lọc cứng này), nên chưa thể kiểm tra tại đây theo đúng thứ tự
  // vòng lặp. Bỏ sót dấu hiệu này lệch về hướng AN TOÀN hơn theo nguyên tắc "thà bỏ sót còn hơn
  // chọn nhầm" của tài liệu — không phải lỗi im lặng, ghi rõ ở đây để Giai đoạn 2 bổ sung nếu cần.
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
