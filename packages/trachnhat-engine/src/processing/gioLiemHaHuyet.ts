/**
 * MODULE THU PHÍ — Chọn giờ liệm / giờ đóng quan / ngày giờ hạ huyệt (đặc tả chủ dự án cung cấp
 * 2026-08-14). Lớp facade: nhận ngày giờ mất DƯƠNG LỊCH (không phải âm lịch như công cụ Tính
 * Trùng Tang miễn phí) + năm sinh dương lịch, tự quy đổi âm lịch, tự tính mọi Can Chi ngày/giờ
 * thật, rồi gọi các hàm thuần trong `TrungTang.*` (rule-engine, `gioLiemHaHuyet.ts`) để xếp hạng.
 *
 * KHÔNG chẩn đoán lại Trùng Tang — chỉ dùng `TrungTang.tinhBonCungTrungTang` (đã có, dùng chung
 * với công cụ miễn phí) để lấy 4 cung làm nền cho việc xếp hạng giờ/ngày.
 */
import { Astronomy, Calendar, Data, getCanChi, getLunarDate, getSolarTerms } from "@thien-anh/calendar-core";
import { TrachNhat, TrungTang, Scoring } from "@thien-anh/rule-engine";

type Can = Data.Can;
type Chi = Data.Chi;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const NAM_TOI_THIEU = 1900;
const NAM_TOI_DA = 2100;
/** Bước 5 — quét tối đa 20 ngày thực để tránh vòng lặp vô hạn, giữ lại tối đa 10 ứng viên qua lọc tuyệt đối. */
const SO_NGAY_QUET_TOI_DA = 20;
const SO_NGAY_UNG_VIEN_GIU_LAI = 10;
/** Trực không thuộc nhóm này thì được coi là "tốt" (bước 7 mục 10.3, dòng "+5 nếu Trực không phải Kiến/Phá/Thu"). */
const TRUC_XAU = new Set(["Kiến", "Phá", "Thu"]);
/**
 * TẦNG 4 — trọng số cát thần. Đặc tả gốc KHÔNG quy định con số, nên đặt thấp hơn hẳn tầng cung
 * (Nhập Mộ 100 / Thiên Di 40) và hoàng đạo (50): cát thần là để "cứu" và phân định giữa các ngày
 * đã sạch thần sát, không được phép lật ngược thứ hạng do cung và hoàng đạo quyết định.
 */
const DIEM_TUE_DUC = 12;
const DIEM_TUE_DUC_HOP = 8;
const DIEM_NGUYET_DUC = 12;
const DIEM_NGUYET_DUC_HOP = 8;
/**
 * Tam Đại Cát Tinh (Sát Cống / Trực Tinh / Nhân Chuyên) — chủ dự án gọi là "ba sao CỰC KỲ CÁT",
 * mạnh hơn hẳn Tuế Đức/Nguyệt Đức nên cho trọng số cao hơn. Vẫn giữ dưới ngưỡng cung Nhập Mộ
 * (100) để không lật được thứ hạng do cung quyết định. Một ngày chỉ trúng tối đa 1 trong 3 sao
 * (đã kiểm: 3 bảng không giao nhau trong cùng nhóm tháng) nên không có chuyện cộng dồn.
 */
const DIEM_TAM_DAI_CAT_TINH = 30;
/**
 * Phạt cho ngày vốn phạm hung nhưng được Tam Đại Cát Tinh hoá. Đặc tả không cho con số, nhưng
 * THỨ TỰ thì bắt buộc: ngày được cứu phải luôn xếp SAU ngày vốn đã sạch. Nên phạt phải lớn hơn
 * phần thưởng cát tinh (30) — chọn 50 để ngày được cứu ròng -20 so với ngày sạch tương đương.
 */
const DIEM_PHAT_HUNG_DA_HOA_GIAI = 50;

/** monthOrderIndex 0-11 (0 = Dần sau Lập Xuân) → mùa theo TIẾT KHÍ, dùng cho Tứ Phế. */
const MUA_THEO_MONTH_ORDER: readonly TrungTang.MuaTuPhe[] = [
  "Xuân", "Xuân", "Xuân", "Hạ", "Hạ", "Hạ", "Thu", "Thu", "Thu", "Đông", "Đông", "Đông",
];

/** Đệm mặc định trước giờ hạ huyệt khi tính giờ động quan (mục 9b: "nên tới sớm rồi chờ"). */
const DEM_DONG_QUAN_PHUT_MAC_DINH = 45;
/** Khoảng thời gian di chuyển hợp lệ (mục 2 đặc tả). */
const DI_CHUYEN_PHUT_TOI_THIEU = 5;
const DI_CHUYEN_PHUT_TOI_DA = 480;
/** Khung "đêm khuya" dùng để cảnh báo giờ động quan bất khả thi (23h-5h). */
const DEM_KHUYA_TU_PHUT = 23 * 60;
const DEM_KHUYA_DEN_PHUT = 5 * 60;

/** Giờ dân sự đại diện (0-23) cho mỗi Chi giờ — cùng quy ước với `gioBang.ts`. */
function representativeHour(chiIndex: number): number {
  return chiIndex === 0 ? 0 : 2 * chiIndex - 1;
}

/**
 * Mốc chuyển ngày (dữ liệu gốc `chon_gio_liem.moc_chuyen_ngay`): ngày Can Chi khởi từ giờ Tý =
 * **23h của ngày dương lịch liền TRƯỚC**. Chỉ giờ Tý bị ảnh hưởng, 11 chi giờ còn lại nằm gọn
 * trong ngày dương cùng tên với ngày trụ.
 *
 * Trả về số phút kể từ 0h của NGÀY TRỤ, nên giờ Tý ra `-60` (tức 23:00 hôm trước). Đây là chi
 * tiết sống còn với tang lễ: nếu hiển thị "giờ Tý ngày 20/8" mà gia chủ hiểu là 0h ngày 20/8
 * trong khi thầy định 23h ngày 19/8 thì lệch hẳn một ngày.
 */
function phutBatDauKhungGio(chiIndex: number): number {
  return chiIndex === 0 ? -60 : (2 * chiIndex - 1) * 60;
}

function formatGioPhut(phutTrongNgay: number): string {
  const p = ((phutTrongNgay % 1440) + 1440) % 1440;
  return `${String(Math.floor(p / 60)).padStart(2, "0")}:${String(p % 60).padStart(2, "0")}`;
}

export interface KhungGioThucTe {
  /** Mốc bắt đầu khung 2 tiếng của chi giờ, dạng "HH:mm". */
  batDau: string;
  ketThuc: string;
  /** Ngày dương lịch chứa mốc BẮT ĐẦU — với giờ Tý là ngày liền TRƯỚC ngày trụ Can Chi. */
  ngayBatDau: NgayDuongLich;
  /** true khi khung giờ vắt qua nửa đêm (chỉ xảy ra với giờ Tý). */
  vatQuaNuaDem: boolean;
}

function tinhKhungGio(jdnNgayTru: number, chiIndex: number): KhungGioThucTe {
  const batDau = phutBatDauKhungGio(chiIndex);
  return {
    batDau: formatGioPhut(batDau),
    ketThuc: formatGioPhut(batDau + 120),
    ngayBatDau: jdnToNgayDuongLich(jdnNgayTru + Math.floor(batDau / 1440)),
    vatQuaNuaDem: chiIndex === 0,
  };
}

/**
 * Cung_Ngày sau `soNgay` ngày kể từ một cung ngày đã biết. Vì Cung_Ngày(N) = Cung_Tháng + s*N,
 * qua mỗi ngày cung chỉ nhích 1 bậc: nam thuận (+1), nữ nghịch (-1).
 */
function dichCungTheoNgay(cungNgayGoc: Chi, gioiTinh: TrungTang.GioiTinh, soNgay: number): Chi {
  const s = gioiTinh === "nam" ? 1 : -1;
  const idx = Data.CHI.indexOf(cungNgayGoc);
  return Data.CHI[(((idx + s * soNgay) % 12) + 12) % 12]!;
}

/** Mốc tuyệt đối (phút) của thời điểm bắt đầu 1 chi giờ, để so sánh trước/sau giữa các ngày. */
function mocTuyetDoiPhut(jdnNgayTru: number, chiIndex: number): number {
  return jdnNgayTru * 1440 + phutBatDauKhungGio(chiIndex);
}

function jdnToNgayDuongLich(jdn: number): NgayDuongLich {
  const d = Astronomy.julianDayNumberToCalendarDate(jdn);
  return { nam: d.year, thang: d.month, ngay: d.day };
}

export interface GioLiemHaHuyetThanQuyenInput {
  chiTruongNam?: Chi;
  chiConDauLon?: Chi;
  chiChauDichTon?: Chi;
  /** Dùng thay thế khi không có trưởng nam/con dâu lớn/cháu đích tôn. */
  chiAnhTraiLon?: Chi;
  chiChaMe?: readonly Chi[];
}

export interface GioLiemHaHuyetInput {
  gioiTinh: TrungTang.GioiTinh;
  /** Năm sinh DƯƠNG LỊCH của người mất — dùng tính tuổi ta (= năm mất dương lịch - năm sinh + 1). */
  namSinhDuongLich: number;
  namMat: number;
  thangMat: number;
  ngayMat: number;
  /** 1 trong 12 Chi — khung giờ mất (mỗi Chi phủ 2 tiếng). */
  chiGioMat: Chi;
  /** Số ngày dự kiến tới khi hạ huyệt — bỏ trống hoặc ≤3 sẽ áp quy tắc miễn trừ (bước 4). */
  soNgayDuKienToiChon?: number;
  thanQuyen?: GioLiemHaHuyetThanQuyenInput;
  /**
   * Bước 6b — thời gian di chuyển từ nhà tới huyệt/nơi hoả táng (phút, 5-480). Bỏ trống thì
   * không tính giờ động quan (không tự đoán quãng đường).
   */
  thoiGianDiChuyenPhut?: number;
  /** Đệm đi sớm trước giờ hạ huyệt, mặc định 45 phút (mục 9b cho phép cấu hình). */
  demDongQuanPhut?: number;
  timeZone?: string;
}

export interface NgayDuongLich {
  nam: number;
  thang: number;
  ngay: number;
}

export interface UngVienGioLiem {
  chiGio: Chi;
  canGio: Can;
  /** Ngày của TRỤ Can Chi. Giờ đồng hồ thực tế xem ở `khungGio` (giờ Tý bắt đầu từ 23h hôm trước). */
  ngayDuongLich: NgayDuongLich;
  khungGio: KhungGioThucTe;
  cungGio: Chi;
  phanLoaiCung: TrungTang.PhanLoaiCung;
  /** false với cung Thìn (Nhập Mộ) / Dậu (Thiên Di) — bị loại khỏi tập cung dùng được. */
  cungDungDuoc: boolean;
  /** true khi cung là Thìn: vẫn là Nhập Mộ nhưng thuộc Tứ Kỵ, chỉ nên dùng khi bất đắc dĩ. */
  nhapMoTuKy: boolean;
  hoangDaoTen: string;
  hoangDaoLaCat: boolean;
  /** Can giờ trúng bảng Trần Tử Tánh — điểm cộng "nếu có càng tốt". */
  canGioDatBangDep: boolean;
  /** Phạm Giờ Sát Chủ của tháng — cấu hình đã chốt là LOẠI GIỜ (xem `daNoiLongGioSatChu`). */
  phamGioSatChu: boolean;
  /** Sao hắc đạo thuộc nhóm kỵ an táng (Bạch Hổ / Nguyên Vũ / Câu Trần / Thiên Hình / Thiên Lao). */
  hacDaoKyAnTang: boolean;
  /** Chi giờ thuộc Dần/Thân/Tỵ/Hợi — kiêng mềm cho liệm, "nếu được thì tránh". */
  chiGioThuocTuSinh: boolean;
  diem: number;
}

export interface UngVienNgayGioHaHuyet {
  ngayDuongLich: NgayDuongLich;
  khungGio: KhungGioThucTe;
  canChiNgay: { can: Can; chi: Chi };
  chiGio: Chi;
  canGio: Can;
  /** Cung_Ngày của ngày này trên bàn tay chưởng pháp (gốc để suy ra Cung_Giờ). */
  cungNgay: Chi;
  cungGio: Chi;
  phanLoaiCung: TrungTang.PhanLoaiCung;
  /** false với cung Thìn (Nhập Mộ) / Dậu (Thiên Di) — xem `TrungTang.laCungDungDuoc`. */
  cungDungDuoc: boolean;
  /** true khi cung là Thìn: vẫn là Nhập Mộ nhưng thuộc Tứ Kỵ, chỉ nên dùng khi bất đắc dĩ. */
  nhapMoTuKy: boolean;
  hoangDaoTen: string;
  hoangDaoLaCat: boolean;
  /** Can giờ trúng bảng Trần Tử Tánh — điểm cộng "nếu có càng tốt". */
  canGioDatBangDep: boolean;
  ngayHopVoiVong: "tam-hop" | "luc-hop" | null;
  trucTot: boolean;
  /** Chi giờ thuộc Dần/Thân/Tỵ/Hợi — chỉ khuyến nghị tránh cho hạ huyệt, không loại tuyệt đối. */
  chiGioThuocTuSinh: boolean;
  phamGioSatChu: boolean;
  hacDaoKyAnTang: boolean;
  /**
   * Thần sát mức CẢNH BÁO của ngày này — nguồn không xếp vào nhóm "không hoá giải được" nên
   * không loại, chỉ hiện nhãn để gia chủ và thầy cùng cân nhắc.
   */
  canhBaoThanSat: TrungTang.CanhBaoThanSat[];
  /** TẦNG 4 — cát thần đạt được của ngày (Tuế Đức / Tuế Đức Hợp / Nguyệt Đức / Nguyệt Đức Hợp). */
  catThan: TrungTang.CatThanNgay;
  /** Tam Đại Cát Tinh của ngày — Sát Cống / Trực Tinh / Nhân Chuyên (bảng ở tầng dùng chung). */
  tamDaiCatTinh: { co: boolean; ten: string | null };
  /**
   * Hung tinh thông thường của ngày ĐÃ ĐƯỢC Tam Đại Cát Tinh hoá. Rỗng = ngày vốn đã sạch.
   * Không rỗng = ngày này lẽ ra bị loại, được cát tinh cứu — phải hiện rõ cho gia chủ biết.
   */
  hungDaHoaGiai: string[];
  diem: number;
}

/**
 * Bước 6b (mục 9b đặc tả) — giờ động quan (chuyển quan tài RA KHỎI NHÀ), khác với "giờ đóng
 * quan" (đậy nắp) vốn dùng chung bảng xếp hạng với giờ liệm. Đây KHÔNG phải một phép luận độc
 * lập mà là hệ quả số học của giờ hạ huyệt trừ lùi quãng đường, nên trả về một KHOẢNG: sách
 * khuyên tới sớm rồi chờ, đi sớm luôn an toàn, chỉ đến muộn mới hỏng việc.
 *
 * Hai điểm đặc tả từng để mở:
 * (a) ✔ ĐÃ CHỐT 2026-08-16 — "bỏ cửu phi cung đi, chưa tính vội": trừ lùi từ giờ hạ huyệt của
 *     CHƯỞNG PHÁP (hệ module đang dùng), KHÔNG cài Cửu Phi Cung Thanh Long Bạch Hổ. Đây là sai
 *     lệch có ý thức so với câu chữ sách ("lấy giờ Bạch Hổ để hạ huyệt"), chủ dự án biết và chấp
 *     nhận.
 * (b) Vẫn theo mặc định đặc tả: KHÔNG sàng thần sát cho giờ động quan, vì nó là giờ DẪN XUẤT chứ
 *     không phải giờ được chọn — khác với giờ liệm và giờ hạ huyệt (hai giờ đó có sàng thần sát).
 */
export interface GioDongQuan {
  /** Phương án hạ huyệt số 1 mà khoảng này được trừ lùi từ đó. */
  theoHaHuyet: { ngayDuongLich: NgayDuongLich; chiGio: Chi; batDau: string };
  /** Nên rời nhà từ mốc này (đã trừ cả đệm đi sớm). */
  khuyenNghiTu: { gio: string; ngayDuongLich: NgayDuongLich };
  /** Muộn nhất phải rời nhà (chỉ trừ quãng đường, không còn đệm). */
  muonNhat: { gio: string; ngayDuongLich: NgayDuongLich };
  thoiGianDiChuyenPhut: number;
  demPhut: number;
  /** Cảnh báo khi khoảng động quan rơi vào đêm khuya hoặc sớm hơn giờ liệm phương án 1. */
  canhBao?: string;
}

export interface GioLiemHaHuyetOutput {
  tuoiTa: number;
  duoi10Tuoi: boolean;
  bonCung?: TrungTang.BonCungTrungTang;
  /** Top 3 (đã lọc theo tuổi thân quyến khi có dữ liệu) — dùng chung cho cả giờ liệm và giờ đóng quan. */
  gioLiemDongQuan?: UngVienGioLiem[];
  /** true nếu lọc thân quyến làm hết sạch danh sách nên phải bỏ ràng buộc đó để có kết quả. */
  thanQuyenDaNoiLong?: boolean;
  /**
   * true khi MỌI giờ liệm hợp lệ đều phạm Giờ Sát Chủ, buộc phải giữ lại thay vì trả về rỗng.
   * Tầng hiển thị phải cảnh báo rõ để gia chủ biết mà hỏi thầy trực tiếp.
   */
  daNoiLongGioSatChu?: boolean;
  apDungMienTru3Ngay?: boolean;
  /** Top 3 ngày+giờ hạ huyệt. */
  ngayGioHaHuyet?: UngVienNgayGioHaHuyet[];
  /**
   * TOÀN BỘ ứng viên hạ huyệt đã xếp hạng, trước khi cắt top 3 — dành riêng cho Phase 2 lọc theo
   * tọa hướng mộ.
   *
   * Lý do phải có: Phase 2 lọc cứng bằng Tam Sát/Bát Sát, riêng Tam Sát đã chặn 3/12 Chi cho tọa
   * và 3/12 cho hướng, áp lên cả trụ Ngày lẫn trụ Giờ. Đo thực tế 2026-08-16 trên 4 tọa khác nhau:
   * đưa top 3 sang thì Phase 2 loại sạch 12/12 phương án, trả về rỗng. Phải lọc trên rổ rộng rồi
   * mới cắt top ở đầu ra Phase 2.
   *
   * Tầng hiển thị Phase 1 KHÔNG dùng trường này — vẫn hiện `ngayGioHaHuyet`.
   */
  tatCaNgayGioHaHuyet?: UngVienNgayGioHaHuyet[];
  /** true nếu quét hết 20 ngày mà không còn ngày nào qua được lọc tuyệt đối (rất hiếm). */
  khongTimThayNgayHaHuyet?: boolean;
  /** Chỉ có khi khách nhập `thoiGianDiChuyenPhut` và đã tìm được ít nhất 1 giờ hạ huyệt. */
  gioDongQuan?: GioDongQuan;
  /**
   * Các nhóm tuổi cần tránh mặt lúc nhập quan / khâm liệm / đóng cá / hạ huyệt. Chủ dự án nhấn
   * mạnh 2026-08-15: "sách ghi rất rõ — người tuổi Thìn, Dần, Dậu, Tỵ không bao giờ được đứng
   * nhìn nhập liệm". Đây là việc KHÁC với điểm cung Thìn ở bảng xếp hạng giờ: một bên là tuổi
   * người dự lễ, một bên là cung trên bàn tay chưởng pháp.
   *
   * Phạm vi: chỉ người huyết thống trực hệ (cha mẹ, vợ/chồng, con, anh chị em ruột, cháu nội);
   * con dâu, con rể, cháu ngoại, người ngoài KHÔNG chịu tác động — tầng hiển thị phải nói rõ.
   */
  tuoiCanTranh?: TrungTang.TuoiCanTranhKetQua;
  /**
   * Quy luật bất biến: Cung_Ngày hạ huyệt thuộc nhóm Nhập Mộ → chỉ 4 giờ Dần/Tỵ/Thân/Hợi đạt
   * Nhập Mộ, mà đó đúng là 4 giờ khuyến nghị tránh khi chôn. Bật cờ này để tầng hiển thị giải
   * thích vì sao không có giờ nào đạt đồng thời cả hai tiêu chí.
   */
  nhapMoTrungTuSinh?: boolean;
}

function validateInput(input: GioLiemHaHuyetInput): void {
  if (!Number.isInteger(input.namSinhDuongLich) || input.namSinhDuongLich < NAM_TOI_THIEU || input.namSinhDuongLich > NAM_TOI_DA) {
    throw new Error(`namSinhDuongLich không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
  if (!Number.isInteger(input.namMat) || input.namMat < NAM_TOI_THIEU || input.namMat > NAM_TOI_DA) {
    throw new Error(`namMat không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
  if (input.namMat < input.namSinhDuongLich) {
    throw new Error("Năm mất phải sau hoặc bằng năm sinh.");
  }
  if (!Number.isInteger(input.thangMat) || input.thangMat < 1 || input.thangMat > 12) {
    throw new Error("thangMat phải từ 1 đến 12.");
  }
  if (!Number.isInteger(input.ngayMat) || input.ngayMat < 1 || input.ngayMat > 31) {
    throw new Error("ngayMat không hợp lệ.");
  }
  if (input.thoiGianDiChuyenPhut !== undefined) {
    const t = input.thoiGianDiChuyenPhut;
    if (!Number.isFinite(t) || t < DI_CHUYEN_PHUT_TOI_THIEU || t > DI_CHUYEN_PHUT_TOI_DA) {
      throw new Error(`thoiGianDiChuyenPhut phải trong khoảng ${DI_CHUYEN_PHUT_TOI_THIEU}-${DI_CHUYEN_PHUT_TOI_DA} phút.`);
    }
  }
  if (input.demDongQuanPhut !== undefined && (!Number.isFinite(input.demDongQuanPhut) || input.demDongQuanPhut < 0)) {
    throw new Error("demDongQuanPhut phải là số phút không âm.");
  }
}

/**
 * Tập JDN của các ngày Tứ Tuyệt / Tứ Ly trong khoảng năm cần quét.
 *
 * Định nghĩa: là ngày LIỀN TRƯỚC thời khắc vào tiết, nên lấy JDN của tiết rồi lùi 1 ngày. Quét cả
 * năm trước và năm sau để không sót trường hợp ngày ứng viên nằm sát ranh giới năm dương lịch.
 */
function tapNgayTuTuyetTuLy(namTu: number, namDen: number): { tuTuyet: Set<number>; tuLy: Set<number> } {
  const tuTuyet = new Set<number>();
  const tuLy = new Set<number>();
  for (let nam = namTu; nam <= namDen; nam++) {
    for (const term of getSolarTerms(nam)) {
      const jdnTruocTiet = Math.floor(term.julianDay + 0.5) - 1;
      if (TrungTang.TIET_TU_TUYET.includes(term.name)) tuTuyet.add(jdnTruocTiet);
      else if (TrungTang.TIET_TU_LY.includes(term.name)) tuLy.add(jdnTruocTiet);
    }
  }
  return { tuTuyet, tuLy };
}

/** Mục 9b — trừ lùi từ giờ hạ huyệt phương án 1 để ra khoảng động quan. */
function tinhGioDongQuan(
  haHuyet: UngVienNgayGioHaHuyet,
  jdnHaHuyet: number,
  chiIndexHaHuyet: number,
  thoiGianDiChuyenPhut: number,
  demPhut: number,
  mocGioLiemSom: number | null,
): GioDongQuan {
  const mocHaHuyet = mocTuyetDoiPhut(jdnHaHuyet, chiIndexHaHuyet);
  const mocMuonNhat = mocHaHuyet - thoiGianDiChuyenPhut;
  const mocKhuyenNghi = mocMuonNhat - demPhut;

  const moTa = (moc: number) => ({
    gio: formatGioPhut(moc),
    ngayDuongLich: jdnToNgayDuongLich(Math.floor(moc / 1440)),
  });

  let canhBao: string | undefined;
  const phutTrongNgay = ((mocKhuyenNghi % 1440) + 1440) % 1440;
  if (phutTrongNgay >= DEM_KHUYA_TU_PHUT || phutTrongNgay < DEM_KHUYA_DEN_PHUT) {
    canhBao =
      "Giờ động quan tính ra rơi vào đêm khuya — quãng đường quá dài so với giờ hạ huyệt đã chọn. Nên cân nhắc phương án hạ huyệt muộn hơn trong danh sách.";
  } else if (mocGioLiemSom !== null && mocKhuyenNghi < mocGioLiemSom) {
    canhBao =
      "Giờ động quan tính ra sớm hơn cả giờ liệm phương án 1 — không khả thi. Nên chọn giờ hạ huyệt muộn hơn hoặc rút ngắn quãng đường.";
  }

  return {
    theoHaHuyet: { ngayDuongLich: haHuyet.ngayDuongLich, chiGio: haHuyet.chiGio, batDau: haHuyet.khungGio.batDau },
    khuyenNghiTu: moTa(mocKhuyenNghi),
    muonNhat: moTa(mocMuonNhat),
    thoiGianDiChuyenPhut,
    demPhut,
    ...(canhBao ? { canhBao } : {}),
  };
}

function tinhTuoiTa(namSinhDuongLich: number, namMatDuongLich: number): number {
  return namMatDuongLich - namSinhDuongLich + 1;
}

export function calculateGioLiemHaHuyet(input: GioLiemHaHuyetInput): GioLiemHaHuyetOutput {
  validateInput(input);
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;
  const tuoiTa = tinhTuoiTa(input.namSinhDuongLich, input.namMat);

  if (tuoiTa < TrungTang.TUOI_TOI_THIEU_TINH_TRUNG_TANG) {
    return { tuoiTa, duoi10Tuoi: true };
  }

  const lunarMat = getLunarDate({ year: input.namMat, month: input.thangMat, day: input.ngayMat, timeZone });
  const bonCung = TrungTang.tinhBonCungTrungTang(input.gioiTinh, tuoiTa, lunarMat.month, lunarMat.day, input.chiGioMat);
  const jdnMat = Astronomy.julianDayNumber(input.namMat, input.thangMat, input.ngayMat);
  const idxGioMat = Data.CHI.indexOf(input.chiGioMat);
  const chiTuoiVong = Scoring.getChi(input.namSinhDuongLich);
  const canNamSinhVong = Scoring.getCan(input.namSinhDuongLich);

  // ------------------------------------------------------------------
  // Bước 3 + 7 + 8 — Giờ liệm / đóng quan (dùng chung 1 danh sách xếp hạng cho cả 2 mục).
  // ------------------------------------------------------------------
  const ungVienGioLiem: UngVienGioLiem[] = [];
  for (let step = 0; step < 12; step++) {
    const idxChi = (idxGioMat + step) % 12;
    const chiGio = Data.CHI[idxChi]!;
    if (step * 2 < 8) continue; // dưới 8 tiếng kể từ khi mất

    const dayOffset = Math.floor((idxGioMat + step) / 12);
    const jdnCandidate = jdnMat + dayOffset;
    const hourPillar = Calendar.getGanzhiHour(jdnCandidate, representativeHour(idxChi));
    const dayPillar = Calendar.getGanzhiDay(jdnCandidate);

    // ⚠️ Cung_Ngày phải là cung của CHÍNH NGÀY mà giờ ứng viên rơi vào, KHÔNG phải luôn là cung
    // ngày mất. Chủ dự án giảng 2026-08-16:
    //   "nếu giờ nhập liệm cùng với giờ mất trong cùng 1 ngày thì chỉ việc đếm từ giờ mất. Nhưng
    //    khi nó đã qua ngày rồi thì lại khác — phải tính qua 1 ngày mới, ngày 11 sẽ vào cung Thiên
    //    Di tại cung Dậu, ta đếm giờ Tý tại cung Tuất rồi lần lượt đếm."
    // Vì Cung_Ngày(N) = Cung_Tháng + s*N nên qua mỗi ngày cung chỉ nhích đúng 1 bậc theo chiều
    // nam thuận / nữ nghịch — cộng thẳng `s * dayOffset`, vừa đúng vừa không vỡ khi ngày ứng viên
    // rơi sang tháng âm lịch khác (chuỗi bàn tay đi tiếp, không phụ thuộc nhãn tháng).
    const cungNgayCuaUngVien = dichCungTheoNgay(bonCung.cungNgay, input.gioiTinh, dayOffset);
    const cungGio = TrungTang.tinhCungTheoChiGio(input.gioiTinh, cungNgayCuaUngVien, chiGio);
    const phanLoaiCungGio = TrungTang.phanLoaiCung(cungGio);

    // Kỵ tuyệt đối cho LIỆM là khi CUNG rơi vào nhóm Trùng Tang (Dần/Thân/Tỵ/Hợi), KHÔNG phải khi
    // CHI GIỜ mang tên đó. Sách: "Tuyệt đối kị các ngày giờ rơi vào CUNG Dần Thân Tị Hợi... (ngày
    // giờ tính theo vòng Thiên Di Nhập Mộ)". Ví dụ của chủ dự án khẳng định lại: ngày 12 có
    // Cung_Ngày = Tuất thì giờ Dần/Thân/Hợi đều ra cung Nhập Mộ và "đều có thể liệm" — nếu lọc
    // theo tên chi giờ thì đã loại oan cả ba.
    if (phanLoaiCungGio === "trung-tang") continue;

    const hoangDao = TrachNhat.getHoangDaoHacDaoGio(dayPillar.chiIndex, hourPillar.chiIndex);

    ungVienGioLiem.push({
      chiGio,
      canGio: hourPillar.can,
      ngayDuongLich: jdnToNgayDuongLich(jdnCandidate),
      khungGio: tinhKhungGio(jdnCandidate, idxChi),
      cungGio,
      phanLoaiCung: phanLoaiCungGio,
      cungDungDuoc: TrungTang.laCungDungDuoc(cungGio),
      nhapMoTuKy: TrungTang.laNhapMoTuKy(cungGio),
      hoangDaoTen: hoangDao.name,
      hoangDaoLaCat: hoangDao.catHung === "cát",
      canGioDatBangDep: TrungTang.isCanGioDep(hourPillar.can, dayPillar.chi),
      phamGioSatChu: TrungTang.isGioSatChu(chiGio, lunarMat.month),
      hacDaoKyAnTang: TrungTang.isHacDaoKyAnTang(hoangDao.name),
      chiGioThuocTuSinh: (TrungTang.KHUYEN_TRANH_CHON as readonly Chi[]).includes(chiGio),
      diem: 0,
    });
  }

  // "Có Nhập Mộ" ở đây phải hiểu là có Nhập Mộ DÙNG ĐƯỢC — nếu cả ngày chỉ chạm cung Thìn (Nhập
  // Mộ nhưng bị loại vì Long Hổ Kê Xà) thì coi như không có, để tầng Thiên Di dự phòng được kích
  // hoạt thay vì mất luôn cả hai tầng điểm ưu tiên.
  const coNhapMoGioLiem = ungVienGioLiem.some((c) => c.phanLoaiCung === "nhap-mo" && c.cungDungDuoc);
  const thanQuyenParam: TrungTang.ThanQuyenGioLiem = {
    ...(input.thanQuyen?.chiTruongNam ? { chiTruongNam: input.thanQuyen.chiTruongNam } : {}),
    ...(input.thanQuyen?.chiConDauLon ? { chiConDauLon: input.thanQuyen.chiConDauLon } : {}),
    ...(input.thanQuyen?.chiChauDichTon ? { chiChauDichTon: input.thanQuyen.chiChauDichTon } : {}),
    ...(input.thanQuyen?.chiAnhTraiLon ? { chiAnhTraiLon: input.thanQuyen.chiAnhTraiLon } : {}),
    ...(input.thanQuyen?.chiChaMe ? { chiChaMe: input.thanQuyen.chiChaMe } : {}),
  };

  for (const c of ungVienGioLiem) {
    c.diem = TrungTang.tinhDiemUngVien({
      phanLoaiCung: c.phanLoaiCung,
      cungGio: c.cungGio,
      canGioDatBangDep: c.canGioDatBangDep,
      apDungThienDi: !coNhapMoGioLiem,
      hoangDaoTen: c.hoangDaoTen,
      hoangDaoLaCat: c.hoangDaoLaCat,
      boiCanh: "liem",
      chiGioThuocTuSinh: c.chiGioThuocTuSinh,
    });
  }
  ungVienGioLiem.sort((a, b) => b.diem - a.diem);

  // Giờ Sát Chủ — cấu hình đã chốt: "Giờ Sát Chủ loại giờ". Nhưng nếu loại xong không còn ứng
  // viên nào thì KHÔNG trả về rỗng cho một gia đình đang có tang: giữ lại danh sách kèm cờ
  // `daNoiLongGioSatChu` để tầng hiển thị cảnh báo rõ, gia chủ tự quyết cùng thầy.
  const sachGioSatChu = ungVienGioLiem.filter((c) => !c.phamGioSatChu);
  const daNoiLongGioSatChu = sachGioSatChu.length === 0 && ungVienGioLiem.length > 0;
  const gioLiemSauSatChu = daNoiLongGioSatChu ? ungVienGioLiem : sachGioSatChu;

  // Bước 8 — lọc thân quyến. Đặc tả mục 11 gợi ý "nới lỏng dần: bỏ tầng Can giờ, rồi tầng Hoàng
  // Đạo" nếu lọc hết sạch — NHƯNG lọc ở đây loại theo Chi giờ (chiGio) tuyệt đối, không theo
  // ngưỡng điểm, nên chấm lại điểm với ít/không bonus không đổi được TẬP Chi nào bị loại — chỉ
  // đổi thứ tự trong tập không đổi. Do đó việc duy nhất "nới lỏng" thực sự làm được là bỏ hẳn
  // ràng buộc thân quyến (đã có sẵn trong `locTheoTuoiThanQuyen`, gắn cờ `daNoiLong` cho tầng UI
  // biết mà cảnh báo) — không có tầng trung gian nào khác hợp lý về mặt logic.
  const locThanQuyen = TrungTang.locTheoTuoiThanQuyen(gioLiemSauSatChu, thanQuyenParam);

  // ------------------------------------------------------------------
  // Bước 4 — quy tắc miễn trừ: chôn trong ≤3 ngày (hoặc không rõ) → bỏ hẳn bước chọn NGÀY,
  // chỉ chọn GIỜ hạ huyệt của chính ngày mất (Cung_Ngày giữ nguyên = Cung_Ngày_mat).
  // ------------------------------------------------------------------
  const apDungMienTru3Ngay = !input.soNgayDuKienToiChon || input.soNgayDuKienToiChon <= 3;

  interface NgayUngVienHaHuyet {
    ngayDuongLich: NgayDuongLich;
    jdn: number;
    jdUT: number;
    canChiNgay: { can: Can; chi: Chi; chiIndex: number };
    cungNgay: Chi;
    ngayHopVoiVong: "tam-hop" | "luc-hop" | null;
    /** Tháng + ngày âm lịch của chính ngày ứng viên (Thổ Tú / Tam Nương / Nguyệt Kỵ tra theo đây). */
    thangAmLich: number;
    ngayAmLich: number;
    /** Can của NĂM ứng với ngày này — dùng tra Tuế Đức / Tuế Đức Hợp. */
    canChiNam: Can;
    /** Hung tinh thông thường đã được Tam Đại Cát Tinh hoá — rỗng nghĩa là ngày vốn đã sạch. */
    hungDaHoaGiai: readonly string[];
    /** Tên các sao trong Tam Đại Cát Tinh mà ngày này trúng. */
    tenCatTinh: readonly string[];
  }

  /** Thần sát mức cảnh báo của một ngày ứng viên — không loại, chỉ gắn nhãn. */
  function canhBaoThanSatCuaNgay(ngay: NgayUngVienHaHuyet, tenTruc: string): TrungTang.CanhBaoThanSat[] {
    const ds: TrungTang.CanhBaoThanSat[] = [];
    if (TrungTang.isThoTu(ngay.canChiNgay.can, ngay.canChiNgay.chi, ngay.thangAmLich)) {
      ds.push({ ma: "tho-tu", nhan: "Thổ Tú — kỵ động thổ, đào huyệt" });
    }
    if (TrachNhat.isTamNuong(ngay.ngayAmLich)) {
      ds.push({ ma: "tam-nuong", nhan: `Tam Nương — ngày ${ngay.ngayAmLich} âm lịch` });
    }
    if (TrachNhat.isNguyetKy(ngay.ngayAmLich)) {
      ds.push({ ma: "nguyet-ky", nhan: `Nguyệt Kỵ — ngày ${ngay.ngayAmLich} âm lịch` });
    }
    if (TrungTang.isTrucKyAnTang(tenTruc)) {
      ds.push({ ma: "truc-ky", nhan: `Trực ${tenTruc} — kỵ an táng` });
    }
    if (TrungTang.isKiepSat(chiTuoiVong, ngay.canChiNgay.chi)) {
      ds.push({ ma: "kiep-sat", nhan: "Kiếp Sát theo tuổi người mất" });
    }
    return ds;
  }

  function xepHangGioTrongNgay(ngay: NgayUngVienHaHuyet): UngVienNgayGioHaHuyet[] {
    const monthOrderIndex = Calendar.monthBoundaryOrderIndex(ngay.jdUT);
    const truc = TrachNhat.getTruc(ngay.canChiNgay.chiIndex, monthOrderIndex);
    const trucTot = !TRUC_XAU.has(truc.name);
    const canhBaoNgay = canhBaoThanSatCuaNgay(ngay, truc.name);
    // TẦNG 4 — cát thần của ngày. Nguồn ghi ngày có cát thần/Hoàng Đạo có thể "hung hoá cát", nên
    // đây là điểm CỘNG cho ngày, đứng riêng với các tầng lọc phía trên.
    const catThan = TrungTang.tinhCatThanNgay(ngay.canChiNgay.can, ngay.canChiNam, ngay.thangAmLich);
    const tamDaiCatTinh = { co: ngay.tenCatTinh.length > 0, ten: ngay.tenCatTinh[0] ?? null };
    const diemCatThan =
      (catThan.tueDuc ? DIEM_TUE_DUC : 0) +
      (catThan.tueDucHop ? DIEM_TUE_DUC_HOP : 0) +
      (catThan.nguyetDuc ? DIEM_NGUYET_DUC : 0) +
      (catThan.nguyetDucHop ? DIEM_NGUYET_DUC_HOP : 0) +
      (tamDaiCatTinh.co ? DIEM_TAM_DAI_CAT_TINH : 0) -
      (ngay.hungDaHoaGiai.length > 0 ? DIEM_PHAT_HUNG_DA_HOA_GIAI : 0);

    const cungTheoK: Chi[] = [];
    for (let k = 1; k <= 12; k++) cungTheoK.push(TrungTang.tinhCungGioHaHuyet(input.gioiTinh, ngay.cungNgay, k));
    // Cùng lý do như bên giờ liệm: chỉ Nhập Mộ DÙNG ĐƯỢC mới chặn tầng Thiên Di dự phòng.
    const coNhapMoTrongNgay = cungTheoK.some((c) => TrungTang.phanLoaiCung(c) === "nhap-mo" && TrungTang.laCungDungDuoc(c));

    const ketQua: UngVienNgayGioHaHuyet[] = [];
    for (let k = 1; k <= 12; k++) {
      const idxChi = k - 1;
      const chiGio = Data.CHI[idxChi]!;
      const hourPillar = Calendar.getGanzhiHour(ngay.jdn, representativeHour(idxChi));
      const cungGio = cungTheoK[idxChi]!;
      const phanLoaiCungGio = TrungTang.phanLoaiCung(cungGio);
      const hoangDao = TrachNhat.getHoangDaoHacDaoGio(ngay.canChiNgay.chiIndex, hourPillar.chiIndex);
      const chiGioThuocTuSinh = (TrungTang.KHUYEN_TRANH_CHON as readonly Chi[]).includes(chiGio);
      const canGioDatBangDep = TrungTang.isCanGioDep(hourPillar.can, ngay.canChiNgay.chi);

      const diem = TrungTang.tinhDiemUngVien({
        phanLoaiCung: phanLoaiCungGio,
        cungGio,
        canGioDatBangDep,
        apDungThienDi: !coNhapMoTrongNgay,
        hoangDaoTen: hoangDao.name,
        hoangDaoLaCat: hoangDao.catHung === "cát",
        boiCanh: "ha-huyet",
        chiGioThuocTuSinh,
        ngayHopVoiVong: ngay.ngayHopVoiVong !== null,
        trucTot,
      });

      ketQua.push({
        catThan,
        tamDaiCatTinh,
        hungDaHoaGiai: [...ngay.hungDaHoaGiai],
        ngayDuongLich: ngay.ngayDuongLich,
        khungGio: tinhKhungGio(ngay.jdn, idxChi),
        canChiNgay: { can: ngay.canChiNgay.can, chi: ngay.canChiNgay.chi },
        chiGio,
        canGio: hourPillar.can,
        cungNgay: ngay.cungNgay,
        cungGio,
        phanLoaiCung: phanLoaiCungGio,
        cungDungDuoc: TrungTang.laCungDungDuoc(cungGio),
        nhapMoTuKy: TrungTang.laNhapMoTuKy(cungGio),
        hoangDaoTen: hoangDao.name,
        hoangDaoLaCat: hoangDao.catHung === "cát",
        canGioDatBangDep,
        ngayHopVoiVong: ngay.ngayHopVoiVong,
        trucTot,
        chiGioThuocTuSinh,
        phamGioSatChu: TrungTang.isGioSatChu(chiGio, ngay.thangAmLich),
        hacDaoKyAnTang: TrungTang.isHacDaoKyAnTang(hoangDao.name),
        canhBaoThanSat: canhBaoNgay,
        diem: diem + diemCatThan,
      });
    }
    return ketQua;
  }

  function ngayHopVoiVongCua(chiNgay: Chi): "tam-hop" | "luc-hop" | null {
    if (TrachNhat.isTamHop(chiNgay, chiTuoiVong)) return "tam-hop";
    if (TrachNhat.isLucHop(chiNgay, chiTuoiVong)) return "luc-hop";
    return null;
  }

  let tatCaGioHaHuyet: UngVienNgayGioHaHuyet[] = [];
  let khongTimThayNgayHaHuyet = false;

  if (apDungMienTru3Ngay) {
    const canChiMat = getCanChi({ year: input.namMat, month: input.thangMat, day: input.ngayMat, hour: 12, timeZone });
    tatCaGioHaHuyet = xepHangGioTrongNgay({
      ngayDuongLich: { nam: input.namMat, thang: input.thangMat, ngay: input.ngayMat },
      jdn: jdnMat,
      jdUT: canChiMat.julianDay,
      canChiNgay: { can: canChiMat.day.can, chi: canChiMat.day.chi, chiIndex: canChiMat.day.chiIndex },
      cungNgay: bonCung.cungNgay,
      ngayHopVoiVong: ngayHopVoiVongCua(canChiMat.day.chi),
      thangAmLich: lunarMat.month,
      ngayAmLich: lunarMat.day,
      canChiNam: canChiMat.year.can,
      // Nhánh miễn trừ ≤3 ngày KHÔNG sàng ngày (giữ nguyên ngày mất) nên không có hung nào được hoá.
      hungDaHoaGiai: [],
      tenCatTinh: TrachNhat.getTamDaiCatTinhTrongNgay(lunarMat.month, canChiMat.day.can, canChiMat.day.chi).map((c) => c.name),
    });
  } else {
    const chiXungVong = TrachNhat.getLucXungChi(chiTuoiVong);
    // Quét dư 1 năm mỗi phía cho chắc, vì 20 ngày quét có thể vắt qua giao thừa dương lịch.
    const ngayTuTuyetTuLy = tapNgayTuTuyetTuLy(input.namMat - 1, input.namMat + 1);
    const dsNgayUngVien: NgayUngVienHaHuyet[] = [];
    for (let offset = 1; offset <= SO_NGAY_QUET_TOI_DA && dsNgayUngVien.length < SO_NGAY_UNG_VIEN_GIU_LAI; offset++) {
      const jdnCandidate = jdnMat + offset;
      const rawDate = Astronomy.julianDayNumberToCalendarDate(jdnCandidate);
      const canChiCandidate = getCanChi({ ...rawDate, hour: 12, timeZone });
      const lunarCandidate = getLunarDate({ ...rawDate, timeZone });

      // ================= PHÂN LOẠI HUNG TINH CỦA NGÀY =================
      // Cây quyết định chủ dự án chốt 2026-08-16:
      //   ngày có hung tinh -> có Tam Đại Cát Tinh?
      //     KHÔNG -> giữ nguyên hung (loại ngày)
      //     CÓ    -> Kim Thần Thất Sát / Sát Chủ / Thọ Tử / Trung Cung - Bạch Hổ: KHÔNG HOÁ
      //              hung tinh thông thường: GIẢM / HOÁ HUNG (ngày dùng lại được)
      const trucCandidate = TrachNhat.getTruc(canChiCandidate.day.chiIndex, Calendar.monthBoundaryOrderIndex(canChiCandidate.julianDay));
      const muaTuPhe = MUA_THEO_MONTH_ORDER[Calendar.monthBoundaryOrderIndex(canChiCandidate.julianDay)]!;

      // --- Nhóm KHÔNG BAO GIỜ hoá được: có cát tinh cũng vẫn loại ---
      const hungKhongHoaGiai: string[] = [];
      // Sát Chủ ÂM tra theo tháng âm của CHÍNH NGÀY ỨNG VIÊN (ngày chôn có thể sang tháng âm sau).
      if (TrungTang.isSatChuAm(canChiCandidate.day.chi, lunarCandidate.month)) hungKhongHoaGiai.push("Sát Chủ Âm");
      if ((TrachNhat.getChiNgayKyKimThanThatSatTheoNam(canNamSinhVong) as readonly Chi[]).includes(canChiCandidate.day.chi)) {
        hungKhongHoaGiai.push("Kim Thần Thất Sát");
      }
      // Trực Phá ≡ Nguyệt Phá — bảng dữ liệu xếp vào nhóm "không hoá giải được".
      if (TrungTang.isTrucKhongHoaGiai(trucCandidate.name)) hungKhongHoaGiai.push("Nguyệt Phá (Trực Phá)");
      // Ba mục tuyệt đối RIÊNG của tang sự (đặc tả bước 5: "điều kiện loại tuyệt đối").
      // ✔ ĐÃ HỎI VÀ ĐƯỢC CHỦ DỰ ÁN CHỐT 2026-08-16: "không hoá được nhé". Sơ đồ hoá hung chỉ liệt
      // ngoại lệ Kim Thần Thất Sát / Sát Chủ / Thọ Tử / Trung Cung - Bạch Hổ, nhưng ba mục này
      // KHÔNG vì thế mà rơi vào nhóm "hung thông thường" — chúng đứng ngoài, giữ mức tuyệt đối.
      // Trùng Nhật đặc biệt quan trọng: "trùng" chính là cái mà cả module sinh ra để phòng, và
      // `ngayTrungKy.ts` ghi đây là "cơ sở lý luận vững nhất trong cả sách".
      if (TrungTang.isTrungNhat(canChiCandidate.day.chi)) hungKhongHoaGiai.push("Trùng Nhật");
      if (TrungTang.isPhucNhat(canChiCandidate.day.can, lunarMat.month)) hungKhongHoaGiai.push("Phục Nhật");
      if (canChiCandidate.day.chi === chiXungVong) hungKhongHoaGiai.push("Xung tuổi vong");

      if (hungKhongHoaGiai.length > 0) continue;

      // --- Nhóm hung THÔNG THƯỜNG: cát tinh hoá được ---
      const hungThongThuong: string[] = [];
      if (TrungTang.isNgayThaiTue(canChiCandidate.day.chi, canChiCandidate.year.chi)) hungThongThuong.push("Thái Tuế");
      if (canChiCandidate.day.chi === TrachNhat.getLucXungChi(canChiCandidate.year.chi)) hungThongThuong.push("Tuế Phá");
      if (TrungTang.isTueSat(canChiCandidate.day.chi, canChiCandidate.year.chi)) hungThongThuong.push("Tuế Sát");
      if (TrungTang.isKiepSat(chiTuoiVong, canChiCandidate.day.chi)) hungThongThuong.push("Kiếp Sát");
      if (TrungTang.isNguyetYem(canChiCandidate.day.chi, lunarCandidate.month)) hungThongThuong.push("Nguyệt Yếm");
      if (trucCandidate.name === "Kiến") hungThongThuong.push("Nguyệt Kiến (Trực Kiến)");
      if (ngayTuTuyetTuLy.tuTuyet.has(jdnCandidate)) hungThongThuong.push("Tứ Tuyệt");
      if (ngayTuTuyetTuLy.tuLy.has(jdnCandidate)) hungThongThuong.push("Tứ Ly");
      if (TrungTang.isNguyetHinh(canChiCandidate.day.chi, lunarCandidate.month)) hungThongThuong.push("Nguyệt Hình");
      if (TrungTang.isNguyetHai(canChiCandidate.day.chi, lunarCandidate.month)) hungThongThuong.push("Nguyệt Hại");
      if (TrungTang.isTuPhe(canChiCandidate.day.can, canChiCandidate.day.chi, muaTuPhe)) hungThongThuong.push("Tứ Phế");

      // Áp quy tắc hoá giải bằng tầng DÙNG CHUNG — bảng + chính sách ngoại lệ nằm ở
      // `trach-nhat/tamDaiCatTinh.ts`, không nhân bản trong module này.
      const catTinhEntries = TrachNhat.getTamDaiCatTinhTrongNgay(lunarCandidate.month, canChiCandidate.day.can, canChiCandidate.day.chi);
      const ketQuaHoa = TrachNhat.apQuyTacHoaGiai(catTinhEntries, hungThongThuong);
      // Còn hung nào chưa hoá được (kể cả trường hợp ngày không có cát tinh) -> loại ngày.
      if (ketQuaHoa.khongHoaGiai.length > 0) continue;

      // TẦNG 3 (quan hệ ngày với TỌA huyệt) thuộc PHASE 2 — chủ dự án chốt 2026-08-16: mọi thứ
      // liên quan tọa hướng mộ để Phase 2. Module này không nhận hướng huyệt, không lọc phương vị.

      const cungNgay = TrungTang.tinhCungNgayUngVien(input.gioiTinh, bonCung.cungThang, lunarCandidate.day);
      dsNgayUngVien.push({
        ngayDuongLich: jdnToNgayDuongLich(jdnCandidate),
        jdn: jdnCandidate,
        jdUT: canChiCandidate.julianDay,
        canChiNgay: { can: canChiCandidate.day.can, chi: canChiCandidate.day.chi, chiIndex: canChiCandidate.day.chiIndex },
        cungNgay,
        ngayHopVoiVong: ngayHopVoiVongCua(canChiCandidate.day.chi),
        thangAmLich: lunarCandidate.month,
        ngayAmLich: lunarCandidate.day,
        canChiNam: canChiCandidate.year.can,
        hungDaHoaGiai: ketQuaHoa.daHoaGiai,
        tenCatTinh: ketQuaHoa.tenCatTinh,
      });
    }

    if (dsNgayUngVien.length === 0) {
      khongTimThayNgayHaHuyet = true;
    } else {
      for (const ngay of dsNgayUngVien) {
        tatCaGioHaHuyet.push(...xepHangGioTrongNgay(ngay));
      }
    }
  }

  tatCaGioHaHuyet.sort((a, b) => b.diem - a.diem);
  const topHaHuyet = tatCaGioHaHuyet.slice(0, 3);
  const topGioLiem = locThanQuyen.ketQua.slice(0, 3);

  // ------------------------------------------------------------------
  // Bước 6b — giờ động quan, trừ lùi từ phương án hạ huyệt số 1. Chỉ tính khi khách có nhập
  // quãng đường; không có thì bỏ trống, không tự đoán khoảng cách nhà - huyệt.
  // ------------------------------------------------------------------
  let gioDongQuan: GioDongQuan | undefined;
  const haHuyetSo1 = topHaHuyet[0];
  if (haHuyetSo1 && input.thoiGianDiChuyenPhut !== undefined) {
    const jdnHaHuyet = Astronomy.julianDayNumber(
      haHuyetSo1.ngayDuongLich.nam,
      haHuyetSo1.ngayDuongLich.thang,
      haHuyetSo1.ngayDuongLich.ngay,
    );
    const gioLiemSo1 = topGioLiem[0];
    const mocGioLiemSom = gioLiemSo1
      ? mocTuyetDoiPhut(
          Astronomy.julianDayNumber(gioLiemSo1.ngayDuongLich.nam, gioLiemSo1.ngayDuongLich.thang, gioLiemSo1.ngayDuongLich.ngay),
          Data.CHI.indexOf(gioLiemSo1.chiGio),
        )
      : null;

    gioDongQuan = tinhGioDongQuan(
      haHuyetSo1,
      jdnHaHuyet,
      Data.CHI.indexOf(haHuyetSo1.chiGio),
      input.thoiGianDiChuyenPhut,
      input.demDongQuanPhut ?? DEM_DONG_QUAN_PHUT_MAC_DINH,
      mocGioLiemSom,
    );
  }

  // Nhóm tuổi cần tránh mặt — tính từ 4 cung chưởng pháp đã có + Chi tuổi vong + tuổi thân quyến.
  // `cacCungPham` = những cung trong tứ cung rơi vào nhóm Trùng Tang (dùng cho nhóm 2 tam hợp).
  const cacCungPham = [bonCung.cungTuoi, bonCung.cungThang, bonCung.cungNgay, bonCung.cungGio].filter(
    (c): c is Chi => !!c && TrungTang.phanLoaiCung(c) === "trung-tang",
  );
  const tuoiCanTranh = TrungTang.tinhTuoiCanTranh(cacCungPham, chiTuoiVong, {
    ...(input.thanQuyen?.chiTruongNam ? { truongNam: input.thanQuyen.chiTruongNam } : {}),
    ...(input.thanQuyen?.chiConDauLon ? { conDauLon: input.thanQuyen.chiConDauLon } : {}),
    ...(input.thanQuyen?.chiChauDichTon ? { chauNoiLon: input.thanQuyen.chiChauDichTon } : {}),
    ...(input.thanQuyen?.chiAnhTraiLon ? { anhTraiLon: input.thanQuyen.chiAnhTraiLon } : {}),
    ...(input.thanQuyen?.chiChaMe ? { chaMe: input.thanQuyen.chiChaMe } : {}),
  });

  return {
    tuoiTa,
    duoi10Tuoi: false,
    bonCung,
    tuoiCanTranh,
    gioLiemDongQuan: topGioLiem,
    thanQuyenDaNoiLong: locThanQuyen.daNoiLong,
    daNoiLongGioSatChu,
    apDungMienTru3Ngay,
    ngayGioHaHuyet: topHaHuyet,
    tatCaNgayGioHaHuyet: tatCaGioHaHuyet,
    khongTimThayNgayHaHuyet,
    ...(gioDongQuan ? { gioDongQuan } : {}),
    ...(haHuyetSo1 ? { nhapMoTrungTuSinh: TrungTang.nhapMoChiRoiVaoTuSinh(haHuyetSo1.cungNgay) } : {}),
  };
}
