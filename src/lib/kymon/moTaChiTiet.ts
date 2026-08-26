// Helper dùng chung cho TOÀN BỘ module Hỏi Đáp Kỳ Môn (hoiDap*.ts) — dựng phần "chi tiết kỹ
// thuật" ĐẦY ĐỦ cho mỗi dụng thần được nhắc tới trong 1 kết luận, thay vì chỉ nêu tên quan hệ suông
// (vd "Trực Phù khắc Trực Sử"). Mỗi dụng thần được mô tả full: hướng cung, Sao/Môn/Thần, Can thiên
// bàn/địa bàn, cờ Không Vong/Nhập Mộ, và tra thêm Cách Cục (bảng 81 tổ hợp Can/Can đã có sẵn) nếu
// cung đó không phải Trung cung.

import type { CungInfo } from "./types";
import { traCachCuc } from "./cachCuc";

export const TEN_SAO: Record<string, string> = {
  "T.Bồng": "Thiên Bồng", "T.Nhuế": "Thiên Nhuế", "T.Xung": "Thiên Xung", "T.Phò": "Thiên Phụ",
  "T.Tâm": "Thiên Tâm", "T.Trụ": "Thiên Trụ", "T.Nhậm": "Thiên Nhậm", "T.Anh": "Thiên Anh",
};
export const TEN_MON: Record<string, string> = {
  HƯU: "Hưu", TỬ: "Tử", THƯƠNG: "Thương", ĐỖ: "Đỗ", CẢNH: "Cảnh", SINH: "Sinh", KINH: "Kinh", KHAI: "Khai",
};
export const TEN_THAN: Record<string, string> = {
  "T.Phù": "Trực Phù", "Đ.Xà": "Đằng Xà", "T.Âm": "Thái Âm", "L.Hợp": "Lục Hợp",
  "B.Hổ": "Bạch Hổ", "H.Vũ": "Huyền Vũ", "C.Địa": "Cửu Địa", "C.Thiên": "Cửu Thiên",
};

// NHẬP MỘ (Kỳ Môn) — trùng bảng dùng trong luanGiaiMenh.ts/các module hoiDap*.ts khác.
const NHAP_MO: Record<string, number> = {
  Giáp: 2, Quý: 2, Ất: 6, Bính: 6, Mậu: 6, Đinh: 8, Kỷ: 8, Canh: 8, Tân: 4, Nhâm: 4,
};
export function laNhapMo(c: CungInfo): boolean {
  return NHAP_MO[c.thienBanCan] === c.soCung;
}

/** Mô tả ĐẦY ĐỦ 1 cung: hướng, Sao/Môn/Thần, Can thiên bàn/địa bàn, cờ Không Vong/Nhập Mộ, và
 * Cách Cục (nếu tra được). Dùng cho phần "chi tiết kỹ thuật" — khác với văn bản chính (luôn diễn
 * giải đời thường, không lộ thuật ngữ). */
export function moTaCungDay(cung: CungInfo): string {
  const sao = TEN_SAO[cung.saoThienBan] ?? cung.saoThienBan;
  const mon = TEN_MON[cung.mon] ?? cung.mon;
  const than = TEN_THAN[cung.than] ?? cung.than;
  const coChu: string[] = [];
  if (cung.KV) coChu.push("Không Vong");
  if (laNhapMo(cung)) coChu.push("Nhập Mộ");
  const ghiChu = coChu.length ? `, ${coChu.join(", ")}` : "";
  const cachCuc = cung.soCung !== 5 ? traCachCuc(cung.thienBanCan, cung.diaBanCan) : undefined;
  const cachCucText = cachCuc ? ` — cách cục "${cachCuc.ten}" (${cachCuc.yNghia})` : "";
  return `${cung.huong} — Sao ${sao}, ${mon} Môn, Thần ${than} (thiên bàn ${cung.thienBanCan}, địa bàn ${cung.diaBanCan}${ghiChu})${cachCucText}`;
}

/**
 * Dựng field "chiTiet" đầy đủ cho 1 kết luận Hỏi Đáp: liệt kê chi tiết TỪNG dụng thần đã dùng để
 * suy luận (có nhãn, vd "Trực Phù", "Can Ngày"), sau đó nêu kết luận quan hệ + trích dẫn nguồn.
 *
 * @param dungThan Danh sách dụng thần đã xét, mỗi mục {nhan, cung}. Bỏ qua mục có cung undefined.
 * @param ketLuanQuanHe Câu kết luận quan hệ ngắn gọn (vd "Trực Phù khắc Trực Sử — dấu hiệu vay được").
 * @param nguon Trích dẫn nguồn (tên file + mục, vd "a4-vay-va-cho-muon-tien.md, mục I").
 */
export function chiTietDayDu(
  dungThan: { nhan: string; cung: CungInfo | undefined }[],
  ketLuanQuanHe: string,
  nguon: string,
): string {
  const phan = dungThan
    .filter((d): d is { nhan: string; cung: CungInfo } => !!d.cung)
    .map(({ nhan, cung }) => `${nhan}: ${moTaCungDay(cung)}`)
    .join(". ");
  return `${phan}. → ${ketLuanQuanHe} (${nguon}).`;
}
