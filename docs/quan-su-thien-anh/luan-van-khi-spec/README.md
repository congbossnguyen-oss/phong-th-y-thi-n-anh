# README — Bàn giao cho Claude Code: `luan-van-khi`

Build module **luận vận khí Đại Vận & Lưu Niên** cho app điện thoại phongthuythienanh.com. Người dùng nhập ngày giờ sinh → app chấm điểm 4 lĩnh vực (Quan vận, Tài vận, Sức khỏe, Tình duyên) theo từng Đại Vận 10 năm + từng Lưu Niên, kèm lời luận ngắn do AI viết.

## Nội dung gói
- `SPEC.md` — đặc tả kỹ thuật đầy đủ. **Đọc kỹ trước.**
- `data/config-linh-vuc.json` — mapping 4 lĩnh vực → Thập Thần + logic cộng/trừ điểm + thang nhãn + **ràng buộc an toàn nội dung** (từ khóa cấm, quy tắc diễn đạt).

## Thứ tự việc cần làm

1. **DÒ 2 thứ đã có trong repo (BAO TRÙM, không dựng song song):**
   - Module lập lá số Bát Tự (ra 4 trụ, tàng can, Thập Thần, Đại Vận, Lưu Niên).
   - Engine `bat-tu-engine` (vượng suy + dụng thần). Nếu chưa merge vào repo → build nó trước theo SPEC riêng đã bàn giao, module này GỌI LẠI, không tự tính vượng suy/dụng thần.
   Xác định I/O của cả 2, viết adapter nếu cần.

2. **Build tầng động** (SPEC mục 2): với mỗi Đại Vận/Lưu Niên, ghép Can-Chi vào cục, áp Tầng Thứ, tính lại vượng suy/dụng thần tại thời điểm (chỉ đổi nếu nguyên cục Nhóm 1/2).

3. **Build tầng chấm điểm** (SPEC mục 3): 0-10 mỗi lĩnh vực, khởi điểm 5, cộng/trừ theo `config-linh-vuc.json`. Thu thập `canCu[]`.

4. **Build tầng AI** (SPEC mục 4): gọi Claude API viết lời luận TỪ điểm + canCu. Prompt phải nhúng toàn bộ quy tắc an toàn. **Bắt buộc có hậu kiểm** (quét từ khóa cấm sau khi AI trả).

5. **An toàn nội dung** (SPEC mục 5) — ràng buộc CỨNG, không nới. Đây là app người dùng cuối tự đọc, không có thầy lọc. Không phán chết/ly hôn/phá sản/bệnh danh/tù tội.

6. **Test Vitest** (SPEC mục 7): case lá số mẫu + 3 case an toàn nội dung (bắt buộc) + 3 case nhánh.

7. **Không vượt phạm vi** (SPEC mục 8).

## Vị trí đặt module
Repo đã tách engine thành packages (`rule-engine`, `trachnhat-engine`, `calendar-core`, `bat-tu-engine`, `engine-contract`). Đặt `luan-van-khi` cùng cấp hoặc theo convention hiện có — Claude Code tự quyết theo repo. Tuân `engine-contract` nếu repo dùng chuẩn hóa I/O.

## Nguyên tắc quan trọng
- **Engine tính số, AI chỉ diễn giải từ số** — ranh giới rạch ròi, AI không tự tính/tự phán.
- **Tái dùng, không dựng song song** — nền vượng suy/dụng thần của 1 người phải giống hệt giữa module này và các module khác (nguyên tắc bao trùm anh đã áp cho module Khai Trương).
- **An toàn nội dung là ràng buộc cứng** — chấm mức độ thuận lợi để người dùng chủ động chuẩn bị, KHÔNG đóng vai thầy bói phán sự kiện.
- Nguồn logic là skill Bát Tự (`ung-ky.md`, `quan-he-can-chi.md`, `tai-van.md`, `quan-van.md`, `benh-tat.md`, `hon-nhan.md`, `dung-than.md`, `vuong-suy.md`). Không thêm quy tắc ngoài nguồn; thiếu căn cứ → điểm trung tính 5 + ghi rõ.
