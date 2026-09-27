# Phase 26G — Reduced Architecture Deep Audit (DQ1–DQ6)

**Branch:** `quan-su-thien-anh` · **Nature:** AUDIT ONLY. KHÔNG sửa runtime/refactor/methodology/spec/tests/ky-nguyen,
KHÔNG chọn Model, KHÔNG owner-decision, KHÔNG Phase 27, KHÔNG push. Chỉ thêm 1 doc. Probe tạm đã xóa. Không đụng
western-astrology WIP.

---

## 1. Scope
Điều tra sâu 6 DQ mở của Phase 26F trước khi owner khóa architecture `reduced`. Checkpoint `07d776c`, regression 318/318.
**Đóng góp mới quan trọng:** probe **đa-quẻ (64 hexagram)** + **replicate Hóa Mộ đúng finalizeCast** → sửa coverage gap
của 26F.

## 2. DQ1 — Reduced Source Metadata (`reducedBy`)
- **Thông tin mất hiện tại:** khi ≥1 producer set `reduced=true`, `reduced` là **boolean đơn** → mất (a) **producer nào**,
  (b) **bao nhiêu** producer, (c) **họ ngữ nghĩa** (quan hệ Phá vs hóa-biến).
- **Consumer có cần biết producer không?** Hiện **KHÔNG**: `availabilityOf` chỉ đọc `reduced` (boolean) → LIMITED; các
  reason-string (ky-nguyen:104, ket-luan:135) tự suy lại từ cs.reduced/restrained (thô). **Không** consumer nào rẽ nhánh
  theo producer.
- **Hai producer đồng thời khác ngữ nghĩa không?** CÓ về bản chất (vd Nguyệt Phá + Hóa Tuyệt = 2 cơ chế khác) NHƯNG hiện
  cùng cho 1 LIMITED → khác biệt **không** được dùng.
- **Thêm metadata mà KHÔNG đổi behavior?** CÓ — thêm `reducedBy: string[]` (mô tả) song song boolean, availabilityOf vẫn
  đọc boolean → verdict không đổi. Chỉ làm giàu prompt/debug/provenance.
- **Metadata đủ hay cần severity/state?** Metadata **đủ** cho truy vết/giải thích; severity/state là câu hỏi RIÊNG (DQ2).
- **Ví dụ runtime:** hào vừa `nguyetPha` vừa `hoaTuyet` → hiện `reduced=true` (mất "vì sao"); với `reducedBy` sẽ ghi
  `["nguyetPha","hoaTuyet"]`.
- **Kết luận DQ1: USEFUL BUT OPTIONAL** (làm giàu truy vết/prompt; KHÔNG cần cho behavior hiện tại; KHÔNG required).

## 3. DQ2 — Severity / Precedence (`reduced + restrained + Suy → LIMITED`)
- **Coexist thực tế:** rất phổ biến (probe: đa số ca "redundant" chính là reduced trùng Suy). `availabilityOf` (ky-nguyen:81)
  gộp `reduced || restrained` → LIMITED, và `Suy` (nhánh cuối) → LIMITED — **cùng rank 3**, **không cộng dồn** (1 nguồn =
  5 nguồn), **không** nguồn nào override nguồn khác.
- **Có nên accumulate / có dominance?** — **AMBIGUOUS**: không có nguồn primary cho "cộng dồn mức phá" hay "thứ tự áp đảo".
- **Source identity đổi protection logic?** Hiện KHÔNG (mọi nguồn → cùng LIMITED). Về lý, "níu chân" (restrained, còn lực,
  có thể giải bằng xung khai hợp — timing) KHÁC "phá" (giảm lực) KHÁC "Suy" (yếu nền) → LIMITED che khác biệt này.
- **Producer nào có evidence mạnh/yếu hơn?** — chỉ có **1 precedent** định tính: lâm-Nguyệt "日冲而不散" (đắc lệnh mạnh →
  không phá). Ngoài ra **không** có thang mức độ trong nguồn.
- Phân loại: **FACT** = các nguồn tồn tại; **EFFECT** = "giảm lực/hạn chế" (định tính, có nguồn cho Phá); **METHODOLOGY**
  = gộp thành LIMITED (design chain); **AMBIGUOUS** = severity/precedence/accumulation.
- **Kết luận DQ2:** có **material semantic loss** (source+severity+"níu chân vs phá vs suy") NHƯNG chain hiện tại **chỉ
  cần** tín hiệu thô "phát huy đầy đủ?" nên LIMITED đủ dùng; nâng granularity = tùy chọn tương lai, **thiếu nguồn** cho
  severity rule (KHÔNG tự chế).

## 4. DQ3 — chamDiem ↔ Deterministic Chain (call graph + double-count)
- **Call graph:** `buildAdvisoryReport` gọi CẢ HAI:
  1. `chamDiem` → `cham.diem` (+ `timingBlocker`) → `suyKetLuan(diem)` → **`ketLuan`/`ketLuanLabel`/`mucDoThuan`** (verdict
     chính, thang điểm: ≥72 NÊN, <42 KHÔNG NÊN, 42-71 CÓ ĐIỀU KIỆN/NÊN CHỜ).
  2. `ketLuanSuViec` (deterministic chain, canLucHao→ky-nguyen-dung) → **`report.ketLuanSuViec`** (verdict thứ 2).
- **Cả hai feed verdict?** CÓ — cả `mucDoThuan/ketLuan` (chamDiem) LẪN `ketLuanSuViec` đều nằm trong report + surface prompt.
  ⇒ **hai hệ verdict song song**.
- **Cùng điều kiện cổ điển đếm 2 lần?** CÓ với **Nguyệt Phá / Nhật Phá**:
  - chamDiem: `add("Nguyệt Phá", -14)` / `add("Nhật Phá", -10)` **và** set `timingBlocker=true` (adv:294-295) → hạ diem +
    ép NÊN CHỜ.
  - chain: cùng Nguyệt/Nhật Phá → `reduced` → LIMITED → giảm kyPressure/nguyenSupport → dungProtection → ketLuanSuViec.
  ⇒ **cùng 1 Phá tác động 2 hệ** (thậm chí 2 sub-kênh trong chamDiem: diem + timingBlocker).
- **chamDiem advisory hay verdict-bearing?** **Verdict-bearing** (nó tạo `ketLuan` chính qua suyKetLuan).
- **Chain có tái tạo cùng hiệu ứng?** Một phần — cả hai đều phạt Phá, nhưng **khác cơ chế** (điểm số vs protection-state).
- **Bỏ 1 kênh có đổi behavior?** CÓ (mỗi kênh cho 1 verdict output riêng trong report).
- **Phân loại DQ3: B — GENUINE DOUBLE-COUNT** cho Nguyệt/Nhật Phá (đồng thời cũng là **A — intentional multi-axis** vì 2
  hệ vốn thiết kế song song). ⇒ **cần methodology decision**: giữ 2 hệ (chấp nhận double-representation) hay hợp nhất/loại
  `chamDiem` legacy. (tuePha/hóa-biến KHÔNG bị double vì chamDiem không đọc.)

## 5. DQ4 — hoiDauKhac (multi-hexagram, sửa 26F)
- **Định nghĩa:** biến khắc gốc (`nguHanhTac(bienNH, selfNH) === "a-khac-b"`), can-luc-hao:287. Chỉ hào động + có biến.
- **26F (Thuần Càn):** 0 load-bearing → **nghi ngờ sample artifact**. **26G probe đa-quẻ (64 hexagram, flip từng hào):**
  | | reachable | sole-source | **load-bearing** |
  |---|---|---|---|
  | hoiDauKhac | 704 | 472 | **224** |
  - Ví dụ: hex0 pos5 (Hợi), day=Dần month=Dần, base=Trung Hòa → LIMITED→AVAILABLE nếu bỏ.
- **Kết luận DQ4: hoiDauKhac LÀ LOAD-BEARING** (224 ca). **26F "redundant" là ARTIFACT của quẻ Thuần Càn** (bị Hóa Thoái/
  base-Suy chi phối). **CORRECTED.** KHÔNG gỡ. (Bài học 26B tái khẳng định: luôn probe đa-quẻ.)

## 6. DQ5 — hoaXung / hoaMo / hoaTuyet (coverage)
Điều kiện sinh (can-luc-hao): `hoaXung = bien.chi === chiXungVoi(self.chi)`; `hoaTuyet = bien.chi === Tuyệt(selfNH)`;
`hoaMo = hasRel(self,"Nhập Mộ","CHANGED_YAO")` — **quan hệ này do `finalizeCast` thêm (line 811-819), KHÔNG có trong
`lapQueDayDu`** (comment engine xác nhận). ⇒ **26F (lapQueDayDu-only) KHÔNG THỂ sinh hoaMo** — 0 samples là **harness gap**,
KHÔNG phải unreachable.

**26G probe đa-quẻ (replicate Hóa Mộ đúng finalizeCast bằng `chiTaiGiaiDoanTruongSinh(selfNH,"Mộ")`):**
| Producer | reachable? | reachable | sole | **load-bearing** | verdict impact | representation | provenance |
|---|---|---|---|---|---|---|---|
| hoaMo | **CÓ** | 192 | 120 | **64** (vd hex3 pos3 Sửu base=Vượng → LIMITED→STRONG) | CÓ (Kỵ/Nguyên) | reduced + transformationState(inert) + burialState(inert) + CHANGED_YAO relation | **C/E** engine (Nhập Mộ 4 dạng) |
| hoaTuyet | **CÓ** | 384 | 232 | **144** (vd hex0 pos6 Dậu → LIMITED→AVAILABLE) | CÓ | reduced + transformationState(inert) | **C/E** |
| hoaXung | **CHƯA thấy** | **0** | 0 | 0 | ? | reduced + transformationState(inert) | **C/E** |
- **hoaMo, hoaTuyet: reachable + LOAD-BEARING** (sửa coverage gap 26F). KHÔNG gỡ.
- **hoaXung: reachable=0** kể cả 64 quẻ × flip-1-hào → **DATA GAP**. Nguyên nhân giả định: biến 1-line-flip của 1 hào
  hiếm/không cho ra đúng chi-xung của chính hào đó. **Chưa probe đa-động** (nhiều hào động cùng lúc) → KHÔNG kết luận
  unreachable. **Đánh dấu DATA GAP** (cần corpus quẻ thật / đa-động để xác định). KHÔNG fabricate case, KHÔNG gỡ.

## 7. DQ6 — transformationState / burialState
- **Sản xuất:** `transformationState` = {hoaHop, hoiDauSinh, hoaTien, hoiDauKhac, hoaXung, hoaMo, hoaTuyet, hoaThoai}
  (can-luc-hao return); `burialState` = {nhapMo, hoaMo}.
- **Tiêu thụ:** **transformationState = KHÔNG consumer** (grep rỗng). **burialState = KHÔNG consumer** (grep rỗng). ⇒ **cả
  hai INERT** (chỉ serialize prompt như FACT).
- **Cùng điều kiện biểu diễn nhiều nơi?** CÓ:
  - hóa-biến (hoiDauKhac/hoaXung/hoaMo/hoaTuyet): ở `transformationState` (inert) **và** gộp vào `reduced` (active).
  - hoaMo: ở `transformationState.hoaMo` + `burialState.hoaMo` + CHANGED_YAO relation (nguồn) → **3 bản** (2 inert).
  - Nhập Mộ tĩnh: `burialState.nhapMo` (inert) nhưng effect đi qua `currentState.hidden` (active — ket-luan/ky-nguyen/ung-ky).
- **Duplication đổi behavior?** KHÔNG (bản sao inert) → **representational only**, KHÔNG double-count hiện tại. **Latent
  risk**: nếu tương lai đọc transformationState/burialState cho verdict → sẽ double-count với reduced/hidden.
- **Tương lai có cần giữ?** transformationState/burialState hiện chỉ để hiển thị FACT; nếu muốn giữ chi tiết hóa-biến cho
  prompt thì giữ, nhưng nên **1 nguồn sự thật** (tránh 3 bản hoaMo).
- **Evidence để xóa?** Không có evidence bắt buộc; là quyết định dọn dẹp (owner), KHÔNG cấp bách. KHÔNG xóa ở audit này.

## 8. Cross-Cutting Findings
1. **Tất cả producer ĐO ĐƯỢC đều LOAD-BEARING:** nguyetPha(484), nhatPha(132), tuePha(614), hoiDauKhac(224), hoaMo(64),
   hoaTuyet(144). **KHÔNG producer nào an toàn để gỡ.** hoaXung = DATA GAP (chưa đo).
2. **26F "hoiDauKhac redundant" đã bị BÁC** (artifact Thuần Càn) — tái khẳng định bài học 26B: probe 1-quẻ KHÔNG đủ.
3. **Double-count thật** chỉ ở Nguyệt/Nhật Phá (chamDiem điểm+timingBlocker **và** chain reduced). tuePha/hóa-biến chỉ 1
   kênh (reduced).
4. **Inert copies:** transformationState + burialState (no consumer) → latent risk, chưa hại.
5. **availabilityOf** gộp reduced+restrained+Suy → LIMITED (mất source/severity, không cộng dồn) — thiếu nguồn cho severity.
6. **Hai hệ verdict** (chamDiem verdict-bearing + ketLuanSuViec) cùng tồn tại — câu hỏi kiến trúc lớn nhất còn mở.

## 9. Provenance Matrix
| Producer / cấu trúc | A FACT | B EFFECT | C methodology | D DATA GAP | E unverified |
|---|---|---|---|---|---|
| nguyetPha | Chương VI (bản dịch) | "phá" định tính | — | — | (translated) |
| nhatPha | 增删卜易 (25C) | 愈加无用 | Model A độc lập (26D) | — | — |
| tuePha | — | — | **lock 10A** | 0/153 án lệ | không cổ thư |
| hoiDauKhac | base Ch.VII | định tính | engine rule | multi-quẻ mới đo (26G) | verbatim chưa verify |
| hoaMo | base (Nhập Mộ) | định tính | engine rule | — (đã đo 26G) | verbatim chưa verify |
| hoaTuyet | base | định tính | engine rule | — (đã đo 26G) | verbatim chưa verify |
| hoaXung | base | định tính | engine rule | **DATA GAP (0 mẫu)** | verbatim chưa verify |
| chamDiem điểm số | — | — | **Quân Sư legacy scoring** (không cổ thư) | — | heuristic nội bộ |
| transformationState/burialState | — | — | biểu diễn (inert) | — | — |
*(KHÔNG biến C thành trích dẫn cổ. tuePha & chamDiem-score đều là methodology/heuristic nội bộ, không primary.)*

## 10. Architecture Implications (KHÔNG chọn model)
- Vì **mọi producer đo được đều load-bearing**, mọi phương án "gỡ bớt producer" đều **đổi verdict** → không phải no-op.
- Cải thiện an toàn nhất (nếu owner muốn) là **không đổi hành vi**: thêm metadata (DQ1) — làm giàu truy vết, giữ verdict.
- Thay đổi có-đổi-verdict (severity DQ2, gỡ double-count DQ3, dọn inert DQ6) đều cần **owner decision + nguồn** và test-first.
- hoaXung DATA GAP cần đóng (probe đa-động / corpus thật) TRƯỚC khi bất kỳ quyết định nào đụng hóa-biến.

## 11. Open Owner Decisions
- **OD1 (DQ1):** thêm `reducedBy` metadata (USEFUL BUT OPTIONAL, no-behavior-change) — làm hay không?
- **OD2 (DQ2):** có cần severity/precedence/accumulation ở availabilityOf không? (thiếu nguồn → nếu làm là methodology mới)
- **OD3 (DQ3):** xử lý double-count Nguyệt/Nhật Phá giữa **chamDiem** (verdict-bearing legacy) và **chain** — giữ song song
  (multi-axis có chủ đích) hay hợp nhất/loại chamDiem? ← **câu hỏi lớn nhất**.
- **OD4 (DQ5):** đóng DATA GAP hoaXung (probe đa-động/corpus) trước khi quyết reduced cho hóa-biến?
- **OD5 (DQ6):** dọn inert transformationState/burialState (đặc biệt 3 bản hoaMo) về 1 nguồn sự thật?
- (Nhật Phá 26D / Tuế Phá 10A / movementEfficacy 25I: **KHÔNG mở lại**.)

## 12. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · scoring/conclusion/ky-nguyen-dung/availabilityOf: NO.** doc: YES (file này).
- Regression: **318/318 PASS** (audit thuần; 4 probe tạm đã xóa).
- Commit chỉ doc này. **KHÔNG push.** STOP (không mở Phase 26H).
