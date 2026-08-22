# QUESTION LIBRARY SEED — danh sách câu hỏi khởi điểm

Đây là **nội dung đề xuất** (không phải kiến trúc kỹ thuật) cho Question Library — danh sách câu hỏi thật, cụ thể, xoay quanh các mặt trong cuộc sống 1 người, để Thầy duyệt/sửa/thêm bớt trước khi đưa vào `questions` (xem `DATABASE_SCHEMA.md`). Mỗi dòng dưới đây tương ứng 1 `question_definition.title` tương lai (chưa viết đủ schema — đó là việc của Phase 2, xem mẫu ở `QUESTION_SCHEMA.md`).

**Ý tưởng đằng sau danh sách này:** không phải 18 nhóm chỉ để phân loại rời rạc — mà là 18 mặt của cùng 1 cuộc đời. Một người dùng quay lại hỏi nhiều câu hỏi qua thời gian (sự nghiệp, tình duyên, tài chính...) sẽ dần tích lũy thành 1 bức tranh khá đầy đủ về hoàn cảnh của họ — đây chính là chất liệu để sau này (không phải Phase 1) có thể tổng hợp thành 1 "chiến lược tổng thể" cho từng người, dựa trên `user_history` đã có trong `DATABASE_SCHEMA.md`. Phase 1 chưa xây tính năng tổng hợp này — chỉ ghi nhận ý tưởng ở đây để không quên.

## 1. Sự nghiệp

- Có nên chuyển việc không?
- Con đường sự nghiệp hiện tại có phù hợp lâu dài không?
- Có nên nhận lời làm quản lý/lên chức không?
- Năm nay có nên chủ động xin thăng tiến không?
- Có nên chuyển hẳn sang một ngành nghề khác không?

## 2. Công việc

- Có nên nhận dự án/nhiệm vụ này không?
- Có nên nghỉ việc ngay bây giờ không?
- Mâu thuẫn với sếp/đồng nghiệp hiện tại nên xử lý thế nào?
- Có nên lên tiếng phản đối một quyết định ở công ty không?

## 3. Kinh doanh

- Có nên khởi nghiệp/mở cửa hàng-công ty riêng không?
- Có nên mở rộng quy mô kinh doanh lúc này không?
- Có nên dừng/đóng một mảng kinh doanh đang lỗ không?
- Hướng đi kinh doanh nào phù hợp với mình lúc này?

## 4. Tài chính

- Tình hình tài chính năm nay nhìn chung ra sao?
- Nên tiết kiệm hay nên chi tiêu mạnh tay lúc này?
- Có nên mua bảo hiểm/mua sắm lớn vào lúc này không?

## 5. Đầu tư

- Có nên đầu tư vào lĩnh vực đang cân nhắc lúc này không?
- Nên rót vốn ngay hay chờ thêm thời gian?
- Có nên rút vốn khỏi một khoản đầu tư đang có không?

## 6. Bất động sản

- Có nên mua nhà/đất lúc này không?
- Có nên bán căn nhà đang ở/đang cho thuê không?
- Thời điểm này có nên xây/sửa nhà không?

## 7. Hợp tác

- Có nên hợp tác làm ăn với người này không?
- Mối hợp tác hiện tại có nên tiếp tục không?
- Có nên chấm dứt hợp tác với đối tác hiện tại không?

## 8. Vay / cho vay

- Có nên vay tiền để đầu tư/kinh doanh lúc này không?
- Có nên cho người khác vay tiền không?
- Thời điểm này vay ngân hàng/vay nóng có ổn không?

## 9. Đòi nợ

- Khoản nợ này có đòi lại được không?
- Nên đòi nợ vào thời điểm nào, cách nào?
- Có nên thỏa hiệp/giãn nợ cho người vay không?

## 10. Tình duyên

- Người này có phải duyên phận phù hợp với mình không?
- Có nên tiếp tục theo đuổi mối quan hệ này không?
- Khi nào là thời điểm thuận lợi để mở lòng yêu đương?

## 11. Hôn nhân

- Có nên cưới người này không?
- Hôn nhân hiện tại có nên cố gắng hàn gắn hay nên buông không?
- Thời điểm này có phù hợp để tính chuyện cưới xin không?

## 12. Thi cử

- Kỳ thi sắp tới có thuận lợi không?
- Có nên thi lại/học thêm bằng cấp khác không?
- Nên chọn ngành/trường nào phù hợp với mình?

## 13. Thi đấu / cạnh tranh

- Cuộc thi/trận đấu/vòng phỏng vấn sắp tới có thuận lợi không?
- Có nên tham gia cuộc thi/đấu thầu/ứng tuyển này không?

## 14. Kiện tụng / tranh chấp

- Có nên khởi kiện không?
- Vụ tranh chấp này nên hòa giải hay theo đến cùng?

## 15. Sức khỏe

- Sức khỏe dạo này có điều gì cần lưu ý không?
- Có nên đi khám tổng quát vào lúc này không?
- Người thân đang bệnh, nên yên tâm hay cần lo lắng thêm?

## 16. Xuất hành

- Chuyến đi sắp tới (công tác/du lịch) có thuận lợi không?
- Có nên đi xa dài ngày (định cư/làm việc nơi khác) lúc này không?

## 17. Chọn ngày giờ

_(Nhóm này không đi qua Kinh Dịch — dùng thẳng `trachnhat-engine` đã có sẵn, xem `ENGINE_INTEGRATION.md` §5. Danh sách câu hỏi lấy từ các công cụ Đại Cát Lợi hiện có: chọn ngày khai trương, chọn ngày ký hợp đồng, chọn ngày cưới hỏi, chọn ngày nhập trạch/chuyển nhà, chọn ngày giờ xuất hành, chọn ngày sửa nhà...)_

## 18. Quyết định A/B/C

- Nên chọn phương án nào trong số các lựa chọn đang cân nhắc? (câu hỏi dạng mở, người dùng tự nhập các phương án của mình mỗi lần hỏi — không có danh sách cố định)

---

## Ghi chú cho Thầy

- Đây là bản nháp đầu tiên, mỗi nhóm 2-5 câu — đủ để bắt đầu Phase 2 thí điểm (category Sự nghiệp), KHÔNG cần đầy đủ hết mọi nhóm ngay từ đầu.
- Một số câu có thể trùng ý ở nhiều nhóm (vd "có nên chuyển việc" vừa là Sự nghiệp vừa chạm Tài chính) — không sao, Question Flow sẽ hỏi thêm chi tiết để làm rõ hướng luận, không cần Question Library phân loại hoàn hảo 100%.
- Nhóm nào Thầy thấy chưa đúng tinh thần "1 ông cố vấn cho người bình thường" (quá học thuật, hoặc quá hiếm gặp) thì cắt bớt — đây là bản đề xuất, không phải quyết định cuối.
