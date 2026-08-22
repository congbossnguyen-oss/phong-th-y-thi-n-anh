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

**Mượn quy tắc từ 2 module đã kiểm chứng (theo gợi ý của Thầy 2026-08-23):**
- **Cách chấm đại vận** lấy từ `src/lib/trach-nhat-sinh-no/dai-van-band.ts` (đang chạy production trong công cụ "Chọn Ngày Giờ Sinh Cho Bé"): xét **CẢ CAN LẪN CHI** của đại vận so với Dụng/Hỷ/Kỵ Thần + cộng trừ **xung Nhật/Nguyệt Chi**, rồi quy về **5 dải** (rất thuận/thuận/trung bình/thử thách/nghịch). Đây là bản vá cho lỗ hổng "chỉ xét Can" ở bản Phase 4 đầu.
- **Cách gán 4 thanh theo Thập Thần** được đối chiếu với `handoff/config/thap_than_nghe.json` (module "Định Hướng Nghề Nghiệp"): Quan/Sát→sự nghiệp (management/authority), Tài→tài chính (business/investment), Thực/Thương→cơ hội (specialist), Kiếp Tài/Thương Quan→biến động. Cách gán của engine này **khớp** với bảng đó.

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
# Bước 1 — chấm 1 giai đoạn (đại vận / lưu niên), XÉT CẢ CAN LẪN CHI (lấy từ dai-van-band.ts):
score = [Can: Dụng +2, Hỷ +1, Kỵ −2] + [Chi: Dụng +2, Hỷ +1, Kỵ −2]
        + (Chi xung Nguyệt Chi ? −2 : 0) + (Chi xung Nhật Chi ? −1.5 : 0)   # lưu niên xung nhẹ hơn (−1)
band = rất thuận (≥3) / thuận (≥1) / trung bình (≥−0.5) / thử thách (≥−2.5) / nghịch
fav  = rất thuận +2 · thuận +1 · trung bình 0 · thử thách −1 · nghịch −2

# Bước 2 — 4 thanh:
base = 5 + 1.5·fav(Đại Vận) + 0.75·fav(Lưu Niên)          (kẹp 0–10)
Sự nghiệp = base + (Thập Thần Đại Vận ∈ Quan Sát ? +1.5 : ∈ Ấn ? +0.5 : 0)
Tài chính = base + (∈ Tài ? +1.5 : ∈ Thực Thương ? +0.5 : 0)
Cơ hội    = base + (∈ Thực Thương ? +1.5 : = Chính Ấn ? +0.5 : 0)
Biến động = 5 − 1.0·fav(Đại Vận) + (Chi Đại Vận xung Nhật/Nguyệt Chi ? +2 : 0) + (∈ {Kiếp Tài, Thương Quan} ? +1.5 : 0)
```
- **Bước 1 (tốt/xấu) đã có căn cứ vững:** dùng Dụng/Hỷ/Kỵ Thần (engine đã kiểm chứng) + cách chấm Can+Chi+xung **lấy nguyên từ `dai-van-band.ts`** đang chạy production. Đã vá lỗ hổng "chỉ xét Can" — ví dụ đại vận Ất Dậu, Dụng Thần Kim: trước chấm "xấu" (chỉ nhìn Ất=Mộc), giờ chấm "bình thường" (nhìn cả Dậu=Kim=Dụng Thần).
- **Bước 2 (nhấn mạnh dimension theo Thập Thần):** cách gán khớp `thap_than_nghe.json` của module nghề, nhưng **trọng số (+1.5/+0.5) vẫn là heuristic CHƯA calibrate trên dữ liệu thật**.
- Toàn bộ `LuckContext` gắn cờ **`coNhap: true`** (bản nháp — chính `thap_than_nghe.json` và `module-ket-hop.ts` cũng tự đánh dấu vậy). **Việc cho Thầy:** chỉnh trọng số Bước 2 (và ngưỡng dải Bước 1 nếu muốn) cho khớp kinh nghiệm, trước khi mở cho khách. Có thể calibrate bằng cách đưa vài người Thầy biết rõ vận → xem 4 thanh → chỉ chỗ lệch → đệ chỉnh.

## 5. Nguyên tắc "chỉ hiện đồ hình + 3-5 dòng, không hiện toàn bộ lá số"

- Card mặc định chỉ hiện: **4 thanh** + **2-4 dòng** `tomTat` (LLM có thể viết lại giọng "quân sư đồng hành").
- **KHÔNG** hiện toàn bộ lá số Bát Tự/Tử Vi ở đây — chỉ khi người dùng mua/mở **module chuyên sâu riêng** (Đại Cát Lợi đã có: Lập lá số Bát Tự, Lập lá số Tử Vi, Định Hướng Nghề Nghiệp).
- `signals` (chi tiết kỹ thuật) để ở lớp "xem chi tiết", không đổ ra ngay.

## 6. Chưa làm / cần Thầy

- **Hiệu chỉnh công thức 4 thanh** (mục 4) — quan trọng nhất, cần kinh nghiệm của Thầy.
- Lớp Tử Vi hiện chỉ lấy cung + sao chính; nếu muốn dùng Tử Vi sâu hơn cho vận trình, cần rà 3 lỗi đã biết trước.
- Cân nhắc thêm dimension khác (Tình cảm, Sức khỏe) nếu sản phẩm cần — hiện đúng 4 thanh theo yêu cầu Phase 4.
