/**
 * Chọn Ngày Thúc Đinh · Tài · Quý (Nạp Giáp Tiên Thiên).
 *
 * Nguồn: "Chính Ngũ Hành Trạch Nhật Học" (Lại Cửu Đỉnh), Chương 10 — công thức đã kiểm chứng
 * 100% độc lập với phần OCR lỗi của sách (đối chiếu chuẩn nạp giáp Kinh Dịch, chính phối vợ
 * chồng bát quái, tiên-hậu thiên bát quái đồ). Xem `data/*.json` — dùng NGUYÊN dữ liệu chủ dự
 * án cung cấp, không hardcode lại trong code (yêu cầu SPEC.md mục "Việc cần làm" #2).
 *
 * Chỉ dùng làm lớp xếp hạng ưu tiên BỔ SUNG sau khi ngày đã qua các bước lọc hung sát nền của
 * trachnhat-engine — không thay thế các bước lọc đó (SPEC.md mục 1).
 */
import napGiapData from "./data/nap-giap-tien-thien.json" with { type: "json" };
import chinhPhoiData from "./data/chinh-phoi-vo-chong.json" with { type: "json" };
import tienHauThienData from "./data/tien-hau-thien-vi-tri.json" with { type: "json" };
import doSoData from "./data/24-son-do-so.json" with { type: "json" };

export type Quai = "Càn" | "Khảm" | "Cấn" | "Chấn" | "Tốn" | "Ly" | "Khôn" | "Đoài";
export type MucTieuThucDinhTaiQuy = "tai" | "dinh" | "quy" | "all";
export type PhanLoaiTai = "chanTai" | "giaTai" | "voTai";

export interface CanChiThucDinh {
  can: string;
  chi: string;
}

interface QuaiEntry {
  quai: Quai;
  sonList: string[];
  canNap: string[];
  boMaCanChi: CanChiThucDinh[];
}

const NAP_GIAP: readonly QuaiEntry[] = napGiapData.quaiList as QuaiEntry[];
const CHINH_PHOI: readonly { quai: Quai; doiUng: Quai }[] = chinhPhoiData.capChinhPhoi as { quai: Quai; doiUng: Quai }[];
const TIEN_HAU_THIEN: readonly { quaiHauThien: Quai; quaiTienThienCungViTri: Quai }[] =
  tienHauThienData.capViTri as { quaiHauThien: Quai; quaiTienThienCungViTri: Quai }[];
const DO_SO: readonly { quai: Quai; tuDo: number; denDo: number; quaBien360?: boolean; sonList: string[] }[] =
  doSoData.quaiTheoDoSo as { quai: Quai; tuDo: number; denDo: number; quaBien360?: boolean; sonList: string[] }[];

/** Biên giới giữa 2 quái — bội số 22.5° (0/22.5/45/.../337.5). Dùng cho cờ `canhBaoBienGioi`. */
const BIEN_GIOI_QUAI = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];

function chuanHoaDo(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function timQuaiEntry(quai: Quai): QuaiEntry {
  const e = NAP_GIAP.find((q) => q.quai === quai);
  if (!e) throw new Error(`Không tìm thấy quái: ${quai}`);
  return e;
}

/** Bước A — xác định quái từ TÊN SƠN (tra thẳng `sonList` trong nap-giap-tien-thien.json). */
export function quaiTuTenSon(sonName: string): Quai {
  const e = NAP_GIAP.find((q) => q.sonList.includes(sonName));
  if (!e) throw new Error(`Không nhận diện được sơn: ${sonName}`);
  return e.quai;
}

export interface KetQuaQuaiTuDoSo {
  quai: Quai;
  canhBaoBienGioi: boolean;
}

/** Bước A — xác định quái từ ĐỘ SỐ la kinh của tọa (dùng nguyên khoảng độ trong 24-son-do-so.json). */
export function quaiTuDoSo(doSoRaw: number): KetQuaQuaiTuDoSo {
  const d = chuanHoaDo(doSoRaw);
  const entry = DO_SO.find((q) => {
    if (q.quaBien360) return d >= q.tuDo || d < q.denDo;
    return d >= q.tuDo && d < q.denDo;
  });
  if (!entry) throw new Error(`Không xác định được quái cho độ số: ${doSoRaw}`);

  // Cờ cảnh báo: độ số cách 1 mốc biên giới (bội số 22.5°) trong phạm vi ±1°.
  const canhBaoBienGioi = BIEN_GIOI_QUAI.some((bien) => {
    const khoangCach = Math.min(Math.abs(d - bien), 360 - Math.abs(d - bien));
    return khoangCach <= 1;
  });

  return { quai: entry.quai, canhBaoBienGioi };
}

/** Bước B — quái THỰC SỰ dùng để tra bộ mã, theo từng nhánh mục tiêu (không phải luôn là quái sơn gốc). */
export function quaiDungDeTraBoMa(quaiSon: Quai, mucTieuNhanh: "tai" | "dinh" | "quy"): Quai {
  if (mucTieuNhanh === "tai") return quaiSon;
  if (mucTieuNhanh === "dinh") {
    const e = CHINH_PHOI.find((c) => c.quai === quaiSon);
    if (!e) throw new Error(`Không tìm thấy chính phối cho quái: ${quaiSon}`);
    return e.doiUng;
  }
  // quy
  const e = TIEN_HAU_THIEN.find((c) => c.quaiHauThien === quaiSon);
  if (!e) throw new Error(`Không tìm thấy vị trí tiên thiên trùng cho quái: ${quaiSon}`);
  return e.quaiTienThienCungViTri;
}

/** Bước B — bộ mã 6 tổ can-chi của quái (dùng để so ngày). */
export function boMaCuaQuai(quai: Quai): readonly CanChiThucDinh[] {
  return timQuaiEntry(quai).boMaCanChi;
}

function khopBoMa(can: string, chi: string, boMa: readonly CanChiThucDinh[]): boolean {
  return boMa.some((cc) => cc.can === can && cc.chi === chi);
}

/** Bước C — CHỈ áp dụng cho mục tiêu Tài: phân loại Chân/Giả/Vô Tài. */
export function phanLoaiTai(can: string, chi: string, quaiSon: Quai): PhanLoaiTai {
  const entry = timQuaiEntry(quaiSon);
  if (khopBoMa(can, chi, entry.boMaCanChi)) return "chanTai";
  if (entry.canNap.includes(can)) return "giaTai";
  return "voTai";
}

/** Đinh/Quý — khớp nhị phân với đúng 1 trong 6 tổ, KHÔNG có khái niệm Chân/Giả (SPEC mục 3 Bước C). */
export function khopDinhQuy(can: string, chi: string, boMa: readonly CanChiThucDinh[]): boolean {
  return khopBoMa(can, chi, boMa);
}
