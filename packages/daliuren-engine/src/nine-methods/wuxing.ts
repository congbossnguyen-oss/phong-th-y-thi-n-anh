/**
 * Ngũ Hành / Âm Dương của Can/Chi + quan hệ khắc — helper NỘI BỘ cho nine-methods/. TÁI DÙNG
 * hoàn toàn dữ liệu/logic đã có, KHÔNG tự tạo bảng mới:
 *   - Ngũ Hành/Âm Dương của Can/Chi: `Data.CAN_NGU_HANH`/`Data.CHI_NGU_HANH`/`Data.CAN_AM_DUONG`/
 *     `Data.CHI_AM_DUONG` (@thien-anh/calendar-core, index song song với `Data.CAN`/`Data.CHI`).
 *   - Quan hệ sinh/khắc giữa 2 Ngũ Hành: `TrachNhat.getNguHanhQuanHe` (@thien-anh/rule-engine) —
 *     "kiến thức nền tảng cố định của Ngũ Hành học, không có dị bản giữa các trường phái, không
 *     cần đối chiếu nguồn riêng" (nguyên văn comment của chính hàm đó).
 * Không có bảng/hằng số Ngũ Hành nào được định nghĩa LẠI ở đây.
 */
import { Data } from "@thien-anh/calendar-core";
import { TrachNhat } from "@thien-anh/rule-engine";
import type { Can, Chi } from "../types/ganzhi.js";
import { NineMethodsError } from "./errors.js";

type NguHanh = Data.NguHanh;
type AmDuong = "Dương" | "Âm";

export function nguHanhOfCan(can: Can): NguHanh {
  const index = Data.CAN.indexOf(can);
  const value = Data.CAN_NGU_HANH[index];
  if (index === -1 || value === undefined) {
    throw new NineMethodsError("UNKNOWN_CAN_OR_CHI", `Can không hợp lệ khi tra Ngũ Hành: "${can}".`);
  }
  return value;
}

export function nguHanhOfChi(chi: Chi): NguHanh {
  const index = Data.CHI.indexOf(chi);
  const value = Data.CHI_NGU_HANH[index];
  if (index === -1 || value === undefined) {
    throw new NineMethodsError("UNKNOWN_CAN_OR_CHI", `Chi không hợp lệ khi tra Ngũ Hành: "${chi}".`);
  }
  return value;
}

export function amDuongOfCan(can: Can): AmDuong {
  const index = Data.CAN.indexOf(can);
  const value = Data.CAN_AM_DUONG[index];
  if (index === -1 || value === undefined) {
    throw new NineMethodsError("UNKNOWN_CAN_OR_CHI", `Can không hợp lệ khi tra Âm Dương: "${can}".`);
  }
  return value;
}

export function amDuongOfChi(chi: Chi): AmDuong {
  const index = Data.CHI.indexOf(chi);
  const value = Data.CHI_AM_DUONG[index];
  if (index === -1 || value === undefined) {
    throw new NineMethodsError("UNKNOWN_CAN_OR_CHI", `Chi không hợp lệ khi tra Âm Dương: "${chi}".`);
  }
  return value;
}

/** `a` khắc `b` (a controls b) — dùng đúng `TrachNhat.getNguHanhQuanHe`, không tự viết lại chu kỳ khắc. */
export function isKhac(a: NguHanh, b: NguHanh): boolean {
  return TrachNhat.getNguHanhQuanHe(a, b) === "a-khac-b";
}
