/**
 * BÁT TRẠCH NHÀ — 64 "Lời tượng" cổ văn cho tổ hợp CỬA × CHỦ (Dương Trạch Tam Yếu, "Bát Trạch
 * phong thủy Tập 3"). Mỗi tổ hợp có 1 câu tượng súc tích (5-8 chữ) mô tả cát hung. Bổ trợ cho lớp
 * Tam Yếu (khí + tên Trạch đã có sẵn từ bảng Du Niên).
 *
 * Nguồn: `bat-trach-luan-nha/nguon-goc/New_phong_thu_y_ba_t_tra_ch_ta__p_3_...ocr.md`. Cửa/Chủ của
 * cả 64 ô XÁC ĐỊNH CHẮC CHẮN (thứ tự chuẩn Nhà 01-64: Cửa Càn→Đoài, mỗi Cửa 8 Chủ Càn→Đoài, khớp
 * heading + phần "Ý nghĩa" giải thích quái tượng trong nguồn).
 *
 * ⚠️ 17 ô có `ocrMo: true` — câu Lời tượng bị OCR xáo/thiếu 1-2 chữ; nội dung dưới đây là phần đọc
 * được kèm phục dựng theo phần "Ý nghĩa" NGAY TRONG NGUỒN (không thêm kiến thức ngoài), nhưng đánh
 * dấu rõ để chủ site đối chiếu bản sách giấy — KHÔNG hiển thị như dữ liệu đã chốt (data/00 MĐ-4).
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";

export interface LoiTuong {
  cau: string;
  /** true = OCR mờ, câu có thể sai 1-2 chữ, cần đối chiếu sách giấy. */
  ocrMo?: boolean;
}

/** [Cửa][Chủ] → Lời tượng. Cửa là Gốc (quy ước Dương Trạch Tam Yếu). */
export const LOI_TUONG_CUA_CHU: Record<CungBatTrach, Record<CungBatTrach, LoiTuong>> = {
  Càn: {
    Càn: { cau: "Càn Càn thuần dương, thương phụ nữ." },
    Khảm: { cau: "Thiên môn lạc thủy, xuất dâm cuồng." },
    Cấn: { cau: "Thiên lâm sơn thượng, gia phú quý." },
    Chấn: { cau: "Quỷ nhập lôi môn, thương trưởng tử." },
    Tốn: { cau: "Kiền Tốn sản vong, tâm thối thống.", ocrMo: true },
    Ly: { cau: "Kiền Ly cư quả, sinh nhãn tật.", ocrMo: true },
    Khôn: { cau: "Thiên môn đáo Địa, chủ vinh hoa." },
    Đoài: { cau: "Thiên trạch tài vượng, đa dâm." },
  },
  Khảm: {
    Càn: { cau: "Thủy tiết Kiền khí, dâm bại tuyệt." },
    Khảm: { cau: "Thủy trùng nhược phùng, thê tử nạn.", ocrMo: true },
    Cấn: { cau: "Thủy ngộ Sơn khắc, phạp tự.", ocrMo: true },
    Chấn: { cau: "Thủy Lôi phát phúc, cửu tuyệt tự.", ocrMo: true },
    Tốn: { cau: "Thủy Mộc vinh hoa, nữ tú.", ocrMo: true },
    Ly: { cau: "Thủy Hỏa ký tế, đại kiết xương." },
    Khôn: { cau: "Thủy Thổ tương khắc, trung nam tử." },
    Đoài: { cau: "Trạch ngộ Thủy tiết, thiếu nữ vong." },
  },
  Cấn: {
    Càn: { cau: "Sơn khởi Thiên trung, tử quý hiền." },
    Khảm: { cau: "Quỷ ngộ dương thủy, thương.", ocrMo: true },
    Cấn: { cau: "Trùng trùng điệp điệp, thê tử thương." },
    Chấn: { cau: "Sơn Lôi tương kiến, tiểu nhi ương." },
    Tốn: { cau: "Sơn ngộ Phong môn, mẫu quả tuyệt.", ocrMo: true },
    Ly: { cau: "Sơn phùng Hỏa hủy, phụ nữ cương.", ocrMo: true },
    Khôn: { cau: "Sơn Địa, điền sản đa tấn ích." },
    Đoài: { cau: "Sơn trạch nhân vượng, gia quý." },
  },
  Chấn: {
    Càn: { cau: "Long phi thiên thượng, lão công tai ương.", ocrMo: true },
    Khảm: { cau: "Lôi Thủy phạp tự, đa hành thiện." },
    Cấn: { cau: "Long phó Sơn trung, thiếu nhi hi.", ocrMo: true },
    Chấn: { cau: "Thê tử tương khắc, Chấn Mộc trùng." },
    Tốn: { cau: "Lôi phong tương phối, tốc phát phúc." },
    Ly: { cau: "Lôi Hỏa quang minh, phú quý xương." },
    Khôn: { cau: "Lôi nhập nhân môn, thương lão mẫu." },
    Đoài: { cau: "Long tranh Hổ đấu, ưu thương trưởng." },
  },
  Tốn: {
    Càn: { cau: "Phong Thiên thống, sát trưởng phụ." },
    Khảm: { cau: "Ngũ tử đăng khoa thị Phong Thủy." },
    Cấn: { cau: "Phong Sơn quả mẫu, đa phạp tự." },
    Chấn: { cau: "Phong Lôi công danh như Hỏa thổi.", ocrMo: true },
    Tốn: { cau: "Nhi nữ gian nan thị trùng phong." },
    Ly: { cau: "Phú quý phạp tự, Phong Hỏa dương." },
    Khôn: { cau: "Phong đáo nhân môn, mẫu tiên vong." },
    Đoài: { cau: "Phong sinh hiện hổ, thương trưởng phụ." },
  },
  Ly: {
    Càn: { cau: "Ly Kiền lão công bất cửu.", ocrMo: true },
    Khảm: { cau: "Âm Dương chính phối, phú quý cục." },
    Cấn: { cau: "Hỏa sơn phụ nữ cương, kinh bất điều." },
    Chấn: { cau: "Hỏa Lôi phát phúc, phụ nữ lương." },
    Tốn: { cau: "Hỏa phong đinh hy, gia bảo thiện." },
    Ly: { cau: "Hỏa diệm trùng trùng, vô nam nữ." },
    Khôn: { cau: "Hỏa đáo nhân môn, phụ quả tuyệt." },
    Đoài: { cau: "Ly Đoài Hỏa quang, thương thiếu nữ." },
  },
  Khôn: {
    Càn: { cau: "Địa khởi Thiên môn, phú quý cương." },
    Khảm: { cau: "Khôn Khảm, trung nam mạng bất ổn." },
    Cấn: { cau: "Địa sơn Thổ trùng, điền sản túc.", ocrMo: true },
    Chấn: { cau: "Nhân lâm long vị, mẫu sản vong." },
    Tốn: { cau: "Nhân mai mộ địa, lão mẫu tử." },
    Ly: { cau: "Nhân môn kiến Hỏa, đa quả mẫu." },
    Khôn: { cau: "Trùng Địa cô quả chưởng gia viên.", ocrMo: true },
    Đoài: { cau: "Địa trạch tán tài, tuyệt hậu tự." },
  },
  Đoài: {
    Càn: { cau: "Trạch thiên, quả mẫu chưởng tài nguyên." },
    Khảm: { cau: "Bạch hổ đầu giang, lục súc thương." },
    Cấn: { cau: "Trạch sơn tăng phúc, tiểu phòng vinh.", ocrMo: true },
    Chấn: { cau: "Hổ nhập long oa, lao cổ phế." },
    Tốn: { cau: "Hổ phùng hãn địa, diệc âm thương.", ocrMo: true },
    Ly: { cau: "Hổ Hỏa viêm chung, nữ thiếu vong." },
    Khôn: { cau: "Trạch Địa, tài long dị tánh cư." },
    Đoài: { cau: "Trạch trùng, thiếu phụ chưởng binh quyền." },
  },
};

/** Lời tượng cho tổ hợp (Cửa, Chủ). Luôn có (đủ 64 ô); ô `ocrMo` thì UI nên ghi chú "OCR mờ". */
export function loiTuongCuaChu(cuaCung: CungBatTrach, chuCung: CungBatTrach): LoiTuong {
  return LOI_TUONG_CUA_CHU[cuaCung][chuCung];
}
