/**
 * PHASE 2 — BƯỚC ② → ⑤: phẩm cấp cách cục, 7 chiều đo, tổng hợp trọng số, xếp hạng.
 *
 * Bốn khái niệm đặc tả mục 0 CẤM trộn, và code này giữ đúng ranh giới đó:
 *   ① điều kiện loại  → `phase2ToaHuongMo.ts` (hard constraint, không phải điểm trừ)
 *   ② phẩm cấp        → `xepLopCachCuc` (classification, KHÔNG bị điểm lật ngược)
 *   ③ bảy chiều đo    → `danhGiaBayChieu` (mỗi chiều một giá trị riêng, không cộng gộp ở bước này)
 *   ④ trọng số        → `tinhDiemNoiBoLop` (chỉ để xếp hạng NỘI BỘ trong cùng lớp)
 *   ⑤ xếp hạng        → `xepHangPhuongAn` (lớp trước, điểm sau — không bao giờ so xuyên lớp)
 *
 * ⚠️ TẬP XÉT LỚP — CHỦ DỰ ÁN CHỐT 2026-08-17: "tính tọa nhé", tức xếp lớp trên tập
 * {Tọa + trụ Năm + trụ Tháng + trụ Ngày + trụ Giờ}.
 *
 * Đặc tả mục 3 không nói rõ tập nào nên trước đó đã đo thử 3 cách trên 108 ứng viên × 24 sơn:
 *
 *   A. Tập {Tọa + các trụ}   → 98.0% rơi lớp 4  ← ĐANG DÙNG (chủ dự án chốt)
 *   B. Chỉ cặp Ngày ↔ Tọa    → phân bố đẹp nhưng trùng đúng CHIỀU 1 ở Bước ③. Loại.
 *   C. Tập các trụ, bỏ Tọa   → lớp 1-3 chiếm 17.6%.
 *
 * Hệ quả đã báo và chủ dự án vẫn chọn A: gần như mọi phương án cùng rơi "Cách thấp hơn", nên
 * việc phân hơn kém giữa các phương án chủ yếu do điểm 7 chiều ở Bước ④ quyết định, chứ không
 * do lớp. Đây là lựa chọn chuyên môn, không phải giới hạn kỹ thuật.
 */
import type { Data } from "@thien-anh/calendar-core";
import {
  quyTruVeQue,
  quyDoSoVeQueToa,
  xetQuanHe,
  xetQuanHeQuaiVan,
  xetSinhKhac,
  nguHanhCuaHknh,
  laThuanAmHoacThuanDuong,
  type NguHanh,
  type QueHknhQuaiVan,
} from "../xem-ngay-cao-cap/index.js";
import {
  MUC_MENH_VONG,
  MUC_NHAT_KHOA_TOA,
  MUC_QUAI_VAN,
  MUC_TRU_HO_TRO,
  THU_TU_CHIEU_DO,
  TRONG_SO_AN_TANG,
  type ChieuDoPhase2,
  type MucMenhVong,
  type MucNhatKhoaToa,
} from "./phase2TrongSo.js";

type Can = Data.Can;
type Chi = Data.Chi;

export interface TruCanChi {
  can: Can;
  chi: Chi;
}

export interface TuTruPhuongAn {
  nam: TruCanChi;
  thang: TruCanChi;
  ngay: TruCanChi;
  /** Bỏ trống khi cấu hình `tinhTruGio: false` (đặc tả mục 2.5 cho phép). */
  gio?: TruCanChi;
}

// -------------------------------------------------------------------------------------------
// BƯỚC ② — PHẨM CẤP CÁCH CỤC
// -------------------------------------------------------------------------------------------

/** Bốn lớp của thang tổng thể, mục 3. Số càng nhỏ càng cao. */
export type LopCachCuc = 1 | 2 | 3 | 4;

export const TEN_LOP_CACH_CUC: Readonly<Record<LopCachCuc, string>> = {
  1: "Nhất Quái Thuần Thanh",
  2: "Hà Đồ",
  3: "Hợp Thập",
  4: "Cách thấp hơn",
};

const HA_DO_CAP: readonly (readonly number[])[] = [
  [1, 6],
  [2, 7],
  [3, 8],
  [4, 9],
];

/**
 * Xếp lớp cho một tập HKNH (đã gồm cả Tọa).
 *
 * Lớp 1 khi cả tập cùng một số; lớp 2 khi cả tập nằm gọn trong một cặp Hà Đồ; lớp 3 khi cả tập
 * nằm gọn trong một cặp Hợp Thập; còn lại lớp 4. Xét theo TẬP chứ không theo từng đôi, vì "thuần
 * thanh" và "Hà Đồ" là tính chất của cả khóa — một khóa có 3 trụ Hà Đồ và 1 trụ lạc quẻ thì không
 * còn là khóa Hà Đồ nữa.
 */
export function xepLopCachCuc(cacHknh: readonly number[]): LopCachCuc {
  const tap = [...new Set(cacHknh)];
  if (tap.length === 1) return 1;
  if (tap.length === 2) {
    const [a, b] = tap as [number, number];
    if (HA_DO_CAP.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return 2;
    if (a + b === 10) return 3;
  }
  return 4;
}

export interface QueDaChon extends QueHknhQuaiVan {
  /** Trụ nào — để output ghi rõ "đã chọn quẻ nào" theo yêu cầu mục 3. */
  tru: "năm" | "tháng" | "ngày" | "giờ";
}

export interface KetQuaCachCuc {
  lop: LopCachCuc;
  tenLop: string;
  queDaChon: QueDaChon[];
  /** true khi phương án có Can Chi mang 2 quẻ và engine đã phải thử cả hai biến thể. */
  coTruHaiQue: boolean;
  hknhToa: number;
  quaiVanToa: number;
}

const NHAN_TRU_HIEN_THI: readonly QueDaChon["tru"][] = ["năm", "tháng", "ngày", "giờ"];

/**
 * BƯỚC ② — quy tứ trụ về quẻ rồi xếp lớp.
 *
 * 4 Can Chi mang 2 quẻ (Giáp Tý, Giáp Ngọ, Canh Dần, Canh Thân): chạy CẢ HAI biến thể, lấy biến
 * thể cho lớp cao hơn, và ghi lại quẻ đã chọn — đúng yêu cầu mục 3, không tự ý chọn một bên.
 */
export function phanLopPhuongAn(tuTru: TuTruPhuongAn, doSoToa: number): KetQuaCachCuc {
  const toa = quyDoSoVeQueToa(doSoToa);
  const truCoMat: TruCanChi[] = [tuTru.nam, tuTru.thang, tuTru.ngay];
  if (tuTru.gio) truCoMat.push(tuTru.gio);

  const ungVienMoiTru = truCoMat.map((t) => quyTruVeQue(t.can, t.chi));
  const coTruHaiQue = ungVienMoiTru.some((u) => u.length > 1);

  let totNhat: { lop: LopCachCuc; chon: QueHknhQuaiVan[] } | null = null;
  // Tổ hợp tối đa 2^4 = 16 nhánh, duyệt hết là rẻ và chắc chắn đúng hơn heuristic chọn trước.
  const duyet = (i: number, dangChon: QueHknhQuaiVan[]): void => {
    if (i === ungVienMoiTru.length) {
      // Gộp cả Tọa vào tập xét lớp (chủ dự án chốt 2026-08-17).
      const lop = xepLopCachCuc([toa.hknh, ...dangChon.map((q) => q.hknh)]);
      if (totNhat === null || lop < totNhat.lop) totNhat = { lop, chon: [...dangChon] };
      return;
    }
    for (const que of ungVienMoiTru[i]!) duyet(i + 1, [...dangChon, que]);
  };
  duyet(0, []);

  const chot = totNhat!;
  return {
    lop: chot.lop,
    tenLop: TEN_LOP_CACH_CUC[chot.lop],
    queDaChon: chot.chon.map((q, i) => ({ ...q, tru: NHAN_TRU_HIEN_THI[i]! })),
    coTruHaiQue,
    hknhToa: toa.hknh,
    quaiVanToa: toa.quaiVan,
  };
}

// -------------------------------------------------------------------------------------------
// BƯỚC ③ — BẢY CHIỀU ĐO, SONG SONG
// -------------------------------------------------------------------------------------------

export interface DauVaoBayChieu {
  cachCuc: KetQuaCachCuc;
  /** Quan hệ ngày với tuổi vong — tầng facade tính (cần bảng tam hợp/lục hợp của trạch nhật). */
  quanHeMenhVong: MucMenhVong;
}

export interface GiaTriChieu {
  chieu: ChieuDoPhase2;
  /** Nhãn tiếng Việt để hiện cho khách — output KHÔNG được lộ điểm thô (mục 6). */
  nhan: string;
  /** Hệ số 0-1 trong chiều này; chỉ dùng nội bộ ở Bước ④. */
  heSo: number;
  /** true khi chiều này có gì đáng nêu trong dòng "Quan hệ đạt" của output. */
  dangNeu: boolean;
}

function queCua(cachCuc: KetQuaCachCuc, tru: QueDaChon["tru"]): QueDaChon | undefined {
  return cachCuc.queDaChon.find((q) => q.tru === tru);
}

/** CHIỀU 1 — thang riêng của Nhật Khóa ↔ Tọa (mục 4 nhấn mạnh khác thang lớp ở ②). */
export function chieuNhatKhoaToa(cachCuc: KetQuaCachCuc): { muc: MucNhatKhoaToa; nhan: string } {
  const ngay = queCua(cachCuc, "ngày")!;
  const quanHe = xetQuanHe(ngay.hknh, cachCuc.hknhToa);
  if (quanHe === "nhat_quai_thuan_thanh") return { muc: "dong-quai-khi", nhan: "Nhật khóa đồng quái khí với Tọa" };
  if (quanHe === "hop_thap" || quanHe === "hop_thap_7_3")
    return { muc: "hop-thap", nhan: "Nhật khóa hợp thập với Tọa" };
  if (quanHe === "ha_do") return { muc: "ha-do", nhan: "Nhật khóa hợp Hà Đồ với Tọa" };

  // Không giao quẻ thì tụt xuống xét sinh khắc ngũ hành giữa ngày và tọa.
  const sinhKhac = xetSinhKhac(cachCuc.hknhToa, ngay.hknh);
  if (sinhKhac === "sinh_nhap") return { muc: "ngay-sinh-toa", nhan: "Ngày sinh nhập Tọa" };
  if (sinhKhac === "khac_nhap") return { muc: "ngay-khac-toa", nhan: "Ngày khắc nhập Tọa" };
  return { muc: "khong-giao", nhan: "Nhật khóa không giao với Tọa" };
}

/** CHIỀU 2 — đếm trụ hỗ trợ trụ Ngày. Hỗ trợ = có giao quẻ với trụ Ngày (khác `khong_giao`). */
export function demTruHoTro(cachCuc: KetQuaCachCuc): number {
  const ngay = queCua(cachCuc, "ngày")!;
  return cachCuc.queDaChon.filter((q) => q.tru !== "ngày" && xetQuanHe(q.hknh, ngay.hknh) !== "khong_giao").length;
}

/** CHIỀU 4 — đồng khí: số trụ trùng HKNH với Tọa. */
export function demDongKhi(cachCuc: KetQuaCachCuc): number {
  return cachCuc.queDaChon.filter((q) => q.hknh === cachCuc.hknhToa).length;
}

export interface KetQuaSinhKhacNhap {
  sinhNhap: number;
  khacNhap: number;
  tongCap: number;
}

/**
 * CHIỀU 5 — sinh nhập / khắc nhập theo CHIỀU MỘT HƯỚNG (mục 4): Năm→Tháng/Ngày/Giờ;
 * Tháng→Ngày/Giờ; Ngày→Giờ. Không xét ngược chiều.
 */
export function xetSinhKhacNhapMotHuong(cachCuc: KetQuaCachCuc): KetQuaSinhKhacNhap {
  const thuTu: QueDaChon["tru"][] = ["năm", "tháng", "ngày", "giờ"];
  const coMat = thuTu.filter((t) => queCua(cachCuc, t) !== undefined);
  let sinhNhap = 0;
  let khacNhap = 0;
  let tongCap = 0;
  for (let i = 0; i < coMat.length; i++) {
    for (let j = i + 1; j < coMat.length; j++) {
      const chu = queCua(cachCuc, coMat[j]!)!; // trụ sau là chủ (được sinh/khắc NHẬP)
      const khach = queCua(cachCuc, coMat[i]!)!;
      const kq = xetSinhKhac(chu.hknh, khach.hknh);
      tongCap++;
      if (kq === "sinh_nhap") sinhNhap++;
      else if (kq === "khac_nhap") khacNhap++;
    }
  }
  return { sinhNhap, khacNhap, tongCap };
}

/** CHIỀU 6 — ngũ hành HKNH của ngày so với Tọa. */
export function xetNguHanhNgayVoiToa(cachCuc: KetQuaCachCuc): {
  nguHanhNgay: NguHanh;
  nguHanhToa: NguHanh;
  quanHe: ReturnType<typeof xetSinhKhac>;
} {
  const ngay = queCua(cachCuc, "ngày")!;
  return {
    nguHanhNgay: nguHanhCuaHknh(ngay.hknh),
    nguHanhToa: nguHanhCuaHknh(cachCuc.hknhToa),
    quanHe: xetSinhKhac(cachCuc.hknhToa, ngay.hknh),
  };
}

/**
 * CHIỀU 7 — Quái Vận ngày so với Quái Vận Tọa.
 *
 * ⚠️ Thiếu Thiên Y: đặc tả mục 4 yêu cầu áp Thiên Y THEO QUÁI VẬN, nhưng chưa có bảng trong dữ
 * liệu. Xem ghi chú `THIEN_Y_QUAI_VAN_CHUA_CO_BANG` ở `phase2TrongSo.ts`. Không mượn Thiên Y của
 * Bát Trạch sang vì khác hệ hoàn toàn.
 */
export function chieuQuaiVan(cachCuc: KetQuaCachCuc): keyof typeof MUC_QUAI_VAN {
  const ngay = queCua(cachCuc, "ngày")!;
  return xetQuanHeQuaiVan(ngay.quaiVan, cachCuc.quaiVanToa);
}

const NHAN_QUAI_VAN: Readonly<Record<keyof typeof MUC_QUAI_VAN, string>> = {
  dong_quai: "Đồng Quái Vận với Tọa",
  hop_thap: "Hợp Thập Quái Vận",
  hop_ngu: "Hợp Ngũ Quái Vận",
  ai_tinh_dien_dao: "Ai Tinh Điên Đảo",
  hop_thap_7_3: "Hợp Thập Quái Vận cặp 7-3",
  khong_giao: "Quái Vận không giao",
};

/** BƯỚC ③ — chạy cả 7 chiều, mỗi chiều một giá trị riêng, KHÔNG cộng gộp ở đây. */
export function danhGiaBayChieu(dauVao: DauVaoBayChieu): GiaTriChieu[] {
  const { cachCuc } = dauVao;

  const kToa = chieuNhatKhoaToa(cachCuc);
  const soTruHoTro = demTruHoTro(cachCuc);
  const soDongKhi = demDongKhi(cachCuc);
  const sinhKhac = xetSinhKhacNhapMotHuong(cachCuc);
  const nguHanh = xetNguHanhNgayVoiToa(cachCuc);
  const qv = chieuQuaiVan(cachCuc);

  const heSoTruHoTro = soTruHoTro >= 3 ? MUC_TRU_HO_TRO[3] : soTruHoTro === 2 ? MUC_TRU_HO_TRO[2] : 0;
  const heSoNguHanh = nguHanh.quanHe === "sinh_nhap" ? 1 : nguHanh.quanHe === "binh_hoa" ? 0.6 : nguHanh.quanHe === "khac_nhap" ? 0.1 : 0.4;

  return [
    {
      chieu: "nhat-khoa-toa",
      nhan: kToa.nhan,
      heSo: MUC_NHAT_KHOA_TOA[kToa.muc],
      dangNeu: kToa.muc !== "khong-giao",
    },
    {
      chieu: "tru-ho-tro",
      nhan: `${soTruHoTro} trụ hỗ trợ trụ Ngày`,
      heSo: heSoTruHoTro,
      dangNeu: soTruHoTro >= 2,
    },
    {
      chieu: "nhat-khoa-menh-vong",
      nhan:
        dauVao.quanHeMenhVong === "tam-hop"
          ? "Tam hợp với tuổi vong"
          : dauVao.quanHeMenhVong === "luc-hop"
            ? "Lục hợp với tuổi vong"
            : "Trung tính với tuổi vong",
      heSo: MUC_MENH_VONG[dauVao.quanHeMenhVong],
      dangNeu: dauVao.quanHeMenhVong !== "trung-tinh",
    },
    {
      chieu: "dong-khi",
      nhan: `${soDongKhi} trụ đồng khí với Tọa`,
      // Chuẩn hoá theo số trụ thực có, để bật/tắt trụ Giờ không làm lệch thang điểm.
      heSo: cachCuc.queDaChon.length === 0 ? 0 : soDongKhi / cachCuc.queDaChon.length,
      dangNeu: soDongKhi > 0,
    },
    {
      chieu: "sinh-khac-nhap",
      nhan: `${sinhKhac.sinhNhap} cặp sinh nhập, ${sinhKhac.khacNhap} cặp khắc nhập`,
      heSo:
        sinhKhac.tongCap === 0
          ? 0
          : Math.max(0, (sinhKhac.sinhNhap - sinhKhac.khacNhap) / sinhKhac.tongCap),
      dangNeu: sinhKhac.sinhNhap > sinhKhac.khacNhap,
    },
    {
      chieu: "ngu-hanh",
      nhan: `Ngũ hành ngày ${nguHanh.nguHanhNgay} với Tọa ${nguHanh.nguHanhToa}`,
      heSo: heSoNguHanh,
      dangNeu: nguHanh.quanHe === "sinh_nhap",
    },
    { chieu: "quai-van", nhan: NHAN_QUAI_VAN[qv], heSo: MUC_QUAI_VAN[qv], dangNeu: qv !== "khong_giao" },
  ];
}

/** Cảnh báo mềm mục 4 — hiện ghi chú, KHÔNG loại phương án. */
export function canhBaoMem(cachCuc: KetQuaCachCuc, ngayPhamSatChuDuong: boolean): string[] {
  const ra: string[] = [];
  if (ngayPhamSatChuDuong) ra.push("Ngày phạm Sát Chủ Dương (cảnh báo mềm, không loại)");
  const hknhCacTru = cachCuc.queDaChon.map((q) => q.hknh);
  if (hknhCacTru.length > 0 && laThuanAmHoacThuanDuong(hknhCacTru)) ra.push("Tứ Trụ thuần âm hoặc thuần dương");
  const ngay = queCua(cachCuc, "ngày")!;
  if (xetQuanHe(ngay.hknh, cachCuc.hknhToa) === "hop_thap_7_3") ra.push("Cặp Hợp Thập 7-3 — nguồn ghi hạn chế");
  return ra;
}

// -------------------------------------------------------------------------------------------
// BƯỚC ④ + ⑤ — TỔNG HỢP TRỌNG SỐ VÀ XẾP HẠNG
// -------------------------------------------------------------------------------------------

/**
 * BƯỚC ④ — điểm tổng hợp. CHỈ dùng để xếp hạng nội bộ trong cùng lớp ở Bước ②; tuyệt đối không so
 * xuyên lớp, và không bao giờ hiển thị cho khách (mục 6 cấm hiện điểm thô).
 */
export function tinhDiemNoiBoLop(cacChieu: readonly GiaTriChieu[]): number {
  return cacChieu.reduce((tong, c) => tong + TRONG_SO_AN_TANG[c.chieu] * c.heSo, 0);
}

export interface PhuongAnDeXepHang {
  /** Khoá do tầng gọi đặt (VD "2026-08-20 giờ Thìn") — engine không diễn giải. */
  id: string;
  cachCuc: KetQuaCachCuc;
  cacChieu: GiaTriChieu[];
  canhBao: string[];
}

export interface PhuongAnDaXepHang extends PhuongAnDeXepHang {
  thuHang: number;
  /** Các quan hệ đáng nêu, đã sắp theo thứ hạng chiều — đây là dòng "Quan hệ đạt" ở output. */
  quanHeDat: string[];
  /** Nội bộ. Không được đưa xuống UI. */
  diemNoiBo: number;
}

/**
 * BƯỚC ⑤ — xếp hạng: LỚP TRƯỚC, điểm sau.
 *
 * Đây là chỗ dễ sai nhất của cả Phase 2, nên viết tường minh: so `lop` trước, chỉ khi cùng lớp mới
 * so điểm. Nhờ vậy "Hà Đồ điểm thấp" luôn đứng trên "Hợp Thập điểm cao" — đúng nguyên tắc bất di
 * dịch ở mục 3 ("lớp không bị dimension hay trọng số lật ngược").
 */
export function xepHangPhuongAn(dsPhuongAn: readonly PhuongAnDeXepHang[]): PhuongAnDaXepHang[] {
  const thuTuChieu = new Map(THU_TU_CHIEU_DO.map((c, i) => [c, i]));
  return dsPhuongAn
    .map((p) => ({
      ...p,
      diemNoiBo: tinhDiemNoiBoLop(p.cacChieu),
      quanHeDat: [...p.cacChieu]
        .filter((c) => c.dangNeu)
        .sort((a, b) => thuTuChieu.get(a.chieu)! - thuTuChieu.get(b.chieu)!)
        .map((c) => c.nhan),
      thuHang: 0,
    }))
    .sort((a, b) => (a.cachCuc.lop !== b.cachCuc.lop ? a.cachCuc.lop - b.cachCuc.lop : b.diemNoiBo - a.diemNoiBo))
    .map((p, i) => ({ ...p, thuHang: i + 1 }));
}

/**
 * Câu kết luận so sánh 2 phương án đầu, theo đúng khuôn mục 6.
 *
 * Cấm tuyệt đối kiểu "Hà Đồ 140 điểm tốt hơn Đồng quái khí 120 điểm" — nên hàm này không bao giờ
 * chèn con số vào chuỗi trả về.
 */
export function cauKetLuanSoSanh(ds: readonly PhuongAnDaXepHang[]): string | null {
  if (ds.length < 2) return null;
  const [a, b] = ds as readonly [PhuongAnDaXepHang, PhuongAnDaXepHang];
  if (a.cachCuc.lop !== b.cachCuc.lop) {
    return `Phương án 1 thắng về phẩm cấp cách cục (${a.cachCuc.tenLop} so với ${b.cachCuc.tenLop}).`;
  }
  return `Hai phương án cùng phẩm cấp ${a.cachCuc.tenLop}; phương án 1 được gia cường mạnh hơn.`;
}
