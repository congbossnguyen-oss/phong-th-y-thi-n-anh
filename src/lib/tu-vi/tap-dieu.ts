// PHASE 38 (docs/TUVI_PHASE38_TAP_DIEU.md) — FUTURE MODULE ADDENDUM, KHÔNG thuộc Natal Core đã LOCKED
// (Phase 31, xem docs/TUVI_NATAL_CORE_LOCK.md mục VI). File này CHỈ ĐỌC TuViChart (PUBLIC CHART MODEL),
// không import rules.ts để tính lại Chi/Can năm sinh hay Mệnh/Thân, không mutate chart, không phụ thuộc
// renderer. Không sửa engine.ts/rules.ts — mọi sao mới ở đây là phần BỔ SUNG, không đụng phụ tinh đã có.
//
// NGUỒN: hocvienlyso.org — bài "Tự học Tử vi đẩu số bài 12: An các sao theo chi năm sinh" (Level 1) và
// bài "Lưu Hà Kiếp Sát, Thiên Mã, Không Kiếp, Kình Đà, Linh Hỏa, Phá Toái, Cô Quả, Khốc Hư" (Level 2,
// tác giả Thiên Lương — cùng tác giả đã dùng làm nguồn Thiên Mã ở Phase 29). Chi tiết trích dẫn + cross-
// check xem docs/TUVI_PHASE38_TAP_DIEU.md.
//
// NGUỒN BỔ SUNG (đợt sau): sách "Tử Vi Tam Hợp Phái Tập 1" — Học Viện Phong Thủy Minh Việt (bản OCR do
// Công cung cấp) — dùng để: (1) lấp 2 sao trước đây "nguồn chưa đủ" (Ân Quang/Thiên Quý, Tam Thai/Bát
// Tọa — công thức tương đối theo Văn Xương/Văn Khúc/Tả Phù/Hữu Bật + ngày sinh, rõ ràng, 1 nguồn); (2)
// đối chiếu chéo — Thiên Quan/Thiên Phúc (theo Can) và Thiên Tài/Thiên Thọ/Đường Phù-Quốc Ấn/Cô Thần-Quả
// Tú/Phá Toái/Hoa Cái/Kiếp Sát/Thiên La-Địa Võng/Thiên Thương-Thiên Sứ/Thiên Giải đều KHỚP 100% với dữ
// liệu đã có — CONFIRMED bởi nguồn độc lập thứ 2; (3) phát hiện Lưu Hà có bảng thứ 3 hoàn toàn khác 2
// bảng đã ghi nhận — CỦNG CỐ (không giải quyết) trạng thái CONFLICTED, xem ghi chú tại
// LUU_HA_BY_CAN_THIEN_LUONG_UNCONFIRMED; (4) phát hiện Thai Phụ/Phong Cáo nguồn này cho CÔNG THỨC khác
// hẳn "Tử Vi Hàm Số" (Văn Khúc ±1 cung, KHÔNG quy về cùng kết quả) — XEM GHI CHÚ CONFLICT ngay tại
// thaiPhuIndex/phongCaoIndex bên dưới, chưa tự chọn bên.

import type { TuViChart } from "./engine";
import { CAN, CHI } from "../menh-nap-am";
import { mod12 } from "./rules";

export interface TapDieuPlacement {
  chiIndex: number;
  name: string;
}

// ============================================================================================
// Nhóm khởi theo Chi năm sinh, kể là Tý, đếm thuận/nghịch đến năm sinh (cùng cách diễn giải đã dùng
// cho Hồng Loan/Thiên Hỷ đã LOCKED — "nghịch" = start - yearChiIndex, "thuận" = start + yearChiIndex).
// ============================================================================================
const LONG_TRI_START = 4; // Thìn — nguồn: "Long Trì − Bắt đầu từ cung Thìn, kể là năm Tý, đếm theo chiều thuận"
const PHUONG_CAC_START = 10; // Tuất — nguồn: "Phượng Các − Bắt đầu từ cung Tuất... đếm theo chiều nghịch"
const THIEN_KHOC_START = 6; // Ngọ — nguồn: "Thiên Khốc: Bắt đầu từ cung Ngọ... đếm theo chiều nghịch"
const THIEN_HU_START = 6; // Ngọ — nguồn: "Thiên Hư: Bắt đầu từ cung Ngọ... đếm theo chiều thuận". Cross-
// check: nguồn ghi "Thiên Hư bao giờ cũng đồng cung với Tuế Phá" — Tuế Phá (vòng Thái Tuế đã LOCKED) =
// mod12(yearChiIndex + 6), TRÙNG chính xác công thức Thiên Hư ở đây — xác nhận double.
const THIEN_DUC_START = 9; // Dậu — nguồn: "Thiên Đức: Bắt đầu từ Dậu... đếm theo chiều thuận"
const NGUYET_DUC_START = 5; // Tỵ — nguồn: "Nguyệt Đức: Bắt đầu từ cung Tỵ... đếm theo chiều thuận"

export function longTriIndex(yearChiIndex: number): number { return mod12(LONG_TRI_START + yearChiIndex); }
export function phuongCacIndex(yearChiIndex: number): number { return mod12(PHUONG_CAC_START - yearChiIndex); }
export function thienKhocIndex(yearChiIndex: number): number { return mod12(THIEN_KHOC_START - yearChiIndex); }
export function thienHuIndex(yearChiIndex: number): number { return mod12(THIEN_HU_START + yearChiIndex); }
export function thienDucIndex(yearChiIndex: number): number { return mod12(THIEN_DUC_START + yearChiIndex); }
export function nguyetDucIndex(yearChiIndex: number): number { return mod12(NGUYET_DUC_START + yearChiIndex); }

// Thiên Tài/Thiên Thọ — nguồn: "Thiên Tài: Bắt đầu từ cung an Mệnh... đếm theo chiều thuận"; "Thiên Thọ:
// Bắt đầu từ cung an Thân... đếm theo chiều thuận". Đọc menhChiIndex/thanChiIndex có sẵn từ chart, KHÔNG
// tính lại Mệnh/Thân.
export function thienTaiIndex(menhChiIndex: number, yearChiIndex: number): number { return mod12(menhChiIndex + yearChiIndex); }
export function thienThoIndex(thanChiIndex: number, yearChiIndex: number): number { return mod12(thanChiIndex + yearChiIndex); }

// Thiên Không — nguồn (bài 15, Level 1): "An Thiên Không ở cung đằng trước cung đã an Thái Tuế. Thí dụ:
// Thái Tuế ở cung Mùi, an Thiên Không ở cung Thân" — Thái Tuế luôn tại yearChiIndex (đã LOCKED).
export function thienKhongIndex(yearChiIndex: number): number { return mod12(yearChiIndex + 1); }

// Thiên Giải/Địa Giải — nguồn (bài 13, Level 1): "Thiên Giải: Bắt đầu từ Thân, kể là tháng Giêng, đếm
// theo chiều thuận đến tháng sinh..."; "Địa Giải: Bắt đầu từ cung Mùi, kể là tháng Giêng, đếm theo chiều
// thuận đến tháng sinh...". Cùng bài 13 xác nhận lại ĐÚNG công thức Tả Phù/Hữu Bật/Thiên Hình/Thiên Diêu
// đã LOCKED sẵn (khởi Thìn/Tuất/Dậu/Sửu) — cross-check nguồn đáng tin cậy.
export function thienGiaiIndex(lunarMonth: number): number { return mod12(8 + (lunarMonth - 1)); }
export function diaGiaiIndex(lunarMonth: number): number { return mod12(7 + (lunarMonth - 1)); }
// Giải Thần — nguồn (bài 13): "Giải Thần: Phượng Các ở cung nào, an Giải Thần ở cung đó." — tái dùng
// đúng công thức Phượng Các đã có, KHÔNG tính lại bằng công thức khác.
export function giaiThanIndex(yearChiIndex: number): number { return phuongCacIndex(yearChiIndex); }

// Thiên La/Địa Võng — nguồn (bài 15, Level 1): "Thiên La: Bao giờ cũng an ở cung Thìn." "Địa Võng: Bao
// giờ cũng an ở cung Tuất." — vị trí CỐ ĐỊNH, không phụ thuộc Can/Chi/Mệnh/Thân.
export const THIEN_LA_CHI_INDEX = 4; // Thìn
export const DIA_VONG_CHI_INDEX = 10; // Tuất

// Thiên Sứ/Thiên Thương — nguồn (bài 15, Level 1): "Thiên Sứ: Bao giờ cũng an ở cung Tật ách."; "Thiên
// Thương: Bao giờ cũng an ở cung Nô bộc." — vị trí TƯƠNG ĐỐI theo cung đã đặt tên sẵn trong chart (Natal
// Core đã LOCKED), đọc read-only từ `chart.cungs`, KHÔNG tính lại offset nghịch từ Mệnh.
function findPalaceChiIndexByCungName(chart: TuViChart, cungName: string): number {
  const p = chart.cungs.find((c) => c.cungName === cungName);
  if (!p) throw new Error("RULE_NOT_DEFINED: không tìm thấy cung " + cungName + " trong chart");
  return p.chiIndex;
}
export function thienSuIndex(chart: TuViChart): number { return findPalaceChiIndexByCungName(chart, "Tật Ách"); }
export function thienThuongIndex(chart: TuViChart): number { return findPalaceChiIndexByCungName(chart, "Nô Bộc"); }

// Quốc Ấn/Đường Phù — nguồn (bài 10, Level 1): "Quốc Ấn: Bắt đầu từ cung an Lộc Tồn, kể là cung thứ
// nhất, đếm theo chiều thuận đến cung thứ chín..." (offset = 9-1 = 8); "Đường Phù: ...kể là cung thứ
// nhất, đếm theo chiều nghịch, đến cung thứ tám..." (offset = 8-1 = 7). Đọc vị trí Lộc Tồn có sẵn từ
// `chart.cungs[].phuTinh` (đã LOCKED), KHÔNG tính lại bằng LOC_TON_TABLE — đúng cách đã dùng cho Vòng Bác
// Sĩ ở Phase 32.
function findLocTonChiIndex(chart: TuViChart): number {
  const p = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Lộc Tồn"));
  if (!p) throw new Error("RULE_NOT_DEFINED: không tìm thấy Lộc Tồn trong chart");
  return p.chiIndex;
}
// Dùng chung cho Ân Quang/Thiên Quý (Văn Xương/Văn Khúc) và Tam Thai/Bát Tọa (Tả Phù/Hữu Bật) — đọc vị
// trí đã an sẵn trong chart (LOCKED), không tính lại bằng công thức thứ hai (đúng cách đã dùng cho Lộc
// Tồn ở Quốc Ấn/Đường Phù).
function findPhuTinhChiIndex(chart: TuViChart, starName: string): number {
  const p = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === starName));
  if (!p) throw new Error("RULE_NOT_DEFINED: getTapDieu — không tìm thấy " + starName + " trong chart");
  return p.chiIndex;
}
export function quocAnIndex(locTonChiIndex: number): number { return mod12(locTonChiIndex + 8); }
export function duongPhuIndex(locTonChiIndex: number): number { return mod12(locTonChiIndex - 7); }

// ============================================================================================
// Cô Thần / Quả Tú — nguồn (Thiên Lương): "cứ 3 tuổi (địa chi) nối liền nhau thì Cô Thần đứng ngay cung
// chặn đầu và Quả Tú ngồi ngay cung chặn đuôi — Dần Mão Thìn: Cô Thần Tỵ, Quả Tú Sửu; Tỵ Ngọ Mùi: Cô Thần
// Thân, Quả Tú Thìn" (2 nhóm còn lại suy theo đúng cùng quy luật, khớp 100% với ví dụ độc lập ở bài 12:
// "Sinh năm Hợi, an Cô Thần ở cung Dần, Quả Tú ở cung Tuất").
// ============================================================================================
export const CO_THAN_BY_CHI: Record<string, number> = {
  "Dần": 5, "Mão": 5, "Thìn": 5, // Tỵ
  "Tỵ": 8, "Ngọ": 8, "Mùi": 8, // Thân
  "Thân": 11, "Dậu": 11, "Tuất": 11, // Hợi
  "Hợi": 2, "Tý": 2, "Sửu": 2, // Dần
};
export const QUA_TU_BY_CHI: Record<string, number> = {
  "Dần": 1, "Mão": 1, "Thìn": 1, // Sửu
  "Tỵ": 4, "Ngọ": 4, "Mùi": 4, // Thìn
  "Thân": 7, "Dậu": 7, "Tuất": 7, // Mùi
  "Hợi": 10, "Tý": 10, "Sửu": 10, // Tuất
};

// ============================================================================================
// Lưu Hà — SOURCE_CONFLICTED, KHÔNG đưa vào getTapDieu()/UI. Nguồn Thiên Lương (Level 2, bài "Lưu Hà
// Kiếp Sát...") cho bảng đủ 10 Can: "Tuổi Giáp thì Lưu Hà đóng ở Dậu... Đinh (âm) thì Lưu Hà đóng ở Thân
// (dương cung)... Quý thì Lưu Hà đóng ở Dần". NHƯNG bài 10 (Level 1, hocvienlyso.org, "Tự học tử vi đẩu
// số bài 10: An các sao hàng can") lại cho ví dụ khác: "Sinh năm Đinh Mão, an Lưu Hà ở cung Thìn" — Thìn
// (4) KHÁC Thân (8) mà nguồn Thiên Lương cho cùng Can Đinh. Đây là xung đột thật giữa 2 nguồn Level 1/2
// cùng thuộc hocvienlyso.org — theo đúng nguyên tắc "không suy diễn, không tự chọn bên", GIỮ NGUYÊN bảng
// đã tính (để tham khảo/đối chiếu sau) nhưng KHÔNG dùng làm dữ liệu chính thức cho đến khi có nguồn thứ 3
// phân giải. Xem docs/TUVI_PHASE38_TAP_DIEU.md mục "Lưu Hà — CONFLICTED".
export const LUU_HA_BY_CAN_THIEN_LUONG_UNCONFIRMED: Record<string, number> = {
  "Giáp": 9, "Ất": 10, "Bính": 7, "Đinh": 8, "Mậu": 5,
  "Kỷ": 6, "Canh": 3, "Tân": 4, "Nhâm": 11, "Quý": 2,
};

// ============================================================================================
// Phá Toái — theo nhóm Tứ Chính/Tứ Sinh/Tứ Mộ (Thiên Lương): "vị trí đóng rất hạn chế là ba chỗ Tỵ Dậu
// Sửu" — ứng với 3 nhóm tuổi Vũ Phá(Tý Ngọ Mão Dậu)→Dậu, Liêm Phá(Dần Thân Tỵ Hợi)→Tỵ, Tử Phá(Thìn Tuất
// Sửu Mùi)→Sửu. Cross-check khớp ví dụ độc lập ở bài 12: "Sinh năm Tuất, an Phá Toái ở cung Sửu" (Tuất
// thuộc nhóm Thìn Tuất Sửu Mùi → Sửu, đúng).
// ============================================================================================
export const PHA_TOAI_BY_CHI: Record<string, number> = {
  "Tý": 9, "Ngọ": 9, "Mão": 9, "Dậu": 9, // Dậu
  "Dần": 5, "Thân": 5, "Tỵ": 5, "Hợi": 5, // Tỵ
  "Thìn": 1, "Tuất": 1, "Sửu": 1, "Mùi": 1, // Sửu
};

// ============================================================================================
// Thiên Quan/Thiên Phúc (theo Can năm sinh) — NGUỒN: sách "Tử Vi Hàm Số" (đối chiếu "Tử Vi Nam Phái — Lê
// Quang Lăng phần 2"), trích qua skill luan-giai-tu-vi-nam-phai (references/bang-an-sao-day-du.md mục 3).
// CONFIRMED bởi nguồn độc lập thứ 2 — sách "Tử Vi Tam Hợp Phái Tập 1" (Học Viện Phong Thủy Minh Việt) §32
// "An bộ sao Thiên Quan, Thiên Phủc [Phúc]" cho ĐÚNG 10/10 giá trị theo Can, khớp tuyệt đối 2 bảng.
// ============================================================================================
export const THIEN_QUAN_BY_CAN: Record<string, number> = {
  "Giáp": 7, "Ất": 4, "Bính": 5, "Đinh": 2, "Mậu": 3,
  "Kỷ": 9, "Canh": 11, "Tân": 9, "Nhâm": 10, "Quý": 6,
};
export const THIEN_PHUC_BY_CAN: Record<string, number> = {
  "Giáp": 9, "Ất": 8, "Bính": 0, "Đinh": 11, "Mậu": 3,
  "Kỷ": 2, "Canh": 6, "Tân": 5, "Nhâm": 6, "Quý": 5,
};

// ============================================================================================
// Thai Phụ/Phong Cáo — SOURCE_CONFLICTED giữa công thức và nguồn gốc:
// (A) "Tử Vi Hàm Số" (theo Giờ sinh, bảng mục 1 trong bang-an-sao-day-du.md): suy ra công thức tuyến
//     tính Thai Phụ = mod12(gioChiIndex + 6), Phong Cáo = mod12(gioChiIndex + 2) — ĐANG DÙNG bên dưới.
// (B) "Tử Vi Tam Hợp Phái Tập 1" (Minh Việt) §23 "An bộ sao Thai Phụ, Phong Cáo": "Cách trước cung an
//     Văn Khúc một cung an Thai Phụ. Cách sau cung an Văn Khúc một cung an Phong Cáo" — tức Thai Phụ =
//     vanKhucIndex − 1, Phong Cáo = vanKhucIndex + 1. Với vanKhucIndex(h) = mod12(4 + h) (rules.ts đã
//     LOCKED), công thức (B) cho Thai Phụ = mod12(h + 3), Phong Cáo = mod12(h + 5) — KHÁC công thức (A)
//     (mod12(h+6) / mod12(h+2)) với MỌI giá trị giờ sinh, không quy về cùng kết quả (đã kiểm tra đại số,
//     không phải sai số OCR). ĐÃ GIẢI QUYẾT bằng đối chiếu trực tiếp với lá số thật của Học Viện Lý Số
//     Nguyên Cát (hocvienlyso.org) — Nữ Đinh Sửu, DL 31/8/1997, giờ Ngọ (gioChiIndex=6): lá số mẫu cho
//     Thai Phụ tại Tý(0), Phong Cáo tại Thân(8) — khớp CHÍNH XÁC công thức (A) (mod12(6+6)=0, mod12(6+2)
//     =8), KHÔNG khớp (B) (Văn Khúc=Tuất(10) → Thai Phụ=Dậu(9), Phong Cáo=Hợi(11), đều sai). CONFIRMED
//     (A) đúng — GIỮ NGUYÊN, không đổi sang (B).
// ============================================================================================
export function thaiPhuIndex(gioChiIndex: number): number { return mod12(gioChiIndex + 6); }
export function phongCaoIndex(gioChiIndex: number): number { return mod12(gioChiIndex + 2); }

// ============================================================================================
// Ân Quang/Thiên Quý — NGUỒN: "Tử Vi Tam Hợp Phái Tập 1" (Minh Việt) §9 "An bộ sao Ân Quang, Thiên Quý":
// "Lấy ngày sinh trừ đi một ngày. Xem sao Văn Xương ở cung nào tính theo chiều thuận đến ngày sinh đã trừ
// một ngày an Ân Quang. Xem sao Văn Khúc ở cung nào đếm theo chiều nghịch đến ngày sinh đã trừ một ngày
// an Thiên Quý." — khởi từ cung Văn Xương/Văn Khúc (đã LOCKED, vanXuongIndex/vanKhucIndex theo giờ sinh
// trong rules.ts). CÔNG THỨC OFFSET: câu nguồn có 2 lớp trừ 1 — (1) "ngày sinh trừ đi một ngày" tạo ra
// ngày điều chỉnh N = lunarDay-1; (2) đếm từ cung Văn Xương/Khúc theo kiểu "kể là mùng 1" tới ngày N (như
// Tam Thai/Bát Tọa bên dưới) lại trừ 1 lần nữa → offset thật = N-1 = lunarDay-2. ĐÃ KIỂM CHỨNG bằng lá số
// thật Học Viện Lý Số Nguyên Cát (Nữ Đinh Sửu, DL 31/8/1997 giờ Ngọ, ÂL tháng 7 ngày 29): Văn Xương tại
// Thìn(4), Văn Khúc tại Tuất(10) — lá số mẫu cho CẢ Ân Quang VÀ Thiên Quý cùng tại Mùi(7). Thử offset=
// lunarDay-1=28→mod12=4: Ân Quang=mod12(4+4)=8(Thân) SAI, Thiên Quý=mod12(10-4)=6(Ngọ) SAI. Thử offset=
// lunarDay-2=27→mod12=3: Ân Quang=mod12(4+3)=7(Mùi) ĐÚNG, Thiên Quý=mod12(10-3)=7(Mùi) ĐÚNG — xác nhận
// công thức offset=lunarDay-2 là đúng (bản đầu tiên dùng lunarDay-1 là SAI, đã sửa).
// ============================================================================================
export function anQuangIndex(vanXuongChiIndex: number, lunarDay: number): number {
  return mod12(vanXuongChiIndex + (lunarDay - 2));
}
export function thienQuyIndex(vanKhucChiIndex: number, lunarDay: number): number {
  return mod12(vanKhucChiIndex - (lunarDay - 2));
}

// ============================================================================================
// Tam Thai/Bát Tọa — NGUỒN MỚI: "Tử Vi Tam Hợp Phái Tập 1" (Minh Việt) §11 "An bộ sao Tam Thai, Bát
// Tọa": "Xem Tả Phù ở cung nào là mùng 1, tính thuận đến ngày sinh an Tam Thai. Xem Hữu Bật ở cung nào
// là mùng 1, tính nghịch đến ngày sinh an Bát Tọa." — tức khởi từ cung Tả Phù/Hữu Bật (đã LOCKED,
// taPhuIndex/huuBatIndex theo tháng sinh trong rules.ts) coi là "mùng 1", offset thêm (lunarDay-1) bước
// thuận/nghịch tới ngày sinh thật. Trước đây "nguồn chưa đủ" — nay đã có công thức rõ ràng, 1 nguồn.
// ============================================================================================
export function tamThaiIndex(taPhuChiIndex: number, lunarDay: number): number {
  return mod12(taPhuChiIndex + (lunarDay - 1));
}
export function batToaIndex(huuBatChiIndex: number, lunarDay: number): number {
  return mod12(huuBatChiIndex - (lunarDay - 1));
}

// ============================================================================================
// Đẩu Quân — NGUỒN: "Tử Vi Tam Hợp Phái Tập 1" (Minh Việt) §28 "An sao Đẩu Quân": "Từ cung có sao Thái
// Tuế gọi là tháng giêng, tính nghịch đến tháng sinh; [cung đó] gọi là giờ Tý, tính thuận tới giờ sinh an
// sao Đẩu Quân." — 2 bước: (1) từ cung Thái Tuế (= yearChiIndex, đã LOCKED — vòng Thái Tuế luôn khởi tại
// Chi năm sinh) coi là tháng Giêng, đếm NGHỊCH tới tháng sinh (offset lunarMonth-1) ra 1 cung tạm; (2) từ
// cung tạm đó coi là giờ Tý, đếm THUẬN tới giờ sinh (offset gioChiIndex) ra vị trí Đẩu Quân. ĐÃ KIỂM
// CHỨNG bằng lá số thật Học Viện Lý Số Nguyên Cát (Nam Ất Tỵ, ÂL 2025 tháng 12 ngày 17, giờ Sửu): yearChi
// =Tỵ(5), lunarMonth=12, gioChiIndex=1 (Sửu) → bước1=mod12(5-11)=6(Ngọ), Đẩu Quân=mod12(6+1)=7(Mùi) — ĐÚNG
// khớp vị trí "Đẩu quân" trong lá số mẫu (cung Mùi/Tật Ách).
// ============================================================================================
export function dauQuanIndex(yearChiIndex: number, lunarMonth: number, gioChiIndex: number): number {
  const step1 = mod12(yearChiIndex - (lunarMonth - 1));
  return mod12(step1 + gioChiIndex);
}

// ============================================================================================
// Vòng Tướng Tinh — 11 sao mới (Đào Hoa ĐÃ có sẵn trong Natal Core từ trước, offset 9 trong vòng này —
// KHÔNG tính lại/không hiển thị trùng ở đây, chỉ dùng để cross-check nguồn). Khởi theo nhóm tam hợp năm
// sinh, đi THUẬN cùng chiều Thái Tuế. Điểm khởi (Tướng Tinh) + thứ tự 12 sao đã cross-check khớp 100% với
// nguồn Kiếp Sát trực tiếp (Thiên Lương): "Dần Ngọ Tuất: Kiếp Sát ở Hợi; Thân Tý Thìn: Kiếp Sát ở Tỵ; Tỵ
// Dậu Sửu: Kiếp Sát ở Dần; Hợi Mão Mùi: Kiếp Sát ở Thân" — và khớp 2 ví dụ độc lập ở bài 12 ("Sinh năm
// Mùi, an Kiếp sát ở cung Thân"; "Sinh năm Ngọ, an Hoa Cái ở cung Tuất").
// ============================================================================================
const TUONG_TINH_START_BY_CHI: Record<string, number> = {
  "Dần": 6, "Ngọ": 6, "Tuất": 6, // Ngọ
  "Thân": 0, "Tý": 0, "Thìn": 0, // Tý
  "Tỵ": 9, "Dậu": 9, "Sửu": 9, // Dậu
  "Hợi": 3, "Mão": 3, "Mùi": 3, // Mão
};
const TUONG_TINH_RING: readonly string[] = [
  "Tướng Tinh", "Phan Án", "Tuế Dịch", "Tức Thần", "Hoa Cái", "Kiếp Sát",
  "Tai Sát", "Thiên Sát", "Chỉ Bối", "Đào Hoa", "Nguyệt Sát", "Vong Thần",
];

// Trả về 11 sao mới (đã lọc bỏ "Đào Hoa" — trùng với sao đã có sẵn trong Natal Core, không tính lại).
export function getTuongTinhRing(yearChiName: string): TapDieuPlacement[] {
  const start = TUONG_TINH_START_BY_CHI[yearChiName];
  if (start === undefined) {
    throw new Error("RULE_NOT_DEFINED: getTuongTinhRing — Chi năm sinh không hợp lệ: " + yearChiName);
  }
  return TUONG_TINH_RING
    .map((name, step) => ({ chiIndex: mod12(start + step), name }))
    .filter((s) => s.name !== "Đào Hoa");
}

// ============================================================================================
// Hàm tổng hợp — pure, deterministic, KHÔNG mutate `chart`. Input = PUBLIC CHART MODEL (TuViChart).
// ============================================================================================
export function getTapDieu(chart: TuViChart): TapDieuPlacement[] {
  const yearChiIndex = CHI.indexOf(chart.yearChiName);
  if (yearChiIndex < 0) {
    throw new Error("RULE_NOT_DEFINED: getTapDieu — yearChiName không hợp lệ: " + chart.yearChiName);
  }

  const locTonChiIndex = findLocTonChiIndex(chart);
  const gioChiIndex = CHI.indexOf(chart.gioChiName);
  if (gioChiIndex < 0) {
    throw new Error("RULE_NOT_DEFINED: getTapDieu — gioChiName không hợp lệ: " + chart.gioChiName);
  }
  if (THIEN_QUAN_BY_CAN[chart.yearCanName] === undefined || THIEN_PHUC_BY_CAN[chart.yearCanName] === undefined) {
    throw new Error("RULE_NOT_DEFINED: getTapDieu — yearCanName không hợp lệ: " + chart.yearCanName);
  }
  const vanXuongChiIndex = findPhuTinhChiIndex(chart, "Văn Xương");
  const vanKhucChiIndex = findPhuTinhChiIndex(chart, "Văn Khúc");
  const taPhuChiIndex = findPhuTinhChiIndex(chart, "Tả Phù");
  const huuBatChiIndex = findPhuTinhChiIndex(chart, "Hữu Bật");

  const result: TapDieuPlacement[] = [
    { chiIndex: longTriIndex(yearChiIndex), name: "Long Trì" },
    { chiIndex: phuongCacIndex(yearChiIndex), name: "Phượng Các" },
    { chiIndex: thienKhocIndex(yearChiIndex), name: "Thiên Khốc" },
    { chiIndex: thienHuIndex(yearChiIndex), name: "Thiên Hư" },
    { chiIndex: thienDucIndex(yearChiIndex), name: "Thiên Đức" },
    { chiIndex: nguyetDucIndex(yearChiIndex), name: "Nguyệt Đức" },
    { chiIndex: thienTaiIndex(chart.menhChiIndex, yearChiIndex), name: "Thiên Tài" },
    { chiIndex: thienThoIndex(chart.thanChiIndex, yearChiIndex), name: "Thiên Thọ" },
    { chiIndex: CO_THAN_BY_CHI[chart.yearChiName], name: "Cô Thần" },
    { chiIndex: QUA_TU_BY_CHI[chart.yearChiName], name: "Quả Tú" },
    // Lưu Hà: KHÔNG đưa vào — SOURCE_CONFLICTED (xem ghi chú tại LUU_HA_BY_CAN_THIEN_LUONG_UNCONFIRMED).
    { chiIndex: PHA_TOAI_BY_CHI[chart.yearChiName], name: "Phá Toái" },
    { chiIndex: thienKhongIndex(yearChiIndex), name: "Thiên Không" },
    { chiIndex: thienGiaiIndex(chart.lunarMonth), name: "Thiên Giải" },
    { chiIndex: diaGiaiIndex(chart.lunarMonth), name: "Địa Giải" },
    { chiIndex: giaiThanIndex(yearChiIndex), name: "Giải Thần" },
    { chiIndex: THIEN_LA_CHI_INDEX, name: "Thiên La" },
    { chiIndex: DIA_VONG_CHI_INDEX, name: "Địa Võng" },
    { chiIndex: thienSuIndex(chart), name: "Thiên Sứ" },
    { chiIndex: thienThuongIndex(chart), name: "Thiên Thương" },
    { chiIndex: quocAnIndex(locTonChiIndex), name: "Quốc Ấn" },
    { chiIndex: duongPhuIndex(locTonChiIndex), name: "Đường Phù" },
    { chiIndex: THIEN_QUAN_BY_CAN[chart.yearCanName], name: "Thiên Quan" },
    { chiIndex: THIEN_PHUC_BY_CAN[chart.yearCanName], name: "Thiên Phúc" },
    { chiIndex: thaiPhuIndex(gioChiIndex), name: "Thai Phụ" },
    { chiIndex: phongCaoIndex(gioChiIndex), name: "Phong Cáo" },
    { chiIndex: anQuangIndex(vanXuongChiIndex, chart.lunarDay), name: "Ân Quang" },
    { chiIndex: thienQuyIndex(vanKhucChiIndex, chart.lunarDay), name: "Thiên Quý" },
    { chiIndex: tamThaiIndex(taPhuChiIndex, chart.lunarDay), name: "Tam Thai" },
    { chiIndex: batToaIndex(huuBatChiIndex, chart.lunarDay), name: "Bát Tọa" },
    { chiIndex: dauQuanIndex(yearChiIndex, chart.lunarMonth, gioChiIndex), name: "Đẩu Quân" },
    ...getTuongTinhRing(chart.yearChiName),
  ];

  for (const s of result) {
    if (s.chiIndex === undefined) {
      throw new Error("RULE_NOT_DEFINED: getTapDieu — thiếu dữ liệu cho sao " + s.name);
    }
  }
  return result;
}
