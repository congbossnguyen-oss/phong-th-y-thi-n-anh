// LUẬN CÁCH CỤC — 81 tổ hợp [Thiên Bàn Can, Địa Bàn Can] (9×9, không có Giáp vì Giáp luôn ẩn
// dưới Phù Đầu — đúng khớp quy ước hiện có của engine). Nguồn: tài liệu "Cấu Trúc Trận Kỳ Môn"
// trong skill Luận Kỳ Môn Độn Giáp (references/a2-cau-truc-tran-ky-mon.md). Ý nghĩa rút gọn còn
// 1 câu cốt lõi từ nguyên văn tài liệu (giữ đúng tinh thần, không suy diễn thêm).
//
// Bảng này TRÙNG với bản đã dùng trong src/pages/lap-ky-mon.astro (tab "Bảng Cách Cục") — tách
// riêng ra module này để dùng chung cho module Luận Giải Kỳ Môn Mệnh (chi tiết), tránh chép tay
// lần 2 dễ sai sót. File .astro giữ nguyên bản copy của nó (không đổi, tránh rủi ro đụng vào
// trang đã test kỹ) — chỉ code mới (luận giải chi tiết) import từ đây.
const CACH_CUC_RAW: [string, string, string, string][] = [
  ["Mậu", "Mậu", "Phục Vịnh Cách", "Nằm im, không thuận lợi, không lối thoát, việc gì cũng bị cản trở — nên bình tĩnh chờ thời."],
  ["Mậu", "Ất", "Thanh Long Hòa Hội", "Cần người hợp tác, nhiều việc tốt — cát hung tùy theo Môn."],
  ["Mậu", "Bính", "Thanh Long Phản Thủ", "Công việc đại cát đại lợi, tốt cho cầu quý nhân, công danh."],
  ["Mậu", "Đinh", "Thanh Long Diệu Minh", "Lợi cho quý nhân cầu danh, được người khác giúp đỡ."],
  ["Mậu", "Kỷ", "Quý Nhân Nhập Ngục", "Tiền bạc như chôn trong mộ, khó lấy lại — nên nằm im chờ xung Mộ."],
  ["Mậu", "Canh", "Trực Phù Phi Cung", "Không ổn định, phải thay đổi thường xuyên; làm ăn không có lời."],
  ["Mậu", "Tân", "Thanh Long Chiết Túc", "Công việc khó khăn, kỵ động — động là mất (tiền hoặc thân thể)."],
  ["Mậu", "Nhâm", "Thanh Long Nhập Thiên Lao", "Bất lợi, hao tài — tiền như rơi vào ngục, không kiểm soát được."],
  ["Mậu", "Quý", "Thanh Long Hoa Cái", "Cần nhiều người hợp tác mới thành; hôn nhân thiên về tiền bạc, vô tình."],
  ["Kỷ", "Mậu", "Khuyển Ngộ Thanh Long", "Có cơ hội, gặp quý nhân giúp đỡ — mưu cầu như ý (tùy Môn cát hung)."],
  ["Kỷ", "Ất", "Địa Hộ Phùng Tinh", "Hy vọng đã cạn, không thấy lối thoát — nên lui/ẩn, không nên tiến."],
  ["Kỷ", "Bính", "Hỏa Hội Địa Hộ", "Ân oán, công kích lẫn nhau, hai bên đều tổn thương."],
  ["Kỷ", "Đinh", "Chu Tước Nhập Mộ", "Đầu khó sau thuận — kiên trì thì việc ổn, trước chịu thiệt sau có lợi."],
  ["Kỷ", "Kỷ", "Địa Hộ Phùng Quỷ", "Việc không quang minh chính đại, hay ảo tưởng — công việc nên tạm dừng."],
  ["Kỷ", "Canh", "Hình Cách Phản Danh", "Đường không thông, gặp cản trở phải quay về — không nên chủ động."],
  ["Kỷ", "Tân", "Du Hồn Nhập Mộ", "Dễ bị tiểu nhân hãm hại, việc khó lường — cần hết sức thận trọng."],
  ["Kỷ", "Nhâm", "Địa Võng Cao Thương", "Muốn thay đổi nhưng khó thành, phải thay đổi trong bí mật; dễ gặp gian tình."],
  ["Kỷ", "Quý", "Địa Hình Huyền Vũ", "Việc do lòng tham mà ra, không tốt đẹp — dễ ốm đau, kiện tụng."],
  ["Canh", "Ất", "Thái Bạch Phùng Tinh", "Hợp tác với người nữ sẽ được giúp đỡ — nên làm khách, để người khác chủ động trước."],
  ["Canh", "Bính", "Tặc Tất Lai", "Trong hung có cát — nên chủ động làm trước thì có lợi."],
  ["Canh", "Đinh", "Đình Đình Chi Cách", "Người thứ ba xen vào chia cắt quan hệ — dễ có việc nam nữ bất chính, thị phi."],
  ["Canh", "Mậu", "Thiên Ất Phụ Cung", "Việc gì cũng hung, kỵ mở cửa hàng/hợp tác; có tiểu nhân vong ơn."],
  ["Canh", "Kỷ", "Quan Phủ Hình Cách", "Tai nạn bất ngờ, tự làm khổ mình — chủ yếu là kiện tụng, thị phi."],
  ["Canh", "Canh", "Thái Bạch Đồng Cung", "Cạnh tranh, bất hòa (đồng nghiệp/anh em) — dễ vạ miệng, liên quan chính quyền."],
  ["Canh", "Tân", "Bạch Hổ Can Cách", "Hai hổ ở chung — cần bất động, cẩn thận; kế hoạch nên hoãn lại."],
  ["Canh", "Nhâm", "Di Đãng Cách", "Muốn thay đổi mà không thay đổi được, tâm lao lực — chỉ thay đổi trong phạm vi nhỏ."],
  ["Canh", "Quý", "Đại Cách", "Thay đổi lớn, có thể đi xa lập nghiệp — nếu sinh nở thì mẹ gặp nguy (đại hung)."],
  ["Tân", "Mậu", "Khố Long Bị Thương", "Càng manh động càng bị thương, mất tiền — nên an phận, không đầu tư."],
  ["Tân", "Ất", "Bạch Hổ Xương Cuồng", "Trận dữ — người mất, nhà hư; hôn nhân dễ ly tán, bệnh nặng thêm."],
  ["Tân", "Bính", "Can Hợp Bội Thu", "Hợp tác có lộn xộn, cát hung tùy Môn — dễ có kiện tụng tiền bạc."],
  ["Tân", "Đinh", "Ngục Thần Đắc Kỳ", "May mắn — có người giúp trong sai lầm, kinh doanh lợi nhuận tăng."],
  ["Tân", "Kỷ", "Nhập Ngục Tử Hình", "Vì lòng tham mà hại bản thân — dễ bị phản chủ (nhân viên nổi loạn)."],
  ["Tân", "Canh", "Bạch Hổ Xuất Lực", "Hai hổ đã đánh nhau — nghiêm trọng; nhượng bộ hoặc trốn đi là tốt nhất."],
  ["Tân", "Tân", "Phục Vịnh Thiên Đình", "Sai lầm lặp lại, làm gì cũng không kết quả."],
  ["Tân", "Nhâm", "Hung Xà Nhập Ngục", "Tranh chấp (2 bên giành 1 việc/người) — ai động thủ trước sẽ thất thủ."],
  ["Tân", "Quý", "Thiên Lao Hoa Cái", "Giằng co trong thị phi như lưới không dứt — cần cửa môn tốt/quý nhân mới thoát."],
  ["Nhâm", "Mậu", "Tiểu Xà Hóa Long", "Có quý nhân giúp đỡ, việc trôi chảy thuận lợi; hôn nhân tốt."],
  ["Nhâm", "Ất", "Tiểu Xà Đắc Thế", "Trong lo lắng có hy vọng, mọi việc thuận lợi; công việc có bổng lộc tốt."],
  ["Nhâm", "Bính", "Thủy Xà Nhập Hỏa", "Càng làm càng hỏng, không nên làm — dễ tai nạn bất ngờ, kiện tụng."],
  ["Nhâm", "Đinh", "Can Hợp Xà Hình", "Đầu phiền phức sau có cơ hội giải quyết — tốt cho Nam, xấu cho Nữ."],
  ["Nhâm", "Kỷ", "Phản Vịnh Xà Hình", "Càng động càng rơi vào rắc rối, tranh chấp thị phi — nên tĩnh, không nên đổi."],
  ["Nhâm", "Canh", "Thái Bạch Cầm Xà", "Bao dung, hóa giải — trở ngại được tháo gỡ, kiện tụng được xử công bằng."],
  ["Nhâm", "Tân", "Đằng Xà Tương Triền", "Thị phi bám lấy mình, dễ bị lừa — tốt nhất không nên làm."],
  ["Nhâm", "Nhâm", "Thiên Ngục Tự Hình", "Loạn lạc, khó quản lý — gặp Cát Môn/Cát Tinh mới giảm bớt khó khăn."],
  ["Nhâm", "Quý", "Ấu Nữ Gian Dâm", "Nội bộ có việc xấu giấu kín, tham lam — doanh nghiệp dễ tai tiếng."],
  ["Quý", "Mậu", "Thiều Ất Hội Hợp", "Cát hung hoàn toàn tùy theo Môn."],
  ["Quý", "Ất", "Hoa Cái Phùng Tinh", "Có chí hướng nhưng không thi triển được, tài không được trọng dụng."],
  ["Quý", "Bính", "Hoa Cái Bội Sư", "Dễ gặp phiền phức, bất lợi — cần người dẫn dắt mới xoay chuyển được."],
  ["Quý", "Đinh", "Đằng Xà Yêu Kiêu", "Kiện tụng thị phi bám riết như rắn; liên quan giấy tờ, dễ hỏa hoạn."],
  ["Quý", "Kỷ", "Hoa Cái Địa Hộ", "Việc không thành, không phát triển — nên trốn tránh, lánh nạn."],
  ["Quý", "Canh", "Thái Bạch Nhập Võng", "Tự chuốc lấy khó khăn; việc tốt cũng hóa vô kết quả — không nên đầu tư."],
  ["Quý", "Tân", "Võng Cái Thiên Lao", "Trận đại xấu — không muốn ra ngoài; kiện tụng thua, bệnh thì đại hung."],
  ["Quý", "Nhâm", "Phục Kiến Đằng Xà", "Nhắc lại chuyện cũ hoặc việc khó thành hiện thực — nên tìm người hợp tác."],
  ["Quý", "Quý", "Thiên Võng Tứ Trương", "Bốn bề giăng lưới, khó động — động là gặp họa, bị Hình có nguy cơ tù tội."],
  ["Ất", "Mậu", "Âm Hại Dương Môn", "Nên làm âm thầm, không công khai — có lợi cho nữ giới hơn nam giới."],
  ["Ất", "Ất", "Nhật Kỳ Phục Vịnh", "Cần tĩnh, không nên động — không nên cầu danh cầu lợi lúc này."],
  ["Ất", "Bính", "Kỳ Nghi Thuận Toại", "Quý nhân, thông minh, mưu sự tất thành, thuận lợi cho thăng tiến."],
  ["Ất", "Đinh", "Kỳ Nghi Tương Tác", "Lợi thi cử, học hành, hợp tác — mọi việc đều tốt, riêng hôn nhân không tốt."],
  ["Ất", "Kỷ", "Nhật Kỳ Nhập Mộ", "Mông lung, không thấy hy vọng — có Khai Môn thì lật ngược thế cờ, không thì như vào mộ."],
  ["Ất", "Canh", "Nhật Kỳ Bị Hình", "Vợ chồng bất hòa, tranh giành tài sản, dễ tan cửa nát nhà (Ất=vợ, Canh=chồng)."],
  ["Ất", "Tân", "Thanh Long Đào Tẩu", "Có tốt có xấu — bệnh thuyên giảm, việc tốt hóa xấu; nữ thường lấn át nam."],
  ["Ất", "Nhâm", "Nhật Kỳ Nhập Thiên Lao", "Việc đang tốt bỗng đổi chiều, mất trật tự — dễ kiện cáo hoặc bị mưu hại."],
  ["Ất", "Quý", "Nhật Kỳ Nhập Địa Võng", "Thay đổi nhỏ vì tiền bạc — nên thoái lui, tránh là tốt nhất."],
  ["Bính", "Mậu", "Điểu Diệt Huyệt", "Đại cát đại lợi, may mắn bất ngờ (lợi hôn nhân, thăng chức, thi cử) — riêng đi máy bay thì kỵ."],
  ["Bính", "Ất", "Nhật Nguyệt Bình Hành", "Bính gây rối, Ất hòa giải nên cân bằng — có người giúp thì việc chung/riêng đều tốt."],
  ["Bính", "Bính", "Nguyệt Kỳ Bội Sư", "Lộn xộn, hao sức hao lực, mất mát; giấy tờ dễ thất lạc vô lý."],
  ["Bính", "Đinh", "Tinh Kỳ Chu Tước", "Có Đinh trị được Bính — gặp Cát Môn thì rất tốt; bệnh thì cần mổ."],
  ["Bính", "Kỷ", "Hỏa Hội Nhập Hình", "Người có tâm địa xấu, nói một đằng làm một nẻo — cát hung tùy Môn."],
  ["Bính", "Canh", "Tặc Tất Khứ", "Việc trôi đi hết (tốt lẫn xấu) — không có trộm cắp, dễ tán gia bại sản."],
  ["Bính", "Tân", "Nguyệt Kỳ Tương Hợp", "Làm ăn thành công dù đôi bên có sơ hở; bệnh không nghiêm trọng."],
  ["Bính", "Nhâm", "Hỏa Nhập Thiên Lao", "Càng chủ động càng nhiều thị phi, cãi vã — lợi cho chủ, không lợi cho khách."],
  ["Bính", "Quý", "Nguyệt Kỳ Địa Võng", "Muốn quang minh nhưng phía sau có tiểu nhân phá — cần Mậu (tiền) hoặc Đinh mới giải quyết."],
  ["Đinh", "Mậu", "Thanh Long Chuyển Quang", "Có cơ hội tốt, thăng tiến — nếu Nhập Mộ hoặc Môn Bức thì giảm bớt."],
  ["Đinh", "Ất", "Ngọc Nữ Kỳ Sinh", "Thuận lợi thi cử, thăng tiến, tài lộc — trừ hôn nhân (dễ đổi lòng)."],
  ["Đinh", "Bính", "Tinh Tùy Nguyệt Chuyển", "Người có chức quyền được thăng tiến; người thường được chút lợi lộc bất ngờ."],
  ["Đinh", "Đinh", "Tinh Kỳ Phục Vịnh", "Có hy vọng, có kỳ tích, mọi việc vui vẻ như ý — riêng hôn nhân xấu."],
  ["Đinh", "Kỷ", "Hỏa Nhập Càn Trần", "Việc hận thù, mờ ám, không giải quyết được — nguyên nhân thường do người nữ."],
  ["Đinh", "Canh", "Tinh Kỳ Thụ Trở", "Mọi việc bị cản trở, phải quay lại; tin tức không thông."],
  ["Đinh", "Tân", "Chu Tước Nhập Ngục", "Niềm hy vọng hóa sai lầm — quan chức mất chức, làm việc không đúng cương vị."],
  ["Đinh", "Nhâm", "Kỳ Nghi Tương Hợp", "Hợp tác tốt, có quý nhân giúp đỡ, kiện tụng công bằng — riêng hôn nhân không tốt."],
  ["Đinh", "Quý", "Chu Tước Đầu Giang", "Cãi vã thị phi, việc khó thành, dễ vướng kiện tụng — thi cử dễ rớt."],
];

export type CachCuc = { ten: string; yNghia: string };

const CACH_CUC = new Map<string, CachCuc>(
  CACH_CUC_RAW.map(([thien, dia, ten, yNghia]) => [`${thien}/${dia}`, { ten, yNghia }]),
);

/** Tra cách cục theo (Thiên Bàn Can, Địa Bàn Can) của 1 cung. Trả về undefined nếu là Trung
 * cung hoặc cặp can không hợp lệ (không nên xảy ra với 8 cung ngoài — bảng đã đủ 81/81 tổ hợp). */
export function traCachCuc(thienBanCan: string, diaBanCan: string): CachCuc | undefined {
  return CACH_CUC.get(`${thienBanCan}/${diaBanCan}`);
}
