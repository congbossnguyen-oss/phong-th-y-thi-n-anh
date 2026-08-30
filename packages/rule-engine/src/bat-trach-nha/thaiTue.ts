/**
 * BÁT TRẠCH NHÀ — Thái Tuế/Tuế Phá/Tam Sát theo phương vị (năm cần xem) + Đô Thiên (Can năm sinh
 * gia chủ). Nguồn: gói build `data/05-hung-sat-cao-cap.md` mục 3-4.
 *
 * ⚠️ Ghi chú GHI-CHU: data/05 mục 3 có cột "Trực Thái Tuế"/"Tam Hợp" viết dạng tên ghép Quái+Chi
 * (vd. "Cấn Dần", "Khôn Thân") — không phải Can-Chi năm thực (1 Chi lặp lại mỗi 12 năm nhưng
 * không phải lúc nào cũng đi cùng 1 Can cố định, vd năm Tý không phải lúc nào cũng là Nhâm Tý).
 * Định dạng này nhiều khả năng là quy ước ghi sơn trên la bàn 24 sơn, không phải phát biểu Can-
 * Chi năm — KHÔNG suy diễn lại cột đó. Phần THỰC SỰ dùng được (và đã có sẵn, đã kiểm chứng trong
 * hệ thống — nguyên tắc bao-trùm) là PHƯƠNG VỊ Thái Tuế/Tuế Phá/Tam Sát theo Chi năm, tái sử dụng
 * `cung-menh-bat-trach/thaiTueTamSat.ts` (kiến thức cổ điển tiêu chuẩn, không có dị bản trường
 * phái — không phải phần trích riêng từ skill `bat-trach-luan-nha`, nhưng khớp đúng bản chất mô
 * tả trong data/05 mục 3: "Thái Tuế tọa phương ứng Chi năm, Tuế Phá đối xung").
 */
import { getGanzhiYear, type Data } from "@thien-anh/calendar-core";
import { getThaiTueCung, getTuePhaCung, getTamSatCung, type PhuongViRuiRoTheoNam } from "../cung-menh-bat-trach/thaiTueTamSat.js";

type Can = Data.Can;
type Chi = Data.Chi;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * Can + Chi của 1 năm dương lịch theo quy ước "năm con giáp đại chúng" (ranh giới 1/1, KHÔNG
 * dùng Lập Xuân) — vì input chỉ là 1 con số năm, không phải ngày sinh/thời điểm chính xác. Cùng
 * quy ước đã dùng ở `scoring/tuoiHopLamAn.ts` cho tình huống giống hệt (chỉ có năm, không có
 * ngày).
 */
export function canChiNamDaiChung(nam: number): { can: Can; chi: Chi } {
  const pillar = getGanzhiYear({ year: nam, month: 1, day: 1, hour: 12, timeZone: DEFAULT_TIME_ZONE }, { yearBoundary: "calendar" });
  return { can: pillar.can, chi: pillar.chi };
}

export interface KetQuaThaiTuePhuongVi extends PhuongViRuiRoTheoNam {
  nam: number;
}

/** Thái Tuế/Tuế Phá/Tam Sát đóng tại phương nào trong 1 năm dương lịch cụ thể. */
export function tinhThaiTuePhuongVi(nam: number): KetQuaThaiTuePhuongVi {
  const { chi } = canChiNamDaiChung(nam);
  return {
    nam,
    namChi: chi,
    thaiTueCung: getThaiTueCung(chi),
    tuePhaCung: getTuePhaCung(chi),
    tamSatCung: getTamSatCung(chi),
  };
}

// -----------------------------------------------------------------------------------------------
// Đô Thiên — theo Can năm SINH của gia chủ (data/05 mục 4), khác Thái Tuế (theo Chi năm CẦN XEM).
// -----------------------------------------------------------------------------------------------
const DO_THIEN_THEO_CAN: readonly { can: readonly [Can, Can]; son: readonly [Chi, Chi] }[] = [
  { can: ["Giáp", "Kỷ"], son: ["Thìn", "Tỵ"] },
  { can: ["Ất", "Canh"], son: ["Dần", "Mão"] },
  { can: ["Bính", "Tân"], son: ["Tuất", "Hợi"] },
  { can: ["Đinh", "Nhâm"], son: ["Thân", "Dậu"] },
  { can: ["Mậu", "Quý"], son: ["Ngọ", "Mùi"] },
];

export interface KetQuaDoThien {
  canNamSinh: Can;
  sonDoThien: [Chi, Chi];
}

/** Đô Thiên tại 2 sơn nào, theo Can năm sinh gia chủ (quy ước "năm con giáp đại chúng"). */
export function tinhDoThien(namSinh: number): KetQuaDoThien {
  const { can } = canChiNamDaiChung(namSinh);
  const nhom = DO_THIEN_THEO_CAN.find((n) => (n.can as readonly Can[]).includes(can));
  if (!nhom) throw new Error(`Không xác định được nhóm Đô Thiên cho Can ${can}.`);
  return { canNamSinh: can, sonDoThien: [...nhom.son] as [Chi, Chi] };
}
