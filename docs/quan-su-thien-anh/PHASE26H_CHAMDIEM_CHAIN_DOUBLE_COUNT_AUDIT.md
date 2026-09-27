# Phase 26H — chamDiem × Deterministic Chain Double-Count Audit

**Branch:** `quan-su-thien-anh` · **Nature:** AUDIT + DECISION GATE. KHÔNG implementation/refactor/methodology/model-
selection/verdict change, KHÔNG push. Chỉ thêm 1 doc. Probe tạm đã xóa. Không đụng western-astrology WIP.
KHÔNG mở lại Phase 25 / Nhật Phá Model A / Tuế Phá / reduced inventory / hóa-biến / hoaXung DATA GAP.

---

## 1. Full Call Graph (code thật)
**Kênh 1 — chamDiem (score card):**
`buildAdvisoryReport` (advisory-engine.ts:679) → `chamDiem(resolved, chinh, luck)` (:274).
Trong chamDiem: `const hao = resolved.hao` (**CHỈ Dụng Thần**, :284); `for (const r of hao.relations)` (:291):
`else if (r.type === "Nguyệt Phá") add("Nguyệt Phá", -14) + timingBlocker=true` (:294); `"Nhật Phá" → -10 + timingBlocker`
(:295). → `cham.diem` + `cham.items` (bangChamDiem) + `timingBlocker`.
→ `suyKetLuan(resolved, cham)` (:680, dùng `cham.diem`: ≥72 NÊN / <42 KHÔNG NÊN / timingBlocker→NÊN CHỜ / ≥58 CÓ ĐIỀU
KIỆN / else NÊN CHỜ) → **`ketLuan`**; `mucDoThuan = cham.diem` (:690); `bangChamDiem`, `diemThuan/diemLuuY` (:696-699).

**Kênh 2 — deterministic chain:**
`nguyetPha/nhatPha` (hasRel, can-luc-hao:258-259) → `reduced` (:298) → `availabilityOf(cs)` (ky-nguyen-dung:81,
`reduced||restrained→"LIMITED"`) — **áp dụng cho SOURCE = Kỵ/Nguyên** trong `interactionOf` → `kyPressure`/`nguyenSupport`
→ `dungProtection` → `protectionFrom(knd)` (ket-luan:89) → `concludeDung` → **`ketLuanSuViec`** (advisory:705).
*Nhật/Nguyệt Phá của chính DỤNG:* `strengthFrom(dungCs)` chỉ đọc `effective` (ket-luan:63) + Dụng KHÔNG bao giờ là chain
source → **reduced của Dụng INERT** (Phase 26/26E).

**⇒ Hai kênh key vào HÀO SCOPE KHÁC NHAU:** chamDiem = **quan hệ của DỤNG**; chain = **Phá của KỴ/NGUYÊN**.

## 2. Final Output Composition
1. **`ketLuan`** = verdict từ `suyKetLuan(cham.diem)` (NÊN/KHÔNG NÊN/CÓ ĐIỀU KIỆN/NÊN CHỜ/CHƯA ĐỦ DỮ LIỆU).
2. **`ketLuanSuViec`** = verdict deterministic từ chain (FAVORABLE/…/UNRESOLVED).
3. **`mucDoThuan`** = `cham.diem` (0–100), thang định lượng của chamDiem.
4. **Có merge không? KHÔNG.** Không có phép hợp nhất `ketLuan` với `ketLuanSuViec` ở bất kỳ đâu (grep xác nhận).
5. **Expose ở đâu:**
   - **Structured card** (`render-ket-qua-client.ts`): badge `ketLuanLabel` (:152) + `mucDoThuan/100` bar (:154-155) +
     diemThuan/diemLuuY (:145-146) + `bangChamDiem` (:172) + `luanGiaiChiTiet`. ← **kênh chamDiem**.
   - **AI prose** (`prompt.ts` → `luanGiaiBangAI`): serialize **`ketLuanSuViec`** (:188) + FACT layers; **KHÔNG** tham
     chiếu mucDoThuan/bangChamDiem/ketLuan (grep xác nhận rỗng). Priority guardrail (:54): **(1) KẾT LUẬN SỰ VIỆC** > … ←
     **kênh chain, ưu tiên #1 cho AI.**
6. **Người dùng nhận 2 kết luận độc lập?** CÓ — thẻ định lượng (chamDiem) + prose AI (chain) là **2 bề mặt song song**,
   KHÔNG gộp số.
7. **Field nào ưu tiên?** Trong **AI prose**, ketLuanSuViec là #1 (chamDiem KHÔNG vào prompt). Trong **card**, chamDiem
   (ketLuanLabel/mucDoThuan) là headline (card KHÔNG render ketLuanSuViec).

```
resolved.hao (DỤNG) ──relations──> chamDiem(-14/-10 + timingBlocker) ──diem──> suyKetLuan ──> ketLuan/mucDoThuan ──> CARD (badge+bar+bangChamDiem)
Kỵ/Nguyên (Phá) ──reduced──> availabilityOf(LIMITED) ──> kyPressure/nguyenSupport ──> protection ──> concludeDung ──> ketLuanSuViec ──> AI PROSE (priority #1)
                                   (KHÔNG có node hợp nhất giữa 2 nhánh)
```

## 3–5. Counterfactuals (channel independence)
Vì 2 kênh **không chia sẻ state trung gian** (chứng minh bằng call graph) + **key vào hào scope khác nhau**, kết quả
counterfactual suy ra trực tiếp + đã xác nhận bằng probe (đã xóa):

**Empirical probe (synthetic, injected Nhật Phá):**
| Case | mucDoThuan | ketLuan | Phá scored? | ketLuanSuViec |
|---|---|---|---|---|
| Baseline (no Phá) | 48 | NÊN CHỜ | false | MIXED |
| **Phá trên DỤNG** | **35** | **KHÔNG NÊN** | **true** | MIXED (KHÔNG đổi) |
| **Phá trên KỴ** | 48 (KHÔNG đổi) | NÊN CHỜ | false | MIXED |

- **CF-A (bỏ Phá khỏi chamDiem):** chỉ đổi `mucDoThuan`/`ketLuan`/`bangChamDiem` cho ca **Phá-trên-Dụng** (vd 35→48,
  KHÔNG NÊN→NÊN CHỜ). **`ketLuanSuViec` KHÔNG đổi** (chain không đọc chamDiem). Kênh chain độc lập.
- **CF-B (bỏ Phá khỏi reduced chain):** chỉ đổi availability của **Kỵ/Nguyên-Phá** → có thể đổi `ketLuanSuViec`
  (26F/26G: nguyetPha 484 / nhatPha 132 ca đổi availability). **`mucDoThuan` KHÔNG đổi** (chamDiem không đọc reduced).
- **CF-C (bỏ cả hai):** hợp của A + B (mỗi kênh mất phần của mình; KHÔNG có hiệu ứng chồng).
- **Kết luận CF:** hai kênh **hoàn toàn độc lập** — mỗi CF chỉ chạm output của kênh đó.

## 6. Double-Count Test — KẾT QUẢ
**Câu hỏi:** cùng 1 Phá có bị final output phản ánh HAI LẦN không?
- **Bằng chứng scope:** chamDiem chấm Phá **CHỈ của Dụng** (advisory:284 `hao = resolved.hao`); chain xử Phá **của
  Kỵ/Nguyên** (Dụng-Phá inert). ⇒ **một instance Phá cụ thể chỉ vào ĐÚNG 1 kênh** theo vai hào:
  - Phá trên **Dụng** → chamDiem (card) ; chain KHÔNG (probe: suViec không đổi).
  - Phá trên **Kỵ/Nguyên** → chain (prose) ; chamDiem KHÔNG (probe: mucDoThuan/phaScored không đổi).
- **⇒ KHÔNG có arithmetic double-count.** Không có field/số nào cộng Phá hai lần.
- **Phân loại: C — DIFFERENT SEMANTIC DOMAINS** (chamDiem đo trạng thái **của chính Dụng**; chain đo **áp lực/hỗ trợ
  Kỵ→Nguyên→Dụng**) **+ A — INTENTIONAL MULTI-AXIS** (2 hệ song song có chủ đích, 2 bề mặt khác nhau).
- **KHÔNG phải B (genuine double-count).** ⇒ **ĐÍNH CHÍNH giả thuyết 26G**: 26G nói "nguyet/nhat Phá feed both →
  double-count" — đúng ở mức *code đọc cùng relation type*, NHƯNG **sai** ở mức hiệu ứng: hai hàm đọc trên **hào scope
  khác nhau** nên KHÔNG đếm trùng một instance.
- *(Lưu ý presentational:* nếu UI hiển thị CẢ card lẫn prose, người dùng thấy 2 đánh giá song song — nhưng đó là 2 hệ
  đo 2 thứ khác nhau, KHÔNG phải một điều kiện bị đếm lại.)*

## 7. Provenance
| Thành phần | Provenance | Loại |
|---|---|---|
| chamDiem penalty −14 (Nguyệt Phá) / −10 (Nhật Phá), +timingBlocker | **heuristic nội bộ Quân Sư (legacy scoring)** — KHÔNG cổ thư; các magnitude tự đặt | **C + E** |
| reduced effect Nguyệt Phá | Chương VI (bản dịch nội bộ) "Nguyệt kiến xung hào = nguyệt phá" (định tính "phá") | **A/B** (direction) + **C** (LIMITED mapping) |
| reduced effect Nhật Phá | 增删卜易 (verified 25C) + Model A lock (26D) | **A/B** + **C** |
| combination logic (2 kênh) | **KHÔNG có phép hợp nhất** — 2 bề mặt song song = quyết định kiến trúc Quân Sư | **C** |
- **KHÔNG** biến chamDiem heuristic thành classical rule: magnitudes (−14/−10) là **UNVERIFIED nội bộ**.

## 8. Architecture Options (KHÔNG chọn)
| Model | Mô tả | Behavior impact | Evidence support | Provenance risk | Regression risk | Methodology implication |
|---|---|---|---|---|---|---|
| **A** | Giữ cả 2 kênh (card chamDiem + prose chain) | 0 | — | chamDiem = heuristic không nguồn | 0 | 2 hệ song song, không double-count |
| **B** | Giữ chain, bỏ Phá khỏi chamDiem | card đổi cho Dụng-Phá (mucDoThuan/ketLuan) | chain có nguồn tốt hơn | giảm reliance vào heuristic | trung bình (đổi card) | card mất tín hiệu Phá của Dụng |
| **C** | Giữ chamDiem, bỏ Phá khỏi reduced chain | ketLuanSuViec đổi cho Kỵ/Nguyên-Phá | **XUNG ĐỘT** lock 26D/10A/26E (reduced load-bearing) | cao | cao | vi phạm Nhật/Tuế Phá lock |
| **D** | Giữ cả 2, tuyên bố rõ **2 semantic axes độc lập** + định nghĩa composition/priority (card=quantitative summary; prose=authoritative deterministic) | 0 (chỉ tài liệu hóa) | phù hợp thực trạng | thấp | 0 | hợp thức hóa hiện trạng |
- Ràng buộc: Model C **mâu thuẫn** các lock đã có (reduced của Phá là load-bearing — 26D/26E/26F/26G) → gần như bị loại
  trừ trừ khi owner mở lại lock. Model B chỉ đụng heuristic legacy (an toàn hơn). Model A/D = giữ nguyên.

## 9. Decision Gate — Conclusions
- **Genuine double-count?** **KHÔNG** (scope partition: 1 Phá → 1 kênh theo vai hào). ĐÍNH CHÍNH 26G.
- **Intentional multi-axis?** **CÓ** — 2 hệ verdict song song (card định lượng + prose deterministic), 2 bề mặt.
- **Contribution từng kênh:** chamDiem → mucDoThuan/ketLuan/card (scope Dụng); chain → ketLuanSuViec/AI prose (scope
  Kỵ/Nguyên, priority #1 cho AI). Độc lập hoàn toàn (CF xác nhận).
- **Provenance đủ để quyết?** Cho **correctness**: đủ (không có bug/double-count). Cho **product**: chamDiem magnitudes
  là heuristic **không nguồn** — nếu owner muốn giảm phụ thuộc heuristic thì cân nhắc Model B/D.
- **Cần owner decision?** **CÓ nhưng REFRAME**: không phải "sửa double-count" (không có), mà "**có giữ card chamDiem
  (legacy heuristic) song song với chain deterministic (authoritative) không**, và nếu giữ thì tài liệu hóa priority
  (Model D)". Đây là **product/UX + provenance decision**, KHÔNG phải correctness bug.
- **Cần primary-source research thêm?** **KHÔNG cho correctness.** chamDiem magnitudes vốn là heuristic nội bộ (không kỳ
  vọng có nguồn cổ); reduced-của-Phá đã có nguồn/định-tính. Research thêm chỉ cần nếu owner muốn thay heuristic bằng
  rule có nguồn.

## 10. Open Owner Decisions
- **OD-H1:** Giữ 2 hệ verdict song song (Model A/D) hay tinh giản (Model B — bỏ Phá khỏi chamDiem legacy)?
- **OD-H2:** Nếu giữ, tài liệu hóa rõ **priority/role** (card = tóm tắt định lượng phụ trợ; prose/ketLuanSuViec =
  authoritative) — Model D?
- **OD-H3:** chamDiem magnitudes (−14/−10/…): chấp nhận là heuristic nội bộ, hay thay bằng rule có nguồn (research)?
- (Model C bị loại trừ trừ khi mở lại lock 26D/10A — KHÔNG khuyến nghị.)

## 11. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · scoring/conclusion/ky-nguyen-dung: NO.** doc: YES (file này).
- Regression: **318/318 PASS** (audit thuần; probe đã xóa).
- Commit chỉ doc này. **KHÔNG push.** STOP (không mở Phase 26I).
