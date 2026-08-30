/**
 * BÁT TRẠCH NHÀ — Xuyên Cung Cửu Tinh (bố trí theo TẦNG nhà). Nguồn: gói build
 * `data/07-xuyen-cung-cuu-tinh-tang-nha.md`. Đã "bỏ chặn, cho build" theo `data/00` MĐ-3 (đợt bổ
 * sung 5) — trước đó bị chặn vì chưa chốt quy tắc khởi Tầng 1.
 *
 * Giới hạn công cụ ở TỐI ĐA 10 TẦNG (data/07 mục 5: bảng 11-15 tầng bị OCR lộn cột, không đọc
 * được chắc chắn — vòng 8 sao có thể chạy tiếp về mặt lý thuyết nhưng nguồn không xác nhận được).
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";
import { getKhiBatTrach, KHI_BAT_TRACH_INFO, type KhiBatTrach } from "../cung-menh-bat-trach/duNienBatQuai.js";
import { SAO_DU_NIEN } from "./sinhKhacCungSao.js";

export const SO_TANG_TOI_DA = 10;

/** Vòng 5 sao (nhà ≤5 tầng) — bắt đầu tại Thiên y (Cự Môn) như liệt kê nguyên văn trong nguồn. */
const VONG_5_SAO: readonly KhiBatTrach[] = ["thien-y", "dien-nien", "luc-sat", "sinh-khi", "ngu-quy"];

/** Vòng 8 sao "song ngũ hành" (nhà 6-10 tầng) — bắt đầu tại Thiên y (Cự Môn). */
const VONG_8_SAO: readonly KhiBatTrach[] = ["thien-y", "hoa-hai", "tuyet-menh", "dien-nien", "luc-sat", "phuc-vi", "sinh-khi", "ngu-quy"];

export interface TangCuuTinh {
  tang: number;
  khi: KhiBatTrach;
  tenKhi: string;
  saoTen: string;
  cat: boolean;
}

function sinhVongTang(vong: readonly KhiBatTrach[], startIndex: number, soTang: number): TangCuuTinh[] {
  const ketQua: TangCuuTinh[] = [];
  for (let i = 0; i < soTang; i++) {
    const khi = vong[(startIndex + i) % vong.length]!;
    ketQua.push({ tang: i + 1, khi, tenKhi: KHI_BAT_TRACH_INFO[khi].ten, saoTen: SAO_DU_NIEN[khi].ten, cat: KHI_BAT_TRACH_INFO[khi].cat });
  }
  return ketQua;
}

/**
 * Bảng bố trí theo tầng — Khả năng 1 (mặc định `data/00` MĐ-3): Tầng 1 = khí Du Niên giữa Tọa
 * và Môn, các tầng sau chạy theo vòng tương sinh (nhất quán với phần còn lại của hệ thống, vốn
 * luôn dùng Tọa×Môn cho Dương Trạch Tam Yếu/Xuyên Cung — xem `data/00` MĐ-1 "lưu ý không đổi").
 */
export function tinhXuyenCungTangKhaNang1(toaCung: CungBatTrach, monCung: CungBatTrach, soTang: number): TangCuuTinh[] {
  if (!Number.isInteger(soTang) || soTang < 1 || soTang > SO_TANG_TOI_DA) {
    throw new Error(`Số tầng phải là số nguyên từ 1 đến ${SO_TANG_TOI_DA}.`);
  }
  const vong = soTang <= 5 ? VONG_5_SAO : VONG_8_SAO;
  const khiTang1 = getKhiBatTrach(toaCung, monCung);
  const startIndex = vong.indexOf(khiTang1);
  // khiTang1 luôn có mặt trong CẢ 2 vòng (8 khí Du Niên = đúng 8 sao của vòng 8; vòng 5 là 1 tập
  // con 5/8 khí) — nếu soTang<=5 mà khí rơi vào 3 khí KHÔNG có trong vòng 5 (hoa-hai/tuyet-menh/
  // phuc-vi), dùng luôn vòng 8 để không mất dữ liệu, dù nhà chỉ có <=5 tầng (an toàn hơn báo lỗi).
  if (startIndex === -1) {
    const start8 = VONG_8_SAO.indexOf(khiTang1);
    return sinhVongTang(VONG_8_SAO, start8, soTang);
  }
  return sinhVongTang(vong, startIndex, soTang);
}

/**
 * Khả năng 2 (đối chiếu, `data/00` MĐ-3) — CHỈ có thể trình bày đúng nguyên văn cho ĐÚNG tổ hợp
 * đã xác thực trong nguồn ("Tốn môn – Khảm trạch"): sách ghi Tầng 1 = Thiên y trực tiếp (không
 * qua công thức Du Niên Tọa×Môn). Với mọi tổ hợp Tọa/Môn khác, nguồn KHÔNG cho đủ dữ liệu để suy
 * ra quy luật chung — trả `null` thay vì suy diễn (data/00 MĐ-4: thiếu dữ liệu thì để trống).
 */
export function tinhXuyenCungTangKhaNang2(toaCung: CungBatTrach, monCung: CungBatTrach, soTang: number): TangCuuTinh[] | null {
  const laToHopDaXacThuc = (toaCung === "Khảm" && monCung === "Tốn") || (toaCung === "Tốn" && monCung === "Khảm");
  if (!laToHopDaXacThuc) return null;
  const vong = soTang <= 5 ? VONG_5_SAO : VONG_8_SAO;
  return sinhVongTang(vong, 0, Math.min(soTang, SO_TANG_TOI_DA)); // vòng đã bắt đầu sẵn tại Thiên y (index 0)
}

export interface KetQuaXuyenCungTang {
  khaNang1: TangCuuTinh[];
  khaNang2: TangCuuTinh[] | null;
  lech: boolean;
  ghiChu: string;
}

export function tinhXuyenCungTang(toaCung: CungBatTrach, monCung: CungBatTrach, soTang: number): KetQuaXuyenCungTang {
  const khaNang1 = tinhXuyenCungTangKhaNang1(toaCung, monCung, soTang);
  const khaNang2 = tinhXuyenCungTangKhaNang2(toaCung, monCung, soTang);
  const lech = khaNang2 !== null && khaNang2[0]!.khi !== khaNang1[0]!.khi;
  const ghiChu = khaNang2
    ? lech
      ? `Theo đúng ví dụ trong sách (tổ hợp Tọa/Môn này đã có ca mẫu xác thực), chuỗi tầng dịch đi — Tầng 1 là ${khaNang2[0]!.tenKhi}, không phải ${khaNang1[0]!.tenKhi}. Chờ đối chiếu thực tế.`
      : "2 khả năng cho cùng kết quả ở tổ hợp Tọa/Môn này."
    : "Chưa có ví dụ đối chiếu trong nguồn cho đúng tổ hợp Tọa/Môn này — chỉ hiển thị Khả năng 1 (mặc định hệ thống).";
  return { khaNang1, khaNang2, lech, ghiChu };
}
