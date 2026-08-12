/**
 * HOÀNG ỐC – KIM LÂU – TAM TAI — tổng hợp 3 tiêu chí cho 1 người trong 1 năm cần xem, phục vụ
 * tra cứu xây/sửa nhà, việc lớn. Tam Tai tái dùng đúng bảng đã có trong `trach-nhat/tamTai.ts`
 * (không tạo bảng Tam Tai thứ hai).
 */
import type { Data } from "@thien-anh/calendar-core";
import { getChi } from "../scoring/tuoiHopLamAn.js";
import { getNhomTuoiPhamTamTai } from "../trach-nhat/tamTai.js";
import { calculateHoangOc, type HoangOcResult } from "./hoangOc.js";
import { calculateKimLau, type KimLauResult } from "./kimLau.js";

type Chi = Data.Chi;

export interface TamTaiResult {
  pham: boolean;
  /** Nhóm tuổi (tam hợp cục) đang phạm Tam Tai mà người này thuộc về, nếu có phạm. */
  nhomTuoi?: readonly [Chi, Chi, Chi];
}

export type HoangOcKimLauMucDo = "tot" | "can-can-nhac" | "khong-nen";

export interface HoangOcKimLauKetLuan {
  mucDo: HoangOcKimLauMucDo;
  nhan: string;
  soYeuToXau: number;
}

export interface HoangOcKimLauTamTaiResult {
  namSinh: number;
  namXem: number;
  tuoiMu: number;
  hoangOc: HoangOcResult;
  kimLau: KimLauResult;
  tamTai: TamTaiResult;
  ketLuan: HoangOcKimLauKetLuan;
}

export function calculateLunarAge(namSinh: number, namXem: number): number {
  return namXem - namSinh + 1;
}

export function calculateTamTai(namSinh: number, namXem: number): TamTaiResult {
  const chiNguoi = getChi(namSinh);
  const chiNamXem = getChi(namXem);
  const nhomPham = getNhomTuoiPhamTamTai(chiNamXem);
  const nhom = nhomPham.find((g) => (g as readonly Chi[]).includes(chiNguoi));
  return nhom ? { pham: true, nhomTuoi: nhom } : { pham: false };
}

export function getHouseBuildingRecommendation(
  hoangOc: HoangOcResult,
  kimLau: KimLauResult,
  tamTai: TamTaiResult,
): HoangOcKimLauKetLuan {
  const soYeuToXau = (hoangOc.tot ? 0 : 1) + (kimLau.pham ? 1 : 0) + (tamTai.pham ? 1 : 0);
  if (soYeuToXau === 0) return { mucDo: "tot", nhan: "⭐ Tốt để xem xét xây nhà", soYeuToXau };
  if (soYeuToXau === 1) return { mucDo: "can-can-nhac", nhan: "🟡 Cần cân nhắc", soYeuToXau };
  return { mucDo: "khong-nen", nhan: "🔴 Không nên ưu tiên", soYeuToXau };
}

export function tinhHoangOcKimLauTamTai(namSinh: number, namXem: number): HoangOcKimLauTamTaiResult {
  const tuoiMu = calculateLunarAge(namSinh, namXem);
  const hoangOc = calculateHoangOc(tuoiMu);
  const kimLau = calculateKimLau(tuoiMu);
  const tamTai = calculateTamTai(namSinh, namXem);
  const ketLuan = getHouseBuildingRecommendation(hoangOc, kimLau, tamTai);
  return { namSinh, namXem, tuoiMu, hoangOc, kimLau, tamTai, ketLuan };
}

/** Quét 1 khoảng năm, trả về đã xếp hạng (ít yếu tố xấu nhất trước, cùng hạng thì năm gần hơn trước). */
export function rankGoodHouseBuildingYears(namSinh: number, tuNam: number, denNam: number): HoangOcKimLauTamTaiResult[] {
  const results: HoangOcKimLauTamTaiResult[] = [];
  for (let nam = tuNam; nam <= denNam; nam++) {
    results.push(tinhHoangOcKimLauTamTai(namSinh, nam));
  }
  return results.slice().sort((a, b) => a.ketLuan.soYeuToXau - b.ketLuan.soYeuToXau || a.namXem - b.namXem);
}
