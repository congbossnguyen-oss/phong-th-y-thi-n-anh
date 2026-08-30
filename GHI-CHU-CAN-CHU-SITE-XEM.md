# GHI CHÚ CẦN CHỦ SITE XEM — Module "Xem hướng nhà Bát Trạch"

Build ngày 30/8/2026, tự động một mạch theo yêu cầu, không dừng lại hỏi. Danh sách dưới đây là mọi
chỗ phải tự quyết trong lúc build, mọi chỗ data thiếu phải để trống, và mọi nghi vấn về số liệu —
đúng như README.md gói build yêu cầu ("chủ site đọc file này thay vì bị hỏi giữa chừng").

## 0. Một mâu thuẫn giữa 2 nguồn — đã tự giải quyết theo nguồn ưu tiên hơn

Tin nhắn chat của anh có câu "kết nối cả AI để luận giải", nhưng chính README.md gói build lại ghi
rõ **"KHÔNG CẦN GỌI API AI... Viết bằng JS chạy thẳng trên trình duyệt, chi phí ~0. Phần diễn giải
dùng template viết sẵn"** — và phần YÊU CẦU chi tiết trong cùng tin nhắn cũng lặp lại đúng yêu cầu
này ("Không gọi API AI. Toàn bộ phần luận là tra bảng, viết bằng JS... Phần diễn giải dùng
template"). Coi phần YÊU CẦU chi tiết (khớp với README) là chỉ dẫn chính thức — **đã build KHÔNG
gọi AI**, toàn bộ tra bảng + công thức xác định, template tiếng Việt viết sẵn. Nếu ý anh khác, báo
lại để nối thêm lớp AI-diễn-giải sau (kiến trúc đã tách sẵn: JS tính toán ở
`@thien-anh/rule-engine`, phần hiển thị ở component — nối AI vào sau không phải viết lại lõi).

## 1. Tái sử dụng engine có sẵn (nguyên tắc bao-trùm)

Trước khi viết engine mới đã rà codebase: **Cung Phi + Du Niên Bát Quái đã có sẵn, chính xác 100%**
tại `packages/rule-engine/src/cung-menh-bat-trach/` (dùng chung cho "chọn tuổi kết hôn", "tuổi hợp
làm ăn", "xông đất", "ngày giờ xuất hành" — cùng nguồn skill `bat-trach-luan-nha`). Đã **tái sử
dụng trực tiếp**, không viết lại: `calculateCungPhi`, `getKhiBatTrach`, `DU_NIEN_BAT_QUAI`, và
`thaiTueTamSat.ts` (Thái Tuế/Tuế Phá/Tam Sát theo phương vị). Toàn bộ phần mới (data/03, 04, 05,
06, 07, 08, 09) build mới tại `packages/rule-engine/src/bat-trach-nha/`.

## 2. 3 cờ cấu hình MĐ-1/2/3 — đã làm đúng yêu cầu (`packages/rule-engine/src/bat-trach-nha/config.ts`)

- `luanHopMenhTheo`: `'huong'` (mặc định) | `'toa'`.
- `sinhKhacCungSao`: `'A'` | `'B'` | `'theoNguCanh'` (mặc định — dùng cả 2 theo ngữ cảnh).
- `xuyenCungTang1`: `'duNienToaMon'` (mặc định) | `'theoViDuSach'`.

Không hardcode rải rác — đổi mặc định chỉ cần sửa `DEFAULT_BAT_TRACH_CONFIG` ở 1 chỗ. Trang
`/kiem-chung` có 3 công tắc đổi trực tiếp trên giao diện, không cần deploy lại.

## 3. Open questions từ `data/01` — CHƯA đối chiếu được (cần anh tự kiểm)

- **Mốc Lập Xuân vs Dương lịch:** build theo mặc định gói (Dương lịch trực tiếp, đúng bản skill
  anh đang dùng tay) — `calculateCungPhi` không đổi gì ở đây (đã có sẵn, đã đúng).
- **Khóa cung phi cho năm sinh ≥ 2000:** vẫn dùng chung 1 khóa 11/4 cho mọi năm (không tách theo
  thế kỷ) — đúng theo skill hiện tại.
- README yêu cầu "chạy đối chiếu vài tuổi sinh 2000–2024 với bảng Công vẫn dùng tay" — **việc này
  em KHÔNG tự làm được** vì không có "bảng Công dùng tay" để đối chiếu tự động. Anh dùng trang
  `/dai-cat-loi/xem-huong-nha-bat-trach/kiem-chung` nhập vài ca sinh 2000-2024 rồi tự so với cách
  tính tay của mình.

## 4. Nghi vấn số liệu Hoàng Tuyền (`data/05` mục 1) — đã tự chọn cách xử lý, KHÔNG bịa số

`data/05` ghi dòng "Tốn | Bính" (chỉ 1 sơn) nhưng dòng đối xứng "Ất, Bính | Tốn" lại ghi 2 sơn —
không đối xứng như 3 nhóm còn lại (Khôn/Cấn/Càn đều đủ 2 sơn cả 2 chiều). Đã dùng dòng đầy đủ hơn
(Ất, Bính) cho cả 2 chiều, giữ cấu trúc 4 nhóm Tứ Lộ Hoàng Tuyền đối xứng nhất quán — **không tự
thêm số liệu mới, chỉ chọn giữa 2 dòng sẵn có trong chính data/05**. Xem
`packages/rule-engine/src/bat-trach-nha/hungSat.ts` (đầu file có ghi lại nguyên văn nghi vấn này).

## 5. `data/05` mục 3 (Trực Thái Tuế/Tam Hợp) — cột tên ghép Quái+Chi KHÔNG suy diễn lại

Cột "Trực Thái Tuế"/"Tam Hợp" trong data/05 ghi dạng "Cấn Dần", "Khôn Thân"... — không phải Can-Chi
năm thực (vì 1 Chi không cố định đi cùng 1 Can, vd năm Tý không phải lúc nào cũng là Nhâm Tý).
Nhiều khả năng đây là quy ước ghi sơn trên la bàn 24 sơn, không phải phát biểu Can-Chi năm — em
**không suy diễn lại cột đó**. Phần thực dùng được (phương vị Thái Tuế/Tuế Phá/Tam Sát theo Chi
năm) đã có sẵn, đã kiểm chứng trong hệ thống, dùng trực tiếp. Nếu anh biết rõ ý nghĩa cột đó, báo
lại để bổ sung.

## 6. Đô Thiên (`data/05` mục 4) — quy ước tính Can năm sinh

Đô Thiên tính theo "Can năm sinh gia chủ", nhưng form chỉ thu thập NĂM sinh (không thu thập ngày
sinh đầy đủ) — nên không thể áp ranh giới Lập Xuân chính xác. Đã dùng quy ước "năm con giáp đại
chúng" (ranh giới 1/1 Dương lịch) — **đúng cách đã dùng sẵn trong codebase** cho tình huống giống
hệt (`packages/rule-engine/src/scoring/tuoiHopLamAn.ts`), không phải tự bịa cách mới.

## 7. Xuyên Cung Cửu Tinh (`data/07`) — đã "bỏ chặn, cho build" theo `data/00` MĐ-3

- **Khả năng 1 (mặc định):** Tầng 1 = khí Du Niên Tọa×Môn — tính được cho MỌI tổ hợp Tọa/Môn.
- **Khả năng 2 (đối chiếu):** nguồn CHỈ có đúng 1 ví dụ xác thực (Tọa Khảm/Môn Tốn → sách ghi Tầng
  1 = Thiên Y, lệch với Khả năng 1 tính ra Sinh Khí) — **không đủ dữ liệu để suy ra quy luật chung
  cho tổ hợp khác**. Engine chỉ hiện Khả năng 2 đúng cho tổ hợp Khảm/Tốn (2 chiều); mọi tổ hợp khác
  chỉ hiện Khả năng 1 kèm dòng "chưa có ví dụ đối chiếu" — không suy diễn để lấp.
- Giới hạn công cụ ở **tối đa 10 tầng** theo khuyến nghị data/07 mục 5 (bảng 11-15 tầng bị OCR lộn
  cột, không đọc được chắc chắn).

## 8. Phần thiếu dữ liệu nguồn — để trống "đang bổ sung", không suy diễn

- **Thiên Tinh Ca (`data/08`):** chỉ 13/24 thiên tinh gán chắc chắn vào khí. 11 sao còn lại
  (Phụ Dực, Tiến Hiền, Khai Dương, Tòng Quan, Thiên Xu, Thiên Tiết, Thiên Tôn, Thiên Phong, Thiên
  Củng, Hàm Trì, Tư Quái) chưa đưa vào — engine chỉ hiện phần đã chắc, phần thiếu không hiển thị gì
  thay vì đoán.
- **Bảng 25 tổ hợp sinh khắc (`data/06` mục 3):** 3 ô của sao Phá Quân (nhóm Kim, quan hệ "sao khắc
  cung" tại Chấn/Tốn, "cung khắc sao" tại Ly, "cung sinh sao" tại Cấn/Khôn) không có mô tả riêng
  trong nguồn — để trống.

## 9. Phạm vi KHÔNG build (nằm ngoài README build order chính)

- **Lưu niên/Nguyệt vận đầy đủ + nhánh mở rộng** (so tuổi vợ chồng, chọn tháng cưới — ADDENDUM mục
  2): chỉ build phần Thái Tuế/Tuế Phá/Tam Sát + Đô Thiên theo năm cần xem (đã đủ cho SPEC-OVERRIDE
  §2 tầng "năm cần xem"). Phần "niên tinh" đầy đủ theo `references/08-luu-nien-nguyet-van.md` của
  skill gốc CHƯA trích vào gói này nên chưa build — báo nếu anh cần.
- **Phần Chân Pháp không phù hợp số hóa** (ADDENDUM mục 4: bố cục 3 chiều, luận 64 tổ hợp Cửa-Chủ-
  Bếp, luận an táng) — đúng theo khuyến nghị gói build, không đưa vào công cụ, để làm nội dung dẫn
  phễu tư vấn 1-1 (CTA cuối trang đã có sẵn cơ chế này).

## 10. Phạm vi Cửa–Chủ–Bếp trong Tam Yếu — độ chính xác 8 cung (không phải 24 sơn)

`data/04` chỉ cần biết "cung của Cửa/Chủ/Bếp" (1 trong 8 phương) để tra Du Niên — không cần độ số
chính xác tới sơn. Form nhập 3 trường này bằng chọn nhanh 8 hướng (hiển thị nhãn hướng địa lý dễ
hiểu, tự quy đổi sang tên Cung Bát Quái trước khi gửi lên server).

## 11. Hoàng Tuyền/Bát Sát ở tầng tối thiểu — chỉ mang tính THÔNG TIN, không phải "phạm hay không"

`data/05` yêu cầu độ chính xác tới sơn 15° để KIỂM TRA phạm hay không so với 1 điểm cụ thể (cổng
phụ, đường nước...) — nhưng tầng tối thiểu chỉ thu thập hướng nhà, không thu thập vị trí cổng
phụ/đường nước cụ thể. Engine hiển thị đúng như bảng gốc: "hướng này cần tránh đặt cổng/đường nước
tại sơn nào" (thông tin cảnh báo), KHÔNG kết luận "phạm" hay "không phạm" vì thiếu input để so.

## 12. Quyết định về đường dẫn + hiển thị (chưa đưa vào menu công khai)

- Trang chính: `/dai-cat-loi/xem-huong-nha-bat-trach` — admin-only (middleware.ts + trang + API đều
  tự kiểm tra, 3 lớp phòng thủ).
- Trang kiểm chứng: `/dai-cat-loi/xem-huong-nha-bat-trach/kiem-chung` — admin-only, KHÔNG link từ
  đâu (đúng yêu cầu README "chủ site tự vào").
- **CHƯA thêm vào** `src/lib/dai-cat-loi-tools.ts` (registry công khai dùng cho trang liệt kê công
  cụ + tìm kiếm) và **CHƯA thêm vào** menu điều hướng — cố ý, vì đang giai đoạn admin-only; thêm
  link công khai lúc này sẽ khiến khách thường bấm vào rồi bị đá về trang chủ, trông như lỗi. Khi
  mở bán/mở dùng thật: (1) xóa 3 khối admin-check (middleware.ts dòng ~41-49, trang .astro, API
  route), (2) thêm vào `dai-cat-loi-tools.ts`, (3) cân nhắc thêm vào menu điều hướng.

## 13. Kiểm thử

`packages/rule-engine/tests/unit/bat-trach-nha/` — 39 test mới (tổng package: 77 test, đều pass),
gồm: 4 ca cung phi mẫu (data/01), đối xứng Du Niên + kiểm toán độc lập từ biến hào (data/02), ca
mẫu bắt buộc SPEC §5 (Nam 1989 × hướng Nam = Lục sát, không hợp mệnh — **đã xác nhận đúng cả trên
UI thật**), kiểm toán Sinh khắc Cung–Sao port lại chính xác 2 script Python trong gói build (phương
án A: 8/8 + 4/6; phương án B: 3/8 + 6/6 — khớp tuyệt đối với kết quả chạy Python gốc), 2 ví dụ Xuyên
Cung Cửu Tinh, quy đổi độ số/24 sơn, Hoàng Tuyền/Bát Sát, và tích hợp toàn luồng qua `engine.ts`.

Đã tự kiểm tra thủ công trên UI thật (bật tạm admin-gate để test cục bộ rồi khôi phục lại) — toàn
bộ 4 lớp lũy tiến (tối thiểu → Tam Yếu → Xuyên Cung → Lưu niên) hoạt động đúng, khớp tay với ca mẫu
SPEC.
