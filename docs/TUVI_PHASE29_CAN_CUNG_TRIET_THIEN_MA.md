# TUVI PHASE 29 — CAN 12 CUNG / TRIỆT / THIÊN MÃ FINAL VERIFICATION

Kết quả: **cả 3 gap đều LOCKED** — tìm được nguồn đủ mạnh cho cả 3, và trong cả 3 trường hợp **code hiện
tại đã đúng, không cần sửa công thức nào**. Chỉ cập nhật comment (nguồn) + bổ sung test còn thiếu. Không
đụng Hỏa Tinh/Linh Tinh/Địa Không/Địa Kiếp/Vòng Bác Sĩ/Tiểu Hạn/Lưu Niên/GM-003/005/006. **Không commit/push.**

---

## 1. Executive Summary

| Gap | Trước Phase 29 | Sau Phase 29 | Thay đổi code |
|---|---|---|---|
| Can 12 cung | NEED_GOLDEN_MASTER_REVIEW | **LOCKED** | Không (chỉ nâng nhãn) |
| Triệt | NEED_GOLDEN_MASTER_REVIEW | **LOCKED** | Không (chỉ nâng nhãn) |
| Thiên Mã | SOURCE_SUPPORTED một phần (1/4 nhóm) | **LOCKED (4/4 nhóm)** | Không (code đã khớp sẵn) |

---

## 2. Can 12 cung — source audit

### Spec yêu cầu (TuVi_Engine_V2.md §7)

> "Phải có bảng `PALACE_STEM_TABLE` theo Can năm sinh. Không hard-code bằng suy luận frontend. Implementation
> phải: `getPalaceStem(yearStem, palaceBranch)` và trả Can của từng cung. Golden Master phải kiểm tra toàn
> bộ 12 Can cung."

Spec KHÔNG tự cho công thức cụ thể (không nói rõ "dùng Ngũ Hổ Độn mở rộng liên tục") — chỉ yêu cầu phải có
hàm/bảng và phải kiểm bằng Golden Master.

### Code hiện tại

`getPalaceStem(yearCanName, palaceChiIndex)` (`engine.ts`) — dùng `NGU_HO_DON` (Can năm → Can tại cung
Dần) rồi mở rộng LIÊN TỤC THUẬN theo 12 Chi qua `canOfChiIndex()`. Đã export tường minh từ Phase 2, nhưng
trước Phase 29 **0 test riêng**, chỉ tự nhất quán.

### Nguồn Nam Phái

Đã thử tìm tài liệu lý thuyết trực tiếp (hocvienlyso.org) giải thích "Ngũ Hổ Độn" và "Thiên Can của cung"
nhưng KHÔNG tìm được đoạn văn xác nhận rõ ràng "mở rộng liên tục thuận theo 12 Chi" bằng chữ. **Thay vào
đó, dùng bằng chứng Level 3 mạnh hơn**: 2 lá số thực tế Nam Phái ĐỘC LẬP đã có sẵn trong project (đọc trực
tiếp ảnh ở Phase 15, KHÔNG cần tra cứu mới):

- **GM-SOURCE-A** (tuvinamphai.vn, Mậu Tuất 1958): ảnh ghi đủ 12 cặp Can-Chi (`D.Tị, M.Ngọ, K.Mùi, C.Thân,
  B.Thìn, T.Dậu, Â.Mão, N.Tuất, G.Dần, Â.Sửu, G.Tý, Q.Hợi`).
- **GM-SOURCE-B** (tuvinamphai.vn, Ất Mùi 1955): ảnh ghi đủ 12 cặp (`T.Tị, N.Ngọ, Q.Mùi, G.Thân, C.Thìn,
  Â.Dậu, K.Mão, B.Tuất, M.Dần, K.Sửu, M.Tý, Đ.Hợi`).

---

## 3. Can 12 cung — implementation (đối chiếu, không sửa)

Đối chiếu `getPalaceStem()` với cả 2 ảnh — **khớp CHÍNH XÁC 24/24** (12 cung × 2 lá số), không sai 1 ô
nào:

```
GM-SOURCE-A (Can năm Mậu): Dần=Giáp Mão=Ất Thìn=Bính Tỵ=Đinh Ngọ=Mậu Mùi=Kỷ Thân=Canh Dậu=Tân
                            Tuất=Nhâm Hợi=Quý Tý=Giáp Sửu=Ất  → khớp 12/12
GM-SOURCE-B (Can năm Ất):  Dần=Mậu Mão=Kỷ Thìn=Canh Tỵ=Tân Ngọ=Nhâm Mùi=Quý Thân=Giáp Dậu=Ất
                            Tuất=Bính Hợi=Đinh Tý=Mậu Sửu=Kỷ  → khớp 12/12
```

**Không sửa `getPalaceStem()`/`canOfChiIndex()`** — công thức đã đúng, chỉ nâng nhãn từ "UNVERIFIED,
tự nhất quán" lên **LOCKED (Level 3, 24/24 khớp thực tế)**.

**JSON contract**: đã kiểm `src/lib/tu-vi/json-contract.ts` — field `TuViJsonPalace.stem` (map từ
`c.canName`) **đã tồn tại sẵn từ Phase 21**, đúng theo spec §34 (`Palace.stem`). Không cần sửa gì.

---

## 4. Triệt — source audit

### Code hiện tại

`TRIET_TABLE` (5 nhóm Can → cặp Chi). Trước Phase 29: DERIVED, "spec chỉ nêu 5 nhóm Can, không kèm cặp
Chi cụ thể".

### Nguồn tìm được

**Nguồn chính (Level 1)**: `hocvienlyso.org/nguyen-ly-khoi-tuan-triet-va-tai-sao-triet-khong-an-tai-tuat-hoi-minhgiac.html`
— bài giải thích CHÍNH XÁC nguyên lý khởi Triệt, nguyên văn:

> "Giáp-Kỷ: Thân-Dậu · Ất-Canh: Ngọ-Mùi · Bính-Tân: Thìn-Tỵ · Đinh-Nhâm: Dần-Mão · Mậu-Quý: Tý-Sửu"

Đối chiếu `TRIET_TABLE`: khớp **CHÍNH XÁC 5/5 nhóm**, không sai 1 cặp nào. Không đề cập phụ thuộc giới
tính (cấu trúc chỉ theo Can năm, không đổi theo giới tính — khớp code).

**Nguồn phụ (source conflict, KHÔNG dùng)**: `hocvienlyso.org/triet-lo-khong-vong.html` cho 1 bảng KHÁC
(Ất-Canh: Tỵ-Mùi, Bính-Tân: Mão-Tỵ...) — trang này dùng phương pháp đếm khác ("Số Thái Huyền"), tự khác
với bảng nguồn chính. Đây là 1 SOURCE CONFLICT thật (2 bài trên CÙNG domain hocvienlyso.org nhưng dùng 2
phương pháp/kết quả khác nhau) — **không chọn theo "đa số"**, ưu tiên nguồn giải thích rõ NGUYÊN LÝ (bài
đầu, có tiêu đề trực tiếp giải thích "tại sao KHÔNG an tại Tuất Hợi" — cho thấy tác giả chủ động phân biệt
với 1 cách hiểu sai phổ biến, đáng tin cậy hơn 1 bài liệt kê con số không giải thích). Ghi nhận tồn tại
biến thể khác, không dùng để ghi đè bảng đã khóa.

### Implementation

Không sửa `TRIET_TABLE` — khớp đúng nguồn chính đã chọn. Status: **LOCKED** (Level 1, 5/5, có ghi nhận 1
biến thể khác tồn tại nhưng không dùng).

---

## 5. Thiên Mã — source audit

### Trạng thái trước Phase 29

Phase 26/27: chỉ xác nhận chắc chắn 1/4 nhóm (Thân/Tý/Thìn→Dần) qua hocvienlyso.org; 3/4 nhóm còn lại gặp
mâu thuẫn nội bộ mỗi lần trích xuất (bảng ảnh không đọc được).

### Nguồn mới tìm được (Level 2)

`tuvivietnam.vn/51-kinh-nghiem-tu-vi-cua-cu-thien-luong...` — bài của tác giả **Trần Việt Sơn**, thuật lại
kinh nghiệm của **"cụ Thiên Lương"** (tác giả/trường phái có tên riêng trong cộng đồng Tử Vi Việt Nam).
Nguyên văn, KHÔNG mâu thuẫn nội bộ (khác hẳn mọi lần trích xuất trước):

> "Tuổi Dần Ngọ Tuất, Thiên Mã tại Thân
> Tuổi Tỵ, Dậu, Sửu, Thiên Mã tại Hợi
> Tuổi Thân Tí Thìn, Thiên Mã tại Dần
> Tuổi Hợi, Mão, Mùi, Thiên Mã tại Tỵ"

Kèm nguyên tắc kiểm chứng chéo (nguyên văn nguồn, không phải suy diễn của em): *"mỗi bộ ba tam hợp tuổi có
1 Chi đứng đầu, Thiên Mã ở cung ĐỐI DIỆN (xung) với Chi đứng đầu ấy"* — ví dụ minh hoạ ngay trong nguồn:
"Dần Ngọ Tuất (Dần đứng đầu) → Thiên Mã đối diện Dần = Thân".

### Đối chiếu code

| Nhóm | Code (`THIEN_MA_START`) | Nguồn | Khớp? |
|---|---|---|---|
| Thân/Tý/Thìn (group 0) | Dần | Dần | ✅ |
| Dần/Ngọ/Tuất (group 1) | Thân | Thân | ✅ |
| Tỵ/Dậu/Sửu (group 2) | Hợi | Hợi | ✅ |
| Hợi/Mão/Mùi (group 3) | Tỵ | Tỵ | ✅ |

**Khớp 4/4** — đã tự kiểm tra thêm bằng chính nguyên tắc "đối diện" nguồn cho: cả 4 nhóm đều thỏa
`|vị trí Mã − Chi đứng đầu| ≡ 6 (mod 12)` (đối xung), không có ngoại lệ. Không phụ thuộc giới tính/Can năm
(nguồn không đề cập).

### Implementation

Không sửa `THIEN_MA_START` — khớp đúng nguồn cho cả 4/4 nhóm. Status: **LOCKED** (Level 2, 4/4, tự kiểm
chứng chéo bằng nguyên tắc đối xung).

---

## 6. Source hierarchy

| Nguồn | Level | Dùng cho | Ghi chú |
|---|---|---|---|
| GM-SOURCE-A/B (tuvinamphai.vn, đã có từ Phase 15) | 3 | Can 12 cung | 2 lá số độc lập, không phải chép lại nhau |
| hocvienlyso.org "nguyên lý khởi Tuần Triệt" | 1 | Triệt | Chính domain, giải thích nguyên lý rõ ràng |
| hocvienlyso.org "triệt lộ không vong" | 4 (OTHER phương pháp, không dùng) | — | Ghi nhận biến thể, không dùng |
| tuvivietnam.vn (Trần Việt Sơn, "kinh nghiệm cụ Thiên Lương") | 2 | Thiên Mã | Tác giả rõ ràng, có tên nguồn/trường phái cụ thể |

---

## 7. Golden Master coverage

| Gap | GM-001 | GM-002 | GM-003 | GM-004 | GM-005 | GM-006 |
|---|---|---|---|---|---|---|
| Can 12 cung | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA |
| Triệt | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA | PARTIAL (mơ hồ) |
| Thiên Mã | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA |

Không GM nào (trong 6 GM chính thức) ghi rõ Can từng cung/Triệt cụ thể/Thiên Mã — LOCKED ở đây dựa trên
nguồn Level 1-3 khác (lá số thực tế + tài liệu Nam Phái), không phải Golden Master chính thức. Không tự
tạo expected từ GM.

---

## 8. Implementation changes

`src/lib/tu-vi/rules.ts`: cập nhật comment cho `THIEN_MA_START` (Mục 24) và `TRIET_TABLE` (Mục 32) — ghi
nguồn Level đã xác nhận, **không đổi bất kỳ giá trị nào**.

`src/lib/tu-vi/engine.ts`: cập nhật comment cho `getPalaceStem()` — ghi nguồn Level 3 (2 lá số thực tế),
**không đổi công thức**.

**Không đổi**: `canOfChiIndex`, `NGU_HO_DON`, `TRIET_TABLE` giá trị, `THIEN_MA_START` giá trị,
`json-contract.ts` (đã đúng sẵn từ Phase 21), toàn bộ `TuViChart`/`CungKetQua`, renderer.

---

## 9. Test matrix

File mới: `tests/tu-vi-phase29-can-cung-triet-thien-ma.test.ts` (46 test).

| Nhóm | Nội dung |
|---|---|
| Can 12 cung — GM-SOURCE-A | 12 test, đối chiếu `getPalaceStem("Mậu", ...)` với ảnh gốc |
| Can 12 cung — GM-SOURCE-B | 12 test, đối chiếu `getPalaceStem("Ất", ...)` với ảnh gốc |
| Can 12 cung — tích hợp GM-001→006 | 6 test, xác nhận deterministic + không đổi 14 chính tinh |
| Triệt | 10 test, đối chiếu `TRIET_TABLE` với nguồn hocvienlyso.org |
| Thiên Mã | 4 + 1 test, đối chiếu đủ 4/4 nhóm + xác nhận nguyên tắc đối xung |
| Golden Master coverage | 1 test ghi nhận 0/6 |

```
npx vitest run
```

```
Test Files  23 passed (23)
     Tests  716 passed | 5 expected fail (721)
```

Trước Phase 29: 670 pass + 5 expected-fail (675). Sau: 716 pass + 5 expected-fail (721) — **+46 test mới**,
đúng bằng file mới. **0 unexpected failure.** Không xóa test cũ (Phase 18B Triệt test và Phase 26 Thiên Mã
test vẫn nguyên vẹn). Không sửa Golden Master. Không sửa expected để ép pass (chỉ thêm test mới).

---

## 10. Regression

Xác nhận KHÔNG thay đổi (mục XIV): Mệnh, Thân, 12 cung, Cục, 14 chính tinh, status Nguyên Cát, Tứ Hóa, Đại
Vận, 4 trụ, Kình Dương, Đà La, Khôi Việt, Xương Khúc, Tả Hữu, Thiên Diêu, Thiên Y, Tràng Sinh, Thái Tuế —
toàn bộ test cũ (Phase 16-28) chạy lại PASS nguyên vẹn, không ảnh hưởng gì (chỉ thêm comment + test mới,
0 thay đổi công thức/giá trị).

---

## 11. Remaining gaps

| Vấn đề | Trạng thái |
|---|---|
| Can 12 cung chưa có Golden Master CHÍNH THỨC (chỉ có lá số Level 3) | Chấp nhận được — LOCKED dựa trên bằng chứng thực tế mạnh, không cần chờ GM chính thức |
| Triệt — biến thể khác ("Số Thái Huyền") tồn tại trên cùng domain hocvienlyso.org | Ghi nhận, không giải quyết (không phải phạm vi Phase 29 — không trộn phương pháp) |
| Thiên Mã — "cụ Thiên Lương" có thể là 1 trường phái/tác giả riêng trong Nam Phái, chưa xác nhận tuyệt đối cùng nhánh Nguyên Cát/Học Viện Lý Số đã dùng cho phần lớn phụ tinh khác | Rủi ro thấp — không phải nguồn Trung Hoa/Đài Loan (không phải OTHER_SCHOOL theo nghĩa đã dùng xuyên suốt project), chỉ là 1 tác giả Việt Nam khác trong cùng hệ Nam Phái |

---

## FINAL STATUS

```
CAN_12_CUNG = LOCKED
TRIỆT       = LOCKED
THIÊN MÃ    = LOCKED
```

**KHÔNG COMMIT/PUSH.**
