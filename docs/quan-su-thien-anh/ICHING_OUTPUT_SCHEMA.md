# ICHING OUTPUT SCHEMA — Quân Sư Thiên Anh (Phase 3)

Tài liệu này mô tả **chính xác cấu trúc kết quả quẻ** mà engine lập quẻ có sẵn (`src/lib/luc-hao.ts`) trả về. Đây là **nguồn sự thật duy nhất** để Interpretation Engine (LLM) đọc.

> ⚠️ **Nguyên tắc:** LLM **không tự tính quẻ**. Mọi con số (Can Chi, Lục Thân, Thế/Ứng, Tuần Không, vượng suy...) đều do engine tính. LLM chỉ đọc cấu trúc dưới đây và luận giải. Nếu engine chưa tính trường nào (xem mục 5 — các khoảng trống), LLM **không được tự bịa**, mà phải nói rõ "chưa xét" hoặc trường đó được thêm vào engine ở phase sau.

## 1. Engine đã audit — không viết lại

- **File:** `src/lib/luc-hao.ts` (917 dòng). Đã đối chiếu khớp 100% với 2 ví dụ tham chiếu độc lập (Học Viện Phong Thủy Minh Việt) + Wikipedia (Nạp Giáp Stem-Trigram). Có 5 bộ golden test ở `tests/` (fan-yin, fu-yin, xun-kong, truong-sinh, nguyet-kien-nhat-than).
- **Hàm lập quẻ cho Quân Sư (Lục Hào):**
  - `lucHaoCastFromTosses(rawLines: CoinLineValue[], input: CastInput)` — từ 6 lần gieo của người dùng (mỗi lần 3 đồng xu → 6/7/8/9). Hào động tự suy (6=Lão Âm, 9=Lão Dương). **Đây là hàm chính Quân Sư dùng.**
  - `lucHaoCastRandom(input, rng?)` — app gieo giúp (khi người dùng chọn "gieo giúp tôi").
  - Cả hai trả về `FullCastResult` (cùng cấu trúc).
- **Lớp nối Quân Sư:** `src/lib/quan-su/divination.ts` (`castLucHaoFromTosses`, `castLucHaoRandom`, `buildInterpretationPayload`) — chỉ gọi engine, không tính lại. Có test `tests/quan-su-divination.test.ts` (10 test, đã pass).

## 2. `CastInput` — thời điểm gieo quẻ

```typescript
interface CastInput { day: number; month: number; year: number; hour: number; minute?: number; }
```
Là thời điểm **hiện tại** khi người dùng gieo quẻ. Quyết định Can Chi Ngày/Tháng/Năm/Giờ, Nguyệt Lệnh (nguyệt kiến), Nhật Thần, Tuần Không, Tiết Khí — tất cả engine tự tính từ đây (tái dùng `tinhBatTu` + `solar-term` + `lunar-calendar`).

## 3. `FullCastResult` — cấu trúc kết quả đầy đủ (AI đọc trường này)

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `chinh` | `QueDayDu` | **Quẻ Chủ** (quẻ chính) — xem mục 4 |
| `bien` | `QueDayDu \| null` | **Quẻ Biến** — `null` nếu không có hào động |
| `hoQue` | `QueHoInfo` | **Quẻ Hỗ** (tham khảo diễn biến giữa chính↔biến) |
| `dongPositions` | `number[]` | **Hào Động** — vị trí 1-6 (rỗng nếu không có) |
| `tuanKhong` | `string` | Tuần Không của ngày gieo (vd `"Tuất - Hợi"`) |
| `dayCan`/`dayChi` | `string` | Can/Chi **Ngày** (Nhật Thần) |
| `monthCan`/`monthChi` | `string` | Can/Chi **Tháng** (Nguyệt Kiến/Nguyệt Lệnh) |
| `yearCan`/`yearChi` | `string` | Can/Chi **Năm** |
| `hourCan`/`hourChi` | `string` | Can/Chi **Giờ** |
| `tietKhi` | `string` | Tiết khí thực tế lúc gieo |
| `canChiText` | `string` | "giờ … ngày … tháng … năm …" (đọc cho người) |
| `nhatThan` | `string` | "Chi-NgũHành" của Ngày (vd `"Tuất-Thổ"`) |
| `nguyetLenh` | `string` | "Chi-NgũHành" của Tháng (vd `"Mùi-Thổ"`) |
| `amLichText` | `string` | Ngày giờ âm lịch |
| `methodNote` | `string` | Ghi chú phương pháp lập quẻ |
| `fanYin` | `FanYinResult` | **Quái Phản Ngâm** giữa quẻ chính↔biến |
| `fuYin` | `FuYinResult` | **Quái Phục Ngâm** giữa quẻ chính↔biến |

## 4. `QueDayDu` — một quẻ (chính hoặc biến)

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `lines` | `[LineVal×6]` | 6 hào (0=Âm, 1=Dương), từ dưới lên |
| `upper`/`lower` | `TrigramDef` | Quái thượng / quái hạ (tên, ký hiệu, ngũ hành) |
| `name` | `string` | Tên quẻ (vd `"Thủy Địa Tỷ"`) |
| `cungTrigram` | `TrigramDef` | Cung dùng để luận (quẻ biến mượn cung quẻ chủ) |
| `cungLabel` | `string` | Cung + phân loại đời quái / Lục Hợp / Lục Xung (vd `"Khôn (Quy Hồn)"`, `"Khôn (Lục Xung)"`) |
| `generationIndex` | `number` | Đời quái (0=Bát Thuần … 7=Quy Hồn) |
| `theHao`/`ungHao` | `number` | Vị trí hào **Thế** / hào **Ứng** (1-6) |
| `hao` | `HaoInfo[]` | 6 hào chi tiết — xem mục 4.1. index 0 = hào 1 (dưới) |
| `changedPalace?` | object | (chỉ quẻ biến) cung/Thế/Ứng RIÊNG nếu quẻ biến tự đứng — chỉ để đối chiếu, KHÔNG dùng luận |

### 4.1 `HaoInfo` — từng hào (dữ liệu giàu nhất, AI dựa vào đây)

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `hao` | `1-6` | Vị trí hào (dưới lên) |
| `value` | `0\|1` | Âm / Dương |
| `isDong` | `boolean` | Hào động hay không |
| `canIndex`/`chiIndex` | `number` | Nạp Giáp Can/Chi của hào (index vào `CAN`/`CHI`) |
| `nguHanh` | `NguHanh` | Ngũ hành của hào (theo Chi) |
| `lucThan` | `LucThan` | **Lục Thân**: Huynh Đệ / Phụ Mẫu / Tử Tôn / Quan Quỷ / Thê Tài |
| `lucThu` | `string` | **Lục Thú**: Thanh Long / Chu Tước / Câu Trần / Đằng Xà / Bạch Hổ / Huyền Vũ |
| `theUng` | `"Thế"\|"Ứng"\|null` | Hào Thế / Ứng |
| `phucThan` | object \| null | **Phục Thần** (Lục Thân ẩn) nếu loại đó không lộ trên quẻ — kèm Can/Chi mượn |
| `vuongSuy` | `VuongSuy` | **Vượng/Tướng/Hưu/Tù/Tử** theo Nguyệt Lệnh |
| `growthDay` | `TruongSinhStage` | Trường Sinh của hào tại **Chi Ngày** |
| `growthMonth` | `TruongSinhStage` | Trường Sinh của hào tại **Chi Tháng** |
| `relations` | `HaoRelation[]` | **Quan hệ hào ↔ Nhật Thần / Nguyệt Kiến** — xem mục 4.2 |
| `xunKong` | `boolean` | Hào có rơi vào **Tuần Không** của ngày gieo không |

### 4.2 `HaoRelation` — quan hệ hào với Nhật/Nguyệt

```typescript
type HaoRelationType =
  | "Sinh" | "Khắc" | "Hợp" | "Xung" | "Hại"
  | "Nhật Phá" | "Nguyệt Phá" | "Ám Động"
  | "Lâm Nhật" | "Lâm Nguyệt";
interface HaoRelation { type: HaoRelationType; source: "DAY"|"MONTH"; target: "HAO"; }
```
1 hào có thể mang nhiều quan hệ cùng lúc. Engine phân biệt đúng **Nhật Phá** (hào hưu tù bị Nhật xung) vs **Ám Động** (hào vượng tướng bị Nhật xung) — theo nguồn.

## 5. ⚠️ Engine CHƯA tính (khoảng trống — AI KHÔNG được tự bịa)

Đối chiếu với `LUAN_QUE_LUC_HAO_SPEC.md` "Lớp 2 — tính toán cơ học", engine hiện **đã có**: ngũ hành, Không Vong, vượng suy Nguyệt Lệnh, quan hệ Nhật/Nguyệt (Sinh/Khắc/Hợp/Xung/Hại/Phá/Ám Động), Trường Sinh, Lục Thần/Lục Thú, Phục Thần, quẻ biến/hỗ, Phản/Phục Ngâm.

**Chưa có (cần thêm hàm deterministic vào engine ở phase sau, KHÔNG để LLM tự suy):**

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| **Tam Hợp cục / Tam Hội** | Chưa | `HaoRelationSource` có `YAO`/`CHANGED_YAO` nhưng "chưa dùng ở C1". Cần bổ sung. |
| **Tam Hình (Hình)** | Chưa | `HaoRelationType` chưa có "Hình". |
| **Nhập Mộ** | Chưa (có TODO) | `growthDay/growthMonth === "Mộ"` có dữ liệu nhưng CHƯA surface thành relation — engine ghi rõ cần audit riêng Chương IX trước khi làm. |
| **Tiến/Thoái Thần** | Chưa | Chưa tính cho hào động biến sang Chi tiến/lùi. |
| **Dụng Thần (chọn theo việc)** | Không thuộc engine | Là việc của tầng luận giải (Lớp 3). Quân Sư đưa `dung_than_hint` theo nhóm (xem `divination.ts` + INTERPRETATION_ENGINE.md), LLM chốt cuối. |
| **Ứng Kỳ** | Không thuộc engine | Lớp 6 — LLM luận từ trạng thái Dụng Thần (spec §6). |

**Quy tắc khi thiếu:** nếu 1 câu hỏi cần yếu tố chưa có (vd Tam Hợp cục quan trọng cho câu này), LLM nói rõ "yếu tố X chưa được hệ thống tính, đây là giới hạn hiện tại" — tuyệt đối không tự tính rồi trình bày như thật. Ưu tiên bổ sung các hàm này vào `luc-hao.ts` (deterministic) ở phase kỹ thuật sau.

## 6. Payload cuối cùng AI nhận (`QuanSuInterpretationPayload`)

Đóng gói ở `src/lib/quan-su/divination.ts` — thuần gom dữ liệu, không luận:

```typescript
interface QuanSuInterpretationPayload {
  question: { question_id; category; title; output_type; safety_level; dung_than_hint };
  cast: FullCastResult;              // nguyên văn engine — nguồn sự thật
  van_trinh: VanTrinhTimeline | null; // sơ đồ Bát Tự/Tử Vi (adapter điền, phase sau)
  meta: { castAtISO; method };
}
```

LLM đọc payload này → sinh KẾT QUẢ QUÂN SƯ + luận giải chi tiết (xem `INTERPRETATION_ENGINE.md`).
