# PHASE 31 — NATAL CORE RULE REGISTRY

Registry chính thức cho mọi rule thuộc Natal Core (xem phạm vi ở
[TUVI_NATAL_CORE_LOCK.md](./TUVI_NATAL_CORE_LOCK.md) Mục I). Cột `Frozen = YES` áp dụng cho **mọi** rule
dưới đây, kể cả những rule còn `CONFLICTED`/`DEFERRED_SCHOOL_CONFLICT` — đóng băng ở đây nghĩa là "cần
Phase Change Request mới được sửa", KHÔNG có nghĩa là trạng thái kỹ thuật đã hoàn tất/đúng tuyệt đối.

Ký hiệu `GM`: `✓` = đã đối chiếu khớp với ≥1 Golden Master case; `✗(known)` = có xung đột đã biết, ghi
nhận là `KNOWN_GOLDEN_MASTER_DATA_CONFLICT`, không sửa; `—` = GM Pack không có dữ liệu tường minh cho mục
này (không thể đối chiếu, không phải lỗi).

| Rule | Status | Source | GM | Test | Frozen |
|---|---|---|---|---|---|
| Lịch Âm/Dương (`solarToLunar`) | LOCKED | Thuật toán lịch âm dương chuẩn (ngoài phạm vi Tử Vi, đã khóa từ trước dự án) | ✓ | tu-vi-golden.test.ts, phase20 | YES |
| Tứ trụ (Năm/Tháng/Ngày/Giờ, `tinhBatTu`/`pillarOf`) | LOCKED | Tái sử dụng `bat-tu.ts` (Phase 20, cấm viết engine Can-Chi thứ 2) | ✓ | tu-vi-phase20-four-pillars.test.ts (34) | YES |
| Mệnh/Thân (`menhChiIndex`/`thanChiIndex`) | LOCKED | Công thức gốc dự án | ✓ | tu-vi-golden.test.ts | YES |
| Cục (`CUC_INFO`) | LOCKED | Công thức gốc dự án | ✓ | tu-vi-golden.test.ts | YES |
| Mệnh Chủ (`CHU_MENH_BY_YEAR_BRANCH`) | LOCKED | Bảng gốc dự án, đã rà soát Phase 16-19 | ✓ | tu-vi-phase8-locked-rules.test.ts | YES |
| Thân Chủ (`THAN_CHU_BY_YEAR_BRANCH`) | LOCKED | Bảng gốc dự án, đã rà soát Phase 16-19 | ✓ | tu-vi-phase8-locked-rules.test.ts | YES |
| Mệnh Quái (`tinhMenhQuai`) | LOCKED | Công thức gốc dự án | ✓ | tu-vi-menh-quai-boundary.test.ts | YES |
| 12 cung tên (`CUNG_NAMES_TU_MENH_NGHICH`) | LOCKED | Công thức gốc dự án | ✓ | tu-vi-golden.test.ts | YES |
| Can 12 cung / Ngũ Hổ Độn (`getPalaceStem`, `NGU_HO_DON`) | LOCKED | Level 1 + Level 3: đối chiếu 24/24 điểm với GM-SOURCE-A/B (tuvinamphai.vn, Phase 15/29) | ✓ | tu-vi-phase29-can-cung-triet-thien-ma.test.ts, tu-vi-palace-stem.test.ts | YES |
| Tử Vi/Thiên Phủ vị trí (`TU_VI_RING`, `THIEN_PHU_RING`) | LOCKED | Công thức gốc dự án, tự-nhất-quán 84/84 xác nhận Phase 28 | ✓ | tu-vi-golden.test.ts | YES |
| 14 chính tinh vị trí (còn lại 12 sao) | LOCKED | Công thức gốc dự án | ✓ | tu-vi-golden.test.ts | YES |
| 14 chính tinh vị trí — GM-003 Thiên Lương | ENGINE_SUPPORTED | Phase 28 forensic: tự-nhất-quán nội tại, GM Pack text nghi vấn transcription | ✗(known) | tu-vi-golden-gm002-006.test.ts (`it.fails`) | YES |
| 14 chính tinh vị trí — GM-005 Tham Lang/Thất Sát | ENGINE_SUPPORTED | Phase 28 forensic, như trên | ✗(known) | tu-vi-golden-gm002-006.test.ts (`it.fails`) | YES |
| 14 chính tinh vị trí — GM-006 Vũ Khúc/Phá Quân | ENGINE_SUPPORTED | Phase 28 forensic, như trên | ✗(known) | tu-vi-golden-gm002-006.test.ts (`it.fails`) | YES |
| Trạng thái Miếu/Vượng/Đắc/Bình/Hãm (`MAIN_STAR_STATUS`, 168 ô) | LOCKED | Level 1: Nguyên Cát (Phase 16, nguồn duy nhất/sole source of truth) | ✓ | tu-vi-phase16-nguyen-cat-status.test.ts (168+8) | YES |
| Tứ Hóa (`TU_HOA_TABLE`) | LOCKED | Công thức gốc dự án, đã rà soát Phase 18B/19 | ✓ | tu-vi-tu-hoa-full.test.ts | YES |
| Tả Phù / Hữu Bật (`taPhuIndex`/`huuBatIndex`) | SOURCE_SUPPORTED | Level 1 (Phase 22) | ✓ | tu-vi-phase24-khoi-viet-xuong-khuc-ta-huu.test.ts | YES |
| Văn Xương / Văn Khúc (`vanXuongIndex`/`vanKhucIndex`) | SOURCE_SUPPORTED | Level 1 (Phase 22) | ✓ | tu-vi-phase24-khoi-viet-xuong-khuc-ta-huu.test.ts | YES |
| Thiên Khôi (`THIEN_KHOI_TABLE`) | LOCKED | Level 1: Nam Phái, cùng nguồn với Thiên Việt (Phase 24, thay bảng spec-literal cũ) | ✓ | tu-vi-phase24-khoi-viet-xuong-khuc-ta-huu.test.ts, tu-vi-thien-viet.test.ts | YES |
| Thiên Việt (`THIEN_VIET_TABLE`) | LOCKED | Level 1: `COMMON_ANCESTOR_SOURCE` "Sai lầm về an sao lập số" (Phase 22/24) | ✓ | tu-vi-thien-viet.test.ts | YES |
| Lộc Tồn (`LOC_TON_TABLE`) | LOCKED | Công thức gốc dự án | ✓ | tu-vi-golden.test.ts | YES |
| Kình Dương / Đà La (hướng theo `isThuanChung`) | LOCKED | Level 1 (Phase 22 nghiên cứu → Phase 23 implement) | ✓ | tu-vi-phase23-kinh-da.test.ts (18) | YES |
| Hỏa Tinh / Linh Tinh (`HOA_TINH_START`/`LINH_TINH_START`) | DEFERRED_SCHOOL_CONFLICT | Level 4 nguồn tự mâu thuẫn nội bộ (`SCHOOL_CONFLICT`, Phase 22) — công thức giữ nguyên, KHÔNG thêm hướng theo giới tính | — | (không có test khóa hướng; công thức vị trí cơ bản có trong tu-vi-golden.test.ts) | YES |
| Địa Không / Địa Kiếp (`diaKhongIndex`/`diaKiepIndex`) | SOURCE_SUPPORTED | Level 1, khởi Hợi (Phase 22) | ✓ | tu-vi-golden.test.ts | YES |
| Thiên Mã (`THIEN_MA_START`) | LOCKED | Level 2: tuvivietnam.vn, "kinh nghiệm cụ Thiên Lương" — đủ 4/4 nhóm (Phase 26→29) | — | tu-vi-phase26-vong-sao-thien-ma.test.ts, tu-vi-phase29-can-cung-triet-thien-ma.test.ts | YES |
| Đào Hoa vị trí (`DAO_HOA_START`) | LOCKED | Công thức gốc dự án (vị trí; OUT_OF_SCOPE cho phần mở rộng ý nghĩa) | — | tu-vi-golden.test.ts | YES |
| Thiên Hình (`thienHinhIndex`) | SOURCE_SUPPORTED | Level 1 (Phase 22) | — | tu-vi-golden.test.ts | YES |
| Thiên Diêu / Thiên Y (`thienDieuIndex`/`thienYIndex`) | LOCKED | Level 1/2 (Phase 22 nghiên cứu → Phase 25 implement, khởi Sửu, luôn đồng cung) | — | tu-vi-phase25-thien-dieu-thien-y.test.ts (28) | YES |
| Vòng Tràng Sinh (`TRANG_SINH_START`, `TRANG_SINH_STAGES`) | LOCKED | Level 1: điểm khởi + hướng đi đều xác nhận (Phase 26) | ✓ | tu-vi-phase26-vong-sao-thien-ma.test.ts | YES |
| Vòng Thái Tuế (`THAI_TUE_STAGES`) | SOURCE_SUPPORTED | Level 1 (Phase 26) | ✓ | tu-vi-phase26-vong-sao-thien-ma.test.ts | YES |
| Tuần (`khongVongIndicesOf`, trong `bat-tu.ts`) | LOCKED | Tái sử dụng `bat-tu.ts` (Phase 20/29) | ✓ | tu-vi-phase18b-triet.test.ts, phase29 | YES |
| Triệt (`TRIET_TABLE`) | LOCKED | Level 1: hocvienlyso.org, 5/5 nhóm Can (Phase 29) | ✓ (GM-006 conflict riêng biệt, không thuộc vị trí Triệt) | tu-vi-phase18b-triet.test.ts, tu-vi-phase29-can-cung-triet-thien-ma.test.ts | YES |
| Đại Vận (điểm khởi + `isThuanChung`) | LOCKED | Công thức gốc dự án, gắn với Cục (đã rà soát Phase 19/30) | ✓ | tu-vi-golden.test.ts | YES |
| JSON contract (`toJsonContract`, 5 bảng enum-map) | LOCKED | Adapter thuần túy, không tính toán lại (Phase 21) | ✓ (gián tiếp qua chart) | tu-vi-phase21-json-contract.test.ts (67) | YES |
| Renderer hiển thị Tứ Hóa trên phụ tinh | LOCKED | Sửa lỗi hiển thị thuần túy, không đổi dữ liệu (Phase 18B) | — | Xác nhận thủ công qua browser (Phase 18B/23/24/25/30) | YES |

**Không nằm trong Natal Core, không thuộc registry này** (xem
[TUVI_NATAL_CORE_LOCK.md](./TUVI_NATAL_CORE_LOCK.md) Mục VII): Vòng Bác Sĩ, Tiểu Hạn, Lưu Niên/Lưu Tứ
Hóa, phân loại sao đầy đủ §33, các hệ vận hạn mở rộng khác.

**Hồng Loan / Thiên Hỷ** (`hongLoanIndex`/`thienHyIndex`, `DAO_HOA_START`-derived): giữ nguyên trong code
(công thức không đổi từ trước), nhưng theo spec gốc được đánh dấu `OUT_OF_SCOPE` cho việc mở rộng/xác
minh nguồn sâu hơn — ghi nhận `Frozen = YES` ở mức "không đổi công thức hiện có", không nâng cấp status.

| Rule | Status | Source | GM | Test | Frozen |
|---|---|---|---|---|---|
| Hồng Loan / Thiên Hỷ (`hongLoanIndex`/`thienHyIndex`) | OUT_OF_SCOPE | Công thức gốc dự án, chưa xác minh nguồn sâu (ngoài phạm vi các phase 16-30) | — | tu-vi-golden.test.ts (gián tiếp) | YES |

---

## API_CLEANUP_CANDIDATE (Mục XII của spec Phase 31 — chỉ ghi nhận, không refactor)

Public API hiện tại (surface đã dùng bởi renderer/consumer ngoài):

- `tinhTuVi(input: TuViInput): TuViChart` — entrypoint chính.
- `getPalace(chart, chiName): CungKetQua`
- `getStar(chart, chiName, starName): ChinhTinhO`
- `getPalaceStem(yearCanName, palaceChiIndex): string`
- `toJsonContract(chart): TuViJsonContract`

Đây là 5 hàm nên được coi là "Public API chính thức" của module theo ranh giới Mục VI. Tuy nhiên,
`rules.ts` hiện **export ~50 symbol** (bảng dữ liệu, hàm tính index riêng lẻ như `taPhuIndex`,
`vanKhucIndex`, hằng số `mod12`/`mod10`, v.v.) — về mặt kỹ thuật đều là `export` nên **có thể bị import
trực tiếp** bởi code khác, bỏ qua lớp `engine.ts`. Điều này vi phạm tinh thần ranh giới ở Mục VI (Future
Modules chỉ nên phụ thuộc `TuViChart`/JSON contract, không phụ thuộc thẳng bảng nội bộ).

→ Đánh dấu: **`API_CLEANUP_CANDIDATE`** — toàn bộ export trực tiếp từ `rules.ts` (ngoài type
`TrangThaiSao`/`TuHoaResult` cần thiết cho type signature của `engine.ts`) nên được thu hẹp phạm vi export
(vd. không re-export qua index, hoặc đổi thành internal-only) ở một phase tương lai riêng biệt, có Phase
Change Request. **Không tự refactor trong Phase 31.**
