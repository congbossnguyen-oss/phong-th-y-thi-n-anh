# PHASE 31 — NATAL CORE LOCK & FREEZE

Trạng thái: **NATAL_CORE_LOCK_STATUS = LOCKED** (xem Mục XVI để có verdict đầy đủ và điều kiện).

Phase này KHÔNG phải phase nghiên cứu, KHÔNG sửa công thức huyền học, KHÔNG sửa Golden Master, KHÔNG
commit/push. Toàn bộ nội dung dưới đây là tài liệu change-control cho phần **Natal Core** (lá số gốc, bất
biến theo thời gian xem) của module Tử Vi Đẩu Số, dựa trên kết luận `NATAL_CORE_READY_FOR_LOCK` của
[TUVI_PHASE30_FINAL_NATAL_ENGINE_AUDIT.md](./TUVI_PHASE30_FINAL_NATAL_ENGINE_AUDIT.md).

---

## I. Phạm vi Natal Core (những gì bị khóa bởi phase này)

Natal Core = tập hợp dữ liệu/công thức xác định **lá số gốc tại thời điểm sinh**, không phụ thuộc
`viewingYear` (trừ chính bản thân Đại Vận — xem ghi chú). Cụ thể gồm:

1. **Lịch/Tứ trụ**: chuyển đổi dương lịch → âm lịch (`solarToLunar`), 4 trụ Năm/Tháng/Ngày/Giờ
   (`tinhBatTu` trong `bat-tu.ts`, tái sử dụng qua `pillarOf()` trong `engine.ts`).
2. **Mệnh/Thân**: `menhChiIndex`, `thanChiIndex`.
3. **Cục**: `cucName`, `cucSo`, `banMenhNapAm`/`banMenhElement`.
4. **Mệnh Chủ / Thân Chủ**: `CHU_MENH_BY_YEAR_BRANCH`, `THAN_CHU_BY_YEAR_BRANCH`.
5. **Mệnh Quái**: `tinhMenhQuai()`.
6. **12 cung**: tên cung (`CUNG_NAMES_TU_MENH_NGHICH`), Chi của từng cung.
7. **Can 12 cung**: `getPalaceStem()` (Ngũ Hổ Độn, `NGU_HO_DON`).
8. **14 chính tinh**: vị trí (`TU_VI_RING`, `THIEN_PHU_RING`) và trạng thái Miếu/Vượng/Đắc/Bình/Hãm
   (`MAIN_STAR_STATUS`, bảng 168 ô, nguồn Nguyên Cát — xem Phase 16).
9. **Tứ Hóa**: `TU_HOA_TABLE`.
10. **Phụ tinh đã khóa**: Tả Phù/Hữu Bật, Văn Xương/Văn Khúc, Thiên Khôi/Thiên Việt, Lộc Tồn/Kình
    Dương/Đà La, Địa Không/Địa Kiếp, Thiên Mã, Đào Hoa (vị trí), Thiên Hình, Thiên Diêu/Thiên Y.
11. **Phụ tinh CONFLICTED nhưng vẫn thuộc Natal Core (đóng băng ở trạng thái hiện tại)**: Hỏa Tinh,
    Linh Tinh — xem Mục III.
12. **Vòng sao**: Vòng Tràng Sinh (`TRANG_SINH_START`, `TRANG_SINH_STAGES`), Vòng Thái Tuế
    (`THAI_TUE_STAGES`).
13. **Tuần/Triệt**: `khongVongIndicesOf` (Tuần, trong `bat-tu.ts`), `TRIET_TABLE` (Triệt).
14. **Đại Vận**: điểm khởi và hướng đi (`isThuanChung`), gắn liền với Cục — bản thân dãy Đại Vận là bất
    biến theo lá số gốc, kể cả khi `viewingYear` thay đổi chỉ ảnh hưởng đến việc **hiển thị** đại vận nào
    đang active (`daiVanTuoi`), không ảnh hưởng đến giá trị Đại Vận của từng cung.
15. **JSON contract**: `toJsonContract()` trong `json-contract.ts` — là adapter thuần túy, không tính
    toán lại, nên nằm trong phạm vi khóa cùng dữ liệu nó phản ánh.

**Không thuộc Natal Core** (xem Mục VII — Future Modules): Vòng Bác Sĩ, Tiểu Hạn, Lưu Niên/Lưu Tứ Hóa,
mọi hệ vận hạn theo năm xem khác ngoài Đại Vận, phân loại/nhóm sao đầy đủ theo §33 của spec gốc.

---

## II. Quy tắc thay đổi (Change Control)

Kể từ khi Phase 31 hoàn tất, **mọi thay đổi đối với bất kỳ mục nào trong Mục I** — dù là sửa 1 giá trị
trong bảng, đổi công thức, đổi hướng an sao, hay đổi nguồn — đều phải đi kèm một **PHASE CHANGE REQUEST**
chính thức, viết bằng đúng 10 mục sau (không được lược bớt):

1. **Rule bị thay đổi** — tên bảng/hàm/hằng số cụ thể trong `rules.ts`/`engine.ts`.
2. **Lý do** — vì sao rule hiện tại (đã LOCKED) cần xem xét lại.
3. **Source mới** — trích dẫn nguyên văn + URL/tên tài liệu.
4. **Source hierarchy** — Level 1/2/3/4 theo đúng phân cấp đã dùng xuyên suốt (Mục IV), và so sánh với
   Level của nguồn đang khóa.
5. **Golden Master impact** — thay đổi này có làm lệch/khớp thêm với GM-001→007 nào không; liệt kê rõ.
6. **Test impact** — test nào sẽ phải sửa expected, test nào sẽ thêm mới; KHÔNG được xóa test để né fail.
7. **Regression impact** — chạy `npx vitest run` trước/sau, so PASS/EXPECTED-FAIL/UNEXPECTED-FAIL.
8. **UI impact** — có cần sửa `lap-la-so-tu-vi.astro` không.
9. **JSON impact** — có cần sửa `json-contract.ts`/`TuViJsonContract` không (breaking change cho consumer
   ngoài không).
10. **Backward compatibility** — API cũ (`tinhTuVi`, `getPalace`, `getStar`, `getPalaceStem`,
    `toJsonContract`) có còn hoạt động đúng như cũ cho input cũ không.

Chỉ sau khi Phase Change Request được duyệt (bởi người dùng, ngoài quy trình của riêng Claude) mới được
sửa code. Không có Phase Change Request → không sửa, dù có tìm thấy nguồn mới trong lúc làm việc khác.

---

## III. Trường hợp đặc biệt: Hỏa Tinh / Linh Tinh (`DEFERRED_SCHOOL_CONFLICT`)

Hỏa Tinh (`HOA_TINH_START`) và Linh Tinh (`LINH_TINH_START`) vẫn giữ nguyên công thức hiện tại (khởi theo
nhóm tam hợp + luôn cộng `gioChiIndex`, KHÔNG có điều chỉnh hướng theo giới tính/Âm Dương). Trạng thái
`CONFLICTED` từ Phase 18B/22 được giữ nguyên, KHÔNG được nâng cấp thành `LOCKED`/`SOURCE_SUPPORTED` chỉ vì
Phase 31 đóng băng nó — đóng băng ở đây có nghĩa là **"không đổi code cho tới khi có Phase Change Request
với nguồn Level 1/2 rõ ràng"**, không có nghĩa là tranh chấp trường phái đã được giải quyết. Xem Rule
Registry ([TUVI_NATAL_CORE_RULE_REGISTRY.md](./TUVI_NATAL_CORE_RULE_REGISTRY.md)) — cột `Frozen = YES`
nhưng cột `Status = DEFERRED_SCHOOL_CONFLICT`.

Tương tự, 3 xung đột vị trí Golden Master đã được điều tra pháp y ở Phase 28 (GM-003 Thiên Lương, GM-005
Tham Lang/Thất Sát, GM-006 Vũ Khúc/Phá Quân) kết luận `ENGINE_SUPPORTED` — engine đúng theo tự-nhất-quán
nội tại, GM Pack text là `KNOWN_GOLDEN_MASTER_DATA_CONFLICT` (nghi vấn lỗi transcription). Theo đúng quy
tắc toàn bộ 30 phase trước, **Golden Master Pack KHÔNG được sửa** dù đã có kết luận kỹ thuật — 5 test
`it.fails()` trong `tests/tu-vi-golden-gm002-006.test.ts` tiếp tục được giữ nguyên, đóng vai trò tài liệu
hóa chính thức của xung đột này.

---

## IV. Source Hierarchy (nhắc lại, không đổi)

- **Level 1** — nguồn Nam Phái/project-canonical trực tiếp (vd. hocvienlyso.org).
- **Level 2** — văn bản Nam Phái có tác giả named (vd. Trần Việt Sơn trích "cụ Thiên Lương";
  tuvivietnam.vn cho Thiên Mã).
- **Level 3** — lá số thực tế tính độc lập (tuvinamphai.vn, GM-SOURCE-A/B/C, Phase 15).
- **Level 4** — trường phái khác, chỉ tham khảo, KHÔNG dùng làm bằng chứng khóa rule (vd. Vương Đình
  Chi/Trung Châu, hoctuvi.blogspot.com).

---

## V. Baseline

Xem [TUVI_NATAL_CORE_BASELINE.md](./TUVI_NATAL_CORE_BASELINE.md) cho báo cáo baseline test đầy đủ và
snapshot regression GM-001→006.

---

## VI. Kiến trúc: NATAL CORE → PUBLIC CHART MODEL → FUTURE MODULES

```
┌─────────────────────┐      ┌──────────────────────────┐      ┌─────────────────────────┐
│     NATAL CORE       │      │   PUBLIC CHART MODEL      │      │   FUTURE MODULES         │
│  (Phase 31 LOCKED)   │─────▶│  TuViChart / JSON contract│─────▶│  Vòng Bác Sĩ, Tiểu Hạn,  │
│  rules.ts, engine.ts │ tinh │  (READ_ONLY_NATAL_INPUT)  │ đọc  │  Lưu Niên, Lưu Tứ Hóa,   │
│  bat-tu.ts (4 trụ)    │ ToanTV│                          │ only │  §33 phân loại sao đầy đủ│
└─────────────────────┘      └──────────────────────────┘      └─────────────────────────┘
```

- **Natal Core** sản xuất ra đúng 1 giá trị duy nhất: `TuViChart` (trả về bởi `tinhTuVi()`), là
  **read-only input** (`READ_ONLY_NATAL_INPUT`) cho mọi thứ phía sau.
- **Public Chart Model** = `TuViChart` + `TuViJsonContract` (qua `toJsonContract()`). Đây là "hợp đồng"
  duy nhất mà module khác được phép phụ thuộc vào. Không module nào được import thẳng `rules.ts` để tự
  tính lại — phải đi qua `tinhTuVi()`/`getPalace()`/`getStar()`/`getPalaceStem()`.
- **Future Modules** (Vòng Bác Sĩ, Tiểu Hạn, Lưu Niên, Lưu Tứ Hóa, hệ vận hạn mở rộng khác, phân loại sao
  đầy đủ §33) nhận `TuViChart` làm tham số **đọc**, KHÔNG được:
  - Gán lại (mutate) bất kỳ field nào của `TuViChart`/`CungKetQua`/`ChinhTinhO`/`PhuTinhO` đã nhận vào.
  - Import/gọi thẳng các bảng nội bộ của `rules.ts` để tính lại phần đã có trong Natal Core (vd. không tự
    tính lại 14 chính tinh, không tự tính lại Can 12 cung).
  - Được implement trong Phase 31 này — Phase 31 chỉ định nghĩa ranh giới, không viết code cho các module
    này.
- Được test hóa: xem `tests/tu-vi-phase31-natal-core-lock.test.ts`, nhóm mô tả
  "READ_ONLY_NATAL_INPUT: adapter/helper không mutate chart gốc" — xác nhận `toJsonContract()`,
  `getPalace()`, `getStar()` gọi nhiều lần liên tiếp không làm thay đổi `chart` gốc (so sánh
  `JSON.stringify` trước/sau).

---

## VII. Future Modules — tái xác nhận KHÔNG nằm trong Phase 31

Theo đúng Master Matrix của Phase 30, các mục sau vẫn là `FUTURE_MODULE`, chưa implement, và **Phase 31
không cấp phép implement**:

- Vòng Bác Sĩ (12 sao Bác Sĩ/Lực Sĩ/Thanh Long/...).
- Tiểu Hạn (vận hạn theo năm, khác Đại Vận).
- Lưu Niên / Lưu Tứ Hóa (Tứ Hóa theo năm xem, khác Tứ Hóa bản mệnh đã khóa ở Mục I.9).
- Phân loại/nhóm sao đầy đủ theo §33 spec gốc (Sát tinh, Cát tinh, Đào Hoa nhóm, v.v. ngoài các sao đã
  liệt kê ở Mục I).
- Bất kỳ hệ vận hạn mở rộng nào khác ngoài Đại Vận.

Khi các module này được implement ở phase sau, chúng phải tuân thủ ranh giới kiến trúc ở Mục VI: nhận
`TuViChart` làm input read-only, không mutate, không tính lại Natal Core.

---

## VIII. Xác nhận không có ENGINE BUG HIGH/CRITICAL đang mở

Theo Phase 30 Blocker Analysis (tái xác nhận ở Phase 31, không nghiên cứu thêm):

- 3 xung đột vị trí GM (GM-003/005/006) → `KNOWN_GOLDEN_MASTER_DATA_CONFLICT`, không phải bug engine
  (Phase 28 đã chứng minh tự-nhất-quán nội tại 84/84).
- Hỏa Tinh/Linh Tinh `CONFLICTED` → `DEFERRED_SCHOOL_CONFLICT`, không phải bug, là xung đột trường phái
  đã biết từ trước, chưa có nguồn Level 1/2 đủ mạnh để khóa hướng an sao.
- Không có mục nào khác được gắn cờ HIGH/CRITICAL trong 52 mục Master Matrix của Phase 30.

→ Không có blocker chặn LOCK.

---

## IX. Rule Registry

Xem [TUVI_NATAL_CORE_RULE_REGISTRY.md](./TUVI_NATAL_CORE_RULE_REGISTRY.md) — bảng đầy đủ
`| Rule | Status | Source | GM | Test | Frozen |` cho mọi rule Natal Core.

---

## X. Integrity manifest (tùy chọn)

Spec cho phép bỏ qua nếu kiến trúc hiện tại không phù hợp ("Không cần dùng cryptographic hash nếu
architecture hiện tại không phù hợp"). Đánh giá: repo không có cơ chế build-time integrity check nào khác
đang tồn tại (không có checksum lock cho file nguồn ở bất kỳ đâu trong dự án), và toàn bộ 6 file cốt lõi
đã có git history riêng (dù hiện đang untracked, xem Mục XIII) — cách phát hiện thay đổi ngoài ý muốn đáng
tin cậy nhất trong dự án này là **snapshot test** (Mục V của Baseline doc) chứ không phải hash thủ công dễ
lỗi thời khi sửa hợp lệ. Quyết định: **không tạo integrity manifest riêng** — snapshot regression đã đóng
vai trò tương đương (phát hiện bất kỳ thay đổi output nào của `rules.ts`/`engine.ts`/`bat-tu.ts` truyền
qua `tinhTuVi()`), chỉ không phát hiện được thay đổi ở `json-contract.ts`/renderer nếu không làm lệch
output — rủi ro này chấp nhận được vì cả 2 đều là adapter thuần túy, đã có test riêng (Mục XI).

---

## XI. Test không-mutate (`toJsonContract`/renderer)

Xem [TUVI_NATAL_CORE_BASELINE.md](./TUVI_NATAL_CORE_BASELINE.md) Mục 5 — đã thêm 3 test xác nhận
`toJsonContract()`/`getPalace()`/`getStar()` không mutate chart gốc; giới hạn với renderer (không thể
unit-test do là `<script>` inline trong `.astro`) được ghi nhận trung thực, không bị che giấu.

---

## XII. Public API

Xem [TUVI_NATAL_CORE_RULE_REGISTRY.md](./TUVI_NATAL_CORE_RULE_REGISTRY.md) mục "API_CLEANUP_CANDIDATE" —
5 hàm public chính thức (`tinhTuVi`, `getPalace`, `getStar`, `getPalaceStem`, `toJsonContract`); export
rộng từ `rules.ts` (~50 symbol) được gắn cờ `API_CLEANUP_CANDIDATE`, không refactor trong phase này.

---

## XIII. Kết quả chạy Regression Suite (Phase 31)

Xem [TUVI_NATAL_CORE_BASELINE.md](./TUVI_NATAL_CORE_BASELINE.md) Mục 1-2. Tóm tắt:

- Trước Phase 31 (baseline chốt từ Phase 30): 716 PASS / 5 EXPECTED-FAIL / 0 UNEXPECTED-FAIL / 721 tổng.
- Sau Phase 31 (thêm 10 test bảo vệ/snapshot thuần Phase 31): 726 PASS / 5 EXPECTED-FAIL / 0
  UNEXPECTED-FAIL / 731 tổng.
- PASS không giảm (chỉ tăng đúng bằng số test mới). EXPECTED-FAIL không tăng. UNEXPECTED-FAIL = 0.
  → Đạt yêu cầu Mục XIII.

---

## XIV. Trạng thái git (xác nhận KHÔNG commit/push)

`git status --short` xác nhận: 3 file doc mới (`TUVI_NATAL_CORE_LOCK.md`,
`TUVI_NATAL_CORE_RULE_REGISTRY.md`, `TUVI_NATAL_CORE_BASELINE.md`) và 1 file test mới
(`tests/tu-vi-phase31-natal-core-lock.test.ts`) cùng snapshot tự sinh
(`tests/__snapshots__/tu-vi-phase31-natal-core-lock.test.ts.snap`) đều ở trạng thái **untracked**, chưa
`git add`, chưa commit, chưa push — đúng theo chỉ thị "KHÔNG COMMIT/PUSH" lặp lại ở cuối spec Phase 31.
Không có file Tử Vi nào khác bị sửa đổi trong quá trình thực hiện phase này (không đổi
`rules.ts`/`engine.ts`/`json-contract.ts`/Golden Master).

---

## XV. Checklist hoàn tất Phase 31

- [x] Xác định chính xác baseline Natal Core (Mục I).
- [x] Tạo regression baseline + snapshot GM-001→006 (Mục V baseline doc).
- [x] Freeze các rule đã khóa (Mục IX / Rule Registry).
- [x] Freeze Golden Master Pack — không sửa bất kỳ dòng nào, 5 `it.fails()` giữ nguyên (Mục III).
- [x] Freeze test contract — không xóa/rewrite test cũ, chỉ thêm test mới thuần bảo vệ (Mục XIII).
- [x] Xác định rõ Phase 32+ được phép thay đổi gì (Mục II — chỉ qua Phase Change Request).
- [x] Đảm bảo module tương lai không làm thay đổi Natal Core (Mục VI — kiến trúc
      `READ_ONLY_NATAL_INPUT`, có test xác nhận không-mutate).
- [x] Không có ENGINE BUG HIGH/CRITICAL đang mở (Mục VIII).
- [x] Regression PASS không giảm, EXPECTED-FAIL không tăng, UNEXPECTED-FAIL = 0 (Mục XIII).
- [x] Source hierarchy không đổi (Mục IV).
- [x] Golden Master không sửa (xác nhận Mục III + XIV).
- [x] 168 status table không đổi (Mục I.8, không chạm `MAIN_STAR_STATUS`).
- [x] Core boundary rõ ràng (Mục VI).
- [x] Future modules tách biệt, chưa implement (Mục VII).
- [x] Không commit/push (Mục XIV).

---

## XVI. Verdict cuối cùng

Tất cả điều kiện bắt buộc để LOCK đều thỏa mãn: không có ENGINE BUG HIGH/CRITICAL, regression pass đầy đủ
(726/5/0/731, không drift so với baseline 716/5/0/721), source hierarchy không đổi, Golden Master không bị
sửa, bảng 168 status không đổi, ranh giới Natal Core rõ ràng, Future Modules tách biệt và chưa implement.

```
NATAL_CORE_LOCK_STATUS = LOCKED
```
