/**
 * Cầu nối bat-tu-engine ↔ chart-profile: từ `BatTuFacts` (đã lập lá số) → vượng suy + Dụng/Hỷ/Kỵ Thần
 * DỨT KHOÁT bằng code (không cần AI). Dùng để LẤP các trường mà trước đây phụ thuộc AI luận (hay
 * trả "insufficient"). AI vẫn lo cơ chế Manh Phái + cách cục + Thập Thần + chủ đề Đại Vận.
 */
import type { BatTuFacts } from "./types";
import { phanTichBatTu, type TuTruInput, type Hanh } from "../bat-tu-engine/engine";

const HANH_KEY: Record<Hanh, "kim" | "moc" | "thuy" | "hoa" | "tho"> = {
  Kim: "kim", Mộc: "moc", Thủy: "thuy", Hỏa: "hoa", Thổ: "tho",
};
const VUONGSUY_KEY: Record<string, string> = {
  "Cực cường": "cuc_cuong", "Cường vượng": "cuong_vuong", "Vượng": "vuong", "Trung hòa": "trung_hoa",
  "Suy": "suy", "Nhược": "nhuoc", "Cực nhược": "cuc_nhuoc",
};

export interface EngineBatTu {
  vuong_suy: string;
  dung_than: string;
  hy_than: string;
  ky_than: string;
  cuu_than: string;
  capDoLabel: string;
  phuongPhap: string;
  thap_than_noi_bat: string[];
  dienGiai: string[];
}

/** Thập Thần nổi bật (deterministic) — tần suất tàng can Thập Thần, bỏ Tỷ Kiên/Kiếp Tài của chính
 *  Nhật Chủ trùng lặp quá nhiều. Để module nghề chạy fallback 5 trục ngay cả khi AI chưa/không luận. */
function thapThanNoiBat(facts: BatTuFacts): string[] {
  const dem = new Map<string, number>();
  for (const tru of [facts.tuTru.nam, facts.tuTru.thang, facts.tuTru.ngay, facts.tuTru.gio]) {
    for (const t of tru.tangCan) {
      const tt = t.thapThan?.trim();
      if (!tt || tt === "Nhật Chủ" || tt === "Nhật Nguyên") continue;
      dem.set(tt, (dem.get(tt) ?? 0) + 1);
    }
  }
  return [...dem.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
}

/**
 * Dự phòng cho 1 Đại Vận khi AI để trống dungHy/chuDe/mucThuan — tính DỨT KHOÁT bằng công thức, y hệt
 * tinh thần bat-tu-engine: so Ngũ Hành của Đại Vận với Dụng/Hỷ/Kỵ/Cừu Thần đã có (không cần AI), và
 * suy chủ đề theo mốc tuổi đời phổ biến. Không để trống toàn bộ timeline khi AI im lặng.
 */
export function suyDaiVanDuPhong(
  canNguHanhVan: "kim" | "moc" | "thuy" | "hoa" | "tho",
  dungThan: string, hyThan: string, kyThan: string, cuuThan: string,
  tuTuoi: number,
): { dungHy: "dung" | "hy" | "trung" | "ky"; chuDe: string; mucThuan: "cao" | "trung_binh" | "thap" } {
  const dungHy: "dung" | "hy" | "trung" | "ky" =
    canNguHanhVan === dungThan ? "dung"
    : canNguHanhVan === hyThan ? "hy"
    : canNguHanhVan === kyThan || canNguHanhVan === cuuThan ? "ky"
    : "trung";
  const mucThuan = dungHy === "dung" ? "cao" as const : dungHy === "ky" ? "thap" as const : "trung_binh" as const;
  const chuDe = tuTuoi < 22 ? "hoc_tap" : tuTuoi < 52 ? "su_nghiep" : tuTuoi < 62 ? "tai_van" : "suc_khoe";
  return { dungHy, chuDe, mucThuan };
}

export function chayEngineBatTu(facts: BatTuFacts): EngineBatTu {
  const tt: TuTruInput = {
    nam: { can: facts.tuTru.nam.can, chi: facts.tuTru.nam.chi },
    thang: { can: facts.tuTru.thang.can, chi: facts.tuTru.thang.chi },
    ngay: { can: facts.tuTru.ngay.can, chi: facts.tuTru.ngay.chi },
    gio: { can: facts.tuTru.gio.can, chi: facts.tuTru.gio.chi },
    gioiTinh: facts.gioiTinh === "Nữ" ? "Nữ" : "Nam",
  };
  const r = phanTichBatTu(tt);
  return {
    vuong_suy: VUONGSUY_KEY[r.vuongSuy.capDo] ?? "insufficient_data",
    dung_than: HANH_KEY[r.dungThan.dungThan],
    hy_than: HANH_KEY[r.dungThan.hyThan],
    ky_than: HANH_KEY[r.dungThan.kyThan],
    cuu_than: HANH_KEY[r.dungThan.cuuThan],
    capDoLabel: r.vuongSuy.capDo,
    phuongPhap: r.dungThan.phuongPhap,
    thap_than_noi_bat: thapThanNoiBat(facts),
    dienGiai: [...r.vuongSuy.dienGiai, ...r.dungThan.dienGiai],
  };
}
