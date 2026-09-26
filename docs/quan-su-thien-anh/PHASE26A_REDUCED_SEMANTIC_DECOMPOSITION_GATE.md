# Phase 26A — Reduced Semantic Decomposition Decision Gate

**Branch:** `quan-su-thien-anh` · **Nature:** AUDIT / DECISION PREP ONLY (no runtime/test/spec/scoring/conclusion/
ky-nguyen-dung change, no push). Chỉ thêm 1 doc. Grounded trên source HEAD `d971532`. Không đụng western-astrology WIP.

---

## 1. Corrected Architecture Statement
- `reduced` (can-luc-hao.ts:298) = `nguyetPha || nhatPha || tuePha || hoiDauKhac || hoaXung || hoaMo || hoaTuyet`.
- **Active** (computational) qua `ky-nguyen-dung.ts:81 availabilityOf` → `reduced||restrained` → `"LIMITED"` →
  kyPressure/nguyenSupport → dungProtection → protectionFrom → concludeDung → **verdict** — CHỈ khi hào là **source**
  (Kỵ/Nguyên).
- **Inert** cho **reduced của chính Dụng** (strengthFrom đọc effective-only; Dụng luôn là target).
- `availabilityOf` gộp **reduced + restrained + Suy** → cùng rank `"LIMITED"` = **mất thông tin** (không phân biệt
  nguồn/độ nặng).
- `transformationState` (chứa hoiDauKhac/hoaXung/hoaMo/hoaTuyet) **KHÔNG có consumer** (grep rỗng) → mô tả thuần;
  4 flag này **biểu diễn 2 lần**: (a) transformationState (inert) + (b) reduced (active).

## 2. Seven-Source Semantic Matrix
| | Trigger (chính xác) | Ý nghĩa | Quan hệ? | Hóa-biến? | Đổi base? | Đổi availability/protection? | Provenance | Coexist? |
|---|---|---|---|---|---|---|---|---|
| **A Nguyệt Phá** | `hasRel("Nguyệt Phá")` = Nguyệt kiến xung hào | tổn thương theo tháng | **CÓ** | không | không (giữ base) | **CÓ** (reduced) | [P] Chương VI | có |
| **B Nhật Phá** | `hasRel("Nhật Phá")` = Nhật xung + tĩnh + hưu/tù (N2) | vỡ trạng thái tĩnh-suy | **CÓ** | không | không (nhưng hào vốn Suy) | **CÓ** (reduced) — *trùng Suy* | [P] 增删卜易 | có |
| **C Tuế Phá** | `self.chiIndex === chiXungVoi(yearChiIndex)` | suy rất mạnh theo năm | **CÓ** (năm) | không | **không** (trục riêng) | **CÓ** (reduced) | **[D] lock 10A** (không cổ thư) | có |
| **D Hồi Đầu Khắc** | biến khắc hào gốc (`rel==="a-khac-b"`) | biến quay lại khắc | không | **CÓ** | không (giữ base) | **CÓ** (reduced) | [P?/D] engine (Chương VII) | (động) |
| **E Hóa Xung** | `hb.chiIndex === chiXungVoi(self.chiIndex)` | biến xung hào gốc | không | **CÓ** | không | **CÓ** (reduced) | [P?/D] engine | (động) |
| **F Hóa Mộ** | `hasRel("Nhập Mộ","CHANGED_YAO")` | biến vào Mộ | không | **CÓ** | không | **CÓ** (reduced) *(cũng ở burialState.hoaMo)* | [P?/D] engine | (động) |
| **G Hóa Tuyệt** | `hb.chiIndex === Tuyệt(self.nguHanh)` | biến vào Tuyệt | không | **CÓ** | không | **CÓ** (reduced) | [P?/D] engine | (động) |
- **A/B/C = "Phá" quan hệ** (xung theo Nguyệt/Nhật/Năm); **D–G = hóa-biến** (chỉ hào động). Bản chất khác nhau → gộp
  1 boolean là **mất phân biệt**. Nhật Phá (B) và Tuế Phá (C) khác nhau ở "đổi base": cả hai KHÔNG đổi base, nhưng B
  luôn đi kèm Suy (tĩnh-hưu/tù) còn C có thể trên hào Vượng → reduced của C **load-bearing**, của B **trùng Suy**.

## 3. Availability Collapse Audit (`availabilityOf`)
Precedence: `EMPTY → HIDDEN → (reduced||restrained → LIMITED) → Vượng→STRONG → Trung Hòa→AVAILABLE → Suy→LIMITED`.
| Case | Đầu vào | Kết quả | Thông tin mất |
|---|---|---|---|
| A | Suy only | LIMITED | (không phân biệt với reduced/restrained) |
| B | Nhật Phá only | LIMITED | trùng A (hào Nhật Phá vốn Suy → vẫn LIMITED nếu bỏ reduced) |
| C | Hóa Tuyệt only | LIMITED | biến-Tuyệt ≡ Suy ≡ Phá ở tầng chain |
| D | restrained only (Hóa Hợp) | LIMITED | **níu chân ≠ giảm lực** nhưng cùng LIMITED |
| E | nhiều điều kiện đồng thời | LIMITED | **KHÔNG cộng dồn** — 1 nhẹ = 5 nặng |
- **Chủ đích hay tiện lợi?** Comment + reason string ("tác động giảm, giữ nền lực") cho thấy chain **cố ý** chỉ cần
  tín hiệu thô "source có phát huy đầy đủ không" → LIMITED = "tác động ở mức giảm". Là **design convenience có chủ đích**
  cho mục tiêu chain (Kỵ có khắc nổi Dụng? Nguyên có sinh nổi Dụng?), **NHƯNG** làm mất provenance + độ nặng.
- Lưu ý đặc biệt: hào **Vượng** + Nguyệt/Tuế Phá → reduced short-circuit **trước** nhánh Vượng → **LIMITED dù Vượng**.
  (Với Nhật Phá không xảy ra vì hào Nhật Phá luôn Suy.)

## 4. Nhật Phá Separation Audit
Nhật Phá hiện có **2 biểu diễn**:
1. `movementEfficacy = BROKEN_STATIC` (Phase 25I, **FACT-only**, không tác động verdict).
2. `reduced = true` (**active** cho Kỵ/Nguyên qua chain).
- Hai cái = **cùng 1 điều kiện gốc** (N2) nhưng khác trục: (1) mô tả hiệu-lực; (2) hạn chế availability.
- **Điểm mấu chốt (evidence):** ở chain, Nhật Phá → reduced → LIMITED; nhưng hào Nhật Phá **vốn Suy** → cũng LIMITED
  qua nhánh Suy. ⇒ reduced-từ-Nhật-Phá **computationally REDUNDANT với Suy** (bỏ đi không đổi hành vi chain hiện tại).
- Phân loại: đây là **overloaded representation** (1 fact, 2 nơi) hơn là 2 hiệu ứng độc lập thực sự. (Chưa quyết.)

## 5. Tuế Phá Audit
- Tuế Phá = **[D] methodology lock Phase 10A** (spec §3.9: "trục giảm lực, GIỮ base, nhất quán Nguyệt/Nhật Phá"). KHÔNG
  cổ thư.
- Khác Nhật Phá: Tuế Phá **KHÔNG kéo theo Suy** (là trục năm riêng) → một hào **Vượng** vẫn có thể Tuế Phá → reduced
  làm nó **LIMITED** ở chain. ⇒ reduced-từ-Tuế-Phá **load-bearing** (không redundant).
- **Architecturally justified?** CÓ theo chính lock 10A ("trục giảm lực") — việc đưa vào reduced nhất quán với ý định
  "giảm lực nhưng giữ base". Nhưng vì là [D] (không primary), nếu tách reduced thì Tuế Phá cần quyết riêng (không tự
  gán cùng nhóm với Phá primary).

## 6. Hóa-Biến Duplication Audit
- `hoiDauKhac/hoaXung/hoaMo/hoaTuyet` nằm ở **transformationState** (return) VÀ được OR vào **reduced**.
- `transformationState` **KHÔNG có consumer** (grep rỗng) → chỉ serialize prompt (mô tả). Tác động **tính toán** duy
  nhất của 4 hóa-biến này là **qua reduced → LIMITED** (chain).
- **Consequence:** hiện KHÔNG double-COUNT (transformationState inert). NHƯNG là **redundant/latent-risk**: nếu tương
  lai một consumer đọc transformationState cho verdict, sẽ **đếm 2 lần** cùng hóa-biến (một qua transformationState,
  một qua reduced). Ngoài ra hoaMo còn xuất hiện lần 3 ở `burialState.hoaMo`.

## 7. Chain Semantics Audit
- `kyPressure` = effective mạnh nhất của Kỵ **khắc** Dụng; `nguyenSupport` = của Nguyên **sinh/đồng hành** Dụng;
  `dungProtection` tổng hợp → `protectionFrom` → `concludeDung`.
- Chain cần biết: "source có phát huy tác động đầy đủ không". Hiện dùng thang `STRONG/AVAILABLE/LIMITED/HIDDEN/EMPTY/
  NONE` (AVAIL_RANK). LIMITED = "tác động giảm, giữ nền".
- **Có cần generic LIMITED hay cần granular?** Cho **mục tiêu hiện tại** (có/không phát huy), generic LIMITED **đủ**.
  Granular (phân biệt Phá vs Suy vs Hóa Tuyệt vs Hóa Hợp) chỉ cần **nếu** verdict tương lai muốn đối xử khác nhau
  (vd Hóa Hợp "níu chân" có thể phát huy khi gặp xung khai hợp — timing — khác Suy). Hiện KHÔNG có rule đó. → granular
  là **tùy chọn tương lai**, không bắt buộc cho chain hiện tại.

## 8. Decision Models 0–3 (trung lập, KHÔNG xếp hạng)
| | Mô tả | Semantic clarity | Provenance fidelity | Compat | Migration | Double-count risk | Test burden | Reversibility | Modules |
|---|---|---|---|---|---|---|---|---|---|
| **M0** | Giữ boolean `reduced` | thấp (overloaded) | thấp (trộn [P]/[D]/engine) | 100% | 0 | (redundant transformationState tồn tại) | 0 | n/a | none |
| **M1** | Tách **Phá quan hệ** (A/B/C) khỏi **hóa-biến** (D–G) → 2 nhóm | trung bình | trung bình | cần map availabilityOf | trung bình | giảm | trung bình | cao | can-luc-hao + availabilityOf(+prompt) + tests |
| **M2** | Thay `reduced` bằng **union typed** (vd `reductionKind: "NGUYET_PHA"|"NHAT_PHA"|"TUE_PHA"|"HOI_DAU_KHAC"|...|null` hoặc list) | cao (giữ provenance) | cao | availabilityOf đọc union | trung bình-cao | thấp | cao | cao | can-luc-hao + availabilityOf + prompt + tests |
| **M3** | Tách 3 trục: **base-strength reduction** / **availability limitation** / **movement-broken** | cao nhất | cao | rework lớn | cao | thấp (trực giao) | cao | trung bình | can-luc-hao + ky-nguyen-dung + ket-luan(?) + prompt + tests |
- Ràng buộc chung mọi model: giữ invariants Nhật Xung §3.10/§3.10.1 (movementEfficacy FACT-only; KHÔNG số-hoá; KHÔNG
  nhập 黄金策); KHÔNG làm reduced-của-Dụng tự nhiên tác động verdict trừ khi owner khóa.

## 9. DQ1–DQ6 (trả lời bằng EVIDENCE, KHÔNG quyết methodology)
- **DQ1 (Nhật Phá → generic reduced?)** — *Evidence:* redundant với Suy ở chain (hào Nhật Phá luôn Suy → LIMITED dù
  bỏ reduced). Nghĩa riêng "broken static" đã có ở movementEfficacy. ⇒ reduced-từ-Nhật-Phá **không thêm hành vi**; giữ
  hay bỏ là lựa chọn rõ-nghĩa, không đổi output hiện tại. (Owner quyết.)
- **DQ2 (Tuế Phá → generic reduced?)** — *Evidence:* **load-bearing** (Tuế Phá trên hào Vượng → LIMITED chỉ nhờ
  reduced). Nhất quán lock 10A. Nếu bỏ khỏi reduced sẽ **đổi hành vi** (hào Vượng+Tuế Phá thành STRONG). ⇒ khác DQ1.
- **DQ3 (Hóa Tuyệt ≡ Nhật Phá?)** — *Evidence:* bản chất khác (động-biến vs tĩnh-Nhật xung); không nguồn nào đồng nhất;
  hiện gộp là tiện lợi. Semantic KHÁC nhau.
- **DQ4 (Hóa Xung/Mộ/Hồi Đầu Khắc cùng semantics?)** — *Evidence:* đều "biến bất lợi", hiện cùng reduced→LIMITED;
  phân biệt cơ chế còn ở transformationState (inert). Gộp = mất granularity nhưng chưa có rule cần phân biệt.
- **DQ5 (Suy và reduced cùng LIMITED?)** — *Evidence:* cố ý (chain cần tín hiệu thô); mất phân biệt "yếu" vs "tổn
  thương" vs "níu chân". Chỉ cần tách nếu verdict tương lai đối xử khác (chưa có).
- **DQ6 (BROKEN_STATIC ⟂ reduced?)** — *Evidence:* cùng 1 fact gốc (Nhật Phá) biểu diễn 2 trục; hiện độc lập về code
  (efficacy FACT-only, reduced active). Là overloaded-source, không phải 2 hiệu ứng độc lập thực sự.

## 10. Unknowns / Evidence Gaps
- Hóa-biến (D–G) chưa re-verify verbatim trong series này (dựa engine/base sources Chương VII).
- Không rõ chủ đích lịch sử: reduced-của-**Dụng** để inert (chỉ Kỵ/Nguyên active) là **thiết kế** hay **bỏ sót**.
- Không rõ có nên phân cấp độ nặng (1 vs nhiều điều kiện) ở chain — không có rule nguồn.
- Quan hệ mong muốn giữa 2 hệ verdict (chamDiem legacy ↔ chain) khi cùng đọc Phá — vẫn treo (Phase 26 DQ5).

## 11. Future Implementation Boundaries
- M1/M2: đụng `can-luc-hao.ts` (thay boolean bằng nhóm/union) + `ky-nguyen-dung.ts::availabilityOf` (đọc dạng mới) +
  prompt legend + tests. KHÔNG đụng ket-luan trừ khi cố ý đổi verdict.
- M3: thêm `ket-luan-su-viec.ts` — rủi ro cao, cần rule owner.
- Mọi trường hợp: giữ output verdict hiện tại **trừ khi owner cố ý đổi**; test-first; regression 318 phải xanh (hoặc
  cập nhật có chủ đích); chỉ stage file của phase; KHÔNG push; KHÔNG đụng movementEfficacy FACT-only lock.

## 12. DO NOT IMPLEMENT UNTIL DECIDED
Giữ `reduced` boolean (M0) cho tới khi DQ1–DQ6 được owner khóa. KHÔNG tách reduced, KHÔNG đổi `availabilityOf`, KHÔNG
nối reduced-của-Dụng vào verdict, KHÔNG hợp nhất chamDiem/chain, KHÔNG đụng transformationState/movementEfficacy.

## 13. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · scoring/conclusion/ky-nguyen-dung: NO.** doc changed: YES (chỉ file này).
- Regression: **318/318 PASS** (xác nhận). Commit chỉ doc này. **KHÔNG push.** STOP.
