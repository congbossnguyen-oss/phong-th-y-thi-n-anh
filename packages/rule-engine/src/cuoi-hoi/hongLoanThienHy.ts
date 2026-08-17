/**
 * CƯỚI HỎI — Hồng Loan / Thiên Hỷ (đặc tả `modulengaycuoihoitonghop final.md` mục 14a, 14b).
 *
 * Đây là phần DUY NHẤT của module cưới hỏi chưa có sẵn ở tầng dùng chung — mọi thứ còn lại
 * (Hoàng Đạo, 28 tú, Trực, thần sát, Tiểu Lục Nhâm, xuất hành, hợp tuổi cặp đôi) đều đã số hoá,
 * xem ghi chú khảo sát ở `cuoiHoi.ts`.
 *
 * ⚠️ HAI LỚP, KHÔNG ĐƯỢC TRỘN (mục 14a — chủ dự án chốt):
 *   Lớp 1 — CÁ NHÂN: tra từ Chi NĂM SINH của cô dâu / chú rể, rồi so với Chi NGÀY đang xét.
 *           Đây là lớp chính, quyết định tính cá nhân hoá của cả module.
 *   Lớp 2 — LƯU NIÊN: tra từ Chi của NĂM đang xét. Chỉ là bối cảnh, KHÔNG được tự đứng riêng để
 *           kết luận "hôm nay ngày Hồng Loan nên tốt cho tất cả mọi người".
 *
 * Hai lớp dùng CHUNG đúng một hàm tra, chỉ khác đầu vào — không viết hai hàm riêng.
 */
import type { Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

/** Thứ tự Địa Chi chuẩn, dùng để tính đối xung bằng index. */
const CHI_12: readonly Chi[] = [
  "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi",
];

/**
 * BẢNG GỐC DUY NHẤT CẦN LƯU — chỉ Hồng Loan (mục 14b).
 *
 * Chi năm → Chi có Hồng Loan. Đọc theo chiều nghịch từ Mão: Tý→Mão, Sửu→Dần, Dần→Sửu, Mão→Tý...
 */
export const HONG_LOAN_THEO_CHI_NAM: Readonly<Record<Chi, Chi>> = {
  Tý: "Mão",
  Sửu: "Dần",
  Dần: "Sửu",
  Mão: "Tý",
  Thìn: "Hợi",
  Tỵ: "Tuất",
  Ngọ: "Dậu",
  Mùi: "Thân",
  Thân: "Mùi",
  Dậu: "Ngọ",
  Tuất: "Tỵ",
  Hợi: "Thìn",
};

/**
 * Tên ruleset — đặt tường minh để người đọc code sau này không nhầm nguồn (mục 14b).
 *
 * ⚠️ Trong hệ thống còn một bảng Thiên Hỷ KHÁC (tài liệu Bát Tự), cho kết quả KHÔNG đối xung với
 * Hồng Loan. Chủ dự án đã chốt: module cưới hỏi dùng công thức đối xung, KHÔNG dùng bảng kia.
 * Không sửa/xoá bảng kia — nó thuộc mục đích khác.
 */
export const HONG_LOAN_RULESET = "YEAR_BRANCH_HONG_LOAN" as const;
export const THIEN_HY_RULESET = "HONG_LOAN_OPPOSITE" as const;

/** Chi đối xung: Tý↔Ngọ, Sửu↔Mùi, Dần↔Thân, Mão↔Dậu, Thìn↔Tuất, Tỵ↔Hợi. */
export function chiDoiXung(chi: Chi): Chi {
  const i = CHI_12.indexOf(chi);
  if (i < 0) throw new Error(`Chi không hợp lệ: ${chi}`);
  return CHI_12[(i + 6) % 12]!;
}

/** Tra Hồng Loan từ một Chi — dùng chung cho cả Lớp 1 (năm sinh) lẫn Lớp 2 (năm đang xét). */
export function getHongLoan(chiNam: Chi): Chi {
  const ra = HONG_LOAN_THEO_CHI_NAM[chiNam];
  if (!ra) throw new Error(`Chi không hợp lệ: ${chiNam}`);
  return ra;
}

/**
 * Thiên Hỷ KHÔNG tra bảng riêng — luôn suy từ Hồng Loan bằng đối xung (mục 14b).
 * Nhờ vậy không bao giờ xảy ra cảnh hai bảng lệch nhau.
 */
export function getThienHy(chiNam: Chi): Chi {
  return chiDoiXung(getHongLoan(chiNam));
}

export interface HyTinhCuaNguoi {
  hongLoan: Chi;
  thienHy: Chi;
}

export function hyTinhTuChiNam(chiNam: Chi): HyTinhCuaNguoi {
  const hongLoan = getHongLoan(chiNam);
  return { hongLoan, thienHy: chiDoiXung(hongLoan) };
}

export interface KetQuaHyTinhNgay {
  /** Ngày chạm Hồng Loan / Thiên Hỷ của CÔ DÂU. */
  coDauHongLoan: boolean;
  coDauThienHy: boolean;
  /** Ngày chạm Hồng Loan / Thiên Hỷ của CHÚ RỂ. */
  chuReHongLoan: boolean;
  chuReThienHy: boolean;
  /** Lớp 2 — hỷ tinh của chính năm đang xét. Bối cảnh phụ. */
  luuNienHongLoan: boolean;
  luuNienThienHy: boolean;
  /** Số điều kiện CÁ NHÂN (lớp 1) mà ngày này chạm — 0 đến 4. */
  soDieuKienCaNhan: number;
  /** true khi chạm từ 2 điều kiện cá nhân trở lên (mục 14a "song hỷ"). */
  songHy: boolean;
  /** Câu mô tả cho khách đọc; rỗng khi ngày không chạm gì. */
  moTa: string[];
}

/**
 * Xét hỷ tinh cho MỘT ngày.
 *
 * @param chiNgay      Chi của ngày đang xét.
 * @param chiNamCoDau  Chi năm sinh cô dâu.
 * @param chiNamChuRe  Chi năm sinh chú rể.
 * @param chiNamXet    Chi của NĂM chứa ngày đang xét (cho lớp lưu niên).
 */
export function xetHyTinhNgay(
  chiNgay: Chi,
  chiNamCoDau: Chi,
  chiNamChuRe: Chi,
  chiNamXet: Chi,
): KetQuaHyTinhNgay {
  const coDau = hyTinhTuChiNam(chiNamCoDau);
  const chuRe = hyTinhTuChiNam(chiNamChuRe);
  const luuNien = hyTinhTuChiNam(chiNamXet);

  const coDauHongLoan = chiNgay === coDau.hongLoan;
  const coDauThienHy = chiNgay === coDau.thienHy;
  const chuReHongLoan = chiNgay === chuRe.hongLoan;
  const chuReThienHy = chiNgay === chuRe.thienHy;

  const soDieuKienCaNhan = [coDauHongLoan, coDauThienHy, chuReHongLoan, chuReThienHy].filter(Boolean).length;

  const moTa: string[] = [];
  if (coDauHongLoan) moTa.push("Hồng Loan của cô dâu");
  if (coDauThienHy) moTa.push("Thiên Hỷ của cô dâu");
  if (chuReHongLoan) moTa.push("Hồng Loan của chú rể");
  if (chuReThienHy) moTa.push("Thiên Hỷ của chú rể");

  const luuNienHongLoan = chiNgay === luuNien.hongLoan;
  const luuNienThienHy = chiNgay === luuNien.thienHy;
  // Nói rõ đây là lưu niên, để không ai đọc nhầm thành "hợp riêng cô dâu/chú rể".
  if (luuNienHongLoan) moTa.push("Hồng Loan lưu niên (của năm, không riêng ai)");
  if (luuNienThienHy) moTa.push("Thiên Hỷ lưu niên (của năm, không riêng ai)");

  return {
    coDauHongLoan,
    coDauThienHy,
    chuReHongLoan,
    chuReThienHy,
    luuNienHongLoan,
    luuNienThienHy,
    soDieuKienCaNhan,
    songHy: soDieuKienCaNhan >= 2,
    moTa,
  };
}
