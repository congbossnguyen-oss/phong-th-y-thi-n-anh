/**
 * Bảng 寄宮 (Can Ngày → cung ký thác trên Địa Bàn) — sao chép NGUYÊN VẸN từ
 * docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §6 (không tự đổi thứ tự/giá trị nào):
 *
 *   | Can      | 甲(Giáp) | 乙(Ất) | 丙(Bính) | 丁(Đinh) | 戊(Mậu) | 己(Kỷ) | 庚(Canh) | 辛(Tân) | 壬(Nhâm) | 癸(Quý) |
 *   | Cung ký  | 寅(Dần)  | 辰(Thìn)| 巳(Tỵ)   | 未(Mùi)  | 巳(Tỵ)  | 未(Mùi)| 申(Thân) | 戌(Tuất)| 亥(Hợi)  | 丑(Sửu) |
 *
 * XÁC MINH ĐỘC LẬP (Phase 9A): khớp CHÍNH XÁC với `shigangjigong` trong repo B
 * (`kentang2017/kinliuren`, commit 3ba45a9, dòng 44) VÀ với `寄宫映射` trong repo A
 * (`d1210182010/daliuren-web-engine`, commit d5cb9a7, `ganzhiwuxin.py`/`shipan.py` hàm `寄宫`).
 */
import type { Can, Chi } from "../types/ganzhi.js";

export const JI_GONG_TABLE: Readonly<Record<Can, Chi>> = {
  Giáp: "Dần",
  Ất: "Thìn",
  Bính: "Tỵ",
  Đinh: "Mùi",
  Mậu: "Tỵ",
  Kỷ: "Mùi",
  Canh: "Thân",
  Tân: "Tuất",
  Nhâm: "Hợi",
  Quý: "Sửu",
};
