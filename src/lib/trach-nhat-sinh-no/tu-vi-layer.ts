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

/** Trung tinh CÁT dùng cho Tam Phương Tứ Chính — đúng danh sách Bước 4 `quy-trinh-chon-gio-sinh-mo-tu-vi.md`. */
const TRUNG_TINH_CAT = ["Thiên Khôi", "Thiên Việt", "Tả Phù", "Hữu Bật", "Văn Xương", "Văn Khúc", "Lộc Tồn"];

function timCung(chart: TuViChart, ten: string): CungKetQua | undefined {
  return chart.cungs.find((c) => c.cungName === ten);
}

/**
 * BƯỚC 4 — Tam Phương Tứ Chính của Mệnh: Mệnh + Thiên Di (đối cung) + Tài Bạch + Quan Lộc (2 tam
 * hợp). Đếm cát tinh / sát tinh / Hóa Lộc-Quyền-Khoa trên CẢ 4 cung, không chỉ riêng Mệnh.
 *
 * Vị trí: đối cung = +6, tam hợp = ±4 so với chiIndex cung Mệnh (chuẩn Tử Vi, không phụ thuộc tên
 * cung — dùng chỉ số Chi để không lệ thuộc cách đặt tên cung của engine).
 */
function chamTamPhuongTuChinh(chart: TuViChart, satTinhTen: Set<string>) {
  const idxMenh = chart.menhChiIndex;
  const viTri = [
    { idx: idxMenh, ten: "Mệnh" },
    { idx: (idxMenh + 6) % 12, ten: "Thiên Di (đối cung)" },
    { idx: (idxMenh + 4) % 12, ten: "Tam hợp 1" },
    { idx: (idxMenh + 8) % 12, ten: "Tam hợp 2" },
  ];
  let soCatTinh = 0;
  let soSatTinh = 0;
  let soHoaCat = 0; // Hóa Lộc/Quyền/Khoa
  let soHoaKy = 0;
  const chiTiet: string[] = [];
  for (const { idx, ten } of viTri) {
    const cung = chart.cungs[idx];
    if (!cung) continue;
    const cat = cung.phuTinh.filter((s) => TRUNG_TINH_CAT.includes(s.name)).map((s) => s.name);
    const sat = cung.phuTinh.filter((s) => satTinhTen.has(s.name)).map((s) => s.name);
    const hoaCat = [...cung.chinhTinh, ...cung.phuTinh].filter((s) => s.tuHoa === "Lộc" || s.tuHoa === "Quyền" || s.tuHoa === "Khoa").length;
    const hoaKy = [...cung.chinhTinh, ...cung.phuTinh].filter((s) => s.tuHoa === "Kỵ").length;
    soCatTinh += cat.length; soSatTinh += sat.length; soHoaCat += hoaCat; soHoaKy += hoaKy;
    if (cat.length || sat.length || hoaCat || hoaKy) {
      chiTiet.push(`${ten} (${cung.cungName}): ${[cat.length ? `cát ${cat.join("/")}` : "", sat.length ? `sát ${sat.join("/")}` : "", hoaCat ? `${hoaCat} Hóa cát` : "", hoaKy ? `${hoaKy} Hóa Kỵ` : ""].filter(Boolean).join(", ")}`);
    }
  }
  return { soCatTinh, soSatTinh, soHoaCat, soHoaKy, chiTiet };
}

/**
 * BƯỚC 5 (phần cuối) — Cường/Nhược của Mệnh và Thân theo mức đắc/hãm chính tinh. Tài liệu: "Mệnh
 * cường Thân cường là tổ hợp tốt nhất". Vô Chính Diệu coi là nhược (không có chính tinh chủ sự).
 */
function chamCuongNhuoc(cung: CungKetQua | undefined): "cuong" | "trung_binh" | "nhuoc" {
  if (!cung || cung.chinhTinh.length === 0) return "nhuoc";
  const manh = cung.chinhTinh.some((s) => s.trangThai === "Miếu" || s.trangThai === "Vượng");
  const dac = cung.chinhTinh.some((s) => s.trangThai === "Đắc");
  const ham = cung.chinhTinh.every((s) => s.trangThai === "Hãm");
  if (manh) return "cuong";
  if (ham) return "nhuoc";
  return dac ? "cuong" : "trung_binh";
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

  const tamPhuongTuChinh = chamTamPhuongTuChinh(chart, satTinhTen);

  const analysis: TuViAnalysis = {
    cungMenh: menh.chiName,
    cungThan: than?.chiName ?? "—",
    than_cu: THAN_CU_LABEL[thanCu] ?? thanCu,
    cuc: chart.cucName,
    tuoiKhoiHan: chart.cucSo,
    chinhTinhMenh: menh.chinhTinh.map((s) => ({ ten: s.name, trangThai: s.trangThai })),
    tamPhuongTuChinh,
    cuongNhuocMenh: chamCuongNhuoc(menh),
    cuongNhuocThan: chamCuongNhuoc(than),
    veto,
    daiHan,
  };

  // Red flags theo quy tắc phủ quyết §1 04-lop-tu-vi.md + Bước 7 quy-trinh-chon-gio-sinh-mo-tu-vi.md.
  const redFlags: RedFlag[] = [];
  // ⚠️ NGOẠI LỆ VÔ CHÍNH DIỆU (Bước 7 tài liệu mới): "nếu Mệnh là VCD, Tuần/Triệt tại đó lại CẦN
  // THIẾT để giữ cách VCD thuần (không phá) — xem lại nguyên tắc VCD TRƯỚC KHI loại". Hai tài liệu
  // mâu thuẫn ở điểm này (04-lop-tu-vi.md coi VCD+Tuần/Triệt là nặng nhất); theo tài liệu MỚI và
  // chi tiết hơn: KHÔNG loại, chỉ hạ xuống mức lưu ý để anh Công đối chiếu.
  if (menhBiTuanTriet && menhVoChinhDieu) {
    redFlags.push({ source: "ziwei", severity: "medium", code: "ZW_VCD_TUAN_TRIET_NGOAI_LE", title: "Mệnh Vô Chính Diệu có Tuần/Triệt", explanation: "Theo quy trình Tử Vi 8 bước: với Mệnh Vô Chính Diệu, Tuần/Triệt tại Mệnh lại CẦN để giữ cách VCD thuần — không loại, nhưng cần thầy đối chiếu kỹ trước khi chốt." });
  } else if (menhBiTuanTriet) {
    redFlags.push({ source: "ziwei", severity: "critical", code: "ZW_MENH_TUAN_TRIET", title: "Cung Mệnh rơi vào Tuần/Triệt", explanation: "Khi được quyền chọn, không có lý do chọn lá số Mệnh bị án ngữ Tuần/Triệt." });
  }
  if (tatAchBiTuanTriet) redFlags.push({ source: "ziwei", severity: "high", code: "ZW_TAT_ACH_TUAN_TRIET", title: "Cung Tật Ách bị Tuần/Triệt", explanation: "Ưu tiên loại nếu khung còn phương án khác — Tật Ách quan trọng hàng đầu với trẻ sơ sinh." });
  if (phuMauBiTuanTriet) redFlags.push({ source: "ziwei", severity: "medium", code: "ZW_PHU_MAU_TUAN_TRIET", title: "Cung Phụ Mẫu bị Tuần/Triệt", explanation: "Loại nếu khung còn phương án khác." });
  if (satTinhHoiMenh.length >= cfg.tu_vi_veto.so_sat_tinh_toi_thieu_de_loai) {
    redFlags.push({ source: "ziwei", severity: "critical", code: "ZW_SAT_TINH_HOI_MENH", title: `${satTinhHoiMenh.length} sát tinh hội Mệnh (${satTinhHoiMenh.join(", ")})`, explanation: `≥${cfg.tu_vi_veto.so_sat_tinh_toi_thieu_de_loai} sát tinh hội Mệnh → loại.` });
  }
  if (hoaKyThuMenh) redFlags.push({ source: "ziwei", severity: "high", code: "ZW_HOA_KY_MENH", title: "Hóa Kỵ thủ Mệnh", explanation: "Tránh Hóa Kỵ đóng tại cung Mệnh." });
  if (hoaKyThuTatAch) redFlags.push({ source: "ziwei", severity: "high", code: "ZW_HOA_KY_TAT_ACH", title: "Hóa Kỵ thủ Tật Ách", explanation: "Tránh Hóa Kỵ đóng tại cung Tật Ách." });

  // BƯỚC 4 — Tam Phương Tứ Chính: "loại hoặc hạ điểm ứng viên có nhiều sát tinh hội tụ tại đây mà
  // KHÔNG có cát tinh cứu" (nhiều = từ 3 sát tinh trở lên trên cả 4 cung, không có trung tinh cát).
  if (tamPhuongTuChinh.soSatTinh >= 3 && tamPhuongTuChinh.soCatTinh === 0) {
    redFlags.push({ source: "ziwei", severity: "critical", code: "ZW_TPTC_SAT_KHONG_CUU", title: `Tam Phương Tứ Chính có ${tamPhuongTuChinh.soSatTinh} sát tinh mà không cát tinh cứu`, explanation: `Xét đủ 4 cung Mệnh–Di–Tài–Quan: ${tamPhuongTuChinh.chiTiet.join("; ")}.` });
  }

  // BƯỚC 6 — Đại Vận đầu đời (trọng số cao nhất: bé đi qua 2-3 đại vận đầu trước khi tự chủ).
  // "Tránh Đại Vận đầu đi vào Hung cách hoặc trùng Tuần/Triệt (ảnh hưởng suốt 10 năm)".
  const daiHanDauBiTuanTriet = daiHan.slice(0, 2).filter((h) => h.bietTuanTriet);
  if (daiHanDauBiTuanTriet.length >= 2) {
    redFlags.push({ source: "ziwei", severity: "high", code: "ZW_DAI_HAN_DAU_TUAN_TRIET", title: "Cả 2 Đại Hạn đầu đời đều trùng Tuần/Triệt", explanation: `Giai đoạn ${daiHanDauBiTuanTriet.map((h) => `${h.tuTuoi}-${h.denTuoi}t`).join(", ")} — bao trùm tuổi thơ và thanh niên, trọng số cao nhất theo quy trình Tử Vi.` });
  }

  return { chart, analysis, redFlags };
}
