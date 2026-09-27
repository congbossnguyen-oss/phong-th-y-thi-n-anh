# Ứng Kỳ — Provenance & Runtime Audit

**Branch:** `quan-su-thien-anh` · **HEAD:** `dcb99c1` · **Nature:** AUDIT + DECISION GATE (read-only). KHÔNG
implementation/refactor/methodology/rule-creation, KHÔNG reopen phase đã LOCK, KHÔNG đụng western-astrology WIP,
KHÔNG push. Baseline 318/318.

---

## 1. Scope
Mở domain **Ứng Kỳ** (mốc thời gian ứng nghiệm — "KHI NÀO?") bằng audit read-only: runtime, call graph, methodology/spec,
classical source, rule matrix, `timingBlocker`, dependency vào kiến trúc đã lock, test coverage, status, gaps, candidates.

## 2. Runtime Inventory
**TỒN TẠI — IMPLEMENTED.** Đúng **2 engine** (grep xác nhận, KHÔNG duplicate/legacy):
| File | Vai trò | Export chính |
|---|---|---|
| `src/lib/luc-hao-ung-ky.ts` | **Base engine** — 8 quy luật §6 | `tinhUngKy(input): KetQuaUngKy` |
| `src/lib/quan-su/ung-ky-synthesis.ts` | **Adapter (Phase 14)** — tổng hợp per-role | `synthesizeUngKy(cast, dt, fourGods): UngKySynthesis` |
- Phụ trợ: `luc-hao-tam-hop-cuc.ts` (`phanLoaiSauTamHop` cung cấp `ungKyChi`/`benhLine` — consumed by synthesis).
- Types (base): `LoaiKichHoat` (11: Trị/Xung/Hợp/Điền Thực/Xung Mộ/Xung Hợp/Trường Sinh/Sinh/Khắc/Xung Phi Thần/Qua
  Tháng); `TrangThaiDungThan` (11: dong/tinh/tuan-khong/nguyet-pha/nhap-mo/bi-hop/phuc-tang/qua-vuong/huu-tu-gap-truong-
  sinh/tien-than/thoai-than); `UngVienUngKy {chi, chiIndex, loai, tuTrangThai, lyDo, uuTien, canAudit?}` (có precedence
  `uuTien` + cờ `canAudit`).
- Types (synthesis): `UngKyKind`, `UngKyDateType (DAY/MONTH/YEAR/PERIOD)`, `UngKyRole (DUNG/KY/NGUYEN/THE/UNG/OTHER)`,
  `UngKyCandidateStatus (SUPPORTED/POSSIBLE/DELAYED/UNRESOLVED)`, `UngKySynthesis {candidates, primary, status, reasons}`.
- **A. Engine tính Ứng Kỳ? CÓ** (tinhUngKy + synthesizeUngKy). **B. Data structure? CÓ** (UngKySynthesis/UngVienUngKy).
  **C. API output? CÓ** (`AdvisoryReport.ungKy`). **D. UI? KHÔNG** (card `render-ket-qua-client.ts` KHÔNG render ungKy).
  **E. Prompt/AI? CÓ** (prompt.ts:206-211). **F. Test/fixture? CÓ** (§9).

## 3. Call Graph
```
UngKyInput {cast, viTriHao} → tinhUngKy (8 quy luật §6, đọc lại HaoInfo/vượng-suy/Tuần Không/Nguyệt Phá/Trường Sinh/
   Phục Thần từ luc-hao.ts — KHÔNG tính lại) → KetQuaUngKy {ungVien[], ...}
synthesizeUngKy(cast, dt, fourGods):
   - Dụng: tinhUngKy(viTriHao=Dụng) → candidates
   - Kỵ/Nguyên: CHỈ khi bị blocker → addNodeIfBlocked: đọc canLucHao(cast,hao).currentState → nếu
     temporalExistence==="EMPTY" (Không Vong) hoặc hidden (Nhập Mộ) → tinhUngKy → kinds XUAT_KHONG/XUAT_MO
   - phanLoaiSauTamHop → ungKyChi (Tam Hợp cục)
   → UngKySynthesis {candidates, primary, status}
buildAdvisoryReport (advisory-engine:706) → report.ungKy
prompt.ts:206-211 → serialize {status, primary, candidates, reasons} vào AI prose — "candidate, KHÔNG override conclusion"
```
- **Production runtime:** cả 2 engine + synthesis (live trong buildAdvisoryReport + prompt). **KHÔNG dead/legacy/WIP**
  duplicate (chỉ 1 base + 1 adapter).

## 4. Methodology / Spec Inventory
| Topic | Documentation | Runtime | Test | Status |
|---|---|---|---|---|
| 8 quy luật Ứng Kỳ | **spec §6 "LỚP 6 — Ứng Kỳ: 8 quy luật"** (LUAN_QUE_LUC_HAO_SPEC.md:411+) + 4 ghi chú bổ sung | `tinhUngKy` | __ung-ky-synthesis (21) | IMPLEMENTED |
| Ứng Kỳ theo loại việc (vd đòi nợ) | spec §4.4/§348 line ~348 (Ứng Kỳ đòi nợ) | (qua tinhUngKy/loai) | golden-e2e | IMPLEMENTED (một phần) |
| Tam Hợp ungKyChi | §3.7/kien-thuc-bo-sung | `phanLoaiSauTamHop` | __sau-tam-hop (9) | IMPLEMENTED |
| "KHÔNG chế rule Ứng Kỳ [cho 散/愈动]" | spec §3.10.1 invariant #9 | (movementEfficacy KHÔNG đọc ungKy) | — | LOCKED (Phase 25I) |
- Search Unicode variants (应期/應期/ứng kỳ/ungKy/timing): runtime ở §2; docs ở spec §6 + rải rác §4/§3.5/§3.10. Không có
  file provenance-ledger riêng cho Ứng Kỳ.

## 5. Classical Source Inventory (chỉ evidence trong repo — KHÔNG web research)
- **Nguồn:** spec §6 (8 quy luật) đúc kết từ bộ nguồn dự án (§"Ghi chú nguồn": Vương Hổ Ứng, Nguyễn Huy Hoàng, Giả Bỉnh
  Nhiên, Học Viện Minh Việt — **bản dịch/OCR tiếng Việt**, KHÔNG phải Hán văn gốc). Engine comment (luc-hao-ung-ky.ts:3)
  trỏ thẳng "§6 + 4 ghi chú bổ sung".
- **Claim per rule:** 8 trạng thái Dụng → chi kích hoạt (Trị/Xung/Hợp/Điền Thực/Xung Mộ/Xung Hợp/Trường Sinh/Qua Tháng).
- **Provenance reference:** spec §6 (in-repo, translated compilation). **KHÔNG có** đối chiếu verbatim Hán văn per-rule
  trong repo.
- **FACT vs EFFECT:** đây là **rule ánh xạ (EFFECT: trạng thái → mốc chi)** từ nguồn dịch — **B (source-backed EFFECT,
  translated)**; verbatim classical per-rule = **D (AMBIGUOUS/chưa đối chiếu)**.
- **Implementation mapping:** CÓ (mỗi trạng thái → nhánh trong tinhUngKy).
- **Validation evidence:** bộ 153 án lệ = **DATA GAP** (prose, không replay 6-hào — nhất quán Phase 14/20).

## 6. Existing Rule Matrix (8 quy luật §6 → tinhUngKy)
| Rule | Condition (TrangThaiDungThan) | Output (LoaiKichHoat → chi) | Source | Provenance | Consumer | Test | Status |
|---|---|---|---|---|---|---|---|
| R1 | dong (phát động) | Trị (+ Hợp nếu "động chờ hợp") | §6 | B/D | synthesizeUngKy→prompt | có | **C (methodology, impl)** |
| R2 | tinh (an tĩnh) | Trị + Xung ("tĩnh chờ xung") | §6 | B/D | ✓ | có | C |
| R3 | tuan-khong (Không Vong) | Điền Thực / Xung Không (XUAT_KHONG) | §6 | B/D | ✓ (gate EMPTY) | có | C |
| R4 | nguyet-pha | Điền Thực / Qua Tháng | §6 | B/D | ✓ | có | C |
| R5 | nhap-mo | Xung Mộ (XUAT_MO) | §6 | B/D + `canAudit` | ✓ (gate hidden) | có | C (+audit flag) |
| R6 | bi-hop | Xung Hợp | §6 | B/D | ✓ | một phần | C |
| R7 | huu-tu-gap-truong-sinh | Trường Sinh | §6 | B/D | ✓ | một phần | C |
| R8 | qua-vuong / tien-than / thoai-than | Trị/Xung + biến | §6 | B/D | ✓ | một phần | C |
| R-TH | Tam Hợp cục | ungKyChi (phanLoaiSauTamHop) | §3.7 | B/D | ✓ | __sau-tam-hop | C |
- Phân loại tổng: **C — Quân Sư methodology decision (đã implement từ nguồn dịch)**, verbatim classical per-rule = **D**;
  validation án lệ = **DATA GAP**. Không rule nào ở mức **A (classical FACT verbatim verified)**.

## 7. timingBlocker Audit
- **KHÔNG PHẢI Ứng Kỳ.** `timingBlocker` (advisory-engine.ts:271/277/289/294/295/304) là **boolean của `chamDiem`**
  (kênh legacy score), bật khi Dụng bị **Không Vong / Nguyệt Phá / Nhật Phá / phục_tang** → `suyKetLuan` trả **NEN_CHO**
  (:343). Nó là **constraint "chưa tới lúc"**, KHÔNG dự đoán mốc chi cụ thể.
- **Tạo:** trong chamDiem (scope Dụng). **Consumer:** suyKetLuan → `ketLuan` (card verdict). **KHÔNG** đọc/ghi engine
  ungKy; **KHÔNG** feed `report.ungKy`.
- ⇒ **timingBlocker ≠ Ứng Kỳ** (semantics khác: blocker verdict vs prediction mốc). KHÔNG đồng nhất.

## 8. Dependencies on Locked Architecture
| Locked item | Ứng Kỳ có đọc? | Chi tiết |
|---|---|---|
| `currentState` (canLucHao) | **CÓ (READ-only)** | synthesis đọc `temporalExistence==="EMPTY"` + `hidden` để gate candidate Kỵ/Nguyên (XUAT_KHONG/XUAT_MO). Chỉ đọc, KHÔNG sửa. |
| movementEfficacy | **KHÔNG** | grep: ung-ky KHÔNG đọc movementEfficacy → xác nhận claim "movementEfficacy KHÔNG tự tạo Ứng Kỳ" ✅ |
| reduced | **KHÔNG** (đọc effective/hidden/EMPTY, KHÔNG đọc reduced) | |
| Nhật Phá / Tuế Phá | gián tiếp qua tinhUngKy (nguyet-pha/tuan-khong states) — đọc từ HaoInfo, KHÔNG từ reduced | |
| effective/baseForce | tinhUngKy đọc vượng/suy để chọn rule (huu-tu-gap-truong-sinh…) — READ | |
| chamDiem | **KHÔNG** (độc lập; timingBlocker riêng) | |
- **KHÔNG reopen lock nào.** Chỉ ghi nhận **READ dependency** vào `currentState` (EMPTY/hidden) + vượng/suy. KHÔNG có
  write-back. Claim Phase 25I ("movementEfficacy không tự tạo Ứng Kỳ") **xác nhận bằng code trace** (no consumer link).

## 9. Test Coverage
| Test | Loại | Số |
|---|---|---|
| `__ung-ky-synthesis.test.ts` | official unit | **21** |
| `__sau-tam-hop.test.ts` (ungKyChi) | official unit | 9 |
| `__golden-e2e.test.ts` (ungKy assertions) | official E2E | 7 refs |
| `__report-prompt-integration.test.ts` | official integration | có (ungKy trong report→prompt) |
- **Unit/integration coverage: CÓ** (Phase 14 + 20). **Validation real-case (153 án lệ 6-hào): DATA GAP** (prose).
  Temporary probes 25-26 đã xóa — không tính.

## 10. Current Status
**B — IMPLEMENTED + PARTIAL (VERIFIED bằng unit/E2E, VALIDATION real-case = DATA GAP).**
- Implemented: base engine (8 rules) + Phase-14 synthesis + surface prompt. Unit-tested (21+9+7). Deterministic,
  no-score, candidate (KHÔNG override conclusion).
- Partial: verbatim classical per-rule chưa đối chiếu (D); 153 án lệ chưa replay 6-hào (DATA GAP); một số rule
  (R6/R7/R8) test coverage mỏng hơn R1-R5.

## 11. Evidence Gaps
1. **Provenance verbatim per-rule** (§6 8 rules từ bản dịch, chưa đối chiếu Hán văn gốc/ctext) — **D/AMBIGUOUS**.
2. **Validation real-case:** 0/153 án lệ đủ 6-hào để replay Ứng Kỳ deterministic — **DATA GAP**.
3. **Test coverage mỏng** cho R6 (bi-hop/Xung Hợp), R7 (Trường Sinh), R8 (tiến/thoái) so với R1-R5.
4. **canAudit (Nhập Mộ)**: R5 đánh dấu `canAudit` vì engine còn nợ audit Nhập Mộ (TODO luc-hao.ts) — độ tin cậy thấp hơn.
5. **Hóa Mộ → XUAT_MO:** Phase 14 CỐ Ý KHÔNG auto-tạo XUAT_MO từ CHANGED_YAO (thiếu rule nguồn) — ghi nhận, chưa có nguồn.

## 12. Candidate Next Slices (KHÔNG chọn, KHÔNG bắt đầu)
- **C1 — Primary-source research:** đối chiếu 8 quy luật §6 với cổ thư (増删卜易/卜筮正宗/易冒…) để nâng provenance D→B/A.
- **C2 — Methodology decision gate:** khóa các rule mỏng (R6/R7/R8) + Hóa Mộ→XUAT_MO + canAudit Nhập Mộ.
- **C3 — Test coverage slice:** bổ sung unit test cho R6/R7/R8 + edge (lưỡng hiện, canAudit).
- **C4 — Real-case validation:** thu thập fixture 6-hào thật để đóng DATA GAP (§11.2).
- **C5 — timingBlocker clarification:** tài liệu hóa rõ timingBlocker (chamDiem) vs Ứng Kỳ (prediction) — tránh nhầm.
- Mỗi candidate có dependency: C1→C2 (research trước khi khóa rule); C4 độc lập (data). KHÔNG có candidate nào cần reopen
  lock 25/26.

## 13. Owner Decision Questions
- **DQ-U1:** Ưu tiên slice nào tiếp — provenance research (C1) / khóa rule mỏng (C2) / test (C3) / validation data (C4)?
- **DQ-U2:** Có chấp nhận Ứng Kỳ ở mức "candidate, không override conclusion" như hiện tại (đúng thiết kế Phase 14) là
  ĐỦ cho release, hay cần nâng verbatim provenance trước?
- **DQ-U3:** R5 Nhập Mộ `canAudit` + Hóa Mộ→XUAT_MO gap: khóa methodology hay chờ nguồn?
- **DQ-U4:** timingBlocker (chamDiem "NÊN CHỜ") và Ứng Kỳ prediction — có muốn hợp nhất cách trình bày cho người dùng
  không (hiện 2 thứ tách biệt: card verdict vs prose timing)?

## 14. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · methodology: NO.** doc: YES (chỉ file này). KHÔNG reopen lock nào.
- Regression: **318/318 PASS** (HEAD `dcb99c1`). Commit chỉ doc này. **KHÔNG push.** STOP.
- **Ứng Kỳ status tóm tắt:** RUNTIME EXISTS (2 engine) · rules = 8 §6 (impl, provenance C/D) · timingBlocker ≠ Ứng Kỳ ·
  test 21+9+7 · gaps = provenance verbatim + real-case validation (DATA GAP). Cần owner chọn next slice.
