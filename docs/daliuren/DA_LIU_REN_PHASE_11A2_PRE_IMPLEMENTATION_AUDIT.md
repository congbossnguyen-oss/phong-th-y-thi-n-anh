# PHASE 11-A2 — 空亡 (KHÔNG VONG) — PRE-IMPLEMENTATION AUDIT

**Loại tài liệu**: Audit độc lập, AUDIT ONLY — không implement, không sửa production code, không sửa
test, không sửa spec.
**Bối cảnh**: A1 (課體) và A3 (旺衰) đã FROZEN (commit A1: `ecbd6ae4...`, A3: `1d19d0a7...`).
Phase 11-B đã FROZEN. Tuyệt đối không đụng 3 phase này.

---

## 1. Executive Summary

Audit này tìm thấy **1 phát hiện MỚI, sâu hơn** những gì Pre-Implementation Audit Phase 11-A trước
đó (`DA_LIU_REN_PHASE_11A_PRE_IMPLEMENTATION_AUDIT.md`) từng ghi nhận: mâu thuẫn giữa
`types/void-branches.ts` (1 cặp) và Algorithm Spec §10b (2 cặp `earthPlateVoid`/`heavenPlateVoid`)
**KHÔNG PHẢI đơn thuần "1 cặp vs 2 cặp"** — khi truy ngược tới nguyên văn cổ văn được trích dẫn
(`docs/daliuren/research/phase2/report-5-wangshuai-xingchonghehai-kongwang.md`, mục C3), phát hiện
chính 六壬大全 tự liệt kê **BA cách định nghĩa 孤/寡 khác nhau, không thống nhất** ("旬中孤寡有三"),
và Algorithm Spec §10b's `KongWangInfo` chỉ chọn LẶNG LẼ 1 trong 3 cách đó (Địa Bàn/Thiên Bàn) mà
không ghi nhận 2 cách còn lại. Ngoài ra, phát hiện **rủi ro trùng tên thuật ngữ thật**: "孤辰"/"寡宿"
trong ngữ cảnh Lục Nhâm (theo trích dẫn 六壬大全) là tên GÁN LẠI cho Không Vong theo bàn, HOÀN TOÀN
KHÁC với "孤辰/寡宿" như 1 cặp thần sát ĐỘC LẬP (tính theo Chi năm) phổ biến trong Bát Tự/Tử Vi —
`docs/daliuren/research/report-E-divination-skill.md` xác nhận 1 hệ thống khác dùng đúng 2 tên này
cho 1 khái niệm hoàn toàn không liên quan.

May mắn: phần LÕI (C1 định nghĩa + C2 cách tính, cả 2 CONFIDENCE B, đã khớp với chính
`types/void-branches.ts` hiện tại) **KHÔNG bị ảnh hưởng bởi mâu thuẫn 孤/寡** — 1 cặp Không Vong
tính từ Can Chi Ngày là well-evidenced, không tranh cãi. A4's nhu cầu `isVoid` (kiểm tra Dịch Mã có
trùng 1 trong 2 chi Không Vong) cũng CHỈ cần phần lõi này, không cần giải quyết 孤/寡.

**Verdict: READY WITH DOCUMENTED GAP.** Có thể code phần LÕI (1 cặp, theo `types/void-branches.ts`
hiện có) ngay — đủ để phục vụ A2 tối thiểu và A4's `isVoid`. Phần 孤辰/寡宿 (đa tầng Địa/Thiên Bàn)
phải hoãn lại, chờ 1 quyết định tường minh của chủ dự án (không phải quyết định kỹ thuật đơn thuần —
đây là chọn giữa 3 cách đọc cổ văn, hoặc loại bỏ hẳn).

---

## 2. Current Implementation Trace

Đã grep toàn bộ `src/` + `tests/` cho `void|空亡|旬空|孤辰|寡宿|VoidBranch|VoidPair|isVoid|kongWang`
(loại trừ false-positive khớp từ khóa `void` của TypeScript).

| File | Vai trò | Ghi chú |
|---|---|---|
| `src/types/void-branches.ts` | **Định nghĩa type thật, duy nhất** | `VoidBranches{pair: [Chi,Chi], affects:{initial,middle,final}}`. Comment: "2 chi Không Vong của tuần Giáp chứa Can Chi Ngày" — CHỈ mô tả 1 pair, KHÔNG nhắc 孤辰/寡宿 |
| `src/types/chart.ts` | Expose type (KHÔNG implement) | `Chart.voidBranches: VoidBranches` — nhưng `Chart` là type Checkpoint-1 CHƯA TỪNG có hàm `calculate()` dựng ra nó (đã xác nhận: **0 chỗ nào trong repo thực sự tạo 1 giá trị `Chart`** ngoài 1 test fixture thủ công) |
| `src/da-liu-ren-calculation-result.ts`, `src/calendar-foundation-result.ts`, `src/da-liu-ren-chart-with-ke-type.ts`, `src/index.ts` | Chỉ nhắc tên trong comment | Liệt kê `voidBranches` là 1 trong các field CHƯA implement — không có logic |
| `src/interpretation/rule-dependencies.ts` | `kongWang` trong `UnimplementedComponentId` union | Rule Engine (Level 2 gating) hiện coi Không Vong là CHƯA implement — 1 rule declare AVAILABLE cho nó sẽ bị từ chối đăng ký |
| `src/types/shen-sha.ts` | `ShenShaPlacement.isVoid: boolean` | Field CHỜ A2 — comment trỏ trực tiếp `DA_LIU_REN_PROVENANCE.md` Nút 10 ("馬空不能行", CONFIDENCE B) |
| `src/yi-ma/provenance.ts` | 1 câu loại trừ phạm vi | Notes tự xác nhận: provenance HIỆN TẠI của `computeYiMa` KHÔNG bao gồm bất kỳ quy tắc nào về Không Vong — "CHỈ vị trí" |
| `tests/unit/types/chart-shape.test.ts` | **Test type-SHAPE, KHÔNG phải test semantics** | Dòng 53: `voidBranches: { pair: ["Tuất","Hợi"], affects: {...} }` — giá trị TỰ BỊA cho compile-time smoke test, comment file tự nói rõ "KHÔNG PHẢI test thuật toán". **Không khoá bất kỳ semantics Không Vong thật nào** |

**Kết luận trace**:
- **1 file định nghĩa semantics thật**: `types/void-branches.ts` (chỉ type, chưa có hàm `computeXxx`).
- **0 hàm tính toán nào tồn tại** — chưa có `computeVoidBranches`/tương đương ở bất kỳ đâu.
- **0 bảng/cycle nào đã code** — không có `KONG_WANG_TABLE` hay tương tự.
- **0 test nào khoá semantics thật** — `chart-shape.test.ts` chỉ test compile được, không test tính đúng.
- **0 provenance entry nào tồn tại** — đã grep toàn bộ `src/*/provenance.ts`, không có entry nào tên
  `KONG_WANG`/`VOID`.
- **1 dependency thật đang chờ**: `shen-sha.ts` (`isVoid`) — nhưng KHÔNG có wiring code nào, chỉ type field.

---

## 3. Algorithm Spec §10b Analysis

Đọc lại nguyên văn `DA_LIU_REN_ALGORITHM_SPEC.md` §10 + §10b đầy đủ (dòng 147-189). Tách rõ theo
đúng yêu cầu Mục A (日旬空/旬空) vs Mục B (孤辰/寡宿):

### A. 日旬空 / 旬空 (Tuần Không theo Can Chi Ngày)

> "Định nghĩa: trong 1 tuần Giáp Tý (chu kỳ 60 Can Chi chia 6 tuần 10 ngày), 10 Thiên Can không đủ
> phối hết 12 Địa Chi → 2 Chi dư ra mỗi tuần là 'Không Vong' của tuần đó."
> "Cách tính: theo tuần Giáp của Can Chi Ngày (công thức toán học chu kỳ 60 Can-Chi phổ quát — Bát
> Tự dùng chung cơ chế này, KHÔNG PHẢI Lục Nhâm mượn từ Bát Tự...)."

Đây là khái niệm ĐƠN GIẢN, rõ ràng, **1 cặp Chi duy nhất** derive từ `dayPillar.cycleIndex` (vị trí
0-59 trong Lục Thập Hoa Giáp). Có 1 caveat spec TỰ ghi nhận (chưa xác nhận 100% luôn là Can Chi
Ngày, không bao giờ Giờ/Tháng/Năm) — xem mục 4.

### B. 孤辰 / 寡宿 (nhãn gán cho Không Vong theo Bàn)

> "Áp dụng đa tầng: (a) Không Vong trên Địa Bàn (孤辰) và trên Thiên Bàn (寡宿) tính riêng; (b) áp
> dụng cho từng vị trí Sơ/Trung/Mạt Truyền độc lập."
>
> ```ts
> interface KongWangInfo {
>   earthPlateVoid: [DiZhi, DiZhi];   // 孤辰
>   heavenPlateVoid: [DiZhi, DiZhi];  // 寡宿 (thường trùng giá trị nhưng vị trí khác)
>   transmissionsAffected: { initial: boolean; middle: boolean; final: boolean };
> }
> ```

**Đây LÀ 1 khái niệm khác A, KHÔNG PHẢI 1 phần MỞ RỘNG đơn giản của A** — nó là 1 lớp NHÃN GÁN
(labeling layer) ĐẶT LÊN TRÊN cùng 1 cặp Không Vong cơ bản (Mục A), chỉ định "gọi là gì" tuỳ theo
bàn/vị trí nào bị trúng. Comment `earthPlateVoid`/`heavenPlateVoid` "thường trùng giá trị nhưng vị
trí khác" gợi ý đây LÀ cùng 1 cặp Chi cơ bản, chỉ khác NƠI kiểm tra (Địa Bàn cố định vs Thiên Bàn đã
xoay) — nhưng interface khai 2 field GIÁ TRỊ riêng (`[DiZhi,DiZhi]` × 2) thay vì 1 pair chung + 2
vị trí kiểm tra, để ngỏ khả năng chúng THỰC SỰ khác giá trị trong 1 số trường hợp — **spec KHÔNG tự
giải thích rõ khi nào 2 giá trị này lệch nhau, nếu có** (xem mục 6, phát hiện quan trọng nhất của
audit này).

**Kết luận mục 3**: §10b đang GOM 2 khái niệm (A: cặp Không Vong cơ bản — B: nhãn 孤/寡 theo bàn)
vào 1 schema DUY NHẤT (`KongWangInfo`), khiến B trông như 1 PHẦN MỞ RỘNG TỰ NHIÊN của A, trong khi
thực chất — sau khi audit tới tận cổ văn gốc (mục 4) — B là 1 lớp diễn giải RIÊNG, có ÍT NHẤT 3 cách
đọc cổ văn khác nhau, không phải 1 công thức đơn giản duy nhất.

---

## 4. Classical/Research Evidence

Đã trace `types/void-branches.ts` → không có provenance file → tìm ngược qua `DA_LIU_REN_ALGORITHM_SPEC.md`
§10b → `docs/daliuren/DA_LIU_REN_INTERPRETATION_EVIDENCE.md` mục 9 → **nguồn gốc thật sự**:
`docs/daliuren/research/phase2/report-5-wangshuai-xingchonghehai-kongwang.md` PHẦN C (dòng 81-118).

### C1 — Định nghĩa (khớp Mục A ở trên)
- SOURCE: 六壬大全 quyển 9 + đối chiếu 三命通會 論空亡 (SK1610, sách Bát Tự — dùng ĐÚNG định nghĩa
  toán học giống hệt — 2 lineage độc lập).
- QUOTE: 三命通會 "有是位而無祿，曰空；有支而無干，曰亡".
- **CONFIDENCE: B.**

### C2 — Cách tính theo Can Chi Ngày (khớp Mục A)
- SOURCE: 六壬大全 quyển 11 (ví dụ cụ thể) + 三命通會.
- **CONFIDENCE: B** — kèm caveat: "chưa tìm câu phát biểu tường minh 'luôn lấy Can Chi Ngày' — là
  suy luận từ ví dụ, khuyến nghị xác nhận thêm liệu có dị bản dùng Can Chi GIỜ CHIÊM."

### C3 — "Áp dụng đa tầng" (khớp Mục B) — **PHÁT HIỆN QUAN TRỌNG NHẤT**
- SOURCE: 六壬大全 quyển 9, 11.
- QUOTE NGUYÊN VĂN (đã đọc trực tiếp trong report-5, không phải diễn giải lại):

  > "旬中孤寡有三：發用值旬空，陽空為孤，隂空為寡，**一也**。發用地盤空為孤，天盤空為寡，**二也**。
  > 發用空為孤，末傳空為寡，**三也**。"

  Dịch sát nghĩa: *"Trong việc luận Cô/Quả của tuần [Không], có BA cách: (1) khi Sơ truyền trúng
  Tuần Không — nếu chi Không là Dương thì gọi 孤 (Cô), Âm thì gọi 寡 (Quả); (2) khi vị trí Địa Bàn
  của Sơ truyền là Không thì gọi 孤, vị trí Thiên Bàn là Không thì gọi 寡; (3) khi Sơ truyền là Không
  thì gọi 孤, khi Mạt truyền là Không thì gọi 寡."*

  **Đây là BẰNG CHỨNG TRỰC TIẾP từ chính 六壬大全 rằng tồn tại 3 CÁCH ĐỌC 孤/寡 KHÔNG THỐNG NHẤT
  trong CHÍNH văn bản cổ này** — không phải 3 nguồn khác nhau tranh cãi, mà là 1 đoạn văn TỰ LIỆT KÊ
  3 truyền thống cùng tồn tại, KHÔNG chọn 1 cách nào là "đúng nhất". Đoạn quote thứ 2 (阻khác, về Trung
  truyền Không = "斷橋折腰") là nội dung LUẬN GIẢI (Tầng 2), không liên quan trực tiếp đến việc CHỌN
  cách nào trong 3 cách 孤/寡.

  **Algorithm Spec §10b's `KongWangInfo` CHỈ mã hoá đúng Cách (2)** (`earthPlateVoid`/`heavenPlateVoid`
  = Địa Bàn/Thiên Bàn) — **LẶNG LẼ bỏ qua Cách (1) (Dương/Âm) và Cách (3) (Sơ truyền/Mạt truyền)**
  mà KHÔNG ghi chú tại sao chọn Cách 2, hay liệu 2 cách kia có bị loại bỏ có chủ đích hay chỉ đơn
  giản là bị bỏ sót khi viết spec. Đây LÀ 1 "silently resolved ambiguity" — đúng loại vi phạm mà kỷ
  luật dự án (report don't silently resolve, đã áp dụng xuyên suốt Phase 11-B) đáng lẽ phải ghi nhận
  tường minh nhưng chưa từng được ghi.
- **CONFIDENCE ghi trong report-5: B** — NHƯNG kèm 1 caveat phương pháp áp dụng cho TOÀN BỘ report:
  "nhiều trích dẫn hạng B đến từ WebFetch tóm tắt (chưa tự đọc 100% nguyên văn)... khuyến nghị đọc
  lại trực tiếp Wikisource trước khi khóa cứng vào SPEC chính thức" — tức B này CHƯA phải mức đã
  verify đầy đủ theo tiêu chuẩn cao nhất của dự án.

### Rủi ro trùng tên thuật ngữ (phát hiện phụ, nhưng NGHIÊM TRỌNG cho tương lai)

`docs/daliuren/research/report-E-divination-skill.md` (audit 1 engine Lục Nhâm bên thứ 3 khác,
không liên quan trực tiếp tới report-5) liệt kê **孤辰/寡宿 như 1 CẶP THẦN SÁT ĐỘC LẬP** trong nhóm
"~8 thần sát được TÍNH nhưng KHÔNG BAO GIỜ được diễn giải ở bất kỳ đâu trong code" của engine đó,
đứng CHUNG NHÓM với 劫煞/華蓋/將星/月德/破碎/文昌 — đây đều là các thần sát CHUẨN, tính theo **Chi
NĂM** qua bảng tra cố định, **HOÀN TOÀN KHÔNG LIÊN QUAN đến cơ chế 60-Can-Chi/Không Vong**.

**Đây là 2 khái niệm dùng CHUNG 2 CHỮ HÁN NHƯNG NGHĨA KHÁC NHAU HOÀN TOÀN**:
- Nghĩa 1 (report-5, 六壬大全 trực tiếp): 孤辰/寡宿 = tên GÁN LẠI cho Không Vong theo Bàn (Cách 2
  trong 3 cách C3) — phụ thuộc `dayPillar` + vị trí Tam Truyền.
- Nghĩa 2 (report-E, phổ biến trong Bát Tự/Tử Vi nói chung): 孤辰/寡宿 = 2 sao ĐỘC LẬP, tra theo Chi
  NĂM sinh, ý nghĩa "cô đơn/quả phụ" trong lá số — KHÔNG liên quan Không Vong.

**Rủi ro cụ thể**: nếu implementer tương lai (kể cả AI) search "孤辰寡宿 công thức" mà không biết
phân biệt 2 nghĩa này, RẤT DỄ nhầm lẫn implement SAI theo bảng tra Chi-Năm (Nghĩa 2) trong khi ngữ
cảnh A2 đang cần Nghĩa 1 (Không Vong theo Bàn) — 2 công thức HOÀN TOÀN khác nhau, sai mà không có
lỗi runtime nào báo (giống hệt kiểu rủi ro "napAm vs Chi" đã gặp ở A3).

---

## 5. Source-of-Truth Matrix

| Candidate source | Nội dung | Đang được code dùng? | Có đủ evidence? | Có conflict? |
|---|---|---|---|---|
| `types/void-branches.ts` | 1 cặp `pair`, `affects` theo vị trí Tam Truyền | **Có** (type contract, chưa có compute) | Đủ cho phần LÕI (khớp C1+C2, CONFIDENCE B) | Không conflict với chính nó |
| `DA_LIU_REN_ALGORITHM_SPEC.md` §10b | `KongWangInfo` 2 field (earthPlateVoid/heavenPlateVoid) | Không (chưa implement) | **Không đủ** — chỉ mã hoá 1/3 cách đọc cổ văn (Cách 2), không giải thích tại sao loại 2 cách kia | **CÓ, nghiêm trọng** — mâu thuẫn schema với `void-branches.ts` (1 field vs 2 field) VÀ với chính nguồn nó trích (chỉ chọn 1/3 cách mà không ghi lý do) |
| `report-5` PHẦN C1/C2 | Định nghĩa + cách tính (1 cặp, theo Can Chi Ngày) | Gián tiếp (khớp `void-branches.ts`) | **Đủ** — B, 2 lineage độc lập (六壬大全 + 三命通會) | Không |
| `report-5` PHẦN C3 | "旬中孤寡有三" — 3 cách đọc 孤/寡 | Không | **Chưa đủ để chọn 1 cách** — cổ văn tự liệt kê 3 cách ngang hàng, không phân biệt cách nào chính | **CÓ** — 3 cách trong CHÍNH 1 nguồn |
| `report-E` (孤辰/寡宿 như thần sát độc lập) | Cảnh báo trùng tên, KHÔNG áp dụng trực tiếp cho A2 | Không | N/A (chỉ audit hệ thống KHÁC) | **CÓ rủi ro trùng tên**, không phải conflict semantics trực tiếp |
| `DA_LIU_REN_PROVENANCE.md` Nút 10 | isVoid cho 驛馬 ("馬空不能行") | Không (A4 field `isVoid` chờ) | Đủ (B) — CHỈ cần membership check với 1 cặp cơ bản | Không |
| `types/chart.ts` (`Chart.voidBranches`) | Tham chiếu type, không compute | Không (dead scaffolding, 0 nơi tạo giá trị `Chart` thật) | N/A | Không (chỉ tham chiếu `VoidBranches` hiện có) |
| `tests/unit/types/chart-shape.test.ts` | Fixture giá trị tự bịa cho compile test | Không (không test semantics) | N/A | Không (không assert tính đúng) |

---

## 6. Semantic Conflict Analysis

**Đây KHÔNG PHẢI đơn thuần "type có 1 field, spec có 2 field, chọn cái nào" như Pre-Implementation
Audit Phase 11-A trước đã nêu.** Sau khi truy tới tận cổ văn gốc, bản chất thật của mâu thuẫn là:

1. **Tầng LÕI (Mục A / C1+C2) — KHÔNG có mâu thuẫn.** 1 cặp Không Vong từ Can Chi Ngày, well-evidenced
   (B), khớp hoàn toàn giữa `types/void-branches.ts` và report-5. Có thể code NGAY với confidence B.

2. **Tầng NHÃN 孤/寡 (Mục B / C3) — CÓ 2 lớp mâu thuẫn chồng nhau:**
   - **(a) Mâu thuẫn NỘI TẠI trong 1 nguồn**: 六壬大全 tự liệt kê 3 cách đọc 孤/寡 không thống nhất
     ("有三"), Algorithm Spec chỉ chọn 1 cách (Địa/Thiên Bàn) mà không ghi lý do loại 2 cách kia.
   - **(b) Mâu thuẫn schema**: `types/void-branches.ts` (1 pair) vs `KongWangInfo` (2 field giá trị
     riêng) — do (a) chưa giải quyết nên (b) cũng chưa thể giải quyết dứt điểm (không rõ 2 field có
     nghĩa là 2 giá trị ĐỘC LẬP thật hay chỉ là 1 giá trị nhìn từ 2 vị trí).
   - **(c) Rủi ro trùng tên thuật ngữ** với 1 khái niệm HOÀN TOÀN khác (thần sát 孤辰/寡宿 theo Chi
     năm) — không phải mâu thuẫn NỘI DUNG, nhưng là rủi ro triển khai SAI nếu implementer không biết
     phân biệt.

**Đây KHÔNG PHẢI "cùng 1 khái niệm" (như audit trước có thể ngầm giả định) — cũng KHÔNG PHẢI "2
khái niệm hoàn toàn tách biệt" — mà là "1 schema abstraction RỘNG HƠN nhưng CHƯA ĐƯỢC XÁC ĐỊNH RÕ",
đúng theo đúng 3 khả năng brief đã nêu, và audit này xác nhận: đáp án là khả năng thứ 3 (schema
abstraction rộng hơn, cụ thể là NHÃN GÁN cho 1 fact Không Vong cơ bản), nhưng RỘNG THEO CÁCH NÀO
trong 3 cách cổ văn liệt kê thì VẪN CHƯA CHỐT.**

---

## 7. Minimal A2 Contract Candidate

**A2 tối thiểu (phần LÕI, well-evidenced, KHÔNG đụng 孤/寡) cần:**

- **Input tối thiểu**: `dayPillar.cycleIndex` (0-59, đã có sẵn trong `CalendarData`, xem
  `packages/calendar-core/src/calendar/ganzhi.ts` — `GanzhiPillar.cycleIndex`) — ĐỦ để xác định tuần
  Giáp và suy ra 2 chi dư. `can`+`chi` riêng lẻ CŨNG đủ (cycleIndex derive được từ đó) nhưng
  `cycleIndex` trực tiếp hơn cho phép tính "tuần" (decade group = `cycleIndex // 10`).
  - **KHÔNG cần** Can Ngày (chỉ Chi mới quyết định 2 chi Không Vong trong 1 tuần, nhưng CẦN biết
    ĐANG Ở tuần nào — mà việc đó lại cần biết CẢ Can lẫn Chi cùng lúc để xác định đúng cycleIndex
    0-59, vì chỉ riêng Chi Ngày không đủ phân biệt tuần nào trong 5 tuần có thể trùng Chi — cycleIndex
    đã gộp sẵn thông tin này). **KHÔNG tự chốt cần Can hay không nếu chỉ suy diễn — nhưng có thể xác
    nhận: cần đủ để xác định `cycleIndex`, không cần thêm gì khác (không cần Chi Giờ, không cần Chi
    Tháng/Năm) theo đúng C2.**

- **Output tối thiểu — CHỈ mô tả CÓ THỂ giống `types/void-branches.ts` hiện có, KHÔNG tự chốt shape
  mới:**

  ```ts
  // Ứng viên — audit KHÔNG chốt, chỉ mô tả field nào có evidence đủ (C1+C2):
  {
    voidBranches: VoidBranches; // TÁI DÙNG type đã có, không sửa
    provenanceId: string;
  }
  ```

  `VoidBranches.pair` khớp trực tiếp C1+C2 (well-evidenced). `VoidBranches.affects` (boolean theo
  initial/middle/final) là hệ quả TRỰC TIẾP, KHÔNG PHỤ THUỘC cách đọc 孤/寡 nào (chỉ là "vị trí Tam
  Truyền này có trùng 1 trong 2 chi Không Vong hay không" — 1 fact tồn tại BẤT KỂ chọn Cách 1/2/3 để
  gán nhãn 孤/寡 sau đó, hay thậm chí không gán nhãn nào cả).

- **KHÔNG bao gồm** (ngoài phạm vi A2 tối thiểu, theo đúng exclusion list đã cho): `earthPlateVoid`/
  `heavenPlateVoid`/bất kỳ field 孤辰/寡宿 nào — CHƯA đủ evidence để chọn 1/3 cách đọc, và tự chọn ở
  đây sẽ vi phạm nguyên tắc "không tự chọn nếu evidence chưa đủ".

---

## 8. A4 Dependency Analysis

Trace `src/yi-ma/compute.ts` (không sửa):

- **Input hiện tại**: `computeYiMa(chi: Chi): YiMaComputation` — CHỈ nhận 1 `Chi` (thường là Chi
  Ngày, theo cách gọi hiện có ở `nine-methods/compute.ts` dòng 343: `computeYiMa(fourLessons.lesson3.lower)`).
- **Output hiện tại**: `{ yiMa: Chi, provenanceId: string }` — CHỈ vị trí, KHÔNG có `isVoid`.
- **Provenance hiện tại**: `YI_MA_PROVENANCE` (id `PROV-YI-MA-POSITION`, CONFIDENCE B) — notes tự
  xác nhận KHÔNG bao gồm bất kỳ quy tắc Không Vong nào.
- **Chỗ nào cần `isVoid`?**: `types/shen-sha.ts` `ShenShaPlacement.isVoid: boolean` — field ĐÃ khai
  báo trong type contract (Checkpoint 1), CHỜ A2 để có dữ liệu tính. `DA_LIU_REN_PROVENANCE.md`
  Nút 10 xác nhận: check này là **membership đơn giản** — "Dịch Mã có trùng 1 trong 2 chi Không Vong
  hay không" — **KHÔNG cần 孤辰/寡宿**, chỉ cần `VoidBranches.pair` (phần LÕI, mục 7).
- **Có nên sửa `computeYiMa()` trong A4 hay không?**: Đây là 1 QUYẾT ĐỊNH kiến trúc, KHÔNG phải audit
  này (Phase 11-A2) trả lời — nhưng ghi nhận 2 khả năng cho A4 audit sau: (a) sửa `computeYiMa()` để
  trả thêm field `isVoid` (đòi hỏi thêm tham số `voidBranches` đầu vào — đổi chữ ký hàm ĐÃ có, cần
  audit riêng về backward-compat vì `computeYiMa` hiện ĐANG được gọi ở `nine-methods/compute.ts`,
  ẢNH HƯỞNG Phase 11-B indirectly nếu không cẩn thận); (b) để A4 tự làm 1 hàm MỚI riêng
  (`computeYiMaVoidStatus`/tương đương) nhận `yiMa: Chi` + `voidBranches: VoidBranches` làm input,
  KHÔNG đổi `computeYiMa()` — khớp đúng kiểu "pure primitive, additive" đã áp dụng cho A1/A3. **A2
  KHÔNG cần quyết định điều này — chỉ cần đảm bảo output A2 (`VoidBranches.pair`) đủ để BẤT KỲ
  phương án nào ở trên đều dùng được.**

---

## 9. Provenance Analysis

- **A2 có cần provenance entry mới không?** **CÓ** — đã grep toàn bộ `src/*/provenance.ts`, xác nhận
  KHÔNG có entry nào cho Không Vong. Đây là 1 fact TÍNH MỚI thật sự (không phải identity/rename như
  A1's `keType`), matching tình huống A3 (WangShuai) hơn là A1.
- **Confidence nên là gì, theo precedent nào?**
  - **KHÔNG phải A** — khác WangShuai (structural/definitional, 0 cách đọc khả dĩ). C2 (cách tính)
    có 1 caveat CHƯA XÁC NHẬN 100% (Can Chi Ngày vs Giờ) — giống loại "có unresolved caveat" của
    `MONTH_GENERAL_TABLE_PROVENANCE` (giữ B vì còn 1 tranh luận chưa đọc hết) hơn là loại "structural,
    0 ambiguity" của `FUYIN_FANYIN_ACTIVATION_PROVENANCE`.
  - **B** khớp đúng những gì report-5 (C1, C2) đã tự gán — 2 lineage độc lập (六壬大全 + 三命通會),
    nhưng chưa đạt A vì (a) caveat Ngày-vs-Giờ chưa giải quyết, (b) report-5 tự ghi nhận các trích
    dẫn B của mình "chưa tự đọc 100% nguyên văn", khuyến nghị đọc lại Wikisource trước khi khoá cứng.
- **sourceId nên là gì?** `liu-ren-da-quan-siku` (TÁI DÙNG, không tạo mới) — vì C1/C2 đều trích trực
  tiếp 六壬大全 quyển 9/11, giống đa số entry khác trong repo (KHÁC tình huống WangShuai, nơi lý
  thuyết KHÔNG riêng của 六壬大全 nên phải tạo sourceId mới — Không Vong LÀ 1 khái niệm có citation cụ
  thể tới đúng cuốn sách này).
- **Provenance có tái dùng được không?** KHÔNG có entry hiện hữu nào phù hợp để tái dùng (khác A1) —
  phải tạo entry mới nếu implement, NHƯNG entry đó CHỈ nên phủ phần LÕI (C1+C2) — audit này KHÔNG
  tự tạo bất kỳ provenance nào (chỉ phân tích, không implement).

---

## 10. Test Matrix

Đề xuất (KHÔNG viết code test) — theo đúng yêu cầu "phải kiểm tra đầy đủ 60 GanZhi hoặc 1 test
strategy có khả năng chứng minh toàn bộ 60 trường hợp":

1. **Determinism**: cùng `cycleIndex` → cùng `pair`, gọi nhiều lần.
2. **Đầy đủ 60 GanZhi** — vì chỉ có ĐÚNG 6 cặp Không Vong khác nhau (1 cặp / tuần × 6 tuần trong 60
   Giáp Tý), có 2 chiến lược tương đương đủ mạnh:
   - (a) Test brute-force cả 60 `cycleIndex` (0-59), assert mỗi giá trị map đúng 1-trong-6 cặp đã
     biết trước (bảng kỳ vọng viết tay từ chính công thức 60-cycle, KHÔNG suy từ code đang test —
     đúng convention "độc lập" đã áp dụng ở A3); HOẶC
   - (b) Test đại diện đúng 6 tuần (1 `cycleIndex` đại diện/tuần, vd 0/10/20/30/40/50) + xác nhận
     BOUNDARY (2 đầu mỗi tuần, vd `cycleIndex=9` và `cycleIndex=10` phải cho 2 cặp KHÁC nhau — chứng
     minh ranh giới tuần đúng, không lệch 1 vị trí) — chứng minh được toàn bộ 60 trường hợp bằng suy
     luận biên, không cần liệt kê hết 60 dòng.
   - **Khuyến nghị**: (a) an toàn hơn (không phụ thuộc suy luận biên có đúng không), và với chỉ 60
     dòng dữ liệu tĩnh, chi phí thấp — nên ưu tiên (a), có thể bổ sung (b) làm test biên tường minh.
3. **`affects` (initial/middle/final)**: test qua golden chart thật (như A1/A3 đã làm) — ít nhất 1
   case CÓ trúng Không Vong (affects=true cho ≥1 vị trí) và 1 case KHÔNG trúng (toàn `false`).
4. **KHÔNG dùng nhầm Can/Chi khác** — tương tự "bẫy napAm" đã dùng ở A3: 1 test xác nhận input dùng
   ĐÚNG `dayPillar` (không phải `hourPillar`/`monthPillar`/`yearPillar`) — cần ít nhất 1 golden chart
   nơi Chi Ngày và Chi Giờ/Tháng/Năm cho ra Không Vong pair KHÁC NHAU, để bẫy thật (không giả định).
5. **Provenance**: đúng entry mới, đúng confidence B.
6. **Purity**: input là dữ liệu số/Chi nguyên thuỷ hoặc object đã có sẵn (`cycleIndex` hoặc
   `CanChiPillar`) — nếu nhận `CanChiPillar` (object), CẦN test purity thật (structuredClone trước/
   sau, khác bài học rút ra từ A3's "no-mutation test vacuous vì input string").
7. **Regression**: chạy toàn bộ 397 test hiện có (baseline xác nhận LẠI ngay lúc audit này = 397/397
   PASS) trước khi coi bất kỳ thay đổi A2 nào là an toàn.
8. **KHÔNG test 孤辰/寡宿** — ngoài phạm vi A2 tối thiểu (mục 7), không viết test cho field/semantics
   chưa được quyết định.

---

## 11. Architecture Impact

Đối chiếu đúng architecture rule đã chốt ở A1 Freeze (`DA_LIU_REN_PHASE_11A1_FREEZE.md` mục 4) và
xác nhận lại ở A3 Decision Record:

- A2 (nếu implement) **CHỈ được** thêm 1 hàm `computeVoidBranches(...)` (hoặc tên tương đương) —
  pure primitive, giống `computeKeType`/`computeWangShuai`/`computeYiMa`.
- **KHÔNG** tạo `DaLiuRenChartWithVoidBranches`.
- **KHÔNG** tạo `calculateDaLiuRenChartWithVoidBranches()`.
- **KHÔNG** sửa `DaLiuRenCalculationResult`/`calculateDaLiuRenChart()`.
- A1's `calculateDaLiuRenChartWithKeType()` (grandfathered) **KHÔNG được dùng làm template**.
- Audit này KHÔNG đề xuất facade mới nào — đúng yêu cầu.

---

## 12. Regression Boundary

Các invariant PHẢI giữ nguyên TRƯỚC bất kỳ implementation A2 nào trong tương lai (audit này KHÔNG
sửa gì nên tất cả đã tự động đúng tại thời điểm audit — ghi lại làm baseline cho phase implement sau):

- **A1 không đổi**: `git diff --stat` trên `ke-type/`, `da-liu-ren-chart-with-ke-type.ts` — rỗng.
- **A3 không đổi**: `git diff --stat` trên `wang-shuai/` — rỗng.
- **Phase 11-B không đổi**: `git diff --stat` trên `r-nhatthan-01/`, `r-honnhan-01/`, `r-timdo-01/`,
  `r-kientung-02/`, `rules/registry.ts` — rỗng.
- **`calculateDaLiuRenChart()` không đổi** — chưa cho phép A2 wire vào cho tới khi có quyết định
  riêng (đúng nguyên tắc "primitive only" đã chốt).
- **R-NHATTHAN-01 output không đổi** — không evaluator nào đọc `voidBranches`/`kongWang` (xác nhận
  qua `rule-dependencies.ts`: `kongWang` vẫn nằm trong `UnimplementedComponentId`, đúng như kỳ vọng).
- **397 baseline test PASS** — đã chạy lại `npx vitest run` ngay trong audit này (không sửa gì):
  **397/397 PASS**, xác nhận baseline nguyên vẹn tại thời điểm audit.

---

## 13. Open Decisions (cần chủ dự án chốt, KHÔNG tự chọn)

1. **Cách đọc 孤/寡 nào (nếu có) sẽ được implement**, trong 3 cách 六壬大全 tự liệt kê:
   - (1) Dương Không=孤, Âm Không=寡 (theo Âm/Dương CHÍNH chi Không Vong đó);
   - (2) Địa Bàn Không=孤, Thiên Bàn Không=寡 (theo Spec §10b `KongWangInfo` hiện tại);
   - (3) Sơ truyền Không=孤, Mạt truyền Không=寡 (theo vị trí Tam Truyền);
   - hoặc **quyết định KHÔNG implement 孤/寡 ở bất kỳ phiên bản nào** (v1 chỉ dừng ở phần LÕI, để
     孤/寡 cho vòng nghiên cứu sau — giống cách dự án đã xử lý 天馬/河魁/叢魁 ở §10, hay Ứng Kỳ ở §14).
2. **`earthPlateVoid`/`heavenPlateVoid` có thực sự là 2 GIÁ TRỊ khác nhau trong 1 số trường hợp, hay
   luôn là 1 giá trị nhìn từ 2 vị trí?** — chưa có bằng chứng đủ để trả lời; cần đọc thêm nguyên văn
   六壬大全 quyển 9 (không chỉ đoạn đã trích) trước khi implement bất kỳ phiên bản 2-field nào.
3. **Có cần đọc lại trực tiếp Wikisource (thay vì WebFetch tóm tắt) trước khi khoá C1/C2/C3 vào
   provenance chính thức** — report-5 tự khuyến nghị điều này, chưa được thực hiện.
4. **`computeYiMa()` có nên đổi chữ ký để nhận thêm `isVoid` hay giữ nguyên, để A4 tự làm hàm phụ** —
   quyết định kiến trúc riêng của A4, không phải A2.

---

## 14. Recommendation

**Thứ tự hành động đề xuất:**

1. **Code NGAY phần LÕI của A2** (C1+C2, `VoidBranches.pair` + `affects`, theo đúng shape ĐÃ có sẵn
   ở `types/void-branches.ts`, KHÔNG sửa type đó) — well-evidenced (B), không cần quyết định thêm từ
   chủ dự án, đủ để giải quyết A4's `isVoid` dependency.
2. **KHÔNG code 孤辰/寡宿** trong đợt A2 này — treo lại như 1 "documented gap", tương tự cách dự án
   đã xử lý zeikeVariant (A1) hay 12 Trường Sinh (§12 Algorithm Spec) — chờ quyết định tường minh
   (mục 13 câu 1) trước khi bất kỳ ai (kể cả AI) code phần này.
3. **Sau khi A2 lõi freeze**, A4 có thể tiến hành audit riêng (đã có đủ input cần thiết từ A2).
4. **Song song hoặc sau đó**: nếu chủ dự án MUỐN giải quyết 孤/寡, cần 1 vòng đọc lại trực tiếp
   Wikisource quyển 9/11 (không WebFetch tóm tắt) để xác nhận có thêm ngữ cảnh nào quanh đoạn "有三"
   giúp xác định 六壬大全 tự ưu tiên cách nào hay không, trước khi quyết định.

---

## 15. Verdict

**READY WITH DOCUMENTED GAP**

- Phần LÕI (C1 định nghĩa + C2 cách tính, 1 cặp Không Vong theo Can Chi Ngày) — **READY**, well-evidenced
  (CONFIDENCE B, 2 lineage độc lập), khớp hoàn toàn với `types/void-branches.ts` hiện có, đủ cho A4's
  `isVoid`.
- Phần 孤辰/寡宿 (đa tầng Địa/Thiên Bàn theo Algorithm Spec §10b's `KongWangInfo`) — **BLOCKED, cần
  quyết định tường minh** (không phải research gap đơn thuần — cổ văn ĐÃ CÓ đủ 3 cách đọc, vấn đề là
  CHỌN cách nào, hoặc không chọn cách nào — 1 quyết định phạm vi/scope, không phải thiếu bằng chứng).

Audit này KHÔNG tự chọn giữa 3 cách đọc, KHÔNG tự quyết định có code 孤/寡 hay không — chỉ trình bày
đầy đủ bằng chứng để chủ dự án quyết định trước khi bất kỳ implementation nào chạm tới phần đó.
