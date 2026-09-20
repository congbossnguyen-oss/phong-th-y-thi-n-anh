# PHASE 11-A3 — INDEPENDENT AUDIT (旺相休囚死 / Wang Shuai)

**Loại tài liệu**: Audit độc lập, sau khi implementation báo cáo sẵn sàng audit.
**Phạm vi**: AUDIT ONLY — không sửa source/test, không commit, không chuyển sang A2, không đụng A1/Phase 11-B.
**Đối chiếu với**: `docs/daliuren/DA_LIU_REN_PHASE_11A_PRE_IMPLEMENTATION_AUDIT.md` (mục A3), `docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md` §11, architecture rule đã chốt ở `DA_LIU_REN_PHASE_11A1_FREEZE.md`.

---

## 1. Audit Semantics

**A. `.chi` vs `napAm.element`**: Đọc trực tiếp `src/wang-shuai/compute.ts` — `nguHanhOfChi(chi)` tra `Data.CHI_NGU_HANH[Data.CHI.indexOf(chi)]`. Chữ ký `computeWangShuai(monthChi: Chi)` CHỈ nhận 1 giá trị `Chi` (string), KHÔNG nhận `CanChiPillar`/`GanzhiPillar` đầy đủ — về mặt CẤU TRÚC, hàm này KHÔNG THỂ đọc `napAm` vì `napAm` không nằm trong scope truy cập được. Đây là 1 đảm bảo mạnh hơn "code hiện tại không dùng napAm" — nó là "không thể dùng napAm dù có cố ý hay vô ý". Xác nhận qua golden chart 2024-10-15 10:00 (`monthPillar.chi="Tuất"`, `napAm.element="Hỏa"`): `computeWangShuai("Tuất")` cho ra hàng "earth" (đúng theo Thổ của Tuất), KHÔNG phải hàng "fire" (napAm). **PASS.**

**B. Mapping 5 WangShuaiStage đối chiếu Algorithm Spec §11** (suy lại ĐỘC LẬP từ nguyên văn spec, không dùng code đang audit để suy):

| Quy tắc spec (M=hành tháng, X=hành xét) | Quan hệ `getNguHanhQuanHe(M,X)` | Code map tới | Khớp? |
|---|---|---|---|
| X = hành tháng → 旺 | `tuong-hoa` | `wang` | ✅ |
| X = hành được tháng sinh ra → 相 | `a-sinh-b` (M sinh X) | `xiang` | ✅ |
| X = hành sinh ra tháng → 休 | `b-sinh-a` (X sinh M) | `xiu` | ✅ |
| X = hành khắc tháng → 囚 | `b-khac-a` (X khắc M) | `qiu` | ✅ |
| X = hành bị tháng khắc → 死 | `a-khac-b` (M khắc X) | `si` | ✅ |

Cả 5/5 khớp chính xác. Đã chạy độc lập qua cả 12 Chi (script Node trực tiếp gọi `computeWangShuai`, đối chiếu bảng tự suy tay từ spec) — khớp 12/12. **PASS.**

**C. `TrachNhat.getNguHanhQuanHe` bảo toàn đúng semantics sinh/khắc?** Đọc trực tiếp `packages/rule-engine/src/trach-nhat/nguHanhQuanHe.ts`: `NGU_HANH_SINH` = Mộc→Hỏa→Thổ→Kim→Thủy→Mộc, `NGU_HANH_KHAC` = Mộc→Thổ→Thủy→Hỏa→Kim→Mộc — khớp ĐÚNG chu kỳ Algorithm Spec §11 tự nêu ("木→火→土→金→水→木"). Hàm này đã dùng thành công, không sự cố, trong `nine-methods/wuxing.ts` + 2 evaluator ĐÔNG BĂNG (R-NHATTHAN-01, R-KIENTUNG-02) — không phải logic mới chưa kiểm chứng. **PASS.**

**D. Không định lượng hoá**: `WangShuaiStage` chỉ 5 literal string, không có field số nào trong `WangShuai`/`WangShuaiComputation`. Xác nhận qua đọc type + test "KHÔNG có field định lượng hoá". **PASS.**

**E. Deterministic + pure**: Hàm không random/time/env/network, trả object literal mới mỗi lần gọi (xác nhận qua test object-identity: 2 lần gọi cho `toEqual` nhưng KHÔNG `toBe` — object mới, không share reference). Input là string primitive (bất biến theo ngữ nghĩa JS, không thể mutate). **PASS** — dù test "no mutation" gần như vacuous với input string (xem mục 8).

---

## 2. Audit Confidence A

Đây là mục cần scrutiny cao nhất, đã đối chiếu với TOÀN BỘ pattern provenance hiện có trong repo (không chỉ 2-3 entry được implementation trích dẫn ban đầu).

**Bối cảnh phát hiện quan trọng**: đọc lại `nine-methods/provenance.ts` (7 entries) cho thấy 1 pattern rõ ràng, nhất quán mà implementation KHÔNG trích dẫn:

- `FUYIN_FANYIN_ACTIVATION_PROVENANCE` = **A** — lý do nêu rõ: "CHỈ áp dụng cho ĐIỀU KIỆN KÍCH HOẠT... cả 2 là **structural check toán học thuần túy, không tranh cãi**."
- `MAOXING_PROVENANCE` = **A** cho phần "Sơ truyền = Thiên Bàn tại cung Dậu — công thức tường minh, không tranh cãi" (phần Trung/Mạt truyền của CÙNG entry này lại có 1 xung đột riêng, không liên quan ở đây).
- Ngược lại, `SHEHAI_PROVENANCE`/`YAOKE_PROVENANCE`/`BIEZE_PROVENANCE`/`BAZHUAN_SELECTION_PROVENANCE` đều chỉ **B** — vì đây là các công thức **CHỌN GIÁ TRỊ** (value-selection) có nhiều cách đọc khả dĩ, cần dò tay cross-check với code thật của ≥1 nguồn độc lập mới dám chốt.
- `GANZHI_PILLAR_CONSTRUCTION_PROVENANCE` (calendar/) = **B** dù tự nhận "phổ quát, không tranh cãi" — vì đây là **1 pipeline thiên văn nhiều bước** (Julian Day, kinh độ mặt trời...) có rủi ro lỗi implementation thật sự, dù bản thân LÝ THUYẾT (chu kỳ 60) không tranh cãi.

**Kết luận pattern**: Project này phân biệt RÕ 2 loại "không tranh cãi" khác nhau —
1. **Structural/definitional check** (không có bước tính toán nào có thể sai theo nghĩa "chọn nhầm nhánh/công thức") → **A** được, không cần cross-check thêm (tiền lệ: `FUYIN_FANYIN_ACTIVATION_PROVENANCE`, phần "cung Dậu" của `MAOXING_PROVENANCE`).
2. **Computation pipeline có khả năng lỗi implementation thật** (dù lý thuyết nền không tranh cãi) → cần cross-check độc lập mới lên A (tiền lệ: `GANZHI_PILLAR_CONSTRUCTION_PROVENANCE` giữ B).

**Đối chiếu WangShuai vào đúng loại nào?** `computeWangShuai` = (1) tra 1 giá trị từ mảng 12 phần tử đã proven, (2) tra quan hệ sinh/khắc từ 2 bảng 5x5 cố định đã proven qua `getNguHanhQuanHe` (dùng lại y hệt Phase 9/11-B), (3) ánh xạ 1-trong-5 quan hệ → 1-trong-5 tên giai đoạn qua 1 dictionary literal cố định, khớp CHÍNH XÁC nguyên văn Algorithm Spec §11 (đã re-verify độc lập ở mục 1B). KHÔNG có bước "chọn nhánh giữa nhiều cách đọc khả dĩ", KHÔNG có pipeline tính toán nhiều bước có rủi ro lỗi biên (khác hẳn GANZHI's Julian Day/kinh độ). Đây thuộc **loại 1 (structural/definitional check)** — cùng loại với `FUYIN_FANYIN_ACTIVATION_PROVENANCE`.

7 câu hỏi cụ thể theo yêu cầu:
1. Pre-implementation audit CÓ chốt A cho công thức này (mục 6: "Đủ — A, công thức TÍNH... không tranh cãi"). ✅
2. Algorithm Spec §11 có đủ authority — CÓ, đây là văn bản project TỰ coi là nguồn quyết định confidence cho mọi entry khác (mọi `sourceLocation` đều trỏ về nó). ✅
3. **Có cần cross-check external theo tiêu chuẩn hiện hành không?** — KHÔNG, theo đúng phân loại "structural/definitional check" vừa xác lập ở trên (tiền lệ `FUYIN_FANYIN_ACTIVATION_PROVENANCE` không cần cross-check để đạt A).
4. Việc tái dùng `getNguHanhQuanHe()` đã proven **CÓ đủ** để giữ A — vì nó loại bỏ hoàn toàn rủi ro "thuật toán mới chưa kiểm chứng" (khác GANZHI).
5. So sánh: KHÁC `GANZHI_PILLAR_CONSTRUCTION_PROVENANCE` (pipeline thiên văn, cần cross-check) — GIỐNG `FUYIN_FANYIN_ACTIVATION_PROVENANCE`/phần "cung Dậu" của `MAOXING_PROVENANCE` (structural check).
6. Không tự hạ xuống B chỉ vì "chưa cross-check" — ĐÚNG, vì convention project (qua tiền lệ loại 1) không yêu cầu điều đó cho structural check.
7. Không tự giữ A chỉ vì "đang dùng utility proven" — đã tránh: lý do KHÔNG chỉ là "utility đã proven" mà còn là bản thân bước ánh xạ MỚI (5→5 dictionary) đã được re-verify ĐỘC LẬP khớp 100% nguyên văn spec (mục 1B), không phải niềm tin suông.

**KẾT LUẬN: CONFIDENCE A JUSTIFIED.**

**Finding non-blocking**: `notes` hiện tại trong `wang-shuai/provenance.ts` giải thích lý do giữ A khá sơ sài ("lý do hạ ở GANZHI không áp dụng ở đây... không phải thuật toán mới chưa kiểm chứng") — CHƯA trích dẫn tường minh precedent mạnh hơn (`FUYIN_FANYIN_ACTIVATION_PROVENANCE`/`MAOXING_PROVENANCE` "structural check" category) mà audit này vừa xác lập. Đề xuất (KHÔNG sửa ngay, đây là audit-only): bổ sung câu trích dẫn 2 precedent trên vào `notes` để entry tự đứng vững hơn khi bị audit lại sau này — **documentation-hardening, không phải correctness gap**.

---

## 3. Audit sourceId

`sourceId: "wu-xing-wang-xiang-cycle-convention"`.

- **Convention đặt sourceId có tồn tại?** Có — kebab-case, ổn định cho VĂN BẢN NGUỒN (type comment `interpretation/provenance.ts` dòng 21-23), KHÔNG có registry trung tâm bắt buộc pre-register — bất kỳ entry mới nào được tự do tạo sourceId mới miễn đúng quy ước.
- **Có ID tương đương đã tồn tại bị bỏ sót không?** Đã rà toàn bộ `grep sourceId:` trong repo (21 kết quả) — CHỈ có `liu-ren-da-quan-siku` (đa số), `chinese-sexagenary-calendar-convention` (calendar, DUY NHẤT tiền lệ non-book), `report-g-guiren-mnemonic`. KHÔNG có sourceId nào sẵn có mô tả "quy ước Ngũ Hành phổ quát" — việc tạo mới là ĐÚNG, không phải bỏ sót.
- **Có mô tả đúng nguồn/quy ước không?** Có — tên phản ánh đúng "旺相 cycle, quy ước phổ quát" mà KHÔNG gán nhầm cho 六壬大全 cụ thể.
- **sourceId hay provenance identifier — có bị đánh tráo không?** KHÔNG — `id: "PROV-WANG-SHUAI-STAGE"` (khoá riêng của entry) và `sourceId: "wu-xing-wang-xiang-cycle-convention"` (khoá nguồn, có thể dùng chung cho nhiều entry tương lai) được giữ ĐÚNG 2 field riêng biệt, không lẫn.
- **Có PHẢI trỏ registry hiện hữu không?** Không — type/convention không yêu cầu.
- **Quan trọng — có nên dùng `liu-ren-da-quan-siku` (sourceId đã có, đa số entry khác dùng) thay vì tạo mới?** KHÔNG NÊN — Algorithm Spec §11 tự mô tả đây là "lý thuyết Ngũ Hành **phổ quát**" (không riêng 六壬大全), nên gán `sourceId: "liu-ren-da-quan-siku"` mới là hành vi SAI (overclaim thuộc tính "riêng của cuốn sách này" cho 1 kiến thức phổ quát liên trường phái). Việc TẠO MỚI là lựa chọn đúng, giống hệt lý do calendar/ tạo `chinese-sexagenary-calendar-convention` thay vì gán nhầm cho 1 cuốn sách cụ thể.

**KẾT LUẬN: sourceId VALID, không phát hiện vấn đề.**

---

## 4. Audit Error Handling

So sánh 3 nhóm tiền lệ hiện có trong repo:

| Nhóm | Ví dụ | Có throw riêng? |
|---|---|---|
| Compute primitive CÔNG KHAI, độc lập (module riêng, export ra `src/index.ts`) | `computeYiMa` (`YiMaError("UNKNOWN_CHI", ...)`) | **CÓ**, dedicated error type + code |
| Helper NỘI BỘ của 1 package con, không export ra ngoài package đó | `nine-methods/wuxing.ts` (`NineMethodsError`) | **CÓ**, dedicated error type + code |
| Helper NỘI BỘ CỦA 1 evaluator cụ thể (không phải module riêng, không export) | `r-nhatthan-01/evaluator.ts`, `r-kientung-02/evaluator.ts` (`Data.CHI_NGU_HANH[...]!`) | **KHÔNG**, dựa `!` |

`computeWangShuai` implementation đã theo nhóm 3 (không throw riêng, dùng `!` — style giống r-nhatthan-01/r-kientung-02) cho hàm nội bộ `nguHanhOfChi`. Nhưng về mặt CẤU TRÚC, `computeWangShuai` **thuộc nhóm 1** (module riêng `wang-shuai/compute.ts`, export công khai qua `src/index.ts`, gọi được từ bên ngoài package) — giống hệt `computeYiMa`, KHÔNG giống r-nhatthan-01/r-kientung-02 (2 hàm đó CHỈ dùng nội bộ trong 1 evaluator đã đông băng, không bao giờ được gọi trực tiếp từ bên ngoài).

**Kiểm tra thực tế — invalid input có bị reject không, có silently trả sai không?** Đã test trực tiếp: `computeWangShuai("KHONG_HOP_LE" as Chi)` → **NÉM LỖI** (`Error: "Không xác định được quan hệ Ngũ Hành giữa undefined và Mộc"`), nhờ guard SẴN CÓ bên trong `getNguHanhQuanHe` (khi 1 tham số là `undefined`, không cặp SINH/KHẮC/tương hoà nào khớp → throw). **KHÔNG silently trả sai** — an toàn về mặt correctness.

**Nhưng đây có phải behavior nhất quán với tầng primitive không?** KHÔNG hoàn toàn — error hiện tại là 1 `Error` chung của package `@thien-anh/rule-engine` (thông điệp bằng tiếng Việt của package KHÁC, không có `code` field ổn định để caller phân biệt lập trình được), khác hẳn `YiMaError("UNKNOWN_CHI", ...)`/`NineMethodsError(...)` — 2 tiền lệ CÙNG NHÓM (public compute primitive) đều có error type RIÊNG với `code` xác định.

**KẾT LUẬN: correctness AN TOÀN (không silently sai), nhưng style KHÔNG nhất quán với tiền lệ đúng nhóm (`computeYiMa`) — finding non-blocking**, nên cân nhắc thêm `WangShuaiError`/validate tường minh khi có dịp sửa, KHÔNG bắt buộc trước freeze vì hành vi thực tế đã an toàn.

---

## 5. Audit Architecture / Exposure

Xác nhận qua `grep`:
- `DaLiuRenChartWithWangShuai` — KHÔNG tồn tại ở đâu trong `src/`.
- `calculateDaLiuRenChartWithWangShuai` — KHÔNG tồn tại ở đâu trong `src/`.
- `DaLiuRenCalculationResult` — `git diff` xác nhận 0 thay đổi.
- `calculateDaLiuRenChart()` thân hàm — `git diff --stat` xác nhận `src/index.ts` chỉ +1 dòng (export mới), không có dòng nào khác bị sửa.
- `wangShuai` KHÔNG được wire vào canonical facade ở bất kỳ đâu.

**Đối chiếu A3 contract**: Pre-Implementation Audit A3 mục 9 ("Cần đổi `DaLiuRenCalculationResult`? Không") + architecture rule đã chốt ở A1 Freeze ("A2/A3/A4 chỉ được thêm pure `computeXxx()` primitive... KHÔNG tạo facade mới") — việc KHÔNG expose `wangShuai` qua canonical facade là **ĐÚNG SCOPE**, không phải thiếu sót.

**KẾT LUẬN: Architecture PASS.**

---

## 6. Provenance Scope

Phân biệt rõ 3 khái niệm theo đúng yêu cầu:
1. **Compute primitive có `provenanceId`**: CÓ — `WangShuaiComputation.provenanceId`, trả cùng shape tiền lệ `computeYiMa`/`computeKeType`.
2. **Provenance entry tồn tại**: CÓ — `WANG_SHUAI_PROVENANCE`, 1 entry mới hợp lệ (xem mục 2-3).
3. **Canonical `DaLiuRenCalculationProvenance` có field tương ứng?** KHÔNG — và đây là ĐÚNG, vì A3 contract (giống A1) chỉ yêu cầu provenance tồn tại ở TẦNG PRIMITIVE, không yêu cầu wiring vào chart-level provenance khi chưa có consumer (không có rule Tầng 2 nào đọc `wangShuai`, không có facade nào cần trả nó kèm chart).

Implementation KHÔNG tự tạo wiring nào vượt quá yêu cầu. **PASS.**

---

## 7. Regression Boundary

Chạy lại TOÀN BỘ (không tái sử dụng kết quả cũ):
- `npx vitest run` → **397/397 PASS** (39 test file).
- `npm run typecheck` → PASS, 0 lỗi.
- `npm run build` (package) → PASS, 0 lỗi.
- `git diff --stat` trên `r-nhatthan-01/`, `r-honnhan-01/`, `r-timdo-01/`, `r-kientung-02/`, `rules/registry.ts` → **rỗng, 0 diff**.
- `git diff --stat` trên `ke-type/`, `da-liu-ren-chart-with-ke-type.ts`, `tests/unit/ke-type/` → **rỗng, 0 diff**.
- `git status --short packages/daliuren-engine/` → chỉ `M src/index.ts` (+1 dòng) + 2 path mới (`src/wang-shuai/`, `tests/unit/wang-shuai/`).

Không có test golden A1 nào thay đổi, không có rule output nào trôi (drift) — vì không file rule nào bị chạm.

**KẾT LUẬN: 11-B regression PASS. A1 regression PASS.**

---

## 8. Test Quality

Review 9 test trong `tests/unit/wang-shuai/compute.test.ts`:

| Test | Đánh giá |
|---|---|
| Mapping 12 Chi | **Độc lập thật** — bảng kỳ vọng viết tay từ nguyên văn spec (comment ghi rõ "KHÔNG suy từ code đang test"), không phải copy output rồi paste ngược làm assertion (kiểm tra bằng cách tự tính lại tay ở mục 1B của audit này, khớp 12/12) |
| Mỗi hành tự nó = wang | Test phụ, hợp lý, không thừa |
| Provenance | Đúng, assert cả `provenanceId` và `confidence: "A"` |
| Không định lượng hoá | Guard runtime có giá trị thật (chặn cả trường hợp `as any` lách qua type system), không hoàn toàn dư thừa so với type-check |
| Determinism | Mạnh hơn thông thường — không chỉ `toEqual` mà còn `not.toBe` xác nhận object mới mỗi lần, không share state |
| **"KHÔNG mutate input"** | **Gần như vacuous** — input là string primitive, JS đảm bảo bất biến bằng ngôn ngữ, test này không thể fail dù implementation có lỗi gì khác. Khác hẳn ý nghĩa thật của "purity test" ở A1 (nơi input là OBJECT, có nguy cơ mutate thật). Không sai, nhưng gần như không thêm giá trị regression-guard nào |
| Invalid input throw | Dùng `toThrow()` KHÔNG kèm message cụ thể — ĐÚNG mức độ, vì message hiện tại đến từ package khác (`@thien-anh/rule-engine`), assert message cụ thể sẽ coupling test vào implementation detail không thuộc package này (xem mục 4) |
| Golden chart xác nhận bẫy có thật | Rất tốt — không giả định, tự PROVE `napAm.element ("Hỏa") ≠` hành thật của Chi ("Thổ") bằng dữ liệu thật trước khi dùng nó làm regression case |
| computeWangShuai dùng đúng monthPillar.chi qua golden chart | Tốt, integration-level, bổ sung cho unit-level ở mục mapping 12 Chi |

**KẾT LUẬN: Test quality PASS**, với 1 ghi nhận non-blocking (test "no mutation" ít giá trị thực chất do bản chất input là primitive — không cần bổ sung gì, chỉ là quan sát, không yêu cầu sửa).

---

## 9. Bảng Tổng Kết

| Area | Verdict |
|---|---|
| Semantics | PASS |
| Algorithm Spec §11 | PASS |
| Confidence | **A — JUSTIFIED** |
| sourceId | PASS |
| Error handling | PASS (an toàn), non-blocking style gap |
| Purity | PASS (determinism mạnh; "no-mutation" test vacuous nhưng vô hại) |
| Architecture | PASS |
| Provenance scope | PASS |
| A1 regression | PASS (0 diff) |
| 11-B regression | PASS (0 diff) |
| Tests | PASS |
| Typecheck/build | PASS |

**Không có finding nào ở mức CORRECTION REQUIRED.** 2 finding non-blocking (documentation cho confidence A ở mục 2; dedicated error type cho error handling ở mục 4) — cả 2 đều là hardening, không ảnh hưởng correctness hiện tại, không cần sửa trước freeze.

**A3 có thể chuyển sang FREEZE.**

---

**A3 INDEPENDENT AUDIT COMPLETE — NO CODE CHANGES**
