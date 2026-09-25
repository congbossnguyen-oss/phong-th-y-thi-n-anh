# PHASE 10D — GOLDEN CASE VALIDATION: Hao Strength + Tam Hợp

Đối chiếu `canLucHao()` (Phase 10C) với bộ **153 án lệ Lục Hào thực tế** (Vương Hổ Ứng, Chương 17) trong
`src/lib/quan-su/kien-thuc/an-le/chunk-01..08.md`. Đây là phase **kiểm chứng**, không phải phase sáng tạo rule.

> Nguyên tắc: methodology đã khóa → engine → output → **đối chiếu** án lệ. KHÔNG "fit" án lệ (không sửa rule
> để ra kết quả giống án lệ). Mismatch được **phân loại**, không tự vá.

---

## 1. Scope
Kiểm `canLucHao(cast, hao)` + `HaoStrengthState` (baseForce 7-case, trục temporal/transformation/break/year)
và 6 thể Tam Hợp (`phanLoaiSauTamHop`) so với diễn biến + kết luận vượng/suy mà **chính án lệ khẳng định**.

## 2. Dataset
- Nguồn: 8 file `an-le/chunk-01..08.md` (153 case, đúng thứ tự sách gốc). `00-INDEX.md` phân loại theo chủ đề.
- Mỗi case: Bối cảnh · Quẻ & Dụng thần · Phân tích cốt lõi · Hóa giải · Kết quả. **Nhật/Nguyệt luôn có**; kết
  luận vượng/suy nêu bằng lời (vd "Nguyệt phù Nhật không khắc là vượng tướng", "suy vượng tương đương").

### Giới hạn dữ liệu (quan trọng)
Án lệ **không** ghi bộ gieo (coin tosses) / cấu trúc 6 hào đầy đủ ⇒ **không thể dựng `FullCastResult`
tự động** cho từng case. Do đó validation là **đối chiếu FACT do án lệ khẳng định ↔ rule mà `canLucHao`
cài**, không phải chạy engine trên 153 quẻ. Đây là cách kiểm chứng khả thi duy nhất với dữ liệu prose.

## 3. Number of usable cases
- **Total: 153.**
- **Usable (nêu rõ Nhật + Nguyệt + kết luận vượng/suy hoặc động/biến/Không Vong/Mộ/Phá): ~140.**
- **Skipped: ~13** — lý do: đoạn bị cắt trang / prose luận không có quẻ (vd "Năng lượng của vật hóa giải đã
  đi đâu" chunk-03; "Có liên quan đến một sợi dây màu đỏ" chunk-02 cụt; các case sát mép trang thiếu "Kết quả").
- Theo cho phép của Phase 10D ("không cần ép tất cả 153"), báo cáo dùng **case đại diện** cho mỗi nhóm; tín hiệu
  hiếm được đếm toàn bộ 8 chunk (mục 4).

## 4. Validation methodology
Với mỗi case đại diện: trích FACT án lệ khẳng định (Nhật/Nguyệt sinh-khắc-phù, động/biến, Không Vong, Mộ,
Tuyệt, Phá, Ám Động, Tam Hợp) → suy trạng thái mà rule `canLucHao` sẽ cho → so với vượng/suy án lệ kết luận →
phân loại: **MATCH / IMPLEMENTATION BUG / DATA GAP / SOURCE AMBIGUITY / METHODOLOGY GAP / EXPECTED DIFFERENCE**.

**Phân biệt cốt lõi phát hiện được:** án lệ nói vượng/suy theo **hệ 5 bậc THEO NGUYỆT LỆNH** (Vượng/Tướng/
Hưu/Tù/Tử — chính là `HaoInfo.vuongSuy` engine đã tính & đã test) cộng chỉnh Nhật; còn `baseForce` của Phase 10C
là **tổ hợp HOLISTIC 7-case (Ngày × Tháng)** Thầy khóa. Hai thứ **khác granularity** — nhiều "mismatch" là
EXPECTED DIFFERENCE ở tầng khái niệm, không phải bug. Lưu ý: prompt AI vẫn nhận CẢ `HaoInfo.vuongSuy` (seasonal)
lẫn `HaoStrengthState`, nên tầng seasonal cổ điển không bị mất.

---

## 5. GROUP 1 — Vượng/Suy cơ bản
| Case (ngày, tháng) | FACT án lệ | Rule canLucHao | Kết quả |
|---|---|---|---|
| Không phải là ung thư (Canh Dần, Dần) c02 | hào Thế Dần lâm Nhật+Nguyệt → "vượng tướng" | Chi hào = Chi Ngày/Tháng → **Lâm → Vượng** | **MATCH** |
| Con trai đã mất hại chồng (Quý Hợi, Dậu) c02 | Quan Quỷ "Nguyệt sinh Nhật phù → vượng tướng" | daySupport + monthSinh → **Vượng** | **MATCH** |
| Do u xơ tử cung (Bính Tý, Bính Thìn) c02 | Hợi thủy "Nguyệt khắc Nhật phù → suy vượng tương đương" | Day đồng-hành support + Month khắc → **Trung Hòa** (Case 4) | **MATCH** |
| Có người muốn hại tôi (Đinh Sửu, Mão) c01 | "Nguyệt không phù, Nhật khắc → hưu tù" | day khắc, không support → **Suy** | **MATCH** |
| **Thuốc đến bệnh trừ (Quý Dậu, Tý) c02** | Thê Tài Mão "Nguyệt sinh Nhật khắc → **suy vượng tương đương**" | Month sinh + **Day khắc** → code rơi nhánh khắc → **Suy** | **MISMATCH → GAP-1** |
| Con gái khóc thức giấc (Ất Mùi, Giáp Dần) c01 | Tử Tôn Mão "**Nguyệt phù** Nhật không khắc → vượng tướng" | Month **đồng-hành** (không phải "sinh") → ngoài Case 1-3 → **Trung Hòa** | **MISMATCH → GAP-2** |

## 6. GROUP 2 — Nhật sinh + Nguyệt Phá
- **Con trai đã bắt đầu đi học (Ất Dậu, Hợi) c02:** Tử Tôn Tị hỏa bị "Nguyệt phá" (Hợi xung Tị) nhưng "hào 3
  Mão mộc ám động **sinh Tử Tôn**" → không tuyệt vọng. Khớp methodology: Phá là trục `reduced`, hào động đến
  sinh nâng lực. **MATCH** (baseForce giữ, Nguyệt Phá không = 0).
- Không có case nào cho "Nguyệt Phá ⇒ Suy tuyệt đối" — đúng như Thầy đã khóa.

## 7. GROUP 3 — Hào rất Vượng + Phá
- **Vật hóa giải không thể tùy tiện rửa (Kỷ Tị, Hợi) c02:** "Hào Thế vượng tướng" nhưng Nguyên thần bị Nguyệt
  phá; câu chốt: *"dù không lâm Nhật vẫn tính là Nguyệt phá"* → xác nhận engine đúng: `Nguyệt Phá` = Nguyệt xung
  **vô điều kiện**, và base vẫn giữ (không reset). **MATCH** với `temporalState.nguyetPha` + base không bị 0.
- Muốn viết văn (Đinh Mùi, Dần) c03: Thê Tài Dần "Không Vong + nhập Mộ **nhưng Nguyệt phù vượng tướng**" → base
  mạnh song song với trục Không Vong/Mộ. **MATCH** (base giữ; EMPTY/hidden là trục riêng).

## 8. GROUP 4 — Không Vong
- Muốn viết văn c03; Con trai đã mất hại chồng c02 ("Sửu thổ Không Vong … xung Không thực"); Nhân viên không
  đoàn kết c02 ("tam hợp cục … Hợi thủy Không Vong … Nhật xung phá cục"). Trong mọi case, Không Vong = **chưa
  hiện hữu / chờ xuất Không / bể cục tạm thời**, KHÔNG phải mất lực. Khớp `temporalExistence=EMPTY` tách khỏi
  `baseForce`. **MATCH** (đếm: 59 lần "Không Vong" ở c04-08, rất nhiều ở c01-03 — tất cả nhất quán "delay/thiếu",
  không có case coi Không Vong = lực 0).

## 9. GROUP 5 — Động / biến
| Hóa biến | Case | Kết quả |
|---|---|---|
| Hồi Đầu Sinh | Con trai đã bắt đầu đi học c02 (Tị hóa Mão hồi đầu sinh) | **MATCH** |
| Hồi Đầu Khắc | Chị đã bị trầm cảm c03; Một hạt đậu đen c02 (Nguyên thần hóa hồi đầu khắc) | **MATCH** (đếm 13 lần c04-08; base giữ, `reduced`) |
| Hóa Mộ (changed-line) | Cá nhảy ra khỏi bể c03 (Tị hóa Tuất **nhập Mộ ở hào biến**) | **MATCH** (phân biệt Mộ tĩnh) |
| Hóa Tuyệt | (đếm 3 lần c04-08) — "hóa Tuyệt … vô lực" | **MATCH** (giảm lực, giữ nền) |
| Hóa Tiến/Thoái | tiến 3 / thoái 2 lần c04-08 | **MATCH** (đà lên/xuống) |
- Đặc biệt "base mạnh + biến bất lợi": Không phải là ung thư c02 — "Kỵ Dậu **động nhưng Tuyệt ở Nhật Nguyệt,
  hưu tù vô khí**" → động KHÔNG tự cho lực khi Tuyệt. **MATCH** (Phase 10C không reset máy móc; Tuyệt = vô khí).

## 10. GROUP 6 — Ám Động
- **Con gái táo uất (Tân Mùi, Tị) c03:** Tử Tôn Sửu thổ (Nguyệt Tị sinh Thổ → vượng) bị **Nhật Mùi xung → ám
  động**. Khớp rule `Vượng + Nhật xung → Ám Động`. **MATCH**.
- Chỉ là phong hàn c01 (Ứng Tuất thổ ám động, vượng tướng). Ám động (10 lần c04-08) đều gắn hào **có khí** bị
  Nhật xung; không có case gọi hào **suy** bị Nhật xung là "ám động" (suy → Nhật Phá). **MATCH** với engine
  (`vuongTuong ? Ám Động : Nhật Phá`).

## 11. GROUP 7 — Thái Tuế / Tuế Phá
- **Thái Tuế:** Con trai đã bắt đầu đi học c02 ("Tử Tôn Ngọ lâm **Thái Tuế** … thông tin **năm nay**"); Gặp
  phải vật bẩn thỉu c03 ("hóa **Thái Tuế** … quốc gia"). Cả hai dùng Thái Tuế như **dấu sự việc theo năm**,
  KHÔNG suy ra Vượng. Khớp `yearState.thaiTue` (Thái Tuế ≠ Vượng). **MATCH**.
- **Tuế Phá:** `grep` toàn 8 chunk = **0 occurrence**. → **DATA GAP**: bộ 153 án lệ không có ca Tuế Phá để đối
  chiếu. Rule Tuế Phá (Chi Năm xung Chi hào → suy mạnh, trục reduced) **chưa được validate bằng án lệ**.

## 12. GROUP 8 — Nhập Mộ / Tuyệt
- Nhập Mộ tĩnh: Chỉ là phong hàn c01 (Nguyên thần "nhập Mộ ở Nhật"); Chị bị trầm cảm c03 (hào Thế "nhập Mộ ở
  Nguyệt"). → ẩn/tàng, chờ xung khai. **MATCH** `burialState.nhapMo` + `hidden`.
- Hóa Mộ (changed-line): Cá nhảy ra khỏi bể c03. **MATCH** — phân biệt đúng với Mộ tĩnh (`source CHANGED_YAO`).
- Tuyệt: Không phải là ung thư c02 (Kỵ Tuyệt → vô khí); Cá nhảy c03 ("độc phát **tuyệt** Tử Tôn"). **MATCH**
  (Tuyệt = không lực ở trạng thái đó). Đếm: "nhập Mộ" 32 lần c04-08 — nhất quán "ẩn/tàng, chờ khai".

## 13. GROUP 9 — Tam Hợp
- Án lệ dùng tam hợp chủ yếu là **cục ĐÃ THÀNH**:
  - **TH1-like (đủ, hào động):** phổ biến. Nhân viên không đoàn kết c02, Gặp phải vật bẩn thỉu c03 (cục Quan Quỷ).
  - **TH5-like (2 động + hào biến):** "tam hợp cục 4 hào (quẻ chính và quẻ biến đều tham gia)" — Tiểu hài khóc
    đêm c07:15. **MATCH** khái niệm với `TH5_TWO_MOVING_ONE_TRANSFORMED`.
  - **TH4-like (mượn Nhật/Nguyệt):** cục có chi rơi vào Nhật/Nguyệt (c02, c08 "Thân Tý Thìn").
  - **Cục + Không Vong:** "Tam hợp cục Không Vong, muốn đi cùng đi" c06:79 — khớp ý cục khuyết/chờ kỳ.
- **TH2 (2 động + an tĩnh), TH3 (minh+ám+an tĩnh), TH6 (2 động + Phục Thần):** **KHÔNG có evidence trực tiếp**
  trong 153 án lệ này (taxonomy 6-thể đến từ *nguồn khác* Thầy cấp ở Phase 10C, không phải thư viện Vương Hổ).
  → **DATA GAP** cho TH2/TH3/TH6 trong dataset này (không phải bug — detector vẫn đúng theo nguồn 10C).

## 14. GROUP 10 — Kỵ → Nguyên → Dụng
- **Con trai đã mất hại chồng c02:** chuỗi tường minh *"Huynh Đệ Ngọ hỏa hóa Tử Tôn **sinh Kỵ thần Sửu thổ
  khắc Nguyên thần Thân kim**"* → Kỵ ← được nuôi → tác động Nguyên → Nguyên (sinh Dụng) yếu đi. Án lệ luận theo
  **chuỗi**, đúng tinh thần Phase 10C (không kết luận từng hào rời rạc).
- Anh không ra mồ hôi c01: "Nhật Tý thủy **khắc Nguyên thần** ở hào 5" → Nguyên yếu → Dụng (hào Thế) mất trợ.
- `canLucHao` **cho phép** mô hình chuỗi (mỗi hào Nguyên/Kỵ/Dụng đều có `HaoStrengthState` riêng, prompt xuất cả
  ba + guardrail "xét lực Kỵ trước"). **MATCH** ở mức *khả năng mô hình hóa*; chưa có bước synthesis tự động
  (đúng scope — synthesis còn OPEN từ Phase 10B).

---

## 15. Matches
Nhóm nhất quán với methodology đã khóa (đại diện): **G1** (Lâm→Vượng; Month sinh+Day support→Vượng; Case 4
Trung Hòa; khắc→Suy), **G2/G3** (Nguyệt Phá không = 0; Nguyệt Phá vô điều kiện), **G4** (Không Vong = trục
hiện-hữu riêng), **G5** (hồi đầu sinh/khắc, hóa Mộ/Tuyệt/Tiến/Thoái; động+Tuyệt = vô khí), **G6** (Ám Động =
Vượng+Nhật xung; suy+Nhật xung = Nhật Phá), **G7** (Thái Tuế ≠ Vượng), **G8** (Nhập Mộ tĩnh vs Hóa Mộ; Tuyệt),
**G9** (TH1/TH4/TH5), **G10** (chuỗi Kỵ→Nguyên→Dụng mô hình được). → phần lớn cơ chế Phase 10C **được án lệ xác nhận**.

## 16. Implementation bugs
**0.** Không phát hiện chỗ nào code **trái rule đã khóa**. Các mismatch (mục 18-19) là do rule/nguồn chưa định
nghĩa, KHÔNG phải code cài sai rule → **không sửa code** (đúng §I.5, §VI).

## 17. Data gaps
1. **Tuế Phá** — 0 ca trong 153 án lệ → rule Tuế Phá chưa validate được bằng dữ liệu.
2. **Tam Hợp khuyết TH2/TH3/TH6** — không có trong thư viện Vương Hổ (đến từ nguồn 10C khác) → chưa đối chiếu chéo.
3. **Case 2 "Rất Vượng" (Ngày Nhị Hợp + Tháng sinh)** — không có ca nêu đúng tổ hợp "Nhị Hợp ngày + Tháng sinh"
   để xác nhận nhãn "Rất Vượng" (án lệ chỉ nói "vượng tướng" chung).

## 18. Source ambiguities
1. **Case 6 Tam Hợp** (đã ghi ở Phase 10C: "Hào sinh Tháng + Tháng khắc Hào" mâu thuẫn) — **không tìm thấy án
   lệ khuyết Case 6** trong 153 ca để làm bằng chứng. Giữ **OPEN**, không tự resolve (đúng §X).

## 19. Methodology gaps (cần Thầy quyết định — KHÔNG tự sửa)
### GAP-1 — "một trụ khắc + trụ kia sinh/phù" → án lệ **Trung Hòa**, code cho **Suy**
- Bằng chứng: **Thuốc đến bệnh trừ** (Nguyệt sinh + Nhật khắc → *"suy vượng tương đương"*); tổng **7 ca** dùng
  "suy vượng tương đương/cân bằng" (c01×4, c02×2, c05×1) đều là kiểu **một bên trợ + một bên khắc → cân bằng**.
- Rule hiện tại: `baseForce` có Case 4 (**Day support + Month khắc → Trung Hòa**) nhưng **KHÔNG có case đối
  xứng** "Day khắc + Month sinh/phù". Thêm nữa §IV-C Thầy khóa "Nhật/Nguyệt khắc Hào → Suy" (vô điều kiện) khiến
  code rơi Suy khi **bất kỳ** trụ nào khắc, kể cả khi trụ kia sinh.
- Câu hỏi cho Thầy: khi **một trụ (Ngày HOẶC Tháng) sinh/phù mà trụ kia khắc**, kết luận là **Trung Hòa** (đối
  xứng Case 4, như án lệ) hay giữ **Suy** (theo §IV-C)? Nếu Trung Hòa: cần Thầy khóa "Case 4b: (Ngày khắc +
  Tháng sinh/phù) và (Tháng khắc + Ngày sinh/phù) → Trung Hòa".

### GAP-2 — "Nguyệt phù" (Tháng ĐỒNG HÀNH, không trùng chi) → án lệ **Vượng**, code cho **Trung Hòa**
- Bằng chứng: **Con gái khóc thức giấc** (Tử Tôn Mão, *"Nguyệt Dần phù"* → vượng tướng). "Nguyệt phù" (đồng
  đảng, cùng ngũ hành, KHÁC "Nguyệt sinh") xuất hiện nhiều lần như một nguồn Vượng độc lập.
- Rule hiện tại: Case 1-3 chỉ nhận **Tháng SINH**; đồng-hành chỉ thành Vượng khi **Lâm Nguyệt Kiến (trùng ĐÚNG
  chi)**. "Nguyệt phù" cùng-hành-khác-chi → rơi ngoài 7 case → `Trung Hòa`.
- Giảm nhẹ: engine vẫn xuất `HaoInfo.vuongSuy` (5 bậc theo Nguyệt lệnh, đã tính đồng-đảng = Vượng/Tướng) cho AI,
  nên tầng seasonal cổ điển **không mất**; gap chỉ ở `baseForce`.
- Câu hỏi cho Thầy: Tháng **đồng hành (Nguyệt phù, khác chi)** có phải nguồn **Vượng** trong `baseForce` không
  (bổ sung vào Case 1-3), hay giữ nguyên chỉ "Tháng sinh"?

> Cả GAP-1 và GAP-2: **code đang trung thành với rule Thầy đã khóa**; án lệ cho thấy rule khóa **chưa phủ** hai
> tổ hợp này. Theo §I.7 → **STOP tại đây, báo Thầy**; KHÔNG tự thêm rule.

## 20. EXPECTED DIFFERENCE
- **Granularity seasonal vs holistic:** án lệ "vượng tướng/hưu tù" = 5 bậc theo **Nguyệt lệnh** (= `HaoInfo.
  vuongSuy`, đã test riêng), khác `baseForce` (7-case Ngày×Tháng). Khi hai bên lệch nhãn do khác khái niệm mà
  không thuộc GAP-1/2 → coi là EXPECTED DIFFERENCE, không sửa. AI vẫn nhận cả hai tầng.

---

## Recommended next phase
1. **Thầy quyết GAP-1 & GAP-2** (mục 19). Nếu Thầy khóa → Phase 10E cài Case 4b (đối xứng) và/hoặc "Tháng đồng
   hành → Vượng", kèm regression test + đối chiếu lại 7 ca "suy vượng tương đương".
2. **Tuế Phá & Tam Hợp TH2/TH3/TH6:** tìm nguồn án lệ khác (ngoài Vương Hổ) để validate, hoặc chấp nhận chỉ có
   unit test tổng hợp (Phase 10C) làm bảo chứng.
3. **Case 6 Tam Hợp:** vẫn OPEN — chờ Thầy xác nhận wording.

---

## Decision required (chỉ những việc thực sự cần Thầy)
- **GAP-1:** "(Ngày khắc + Tháng sinh/phù)" và "(Tháng khắc + Ngày sinh/phù)" → **Trung Hòa** hay **Suy**?
- **GAP-2:** "Tháng đồng hành (Nguyệt phù, khác chi)" có là nguồn **Vượng** cho `baseForce` không?
- **Case 6 Tam Hợp:** wording nguồn — giữ cách đọc "Hào sinh Tháng (tiết) → Trung Hòa" hay đổi?

## Code changes
**0 code changes.** (Không có implementation bug; mọi mismatch là methodology gap / data gap / source ambiguity
/ expected difference — theo §VIII chỉ sửa khi code trái rule đã khóa.)

## Tests
- Không sửa code → không thêm test. Baseline xác nhận lại: **Quan Su + Lục Hào 117/117 PASS** (gồm 33 test
  Phase 10C: `__can-luc-hao.test.ts`, `__sau-tam-hop.test.ts`). Full-suite: các fail còn lại nằm ngoài phạm vi
  (worktree `practical-diffie`, `tests/phase2-toa-huong-mo.test.ts` — concurrent, không đụng Lục Hào).

## Commit
`docs(quan-su): validate hao strength against golden cases` — chỉ thêm tài liệu, **no push**.
