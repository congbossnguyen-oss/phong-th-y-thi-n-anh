# Phase 25E — Nhật Xung EFFECT Model — Decision Gate

**Branch:** `quan-su-thien-anh` · **Nature:** DECISION GATE (methodology-owner sign-off prep). NOT implementation.
**runtime: NO · spec: NO · tests: NO · scoring/conclusion: NO · rename: NO · push: NO.** Chỉ thêm 1 doc.

> Mục đích: gom **toàn bộ mô hình EFFECT 4 trạng thái Nhật Xung** (Ám Động / Nhật Phá / 散 / 愈动) thành **một cổng
> quyết định duy nhất** để methodology-owner (Thầy) ký duyệt. Chi tiết audit ở `PHASE25C` (provenance) và `PHASE25D`
> (A–E + Options 0–3). File này KHÔNG lặp lại audit — chỉ trình bày lựa chọn + ô ký duyệt.

---

## 1. Vì sao gate này bao CẢ 4 trạng thái (không chỉ 散/愈动)
Phase 25D (đọc code tại HEAD) xác định: **cả 4** trạng thái Nhật-xung hiện **không tác động** state-machine kết luận.
- `canLucHao` đọc `Nhật Phá`/`Ám Động` → set `nhatPha`/`amDong`; `nhatPha` vào `reduced`. NHƯNG `ket-luan`
  (`strengthFrom`/`concludeDung`) đọc **chỉ `effective`** → `reduced` **inert**, `amDong` chỉ **lưu**.
- `散`/`愈动` thậm chí chưa được `canLucHao` đọc.
⇒ Hệ quả: nếu chỉ quyết 散/愈动 mà bỏ Ám Động/Nhật Phá thì tái tạo **hybrid không nhất quán**. Gate này buộc chọn
**một mô hình đồng nhất cho cả 4** (bài học Phase 24: không trộn nửa vời).

## 2. Bốn trạng thái — trạng thái hiện tại & provenance (đã khóa)
| Trạng thái | Điều kiện | Provenance (Phase 25C) | Hiện tại trong engine |
|---|---|---|---|
| Ám Động (暗动) | tĩnh+vượng | PRIMARY đa nguồn | FACT; `amDong` lưu, inert |
| Nhật Phá (日破) | tĩnh+suy | PRIMARY (增删卜易; 易冒=暗破) | FACT; vào `reduced` nhưng `reduced` inert |
| Nhật Tán / 散 | động+suy | PRIMARY (增删卜易+易冒+黄金策) | FACT; chưa được canLucHao/ket-luan đọc |
| 愈动 | động+vượng | PRIMARY thuật ngữ 增删卜易 (+易冒 ngữ nghĩa) | FACT; chưa được canLucHao/ket-luan đọc |

**Ràng buộc bất biến (mọi mô hình phải giữ):** (a) KHÔNG quy định tính→số; (b) KHÔNG double-count vượng/suy + Xung
(đã có ở canLucHao & chamDiem); (c) KHÔNG nhập profile 黄金策 (动→散 "吉不成吉") đã bị Phase 24 loại; (d) giữ profile
增删卜易/易冒; (e) KHÔNG đổi tên 愈动.

## 3. Bốn mô hình ứng viên (đồng nhất cho cả 4 trạng thái) — trung lập, KHÔNG xếp hạng
*(Ánh xạ từ Options 0–3 của Phase 25D, áp cho cả 4 để nhất quán.)*

- **MODEL 0 — FACT-ONLY (status quo).** Cả 4 chỉ là FACT hiển thị; không tác động lực/kết luận/timing/điểm.
  Đồng thời **làm rõ**: `reduced`(gồm Nhật Phá) vẫn inert (hoặc gỡ khỏi reduced để khỏi gây hiểu nhầm).
- **MODEL 1 — EFFICACY AXIS (trục hiệu-lực-động riêng).** Thêm 1 trục phân loại (vd `clashEfficacy`:
  `AM_DONG | NHAT_PHA | TAN | DU_DONG | NONE`) suy từ relations, **trực giao** base/effective/reduced. Surface cho AI;
  ket-luan CÓ THỂ đọc định tính (không số). Giữ vượng/suy nguyên vẹn.
- **MODEL 2 — STRENGTH MUTATION.** 4 trạng thái sửa thẳng `effective`/`reduced` của canLucHao (vd 散→giảm, 愈动→nâng,
  Nhật Phá→reduced-live, Ám Động→giữ/nhẹ). Rủi ro double-count + reversibility thấp (đụng lõi).
- **MODEL 3 — CONCLUSION-ONLY.** Giữ strength; `ket-luan` đọc 4 nhãn để chỉnh verdict/timing (vd 散→DELAYED-like).
  Rủi ro nhập profile 黄金策 nếu không cẩn thận.

**Ma trận so sánh (tóm tắt từ 25D — không xếp hạng):**
| | Classical support | Double-count risk | Provenance risk | Reversibility | Arch impact |
|---|---|---|---|---|---|
| M0 | đầy đủ (khóa nhãn) | none | none | n/a | none |
| M1 | cao (categorical đúng ngữ nguồn) | thấp | thấp | cao | +1 field |
| M2 | yếu (không số) | cao | cao | thấp | lõi |
| M3 | trung bình | trung bình | trung bình | trung bình | ket-luan |

## 4. Quyết định cần Thầy ký (DECISION GATE)
Chọn **đúng một** MODEL (0/1/2/3) áp **đồng nhất** cho cả 4 trạng thái. Nếu MODEL ≠ 0, trả lời thêm các mục dưới.

### 4.1. Lựa chọn mô hình (bắt buộc)
- [ ] MODEL 0 — FACT-ONLY (giữ vô thời hạn)
- [ ] MODEL 1 — EFFICACY AXIS
- [ ] MODEL 2 — STRENGTH MUTATION
- [ ] MODEL 3 — CONCLUSION-ONLY

### 4.2. Nếu MODEL ≠ 0 — phạm vi tác động (đánh dấu từng dòng CÓ/KHÔNG)
| Câu hỏi | CÓ | KHÔNG |
|---|---|---|
| G1. 散 tác động **hào strength**? | ☐ | ☐ |
| G2. 愈动 tác động **hào strength**? | ☐ | ☐ |
| G3. Nhật Phá được **kích hoạt** (thôi inert) đồng bộ? | ☐ | ☐ |
| G4. Ám Động được kích hoạt đồng bộ? | ☐ | ☐ |
| G5. 4 nhãn tác động **kết luận** (concludeDung)? | ☐ | ☐ |
| G6. 散 làm **timing modifier** (Ứng Kỳ)? *(cần nguồn Ứng Kỳ — hiện OPEN)* | ☐ | ☐ |
| G7. Cho phép **chamDiem** chấm điểm 4 nhãn? *(rủi ro double-count cao)* | ☐ | ☐ |

### 4.3. Ràng buộc xác nhận (bắt buộc ký "Đồng ý" nếu MODEL ≠ 0)
- [ ] Không quy định tính→số (giữ categorical).
- [ ] Không double-count vượng/suy + Xung (nếu G7=CÓ, phải nêu cách tách phần "tăng thêm").
- [ ] Không nhập profile 黄金策; giữ 增删卜易/易冒.
- [ ] Xử lý **đồng nhất cả 4** (không hybrid nửa vời).

## 5. Explicit Unknowns còn treo (từ 25C/25D)
- Không có delta lực **bằng số** trong mọi nguồn primary.
- Không có nguồn verbatim khóa **散 → quy luật Ứng Kỳ** cụ thể (G6 phụ thuộc nguồn chưa có).
- Tương tác 散 với **hóa biến của chính hào động** chưa có quy tắc hợp nhất.
- 卜筮正宗 tinh chỉnh 旺动 chưa xác nhận primary đầy đủ (không đổi kết luận Phase 24).

## 6. Hệ quả sau khi ký (scope phase implement kế tiếp — CHƯA làm)
| MODEL chọn | Phase kế tiếp sẽ đụng | Ghi chú |
|---|---|---|
| 0 | (none) | có thể chỉ dọn doc: nêu rõ `reduced` inert |
| 1 | `can-luc-hao.ts` (+field efficacy, đọc 4 nhãn); `luan-giai/prompt.ts`; (tùy G5) `ket-luan-su-viec.ts`; tests | KHÔNG đụng base/effective/reduced |
| 2 | `can-luc-hao.ts` (effective/reduced) → lan `ket-luan-su-viec.ts`; (nếu G7) `advisory-engine.ts::chamDiem`; tests | reversibility thấp |
| 3 | `ket-luan-su-viec.ts` (concludeDung/temporalFrom); (nếu G6) `ung-ky-synthesis.ts`; tests | giữ strength |
- Mọi trường hợp: **test trước**, diff tối thiểu, chỉ stage file của phase (western-astrology WIP KHÔNG đụng), không push.

## 7. DO NOT IMPLEMENT UNTIL SIGNED
Cho tới khi §4 được methodology-owner ký: giữ **MODEL 0 / FACT-only**. KHÔNG thêm điểm chamDiem, KHÔNG sửa canLucHao
base/effective/reduced, KHÔNG cho ket-luan đọc 4 nhãn, KHÔNG thêm timing rule, KHÔNG đổi tên 愈动.

## 8. Sign-off (methodology-owner điền — KHÔNG ai điền thay)
```
MODEL chọn:        ____  (0 / 1 / 2 / 3)
G1..G7 (nếu ≠0):   ____________________________
Ràng buộc §4.3:    [ ] Đồng ý tất cả
Ghi chú của Thầy:  ____________________________
Người duyệt:       ____________________   Ngày: __________
```
> Lưu ý: các ô checkbox/blank ở trên là **template chờ Thầy điền**; tài liệu này KHÔNG tự đánh dấu, KHÔNG tự kết luận
> đã được duyệt. Chưa có chữ ký = trạng thái vẫn MODEL 0 (FACT-only).

## 9. Phase Boundary
- **runtime: NO · spec: NO · tests: NO · scoring/conclusion: NO · rename: NO · EFFECT implement: NO.**
- **doc changed: YES** (chỉ file này). Regression baseline (không đổi bởi phase này): **308/308** tại `e87b674`.
- Commit chỉ doc này. **KHÔNG push.** STOP sau khi commit.
