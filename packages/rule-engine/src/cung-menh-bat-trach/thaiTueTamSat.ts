/**
 * THÁI TUẾ – TUẾ PHÁ – TAM SÁT THEO PHƯƠNG VỊ (khác với `trach-nhat/thaiTue.ts` — file đó tính
 * "phạm Thái Tuế theo TUỔI người", còn file này tính "Thái Tuế/Tuế Phá/Tam Sát ĐÓNG TẠI PHƯƠNG
 * NÀO trong năm", phục vụ module Chọn Ngày Giờ Sửa Chữa – Cải Tạo Nhà cần biết phương vị định
 * động có phạm hay không).
 *
 * Kiến thức cổ điển tiêu chuẩn, không có dị bản giữa các trường phái (giống cách xử lý
 * `huongXuatHanh.ts` đã làm với Hậu Thiên Bát Quái):
 * - 12 Địa Chi ↔ 8 phương (Hậu Thiên Bát Quái): Thái Tuế của năm nào thì "tọa" đúng tại phương
 *   ứng với Chi của năm đó (năm Tý → Thái Tuế tại Khảm/Bắc). 4 phương chính (Khảm/Chấn/Ly/Đoài)
 *   mỗi phương ứng với đúng 1 Chi; 4 phương góc (Cấn/Tốn/Khôn/Càn) mỗi phương ứng với 2 Chi liền
 *   nhau (đúng cách chia 24 sơn: mỗi phương góc gồm 2 sơn Chi + 1 sơn Quái ở giữa).
 * - Tuế Phá = phương ĐỐI XUNG (Lục Xung) với Thái Tuế — dùng lại `trach-nhat/lucXung.ts`.
 * - Tam Sát = phương đối xung với "cục" Tam Hợp của năm (năm thuộc cục Thân-Tý-Thìn/Thủy cục
 *   → Tam Sát tại Nam; Dần-Ngọ-Tuất/Hỏa cục → Tam Sát tại Bắc; Tỵ-Dậu-Sửu/Kim cục → Tam Sát tại
 *   Đông; Hợi-Mão-Mùi/Mộc cục → Tam Sát tại Tây) — công thức Tam Sát kinh điển phổ biến nhất,
 *   luôn rơi đúng 1 trong 4 phương chính (không rơi vào phương góc).
 *
 * ⚠️ Module chỉ xét ở ĐỘ CHI TIẾT 8 PHƯƠNG (Bát Quái), KHÔNG xét chính xác từng sơn trong 24 sơn
 * (vd. phân biệt Nhâm/Tý/Quý đều thuộc Khảm/Bắc) — vì toàn bộ hạ tầng phương vị có sẵn trong hệ
 * thống (`cungPhi.ts`, `duNienBatQuai.ts`, `huongXuatHanh.ts`) đều làm việc ở cấp độ 8 phương,
 * và đặc tả module cũng coi phần "24 sơn/độ số chính xác" là tính năng "chế độ chuyên gia" nâng
 * cao, không bắt buộc ở bản cơ bản.
 */
import type { Data } from "@thien-anh/calendar-core";
import { getLucXungChi } from "../trach-nhat/lucXung.js";
import type { CungBatTrach } from "./cungPhi.js";

type Chi = Data.Chi;

export const CHI_TOI_CUNG: Record<Chi, CungBatTrach> = {
  Tý: "Khảm",
  Sửu: "Cấn",
  Dần: "Cấn",
  Mão: "Chấn",
  Thìn: "Tốn",
  Tỵ: "Tốn",
  Ngọ: "Ly",
  Mùi: "Khôn",
  Thân: "Khôn",
  Dậu: "Đoài",
  Tuất: "Càn",
  Hợi: "Càn",
};

/** Thái Tuế năm nay tọa tại phương nào (Bát Quái). */
export function getThaiTueCung(namChi: Chi): CungBatTrach {
  return CHI_TOI_CUNG[namChi];
}

/** Tuế Phá — phương đối xung với Thái Tuế. */
export function getTuePhaCung(namChi: Chi): CungBatTrach {
  return CHI_TOI_CUNG[getLucXungChi(namChi)];
}

const TAM_SAT_THEO_CUC: readonly { cuc: readonly [Chi, Chi, Chi]; tamSatCung: CungBatTrach }[] = [
  { cuc: ["Thân", "Tý", "Thìn"], tamSatCung: "Ly" }, // Thủy cục (vượng Bắc) -> Tam Sát Nam
  { cuc: ["Dần", "Ngọ", "Tuất"], tamSatCung: "Khảm" }, // Hỏa cục (vượng Nam) -> Tam Sát Bắc
  { cuc: ["Tỵ", "Dậu", "Sửu"], tamSatCung: "Chấn" }, // Kim cục (vượng Tây) -> Tam Sát Đông
  { cuc: ["Hợi", "Mão", "Mùi"], tamSatCung: "Đoài" }, // Mộc cục (vượng Đông) -> Tam Sát Tây
];

/** Tam Sát năm nay đóng tại phương nào (luôn 1 trong 4 phương chính). */
export function getTamSatCung(namChi: Chi): CungBatTrach {
  const nhom = TAM_SAT_THEO_CUC.find((n) => (n.cuc as readonly Chi[]).includes(namChi));
  if (!nhom) throw new Error(`Không xác định được cục Tam Hợp cho Chi ${namChi}.`);
  return nhom.tamSatCung;
}

export interface PhuongViRuiRoTheoNam {
  namChi: Chi;
  thaiTueCung: CungBatTrach;
  tuePhaCung: CungBatTrach;
  tamSatCung: CungBatTrach;
}

export function getPhuongViRuiRoTheoNam(namChi: Chi): PhuongViRuiRoTheoNam {
  return {
    namChi,
    thaiTueCung: getThaiTueCung(namChi),
    tuePhaCung: getTuePhaCung(namChi),
    tamSatCung: getTamSatCung(namChi),
  };
}
