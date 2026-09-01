// TẦNG 1 — FINDINGS ENGINE cho 7 giai đoạn Luận Cơ Bản: A, B, C, G, H, J (L không cần tra cứu riêng,
// AI tự tổng hợp từ 6 giai đoạn còn lại — xem ai-narrative.ts).
//
// Nguyên tắc: CHỈ xác định sự thật cấu trúc (structural findings), KHÔNG viết văn. Đọc lại
// content/bat-tu/data/ (Loại 1) — không hardcode nội dung diễn giải.
import type { BatTuChart, PillarInfo } from "../bat-tu";
import { CHI_NGU_HANH, CAN_NGU_HANH } from "../bat-tu";
import type { BatTuAnalysis, Hanh } from "../bat-tu-engine/engine";
import { coLucXung } from "../bat-tu-engine/engine";
import { docData } from "./content-loader";
import type { GiaiDoanFindings } from "./types";

interface DungThanData {
  ngheNghiepTheoHanh: Record<Hanh, string[]>;
  phuongHuongMauSac: Record<Hanh, { phuong: string; mauSac: string[] }>;
}
interface QuanHeCanChiData {
  lucHai: [string, string][];
  tuongHinh: { tamHinh: string[][]; tuongHinh2Chi: [string, string][]; tuHinh: string[] };
}

const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI_NAMES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

export function hyKyCuaHanh(h: Hanh, dt: BatTuAnalysis["dungThan"]): "dung_than" | "hy_than" | "ky_than" | "cuu_than" | "trung_tinh" {
  if (h === dt.dungThan) return "dung_than";
  if (h === dt.hyThan) return "hy_than";
  if (h === dt.kyThan) return "ky_than";
  if (h === dt.cuuThan) return "cuu_than";
  return "trung_tinh";
}

/**
 * Hành mà Điều Hậu gợi ý thêm, suy trực tiếp từ nội dung `dieuHauNote` (bat-tu-engine/engine.ts chỉ
 * ghi 2 dạng câu cố định: "...thêm Hỏa để điều hậu" cho sinh mùa Đông, "...thêm Thủy để điều hậu"
 * cho sinh mùa Hè) — không tính lại mùa sinh ở đây, tránh trùng logic với engine.
 */
function dieuHauHanhGoiY(dieuHauNote: string | undefined): Hanh | null {
  if (!dieuHauNote) return null;
  if (dieuHauNote.includes("thêm Hỏa")) return "Hỏa";
  if (dieuHauNote.includes("thêm Thủy")) return "Thủy";
  return null;
}

// --- A. Nền tảng ---
export function findingsA(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings {
  const { vuongSuy, dungThan } = analysis;

  // Phát hiện Phù Ức và Điều Hậu chỉ ra 2 hướng khác nhau (vd Kỵ/Cừu Thần theo Phù Ức lại đúng là
  // hành Điều Hậu gợi ý thêm do sinh mùa lạnh/nóng) — bug thật 1/9/2026: trước đây in cả dieuHauNote
  // lẫn Kỵ Thần cạnh nhau mà không giải thích, đọc lên như tự mâu thuẫn. Nguyên tắc ưu tiên (đúng
  // dung-than.md): Phù Ức là chính, Điều Hậu chỉ bổ sung song song KHI không mâu thuẫn — nếu mâu
  // thuẫn thì Phù Ức vẫn thắng, nhưng Tầng 2 AI PHẢI giải thích rõ 1 câu vì sao (xem huongDanRieng
  // Giai đoạn A trong ai-narrative.ts).
  const hanhDieuHauGoiY = dieuHauHanhGoiY(dungThan.dieuHauNote);
  const xungDotDieuHau = hanhDieuHauGoiY !== null && (hanhDieuHauGoiY === dungThan.kyThan || hanhDieuHauGoiY === dungThan.cuuThan);

  return {
    maGiaiDoan: "A",
    tenGiaiDoan: "Nền tảng",
    ketQua: {
      tuTru: (["year", "month", "day", "hour"] as const).map((k) => ({ tru: k, can: chart[k].can, chi: chart[k].chi })),
      nhatChu: { can: chart.day.can, hanh: chart.nhatChu.nguHanh, amDuong: chart.nhatChu.amDuong },
      vuongSuy: { capDo: vuongSuy.capDo, diem: vuongSuy.diem, nhom: vuongSuy.nhom, dacLenh: vuongSuy.dacLenh },
      dungThan: { phuongPhap: dungThan.phuongPhap, dungThan: dungThan.dungThan, hyThan: dungThan.hyThan, kyThan: dungThan.kyThan, cuuThan: dungThan.cuuThan, dieuHauNote: dungThan.dieuHauNote ?? null },
      xungDotDieuHau,
      ...(xungDotDieuHau
        ? { dieuHauLyDoUuTien: `Điều Hậu gợi ý thêm ${hanhDieuHauGoiY}, nhưng hành này lại trùng Kỵ/Cừu Thần theo Phù Ức — nguyên tắc dung-than.md: Phù Ức là chính, Điều Hậu chỉ bổ sung song song khi KHÔNG mâu thuẫn, nên Dụng Thần vẫn chốt theo Phù Ức (${dungThan.dungThan}).` }
        : {}),
      // Cách Cục CHƯA code hóa điều kiện (nguồn: content-bat-tu/README "phần chưa làm") — để Tầng 2
      // AI tự đọc knowledge/cach-cuc.md + cach-cuc-dac-biet.md và tự nhận định, không ép code sai.
      cachCuc: { chuaXacDinh: true, ghiChu: "AI tự đọc cach-cuc.md/cach-cuc-dac-biet.md để nhận định, dựa trên vượng suy + Dụng Thần đã có." },
    },
    canCu: ["bat-tu-engine (vuongSuy, dungThan)", "knowledge/cach-cuc.md", "knowledge/cach-cuc-dac-biet.md", "knowledge/dung-than.md (nguyên tắc ưu tiên Phù Ức)"],
  };
}

// --- B. Tính cách ---
export function findingsB(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings {
  const chis = [chart.year.chi, chart.month.chi, chart.day.chi, chart.hour.chi];
  const cans = [chart.year.can, chart.month.can, chart.day.can, chart.hour.can];

  const dem: Record<Hanh, number> = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
  for (const c of cans) dem[CAN_NGU_HANH[CAN_NAMES.indexOf(c)]]++;
  for (const c of chis) dem[CHI_NGU_HANH[CHI_NAMES.indexOf(c)]]++;
  const tong = cans.length + chis.length;
  const tyTrongNguHanh = Object.fromEntries(Object.entries(dem).map(([h, n]) => [h, Math.round((n / tong) * 1000) / 10]));

  // Chi nổi bật nhất = chi xuất hiện nhiều lần nhất trong tứ trụ (đồng hạng thì ưu tiên Chi trụ Ngày — cung mệnh).
  const demChi = new Map<string, number>();
  for (const c of chis) demChi.set(c, (demChi.get(c) ?? 0) + 1);
  let chiNoiBat = chart.day.chi;
  let maxCount = 0;
  for (const [chi, n] of demChi) {
    if (n > maxCount || (n === maxCount && chi === chart.day.chi)) { maxCount = n; chiNoiBat = chi; }
  }

  return {
    maGiaiDoan: "B",
    tenGiaiDoan: "Tính cách",
    ketQua: {
      nhatChu: { can: chart.day.can, hanh: chart.nhatChu.nguHanh, amDuong: chart.nhatChu.amDuong },
      capDoVuongSuy: analysis.vuongSuy.capDo,
      tyTrongNguHanh,
      chiNoiBat: { chi: chiNoiBat, soLanXuatHien: maxCount, laChiTruNgay: chiNoiBat === chart.day.chi },
    },
    canCu: ["knowledge/tinh-cach-nhat-nguyen.md", "knowledge/tuong-y-can-chi.md"],
  };
}

// --- C. Thập Thần theo cung ---
export function findingsC(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings {
  const { dungThan } = analysis;
  const truList = (["year", "month", "day", "hour"] as const).map((k) => {
    const p: PillarInfo = chart[k];
    const hanhCan = CAN_NGU_HANH[CAN_NAMES.indexOf(p.can)];
    return {
      tru: k,
      can: p.can,
      thapThanCan: p.thapThan,
      hyKyCan: k === "day" ? "nhat_chu" : hyKyCuaHanh(hanhCan, dungThan),
      tangCan: p.tangCan.map((tc) => ({
        can: tc.can,
        thapThan: tc.thapThan,
        hyKy: hyKyCuaHanh(CAN_NGU_HANH[CAN_NAMES.indexOf(tc.can)], dungThan),
      })),
    };
  });

  return {
    maGiaiDoan: "C",
    tenGiaiDoan: "Thập Thần theo cung",
    ketQua: {
      truList,
      // 6 Thập Thần chuyên sâu (không tính Nhật Chủ/Tỷ Kiên vốn là chính mình) — đánh dấu có tài
      // liệu riêng để Tầng 2 tham chiếu đúng phần liên quan trong thap-than.md.
      coTaiLieuSau: ["Kiếp Tài", "Thực Thần", "Thương Quan", "Chính Tài", "Thiên Tài", "Chính Quan", "Thất Sát", "Chính Ấn", "Thiên Ấn"],
    },
    canCu: ["knowledge/thap-than.md"],
  };
}

// --- G. Nghề nghiệp/Tài/Quan/Công Danh ---
export function findingsG(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings {
  const data = docData<DungThanData>("dung-than-nghe-nghiep-phuong-huong.json");
  const dt = analysis.dungThan;
  return {
    maGiaiDoan: "G",
    tenGiaiDoan: "Nghề nghiệp / Tài / Quan / Công danh",
    ketQua: {
      dungThan: dt.dungThan,
      hyThan: dt.hyThan,
      nganhNghePhuHop: data.ngheNghiepTheoHanh[dt.dungThan] ?? [],
      nganhNghePhuHopTheoHyThan: data.ngheNghiepTheoHanh[dt.hyThan] ?? [],
      phuongHuongMauSac: data.phuongHuongMauSac[dt.dungThan] ?? null,
      cachCucChuaXacDinh: true,
      luuY: "Nghề nghiệp/phương hướng là gợi ý theo hành, không phải quy tắc cứng.",
    },
    canCu: ["data/dung-than-nghe-nghiep-phuong-huong.json", "knowledge/dung-than.md", "knowledge/tai-van.md", "knowledge/quan-van.md"],
  };
}

// --- H. Hôn nhân (mẫu computable: vị trí Thê Tài/Quan Sát + quan hệ với cung phối ngẫu = Chi trụ Ngày) ---
export function findingsH(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings {
  const quanHe = docData<QuanHeCanChiData>("quan-he-can-chi.json");
  const gioiTinh = chart.gender;
  const cungPhoiNgau = chart.day.chi; // Chi trụ Ngày = "cung phối ngẫu" theo quy ước Tử Bình.
  const cacChiKhac = [chart.year.chi, chart.month.chi, chart.hour.chi];

  // Nam xem Tài (Thê Tài/Chính Tài + Thiên Tài), Nữ xem Quan Sát (Chính Quan/Thất Sát).
  const thapThanCanXet = gioiTinh === "Nam" ? ["Chính Tài", "Thiên Tài"] : ["Chính Quan", "Thất Sát"];
  const viTriXuatHien: { tru: string; can: string; thapThan: string; laTangCan: boolean }[] = [];
  for (const key of ["year", "month", "day", "hour"] as const) {
    const p = chart[key];
    if (key !== "day" && thapThanCanXet.includes(p.thapThan)) viTriXuatHien.push({ tru: key, can: p.can, thapThan: p.thapThan, laTangCan: false });
    for (const tc of p.tangCan) if (thapThanCanXet.includes(tc.thapThan)) viTriXuatHien.push({ tru: key, can: tc.can, thapThan: tc.thapThan, laTangCan: true });
  }

  const bixung = coLucXung(cungPhoiNgau, cacChiKhac);
  const biHai = quanHe.lucHai.some(([a, b]) => (a === cungPhoiNgau && cacChiKhac.includes(b)) || (b === cungPhoiNgau && cacChiKhac.includes(a)));
  const tamHinhList = quanHe.tuongHinh.tamHinh.filter((bo) => bo.includes(cungPhoiNgau)).flatMap((bo) => bo.filter((c) => cacChiKhac.includes(c)));

  return {
    maGiaiDoan: "H",
    tenGiaiDoan: "Hôn nhân",
    ketQua: {
      gioiTinh,
      cungPhoiNgau,
      thapThanChinhXet: gioiTinh === "Nam" ? "Tài (Chính Tài/Thiên Tài)" : "Quan Sát (Chính Quan/Thất Sát)",
      viTriXuatHien,
      cungPhoiNgauBiXung: bixung,
      cungPhoiNgauBiHai: biHai,
      cungPhoiNgauThamGiaTamHinh: tamHinhList.length > 0 ? tamHinhList : null,
    },
    canCu: ["knowledge/hon-nhan.md", "data/quan-he-can-chi.json"],
  };
}

// --- J. Ngũ hành thực hành ---
export function findingsJ(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings {
  const data = docData<DungThanData>("dung-than-nghe-nghiep-phuong-huong.json");
  const dt = analysis.dungThan;
  return {
    maGiaiDoan: "J",
    tenGiaiDoan: "Ngũ hành thực hành",
    ketQua: {
      dungThan: { hanh: dt.dungThan, ...data.phuongHuongMauSac[dt.dungThan] },
      hyThan: { hanh: dt.hyThan, ...data.phuongHuongMauSac[dt.hyThan] },
      kyThan: { hanh: dt.kyThan },
    },
    canCu: ["data/dung-than-nghe-nghiep-phuong-huong.json"],
  };
}

export function taoFindingsCoBan(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings[] {
  return [findingsA(chart, analysis), findingsB(chart, analysis), findingsC(chart, analysis), findingsG(chart, analysis), findingsH(chart, analysis), findingsJ(chart, analysis)];
}
