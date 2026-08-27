/**
 * CHẤM 4 LĨNH VỰC RIÊNG BIỆT — Sức khỏe · Gia đạo · Tài vận · Nhân duyên.
 *
 * ═══ VÌ SAO PHẢI TÁCH RIÊNG (không được dùng 1 điểm tổng) ═══
 * `luan-giai-bat-tu-manh-phai/SKILL.md` nhắc 2 lần, là nguyên tắc bắt buộc của trường phái:
 *   • Bước 6: "kết luận 'phú quý/đại nhân vật' ở bước này chỉ nói về sự nghiệp/tiền bạc — KHÔNG suy
 *     ra sức khỏe/hạnh phúc/gia đình."
 *   • Bước 10: "nếu Công hỏi về hôn nhân/sức khỏe/gia đình, luận riêng bằng Thập Thần lục thân +
 *     Thần Sát, không suy diễn từ mức độ phú quý."
 * Trước 27/8/2026 module chỉ có MỘT điểm cấu trúc (`diemCauTrucBatTu`) thiên về phú quý rồi dùng nó
 * xếp hạng cho mọi mặt — trái thẳng nguyên tắc trên. File này sửa đúng chỗ đó.
 *
 * ═══ NGUỒN TỪNG LĨNH VỰC ═══
 *   • Sức khỏe  → `benh-tat.md` (3 cơ chế sinh bệnh) + Tử Vi bộ Tật Ách
 *   • Tài vận   → `tai-van.md`  (Thân có gánh nổi Tài không) + Tử Vi bộ Tài Bạch
 *   • Gia đạo   → `luc-than.md` (cung vị Trụ Năm/Tháng + Ấn/Tỷ Kiếp) + Tử Vi bộ Phụ Mẫu
 *   • Nhân duyên→ `hon-nhan.md` (Cung Thê/Phu + Tài/Quan Sát theo giới tính) + Tử Vi bộ Phu Thê
 *
 * Mọi quy tắc dưới đây đều trích được về 1 dòng cụ thể trong tài liệu (ghi ở trường `nguon`).
 * KHÔNG có quy tắc nào do tự nghĩ ra. Riêng TRỌNG SỐ SỐ HỌC (mỗi quy tắc đáng mấy điểm) là quy ước
 * của module — tài liệu chỉ phân loại định tính tốt/xấu, không cho con số; xem `_LUU_Y_TRONG_SO`.
 */
import type { BatTuChart, Gender } from "../bat-tu";
import { hanhCan, hanhChi, pheCua, coLucXung, trangThaiTruongSinh, chiChuan, TANG, type Hanh, type Phe } from "../bat-tu-engine/engine";
import type { BaziAnalysis, TuViAnalysis, DiemLinhVuc, CanCuLinhVuc, LinhVucKey, BirthSelectionInput } from "./types";

/**
 * ⚠️ QUY ƯỚC TRỌNG SỐ — đọc trước khi chỉnh.
 * Tài liệu Bát Tự/Tử Vi phân loại ĐỊNH TÍNH (tốt/xấu/rất xấu), không cho thang điểm số. Các con số
 * dưới đây là quy ước để MÁY so sánh được các giờ với nhau, đặt theo nguyên tắc:
 *   • ±2.5 = dấu hiệu tài liệu gọi là quyết định/"nguyên tắc nền" (vd "Thân vượng Tài vượng mới giàu")
 *   • ±1.5 = dấu hiệu tài liệu nêu thành mục riêng, rõ ràng
 *   • ±0.8 = dấu hiệu phụ, tài liệu nhắc thoáng qua
 * CHƯA calibrate trên ca thật — xem `project_module_trach_nhat_sinh_no` (memory) và §CÒN NỢ.
 */
const _LUU_Y_TRONG_SO = "Trọng số là quy ước của module, chưa calibrate trên ca thật.";
const MANH = 2.5, VUA = 1.5, NHE = 0.8;

const NHAN_LINH_VUC: Record<LinhVucKey, string> = {
  suc_khoe: "Sức khỏe",
  gia_dao: "Gia đạo",
  tai_van: "Tài vận",
  nhan_duyen: "Nhân duyên",
};

// ── Đếm Thập Thần ───────────────────────────────────────────────────────────────────────────────
interface DemThapThan {
  /** Tổng "phần" mỗi phe: thấu Can = 2, chính khí Chi = 2, tàng phụ = 1 (cùng thang với `demPhe` engine). */
  phan: Record<Phe, number>;
  /** Phe đó có lộ ra Thiên Can không. */
  thauCan: Record<Phe, boolean>;
  /** Phe đó có mặt ở bản khí (chính khí) của một Chi nào không — tức "có căn". */
  coCan: Record<Phe, boolean>;
  /** Phe đó có mặt ở bất kỳ đâu (kể cả tàng phụ) không. */
  coMat: Record<Phe, boolean>;
}

function demThapThan(chart: BatTuChart): DemThapThan {
  const nhatChu = hanhCan(chart.day.can);
  const rong = (): Record<Phe, number> => ({ ty_kiep: 0, an: 0, thuc_thuong: 0, tai: 0, quan_sat: 0 });
  const rongBool = (): Record<Phe, boolean> => ({ ty_kiep: false, an: false, thuc_thuong: false, tai: false, quan_sat: false });
  const phan = rong(), thauCan = rongBool(), coCan = rongBool(), coMat = rongBool();

  const trus = [
    { tru: chart.year, laNgay: false },
    { tru: chart.month, laNgay: false },
    { tru: chart.day, laNgay: true },
    { tru: chart.hour, laNgay: false },
  ];
  for (const { tru, laNgay } of trus) {
    // Can Ngày chính là Nhật Chủ, không tính là "Tỷ Kiếp thêm".
    if (!laNgay) {
      const p = pheCua(hanhCan(tru.can), nhatChu);
      phan[p] += 2;
      thauCan[p] = true;
      coMat[p] = true;
    }
    (tru.tangCan ?? []).forEach((t, i) => {
      const p = pheCua(hanhCan(t.can), nhatChu);
      phan[p] += i === 0 ? 2 : 1;
      coMat[p] = true;
      if (i === 0) coCan[p] = true;
    });
  }
  return { phan, thauCan, coCan, coMat };
}

const laVuong = (capDo: string) => capDo.includes("Vượng") || capDo.includes("Cường");
const laNhuoc = (capDo: string) => capDo.includes("Nhược") || capDo.includes("Suy");

/** Âm/Dương của 1 Thiên Can — Giáp Bính Mậu Canh Nhâm là Dương. */
const CAN_DUONG = new Set(["Giáp", "Bính", "Mậu", "Canh", "Nhâm"]);

// ── LĨNH VỰC 1: SỨC KHỎE ────────────────────────────────────────────────────────────────────────
/**
 * `benh-tat.md` §Nguyên tắc nền nêu ĐÚNG 3 cơ chế sinh bệnh, cả 3 đều đo được bằng code:
 *   (a) một hành quá vượng hoặc quá suy/khuyết
 *   (b) hai hành tương chiến trực diện
 *   (c) kinh mạch bị nghẽn (khí đến rồi dừng, không lưu thông)
 * Module đã tính sẵn (c) ở `luuThong` nhưng trước đây gộp vào điểm phú quý — nay trả về đúng chỗ.
 */
function chamSucKhoe(bazi: BaziAnalysis, chart: BatTuChart): { diem: number; canCu: CanCuLinhVuc[] } {
  const canCu: CanCuLinhVuc[] = [];
  let d = 0;

  // (c) Kinh mạch lưu thông — cơ chế bệnh thứ 3.
  const soDut = bazi.luuThong.matXichDut.length;
  const soNghen = bazi.luuThong.matXichNghen.length;
  if (soDut === 0 && soNghen === 0) {
    d += MANH;
    canCu.push({ thuanLoi: true, noiDung: "Ngũ hành lưu thông trọn vòng, không mắt xích nào đứt hay nghẽn — khí huyết vận hành thông suốt.", nguon: "benh-tat.md §Nguyên tắc nền (c)" });
  } else {
    if (soDut > 0) {
      d -= Math.min(soDut, 3) * NHE;
      canCu.push({ thuanLoi: false, noiDung: `Thiếu/yếu hành ${bazi.luuThong.matXichDut.join(", ")} — vòng ngũ hành có chỗ hụt, dễ sinh bệnh ở tạng phủ tương ứng.`, nguon: "benh-tat.md §Nguyên tắc nền (a)" });
    }
    if (soNghen > 0) {
      d -= soNghen * VUA;
      canCu.push({ thuanLoi: false, noiDung: `Mắt xích nghẽn tại ${bazi.luuThong.matXichNghen.join(", ")} — khí đến rồi dừng, không chuyển tiếp được.`, nguon: "benh-tat.md §Nguyên tắc nền (c)" });
    }
  }

  // (a) Một hành quá vượng / khuyết hẳn.
  const dem: Record<Hanh, number> = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
  for (const tru of [chart.year, chart.month, chart.day, chart.hour]) {
    dem[hanhCan(tru.can)] += 2;
    (tru.tangCan ?? []).forEach((t, i) => { dem[hanhCan(t.can)] += i === 0 ? 2 : 1; });
  }
  const tong = Object.values(dem).reduce((s, x) => s + x, 0) || 1;
  const hanhTroi = (Object.keys(dem) as Hanh[]).find((h) => dem[h] / tong >= 0.45);
  const hanhKhuyet = (Object.keys(dem) as Hanh[]).filter((h) => dem[h] === 0);
  if (hanhTroi) {
    d -= MANH;
    canCu.push({ thuanLoi: false, noiDung: `Hành ${hanhTroi} chiếm quá nửa mệnh cục — một hành quá vượng, dễ mất cân bằng tạng phủ.`, nguon: "benh-tat.md §Nguyên tắc nền (a)" });
  }
  if (hanhKhuyet.length > 0) {
    d -= hanhKhuyet.length * NHE;
    canCu.push({ thuanLoi: false, noiDung: `Khuyết hẳn hành ${hanhKhuyet.join(", ")} — vùng cơ thể ứng với hành này thiếu lực bẩm sinh.`, nguon: "benh-tat.md §Nguyên tắc nền (a)" });
  }

  // (b) Hai hành tương chiến trực diện: cả hai cùng thấu Can và mạnh, không có hành thông quan đủ lực.
  const chuoiCoMat = new Map(bazi.luuThong.chuoi.map((c) => [c.hanh, c.viTri]));
  const KHAC: Record<Hanh, Hanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };
  const SINH: Record<Hanh, Hanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
  for (const a of Object.keys(KHAC) as Hanh[]) {
    const b = KHAC[a];
    const aManh = chuoiCoMat.get(a) === "thau_can" && dem[a] >= 4;
    const bManh = chuoiCoMat.get(b) === "thau_can" && dem[b] >= 4;
    const thongQuan = SINH[a]; // a sinh thongQuan, thongQuan sinh b → hóa được thế khắc
    const tqDuLuc = (chuoiCoMat.get(thongQuan) === "thau_can" || chuoiCoMat.get(thongQuan) === "chinh_khi");
    if (aManh && bManh && !tqDuLuc) {
      d -= VUA;
      canCu.push({ thuanLoi: false, noiDung: `${a} và ${b} cùng mạnh mà khắc nhau trực diện, thiếu ${thongQuan} đứng giữa hóa giải.`, nguon: "benh-tat.md §Nguyên tắc nền (b)" });
      break; // chỉ tính cặp nặng nhất, tránh trừ chồng
    }
  }

  // Thân quá nhược — sức đề kháng nền yếu (vuong-suy.md phân cấp; benh-tat §4.1 buộc xác định vượng suy trước).
  if (bazi.vuongSuy.includes("Cực nhược")) {
    d -= MANH;
    canCu.push({ thuanLoi: false, noiDung: "Nhật Chủ cực nhược — nền thể trạng mỏng, cần đặc biệt chú ý nuôi dưỡng giai đoạn đầu đời.", nguon: "vuong-suy.md §5 + benh-tat.md §4.1" });
  } else if (bazi.vuongSuy === "Trung hòa") {
    d += VUA;
    canCu.push({ thuanLoi: true, noiDung: "Nhật Chủ trung hòa — không thiên lệch, nền thể trạng cân đối.", nguon: "vuong-suy.md §5" });
  }

  // Tự hình / tam hình — benh-tat §4.5 xếp hình/xung vào nhóm dấu hiệu tổn thương thân thể.
  if (bazi.tuHinhTuTruHinh.length > 0) {
    d -= bazi.tuHinhTuTruHinh.length * VUA;
    canCu.push({ thuanLoi: false, noiDung: `Có ${bazi.tuHinhTuTruHinh.join("; ")} — hình trong tứ trụ, dễ ứng vào thương tổn/phẫu thuật.`, nguon: "benh-tat.md §4.5 + than-sat.md §Huyết Nhẫn" });
  }
  return { diem: d, canCu };
}

// ── LĨNH VỰC 2: TÀI VẬN ─────────────────────────────────────────────────────────────────────────
/**
 * `tai-van.md` §Nguyên tắc nền: "điều kiện cốt lõi luôn là Thân phải đủ vượng để gánh nổi Tài —
 * Thân vượng Tài vượng mới thực sự giàu; Thân nhược mà Tài nhiều là 'tài đa thân nhược', gặp Tài
 * lại thành tai họa chứ không phải phúc."
 */
function chamTaiVan(bazi: BaziAnalysis, chart: BatTuChart, dem: DemThapThan): { diem: number; canCu: CanCuLinhVuc[] } {
  const canCu: CanCuLinhVuc[] = [];
  let d = 0;
  const taiNhieu = dem.phan.tai >= 4;
  const thanVuong = laVuong(bazi.vuongSuy) || bazi.vuongSuy === "Trung hòa";

  // Nguyên tắc nền — quyết định nhất.
  if (!dem.coMat.tai) {
    d -= MANH;
    canCu.push({ thuanLoi: false, noiDung: "Trong mệnh không có Tài tinh nào (kể cả tàng) — thiếu chỗ dựa về của cải, không nên trông vào kinh doanh mạo hiểm.", nguon: "tai-van.md §2 (nhóm khác)" });
  } else if (thanVuong && taiNhieu) {
    d += MANH;
    canCu.push({ thuanLoi: true, noiDung: "Thân đủ lực mà Tài cũng vượng — gánh được của cải, đây là cấu trúc phát tài theo tài liệu.", nguon: "tai-van.md §1 (nhóm cơ bản)" });
  } else if (!thanVuong && taiNhieu) {
    d -= MANH;
    canCu.push({ thuanLoi: false, noiDung: "Tài nhiều mà Thân nhược — \"tài đa thân nhược\", tiền của đến lại thành gánh nặng chứ không thành phúc.", nguon: "tai-van.md §Nguyên tắc nền" });
  } else if (thanVuong) {
    d += NHE;
    canCu.push({ thuanLoi: true, noiDung: "Thân đủ lực, Tài ở mức vừa — giữ được của, không bị của cải lấn át.", nguon: "tai-van.md §Nguyên tắc nền" });
  }

  // Tài tàng không lộ — "Tài giữ được thì bền".
  if (dem.coMat.tai && !dem.thauCan.tai) {
    d += VUA;
    canCu.push({ thuanLoi: true, noiDung: "Tài tinh chỉ tàng trong Chi, không lộ ra Can — của cải kín đáo, giữ được, ít bị tranh giành.", nguon: "tai-van.md §1 + §2 (\"Tài nên tàng ẩn\")" });
  } else if (dem.thauCan.tai && dem.phan.ty_kiep >= 4) {
    d -= VUA;
    canCu.push({ thuanLoi: false, noiDung: "Tài lộ ra Can mà Tỷ Kiếp lại nhiều — dễ bị chia phần, tranh đoạt của cải.", nguon: "tai-van.md §2 (nhóm Tỷ Kiếp)" });
  }

  // Tài là Dụng Thần.
  const hanhTai = (["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"] as Hanh[]).find((h) => pheCua(h, bazi.nhatChu.nguHanh) === "tai");
  if (hanhTai && bazi.dungThan === hanhTai) {
    d += MANH;
    canCu.push({ thuanLoi: true, noiDung: `Tài (${hanhTai}) chính là Dụng Thần của lá số — tài liệu xếp vào nhóm "chắc chắn là người có của".`, nguon: "tai-van.md §1 (nhóm khác)" });
  } else if (hanhTai && bazi.kyThan === hanhTai) {
    d -= VUA;
    canCu.push({ thuanLoi: false, noiDung: `Tài (${hanhTai}) lại là Kỵ Thần — càng theo đuổi tiền bạc càng dễ hao tổn.`, nguon: "tai-van.md §Nguyên tắc nền" });
  }

  // Thực Thương sinh Tài — dòng chảy tự nhiên có của.
  if (dem.coMat.thuc_thuong && dem.coMat.tai && dem.phan.thuc_thuong >= 2) {
    d += VUA;
    canCu.push({ thuanLoi: true, noiDung: "Có Thực Thần/Thương Quan sinh Tài — dòng chảy từ bản thân ra của cải thông suốt, \"tự nhiên có của\".", nguon: "tai-van.md §1 (nhóm Thực/Thương sinh Tài)" });
  }

  // Tỷ Kiếp trùng trùng tranh Tài.
  if (dem.phan.ty_kiep >= 6) {
    d -= VUA;
    canCu.push({ thuanLoi: false, noiDung: "Tỷ Kiếp trùng trùng — nhiều người chia phần, tài liệu cảnh báo dễ phá tài khi vận đến.", nguon: "tai-van.md §2 (nhóm Tỷ Kiếp)" });
  }

  // Tài gặp Trường Sinh — "ruộng vườn vạn mẫu".
  if (hanhTai) {
    const chiCoTaiTruongSinh = [chart.year.chi, chart.month.chi, chart.day.chi, chart.hour.chi].some((chi) => {
      const chinhKhi = TANG[chiChuan(chi)]?.[0];
      return !!chinhKhi && hanhCan(chinhKhi) === hanhTai && trangThaiTruongSinh(chart.day.can, chi) === "Trường Sinh";
    });
    if (chiCoTaiTruongSinh) {
      d += NHE;
      canCu.push({ thuanLoi: true, noiDung: "Tài tinh gặp đất Trường Sinh — nguồn của cải có gốc, bền lâu.", nguon: "tai-van.md §1 (nhóm cơ bản)" });
    }
  }
  return { diem: d, canCu };
}

// ── LĨNH VỰC 3: GIA ĐẠO ─────────────────────────────────────────────────────────────────────────
/**
 * `luc-than.md` §0: Trụ Năm = ông bà/tổ tiên/cha mẹ (gốc), chủ thời niên thiếu; Trụ Tháng = cha mẹ/
 * anh chị em. Với TRẺ SƠ SINH, "gia đạo" = bé có được nương tựa cha mẹ và lớn lên trong nhà êm ấm
 * hay không → xét chủ yếu Trụ Năm + Trụ Tháng + Ấn tinh (mẹ) + Tỷ Kiếp (anh em).
 */
function chamGiaDao(bazi: BaziAnalysis, chart: BatTuChart, dem: DemThapThan): { diem: number; canCu: CanCuLinhVuc[] } {
  const canCu: CanCuLinhVuc[] = [];
  let d = 0;
  const nhatChu = bazi.nhatChu.nguHanh;
  const hanhCanNam = hanhCan(chart.year.can);
  const hanhChiNam = hanhChi(chart.year.chi);

  // Trụ Năm là Dụng/Hỷ Thần → hưởng âm đức tổ tiên; là Kỵ Thần → sinh ra lúc nhà đã sa sút.
  if (hanhCanNam === bazi.dungThan || hanhCanNam === bazi.hyThan) {
    d += MANH;
    canCu.push({ thuanLoi: true, noiDung: "Trụ Năm mang hành Dụng/Hỷ Thần — hưởng được âm đức và phúc phần từ gia đình, nền tảng đầu đời thuận.", nguon: "luc-than.md §1.1 + §1.4" });
  } else if (hanhCanNam === bazi.kyThan) {
    d -= VUA;
    canCu.push({ thuanLoi: false, noiDung: "Trụ Năm mang hành Kỵ Thần — nền gia đình không thuận chiều với bé, cần gia đình chủ động bù đắp.", nguon: "luc-than.md §1.2" });
  }

  // Can-Chi Trụ Năm tương sinh → cha mẹ hòa thuận.
  const SINH: Record<Hanh, Hanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
  if (SINH[hanhCanNam] === hanhChiNam || SINH[hanhChiNam] === hanhCanNam) {
    d += VUA;
    canCu.push({ thuanLoi: true, noiDung: "Can và Chi Trụ Năm tương sinh nhau — theo tài liệu là dấu hiệu cha mẹ hòa thuận, thương yêu nhau.", nguon: "luc-than.md §1.1" });
  }

  // Chi Năm bị xung → khắc cha mẹ, không hưởng gia sản.
  if (coLucXung(chart.year.chi, [chart.month.chi, chart.day.chi, chart.hour.chi])) {
    d -= MANH;
    canCu.push({ thuanLoi: false, noiDung: "Chi Trụ Năm bị xung — tài liệu xếp vào dấu hiệu khắc cha mẹ, khó hưởng nền tảng gia đình.", nguon: "luc-than.md §1.2" });
  }

  // Nguyệt Lệnh khắc Can Năm → "cha mẹ không song toàn" (dấu hiệu nặng nhất mục 1.3).
  const KHAC: Record<Hanh, Hanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };
  const hanhNguyetLenh = hanhChi(chart.month.chi);
  if (KHAC[hanhNguyetLenh] === hanhCanNam) {
    d -= MANH;
    canCu.push({ thuanLoi: false, noiDung: "Nguyệt Lệnh (khí tháng sinh) khắc thẳng Can Trụ Năm — tài liệu gọi là dấu hiệu \"cha mẹ không song toàn\", nên tránh khi còn phương án khác.", nguon: "luc-than.md §1.3" });
  }

  // Đủ Thìn-Tuất-Sửu-Mùi → cốt nhục chia lìa.
  const chis = [chart.year.chi, chart.month.chi, chart.day.chi, chart.hour.chi].map(chiChuan);
  if (["Thìn", "Tuất", "Sửu", "Mùi"].every((c) => chis.includes(c))) {
    d -= MANH;
    canCu.push({ thuanLoi: false, noiDung: "Tứ trụ đủ cả Thìn–Tuất–Sửu–Mùi — tài liệu gọi là \"cốt nhục chia lìa\", bất lợi cho sự sum vầy gia đình.", nguon: "luc-than.md §1.3" });
  }

  // Tỷ Kiếp trùng trùng → khắc cha; Tài nhiều → khắc mẹ (Tài khắc Ấn).
  if (dem.phan.ty_kiep >= 6) {
    d -= VUA;
    canCu.push({ thuanLoi: false, noiDung: "Tỷ Kiếp trùng trùng trong mệnh — tài liệu xếp vào dấu hiệu khắc cha.", nguon: "luc-than.md §1.3" });
  }
  if (dem.phan.tai >= 6 && dem.phan.an <= 2) {
    d -= VUA;
    canCu.push({ thuanLoi: false, noiDung: "Tài nhiều mà Ấn mỏng — \"Tài nhiều tổn thương Ấn\", tài liệu xếp vào dấu hiệu bất lợi cho mẹ.", nguon: "luc-than.md §1.2 + §1.3" });
  }

  // Ấn có căn, không bị thương tổn → có chỗ dựa, nhà cửa sang quý.
  if (bazi.anTinh.muc === "dep" || bazi.anTinh.muc === "du") {
    d += VUA;
    canCu.push({ thuanLoi: true, noiDung: "Ấn tinh (sao đại diện mẹ và chỗ dựa) có căn, liều lượng vừa phải — bé có nơi nương tựa vững trong nhà.", nguon: "luc-than.md §1.4 + §0" });
  } else if (bazi.anTinh.muc === "thieu") {
    d -= VUA;
    canCu.push({ thuanLoi: false, noiDung: "Ấn tinh thiếu hoặc không có căn — thiếu chỗ dựa từ gia đình, bé sớm phải tự lập.", nguon: "luc-than.md §0 §1.2" });
  } else if (bazi.anTinh.muc === "qua_thua") {
    d -= NHE;
    canCu.push({ thuanLoi: false, noiDung: "Ấn quá nhiều — dễ được bao bọc quá mức, mẹ can thiệp sâu, bé chậm tự lập.", nguon: "luc-than.md §0 (nguyên tắc vượng/suy lục thân)" });
  }

  // Cả Chính Ấn lẫn Thiên Ấn cùng có → tài liệu ghi dấu hiệu "hai mẹ".
  const anCans = new Set<string>();
  for (const tru of [chart.year, chart.month, chart.day, chart.hour]) {
    if (pheCua(hanhCan(tru.can), nhatChu) === "an") anCans.add(tru.can);
    (tru.tangCan ?? []).forEach((t) => { if (pheCua(hanhCan(t.can), nhatChu) === "an") anCans.add(t.can); });
  }
  if (anCans.size >= 2) {
    d -= NHE;
    canCu.push({ thuanLoi: false, noiDung: "Có cả Chính Ấn lẫn Thiên Ấn trong mệnh — tài liệu ghi là dấu hiệu \"hai mẹ\" (mẹ nuôi/mẹ kế), linh nghiệm nhưng không tuyệt đối.", nguon: "luc-than.md §1.3" });
  }
  return { diem: d, canCu };
}

// ── LĨNH VỰC 4: NHÂN DUYÊN ──────────────────────────────────────────────────────────────────────
/**
 * `hon-nhan.md` §Nguyên tắc nền: Nam lấy Tài tinh làm sao vợ, Nữ lấy Quan Sát làm sao chồng; Chi
 * Ngày là Cung Thê (nam) / Cung Phu (nữ). Vì vậy lĩnh vực này BẮT BUỘC phụ thuộc giới tính bé.
 */
function chamNhanDuyen(bazi: BaziAnalysis, chart: BatTuChart, dem: DemThapThan, gioiTinh: Gender): { diem: number; canCu: CanCuLinhVuc[] } {
  const canCu: CanCuLinhVuc[] = [];
  let d = 0;
  const laNam = gioiTinh === "Nam";
  const pheBanDoi: Phe = laNam ? "tai" : "quan_sat";
  const tenSao = laNam ? "Tài tinh (sao vợ)" : "Quan Sát (sao chồng)";
  const tenCung = laNam ? "Cung Thê" : "Cung Phu";

  // Có sao bạn đời hay không.
  if (!dem.coMat[pheBanDoi]) {
    d -= MANH;
    canCu.push({ thuanLoi: false, noiDung: `Trong mệnh không có ${tenSao} nào (kể cả tàng) — tài liệu xếp vào dấu hiệu duyên mỏng, khó gần gũi bạn đời.`, nguon: laNam ? "hon-nhan.md §2 (Nam mệnh)" : "hon-nhan.md §4 (Nữ mệnh)" });
  }

  // Nữ: Quan Sát hỗn tạp là dấu hiệu xấu nhất; 1 loại thuần túy là tốt nhất.
  if (!laNam) {
    const chinhQuan = new Set<string>(), thatSat = new Set<string>();
    const nhatChuCan = chart.day.can;
    const nhatChuDuong = CAN_DUONG.has(nhatChuCan);
    for (const tru of [chart.year, chart.month, chart.day, chart.hour]) {
      const xet = (can: string) => {
        if (pheCua(hanhCan(can), bazi.nhatChu.nguHanh) !== "quan_sat") return;
        // Chính Quan = khác âm dương với Nhật Chủ; Thất Sát = cùng âm dương.
        (CAN_DUONG.has(can) === nhatChuDuong ? thatSat : chinhQuan).add(can);
      };
      xet(tru.can);
      (tru.tangCan ?? []).forEach((t) => xet(t.can));
    }
    if (chinhQuan.size > 0 && thatSat.size > 0) {
      d -= MANH;
      canCu.push({ thuanLoi: false, noiDung: "Chính Quan và Thất Sát cùng xuất hiện (Quan Sát hỗn tạp) — tài liệu xếp là dấu hiệu hôn nhân dễ trắc trở nhất với nữ mệnh.", nguon: "hon-nhan.md §Nguyên tắc nền + §2 (Nữ mệnh)" });
    } else if (chinhQuan.size > 0 || thatSat.size > 0) {
      d += MANH;
      canCu.push({ thuanLoi: true, noiDung: `Chỉ có ${chinhQuan.size > 0 ? "Chính Quan" : "Thất Sát"} xuất hiện thuần túy, không hỗn tạp — tài liệu xếp là cấu trúc hôn nhân tốt nhất cho nữ mệnh.`, nguon: "hon-nhan.md §Nguyên tắc nền + §1 (Nữ mệnh)" });
    }
  } else {
    // Nam: Chính Tài + Thiên Tài lẫn lộn không kiểm soát → tài liệu cảnh báo tương tự.
    const chinhTai = new Set<string>(), thienTai = new Set<string>();
    const nhatChuDuong = CAN_DUONG.has(chart.day.can);
    for (const tru of [chart.year, chart.month, chart.day, chart.hour]) {
      const xet = (can: string) => {
        if (pheCua(hanhCan(can), bazi.nhatChu.nguHanh) !== "tai") return;
        (CAN_DUONG.has(can) === nhatChuDuong ? thienTai : chinhTai).add(can);
      };
      xet(tru.can);
      (tru.tangCan ?? []).forEach((t) => xet(t.can));
    }
    if (chinhTai.size > 0 && thienTai.size > 0 && dem.phan.tai >= 4) {
      d -= VUA;
      canCu.push({ thuanLoi: false, noiDung: "Có cả Chính Tài lẫn Thiên Tài với lực đáng kể — tài liệu cảnh báo Tài lẫn lộn không kiểm soát bất lợi cho hôn nhân nam mệnh.", nguon: "hon-nhan.md §Nguyên tắc nền + §3" });
    }
  }

  // Sao bạn đời là Hỷ/Dụng Thần → hôn nhân thuận.
  const hanhBanDoi = (["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"] as Hanh[]).find((h) => pheCua(h, bazi.nhatChu.nguHanh) === pheBanDoi);
  if (hanhBanDoi && (bazi.dungThan === hanhBanDoi || bazi.hyThan === hanhBanDoi)) {
    d += MANH;
    canCu.push({ thuanLoi: true, noiDung: `${tenSao} đồng thời là Dụng/Hỷ Thần — bạn đời là người hợp và nâng đỡ được mệnh chủ.`, nguon: "hon-nhan.md §1" });
  } else if (hanhBanDoi && bazi.kyThan === hanhBanDoi) {
    d -= VUA;
    canCu.push({ thuanLoi: false, noiDung: `${tenSao} lại rơi vào Kỵ Thần — chuyện tình cảm dễ thành gánh nặng thay vì trợ lực.`, nguon: "hon-nhan.md §Ứng dụng khi luận" });
  }

  // Cung Thê/Phu (Chi Ngày) bị hình/xung/hại.
  if (coLucXung(chart.day.chi, [chart.year.chi, chart.month.chi, chart.hour.chi])) {
    d -= MANH;
    canCu.push({ thuanLoi: false, noiDung: `${tenCung} (Chi Ngày) bị xung ngay trong nguyên cục — tài liệu xếp vào dấu hiệu hôn nhân dễ rạn nứt.`, nguon: "hon-nhan.md §2 (chung) + §6" });
  }
  if (bazi.tuHinhTuTruHinh.some((h) => h.includes(chiChuan(chart.day.chi)))) {
    d -= VUA;
    canCu.push({ thuanLoi: false, noiDung: `${tenCung} (Chi Ngày) nằm trong thế hình — bất lợi cho sự êm ấm vợ chồng.`, nguon: "hon-nhan.md §6" });
  }

  // Ngày–Giờ tương xung → "không lợi cho vợ/chồng, dễ chia xa".
  if (coLucXung(chart.day.chi, [chart.hour.chi])) {
    d -= VUA;
    canCu.push({ thuanLoi: false, noiDung: "Trụ Ngày và Trụ Giờ tương xung — tài liệu ghi \"không lợi cho vợ/chồng, dễ chia xa\".", nguon: "hon-nhan.md §2 (chung cho cả 2 mệnh)" });
  }

  // Can-Chi Trụ Ngày tương sinh → vợ chồng đằm thắm.
  const SINH: Record<Hanh, Hanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
  const hCanNgay = hanhCan(chart.day.can), hChiNgay = hanhChi(chart.day.chi);
  if (SINH[hCanNgay] === hChiNgay || SINH[hChiNgay] === hCanNgay) {
    d += VUA;
    canCu.push({ thuanLoi: true, noiDung: "Can và Chi Trụ Ngày tương sinh — tài liệu ghi là dấu hiệu vợ chồng đằm thắm.", nguon: "hon-nhan.md §1 (chung cho cả 2 mệnh)" });
  }

  // Tứ trụ thuần Dương (bất lợi Nam) / thuần Âm (bất lợi Nữ).
  const cans = [chart.year.can, chart.month.can, chart.day.can, chart.hour.can];
  const toanDuong = cans.every((c) => CAN_DUONG.has(c));
  const toanAm = cans.every((c) => !CAN_DUONG.has(c));
  if ((laNam && toanDuong) || (!laNam && toanAm)) {
    d -= VUA;
    canCu.push({ thuanLoi: false, noiDung: `Tứ trụ toàn ${toanDuong ? "Dương" : "Âm"} — tài liệu ghi ${laNam ? "nam" : "nữ"} mệnh như vậy bất lợi cho đường bạn đời.`, nguon: "hon-nhan.md §2 (chung cho cả 2 mệnh)" });
  }

  // Tỷ Kiếp nhiều → kết hôn muộn (nhẹ, không phải xấu tuyệt đối).
  if (dem.phan.ty_kiep >= 6) {
    d -= NHE;
    canCu.push({ thuanLoi: false, noiDung: "Tỷ Kiếp nhiều — tài liệu ghi khuynh hướng kết hôn muộn (không phải điều xấu, chỉ là chậm hơn).", nguon: "hon-nhan.md §5" });
  }
  return { diem: d, canCu };
}

// ── Đại Vận đóng góp theo lĩnh vực ──────────────────────────────────────────────────────────────
/**
 * Đại Vận tác động khác nhau lên từng lĩnh vực, theo đúng cung vị bị xung:
 *   • Xung Nhật Chi = xung Cung Thê/Phu → NHÂN DUYÊN (`hon-nhan.md` §6).
 *   • Xung Nguyệt Chi = xung trụ cha mẹ/anh em → GIA ĐẠO (`luc-than.md` §0).
 * Ngoài ra chất lượng chung của các vận đầu đời cộng/trừ nhẹ cho MỌI lĩnh vực, vì vận xấu thì mặt
 * nào cũng chịu ảnh hưởng (`05-dai-van-dai-han.md` §3: vận đầu đời trọng số cao nhất với trẻ).
 */
function daiVanTheoLinhVuc(bazi: BaziAnalysis): Record<LinhVucKey, { diem: number; canCu: CanCuLinhVuc[] }> {
  const BAND: Record<string, number> = { rat_thuan: 1, thuan: 0.5, trung_binh: 0, thu_thach: -0.5, nghich: -1 };
  const ra: Record<LinhVucKey, { diem: number; canCu: CanCuLinhVuc[] }> = {
    suc_khoe: { diem: 0, canCu: [] }, gia_dao: { diem: 0, canCu: [] },
    tai_van: { diem: 0, canCu: [] }, nhan_duyen: { diem: 0, canCu: [] },
  };
  if (bazi.daiVan.length === 0) return ra;

  // Chất lượng chung 3 vận đầu (bao trùm tuổi thơ → thanh niên).
  const dauDoi = bazi.daiVan.slice(0, 3);
  const trungBinh = dauDoi.reduce((s, v) => s + (BAND[v.band] ?? 0), 0) / (dauDoi.length || 1);
  for (const k of Object.keys(ra) as LinhVucKey[]) ra[k].diem += trungBinh * NHE;
  if (Math.abs(trungBinh) >= 0.5) {
    const moTa = trungBinh > 0
      ? `Các Đại Vận đầu đời (${dauDoi[0]?.tuTuoi}–${dauDoi.at(-1)?.denTuoi} tuổi) nhìn chung thuận.`
      : `Các Đại Vận đầu đời (${dauDoi[0]?.tuTuoi}–${dauDoi.at(-1)?.denTuoi} tuổi) nhìn chung nhiều thử thách.`;
    for (const k of Object.keys(ra) as LinhVucKey[]) {
      ra[k].canCu.push({ thuanLoi: trungBinh > 0, noiDung: moTa, nguon: "05-dai-van-dai-han.md §3" });
    }
  }

  const xungNhat = bazi.daiVan.filter((v) => v.xungNhatChi);
  if (xungNhat.length > 0) {
    ra.nhan_duyen.diem -= Math.min(xungNhat.length, 3) * NHE;
    ra.nhan_duyen.canCu.push({
      thuanLoi: false,
      noiDung: `Có ${xungNhat.length} Đại Vận xung vào Chi Ngày (Cung Thê/Phu): ${xungNhat.map((v) => `${v.tuTuoi}–${v.denTuoi}t`).join(", ")} — giai đoạn đường tình cảm dễ có sóng gió.`,
      nguon: "hon-nhan.md §6",
    });
  }
  const xungNguyet = bazi.daiVan.filter((v) => v.xungNguyetChi);
  if (xungNguyet.length > 0) {
    ra.gia_dao.diem -= Math.min(xungNguyet.length, 3) * NHE;
    ra.gia_dao.canCu.push({
      thuanLoi: false,
      noiDung: `Có ${xungNguyet.length} Đại Vận xung vào Chi Tháng (trụ cha mẹ, anh em): ${xungNguyet.map((v) => `${v.tuTuoi}–${v.denTuoi}t`).join(", ")} — giai đoạn quan hệ gia đình dễ xáo trộn.`,
      nguon: "luc-than.md §0",
    });
  }
  return ra;
}

// ── Tổng hợp ────────────────────────────────────────────────────────────────────────────────────
const clamp10 = (x: number) => Math.max(-10, Math.min(10, Math.round(x * 10) / 10));

function danhGiaTu(diem: number): DiemLinhVuc["danhGia"] {
  return diem >= 3 ? "tot" : diem >= 1 ? "kha" : diem >= -1.5 ? "trung_binh" : "can_luu_y";
}

/**
 * Chấm cả 4 lĩnh vực cho MỘT ứng viên. Bát Tự là phần chính, Tử Vi là lớp đối chiếu độc lập
 * (hệ số 0,5 — vì Tử Vi ở module này dùng để CHỌN GIỜ, Bát Tự dùng để xếp NGÀY, theo
 * `06-phan-xu-ban-giao.md` §1 "không cộng điểm chéo" — ở đây hai hệ vẫn tách bạch trong
 * `diemBatTu`/`diemTuVi` để người đọc thấy rõ bên nào nói gì).
 */
export function chamBonLinhVuc(
  bazi: BaziAnalysis,
  tuVi: TuViAnalysis | undefined,
  chart: BatTuChart,
  gioiTinh: Gender,
): DiemLinhVuc[] {
  const dem = demThapThan(chart);
  const dv = daiVanTheoLinhVuc(bazi);

  const batTuTheoLinhVuc: Record<LinhVucKey, { diem: number; canCu: CanCuLinhVuc[] }> = {
    suc_khoe: chamSucKhoe(bazi, chart),
    tai_van: chamTaiVan(bazi, chart, dem),
    gia_dao: chamGiaDao(bazi, chart, dem),
    nhan_duyen: chamNhanDuyen(bazi, chart, dem, gioiTinh),
  };

  return (Object.keys(NHAN_LINH_VUC) as LinhVucKey[]).map((k) => {
    const bt = batTuTheoLinhVuc[k];
    const bo = tuVi?.boLinhVuc?.[k];
    const diemBatTu = clamp10(bt.diem + dv[k].diem);
    const diemTuVi = bo ? clamp10(bo.diemBo) : 0;
    const canCu = [...bt.canCu, ...dv[k].canCu];
    if (bo) {
      canCu.push({
        thuanLoi: bo.danhGia === "cat",
        noiDung: `Tử Vi — ${bo.nhanXet}`,
        nguon: "phuong-phap-luan-cung-vi.md §II–III (Tam Phương Tứ Chính)",
      });
    }

    const diem = clamp10(diemBatTu + diemTuVi * 0.5);
    const danhGia = danhGiaTu(diem);
    const thuan = canCu.filter((c) => c.thuanLoi);
    const nghich = canCu.filter((c) => !c.thuanLoi);
    const mo = danhGia === "tot" ? "Thuận rõ" : danhGia === "kha" ? "Khá thuận" : danhGia === "trung_binh" ? "Ở mức trung bình" : "Cần lưu ý";
    const nhanXet = `${mo} về ${NHAN_LINH_VUC[k].toLowerCase()}. `
      + (thuan.length ? `Điểm được: ${thuan.slice(0, 2).map((c) => c.noiDung).join(" ")} ` : "")
      + (nghich.length ? `Điểm cần lưu ý: ${nghich.slice(0, 2).map((c) => c.noiDung).join(" ")}` : (thuan.length ? "" : "Không có yếu tố nổi bật theo hướng nào."));

    return { linhVuc: k, nhan: NHAN_LINH_VUC[k], diem, danhGia, diemBatTu, diemTuVi, canCu, nhanXet };
  });
}

/**
 * TRỌNG SỐ THEO ƯU TIÊN GIA ĐÌNH — biến `familyPriority` (vốn đã thu thập ở form nhưng TRƯỚC 27/8/2026
 * KHÔNG hề được dùng ở bất kỳ đâu, khiến chọn ưu tiên nào cũng ra cùng kết quả) thành tác động thật.
 *
 * Mặc định `balanced` đặt Sức khỏe cao nhất vì đối tượng là TRẺ SƠ SINH — `benh-tat.md` và
 * `04-lop-tu-vi.md` đều nhấn "Tật Ách quan trọng hàng đầu với trẻ sơ sinh". Nhân duyên thấp nhất vì
 * là chuyện của vài chục năm sau, ít cấp thiết hơn khi cân nhắc giờ sinh.
 */
export const TRONG_SO_UU_TIEN: Record<BirthSelectionInput["familyPriority"], Record<LinhVucKey, number>> = {
  health: { suc_khoe: 2.2, gia_dao: 1.0, tai_van: 0.6, nhan_duyen: 0.6 },
  wealth: { suc_khoe: 1.1, gia_dao: 0.8, tai_van: 2.2, nhan_duyen: 0.6 },
  career: { suc_khoe: 1.1, gia_dao: 0.8, tai_van: 1.8, nhan_duyen: 0.6 },
  academic: { suc_khoe: 1.2, gia_dao: 1.3, tai_van: 1.0, nhan_duyen: 0.6 },
  balanced: { suc_khoe: 1.4, gia_dao: 1.1, tai_van: 1.0, nhan_duyen: 0.8 },
};

/**
 * Điểm 4 lĩnh vực đã nhân trọng số ưu tiên gia đình.
 *
 * ⚠️ `phan` QUAN TRỌNG — giữ đúng `06-phan-xu-ban-giao.md` §1 "Bát Tự xếp hạng NGÀY, Tử Vi chọn GIỜ,
 * KHÔNG cộng điểm chéo": khi xếp NGÀY chỉ truyền `"batTu"`, khi chọn GIỜ trong ngày chỉ truyền
 * `"tuVi"`. Chỉ dùng `"tong"` cho phần HIỂN THỊ cho phụ huynh đọc, không dùng để xếp hạng.
 */
export function diemTheoUuTien(
  ds: DiemLinhVuc[],
  uuTien: BirthSelectionInput["familyPriority"],
  phan: "batTu" | "tuVi" | "tong" = "tong",
): number {
  const w = TRONG_SO_UU_TIEN[uuTien] ?? TRONG_SO_UU_TIEN.balanced;
  const lay = (x: DiemLinhVuc) => (phan === "batTu" ? x.diemBatTu : phan === "tuVi" ? x.diemTuVi : x.diem);
  const tong = ds.reduce((s, x) => s + lay(x) * w[x.linhVuc], 0);
  const tongW = ds.reduce((s, x) => s + w[x.linhVuc], 0) || 1;
  return Math.round((tong / tongW) * 100) / 100;
}

export { _LUU_Y_TRONG_SO };
