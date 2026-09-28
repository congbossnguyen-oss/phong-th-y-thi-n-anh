# Phase 25D — Nhật Xung Effect Decision Brief

**Branch:** `quan-su-thien-anh` · **Nature:** METHODOLOGY DECISION PREP ONLY (neutral brief, no recommendation).
**runtime: NO · tests: NO · spec: NO · scoring/conclusion logic: NO · rename: NO · EFFECT implement: NO · push: NO.**
Chỉ thêm 1 doc. Không đụng western-astrology WIP.

---

## 1. Locked Facts
- N1 Tĩnh+Vượng+Nhật xung → **Ám Động** · N2 Tĩnh+Hưu/Tù → **Nhật Phá** · N3 Động+Hưu/Tù → **Nhật Tán/散** ·
  N4 Động+Vượng → **愈动** (Phase 24 lock, Phase 25B implement).
- 爻逢月建，日冲而不散 (đạt qua vượng-state, không guard). Nhật Phá ≠ Nhật Tán. 散/愈动 hiện **FACT-only**.
- Provenance verify (Phase 25C): 增删卜易 + 易冒 hậu thuẫn split N3/N4. **Không nguồn nào cho delta lực bằng SỐ.**

## 2. Classical Evidence (định tính, KHÔNG số — verbatim)
- 增删卜易 日辰章: "爻旺而动，冲之**愈动**" (愈động = càng động); "爻衰而动，冲之则**散**" (散 = hại, "mất tác dụng động").
- 易冒 卷三 日冲章: "**旺相为动，休囚为散**" (旺-động giữ động / suy-động tán); "动爻遇冲谓之散".
- 黄金策 (profile KHÔNG chọn): "动逢冲而事散" → 散 = "吉不成吉，凶不成凶" (trung hòa KẾT QUẢ, không nói giảm lực nền).
- ⇒ Ngôn ngữ nguồn: **định tính về "hiệu lực của việc ĐỘNG"** (động có phát huy hay tán), KHÔNG phải thang lực số.

## 3. Current Engine Architecture (đọc code tại HEAD 0669671)
- **`getDayRelations` (luc-hao.ts):** phát 4 nhãn FACT vào `HaoInfo.relations`. Nguồn duy nhất của nhãn.
- **`canLucHao` (can-luc-hao.ts):** đọc `relations` cho `nguyetPha`(244)/`nhatPha`(245)/`amDong`(246) — **KHÔNG đọc
  "Nhật Tán"/"愈动"**. `reduced = nguyetPha||nhatPha||tuePha||hoiDauKhac||hoaXung||hoaMo||hoaTuyet` (275). `effective`
  chỉ đổi bởi hóa biến (Tiến/Thoái/Hồi Đầu Sinh). `amDong` chỉ **lưu** (306), không đổi lực.
- **`ket-luan-su-viec`:** `strengthFrom(cs)` đọc **CHỈ `cs.effective`** (+EMPTY/hidden→VERY_WEAK). `concludeDung(strength,
  protection, temporal)`. **`reduced` KHÔNG được concludeDung/strengthFrom đọc** — chỉ xuất hiện ở `reasons` (135).
  `temporal` DELAYED chỉ đến từ trục **protection** (92), không từ trạng thái Nhật-xung.
- **`chamDiem` (advisory-engine.ts, legacy score):** if/else theo type (291-301) + `add("Vượng suy",
  VUONG_SUY_DIEM[vuongSuy])` (287; Vượng+12…Tử−12) + `Xung −3` (299). Nhãn mới rơi khỏi if/else → điểm 0.
- **Hệ quả then chốt:** hiện tại **cả 4** nhãn Nhật-xung KHÔNG tác động state-machine kết luận. Nhật Phá/Ám Động chỉ
  set cờ mô tả (`reduced`/`amDong`) **inert** với verdict. Tức "FACT-only" áp cho **cả 4**, không chỉ 散/愈动.

## 4. Audit A–E

### A. HÀO STRENGTH (ngữ nghĩa, KHÔNG quy số)
- **散** khớp nhất với **(3) mất động lực / hiệu lực của việc ĐỘNG** (增删卜易 "mất tác dụng động"; 易冒 "散"). KHÔNG có
  nguồn nói (2) giảm NỀN lực (base). (1) FACT là mô tả hiện trạng đúng.
- **愈动** khớp **(3) tăng hiệu lực ĐỘNG** ("愈动"/"旺相为动"). KHÔNG nguồn nói (2) tăng base strength thành bậc cao hơn.
- ⇒ Trục ngữ nghĩa nguồn = **"movement efficacy" (hiệu lực của trạng thái động)**, KHÁC trục Vượng/Suy (nền lực).

### B. CAN-LỰC (double-count?)
- canLucHao suy lực từ: Nguyệt lệnh (vuongSuy) → baseForce; hóa biến → effective; Phá/Hồi Đầu Khắc/Hóa xấu → reduced.
- Nếu bơm 散→reduced: **rủi ro double-count** với hóa biến của chính hào động (hoaThoai/hoaXung/hoaMo/hoaTuyet đã ở
  reduced/effective). 散 chỉ xảy ở **động** — mà động đã có nhánh hóa biến riêng.
- Nếu bơm 愈动→nâng effective: **xung đột/nhân đôi** với vuongSuy (愈动 ĐÃ hàm ý vượng) và với hoaTien/hoiDauSinh.
- ⇒ 散/愈动 **không phải** đại lượng độc lập với vượng/suy×động sẵn có → nếu vào canLucHao phải là **trục riêng
  (efficacy)**, KHÔNG trộn vào base/effective/reduced, nếu không sẽ đếm trùng.

### C. KẾT-LUẬN SỰ VIỆC
- Hiện `concludeDung` KHÔNG phân biệt Ám Động/Nhật Phá/Nhật Tán/愈动 (đọc effective + protection + temporal).
- Branch sẽ bị ảnh hưởng NẾU bật EFFECT: (i) `strengthFrom` (nếu efficacy đổi bucket lực), (ii) `temporalFrom`
  (nếu 散 → DELAYED-timing), (iii) `concludeDung` các case protection (109-118) & temporal (103-106).
- Hiện `reduced` (gồm Nhật Phá) **inert** → muốn Nhật Phá/散 có tác dụng kết luận thì phải nối `reduced`/efficacy vào
  concludeDung (thay đổi có chủ đích, ngoài phạm vi phase này).

### D. ỨNG KỲ / TIMING
- 散 = "động không phát huy, chờ 填实/值日" là cách hiểu cổ điển phổ biến (động tán → ứng khi hết tán). NHƯNG **trong
  repo CHƯA có nguồn verbatim** khóa "散 → mốc thời gian X". 易冒/增删卜易 nói 散 định tính, không cho quy luật Ứng Kỳ.
- KHÔNG suy ra timing chỉ vì trạng thái động. ⇒ **OPEN** (cần nguồn Ứng Kỳ riêng nếu muốn dùng 散 làm timing modifier).

### E. SCORING (chamDiem)
- Nếu gán điểm cho 散/愈动: **double-count cao**. Lý do: chamDiem ĐÃ cộng `Vượng suy` (287) và `Xung −3` (299). Mà
  散/愈动 = hàm của (vượng/suy × động × xung) → cộng thêm = đếm lại chính tín hiệu vượng/suy + xung đã có.
- Nếu vẫn để rơi (0 điểm): giữ nguyên hành vi hiện tại (an toàn, không đếm trùng).
- ⇒ Bất kỳ điểm dương/âm nào cho 2 nhãn mới đều chồng lấn vượng/suy + xung + (một phần) động → cần chứng minh phần
  "tăng thêm" KHÔNG trùng trước khi gán. Hiện KHÔNG có cơ sở tách phần đó.

## 5. Design Options (0–3) — trung lập, KHÔNG xếp hạng

### OPTION 0 — FACT ONLY (giữ như hiện tại vô thời hạn)
- Classical support: đầy đủ (nguồn khóa NHÃN, không khóa lượng). Arch impact: 0. Double-count: 0. Provenance risk: 0.
  Test complexity: 0. Reversibility: N/A. Evidence cần thêm: không.

### OPTION 1 — EFFECTIVE MOVEMENT AXIS (trục hiệu-lực-động riêng, giữ nguyên vượng/suy)
- Trục mới (vd `movementEfficacy: ORDINARY | DISPERSED(散) | INTENSIFIED(愈动)`) suy từ relations; KHÔNG đụng
  base/effective/reduced.
- Classical support: **cao nhất về mặt trung thành ngữ nghĩa** (3 giá trị = đúng 3 từ nguồn: thường/散/愈动; định tính,
  không số). Arch impact: thêm 1 field ở HaoStrengthState + surface prompt; ket-luan CÓ THỂ đọc (tùy). Double-count:
  **thấp** (trực giao base/effective). Provenance risk: **thấp** (giữ categorical). Test: trung bình. Reversibility:
  **cao** (trục phụ, gỡ được). Evidence cần thêm: nếu muốn nối vào conclusion — cần rule định tính "efficacy→verdict".

### OPTION 2 — STRENGTH MUTATION (cho 散/愈动 sửa thẳng effective/reduced)
- 散→reduced (hoặc hạ effective); 愈动→nâng effective.
- Classical support: **yếu nhất** (không nguồn số; nguồn nói "efficacy" không nói "base strength"). Arch impact: **cao**
  (đụng lõi canLucHao → lan strengthFrom→concludeDung). Double-count: **cao** (vượng/suy + hóa biến đã có). Provenance
  risk: **cao** (biến định tính→bậc lực). Test: cao. Reversibility: **thấp** (đổi lõi). Evidence cần thêm: nguồn định
  lượng/định bậc rõ (hiện KHÔNG có).

### OPTION 3 — CONCLUSION-ONLY (giữ strength; ket-luan đọc 散/愈动 trực tiếp)
- concludeDung/temporalFrom đọc nhãn để điều chỉnh verdict/timing (vd 散→DELAYED-like; 愈动→giữ/nhấn động).
- Classical support: trung bình (khớp "散=việc không thành ngay"/"愈动=động mạnh" ở tầng KẾT QUẢ, gần 黄金策 "吉不成吉"
  — nhưng đó là profile KHÔNG chọn; cần cẩn trọng không nhập profile). Arch impact: trung bình (ket-luan-su-viec).
  Double-count: **trung bình** (nếu đồng thời đọc vượng/suy-derived state). Provenance risk: trung bình. Test: trung
  bình. Reversibility: trung bình. Evidence cần thêm: rule định tính "nhãn→verdict/timing" có nguồn.

## 6. Explicit Unknowns
- Không có delta lực **bằng số** trong bất kỳ nguồn primary nào (增删卜易/易冒/黄金策/卜筮正宗).
- Không có nguồn verbatim khóa **散 → quy luật Ứng Kỳ** cụ thể (chỉ hiểu chung "chờ hết tán").
- "Efficacy" có nên đổi **verdict** hay chỉ là mô tả — chưa có rule nguồn.
- Tương tác 散 với **hóa biến của chính hào động** (biến sinh/khắc/mộ/tuyệt) — chưa có quy tắc hợp nhất.

## 7. Decision Questions (cần methodology-owner duyệt)
- **DQ1.** 散/愈动 giữ **FACT-only** (Option 0) hay được nâng thành trạng thái có tác dụng?
- **DQ2.** Nếu có tác dụng: đặt ở **trục efficacy riêng** (Option 1), **sửa strength** (Option 2), hay **chỉ conclusion**
  (Option 3)?
- **DQ3.** 散 có phải **timing modifier** (Ứng Kỳ) không? Nếu có, nguồn Ứng Kỳ nào khóa mốc?
- **DQ4.** Có chấp nhận rủi ro **double-count** với vượng/suy + xung (đặc biệt Option 2 và scoring) không? Nếu có, chứng
  minh phần "tăng thêm" tách khỏi tín hiệu đã đếm ra sao?
- **DQ5.** Có nối `reduced` (gồm Nhật Phá, hiện inert) vào conclusion cùng lúc không, để 4 nhãn nhất quán?
- **DQ6.** Nếu chọn Option 3, làm sao **không vô tình nhập profile 黄金策** (动→散 "吉不成吉") mà ta đã KHÔNG chọn?

## 8. Files/Modules Affected per Future Option (map cụ thể — CHƯA sửa)
| Option | Files sẽ đụng | Ghi chú |
|---|---|---|
| 0 | (none) | giữ nguyên |
| 1 | `can-luc-hao.ts` (+1 field efficacy, đọc relations "Nhật Tán"/"愈动"); `luan-giai/prompt.ts` (surface); (tùy) `ket-luan-su-viec.ts`; tests | KHÔNG đụng base/effective/reduced |
| 2 | `can-luc-hao.ts` (reduced/effective logic) → lan `ket-luan-su-viec.ts` (strengthFrom/concludeDung); (gián tiếp) chamDiem; tests | rủi ro double-count + reversibility thấp |
| 3 | `ket-luan-su-viec.ts` (concludeDung/temporalFrom đọc relations); tests; (tùy) `ung-ky-synthesis.ts` nếu 散→timing | không đụng strength |
| (scoring, mọi option) | `advisory-engine.ts::chamDiem` | CHỈ nếu chủ đích gán điểm — double-count cao |

## 9. DO NOT IMPLEMENT UNTIL DECIDED
- KHÔNG thêm điểm chamDiem cho 散/愈动. KHÔNG sửa canLucHao base/effective/reduced. KHÔNG cho ket-luan đọc 散/愈动.
  KHÔNG thêm timing rule. KHÔNG đổi tên 愈动. Giữ **FACT-only** cho tới khi DQ1–DQ6 được methodology-owner khóa.
- Khi khóa: mở phase implement riêng (chọn đúng 1 Option), viết test trước, giữ diff tối thiểu, KHÔNG nhập profile khác.

## 10. Phase Boundary
- **runtime: NO · spec: NO · tests: NO · scoring/conclusion: NO · rename: NO · EFFECT implement: NO.**
- **doc changed: YES** (chỉ file này). Regression (nếu chạy): kỳ vọng **308/308** — xem báo cáo commit.
- Commit chỉ doc này. **KHÔNG push.**
