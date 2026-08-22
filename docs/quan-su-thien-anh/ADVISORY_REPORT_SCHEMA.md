# ADVISORY REPORT SCHEMA — Quân Sư Thiên Anh

Cấu trúc **Báo Cáo Cố Vấn** — kết quả cuối cùng Quân Sư trả cho người dùng, từ quẻ Kinh Dịch + vận trình. Engine: `src/lib/quan-su/advisory-engine.ts` (`buildAdvisoryReport(payload)`).

## 1. Ranh giới cứng (không thương lượng)

> **AI chỉ diễn giải dữ liệu do Engine cung cấp.** Engine (`advisory-engine.ts`) KHÔNG tự tính bất kỳ thuật toán huyền học nào — quẻ, hào, đại vận, dụng thần, sao đều do engine khác đã tính (`luc-hao.ts`, `current-luck.ts`). Advisory Engine chỉ ĐỌC các tín hiệu đó rồi chấm điểm + suy verdict theo **quy tắc minh bạch**.

- **Điểm số (Mức độ thuận 0-100) là deterministic** — tính bằng bảng cộng/trừ rõ ràng (mục 4), KHÔNG tùy tiện, KHÔNG do AI bịa.
- **Verdict (Kết luận) là deterministic** — suy từ điểm + điều kiện (mục 5).
- **Văn xuôi** (xu hướng, khuyên, luận chi tiết) HIỆN là bản demo template. Khi có LLM + Phần E của Thầy, LLM **chỉ viết lại thành lời** từ các dữ kiện engine đã đưa — không tính thêm gì.

## 2. Đầu vào

`QuanSuInterpretationPayload` (từ `divination.ts`): `question` (+ `dung_than_hint`), `cast` (`FullCastResult` — quẻ), `van_trinh` (`LuckContext | null`).

## 3. Cấu trúc `AdvisoryReport` (8 phần)

| # | Phần | Trường | Loại |
|---|---|---|---|
| 1 | **KẾT LUẬN** | `ketLuan` (`Verdict`) + `ketLuanLabel` | Deterministic |
| 2 | **MỨC ĐỘ THUẬN** | `mucDoThuan` (0-100) + `bangChamDiem` (`ScoreItem[]`) | Deterministic |
| 3 | **XU HƯỚNG** | `xuHuong` (đoạn ngắn) | Demo prose → LLM |
| 4 | **ĐIỂM THUẬN** | `diemThuan` (đúng 3) | Rút từ bảng điểm |
| 5 | **ĐIỂM CẦN LƯU Ý** | `diemLuuY` (đúng 3) | Rút từ bảng điểm |
| 6 | **VẬN TRÌNH** | `vanTrinh` (`VanTrinhTomTat \| null`) | Deterministic passthrough |
| 7 | **QUÂN SƯ KHUYÊN** | `quanSuKhuyen` (đúng 3 hành động) | Demo prose → LLM |
| 8 | **LUẬN GIẢI CHI TIẾT** | `luanGiaiChiTiet` (chỉ hiện khi bấm) | Demo prose → LLM |

`Verdict` = một trong: `NEN` (NÊN) · `KHONG_NEN` (KHÔNG NÊN) · `NEN_CHO` (NÊN CHỜ) · `CO_DIEU_KIEN` (CÓ THỂ LÀM NHƯNG CÓ ĐIỀU KIỆN) · `CHUA_DU_DU_LIEU` (CHƯA ĐỦ DỮ LIỆU).

```typescript
interface ScoreItem { factor: string; delta: number; reason: string; loai: "thuan"|"luu_y"|"trung_tinh"; }
interface VanTrinhTomTat {
  daiVan: string;      // "Mậu Ngọ (nghịch)"
  namHienTai: string;  // "2026 Bính Ngọ (nghịch)"
  chiBao: { label: string; score: number; higherIsBetter: boolean }[]; // 2-4 chỉ báo (4 thanh)
}
```
Cờ chất lượng: `coNhap: true` (trọng số bản nháp), `proseLaDemo: true` (văn xuôi là demo).

## 4. Quy tắc chấm điểm 0-100 (MINH BẠCH — bản nháp, Thầy calibrate)

Bắt đầu **50** (trung tính). Đọc **hào Dụng Thần** (xác định từ `dung_than_hint`; lưỡng hiện chọn theo LUAN_QUE_LUC_HAO_SPEC §4.2; nếu phục tàng/không hiện xử lý riêng) rồi cộng/trừ:

| Yếu tố | Điểm |
|---|---|
| Vượng suy hào chủ | Vượng +12 · Tướng +6 · Hưu −2 · Tù −8 · Tử −12 |
| Không Vong | −12 *(trở ngại thời điểm)* |
| Được Nhật/Nguyệt sinh | +7 mỗi nguồn |
| Bị Nhật/Nguyệt khắc | −7 mỗi nguồn |
| Nguyệt Phá | −14 *(thời điểm)* · Nhật Phá −10 *(thời điểm)* |
| Ám Động | +5 · Đương lệnh (Lâm Nhật/Nguyệt) +6 |
| Hợp +3 · Xung −3 · Hại −3 | |
| Phục tàng (Dụng Thần ẩn) | −10 *(thời điểm)* |
| Thế-Ứng | Ứng sinh Thế +5 · Thế khắc Ứng +3 · Ứng khắc Thế −6 · Thế sinh Ứng −2 |
| Vận trình (nếu có) | Đại vận: dải × 5 (±10) · Lưu niên: dải × 2.5 (±5) |

Kẹp về [0,100]. Mọi điều chỉnh lưu vào `bangChamDiem` (minh bạch — người dùng/Thầy xem được điểm từ đâu).

## 5. Quy tắc suy Kết Luận

1. Dụng Thần **không hiện** (không trên quẻ, không phục tàng) → **CHƯA ĐỦ DỮ LIỆU** (điểm ép ≤ 45).
2. Ngược lại theo điểm:
   - `≥ 72` → **NÊN**
   - `< 42` → **KHÔNG NÊN**
   - `42–71`: nếu có **trở ngại thời điểm** (Không Vong / Nguyệt Phá / Nhật Phá / Phục tàng) → **NÊN CHỜ**; nếu không & `≥ 58` → **CÓ ĐIỀU KIỆN**; còn lại → **NÊN CHỜ**.

Triết lý: phân biệt "chưa tới lúc" (thời điểm → NÊN CHỜ) với "bản chất nghịch" (→ KHÔNG NÊN) — đúng tinh thần Kinh Dịch (Không Vong = việc còn trống, chờ điền thực).

## 6. Phong cách văn xuôi (mục 3, 7, 8)

Giọng: **bình tĩnh · sâu · rõ · không thần bí hóa · không phán chắc chắn tuyệt đối · tập trung vào quyết định & hành động**. Luôn giữ "góc nhìn tham khảo". Nhóm nhạy cảm (sức khỏe/kiện tụng) → khuyên có câu gặp bác sĩ/luật sư. Đây là yêu cầu cho LLM khi thay bản demo.

## 7. Test

`tests/quan-su-advisory.test.ts` — chạy báo cáo trên **24 loại câu hỏi** (≥ yêu cầu 20), khắp 15 nhóm, gồm cả luc-than / the-hao / framework / so-sánh. Kiểm bất biến: verdict trong enum, điểm 0-100, đúng 3 điểm thuận / 3 lưu ý / 3 khuyên, vận trình 2-4 chỉ báo, có luận chi tiết, `coNhap`/`proseLaDemo`. Cộng test quy tắc verdict + điểm.

## 8. Còn chờ

- **Thay văn xuôi demo bằng LLM thật** (cần Phần E của Thầy) — LLM viết lại xu hướng/khuyên/chi tiết, KHÔNG tính thêm.
- **Calibrate trọng số** (mục 4) — Thầy chỉnh cho khớp kinh nghiệm.
- **Khung riêng cho framework** (hợp tác Thế-Ứng, vay/đòi nợ 2 bước, tình duyên theo giới tính, xuất hành 4 Dụng thần) — hiện tạm chấm theo Hào Thế; nâng lên đúng khung ở phase sau.
- **Nhập Mộ / Tam Hợp cục / Tam Hình** — engine `luc-hao.ts` chưa tính (xem ICHING_OUTPUT_SCHEMA.md §5); khi bổ sung sẽ đưa vào bảng điểm.
