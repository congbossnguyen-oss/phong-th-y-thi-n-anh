/**
 * Kho mô tả văn xuôi 8 Bát tinh — nguồn câu cho engine ghép bài luận (không gọi AI lúc chạy).
 *
 * Nguồn: `data/mo-ta-8-tinh.md` (simkinhdich.com, đối chiếu cùng hệ Bát Cực Linh Số), chủ dự án
 * cung cấp 2026-08-17. Chép nguyên ý, chỉ rút gọn cho vừa câu văn khi ghép.
 */
import type { TenTinh } from "../types.js";

export interface MoTaTinh {
  /** Tên sao trong hệ Tử Vi mà tài liệu gốc gắn kèm. */
  saoTuongUng: string;
  uuDiem: string;
  khuyetDiem: string;
  nhanCach: string;
  taiVan: string;
  suNghiep: string;
  tinhCam: string;
  sucKhoe: string;
  quyNhan: string;
  /** Lưu ý riêng của từng tinh, nếu tài liệu có nêu. */
  dacThu?: string;
}

export const MO_TA_8_TINH: Readonly<Record<TenTinh, MoTaTinh>> = {
  "Thiên Y": {
    saoTuongUng: "Cự Môn",
    uuDiem:
      "thông minh, thiện lương, lòng dạ khoáng đạt, có thể thành đại sự, mang đến tài vận và hôn nhân tốt",
    khuyetDiem:
      "quá thiện lương, không so đo nên dễ bị lừa; vì không thiếu tiền nên thường không có khái niệm về tiền, dễ bỏ lỡ những khoản nhỏ",
    nhanCach: "thiện lương, thông minh, hào phóng, hay trợ giúp người, đơn thuần, không tâm cơ",
    taiVan: "tiền tài đến từ tám phương, cả chính tài lẫn thiên tài, và dùng tiền hào phóng",
    suNghiep:
      "dễ thành ông chủ hoặc cánh tay đắc lực của ông chủ, công trạng tốt, thiên hướng thích tông giáo mệnh lý, giác quan thứ sáu mạnh",
    tinhCam:
      "Chính Đào Hoa — dễ gặp đối tượng lý tưởng, tình cảm ngọt ngào; nếu đã kết hôn thì đây là giai đoạn hôn nhân hạnh phúc nhất",
    sucKhoe:
      "cần chú ý huyết áp, tuần hoàn máu, bệnh tai mắt mũi — không phải càng nhiều Thiên Y càng tốt",
    quyNhan: "nền tảng nhân mạch hùng hậu, cả trưởng bối lẫn bạn bè",
  },
  "Sinh Khí": {
    saoTuongUng: "Tham Lang",
    uuDiem: "bản tính yên vui, lấy tâm bình tĩnh đối đãi mọi khó khăn",
    khuyetDiem: "không cưỡng cầu chuyện gì nên tâm ý dễ không mạnh, thiếu lòng cầu tiến",
    nhanCach:
      "lạc quan, tầm nhìn khai phát, tùy duyên, không so đo, thích trợ giúp người, nhân duyên tốt, nhưng ít chủ kiến và tương đối lười",
    taiVan:
      "quý nhân mang tài đến hoặc có tiền ngoài ý muốn, nhưng cũng dễ tiêu cho bạn bè, không giữ được tiền",
    suNghiep:
      "nhiều quý nhân trợ giúp, gặp dữ hóa lành, hợp công tác xã hội và đối ngoại, nhưng lòng cầu tiến không đủ",
    tinhCam: "không cưỡng cầu, tùy duyên, quan hệ hài hòa, hôn nhân ngọt ngào",
    sucKhoe: "bệnh dạ dày, tai mắt mũi, thường không nghiêm trọng",
    quyNhan: "bằng hữu nhiều, nhân duyên tốt — là sao cứu mạng, luôn có người trợ giúp khi nguy khốn",
  },
  "Diên Niên": {
    saoTuongUng: "Vũ Khúc",
    uuDiem:
      "thường là người lãnh đạo, có chủ trương, sức phán đoán mạnh, tâm địa thiện lương, ý chí kiên định, sức chịu đựng siêu cường, tương đối trường thọ",
    khuyetDiem:
      "không dễ tiếp nhận ý kiến người khác, tác phong cường thế, cố chấp, khó biến báo, cái tôi cao",
    nhanCach:
      "trách nhiệm mạnh, dám đảm đương, tâm địa thiện lương nhưng cường thế, cố chấp, lao lực, thích sĩ diện",
    taiVan: "vất vả kiếm tiền nhưng giữ được tiền, tính toán tỉ mỉ",
    suNghiep:
      "năng lực chuyên nghiệp, hợp làm lãnh đạo hoặc kỹ thuật, tự thân lao lực, áp lực lớn, có thể gánh vác một phương — đây là năng lượng quan trọng nhất trong số điện thoại nhưng thường bị coi nhẹ",
    tinhCam:
      "một lòng chuyên chú, yêu cầu cao, thà thiếu không ẩu, trọng cam kết, không thích tình cảm dây dưa",
    sucKhoe: "vất vả lâu ngày dễ có bệnh vai, cổ, eo, mất ngủ, rụng tóc, tinh thần căng thẳng",
    quyNhan: "tự thân đi làm, ít vận quý nhân — mọi thứ dựa vào chính mình",
    dacThu:
      "các cặp 19, 91, 78, 87 nữ giới không nên dùng lâu vì năng lượng quá mạnh, dễ khắc phu, dễ ly hôn",
  },
  "Phục Vị": {
    saoTuongUng: "Tả Phù",
    uuDiem: "sức chịu đựng và nghị lực hơn người, biết chờ đợi cơ hội, tiềm ẩn năng lực mạnh",
    khuyetDiem:
      "không dễ biến động, thiếu cảm giác an toàn, xử lý sự việc do dự, quá bảo thủ, cần được khen ngợi thay vì quở trách",
    nhanCach: "kiên nhẫn, nghị lực nhưng cứng nhắc, bảo thủ, cẩn thận quá mức, sợ mạo hiểm",
    taiVan: "kiếm tiền vất vả, thích thu nhập ổn định cố định",
    suNghiep:
      "hợp việc làm ổn định như công chức, đơn vị sự nghiệp; nhẫn nại chờ thời cơ nhưng dễ bỏ lỡ cơ hội tốt vì quá bảo thủ",
    tinhCam: "dễ phong bế, không chủ động biểu đạt, cần đối phương kiên nhẫn mở lòng",
    sucKhoe: "bệnh tim, não, lo nghĩ, bệnh ẩn tính — bình thường không thấy, khi phát thì nặng",
    quyNhan: "người nhà là quý nhân tốt nhất",
    dacThu:
      "Phục Vị nối mạch và khuếch đại năng lượng đứng ngay trước nó: trước là cát thì càng cát, trước là hung thì càng hung",
  },
  "Lục Sát": {
    saoTuongUng: "Văn Khúc",
    uuDiem: "tình cảm phong phú, duyên với người khác phái đặc biệt mạnh",
    khuyetDiem:
      "khốn khổ vì tình, quan hệ nhân mạch dễ đột nhiên chuyển xấu, tình cảm và hôn nhân không trôi chảy",
    nhanCach:
      "nhân duyên tốt, am hiểu giao tế, tư duy tinh tế nhưng nhạy cảm, đa nghi, do dự, chịu áp lực kém",
    taiVan:
      "dựa vào quan hệ nhân mạch để kiếm tiền, tiêu tiền cho gia đình hoặc người khác giới, không giữ được tiền",
    suNghiep:
      "quan hệ xã hội, ngoại giao, nghề phục vụ hoặc ngành thiên về nữ tính, nhưng không thực sự muốn làm lâu dài",
    tinhCam: "duyên khác phái mạnh nhưng dễ lệch sang đào hoa không chính, dễ ngoại tình",
    sucKhoe: "da, dạ dày, dễ u buồng trứng, chứng nóng nảy, bệnh tự kỷ",
    quyNhan: "vì đa nghi dễ tổn thương bằng hữu nên không có vận quý nhân",
  },
  "Họa Hại": {
    saoTuongUng: "Lộc Tồn",
    uuDiem:
      "miệng lưỡi lưu loát, hùng biện — các nghề dùng miệng kiếm cơm như diễn giả, MC đều liên quan",
    khuyetDiem:
      "tính khí nóng nảy, dễ cãi vã thị phi, khó được yêu mến trong quan hệ xã hội, người yếu dễ nhiều bệnh",
    nhanCach: "biết ăn nói, thẳng thắn, mạnh miệng, thích sĩ diện, nóng tính, hay phàn nàn",
    taiVan: "mở miệng là được tài nếu có thêm Thiên Y, hoặc dễ vì cãi vã mà phá tài",
    suNghiep: "công việc liên quan nói năng, thích chỉ huy người khác, dễ cãi vã thị phi",
    tinhCam: "ban đầu ngon ngọt, sau dễ cãi vã thị phi, dễ ly hôn",
    sucKhoe:
      "bệnh khoang miệng, khí quản, yết hầu, tuyến bạch huyết, lồng ngực; hao tổn nguyên khí, dễ mệt mỏi, dễ béo phì",
    quyNhan: "không có quý nhân tương trợ, nhiều thị phi",
  },
  "Tuyệt Mệnh": {
    saoTuongUng: "Phá Quân",
    uuDiem: "phản ứng nhanh, mẫn cảm mạnh, tâm địa mềm, thiện lương, thẳng tính, dễ tin bạn bè",
    khuyetDiem:
      "dễ phạm thượng kháng lệnh, quá chấp nhất, dễ sốc, thường chỉ trích người khác, tự cho là đúng, tình cảm và hôn nhân thiếu hòa hợp",
    nhanCach: "trọng tình nghĩa, tin bạn bè, dám mạo hiểm, dễ kích động, dễ bị lừa tiền",
    taiVan:
      "kiếm tiền nhanh hơn người khác một bước nhưng không giữ được, dễ phá tài; đầu tư, cổ phiếu, bất động sản liên quan chặt với năng lượng này",
    suNghiep: "đầu tư, tài chính, cổ phiếu, tự lập nghiệp — dám liều, quyết định cảm tính",
    tinhCam: "dũng cảm truy cầu nhưng năng lực cân đối kém, bất lợi hôn nhân, dễ ly hôn",
    sucKhoe:
      "gan, thận, tiểu đường, thậm chí tai nạn xe cộ — đây là hung tinh mạnh nhất trong bốn hung tinh",
    quyNhan: "không có, mọi thứ dựa vào chính mình",
    dacThu:
      "bản thân con số không có cát hung tuyệt đối, phải xét cả tổ hợp; đầu tư hay bất động sản đôi khi cần chính năng lượng này mới thành công",
  },
  "Ngũ Quỷ": {
    saoTuongUng: "Liêm Trinh",
    uuDiem: "tài hoa dồi dào, tư tưởng hay thay đổi, phản ứng nhanh, năng lực học tập mạnh",
    khuyetDiem:
      "không ổn định, dễ có họa sát thân; năng lượng càng lớn thì bệnh tật và rủi ro ngoài ý muốn càng nghiêm trọng",
    nhanCach:
      "thông minh, phản ứng nhanh, nhiều ý đồ, thay đổi thất thường, hay nghi ngờ, không dễ tin người",
    taiVan: "hợp buôn bán, mệnh lý tông giáo; tiền đến nhanh đi cũng nhanh, không ổn định",
    suNghiep: "thường xuyên biến động, không an phận, hợp buôn bán hoặc công việc đi lại nhiều",
    tinhCam: "hay thay đổi, không an phận, dễ vướng tay ba, ngoại tình, ly hôn",
    sucKhoe: "bệnh tim, tuần hoàn máu, tai ương ngoài ý muốn",
    quyNhan: "hay nghi ngờ, không tin người nên thiếu quý nhân",
    dacThu:
      "năng lượng Ngũ Quỷ cao đi cùng Tuyệt Mệnh dễ liên quan bệnh nặng — kết hợp hai hung tinh này cần đặc biệt lưu ý",
  },
};
