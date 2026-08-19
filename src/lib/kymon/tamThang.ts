// Tab TAM THẮNG — SPEC mục 6C. Không cần dữ liệu mới, chỉ quét lại kết quả lapLaBan() đã có.

import { HUONG_DON_GIAN } from "./constants";
import type { LapLaBanResult } from "./types";

export type LoaiThang = "V1" | "V2" | "V3";

export type HangTamThang = {
  /** "V1", "V2", "V3", hoặc gộp "V1V2" / "V1V3" / "V2V3" / "V1V2V3" nếu trùng hướng. */
  loai: string;
  /** "Sinh Môn", "Cửu Thiên", "Thiên Ất", hoặc nối nhau nếu gộp — vd "Sinh Môn Cửu Thiên". */
  ten: string;
  /** Hướng dạng ngắn (Tây, Đông Bắc...) theo HUONG_DON_GIAN. */
  huong: string;
  soCung: number;
};

const TEN_THANG: Record<LoaiThang, string> = {
  V1: "Sinh Môn",
  V2: "Cửu Thiên",
  V3: "Thiên Ất",
};

/**
 * Quét 3 thắng cách (V1=Sinh Môn, V2=Cửu Thiên, V3=Thiên Ất/Trực Phù) trên lá bàn đã lập.
 * Nếu ≥2 thắng cùng rơi 1 cung → gộp thành 1 hàng (vd "V1V2" / "Sinh Môn Cửu Thiên").
 */
export function quetTamThang(r: LapLaBanResult): HangTamThang[] {
  const cungCuaThang = new Map<LoaiThang, number>();

  const cungSinhMon = r.cungList.find((c) => c.mon === "SINH")?.soCung;
  if (cungSinhMon !== undefined) cungCuaThang.set("V1", cungSinhMon);

  const cungCuuThien = r.cungList.find((c) => c.than === "C.Thiên")?.soCung;
  if (cungCuuThien !== undefined) cungCuaThang.set("V2", cungCuuThien);

  // Thiên Ất = Trực Phù (sao) — luôn đóng đúng tại trucPhuCung theo định nghĩa engine.
  cungCuaThang.set("V3", r.trucPhuCung);

  const theoLoaiCung = new Map<number, LoaiThang[]>();
  for (const [loai, cung] of cungCuaThang) {
    const ds = theoLoaiCung.get(cung) ?? [];
    ds.push(loai);
    theoLoaiCung.set(cung, ds);
  }

  const hang: HangTamThang[] = [];
  for (const [soCung, dsLoai] of theoLoaiCung) {
    const dsSapXep = [...dsLoai].sort(); // V1 < V2 < V3
    hang.push({
      loai: dsSapXep.join(""),
      ten: dsSapXep.map((l) => TEN_THANG[l]).join(" "),
      huong: HUONG_DON_GIAN[soCung],
      soCung,
    });
  }

  hang.sort((a, b) => a.loai.localeCompare(b.loai));
  return hang;
}
