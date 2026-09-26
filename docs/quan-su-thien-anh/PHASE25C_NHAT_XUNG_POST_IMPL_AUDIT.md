# Phase 25C — Nhật Xung Post-Implementation Audit

**Branch:** `quan-su-thien-anh` · **Nature:** POST-IMPLEMENTATION AUDIT ONLY.
**runtime: NO · scoring/strength/conclusion: NO · spec: NO · rename 愈动: NO · Phase 26: NO.**
Chỉ thêm 1 doc. Không đụng western-astrology WIP.

---

## 1. Checkpoint
- HEAD = `56db7cb` (Phase 25B) ✓.
- Baseline trước implement = **297**; Phase 25B hiện = **308** (đã chạy lại tại HEAD: 21 files, 308/308 PASS).
  KHÔNG dùng "311" (không tái lập).

## 2. N1–N4 Verification (vs code THẬT + test)
Engine `luc-hao.ts::getDayRelations` (nhánh Nhật xung, đã đọc lại tại HEAD):
```ts
const vuongTuong = monthVuongSuy === "Vượng" || monthVuongSuy === "Tướng";
const xungType = isDong ? (vuongTuong ? "愈动" : "Nhật Tán")
                        : (vuongTuong ? "Ám Động" : "Nhật Phá");
```
| Case | Điều kiện | Code phát ra | Phase 24 lock | Khớp? | Test |
|---|---|---|---|---|---|
| N1 | tĩnh + vượng/tướng | `Ám Động` | Ám Động | ✅ | T1 |
| N2 | tĩnh + hưu/tù | `Nhật Phá` | Nhật Phá | ✅ | T2 |
| N3 | động + hưu/tù | `Nhật Tán`/散 | Nhật Tán/散 | ✅ | T3 |
| N4 | động + vượng/tướng | `愈动` | 愈动 | ✅ | T4 |
- Vượng/suy = `monthVuongSuy` (Nguyệt lệnh, authoritative — không tính lại). `isDong` từ caller (`dongPositions.includes(haoSo)`).
- **Kết luận:** implementation KHỚP 100% Phase 24 lock, mỗi ô đúng 1 nhãn (test assert `toEqual([...])`).

## 3. Nguyệt-Kiến Exception (爻逢月建，日冲而不散)
- **Code:** KHÔNG có guard riêng. Cơ chế: hào lâm Nguyệt (`chiIndex === monthChiIndex`) → `vuongSuyOf` = "Vượng" → nhánh
  `vuongTuong` → nếu động thì `愈动` (KHÔNG `Nhật Tán`/散). ✅ Ngoại lệ đạt qua trạng thái vượng sẵn có.
- **Test T5** xác nhận: lâm Nguyệt + động + Nhật xung → clash = `["愈动"]`, KHÔNG chứa `Nhật Tán`.
- **Kết luận:** architecture reach N4 愈动 qua vượng-state; KHÔNG cần guard tách rời. ✅

## 4. Provenance Matrix
Ba mức: **[P]** primary-text verified (có URL) · **[S]** secondary interpretation · **[D]** project design decision.

| Nhãn | Điều kiện | Primary evidence (verbatim + nguồn) | Mức |
|---|---|---|---|
| **Ám Động** (暗动) | tĩnh+vượng | 增删卜易 日辰章 "冲旺相之静爻，即为暗动"; 易冒 卷三 "日冲安旺之爻为暗动"; 黄金策 "静得冲而暗兴" | **[P]** đa nguồn |
| **Nhật Phá** (日破) | tĩnh+suy | 增删卜易 "冲衰弱之静爻，则为日破"; 易冒 卷三 dùng **暗破** ("日冲静衰之爻谓之暗破") — đồng nghĩa ngữ cảnh | **[P]** (lưu ý dị danh 日破/暗破) |
| **Nhật Tán / 散** | động+suy | 增删卜易 "爻衰而动，冲之则散"; 易冒 卷三 "休囚为散" / "动爻遇冲谓之散"; 黄金策 "动逢冲而事散" | **[P]** đa nguồn |
| **愈动** | động+vượng | 增删卜易 "爻旺而动，冲之愈动" (thuật ngữ 愈动 gốc ở đây); 易冒 卷三 "旺相为动" (ĐỒNG NGHĨA: động-vượng không散, giữ động) | **[P]** thuật ngữ = 增删卜易; ngữ nghĩa được 易冒 hậu thuẫn. Trái với 黄金策/卜筮正宗 (动→散 vô điều kiện) → **[D]** Quân Sư chọn profile 增删卜易/易冒 (Phase 24) |
| **Ngoại lệ Nguyệt kiến** | lâm Nguyệt + Nhật xung | 增删卜易 日辰章 "爻逢月建，日冲而不散"; 易冒 nhấn trọng số Nhật/Nguyệt ("变爻之力，岂不参于日月乎") | **[P]** (rule) + **[D]** (cách triển khai: qua vượng-state, không guard) |

Nguồn URL: 增删卜易 日辰章 — https://www.quanxue.cn/qt_mingxiang/zengshanpy/zengshanpy19.html ;
黄金策 — https://www.quanxue.cn/qt_mingxiang/huangjin/huangjin01.html ;
易冒 卷三 日冲章 — https://daizhige.org/易藏/术数/易冒.html ；
卜筮正宗 — https://www.shidianguji.com/zh/book/HY0057/chapter/1lpdfpe5gs8wz .

## 5. 《易冒》 Q6 Status — RESOLVED (nâng từ UNVERIFIED → PRIMARY-VERIFIED)
- **Nguồn:** 殆知阁 (daizhige.org), 《易冒》**卷三「日冲章第二十七」**.
- **Verbatim:** "日冲安旺之爻为暗动，日冲静衰之爻谓之暗破，空爻遇冲谓之实，动爻遇冲谓之散" và "旺相为动，休囚为散".
- **Ý nghĩa:** 易冒 phân theo 空/不空 × 动/静 × 旺/衰; đặc biệt "旺相为动，休囚为散" = **旺动 giữ động (≈愈动) / 衰动 →
  散** — **ĐỘC LẬP xác nhận** phân biệt N3/N4 mà Quân Sư đã khóa theo 增删卜易. ⇒ Phase 24 giờ có **HAI** nguồn primary
  cho N3/N4 (增删卜易 + 易冒), củng cố quyết định (không chỉ 1 trường phái).
- **Caveat trung thực:** verify qua **1 host + 1 lần fetch tự động**; tự dạng chữ có thể lệch nhẹ theo bản. Đủ để nâng
  khỏi UNVERIFIED, CHƯA phải đối chiếu bản học thuật in. Ghi mức: **PRIMARY (single-host)**.
- **Dị danh cần lưu:** 易冒 gọi tĩnh-suy-xung là **暗破**, còn 增删卜易 gọi **日破** — Quân Sư dùng "Nhật Phá" (日破).
  Đây là dị danh cùng ngữ cảnh, KHÔNG phải mâu thuẫn; KHÔNG đổi code.

## 6. Terminology Finding — 愈动 vs Xung Càng Động
- **愈动** = thuật ngữ **primary verbatim** của 增删卜易 (爻旺而动，冲之愈动). 易冒 dùng cách nói "旺相为动" (đồng nghĩa,
  khác chữ).
- **"Xung Càng Động"** = **gloss tiếng Việt** (diễn giải dự án), KHÔNG phải thuật ngữ cổ.
- **Có bằng chứng buộc đổi thuật ngữ không? KHÔNG.** Nguồn dùng 愈动 → giữ literal `"愈动"` là trung thành nguồn nhất.
  Nếu sau này muốn nhất quán tên tiếng Việt (như "Ám Động"/"Nhật Phá") thì đó là **[D] lựa chọn style dự án**, KHÔNG do
  evidence. **KHÔNG đổi code phase này** (theo yêu cầu + không có evidence buộc đổi).

## 7. 散 / 愈动 → Strength / Conclusion — Open-Question Evidence Matrix
| Ánh xạ tiềm năng | Bằng chứng cổ (verbatim) | Định lượng? | Trạng thái |
|---|---|---|---|
| 散 → giảm base strength (canLucHao `reduced`) | 增删卜易 "散…hại, mất tác dụng động"; 易冒 "休囚为散" | KHÔNG có số | **OPEN [D]** — nguồn nói "mất tác dụng ĐỘNG" (hiệu lực của việc động), KHÔNG nói giảm NỀN lực; map vào `reduced` = quyết định dự án |
| 愈动 → tăng strength/score | 增删卜易 "愈动" (càng động); 易冒 "旺相为动" | KHÔNG có số | **OPEN [D]** — chỉ định tính "càng động", không có delta |
| 散 → ket-luan-su-viec (động không thành, chờ 填实/值日) | 增删卜易 "mất tác dụng động"; (黄金策 "吉不成吉,凶不成凶" — nhưng là profile KHÔNG chọn) | — | **OPEN [D]** — chạm cả **Ứng Kỳ** (khi nào 散 hết) — cần thiết kế riêng |
| 散/愈动 → scoring (chamDiem legacy) | — | — | **OPEN [D]** — hiện rơi điểm 0; không nguồn định lượng |
- **Kết luận §5:** KHÔNG có nguồn cổ **định lượng** hiệu ứng lên strength/conclusion/score. FACT (4 nhãn) đã khóa;
  EFFECT vẫn là **quyết định methodology cấp dự án**. Giữ **FACT-only** cho tới khi Thầy khóa. KHÔNG tự map.

## 8. LOCKED vs OPEN
**LOCKED (đã khóa + đã implement + verify):**
- 4 nhãn N1–N4 (FACT) theo profile 增删卜易 (+易冒 hậu thuẫn N3/N4) — Phase 24 + 25B.
- Ngoại lệ Nguyệt kiến (不散) qua vượng-state — verify T5.
- Nhật Phá(日破,tĩnh-suy) ≠ Nhật Tán(散,động) — khác ô, đa nguồn primary.
- FACT-only downstream (canLucHao/ket-luan/chamDiem KHÔNG đọc 2 nhãn mới — grep xác nhận rỗng).

**OPEN (chờ Thầy, KHÔNG tự quyết):**
- Ánh xạ 散/愈动 → strength (`reduced`?), conclusion, Ứng Kỳ, scoring — không nguồn định lượng.
- Tên hiển thị N4: literal `愈动` (primary) vs gloss VN "Xung Càng Động" (style) — lựa chọn dự án, không evidence buộc.
- 易冒 nâng lên PRIMARY nhưng single-host — nếu cần độ chắc cao hơn, đối chiếu bản in học thuật.
- (Cũ) 卜筮正宗 tinh chỉnh 旺动 chưa xác nhận primary đầy đủ (verse = 动→散).

## 9. Recommendation — Next Methodology Decision Gate
1. **Gate kế tiếp = "Nhật Xung EFFECT lock"** (không phải code): Thầy quyết 散/愈动 có tác động
   strength/conclusion/Ứng Kỳ hay giữ FACT-only vĩnh viễn. Cần vì đây là điểm OPEN lớn nhất còn lại.
2. Trước gate đó, **giữ nguyên FACT-only** (an toàn, đúng nguồn — nguồn chỉ khóa nhãn, không khóa lượng).
3. Nếu Thầy muốn map: ưu tiên hướng "散 = động không phát huy → ảnh hưởng Ứng Kỳ/timing" (đúng nghĩa "mất tác dụng
   động") hơn là giảm base force — nhưng đây chỉ là gợi ý, cần Thầy khóa + evidence.
4. 易冒 in-print đối chiếu = tuỳ chọn, độ ưu tiên thấp (single-host đã đủ cho quyết định hiện tại).

## 10. Phase Boundary
- **runtime: NO · scoring/strength/conclusion: NO · spec: NO · rename 愈动: NO · tests: NO · Phase 26: NO.**
- **doc changed: YES** — chỉ file này. Không đụng western-astrology WIP; không tạo script tạm.
- **Regression:** 308/308 PASS tại HEAD `56db7cb` (297→308, +11). Không "311".
- Commit chỉ doc này. **KHÔNG push.**
