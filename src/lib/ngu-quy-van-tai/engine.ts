/**
 * Engine "Ngũ Quỷ Vận Tài" — xem `data.ts` cho bản chất công thức + bảng tra gốc.
 *
 * BẮT BUỘC đối chiếu Huyền Không Phi Tinh: tái dùng NGUYÊN VẸN engine đã có trên site
 * (`src/lib/huyen-khong-phi-tinh/engine.ts`) — KHÔNG viết lại logic lập tinh bàn/Thu Sơn Xuất Sát.
 * Đối chiếu theo TINH BÀN THẬT của chính căn nhà/phòng (không phải quy tắc Chính-Linh Thần chung
 * theo Vận) — anh Công chốt 4/9/2026: "kết hợp huyền không phi tinh... để kích nước kích đá" và
 * yêu cầu xét "VỚI cách cục (tinh bàn) của CHÍNH căn nhà/phòng đó". Dùng `thuSonXuatSat()`: sơn
 * Giáng Long (đá, cần TĨNH/CAO) đối chiếu trạng thái SAO SƠN BÀN tại đúng cung chứa sơn đó — Vượng/
 * Sinh thì hợp lý (thu sơn); sơn Giáng Thủy (nước, cần ĐỘNG/THẤP) đối chiếu trạng thái SAO HƯỚNG
 * BÀN — Vượng/Sinh thì hợp lý (xuất sát bằng nước cũng theo đúng nguyên lý này).
 *
 * NGUYÊN TẮC ƯU TIÊN: khi bảng Ngũ Quỷ Vận Tài (công thức tĩnh theo 24 sơn, không đổi theo thời
 * gian) và Huyền Không Phi Tinh (chạy theo Vận) mâu thuẫn nhau, LUÔN ưu tiên kết luận theo Phi
 * Tinh — bảng gốc chỉ là danh sách ỨNG VIÊN, Phi Tinh mới quyết định ứng viên nào dùng được TRONG
 * VẬN HIỆN TẠI, VỚI CHÍNH căn nhà/phòng đó.
 *
 * Đây KHÔNG phải kết luận cuối cùng tuyệt đối — chỉ là 1 lớp kiểm chứng bằng Huyền Không Phi Tinh.
 * Ghi chú disclaimer cố định luôn nhắc khách nên đối chiếu thêm Huyền Không Đại Quái/Liên Thành
 * Phái (nếu có luận riêng) trước khi bố trí thực tế — KHÔNG tự ý coi "kích được" là chắc chắn tốt.
 */
import {
  SON_24,
  CUNG_INFO,
  timSon,
  lapTinhBan,
  thuSonXuatSat,
  type TrangThaiKhi,
} from "../huyen-khong-phi-tinh/engine";
import { BANG_TRA_HUONG_CUA, VAT_PHAM_GIANG_LONG, VAT_PHAM_GIANG_THUY } from "./data";

export type CapDoNguQuyVanTai = "nha" | "phong";
export type ChieuTraNguQuyVanTai = "thuan" | "nghich";
export type LoaiDiemNghich = "long" | "thuy";
export type TrangThaiPhiTinh = "kich_duoc" | "khong_nen_kich" | "trung_tinh" | "chua_doi_chieu";

const KHI_TOT: TrangThaiKhi[] = ["VƯỢNG", "SINH"];
const KHI_XAU: TrangThaiKhi[] = ["SUY", "TỬ", "TỬ/XA"];

export interface NguQuyVanTaiInput {
  capDo: CapDoNguQuyVanTai;
  chieuTra: ChieuTraNguQuyVanTai;
  /** Chiều thuận: độ số Hướng Cửa (cấp nhà) hoặc độ số hướng nằm ngủ (cấp phòng, thay vai Hướng Cửa). */
  doHuongCua?: number;
  /** Chiều nghịch: độ số Long/Thủy đã có sẵn ngoài thực địa. */
  doDiemNghich?: number;
  loaiDiemNghich?: LoaiDiemNghich;
  /** Đối chiếu Phi Tinh (tùy chọn — thiếu thì chỉ trả theo bảng gốc + cảnh báo chưa đối chiếu). */
  doHuongNha?: number;
  vanNha?: number;
  vanHienTai?: number;
}

export interface PhuongAnViTri {
  son: string;
  doTamSon: number;
  khoangDoSo: { tu: number; den: number };
  vatPhamGoiY: readonly string[];
  trangThaiPhiTinh: TrangThaiPhiTinh;
  giaiThichPhiTinh?: string;
}

export interface PhuongAnHuongCua {
  son: string;
  doTamSon: number;
  khoangDoSo: { tu: number; den: number };
}

export interface NguQuyVanTaiResult {
  capDo: CapDoNguQuyVanTai;
  chieuTra: ChieuTraNguQuyVanTai;

  doHuongCuaDauVao?: number;
  sonHuongCuaXacDinh?: string;
  phuongAnGiangLong?: PhuongAnViTri[];
  phuongAnGiangThuy?: PhuongAnViTri[];

  doDiemNghichDauVao?: number;
  sonDiemNghichXacDinh?: string;
  loaiDiemNghich?: LoaiDiemNghich;
  phuongAnHuongCua?: PhuongAnHuongCua[];

  daDoiChieuPhiTinh: boolean;
  vanNhaDaDung?: number;
  vanHienTaiDaDung?: number;
  canhBao: string[];
  ghiChuBatBuocDuCaHaiBen: string;
  ghiChuKetHopTruongPhaiKhac: string;
}

function khoangDoSonTu(son: string): { tu: number; den: number; tam: number } {
  const tam = SON_24[son][0];
  return { tu: (tam - 7.5 + 360) % 360, den: (tam + 7.5) % 360, tam };
}

function trangThaiChoSon(
  son: string,
  vaiTro: "long" | "thuy",
  entries: ReturnType<typeof thuSonXuatSat> | null,
): { trangThai: TrangThaiPhiTinh; giaiThich?: string } {
  if (!entries) return { trangThai: "chua_doi_chieu" };
  const cungLacThu = SON_24[son][1];
  const tenCung = CUNG_INFO[cungLacThu].ten;
  const entry = entries.find((e) => e.cung === tenCung);
  if (!entry) return { trangThai: "chua_doi_chieu" };

  const tt = vaiTro === "long" ? entry.tt_son : entry.tt_huong;
  const saoSo = vaiTro === "long" ? entry.son_tinh : entry.huong_tinh;
  const nhanVaiTro = vaiTro === "long" ? "Sơn Bàn (ứng đá/vật cao — cần Vượng/Sinh mới nên đặt cao)" : "Hướng Bàn (ứng nước — cần Vượng/Sinh mới nên đặt động)";

  if (KHI_TOT.includes(tt)) {
    return {
      trangThai: "kich_duoc",
      giaiThich: `${nhanVaiTro}: sao ${saoSo} tại cung ${tenCung} đang ${tt} — kích đúng nguyên lý.`,
    };
  }
  if (KHI_XAU.includes(tt)) {
    return {
      trangThai: "khong_nen_kich",
      giaiThich: `${nhanVaiTro}: sao ${saoSo} tại cung ${tenCung} đang ${tt} — dù bảng Ngũ Quỷ Vận Tài chỉ ra vị trí này, Huyền Không Phi Tinh cho thấy KHÔNG nên kích ở đây trong Vận hiện tại.`,
    };
  }
  return { trangThai: "trung_tinh", giaiThich: `Sao ${saoSo} tại cung ${tenCung}: trạng thái ${tt}, không rõ rệt tốt/xấu.` };
}

const GHI_CHU_KET_HOP =
  "Kết quả trên là công thức Ngũ Quỷ Vận Tài (bảng tĩnh 24 sơn) đối chiếu thêm 1 lớp Huyền Không " +
  "Phi Tinh — đây KHÔNG phải kết luận cuối cùng chắc chắn tốt. Nên kết hợp thêm các yếu tố của " +
  "Huyền Không Đại Quái hoặc Liên Thành Phái (nếu đã luận nhà theo các trường phái này) trước khi " +
  "thực sự bố trí đá/nước ngoài thực địa, đặc biệt với công trình lớn hoặc quan trọng.";

const GHI_CHU_DU_CA_HAI =
  "Phải bố trí ĐỦ CẢ Giáng Long (đá/vật tĩnh, cao) LẪN Giáng Thủy (nước, động) đúng vị trí CÙNG " +
  "LÚC thì mới trọn vẹn cách cục Ngũ Quỷ Vận Tài (chuỗi tương sinh Hỏa→Thổ→Kim khép kín) — chỉ bố " +
  "trí 1 bên thì công thức CHƯA ĐỦ, không được coi là đã kích thành công.";

function layTinhSonXuatSat(input: NguQuyVanTaiInput, canhBao: string[]) {
  const doHuongNha = input.doHuongNha ?? input.doHuongCua;
  if (doHuongNha === undefined) {
    canhBao.push("Chưa nhập độ Hướng Nhà — chỉ trả kết quả theo bảng gốc, chưa đối chiếu được Huyền Không Phi Tinh.");
    return null;
  }
  const vanNha = input.vanNha;
  if (vanNha === undefined) {
    canhBao.push("Chưa xác định Vận Nhà (nhập số Vận hoặc năm nhập trạch) — chỉ trả kết quả theo bảng gốc, chưa đối chiếu được Huyền Không Phi Tinh.");
    return null;
  }
  const vanHienTai = input.vanHienTai ?? vanNha;
  const tb = lapTinhBan(doHuongNha, vanNha);
  return { entries: thuSonXuatSat(tb, vanHienTai), vanNha, vanHienTai };
}

export function tinhNguQuyVanTai(input: NguQuyVanTaiInput): NguQuyVanTaiResult {
  const canhBao: string[] = [];
  const phiTinh = layTinhSonXuatSat(input, canhBao);

  const result: NguQuyVanTaiResult = {
    capDo: input.capDo,
    chieuTra: input.chieuTra,
    daDoiChieuPhiTinh: phiTinh !== null,
    vanNhaDaDung: phiTinh?.vanNha,
    vanHienTaiDaDung: phiTinh?.vanHienTai,
    canhBao,
    ghiChuBatBuocDuCaHaiBen: GHI_CHU_DU_CA_HAI,
    ghiChuKetHopTruongPhaiKhac: GHI_CHU_KET_HOP,
  };

  if (input.chieuTra === "thuan") {
    if (input.doHuongCua === undefined) {
      throw new Error("Thiếu độ số Hướng Cửa (hoặc hướng nằm ngủ nếu luận cấp phòng).");
    }
    const { son: sonHuongCua } = timSon(input.doHuongCua);
    const tra = BANG_TRA_HUONG_CUA[sonHuongCua];
    if (!tra) throw new Error(`Không tra được sơn "${sonHuongCua}" trong bảng Ngũ Quỷ Vận Tài.`);

    result.doHuongCuaDauVao = input.doHuongCua;
    result.sonHuongCuaXacDinh = sonHuongCua;
    result.phuongAnGiangLong = tra.giangLong.map((son) => {
      const { tu, den, tam } = khoangDoSonTu(son);
      const { trangThai, giaiThich } = trangThaiChoSon(son, "long", phiTinh?.entries ?? null);
      return { son, doTamSon: tam, khoangDoSo: { tu, den }, vatPhamGoiY: VAT_PHAM_GIANG_LONG, trangThaiPhiTinh: trangThai, giaiThichPhiTinh: giaiThich };
    });
    result.phuongAnGiangThuy = tra.giangThuy.map((son) => {
      const { tu, den, tam } = khoangDoSonTu(son);
      const { trangThai, giaiThich } = trangThaiChoSon(son, "thuy", phiTinh?.entries ?? null);
      return { son, doTamSon: tam, khoangDoSo: { tu, den }, vatPhamGoiY: VAT_PHAM_GIANG_THUY, trangThaiPhiTinh: trangThai, giaiThichPhiTinh: giaiThich };
    });
    return result;
  }

  // Chiều nghịch: nhập độ Long/Thủy có sẵn thực địa -> suy ngược Hướng Cửa phù hợp.
  if (input.doDiemNghich === undefined || !input.loaiDiemNghich) {
    throw new Error("Thiếu độ số điểm Long/Thủy có sẵn hoặc chưa chọn đó là Long hay Thủy.");
  }
  const { son: sonDiem } = timSon(input.doDiemNghich);
  const key: "giangLong" | "giangThuy" = input.loaiDiemNghich === "long" ? "giangLong" : "giangThuy";
  const huongCuaKhaDung = Object.entries(BANG_TRA_HUONG_CUA)
    .filter(([, tra]) => tra[key].includes(sonDiem))
    .map(([sonHuongCua]) => {
      const { tu, den, tam } = khoangDoSonTu(sonHuongCua);
      return { son: sonHuongCua, doTamSon: tam, khoangDoSo: { tu, den } };
    });

  result.doDiemNghichDauVao = input.doDiemNghich;
  result.sonDiemNghichXacDinh = sonDiem;
  result.loaiDiemNghich = input.loaiDiemNghich;
  result.phuongAnHuongCua = huongCuaKhaDung;
  if (huongCuaKhaDung.length === 0) {
    canhBao.push(`Không tìm được Hướng Cửa nào phù hợp với sơn "${sonDiem}" đóng vai trò ${input.loaiDiemNghich === "long" ? "Giáng Long" : "Giáng Thủy"} — kiểm tra lại độ số nhập vào.`);
  }
  return result;
}

/** Kiểm chứng cách cục trọn vẹn theo 3 cặp phối — dùng cho self-test + có thể hiện trong UI giải thích. */
export interface KetQuaKiemChungCachCuc {
  cuaThuy: { phoi: string; ket: string; hanh: "Kim"; dung: boolean };
  cuaLong: { phoi: string; ket: string; hanh: "Thổ"; dung: boolean };
  longThuy: { phoi: string; ket: string; hanh: "Hỏa"; dung: boolean };
  tronVen: boolean;
}

export function kiemChungCachCuc(sonHuongCua: string, sonGiangLong: string, sonGiangThuy: string): KetQuaKiemChungCachCuc {
  const tra = BANG_TRA_HUONG_CUA[sonHuongCua];
  const dungThuy = !!tra && tra.giangThuy.includes(sonGiangThuy);
  const dungLong = !!tra && tra.giangLong.includes(sonGiangLong);
  return {
    cuaThuy: { phoi: `${sonHuongCua} + ${sonGiangThuy}`, ket: "Phúc Đức", hanh: "Kim", dung: dungThuy },
    cuaLong: { phoi: `${sonHuongCua} + ${sonGiangLong}`, ket: "Họa Hại", hanh: "Thổ", dung: dungLong },
    longThuy: { phoi: `${sonGiangLong} + ${sonGiangThuy}`, ket: "Ngũ Quỷ", hanh: "Hỏa", dung: dungLong && dungThuy },
    tronVen: dungThuy && dungLong,
  };
}
