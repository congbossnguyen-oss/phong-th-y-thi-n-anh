/**
 * BÁT TRẠCH NHÀ — "Xem năm nay nhà/tuổi này có hợp không" (Niên Tinh). Nguồn: skill
 * `bat-trach-luan-nha/references/08-luu-nien-nguyet-van.md` (ADDENDUM mục 2 của gói build: tính
 * năng nhỏ, dùng lại đúng lõi Cung Phi + Du Niên đã có, chỉ cộng thêm bước niên tinh).
 *
 * ⚠️ Đúng nguyên tắc bao-trùm: "đây là kỹ thuật thuộc hệ Huyền Không Phi Tinh (Lượng Thiên Xích)...
 * nên phối hợp dùng skill huyen-khong-phi-tinh (đã có sẵn) thay vì tính thủ công lại ở đây." File
 * này KHÔNG tự tính niên tinh — chỉ nhận SỐ SAO nhập trung đã tính sẵn từ
 * `src/lib/huyen-khong-phi-tinh/engine.ts` (hàm `nienTinhNhapTrung`, đã kiểm chứng 3 mốc lịch sử)
 * làm tham số đầu vào, rồi làm đúng phần thuộc phạm vi Bát Trạch: quy đổi số sao → quái Bát Quái
 * (Lạc Thư chuẩn, khớp `CUNG_INFO` của engine phi tinh và `SO_SANG_CUNG` của cungPhi.ts trong
 * chính package này), tra Du Niên với Cung Phi gia chủ.
 *
 * ⚠️ Số 5 (Ngũ Hoàng nhập trung) KHÔNG có quái Bát Quái tương ứng trực tiếp (`CUNG_INFO[5].quai
 * = "-"` trong engine phi tinh) — nguồn không đủ dữ liệu để quy đổi (nhiều phái borrow Khôn hoặc
 * Cấn tùy Dương Độn/Âm Độn nhưng KHÔNG có căn cứ nguyên văn trong skill này) — để trống, hiển thị
 * "đang bổ sung" thay vì tự chọn 1 quy ước (data/00 MĐ-4).
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";
import { getKhiBatTrach, KHI_BAT_TRACH_INFO, type KhiBatTrach } from "../cung-menh-bat-trach/duNienBatQuai.js";

/** Lạc Thư chuẩn: số sao 1-9 → quái Bát Quái. 5 (Trung/Ngũ Hoàng) không có quái — khớp `CUNG_INFO` của huyen-khong-phi-tinh. */
export const SO_SAO_TOI_CUNG: Partial<Record<number, CungBatTrach>> = {
  1: "Khảm",
  2: "Khôn",
  3: "Chấn",
  4: "Tốn",
  6: "Càn",
  7: "Đoài",
  8: "Cấn",
  9: "Ly",
};

export type KetQuaNienTinh =
  | { apDung: true; saoNamNay: number; cungSao: CungBatTrach; khi: KhiBatTrach; tenKhi: string; hop: boolean }
  | { apDung: false; saoNamNay: number; ghiChu: string };

/**
 * Xét năm nay (qua số Niên Tinh nhập trung, TỰ TRUYỀN VÀO từ `nienTinhNhapTrung()` của engine
 * phi tinh — không tính lại ở đây) có hợp với Cung Phi gia chủ không.
 */
export function tinhNienTinhHopMenh(cungMenh: CungBatTrach, saoNamNay: number): KetQuaNienTinh {
  const cungSao = SO_SAO_TOI_CUNG[saoNamNay];
  if (!cungSao) {
    return {
      apDung: false,
      saoNamNay,
      ghiChu: "Năm nay Ngũ Hoàng nhập trung — không có quái Bát Quái tương ứng trực tiếp trong nguồn, chưa đủ dữ liệu để kết luận hợp/không hợp theo Bát Trạch (đang bổ sung).",
    };
  }
  const khi = getKhiBatTrach(cungMenh, cungSao);
  return { apDung: true, saoNamNay, cungSao, khi, tenKhi: KHI_BAT_TRACH_INFO[khi].ten, hop: KHI_BAT_TRACH_INFO[khi].cat };
}

/**
 * "Xem tháng này nhà/tuổi này có hợp không" (Nguyệt Tinh) — CÙNG PHÉP TÍNH hệt Niên Tinh (data/08
 * mục "Ứng dụng Niên Tinh/Nguyệt Tinh trong Bát Trạch": "Lập Cửu Cung Lạc Thư theo Niên Tinh (hoặc
 * Nguyệt Tinh của từng tháng)... Phối Mệnh Cung Phi với Niên/Nguyệt Tinh → tra Du Niên" — cùng 1
 * quy trình, chỉ khác nguồn sao đầu vào), nên gọi lại đúng hàm trên thay vì lặp logic. Caller tự
 * lấy `saoThangNay` từ `nguyetTinhNhapTrung(nam, thangAm)` của engine `huyen-khong-phi-tinh`
 * (nguyên tắc bao-trùm, giống hệt cách lấy `saoNamNay`).
 */
export const tinhNguyetTinhHopMenh = tinhNienTinhHopMenh;
