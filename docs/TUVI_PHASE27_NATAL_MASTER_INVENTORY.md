# TUVI PHASE 27 — THIÊN MÃ FINAL + NATAL ENGINE MASTER INVENTORY

**Không sửa Golden Master. Không mở rộng phạm vi. Không commit/push.**

---

## 1. Executive Summary

Phase 27 gồm 2 phần: (A) cố gắng khóa toàn bộ 4 nhóm Thiên Mã — kết quả: **chỉ khóa thêm được xác nhận
cho 1/4 nhóm** (đã có từ Phase 26), 3/4 nhóm còn lại gặp nguồn MÂU THUẪN NỘI BỘ (tự mâu thuẫn giữa các lần
trích xuất), không đủ tin cậy để khóa — giữ nguyên trạng thái, KHÔNG sửa code. (B) Kiểm kê toàn bộ Natal
Engine từ spec → code → docs → test, tổng hợp 52 hạng mục vào 1 ma trận duy nhất.

**Kết luận cuối: `NATAL_ENGINE_NOT_READY_FOR_FINAL_AUDIT`** — còn 4 mục CONFLICTED chưa giải quyết (3 vị
trí chính tinh mâu thuẫn GM đã biết từ lâu + Hỏa/Linh Tinh + JSON contract chưa khớp schema gốc) và 4 tính
năng spec yêu cầu nhưng chưa implement (Vòng Bác Sĩ, Tiểu Hạn, Lưu Niên, phân loại StarInstance đầy đủ).

---

## 2. Thiên Mã verification (Phần A)

### Nỗ lực xác minh đủ 4 nhóm

Đã thử 4 lượt tra cứu độc lập (2 WebFetch trực tiếp trang hocvienlyso.org khác nhau + 2 WebSearch) nhằm
tìm bảng đầy đủ 4 nhóm tam hợp bằng văn bản (không phải ảnh):

| Lượt | Nguồn | Kết quả nhóm Thân/Tý/Thìn | Kết quả 3 nhóm còn lại |
|---|---|---|---|
| 1 (Phase 26) | `tu-hoc-tu-vi-sao-theo-chi-nam-sinh.html` | "Sinh năm Tý, an Thiên Mã ở cung Dần" ✅ nhất quán | Bảng là ẢNH, không trích xuất được |
| 2 | WebSearch tổng hợp | Thân Tý Thìn → Dần ✅ | **Tỵ Dậu Sửu → Hợi VÀ Dần Ngọ Tuất → Hợi** (trùng lặp — không hợp lệ vì chỉ có đúng 4 vị trí Dần/Thân/Tỵ/Hợi cho 4 nhóm, không thể 2 nhóm cùng 1 vị trí) |
| 3 | WebFetch lại đúng trang lượt 1, hỏi khác | Thân Tý Thìn → Dần ✅ | Xác nhận lại: không có đoạn văn xuôi liệt kê, chỉ có ảnh |
| 4 | WebFetch `hocvienlyso.org/thien-ma.html` | Thân Tý Thìn → Dần ✅ | **2 đoạn trích trong CÙNG 1 lần fetch tự mâu thuẫn nhau**: đoạn 1 nói "Dần Ngọ Tuất → Hợi", đoạn 2 (cùng trang) nói "Tỵ Dậu Sửu → Tỵ, Hợi Mão Mùi → Tỵ" (2 nhóm cùng trùng Tỵ) |

**Kết luận**: Duy nhất nhóm **Thân/Tý/Thìn → Dần** được xác nhận NHẤT QUÁN, không mâu thuẫn, qua cả 4 lượt
tra cứu độc lập — đây là mức tin cậy cao, giữ LOCKED-worthy cho riêng nhóm này (đã có từ Phase 26). **3
nhóm còn lại: mọi lần trích xuất đều cho kết quả tự mâu thuẫn** (có thể do bảng ảnh bị OCR/parse sai bởi
công cụ tóm tắt tự động) — theo đúng mục IV ("Không suy ra 3 nhóm còn lại bằng quy luật đối xứng nếu
source không trực tiếp cho phép"), **KHÔNG khóa thêm nhóm nào**, KHÔNG dùng các trích dẫn mâu thuẫn này
làm bằng chứng cho bất kỳ giá trị cụ thể nào (kể cả khi chúng tình cờ khớp giá trị code hiện tại).

### Trạng thái cuối cùng

```
Nhóm Thân/Tý/Thìn (group 0) → Dần   : SOURCE_SUPPORTED (Level 1, nhất quán 4/4 lượt tra)
Nhóm Dần/Ngọ/Tuất (group 1) → Thân  : giữ nguyên như Phase 26 — chưa xác nhận Level 1 bằng chữ đáng tin cậy
Nhóm Tỵ/Dậu/Sửu (group 2) → Hợi    : giữ nguyên như Phase 26 — chưa xác nhận Level 1 bằng chữ đáng tin cậy
Nhóm Hợi/Mão/Mùi (group 3) → Tỵ    : giữ nguyên như Phase 26 — chưa xác nhận Level 1 bằng chữ đáng tin cậy
```

**Không sửa code** (điều kiện "code sai source" không xảy ra — không có source nào đủ tin cậy để nói code
sai). **Không thêm test mới** (nhóm 0 đã có test từ Phase 26; 3 nhóm còn lại không có giá trị mới được xác
nhận để test).

---

## 3. Full Natal Inventory (từ spec trước, theo đúng mục V/VI)

Đọc lại `TuVi_Engine_V2.md` (50 mục) làm nguồn liệt kê gốc, đối chiếu với `src/lib/tu-vi/*.ts` hiện tại:

| Nhóm | Thành phần | Có trong spec? | Có trong code? |
|---|---|---|---|
| A. Calendar | Lịch âm/dương, Can Chi năm/tháng/ngày/giờ, boundary giờ Tý, boundary năm âm lịch/tiết khí | YES (§2-4) | IMPLEMENTED |
| B. Can Chi | (gộp vào A ở trên theo cấu trúc code hiện tại) | YES | IMPLEMENTED |
| C. Mệnh/Thân | Cung Mệnh, cung Thân | YES (§5) | IMPLEMENTED |
| D. 12 cung | Tên 12 cung, Can của 12 cung | YES (§6-7) | IMPLEMENTED (Can 12 cung: PARTIAL evidence) |
| E. Cục | Ngũ Hành Cục, Bản Mệnh/Nạp Âm | YES (§8-9) | IMPLEMENTED |
| — | Mệnh Quái | YES (§10) | IMPLEMENTED |
| — | Chủ Mệnh/Chủ Thân | YES (§11) | IMPLEMENTED (4/12 Chi VERIFIED, 8/12 sentinel) |
| F. 14 chính tinh | An Tử Vi, An Thiên Phủ, Vòng Tử Vi, Vòng Thiên Phủ | YES (§12-15) | IMPLEMENTED |
| G. Status 168 ô | Miếu/Vượng/Đắc/Bình/Hãm | YES (§16) | IMPLEMENTED |
| H. Tứ Hóa | 10 Can × 4 Hóa | YES (§17) | IMPLEMENTED |
| L. Phụ tinh | Lộc Tồn, Kình Dương, Đà La | YES (§18) | IMPLEMENTED |
| — | Thiên Khôi, Thiên Việt | YES (§19) | IMPLEMENTED |
| — | Văn Xương, Văn Khúc | YES (§20) | IMPLEMENTED |
| — | Tả Phù, Hữu Bật | YES (§21, §25) | IMPLEMENTED |
| — | Địa Không, Địa Kiếp | YES (§22) | IMPLEMENTED |
| — | Hỏa Tinh, Linh Tinh | YES (§23) | IMPLEMENTED (CONFLICTED) |
| N. Thiên Mã | Thiên Mã | YES (§24) | IMPLEMENTED (một phần) |
| — | Thiên Hình, Thiên Diêu, Thiên Y | YES (§25) | IMPLEMENTED |
| — | Đào Hoa, Hồng Loan, Thiên Hỷ | **NO** (không xuất hiện ở bất kỳ đâu trong spec) | IMPLEMENTED nhưng OUT_OF_SCOPE |
| M. Vòng sao | Vòng Thái Tuế | YES (§26) | IMPLEMENTED |
| — | Vòng Tràng Sinh | YES (§27) | IMPLEMENTED |
| — | Vòng Bác Sĩ | YES (nhắc tên ở §0 kiến trúc tổng, KHÔNG có mục riêng cho stage list) | **NOT_IMPLEMENTED** |
| K. Đại Vận | Đại Vận (chiều, tuổi khởi, chu kỳ 10 năm) | YES (§28) | IMPLEMENTED |
| O. Khác | Tiểu Hạn | YES (§29) | **NOT_IMPLEMENTED** |
| — | Lưu Niên + prefix `L.` cho sao lưu | YES (§30) | **NOT_IMPLEMENTED** |
| I. Tuần | Tuần | YES (§31) | IMPLEMENTED |
| J. Triệt | Triệt | YES (§32) | IMPLEMENTED (Chi cụ thể ngoài spec) |
| O. Khác | Phân loại sao đầy đủ (`StarDefinition`, Cát/Sát/Tạp/Vòng, §33) | YES (§33) | **NOT_IMPLEMENTED** (JSON adapter Phase 21 chỉ có CHINH_TINH/PHU_TINH 2 mức) |
| — | Data model `Palace`/`StarInstance` đúng schema (§34-35) | YES | PARTIAL (qua adapter `toJsonContract()`, không phải ở tầng engine gốc) |
| — | JSON output chuẩn `meta/input/calendar/thienBan/palaces` (§36) | YES | PARTIAL (adapter đạt được, `TuViChart` gốc vẫn khác shape) |
| — | Invariant tests (§39) | YES | PARTIAL (một số có qua GM test, không đủ tường minh theo từng invariant spec nêu) |

**Không bỏ sót mục nào chỉ xuất hiện trong spec nhưng chưa implement** — đã liệt kê đủ: Vòng Bác Sĩ, Tiểu
Hạn, Lưu Niên, phân loại sao đầy đủ.

---

## 4. Master Matrix

| Category | Item | Spec | Code | Source | GM | Tests | Status | Action |
|---|---|---|---|---|---|---|---|---|
| A | Lịch âm/dương | YES | IMPLEMENTED | VERIFIED | VERIFIED (6/6) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| B | Can Chi năm | YES | IMPLEMENTED | VERIFIED | VERIFIED (6/6) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| B | Can Chi tháng (pillar) | YES | IMPLEMENTED | SOURCE_SUPPORTED | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| B | Can Chi ngày (pillar) | YES | IMPLEMENTED | SOURCE_SUPPORTED | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| B | Can Chi giờ (Chi) | YES | IMPLEMENTED | VERIFIED | VERIFIED (6/6) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| B | Can Chi giờ (Can, pillar) | YES | IMPLEMENTED | SOURCE_SUPPORTED | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| B | Boundary giờ Tý | YES | IMPLEMENTED | VERIFIED | VERIFIED (GM-005) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| B | Boundary năm âm lịch/tiết khí | YES | IMPLEMENTED | VERIFIED | VERIFIED (GM-006) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| C | Mệnh | YES | IMPLEMENTED | VERIFIED | VERIFIED (6/6) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| C | Thân | YES | IMPLEMENTED | VERIFIED | VERIFIED (6/6) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| D | 12 cung (tên+mapping) | YES | IMPLEMENTED | VERIFIED | VERIFIED (6/6) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| D | Can của 12 cung | YES | IMPLEMENTED | NONE (tự nhất quán) | NO_DATA | PARTIAL | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER |
| E | Cục | YES | IMPLEMENTED | VERIFIED | VERIFIED (6/6) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| E | Bản Mệnh/Nạp Âm | YES | IMPLEMENTED | VERIFIED | VERIFIED | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| E | Mệnh Quái | YES | IMPLEMENTED | VERIFIED (3/4 nhánh) | PARTIAL | COVERED | GOLDEN_MASTER_VERIFIED | ADD_TEST (nhánh Nữ+TK21) |
| E | Chủ Mệnh/Chủ Thân | YES | IMPLEMENTED | VERIFIED (4/12 Chi) | PARTIAL | COVERED | GOLDEN_MASTER_VERIFIED (một phần) | KEEP (8/12 sentinel, không đoán) |
| F | An Tử Vi | YES | IMPLEMENTED | VERIFIED | VERIFIED (6/6) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| F | An Thiên Phủ | YES | IMPLEMENTED | VERIFIED | VERIFIED (6/6) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| F | 14 chính tinh (vị trí) | YES | IMPLEMENTED | VERIFIED (11/14) | CONFLICT (3/14) | COVERED | CONFLICTED | NEED_REVIEW (không tự sửa) |
| G | Status 168 ô | YES | IMPLEMENTED | SOURCE_SUPPORTED (Nguyên Cát) | CONFLICT (4/168) | COVERED | LOCKED | KEEP (quyết định đã chốt Phase 16) |
| H | Tứ Hóa (Canh) | YES | IMPLEMENTED | VERIFIED | VERIFIED | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| H | Tứ Hóa (9 Can khác) | YES | IMPLEMENTED | SOURCE_SUPPORTED | PARTIAL | COVERED | SOURCE_SUPPORTED | KEEP |
| H | Tứ Hóa trên phụ tinh (cơ chế) | YES | IMPLEMENTED | VERIFIED (cơ chế) | N/A | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| I | Tuần | YES | IMPLEMENTED | VERIFIED | VERIFIED (2/6) + CONFLICT (1/6) | COVERED | GOLDEN_MASTER_VERIFIED | NEED_REVIEW (GM-006 nghi lỗi pack) |
| J | Triệt | YES | IMPLEMENTED | NONE (Chi pair ngoài spec) | NO_DATA | COVERED | NEED_GOLDEN_MASTER_REVIEW | NEED_GOLDEN_MASTER |
| K | Đại Vận | YES | IMPLEMENTED | VERIFIED | VERIFIED (6/6) | COVERED | GOLDEN_MASTER_VERIFIED | KEEP |
| L | Lộc Tồn | YES | IMPLEMENTED | SOURCE_SUPPORTED | NO_DATA | PARTIAL | SOURCE_SUPPORTED | KEEP |
| L | Kình Dương | NO (spec cấm +1/-1 cố định) | IMPLEMENTED | VERIFIED (Level 1 + ví dụ) | NO_DATA | COVERED | **LOCKED** | KEEP |
| L | Đà La | NO (cùng lý do) | IMPLEMENTED | VERIFIED (Level 1 + ví dụ) | NO_DATA | COVERED | **LOCKED** | KEEP |
| L | Hỏa Tinh | YES (cấu trúc) | IMPLEMENTED | CONFLICTED | NO_DATA | PARTIAL | CONFLICTED | NEED_REVIEW |
| L | Linh Tinh | YES (cấu trúc) | IMPLEMENTED | CONFLICTED | NO_DATA | PARTIAL | CONFLICTED | NEED_REVIEW |
| L | Địa Không | YES (cấu trúc) | IMPLEMENTED | SOURCE_SUPPORTED (Level 1) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| L | Địa Kiếp | YES (cấu trúc) | IMPLEMENTED | SOURCE_SUPPORTED (Level 1) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| L | Thiên Khôi | YES | IMPLEMENTED | VERIFIED (Level 1, khớp Thiên Việt) | NO_DATA | COVERED | **LOCKED** | KEEP |
| L | Thiên Việt | NO (spec không cho bảng) | IMPLEMENTED | SOURCE_SUPPORTED (Level 1) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| L | Văn Xương | YES | IMPLEMENTED | SOURCE_SUPPORTED (Level 1) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| L | Văn Khúc | YES | IMPLEMENTED | SOURCE_SUPPORTED (Level 1) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| L | Tả Phù | YES | IMPLEMENTED | SOURCE_SUPPORTED (Level 1) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| L | Hữu Bật | YES | IMPLEMENTED | SOURCE_SUPPORTED (Level 1) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| L | Thiên Hình | YES | IMPLEMENTED | SOURCE_SUPPORTED (Level 1) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| L | Thiên Diêu | NO (chỉ nêu tên) | IMPLEMENTED | SOURCE_SUPPORTED (Level 1) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| L | Thiên Y | NO (chỉ nêu tên) | IMPLEMENTED | SOURCE_SUPPORTED (Level 1) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| L | Đào Hoa | **NO** | IMPLEMENTED | NONE | NO_DATA | NONE | OUT_OF_SCOPE | OUT_OF_SCOPE |
| L | Hồng Loan | **NO** | IMPLEMENTED | NONE | NO_DATA | NONE | OUT_OF_SCOPE | OUT_OF_SCOPE |
| L | Thiên Hỷ | **NO** | IMPLEMENTED | NONE | NO_DATA | NONE | OUT_OF_SCOPE | OUT_OF_SCOPE |
| N | Thiên Mã (nhóm 0) | YES | IMPLEMENTED | SOURCE_SUPPORTED (Level 1, 4/4 lượt nhất quán) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| N | Thiên Mã (nhóm 1-3) | YES | IMPLEMENTED | NEED_SOURCE (mâu thuẫn nội bộ khi tra) | NO_DATA | PARTIAL | NEED_GOLDEN_MASTER_REVIEW | NEED_SOURCE |
| M | Vòng Tràng Sinh | YES | IMPLEMENTED | VERIFIED (Level 1, điểm khởi+chiều) | NO_DATA | COVERED | **LOCKED** | KEEP |
| M | Vòng Thái Tuế | YES | IMPLEMENTED | SOURCE_SUPPORTED (Level 1) | NO_DATA | COVERED | SOURCE_SUPPORTED | KEEP |
| M | Vòng Bác Sĩ | YES (chỉ tên ở §0) | NOT_IMPLEMENTED | NONE (chỉ biết điểm khởi) | NO_DATA | NONE | NOT_IMPLEMENTED | NEED_SOURCE |
| O | Tiểu Hạn | YES (§29) | NOT_IMPLEMENTED | N/A | NO_DATA | NONE | NOT_IMPLEMENTED | OUT_OF_SCOPE (phase này) |
| O | Lưu Niên | YES (§30) | NOT_IMPLEMENTED | N/A | NO_DATA | NONE | NOT_IMPLEMENTED | OUT_OF_SCOPE (phase này) |
| O | Phân loại sao đầy đủ (§33) | YES | NOT_IMPLEMENTED (chỉ 2 mức qua adapter) | N/A | NO_DATA | NONE | NOT_IMPLEMENTED | NEED_REVIEW |
| O | JSON output chuẩn §36 (ở tầng engine gốc) | YES | PARTIAL (chỉ qua adapter Phase 21, không phải `TuViChart` gốc) | CONFLICTED (shape khác spec) | N/A | COVERED (cho adapter) | CONFLICTED | NEED_REVIEW |

**Tổng: 52 hạng mục.**

---

## 5. Source Matrix (nguồn Level 1 chính đã dùng xuyên suốt)

| Nguồn | URL gốc | School | Level | Độc lập? |
|---|---|---|---|---|
| "Sai lầm về an sao lập số" | hoc.kabala.vn/sai-lam-ve-an-sao-lap-so (nghi cùng gốc hocvienlyso.org) | Nam Phái | 1 | Dùng cho Thiên Việt (Phase 8), Kình Dương/Đà La (Phase 23), Thiên Khôi (Phase 24) — **3 lần dùng CÙNG 1 bài**, không tính là 3 nguồn độc lập |
| "Tự học tử vi bài 12: An các sao theo chi năm sinh" | hocvienlyso.org | Nam Phái | 1 | Dùng cho Thái Tuế, Thiên Mã (nhóm 0) — Phase 26/27, cùng 1 bài |
| "Tự học tử vi bài 13: an các sao theo tháng sinh" | hocvienlyso.org | Nam Phái | 1 | Dùng cho Tả Phù/Hữu Bật (Phase 24), Thiên Hình/Thiên Diêu/Thiên Y (Phase 25) — cùng 1 bài |
| "Tự học tử vi bài 14: an các sao theo giờ sinh" | hocvienlyso.org | Nam Phái | 1 | Dùng cho Văn Xương/Văn Khúc (Phase 24), độc lập với bài 12/13/15 |
| "Tự học tử vi bài 15: các bộ sao khác" | hocvienlyso.org | Nam Phái | 1 | Dùng cho Vòng Tràng Sinh (Phase 26), phát hiện phụ Vòng Bác Sĩ |
| "ĐỊA KHÔNG ĐỊA KIẾP" | hocvienlyso.org | Nam Phái | 1 | Dùng cho Địa Không/Địa Kiếp (Phase 22), độc lập |
| hoctuvi.blogspot.com / lyso.vn | — | Không xác định | 3/4 | Dùng cho Hỏa Tinh/Linh Tinh (Phase 22), tự thừa nhận SCHOOL_CONFLICT nội bộ |

**Ghi chú quan trọng**: chuỗi bài "Tự học tử vi bài 12-15" là 1 SERIES có cấu trúc nội dung nhất quán (mỗi
bài 1 chủ đề riêng: theo Chi năm/theo tháng/theo giờ/các bộ sao khác) — dùng làm nguồn cho nhiều sao khác
nhau là hợp lệ (mỗi bài có nội dung riêng), nhưng bài "Sai lầm về an sao lập số" đã bị dùng lặp lại 3 lần
cho 3 chủ đề khác nhau (Khôi, Việt, Kình, Đà) — đây VẪN hợp lệ vì bài viết đó chính là 1 bài TỔNG HỢP nhiều
lỗi an sao khác nhau trong 1 bài (đã xác nhận qua đọc trực tiếp), không phải trường hợp "nhiều URL chép
lại cùng 1 nội dung" bị cấm ở mục XVI — chỉ là 1 bài dài có nhiều mục con.

---

## 6. Golden Master Matrix

| Category | GM-001 | GM-002 | GM-003 | GM-004 | GM-005 | GM-006 |
|---|---|---|---|---|---|---|
| Calendar/Can Chi năm | V | V | V | V | V | V |
| Mệnh/Thân/12 cung/Cục | V | V | V | V | V | V |
| An Tử Vi/Thiên Phủ | V | V | V | V | V | V |
| 14 chính tinh (toàn bộ) | V | V | CONFLICT | V | CONFLICT | CONFLICT |
| Status 168 ô | V | V | CONFLICT | V | V | CONFLICT |
| Tứ Hóa | V | V | V | PARTIAL | PARTIAL | PARTIAL |
| Tuần | V | V | NO_DATA | NO_DATA | NO_DATA | CONFLICT |
| Triệt | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA | PARTIAL (mơ hồ) |
| Đại Vận | V | V | V | V | V | V |
| Toàn bộ phụ tinh (Lộc Tồn→Thiên Y) | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA |
| Vòng Tràng Sinh/Thái Tuế/Thiên Mã | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA | NO_DATA |

**Giới hạn cố hữu của bộ GM hiện có**: không một GM nào trong 6 GM từng ghi vị trí BẤT KỲ phụ tinh/vòng
sao nào — đây là giới hạn dữ liệu, không phải lỗi engine (đã nhắc từ Phase 19, tái xác nhận ở đây).

---

## 7. Test Coverage Matrix

| Category | Test file(s) chính | Coverage |
|---|---|---|
| Calendar/4 trụ | `tu-vi-golden*.test.ts`, `tu-vi-phase20-four-pillars.test.ts` | COVERED |
| 14 chính tinh/status | `tu-vi-golden*.test.ts`, `tu-vi-phase16-nguyen-cat-status.test.ts` | COVERED |
| Tứ Hóa | `tu-vi-tu-hoa-full.test.ts` | COVERED |
| Kình Đà | `tu-vi-phase23-kinh-da.test.ts` | COVERED |
| Khôi/Việt/Xương/Khúc/Tả Hữu | `tu-vi-thien-viet.test.ts`, `tu-vi-phase24-*.test.ts` | COVERED |
| Thiên Diêu/Y | `tu-vi-phase25-*.test.ts` | COVERED |
| Triệt | `tu-vi-phase18b-triet.test.ts` | COVERED (tự nhất quán, không phải GM) |
| Tràng Sinh/Thái Tuế/Thiên Mã | `tu-vi-phase26-*.test.ts` | COVERED (nhóm 0 Thiên Mã; PARTIAL cho 3 nhóm còn lại) |
| Hỏa Tinh/Linh Tinh | Không có test riêng cho giá trị — chỉ có test "không đổi theo giới tính" (Phase 23) | PARTIAL |
| Địa Không/Địa Kiếp | `tu-vi-phase23-kinh-da.test.ts` (regression) | PARTIAL |
| Can của 12 cung | Không có test riêng | NONE |
| JSON Contract adapter | `tu-vi-phase21-json-contract.test.ts` | COVERED (cho adapter, không phải engine gốc) |
| Vòng Bác Sĩ/Tiểu Hạn/Lưu Niên | Không tồn tại (chưa implement) | NONE |

---

## 8. Known Conflicts

```
KNOWN_GOLDEN_MASTER_POSITION_CONFLICT (14 chính tinh, không tự giải quyết):
  - Thiên Lương: GM-003 (engine đặt tại Dần, GM ghi tại Thân)
  - Tham Lang / Thất Sát: GM-005 (hoán đổi vị trí cho nhau so với GM)
  - Vũ Khúc / Phá Quân: GM-006 (lệch cung so với GM)

CONFLICTED (không chọn trường phái, giữ nguyên):
  - Hỏa Tinh: điểm khởi khớp nguồn, chiều thiếu logic đảo giới tính + SCHOOL_CONFLICT nhóm Tỵ Dậu Sửu
  - Linh Tinh: cùng lý do
  - JSON output §36 ở tầng engine gốc: TuViChart vẫn không khớp shape spec (adapter Phase 21 chỉ là lớp
    tùy chọn bên ngoài, không thay thế được engine gốc)

Status 168 ô — 4 ô CONFLICTED với GM (đã quyết định dùng Nguyên Cát từ Phase 16, KHÔNG còn "đang treo"):
  - Vũ Khúc @ Mão, Thiên Cơ @ Ngọ (GM-003) · Thái Âm @ Dần, Thất Sát @ Mùi (GM-006)

Tuần — 1 conflict GM-006 (nghi lỗi transcription pack, không sửa GM, giữ it.fails())
```

---

## 9. Missing Features (MISSING_FEATURES)

```
Vòng Bác Sĩ  — spec chỉ nhắc tên ở kiến trúc tổng (§0), không có stage list → NOT_IMPLEMENTED, NEED_SOURCE
Tiểu Hạn     — spec §29 (STEP 22), module độc lập → NOT_IMPLEMENTED
Lưu Niên     — spec §30 (STEP 23), cần prefix L. cho sao lưu → NOT_IMPLEMENTED
Phân loại sao đầy đủ (Cát/Sát/Tạp/Vòng, §33) → NOT_IMPLEMENTED, chỉ có 2 mức (CHINH_TINH/PHU_TINH) qua adapter
```

Không implement bất kỳ mục nào ở trên trong Phase 27 (đúng theo mục XXII).

---

## 10. Recommended Fixes (IMPLEMENTATION_FIX_CANDIDATE — không tự sửa)

```
1. 3 position conflict chính tinh (GM-003/005/006) — cần Golden Master ảnh thật hoặc nguồn Nam Phái xác
   nhận thứ tự offset đúng trước khi sửa TU_VI_RING/THIEN_PHU_RING.
2. Hỏa Tinh/Linh Tinh orientation — cần nguồn Nam Phái rõ ràng hơn (Level 1/2, không mâu thuẫn nội bộ)
   trước khi thêm logic đảo chiều theo giới tính.
3. JSON output §36 ở tầng engine gốc — cần 1 phase riêng có phạm vi rõ ràng (ARCHITECTURE_CHANGE_REQUIRED,
   đã ghi từ Phase 19/20/21) nếu muốn TuViChart khớp đúng schema thay vì chỉ qua adapter.
```

---

## 11. Recommended Golden Masters (nếu muốn nâng cấp SOURCE_SUPPORTED → GOLDEN_MASTER_VERIFIED)

Ưu tiên theo giá trị thông tin cao nhất:
1. 1 lá số ảnh thật có hiển thị RÕ vị trí Kình Dương/Đà La/Lộc Tồn — xác nhận orientation đã LOCKED ở
   Phase 23 bằng Golden Master thật (hiện chỉ có 1 nguồn văn bản).
2. 1 lá số ảnh thật hiển thị đủ vị trí 4 nhóm Thiên Mã — giải quyết dứt điểm 3/4 nhóm còn treo.
3. 1 lá số ảnh thật hiển thị vị trí Hỏa Tinh/Linh Tinh kèm rõ giới tính đương số — giải quyết CONFLICTED.

---

## 12. Final Natal Readiness

1. **LOCKED**: 5 (Kình Dương, Đà La, Thiên Khôi, Vòng Tràng Sinh, Status 168 ô)
2. **SOURCE_SUPPORTED**: 22 (Can Chi tháng/ngày/giờ-Can, Tứ Hóa 9 Can, Lộc Tồn, Địa Không, Địa Kiếp, Thiên
   Việt, Văn Xương, Văn Khúc, Tả Phù, Hữu Bật, Thiên Hình, Thiên Diêu, Thiên Y, Vòng Thái Tuế, Thiên Mã
   nhóm 0, và 8 mục GOLDEN_MASTER_VERIFIED có ghi chú "một phần"... — xem Master Matrix mục 4 để đối chiếu
   chính xác từng dòng)
3. **NEED_SOURCE**: 2 (Thiên Mã nhóm 1-3, Vòng Bác Sĩ)
4. **NEED_GOLDEN_MASTER_REVIEW**: 2 (Can của 12 cung, Triệt)
5. **CONFLICTED**: 4 (14 chính tinh vị trí, Hỏa Tinh, Linh Tinh, JSON output §36 ở tầng engine gốc)
6. **NOT_IMPLEMENTED**: 4 (Vòng Bác Sĩ, Tiểu Hạn, Lưu Niên, Phân loại sao đầy đủ §33)
7. **OUT_OF_SCOPE**: 3 (Đào Hoa, Hồng Loan, Thiên Hỷ)
8. **Implementation risk còn lại**: 4 (trùng với mục CONFLICTED — đây là rủi ro TÍNH ĐÚNG, không phải
   thiếu bằng chứng)
9. **Source risk còn lại**: 2 (Thiên Mã nhóm 1-3, Vòng Bác Sĩ — thiếu nguồn đủ tin cậy)
10. **Golden Master risk còn lại**: ~22 mục ở mức SOURCE_SUPPORTED chưa có GM ảnh thật xác nhận (rủi ro
    THẤP — có nguồn Level 1 đáng tin, chỉ thiếu xác nhận thực nghiệm)

### KẾT LUẬN CUỐI

```
NATAL_ENGINE_NOT_READY_FOR_FINAL_AUDIT
```

Lý do: còn 4 mục CONFLICTED chưa giải quyết (trong đó 3 vị trí chính tinh là lỗi ảnh hưởng trực tiếp tới
độ chính xác lá số cho các trường hợp cụ thể, không chỉ là thiếu bằng chứng) và 4 tính năng spec yêu cầu
rõ ràng (Tiểu Hạn, Lưu Niên, Vòng Bác Sĩ, phân loại sao đầy đủ) vẫn hoàn toàn chưa implement. Không tự gọi
READY khi còn gap ở mức này.

---

## Test suite (không đổi trong Phase 27 — không sửa code)

```
npx vitest run
```

```
Test Files  22 passed (22)
     Tests  670 passed | 5 expected fail (675)
```

Không xóa test. Không sửa Golden Master. Không sửa expected để ép pass. 0 unexpected failure (không thay
đổi gì so với cuối Phase 26).

Xác nhận KHÔNG thay đổi (mục XIX): 4 trụ, Mệnh, Thân, 12 cung, Cục, 14 chính tinh, status Nguyên Cát, Tứ
Hóa, Đại Vận, Kình Dương, Đà La, Khôi Việt, Xương Khúc, Tả Hữu, Thiên Diêu, Thiên Y, Tràng Sinh, Thái Tuế —
Phase 27 không sửa `src/lib/tu-vi/` (chỉ đọc + viết docs), nên đương nhiên không có gì thay đổi.

**KHÔNG COMMIT/PUSH.**
