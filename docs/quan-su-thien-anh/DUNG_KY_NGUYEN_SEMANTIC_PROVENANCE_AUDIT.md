# Dụng / Kỵ / Nguyên — Semantic & Provenance Audit

**Branch:** `quan-su-thien-anh` · **HEAD:** `0bd70aa` · **Nature:** READ-ONLY AUDIT. KHÔNG sửa runtime/test/API/UI/prompt/
skill/rule/methodology, KHÔNG refactor/cleanup, KHÔNG reopen Phase 25/26/Ứng Kỳ, KHÔNG web research, KHÔNG push.
Baseline 318/318.

## 1. Executive Summary
- Role **Dụng/Kỵ/Nguyên = FACT** (gán 1 lần: Dụng từ hint; Nguyên=hào SINH Dụng, Kỵ=hào KHẮC Dụng theo ngũ hành —
  `resolveFourGods` advisory:239). Downstream **đọc** FACT (report path); prompt-fallback **recompute** (Phase-19 drift
  guard che). Không legacy engine thứ 2.
- **Hai kênh verdict song song (đã lock 26H):** (A) `chamDiem` → card (`ketLuan`/`mucDoThuan`); (B) deterministic chain
  `ky-nguyen-dung → ket-luan-su-viec` → `ketLuanSuViec` → AI prose (priority #1).
- **Không genuine double-count** trong 1 số: Kỵ/Nguyên tác động **chỉ chain** (chamDiem chấm CHỈ Dụng); Dụng-strength &
  Thế/Ứng xuất hiện ở CẢ 2 kênh nhưng là **parallel semantic domains** (card vs prose), không cộng vào 1 field.
- **Load-bearing verdict (chain):** Dụng `effective` (strengthFrom) + Kỵ/Nguyên chain protection + Dụng temporal.
  **Thế/Ứng = FACT-only trong chain** (concludeDung không nhận), nhưng **load-bearing trong chamDiem card**.
- Provenance: role doctrine = **B**; chain synthesis + concludeDung state machine = **C**; chamDiem magnitudes (vượng/suy
  ±, Thế/Ứng ±5/−6…) = **C/E heuristic**. Verbatim classical = DATA GAP.

## 2. Locked Constraints (không đụng)
Phase 25 (movementEfficacy FACT-only, không tạo Ứng Kỳ); Phase 26 (reduced arch, Nhật Phá Model A, Tuế Phá→reduced, 7
producers, availabilityOf, chamDiem↔chain 2 domains, transformation/burial debt); Ứng Kỳ candidate/non-overriding
(0bd70aa). KHÔNG reopen.

## 3. Runtime Inventory
| Concern | File · symbol |
|---|---|
| Dụng resolve | `advisory-engine.ts:123 resolveDungThan(chinh, hint)` |
| Kỵ/Nguyên resolve | `advisory-engine.ts:239 resolveFourGods` (Nguyên=sinh Dụng, Kỵ=khắc Dụng) + `FourGods` (:198) |
| Strength/hào | `can-luc-hao.ts canLucHao` → `HaoStrengthState.currentState {base,effective,reduced,restrained,hidden,temporalExistence}` |
| Chain | `ky-nguyen-dung.ts` `synthesizeChain`/`synthesizeKyNguyenDung` (availabilityOf → kyPressure/nguyenSupport → dungProtection) |
| Verdict (chain) | `ket-luan-su-viec.ts` `strengthFrom`/`protectionFrom`/`temporalFrom`/`concludeDung` → `ketLuanSuViec` |
| Verdict (card) | `advisory-engine.ts:274 chamDiem` → `suyKetLuan` → `ketLuan`/`mucDoThuan` |
| Thế/Ứng | `ket-luan-su-viec.ts:141 theUngSynthesisFrom` (FACT) + `advisory-engine.ts:307-317` (chamDiem score) |
| Surface | report.ketLuanSuViec → AI prose; report.ketLuan/mucDoThuan → card (`render-ket-qua-client.ts`) |

## 4. Dụng Thần
- **A1 resolve:** `resolveDungThan(chinh, dung_than_hint)` — 1 lần, FACT (kind luc-than / hào chỉ định).
- Strength: đọc `canLucHao(cast, dungHao).currentState.effective` qua `strengthFrom` (ket-luan). **reduced của Dụng =
  INERT trong chain** (strengthFrom chỉ đọc effective; Dụng không phải chain source — xác nhận 26/26H). `temporalExistence
  EMPTY`/`hidden` → VERY_WEAK/HIDDEN (load-bearing).
- Trong chamDiem: Dụng vượng/suy scored (`VUONG_SUY_DIEM` +12..−12), Không Vong −12, quan hệ Nhật/Nguyệt (Sinh+7/Khắc−7/
  Phá…), Ám Động +5 — **card channel**.
- **A6/A7:** role Dụng là FACT; recompute chỉ ở prompt-fallback (drift-guarded Phase 19).

## 5. Kỵ Thần
- **A2 resolve:** hào KHẮC ngũ hành Dụng (resolveFourGods:258). Có thể **nhiều** Kỵ (mảng). Cừu ≠ Kỵ (Phase 16, ngoài chain).
- **Chain (Scope C):** mkNode(Kỵ) → `interactionOf(Kỵ, Dụng)` OVERCOMES → `availabilityOf(Kỵ.cs)` (reduced/Suy→LIMITED) →
  `kyPressure = toPressure(maxEffective(directPressure OVERCOMES))` → `dungProtection` → protectionFrom → concludeDung.
  ⇒ **Kỵ reduced/Suy LÀM GIẢM kyPressure** → Dụng được bảo vệ hơn → verdict tốt hơn. Load-bearing.
- **chamDiem KHÔNG chấm Kỵ** (chỉ Dụng, advisory:284) ⇒ Kỵ = **single-channel (chain)**, KHÔNG double-count.

## 6. Nguyên Thần
- **A3 resolve:** hào SINH ngũ hành Dụng (resolveFourGods:256). Nhiều Nguyên (mảng).
- **Chain (Scope D):** `interactionOf(Nguyên, Dụng)` GENERATES/SAME_ELEMENT → `nguyenSupport = maxEffective(...)`. Nguyên
  bị reduced/Suy → availabilityOf LIMITED → nguyenSupport thấp → hỗ trợ yếu → verdict xấu hơn. **Nguyên có thể "support
  nhưng bản thân Suy/reduced"** → runtime **hạ mức support** đúng (không bỏ qua). Load-bearing.
- Tham-sinh-vong-khắc: Kỵ sinh Nguyên (thông quan) xử trong synthesizeChain (Phase 11). chamDiem KHÔNG chấm Nguyên →
  single-channel.

## 7. Thế / Ứng
- **Role độc lập** (positional `h.theUng`), overlay lên Dụng/Kỵ/Nguyên (một hào có thể vừa Dụng vừa Thế).
- **Trong deterministic chain:** `theUngSynthesisFrom` = **FACT-only** (:141 "KHÔNG phán tốt/xấu"); `theStrength`/
  `ungStrength` chỉ mô tả; **`concludeDung(strength, protection, temporal)` KHÔNG nhận theUng** → **KHÔNG ảnh hưởng
  `ketLuanSuViec`** (structural).
- **Trong chamDiem (card):** **LOAD-BEARING** — Ứng sinh Thế +5 / Ứng khắc Thế −6 / Thế khắc Ứng +3 / Thế sinh Ứng −2
  (advisory:307-317).
- ⇒ Thế/Ứng: FACT-only ở prose-chain, scored ở card. **Rule ngầm?** Không — được ghi ở spec §4.3 (khung Thế-Ứng hợp tác)
  + card scoring minh bạch trong bangChamDiem. Nhưng **magnitudes ±5/−6/+3/−2 = heuristic không nguồn (C/E)**.

## 8. Strength Axis (phân tầng)
| Axis | Nguồn | Đọc bởi | Ghi chú |
|---|---|---|---|
| **BASE STRENGTH** | baseForce (7-case Nhật+Nguyệt) → effective (hóa biến) | strengthFrom (Dụng), availabilityOf (nhánh force) | trục lực nền |
| **RELATIONAL LIMITATION** | reduced (7 producers) | availabilityOf (short-circuit LIMITED) | KHÔNG đổi effective; đổi availability |
| **MOVEMENT EFFICACY** | movementEfficacy (4 nhãn Nhật xung) | **KHÔNG consumer** (FACT-only, 25I) | không strength/verdict |
| **AVAILABILITY** | availabilityOf(cs) → STRONG/AVAILABLE/LIMITED/HIDDEN/EMPTY | chain (Kỵ/Nguyên source) | gộp reduced+restrained+Suy→LIMITED |
- **Dụng đánh giá bằng effective** (chain) ✓. **Kỵ/Nguyên đánh giá bằng availabilityOf** (gồm reduced+effective) ✓.
- **reduced KHÔNG đổi effective** (chỉ availability) ✓ (26F/G). **Nhật Phá/Tuế Phá → limitation (reduced)**, KHÔNG vào
  effective ✓. **movementEfficacy KHÔNG vào strength** ✓. **Không channel nào cộng/trừ 2 lần trong 1 số** (Dụng-strength
  xuất hiện ở card+chain = 2 domain song song, không 1 field).

## 9. Pressure / Support / Protection
```
Kỵ.cs ─availabilityOf→ effective ─maxEffective→ kyPressure ┐
Nguyên.cs ─availabilityOf→ effective ─maxEffective→ nguyenSupport ┤→ dungProtection ─protectionFrom→ concludeDung
Dụng.cs ─strengthFrom(effective)→ DungStrength ─────────────────┘   (+ temporalFrom: EMPTY/HIDDEN/DELAYED)
```
- `concludeDung(strength, protection, temporal)` = **3 input load-bearing** cho ketLuanSuViec. Thế/Ứng, movementEfficacy,
  Dụng-reduced KHÔNG nằm trong.

## 10. Relationship Effects (Hợp/Xung/Sinh/Khắc/Phá/Hóa vào Dụng/Kỵ/Nguyên chain)
| Quan hệ | Axis đi vào | Nơi |
|---|---|---|
| Sinh/Khắc (ngũ hành) | **role assignment** (Nguyên=sinh, Kỵ=khắc) + chain interaction (GENERATES/OVERCOMES) | resolveFourGods + interactionOf |
| Phá (Nguyệt/Nhật/Tuế) | **limitation (reduced)** → availability (Kỵ/Nguyên) ; + **chamDiem score** (nếu trên Dụng) | can-luc-hao:298 + advisory:294-295 |
| Hợp (Hóa Hợp) | **restrained** → availability LIMITED | can-luc-hao:306 |
| Xung | Nhật xung → movementEfficacy/reduced (Phase 25/26) ; Thế-Ứng xung (chamDiem) | (đã lock) |
| Hóa (biến) | effective (Tiến/Thoái/Hồi Sinh) + reduced (Hồi Khắc/Xung/Mộ/Tuyệt) | can-luc-hao |
- **Một quan hệ vào nhiều axis?** Phá: vào limitation (chain, mọi role) + chamDiem score (chỉ Dụng) → **theo scope hào**,
  KHÔNG cùng-1-số (26H). Sinh/Khắc: vào cả role-assignment lẫn chain-direction — nhưng đó là 2 tầng khác (định role vs
  định tác động), KHÔNG double-count.

## 11. Verdict Dependency Graph
```
ketLuanSuViec (AI prose) = concludeDung(
    DungStrength = strengthFrom(Dụng.effective, EMPTY/hidden),
    dungProtection = protectionFrom(kyPressure, nguyenSupport, dungProtection),
    temporal = temporalFrom(EMPTY/hidden/DELAYED) )
ketLuan/mucDoThuan (card) = suyKetLuan(chamDiem.diem) ; chamDiem = f(Dụng vượng/suy, Dụng relations[Phá/Sinh/Khắc/Ám Động/
    Lâm], Không Vong, Thế↔Ứng, vận trình)
```
- **Load-bearing (chain verdict):** Dụng.effective · Kỵ chain · Nguyên chain · Dụng temporal.
- **Load-bearing (card verdict):** Dụng vượng/suy · Dụng relations · Thế/Ứng · Không Vong · (timingBlocker→NÊN CHỜ).
- **INERT cho chain verdict:** Thế/Ứng (FACT), movementEfficacy, Dụng-reduced, transformationState, burialState.
- **INERT toàn cục:** transformationState, burialState (no consumer — 26G).

## 12. Counterfactual Findings
- **Kỵ/Nguyên trên chain (26H probe, xác nhận):** Phá trên Kỵ → mucDoThuan KHÔNG đổi (chamDiem không chấm Kỵ), chain phản
  ứng. Phá trên Dụng → mucDoThuan đổi (48→35, NÊN CHỜ→KHÔNG NÊN), ketLuanSuViec KHÔNG đổi. ⇒ **scope partition, no
  double-count** (đã chứng minh 26H, không chạy lại).
- **Thế/Ứng (structural counterfactual):** `concludeDung` không nhận theUng → thay đổi Thế/Ứng KHÔNG thể đổi
  `ketLuanSuViec`; chỉ đổi `chamDiem.diem` (card). ⇒ Thế/Ứng = card-only load-bearing, chain-inert. (Chứng minh bằng chữ
  ký hàm — không cần probe.)
- Không chạy probe mới (evidence call-graph + 26H đủ); nếu owner muốn số Thế/Ứng flip-rate → slice riêng.

## 13. Provenance Matrix
| Semantic | Runtime | Source (in-repo) | Runtime behavior | Class | Gap |
|---|---|---|---|---|---|
| Dụng resolve (theo hint) | resolveDungThan | spec §4 (Dụng thần) | FACT 1 lần | **B** | verbatim cổ = DATA GAP |
| Nguyên=sinh Dụng, Kỵ=khắc Dụng | resolveFourGods | spec §4 + doctrine 用/忌/原 | FACT ngũ hành | **B** | như trên |
| Kỵ pressure / Nguyên support (chain) | ky-nguyen-dung | spec §5 (10 bước Kỵ→Nguyên→Dụng) | availabilityOf→pressure/support | **C** (Quân Sư synthesis trên B) | — |
| availabilityOf LIMITED collapse | ky-nguyen-dung:81 | — | reduced+restrained+Suy→LIMITED | **C** | severity source = DATA GAP (26G) |
| concludeDung state machine | ket-luan-su-viec | spec §5 (định tính) | strength×protection×temporal→verdict | **C** | công thức verdict = methodology |
| strengthFrom bucket | ket-luan | — | effective→VERY_STRONG..VERY_WEAK | **C** | — |
| Thế/Ứng FACT (chain) | theUngSynthesisFrom | spec §4.3 khung Thế-Ứng | FACT, không verdict | **B** (khung) | — |
| Thế/Ứng score (card) ±5/−6/+3/−2 | chamDiem:307 | — | diem ± | **C/E** heuristic | magnitude không nguồn |
| chamDiem vượng/suy ±, Phá −14/−10 | chamDiem | — | diem ± | **C/E** heuristic (26H) | không cổ thư |
- Không semantic nào = **A**. Ba tầng tách: SOURCE (spec §4/§5 compiled) → QUÂN SƯ DERIVES (chain synthesis, concludeDung,
  chamDiem magnitudes) → RUNTIME DOES (như cột behavior).

## 14. Test Coverage
| Test | Số | Cover |
|---|---|---|
| `__ket-luan-su-viec.test.ts` | (verdict state machine) | Dụng strength/protection/temporal→conclusion; MIXED/UNRESOLVED |
| `__ky-nguyen-dung.test.ts` | (chain) | Kỵ pressure, Nguyên support, tham-sinh, no-Nguyên, direct |
| `__four-god.test.ts` | role | Dụng/Kỵ/Nguyên assignment |
| `__can-luc-hao.test.ts` | strength | base/effective/reduced/Không Vong/Ám Động |
| `__golden-e2e.test.ts` | E2E | fixture→report→prompt (Dụng/Kỵ/Nguyên/Thế-Ứng qua report) |
| `__report-prompt-integration.test.ts` | integration | report↔prompt drift |
- **Cover:** role assignment, chain pressure/support, verdict state machine, strength. **CHƯA cover đầy đủ:** Thế/Ứng
  chamDiem scoring (magnitudes), chamDiem verdict thresholds per-case, real-case án lệ replay (DATA GAP). Không golden
  real-case 6-hào cho verdict (prose).

## 15. Architecture Findings
| Finding | Evidence (FILE→FUNCTION→CONSUMER) | Load-bearing? | Double-count? | Provenance | Action (đề xuất, KHÔNG làm) |
|---|---|---|---|---|---|
| F1 Hai kênh verdict song song | chamDiem→card ; ket-luan-su-viec→prose | Cả hai | KHÔNG (26H scope partition) | C | (đã lock 26H) |
| F2 Dụng-reduced inert (chain) | strengthFrom đọc effective-only; Dụng≠chain source | không (chain) | — | — | ghi nhận (26H) |
| F3 Thế/Ứng chain-inert / card-load-bearing | concludeDung không nhận theUng ; chamDiem:307 chấm | card only | KHÔNG | B(khung)/C-E(score) | DQ-DKG-5 |
| F4 chamDiem magnitudes không nguồn | advisory:287/294/307 | card | — | C/E | (đã ghi 26H/26I) |
| F5 movementEfficacy/transformationState/burialState inert | grep no consumer (25I/26G) | không | — | — | cleanup debt (không blocker) |
| F6 prompt-fallback recompute role | prompt.ts:124 resolveFourGods lại | — | không (drift-guard 19) | — | ghi nhận |
| F7 Dụng-strength ở cả card+chain | chamDiem vượng/suy + strengthFrom effective | cả hai | parallel (không 1 số) | C | (đã lock 26H) |

## 16. Load-Bearing Findings
- **Chain verdict (ketLuanSuViec, AI prose #1):** Dụng.effective + Kỵ chain + Nguyên chain + Dụng temporal.
- **Card verdict (ketLuan/mucDoThuan):** Dụng vượng/suy + Dụng relations + Thế/Ứng + Không Vong + timingBlocker.
- **Có thể bỏ mà verdict KHÔNG đổi:** movementEfficacy, transformationState, burialState, Dụng-reduced (chain), Thế/Ứng
  (chain-only). (Bỏ = suy đoán; KHÔNG thực hiện.)

## 17. Data Gaps
1. Verbatim classical primary cho role doctrine + chain + concludeDung (in-repo chỉ compiled spec §4/§5).
2. chamDiem magnitudes (vượng/suy ±, Phá −14/−10, Thế/Ứng ±5/−6…) = heuristic không nguồn.
3. Real-case án lệ 6-hào replay cho verdict = DATA GAP.
4. Thế/Ứng chamDiem scoring chưa có unit test riêng cho magnitudes.
5. severity/precedence cho availabilityOf collapse = DATA GAP (26G).

## 18. Owner Decision Questions
- **DQ-DKG-1:** Dụng/Kỵ/Nguyên là FACT (resolveFourGods 1 lần) — nhưng prompt-fallback **recompute**. Có muốn ép single-
  source (report bắt buộc) để loại recompute không? *(hiện drift-guarded, không bug — priority thấp.)*
- **DQ-DKG-2:** phân tầng base/effective vs reduced/availability **đúng** (evidence §8). Xác nhận giữ nguyên?
- **DQ-DKG-3:** Kỵ pressure & Nguyên support = **independent channels, KHÔNG double-count** (chỉ chain; chamDiem không
  chấm Kỵ/Nguyên). Xác nhận không cần hành động?
- **DQ-DKG-4:** Dụng protection có **parallel channel** (card chamDiem vs chain) — đây là 26H two-domain. Giữ hay tinh
  giản card? *(sản phẩm decision, không correctness.)*
- **DQ-DKG-5:** **Thế/Ứng cần methodology lock riêng?** Hiện: FACT ở chain + scored ở card (magnitudes ±5/−6/+3/−2 không
  nguồn). Đề xuất mở gate Thế/Ứng (giống Ứng Kỳ/reduced) — **CÓ evidence yêu cầu** (F3/F4).
- **DQ-DKG-6:** chamDiem magnitudes + concludeDung state machine = C/E chưa lock provenance — có muốn methodology-lock/
  research không? *(giống chamDiem 26H — có thể gộp.)*

## 19. Explicit Non-Decisions
- KHÔNG sửa runtime/test/UI/skill/prompt. KHÔNG mở gate. KHÔNG lock Thế/Ứng. KHÔNG giải magnitudes. KHÔNG cleanup inert.
  KHÔNG reopen 25/26/Ứng Kỳ. KHÔNG research. KHÔNG chọn/bắt đầu slice.

## 20. Recommended Next Slice (đề xuất, chờ owner)
- **Ưu tiên có evidence: DQ-DKG-5 — Thế/Ứng methodology gate** (analog Ứng Kỳ/reduced): audit provenance §4.3 + card
  magnitudes, quyết candidate/scored + lock. Là slice **read-only-then-lock**, rủi ro thấp.
- Phụ: DQ-DKG-6 (chamDiem/concludeDung provenance) có thể gộp với chamDiem heuristic đã ghi 26H.
- Các DQ-1..4 = xác nhận/no-action hoặc product decision, không cấp bách.

## 21. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · UI/skill/prompt: NO · methodology: NO.** doc: YES (chỉ file này).
- Regression: **318/318 PASS** (read-only). Commit chỉ doc này. **KHÔNG push.** STOP.
