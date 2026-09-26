# PHASE 20 — GOLDEN E2E / REAL CASE VALIDATION

**Branch:** `quan-su-thien-anh` · **Baseline:** Phase 19 (`a3224fd`), 284/284.
**Scope:** VALIDATE only — no methodology, no relation, no semantic change, no refactor beyond the test file.
**Result:** ✅ all golden + adversarial + drift PASS. **No STOP condition.** No in-scope bug, no methodology
conflict. Real-case replay of the 153 án lệ = **DATA GAP** (prose, no 6-hào structure) — not fabricated.

## Files changed
- **NEW** `src/lib/quan-su/__golden-e2e.test.ts` (+27 tests). No runtime/semantic change.
- This report.

## Method
Each case runs the **real production path**: synthetic deterministic `FullCastResult` fixture →
`buildAdvisoryReport(payload)` → `userPrompt(payload, …, report)`. Assertions read the report's computed
synthesis and confirm the prompt **serializes** those exact values (no second engine, no AI call, no score).

## Golden case matrix (G1–G16)

| Case | Fixture (deterministic) | Layers exercised | Expected | Actual | Status |
|---|---|---|---|---|---|
| G1 Dụng Vượng | Dụng Mộc, Ngày Tý + Tháng Hợi (Thủy sinh) | canLuc, ket-luan | baseForce Vượng; conclusion ≠ UNRESOLVED | ✅ | PASS |
| G2 Dụng Suy | Dụng Mộc, Ngày Dậu + Tháng Thân (Kim khắc) | canLuc, ket-luan | baseForce Suy; dungThan.strength WEAK/VERY_WEAK | ✅ | PASS |
| G3 Không Vong | Dụng Mộc xunKong, base Vượng | canLuc, ung-ky | temporalExistence EMPTY; base Vượng (≠0); ungKy DELAYED | ✅ | PASS |
| G4 Nguyệt Phá + nền mạnh | Dụng Lâm Nhật (Dần/day Dần) + Nguyệt Phá | canLuc | base Vượng; reduced=true; base KHÔNG erase | ✅ | PASS |
| G5 Nhật Phá ≠ Ám Động | 2 quẻ: Vượng+Nhật xung vs Suy+Nhật xung | hao-time | AM_DONG vs PHA tách biệt, không nhập | ✅ | PASS |
| G6 Hóa Hợp | Dụng Sửu động biến Tý (Sửu-Tý hợp) | canLuc | hoaHop=true, restrained; effective ≠ Suy | ✅ | PASS |
| G7 Hồi Đầu Sinh | Dụng Dần động biến Tý (Thủy sinh) | canLuc | hoiDauSinh; effective ≥ base; restrained=false | ✅ | PASS |
| G8 Hồi Đầu Khắc + nền mạnh | Dụng Dần động biến Dậu (Kim khắc), base Vượng | canLuc | hoiDauKhac; reduced; base Vượng giữ | ✅ | PASS |
| G9 Hóa Thoái | Dụng Mão động biến Dần (thoái) | canLuc | hoaThoai; effective Suy | ✅ | PASS |
| G10 Kỵ→Nguyên→Dụng | Dụng Mộc + Nguyên Thủy + Kỵ Kim | ky-nguyen-dung | GENERATES chain; protection string; no score | ✅ | PASS |
| G11 Kỵ Không Vong | Kỵ hào (Dậu) xunKong | ky-nguyen-dung | directPressure OVERCOMES + effective EMPTY | ✅ | PASS |
| G12 Dụng + Nguyên cứu | tham sinh | ky-nguyen-dung | dungProtection PROTECTED/PARTIALLY_PROTECTED | ✅ | PASS |
| G13 MIXED | Dụng Suy, không Kỵ/Nguyên hào | ket-luan, prompt | conclusion MIXED; prompt giữ MIXED + guardrail | ✅ | PASS |
| G14 UNRESOLVED | Dụng phục tàng (Quan Quỷ phục) | ket-luan, prompt | conclusion UNRESOLVED; prompt giữ | ✅ | PASS |
| G15 MULTIPLE_CANDIDATES | Dụng tĩnh, không blocker | ung-ky | status MULTIPLE_CANDIDATES; primary null | ✅ | PASS |
| G16 Hình/Cừu/Nhật-Nguyệt | Dần-Tỵ-Thân + Cừu Thổ + Nhật Phá | hinh, cuu, hao-time | TAM_HINH (≠Khắc); Cừu Thổ (≠Kỵ Kim); PHA (≠AM_DONG); source NHAT | ✅ | PASS |

## Negative / adversarial (A–J) — all PASS
A Không Vong≠zero · B Phá≠erase base · C Hình≠Khắc · D Cừu≠Kỵ (Thổ≠Kim, role CUU) · E Nhật Phá≠Ám Động ·
F MIXED không flip (prompt không chứa FAVORABLE/UNFAVORABLE) · G UNRESOLVED không flip · H
MULTIPLE_CANDIDATES không tự chọn primary · I Hóa Hợp≠Suy · J Hồi Đầu Sinh≠Hóa Hợp.

## Report → Prompt drift (generic) — PASS
Mutate từng field deterministic của report rồi rebuild prompt, assert prompt phản ánh: `canLuc[].baseForce`,
`kyNguyenDung.kyPressure`, `kyNguyenDung.nguyenSupport`, `ketLuanSuViec.conclusion`, `ungKy.status`,
`haoTimeRelations` reason. ⇒ prompt là **consumer** của report, KHÔNG phải engine thứ hai (đã chứng minh no
recompute ở Phase 19 + lặp lại ở đây trên nhiều field).

## V. Real case validation (153 án lệ)
- Golden cases từ Phase 10D: là **prose narrative** (không có coin-tosses / cấu trúc 6 hào) → KHÔNG replay
  deterministic được. Đã tổng hợp evidence (case-library MATCH) ở Phase 10D/17/18.
- Không có fixture 6-hào thực nào trong repo cho Lục Hào (chỉ có synthetic test fixtures). → **DATA GAP**:
  end-to-end replay từ án lệ thật KHÔNG khả thi mà không suy diễn cấu trúc. **KHÔNG fabricate.**
- Kết luận: golden E2E dùng **synthetic deterministic fixtures** (đã cover đủ 16 nhóm state); real-case replay
  chờ bộ fixture quẻ đầy đủ (nếu sau này có form nhập quẻ thật lưu lại).

## Classification
- IN-SCOPE BUG: **none**.
- PRE-EXISTING (out-of-scope): `pages/api/.../xem-ngay-cao-cap-qs/result.ts` tsc errors; full-suite fails ở
  `practical-diffie` worktree + `phase2-toa-huong-mo` — concurrent, không liên quan.
- TEST/ORACLE ERROR: 1 đã tự sửa trong lúc viết (typeof optional field) — không phải bug runtime.
- DATA GAP: real-case án lệ replay (mục V).
- METHODOLOGY GAP: **unchanged** (Tuế Phá evidence, Tam Hợp TH2/3/6, Hình Sửu-Tuất-Mùi/Tự Hình, Cừu meaning,
  multi-adverse-transformation precedence) — KHÔNG đụng.

## Regression
- Phase 20 tests: **27/27 PASS**.
- Quan Su + Lục Hào: **311/311 PASS** (284 + 27).
- Scoped TypeScript (Phase 20 file): clean.
- Full suite: only pre-existing out-of-scope concurrent failures (`practical-diffie`, `phase2-toa-huong-mo`).

## STOP condition: NONE.
