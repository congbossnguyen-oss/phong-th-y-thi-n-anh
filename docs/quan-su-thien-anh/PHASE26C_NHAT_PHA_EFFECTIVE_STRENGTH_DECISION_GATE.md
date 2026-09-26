# Phase 26C — Nhật Phá vs Effective-Strength Decision Gate

**Branch:** `quan-su-thien-anh` · **Nature:** AUDIT / METHODOLOGY DECISION PREP ONLY.
**runtime: NO · tests: NO · spec: NO · scoring: NO · conclusion: NO · ky-nguyen-dung: NO · availabilityOf: NO ·
reduced: NO · push: NO.** Chỉ thêm 1 doc. Không đụng western-astrology WIP. Probe tạm ĐÃ xóa (giữ xóa).

---

## 1. Corrected Phase 26 Architecture Statement
- `reduced` (can-luc-hao.ts:298) **active cho Kỵ/Nguyên** (chain source) qua `availabilityOf`; **inert cho reduced của
  Dụng** (strengthFrom đọc effective-only). (Phase 26 đính chính "inert" ⇒ chỉ đúng cho Dụng.)
- **26B đính chính 26A:** `nhatPha → reduced` **KHÔNG redundant** — nó LOAD-BEARING. Vì:
  - `getDayRelations` phân **Nhật Phá vs Ám Động** bằng **`monthVuongSuy`** (Nguyệt lệnh) — luc-hao.ts:435.
  - `availabilityOf` đọc **`currentState.effective` = `baseForce` (7-case Nhật + Nguyệt)** — ky-nguyen-dung.ts:78-85.
  - Hai lớp KHÁC nhau ⇒ một hào có thể **đồng thời** Nhật Phá (theo month) **và** effective = Trung Hòa/Vượng (nhờ
    Nhật đồng-hành/phù hoặc Nguyệt bù).

## 2. Empirical Probe Findings (đã chạy, probe đã xóa)
Quét 12 ngày × 12 tháng × 6 hào (quẻ Thuần Càn), so `availabilityOf` **có** vs **không** đóng góp `nhatPha` vào reduced:
- **42** hào có nhãn "Nhật Phá" (DAY).
- **14** cấu hình đổi availability nếu bỏ `nhatPha→reduced`:
  | day | month | hào | base/eff | có reduced | bỏ reduced |
  |---|---|---|---|---|---|
  | Tuất | Tý | Thìn (Thổ, đồng-hành) | **Vượng** | LIMITED | **STRONG** |
  | Tuất | Hợi | Thìn (Thổ) | **Vượng** | LIMITED | **STRONG** |
  | Tuất | Dần/Mão/Thân/Dậu | Thìn (Thổ) | Trung Hòa | LIMITED | AVAILABLE |
  | Ngọ | Dần/Mão/Tỵ/Ngọ | Tý (Thủy) | Trung Hòa | LIMITED | AVAILABLE |
  | Dần | Tý/Dần/Mão/Hợi | Thân (Kim) | Trung Hòa | LIMITED | AVAILABLE |
- ⇒ `nhatPha→reduced` **thay đổi verdict** (qua chain Kỵ/Nguyên) trong 14 cấu hình → **load-bearing**, KHÔNG gỡ trơn.

## 3. Current Verdict Pipeline (nơi mỗi tín hiệu vào)
```
HaoInfo(chiIndex, isDong, vuongSuy=month, relations)
  → getDayRelations: monthVuongSuy → nhãn "Nhật Phá"/"Ám Động"/"Nhật Tán"/"愈动"  [luc-hao.ts:435]
  → canLucHao:
       baseForce = tinhBaseForce(Nhật+Nguyệt, 7-case)             [effective nền]
       nhatPha = hasRel("Nhật Phá")  → reduced = ...||nhatPha||...  [can-luc-hao.ts:298]
       movementEfficacy = BROKEN_STATIC (từ nhãn Nhật Phá)          [FACT-only, Phase 25I]
       currentState = { base, effective, reduced, ... }
  → (source=Kỵ/Nguyên) availabilityOf(cs): EMPTY→HIDDEN→(reduced||restrained→LIMITED)→Vượng→STRONG→Trung Hòa→AVAILABLE→Suy→LIMITED
  → interactionOf.effective → maxEffective → kyPressure / nguyenSupport → dungProtection
  → protectionFrom(knd) → concludeDung(strength, protection, temporal) → VERDICT
  → (Dụng) strengthFrom(dungCs) = effective-only (KHÔNG đọc reduced)
```

## 4. Semantic Distinction (KHÔNG gộp 5 khái niệm)
| Ký hiệu | Khái niệm | Nguồn tính | Hiện dùng ở |
|---|---|---|---|
| **A** | "Hưu/Tù theo **Nguyệt**" | `vuongSuyOf(month, hào)` | quyết nhãn Nhật Phá/Ám Động |
| **B** | "**effective** sau Nhật + Nguyệt" | baseForce 7-case + hóa biến | strengthFrom, availabilityOf (nhánh force) |
| **C** | "**Nhật Phá** relation" | Nhật chi-xung + A(hưu/tù) | movementEfficacy, reduced |
| **D** | "**reduced** state" | OR 7 nguồn (gồm C) | availabilityOf (short-circuit LIMITED) |
| **E** | "availability/protection" | availabilityOf → chain | verdict |
- Mấu chốt: **A ≠ B.** Nhãn Nhật Phá (C) sinh từ **A**, nhưng LIMITED-vs-force ở **E** phụ thuộc **B**. Xung đột 14
  ca = A nói "hưu/tù" nhưng B nói "Trung Hòa/Vượng".

## 5. Classical Evidence Audit (chỉ nguồn đã verify Phase 25C — không claim mới)
**增删卜易 日辰章 (verbatim):** "冲**旺相**之静爻，即为暗动，冲**衰弱**之静爻，则为日破" · "爻之旺而静者…暗动，愈得其力；爻之
衰而静者…日破，愈加无用" · **ngoại lệ:** "爻逢月建，日冲而**不散**".
**易冒 卷三 (verbatim):** "日冲安**旺**之爻为暗动，日冲**静衰**之爻谓之暗破…" · "**旺相为动，休囚为散**".

Phân tích theo 3 câu hỏi §3:
1. **破 có độc lập áp trạng thái vỡ ngay cả khi có yếu tố lực khác đỡ?** — Nguồn buộc 暗动/日破 theo **旺相/衰弱** của
   hào (một phán đoán LỰC), KHÔNG mô tả "破 áp bất kể lực". Ngược lại: nếu hào **旺相** thì nguồn nói là **暗动** (không
   phải 日破). ⇒ Nguồn **KHÔNG** ủng hộ "日破 + hào thực-旺" cùng tồn tại; classically hào 旺相 bị xung = 暗动.
2. **日冲之破 có bị 旺相/得日/同类 override/mitigate?** — CÓ **một** precedent rõ: **"爻逢月建，日冲而不散"** (lâm Nguyệt
   = đắc lệnh mạnh → xung KHÔNG phá/tán). ⇒ nguồn CÓ nguyên tắc "hỗ trợ đủ mạnh triệt tiêu phá". NHƯNG nguồn CHỈ nêu
   **lâm Nguyệt** — **KHÔNG** nói rõ 得日 (Nhật đồng-hành) hay 同类 hay 旺相-tổng-hợp có generalize không → **AMBIGUOUS**.
3. **"休囚逢冲为破" dùng month-only hay combined strength?** — Nguồn dùng chữ **旺相/衰弱/休囚** (thuật ngữ lực) nhưng
   **KHÔNG định nghĩa** rõ 旺相 = chỉ Nguyệt lệnh hay gồm cả Nhật/đồng-loại. Thực hành cổ điển thường lấy **Nguyệt
   lệnh làm chính** nhưng cũng công nhận **日辰/同类 làm hào "có khí"** → **AMBIGUOUS** về việc dùng A hay B.

**Kết luận §5:** nguồn (a) gắn 暗动/日破 với **旺/衰** (nghiêng B — lực thật), (b) có precedent hỗ-trợ-mạnh-triệt-phá
(lâm Nguyệt), nhưng (c) **KHÔNG** khóa việc 旺相 = month hay combined, và (d) **KHÔNG** generalize ngoại lệ ngoài lâm
Nguyệt. ⇒ **AMBIGUOUS** cho đúng 14 ca (hưu/tù-theo-month nhưng combined Trung Hòa/Vượng). Không tự diễn giải.

## 6. Model Options (trung lập, KHÔNG xếp hạng)
| | Mô tả | Primary support | Arch implications | Đổi verdict? | Compat Phase 24/25 | Double-count | Test burden | Migration risk |
|---|---|---|---|---|---|---|---|---|
| **MODEL A** | Nhật Phá là trạng-thái-hạn-chế ĐỘC LẬP: dù effective Vượng/Trung Hòa, `reduced`→LIMITED giữ nguyên (status quo hiện tại) | yếu-vừa: nguồn nói 旺相→暗动 (KHÔNG 日破) → mâu thuẫn với "旺 mà vẫn phá"; nhưng "破=hại" thì có | 0 (giữ) | KHÔNG | giữ nguyên nhãn (Phase 24) + reduced | (D overload sẵn) | 0 | 0 |
| **MODEL B** | effective là authoritative: nếu effective Vượng/Trung Hòa → availability theo effective; Nhật Phá chỉ còn FACT/quan hệ | vừa: khớp "旺相→暗动/愈得其力" + precedent lâm-Nguyệt | sửa cách reduced-từ-nhatPha (hoặc availabilityOf) — nhưng CẤM đụng availabilityOf ⇒ phải ở can-luc-hao | **CÓ (14 ca)** | ⚠ có thể mâu thuẫn nhãn Nhật Phá (Phase 24 dùng month) — nhãn vẫn "Nhật Phá" nhưng hết LIMITED | thấp | trung bình | trung bình |
| **MODEL C** | Hai trục có điều kiện: tách "base/effective" khỏi "relational damage"; định rõ khi nào phá override lực (vd chỉ lâm-Nguyệt/đắc-lệnh mới miễn; hoặc chỉ combined-Vượng mới thoát) | vừa (dựa precedent lâm-Nguyệt, mở rộng có kiểm soát) | thêm điều kiện tường minh; rework vừa | **CÓ (subset)** tùy điều kiện | cần định nghĩa khớp lock | thấp nếu trực giao | cao | cao |

## 7. Cross-Check vs Phase 25 Locks (§5 yêu cầu)
| Ký hiệu | Ràng buộc cần giữ | Ảnh hưởng bởi 26C? |
|---|---|---|
| Ám Động | nhãn tĩnh-vượng (Phase 24) | KHÔNG (26C không đụng nhãn) |
| Nhật Phá (nhãn) | tĩnh-hưu/tù theo month (Phase 24 lock) | **GIỮ** — 26C bàn EFFECT của nhãn, KHÔNG đổi cách gán nhãn |
| Nhật Tán / 愈动 | không set reduced | KHÔNG |
| movementEfficacy | FACT-only, BROKEN_STATIC từ nhãn Nhật Phá (Phase 25I) | **GIỮ** — KHÔNG được biến Nhật Phá ≡ BROKEN_STATIC "same effect" trừ khi owner quyết |
| reduced (Tuế Phá) | load-bearing riêng (26A) | KHÔNG (26C chỉ xét nhatPha) |
- **CẢNH BÁO khóa:** MODEL B/C **không** được ngầm biến `Nhật Phá` thành đồng nhất `movementEfficacy.BROKEN_STATIC`
  (một là relational/verdict, một là FACT). Giữ tách trục (Model 1 Phase 25F). Không đổi cách getDayRelations gán nhãn
  (Phase 24) — nếu owner muốn đổi nhãn cho "旺相 thật → 暗动" thì đó là **gate riêng đụng lock Phase 24**, ngoài 26C.

## 8. Exact Cases That Would Change Verdict Under Each Model
- **MODEL A:** 0 ca đổi (giữ 14 ca ở LIMITED). Verdict hiện tại giữ nguyên.
- **MODEL B:** **14 ca** (bảng §2) đổi availability (LIMITED→AVAILABLE/STRONG) **khi hào đó đóng vai Kỵ hoặc Nguyên**
  → đổi kyPressure/nguyenSupport → có thể đổi dungProtection → có thể đổi conclusion. (Dụng: strengthFrom vốn không
  đọc reduced nên Dụng-là-Nhật-Phá không đổi ở tầng strength; chỉ đổi khi Dụng là target của Kỵ/Nguyên đã đổi.)
- **MODEL C:** subset của 14 tùy điều kiện chọn (vd chỉ 2 ca base=Vượng → STRONG; hoặc chỉ ca đồng-hành Thổ; …).
- (Con số "14" theo quẻ Thuần Càn/probe; bộ quẻ khác có thể thêm ca tương tự — cần quét rộng khi implement.)

## 9. Decision Questions (cần owner — KHÔNG quyết ở đây)
- **DQ1.** Nhật Phá có được **coexist với effective Vượng** không? *(Evidence: nguồn nói 旺相→暗动, gợi ý "không nên"
  ở tầng nhãn; nhưng engine hiện cho coexist do dùng month cho nhãn — AMBIGUOUS.)*
- **DQ2.** Nhật Phá coexist với effective **Trung Hòa**? *(Tương tự DQ1, ranh giới mờ hơn.)*
- **DQ3.** Nếu coexist, Nhật Phá **còn buộc LIMITED** không? *(A: có; B: không; C: có điều kiện.)*
- **DQ4.** "破" là: giảm lực / hạn chế availability / relational damage / trục ngữ nghĩa riêng? *(Hiện engine trộn:
  reduced=hạn chế availability + movementEfficacy=relational FACT.)*
- **DQ5.** Engine tương lai biểu diễn coexistence thế nào **không gộp** 2 khái niệm (lực vs phá)? *(Model C = hai trục
  tường minh.)*
- **DQ6.** `reduced` hiện có phản ánh đúng methodology, hay **encode mạnh hơn** nguồn cho phép? *(Evidence: với 14 ca
  combined-Vượng, reduced áp LIMITED có thể mạnh hơn nguồn — nguồn nói hào 旺 → 暗动/愈得力, không "vô dụng".)*

## 10. Unknowns / Evidence Gaps
- Nguồn KHÔNG định nghĩa 旺相 = month-only hay combined → gốc của mọi mơ hồ.
- Ngoại lệ "日冲而不散" chỉ khóa **lâm Nguyệt**; generalize sang 得日/同类/旺相-tổng = chưa có nguồn.
- Chưa quét toàn bộ 64 quẻ để đếm đầy đủ số ca (probe chỉ Thuần Càn = 14).
- Quan hệ với LABEL Phase 24 (month-based) nếu owner muốn "旺相 thật → đổi nhãn" — đụng lock, ngoài 26C.

## 11. Future Implementation Boundaries
- MODEL A: none (giữ).
- MODEL B: đụng `can-luc-hao.ts` (điều kiện reduced-từ-nhatPha theo effective) — **KHÔNG** đụng availabilityOf/
  ky-nguyen-dung (theo ràng buộc); test-first; quét rộng để cập nhật kỳ vọng.
- MODEL C: `can-luc-hao.ts` + có thể thêm trục/điều kiện; rework lớn hơn; test-first.
- Mọi model: giữ nhãn Phase 24 (getDayRelations) trừ khi mở gate riêng; giữ movementEfficacy FACT-only (25I); giữ
  Tuế Phá/Nguyệt Phá/hóa-biến reduced; KHÔNG số-hoá; KHÔNG nhập 黄金策; chỉ stage file phase; KHÔNG push.

## 12. DO NOT IMPLEMENT UNTIL DECIDED
Giữ nguyên hiện trạng (MODEL A de-facto) cho tới khi DQ1–DQ6 được owner khóa. KHÔNG gỡ/đổi `nhatPha→reduced`, KHÔNG
đụng availabilityOf, KHÔNG đổi nhãn getDayRelations, KHÔNG biến Nhật Phá ≡ BROKEN_STATIC.

## 13. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · scoring/conclusion/ky-nguyen-dung/availabilityOf/reduced: NO.**
- **doc changed: YES** (chỉ file này). Regression: **318/318 PASS** (xác nhận). Probe tạm: đã xóa (giữ xóa).
- Commit chỉ doc này. **KHÔNG push.** STOP.
