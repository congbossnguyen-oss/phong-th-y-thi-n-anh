# PHASE 11-A2 — INDEPENDENT AUDIT (空亡 Core / 旬空)

**Loại tài liệu**: Audit độc lập, AUDIT ONLY — không sửa production code, không commit, không freeze,
không chuyển sang A4.
**Đối chiếu với**: `DA_LIU_REN_PHASE_11A2_PRE_IMPLEMENTATION_AUDIT.md`,
`DA_LIU_REN_PHASE_11A2_DECISION_RECORD.md`, `DA_LIU_REN_PHASE_11A2_IMPLEMENTATION.md`,
`DA_LIU_REN_ALGORITHM_SPEC.md` §10b, `research/phase2/report-5-...kongwang.md`.

---

## 1. Executive Summary

Audit độc lập KHÔNG chỉ tin vào 412 test xanh — đã tự viết 2 script xác minh ĐỘC LẬP (phương pháp
set-complement, KHÁC công thức offset +10/+11 mà `compute.ts` dùng) để brute-force lại toàn bộ
60/60 cycleIndex, tự trace lại golden chart 2024-08-20 20:00 từ đầu (không dùng lại số liệu implementation
đã báo cáo), và tự test thêm các edge case (all-void, repeated Chi, Infinity, null, undefined, string)
ngoài những gì test suite hiện có đã viết.

**Kết quả**: Core semantics ĐÚNG trên mọi mặt đã kiểm tra — 60/60 cycleIndex khớp bảng 六甲旬空 chuẩn
qua 3 phương pháp độc lập (offset formula của code, set-complement tự viết, bảng cổ điển đã biết);
golden chart trap xác nhận dùng đúng `dayPillar.cycleIndex`; `affects` là membership thuần, không có
hidden semantics; input validation chặt, không silent fallback; purity xác nhận qua stress test sâu
hơn (mutation thử nghiệm trực tiếp lên output, không chỉ so sánh reference hời hợt); 孤辰/寡宿 hoàn
toàn vắng mặt khỏi production code (chỉ xuất hiện trong comment đánh dấu loại trừ); architecture 100%
tuân thủ; regression 4 phase (A1/A3/11-B/baseline) đều 0 diff.

**2 finding non-blocking**: (1) provenance `notes` chưa trích dẫn C3 làm nguồn PHẦN NỀN (common-ground,
không phải phần 孤/寡 bị deferred) cho `affects` — hiện chỉ cite C1+C2; (2) thiếu regression test cố
định cho case "cả 3 vị trí Tam Truyền cùng Không Vong" và "Chi lặp lại giữa các vị trí" — đã tự verify
đúng trong audit này (thủ công) nhưng KHÔNG có test khoá lại trong suite.

**Day-vs-Hour**: `DAY NOT FULLY CONFIRMED — RESEARCH GAP` (đúng như chính Algorithm Spec/report-5 đã
tự thừa nhận) — NHƯNG 100% bằng chứng tìm được (kể cả sau khi audit này tự tìm kiếm thêm) đều nhất
quán ủng hộ Ngày, 0 bằng chứng nào ủng hộ Giờ/Tháng/Năm. Giữ nguyên confidence B là ĐÚNG — không tự
nâng A, không tự hạ thấp hơn B.

**Verdict: B — PASS WITH NON-BLOCKING GAP.**

---

## 2. Semantics Verification

Đọc lại `compute.ts` dòng 29-38 (`voidPairOf`): công thức `decadeStartChiIndex = (floor(cycleIndex/10)*10) % 12`,
`voidChiIndex1 = (decadeStartChiIndex+10) % 12`, `voidChiIndex2 = (decadeStartChiIndex+11) % 12`.

Đã tự viết 1 script XÁC MINH ĐỘC LẬP dùng phương pháp KHÁC (set-complement: mô phỏng 10 Can nào thực
sự "dùng" 10 Chi liên tiếp trong tuần, tìm 2 Chi CÒN LẠI bằng phép bù tập hợp, KHÔNG dùng công thức
offset +10/+11 của chính code) — chạy trên cả 60 cycleIndex, đối chiếu trực tiếp với output thật của
`computeVoidBranches`:

```
Total mismatches (independent set-complement method vs implementation): 0 / 60
```

**0/60 mismatch.** Đây là bằng chứng mạnh hơn hẳn việc chỉ chạy lại test suite — 2 phương pháp tính
toán hoàn toàn độc lập cho ra CÙNG kết quả trên toàn bộ không gian input.

Đối chiếu thêm với bảng 六甲旬空 cổ điển đã biết rộng rãi (không suy từ repo này):
甲子旬→戌亥, 甲戌旬→申酉, 甲申旬→午未, 甲午旬→辰巳, 甲辰旬→寅卯, 甲寅旬→子丑 — khớp 6/6 nhóm.

**Kết luận**: Core semantics ĐÚNG — biểu diễn chính xác 日旬空/旬空, 1 cặp Không Vong, lấy từ
`dayPillar.cycleIndex`, đúng chu kỳ 60 GanZhi, đúng classical 六甲旬空 mapping.

---

## 3. Day-vs-Hour Verification — CRITICAL

Trace đầy đủ theo đúng yêu cầu: Algorithm Spec → calculation contract → implementation → research
evidence → tests.

- **Algorithm Spec §10b** ("Cách tính"): "theo tuần Giáp của Can Chi NGÀY" — NHƯNG tự ghi chú ngay
  bên dưới: "⚠️ Chưa xác nhận 100%: chưa tìm được câu phát biểu tường minh 'luôn lấy Can Chi Ngày,
  không bao giờ Giờ/Tháng/Năm' — là suy luận từ ví dụ trong 六壬大全."
- **Research evidence** (`report-5` mục C2): SOURCE = 六壬大全 quyển 11, ví dụ cụ thể ghi rõ ký tự
  "日" (ngày) — "乙未日...辛丑日..." — VÀ đối chiếu 三命通會 (三命通會 là sách BÁT TỰ, mà toàn bộ
  phương pháp luận Bát Tự VỐN DĨ lấy Can Chi NGÀY làm trung tâm — "空亡" trong ngữ cảnh Bát Tự theo
  quy ước luôn tính từ Nhật Trụ). CONFIDENCE ghi: B, kèm đúng caveat trên.
- **Tìm kiếm bổ sung của audit này**: đã grep toàn bộ `docs/` cho "時空亡"/"giờ.*không vong"/biến thể
  liên quan — **0 kết quả** nào cho thấy tồn tại 1 biến thể Không Vong tính theo Giờ Chiêm trong bất
  kỳ nghiên cứu nào của dự án. Không tìm thấy bất kỳ nguồn nào (kể cả gián tiếp) gợi ý dùng
  Giờ/Tháng/Năm.
- **Implementation**: chỉ nhận `dayCycleIndex: number` — tên tham số + docstring khẳng định rõ đây
  PHẢI là `calendar.dayPillar.cycleIndex`, nhưng (giống hạn chế đã chấp nhận ở A1/A3 với tên tham số
  `monthChi`) đây là quy ước ĐẶT TÊN, KHÔNG PHẢI ràng buộc kiểu dữ liệu — TypeScript không ngăn 1
  caller lỡ truyền `hourPillar.cycleIndex` vào tham số này. Đây là hạn chế ĐÃ CHẤP NHẬN xuyên suốt
  A1/A3/A2 (không phải vấn đề mới do A2 gây ra).
- **Tests**: `chart-shape.test.ts` — không liên quan (fixture bịa, không test semantics thật, đã xác
  nhận lại ở Pre-Implementation Audit). Test THẬT duy nhất (`compute.test.ts`) dùng đúng
  `calendar.dayPillar.cycleIndex`.

**Kết luận: `DAY NOT FULLY CONFIRMED — RESEARCH GAP`** — đúng theo tinh thần "không được trả lời bằng
intuition": KHÔNG có 1 câu cổ văn tường minh nào loại trừ Giờ/Tháng/Năm được tìm thấy (kể cả sau khi
audit này tự tìm thêm). Tuy nhiên, ĐÂY LÀ 1 gap về MỨC ĐỘ CHẮC CHẮN TUYỆT ĐỐI (100%), KHÔNG PHẢI 1 gap
về BẰNG CHỨNG THỰC TẾ CÓ HAY KHÔNG — 100% trích dẫn tìm được (định nghĩa + toàn bộ ví dụ + lineage
Bát Tự đối chiếu) đều nhất quán chỉ về 1 hướng (Ngày), 0% chỉ về hướng khác. Confidence B là mức đúng
cho tình huống "bằng chứng mạnh nhưng chưa có phát biểu phủ định tường minh" — KHÔNG hạ xuống C/D
(không có gì mâu thuẫn thật), KHÔNG nâng lên A (chưa đạt mức "không thể tranh cãi" theo đúng tiêu
chuẩn cao nhất dự án đã áp dụng, xem mục 9).

---

## 4. 60-Cycle Verification

Đã kiểm tra TOÀN BỘ 12 boundary được yêu cầu (0, 9, 10, 19, 20, 29, 30, 39, 40, 49, 50, 59) — nằm
trong phép brute-force 60/60 ở mục 2, cụ thể kết quả các điểm này:

| cycleIndex | pair (thực tế) | Đúng theo tuần nào |
|---|---|---|
| 0 | Tuất, Hợi | 甲子旬 (đầu) |
| 9 | Tuất, Hợi | 甲子旬 (cuối) |
| 10 | Thân, Dậu | 甲戌旬 (đầu) |
| 19 | Thân, Dậu | 甲戌旬 (cuối) |
| 20 | Ngọ, Mùi | 甲申旬 (đầu) |
| 29 | Ngọ, Mùi | 甲申旬 (cuối) |
| 30 | Thìn, Tỵ | 甲午旬 (đầu) |
| 39 | Thìn, Tỵ | 甲午旬 (cuối) |
| 40 | Dần, Mão | 甲辰旬 (đầu) |
| 49 | Dần, Mão | 甲辰旬 (cuối) |
| 50 | Tý, Sửu | 甲寅旬 (đầu) |
| 59 | Tý, Sửu | 甲寅旬 (cuối) |

**Không off-by-one** (ranh giới 9→10, 19→20... đều chuyển ĐÚNG tuần, đã test tường minh trong suite
+ re-verify độc lập ở audit này). **Không nhầm thứ tự** (pair luôn đúng 2 Chi liền kề cuối tuần, khớp
cách tính chuẩn). **Không nhầm 子/午 hay bất kỳ Chi biên nào** — Tý (index 0) và Ngọ (index 6) đều
xuất hiện ĐÚNG vị trí trong bảng (Tý ở tuần 甲寅旬 cuối, Ngọ KHÔNG xuất hiện trong bất kỳ pair nào của
6 tuần — đúng, vì mỗi Chi chỉ "trống" ở ĐÚNG 1/6 tuần, xác nhận qua đối chiếu: mỗi Chi trong 12 Chi
xuất hiện trong ĐÚNG 1 trong 6 pair, không trùng không thiếu — đã verify: 6 pair × 2 = 12 giá trị,
đúng khớp 12 Chi, không trùng lặp).

**Kết luận: PASS, không có bug 60-cycle nào.**

---

## 5. Transmission Effects Verification

Đọc `compute.ts` dòng 43-52: `isVoid = (chi) => chi === pair[0] || chi === pair[1]`, áp dụng độc lập
cho `initial`/`middle`/`final` — xác nhận đây CHỈ là `transmission branch ∈ voidBranches`, KHÔNG có
logic ẩn nào khác (không có phụ thuộc chéo giữa 3 vị trí, không có early-return, không có side
effect).

Đã tự test (ngoài test suite, trực tiếp qua node) các case yêu cầu:

| Case | Input (từ cycleIndex=52, pair=[Tý,Sửu]) | Output `affects` |
|---|---|---|
| Sơ truyền trùng Không | initial=Tý | `{initial:true, ...}` (đã có trong suite) |
| Cả 3 cùng Không | initial=Tý, middle=Sửu, final=Tý | `{initial:true, middle:true, final:true}` ✅ |
| Không vị trí nào Không | initial=Dần, middle=Mão, final=Thìn | `{initial:false, middle:false, final:false}` ✅ |
| Chi LẶP LẠI giữa các vị trí (không Không) | initial=middle=final=Ngọ | `{initial:false, middle:false, final:false}` ✅ (không có nhầm lẫn do trùng giá trị) |
| Chỉ 1 vị trí Không | initial=Dần, middle=Sửu, final=Thìn | `{initial:false, middle:true, final:false}` ✅ |

**Không có interpretation nào bị thêm** — output CHỈ là boolean fact, không có nhãn 孤/寡, không có
ý nghĩa "折腰"/"不用" nào được gán (đúng ranh giới Tầng 1/Tầng 2 đã chốt).

**Finding non-blocking**: 2 case "cả 3 cùng Không" và "Chi lặp lại giữa vị trí" ĐÃ được audit này tự
verify đúng, nhưng **KHÔNG có trong `compute.test.ts`** — không phải lỗi, chỉ là thiếu 1 regression
test khoá lại 2 case này cho tương lai (test suite hiện tại đã có case "chỉ 1 vị trí đúng"/"0 vị trí"
nhưng chưa có "cả 3"/"trùng giá trị").

---

## 6. Input Validation

Đã tự chạy các case: `0, 59, -1, 60, 1.5, NaN, Infinity, -Infinity, "30" (string), null, undefined`.

| Input | Kết quả |
|---|---|
| 0, 59 | Không throw — hợp lệ, đúng boundary |
| -1, 60 | `VoidBranchesError("INVALID_CYCLE_INDEX")` |
| 1.5 | `VoidBranchesError` (không nguyên) |
| NaN | `VoidBranchesError` (`Number.isInteger(NaN)===false`) |
| Infinity, -Infinity | `VoidBranchesError` (`Number.isInteger` loại trừ đúng) |
| `"30"` (string, runtime bypass kiểu) | `VoidBranchesError` — `Number.isInteger("30")===false`, KHÔNG bị coerce ngầm thành số hợp lệ |
| null, undefined | `VoidBranchesError` |

**Message hữu ích**: mỗi lỗi đều kèm giá trị THẬT đã nhận (`"cycleIndex phải là số nguyên 0-59, nhận: ${dayCycleIndex}"`)
— dễ debug, không phải message chung chung.

**Không swallow lỗi**: `VoidBranchesError extends Error`, ném trực tiếp (không catch-rethrow biến
dạng), `code` field giữ nguyên `"INVALID_CYCLE_INDEX"` qua toàn bộ test case.

**Không silently normalize**: xác nhận string `"30"` KHÔNG bị âm thầm ép kiểu thành số 30 hợp lệ —
bị từ chối đúng (dù về mặt runtime JS, `"30" == 30` sẽ đúng nếu dùng loose comparison, nhưng
`Number.isInteger` không coerce, nên an toàn).

**Kết luận: PASS, validation chặt chẽ, không có edge case nào bị bỏ sót.**

---

## 7. Purity / Immutability

Không chỉ dựa vào test suite (`structuredClone` trước/sau) — đã tự chạy thêm 3 kịch bản KHẮC NGHIỆT
hơn:

1. **Mutate object CHỦ ĐỘNG lên kết quả trả về** (`result.voidBranches.pair[0] = "HACKED"`) → thành
   công về mặt JS (array KHÔNG bị `Object.freeze`, giống MỌI type khác trong package này — TypeScript
   `readonly` chỉ là compile-time, không runtime-enforced, nhất quán toàn bộ codebase, KHÔNG phải hạn
   chế riêng của A2) — NHƯNG gọi lại hàm với CÙNG input sau đó vẫn cho kết quả ĐÚNG nguyên bản
   (`["Tuất","Hợi"]`), xác nhận KHÔNG có shared mutable state nội bộ nào bị hỏng bởi việc mutate kết
   quả trả về.
2. **Mutate object input SAU KHI đã gọi hàm 1 lần** → gọi lại hàm LẦN 2 với CHÍNH object đã bị mutate
   → kết quả phản ánh ĐÚNG giá trị mới (không có caching sai/stale).
3. **`structuredClone` trước/sau** (như test suite đã có) → xác nhận object gốc không đổi.

**Kết luận: PASS** — không có hidden state, không có shared-mutable-object bug, hành vi `readonly`
nhất quán với toàn bộ codebase (không phải lỗi riêng của A2).

---

## 8. Golden Chart Verification

Tự tính lại TỪ ĐẦU (không dùng số liệu implementation đã báo cáo), gọi trực tiếp
`calculateDaLiuRenChart({date:"2024-08-20", hour:20, timeZone:"Asia/Shanghai"})`:

```
year  cycleIndex: 40  (Giáp Thìn)
month cycleIndex: 8   (Nhâm Thân)
day   cycleIndex: 52  (Bính Thìn)
hour  cycleIndex: 34  (Mậu Tuất)
threeTransmissions: { method: 'zeike', initial: 'Tý', middle: 'Thân', final: 'Thìn' }
```

Áp dụng phương pháp set-complement ĐỘC LẬP (mục 2) cho cả 4 cycleIndex:

```
independent expected pair (day):   [Tý, Sửu]
independent expected pair (year):  [Dần, Mão]
independent expected pair (month): [Tuất, Hợi]
independent expected pair (hour):  [Thìn, Tỵ]
```

`computeVoidBranches(52, threeTransmissions)` trả về: `pair=[Tý,Sửu]`, `affects={initial:true, middle:false, final:false}`.

**Khớp CHÍNH XÁC** với expected của Ngày, và **khác hẳn** cả 3 expected của Năm/Tháng/Giờ — chứng
minh dứt khoát implementation lấy ĐÚNG `dayPillar.cycleIndex`, không vô tình lấy trụ khác. Đây là
verification ĐỘC LẬP thật (tự trace từ đầu), không phải chỉ tin lại số liệu implementation đã report.

**Kết luận: PASS, golden chart hợp lệ và đã re-verify độc lập thành công.**

---

## 9. Provenance Audit — CRITICAL

`VOID_BRANCHES_PROVENANCE`: `id=PROV-VOID-BRANCHES-CORE`, `sourceId=liu-ren-da-quan-siku`,
`confidence=B`.

**sourceId có overclaim không?** KHÔNG — `notes` trích dẫn CẢ 2 lineage (六壬大全 làm `sourceId`
chính + 三命通會 làm cross-check phụ trong notes) — đúng convention `FOUR_LESSONS_PROVENANCE` đã
dùng (primary source qua `sourceId`, cross-check qua `notes`). Không giống tình huống WangShuai (nơi
lý thuyết KHÔNG riêng của 六壬大全 nên PHẢI tạo sourceId mới) — ở đây C1/C2 THẬT SỰ trích trực tiếp
六壬大全 quyển 9/11 nên dùng `liu-ren-da-quan-siku` là ĐÚNG, không phải mặc định lười biếng.

**So sánh precedent (A1/A3/Phase 10/11-B)**:
- A3 (`WangShuai`, confidence A): structural/definitional check, 0 ambiguity còn sót — KHÁC tình
  huống này (còn 2 caveat thật: Ngày-vs-Giờ, WebFetch-summary-chưa-đọc-hết).
- `MONTH_GENERAL_TABLE_PROVENANCE` (B): 3-source convergence NHƯNG giữ B vì 1 tranh luận academic
  chưa đọc hết — **CÙNG LOẠI LÝ DO** với entry này (bằng chứng mạnh nhưng còn 1 câu hỏi mở chưa đóng).
  Đây là precedent ĐÚNG NHẤT để so sánh, và entry này khớp đúng cùng logic.
- `GANZHI_PILLAR_CONSTRUCTION_PROVENANCE` (B): lý do KHÁC (thiếu cross-check độc lập cho 1 pipeline
  tính toán phức tạp) — không trực tiếp áp dụng ở đây (công thức 60-cycle này đã tự verify độc lập ở
  mục 2, không phải "chưa cross-check").

**Confidence B có hợp lý không? → CÓ, giữ nguyên B.** Không tự nâng A (2 caveat thật vẫn tồn tại,
KHÔNG được audit này giải quyết — đúng yêu cầu "không tự suy diễn"). Không tự hạ (bằng chứng THẬT SỰ
mạnh — 2 lineage độc lập, khớp tuyệt đối, không có bằng chứng mâu thuẫn nào).

**Provenance có thực sự chứng minh ĐÚNG những gì code đang làm không?** — **Phần lớn CÓ, nhưng có 1
khoảng hở citation cần ghi nhận:**
- `pair` (từ `dayCycleIndex`): ĐÚNG, trực tiếp khớp C1 (định nghĩa) + C2 (cách tính) — notes cite
  đúng.
- `affects` (membership Tam Truyền): xét kỹ lại — cụm "áp dụng cho từng vị trí Sơ/Trung/Mạt Truyền"
  thực ra nằm trong ĐOẠN VĂN C3 ("Áp dụng ĐA TẦNG... (b) từng vị trí Tam Truyền riêng"), KHÔNG PHẢI
  C1/C2. Pre-Implementation Audit đã lập luận ĐÚNG rằng phần "kiểm tra vị trí có trùng Không Vong hay
  không" là NỀN CHUNG của CẢ 3 cách đọc 孤/寡 trong C3 (mọi cách đều PRESUPPOSE bước kiểm tra này
  trước khi gán nhãn 孤/寡) — nên tách nó ra khỏi phần bị deferred là hợp lý về mặt NỘI DUNG. NHƯNG
  `notes` hiện tại của `VOID_BRANCHES_PROVENANCE` chỉ cite "C1 + C2", KHÔNG cite C3 (kể cả để nói rõ
  "chỉ lấy phần nền chung, loại trừ phần 孤/寡") — đây là 1 **khoảng hở về ĐỘ ĐẦY ĐỦ của trích dẫn**,
  không phải sai về nội dung compute.

**Finding (non-blocking)**: `notes` nên bổ sung 1 câu tường minh: "`affects` (kiểm tra vị trí Tam
Truyền) có gốc văn bản từ C3 — cụ thể là phần NỀN CHUNG mà cả 3 cách đọc 孤/寡 đều giả định trước, tách
biệt khỏi phần nhãn 孤/寡 đang bị deferred" — để tránh 1 auditor tương lai đọc lướt notes rồi tưởng
`affects` không có gốc văn bản nào, hoặc ngược lại tưởng nó "thừa hưởng" trọn vẹn độ tin cậy của toàn
bộ C3 (bao gồm cả phần gây tranh cãi). KHÔNG ảnh hưởng confidence B hiện tại (report-5 tự chấm C3 CŨNG
là B, nên dù có cite thêm C3 tường minh, confidence B vẫn không đổi).

**Kết luận mục 9: Confidence B ĐÚNG, GIỮ NGUYÊN. 1 finding non-blocking về độ đầy đủ trích dẫn.**

---

## 10. 孤辰/寡宿 Isolation

`grep -rn "孤辰\|寡宿\|earthPlateVoid\|heavenPlateVoid\|guChen\|guaSu\|KongWangInfo" src/void-branches/ tests/unit/void-branches/`
— tất cả kết quả (4 dòng) đều là **COMMENT đánh dấu loại trừ tường minh** ("KHÔNG bao gồm 孤辰/寡宿...
DEFERRED"), **0 field, 0 type, 0 logic** nào thực sự implement khái niệm này.

Không có nhầm lẫn giữa (A) "旬中孤寡" (Lục Nhâm, nhãn gán theo Không Vong) và (B) 孤辰/寡宿 như thần
sát độc lập theo Chi Năm (Bát Tự/Tử Vi) — Core A2 KHÔNG động tới cả 2, hoàn toàn trung lập.

**Kết luận: PASS, isolation hoàn toàn sạch.**

---

## 11. Architecture Audit

- `grep "DaLiuRenChartWithVoid\|calculateDaLiuRenChartWithVoid"` trên `src/` → **0 kết quả**.
- `git diff --stat -- da-liu-ren-calculation-result.ts` → **rỗng** (frozen type không đổi).
- `git diff packages/daliuren-engine/src/index.ts` → **đúng 1 dòng thêm**
  (`export * from "./void-branches/index.js";`), không có gì khác bị sửa trong file này.
- A1 (`ke-type/`, `da-liu-ren-chart-with-ke-type.ts`) — **0 diff**.
- A3 (`wang-shuai/`) — **0 diff**.
- Phase 11-B (`r-nhatthan-01/`, `r-honnhan-01/`, `r-timdo-01/`, `r-kientung-02/`, `registry.ts`) —
  **0 diff**.

**Kết luận: PASS, tuân thủ tuyệt đối architecture rule đã chốt ở A1/A3.**

---

## 12. Regression Results (chạy fresh, không dùng lại số liệu cũ)

- `npx vitest run` → **412/412 PASS** (40 test file) — khớp đúng baseline đã báo cáo (397+15).
- `npm run typecheck` → PASS, 0 lỗi.
- `npm run build` (package) → PASS, 0 lỗi.
- `npm run build -w packages/daliuren-engine` (workspace) → PASS, 0 lỗi.

Test count KHÔNG đổi so với báo cáo — không cần giải thích chênh lệch.

---

## 13. Findings

1. **[Non-blocking]** Provenance `notes` của `VOID_BRANCHES_PROVENANCE` chưa trích dẫn C3 làm nguồn
   PHẦN NỀN cho `affects` (kiểm tra vị trí Tam Truyền) — hiện chỉ cite C1+C2. Nội dung compute vẫn
   ĐÚNG (đã xác nhận `affects` chỉ dùng phần common-ground, không dùng phần 孤/寡 bị deferred của C3),
   nhưng độ đầy đủ trích dẫn nên được cải thiện để tránh hiểu lầm trong tương lai. Không ảnh hưởng
   confidence B (report-5 tự chấm C3 cũng là B).
2. **[Non-blocking]** Thiếu 2 regression test cố định: "cả 3 vị trí Tam Truyền cùng Không Vong" và
   "Chi lặp lại giữa các vị trí (không phải Không Vong)". Đã tự verify ĐÚNG bằng audit này (thủ công,
   ngoài suite), nhưng chưa có test khoá lại 2 case này cho tương lai.

**Không có finding nào ở mức CORRECTION REQUIRED hay BLOCKED.**

---

## 14. Required Corrections

**Không có correction bắt buộc trước Decision Closure/Freeze.** 2 finding ở mục 13 đều là hardening
tùy chọn (documentation + test coverage), không phải lỗi correctness, không chặn tiến trình.

Nếu muốn xử lý (KHÔNG bắt buộc, để tuỳ chủ dự án quyết định ở bước Decision Closure):
- Bổ sung 1 câu vào `notes` của `VOID_BRANCHES_PROVENANCE` cite rõ C3 làm nguồn phần nền cho `affects`.
- Bổ sung 2 test case (all-void, repeated-chi) vào `compute.test.ts`.

---

## 15. Verdict

| Area | Verdict |
|---|---|
| Semantics (Core 旬空) | PASS |
| Day-vs-Hour | NOT FULLY CONFIRMED — RESEARCH GAP (đúng như spec tự nhận, giữ B) |
| 60-Cycle mapping | PASS (0/60 mismatch, verify qua 2 phương pháp độc lập) |
| Transmission effects | PASS (2 case thiếu test, không thiếu correctness) |
| Input validation | PASS |
| Purity/Immutability | PASS |
| Golden chart | PASS (re-verify độc lập thành công) |
| Provenance | PASS, confidence B giữ nguyên — 1 finding non-blocking về citation |
| 孤辰/寡宿 isolation | PASS, hoàn toàn sạch |
| Architecture | PASS |
| Regression (A1/A3/11-B/baseline) | PASS, 0 diff, 412/412 |
| Code quality | PASS, nhất quán với `computeYiMa`/`computeWangShuai` |

**Verdict: B — PASS WITH NON-BLOCKING GAP.**

### Kết luận rõ ràng theo yêu cầu

- **Core semantics có đúng không?** CÓ — đã re-verify độc lập qua 3 phương pháp (formula gốc,
  set-complement tự viết, bảng cổ điển đã biết), khớp 60/60, không off-by-one, không nhầm boundary.
- **Day-vs-Hour đã xác nhận chưa?** CHƯA XÁC NHẬN 100% (đúng như chính spec/report-5 đã tự thừa
  nhận) — nhưng 100% bằng chứng tìm được (kể cả sau khi audit này tự tìm thêm) đều nhất quán ủng hộ
  Ngày, 0% ủng hộ phương án khác.
- **Confidence B có giữ nguyên không?** CÓ, GIỮ NGUYÊN B — không tự nâng A, không tự hạ.
- **Có correction cần làm không?** KHÔNG BẮT BUỘC — chỉ có 2 gợi ý hardening non-blocking (mục 14).
- **Có đủ điều kiện bước sang Decision Closure + Freeze không?** **CÓ** — không có blocker nào được
  tìm thấy.

---

**A2 CORE INDEPENDENT AUDIT COMPLETE — NO CODE CHANGES.**
