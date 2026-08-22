/**
 * VÒNG 4 — Lớp kiểm chứng Tử Vi, đúng `references/04-lop-tu-vi.md`. "Bát Tự chọn NGÀY, Tử Vi chọn
 * GIỜ" — đổi giờ xoay toàn bộ 12 cung. Tái dùng `tinhTuVi()` (đã an đủ Mệnh/Thân/Cục/Tuần-Triệt/
 * chính tinh/sát tinh/tứ hóa — KHÔNG viết lại, khác tài liệu nguồn tưởng phải "chờ phần mềm").
 */
import { tinhTuVi, type TuViChart, type CungKetQua } from "../tu-vi/engine";
import { loadTrachNhatConfig } from "./config";
import type { TuViAnalysis, TuViVetoResult, TuViDaiHanBandItem, RedFlag } from "./types";
import type { Gender } from "../bat-tu";

const THAN_CU_LABEL: Record<string, string> = {
  "Mệnh": "Mệnh", "Quan Lộc": "Quan Lộc", "Phúc Đức": "Phúc Đức",
  "Tài Bạch": "Tài Bạch", "Thiên Di": "Thiên Di", "Phu Thê": "Phu Thê",
};

function timCung(chart: TuViChart, ten: string): CungKetQua | undefined {
  return chart.cungs.find((c) => c.cungName === ten);
}

export function chamLopTuVi(input: { day: number; month: number; year: number; hourRepr: number; gender: Gender }): {
  chart: TuViChart;
  analysis: TuViAnalysis;
  redFlags: RedFlag[];
} {
  const cfg = loadTrachNhatConfig();
  const chart = tinhTuVi({ day: input.day, month: input.month, year: input.year, hour: input.hourRepr, gender: input.gender });

  const menh = chart.cungs[chart.menhChiIndex]!;
  const than = chart.cungs[chart.thanChiIndex];
  const tatAch = timCung(chart, "Tật Ách");
  const phuMau = timCung(chart, "Phụ Mẫu");
  const thanCu = than?.cungName ?? "—";

  const menhBiTuanTriet = menh.tuan || menh.triet;
  const tatAchBiTuanTriet = !!tatAch && (tatAch.tuan || tatAch.triet);
  const phuMauBiTuanTriet = !!phuMau && (phuMau.tuan || phuMau.triet);

  const satTinhTen = new Set(cfg.tu_vi_veto.sat_tinh_ten);
  const satTinhHoiMenh = menh.phuTinh.filter((s) => satTinhTen.has(s.name)).map((s) => s.name);

  const hoaKyThuMenh = menh.chinhTinh.some((s) => s.tuHoa === "Kỵ") || menh.phuTinh.some((s) => s.tuHoa === "Kỵ");
  const hoaKyThuTatAch = !!tatAch && (tatAch.chinhTinh.some((s) => s.tuHoa === "Kỵ") || tatAch.phuTinh.some((s) => s.tuHoa === "Kỵ"));
  const menhVoChinhDieu = menh.chinhTinh.length === 0;

  const veto: TuViVetoResult = {
    menhBiTuanTriet, tatAchBiTuanTriet, phuMauBiTuanTriet,
    soSatTinhHoiMenh: satTinhHoiMenh.length, satTinhHoiMenh,
    hoaKyThuMenh, hoaKyThuTatAch, menhVoChinhDieu,
  };

  // Đại Hạn — 6 hạn đầu (phủ ~0-65 tuổi tùy tuổi khởi hạn), để đối chiếu song song với 6 Đại Vận Bát
  // Tự. Tài liệu (05-dai-van-dai-han.md §5) chỉ YÊU CẦU chấm 3 hạn đầu (~0-40 tuổi) làm tiêu chí
  // lọc, nhưng hiển thị thêm cho gia đình dễ hình dung cả chặng đời — phần lọc/xếp hạng vẫn chỉ dựa
  // trên các hạn đầu. Engine đã tính sẵn daiVanTuoi đúng chiều thuận/nghịch theo âm dương nam nữ.
  const daiHan: TuViDaiHanBandItem[] = [];
  const cungTheoTuoi = [...chart.cungs].filter((c) => c.daiVanTuoi[0] >= 0).sort((a, b) => a.daiVanTuoi[0] - b.daiVanTuoi[0]).slice(0, 6);
  for (const c of cungTheoTuoi) {
    const soSat = c.phuTinh.filter((s) => satTinhTen.has(s.name)).length;
    daiHan.push({ tuTuoi: c.daiVanTuoi[0], denTuoi: c.daiVanTuoi[1], cungName: c.cungName, soSatTinhTuTap: soSat, bietTuanTriet: c.tuan || c.triet });
  }

  const analysis: TuViAnalysis = {
    cungMenh: menh.chiName,
    cungThan: than?.chiName ?? "—",
    than_cu: THAN_CU_LABEL[thanCu] ?? thanCu,
    cuc: chart.cucName,
    tuoiKhoiHan: chart.cucSo,
    chinhTinhMenh: menh.chinhTinh.map((s) => ({ ten: s.name, trangThai: s.trangThai })),
    veto,
    daiHan,
  };

  // Red flags theo quy tắc phủ quyết §1 04-lop-tu-vi.md.
  const redFlags: RedFlag[] = [];
  if (menhBiTuanTriet) redFlags.push({ source: "ziwei", severity: "critical", code: "ZW_MENH_TUAN_TRIET", title: "Cung Mệnh rơi vào Tuần/Triệt", explanation: "Khi được quyền chọn, không có lý do chọn lá số Mệnh bị án ngữ Tuần/Triệt." });
  if (tatAchBiTuanTriet) redFlags.push({ source: "ziwei", severity: "high", code: "ZW_TAT_ACH_TUAN_TRIET", title: "Cung Tật Ách bị Tuần/Triệt", explanation: "Ưu tiên loại nếu khung còn phương án khác — Tật Ách quan trọng hàng đầu với trẻ sơ sinh." });
  if (phuMauBiTuanTriet) redFlags.push({ source: "ziwei", severity: "medium", code: "ZW_PHU_MAU_TUAN_TRIET", title: "Cung Phụ Mẫu bị Tuần/Triệt", explanation: "Loại nếu khung còn phương án khác." });
  if (satTinhHoiMenh.length >= cfg.tu_vi_veto.so_sat_tinh_toi_thieu_de_loai) {
    redFlags.push({ source: "ziwei", severity: "critical", code: "ZW_SAT_TINH_HOI_MENH", title: `${satTinhHoiMenh.length} sát tinh hội Mệnh (${satTinhHoiMenh.join(", ")})`, explanation: `≥${cfg.tu_vi_veto.so_sat_tinh_toi_thieu_de_loai} sát tinh hội Mệnh → loại.` });
  }
  if (hoaKyThuMenh) redFlags.push({ source: "ziwei", severity: "high", code: "ZW_HOA_KY_MENH", title: "Hóa Kỵ thủ Mệnh", explanation: "Tránh Hóa Kỵ đóng tại cung Mệnh." });
  if (hoaKyThuTatAch) redFlags.push({ source: "ziwei", severity: "high", code: "ZW_HOA_KY_TAT_ACH", title: "Hóa Kỵ thủ Tật Ách", explanation: "Tránh Hóa Kỵ đóng tại cung Tật Ách." });
  if (menhVoChinhDieu && menhBiTuanTriet) redFlags.push({ source: "ziwei", severity: "critical", code: "ZW_VCD_TUAN_TRIET", title: "Vô Chính Diệu gặp Tuần/Triệt", explanation: "Tổ hợp nặng nhất trong nhóm Vô Chính Diệu." });

  return { chart, analysis, redFlags };
}
