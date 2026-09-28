# Phase 26F — Reduced Producer Matrix & Semantic Decomposition Audit

**Branch:** `quan-su-thien-anh` · **Nature:** AUDIT + DECISION GATE. KHÔNG sửa runtime/refactor/methodology/spec/tests,
KHÔNG tự chọn architecture, KHÔNG push, KHÔNG đụng western-astrology WIP. Probe tạm đã xóa. KHÔNG mở lại Nhật Phá
Model A / Phase 25 movementEfficacy / Tuế Phá lock 10A.

---

## 1. Scope & Producer Inventory (exhaustive — code thật)
`reduced` tạo **1 nơi** (`can-luc-hao.ts:298`), KHÔNG mutation nơi khác (grep xác nhận):
```ts
const reduced = nguyetPha || nhatPha || tuePha || hoiDauKhac || hoaXung || hoaMo || hoaTuyet;
```
**7 producer** (đã kiểm không sót):

| # | Producer | Source condition (code) | Semantic | Loại |
|---|---|---|---|---|
| 1 | `nguyetPha` | `hasRel("Nguyệt Phá")` = Nguyệt kiến xung hào | Phá theo Tháng | quan hệ |
| 2 | `nhatPha` | `hasRel("Nhật Phá")` = Nhật xung + tĩnh + month hưu/tù (N2) | Phá theo Ngày (tĩnh-suy) | quan hệ |
| 3 | `tuePha` | `chiHào === chiXungVoi(chiNăm)` (can-luc-hao:254) | Phá theo Năm (歲破) | quan hệ (Năm) |
| 4 | `hoiDauKhac` | biến khắc gốc (`nguHanhTac(bienNH,selfNH)==="a-khac-b"`) | Hồi Đầu Khắc | hóa-biến |
| 5 | `hoaXung` | `bien.chiIndex === chiXungVoi(self.chiIndex)` | Hóa Xung | hóa-biến |
| 6 | `hoaMo` | `hasRel("Nhập Mộ","CHANGED_YAO")` | Hóa Mộ | hóa-biến |
| 7 | `hoaTuyet` | `bien.chiIndex === Tuyệt(self.nguHanh)` | Hóa Tuyệt | hóa-biến |

## 2. Downstream Trace
```
producer → reduced (can-luc-hao:298)
  → availabilityOf (ky-nguyen-dung:81): reduced||restrained → "LIMITED" (short-circuit TRƯỚC nhánh Vượng/effective)
  → interactionOf.effective → maxEffective → kyPressure / nguyenSupport → dungProtection
  → protectionFrom → concludeDung → VERDICT     [chỉ khi hào là SOURCE = Kỵ/Nguyên]
Dụng-tự-reduced: strengthFrom = effective-only → INERT (Dụng không là chain source)
```
- Tất cả 7 producer đi CHUNG một kênh `reduced → availabilityOf`. Không producer nào có kênh reduced riêng.
- `reduced` KHÔNG đổi `baseForce`/`effective` (chỉ nguyetPha/nhatPha/tuePha ở temporalState; hóa-biến ở
  transformationState — đều KHÔNG hạ effective; effective chỉ đổi bởi Tiến/Thoái/Hồi-Đầu-Sinh).

## 3. Empirical Matrix (probe sole-source, đã xóa)
Đo mỗi producer khi là **nguồn reduced DUY NHẤT**; đếm ca đổi availability nếu bỏ producer đó khỏi reduced.
Quét: tĩnh (day×month×year 12³ × 6 hào) cho producer quan hệ; động+biến (flip từng hào × day×month×year) cho hóa-biến.

| Producer | total | redundant | **load-bearing** | →AVAILABLE | →STRONG | Coverage |
|---|---|---|---|---|---|---|
| nguyetPha | 1408 | 924 | **484 (34%)** | 165 | 319 | tốt |
| nhatPha | 418 | 286 | **132 (32%)** | 110 | 22 | tốt |
| tuePha | 1414 | 800 | **614 (43%)** | 222 | 392 | tốt |
| hoiDauKhac | 1452 | 1452 | **0 (0%)** | 0 | 0 | tốt (100% redundant trong mẫu) |
| hoaXung | **0** | — | — | — | — | **KHÔNG COVERAGE** (0 mẫu sole-source từ flip Thuần Càn) |
| hoaMo | **0** | — | — | — | — | **KHÔNG COVERAGE** |
| hoaTuyet | **0** | — | — | — | — | **KHÔNG COVERAGE** |

**Đọc kết quả:**
- **nguyetPha / nhatPha / tuePha = LOAD-BEARING** (32–43% ca đổi availability, gồm nhiều LIMITED→STRONG khi base=Vượng).
  Không thể gỡ trơn.
- **hoiDauKhac = 100% REDUNDANT trong mẫu** — mọi ca sole-source, availability không đổi khi bỏ (hào đã Suy/Thoái →
  LIMITED sẵn). *Caveat:* mẫu Thuần Càn; cần quét quẻ khác để tổng quát. Cơ chế "reduced-không-đổi-effective" về lý CÓ
  THỂ load-bearing, nhưng **thực nghiệm chưa thấy** (nhiều flip → Hóa Thoái → effective Suy → redundant).
- **hoaXung / hoaMo / hoaTuyet = KHÔNG đo được** (flip Thuần Càn không sinh 3 quan hệ này ở dạng sole-source). **Coverage
  gap trung thực** — KHÔNG kết luận redundant/load-bearing; cần bộ quẻ khác (Phase sau nếu owner cần).

*(Con số theo Thuần Càn + không gian quét đã nêu; là bằng chứng đủ để phân loại, KHÔNG tuyên bố exhaustive toàn 64 quẻ.)*

## 4. Redundancy Analysis
- **Load-bearing (không gỡ được):** nguyetPha, nhatPha, tuePha.
- **Redundant trong mẫu:** hoiDauKhac (0 load-bearing) — nhưng do đồng xuất hiện Hóa Thoái/base-Suy, KHÔNG chắc do bản
  chất; giữ thận trọng.
- **Chưa xác định:** hoaXung, hoaMo, hoaTuyet (coverage gap).

## 5. Double-Count Analysis
| Producer | reduced (chain) | chamDiem (legacy score) | movementEfficacy | transformationState | burialState | Double-channel? |
|---|---|---|---|---|---|---|
| nguyetPha | ✓ | ✓ (−14, adv:294) | — | — | — | **CÓ** (chain + score) |
| nhatPha | ✓ | ✓ (−10, adv:295) | ✓ BROKEN_STATIC (FACT) | — | — | **CÓ** (chain + score; + FACT efficacy) |
| tuePha | ✓ | ✗ | ✗ | — | — | KHÔNG (single-channel) |
| hoiDauKhac | ✓ | ✗ | — | ✓ (inert) | — | biểu diễn 2 lần (1 inert) |
| hoaXung | ✓ | ✗ | — | ✓ (inert) | — | biểu diễn 2 lần (1 inert) |
| hoaMo | ✓ | ✗ | — | ✓ (inert) | ✓ (inert) | biểu diễn 3 lần (2 inert) |
| hoaTuyet | ✓ | ✗ | — | ✓ (inert) | — | biểu diễn 2 lần (1 inert) |
- **Double-COUNT thật (2 hệ verdict cùng phạt):** nguyetPha, nhatPha — bị trừ điểm ở `chamDiem` (legacy score) **và**
  giảm availability ở chain. Cùng 1 Phá phạt 2 lần ở 2 hệ song song (vấn đề chamDiem↔chain — 26A).
- **Biểu diễn trùng (không double-COUNT vì bản sao inert):** 4 hóa-biến ở transformationState (không consumer); hoaMo
  thêm burialState. Latent-risk nếu tương lai đọc transformationState cho verdict.
- **Sạch nhất:** tuePha (chỉ reduced).

## 6. Semantic Decomposition
| Trục | Ý nghĩa | Nguồn | Ảnh hưởng verdict |
|---|---|---|---|
| `reduced` | "hạn chế availability" (gộp 7 producer, 2 họ: quan hệ + hóa-biến) | can-luc-hao:298 | CÓ (chain) |
| `restrained` (Hóa Hợp) | "níu chân, còn lực" | :306 | CÓ (avail→LIMITED, gộp chung reduced) |
| `Suy` (effective) | lực nền yếu | baseForce | CÓ (avail→LIMITED) |
| `transformationState` | 8 hóa-biến flags (mô tả) | return | **KHÔNG** (no consumer) |
| `movementEfficacy` | trạng thái hiệu-lực-động (FACT) | :319 | KHÔNG (25I lock) |
| `monthVuongSuy` | vượng/suy theo Tháng | HaoInfo | quyết NHÃN (getDayRelations) |
| `effective`/`baseForce` | lực tổ hợp Nhật+Nguyệt | canLucHao | CÓ (strengthFrom + avail nhánh force) |

Trả lời 7 câu:
1. **Tất cả là "strength limitation"?** KHÔNG — `reduced` (quan hệ Phá + hóa-biến) và `restrained` (níu chân) và `Suy`
   (lực nền) là **3 loại khác nhau**, chỉ **effective/baseForce** mới là "strength" thật.
2. **Producer nào là relational state?** nguyetPha/nhatPha/tuePha (xung phá — quan hệ với Nhật/Nguyệt/Năm).
3. **Producer nào là transformation/effect?** hoiDauKhac/hoaXung/hoaMo/hoaTuyet (hóa-biến).
4. **reduced mất source/severity?** CÓ — 7 producer + gộp với restrained/Suy tại availabilityOf → 1 rank "LIMITED";
   không phân biệt nguồn hay độ nặng, không cộng dồn (1 = nhiều).
5. **availabilityOf collapse khác-semantic thành cùng LIMITED?** CÓ — reduced(7) + restrained + Suy → cùng "LIMITED".
6. **Cần distinction (source / severity / transformation / movement)?** Về ngữ nghĩa CÓ (4 khái niệm khác nhau); về
   NHU CẦU hiện tại của chain (chỉ cần "source có phát huy đầy đủ không") thì generic LIMITED **đủ** — chỉ cần tách khi
   verdict tương lai đối xử khác nhau. → đánh đổi rõ ràng (§ architecture models).
7. **Double-count semantic?** CÓ với nguyetPha/nhatPha (chain + chamDiem); trùng-biểu-diễn (inert) với hóa-biến.

## 7. Provenance (phân loại từng producer)
| Producer | FACT | EFFECT wording | Phân loại |
|---|---|---|---|
| nguyetPha | Chương VI (bản dịch nội bộ) "Nguyệt kiến xung hào = nguyệt phá" | cùng nguồn | **A/B** (translated primary) |
| nhatPha | 增删卜易 日辰章 (verified 25C) "冲衰弱之静爻则为日破" | có (愈加无用) | **A/B** |
| tuePha | spec §3.9 = **lock Phase 10A**, "KHÔNG cổ thư"; 0/153 án lệ | không cổ | **C + D** (methodology decision + DATA GAP) |
| hoiDauKhac | hóa-biến (base sources Ch.VII) | chưa re-verify verbatim series này | **C/E** |
| hoaXung | như trên | như trên | **C/E** |
| hoaMo | như trên (Nhập Mộ 4 dạng) | như trên | **C/E** |
| hoaTuyet | như trên | như trên | **C/E** |
- KHÔNG biến decision (tuePha/hóa-biến) thành trích dẫn cổ. nhatPha là quan hệ đã khóa Model A (26D).

## 8. Architecture Findings
1. `reduced` = boolean **overloaded** trộn 2 họ (quan hệ Phá × hóa-biến), 7 nguồn, đa provenance.
2. **3 producer load-bearing** (nguyet/nhat/tue), **1 redundant trong mẫu** (hoiDauKhac), **3 chưa đo** (hoaXung/Mộ/Tuyệt).
3. **Double-count thật** chỉ ở nguyet/nhat Phá (chain + chamDiem legacy) — thuộc vấn đề chamDiem↔chain (26A).
4. **Trùng-biểu-diễn inert** ở hóa-biến (transformationState/burialState) — latent-risk, chưa gây hại.
5. `availabilityOf` mất source/severity (gộp reduced+restrained+Suy) — design convenience cho chain hiện tại.
6. Các lock đã có (Nhật Phá 26D Model A; Tuế Phá 10A; movementEfficacy 25I FACT-only) **không mâu thuẫn** hiện trạng.

## 9. Architecture Models (KHÔNG chọn)
| Model | Mô tả | Semantic benefit | Regression risk | Compat methodology | Migration | Info preserved/lost | Verdict-path effect |
|---|---|---|---|---|---|---|---|
| **A** | Giữ nguyên: 7 producer → reduced → LIMITED | 0 (giữ) | 0 | 100% (khớp mọi lock) | 0 | mất source/severity (như hiện tại) | không đổi |
| **B** | Giữ boolean, **thêm metadata** `reducedBy: string[]` (source) | +truy vết nguồn (prompt/debug) | thấp (chỉ thêm field mô tả) | giữ (không đổi avail) | thấp | giữ source; vẫn gộp severity | không đổi (nếu avail vẫn dùng boolean) |
| **C** | `reducedBy[]` + severity + mapping availability riêng | +source +severity | trung bình-cao (đổi availabilityOf → đổi verdict nhiều ca) | cần giữ 26D/10A locks | trung bình | giữ nhiều | **ĐỔI** verdict (nhiều ca) |
| **D** | Tách 3 trục: limitationState (quan hệ) / transformationState (đã có) / movementEfficacy (đã có) | rõ nhất | cao | phải map lại avail; giữ locks | cao | giữ tối đa | **ĐỔI** verdict |
- Ràng buộc mọi model: giữ nhatPha→reduced (26D Model A), tuePha→reduced (10A), movementEfficacy FACT-only (25I), nhãn
  Phase 24; nếu đụng chamDiem↔double-count thì xử đồng bộ; test-first; KHÔNG số-hoá; KHÔNG nhập 黄金策.

## 10. Owner Decision Questions
- **DQ1.** Có cần tách `reduced` theo source (Model B metadata) để truy vết/giải thích không? (rủi ro thấp, không đổi verdict)
- **DQ2.** Có cần severity/precedence ở availabilityOf (Model C/D) không, hay generic LIMITED là đủ cho chain?
- **DQ3.** Double-count nguyet/nhat Phá (chain + chamDiem): giữ song song, hay hợp nhất/loại `chamDiem` legacy? (vấn đề 26A DQ5)
- **DQ4.** hoiDauKhac (redundant trong mẫu): giữ trong reduced (an toàn) hay điều tra thêm để gỡ? (**cảnh báo: bài học 26B —
  "redundant" cần probe rộng trước khi gỡ**; mẫu Thuần Càn chưa đủ tổng quát)
- **DQ5.** hoaXung/hoaMo/hoaTuyet chưa đo — có cần probe bộ quẻ khác để xác định load-bearing trước khi quyết reduced không?
- **DQ6.** transformationState/burialState trùng-biểu-diễn hóa-biến (inert) — dọn hay giữ (tránh latent double-count)?

## 11. Recommendation
- **KHÔNG cần thay đổi khẩn cấp.** Hiện trạng (Model A) nhất quán mọi lock, không bug. Double-count nguyet/nhat Phá là
  vấn đề chamDiem↔chain **đã biết** (26A DQ5), nên gộp vào gate đó nếu owner mở.
- **Nếu owner muốn dọn:** ưu tiên **Model B** (thêm source metadata, rủi ro thấp, không đổi verdict) trước khi cân nhắc
  C/D (đổi verdict). **Tuyệt đối probe rộng (đa quẻ)** trước khi gỡ bất kỳ producer nào (bài học 26B: "redundant" theo
  1 quẻ có thể load-bearing ở quẻ khác — riêng hoiDauKhac cần xác nhận, hoaXung/Mộ/Tuyệt cần đo).
- Đây là **decision gate**: chờ owner chọn hướng; audit KHÔNG tự quyết.

## 12. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · scoring/conclusion/ky-nguyen-dung/availabilityOf: NO.** doc: YES (file này).
- Regression: **318/318 PASS** (audit thuần; probe đã xóa nên count không đổi).
- Commit chỉ doc này. **KHÔNG push.** STOP.
