/**
 * XEM NGÀY CAO CẤP — Bước 6: chọn giờ. Nguồn: `hoang-dao-hac-dao-28-sao.md` mục A.2 (bản cập nhật
 * chủ dự án cung cấp 2026-08-15 — đã giải mã bài quyết Hán 12 chữ 道遠幾時通達路遙何日還程 và kiểm
 * chứng chéo 3 nguồn độc lập).
 *
 * Thuật toán khớp CHÍNH XÁC hàm `TrachNhat.getHoangDaoHacDaoGio` đã có sẵn trong rule-engine
 * (Thanh Long khởi theo nhóm Chi ngày, rồi 12 thần an thuận; 6 vị trí 1,2,5,6,8,11 là Hoàng Đạo)
 * — nên module này TÁI DÙNG hàm đó thay vì viết lại, tránh 2 nguồn sự thật lệch nhau.
 *
 * Sau khi chốt ngày mới chọn giờ. Nguyên tắc nguồn: "KHÔNG hy sinh chất lượng Ngày để lấy Giờ đẹp."
 * Thứ tự ưu tiên: giờ Hoàng Đạo → Chi giờ hợp cục với tọa (tam hợp/lục hợp) → không xung Chi ngày.
 */
import type { Data } from "@thien-anh/calendar-core";
import { getHoangDaoHacDaoGio } from "../trach-nhat/hoangDaoHacDaoGio.js";
import { phamTamSat } from "./buoc3PhuongViSat.js";
import type { PhuongChinh } from "./data/sonBatQuai.js";

type Chi = Data.Chi;

const CHI_12: readonly Chi[] = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

const LUC_XUNG: Readonly<Record<Chi, Chi>> = {
  Tý: "Ngọ", Sửu: "Mùi", Dần: "Thân", Mão: "Dậu", Thìn: "Tuất", Tỵ: "Hợi",
  Ngọ: "Tý", Mùi: "Sửu", Thân: "Dần", Dậu: "Mão", Tuất: "Thìn", Hợi: "Tỵ",
};

const LUC_HOP: Readonly<Record<Chi, Chi>> = {
  Tý: "Sửu", Sửu: "Tý", Dần: "Hợi", Hợi: "Dần", Mão: "Tuất", Tuất: "Mão",
  Thìn: "Dậu", Dậu: "Thìn", Tỵ: "Thân", Thân: "Tỵ", Ngọ: "Mùi", Mùi: "Ngọ",
};

const TAM_HOP_NHOM: readonly (readonly Chi[])[] = [
  ["Thân", "Tý", "Thìn"],
  ["Dần", "Ngọ", "Tuất"],
  ["Tỵ", "Dậu", "Sửu"],
  ["Hợi", "Mão", "Mùi"],
];

function laTamHop(a: Chi, b: Chi): boolean {
  return TAM_HOP_NHOM.some((n) => n.includes(a) && n.includes(b)) && a !== b;
}

export interface UngVienGio {
  chiGio: Chi;
  /** Khung giờ dân sự, vd "05:00-06:59". */
  khungGio: string;
  laHoangDao: boolean;
  tenSao: string;
  /** Chi giờ hợp cục với Chi của tọa (tam hợp / lục hợp) — tăng ưu tiên. */
  hopCucVoiToa: "tam-hop" | "luc-hop" | null;
  /** Giờ xung Chi ngày — nguồn khuyến cáo tránh. */
  xungChiNgay: boolean;
  /** Giờ phạm Tam Sát theo phương tọa (Tam Sát xét đủ 4 trụ, gồm cả trụ Giờ). */
  phamTamSatGio: boolean;
  diem: number;
}

function khungGioCuaChi(chiIndex: number): string {
  // Tý = 23:00-00:59, Sửu = 01:00-02:59, ... mỗi Chi phủ 2 tiếng.
  const batDau = (chiIndex * 2 + 23) % 24;
  const ketThuc = (batDau + 1) % 24;
  const hai = (n: number) => String(n).padStart(2, "0");
  return `${hai(batDau)}:00-${hai(ketThuc)}:59`;
}

export interface ChonGioInput {
  /** Chi của NGÀY đã chốt — quyết định vòng Hoàng Đạo giờ. */
  chiNgay: Chi;
  /** Chi của tọa nhà, nếu tọa là 1 trong 12 sơn Chi (sơn Can/Quái thì bỏ trống). */
  chiToa?: Chi;
  /** Phương của tọa — để xét Tam Sát ở trụ Giờ. Bỏ trống nếu chưa xác định được phương. */
  phuongToa?: PhuongChinh;
}

/**
 * Xếp hạng đủ 12 giờ Địa Chi của ngày đã chốt. Điểm: Hoàng Đạo +50 · tam hợp tọa +20 ·
 * lục hợp tọa +15 · xung Chi ngày −40 · phạm Tam Sát ở trụ Giờ −60 (Tam Sát là sát phủ quyết,
 * nguồn yêu cầu xét đủ 4 trụ nên giờ phạm phải bị loại xuống đáy chứ không chỉ trừ nhẹ).
 */
export function xepHangGio(input: ChonGioInput): UngVienGio[] {
  const chiNgayIndex = CHI_12.indexOf(input.chiNgay);
  if (chiNgayIndex < 0) throw new Error(`Chi ngày không hợp lệ: ${input.chiNgay}`);

  const ketQua: UngVienGio[] = CHI_12.map((chiGio, idx) => {
    const hd = getHoangDaoHacDaoGio(chiNgayIndex, idx);
    const laHoangDao = hd.catHung === "cát";

    let hopCucVoiToa: UngVienGio["hopCucVoiToa"] = null;
    if (input.chiToa) {
      if (laTamHop(chiGio, input.chiToa)) hopCucVoiToa = "tam-hop";
      else if (LUC_HOP[input.chiToa] === chiGio) hopCucVoiToa = "luc-hop";
    }

    const xungChiNgay = LUC_XUNG[input.chiNgay] === chiGio;
    const phamTamSatGio = input.phuongToa ? phamTamSat(input.phuongToa, chiGio) : false;

    let diem = 0;
    if (laHoangDao) diem += 50;
    if (hopCucVoiToa === "tam-hop") diem += 20;
    else if (hopCucVoiToa === "luc-hop") diem += 15;
    if (xungChiNgay) diem -= 40;
    if (phamTamSatGio) diem -= 60;

    return {
      chiGio,
      khungGio: khungGioCuaChi(idx),
      laHoangDao,
      tenSao: hd.name,
      hopCucVoiToa,
      xungChiNgay,
      phamTamSatGio,
      diem,
    };
  });

  return ketQua.sort((a, b) => b.diem - a.diem);
}
