/**
 * BÁT TRẠCH NHÀ — Bát Cung Xoay Chuyển (Phụ lục 4, "Bát Trạch Chân Pháp Bí Truyền"): luận cát
 * hung CHI TIẾT khi phối TỌA nhà × phương mở CỬA. Mỗi ô là 1 đoạn luận giàu chi tiết (thành viên
 * bị ảnh hưởng, năm Can Chi ứng nghiệm, biểu hiện cụ thể) — sâu hơn hẳn kết luận "cát/hung" của
 * bảng Du Niên cơ bản. Khung (Tọa × Cửa → khí + sao) đã khớp 100% bảng Du Niên chuẩn (kiểm chéo:
 * heading mỗi cung trong nguồn = đúng chuỗi 8 khí của Du Niên), nên phần này chỉ LÀM GIÀU mô tả,
 * không thay đổi kết luận cát/hung đã có.
 *
 * ⚠️ NGUỒN OCR KÉM: bản OCR của Phụ lục 4 có nhiều đoạn dính nhau, chữ rác lẫn giữa/cuối đoạn, vài
 * ô không tách được chắc chắn. Theo nguyên tắc data/00 MĐ-4 ("thiếu/không chắc → để trống, KHÔNG
 * suy diễn"): ô nào OCR đọc sạch và gán đúng (Tọa, Cửa) thì đưa nguyên văn (chỉ cắt bỏ cụm chữ rác
 * rời rạc, KHÔNG đổi nghĩa, KHÔNG thêm chữ); ô nào lộn/mờ → `null`, UI hiển thị "đang bổ sung".
 * Nguồn gốc: `bat-trach-luan-nha/nguon-goc/Ba_t_tra_ch_cha_n_pha_p_bi__truye__n_ocr.md` dòng
 * 1625-1763. Xem GHI-CHU-CAN-CHU-SITE-XEM.md.
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";

/** Luận Bát Cung Xoay Chuyển: [Tọa nhà][phương Cửa] → đoạn luận (null = OCR chưa tách sạch, đang bổ sung). */
export const BAT_CUNG_XOAY_CHUYEN: Record<CungBatTrach, Partial<Record<CungBatTrach, string | null>>> = {
  Càn: {
    Càn: "Phục vị, lão dương thân, hậu duệ nhiều, chiêu mộ người văn võ; trưởng tử có tài nhưng kiêu ngạo; tiểu thiếp có tình nhưng tính khó thuần. Khi Canh Tân đến, điền sản tằm tang thịnh vượng, nhưng phòng Chấn Tốn cao thì tai họa xảy ra liên tiếp; chỉ sợ rồng nhiều sinh nội loạn.",
    Khảm: "Lục Sát, cuồng long làm tinh, lão dương không chịu nổi khí tiết thoát; bệnh tật tổn thương, mắt sinh hoa. Kẻ hoang dâm thì nữ nhân để lại điều nhục nhã, kẻ cô độc không con kế tục. Còn có hình tàn và tự tử, như núi của cải cuối cùng hóa hư không.",
    Cấn: "Thiên y, Đế Vượng tinh và Lộc tinh chiếu rọi, nghệ thuật khéo léo, danh xưng tuyệt kỹ. Người trong đạo môn tiên khách thấu triệt huyền cơ. Trẻ nhỏ thông minh, gia cảnh khá giả, trưởng tử si dại, vận thế suy. Nam nữ sinh ra đều hiền lành, một nhà hòa khí hưng thịnh.",
    Chấn: "Ngũ quỷ cư phương Chấn; đại hỏa, ôn dịch hoành hành không thể trừ, thần quỷ vô cớ biến dị quái dị, huyết quang, bệnh tật tàn tật. Họa sự khiến huynh đệ nội chiến; phụ tử ân tình lạnh nhạt như gươm giáo. Nếu không sớm rời đến nơi đất lành, chỉ e cửa nhà sớm biến thành hoang phế.",
    Tốn: "Họa hại ẩn ở cung Tốn, bại tinh biến hung, cực kỳ bất tường. Đàn bà ghen tuông bất lương chết vì dâm dục, đứa con ngu dốt nghịch ngợm. Người hói đầu, dung mạo khó coi. Nhà tan tài sản tiêu hao như sương khói, bệnh phong thấp sớm mất mẹ, người nhà tha hương kiếm sống khổ cực.",
    Ly: "Tuyệt mệnh, hỏa khắc kim cung, hoàn toàn không thích hợp, nhất định phải rời xa. Làm giặc, nhập ngũ; mắc ôn dịch, chiêu họa rước tai, động đến quan, của cải tiêu tán. Lửa đốt, kiếm đao; người thân chịu khổ. Quả phụ làm chủ nhà, huyết quang lở loét khó chữa lành.",
    Khôn: "Diên niên, Võ Khúc tinh, danh thực chói sáng, phu thê hòa thuận đến bạc đầu, trâu bò đầy đồng, tiền tài dư dả. Trước mắt phú quý liên tiếp kéo đến, sinh con cháu đều hiền lương. Tuy nhiên tiểu phòng (chi thứ) càng đắc ý, trưởng phòng dù tốt nhưng chưa trọn vẹn.",
    Đoài: "Sinh khí cư Đoài, gặp Tham Lang, nhà rồng hài hòa, tự nhiên cát tường thịnh vượng. Hậu duệ tất chiêu mộ được con cháu thông minh. Nhưng thiếp yêu chưa chắc nương tựa được, hoa tàn xuân qua, tuổi già cô quạnh, chỉ sợ ong bướm bên tường lảng vảng.",
  },
  Khảm: {
    Khảm: "Phục vị, trung dương nam nữ bại hoại, khắc vợ, làm việc ít khi thuận lợi. Dễ mắc bệnh mà tổn hại sinh mệnh. Chỉ có con đường kinh doanh, buôn bán mới là phương hướng kiếm tài.",
    Cấn: "Ngũ quỷ cư phương Cấn, thủy thổ tương khắc ắt gặp tai họa, gia súc nhân đinh ngày một hao tổn. Quan phi, khẩu thiệt năm nào cũng tới. Lại thêm bệnh nan y khó chữa, e phải lưu vong, ra đi không trở lại. Tài sản chẳng khác nào nước sôi dội tuyết; con trẻ bôn ba.",
    Chấn: "Thiên y ẩn tại cung Chấn; nước về đông, danh tự tỏa sáng. Các con vinh hoa, ai cũng ngưỡng mộ. Trưởng phòng phú quý vượt bậc. Gặp Quý Nhâm, tài nguyên dồi dào; đến Dần Mão, hỷ khí rực rỡ. Cửa nhà từ đây hưng thịnh huy hoàng.",
    Tốn: "Sinh khí, bảo vật kỳ trân, trăm năm làm rạng rỡ gia môn thành đạt, thứ tử mai sau cũng hiển vinh. Gia thế mở rộng, tràn ngập quý khí, như mưa nhuần thấm nhuệ văn chương.",
    Ly: "Diên niên, hợp hôn nhân vốn tự nhiên. Mai rùa keo loan cần giữ để nối dây đàn đứt. Nhưng nếu hỏa bùng thủy yếu thì họa nạn khó thoát, mất máu, nhục nhã, bệnh tật kéo dài, khổ tù lao ngục. Nếu xây phòng ốc cao lớn thêm, e nữ nhân lấn quyền khiến gia đạo suy vong.",
    Khôn: "Tuyệt mệnh lại cư Khôn; tổn thương long mạch, phạm đến tôn trưởng. Kẻ câm điếc, ngây dại, suốt ngày im lặng, như say như mê, mắt mờ mịt. Nhân đinh hao tổn, tài sản tiêu tan; nhảy giếng, trầm sông. Nhất định phải rời bỏ quê hương, chỉ để lại cỏ hoang phủ đầy sân vườn.",
    Đoài: "Họa hại cư Đoài, người thuộc thủy kim tính cách không tốt. Cây liễu non, lưỡi chim oanh khéo léo, vườn thơm vô ích, chỉ làm bướm ong lao xao. Gia sản từ đây dần hao hụt, con trẻ bị thương tật.",
    Càn: "Lục sát lại cư Càn, nguyên khí tiết hao, dương khí chẳng đủ. Bệnh tật liên miên, không ngày tốt. Tiền tài tiêu tán, ai còn thương xót? Tuổi già phóng đãng, thật hổ thẹn. Cả đời trôi dạt, không nơi cố định, chẳng khác gì miếu thờ bỏ hoang chỉ còn trụ gỗ chỏng chơ.",
  },
  Cấn: {
    Cấn: "Phục vị, thiếu dương; tài lợi bình hòa, nhân khẩu an nhàn. Trong khuê phòng như ngọc đẹp nhưng chưa được xem như trân châu quý. Duyên với đạo, hóa thành hư ảo, bố thí tiền tài, tâm hướng thiện. Cuối cùng do tuổi trẻ ít từng trải, con người khi sa sút sẽ chịu cô đơn.",
    Chấn: "Lục sát lại cư Chấn, xung khắc lẫn nhau; hư tổn âm đạo, khí huyết suy kiệt, thai triền miên. Nhân đinh nguy họa khó dương khí tích tụ, bệnh hiểm như giọt sương trên lá sen; tài sản lung lay như lá theo gió đông tây.",
    Tốn: "Tuyệt mệnh; thổ ít, khó chống lại thủy thổ xâm nhập. Gân cốt, bàn tay, thân thể đau nhức; chân mỏi mệt, bệnh tật rên siết. Năm gặp Mậu Kỷ họa còn nhẹ, đến vận Đinh Nhâm tai ương càng sâu. Nữ nhân chịu nhiều bất lợi, da vàng, gầy ốm, khổ não khó tránh.",
    Ly: "Họa hại; âm khí thịnh vượng lộng quyền; tính gian xảo khó đoán. Ba mùa xuân đã phí vì hoa rượu, con trai chẳng biết bao giờ mới sinh. Nếu xây nhà thêm cửa cao lớn, người và tài sản dần suy tàn.",
    Khôn: "Sinh khí, nhị thổ tương hòa, tính tình tốt đẹp. Mẫu tử đồng tâm; điền sản thịnh vượng, trâu bò đầy đàn, gia hộ giàu có. Ngọc chi lan dù sinh muộn nhưng vẫn tốt, yêu thương bền lâu. Kính Phật thờ thần là điều tốt, nhưng bản tính keo kiệt cũng không phải chuyện lạ.",
    Đoài: "Diên niên, hôn phối cân xứng, mọi việc hoàn chỉnh. Gia súc nhiều, còn có ruộng đất rộng lớn. Trưởng nam sinh muộn, con nối dõi ít, nhưng con gái út lại lấy chồng sang quý. Người trẻ tuổi tính nóng, cửa phòng dễ phát sinh tranh cãi.",
    Càn: "Thiên y, tuy tương sinh nhưng kết hợp không hoàn hảo. Điền sản vượng nhưng nhân khẩu khó tránh bệnh tật, mụn nhọt, thương tổn không ngày khỏi, trẻ nhỏ khó nuôi. Đến các năm Bính Đinh có nhiều tin vui, trăm năm vạn sự chớ để lỡ làng.",
    Khảm: "Ngũ quỷ cư Khảm; xung khắc lẫn nhau, không hợp lý. Nam nữ đều gặp tai họa, bệnh tật; gia trạch ồn ào, thị phi không dứt. Hại người, tổn thất gia súc không ngày yên; rời bỏ quê hương là điều tất yếu. Khi nước lên đột ngột chớ vội lội qua, kẻo bị chìm đắm, hối hận đã muộn.",
  },
  Chấn: {
    Chấn: "Phục vị chính tọa phương Đông, tính Mộc mềm yếu. Tài sản nhiều đều là quý dị, nhưng con cháu tuy có lại bị điếc câm. Tổ tiên phúc đức có thể che chở, nhưng vinh hoa một thế hệ rồi hư không. Nếu phòng Tây Nam, Tây Bắc rộng lớn, trưởng nam kiêu ngạo, chắc rời tổ tiên.",
    Tốn: "Diên niên tại Tốn, vợ chồng hòa thuận nhưng nữ nhân lấn át. Tài sản tích lũy nhiều trong kho. Sống chung dễ ghen ghét, khó hòa hợp, mỗi người lập riêng. Về sau tuy có người xuất thân nhưng lớn lên bất hiếu, chỉ e phúc phận chẳng kéo dài.",
    Ly: "Sinh khí, nữ cầm quyền quản gia. Tự kiêu tự mãn, tính tình gian xảo, chung đụng với thân thích thường sinh mâu thuẫn. Giấc mộng gấu (sinh trai) suốt nửa đời không có, trải bao năm chỉ thấy sinh con gái.",
    Khôn: "Họa hại tại Khôn đứng đầu; bệnh tật không biết bao giờ mới yên. Mẹ con tranh chấp vì tài sản, mẹ chồng nàng dâu bất hòa; tài sản trôi theo dòng nước, ăn uống khó khăn, bệnh tật tại gan. Nhân khẩu thưa thớt, làm ăn ế ẩm, năm rét mướt chịu cảnh đói lạnh.",
    Đoài: "Tuyệt mệnh, kim mộc xung khắc không ngừng; chân co quắp biết khi nào mới lành? Phổi gan ho ra máu bao giờ khỏi? Âm nhân dựa góa phụ, quan phi liên tục, quỷ trong nhà sinh yêu quái. Người trong nhà ngoài nhà đều tổn hại, tài sản cũng theo nước trôi đi hết.",
    Càn: "Ngũ quỷ lập tại Càn; gia chủ chịu trọng bệnh, gió ác làm bệnh nặng thêm. Ruộng vườn khắp nơi hoang phế, cha con bất hòa. Kiện tụng bủa vây, người nhà ly tán, hỏa hoạn trộm cắp nối tiếp, gia cảnh ngày càng trống rỗng. Uất khí không giải, đến mức tự tử, sớm dời nhà may ra tránh được họa.",
    Khảm: "Thiên y, Mộc gặp trung dương, may còn có thành tựu. Nhưng lo rằng Mộc sợ Thổ khắc, e chiêu lấy tật điếc câm, sinh họa nhảy giếng. Phương Đông quan trọng, vẫn tốt lành, nhưng phương Tây Bắc lớn thì không hiển vinh. Dù ban đầu thuận lợi, sau mười năm thấy cảnh tàn lụi.",
    Cấn: "Lục sát hiện cư Cấn, trẻ lớn tranh đấu, sự tình mờ mịt. Dù có trai tráng mạnh mẽ, bệnh tật vẫn liên miên. Dù có sinh con, nuôi dưỡng lại khó thành. Từ đó tài sản tiêu tán hết, trăm năm gia môn không ai gánh vác.",
  },
  Tốn: {
    Tốn: "Phục vị, tính thông minh, Mộc Hỏa phương Đông Nam sinh vượng khí. Kho lúa bội thu, tài phú dồi dào, con trai giỏi giang, cưỡi ngựa làm bậc hào, đai vàng, ít người hèn kém. Nhưng lo rằng tiểu phòng mệnh mỏng, tổn hại suy vong, khó bề hiển đạt.",
    Ly: "Thiên y, Mộc Hỏa giao hòa, tuổi thọ dài lâu. Hoa lạ ngoài hiên tươi tốt. Cánh đồng dâu, ruộng lúa nối dài, tiền tài chồng chất. Chỉ e dương khí yếu, âm khí quá thịnh, lâu dài thì cô độc, ít con cháu.",
    Khôn: "Ngũ quỷ cư Khôn vị, mẹ già quanh năm bệnh tật không lành. Quỷ mị thỉnh thoảng tác oai, tâm trí chẳng ngày nào yên. Phụng dưỡng mẹ chồng không gặp hiền phụ, muốn nuôi dưỡng phải bán ruộng vườn.",
    Đoài: "Lục sát cư Đoài, ứng vào thai vận, huyết độc, ghẻ lở làm tổn hại thai nhi. Giai nhân khuynh thành có nhan sắc, nhưng đứng trước cửa lại chẳng có người cầu thân. Bị sỉ nhục, ô danh. Kẻ tự tử nhảy sông, lại gặp hỏa tai.",
    Càn: "Họa hại cư Càn, Kim đến Đông Nam gặp Hỏa khô hạn. Cây cối khô héo, khó bề tươi tốt. Gân cốt đau nhức, tinh thần suy kiệt. Lão dương không phục, dễ sinh bệnh hư hao. Phụ nữ vô cớ gặp tai họa; vợ lẽ vợ chính đều chẳng yên.",
    Khảm: "Sinh khí cư Khảm; cửa nhà trùng trùng đón phúc lành. Vợ chồng hòa hợp, âm nhạc vang vọng. Con cháu làm quan, tiền đồ sáng lạn. Đời đời phú quý, cửa nhà hưng thịnh, an vui tràn ngập ơn trời ban.",
    Cấn: "Tuyệt mệnh cư Cấn, xung khắc mạnh, sớm mắc chứng suy nhược. Mầm lan không chịu nổi sương, nụ hoa chẳng thể đứng vững trước gió mưa. Không có của cải tích trữ, nhân đinh suy kiệt, khiến người chỉ biết ngửa mặt than trời.",
    Chấn: "Diên niên, cát tường, hai tính tương đồng như hòa hợp của Tần Tấn. Xuân về, cá hóa rồng, thu sang hươu cất tiếng ca. Chỉ vì đời trước tích lũy âm công nên mưa móc trời ban ơn. Dù không mong cầu quý, nhưng phú quý vẫn tự đến.",
  },
  Ly: {
    Ly: "Phục vị chính trung âm, lửa mạnh bùng nhưng yếu ớt, thân thể vì thủy khắc mà mắc bệnh xuất huyết. Phượng hoàng lẻ đôi, uyên ương khó có thể cùng bay. Ban đầu chắc chắn gặp trắc trở, nhưng về sau tích lũy đủ đầy, vàng tiền đầy nhà.",
    Khôn: "Lục sát cư Khôn, nam nữ nhiều chuyện không thể nói. Buông thả tất tổn hại thân thể, hoang dâm cuối cùng hủy hoại gia môn. Tiền bạc dù vạn quan rồi con cháu vẫn thưa thớt, vận thế chẳng hanh thông. Đất gặp hỏa, sinh sản ít, trước mắt cỏ dại mọc đầy ruộng vườn.",
    Đoài: "Ngũ quỷ du phương Đoài, thiếu nữ mỹ lệ nhưng thực đáng lo. Sợ rằng tà ma quấy nhiễu, lại e ghẻ lở, độc bệnh kéo dài. Nhan sắc bạc phận, sa chân rơi giếng. Dây trắng vắt ngang xà nhà, tự treo cổ; hồn chiếu lên gò hoang lạnh lẽo.",
    Càn: "Tuyệt mệnh nương Càn dương, lửa lò nung, kim chẳng lành. Ho kéo dài không dứt, phổi nóng, bại liệt, ghẻ lở, gân cốt hư hao. Gia chủ tuổi già mất sớm, phụ nữ trung niên phải thủ phòng đơn. Chỉ e quan phi không tránh khỏi, người nhà chia lìa xót xa đoạn trường.",
    Khảm: "Diên niên, dù xung khắc vẫn có thể kết hợp. Mưa đêm rơi lả tả lên tán cây, gió xuân thổi rụng đóa song liên. Trưởng phòng ổn định, gia cảnh hưng thịnh. Nhân khẩu, tài lộc nhiều cát lợi, nhưng hiển đạt vinh quang lại không trọn vẹn.",
    Cấn: "Họa hại tọa tại Cấn, con út quanh năm không khỏi bệnh. Tiếc lan huệ không có đất, chỉ thương miếu thành hư nát. Rượu hoa tiêu phí, tài sản hao, hỏa hoạn giáng xuống, cỏ tranh cháy rụi. Người thân ly tán, khó bề tụ họp, ruộng vườn ba lối hóa hoang vu.",
    Chấn: "Sinh khí tọa Chấn Đông, Mộc Hỏa sáng rực, cảnh tượng mới mẻ. Tài trí xuất chúng, có thể sánh bậc anh hùng, phú quý như Phạm Lãi, sang như Chu Đán. Cao như phượng hoàng bay lượn. Sự nghiệp từ đây ngày một hanh thông, trưởng phòng hưng thịnh, vinh hiển vô song.",
    Tốn: "Thiên y, tài lộc cuối cùng quy về trưởng nam. Gốc rễ cứng cáp vững chãi, tơ tằm kéo mãi, người người ngưỡng mộ tài đức. Nhưng trong nhà nữ nhân lại ghen ghét lẫn nhau, kẻ nắm quyền có tính thiên vị. Đong lúa không cho chung cối, ai nấy tự nhóm lửa nấu cơm riêng.",
  },
  Khôn: {
    Khôn: "Phục vị, lão âm sinh, con cái về sau mới thành danh. Gia đình khéo léo, thiếu nam thường có chí tiến thủ. Bãi cỏ xanh bạt ngàn, gia súc sinh sôi mạnh mẽ, ruộng đồng màu mỡ, phú quý an nhàn. Nhưng Mẹ quá lớn, trưởng tử nhiều chuyện, dễ sinh tranh chấp vô ích.",
    Đoài: "Thiên y tọa Đoài, Kim Mộc tương sinh, gia đạo hòa. Con út chắc chắn có của cải dư dả, nhưng e anh em oán hận nhau. Ruộng dâu xanh mướt như biển mây, trâu ngựa tụ hội như đàn kiến. Chỉ tiếc con gái yêu quý như hoa nhưng chẳng thể kết trái, uổng phí xuân thì.",
    Càn: "Diên niên, đại cát; cung tinh tương hợp, không có tai họa. Vợ chồng già cùng bạc đầu. Con cháu sinh ra không nhiều, nhưng tiền bạc tích lũy không thất thoát. Chỉ lo trưởng phòng ít nhân đinh, trong khi chi thứ lại không có tổn thất gì.",
    Khảm: null,
    Cấn: "Sinh khí, nhị thổ tương hòa, tính tình bình ổn. Điền sản thu về không có hạn hán, kho lẫm chất đầy, của cải phong phú. Gia môn không còn bài ca chia ly, tình thân không bị chia rẽ. Anh em chẳng mang mối hận Ngô Việt, nhìn nhau vẫn là tình thân.",
    Chấn: "Họa hại nhập Chấn, mẹ già bị khắc chế, phạm tổn thương. Của cải tiêu tán do cờ bạc, thân thể hao mòn vì dâm dục. Người thân không có lòng hiếu thảo, em út thì nhọc nhằn kiếm tiền. Tính kiêu ngạo cuối thành vô ích, miệng lưỡi đàn bà khó bề ngăn chặn.",
    Tốn: "Ngũ quỷ nhập Tốn, tai họa bệnh tật liên miên. Quan phi, hỏa hoạn dữ dội. Âm nhân bệnh tật, quỷ khí ám ảnh, nhà cửa tiền bạc như trôi trên nước. Nếu không sớm rời đi, hai năm liên tiếp có tang sự.",
    Ly: "Lục sát, Hỏa Thổ gặp nhau, họa hại khôn lường. Đất khô cằn không sinh được nước lớn, cây cối khô héo, khó mong cháu đích tôn. Tiêu tán tài sản, hao tổn gia nghiệp, không có đường cứu vãn. Lao lực quá độ, bệnh của nữ nhân khó chữa lành. Muốn yên tốt nhất nên tìm nơi khác an cư.",
  },
  Đoài: {
    Đoài: "Phục vị chính tọa phương Tây, nữ nhân trong gia đình mọi việc đều lo liệu ổn thỏa. Trẻ lớn thường tranh giành, tâm tư bất định; mẹ chồng nàng dâu giỏi giang nhưng cuối cùng còn dang dở. Chỉ e xuân sắc chóng phai, bình yên chưa lâu lại gặp trắc trở.",
    Càn: "Sinh khí tại Càn, gia chủ tuổi cao, quyền lực trong tay. Tích lũy lâu dài tạo nên phú hộ, nhưng thiếp yêu mới lại dễ làm tổn thọ. Âm nhân tranh giành, dạ ghen tuông, người già điếc, bệnh tật quấn thân. Phú quý quá mức cũng sinh tai họa.",
    Khảm: "Họa hại; thủy dễ có tính gian trá. Đào hầm xuyên tường, trong nhà tai ngãng nghễnh, tuổi già bệnh tật triền miên. Ruộng vườn, gia tài trong chốc lát tiêu tan. Không đề phòng thì tai họa từ trên trời giáng xuống, người ta chỉ biết có dao giấu trong bóng tối.",
    Cấn: "Diên niên, vợ chồng hòa thuận, nhân khẩu ít nhưng hiền. Tóc điểm bạc mà vẫn ngủ đêm phóng túng làm tổn khí lực, ngày đêm xa hoa hao tổn tiền tài. Chỉ e mầm lan khó nuôi dưỡng, minh châu không biết bao giờ mới vào tay.",
    Chấn: "Tuyệt mệnh nhập phương Đông Chấn, Mộc bị Kim khắc, vô tình tàn nhẫn. Nơi vùng đầm lầy, tài sản còn lại, cửa nhà suy bại, tổn hại hậu nhân. Chỉ e anh em phân tán, đói kém rét mướt như đống xương khô. Nam nữ trong nhà đều bất thuận, như nước với lửa chẳng thể dung hòa.",
    Tốn: "Sát khí (Lục sát) gặp Tốn, khắc phạt mạnh, làm ăn suy kiệt. Trưởng tử chẳng thể kế nghiệp cha; có vợ mà chẳng thể phụng dưỡng mẹ chồng. Bệnh lao tổn hao khí huyết, tiền bạc chẳng còn lại chút nào. Nếu không rời đi sớm, tai họa nối tiếp không dứt.",
    Ly: "Ngũ quỷ cư Ly, khắc ngoại sinh hung, tai họa nặng. Bệnh quỷ kéo dài, thần trí hỗn loạn, hỏa hoạn thường xuyên, lửa cháy rực trời. Âm nhân tuyệt diệt, linh khí hao tán, nam nhân cô độc như bèo trôi dạt. Quan phi kiện tụng khó bề tránh né, nhà cửa tiêu điều.",
    Khôn: "Thiên y chiếu, trẻ nhỏ sinh lý gia tài, phú quý bền lâu; nhưng âm nhân hành động quỷ dị. Phượng loan đến bên mặt trời, nhưng lân thú lại sinh muộn. Con út tích lũy riêng tư nhiều, khi về già mẹ lại quá nhân hậu.",
  },
};

/** Lấy đoạn luận Bát Cung Xoay Chuyển cho (Tọa nhà, phương Cửa). null = OCR chưa tách sạch (đang bổ sung). */
export function luanBatCungXoayChuyen(toaCung: CungBatTrach, cuaCung: CungBatTrach): string | null {
  return BAT_CUNG_XOAY_CHUYEN[toaCung]?.[cuaCung] ?? null;
}
