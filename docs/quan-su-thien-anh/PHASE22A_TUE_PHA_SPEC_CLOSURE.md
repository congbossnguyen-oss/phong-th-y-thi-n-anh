# Phase 22A — Tuế Phá Spec Closure

## Checkpoint
- **Starting commit:** `93cfbbd` (Phase 21 CLOSED) — verified `git rev-parse HEAD`.
- **Branch:** `quan-su-thien-anh`.
- **Working tree:** chỉ thêm/sửa file DOC của phase này (concurrent western-astrology/chart-profile changes là của luồng khác, KHÔNG đụng).

## Objective
Đưa methodology Tuế Phá (khóa ở Phase 10A, đã implement runtime) vào **self-contained** trong
`LUAN_QUE_LUC_HAO_SPEC.md`. **DOC-ONLY.** Không sửa runtime/type/test/score/strength/conclusion. Không giải G6.

## Existing Methodology Lock
- **Phase 10A (Thầy, chat/methodology lock):** Thái Tuế = Chi hào ≡ Chi Năm → **KHÔNG = Vượng**; Tuế Phá =
  Chi Năm xung Chi hào → suy mạnh (trục giảm lực). Đây là **methodology lock**, KHÔNG phải trích dẫn cổ thư.

## Existing Runtime Implementation
- Symbol: **`canLucHao().yearState = { thaiTue, tuePha }`** — `src/lib/quan-su/can-luc-hao.ts`.
  - `thaiTue = (self.chiIndex === yearChiIndex)` — không đổi `baseForce`.
  - `tuePha = (self.chiIndex === chiXungVoi(yearChiIndex))` — đưa vào `reduced` (giữ base, giống Nguyệt/Nhật Phá).
- Đã có test: `__can-luc-hao.test.ts` (Thái Tuế không nâng lực; Tuế Phá → reduced). KHÔNG sửa test ở phase này.

## Validation Data Gap
- 153 án lệ (Vương Hổ Ứng): **0** ca Tuế Phá đủ cấu trúc 6 hào để replay deterministic (Phase 10D/21).
- ⇒ **DATA GAP**, KHÔNG phải lý do đổi rule. Fixture tương lai (nếu có) chỉ để **kiểm chứng**, KHÔNG âm thầm định nghĩa lại.

## Documentation Change
- **File:** `docs/quan-su-thien-anh/LUAN_QUE_LUC_HAO_SPEC.md`.
  - **Thêm §3.9 "Thái Tuế / Tuế Phá (quan hệ hào ↔ Chi Năm)"** ngay sau §3.8 (giữ nguyên số §3.7/§3.8 và mọi mục sau).
    Nội dung: định nghĩa Thái Tuế/Tuế Phá; ghi rõ khóa Phase 10A (không phải cổ thư); symbol runtime
    `canLucHao().yearState`; semantic (Thái Tuế ≠ Vượng, Tuế Phá → reduced/giữ base); phân tách 3 tầng
    (methodology lock / runtime / validation DATA GAP); tuyên bố thiếu fixture ≠ được sửa rule.
  - **Thêm 1 đoạn** trong "## Ghi chú nguồn": nêu §3.9 là khóa Phase 10A (không gán cổ thư), trỏ tới
    `PHASE21_...` và file này.
- **File:** `docs/quan-su-thien-anh/PHASE22A_TUE_PHA_SPEC_CLOSURE.md` (báo cáo này).

## Verification
- **runtime changed: NO**
- **methodology changed: NO** (chỉ ghi lại rule đã khóa/đã implement, không đổi ngữ nghĩa)
- **schema/types changed: NO**
- **test logic changed: NO**
- **spec documentation changed: YES** (§3.9 mới + 1 đoạn Ghi chú nguồn)
- **git diff:** chỉ 2 file trong `docs/quan-su-thien-anh/` (spec + report). Không file `src/` nào của phase này.
- **Regression:** Quan Su + Lục Hào **311/311 PASS** (không đổi so với Phase 20/21).

## G6 Boundary
**Nhật Tán remains unresolved and is outside Phase 22A.** (Engine `getDayRelations` chỉ có Ám Động/Nhật Phá;
spec §99 phân biệt thêm Nhật Tán — chờ Thầy khóa + phase riêng. KHÔNG đụng ở đây.)

## Final Status
**Tuế Phá: LOCKED METHODOLOGY + ALREADY IMPLEMENTED + DATA GAP.**

Phase 22A CHỈ đóng khoảng trống *tài liệu tự-đủ*. KHÔNG tuyên bố Tuế Phá đã được validate độc lập bằng bộ 153 án lệ.

**Remaining blockers (không đụng phase này):** G3 (Hình mở rộng — DEFERRED BY SPEC §348), G4 quantified (Cừu
định lượng — OPEN), G5 (multi-adverse precedence — OPEN), G6 (Nhật Tán — BLOCKED).
