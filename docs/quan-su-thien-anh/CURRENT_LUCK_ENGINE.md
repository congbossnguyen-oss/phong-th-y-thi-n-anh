# CURRENT LUCK ENGINE — Quân Sư Thiên Anh (Phase 4)

Engine "Vận Trình Hiện Tại" — lớp **CONTEXT bổ trợ** dựa trên Bát Tự + Tử Vi. Trả lời **"người này hiện đang ở vận thế nào?"** — KHÁC Kinh Dịch (trả lời "sự việc này thế nào?").

> ⚠️ **Hai lớp phải phân biệt rõ** (nguyên tắc Thầy nhấn mạnh): Kinh Dịch luận SỰ VIỆC (engine chính, mỗi câu hỏi); Bát Tự/Tử Vi chỉ mô tả VẬN THẾ của người (context nền). Engine này **không** luận từng câu hỏi, chỉ vẽ bức tranh vận trình.

## 1. Tái dùng engine có sẵn — KHÔNG viết lại

| Nguồn | Hàm dùng | Lấy gì |
|---|---|---|
| `src/lib/bat-tu.ts` | `tinhBatTu()` | Lá số + 10 giai đoạn Đại Vận (mỗi giai đoạn: Can Chi, tuổi bắt đầu/kết thúc) |
| | `tinhLuuNien(nowYear, birthYear, 1)` | Can Chi Lưu Niên năm hiện tại |
| | `thapThanOf(canIndex, nhatChuIndex)` | Thập Thần của Đại Vận/Lưu Niên so với Nhật Chủ |
| | `CAN_NGU_HANH` | Ngũ hành của Can |
| `src/lib/bat-tu-engine/engine.ts` | `phanTichBatTu(tt)` | Vượng Suy + **Dụng/Hỷ/Kỵ/Cừu Thần** (đã kiểm chứng, dùng để đánh giá tốt/xấu) |
| `src/lib/tu-vi/engine.ts` | `tinhTuVi()` | (lớp phụ) Cung Đại Vận hiện tại + sao chính — chỉ đối chiếu định tính |

**File engine mới:** `src/lib/quan-su/current-luck.ts` → hàm `tinhVanTrinhHienTai(input): LuckContext`. Chỉ **gom/trích** dữ liệu từ các engine trên, không tự tính lá số. Có test `tests/quan-su-current-luck.test.ts` (7 test, đã pass).

## 2. Vì sao Bát Tự là nguồn CHÍNH, Tử Vi chỉ phụ

- **Bát Tự** cho tín hiệu tốt/xấu SẠCH: `phanTichBatTu` đã chốt Dụng/Hỷ/Kỵ/Cừu Thần → so ngũ hành Đại Vận/Lưu Niên với Dụng Thần = biết thuận hay nghịch. Đây là cơ sở tính điểm.
- **Tử Vi** có **3 lỗi đã biết** (`docs/TUVI_ENGINE_AUDIT.md`) + cần giờ sinh chính xác. Vì vậy Tử Vi chỉ dùng làm **đối chiếu định tính** (cung Đại Vận hiện tại + sao chính), **KHÔNG** quyết định điểm số. Nếu Tử Vi lỗi ở 1 mốc → bỏ qua, vận trình vẫn chạy bằng Bát Tự (bọc try/catch).
- Không có giờ sinh → dùng giờ mặc định 12h cho Bát Tự (đại vận sai lệch nhỏ) + bỏ lớp Tử Vi + gắn cờ `gioSinhKnown=false`.

## 3. Quy trình `tinhVanTrinhHienTai`

1. Lập lá số (`tinhBatTu`) + Dụng Thần (`phanTichBatTu`).
2. Tìm **Đại Vận hiện tại**: giai đoạn chứa tuổi mụ (`nowYear − nămSinh + 1`).
3. Lấy **Lưu Niên hiện tại** (`tinhLuuNien`).
4. Đánh giá tốt/xấu: so ngũ hành (Đại Vận, Lưu Niên) với Dụng/Hỷ/Kỵ/Cừu Thần → `tot`/`binh_thuong`/`xau`.
5. Quy ra **4 thanh chỉ số** (xem mục 4).
6. Dựng **timeline** 10 đại vận (mỗi giai đoạn gắn nhãn tốt/xấu, đánh dấu giai đoạn hiện tại).
7. (Nếu có giờ sinh) thêm **lớp Tử Vi** phụ.
8. Sinh `signals` (lý do) + `tomTat` (2-4 dòng) deterministic.

## 4. 4 thanh chỉ số — ⚠️ BẢN NHÁP, công thức minh bạch để Thầy hiệu chỉnh

Card "VẬN TRÌNH HIỆN TẠI" hiển thị 4 thanh 0–10:

| Thanh | Ý nghĩa | Cao = ? |
|---|---|---|
| **Sự nghiệp** | Sức mạnh mảng công danh/vị thế | Cao = tốt |
| **Tài chính** | Sức mạnh mảng tiền bạc | Cao = tốt |
| **Cơ hội** | Khả năng bung ra / thể hiện / quý nhân | Cao = tốt |
| **Biến động** | Mức xáo trộn/rủi ro của giai đoạn | **Cao = càng nên thận trọng** (ngược 3 thanh trên) |

**Công thức (đơn giản, đọc được):**
```
fav(hành) = +2 nếu = Dụng Thần, +1 Hỷ, −2 Kỵ, −1 Cừu, 0 trung
base = 5 + 1.5·fav(Đại Vận) + 0.75·fav(Lưu Niên)          (kẹp 0–10)

Sự nghiệp = base + (Thập Thần Đại Vận ∈ Quan Sát ? +1.5 : ∈ Ấn ? +0.5 : 0)
Tài chính = base + (∈ Tài ? +1.5 : ∈ Thực Thương ? +0.5 : 0)
Cơ hội    = base + (∈ Thực Thương ? +1.5 : = Chính Ấn ? +0.5 : 0)
Biến động = 5 − 1.0·fav(Đại Vận) + (Chi Đại Vận XUNG Nhật Chi ? +2 : 0) + (∈ {Kiếp Tài, Thương Quan} ? +1.5 : 0)
```
- Phần "tốt/xấu" (`base` qua Dụng Thần) **dựa trên engine đã kiểm chứng** — đáng tin.
- Phần "nhấn mạnh dimension theo Thập Thần" là **heuristic** — hợp lý theo nghĩa Thập Thần cổ điển (Quan Sát→sự nghiệp, Tài→tiền, Thực Thương→thể hiện, Kiếp/Thương→biến động) nhưng **CHƯA hiệu chỉnh trên dữ liệu thật**.
- Toàn bộ `LuckContext` gắn cờ **`coNhap: true`** (bản nháp — giống module nghề nghiệp `module-ket-hop.ts`). **Việc cho Thầy:** đọc công thức trên, chỉnh trọng số / cách nhấn dimension cho khớp kinh nghiệm của Thầy trước khi mở cho khách.

## 5. Nguyên tắc "chỉ hiện đồ hình + 3-5 dòng, không hiện toàn bộ lá số"

- Card mặc định chỉ hiện: **4 thanh** + **2-4 dòng** `tomTat` (LLM có thể viết lại giọng "quân sư đồng hành").
- **KHÔNG** hiện toàn bộ lá số Bát Tự/Tử Vi ở đây — chỉ khi người dùng mua/mở **module chuyên sâu riêng** (Đại Cát Lợi đã có: Lập lá số Bát Tự, Lập lá số Tử Vi, Định Hướng Nghề Nghiệp).
- `signals` (chi tiết kỹ thuật) để ở lớp "xem chi tiết", không đổ ra ngay.

## 6. Chưa làm / cần Thầy

- **Hiệu chỉnh công thức 4 thanh** (mục 4) — quan trọng nhất, cần kinh nghiệm của Thầy.
- Lớp Tử Vi hiện chỉ lấy cung + sao chính; nếu muốn dùng Tử Vi sâu hơn cho vận trình, cần rà 3 lỗi đã biết trước.
- Cân nhắc thêm dimension khác (Tình cảm, Sức khỏe) nếu sản phẩm cần — hiện đúng 4 thanh theo yêu cầu Phase 4.
