# FUTURE WORK — discovered during Phase 1/2/gate audit, deferred (per Scope Guard)

Không implement gì dưới đây khi phát hiện. Ghi lại để phase sau không phải khám phá lại.

**Cập nhật Phase 2.1**: 2 câu hỏi kiến trúc từng nằm ở đây (`CelestialBody` không mở rộng
được; `NormalizedDignityResult.type` chỉ biểu diễn được Tây phương) đã được duyệt và giải
quyết — xem `docs/astrology-module/ARCHITECTURE/PHASE2_1_CONTRACT_HARDENING.md`. Không còn là
future work, không lặp lại ở đây nữa. Mục 9-10 dưới đây là 2 phát hiện MỚI từ gate audit
(`PHASE3_GATE_AUDIT.md`) — CHỈ ghi lại theo đúng yêu cầu ("Do NOT automatically change these"),
CHƯA sửa.

## 1. `calendar-core`'s `zonedTimeToUtc` không phát hiện ambiguous/nonexistent local time

`packages/calendar-core/src/timezone/timezone.ts::zonedTimeToUtc()` dùng phương pháp hội tụ 2
bước, luôn trả về MỘT `Date` mà không bao giờ báo ambiguous/nonexistent — đúng nhu cầu của các
Engine hiện có (Bát Tự/Tử Vi/Trạch Nhật chủ yếu dùng ngày sinh dương lịch + giờ, ít khi rơi
đúng khung DST của các múi giờ hiếm dùng DST). Astrology Module Phase 1 cần chính xác hơn nên
đã viết `timezone/resolveLocalTime.ts` RIÊNG (không sửa `calendar-core`) — xem
`ARCHITECTURE_FREEZE.md` reconciliation note trong session log.

**Cân nhắc cho tương lai (KHÔNG làm ngay)**: nếu một Engine khác (vd. Trạch Nhật mở rộng sang
thị trường có DST) sau này cũng cần phát hiện ambiguous/nonexistent, cân nhắc nâng cấp
`calendar-core::zonedTimeToUtc` để cả hai dùng chung logic — hiện tại có 2 bản triển khai hội
tụ-offset tương tự nhau trong 2 package khác nhau (chấp nhận trùng lặp có kiểm soát để tránh
sửa code dùng chung production của các Engine khác trong Phase 1 của một module hoàn toàn mới).

## 2. `SwissEphemerisProvider` — chưa viết, chờ quyết định license

Xem `docs/astrology-module/ARCHITECTURE/LICENSE_BOUNDARY.md`. Khi có quyết định, việc cần làm:
1. Implement `AstronomicalProvider` (đã có interface đầy đủ ở `astronomical/AstronomicalProvider.ts`).
2. KHÔNG thay đổi bất kỳ interface nào — mọi code Phase 3+ (Western/Vedic calculation) chỉ phụ thuộc interface, không phụ thuộc implementation cụ thể.
3. Ephemeris data files (`.se1` hoặc tương đương) — cần quyết định: bundle sẵn hay tải runtime, dung lượng bao nhiêu (xem `SWISS_EPHEMERIS_AUDIT.md` — bộ đầy đủ có thể tới 48GB, cần chọn tập con phù hợp).

## 3. `resolveBirthDataInstant` khi `localTime === null`

Hiện trả UTC tại 00:00:00 giờ địa phương ngày sinh làm MỐC THAM CHIẾU, có ghi rõ trong JSDoc là
KHÔNG được diễn giải là giờ sinh thật. Phase 3 (Chart Calculation) phải tự quyết định: field nào
phụ thuộc giờ (house, ASC, MC, Moon vị trí chính xác trong ngày) phải bị loại bỏ/đánh dấu
`null`/`unavailable` khi biết `BirthData.localTime` gốc là `null` — Phase 1 không tự làm việc
này vì đó là business logic (thuộc chart-calculation, không thuộc input/timezone).

## 4. Ayanamsa / sidereal zodiac — `AstronomicalProvider.getAyanamsa()` chưa có implementation nào gọi thật

Chữ ký hàm đã có (Phase 1), nhưng chưa có test nào exercise nó với dữ liệu thật (vì chưa có
provider thật). Khi Phase 4 (Vedic) bắt đầu, cần bổ sung contract test cụ thể cho ayanamsa
(tối thiểu: Lahiri, Raman, KP — 3 ayanamsa có oracle mạnh nhất theo `VALIDATION_ORACLES.md`).

## 5. House system validation ở cực (polar latitude)

`AstronomicalProvider.getHouseCusps()` hiện KHÔNG có logic từ chối toạ độ cực — vì Phase 1
chưa có implementation thật để kiểm chứng hành vi đó. Khi có `SwissEphemerisProvider` thật,
Phase 3 phải bổ sung test xác nhận `UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE` (mã lỗi đã định nghĩa
sẵn trong `ARCHITECTURE_FREEZE.md` §5 nhưng CHƯA đưa vào `errors.ts` của package này vì chưa
có code path nào dùng tới ở Phase 1 — thêm mã lỗi chưa dùng vào enum sẽ là dead code).

## 6. Ayanamsa VALUE (độ), không chỉ tên — cần trước khi Phase 4 Vedic bắt đầu nghiêm túc

`CalculationMetadata.ayanamsa` (Phase 2) chỉ lưu tên định danh (vd. `"lahiri"`), KHÔNG lưu giá
trị độ đã tính tại đúng thời điểm — audit đã ghi nhận PyJHora mặc định lệch ~1.1° so với Lahiri
tường minh (`docs/astrology-module/AUDIT/VEDIC_AUDIT.md`). Phase 2 CỐ Ý không tự thêm field mới
vào NormalizedChart cho việc này (tránh bịa field ngoài spec đã freeze) — xem
`PHASE2_NORMALIZED_CHART_IMPLEMENTATION.md` mục "Open item". Cần quyết định tường minh (thêm
field `ayanamsaValueDegrees` hay không) trước khi Phase 4 viết chart calculation Vedic thật.

## 7. Dasha/Varga KHÔNG thuộc NormalizedChart — cần data structure riêng ở Phase 4

Đã xác nhận rõ trong lúc làm Phase 2: Dasha (Vimshottari, Yogini,...) và Varga/divisional charts
là các "overlay" theo TRỤC THỜI GIAN hoặc BIẾN THỂ khác của cùng một lá số, không phải một phần
của "chart snapshot" mà `NormalizedChart` mô hình hoá — DOMAIN_MODEL.md §4 không hề nhắc tới 2
khái niệm này. Phase 4 (Vedic calculation) sẽ cần tự định nghĩa kiểu dữ liệu riêng cho Dasha
(timeline các giai đoạn) và cho Varga (rất có thể là `NormalizedChart[]`, một bản snapshot
riêng cho mỗi loại phân chia D1/D9/D10/..., tham chiếu chung `birthDataRef`) — KHÔNG nhét vào
bên trong `NormalizedChart` hiện có.

## 8. Root `package-lock.json` có drift lớn không liên quan Phase 1

Khi bắt đầu Phase 1, `package-lock.json` đã ở trạng thái "modified" (chưa commit) với ~2600
dòng thay đổi — KHÔNG liên quan tới `astrology-core` (repo có nhiều thay đổi khác đang dang dở:
AI video, chat widget, v.v., xem `git status` tại thời điểm PHASE1_COMPLETE). Commit Phase 1
KHÔNG bao gồm `package-lock.json` để tránh gộp lẫn thay đổi không liên quan — ai đó cần tự chạy
`npm install` lại và review/commit lockfile riêng khi các luồng công việc kia sẵn sàng.

## 9. `MIN_YEAR`/`MAX_YEAR` trong `validateBirthData` — lý do trong comment SAI, đã xác nhận bằng test

Phát hiện ở gate audit trước Phase 3 (`docs/astrology-module/ARCHITECTURE/PHASE3_GATE_AUDIT.md`
§2, §11#4): `validation/birthData.ts` giới hạn `year` trong `[-4712, 9999]`, với comment nói đây
là "giới hạn dưới của thuật toán Julian Day (calendar-core) — ngày trước mốc này không tính
được JDN dương." Đã chạy thực tế `isValidCalendarDate(-10000, 3, 12)` và `isValidCalendarDate
(10000, 3, 12)` trên chính `calendar-core` đang dùng — CẢ HAI đều trả `true`, tức công thức JDN
của calendar-core KHÔNG có giới hạn này. Comment sai, cận số vẫn đứng vững nhưng không có căn
cứ thuật toán như đã ghi. **CHƯA sửa** theo đúng yêu cầu ("Do NOT automatically change this").
Đề xuất (khi nào động vào file này vì lý do khác): hoặc bỏ hẳn cận số và chỉ dựa vào round-trip
check sẵn có của `isValidCalendarDate`, hoặc giữ cận nhưng sửa comment thành "giới hạn thực tế
cho phạm vi sản phẩm, không phải giới hạn thuật toán."

## 10. Giây lẻ (fractional seconds) bị `Date.UTC` cắt về số nguyên, không khớp với type/validation đã khai

Phát hiện ở gate audit (`PHASE3_GATE_AUDIT.md` §2, §11#5): `LocalTime.second` được khai kiểu và
validate cho phép số thập phân (`0-59.999...`), nhưng `resolveLocalTimeToUtc` dùng
`Date.UTC(...)` bên trong — đã xác nhận bằng chạy thực tế `Date.UTC(2024,0,1,12,30,45.678)` cho
ra `...:45.000Z`, mất hoàn toàn phần thập phân. Tác động thực tế gần như bằng 0 (giờ sinh không
bao giờ biết chính xác tới dưới giây; 1 giây chuyển động Mặt Trăng ~0.0002°). **CHƯA sửa** theo
đúng yêu cầu. Đề xuất: hoặc truyền phần dư thập phân vào tham số mili-giây thứ 7 của `Date.UTC`
để giữ đúng độ chính xác, hoặc thu hẹp `LocalTime.second` về số nguyên và sửa lại thông điệp lỗi
tương ứng.
