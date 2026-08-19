# MODULE ĐỊNH HƯỚNG NGHỀ NGHIỆP THEO TỬ VI — Tài liệu chi tiết v1

Song song với module Bát Tự, dùng **cùng engine chung** (bếp trung tâm). Phạm vi: Tử Vi Nam Phái (`luan-giai-tu-vi-nam-phai`) + Tam Hợp (`luan-giai-tu-vi-tam-hop-phai`, phần archetype). Chưa ghép Bát Tự.

---

## 1. KIẾN TRÚC — cắm vào cùng engine chung

```
        Ngày giờ sinh + giới tính
                  │
     ┌────────────▼─────────────┐
     │      ENGINE CHUNG        │   ← giờ trả 2 khối:
     │   bat_tu_profile  +      │       • bat_tu_profile  (module Bát Tự dùng)
     │   tu_vi_profile          │       • tu_vi_profile   (module Tử Vi dùng)
     └──────┬───────────┬───────┘
            │           │
   ┌────────▼───┐  ┌────▼──────────┐
   │ MODULE     │  │ MODULE NGHỀ   │
   │ NGHỀ BÁT TỰ│  │ THEO TỬ VI    │  ← đọc tu_vi_profile + config, KHÔNG tự luận
   └────────────┘  └───────────────┘
```

**Đây là payoff của kiến trúc bếp trung tâm:** 1 engine → 2 khối hồ sơ → nhiều module. Về sau muốn module "Đồng thuận Bát Tự × Tử Vi" thì chỉ việc đọc CẢ 2 khối, không xây lại gì.

---

## 2. ENGINE CHUNG — đầu ra "Hồ sơ lá số Tử Vi"

Phần an sao dùng **engine lập lá số sẵn có**; phần luận (mệnh cách, cát/hung cung, Tuần Triệt, đại hạn) **gọi LLM nạp /knowledge Tử Vi**. Schema:

```json
{
  "meta": { "gioi_tinh":"Nữ", "duong_lich":"1998-07-02T14:10", "am_duong_menh":"Âm Nữ" },
  "menh_than_cuc": { "menh_cung":"Ngọ", "than_cung":"Tuất", "cuc":"Thổ ngũ cục" },
  "menh_cach": {
    "chinh": "tu_phu_vu_tuong",          // 1 trong 3 archetype key ở career_mapping
    "phu": ["van_tinh_am_cung"],          // 0..n cách phụ ĐẠT cách (key ở career_mapping)
    "vo_chinh_dieu": false,
    "muon_cach_cung_di": false,
    "do_sang": "mieu_vuong"               // sáng/tối của bộ sao trong cách
  },
  "sao_theo_cung": {
    "menh":     [ {"ten":"tu_vi","dac_ham":"mieu"} ],
    "quan_loc": [ {"ten":"vu_khuc","dac_ham":"vuong"}, {"ten":"thien_phu","dac_ham":"vuong"} ],
    "tai_bach": [ {"ten":"thien_tuong","dac_ham":"dac"} ],
    "thien_di": [ {"ten":"pha_quan","dac_ham":"ham"} ]
  },
  "danh_gia_cung": { "quan_loc":"cat", "tai_bach":"cat", "thien_di":"binh", "phuc_duc":"cat" },
  "tuan_triet": { "cung_bi_anh_huong":["Thân"] },
  "dai_han": [
    { "tu_tuoi":4,  "den_tuoi":13, "cung":"Tỵ", "chu_de":"hoc_tap",  "muc_thuan":"cao" },
    { "tu_tuoi":24, "den_tuoi":33, "cung":"Mùi", "chu_de":"su_nghiep","muc_thuan":"cao" }
  ],
  "warnings": []
}
```

Nguyên tắc: theo đúng skill Tử Vi Nam Phái — KHÔNG dùng Bát Tự, KHÔNG thêm trường phái Tứ Hóa khác. Thiếu dữ liệu (144 cách cục 12 cung chưa nạp đủ, VCD 4 bước...) → `insufficient_data`.

---

## 3. MODULE NGHỀ TỬ VI — logic tính (thuần code, đọc 3 config)

Config: `career_mapping.json`, `domain_mapping.json`, `tu_vi_sao_nganh.json` (MỚI).

**Bước 1 — Career Vector (5 trục).**
```
vector = career_mapping.tam_hop_archetype[ menh_cach.chinh ].vector
       + Σ career_mapping.tam_hop_phu_cach[ p ].vector   (mỗi p trong menh_cach.phu)
điều chỉnh theo do_sang: mieu_vuong ×1.0 ; ham ×0.6 ; có Tuần/Triệt ×0.8
```

**Bước 2 — Trục Quan lộc ↔ Kinh doanh.**
```
axis = nudge theo archetype (organizer/specialist kéo Quan lộc; pioneer kéo Kinh doanh)
     + so sánh danh_gia_cung.quan_loc vs tai_bach  (Quan mạnh -> Quan lộc; Tài mạnh -> Kinh doanh)
```

**Bước 3 — Điểm ngành (2 nguồn cộng lại).**
```
domain_score[d] = domain_mapping.archetypes[ menh_cach.chinh ].domains[d]
                + Σ domain_mapping.tam_hop_phu_cach[p].domains[d]
                + tu_vi_sao_nganh nudge:
                    bang[sao Quan Lộc]×1.0 + bang[sao Mệnh]×0.7   (song tinh -> trung bình; Hãm -> giảm)
```
Rồi áp `output_rules` (3+3+3) + `deduplication_rules` giống module Bát Tự.

**Bước 4 — Career Path + Timeline.** Lấy `tu_vi_profile.dai_han` → 1 timeline **Đại hạn Tử Vi** (KHÔNG ghép Đại vận Bát Tự).

**Bước 5 — Visual.** Giống hệt bố cục Bát Tự (xem `bo-cuc-module-nghe.html`).

---

## 4. BỐ CỤC — DÙNG LẠI y hệt, chỉ đổi 2 chỗ

Đây là lợi ích kiến trúc: **cùng 1 layout 6 khối**, chỉ thay dữ liệu nguồn:

| Khối | Bát Tự | Tử Vi (đổi) |
|---|---|---|
| Dải tóm tắt | Nhật chủ · Dụng thần · Cơ chế | **Mệnh/Thân/Cục · Mệnh cách · Cát cung** |
| Radar 5 trục | từ cơ chế Manh Phái | từ **archetype + phụ cách** |
| Gauge Q↔K | Chính/Phản cục | **archetype + Quan Lộc vs Tài Bạch** |
| Ngành 3+3+3 | cơ chế + Dụng thần | **archetype + chính tinh Quan Lộc** |
| Timeline | Đại vận Bát Tự | **Đại hạn Tử Vi** |
| Career Path | theo đại vận | theo **đại hạn** |

→ Không cần vẽ lại mockup mới; frontend tái dùng component, chỉ đổi nguồn dữ liệu.

---

## 5. KHÁC BIỆT QUAN TRỌNG SO VỚI MODULE BÁT TỰ

- **Ít phải vá hơn:** archetype→vector và archetype→ngành ĐÃ có sẵn trong 2 file mapping. Chỉ thêm 1 file mới `tu_vi_sao_nganh.json` (chính tinh→ngành). Bát Tự trước đây phải thêm bảng ngũ hành→ngành.
- **Tử Vi mạnh phần "kiểu người/hình ảnh nghề"** → radar + thẻ archetype là điểm ăn hình.
- **Điểm yếu cần lưu:** skill Tử Vi Nam Phái còn khoảng trống (144 cách cục 12 cung chưa nạp đủ, 4 bước VCD thuần tịnh, vài bảng an sao) → engine phải trả `insufficient_data` ở các chỗ này, không tự bịa.
- **Cách phụ chỉ tính khi ĐẠT cách** (đủ bộ sao ở Mệnh/Di/Tài/Quan) — không tự thêm điều kiện.

---

## 6. PROMPT DÁN THẲNG CHO CLAUDE CODE (bản Tử Vi)

```
Mở rộng ENGINE CHUNG "chart-profile" (đã xây cho Bát Tự) để trả THÊM khối tu_vi_profile
theo schema ở /docs/module-nghe-tu-vi.md mục 2. Phần an sao dùng engine lập lá số SẴN CÓ;
phần luận GỌI LLM nạp /knowledge/luan-giai-tu-vi-nam-phai (và
/knowledge/luan-giai-tu-vi-tam-hop-phai cho archetype). KHÔNG ghép Bát Tự, KHÔNG thêm
trường phái Tứ Hóa khác.

Xây MODULE NGHỀ THEO TỬ VI: KHÔNG luận huyền học, chỉ đọc tu_vi_profile + 3 config
(/config/career_mapping.json, domain_mapping.json, tu_vi_sao_nganh.json), tính theo
mục 3, và vẽ theo layout ĐÃ CÓ của module Bát Tự (chỉ đổi nguồn dữ liệu theo mục 4).

RÀNG BUỘC:
- LLM chỉ dùng /knowledge; thiếu (144 cách cục, VCD 4 bước...) -> "insufficient_data", không bịa.
- Cách phụ chỉ tính khi ĐẠT cách; không tự thêm điều kiện.
- Ngành: sao ở Quan Lộc nặng hơn sao ở Mệnh; xét Đắc/Hãm; VCD mượn cung Di.
- Chỉ 1 timeline Đại hạn Tử Vi; không ghép Đại vận Bát Tự.
- Đọc config từ file, chạy validate_mapping.py phải "khớp tuyệt đối".
- Source tag đầy đủ; ngành là "định hướng theo mô hình", cấm ngôn ngữ định mệnh.
- Tái dùng component giao diện của module Bát Tự, không dựng lại từ đầu.

CÁCH LÀM: bổ sung tu_vi_profile vào engine chung trước, cho tôi review; rồi mới ráp module nghề Tử Vi.
```

---

## 7. FILE ĐÍNH KÈM CHO BƯỚC NÀY

- `/docs/module-nghe-tu-vi.md` ← tài liệu này
- `/config/tu_vi_sao_nganh.json` ← MỚI (chính tinh → ngành)
- Dùng lại: `career_mapping.json`, `domain_mapping.json`, layout `bo-cuc-module-nghe.html`
- `/knowledge/luan-giai-tu-vi-nam-phai/`, `/knowledge/luan-giai-tu-vi-tam-hop-phai/`

## 8. VIỆC CÔNG CẦN DUYỆT
1. Bảng `tu_vi_sao_nganh.json` — rà 14 chính tinh → ngành theo kinh nghiệm.
2. Cách chấm điểm Đắc/Hãm ảnh hưởng nudge (hiện Hãm ×giảm — mức bao nhiêu Công quyết).
3. Khi Mệnh Vô Chính Diệu: mượn cung Di hệ số 0.7 có hợp lý không.
