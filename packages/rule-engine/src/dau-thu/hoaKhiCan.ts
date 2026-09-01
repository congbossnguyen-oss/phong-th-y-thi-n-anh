/**
 * Hóa khí Ngũ Hợp Thiên Can — Bước 2 phương pháp Đẩu Thủ Chọn Ngày.
 *
 * Tái dùng 5 cặp Ngũ Hợp đã có ở `trach-nhat/canHop.ts` (kiến thức nền cố định, không dị bản),
 * chỉ thêm cột hóa khí — nguồn `data/dau-thu-chon-ngay.md` Bước 2: Giáp-Kỷ hóa Thổ, Ất-Canh hóa
 * Kim, Bính-Tân hóa Thủy, Đinh-Nhâm hóa Mộc, Mậu-Quý hóa Hỏa.
 */
import { Data } from "@thien-anh/calendar-core";
import { CAN_HOP } from "../trach-nhat/canHop.js";
import type { NguHanh } from "./nguHanhDauThu.js";

type Can = Data.Can;

const HOA_KHI_THEO_CAP: readonly NguHanh[] = ["Thổ", "Kim", "Thủy", "Mộc", "Hỏa"];

const HOA_KHI_CAN: ReadonlyMap<Can, NguHanh> = new Map(
  CAN_HOP.flatMap(([a, b], i) => [
    [a, HOA_KHI_THEO_CAP[i]!] as const,
    [b, HOA_KHI_THEO_CAP[i]!] as const,
  ]),
);

/** Ngũ hành hóa khí của 1 Thiên Can (theo phép Ngũ Hợp). */
export function hoaKhiCuaCan(can: Can): NguHanh {
  const h = HOA_KHI_CAN.get(can);
  if (!h) throw new Error(`Không xác định được hóa khí của Can: ${can}`);
  return h;
}
