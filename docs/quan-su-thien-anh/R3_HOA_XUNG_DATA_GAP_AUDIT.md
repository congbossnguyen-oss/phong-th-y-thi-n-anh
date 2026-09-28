# R3 — hoaXung DATA GAP Audit

**Branch:** `quan-su-thien-anh` · **Nature:** AUDIT ONLY. KHÔNG implementation/refactor/methodology/verdict/model-
selection change, KHÔNG push. Chỉ thêm 1 doc. Probe tạm đã xóa. Không đụng western-astrology WIP.
**Checkpoint:** HEAD `265aa8c` (Phase 26I). Regression 318/318.

---

## 1. Scope
Đóng hoặc xác định chính xác DATA GAP của `hoaXung` (producer duy nhất còn thiếu coverage sau 26G).

## 2. Runtime Trace
- **Tạo state:** `can-luc-hao.ts:284` — `hoaXung = hb.chiIndex === chiXungVoi(self.chiIndex)` (hb = `bien.hao[pos-1]`,
  self = `chinh.hao[pos-1]`). Chỉ tính khi `self.isDong` + có `cast.bien` (hb non-null).
- **Điều kiện chính xác:** hào ĐỘNG mà **chi của hào biến = xung (chi đối, +6) của chi hào gốc** tại cùng vị trí.
- **Vào reduced:** `can-luc-hao.ts:298` — `reduced = ...|| hoaXung || ...`.
- **Downstream:** `reduced` → `availabilityOf` (ky-nguyen-dung:81, source=Kỵ/Nguyên) → LIMITED → kyPressure/nguyenSupport
  → dungProtection → protectionFrom → concludeDung → **ketLuanSuViec**. (Dụng-tự inert như mọi reduced.)
- **Interaction:** động-only (cần biến); độc lập day/month/năm (thuần chinh↔bien); transformationState.hoaXung = **bản
  sao INERT** (no consumer, grep xác nhận); **KHÔNG** duplication ở burialState (đó là hoaMo).

## 3. Root Cause of Previous 0 Coverage (26G)
26G probe **single-line flip** 64 quẻ → hoaXung = 0. Nguyên nhân xác định = **B — CẦN MULTI-ĐỘNG**:
- Với 1 hào động (flip 1 line), hào biến tại `pos` chỉ đến **đúng 1 trigram biến** (trigram của nửa chứa pos, khác chinh
  đúng 1 bit). Trigram đó **không bao giờ** cho `bien.chi = xung(self.chi)` tại pos.
- Khi **≥2 hào cùng nửa (trigram)** động, trigram biến đổi ≥2 bit → `bien.chi` tại pos dịch tới trigram khác → **có thể
  = xung(self.chi)**.
- ⇒ hoaXung của hào `pos` phụ thuộc **các hào động KHÁC trong cùng trigram** → single-flip không đủ. (KHÔNG phải
  finalizeCast gap như hoaMo; hoaXung tính trong canLucHao từ bien, chỉ cần multi-động.)
- Loại trừ: A(single-động không thể) = ĐÚNG (single-flip 0); C(cần cấu trúc cụ thể) = chỉ cần ≥2 động cùng trigram;
  D/E/F = không (generator đúng, chỉ thiếu multi-động mask).

## 4. Coverage Methodology
Probe **multi-động** (đã xóa): 64 quẻ × mọi dong-mask (1..63) × pos∈mask; bien = flip toàn mask; canLucHao(cast, pos)
với dong=mask. Load-bearing đo trên grid day/month {Tý/Tý, Ngọ/Ngọ, Dần/Thân, Thân/Dần}, year=self (tránh tuePha),
sole-source filter (chỉ tính khi hoaXung là producer reduced DUY NHẤT). Dùng đúng runtime path (`lapQueDayDu` + canLucHao),
KHÔNG inject state giả.

## 5. Empirical Results
| Metric | Giá trị |
|---|---|
| Cấu trúc reachable (bien.chi=xung(self.chi) tại pos động, baseline) | **512** |
| canLucHao bật `hoaXung` (khớp cấu trúc) | **512** |
| sole-source (hoaXung là reduced producer duy nhất) | **512** |
| **LOAD-BEARING** (đổi availability khi bỏ hoaXung khỏi reduced) | **368** |
| → LIMITED→AVAILABLE | 64 |
| → LIMITED→STRONG | 304 |
| redundant (đã Suy → LIMITED sẵn) | 144 |
- **Concrete examples (≥10):**
  1. hex0 mask48 pos6 (Dậu) day=Tý month=Tý base=Trung Hòa → LIMITED→AVAILABLE
  2. hex0 mask48 pos6 (Dậu) day=Dần month=Thân base=Vượng → LIMITED→STRONG
  3. hex0 mask48 pos6 (Dậu) day=Thân month=Dần base=Vượng → LIMITED→STRONG
  4. hex0 mask49 pos6 (Dậu) day=Tý month=Tý base=Vượng → LIMITED→STRONG
  5. hex0 mask49 pos6 day=Dần month=Thân base=Vượng → LIMITED→STRONG
  6. hex0 mask49 pos6 day=Thân month=Dần base=Vượng → LIMITED→STRONG
  7. hex0 mask50 pos6 day=Dần month=Thân base=Vượng → LIMITED→STRONG
  8. hex0 mask50 pos6 day=Thân month=Dần base=Vượng → LIMITED→STRONG
  9. hex0 mask51 pos6 day=Tý month=Tý base=Trung Hòa → LIMITED→AVAILABLE
  10. hex0 mask51 pos6 day=Dần month=Thân base=Vượng → LIMITED→STRONG
  11. hex0 mask52 pos6 day=Tý month=Tý base=Trung Hòa → LIMITED→AVAILABLE
- (mask48=110000 → hào 5+6 động; mask49/50/51/52 = tổ hợp đa-động khác → xác nhận cần multi-động.)

## 6. Counterfactual
Chính phép đo load-bearing = counterfactual: `CURRENT` (hoaXung→reduced→LIMITED) vs `COUNTERFACTUAL` (bỏ hoaXung khỏi
reduced). Kết quả: **368 ca đổi** availability (64 AVAILABLE, 304 STRONG) → tác động verdict qua chain Kỵ/Nguyên; **144
redundant** (đã Suy). ⇒ hoaXung **KHÔNG** redundant nói chung — **load-bearing**.

## 7. Verdict / Chain Impact
- Load-bearing khi hoaXung nằm trên **Kỵ/Nguyên** (chain source) → đổi kyPressure/nguyenSupport → dungProtection →
  concludeDung → ketLuanSuViec. Trên Dụng: inert (như mọi reduced). ⇒ cùng khuôn mẫu với các reduced producer khác.

## 8. Provenance
| | Provenance | Loại |
|---|---|---|
| hoaXung (化冲: động hào biến ra chi xung chính nó) | Khái niệm hóa-biến trong engine (`can-luc-hao`); base sources (Ch. hóa biến); **verbatim cổ chưa verify** trong series này | **C/E** (engine/methodology representation, unverified verbatim) |
- KHÔNG biến thành classical quotation. Cùng mức provenance với hoiDauKhac/hoaMo/hoaTuyet.

## 9. Semantic Analysis
| So với | Giống | Khác |
|---|---|---|
| hoaMo / hoaTuyet | cùng họ **hóa-biến** (động-only, giữ base, kênh reduced) | cơ chế: xung vs mộ vs tuyệt |
| nguyet/nhat/tue Phá | cùng vào reduced, cùng "giảm/hạn chế" | Phá = quan hệ Nhật/Nguyệt/Năm; hoaXung = biến |
| transformationState | — | transformationState.hoaXung = **bản sao inert** (no consumer) |
| burialState | — | **KHÔNG** duplication (burialState chỉ hoaMo) |
| movementEfficacy | — | hoaXung KHÔNG có biểu diễn efficacy |
- reduced là **kênh ACTIVE DUY NHẤT** của hoaXung; transformationState.hoaXung inert (latent-risk chung của hóa-biến).

## 10. Final Gate — Classification
**A. REACHABLE + LOAD-BEARING** (reachable qua multi-động; 368/512 sole-source load-bearing; 144 redundant → **MIXED
nhưng có load-bearing rõ ràng**). **DATA GAP ĐÃ ĐÓNG.**
- KHÔNG phải D (không còn "not reachable"). KHÔNG phải E (không bug: 26G coverage thiếu multi-động là **coverage
  limitation đã giải thích**, KHÔNG phải implementation bug).

## 11. Implications for Reduced Architecture
- Với hoaXung đóng gap: **CẢ 7 producer đều REACHABLE + LOAD-BEARING** (nguyet 484 / nhat 132 / tue 614 / hoiDauKhac 224 /
  hoaMo 64 / hoaTuyet 144 / **hoaXung 368**). ⇒ **KHÔNG producer nào redundant/an-toàn-gỡ.**
- Củng cố Phase 26I lock "giữ 7 producer". KHÔNG cần thay đổi kiến trúc. transformationState/burialState inert vẫn là
  cleanup candidate riêng (không đổi).

## 12. Owner Decision
- **KHÔNG cần owner decision mới.** DATA GAP đóng, kết quả nhất quán lock 26I (giữ producer). Chỉ cập nhật trạng thái:
  hoaXung DATA GAP → **CLOSED (reachable + load-bearing via multi-động)**.
- (Tùy chọn ghi chú vào doc lock nếu owner muốn — KHÔNG bắt buộc; audit này đã ghi nhận.)

## 13. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · scoring/conclusion/ky-nguyen-dung/availabilityOf: NO.** doc: YES (file này).
- Regression: **318/318 PASS** (audit thuần; probe đã xóa).
- Commit chỉ doc này. **KHÔNG push.** STOP.
