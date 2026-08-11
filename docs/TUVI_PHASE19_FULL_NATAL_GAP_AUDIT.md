# TUVI PHASE 19 — FULL NATAL ENGINE GAP AUDIT

**Chỉ audit. Không thêm rule. Không sửa rule chưa có source. Không sửa Golden Master. Không commit/push.**

Phương pháp: đọc lại toàn bộ `src/lib/tu-vi/engine.ts`, `src/lib/tu-vi/rules.ts`,
`src/pages/lap-la-so-tu-vi.astro`, đối chiếu với `TuVi_Engine_V2.md` (spec, 50 mục), 6 Golden Master
(`TuVi_Golden_Master_Pack_V1.md`), và toàn bộ báo cáo Phase 1→18B đã có trong `docs/`.

---

## BẢNG TỔNG HỢP 42 THÀNH PHẦN

| # | Thành phần | Implementation | Source | GM (tóm tắt) | Status | Risk | Action |
|---|---|---|---|---|---|---|---|
| 1 | Lịch âm/dương | `solarToLunar()` | Thư viện lịch nội bộ | 6/6 khớp | VERIFIED | — | KEEP |
| 2 | Can Chi năm | Công thức 60 giáp tý | Spec §3 | 6/6 khớp | VERIFIED | — | KEEP |
| 3 | Can Chi tháng (pillar) | **Không có** — chỉ có `lunarMonth` (số) | Spec §4.2 yêu cầu | 0/6 (không có field để so) | NOT_IMPLEMENTED | Spec §4.2 yêu cầu `canChi.month`, engine không xuất | NEED_REVIEW |
| 4 | Can Chi ngày (pillar) | **Không có** — chỉ có `lunarDay` (số) | Spec §4.2 yêu cầu | 0/6 | NOT_IMPLEMENTED | Cùng lý do mục 3; `bat-tu.ts` (module khác) CÓ tính được nhưng không nối vào Tử Vi | NEED_REVIEW |
| 5 | Can Chi giờ (pillar) | `gioChiName` có (Chi), **Can giờ không có** | Spec §4.2 | Chi giờ 6/6 khớp; Can giờ 0/6 (không xuất) | IMPLEMENTED_UNVERIFIED (một nửa) | Thiếu Can giờ so với spec | NEED_REVIEW |
| 6 | Boundary giờ Tý | `gioChiIndex = floor(((hour+1)%24)/2)` | Spec §4.3 (ZI_HOUR) | GM-005 khớp | VERIFIED (cho mục đích Mệnh/Thân) | Không có logic đổi NGÀY vì không xuất Can Chi ngày (mục 4) | KEEP |
| 7 | Boundary năm âm lịch | `yearCycleIndex` từ `lunar.year` | Spec §4.3 note (2026→2025 Ất Tỵ) | GM-006 khớp | VERIFIED | — | KEEP |
| 8 | Mệnh | `tinhCungMenh()` | Spec §5.2 | 6/6 khớp | VERIFIED | — | KEEP |
| 9 | Thân | `tinhCungThan()` | Spec §5.3 | 6/6 khớp | VERIFIED | — | KEEP |
| 10 | 12 cung (tên + mapping) | `CUNG_NAMES_TU_MENH_NGHICH` | Spec §6 | 6/6 khớp | VERIFIED | — | KEEP |
| 11 | Can của 12 cung | `getPalaceStem()` | Spec §7 (yêu cầu GM kiểm toàn bộ) | 0/6 (GM không ghi Can-cung tường minh) | IMPLEMENTED_UNVERIFIED | Tự nhất quán nhưng chưa có GM xác nhận dù spec yêu cầu | NEED_GOLDEN_MASTER |
| 12 | Cục | `CUC_INFO` qua Nạp Âm Mệnh | Spec §9 | 6/6 khớp | VERIFIED | — | KEEP |
| 13 | An Tử Vi | `tinhViTriTuVi()` | Spec §12 | 6/6 khớp vị trí | VERIFIED | — | KEEP |
| 14 | An Thiên Phủ | `mod12(4-tuViChiIndex)` | Spec §14 | 6/6 khớp vị trí | VERIFIED | — | KEEP |
| 15 | 14 chính tinh (toàn bộ offset 2 vòng) | `TU_VI_RING` + `THIEN_PHU_RING` | Spec §13/§14 | 11/14 sao sạch 6/6; 3/14 sao (Thiên Lương, Tham Lang+Thất Sát, Vũ Khúc+Phá Quân) có vị trí sai ở 1 GM riêng lẻ mỗi trường hợp | CONFLICTED (cục bộ) | 3 position bug đã biết (GM-003/005/006), có `it.fails()` | KEEP (đã ghi nhận, không tự sửa) |
| 16 | Status 14×12 | `MAIN_STAR_STATUS` | Nguyên Cát (Phase 16 SOURCE OF TRUTH) | 4/168 ô CONFLICTED với GM-003/006 (đã quyết định dùng Nguyên Cát) | SOURCE_SUPPORTED | 4 ô đã biết, đã quyết định | KEEP |
| 17 | Tứ Hóa (core, 10 Can) | `TU_HOA_TABLE` | Spec §17 | Canh: VERIFIED (spec tự trích GM); Đinh/Ất: đúng bảng được xác nhận qua GM-004/005/006 (nhưng không xác nhận từng sao); 7 Can còn lại: chỉ spec-literal | VERIFIED (Canh) / SOURCE_SUPPORTED (9 Can còn lại) | — | KEEP |
| 18 | Lộc Tồn | `LOC_TON_TABLE` | Spec §18 | 0/6 | SOURCE_SUPPORTED | Chưa GM | NEED_GOLDEN_MASTER |
| 19 | Khôi Việt | `THIEN_KHOI_TABLE` (spec) / `THIEN_VIET_TABLE` (Nguyên Cát) | Spec §19 (Khôi) / Nguyên Cát §7 (Việt) | 0/6 cả 2 | SOURCE_SUPPORTED (Khôi) / NEED_GOLDEN_MASTER_REVIEW (Việt, đã khóa từ Phase 18B) | — | NEED_GOLDEN_MASTER |
| 20 | Xương Khúc | `vanXuongIndex/vanKhucIndex` | Spec §20 | 0/6 | SOURCE_SUPPORTED | — | NEED_GOLDEN_MASTER |
| 21 | Tả Hữu | `taPhuIndex/huuBatIndex` | Spec §21/§25 | 0/6 | SOURCE_SUPPORTED | — | NEED_GOLDEN_MASTER |
| 22 | Kình Dương | `locTonIdx+1` | Không nguồn (spec cấm dùng +1/-1 khi chưa khóa orientation) | 0/6 | NEED_GOLDEN_MASTER_REVIEW | Vi phạm spec §18 trực tiếp (đã ghi Phase 18B, chưa sửa) | NEED_GOLDEN_MASTER |
| 23 | Đà La | `locTonIdx-1` | Cùng vấn đề mục 22 | 0/6 | NEED_GOLDEN_MASTER_REVIEW | Cùng rủi ro mục 22 | NEED_GOLDEN_MASTER |
| 24 | Hỏa Tinh | `HOA_TINH_START` | Ngoài spec (spec chỉ cho cấu trúc) | 0/6 | NEED_GOLDEN_MASTER_REVIEW | Độ tin cậy thấp nhất hệ thống (tự nhận) | NEED_GOLDEN_MASTER |
| 25 | Linh Tinh | `LINH_TINH_START` | Ngoài spec | 0/6 | NEED_GOLDEN_MASTER_REVIEW | Cùng rủi ro mục 24 | NEED_GOLDEN_MASTER |
| 26 | Không Kiếp (Địa Không/Địa Kiếp) | Khởi Hợi, đối nghịch | Cấu trúc spec §22; điểm khởi ngoài spec | 0/6 | NEED_GOLDEN_MASTER_REVIEW | — | NEED_GOLDEN_MASTER |
| 27 | Thiên Mã | `THIEN_MA_START` | Spec §24, khớp 4/4 nhóm | 0/6 | SOURCE_SUPPORTED | — | NEED_GOLDEN_MASTER |
| 28 | Thiên Hình | `thienHinhIndex()` | Spec §25 | 0/6 | SOURCE_SUPPORTED | — | NEED_GOLDEN_MASTER |
| 29 | Tuần | `khongVongIndicesOf` (dùng chung Bát Tự) | Spec §31 | GM-001/002 khớp; GM-006 CONFLICT (nghi transcription lỗi) | VERIFIED (với 1 conflict đã biết) | GM-006 `it.fails()`, không sửa | KEEP |
| 30 | Triệt | `TRIET_TABLE` | Cấu trúc spec §32; cặp Chi ngoài spec | 0/6 giá trị cụ thể (GM-006 chỉ ghi mơ hồ) | NEED_GOLDEN_MASTER_REVIEW | Đã có test (Phase 18B), vẫn thiếu GM cho giá trị | NEED_GOLDEN_MASTER |
| 31 | Tràng Sinh | `TRANG_SINH_START` + `isThuanChung` | Điểm khởi spec §27; chiều DERIVED (dùng lại quy tắc Đại Vận) | 0/6 | SOURCE_SUPPORTED (điểm khởi) | Chiều chưa GM xác nhận riêng | NEED_GOLDEN_MASTER |
| 32 | Thái Tuế | `THAI_TUE_STAGES`, luôn thuận | Tên spec §26; chiều "luôn thuận" ngoài spec | 0/6 | SOURCE_SUPPORTED (tên) | Chiều là lựa chọn chưa xác nhận | NEED_GOLDEN_MASTER |
| 33 | Vòng sao khác trong scope | Không có thêm | — | — | — | Không phát hiện vòng sao nào khác đang implement mà chưa audit | KEEP |
| 34 | Chủ Mệnh | `getChuMenh()` theo Chi năm | Phase 8 (thực nghiệm GM) | 4/12 Chi VERIFIED (Thân/Ngọ/Sửu/Tỵ qua GM-001..006); 8/12 sentinel | VERIFIED (4/12) / NEED_GOLDEN_MASTER_REVIEW (8/12) | — | KEEP |
| 35 | Chủ Thân | `getChuThan()` theo Chi năm | Phase 8 | 4/12 VERIFIED; 8/12 sentinel | VERIFIED (4/12) / NEED_GOLDEN_MASTER_REVIEW (8/12) | — | KEEP |
| 36 | Mệnh Quái | `tinhMenhQuai()` | Spec §10 (Bát Trạch phổ biến) | 3/4 nhánh giới tính×thế kỷ VERIFIED (Nam-TK20 GM-001, Nữ-TK20 GM-002/004, Nam-TK21 GM-006); Nữ-TK21 chưa có | VERIFIED (3/4 nhánh) | Nhánh Nữ-TK21 chưa GM | NEED_GOLDEN_MASTER |
| 37 | Đại Vận (tuổi khởi + chu kỳ) | `daiVanTuoiTaiChi` | Spec §28.2 | 6/6 khớp | VERIFIED | — | KEEP |
| 38 | Chiều Đại Vận | `isThuanChung` | Spec §28.1 | Cả 4 tổ hợp Dương Nam/Dương Nữ/Âm Nam/Âm Nữ đều có GM xác nhận (GM-001/002/004/005 hoặc 006) | VERIFIED (đầy đủ 4/4 tổ hợp — cập nhật so với audit cũ trước khi có GM-002→006) | — | KEEP |
| 39 | Tuổi Đại Vận (=Cục số) | `cuc.so` | Spec §28.2 | 6/6 khớp | VERIFIED | — | KEEP |
| 40 | Renderer | `lap-la-so-tu-vi.astro` script | Spec §42 (renderer không tính toán) | N/A (không phải rule để GM kiểm) | IMPLEMENTED_UNVERIFIED | Không có test tự động cho renderer, chỉ xác minh thủ công qua browser nhiều lần (Phase 16, 18B) | KEEP |
| 41 | JSON/data output | `TuViChart`/`CungKetQua` | Spec §36 cho schema cụ thể khác | N/A | CONFLICTED | Shape hiện tại KHÔNG khớp schema spec (đã ghi từ audit cũ, vẫn đúng) — hoạt động tốt nhưng không đúng "hợp đồng" spec | NEED_REVIEW |
| 42 | Export ảnh (PNG 1440×2000) | `html-to-image`, `captureCardAsPng()` | Yêu cầu người dùng (ngoài spec gốc) | N/A | IMPLEMENTED_UNVERIFIED | Không có test tự động, đã xác minh thủ công nhiều lần | KEEP |

---

## GOLDEN MASTER COVERAGE MATRIX (chi tiết theo từng GM)

Ký hiệu: V=VERIFIED, P=PARTIAL, N=NO_DATA, C=CONFLICT.

| # | Thành phần | GM-001 | GM-002 | GM-003 | GM-004 | GM-005 | GM-006 |
|---|---|---|---|---|---|---|---|
| 1 | Lịch âm/dương | V | V | V | V | V | V |
| 2 | Can Chi năm | V | V | V | V | V | V |
| 3 | Can Chi tháng (pillar) | N | N | N | N | N | N |
| 4 | Can Chi ngày (pillar) | N | N | N | N | N | N |
| 5 | Can Chi giờ (Can) | N | N | N | N | N | N |
| 5b | Can Chi giờ (Chi) | V | V | V | V | V | V |
| 6 | Boundary giờ Tý | N | N | N | N | V | N |
| 7 | Boundary năm âm lịch | N | N | N | N | N | V |
| 8 | Mệnh | V | V | V | V | V | V |
| 9 | Thân | V | V | V | V | V | V |
| 10 | 12 cung | V | V | V | V | V | V |
| 11 | Can của 12 cung | N | N | N | N | N | N |
| 12 | Cục | V | V | V | V | V | V |
| 13 | An Tử Vi | V | V | V | V | V | V |
| 14 | An Thiên Phủ | V | V | V | V | V | V |
| 15 | 14 chính tinh (toàn bộ) | V | V | C (Thiên Lương) | V | C (Tham Lang, Thất Sát) | C (Vũ Khúc, Phá Quân) |
| 16 | Status 14×12 | V | V | C (2 ô) | V | V | C (2 ô) |
| 17 | Tứ Hóa core | V | V | V | P | P | P |
| 18 | Lộc Tồn | N | N | N | N | N | N |
| 19 | Khôi Việt | N | N | N | N | N | N |
| 20 | Xương Khúc | N | N | N | N | N | N |
| 21 | Tả Hữu | N | N | N | N | N | N |
| 22 | Kình Dương | N | N | N | N | N | N |
| 23 | Đà La | N | N | N | N | N | N |
| 24 | Hỏa Tinh | N | N | N | N | N | N |
| 25 | Linh Tinh | N | N | N | N | N | N |
| 26 | Không Kiếp | N | N | N | N | N | N |
| 27 | Thiên Mã | N | N | N | N | N | N |
| 28 | Thiên Hình | N | N | N | N | N | N |
| 29 | Tuần | V | V | N | N | N | C |
| 30 | Triệt | N | N | N | N | N | P (mơ hồ, không dùng được) |
| 31 | Tràng Sinh | N | N | N | N | N | N |
| 32 | Thái Tuế | N | N | N | N | N | N |
| 34 | Chủ Mệnh | V | V | V | V | V | V |
| 35 | Chủ Thân | V | V | V | V | V | V |
| 36 | Mệnh Quái | V | V | N | V | N | V |
| 37 | Đại Vận (tuổi khởi) | V | V | V | V | V | V |
| 38 | Chiều Đại Vận | V | V | N | V | V | V |
| 39 | Tuổi Đại Vận | V | V | V | V | V | V |

Mục 33/40/41/42 không áp dụng ma trận GM (không phải rule tính toán per-chart mà GM có thể xác nhận/phủ
định trực tiếp).

---

## PHÂN LOẠI TỔNG KẾT

### A. Đã khóa hoàn toàn (VERIFIED, đa số GM đồng thuận, không còn nghi vấn)

```
Lịch âm/dương · Can Chi năm · Boundary giờ Tý (Mệnh/Thân) · Boundary năm âm lịch
Mệnh · Thân · 12 cung · Cục · An Tử Vi · An Thiên Phủ
Tứ Hóa core (Canh) · Tuần (trừ 1 conflict GM-006)
Chủ Mệnh/Chủ Thân (4/12 Chi) · Đại Vận (tuổi khởi + chu kỳ) · Chiều Đại Vận (đủ 4/4 tổ hợp)
Tuổi Đại Vận · Mệnh Quái (3/4 nhánh)
```

### B. Đã implement nhưng chưa đủ evidence (SOURCE_SUPPORTED / IMPLEMENTED_UNVERIFIED)

```
Can của 12 cung · Tứ Hóa core (9/10 Can còn lại)
Lộc Tồn · Thiên Khôi · Xương Khúc · Tả Hữu · Thiên Mã · Thiên Hình
Tràng Sinh (điểm khởi) · Thái Tuế (tên) · Renderer · Export ảnh
```

### C. Cần source (NEED_SOURCE — spec chưa từng cho công thức)

```
Thiên Diêu · Thiên Y (giữ nguyên từ Phase 18B, không đổi)
```

### D. Cần Golden Master (NEED_GOLDEN_MASTER_REVIEW)

```
Kình Dương · Đà La · Hỏa Tinh · Linh Tinh · Địa Không · Địa Kiếp
Thiên Việt · Triệt (giá trị cụ thể) · Tràng Sinh (chiều) · Thái Tuế (chiều)
Mệnh Quái (nhánh Nữ + thế kỷ 21) · Chủ Mệnh/Chủ Thân (8/12 Chi còn lại)
```

### E. Conflict (CONFLICTED — có bằng chứng mâu thuẫn thật, không phải chỉ thiếu bằng chứng)

```
14 chính tinh — 3/14 sao có vị trí sai lệch cục bộ (GM-003/005/006, đã có it.fails(), không tự sửa)
Status 14×12 — 4/168 ô mâu thuẫn GM-003/006 (đã quyết định dùng Nguyên Cát, Phase 16)
Tuần — GM-006 mâu thuẫn (nghi transcription lỗi, đã có it.fails())
JSON/data output — shape thực tế không khớp schema spec §36 (không phải sai số liệu, mà sai "hợp đồng")
```

### F. Out of scope

```
Đào Hoa · Hồng Loan · Thiên Hỷ
```

### G. Chưa implement (NOT_IMPLEMENTED)

```
Can Chi tháng (pillar) — spec §4.2 yêu cầu, engine chỉ có số lunarMonth
Can Chi ngày (pillar) — spec §4.2 yêu cầu, engine chỉ có số lunarDay
Can giờ (pillar) — spec §4.2 yêu cầu, engine chỉ có Chi giờ

Ngoài phạm vi 42 mục nhưng spec §29/§30 yêu cầu rõ (ghi thêm cho đầy đủ, không thuộc "vòng sao"):
Tiểu Hạn (spec §29, STEP 22)
Lưu Niên (spec §30, STEP 23)
Vòng Bác Sĩ (nhắc tên ở §0 kiến trúc tổng, không có mục riêng — spec cũng chưa đủ chi tiết để implement)
```

---

## GHI CHÚ QUAN TRỌNG

- **Mục 3/4/5 (Can Chi tháng/ngày/giờ-Can) là phát hiện MỚI của Phase 19** — chưa từng được liệt kê rõ ràng
  ở Phase 1-18B (các phase trước tập trung vào chính tinh/status/phụ tinh). Đây là khoảng trống thật so với
  spec §4.2 (`CalendarResult.canChi: {year, month, day, hour}` — engine hiện chỉ có `year` đầy đủ, `hour`
  chỉ có Chi không Can, `month`/`day` hoàn toàn không có pillar). Đáng chú ý: module `bat-tu.ts` trong cùng
  codebase ĐÃ có khả năng tính đủ 4 trụ Can Chi (dùng ở Phase 11A để lấy trụ ngày/tháng) nhưng KHÔNG được
  nối vào `tinhTuVi()` — đây là khoảng trống về TÍCH HỢP, không phải thiếu thuật toán.
- **Mục 38 (chiều Đại Vận) đã CẢI THIỆN** so với `docs/TUVI_ENGINE_AUDIT.md` cũ (viết trước khi có
  GM-002→006) — khi đó ghi "3/4 tổ hợp chưa có điểm dữ liệu". Nay đã có đủ 4/4 tổ hợp Dương Nam/Dương Nữ/
  Âm Nam/Âm Nữ được GM xác nhận riêng biệt. Cập nhật này KHÔNG cần sửa gì, chỉ cần cập nhật nhận thức khi
  đọc lại audit cũ.
- **Mục 41 (JSON output không khớp schema spec)** là vấn đề kiến trúc/hợp đồng, không phải vấn đề tính
  đúng/sai — `TuViChart` hoạt động đúng chức năng, chỉ khác tên field và cấu trúc lồng nhau so với spec §36.
  Không có Golden Master nào để kiểm mục này (đây không phải rule tính toán).
- **11 mục ở nhóm B/D đều xoay quanh cùng 1 nguyên nhân gốc**: 6 Golden Master hiện có (`GM-001..006`) chỉ
  cho dữ liệu về 14 chính tinh + Mệnh/Thân/Cục/Mệnh Quái/Chủ Mệnh/Chủ Thân/Đại Vận/Tuần — **không một GM
  nào từng ghi rõ vị trí phụ tinh** (Lộc Tồn, Khôi Việt, Xương Khúc, Tả Hữu, Kình Đà, Hỏa Linh, Không Kiếp,
  Thiên Mã, Thiên Hình, Tràng Sinh, Thái Tuế). Đây là giới hạn của chính bộ dữ liệu GM hiện có, không phải
  lỗi engine.

---

## TEST

```
npx vitest run
```

```
Test Files  16 passed (16)
     Tests  457 passed | 5 expected fail (462)
```

- PASS: 457
- EXPECTED FAIL: 5 (GM-003 vị trí Thiên Lương, GM-005 vị trí Tham Lang, GM-005 vị trí Thất Sát, GM-006 vị
  trí Vũ Khúc+Phá Quân, GM-006 Tuần Không — không đổi từ Phase 18B)
- UNEXPECTED FAIL: 0
- REGRESSION: KHÔNG có (Phase 19 không sửa file nào ngoài tài liệu audit này)

Không sửa test, không xóa test, không sửa Golden Master.

---

## KẾT LUẬN

Không implement rule mới. Không sửa Golden Master. Không sửa status table. **KHÔNG COMMIT/PUSH.**

Khoảng trống đáng chú ý nhất phát hiện MỚI ở Phase 19 (chưa từng ghi ở phase nào trước): **Can Chi
tháng/ngày và Can giờ hoàn toàn không được engine Tử Vi xuất ra**, dù spec §4.2 yêu cầu rõ và module
`bat-tu.ts` cùng codebase đã có sẵn khả năng này nhưng chưa được nối vào.
