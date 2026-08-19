// Nạp + tiền xử lý 3 file dữ liệu (km_data.json, km_giaptytable.json, km_core_tables.json).
// Theo đúng yêu cầu SPEC: chỉ tra bảng có sẵn, không tự tính lịch âm/tiết khí/cục.

import kmDataRaw from "./data/km_data.json";
import kmGiapTyRaw from "./data/km_giaptytable.json";
import kmCoreRaw from "./data/km_core_tables.json";

export type KmDataRow = {
  date: string;
  stt: number;
  can: string;
  chi: string;
  nguyen: "Thượng" | "Trung" | "Hạ";
  amduong: "+" | "-";
  cuc: number;
  tietkhi: string | null;
};

export type GiapTyRow = {
  ten: string;
  phudau: string;
  tuankhong_chi: string;
};

type DiaBanCellConfig = { neo_cuc: number; duong_tu: string; am_tu: string };

type KmCoreTables = {
  cung_mon_sao_thuan: [number, string, string][];
  cuu_tinh_chuyen: [string, string][];
  bat_mon_duong: string[][];
  diaban_luc_nghi: string[][];
  bat_than: string[][];
  thien_ban_chuoi_tham_chieu: [string, string][];
  tra_Y63: { Y63: number; can: string; so: number }[];
  dia_ban_cong_thuc: Record<string, DiaBanCellConfig | string>;
};

const kmData = kmDataRaw as KmDataRow[];
const kmGiapTy = kmGiapTyRaw as GiapTyRow[];
const core = kmCoreRaw as unknown as KmCoreTables;

export const kmDataByDate = new Map<string, KmDataRow>();
for (const row of kmData) kmDataByDate.set(row.date, row);

export const giapTyByTen = new Map<string, GiapTyRow>();
for (const row of kmGiapTy) giapTyByTen.set(row.ten, row);

export { core };

/** cung (1-9) → môn gốc / sao gốc theo cung_mon_sao_thuan (chưa xoay). */
export const monOfCung = new Map<number, string>();
export const saoOfCung = new Map<number, string>();
/** tên sao/môn → cung "nhà" của nó (bỏ cung 5 vì trùng cung 2, không phải "nhà" riêng). */
export const homeCungOfSao = new Map<string, number>();
export const homeCungOfMon = new Map<string, number>();

for (const [cung, mon, sao] of core.cung_mon_sao_thuan) {
  monOfCung.set(cung, mon);
  saoOfCung.set(cung, sao);
  if (cung !== 5) {
    homeCungOfSao.set(sao, cung);
    homeCungOfMon.set(mon, cung);
  }
}

/** Chuỗi sao dưới→trên (cuu_tinh_chuyen), dùng để đi tới/lùi vòng 8 sao. */
export const saoNext = new Map<string, string>();
export const saoPrev = new Map<string, string>();
for (const [duoi, tren] of core.cuu_tinh_chuyen) {
  saoNext.set(duoi, tren);
  saoPrev.set(tren, duoi);
}

/** Vòng 8 cung "nhà" của 8 sao (bỏ Trung cung), dựng từ cuu_tinh_chuyen + cung_mon_sao_thuan.
 * Đây là 1 chu trình cố định, không phụ thuộc test case — luôn dựng giống nhau mỗi lần chạy. */
export function buildPalaceCycle(): number[] {
  const order: number[] = [];
  let cur = "T.Nhậm";
  for (let i = 0; i < 8; i++) {
    const home = homeCungOfSao.get(cur);
    if (home === undefined) throw new Error(`Không tìm thấy cung nhà của sao ${cur}.`);
    order.push(home);
    const next = saoNext.get(cur);
    if (!next) throw new Error(`cuu_tinh_chuyen thiếu mắt xích tiếp theo sau ${cur}.`);
    cur = next;
  }
  return order;
}

/** Vòng 8 môn gốc theo thứ tự cố định (hàng đầu bat_mon_duong: HƯU-SINH-THƯƠNG-ĐỖ-CẢNH-TỬ-KINH-KHAI). */
export const MON_CYCLE_BASE: string[] = core.bat_mon_duong[0];
export const monNext = new Map<string, string>();
export const monPrev = new Map<string, string>();
for (let i = 0; i < MON_CYCLE_BASE.length; i++) {
  const a = MON_CYCLE_BASE[i];
  const b = MON_CYCLE_BASE[(i + 1) % MON_CYCLE_BASE.length];
  monNext.set(a, b);
  monPrev.set(b, a);
}

/** Bát thần — cột 0 = thứ tự Dương Độn, cột 2 = thứ tự Âm Độn (đọc trực tiếp từ bat_than). */
export const THAN_DUONG: string[] = core.bat_than.map((r) => r[0]);
export const THAN_AM: string[] = core.bat_than.map((r) => r[2]);

// ---------------------------------------------------------------------------------------
// SPEC mục 5B (bổ sung) — công thức chính xác bố trí Địa Bàn (9 ô tự tham chiếu) + bảng
// tra(Y63) chính xác. Thay cho cách cũ (diaban_luc_nghi[cục-1] + thứ tự cố định).
// ---------------------------------------------------------------------------------------

/** Chuỗi Lục Nghi Tam Kỳ gốc (Mậu→Kỷ→Canh→Tân→Nhâm→Quý→Đinh→Bính→Ất→loop Mậu), lấy trực
 * tiếp từ hàng cục=1 của diaban_luc_nghi (hàng "gốc", không xoay). */
const NGHI_LIST: string[] = core.diaban_luc_nghi[0];
export function traLucNghi(canGoc: string): string {
  const i = NGHI_LIST.indexOf(canGoc);
  if (i === -1) throw new Error(`Không tìm thấy "${canGoc}" trong bảng Lục Nghi Tam Kỳ gốc.`);
  return NGHI_LIST[(i + 1) % NGHI_LIST.length];
}

export const DIA_BAN_CELLS = Object.keys(core.dia_ban_cong_thuc).filter((k) => k !== "_ghi_chu");
export const diaBanCongThuc = core.dia_ban_cong_thuc as Record<string, DiaBanCellConfig>;

/** Ô Địa Bàn (H16/K16/.../N26) → số cung Lạc Thư (1-9). Chính là "neo_cuc" của ô đó — đã
 * đối chiếu khớp 7/7 với lá mẫu SPEC mục 6 (kể cả giải luôn nghi vấn Càn "Đinh" vs "Kỷ": ô
 * N26 = cung Càn(6), giải ra Kỷ — đúng nhãn phụ "+Kỷ" trong lá mẫu, không phải "Đinh"). */
export const CELL_TO_CUNG: Record<string, number> = {};
for (const cell of DIA_BAN_CELLS) CELL_TO_CUNG[cell] = diaBanCongThuc[cell].neo_cuc;

/** Bảng tra(Y63) chính xác (SPEC 5B) — chỉ có 6 khóa CHẴN (0,2,4,6,8,10). Y63 lẻ (đã gặp ở
 * cả 2 lá mẫu test) KHÔNG có trong bảng này — xem README/ghi chú trong engine.ts. */
export const TRA_Y63: Map<number, number> = new Map(core.tra_Y63.map((r) => [r.Y63, r.so]));

/**
 * Giải hệ 9 phương trình tự tham chiếu bố trí Địa Bàn (SPEC mục 5B).
 * Đúng 1 điểm neo (ô có neo_cuc === cuc hiện tại) = "Mậu", 8 ô còn lại lan tỏa theo chuỗi
 * tham chiếu duong_tu/am_tu (chọn theo amDuong) + traLucNghi. Đây là hệ có đúng 1 nghiệm
 * (9 ẩn, 9 phương trình, 1 chu trình khép kín) nên chỉ cần lan tỏa 1 lượt theo đúng thứ tự
 * phụ thuộc là xong — không cần lặp nhiều vòng.
 */
export function solveDiaBan(cuc: number, isDuong: boolean): Map<string, string> {
  const anchor = DIA_BAN_CELLS.find((c) => diaBanCongThuc[c].neo_cuc === cuc);
  if (!anchor) throw new Error(`Không tìm thấy ô neo cho cục ${cuc}.`);
  const val = new Map<string, string>();
  val.set(anchor, "Mậu");
  let guard = 0;
  while (val.size < DIA_BAN_CELLS.length && guard < 20) {
    guard++;
    for (const cell of DIA_BAN_CELLS) {
      if (val.has(cell)) continue;
      const cfg = diaBanCongThuc[cell];
      const src = isDuong ? cfg.duong_tu : cfg.am_tu;
      const srcVal = val.get(src);
      if (srcVal) val.set(cell, traLucNghi(srcVal));
    }
  }
  if (val.size < DIA_BAN_CELLS.length) {
    throw new Error("Hệ phương trình Địa Bàn không hội tụ — kiểm tra lại dia_ban_cong_thuc.");
  }
  return val;
}

/** Địa Bàn Can theo cung (1-9) — bọc solveDiaBan + CELL_TO_CUNG cho tiện dùng. */
export function diaBanCanByCung(cuc: number, isDuong: boolean): Map<number, string> {
  const cellVal = solveDiaBan(cuc, isDuong);
  const result = new Map<number, string>();
  for (const [cell, cung] of Object.entries(CELL_TO_CUNG)) {
    result.set(cung, cellVal.get(cell)!);
  }
  return result;
}
