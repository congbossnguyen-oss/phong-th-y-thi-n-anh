# HƯỚNG DẪN CALIBRATE TRỌNG SỐ (≥20 lá số thật)

Mục tiêu: biến các trọng số *bản nháp* trong `career_mapping.json` và `domain_mapping_v1.2.json` thành trọng số *đã kiểm chứng*, dựa trên lá số thật có nghề nghiệp đã biết. Đây là việc của Công (chuyên gia) + dữ liệu, không phải việc Claude Code tự làm.

## Quy trình 6 bước

1. **Thu thập** — điền `calibration_template.xlsx`, sheet `1_ThuThap`: ngày giờ sinh + THỰC TẾ nghề nghiệp/ngành học/5 trục. Cần ≥20 người, càng đa dạng nghề càng tốt (đừng chỉ lấy người cùng ngành).
2. **Luận** — với mỗi người, chạy 4 engine (hoặc luận tay theo skill), điền sheet `2_LuanGiai_Model` cột Bát Tự / Manh Phái / Tử Vi / Tam Hợp.
3. **Chạy model** — cho engine Phase 1 tính ra `pred_domain_*`, `pred_vector`, `pred_authority_business_axis`; điền vào các cột nền cam.
4. **Đối chiếu** — so `pred_*` với `gt_*` (thực tế). Chấm `eval_domain_hit`, `eval_vector_khop`, `eval_phan_ky`.
5. **Chỉnh trọng số** — nhìn các dòng lệch nhiều: nếu 1 archetype/cơ chế liên tục đẩy sai domain so với thực tế, chỉnh điểm domain hoặc vector của nó. Chỉnh 1 chút, chạy lại, KHÔNG chỉnh dựa trên 1 ca duy nhất (spec Phase 5).
6. **Khóa** — khi tỷ lệ `eval_domain_hit = Cao` đạt mức Công thấy chấp nhận được trên cả 20 ca, mới đổi trạng thái file từ `DRAFT_FOR_CALIBRATION` → production, và lúc đó mới bàn tới việc quy về thang 0–100.

## Chỉ số theo dõi

- **Domain hit rate**: bao nhiêu % ca có ít nhất 1 domain thực tế nằm trong nhóm `priority`+`suitable` model dự đoán.
- **Vector correlation**: 5 trục model dự đoán có cùng thứ hạng với 5 trục thực tế không.
- **Tỷ lệ phân kỳ**: bao nhiêu ca 2 hệ mâu thuẫn — nếu quá cao, xem lại luật `neutralize_and_flag`.

## Lưu ý đạo đức khi thu thập

- Với người trẻ/trẻ em: chỉ ghi thực tế học/nghề, KHÔNG gán nhãn "tầng phú quý".
- Ẩn danh được thì ẩn — chỉ cần ngày giờ sinh + thực tế nghề là đủ calibrate.
- Ghi rõ `gt_do_tin_cay`: thông tin tự khai đáng tin hơn suy đoán của người thân.
