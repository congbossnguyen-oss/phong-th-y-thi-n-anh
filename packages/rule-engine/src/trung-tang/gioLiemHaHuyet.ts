/**
 * TRÙNG TANG — Module thu phí "Chọn giờ liệm / giờ đóng quan / ngày giờ hạ huyệt" (đặc tả chủ
 * dự án cung cấp 2026-08-14). Đây là các hàm THUẦN (pure) — mọi thứ liên quan tới lịch thật
 * (JDN, Can Chi ngày/giờ thực tế, Trực theo tiết khí) được tính ở tầng `trachnhat-engine` rồi
 * truyền vào đây dưới dạng Can/Chi/chỉ số, đúng kiến trúc đã dùng cho `chuongPhap.ts`.
 *
 * KHÔNG chẩn đoán lại Trùng Tang — module `tinhBonCungTrungTang` (miễn phí, `chuongPhap.ts`)
 * đã làm việc đó. Module này CHỈ dùng lại 4 cung để xếp hạng giờ liệm/đóng quan/hạ huyệt.
 *
 * ⚠️ PHẠM VI ÁP DỤNG — CHỈ DÙNG CHO TRƯỜNG HỢP **KHÔNG TRÙNG TANG**.
 * Sách "Sổ Tay Tang Sự" ghi thẳng ở tiêu đề mục: "Tính giờ nhập liệm, hạ huyệt (Dùng cho trường
 * hợp không trùng tang)". Vong ĐANG phạm Trùng Tang thì phải xử lý theo hướng khác (trấn/hoá giải
 * trước), không dùng kết quả xếp hạng ở đây. Chủ dự án yêu cầu 2026-08-16 ghi rõ điều này ngay từ
 * phần giới thiệu module — đã bổ sung một khối cảnh báo đỏ ở đầu trang, sửa cả mô tả SEO, mô tả
 * PageHero và mô tả thẻ công cụ ở trang Dịch vụ thu phí.
 *
 * Engine CỐ Ý không tự chặn: nó không biết vong có phạm hay không (không nhận đủ input để chẩn
 * đoán), nên việc chặn nằm ở tầng con người — cảnh báo + dẫn sang công cụ Tính Trùng Tang miễn phí.
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
 *   `LONG_HO_KE_XA` ở `tuoiCanTranh.ts`).
 * - Thiên Di: loại **Dậu** (tứ ngoại nhân, cũng thuộc Long Hổ Kê Xà).
 *
 * Cung bị loại vẫn GIỮ nguyên `phanLoaiCung` (Thìn vẫn là "nhap-mo") để phần diễn giải nói đúng
 * bản chất chưởng pháp.
 */
export const NHAP_MO_DUNG_DUOC: readonly Chi[] = ["Tuất", "Sửu", "Mùi"];
export const THIEN_DI_DUNG_DUOC: readonly Chi[] = ["Tý", "Mão", "Ngọ"];

/**
 * Cung Nhập Mộ nhưng thuộc Tứ Kỵ — chủ dự án chốt 2026-08-15:
 *
 *   "Thìn vẫn là Nhập Mộ về mặt phân loại, nhưng khi module tự động chọn giờ/ngày liệm hoặc hạ
 *    huyệt thì loại Thìn, ưu tiên Tuất–Sửu–Mùi. Ngày Nhập Mộ vẫn chọn trong 4 cung Thìn–Tuất–
 *    Sửu–Mùi, nhưng Thìn bị xem là Tứ Kỵ nên BẤT ĐẮC DĨ MỚI DÙNG."
 *
 * Nên Thìn KHÔNG bị về 0 (0 = ngang hàng cung Trùng Tang, nặng hơn ý chủ dự án) mà nhận một bậc
 * điểm thấp: đứng trên cung Trùng Tang, nhưng đứng dưới cả Nhập Mộ dùng được (100) lẫn tầng Thiên
 * Di dự phòng (40) — đúng nghĩa chỉ nổi lên khi không còn lựa chọn nào khác.
 *
 * ⚠️ Lưu ý bộ Long Hổ Kê Xà còn một nghĩa KHÁC và quan trọng hơn: đó là nhóm TUỔI NGƯỜI không
 * được có mặt lúc nhập liệm (xem `LONG_HO_KE_XA` / `tinhTuoiCanTranh`). Hai việc này độc lập —
 * điểm cung ở đây không thay thế được việc phải báo danh sách tuổi cần tránh mặt cho gia chủ.
 */
export const NHAP_MO_TU_KY: readonly Chi[] = ["Thìn"];
export const DIEM_NHAP_MO_TU_KY = 20;

/** Cung có được hưởng trọn điểm ưu tiên của nhóm nó hay không (Thìn/Dậu → false). */
export function laCungDungDuoc(cung: Chi): boolean {
  const loai = phanLoaiCung(cung);
  if (loai === "nhap-mo") return (NHAP_MO_DUNG_DUOC as readonly Chi[]).includes(cung);
  if (loai === "thien-di") return (THIEN_DI_DUNG_DUOC as readonly Chi[]).includes(cung);
  return false;
}

/** Cung Nhập Mộ thuộc Tứ Kỵ (Thìn) — vẫn dùng được nhưng chỉ khi bất đắc dĩ. */
export function laNhapMoTuKy(cung: Chi): boolean {
  return (NHAP_MO_TU_KY as readonly Chi[]).includes(cung);
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

/**
 * Bảng của phép TRẦN TỬ TÁNH trong "Sổ Tay Tang Sự" (mục "Chọn ngày giờ theo Trần Tử Tánh": từ
 * địa chi của NGÀY lấy thiên can của GIỜ, kết hợp giờ hoàng đạo để chọn giờ nhập quan). Đặc tả
 * mục 10.2 từng ghi bảng này là "nguồn ngoài sách, chưa rõ nguyên lý sinh" — nay đã truy được
 * nguồn, đối chiếu KHỚP 12/12 chi với bảng in trong sách.
 *
 * VAI TRÒ ĐÃ ĐƯỢC CHỦ DỰ ÁN CHỐT LẠI 2026-08-16, qua hai câu bổ sung cho nhau:
 *   - "chọn ngày liệm theo Trần Tử Tánh KHÔNG DÙNG nhé"  → không dùng nó làm PHÉP CHỌN
 *   - "nếu chọn được ngày giờ liệm như bảng đính kèm thì QUÁ ĐẸP" / "cứ bổ sung theo Trần Tử
 *     Tánh, nếu có càng tốt"                              → trúng bảng thì là ĐIỂM CỘNG
 *
 * Nên đây là điểm thưởng (+15), cố ý giữ nhỏ hơn hẳn tầng cung (100/40/20) và hoàng đạo (50): nó
 * chỉ phân định giữa các ứng viên đã ngang nhau, KHÔNG được phép lật thứ hạng do cung quyết định.
 */
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

/** Điểm thưởng khi Can giờ trúng bảng Trần Tử Tánh — xem ghi chú vai trò ở bảng phía trên. */
export const DIEM_TRAN_TU_TANH = 15;

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

/**
 * Bước 6 — Cung_Giờ hạ huyệt = Cung_Ngày + s*k (k: Tý=1 ... Hợi=12; s = nam +1 / nữ -1).
 *
 * ⚠️ TỪNG LÀ LỖI: hàm này trước đây KHÔNG nhận giới tính nên luôn đếm THUẬN, kể cả với người mất
 * là nữ — trong khi `tinhBonCungTrungTang` và `tinhCungTheoChiGio` (giờ liệm) đều đã đếm nghịch
 * cho nữ. Hậu quả với nữ là lệch hẳn nhóm cung: Cung_Ngày Dậu, giờ Mão ra Sửu (Nhập Mộ) trong khi
 * đếm đúng phải ra Tỵ (Trùng Tang).
 *
 * Chủ dự án chốt 2026-08-16: "Nữ phải đếm nghịch XUYÊN SUỐT toàn bộ phép Trùng Tang/hạ huyệt.
 * Không được tính tháng/ngày nghịch nhưng đến Cung Giờ lại chuyển sang thuận. Nam thuận, nữ nghịch
 * từ đầu đến cuối. Giữ nguyên quy tắc cung khởi và offset giờ Tý hiện có, chỉ sửa chiều tính theo
 * giới tính."
 *
 * Lưu ý đặc tả gốc mục 9 viết `Cung_Gio = (Cung_Ngay + k) mod 12` không có dấu giới tính — nhưng
 * ngay mục 8 nó cũng viết `Cung_Ngay = (Cung_Thang + N)` không dấu, mà chỗ đó thì buộc phải có
 * dấu mới đúng. Tức bản thân đặc tả viết tắt, không phải quy định đếm thuận cho nữ.
 */
export function tinhCungGioHaHuyet(gioiTinh: GioiTinh, cungNgay: Chi, k: number): Chi {
  const s = gioiTinh === "nam" ? 1 : -1;
  return Data.CHI[mod12(CHI_INDEX.get(cungNgay)! + s * k)]!;
}

export type BoiCanhChonGio = "liem" | "ha-huyet";

export interface YeuToDiemUngVien {
  phanLoaiCung: PhanLoaiCung;
  /**
   * Cung trên bàn tay chưởng pháp của ứng viên. Cần truyền cả Chi (không chỉ `phanLoaiCung`) để
   * loại được Thìn/Dậu khỏi điểm ưu tiên theo `NHAP_MO_DUNG_DUOC` / `THIEN_DI_DUNG_DUOC`.
   */
  cungGio: Chi;
  /** Can giờ trúng bảng Trần Tử Tánh — điểm cộng "nếu có càng tốt", không phải điều kiện chọn. */
  canGioDatBangDep: boolean;
  /** Chỉ cộng điểm Thiên Di khi KHÔNG có ứng viên Nhập Mộ nào khả dụng trong cùng ngày đó. */
  apDungThienDi: boolean;
  hoangDaoTen: string;
  hoangDaoLaCat: boolean;
  boiCanh: BoiCanhChonGio;
  /**
   * Chi giờ thuộc nhóm Dần/Thân/Tỵ/Hợi. Trừ điểm ở CẢ giờ liệm lẫn giờ hạ huyệt — đây là kiêng
   * MỀM ("nếu được thì tránh"), khác hẳn với việc CUNG rơi vào nhóm Trùng Tang (loại tuyệt đối).
   */
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
  else if (y.phanLoaiCung === "nhap-mo" && laNhapMoTuKy(y.cungGio)) diem += DIEM_NHAP_MO_TU_KY;
  else if (y.phanLoaiCung === "thien-di" && cungDungDuoc && y.apDungThienDi) diem += 40;
  if (y.hoangDaoLaCat) diem += 50;
  if (TEN_HOANG_DAO_UU_TIEN.has(y.hoangDaoTen)) diem += 20;
  if (y.canGioDatBangDep) diem += DIEM_TRAN_TU_TANH;
  // Chi giờ Dần/Thân/Tỵ/Hợi — trừ điểm ở CẢ HAI bối cảnh (liệm lẫn hạ huyệt). Chủ dự án chốt
  // 2026-08-16: "Dần Thân Tị Hợi thực chất là KIÊNG giờ liệm, hạ huyệt — nếu được thì tránh".
  // Tức là kiêng MỀM, không phải loại tuyệt đối: giờ như vậy vẫn dùng được khi không còn lựa chọn
  // nào khá hơn, chỉ luôn bị xếp sau một giờ tương đương mà không phạm.
  if (y.chiGioThuocTuSinh) diem -= 60;
  if (y.boiCanh === "ha-huyet") {
    if (y.ngayHopVoiVong) diem += 25;
    if (y.trucTot) diem += 5;
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
