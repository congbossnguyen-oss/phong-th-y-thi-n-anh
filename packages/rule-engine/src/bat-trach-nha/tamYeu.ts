/**
 * BÁT TRẠCH NHÀ — Dương Trạch Tam Yếu (Cửa–Chủ–Bếp), tầng Cao Cấp. Nguồn: gói build
 * `data/04-bo-tri-va-hoa-giai.md` mục "Dương Trạch Tam Yếu".
 *
 * Quy ước Tọa×Môn: theo `data/00` MĐ-1 "lưu ý không đổi" — Tam Yếu LUÔN dùng CỬA làm Gốc (không
 * đổi theo cờ luanHopMenhTheo, cờ đó chỉ ảnh hưởng bước luận hợp mệnh gia chủ ở tầng Free).
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";
import { getKhiBatTrach, KHI_BAT_TRACH_INFO, type KhiBatTrach } from "../cung-menh-bat-trach/duNienBatQuai.js";

export interface DauVaoTamYeu {
  cuaCung: CungBatTrach;
  chuCung: CungBatTrach; // phòng ngủ chủ / Sơn Chủ nếu nhà động trạch
  bepCung: CungBatTrach; // tọa bếp = hướng lưng bếp, KHÔNG theo miệng bếp
}

export type DanhGiaBep = "dai-cat" | "tot-kem-mot-bac" | "tranh-tuyet-doi" | "binh-thuong";

function danhGiaBep(khiBep: KhiBatTrach): DanhGiaBep {
  if (khiBep === "dien-nien" || khiBep === "thien-y") return "dai-cat";
  if (khiBep === "sinh-khi") return "tot-kem-mot-bac";
  if (khiBep === "tuyet-menh" || khiBep === "ngu-quy") return "tranh-tuyet-doi";
  return "binh-thuong";
}

export interface KetQuaTamYeu {
  khiChu: KhiBatTrach;
  tenKhiChu: string;
  khiBep: KhiBatTrach;
  tenKhiBep: string;
  danhGiaBep: DanhGiaBep;
  ghiChuBep: string;
}

const GHI_CHU_DANH_GIA: Record<DanhGiaBep, string> = {
  "dai-cat": "Đại cát — bếp phối Cửa ra Diên niên/Thiên y, tốt nhất trong các lựa chọn.",
  "tot-kem-mot-bac": "Tốt, kém 1 bậc — bếp phối Cửa ra Sinh khí, vẫn dùng được.",
  "tranh-tuyet-doi": "Tuyệt đối tránh — bếp phối Cửa ra Tuyệt mệnh/Ngũ quỷ, nên đổi vị trí bếp nếu có thể.",
  "binh-thuong": "Bình thường — bếp phối Cửa ra Họa hại/Lục sát/Phục vị, không đại cát nhưng cũng không thuộc nhóm tối kỵ.",
};

/**
 * Bước 2-4 Dương Trạch Tam Yếu (data/04): Cửa làm Gốc, tra Du Niên với Chủ → "tên Trạch"; tra
 * với Bếp → khí Bếp, đánh giá cát/hung theo mức độ ưu tiên riêng của Bếp (khác thang cát/hung
 * thông thường — data/04 bước 4: Diên niên/Thiên y đại cát, Sinh khí kém 1 bậc, tối kỵ Tuyệt
 * mệnh/Ngũ quỷ dù các khí này ở vị trí khác có thể chỉ là "hung nhẹ/hung nặng" thông thường).
 */
export function tinhDuongTrachTamYeu(input: DauVaoTamYeu): KetQuaTamYeu {
  const khiChu = getKhiBatTrach(input.cuaCung, input.chuCung);
  const khiBep = getKhiBatTrach(input.cuaCung, input.bepCung);
  const dg = danhGiaBep(khiBep);
  return {
    khiChu,
    tenKhiChu: KHI_BAT_TRACH_INFO[khiChu].ten,
    khiBep,
    tenKhiBep: KHI_BAT_TRACH_INFO[khiBep].ten,
    danhGiaBep: dg,
    ghiChuBep: GHI_CHU_DANH_GIA[dg],
  };
}
