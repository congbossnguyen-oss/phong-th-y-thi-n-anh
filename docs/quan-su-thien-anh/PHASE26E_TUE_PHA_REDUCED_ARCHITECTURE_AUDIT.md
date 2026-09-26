# Phase 26E — Tuế Phá × Reduced Architecture Audit

**Branch:** `quan-su-thien-anh` · **Nature:** AUDIT + DECISION GATE. KHÔNG refactor / KHÔNG sửa runtime / KHÔNG đổi
methodology / KHÔNG tự chọn model / KHÔNG push. Chỉ thêm 1 doc. Không đụng western-astrology WIP. Probe tạm đã xóa.
KHÔNG mở lại Nhật Phá / KHÔNG đổi movementEfficacy / KHÔNG broad-refactor reduced.

---

## 1. Scope
Audit riêng producer `tuePha → reduced`. Checkpoint `7005e9f`, regression 318/318.

## 2. Runtime Trace (code thật)
- **A. Tạo:** `can-luc-hao.ts:254` — `const tuePha = self.chiIndex === chiXungVoi(yearChiIndex);`
- **B. Điều kiện:** Chi hào = **xung của Chi NĂM** (`chiXungVoi` = +6 mod 12) — tức 歲破. Chỉ phụ thuộc **Chi Năm**,
  KHÔNG liên quan month/day vượng-suy.
- **C. Vào reduced:** `can-luc-hao.ts:298` — `reduced = nguyetPha || nhatPha || tuePha || hoiDauKhac || hoaXung || hoaMo || hoaTuyet;`
- **D/E. Đường verdict:** `reduced` → `availabilityOf` (ky-nguyen-dung.ts:81, `reduced||restrained → "LIMITED"`) →
  interactionOf.effective → kyPressure/nguyenSupport → dungProtection → protectionFrom → concludeDung → **verdict**
  (chỉ khi hào là **source** Kỵ/Nguyên). **CÓ** thể đổi verdict.
- **F. Redundant khi nào:** khi hào vốn đã Suy (effective Suy → LIMITED anyway) hoặc đã reduced/restrained bởi nguồn khác.
- **G. Load-bearing khi nào:** khi effective = Trung Hòa/Vượng (tuePha KHÔNG đổi baseForce) → nếu bỏ tuePha thì
  availabilityOf trả AVAILABLE/STRONG thay vì LIMITED.
- **Đặc điểm then chốt:** `tuePha` **KHÔNG** đổi `baseForce` (comment dòng 256 "giữ base") và **KHÔNG** tương quan
  month/day → hào Tuế Phá **tự do** ở mọi mức effective (kể cả Vượng). ⇒ load-bearing **mạnh hơn** Nhật Phá.

## 3. Empirical Probe (đã chạy, probe đã xóa)
Cô lập `tuePha` là nguồn reduced DUY NHẤT (quẻ tĩnh; tránh day/month xung để loại nhatPha/nguyetPha; hóa-biến=false).
Quét 6 hào × day × month, ép `yearChi = chiXungVoi(hàoChi)`:
| Chỉ số | Giá trị |
|---|---|
| Tổng ca Tuế-Phá-cô-lập | **726** |
| Không đổi (redundant — đã Suy) | **298** |
| Bỏ tuePha → **LIMITED→AVAILABLE** | **186** |
| Bỏ tuePha → **LIMITED→STRONG** | **242** |
| transition khác | 0 |
- ⇒ **428/726 (59%) LOAD-BEARING.** (So Nhật Phá 14/42 — Tuế Phá load-bearing rộng hơn nhiều.)
- Ví dụ concrete (đổi verdict-path khi hào là Kỵ/Nguyên):
  1. day=Tý month=Tý year=Ngọ, hào1 Tý → base=**Vượng**, withTuế=LIMITED, bỏ=STRONG.
  2. day=Tý month=Hợi year=Ngọ, hào1 Tý → Vượng, LIMITED→STRONG.
  3. day=Sửu month=Sửu year=Ngọ, hào1 Tý → base=**Trung Hòa**, LIMITED→AVAILABLE.
  4. day=Tý month=Dậu year=Ngọ, hào1 Tý → Vượng, LIMITED→STRONG.
  5. day=Sửu month=Dần year=Ngọ, hào1 Tý → Trung Hòa, LIMITED→AVAILABLE.
- **Ảnh hưởng final verdict:** CÓ khả năng — khi hào Tuế Phá đóng vai **Kỵ** (giảm áp lực khắc Dụng) hoặc **Nguyên**
  (giảm hỗ trợ Dụng) → đổi dungProtection → có thể đổi conclusion. (Với **Dụng tự** bị Tuế Phá: `strengthFrom`
  effective-only + Dụng không phải chain source → **inert trực tiếp**, giống "Dụng reduced inert" Phase 26.)

## 4. Provenance Audit
- **A. Classical FACT (Tuế Phá là gì):** 歲破 = Chi Năm xung Chi hào. Trong repo, được ghi ở **spec §3.9** nhưng §3.9
  **tuyên bố rõ**: "quyết định methodology **Thầy khóa Phase 10A**, **KHÔNG** phải trích dẫn văn bản cổ." ⇒ ngay cả
  định nghĩa-hiệu-ứng ở đây là **methodology lock**, không phải primary trong repo.
- **B. Source-backed EFFECT (giảm lực/vô dụng/phá theo wording cổ):** **KHÔNG có trong repo** (§3.9 nói không cổ thư).
  Bộ 153 án lệ: **0** ca Tuế Phá đủ cấu trúc (DATA GAP — Phase 21/22A). ⇒ **AMBIGUOUS/UNVERIFIED** về wording cổ.
- **C. Quân Sư methodology decision:** `tuePha → reduced → LIMITED` = **Phase 10A lock** + framing §3.9 "thuộc trục
  giảm lực (reduced/adverse), GIỮ base, nhất quán Nguyệt/Nhật Phá." Đây là quyết định đã ghi tài liệu, KHÔNG bịa cổ thư.
- **Kết:** provenance = **methodology-locked (Phase 10A), KHÔNG classically-verified**; EFFECT-wording cổ = AMBIGUOUS;
  validation án lệ = DATA GAP. Hiện trạng runtime **nhất quán** với lock §3.9.

## 5. Semantic Audit (so sánh)
| So với | Giống? | Khác? |
|---|---|---|
| **Nguyệt Phá** | cùng "Phá" (xung), cùng vào reduced, giữ base | trục Tháng vs trục Năm; Nguyệt Phá là relation (chamDiem đọc), Tuế Phá là yearState flag (chamDiem KHÔNG đọc) |
| **Nhật Phá** | cùng "Phá", cùng reduced, cùng "độc lập áp LIMITED" (26D MODEL A) | Nhật Phá gắn month-hưu/tù (label); Tuế Phá độc lập effective hoàn toàn → load-bearing rộng hơn; Nhật Phá còn ở movementEfficacy, Tuế Phá KHÔNG |
| **Suy** | cùng ra LIMITED ở availabilityOf | Suy = lực nền yếu; Tuế Phá = tổn thương xung (giữ base) — availabilityOf gộp mất phân biệt |
| **restrained (Hóa Hợp)** | cùng LIMITED | níu chân ≠ phá |
| **transformationState** | — | Tuế Phá KHÔNG thuộc transformationState (không trùng như hóa-biến) |
| **movementEfficacy** | — | Tuế Phá KHÔNG có biểu diễn efficacy (khác Nhật Phá=BROKEN_STATIC) |

Trả lời 6 câu:
1. **Cùng class Nhật Phá?** Cùng "Phá độc lập giữ base" (giống 26D), nhưng **trigger khác** (Năm vs Ngày+month) và
   Tuế Phá **không** móc vào effective → độc lập hơn. → *cùng vai kiến trúc, khác nguồn.*
2. **Nên chung boolean reduced?** Về methodology (10A: "nhất quán Nguyệt/Nhật Phá") thì có chủ đích; về kiến trúc thì
   là **overload** (giống mọi producer khác — vấn đề chung 26A, KHÔNG riêng Tuế Phá).
3. **reduced mất thông tin gì?** nguồn + độ nặng (gộp với Suy/restrained thành 1 LIMITED) — vấn đề chung 26A.
4. **Double-count?** **KHÔNG.** `tuePha` KHÔNG đổi baseForce, và `chamDiem`/advisory **KHÔNG** đọc tuePha (grep rỗng).
   ⇒ `reduced` là **kênh hiệu ứng DUY NHẤT** của Tuế Phá — sạch hơn Nhật Phá (Nhật Phá ở cả reduced lẫn movementEfficacy).
5. **Interaction với effective/baseForce?** tuePha **KHÔNG** đổi baseForce; nó **override** effective ở availabilityOf
   (short-circuit LIMITED trước nhánh Vượng). Đây chính là cơ chế load-bearing.
6. **Dụng tự Tuế Phá → verdict?** KHÔNG trực tiếp (strengthFrom effective-only; Dụng không phải chain source) — giống
   "Dụng reduced inert" (Phase 26). Chỉ tác động khi Tuế Phá nằm trên **Kỵ/Nguyên**.

## 6. Verdict-Path Impact (tóm tắt)
- Có tác động verdict qua **Kỵ/Nguyên** (chain), KHÔNG qua Dụng-tự. 428/726 ca cô lập là load-bearing.
- Kênh DUY NHẤT = reduced → availabilityOf. Không double-count. Không đụng baseForce.

## 7. Classify Current Behavior
- **A. CORRECT + LOAD-BEARING** ✅ — 59% ca load-bearing; khớp lock §3.9 ("trục giảm lực, giữ base").
- **C. METHODOLOGY-LOCKED BUT ARCHITECTURALLY OVERLOADED** ✅ — chung boolean `reduced` + availabilityOf gộp
  (Suy/restrained) → mất granularity; nhưng đây là **vấn đề chung của reduced** (26A), KHÔNG phải lỗi riêng Tuế Phá.
- **D. PROVENANCE AMBIGUOUS** ✅ (một phần) — EFFECT-wording cổ = UNVERIFIED trong repo; là **methodology lock 10A**,
  KHÔNG cổ thư; DATA GAP án lệ. (FACT-hiệu-ứng đã được ghi tài liệu ở §3.9 nên KHÔNG phải "chưa quyết".)
- **KHÔNG phải B** (không redundant — 59% load-bearing). **KHÔNG phải E** (không bug — khớp lock 10A + pattern 26D).

## 8. Decision Gate (models — KHÔNG tự chọn)
| Model | Mô tả | Ghi chú |
|---|---|---|
| **A** | Giữ nguyên `tuePha→reduced→LIMITED` | Khớp lock 10A + pattern Nhật Phá 26D (Phá = independent limitation). Không mâu thuẫn. |
| **B** | Giữ Tuế Phá FACT, bỏ hiệu ứng reduced | **Mâu thuẫn** lock 10A ("trục giảm lực") + đổi 428 ca. Cần owner mở lại 10A. |
| **C** | Tách Tuế Phá thành state riêng rồi định nghĩa interaction | Thuộc vấn đề chung "reduced decomposition" (26A Model 1/2), không riêng Tuế Phá. |
| **D** | Khác | Không có evidence bắt buộc. |

## 9. Recommendation
**KHÔNG cần owner decision riêng cho Tuế Phá.** Lý do:
1. Hành vi hiện tại **đã được methodology lock** (Phase 10A, spec §3.9) và **nhất quán** với lock đó ("trục giảm lực,
   giữ base").
2. Nhất quán với pattern vừa khóa cho Nhật Phá (26D MODEL A: "Phá độc lập áp LIMITED kể cả khi effective mạnh").
3. Audit **KHÔNG phát hiện contradiction / bug / double-count** riêng cho Tuế Phá (kênh reduced duy nhất, không đụng
   baseForce, chamDiem không đọc).
4. Điểm "overload" (chung boolean reduced + availabilityOf gộp) **KHÔNG riêng Tuế Phá** — đã nằm trong OPEN chung
   **"Reduced-state verdict architecture / decomposition"** (Phase 26/26A). Nếu owner muốn xử, làm ở gate chung đó, cho
   MỌI producer cùng lúc (tránh hybrid).

⇒ Đề xuất: **Classification A + C(+D một phần), Model A giữ nguyên, KHÔNG reopen riêng.** Chỉ khi owner mở gate
"reduced decomposition" chung thì Tuế Phá được xử cùng.

## 10. Boundaries / DO-NOT
- KHÔNG sửa runtime/test/spec (audit này không sửa spec vì §3.9 đã đúng & đủ; không có lỗi factual để sửa).
- Nếu sau này đụng reduced: giữ `tuePha→reduced` (lock 10A) trừ khi owner mở lại 10A tường minh.
- KHÔNG gộp Tuế Phá với Nhật Phá/movementEfficacy; KHÔNG số-hoá; KHÔNG đụng availabilityOf ngoài gate chung.

## 11. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · scoring/conclusion/ky-nguyen-dung/availabilityOf: NO.** doc: YES (file này).
- Regression: **318/318 PASS** (không đổi — audit thuần; probe đã xóa nên count không đổi).
- Commit chỉ doc này. **KHÔNG push.** STOP.
