/**
 * Bước 4 — lập Tứ Đại Cục (Mệnh / Vận / Phúc Đức / Tử Tức) rồi tra Bảng 81 Cục.
 *
 * Công thức gốc: skill `tinh-danh-hoc` → `viet-danh-hoc-quy-trinh.md` mục 4.
 * Ký hiệu: Họ (1 âm tiết), Đệm (0..n âm tiết), Tên (tên riêng, 1 âm tiết).
 *
 * Quy ước đọc khi có nhiều Đệm: "tổng nét Đệm" = cộng tất cả; "nét đầu Đệm" = nét đầu Đệm ĐẦU
 * tiên; "nét cuối Đệm" = nét cuối Đệm CUỐI cùng. Với tên chỉ có 1 đệm (đa số) thì không mơ hồ.
 */
import { traCuc, hangSoDinhDanh } from "../data/bangTra.js";
import { tinhSoNet, tongNetNhieu } from "./soNet.js";
import type { Cuc, GioiTinh, MenhCuc, NguHanh, TuDaiCuc } from "../types.js";

/** Rút gọn về 1..81: >81 thì trừ 80 lặp lại. */
function rutGon(tong: number): number {
  let x = tong;
  while (x > 81) x -= 80;
  return x < 1 ? 1 : x;
}

/** Digital root — cộng dồn chữ số tới khi còn 1 chữ số (dùng cho Phúc Đức Động Cục). */
function congDonChuSo(tong: number): number {
  let x = Math.abs(tong);
  while (x >= 10) x = String(x).split("").reduce((s, d) => s + Number(d), 0);
  return x < 1 ? 1 : x;
}

function cucCua(so: number): Cuc {
  const c = traCuc(so);
  if (c) return c;
  // Không được xảy ra sau rút gọn; nếu có, trả cục trung tính có nhãn rõ để không vỡ luồng.
  return { so, ten: null, yNghia: "Không tra được cục — dữ liệu bảng thiếu số này.", catHung: "hung" };
}

export interface ThanhPhanNet {
  ho: { tong: number; dau: number; cuoi: number };
  demTong: number;
  demDau: number;
  demCuoi: number;
  coDem: boolean;
  ten: { tong: number; dau: number; cuoi: number };
  chuThieu: string[];
}

/** Tính sẵn số nét của Họ / Đệm / Tên để các cục dùng chung. */
export function thanhPhanNet(ho: string, dem: string[], ten: string): ThanhPhanNet {
  const h = tinhSoNet(ho);
  const t = tinhSoNet(ten);
  const coDem = dem.length > 0;
  const demDauSrc = coDem ? tinhSoNet(dem[0]!) : null;
  const demCuoiSrc = coDem ? tinhSoNet(dem[dem.length - 1]!) : null;
  const chuThieu = [
    ...h.chuThieu,
    ...t.chuThieu,
    ...dem.flatMap((d) => tinhSoNet(d).chuThieu),
  ];
  return {
    ho: { tong: h.tong, dau: h.netDau, cuoi: h.netCuoi },
    demTong: coDem ? tongNetNhieu(dem) : 0,
    demDau: demDauSrc ? demDauSrc.netDau : 0,
    demCuoi: demCuoiSrc ? demCuoiSrc.netCuoi : 0,
    coDem,
    ten: { tong: t.tong, dau: t.netDau, cuoi: t.netCuoi },
    chuThieu,
  };
}

function luanKetHopMenh(tc: Cuc, dc: Cuc): string {
  const tcTot = tc.catHung === "cat";
  const dcTot = dc.catHung === "cat";
  if (tcTot && dcTot) return "Đại Cát — nền tảng lẫn xu thế đều tốt, ví như áo gấm thêu hoa.";
  if (tcTot && !dcTot) return "Tốt chung, xấu riêng — nền tảng vững nhưng có vài lĩnh vực/giai đoạn không thuận.";
  if (!tcTot && dcTot) return "Xấu chung, tốt riêng — nền tảng kém nhưng vẫn có giai đoạn/lĩnh vực thăng tiến.";
  return "Đại Hung — cả gốc lẫn ngọn đều bất lợi; cần xét Phúc Đức Cục để tìm khả năng cứu giải một phần.";
}

/**
 * Lập trọn Tứ Đại Cục.
 *
 * `hanhKhuyet` + `gioiTinh` chỉ dùng để lấy Hằng Số Ngũ Hành Định Danh khi tên KHÔNG có đệm.
 */
export function lapTuDaiCuc(params: {
  ho: string;
  dem: string[];
  ten: string;
  gioiTinh: GioiTinh;
  hanhKhuyet: NguHanh;
}): { tuDaiCuc: TuDaiCuc; net: ThanhPhanNet } {
  const net = thanhPhanNet(params.ho, params.dem, params.ten);
  const hs = hangSoDinhDanh(params.hanhKhuyet, params.gioiTinh);
  // Khi không có đệm, "khe Đệm" trong các công thức được thay bằng Hằng Số Ngũ Hành Định Danh.
  const demTong = net.coDem ? net.demTong : hs;
  const demDau = net.coDem ? net.demDau : hs;
  const demCuoi = net.coDem ? net.demCuoi : hs;

  // a. Mệnh Cục
  const menhTC = rutGon(net.ho.tong + (net.coDem ? net.demTong : 0) + net.ten.tong);
  const menhDC = rutGon(net.ten.tong + net.ho.cuoi + (net.coDem ? net.demCuoi : 0));
  const tinhCuc = cucCua(menhTC);
  const dongCuc = cucCua(menhDC);
  const menhCuc: MenhCuc = { tinhCuc, dongCuc, luanKetHop: luanKetHopMenh(tinhCuc, dongCuc) };

  // b. Vận Cục
  const tienVan = cucCua(rutGon(net.ho.tong + demCuoi + net.ten.cuoi));
  const hauVan = cucCua(rutGon(net.ho.tong + demCuoi + net.ten.tong));

  // c. Phúc Đức Cục
  const pdTongTho = net.ho.cuoi + demTong + net.ten.cuoi;
  const phucDucCuc = cucCua(congDonChuSo(pdTongTho));

  // d. Tử Tức Cục (Nam +1, Nữ −1)
  const giaSo = params.gioiTinh === "nam" ? 1 : -1;
  const tuTucCuc = cucCua(rutGon(net.ho.dau + demDau + net.ten.tong + giaSo));

  return { tuDaiCuc: { menhCuc, tienVan, hauVan, phucDucCuc, tuTucCuc }, net };
}
