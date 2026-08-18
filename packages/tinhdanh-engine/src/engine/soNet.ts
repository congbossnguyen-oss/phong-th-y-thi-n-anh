/**
 * Quy đổi chữ Việt → số nét theo bảng chữ cái Latinh (Việt Danh Học Chương I).
 *
 * Quy tắc: bỏ dấu thanh điệu và dấu phụ (â→a, ê→e, ô→o, ơ→o, ư→u, ă→a...), giữ "đ"→"DD".
 * Mỗi chữ cái cộng số nét theo bảng. Chữ cái không có trong bảng bị bỏ qua và ghi cảnh báo.
 */
import { BANG_CHU_CAI, soNetChuCai } from "../data/bangTra.js";

/** Bỏ dấu thanh + dấu phụ nhưng GIỮ chữ đ/Đ (sẽ map sang DD khi tra bảng). */
function boDauGiuD(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-̣́̃̉]/g, "") // sắc huyền hỏi ngã nặng
    .replace(/[̛̂̆]/g, "") // dấu mũ ^, dấu á (breve), dấu ơ/ư (horn)
    .normalize("NFC");
}

/**
 * Tách một âm tiết thành danh sách "chữ cái" để tra bảng — xử lý "đ/Đ" thành token "DD".
 * Trả về mảng token in hoa.
 */
export function tachChuCai(amTiet: string): string[] {
  const s = boDauGiuD(amTiet.trim());
  const tokens: string[] = [];
  for (const ch of s) {
    if (ch === "đ" || ch === "Đ") tokens.push("DD");
    else if (/[a-zA-Z]/.test(ch)) tokens.push(ch.toUpperCase());
    // ký tự khác (khoảng trắng, số...) bỏ qua
  }
  return tokens;
}

export interface KetQuaSoNet {
  tong: number;
  netDau: number;
  netCuoi: number;
  /** Chữ cái không tra được bảng — nếu có thì kết quả không đáng tin, phải cảnh báo. */
  chuThieu: string[];
}

/** Tổng số nét + nét chữ đầu + nét chữ cuối của một âm tiết (hoặc một chuỗi âm tiết ghép). */
export function tinhSoNet(amTiet: string): KetQuaSoNet {
  const tokens = tachChuCai(amTiet);
  const chuThieu: string[] = [];
  let tong = 0;
  for (const t of tokens) {
    if (!(t in BANG_CHU_CAI)) chuThieu.push(t);
    tong += soNetChuCai(t);
  }
  const netDau = tokens.length > 0 ? soNetChuCai(tokens[0]!) : 0;
  const netCuoi = tokens.length > 0 ? soNetChuCai(tokens[tokens.length - 1]!) : 0;
  return { tong, netDau, netCuoi, chuThieu };
}

/** Tổng nét của một danh sách âm tiết (vd nhiều chữ đệm). */
export function tongNetNhieu(amTiets: string[]): number {
  return amTiets.reduce((s, a) => s + tinhSoNet(a).tong, 0);
}
