# chamDiem — Primary-Source Provenance Research (G-TU1)

**Branch:** `quan-su-thien-anh` · **HEAD:** `755cac5` · **Nature:** RESEARCH / PROVENANCE AUDIT ONLY. KHÔNG runtime/
test/magnitude/threshold/methodology-lock/UI/skill/prompt/refactor change, KHÔNG push, KHÔNG nâng classification trong
lock cũ. Chỉ PRODUCE findings. Baseline 359/359.

## 1. Executive Summary
- **Kết luận cốt lõi:** cổ thư Lục Hào (增删卜易/卜筮正宗/易冒) là **ĐỊNH TÍNH** (阴阳·动静·五行生克·旺相休囚死·吉凶) —
  **KHÔNG có hệ thống chấm điểm / thang 100 / con số / weight** nào. ⇒ **MỌI magnitude trong chamDiem = C/E (Quân Sư
  product methodology)**; chỉ **DIRECTION** (chiều cát/hung) có source **B**.
- 4 tầng tách riêng xuyên suốt: PRIMARY SOURCE / COMPILED PROJECT SOURCE / QUÂN SƯ DERIVES / RUNTIME DOES.
- **KHÔNG item nào có magnitude ở mức A/B.** Direction nhiều mục = B; Đại vận/Lưu niên + thresholds + base/clamp = C/E cả
  direction lẫn magnitude (product/cross-system).

## 2. Research Scope
Provenance cho từng magnitude chamDiem (base 50; Vượng/Suy; Dụng relations; Không Vong/Phục tàng; Thế/Ứng; Đại vận/Lưu
niên; thresholds; clamp/round) + tìm **quantitative precedent** cổ điển (Target 10) + inventory án lệ.

## 3. Source Inventory
| Nguồn | Loại | Trong repo? | Dùng cho |
|---|---|---|---|
| spec §3.3/§3.4/§4.1/§6 (LUAN_QUE_LUC_HAO_SPEC) | **compiled project** (bản dịch VN) | CÓ | direction (vượng/suy, sinh/khắc, Thế/Ứng, Ứng Kỳ) |
| 增删卜易 日辰章 (verbatim, verify 23C) | primary classical | KHÔNG (verified qua web 23C: quanxue.cn) | direction Phá/Ám Động/vượng-suy |
| 卜筮正宗 / 易冒 (verbatim, 23C) | primary classical | KHÔNG (web) | direction |
| án lệ `kien-thuc/an-le/*` (9 chunk) | project cases (prose) | CÓ | direction (định tính); outcome numbers = kết quả đời thực, KHÔNG phải scoring |
| chamDiem magnitudes | **Quân Sư runtime** | CÓ (advisory-engine.ts) | (đối tượng audit) |
- **Web (G-U1):** xác nhận cổ thư định tính, không point-system — [zhihu 增删卜易](https://zhuanlan.zhihu.com/p/2022380706660107769),
  [卜筮正宗 giới thiệu](https://zhuanlan.zhihu.com/p/577203075) (nhấn "五行生克/阴阳动静" định tính). Direction verbatim đã
  lấy ở Phase 23C ([增删卜易 日辰章](https://www.quanxue.cn/qt_mingxiang/zengshanpy/zengshanpy19.html)).
- **In-repo check:** grep "điểm/score/100/%/thang điểm" trong classical/compiled = **0 hệ chấm điểm** (chỉ có điểm thi đời
  thực trong án lệ chunk-07; và spec ghi thẳng "no numeric score").

## 4. Base Score (50)
- Direction: n/a. Magnitude: **KHÔNG source** (không cổ thư nào có "điểm khởi tạo 50" / thang 100). → **C/E** (product).

## 5. Vượng/Suy (+12/+6/−2/−8/−12)
- **Direction:** 旺相休囚死 = 5 bậc ORDINAL cổ điển (Vượng>Tướng>Hưu>Tù>Tử; vượng tốt/tử xấu) — spec §3.3 + cổ thư →
  **B** (thậm chí gần A cho thứ tự định tính).
- **Magnitude:** cổ thư cho **thứ hạng** (ordinal) chứ **KHÔNG cho số** (+12…−12). → **C/E**.
- **Precedent (ordinal):** 5-bậc 旺相休囚死 là **ordinal precedent** cho THỨ TỰ, KHÔNG phải cho khoảng cách số (±12 vs ±6).

## 6. Không Vong / Phục Tàng (−12 / −10)
- **Direction:** 空亡 = "chưa tới/còn trống", 伏藏 = "ẩn chưa lộ" — cổ điển + spec → **B**.
- **Magnitude −12/−10:** KHÔNG source → **C/E**.
- **timingBlocker:** = cờ Quân Sư (Không Vong/Phá/phục_tang → NÊN CHỜ). Cổ thư có ý "chưa tới lúc/chờ Ứng Kỳ" (direction
  B) nhưng cơ chế boolean→verdict = **C** (product). timingBlocker ≠ Ứng Kỳ (giữ lock).

## 7. Dụng Relations
| Item | Direction (source) | Direction class | Magnitude source | Magnitude class |
|---|---|---|---|---|
| Sinh +7 | 五行相生 "sinh phò" (cổ điển) | **B** | không | **C/E** |
| Khắc −7 | 五行相克 "khắc chế" | **B** | không | **C/E** |
| Nguyệt Phá −14 | 月破 bất lợi (增删卜易/spec) | **B** | không | **C/E** |
| Nhật Phá −10 | 日破 "愈加无用" (增删卜易 verbatim 23C) | **B** | không | **C/E** |
| Ám Động +5 | 暗动 "愈得其力" lợi (增删卜易 23C) | **B** | không | **C/E** |
| Lâm Nhật/Nguyệt +6 | 临值/đương lệnh "có thế" | **B** | không | **C/E** |
| Hợp +3 | 六合 "dễ thành, cần đúng thời" (nuanced) | **B/D** (cát-hung tùy cảnh) | không | **C/E** |
| Xung −3 | 六冲 "dao động" | **B** | không | **C/E** |
| Hại −3 | 六害 "hại ngầm" | **B/D** (ít nhấn trong cổ thư) | không | **C/E** |
- **Quan trọng:** cổ thư nói CHIỀU (sinh tốt/khắc xấu/Phá bất lợi) — **KHÔNG** nói "−14 nặng hơn −10 hơn −7". Tương quan
  độ nặng (Nguyệt Phá −14 > Nhật Phá −10 > Khắc −7) là **Quân Sư ranking heuristic**, chỉ có **ordinal hint** mờ từ cổ
  thư (月破 cản cả tháng > 日破 cản ngày) → **magnitude vẫn C/E**, ordinal-direction B.

## 8. Thế/Ứng (+5/−6/+3/−2)
- **Direction:** 世应生克 (世生应/世克应/应生世/应克世 có cát-hung) — cổ điển + spec §4.1 (Thế=ta/Ứng=đối phương) → **B**
  (đã lock abd5968).
- **Magnitude +5/−6/+3/−2:** cổ thư nói 吉/凶, **KHÔNG** nói con số. → **C/E** (giữ nguyên abd5968).
- Bất đối xứng (+5 vs −6, +3 vs −2) = Quân Sư weighting, không source.

## 9. Đại vận / Lưu niên (band×5 / band×2.5)
- Đây là **tích hợp CHÉO** (luck engine Tử Vi/vận trình × Lục Hào) — **KHÔNG thuộc Lục Hào cổ điển**. Cổ thư Lục Hào
  KHÔNG dùng đại vận/lưu niên làm điểm quẻ. → **direction C + magnitude C/E** (Quân Sư product cross-system).

## 10. Thresholds (72 / 58 / 42 → NÊN / CÓ ĐIỀU KIỆN / KHÔNG NÊN; timingBlocker→NÊN CHỜ)
- KHÔNG cổ thư nào có thang 100 hay ngưỡng 72/58/42. → **C/E** (product methodology). Nhãn NÊN/CÓ ĐIỀU KIỆN/KHÔNG NÊN/
  NÊN CHỜ = product UX, không cổ điển.

## 11. Clamp / Round (clamp[0,100], round)
- Implementation convention thuần (thang 100 là product). → **C/E**.

## 12. Quantitative Precedents (Target 10) — kết quả tìm kiếm
- **KHÔNG tìm thấy** hệ định lượng (100 điểm / % / weight / point grading) trong cổ thư Lục Hào. Cổ thư = **định tính**
  (旺相休囚死 ordinal + 生克冲合 + 吉凶). (web xác nhận; in-repo xác nhận.)
- **POTENTIAL METHODOLOGICAL PRECEDENT (ordinal only):** 旺相休囚死 (5 bậc) — là tiền lệ cho **thứ hạng lực**, KHÔNG phải
  cho thang điểm số hay khoảng cách. **KHÔNG tự map** sang chamDiem. Ghi nhận như tiền lệ ORDINAL, KHÔNG phải numeric.
- ⇒ toàn bộ hệ chấm điểm chamDiem (base+magnitude+threshold+multiplier) = **Quân Sư product invention**, không mô phỏng
  hệ cổ điển nào.

## 13. Án lệ Evidence
- án lệ (9 chunk) chứa: (a) **direction** định tính (vd "Dụng vượng được sinh → thành"), (b) **outcome numbers** đời
  thực (điểm thi 590/507 — KHÔNG phải divination scoring), (c) tiến/thoái Ứng Kỳ (R8, đã ghi UNG_KY audit).
- **KHÔNG án lệ nào** chứa numerical divination scoring / thang điểm. Có thể infer ordinal direction, **KHÔNG** đủ để
  infer magnitude. Statistical inference từ outcome ≠ classical provenance → **DATA GAP** cho magnitude.

## 14. Rule-by-Rule Provenance Matrix
| Item | Current Runtime | Direction Evidence | Magnitude Evidence | Classification | Source |
|---|---|---|---|---|---|
| Base | 50 | — | none | **C/E** | product |
| Vượng/Suy | +12/+6/−2/−8/−12 | 旺相休囚死 ordinal | none | dir **B** / mag **C/E** | spec §3.3, 增删卜易 |
| Không Vong | −12 | 空亡 chưa tới | none | dir **B** / mag **C/E** | spec, cổ điển |
| Phục Tàng | −10 | 伏藏 ẩn | none | dir **B** / mag **C/E** | spec §3.8 |
| Sinh | +7 | 相生 | none | dir **B** / mag **C/E** | cổ điển |
| Khắc | −7 | 相克 | none | dir **B** / mag **C/E** | cổ điển |
| Nguyệt Phá | −14 | 月破 (cả tháng) | none | dir **B** / mag **C/E** | 增删卜易/spec |
| Nhật Phá | −10 | 日破 "愈加无用" | none | dir **B** / mag **C/E** | 增删卜易 23C |
| Ám Động | +5 | 暗动 "愈得其力" | none | dir **B** / mag **C/E** | 增删卜易 23C |
| Lâm Nhật/Nguyệt | +6 | 临值 đương lệnh | none | dir **B** / mag **C/E** | cổ điển |
| Hợp | +3 | 六合 (nuanced) | none | dir **B/D** / mag **C/E** | cổ điển |
| Xung | −3 | 六冲 | none | dir **B** / mag **C/E** | cổ điển |
| Hại | −3 | 六害 | none | dir **B/D** / mag **C/E** | cổ điển |
| Thế/Ứng ×4 | +5/−6/+3/−2 | 世应生克 | none | dir **B** / mag **C/E** | spec §4.1, abd5968 |
| Đại vận | band×5 | — (cross-system) | none | **C/E** (dir+mag) | product |
| Lưu niên | band×2.5 | — (cross-system) | none | **C/E** | product |
| Thresholds | 72/58/42 | — | none | **C/E** | product |
| Base/Clamp/Round | 50 / [0,100] / round | — | none | **C/E** | product |

## 15. Current vs Source
| Magnitude | Exact Source Support? | Equivalent Formula? | Current Status |
|---|---|---|---|
| base 50 | KHÔNG | KHÔNG | C/E |
| Vượng/Suy ±12..±12 | KHÔNG (chỉ ordinal 旺相休囚死) | ordinal-only precedent | C/E (dir B) |
| Không Vong −12 / Phục Tàng −10 | KHÔNG | KHÔNG | C/E (dir B) |
| Sinh/Khắc ±7 | KHÔNG | KHÔNG | C/E (dir B) |
| Nguyệt Phá −14 / Nhật Phá −10 | KHÔNG (chỉ ordinal "tháng>ngày") | ordinal hint | C/E (dir B) |
| Ám Động +5 / Lâm +6 | KHÔNG | KHÔNG | C/E (dir B) |
| Hợp+3 / Xung−3 / Hại−3 | KHÔNG | KHÔNG | C/E (dir B/D) |
| Thế/Ứng +5/−6/+3/−2 | KHÔNG | KHÔNG | C/E (dir B) |
| Đại vận×5 / Lưu niên×2.5 | KHÔNG | KHÔNG | C/E |
| Thresholds 72/58/42 | KHÔNG | KHÔNG | C/E |
- **KHÔNG magnitude nào** có exact source hay công thức định lượng tương đương. ⇒ **KHÔNG item nào đủ điều kiện nâng
  magnitude lên A/B.**

## 16. Evidence Gaps
1. Magnitude cho MỌI heuristic = không nguồn (cổ thư định tính) → C/E vĩnh viễn trừ khi có hệ định lượng cổ (không tồn tại).
2. Ordinal spacing (vì sao Nguyệt Phá −14 vs Nhật Phá −10 vs Khắc −7) = Quân Sư ranking, chưa validate.
3. Đại vận/Lưu niên integration = cross-system product, không có tiền lệ Lục Hào.
4. Thresholds 72/58/42 = product, chưa calibrate bằng án lệ (0/153 replay — DATA GAP).
5. Hợp/Hại direction ở mức B/D (cổ thư nuanced, ít định hướng cứng).

## 17. Recommended Future Research (chờ owner, KHÔNG làm)
- **R-A:** đối chiếu verbatim per-direction (nâng dir B→A cho Vượng/Suy, Phá, Ám Động, 世应生克) bằng cổ thư gốc — direction
  only, KHÔNG magnitude.
- **R-B:** nếu owner muốn magnitude có cơ sở: **KHÔNG** từ cổ thư (không tồn tại) → chỉ có thể (i) calibrate bằng corpus
  án lệ 6-hào thật (cần data — DATA GAP), hoặc (ii) chấp nhận vĩnh viễn là product heuristic (label C, như hiện tại).
- **R-C:** cân nhắc thay hệ điểm bằng **ordinal deterministic** (bám 旺相休囚死 + generraphic) thay vì số — product/
  methodology decision (26H/26I OD, không thuộc G-U1).

## 18. Explicit Non-Decisions
KHÔNG nâng C/E→A/B trong code/lock; KHÔNG đổi magnitude/threshold/base/clamp; KHÔNG sửa runtime/test/UI/skill/prompt;
KHÔNG tạo methodology lock mới; KHÔNG map ordinal precedent vào chamDiem; KHÔNG bắt đầu G-TU4. Việc nâng provenance là
phase sau + owner gate.

## 19. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · magnitude/threshold: NO · UI/skill/prompt: NO.** doc: YES (chỉ file này).
- Regression: **359/359 PASS** (read-only; production/test không đổi). Commit chỉ doc này. **KHÔNG push.** STOP.
