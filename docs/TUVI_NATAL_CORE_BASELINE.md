# PHASE 31 — NATAL CORE BASELINE REPORT

## 1. Test baseline chính thức (trước khi thêm test của chính Phase 31)

| Loại | Số lượng |
|---|---|
| PASS | 716 |
| EXPECTED-FAIL (`it.fails()`) | 5 |
| UNEXPECTED-FAIL | 0 |
| **TỔNG** | **721** |

5 expected-fail cố định (không đổi từ các phase trước, tất cả nằm trong
`tests/tu-vi-golden-gm002-006.test.ts`), tài liệu hóa 3 xung đột vị trí GM đã điều tra pháp y ở Phase 28
(`KNOWN_GOLDEN_MASTER_DATA_CONFLICT`, không phải bug engine — xem
[TUVI_NATAL_CORE_LOCK.md](./TUVI_NATAL_CORE_LOCK.md) Mục III):

1. GM-003 — vị trí Thiên Lương.
2. GM-005 — vị trí Tham Lang.
3. GM-005 — vị trí Thất Sát.
4. GM-006 — vị trí Vũ Khúc + Phá Quân.
5. GM-006 — vị trí Tuần Không.

## 2. Baseline sau khi thêm test bảo vệ của Phase 31

Phase 31 tự thêm `tests/tu-vi-phase31-natal-core-lock.test.ts` (10 test: 6 snapshot GM-001→006 + 3 test
chống mutate + 1 test neo baseline số liệu). Đây là test **thuần bảo vệ/đóng băng**, không kiểm tra rule
mới, không thay đổi hành vi engine.

| Loại | Số lượng | Ghi chú |
|---|---|---|
| PASS | 726 | 716 (baseline cũ) + 10 (test Phase 31) |
| EXPECTED-FAIL | 5 | Không đổi |
| UNEXPECTED-FAIL | 0 | Không đổi |
| **TỔNG** | **731** | 721 + 10 |

Xác nhận chạy `npx vitest run` lúc hoàn tất Phase 31:

```
Test Files  24 passed (24)
     Tests  726 passed | 5 expected fail (731)
```

→ **Không có drift**: PASS tăng đúng bằng số test mới thêm (không giảm bất kỳ test cũ nào), EXPECTED-FAIL
giữ nguyên 5 (không tăng thêm), UNEXPECTED-FAIL = 0. Đúng yêu cầu Mục XIII của spec Phase 31 (Phase 31 là
phase tài liệu hóa, không được phép làm lệch baseline).

## 3. Quy trình xác minh cho các phase sau

Từ nay, mọi phase sau khi chạy `npx vitest run` phải so sánh với baseline **731** (726 pass / 5 expected
fail) làm mốc mới, KHÔNG phải 721 cũ. Nếu:

- PASS giảm → có rule bị hỏng/xóa ngoài quy trình → điều tra ngay, không được sửa test để ép pass.
- EXPECTED-FAIL tăng → có rule mới bị hỏng và bị "giấu" bằng `it.fails()` → không được chấp nhận trừ khi
  có Phase Change Request giải thích rõ.
- UNEXPECTED-FAIL > 0 → dừng lại, điều tra nguyên nhân trước khi tiếp tục bất kỳ công việc nào khác.
- Snapshot `tests/__snapshots__/tu-vi-phase31-natal-core-lock.test.ts.snap` lệch (vitest báo
  "snapshot mismatch") → đây là tín hiệu mạnh nhất cho thấy Natal Core đã bị thay đổi ngoài quy trình,
  vì snapshot bao phủ toàn bộ Calendar/4 trụ/Mệnh/Thân/Cục/12 cung/Can cung/14 chính tinh + status/Tứ
  Hóa/Tuần/Triệt/Đại Vận/phụ tinh/vòng sao cho cả 6 case GM-001→006 cùng lúc.

## 4. Regression snapshot GM-001 → GM-006 (Mục V của spec)

Snapshot đầy đủ được lưu tại
`tests/__snapshots__/tu-vi-phase31-natal-core-lock.test.ts.snap` (1874 dòng, tự sinh bởi
`toMatchSnapshot()`, không chỉnh tay). Mỗi case GM-001→006 đóng băng đúng các nhóm dữ liệu theo yêu cầu:

- **Calendar**: âm lịch (ngày/tháng[nhuận]/năm), Can-Chi năm, 4 trụ Năm/Tháng/Ngày/Giờ.
- **Mệnh/Thân**: Âm Dương Nam/Nữ, Chi Mệnh, Chi Thân, Mệnh Quái, Mệnh Chủ, Thân Chủ.
- **Cục**: tên Cục, số Cục, Bản Mệnh Nạp Âm.
- **Tứ Hóa**: bảng Hóa Lộc/Quyền/Khoa/Kỵ theo Can năm.
- **12 cung** (× 12, mỗi case): Chi, Can, tên cung, cờ Mệnh/Thân, danh sách 14 chính tinh kèm trạng thái
  Miếu/Vượng/Đắc/Bình/Hãm và tag Tứ Hóa nếu có, danh sách phụ tinh kèm tag Tứ Hóa nếu có, Tràng Sinh, Thái
  Tuế, tuổi Đại Vận, Tuần, Triệt.

Case dùng cho snapshot (khớp input đã dùng xuyên suốt Phase 20-30 cho GM-001→006):

| Case | Input |
|---|---|
| GM-001 | 31/8/1980, giờ 11 (Ngọ), Nam |
| GM-002 | 31/8/1980, giờ 11 (Ngọ), Nữ |
| GM-003 | 25/8/1990, giờ 11 (Ngọ), Nam |
| GM-004 | 25/8/1997, giờ 11 (Ngọ), Nữ |
| GM-005 | 25/8/1997, giờ 0 (Tý), Nam |
| GM-006 | 4/2/2026, giờ 2 (Sửu), Nam |

## 5. Test bảo vệ read-only (Mục XI của spec)

`toJsonContract()`, `getPalace()`, `getStar()` được xác nhận **không mutate** `TuViChart` gốc — gọi nhiều
lần liên tiếp trên cùng 1 chart object cho kết quả `JSON.stringify` giống hệt trước/sau (3 test trong
`tests/tu-vi-phase31-natal-core-lock.test.ts`, mô tả "READ_ONLY_NATAL_INPUT").

**Giới hạn đã biết, ghi nhận trung thực thay vì bỏ qua**: renderer (`lap-la-so-tu-vi.astro`) chứa logic
hiển thị trong `<script>` inline của Astro component, không phải module TypeScript có thể `import` trực
tiếp vào file test — do đó **không thể viết automated test cho hành vi không-mutate của renderer** bằng
vitest trong kiến trúc hiện tại. Việc renderer không mutate chart đã được xác minh **thủ công qua browser**
nhiều lần (Phase 18B, 23, 24, 25, 30) bằng cách quan sát UI hiển thị đúng dữ liệu qua nhiều lần re-render,
nhưng đây không phải bằng chứng tự động hóa được. Nếu cần đóng kín hoàn toàn khoảng trống này, cần một
Phase Change Request riêng để tách logic render thành hàm thuần túy có thể unit-test — ngoài phạm vi Phase
31 (không refactor kiến trúc renderer trong phase này).

## 6. Kết luận

Baseline chính thức cho mọi phase từ Phase 32 trở đi: **726 PASS / 5 EXPECTED-FAIL / 0 UNEXPECTED-FAIL /
731 TỔNG**, cộng với snapshot GM-001→006 làm rào chắn regression bổ sung.
