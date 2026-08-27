// Tầng Free — KHÔNG gọi AI, thuần code điền vào câu mẫu cố định (xem content/bat-tu/prompts/free-template.md).
// Mở tự do, không cần đăng nhập, không giới hạn số lần, chi phí ~0.
import type { BatTuChart } from "../bat-tu";
import { tinhLuuNien } from "../bat-tu";
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

  // ─ Bản mệnh Nạp Âm — người Việt quen gọi mệnh theo Nạp Âm ("Hải Trung Kim") hơn cả Nhật Chủ, nên
  //   đặt ngay đầu để khách nhận ra lá số của chính mình. Lấy từ Trụ Năm (bat-tu.ts đã tính sẵn).
  const banMenh = `${chart.year.napAm} (${chart.year.napAmElement})`;

  // ─ Cấu trúc Ngũ Hành: hành nào dày, hành nào khuyết. Đây là thứ khách tự nhìn đồ hình cũng thấy,
  //   nói ra bằng lời giúp họ hiểu vì sao Dụng Thần lại là hành đó.
  const dem: Record<Hanh, number> = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
  for (const tru of [chart.year, chart.month, chart.day, chart.hour]) {
    dem[hanhCan(tru.can)]++;
    dem[hanhChi(tru.chi)]++;
  }
  const hanhSapXep = (Object.keys(dem) as Hanh[]).sort((a, b) => dem[b] - dem[a]);
  const hanhDay = hanhSapXep.filter((h) => dem[h] >= 3);
  const hanhKhuyet = hanhSapXep.filter((h) => dem[h] === 0);
  const cauNguHanh = [
    hanhDay.length > 0 ? `Trong tứ trụ, hành ${hanhDay.join(" và ")} chiếm phần nhiều` : "Ngũ hành trong tứ trụ phân bố khá đều",
    hanhKhuyet.length > 0 ? `, còn thiếu hẳn ${hanhKhuyet.join(", ")}` : "",
    ". ",
    hanhKhuyet.length > 0
      ? "Hành thiếu không có nghĩa là xấu — điều đáng quan tâm là vận sau này có bù vào được hay không, phần đó nằm trong bản luận đầy đủ."
      : "Ngũ hành tương đối đủ mặt là nền tảng thuận lợi để khí lưu thông.",
  ].join("");

  // ─ Thần Sát CÁT nổi bật — tái dùng `chart.thanSat` (35 sao engine đã an sẵn), KHÔNG tự tra lại.
  //   Cố ý chỉ nêu CÁT THẦN ở bản miễn phí: hung thần cần xét đủ điều kiện hóa giải (Không Vong,
  //   hình/xung/hại...) mới kết luận được — nói nửa vời dễ làm khách lo sợ vô cớ, trái nguyên tắc
  //   đạo đức trong `than-sat.md` (§Nguyên tắc 2-3) và không tử tế với người đọc.
  // ⚠️ Tên sao trong `chart.thanSat` có thể kèm hậu tố nguồn tra, ví dụ "Thiên Ất (năm)" hay
  // "Hồng Diễm (năm)" — phải cắt phần trong ngoặc trước khi đối chiếu. Phát hiện khi chạy thử trên
  // lá số thật: bản đầu khớp chuỗi cứng nên BỎ SÓT "Thiên Ất (năm)", đúng cát thần mạnh nhất.
  const CAT_THAN_DE_HIEU: Record<string, string> = {
    "Thiên Ất": "gặp việc khó thường có người giúp đỡ đúng lúc — cát tinh quý nhất trong Bát Tự",
    "Thiên Đức": "tâm tính hiền hòa, hay gặp may trong lúc ngặt",
    "Nguyệt Đức": "được che chở, việc dữ thường hóa lành",
    "Thiên Xá": "gặp hung hóa cát, lỡ sai cũng dễ được lượng thứ",
    "Thái Cực": "thông minh hiếu học, có duyên với học thuật và tâm linh",
    "Văn Xương": "sáng dạ, hợp đường học hành thi cử",
    "Học Đường": "có duyên với sách vở, nghiên cứu",
    "Từ Quán": "hợp nghề giảng dạy, chữ nghĩa",
    "Quốc Ấn": "thành thực đáng tin, có thể nắm giữ trọng trách",
    "Tướng Tinh": "có khí chất thủ lĩnh, dễ được giao việc lớn",
    "Hồng Loan": "đường tình duyên có nhiều tin vui",
    "Thiên Hỷ": "hay gặp chuyện đáng mừng",
    "Kim Dư": "được hưởng phúc phần vật chất, đời sống dễ chịu",
    "Thiên Y": "có duyên với nghề chữa bệnh, sức khỏe được phù trợ",
    "Lộc Thần": "có lộc ăn, tự nuôi được thân",
    "Dịch Mã": "đời năng động, hợp việc đi lại giao thương",
    "Phúc Tinh": "chủ phúc khí bình an, sống thong dong",
  };
  /** Bỏ hậu tố nguồn tra: "Thiên Ất (năm)" → "Thiên Ất". */
  const tenGoc = (sao: string) => sao.replace(/\s*\(.*\)\s*$/, "").trim();
  const catThanCoTrongLaSo: string[] = [];
  for (const tru of ["year", "month", "day", "hour"] as const) {
    for (const sao of chart.thanSat[tru] ?? []) {
      const g = tenGoc(sao);
      if (CAT_THAN_DE_HIEU[g] && !catThanCoTrongLaSo.includes(g)) catThanCoTrongLaSo.push(g);
    }
  }
  const cauThanSat = catThanCoTrongLaSo.length > 0
    ? `Lá số có ${catThanCoTrongLaSo.slice(0, 4).map((s) => `${s} (${CAT_THAN_DE_HIEU[s]})`).join("; ")}.`
      + (catThanCoTrongLaSo.length > 4 ? ` Ngoài ra còn ${catThanCoTrongLaSo.length - 4} cát tinh khác nữa.` : "")
    : "Phần Thần Sát của lá số này cần xét kỹ từng trụ mới kết luận được, có trong bản luận đầy đủ.";

  // ─ Vận hiện tại — thuận hay cần thận trọng so với Dụng/Hỷ/Kỵ/Cừu Thần. Tái dùng đúng công thức
  //   chấm điểm của đồ hình free (`diemHanhTheoDungThan`, định nghĩa bên dưới nhưng gọi được nhờ
  //   hoisting) — KHÔNG thêm tri thức mới, chỉ diễn giải bằng lời một con số đã tính sẵn. Cố ý dùng
  //   từ nhẹ ("cần thận trọng hơn") thay vì "xấu" cho vận điểm âm — tránh kết luận nặng nề khi bản
  //   free chưa xét đủ Lưu Niên chồng lên Đại Vận (nguyên tắc như với Thần Sát: không nói nửa vời).
  const namNay = new Date().getFullYear();
  const vanHienTai = chart.daiVan.find((v, i) => {
    const ketThuc = chart.daiVan[i + 1]?.startDate.y ?? Infinity;
    return namNay >= v.startDate.y && namNay < ketThuc;
  });
  const cauVanHienTai = (() => {
    if (!vanHienTai) return "";
    const diem = (diemHanhTheoDungThan(hanhCan(vanHienTai.can), dungThan) + diemHanhTheoDungThan(hanhChi(vanHienTai.chi), dungThan)) / 2;
    const nhanXet =
      diem > 0 ? "đang thiên về chiều thuận với Dụng/Hỷ Thần — nhìn chung là giai đoạn dễ phát huy"
      : diem < 0 ? "đang thiên về chiều Kỵ/Cừu Thần — không có nghĩa là xấu hẳn, nhưng nên cẩn trọng hơn ở giai đoạn này, cần xét thêm từng Lưu Niên mới rõ"
      : "trung tính, không nghiêng hẳn về chiều nào";
    return `\n\nVận hiện tại (${vanHienTai.can} ${vanHienTai.chi}, ${vanHienTai.startAge}-${vanHienTai.endAge} tuổi) ${nhanXet}. Bản luận giải đầy đủ đọc chi tiết từng Đại Vận và Lưu Niên từng năm trong giai đoạn này.`;
  })();

  return [
    `Bản mệnh của bạn là ${banMenh}. Nhật Chủ — tức chính bản thân bạn trong lá số — là ${canNgay} (${hanhCanNgay}, ${amDuongCanNgay}), hiện ở mức ${nhanCapDoVuongSuy}.`,
    "",
    cauTheoCapDo,
    "",
    cauNguHanh,
    "",
    `Dụng Thần phù hợp với lá số này là hành ${tenDungThan} — ${cauGoiYNganTheoHanh}`,
    "",
    `✦ Sao tốt trong lá số: ${cauThanSat}`,
    cauVanHienTai,
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

export interface DoHinhLuuNienDiem {
  year: number;
  tuoi: number;
  can: string;
  chi: string;
  /** -1..1: điểm thô như daiVan, so hành Can/Chi năm với Dụng/Hỷ/Kỵ/Cừu Thần NGUYÊN CỤC — bản đầy đủ tính lại theo đúng Đại Vận của từng năm. */
  diem: number;
}

export interface DoHinhFree {
  tuTru: DoHinhTuTru[];
  nguHanhPhanBo: Record<Hanh, number>;
  diemVuongSuy: number;
  daiVan: DoHinhDaiVanDiem[];
  luuNien: DoHinhLuuNienDiem[];
}

const SO_NAM_LUU_NIEN_FREE = 5;

const TEN_TRU: Record<"year" | "month" | "day" | "hour", string> = {
  year: "Năm", month: "Tháng", day: "Ngày", hour: "Giờ",
};

/** Điểm thô 1 hành so với Dụng/Hỷ/Kỵ/Cừu Thần — dùng riêng cho đồ hình free, không thay thế luận giải AI. */
function diemHanhTheoDungThan(hanh: Hanh, dungThan: BatTuAnalysis["dungThan"]): number {
  if (hanh === dungThan.dungThan || hanh === dungThan.hyThan) return 1;
  if (hanh === dungThan.kyThan || hanh === dungThan.cuuThan) return -1;
  return 0;
}

/** Dữ liệu cho các đồ hình ở tầng Free: donut Ngũ Hành, gauge Vượng Suy, đường sóng Đại Vận, dải Lưu Niên. Thuần code, không gọi AI (nguyên tắc: free không tốn chi phí AI). */
export function taoDuLieuDoHinhFree(chart: BatTuChart, analysis: BatTuAnalysis, namSinh: number): DoHinhFree {
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

  const namNay = new Date().getFullYear();
  const luuNien: DoHinhLuuNienDiem[] = tinhLuuNien(namNay, namSinh, SO_NAM_LUU_NIEN_FREE).map((n) => ({
    year: n.year,
    tuoi: n.tuoi,
    can: n.can,
    chi: n.chi,
    diem: (diemHanhTheoDungThan(hanhCan(n.can), analysis.dungThan) + diemHanhTheoDungThan(hanhChi(n.chi), analysis.dungThan)) / 2,
  }));

  return { tuTru, nguHanhPhanBo, diemVuongSuy: analysis.vuongSuy.diem, daiVan, luuNien };
}
