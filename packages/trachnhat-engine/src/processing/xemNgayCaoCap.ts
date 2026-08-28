/**
 * MODULE THU PHÍ — Xem Ngày Cao Cấp (Động Thổ / Nhập Trạch) theo Huyền Không Đại Quái.
 * Đặc tả chủ dự án cung cấp 2026-08-14. Phạm vi ĐÃ THU HẸP theo quyết định của Công: chỉ chạy
 * Bước 2 → 5 của skill `xem-ngay-cao-cap` (BỎ Bước 1 thần sát dân gian — khi đã luận Đại Quái thì
 * không cần lớp lọc dân gian song song). Bước 6 (chọn giờ) tạm chưa làm: nguồn ghi rõ phần "phép
 * tính giờ Hoàng Đạo" bằng thơ quyết bị lỗi OCR, chưa đủ tin cậy để code (đặc tả mục 5).
 *
 * Chế độ hiện có: `giam_dinh` — giám định 1 ngày cụ thể. Chế độ `tim_ngay` (quét khoảng, xếp
 * hạng) chưa làm ở phiên bản này.
 *
 * Bước 2 chạy CẢ 2 phương pháp độc lập (A: Tự/Sinh/Tam hợp theo mùa · B: Bổ Long Tam Cục) và nêu
 * cả hai — nguồn ghi rõ khi 2 cách lệch nhau thì không có quy tắc phân xử cứng, không tự chọn bên.
 * Bước 3 soát đủ 5 sát cốt lõi + 3 Thái Tuế Sát mở rộng (Mậu Kỷ Đô Thiên, Âm Phủ Thái Tuế, Mộ
 * Long Biến Vận).
 */
import { Astronomy, Calendar, Data, getCanChi, getJulianDay, getLunarDate } from "@thien-anh/calendar-core";
import { Scoring, TrachNhat, XemNgayCaoCap } from "@thien-anh/rule-engine";

function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

type Can = Data.Can;
type Chi = Data.Chi;
type TenSon = XemNgayCaoCap.TenSon;
type PhuongChinh = XemNgayCaoCap.PhuongChinh;
type CungBatQuai = XemNgayCaoCap.CungBatQuai;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

export type LoaiViec = "dong_tho" | "nhap_trach";

export interface XemNgayCaoCapInput {
  loaiViec: LoaiViec;
  /** 1 trong 24 sơn — dùng cho Bước 2 (khung tháng) và Bước 3 (phương vị sát). */
  toaNha: TenSon;
  /**
   * Độ số la bàn thực đo của Tọa (0-359.99).
   * - BẮT BUỘC để Bước 5 luận cách cục: quẻ tọa suy từ vòng 64 quẻ (5.625°/quẻ), tên sơn 15°
   *   không đủ phân giải (cùng "tọa Ất" có thể ra quẻ Tổn 6/9 hoặc Tiết 7/8 tùy độ số).
   * - Cũng BẮT BUỘC để xác định phương chính nếu toaNha là 1 trong 4 sơn duy (Cấn/Tốn/Khôn/Càn).
   * Bỏ trống → Bước 5 trả `thieu_du_lieu` thay vì luận sai.
   */
  toaDoSo?: number;
  /** Hướng nhà — nên có để lọc Ngũ Hoàng/Tam Sát đáo Hướng. */
  huongNha?: TenSon;
  namSinhGiaChuChinh: number;
  namSinhVoChong?: number;
  /** Ngày dương lịch cần giám định. */
  ngayGiamDinh: { nam: number; thang: number; ngay: number };
  timeZone?: string;
  /**
   * Lớp lọc thần sát dân gian (Tam Nương/Nguyệt Kỵ/Sát Chủ/Kim Thần Thất Sát/Thọ Tử/Kim Lâu/
   * Hoang Ốc/Tam Tai) — mặc định BẬT (SKILL.md Bước 0 #8). TẮT chỉ khi khách/Công chủ động yêu
   * cầu. Trực (theo việc) và Lục Xung KHÔNG phụ thuộc cờ này — luôn chạy (nhóm "Luôn bắt buộc").
   */
  apDungLocDanGian?: boolean;
}

export interface TruQue {
  can: Can;
  chi: Chi;
  que: string;
  hknh: number;
  quaiVan: number;
}

export interface MenhChuQue {
  canChiNamSinh: string;
  que: string;
  hknh: number;
  quaiVan: number;
}

export type TrangThaiBuoc = "dat" | "khong_dat" | "thieu_du_lieu";

export interface BuocKetQua {
  buoc: 1 | 2 | 3 | 4 | 5 | 6;
  ten: string;
  trangThai: TrangThaiBuoc;
  lyDo: string;
}

export interface GioDeXuat {
  chiGio: string;
  khungGio: string;
  laHoangDao: boolean;
  tenSao: string;
  hopCucVoiToa: "tam-hop" | "luc-hop" | null;
  xungChiNgay: boolean;
  phamTamSatGio: boolean;
  diem: number;
}

/**
 * Các yếu tố đã đạt, ở dạng CÓ CẤU TRÚC để tầng xếp hạng chấm điểm được (phần `diemManh` chỉ là
 * câu chữ cho người đọc, không dùng để tính điểm).
 */
export interface YeuToXepHang {
  /** Nhật Khóa giao Sơn Gia (Tọa) — null = không giao / thiếu quẻ Tọa. */
  giaoSonGia: string | null;
  giaoMenhChuChinh: string | null;
  giaoMenhChuPhu: string | null;
  toaGiaoMenhChu: boolean;
  nhomThang: "tu_hop" | "sinh_hop" | "tam_hop" | null;
  thuocCucBoLong: boolean;
  amDuongHaiHoa: boolean;
  haiCapHaDoKhacNhau: boolean;
  /** Số trụ (Năm/Tháng) hỗ trợ trụ Ngày — nguồn xếp hạng theo con số này (3 trụ = lý tưởng). */
  soTruHoTroNgay: number;
  /** 3 địa chi Tứ Trụ tạo tam hợp với Chi của Tọa (chỉ tính khi tọa là sơn Địa Chi). */
  tamHopVoiToa: boolean;
}

export interface XemNgayCaoCapResult {
  ngayDuongLich: { nam: number; thang: number; ngay: number };
  amLich: { ngay: number; thang: number; nam: number; nhuan: boolean };
  tuTru: { nam: TruQue; thang: TruQue; ngay: TruQue };
  toaNha: { ten: TenSon; cung: CungBatQuai; phuong: PhuongChinh | null; hknh: number | null; quaiVan: number | null };
  huongNha?: { ten: TenSon; cung: CungBatQuai };
  menhChuChinh: MenhChuQue;
  menhChuPhu?: MenhChuQue;
  ketLuan: "dung_duoc" | "khong_dung" | "dung_duoc_co_dieu_kien";
  chieuTungBuoc: BuocKetQua[];
  diemManh: string[];
  diemLuuY: string[];
  /** Bước 6 — 12 giờ đã xếp hạng (tốt nhất trước). */
  gioDeXuat: GioDeXuat[];
  yeuTo: YeuToXepHang;
  /** Trực của ngày (Kiến Trừ Thập Nhị Khách) — luôn tính, không phụ thuộc `apDungLocDanGian`. */
  truc: { ten: string; totCho: boolean };
  /** Bước 1 mục A (lọc dân gian theo ngày) — `null` nếu `apDungLocDanGian` = false. */
  locDanGian: XemNgayCaoCap.KetQuaLocDanGian | null;
  /** Soát Kim Lâu/Hoang Ốc/Tam Tai gia chủ chính — chỉ tính khi `loaiViec === "dong_tho"`, `null` nếu tắt cờ hoặc không phải động thổ. */
  soatTuoiGiaChu: (XemNgayCaoCap.SoatTuoiGiaChuKetQua & { phamTamTai: boolean }) | null;
}

/**
 * Với Can Chi mang 2 quẻ (Giáp Tý/Giáp Ngọ/Canh Dần/Canh Thân), nguồn yêu cầu "lấy quẻ nào tạo
 * cách cục hợp lý và PHẢI GHI RÕ đã chọn quẻ nào". Ở đây chọn quẻ đầu tiên và ghi chú vào
 * `diemLuuY` để người luận biết mà đối chiếu lại — không im lặng chọn ngầm.
 */
function chonQue(can: Can, chi: Chi): { que: XemNgayCaoCap.QueHknhQuaiVan; coNhieuLuaChon: boolean } {
  const ds = XemNgayCaoCap.traCanChi(can, chi);
  return { que: ds[0]!, coNhieuLuaChon: ds.length > 1 };
}

function toTruQue(can: Can, chi: Chi): { tru: TruQue; coNhieuLuaChon: boolean } {
  const { que, coNhieuLuaChon } = chonQue(can, chi);
  return { tru: { can, chi, que: que.que, hknh: que.hknh, quaiVan: que.quaiVan }, coNhieuLuaChon };
}

function moTaQuanHe(qh: XemNgayCaoCap.QuanHeHknh | XemNgayCaoCap.SinhKhac): string {
  const bang: Record<string, string> = {
    nhat_quai_thuan_thanh: "Nhất Quái Thuần Thanh (đồng số HKNH — đẹp nhất)",
    ha_do: "Hà Đồ / Sinh Thành",
    hop_thap: "Hợp Thập",
    hop_thap_7_3: "Hợp Thập cặp 7-3 (miễn cưỡng — Khảm/Ly không hợp)",
    khong_giao: "không giao",
    sinh_nhap: "sinh nhập (tốt)",
    khac_nhap: "khắc nhập (tốt)",
    sinh_xuat: "sinh xuất (xấu)",
    khac_xuat: "khắc xuất (xấu)",
    binh_hoa: "bình hòa (không sinh không khắc)",
  };
  return bang[qh] ?? qh;
}

export function calculateXemNgayCaoCap(input: XemNgayCaoCapInput): XemNgayCaoCapResult {
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;
  const { nam, thang, ngay } = input.ngayGiamDinh;

  const chieuTungBuoc: BuocKetQua[] = [];
  const diemManh: string[] = [];
  const diemLuuY: string[] = [];
  const yeuTo: YeuToXepHang = {
    giaoSonGia: null,
    giaoMenhChuChinh: null,
    giaoMenhChuPhu: null,
    toaGiaoMenhChu: false,
    nhomThang: null,
    thuocCucBoLong: false,
    amDuongHaiHoa: false,
    haiCapHaDoKhacNhau: false,
    soTruHoTroNgay: 0,
    tamHopVoiToa: false,
  };

  // ----- Nền: Tứ Trụ thật + âm lịch -----
  const canChi = getCanChi({ year: nam, month: thang, day: ngay, hour: 12, timeZone });
  const lunar = getLunarDate({ year: nam, month: thang, day: ngay, timeZone });

  const truNamRaw = toTruQue(canChi.year.can, canChi.year.chi);
  const truThangRaw = toTruQue(canChi.month.can, canChi.month.chi);
  const truNgayRaw = toTruQue(canChi.day.can, canChi.day.chi);
  for (const [ten, r] of [
    ["Năm", truNamRaw],
    ["Tháng", truThangRaw],
    ["Ngày", truNgayRaw],
  ] as const) {
    if (r.coNhieuLuaChon) {
      diemLuuY.push(
        `Trụ ${ten} (${r.tru.can} ${r.tru.chi}) có 2 quẻ hợp lệ trong bảng 60 Giáp Tý — hệ thống đang dùng quẻ "${r.tru.que}" (${r.tru.hknh}/${r.tru.quaiVan}). Cần đối chiếu lại nếu muốn dùng quẻ còn lại.`,
      );
    }
  }
  const truNam = truNamRaw.tru;
  const truThang = truThangRaw.tru;
  const truNgay = truNgayRaw.tru;

  // ----- Tọa / Hướng -----
  const cungToa = XemNgayCaoCap.cungCuaSon(input.toaNha);
  // Quẻ Tọa suy TRỰC TIẾP từ độ số la bàn qua vòng 64 quẻ — không nhận nhập tay, không đoán từ tên sơn.
  let queToa: { hknh: number; quaiVan: number; que: string; tenNgan: string } | null = null;
  if (input.toaDoSo !== undefined) {
    const q = XemNgayCaoCap.quyDoSoVeQueToa(input.toaDoSo);
    queToa = { hknh: q.hknh, quaiVan: q.quaiVan, que: q.que, tenNgan: q.tenNgan };
    // Cảnh báo nếu độ số nằm ngoài phạm vi sơn mà người dùng khai — thường là gõ nhầm 1 trong 2.
    const dnSon = XemNgayCaoCap.timDinhNghiaSon(input.toaNha);
    const lech = Math.abs(((input.toaDoSo - dnSon.doTam + 540) % 360) - 180);
    if (lech > 7.5) {
      diemLuuY.push(
        `Độ số Tọa (${input.toaDoSo}°) không nằm trong sơn ${input.toaNha} (${dnSon.doTam - 7.5}°-${dnSon.doTam + 7.5}°) — kiểm tra lại xem có nhầm giữa tên sơn và độ số không. Hệ thống đang lấy quẻ theo ĐỘ SỐ (${q.tenNgan} ${q.hknh}/${q.quaiVan}).`,
      );
    }
  } else {
    diemLuuY.push(
      "Chưa nhập độ số la bàn của Tọa — Bước 5 không luận được cách cục. Trong Huyền Không Đại Quái, quẻ tọa lấy theo vòng 64 quẻ (mỗi quẻ 5.625°), nên TÊN SƠN (15°) KHÔNG ĐỦ để suy ra quẻ (ngay trong tài liệu gốc, cùng tọa Ất có bài ra quẻ Tổn 6/9, bài khác ra quẻ Tiết 7/8). Hệ thống không suy đoán để tránh luận sai toàn bộ.",
    );
  }
  const phuongToaRaw = XemNgayCaoCap.phuongTuSon(input.toaNha);
  const phuongToa: PhuongChinh | null =
    phuongToaRaw.phuong ?? (input.toaDoSo !== undefined ? XemNgayCaoCap.phuongTuDoSo(input.toaDoSo) : null);
  const cungHuong = input.huongNha ? XemNgayCaoCap.cungCuaSon(input.huongNha) : null;

  // ----- Mệnh Chủ (quy năm sinh dương lịch → Can Chi → quẻ) -----
  function menhChuTuNamSinh(namSinh: number): MenhChuQue {
    const can = Scoring.getCan(namSinh);
    const chi = Scoring.getChi(namSinh);
    const { que, coNhieuLuaChon } = chonQue(can, chi);
    if (coNhieuLuaChon) {
      diemLuuY.push(
        `Mệnh Chủ sinh ${namSinh} (${can} ${chi}) có 2 quẻ hợp lệ — đang dùng "${que.que}" (${que.hknh}/${que.quaiVan}).`,
      );
    }
    return { canChiNamSinh: `${can} ${chi}`, que: que.que, hknh: que.hknh, quaiVan: que.quaiVan };
  }
  const menhChuChinh = menhChuTuNamSinh(input.namSinhGiaChuChinh);
  const menhChuPhu = input.namSinhVoChong !== undefined ? menhChuTuNamSinh(input.namSinhVoChong) : undefined;

  // =============================================================================================
  // BƯỚC 1 — lọc thô thần sát dân gian THEO NGÀY (28/8/2026, anh Công chốt bổ sung sau khi tự phát
  // hiện ngày phạm Sát Chủ/Trực Mãn lọt qua danh sách "Lý tưởng"). Cờ `apDungLocDanGian` mặc định
  // BẬT — SKILL.md Bước 0 #8. Trực (theo việc) và Lục Xung Chi ngày với Tọa/Mệnh Chủ LUÔN chạy,
  // không phụ thuộc cờ này (nhóm "Luôn bắt buộc" trong bảng cổng cứng SKILL.md).
  // =============================================================================================
  const apDungLocDanGian = input.apDungLocDanGian ?? true;
  const phamBuoc1: string[] = [];

  // Nguyệt Tận: ngày mai (ÂL) là mùng 1 → hôm nay là ngày cuối tháng ÂL.
  const jdHomNay = getJulianDay({ year: nam, month: thang, day: ngay, hour: 12, timeZone });
  const ngayMaiCal = Astronomy.julianDayNumberToCalendarDate(jdHomNay.julianDayNumber + 1);
  const lunarNgayMai = getLunarDate({ year: ngayMaiCal.year, month: ngayMaiCal.month, day: ngayMaiCal.day, timeZone });
  const phamNguyetTanTinh = lunarNgayMai.day === 1;

  // Tứ Ly / Tứ Tuyệt: "1 ngày trước" 1 trong 8 mốc tiết khí — so JDN của tiết khí gần nhất với
  // JDN(hôm nay)+1. Dùng `Calendar.findSolarTermJd` đã có sẵn (cùng cơ chế Newton-Raphson mà
  // `getGanzhiYear` dùng để tìm Lập Xuân), KHÔNG tự suy công thức tiết khí riêng.
  function jdnTietKhiGanNhat(kinhDoDeg: number): number {
    const jd = Calendar.findSolarTermJd(kinhDoDeg, jdHomNay.julianDay);
    return Math.floor(jd + 0.5); // quy ước Meeus: JDN nguyên = floor(jd + 0.5)
  }
  const jdnMai = jdHomNay.julianDayNumber + 1;
  const phamTuLyTinh = [0, 90, 180, 270].some((kd) => jdnTietKhiGanNhat(kd) === jdnMai);
  const phamTuTuyetTinh = [315, 45, 135, 225].some((kd) => jdnTietKhiGanNhat(kd) === jdnMai);

  const locDanGianTinh = XemNgayCaoCap.locThoDanGian({
    ngayAL: lunar.day,
    thangAL: lunar.month,
    canNam: truNam.can,
    canNgay: truNgay.can,
    chiNgay: truNgay.chi,
    phamNguyetTan: phamNguyetTanTinh,
    phamTuLy: phamTuLyTinh,
    phamTuTuyet: phamTuTuyetTinh,
    chiThangBatTu: truThang.chi,
  });
  const locDanGian: XemNgayCaoCapResult["locDanGian"] = apDungLocDanGian ? locDanGianTinh : null;
  if (apDungLocDanGian) phamBuoc1.push(...locDanGianTinh.lyDo);

  // Trực (Kiến Trừ Thập Nhị Khách) — LUÔN tính, không phụ thuộc cờ. Chi mà Trực Kiến khởi trong
  // tháng CHÍNH LÀ Chi Tháng Bát Tự (lịch Kiến Nguyệt: tháng Dần luôn kiến Dần...) — dùng thẳng
  // `truThang.chi`, không cần gọi lại tiết khí riêng cho Trực.
  const CHI_ORDER_TRUC: readonly Chi[] = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const monthOrderIndexTruc = mod(CHI_ORDER_TRUC.indexOf(truThang.chi) - 2, 12);
  const dayChiIndexTruc = CHI_ORDER_TRUC.indexOf(truNgay.chi);
  const trucKetQua = TrachNhat.getTruc(dayChiIndexTruc, monthOrderIndexTruc);
  // Mục A "Kỵ chung mọi việc": Trực Phá, Trực Bế — áp cho MỌI loại việc, không riêng động thổ.
  const TRUC_KY_CHUNG = new Set(["Phá", "Bế"]);
  // Mục B "Kỵ riêng theo việc đất đai" — Bước 1b: Động Thổ kỵ thêm Kiến/Bình/Thâu (Phá đã ở trên).
  // ⚠️ Nguồn KHÔNG liệt Trực Mãn vào bất kỳ danh sách kỵ nào (dù mục D xếp Mãn là "Hung" trong bảng
  // Cát/Hung tổng quát) — không tự suy thêm ngoài đúng 2 danh sách A+B đã nêu tên cụ thể.
  const TRUC_KY_RIENG_DONG_THO = new Set(["Kiến", "Bình", "Thâu"]);
  const trucKyChung = TRUC_KY_CHUNG.has(trucKetQua.name);
  const trucKyRieng = input.loaiViec === "dong_tho" && TRUC_KY_RIENG_DONG_THO.has(trucKetQua.name);
  const trucKy = trucKyChung || trucKyRieng;
  if (trucKy) {
    phamBuoc1.push(
      trucKyChung
        ? `Trực ${trucKetQua.name} — kỵ chung mọi việc`
        : `Trực ${trucKetQua.name} — kỵ riêng cho Động Thổ`,
    );
  }

  // Lục Xung Chi ngày với Tọa (chỉ tính được khi Tọa là 1 trong 12 sơn Địa Chi) — "bổ sung mới"
  // theo bảng cổng cứng SKILL.md, trước đây chỉ xét xung với năm sinh gia chủ, chưa xét xung Tọa.
  const LUC_XUNG_B1: Record<Chi, Chi> = {
    Tý: "Ngọ", Sửu: "Mùi", Dần: "Thân", Mão: "Dậu", Thìn: "Tuất", Tỵ: "Hợi",
    Ngọ: "Tý", Mùi: "Sửu", Thân: "Dần", Dậu: "Mão", Tuất: "Thìn", Hợi: "Tỵ",
  };
  if (CHI_ORDER_TRUC.includes(input.toaNha as Chi) && LUC_XUNG_B1[truNgay.chi] === input.toaNha) {
    phamBuoc1.push(`Chi ngày (${truNgay.chi}) xung Tọa (${input.toaNha})`);
  }
  // Lục Xung Chi ngày với Mệnh Chủ PHỤ (vợ/chồng) — trước đây chỉ xét Mệnh Chủ chính (Bước 5a).
  if (menhChuPhu) {
    const chiMenhPhu = Scoring.getChi(input.namSinhVoChong!);
    if (LUC_XUNG_B1[truNgay.chi] === chiMenhPhu) {
      phamBuoc1.push(`Chi ngày (${truNgay.chi}) xung năm sinh vợ/chồng gia chủ (${chiMenhPhu})`);
    }
  }

  // Kim Lâu / Hoang Ốc / Tam Tai — chỉ soát khi ĐỘNG THỔ/khởi công (nguồn: Bước 1c), theo tuổi mụ
  // gia chủ chính trong năm DƯƠNG LỊCH của ngày giám định (cùng quy ước tính tuổi mụ đã dùng ở các
  // module khác trong dự án — không quy đổi qua năm âm lịch).
  let soatTuoiGiaChuKetQua: XemNgayCaoCapResult["soatTuoiGiaChu"] = null;
  if (input.loaiViec === "dong_tho") {
    // Canh Chi dùng để soát "8 tuổi miễn kỵ" là Can Chi NĂM SINH gia chủ (đã có sẵn trong menhChuChinh).
    const soat = XemNgayCaoCap.soatTuoiGiaChu(input.namSinhGiaChuChinh, nam, menhChuChinh.canChiNamSinh);
    const phamTamTaiGiaChu = XemNgayCaoCap.getNhomTuoiPhamTamTai(truNam.chi).some((nhom) =>
      (nhom as readonly Chi[]).includes(Scoring.getChi(input.namSinhGiaChuChinh)),
    );
    soatTuoiGiaChuKetQua = { ...soat, phamTamTai: phamTamTaiGiaChu };
    if (apDungLocDanGian) {
      if (soat.mucDo === "nen_muon_tuoi") {
        phamBuoc1.push(
          `Tuổi gia chủ (${soat.tuoiMu} mụ): cả Kim Lâu (${soat.kimLau.cung}) và Hoang Ốc (${soat.hoangOc.cung}) đều xấu — nên mượn tuổi hoặc lùi năm.`,
        );
      }
      if (phamTamTaiGiaChu) {
        phamBuoc1.push(`Gia chủ phạm Tam Tai năm ${truNam.can} ${truNam.chi}.`);
      }
    }
  }

  const buoc1Dat = phamBuoc1.length === 0;
  chieuTungBuoc.push({
    buoc: 1,
    ten: "Lọc thô thần sát dân gian + Trực + Lục Xung",
    trangThai: buoc1Dat ? "dat" : "khong_dat",
    lyDo: buoc1Dat
      ? apDungLocDanGian
        ? "Không phạm thần sát dân gian nào, Trực không kỵ, không xung Tọa/Mệnh Chủ."
        : "Lớp lọc dân gian ĐANG TẮT theo yêu cầu — chỉ Trực và Lục Xung đã được kiểm tra."
      : phamBuoc1.join(" · "),
  });

  // =============================================================================================
  // BƯỚC 3 — phương vị sát (bộ lọc phủ quyết, chạy TRƯỚC Bước 5 theo đúng bài học Bài 4 của nguồn)
  // =============================================================================================
  const phamSat: string[] = [];
  let thieuDuLieuSat = false;

  // Ngũ Hoàng — chỉ xét Năm và Tháng.
  const nhNam = XemNgayCaoCap.traNguHoangNam(nam);
  if (!nhNam.tinhDuocKhong) {
    thieuDuLieuSat = true;
    diemLuuY.push(`Ngũ Hoàng năm: ${nhNam.lyDo}`);
  } else if (nhNam.cungNguHoang === cungToa) {
    phamSat.push(`Ngũ Hoàng năm đáo Tọa (cung ${cungToa}) — không có phép hóa giải`);
  } else if (cungHuong && nhNam.cungNguHoang === cungHuong) {
    phamSat.push(`Ngũ Hoàng năm đáo Hướng (cung ${cungHuong}) — không có phép hóa giải`);
  }

  const nhThang = XemNgayCaoCap.traNguHoangThang(nam, truThang.can, truThang.chi);
  if (!nhThang.tinhDuocKhong) {
    thieuDuLieuSat = true;
    diemLuuY.push(`Ngũ Hoàng tháng: ${nhThang.lyDo}`);
  } else if (nhThang.cungNguHoang === cungToa) {
    phamSat.push(`Ngũ Hoàng tháng đáo Tọa (cung ${cungToa}) — không có phép hóa giải`);
  } else if (cungHuong && nhThang.cungNguHoang === cungHuong) {
    phamSat.push(`Ngũ Hoàng tháng đáo Hướng (cung ${cungHuong}) — không có phép hóa giải`);
  }

  // Tam Sát — xét cả 3 trụ Năm/Tháng/Ngày (Giờ chưa có ở chế độ giám định ngày).
  if (phuongToa === null) {
    thieuDuLieuSat = true;
    diemLuuY.push(
      `Tọa "${input.toaNha}" là sơn duy (nằm đúng ranh giới 2 phương) — cần nhập ĐỘ SỐ la bàn thực tế mới xét được Tam Sát và Bước 2. Hệ thống không tự suy đoán.`,
    );
  } else {
    for (const [tenTru, tru] of [
      ["Năm", truNam],
      ["Tháng", truThang],
      ["Ngày", truNgay],
    ] as const) {
      if (XemNgayCaoCap.phamTamSat(phuongToa, tru.chi)) {
        phamSat.push(`Tam Sát: Chi ${tru.chi} của trụ ${tenTru} phạm Tam Sát của tọa phương ${phuongToa}`);
      }
    }
  }

  // Bát Sát — xét cả 3 trụ, theo cung Tọa (và cung Hướng nếu có).
  for (const [tenTru, tru] of [
    ["Năm", truNam],
    ["Tháng", truThang],
    ["Ngày", truNgay],
  ] as const) {
    if (XemNgayCaoCap.phamBatSat(cungToa, tru.can, tru.chi)) {
      phamSat.push(`Bát Sát Hoàng Tuyền: trụ ${tenTru} (${tru.can} ${tru.chi}) phạm Bát Sát của cung Tọa ${cungToa}`);
    }
    if (cungHuong && XemNgayCaoCap.phamBatSat(cungHuong, tru.can, tru.chi)) {
      phamSat.push(`Bát Sát Hoàng Tuyền: trụ ${tenTru} (${tru.can} ${tru.chi}) phạm Bát Sát của cung Hướng ${cungHuong}`);
    }
  }

  // Thái Tuế / Tuế Phá — chỉ xét Năm.
  if (XemNgayCaoCap.phamThaiTue(input.toaNha, truNam.chi)) phamSat.push(`Thái Tuế đáo Tọa (${input.toaNha} trùng Chi năm ${truNam.chi})`);
  if (XemNgayCaoCap.phamTuePha(input.toaNha, truNam.chi)) phamSat.push(`Tuế Phá đáo Tọa (${input.toaNha} xung Chi năm ${truNam.chi})`);
  if (input.huongNha) {
    if (XemNgayCaoCap.phamThaiTue(input.huongNha, truNam.chi)) phamSat.push(`Thái Tuế đáo Hướng (${input.huongNha})`);
    if (XemNgayCaoCap.phamTuePha(input.huongNha, truNam.chi)) phamSat.push(`Tuế Phá đáo Hướng (${input.huongNha})`);
  }

  // Mậu Kỷ Đô Thiên + Âm Phủ Thái Tuế — theo Can năm, xét Tọa (và Hướng).
  const mkToa = XemNgayCaoCap.kiemMauKyDoThien(truNam.can, input.toaNha);
  if (mkToa.phamMau) phamSat.push(`Mậu Đô Thiên Sát đáo Tọa (${input.toaNha})`);
  if (mkToa.phamKy) phamSat.push(`Kỷ Đô Thiên Sát đáo Tọa (${input.toaNha})`);
  if (mkToa.phamBang) diemLuuY.push(`Tọa ${input.toaNha} phạm Bàng Mậu Kỷ Đô Thiên (mức nhẹ hơn Chính) — nên lưu ý.`);
  const apToa = XemNgayCaoCap.kiemAmPhuThaiTue(truNam.can, input.toaNha);
  if (apToa.phamChinh) phamSat.push(`Chính Âm Phủ Thái Tuế đáo Tọa (${input.toaNha}) — tối kỵ khai sơn lập hướng`);
  if (apToa.phamBang) diemLuuY.push(`Tọa ${input.toaNha} phạm Bàng Âm Phủ Thái Tuế (mức nhẹ hơn) — nên lưu ý.`);
  if (apToa.bangKhongDoiChieuDuoc) {
    diemLuuY.push(
      "Bàng Âm Phủ Thái Tuế của năm này rơi vào Can Mậu/Kỷ — 2 Can không có phương vị trên vòng 24 sơn nên KHÔNG đối chiếu được với Tọa/Hướng (chưa soát được mục này, không phải là 'không phạm').",
    );
  }

  // Mộ Long Biến Vận Sát (Hồng Phạm Ngũ Hành) — Thái Tuế khắc khố của nhóm Long thì phạm.
  const moLong = XemNgayCaoCap.kiemMoLongBienVan(canChi.year.canIndex, canChi.year.chiIndex, input.toaNha);
  if (moLong.pham) phamSat.push(`Mộ Long Biến Vận Sát đáo Tọa — ${moLong.lyDo}`);

  const buoc3Dat = phamSat.length === 0;
  chieuTungBuoc.push({
    buoc: 3,
    ten: "Kiểm phương vị sát (Ngũ Hoàng / Tam Sát / Bát Sát / Thái Tuế / Tuế Phá / Mậu Kỷ Đô Thiên / Âm Phủ Thái Tuế / Mộ Long Biến Vận)",
    trangThai: buoc3Dat ? (thieuDuLieuSat ? "thieu_du_lieu" : "dat") : "khong_dat",
    lyDo: buoc3Dat
      ? thieuDuLieuSat
        ? "Không phát hiện sát ở các mục tra được, NHƯNG còn mục thiếu dữ liệu (xem Điểm cần lưu ý) — chưa thể kết luận an toàn tuyệt đối."
        : "Không phạm sát nào ở Tọa và Hướng."
      : phamSat.join(" · "),
  });

  // =============================================================================================
  // BƯỚC 2 — khung tháng theo Tọa (không loại cứng, chỉ xếp hạng)
  // =============================================================================================
  if (phuongToa === null) {
    chieuTungBuoc.push({
      buoc: 2,
      ten: "Khung tháng theo Tọa",
      trangThai: "thieu_du_lieu",
      lyDo: `Chưa xác định được phương của tọa "${input.toaNha}" (sơn duy, cần độ số la bàn).`,
    });
  } else {
    const nhan = XemNgayCaoCap.nhanThangTheoToa(phuongToa, truThang.chi);
    const tenNhom: Record<string, string> = {
      tu_hop: "Tự hợp theo mùa (ưu tiên cao nhất — nhất khí thuần thanh)",
      sinh_hop: "Sinh hợp theo mùa",
      tam_hop: "Tam hợp theo mùa",
    };
    if (nhan.nhom) {
      yeuTo.nhomThang = nhan.nhom;
      diemManh.push(`Tháng ${truThang.chi} thuộc nhóm ${tenNhom[nhan.nhom]} của tọa phương ${phuongToa}.`);
    }
    if (nhan.laTuMo) {
      diemLuuY.push(
        `Tháng ${truThang.chi} là tháng Tứ Mộ — nửa đầu tháng còn khí mùa trước, nửa sau mới chuyển sang khí Thổ. Cần xác định rõ đang dùng nửa nào (ranh giới theo tiết khí) trước khi chốt ngày.`,
      );
    }
    // Phương pháp B — Bổ Long Tam Cục. ĐỘC LẬP với phương pháp A: nguồn ghi rõ nếu 2 cách lệch
    // nhau thì KHÔNG có quy tắc phân xử cứng, phải nêu cả hai chứ không tự chọn một bên.
    const boLong = XemNgayCaoCap.tinhBoLongTamCuc(input.toaNha);
    const cucDung = boLong.uuTien;
    if (cucDung && XemNgayCaoCap.chiThuocCuc(cucDung, truThang.chi)) {
      yeuTo.thuocCucBoLong = true;
      const tenCuc: Record<string, string> = { an_cuc: "Ấn cục", tai_cuc: "Tài cục", vuong_cuc: "Vượng cục" };
      diemManh.push(
        `Bổ Long Tam Cục: tháng ${truThang.chi} thuộc ${tenCuc[cucDung.loai]} (${cucDung.hanh}) của Long tọa ${input.toaNha} (hành ${boLong.hanhLong}).`,
      );
    } else if (cucDung) {
      diemLuuY.push(
        `Bổ Long Tam Cục: Long tọa ${input.toaNha} hành ${boLong.hanhLong}, cục nên dùng là ${cucDung.hanh} (${(cucDung.chi ?? []).join(" - ")}) — tháng ${truThang.chi} không thuộc cục này.`,
      );
    }

    chieuTungBuoc.push({
      buoc: 2,
      ten: "Khung tháng theo Tọa",
      trangThai: nhan.nhom ? "dat" : "khong_dat",
      lyDo: nhan.nhom
        ? `Tháng ${truThang.chi} thuộc nhóm ${tenNhom[nhan.nhom]}.`
        : `Tháng ${truThang.chi} không thuộc nhóm tháng ưu tiên nào của tọa phương ${phuongToa} (không loại ngày, chỉ xếp hạng thấp hơn).`,
    });
  }

  // =============================================================================================
  // BƯỚC 4 — đã quy xong Tứ Trụ + Tọa + Mệnh Chủ về HKNH/Quái Vận ở trên
  // =============================================================================================
  chieuTungBuoc.push({
    buoc: 4,
    ten: "Quy Tứ Trụ / Tọa / Mệnh Chủ về HKNH — Quái Vận",
    trangThai: queToa ? "dat" : "thieu_du_lieu",
    lyDo: `Năm ${truNam.can} ${truNam.chi} (${truNam.hknh}/${truNam.quaiVan}) · Tháng ${truThang.can} ${truThang.chi} (${truThang.hknh}/${truThang.quaiVan}) · Ngày ${truNgay.can} ${truNgay.chi} (${truNgay.hknh}/${truNgay.quaiVan}) · Tọa ${queToa ? `${queToa.hknh}/${queToa.quaiVan}` : "CHƯA CÓ (cần đọc từ la kinh 64 quẻ)"} · Mệnh Chủ ${menhChuChinh.hknh}/${menhChuChinh.quaiVan}`,
  });

  // =============================================================================================
  // BƯỚC 5 — luận cách cục HKĐQ
  // =============================================================================================
  const lyDo5: string[] = [];
  let buoc5Dat = true;

  // 5a — địa chi Tứ Trụ không xung nhau, không xung năm sinh mệnh chủ (chiều 1 chiều: Năm→Tháng/Ngày, Tháng→Ngày).
  const LUC_XUNG: Record<Chi, Chi> = {
    Tý: "Ngọ", Sửu: "Mùi", Dần: "Thân", Mão: "Dậu", Thìn: "Tuất", Tỵ: "Hợi",
    Ngọ: "Tý", Mùi: "Sửu", Thân: "Dần", Dậu: "Mão", Tuất: "Thìn", Hợi: "Tỵ",
  };
  const capXung: string[] = [];
  if (LUC_XUNG[truNam.chi] === truThang.chi) capXung.push("Năm xung Tháng");
  if (LUC_XUNG[truNam.chi] === truNgay.chi) capXung.push("Năm xung Ngày");
  if (LUC_XUNG[truThang.chi] === truNgay.chi) capXung.push("Tháng xung Ngày");
  const chiMenhChinh = Scoring.getChi(input.namSinhGiaChuChinh);
  for (const [tenTru, tru] of [
    ["Năm", truNam],
    ["Tháng", truThang],
    ["Ngày", truNgay],
  ] as const) {
    if (LUC_XUNG[tru.chi] === chiMenhChinh) capXung.push(`Trụ ${tenTru} (${tru.chi}) xung năm sinh gia chủ (${chiMenhChinh})`);
  }
  if (capXung.length > 0) {
    buoc5Dat = false;
    lyDo5.push(`5a — Địa chi xung: ${capXung.join(", ")}.`);
  } else {
    lyDo5.push("5a — Địa chi Tứ Trụ không xung nhau và không xung năm sinh gia chủ.");
  }

  // 5e — Tam Tài: Nhật Khóa PHẢI giao Sơn Gia VÀ giao Mệnh Chủ chính (điều kiện bắt buộc).
  // Khi so Ngày ↔ Tọa: Tọa là "chủ". Khi so Ngày ↔ Mệnh Chủ: theo nguồn ưu tiên "Ngày sinh Chủ" → Mệnh Chủ là "chủ".
  const giaoNgayMenh = XemNgayCaoCap.xetGiao(truNgay.hknh, menhChuChinh.hknh, menhChuChinh.hknh);
  if (queToa) {
    const giaoNgayToa = XemNgayCaoCap.xetGiao(truNgay.hknh, queToa.hknh, queToa.hknh);
    if (giaoNgayToa.giaoDuoc) {
      yeuTo.giaoSonGia = giaoNgayToa.mucDat;
      diemManh.push(`Nhật Khóa giao được Sơn Gia (Tọa): ${moTaQuanHe(giaoNgayToa.mucDat)}.`);
    } else {
      buoc5Dat = false;
      lyDo5.push(`5e — Nhật Khóa KHÔNG giao được Sơn Gia (Ngày ${truNgay.hknh} ↔ Tọa ${queToa.hknh}).`);
    }
  } else {
    lyDo5.push("5e — Chưa xét được Nhật Khóa ↔ Sơn Gia vì thiếu quẻ Tọa.");
  }
  if (giaoNgayMenh.giaoDuoc) {
    yeuTo.giaoMenhChuChinh = giaoNgayMenh.mucDat;
    diemManh.push(`Nhật Khóa giao được Mệnh Chủ chính: ${moTaQuanHe(giaoNgayMenh.mucDat)}.`);
  } else {
    buoc5Dat = false;
    lyDo5.push(`5e — Nhật Khóa KHÔNG giao được Mệnh Chủ chính (Ngày ${truNgay.hknh} ↔ Mệnh Chủ ${menhChuChinh.hknh}). Theo nguồn: giao Sơn Gia mà không giao Mệnh Chủ thì KHÔNG chọn — hoặc đổi người đứng chủ trì sang thành viên khác hợp hơn.`);
  }

  // Quan hệ Tọa (Địa) ↔ Mệnh Chủ (Nhân): Địa sinh Nhân, hoặc Nhân khắc Địa thì tốt (Công đã chốt).
  if (queToa) {
    const skToaMenh = XemNgayCaoCap.xetSinhKhac(menhChuChinh.hknh, queToa.hknh);
    const qhToaMenh = XemNgayCaoCap.xetQuanHe(queToa.hknh, menhChuChinh.hknh);
    if (qhToaMenh !== "khong_giao") {
      yeuTo.toaGiaoMenhChu = true;
      diemManh.push(`Tọa giao Mệnh Chủ: ${moTaQuanHe(qhToaMenh)}.`);
    } else if (skToaMenh === "sinh_nhap" || skToaMenh === "khac_xuat") {
      yeuTo.toaGiaoMenhChu = true;
      // Mệnh Chủ là chủ: sinh_nhap = Địa sinh Nhân; khac_xuat = Nhân khắc Địa.
      diemManh.push(`Tọa ↔ Mệnh Chủ: ${skToaMenh === "sinh_nhap" ? "Địa sinh Nhân" : "Nhân khắc Địa"} — đạt yêu cầu của nguồn.`);
    } else {
      diemLuuY.push(`Quan hệ Tọa ↔ Mệnh Chủ chưa đạt (${moTaQuanHe(skToaMenh)}); nguồn yêu cầu Địa sinh Nhân hoặc Nhân khắc Địa.`);
    }
  }

  // Mệnh Chủ phụ — chỉ tăng điểm ưu tiên, không loại ngày.
  if (menhChuPhu) {
    const giaoPhu = XemNgayCaoCap.xetGiao(truNgay.hknh, menhChuPhu.hknh, menhChuPhu.hknh);
    if (giaoPhu.giaoDuoc) {
      yeuTo.giaoMenhChuPhu = giaoPhu.mucDat;
      diemManh.push(`Nhật Khóa giao thêm được Mệnh Chủ phụ: ${moTaQuanHe(giaoPhu.mucDat)}.`);
    }
    else diemLuuY.push("Nhật Khóa không giao được Mệnh Chủ phụ (không loại ngày, chỉ giảm mức ưu tiên).");
  }

  // 5b bổ sung — 2 cặp Hà Đồ khắc nhau trong Tứ Trụ.
  const hknhTuTru = [truNam.hknh, truThang.hknh, truNgay.hknh];
  if ((yeuTo.haiCapHaDoKhacNhau = XemNgayCaoCap.coHaiCapHaDoKhacNhau(hknhTuTru))) {
    diemLuuY.push("Tứ Trụ có 2 nhóm Hà Đồ khắc nhau cùng xuất hiện (Thủy-Hỏa hoặc Mộc-Kim) — nguồn khuyến cáo không nên.");
  }

  // 5f — âm dương.
  if (XemNgayCaoCap.laThuanAmHoacThuanDuong(hknhTuTru)) {
    diemLuuY.push(
      `Tứ Trụ thuần ${hknhTuTru[0]! % 2 === 1 ? "dương" : "âm"} — tốc phát nhưng ngắn hạn, nguồn khuyến cáo KHÔNG dùng cho ${input.loaiViec === "nhap_trach" ? "nhập trạch" : "động thổ"} (việc cần độ bền).`,
    );
  } else {
    yeuTo.amDuongHaiHoa = true;
    diemManh.push("Âm dương Tứ Trụ hài hòa (không thuần âm, không thuần dương).");
  }

  // Quan hệ nội bộ: Ngày với Năm/Tháng (trụ Ngày làm chuẩn).
  for (const [tenTru, tru] of [
    ["Năm", truNam],
    ["Tháng", truThang],
  ] as const) {
    const qh = XemNgayCaoCap.xetQuanHe(truNgay.hknh, tru.hknh);
    if (qh !== "khong_giao") {
      yeuTo.soTruHoTroNgay++;
      diemManh.push(`Trụ Ngày ↔ trụ ${tenTru}: ${moTaQuanHe(qh)}.`);
    } else {
      const sk = XemNgayCaoCap.xetSinhKhac(truNgay.hknh, tru.hknh);
      if (XemNgayCaoCap.laSinhKhacTot(sk)) {
        yeuTo.soTruHoTroNgay++;
        diemManh.push(`Trụ Ngày được trụ ${tenTru} ${moTaQuanHe(sk)}.`);
      }
    }
  }

  // Lý tưởng theo nguồn: 3 địa chi Tứ Trụ tạo tam hợp với Tọa. Chỉ tính được khi tọa là sơn Địa
  // Chi (12/24 sơn) — sơn Thiên Can/tứ duy không có Chi nên bỏ qua, không suy đoán.
  const CHI_LIST: readonly string[] = Data.CHI;
  if (CHI_LIST.includes(input.toaNha)) {
    const chiToa = input.toaNha as Chi;
    const nhom = XemNgayCaoCap.TAM_HOP_CUC;
    const cucChuaToa = Object.values(nhom).find((bo) => (bo as readonly string[]).includes(chiToa));
    if (cucChuaToa) {
      const chiTuTru = [truNam.chi, truThang.chi, truNgay.chi];
      const soTrongCuc = chiTuTru.filter((c) => (cucChuaToa as readonly string[]).includes(c)).length;
      if (soTrongCuc >= 2) {
        yeuTo.tamHopVoiToa = true;
        diemManh.push(`Địa chi Tứ Trụ hợp cục tam hợp với Tọa ${chiToa} (${soTrongCuc}/3 trụ trong cục ${(cucChuaToa as readonly string[]).join("-")}).`);
      }
    }
  }

  chieuTungBuoc.push({
    buoc: 5,
    ten: "Luận cách cục Huyền Không Đại Quái (Tam Tài Thiên - Địa - Nhân giao)",
    trangThai: !queToa ? "thieu_du_lieu" : buoc5Dat ? "dat" : "khong_dat",
    lyDo: lyDo5.join(" "),
  });

  // =============================================================================================
  // BƯỚC 6 — chọn giờ (chạy sau khi đã có ngày; "không hy sinh chất lượng Ngày để lấy Giờ đẹp")
  // =============================================================================================
  const CHI_12: readonly Chi[] = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const chiToa = (CHI_12 as readonly string[]).includes(input.toaNha) ? (input.toaNha as Chi) : undefined;
  const gioDeXuat = XemNgayCaoCap.xepHangGio({
    chiNgay: truNgay.chi,
    ...(chiToa ? { chiToa } : {}),
    ...(phuongToa ? { phuongToa } : {}),
  });
  const soGioHoangDao = gioDeXuat.filter((g) => g.laHoangDao && !g.phamTamSatGio && !g.xungChiNgay).length;
  chieuTungBuoc.push({
    buoc: 6,
    ten: "Chọn giờ (Hoàng Đạo theo Chi ngày + hợp cục với tọa)",
    trangThai: soGioHoangDao > 0 ? "dat" : "khong_dat",
    lyDo:
      soGioHoangDao > 0
        ? `Có ${soGioHoangDao} giờ Hoàng Đạo không xung Chi ngày và không phạm Tam Sát. Giờ tốt nhất: ${gioDeXuat[0]!.chiGio} (${gioDeXuat[0]!.khungGio}, sao ${gioDeXuat[0]!.tenSao}).`
        : "Không còn giờ Hoàng Đạo nào sạch trong ngày này (đều xung Chi ngày hoặc phạm Tam Sát) — nên cân nhắc đổi ngày.",
  });

  // ----- Kết luận -----
  let ketLuan: XemNgayCaoCapResult["ketLuan"];
  if (!buoc1Dat || !buoc3Dat || (queToa && !buoc5Dat)) ketLuan = "khong_dung";
  else if (!queToa || thieuDuLieuSat || diemLuuY.length > 0) ketLuan = "dung_duoc_co_dieu_kien";
  else ketLuan = "dung_duoc";

  if (!apDungLocDanGian) {
    diemLuuY.push(
      "⚠️ Đã tắt lớp lọc dân gian theo yêu cầu — kết quả CHƯA qua kiểm tra Tam Nương, Nguyệt Kỵ, Sát Chủ, Kim Thần Thất Sát, Kim Lâu-Hoang Ốc-Tam Tai. Đây là các lớp thần sát dân gian cổ truyền, tách biệt với Huyền Không Đại Quái (Ngũ Hoàng/Tam Sát/Bát Sát/Tam Tài vẫn đã kiểm tra đầy đủ, không bị ảnh hưởng).",
    );
  }

  return {
    ngayDuongLich: { nam, thang, ngay },
    amLich: { ngay: lunar.day, thang: lunar.month, nam: lunar.year, nhuan: lunar.isLeapMonth },
    tuTru: { nam: truNam, thang: truThang, ngay: truNgay },
    toaNha: {
      ten: input.toaNha,
      cung: cungToa,
      phuong: phuongToa,
      hknh: queToa?.hknh ?? null,
      quaiVan: queToa?.quaiVan ?? null,
    },
    ...(input.huongNha && cungHuong ? { huongNha: { ten: input.huongNha, cung: cungHuong } } : {}),
    menhChuChinh,
    ...(menhChuPhu ? { menhChuPhu } : {}),
    ketLuan,
    chieuTungBuoc: chieuTungBuoc.sort((a, b) => a.buoc - b.buoc),
    diemManh,
    diemLuuY,
    gioDeXuat,
    truc: { ten: trucKetQua.name, totCho: !trucKy },
    locDanGian,
    soatTuoiGiaChu: soatTuoiGiaChuKetQua,
    yeuTo,
  };
}
