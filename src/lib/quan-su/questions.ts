// QUÂN SƯ THIÊN ANH — Seed data cho Thư Viện Câu Hỏi.
//
// PHÂN TẦNG GÓI: xem chú thích `PricingTier` trong types.ts. Tóm tắt — chia theo DẠNG LUẬN chứ
// không theo chủ đề: hỏi đóng "Có nên… không?" (qLuan) = Cơ bản; so sánh nhiều phương án (qSoSanh)
// hoặc câu hỏi mở cần chẩn đoán/chiến lược/thời điểm (qSau) = Cao cấp. Mức rủi ro là chuyện KHÁC,
// do `safety_level` lo — câu nhạy cảm không tự động thành câu cao cấp.
//
// DỮ LIỆU thuần: UI chỉ đọc từ đây, KHÔNG hard-code câu hỏi vào component.
// Kinh Dịch (Lục Hào) luôn là engine luận đoán chính → không liệt kê trong recommended_engines.
// Bát Tự/Tử Vi chỉ đưa SƠ ĐỒ VẬN TRÌNH (thời vận đang tốt hay xấu), không luận chi tiết.
// Nhóm "chọn ngày giờ" dùng trach-nhat (không gieo quẻ). Nhóm "quyết định" so sánh phương án.

import type { CategoryId, EngineRef, InputField, PricingTier, QuestionDefinition, SafetyLevel } from "./types";

// ---------------------------------------------------------------------------------------------
// Ô nhập dùng chung (tránh lặp lại ở mọi câu hỏi).

const IN_MO_TA: InputField = {
  key: "mo_ta_tinh_huong",
  label: "Kể ngắn gọn chuyện anh/chị đang gặp",
  type: "text",
  required: true,
  helpText: "Vài câu thôi — càng rõ hoàn cảnh, lời khuyên càng sát với anh/chị.",
};

const IN_GIEO_QUE: InputField = {
  key: "gieo_que",
  label: "Gieo quẻ",
  type: "gieo-que",
  required: true,
  helpText: "Tĩnh tâm nghĩ về điều mình đang phân vân, rồi gieo quẻ.",
};

const IN_NGAY_SINH: InputField = {
  key: "ngay_sinh",
  label: "Ngày sinh (dương lịch)",
  type: "date",
  required: true,
  helpText: "Dùng để xem thời vận hiện tại của anh/chị đang thuận hay chưa thuận.",
};

const IN_GIO_SINH: InputField = {
  key: "gio_sinh",
  label: "Giờ sinh",
  type: "time",
  required: false,
  helpText: "Không có cũng xem được, có thì bức tranh thời vận rõ hơn.",
};

const IN_PHUONG_AN: InputField = {
  key: "cac_phuong_an",
  label: "Các phương án anh/chị đang cân nhắc",
  type: "phuong-an-list",
  required: true,
  helpText: "Ghi rõ từng lựa chọn (ví dụ: Phương án A, Phương án B) để cân nhắc từng cái.",
};

const IN_KHOANG_THOI_GIAN: InputField = {
  key: "khoang_thoi_gian",
  label: "Khoảng thời gian dự kiến",
  type: "date-range",
  required: true,
  helpText: "Anh/chị định làm việc này trong khoảng nào? Hệ thống sẽ tìm ngày giờ đẹp trong đó.",
};

const IN_NGAY_SINH_CHU_SU: InputField = {
  key: "ngay_sinh_chu_su",
  label: "Ngày sinh người chủ sự",
  type: "date",
  required: true,
  helpText: "Ngày sinh của người đứng ra làm việc này, để chọn ngày hợp tuổi.",
};

// ---------------------------------------------------------------------------------------------
// Builder — tạo câu hỏi gọn, giảm lặp.

interface LuanOpts {
  engines?: EngineRef[];
  pricing?: PricingTier;
  safety?: SafetyLevel;
}

/**
 * Câu hỏi đóng "Có nên… không?" — một quẻ, một kết luận. Đây là xương sống GÓI CƠ BẢN
 * ("Hỏi một việc — nhận một lời khuyên").
 */
function qLuan(
  category: CategoryId,
  question_id: string,
  title: string,
  subtitle: string,
  opts: LuanOpts = {},
): QuestionDefinition {
  return {
    question_id,
    category,
    title,
    subtitle,
    required_inputs: [IN_MO_TA, IN_NGAY_SINH, IN_GIEO_QUE],
    optional_inputs: [IN_GIO_SINH],
    recommended_engines: opts.engines ?? ["bat-tu", "tu-vi"],
    divination_method: "luc-hao",
    output_type: "luan-giai",
    pricing_tier: opts.pricing ?? "co-ban",
    safety_level: opts.safety ?? "thuong",
  };
}

/**
 * Câu so sánh nhiều phương án — gieo quẻ RIÊNG cho từng phương án rồi so sánh. Nhiều quẻ, nhiều
 * lớp phân tích → mặc định thuộc GÓI CAO CẤP ("Đưa vấn đề — Quân Sư phân tích cùng anh/chị").
 */
function qSoSanh(
  category: CategoryId,
  question_id: string,
  title: string,
  subtitle: string,
  opts: LuanOpts = {},
): QuestionDefinition {
  return {
    question_id,
    category,
    title,
    subtitle,
    required_inputs: [IN_MO_TA, IN_PHUONG_AN, IN_NGAY_SINH, IN_GIEO_QUE],
    optional_inputs: [IN_GIO_SINH],
    recommended_engines: opts.engines ?? ["bat-tu", "tu-vi"],
    divination_method: "luc-hao",
    output_type: "so-sanh-phuong-an",
    pricing_tier: opts.pricing ?? "cao-cap",
    safety_level: opts.safety ?? "thuong",
  };
}

/**
 * Câu hỏi MỞ cần luận sâu — không phải chọn A/B mà là chẩn đoán ("điều gì đang cản trở"), chiến
 * lược ("nên xử lý thế nào") hoặc thời điểm ("khi nào nên"). Chỉ một quẻ như qLuan nhưng đòi hỏi
 * phân tích nhiều tầng hơn hẳn → thuộc GÓI CAO CẤP.
 */
function qSau(
  category: CategoryId,
  question_id: string,
  title: string,
  subtitle: string,
  opts: LuanOpts = {},
): QuestionDefinition {
  return { ...qLuan(category, question_id, title, subtitle, opts), pricing_tier: opts.pricing ?? "cao-cap" };
}

/** Câu chọn ngày giờ — dùng trach-nhat (không gieo quẻ). */
function qNgay(
  category: CategoryId,
  question_id: string,
  title: string,
  subtitle: string,
): QuestionDefinition {
  return {
    question_id,
    category,
    title,
    subtitle,
    required_inputs: [IN_KHOANG_THOI_GIAN, IN_NGAY_SINH_CHU_SU],
    optional_inputs: [],
    recommended_engines: ["trach-nhat"],
    divination_method: "trach-nhat",
    output_type: "chon-thoi-diem",
    pricing_tier: "co-ban",
    safety_level: "thuong",
  };
}

// ---------------------------------------------------------------------------------------------
// SEED — thư viện câu hỏi (Cơ bản + Cao cấp).

export const questions: QuestionDefinition[] = [
  // ----- SỰ NGHIỆP (7) -----
  qLuan("su-nghiep", "xin-viec", "Có nên theo đuổi công việc này không?", "Đang nhắm một chỗ làm, muốn biết có nên nộp đơn / nhận lời."),
  qLuan("su-nghiep", "chuyen-viec", "Có nên chuyển việc lúc này không?", "Phân vân giữa đi và ở, muốn nhìn rõ hơn trước khi quyết."),
  qLuan("su-nghiep", "nghi-viec", "Có nên nghỉ việc bây giờ không?", "Đang muốn dừng lại, nhưng chưa chắc đã đúng thời điểm."),
  qLuan("su-nghiep", "thang-chuc", "Cơ hội thăng tiến sắp tới có thuận không?", "Muốn biết đợt này có nên chủ động phấn đấu hay chờ thêm."),
  qLuan("su-nghiep", "nhan-chuc-vu-moi", "Có nên nhận vị trí / chức vụ mới không?", "Được đề nghị một vai trò mới, muốn cân nhắc kỹ."),
  qLuan("su-nghiep", "cong-viec-moi", "Công việc mới này có hợp với mình không?", "Sắp bắt đầu một công việc mới, muốn biết đường dài ra sao."),
  qLuan("su-nghiep", "phat-trien-su-nghiep", "Hướng sự nghiệp sắp tới của mình thế nào?", "Muốn nhìn tổng thể con đường phía trước để có định hướng."),

  // ----- KINH DOANH (7) -----
  qLuan("kinh-doanh", "mo-cua-hang", "Có nên mở cửa hàng lúc này không?", "Đang tính mở một cửa hàng, muốn xem thời điểm có thuận."),
  qLuan("kinh-doanh", "mo-doanh-nghiep", "Có nên mở công ty / doanh nghiệp không?", "Ý tưởng đã có, phân vân có nên bắt đầu bây giờ."),
  qLuan("kinh-doanh", "mo-rong-kinh-doanh", "Có nên mở rộng quy mô lúc này không?", "Việc đang ổn, muốn biết mở rộng có phải bước đi đúng lúc."),
  qLuan("kinh-doanh", "chuyen-dia-diem", "Có nên chuyển địa điểm kinh doanh không?", "Đang cân nhắc dời chỗ, muốn xem nơi mới có tốt hơn không."),
  qLuan("kinh-doanh", "nhap-hang", "Đợt nhập hàng này có thuận không?", "Muốn biết có nên xuống tiền nhập lô hàng lúc này."),
  qLuan("kinh-doanh", "ra-san-pham", "Sản phẩm sắp ra có được đón nhận không?", "Sắp tung sản phẩm/dịch vụ mới, muốn xem phản ứng thị trường."),
  qLuan("kinh-doanh", "hop-tac-kinh-doanh", "Vụ hợp tác kinh doanh này có nên làm không?", "Có người rủ làm ăn chung, muốn nhìn rõ được mất."),

  // ----- TÀI CHÍNH (5) -----
  qLuan("tai-chinh", "vay-tien", "Có nên vay khoản này không?", "Đang tính vay để làm việc gì đó, muốn cân nhắc rủi ro.", { safety: "nhay-cam" }),
  qLuan("tai-chinh", "cho-vay", "Có nên cho người này vay không?", "Có người hỏi vay, phân vân giữa tình và lý.", { safety: "nhay-cam" }),
  qLuan("tai-chinh", "doi-no", "Khoản nợ này có đòi được không?", "Muốn biết khả năng thu lại và nên đòi cách nào, lúc nào.", { safety: "nhay-cam" }),
  qLuan("tai-chinh", "thu-hoi-von", "Có thu hồi được vốn không?", "Đang lo về một khoản vốn kẹt lại, muốn nhìn rõ hơn.", { safety: "nhay-cam" }),
  qLuan("tai-chinh", "mua-ban-tai-san", "Vụ mua/bán tài sản này có nên làm không?", "Đang tính một giao dịch lớn, muốn xem có thuận không.", { safety: "nhay-cam" }),

  // ----- ĐẦU TƯ (5) -----
  qLuan("dau-tu", "dau-tu-du-an", "Có nên rót tiền vào dự án này không?", "Một cơ hội đầu tư đang mở ra, muốn cân nhắc kỹ được mất.", { safety: "nhay-cam" }),
  qLuan("dau-tu", "gop-von", "Có nên góp vốn cùng họ không?", "Được mời góp vốn, muốn xem đối tác và thương vụ ra sao.", { safety: "nhay-cam" }),
  qLuan("dau-tu", "rut-von", "Có nên rút vốn ra lúc này không?", "Đang phân vân giữ tiếp hay rút, muốn nhìn thời điểm.", { safety: "nhay-cam" }),
  qLuan("dau-tu", "tiep-tuc-hay-dung-dau-tu", "Nên tiếp tục hay dừng khoản đầu tư này?", "Việc đang lửng lơ, muốn biết đi tiếp hay dừng thì hơn.", { safety: "nhay-cam" }),
  qSoSanh("dau-tu", "chon-phuong-an-dau-tu", "Nên chọn phương án đầu tư nào?", "Có vài lựa chọn trước mặt, muốn cân xem cái nào hợp mình hơn.", { safety: "nhay-cam" }),

  // ----- BẤT ĐỘNG SẢN (5) — góc GIAO DỊCH + ĐẤT. Chuyện mua/bán 1 căn NHÀ cụ thể (có lời không,
  // bao lâu nên bán, bán được không) để nhóm "Nhà cửa" lo — tránh trùng. -----
  qLuan("bat-dong-san", "mua-dat", "Có nên mua mảnh đất này không?", "Đang cân nhắc xuống tiền một mảnh đất, muốn nhìn rõ hơn."),
  qLuan("bat-dong-san", "ban-dat", "Có nên bán mảnh đất này không?", "Đang tính bán đất, muốn biết bán lúc này có thiệt không."),
  qSoSanh("bat-dong-san", "giu-hay-ban-bds", "Nên giữ hay nên bán?", "Một tài sản đang phân vân giữ lại hay bán đi — cân cả hai."),
  qLuan("bat-dong-san", "giao-dich-bds", "Giao dịch nhà đất này có suôn sẻ không?", "Đang trong một vụ mua bán, muốn xem có trục trặc gì không."),
  qLuan("bat-dong-san", "ky-hop-dong-bds", "Có nên ký hợp đồng nhà đất này không?", "Sắp đặt bút ký, muốn chắc chắn hơn trước khi quyết.", { safety: "nhay-cam" }),

  // ----- NHÀ CỬA / PHONG THỦY (7) — luận NHÀ qua Kinh Dịch (Lục Hào), KHÔNG dùng Bát Trạch/Huyền Không.
  // Tầng luận giải dùng domain "Phong thủy nhà ở" trong LUAN_QUE_LUC_HAO_SPEC.md mục 8 (hào vị = hạng mục nhà). -----
  qLuan("nha-cua", "nha-o-tot-hay-xau", "Nhà này ở tốt hay xấu?", "Muốn biết căn nhà đang ở (hoặc định về ở) có hợp, có tốt cho mình không."),
  qLuan("nha-cua", "nha-co-nen-mua", "Nhà này có nên mua không?", "Đang nhắm một căn nhà, muốn xem mua về ở có tốt, có hợp không.", { safety: "nhay-cam" }),
  qLuan("nha-cua", "nha-kinh-doanh-tot-khong", "Nhà này kinh doanh có tốt không?", "Định dùng nhà để buôn bán/làm ăn, muốn xem có thuận đường tài lộc."),
  qLuan("nha-cua", "nha-cho-thue-duoc-khong", "Nhà này cho thuê được không?", "Muốn biết căn nhà có dễ cho thuê, có người thuê ổn định không."),
  qLuan("nha-cua", "nha-ban-co-loi-khong", "Bán nhà này có lời không?", "Đang tính bán, muốn xem bán ra có được giá, có lời không.", { safety: "nhay-cam" }),
  qLuan("nha-cua", "nha-co-ban-duoc-khong", "Nhà này có bán được không?", "Rao mãi chưa xong, muốn biết khi nào và có bán được không."),
  qLuan("nha-cua", "bao-lau-nen-ban-nha", "Bao lâu nữa nên bán nhà?", "Phân vân bán ngay hay chờ, muốn xem thời điểm nào bán thì hơn."),

  // ----- HỢP TÁC (4) -----
  qSoSanh("hop-tac", "chon-doi-tac", "Nên chọn ai làm đối tác?", "Có mấy lựa chọn đối tác, muốn cân xem ai hợp làm chung hơn."),
  qLuan("hop-tac", "co-nen-hop-tac", "Có nên bắt tay hợp tác không?", "Đang cân nhắc một lời mời hợp tác, muốn nhìn rõ được mất."),
  qLuan("hop-tac", "co-nen-ky-hop-dong", "Có nên ký hợp đồng này không?", "Sắp ký một thỏa thuận, muốn xem có gì cần lưu ý.", { safety: "nhay-cam" }),
  qSoSanh("hop-tac", "tiep-tuc-hay-dung-hop-tac", "Nên tiếp tục hay dừng hợp tác?", "Mối làm ăn đang lửng lơ, muốn biết đi tiếp hay dừng lại."),

  // ----- TÌNH DUYÊN / HÔN NHÂN (5) -----
  qLuan("tinh-duyen-hon-nhan", "co-nen-tien-toi", "Có nên tiến tới với người này không?", "Đang có cảm tình, phân vân có nên đi xa hơn."),
  qLuan("tinh-duyen-hon-nhan", "quan-he-hien-tai", "Mối quan hệ hiện tại của mình thế nào?", "Muốn nhìn rõ hơn về chuyện tình cảm đang có."),
  qLuan("tinh-duyen-hon-nhan", "hon-nhan", "Chuyện hôn nhân này có bền không?", "Đang tính chuyện lâu dài, muốn xem đường hôn nhân ra sao."),
  qLuan("tinh-duyen-hon-nhan", "nguoi-dang-tim-hieu", "Người đang tìm hiểu có hợp với mình không?", "Mới quen, muốn hiểu thêm về người ấy và duyên hai người."),
  qLuan("tinh-duyen-hon-nhan", "quay-lai-nguoi-cu", "Có nên quay lại với người cũ không?", "Đang phân vân nối lại, muốn nhìn rõ nên hay không."),

  // ----- THI CỬ (5) -----
  qLuan("thi-cu", "thi-do", "Kỳ thi sắp tới có đỗ không?", "Muốn biết kết quả có thuận, và nên chuẩn bị thế nào."),
  qSoSanh("thi-cu", "chon-truong", "Nên chọn trường nào?", "Đang phân vân giữa vài trường, muốn cân xem nơi nào hợp."),
  qSoSanh("thi-cu", "chon-nganh", "Nên chọn ngành nào?", "Đứng giữa mấy ngành học, muốn biết hướng nào hợp mình hơn."),
  qLuan("thi-cu", "thi-lai", "Có nên thi lại không?", "Phân vân giữa thi lại và đi hướng khác, muốn nhìn rõ hơn."),
  qLuan("thi-cu", "ky-thi-quan-trong", "Kỳ thi quan trọng này của mình thế nào?", "Một kỳ thi lớn sắp tới, muốn xem vận và cách chuẩn bị."),

  // ----- THI ĐẤU / CẠNH TRANH (4) -----
  qLuan("thi-dau-canh-tranh", "co-nen-tham-gia-thi-dau", "Có nên tham gia cuộc này không?", "Một cuộc thi/đấu thầu/ganh đua trước mặt, muốn xem có nên vào."),
  qLuan("thi-dau-canh-tranh", "kha-nang-canh-tranh", "Khả năng thắng của mình đến đâu?", "Muốn nhìn rõ lợi thế và điểm yếu của mình trong cuộc này."),
  qLuan("thi-dau-canh-tranh", "doi-thu", "Đối thủ của mình mạnh yếu ra sao?", "Muốn hiểu hơn về phía bên kia để liệu đường."),
  qLuan("thi-dau-canh-tranh", "chien-thuat", "Nên đi theo hướng nào để có lợi thế?", "Muốn tìm cách tiếp cận phù hợp cho cuộc ganh đua này."),

  // ----- KIỆN TỤNG / TRANH CHẤP (4) -----
  qLuan("kien-tung-tranh-chap", "co-nen-kien", "Có nên khởi kiện không?", "Đang cân nhắc đưa ra pháp luật, muốn nhìn rõ được mất.", { safety: "cao" }),
  qLuan("kien-tung-tranh-chap", "co-nen-hoa-giai", "Có nên hòa giải không?", "Phân vân giữa hòa giải và theo đến cùng.", { safety: "cao" }),
  qLuan("kien-tung-tranh-chap", "dam-phan", "Cuộc đàm phán này nên đi hướng nào?", "Sắp ngồi vào bàn thương lượng, muốn chuẩn bị tinh thần.", { safety: "cao" }),
  qLuan("kien-tung-tranh-chap", "tranh-chap-hop-dong", "Vụ tranh chấp hợp đồng này thế nào?", "Đang vướng tranh chấp, muốn nhìn rõ thế của mình.", { safety: "cao" }),

  // ----- SỨC KHỎE (3) -----
  qLuan("suc-khoe", "xu-huong-suc-khoe", "Sức khỏe dạo này có gì cần lưu ý không?", "Muốn nhìn xu hướng chung để giữ gìn cho tốt.", { engines: ["bat-tu"], safety: "cao" }),
  qLuan("suc-khoe", "dieu-tri", "Hướng điều trị này có ổn không?", "Đang cân nhắc một hướng chữa trị, muốn thêm góc nhìn tham khảo.", { engines: ["bat-tu"], safety: "cao" }),
  qLuan("suc-khoe", "quyet-dinh-cham-soc-suc-khoe", "Quyết định chăm sóc sức khỏe này nên thế nào?", "Một lựa chọn về sức khỏe đang phân vân, muốn cân nhắc thêm.", { engines: ["bat-tu"], safety: "cao" }),

  // ----- XUẤT HÀNH (4) -----
  qLuan("xuat-hanh", "chuyen-di", "Chuyến đi sắp tới có thuận không?", "Sắp đi đâu đó, muốn xem hành trình có suôn sẻ."),
  qLuan("xuat-hanh", "cong-tac", "Chuyến công tác này thế nào?", "Đi làm việc xa, muốn biết công việc lẫn đường đi ra sao."),
  qLuan("xuat-hanh", "gap-doi-tac", "Buổi gặp đối tác này có thuận không?", "Sắp gặp mặt bàn chuyện, muốn xem có đạt kết quả tốt."),
  qLuan("xuat-hanh", "xuat-hanh-quan-trong", "Chuyến đi quan trọng này của mình thế nào?", "Một chuyến đi lớn phía trước, muốn nhìn tổng thể trước khi lên đường."),

  // ----- CHỌN NGÀY GIỜ (6) — dùng trach-nhat, không gieo quẻ -----
  qNgay("chon-ngay-gio", "chon-ngay-khai-truong", "Chọn ngày giờ khai trương", "Tìm ngày giờ đẹp để mở cửa làm ăn, hợp tuổi người chủ."),
  qNgay("chon-ngay-gio", "chon-ngay-ky-hop-dong", "Chọn ngày giờ ký hợp đồng", "Tìm ngày giờ tốt để đặt bút ký kết, giao dịch."),
  qNgay("chon-ngay-gio", "chon-ngay-nhap-trach", "Chọn ngày giờ nhập trạch", "Tìm ngày giờ đẹp để dọn về nhà mới, hợp tuổi gia chủ."),
  qNgay("chon-ngay-gio", "chon-ngay-xuat-hanh", "Chọn ngày giờ xuất hành", "Tìm ngày giờ tốt để khởi hành cho chuyến đi quan trọng."),
  qNgay("chon-ngay-gio", "chon-ngay-cuoi-hoi", "Chọn ngày giờ cưới hỏi", "Tìm ngày giờ đẹp cho việc trọng đại của hai người."),
  qNgay("chon-ngay-gio", "chon-ngay-cong-viec-quan-trong", "Chọn ngày giờ cho việc quan trọng", "Tìm ngày giờ tốt cho một việc lớn anh/chị sắp làm."),

  // ----- QUYẾT ĐỊNH (5) — so sánh phương án -----
  qSoSanh("quyet-dinh", "a-hay-b", "Nên chọn A hay B?", "Đứng giữa hai lựa chọn, muốn cân xem bên nào hợp hơn."),
  qSoSanh("quyet-dinh", "a-b-c", "Nên chọn A, B hay C?", "Có ba hướng đi trước mặt, muốn soi từng cái để chọn."),
  qSoSanh("quyet-dinh", "tien-hay-lui", "Nên tiến hay nên lui?", "Một việc đang phân vân dấn tới hay rút lại — cân cả hai."),
  qSoSanh("quyet-dinh", "lam-ngay-hay-cho", "Nên làm ngay hay chờ thêm?", "Phân vân về thời điểm — bắt tay luôn hay đợi lúc hợp hơn."),
  qSoSanh("quyet-dinh", "tiep-tuc-hay-dung", "Nên tiếp tục hay nên dừng?", "Một việc đang lửng lơ, muốn biết đi tiếp hay dừng thì hơn."),
  qSoSanh("quyet-dinh", "mua-tai-san-nao", "Nên mua tài sản nào?", "Có mấy món tài sản đang cân nhắc, muốn soi từng cái để chọn."),

  // =============================================================================================
  // THƯ VIỆN CÂU HỎI GÓI CAO CẤP — "Đưa vấn đề, Quân Sư phân tích cùng anh/chị".
  // Theo mục 8-17 PHASE_QUESTION_LIBRARY. Khác gói Cơ bản ở DẠNG LUẬN: so sánh nhiều phương án
  // (qSoSanh) hoặc câu hỏi mở cần chẩn đoán/chiến lược/thời điểm (qSau) — không phải hỏi đóng.
  // =============================================================================================

  // ----- SỰ NGHIỆP — CHIẾN LƯỢC (mục 8) -----
  qSoSanh("su-nghiep", "o-lai-hay-chuyen-viec", "Nên ở lại hay chuyển sang cơ hội mới?", "Đang có lối rẽ trước mặt, muốn cân kỹ cả hai đường."),
  qSoSanh("su-nghiep", "chon-giua-hai-cong-viec", "Nên chọn công việc nào?", "Có mấy lời mời cùng lúc, muốn soi từng nơi trước khi gật đầu."),
  qSoSanh("su-nghiep", "chuyen-mon-hay-quan-ly", "Nên đi sâu chuyên môn hay chuyển sang quản lý?", "Hai hướng phát triển khác nhau, muốn biết hướng nào hợp mình hơn."),
  qSau("su-nghiep", "can-tro-su-nghiep", "Điều gì đang cản trở sự nghiệp của mình?", "Cảm thấy mãi không tiến lên được, muốn tìm ra nút thắt thật sự."),
  qSau("su-nghiep", "uu-tien-giai-doan-nay", "Giai đoạn này nên ưu tiên điều gì?", "Nhiều việc cùng lúc, muốn biết nên dồn sức vào đâu trước."),
  qSau("su-nghiep", "thoi-diem-doi-viec", "Khi nào là lúc phù hợp để đổi việc?", "Đã định đổi, chỉ còn phân vân nên đi lúc nào cho thuận."),

  // ----- TÀI CHÍNH — CHIẾN LƯỢC (mục 9) -----
  qSoSanh("tai-chinh", "giu-tien-hay-dau-tu", "Nên giữ tiền hay đem đầu tư?", "Đang có một khoản trong tay, phân vân để yên hay cho nó chạy.", { safety: "nhay-cam" }),
  qSoSanh("tai-chinh", "vay-hay-von-tu-co", "Nên vay hay dùng vốn tự có?", "Cần tiền làm việc lớn, muốn cân xem lấy từ nguồn nào thì hơn.", { safety: "nhay-cam" }),
  qSoSanh("tai-chinh", "phuong-an-giai-quyet-no", "Nên giải quyết khoản nợ này theo hướng nào?", "Có mấy cách xử lý, muốn chọn cách ít tổn thất nhất.", { safety: "nhay-cam" }),
  qSoSanh("tai-chinh", "tich-luy-hay-mo-rong", "Giai đoạn này nên tích lũy hay mở rộng?", "Muốn biết nên thủ cho chắc hay bung ra làm lớn.", { safety: "nhay-cam" }),
  qSau("tai-chinh", "khi-nao-xuong-tien", "Khi nào nên xuống tiền?", "Đã quyết làm, chỉ còn chọn thời điểm cho thuận.", { safety: "nhay-cam" }),

  // ----- ĐẦU TƯ — CHIẾN LƯỢC (mục 10) -----
  qSoSanh("dau-tu", "dau-tu-ngay-hay-cho", "Nên đầu tư ngay hay chờ thêm?", "Cơ hội đang mở, phân vân vào luôn hay đợi thời điểm tốt hơn.", { safety: "nhay-cam" }),
  qSoSanh("dau-tu", "chon-du-an-nao", "Nên chọn dự án nào?", "Có mấy dự án trước mặt, muốn soi từng cái để chọn.", { safety: "nhay-cam" }),
  qSoSanh("dau-tu", "thu-hoi-hay-tiep-tuc", "Nên thu hồi vốn hay tiếp tục?", "Khoản đầu tư đang lửng lơ, muốn cân giữa rút và theo tiếp.", { safety: "nhay-cam" }),
  qSoSanh("dau-tu", "phuong-an-trien-khai", "Nên triển khai theo phương án nào?", "Đã quyết làm, còn phân vân cách làm nào thì hơn.", { safety: "nhay-cam" }),
  qSau("dau-tu", "luu-y-du-an", "Dự án này có điểm nào cần đặc biệt lưu ý?", "Muốn biết trước chỗ dễ vấp để phòng từ đầu.", { safety: "nhay-cam" }),

  // ----- KINH DOANH — CHIẾN LƯỢC (mục 11) -----
  qSoSanh("kinh-doanh", "mo-rong-hay-phong-thu", "Nên mở rộng hay phòng thủ?", "Thị trường đang khó đoán, muốn biết nên tiến hay giữ."),
  qSoSanh("kinh-doanh", "chon-san-pham-nao", "Nên tập trung vào sản phẩm nào?", "Có mấy dòng sản phẩm, muốn biết nên dồn sức vào đâu."),
  qSoSanh("kinh-doanh", "chon-dia-diem-nao", "Nên chọn địa điểm nào?", "Có mấy mặt bằng đang nhắm, muốn soi từng chỗ."),
  qSau("kinh-doanh", "thay-doi-mo-hinh", "Có nên thay đổi mô hình kinh doanh không?", "Cách làm cũ đang chững lại, muốn biết có nên chuyển hướng."),
  qSau("kinh-doanh", "viec-kinh-doanh-vuong-gi", "Việc kinh doanh đang vướng ở đâu?", "Doanh thu không lên được, muốn tìm ra gốc rễ vấn đề."),
  qSau("kinh-doanh", "khi-nao-mo-rong", "Khi nào nên mở rộng?", "Đã tính mở rộng, chỉ còn chọn thời điểm."),

  // ----- BẤT ĐỘNG SẢN — CHIẾN LƯỢC (mục 12) -----
  qSoSanh("bat-dong-san", "mua-giu-hay-ban", "Nên mua, giữ hay bán?", "Ba hướng cùng cân, muốn nhìn rõ từng đường."),
  qSoSanh("bat-dong-san", "chon-bds-nao", "Nên chọn bất động sản nào?", "Có mấy căn/mảnh đang nhắm, muốn soi từng cái."),
  qSau("bat-dong-san", "muc-gia-nay-co-hop-ly", "Mức giá này đã hợp lý chưa?", "Đang thương lượng, muốn biết nên chốt hay ép thêm.", { safety: "nhay-cam" }),
  qSau("bat-dong-san", "khi-nao-ky-bds", "Khi nào nên ký?", "Đã ưng, chỉ còn chọn thời điểm đặt bút cho thuận."),

  // ----- HỢP TÁC — CHIẾN LƯỢC (mục 13) -----
  qSoSanh("hop-tac", "chu-dong-hay-cho-hop-tac", "Nên chủ động hay chờ họ lên tiếng?", "Đang ở thế lưng chừng, muốn biết nên đi trước hay đợi."),
  qSau("hop-tac", "doi-tac-lau-dai", "Người này có đi được đường dài không?", "Hợp tác bước đầu ổn, muốn nhìn xa hơn vài năm tới."),
  qSau("hop-tac", "phan-chia-vai-tro", "Nên phân chia vai trò thế nào?", "Sắp bắt tay làm chung, muốn chia việc sao cho bền."),
  qSau("hop-tac", "hop-tac-dang-vuong-gi", "Mối hợp tác đang vướng ở đâu?", "Làm chung mà thấy trục trặc, muốn tìm ra nguyên nhân."),

  // ----- TÌNH DUYÊN / HÔN NHÂN — CHIẾN LƯỢC (mục 14) -----
  qSoSanh("tinh-duyen-hon-nhan", "tien-toi-hay-dung-lai", "Nên tiến tới hay dừng lại?", "Đang ở ngã ba tình cảm, muốn cân cả hai đường."),
  qSau("tinh-duyen-hon-nhan", "xu-ly-moi-quan-he", "Mối quan hệ này nên xử lý thế nào?", "Đang rối, muốn tìm cách gỡ cho êm."),
  qSau("tinh-duyen-hon-nhan", "hon-nhan-dang-vuong-gi", "Hôn nhân đang gặp vấn đề gì?", "Cảm thấy có gì đó không ổn, muốn nhìn cho rõ gốc rễ."),
  qSau("tinh-duyen-hon-nhan", "thay-doi-cach-ung-xu", "Nên thay đổi cách ứng xử thế nào?", "Muốn giữ mối quan hệ, cần biết mình nên điều chỉnh chỗ nào."),

  // ----- THI CỬ — ĐỊNH HƯỚNG (mục 15) -----
  qSoSanh("thi-cu", "hoc-tiep-hay-di-lam", "Nên học tiếp hay đi làm?", "Hai hướng trước mặt, muốn cân xem đường nào hợp lúc này."),
  qSoSanh("thi-cu", "trong-nuoc-hay-nuoc-ngoai", "Nên học trong nước hay nước ngoài?", "Đang phân vân hai môi trường, muốn soi từng bên."),
  qSau("thi-cu", "doi-cach-hoc", "Có nên đổi cách học không?", "Học mãi không vào, muốn biết vấn đề nằm ở đâu."),

  // ----- CẠNH TRANH — CHIẾN LƯỢC (mục 16) -----
  qSoSanh("thi-dau-canh-tranh", "tien-hay-thu", "Nên tiến hay nên thủ?", "Cuộc đua đang căng, muốn biết lúc này nên xông hay giữ."),
  qSoSanh("thi-dau-canh-tranh", "chon-chien-thuat-nao", "Nên chọn chiến thuật nào?", "Có mấy cách đánh, muốn soi từng cách trước khi vào trận."),
  qSoSanh("thi-dau-canh-tranh", "dam-phan-hay-doi-dau", "Nên đàm phán hay đối đầu?", "Muốn cân giữa ngồi lại nói chuyện và làm tới cùng."),
  qSau("thi-dau-canh-tranh", "thoi-diem-ra-tay", "Khi nào là lúc nên ra tay?", "Đã chuẩn bị xong, chỉ còn chọn đúng thời điểm."),

  // ----- THỜI ĐIỂM — CHIẾN LƯỢC (mục 17) -----
  // KHÔNG đặt câu "khi nào" vào nhóm "quyết định": nhóm đó theo thiết kế chỉ chứa câu SO SÁNH
  // PHƯƠNG ÁN (output "so-sanh-phuong-an"), có test giữ bất biến này. Câu thời điểm đã được rải
  // vào đúng nhóm chuyên môn ở trên: thoi-diem-doi-viec (sự nghiệp), khi-nao-xuong-tien (tài
  // chính), khi-nao-mo-rong (kinh doanh), khi-nao-ky-bds (bất động sản), thoi-diem-ra-tay (cạnh
  // tranh) — sát hoàn cảnh hơn hẳn một câu "khi nào nên hành động" chung chung.
];
