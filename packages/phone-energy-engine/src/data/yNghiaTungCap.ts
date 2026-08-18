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

/**
 * Tám mặt mà Chương 2 luận cho mỗi cặp.
 *
 * Mọi mặt để **tuỳ chọn**: chỗ nào OCR cắt cụt hẳn hoặc nguồn ghi nhầm sang tinh khác thì bỏ TRỐNG
 * chứ không bịa cho đầy. Tầng hiển thị chỉ in mặt nào có dữ liệu. Danh sách chỗ khuyết ghi trong
 * `docs/luan-so-dien-thoai-data/chuong2-tien-do-va-khuyet-ocr.md`.
 */
export interface YNghiaCap {
  tinhCach?: string;
  taiVan?: string;
  suNghiep?: string;
  nhanDuyen?: string;
  sucKhoe?: string;
  hocTap?: string;
  camXuc?: string;
  honNhan?: string;
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

  // ─────────────────────────── SINH KHÍ — Quý nhân ───────────────────────────
  "14": {
    tinhCach:
      "Lạc quan, tuỳ duyên, biểu đạt cởi mở, tính cách phóng khoáng, không câu nệ tiểu tiết.",
    taiVan:
      "Quý nhân mang tài lộc đến từ những cơ hội bất ngờ, dễ có lộc nhưng cần chú ý quản lý tài chính.",
    suNghiep:
      "Giỏi giao tiếp, biết phối hợp và điều phối quan hệ, có quý nhân giúp đỡ và tạo cơ hội.",
    nhanDuyen:
      "Quan hệ xã hội tốt, nhân duyên đẹp như cá gặp nước, thường được nhiều người giúp đỡ.",
    sucKhoe:
      "Dễ mắc các bệnh liên quan đến ngũ quan nếu phản ứng cảm xúc không kiểm soát.",
    hocTap:
      "Mở lòng tiếp nhận tri thức, tiếp thu thông tin nhanh chóng, học tập toàn diện.",
    camXuc:
      "Dễ gần, vui vẻ, thích giao tiếp; có sự ngọt ngào, hài hước và duyên ngầm trong cách thể hiện tình cảm.",
    honNhan:
      "Vợ chồng hoà hợp như đàn hoà điệu, có duyên lành từ kiếp trước, tương kính như tân.",
  },
  "41": {
    tinhCach: "Lạc quan, không câu nệ tiểu tiết.",
    taiVan:
      "Quý nhân mang tài lộc đến từ những cơ hội bất ngờ, dễ có lộc nhưng cần chú ý quản lý tài chính.",
    suNghiep:
      "Giỏi giao tiếp, biết phối hợp và điều phối quan hệ, có quý nhân giúp đỡ và tạo cơ hội.",
    nhanDuyen:
      "Quan hệ xã hội tốt, nhân duyên đẹp như cá gặp nước, thường được nhiều người giúp đỡ.",
    sucKhoe:
      "Dễ mắc các bệnh về dạ dày, đường ruột và các bệnh liên quan đến ngũ quan nếu phản ứng cảm xúc không kiểm soát.",
    hocTap:
      "Mở lòng tiếp nhận tri thức, tiếp thu thông tin nhanh chóng, học tập toàn diện.",
    camXuc:
      "Dễ gần, vui vẻ, thích giao tiếp; có sự ngọt ngào, hài hước và duyên ngầm trong cách thể hiện tình cảm.",
    honNhan:
      "Vợ chồng hoà hợp như đàn hoà điệu, có duyên lành từ kiếp trước, tương kính như tân.",
  },
  "67": {
    tinhCach:
      "Lạc quan, tuỳ duyên, biểu đạt cởi mở, tính cách phóng khoáng, không câu nệ tiểu tiết.",
    taiVan:
      "Quý nhân mang tài lộc đến từ các cơ hội bất ngờ; tài lộc xuất hiện không theo kế hoạch nhưng thuận lợi.",
    suNghiep:
      "Giỏi giao tiếp, biết phối hợp và điều phối quan hệ; nhận được sự nâng đỡ từ quý nhân, có khả năng kết nối tốt.",
    nhanDuyen:
      "Quan hệ xã hội phong phú, được nhiều người giúp đỡ, nhân duyên thuận lợi như cá gặp nước.",
    sucKhoe:
      "Dễ mắc các bệnh về tiêu hoá như đường ruột, dạ dày, hoặc các vấn đề liên quan đến ngũ quan nếu phản ứng cảm xúc quá đà.",
    hocTap:
      "Cởi mở tiếp nhận thông tin mới, học tập toàn diện, tiếp thu nhanh, ham học hỏi.",
    camXuc:
      "Ngọt ngào, vui vẻ, hài hước, dễ hoà đồng và thích giao lưu — là người đem lại cảm xúc tích cực cho người khác.",
    honNhan:
      "Hoà thuận như đàn tranh hoà âm, vợ chồng ăn ý, phối hợp dịu dàng, tình cảm và có duyên lành hỗ trợ nhau.",
  },
  "76": {
    tinhCach:
      "Lạc quan, vui vẻ, thân thiện, hoạt bát. Biểu đạt mạnh mẽ, cảm xúc dồi dào, dễ tạo thiện cảm với người xung quanh. Có tài giao tiếp và kết nối, phù hợp với môi trường cần sự phối hợp linh hoạt.",
    taiVan:
      "Dễ gặp quý nhân mang lại cơ hội tài chính bất ngờ, hay có lộc từ mối quan hệ. Tuy nhiên chi tiêu thoáng, dễ tiêu tiền vì cảm xúc, nên cần học cách tiết chế và kiểm soát tài chính tốt hơn. Tài vận phát triển nhanh nếu biết tận dụng các mối quan hệ và năng lượng kết nối.",
    suNghiep:
      "Nổi bật ở khả năng giao tiếp, ngoại giao, làm cầu nối, PR, thương lượng. Hợp với các lĩnh vực đối ngoại, bán hàng, truyền thông, nghệ thuật, chăm sóc khách hàng. Dễ thành công khi làm việc theo nhóm hoặc có người nâng đỡ tạo đà.",
    nhanDuyen:
      "Quý nhân rất đông, đặc biệt là những người lớn tuổi, có vị trí cao, hoặc rất hào sảng. Quan hệ xã hội rộng rãi như cá gặp nước, được nhiều người yêu quý và sẵn sàng hỗ trợ. Mỗi cơ hội lớn thường đi kèm với một mối liên kết quý giá.",
    sucKhoe:
      "Dễ gặp vấn đề do ăn uống thất thường; một số bệnh lý ở ngũ quan (mắt, tai, mũi, miệng, họng) nếu làm việc quá sức hoặc thiếu nghỉ ngơi.",
    hocTap:
      "Học nhanh, mở lòng đón nhận kiến thức mới, đa năng, thích ứng tốt. Phù hợp học tập qua hình ảnh, âm thanh, giao tiếp hoặc thực tiễn. Đôi khi thiếu tập trung nếu môi trường quá đơn điệu hoặc khuôn mẫu.",
    camXuc:
      "Người sống tình cảm, ngọt ngào, biết cách làm người khác vui. Có khiếu hài hước, năng lượng tích cực, giúp kết nối và lan toả. Tuy nhiên cần chú ý tránh bị lệ thuộc cảm xúc vào sự công nhận từ bên ngoài.",
    honNhan:
      "Cuộc sống hôn nhân thường dễ hoà hợp, ít mâu thuẫn, duyên tốt lành. Người này thích đối phương biết lắng nghe, giao tiếp tình cảm rõ ràng. Nếu kết hôn với người biết chia sẻ sẽ có hôn nhân hạnh phúc và ngọt ngào.",
  },
  "93": {
    tinhCach: "Lạc quan, tuỳ duyên, biểu đạt cởi mở, không để tâm tiểu tiết.",
    taiVan:
      "Quý nhân mang tài lộc đến từ những nguồn bất ngờ, nhưng dễ bị phân tâm bởi những thứ hoa lệ, hào nhoáng.",
    suNghiep:
      "Giỏi giao tiếp, điều phối, quan hệ xã giao tốt, được quý nhân đề bạt và hỗ trợ.",
    nhanDuyen:
      "Quan hệ xã hội như cá gặp nước, nhận được nhiều sự giúp đỡ từ người khác.",
    sucKhoe:
      "Dễ mắc các bệnh về tiêu hoá, dạ dày và các bệnh liên quan đến cơ quan tiêu hoá do dễ bị kích ứng.",
    hocTap: "Học tập toàn diện, ham học hỏi, dễ tiếp nhận thông tin.",
    camXuc:
      "Ngọt ngào, duyên dáng, hài hước, dễ hoà hợp trong giao tiếp và các mối quan hệ.",
    honNhan:
      "Phối hợp ăn ý, vợ chồng như đàn tranh hoà âm; tình cảm hoà thuận, có duyên tâm linh.",
  },
  "39": {
    tinhCach:
      "Lạc quan, cởi mở, biểu đạt linh hoạt, không câu nệ tiểu tiết, dễ thích nghi với môi trường xung quanh.",
    taiVan:
      "Quý nhân mang lại tài lộc từ các cơ hội bất ngờ. Tài vận hanh thông nếu biết kiểm soát chi tiêu và giữ sự khiêm nhường.",
    suNghiep:
      "Giao tiếp tốt, biết điều phối và phối hợp quan hệ. Dễ có quý nhân nâng đỡ, công việc thuận lợi nhờ sự kết nối.",
    nhanDuyen:
      "Quan hệ xã giao phong phú, có nhiều người giúp đỡ, nhân duyên thuận lợi như cá gặp nước, dễ gặp người tốt.",
    sucKhoe:
      "Dễ gặp các vấn đề về tiêu hoá (ruột, dạ dày), bệnh liên quan đến ngũ quan (tai, mắt, mũi, miệng), hoặc phản ứng do cảm xúc.",
    hocTap:
      "Có khả năng tiếp thu thông tin nhanh, học tốt theo phương pháp toàn diện, mở lòng đón nhận kiến thức mới.",
    camXuc:
      "Hài hước, duyên dáng, dễ tạo thiện cảm. Biết cách biểu đạt cảm xúc nhẹ nhàng, thích giao tiếp thân thiện, hoà đồng.",
    honNhan:
      "Vợ chồng hoà hợp, ăn ý như đàn tranh hoà âm; có duyên lành, quan hệ nhẹ nhàng và vui vẻ.",
  },
  "82": {
    tinhCach:
      "Lạc quan, cởi mở, biểu đạt linh hoạt, không câu nệ tiểu tiết, dễ hoà nhập với mọi người.",
    taiVan:
      "Quý nhân mang đến tài lộc bất ngờ, dễ gặp may mắn về tiền bạc; tài vận thuận lợi nhưng cần học cách quản lý.",
    suNghiep:
      "Giao tiếp tốt, phối hợp hài hoà, dễ tạo quan hệ xã hội, được quý nhân nâng đỡ, sự nghiệp phát triển từ kết nối.",
    nhanDuyen:
      "Quan hệ xã giao tốt như cá gặp nước, có nhiều quý nhân giúp đỡ, được yêu mến và hỗ trợ từ nhiều phía.",
    sucKhoe:
      "Dễ mắc bệnh về tiêu hoá như đường ruột, dạ dày, và các bệnh về ngũ quan nếu dễ bị kích thích cảm xúc hoặc căng thẳng.",
    hocTap:
      "Tiếp thu nhanh, cởi mở trong học tập, ham học hỏi, dễ tiếp cận kiến thức mới, hợp với học nhiều nguồn đa chiều.",
    camXuc:
      "Ngọt ngào, hài hước, biết cách tạo thiện cảm, giàu cảm xúc, dễ kết nối qua giao tiếp thân thiện và thông minh.",
    honNhan:
      "Duyên lành, vợ chồng hoà hợp như đàn tranh hoà điệu, có nhân duyên tốt lành, yêu thương chân thành.",
  },
  "28": {
    tinhCach:
      "Tính cách tươi sáng, cởi mở, dễ gần. Thích nghi tốt, có xu hướng sống lạc quan, hoà đồng, linh hoạt. Khả năng giao tiếp và lan toả cảm xúc tích cực mạnh mẽ, là mẫu người dễ tạo thiện cảm.",
    taiVan:
      "Số mở vận tài chính do quý nhân nâng đỡ hoặc cơ duyên bất ngờ. Có duyên với tài lộc ngoài dự tính, thường xuất hiện khi kết nối đúng người đúng lúc. Tuy nhiên dễ tiêu pha tuỳ hứng, cần rèn tính kỷ luật tài chính.",
    suNghiep:
      "Thế mạnh trong các lĩnh vực giao tiếp, môi giới, PR, truyền thông, kết nối đối tác. Biết cách xây dựng mạng lưới xã hội và tận dụng hiệu quả các mối quan hệ. Thường thuận lợi nhờ bạn bè, cộng sự, hoặc có người nâng đỡ âm thầm.",
    nhanDuyen:
      "Vận quý nhân rất mạnh, người giúp đỡ xuất hiện trong các mối quan hệ giao tiếp đời thường. Quý nhân thường là người rộng lượng, hào sảng, chủ động nâng đỡ. Càng đi ra ngoài, càng mở lòng thì càng dễ gặp được cơ hội.",
    sucKhoe:
      "Cần chú ý các vấn đề tiêu hoá, dạ dày, đường ruột và bệnh liên quan ngũ quan (mắt, mũi, miệng). Dễ bị ảnh hưởng bởi ăn uống không kiểm soát và căng thẳng xã giao kéo dài.",
    hocTap:
      "Có xu hướng học tập theo kiểu đa chiều, tổng hợp, linh hoạt, không thích khuôn mẫu. Học nhanh, bắt sóng tốt, tiếp cận thông tin hiện đại rất giỏi. Tuy nhiên dễ thiếu chiều sâu, cần tập trung rèn luyện tính chuyên môn hoá nếu muốn phát triển bền vững.",
    camXuc:
      "Tính cách ngọt ngào, tình cảm, dễ kết nối. Trong cảm xúc, người mang số này thường dễ mở lòng, dễ cảm, dễ yêu. Tuy nhiên cần chú ý giao tiếp quá rộng khiến mất tập trung cảm xúc cho người quan trọng.",
    honNhan:
      "Hôn nhân nhiều thuận duyên, vợ chồng hoà hợp, ăn nói vui vẻ, dễ đạt đồng thuận. Dễ gặp được bạn đời tốt khi mở lòng và giao tiếp rộng rãi. Mối quan hệ trong hôn nhân thường mang tính bạn bè, hỗ trợ nhiều chiều.",
  },

  // ──────────────────── PHỤC VỊ — Trung tính, giữ nguyên trạng ────────────────────
  "11": {
    tinhCach:
      "Tính cách bảo thủ, thận trọng, khó thay đổi. Có xu hướng quan sát và thu mình thay vì chủ động thể hiện. Không quyết đoán, thường bị giằng co trong nội tâm hoặc phụ thuộc vào ý kiến của người khác. Tính cách ẩn nhẫn, nhẫn nại, âm thầm quan sát cuộc đời.",
    taiVan:
      "Tài vận có tính ổn định nhưng không tăng trưởng nhanh. Thích sự chắc chắn, ít khi mạo hiểm — vì vậy có thể bỏ lỡ cơ hội lớn. Phù hợp với các công việc cố định, bền vững, không cần đối đầu hoặc cạnh tranh khốc liệt.",
    suNghiep:
      "Phát triển chậm nhưng vững, không ưa tranh đấu. Thường phù hợp với các vai trò hậu phương, trợ lý, cố vấn, hoặc những công việc chuyên môn cần chi tiết, kỹ lưỡng, ổn định lâu dài. Dễ trì hoãn, thiếu động lực khi không có người thúc đẩy từ bên ngoài.",
    nhanDuyen:
      "Quý nhân thường là người thân, bạn bè lâu năm, người từng có duyên sâu nặng. Không dễ mở lòng với người lạ, nên quý nhân có vai trò âm thầm, không phô trương. Các mối quan hệ thường bền lâu nhưng cần được chủ động duy trì.",
    sucKhoe:
      "Dễ mắc các bệnh liên quan đến tim mạch, não bộ, hệ nội tiết, bệnh mạn tính kéo dài. Có thể liên quan đến các vấn đề khó phát hiện hoặc âm ỉ trong thời gian dài do không giải phóng được năng lượng cảm xúc.",
    hocTap:
      "Có năng lực phân tích, suy luận, tổng hợp; tốc độ học chậm nhưng chắc, theo chu trình. Học tốt nhất khi được tự nghiên cứu, đào sâu, phân tích logic. Hợp với lĩnh vực khoa học, y học, kỹ thuật, nghiên cứu hoặc phân tích dữ liệu.",
    camXuc:
      "Cảm xúc có xu hướng nội tâm hoá, kìm nén, không dễ thể hiện. Dễ rơi vào trạng thái tự cô lập hoặc đợi chờ không lời hứa, dẫn đến trầm mặc hoặc hụt hẫng. Cần học cách chia sẻ và mở lòng một cách chủ động để chữa lành.",
    honNhan:
      "Trong hôn nhân, người này thường yêu âm thầm, ít thể hiện nhưng sâu sắc. Đối phương có thể thấy họ lạnh lùng, thiếu lãng mạn, nhưng thực chất lại là người rất có trách nhiệm và gắn bó. Nếu không biết giao tiếp cảm xúc, dễ dẫn đến hiểu lầm kéo dài.",
  },
  "22": {
    tinhCach:
      "Giữ gìn, bị động, chần chừ, không giỏi quyết; ẩn nhẫn và quan sát.",
    taiVan: "Cầu tài theo hướng thu nhập ổn định.",
    suNghiep:
      "Làm việc chậm chạp, bị động, làm nhiều nhưng không hiệu quả cao; đầu tư không quyết đoán.",
    nhanDuyen:
      "Giao tiếp bị động, các mối quan hệ chủ yếu đến từ gia đình và bạn bè thân thiết.",
    sucKhoe: "Bệnh thường khó phát hiện sớm.",
    hocTap:
      "Tư duy phân tích tốt, giỏi tổ hợp logic, có khả năng nghiên cứu chuyên sâu.",
    camXuc:
      "Nội tâm, hay giữ trong lòng; bị động trong tình cảm, không dễ bộc lộ.",
    honNhan:
      "Bình lặng, ít thay đổi, dễ rơi vào trạng thái trì trệ, thiếu sự linh hoạt trong mối quan hệ.",
  },
  "88": {
    tinhCach:
      "Thường có xu hướng trầm tĩnh, dè dặt, ít bộc lộ suy nghĩ ra ngoài. Tư duy phân tích sâu, chậm nhưng chắc. Giống như “núi tĩnh tại”, cần thời gian quan sát trước khi hành động. Khó đưa ra quyết định nhanh, dễ lưỡng lự, nhưng khi đã quyết sẽ rất kiên định.",
    taiVan:
      "Ưa thích sự ổn định, tài lộc đến chậm rãi, tích tiểu thành đại, tránh đầu tư mạo hiểm. Thích hợp với hình thức kiếm tiền dài hạn, bền vững như tiết kiệm, đầu tư bất động sản, đất đai. Dễ gặp khó khăn ban đầu, nhưng càng về sau càng ổn định nếu kiên trì.",
    suNghiep:
      "Có thiên hướng làm việc trong môi trường ổn định, quy củ, có hệ thống như nghiên cứu, giáo dục, kỹ thuật, kế toán. Hợp với vai trò phụ tá, hỗ trợ, cố vấn hơn là vị trí lãnh đạo tuyến đầu. Cần học cách dũng cảm hành động, tránh trì hoãn quá lâu mà đánh mất cơ hội.",
    nhanDuyen:
      "Quý nhân đến âm thầm và chậm rãi, thường là người thân quen, bạn bè, họ hàng, người từng gặp từ trước. Có thể được giúp đỡ bởi người giỏi lập kế hoạch, điềm đạm, sống nguyên tắc. Đôi khi khó kết nối với quý nhân mới do bản thân không cởi mở.",
    sucKhoe:
      "Dễ gặp vấn đề tim mạch, huyết áp, hệ tuần hoàn; não bộ, nội tạng âm tính (tim, gan, thận); bệnh mãn tính kéo dài, khó phát hiện sớm nếu thiếu chăm sóc.",
    hocTap:
      "Tư duy thiên về chiều sâu, phân tích và phản tư nội tại, giỏi trong các lĩnh vực đòi hỏi sự tỉ mỉ. Có thể học tốt nếu được tạo môi trường yên tĩnh, ít biến động. Phù hợp với nghiên cứu chuyên sâu, tổng hợp và phân tích số liệu, dữ liệu, công nghệ, lập trình.",
    camXuc:
      "Cảm xúc thiên về nội tâm, dễ tự khép mình, thích suy ngẫm và phân tích tình cảm, không biểu lộ nhiều. Có thể tự “phong ấn” cảm xúc, khó chia sẻ, dễ cô lập. Nếu bị tổn thương sẽ chọn cách im lặng, khiến người khác khó hiểu.",
    honNhan:
      "Hôn nhân thiên về ổn định, thực tế, không phô trương. Có xu hướng ngại thay đổi, dễ chọn sống vì trách nhiệm thay vì cảm xúc mãnh liệt. Cần học cách giao tiếp cảm xúc, thể hiện yêu thương rõ ràng hơn.",
  },
  "99": {
    tinhCach:
      "Nội tâm, kín đáo, có xu hướng giữ gìn và thụ động. Dễ do dự, ít khi đưa ra quyết định nhanh chóng, thường âm thầm quan sát.",
    taiVan:
      "Cầu tài an toàn, tích tiểu thành đại. Không thích mạo hiểm, có xu hướng tích luỹ tài chính từ nguồn thu ổn định.",
    suNghiep: "Ngại thay đổi, thường chậm rãi trong hành động và suy nghĩ.",
    nhanDuyen:
      "Quý nhân chủ yếu đến từ người thân, bạn bè lâu năm. Quan hệ xã hội không rộng, nhưng gắn bó bền vững.",
    sucKhoe:
      "Cần lưu ý các vấn đề về tim mạch, não bộ, bệnh tiềm ẩn khó phát hiện sớm. Có thể dễ mắc bệnh mãn tính, kéo dài.",
    hocTap:
      "Phù hợp với các lĩnh vực cần phân tích sâu, nghiên cứu, logic. Năng lực tư duy phân tích rất tốt.",
    camXuc:
      "Khó mở lòng, dễ bị động trong chuyện tình cảm. Thường chờ đợi hoặc phân tích nội tâm hơn là thể hiện ra ngoài.",
    honNhan:
      "Bình ổn, ít biến động. Tuy nhiên thiếu sự chủ động trong cảm xúc và tương tác, dễ khiến tình cảm trở nên tẻ nhạt nếu không được nuôi dưỡng.",
  },
  "66": {
    tinhCach:
      "Giữ gìn sự ổn định, ít dao động, chần chừ không quyết, giỏi ẩn nhẫn và quan sát.",
    taiVan: "Cầu tài một cách ổn định, thành tựu nhỏ nhưng nhiều.",
    suNghiep:
      "Làm việc chậm, bị trì hoãn, làm nhiều nhưng thu được ít. Đầu tư kém hiệu quả.",
    nhanDuyen:
      "Giao tiếp bị động, các mối quan hệ với người thân và bạn bè làm chủ đạo.",
    sucKhoe:
      "Dễ mắc các bệnh về tim mạch, hệ thần kinh và các bệnh mãn tính, tiềm ẩn và kéo dài.",
    hocTap:
      "Phân tích logic, tư duy tổ hợp, hợp học chuyên sâu, nghiên cứu chuyên ngành.",
    camXuc: "Tự khép kín, bị động, chờ đợi, nội tâm, hay giữ trong lòng.",
    honNhan:
      "Bốn bình tám ổn, bình lặng, ít biến động, không có nhiều thay đổi.",
  },
  "77": {
    tinhCach:
      "Giữ gìn, bị động, thiếu quyết đoán, hay do dự. Giỏi quan sát và ẩn nhẫn, ít khi chủ động.",
    taiVan:
      "Theo đuổi sự ổn định, thích cầu tài an toàn; thành quả không nhiều nhưng đều đặn, thu nhập ổn định.",
    suNghiep:
      "Làm việc chậm rãi, dễ bị trì hoãn; suy nghĩ nhiều nhưng hành động ít, đầu tư cẩn trọng.",
    nhanDuyen:
      "Các mối quan hệ chủ yếu đến từ gia đình và bạn bè thân thiết; dễ bị động trong kết giao xã hội.",
    sucKhoe:
      "Dễ mắc các bệnh liên quan đến tim, não, hệ thần kinh; bệnh tiềm ẩn, mạn tính hoặc kéo dài, khó phát hiện sớm.",
    hocTap:
      "Giỏi tư duy phân tích, khả năng tổ hợp logic tốt, phù hợp với nghiên cứu chuyên sâu, suy nghĩ có chiều sâu.",
    camXuc:
      "Nội tâm, khép kín, dễ chờ đợi hoặc bị động trong cảm xúc, ít bộc lộ, giàu sự trầm lặng bên trong.",
    honNhan:
      "Quan hệ bình lặng, ít sóng gió, nhưng cũng dễ trì trệ và nhàm chán nếu không được nuôi dưỡng cảm xúc thường xuyên.",
  },
  "33": {
    tinhCach:
      "Thụ động, dè dặt, dễ do dự, không quyết đoán. Thường ẩn mình quan sát, không chủ động tiến lên.",
    taiVan:
      "Ưa chuộng sự ổn định, cầu tài an toàn; lợi nhuận ít nhưng chắc. Dễ tích luỹ nhưng khó bứt phá nhanh.",
    suNghiep:
      "Làm việc chậm rãi, dễ bị trì hoãn; có xu hướng suy nghĩ nhiều nhưng hành động ít. Phù hợp công việc cần sự kiên trì.",
    nhanDuyen:
      "Duyên quý nhân không nhiều. Chủ yếu dựa vào mối quan hệ thân thuộc như gia đình, người thân cận; ít mở rộng xã hội.",
    sucKhoe:
      "Dễ gặp vấn đề về tim, não, hệ thần kinh; bệnh tiềm ẩn, mãn tính kéo dài hoặc khó phát hiện sớm.",
    hocTap:
      "Phù hợp với nghiên cứu sâu, học thuật nghiêm túc và thiên về lý trí.",
    camXuc:
      "Nội tâm khép kín, ít bộc lộ. Dễ chờ đợi, bị động trong cảm xúc. Giàu suy tư và có chiều sâu cảm nhận.",
    honNhan:
      "Bình lặng, ổn định, ít sóng gió. Tuy nhiên dễ thiếu lửa tình yêu nếu không chủ động nuôi dưỡng cảm xúc.",
  },
  "44": {
    tinhCach:
      "Tính cách thận trọng, bảo thủ, ít chủ động. Dễ trì hoãn, phân vân do dự, mất cơ hội vì chậm bước. Tâm trí thường ẩn nhẫn quan sát, ít thể hiện suy nghĩ ra bên ngoài.",
    taiVan:
      "Có xu hướng tìm kiếm sự ổn định, thu nhập thường đến từ các nguồn đều đặn, ít mạo hiểm. Khó phát nhanh nhưng giữ được, phù hợp với công việc hưởng lương cố định, đầu tư an toàn. Nếu không thay đổi tư duy sẽ khó tạo bứt phá tài chính.",
    suNghiep:
      "Thích làm việc trong môi trường có quy tắc rõ ràng, ghét thay đổi bất ngờ. Có khả năng duy trì công việc lâu dài, làm tốt ở vai trò hỗ trợ, hậu cần, phân tích. Dễ rơi vào trạng thái trì trệ, thiếu chủ động, chờ người khác đẩy tiến độ.",
    nhanDuyen:
      "Có quý nhân là người thân, bạn bè lâu năm hoặc đồng nghiệp đáng tin, thường xuất hiện trong môi trường quen thuộc. Mối quan hệ quý nhân thiên về sự hỗ trợ chậm rãi, âm thầm. Tuy nhiên ít có mối duyên đột phá, cần chủ động nhiều hơn để mở rộng mối quan hệ.",
    sucKhoe:
      "Dễ mắc bệnh âm ỉ, mạn tính, khó phát hiện sớm. Cần chú ý đến các biểu hiện mất ngủ, lo âu kéo dài, thiếu năng lượng sống.",
    hocTap:
      "Giỏi tư duy phân tích, tổng hợp, nghiên cứu chiều sâu. Hợp với phương pháp học lý luận, hệ thống, lặp lại; không phù hợp với kiểu học cảm hứng, bùng nổ. Dễ thành công trong các lĩnh vực đòi hỏi sự kiên trì, bền bỉ và khả năng tổng hợp thông tin phức tạp.",
    camXuc:
      "Nội tâm kín đáo, cảm xúc không dễ bộc lộ. Dễ bị tổn thương âm thầm, tự chịu đựng, không chia sẻ. Nếu không biết cách giải toả cảm xúc, dễ sinh ra trầm cảm và cảm giác cô đơn trong tập thể.",
    honNhan:
      "Cuộc hôn nhân nhìn ngoài bình lặng, nhưng dễ thiếu sự kết nối cảm xúc sâu sắc. Người mang số này thường bị động trong tình cảm, ít thể hiện nhu cầu hoặc mong muốn. Nếu không mở lòng, dễ tạo khoảng cách dù bên ngoài vẫn giữ sự ổn định.",
  },

  // ─────────────────────── NGŨ QUỶ — Biến động, thị phi ───────────────────────
  "18": {
    tinhCach:
      "Cá tính mạnh mẽ, dị biệt, khó đoán, thường có suy nghĩ khác người. Tư duy đa chiều nhưng dễ bất định, hay thay đổi cảm xúc và quyết định đột ngột. Là người dễ nổi nóng, có thể phản ứng mạnh khi bị đẩy vào thế bị động. Có khuynh hướng cực đoan hoặc nhạy cảm quá mức, nên dễ tự tạo áp lực tinh thần.",
    taiVan:
      "Có năng lực lập kế hoạch tài chính, nhưng dễ dính vào tiền bạc ngắn hạn, thiếu bền vững. Tài lộc thường đến bất ngờ, nhưng cũng rất dễ biến mất trong chớp mắt nếu không kiểm soát cảm xúc. Hợp với nghề nghiệp cần biến động, sáng tạo, hoặc những công việc ứng biến nhanh.",
    suNghiep:
      "Có năng lực đi đường riêng, tạo thương hiệu cá nhân mạnh. Tuy nhiên sự nghiệp dễ gặp nhiều biến số, khó đi đường thẳng. Nếu không đủ bản lĩnh hoặc không biết “lùi một bước để tiến xa”, dễ rơi vào chu kỳ lên nhanh xuống gấp.",
    nhanDuyen:
      "Ít người thật sự hiểu được nội tâm của người số 18. Quý nhân đến thường là những người nhạy cảm tâm linh, hoặc người từng trải, có thể soi gương cho nội tâm này. Tuy nhiên duyên đến - duyên đi nhanh, dễ có cảm giác bị bỏ rơi nếu không học được cách kiểm soát lòng tin và sự kỳ vọng.",
    sucKhoe:
      "Dễ mắc các bệnh về mất ngủ, tim mạch, huyết áp, rối loạn thần kinh, máu huyết; các bệnh có tính bùng phát hoặc đột ngột (cấp tính). Cần học cách giải toả tâm lý, tránh tích tụ cảm xúc trong cơ thể.",
    hocTap:
      "Có phản xạ nhanh, nhạy bén, dễ tiếp thu những môn cần ứng biến hoặc sáng tạo. Có thiên hướng nghệ thuật, vận động, trình diễn, nhưng khó học theo kiểu khô cứng, gò bó. Nếu rèn được sự tập trung, người này sẽ rất giỏi trong việc tự học và tạo đột phá.",
    camXuc:
      "Cảm xúc dao động mạnh, nhiều nghi ngờ, khó giữ ổn định lâu dài. Khi yêu, yêu cực kỳ mãnh liệt, nhưng dễ mất kiểm soát hoặc rơi vào trạng thái bất an. Cần có người đồng hành biết cách lắng nghe tầng sâu của tâm lý thì mới hoá giải được tổn thương bên trong.",
    honNhan:
      "Hôn nhân nhiều thăng trầm, dễ chia xa, hợp rồi lại tan nếu không có sự tin tưởng. Tính khí bất định, nóng nảy, nhạy cảm dễ khiến đối phương không hiểu được cảm xúc thật. Cần chọn bạn đời có tính vững vàng, biết lắng nghe và mềm mỏng để cân bằng năng lượng.",
  },
  "81": {
    tinhCach:
      "Hành xử độc lập, xu hướng ngược dòng, biến hoá phức tạp, cảm xúc dễ thay đổi, nóng giận thất thường.",
    taiVan:
      "Tài lộc dễ mất do đầu tư thiếu tính toán; nghiêng về tài vận may rủi, đầu tư mạo hiểm, dễ mất trong tích tắc.",
    suNghiep:
      "Có nhiều ý tưởng nhưng thiếu kế hoạch dài hạn; thích hợp ngành sáng tạo nhưng khó ổn định, dễ làm nhiều nhưng không chuyên sâu.",
    nhanDuyen:
      "Quan hệ xã hội phức tạp, nhiều bí mật; khó xác định ai là người thật sự giúp đỡ, dễ rơi vào trạng thái khó nắm bắt.",
    sucKhoe:
      "Dễ mắc các bệnh liên quan đến mất ngủ, tim mạch, huyết áp; bệnh cấp tính bộc phát đột ngột.",
    hocTap:
      "Nhạy bén, phản ứng nhanh; có thiên hướng nghệ thuật và vận động, học qua trải nghiệm nhiều hơn sách vở.",
    camXuc:
      "Biến đổi thất thường, dễ phản ứng thái quá, cảm xúc khó ổn định, hay nghi ngờ hoặc rơi vào cực đoan tình cảm.",
    honNhan:
      "Tình cảm không ổn định, dễ hợp rồi tan, thật giả lẫn lộn, dễ gặp khó khăn trong việc duy trì mối quan hệ lâu dài.",
  },
  "79": {
    tinhCach:
      "Tính cách nóng lạnh thất thường, dễ thay đổi, nhiều ý tưởng nhưng thiếu tính ổn định. Thường hành động theo cảm xúc bộc phát, có cá tính độc lập và mạnh mẽ, thích nổi bật, khác biệt. Tư duy sắc bén, sáng tạo cao, nhưng nếu không được kiểm soát tốt sẽ dẫn đến hành vi cực đoan hoặc bốc đồng. Có xu hướng tự cô lập hoặc làm việc một mình vì khó hoà nhập với các quy chuẩn tập thể.",
    taiVan:
      "Có khả năng kiếm tiền nhanh nhờ vào các lĩnh vực sáng tạo, nghệ thuật, đầu tư rủi ro; nhưng cũng dễ mất trắng nếu không có kế hoạch rõ ràng. Tài lộc đến nhanh nhưng khó giữ bền nếu không được quản lý bởi người đồng hành đáng tin. Dễ sa vào chi tiêu cảm tính, thiếu chiến lược tích luỹ lâu dài.",
    suNghiep:
      "Thường thích làm việc tự do, phù hợp môi trường không khuôn khổ hoặc cơ cấu hành chính. Có thể thành công trong các ngành nghề có tính linh hoạt như nghệ thuật, truyền thông, thời trang, tâm linh hoặc kinh doanh đột phá. Tuy nhiên dễ bị rối định hướng nếu không xác lập mục tiêu rõ ràng.",
    nhanDuyen:
      "Ít quý nhân chủ động giúp đỡ nếu bản thân không thay đổi thái độ sống. Quý nhân chỉ đến khi bản mệnh bình ổn tâm trí, tránh cực đoan, mở lòng học hỏi và biết tiếp thu ý kiến. Quý nhân có thể là người lớn tuổi, trưởng thành, hoặc có tính âm - trầm, giúp cân bằng năng lượng hoả mạnh mẽ của bản mệnh.",
    sucKhoe:
      "Dễ mắc các vấn đề về tim mạch, huyết áp, mất ngủ, căng thẳng, bốc hoả, đột phát nội tạng. Cần chú ý đặc biệt đến các bệnh lý do căng thẳng thần kinh hoặc rối loạn vận hành khí huyết. Phù hợp với các phương pháp dưỡng sinh kết hợp vận động, thiền định, thở sâu.",
    hocTap:
      "Trí thông minh, phản xạ nhanh, nhưng thiếu kiên nhẫn. Có thiên hướng nổi trội về ngôn ngữ, vận động, sáng tạo, biểu đạt cảm xúc. Cần phương pháp học đi kèm trải nghiệm thực tế, không phù hợp với kiểu học nhồi nhét khô khan.",
    camXuc:
      "Tình cảm mãnh liệt, dễ yêu - dễ giận - dễ rạn nứt. Tâm trạng thường thay đổi theo môi trường và đối tượng, rất cần học cách điều tiết cảm xúc. Nếu có thể rèn luyện sự bình tĩnh và ổn định nội tâm, sẽ trở thành người bạn đời thú vị và đầy cuốn hút.",
    honNhan:
      "Hôn nhân dễ xảy ra bất ổn nếu cả hai người đều quá nóng tính hoặc độc lập. Có xu hướng yêu và kết hôn nhanh, nhưng cũng dễ tan vỡ nếu thiếu nền tảng thấu hiểu. Hợp với người có tính cách trầm ổn, biết bao dung và tạo không gian riêng cho đối phương.",
  },
  "97": {
    tinhCach:
      "Hành xử độc lập, biến hoá khó lường, cảm xúc thất thường, dễ nổi giận.",
    taiVan:
      "Tài chính nghiêng về may rủi, tài lộc đến rồi đi rất nhanh.",
    suNghiep:
      "Nhiều ý tưởng nhưng thiếu chiến lược dài hạn; có thể thành công đột phá nhưng khó bền vững, thường làm nhiều việc một lúc.",
    nhanDuyen:
      "Các mối quan hệ xã hội phức tạp, mang tính ẩn mật, khó xác định ai là người giúp đỡ thực sự.",
    sucKhoe:
      "Dễ mắc các bệnh liên quan đến mất ngủ, tim mạch, huyết dịch; dễ sinh các bệnh cấp tính bất ngờ.",
    hocTap:
      "Phản xạ nhanh nhạy, giỏi vận động và các môn nghệ thuật, thiên hướng cảm hứng mạnh mẽ.",
    camXuc:
      "Tâm trạng biến đổi thất thường, hay nghi ngờ, khó ổn định tình cảm.",
    honNhan:
      "Hợp rồi tan vỡ, thật giả lẫn lộn, khó giữ gìn mối quan hệ lâu dài.",
  },
  "36": {
    tinhCach:
      "Độc lập, mạnh mẽ, sáng tạo, luôn muốn làm điều gì đó theo cách riêng. Thích nổi bật, dễ thay đổi ý kiến đột ngột, đôi lúc cực đoan hoặc nóng vội. Tâm trạng thay đổi nhanh chóng, dễ bốc đồng, yêu ghét rõ ràng.",
    taiVan:
      "Có khả năng kiếm tiền tốt khi theo nghề sáng tạo, nghệ thuật, marketing, kinh doanh cá thể hoặc đầu tư. Tuy nhiên rất dễ bị tổn thất tài chính nếu ra quyết định trong lúc nóng giận hoặc tin sai người. Cần học cách kiểm soát dòng tiền, tránh chi tiêu theo cảm xúc.",
    suNghiep:
      "Có tố chất khởi nghiệp, thích làm việc độc lập hoặc trong môi trường tự do sáng tạo. Dễ thành công nếu biết kiên trì, nhưng hay nản, bỏ cuộc giữa chừng vì cảm xúc chi phối. Hợp với công việc nghệ thuật, truyền thông, thể thao, giải trí, hoặc các ngành yêu cầu phản xạ nhanh.",
    nhanDuyen:
      "Quý nhân xuất hiện thường là người phụ nữ thông minh mạnh mẽ, hoặc người có tư duy phá cách. Mối quan hệ quý nhân thường ban đầu trái chiều, mâu thuẫn, nhưng về sau lại giúp bạn thức tỉnh.",
    sucKhoe:
      "Dễ mắc các vấn đề tim mạch, huyết áp, rối loạn nhịp tim; khó ngủ, mất ngủ do cảm xúc không ổn định; các bệnh cấp tính, bộc phát nhanh như đau dạ dày, mệt tim đột ngột. Nên chú ý thiền định, tập thể dục nhẹ và giữ môi trường sống ổn định.",
    hocTap:
      "Có trực giác cao, khả năng cảm nhận tinh tế, đầu óc phản ứng nhanh. Tuy nhiên lại thiếu kiên nhẫn, dễ mất tập trung nếu không có đam mê rõ ràng. Hợp học qua trải nghiệm thực tế hơn là lý thuyết dài dòng.",
    camXuc:
      "Cảm xúc mãnh liệt nhưng bất ổn, dễ yêu sớm, yêu sâu, nhưng cũng dễ đổ vỡ. Khó tin người, dễ nghi ngờ, nên thường cảm thấy thiếu an toàn trong các mối quan hệ. Khi trưởng thành, nếu biết chữa lành cảm xúc, sẽ trở thành người bạn đời thú vị, sâu sắc và có chiều sâu tâm hồn.",
    honNhan:
      "Hôn nhân dễ đến rồi đi nếu không đủ bình tĩnh, mềm mỏng, thấu hiểu. Người có số 36 rất dễ cãi vã, xung đột trong hôn nhân nếu không rèn luyện cách lắng nghe và điều tiết cảm xúc. Khi gặp đúng người biết “giải mã tâm hồn”, sẽ trở nên trung thành và hỗ trợ đắc lực.",
  },
  "63": {
    tinhCach:
      "Độc lập, cá tính mạnh, biến hoá thất thường, dễ nổi giận, cảm xúc thay đổi khó kiểm soát.",
    taiVan:
      "Có tài nhưng khó giữ tiền; dễ mất mát tài sản do đầu tư thiếu tính toán, hoặc tiêu xài theo cảm xúc.",
    suNghiep:
      "Nhiều tài năng, ý tưởng phong phú, nhưng thiếu ổn định; dễ thay đổi ngành nghề, làm nhiều việc một lúc.",
    nhanDuyen:
      "Các mối quan hệ phức tạp, nhiều bí mật hoặc khó nắm bắt; dễ gặp người giúp nhưng cũng dễ vướng vào thị phi.",
    sucKhoe:
      "Dễ mắc các bệnh liên quan đến mất ngủ, tim mạch, huyết áp, hoặc bệnh cấp tính bộc phát nhanh.",
    hocTap:
      "Phản xạ nhanh, có năng khiếu nghệ thuật hoặc thể thao; học tốt qua trải nghiệm thực tế.",
    camXuc:
      "Cảm xúc biến động thất thường, yêu ghét bất định, dễ nghi ngờ, thiếu ổn định trong tình cảm.",
    honNhan:
      "Quan hệ dễ chia ly, tái hợp, thật giả khó phân, dễ thay đổi hoặc bị chi phối bởi cảm xúc nhất thời.",
  },
  "24": {
    tinhCach:
      "Độc lập, có xu hướng hành động theo ý mình. Biến hoá thất thường, tâm trạng dễ thay đổi. Dễ nổi giận hoặc phản ứng cực đoan.",
    taiVan:
      "Tài đến và đi nhanh chóng, dễ bị cám dỗ đầu tư, ham mê những hình thức rủi ro cao như cờ bạc, đầu cơ. Tài chính không ổn định.",
    suNghiep:
      "Có đầu óc chiến lược, sáng tạo, nhưng dễ phân tâm, thiếu kiên trì nên khó theo đuổi một hướng đến cùng.",
    nhanDuyen:
      "Quan hệ xã hội phức tạp, thường đến rồi đi, ít người có thể giúp đỡ lâu dài.",
    sucKhoe:
      "Dễ gặp các bệnh liên quan đến tim mạch, máu huyết, hệ thần kinh, mất ngủ hoặc các bệnh cấp tính do cảm xúc chi phối.",
    hocTap:
      "Có khả năng phản xạ nhanh, học tốt các bộ môn nghệ thuật hoặc vận động. Tuy nhiên dễ chán, thiếu kiên trì trong học tập dài hạn.",
    camXuc:
      "Cảm xúc khó đoán khiến người khác khó hiểu và khó gần gũi lâu dài.",
    honNhan:
      "Dễ xảy ra xung đột, mâu thuẫn vì bất đồng quan điểm hoặc sự không nhất quán trong tình cảm. Tình duyên có nhiều thử thách, dễ thay đổi. Quý nhân khó bền vững.",
  },
  "42": {
    tinhCach:
      "Có cá tính độc lập, tư duy ngược dòng, không dễ bị ảnh hưởng bởi người khác. Tâm lý biến đổi nhanh, dễ nóng giận, phản ứng mạnh mẽ khi bị khiêu khích. Dễ thay đổi quyết định, có khuynh hướng đa đoan và biến động.",
    taiVan:
      "Có thể kiếm tiền nhanh nếu biết nắm bắt cơ hội, nhưng dễ bị cám dỗ đầu tư sai lệch. Cần đề phòng các hình thức tài chính mạo hiểm, không minh bạch. Dễ bị hao tài do các quyết định cảm tính hoặc theo cảm hứng nhất thời.",
    suNghiep:
      "Sở hữu trí tưởng tượng phong phú, có thể thành công trong nghề sáng tạo, nghệ thuật, kỹ năng đặc thù. Dễ phân tâm, nhiều hướng đi nhưng thiếu kiên trì theo đuổi đến cùng. Nếu vượt qua tính cách hay thay đổi, sẽ phát triển mạnh trong môi trường cạnh tranh.",
    nhanDuyen:
      "Có quý nhân nhưng thường đến rồi đi nhanh, khó giữ được mối quan hệ lâu dài. Người giúp thường là duyên bất ngờ, nhưng tính khí bản thân dễ làm mất đi sự hỗ trợ. Muốn có quý nhân bền thì cần rèn tính điềm tĩnh, biết giữ lời và tránh đối đầu.",
    sucKhoe:
      "Dễ gặp vấn đề về tim mạch, giấc ngủ, huyết áp; bệnh đột ngột hoặc các triệu chứng thần kinh, tâm lý. Cần đặc biệt lưu ý hành Hoả vượng quá mức, gây rối loạn trong cơ thể.",
    hocTap:
      "Thông minh, phản xạ nhanh, học nhanh nếu có cảm hứng. Thích hợp với nghệ thuật, sáng tạo, vận động, không phù hợp kiểu học thụ động. Dễ bị chán nản, thay đổi mục tiêu học tập, cần có định hướng rõ ràng.",
    camXuc:
      "Dễ rơi vào trạng thái thay đổi cảm xúc liên tục, có lúc yêu có lúc ghét nhanh chóng. Tình yêu nhiều màu sắc nhưng thiếu ổn định, dễ xảy ra mâu thuẫn. Đôi lúc nghi ngờ, đa nghi, khó kiểm soát tâm trạng.",
    honNhan:
      "Dễ rơi vào tình huống hôn nhân phân ly, không bền, nếu không học cách nhẫn nhịn. Có xu hướng tranh cãi, phân tích rạch ròi, dẫn đến tổn thương tình cảm. Hôn nhân tốt chỉ đến khi bản thân biết lắng nghe và tiết chế sự cực đoan.",
  },

  // ─────────────────── TUYỆT MỆNH — Phá tài, kiện tụng, bệnh tật ───────────────────
  // ⚠️ Cặp 69 CỐ Ý bỏ trống: trong bản OCR, khối "69" mang nguyên nội dung của Phục Vị 66 (ổn định,
  // ẩn nhẫn, "Bốn bình tám ổn") — sai tinh, không dùng được cho một cặp Tuyệt Mệnh. Xem file khuyết.
  "12": {
    tinhCach:
      "Thẳng thắn, dám nói dám làm, hành động trực tiếp, luôn cố gắng và nỗ lực không ngừng.",
    taiVan:
      "Dám đầu tư mạo hiểm, thường gặp rủi ro lớn; được nhiều cũng có thể mất nhiều.",
    suNghiep:
      "Quyết đoán trong đầu tư, trí tuệ đi đôi với dũng cảm, thích thử thách và chinh phục.",
    nhanDuyen:
      "Quan hệ xã hội thường rơi vào cực đoan — hoặc là quý nhân hỗ trợ lớn, hoặc dễ bị cô lập, phân cực.",
    sucKhoe: "Dễ mắc bệnh về gan, thận, hệ tiết niệu và sinh sản.",
    hocTap:
      "Ghi nhớ tốt, tư duy mạnh, thích chinh phục tri thức chưa biết, học qua trải nghiệm thực tế.",
    camXuc:
      "Yêu ghét rõ ràng, dám yêu dám hận, dễ bị tổn thương nếu tình cảm không được đáp lại, dễ hành động cực đoan.",
    honNhan:
      "Không ổn định, dễ xảy ra va chạm hoặc tan vỡ bất ngờ, có thể vì xung đột hoặc khác biệt về tính cách.",
  },
  "21": {
    tinhCach:
      "Tư duy mạnh, quyết đoán, không ngại khó khăn, dám nói, dám làm. Có thể hơi bốc đồng, bộc trực, thẳng tính, đôi khi khiến người khác bị sốc. Có năng lượng chiến binh tiên phong, không thích bị ràng buộc, ghét sự mập mờ.",
    taiVan:
      "Tài vận dễ dao động mạnh, có lúc kiếm được rất nhiều tiền, nhưng cũng dễ bị mất trắng. Thường phù hợp với ngành đầu tư, kinh doanh, chứng khoán, mạo hiểm, công nghệ, khởi nghiệp, nhưng không nên đặt tất cả trứng vào một giỏ. Khi chưa làm chủ cảm xúc, dễ vung tay quá trán hoặc gặp cảnh hao tổn lớn vì quyết định sai lúc nóng vội.",
    suNghiep:
      "Phù hợp với công việc cần phá cách, đổi mới, cạnh tranh cao, nhiều thử thách, như sales, startup, lãnh đạo đội nhóm. Có khả năng gây dựng từ con số 0, nhưng cần học cách quản trị rủi ro. Nếu phát triển đúng hướng, sự nghiệp bùng nổ nhanh và tạo dấu ấn cá nhân rõ nét.",
    nhanDuyen:
      "Quý nhân thường đến trong những giai đoạn khủng hoảng, như người dẫn đường bất ngờ. Có thể là người từng đối đầu, nhưng về sau lại trở thành người hỗ trợ đắc lực. Mối quan hệ quý nhân mang tính nghiệp duyên sâu sắc, giúp bạn học bài học quan trọng của cuộc đời.",
    sucKhoe:
      "Điểm yếu liên quan đến gan mật, hệ tiết niệu, sinh dục; dễ gặp vấn đề rối loạn nội tiết, hệ bài tiết. Người nữ dễ có vấn đề liên quan tử cung, kinh nguyệt. Nên tránh lối sống thất thường, thiếu ngủ, ăn uống không điều độ khiến cơ thể suy yếu nhanh.",
    // hocTap: OCR lặp lại đúng đoạn Nhân duyên, mục Học tập thật bị mất — bỏ trống, không mượn từ cặp khác.
    camXuc:
      "Nội tâm phức tạp, dễ rơi vào trạng thái yêu cực độ, hận cực điểm. Có xu hướng yêu cuồng sống vội, nhiều lần tổn thương vì dốc lòng không đúng người. Khi trưởng thành sẽ biết cách yêu thông minh và có giới hạn hơn.",
    honNhan:
      "Tình duyên dao động, dễ đổ vỡ nếu thiếu sự kiểm soát cảm xúc. Cần học cách giao tiếp không gây tổn thương, kiểm soát lời nói khi nóng giận. Khi kết hôn đúng người, sẽ là trụ cột mạnh mẽ, biết gánh vác và bảo vệ gia đình.",
  },
  "96": {
    tinhCach:
      "Cá tính mạnh, thẳng thắn, trực diện, dứt khoát. Luôn dám nghĩ, dám làm, dám đấu tranh, có bản lĩnh vượt thử thách. Tính cách quyết liệt, không vòng vo, thích cạnh tranh công bằng.",
    taiVan:
      "Có khả năng thu hút tài lộc từ đầu tư mạo hiểm hoặc những ngành nghề cần tốc độ và sự quyết đoán. Tài vận dạng “thắng lớn, rủi ro cao” — rất dễ thành công vang dội nhưng cũng có nguy cơ trượt dốc bất ngờ nếu không kiểm soát cảm xúc. Khả năng kiếm tiền nhanh nhưng cũng dễ hụt hơi nếu không biết giữ.",
    suNghiep:
      "Dễ thành công khi theo đuổi các ngành liên quan đến thương trường, quân sự, kỹ thuật, công nghệ. Có tinh thần chiến binh, thích cạnh tranh, chấp nhận rủi ro, càng bị thách thức càng toả sáng. Tuy nhiên cần học cách kiên định và có chiến lược, tránh làm mọi việc kiểu “bốc đồng, đốt cháy giai đoạn”.",
    nhanDuyen:
      "Quý nhân thường xuất hiện trong biến cố, như “tái ông thất mã”; cũng dễ gặp “người gây biến”. Số này thường gặp quý nhân theo dạng nghiệp quả, dạy những bài học lớn.",
    sucKhoe:
      "Dễ mắc các bệnh liên quan đến gan, thận, huyết áp, tiểu đường, hệ tiết niệu, sinh sản. Cần chú trọng điều chỉnh chế độ ăn uống và nhịp sinh hoạt, tránh làm việc quá độ hoặc stress liên tục.",
    hocTap:
      "Ghi nhớ và phản xạ cực kỳ nhanh, học nhanh, áp dụng nhanh. Tư duy đột phá, sáng tạo, không theo lối mòn, phù hợp với nghiên cứu tình huống thực tế. Tuy nhiên dễ mất kiên nhẫn nếu nội dung quá lý thuyết hoặc dài dòng.",
    camXuc:
      "Cảm xúc thiên về cực đoan: yêu hết mình, ghét rất rõ. Dễ bị chi phối bởi cảm xúc nhất thời, đôi khi cực đoan đòi hỏi hoặc khó tha thứ. Nếu biết điều tiết cảm xúc, có thể trở thành người truyền cảm hứng mạnh mẽ.",
    honNhan:
      "Dễ nảy sinh mâu thuẫn do khác biệt quan điểm và thiếu kiên nhẫn. Có tính bốc đồng, kết hôn chóng vánh cũng chia tay nhanh. Cần tìm người đủ bản lĩnh đối trọng thì hôn nhân mới bền.",
  },
  // Cặp 69 bị bản OCR "Sim Nói Gì Về Bạn" ghi hỏng (lẫn sang Phục Vị 66). Hai mặt dưới đây lấy từ
  // cuốn "Thiên Mệnh Giàu Sang" (Ánh Dương): tinhCach là đặc tính chung của từ trường Tuyệt Mệnh
  // (áp cho mọi cặp Tuyệt Mệnh, gồm 69); taiVan là phần riêng cho cặp 69/96. Sáu mặt còn lại để
  // trống vì cuốn này tổ chức theo từ trường, không luận riêng 8 mặt cho từng cặp — KHÔNG bịa.
  "69": {
    tinhCach:
      "Mang đặc tính chung của từ trường Tuyệt Mệnh: cuộc sống dao động mạnh, có thể đi từ vinh quang đến khổ cực, tính cách cực đoan, dứt khoát. Người sở hữu có tài năng vượt trội nhưng dễ gặp tai nạn hoặc kiện tụng.",
    taiVan:
      "Trong nhóm Tuyệt Mệnh, cặp 69/96 được xếp ở mức mạnh. Tài vận phần lớn phản ánh sự sa lầy trong những quyết định đầu tư sai lầm, khiến tiền bạc bị cuốn vào vòng xoáy, dễ nghĩ đến chuyện buông bỏ khiến tài lộc đứt gãy, mất kết nối. Cần cân nhắc thật kỹ trước mỗi quyết định lớn về tiền.",
    suNghiep: "",
    nhanDuyen: "",
    sucKhoe: "",
    hocTap: "",
    camXuc: "",
    honNhan: "",
  },
  "48": {
    tinhCach:
      "Thẳng thắn, dám đương đầu và bộc trực. Hành động rõ ràng, quyết đoán. Luôn cố gắng và nỗ lực hết mình.",
    taiVan:
      "Có xu hướng đầu tư mạo hiểm, không sợ rủi ro. Tài lộc biến động lớn, có thể lên rất cao rồi xuống cũng rất nhanh, thăng trầm bất ngờ.",
    suNghiep:
      "Dám đầu tư và quyết đoán trong hành động. Thường đảm nhiệm song song nhiều vai trò. Có khuynh hướng chinh phục và thích vượt thử thách.",
    nhanDuyen:
      "Quan hệ quý nhân thường cực đoan: hoặc được giúp hết lòng, hoặc bị cô lập. Có thể gặp người phân cực rõ rệt — hoặc là cứu tinh, hoặc là đối đầu.",
    sucKhoe:
      "Dễ mắc bệnh về gan, thận, tiểu đường, hệ sinh dục và tiết niệu. Cần đề phòng bệnh mãn tính hoặc liên quan đến nội tiết.",
    hocTap:
      "Tư duy phân tích mạnh, ghi nhớ tốt, có khả năng tiếp thu qua trải nghiệm, thích đối đầu với những điều chưa biết.",
    camXuc:
      "Yêu ghét rõ ràng, cực đoan trong tình cảm. Khi yêu thì hết mình, khi thất vọng thì dễ rơi vào thái cực ngược lại.",
    honNhan:
      "Tình cảm không ổn định, dễ xảy ra xung đột, thay đổi đột ngột. Có thể dẫn đến tan vỡ nếu không có sự thấu hiểu và kiểm soát cảm xúc.",
  },
  "84": {
    tinhCach:
      "Thẳng thắn, dám nói, dám làm, trực diện, quyết đoán rõ ràng, quả cảm, giàu nghị lực.",
    taiVan:
      "Dám đầu tư, chấp nhận rủi ro cao, dễ được cũng dễ mất, biến động lớn; có thể thịnh vượng hoặc phá sản.",
    suNghiep:
      "Đầu tư quyết liệt, thích học hỏi song song, thích chinh phục và đối mặt thử thách.",
    nhanDuyen:
      "Quan hệ quý nhân dễ thay đổi, dễ gặp người hai mặt, hoặc phân hoá rõ ràng như nước với lửa.",
    sucKhoe: "Dễ mắc bệnh về gan, thận, hệ tiết niệu và sinh sản.",
    hocTap:
      "Ghi nhớ tốt, tư duy mạnh, ưa phân tích và khám phá điều chưa biết, thích chinh phục tri thức mới.",
    camXuc:
      "Tình cảm rõ ràng, yêu ghét rành mạch, dám yêu dám hận, dễ hành động cực đoan nếu cảm xúc bị tổn thương.",
    honNhan:
      "Tính cách không ổn định, dễ thay đổi trong thời điểm nhất định, dễ có va chạm hoặc chia ly đột ngột.",
  },
  "37": {
    tinhCach: "Thẳng thắn, dám nói dám làm, hành động trực tiếp, quyết đoán rõ ràng.",
    taiVan:
      "Dễ đầu tư liều lĩnh, theo kiểu “được ăn cả, ngã về không”, tài vận lên xuống thất thường.",
    suNghiep:
      "Quyết đoán trong đầu tư, có dũng khí và trí tuệ để đối mặt thử thách, thích chinh phục và hành động.",
    nhanDuyen:
      "Quan hệ dễ phân cực rõ ràng: hoặc cực tốt, tương trợ hết mình, hoặc tuyệt giao — phân hoá hai thái cực.",
    sucKhoe: "Dễ gặp vấn đề về gan, thận, hệ sinh dục và tiết niệu.",
    hocTap:
      "Ghi nhớ tốt, tư duy mạnh, khả năng phân tích và xử lý thông tin tốt, thích học hỏi từ thử thách.",
    camXuc:
      "Tình cảm rõ ràng, yêu ghét phân minh; khi yêu thì hết lòng, khi tổn thương dễ đi vào cực đoan.",
    honNhan:
      "Tính cách không ổn định, dễ thay đổi, mâu thuẫn xuất hiện bất ngờ, có thể dẫn đến chia tay chóng vánh nếu không kiểm soát cảm xúc.",
  },
  "73": {
    tinhCach:
      "Tính cách mạnh mẽ, dám nghĩ dám làm, không ngại va chạm. Hành động quyết đoán, trực diện, không vòng vo. Rất dễ chinh phục thử thách nhưng thiếu sự mềm mại trong xử lý tình huống. Khi đã đặt mục tiêu, người này sẽ làm đến cùng, có thể hy sinh cả bản thân để đạt được.",
    taiVan:
      "Có số mệnh đầu tư, dấn thân liều lĩnh. Tài vận đến nhanh nhưng cũng dễ mất nếu không kiểm soát được tham vọng, nóng vội và lòng tin vào rủi ro. Hợp với mô hình kinh doanh cá nhân, đầu tư tự do, tài chính, hoặc thương trường có tính cạnh tranh.",
    suNghiep:
      "Sự nghiệp mang tính chinh chiến, thử thách liên tục, không ổn định. Dễ thành công nếu làm chủ hoặc theo các con đường độc lập, tự khai phá. Nếu theo công việc truyền thống sẽ bị gò bó, khó phát huy. Cần có môi trường áp lực cao, cạnh tranh thì mới phát triển.",
    nhanDuyen:
      "Quý nhân thường đến vào lúc khủng hoảng, giúp chuyển hướng. Có hai nhóm quý nhân: một là người từng trải, dám thẳng thắn nói thật; hai là người đồng chí hướng nhưng không nhiều. Người mang số 73 cần học cách nhìn người và giữ lòng kiên định trước thị phi.",
    sucKhoe:
      "Dễ gặp vấn đề về gan, thận, tiểu đường, đường tiết niệu sinh dục, hoặc các bệnh chuyển hoá. Dễ suy nhược nếu làm việc quá sức hoặc căng thẳng kéo dài. Cần tránh thức khuya và bỏ ăn khi áp lực, dễ tạo bệnh tiềm ẩn.",
    hocTap:
      "Tư duy sắc bén, phản xạ mạnh, học rất nhanh khi bị ép hoặc khi có mục tiêu rõ ràng. Tuy nhiên dễ thiếu sự bền bỉ trong việc trau dồi chiều sâu nếu không được định hướng tốt. Cần tránh học kiểu “được chăng hay chớ”, cần rèn tư duy lập chiến lược.",
    camXuc:
      "Cảm xúc có phần cực đoan: rất yêu, rất ghét; yêu sâu đậm nhưng dễ quay lưng dứt khoát khi thất vọng. Có phần nóng tính, khó kiểm soát cảm xúc, dễ mất đi người mình quý vì bộc phát. Cần học cách điều tiết cảm xúc để giữ vững các mối quan hệ.",
    honNhan:
      "Hôn nhân dễ gặp nhiều thử thách. Tình duyên nhiều biến động, có thể trải qua những cuộc tình dữ dội hoặc rạn nứt vì bất đồng quan điểm. Cần tìm người có sự mềm mỏng, hiểu biết tâm lý, biết cảm hoá thì mới bền vững.",
  },

  // ─────────────────── LỤC SÁT — Đào hoa, thương tổn tình cảm ───────────────────
  "16": {
    tinhCach:
      "Dịu dàng, mềm mỏng, dễ do dự, khó quyết đoán. Thường quá thận trọng nên dễ để tuột mất cơ hội.",
    taiVan:
      "Tài lộc phụ thuộc vào các mối quan hệ, đặc biệt trong ngành nghề dịch vụ. Tuy nhiên dễ hao tổn tiền bạc vì tình cảm.",
    suNghiep:
      "Phù hợp với ngành chăm sóc người khác, làm đẹp, nghệ thuật hoặc công việc phục vụ công chúng.",
    nhanDuyen:
      "Thường có duyên với nhiều người, đặc biệt là người khác giới, rất thu hút nhờ sự mềm mại, ân cần và tinh tế. Tuy nhiên vì tính cách do dự, bị cảm xúc chi phối, nên dễ lỡ duyên tốt, hoặc gặp người không phù hợp nhưng khó dứt ra. Họ cần học cách lắng nghe trực giác, phân biệt giữa cảm xúc nhất thời và giá trị lâu dài, mới mong kết nối được mối nhân duyên tốt đẹp và bền vững.",
    sucKhoe:
      "Cần giữ tinh thần tích cực, quan tâm đến sức khoẻ thần kinh và làn da.",
    hocTap:
      "Khả năng học qua cảm xúc, thẩm mỹ cao, phù hợp các ngành liên quan đến nghệ thuật.",
    camXuc:
      "Người sống tình cảm, tinh tế nhưng dễ bị phụ thuộc cảm xúc vào người khác.",
    honNhan:
      "Duyên với người khác giới mạnh, dễ thu hút và được yêu mến, nhưng nếu không tỉnh táo dễ vướng vào các mối quan hệ phức tạp hoặc mệt mỏi tình cảm.",
  },
  "61": {
    tinhCach:
      "Dịu dàng, nhạy cảm, do dự, thiếu quyết đoán. Hay quá thận trọng nên dễ bỏ lỡ cơ hội.",
    taiVan:
      "Tài lộc đến từ các mối quan hệ hoặc ngành dịch vụ, nhưng dễ bị ảnh hưởng bởi cảm xúc, vì yêu mà mất tiền.",
    suNghiep:
      "Có sức hút lớn, phù hợp với công việc liên quan đến làm đẹp, nghệ thuật, thẩm mỹ hoặc dịch vụ công.",
    nhanDuyen:
      "Có nhiều nhân duyên khác giới, sức hút tự nhiên cao trong các mối quan hệ.",
    sucKhoe:
      "Dễ mắc các bệnh về tiêu hoá (ruột, dạ dày), da liễu, bệnh về thần kinh hoặc lo âu, trầm cảm nhẹ.",
    hocTap:
      "Học tốt qua nghệ thuật, có khiếu thẩm mỹ, thiên về cảm xúc. Phù hợp với môi trường học tập giàu tính sáng tạo.",
    camXuc:
      "Tình cảm sâu sắc, dễ rung động, suy nghĩ tinh tế và giàu cảm xúc, nhưng đôi khi rơi vào trạng thái suy diễn và buồn vu vơ.",
    honNhan:
      "Nhân duyên với người khác giới mạnh, dễ thu hút người bên ngoài, nhưng cần tỉnh táo để tránh rối rắm và mệt mỏi tình cảm.",
  },
  "47": {
    tinhCach:
      "Mềm mỏng, hay do dự, thiếu quyết đoán; quá thận trọng nên dễ bỏ lỡ cơ hội.",
    taiVan:
      "Tài lộc đến từ các mối quan hệ xã hội và phục vụ người khác, nhưng dễ bị ảnh hưởng bởi cảm xúc hoặc tình cảm.",
    suNghiep:
      "Có sức hút và duyên dáng, phù hợp với ngành làm đẹp, dịch vụ công chúng, nghệ thuật hoặc truyền thông.",
    nhanDuyen:
      "Có nhiều mối nhân duyên đặc biệt, được yêu mến rộng rãi, có sức hấp dẫn từ ngoại hình và khí chất.",
    sucKhoe:
      "Dễ gặp vấn đề về tiêu hoá (ruột, dạ dày), da liễu, thần kinh và các bệnh liên quan đến căng thẳng hoặc trầm cảm.",
    hocTap:
      "Có năng khiếu thẩm mỹ, nghệ thuật và học qua cảm xúc, thiên hướng học sáng tạo.",
    camXuc:
      "Nội tâm sâu sắc, giàu cảm xúc, suy nghĩ tinh tế, dễ bị tổn thương vì tình cảm, yêu hết lòng và dễ vướng bận.",
    honNhan:
      "Duyên với người khác giới mạnh mẽ, dễ kết duyên với người ngoại quốc hoặc khác biệt tính cách; dễ bị cuốn hút nhưng cũng dễ rơi vào trạng thái mâu thuẫn nội tâm.",
  },
  "74": {
    tinhCach:
      "Là người cẩn trọng, phân tích kỹ, thường do dự khi phải ra quyết định lớn. Tính cách mềm mại, thiên về cảm xúc, đa sầu đa cảm và dễ lo xa. Nội tâm sâu sắc, yêu cái đẹp và có gu thẩm mỹ tinh tế.",
    taiVan:
      "Có duyên với nghề dịch vụ, hỗ trợ, chăm sóc khách hàng, làm nghề “cho đi”. Tiền bạc đến từ sự phục vụ, tạo giá trị cho người khác, không thích tranh giành. Cần tránh vì tình mà hao tài hoặc bị cuốn vào các khoản chi không kiểm soát vì cảm xúc.",
    suNghiep:
      "Hợp với nghề giáo dục, tư vấn. Có duyên trong lĩnh vực làm đẹp, phụ nữ hoặc môi trường giàu tính nữ, sáng tạo. Toả sáng trong các ngành yêu cầu sự tinh tế, thẩm mỹ và cảm xúc.",
    nhanDuyen:
      "Quý nhân là người có gu thẩm mỹ, phụ nữ lớn tuổi, người làm nghệ thuật hoặc chữa lành. Có nhiều người yêu quý vì sự nhẹ nhàng, tinh tế và thấu cảm. Quý nhân thường không đến trực diện mà đến theo cách kín đáo, nhẹ nhàng, nên cần biết quan sát để nhận ra.",
    sucKhoe:
      "Dễ gặp vấn đề dạ dày, ruột, tiêu hoá, đặc biệt khi lo lắng kéo dài. Làn da, nội tiết, rối loạn hệ miễn dịch hoặc stress thần kinh âm ỉ.",
    hocTap:
      "Có khả năng học trị liệu, thẩm mỹ, văn chương. Khả năng cảm nhận cái đẹp tốt, thích học bằng trải nghiệm trực giác hoặc hình ảnh thị giác. Dễ bị phân tán nếu môi trường học tập thiếu cảm hứng hoặc quá khô khan.",
    camXuc:
      "Tâm lý nhạy cảm, cầu cao về sự thấu hiểu và đồng điệu cảm xúc. Thường sống nội tâm, đôi khi dễ rơi vào lo âu, u uất nếu không được sẻ chia. Nếu biết khai thác, đây là người có khả năng chữa lành cảm xúc cho người khác.",
    honNhan:
      "Tình cảm khá lý tưởng nếu kết nối được với người biết chia sẻ và nâng đỡ tinh thần. Tuy nhiên cũng dễ gặp các mối nhân duyên bất ổn, lỡ nhịp, mối quan hệ bị cảm xúc dẫn dắt. Hôn nhân cần có sự đồng cảm tinh tế, tránh gượng ép theo mô típ truyền thống cứng nhắc.",
  },
  "38": {
    tinhCach:
      "Tính cách dịu dàng, tinh tế, suy nghĩ thấu đáo. Tuy nhiên có xu hướng do dự, dễ phân tâm và quá thận trọng, khiến chậm ra quyết định. Người có số 38 thường mang khí chất nghệ sĩ, sống nội tâm và sâu sắc.",
    taiVan:
      "Tài vận đến nhờ mối quan hệ và khả năng cá nhân. Dễ kiếm tiền qua nghề sáng tạo, chăm sóc, nghệ thuật, hoặc dịch vụ cá nhân hoá. Tuy nhiên có thể bị ảnh hưởng bởi cảm xúc, khiến tài lộc không ổn định nếu thiếu bản lĩnh.",
    suNghiep:
      "Rất phù hợp với các ngành thẩm mỹ, làm đẹp, thiết kế, sáng tạo, nghệ thuật, viết lách, tư vấn tâm lý, giáo dục cảm xúc. Có sức hút cá nhân cao, dễ thu hút khách hàng hoặc được yêu mến trong môi trường nữ tính, nhẹ nhàng. Tuy nhiên đôi khi thiếu sự quyết liệt để bứt phá.",
    nhanDuyen:
      "Quý nhân là người cùng tần số cảm xúc, dễ đồng cảm và giúp đỡ chân thành. Duyên đến nhờ cách ứng xử tinh tế, hoà nhã. Nữ giới thường được nâng đỡ nhiều hơn nếu làm nghề liên quan đến phụ nữ, thẩm mỹ, giáo dục, trị liệu.",
    sucKhoe:
      "Dễ gặp vấn đề về đường ruột, tiêu hoá, da liễu; các bệnh mãn tính về thần kinh, tâm lý như lo âu, trầm cảm nhẹ, rối loạn cảm xúc.",
    hocTap:
      "Tư duy hợp các môn nghệ thuật, thiết kế, văn học, tâm lý. Có gu cảm nhận tinh tế, khả năng phân tích thẩm mỹ bẩm sinh. Nếu được rèn luyện trong môi trường đúng, người mang số 38 dễ trở thành chuyên gia trong lĩnh vực mỹ thuật, nghệ thuật ứng dụng, chữa lành.",
    camXuc:
      "Rất nhạy cảm, sống thiên về chiều sâu và cảm xúc. Có nội tâm phong phú, tâm hồn nghệ sĩ, nhưng dễ bị ảnh hưởng bởi cảm xúc tiêu cực nếu không được lắng nghe đúng và đủ.",
    honNhan:
      "Có duyên tình phong phú nhưng dễ rơi vào các mối quan hệ phức tạp nếu không rõ ràng về cảm xúc. Cần người bạn đời hiểu tâm hồn, chia sẻ được giá trị tinh thần. Khi ổn định, đời sống hôn nhân hài hoà và đầy cảm xúc.",
  },
  "83": {
    tinhCach:
      "Dịu dàng, biết cân nhắc, nhưng dễ do dự, chần chừ. Quá thận trọng khiến bỏ lỡ cơ hội. Nội tâm dễ dao động.",
    taiVan:
      "Kiếm tiền dựa vào giao tiếp, dịch vụ, nghề liên quan đến phụ nữ. Tài lộc đến từ các mối quan hệ, nhưng cũng dễ bị chi phối bởi cảm xúc.",
    suNghiep:
      "Có sức hấp dẫn, phù hợp với các lĩnh vực làm đẹp, truyền thông hoặc nghệ thuật. Dễ được công chúng chú ý bởi ngoại hình và sự tinh tế.",
    nhanDuyen:
      "Có nhiều người khác giới giúp đỡ. Nhân duyên phong phú, nhưng cũng dễ bị hiểu lầm hoặc vướng vào thị phi tình cảm.",
    sucKhoe:
      "Dễ mắc bệnh về đường ruột, tiêu hoá, da liễu; ngoài ra còn liên quan đến căng thẳng thần kinh.",
    hocTap:
      "Có năng khiếu về thẩm mỹ, nghệ thuật, sáng tạo. Học qua cảm xúc và trực giác.",
    camXuc:
      "Nhạy cảm, suy nghĩ nhiều, dễ bị tổn thương. Có đời sống nội tâm phong phú nhưng dễ vướng vào rối ren tình cảm.",
    honNhan:
      "Dễ có duyên với người khác giới mạnh mẽ, nhưng dễ gặp rắc rối vì đào hoa. Có thể có những trải nghiệm yêu đương phức tạp hoặc tình huống ngoài ý muốn.",
  },
  "29": {
    tinhCach:
      "Dịu dàng, tinh tế, nhưng hay do dự và thiếu quyết đoán. Có xu hướng quá thận trọng trong mọi việc, đôi khi khiến bản thân mệt mỏi.",
    taiVan:
      "Tài lộc đến từ các mối quan hệ xã hội, dịch vụ hoặc làm đẹp. Dễ bị ảnh hưởng bởi cảm xúc, tài chính phụ thuộc nhiều vào mối quan hệ.",
    suNghiep:
      "Có sức hút tự nhiên, phù hợp ngành nghề liên quan đến nghệ thuật, làm đẹp, thẩm mỹ, hoặc chăm sóc cộng đồng. Giỏi giao tiếp và tạo thiện cảm.",
    nhanDuyen:
      "Có sức hút với người khác, tuy nhiên các mối quan hệ thường phức tạp, dễ rơi vào hiểu lầm tình cảm.",
    sucKhoe:
      "Dễ mắc các bệnh về hệ tiêu hoá (ruột, dạ dày), da liễu, và các vấn đề tâm lý như lo âu, căng thẳng hoặc trầm cảm.",
    hocTap:
      "Có thiên hướng nghệ thuật, thẩm mỹ. Học tốt qua cảm xúc, óc quan sát và năng khiếu sáng tạo; phù hợp với các ngành sáng tác.",
    camXuc:
      "Cảm xúc phong phú, tinh tế và sâu sắc. Dễ rung động, nhưng cũng dễ buồn và bị tổn thương vì tình cảm.",
    honNhan:
      "Duyên với khác giới mạnh mẽ. Dễ gặp được người thú vị, nhưng cũng cần tỉnh táo để tránh những mối quan hệ rắc rối hoặc cảm tính.",
  },
  "92": {
    tinhCach:
      "Có khí chất ôn hoà, uyển chuyển, cảm xúc sâu, cẩn trọng và thường suy nghĩ quá nhiều trước khi quyết định. Tính cách có phần do dự, dễ phân vân trước lựa chọn. Ưu điểm là có con mắt nghệ thuật, tinh tế, sống sâu sắc, hợp nghề giáo dục, tâm lý.",
    taiVan:
      "Tài lộc đến thông qua mối quan hệ xã hội, giao tiếp, thuyết phục và phục vụ. Dễ nhận được sự giúp đỡ tài chính từ người khác hoặc từ công việc mang tính nghệ thuật, dịch vụ, làm đẹp. Tuy nhiên cần chú ý xu hướng bị cảm xúc chi phối, dễ bị tổn hao tài lộc do tin người, bị ảnh hưởng bởi tình cảm.",
    suNghiep:
      "Có năng lực cao trong lĩnh vực truyền thông, quảng bá, giáo dục, tâm lý, chăm sóc sắc đẹp, dịch vụ cộng đồng. Có sức hút đặc biệt từ phong thái và năng lực cá nhân, đặc biệt khi làm việc với người khác phái. Thích hợp công việc cần ngoại giao, tạo dựng hình ảnh, làm đẹp, hỗ trợ.",
    nhanDuyen:
      "Có nhiều quý nhân, đặc biệt là người khác giới hoặc người có gu thẩm mỹ cao, giàu trải nghiệm xã hội. Tương tác tốt với người tinh tế, có khả năng thuyết phục và có nền tảng nghệ thuật, xã giao. Tuy nhiên cũng dễ bị ảnh hưởng bởi thị phi, cảm xúc cá nhân; nếu không giữ vững bản thân dễ bị tổn thương.",
    sucKhoe:
      "Dễ gặp vấn đề về tiêu hoá (ruột, dạ dày), da liễu; não bộ rối loạn, lo âu, trầm cảm nhẹ. Do cảm xúc sâu sắc, khi bị stress dễ ảnh hưởng tới sức khoẻ tổng thể.",
    hocTap:
      "Có thiên hướng học về mỹ thuật, làm đẹp, tâm lý, văn học, nghệ thuật, thiết kế, biểu đạt. Đặc biệt có khả năng thẩm mỹ và đánh giá tinh tế, rất phù hợp nghề liên quan đến sáng tạo.",
    camXuc:
      "Tâm hồn sâu sắc, nhạy cảm, nội tâm phong phú, giàu lòng trắc ẩn. Nhưng đôi khi cảm xúc trở thành điểm yếu, khiến dễ tổn thương, dễ bị lệ thuộc vào tình cảm. Cần học cách kiểm soát cảm xúc, tránh sa đà vào ảo tưởng hoặc quá đa cảm.",
    honNhan:
      "Số này đào hoa, có sức hút từ ánh nhìn, phong thái. Tuy nhiên hôn nhân dễ gặp thử thách nếu không có sự đồng cảm sâu sắc và giao tiếp rõ ràng. Dễ vướng vào các mối quan hệ phức tạp nếu không kiểm soát cảm xúc và lòng thương người.",
  },

  // ─────────────────── HỌA HẠI — Khẩu thiệt, tai họa bất ngờ ───────────────────
  "17": {
    tinhCach:
      "Ưa nói năng, thích thể hiện bản thân qua lời nói, có tài hùng biện, dễ thu hút sự chú ý nhờ ngôn từ.",
    taiVan:
      "Tài lộc đến từ lời ăn tiếng nói, dễ kiếm tiền nhờ giao tiếp; tuy nhiên cũng dễ mất tiền vì lời nói thiếu cẩn trọng.",
    suNghiep:
      "Giỏi nghề liên quan đến ngôn ngữ, khả năng thuyết phục tốt, sức ảnh hưởng từ lời nói mạnh mẽ.",
    nhanDuyen:
      "Quan hệ xã hội rộng nhờ tài ăn nói; giỏi giao thiệp nên dễ được người giúp đỡ, nhưng cũng dễ bị ganh ghét vì quá giỏi lời.",
    sucKhoe:
      "Dễ mắc bệnh liên quan đến miệng, họng, hệ hô hấp và các bệnh vùng ngực.",
    hocTap:
      "Giỏi ngôn ngữ, học nhanh qua lời nói, khả năng diễn đạt tốt, thông minh bẩm sinh về ngôn từ.",
    camXuc:
      "Thích ngọt ngào, khéo ăn nói, dễ gây hiểu lầm vì lời nói không nhất quán, có xu hướng dùng lời để điều khiển cảm xúc.",
    honNhan:
      "Mâu thuẫn xuất phát từ tranh cãi, xung đột do lời nói; hay có thể giả tạo hoặc dễ hiểu lầm nhau.",
  },
  "71": {
    tinhCach:
      "Tính cách cứng rắn, cãi lý mạnh, dễ nổi nóng. Có xu hướng đối đầu, tranh luận, dễ gây mâu thuẫn do lời nói.",
    taiVan:
      "Có tài ăn nói, kiếm tiền bằng lời nói, nhưng dễ phá tài do thiếu tiết chế ngôn từ hoặc vì lời nói gây hoạ.",
    suNghiep:
      "Hợp với nghề nghiệp liên quan đến giao tiếp, giảng dạy, thuyết trình. Khả năng diễn đạt và thuyết phục tốt, dễ thăng tiến nếu biết điều chỉnh giọng điệu và cảm xúc.",
    nhanDuyen:
      "Có quý nhân trợ giúp từ mối quan hệ xã hội, nhưng cũng dễ gặp thị phi do ngôn từ gây hiểu nhầm — “miệng là gốc của thành công, cũng là gốc của thất bại”.",
    sucKhoe:
      "Dễ mắc bệnh liên quan đến họng, miệng, phổi, hoặc đường hô hấp, ngực. Cần tránh nói nhiều khi căng thẳng hoặc xúc động.",
    hocTap:
      "Có khiếu về ngôn ngữ, khả năng học nhanh, giỏi thuyết trình, tranh luận. Tư duy sắc bén, thông minh, nhưng cần học cách lắng nghe và tiết chế lời nói.",
    camXuc:
      "Dễ ghen tuông, nghi ngờ. Cảm xúc dao động mạnh, dễ bị tổn thương hoặc gây tổn thương người khác bằng lời nói.",
    honNhan:
      "Thường xuyên xảy ra cãi vã, xung đột vì lời nói. Dễ có mối quan hệ tình cảm phức tạp hoặc giả dối, dẫn đến tổn thương tình cảm.",
  },
  "89": {
    tinhCach:
      "Cứng đầu, bướng bỉnh, dễ giận, khí thế mạnh mẽ. Thường hay tranh cãi, có xu hướng quyết liệt trong lời nói và hành xử.",
    taiVan:
      "Kiếm tiền bằng khả năng ăn nói, thuyết phục. Tài vận đến từ lời nói, nhưng cũng dễ mất tài vì nói quá đà hoặc không kiểm soát lời lẽ.",
    suNghiep:
      "Thành công nhờ khả năng diễn đạt, làm việc liên quan đến truyền thông, thuyết trình, đào tạo. Có tài tranh biện và thuyết phục người khác.",
    nhanDuyen:
      "Các mối quan hệ xã hội phức tạp, dễ có quý nhân từ việc giao tiếp. Tuy nhiên “thành bởi miệng, bại cũng bởi miệng” là đặc trưng.",
    sucKhoe:
      "Dễ gặp bệnh liên quan đến miệng, họng, thanh quản, hoặc đường hô hấp. Cần chú ý phổi khi căng thẳng hoặc nói quá nhiều.",
    hocTap:
      "Có khiếu về ngôn ngữ, giao tiếp; khả năng học ngoại ngữ hoặc các ngành liên quan đến diễn đạt, trình bày rất tốt.",
    camXuc:
      "Dễ nghi ngờ, nhiều lo toan; tình cảm dễ bị chi phối bởi ngôn từ. Nếu cảm xúc không kiểm soát tốt, có thể dễ gây hiểu lầm với người khác.",
    honNhan:
      "Dễ xảy ra cãi vã, bất đồng do lời nói. Nếu kiểm soát được cách giao tiếp thì có thể ổn định. Tránh nói lời tổn thương trong mối quan hệ.",
  },
  "98": {
    tinhCach:
      "Cứng rắn, thẳng thắn, dễ bộc lộ cảm xúc. Khí chất mạnh, dễ cáu giận, đôi khi cực đoan. Thường thắng bằng lời nói.",
    taiVan:
      "Có duyên tài từ lời nói, giao tiếp, đàm phán, thuyết phục. Tuy nhiên cũng dễ hao tài vì tranh cãi hoặc phát ngôn không đúng lúc.",
    suNghiep:
      "Thích hợp với các nghề cần giao tiếp, giảng dạy, truyền thông, diễn thuyết. Khả năng biện luận mạnh mẽ, dễ chinh phục người khác bằng lời nói.",
    nhanDuyen:
      "Quý nhân thường đến qua giao tiếp, đàm phán, hoặc qua các mối quan hệ xã hội. Tuy nhiên nếu không chế được lời nói, quý nhân có thể thành tiểu nhân.",
    sucKhoe:
      "Cần chú ý đến cổ, họng khi nói nhiều; các bệnh về miệng và phổi, đặc biệt khi làm việc liên quan đến giọng nói.",
    hocTap:
      "Có khiếu ngôn ngữ, thích học ngoại ngữ, nghệ thuật diễn đạt, văn chương. Có tài biện luận và trí nhớ từ ngữ tốt.",
    camXuc:
      "Dễ đa nghi, ghen tuông, hoặc hiểu nhầm. Có xu hướng nói nhiều và dễ vướng vào thị phi tình cảm do lời nói chưa được kiểm soát.",
    honNhan:
      "Tình cảm dễ phát sinh mâu thuẫn vì bất đồng quan điểm hoặc lời nói thiếu kiềm chế. Tuy nhiên nếu cả hai cùng trưởng thành trong giao tiếp, có thể hoà hợp bền vững.",
  },
  "46": {
    tinhCach:
      "Tính cách mạnh mẽ, bộc trực, có phần nóng nảy và dễ xảy ra mâu thuẫn. Có khuynh hướng phản biện giỏi, lý luận sắc bén, nhưng đôi lúc lời nói quá đà gây hiểu lầm. Bản mệnh thường khó kiểm soát cảm xúc khi tranh luận, dễ biến lời nói thành dao hai lưỡi.",
    taiVan:
      "Có năng lực kiếm tiền qua giao tiếp, thuyết trình, giảng dạy, thương lượng hoặc các nghề sử dụng ngôn từ. Tuy nhiên vì “tài từ miệng mà ra, hoạ cũng từ miệng mà đến”, khó tích luỹ tiền bạc lâu dài nếu vướng vào thị phi hoặc tranh cãi trong quan hệ làm ăn.",
    suNghiep:
      "Thành công khi phát huy khả năng ngôn ngữ, hùng biện, tư duy phản biện. Có thể gặt hái thành công trong truyền thông, marketing, giáo dục, luật, chính trị hoặc tư vấn. Điểm yếu là dễ mất cơ hội do phát ngôn thiếu cẩn trọng, cần trau dồi khả năng lắng nghe và kiềm chế.",
    nhanDuyen:
      "Có người hỗ trợ khi biết nói đúng thời điểm, đúng cách; quý nhân thường đến từ môi trường học thuật, nghề nghiệp hoặc truyền thông. Dễ “mất duyên” nếu nói quá đà; ít nói mà đúng lúc, đúng lời thì sẽ đắc quý nhân.",
    sucKhoe:
      "Dễ mắc các bệnh liên quan đến miệng, phế quản, thanh quản, họng, hoặc vùng ngực. Căng thẳng tinh thần cao. Cần hạn chế đồ cay nóng, giữ ấm cổ và giảm nói chuyện khi căng thẳng.",
    hocTap:
      "Có tài năng ngôn ngữ thiên bẩm, nói tốt, viết giỏi, tư duy nhanh. Nếu định hướng đúng, dễ trở thành học giả, nhà văn, nhà tư vấn hoặc giảng viên xuất sắc. Cần học cách lắng nghe và chắt lọc thông tin để tăng chiều sâu kiến thức.",
    camXuc:
      "Hay nghi ngờ, đa nghi trong chuyện tình cảm; đôi khi nói lời làm tổn thương đối phương mà không nhận ra. Nên học cách biểu đạt mềm mại, nhẹ nhàng để tránh gây căng thẳng. Có xu hướng lý trí trong tình cảm, điều này cần được cân bằng bằng sự thấu cảm.",
    honNhan:
      "Hôn nhân dễ gặp xung đột vì lời nói, tranh cãi thường xuyên nếu không kiểm soát tốt. Tuy nhiên nếu biết tiết chế và rèn luyện sự nhẫn nhịn, sẽ thành công với người bạn đời biết lắng nghe và bao dung. Tránh nói lời cay nghiệt hoặc quyết định trong lúc nóng giận.",
  },
  "64": {
    tinhCach:
      "Mềm mỏng nhưng có phần cứng đầu, hay lý luận, phản ứng nhanh trong giao tiếp, đôi khi quá sắc sảo.",
    taiVan:
      "Tài lộc đến từ lời nói, biết cách nói chuyện để thu hút cơ hội tài chính; tuy nhiên cũng dễ bị phá tài vì lời nói thiếu cẩn trọng.",
    suNghiep:
      "Giỏi nghề liên quan đến ngôn ngữ, khả năng thuyết phục tốt, thành công dựa vào năng lực nói và biểu đạt.",
    nhanDuyen:
      "Có khả năng kết nối xã hội tốt; lời nói có thể giúp xây dựng quan hệ nhưng cũng có thể làm hỏng nếu thiếu kiểm soát.",
    sucKhoe:
      "Dễ gặp vấn đề về miệng, họng, phổi, ngực và các bệnh về hệ hô hấp, đặc biệt do nói quá nhiều hoặc căng thẳng cảm xúc.",
    hocTap:
      "Có năng khiếu ngôn ngữ, học tốt qua nghe và nói, có tài năng thiên bẩm trong diễn đạt và hùng biện.",
    camXuc:
      "Giàu cảm xúc nhưng dễ bị dao động bởi lời ngon tiếng ngọt; hay nghi ngờ và mâu thuẫn trong tình cảm.",
    honNhan:
      "Mối quan hệ dễ gặp tranh cãi, khó giữ được hoà khí nếu thiếu sự thấu hiểu trong lời ăn tiếng nói, dễ có hiểu lầm do lời nói.",
  },
  "23": {
    tinhCach:
      "Tính cách cứng rắn, nói năng bộc trực, dễ xung đột. Hay tranh cãi, không kiêng nể, dễ nổi giận. Khẩu nghiệp mạnh, thường bị tai họa vì lời nói.",
    taiVan:
      "Có năng lực kiếm tiền bằng giao tiếp, ngôn ngữ. Nhưng dễ mất lộc vì lời nói không kiểm soát, hay làm ăn phá tài do không giữ kín. Tài vận bất ổn nếu không biết tiết chế khẩu khí.",
    suNghiep:
      "Có năng khiếu thuyết trình, đàm phán, giảng dạy. Tuy nhiên cần học cách điều tiết lời nói và cảm xúc, nếu không dễ bị phản ứng ngược trong môi trường chuyên nghiệp.",
    nhanDuyen:
      "Có thể gặp quý nhân từ lời nói, nhưng cũng thất bại do lời nói. Khẩu nghiệp là điểm vừa mạnh vừa yếu — cần cẩn trọng trong giao tiếp.",
    sucKhoe:
      "Dễ mắc bệnh liên quan đến miệng, thanh quản, họng, phổi, ngực, đường hô hấp. Có nguy cơ bị bệnh mãn tính nếu sống căng thẳng hoặc nói quá nhiều.",
    hocTap:
      "Trí tuệ nhanh nhạy, học giỏi ngôn ngữ, biểu đạt, truyền đạt. Rất có khiếu với nghệ thuật biểu diễn, nói chuyện, viết lách.",
    camXuc:
      "Cảm xúc nhiều chiều, nhạy cảm với lời khen chê. Dễ yêu, dễ nghi ngờ, hay suy diễn; nếu không làm chủ sẽ tự chuốc buồn phiền.",
    honNhan:
      "Tình duyên trắc trở do xung đột trong lời ăn tiếng nói. Cãi vã liên tục, dễ có những mối quan hệ thị phi, giả dối.",
  },
  "32": {
    tinhCach:
      "Cứng rắn, nóng nảy, dễ bộc phát cảm xúc. Có xu hướng tranh luận thẳng thắn quá mức, dễ xảy ra xung đột trong giao tiếp.",
    taiVan:
      "Tài lộc đến từ khả năng giao tiếp, nói chuyện, thương lượng. Tuy nhiên lời nói nếu thiếu tiết chế dễ dẫn đến phá tài, mất cơ hội.",
    suNghiep:
      "Phù hợp với công việc liên quan đến giao tiếp, giáo dục, truyền thông.",
    nhanDuyen:
      "Quý nhân đến qua quan hệ xã hội, đối thoại, nhưng cũng dễ thành tiểu nhân nếu bất hoà vì lời nói. “Miệng tài” có thể là điểm mạnh hoặc điểm yếu.",
    sucKhoe:
      "Cần đề phòng bệnh liên quan đến miệng, họng, phổi, đặc biệt là do căng thẳng và phát ngôn nhiều. Có thể mắc bệnh về hô hấp hoặc ngực.",
    hocTap:
      "Có tài năng trong học ngôn ngữ, hùng biện, văn chương. Nhanh nhạy với từ ngữ, có năng khiếu về nghệ thuật trình bày, biểu đạt.",
    camXuc:
      "Dễ dao động, nghi ngờ, ghen tuông; suy nghĩ nhiều và dễ nói ra trong tình cảm.",
    honNhan:
      "Dễ xảy ra cãi vã, bất đồng vì lời nói. Tình cảm dễ phát sinh tranh chấp, đặc biệt nếu thiếu sự kiềm chế khi tức giận hoặc ghen tuông.",
  },
};
