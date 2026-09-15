// V3-17 — METHOD-SPECIFIC YEAR CONTRACTS (Human-ratified V3-16: D1 Option C, D2/D3/D4/D5, D8=B).
//
// MỤC ĐÍCH: khai báo TƯỜNG MINH quy ước năm (Year Contract) cho từng hệ phương pháp, để không còn
// biến `year: number` trần trụi đi xuyên ranh giới phương pháp (nguyên tắc C/D của V3-16). File này CHỈ
// KHAI BÁO + gắn nhãn metadata — KHÔNG đổi thuật toán, KHÔNG tính lại giá trị nào (nguyên tắc E/G).
//
// Bối cảnh nghiên cứu: V3-12/V3-14/V3-15/V3-16 (reports/V31x_*). QUAN TRỌNG:
//   - Tử Vi Natal = LUNAR_TET (ranh giới Tết) — "lựa chọn phương pháp của Thiên Anh, RECOMMENDED, KHÔNG
//     phải chân lý cổ điển đã chứng minh" (D2). KHÔNG khẳng định chứng cứ L1.
//   - Bát Tự Trụ Năm/Tháng = GANZHI_LICH_XUAN (Lập Xuân) — giữ nguyên (D3).
//   - Bát Trạch Mệnh Quái = GANZHI_LICH_XUAN (Lập Xuân) — V3-10, KHÔNG đồng bộ với Tử Vi Natal (D4).
//   - Lưu Niên + Lưu Tứ Hóa = GANZHI_CALENDAR_BOUNDARY (nhãn 1/1) — input chỉ-năm, KHÔNG phải ranh giới
//     cổ điển đã chứng minh, KHÔNG dùng Lập Xuân (D5).
import type { MethodYearRequest, YearConvention } from "@thien-anh/calendar-core";

// ── Branded (nominal) year types — chặn compile-time việc truyền nhầm năm giữa các hệ ──────────────
// Năm đã DẪN XUẤT của hệ này KHÔNG gán được sang hệ khác (brand khác nhau); `number` trần cũng không
// gán được vào bất kỳ brand nào. Runtime = number thuần (brand bị xóa khi biên dịch, chi phí 0).
declare const __yearBrand: unique symbol;
export type BrandedYear<K extends string> = number & { readonly [__yearBrand]: K };
export type TuViNatalYear = BrandedYear<"tu-vi.natal.ganzhi_lunar_tet">;
export type BatuYearPillarYear = BrandedYear<"bat-tu.year-pillar.lich_xuan">;
export type BatTrachMenhQuaiYear = BrandedYear<"bat-trach.cung-phi.lich_xuan">;
export type LuuNienYear = BrandedYear<"luu-nien.ganzhi_1_1">;
/** Đóng dấu 1 số năm đã dẫn xuất thành brand tương ứng (chỉ dùng sau khi đã resolve qua contract). */
export function brandYear<K extends string>(n: number): BrandedYear<K> {
  return n as BrandedYear<K>;
}

// ── Declared MethodYearRequest cho từng thành phần (mẫu giống BAT_TRACH_MENH_QUAI_YEAR ở V3-10) ─────
export const TUVI_NATAL_YEAR: MethodYearRequest = { method: "tu-vi.natal", convention: "GANZHI_LUNAR_TET" };
export const BATU_YEAR_PILLAR_YEAR: MethodYearRequest = { method: "bat-tu.year-pillar", convention: "GANZHI_LICH_XUAN" };
export const LUU_NIEN_YEAR: MethodYearRequest = { method: "luu-nien.can", convention: "GANZHI_CALENDAR_BOUNDARY" };
// Bát Trạch Mệnh Quái đã khai báo ở rule-engine (BAT_TRACH_MENH_QUAI_YEAR, GANZHI_LICH_XUAN, V3-10) —
// KHÔNG khai báo lại ở đây để tránh 2 nguồn sự thật.

// ── Metadata quy ước năm để phơi bày ra UI/API (D6) ────────────────────────────────────────────────
export interface QuyUocNam {
  /** Hệ phương pháp sở hữu quy ước này. */
  he: "tu-vi" | "bat-tu" | "bat-trach" | "luu-nien";
  /** Quy ước năm canonical (enum calendar-core). */
  convention: YearConvention;
  /** Nhãn ngắn cho người dùng (KHÔNG phải khẳng định chân lý cổ điển). */
  nhan: string;
  /** true = đây là lựa chọn phương pháp được KHUYẾN NGHỊ, KHÔNG phải đã chứng minh L1 (D2/D5). */
  recommendedNotProven: boolean;
  /** Ghi chú tùy chọn (vd Mệnh Quái là thành phần Bát Trạch nhúng). */
  ghiChu?: string;
}

/** Tử Vi Natal — ranh giới Tết (lựa chọn Thiên Anh, RECOMMENDED ≠ PROVEN). */
export const TUVI_NATAL_QUY_UOC: QuyUocNam = {
  he: "tu-vi",
  convention: "GANZHI_LUNAR_TET",
  nhan: "Tết (Âm lịch)",
  recommendedNotProven: true,
  ghiChu: "Năm sinh Tử Vi tính theo ranh giới Mùng 1 Tết — lựa chọn phương pháp của Thiên Anh, chưa có nguồn cổ điển L1 chốt ranh giới.",
};

/** Bát Tự Trụ Năm — ranh giới Lập Xuân (giữ nguyên, D3). */
export const BATU_QUY_UOC: QuyUocNam = {
  he: "bat-tu",
  convention: "GANZHI_LICH_XUAN",
  nhan: "Lập Xuân",
  recommendedNotProven: false,
  ghiChu: "Trụ Năm/Tháng Bát Tự theo ranh giới Lập Xuân (Tứ Trụ/Tử Bình).",
};

/** Lưu Niên + Lưu Tứ Hóa — nhãn Can Chi 1/1 (input chỉ-năm, D5). */
export function luuNienQuyUoc(namXem: number): QuyUocNam & { nam: number } {
  return {
    he: "luu-nien",
    convention: "GANZHI_CALENDAR_BOUNDARY",
    nhan: "Can Chi 1/1 (năm dương lịch)",
    recommendedNotProven: true,
    nam: namXem,
    ghiChu: "Lưu Niên theo nhãn năm dương lịch (năm−4) — tiện dụng cho input chỉ-năm, KHÔNG phải ranh giới cổ điển đã chứng minh, KHÔNG dùng Lập Xuân.",
  };
}
