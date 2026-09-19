/**
 * Bảng phụ trợ cho 十二天將: (a) thứ tự CỐ ĐỊNH 12 tướng (Algorithm Spec §8, confidence A,
 * "nhất quán tuyệt đối mọi nguồn" — Implementation Gate dòng 49); (b) 2 tập Địa Chi xác định
 * thuận/nghịch (Algorithm Spec §8 mục 2, confidence B — 2 nguồn độc lập thật đồng ý cùng ranh
 * giới dù chưa ai trích được nguyên văn cổ, xem Validation Review mục 10b).
 */
import type { Chi } from "../types/ganzhi.js";
import type { TwelveGeneralName } from "../types/twelve-generals.js";

/** Đúng thứ tự cố định 貴人→螣蛇→朱雀→六合→勾陳→青龍→天空→白虎→太常→玄武→太陰→天后 — dùng để "đi" thuận/nghịch từ vị trí đã đặt 貴人. */
export const TWELVE_GENERAL_ORDER: readonly TwelveGeneralName[] = [
  "guiRen",
  "tengShe",
  "zhuQue",
  "liuHe",
  "gouChen",
  "qingLong",
  "tianKong",
  "baiHu",
  "taiChang",
  "xuanWu",
  "taiYin",
  "tianHou",
];

/** Vị trí Địa Bàn của Quý Nhân thuộc tập này → bố trí THUẬN (chiều Tý→Sửu→Dần…). */
export const THUAN_CHI: ReadonlySet<Chi> = new Set<Chi>(["Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn"]);

/** Vị trí Địa Bàn của Quý Nhân thuộc tập này → bố trí NGHỊCH (chiều ngược lại). */
export const NGHICH_CHI: ReadonlySet<Chi> = new Set<Chi>(["Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất"]);
