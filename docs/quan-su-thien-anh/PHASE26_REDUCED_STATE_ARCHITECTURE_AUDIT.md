# Phase 26 — Reduced-State Architecture Audit

**Branch:** `quan-su-thien-anh` · **Nature:** AUDIT ONLY (no runtime/test/spec/scoring/conclusion/Ứng-Kỳ change, no push).
Chỉ thêm 1 doc. Không đụng western-astrology WIP. Grounded 100% trên source hiện tại (HEAD `fc5bf47`).

---

## 1. Current Reduced-State Inventory
`currentState.reduced: boolean` (can-luc-hao.ts:99) — "có tổn thương (Phá/Hồi Đầu Khắc/Hóa Xung-Mộ-Tuyệt) — giảm lực
nhưng GIỮ base". Tạo tại **can-luc-hao.ts:298**:
```ts
const reduced = nguyetPha || nhatPha || tuePha || hoiDauKhac || hoaXung || hoaMo || hoaTuyet;
```
Là **OR của 7 nguồn khác loại** (3 "Phá" quan hệ + 4 hóa-biến). Boolean đơn → mất phân biệt nguồn.

## 2. Source Map (file → function → region → mục đích)
| File | Hàm/vị trí | Vai trò với `reduced` |
|---|---|---|
| `can-luc-hao.ts:298` | `canLucHao` | **CREATE** `reduced` (OR 7 nguồn) |
| `can-luc-hao.ts:338` | `canLucHao` return | ghi vào `currentState.reduced` |
| `can-luc-hao.ts:99` | interface | định nghĩa field |
| `ky-nguyen-dung.ts:81` | `availabilityOf` | **READ** — `reduced || restrained` → `"LIMITED"` |
| `ky-nguyen-dung.ts:104` | `interactionOf` | **READ** — reason string ("Phá/Hồi Đầu Khắc/Hóa bất lợi") |
| `ket-luan-su-viec.ts:135` | `synthDung` | **READ** — CHỈ reason string cho Dụng |
| `luan-giai/prompt.ts:156` | legend | mô tả field cho AI (FACT) |
| (không có) | scoring `chamDiem` | KHÔNG đọc `reduced` (chamDiem đọc relations riêng) |
- **CREATE:** 1 nơi (can-luc-hao:298). **READ (computational):** `availabilityOf` (ky-nguyen-dung:81) — nơi DUY NHẤT
  `reduced` tác động tính toán. **READ (chỉ text):** ket-luan:135, ky-nguyen-dung:104, prompt:156.

## 3. Semantic Classification (7 nguồn tạo reduced)
| Nguồn | Điều kiện trigger | Tĩnh/Động | Từ Nhật Xung? | Từ relation khác? | Từ vượng/suy? | Từ hóa biến? | Temporal? | Structural? |
|---|---|---|---|---|---|---|---|---|
| `nguyetPha` | Nguyệt kiến xung hào | cả hai | không | **CÓ** (Nguyệt Phá) | không | không | ~ (theo tháng) | quan hệ |
| `nhatPha` | Nhật xung + tĩnh + hưu/tù (N2) | **tĩnh** | **CÓ** (N2) | — | **CÓ** (suy) | không | ~ (theo ngày) | quan hệ |
| `tuePha` | Năm xung hào | cả hai | không | (Tuế Phá) | không | không | ~ (theo năm) | quan hệ |
| `hoiDauKhac` | biến khắc hào gốc | **động** | không | không | không | **CÓ** | không | biến |
| `hoaXung` | biến xung hào gốc | **động** | không | không | không | **CÓ** | không | biến |
| `hoaMo` | biến vào Mộ | **động** | không | không | không | **CÓ** | không | biến |
| `hoaTuyet` | biến vào Tuyệt | **động** | không | không | không | **CÓ** | không | biến |
- ⇒ **KHÔNG đồng nhất:** 3 "Phá" (quan hệ xung theo Nguyệt/Nhật/Năm) + 4 hóa-biến (chỉ hào động). `reduced=true` gộp
  ≥3 hiện tượng khác bản chất → **boolean bị overload**.

## 4. Verdict Pipeline Trace (reduced biến mất ở đâu?)
```
HaoInfo → canLucHao → HaoStrengthState.currentState.reduced
  ├─(A) source=Kỵ/Nguyên: availabilityOf(cs) → "LIMITED" (nếu reduced) → interactionOf.effective
  │      → maxEffective → kyPressure / nguyenSupport → dungProtection
  │      → protectionFrom(knd) → concludeDung(strength, protection, temporal) → VERDICT   ✅ CÓ tác động
  ├─(B) Dụng (chính nó): strengthFrom(dungCs) đọc CHỈ cs.effective (KHÔNG đọc reduced)
  │      Dụng KHÔNG bao giờ là "source" trong chain (chỉ là target) → reduced KHÔNG vào chain
  │      → chỉ còn ket-luan:135 reason string                                           ❌ INERT (computational)
  └─(C) chamDiem (legacy score): KHÔNG đọc reduced (đọc relations Nguyệt/Nhật Phá riêng)
```
- **Đính chính báo cáo trước (25D/25H):** phát biểu "reduced inert với verdict" chỉ ĐÚNG cho **reduced của chính hào
  Dụng**. Với **Kỵ/Nguyên**, reduced **CÓ** tác động verdict (qua availabilityOf→LIMITED→pressure/support→protection).
- `reduced` "biến mất" đúng ở: **strengthFrom** (chỉ effective) và **với Dụng-là-target** (không qua chain).
- `availabilityOf` **gộp** `reduced || restrained || (effective==="Suy")` → cùng `"LIMITED"` (cùng rank) ⇒ 3 nguyên
  nhân khác nhau không phân biệt được ở tầng chain.

## 5. Double-Counting Matrix (reduced × tín hiệu khác)
| Tín hiệu | Quan hệ với reduced |
|---|---|
| base | orthogonal (reduced giữ base) |
| effective | **overlap ở chain**: Suy(effective) và reduced đều → "LIMITED" cùng rank |
| vượng/suy | Phá (Nguyệt/Nhật/Tuế) không đổi vượng/suy nhưng ở chain cùng gộp "LIMITED" với Suy |
| Nguyệt kiến | `nguyetPha` sinh TỪ Nguyệt xung → liên đới |
| Nhật thần | `nhatPha` sinh TỪ Nhật xung |
| động/tĩnh | 4 hóa-biến chỉ động; Phá cả hai → reduced trộn động-only + không-phân-động |
| Nhật Xung | `nhatPha` là 1 outcome Nhật-Xung → **overlap với movementEfficacy** |
| hóa biến | 4/7 nguồn reduced (hoiDauKhac/hoaXung/hoaMo/hoaTuyet) **ĐỒNG THỜI** ở `transformationState` → **double-representation** |
| movementEfficacy | Nhật Phá xuất hiện ở CẢ `reduced` (active Kỵ/Nguyên) LẪN `movementEfficacy=BROKEN_STATIC` (FACT). 散/愈动 KHÔNG set reduced (đúng) |
| chamDiem | chamDiem chấm Nguyệt Phá(-14)/Nhật Phá(-10) TRỰC TIẾP từ relations; chain lại dùng reduced-từ-cùng-Phá → **2 hệ verdict song song đếm cùng 1 Phá** |
- **Phân loại reduced:** **C — OVERLOADED/MIXED semantic** (gộp Phá quan hệ + hóa-biến; trùng transformationState;
  trùng một phần effective/Suy ở chain; Nhật Phá trùng movementEfficacy; cùng Phá bị đếm ở cả chamDiem lẫn chain).

## 6. Provenance Matrix (chỉ đã có/đã verify — không claim mới)
| Nguồn reduced | Provenance | Mức |
|---|---|---|
| Nguyệt Phá | Chương VI "Nguyệt kiến xung với hào là nguyệt phá" (chú thích engine luc-hao.ts) | **[P]** (bản dịch nội bộ) |
| Nhật Phá | 增删卜易 日辰章 (verify Phase 25C) | **[P]** |
| Tuế Phá | **Thầy khóa Phase 10A** — KHÔNG cổ thư (spec §3.9 ghi rõ) | **[D]** methodology lock |
| Hồi Đầu Khắc / Hóa Xung / Hóa Mộ / Hóa Tuyệt | hóa-biến (base sources Chương VII); CHƯA re-verify verbatim trong series này | **[P?/D]** engine rule |
- ⇒ **`reduced` KHÔNG có MỘT nghĩa cổ điển duy nhất.** Nó trộn: primary quan hệ (Nguyệt/Nhật Phá), **methodology lock**
  (Tuế Phá), và **hóa-biến** (project/engine). Boolean đơn = **semantically overloaded** (flag rõ).

## 7. Nhật Phá vs Reduced Analysis (STEP 7)
- Nhật Phá hiện đóng **2 vai** song song: (a) `movementEfficacy = BROKEN_STATIC` (FACT-only, Phase 25I) và (b) 1 trong
  7 nguồn của `reduced` (active cho Kỵ/Nguyên qua chain).
- Trong `reduced`, Nhật Phá bị đối xử **giống hệt** Hóa Mộ/Hóa Tuyệt… → gộp "broken static state" (N2, tĩnh-suy) vào
  "generic reduced strength". Đây LÀ conflation: bản chất N2 (tĩnh-suy bị Nhật xung) ≠ bản chất hóa-biến (động).
- **Chưa quyết:** Nhật Phá nên (i) chỉ là 1 producer của reduced (giữ nguyên), hay (ii) tách khỏi reduced và biểu diễn
  riêng (BROKEN_STATIC đã có ở movementEfficacy) để reduced thuần "hóa-biến/Phá lực". KHÔNG quyết ở phase này.

## 8. Architecture Models 0–3 (trung lập, KHÔNG xếp hạng)
| | Mô tả | Provenance support | Arch impact | Double-count risk | Migration | Reversibility | Modules ảnh hưởng | Test burden |
|---|---|---|---|---|---|---|---|---|
| **M0** | Giữ `reduced` boolean như hiện tại (informational + active-cho-Kỵ/Nguyên) | n/a | 0 | (đã có sẵn) | 0 | n/a | none | none |
| **M1** | **Tách** reduced thành nhiều state tường minh (vd `phaState`/`transformState`/…) | cao (phản ánh provenance khác nhau) | trung bình | giảm (phân biệt được) | trung bình | cao | can-luc-hao + ky-nguyen-dung(availabilityOf) + prompt + tests | trung bình |
| **M2** | reduced thành **trục EFFECT độc lập** (như movementEfficacy) | trung bình | trung bình | thấp nếu trực giao | trung bình | cao | can-luc-hao (+field) + consumers tùy | trung bình |
| **M3** | Rework `reduced` **bên trong** strength architecture (vd nối vào effective/verdict cho Dụng) | **yếu** (không nguồn số; đã double-count) | **cao** (đụng lõi verdict) | **cao** | cao | thấp | can-luc-hao + ket-luan + ky-nguyen-dung + tests | cao |

## 9. Unknowns / Evidence Gaps
- Không có nguồn quy định `reduced` phải tác động verdict của **Dụng** (hiện chỉ tác động qua Kỵ/Nguyên — phát sinh từ
  thiết kế chain, không từ 1 rule cổ khóa "reduced→verdict").
- Hóa-biến (4 nguồn) chưa re-verify verbatim trong series này (dựa engine/base sources).
- Không rõ chủ đích: `availabilityOf` gộp reduced+restrained+Suy thành "LIMITED" là **cố ý** (đơn giản hóa) hay **vô
  tình** mất thông tin.
- Quan hệ mong muốn giữa **2 hệ verdict song song** (chamDiem legacy score ↔ chain deterministic) — cả hai cùng đọc Phá.

## 10. Decision Questions (methodology owner)
- **DQ1.** `reduced` nên giữ boolean gộp (M0) hay tách theo provenance/bản chất (M1/M2)?
- **DQ2.** Có chủ đích để `reduced` của **Dụng** cũng tác động verdict không (hiện chỉ Kỵ/Nguyên)? Nếu có → theo rule
  nào (tránh double-count với Suy)?
- **DQ3.** `availabilityOf` gộp reduced+restrained+Suy = "LIMITED" — giữ hay tách?
- **DQ4.** Nhật Phá: giữ trong reduced (M0) hay tách (BROKEN_STATIC đã có ở movementEfficacy)?
- **DQ5.** Hai hệ verdict (chamDiem ↔ chain) cùng đếm Phá — hợp nhất/loại bỏ chamDiem legacy hay giữ song song?
- **DQ6.** Tuế Phá (methodology lock, không cổ thư) có nên đối xử KHÁC các Phá có primary không?

## 11. Exact Implementation Boundaries for a Future Phase
- Nếu M1/M2: field/state mới ở `can-luc-hao.ts`; cập nhật `availabilityOf` (ky-nguyen-dung.ts:81) để đọc state mới thay
  vì boolean gộp; cập nhật prompt legend; test.
- Nếu M3: đụng `ket-luan-su-viec.ts` (strengthFrom/concludeDung) — **rủi ro cao**, cần rule owner + tránh double-count.
- Mọi trường hợp: giữ invariants Nhật Xung §3.10/§3.10.1 (movementEfficacy FACT-only; KHÔNG số-hoá; KHÔNG nhập 黄金策).
  Test-first, diff tối thiểu, chỉ stage file của phase, KHÔNG push.

## 12. DO NOT IMPLEMENT UNTIL DECIDED
Giữ `reduced` như hiện tại (M0) cho tới khi DQ1–DQ6 được owner khóa. KHÔNG tách, KHÔNG nối reduced-của-Dụng vào verdict,
KHÔNG hợp nhất chamDiem/chain, KHÔNG đổi `availabilityOf` trong phase này.

## 13. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · scoring/conclusion/Ứng-Kỳ: NO.** doc changed: YES (chỉ file này).
- Regression: **318/318 PASS** (xác nhận). Commit chỉ doc này. **KHÔNG push.** STOP.
