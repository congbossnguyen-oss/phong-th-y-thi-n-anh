# KẾT HỢP BÁT TỰ × TỬ VI — Hướng đi chung & Chỉ số Đồng thuận

Trả lời 3 việc Công nêu: (1) gộp 2 mockup có ra hướng chung không, (2) kết luận cần nhiều thông tin hơn, (3) % theo hướng nào phải chắc chắn.

---

## 1. Nguyên tắc để "% CHẮC CHẮN" là thật, không phải giả

Một con số % chỉ đáng tin khi nó đo **mức HAI HỆ ĐỘC LẬP cùng chỉ một hướng** — không phải khi nó trông chính xác. Bát Tự và Tử Vi tính hoàn toàn riêng; khi cả hai cùng chỉ "Quản lý", độ tin là THẬT vì hai đường độc lập gặp nhau. Vì vậy:

- **% = Mức Đồng Thuận** (agreement), KHÔNG gọi là "xác suất đúng nghề".
- Luôn kèm **bậc tin cậy** (Cao/Trung/Thấp) + **cờ dữ liệu** (nháp / đã calibrate).
- **Chưa calibrate thì vẫn hiện % nhưng ghi rõ "bản nháp"** — để không tạo cảm giác chắc chắn giả.

Đây là cách trung thực để cho ra một con số tự tin mà không nói dối.

---

## 2. Công thức tính Đồng thuận (0–100%)

Ba thành phần độc lập, cộng có trọng số:

```
AGREEMENT = 0.40 × Trùng_5_trục
          + 0.30 × Trùng_hướng_QuanLoc_KinhDoanh
          + 0.30 × Trùng_ngành
```

**a) Trùng 5 trục** = độ giống nhau giữa 2 vector 5 trục (Bát Tự vs Tử Vi).
Dùng cosine similarity của 2 vector đã chuẩn hóa → đổi ra 0–100. (Cùng xếp hạng trục cao/thấp → điểm cao.)

**b) Trùng hướng Quan lộc ↔ Kinh doanh** = so 2 giá trị axis (-100..+100).
```
same_side = (dấu BT == dấu TV) ? 100 : 0
closeness = 100 - |axis_BT - axis_TV|/2
Trùng_hướng = 0.6×same_side + 0.4×closeness
```

**c) Trùng ngành** = độ chồng của Top-6 nhóm ngành 2 hệ (Jaccard × 100), ưu tiên trùng ở nhóm "ưu tiên".

Ví dụ mockup: 0.40×88 + 0.30×82 + 0.30×80 = **84%**.

**Bậc tin cậy:**
- **CAO ≥ 75%** → 2 hệ hội tụ → kết luận 1 hướng, hiển thị radar hợp nhất.
- **TRUNG 50–74%** → đồng thuận một phần → nêu hướng chính + 1–2 lưu ý.
- **THẤP < 50%** → PHÂN KỲ → **KHÔNG chốt %**; trình bày cả 2 hướng (xem mục 4).

---

## 3. Cách gộp thành một hướng (khi Cao/Trung)

- **Vector hợp nhất** = trung bình 2 vector (có thể trọng số theo độ tin từng hệ) → 1 radar.
- **Trục Q↔K hợp nhất** = trung bình 2 axis.
- **Ngành hợp nhất** = ngành CẢ 2 HỆ cùng đề xuất xếp trên; ngành chỉ 1 hệ có → xếp dưới + ghi rõ nguồn (BT/TV).
- **Giai đoạn vàng** = quãng tuổi mà 2 timeline (Đại vận BT & Đại hạn TV) cùng bật một chủ đề sự nghiệp. **Hai timeline vẫn tính RIÊNG, chỉ đánh dấu vùng trùng — không gộp thành 1 vận.**

---

## 4. Khi PHÂN KỲ (Thấp) — không giấu, đọc theo tầng

Không ép 1 câu trả lời. Đọc theo mô hình "bản chất vs biểu hiện":
- **Bát Tự** thiên về *năng lực nền / cách tạo tiền thật* (Manh Phái tố công).
- **Tử Vi** thiên về *biểu hiện xã hội / hình ảnh nghề* (cung Quan Lộc, cách cục).

Ví dụ output phân kỳ: *"Bản chất có năng lực tự chủ/tạo tiền (Bát Tự → Kinh doanh) nhưng biểu hiện & môi trường thuận là đi tổ chức (Tử Vi → Quản lý). Gợi ý: đi tổ chức trước, tích lũy rồi chuyển kinh doanh."* Và ghi cờ ⚠ PHÂN KỲ thay vì một %.

---

## 5. KẾT LUẬN GIÀU THÔNG TIN — 8 mục (thay cho 1 dòng)

Khối kết luận mới gồm:
1. **Hướng chính** (1 câu mạnh).
2. **Độ tin cậy** (bậc + %).
3. **Thế mạnh lõi** (2–3 trục cả 2 hệ cùng xác nhận, kèm điểm).
4. **Điểm cần lưu / phân kỳ** (trục yếu hoặc chỗ 2 hệ lệch).
5. **Ngành hợp nhất** (giao 2 hệ).
6. **Giai đoạn vàng** (vùng đồng thuận thời vận).
7. **Khuyến nghị hành động** (học gì → làm gì → khi nào chuyển).
8. **Nguồn & cờ dữ liệu** (SOURCE / THIEN_ANH_MODEL / SUPPORTING_INFERENCE + nháp/calibrate).

(Xem hiển thị thực tế trong `bo-cuc-module-nghe-ket-hop.html`.)

---

## 6. Điều kiện để % được phép "khóa" thành chắc chắn

% chỉ chuyển từ "nháp" sang "đáng tin để công bố" khi:
1. Đã calibrate trọng số trên **≥20 lá số thật** (dùng khung Excel đã có).
2. Đo được: trên tập test, khi AGREEMENT ≥75% thì hướng nghề dự đoán KHỚP thực tế ở tỷ lệ Công thấy chấp nhận được.
3. Trước mốc đó: vẫn hiện %, nhưng luôn kèm dòng "bản nháp — chưa kiểm chứng".

Đây là cách duy nhất biến "% chắc chắn" thành sự thật thay vì cảm giác.

---

## 7. Việc cần bổ sung vào config/engine cho phần kết hợp

- Thêm khối `agreement` vào output engine chung (hoặc 1 "module đồng thuận" đọc cả 2 profile): lưu 3 điểm thành phần + tổng + bậc + cờ dữ liệu.
- `career_mapping.json`: thêm mục `agreement_weights` (0.40/0.30/0.30) + ngưỡng bậc (75/50) để KHÔNG hard-code trong code.
- Engine phải xuất luôn **lý do từng thành phần** (vì sao trùng/lệch) cho phần "Vì sao?".
