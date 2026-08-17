/**
 * Ý nghĩa riêng của TỪNG CẶP trong 64 cặp Bát tinh, theo 8 mặt.
 *
 * Nguồn: **Chương 2 "Chi tiết ý nghĩa từng cặp số trong các từ trường"**, sách "Sim Nói Gì Về Bạn"
 * (App Phương Đông Huyền Bí). Chủ dự án cung cấp bản OCR 2026-08-17.
 *
 * Đây là phần mà chính `luan-so-dien-thoai-SKILL.md` ghi là "chưa được số hóa do dung lượng quá
 * lớn" — trước bản này engine chỉ phân biệt 64 cặp bằng tên tinh + cấp độ, nên 18 và 81 bị coi như
 * nhau. Nay mỗi cặp có nội dung riêng.
 *
 * ⚠️ VỀ CHẤT LƯỢNG NGUỒN: bản OCR bị xáo trộn thứ tự từ rất nặng (chữ bị đẩy xuống cuối đoạn, vd
 * "đặt giá trị đạo đức và nhân hàng … văn lên đầu" thay vì "đặt giá trị đạo đức và nhân văn lên
 * hàng đầu"). Khi số hoá, chỉ **ghép lại đúng trật tự từ** và bỏ ký tự rác — KHÔNG thêm ý mới,
 * không diễn giải rộng ra. Những chỗ OCR cắt cụt hẳn không khôi phục được thì ghi vào
 * `docs/luan-so-dien-thoai-data/chuong2-khuyet-ocr.md` chứ không bịa cho đầy.
 *
 * Hai cặp **67** và **61** bị OCR làm mất dòng tiêu đề số; đã xác định lại bằng cả vị trí trong
 * dãy (67 nằm ngay sau 76 — cặp đôi Sinh Khí cấp 2; 61 ngay sau 16 — cặp đôi Lục Sát cấp 1) lẫn
 * nội dung, xem ghi chú trong file khuyết OCR.
 */

/** Tám mặt mà Chương 2 luận cho mỗi cặp. Thiếu mặt nào là do OCR cắt, không phải sách thiếu. */
export interface YNghiaCap {
  tinhCach: string;
  taiVan: string;
  suNghiep: string;
  nhanDuyen: string;
  sucKhoe: string;
  hocTap: string;
  camXuc: string;
  honNhan: string;
}

export const Y_NGHIA_TUNG_CAP: Readonly<Record<string, YNghiaCap>> = {
  // ─────────────────────────── THIÊN Y — Tài phú ───────────────────────────
  "13": {
    tinhCach:
      "Tâm địa hiền lành, trong sáng, chính trực. Giàu lòng trắc ẩn, dễ cảm thông và yêu thương, tạo được thiện cảm ngay từ lần đầu tiếp xúc. Tính cách nhẹ nhàng nhưng rất kiên định, có thiên hướng làm việc thiện, chữa lành hoặc truyền cảm hứng.",
    taiVan:
      "Tài lộc đến do thiên thời, quý nhân và phúc đức mang lại, chứ không thiên về đấu đá hay liều lĩnh. Có duyên với nghề giáo dục, chăm sóc sức khoẻ, tâm lý, dịch vụ, truyền thông mang tính xây dựng. Kiên trì theo đuổi giá trị chân thật thì tiền tài đến tự nhiên và bền vững.",
    suNghiep:
      "Có thiên tư lãnh đạo, đặc biệt là người đặt giá trị đạo đức và nhân văn lên hàng đầu. Phù hợp làm những công việc liên quan đến giáo dục, nghiên cứu, tâm linh, sức khoẻ, nhân sự, phát triển cộng đồng. Có khả năng trở thành người dẫn đường, người lãnh đạo truyền cảm hứng.",
    nhanDuyen:
      "Quý nhân xuất hiện nhiều trong cuộc sống, đặc biệt là người lớn tuổi, từng trải, có tâm thiện lành. Có thể trở thành trung tâm của một mạng lưới kết nối mạnh mẽ nhờ phúc đức và năng lượng tích cực đáng tin.",
    sucKhoe:
      "Dễ gặp vấn đề về huyết áp, da liễu, hệ tuần hoàn và các bệnh liên quan đến ngũ quan. Cần chú ý điều độ trong sinh hoạt và giữ tâm an tịnh.",
    hocTap:
      "Sở hữu giác quan thứ sáu, trực giác mạnh. Học tốt thông qua trải nghiệm, lắng nghe và suy ngẫm. Yêu thích các bộ môn triết học, văn hoá, tôn giáo, tâm lý học, chữa lành và huyền học.",
    camXuc:
      "Cảm xúc sâu sắc, chân thành, dễ động lòng, yêu thương và hy sinh. Có thể yêu từ ánh nhìn đầu tiên, nhưng thường nghiêng về sự chăm sóc, nuôi dưỡng hơn là đam mê bốc đồng. Là mẫu người mang lại sự bình yên cho người khác.",
    honNhan:
      "Hôn nhân thuận hoà nếu tìm được người cùng chí hướng, có đạo đức và lý tưởng tương đồng. Hấp dẫn với người thích chiều sâu nội tâm, hoặc người đang tìm kiếm sự chữa lành, ổn định, chung thuỷ. Cuộc sống gia đình mang đậm màu sắc trách nhiệm và phúc đức.",
  },
  "31": {
    tinhCach:
      "Lương thiện, thật thà, có tâm sáng và suy nghĩ đơn giản. Trí tuệ sáng suốt, hay giúp người, có lòng bao dung. Nội tâm cởi mở, dễ kết giao bạn bè.",
    taiVan:
      "Có quý nhân phù trợ trong tài chính, dễ gặp cơ hội bất ngờ về tiền bạc. Khả năng kiếm tiền từ các lĩnh vực chính thống như giáo dục, y học, tâm linh, tư vấn, chữa lành. Vận tiền bạc vững và ổn định nếu giữ được tâm thiện.",
    suNghiep:
      "Phù hợp các ngành chữa lành, chăm sóc sức khoẻ, hỗ trợ tinh thần. Dễ thành công khi làm những việc có yếu tố giúp người khác cải thiện thân tâm. Làm nghề gì cũng có thể thành công nếu đặt giá trị nhân văn lên trước tiền bạc.",
    nhanDuyen:
      "Có rất nhiều quý nhân âm thầm giúp đỡ, do khí chất thiện lương và hành xử có đạo. Người thân, bạn bè, đối tác đều sẵn lòng hỗ trợ, nhân duyên rất rộng. Gieo gì gặt nấy — càng sống thiện thì quý nhân càng xuất hiện.",
    sucKhoe:
      "Dễ gặp vấn đề về máu huyết, tim mạch, huyết áp, da liễu và các bệnh liên quan đến ngũ quan. Tuy nhiên nếu duy trì năng lượng tích cực và ăn uống điều độ thì không nghiêm trọng.",
    hocTap:
      "Có trực giác nhạy bén, thích học những lĩnh vực có chiều sâu như tâm linh, văn hoá, chữa lành. Học nhanh, dễ nhớ, hợp nhất với kiểu học thiên về cảm xúc, nhân văn, biểu đạt. Có khiếu với ngôn ngữ, giảng dạy, chữa lành.",
    camXuc:
      "Dễ rung động với những điều nhỏ bé. Có khả năng kết nối cảm xúc tốt, sống tử tế và lan toả năng lượng tích cực.",
    honNhan:
      "Tình duyên thuận lợi, dễ gặp người yêu thương và trân trọng mình. Duyên lành đến từ lòng tốt và cách sống tử tế. Dễ có hôn nhân hạnh phúc, đời sống tình cảm ngọt ngào.",
  },
  "68": {
    tinhCach:
      "Tâm địa thiện lương, trí tuệ sáng suốt, tính tình ngay thẳng, chân thành. Dễ tạo thiện cảm với người khác, lòng bao dung, dễ cảm thông. Tính cách hướng nội nhưng không bị động, có chiều sâu trong tư duy.",
    taiVan:
      "Có khả năng thu hút tài lộc ổn định, đặc biệt nếu theo đúng thiên hướng nghề nghiệp phù hợp với đạo đức và phục vụ cộng đồng.",
    suNghiep:
      "Có duyên làm nghề chữa lành, giáo dục, tâm linh, nghệ thuật, nhân đạo. Thường được cấp trên đánh giá cao, dễ phát triển sự nghiệp ổn định lâu dài. Có khí chất lãnh đạo đức độ, thiên hướng xây dựng nền tảng bền vững.",
    nhanDuyen:
      "Quý nhân xuất hiện nhiều và rõ ràng, có duyên gặp người nâng đỡ, dìu dắt. Dòng người giúp đỡ đến từ nhiều tầng lớp, là quý nhân hữu hình, hỗ trợ thực tế. Mối quan hệ xã hội ổn định, nhiều người tin tưởng.",
    sucKhoe:
      "Cần chăm sóc tinh thần và hệ tuần hoàn, tránh làm việc quá sức dẫn đến suy kiệt.",
    hocTap:
      "Trực giác tốt, có thiên hướng học tâm linh, triết lý, văn hoá chiều sâu. Dễ tiếp thu các giá trị đạo học và tư duy triết học cổ điển. Học tốt khi có cảm hứng và mục tiêu tinh thần cao đẹp.",
    camXuc:
      "Tình cảm thuần hậu, dễ rung động, sống tình cảm. Có xu hướng trao đi nhiều nhưng không mong cầu. Khi yêu là yêu sâu đậm, dễ cảm mến những người yếu thế.",
    honNhan:
      "Có duyên với người đồng hành lâu dài, tâm đầu ý hợp. Kết duyên với người cùng chí hướng, cùng đạo đức thì dễ có hôn nhân hạnh phúc. Tuy nhiên dễ bị cảm xúc chi phối nếu không đủ kiên định, cần rõ ràng về lý trí.",
  },
  "86": {
    tinhCach:
      "Lương thiện, thông minh, đơn thuần, tâm hồn cởi mở, tính cách dễ thương và dễ được yêu mến.",
    taiVan:
      "Được trời ban tài lộc, vừa có chính tài (thu nhập ổn định) vừa có thiên tài (nguồn thu bất ngờ). Dễ đạt độc lập tài chính.",
    suNghiep:
      "Được quý nhân nâng đỡ, có khả năng làm chủ, giỏi xây dựng hệ thống vững chắc, phù hợp mô hình lớn.",
    nhanDuyen:
      "Có nhiều quý nhân giúp đỡ, quan hệ xã hội rộng rãi, được người xung quanh yêu quý và hỗ trợ mạnh mẽ.",
    sucKhoe:
      "Cần lưu ý các bệnh liên quan đến ngũ quan (mắt, tai, mũi, miệng, lưỡi).",
    hocTap: "Thiên hướng học về tâm linh và văn hoá chiều sâu.",
    camXuc:
      "Dễ rung động ngay từ lần đầu gặp gỡ, hướng tới tình yêu chân thành, thích giao tiếp tình cảm, thân thiện và dễ gần.",
    honNhan:
      "Duyên đẹp, nhân duyên tốt, được trời ban may mắn về tình cảm. Vợ chồng dễ hoà hợp và hạnh phúc lâu dài.",
  },
  "49": {
    tinhCach:
      "Tấm lòng lương thiện, thông minh, đơn giản, tâm hồn rộng mở, dễ cảm thông và dễ tiếp cận.",
    taiVan:
      "Được trời ban tài lộc, tiền bạc đến một cách chính đáng, dễ được người khác hỗ trợ, có năng lực kiếm tiền độc lập.",
    suNghiep:
      "Được thiên thời giúp đỡ, phù hợp với mô hình tổ chức rõ ràng, thích hợp với các ngành nghề lớn và có cấu trúc.",
    nhanDuyen:
      "Giao tiếp rộng rãi, được nhiều người hỗ trợ, nguồn lực xã hội phong phú.",
    sucKhoe:
      "Dễ gặp vấn đề về máu huyết, áp lực vùng đầu, da đầu hoặc các bệnh liên quan đến ngũ quan.",
    hocTap:
      "Trực giác và cảm thụ mạnh, yêu thích văn hoá tâm linh, nhạy bén với các biểu tượng và chiều sâu.",
    camXuc:
      "Dễ rung động; khi yêu thì sâu đậm, chân thành, thích chia sẻ và giao tiếp trong các mối quan hệ.",
    honNhan:
      "Duyên đẹp, nhân duyên tốt lành, được người khác yêu thương và hỗ trợ, tình cảm bền chặt và ấm áp.",
  },
  "94": {
    tinhCach:
      "Lương thiện, thông minh, đơn thuần, tâm hồn rộng mở, chân thành và dễ tin người.",
    taiVan:
      "Được trời ban tài lộc, vừa có chính tài (thu nhập ổn định) vừa có thiên tài (nguồn thu ngoài kế hoạch), dễ đạt tự lập tài chính.",
    suNghiep:
      "Được quý nhân hỗ trợ, thích hợp làm chủ, lãnh đạo, có nền tảng vững chắc để phát triển sự nghiệp lớn.",
    nhanDuyen:
      "Có nhiều quý nhân, được hỗ trợ mạnh mẽ; các mối quan hệ tốt, rộng mở, dễ gặp người giúp đỡ.",
    sucKhoe:
      "Cần lưu ý các bệnh về máu huyết, huyết áp, da đầu và ngũ quan (tai, mắt, mũi, miệng, lưỡi).",
    hocTap:
      "Trực giác mạnh mẽ, cảm nhận tốt, yêu thích văn hoá và tâm linh, có xu hướng học hỏi theo chiều sâu.",
    camXuc:
      "Dễ rung động, dễ yêu ngay từ lần đầu gặp gỡ, biết cách thể hiện cảm xúc và giao tiếp tình cảm khéo léo.",
    honNhan:
      "Duyên lành, dễ gặp được người có nhân duyên tốt do trời định; tình cảm ngọt ngào, bền vững và được yêu thương.",
  },
  "27": {
    tinhCach:
      "Tâm hồn lương thiện, cởi mở, bao dung, dễ được lòng người khác. Trí tuệ mềm, học nhanh nhưng khiêm tốn, thích hỗ trợ người khác hơn là cạnh tranh. Có năng lượng của người chữa lành — bạn bè, người thân thường tìm đến để tâm sự, xin lời khuyên.",
    taiVan:
      "Tài chính vững vàng nếu theo nghề dịch vụ, y tế, giáo dục, tâm lý, tâm linh, nhân sự, chăm sóc sức khoẻ. Dễ được người khác giúp đỡ về tài chính hoặc được hưởng tài sản, phần phúc từ tổ tiên. Có thể không giàu nhanh, nhưng giàu đều và ổn định nếu giữ vững tâm thiện.",
    suNghiep:
      "Thích hợp với các ngành nghề thiện lành, chăm sóc, truyền cảm hứng, hoặc giáo dục, tư vấn, chia sẻ giá trị. Có tố chất lãnh đạo mềm — không áp đặt mà dẫn dắt bằng sự hiểu biết và nhân hậu. Càng về sau sự nghiệp càng ổn định, có tiếng nói, được tôn trọng trong cộng đồng.",
    nhanDuyen:
      "Quý nhân đến từ tâm thiện, lời nói và hành vi tử tế — người bạn giúp trước sẽ nâng đỡ bạn sau. Có thể được người lớn tuổi, người trong ngành trị liệu hoặc giới học thuật giúp đỡ.",
    sucKhoe:
      "Khí Thổ vượng, cần lưu ý huyết áp, đường huyết, tim mạch; hệ tiêu hoá, lá lách, dạ dày. Hạn chế trầm cảm nhẹ do cảm xúc thấm ngược nếu không được chia sẻ đúng cách.",
    hocTap:
      "Trực giác mạnh, khả năng học sâu, cảm nhận tốt các ngành như tâm lý, y học cổ truyền, huyền học, triết học, trị liệu tinh thần. Thường có năng khiếu liên quan đến cảm thụ (âm nhạc, ngôn ngữ, nghệ thuật). Có thể theo con đường nghiên cứu chuyên sâu hoặc hướng dẫn, giảng dạy người khác.",
    camXuc:
      "Là người sống tình cảm, giàu cảm xúc, dễ rung động và biết yêu sâu sắc. Có thiên hướng bao dung, tha thứ, đôi khi chịu thiệt nhưng lại tích được phúc dày. Có khả năng chữa lành người khác bằng sự hiện diện, ánh mắt, lời nói.",
    honNhan:
      "Duyên lành nếu kết hôn với người hiểu giá trị chữa lành, đồng hành và nâng đỡ nhau. Có thể hơi thiên về hy sinh, nên cần học cách giữ ranh giới rõ ràng để không bị tổn thương. Được gọi là “mảnh đất nuôi dưỡng” — ai đi cùng thì người đó thăng hoa.",
  },
  "72": {
    tinhCach:
      "Tâm sáng, lòng thiện, có xu hướng sống vì người khác. Đầu óc thông minh, dễ tiếp thu tri thức, nhưng sống đơn giản không phức tạp. Luôn tin vào điều thiện lành, đôi khi bị xem là quá hiền hoặc dễ bị lợi dụng nếu không đủ tỉnh táo.",
    taiVan:
      "Mang trường khí của lộc trời ban, tài vận tích luỹ từ phúc đức. Dễ kiếm tiền từ việc chia sẻ giá trị, giảng dạy, tư vấn, nghệ thuật hoặc nghề thiện lành. Nếu biết tận dụng năng lực trực giác, có thể đầu tư đúng chỗ và thu được nhiều lộc.",
    suNghiep:
      "Có khả năng làm chủ công việc trong vai trò cố vấn, hướng dẫn, giáo dục, chữa lành hoặc tư duy sáng tạo. Rất phù hợp với vai trò người dẫn đường, hỗ trợ người khác phát triển. Từ trung niên trở đi, vận sự nghiệp càng mở rộng nếu gắn liền với đạo đức và tâm thiện.",
    nhanDuyen:
      "Quý nhân thường là người lớn tuổi, trưởng bối, hoặc người trong ngành nghề có uy tín. Người mang số này thu hút quý nhân bằng sự chân thành và uy tín lâu dài, không phải nhờ khéo miệng hay lợi dụng.",
    sucKhoe:
      "Chú ý bệnh về máu, huyết áp, da đầu, da mặt và các bệnh liên quan ngũ quan (mắt, mũi, tai, miệng, họng). Nên theo dõi huyết áp, giữ thói quen sống điều độ và ăn uống lành mạnh.",
    hocTap:
      "Có thiên hướng học hỏi về tâm linh, văn hoá truyền thống, triết học, tôn giáo hoặc chữa lành. Rất mạnh về giác quan thứ sáu, trực giác và cảm nhận sâu sắc. Yêu thích các chủ đề huyền bí, tâm lý học, nhân tướng, tử vi, thiền định.",
    camXuc:
      "Một khi yêu là trọn tình trọn nghĩa, hết lòng. Có xu hướng bao dung quá mức trong tình yêu, nếu không cân bằng dễ bị tổn thương. Hợp với người có nội tâm sâu sắc, hiểu giá trị tâm linh; không hợp với người khô khan, thiên về vật chất.",
    honNhan:
      "Hôn nhân càng về sau càng hạnh phúc nếu cả hai cùng chia sẻ những giá trị tinh thần. Nếu lập gia đình sớm mà thiếu nền tảng tư tưởng đồng điệu, dễ bị cảm xúc chi phối hoặc bị lệ thuộc. Về già dễ có cuộc sống viên mãn, con cháu đủ đầy, sống đạo lý và yên ổn.",
  },

  // ────────────── DIÊN NIÊN — Quyền lực, sự nghiệp, sức khoẻ ──────────────
  "19": {
    tinhCach:
      "Khí chất mạnh mẽ, quyết đoán, bản lĩnh, toát ra phong thái của bậc đại tướng. Tư duy độc lập, ít bị ảnh hưởng bởi cảm xúc, sẵn sàng chịu trách nhiệm. Có xu hướng thích kiểm soát, dễ hình thành tâm thế người lãnh đạo, chủ quản, trụ cột. Trong một tập thể, họ là người chịu chơi, chịu gánh vác, không dễ gục ngã.",
    taiVan:
      "Tài chính ổn định và lâu dài nếu đi đúng hướng nghề nghiệp, đặc biệt trong các lĩnh vực quản trị, đầu tư, quân sự, bảo vệ, bất động sản. Là người biết cách giữ tiền, không tiêu xài phung phí. Tiền đến từ sự kiểm soát, tính toán cẩn thận, tích luỹ đều đặn.",
    suNghiep:
      "Phù hợp với vai trò chuyên môn cao đòi hỏi chiều sâu, hoặc vị trí quản lý, điều phối, chiến lược. Thường lựa chọn một đường đi riêng biệt, không theo số đông. Có thể trở thành người lãnh đạo cứng rắn nhưng đáng tin, nếu biết phối hợp thêm sự mềm mại và linh hoạt trong giao tiếp.",
    nhanDuyen:
      "Tuy không có nhiều quý nhân vây quanh như các số thuộc Thiên Y, Sinh Khí, nhưng người giúp đỡ đều là người có trọng lượng trong lĩnh vực chuyên sâu. Đặc biệt vượng quý nhân nếu biết “nhu trong cương”.",
    sucKhoe:
      "Dễ gặp các bệnh liên quan đến hệ thần kinh, vai gáy, cột sống, khớp, tim mạch, tuần hoàn. Cần vận động điều độ, tránh tích tụ căng thẳng và áp lực lâu dài.",
    hocTap:
      "Tư duy logic mạnh, thích đào sâu, không dễ thoả hiệp với kiến thức nửa vời. Có khả năng học tập chuyên sâu, trở thành chuyên gia đầu ngành hoặc bậc thầy trong một lĩnh vực. Phù hợp với nghiên cứu, kỹ thuật, công nghệ, tài chính, luật, quân sự, hoặc nghệ thuật có tính cấu trúc cao.",
    camXuc:
      "Cảm xúc có phần khô khan, thường ưu tiên lý trí. Khó thể hiện tình cảm, nhưng một khi đã yêu thương thì rất chung thuỷ, chịu trách nhiệm, bảo vệ người thân. Thường yêu trễ, ít nói lời ngọt ngào nhưng hành động chắc chắn.",
    honNhan:
      "Trong hôn nhân, họ là người trụ cột, gánh vác và bảo vệ. Tuy nhiên nếu không khéo, dễ tạo cảm giác cứng nhắc, bảo thủ, thiếu lắng nghe. Nên kết đôi với người mềm mại, linh hoạt, có chiều sâu nội tâm để cân bằng.",
  },
  "91": {
    tinhCach:
      "Mạnh mẽ, có uy nghiêm, hành xử như người từng trải. Có khí chất của một nhà lãnh đạo lớn, mang phong thái điềm tĩnh và cứng cỏi.",
    taiVan:
      "Cẩn thận trong quản lý tài chính, không tiêu xài hoang phí. Tích luỹ tài sản từ từ, trọng sự ổn định, dễ giàu nhờ tiết kiệm và tính toán.",
    suNghiep:
      "Có năng lực chuyên môn cao, làm việc độc lập tốt. Có thể đảm nhận vai trò chủ lực, giỏi chịu áp lực và có tinh thần trách nhiệm cao.",
    nhanDuyen:
      "Có quý nhân là người lớn tuổi, có uy tín. Dễ được người xung quanh tôn trọng và tin tưởng, giữ vai trò kết nối cộng đồng.",
    sucKhoe:
      "Dễ mắc các bệnh về cổ, vai gáy, xương khớp. Cũng cần lưu ý rối loạn thần kinh do mất ngủ và căng thẳng kéo dài.",
    hocTap:
      "Học tốt theo hướng chuyên sâu, nghiên cứu kỹ lưỡng. Khi đã chọn hướng đi sẽ theo đuổi tới cùng, có thể trở thành chuyên gia hoặc đạt trình độ học thuật cao.",
    camXuc:
      "Ít biểu lộ tình cảm ra ngoài, nội tâm trung thành, thuỷ chung. Khi đã yêu sẽ yêu sâu sắc, không thay đổi, nhưng không giỏi thể hiện cảm xúc.",
    honNhan:
      "Là người làm chủ gia đình, trung thành và có trách nhiệm. Đặt nặng nghĩa vụ, đôi khi quá nghiêm khắc nhưng luôn vì sự ổn định.",
  },
  "78": {
    tinhCach:
      "Mạnh mẽ, cứng rắn, mang tâm thế của người lớn tuổi; có khí chất của bậc đại tướng, sống có trách nhiệm.",
    taiVan:
      "Cẩn trọng trong chi tiêu, tuyệt đối không hoang phí, tài chính ổn định, tích luỹ tốt.",
    suNghiep:
      "Là người dẫn dắt chuyên môn, giỏi một lĩnh vực cụ thể, chịu được trách nhiệm lớn.",
    nhanDuyen:
      "Có phong thái của người đáng tin cậy, dễ được người lớn tuổi hoặc cấp trên hỗ trợ; nhân duyên bao dung, có người bảo trợ xung quanh.",
    sucKhoe:
      "Dễ mắc bệnh về vai, lưng, khớp; có thể gặp các vấn đề về thần kinh, mất ngủ, tim mạch.",
    hocTap:
      "Giỏi nghiên cứu, học hành tập trung chuyên sâu, có thể đạt đến trình độ học thuật cao.",
    camXuc:
      "Một lòng một dạ, trung thành và chuyên tâm trong tình cảm; yêu ai thì hết lòng, không dễ rời bỏ.",
    honNhan:
      "Là trụ cột trong gia đình, trung thành và chuyên tâm, có trách nhiệm, không dễ thay lòng.",
  },
  "87": {
    tinhCach:
      "Kiên cường, quyết đoán, mang khí chất của nhà lãnh đạo. Có tâm thế vững vàng, không dễ lung lay trước khó khăn. Tuy nhiên cũng dễ bị đánh giá là bảo thủ, cứng đầu nếu không lắng nghe người khác. Tư duy logic, mạch lạc, trọng lý lẽ và thường là người giữ nguyên tắc, kỷ luật cao.",
    taiVan:
      "Tài lộc đến từ sự cần cù, tích luỹ và vận hành thực tế chứ không phải may mắn. Có khả năng kiếm tiền tốt từ các lĩnh vực kỹ thuật, tài chính, sản xuất, bất động sản hoặc công việc có hệ thống rõ ràng. Biết cách kiểm soát tài chính, có xu hướng tiết kiệm và đầu tư hơn là tiêu xài.",
    suNghiep:
      "Tinh thần trách nhiệm cao, hợp vị trí trụ cột, quản lý, điều hành hoặc chuyên gia sâu một lĩnh vực. Là người có năng lực dẫn dắt đội nhóm hoặc phát triển mô hình riêng, nhưng thường chọn làm việc âm thầm. Càng về sau, sự nghiệp càng vững vàng nếu trung thành với nguyên tắc và đạo đức nghề nghiệp.",
    nhanDuyen:
      "Có quý nhân là người cao tuổi, trưởng thành, có uy tín hoặc từng trải, sẵn sàng nâng đỡ khi cần. Tuy không dễ nhận được hỗ trợ từ nhiều phía cùng lúc, nhưng một khi có sự giúp đỡ thì sẽ rất lâu dài và có giá trị thực. Nên học cách cởi mở và trao đổi nhiều hơn để duyên quý nhân được kích hoạt dễ dàng hơn.",
    sucKhoe:
      "Dễ gặp các vấn đề về cơ, xương khớp, vai gáy, thắt lưng, bệnh mãn tính hoặc rối loạn thần kinh nhẹ. Cần tránh làm việc quá tải hoặc cố chấp chịu đựng một mình dẫn đến áp lực thần kinh. Hợp với các phương pháp thư giãn cơ thể, yoga, khí công hoặc vận động cường độ vừa phải.",
    hocTap:
      "Thường thích đi sâu vào chuyên môn hơn là lan toả rộng. Thích hợp với phương pháp học tập nghiêm túc, kỷ luật, cần môi trường ít bị phân tâm. Có năng lực phát triển đỉnh cao trong các lĩnh vực cần sự tập trung, nghiên cứu, phân tích chuyên sâu.",
    camXuc:
      "Là người sống nội tâm, không dễ thể hiện cảm xúc ra ngoài. Tình cảm sâu sắc, trung thành, đôi khi quá lý trí khiến đối phương khó nắm bắt. Nếu học được cách chia sẻ cảm xúc nhiều hơn sẽ giúp cải thiện chất lượng mối quan hệ.",
    honNhan:
      "Là người gánh vác và bảo vệ gia đình. Tuy nhiên, đôi khi vì quá thiên về lý trí hoặc công việc mà thiếu sự mềm mại trong quan hệ vợ chồng. Hợp với người kiên nhẫn, sống tình cảm, biết bù trừ sự cứng rắn của bản mệnh.",
  },
  "34": {
    tinhCach:
      "Thường có tinh thần trách nhiệm cao, tính cách mạnh mẽ, kiên định. Sống theo kỷ luật nội tâm, ít thể hiện cảm xúc nhưng luôn giữ lời, giữ đạo. Có khí chất lãnh đạo âm thầm, không phô trương nhưng có sức ảnh hưởng và tạo được niềm tin với người khác. Đôi khi khá bảo thủ, cứng rắn, dễ gặp xung đột nếu thiếu sự mềm mại trong giao tiếp.",
    taiVan:
      "Biết tiết chế, tích luỹ tài sản từ sự ổn định và nỗ lực. Khả năng kiếm tiền không đến từ may mắn ngắn hạn mà từ sự tập trung, tính toán dài hơi và tự kỷ luật. Đặc biệt phù hợp với các nghề nghiệp cần độ chính xác, quy trình và đầu óc thực tế.",
    suNghiep:
      "Có xu hướng chọn một hướng đi cố định và chuyên sâu, không thích thay đổi công việc thường xuyên. Được đánh giá cao trong môi trường đòi hỏi trách nhiệm, sự ổn định và chiến lược dài hạn. Tuy nhiên đôi khi dễ rơi vào trạng thái bị đè nặng bởi áp lực, cần biết cân bằng tâm lý.",
    nhanDuyen:
      "Tuy không nhiều bạn bè vây quanh, nhưng mối quan hệ nào cũng vững chắc, đáng tin cậy. Quý nhân xuất hiện thường là người nghiêm túc, giữ chữ tín và có thể nâng đỡ mạnh mẽ.",
    sucKhoe:
      "Cần chú ý các bệnh về vai gáy, khớp gối, hệ thần kinh, rối loạn giấc ngủ. Càng gánh vác nhiều vai trò càng dễ dẫn đến các bệnh do áp lực tâm lý tích tụ. Lối sống điều độ, thiền và vận động nhẹ là chìa khoá duy trì sức khoẻ.",
    hocTap:
      "Rất phù hợp với mô hình học chuyên sâu, đào sâu một lĩnh vực đến tận cùng. Học không nhanh nhưng rất chắc, đặc biệt nếu được đặt vào môi trường nghiên cứu, kỹ thuật, phân tích hoặc giảng dạy. Có thể đạt học vị cao hoặc vị thế uy tín nếu kiên trì theo đuổi nghề nghiệp học thuật chuyên môn.",
    camXuc:
      "Cảm xúc ổn định nhưng ít bộc lộ ra bên ngoài. Yêu một cách trung thành, tận tuỵ, nhưng đôi khi bị hiểu lầm là lạnh lùng. Khó mở lòng trong giai đoạn đầu, nhưng rất trân trọng người phù hợp.",
    honNhan:
      "Trong hôn nhân họ là người trụ cột đáng tin, thường đóng vai trò bảo vệ và gìn giữ tổ ấm. Tuy nhiên dễ gặp tình trạng “mỗi người một thế giới riêng” nếu không học cách chia sẻ và lắng nghe cảm xúc của đối phương. Kết đôi lý tưởng với người mộc mạc, chân thành, không quá phô trương.",
  },
  "43": {
    tinhCach:
      "Mạnh mẽ, kiên định, có tâm thế của người lớn tuổi, khí chất lãnh đạo, phong thái của bậc đại tướng.",
    taiVan:
      "Tiết kiệm, cẩn trọng trong chi tiêu, không tiêu xài hoang phí, tích luỹ tài chính tốt, kiếm tiền từ sự bền bỉ.",
    suNghiep:
      "Lãnh đạo vững chắc trong lĩnh vực chuyên môn, độc lập phụ trách công việc, gánh vác trách nhiệm lớn, chịu áp lực tốt.",
    nhanDuyen:
      "Có khí chất của người đáng tin cậy; được người lớn tuổi hoặc người có địa vị nâng đỡ, có khả năng bao dung và hỗ trợ người xung quanh.",
    sucKhoe:
      "Dễ gặp vấn đề về vai, gáy, lưng và khớp; các bệnh liên quan đến thần kinh, mất ngủ và tim mạch cũng cần lưu ý.",
    hocTap:
      "Tư duy sâu sắc, giỏi nghiên cứu chuyên sâu, tập trung cao, hợp theo đuổi đỉnh cao học thuật.",
    camXuc:
      "Một lòng một dạ, thuỷ chung; yêu một người thì yêu trọn vẹn, không dễ thay đổi, có chiều sâu tình cảm.",
    honNhan:
      "Trung thành, đảm đang, là người trụ cột trong gia đình, sẵn sàng gánh vác và hy sinh vì tổ ấm.",
  },
  "26": {
    tinhCach:
      "Kiên định, mạnh mẽ, mang tâm thế của bậc trưởng thành. Mang phong thái của người lãnh đạo, khí chất của bậc đại tướng.",
    taiVan:
      "Tích luỹ tài chính cẩn trọng, không tiêu xài hoang phí, tập trung vào ổn định lâu dài.",
    suNghiep:
      "Có khả năng lãnh đạo độc lập, gánh vác công việc, chịu áp lực và trách nhiệm lớn.",
    nhanDuyen:
      "Giao tiếp với người có địa vị cao, thường gặp quý nhân lớn tuổi; có khí chất bao dung, che chở cho người xung quanh.",
    sucKhoe:
      "Dễ gặp các vấn đề đau vai, gáy, khớp; dễ mắc các bệnh liên quan đến thần kinh, mất ngủ.",
    hocTap:
      "Tập trung cao độ, học tập chuyên sâu, năng lực nghiên cứu tốt, không dễ từ bỏ.",
    camXuc:
      "Trung thành và bền bỉ trong tình cảm, thuỷ chung, có sự kiên trì và khó bị lay động.",
    honNhan:
      "Quan điểm nghiêm túc, trung thành với gia đình, trọng danh dự, không dễ thay lòng đổi dạ.",
  },
  "62": {
    tinhCach:
      "Cứng rắn, có khí chất lãnh đạo, suy nghĩ già dặn, hành xử như người từng trải. Phong thái điềm tĩnh, có uy.",
    taiVan:
      "Thận trọng trong chi tiêu, không hoang phí. Kiếm tiền nhờ tích luỹ, làm ăn bền vững, tuy không bộc phát nhưng vững vàng.",
    suNghiep:
      "Có năng lực chuyên môn cao, có thể gánh vác công việc lớn. Gắn bó với công việc lâu dài, có trách nhiệm cao.",
    nhanDuyen:
      "Dễ được người lớn tuổi hoặc người có uy tín yêu mến. Có khả năng làm chỗ dựa cho người khác và quy tụ được người xung quanh.",
    sucKhoe:
      "Dễ mắc các bệnh về vai gáy, xương khớp, mất ngủ, rối loạn thần kinh và các vấn đề về tim mạch.",
    hocTap:
      "Học chuyên sâu rất tốt, phù hợp nghiên cứu học thuật. Khi đã chú tâm thì có thể đạt đến đỉnh cao trong lĩnh vực chuyên môn.",
    camXuc:
      "Nội tâm sâu sắc, tập trung cao độ. Tình cảm ít bộc lộ, yêu bền bỉ, trung thành nhưng đôi lúc hơi lạnh lùng.",
    honNhan:
      "Là người giữ vai trò chủ đạo trong gia đình, trung thành, tận tuỵ. Nhưng cũng khá nghiêm khắc và dễ ôm hết trách nhiệm về mình.",
  },
};
