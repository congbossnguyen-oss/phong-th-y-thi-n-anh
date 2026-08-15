/**
 * TRÙNG TANG — Module thu phí "Chọn giờ liệm / giờ đóng quan / ngày giờ hạ huyệt" (đặc tả chủ
 * dự án cung cấp 2026-08-14). Đây là các hàm THUẦN (pure) — mọi thứ liên quan tới lịch thật
 * (JDN, Can Chi ngày/giờ thực tế, Trực theo tiết khí) được tính ở tầng `trachnhat-engine` rồi
 * truyền vào đây dưới dạng Can/Chi/chỉ số, đúng kiến trúc đã dùng cho `chuongPhap.ts`.
 *
 * KHÔNG chẩn đoán lại Trùng Tang — module `tinhBonCungTrungTang` (miễn phí, `chuongPhap.ts`)
 * đã làm việc đó. Module này CHỈ dùng lại 4 cung để xếp hạng giờ liệm/đóng quan/hạ huyệt.
 */
import { Data } from "@thien-anh/calendar-core";
import { CUNG_TRUNG_TANG, phanLoaiCung, type GioiTinh, type PhanLoaiCung } from "./chuongPhap.js";

type Can = Data.Can;
type Chi = Data.Chi;

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

const CHI_INDEX = new Map<Chi, number>(Data.CHI.map((c, i) => [c, i]));

/** Tuyệt đối kỵ cho LIỆM và ĐÓNG QUAN (= nhóm cung Trùng Tang trong chưởng pháp). */
export const LUON_TRANH_LIEM: readonly Chi[] = CUNG_TRUNG_TANG;
/** Chỉ khuyến nghị tránh (trừ điểm, không loại) cho CHÔN/hạ huyệt. */
export const KHUYEN_TRANH_CHON: readonly Chi[] = CUNG_TRUNG_TANG;

/**
 * Mục 3 đặc tả — trong mỗi nhóm cung còn phải loại tiếp cung xấu trước khi coi là "dùng được":
 *
 * - Nhập Mộ: loại **Thìn** vì Thìn nằm trong bộ Long Hổ Kê Xà (Thìn/Dần/Dậu/Tỵ — xem
 *   `LONG_HO_KE_XA` ở `tuoiCanTranh.ts`), bộ này kỵ có mặt ở nhập quan/khâm liệm/đóng cá/hạ huyệt.
 * - Thiên Di: loại **Dậu** (tứ ngoại nhân, cũng thuộc Long Hổ Kê Xà).
 *
 * Cung bị loại vẫn GIỮ nguyên `phanLoaiCung` (Thìn vẫn là "nhap-mo") để phần diễn giải nói đúng
 * bản chất chưởng pháp, nhưng KHÔNG được cộng điểm ưu tiên của nhóm — nếu cộng, một cung kỵ sẽ
 * leo lên đầu bảng xếp hạng.
 */
export const NHAP_MO_DUNG_DUOC: readonly Chi[] = ["Tuất", "Sửu", "Mùi"];
export const THIEN_DI_DUNG_DUOC: readonly Chi[] = ["Tý", "Mão", "Ngọ"];

/** Cung có được hưởng điểm ưu tiên của nhóm nó hay không (Thìn/Dậu → false). */
export function laCungDungDuoc(cung: Chi): boolean {
  const loai = phanLoaiCung(cung);
  if (loai === "nhap-mo") return (NHAP_MO_DUNG_DUOC as readonly Chi[]).includes(cung);
  if (loai === "thien-di") return (THIEN_DI_DUNG_DUOC as readonly Chi[]).includes(cung);
  return false;
}

/**
 * Quy luật bất biến (dữ liệu gốc `chuong_phap.quy_luat_bat_bien`): vì Cung_Giờ = (Cung_Ngày + k)
 * mod 12, khi Cung_Ngày thuộc nhóm Nhập Mộ thì CHỈ k = 3/6/9/12 (tức 4 giờ Dần/Tỵ/Thân/Hợi) mới
 * ra Nhập Mộ; 8 giờ còn lại không bao giờ đạt. Hệ quả thực tế: hôm đó mọi giờ Nhập Mộ đều đồng
 * thời là giờ tứ sinh (bị trừ điểm ở bối cảnh hạ huyệt) — tầng hiển thị cần nói rõ để gia chủ
 * hiểu vì sao không có giờ nào "sạch" cả hai tiêu chí.
 */
export function nhapMoChiRoiVaoTuSinh(cungNgay: Chi): boolean {
  return phanLoaiCung(cungNgay) === "nhap-mo";
}

/** Bước 7 mục 10.2 — Can giờ đẹp theo Chi ngày (nguồn ngoài sách, bảng tra cố định). */
export const CAN_GIO_DEP_THEO_CHI_NGAY: Readonly<Record<Chi, readonly [Can, Can]>> = {
  Tý: ["Giáp", "Canh"],
  Sửu: ["Ất", "Tân"],
  Dần: ["Bính", "Quý"],
  Mão: ["Bính", "Nhâm"],
  Thìn: ["Đinh", "Giáp"],
  Tỵ: ["Ất", "Canh"],
  Ngọ: ["Đinh", "Quý"],
  Mùi: ["Ất", "Tân"],
  Thân: ["Giáp", "Quý"],
  Dậu: ["Đinh", "Nhâm"],
  Tuất: ["Canh", "Nhâm"],
  Hợi: ["Ất", "Tân"],
};

export function isCanGioDep(canGio: Can, chiNgay: Chi): boolean {
  return (CAN_GIO_DEP_THEO_CHI_NGAY[chiNgay] as readonly Can[]).includes(canGio);
}

/**
 * Tên sao Hoàng Đạo được thưởng điểm riêng (mục 10.1: "Tư Mệnh hoặc Phúc Đức"). Bộ 12 sao dùng
 * chung site (`trach-nhat/hoangDaoHacDaoGio.ts`) đặt tên biến thể "Kim Đường" thay vì "Thiên
 * Đức"/"Phúc Đức" (đã ghi chú tương đương ngay trong file đó) — dùng "Kim Đường" ở đây để khớp
 * đúng bộ tên đang hiển thị trên site, không tạo thêm 1 tên sao mới.
 */
export const TEN_HOANG_DAO_UU_TIEN = new Set(["Tư Mệnh", "Kim Đường"]);

/**
 * Bước 3 — cung trên bàn tay chưởng pháp ứng với MỘT Chi giờ ứng viên bất kỳ (không chỉ giờ mất
 * thật). Đây chính là công thức "Ngày hạ sinh Thời" của `tinhBonCungTrungTang`
 * (`idxGio = mod12(idxNgay + s*k)`, k = Tý=1...Hợi=12) áp dụng cho MỌI Chi giờ trong ngày mất,
 * không riêng Chi giờ mất thật — vì bản chất chặng "Giờ" trên bàn tay là một ánh xạ cố định
 * cung=f(Chi) một khi đã biết Cung_Ngày, không phụ thuộc việc mất vào giờ nào.
 *
 * ⚠️ Đặc tả gốc (mục 6) viết công thức dạng "base=(Cung_Gio_mat+1) mod12, cung=CUNG[(base+step)
 * mod12]" đếm lệch theo `step` kể từ giờ mất — đã đối chiếu cả 2 ví dụ kiểm chứng mục 14: công
 * thức step-đếm đó khớp ví dụ B nhưng KHÔNG khớp ví dụ A, trong khi công thức trực tiếp dưới đây
 * (áp lại đúng định nghĩa `tinhBonCungTrungTang` cho từng Chi) khớp CHÍNH XÁC ví dụ A (giờ Mão →
 * cung Sửu) và tự hợp lý (step=0 tại chính giờ mất luôn trả đúng `Cung_Gio_mat` đã biết). Dùng
 * công thức này, không dùng công thức step-đếm của đặc tả gốc.
 */
export function tinhCungTheoChiGio(gioiTinh: GioiTinh, cungNgayMat: Chi, chiGio: Chi): Chi {
  const s = gioiTinh === "nam" ? 1 : -1;
  const k = CHI_INDEX.get(chiGio)! + 1; // Tý=1 ... Hợi=12
  return Data.CHI[mod12(CHI_INDEX.get(cungNgayMat)! + s * k)]!;
}

/** Bước 5 — Cung_Ngày(N), ĐỘC LẬP với chuỗi liệm, chỉ phụ thuộc Cung_Tháng cố định + N (ngày-của-tháng âm lịch). */
export function tinhCungNgayUngVien(gioiTinh: GioiTinh, cungThang: Chi, ngayAmLichN: number): Chi {
  const s = gioiTinh === "nam" ? 1 : -1;
  const idx = mod12(CHI_INDEX.get(cungThang)! + s * ngayAmLichN);
  return Data.CHI[idx]!;
}

/** Bước 6 — Cung_Giờ hạ huyệt = Cung_Ngày + k (k: Tý=1 ... Hợi=12). */
export function tinhCungGioHaHuyet(cungNgay: Chi, k: number): Chi {
  return Data.CHI[mod12(CHI_INDEX.get(cungNgay)! + k)]!;
}

export type BoiCanhChonGio = "liem" | "ha-huyet";

export interface YeuToDiemUngVien {
  phanLoaiCung: PhanLoaiCung;
  /**
   * Cung trên bàn tay chưởng pháp của ứng viên. Cần truyền cả Chi (không chỉ `phanLoaiCung`) để
   * loại được Thìn/Dậu khỏi điểm ưu tiên theo `NHAP_MO_DUNG_DUOC` / `THIEN_DI_DUNG_DUOC`.
   */
  cungGio: Chi;
  /** Chỉ cộng điểm Thiên Di khi KHÔNG có ứng viên Nhập Mộ nào khả dụng trong cùng ngày đó. */
  apDungThienDi: boolean;
  hoangDaoTen: string;
  hoangDaoLaCat: boolean;
  canGioDatBangDep: boolean;
  boiCanh: BoiCanhChonGio;
  /** Chi giờ thuộc nhóm Dần/Thân/Tỵ/Hợi — chỉ có ý nghĩa trừ điểm khi boiCanh = "ha-huyet"
   * (ở "liem" nhóm này đã bị loại tuyệt đối trước khi tới bước chấm điểm). */
  chiGioThuocTuSinh: boolean;
  /** Chỉ dùng cho ngày hạ huyệt: ngày tam hợp/lục hợp với Chi tuổi vong. */
  ngayHopVoiVong?: boolean;
  /** Chỉ dùng cho ngày hạ huyệt: Trực không phải Kiến/Phá/Thu. */
  trucTot?: boolean;
}

/**
 * Bước 7 mục 10.3 — công thức chấm điểm tổng.
 *
 * Điểm ưu tiên nhóm cung CHỈ cộng khi cung thuộc tập "dùng được" (`laCungDungDuoc`) — cung Thìn
 * (Nhập Mộ) và Dậu (Thiên Di) bị loại theo mục 3 đặc tả nên không được cộng, tránh việc một cung
 * kỵ Long Hổ Kê Xà lại đứng đầu bảng chỉ nhờ nhãn "Nhập Mộ".
 */
export function tinhDiemUngVien(y: YeuToDiemUngVien): number {
  let diem = 0;
  const cungDungDuoc = laCungDungDuoc(y.cungGio);
  if (y.phanLoaiCung === "nhap-mo" && cungDungDuoc) diem += 100;
  else if (y.phanLoaiCung === "thien-di" && cungDungDuoc && y.apDungThienDi) diem += 40;
  if (y.hoangDaoLaCat) diem += 50;
  if (TEN_HOANG_DAO_UU_TIEN.has(y.hoangDaoTen)) diem += 20;
  if (y.canGioDatBangDep) diem += 15;
  if (y.boiCanh === "ha-huyet") {
    if (y.ngayHopVoiVong) diem += 25;
    if (y.trucTot) diem += 5;
    if (y.chiGioThuocTuSinh) diem -= 60;
  }
  return diem;
}

export interface ThanQuyenGioLiem {
  chiTruongNam?: Chi;
  chiConDauLon?: Chi;
  chiChauDichTon?: Chi;
  chiAnhTraiLon?: Chi;
  chiChaMe?: readonly Chi[];
}

/**
 * Bước 8 — lọc cuối theo tuổi thân quyến (chỉ áp dụng cho giờ liệm/đóng quan). Lọc trên TOÀN BỘ
 * danh sách ứng viên đã chấm điểm (chưa cắt top 3) để tối đa cơ hội còn ứng viên hợp lệ; nếu lọc
 * hết sạch (rất hiếm — nguồn cũng ghi là hiếm) thì trả về `{ ketQua: [], daNoiLong: true }` để
 * tầng gọi tự quyết định nới lỏng (bỏ ràng buộc thân quyến) thay vì cố nới lỏng mù trong hàm này.
 */
export function locTheoTuoiThanQuyen<T extends { chiGio: Chi }>(
  ungVienDaXepHang: readonly T[],
  thanQuyen: ThanQuyenGioLiem,
): { ketQua: T[]; daNoiLong: boolean } {
  const chiCanTranh = new Set<Chi>(
    [thanQuyen.chiTruongNam, thanQuyen.chiConDauLon, thanQuyen.chiChauDichTon, thanQuyen.chiAnhTraiLon, ...(thanQuyen.chiChaMe ?? [])].filter(
      (c): c is Chi => !!c,
    ),
  );
  if (chiCanTranh.size === 0) return { ketQua: [...ungVienDaXepHang], daNoiLong: false };

  const loc = ungVienDaXepHang.filter((u) => !chiCanTranh.has(u.chiGio));
  if (loc.length > 0) return { ketQua: loc, daNoiLong: false };
  return { ketQua: [...ungVienDaXepHang], daNoiLong: true };
}
