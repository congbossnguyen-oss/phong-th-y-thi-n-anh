# TUVI PHASE 18A — PHỤ TINH INVENTORY & RULE AUDIT

**PHASE NÀY CHỈ AUDIT. Không sửa `src/lib/tu-vi/*.ts`, engine, renderer, UI, Golden Master, status table,
công thức, hay test hiện có. Không tự thêm phụ tinh. Không commit/push.**

Phương pháp: đọc toàn bộ `src/lib/tu-vi/rules.ts`, `src/lib/tu-vi/engine.ts`,
`src/pages/lap-la-so-tu-vi.astro`, đối chiếu từng dòng với `TuVi_Engine_V2.md` (spec gốc, đọc lại toàn bộ
50 mục), `TuVi_Golden_Master_Pack_V1.md` (6 GM), và `TuVi_Profile_NguyenCat_V1.md` (Thiên Việt).

---

## 1. EXECUTIVE SUMMARY

- Engine hiện an **18 phụ tinh** (đủ, không thiếu, không thừa cái nào đang gọi mà không hiển thị).
- **17/18 phụ tinh KHÔNG có bất kỳ Golden Master nào (GM-001→006) xác nhận** — chỉ riêng **Tuần** có 2 GM
  xác nhận (GM-001, GM-002) và 1 GM mâu thuẫn nghi vấn (GM-006, đã có `it.fails()` từ trước).
- **Phát hiện nghiêm trọng nhất**: **Kình Dương / Đà La** đang dùng đúng công thức `locTonIdx ± 1` mà
  chính spec `TuVi_Engine_V2.md` §18 **cấm rõ ràng**: *"Không dùng dấu +1/-1 cho tới khi đã khóa
  orientation."* Không có Golden Master nào khóa orientation này. Đây là vi phạm spec trực tiếp, không
  phải suy diễn ngoài — xem mục 7.
- **Đào Hoa, Hồng Loan, Thiên Hỷ: xác nhận KHÔNG nằm trong spec** (rà toàn bộ 50 mục `TuVi_Engine_V2.md`,
  không có bất kỳ dòng nào nhắc tới 3 sao này) → đánh dấu **OUT_OF_SCOPE**, đúng như nghi vấn ban đầu của
  anh.
- **Thiên Diêu, Thiên Y: spec §25 yêu cầu rõ ràng nhưng engine hoàn toàn CHƯA implement** — không có code,
  không có hàm, không được gọi. Đánh dấu **NOT_IMPLEMENTED**.
- **Tứ Hóa trên phụ tinh**: engine gắn đúng (đã fix, có test), nhưng **renderer KHÔNG hiển thị** nhãn Tứ
  Hóa cho phụ tinh (chỉ hiển thị cho chính tinh) — gap giữa data và UI, chỉ báo cáo, không sửa.
- **Thiên Việt**: vẫn ở mức đánh giá NEED_GOLDEN_MASTER_REVIEW (không có GM xác nhận), nhưng cần làm rõ:
  đây là **nhãn đánh giá bằng chứng**, KHÔNG phải giá trị runtime — `getThienViet()` luôn trả về 1 chỉ số
  Chi cụ thể (không có sentinel string như `getChuMenh/getChuThan`). Không đổi gì.
- **Hỏa Tinh/Linh Tinh và Địa Không/Địa Kiếp**: spec chỉ mô tả CẤU TRÚC (2 điểm khởi, hướng đối nghịch),
  KHÔNG cho số liệu cụ thể — các hằng số trong code (`HOA_TINH_START`, `LINH_TINH_START`, khởi Hợi cho
  Không/Kiếp) đến từ kiến thức phổ biến ngoài spec, không tra được trong `TuVi_Engine_V2.md`. Đã tự nhận
  DERIVED từ trước, xác nhận lại chính xác.
- Test suite: **442 pass + 5 expected-fail (447 total), không có unexpected failure, không regression.**
  1/5 expected-fail (GM-006 Tuần Không) liên quan trực tiếp phạm vi phụ tinh của phase này.

---

## 2. FULL PHỤ TINH INVENTORY

Toàn bộ tên sao xuất hiện qua `addPhuTinh()` trong `engine.ts` dòng 186-210 (18 sao, đúng thứ tự code):

| # | Tên | Định nghĩa tại | Được gọi? | Được hiển thị? |
|---|---|---|---|---|
| 1 | Tả Phù | `rules.ts` §21 `taPhuIndex()` | ✅ | ✅ (tên); ❌ (nhãn Tứ Hóa không hiện) |
| 2 | Hữu Bật | `rules.ts` §21 `huuBatIndex()` | ✅ | ✅ (tên); ❌ (nhãn Tứ Hóa không hiện) |
| 3 | Văn Xương | `rules.ts` §20 `vanXuongIndex()` | ✅ | ✅ (tên); ❌ (nhãn Tứ Hóa không hiện) |
| 4 | Văn Khúc | `rules.ts` §20 `vanKhucIndex()` | ✅ | ✅ (tên); ❌ (nhãn Tứ Hóa không hiện) |
| 5 | Thiên Khôi | `rules.ts` §19 `THIEN_KHOI_TABLE` | ✅ | ✅ |
| 6 | Thiên Việt | `rules.ts` (Phase 8) `THIEN_VIET_TABLE` | ✅ | ✅ |
| 7 | Lộc Tồn | `rules.ts` §18 `LOC_TON_TABLE` | ✅ | ✅ |
| 8 | Kình Dương | `engine.ts` dòng 196 — **hard-code `locTonIdx+1` ngay trong engine, KHÔNG có bảng/hàm riêng trong rules.ts, KHÔNG có comment nguồn** | ✅ | ✅ |
| 9 | Đà La | `engine.ts` dòng 197 — **hard-code `locTonIdx-1`, cùng vấn đề như Kình Dương** | ✅ | ✅ |
| 10 | Địa Kiếp | `rules.ts` §22 `diaKiepIndex()` | ✅ | ✅ |
| 11 | Địa Không | `rules.ts` §22 `diaKhongIndex()` | ✅ | ✅ |
| 12 | Thiên Mã | `rules.ts` §24 `THIEN_MA_START` | ✅ | ✅ |
| 13 | Đào Hoa | `rules.ts` (ngoài spec) `DAO_HOA_START` | ✅ | ✅ |
| 14 | Hỏa Tinh | `rules.ts` §23 `HOA_TINH_START` (số liệu ngoài spec) | ✅ | ✅ |
| 15 | Linh Tinh | `rules.ts` §23 `LINH_TINH_START` (số liệu ngoài spec) | ✅ | ✅ |
| 16 | Hồng Loan | `rules.ts` (ngoài spec) `hongLoanIndex()` | ✅ | ✅ |
| 17 | Thiên Hỷ | `rules.ts` (ngoài spec) `thienHyIndex()` | ✅ | ✅ |
| 18 | Thiên Hình | `rules.ts` §25 `thienHinhIndex()` | ✅ | ✅ |

**Không có phụ tinh nào được tính nhưng không hiển thị, và không có phụ tinh nào có code chết (dead code)
chưa được gọi.** `phuTinhHtml` trong `lap-la-so-tu-vi.astro` map generic toàn bộ mảng `p.phuTinh`, nên bất
cứ gì được `addPhuTinh()` thêm vào đều tự động lên UI.

**Không tự thêm sao nào ngoài 18 sao đang có** — đúng yêu cầu "không dùng kiến thức ngoài để tự điền".

---

## 3. RULE MATRIX (theo nhóm A-W yêu cầu)

| Nhóm | Sao | Input | Loại rule | Khớp spec §? |
|---|---|---|---|---|
| A | Lộc Tồn | Can năm | Bảng tra | ✅ §18, khớp 10/10 Can |
| A (tiếp) | Kình Dương / Đà La | Lộc Tồn ± 1 | Công thức (bị cấm dùng dạng này) | ❌ VI PHẠM §18 — xem mục 7 |
| B | Thiên Khôi | Can năm | Bảng tra | ✅ §19, khớp 10/10 Can |
| C | Thiên Việt | Can năm | Bảng tra (nguồn Nguyên Cát, không phải spec) | Spec không cho bảng, chỉ nói "dùng bảng đối ứng riêng của profile" — code tuân thủ tinh thần này |
| D | Văn Xương | Giờ sinh | Công thức | ✅ §20, khớp chính xác pseudo-code |
| E | Văn Khúc | Giờ sinh | Công thức | ✅ §20, khớp chính xác pseudo-code |
| F | Tả Phù | Tháng âm | Công thức | ✅ §21/§25, khớp chính xác |
| G | Hữu Bật | Tháng âm | Công thức | ✅ §21/§25, khớp chính xác |
| H | Thiên Mã | Nhóm tam hợp Chi năm | Bảng tra | ✅ §24, khớp 4/4 nhóm |
| I | Hỏa Tinh | Nhóm tam hợp Chi năm + giờ | Công thức, hằng số NGOÀI spec | ⚠️ §23 chỉ cho cấu trúc, không cho số liệu |
| J | Linh Tinh | Nhóm tam hợp Chi năm + giờ | Công thức, hằng số NGOÀI spec | ⚠️ §23 chỉ cho cấu trúc, không cho số liệu |
| K | Địa Không | Giờ sinh | Công thức, điểm khởi (Hợi) NGOÀI spec | ⚠️ §22 chỉ cho cấu trúc, không cho điểm khởi |
| L | Địa Kiếp | Giờ sinh | Công thức, điểm khởi (Hợi) NGOÀI spec | ⚠️ §22 chỉ cho cấu trúc, không cho điểm khởi |
| M | Thiên Hình | Tháng âm | Công thức | ✅ §25, khớp chính xác ("Dậu=tháng 1, chạy thuận") |
| N | Đào Hoa | Nhóm tam hợp Chi năm | Bảng tra | ❌ KHÔNG có trong spec — OUT_OF_SCOPE |
| O | Hồng Loan | Chi năm | Công thức | ❌ KHÔNG có trong spec — OUT_OF_SCOPE |
| P | Thiên Hỷ | Chi năm (= Hồng Loan + 6) | Công thức | ❌ KHÔNG có trong spec — OUT_OF_SCOPE |
| Q | Tuần | Can Chi năm (dùng lại hàm chung `bat-tu.ts`) | Công thức Tuần Không chuẩn | ✅ §31, kiến trúc tách riêng khỏi Tử Vi (dùng chung Bát Tự) |
| R | Triệt | Can năm | Bảng tra, cặp Chi NGOÀI spec | ⚠️ §32 chỉ cho 5 nhóm Can, không cho cặp Chi cụ thể |
| S | Tràng Sinh | Cục (điểm khởi) + Can năm Âm Dương + giới tính (chiều) | Bảng + công thức | ✅ điểm khởi khớp §27; chiều dùng chung biến `isThuanChung` với Đại Vận — xem mục 9 |
| T/U | Thái Tuế | Chi năm, LUÔN đi thuận | Vòng cố định | ⚠️ tên 12 sao khớp §26; chiều "luôn thuận" là lựa chọn NGOÀI spec (spec để "cấu hình theo profile", không tự cho hướng) |
| V | (Tràng Sinh, đã liệt kê ở S) | | | |
| W | — | Không phát hiện phụ tinh nào khác ngoài 18 sao đã liệt kê ở mục 2 | | |

---

## 4. SOURCE MATRIX

| Phụ tinh | Nguồn | Evidence Level |
|---|---|---|
| Lộc Tồn | `TuVi_Engine_V2.md` §18 | Spec-literal |
| Kình Dương / Đà La | Không có nguồn ghi trong `rules.ts` — hard-code trong `engine.ts`, KHÔNG trích spec | **Không nguồn, vi phạm spec** |
| Thiên Khôi | `TuVi_Engine_V2.md` §19 | Spec-literal |
| Thiên Việt | `TuVi_Profile_NguyenCat_V1.md` §7 (Học Viện Lý Số) | Source-cited, ngoài spec gốc (spec không cho bảng) |
| Văn Xương / Văn Khúc | `TuVi_Engine_V2.md` §20 | Spec-literal |
| Tả Phù / Hữu Bật | `TuVi_Engine_V2.md` §21, §25 | Spec-literal |
| Thiên Mã | `TuVi_Engine_V2.md` §24 | Spec-literal |
| Hỏa Tinh / Linh Tinh | Không có trong spec — kiến thức phổ biến ngoài | Ngoài spec, tự nhận DERIVED từ trước |
| Địa Không / Địa Kiếp | Cấu trúc từ §22 (2 điểm khởi, đối nghịch); điểm khởi Hợi cụ thể — ngoài spec | Cấu trúc spec-literal, số liệu ngoài spec |
| Thiên Hình | `TuVi_Engine_V2.md` §25 ("Dậu = tháng 1, chạy thuận") | Spec-literal |
| Đào Hoa / Hồng Loan / Thiên Hỷ | Không có trong spec — kiến thức phổ biến ngoài | **OUT_OF_SCOPE**, đã tự ghi chú trong code từ Phase 4 |
| Tuần | `TuVi_Engine_V2.md` §31 + hàm dùng chung `khongVongIndicesOf` (Bát Tự) | Spec-literal + verified qua module khác |
| Triệt | `TuVi_Engine_V2.md` §32 (chỉ 5 nhóm Can); cặp Chi cụ thể — ngoài spec | Cấu trúc spec-literal, số liệu ngoài spec |
| Tràng Sinh | `TuVi_Engine_V2.md` §27 (điểm khởi); chiều dùng lại quy tắc Âm Dương/giới tính chuẩn | Điểm khởi spec-literal, chiều theo quy ước phổ biến |
| Thái Tuế | `TuVi_Engine_V2.md` §26 (tên 12 sao); chiều "luôn thuận" — spec để mở, code tự chọn | Tên spec-literal, chiều ngoài spec |

---

## 5. GOLDEN MASTER COVERAGE

| Phụ tinh | GM-001 | GM-002 | GM-003 | GM-004 | GM-005 | GM-006 |
|---|---|---|---|---|---|---|
| Tả Phù | NO | NO | NO | NO | NO | NO |
| Hữu Bật | NO | NO | NO | NO | NO | NO |
| Văn Xương | NO | NO | NO | NO | NO | NO |
| Văn Khúc | NO | NO | NO | NO | NO | NO |
| Thiên Khôi | NO | NO | NO | NO | NO | NO |
| Thiên Việt | NO | NO | NO | NO | NO | NO |
| Lộc Tồn | NO | NO | NO | NO | NO | NO |
| Kình Dương | NO | NO | NO | NO | NO | NO |
| Đà La | NO | NO | NO | NO | NO | NO |
| Địa Không | NO | NO | NO | NO | NO | NO |
| Địa Kiếp | NO | NO | NO | NO | NO | NO |
| Thiên Mã | NO | NO | NO | NO | NO | NO |
| Hỏa Tinh | NO | NO | NO | NO | NO | NO |
| Linh Tinh | NO | NO | NO | NO | NO | NO |
| Đào Hoa | NO | NO | NO | NO | NO | NO |
| Hồng Loan | NO | NO | NO | NO | NO | NO |
| Thiên Hỷ | NO | NO | NO | NO | NO | NO |
| Thiên Hình | NO | NO | NO | NO | NO | NO |
| **Tuần** | **YES** | **YES** | NO | NO | NO | **CONFLICTED (it.fails)** |
| Triệt | NO | NO | NO | NO | NO | NO (chỉ ghi "theo bảng Can Ất", không cho cặp Chi cụ thể để test) |

**17/18 phụ tinh: 0/6 Golden Master có dữ liệu. Chỉ Tuần có 2/6 xác nhận trực tiếp (GM-001, GM-002, cùng
năm Canh Thân) và 1/6 mâu thuẫn nghi vấn (GM-006 — nghi transcription lỗi copy-paste từ GM-001, đã có
`it.fails()` ghi rõ từ Phase 3, KHÔNG sửa).**

Ghi chú ngoài phạm vi 6 GM chính thức: ảnh tuvinamphai.vn ở Phase 15 (SOURCE_IMPLEMENTATION_EVIDENCE, không
phải Golden Master) có hiện vài phụ tinh (Thiên Mã, Điếu Khách, Phục Binh, Thiên Trù, Lộc Tồn...) nhưng
CHƯA từng được đối chiếu với engine ở phase nào — không tính vào bảng trên, để riêng cho phase sau nếu cần.

---

## 6. EVIDENCE CLASSIFICATION (bảng tổng hợp bắt buộc — mục XIV)

| Phụ tinh | Rule hiện tại | Source | GM | Evidence | Status | Risk | Action |
|---|---|---|---|---|---|---|---|
| Lộc Tồn | Bảng theo Can năm | Spec §18 | 0/6 | Spec-literal | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Kình Dương | `locTonIdx+1` | Không có (hard-code) | 0/6 | Không nguồn | CONFLICTED | **Vi phạm §18 rõ ràng ("không dùng +1/-1 khi chưa khóa orientation")** | NEED_REVIEW |
| Đà La | `locTonIdx-1` | Không có (hard-code) | 0/6 | Không nguồn | CONFLICTED | Cùng vấn đề Kình Dương | NEED_REVIEW |
| Thiên Khôi | Bảng theo Can năm | Spec §19 | 0/6 | Spec-literal | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Thiên Việt | Bảng theo Can năm | Nguyên Cát §7 (Phase 8) | 0/6 | Source-cited | NEED_GOLDEN_MASTER_REVIEW | — | KEEP (đúng theo chỉ thị Phase 18A mục IV) |
| Văn Xương | Công thức theo giờ | Spec §20 | 0/6 | Spec-literal | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Văn Khúc | Công thức theo giờ | Spec §20 | 0/6 | Spec-literal | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Tả Phù | Công thức theo tháng | Spec §21/§25 | 0/6 | Spec-literal | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Hữu Bật | Công thức theo tháng | Spec §21/§25 | 0/6 | Spec-literal | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Địa Không | Công thức theo giờ, khởi Hợi | Cấu trúc spec §22; số liệu ngoài | 0/6 | DERIVED | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Địa Kiếp | Công thức theo giờ, khởi Hợi | Cấu trúc spec §22; số liệu ngoài | 0/6 | DERIVED | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Hỏa Tinh | Bảng theo nhóm tam hợp + giờ | Cấu trúc spec §23; số liệu ngoài | 0/6 | DERIVED (tự nhận độ tin cậy thấp nhất) | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Linh Tinh | Bảng theo nhóm tam hợp + giờ | Cấu trúc spec §23; số liệu ngoài | 0/6 | DERIVED | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Thiên Mã | Bảng theo nhóm tam hợp | Spec §24 | 0/6 | Spec-literal | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Thiên Hình | Công thức theo tháng | Spec §25 | 0/6 | Spec-literal | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Đào Hoa | Bảng theo nhóm tam hợp | Không có trong spec | 0/6 | Ngoài phạm vi | OUT_OF_SCOPE | Nằm ngoài spec đã khóa | OUT_OF_SCOPE |
| Hồng Loan | Công thức theo Chi năm | Không có trong spec | 0/6 | Ngoài phạm vi | OUT_OF_SCOPE | Nằm ngoài spec đã khóa | OUT_OF_SCOPE |
| Thiên Hỷ | Công thức = Hồng Loan+6 | Không có trong spec | 0/6 | Ngoài phạm vi | OUT_OF_SCOPE | Nằm ngoài spec đã khóa | OUT_OF_SCOPE |
| Tuần | Dùng chung `khongVongIndicesOf` (Bát Tự) | Spec §31 | 2/6 YES, 1/6 CONFLICTED | VERIFIED (GM-001+002) | VERIFIED (với ghi chú GM-006 CONFLICTED) | — | KEEP |
| Triệt | Bảng theo Can năm, cặp Chi | Cấu trúc spec §32; cặp Chi ngoài spec | 0/6 (GM-006 chỉ ghi mơ hồ) | DERIVED | NEED_GOLDEN_MASTER_REVIEW | Không test coverage | NEED_SOURCE |
| Tràng Sinh | Bảng khởi theo Cục + chiều theo Âm Dương/giới tính | Spec §27 (điểm khởi); chiều ngoài spec | 0/6 | Điểm khởi spec-literal, chiều DERIVED | NEED_GOLDEN_MASTER_REVIEW | Dùng chung biến chiều với Đại Vận — xem mục 9 | KEEP |
| Thái Tuế | Vòng cố định, luôn thuận | Spec §26 (tên); chiều ngoài spec | 0/6 | Tên spec-literal, chiều DERIVED | NEED_GOLDEN_MASTER_REVIEW | — | KEEP |
| Thiên Diêu | — | Spec §25 yêu cầu | 0/6 | Không có code | NOT_IMPLEMENTED | Thiếu so với spec | NEED_REVIEW |
| Thiên Y | — | Spec §25 yêu cầu | 0/6 | Không có code | NOT_IMPLEMENTED | Thiếu so với spec | NEED_REVIEW |

---

## 7. CONFLICTS (nghiêm trọng nhất trong phase này)

### 7.1 Kình Dương / Đà La — VI PHẠM SPEC TRỰC TIẾP

`TuVi_Engine_V2.md` §18 viết rõ:

> Kình Dương = cung kế trước Lộc Tồn theo chiều profile
> Đà La = cung kế sau Lộc Tồn theo chiều profile
> **Không dùng dấu `+1/-1` cho tới khi đã khóa orientation.**

Code hiện tại (`engine.ts` dòng 196-197):

```ts
addPhuTinh(locTonIdx + 1, "Kình Dương");
addPhuTinh(locTonIdx - 1, "Đà La");
```

Đây chính xác là mẫu hình spec cấm dùng. Không có Golden Master nào khóa orientation (0/6 GM nhắc tới Kình
Dương/Đà La). Không có bất kỳ dòng comment nào trong `rules.ts` ghi nhận quyết định orientation này — khác
hẳn với mọi phụ tinh khác trong file (mỗi cái đều có "Mục N" + nhãn VERIFIED/DERIVED). Đây là **lỗ hổng
kiến trúc thật sự** đến từ giai đoạn xây dựng trước Phase 18A, không được phát hiện ở các audit trước đó
(Phase 1/4/6 tập trung vào chính tinh/status table). Không sửa trong phase này — chỉ ghi nhận.

### 7.2 Không phát hiện conflict nào khác giữa code và spec cho các phụ tinh còn lại

Toàn bộ 15 phụ tinh có công thức/bảng spec-literal (Lộc Tồn, Thiên Khôi, Văn Xương, Văn Khúc, Tả Phù, Hữu
Bật, Thiên Mã, Thiên Hình) đều khớp CHÍNH XÁC văn bản spec — không có sai lệch số liệu.

---

## 8. ARCHITECTURE RISKS

Kiểm tra chiều phụ thuộc (mục XI):

- **Phụ tinh KHÔNG ghi đè lên**: vị trí 14 chính tinh (`chinhTinhTaiChi`), 12 cung, Mệnh (`menhChiIndex`),
  Thân (`thanChiIndex`), Cục (`cuc`), Đại Vận (`daiVanTuoiTaiChi`) — xác nhận bằng đọc trực tiếp
  `engine.ts`: khối phụ tinh (dòng 182-210) chỉ ĐỌC `lunar.month`, `gioChiIndex`, `yearCanName`,
  `yearChiIndex` (đều đã tính xong trước đó), không có phép gán ngược vào bất kỳ biến chính tinh/Mệnh/
  Thân/Cục/Đại Vận nào. **Không phát hiện ARCHITECTURE_RISK ở chiều này.**
- Vòng lặp gắn Tứ Hóa (dòng 212-229) có ghi thuộc tính `tuHoa` lên object phụ tinh — đây là ghi CÓ CHỦ Ý,
  đã fix và có test riêng (`tu-vi-tu-hoa-full.test.ts`), không phải dependency ngược ngoài ý muốn.
- **Ghi chú kiến trúc (không phải risk)**: Tràng Sinh dùng chung biến `isThuanChung` (tính từ Can năm +
  giới tính) với Đại Vận — đây là 1 coupling có chủ ý, khớp quy ước Tử Vi phổ biến (Dương Nam/Âm Nữ thuận,
  Âm Nam/Dương Nữ nghịch áp dụng cho cả 2 vòng), không phải lỗi trộn dữ liệu trái phép. Nêu ra để minh
  bạch, không xếp vào ARCHITECTURE_RISK.
- Điểm khởi Tràng Sinh phụ thuộc `menhNapAm.element` (nạp âm của CUNG MỆNH, qua Cục) — đây là chuỗi phụ
  thuộc ĐÚNG theo spec §27 ("Điểm khởi theo Cục"), không phải rò rỉ trái phép.

**Kết luận mục 8: không có ARCHITECTURE_RISK nào được phát hiện cho chiều phụ tinh → chính tinh/Mệnh/
Thân/Cục/Đại Vận. Rủi ro duy nhất tìm được là RULE-level (mục 7.1), không phải ARCHITECTURE-level.**

---

## 9. MISSING RULES

| Rule | Spec yêu cầu tại | Trạng thái |
|---|---|---|
| Thiên Diêu | §25 | NOT_IMPLEMENTED |
| Thiên Y | §25 | NOT_IMPLEMENTED |
| Vòng Bác Sĩ (Bác Sĩ, Lực Sĩ, Thanh Long...) | §0 (chỉ nhắc tên trong kiến trúc tổng, không có mục riêng cho stage list) | NOT_IMPLEMENTED — spec cũng chưa đủ chi tiết để implement (không có danh sách 12 tên) |
| Tiểu Hạn | §29 (STEP 22) | NOT_IMPLEMENTED — ngoài phạm vi "phụ tinh" của Phase 18A, đây là module chu kỳ riêng, chỉ ghi chú |
| Lưu Niên | §30 (STEP 23) | NOT_IMPLEMENTED — cùng lý do trên |

Triệt: đã implement nhưng **0 test coverage** trong toàn bộ test suite hiện tại (đã rà `tests/*.ts`, không
tìm thấy 1 assertion nào cho `triet`) — không phải "thiếu rule" mà là "thiếu bằng chứng kiểm thử", ghi vào
đây để không bị bỏ sót.

---

## 10. NEED GOLDEN MASTER

Toàn bộ danh sách ở mục 6 có Status = `NEED_GOLDEN_MASTER_REVIEW` (20/24 dòng, không tính 3 dòng
OUT_OF_SCOPE và 2 dòng NOT_IMPLEMENTED và 1 dòng Tuần đã VERIFIED một phần). Ưu tiên cao nhất trong nhóm
này (theo mức độ rủi ro nếu sai):

1. **Kình Dương / Đà La** — không chỉ thiếu GM, mà còn đang dùng đúng pattern spec cấm (mục 7.1).
2. **Triệt** — có test 0 coverage, số liệu cặp Chi hoàn toàn ngoài spec.
3. **Hỏa Tinh / Linh Tinh** — tự nhận độ tin cậy thấp nhất trong toàn bộ hệ thống từ trước.
4. Các phụ tinh spec-literal còn lại (Lộc Tồn, Thiên Khôi, Văn Xương/Khúc, Tả Phù/Hữu Bật, Thiên Mã, Thiên
   Hình) — rủi ro thấp hơn vì ít nhất khớp đúng văn bản spec, chỉ thiếu xác nhận thực nghiệm.

---

## 11. OUT OF SCOPE

```text
Đào Hoa
Hồng Loan
Thiên Hỷ
```

Xác nhận: rà toàn bộ 50 mục `TuVi_Engine_V2.md`, không có bất kỳ đoạn nào nhắc tên 3 sao này (kể cả trong
kiến trúc tổng ở §0, danh sách phụ tinh ở STEP 17, hay checklist release ở §46). Rules.ts đã tự ghi chú
"bổ sung, không có trong danh sách gốc" từ Phase 4 — Phase 18A xác nhận đúng, không phải suy đoán.
**Không tự xóa 3 sao này khỏi engine trong phase này** (chỉ audit, không sửa) — nhưng chính thức đánh dấu
OUT_OF_SCOPE để không ai nhầm coi là "đã verified" trong tương lai.

---

## 12. RECOMMENDED IMPLEMENTATION ORDER (chỉ đề xuất, không thực hiện trong Phase 18A)

1. Quyết định orientation cho Kình Dương/Đà La (cần nguồn/GM, không được tự suy) — rủi ro cao nhất.
2. Bổ sung test coverage cho Triệt (dù chưa có GM, ít nhất test tự-nhất-quán theo spec §32).
3. Làm rõ nguồn/quyết định cho Hỏa Tinh, Linh Tinh, Địa Không, Địa Kiếp (điểm khởi cụ thể).
4. Quyết định giữ/loại Đào Hoa, Hồng Loan, Thiên Hỷ (OUT_OF_SCOPE) — cần chỉ thị người dùng.
5. Xem xét bổ sung Thiên Diêu, Thiên Y nếu có nguồn phù hợp (spec yêu cầu nhưng chưa có công thức cụ thể
   trong spec để implement ngay).
6. Đồng bộ renderer hiển thị Tứ Hóa trên phụ tinh (hiện data có, UI chưa hiện).

---

## 13. TEST

```
npx vitest run
```

```
Test Files  15 passed (15)
     Tests  442 passed | 5 expected fail (447)
```

- Số test pass: 442
- Số expected-fail: 5 (không đổi so với Phase 17)
- Số unexpected failure: 0
- Regression: KHÔNG có

5 expected-fail (không đổi, đã biết từ trước): GM-003 vị trí Thiên Lương, GM-005 vị trí Tham Lang, GM-005
vị trí Thất Sát, GM-006 vị trí Vũ Khúc+Phá Quân, **GM-006 Tuần Không** (đây là 1/5 test có liên quan trực
tiếp tới phạm vi phụ tinh của Phase 18A — đã phân tích lại ở mục 5/6, không phải lỗi engine mà nghi vấn
GM Pack transcription).

Không sửa test nào. Không sửa Golden Master. Không thay đổi expected value nào để né fail.

---

## 14. FINAL CHECK

```
[x] Không sửa engine
[x] Không sửa status table
[x] Không sửa Golden Master
[x] Không sửa UI
[x] Không sửa công thức
[x] Không tự thêm phụ tinh
[x] Không dùng kiến thức ngoài để tự điền rule
[x] Thiên Việt vẫn NEED_GOLDEN_MASTER_REVIEW (làm rõ: đây là nhãn đánh giá bằng chứng, không phải
    runtime sentinel — xem mục 1 và mục 6)
[x] Tứ Hóa trên phụ tinh đã được audit (engine đúng, renderer thiếu hiển thị — chỉ báo cáo)
[x] Thiên Hình đã được audit (đã implement từ Phase 4, khớp spec, chưa có GM)
[x] Tuần/Triệt đã được audit (Tuần VERIFIED qua GM-001/002 + 1 conflict GM-006; Triệt DERIVED, 0 test)
[x] Tràng Sinh/Thái Tuế đã được audit (điểm khởi/tên khớp spec; chiều là lựa chọn DERIVED)
[x] Golden Master coverage đã được thống kê (mục 5)
[x] Toàn bộ test suite đã chạy (442 pass + 5 expected-fail, mục 13)
[x] Không có unexpected failure
```

## KẾT LUẬN

**PHASE 18A CHỈ AUDIT. KHÔNG IMPLEMENT. KHÔNG SỬA. KHÔNG COMMIT/PUSH.**

Phát hiện quan trọng nhất cần người dùng quyết định trước khi làm bất kỳ phase implement nào tiếp theo:
**Kình Dương/Đà La đang vi phạm trực tiếp chỉ dẫn spec §18** ("không dùng +1/-1 khi chưa khóa
orientation") mà không có Golden Master hay nguồn nào khóa orientation này.
