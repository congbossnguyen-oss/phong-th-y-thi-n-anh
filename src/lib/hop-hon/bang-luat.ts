/**
 * HỢP HÔN BÁT TỰ × TỬ VI — BẢNG LUẬT (thuần dữ liệu, không logic).
 *
 * Toàn bộ tri thức nghề của module nằm ở file này để anh Công duyệt/sửa 1 chỗ (cùng quy trình đã
 * làm với Phá Toái, 12 Trực, Chân Lộc). Đặc tả đầy đủ: artifact "Hợp Hôn Bát Tự × Tử Vi" 27/8/2026.
 *
 * Nguyên tắc xuyên suốt (KHÔNG được vi phạm khi sửa bảng):
 *  - Hợp/xung chỉ có nghĩa khi soi tương đối với DỤNG THẦN — không có ô nào "xung = xấu" vô điều kiện.
 *  - Không ra điểm số tổng. Mọi kết luận là nhãn chữ + việc cần làm, không phải phán quyết.
 *  - Chủ đề hôn nhân: từ cấm nghiêm ngặt hơn mọi module khác (xem TU_CAM_HON_NHAN).
 */

// ---------------------------------------------------------------------------------------------
// QUAN HỆ ĐỊA CHI — bảng chuẩn cổ truyền (base-data.json mới có tam hợp/tam hội/lục xung, chưa có
// lục hợp/hình/hại nên khai báo tại đây; nếu sau này base-data bổ sung thì chuyển về đó).
// Nguồn: Uyên Hải Tử Bình / Tam Mệnh Thông Hội — các bảng phổ quát, mọi phái thống nhất.

/** Lục hợp: Tý-Sửu, Dần-Hợi, Mão-Tuất, Thìn-Dậu, Tị-Thân, Ngọ-Mùi. */
export const LUC_HOP_CHI: readonly [string, string][] = [
  ["Tý", "Sửu"], ["Dần", "Hợi"], ["Mão", "Tuất"], ["Thìn", "Dậu"], ["Tị", "Thân"], ["Ngọ", "Mùi"],
];

/** Lục hại: Tý-Mùi, Sửu-Ngọ, Dần-Tị, Mão-Thìn, Thân-Hợi, Dậu-Tuất. */
export const LUC_HAI_CHI: readonly [string, string][] = [
  ["Tý", "Mùi"], ["Sửu", "Ngọ"], ["Dần", "Tị"], ["Mão", "Thìn"], ["Thân", "Hợi"], ["Dậu", "Tuất"],
];

/** Tương hình (xét theo CẶP xuất hiện trong 2 Nhật Chi): Dần-Tị, Tị-Thân, Thân-Dần (vô ân);
 *  Sửu-Tuất, Tuất-Mùi, Mùi-Sửu (ỷ thế); Tý-Mão (vô lễ). */
export const TUONG_HINH_CHI: readonly [string, string][] = [
  ["Dần", "Tị"], ["Tị", "Thân"], ["Thân", "Dần"],
  ["Sửu", "Tuất"], ["Tuất", "Mùi"], ["Mùi", "Sửu"],
  ["Tý", "Mão"],
];

/** Tự hình: hai Nhật Chi trùng nhau và cùng thuộc nhóm này. */
export const TU_HINH_CHI: readonly string[] = ["Thìn", "Ngọ", "Dậu", "Hợi"];

// ---------------------------------------------------------------------------------------------
// BẢNG TƯƠNG TÁC THẬP THẦN — 15 cặp giữa 5 nhóm trội (Tỷ Kiếp / Thực Thương / Tài / Quan Sát / Ấn).
// Trục suy luận: sinh khắc giữa các nhóm; phần diễn giải hành vi là ánh xạ nghề đã trình anh Công
// duyệt trong đặc tả (27/8/2026, anh chốt "em tự quyết" — bản này là bản chốt, sửa tại đây).

import type { Phe } from "../bat-tu-engine/engine";

export type MucCapThapThan = "rat_thuan" | "thuan" | "binh_hoa" | "cang" | "cang_nhat";

export interface LuatThapThan {
  capNhom: [Phe, Phe]; // không phân biệt thứ tự
  muc: MucCapThapThan;
  bieuHien: string; // biểu hiện trong đời sống vợ chồng — hiển thị nguyên văn cho khách
  dieuChinh: string; // việc cần chủ động làm (mọi điểm căng PHẢI kèm cách điều chỉnh)
}

export const BANG_THAP_THAN: readonly LuatThapThan[] = [
  {
    capNhom: ["thuc_thuong", "quan_sat"],
    muc: "cang_nhat",
    bieuHien:
      "Một bên quen nói thẳng, hay phản biện và soi được lỗi rất nhanh; bên kia trọng thể diện, nề nếp " +
      "và danh phận. Khi va nhau, người này thấy bị bắt bẻ, người kia thấy bị coi thường.",
    dieuChinh:
      "Quy ước rõ: góp ý riêng tư, không phản bác nhau trước mặt người ngoài; bên nguyên tắc chủ động " +
      "hỏi ý trước khi quyết việc chung thay vì ra lệnh.",
  },
  {
    capNhom: ["tai", "an"],
    muc: "cang_nhat",
    bieuHien:
      "Một bên trọng hiệu quả, tiền bạc và việc thực tế; bên kia trọng tinh thần, gia đình và người " +
      "thân. Xung đột thứ tự ưu tiên — và đây cũng là cấu hình hay đi kèm căng thẳng giữa vợ/chồng với " +
      "cha mẹ bên kia.",
    dieuChinh:
      "Tách bạch ngân sách chung – riêng ngay từ đầu; việc liên quan cha mẹ hai bên bàn trước ở nhà, " +
      "thống nhất rồi mới nói ra ngoài.",
  },
  {
    capNhom: ["ty_kiep", "quan_sat"],
    muc: "cang",
    bieuHien:
      "Bên nguyên tắc muốn giờ giấc, quy củ; bên tự chủ không chịu bị quản. Dễ thành vòng lặp một người " +
      "siết – một người né.",
    dieuChinh: "Phân vai rõ từ đầu: việc gì ai toàn quyền, việc gì phải bàn — tránh quản lý nhau theo cảm hứng.",
  },
  {
    capNhom: ["ty_kiep", "ty_kiep"],
    muc: "cang",
    bieuHien: "Hai cái tôi ngang nhau, cùng muốn cầm quyết định. Không ai chịu nhường trước, việc nhỏ dễ thành to.",
    dieuChinh: "Chia hẳn địa hạt quyết định (tiền lớn, con cái, nhà cửa…) — mỗi địa hạt một người có tiếng nói cuối.",
  },
  {
    capNhom: ["ty_kiep", "tai"],
    muc: "cang",
    bieuHien:
      "Một bên rộng tay với bạn bè anh em, một bên muốn giữ và tích. Mâu thuẫn tiền bạc lặp đi lặp lại " +
      "nếu không có luật chung.",
    dieuChinh: "Đặt hạn mức chi không cần hỏi; vượt hạn mức thì bàn — luật rõ thì hết cãi.",
  },
  {
    capNhom: ["thuc_thuong", "an"],
    muc: "cang",
    bieuHien:
      "Bên hướng nội hay lo xa, muốn kìm giữ cho chắc; bên biểu đạt thấy bị bó, mất tự do thể hiện.",
    dieuChinh: "Bên lo xa nói rõ nỗi lo thay vì cấm cản; bên biểu đạt báo trước kế hoạch thay vì đặt việc đã rồi.",
  },
  {
    capNhom: ["thuc_thuong", "tai"],
    muc: "rat_thuan",
    bieuHien: "Thực Thương sinh Tài: một người nghĩ ra, một người biến thành kết quả. Cặp hợp làm ăn nhất trong bảng.",
    dieuChinh: "Giữ nhịp: định kỳ ngồi lại xem ý tưởng nào làm tiếp, ý tưởng nào dừng — tránh dàn trải.",
  },
  {
    capNhom: ["tai", "quan_sat"],
    muc: "rat_thuan",
    bieuHien: "Tài sinh Quan: bên thực tế hậu thuẫn để bên kia tiến thân, danh phận. Hậu phương – tiền tuyến rõ ràng.",
    dieuChinh: "Bên tiến thân đừng quên ghi nhận công hậu phương thành lời — đây là chỗ cặp này hay chủ quan.",
  },
  {
    capNhom: ["quan_sat", "an"],
    muc: "rat_thuan",
    bieuHien: "Quan sinh Ấn: một bên tạo vị thế, một bên giữ nếp nhà và hưởng phúc. Phân vai tự nhiên, ít phải bàn.",
    dieuChinh: "Đề phòng một chiều: thỉnh thoảng đổi vai trong việc nhỏ để bên kia không thành người phụ thuộc.",
  },
  {
    capNhom: ["ty_kiep", "thuc_thuong"],
    muc: "thuan",
    bieuHien: "Tỷ Kiếp sinh Thực Thương: bên tự chủ nâng đỡ để bên kia được thể hiện; bên biểu đạt thấy được ủng hộ.",
    dieuChinh: "Chỉ cần giữ ranh giới tài chính chung — cặp này mạnh về khích lệ, yếu về kỷ luật chi tiêu.",
  },
  {
    capNhom: ["ty_kiep", "an"],
    muc: "thuan",
    bieuHien: "Ấn sinh Tỷ Kiếp: một bên che chở, chiều chuộng; một bên được tiếp sức. Êm, nhưng dễ trượt sang nuông chiều.",
    dieuChinh: "Bên được chiều giữ phần việc nhà cố định của mình — để cân bằng cho–nhận không lệch dần theo năm tháng.",
  },
  {
    capNhom: ["thuc_thuong", "thuc_thuong"],
    muc: "binh_hoa",
    bieuHien: "Cùng biểu đạt: sống vui, nói chuyện hợp, nhiều bạn chung. Điểm yếu: không ai cầm trịch tài chính.",
    dieuChinh: "Chọn hẳn một người làm 'thủ quỹ' có quyền phanh — hoặc dùng quy tắc tự động (trích tiết kiệm trước, tiêu sau).",
  },
  {
    capNhom: ["tai", "tai"],
    muc: "binh_hoa",
    bieuHien: "Cùng thực tế: hợp làm ăn chung, nhìn tiền bạc giống nhau. Điểm yếu: dễ khô, quên phần tình cảm.",
    dieuChinh: "Đặt lịch cố định cho thời gian riêng hai người không bàn công việc — coi như một khoản đầu tư bắt buộc.",
  },
  {
    capNhom: ["quan_sat", "quan_sat"],
    muc: "binh_hoa",
    bieuHien: "Cùng nguyên tắc: nhà cửa nề nếp, lời hứa được giữ. Điểm yếu: cứng, gặp biến cố bất ngờ dễ lúng túng.",
    dieuChinh: "Thống nhất trước một 'luật thời chiến': khi có biến, ai là người được phá lệ và quyết nhanh.",
  },
  {
    capNhom: ["an", "an"],
    muc: "binh_hoa",
    bieuHien: "Cùng nội tâm: hiểu nhau không cần nói nhiều, nhà cửa yên. Điểm yếu: cùng chờ được dựa, thiếu người xông pha.",
    dieuChinh: "Việc đối ngoại (giấy tờ, thương lượng, va chạm bên ngoài) phân hẳn cho một người phụ trách, có thời hạn.",
  },
];

/** Ca đặc biệt tách riêng Chính/Thiên — nặng hơn mức của cặp nhóm gốc. */
export const CA_DAC_BIET_THAP_THAN = {
  /** Nữ Thương Quan thấu + trội × nam Chính Quan thấu + trội — "Thương Quan kiến Quan, họa bách đoan". */
  nuThuongQuanNamChinhQuan: {
    bieuHien:
      "Riêng cặp này cổ thư xếp nặng nhất: người nữ Thương Quan vượng quen phản biện và không phục uy " +
      "quyền hình thức; người nam Chính Quan vượng lại coi danh phận, thể diện là gốc. Đây là tổ hợp dễ " +
      "bào mòn nhau nhất nếu cả hai giữ nguyên nếp cũ.",
    dieuChinh:
      "Không phải không lấy được nhau — mà là phải đổi luật chơi: người nam chủ động bỏ lối 'chồng nói vợ " +
      "nghe', người nữ chọn thời điểm góp ý. Nên trao đổi trực tiếp với chuyên gia trước khi quyết định lớn.",
  },
} as const;

// ---------------------------------------------------------------------------------------------
// NHÃN & CÂU MẪU

export type NhanTongQuan = "rat_thuan" | "thuan" | "can_chu_dong_dieu_chinh" | "nen_gap_chuyen_gia";

export const TEN_NHAN_TONG_QUAN: Record<NhanTongQuan, string> = {
  rat_thuan: "Rất thuận",
  thuan: "Thuận",
  can_chu_dong_dieu_chinh: "Thuận nếu chủ động điều chỉnh",
  nen_gap_chuyen_gia: "Nên trao đổi trực tiếp với chuyên gia",
};

export const CAU_TONG_QUAN: Record<NhanTongQuan, string> = {
  rat_thuan:
    "Hai lá số nâng đỡ nhau ở nhiều tầng — đây là nền tảng tốt. Phần còn lại phụ thuộc vào cách hai người " +
    "vun đắp, vì lá số chỉ là điểm xuất phát, không phải đích đến.",
  thuan:
    "Tổng thể thuận, có một vài điểm cần để ý được nêu rõ bên dưới. Biết trước để chủ động là lợi thế lớn " +
    "nhất mà bản đồ này mang lại.",
  can_chu_dong_dieu_chinh:
    "Hai lá số có những điểm lệch cần được gọi tên và chủ động điều chỉnh — không phải rào cản, mà là việc " +
    "cần làm. Rất nhiều cặp bền vững chính là nhờ hiểu sớm những điểm này.",
  nen_gap_chuyen_gia:
    "Bản đồ cho thấy nhiều tầng cần được luận kỹ với đầy đủ bối cảnh của hai bạn — điều một công cụ không " +
    "thay thế được. Khuyến nghị trao đổi trực tiếp với chuyên gia Thiên Anh trước khi quyết định lớn.",
};

export const DISCLAIMER_HON_NHAN =
  "Bản luận này là bản đồ tham khảo theo mệnh lý cổ truyền, chỉ ra điểm mạnh và điểm cần chủ động vun đắp " +
  "— không phải phán quyết về việc nên hay không nên kết hôn. Hôn nhân bền vững do hai người cùng xây; " +
  "lá số tốt không thay được sự vun đắp, lá số lệch không cản được đôi bên thật lòng điều chỉnh vì nhau.";

/**
 * TỪ CẤM RIÊNG CHO HÔN NHÂN — nghiêm ngặt hơn TU_KHOA_CAM_TUYET_DOI chung. Mọi văn bản hiển thị
 * cho khách (kể cả câu mẫu ở file này) phải qua timTuCamHonNhan() trước khi render.
 */
export const TU_CAM_HON_NHAN: readonly string[] = [
  // tan vỡ
  "ly hôn", "ly dị", "bỏ nhau", "chia tay", "tan vỡ", "đổ vỡ", "không đến được với nhau",
  // khắc mệnh
  "khắc chết", "khắc phu", "khắc thê", "sát phu", "sát thê", "cao số", "sát chồng", "sát vợ",
  // cô quả
  "cô quả", "góa", "goá", "ở vậy", "không ai lấy",
  // phán quyết
  "không nên lấy", "không nên cưới", "cấm cưới", "nên bỏ", "không hợp làm vợ chồng", "đừng cưới",
  // dự đoán riêng tư
  "ngoại tình", "phản bội", "người thứ ba", "vô sinh", "hiếm muộn",
];

export function timTuCamHonNhan(vanBan: string): string[] {
  const thap = vanBan.toLowerCase();
  return TU_CAM_HON_NHAN.filter((tu) => thap.includes(tu));
}
