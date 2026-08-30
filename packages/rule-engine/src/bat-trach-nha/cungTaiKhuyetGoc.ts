/**
 * BÁT TRẠCH NHÀ — Bát Quái cung tài & phương vị khuyết (bản đồ 8 cung ↔ lĩnh vực đời sống).
 * Nguồn: `bat-trach-luan-nha/nguon-goc/TA_I_LIE__U_BA_T_TRA_CH__1__ocr.md` dòng 1029-1072 (mục
 * "VII. BÁT QUÁI CUNG TÀI VÀ PHƯƠNG VỊ KHUYẾT").
 *
 * ⚠️ GẮN NHÃN NGUỒN (theo yêu cầu trung thực): đây là cách dùng PHỔ THÔNG (nguồn ghi rõ "tại Đài
 * Loan rất hay áp dụng... Lý Cư Minh hay dùng"), KHÔNG phải cổ pháp Bát Trạch lõi (Cung Phi × Du
 * Niên). Nó ánh xạ 8 cung Hậu Thiên Bát Quái theo PHƯƠNG VỊ CỐ ĐỊNH (không theo mệnh gia chủ) tới
 * 8 lĩnh vực đời sống — tương tự "Bagua map" phổ biến. Hiển thị như 1 lớp tham khảo bố trí, tách
 * biệt rõ với phần luận theo mệnh.
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";

export interface CungLinhVuc {
  linhVuc: string;
  huong: string;
}

/** 8 cung Hậu Thiên Bát Quái → lĩnh vực đời sống + hướng địa lý (nguyên văn nguồn, đã dọn lỗi OCR). */
export const CUNG_LINH_VUC: Record<CungBatTrach, CungLinhVuc> = {
  Càn: { linhVuc: "Du lịch, Quý nhân", huong: "Tây Bắc" },
  Khảm: { linhVuc: "Việc làm, Nghề nghiệp", huong: "Chánh Bắc" },
  Cấn: { linhVuc: "Học vấn, Kiến thức", huong: "Đông Bắc" },
  Chấn: { linhVuc: "Gia đạo, Sức khỏe", huong: "Chánh Đông" },
  Tốn: { linhVuc: "Tài bạch, Tiền bạc", huong: "Đông Nam" },
  Ly: { linhVuc: "Địa vị, Danh tiếng", huong: "Chánh Nam" },
  Khôn: { linhVuc: "Phu thê, Hôn nhân", huong: "Tây Nam" },
  Đoài: { linhVuc: "Tử tức, Con trẻ", huong: "Chánh Tây" },
};

/** Lời khuyên bố trí theo cung (nguyên văn nguồn — mẹo phổ thông, dọn lỗi OCR). */
export const MEO_BO_TRI_CUNG: string[] = [
  "Cung Tài (Đông Nam, cung Tốn): nên đặt bàn làm việc, két/tủ tiền để chiếm lợi thế. TUYỆT ĐỐI không đặt WC tại đây — mỗi lần giật nước ví như tiền bạc cuốn trôi đi.",
  "Cung Quý Nhân (Tây Bắc, cung Càn): khi tiếp khách nên nhường khách ngồi vào đây; còn mình quay mặt về 1 trong 4 hướng tốt của mình. Ngồi ngược lại (mình ở Tây Bắc, khách ở cung Tài) là \"Phản Khách Vi Chủ\", phần thiệt về mình.",
  "Cung Phu Thê (Tây Nam, cung Khôn): nếu vợ chồng trong nhà hay xào xáo gây gổ, xem lại góc này — quét dọn sạch sẽ, gắn thêm đèn sáng hoặc đặt thêm chuông gió (Phong Linh) để hóa giải.",
];

/** Trung cung (tâm nhà) thuộc về chủ nhà; nhà/vườn khuyết cung nào thì lĩnh vực cung đó suy. */
export const GHI_CHU_TRUNG_CUNG =
  "Chính giữa (Trung cung, tâm nhà) thuộc về chủ nhà. Nhà hoặc vườn khuyết (bị lõm/thiếu góc) ở cung nào thì lĩnh vực ứng với cung đó dễ suy yếu.";

export interface KetQuaKhuyetGoc {
  cung: CungBatTrach;
  linhVuc: string;
  huong: string;
}

/**
 * Luận khi nhà bị khuyết (lõm/thiếu) 1 số góc — trả về danh sách lĩnh vực đời sống dễ bị suy theo
 * quy tắc "khuyết cung nào suy lĩnh vực đó". Input là danh sách cung bị khuyết (người dùng tự xác
 * định từ hình dạng mặt bằng).
 */
export function luanKhuyetGoc(cungKhuyet: CungBatTrach[]): KetQuaKhuyetGoc[] {
  return cungKhuyet.map((cung) => ({ cung, linhVuc: CUNG_LINH_VUC[cung].linhVuc, huong: CUNG_LINH_VUC[cung].huong }));
}
