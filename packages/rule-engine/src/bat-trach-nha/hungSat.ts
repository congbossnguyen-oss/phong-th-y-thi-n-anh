/**
 * BÁT TRẠCH NHÀ — Hoàng Tuyền + Bát Sát (hung sát đặc biệt theo hướng nhà, tầng Cao Cấp).
 * Nguồn: gói build `data/05-hung-sat-cao-cap.md`. Cần độ số chính xác tới sơn 15° — KHÔNG dùng
 * số la bàn điện thoại chưa hiệu chỉnh (data/03).
 *
 * ⚠️ Nghi vấn số liệu Hoàng Tuyền (ghi vào GHI-CHU-CAN-CHU-SITE-XEM.md): data/05 liệt kê dòng
 * "Tốn | Bính" (chỉ 1 sơn) nhưng dòng đối xứng "Ất, Bính | Tốn" lại liệt kê 2 sơn — không đối
 * xứng với 3 nhóm còn lại (Khôn/Cấn/Càn đều đối xứng đủ 2 sơn cả 2 chiều). Xử lý: dùng dòng đầy
 * đủ hơn (Ất, Bính) cho cả 2 chiều, giữ cấu trúc 4 nhóm Tứ Lộ Hoàng Tuyền đối xứng đúng như 3
 * nhóm kia — KHÔNG tự bịa số liệu mới, chỉ chọn giữa 2 dòng đã có sẵn trong chính data/05.
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";
import { doToCung, doToSon, type Son24 } from "./toaHuong.js";

// -----------------------------------------------------------------------------------------------
// Hoàng Tuyền (Tứ Lộ Hoàng Tuyền) — chỉ ở 8 Thiên Can + 4 Duy (Càn/Khôn/Cấn/Tốn), KHÔNG ở 12 Địa Chi.
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
// Bát Sát (theo hướng nhà — 8 cung, mỗi cung 1 sơn phạm cụ thể trong 24 sơn). Data/05 mục 2.
// -----------------------------------------------------------------------------------------------
const BAT_SAT_THEO_CUNG: Record<CungBatTrach, { sonPham: Son24; anhHuong: string }> = {
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
  cungHuong: CungBatTrach;
  sonPham: Son24;
  anhHuong: string;
}

/** Kiểm Bát Sát theo cung của HƯỚNG nhà (data/05 mục 2) — luôn áp dụng, đủ 8/8 cung. */
export function kiemBatSat(cungHuong: CungBatTrach): KetQuaBatSat {
  const r = BAT_SAT_THEO_CUNG[cungHuong];
  return { cungHuong, sonPham: r.sonPham, anhHuong: r.anhHuong };
}

export interface HungSatDacBiet {
  hoangTuyen: KetQuaHoangTuyen;
  batSat: KetQuaBatSat;
}

/** Tổng hợp Hoàng Tuyền + Bát Sát từ độ số HƯỚNG nhà. */
export function tinhHungSatDacBiet(huongDo: number): HungSatDacBiet {
  const sonHuong = doToSon(huongDo);
  const cungHuong = doToCung(huongDo);
  return {
    hoangTuyen: kiemHoangTuyen(sonHuong),
    batSat: kiemBatSat(cungHuong),
  };
}
