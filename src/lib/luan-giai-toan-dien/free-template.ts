// Tầng Free — KHÔNG gọi AI, thuần code điền vào câu mẫu cố định (xem content/bat-tu/prompts/free-template.md).
// Mở tự do, không cần đăng nhập, không giới hạn số lần, chi phí ~0.
import type { BatTuChart } from "../bat-tu";
import type { BatTuAnalysis, Hanh, CapDo } from "../bat-tu-engine/engine";
import { hanhCan, hanhChi } from "../bat-tu-engine/engine";
import { docData } from "./content-loader";

interface DungThanData {
  ngheNghiepTheoHanh: Record<Hanh, string[]>;
  phuongHuongMauSac: Record<Hanh, { phuong: string; mauSac: string[] }>;
}

const NHAN_CAP_DO: Record<CapDo, string> = {
  "Cực cường": "rất mạnh, gần như áp đảo",
  "Cường vượng": "khá mạnh",
  "Vượng": "mạnh vừa phải",
  "Trung hòa": "cân bằng",
  "Suy": "hơi yếu",
  "Nhược": "khá yếu, cần thêm trợ lực",
  "Cực nhược": "rất yếu, cần nương theo thế khác để cân bằng",
};

const CAU_MANH: Record<"vuong" | "trung_hoa" | "nhuoc", string> = {
  vuong: "Nhìn chung bạn là người có nội lực mạnh, chủ động, có xu hướng tự quyết định hướng đi của mình.",
  trung_hoa: "Đây là mức cân bằng dễ chịu — bạn thường không thiên lệch quá về một xu hướng nào.",
  nhuoc: "Ở mức này, bạn thường phát huy tốt hơn khi có thêm sự hỗ trợ/đồng hành từ người khác hoặc từ đúng thời điểm.",
};

function nhomCapDo(capDo: CapDo): "vuong" | "trung_hoa" | "nhuoc" {
  if (capDo === "Vượng" || capDo === "Cường vượng" || capDo === "Cực cường") return "vuong";
  if (capDo === "Trung hòa") return "trung_hoa";
  return "nhuoc";
}

export function taoGoiMoFree(chart: BatTuChart, analysis: BatTuAnalysis): string {
  const dungThanData = docData<DungThanData>("dung-than-nghe-nghiep-phuong-huong.json");
  const { vuongSuy, dungThan } = analysis;

  const canNgay = chart.day.can;
  const hanhCanNgay = chart.nhatChu.nguHanh;
  const amDuongCanNgay = chart.nhatChu.amDuong;
  const nhanCapDoVuongSuy = NHAN_CAP_DO[vuongSuy.capDo] ?? vuongSuy.capDo;
  const cauTheoCapDo = CAU_MANH[nhomCapDo(vuongSuy.capDo)];
  const tenDungThan = dungThan.dungThan;

  const nganh = dungThanData.ngheNghiepTheoHanh[tenDungThan] ?? [];
  const phuongMau = dungThanData.phuongHuongMauSac[tenDungThan];
  const cauGoiYNganTheoHanh =
    nganh.length > 0 && phuongMau
      ? `hợp với các lĩnh vực ${nganh.slice(0, 3).join(", ")} — và phương ${phuongMau.phuong}, màu ${phuongMau.mauSac.slice(0, 2).join("/")} thường mang lại cảm giác thuận lợi hơn cho bạn.`
      : "gợi ý ngành nghề/phương hướng cụ thể sẽ có trong bản luận giải đầy đủ.";

  const cauKeuGoiNangCap = "bấm \"Xem luận giải đầy đủ\" để khám phá trọn vẹn lá số của bạn.";

  return [
    `Nhật Chủ của bạn là ${canNgay} (${hanhCanNgay}, ${amDuongCanNgay}), hiện đang ở mức ${nhanCapDoVuongSuy}.`,
    "",
    cauTheoCapDo,
    "",
    `Dụng Thần phù hợp với lá số này là hành ${tenDungThan} — ${cauGoiYNganTheoHanh}`,
    "",
    `Đây mới là phần mở đầu. Bản luận giải đầy đủ sẽ đi sâu vào 12 khía cạnh: tính cách, thần sát, gia đình - lục thân, sự nghiệp - tài vận, hôn nhân, sức khỏe, và trọn vẹn các giai đoạn vận trình từ nhỏ đến già — ${cauKeuGoiNangCap}`,
  ].join("\n");
}

export interface DoHinhTuTru {
  tru: string;
  can: string;
  chi: string;
  hanhCan: Hanh;
  hanhChi: Hanh;
}

export interface DoHinhDaiVanDiem {
  can: string;
  chi: string;
  startAge: number;
  endAge: number;
  /** -1..1: điểm thô theo hành Can/Chi vận so với Dụng/Hỷ (+) hay Kỵ/Cừu (-) Thần — heuristic thuần code, không phải luận giải AI. */
  diem: number;
}

export interface DoHinhFree {
  tuTru: DoHinhTuTru[];
  nguHanhPhanBo: Record<Hanh, number>;
  diemVuongSuy: number;
  daiVan: DoHinhDaiVanDiem[];
}

const TEN_TRU: Record<"year" | "month" | "day" | "hour", string> = {
  year: "Năm", month: "Tháng", day: "Ngày", hour: "Giờ",
};

/** Điểm thô 1 hành so với Dụng/Hỷ/Kỵ/Cừu Thần — dùng riêng cho đồ hình free, không thay thế luận giải AI. */
function diemHanhTheoDungThan(hanh: Hanh, dungThan: BatTuAnalysis["dungThan"]): number {
  if (hanh === dungThan.dungThan || hanh === dungThan.hyThan) return 1;
  if (hanh === dungThan.kyThan || hanh === dungThan.cuuThan) return -1;
  return 0;
}

/** Dữ liệu cho 3 đồ hình ở tầng Free: donut Ngũ Hành, gauge Vượng Suy, đường sóng Đại Vận. Thuần code, không gọi AI. */
export function taoDuLieuDoHinhFree(chart: BatTuChart, analysis: BatTuAnalysis): DoHinhFree {
  const tuTru: DoHinhTuTru[] = (["year", "month", "day", "hour"] as const).map((k) => ({
    tru: TEN_TRU[k], can: chart[k].can, chi: chart[k].chi,
    hanhCan: hanhCan(chart[k].can), hanhChi: hanhChi(chart[k].chi),
  }));

  const nguHanhPhanBo: Record<Hanh, number> = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
  for (const t of tuTru) { nguHanhPhanBo[t.hanhCan]++; nguHanhPhanBo[t.hanhChi]++; }

  const daiVan: DoHinhDaiVanDiem[] = chart.daiVan.map((v) => {
    const diem = (diemHanhTheoDungThan(hanhCan(v.can), analysis.dungThan) + diemHanhTheoDungThan(hanhChi(v.chi), analysis.dungThan)) / 2;
    return { can: v.can, chi: v.chi, startAge: v.startAge, endAge: v.endAge, diem };
  });

  return { tuTru, nguHanhPhanBo, diemVuongSuy: analysis.vuongSuy.diem, daiVan };
}
