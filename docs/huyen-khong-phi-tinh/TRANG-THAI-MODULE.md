# TRẠNG THÁI MODULE HUYỀN KHÔNG PHI TINH

Tài liệu này cho biết module hiện có gì, độ tin cậy tới đâu, và còn thiếu gì.
Đọc file này trước khi đưa lên web hoặc giao cho lập trình viên.

---

## 1. Cấu trúc module

```
huyen-khong-phi-tinh/
├── SKILL.md                       # Quy trình luận 4 giai đoạn + hướng dẫn dùng engine
├── TRANG-THAI-MODULE.md           # File này
├── scripts/
│   └── engine.py                  # Engine tính toán (Python thuần, không cần AI)
└── references/                    # 10 file tri thức
    ├── a-nen-tang-lap-tinh-ban.md      # Nền tảng + cách lập tinh bàn
    ├── b-tinh-chat-van-9-va-24-son-huong.md  # 9 sao Vận 9, quái số, niên/nguyệt tinh
    ├── c-hoa-giai-sat-khi.md           # Hóa giải, xếp theo mức đồng thuận nhiều thầy
    ├── d-dao-hoa-vi.md                 # Đào Hoa / Thiên Hỷ / Hồng Loan
    ├── e-case-study-thuc-nghiem.md     # 7 case thực tế
    ├── f-loan-dau-son-thuy.md          # Hình thế núi/nước phối với sao
    ├── g-tinh-ban-24-son-huong-van9.md # Tinh bàn dựng sẵn 24 sơn hướng Vận 9
    ├── h-81-cap-sao-va-hoa-giai.md     # 81 cặp sao + kích hoạt/hóa giải từng sao
    ├── i-thu-son-xuat-sat-cua-chinh-duong-khi.md  # Thu Sơn Xuất Sát, cửa chính, đường khí, Chính-Linh Thần
    ├── k-cac-cach-cuc-tot-nhat.md      # Xếp hạng cách cục + Thất Tinh Đả Kiếp đầy đủ
    ├── quy-trinh-luan-khi-co-tinh-ban.md  # Quy trình 10 bước
    ├── song-tinh-danh-cuc.md           # 5 tổ hợp 2 sao cổ điển có tên
    └── thanh-mon.md                    # Thành Môn, mở cửa phụ cứu hướng
```

---

## 2. Engine — dùng thế nào

```bash
python3 scripts/engine.py --toa-do 165 --van 9                # nhập độ HƯỚNG
python3 scripts/engine.py --toa-do 270 --la-toa --van 9       # nhập độ TỌA
python3 scripts/engine.py --toa-do 165 --van 9 --nam 2026 --thang 3
python3 scripts/engine.py --toa-do 165 --van 9 --json         # xuất JSON cho web
python3 scripts/engine.py --the-quai                          # bật Thế Quái (mặc định TẮT)
python3 scripts/engine.py --nguon                             # bảng truy nguồn
python3 scripts/engine.py --self-test                         # tự kiểm chứng
```

**Engine là Python thuần — không gọi AI, không cần internet, chạy vài mili-giây.**

---

## 3. Kiểm chứng — con số cụ thể

Chạy `--self-test` để tái kiểm bất cứ lúc nào:

| Hạng mục | Kết quả | Đối chiếu với |
|---|---|---|
| Tinh bàn (Sơn + Hướng tinh, 9 cung) | **432/432 điểm (100%)** | 24 sơn hướng Vận 9 trong `g-tinh-ban-24-son-huong-van9.md` |
| Chính Thần / Linh Thần | **9/9 vận** thỏa hợp thập | Bảng trong `i-...md` mục 4.2 |
| Thành Môn | **3/3** | Ví dụ có lời giải trong sách Văn Hoài |
| Niên tinh nhập trung | **5/5** | 3 mốc lịch sử trong Tứ Bạch Quyết (1870=4, 1930=7, 1992=8) |
| Phân loại Không Vong | **8/8 ca biên** | Định nghĩa trong file A mục 15 |

**Phạm vi đã kiểm chứng bằng dữ liệu: Vận 9.** Vận 1-8 dùng cùng thuật toán nhưng chưa có bộ dữ liệu đối chiếu độc lập — engine tự cảnh báo khi chạy vận khác 9.

---

## 4. Engine tính được gì

- Vận Bàn / Sơn Bàn / Hướng Bàn đầy đủ 9 cung
- Phân loại độ lệch 4 mức: Chính hướng / Kiêm hướng / **Tiểu Không Vong** / **Đại Không Vong** (kiểm cả Tọa lẫn Hướng)
- Cách cục: Vượng Sơn Vượng Hướng, Thượng Sơn Hạ Thủy, Song Tinh Đáo Hướng/Tọa, Phản Ngâm, Phục Ngâm, Hợp Thập toàn bàn, Liên Châu Tam Ban, Nhập Tù, cặp số Tiên Thiên
- Thành Môn Chính / Phụ / Ngầm + quét 24 sơn tìm chỗ mở cửa phụ đắc vượng khí
- Vượng / Sinh / Suy / Tử của từng sao theo vận
- Song Tinh Danh Cục (Tứ Nhất, Cửu Thất, Nhị Ngũ, Tam Thất, Giao Kiếm)
- Niên tinh / Nguyệt tinh + cảnh báo Ngũ Hoàng, Nhị Hắc lưu niên
- Cảnh báo sát khí từng cung + gợi ý hướng hóa giải
- **Chính Thần / Linh Thần / Chiếu Thần** theo vận + quy tắc bố trí thủy (Chính Thần kỵ nước, Linh Thần có nước là cát)
- **Thu Sơn Xuất Sát** — khuyến nghị cao/thấp cho từng cung
- **Thất Tinh Đả Kiếp / Tam Ban Xảo Quái** — nhận diện loại (Ly/Khảm/Xảo Quái) và thật/giả

---

## 5. Engine CỐ TÌNH KHÔNG tính (và vì sao)

| Không tính | Lý do |
|---|---|
| **Đắc cách / thất cách** | Cần loan đầu thực tế (núi/nước/đường ở đâu) — web phải hỏi người dùng |
| **Kết luận cát hung cuối cùng** | Phụ thuộc đắc/thất cách ở trên |
| **Điều kiện "3 cung thông khí" của Đả Kiếp** | Engine nhận diện được LOẠI Đả Kiếp, nhưng không biết thực địa 3 cung có cửa/đường/thông khí hay không. Hụt điều kiện này thì Đả Kiếp thành cách XẤU (hạ thủy, tổn đinh) → engine luôn kèm cảnh báo |
| **Thế Quái tự động** | Ngưỡng độ còn mâu thuẫn giữa nguồn (3°/6° vs 4°/7°); là quyết định của người luận. Bật thủ công `--the-quai` |
| **Đào Hoa theo NHÀ** | Công thức gốc không còn trong phần OCR đọc được. Chỉ có Đào Hoa theo NGƯỜI (đã verify) |
| **Ý nghĩa cặp sao ngoài Vận 9** | Bảng 9 cặp chỉ đúng Vận 9; engine tự tắt mục này khi vận khác |
| **Bát Sát / Hoàng Tuyền / Sát Long / Ám Ngũ Hoàng theo sơn hướng** | Dữ liệu trong nguồn bị OCR xáo trộn — bỏ qua thay vì đoán |

---

## 6. Gợi ý kiến trúc khi đưa lên web

| Lớp | Chạy bằng | Chi phí AI |
|---|---|---|
| 1. Engine tính | `engine.py --json` trên server | **0đ** |
| 2. Form nhập loan đầu | HTML | **0đ** |
| 3a. Diễn giải bằng template | Ghép từ các file `references/` | **0đ** |
| 3b. Diễn giải bằng AI (tùy chọn) | Gọi API | có phí, chỉ khi dùng |

Gợi ý mô hình: **Free** = lớp 1+2+3a (tinh bàn, cách cục, cảnh báo Không Vong/Ngũ Hoàng); **Trả phí** = thêm lớp 3b (luận chi tiết theo hoàn cảnh khách, hóa giải cá nhân hóa).

---

## 7. Còn thiếu — theo thứ tự ưu tiên

| # | Thiếu | Nguồn có sẵn để làm | Ảnh hưởng |
|---|---|---|---|
| 1 | Bảng "24 Đả Kiếp Thật Cục" | MV_HKPT1 (là ảnh, chưa trích được) | Trung bình — engine đã nhận diện bằng logic, bảng chỉ để đối chiếu |
| 2 | Xác minh 3 cục Song Tinh vận 8 chênh với nguồn | MV_HKPT1 | Trung bình — engine ra 9 cục, nguồn liệt kê 6 (nghi OCR cắt) |
| 4 | Bát Sát / Hoàng Tuyền theo 24 sơn hướng | Nguồn Trương Giác Minh (OCR hỏng) | Trung bình |
| 5 | Loan Đầu kiến trúc hiện đại | Thẩm thị phong cảnh (chưa xử lý) | Trung bình — quan trọng với khách đô thị |
| 6 | 23 case study còn lại | MV_HKPT2 | Trung bình — dùng để test độ chính xác |
| 7 | 48 cục chi tiết theo vận | Văn Hoài Phần III | Thấp nếu chỉ làm nhà vận 9 |

---

## 8. Nguyên tắc đã áp dụng xuyên suốt

1. **Không đoán mò** — chỗ nguồn không nói rõ thì để trống, không tự suy. Ví dụ: nguồn nhắc "tiến khí" trong thứ tự nhưng không gán số → engine không gán, trả `TỬ/XA`.
2. **Kiểm chứng bằng dữ liệu trước khi tin** — mọi con số trong mục 3 đều tái kiểm được bằng `--self-test`.
3. **Ghi rõ nguồn cho từng mục** — chạy `--nguon` để xem, có 3 mức: CHẮC / NGUỒN / MÂU THUẪN.
4. **Cảnh báo khi ra ngoài vùng đã kiểm chứng** — chạy vận ≠ 9 hoặc gặp Không Vong, engine tự nói rõ.
5. **Mâu thuẫn giữa các nguồn thì nêu ra, không tự chọn im lặng** — ví dụ ngưỡng 3°/6° vs 4°/7°.
