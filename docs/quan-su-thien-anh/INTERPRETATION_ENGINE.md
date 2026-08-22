# INTERPRETATION ENGINE — Quân Sư Thiên Anh (Phase 3)

Tầng biến 1 quẻ đã lập (cấu trúc) thành **KẾT QUẢ QUÂN SƯ** — bài luận đời thường + luận giải chi tiết. Đây là nơi DUY NHẤT gọi LLM lúc chạy.

> ⚠️ **LLM không tự tính quẻ.** LLM chỉ đọc `QuanSuInterpretationPayload` (quẻ do engine tính, xem `ICHING_OUTPUT_SCHEMA.md`) + bộ quy tắc luận + tài liệu tham chiếu. Mọi con số đến từ engine.

## 1. Đầu vào (payload có cấu trúc)

`QuanSuInterpretationPayload` (từ `src/lib/quan-su/divination.ts`):
- `question`: id, nhóm, tiêu đề, `output_type`, `safety_level`, **`dung_than_hint`** (Dụng Thần gợi ý theo nhóm — Lớp 3 rule-based).
- `cast`: `FullCastResult` nguyên văn engine (quẻ chủ/biến/hỗ, 6 hào đầy đủ, Can Chi, Tuần Không, vượng suy, quan hệ Nhật/Nguyệt...).
- `van_trinh`: sơ đồ vận trình Bát Tự/Tử Vi (nếu có) — timeline đại vận/lưu niên gắn nhãn tốt/xấu.
- `meta`: thời điểm gieo, phương pháp.

## 2. Tài liệu tham chiếu LLM nạp (theo nhóm, không nhồi hết)

Theo `LUAN_QUE_LUC_HAO_SPEC.md` §8 (retrieval theo domain) — chỉ nạp phần liên quan câu hỏi:
- **Luôn nạp:** quy trình 10 bước luận cát hung (spec §5), 8 quy luật Ứng Kỳ (spec §6), thủ tượng + nguyên tắc hóa giải + guardrail đạo đức (spec §7).
- **Nạp theo nhóm:** bảng Dụng Thần + khung riêng của nhóm (spec §4.1–4.9: hợp tác §4.3, vay/đòi nợ §4.4, tình duyên §4.5, xuất hành §4.6, thi đấu §4.7, A/B/C §4.9). `dung_than_hint.ref` trỏ đúng mục.
- **Bộ quy tắc của Thầy:** `KINH_DICH_INTERPRETATION_TEMPLATE.md` — Phần C (phối hợp quẻ × vận trình), Phần D (giọng văn), Phần E (ví dụ mẫu — dùng làm few-shot khi Thầy điền xong).

## 3. Quy trình luận (LLM chạy trên payload)

1. **Chốt Dụng Thần**: từ `dung_than_hint` + dữ liệu quẻ. Nếu lưỡng hiện (2 hào cùng Lục Thân) → chọn theo spec §4.2 (động > tĩnh, không Không/Phá, Xung/Hợp, lâm Thế...). Khung đặc biệt (Thế-Ứng, 2 bước, 4 Dụng thần) theo đúng mục spec.
2. **Luận cát hung** theo 10 bước (spec §5): vượng/suy Dụng Thần, Không Vong thật/giả, Nguyên Thần, Kỵ Thần, Nhật/Nguyệt, động tĩnh, hợp/xung cục → tổng hợp. Chỉ dùng dữ liệu engine cung cấp; yếu tố engine chưa tính (Tam Hợp cục, Tam Hình, Nhập Mộ — xem `ICHING_OUTPUT_SCHEMA.md` §5) thì nói rõ "chưa xét", KHÔNG tự bịa.
3. **Nguyên nhân cốt lõi** (thủ tượng, spec §7.1): diễn giải hào/Lục Thú thành sự việc đời thực.
4. **Ứng Kỳ** (spec §6): nếu câu hỏi cần "khi nào".
5. **Phối với sơ đồ vận trình** (Phần C của template): nếu có `van_trinh` — quẻ là tiếng nói chính cho SỰ VIỆC, vận trình là phông nền. Khi lệch nhau → "đọc theo tầng", không ép 1 kết luận (theo mẫu module "Định Hướng Nghề Nghiệp").
6. **Kết luận + hóa giải/hành động** (spec §7.2 + guardrail): chỉ hóa giải khi thật sự có vấn đề; luôn giữ giọng "tham khảo".

## 4. Đầu ra — 2 lớp

### Lớp 1 — KẾT QUẢ QUÂN SƯ (hiện trước, cho mọi người)
Bài luận **Mở bài / Thân bài / Kết luận**, giọng **"quân sư đồng hành"**, KHÔNG thuật ngữ (theo `KINH_DICH_INTERPRETATION_TEMPLATE.md` Phần D). Khớp `output_schema` ở `QUESTION_SCHEMA.md` §3:

```typescript
interface OutputSchema {
  mo_bai: string;    // tóm tắt: hỏi gì, nhìn chung thuận hay không
  than_bai: string;  // phân tích chi tiết bằng lời thường (dịch hết thuật ngữ)
  ket_luan: { cau_tra_loi; khuyen_nghi_hanh_dong; thoi_diem_de_xuat|null; luu_y[]; };
}
```

- Với `output_type = "so-sanh-phuong-an"` (nhóm Quyết định): so sánh các phương án đã gieo riêng, chỉ ra phương án nào hơn + vì sao.
- Với `safety_level` cao/nhạy cảm: `luu_y[]` bắt buộc có câu an toàn tương ứng (bác sĩ / luật sư / không cam kết lợi nhuận).

### Lớp 2 — Luận giải chi tiết (bấm mới mở)
Bảng quẻ kỹ thuật (từ `cast`) + các bước luận có thuật ngữ, cho người muốn đào sâu.

## 5. Hạ tầng — tái dùng `chart-profile/`, KHÔNG xây lại

Module dự kiến: `src/lib/quan-su/interpretation-engine.ts` (phase build). Tái dùng từ `src/lib/chart-profile/`:
- `llm.ts` — gọi LLM.
- `cache.ts` — cache theo hash (khóa nên gồm: 6 hào + Can Chi ngày gieo + question_id → cùng quẻ + cùng câu hỏi = cùng kết quả, tiết kiệm chi phí khi xem lại).
- `ghi-log-chi-phi.ts` — log chi phí LLM mỗi lượt (quan trọng cho `pricing_tier`).
- `knowledge.ts` — nạp tài liệu tham chiếu (ở đây là spec Kinh Dịch + template của Thầy, KHÁC `handoff/knowledge/*` vốn cho nghề nghiệp).

## 6. Việc còn chờ trước khi build thật (Phase 4)

1. **Thầy điền Phần E** (`KINH_DICH_INTERPRETATION_TEMPLATE.md`) — vài quẻ mẫu đã luận, làm few-shot + bộ đối chiếu chất lượng. **Quan trọng nhất** — không có thì khó chỉnh giọng/độ chính xác của LLM.
2. Bổ sung các hàm còn thiếu vào `luc-hao.ts` nếu thấy cần (Tam Hợp cục, Nhập Mộ...) — deterministic, không giao LLM.
3. Viết `interpretation-engine.ts` thật + prompt, nối `divination.ts` → LLM → `advisory_reports`.
4. Đối chiếu kết quả LLM với ví dụ mẫu Phần E trước khi mở cho khách; nhóm nhạy cảm (sức khỏe/kiện tụng/tài chính) review kỹ, không mở đại trà cùng lúc.

## 7. Nguyên tắc bất biến (nhắc lại)

- LLM **không tính quẻ** — engine tính, LLM đọc.
- Thiếu dữ liệu (engine chưa tính) → nói rõ, **không bịa**.
- Kết quả cho khách: giọng đời thường, không thuật ngữ; thuật ngữ chỉ nằm ở lớp "luận giải chi tiết".
- Guardrail đạo đức (spec §7.2): không sát sinh/bùa hại người; luôn khuyên bác sĩ khi sức khỏe nghiêm trọng; không luận mập mờ giữ khách; nói "chưa chắc chắn" khi thiếu dữ kiện.
