# Phase 24 — Nhật Xung Methodology Lock

**Branch:** `quan-su-thien-anh` · **Nature:** SPEC / METHODOLOGY LOCK ONLY.
**runtime: NO · luc-hao.ts: NO · HaoRelationType: NO · strength engine: NO · conclusion engine: NO · tests: NO · Nhật Tán implemented: NO · Phase 25: NOT started.**
**methodology: YES (formally locked) · spec: YES (§3.10 mới + sửa §3.4 dòng 99).**

---

## 1. Checkpoint
- HEAD trước phase: `9b343a0` (Phase 23C). Kết quả 23C: **MULTIPLE VALID PROFILES — THẦY MUST SELECT.**
- Xung đột trường phái đã verify (verbatim, có URL). Spec trước Phase 24 = hybrid ngầm (tĩnh theo 增删卜易, động
  theo 黄金策). Runtime CHƯA đổi (và phase này KHÔNG đổi).

## 2. Decision
Quân Sư **CHỌN 《增删卜易》 (日辰章 / 动散章)** làm **PRIMARY methodology profile** cho ngữ nghĩa Nhật Xung.
Đây là **quyết định thiết kế của Quân Sư**, KHÔNG tuyên bố 增删卜易 "đúng phổ quát" hơn trường phái khác.

## 3. Selected Primary Profile
《增删卜易》 phân **4 trạng thái** theo trục **tĩnh/động × vượng/suy**, giải tường minh cả hai ô động:
- 动 + 旺 + 日冲 → **愈动** (càng động, đắc lực)
- 动 + 衰/休囚 + 日冲 → **散** (Nhật Tán)
- 静 + 旺 + 日冲 → **暗动** (Ám Động)
- 静 + 衰/休囚 + 日冲 → **日破** (Nhật Phá)
- Ngoại lệ: 爻逢月建，日冲而不散 (lâm Nguyệt kiến → không tán/phá).

**Lý do chọn:** (a) N1/N2 hiện tại của Quân Sư vốn theo kiểu 增删卜易; (b) 增删卜易 giải tường minh cả hai ô động;
(c) cho **một** profile nguồn nhất quán, chấm dứt việc gộp ngầm hai trường phái.

## 4. Classical Source Evidence (verbatim, verify Phase 23C)
**Primary — 《增删卜易》 日辰章**
- URL: https://www.quanxue.cn/qt_mingxiang/zengshanpy/zengshanpy19.html (đối chiếu https://ly.yishihui.net/17685.htm)
- "冲旺相之静爻，即为暗动，冲衰弱之静爻，则为日破。"
- "爻旺而动，冲之愈动，爻衰而动，冲之则散。"
- "爻逢月建，日冲而不散，是明知当令不畏日冲矣。"

**Profile khác — KHÔNG dùng cho cơ chế này, vẫn là methodology hợp lệ (không chê bai):**
- 《黄金策·总断千金赋》 — https://www.quanxue.cn/qt_mingxiang/huangjin/huangjin01.html : "动逢冲而事散"
  (动 → 散 **vô điều kiện** vượng/suy). Đã xác nhận verse KHÔNG điều kiện hóa theo 旺/衰.
- 《卜筮正宗》 — https://ctext.org/wiki.pl?chapter=889452 (index) /
  https://www.shidianguji.com/zh/book/HY0057/chapter/1lpdfpe5gs8wz (partial: "動逢衝而事散"). Bổ sung trục 空/不空.

## 5. Rejected Hybrid (không giấu chỉnh sửa lịch sử)
> "The previous specification combined the static branch associated with 增删卜易 with the unconditional dynamic
> 散 rule found in 黄金策 / 卜筮正宗. Phase 24 formally resolves this by selecting one primary methodology profile."

Bản trước: hàng **tĩnh** theo 增删卜易 (N1 暗动 / N2 日破) + hàng **động** theo 黄金策 (动→散 vô điều kiện) → ô **N4**
mâu thuẫn với chính nguồn cấp N1/N2. Phase 24 khóa toàn bộ theo 增删卜易.

## 6. Locked N1–N4 Matrix
| CASE | Điều kiện | RESULT | Hán tự |
|---|---|---|---|
| Tĩnh + Vượng + Nhật xung | N1 | **Ám Động** | 暗动 |
| Tĩnh + Hưu/Tù + Nhật xung | N2 | **Nhật Phá** | 日破 |
| Động + Vượng + Nhật xung | N4 | **愈动 / Xung càng động** (NOT Nhật Tán) | 愈动 |
| Động + Hưu/Tù + Nhật xung | N3 | **Nhật Tán / 散** | 散 / 冲脱 |

Không đặt tên EN/VI mới cho N4 ngoài "愈动 / Xung càng động" (nguồn không đòi tên khác).

## 7. Nhật Phá vs Nhật Tán
**日破 ≠ 散 (khóa).**
- **日破 (Nhật Phá):** Tĩnh + Hưu/Tù + Nhật xung (N2).
- **散 (Nhật Tán):** Động + Hưu/Tù + Nhật xung (N3).
- Hai nhánh khác nhau (tĩnh vs động), KHÔNG đồng nghĩa. 冲脱 = biến thể chữ của 散.
- ⇒ Nhãn engine hiện tại gán N3 = "Nhật Phá" là **SAI Ô** (phải là 散) — ghi nhận, sửa ở Phase 25.

## 8. N4 — 愈动
- 动 + 旺 + 日冲 = **愈动 / Xung càng động**, **KHÔNG phải Nhật Tán**. Theo 增删卜易, Nhật xung làm hào vượng-động
  **càng động / đắc lực**, không tán.
- **Cách biểu diễn N4 như HaoRelationType CHƯA quyết** — thuộc **Phase 25** (design work). Phase 24 chỉ khóa ngữ nghĩa.

## 9. Strength Boundary
- KHÔNG tự động suy **Nhật Tán → reduced strength**. KHÔNG tự động suy **愈动 → tăng điểm/lực**.
- Đây là **trạng thái ngữ nghĩa methodology**; ánh xạ xuống strength cần **thiết kế engine riêng + bằng chứng**.
- Phase 24 KHÔNG đổi strength engine (`canLucHao`).

## 10. Conclusion Boundary
- KHÔNG đổi conclusion engine (`ket-luan-su-viec`). Ánh xạ 4 trạng thái này lên kết luận cát/hung = phase sau,
  cần evidence. Ghi nhận: 黄金策 mô tả 散 = "cát bất thành cát, hung bất thành hung" (trung hòa kết quả) — CHỈ ghi
  chú, KHÔNG áp thành rule ở đây.

## 11. Future Engine Requirements (chỉ document, KHÔNG implement)
Engine tương lai phải phân biệt tối thiểu **4** trạng thái Nhật xung:
- **A. Ám Động** (静旺) — đã có trong `HaoRelationType`.
- **B. Nhật Phá** (静衰) — đã có.
- **C. Nhật Tán / 散** (动衰) — **CHƯA có** trong `HaoRelationType`.
- **D. 愈动 / Xung càng động** (动旺) — **CHƯA có**.

**Đánh giá mô hình hiện tại:** `HaoRelationType` (`luc-hao.ts:395-399`) hiện có Ám Động/Nhật Phá nhưng KHÔNG có
C và D; `getDayRelations` (`luc-hao.ts:417-436`) KHÔNG nhận `isDong` nên không phân được tĩnh/động → không thể tạo
C/D mà không distort ngữ nghĩa. ⇒ **NEW RELATION / STATE MAY BE REQUIRED** (ít nhất cho C và D), **+ truyền
`isDong` + trạng thái 旺/衰 vào `getDayRelations`**. **KHÔNG implement ở phase này.**

## 12. Phase Boundary
- **runtime changed: NO · methodology changed: YES (locked) · spec changed: YES · types changed: NO ·
  HaoRelationType changed: NO · tests changed: NO · Nhật Tán implemented: NO · Phase 25: NO · G5 reopened: NO.**
- **Files sửa:** `LUAN_QUE_LUC_HAO_SPEC.md` (§3.10 mới + sửa dòng 99 §3.4) + doc này. Không file `src/` nào.
- **Regression (thực chạy):** `npx vitest run src/lib/quan-su src/lib/serial-tien-golden.test.ts` →
  **297/297 PASS (20 files)** (Quan Su riêng 287/287). KHÔNG dùng "311" (suite hiện đếm 297; không sửa test).

---

### Phase 25 requirements (KHÔNG mở trong phase này)
1. Thêm biểu diễn cho **C (散/Nhật Tán)** và **D (愈动)** — quyết `HaoRelationType` mới hay cơ chế state riêng.
2. Truyền **`isDong`** (+ vượng/suy đã có qua `monthVuongSuy`) vào `getDayRelations` (`luc-hao.ts`, engine sacred).
3. Sửa nhãn **N3** (hiện "Nhật Phá") → 散; giữ N1/N2; thêm N4 = 愈动.
4. Áp ngoại lệ **lâm Nguyệt kiến → 日冲而不散** vào nhánh Nhật xung.
5. Quyết ánh xạ **strength/conclusion** cho từng trạng thái (cần evidence; mặc định giữ FACT-only nếu chưa khóa).
6. Test N1–N4 (+ ngoại lệ Nguyệt kiến) ở `__hao-time-relations` / `__can-luc-hao`.
