# BỘ GIAO CLAUDE CODE — Module Định hướng Nghề nghiệp (Bát Tự × Tử Vi)
### Đọc file này TRƯỚC. Đây là đầu mối duy nhất — có đủ mọi thứ.

Trả lời câu "đủ chưa": **cả thư mục này là đủ.** Không cần file nào ngoài đây.

---

## A. TRONG BỘ NÀY CÓ GÌ (bản đồ thư mục)

```
handoff/
├── README-GIAO-CLAUDE-CODE.md   ← file này
├── knowledge/                   ← nguồn kiến thức (4 skill) — engine đọc lúc luận
│   ├── luan-giai-bat-tu/
│   ├── luan-giai-bat-tu-manh-phai/
│   ├── luan-giai-tu-vi-nam-phai/
│   └── luan-giai-tu-vi-tam-hop-phai/
├── config/                      ← bảng số, engine đọc (KHÔNG hard-code)
│   ├── career_mapping.json          (5 trục nghề)
│   ├── domain_mapping.json          (ngành + luật 3+3+3)
│   ├── bat_tu_nganh_ngu_hanh.json   (Dụng thần → ngành)
│   └── tu_vi_sao_nganh.json         (chính tinh → ngành)
├── scripts/
│   └── validate_mapping.py      ← kiểm 2 file mapping khớp nhau
├── docs/                        ← BẢN VẼ để Claude Code làm theo (không chạy production)
│   ├── module-nghe-bat-tu.md        (engine + logic + prompt Bát Tự)
│   ├── module-nghe-tu-vi.md         (engine + logic + prompt Tử Vi)
│   ├── ket-hop-2-he.md              (cách tính % đồng thuận + kết luận 8 mục)
│   ├── mockup-bat-tu.html           (bố cục)
│   ├── mockup-tu-vi.html            (bố cục)
│   └── mockup-ket-hop.html          (bố cục màn kết hợp)
└── calibration/                 ← để DÀNH Phase 5 (chưa dùng ngay)
    ├── calibration_template.xlsx
    └── huong-dan-calibrate.md
```

---

## B. CÔNG PHẢI TỰ LÀM ĐÚNG 3 VIỆC

1. **Bỏ cả thư mục `handoff/` vào repo website** (giữ nguyên cấu trúc con). Giải nén sẵn `knowledge/` là xong — không phải làm gì thêm với nó.
2. **Mở Claude Code ngay trong thư mục repo** đó.
3. **Dán prompt** ở mục C. Máy tự tìm engine lập lá số sẵn có; nếu không thấy nó sẽ hỏi.

Ngoài 3 việc trên, Công KHÔNG phải viết code hay tạo engine gì — Claude Code viết engine trong repo.

---

## C. PROMPT DÁN CHO CLAUDE CODE

```
Xây MODULE con "Định hướng Nghề nghiệp (Bát Tự × Tử Vi)" trong website hiện tại.
KHÔNG tạo web mới, KHÔNG phá engine hiện có. Đọc trước toàn bộ thư mục handoff/docs.

KIẾN TRÚC BẮT BUỘC (bếp trung tâm):
- ENGINE CHUNG "chart-profile": nhận ngày giờ sinh + giới tính -> gọi engine lập lá số
  SẴN CÓ trong repo (tự tìm, tái sử dụng, KHÔNG viết lại an sao) -> luận bằng cách GỌI LLM
  nạp handoff/knowledge/* -> trả HỒ SƠ LÁ SỐ gồm 2 khối bat_tu_profile + tu_vi_profile
  (schema trong docs/module-nghe-bat-tu.md và module-nghe-tu-vi.md). Cache theo hash lá số.
- 3 MODULE tiêu thụ hồ sơ, KHÔNG tự luận huyền học, chỉ đọc config + vẽ:
  (1) Nghề theo Bát Tự  (2) Nghề theo Tử Vi  (3) Kết hợp/đồng thuận (docs/ket-hop-2-he.md).

RÀNG BUỘC:
- LLM chỉ dùng tri thức trong handoff/knowledge; thiếu -> "insufficient_data", không bịa.
- Đọc mọi bảng số từ handoff/config (KHÔNG hard-code). Chạy scripts/validate_mapping.py
  phải báo "khớp tuyệt đối" mới build tiếp.
- career_vector chỉ từ career_mapping.json; domain/major chỉ từ domain_mapping.json.
- Bát Tự chọn ngành theo DỤNG/HỶ THẦN (không theo hành Nhật chủ); Tử Vi theo chính tinh
  Quan Lộc (nặng hơn Mệnh) + archetype. Hiệu suất/độ sáng chỉ đổi ĐỘ MẠNH, không đổi hướng.
- 2 timeline (Đại vận Bát Tự / Đại hạn Tử Vi) tính ĐỘC LẬP; chỉ đánh dấu vùng đồng thuận,
  KHÔNG gộp thành 1 vận. Không thêm trường phái Tứ Hóa khác.
- % đồng thuận = mức 2 hệ cùng hướng (công thức trong ket-hop-2-he.md), luôn kèm bậc tin cậy
  và cờ "bản nháp — chưa calibrate". Chưa được quy 0-100 tuỳ tiện.
- Mọi kết luận gắn source tag: SOURCE / THIEN_ANH_MODEL / SUPPORTING_INFERENCE.
- Ngành học là "định hướng theo mô hình", cấm ngôn ngữ định mệnh.
- Thiết kế engine chung + schema để module SAU (tình duyên, sức khỏe...) tái dùng.

CÁCH LÀM THEO PHASE, DỪNG cho tôi review giữa các phase:
  Phase 1: ENGINE CHUNG trả bat_tu_profile + tu_vi_profile (cho tôi xem hồ sơ trước).
  Phase 2: MODULE nghề Bát Tự + Tử Vi (đọc hồ sơ + config).
  Phase 3: MODULE kết hợp + chỉ số đồng thuận.
  Phase 4: Giao diện theo mockup trong docs.
```

---

## D. NHỮNG GÌ CÔNG CẦN DUYỆT (số liệu bản nháp)

Trước khi cho chạy khách thật, Công rà 3 bảng (đều là mô hình Thiên Anh, chưa kiểm chứng):
1. `config/bat_tu_nganh_ngu_hanh.json` — ngũ hành → ngành.
2. `config/tu_vi_sao_nganh.json` — 14 chính tinh → ngành.
3. Trọng số trong `config/career_mapping.json` + `config/domain_mapping.json`.

Việc calibrate trên ≥20 lá số (thư mục `calibration/`) là Phase 5, làm sau khi engine chạy được.

---

## E. MUỐN LÀM NHẸ HƠN?

Nếu muốn ship từng phần: bỏ 2 skill Tử Vi khỏi `knowledge/` và chỉ chạy Phase 1–2 cho **module Bát Tự trước**, thêm Tử Vi + Kết hợp sau. Cả bộ vẫn dùng lại được, không phải làm lại.
