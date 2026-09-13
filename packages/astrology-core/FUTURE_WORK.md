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

## 11. Phase 3A — house cusps/Ascendant/Midheaven/Ayanamsa CHƯA implement ở `SwissEphemerisProvider`

`getHouseCusps`/`getAscendant`/`getMidheaven`/`getAyanamsa` đều ném `SwissEphemerisPhase3AScopeError`
— nằm ngoài phạm vi CALCULATION SCOPE của Phase 3A (chỉ vị trí hành tinh/node thô). Khi Phase 3B
(Western house/angle calculation) hoặc Phase 4 (Vedic/ayanamsa) bắt đầu: `sweph` đã có sẵn
`houses_ex`/`houses_ex2` và `get_ayanamsa_ex_ut` — chỉ cần thay 4 stub này bằng lệnh gọi thật,
KHÔNG cần đổi interface `AstronomicalProvider` (đã xác nhận đủ dùng ở Phase 3A).

## 12. True Lunar Node — chưa có oracle độc lập xác nhận

Mean Node cross-check được với công thức Meeus (`docs/astrology-module/ARCHITECTURE/PHASE3A_ASTRONOMICAL_CORE.md`
"Golden fixture provenance"), nhưng True Node (osculating, dao động quanh mean node) chưa tìm
được nguồn oracle độc lập ít công sức để xác nhận trong phạm vi Phase 3A — chỉ kiểm tra được tính
NHẤT QUÁN NỘI BỘ (north/south lệch đúng 180°, dao động quanh mean node trong biên độ vật lý hợp
lý ~1.5-2°). Đây là `VALIDATION GAP` theo đúng định nghĩa của `VALIDATION_ORACLES.md` — ghi nhận
tường minh, KHÔNG coi "có vẻ đúng" là đủ. Nếu cần độ tin cậy cao hơn cho True Node trước khi dùng
trong tính toán nghiệp vụ thật (Phase 3B+), cân nhắc chạy `swetest` (Astrodienst, cần build từ
nguồn C) hoặc so với một ephemeris độc lập khác có track true node.

## 13. `sweph` là dependency AGPL-3.0-or-later — quyết định license CHỈ áp dụng cho phạm vi hiện tại

Xem `docs/astrology-module/ARCHITECTURE/LICENSE_BOUNDARY.md` "Phase 3A interim decision". Quyết
định dùng AGPL (thay vì mua Professional License từ Astrodienst) được đưa ra DỰA TRÊN phạm vi
hiện tại của dự án (nghiên cứu cá nhân, không thương mại, không phân phối). Nếu phạm vi dự án
thay đổi (thương mại hoá, SaaS, dịch vụ công khai, phân phối cho người ngoài chủ sở hữu/gia
đình), quyết định này BẮT BUỘC phải xem lại TRƯỚC KHI thay đổi đó triển khai — KHÔNG được coi
quyết định Phase 3A là đã "giải quyết xong" vấn đề license cho mọi kịch bản tương lai.

## 14. Phase 3B-1 — `NormalizedChart.houses[]` (sign + ruler) và `planets[].sign/house` CHƯA điền

Task brief Phase 3B-1 chỉ cho phép điền `houseSystem`/`houseCusps`/`angles` — KHÔNG điền
`houses[]` (cần bảng cai quản/ruler, một quyết định NỘI DUNG Tây phương riêng chưa được duyệt)
hay gán `sign`/`house` cho từng hành tinh trong `planets[]` (cần cả house cusps VÀ vị trí hành
tinh cùng lúc, và việc "hành tinh nằm nhà nào" là phép tính CHƯA được yêu cầu ở phase này). Phase
sau (có thể gọi Phase 3B-2 hoặc 3C) cần: (a) quyết định bảng cai quản cổ điển hay hiện đại (vd.
Mars hay Pluto cai quản Scorpio) — đây LÀ một quyết định kiến trúc/nội dung cần duyệt tường minh,
tương tự cách house system mặc định đã cần duyệt ở Phase 3B-1; (b) viết hàm gán house cho từng
hành tinh dựa trên house cusps đã có.

## 15. `AstronomicalProvider` chưa có "error contract" chung cho mọi implementation

`western/houses.ts::mapHouseProviderError()` phải biết tới các class lỗi CỤ THỂ của
`SwissEphemerisProvider` (`SwissEphemerisHouseSystemUndefinedAtLatitudeError`,
`SwissEphemerisUnsupportedHouseSystemError`, ...) để dịch sang `AstrologyCoreError` — vì
interface `AstronomicalProvider` (Phase 1) không định nghĩa MỘT hình dạng lỗi chung mà mọi
implementation phải tuân theo. Nếu tương lai có provider thứ hai (khác Swiss Ephemeris), tầng
Chart Calculation cần mở rộng thêm nhánh nhận diện lỗi của provider đó — không sai, nhưng là một
hạn chế có thật, nên cân nhắc một ADR mới ("Provider Error Contract") nếu số lượng provider tăng.

## 16. `getAscendant`/`getMidheaven` ném lỗi vĩ độ cực GIỐNG `getHouseCusps` dù về lý thuyết ASC/MC độc lập với cách chia house trung gian

`SwissEphemerisProvider.computeHouses()` coi CẢ 3 method (`getHouseCusps`/`getAscendant`/
`getMidheaven`) đều thất bại khi Swiss Ephemeris báo "within polar circle, switched to Porphyry",
dù về mặt thiên văn Ascendant/Midheaven là điểm hình học độc lập với cách CHIA house trung gian
(house 1 = ASC, house 10 = MC ở MỌI hệ quadrant-based, kể cả Porphyry mà Swiss Ephemeris tự động
chuyển sang) — quyết định này CHỦ Ý bảo thủ (nhất quán, tránh khẳng định một chi tiết hành vi
native chưa xác minh sâu qua mã nguồn C của Swiss Ephemeris trong phạm vi phase này). Nếu tương
lai cần ASC/MC riêng tại vĩ độ cực mà không cần house cusps, cân nhắc xác minh giả thuyết này (đọc
`swehouse.c` hoặc hỏi trực tiếp Astrodienst) rồi nới lỏng có chủ đích.

## 17. Chỉ 12/25 house system của Swiss Ephemeris có ánh xạ — mở rộng được nhưng chưa làm hết

`KNOWN_HOUSE_SYSTEM_TO_SWISS_EPH_CODE` (`SwissEphemerisProvider.ts`) chỉ ánh xạ 12 hệ phổ biến
nhất (Placidus, Koch, Equal, Whole Sign, Porphyry, Campanus, Regiomontanus, Topocentric, Morinus,
Alcabitius, Krusinski, Vehlow). Swiss Ephemeris hỗ trợ 25 hệ (xác nhận qua `sweph.house_name()`
cho từng mã chữ cái). Thêm hệ mới chỉ cần 1 dòng trong bảng ánh xạ — KHÔNG đổi kiến trúc. "G"
(Gauquelin sectors, 36 "cusp" thay vì 12) CỐ Ý không hỗ trợ vì không tương thích shape `HouseCusps`
của interface (đúng 12 phần tử).

## 18. House cusps trung gian (2,3,5,6,8,9,11,12 của Placidus) chưa có oracle số học độc lập

Golden test Phase 3B-1 xác nhận ĐỘC LẬP: Ascendant, Midheaven (qua công thức GMST/obliquity/RAMC
chuẩn — xem `PHASE3B1_HOUSES_ANGLES.md`), và house 1/4/7/10 (bằng ASC/MC/DESC/IC theo ĐỊNH NGHĨA
hình học). 8 cusp trung gian còn lại của Placidus (2,3,5,6,8,9,11,12) dùng phép chia CUNG GIỜ lặp
(không có công thức đóng đơn giản) — Phase 3B-1 CHỈ xác nhận được các bất biến CẤU TRÚC của
chúng (đơn điệu quanh vòng tròn, không trùng lặp, trong [0,360)), KHÔNG có oracle số học độc lập
xác nhận GIÁ TRỊ chính xác. Đây là `VALIDATION GAP` theo đúng định nghĩa `VALIDATION_ORACLES.md`
— ghi nhận tường minh, giống cách True Node được ghi nhận ở mục 12. Nếu cần độ tin cậy cao hơn,
cân nhắc build `swetest` từ nguồn C (Astrodienst) hoặc đối chiếu với công cụ tính lá số của
astro.com cho vài trường hợp cụ thể.

## 19. Phase 3B-2 — House assignment dùng longitude thuần, KHÔNG dùng `sweph.house_pos()` "visually accurate"

`western/housePlacement.ts::assignHouseNumber()` dùng phương pháp CUNG longitude chuẩn (một
điểm thuộc nhà N nếu longitude nằm trong [cusp[N], cusp[N+1])) — đây là phương pháp phổ biến
nhất trong phần mềm chiêm tinh Tây phương, nhưng Swiss Ephemeris có `house_pos(armc, geolat, eps,
hsys, xpin)` cho kết quả "visually accurate" hơn (có tính vĩ độ hoàng đạo/xích vĩ của điểm, quan
trọng hơn với hành tinh có vĩ độ hoàng đạo lớn, vd. Pluto ~17° ở một số vị trí). Phase 3B-2 CHỐI
Ý chọn phương pháp đơn giản hơn vì task brief chỉ yêu cầu "longitude + house cusps" làm đầu vào,
KHÔNG yêu cầu thêm phụ thuộc (ARMC/obliquity/xích vĩ). Nếu tương lai cần độ chính xác cao hơn cho
hành tinh có vĩ độ hoàng đạo lớn, cân nhắc thêm `getHousePosition()` vào `AstronomicalProvider`
(một quyết định kiến trúc/interface CẦN duyệt tường minh, tương tự house system default).

## 20. `NormalizedAngle` không có field `sign` — ASC/MC/DESC/IC sign tính "on demand", không lưu

`DOMAIN_MODEL.md` §4's `Angle { type, longitude }` không có field sign — đúng nguyên tắc "derived,
not independently stored" đã áp dụng cho `PlanetPosition.sign`. Phase 3B-2 KHÔNG thêm field mới
vào `NormalizedAngle` (tránh sửa contract không được yêu cầu) — dùng chung `signOfLongitude()`
(export public từ `western/zodiac.ts`) để tính sign của bất kỳ góc nào từ `longitude` đã có sẵn.
Nếu một phase sau cần LƯU sign của góc (vd. để tránh tính lại nhiều lần ở tầng hiển thị), đó là
một thay đổi contract cần duyệt tường minh, không tự thêm ở đây.

## 21. DMS (độ-phút-giây) chỉ là tiện ích hiển thị — contract KHÔNG có field DMS

`precision.ts::toDegreesMinutesSeconds()` được thêm ở Phase 3B-2 theo đúng điều kiện "if the
existing contract supports it" trong task brief — kiểm tra thực tế xác nhận contract KHÔNG hỗ
trợ (không field nào trong `NormalizedPlanetPosition`/`NormalizedAngle`/`NormalizedHouseCusp`
lưu DMS, chỉ có độ thập phân). Hàm được thêm như MỘT TIỆN ÍCH ĐỘC LẬP (không gắn vào bất kỳ field
nào của `NormalizedChart`) để dùng khi cần hiển thị — không phải một phần contract.

## 22. Phát hiện: lỗi dữ liệu có trước trong fixture Phase 2 (`fullWesternChart()`)

Khi viết test cross-check cho `western/zodiac.ts` (Phase 3B-2), phát hiện Saturn trong
`chart/__tests__/fixtures.ts::fullWesternChart()` có `sign: "sagittarius"` nhưng
`longitude: 238.1087`/`signDegree: 28.1087` của CHÍNH fixture đó lại xác nhận "scorpio" (210°-240°,
238.1087-210=28.1087) — một lỗi nhập liệu có từ Phase 2, KHÔNG liên quan tới Phase 3B-2. `house: 7`
của Saturn vẫn ĐÚNG (house không phụ thuộc sign). Đã báo cáo qua `spawn_task` (task riêng, không
sửa trong phạm vi Phase 3B-2) thay vì tự sửa file không thuộc phase này.
