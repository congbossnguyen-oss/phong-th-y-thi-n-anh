# Thế / Ứng — Methodology Gate & Lock

**Branch:** `quan-su-thien-anh` · **HEAD:** `784157f` · **Nature:** AUDIT → DECISION GATE → METHODOLOGY LOCK (doc-only).
KHÔNG runtime/test/API/UI/prompt/skill/rule/magnitude change, KHÔNG refactor/cleanup, KHÔNG web research, KHÔNG reopen
Phase 25/26/Ứng Kỳ/Dụng-Kỵ-Nguyên/chamDiem/deterministic verdict, KHÔNG push. Baseline 318/318.
**Source of truth:** `DUNG_KY_NGUYEN_SEMANTIC_PROVENANCE_AUDIT.md` (784157f) + code thật.

## 1. Scope
Methodology gate riêng cho semantic **Thế / Ứng** (世/应): FACT status, scoring channel, provenance của khung + 4
magnitudes, release decision. Không đụng score.

## 2. Existing Locked Architecture (không đụng)
Phase 25/26 STABLE; Ứng Kỳ candidate/non-overriding (0bd70aa); Dụng/Kỵ/Nguyên FACT + 2 kênh verdict song song (chamDiem
card ↔ deterministic chain prose, KHÔNG double-count — 784157f/26H). chamDiem = internal heuristic.

## 3. Runtime Facts (code trace)
- **A1/A2 Thế/Ứng resolve:** FACT `HaoInfo.theUng ∈ {"Thế","Ứng"}` (do engine `luc-hao.ts` gán theo vị trí Thế/Ứng của
  quẻ). Đọc qua `chinh.hao.find(h => h.theUng === …)`. KHÔNG recompute role; KHÔNG legacy engine.
- **A3 magnitudes (chamDiem, advisory-engine.ts:311-315), theo ngũ hành 2 hào:**
  | Điều kiện | Score |
  |---|---|
  | Ứng **sinh** Thế | **+5** ("phía bên kia thuận về mình") |
  | Ứng **khắc** Thế | **−6** ("bên kia lấn át mình") |
  | Thế **khắc** Ứng | **+3** ("mình chủ động") |
  | Thế **sinh** Ứng | **−2** ("mình hao tổn cho việc/người") |
  | đồng hành / không quan hệ ngũ hành | (không score) |
- **A4 cộng dồn?** KHÔNG — `if/else if` → **đúng 1** nhánh (4 quan hệ loại trừ lẫn nhau).
- **A5 threshold?** Không có threshold riêng Thế/Ứng; score cộng vào `cham.diem` → suyKetLuan thresholds chung (≥72/<42/
  58) của **card**.
- **A6 consumer khác?** (i) `chamDiem` (±score, card). (ii) `resolveDungThan` (advisory:119-134): khi câu hỏi kind
  `the-hao`/`ung-hao`/`framework` → **Dụng = Hào Thế/Ứng** (role-SELECTION, KHÔNG phải ±score). (iii)
  `theUngSynthesisFrom` (ket-luan): FACT trong ketLuanSuViec, **không** phán tốt/xấu. (iv) `luanChiTiet:647`: prose mô tả
  demo.
- **A7 AI prose đọc ±score?** **KHÔNG** — prompt.ts KHÔNG tham chiếu bangChamDiem/mucDoThuan (xác nhận 26H). ±5/−6/+3/−2
  = **card channel ONLY**.
- **A8 recomputation?** Không — `.find(theUng)` đọc FACT nhiều lần, không tính lại role.
- **A9 legacy?** Không có Thế/Ứng engine thứ 2.

## 4. Semantic Classification (3 tầng tách riêng)
- **SOURCE SAYS X:** 世=ta, 应=đối phương/việc; sinh/khắc giữa Thế↔Ứng có ý nghĩa cát/hung (khung Thế-Ứng — spec §4.1/
  §4.3, compiled). → hướng (direction) có source.
- **QUÂN SƯ DERIVES Y:** gán **cường độ số** cho từng quan hệ (+5/−6/+3/−2) + đưa vào thang điểm card. → magnitude là
  suy diễn methodology, KHÔNG có trong source.
- **RUNTIME DOES Z:** `chamDiem` cộng đúng 1 trong 4 số vào `diem` → góp vào `ketLuan`/`mucDoThuan` (card). ketLuanSuViec
  (prose) KHÔNG nhận (concludeDung không có tham số Thế/Ứng).

## 5. Provenance Matrix
| Item | Runtime | Source (in-repo) | Classification | Release status |
|---|---|---|---|---|
| Thế/Ứng khung (Thế=ta, Ứng=đối phương) | `theUng` FACT + resolveDungThan | spec §4.1/§4.3 (compiled) | **B** | PASS (FACT) |
| Điều kiện Ứng sinh/khắc Thế = thuận/bất lợi | chamDiem direction | khung Thế-Ứng sinh/khắc (spec §4.x, compiled) | **B** (direction) | PASS (label heuristic scoring) |
| Điều kiện Thế khắc/sinh Ứng = chủ động/hao tổn | chamDiem direction | như trên | **B** (direction) | PASS |
| **+5** (Ứng sinh Thế) | advisory:312 | — | **C/E** (magnitude heuristic) | PASS WITH LABEL |
| **−6** (Ứng khắc Thế) | advisory:313 | — | **C/E** | PASS WITH LABEL |
| **+3** (Thế khắc Ứng) | advisory:314 | — | **C/E** | PASS WITH LABEL |
| **−2** (Thế sinh Ứng) | advisory:315 | — | **C/E** | PASS WITH LABEL |
| Threshold card (≥72/<42/58) | suyKetLuan | — | **C/E** (chamDiem heuristic, 26H) | (đã ghi 26H) |
| Thế/Ứng làm Dụng (the-hao/ung-hao/framework) | resolveDungThan | spec §4.1/§4.3 | **B** (role selection) | PASS |
- **KHÔNG item nào = A.** Direction (B) tách khỏi magnitude (C/E) — source support "Thế/Ứng có ý nghĩa sinh/khắc" NHƯNG
  KHÔNG support "+5".

## 6. Scoring Rules (ghi nhận, KHÔNG đổi)
±5/−6/+3/−2 = **Quân Sư scoring heuristic**, mutually-exclusive, card-channel only, không cộng dồn, không vào deterministic
verdict, không vào AI prose. **KHÔNG đổi magnitude ở phase này.**

## 7. Decision Gate
| Tiêu chí | Kết quả |
|---|---|
| **FACT status** | **PASS** (theUng FACT; role-selection Dụng hợp lệ) |
| **Semantic status** | **PASS** (direction sinh/khắc có source B) |
| **Scoring status** | **C/E** (magnitudes heuristic, no source) |
| **Provenance transparency** | **PASS** (B khung/direction ≠ C/E magnitude, minh bạch) |
| **Test status** | **TEST GAP** (không unit test riêng cho ±magnitudes; golden-e2e chạy qua report nhưng không assert số) |

**GATE = PASS → RELEASE WITH METHODOLOGY LABEL.** (FACT/semantic PASS; scoring heuristic được release kèm nhãn "Quân Sư
scoring heuristic", KHÔNG tuyên bố cổ điển.)

## 8. Release Status
Thế/Ứng **RELEASED**: FACT-only trong deterministic chain; **scoring channel (card) giữ nguyên** với nhãn **Quân Sư
heuristic**. KHÔNG merge với deterministic chain. KHÔNG double-count (parallel channel — 26H/784157f).

## 9. Locked Principles
1. Thế/Ứng là **FACT** (`theUng`); role-selection làm Dụng (the-hao/ung-hao/framework) là hợp lệ và đi qua chain **với
   tư cách Dụng**, KHÔNG phải qua ±score.
2. **Relational ±score (5/−6/+3/−2) KHÔNG** được tự biến thành deterministic verdict input (concludeDung) nếu chưa có
   methodology decision riêng.
3. Magnitudes **±5/−6/+3/−2 = Quân Sư scoring heuristic** — KHÔNG gọi là classical rule khi chưa có source.
4. Direction (sinh/khắc Thế↔Ứng có ý nghĩa) = **B** (khung §4.x); magnitude = **C/E** — giữ 2 provenance riêng.
5. Thế/Ứng scoring chỉ thuộc **card/scoring channel hiện tại** (chamDiem). KHÔNG vào AI prose.
6. KHÔNG merge Thế/Ứng scoring với deterministic chain. KHÔNG coi là double-count.
7. KHÔNG đổi magnitude / threshold ở phase này.

## 10. Test Coverage
- **Cover:** Thế/Ứng FACT + role-selection (qua `__four-god`/`__golden-e2e` report path); theUngSynthesisFrom FACT (qua
  ket-luan tests).
- **CHƯA cover (TEST/DATA GAP):** dedicated unit test cho 4 magnitudes (±5/−6/+3/−2 điều kiện→score); golden-e2e KHÔNG
  assert giá trị score Thế/Ứng cụ thể; không real-case validation.

## 11. Explicit Non-Decisions
KHÔNG đổi +5/−6/+3/−2; KHÔNG đưa Thế/Ứng ±score vào deterministic verdict; KHÔNG merge scoring↔chain; KHÔNG web research;
KHÔNG classical source upgrade; KHÔNG UI redesign; KHÔNG skill change; KHÔNG reopen lock nào; KHÔNG viết test.

## 12. Future Research Candidates (chờ owner)
- **G-TU1:** research primary-source (世应生克 应期/cát-hung) để nâng direction B→A + tìm cơ sở cho magnitude (hiện C/E).
- **G-TU2:** dedicated unit test cho 4 magnitudes (đóng TEST GAP) — no-behavior-change.
- **G-TU3:** (gộp) methodology-lock chamDiem magnitudes tổng thể (Thế/Ứng + Phá −14/−10 + vượng/suy) như 1 heuristic set
  (đã gợi ý 26H/26I DQ) — product/provenance decision.

## 13. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · UI/skill/prompt: NO · magnitude: NO.** doc: YES (chỉ file này).
- Regression: **318/318 PASS** (read-only). Commit chỉ doc này. **KHÔNG push.** STOP.
