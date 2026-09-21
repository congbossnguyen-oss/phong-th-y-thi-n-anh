# PHASE 11-A4 — DECISION RECORD (驛馬 / Yi Ma Placement)

**Loại tài liệu**: Chốt quyết định — dựa trên
`docs/daliuren/DA_LIU_REN_PHASE_11A4_PRE_IMPLEMENTATION_AUDIT.md` và
`docs/daliuren/DA_LIU_REN_PHASE_11A4_INDEPENDENT_AUDIT.md` (verdict B — PASS WITH NON-BLOCKING GAP).
**Phạm vi**: Quyết định thuần — KHÔNG sửa implementation/test, KHÔNG tạo Freeze document, KHÔNG commit.

---

## 1. Status

- Implementation commit: `01f31fe6c781cd13898c228214de072904bec87a`
  (`feat(daliuren): add phase 11a yi ma placement`).
- Independent audit: `docs/daliuren/DA_LIU_REN_PHASE_11A4_INDEPENDENT_AUDIT.md`, verdict
  **B — PASS WITH NON-BLOCKING GAP**.
- A4: **IMPLEMENTED, chưa FROZEN.** Tài liệu này đóng vòng Decision Closure — Freeze document sẽ
  tạo ở bước SAU, không phải bước này.

---

## 2. Evidence Baseline

- P0 = 0, P1 = 0, P2 = 2, P3 = 1 (đúng số liệu Independent Audit đã ghi).
- 433/433 test PASS, typecheck/package build/workspace build đều PASS (đã re-run fresh trong
  Independent Audit).
- Frozen areas (`src/yi-ma/`, A1 `ke-type/`, A2 `void-branches/`, A3 `wang-shuai/`, Phase 11-B 4 rule
  dir + `registry.ts`, `DaLiuRenCalculationResult`) — **0 diff**, xác nhận độc lập qua `git diff --stat`.
- Composition byte-level consistency: **0/12 mismatch** (verify độc lập qua script riêng, không tái
  dùng test suite).
- Golden chart thật: 2024-08-20 20:00 (`isVoid=false`, re-trace độc lập) + 2024-10-15 10:00
  (`isVoid=true`, TỰ TÌM MỚI trong Independent Audit, không có sẵn trong test suite).

---

## 3. Decisions

### Decision 1 — Source Branch

**CHỐT**: `CURRENT OPERATIONAL CONTRACT = Chi Ngày (day Chi)`.

Evidence:
```
fourLessons.lesson3.lower
        ↓
dayChi
        ↓
computeYiMa(dayChi)
```
(trace độc lập, đọc trực tiếp `four-lessons/compute.ts` dòng 37/53 + `shen-sha/compute.ts` dòng 47,
xác nhận `lesson3.lower = dayPillar.chi` gán trực tiếp, không qua biến đổi trung gian).

Ghi rõ:
- Đây là contract ĐANG VẬN HÀNH THẬT trong engine (Phase 9C, nuôi Phase 11-B qua `nine-methods`).
- Independent audit ĐÃ trace lại dependency này độc lập, không chỉ tin implementation report.
- **KHÔNG tuyên bố "classically proven universally"** — wording trong `shen-sha/compute.ts` và
  `DA_LIU_REN_PHASE_11A4_IMPLEMENTATION.md` giữ nguyên mức độ thận trọng ("CURRENT OPERATIONAL
  CONTRACT", không phải "đã chứng minh tuyệt đối").
- **C1 Day-vs-Year ambiguity VẪN LÀ documented gap** (`DA_LIU_REN_PROVENANCE.md` Nút 9: "hoặc Chi năm
  tuỳ ngữ cảnh") — KHÔNG được giải quyết, KHÔNG bị silently resolve bởi A4.
- KHÔNG thêm fallback `yearChi`/`monthChi`/`hourChi`.
- KHÔNG mở rộng research về C1 trong phạm vi A4 — việc đó (nếu có) là 1 phase/quyết định RIÊNG.

### Decision 2 — Yi Ma Implementation Source of Truth

**CHỐT**: `computeYiMa()` (đã tồn tại, đã FROZEN từ Phase 9C, `src/yi-ma/`) là **source of truth
DUY NHẤT** cho Yi Ma mapping. A4 CHỈ compose/adapt:

```
computeYiMa(dayChi)
        ↓
Yi Ma Zhi
```

Xác nhận (Independent Audit mục 4): `computeYiMaPlacement()` GỌI LẠI `computeYiMa()` thật, KHÔNG
duplicate bảng `YI_MA_TABLE`/logic 4 nhóm tam hợp — đã grep xác nhận 0 mapping literal nào tồn tại
trong `src/shen-sha/` ngoài docstring mô tả. `src/yi-ma/` **KHÔNG bị sửa** (`git diff --stat` rỗng).

### Decision 3 — Void Semantics

**CHỐT**:
```ts
isVoid = voidBranches.pair.includes(yiMa)
```
`voidBranches.pair` đến từ A2 Core (`computeVoidBranches()`), do CALLER truyền vào — `computeYiMaPlacement`
KHÔNG tự gọi lại A2.

Xác nhận KHÔNG sử dụng: 孤辰/寡宿 (0 literal trong `src/shen-sha/`), Không Vong theo Giờ (không tham
chiếu `hourPillar`), hệ Không Vong khác, `voidBranches.affects` (Tam Truyền — không liên quan tới 1
Chi đơn như Yi Ma), hay bất kỳ interpretation rule nào (output CHỈ là `boolean`, không gán ý nghĩa).

### Decision 4 — Provenance

**CHỐT**:
- Yi Ma provenance = **reuse** `YI_MA_PROVENANCE.id` (xác nhận qua Independent Audit mục 5, test
  độc lập: `zhiProvenanceId === YI_MA_PROVENANCE.id`).
- Void provenance = **pass-through** A2's `VOID_BRANCHES_PROVENANCE.id` (xác nhận qua test độc lập
  dùng giá trị tuỳ ý `"CALLER-SUPPLIED-VOID-PROV-ID"` — output khớp chính xác, chứng minh pass-through
  thật, không hardcode/ghi đè).
- `isVoid` = **deterministic derivation/composition** — suy luận logic tất yếu (set membership) từ
  2 nguồn đã có provenance riêng, KHÔNG PHẢI 1 khẳng định cổ văn mới.
- **KHÔNG tạo provenance entry riêng cho `isVoid`.**

Nhất quán với nguyên tắc đã chốt ở A1 Decision Record: không tạo provenance chỉ để "có provenance",
không tăng confidence nhân tạo qua composition — cả 2 id reused GIỮ NGUYÊN confidence gốc (B), không
có confidence tổng hợp mới nào được suy ra.

### Decision 5 — Output/API Architecture

**CHỐT**: A4 chỉ cung cấp pure primitive `computeYiMaPlacement(dayChi, voidBranches, voidBranchesProvenanceId)`.

**KHÔNG**:
- Tạo `calculateDaLiuRenChartWithYiMa()` (xác nhận: 0 kết quả grep).
- Sửa `calculateDaLiuRenChart()` (xác nhận: thân hàm không đổi).
- Wire vào `DaLiuRenCalculationResult` (xác nhận: `git diff --stat` rỗng).
- Mở rộng chart-level contract.

Architecture rule này KẾ THỪA governance đã chốt ở A1 Freeze, áp dụng nhất quán cho A2/A3/A4.

### Decision 6 — P2 Finding: Malformed `voidBranches`

Independent Audit ghi nhận: `voidBranches.pair` malformed (vd `undefined`) → ném `TypeError` THÔ,
không phải error domain rõ ràng như `YiMaError`/`VoidBranchesError`.

**CHỐT: ACCEPT AS NON-BLOCKING P2.**

Lý do: KHÔNG phải correctness bug (crash rõ ràng, không silently trả sai). `VoidBranches` là 1
**controlled value type** — theo kiến trúc đã audit (Decision 5), chỉ có thể đến từ A2's
`computeVoidBranches()` đã tự validate ở nguồn (`dayCycleIndex` được check tường minh) — KHÔNG phải
1 open/untrusted input contract như tham số `number` của chính A2.

**KHÔNG thay đổi implementation/error architecture trong A4.**

Ghi rõ: nếu tương lai `VoidBranches`/`computeYiMaPlacement` trở thành 1 external/untrusted API
boundary (vd expose trực tiếp cho input từ ngoài package, không qua A2 nữa), cần 1 quyết định
validation/error-contract RIÊNG tại thời điểm đó — không phải quyết định của A4 hiện tại.

### Decision 7 — P2 Finding: Test Fixture vs Golden Chart

Independent Audit ghi nhận: test `isVoid=true` trong suite hiện tại (Test B/C/D) chủ yếu dùng
fixture giả lập. NHƯNG Independent Audit ĐÃ TỰ XÁC MINH THÊM 1 golden chart thật:
**2024-10-15 10:00 Asia/Shanghai**, chứng minh:

```
real chart → dayChi → Yi Ma → A2 voidBranches → isVoid=true
```

(dayChi=Tý → computeYiMa("Tý").yiMa=Dần → voidBranches.pair=[Dần,Mão] → Dần ∈ pair → isVoid=true,
khớp 100% dự đoán độc lập).

**CHỐT: NO CORRECTION REQUIRED.**

Golden chart độc lập verify trong chính Independent Audit là bằng chứng ĐỦ cho freeze hiện tại —
KHÔNG cần 1 test PERMANENT mới trong suite để coi finding này là "đã đóng" ở mức đủ cho Freeze.
**KHÔNG sửa implementation/test chỉ để đóng finding này** trong phạm vi A4.

### Decision 8 — P3 Finding: Regression-Test Gap

Independent Audit ghi nhận 2 case đã manual-verify đúng nhưng chưa có test permanent: (a) golden
chart thật cho `isVoid=true` (xem Decision 7), (b) Chi lặp lại trong `voidBranches.pair` / Yi Ma
trùng vị trí thứ hai của pair.

**CHỐT: ACCEPT AS NON-BLOCKING P3.**

**KHÔNG sửa test suite chỉ để đóng P3 trong phạm vi A4.** Ghi nhận vào backlog (KHÔNG làm ngay,
KHÔNG làm trong A4):
- Automated test cho golden chart thật `isVoid=true` (2024-10-15 10:00, đã xác nhận đúng).
- Automated test cho Chi lặp lại trong pair / Yi Ma ở vị trí thứ hai của pair (đã manual-verify đúng
  trong Independent Audit mục 8).

### Decision 9 — 孤辰/寡宿

**CHỐT: GIỮ NGUYÊN DEFERRED.**

Không field, không logic, không provenance, không schema expansion, không sửa Algorithm Spec — trạng
thái không đổi từ A2 Decision Record.

### Decision 10 — Freeze Eligibility

**CHỐT: A4 ĐỦ ĐIỀU KIỆN chuyển sang Freeze sau Decision Closure này**, vì:
- P0 = 0, P1 = 0.
- Implementation đã verify (Independent Audit, không chỉ tin implementation report).
- Independent composition verification = **12/12, 0 mismatch** (script riêng, độc lập với test suite).
- Real golden chart `2024-10-15 10:00` đã independently verified cho case `isVoid=true`.
- Full tests/typecheck/package build/workspace build — PASS (fresh).
- Frozen areas (A1/A2/A3/Phase 11-B/`src/yi-ma/`/`DaLiuRenCalculationResult`) — **0 diff**.

**KHÔNG gọi đây là "perfect" hay "classically proven"** — 2 P2 + 1 P3 vẫn tồn tại, đã ACCEPT tường
minh (Decision 6-8), không phải "không có gì để cải thiện", chỉ là "đủ điều kiện freeze ở mức hiện tại".

---

## 4. Frozen Contract (sau Decision Closure này)

- `computeYiMaPlacement(dayChi: Chi, voidBranches: VoidBranches, voidBranchesProvenanceId: string): YiMaPlacementComputation`
  — chữ ký + hành vi đã chốt, không đổi cho tới khi có quyết định mới.
- Source branch = Chi Ngày (Decision 1).
- `isVoid = voidBranches.pair.includes(yiMa)` (Decision 3).
- Provenance: reuse `YI_MA_PROVENANCE.id` + pass-through A2 id, không entry mới (Decision 4).
- Không facade/chart-level wiring (Decision 5).

---

## 5. Non-Blocking Findings Accepted

| # | Mức | Nội dung | Quyết định |
|---|---|---|---|
| 1 | P2 | `TypeError` thô khi `voidBranches.pair` malformed | ACCEPT — không sửa (Decision 6) |
| 2 | P2 | Test `isVoid=true` chủ yếu dùng fixture, chưa có test permanent cho golden chart | NO CORRECTION REQUIRED — golden chart độc lập verify đủ bằng chứng (Decision 7) |
| 3 | P3 | Thiếu automated test cho 2 case đã manual-verify (repeated branch, vị trí thứ 2) | ACCEPT — đưa vào backlog, không sửa trong A4 (Decision 8) |

---

## 6. Deferred Items

- **孤辰/寡宿** (Decision 9) — DEFERRED, không giới hạn thời gian, chờ quyết định tường minh riêng.
- **C1 Day-vs-Year ambiguity** (Decision 1) — documented gap, KHÔNG thuộc phạm vi A4 giải quyết,
  chờ 1 phase/nghiên cứu riêng nếu chủ dự án muốn theo đuổi.
- **Backlog test** (Decision 8) — 2 automated test đề xuất, không có deadline, không chặn Freeze.
- **Validation/error-contract cho `VoidBranches`** (Decision 6) — CHỈ cần nếu `VoidBranches` trở
  thành external/untrusted boundary trong tương lai — hiện tại KHÔNG áp dụng.

---

## 7. Freeze Readiness

**READY.** Không có P0/P1. Mọi P2/P3 đã được ACCEPT tường minh với lý do rõ ràng (mục 3, Decision
6-8), không có finding nào bị bỏ qua âm thầm. Bước tiếp theo (NGOÀI PHẠM VI tài liệu này): tạo
`DA_LIU_REN_PHASE_11A4_FREEZE.md` + commit (nếu có, ví dụ freeze doc riêng) — KHÔNG thực hiện ở đây.

---

## 8. Out-of-Scope Items (trong Decision Closure này)

- KHÔNG sửa `src/shen-sha/compute.ts`/`compute.test.ts`.
- KHÔNG sửa `src/yi-ma/`/A1/A2/A3/Phase 11-B.
- KHÔNG sửa Algorithm Spec.
- KHÔNG resolve C1.
- KHÔNG thêm 孤辰/寡宿.
- KHÔNG tạo provenance entry mới.
- KHÔNG tạo Freeze document.
- KHÔNG commit code.

---

## 9. References

- Pre-Implementation Audit: `docs/daliuren/DA_LIU_REN_PHASE_11A4_PRE_IMPLEMENTATION_AUDIT.md`
- Implementation: `docs/daliuren/DA_LIU_REN_PHASE_11A4_IMPLEMENTATION.md`
- Independent Audit: `docs/daliuren/DA_LIU_REN_PHASE_11A4_INDEPENDENT_AUDIT.md`
- Implementation commit: `01f31fe6c781cd13898c228214de072904bec87a`
- A1 Freeze (architecture rule gốc): `docs/daliuren/DA_LIU_REN_PHASE_11A1_FREEZE.md`
- A2 Decision Record (tiền lệ "không tạo provenance chỉ để có"): `docs/daliuren/DA_LIU_REN_PHASE_11A2_DECISION_RECORD.md`

---

**A4 DECISIONS CLOSED — READY FOR FREEZE**
