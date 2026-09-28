# Phase 25F — Nhật Xung EFFECT Methodology Lock (Model 1)

**Branch:** `quan-su-thien-anh` · **Nature:** METHODOLOGY LOCK (spec + decision record). NOT implementation.
**runtime: NO · src/: NO · tests: NO · scoring: NO · ket-luan runtime: NO · Ứng Kỳ runtime: NO · push: NO.**
Files: `LUAN_QUE_LUC_HAO_SPEC.md` (+§3.10.1, cập nhật 2 note §3.10) + doc này. Không đụng western-astrology WIP.

---

## A. Decision
- **CHỌN MODEL 1 — FACT + MOVEMENT-EFFICACY AXIS** (methodology-owner đã quyết).
- **Rationale:** base strength và movement efficacy là hai trục ngữ nghĩa khác nhau (Phase 25D/25E). Model 1 trung
  thành nguồn nhất (categorical đúng ngữ nguồn, KHÔNG quy số), double-count thấp (trực giao base/effective/reduced),
  reversibility cao, không nhập profile bị loại. Áp **đồng nhất cả 4** trạng thái (không hybrid).
- **Non-goals (rõ ràng):** KHÔNG sửa strength; KHÔNG số hoá 散/愈动; KHÔNG chấm điểm; KHÔNG tự quyết 吉/凶; KHÔNG chế
  Ứng Kỳ; KHÔNG đổi tên 愈动; KHÔNG import 黄金策/卜筮正宗 (动逢冲→散).

## B. Locked Semantic Model (2 trục)
- **BASE STRENGTH (authoritative, giữ nguyên):** Nguyệt kiến · vượng/suy · Nhật thần · toàn bộ phép tính lực hiện có
  (`canLucHao` base/effective/reduced). 4 nhãn Nhật Xung KHÔNG sửa trục này.
- **MOVEMENT EFFICACY (trục mô tả MỚI):** trạng thái/hiệu lực của động hoặc bị xung. Định tính; KHÔNG bậc lực, KHÔNG số.
- 4 trạng thái Nhật Xung = giá trị của trục efficacy (mô tả), phân theo tĩnh/động × vượng/suy.

## C. Formal State Matrix (khóa)
| Tĩnh/Động | Vượng/Hưu-Tù | Relation | Movement-efficacy semantics |
|---|---|---|---|
| Tĩnh | Vượng | **Ám Động** (暗动) | tĩnh nhưng được kích hoạt/tiềm động (latent activated) |
| Tĩnh | Hưu/Tù | **Nhật Phá** (日破) | tĩnh-suy bị Nhật xung → hỏng/vỡ trạng thái tĩnh. **KHÔNG phải 散.** |
| Động | Hưu/Tù | **Nhật Tán / 散** | động-suy → hiệu lực động **tán/mất**. KHÔNG trừ lực bằng số. |
| Động | Vượng | **愈动** | động-vượng → hiệu lực động **tăng cường** bởi xung. KHÔNG cộng lực bằng số. |

## D. Nguyệt-kiến Exception (爻逢月建，日冲而不散)
Hào lâm Nguyệt **đã Vượng** trong base-strength → Động + Vượng + Nhật xung → **愈动**, KHÔNG phải 散.
**Diễn giải implementation:** đạt qua trạng thái Vượng sẵn có — **KHÔNG thêm guard đặc biệt dư thừa** (đã xác nhận
runtime Phase 25B + test T5).

## E. Classical Provenance (chỉ dùng đã verify Phase 25C — không thêm claim mới)
- Primary: 《增删卜易》 日辰章 — "冲旺相之静爻，即为暗动，冲衰弱之静爻，则为日破" · "爻旺而动，冲之愈动，爻衰而动，冲之则散" ·
  "爻逢月建，日冲而不散" (quanxue.cn / ly.yishihui.net).
- Hậu thuẫn: 《易冒》 卷三 日冲章第二十七 — "旺相为动，休囚为散" (daizhige.org; single-host, đã ghi caveat 25C). 易冒 gọi
  tĩnh-suy = **暗破** (dị danh 日破).
- KHÔNG dùng (vẫn hợp lệ, cố ý loại): 《黄金策》/《卜筮正宗》 "动逢冲→散" vô điều kiện.
- **Không có nguồn nào cho delta lực bằng SỐ** → chính là lý do trục efficacy giữ định tính.

## F. Invariants (implementation tương lai PHẢI giữ)
1. KHÔNG biến 散 → delta lực âm bằng số.
2. KHÔNG biến 愈动 → delta lực dương bằng số.
3. KHÔNG sửa vượng/suy hiện có.
4. KHÔNG đổi base/effective strength chỉ vì 散/愈动.
5. Nhật Phá ≠ Nhật Tán (khác nhánh tĩnh/động).
6. 愈动 KHÔNG phải một bậc lực mới.
7. KHÔNG import profile 黄金策/卜筮正宗 (动逢冲→散 vô điều kiện).
8. Primary profile = 增删卜易, corroborated 易冒.
9. KHÔNG chế rule Ứng Kỳ cho 散/愈动.
10. KHÔNG gán điểm chamDiem cho 4 nhãn.
11. KHÔNG để bất kỳ trong 4 nhãn **tự** quyết 吉/凶.
12. Trục efficacy giai đoạn này = **mô tả/ngữ nghĩa**; tích hợp verdict là quyết định implement tương lai (Phase riêng).

## G. Downstream Boundaries (khóa)
- **no strength mutation** · **no numeric score** · **no automatic verdict mutation** · **no automatic Ứng Kỳ rule** ·
  **no rejected-school import**.

## H. Architecture Audit + Future Implementation Boundary
**Audit field hiện tại (đọc code tại `31a88d9`):**
| Symbol | Semantics | Sau Phase 25F |
|---|---|---|
| `canLucHao` base/effective | BASE STRENGTH | GIỮ NGUYÊN |
| `reduced` (gồm nhatPha, tuePha, hóa xấu) | BASE STRENGTH (tổn thương, giữ base) — hiện **inert** với verdict | GIỮ NGUYÊN (không nối 散/愈动 vào) |
| `amDong` (canLucHao) | cờ FACT, chỉ lưu | GIỮ NGUYÊN |
| `strengthFrom` / `concludeDung` / `temporalFrom` (ket-luan) | verdict theo `effective`/protection/temporal | GIỮ NGUYÊN (KHÔNG đọc 4 nhãn) |
| `chamDiem` | legacy score (đã cộng vượng/suy + Xung) | GIỮ NGUYÊN (KHÔNG chấm 4 nhãn) |
| `HaoInfo.relations` (4 nhãn) + `hao-time` TAN/DU_DONG | FACT layer | GIỮ NGUYÊN |
| **MOVEMENT-EFFICACY field** | (CHƯA tồn tại) | **Phase 25G tạo** |

**Phase 25G ĐƯỢC PHÉP implement:** thêm **một trục movement-efficacy** (đọc 4 nhãn từ relations; ví dụ field
`clashEfficacy` / `movementEfficacy` trên `HaoStrengthState` hoặc lớp tương đương), **trực giao** base/effective/reduced;
surface cho prompt/AI như FACT-mô-tả; viết test. **Phase 25G BỊ CẤM:** sửa base/effective/reduced/vượng/suy; số hoá;
chấm điểm; để efficacy tự quyết verdict; nối Ứng Kỳ; đổi tên; import profile bị loại. (Verdict-integration = phase sau
nữa, cần quyết riêng.)

## I. Regression Expectation
Baseline hiện tại: **308/308 PASS** (không đổi bởi phase doc-only này). KHÔNG claim con số khác.

## J. Phase Boundary
- **runtime: NO · src/: NO · tests: NO · scoring: NO · ket-luan runtime: NO · Ứng Kỳ runtime: NO.**
- **spec doc: YES** (§3.10.1 mới + cập nhật 2 note §3.10). **decision doc: YES** (file này).
- Commit chỉ 2 file doc. **KHÔNG push.** **Model 1 = formally LOCKED.** STOP (không tự mở 25G).
