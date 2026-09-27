# Lục Hào — Final End-to-End Release Audit

**Branch:** `quan-su-thien-anh` · **HEAD:** `e71a37c` · **Nature:** READ-ONLY RELEASE AUDIT. KHÔNG sửa production/test/
methodology/UI/skill/prompt/API/score/threshold/verdict, KHÔNG push. Findings-only. Baseline **359/359 PASS**.

## 1. Executive Summary
Toàn bộ pipeline Lục Hào Quân Sư chạy **end-to-end** từ input quẻ → FACT → deterministic verdict → chamDiem → Ứng Kỳ →
report → prompt → Quân Sư prose. Single-source mỗi domain, không legacy engine, không dead-end. Mọi lock (Phase 25/26,
Nhật Phá Model A, Tuế Phá, reduced 7-producer, availabilityOf, movementEfficacy FACT-only, chamDiem card-only, chain
prose-only, Thế/Ứng card scoring, Ứng Kỳ candidate/non-overriding, timingBlocker≠Ứng Kỳ) **được tôn trọng** trong E2E.
Provenance được label trung thực (magnitude = heuristic, KHÔNG cổ điển). **KHÔNG blocker.**
**→ RELEASE GATE = A (PASS / RELEASE CANDIDATE)** với non-blocking debt đã ghi.

## 2. Release Scope
Lục Hào module (`src/lib/quan-su/*` + `src/lib/luc-hao*.ts`). KHÔNG gồm concurrent WIP (western-astrology/CMS/ThaiAt/
KyMon/chart-profile/api/`*.astro`).

## 3. Entry Point
`runQuanSu(input)` (orchestrator.ts:83) → cast theo `castingMethod` (gieo-tay / tosses / random / mai-hoa / seri-tien) →
`buildAdvisoryReport(payload)` (advisory-engine.ts:676) → `luanGiaiBangAI(payload, {..., report})` → `userPrompt(report)`
→ AI prose. **Một entry, một luồng, không rẽ nhánh legacy.**

## 4. FACT Pipeline (17 bước)
| # | Stage | Symbol | Trạng thái |
|---|---|---|---|
| 1 | Input/Cast | `lucHaoCast*` / `lapQueDayDu` | ✓ FACT (6 hào napGiap/lục thân/thế-ứng/quan hệ) |
| 2 | Hào FACTs | `HaoInfo` (relations, vuongSuy, xunKong, theUng, isDong) | ✓ engine canonical |
| 3 | Dụng/Kỵ/Nguyên | `resolveDungThan` + `resolveFourGods` | ✓ FACT (Dụng hint; Nguyên=sinh, Kỵ=khắc) |
| 4 | Thế/Ứng | `HaoInfo.theUng` + `theUngSynthesisFrom` | ✓ FACT (chain) + score (card) |
| 5 | Vượng/Suy | `HaoInfo.vuongSuy` (Nguyệt lệnh) | ✓ FACT |
| 6 | Effective/Base | `canLucHao().currentState.{base,effective}` | ✓ (hóa biến nâng/hạ effective) |
| 7 | Relations | `HaoInfo.relations` (Nhật/Nguyệt/biến) | ✓ FACT |
| 8 | Reduced | `currentState.reduced` (7 producers) | ✓ (26F/G locked) |
| 9 | Availability | `availabilityOf` (reduced‖restrained‖Suy→LIMITED) | ✓ (26 locked) |
| 10 | Kỵ pressure | `synthesizeKyNguyenDung.kyPressure` | ✓ chain (scope Kỵ) |
| 11 | Nguyên support | `.nguyenSupport` | ✓ chain (scope Nguyên) |
| 12 | Dụng protection | `.dungProtection` → `protectionFrom` | ✓ |
| 13 | Deterministic verdict | `concludeDung(strength,protection,temporal)` → `ketLuanSuViec` | ✓ prose #1 |
| 14 | chamDiem | `chamDiem` → `ketLuan`/`mucDoThuan`/`bangChamDiem` | ✓ card only |
| 15 | Ứng Kỳ | `synthesizeUngKy` → `report.ungKy` | ✓ candidate/non-overriding |
| 16 | Report | `buildAdvisoryReport` → `AdvisoryReport` | ✓ đủ FACT layers |
| 17 | Prompt → prose | `userPrompt(report)` → `luanGiaiBangAI` | ✓ serialize, priority guardrail |

## 5. Dụng / Kỵ / Nguyên
FACT roles (784157f). Kỵ/Nguyên → chain (single-channel, KHÔNG double-count với chamDiem — scope partition 26H). Dụng
strength = effective (chain) + vượng/suy (card) = parallel domains. ✓ nhất quán lock.

## 6. Strength / Relations
base/effective (canLucHao) vs reduced/availability vs movementEfficacy (FACT-only) vs vượng/suy — 4 trục tách đúng (25/26
locked). Relations feed role-assignment (sinh/khắc) + chain-direction + card score theo scope. ✓ không trộn axis.

## 7. Reduced / Availability
7 producers (nguyet/nhat/tuePha + hoiDauKhac/hoaXung/hoaMo/hoaTuyet), tất cả reachable + load-bearing (26F/G/R3).
availabilityOf gộp reduced+restrained+Suy→LIMITED (design). Dụng-reduced inert (chain); Kỵ/Nguyên-reduced active. ✓.

## 8. Deterministic Verdict
`ketLuanSuViec` = concludeDung(Dụng.effective, Kỵ/Nguyên protection, temporal). FAVORABLE/…/UNRESOLVED. Score-free,
candidate-aware. **Prose priority #1** (prompt §54). Thế/Ứng + movementEfficacy + Dụng-reduced KHÔNG vào (FACT-only). ✓.

## 9. chamDiem
Card scoring channel (base 50 + additive + clamp[0,100] + round; thresholds 72/58/42 + timingBlocker→NÊN CHỜ). Scope =
Dụng + Thế/Ứng + luck. **KHÔNG đọc bởi AI prose** (prompt không tham chiếu bangChamDiem — 26H). Magnitudes = Quân Sư
heuristic (bf044d3; provenance C/E — e71a37c). ✓ không phá deterministic semantics (kênh riêng).

## 10. Ứng Kỳ
`synthesizeUngKy` = candidate (SUPPORTED/POSSIBLE/DELAYED/UNRESOLVED), **KHÔNG override conclusion** (prompt:206). Đọc
currentState (EMPTY/hidden) + vượng/suy, KHÔNG đọc movementEfficacy (0bd70aa). timingBlocker (chamDiem) ≠ Ứng Kỳ. ✓.

## 11. Report → Prompt
`AdvisoryReport` mang: fourGods, canLuc (movementEfficacy FACT), kyNguyenDung, ketLuanSuViec, ungKy, hinh, cuuThan,
haoTimeRelations, chamDiem outputs. `userPrompt(report)` serialize (Phase 19 single-synthesis, drift-guarded). Guardrail
"NGUỒN SỰ THẬT DETERMINISTIC" (priority: KẾT LUẬN > KỴ→NGUYÊN→DỤNG > CÂN LỰC > contextual > raw). ✓ prompt nhận đủ FACT,
KHÔNG coi score card là cổ điển (prompt không đọc bangChamDiem), KHÔNG cho Ứng Kỳ override.

## 12. Quân Sư Prose
`luanGiaiBangAI` diễn giải từ report (ketLuanSuViec authoritative). Prose KHÔNG bỏ FACT chính (golden-e2e + ai-fidelity
assert prompt mang nguyên văn state/conclusion). ✓.

## 13. Golden E2E Evidence (case đại diện A–J)
| Yêu cầu | Test |
|---|---|
| A. Dụng mạnh | G1 (Vượng → conclusion ≠ UNRESOLVED) |
| B. Dụng yếu | G2 (Suy → WEAK) |
| C. Kỵ pressure | G10 (chain), G12 |
| D. Nguyên support | G12 (tham sinh cứu) |
| E. Reduced/limitation | G4 (Nguyệt Phá), G8 (Hồi Đầu Khắc) |
| F. Nhật Phá / Tuế Phá | G5 (Nhật Phá≠Ám Động); Tuế Phá → __can-luc-hao |
| G. Movement efficacy | __movement-efficacy (T1-T9), __nhat-xung |
| H. Ứng Kỳ candidate | G3, G15 (MULTIPLE_CANDIDATES primary null) |
| I. chamDiem | __cham-diem-magnitudes (41) |
| J. prompt → prose | golden-e2e serialize + __report-prompt-integration + __ai-fidelity |
- Adversarial A–J (golden-e2e:185-237): Không Vong≠0, Phá≠erase, Hình≠Khắc, Cừu≠Kỵ, Nhật Phá≠Ám Động, MIXED/UNRESOLVED/
  MULTIPLE không flip, Hóa Hợp≠Suy, Hồi Đầu Sinh≠Hóa Hợp — **tất cả PASS**. Drift guard PASS.
- **23 test files, 359/359 PASS.**

## 14. Lock Compatibility (E2E)
| Lock | E2E tôn trọng? |
|---|---|
| Movement Efficacy FACT-only | ✓ (canLuc mang FACT, không consumer verdict) |
| Nhật Phá Model A | ✓ (reduced vô điều kiện) |
| reduced 7 producers | ✓ |
| availabilityOf behavior | ✓ (không đổi) |
| chamDiem card-only | ✓ (prose không đọc) |
| deterministic chain prose-only | ✓ (ketLuanSuViec priority #1) |
| Thế/Ứng scoring card-only | ✓ |
| Ứng Kỳ candidate/non-overriding | ✓ |
| timingBlocker ≠ Ứng Kỳ | ✓ |
- **KHÔNG vi phạm lock nào.**

## 15. Provenance Presentation
- Final prose KHÔNG tuyên bố "cổ điển quy định X điểm" (prompt không đưa magnitude/bangChamDiem vào prose; e71a37c xác
  nhận magnitude = C/E heuristic). Directions (sinh/khắc/Phá/vượng-suy) = B (cổ điển). ✓.
- Ứng Kỳ được coi = **candidate/non-overriding** ✓.

## 16. Findings
- **F1 (info):** Dụng strength & Thế/Ứng xuất hiện ở cả card lẫn (Dụng) chain = parallel domains, KHÔNG double-count (26H).
- **F2 (info):** chamDiem magnitudes 100% C/E (product heuristic) — labeled đúng, KHÔNG present là cổ điển.
- **F3 (info):** transformationState/burialState inert (no consumer) — cleanup candidate.
- **F4 (info):** R5 Nhập Mộ `canAudit` + Hóa Mộ→XUAT_MO BLOCKED — documented gaps.
- KHÔNG finding nào là correctness defect.

## 17. Blockers
**KHÔNG.** Pipeline chạy E2E; verdict deterministic đúng; FACT không mất/trộn; Ứng Kỳ không override; chamDiem không phá
deterministic; không vi phạm lock; prompt integration đúng FACT; regression 359/359.

## 18. Non-Blocking Debt (KHÔNG chặn release)
1. chamDiem magnitude provenance = C/E (heuristic, không cổ điển) — G-TU1 đã ghi; nâng cần data/owner.
2. 153–163 án lệ chưa replay 6-hào (validation DATA GAP).
3. R5 canAudit (engine Nhập Mộ audit debt).
4. Hóa Mộ → XUAT_MO BLOCKED (no source).
5. Chưa có Lục Hào provenance ledger.
6. transformationState/burialState inert duplication (cleanup).
7. Hai bề mặt verdict song song (card chamDiem + prose chain) — presentational (26H product decision OD-H1).

## 19. Final Release Gate
### **A — PASS / RELEASE CANDIDATE**
Lục Hào Quân Sư pipeline **stable, deterministic, lock-compliant, E2E-verified (359/359)**. Non-blocking debt đã tài liệu
hóa, không cái nào là correctness defect. Provenance labeled trung thực. **Sẵn sàng release** ở dạng: deterministic verdict
(prose, authoritative) + chamDiem card (labeled heuristic) + Ứng Kỳ candidate.

## 20. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · UI/skill/prompt: NO.** doc: YES (chỉ file này).
- Regression: **359/359 PASS** (read-only). Commit chỉ doc này. **KHÔNG push.** STOP.
