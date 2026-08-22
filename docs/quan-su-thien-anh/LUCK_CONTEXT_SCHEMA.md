# LUCK CONTEXT SCHEMA — Quân Sư Thiên Anh (Phase 4)

Cấu trúc `LuckContext` — kết quả engine "Vận Trình Hiện Tại" (`src/lib/quan-su/current-luck.ts`). Là dữ liệu bổ trợ cho Advisory Engine + card UI. KHÔNG phải luận sự việc (đó là Kinh Dịch).

## 1. Đầu vào `LuckInput`

```typescript
interface LuckInput {
  day: number; month: number; year: number;   // ngày sinh dương lịch
  gender: "Nam" | "Nữ";
  hour?: number;     // giờ sinh 0-23 — không có thì dùng 12h + gắn gioSinhKnown=false, bỏ lớp Tử Vi
  nowYear?: number;  // năm hiện tại (mặc định năm hệ thống) — để tính tuổi + lưu niên
}
```

## 2. `LuckContext` — đầu ra

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `nguon` | `"bat-tu"` | Nguồn CHÍNH của điểm số (Tử Vi chỉ phụ) |
| `tuoiHienTai` | `number` | Tuổi mụ = nowYear − nămSinh + 1 |
| `gioSinhKnown` | `boolean` | Có giờ sinh hay không (ảnh hưởng độ chính xác + lớp Tử Vi) |
| `daiVanHienTai` | object | Đại Vận đang ở: `{ tuoiBatDau, tuoiKetThuc, can, chi, thapThan, band, danhGia }` |
| `luuNienHienTai` | object | Lưu Niên năm nay: `{ nam, can, chi, thapThan, band, danhGia }` |
| `dungThan` | object | `{ dungThan, hyThan, kyThan, cuuThan, capDo, phuongPhap }` (từ `phanTichBatTu`) |
| `dimensions` | `LuckDimension[]` | **4 thanh** cho card — xem mục 3 |
| `timeline` | array | 10 giai đoạn đại vận, mỗi cái `{ tuoiBatDau, tuoiKetThuc, nhan, band, danhGia, laHienTai }` |
| `tuVi` | object \| null | Lớp phụ: `{ daiVanCung, chinhTinh[], ghiChu }` — null nếu không có giờ sinh / engine lỗi |
| `signals` | `string[]` | Lý do deterministic (minh bạch) — để LLM viết lại thành lời thường |
| `tomTat` | `string[]` | 2-4 dòng tóm tắt sẵn (deterministic) — LLM có thể viết lại giọng "quân sư đồng hành" |
| `coNhap` | `true` | ⚠️ **BẢN NHÁP** — công thức dimension chưa hiệu chỉnh; Thầy cần calibrate |

`danhGia`: `"tot" | "binh_thuong" | "xau"` (rút từ `band`). `band`: `"rat_thuan" | "thuan" | "trung_binh" | "thu_thach" | "nghich"` — 5 dải chi tiết hơn, chấm bằng Can+Chi+xung (xem `CURRENT_LUCK_ENGINE.md` §4).

## 3. `LuckDimension` — một thanh chỉ số

```typescript
interface LuckDimension {
  key: "su-nghiep" | "tai-chinh" | "co-hoi" | "bien-dong";
  label: string;         // "Sự nghiệp" | "Tài chính" | "Cơ hội" | "Biến động"
  score: number;         // 0-10 (số nguyên) — vẽ thanh
  higherIsBetter: boolean; // true cho 3 thanh đầu; false cho "Biến động" (cao = càng nên thận trọng)
}
```

**Lưu ý UI:** "Biến động" `higherIsBetter=false` — nếu tô cùng màu với 3 thanh kia sẽ gây hiểu lầm. Nên dùng màu/nhãn khác (vd màu cảnh báo nhạt) và ghi chú "mức xáo trộn".

## 4. Ví dụ (người sinh 20/5/1990, Nam, xem năm 2026)

```
VẬN TRÌNH HIỆN TẠI                         (tuổi 37 · đại vận Ất Dậu · Dụng Thần Kim)
  Sự nghiệp   ██░░░░░░░░  2/10
  Tài chính   ██░░░░░░░░  2/10
  Cơ hội      ██░░░░░░░░  2/10
  Biến động   ███████░░░  7/10   (mức xáo trộn — nên thận trọng)

“Thời vận chung năm nay còn nhiều trắc trở. Các mặt sự nghiệp – tài chính – cơ hội
 đang khá đồng đều, chưa mặt nào bật lên. Giai đoạn nhiều xáo trộn — nên thận trọng.”
```
(Số liệu do engine tính từ Dụng Thần; câu chữ là `tomTat` deterministic, LLM sẽ viết lại giọng đời thường.)

## 5. Chỗ ngồi trong payload Advisory Engine

`LuckContext` điền vào slot `van_trinh` của `QuanSuInterpretationPayload` (`src/lib/quan-su/divination.ts`):

```typescript
interface QuanSuInterpretationPayload {
  question: { ...; dung_than_hint };
  cast: FullCastResult;         // quẻ Kinh Dịch (engine tính) — luận SỰ VIỆC
  van_trinh: LuckContext | null; // vận trình (engine tính) — mô tả VẬN THẾ người
  meta: { castAtISO; method };
}
```

Advisory Engine (LLM) đọc **cả hai**: quẻ (sự việc) + vận trình (vận thế) → phối theo Phần C của `KINH_DICH_INTERPRETATION_TEMPLATE.md` (quẻ là tiếng nói chính, vận trình là phông nền; khi lệch nhau thì "đọc theo tầng", không ép 1 kết luận). Xem `INTERPRETATION_ENGINE.md`.

## 6. Bất biến (đã test đảm bảo)

- `dimensions` luôn đúng 4 thanh, điểm ∈ [0,10] số nguyên, "Biến động" `higherIsBetter=false`.
- `timeline` đúng 10 giai đoạn, đúng 1 giai đoạn `laHienTai`.
- Đại Vận hiện tại chứa đúng tuổi mụ.
- Thiếu giờ sinh → vẫn chạy (Bát Tự), `tuVi=null`, có cảnh báo trong `signals`.
- Người sinh khác nhau → đại vận/dụng thần khác nhau (không phải hằng số cứng).
- `coNhap: true` luôn có mặt (không quên rằng đây là bản nháp).
