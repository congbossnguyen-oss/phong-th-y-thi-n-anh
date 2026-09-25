/**
 * ENGINE LUẬN NHÀ theo HUYỀN KHÔNG ĐẠI QUÁI (HKĐQ) — Bước 0–8, tính THUẦN TÚY (deterministic).
 *
 * Nguồn spec: gói `hkdq-web-module` (SPEC.md + data/) do anh Công cung cấp. Đây là CÔNG CỤ TEST
 * NỘI BỘ (chỉ admin) để anh Công tự kiểm engine tính đúng/sai — KHÔNG phải sản phẩm khách hàng.
 *
 * NGUYÊN TẮC BẮT BUỘC (SPEC mục 1, README):
 * - Engine tính, AI chỉ viết lời. Toàn bộ file này là `nguon: "engine"`; Bước 9 (đề xuất hóa giải,
 *   AI) tách riêng ở `ai-hoa-giai.ts`, chạy qua nút bấm, KHÔNG tự động gọi kèm.
 * - KHÔNG ĐOÁN khi thiếu dữ liệu: mọi chỗ nguồn còn thiếu (cấu trúc hào, Phản/Phục Ngâm, Đồng
 *   Nguyên Long, tên quẻ chủ Vận 3, Sơn/Hướng...) trả `null` + ghi vào `thieuDuLieu[]`, tuyệt đối
 *   không bịa số cho "đủ".
 * - BAO-TRÙM: TÁI SỬ DỤNG bảng 64 quẻ + `queTuDoSo` đã có sẵn trong `@thien-anh/rule-engine`
 *   (module `xem-ngay-cao-cap` cũng dùng HKĐQ) — KHÔNG viết lại bảng 64 quẻ lần 2.
 * - Mỗi Bước = 1 hàm riêng, không gộp, không đảo thứ tự (SPEC mục 1 + 4).
 * - `luanNha(input)` nhận `namLuanHienTai` như 1 tham số → về sau chỉ cần loop nhiều năm để có dự
 *   báo lưu niên, KHÔNG phải viết engine mới (SPEC mục 8).
 */
import { XemNgayCaoCap } from "@thien-anh/rule-engine";

const { queTuDoSo, BANG_64_QUE_MASTER, DO_RONG_MOI_QUE } = XemNgayCaoCap;
type QueTheoDoSo = XemNgayCaoCap.QueTheoDoSo;

// ────────────────────────────────────────────────────────────────────────────
// Hằng số & bảng dữ liệu tĩnh (lookup, KHÔNG phải business logic)
// ────────────────────────────────────────────────────────────────────────────

/** Nhóm số Quái Khí cố định (SPEC mục 3.3 / data mục 6). Không có số 5. */
export const NHOM_A: readonly number[] = [1, 2, 3, 4];
export const NHOM_B: readonly number[] = [6, 7, 8, 9];

/**
 * Ngưỡng không vong quanh mốc chia 5.625° (SPEC mục 3.1).
 * ⚠️ 0.3° chỉ là GỢI Ý mặc định — tài liệu gốc mới có "±5°" cho cấp 24 sơn/8 cung, CHƯA có số
 * chính xác cho ranh giới 64 quẻ. CẦN anh Công duyệt lại trước khi coi là chuẩn (nêu ở ghiChuTinCay).
 */
export const NGUONG_KHONG_VONG_DEFAULT = 0.3;

/** Mốc "đại không vong" (nặng nhất) và "âm dương sai thác" theo data mục 10. */
const MOC_DAI_KHONG_VONG = [0, 90, 180, 270];
const MOC_AM_DUONG_SAI_THAC = [90, 135, 225];

/**
 * Nhị Nguyên Bát Vận (data mục 3a). KHÔNG có Vận 5. Vận 3 CHƯA rõ tên quẻ chủ vận → `null`,
 * KHÔNG bịa (SPEC mục 3.2 + mục 6). Nguyên: Thượng = {1,2,3,4}, Hạ = {6,7,8,9} (khớp NHOM_A/B).
 */
export const BANG_VAN: ReadonlyArray<{ van: number; quaiChuVan: string | null; tuNam: number; denNam: number }> = [
  { van: 1, quaiChuVan: "Khôn", tuNam: 1864, denNam: 1881 },
  { van: 2, quaiChuVan: "Tốn", tuNam: 1882, denNam: 1905 },
  { van: 3, quaiChuVan: null, tuNam: 1906, denNam: 1929 }, // tên quẻ CHƯA XÁC ĐỊNH
  { van: 4, quaiChuVan: "Đoài", tuNam: 1930, denNam: 1953 },
  { van: 6, quaiChuVan: "Cấn", tuNam: 1954, denNam: 1974 },
  { van: 7, quaiChuVan: "Khảm", tuNam: 1975, denNam: 1995 },
  { van: 8, quaiChuVan: "Chấn", tuNam: 1996, denNam: 2016 },
  { van: 9, quaiChuVan: "Càn", tuNam: 2017, denNam: 2043 },
];

// ────────────────────────────────────────────────────────────────────────────
// Kiểu Input / Output
// ────────────────────────────────────────────────────────────────────────────

export type MucDichLuan = "tong_quat" | "tai_loc" | "suc_khoe" | "hon_nhan" | "su_nghiep" | "con_cai";

export interface CuaInput {
  ten: string;
  doSo: number;
  /** Số cánh mở của cửa (1 = 1 cánh; ≥2 = nhiều cánh, có thể chạm 2 quẻ). */
  soCanhMo?: number | null;
}
export interface NoiCucInput {
  loai: "bep" | "giuong_ngu" | "ban_lam_viec" | (string & {});
  moTa?: string | null;
  doSo?: number | null;
}
export interface ThuyPhapInput {
  nuocDenDoSo?: number | null;
  nuocDiDoSo?: number | null;
}
export interface LuanNhaInput {
  /** Bắt buộc. */
  toaDo: number;
  /** Bắt buộc. */
  huongDo: number;
  namNhapTrach?: number | null;
  /** "Năm luận" (Bước 1). Mặc định = năm hiện tại. Tham số hóa để loop lưu niên sau này (SPEC mục 8). */
  namLuanHienTai?: number | null;
  mucDichLuan?: MucDichLuan | null;
  namSinhGiaChu?: number | null;
  cua?: CuaInput[] | null;
  noiCuc?: NoiCucInput[] | null;
  thuyPhap?: ThuyPhapInput | null;
  /** Reserved (SPEC mục 8 — "phát cho ai"). Chưa truyền thì bỏ qua, KHÔNG suy đoán. */
  banGanNhanKhau?: Record<string, string> | null;
  /** Ghi đè ngưỡng không vong (SPEC mục 3.1). Mặc định NGUONG_KHONG_VONG_DEFAULT. */
  nguongKhongVong?: number | null;
}

export type NhomThan = "chinh_than" | "linh_than";
export type MucDo = "vuong" | "suy" | "trung_tinh";

export interface ThieuDuLieu {
  buoc: number;
  ly_do: string;
}
export interface DienGiai {
  buoc: number;
  noiDung: string;
}

export interface VanOut {
  so: number | null;
  nguyen: "thuong" | "ha" | null;
  quaiChuVan: string | null;
  namBatDau: number | null;
  namKetThuc: number | null;
}

export interface ViTriQueOut {
  doSo: number;
  que: string; // tên ngắn trên la kinh
  tenDayDu: string;
  quaiKhi: number; // = HKNH (cột "Quái khí")
  quaiVan: number;
  canChi: string;
  chinhLinhThan: NhomThan | null; // null nếu chưa xác định được Vận
  satRanhGioi: boolean;
  /** Reserved (SPEC mục 8) — cấu trúc 6 hào chưa có trong bảng 64 quẻ → luôn null cho tới khi có data. */
  haoCauTruc: string | null;
}

export interface KhongVongOut {
  phamPhai: boolean;
  viTri: string[];
  moTa: string;
}
export interface HopThapOut {
  co: boolean;
  giua: string[];
  tong: number;
}
export interface ThatTinhDaKiepOut {
  co: boolean | null;
  lyDoKhongTinhDuoc: string | null;
}
export interface CachCucDacBiet {
  khongVong: KhongVongOut | null;
  phanNgam: null; // reserved — nguồn CHƯA đủ dữ liệu (README "còn hở")
  phucNgam: null; // reserved — nguồn CHƯA đủ dữ liệu
  hopThap: HopThapOut | null;
  dongNguyenLong: null; // reserved — chưa có bảng nhóm nguyên long trong data
  thatTinhDaKiep: ThatTinhDaKiepOut;
}

export interface CuaOut {
  ten: string;
  doSo: number;
  que: string;
  quaiKhi: number;
  quaiVan: number;
  canChi: string;
  chinhLinhThan: NhomThan | null;
  soCanhMo: number | null;
  khiChat: "thuan" | "tap" | "khong_xac_dinh";
  queLienQuan: string[]; // quẻ kề khi cửa nhiều cánh chạm ranh giới
  satRanhGioi: boolean;
  ghiChu: string[];
}
export interface ThuyDiemOut {
  nhan: "nuoc_den" | "nuoc_di";
  doSo: number;
  que: string;
  quaiKhi: number;
  chinhLinhThan: NhomThan | null;
  hopThapVoiHuong: boolean;
}
export interface ThuyPhapOut {
  nuocDen: ThuyDiemOut | null;
  nuocDi: ThuyDiemOut | null;
  dienGiai: DienGiai[];
}
export interface NoiCucOut {
  loai: string;
  moTa: string | null;
  doSo: number | null;
  que: string | null;
  quaiKhi: number | null;
  chinhLinhThan: NhomThan | null;
  /** Reserved (SPEC mục 8) — "phát cho ai" chưa có bảng gán nhân khẩu → null. */
  phatChoAi: null;
  ghiChu: string[];
}

export interface NhanDinh {
  yeuTo: string;
  mucDo: MucDo;
  canCu: string;
}

export interface KetQuaLuanNha {
  input: {
    toaDo: number;
    huongDo: number;
    namNhapTrach: number | null;
    namLuanHienTai: number;
    mucDichLuan: MucDichLuan;
    namSinhGiaChu: number | null;
    nguongKhongVong: number;
  };
  van: VanOut;
  toa: ViTriQueOut;
  huong: ViTriQueOut;
  thuyPhap: ThuyPhapOut | null;
  cua: CuaOut[] | null;
  noiCuc: NoiCucOut[] | null;
  cachCucDacBiet: CachCucDacBiet;
  tongHop: NhanDinh[];
  /** Reserved (SPEC mục 8) — "Sơn quản Đinh, Hướng quản Tài" chưa xác nhận đúng nguồn → null. */
  soanTaiQuanNiem: null;
  dienGiai: DienGiai[];
  thieuDuLieu: ThieuDuLieu[];
  /** Cảnh báo độ tin cậy (những chỗ suy ra từ nguyên tắc chung, chưa trích nguyên văn nguồn). */
  ghiChuTinCay: string[];
  nguon: "engine";
}

// ────────────────────────────────────────────────────────────────────────────
// Helper nhỏ
// ────────────────────────────────────────────────────────────────────────────

function chuanHoaDo(d: number): number {
  return ((d % 360) + 360) % 360;
}

/** Khoảng cách từ độ số tới đường ranh giới quẻ gần nhất. */
function khoangCachRanhGioi(que: QueTheoDoSo, d: number): number {
  return Math.min(d - que.doBatDau, que.doKetThuc - d);
}

/** Quẻ kề bên qua đường ranh giới gần `d` nhất (dùng khi cửa nhiều cánh chạm ranh). */
function queKeGanNhat(que: QueTheoDoSo, d: number): QueTheoDoSo {
  const gapStart = d - que.doBatDau;
  const gapEnd = que.doKetThuc - d;
  const doKe = gapStart <= gapEnd ? que.doBatDau - DO_RONG_MOI_QUE / 2 : que.doKetThuc + DO_RONG_MOI_QUE / 2;
  return queTuDoSo(doKe);
}

function apGanMoc(d: number, mocs: number[], eps: number): number | null {
  for (const m of mocs) {
    // so cả 0 và 360 cho mốc 0
    if (Math.abs(d - m) <= eps || Math.abs(d - (m + 360)) <= eps || Math.abs(d + 360 - m) <= eps) return m;
  }
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// Bước 0 — validateInput
// ────────────────────────────────────────────────────────────────────────────

export interface KetQuaValidate {
  hopLe: boolean;
  loiChan: string[]; // lỗi chặn (thiếu trường bắt buộc / sai kiểu)
  thieuOptional: ThieuDuLieu[]; // thiếu optional → bỏ qua bước tương ứng, không chặn
}

export function validateInput(input: LuanNhaInput): KetQuaValidate {
  const loiChan: string[] = [];
  const thieuOptional: ThieuDuLieu[] = [];

  if (!Number.isFinite(input.toaDo)) loiChan.push("Thiếu hoặc sai `toaDo` (độ tọa, bắt buộc).");
  if (!Number.isFinite(input.huongDo)) loiChan.push("Thiếu hoặc sai `huongDo` (độ hướng, bắt buộc).");

  if (!input.thuyPhap || (input.thuyPhap.nuocDenDoSo == null && input.thuyPhap.nuocDiDoSo == null)) {
    thieuOptional.push({ buoc: 4, ly_do: "Không có `thuyPhap` trong input — bỏ qua Bước 4 (thủy pháp)." });
  }
  if (!input.cua || input.cua.length === 0) {
    thieuOptional.push({ buoc: 5, ly_do: "Không có `cua[]` trong input — bỏ qua Bước 5 (xét cửa)." });
  }
  const mucDich = input.mucDichLuan ?? "tong_quat";
  if (!input.noiCuc || input.noiCuc.length === 0) {
    thieuOptional.push({ buoc: 6, ly_do: "Không có `noiCuc[]` trong input — bỏ qua Bước 6 (nội cục)." });
  } else if (mucDich === "tong_quat") {
    thieuOptional.push({ buoc: 6, ly_do: "`mucDichLuan` = tong_quat — Bước 6 (nội cục) chỉ chạy khi luận mục đích cụ thể." });
  }
  if (input.namSinhGiaChu == null && input.namNhapTrach == null) {
    thieuOptional.push({ buoc: 7, ly_do: "Thiếu cả `namSinhGiaChu` lẫn `namNhapTrach` — không đủ để xét Thất Tinh Đả Kiếp người–nhà." });
  }

  return { hopLe: loiChan.length === 0, loiChan, thieuOptional };
}

// ────────────────────────────────────────────────────────────────────────────
// Bước 1 — xacDinhVan(namLuan)
// ────────────────────────────────────────────────────────────────────────────

export function xacDinhVan(namLuan: number): { out: VanOut; trongBang: boolean } {
  const row = BANG_VAN.find((v) => namLuan >= v.tuNam && namLuan <= v.denNam);
  if (!row) {
    return { out: { so: null, nguyen: null, quaiChuVan: null, namBatDau: null, namKetThuc: null }, trongBang: false };
  }
  return {
    out: {
      so: row.van,
      nguyen: row.van <= 4 ? "thuong" : "ha",
      quaiChuVan: row.quaiChuVan,
      namBatDau: row.tuNam,
      namKetThuc: row.denNam,
    },
    trongBang: true,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Bước 2 — lapQuaiToaHuong(toaDo, huongDo)
// ────────────────────────────────────────────────────────────────────────────

/** Dựng ViTriQueOut (chưa gắn chinhLinhThan — cần Vận ở Bước 3). */
function moTaViTriQue(doSo: number, nguong: number): ViTriQueOut {
  const d = chuanHoaDo(doSo);
  const q = queTuDoSo(d);
  return {
    doSo: d,
    que: q.tenNgan,
    tenDayDu: q.tenDayDu,
    quaiKhi: q.hknh,
    quaiVan: q.quaiVan,
    canChi: `${q.can} ${q.chi}`,
    chinhLinhThan: null,
    satRanhGioi: khoangCachRanhGioi(q, d) < nguong,
    haoCauTruc: null,
  };
}

export function lapQuaiToaHuong(toaDo: number, huongDo: number, nguong: number): { toa: ViTriQueOut; huong: ViTriQueOut } {
  return { toa: moTaViTriQue(toaDo, nguong), huong: moTaViTriQue(huongDo, nguong) };
}

// ────────────────────────────────────────────────────────────────────────────
// Bước 3 — chinhLinhThan(van, quaiKhi)
// ────────────────────────────────────────────────────────────────────────────

/**
 * SPEC mục 3.3 / data mục 6 (Công đã xác nhận đúng CẤU TRÚC 2 nhóm qua 3 ảnh la kinh):
 * Vận hiện hành thuộc nhóm nào → nhóm đó là Chính Thần, nhóm kia là Linh Thần.
 */
export function chinhLinhThan(van: number, quaiKhi: number): NhomThan {
  const nhomVan = NHOM_A.includes(van) ? NHOM_A : NHOM_B;
  return nhomVan.includes(quaiKhi) ? "chinh_than" : "linh_than";
}

// ────────────────────────────────────────────────────────────────────────────
// Bước 4 — xetThuyPhap
// ────────────────────────────────────────────────────────────────────────────

export function xetThuyPhap(
  thuyPhap: ThuyPhapInput,
  huong: ViTriQueOut,
  van: number | null,
  nguong: number,
): ThuyPhapOut {
  const dienGiai: DienGiai[] = [];

  const dungDiem = (doSo: number, nhan: "nuoc_den" | "nuoc_di"): ThuyDiemOut => {
    const v = moTaViTriQue(doSo, nguong);
    const clt = van != null ? chinhLinhThan(van, v.quaiKhi) : null;
    const hopThap = v.quaiKhi + huong.quaiKhi === 10;
    dienGiai.push({
      buoc: 4,
      noiDung:
        `${nhan === "nuoc_den" ? "Nước đến" : "Nước đi"} tại ${v.doSo}° = quẻ ${v.que} (Quái Khí ${v.quaiKhi})` +
        (clt ? `, thuộc vùng ${clt === "linh_than" ? "Linh Thần (lý tưởng để có Thủy)" : "Chính Thần"}` : "") +
        (hopThap ? "; hợp thập với Hướng (tốt nhất theo data mục 7)." : "; KHÔNG hợp thập với Hướng."),
    });
    return { nhan, doSo: v.doSo, que: v.que, quaiKhi: v.quaiKhi, chinhLinhThan: clt, hopThapVoiHuong: hopThap };
  };

  const nuocDen = thuyPhap.nuocDenDoSo != null && Number.isFinite(thuyPhap.nuocDenDoSo) ? dungDiem(thuyPhap.nuocDenDoSo, "nuoc_den") : null;
  const nuocDi = thuyPhap.nuocDiDoSo != null && Number.isFinite(thuyPhap.nuocDiDoSo) ? dungDiem(thuyPhap.nuocDiDoSo, "nuoc_di") : null;

  return { nuocDen, nuocDi, dienGiai };
}

// ────────────────────────────────────────────────────────────────────────────
// Bước 5 — xetCua
// ────────────────────────────────────────────────────────────────────────────

export function xetCua(cua: CuaInput[], van: number | null, nguong: number): CuaOut[] {
  return cua.map((c) => {
    const d = chuanHoaDo(c.doSo);
    const q = queTuDoSo(d);
    const clt = van != null ? chinhLinhThan(van, q.hknh) : null;
    const satRanh = khoangCachRanhGioi(q, d) < nguong;
    const soCanh = c.soCanhMo ?? null;
    const ghiChu: string[] = [];

    let khiChat: CuaOut["khiChat"];
    const queLienQuan: string[] = [];
    if (soCanh == null) {
      khiChat = "khong_xac_dinh";
      ghiChu.push("Thiếu `soCanhMo` — chưa xác định thuần/tạp khí.");
    } else if (soCanh <= 1) {
      khiChat = "thuan";
    } else {
      // Cửa ≥2 cánh: nếu chạm ranh giới quẻ → tạp (chạm 2 quẻ). Ngược lại tạm coi thuần.
      // ⚠️ HEURISTIC: độ RỘNG vật lý của cửa 2 cánh KHÔNG có trong dữ liệu nguồn → chỉ suy từ việc
      // độ số có sát ranh giới quẻ hay không. Anh Công review lại (ghi ở ghiChuTinCay).
      if (satRanh) {
        khiChat = "tap";
        queLienQuan.push(queKeGanNhat(q, d).tenNgan);
        ghiChu.push(`Cửa ${soCanh} cánh nằm sát ranh giới quẻ → tạp khí, chạm thêm quẻ ${queLienQuan[0]}.`);
      } else {
        khiChat = "thuan";
        ghiChu.push(`Cửa ${soCanh} cánh nhưng độ số không sát ranh giới → tạm xét thuần khí (chưa có độ rộng cửa trong dữ liệu).`);
      }
    }

    return {
      ten: c.ten,
      doSo: d,
      que: q.tenNgan,
      quaiKhi: q.hknh,
      quaiVan: q.quaiVan,
      canChi: `${q.can} ${q.chi}`,
      chinhLinhThan: clt,
      soCanhMo: soCanh,
      khiChat,
      queLienQuan,
      satRanhGioi: satRanh,
      ghiChu,
    };
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Bước 6 — xetNoiCuc
// ────────────────────────────────────────────────────────────────────────────

export function xetNoiCuc(noiCuc: NoiCucInput[], van: number | null, nguong: number): NoiCucOut[] {
  return noiCuc.map((n) => {
    if (n.doSo == null || !Number.isFinite(n.doSo)) {
      return {
        loai: n.loai,
        moTa: n.moTa ?? null,
        doSo: null,
        que: null,
        quaiKhi: null,
        chinhLinhThan: null,
        phatChoAi: null,
        ghiChu: ["Thiếu `doSo` cho nội cục này — không tra được quẻ."],
      };
    }
    const d = chuanHoaDo(n.doSo);
    const q = queTuDoSo(d);
    return {
      loai: n.loai,
      moTa: n.moTa ?? null,
      doSo: d,
      que: q.tenNgan,
      quaiKhi: q.hknh,
      chinhLinhThan: van != null ? chinhLinhThan(van, q.hknh) : null,
      phatChoAi: null,
      ghiChu: [],
    };
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Bước 7 — kiemTraCachCucDacBiet
// ────────────────────────────────────────────────────────────────────────────

export function kiemTraCachCucDacBiet(
  toa: ViTriQueOut,
  huong: ViTriQueOut,
  namSinhGiaChu: number | null,
  namNhapTrach: number | null,
  nguong: number,
): { cachCuc: CachCucDacBiet; thieuDuLieu: ThieuDuLieu[]; dienGiai: DienGiai[] } {
  const thieuDuLieu: ThieuDuLieu[] = [];
  const dienGiai: DienGiai[] = [];

  // 7a. Không vong
  const viTri: string[] = [];
  const moTaParts: string[] = [];
  for (const [ten, v] of [["toa", toa], ["huong", huong]] as const) {
    if (!v.satRanhGioi) continue;
    viTri.push(ten);
    const q = queTuDoSo(v.doSo);
    const gapStart = v.doSo - q.doBatDau;
    const bienGan = gapStart <= q.doKetThuc - v.doSo ? q.doBatDau : q.doKetThuc;
    const queKe = queKeGanNhat(q, v.doSo);
    const dai = apGanMoc(bienGan, MOC_DAI_KHONG_VONG, nguong);
    const saiThac = apGanMoc(bienGan, MOC_AM_DUONG_SAI_THAC, nguong);
    const khacQuaiVan = q.quaiVan !== queKe.quaiVan;
    const hopThapKe = q.hknh + queKe.hknh === 10;
    let mo = `${ten === "toa" ? "Tọa" : "Hướng"} ${v.doSo}° sát ranh giới ${q.tenNgan}/${queKe.tenNgan} (mốc ${bienGan.toFixed(3)}°)`;
    if (dai != null) mo += ` — ĐẠI KHÔNG VONG (mốc ${dai}°, nặng nhất)`;
    else if (saiThac != null) mo += ` — âm dương sai thác (mốc ${saiThac}°)`;
    if (khacQuaiVan && !hopThapKe) mo += "; 2 quẻ khác Quái Vận và KHÔNG hợp thập → theo data mục 10 gần như không hóa giải được";
    moTaParts.push(mo);
    dienGiai.push({ buoc: 7, noiDung: mo });
  }
  const khongVong: KhongVongOut = {
    phamPhai: viTri.length > 0,
    viTri,
    moTa: moTaParts.join(" | ") || "Tọa và Hướng đều không sát ranh giới quẻ (không phạm không vong theo ngưỡng hiện tại).",
  };

  // 7b. Hợp thập giữa Tọa & Hướng (Quái Khí cộng 10) — data mục 8
  const tongKhi = toa.quaiKhi + huong.quaiKhi;
  const hopThap: HopThapOut = { co: tongKhi === 10, giua: ["toa", "huong"], tong: tongKhi };
  dienGiai.push({
    buoc: 7,
    noiDung: `Quái Khí Tọa ${toa.quaiKhi} + Hướng ${huong.quaiKhi} = ${tongKhi}${tongKhi === 10 ? " → HỢP THẬP." : " → không hợp thập."}`,
  });

  // 7c. Phản Ngâm / Phục Ngâm — CHƯA đủ dữ liệu (README "còn hở")
  thieuDuLieu.push({ buoc: 7, ly_do: "Phản Ngâm / Phục Ngâm: nguồn chưa đủ dữ liệu → để null, không suy đoán." });

  // 7d. Đồng Nguyên Long — CHƯA có bảng nhóm nguyên long trong data
  thieuDuLieu.push({ buoc: 7, ly_do: "Đồng Nguyên Long: chưa có bảng phân nhóm Thiên/Địa/Nhân Nguyên Long trong dữ liệu → để null." });

  // 7e. Thất Tinh Đả Kiếp — cần cấu trúc hào (chưa có) + năm sinh gia chủ/nhập trạch
  const lyDo: string[] = ["thiếu cấu trúc 6 hào của 64 quẻ (chưa có trong bảng dữ liệu nguồn)"];
  if (namSinhGiaChu == null && namNhapTrach == null) lyDo.push("thiếu năm sinh gia chủ / năm nhập trạch để xét Đả Kiếp người–nhà");
  const thatTinhDaKiep: ThatTinhDaKiepOut = { co: null, lyDoKhongTinhDuoc: lyDo.join("; ") };
  thieuDuLieu.push({ buoc: 7, ly_do: `Thất Tinh Đả Kiếp: ${thatTinhDaKiep.lyDoKhongTinhDuoc} → để null.` });

  return {
    cachCuc: { khongVong, phanNgam: null, phucNgam: null, hopThap, dongNguyenLong: null, thatTinhDaKiep },
    thieuDuLieu,
    dienGiai,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Bước 8 — tongHopCatHung
// ────────────────────────────────────────────────────────────────────────────

/**
 * Tổng hợp nhận định. `mucDo` (vượng/suy) dựa trên NGUYÊN TẮC CHUNG lý khí (Chính Thần = vượng khí
 * đương vận; Linh Thần = suy khí, nhưng là vị trí lý tưởng để có Thủy) — mỗi nhận định ghi rõ
 * `canCu`. Kết luận cát/hung CUỐI CÙNG do anh Công đối chiếu (SPEC mục 6 — không tự khẳng định 100%).
 */
export function tongHopCatHung(
  van: VanOut,
  toa: ViTriQueOut,
  huong: ViTriQueOut,
  cachCuc: CachCucDacBiet,
): NhanDinh[] {
  const nhanDinh: NhanDinh[] = [];

  if (van.so != null) {
    for (const [ten, v] of [["toa", toa], ["huong", huong]] as const) {
      const clt = v.chinhLinhThan;
      if (clt == null) continue;
      nhanDinh.push({
        yeuTo: ten,
        mucDo: clt === "chinh_than" ? "vuong" : "suy",
        canCu:
          `buoc_3: ${ten === "toa" ? "Tọa" : "Hướng"} quẻ ${v.que} (Quái Khí ${v.quaiKhi}) thuộc nhóm ` +
          `${clt === "chinh_than" ? "Chính Thần (đương vận " + van.so + ") — vượng khí" : "Linh Thần — suy khí đương vận, lý tưởng để bố trí Thủy"} ` +
          "(theo nguyên tắc chung lý khí).",
      });
    }
  } else {
    nhanDinh.push({ yeuTo: "van", mucDo: "trung_tinh", canCu: "buoc_1: năm luận ngoài bảng Vận (1864–2043) → chưa xác định được Vận để luận vượng/suy." });
  }

  if (cachCuc.hopThap?.co) {
    nhanDinh.push({ yeuTo: "toa_huong", mucDo: "vuong", canCu: `buoc_7: Tọa+Hướng hợp thập (Quái Khí ${cachCuc.hopThap.tong}=10) → phối âm dương tốt (data mục 8).` });
  }
  if (cachCuc.khongVong?.phamPhai) {
    nhanDinh.push({ yeuTo: cachCuc.khongVong.viTri.join(","), mucDo: "suy", canCu: `buoc_7: phạm không vong — ${cachCuc.khongVong.moTa}` });
  }

  return nhanDinh;
}

// ────────────────────────────────────────────────────────────────────────────
// Orchestrator — luanNha(input) chạy Bước 0→8 đúng thứ tự
// ────────────────────────────────────────────────────────────────────────────

export function luanNha(input: LuanNhaInput): KetQuaLuanNha {
  // Bước 0
  const validate = validateInput(input);
  if (!validate.hopLe) {
    throw new Error(validate.loiChan.join(" "));
  }

  const nguong = input.nguongKhongVong != null && Number.isFinite(input.nguongKhongVong) ? input.nguongKhongVong : NGUONG_KHONG_VONG_DEFAULT;
  const namLuan = input.namLuanHienTai != null && Number.isFinite(input.namLuanHienTai) ? input.namLuanHienTai : new Date().getFullYear();
  const mucDich: MucDichLuan = input.mucDichLuan ?? "tong_quat";

  const dienGiai: DienGiai[] = [];
  const thieuDuLieu: ThieuDuLieu[] = [...validate.thieuOptional];
  const ghiChuTinCay: string[] = [
    "Công năng Chính Thần (mở cửa/Sơn) & Linh Thần (có Thủy) là SUY RA từ nguyên tắc chung lý khí — cấu trúc 2 nhóm đã được anh Công xác nhận, nhưng câu công năng chưa trích nguyên văn tài liệu gốc (SPEC mục 6).",
    `Ngưỡng không vong đang dùng ${nguong}° chỉ là mặc định gợi ý — CẦN anh Công duyệt lại (tài liệu gốc mới có "±5°" cho 24 sơn, chưa có số cho ranh giới 64 quẻ).`,
    "Thuần/tạp khí của cửa nhiều cánh suy từ việc độ số có sát ranh giới hay không (độ rộng vật lý cửa chưa có trong dữ liệu) — heuristic, cần anh Công xác nhận.",
  ];

  // Bước 1
  const { out: van, trongBang } = xacDinhVan(namLuan);
  if (!trongBang) {
    thieuDuLieu.push({ buoc: 1, ly_do: `Năm luận ${namLuan} nằm ngoài bảng Vận (1864–2043) → không xác định được Vận; các bước dựa vào Vận (Chính/Linh Thần) sẽ để null.` });
    dienGiai.push({ buoc: 1, noiDung: `Năm luận ${namLuan}: ngoài bảng Nhị Nguyên Bát Vận.` });
  } else {
    dienGiai.push({ buoc: 1, noiDung: `Năm luận ${namLuan} → Vận ${van.so} (${van.nguyen === "thuong" ? "Thượng" : "Hạ"} Nguyên${van.quaiChuVan ? ", quái chủ vận " + van.quaiChuVan : ", quái chủ vận CHƯA xác định trong dữ liệu"}).` });
    if (van.so === 3 && van.quaiChuVan == null) {
      thieuDuLieu.push({ buoc: 1, ly_do: "Vận 3: tên quẻ chủ vận CHƯA xác định trong dữ liệu nguồn — không bịa (số Vận vẫn dùng bình thường)." });
    }
  }

  // Bước 2
  const { toa, huong } = lapQuaiToaHuong(input.toaDo, input.huongDo, nguong);
  dienGiai.push({ buoc: 2, noiDung: `Tọa ${toa.doSo}° = ${toa.que} (Khí ${toa.quaiKhi}/Vận ${toa.quaiVan}, ${toa.canChi}); Hướng ${huong.doSo}° = ${huong.que} (Khí ${huong.quaiKhi}/Vận ${huong.quaiVan}, ${huong.canChi}).` });

  // Bước 3 — gắn Chính/Linh Thần cho Tọa & Hướng
  if (van.so != null) {
    toa.chinhLinhThan = chinhLinhThan(van.so, toa.quaiKhi);
    huong.chinhLinhThan = chinhLinhThan(van.so, huong.quaiKhi);
    dienGiai.push({ buoc: 3, noiDung: `Vận ${van.so}: Tọa (Khí ${toa.quaiKhi}) → ${toa.chinhLinhThan}; Hướng (Khí ${huong.quaiKhi}) → ${huong.chinhLinhThan}.` });
  } else {
    thieuDuLieu.push({ buoc: 3, ly_do: "Không có Vận → không xác định được Chính/Linh Thần cho Tọa/Hướng." });
  }

  // Bước 4 — thủy pháp (optional)
  let thuyPhap: ThuyPhapOut | null = null;
  if (input.thuyPhap && (input.thuyPhap.nuocDenDoSo != null || input.thuyPhap.nuocDiDoSo != null)) {
    thuyPhap = xetThuyPhap(input.thuyPhap, huong, van.so, nguong);
    dienGiai.push(...thuyPhap.dienGiai);
    thieuDuLieu.push({ buoc: 4, ly_do: "Thủy pháp mới xét hợp thập với Hướng + vùng Chính/Linh Thần; điều kiện Đồng Nguyên Long chưa xét được (thiếu dữ liệu nhóm nguyên long)." });
  }

  // Bước 5 — cửa (optional)
  let cua: CuaOut[] | null = null;
  if (input.cua && input.cua.length > 0) {
    cua = xetCua(input.cua, van.so, nguong);
    for (const c of cua) {
      dienGiai.push({ buoc: 5, noiDung: `Cửa "${c.ten}" ${c.doSo}° = ${c.que} (Khí ${c.quaiKhi})${c.chinhLinhThan ? ", " + c.chinhLinhThan : ""}, khí ${c.khiChat}${c.queLienQuan.length ? " (+" + c.queLienQuan.join("/") + ")" : ""}.` });
    }
  }

  // Bước 6 — nội cục (optional, chỉ khi có noiCuc VÀ mục đích cụ thể)
  let noiCuc: NoiCucOut[] | null = null;
  if (input.noiCuc && input.noiCuc.length > 0 && mucDich !== "tong_quat") {
    noiCuc = xetNoiCuc(input.noiCuc, van.so, nguong);
    for (const n of noiCuc) {
      dienGiai.push({ buoc: 6, noiDung: `Nội cục ${n.loai}${n.doSo != null ? " " + n.doSo + "° = " + n.que : " (thiếu độ số)"}${n.chinhLinhThan ? ", " + n.chinhLinhThan : ""}.` });
    }
    thieuDuLieu.push({ buoc: 6, ly_do: "Nội cục: 'phát cho ai' (gán nhân khẩu) chưa có bảng dữ liệu → để null." });
  }

  // Bước 7 — cách cục đặc biệt
  const { cachCuc, thieuDuLieu: thieu7, dienGiai: dienGiai7 } = kiemTraCachCucDacBiet(
    toa,
    huong,
    input.namSinhGiaChu ?? null,
    input.namNhapTrach ?? null,
    nguong,
  );
  dienGiai.push(...dienGiai7);
  thieuDuLieu.push(...thieu7);

  // Bước 8 — tổng hợp
  const tongHop = tongHopCatHung(van, toa, huong, cachCuc);

  return {
    input: {
      toaDo: chuanHoaDo(input.toaDo),
      huongDo: chuanHoaDo(input.huongDo),
      namNhapTrach: input.namNhapTrach ?? null,
      namLuanHienTai: namLuan,
      mucDichLuan: mucDich,
      namSinhGiaChu: input.namSinhGiaChu ?? null,
      nguongKhongVong: nguong,
    },
    van,
    toa,
    huong,
    thuyPhap,
    cua,
    noiCuc,
    cachCucDacBiet: cachCuc,
    tongHop,
    soanTaiQuanNiem: null,
    dienGiai,
    thieuDuLieu,
    ghiChuTinCay,
    nguon: "engine",
  };
}
