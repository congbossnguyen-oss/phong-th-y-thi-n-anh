# TUVI ENGINE — AUDIT ĐỘC LẬP

Phạm vi: `src/lib/tu-vi/rules.ts`, `src/lib/tu-vi/engine.ts`, `tests/tu-vi-golden.test.ts`, đối chiếu với
`TuVi_Engine_V2.md` (50 mục). Audit này **không sửa code**, chỉ phân loại và báo cáo, theo đúng yêu cầu.

Quy ước:
- **VERIFIED** — có ít nhất 1 Golden Master độc lập xác nhận giá trị đầu ra cụ thể.
- **DERIVED** — có công thức/bảng (từ spec hoặc từ kiến thức phổ biến), chạy đúng logic, nhưng KHÔNG có
  Golden Master xác nhận giá trị đầu ra.
- **UNVERIFIED** — có implement nhưng chưa đủ dữ liệu để xếp loại VERIFIED hay DERIVED có cơ sở (ví dụ:
  logic tự nghĩ ra không bám theo công thức spec nào).
- **MISSING** — spec yêu cầu nhưng chưa implement.

---

## KẾT LUẬN NGAY (đọc trước khi vào chi tiết)

**107/107 test pass KHÔNG phải bằng chứng độc lập.** Toàn bộ 36 test trong `tu-vi-golden.test.ts` dùng
**cùng một** instance `chart = tinhTuVi(GOLDEN_MASTER_#001)` ở module scope (dòng 9) — không có test nào
dùng lá số thứ hai. Đây là 1 điểm dữ liệu duy nhất, không phải 36 điểm độc lập.

**Phát hiện 3 lỗi/xung đột cụ thể trong quá trình audit** (xem mục E) — không phải nghi vấn "có thể sai",
mà là chứng minh được bằng cách đọc code:
1. Tứ Hóa Hóa Khoa/Hóa Kỵ bị **rơi mất hoàn toàn** khỏi hiển thị theo sao khi ngôi sao đích là phụ tinh
   (Văn Xương/Văn Khúc/Hữu Bật/Tả Phù) — ảnh hưởng **5/10 Can năm sinh** (Bính, Mậu, Kỷ, Tân, Nhâm).
2. Thiên Việt được tính bằng **đúng phép đối xứng mà spec cấm rõ ràng** ("Không tính Thiên Việt bằng
   phép đối xứng tự phát" — mục 19), nhưng code tính `Việt = Khôi + 6` cho cả 5 cặp Can.
3. `tinhMenhQuai` có lỗi biên: nhánh Nam trước năm 2000 dùng `if (so <= 0)` thay vì vòng lặp, nên năm
   sinh có 2 số cuối là "00" (VD 1900, 1800) sẽ cho `so = 10` — không khớp bảng tra (1-9), trả về
   `undefined`. Không kích hoạt trong khoảng năm UI hiện cho chọn (1927-2026) vì năm 2000 rơi vào nhánh
   thế kỷ 21 (an toàn), nhưng là lỗi thật trong hàm.

---

## A. RULES ĐÃ VERIFIED (có Golden Master #001 xác nhận trực tiếp)

| # | Rule | Giá trị Golden Master xác nhận |
|---|---|---|
| 1 | Âm lịch (solarToLunar) | 21/7/1980 |
| 2 | Năm Can Chi + Âm Dương | Canh Thân, Dương Nam |
| 3 | Cục (Ngũ Hành Cục qua Nạp Âm cung Mệnh) | Thổ Ngũ Cục |
| 4 | Bản Mệnh (Nạp Âm năm sinh) | Thạch Lựu Mộc |
| 5 | Mệnh Quái — **chỉ nhánh Nam, thế kỷ 20** | Khôn |
| 6 | Chủ Mệnh / Chủ Thân — **chỉ 1 điểm Dần** | Liêm Trinh / Thiên Lương |
| 7 | An Mệnh, An Thân (công thức, tại month=7 hour=Ngọ — đúng bằng Golden Master §5.4 chỉ định) | Dần (đồng cung) |
| 8 | 12 cung: tên cung theo Chi | đủ 12/12 khớp bảng §37 |
| 9 | Vị trí Tử Vi + Thiên Phủ (nhánh dư CHẴN của công thức An Tử Vi) | Tuất / Ngọ |
| 10 | 14 chính tinh: vị trí (chi) | đủ 14/14 khớp |
| 11 | 14 chính tinh: trạng thái Miếu/Vượng/Đắc/Hãm — **chỉ 13/168 ô** (Tử Vi@Tuất không có nhãn trong ảnh mẫu) | đủ 13 ô khớp |
| 12 | Tứ Hóa — **chỉ Can Canh** | Thái Dương=Lộc, Vũ Khúc=Quyền, Thái Âm=Khoa, Thiên Đồng=Kỵ |
| 13 | Đại Vận: hướng (chỉ Dương Nam), tuổi khởi Mệnh = số Cục, mốc Quan Lộc | 5 / 45-54 |
| 14 | Tuổi năm xem | 47 (năm 2026) |

Ghi chú quan trọng: mục 7 (An Mệnh/Thân) là **công thức thuần túy** (không tra bảng), và công thức trong
code khớp **từng ký tự** với pseudocode spec §5.1-5.3 (`monthPalace = normalize12(2+(lunarMonth-1))`,
`menhIndex = normalize12(monthPalace - hourBranchIndex)`) — rủi ro sai thấp hơn nhiều so với các bảng tra
cứu, nhưng **vẫn chỉ được xác nhận tại đúng 1 điểm dữ liệu** (month=7, giờ Ngọ) vì đó là toàn bộ những gì
Golden Master #001 cung cấp.

---

## B. RULES CHỈ DERIVED (có công thức nhưng không có Golden Master)

### B1. Bám sát văn bản spec (transcription 1:1 — rủi ro thấp nhất trong nhóm DERIVED)
- Lộc Tồn theo Can năm (§18) — khớp bảng spec từng dòng.
- Văn Xương/Văn Khúc theo giờ (§20) — khớp pseudocode spec từng ký tự.
- Tả Phù/Hữu Bật theo tháng (§21) — khớp pseudocode spec từng ký tự.
- Thiên Khôi theo Can năm (§19) — khớp bảng spec (**riêng Thiên Việt xem mục E, không cùng nhóm này**).
- Tràng Sinh: bảng điểm khởi theo Cục (§27) — khớp bảng spec; **chiều chạy** không có căn cứ từ spec
  (spec chỉ nói "phụ thuộc Âm Dương... theo profile", không nói profile đó có trùng `daiVanDirection`
  hay không) → code tái dùng chung biến hướng với Đại Vận, là 1 giả định chưa được spec xác nhận.
- Thái Tuế: tên 12 sao (§26) khớp spec; **chiều chạy "luôn thuận"** là giả định tự thêm, spec chỉ nói
  "phải được cấu hình thành profile" chứ không cho giá trị mặc định.
- Triệt: 5 nhóm Can đúng theo spec §32, nhưng **cặp Chi cụ thể cho mỗi nhóm hoàn toàn không có trong
  spec** — bảng `TRIET_TABLE` là tự bổ sung từ kiến thức phổ biến, không phải transcription.
- Tuần: công thức Tuần Không tái dùng từ `bat-tu.ts` (`khongVongIndicesOf`), áp dụng cho **Can Chi NĂM**
  — spec §31 chỉ nói "từ Can Chi năm/ngày" (mơ hồ, không chọn rõ), code tự chọn "năm" mà không báo
  RULE_CONFLICT.

### B2. Không có trong spec, thêm từ kiến thức phổ biến (rủi ro cao hơn)
- Ngũ Hổ Độn (Can tại Dần theo Can năm) — spec không cho bảng này, đây là kiến thức chuẩn phổ biến.
  **Riêng giá trị Canh→Mậu được xác nhận GIÁN TIẾP** qua Cục (nếu sai, Cục sẽ không ra Thổ Ngũ Cục) — 9
  giá trị Can còn lại (Giáp, Ất, Bính, Đinh, Mậu, Kỷ, Tân, Nhâm, Quý) hoàn toàn chưa được xác nhận.
- Chủ Mệnh / Chủ Thân (11/12 ô còn lại ngoài Dần) — **cảnh báo riêng**: bảng này được chọn bằng cách thử
  nhiều phiên bản nhớ khác nhau cho tới khi khớp đúng 1 điểm Dần đã biết trước (xem lịch sử phiên làm
  việc) — đây là kiểu chọn có nguy cơ "khớp ngẫu nhiên 1 điểm" cao hơn một bảng được nhớ chắc chắn ngay
  từ đầu. Độ tin cậy của 11 ô còn lại **thấp hơn** mức DERIVED thông thường.
- Mệnh Quái — công thức Bát Trạch phổ biến; nhánh Nữ và nhánh thế kỷ 21 (cả Nam lẫn Nữ) hoàn toàn chưa
  kiểm chứng, và có lỗi biên đã nêu ở phần Kết luận.
- Địa Không / Địa Kiếp — **spec KHÔNG cho công thức cụ thể** (chỉ nói phải có rule riêng, cấm suy từ
  Tuần). Điểm khởi Hợi + hướng đối nghịch là 100% từ kiến thức phổ biến, không bám spec nào.
- Hỏa Tinh / Linh Tinh — **spec KHÔNG cho bảng cụ thể** (chỉ liệt kê tên nhóm tam hợp, yêu cầu tự lập
  bảng). Đây là phụ tinh có nhiều dị bản nhất giữa các phái theo chính ghi chú trong code — rủi ro cao
  nhất trong toàn bộ engine.
- Thiên Mã, Đào Hoa, Hồng Loan, Thiên Hỷ — Thiên Mã có công thức trong spec §24 (khớp), nhưng **Đào Hoa/
  Hồng Loan/Thiên Hỷ hoàn toàn không có trong danh sách phụ tinh của spec** (xem mục D — đây là phụ tinh
  tự thêm ngoài phạm vi, trong khi 1 phụ tinh spec **có** yêu cầu — Thiên Hình — lại chưa làm).

---

## C. RULES UNVERIFIED (không đủ căn cứ để xếp DERIVED có cơ sở)

- **Đại Vận cho Âm Nam / Dương Nữ / Âm Nữ** — công thức hướng (`isThuan`) bám đúng quy tắc chuẩn nêu ở
  spec §28.1, nhưng Golden Master #001 chỉ là Dương Nam nên 3/4 tổ hợp Âm Dương × giới tính hoàn toàn
  chưa có điểm dữ liệu nào để đối chiếu (kể cả gián tiếp).
- **Kình Dương / Đà La**: code dùng `locTonIdx + 1` / `locTonIdx - 1`. Spec §18 viết rõ: *"Không dùng dấu
  +1/-1 cho tới khi đã khóa orientation."* — code làm đúng điều spec cảnh báo trước là không nên làm, mà
  không có bước "khóa orientation" nào được thực hiện trước đó. Xếp UNVERIFIED chứ không phải DERIVED vì
  đây không phải suy ra từ 1 quy tắc đã được xác lập, mà là chọn dấu tùy tiện đúng như spec cảnh báo.
- **12 Can của 12 cung** (`canName` mỗi cung) — có công thức (mở rộng tuyến tính từ Ngũ Hổ Độn), tự nhất
  quán khi kiểm tra bằng tay, nhưng **0/12 giá trị Can-cung có trong bất kỳ test nào** dù spec §7 yêu cầu
  rõ: *"Golden Master phải kiểm tra toàn bộ 12 Can cung."* Đây là 1 khoảng trống kiểm định trực tiếp vi
  phạm yêu cầu của chính spec.

---

## D. RULES MISSING (spec yêu cầu nhưng chưa implement)

| Mục spec | Nội dung | Ghi chú |
|---|---|---|
| §10 | Mệnh Quái là module riêng, có test riêng | Có implement nhưng **không có test riêng** (không test nào assert `chart.menhQuai` ngoài 1 case trong golden test) |
| §25 | Thiên Hình (Dậu=tháng1, chạy thuận — spec cho công thức cụ thể) | **Chưa implement**, dù spec cho sẵn công thức |
| §25 | Thiên Diêu, Thiên Y | Chưa implement (spec không cho công thức, đúng ra phải RULE_NOT_DEFINED chứ không phải bỏ qua im lặng) |
| §29 | Tiểu Hạn (module độc lập) | Chưa implement |
| §30 | Lưu Niên + tiền tố `L.` cho sao lưu (Tứ Hóa lưu niên, Lộc Tồn lưu niên, Kình Dương lưu niên...) | Chưa implement |
| §33-35 | `StarDefinition`/`StarInstance` với `category`, `polarity`, `sourceRule` tường minh | Chưa có — code hiện tại không phân loại sao theo Cát/Sát/Tạp tinh, không có `sourceRule` truy vết |
| §36 | JSON output chuẩn (`meta.engineVersion`, `meta.profile`, `input`, `calendar`, `thienBan`, `palaces`) | `TuViChart` hiện tại là 1 shape tự chọn, KHÔNG khớp schema spec (tên field khác, thiếu `meta`, thiếu tách `calendar` riêng khỏi `thienBan`) |
| §39.1, 39.3, 39.4 | Invariant test: 12 cung không trùng branch/tên; mỗi Can có đúng 4 Hóa; Mệnh/Thân tồn tại | Chưa có test tường minh (chỉ §39.2 - 14 chính tinh và §39.5 - Đại Vận liên tục có test) |
| §40 | Hệ thống Profile (`TuViProfile`, `profile.mainStarStatusTable`, `profile.tuHoaTable`...) | Chưa có tầng trừu tượng Profile — mọi bảng hard-code thẳng vào `rules.ts`, không đổi được profile mà không sửa code |
| §48 | `RULE_CONFLICT_REPORT` có cấu trúc (ruleId/currentProfile/source/observedDifference/decisionRequired) | Chỉ có 1 xung đột (Liêm Trinh -7/-8) được ghi lại dưới dạng comment prose, không đúng format; 2 xung đột mới phát hiện trong audit này (Tả Phù/Tả Phụ, symmetry Thiên Việt) **chưa từng được báo cáo** trước đây |
| — | Đào Hoa, Hồng Loan, Thiên Hỷ | Ngược lại với các mục trên: đây là phần **THÊM ngoài phạm vi spec**, không phải thiếu — liệt kê ở đây để đối chiếu, vì nó lấy chỗ ưu tiên đáng lẽ dành cho Thiên Hình (mục spec thật sự yêu cầu) |

---

## E. CÁC ĐIỂM CÓ NGUY CƠ SAI (xếp theo mức độ nghiêm trọng)

### E1 — XÁC NHẬN LÀ LỖI (không phải nghi vấn)

**1. Tứ Hóa bị rơi mất khi đích là phụ tinh — ảnh hưởng 5/10 Can năm sinh.**
`PhuTinhO` (engine.ts) chỉ có field `{ name: string }`, không có `tuHoa`. Vòng lặp gắn Tứ Hóa
(`tuHoaGan`, engine.ts dòng ~172-177) chỉ duyệt `chinhTinhTaiChi`, không duyệt `phuTinhTaiChi`. Đối chiếu
bảng Tứ Hóa (`TU_HOA_TABLE`) với danh sách 14 chính tinh, các Can sau có ít nhất 1 trong 4 Hóa trỏ tới
sao KHÔNG nằm trong 14 chính tinh (tức là phụ tinh, không bao giờ được gắn `tuHoa`):
- Bính: Hóa Khoa → Văn Xương (phụ tinh)
- Mậu: Hóa Khoa → Hữu Bật (phụ tinh)
- Kỷ: Hóa Kỵ → Văn Khúc (phụ tinh)
- Tân: Hóa Khoa → Văn Khúc, Hóa Kỵ → Văn Xương (CẢ HAI đều phụ tinh)
- Nhâm: Hóa Khoa → Tả Phù (phụ tinh)

`chart.tuHoa.{loc,quyen,khoa,ky}` (chuỗi tên sao ở cấp lá số) vẫn đúng cho cả 10 Can — chỉ riêng phần
**gắn nhãn L/Q/K/H lên từng sao trong từng cung** (`ChinhTinhO.tuHoa`, hiển thị trên UI dạng số mũ màu đỏ)
là bị mất, và chỉ mất đối với 5 Can này (không mất với Giáp/Ất/Đinh/Canh/Quý).

**2. Thiên Việt tính bằng đúng phép mà spec cấm.**
Spec §19: *"Thiên Việt dùng bảng đối ứng riêng của profile. Không tính Thiên Việt bằng phép đối xứng tự
phát."* Kiểm tra `KHOI_VIET_TABLE`: với cả 5 cặp Can, giá trị Việt = giá trị Khôi + 6 (đối cung tuyệt
đối) — Giáp: Khôi=Dần(2)→Việt=Thân(8), lệch đúng 6; Bính: Thìn(4)→Tuất(10), lệch 6; Mậu: Ngọ(6)→Tý(0),
lệch 6; Canh: Thân(8)→Dần(2), lệch 6; Nhâm: Tuất(10)→Thìn(4), lệch 6. Đây chính xác là "phép đối xứng tự
phát" mà spec liệt kê tên và cấm cụ thể. Vi phạm trực tiếp, không phải suy diễn.

**3. `tinhMenhQuai` — lỗi biên nhánh Nam trước năm 2000.**
```
so = isTheKy21 ? 9 - sum : 10 - sum;
if (so <= 0) so += 9;   // chỉ sửa khi so <= 0, KHÔNG sửa khi so > 9
```
Khi `sum = 0` (năm sinh có 2 số cuối = "00": 1900, 1800...) và `isTheKy21 = false`, `so = 10`, không rơi
vào điều kiện `so <= 0` nên giữ nguyên 10 — không có khóa nào trong `MENH_QUAI_SO_TO_NAME` (bảng chỉ có
1-9), trả về `undefined`. Nhánh Nữ dùng `while (so > 9) so -= 9` nên không bị lỗi tương tự. **Không kích
hoạt trong khoảng năm mà UI hiện cho chọn (1927-2026)** vì năm tròn trăm duy nhất trong khoảng đó là 2000,
rơi vào nhánh thế kỷ 21 (an toàn, `so = 9`) — nhưng hàm vẫn sai nếu gọi trực tiếp với năm 1900/1800.

### E2 — Xung đột chưa từng báo cáo (phát hiện lần đầu qua audit này)

**4. "Tả Phụ" (spec §17, bảng Tứ Hóa của Nhâm) vs "Tả Phù" (spec §21, tên chuẩn dùng xuyên suốt phần
còn lại của spec, và dùng xuyên suốt code).** Nhiều khả năng là lỗi đánh máy trong chính văn bản spec,
nhưng đây đúng nghĩa là 1 xung đột nội bộ trong tài liệu nguồn mà lẽ ra phải được báo cáo dạng
RULE_CONFLICT_REPORT (mục 48) trước khi tự động chuẩn hóa về "Tả Phù" — việc này **chưa từng được báo
cáo** cho tới audit này.

### E3 — Rủi ro do cách chọn dữ liệu (không phải lỗi logic, mà là rủi ro phương pháp)

**5. Chủ Mệnh/Chủ Thân được chọn bằng "thử nhiều bảng nhớ tới khi khớp 1 điểm đã biết"** — xem mục B2.
Cách làm này có xu hướng tạo cảm giác "đã xác minh" mạnh hơn thực tế, vì 1 điểm dữ liệu luôn có thể khớp
ngẫu nhiên với nhiều bảng khác nhau.

**6. Toàn bộ 154/168 ô Miếu/Vượng/Đắc/Bình/Hãm** ngoài 13 ô đã xác nhận — nếu bất kỳ ô nào trong 154 ô
này sai, sẽ không có cơ chế nào phát hiện ra cho tới khi có Golden Master mới, vì test hiện tại không thể
phát hiện (không kiểm tra các ô đó).

---

## F. CÁC GOLDEN MASTER CẦN BỔ SUNG (thứ tự ưu tiên)

1. **1 lá số Âm Nữ hoặc Dương Nữ** bất kỳ, có đủ: 14 chính tinh + trạng thái, Đại Vận (để xác nhận hướng
   Đại Vận cho Nữ — hiện 100% chưa kiểm chứng), Can 12 cung (để lấp khoảng trống mục C).
2. **1 lá số Âm Nam** bất kỳ (để xác nhận hướng Đại Vận nghịch — golden master hiện tại chỉ có Dương Nam
   = hướng thuận).
3. **1 lá số có Can năm sinh khác Canh** (ưu tiên Giáp hoặc Ất) — để xác nhận Ngũ Hổ Độn cho 1 Can khác,
   và xác nhận Tứ Hóa cho ít nhất 1 Can nữa ngoài Canh.
4. **1 lá số có ngày sinh Âm lịch rơi vào nhánh dư LẺ** của công thức An Tử Vi (`buTru` lẻ) — nhánh này
   hiện là DERIVED thuần túy (ghi rõ trong comment cũ), không có nhánh CHẴN nào trùng để tham chiếu chéo.
5. Bất kỳ lá số nào có **hiển thị rõ vị trí Lộc Tồn/Kình Dương/Đà La/Khôi Việt/Tuần/Triệt** trên ảnh — để
   xác nhận toàn bộ nhóm phụ tinh hiện 0% được Golden Master xác nhận.
6. Xác nhận trực tiếp từ người dùng: "Tả Phù" hay "Tả Phụ" mới là tên đúng trong Tứ Hóa của Nhâm (mục E2).
7. Xác nhận: Tuần Không trong Tử Vi tính theo Can Chi **năm** hay **ngày** sinh (spec để mơ hồ ở §31).

---

## G. ĐỀ XUẤT THỨ TỰ KIỂM ĐỊNH TIẾP THEO

1. Sửa (chờ xác nhận người dùng, KHÔNG tự sửa ngay) lỗi E1.1 (Tứ Hóa rơi mất trên phụ tinh) — đây là bug
   logic thuần túy, không phụ thuộc Golden Master mới, có thể sửa ngay khi được duyệt.
2. Xin người dùng xác nhận hướng xử lý E1.2 (Thiên Việt) — cần bảng Thiên Việt thật, không thể tự suy.
3. Sửa lỗi biên E1.3 (`tinhMenhQuai` so=10) — bug thuần túy, sửa được ngay khi duyệt dù chưa ảnh hưởng UI
   hiện tại.
4. Bổ sung Golden Master #002 (ưu tiên 1 lá số Nữ) — mở khóa kiểm định cho toàn bộ nhánh Nữ/Đại Vận
   nghịch/Can 12 cung.
5. Viết test tường minh cho §39.1/39.3/39.4 (invariant còn thiếu) — không cần Golden Master mới, chỉ cần
   viết test cho logic đã có.
6. Viết test cho Can 12 cung (đang là khoảng trống trực tiếp vi phạm yêu cầu spec §7).
7. Quyết định: implement Thiên Hình theo đúng công thức spec §25, và quyết định giữ/bỏ Đào Hoa/Hồng
   Loan/Thiên Hỷ (ngoài phạm vi spec).
8. Cân nhắc bổ sung tầng Profile (§40) nếu có kế hoạch làm thêm trường phái khác trong tương lai — nếu
   không, có thể chấp nhận bỏ qua mục này vĩnh viễn (không phải rủi ro tính đúng sai, chỉ là kiến trúc).
9. Tiểu Hạn + Lưu Niên (§29-30) — khối lượng lớn nhất còn lại, nên làm sau khi các lỗi ở trên đã xử lý.

---

## KẾT LUẬN

**ENGINE NOT READY FOR COMMIT**

Lý do: audit phát hiện **3 lỗi/vi phạm xác nhận được** (không phải nghi vấn) — Tứ Hóa rơi mất trên 5/10
Can, Thiên Việt vi phạm trực tiếp điều spec cấm rõ ràng, và lỗi biên trong `tinhMenhQuai`. Ngoài ra spec
yêu cầu tường minh "Golden Master phải kiểm tra toàn bộ 12 Can cung" (§7) nhưng hiện có 0 test cho việc
này. 107/107 test pass chỉ phản ánh 1 điểm dữ liệu (Golden Master #001), không đủ để kết luận engine
đúng theo specification trên diện rộng.
