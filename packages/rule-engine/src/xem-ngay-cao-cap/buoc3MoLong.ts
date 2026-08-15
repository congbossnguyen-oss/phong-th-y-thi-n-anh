/**
 * XEM NGÀY CAO CẤP — Bước 3b (bổ sung): MỘ LONG BIẾN VẬN SÁT (Hồng Phạm Ngũ Hành).
 * Nguồn: skill xem-ngay-cao-cap/references/thai-tue-sat-mo-rong.md mục 3.
 *
 * Nguyên lý: so nạp âm ngũ hành của NĂM (Thái Tuế) với nạp âm ngũ hành của 4 "khố" (4 tháng Mộ:
 * Sửu - Thìn - Mùi - Tuất) trong chính năm đó.
 *   - Thái Tuế SINH khố → cát
 *   - Khố KHẮC Thái Tuế → cát
 *   - **Thái Tuế KHẮC khố → HUNG**: mọi Long (sơn) thuộc nhóm ứng với khố đó bị phạm Mộ Long.
 *
 * Cách tính Can của 4 tháng khố: dùng NGŨ HỔ ĐỘN CHUẨN (Công đã chốt dùng cách này làm nguồn
 * chính thức, không dùng số liệu ví dụ gốc trong slide vì chúng lệch với cách tính chuẩn).
 *
 * ⚠️ Đây là bảng nhóm 24 sơn theo HỒNG PHẠM NGŨ HÀNH — KHÁC hoàn toàn Chính Ngũ Hành 24 sơn dùng
 * ở Bổ Long Tam Cục (Bước 2). Không được dùng lẫn 2 bảng.
 */
import { Data } from "@thien-anh/calendar-core";
import { getThangCanChiAmLich } from "../trach-nhat/thangCanChi.js";
import type { TenSon } from "./data/sonBatQuai.js";

type Chi = Data.Chi;
type NguHanhTen = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

/** 4 tháng Mộ (khố) và tháng âm lịch tương ứng. Tháng 1 ÂL = Dần, nên Sửu = tháng 12. */
const KHO_THEO_THANG_AL: readonly { kho: Chi; thangAL: number }[] = [
  { kho: "Sửu", thangAL: 12 },
  { kho: "Thìn", thangAL: 3 },
  { kho: "Mùi", thangAL: 6 },
  { kho: "Tuất", thangAL: 9 },
];

/**
 * Nhóm 24 sơn theo Hồng Phạm Ngũ Hành, mỗi nhóm có 1 vị trí Mộ Khố cố định.
 * Nguồn: thai-tue-sat-mo-rong.md mục 3, bảng "Nhóm 24 sơn theo Hồng Phạm Ngũ Hành".
 * Lưu ý: nhóm Thổ (Sửu/Quý/Khôn/Canh/Mùi) dùng chung khố Thìn với nhóm Thủy ("Thủy-Thổ đồng cục").
 */
export const NHOM_HONG_PHAM: readonly { son: readonly TenSon[]; hanh: NguHanhTen; kho: Chi }[] = [
  { son: ["Giáp", "Dần", "Thìn", "Tốn", "Tuất", "Tý", "Tân", "Thân"], hanh: "Thủy", kho: "Thìn" },
  { son: ["Sửu", "Quý", "Khôn", "Canh", "Mùi"], hanh: "Thổ", kho: "Thìn" },
  { son: ["Mão", "Cấn", "Tỵ"], hanh: "Mộc", kho: "Mùi" },
  { son: ["Càn", "Hợi", "Dậu", "Đinh"], hanh: "Kim", kho: "Sửu" },
  { son: ["Ngọ", "Nhâm", "Bính", "Ất"], hanh: "Hỏa", kho: "Tuất" },
];

/** Ngũ hành tương khắc: Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim, Kim khắc Mộc. */
const KHAC: Readonly<Record<NguHanhTen, NguHanhTen>> = {
  Mộc: "Thổ",
  Thổ: "Thủy",
  Thủy: "Hỏa",
  Hỏa: "Kim",
  Kim: "Mộc",
};

function napAmCuaCanChi(canIndex: number, chiIndex: number): NguHanhTen {
  // cycleIndex trong Lục Thập Hoa Giáp từ cặp (Can, Chi).
  let cycle = -1;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === canIndex && i % 12 === chiIndex) { cycle = i; break; }
  }
  if (cycle < 0) throw new Error(`Cặp Can/Chi không hợp lệ: can=${canIndex} chi=${chiIndex}`);
  return Data.napAmForCycleIndex(cycle).element as NguHanhTen;
}

export interface KhoBienVan {
  kho: Chi;
  canChiThang: string;
  napAm: NguHanhTen;
  /** true = Thái Tuế khắc khố này → các Long thuộc nhóm ứng khố này bị phạm Mộ Long. */
  biThaiTueKhac: boolean;
}

export interface KetQuaMoLong {
  napAmThaiTue: NguHanhTen;
  cacKho: KhoBienVan[];
  /** true nếu chính Tọa nhà đang xét bị phạm. */
  pham: boolean;
  lyDo: string;
}

/**
 * Kiểm Mộ Long Biến Vận Sát cho 1 Tọa sơn trong 1 năm.
 *
 * @param canNamIndex Index Thiên Can của năm (0=Giáp).
 * @param chiNamIndex Index Địa Chi của năm (0=Tý).
 * @param tenSon Tọa sơn cần xét.
 */
export function kiemMoLongBienVan(canNamIndex: number, chiNamIndex: number, tenSon: TenSon): KetQuaMoLong {
  const napAmThaiTue = napAmCuaCanChi(canNamIndex, chiNamIndex);
  const hanhBiKhac = KHAC[napAmThaiTue];

  const cacKho: KhoBienVan[] = KHO_THEO_THANG_AL.map(({ kho, thangAL }) => {
    const thang = getThangCanChiAmLich(canNamIndex, thangAL);
    const napAm = napAmCuaCanChi(thang.canIndex, thang.chiIndex);
    return {
      kho,
      canChiThang: `${Data.CAN[thang.canIndex]} ${Data.CHI[thang.chiIndex]}`,
      napAm,
      biThaiTueKhac: napAm === hanhBiKhac,
    };
  });

  const nhom = NHOM_HONG_PHAM.find((n) => (n.son as readonly TenSon[]).includes(tenSon));
  if (!nhom) {
    return { napAmThaiTue, cacKho, pham: false, lyDo: `Sơn ${tenSon} không có trong bảng Hồng Phạm Ngũ Hành — không xét được Mộ Long.` };
  }

  const khoCuaSon = cacKho.find((k) => k.kho === nhom.kho)!;
  const pham = khoCuaSon.biThaiTueKhac;
  return {
    napAmThaiTue,
    cacKho,
    pham,
    lyDo: pham
      ? `Tọa ${tenSon} thuộc nhóm ${nhom.hanh} (Hồng Phạm), mộ khố tại ${nhom.kho}. Khố ${nhom.kho} năm nay là ${khoCuaSon.canChiThang} nạp âm ${khoCuaSon.napAm}, bị Thái Tuế (nạp âm ${napAmThaiTue}) khắc → phạm Mộ Long Biến Vận.`
      : `Tọa ${tenSon} thuộc nhóm ${nhom.hanh}, mộ khố tại ${nhom.kho} (${khoCuaSon.canChiThang}, nạp âm ${khoCuaSon.napAm}) — Thái Tuế nạp âm ${napAmThaiTue} không khắc khố này.`,
  };
}
