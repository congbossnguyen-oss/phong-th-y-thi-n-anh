# ALGORITHM SPEC — Đại Lục Nhâm Calculation Engine

Đặc tả thuật toán deterministic cho tầng 1 (Calculation Engine). Mọi quyết định ở đây bắt nguồn từ `DA_LIU_REN_ALGORITHM_AUDIT.md` — không lặp lại phần lý luận, chỉ chốt công thức cuối cùng. Các mục đánh dấu **⚠️ CHƯA ĐỦ CƠ SỞ** là những chỗ KHÔNG được code cho đến khi bổ sung nghiên cứu.

## 0. Input

```ts
interface DaLiuRenInput {
  date: string;        // YYYY-MM-DD, dương lịch
  hour: number;        // 0-23, giờ dương lịch tại timezone
  minute?: number;
  timezone: string;    // IANA, bắt buộc — không dùng mặc định ngầm
  gender?: 'male' | 'female';   // bắt buộc nếu cần Bản Mệnh/Hành Niên
  birthDate?: string;           // bắt buộc nếu cần Bản Mệnh/Hành Niên
  algorithmProfile?: 'classical-v1';  // xem DA_LIU_REN_ARCHITECTURE.md §4
}
```

Timezone bắt buộc tường minh (không suy đoán) — học theo pattern đã kiểm chứng của `taibu` (repo D, `zonedWallClockToSystemDate` + test regression cross-TZ, xem `research/report-D-taibu.md` §4). Không dùng `Date` trần chạy qua accessor local như cách repo D phải vá — dự án đã có `calendar-core/src/timezone/timezone.ts`, tái dùng trực tiếp.

## 1. Lịch pháp nền tảng (tái dùng `calendar-core`)

1. Chuyển `date + hour + minute + timezone` → thời điểm UTC chính xác (`calendar-core/timezone`).
2. Tính Can Chi Năm/Tháng/Ngày/Giờ (`calendar-core/calendar/ganzhi.ts`).
3. Tính tiết khí bao quanh thời điểm chiêm, theo mốc thời gian thực (không dùng bảng tra tĩnh) — `calendar-core/calendar/solarTerms.ts`.
4. **Bắt buộc xử lý biên năm**: khi thời điểm chiêm nằm trong khoảng Tiểu Hàn↔Lập Xuân (dễ lệch năm can chi/tiết khí), phải gộp cửa sổ tiết khí của cả năm trước/sau khi tìm mốc bao quanh — đây là lỗi đã tái diễn ở 2 repo độc lập (xem Algorithm Audit, dòng "Tiết khí"/"Nguyệt tướng"). Nếu `calendar-core` hiện tại chưa xử lý case này, phải bổ sung test + fix TRƯỚC khi dùng cho Đại Lục Nhâm. **⚠️ Chưa verify (Validation Review vòng 2)** — hạng C cho tới khi có kết quả test cụ thể, xem `DA_LIU_REN_VALIDATION_REVIEW.md` mục 3.2.
5. **⚠️ Mới phát hiện ở Validation Review vòng 2 — bắt buộc kiểm tra trước khi dùng**: vấn đề kinh điển "早子時/晚子時" (giờ Tý sớm 23:00-24:00 tính vào ngày hôm trước hay hôm sau khi tính Can Chi ngày) — repo D (`taibu`) từng có 1 bug đã fix chính xác ở điểm này cho domain Bát Tự (commit "fix: correct daliuren ke method **and bazi early zi hour**"), cùng root cause (chuyển đổi ngày dương→Can Chi ngày quanh mốc 23:00) sẽ ảnh hưởng trực tiếp NGÀY của Lục Nhâm nếu giờ chiêm rơi vào khung 23:00–01:00. **Chưa xác nhận `calendar-core` xử lý đúng quy ước nào, và quy ước nào đúng theo Lục Nhâm cũng chưa được audit riêng.** Xem test bổ sung ở `DA_LIU_REN_TEST_SPEC.md` mục 1 case #15.

## 2. 月將 Nguyệt Tướng

**Quy tắc:** Nguyệt Tướng đổi tại **trung khí** (không phải đầu tháng âm lịch, không phải "tiết"). Bảng đối ứng trung khí → chi Nguyệt Tướng:

| Trung khí vừa qua | Nguyệt Tướng (chi) | Tên cổ |
|---|---|---|
| Vũ Thủy | Hợi | 登明 |
| Xuân Phân | Tuất | 河魁 |
| Cốc Vũ | Dậu | 從魁 |
| Tiểu Mãn | Thân | 傳送 |
| Hạ Chí | Mùi | 小吉 |
| Đại Thử | Ngọ | 勝光 |
| Xử Thử | Tị | 太乙 |
| Thu Phân | Thìn | 天罡 |
| Sương Giáng | Mão | 太衝 |
| Tiểu Tuyết | Dần | 功曹 |
| Đông Chí | Sửu | 大吉 |
| Đại Hàn | Tý | 神后 |

Nguồn: report-G mục 9 (đối chiếu tên gọi cổ + trung khí kích hoạt).

**Thuật toán:** tìm trung khí gần nhất **trước hoặc bằng** thời điểm chiêm → tra bảng. Nếu thời điểm chiêm rơi đúng vào khoảnh khắc chuyển trung khí, dùng giá trị SAU khi chuyển (tức trung khí đó coi như đã "vào").

## 3. 晝夜 Ngày/Đêm

**Quy tắc đã chọn** (Algorithm Audit, dòng "Ngày/đêm"): dựa vào **CHI của giờ chiêm** (占時), không dựa giờ đồng hồ, không cần toạ độ:

- Giờ chiêm thuộc {卯, 辰, 巳, 午, 未, 申} (Mão→Thân) → **昼占 (ban ngày)**
- Giờ chiêm thuộc {酉, 戌, 亥, 子, 丑, 寅} (Dậu→Dần) → **夜占 (ban đêm)**

**⚠️ Hạ xuống hạng C ở Validation Review vòng 2**: quyết định này chỉ dựa trên 1 nguồn web ẩn danh (report-G mục 5, tự xếp 🟡) và khớp code của đúng 1/3 repo tham khảo (B) — 2 repo còn lại (A, D) dùng quy tắc KHÁC (giờ đồng hồ). Về thống kê bằng chứng thuần, đa số implementation KHÔNG ủng hộ lựa chọn này; lý do chọn B là suy luận hợp lý ("A/D nhầm với quy tắc môn khác") chứ không phải bằng chứng đã xác nhận. **Đây là ứng viên hàng đầu cần thêm 1 nguồn cổ điển độc lập trước khi khoá golden-master** — xem `DA_LIU_REN_VALIDATION_REVIEW.md` mục 2 và mục 11 (nhóm RESEARCH REQUIRED).

## 4. 貴人 Quý Nhân

**Bảng đã chọn** (9-nhóm, khớp khẩu quyết cổ — Algorithm Audit dòng "Quý nhân"):

| Can ngày | Quý Nhân — 晝占 | Quý Nhân — 夜占 |
|---|---|---|
| 甲 | 未 | 丑 |
| 戊 | 未 | 丑 |
| 庚 | 丑 | 未 |
| 乙 | 申 | 子 |
| 己 | 申 | 子 |
| 丙 | 酉 | 亥 |
| 丁 | 亥 | 酉 |
| 壬 | 卯 | 巳 |
| 癸 | 巳 | 卯 |
| 辛 | 寅 | 午 |

**⚠️ Cảnh báo bắt buộc kiểm tra:** bảng trên diễn giải từ khẩu quyết "甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，六辛逢马虎" (report-G mục 8) kết hợp chiều 晝/夜 tham chiếu từ repo A/F (bảng "đã sửa"). Vì report-A và report-F ghi nhận CHÍNH bảng này từng bị lẫn với bảng "âm dương旦暮" sai, **bảng trên phải được đối chiếu thêm 1 nguồn cổ độc lập (ảnh/scan 《六壬大全》 phần 貴人) trước khi coi là khoá cứng cho golden-master test.**

## 5. 天地盤 Thiên Bàn / Địa Bàn

1. Địa Bàn cố định: vị trí thứ *i* (0=Tý…11=Hợi) mang chi thứ *i*.
2. Thiên Bàn: đặt chi Nguyệt Tướng (§2) vào vị trí Địa Bàn của chi giờ chiêm; các vị trí còn lại dịch chuyển tương ứng theo thứ tự tự nhiên Tý→Sửu→Dần…
3. Tra "chữ Thiên Bàn tại vị trí X của Địa Bàn" = phép tra chính dùng xuyên suốt toàn bộ engine.

## 6. 四課 Tứ Khóa

Bảng寄宮 (Can ngày → cung ký thác trên Địa Bàn):

| Can | 甲 | 乙 | 丙 | 丁 | 戊 | 己 | 庚 | 辛 | 壬 | 癸 |
|---|---|---|---|---|---|---|---|---|---|---|
| Cung ký | 寅 | 辰 | 巳 | 未 | 巳 | 未 | 申 | 戌 | 亥 | 丑 |

Thuật toán (chuẩn hoá thứ tự trả về = 1→2→3→4, KHÔNG theo thứ tự ngược của repo B):

1. **Khóa 1** = chữ Thiên Bàn tại cung ký thác của Can ngày (trên Địa Bàn), ghép với Can ngày.
2. **Khóa 2** = chữ Thiên Bàn tại vị trí (Địa Bàn) của chữ trên (Khóa 1), ghép với chữ trên Khóa 1.
3. **Khóa 3** = chữ Thiên Bàn tại vị trí Địa Bàn của Chi ngày, ghép với Chi ngày.
4. **Khóa 4** = chữ Thiên Bàn tại vị trí (Địa Bàn) của chữ trên (Khóa 3), ghép với chữ trên Khóa 3.

## 7. 九宗門 → 三傳

### 7.1 Pre-check cấu trúc (chạy trước, độc lập với 7 pháp cascade)

- **伏吟**: Nguyệt Tướng gia thời khiến toàn bộ 12 vị trí Thiên Bàn trùng khít Địa Bàn (mỗi chi ở đúng bản cung). → lấy Sơ truyền là chữ khắc Can ngày (có 3 tiểu loại: 不虞卦/自任卦/自信卦, xem report-C §2.3 để tham khảo logic, không copy code).
- **返吟**: mỗi vị trí Thiên Bàn đối xung đúng 6 cung so với Địa Bàn (structural check theo từng cặp — **KHÔNG dùng heuristic đếm số lần khắc/tỷ hòa như repo B**, vì cách đó có lỗi ưu tiên toán tử đã ghi nhận). → lấy Sơ truyền theo 2 tiểu loại 無依卦/無親卦 (xem report-C).

### 7.2 Cascade (chạy khi không rơi vào 7.1), thứ tự ưu tiên cố định

1. **賊克法** — có "hạ tặc thượng" (chi dưới khắc chi trên) trong 4 khóa → ưu tiên khắc "tặc" (hạ khắc thượng) hơn khắc thường (thượng khắc hạ); nếu chỉ 1 khóa có khắc → dùng luôn.
2. **比用法** — khi ≥2 khóa cùng loại khắc (đều tặc hoặc đều khắc thường) → chọn khóa có chi trùng âm-dương với Can ngày.
3. **涉害法** — khi Tỷ Dụng không phân định được (0 hoặc ≥2 khóa cùng trùng âm dương) → đếm số lần khắc từ mỗi chi lên các chi khác trên Thiên Bàn, chi khắc nhiều nhất làm Sơ truyền; nếu vẫn hoà, ưu tiên theo quy tắc 孟仲季 (tham khảo report-C §2.3).
4. **遙克法** — khi Tứ Khóa hoàn toàn vô khắc trực tiếp → xét quan hệ khắc gián tiếp giữa Can ngày và các thần trên Địa Bàn. **⚠️ CHƯA ĐỦ CƠ SỞ**: tên chính xác 2 tiểu loại chưa xác minh được (report-G mục 2) — cần bổ sung nghiên cứu trước khi code chi tiết 2 nhánh con.
5. **昴星法** — khi vô Tặc Khắc lẫn Diêu Khắc, Tứ Khóa đủ (4 khóa không trùng lặp) → lấy chữ Thiên Bàn tại cung Dậu làm Sơ truyền.
6. **別責法** — khi Tứ Khóa thiếu đúng 1 khóa (2 khóa trùng nhau) → quy tắc lấy Sơ truyền riêng. **⚠️ CHƯA ĐỦ CƠ SỞ** cho phần diễn giải ý nghĩa (chỉ có điều kiện kích hoạt, xem Algorithm Audit).
7. **八專法** — Can Chi ngày đồng vị (cùng 1 trong 5 ngày: 甲寅/己未/丁未/庚申/癸丑), Tứ Khóa vô khắc → ngày cương (dương) lấy theo thuận, ngày nhu (âm) lấy theo nghịch.

Nếu không pháp nào áp dụng được (không nên xảy ra nếu 7 pháp đủ điều kiện bao phủ toàn bộ trường hợp còn lại) → coi là lỗi engine, trả `EngineError` thay vì throw runtime exception không kiểm soát (khác với repo B, nơi thiếu `elif` gây rủi ro `UnboundLocalError`).

### 7.3 Tam truyền — Trung truyền & Mạt truyền

Sau khi có Sơ truyền: **Trung truyền** = chữ Thiên Bàn tại vị trí (Địa Bàn) của Sơ truyền; **Mạt truyền** = chữ Thiên Bàn tại vị trí (Địa Bàn) của Trung truyền. (Không tranh cãi giữa các nguồn.)

## 8. 十二天將

Thứ tự cố định: 貴人 → 螣蛇 → 朱雀 → 六合 → 勾陳 → 青龍 → 天空 → 白虎 → 太常 → 玄武 → 太陰 → 天后.

1. Đặt 貴人 tại vị trí Thiên Bàn tương ứng chữ Quý Nhân (§4).
2. Xác định thuận/nghịch: nếu vị trí Địa Bàn của Quý Nhân thuộc {亥,子,丑,寅,卯,辰} → bố trí **thuận** (theo chiều Tý→Sửu→Dần…); nếu thuộc {巳,午,未,申,酉,戌} → bố trí **nghịch**.

   **⚠️ CHƯA ĐỦ CƠ SỞ ĐỘC LẬP**: ranh giới 亥-辰/巳-戌 này khớp giữa repo A, B, F nhưng không có nguồn cổ độc lập (ngoài code) xác nhận trực tiếp trong nghiên cứu này (Algorithm Audit, dòng "十二天將 — thuận/nghịch"). Dùng tạm cho bản nháp đầu tiên, gắn cờ cần đối chiếu 《六壬大全》 bản gốc trước khi release production.

3. Xếp lần lượt 11 vị còn lại theo đúng thứ tự cố định ở trên, theo chiều đã xác định ở bước 2.

## 9. 課體 (Khóa thể)

Danh sách tối thiểu cần phân loại (nguồn: report-A/report-C, cùng gốc thuật toán — xem lưu ý ở Algorithm Audit về "không phải nhiều nguồn độc lập"):

- 元首課 / 重審課 / 知一課 (3 biến thể của Tặc Khắc, phân biệt theo số khóa có khắc và hướng khắc)
- 涉害課, 遙克課, 昴星課, 別責課, 八專課, 伏吟課 (3 tiểu loại), 返吟課 (2 tiểu loại)
- Các cách cục phụ (có thể cùng tồn tại song song với khóa thể chính): 三奇, 六儀, 鑄印, 斲輪, 軒蓋, 官爵, 龍德, 九醜, 羅網, 連珠, 連茹…

**⚠️ CHƯA ĐỦ CƠ SỞ**: định nghĩa formula chính xác cho từng cách cục phụ chưa được audit chi tiết trong vòng nghiên cứu này (chỉ xác nhận TÊN tồn tại qua report-C/report-A). Trước khi code, cần 1 vòng audit riêng đối chiếu định nghĩa từng cách cục với 《六壬大全》.

**⚠️ Hạ xuống hạng C ở Validation Review vòng 2 — riêng cách phân biệt 元首/重審/知一**: cách đếm số khóa có khắc để phân biệt 3 tên này chỉ có **1 nguồn duy nhất** (`classifyKeTi` của repo D), và bản thân repo D đã bị đánh giá độ tin cậy tổng thể thấp (lõi thuật toán delegate cho lib ngoài chưa audit — xem `research/report-D-taibu.md`). Không có nguồn cổ điển nào đối chiếu trực tiếp cách phân biệt này. Danh sách 10 khóa thể chính theo Cửu Tông Môn (dòng trên) vẫn ở hạng B (tên khớp mục lục 《六壬大全》), nhưng RIÊNG quy tắc phân biệt 3 biến thể của Tặc Khắc cần thêm nguồn trước khi khoá cứng — xem `DA_LIU_REN_VALIDATION_REVIEW.md` mục 3.11.

## 10. 神煞

**⚠️ SỬA SAU VALIDATION REVIEW VÒNG 2 (Lỗi 2)**: bản gốc mục này liệt kê cả 3 thần sát dưới đây là "đủ cơ sở cổ điển". Đối chiếu lại `research/report-G-classical-sources.md` mục 7 — nguồn DUY NHẤT cho cả 3 — cho thấy chính report-G tự xếp **cả 3 ở mức 🟡 "hợp lý nhưng chưa kiểm chứng độc lập"**, không phải mức đủ để coi là chuẩn. Sau khi audit lại implementation, CHỈ 驛馬 có thêm bằng chứng độc lập thực sự (xem `DA_LIU_REN_VALIDATION_REVIEW.md` mục 4). Cập nhật:

| Thần sát | Công thức | Ý nghĩa (tóm tắt) | Hạng sau review |
|---|---|---|---|
| 驛馬 (chỉ phần VỊ TRÍ) | Tam hợp cục của Chi → xung → chi đối diện (寅午戌馬在申, 申子辰馬在寅, 巳酉丑馬在亥, 亥卯未馬在巳) | — (ý nghĩa để riêng, xem dưới) | **B** — có thêm bằng chứng độc lập: đúng nguyên văn công thức này xuất hiện trong 1 commit bug-fix thật của repo C (`98f47f9`), cộng repo A có hàm tính thật (dù dead code) — CÓ THỂ code phần vị trí |
| 驛馬 (phần Ý NGHĨA — "gặp Không Vong/suy/hợp trói → hữu danh vô thực") | — | Chủ di chuyển/hành động nhưng có thể "hữu danh vô thực" nếu gặp điều kiện phụ | **⚠️ Nâng lên B sau Phase 2** — 空亡 nay đã được định nghĩa/tính (xem §10b) và tìm thêm được 2 nguồn độc lập cho riêng quy tắc "Dịch Mã gặp Không Vong" (sách có tác giả 林烽: "馬空不能行" + gợi ý cổ văn 六壬大全 quyển 11 — xem `DA_LIU_REN_INTERPRETATION_EVIDENCE.md` mục 9e). **CÓ THỂ code phần "驛馬 + Không Vong → mất hiệu lực"**, nhưng phần "suy/hợp trói" vẫn C (chưa xác minh thêm). |
| 天馬 | Nguyệt sát, khởi tháng Giêng tại giờ Ngọ, thuận hành mỗi tháng 1 cung theo vòng lục dương | Cùng nhóm ý nghĩa với Dịch Mã nhưng là biến thể theo tháng | **D — LOẠI KHỎI v1.** Chỉ 1 nguồn web ẩn danh, KHÔNG có implementation nào xác nhận (repo B có hàm chết tên "月馬" — chưa rõ có cùng công thức hay không, và chưa từng chạy) |
| 河魁 / 叢魁 | Cố định: 河魁=Tuất (nam/việc chủ động), 叢魁=Dậu (nữ/việc bị động) | Dùng khi câu hỏi liên quan người dưới quyền/thuộc cấp | **D — LOẠI KHỎI v1.** Chỉ 1 nguồn web ẩn danh, KHÔNG tìm thấy trong bất kỳ repo nào của 6 repo đã audit |

**Kết luận v1: CHỈ code vị trí 驛馬** (không gồm ý nghĩa luận giải). 天馬 và 河魁/叢魁 loại bỏ hoàn toàn khỏi Algorithm Spec, không chỉ "chưa code" mà chuyển sang nhóm DO NOT IMPLEMENT (xem `DA_LIU_REN_VALIDATION_REVIEW.md` mục 11) — không đủ căn cứ dù ở mức tối thiểu.

**⚠️ Gap mới phát hiện — 空亡 (Không Vong)**: chưa từng được định nghĩa/tính toán ở bất kỳ đâu trong bộ SPEC này, dù ít nhất 1 quy tắc luận giải (驛馬 gặp Không Vong) phụ thuộc trực tiếp vào nó. Cần 1 vòng nghiên cứu riêng (công thức Tuần Không theo Can Chi ngày) trước khi bất kỳ luận giải nào dùng đến khái niệm này.

Các thần sát khác (華蓋, 桃花, 劫煞…) — **không code ở bản đầu tiên**, để dành cho vòng nghiên cứu bổ sung (xem README.md mục "Việc còn thiếu").

## 10b. 空亡 (Không Vong) — MỚI, bổ sung sau Phase 2

**⚠️ Gap của Validation Review vòng 2 nay đã có nguồn (CONFIDENCE B cho định nghĩa/cách tính, xem `DA_LIU_REN_INTERPRETATION_EVIDENCE.md` mục 9).**

**Định nghĩa**: trong 1 tuần Giáp Tý (chu kỳ 60 Can Chi chia 6 tuần 10 ngày), 10 Thiên Can không đủ phối hết 12 Địa Chi → 2 Chi dư ra mỗi tuần là "Không Vong" của tuần đó.

**Cách tính**: theo tuần Giáp của **Can Chi Ngày** (công thức toán học chu kỳ 60 Can-Chi phổ quát — Bát Tự dùng chung cơ chế này, KHÔNG PHẢI Lục Nhâm mượn từ Bát Tự, cả hai cùng kế thừa 1 sự kiện lịch pháp chung).

**⚠️ Chưa xác nhận 100%**: chưa tìm được câu phát biểu tường minh "luôn lấy Can Chi Ngày, không bao giờ Giờ/Tháng/Năm" — là suy luận từ ví dụ trong 六壬大全. Cần xác minh thêm trước khi khoá cứng liệu có dị bản nào dùng Can Chi GIỜ CHIÊM hay không.

**Áp dụng đa tầng**: (a) Không Vong trên Địa Bàn (孤辰) và trên Thiên Bàn (寡宿) tính riêng; (b) áp dụng cho từng vị trí Sơ/Trung/Mạt Truyền độc lập.

**Không ảnh hưởng đến việc CHỌN pháp trong Cửu Tông Môn** — đã xác nhận (tìm trực tiếp trong mục liệt kê 9 pháp, không thấy Không Vong là điều kiện rẽ nhánh). Không Vong CHỈ tham gia tầng luận giải (Interpretation), KHÔNG được dùng làm điều kiện rẽ nhánh ở Tầng 1.

```ts
interface KongWangInfo {
  earthPlateVoid: [DiZhi, DiZhi];   // 孤辰 — 2 chi Không Vong trên Địa Bàn
  heavenPlateVoid: [DiZhi, DiZhi];  // 寡宿 — 2 chi Không Vong trên Thiên Bàn (thường trùng giá trị nhưng vị trí khác)
  transmissionsAffected: {
    initial: boolean;
    middle: boolean;
    final: boolean;
  };
}
```

## 11. 旺相休囚死 (Vượng suy — 5 cấp, KHÔNG dùng 12 Trường Sinh)

Dùng chu kỳ Ngũ Hành tương sinh: 木→火→土→金→水→木. Với Ngũ Hành của Chi tháng (nguyệt lệnh) làm gốc, với mỗi hành X cần đánh giá:

- X = hành của tháng → **旺**
- X = hành được tháng sinh ra → **相**
- X = hành sinh ra tháng → **休**
- X = hành khắc tháng → **囚**
- X = hành bị tháng khắc → **死**

**Lưu ý luận giải riêng của Lục Nhâm** (khác Bát Tự — xem Algorithm Audit): Đế Vượng/vị trí 旺 trong ngữ cảnh Lục Nhâm thường nghiêng về luận **cực thịnh tất suy** (không đơn thuần là "tốt" như cách luận Tỷ/Kiếp trong Bát Tự). Nguyên tắc luận cụ thể để ở `DA_LIU_REN_INTERPRETATION_SPEC.md`, tại đây chỉ chốt công thức TÍNH (công thức TÍNH 5 cấp = hạng A, không tranh cãi vì là lý thuyết Ngũ Hành phổ quát). **Hạng C cho riêng nhận định "Đế Vượng = hung"** — chỉ 1 nguồn web ẩn danh (report-G mục 10), chưa kiểm chứng độc lập, xem `DA_LIU_REN_VALIDATION_REVIEW.md` mục 1 dòng 14b.

## 12. 十二長生 (Trường Sinh)

**⚠️ CHƯA ĐỦ CƠ SỞ ĐỂ KHOÁ CỨNG** — report-G mục 10 khẳng định Lục Nhâm dùng Trường Sinh theo NGŨ HÀNH, không đảo chiều âm/dương (khác hẳn công thức kiểu Bát Tự mà repo D triển khai). Bảng mốc trường sinh theo hành (dùng tạm, cần xác minh thêm 1 nguồn cổ độc lập trước khi code):

| Hành | Trường Sinh tại |
|---|---|
| 木 | 亥 |
| 火 | 寅 |
| 金 | 巳 |
| 水 / 土 | 申 |

12 giai đoạn theo thứ tự thuận từ mốc Trường Sinh: 長生→沐浴→冠帶→臨官→帝旺→衰→病→死→墓→絕→胎→養.

## 13. 本命 / 行年

**本命**: Can Chi năm sinh (công thức modulo, xem repo D — đã chọn theo Algorithm Audit): với `Y` = năm sinh dương lịch, `canIndex = (Y - 4) mod 10`, `chiIndex = (Y - 4) mod 12` (mốc Giáp Tý = năm 4 sau Công Nguyên). **CONFIDENCE A** cho công thức tính (nâng từ B — xem cập nhật ngay dưới).

**⚠️ Bổ sung sau Validation Review vòng 2, ĐÃ ĐÓNG ở Phase 11-E**: công thức modulo (D) và công
thức "date-probe" (A, `GetLi(生年,5,20,12,0,0)`) từng **CHƯA được test chéo** — Algorithm Audit vòng
1 giả định "nên ra cùng kết quả nếu cả hai đúng" nhưng đó mới là giả định, chưa kiểm chứng. **Phase
11-E (2026-09-22) đã chạy cross-check độc lập, tái hiện công thức date-probe qua
`getGanzhiYear()` của `@thien-anh/calendar-core` (boundary mặc định "lichXuan", evaluate tại 20/5
12:00 mỗi năm — đúng quy ước probe của repo A) đối chiếu công thức modulo tính trực tiếp: 78 năm
test (chu kỳ đủ 60 tổ hợp Can-Chi 1960-2019 + các mốc biên epoch/mod-10/mod-12/thế kỷ) →
**78/78 MATCH, 0 mismatch**.** Theo đúng tiêu chí đã định trước ("PHẢI chạy test này trước khi coi
本命 là hạng A"), **本命 (phần công thức tính Can Chi năm sinh) nay là CONFIDENCE A**. Phạm vi nâng
hạng CHỈ áp dụng cho chính phép tính này — KHÔNG áp dụng cho 行年 (công thức riêng, xem dưới, vẫn
giữ nguyên hạng cũ), và KHÔNG giải quyết câu hỏi riêng biệt "`ChartInput.birthDate` cụ thể (đặc
biệt sinh trong khoảng 1/1–Lập Xuân) map sang năm `Y` nào" — câu hỏi đó vẫn mở, ngoài phạm vi
Phase 11-E.

**行年**: 
- Nam: khởi 丙寅 tại tuổi 1 (tuổi mụ/hư tuế — **⚠️ cần xác định rõ cách tính tuổi**, xem ghi chú input schema), đếm THUẬN theo tuổi.
- Nữ: khởi 壬申 tại tuổi 1, đếm NGHỊCH theo tuổi.

Chỉ tính khi input có đủ `birthDate` + `gender`.

## 14. 應期 (Ứng kỳ)

**⚠️ CHƯA ĐỦ CƠ SỞ — KHÔNG CODE Ở BẢN ĐẦU TIÊN, xác nhận lại sau Phase 2.** Phase 2 đã đào sâu chuyên biệt vào chủ đề này (xem `DA_LIU_REN_INTERPRETATION_EVIDENCE.md` mục 11, `research/phase2/report-6-benming-xingnian-ungky.md`) và tìm được 4/9 phương pháp đạt CONFIDENCE B (五行/mùa theo vòng Trường Sinh — 畢法賦; 入墓 = trì hoãn — 畢法賦; Không Vong = cản trở tạm/ứng lúc điền thực-xuất tuần — 畢法賦+心印賦; Địa Chi mang nghĩa tháng cố định — nền tảng lịch pháp). Tuy nhiên **VẪN KHÔNG ĐỦ ĐỒNG BỘ để tạo module Ứng Kỳ hoàn chỉnh** — 5 phương pháp còn lại chỉ CONFIDENCE C/D, và quan trọng nhất: **phương pháp phổ biến nhất trên web ("tĩnh chờ xung, động chờ hợp") đã được XÁC NHẬN LÀ SAI HỆ THỐNG** — gốc từ 《卜筮正宗》 (hệ Lục Hào/Bốc Dịch), bị web Lục Nhâm hiện đại mượn nhầm, KHÔNG được dùng. Giữ nguyên quyết định DO NOT IMPLEMENT cho Ứng Kỳ ở mức tổng thể.

## Tóm tắt trạng thái sẵn sàng theo thành phần

**⚠️ Bảng này đã được hiệu chỉnh lại sau Validation Review vòng 2 — xem `DA_LIU_REN_VALIDATION_REVIEW.md` để biết lý do từng thay đổi. Thang đo dùng chung với Validation Review: A/B (đủ cơ sở, có thể code) — C/D (chưa đủ, không code).**

| Thành phần | Hạng | Trạng thái |
|---|---|---|
| Thiên/Địa Bàn, Tứ Khóa, Tam truyền (cơ chế lặp), 5 cấp Ngũ Hành sinh/khắc/tỷ hòa | A | ✅ Đủ cơ sở để code |
| Can Chi (qua `calendar-core`) | B | ✅ Đủ cơ sở, **với điều kiện** thêm test 早子/晚子時 trước |
| Tiết khí | C | ⚠️ Chưa verify `calendar-core` xử lý đúng biên năm — không code cho tới khi có kết quả test |
| Nguyệt Tướng (bảng 12 chi) | B | ✅ Đủ cơ sở để code, có tranh luận học thuật CHƯA đọc được nội dung — theo dõi thêm |
| Ngày/đêm (chi giờ chiêm) | C | ⚠️ Đa số implementation tham khảo KHÔNG khớp lựa chọn — cần thêm nguồn trước khi khoá golden-master |
| Quý Nhân — cặp vị trí theo Can | B | ✅ Đủ cơ sở để code |
| Quý Nhân — chiều 晝/夜 gán cho Can | C | ⚠️ Chỉ 1 dòng nguồn — cần thêm 1 nguồn độc lập trước production |
| 九宗門 (cấu trúc cascade + độ phủ 9 pháp) | B | ✅ Đủ cơ sở — nâng hạng sau phát hiện phần dispatch của repo C độc lập thật với A/F |
| 九宗門 — Diêu Khắc (2 tiểu loại) | D | ⚠️ Chưa đủ cơ sở |
| 十二天將 — thứ tự + tên | A | ✅ Đủ cơ sở |
| 十二天將 — ranh giới thuận/nghịch | B | ✅ Đủ cơ sở tạm thời, nên xác minh thêm trước production |
| 課體 chính (10 loại theo Cửu Tông Môn) | B | ✅ Đủ cơ sở |
| 課體 — phân biệt 元首/重審/知一 | C | ⚠️ Chỉ 1 nguồn (repo D, độ tin cậy tổng thể thấp) — cần thêm nguồn |
| 課體 phụ (cách cục: 鑄印/軒蓋/連珠…) | D | ⚠️ Chưa đủ cơ sở |
| Thần sát — 驛馬 (vị trí) | B | ✅ Đủ cơ sở để code (chỉ vị trí, không gồm ý nghĩa) |
| Thần sát — 驛馬 gặp Không Vong (mất hiệu lực) | B (nâng từ C sau Phase 2) | ✅ Có thể code — nay 空亡 đã speced (§10b) + 2 nguồn độc lập |
| 空亡 (định nghĩa + cách tính + vị trí Tam Truyền) | B (định nghĩa/tính) / A (ý nghĩa theo vị trí Tam Truyền) | ✅ Đủ cơ sở để code — MỚI, xem §10b |
| Thần sát — 天馬, 河魁/叢魁 | D | ⚠️ **Loại khỏi v1 hoàn toàn** — hạ từ "✅" (lỗi vòng 1) xuống loại bỏ, xem Validation Review mục 4 |
| Thần sát khác (空亡, 華蓋, 桃花...) | D | ⚠️ Chưa đủ cơ sở, 空亡 cần speced riêng trước khi dùng bất kỳ luận giải nào phụ thuộc nó |
| Vượng suy — công thức TÍNH (5 cấp) | A | ✅ Đủ cơ sở |
| Vượng suy — ý nghĩa "Đế Vượng = hung" | C | ⚠️ Chỉ 1 nguồn — dùng thận trọng, không khoá cứng |
| Vượng suy — công thức điều chỉnh lực định lượng | — | **Đã gỡ khỏi SPEC** (nguồn duy nhất là repo E, đã bị loại — xem Validation Review Lỗi 1) |
| 十二長生 | D | ⚠️ Chưa đủ cơ sở (công thức D bị xác nhận sai theo report-G) |
| 本命 | **A** (nâng từ B — Phase 11-E, 78/78 MATCH, xem §13) | ✅ Đủ cơ sở, cross-check đã chạy |
| 行年 — công thức | B (không đổi — ngoài phạm vi Phase 11-E) | ✅ Đủ cơ sở |
| 行年 — quy ước tính tuổi | D | ⚠️ Chưa rõ (mụ/hư tuế hay tuổi thực) |
| Ứng kỳ | D | ⚠️ Chưa đủ cơ sở — không code bản đầu |
