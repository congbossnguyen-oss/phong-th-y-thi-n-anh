# PHASE 18 — FINAL LỤC HÀO COVERAGE & CONSISTENCY AUDIT

**Branch:** `quan-su-thien-anh` · **Baseline commit:** `f76415d` · **Regression:** 277/277 PASS (Quan Su + Lục Hào),
scoped `tsc` clean, zero in-scope failures.

> AUDIT-ONLY phase. **0 runtime code changes.** Câu hỏi: hệ Lục Hào đã nhất quán FACT → SYNTHESIS →
> CONCLUSION → TEMPORAL → AI chưa, và còn gap nào cho Phase 19.

**Verdict (tóm tắt): CONSISTENT end-to-end.** Không phát hiện correctness bug. Tất cả gap còn lại là
DATA GAP (prose án lệ) hoặc METHODOLOGY GAP đã được documented + defer đúng theo spec. Danh sách hành động
Phase 19 ở §XIII (đều LOW severity, phần lớn cleanup/cosmetic).

---

## I. Pipeline trace (caller → callee)

`POST /api/quan-su/luan` → `runQuanSu()` (orchestrator.ts:83) →
- `divination.ts` cast (qua `luc-hao.ts` — Nạp Giáp, Thế/Ứng, Lục Thân, vượng suy, Trường Sinh, Không Vong,
  relations Nhật/Nguyệt, fanYin/fuYin) → `FullCastResult`.
- `buildAdvisoryReport(payload)` (advisory-engine.ts:137 caller) populates **7 synthesis layers**:
  `fourGods` (resolveFourGods) · `kyNguyenDung` (Phase 11) · `ketLuanSuViec` (Phase 12) · `ungKy` (Phase 14)
  · `hinh` (Phase 15) · `cuuThan` (Phase 16) · `haoTimeRelations` (Phase 17). Xác nhận grep advisory-engine.ts:691-696.
- `luanGiaiBangAI(payload, { fourGods: report.fourGods })` (orchestrator.ts:143) → `userPrompt()` — surface
  MỌI layer (CÂN LỰC HÀO, TỨ THẦN, KỴ→NGUYÊN→DỤNG, KẾT LUẬN, ỨNG KỲ, HÌNH, CỪU THẦN, NHẬT/NGUYỆT, PHI/PHỤC,
  PHẢN/PHỤC NGÂM, TAM HỢP) + guardrails, dưới cổng `if (fourGods && fourGods.dungThanNguHanh)`.

**Wiring OK.** Mọi layer đều runtime-usable + reach AI. (Chi tiết perf: xem §II.6.)

## II. Source-of-truth audit

| Domain | Canonical source | Duplicate? | Status |
|---|---|---|---|
| Ngũ hành sinh/khắc direction | `nguHanhTac` (advisory-engine) | 9 bản `SINH`/`KHAC` map giống hệt (luc-hao ×3, advisory-engine, ung-ky, bat-tu, luan-van-khi, 2 test) | **DUPLICATE BUT CONSISTENT** (map bất biến, đều test) |
| Nhật/Nguyệt sinh/khắc/xung/phá/ám động | `HaoInfo.relations` (luc-hao.ts) + `nguHanhTac` cho chiều | hao-time-relations chỉ ĐỌC, không tính lại | **CONSISTENT** (single canonical) |
| Hình | `hinh-relations.ts` (`detectHinh`) | không nơi khác | **CONSISTENT** |
| Cừu Thần (Lục Hào) | `cuu-than.ts` | Bát Tự có Cừu riêng (`bat-tu-engine`) — hệ KHÁC, không trộn | **CONSISTENT** |
| Tam Hợp | `luc-hao-tam-hop-cuc.ts` (`tinhTamHopCuc` + `phanLoaiSauTamHop`) | `chart-profile/manh-phai` có TAM_HOP_CUC — Tử Vi, hệ KHÁC | **CONSISTENT** (Lục Hào single-source) |
| Ứng Kỳ | `tinhUngKy` (luc-hao-ung-ky.ts) | `ung-ky-synthesis` chỉ ADAPT, không tạo mốc mới | **CONSISTENT** |
| Cân Lực (Vượng/Suy) | `canLucHao` | ket-luan/ky-nguyen-dung/ung-ky/hao-time đều CONSUME | **CONSISTENT** (không recompute) |

**6.** Synthesis chạy **2 lần**: `buildAdvisoryReport` (cho AdvisoryReport) và `userPrompt` (cho prompt) tính
lại canLucHao/kyNguyenDung/ketLuan/ungKy/hinh/cuu/haoTime. Cùng hàm deterministic ⇒ **DUPLICATE BUT
CONSISTENT** (không lệch kết quả). Chỉ là chi phí tính lại — có thể tối ưu (pass report vào prompt) ở Phase 19,
KHÔNG phải bug.

## III. Fact layer coverage (runtime-usable?)

| Fact | Canonical source | Advisory | Prompt | Tests | Status |
|---|---|---|---|---|---|
| Quẻ / Bát Quái / Bát Cung / Nạp Giáp / Can Chi / Ngũ Hành / Âm-Dương | luc-hao.ts | cast | cast JSON | luc-hao engine | ✅ |
| Hào động / Hào biến | luc-hao.ts (`isDong`, `bien`) | cast | ✅ | ✅ | ✅ |
| Lục Thân / Thế / Ứng | luc-hao.ts | fourGods + theUng | ✅ | ✅ | ✅ |
| Dụng / Nguyên / Kỵ Thần | resolveDungThan + resolveFourGods | ✅ | TỨ THẦN | __four-god | ✅ |
| **Cừu Thần** | cuu-than.ts (Phase 16) | `cuuThan` | CỪU THẦN block | __cuu-than | ✅ |
| Nhật Thần / Nguyệt Kiến (mọi chiều) | hao-time-relations (P17) | `haoTimeRelations` | NHẬT/NGUYỆT block | __hao-time | ✅ |
| Thái Tuế / Tuế Phá | canLucHao.yearState (P10E) | qua canLucHao | CÂN LỰC HÀO | __can-luc-hao | ✅ (locked; xem §VII) |
| Không Vong | HaoInfo.xunKong → canLucHao.temporalExistence | ✅ | ✅ | ✅ | ✅ |
| Nhật Phá / Nguyệt Phá | HaoInfo.relations | ✅ | ✅ | ✅ | ✅ |
| Hợp / Xung / Hại | HaoInfo.relations | ✅ | NHẬT/NGUYỆT block | ✅ | ✅ |
| Hình | hinh-relations (P15) | `hinh` | HÌNH block | __hinh | ✅ (2 bộ spec) |
| Tam Hợp | luc-hao-tam-hop-cuc | payload.tam_hop_cuc + 6-thể | 2 block | __sau-tam-hop | ✅ |
| Phi / Phục Thần | getPhiPhucRelations | ✅ | PHI/PHỤC block | __phi-phuc | ✅ |
| Phản Ngâm / Phục Ngâm | cast.fanYin/fuYin | ✅ | block | prompt test | ✅ |
| Trường Sinh / Nhập Mộ / Tuyệt | HaoInfo.growthDay/Month + relations | canLucHao | CÂN LỰC HÀO | ✅ | ✅ |
| Hồi Đầu Sinh/Khắc / Hóa Hợp/Xung/Mộ/Tuyệt | canLucHao.transformationState | ✅ | ✅ | __can-luc-hao | ✅ |
| Tiến / Thoái Thần | luc-hao-tien-thoai-than | payload + canLucHao | ✅ | tests | ✅ |
| Ám Động | HaoInfo.relations (engine derive) | canLucHao + haoTime | ✅ | ✅ | ✅ |
| Ứng Kỳ | tinhUngKy + ung-ky-synthesis (P14) | `ungKy` | 2 block | __ung-ky | ✅ |

→ **Không có fact nào "có file nhưng không runtime-usable".** Tất cả đều reach Advisory + Prompt + Tests.

## IV. Synthesis coverage

- **Cân Lực Hào (P10/10E):** 7 cases + GAP-1 (một trụ khắc + trụ kia trợ → Trung Hòa) + GAP-2 (Nguyệt phù) +
  Case 6 (locked reading) + Nhật/Nguyệt + Phá (reduced, not zero) + Không Vong (EMPTY axis) + Nhập Mộ (hidden)
  + Tuyệt + động/tĩnh + transformations. **Không module nào override** (ket-luan/ky-nguyen-dung/ung-ky/hao-time
  đều đọc `currentState`, không sửa). ✅
- **Kỵ→Nguyên→Dụng (P11):** Kỵ/Nguyên multi-node (max, không cộng), Không Vong→EMPTY, Phá→LIMITED (base giữ),
  Nhập Mộ→HIDDEN, tham-sinh (thông quan), no-Nguyên→KY_DOMINANT, direct pressure. Cừu **CỐ Ý** ngoài chain. ✅
- **Kết luận sự việc (P12):** Dụng strength (từ effective), Thế/Ứng axis riêng, delay/rescue/contradiction →
  MIXED, thiếu → UNRESOLVED, temporal EMPTY/HIDDEN → FAVORABLE_WITH_DELAY. Không ép GOOD/BAD. ✅
- **Ứng Kỳ (P14):** candidate + uuTien precedence, primary chỉ khi duy nhất, MULTIPLE_CANDIDATES/DELAYED/
  UNRESOLVED, Hóa Mộ không tự tạo XUAT_MO. ✅

## V. Contextual relation consistency (FACT ≠ INTERPRETATION)

Mỗi relation (Hợp/Xung/Hại/Hình/Tam Hợp/Phi-Phục/Phản-Phục Ngâm/Cừu/Nhật-Nguyệt): formation từ source
canonical, role preserved (gồm CUU ở P17), moving/static giữ nguyên, **KHÔNG** ảnh hưởng strength, **KHÔNG**
ảnh hưởng conclusion, AI thấy qua block riêng + guardrail "không thành verdict". Không phát hiện relation nào
tự biến thành cát/hung ở fact layer. ✅

## VI. Transformation consistency (canLucHao vs ketLuanSuViec)

`ketLuanSuViec.strengthFrom(cs)` đọc **thẳng** `currentState.effective` của canLucHao — cùng semantics, KHÔNG
tính lại. Do đó **không thể** có "canLucHao=STRONG nhưng ketLuan=WEAK" mâu thuẫn: reduced/restrained/hidden là
TRỤC RIÊNG (được surface song song), effective là 1 nguồn. Đây là **intentional synthesis** (giữ nhiều trục),
không phải contradiction. Đã có test (P12 #10-17): Phá base-mạnh → strength giữ VERY_STRONG/STRONG. ✅

## VII. Temporal consistency

`Không Vong = temporalExistence EMPTY` (chưa hiện hữu), KHÔNG zero — giữ nguyên qua canLucHao → ket-luan
(FAVORABLE_WITH_DELAY) → ung-ky (DELAYED, XUAT_KHONG candidate). `Ứng Kỳ = candidate`, status enum
(RESOLVED/MULTIPLE/DELAYED/UNRESOLVED) + guardrail "không phải chắc chắn ngày X"; primary chỉ khi precedence
duy nhất. **Không module nào biến candidate thành guaranteed event.** ✅

## VIII. AI fidelity audit (prompt cuối)

`systemPromptQuyTac` (P13) có block "NGUỒN SỰ THẬT DETERMINISTIC": thứ tự KẾT LUẬN > KỴ→NGUYÊN→DỤNG > CÂN LỰC
HÀO > contextual > raw; cấm đảo state / tính lại ngũ hành; giữ MIXED/UNRESOLVED; Không Vong≠mất, Phá≠zero.
Mỗi block (Cừu/Hình/Nhật-Nguyệt/Ứng Kỳ/Kết luận) đều có guardrail "không override conclusion, không tự thêm/
đổi". Đã kiểm 12 điểm §VIII của Phase 18 — **không có instruction mâu thuẫn**. Harness `__ai-fidelity`
(19 it) assert prompt mang nguyên văn state/conclusion + adversarial (MIXED giữ MIXED, Kỵ Không Vong ≠ 0). ✅

## IX. 153 án lệ validation (tổng hợp)

| Mechanism | Case evidence | Structural validation | Status |
|---|---|---|---|
| Vượng/Suy (seasonal) | rất nhiều ("vượng tướng" 36+, "hưu tù" 29+) | prose | MATCH (existence); struct = DATA GAP |
| Nhật/Nguyệt (khắc 26/27, Nhật Phá, Nguyệt Phá 31) | nhiều | prose | MATCH; struct = DATA GAP |
| Không Vong | 59+ | prose | MATCH; struct = DATA GAP |
| Nhập Mộ (32) / Tuyệt | nhiều | prose | MATCH; struct = DATA GAP |
| Hồi Đầu Sinh (4) / Khắc (13) | có | prose | MATCH; struct = DATA GAP |
| Tiến (3) / Thoái (2) | có | prose | MATCH; struct = DATA GAP |
| Ám Động (41) | rất nhiều | prose | MATCH; struct = DATA GAP |
| Tam Hợp (đủ/khuyết) | TH1/TH4/TH5-like có | prose | MATCH (TH1/4/5); TH2/TH3/TH6 = DATA GAP |
| Hình (tam hình Dần-Tỵ-Thân, tự hình Dậu/Hợi) | ~6 | prose + qua Nhật/Nguyệt/biến | MATCH (existence); struct = DATA GAP |
| **Cừu Thần** | **0 / 153** | — | DATA GAP (spec là nguồn khóa, không phải án lệ) |
| Ứng Kỳ | nhiều mốc | prose | MATCH; struct = DATA GAP |
| Kỵ→Nguyên→Dụng chain | có (vd "Kỵ sinh Nguyên khắc...") | prose | MATCH (modelable); struct = DATA GAP |

**Nguyên nhân struct = DATA GAP đồng loạt:** án lệ là prose (không có coin-tosses / cấu trúc 6 hào) ⇒ không
reconstruct được `FullCastResult`. Đây là **DATA GAP**, KHÔNG phải METHODOLOGY GAP.

## X. Test coverage

**277/277** (Quan Su + Lục Hào). Quan-su: 12 file, ~210 `it()`. Phân loại:
- **Unit:** can-luc-hao (33), ky-nguyen-dung (28+3), ket-luan (28+1), ung-ky (21), hinh (16), cuu-than (10),
  hao-time (15), four-god (17), phi-phuc (5), sau-tam-hop (9).
- **Prompt-contract / fidelity:** __ai-fidelity (19), tier-check (5).
- **Golden / adversarial:** nhúng trong ky-nguyen-dung (end-to-end tham sinh), ket-luan (Không Vong, Phá,
  MIXED), ai-fidelity (adversarial MIXED/UNRESOLVED, Kỵ Không Vong).
- **Critical invariants đã có test:** Cừu ≠ Kỵ ✅ · Hình ≠ Khắc ✅ · Nhật Phá ≠ Ám Động ✅ · MIXED giữ MIXED ✅
  · UNRESOLVED ✅ · MULTIPLE_CANDIDATES ✅ · role collision (Dụng>Thế) ✅ · changed-line (biến) ✅ · static line ✅
  · Không Vong ≠ 0 ✅ · Phá base-giữ ✅.

**Chưa có test riêng (candidate, không bắt buộc):** integration test đi từ `runQuanSu` → prompt string (hiện chỉ
test ở tầng `userPrompt`, không qua orchestrator); test khẳng định report vs prompt cho CÙNG synthesis (chống
drift nếu 1 trong 2 site đổi). LOW priority.

## XI. Data / terminology integrity

- **`Tỵ` (canonical) vs `Tị`:** RUNTIME logic đúng (mọi `CHI.indexOf` dùng "Tỵ"; `hinh-relations` có guard
  `throw` nếu chi lạ). NHƯNG `hinh-relations.ts` còn **chuỗi hiển thị** (reason line 93, ghiChu line 111,
  comment/label) viết "Dần-Tị-Thân" (theo chính tả spec) trong khi field `label`/`chi` đã là "Tỵ". → **COSMETIC
  INCONSISTENCY** (không ảnh hưởng logic; chỉ lệch chính tả trong text AI đọc). Trivial fix.
- Mọi relation table (LUC_HOP/XUNG/HAI_PAIRS, TAM_HOP_CUC, TAM_HINH_CHI) dùng chung CHI index từ `menh-nap-am`
  → nhất quán representation. ✅

## XII. Runtime boundary (mục XII của prompt bị cắt — audit phần đọc được)

- Client KHÔNG tự quyết conclusion: `conclusion`/`ketLuanSuViec` tính server-side (buildAdvisoryReport), client
  chỉ render. ✅
- API dùng deterministic result: `runQuanSu` build report deterministic TRƯỚC khi gọi AI; AI chỉ diễn đạt. ✅
- AI KHÔNG phải source of truth: guardrail P13 + mọi block "không override" + report deterministic là input. ✅
- Raw cast: `payload.cast` là "nguồn sự thật, LLM không tự tính lại" (divination.ts:209 comment). ✅

---

## XIII. GAP LIST FOR PHASE 19 (tất cả LOW; không có correctness bug)

1. **[COSMETIC]** `hinh-relations.ts` reason/ghiChu strings "Dần-Tị-Thân" → "Dần-Tỵ-Thân" cho khớp field.
   2 chuỗi. (Terminology integrity §XI.)
2. **[CLEANUP]** 9 bản `SINH`/`KHAC` ngũ-hành map giống hệt → gom về 1 const export dùng chung (không đổi
   behavior; đều đã test). DUPLICATE BUT CONSISTENT (§II).
3. **[PERF/ARCH]** Synthesis tính 2 lần (report + prompt) → cân nhắc pass report vào `userPrompt` để tính 1
   lần. Không phải bug (§II.6).
4. **[TEST]** Thêm 1 integration test `runQuanSu → prompt` + 1 test "report synthesis == prompt synthesis"
   chống drift. LOW (§X).
5. **[METHODOLOGY GAP — chờ nguồn khóa, KHÔNG tự invent]:**
   - Tuế Phá: 0 án lệ (locked rule ở P10E nhưng chưa validate case).
   - Tam Hợp TH2/TH3/TH6 + Hình Sửu-Tuất-Mùi / Tự Hình: spec §348 defer "danh sách đầy đủ".
   - Cừu Thần **meaning** (cát/hung weighting): cố ý fact-only; cần nguồn khóa mức ảnh hưởng.
   - Cân Lực precedence khi nhiều adverse transformation xung đột: hiện giữ đa-trục (không collapse) — nếu
     Thầy muốn 1 verdict thì cần khóa rule.
6. **[DATA GAP — không fixable bằng code]:** Structural validation 153 án lệ (prose, thiếu coin-tosses). Cần
   bộ fixture quẻ đầy đủ 6 hào nếu muốn end-to-end golden.

**Kết luận:** hệ Lục Hào **nhất quán FACT → SYNTHESIS → CONCLUSION → TEMPORAL → AI**, single-source per domain,
deterministic, score-free, guardrailed. Không có gap chặn. Phase 19 chỉ còn cleanup/cosmetic + (tùy Thầy)
khóa thêm methodology cho các mục §XIII.5.
