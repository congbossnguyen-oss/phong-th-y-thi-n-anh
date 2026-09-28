# Phase 23C — Nhật Xung Classical Methodology Adjudication

**Branch:** `quan-su-thien-anh` · **Nature:** AUDIT + ADJUDICATION ONLY.
**runtime: NO · HaoRelationType: NO · tests: NO · LUAN_QUE_LUC_HAO_SPEC: NO · Nhật Tán implemented: NO · Phase 24: NO.**

Cập nhật với **văn bản cổ đã truy xuất & ghi URL**. Không fabricate; nguồn chưa verify verbatim được đánh dấu rõ.
Không trộn trường phái ngầm; không tuyên bố "cổ nhân đồng thuận" ở chỗ nguồn thực sự khác nhau.

---

## 1. Checkpoint

- HEAD trước phase: `563bb03` (Phase 23B). Phase 23B finding: **METHODOLOGY REMAINS AMBIGUOUS** (khi CHƯA có cổ thư).
- Phase 23C nạp được văn bản cổ → nâng cấp phán định (xem §14 evolution).
- Runtime unchanged; no Phase 24. Regression: §14.

## 2. Primary Sources (đã truy xuất, kèm mức verify)

| # | Nguồn | Chương | URL | Mức verify |
|---|---|---|---|---|
| S1 | 《增删卜易》 (野鹤老人, Thanh) | 018章 日辰章 | https://www.quanxue.cn/qt_mingxiang/zengshanpy/zengshanpy19.html | **VERBATIM** (2 host độc lập) |
| S1b | 《增删卜易》 日辰章 (đối chiếu) | 日辰章原文及卦例 | https://ly.yishihui.net/17685.htm | **VERBATIM** (khớp S1) |
| S2 | 《黄金策·总断千金赋》 (Lưu Bá Ôn, Minh; nằm trong 卜筮正宗) | 总断千金赋 | https://www.quanxue.cn/qt_mingxiang/huangjin/huangjin01.html | **VERBATIM** |
| S3 | 《卜筮正宗》 (王洪绪, Thanh) | 卷 (index) | https://ctext.org/wiki.pl?chapter=889452 | index OK; **fetch bị chặn** (security notice) |
| S3b | 《卜筮正宗》 | 卷六 | https://www.shidianguji.com/zh/book/HY0057/chapter/1lpdfpe5gs8wz | **PARTIAL** ("動逢衝而事散", "空逢冲而有用") |
| S3c | 卜筮正宗 冲实/冲散/暗动/日破 phân biệt | (bài tổng hợp) | https://www.sohu.com/a/924927281_122493870 | **SECONDARY** (không dùng làm primary) |
| S4 | 《易冒》 (程良玉) | 日辰/日冲 | (baike) https://baike.baidu.com/item/易冒/9650000 | **UNVERIFIED VERBATIM** — chỉ có summary hướng, KHÔNG trích nguyên văn |

> Ghi chú trung thực: S3c/S4 là **secondary**; theo guardrail (và yêu cầu phase) KHÔNG dùng thay primary. 易冒 (S4)
> chỉ đủ để nêu **hướng**, KHÔNG đủ để trích 原文 → mọi kết luận về 易冒 dán nhãn *low-confidence, cần primary*.

## 3. Source Evidence Matrix

Thuật ngữ: 暗动 (ám động) · 日破/暗破 (nhật phá) · 散/冲脱 (tán/xung thoát) · 愈动 (dũ động — càng động) ·
旺 (vượng) · 衰/休囚 (suy/hưu tù) · 动/静 (động/tĩnh).

| SOURCE | CHƯƠNG | 静+旺 (N1) | 静+衰 (N2) | 动+旺 (N4) | 动+衰 (N3) | EFFECT OF NARROW 日冲 | NOTES |
|---|---|---|---|---|---|---|---|
| **S1 增删卜易** | 日辰章 | **暗动** ("冲旺相之静爻，即为暗动") | **日破** ("冲衰弱之静爻，则为日破") | **愈动** ("爻旺而动，冲之愈动") | **散** ("爻衰而动，冲之则散") | 旺→愈lực; 衰→vô dụng/tán | Ngoại lệ: "爻逢月建，日冲而不散" |
| **S2 黄金策** | 总断千金赋 | **暗兴/暗动** ("静得冲而暗兴") | *không tách* → vẫn 暗动 (couplet không chia 旺/衰) | **散** ("动逢冲而事散") | **散** (cùng câu, vô điều kiện) | 动→事散; "凡动爻而逢冲散脱者，吉不成吉，凶不能成凶" | **KHÔNG điều kiện 旺/衰** (đã xác nhận verbatim) |
| **S3 卜筮正宗** | 卷/黄金策 | 暗动 | (kế thừa 日破, cần primary) | (theo "動逢衝而事散" → 散; tinh chỉnh 冲空/冲实 riêng) | 散/冲脱 | "動逢衝而事散"; "空逢冲而有用" | PARTIAL; trục 空/不空 là chủ đề riêng của 王洪绪 |
| **S4 易冒** | 日冲 | 暗动 (đắc lực) | 日破 | *不rõ* | 散 | 日辰临爻→"逢冲不散" | UNVERIFIED VERBATIM — chỉ hướng |

**Đọc ma trận:** khác biệt cốt lõi nằm ở ô **动+旺 (N4)**: S1 (增删卜易) = **愈动**; S2 (黄金策) = **散**. Đây là
**xung đột trường phái thật**, không phải mơ hồ.

## 4. N1–N4 Cross-Source Matrix

| Case | Điều kiện | S1 增删卜易 | S2 黄金策 | S3 卜筮正宗 | S4 易冒 | Có nguồn nào cho exception? |
|---|---|---|---|---|---|---|
| **N1** | Tĩnh+Vượng+冲 | 暗动 | 暗动 | 暗动 | 暗动 | (nhất trí) |
| **N2** | Tĩnh+Suy+冲 | 日破 | (couplet: 暗动; 日破 là tinh chỉnh đời sau) | 日破 | 日破 | S2 verse thô hơn |
| **N3** | Động+Suy+冲 | 散 | 散 | 散/冲脱 | 散 | **nhất trí = 散** |
| **N4** | Động+Vượng+冲 | **愈动 (KHÔNG 散)** | **散 (vô điều kiện)** | 散 (theo verse; chưa thấy tinh chỉnh 旺动) | *không rõ* | **XUNG ĐỘT S1 ↔ S2/S3** |

## 5. 增删卜易 Profile (S1)

- Verbatim (日辰章): "冲旺相之静爻，即为暗动，冲衰弱之静爻，则为日破。" · "爻旺而动，冲之愈动，爻衰而动，冲之则散。" ·
  "爻逢月建，日冲而不散，是明知当令不畏日冲矣。"
- **Bốn (năm) trạng thái, dùng CẢ 动/静 LẪN 旺/衰:** 静旺→暗动 · 静衰→日破 · 动旺→**愈动** · 动衰→散.
- Internal consistency: **CÓ** (2×2 đầy đủ, không chồng lấn). Precedence: **không cần**. Tách tên/lực:
  **KHÔNG tách** (旺/衰 nằm trong tên). **Giải N4 tường minh: CÓ (愈动).** 案例: có 卦例 trong 日辰章 (chưa trích ở §9).

## 6. 易冒 Profile (S4)

- **UNVERIFIED VERBATIM.** Hướng (theo summary): 静旺→暗动 (đắc lực), 静衰→日破, 动→散, 日辰临爻→逢冲不散.
- Internal consistency: chưa kiểm chứng bằng 原文. Giải N4 (动旺): **không rõ từ summary**. → *low-confidence; cần primary.*

## 7. 卜筮正宗 Profile (S3)

- Primary verbatim có được: "動逢衝而事散", "空逢冲而有用" (S3b). Phần phân biệt 冲实/冲散/暗动/日破 theo trục
  **空/不空 × 动/静** hiện chỉ có ở S3c (**secondary**) → KHÔNG dùng làm primary.
- 王洪绪 nổi tiếng "biện ngụy" (辟诸书之谬) và bổ sung trục **空/不空** (冲空则实/起) — đây là **trục thứ ba** (Không
  Vong) ngoài phạm vi N1–N4 thuần 旺/衰×动/静.
- Internal consistency: theo verse 动→散 (giống S2). Tinh chỉnh 旺动 (như S1) **chưa xác nhận primary**. Giải N4:
  theo mặt chữ verse = 散; **chưa có bằng chứng primary rằng 卜筮正宗 theo 愈动 của 增删卜易.**

## 8. Current Quân Sư Spec (§99 / §158 / Chương VI)

| Rule hiện tại | Phân loại đối chiếu nguồn |
|---|---|
| 静旺+冲 → Ám Động (N1) | **directly supported** (S1/S2/S3/S4 nhất trí) |
| 静衰+冲 → Nhật Phá (N2) | **directly supported** bởi S1 (日破); S2 verse thô hơn |
| 动+冲 → Nhật Tán, **vô điều kiện** (bao cả N4) | **matches S2 黄金策** (动逢冲而事散) — NHƯNG **conflicts với S1 增删卜易** (动旺→愈动) |
| Chương VI: chỉ nói hào **TĨNH** (旺→暗动, 衰→日破) | **partially supported**; im lặng về 动 → không nói N3/N4 |

**Phát hiện then chốt:** spec hiện tại là **HYBRID hai trường phái** — hàng **tĩnh lấy theo 增删卜易** (N1 暗动 /
N2 日破) nhưng hàng **động lấy theo 黄金策** (动→散 vô điều kiện). Đây **chính là** "silent merge of incompatible
schools": vì 增删卜易 (nguồn cấp N1/N2) lại nói N4 = **愈动 ≠ 散**, nên gán N4 = Nhật Tán/散 **mâu thuẫn với chính
nguồn** đã dùng cho N1/N2. Đây là gốc của "ambiguity" mà Phase 23B thấy — thực chất là **xung đột trường phái bị
gộp ngầm**, không phải thiếu nguồn.

## 9. Nhật Phá vs Nhật Tán (từ primary)

- **日破** (S1: "冲衰弱之静爻，则为日破"): dành cho hào **TĨNH suy** bị 冲. Ngữ cảnh = tĩnh.
- **散 / 冲脱** (S2: "动逢冲而事散"; S3b "動逢衝而事散"; S1 "衰动→散"): dành cho hào **ĐỘNG** bị 冲. Ngữ cảnh = động.
- ⇒ **Kết luận Task 7 = B + C:** 日破 và 散/冲脱 **KHÔNG đồng nghĩa**; là **phân loại khác nhau theo ngữ cảnh
  动/静** (日破←tĩnh; 散←động). 冲脱 = biến thể chữ của 散 (cùng nghĩa "tan/mất tác dụng động"), theo S3b/S3c.
- **Hệ quả cho Quân Sư:** "Nhật Tán" (散) **đúng là quan hệ riêng**, khác "Nhật Phá" (日破) — chúng ở **ô khác
  nhau** (động vs tĩnh). Việc gán N3 = Nhật Phá (engine hiện tại) là **sai ô** theo mọi nguồn (N3 phải là 散).

## 10. N4 Adjudication (trọng tâm)

Câu hỏi: 动+旺+冲 = ?
- **S1 增删卜易 (verbatim):** "爻旺而动，冲之**愈动**" → N4 = **愈动**, KHÔNG phải 散. Tức trong 4 lựa chọn của Task 6:
  **(1) N4 KHÔNG nên gọi là Nhật Tán** và **(3) "散/Tán" chỉ áp cho hào ĐỘNG SUY (衰动)** — theo 增删卜易.
  Đồng thời **(2) N4 là một trạng thái động riêng biệt (愈动 = "càng động", cát/đắc lực)**.
- **S2 黄金策 (verbatim):** "动逢冲而事散" vô điều kiện → N4 = **散** (Nhật Tán). Không có ngoại lệ 旺.
- **S3 卜筮正宗:** theo verse = 散; chưa có primary xác nhận theo 愈动.
- **S4 易冒:** không rõ (UNVERIFIED).

⇒ **Hai nguồn primary xác thực (S1 và S2) TRỰC TIẾP MÂU THUẪN ở N4.** Không "ép" mapping (đúng cảnh báo Task 6:
"Do not force a mapping"). Cả hai đều nội tại nhất quán và đều **giải N4 tường minh** — nhưng ra **hai kết quả trái
ngược** (愈动 cát vs 散 hung). ⇒ N4 **không** có đáp án cổ-thư-đồng-thuận.

## 11. Strength vs Classification (Task 8)

- **S2 黄金策:** phân loại theo **动/静 MỘT MÌNH** (静→暗动, 动→散); 旺/衰 KHÔNG vào tên (đã xác nhận verbatim "text
  does not condition on 旺/衰") → **S2 ỦNG HỘ tách 2 trục** (tên=动/静; lực=旺/衰, bàn ở phần đoán riêng).
- **S1 增删卜易:** 旺/衰 **vào thẳng tên** (静旺=暗动 vs 静衰=日破; 动旺=愈动 vs 动衰=散) → **S1 KHÔNG tách** (một
  trục phân loại hợp nhất 2 chiều).
- ⇒ **Task 8 KHÔNG chứng minh được tách trục phổ quát, cũng KHÔNG bác bỏ hoàn toàn: nó PHỤ THUỘC TRƯỜNG PHÁI.**
  黄金策 → hai-trục hợp lệ; 增删卜易 → một-trục-phân-loại-hai-chiều. **Không được giả định two-axis** (đã kiểm, kết
  quả là *conditional on profile*).

## 12. Methodology Profile Assessment

| Profile | N1 | N2 | N3 | N4 | Internal consistency | Source support | Conflict với spec hiện tại | Impl consequence | **Phân loại** |
|---|---|---|---|---|---|---|---|---|---|
| **A. 增删卜易** | 暗动 | 日破 | 散 | **愈动** | CÓ (2×2) | **VERBATIM** | Xung đột ở N4 (spec:散 ≠ A:愈动) + N3 (spec:Nhật Phá ≠ A:散) | cần thêm state **愈动** + sửa nhãn N3; truyền 旺/衰+isDong | **COMPATIBLE WITH EXPLICIT SPEC CHANGE** |
| **B. 易冒** | 暗动 | 日破 | 散 | ? | chưa kiểm | UNVERIFIED | chưa xác định (N4 unknown) | — | **INSUFFICIENT EVIDENCE** |
| **C. 卜筮正宗** | 暗动 | 日破 | 散/冲脱 | 散 (theo verse) | CÓ (thêm trục 空/不空) | PARTIAL primary | khớp spec ở 动→散 (gồm N4); thêm trục Không Vong | cần trục 空/不空 + nhãn 散 cho cả N4 | **PARTIALLY COMPATIBLE** |
| **D. Quân Sư synthesis hiện tại** | 暗动 | Nhật Phá | Nhật Phá(⚠) | Nhật Tán/散 | **KHÔNG** (hybrid S1静 + S2动) | mixed | (chính nó) — N4 lấy S2, N1/N2 lấy S1 → tự mâu thuẫn nguồn | N3 đang sai ô (Nhật Phá thay vì 散) | **CONFLICTING (nội tại)** |

*(Không xếp hạng best/worst — chỉ phân loại tương thích.)*

## 13. Decision Required From Thầy

**Chỉ các câu còn thực sự treo:**

- **Q1. N4 (动+旺+冲) = ?** — cổ thư **mâu thuẫn**: 增删卜易 = **愈动** (cát, càng động); 黄金策/卜筮正宗 = **散**
  (Nhật Tán, hung). Thầy chọn kết quả nào?
- **Q2. Nhật Tán vs Nhật Phá:** primary xác nhận **khác ô** (日破←tĩnh suy; 散←động). Thầy xác nhận Quân Sư tách
  **Nhật Tán (散, cho động)** khỏi **Nhật Phá (日破, cho tĩnh suy)**? (⇒ N3 hiện gán Nhật Phá là **sai ô theo mọi
  nguồn**, phải là 散.)
- **Q3. Chọn một cổ thư làm PRIMARY PROFILE?** — 增删卜易 (bốn/năm trạng thái, có 愈动) hay 黄金策/卜筮正宗 (动→散
  vô điều kiện)? Hai cái loại trừ nhau ở N4.
- **Q4. Nếu KHÔNG chọn một cổ thư:** Quân Sư ra **synthesis riêng tường minh** (và tuyên bố rõ là synthesis, không
  gán "cổ nhân đồng thuận")? Hiện spec đã là hybrid **ngầm** S1+S2 — cần hợp thức hóa hoặc sửa.
- **Q5. Nhật Tán ảnh hưởng FACT / STRENGTH / CONCLUSION thế nào?** (Nếu theo 增删卜易: 衰动→散 = mất lực/vô dụng →
  có thể vào `reduced`; 旺动→愈动 = tăng hiệu lực → KHÔNG giảm. Nếu theo 黄金策: 动→散 = "cát bất thành cát, hung
  bất thành hung" → hiệu ứng trung hòa kết quả, không thuần giảm lực.)
- **Q6. 易冒 primary:** có cần nạp 原文 《易冒·日冲》 để xác nhận hướng (hiện UNVERIFIED) trước khi khóa không?

## 14. Final Adjudication + Phase Boundary

### Trả lời 6 câu bắt buộc
1. **Mỗi nguồn nói gì:** §3/§4 (增删卜易: 静旺→暗动/静衰→日破/动旺→愈动/动衰→散 + 月建 ngoại lệ; 黄金策: 静→暗动/动→散
   vô điều kiện; 卜筮正宗: 动→散 + trục 空/不空; 易冒: chưa verbatim).
2. **Đồng thuận ở đâu:** **N1 (暗动), N3 (动衰→散), và N2 (日破)** — nhất trí giữa các nguồn primary xác thực.
3. **Xung đột ở đâu:** **N4 (动+旺+冲)** — 增删卜易 (愈动) ↔ 黄金策/卜筮正宗 (散). Xung đột trực tiếp, cả hai verbatim.
4. **Nguồn nào giải N4 tường minh:** **CÓ hai** — nhưng trái ngược (增删卜易=愈动; 黄金策=散). Không có nguồn "hòa giải".
5. **Profile nào tương thích spec hiện tại:** không cái nào FULLY; spec hiện là hybrid **CONFLICTING** nội tại (D).
   增删卜易 = COMPATIBLE-WITH-SPEC-CHANGE; 卜筮正宗 = PARTIALLY; 易冒 = INSUFFICIENT.
6. **Quyết định còn lại cho Thầy:** Q1–Q6 (§13).

### FINAL CLASSIFICATION
> **MULTIPLE VALID PROFILES — THẦY MUST SELECT.**

Căn cứ: hai profile cổ thư **xác thực verbatim** (增删卜易 và 黄金策/卜筮正宗) đều nội tại nhất quán và đều **giải N4
tường minh**, nhưng ra **kết quả loại trừ nhau** (愈动 ↔ 散). KHÔNG có "classical consensus" ở N4 (nên không chọn
*CLASSICAL CONSENSUS SUFFICIENT*); KHÔNG có một profile "rõ ràng vượt trội" bằng chứng (nên không chọn *ONE PRIMARY
PROFILE CLEARLY SUPPORTABLE*). Spec hiện tại vô tình đã synthesis (D), nhưng **mâu thuẫn nội tại** → nếu Thầy muốn giữ
hướng synthesis thì phải hợp thức hóa tường minh (*QUÂN SƯ SYNTHESIS REQUIRED* là lối ra hợp lệ **sau** khi Thầy chọn),
còn hiện tại điểm chặn là **lựa chọn của Thầy**, không phải thiếu bằng chứng.

### Evolution so với Phase 23B
Phase 23B = "REMAINS AMBIGUOUS" **vì chưa có cổ thư**. 23C nạp cổ thư → chuyển thành **xung đột trường phái xác định
được** ở đúng một ô (N4). Đây là tiến bộ: từ "không biết" → "biết chính xác chỗ hai trường phái rẽ nhánh".

### Phase Boundary
- **runtime changed: NO · methodology changed: NO · spec changed: NO · types changed: NO · HaoRelationType: NO ·
  tests changed: NO · Nhật Tán implemented: NO · Phase 24: NO · G5 reopened: NO.**
- **doc changed: YES** — chỉ file này.
- **Regression (thực chạy):** `npx vitest run src/lib/quan-su src/lib/serial-tien-golden.test.ts` →
  **297/297 PASS (20 files)** (Quan Su riêng 287/287). **KHÔNG dùng lại con số "311"** — suite hiện đếm 297; không
  file test nào bị sửa (Phase 23C chỉ thêm doc).
- Commit chỉ file Phase 23C. **KHÔNG push.**

---

### Sources (verbatim primary trừ khi ghi khác)
- 《增删卜易》日辰章 — https://www.quanxue.cn/qt_mingxiang/zengshanpy/zengshanpy19.html ; đối chiếu https://ly.yishihui.net/17685.htm
- 《黄金策·总断千金赋》 — https://www.quanxue.cn/qt_mingxiang/huangjin/huangjin01.html
- 《卜筮正宗》 — index https://ctext.org/wiki.pl?chapter=889452 (fetch chặn) ; 卷六 https://www.shidianguji.com/zh/book/HY0057/chapter/1lpdfpe5gs8wz (partial)
- 卜筮正宗 冲实/冲散 phân biệt (SECONDARY, không dùng primary) — https://www.sohu.com/a/924927281_122493870
- 《易冒》 (UNVERIFIED VERBATIM) — https://baike.baidu.com/item/易冒/9650000
