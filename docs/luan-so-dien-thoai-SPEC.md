# SPEC: Module "Luận Số Điện Thoại" (Bát Cực Linh Số) cho phongthuythienanh.com

Nguồn gốc nghiệp vụ: skill Claude `./` (SKILL.md + 6 file trong data/). Spec này map quy trình 8 bước của skill thành kiến trúc web, theo đúng pattern đã dùng cho module Xem Ngày Cao Cấp / Ký Hợp Đồng / Khai Trương: **spec-first, Claude Code tự đọc repo và build**, không đoán dữ liệu — thiếu gì thì trả `thieu_du_lieu`, không tự bịa.

**Mô hình sản phẩm đã chốt:**
- Miễn phí toàn bộ (công cụ thu hút traffic, không thu phí).
- Hiển thị 2 lớp: **card điểm tổng quan** (như trang tham khảo simkinhdich.com) ở trên, **bài luận chi tiết dạng văn xuôi** (đúng văn phong 8 bước của skill) ở dưới.
- **Kiến trúc: 1 engine hoàn chỉnh, chạy tự động 100%, KHÔNG gọi Claude API lúc runtime.** Toàn bộ pipeline (tra bảng, tính điểm, tách chuỗi) là hàm thuần TypeScript — rẻ, nhanh, xác định (deterministic). Phần bài luận văn xuôi (lớp 2) cũng sinh bằng **template ghép chuỗi** (không gọi AI mỗi lượt) — xem mục 5b.

---

## 1. Input

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `soDienThoai` | ✅ | 9-10 số, validate định dạng VN |
| `cccd` | ❌ | 12 số — nếu có, mở khóa Bước 4/5/8 (Cơ chế B) |
| `ngaySinh` | ❌ | dùng đối chiếu Tiên Thiên/Bát Tự nếu có |
| `gioiTinh` | ❌ | nam/nữ — dùng cho cảnh báo Diên Niên nữ giới, hôn nhân |
| `mucDich` | ❌ | enum: tổng quát/tài lộc/hôn nhân/sự nghiệp/sức khỏe/học hành — quyết định phần nào trong 10 nhóm được đào sâu |

## 2. Nguồn dữ liệu — KHÔNG duplicate, convert từ skill

Đề xuất tạo package mới `phone-energy-engine` (npm workspace, cùng cấp `rule-engine`/`trachnhat-engine`), data convert 1-1 từ các file skill sau (Claude Code đọc trực tiếp nội dung các file này khi build, không đoán lại):

| File nguồn (skill) | Dữ liệu cần convert sang JSON/TS |
|---|---|
| `data/bang-tra-bat-tinh.md` | Bảng 4 cát tinh + 4 hung tinh (4 cấp/tinh), bảng ngũ hành 10 số, quy tắc 2 lớp tách cặp (bỏ qua 0/5), quy tắc hiệu ứng 5/0 (trước/giữa/sau), quy tắc đuôi số, cấp động/tĩnh, tổ hợp 3 số cảnh báo |
| `data/hoa-giai.md` | Cơ chế A (Song Tinh Hội Ứng — hóa giải nội bộ), Cơ chế B (liên nguồn CCCD↔SĐT), công thức hóa giải từng hung tinh, mapping mục đích→tinh ưu tiên, bảng Dụng Thần→chữ số |
| `data/10-nhom-tu-truong.md` | Nguyên tắc trái-phải, 10 nhóm điểm xâm nhập với ví dụ tổ hợp |
| `data/mo-ta-8-tinh.md` | Kho mô tả văn xuôi 8 tinh (ưu/khuyết điểm, tài vận, sự nghiệp, tình cảm, sức khỏe, quý nhân) — nguồn chính cho template sinh văn bản ở mục 5b |
| `data/dai-van-tuoi.md` | Công thức tính Vận thế từ 12 số CCCD (cặp đầu=10 năm, sau đó trượt 5 năm/cặp, +10 năm nếu cặp chứa số 5), bảng nhu cầu ưu tiên theo tuổi |
| `data/luu-y-dac-biet.md` | Ngưỡng cảnh báo (>3 số 5, >2 số 0, đuôi=0, Diên Niên dày cho nữ), nguyên tắc "hung tinh không chắc đã hung" |

## 3. Pipeline tính toán (hàm hóa 8 bước)

```
tachCapGoc(soDienThoai) → CapGoc[]                    // Bước 1: 2 lớp, bỏ qua 0/5
traBatTinh(CapGoc[]) → BatTinhResult[]                 // Bước 2: tra 4 cát + 4 hung, cấp độ
apDungHieuUngSo5So0(soDienThoai, BatTinhResult[])      // Bước 2: trước/giữa/sau
apDungCoCheA(BatTinhResult[]) → HoaGiaiNoiBo[]         // Bước 2: Song Tinh Hội Ứng
luanBo3SoLienTiep(soDienThoai) → NarrativeBlock[]      // Bước 2: câu chuyện toàn dãy
luanTrongTam3SoDuoi(BatTinhResult[]) → KetCuc          // Bước 3
  IF cccd:
    doiChieuTienThien(cccd, soDienThoai) → NguHanhSinhKhac   // Bước 4
    tinhVanThe(cccd) → VanTheTimeline[]                       // Bước 5 (12 số CCCD)
    apDungCoCheB(VanTheTimeline, BatTinhResult[]) → HoaGiaiLienNguon[]
luan10NhomTuTruong(BatTinhResult[], mucDich) → NhomTuTruongResult[]  // Bước 6
tongHopCanhBao(soDienThoai, gioiTinh) → CanhBao[]      // Bước 7 (ngưỡng số 5/0, Diên Niên nữ...)
goiYHoaGiai(...) → GoiYHoaGiaiResult                   // Bước 8
tinhDiemTongQuan(...) → ScoreCard                      // cho card điểm, xem mục 4
```

Mọi hàm khi gặp tổ hợp/dữ liệu không có trong bảng phải trả `thieu_du_lieu: true` kèm tổ hợp cụ thể — KHÔNG trả về suy đoán.

## 4. Đề xuất hệ thống điểm cho Card tổng quan (CẦN ANH DUYỆT — không có sẵn trong tài liệu gốc, em tự thiết kế dựa theo tinh thần bài viết tham khảo simkinhdich.com, không phải nguyên văn)

| Thành phần | Trọng số đề xuất | Logic |
|---|---|---|
| Tam cát tinh hội tụ (Sinh Khí+Thiên Y+Diên Niên đều xuất hiện) | +25% | Cách cục hiếm, cộng mạnh nếu đủ |
| Tỷ lệ cát/hung trong toàn dãy (sau khi áp Cơ chế A) | ±25% theo tỷ lệ | % cát tinh thực tế sau hóa giải nội bộ |
| Năng lượng ở 3 số đuôi (kết cục) | ±25% | Cát mạnh ở đuôi = cộng lớn; hung mạnh + đột hiển = trừ lớn |
| Chuỗi hung tinh liên tiếp không hóa giải được | -15% | Theo mục 4e (hung liền Phục Vị / liên tiếp nhiều loại) |
| Mức hỗ trợ CCCD (Cơ chế B, chỉ tính nếu có CCCD) | +10% | Có cát tinh SĐT hóa giải được hung tinh CCCD |
| Cảnh báo đặc biệt (>3 số 5, >2 số 0, đuôi=0, Diên Niên dày cho nữ) | -10% mỗi cảnh báo, tối đa -20% | Từ `data/luu-y-dac-biet.md` |

| Điểm hiển thị dạng % (0-100%) + nhãn — **ĐÃ CHỐT**: | |

| Điểm | Nhãn |
|---|---|
| ≥ 80 | Năng lượng rất tốt |
| 65–79 | Năng lượng tốt |
| 50–64 | Ở mức trung bình |
| 35–49 | Cần lưu ý |
| < 35 | Nên cân nhắc đổi số |

## 5. Output UI (2 lớp)

**Lớp 1 — Card tổng quan (above the fold):**
- % điểm tổng + nhãn
- Năng lượng chủ đạo (tinh xuất hiện nhiều nhất)
- Năng lượng kết (đuôi số)
- Badge cảnh báo nếu có (số gãy, tứ đại giai không...)
- CTA: "Xem luận giải chi tiết ↓" (anchor scroll) + CTA phụ mời tư vấn dịch vụ trả phí (Thẩm định bản vẽ toàn diện, hoặc dịch vụ chọn số) — chỗ này chèn funnel nhẹ dù công cụ free.

**Lớp 2 — Bài luận chi tiết (dạng văn xuôi, đúng 8 bước):**
Y hệt format em vẫn luận trong chat: từng bước có heading, câu chuyện bộ-3-số nối mạch, không lộ mã nội bộ (không "mục 4b", không "cấp 1/2/3" — dùng lời tự nhiên, đúng quy tắc "Định dạng đầu ra" đã ghi trong SKILL.md).

## 5b. Thiết kế template sinh văn bản (engine tự ghép, không gọi AI)

Mỗi đơn vị dữ liệu cần 1 **bộ câu mẫu (template string) soạn sẵn**, engine chỉ điền biến vào và ghép nối theo thứ tự — giống cách trang tham khảo simkinhdich.com làm (mỗi tổ hợp số có sẵn đoạn văn cố định, không sinh động bằng AI):

- **Mỗi cặp Bát tinh (8 tinh × 4 cấp = 32 mục)** → 1 đoạn mô tả ngắn cố định (rút từ tài liệu gốc: ưu điểm/khuyết điểm/tài vận/sự nghiệp/tình cảm/sức khỏe theo từng tinh — đã có sẵn trong 2 tài liệu nguồn "Bát Cực Linh Số" và "Sim Nói Gì Về Bạn", cần trích xuất riêng thành `mo-ta-8-tinh.json` nếu chưa có trong skill hiện tại — **đây là phần dữ liệu còn thiếu, cần bổ sung trước khi build**, không có sẵn trong 6 file dữ liệu này).
- **Mỗi cặp hiệu ứng 5/0 (5 vị trí × ý nghĩa)** → câu mẫu riêng (vd "số 5 đứng sau khiến năng lượng {tenTinh} kéo dài, mạnh hơn").
- **Mỗi kết hợp Cơ chế A (hung+cát hóa giải)** → câu mẫu (vd "{hungTinh} gặp {catTinh} đứng bên phải → hóa hung thành cát: {yNghia}").
- **Ghép bộ 3 số liên tiếp toàn dãy** → template nối câu theo mẫu đã dùng trong chat (vd mẫu "986" ở Bước 2).
- Toàn bộ template nên đặt trong file `templates/` riêng (không hardcode trong logic tính toán), để sau này chỉnh câu chữ không phải sửa code nghiệp vụ.

**Rủi ro cần lưu ý — ĐÃ GIẢI QUYẾT:** phần mô tả chi tiết ưu/khuyết/tài vận/sự nghiệp/tình cảm/sức khỏe cho từng tinh nay đã có tại `data/mo-ta-8-tinh.md` trong skill (8 tinh × đầy đủ mục, nguồn simkinhdich.com đối chiếu cùng hệ thống). Claude Code đọc trực tiếp file này để convert thành `mo-ta-8-tinh.json` cho template.

## 6. Rủi ro / giới hạn cần Claude Code xử lý đúng, không tự chế thêm

- Chương 2 sách "Sim Nói Gì Về Bạn" (luận riêng từng cặp trong 64 cặp) **chưa số hóa** — module chỉ dùng dữ liệu theo nhóm Bát tinh.
- Vận thế CCCD vượt quá 11 cặp (>~55-60 tuổi tính từ 12 số) — **ĐÃ CHỐT**: trả `thieu_du_lieu`, nói thẳng với khách phần này chưa luận được, KHÔNG áp quy tắc "lấy số cuối CCCD + số 1" (chưa xác nhận chắc chắn).
- Không luận Kinh Dịch/64 quẻ, không luận Âm Dương số — loại trừ có chủ đích, giữ nguyên khi build web.
- Hệ thống điểm ở mục 4 là đề xuất của em, chưa qua kiểm chứng — nên để `weights` là config có thể chỉnh sau khi anh test thử với vài số thật, không hardcode cứng trong logic.

## 7. Thứ tự triển khai đề xuất

1. Convert 6 file trong data/ thành `phone-energy-engine` (data + hàm thuần, có unit test đối chiếu lại đúng các ví dụ đã luận trong skill — vd 0916665956, 0836768768).
2. Build pipeline Bước 1-3 (không cần CCCD) trước — dùng được ngay.
3. Build Bước 4-5-8 Cơ chế B (cần CCCD) sau.
4. Build Card điểm (mục 4) — để config trọng số riêng, dễ chỉnh.
5. Build UI 2 lớp + wiring vào route mới trên Astro.
