/**
 * BÁT TRẠCH NHÀ — Hoàng Tuyền + Bát Sát (hung sát đặc biệt, tầng Cao Cấp).
 * Nguồn: gói build `data/05-hung-sat-cao-cap.md`. Cần độ số chính xác tới sơn 15° — KHÔNG dùng
 * số la bàn điện thoại chưa hiệu chỉnh (data/03).
 *
 * ⚠️ HAI SÁT NÀY LẤY MỐC KHÁC NHAU (anh Công đính chính 30/8/2026 — trước đó cả hai đều lấy Hướng,
 * làm Bát Sát ra NGƯỢC):
 * - **Hoàng Tuyền (Tứ Lộ Hoàng Tuyền, theo Can/Duy)** — theo **HƯỚNG** nhà. Khẩu quyết cổ dùng chữ
 *   "hướng" ("Canh Đinh Khôn HƯỚNG thị Hoàng Tuyền..."), và data/05 mục 1 cũng ghi cột "Hướng nhà".
 * - **Bát Sát (Tọa Sơn Bát Sát, theo con giáp)** — theo **TỌA** nhà (= trạch), KHÔNG theo hướng.
 *   Khẩu quyết cổ: "Khảm long, Khôn thỏ, Chấn sơn hầu, Tốn kê, Càn mã, Đoài xà đầu, Cấn hổ, Ly trư"
 *   — mỗi mục là 1 TRẠCH (tọa) ứng 1 con giáp. VD nhà **tọa Bắc (Khảm)** hướng Nam → Bát Sát tại
 *   **Thìn** (Long/rồng), KHÔNG phải Hợi (con giáp của Ly/hướng Nam).
 *
 * ⚠️ Nghi vấn số liệu Hoàng Tuyền (ghi vào GHI-CHU-CAN-CHU-SITE-XEM.md): data/05 liệt kê dòng
 * "Tốn | Bính" (chỉ 1 sơn) nhưng dòng đối xứng "Ất, Bính | Tốn" lại liệt kê 2 sơn — không đối
 * xứng với 3 nhóm còn lại (Khôn/Cấn/Càn đều đối xứng đủ 2 sơn cả 2 chiều). Xử lý: dùng dòng đầy
 * đủ hơn (Ất, Bính) cho cả 2 chiều, giữ cấu trúc 4 nhóm Tứ Lộ Hoàng Tuyền đối xứng đúng như 3
 * nhóm kia — KHÔNG tự bịa số liệu mới, chỉ chọn giữa 2 dòng đã có sẵn trong chính data/05.
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";
import { doToCung, doToSon, huongToToa, type Son24 } from "./toaHuong.js";

// -----------------------------------------------------------------------------------------------
// Hoàng Tuyền (Tứ Lộ Hoàng Tuyền) — theo HƯỚNG. Chỉ ở 8 Thiên Can + 4 Duy (Càn/Khôn/Cấn/Tốn),
// KHÔNG ở 12 Địa Chi.
// -----------------------------------------------------------------------------------------------
const HOANG_TUYEN_NHOM: readonly { son: readonly Son24[]; canhBao: string }[] = [
  { son: ["Khôn", "Canh", "Đinh"], canhBao: "Tứ Lộ Hoàng Tuyền nhóm Khôn — kỵ đặt cổng/đường nước tại Khôn ↔ Canh/Đinh." },
  { son: ["Tốn", "Ất", "Bính"], canhBao: "Tứ Lộ Hoàng Tuyền nhóm Tốn — kỵ đặt cổng/đường nước tại Tốn ↔ Ất/Bính." },
  { son: ["Cấn", "Giáp", "Quý"], canhBao: "Tứ Lộ Hoàng Tuyền nhóm Cấn — kỵ đặt cổng/đường nước tại Cấn ↔ Giáp/Quý." },
  { son: ["Càn", "Tân", "Nhâm"], canhBao: "Tứ Lộ Hoàng Tuyền nhóm Càn — kỵ đặt cổng/đường nước tại Càn ↔ Tân/Nhâm." },
];

export interface KetQuaHoangTuyen {
  apDung: boolean;
  /** Sơn hướng nhà (chỉ có ý nghĩa khi ápDụng — Hoàng Tuyền chỉ xét 8 Can + 4 Duy). */
  sonHuong?: Son24;
  canhBao?: string;
  /** 2 sơn kỵ đặt cổng/đường nước tại đó (không tính chính sơn hướng nhà). */
  sonKy?: Son24[];
}

/** Kiểm Hoàng Tuyền theo sơn của HƯỚNG nhà (data/05 mục 1). `sonHuong` lấy từ `doToSon(huongDo)`. */
export function kiemHoangTuyen(sonHuong: Son24): KetQuaHoangTuyen {
  const nhom = HOANG_TUYEN_NHOM.find((n) => n.son.includes(sonHuong));
  if (!nhom) {
    return { apDung: false };
  }
  return {
    apDung: true,
    sonHuong,
    canhBao: nhom.canhBao,
    sonKy: nhom.son.filter((s) => s !== sonHuong),
  };
}

// -----------------------------------------------------------------------------------------------
// Bát Sát (Tọa Sơn Bát Sát) — theo TỌA nhà (trạch), mỗi trạch 1 sơn phạm cụ thể trong 24 sơn.
// Data/05 mục 2. Bảng số (Khảm→Thìn, Ly→Hợi...) khớp khẩu quyết con giáp cổ; điểm SỬA 30/8/2026 là
// tra theo TỌA thay vì Hướng (trước đây tra nhầm theo Hướng → ra ngược).
// -----------------------------------------------------------------------------------------------
const BAT_SAT_THEO_TRACH: Record<CungBatTrach, { sonPham: Son24; anhHuong: string }> = {
  Khảm: { sonPham: "Thìn", anhHuong: "Bệnh tật, vợ chồng bất hòa" },
  Ly: { sonPham: "Hợi", anhHuong: "Nói xấu nhau, khó chăn nuôi" },
  Chấn: { sonPham: "Thân", anhHuong: "Dễ nghiện, gặp tai họa" },
  Đoài: { sonPham: "Tỵ", anhHuong: "Thiếu quý nhân, lộn xộn" },
  Khôn: { sonPham: "Mão", anhHuong: "Trộm cắp, mất của" },
  Cấn: { sonPham: "Dần", anhHuong: "Bất hòa, tài lộc giảm" },
  Tốn: { sonPham: "Dậu", anhHuong: "Ít tổ tiên phù trợ" },
  Càn: { sonPham: "Ngọ", anhHuong: "Tai nạn thương tích" },
};

export interface KetQuaBatSat {
  /** Cung TỌA nhà (trạch) — mốc để tra Bát Sát (KHÔNG phải cung hướng). */
  cungToa: CungBatTrach;
  sonPham: Son24;
  anhHuong: string;
}

/** Kiểm Bát Sát theo cung TỌA nhà (trạch) — data/05 mục 2, luôn áp dụng, đủ 8/8 trạch. */
export function kiemBatSat(cungToa: CungBatTrach): KetQuaBatSat {
  const r = BAT_SAT_THEO_TRACH[cungToa];
  return { cungToa, sonPham: r.sonPham, anhHuong: r.anhHuong };
}

export interface HungSatDacBiet {
  hoangTuyen: KetQuaHoangTuyen;
  batSat: KetQuaBatSat;
}

/**
 * Tổng hợp từ độ số HƯỚNG nhà: Hoàng Tuyền tra theo HƯỚNG, Bát Sát tra theo TỌA (= hướng + 180°).
 */
export function tinhHungSatDacBiet(huongDo: number): HungSatDacBiet {
  const sonHuong = doToSon(huongDo);
  const cungToa = doToCung(huongToToa(huongDo));
  return {
    hoangTuyen: kiemHoangTuyen(sonHuong),
    batSat: kiemBatSat(cungToa),
  };
}
