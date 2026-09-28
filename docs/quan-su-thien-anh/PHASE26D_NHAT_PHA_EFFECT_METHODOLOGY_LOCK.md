# Phase 26D — Nhật Phá Effect Methodology Lock (MODEL A)

**Branch:** `quan-su-thien-anh` · **Nature:** METHODOLOGY LOCK (spec + decision record). NOT implementation.
**runtime: NO · src/: NO · tests: NO · scoring: NO · conclusion: NO · ky-nguyen-dung: NO · availabilityOf: NO · push: NO.**
Files: `LUAN_QUE_LUC_HAO_SPEC.md` (+§3.10.2) + doc này. Không đụng western-astrology WIP.

---

## 1. Decision
Methodology-owner chọn **MODEL A**: **Nhật Phá là trạng thái hạn chế ĐỘC LẬP.** Khi hào được phân loại Nhật Phá, nó
**tiếp tục** áp hiệu ứng **LIMITED** (availability/protection) **kể cả khi** `effective` tổ hợp = Trung Hòa/Vượng. Đây
là quyết định **giữ nguyên** hành vi load-bearing mà probe Phase 26B phát hiện — **KHÔNG sửa code phase này**.

## 2. Exact Locked Rule
```
IF relation = "Nhật Phá"  →  reduced = true
```
- Đúng **mọi** trường hợp, KỂ CẢ `effective ∈ {Trung Hòa, Vượng}`.
- **KHÔNG** thêm ngoại lệ theo effective. **KHÔNG** đổi phân loại Nhật Phá theo month (Phase 24). **KHÔNG** tái diễn
  giải Nhật Phá thành "chỉ movement efficacy".
- Khớp **đúng** runtime hiện tại (`can-luc-hao.ts:298 reduced = ...||nhatPha||...`) → Phase 26D chỉ khóa methodology.

## 3. Month-Based Classification vs Effective Strength
| Lớp | Ký hiệu | Vai trò | Khóa |
|---|---|---|---|
| Phân loại nhãn | `monthVuongSuy` | getDayRelations: Nhật Phá vs Ám Động | Phase 24 (GIỮ) |
| Lực tổ hợp | `effective`/`baseForce` (Nhật+Nguyệt) | availabilityOf nhánh force | GIỮ |
- Hai lớp **độc lập**; một hào có thể Nhật Phá (month hưu/tù) **và** effective Trung Hòa/Vượng. MODEL A: nhãn Nhật Phá
  **thắng** ở tầng hạn chế (reduced→LIMITED), bất kể effective.

## 4. Reduced Semantics
- `reduced` = tín hiệu hạn chế availability/protection **đang hoạt động** (active cho Kỵ/Nguyên qua `availabilityOf` →
  LIMITED → pressure/support → protection → verdict).
- **Nhật Phá là một producer hợp lệ của `reduced`** (cùng nguyetPha/tuePha/hóa-biến). MODEL A khẳng định giữ nguyên.
- Không đụng `availabilityOf` (vẫn gộp reduced||restrained||Suy → LIMITED — ngoài phạm vi 26D).

## 5. Movement Efficacy Separation
- Nhật Phá **vẫn** đồng thời là `movementEfficacy = BROKEN_STATIC` (Phase 25I) — **FACT-only**, KHÔNG tác động verdict.
- **KHÔNG gộp** `movementEfficacy` với `reduced`. **KHÔNG** làm movementEfficacy computationally active.
- Hai biểu diễn của cùng 1 fact (Nhật Phá) trên 2 trục khác nhau: (a) BROKEN_STATIC = mô tả; (b) reduced = hạn chế
  active. Giữ tách (Model 1 Phase 25F).

## 6. Classical Provenance Boundary
- 增删卜易 日辰章 / 易冒 卷三 (verify Phase 25C/26C) hỗ trợ **phân biệt** Nhật Phá theo 旺相/衰弱 × Nhật xung
  ("冲衰弱之静爻则为日破" / "日冲静衰之爻谓之暗破").
- **QUÂN SƯ METHODOLOGY DECISION (không phải claim cổ thư đồng nhất):** tổng quát hóa "Nhật Phá độc lập áp LIMITED trong
  **mọi** ca combined-effective (kể cả Trung Hòa/Vượng)" là quyết định của Quân Sư (Phase 26D). Cổ thư **không** phát
  biểu tường minh cho nhánh combined-effective (Phase 26C: **AMBIGUOUS**).
- **KHÔNG bịa** câu cổ văn verbatim cho nhánh combined-effective. Ranh giới provenance giữ rõ.

## 7. Protected Behavior / 14 Empirical Cases
- Probe Phase 26B (quẻ Thuần Càn, 12 ngày × 12 tháng): **42** hào Nhật Phá; **14** ca mà bỏ `nhatPha→reduced` sẽ đổi
  availability (LIMITED→AVAILABLE; và LIMITED→STRONG khi base=Vượng, vd Tuất/Tý/Thìn, Tuất/Hợi/Thìn).
- MODEL A **cố ý bảo vệ** 14 ca này ở LIMITED. Đề xuất "gỡ redundant" (Phase 26B) **bị bác** — thực chất load-bearing.
- (Con số 14 theo Thuần Càn; bộ quẻ khác có thể có ca tương tự — cùng nguyên tắc.)

## 8. Interaction with Phase 24 / 25 Locks (cross-check)
| Lock | Trạng thái sau 26D |
|---|---|
| Phase 24 — nhãn Nhật Phá theo month | **GIỮ** (26D không đổi getDayRelations) |
| Phase 25B — 4 nhãn N1-N4 | GIỮ |
| Phase 25F/25I — movementEfficacy FACT-only, BROKEN_STATIC | **GIỮ** (KHÔNG gộp, KHÔNG active) |
| Nhật Tán/愈动 không set reduced | GIỮ |
| Tuế Phá/Nguyệt Phá/hóa-biến → reduced | GIỮ (26D chỉ khẳng định thêm Nhật Phá) |
- **Không mâu thuẫn:** 26D chỉ **khóa** hành vi hiện có của 1 producer (Nhật Phá) trong `reduced`; không đụng nhãn, không
  đụng efficacy, không đụng producer khác.

## 9. Future Implementation Constraints
- **KHÔNG** implement gì ở 26D (hành vi đã đúng sẵn). Nếu phase sau đụng `reduced` (vd Phase 26/26A models), **PHẢI**
  giữ luật §2 (Nhật Phá→reduced=true vô điều kiện) trừ khi mở gate reopen (§10).
- KHÔNG thêm ngoại lệ theo effective cho Nhật Phá. KHÔNG gộp movementEfficacy/reduced. KHÔNG đụng availabilityOf/
  ky-nguyen-dung để "sửa" 14 ca.

## 10. Reopen Conditions
Reopen chỉ qua **decision gate riêng** khi:
1. Có **nguồn primary mới** (verbatim, URL) nói rõ cho nhánh **combined-effective** (Nhật Phá + effective Trung Hòa/Vượng)
   — vd generalize "日冲而不散" sang 得日/同类/旺相-tổng.
2. Rule mới tách sạch, không double-count, không nhập 黄金策.
3. Owner ký; giữ tách movementEfficacy/reduced + nhãn Phase 24.

## 11. DO-NOT-IMPLEMENT-UNTIL-LOCKED
Phase 26D = **doc/methodology lock**. KHÔNG sửa runtime/test. Hành vi 14-ca giữ nguyên như hiện tại. Bất kỳ thay đổi
`reduced`/`availabilityOf`/nhãn nào đều cần phase riêng tuân §2 + §9.

## 12. Phase Boundary
- **runtime: NO · src/: NO · tests: NO · scoring/conclusion/ky-nguyen-dung/availabilityOf: NO.**
- **spec doc: YES** (§3.10.2 mới). **decision doc: YES** (file này).
- Regression: **318/318 PASS** (không đổi). Commit chỉ 2 file doc. **KHÔNG push.** **MODEL A = LOCKED.** STOP.
