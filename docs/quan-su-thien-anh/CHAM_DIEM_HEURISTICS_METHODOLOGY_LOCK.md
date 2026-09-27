# chamDiem Heuristics — Consolidated Methodology Lock (G-TU3)

**Branch:** `quan-su-thien-anh` · **HEAD:** `abd5968` · **Nature:** DOC + METHODOLOGY GATE (no behavior change).
KHÔNG runtime/test/API/UI/prompt/skill/magnitude/refactor/cleanup, KHÔNG web research, KHÔNG reopen lock, KHÔNG push.
Baseline 318/318.

## 1. Scope
Gom + khóa methodology cho **toàn bộ magnitude heuristic trong `chamDiem`** (advisory-engine.ts:274-330). Consolidate
Thế/Ứng (abd5968) + Phá + vượng/suy + mọi bonus/penalty khác. KHÔNG đổi số.

## 2. Locked Baseline (không đụng)
Phase 25 (movementEfficacy FACT-only), Phase 26 (reduced arch, Nhật Phá Model A, Tuế Phá→reduced, 7 producers,
availabilityOf, chamDiem↔chain 2 domains), Ứng Kỳ candidate/non-overriding (0bd70aa), Thế/Ứng lock (abd5968),
Dụng/Kỵ/Nguyên audit (784157f). timingBlocker ≠ Ứng Kỳ.

## 3. Runtime Inventory (chamDiem, code trace — FULL)
`chamDiem(resolved, chinh, luck)` (advisory-engine.ts:274) — pure, `diem=50` base, additive `add(factor, delta)`
(bỏ qua delta=0), cuối `diem = clamp(0,100, round(diem))`. **Scope = Dụng (resolved.hao) + Thế/Ứng + luck.**

| # | Heuristic | Trigger (exact) | Magnitude | Consumer | Channel |
|---|---|---|---|---|---|
| 1 | Base | luôn | **50** | diem | card |
| 2 | Vượng suy (Dụng) | `VUONG_SUY_DIEM[hao.vuongSuy]` | **Vượng+12 / Tướng+6 / Hưu−2 / Tù−8 / Tử−12** | diem | card |
| 3 | Không Vong (Dụng) | `hao.xunKong` | **−12** (+timingBlocker) | diem | card |
| 4 | Được sinh | relation "Sinh" | **+7** | diem | card |
| 5 | Bị khắc | relation "Khắc" | **−7** | diem | card |
| 6 | Nguyệt Phá | relation "Nguyệt Phá" | **−14** (+timingBlocker) | diem | card |
| 7 | Nhật Phá | relation "Nhật Phá" | **−10** (+timingBlocker) | diem | card |
| 8 | Ám động | relation "Ám Động" | **+5** | diem | card |
| 9 | Đương lệnh | "Lâm Nhật"/"Lâm Nguyệt" | **+6** | diem | card |
| 10 | Được hợp | relation "Hợp" | **+3** | diem | card |
| 11 | Bị xung | relation "Xung" | **−3** | diem | card |
| 12 | Bị hại | relation "Hại" | **−3** | diem | card |
| 13 | Phục tàng | `trangThai==="phuc_tang"` | **−10** (+timingBlocker) | diem | card |
| 14 | Ứng sinh Thế | SINH[u]===t | **+5** | diem | card |
| 15 | Ứng khắc Thế | KHAC[u]===t | **−6** | diem | card |
| 16 | Thế khắc Ứng | KHAC[t]===u | **+3** | diem | card |
| 17 | Thế sinh Ứng | SINH[t]===u | **−2** | diem | card |
| 18 | Đại vận | luck band | **band×5** (−10..+10) | diem | card |
| 19 | Lưu niên | luck band | **band×2.5** (−5..+5) | diem | card |
- **File/function/consumer:** tất cả trong `chamDiem`; caller = `buildAdvisoryReport:679`; consumer = `suyKetLuan` →
  `ketLuan`/`mucDoThuan` → structured card (`render-ket-qua-client.ts`). **KHÔNG** heuristic nào ngoài chamDiem (grep
  xác nhận). `SINH`/`KHAC` = `NGU_HANH_SINH/KHAC` (FACT maps, không phải magnitude).

## 4. Score Flow
```
FACTS (hao.vuongSuy, hao.relations, hao.xunKong, trangThai, Thế/Ứng ngũ hành, luck band)
 → chamDiem: diem=50 + Σ(components) → clamp[0,100] + round → {diem, items, timingBlocker}
 → mucDoThuan = (ketLuan==="CHUA_DU_DU_LIEU" ? min(diem,45) : diem)
 → suyKetLuan(diem): ≥72 NÊN · <42 KHÔNG NÊN · timingBlocker→NÊN CHỜ · ≥58 CÓ ĐIỀU KIỆN · else NÊN CHỜ
 → ketLuan/ketLuanLabel + mucDoThuan → structured card
```
- **Clamp:** CÓ (0..100). **Normalize:** KHÔNG (chỉ clamp+round). **Thresholds:** 72 / 58 / 42 + timingBlocker.
- **Additive across categories** (vượng-suy + relations-loop + Thế/Ứng + luck cùng cộng). **Mutually exclusive trong
  nhóm:** Thế/Ứng (1 trong 4); mỗi relation-type xử 1 lần nhưng **nhiều relation** trên 1 hào đều cộng (loop). Vượng-suy
  = 1 giá trị. Luck = Đại vận + Lưu niên (2 cộng).

## 5. Heuristic Matrix (provenance per magnitude)
| Heuristic | Trigger | Score | Channel | Provenance | Status |
|---|---|---|---|---|---|
| Base 50 | luôn | 50 | card | **C/E** (điểm khởi tạo nội bộ) | keep |
| Vượng suy | vuongSuy | +12..−12 | card | direction **B** / magnitude **C/E** | keep |
| Không Vong | xunKong | −12 | card | direction **B** / magnitude **C/E** | keep |
| Được sinh / Bị khắc | Sinh/Khắc | +7/−7 | card | direction **B** / magnitude **C/E** | keep |
| Nguyệt Phá / Nhật Phá | Phá | −14/−10 | card | direction **B** / magnitude **C/E** | keep |
| Ám động | Ám Động | +5 | card | direction **B** (25C) / magnitude **C/E** | keep |
| Đương lệnh | Lâm | +6 | card | direction **B** / magnitude **C/E** | keep |
| Hợp / Xung / Hại | Hợp/Xung/Hại | +3/−3/−3 | card | direction **B** / magnitude **C/E** | keep |
| Phục tàng | phuc_tang | −10 | card | direction **B** / magnitude **C/E** | keep |
| Thế/Ứng ×4 | ngũ hành Thế↔Ứng | +5/−6/+3/−2 | card | direction **B** / magnitude **C/E** (abd5968) | keep |
| Đại vận / Lưu niên | luck band | ×5 / ×2.5 | card | **C/E** (Quân Sư luck-weighting) | keep |
| Thresholds 72/58/42, base 50 | — | — | card | **C/E** | keep |
- **KHÔNG magnitude nào = A hoặc B.** DIRECTION nhiều mục = B (sinh tốt/khắc xấu…); **magnitude = C/E** (không source).

## 6. Provenance (3 tầng tách riêng)
- **SOURCE SAYS X:** vượng tốt/suy xấu; sinh phò/khắc chế; Phá = trở ngại; Ám Động = lực ngầm; Lâm = đương lệnh; Thế/Ứng
  sinh/khắc có cát-hung (spec §3.x/§4.x, compiled → **B**).
- **QUÂN SƯ DERIVES Y:** gán **số cụ thể** (+12/−14/−10/+5/±5…/×5/×2.5) + base 50 + thresholds 72/58/42 + additive model
  (→ **C/E**).
- **RUNTIME DOES Z:** chamDiem cộng theo bảng §3 → diem → card verdict.
- **KHÔNG** mục nào được gọi classical rule: "Thế/Ứng sinh khắc có ý nghĩa" (B) ≠ "+5 là cổ điển" (C/E). Áp dụng cho MỌI
  magnitude.

## 7. Double-Count Audit
- **vs deterministic chain (26H):** chamDiem = Channel A (scope **Dụng** + Thế/Ứng + luck); chain = Channel B (scope
  **Kỵ/Nguyên** → ketLuanSuViec). Một Phá vào đúng 1 kênh theo vai hào → **B/D (parallel domains / intentional
  multi-axis), KHÔNG genuine double-count** (đã chứng minh 26H).
- **Intra-chamDiem overlap:** một hào Dụng vừa Suy vừa Nhật Phá → **vượng-suy(−) + Nhật Phá(−10)** cùng cộng. Đây là
  **D — intentional multi-axis scoring** (trục lực + trục sự-kiện quan-hệ), theo thiết kế additive; KHÔNG phải genuine
  double-count (2 tín hiệu khác loại), nhưng **ghi nhận** là additive-overlap có chủ đích. KHÔNG sửa.
- **Kết luận:** KHÔNG genuine double-count. Phân loại: A(genuine)=none; B(parallel domains)=chamDiem↔chain; C(presentation)
  =card vs prose; D(intentional multi-axis)=intra-chamDiem additive (vd Suy+Phá).

## 8. Channel Partition
- chamDiem → **card only** (`ketLuan`/`mucDoThuan`/`bangChamDiem`). **KHÔNG** vào AI prose (prompt.ts không đọc
  bangChamDiem — 26H). Deterministic chain (ketLuanSuViec) = kênh riêng, priority #1 cho prose. **KHÔNG merge.**

## 9. Current-Lock Compatibility
| Lock | Vi phạm? |
|---|---|
| Phase 25 movementEfficacy FACT-only | KHÔNG (chamDiem không đọc movementEfficacy) |
| Phase 26 reduced / Nhật Phá Model A / Tuế Phá / 7 producers / availabilityOf | KHÔNG (chamDiem không đọc reduced; đọc relations "Nhật/Nguyệt Phá" trực tiếp — kênh riêng) |
| timingBlocker ≠ Ứng Kỳ | KHÔNG (timingBlocker chỉ set bởi Không Vong/Phá/phục_tang → NÊN CHỜ; không phải Ứng Kỳ) |
| Ứng Kỳ candidate/non-overriding | KHÔNG |
| Thế/Ứng card-only (abd5968) | KHÔNG (nhất quán) |
| Dụng/Kỵ/Nguyên partition (784157f) | KHÔNG (chamDiem chỉ chấm Dụng) |
- **KHÔNG conflict.**

## 10. Consolidated Classification (taxonomy)
- **TIER 1 — FACT (input):** hao.vuongSuy, hao.relations (Sinh/Khắc/Phá/Ám Động/Lâm/Hợp/Xung/Hại), hao.xunKong,
  trangThai, Thế/Ứng ngũ hành, SINH/KHAC maps, luck band.
- **TIER 2 — SOURCE-SUPPORTED SEMANTIC (direction, B):** vượng tốt/suy xấu; sinh/khắc/Phá/Ám Động/Lâm ý nghĩa; Thế/Ứng
  sinh khắc cát-hung.
- **TIER 3 — QUÂN SƯ SCORING HEURISTIC (magnitude, C):** tất cả số (+12…−14, ±5/−6/+3/−2, ×5/×2.5, base 50, thresholds).
- **TIER 4 — UNSOURCED / DATA GAP (E):** cơ sở định-lượng cho mọi magnitude + base + threshold (không có source).
- ⇒ **KHÔNG tầng nào bị gọi nhầm "cổ điển".**

## 11. Decision Gate
| Tiêu chí | Kết quả |
|---|---|
| A. Runtime deterministic | **PASS** (pure, clamp+round) |
| B. Scope partition | **PASS** (card scope Dụng+Thế/Ứng+luck; chain riêng — 26H) |
| C. No genuine double-count | **PASS** (parallel/multi-axis; intra Suy+Phá = intentional additive) |
| D. Provenance transparency | **PASS** (direction B ≠ magnitude C/E, minh bạch) |
| E. Current behavior stable | **PASS** (318/318) |
| F. Classical verification | **NOT VERIFIED** (magnitudes không source — không blocker vì labeled heuristic) |

**GATE = PASS → RELEASE (labeled methodology/internal scoring).**

## 12. Methodology Lock (nguyên tắc khóa)
1. `chamDiem` = **structured-card scoring channel**, KHÔNG phải deterministic verdict engine.
2. chamDiem score KHÔNG tự động override: `ketLuanSuViec` / deterministic chain / `reduced` / `movementEfficacy` / Ứng Kỳ.
3. **Mọi magnitude hiện tại = methodology/scoring heuristic (C)** khi chưa có source; DIRECTION có thể B nhưng MAGNITUDE
   giữ C/E.
4. KHÔNG gọi magnitude là classical fact khi provenance chưa đạt A/B cho chính con số đó.
5. **Thế/Ứng +5/−6/+3/−2 giữ nguyên** (abd5968).
6. **Phá trên Dụng −14/−10 giữ nguyên.**
7. **Vượng/Suy (+12..−12) + các heuristic khác (Sinh+7/Khắc−7/Ám Động+5/Lâm+6/Hợp+3/Xung−3/Hại−3/Không Vong−12/Phục
   tàng−10/Đại vận×5/Lưu niên×2.5/base 50/thresholds) giữ nguyên behavior.**
8. KHÔNG tự tạo severity/precedence cho reduced.
9. **timingBlocker vẫn độc lập với Ứng Kỳ.**
10. KHÔNG merge chamDiem với deterministic chain.

## 13. Explicit Non-Decisions
KHÔNG đổi bất kỳ magnitude/base/threshold; KHÔNG thêm/bớt heuristic; KHÔNG classical upgrade; KHÔNG web research; KHÔNG
viết test; KHÔNG UI redesign; KHÔNG skill change; KHÔNG đổi verdict/prompt; KHÔNG refactor/cleanup chamDiem; KHÔNG reopen
lock. (Future slices.)

## 14. Future Research / Test Candidates (chờ owner)
- **G-TU1:** primary-source research cho DIRECTION (nâng B→A) — KHÔNG kỳ vọng magnitude có nguồn cổ (heuristic vốn nội bộ).
- **G-TU2:** dedicated unit tests cho magnitude table (§3) + threshold flow (đóng TEST GAP) — no-behavior-change.
- **G-TU4 (mới):** nếu muốn giảm phụ thuộc heuristic → cân nhắc thay chamDiem card bằng deterministic chain làm nguồn
  verdict duy nhất (product decision, 26H OD-H1) — KHÔNG làm ở đây.

## 15. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · UI/skill/prompt: NO · magnitude: NO.** doc: YES (chỉ file này).
- Regression: **318/318 PASS** (read-only). Commit chỉ doc này. **KHÔNG push.** STOP (không tự làm G-TU1/G-TU2).
