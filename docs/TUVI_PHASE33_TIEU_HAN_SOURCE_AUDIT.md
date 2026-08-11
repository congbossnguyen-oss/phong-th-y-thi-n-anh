# PHASE 33 — TIỂU HẠN: SOURCE AUDIT

**FINAL STATUS: `TIEU_HAN_NEED_SOURCE`**

Phase 33 là SOURCE AUDIT thuần túy — KHÔNG implement. Không có bất kỳ file Natal Core nào bị sửa
(`rules.ts`, `engine.ts`, `bat-tu.ts`, `json-contract.ts`). Không sửa Golden Master. Không commit/push.
Không thêm test mới (không có gì để test — chưa có code).

---

## 1. Executive Summary

Không tìm được 1 nguồn Nam Phái Level 1/2 nào phát biểu ĐẦY ĐỦ và TƯỜNG MINH cả 2 yếu tố bắt buộc
(điểm khởi + chiều đi) trong cùng 1 chỗ, có dẫn chứng trực tiếp, không qua suy diễn. Điểm khởi (khởi tại
Tứ Mộ theo tam hợp Chi năm sinh) có bằng chứng tương đối nhất quán qua nhiều nguồn tổng hợp, nhưng CHIỀU
ĐI — cụ thể là liệu có phụ thuộc Âm Dương năm sinh (giống Đại Vận) hay chỉ phụ thuộc thuần túy giới tính
— là điểm **CHƯA XÁC ĐỊNH được với độ tin cậy đủ để khóa**. Một tác giả độc lập, hiểu biết rõ chủ đề
(blog "Thạch Khê Các") chính là người **TỰ ĐẶT CÂU HỎI này chưa có lời giải** trong bài viết của mình —
đây là bằng chứng mạnh cho thấy đây KHÔNG phải chỗ tôi thiếu tìm kiếm, mà là 1 điểm thực sự chưa ngã ngũ
rõ ràng trong tài liệu công khai tìm được.

→ Theo đúng Mục IX spec ("Không được tự chọn rule nếu... nguồn nói mơ hồ... chỉ có một phần công thức"),
**KHÔNG đủ điều kiện để chuyển sang READY_FOR_IMPLEMENTATION**.

## 2. Definition

Tiểu Hạn (còn gọi Tiểu Vận) là vận hạn tính theo TỪNG NĂM (khác Đại Vận tính theo chu kỳ 10 năm) — mỗi
tuổi (theo cách tính tuổi ta) ứng với 1 cung trong 12 cung, lặp lại theo chu kỳ 12 năm. Theo
`TuVi_Engine_V2.md` §29 (spec gốc của project, chưa qua audit thực tế): "Tiểu Hạn là module độc lập",
input gồm `birthYearBranch, gender, viewingYear`, và có ghi chú rõ **"Không được lấy đại vận để suy ra
Tiểu Hạn"** — tức về mặt kiến trúc, Tiểu Hạn PHẢI độc lập với hướng đi của Đại Vận (không dùng lại
`isThuanChung` một cách mặc định), khác với Vòng Bác Sĩ (Phase 32, dùng lại `isThuanChung`).

## 3. Source Hierarchy

| Nguồn | Level | Ghi chú |
|---|---|---|
| hocvienlyso.org — các bài "Luận tiểu hạn", "Kinh nghiệm luận đoán tiểu hạn", "Phép đoán tiểu hạn trên lá số..." | Level 1 (site) nhưng **KHÔNG chứa cách an** — toàn bộ đều là bài luận giải (interpretation), giả định người đọc đã biết cách an sẵn. Xem Mục 4. | KHÔNG dùng được để khóa điểm khởi/chiều |
| hocvienlyso.org — "Tứ mộ khởi biến hóa – Alexphong" | **Ghi rõ trong bài: "(Dẫn theo trang vuihoctuvi.blogspot.com)"** — tức đây là bài ĐĂNG LẠI từ 1 blog cá nhân khác, KHÔNG phải nội dung gốc của hocvienlyso.org. Theo đúng nguyên tắc "không dùng nhiều site sao chép cùng 1 bài để giả lập nhiều nguồn độc lập", level thực sự ở đây phải tính theo nguồn gốc (vuihoctuvi.blogspot.com — blog cá nhân, KHÔNG xác định được tác giả/trường phái) chứ không phải Level 1 dù host trên hocvienlyso.org. | Level 3/4 (nguồn gốc thực = blog cá nhân không rõ trường phái) |
| dogovinhvuong.com/cach-tinh-tieu-han-tu-vi | Không rõ trường phái, dạng bài content SEO tổng hợp | Level 4/OTHER_SCHOOL — chỉ dùng tham khảo, không dùng để khóa |
| hieunguyen711.wordpress.com ("Thạch Khê Các") | Blog cá nhân, tác giả có hiểu biết sâu (phân biệt đúng Tiểu Hạn khác Đại Vận, đúng thuật ngữ Lưu Niên Đại Vận), nhưng KHÔNG tự xưng Nam Phái/Bắc Phái | Level 3/4 — quan trọng vì đây là nguồn DUY NHẤT nêu rõ sự mơ hồ tồn tại thực sự (xem Mục 8) |
| `TuVi_Engine_V2.md` §29 (spec gốc dự án) | Không phải "nguồn Nam Phái" — là spec kỹ thuật do dự án tự soạn trước khi có audit thực tế (đã biết có ít nhất 1 trường hợp spec-literal SAI, xem Thiên Khôi Phase 24). Chỉ dùng làm gợi ý kiến trúc (input signature), KHÔNG dùng làm bằng chứng khóa rule huyền học. | N/A (không phải nguồn huyền học) |

**Không tìm được** trang nào của hocvienlyso.org (nguồn Level 1 project-canonical đã dùng xuyên suốt 32
phase trước) trực tiếp công bố cách an Tiểu Hạn (điểm khởi + chiều) — đã kiểm tra toàn bộ 7 bài kết quả
tìm kiếm liên quan "Tiểu Hạn" trên site này (Mục 4).

## 4. Rule Research

Đã kiểm tra trực tiếp (đọc HTML gốc qua `curl`, không qua tóm tắt AI khi có thể) các bài sau trên
hocvienlyso.org:

- `cach-xem-dai-han-tieu-han-trong-tu-vi.html` — 100% nội dung luận giải (vd. "Nếu đại hạn có Liêm Tham
  hãm địa... mà tiểu hạn có Địa Không..."), tác giả CHỦ ĐỘNG tránh nêu quy tắc: nguyên văn "Để cho được
  linh động và bớt khô khan tôi tránh việc nêu ra các nguyên tắc". → **KHÔNG có cách an**.
- `phep-doan-tieu-han-tren-la-so-xet-goc-dai-han-va-cac-sao-luu-nien.html` → **CHỈ CÓ LUẬN GIẢI, KHÔNG CÓ
  CÁCH AN**.
- `luan-tieu-han.html`, `kinh-nghiem-luan-doan-tieu-han.html`, `doan-tieu-han-phai-linh-dong...html` →
  cùng nhóm bài luận giải, không kiểm tra sâu hơn vì tiêu đề đã cho thấy cùng bản chất (luận đoán, không
  phải cách an).
- `tu-mo-khoi-bien-hoa-alexphong.html` — bài duy nhất có đề cập cơ chế, nguyên văn: **"Tiểu vận của nam
  giới trong tử vi luôn đi thuận. Cho nên những năm La Hầu Kế Đô Thái Bạch của nam giới là những năm
  tiểu vận rơi vào tứ mộ."** — xác nhận (a) Nam luôn thuận, (b) ngụ ý Tứ Mộ có vai trò đặc biệt trong chu
  kỳ. NHƯNG bài **ghi rõ là đăng lại từ vuihoctuvi.blogspot.com** (Mục 3), và **KHÔNG hề nhắc đến Nữ**
  (không thể suy diễn "Nữ nghịch" từ im lặng).

Nguồn tổng hợp khác (không xác định trường phái, KHÔNG dùng để khóa, chỉ ghi nhận để đối chiếu):

> "Tiểu hạn mỗi năm chiếm 1 cung, nam thì đi thuận, nữ thì đi nghịch, 12 năm quay về vị trí cũ... gốc
> khởi từ các tuổi 1 – 13 – 25 – 37... phải dựa vào tam hợp năm sinh, và mỗi một tam hợp tuổi khởi năm
> đầu tiên của vòng hạn từ cung đối của chi cuối cùng trong tam hợp. Tiểu hạn luôn khởi ở Tứ Mộ: Thìn,
> Tuất, Sửu, Mùi."

Câu này khớp về mặt CẤU TRÚC với bài Alexphood (Tứ Mộ, Nam thuận), nhưng nguồn gốc là kết quả tìm kiếm
tổng hợp AI (không truy được về 1 trang cụ thể đáng tin cậy độc lập) — theo đúng bài học từ Phase 26-29
(Thiên Mã: AI search summary từng tự mâu thuẫn nội bộ nhiều lần), KHÔNG dùng loại bằng chứng này để khóa
rule mà chỉ dùng để định hướng tìm kiếm tiếp.

## 5. Start Point

**Giả thuyết có cơ sở nhưng CHƯA KHÓA**: Tiểu Hạn khởi tại Tứ Mộ (Thìn/Tuất/Sửu/Mùi), cung cụ thể xác
định theo nhóm tam hợp của Chi năm sinh — tuổi đầu tiên (tuổi 1, năm sinh) rơi đúng vào Chi Tứ Mộ cùng
nhóm tam hợp với Chi năm sinh (vd. tuổi Thân/Tý/Thìn → tuổi 1 tại Thìn). Cơ sở: nhất quán giữa bài
Alexphood/hocvienlyso (nhấn mạnh vai trò Tứ Mộ) và các nguồn tổng hợp khác — nhưng KHÔNG có 1 trích dẫn
Level 1/2 duy nhất phát biểu đầy đủ cả 4 nhóm bằng bảng số cụ thể, có dẫn nguồn rõ ràng, đọc trực tiếp
(khác hẳn với Vòng Bác Sĩ ở Phase 32, nơi hocvienlyso.org phát biểu trực tiếp, nguyên văn, đầy đủ).

## 6. Direction

**CHƯA XÁC ĐỊNH đủ độ tin cậy.** Bằng chứng tìm được:

- Nam: "luôn đi thuận" — có 1 dẫn chứng gần-Level-1 (host trên hocvienlyso.org nhưng nguồn gốc là blog
  ngoài) + nhiều nguồn tổng hợp đồng thuận.
- Nữ: KHÔNG có dẫn chứng trực tiếp nào xác nhận "luôn nghịch" — chỉ suy ra từ các nguồn tổng hợp không rõ
  trường phái.
- Câu hỏi cốt lõi (Tiểu Hạn có phụ thuộc Âm Dương năm sinh như Đại Vận hay chỉ phụ thuộc giới tính đơn
  thuần?) **CHÍNH TÁC GIẢ blog "Thạch Khê Các" cũng đặt câu hỏi này ở cuối bài, không tự trả lời** — bằng
  chứng độc lập, đáng tin, cho thấy đây là điểm còn mơ hồ thật sự trong cộng đồng, không phải do tìm kiếm
  chưa đủ sâu.

Theo đúng Mục V spec ("Nếu nguồn chỉ nói 'khởi tại Lộc Tồn' nhưng không nói chiều: KHÔNG được tự chọn
chiều") áp dụng tương tự ở đây: không có đủ cơ sở để tự chọn giữa "Nam/Nữ đơn thuần" và "Âm Dương + giới
tính giống Đại Vận".

## 7. Age Mapping

Có cơ sở khá vững (đồng thuận giữa nhiều nguồn, không mâu thuẫn nội bộ): tuổi ta (đếm theo `tuoiNamXem`
đã có sẵn trong `TuViChart`, công thức `viewingYear - year + 1`, đã LOCKED từ trước) tăng dần, mỗi tuổi
ứng 1 cung, chu kỳ lặp lại 12 năm (tuổi 1≡13≡25≡...). KHÔNG phát hiện xung đột về điểm này.

## 8. Gender/Âm Dương Dependency

Xem Mục 6 — đây CHÍNH LÀ điểm nghẽn chính của toàn bộ audit. Không đủ cơ sở kết luận theo hướng nào.

## 9. Year Boundary

KHÔNG tìm được nguồn nào bàn về trường hợp biên (sinh sát ngày Tết, năm nhuận, năm đầu tiên tuổi 0 vs
1...) cho riêng Tiểu Hạn. Dự kiến (nếu implement sau này) sẽ tái sử dụng đúng field `tuoiNamXem` đã LOCKED
sẵn của Natal Core (đã xử lý đúng ranh giới năm âm lịch qua `solarToLunar`/`tinhBatTu` từ trước) — nhưng
đây là suy đoán kiến trúc, KHÔNG phải bằng chứng huyền học, không dùng để khóa rule.

## 10. Real Chart Evidence

**KHÔNG tìm được** trong phạm vi phase này 1 lá số thực tế Nam Phái (ảnh hoặc văn bản) có ghi rõ: ngày
giờ sinh + giới tính + năm xem + Tiểu Hạn hiển thị tường minh, đủ để dùng làm test input độc lập. Các ảnh
lá số thực tế đã thu thập ở Phase 15 (GM-SOURCE-A/B/C, tuvinamphai.vn) được dùng cho Can 12 cung/14 chính
tinh ở các phase trước — phiên làm việc này KHÔNG re-fetch lại các ảnh đó để kiểm tra riêng phần Tiểu Hạn
(ngoài phạm vi effort của 1 phase audit), nên ghi nhận trung thực: **chưa kiểm tra**, không phải "không
có" — để phase sau (nếu cần) biết hướng đi tiếp theo là quay lại đúng các ảnh Phase 15 đó trước khi tìm
nguồn hoàn toàn mới.

## 11. Golden Master Coverage

Kiểm tra `TuVi_Golden_Master_Pack_V1.md` (grep toàn văn cho "Tiểu Hạn"/"Tiểu Vận"): **0 kết quả**.

→ **NO_DATA**. Không tự tạo expected, không sửa Golden Master (đúng yêu cầu Mục V spec).

## 12. School Conflicts

Không phát hiện 2 nguồn nói ngược nhau một cách tường minh (không có "Nguồn A = thuận tuyệt đối, Nguồn B
= nghịch tuyệt đối" cho cùng 1 trường hợp cụ thể) — nên đây KHÔNG được phân loại `CONFLICTED` theo đúng
nghĩa hẹp của Mục IV/VI spec. Vấn đề thực sự là **thiếu nguồn** phát biểu đầy đủ + rõ ràng (silence, not
contradiction) — đúng với định nghĩa `NEED_SOURCE` hơn `CONFLICTED`.

## 13. Rule Reconstruction

| Input | Rule (giả thuyết, CHƯA KHÓA) | Source | Evidence | Confidence |
|---|---|---|---|---|
| Chi năm sinh (tam hợp group) | Điểm khởi (tuổi 1) = Chi Tứ Mộ cùng nhóm tam hợp | Nguồn tổng hợp + Alexphood/hocvienlyso (gián tiếp) | Trung bình — nhất quán nhưng không có 1 trích dẫn Level 1/2 đầy đủ | **THẤP-TRUNG BÌNH** |
| Giới tính (Nam) | Luôn đi thuận | Alexphood/hocvienlyso (nguồn gốc = blog ngoài) + tổng hợp | Trung bình | **THẤP-TRUNG BÌNH** |
| Giới tính (Nữ) | Luôn đi nghịch (giả thuyết, KHÔNG có dẫn chứng trực tiếp) | Chỉ nguồn tổng hợp không rõ trường phái | Yếu | **THẤP** |
| Âm Dương năm sinh | Không rõ có ảnh hưởng hay không | Không có nguồn nào xác nhận CÓ hay KHÔNG — 1 tác giả độc lập tự nhận chưa rõ | Không có | **KHÔNG XÁC ĐỊNH** |
| Tuổi → cung | Mỗi tuổi 1 cung, lặp chu kỳ 12 năm | Đồng thuận rộng, không mâu thuẫn | Tốt | **TRUNG BÌNH-CAO** |

## 14. Implementation Decision

Đối chiếu Mục VIII spec (6 điều kiện, cần ĐỦ CẢ 6):

1. Điểm khởi rõ — ⚠️ có giả thuyết, chưa "rõ" ở mức Level 1/2 xác nhận trực tiếp.
2. Chiều rõ — ❌ KHÔNG rõ (Mục 6/8).
3. Tuổi mapping rõ — ✅.
4. Gender dependency rõ — ❌ KHÔNG rõ (không biết có cộng thêm Âm Dương hay không).
5. Không còn school conflict nghiêm trọng — ✅ (không phải xung đột, mà là thiếu nguồn).
6. Có nguồn Nam Phái đủ mạnh — ❌ chưa tìm được nguồn Level 1/2 Nam Phái phát biểu đầy đủ.

→ Thiếu 3/6 điều kiện bắt buộc (2, 4, 6) → **KHÔNG ĐỦ ĐIỀU KIỆN IMPLEMENT**.

## 15. Remaining Risks

- Nếu implement sai hướng (chọn nhầm "Nam/Nữ đơn thuần" trong khi thực tế Nam Phái project dùng theo
  Âm Dương giống Đại Vận, hoặc ngược lại), sai số ảnh hưởng ĐÚNG 50% lá số Nữ giới mỗi lần xem Tiểu Hạn —
  rủi ro cao nếu implement vội.
- Rủi ro tương tự nhưng nhỏ hơn ở điểm khởi: nếu bảng Tứ Mộ theo tam hợp bị hiểu sai chiều "cung đối của
  chi cuối tam hợp" (câu trích ở Mục 4 mơ hồ về việc tính "chi cuối" theo thứ tự nào).
  cầu quay lại đọc ảnh Phase 15 (GM-SOURCE-A/B/C) xem có lộ Tiểu Hạn không, trước khi mở rộng tìm nguồn
  mới hoàn toàn.
- Nên tìm thêm: sách giấy Nam Phái đã dùng làm nguồn Level 2 trước đây trong project (Trần Việt Sơn,
  "cụ Thiên Lương" — đã dùng cho Thiên Mã Phase 29) — CHƯA kiểm tra các nguồn này có bàn về Tiểu Hạn
  không trong phiên làm việc này.

---

## Final Checklist (Mục XIV spec)

- [x] Source Nam Phái đã tìm (nhưng KHÔNG đủ — xem Mục 3/4)
- [x] Trường phái được xác định (đa số nguồn không rõ trường phái — ghi rõ OTHER_SCHOOL/không xác định)
- [ ] Điểm khởi rõ — **CHƯA RÕ** (chỉ có giả thuyết)
- [ ] Chiều rõ — **CHƯA RÕ**
- [x] Tuổi mapping rõ
- [ ] Gender dependency rõ — **CHƯA RÕ**
- [ ] Năm boundary rõ — chưa nghiên cứu riêng (Mục 9)
- [ ] Real chart evidence — **CHƯA kiểm tra** (Mục 10)
- [x] Golden Master coverage — đã kiểm tra, NO_DATA
- [x] School conflict audit — đã kiểm tra, không phải CONFLICTED mà là NEED_SOURCE
- [x] Không sửa Natal Core
- [x] Không sửa Golden Master
- [x] Không suy diễn (mọi giả thuyết đều gắn nhãn "CHƯA KHÓA"/"giả thuyết", không code hóa)

## XIII. Regression

Không sửa bất kỳ file Natal Core nào, không thêm test (không có code để test). Baseline giữ nguyên
**744 PASS / 5 EXPECTED FAIL / 0 UNEXPECTED FAIL / 749 TỔNG** (từ Phase 32) — không đổi.

## Final Status

```
TIEU_HAN_NEED_SOURCE
```

**Điều kiện để chuyển sang READY_FOR_IMPLEMENTATION ở phase sau**: tìm được ≥1 nguồn Nam Phái Level 1/2
(ưu tiên hocvienlyso.org hoặc sách Nam Phái đã dùng trước đây — Trần Việt Sơn/cụ Thiên Lương) phát biểu
TƯỜNG MINH cả điểm khởi (đủ bảng 4 nhóm tam hợp) VÀ chiều đi (bao gồm rõ ràng có/không phụ thuộc Âm Dương
năm sinh), hoặc quay lại đọc trực tiếp ảnh lá số thực tế Phase 15 nếu có lộ Tiểu Hạn.
