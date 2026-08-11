# PHASE 34 — TIỂU HẠN: SOURCE LOCK ATTEMPT

**FINAL STATUS: `TIEU_HAN_SOURCE_SUPPORTED`**

Phase 34 KHÔNG code, KHÔNG sửa Natal Core, KHÔNG sửa `isThuanChung`/Đại Vận, KHÔNG sửa Golden Master,
KHÔNG commit/push. Đây là phần tiếp nối Phase 33 (`TIEU_HAN_NEED_SOURCE`) — mục tiêu duy nhất là truy tận
gốc nguồn được chỉ định và xác minh mức độ đầy đủ của nó.

---

## 1. Executive Summary

Đã đọc trực tiếp (curl, raw HTML, KHÔNG qua tóm tắt AI) nguồn chính được chỉ định:
**Bửu Đình — "Tử Vi Ứng Dụng", bài "Cách xem hạn (tử vi ứng dụng)"**, đăng tại
`vuihoctuvi.blogspot.com/2016/02/cach-xem-han-tu-vi-ung-dung.html`. Nguồn này phát biểu **tường minh,
mạch lạc, và có chủ đích đối chiếu trực tiếp** giữa quy tắc Đại Hạn (Âm Dương + giới tính, khớp 100% với
`isThuanChung` đã LOCKED) và quy tắc Tiểu Hạn (CHỈ giới tính: Trai thuận, Gái nghịch — không nhắc Âm
Dương) — trong CÙNG 1 đoạn văn, ngay sát nhau, dùng 2 cách diễn đạt khác nhau có chủ đích. Đây là bằng
chứng mạnh nhất từ trước đến nay cho câu hỏi mở của Phase 33.

Tuy nhiên **KHÔNG tìm được nguồn thứ 2 thực sự độc lập** (khác gốc, không phải sao chép) xác nhận đầy đủ
cùng lúc cả điểm khởi + chiều. Do đó, theo đúng điều kiện chặt của Mục XI spec (`SOURCE_LOCKED` cần đủ
CẢ 8 điều kiện, bao gồm không có "chỉ 1 nguồn"), kết luận dừng ở **`TIEU_HAN_SOURCE_SUPPORTED`** — mạnh
hơn hẳn `NEED_SOURCE` của Phase 33, nhưng chưa đạt `SOURCE_LOCKED`.

## 2. Source Hierarchy

| Nguồn | Level | Vai trò |
|---|---|---|
| vuihoctuvi.blogspot.com — "Cách xem hạn (tử vi ứng dụng)" (Bửu Đình, "Tử Vi Ứng Dụng") | **Primary**. Tác giả có tên, phương pháp có tên riêng ("Tử Vi Ứng Dụng"), tự nhận là 1 "môn phái học thuật" riêng (KHÔNG tự xưng "Nam Phái" — xem Mục 3). Nội dung an sao (Đại Hạn) khớp 100% với quy tắc Nam Phái project đã LOCKED (`isThuanChung`) — tín hiệu gián tiếp mạnh về tính tương thích. | Level 2 (tác giả nêu tên, phương pháp có tên, nhưng không tự xưng school chính thức project đang dùng) |
| hocvienlyso.org — nhiều bài khác của/về Bửu Đình ("Các nhóm sao (bác Bửu Đình)", "Hỏi và Đáp – Blog tử vi Bửu Đình" dẫn từ hoctuvionline.wordpress.com) | Xác nhận Bửu Đình là tác giả CÓ THẬT, được hocvienlyso.org (nguồn Level 1 project-canonical) công nhận/tái đăng cho NHIỀU chủ đề khác | Củng cố uy tín tác giả, KHÔNG phải bằng chứng trực tiếp cho riêng rule Tiểu Hạn |
| hocvienlyso.org — "Cách xem ĐẠI HẠN, TIỂU HẠN trong Tử Vi" (tác giả Dương Lương, đã kiểm ở Phase 33) | Level 1 (site), NHƯNG đã xác nhận lại ở Phase 34 (đọc lại toàn văn qua `curl`): bài này **KHÔNG chứa Bảng 3-2 hay bất kỳ câu nào về điểm khởi/chiều** — hoàn toàn là luận giải, KHÔNG phải cùng bài với nguồn Bửu Đình dù cùng chủ đề "Đại Hạn Tiểu Hạn" | KHÔNG dùng được — đã loại trừ rõ ràng, tránh nhầm 2 bài khác nhau thành 1 |
| lyso.vn (diễn đàn) — 3 phương pháp khác nhau do các thành viên forum nêu ("Lưu Đại Hạn", "theo phần mềm", "Lưu Thái Tuế") | Level 4/OTHER, ẩn danh, không thống nhất nội bộ | Xem Mục 16 — KHÔNG dùng để khóa, chỉ ghi nhận rủi ro nhầm lẫn thuật ngữ |
| tracuutuvi.com — "Tiểu vận" | Không rõ tác giả/trường phái, mô tả cơ chế gần giống Thái Tuế (đã LOCKED riêng) hơn là tam hợp | Level 4 — nghi vấn nhầm lẫn thuật ngữ (Mục 16), KHÔNG dùng để khóa |

## 3. Primary Source

**URL**: `http://vuihoctuvi.blogspot.com/2016/02/cach-xem-han-tu-vi-ung-dung.html`
**Tiêu đề**: "Cách xem hạn (tử vi ứng dụng)"
**Tác giả gốc của phương pháp**: Bửu Đình ("Tử Vi Ứng Dụng")
**Trường phái tự nhận**: theo bài định nghĩa riêng (`tuviungdung.blogspot.com/2016/05/tu-vi-ung-dung-la-gi.html`,
đã đọc), Bửu Đình mô tả "Tử Vi Ứng Dụng" là "1 môn phái học thuật Tử Vi" riêng biệt — **KHÔNG tự xưng
Nam Phái**. Đây là điểm cần ghi nhận trung thực, KHÔNG suy diễn thành "vậy là Nam Phái".

**Trích nguyên văn** (đọc trực tiếp HTML gốc, nguyên văn 100%, không chỉnh sửa chính tả nguồn):

> "● Đại Hạn: là thời gian 10 năm (thập niên), được tính dựa theo Cục và tuổi Âm, Dương. Mỗi thập niên
> được ghi vào một cung, bắt đầu từ cung Mệnh trở đi trong đó: Dương Nam, Âm Nữ thì ghi theo chiều Thuận,
> Âm Nam, Dương Nữ thì ghi theo chiều Nghịch."
>
> "● Tiểu Hạn: là thời gian 1 năm, được ghi theo vòng chu vi Địa bàn, mỗi cung ghi một tên. Nếu là Trai
> thì ghi theo chiều Thuận. Gái thì ghi theo chiều Nghịch. Cách xác định gốc Tiểu Vận được tổng hợp trong
> "Bảng 3-2" sau đây:"
>
> Bảng 3-2 (bảng định khởi Lưu niên Tiểu Vận), cột "Năm sinh" → "Cung khởi lưu niên":
> - Dần, Ngọ, Tuất → Thìn
> - Thân, Tý, Thìn → Tuất
> - Tỵ, Dậu, Sửu → Mùi
> - Hợi, Mão, Mùi → Sửu
>
> "Ví dụ: [tuổi] Hợi, Mão hay Mùi thì ghi chữ Hợi, chữ Mão hay chữ Mùi ở cung Sửu."
>
> "Không quan tâm đến hạn Nhi đồng, như 1 tuổi coi ở đâu, 3 tuổi coi ở đâu,… chỉ quan tâm đến Tiểu Hạn.
> Và hãy chờ nhập vào số cục rồi hãy xem. Dễ hiểu là Hỏa Lục Cục hãy chờ đến 6 tuổi ta hãy xem."

**Khớp CHÍNH XÁC** với mô tả trong chỉ thị Phase 34 (Mục I/II) — xác nhận bằng đọc trực tiếp, không phải
suy diễn từ tóm tắt.

## 4. Independent Source

**Không tìm được nguồn thứ 2 thực sự độc lập** trong phạm vi phiên làm việc này. Cụ thể đã thử:

- hocvienlyso.org (Dương Lương) — CÙNG chủ đề, KHÁC nội dung, không có cách an → không phải xác nhận,
  cũng không phải phủ định, chỉ là im lặng.
- Diễn đàn lyso.vn — có đề cập tam hợp/Tứ Mộ dạng tương tự ở Phase 33 (qua tìm kiếm tổng hợp, KHÔNG xác
  minh được nguồn gốc trực tiếp cụ thể), nhưng ở Phase 34 khi tra lại 1 thread cụ thể, các thành viên
  forum lại đưa ra 3 phương pháp KHÔNG PHẢI tam hợp/Tứ Mộ (xem Mục 16) — không đóng vai trò xác nhận độc
  lập cho đúng phương pháp Bửu Đình.
- Không tìm lại được ảnh lá số thực tế Phase 15 (GM-SOURCE-A/B/C) để kiểm tra riêng phần Tiểu Hạn trong
  phạm vi phase này (xem Mục 14 — vẫn là khoảng trống như Phase 33 đã ghi nhận).

→ Đúng theo Mục V spec: "Nếu tìm được nguồn khác: phải xác định có thực sự độc lập hay COMMON_ANCESTOR"
— ở đây tình huống ngược lại: KHÔNG tìm được nguồn khác đủ tư cách để đánh giá độc lập hay không. Đây
CHÍNH LÀ lý do duy nhất khiến kết luận dừng ở `SOURCE_SUPPORTED` thay vì `SOURCE_LOCKED`.

## 5. Start Palace

**Bảng 3-2** (Mục 3) — 4/4 nhóm tam hợp đầy đủ, trích nguyên văn trực tiếp, không suy diễn:

| Năm sinh (tam hợp) | Cung khởi (tuổi 1) |
|---|---|
| Dần, Ngọ, Tuất | Thìn |
| Thân, Tý, Thìn | Tuất |
| Tỵ, Dậu, Sửu | Mùi |
| Hợi, Mão, Mùi | Sửu |

Nhận xét cấu trúc (không phải suy diễn rule mới, chỉ ghi nhận tính nhất quán nội tại): cả 4 điểm khởi đều
rơi vào Tứ Mộ (Thìn/Tuất/Sửu/Mùi) — khớp với phát hiện tổng hợp ở Phase 33 dù nguồn khác nhau.

**Confidence: TRUNG BÌNH-CAO** (1 nguồn rõ ràng, tự nhất quán nội bộ, khớp cấu trúc với nhận định tổng
hợp trước đó) — nhưng vẫn chỉ 1 nguồn chính thức.

## 6. Direction

**Trích nguyên văn** (Mục 3): "Nếu là Trai thì ghi theo chiều Thuận. Gái thì ghi theo chiều Nghịch."

Điểm mấu chốt (đúng yêu cầu Mục IV spec — phải ghi rõ đây là 2 rule khác nhau): NGAY TRƯỚC câu này, CÙNG
tác giả, CÙNG bài, viết về Đại Hạn: "Dương Nam, Âm Nữ thì ghi theo chiều Thuận, Âm Nam, Dương Nữ thì ghi
theo chiều Nghịch." — tác giả rõ ràng BIẾT CÁCH diễn đạt phụ thuộc Âm Dương (vừa dùng nó cho Đại Hạn) và
**chủ động KHÔNG dùng cách diễn đạt đó cho Tiểu Hạn**, thay bằng "Trai/Gái" đơn thuần. Đây là bằng chứng
mạnh về TÍNH CHỦ ĐÍCH của sự khác biệt, không phải sơ suất bỏ sót.

→ **KHÔNG được dùng `isThuanChung` cho Tiểu Hạn** nếu sau này implement (đúng cảnh báo Mục IV spec) — vì
`isThuanChung` = f(Âm Dương năm sinh, giới tính), còn Tiểu Hạn theo nguồn này = f(giới tính) đơn thuần.

**Confidence: TRUNG BÌNH-CAO** trong phạm vi 1 nguồn — nhưng cũng chỉ 1 nguồn (như Mục 5).

## 7. Gender Dependency

Có — trực tiếp, tường minh: Trai (thuận) khác Gái (nghịch). Không mơ hồ.

## 8. Yin/Yang Dependency

**KHÔNG phụ thuộc** — theo đúng nguồn này (Mục 6). Đối chiếu Mục VI spec (4 tổ hợp Dương Nam/Âm Nam/
Dương Nữ/Âm Nữ): vì rule chỉ dùng "Trai/Gái", suy ra trực tiếp (không suy diễn thêm, chỉ đọc đúng nghĩa
đen của "Trai" = cả Dương Nam lẫn Âm Nam, "Gái" = cả Dương Nữ lẫn Âm Nữ):

| Tổ hợp | Chiều (theo nguồn Bửu Đình) |
|---|---|
| Dương Nam | Thuận |
| Âm Nam | Thuận |
| Dương Nữ | Nghịch |
| Âm Nữ | Nghịch |

Dương Nam = Âm Nam (cùng chiều) ✓, Dương Nữ = Âm Nữ (cùng chiều) ✓ — đúng như mục tiêu Mục VI spec đề ra
NẾU rule chỉ phụ thuộc giới tính. Đây là kết luận rút thẳng từ 1 câu duy nhất của nguồn (không cần suy
diễn phức tạp), nhưng — nhắc lại — chỉ từ 1 nguồn, chưa có nguồn 2 xác nhận độc lập.

## 9. Cục Dependency

**Công thức an vị trí (Bảng 3-2 + chiều) KHÔNG phụ thuộc Cục** — công thức chỉ cần Chi năm sinh (nhóm
tam hợp) + giới tính, không hề nhắc Cục.

**NHƯNG** — phát hiện quan trọng, tách bạch rõ 2 khái niệm khác nhau: Cục có vai trò trong THỰC HÀNH LUẬN
GIẢI (không phải công thức an vị trí): nguyên văn "Không quan tâm đến hạn Nhi đồng... chỉ quan tâm đến
Tiểu Hạn. Và hãy chờ nhập vào số cục rồi hãy xem. Dễ hiểu là Hỏa Lục Cục hãy chờ đến 6 tuổi ta hãy xem."
— tức: cung Tiểu Hạn của các tuổi nhỏ hơn số Cục VẪN được tính ra bình thường theo công thức, nhưng tác
giả khuyến nghị KHÔNG LUẬN GIẢI (không diễn giải ý nghĩa) cho các năm đó ("hạn Nhi đồng"). Đây là 1 quy
ước LUẬN GIẢI, không phải điều kiện của công thức AN VỊ TRÍ — cần giữ tách bạch 2 khái niệm này nếu
implement sau này, không gộp nhầm.

## 10. Mệnh/Thân Dependency

Không tìm thấy bất kỳ tham chiếu nào đến Mệnh/Thân trong toàn bộ công thức (Bảng 3-2 + quy tắc thuận
nghịch chỉ cần Chi năm sinh + giới tính). Công thức như nguồn mô tả là ĐẦY ĐỦ và TỰ CHỨA (self-contained)
mà không cần Mệnh/Thân — khác với 1 số vòng sao khác trong project (vd. Tràng Sinh phụ thuộc Cục qua
Bản Mệnh Nạp Âm). Ghi nhận: không có bằng chứng phụ thuộc, KHÔNG khẳng định tuyệt đối "chắc chắn không
bao giờ phụ thuộc" (im lặng không phải bằng chứng phủ định tuyệt đối) — nhưng công thức được nêu là đầy
đủ, khép kín, không thiếu input.

## 11. Age Rule

Tuổi 1 (năm sinh) = Cung khởi (Bảng 3-2). Từ tuổi 2 trở đi, mỗi năm dịch chuyển 1 cung theo chiều Trai
thuận/Gái nghịch. Nguồn không lặp lại tường minh câu "12 năm quay về vị trí cũ" (câu này xuất hiện ở
nguồn tổng hợp Phase 33, KHÔNG có trong bài Bửu Đình đọc trực tiếp ở Phase 34) — nhưng đây là hệ quả toán
học tất yếu của "1 năm = 1 cung, vòng tròn 12 cung" đã nêu tường minh ("được ghi theo vòng chu vi Địa
bàn"), không cần thêm bằng chứng riêng.

## 12. Age Boundary

**Tuổi 12/13 chuyển vòng**: KHÔNG có câu trích riêng xác nhận trong phiên làm việc này (chỉ suy ra từ
cấu trúc "vòng chu vi Địa bàn" — xem Mục 11) — ghi nhận là suy luận toán học tất yếu từ mô tả đã có, chưa
phải trích dẫn trực tiếp mới.

**Tuổi mụ hay tuổi thực**: KHÔNG tìm thấy nguồn nào (kể cả nguồn chính) nói rõ. Vẫn là khoảng trống —
KHÔNG tự chọn (đúng cấm chỉ Mục XIII spec).

## 13. Year Boundary

**Năm xem tính theo âm lịch hay dương lịch**: KHÔNG có nguồn nào (kể cả nguồn chính Bửu Đình) nói rõ
riêng cho Tiểu Hạn. Nếu implement sau này, đây vẫn là quyết định kiến trúc cần Phase riêng xác nhận (có
thể tái dùng đúng `tuoiNamXem`/ranh giới năm âm lịch đã LOCKED sẵn ở Natal Core cho mục đích khác — nhưng
đó là suy đoán kiến trúc, KHÔNG phải bằng chứng huyền học, không dùng để khóa rule ở phase này).

## 14. Real Chart Evidence

**Không có tiến triển so với Phase 33** — vẫn chưa quay lại kiểm tra các ảnh lá số thực tế Phase 15
(GM-SOURCE-A/B/C, tuvinamphai.vn) xem có lộ Tiểu Hạn hay không. Đây tiếp tục là khoảng trống ghi nhận
trung thực, không phải "đã tìm và không có".

## 15. Golden Master Evidence

Grep lại toàn văn `TuVi_Golden_Master_Pack_V1.md` cho "Tiểu Hạn"/"Tiểu Vận": **0 kết quả** (xác nhận lại,
không đổi so với Phase 33). → **NO_DATA**. Không sửa Golden Master.

## 16. Source Conflicts

**Không phát hiện xung đột trực tiếp với nguồn chính** (không có nguồn nào nói "Bửu Đình sai" hay đưa ra
Bảng 3-2 khác/chiều khác cho ĐÚNG cùng phương pháp tam hợp/Tứ Mộ này).

**NHƯNG phát hiện rủi ro nhầm lẫn thuật ngữ đáng ghi nhận** (không phải SOURCE_CONFLICT theo đúng nghĩa
Mục X spec, vì đây là các khái niệm/tên gọi KHÁC nhau bị gọi chung tên "tiểu hạn"/"tiểu vận" bởi nguồn
không chính thức, không phải 2 nguồn cùng mô tả 1 khái niệm mà mâu thuẫn nhau):

1. Diễn đàn lyso.vn (thread hỏi về cách tính tiểu hạn) — thành viên "tranhuunhut" mô tả 1 thuật toán
   hoàn toàn khác gọi là "Lưu Đại Hạn": xuất phát từ cung Đại Vận hiện tại, năm 1 = cung Đại Vận, năm 2 =
   cung xung chiếu, năm 3/4 lùi/tiến rồi mới đi theo chiều kim đồng hồ, có điều kiện Dương Nam/Nữ Âm khác
   Nữ Dương/Nam Âm — đây là 1 khái niệm HOÀN TOÀN KHÁC (phụ thuộc Đại Vận hiện tại, cấu trúc zigzag), rõ
   ràng KHÔNG PHẢI cùng công thức tam hợp/Tứ Mộ của Bửu Đình. `OTHER_SCHOOL`/thuật toán khác tên trùng.
2. tracuutuvi.com ("Tiểu Vận") — mô tả cơ chế "cung chứa Chi của năm xem" = **thực chất là định nghĩa của
   Thái Tuế** (đã LOCKED riêng biệt trong project từ Phase 26, hoàn toàn khác Tiểu Hạn) — nghi vấn cao là
   nhầm lẫn thuật ngữ phổ biến trong nội dung SEO đại chúng, KHÔNG lấy làm bằng chứng phủ định phương
   pháp Bửu Đình.

**Kết luận Mục 16**: Không có `TIEU_HAN_CONFLICTED` (không có 2 nguồn CÙNG mô tả 1 phương pháp nhưng nói
ngược nhau). Có ghi nhận `SCHOOL_CONFLICT`/thuật ngữ trùng tên khác nghĩa ở diện rộng cộng đồng — cảnh báo
cho phase sau: khi implement, PHẢI đặt tên field/API rõ ràng (vd. không chỉ gọi chung chung "tieuHan") để
tránh người dùng lá số nhầm với các khái niệm khác đang lưu hành phổ biến.

## 17. Rule Matrix

| Thành phần | Rule | Source | Evidence | Confidence | Status |
|---|---|---|---|---|---|
| Start Palace | Bảng 3-2 (4 nhóm tam hợp → Tứ Mộ) | Bửu Đình, Tử Vi Ứng Dụng | Trích trực tiếp, tự nhất quán | Trung bình-Cao | `SOURCE_SUPPORTED` (1 nguồn) |
| Direction | Trai thuận / Gái nghịch | Bửu Đình, Tử Vi Ứng Dụng | Trích trực tiếp, đối chiếu chủ đích với Đại Hạn | Trung bình-Cao | `SOURCE_SUPPORTED` (1 nguồn) |
| Gender | Có, quyết định chiều | Như trên | Trực tiếp | Cao | `SOURCE_SUPPORTED` |
| Yin/Yang | KHÔNG phụ thuộc (khác Đại Vận) | Như trên (suy ra trực tiếp từ "Trai/Gái") | Trực tiếp + đối chiếu chủ đích | Trung bình-Cao | `SOURCE_SUPPORTED` |
| Cục | Không ảnh hưởng công thức an vị trí; CÓ ảnh hưởng quy ước khi nào bắt đầu LUẬN GIẢI | Như trên | Trực tiếp, đã tách bạch 2 khái niệm | Trung bình | `SOURCE_SUPPORTED` (cho phần công thức) |
| Mệnh | Không có trong công thức | Như trên | Suy luận từ formula đầy đủ đã nêu | Trung bình | `NEED_EVIDENCE` (im lặng, chưa xác nhận chủ động) |
| Thân | Không có trong công thức | Như trên | Như trên | Trung bình | `NEED_EVIDENCE` |
| Age | Tuổi 1 = cung khởi, mỗi năm +1 cung, chu kỳ 12 | Như trên | Trực tiếp + hệ quả tất yếu | Cao | `SOURCE_SUPPORTED` |
| Age boundary | Tuổi 13 ≡ tuổi 1 (chu kỳ 12) | Suy luận toán học từ "vòng chu vi Địa bàn" | Gián tiếp | Trung bình | `NEED_EVIDENCE` (chưa có câu trích riêng) |
| Year boundary | Chưa xác định (âm/dương lịch cho năm xem, tuổi mụ/thực) | Không tìm thấy | Không có | Thấp | `NEED_SOURCE` |

## 18. Implementation Gate

Đối chiếu 8 điều kiện `SOURCE_LOCKED` (Mục XI spec — cần ĐỦ CẢ 8):

1. Cung khởi rõ — ✅ (từ 1 nguồn).
2. Chiều rõ — ✅ (từ 1 nguồn).
3. Gender rõ — ✅.
4. Yin/Yang dependency rõ — ✅ (KHÔNG phụ thuộc, xác nhận trực tiếp).
5. Age mapping rõ — ✅.
6. Year boundary rõ — ❌ (Mục 13, chưa có nguồn).
7. Source Nam Phái đủ mạnh — ⚠️ nguồn có tên tác giả rõ, phương pháp mạch lạc, nhưng tự nhận là "môn
   phái riêng" chứ không tự xưng "Nam Phái"; và **chỉ có 1 nguồn**, chưa đạt "đủ mạnh" theo tinh thần
   Mục V spec (yêu cầu tìm nguồn độc lập thứ 2).
8. Không có conflict nghiêm trọng — ✅ (Mục 16 — chỉ có nhầm lẫn thuật ngữ ở nguồn không chính thức,
   không phải xung đột nghiêm trọng với nguồn chính).

→ Đạt 6/8, thiếu 2 điều kiện quan trọng (6, 7) → **KHÔNG đạt `SOURCE_LOCKED`**. Đạt mức
**`SOURCE_SUPPORTED`** (rule có nguồn rõ ràng, mạch lạc, đáng tin, nhưng chưa đủ điều kiện khóa cứng để
implement ngay).

## 19. Final Status

```
TIEU_HAN_SOURCE_SUPPORTED
```

**Điều kiện để nâng lên `TIEU_HAN_SOURCE_LOCKED` ở phase sau**: (a) tìm được 1 nguồn Nam Phái/sách Nam
Phái hoặc lá số thực tế Nam Phái thực sự độc lập (không chung gốc với Bửu Đình) xác nhận CÙNG Bảng 3-2 +
CÙNG quy tắc "Trai thuận Gái nghịch không phụ thuộc Âm Dương"; (b) xác định rõ ranh giới năm (âm/dương
lịch, tuổi mụ/thực) cho riêng Tiểu Hạn. Cho tới khi đó, Phase 35+ (nếu có) vẫn KHÔNG được implement dựa
trên `SOURCE_SUPPORTED` — cần thêm 1 phase nghiên cứu bổ sung hoặc chấp nhận rủi ro đã nêu ở Mục 15
Phase 33 (ảnh hưởng đúng 50% lá số Nữ nếu chọn sai) nếu người dùng chủ động quyết định implement với mức
bằng chứng hiện tại.

---

## Final Checklist (Mục XIV spec)

- [x] Primary Nam Phái source — tìm thấy, đọc trực tiếp (nhưng không tự xưng "Nam Phái")
- [x] Source gốc — xác định (vuihoctuvi.blogspot.com, tác giả Bửu Đình)
- [x] Start Palace — rõ (Mục 5)
- [x] Direction — rõ (Mục 6)
- [x] Gender — rõ (Mục 7)
- [x] Yin/Yang — rõ, KHÔNG phụ thuộc (Mục 8)
- [x] Cục — rõ cho công thức, có ghi chú riêng cho luận giải (Mục 9)
- [ ] Mệnh — NEED_EVIDENCE (Mục 10)
- [ ] Thân — NEED_EVIDENCE (Mục 10)
- [x] Age — rõ (Mục 11)
- [ ] Age boundary — suy luận, chưa có trích dẫn riêng (Mục 12)
- [ ] Year boundary — chưa xác định (Mục 13)
- [ ] Real chart — chưa kiểm tra (Mục 14)
- [x] Golden Master — đã kiểm tra, NO_DATA (Mục 15)
- [x] School conflict — đã kiểm tra, không có conflict nghiêm trọng với nguồn chính (Mục 16)
- [x] Rule matrix — đầy đủ (Mục 17)
- [x] Implementation gate — đã áp dụng, kết quả SOURCE_SUPPORTED (Mục 18)

## Regression

Không sửa file Natal Core nào. Không thêm/sửa/xóa test. Baseline giữ nguyên **744 PASS / 5 EXPECTED FAIL
/ 0 UNEXPECTED FAIL / 749 TỔNG** (không đổi từ Phase 32/33).
