/**
 * CUNG PHI (MỆNH QUÁI) BÁT TRẠCH — công thức tính từ năm sinh dương lịch + giới tính, và bảng
 * Đông/Tây Tứ Mệnh. Nguồn: skill nội bộ `bat-trach-luan-nha` (đúc kết từ Bát Trạch Chân Pháp
 * Bí Truyền + Giáo Trình Bát Trạch Tạ Hậu + tài liệu Học Viện Minh Việt, đã đối chiếu khớp các
 * ví dụ trong tài liệu gốc). Cung Phi KHÁC Mệnh Nạp Âm (Kim/Mộc/Thủy/Hỏa/Thổ theo Bát Tự) — 2
 * khái niệm độc lập, không được nhầm lẫn.
 */
import type { Data } from "@thien-anh/calendar-core";

type NguHanh = Data.NguHanh;

export type CungBatTrach = "Càn" | "Khảm" | "Cấn" | "Chấn" | "Tốn" | "Ly" | "Khôn" | "Đoài";
export type GioiTinh = "nam" | "nu";

export const CUNG_BAT_TRACH_NGU_HANH: Record<CungBatTrach, NguHanh> = {
  Càn: "Kim",
  Khảm: "Thủy",
  Cấn: "Thổ",
  Chấn: "Mộc",
  Tốn: "Mộc",
  Ly: "Hỏa",
  Khôn: "Thổ",
  Đoài: "Kim",
};

export const DONG_TU_MENH: readonly CungBatTrach[] = ["Khảm", "Ly", "Chấn", "Tốn"];
export const TAY_TU_MENH: readonly CungBatTrach[] = ["Càn", "Khôn", "Cấn", "Đoài"];

const SO_SANG_CUNG: Partial<Record<number, CungBatTrach>> = {
  1: "Khảm",
  2: "Khôn",
  3: "Chấn",
  4: "Tốn",
  6: "Càn",
  7: "Đoài",
  8: "Cấn",
  9: "Ly",
};

function tongChuSo(namSinh: number): number {
  let x = Math.abs(namSinh);
  while (x >= 10) {
    x = String(x)
      .split("")
      .reduce((tong, chuSo) => tong + Number(chuSo), 0);
  }
  return x;
}

/** Cung Phi (Mệnh Quái) từ năm sinh DƯƠNG LỊCH + giới tính — công thức áp dụng cho mọi năm sinh. */
export function calculateCungPhi(namSinhDuongLich: number, gioiTinh: GioiTinh): CungBatTrach {
  if (!Number.isInteger(namSinhDuongLich) || namSinhDuongLich < 1) {
    throw new Error(`Năm sinh không hợp lệ: ${namSinhDuongLich}.`);
  }
  const tong = tongChuSo(namSinhDuongLich);

  let so: number;
  if (gioiTinh === "nam") {
    so = 11 - tong;
    // Nguồn (skill bat-trach-luan-nha) chỉ nêu "nếu ra số ≤ 0, cộng thêm 9" — nhưng vì tong
    // luôn thuộc [1,9] nên so = 11-tong luôn thuộc [2,10], KHÔNG BAO GIỜ ≤ 0 trên thực tế
    // (vd. năm 1900: tong=1 -> so=10). Trường hợp so=10 rơi ngoài bảng 1-9 mà nguồn chưa nêu
    // rõ cách xử lý — áp dụng đúng phép đóng vòng đối xứng mà nguồn đã dùng cho công thức Nữ
    // ("nếu ra số > 9, trừ đi 9"), vì cùng là hệ khóa mod-9 khép kín 1-9.
    if (so <= 0) so += 9;
    else if (so > 9) so -= 9;
  } else {
    so = 4 + tong;
    if (so > 9) so -= 9;
  }

  if (so === 5) return gioiTinh === "nam" ? "Khôn" : "Cấn";
  const cung = SO_SANG_CUNG[so];
  if (!cung) throw new Error(`Không tra được Cung Phi từ số ${so} (năm sinh ${namSinhDuongLich}, ${gioiTinh}).`);
  return cung;
}

export function isDongTuMenh(cung: CungBatTrach): boolean {
  return (DONG_TU_MENH as readonly CungBatTrach[]).includes(cung);
}

export function isTayTuMenh(cung: CungBatTrach): boolean {
  return (TAY_TU_MENH as readonly CungBatTrach[]).includes(cung);
}
