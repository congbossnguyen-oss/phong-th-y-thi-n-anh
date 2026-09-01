# content-bat-tu — Dữ liệu tĩnh + Prompt cho module Luận Giải Bát Tự Toàn Diện

Đây là kết quả của "Bước 0" (xuất nội dung từ skill Claude thành file tĩnh) đã làm sẵn. Đưa thư mục này (nguyên vẹn) vào repo web/app tại đường dẫn `content/bat-tu/` — Claude Code chỉ cần đọc và code Tầng 1 (Findings Engine đọc data/), Tầng 2 (AI Narrative dùng prompts/ + đọc knowledge/), Tầng 3 (hậu kiểm dùng data/content-safety-full.json) theo đúng SPEC.md trong gói `luan-giai-toan-dien.zip`.

## Cấu trúc

- `knowledge/` — 22 file .md nguyên văn nội dung Bát Tự (Lục Thân, Hôn Nhân, Tài Vận, Quan Vận, Sức Khỏe, Thần Sát, Thập Thần, Tính Cách...). Dùng làm system prompt cho Tầng 2 AI. Mỗi file có ghi ngày đồng bộ ở đầu.
- `data/` — dữ liệu bảng tra cứu dạng JSON, dùng cho Tầng 1 (Findings Engine):
  - `nap-am.json` — bảng Nạp Âm 60 Giáp Tý.
  - `mo-kho.json` — bảng Mộ Khố theo hành.
  - `quan-he-can-chi.json` — bảng hợp/xung/hình/hại/phá Địa Chi + hợp hóa Thiên Can.
  - `than-sat.json` — 45 công thức xác định Thần Sát (còn 1 sao "Đức Tú" chưa có công thức, không đưa vào).
  - `dung-than-nghe-nghiep-phuong-huong.json` — bảng nghề nghiệp/phương hướng/màu sắc theo Dụng Thần.
  - `content-safety-full.json` — (đã có sẵn trong gói `luan-giai-toan-dien.zip`, không lặp lại ở đây) toàn bộ ràng buộc an toàn nội dung + từ điển thay thế ngôn từ.
- `prompts/` — prompt mẫu cho AI (chỉ dùng khi khách đã đăng nhập + thanh toán đúng tầng):
  - `khung-chung.md` — prompt khung dùng chung mọi giai đoạn.
  - `giai-doan-A-L.md` — bảng ánh xạ + prompt riêng từng giai đoạn, **đã chia rõ 2 tầng**: **Luận Cơ Bản** (A,B,C,G,H,J,L — 7 giai đoạn) và **Luận Nâng Cao** (D,E,F,I,K — 5 giai đoạn, kèm 2 lượt "kiểm duyệt viên" cho F/I). 2 tầng bán tách biệt, thanh toán riêng.
  - `free-template.md` — **bản Free, KHÔNG gọi AI** — thuần template điền chỗ trống bằng code, chi phí ~0, mở tự do không cần đăng nhập.

## Phần CHƯA làm — Claude Code cần tự bổ sung khi build

- **Cách Cục** (`cach-cuc.md` — 10 mô hình Tài Quan biến hóa, `cach-cuc-dac-biet.md` — Tòng/Hóa Khí): 2 file này vẫn ở dạng .md trong `knowledge/`, CHƯA được code hóa thành JSON điều kiện vì bản chất là chuỗi điều kiện phức tạp, mang tính xét đoán (dòng chảy ngũ hành, lực lượng tương đối) khó quy về true/false đơn giản mà không rủi ro sai. Gợi ý: Giai đoạn A (Tầng 1) chỉ cần trả `chuaXacDinh: true` cho phần Cách Cục, để Tầng 2 AI tự đọc `cach-cuc.md`/`cach-cuc-dac-biet.md` và đưa ra nhận định — đây là lựa chọn thiết kế an toàn hơn ép code hóa sai.
- **Đại Vận trọn đời (Giai đoạn K)**: cần logic gọi lại `bat-tu-engine` cho từng Đại Vận — đây là code thật (không phải dữ liệu tĩnh), phải viết theo SPEC mục 2 phần K.
- **Lục Thân/Hôn Nhân/Sức Khỏe (Giai đoạn F/H/I)**: theo đúng thiết kế trong SPEC, phần "mẫu computable" (ví dụ "Tài nhiều → khắc mẹ") có thể code hóa thêm nếu muốn, nhưng KHÔNG bắt buộc — để Tầng 2 AI đọc trực tiếp `luc-than.md`/`hon-nhan.md`/`benh-tat.md` (đã có trong `knowledge/`) và tự diễn giải từ Tứ Trụ + findings A-E cũng là phương án hợp lệ, đã được SPEC cho phép (mục 7 "Ranh giới phạm vi").

## Đồng bộ lại khi skill thay đổi

Ngày đồng bộ hiện tại: **2026-08-25**. Mỗi lần nội dung skill `luan-giai-bat-tu` được Công/Claude cập nhật sau ngày này, cần xuất lại toàn bộ thư mục `knowledge/` (và rà lại `data/` nếu bảng tra cứu bị đổi) — nhờ Claude (trong phiên có quyền truy cập skill) làm lại thao tác này, không tự sửa tay để tránh sai lệch.
