// QUÂN SƯ THIÊN ANH — Seed data cho Thư Viện Câu Hỏi (71 câu, 14 nhóm).
//
// DỮ LIỆU thuần: UI chỉ đọc từ đây, KHÔNG hard-code câu hỏi vào component.
// Kinh Dịch (Lục Hào) luôn là engine luận đoán chính → không liệt kê trong recommended_engines.
// Bát Tự/Tử Vi chỉ đưa SƠ ĐỒ VẬN TRÌNH (thời vận đang tốt hay xấu), không luận chi tiết.
// Nhóm "chọn ngày giờ" dùng trach-nhat (không gieo quẻ). Nhóm "quyết định" so sánh phương án.

import type { CategoryId, EngineRef, InputField, PricingTier, QuestionDefinition, SafetyLevel } from "./types";

// ---------------------------------------------------------------------------------------------
// Ô nhập dùng chung (tránh lặp lại 71 lần).

const IN_MO_TA: InputField = {
  key: "mo_ta_tinh_huong",
  label: "Kể ngắn gọn chuyện bạn đang gặp",
  type: "text",
  required: true,
  helpText: "Vài câu thôi — càng rõ hoàn cảnh, lời khuyên càng sát với bạn.",
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
  helpText: "Dùng để xem thời vận hiện tại của bạn đang thuận hay chưa thuận.",
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
  label: "Các phương án bạn đang cân nhắc",
  type: "phuong-an-list",
  required: true,
  helpText: "Ghi rõ từng lựa chọn (ví dụ: Phương án A, Phương án B) để cân nhắc từng cái.",
};

const IN_KHOANG_THOI_GIAN: InputField = {
  key: "khoang_thoi_gian",
  label: "Khoảng thời gian dự kiến",
  type: "date-range",
  required: true,
  helpText: "Bạn định làm việc này trong khoảng nào? Hệ thống sẽ tìm ngày giờ đẹp trong đó.",
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

/** Câu luận giải Kinh Dịch, kèm sơ đồ vận trình Bát Tự + Tử Vi (mặc định). */
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
    pricing_tier: opts.pricing ?? "nang-cao",
    safety_level: opts.safety ?? "thuong",
  };
}

/** Câu so sánh nhiều phương án (nhóm quyết định) — gieo quẻ riêng cho từng phương án rồi so sánh. */
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
    pricing_tier: opts.pricing ?? "nang-cao",
    safety_level: opts.safety ?? "thuong",
  };
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
// SEED — 71 câu hỏi.

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
  qLuan("dau-tu", "dau-tu-du-an", "Có nên rót tiền vào dự án này không?", "Một cơ hội đầu tư đang mở ra, muốn cân nhắc kỹ được mất.", { pricing: "cao-cap", safety: "nhay-cam" }),
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
  qLuan("kien-tung-tranh-chap", "co-nen-kien", "Có nên khởi kiện không?", "Đang cân nhắc đưa ra pháp luật, muốn nhìn rõ được mất.", { pricing: "cao-cap", safety: "cao" }),
  qLuan("kien-tung-tranh-chap", "co-nen-hoa-giai", "Có nên hòa giải không?", "Phân vân giữa hòa giải và theo đến cùng.", { safety: "cao" }),
  qLuan("kien-tung-tranh-chap", "dam-phan", "Cuộc đàm phán này nên đi hướng nào?", "Sắp ngồi vào bàn thương lượng, muốn chuẩn bị tinh thần.", { safety: "cao" }),
  qLuan("kien-tung-tranh-chap", "tranh-chap-hop-dong", "Vụ tranh chấp hợp đồng này thế nào?", "Đang vướng tranh chấp, muốn nhìn rõ thế của mình.", { safety: "cao" }),

  // ----- SỨC KHỎE (3) -----
  qLuan("suc-khoe", "xu-huong-suc-khoe", "Sức khỏe dạo này có gì cần lưu ý không?", "Muốn nhìn xu hướng chung để giữ gìn cho tốt.", { engines: ["bat-tu"], safety: "cao" }),
  qLuan("suc-khoe", "dieu-tri", "Hướng điều trị này có ổn không?", "Đang cân nhắc một hướng chữa trị, muốn thêm góc nhìn tham khảo.", { pricing: "cao-cap", engines: ["bat-tu"], safety: "cao" }),
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
  qNgay("chon-ngay-gio", "chon-ngay-cong-viec-quan-trong", "Chọn ngày giờ cho việc quan trọng", "Tìm ngày giờ tốt cho một việc lớn bạn sắp làm."),

  // ----- QUYẾT ĐỊNH (5) — so sánh phương án -----
  qSoSanh("quyet-dinh", "a-hay-b", "Nên chọn A hay B?", "Đứng giữa hai lựa chọn, muốn cân xem bên nào hợp hơn."),
  qSoSanh("quyet-dinh", "a-b-c", "Nên chọn A, B hay C?", "Có ba hướng đi trước mặt, muốn soi từng cái để chọn."),
  qSoSanh("quyet-dinh", "tien-hay-lui", "Nên tiến hay nên lui?", "Một việc đang phân vân dấn tới hay rút lại — cân cả hai."),
  qSoSanh("quyet-dinh", "lam-ngay-hay-cho", "Nên làm ngay hay chờ thêm?", "Phân vân về thời điểm — bắt tay luôn hay đợi lúc hợp hơn."),
  qSoSanh("quyet-dinh", "tiep-tuc-hay-dung", "Nên tiếp tục hay nên dừng?", "Một việc đang lửng lơ, muốn biết đi tiếp hay dừng thì hơn."),
];
