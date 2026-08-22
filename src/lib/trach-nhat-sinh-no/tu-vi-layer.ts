/**
 * VÒNG 4 — Lớp kiểm chứng Tử Vi, đúng `references/04-lop-tu-vi.md`. "Bát Tự chọn NGÀY, Tử Vi chọn
 * GIỜ" — đổi giờ xoay toàn bộ 12 cung. Tái dùng `tinhTuVi()` (đã an đủ Mệnh/Thân/Cục/Tuần-Triệt/
 * chính tinh/sát tinh/tứ hóa — KHÔNG viết lại, khác tài liệu nguồn tưởng phải "chờ phần mềm").
 */
import { tinhTuVi, type TuViChart, type CungKetQua } from "../tu-vi/engine";
import { loadTrachNhatConfig } from "./config";
import type { TuViAnalysis, TuViVetoResult, TuViDaiHanBandItem, RedFlag, CungTuViVM, LuanCung } from "./types";
import type { Gender } from "../bat-tu";

const cuongNhuocLabel = (m: "cuong" | "trung_binh" | "nhuoc"): string =>
  m === "cuong" ? ", thế sao mạnh" : m === "nhuoc" ? ", thế sao yếu" : "";

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

/** Vai trò từng cung với trẻ nhỏ — dùng để viết nhận xét cho phụ huynh đọc. */
const VAI_TRO_CUNG: Record<string, string> = {
  "Mệnh": "tính cách gốc, cách bé nhìn đời và tự định vị bản thân",
  "Tài Bạch": "quan hệ với tiền bạc, khả năng tích lũy khi trưởng thành",
  "Quan Lộc": "đường học hành, sự nghiệp, vị thế xã hội",
  "Thiên Di": "môi trường bên ngoài, cơ hội khi ra khỏi nhà, quý nhân phù trợ",
  "Phu Thê": "đời sống hôn nhân, người bạn đời sau này",
  "Phụ Mẫu": "duyên với cha mẹ, nền tảng được nuôi dạy",
  "Tử Tức": "con cái sau này, cũng phản ánh sức sáng tạo",
  "Tật Ách": "thể trạng, những mặt sức khỏe cần chú ý",
  "Phúc Đức": "phúc phần thừa hưởng, đời sống tinh thần, sự an yên",
};
/** Thứ tự trình bày — Mệnh trước, rồi bộ tam hợp nghề nghiệp, rồi các cung gia đạo. */
const CUNG_QUAN_TRONG = ["Mệnh", "Tài Bạch", "Quan Lộc", "Thiên Di", "Tật Ách", "Phụ Mẫu", "Phúc Đức", "Phu Thê", "Tử Tức"];

/**
 * Chấm điểm + viết nhận xét cho MỘT cung. Điểm -10..10 dùng cho biểu đồ; nhận xét viết cho phụ
 * huynh (không dùng thuật ngữ khô khan, luôn nêu vì sao).
 */
function luanMotCung(cung: CungKetQua, satTinhTen: Set<string>): LuanCung {
  const cat = cung.phuTinh.filter((s) => TRUNG_TINH_CAT.includes(s.name)).map((s) => s.name);
  const sat = cung.phuTinh.filter((s) => satTinhTen.has(s.name)).map((s) => s.name);
  const hoaCat = [...cung.chinhTinh, ...cung.phuTinh].filter((s) => s.tuHoa === "Lộc" || s.tuHoa === "Quyền" || s.tuHoa === "Khoa");
  const hoaKy = [...cung.chinhTinh, ...cung.phuTinh].filter((s) => s.tuHoa === "Kỵ");

  let diem = 0;
  for (const s of cung.chinhTinh) {
    diem += s.trangThai === "Miếu" ? 3 : s.trangThai === "Vượng" ? 2.5 : s.trangThai === "Đắc" ? 1.5 : s.trangThai === "Bình" ? 0 : -2.5;
  }
  if (cung.chinhTinh.length === 0) diem -= 1; // Vô Chính Diệu — không có sao chủ sự
  diem += cat.length * 1.5 - sat.length * 1.5 + hoaCat.length * 2 - hoaKy.length * 2;
  if (cung.tuan || cung.triet) diem -= 2;
  diem = Math.max(-10, Math.min(10, Math.round(diem * 10) / 10));

  const danhGia: LuanCung["danhGia"] = diem >= 2 ? "cat" : diem <= -2 ? "hung" : "binh";
  const chinhTinhStr = cung.chinhTinh.length > 0
    ? cung.chinhTinh.map((s) => `${s.name} (${s.trangThai})`).join(", ")
    : "Vô Chính Diệu";

  const vaiTro = VAI_TRO_CUNG[cung.cungName] ?? cung.cungName;
  const manh: string[] = [];
  const yeu: string[] = [];
  if (cung.chinhTinh.some((s) => s.trangThai === "Miếu" || s.trangThai === "Vượng")) manh.push("chính tinh đắc thế, phát huy tốt");
  if (cung.chinhTinh.some((s) => s.trangThai === "Hãm")) yeu.push("chính tinh hãm địa, khó phát huy");
  if (cung.chinhTinh.length === 0) yeu.push("không có chính tinh chủ sự, dễ chịu ảnh hưởng từ cung đối");
  if (cat.length) manh.push(`có ${cat.join(", ")} trợ lực`);
  if (sat.length) yeu.push(`bị ${sat.join(", ")} quấy`);
  if (hoaCat.length) manh.push(`gặp Hóa ${hoaCat.map((s) => s.tuHoa).join("/")}`);
  if (hoaKy.length) yeu.push("gặp Hóa Kỵ — dễ vướng mắc, trắc trở");
  if (cung.tuan || cung.triet) yeu.push(`có ${cung.tuan ? "Tuần" : ""}${cung.tuan && cung.triet ? "/" : ""}${cung.triet ? "Triệt" : ""} án ngữ — việc hay bị chậm, gián đoạn`);

  const dan = danhGia === "cat" ? "Khá thuận" : danhGia === "hung" ? "Cần lưu ý" : "Bình thường";
  const nhanXet = `${dan} về ${vaiTro}. ${manh.length ? "Điểm mạnh: " + manh.join("; ") + ". " : ""}${yeu.length ? "Điểm yếu: " + yeu.join("; ") + "." : manh.length ? "" : "Không có yếu tố nổi bật theo hướng nào."}`;

  return { cungName: cung.cungName, chiName: cung.chiName, chinhTinh: chinhTinhStr, danhGia, diem, nhanXet };
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
    const luan = luanMotCung(c, satTinhTen);
    const giaiDoan = c.daiVanTuoi[0] < 15 ? "tuổi thơ" : c.daiVanTuoi[0] < 25 ? "học hành, định hướng" : c.daiVanTuoi[0] < 45 ? "lập nghiệp" : "ổn định, tích lũy";
    const mucNhan = luan.diem >= 3 ? "rất thuận" : luan.diem >= 1 ? "thuận" : luan.diem >= -1 ? "bình thường" : luan.diem >= -3 ? "có thử thách" : "nhiều trắc trở";
    daiHan.push({
      tuTuoi: c.daiVanTuoi[0], denTuoi: c.daiVanTuoi[1], cungName: c.cungName,
      soSatTinhTuTap: soSat, bietTuanTriet: c.tuan || c.triet,
      diem: luan.diem,
      nhanXet: `Giai đoạn ${giaiDoan} — vận đi vào cung ${c.cungName} (${luan.chinhTinh}): ${mucNhan}.${c.tuan || c.triet ? " Có Tuần/Triệt án ngữ nên việc dễ chậm, hay đứt đoạn giữa chừng." : ""}${soSat > 0 ? ` Có ${soSat} sát tinh tụ, cần giữ sức khỏe và tránh nóng vội.` : ""}`,
    });
  }

  const tamPhuongTuChinh = chamTamPhuongTuChinh(chart, satTinhTen);

  // 12 cung đầy đủ cho lá số trực quan.
  const cungsVM: CungTuViVM[] = chart.cungs.map((c) => ({
    chiIndex: c.chiIndex, chiName: c.chiName, canName: c.canName, cungName: c.cungName,
    isMenh: c.isMenh, isThan: c.isThan,
    chinhTinh: c.chinhTinh.map((s) => ({ ten: s.name, trangThai: s.trangThai })),
    catTinh: c.phuTinh.filter((s) => TRUNG_TINH_CAT.includes(s.name)).map((s) => s.name),
    satTinh: c.phuTinh.filter((s) => satTinhTen.has(s.name)).map((s) => s.name),
    tuHoa: [...c.chinhTinh, ...c.phuTinh].filter((s) => s.tuHoa).map((s) => ({ ten: s.name, loai: s.tuHoa! })),
    tuan: c.tuan, triet: c.triet, daiVanTuoi: c.daiVanTuoi,
  }));

  // Luận từng cung quan trọng.
  const luanCacCung: LuanCung[] = CUNG_QUAN_TRONG
    .map((ten) => timCung(chart, ten))
    .filter((c): c is CungKetQua => !!c)
    .map((c) => luanMotCung(c, satTinhTen));

  // Kết luận tổng — viết cho phụ huynh, nêu cả mặt được lẫn mặt phải chấp nhận.
  const ketLuan: string[] = [];
  const menhLuan = luanCacCung.find((l) => l.cungName === "Mệnh");
  if (menhLuan) {
    ketLuan.push(`Cung Mệnh tại ${menh.chiName} có ${menhLuan.chinhTinh}${cuongNhuocLabel(chamCuongNhuoc(menh))} — ${menhLuan.danhGia === "cat" ? "nền tảng tính cách thuận lợi" : menhLuan.danhGia === "hung" ? "tính cách có mặt cần uốn nắn từ nhỏ" : "tính cách ở mức trung bình, phần lớn do giáo dục định hình"}.`);
  }
  const cungCat = luanCacCung.filter((l) => l.danhGia === "cat");
  const cungHung = luanCacCung.filter((l) => l.danhGia === "hung");
  if (cungCat.length > 0) ketLuan.push(`Mặt thuận: ${cungCat.map((l) => l.cungName).join(", ")} — đây là các mảng bé có sẵn lợi thế.`);
  if (cungHung.length > 0) ketLuan.push(`Mặt cần lưu tâm: ${cungHung.map((l) => l.cungName).join(", ")} — không phải "xấu cố định", nhưng là chỗ gia đình nên đầu tư nâng đỡ sớm.`);
  else ketLuan.push("Không cung nào rơi vào mức xấu rõ rệt — lá số tương đối đều.");
  ketLuan.push(`Thân cư ${THAN_CU_LABEL[thanCu] ?? thanCu} — trọng tâm cuộc đời nghiêng về ${VAI_TRO_CUNG[thanCu] ?? "mảng này"}.`);
  const hanTot = daiHan.filter((h) => h.diem >= 1);
  const hanXau = daiHan.filter((h) => h.diem <= -2);
  if (hanTot.length) ketLuan.push(`Vận trình: giai đoạn thuận rơi vào ${hanTot.map((h) => `${h.tuTuoi}–${h.denTuoi}t`).join(", ")}.`);
  if (hanXau.length) ketLuan.push(`Giai đoạn cần cẩn trọng: ${hanXau.map((h) => `${h.tuTuoi}–${h.denTuoi}t`).join(", ")} — nên chuẩn bị trước, không nên khởi sự lớn vào đúng các mốc này.`);

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
    cungs: cungsVM,
    luanCacCung,
    ketLuan,
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
  // CHUỖI Tuần/Triệt LIÊN TIẾP ở giai đoạn trưởng thành (~25-65 tuổi) — anh Công phát hiện 22/8/2026:
  // lá số có 4 hạn liên tiếp dính Tuần/Triệt vẫn được xếp hạng 1 vì mỗi hạn chỉ trừ điểm nhẹ. Ba hạn
  // liên tiếp trở lên là "cuộc đời khá vất vả" — phải thành cờ đỏ, không chỉ trừ điểm.
  let chuoiDaiNhat = 0;
  let chuoiHienTai = 0;
  let chuoiTu = 0;
  let chuoiDen = 0;
  let tamTu = 0;
  for (const h of daiHan) {
    if (h.bietTuanTriet) {
      if (chuoiHienTai === 0) tamTu = h.tuTuoi;
      chuoiHienTai++;
      if (chuoiHienTai > chuoiDaiNhat) { chuoiDaiNhat = chuoiHienTai; chuoiTu = tamTu; chuoiDen = h.denTuoi; }
    } else {
      chuoiHienTai = 0;
    }
  }
  if (chuoiDaiNhat >= 3) {
    redFlags.push({ source: "ziwei", severity: "critical", code: "ZW_CHUOI_TUAN_TRIET_DAI", title: `${chuoiDaiNhat} Đại Hạn LIÊN TIẾP trùng Tuần/Triệt (${chuoiTu}–${chuoiDen} tuổi)`, explanation: `Tuần/Triệt kéo dài liên tục suốt ${chuoiDen - chuoiTu + 1} năm ở giai đoạn trưởng thành — cuộc đời nhiều trắc trở, không nên chọn khi còn phương án khác.` });
  }

  // BƯỚC 3/5 — Chính tinh thủ Mệnh HÃM ĐỊA. Tài liệu 04-lop-tu-vi.md §3: "Chính tinh thủ Mệnh
  // miếu/vượng/đắc/hãm — hãm địa TRỪ NẶNG". Trước đây chỉ dùng để cộng/trừ điểm chọn giờ, không
  // hiện thành cờ, nên câu chốt "không có cờ đỏ chính" bỏ sót lá Mệnh Tham Lang hãm.
  const chinhTinhHam = menh.chinhTinh.filter((s) => s.trangThai === "Hãm").map((s) => s.name);
  if (chinhTinhHam.length > 0 && chinhTinhHam.length === menh.chinhTinh.length) {
    redFlags.push({ source: "ziwei", severity: "high", code: "ZW_CHINH_TINH_MENH_HAM", title: `Chính tinh thủ Mệnh hãm địa: ${chinhTinhHam.join(", ")}`, explanation: "Toàn bộ chính tinh tại cung Mệnh đều ở thế hãm — sao chủ mệnh không phát huy được, trừ nặng theo quy trình Tử Vi." });
  }

  return { chart, analysis, redFlags };
}
