/**
 * HƯỚNG XUẤT HÀNH ↔ NGƯỜI — dùng lại Cung Phi (`cung-menh-bat-trach/cungPhi.ts`) + Du Niên Bát
 * Quái (`cung-menh-bat-trach/duNienBatQuai.ts`), CẢ HAI đều là dữ liệu đã có nguồn và đã kiểm
 * chứng (skill `bat-trach-luan-nha`) — không tự bịa bảng mới.
 *
 * Ánh xạ "8 hướng địa lý" → "8 quái Hậu Thiên Bát Quái" (Bắc=Khảm, Đông Bắc=Cấn, Đông=Chấn,
 * Đông Nam=Tốn, Nam=Ly, Tây Nam=Khôn, Tây=Đoài, Tây Bắc=Càn) là kiến thức Bát Quái phương vị
 * tiêu chuẩn, dùng xuyên suốt mọi tài liệu Bát Trạch — KHÔNG phải bảng tự đặt.
 *
 * ⚠️ Chỉ tính được "Hướng ↔ Người" (qua Cung Mệnh). Spec module gốc còn nhắc tới "Hướng Thần
 * Tài/Hỷ Thần/Quý Thần theo ngày" — hệ thống CHƯA có bảng phương vị Thần Tài/Hỷ Thần/Quý Thần
 * xác thực theo Can/Chi ngày, nên KHÔNG tính lớp đó (đúng nguyên tắc "DATA_NOT_AVAILABLE thì bỏ
 * qua, không suy đoán").
 */
import { calculateCungPhi, type CungBatTrach, type GioiTinh } from "../cung-menh-bat-trach/cungPhi.js";
import { getKhiBatTrach, KHI_BAT_TRACH_INFO } from "../cung-menh-bat-trach/duNienBatQuai.js";

export const HUONG_XUAT_HANH_LIST = ["Đông", "Tây", "Nam", "Bắc", "Đông Bắc", "Đông Nam", "Tây Bắc", "Tây Nam"] as const;
export type HuongXuatHanh = (typeof HUONG_XUAT_HANH_LIST)[number];

export const HUONG_TOI_QUAI: Record<HuongXuatHanh, CungBatTrach> = {
  Bắc: "Khảm",
  "Đông Bắc": "Cấn",
  Đông: "Chấn",
  "Đông Nam": "Tốn",
  Nam: "Ly",
  "Tây Nam": "Khôn",
  Tây: "Đoài",
  "Tây Bắc": "Càn",
};

export interface HuongCompatibilityResult {
  cungMenh: CungBatTrach;
  cungHuong: CungBatTrach;
  khi: string;
  cat: boolean;
  yNghia: string;
  diem: number;
}

const HUONG_SCORING_RULES = { diemNenTang: 5, catManh: 3, catNhe: 1.5, hungNhe: -2.5, hungManh: -4 } as const;

/** Điểm 0-10 của 1 hướng xuất hành so với Cung Mệnh của người (qua Du Niên Bát Quái). */
export function calculateHuongCompatibility(namSinhDuongLich: number, gioiTinh: GioiTinh, huong: HuongXuatHanh): HuongCompatibilityResult {
  const cungMenh = calculateCungPhi(namSinhDuongLich, gioiTinh);
  const cungHuong = HUONG_TOI_QUAI[huong];
  const khi = getKhiBatTrach(cungMenh, cungHuong);
  const info = KHI_BAT_TRACH_INFO[khi];

  const R = HUONG_SCORING_RULES;
  let diem: number = R.diemNenTang;
  if (khi === "sinh-khi" || khi === "thien-y") diem += R.catManh;
  else if (khi === "dien-nien" || khi === "phuc-vi") diem += R.catNhe;
  else if (khi === "hoa-hai" || khi === "luc-sat") diem += R.hungNhe;
  else diem += R.hungManh; // ngu-quy, tuyet-menh

  diem = Math.max(0, Math.min(10, diem));
  diem = Math.round(diem * 10) / 10;

  return { cungMenh, cungHuong, khi: info.ten, cat: info.cat, yNghia: info.yNghia, diem };
}
