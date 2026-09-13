# FUTURE WORK — discovered during Phase 1, deferred (per Scope Guard)

Không implement gì dưới đây trong Phase 1. Ghi lại để Phase 2+ không phải khám phá lại.

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

## 6. Root `package-lock.json` có drift lớn không liên quan Phase 1

Khi bắt đầu Phase 1, `package-lock.json` đã ở trạng thái "modified" (chưa commit) với ~2600
dòng thay đổi — KHÔNG liên quan tới `astrology-core` (repo có nhiều thay đổi khác đang dang dở:
AI video, chat widget, v.v., xem `git status` tại thời điểm PHASE1_COMPLETE). Commit Phase 1
KHÔNG bao gồm `package-lock.json` để tránh gộp lẫn thay đổi không liên quan — ai đó cần tự chạy
`npm install` lại và review/commit lockfile riêng khi các luồng công việc kia sẵn sàng.
