/**
 * Thiên Xá — theo mùa, nhưng chia mùa theo THÁNG ÂM LỊCH (1-3 Xuân, 4-6 Hạ, 7-9 Thu, 10-12
 * Đông) — KHÁC với `satChu.ts`/`truc.ts` chia mùa theo tiết khí (`monthOrderIndex`). Không
 * dùng chung hàm với 2 module đó vì cơ sở chia tháng khác nhau, gộp chung dễ nhầm.
 *
 * Nguồn: bảng "Ngày tốt theo tháng âm lịch" chủ dự án cung cấp trực tiếp 2026-08-11: "Xuân =
 * Mậu Dần, Hạ = Giáp Ngọ, Thu = Mậu Thân, Đông = Giáp Tý". Thiên Xá là ngày CÓ CẢ Can lẫn Chi
 * đúng khớp (1 trụ ngày cụ thể trong 60 Giáp Tý), không phải chỉ khớp riêng Can hoặc riêng
 * Chi như phần lớn thần sát khác trong `thanSat.ts`.
 */
import { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;
export type MuaAmLich = "Xuân" | "Hạ" | "Thu" | "Đông";

export const THIEN_XA_THEO_MUA: Record<MuaAmLich, { can: Can; chi: Chi }> = {
  "Xuân": { can: "Mậu", chi: "Dần" },
  "Hạ": { can: "Giáp", chi: "Ngọ" },
  "Thu": { can: "Mậu", chi: "Thân" },
  "Đông": { can: "Giáp", chi: "Tý" },
};

/** Tháng Âm lịch (1-12) -> mùa, chia đều 3 tháng/mùa — KHÁC monthOrderIndex theo tiết khí. */
export function getMuaAmLichFromThang(lunarMonth: number): MuaAmLich {
  if (lunarMonth < 1 || lunarMonth > 12) {
    throw new Error(`Tháng âm lịch không hợp lệ: ${lunarMonth}`);
  }
  if (lunarMonth <= 3) return "Xuân";
  if (lunarMonth <= 6) return "Hạ";
  if (lunarMonth <= 9) return "Thu";
  return "Đông";
}

export function isThienXaNgay(lunarMonth: number, dayCan: Can, dayChi: Chi): boolean {
  const mua = getMuaAmLichFromThang(lunarMonth);
  const target = THIEN_XA_THEO_MUA[mua];
  return target.can === dayCan && target.chi === dayChi;
}
