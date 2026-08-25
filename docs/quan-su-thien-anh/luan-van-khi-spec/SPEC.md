# SPEC — `luan-van-khi`: Luận Vận Khí Đại Vận & Lưu Niên (app điện thoại)

Module cho app điện thoại của phongthuythienanh.com. Người dùng nhập ngày giờ sinh → app hiển thị **vận khí theo Đại Vận 10 năm + từng Lưu Niên**, chấm điểm 4 lĩnh vực (**Quan vận, Tài vận, Sức khỏe, Tình duyên**) kèm lời luận ngắn.

Nguồn logic: skill `luan-giai-bat-tu` — `ung-ky.md`, `quan-he-can-chi.md` (mục 4 Tầng Thứ), `tai-van.md`, `quan-van.md`, `benh-tat.md`, `hon-nhan.md`, `dung-than.md`, `vuong-suy.md`. SPEC này là bản code hóa; khi mâu thuẫn, ưu tiên file gốc.

Kiến trúc chốt (theo yêu cầu chủ sở hữu):
- Đầu ra mỗi lĩnh vực = **điểm số (0-10) + đoạn luận ngắn**.
- Phạm vi = **cả tổng quan Đại Vận 10 năm + chi tiết từng Lưu Niên**.
- **Engine (code) tính hết điểm số + căn cứ → tầng AI (Claude API) chỉ viết lời luận tự nhiên TỪ số đó.** AI không tự tính, không tự phán sự kiện.

---

## 0. NGUYÊN TẮC THIẾT KẾ (đọc trước)

1. **BAO TRÙM — không dựng engine song song.** Module này PHẢI tái dùng:
   - Module lập lá số hiện có (ra 4 trụ, tàng can, Thập Thần, Đại Vận, Lưu Niên — như ảnh `battu.png`).
   - Engine vượng suy + dụng thần đã có/đang build (`bat-tu-engine` — SPEC riêng đã bàn giao). Nếu chưa merge, build nó trước, module này gọi lại, KHÔNG tự tính vượng suy/dụng thần lần nữa.
   Việc đầu tiên khi build: dò 2 thứ trên trong repo, xác định I/O, gọi lại. base-data/config chỉ để BÙ phần còn thiếu.

2. **Engine tính → AI diễn giải, ranh giới rạch ròi.** Engine xuất object số + mảng căn cứ (`canCu[]`). AI nhận object đó, viết prose. AI **không được** đưa ra kết luận nằm ngoài căn cứ engine cấp, không tự thêm sự kiện, không đổi điểm.

3. **AN TOÀN NỘI DUNG LÀ RÀNG BUỘC CỨNG** (đây là app người dùng cuối tự đọc, KHÔNG có thầy lọc). Toàn bộ mục 5 phải được thực thi ở cả tầng engine (nhãn) lẫn tầng AI (prompt + hậu kiểm). Từ khóa cấm trong `config-linh-vuc.json > content_safety`.

4. **Không bịa ngoài nguồn.** Gặp trường hợp file gốc không phủ → điểm về mức trung tính (5) + ghi `canCu` là "không đủ dấu hiệu rõ", KHÔNG bịa.

---

## 1. LUỒNG XỬ LÝ TỔNG

```
Input: ngày giờ sinh + giới tính
  → [module lập lá số hiện có]  → Tứ Trụ + tàng can + Thập Thần + danh sách Đại Vận + Lưu Niên
  → [bat-tu-engine]             → vượng suy nguyên cục + Dụng/Hỷ/Kỵ/Cừu Thần gốc + nhóm (1/2/3)
  → [luan-van-khi: TẦNG ĐỘNG]  → với mỗi Đại Vận & mỗi Lưu Niên:
        (a) tính lại vượng suy + Dụng Thần TẠI thời điểm đó (nếu nhóm 1/2)
        (b) chấm 0-10 cho 4 lĩnh vực + thu thập canCu[]
        (c) map nhãn an toàn
  → [tầng AI]                  → viết lời luận ngắn từ điểm + canCu (tuân content_safety)
  → Output: JSON cho app render
```

---

## 2. TẦNG ĐỘNG — TÍNH LẠI VƯỢNG SUY/DỤNG THẦN THEO THỜI ĐIỂM

Nguồn: `dung-than.md` mục 2 + `vuong-suy.md` mục 5.

Với mỗi Đại Vận (10 năm) và mỗi Lưu Niên (1 năm):
1. Ghép Can-Chi của Đại Vận (và Lưu Niên) vào nguyên cục như "trụ thứ 5/6 tạm thời".
2. Áp quy tắc **Tầng Thứ** (`quan-he-can-chi.md` mục 4): Lưu Niên > Đại Vận > Mệnh cục (Nguyệt Chi cao nhất nội bộ). Xác định xung/hợp/hình/hại/hội nào **thực sự có hiệu lực** (một quan hệ trong nguyên cục có thể đã bị Đại Vận "giải" trước → không còn ứng).
3. Tính lại độ vượng suy Nhật Chủ tại thời điểm đó (gọi lại logic `bat-tu-engine` với cục đã thêm trụ tuế vận).
   - Nếu nguyên cục thuộc **Nhóm 1 hoặc 2** (`vuong-suy.md` mục 5): Dụng Thần CÓ THỂ đổi → tính lại Dụng/Hỷ/Kỵ tại thời điểm.
   - Nếu **Nhóm 3** (cực vượng/cực nhược): giữ Dụng Thần gốc xuyên suốt (chỉ đổi nếu cấu trúc bị phá vỡ hoàn toàn — hiếm).

Kết quả trung gian mỗi mốc thời gian:
```ts
interface TrangThaiThoiDiem {
  loai: 'DaiVan' | 'LuuNien';
  canChi: { can: string; chi: string };
  namBatDau?: number;  // ĐV
  nam?: number;        // LN
  vuongSuyTaiThoiDiem: string;   // cấp độ
  dungThanTaiThoiDiem: string;   // hành
  hyThan: string; kyThan: string;
  quanHeKichHoat: string[];      // các xung/hợp/hình/hại/hội đang có hiệu lực (sau Tầng Thứ)
}
```

---

## 3. CHẤM ĐIỂM 4 LĨNH VỰC (0-10 mỗi lĩnh vực, mỗi mốc thời gian)

Dùng `config-linh-vuc.json > linh_vuc`. Với mỗi lĩnh vực, mỗi mốc (ĐV hoặc LN):

**Thuật toán chấm** (khởi điểm 5 = bình hòa, cộng/trừ theo dấu hiệu):
```
diem = 5
với mỗi dấu hiệu trong cong_diem_khi[lĩnh vực] mà thỏa tại thời điểm này:
    diem += trọng số (mặc định +1, dấu hiệu mạnh +2)
với mỗi dấu hiệu trong tru_diem_khi[lĩnh vực] mà thỏa:
    diem -= trọng số (mặc định -1, dấu hiệu mạnh -2)
clamp(diem, 0, 10)
```

**Dấu hiệu "thỏa" được xác định thế nào** — dựa trên `quanHeKichHoat` + Thập Thần mà Đại Vận/Lưu Niên mang tới + Dụng/Kỵ Thần tại thời điểm:
- Ví dụ Tài vận: nếu Lưu Niên mang Thập Thần = Chính/Thiên Tài VÀ vượng suy tại thời điểm là Vượng trở lên VÀ Tài là Hỷ/Dụng → khớp "Lưu Niên mang Tài tinh khi Thân vượng" → +2.
- Ví dụ Sức khỏe: nếu `quanHeKichHoat` chứa "Thiên Khắc Địa Xung với Nhật Can" HOẶC "Tuế Vận cùng gặp" → khớp tru_diem → -2.
- Ví dụ Tình duyên (Nam): nếu Lưu Niên Chi hợp với Chi Ngày (cung Thê) VÀ hành hợp ra là Tài Hỷ Thần → +2; nếu Lưu Niên Chi xung/hình/hại Chi Ngày → -2.

**Giới tính chi phối Tình duyên**: Nam dùng `thap_than_lien_quan_nam` (Tài), Nữ dùng `thap_than_lien_quan_nu` (Quan Sát).

Mỗi lĩnh vực xuất:
```ts
interface DiemLinhVuc {
  linhVuc: 'tai_van'|'quan_van'|'suc_khoe'|'tinh_duyen';
  diem: number;         // 0-10
  nhan: string;         // từ thang_nhan
  canCu: string[];      // liệt kê dấu hiệu đã cộng/trừ — AI dùng cái này để viết luận, KHÔNG bịa thêm
}
```

**Tổng quan Đại Vận 10 năm**: điểm mỗi lĩnh vực của cả ĐV = điểm tính ở mốc Đại Vận (trạng thái nền 10 năm). Từng Lưu Niên trong ĐV đó tính riêng (nền ĐV + tác động năm). App hiển thị: 1 thẻ tổng quan ĐV + 10 thẻ năm.

---

## 4. TẦNG AI — VIẾT LỜI LUẬN (Claude API)

AI nhận JSON `{trangThai, 4 điểm lĩnh vực + canCu}` cho mỗi mốc, viết đoạn luận ngắn mỗi lĩnh vực (2-4 câu).

**Prompt bắt buộc chứa:**
- "Chỉ diễn giải từ `canCu` được cung cấp. KHÔNG thêm sự kiện, con số, hay dự đoán nằm ngoài căn cứ này."
- Toàn bộ `content_safety.quy_tac_dien_dat` (mục 5).
- "Giọng văn: điềm đạm, khích lệ, thực tế. Đóng khung mọi điều là XU HƯỚNG cần lưu ý, không phải điều chắc chắn."
- Xưng hô AI: theo persona site đã dùng (nếu chưa có, để trống — chủ sở hữu quyết sau).

**Hậu kiểm (code, sau khi AI trả):** quét output AI, nếu chứa bất kỳ từ trong `tu_khoa_cam_tuyet_doi` → chặn, yêu cầu AI viết lại hoặc thay bằng câu mẫu an toàn tương ứng mức điểm. Đây là lưới an toàn tầng 2, bắt buộc có.

---

## 5. AN TOÀN NỘI DUNG (RÀNG BUỘC CỨNG — không được nới)

Toàn bộ `config-linh-vuc.json > content_safety` là bắt buộc. Tóm tắt điểm sống còn:
- **KHÔNG** ngôn ngữ tiên tri cái chết, ly hôn, phá sản, bệnh danh, tù tội, vô sinh — kể cả khi điểm rất thấp.
- Điểm thấp → diễn đạt thành "giai đoạn cần thận trọng / giữ gìn / vun đắp", đóng khung xu hướng.
- Điểm cao → "thuận lợi cho", "thời điểm tốt để", KHÔNG hứa hẹn tuyệt đối.
- **Disclaimer bắt buộc hiển thị** trên mỗi kết quả: nội dung `content_safety.disclaimer_bat_buoc`.
- Sức khỏe điểm thấp: luôn kèm gợi ý khám sức khỏe định kỳ (chung chung), không nêu bộ phận/bệnh cụ thể gây hoang mang.

Lý do (ghi để người bảo trì hiểu, không được tự ý gỡ): app không có chuyên gia đứng giữa lọc, người dùng đọc thẳng — một câu phán "năm X có tang" hoặc "năm Y ly hôn" có thể gây tổn hại tâm lý thật. Module chấm mức độ thuận lợi để người dùng chủ động chuẩn bị, KHÔNG đóng vai thầy bói phán sự kiện.

---

## 6. ĐẦU RA CHO APP

```ts
interface VanKhiOutput {
  laSo: { /* 4 trụ, để app hiển thị lại */ };
  danhSachDaiVan: Array<{
    canChi: string; tuoiBatDau: number; namBatDau: number;
    tongQuan: DiemLinhVuc[];   // 4 lĩnh vực, mức nền 10 năm
    luuNien: Array<{
      nam: number; tuoi: number; canChi: string;
      diemCacLinhVuc: DiemLinhVuc[];   // 4 lĩnh vực
      loiLuan: { tai_van: string; quan_van: string; suc_khoe: string; tinh_duyen: string }; // từ AI
    }>;
  }>;
  disclaimer: string;
}
```

---

## 7. KIỂM THỬ (Vitest)

**Case gốc — lá số `battu.png`** (Dương Nam, 10:00 15/6/1990, Nhật Chủ Tân Kim nhược):
- Chọn 1 Đại Vận + vài Lưu Niên, assert: điểm 4 lĩnh vực ∈ [0,10]; `canCu` không rỗng khi điểm ≠ 5; nhãn map đúng thang.
- Ví dụ kiểm định hướng (đối chiếu tay, không hardcode tuyệt đối): Đại Vận Hỏa mạnh (Bính Tuất/Đinh Hợi) → Quan Sát Hỏa vượng khắc Tân Kim nhược → Sức khỏe + Quan vận điểm dưới trung bình; Đại Vận/Lưu Niên Thổ (Ấn) hoặc Kim (Tỷ Kiếp) → Thân được trợ → điểm khá hơn.

**Case an toàn nội dung (BẮT BUỘC):**
1. Ép 1 mốc có điểm Sức khỏe = 0 → assert lời luận AI KHÔNG chứa từ cấm, CÓ gợi ý khám định kỳ chung.
2. Ép 1 mốc Tình duyên = 0 → assert không có "ly hôn/chia tay/mất", có ngôn ngữ "vun đắp/thử thách".
3. Test hậu kiểm: đưa 1 đoạn AI giả có từ "ly hôn" → assert bị chặn/thay thế.

**Các case nhánh:**
4. Nguyên cục Nhóm 1 → Dụng Thần đổi giữa 2 Đại Vận khác nhau (kiểm tầng động hoạt động).
5. Nguyên cục Nhóm 3 (Tòng cách) → Dụng Thần giữ nguyên xuyên suốt.
6. Nam vs Nữ cùng lá số → Tình duyên chấm theo Thập Thần khác nhau (Tài vs Quan Sát).

---

## 8. RANH GIỚI PHẠM VI (không làm lần này)

- KHÔNG lập lá số (đã có module).
- KHÔNG tự tính vượng suy/dụng thần (gọi `bat-tu-engine`).
- KHÔNG luận các lĩnh vực ngoài 4 cái đã chốt (quan/tài/sức khỏe/tình duyên).
- KHÔNG phán sự kiện cụ thể — chỉ chấm mức độ thuận lợi + luận xu hướng.
- Gặp trường hợp nguồn không phủ → điểm trung tính 5 + ghi rõ, KHÔNG bịa.
