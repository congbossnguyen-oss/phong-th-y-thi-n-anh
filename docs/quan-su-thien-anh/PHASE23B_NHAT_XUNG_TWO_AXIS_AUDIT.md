# Phase 23B — Nhật Xung Two-Axis Audit

**Branch:** `quan-su-thien-anh` · **Nature:** AUDIT ONLY.
**runtime changed: NO · types changed: NO · HaoRelationType changed: NO · spec changed: NO · methodology changed: NO · tests changed: NO · Phase 24: NOT opened.**

Mục tiêu: xác định Nhật Xung có thể biểu diễn bằng **hai trục ngữ nghĩa độc lập** không —
Trục A (Tĩnh/Động → tên quan hệ) và Trục B (Vượng/Suy → lực). Không chọn model vì dễ code.

---

## 1. Checkpoint

- HEAD trước phase: `57e7881` (Phase 23 G6 Decision Brief). Phase 22A: `ad3bcbf`.
- Runtime unchanged; no Phase 24.
- Regression baseline kỳ vọng: **311/311 PASS** (Quan Su + Lục Hào). Kết quả chạy: xem §14.

## 2. Source Comparison

### 2.1. Nguồn sơ cấp có trong repo (primary, in-repo)
Bộ nguồn Lục Hào của dự án là **bản dịch/OCR tiếng Việt** (khai báo tại `LUAN_QUE_LUC_HAO_SPEC.md`
"Ghi chú nguồn"): Vương Hổ Ứng (~5 đầu sách), Nguyễn Huy Hoàng, Giả Bỉnh Nhiên (Tài Vận Bí Pháp),
Học Viện Minh Việt (Kinh Dịch Lục Hào Sơ Cấp). Chú thích engine `luc-hao.ts:411-414` trích **"Chương VI"**
— đây là chương trong **một bản biên dịch nội bộ** thuộc bộ trên, **không phải** văn bản cổ Hán ngữ gốc.

### 2.2. Nguồn cổ được yêu cầu so sánh (classical, requested) — **KHÔNG có trong repo**
`grep` toàn repo cho **增删卜易 (Tăng San Bốc Dịch) · 易冒 (Dịch Mạo) · 卜筮正宗 (Bốc Phệ Chính Tông)** và các
chương 日辰章 / 动散章 / 日冲章 / 动逢冲 trong ngữ cảnh Lục Hào = **0 kết quả**. (Các hit "增删卜易" chỉ nằm ở
module Đại Lục Nhâm `docs/daliuren/`, không liên quan.)

⇒ **Không thể** dựng bảng so sánh Task 1 / kết luận Task 2 từ **văn bản sơ cấp** của 3 bộ cổ thư này, vì
chúng không hiện diện trong repo. Guardrail dự án cấm: *"Do not treat modern commentary as primary evidence"*
+ cấm fabricate trích dẫn nguồn. Tái dựng nội dung 3 bộ này từ trí nhớ mô hình = **secondary/commentary**, KHÔNG
đủ tư cách primary → **cố ý bỏ trống**, phân loại **SOURCE UNAVAILABLE (DATA GAP)**.

### Task 1 — Source comparison table (chỉ điền nguồn có primary text)

| SOURCE | STATIC+VIGOROUS (Tĩnh+Vượng) | STATIC+WEAK (Tĩnh+Suy) | DYNAMIC+VIGOROUS (Động+Vượng) | DYNAMIC+WEAK (Động+Suy) | CLASSIFICATION AXIS | STRENGTH AXIS |
|---|---|---|---|---|---|---|
| **Repo primary — §99 / §158** | Ám Động | Nhật Phá | *không nêu riêng* (rơi vào "hào động → Nhật Tán") | Nhật Tán | dùng CẢ động/tĩnh LẪN vượng/suy để đặt **tên** | không tách rời khỏi tên |
| **Repo primary — Chương VI (luc-hao.ts:411-414)** | Ám Động | Nhật Phá | *không đề cập hào động* | *không đề cập hào động* | chỉ nói hào **TĨNH**; tách theo **vượng/suy** | vượng/suy quyết định tên (ám động vs nhật phá) |
| **增删卜易 日辰/动散章** | — | — | — | — | — | — |
| **易冒 日冲章** | — | — | — | — | — | — |
| **卜筮正宗 日冲/动逢冲** | — | — | — | — | — | — |
| (— = SOURCE UNAVAILABLE trong repo; KHÔNG suy đoán) | | | | | | |

### Task 2 — Mỗi nguồn dùng động/tĩnh vs vượng/suy thế nào

- **§99 / §158 (repo primary):** dùng **cả hai trục để đặt TÊN quan hệ** (không tách "tên" khỏi "lực"): tĩnh
  chia theo vượng/suy ra 2 tên (Ám Động / Nhật Phá); động ra 1 tên (Nhật Tán). ⇒ **không** là mô hình hai-trục
  sạch (vượng/suy KHÔNG chỉ làm "lực" — nó đổi cả tên ở hàng tĩnh). **Không** cho precedence tường minh.
- **Chương VI (repo primary):** **một-trục theo vượng/suy, chỉ cho hào TĨNH.** Không nói hào động ⇒ im lặng
  với N3/N4.
- **增删卜易 / 易冒 / 卜筮正宗:** **SOURCE UNAVAILABLE** — không kết luận (không có primary text trong repo).

## 3. Quân Sư Spec Audit (Task 3)

Toàn bộ đoạn Nhật xung / Ám Động / Nhật Phá / Nhật Tán đã rà (verbatim ở Phase 23 / G6 Brief):

- **§99:** "hào vượng bị Nhật xung = ám động (lợi); hào hưu tù tĩnh bị Nhật xung = Nhật phá (hại); hào đang
  động bị Nhật xung = Nhật tán (hại)."
- **§158:** như trên + "Nhật tán (hại, mất tác dụng động)."
- **Chương VI (luc-hao.ts:411-414):** "Tĩnh hào vượng tướng… ám động; tĩnh hào bị hưu tù… nhật phá." (chỉ TĨNH)

**Cấu trúc luận lý của chính spec:**
- Hàng **tĩnh**: tách theo vượng/suy → **2 tên** (Ám Động / Nhật Phá).
- Hàng **động**: **1 tên** duy nhất (Nhật Tán), **không** tách theo vượng/suy.
- ⇒ hai hàng **bất đối xứng**: tĩnh chia đôi theo lực, động không chia. Nếu động/tĩnh là "trục phân loại" và
  vượng/suy là "trục lực" tách bạch, thì hàng động PHẢI cũng chia theo lực — nhưng spec không chia.

**Kết luận Task 3:** spec hiện tại **KHÔNG** ngụ ý (A) một-trục sạch, **KHÔNG** ngụ ý (B) hai-trục sạch →
**(C) UNRESOLVED AMBIGUITY.** Lý do: vượng/suy đổi TÊN ở hàng tĩnh (chống lại B), nhưng động cũng đổi tên
độc lập với lực (chống lại A). Không rewrite spec.

## 4. N1–N4 Matrix

| Case | Điều kiện | Source premise | Engine result | Spec result | Conflict |
|---|---|---|---|---|---|
| **N1** | Tĩnh + Vượng | §99/§158/Chương VI đồng thuận | `Ám Động` | `Ám Động` | Không |
| **N2** | Tĩnh + Hưu-tù | §99/§158/Chương VI đồng thuận | `Nhật Phá` | `Nhật Phá` | Không |
| **N3** | Động + Hưu-tù | §99/§158: `Nhật Tán`; Chương VI im lặng | `Nhật Phá` (không thấy `isDong`) | `Nhật Tán` | **CÓ** — nhãn engine ≠ spec |
| **N4** | Động + Vượng | §99/§158 chồng lấn (vượng→ám động **và** động→nhật tán); Chương VI im lặng | `Ám Động` | *không xác định* | **CÓ** — spec tự mâu thuẫn |

## 5. Classification Axis (Trục A — Tĩnh/Động)

- **Bằng chứng ủng hộ A là trục phân loại:** tên "Nhật Tán" chỉ gắn với **động**; "Nhật Phá" gắn với **tĩnh**
  hưu-tù. Ở mức này động/tĩnh CÓ phân biệt tên.
- **Bằng chứng chống:** trong hàng **tĩnh**, tên vẫn đổi (Ám Động vs Nhật Phá) theo **vượng/suy** — tức trục A
  **một mình không đủ** để định tên. Và hàng **động** chỉ có 1 tên bất kể lực → trục A ở hàng động lại "nuốt"
  luôn vai trò của lực.
- ⇒ Trục A **không** là trục phân loại thuần: nó chia sẻ vai trò đặt-tên với vượng/suy một cách bất đối xứng.

## 6. Strength Axis (Trục B — Vượng/Suy)

- **Bằng chứng ủng hộ B là trục lực:** §99 gắn "vượng → lợi", "suy → hại" — đúng ngữ nghĩa lực/hiệu quả.
- **Bằng chứng chống (B chỉ là lực):** ở hàng tĩnh, vượng/suy **đổi luôn TÊN quan hệ** (Ám Động ≠ Nhật Phá),
  không chỉ đổi cường độ. Ở hàng động, vượng/suy **biến mất** khỏi công thức (chỉ còn Nhật Tán).
- ⇒ Trục B **không** thuần "lực": có lúc nó quyết định tên (tĩnh), có lúc bị bỏ qua (động). Không nhất quán.

## 7. N3 — Động + Suy (Task 5)

"Nhật Tán" ở N3 là gì?
- **classification?** một phần — nó là 1 tên riêng, phân biệt với Nhật Phá theo trục động/tĩnh.
- **force/state?** một phần — §158 mô tả hệ quả "hại, **mất tác dụng động**" (nói về trạng thái/hiệu lực).
- **interpretation?** không — spec ghi thẳng thành nhãn, không phải diễn giải mở.
- **Kết luận N3:** "Nhật Tán" **trộn lẫn cả classification lẫn state** trong 1 nhãn; spec không tách hai vai
  trò đó ra. Về mặt engine, N3 là **METHODOLOGY GAP có thể sửa deterministic** (nhãn sai `Nhật Phá` do thiếu
  `isDong`) **một khi** N4 được khóa — bản thân N3 không mơ hồ, chỉ thiếu đường dữ liệu + tên quan hệ.

## 8. N4 — Động + Vượng (Task 4)

Một hào vừa vượng vừa động thỏa CẢ HAI tiền đề §99/§158 → hai kết quả trái chiều (Ám Động lợi vs Nhật Tán
hại). Test 4 giả thuyết (audit-only, **không chọn winner**):

### H1 — Động/Tĩnh = classification; Vượng/Suy = force
- **Ủng hộ:** "Nhật Tán" chỉ ở động; vượng gắn "lợi", suy gắn "hại".
- **Chống:** hàng **tĩnh** đổi TÊN theo vượng/suy (Ám Động vs Nhật Phá) → vượng/suy KHÔNG chỉ là lực. Hàng
  **động** không đổi tên theo lực → bất đối xứng với H1.
- **Nguồn:** §99/§158/Chương VI (repo). Cổ thư: UNAVAILABLE.
- **Confidence:** THẤP. **Adopt được mà không chế methodology?** KHÔNG — phải tự giả định "ở động thì vượng/suy
  chỉ chỉnh lực, không đổi tên", điều spec không nói (spec cho động **một** tên Nhật Tán bất kể lực).

### H2 — Vượng/Suy = classification; Động/Tĩnh = secondary state
- **Ủng hộ:** vượng→Ám Động, suy→Nhật Phá (ở tĩnh) đúng là phân loại theo lực.
- **Chống:** ở động, tên là Nhật Tán — **không** suy ra từ vượng/suy (vượng+động vẫn "Nhật Tán (hại)" theo mặt
  chữ §99), phá vỡ "vượng/suy quyết định tên".
- **Nguồn:** §99/§158. Cổ thư: UNAVAILABLE.
- **Confidence:** THẤP. **Adopt?** KHÔNG — mâu thuẫn với chữ "hào đang động… nhật tán".

### H3 — Cả hai cùng quyết 1 quan hệ loại-trừ-lẫn-nhau (mutually exclusive final)
- **Ủng hộ:** N1/N2/N3 mỗi ô ra đúng 1 tên → giống bảng 2×2 loại trừ.
- **Chống:** ô N4 của bảng 2×2 **trống/chồng lấn** — spec đưa 2 tên cho cùng 1 ô, không cho luật chọn.
- **Nguồn:** §99/§158. Cổ thư: UNAVAILABLE.
- **Confidence:** THẤP–TRUNG (mô hình bảng khớp N1-N3 nhưng gãy ở N4).
- **Adopt?** KHÔNG cho N4 — phải tự phát minh luật ưu tiên để lấp ô trống.

### H4 — Không model nào được evidence hiện tại ủng hộ
- **Ủng hộ:** bất đối xứng tĩnh(2 tên)/động(1 tên) + ô N4 chồng lấn + cổ thư vắng mặt → không mô hình nào khép
  kín trên chứng cứ repo.
- **Chống:** N1-N3 vẫn nhất quán, nên "hoàn toàn vô mô hình" hơi mạnh.
- **Nguồn:** §99/§158/Chương VI (repo).
- **Confidence:** TRUNG–CAO cho phạm vi N4.
- **Adopt?** N/A (đây là phát biểu "chưa đủ để khóa", tự nó không phải methodology cần adopt).

## 9. Nhật Phá vs Nhật Tán (Task 6)

Hai nhãn là gì đối với nhau?
- **mutually exclusive classifications?** Theo spec: phân bổ theo **động/tĩnh** (Phá←tĩnh hưu-tù; Tán←động) ⇒
  ở mức mô tả, chúng loại trừ theo trục động/tĩnh. NHƯNG spec **không** khẳng định 1 hào không thể mang cả hai.
- **simultaneous facts?** Không có chứng cứ khẳng định (spec không mô tả ca đồng thời).
- **different layers?** Có dấu hiệu: Nhật Phá thiên về "tĩnh bị phá"; Nhật Tán thêm ý "mất tác dụng ĐỘNG"
  (một tầng nói về trạng thái động). Nhưng spec không tuyên bố tách tầng.
- **Kết luận Task 6:** **UNRESOLVED.** Bằng chứng repo chỉ đủ nói chúng **phân bổ theo động/tĩnh**; chưa đủ để
  khẳng định "loại trừ tuyệt đối" hay "khác tầng". Cổ thư (có thể phân xử) UNAVAILABLE.

## 10. Two-Axis Hypothesis Test (tổng hợp §5-§9)

- Mô hình hai-trục **sạch** (A=tên, B=lực) bị **chính nhãn của spec bác bỏ**: vượng/suy đổi TÊN ở hàng tĩnh,
  và biến mất ở hàng động. Đây là bất đối xứng cấu trúc, không phải hai trục trực giao.
- Không nguồn primary nào trong repo cho **precedence** ở N4; 3 cổ thư có thể chứa lời giải đều UNAVAILABLE.
- ⇒ Hai-trục **không** được chứng cứ hiện tại khóa; một-trục cũng không (vì có Nhật Tán riêng cho động).

## 11. G5 Interaction (Task 7)

- **G5** = precedence khi **nhiều cơ chế adverse khác loại** cùng tác động 1 hào (Phá + Hồi Đầu Khắc + Hóa
  Tuyệt/Mộ…), giải quyết ở tầng **STRENGTH** — mà `canLucHao` né bằng thiết kế **đa-trục** (không collapse).
- **Vấn đề N4** khác bản chất: đây là **chọn 1 trong 2 NHÃN quan hệ** trong **cùng một** cơ chế (Nhật xung), ở
  tầng **FACT/label**, không phải collapse nhiều cơ chế lực. Thiết kế đa-trục của `canLucHao` **không** tự giải
  được vì nó là lựa chọn tên FACT, không phải phép hợp lực.
- **Kết luận Task 7:** G5 **KHÔNG trực tiếp liên quan** — Nhật xung **không** đòi cơ chế precedence kiểu G5.
  N4 cần **một quyết định nguồn về nhãn**, không cần "precedence engine". **KHÔNG mở lại G5.**

## 12. Final Finding

**METHODOLOGY REMAINS AMBIGUOUS.**

Căn cứ: (1) 3 cổ thư được yêu cầu (增删卜易 / 易冒 / 卜筮正宗) **không có primary text trong repo** →
không thể xác nhận/bác two-axis từ nguồn gốc; (2) nguồn primary có trong repo (§99/§158/Chương VI) **tự bất
đối xứng** — vượng/suy đổi tên ở hàng tĩnh nhưng bị bỏ ở hàng động, và ô N4 chồng lấn → **không** ủng hộ
two-axis sạch, cũng **không** ủng hộ single-axis sạch. Không đủ để nâng lên "PLAUSIBLE BUT NOT LOCKED" vì
chính nhãn nội tại mâu thuẫn với mô hình hai-trục, không chỉ là "thiếu xác nhận".

## 13. Decision Required From Thầy (chỉ câu còn thực sự treo)

- **Q1.** N4 (Động + Vượng + Nhật xung) = **Ám Động** / **Nhật Tán** / **cả hai** (2 FACT song song)?
- **Q2.** Nếu một kết quả thắng: **trục nào thắng** — động-tĩnh hay vượng-suy?
- **Q3.** "Nhật Tán" là **`HaoRelationType` độc lập**, hay là biến thể/ghi chú của Nhật Phá cho hào động?
- **Q4.** Nhật Tán có **ảnh hưởng strength** không (vào `reduced`, hay FACT-only)?
- **Q5.** Nhật Tán ảnh hưởng **conclusion** hay chỉ **FACT/ROLE**?
- **Q6 (mới, từ Task 6).** Nhật Phá và Nhật Tán là **loại trừ tuyệt đối** hay có thể **đồng thời / khác tầng**?
- **Q7 (điều kiện nguồn).** Nếu cần phân xử, Thầy dùng bản **cổ thư nào** làm primary (增删卜易 / 易冒 /
  卜筮正宗)? — hiện KHÔNG có trong repo; cần nạp text mới audit tiếp được.

## 14. Phase Boundary

- **runtime changed: NO** · **methodology changed: NO** · **spec changed: NO** · **types changed: NO** ·
  **HaoRelationType changed: NO** · **tests changed: NO** · **Nhật Tán implemented: NO** · **Phase 24: NO** ·
  **G5 reopened: NO** · **precedence invented: NO**.
- **doc changed: YES** — chỉ file này.
- **Regression (thực chạy):** `npx vitest run src/lib/quan-su src/lib/serial-tien-golden.test.ts` →
  **297/297 PASS (20 files)**. Quan Su suite riêng = 287/287 (18 files).
  - **Ghi chú baseline:** nhãn "311" ở các phase trước là con số ghi tại thời điểm Phase 20/22A; bộ test hiện
    tại đếm được **297** trên các file Lục Hào/Quan Su định vị được (không file test quan-su/luc-hao nào bị sửa
    trong working tree — `git status` chỉ có `.astro` của luồng khác). Phase 23B **không đụng code/test** nên
    con số này không đổi bởi phase này; chênh lệch so với "311" là do phạm vi đếm/biến động file test từ trước,
    KHÔNG do Phase 23B.
- Commit chỉ file Phase 23B. **KHÔNG push.**
