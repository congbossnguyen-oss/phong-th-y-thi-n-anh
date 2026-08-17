---
name: luan-so-dien-thoai
description: Dùng skill này khi Công muốn luận giải một số điện thoại cụ thể — kích hoạt khi Công đưa lên 1 số điện thoại và hỏi "luận số này giúp tôi", "số điện thoại này tốt xấu thế nào", "xem số đt cho khách", "số này có hợp không", "phân tích số đuôi này", hoặc đưa số điện thoại kèm ngày sinh/CCCD muốn đối chiếu. Cũng LUÔN kích hoạt ngay khi Công gõ lệnh tắt "/luận-sđt", "/luan-sdt", hoặc "/luansdt" kèm theo 1 số điện thoại (không cần thêm câu mô tả) — coi đây là cách gọi nhanh tương đương với yêu cầu luận số điện thoại đầy đủ. LUÔN dùng skill này thay vì tự luận theo kiến thức phong thủy số chung chung — skill chứa quy trình 8 bước và bảng dữ liệu riêng (Bát tinh 4 cấp độ, ngũ hành Hậu Thiên, công thức hóa giải từng hung tinh, 10 nhóm từ trường điểm xâm nhập, mốc đại vận theo tuổi) đúc kết từ tài liệu mà Công đã cung cấp, không có sẵn trong kiến thức nền của Claude. Nếu Công chỉ đưa số điện thoại mà không kèm CCCD/ngày sinh/giới tính, vẫn cứ luận bình thường theo các bước không cần Tiên Thiên — chỉ khi Công cung cấp đủ thì luận chi tiết hơn ở bước đối chiếu Tiên Thiên–Hậu Thiên.
---

# Luận Số Điện Thoại

Skill này luận giải số điện thoại theo đúng phương pháp trong các tài liệu Công đã cung cấp — KHÔNG dùng kiến thức phong thủy số chung chung có sẵn trong trí nhớ nền. Nguồn gồm: "Bát Cực Linh Số — Số Tự Năng Lượng Học" (299 trang, thầy Thẩm Lập Minh) và "Sim Nói Gì Về Bạn" (App Phương Đông Huyền Bí). Nếu tài liệu không đề cập một trường hợp cụ thể đang gặp, phải nói rõ "tài liệu chưa đề cập trường hợp này" thay vì tự suy diễn thêm.

**Giới hạn đã biết:** tài liệu nguồn còn một phần rất lớn (Chương 2 sách "Sim Nói Gì Về Bạn" — luận chi tiết riêng từng cặp trong số 64 cặp Bát tinh theo Tính cách/Tài vận/Sự nghiệp/Nhân duyên/Sức khỏe/Học tập/Cảm xúc/Hôn nhân) **chưa được số hóa vào skill này** do dung lượng quá lớn — hiện skill chỉ dùng dữ liệu tổng quát theo TỪNG TỔ Bát tinh (không phải riêng từng cặp số). Nếu Công muốn nâng cấp độ chi tiết này, cần yêu cầu riêng để bổ sung dần theo từng nhóm cặp số.

## Phạm vi & giới hạn (đọc trước khi luận)

- Skill này **không luận theo Kinh Dịch/64 quẻ** — theo yêu cầu của Công, phần này đã loại bỏ hoàn toàn khỏi quy trình, kể cả khi tài liệu nguồn có đề cập.
- Skill này **không luận Âm Dương** của số điện thoại (số 0=âm, số lẻ=dương...) — theo yêu cầu của Công, phần này cũng đã loại bỏ.
- Với các cặp/tổ hợp số không có trong bảng dữ liệu ở `references/`, nói rõ "tổ hợp này chưa có trong dữ liệu đã tổng hợp" thay vì đoán ngũ hành/Bát tinh theo suy luận riêng.

## Bước 0 — Kiểm tra input

Bắt buộc phải có: **số điện thoại cần luận**.

Các thông tin sau là **tùy chọn**, giúp luận chi tiết và chính xác hơn nhưng KHÔNG bắt buộc — nếu Công không cung cấp, cứ luận bình thường theo Bước 1–8 (bỏ qua phần đối chiếu Tiên Thiên ở Bước 4 và phần cá nhân hóa theo giới tính ở Bước 7):
- Ngày sinh hoặc số CCCD của người sở hữu số (Tiên Thiên mệnh cách)
- Giới tính người sở hữu số
- Trọng tâm câu hỏi (tổng quát / tài lộc / hôn nhân / sự nghiệp / sức khỏe / học hành...) — nếu không nói rõ, mặc định luận tổng quát theo cả 10 nhóm ở Bước 6 nhưng nhấn mạnh vắn tắt, không đào sâu hết cả 10.

Chỉ hỏi lại Công phần còn thiếu nếu Công yêu cầu luận sâu (vd "luận kỹ giúp tôi", "xem có hợp mệnh không") mà chưa có Tiên Thiên/giới tính — không hỏi lại nếu Công chỉ muốn xem nhanh.

## Bước 1 — Chuẩn hóa & tách số

Đọc `references/bang-tra-bat-tinh.md` mục 4. Tách dãy số điện thoại thành các cặp số liền kề, chồng lấn theo **phương pháp 2 lớp**: (1) xác định cặp Bát tinh gốc bằng cách bỏ qua số 0 và số 5, ghép với con số tiếp theo; (2) sau đó mới xét hiệu ứng riêng của số 0/5 lên cặp gốc đó ở Bước 2.

## Bước 2 — Đối chiếu Bát Tinh

Đọc `references/bang-tra-bat-tinh.md` mục 2–3. Tra từng cặp gốc vào bảng 4 Cát Tinh / 4 Hung Tinh (ghi rõ luôn cấp độ 1–4, và theo mục 4d nói rõ đây là "động số" cấp 1-2 (đã thành hiện thực) hay "tĩnh số" cấp 3-4 (mới là ý tưởng/tiềm năng)). Đối chiếu thêm các tổ hợp 3 chữ số "tăng cường" gây họa cụ thể ở mục 5 cùng file.

**Bắt buộc luận theo từng bộ 3 số liên tiếp trên TOÀN DÃY (không chỉ ở đuôi):** với mỗi bộ 3 số liền kề (abc, bcd, cde...), xác định 2 cặp gốc chồng lấn bên trong nó (ab và bc), tra Bát tinh từng cặp, rồi **ghép nghĩa cặp trái + cặp phải thành 1 câu diễn giải liền mạch** theo đúng nguyên tắc trái-phải ở `references/10-nhom-tu-truong.md` mục "Nguyên tắc đọc vị trí trái-phải". Ví dụ mẫu: "986" = 98 (Họa Hại — lời nói/khẩu) + 86 (Thiên Y — tài) → diễn giải "dùng lời nói để sinh tiền tài, nhân duyên, khẩu tài". Không chỉ liệt kê tên tinh + cấp độ rời rạc từng cặp — phải viết thành câu diễn giải ý nghĩa thực tế cho từng bộ 3 số, trình bày nối tiếp từ đầu dãy đến cuối dãy. **Nếu bộ 3 số có chứa số 0 hoặc số 5** (không tách được gọn thành 2 cặp trái-phải độc lập), dùng lại kết quả đã phân tích ở mục 4b cho vị trí đó thay vì ép ghép cặp — không tạo diễn giải trái-phải giả tạo cho trường hợp này.

**Bắt buộc áp dụng mục 4b (hiệu ứng số 5 và số 0)** — hai chữ số này đi theo hai cơ chế khác nhau, không dùng chung công thức:

- **Số 0**: xác định nó đứng trước / giữa / ngay sau cặp gốc nào, rồi nêu hiệu ứng tương ứng (giữ nguyên / ẩn ngầm / mất hẳn).
- **Số 5**: xem chữ số đứng **ngay trước** nó là số mấy — số 5 lặp lại chữ số đó thành một cặp Phục Vị. Phục Vị ấy đứng ngay sau một cặp thì **kích phát** cặp đó, nằm giữa một cặp thì **kéo dài** cặp đó. Số 5 không bao giờ tác động lên cặp nằm bên phải nó; số 5 ở đầu dãy thì không liên quan cặp nào. (Chủ dự án chốt 2026-08-17 — xem khối cảnh báo trong `bang-tra-bat-tinh.md` mục 4b.)

Đặc biệt cảnh báo mạnh khi số 5 hoặc số 0 làm mạnh thêm một hung tinh.

**Kiểm tra thêm mục 4e** (cát tinh cần đa dạng; hung tinh có thể được cát tinh đứng bên phải hóa giải ngay trong cùng số điện thoại nếu đủ mạnh — Cơ chế A, xem `hoa-giai.md`; hung tinh không nên liền Phục Vị hoặc liên tiếp nhiều loại hung khác nhau).

Khi cần mô tả sâu hơn về tính cách/tài vận/sự nghiệp/tình cảm/sức khỏe của một tinh nổi bật (đặc biệt tinh chủ đạo hoặc tinh ở đuôi số), đọc thêm `references/mo-ta-8-tinh.md`.

## Bước 3 — Trọng tâm 3 số đuôi

Soi kỹ tổ hợp Bát tinh + tổ hợp 3 số xấu (nếu có) ở 3 số cuối — đây là phần đại diện cho **kết cục cuối cùng** của mọi việc, cần nhấn mạnh trong kết luận hơn các cặp số ở giữa/đầu dãy. Áp dụng thêm quy tắc riêng cho đuôi số ở `references/bang-tra-bat-tinh.md` mục 4c (Diên Niên/Thiên Y/Sinh Khí ở đuôi mang ý nghĩa gì; vì sao không nên có hung tinh hoặc số 0 ở đuôi).

## Bước 4 — Đối chiếu ngũ hành Tiên Thiên–Hậu Thiên (chỉ khi có ngày sinh/CCCD)

Dùng bảng ngũ hành ở `references/bang-tra-bat-tinh.md` mục 1. Xét sinh khắc giữa hành của mệnh Tiên Thiên (suy ra từ ngày sinh/CCCD theo cách Công vẫn dùng ở các skill Bát Tự/luận CCCD khác) và ngũ hành nổi bật trong số điện thoại (Hậu Thiên). Nếu Công không cung cấp Tiên Thiên, bỏ qua bước này và nói ngắn gọn 1 câu rằng có thể luận sâu hơn nếu có thêm ngày sinh/CCCD.

## Bước 5 — Xác định Vận thế (đại vận) & cát tinh hóa giải theo giai đoạn tuổi

Đọc `references/dai-van-tuoi.md`. Chỉ thực hiện được khi có CCCD của khách — Vận thế tính từ **toàn bộ 12 số CCCD** theo công thức trượt cặp riêng (không phải cách tách cặp gốc dùng cho Bát tinh, và không tính từ số điện thoại). Nếu không có CCCD, bỏ qua bước này hoặc chỉ nêu nguyên tắc chung (nhu cầu ưu tiên theo độ tuổi) mà không xác định chính xác giai đoạn hiện tại.

## Bước 6 — Luận điểm xâm nhập theo 10 nhóm từ trường

Đọc `references/10-nhom-tu-truong.md`. Lấy Diên Niên làm trung tâm, đối chiếu các cặp/tổ số đã xác định ở Bước 2–3 vào 10 nhóm: đầu tư / hôn nhân / quan vận / học hành / sức khỏe / tiêu tiền tài / đào hoa / nhân mạch / bệnh tật / Họa Hại. Nếu Công đã nêu trọng tâm câu hỏi cụ thể ở Bước 0, ưu tiên đào sâu đúng nhóm đó; các nhóm khác chỉ điểm qua ngắn gọn.

## Bước 7 — Tổng hợp & khuyến nghị

Đọc `references/luu-y-dac-biet.md`. Bắt buộc kiểm tra và nêu rõ nếu số điện thoại rơi vào các trường hợp đặc biệt: >3 số 5, quá nhiều Diên Niên lặp lại, >2 số 0 ("số gãy"), đuôi là số 0 ("tứ đại giai không"). Áp dụng nguyên tắc "hung tinh không chắc đã hung" — đặt trong bối cảnh nghề nghiệp/mục đích của khách trước khi kết luận tốt/xấu. Nếu Công đã cho giới tính và câu hỏi liên quan hôn nhân, đối chiếu thêm mục tổ hợp bất lợi hôn nhân nữ giới trong cùng file (bao gồm cảnh báo Diên Niên dày đặc không hợp nữ giới dùng lâu).

## Bước 8 — Gợi ý tổ hợp hóa giải cụ thể

Đọc `references/hoa-giai.md`. **Có 2 cơ chế song song:** Cơ chế A (nội bộ trong số điện thoại — hung tinh được cát tinh đứng bên phải, đủ mạnh, hóa giải ngay) đã xét ở Bước 2, nêu lại ở đây nếu có. Cơ chế B (liên nguồn CCCD↔SĐT) chỉ thực hiện được khi có CCCD: xác định hung tinh nổi bật trong CCCD, tra công thức hóa giải tương ứng, rồi đưa 2–3 tổ hợp số cụ thể (từ số điện thoại hoặc nguồn số khác) để Công tham khảo. Nếu Công đã nêu rõ mục đích (tài lộc/hôn nhân → Thiên Y; sự nghiệp → Diên Niên; quý nhân/con trai → Sinh Khí), ưu tiên gợi ý theo đúng mục đích đó. Nếu đã biết Dụng Thần Tứ Trụ của khách (qua skill `luan-giai-bat-tu`), đối chiếu thêm bảng ngũ hành-chữ số phù hợp. Không tự đưa ra một dãy số điện thoại đầy đủ để "dùng ngay".

## Định dạng đầu ra

Luận theo đúng thứ tự 8 bước ở trên (có thể gộp trình bày cho gọn nếu bước nào không có dữ liệu — vd không có Tiên Thiên thì bỏ qua Bước 4, nói ngắn gọn 1 dòng lý do bỏ qua thay vì im lặng bỏ qua). Kết thúc luôn bằng phần Tổng hợp (Bước 7) và Gợi ý hóa giải (Bước 8) — đây là 2 phần khách hàng quan tâm nhất.

**Không trích dẫn mã nội bộ trong lời luận** — không viết "theo mục 4b", "mục 4d", "c1/c2/c3/c4" hay tên file reference trong câu trả lời cho Công. Các mục/mã đó chỉ để tra cứu nội bộ khi xử lý; khi trình bày, diễn giải thẳng thành lời tự nhiên (vd thay vì "số 5 chen giữa theo mục 4b → đột hiển" thì viết "số 5 đứng giữa khiến năng lượng này bộc lộ rõ ra ngoài"; thay vì "Diên Niên Cấp 1" thì có thể giữ tên tinh + mô tả mức độ bằng lời như "Diên Niên ở mức mạnh nhất" nếu cần, nhưng ưu tiên gọn không cần nêu số cấp nếu không thực sự cần thiết cho kết luận).
