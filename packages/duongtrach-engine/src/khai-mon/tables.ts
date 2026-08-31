/**
 * Bảng dữ liệu Khai Môn Điểm Thần Sát — nhập NGUYÊN VĂN từ data/01-bang-tra-do-so.md mục 6 và
 * data/02-than-sat-va-y-nghia.md mục 1-2 (gói khai-mon-module, Công cung cấp). Không sửa, không
 * làm tròn khác — SPEC.md mục 2.
 */
import type { Can, Chi } from "../shared/do-so.js";
import type { LoaiThanSat } from "./types.js";

/** Ngũ hổ độn — Can của TOẠ → Can khởi tại cung Dần (data/01 mục 6). */
export const NGU_HO_DON: Record<Can, Can> = {
  Giáp: "Bính",
  Kỷ: "Bính",
  Ất: "Mậu",
  Canh: "Mậu",
  Bính: "Canh",
  Tân: "Canh",
  Đinh: "Nhâm",
  Nhâm: "Nhâm",
  Mậu: "Giáp",
  Quý: "Giáp",
};

/** An theo CAN của môn khí — 3 sao (data/02 mục 1). */
export const THAN_SAT_THEO_CAN: Record<string, Record<Can, Chi>> = {
  "Thiên Lộc": { Giáp: "Dần", Ất: "Mão", Bính: "Tị", Đinh: "Ngọ", Mậu: "Tị", Kỷ: "Ngọ", Canh: "Thân", Tân: "Dậu", Nhâm: "Hợi", Quý: "Tý" },
  "Âm Quý nhân": { Giáp: "Sửu", Ất: "Tý", Bính: "Hợi", Đinh: "Dậu", Mậu: "Mùi", Kỷ: "Thân", Canh: "Ngọ", Tân: "Dần", Nhâm: "Tị", Quý: "Mão" },
  "Dương Quý nhân": { Giáp: "Mùi", Ất: "Thân", Bính: "Dậu", Đinh: "Hợi", Mậu: "Sửu", Kỷ: "Tý", Canh: "Dần", Tân: "Ngọ", Nhâm: "Mão", Quý: "Tị" },
};

/**
 * An theo CHI của môn khí — 5 sao (data/02 mục 2). Thiên Hình có thể ra 2 chi (mảng) — sinh 2
 * bản ghi ThanSat (SPEC.md mục 2).
 */
export const THAN_SAT_THEO_CHI: Record<string, Record<Chi, Chi[]>> = {
  "Đào hoa": {
    Tý: ["Dậu"], Sửu: ["Ngọ"], Dần: ["Mão"], Mão: ["Tý"], Thìn: ["Dậu"], Tị: ["Ngọ"],
    Ngọ: ["Mão"], Mùi: ["Tý"], Thân: ["Dậu"], Dậu: ["Ngọ"], Tuất: ["Mão"], Hợi: ["Tý"],
  },
  "Thiên Mã": {
    Tý: ["Dần"], Sửu: ["Hợi"], Dần: ["Thân"], Mão: ["Tị"], Thìn: ["Dần"], Tị: ["Hợi"],
    Ngọ: ["Thân"], Mùi: ["Tị"], Thân: ["Dần"], Dậu: ["Hợi"], Tuất: ["Thân"], Hợi: ["Tị"],
  },
  "Đại Sát": {
    Tý: ["Mùi"], Sửu: ["Thìn"], Dần: ["Sửu"], Mão: ["Tuất"], Thìn: ["Mùi"], Tị: ["Thìn"],
    Ngọ: ["Sửu"], Mùi: ["Tuất"], Thân: ["Mùi"], Dậu: ["Thìn"], Tuất: ["Sửu"], Hợi: ["Tuất"],
  },
  "Độc Hoả": {
    Tý: ["Dần"], Sửu: ["Mão"], Dần: ["Mão"], Mão: ["Tý"], Thìn: ["Tị"], Tị: ["Tị"],
    Ngọ: ["Dậu"], Mùi: ["Ngọ"], Thân: ["Ngọ"], Dậu: ["Thân"], Tuất: ["Hợi"], Hợi: ["Hợi"],
  },
  "Thiên Hình": {
    Tý: ["Mão"], Sửu: ["Tuất", "Mùi"], Dần: ["Tị", "Thân"], Mão: ["Tý"], Thìn: ["Thìn"], Tị: ["Thân", "Dần"],
    Ngọ: ["Ngọ"], Mùi: ["Sửu", "Tuất"], Thân: ["Dần", "Tị"], Dậu: ["Dậu"], Tuất: ["Sửu", "Mùi"], Hợi: ["Hợi"],
  },
};

export const CAT_THAN = new Set(["Thiên Lộc", "Thiên Mã", "Âm Quý nhân", "Dương Quý nhân"]);
export const CAT_CO_DIEU_KIEN = new Set(["Đào hoa"]);
export const HUNG_THAN = new Set(["Thiên Hình", "Đại Sát", "Độc Hoả"]);

export function loaiThanSat(ten: string): LoaiThanSat {
  if (CAT_THAN.has(ten)) return "cát";
  if (CAT_CO_DIEU_KIEN.has(ten)) return "cát-điều-kiện";
  return "hung";
}
