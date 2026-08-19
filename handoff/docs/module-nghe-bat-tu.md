# MODULE ĐỊNH HƯỚNG NGHỀ NGHIỆP THEO BÁT TỰ — Tài liệu chi tiết v1

Phạm vi v1: **chỉ Bát Tự** (Tử Bình `luan-giai-bat-tu` + Manh Phái `luan-giai-bat-tu-manh-phai`). Chưa dùng Tử Vi. Kiến trúc "bếp trung tâm": 1 engine chung lấy dữ liệu, 1 module nghề tiêu thụ.

---

## 1. KIẾN TRÚC (2 phần)

```
        Ngày giờ sinh + giới tính
                  │
     ┌────────────▼─────────────┐
     │   ENGINE CHUNG (bếp)     │   ← nạp /knowledge, gọi engine lập lá số sẵn có
     │  l[lapLaSo] → luận BT    │
     │  trả HỒ SƠ LÁ SỐ (JSON)  │   ← cache theo hash(lá số)
     └────────────┬─────────────┘
                  │  bat_tu_profile
     ┌────────────▼─────────────┐
     │  MODULE NGHỀ (món ăn)    │   ← KHÔNG luận huyền học, chỉ đọc hồ sơ + config
     │  vector → axis → ngành   │
     │  → career path → visual  │
     └────────────┬─────────────┘
                  ▼
            Giao diện (Radar / Gauge / Ngành / Timeline / Path)
```

**Điểm mấu chốt:** kiến thức huyền học chỉ nằm ở ENGINE CHUNG. Module nghề chỉ là phép tính + vẽ, dùng 3 file config. Module sau này (tình duyên, sức khỏe...) tái dùng đúng engine chung này.

---

## 2. ENGINE CHUNG — đầu ra "Hồ sơ lá số Bát Tự"

Engine chung chạy HYBRID: phần lập Tứ Trụ dùng **engine sẵn có**; phần luận (vượng suy, dụng thần, cách cục, tố công) **gọi LLM nạp /knowledge**. Trả về đúng schema sau (đây là "hợp đồng" mọi module bám vào):

```json
{
  "meta": { "gioi_tinh": "Nam", "duong_lich": "1996-03-14T09:20", "cache_key": "<hash>" },
  "tu_tru": { "nam":"Bính Tý", "thang":"Tân Mão", "ngay":"Giáp Thìn", "gio":"Kỷ Tỵ" },
  "bat_tu": {
    "nhat_chu": "Giáp", "ngu_hanh_nhat_chu": "moc",
    "vuong_suy": "vuong",
    "dung_than": "thuy", "hy_than": "kim", "ky_than": "tho",
    "cach_cuc": ["thuc_thuong_sinh_tai"],
    "thap_than_noi_bat": ["Thiên Tài","Thực Thần"],
    "source": "luan-giai-bat-tu"
  },
  "manh_phai": {
    "the": "vuong",
    "to_cong": "Nhật chủ sinh Thực Thương sinh Tài",
    "cau_truc": "tai_che_an",          // 1 trong 10 key ở career_mapping
    "chinh_phan_cuc": "phan_cuc",
    "hieu_suat": { "co_che": "xung", "muc": "trung_binh", "he_so": 0.7 },
    "source": "luan-giai-bat-tu-manh-phai"
  },
  "dai_van": [
    { "tu_tuoi":8,  "den_tuoi":18, "can_chi":"Nhâm Thìn", "ngu_hanh":"thuy",
      "dung_hy": "dung", "chu_de": "hoc_tap", "muc_thuan":"cao" },
    { "tu_tuoi":28, "den_tuoi":38, "can_chi":"Giáp Ngọ",  "ngu_hanh":"hoa",
      "dung_hy": "trung", "chu_de": "tai_van", "muc_thuan":"cao" }
  ],
  "warnings": []   // ví dụ: giờ sinh gần ranh giới tiết khí -> cảnh báo
}
```

Nguyên tắc engine chung: thiếu dữ liệu → điền `insufficient_data` + thêm vào `warnings`, KHÔNG bịa.

---

## 3. MODULE NGHỀ — logic tính (thuần code, đọc 3 config)

Ba file config module đọc: `career_mapping.json`, `domain_mapping.json`, `bat_tu_nganh_ngu_hanh.json`.

**Bước 1 — Career Vector (5 trục).**
```
vector = career_mapping.manh_phai_mechanism[ profile.manh_phai.cau_truc ].vector
vector = vector × profile.manh_phai.hieu_suat.he_so     // Hiệu suất chỉ đổi ĐỘ MẠNH
```
(v1 Bát Tự: archetype nền lấy từ cơ chế Manh Phái. Khi bật Tử Vi ở v2 mới cộng thêm tam_hop_archetype.)

**Bước 2 — Trục Quan lộc ↔ Kinh doanh.**
```
axis = career_mapping.authority_business_axis[ chinh_cuc_pull | phan_cuc_pull ]
       (+ nudge theo direction của cơ chế)
```

**Bước 3 — Điểm ngành (2 nguồn cộng lại).**
```
domain_score[d] = domain_mapping.mechanisms[ cau_truc ].domains[d]
                + bat_tu_nganh_ngu_hanh[ dung_than ].domains[d] × 1.0
                + bat_tu_nganh_ngu_hanh[ hy_than  ].domains[d] × 0.5
```
Rồi áp `output_rules` (3 ưu tiên + 3 phù hợp + 3 có thể, không ép đủ) + `deduplication_rules`.

**Bước 4 — Career Path + Timeline.** Lấy thẳng `profile.dai_van` (1 timeline Bát Tự), gắn chủ đề mỗi vận (học/chuyên môn/tài vận/kinh doanh/tích sản) theo `chu_de` + `muc_thuan`.

**Bước 5 — Visual.** Radar (5 trục), Gauge (axis), thẻ ngành (3+3+3), timeline đại vण, sơ đồ path. Mọi kết luận gắn source tag (SOURCE / THIEN_ANH_MODEL / SUPPORTING_INFERENCE).

---

## 4. BỐ CỤC GIAO DIỆN (xem file `bo-cuc-module-nghe.html`)

Thứ tự khối trên 1 màn, ưu tiên đồ hình:

1. **Dải tóm tắt lá số** — Nhật chủ · Vượng suy · Dụng thần · Cơ chế · Cục. (từ engine chung)
2. **Radar 5 trục** + **Gauge Quan lộc↔Kinh doanh** (2 cột).
3. **Nhóm ngành 3+3+3** (3 cột màu).
4. **Timeline Đại vận Bát Tự** (1 dải, không ghép).
5. **Career Path** (chuỗi mũi tên theo tuổi).
6. **"Vì sao?"** — mở ra giải thích ngắn + source tag.

Quy tắc UX: 80% đồ hình, 20% chữ; mỗi khối 1 hình chính + vài chỉ số + 1 kết luận ngắn.

---

## 5. FILE CONFIG CHO MODULE (đặt /config)

| File | Vai trò | Trạng thái |
|---|---|---|
| `career_mapping.json` (v2.1) | career_vector theo cơ chế Manh Phái + axis + hệ số hiệu suất | nháp, chờ calibrate |
| `domain_mapping.json` | điểm ngành theo cơ chế + luật 3+3+3 + dedup | nháp |
| `bat_tu_nganh_ngu_hanh.json` | **MỚI** — Dụng/Hỷ thần (ngũ hành) → ngành | nháp, cần Công duyệt |

`/knowledge` chỉ cần 2 skill cho v1: `luan-giai-bat-tu` + `luan-giai-bat-tu-manh-phai` (bỏ 2 skill Tử Vi cho nhẹ).

---

## 6. PROMPT DÁN THẲNG CHO CLAUDE CODE (bản Bát Tự)

```
Xây MODULE con "Định hướng Nghề nghiệp theo Bát Tự" trong website hiện tại.
KHÔNG tạo web mới, KHÔNG phá engine hiện có.

KIẾN TRÚC 2 PHẦN (bắt buộc tách):
1) ENGINE CHUNG "chart-profile": nhận ngày giờ sinh + giới tính -> gọi engine lập lá số
   SẴN CÓ trong repo (tự tìm, tái sử dụng, không viết lại an sao) -> luận Bát Tự bằng cách
   GỌI LLM nạp /knowledge/luan-giai-bat-tu và /knowledge/luan-giai-bat-tu-manh-phai ->
   trả về HỒ SƠ LÁ SỐ theo schema ở /docs/module-nghe-bat-tu.md mục 2. Cache theo hash lá số.
2) MODULE NGHỀ: KHÔNG luận huyền học. Chỉ đọc hồ sơ lá số + 3 file config trong /config
   (career_mapping.json, domain_mapping.json, bat_tu_nganh_ngu_hanh.json) rồi tính
   theo mục 3 của tài liệu, và vẽ giao diện theo bố cục mục 4 (tham chiếu mockup
   /docs/bo-cuc-module-nghe.html).

RÀNG BUỘC:
- LLM chỉ dùng tri thức trong /knowledge; thiếu -> "insufficient_data", không bịa.
- Đọc config từ FILE, không hard-code. Chạy /scripts/validate_mapping.py phải "khớp tuyệt đối".
- Bát Tự chọn ngành theo DỤNG/HỶ THẦN (hành cần), KHÔNG theo hành Nhật chủ.
- Hiệu suất Tố công chỉ đổi ĐỘ MẠNH vector, không đổi hướng.
- Chỉ 1 timeline Đại vận Bát Tự; chưa ghép Tử Vi.
- Chưa calibrate 0-100: dùng qualitative/ordinal.
- Mọi kết luận gắn source tag: SOURCE / THIEN_ANH_MODEL / SUPPORTING_INFERENCE.
- Ngành học là "định hướng theo mô hình", cấm ngôn ngữ định mệnh.
- Thiết kế engine chung + schema hồ sơ để module SAU (tình duyên, sức khỏe...) tái dùng được.

CÁCH LÀM: xây ENGINE CHUNG + schema trước, cho tôi review hồ sơ lá số nó trả ra;
xong mới xây MODULE NGHỀ; cuối cùng mới tới giao diện. Dừng sau engine chung để tôi kiểm.
```

---

## 7. FILE ĐÍNH KÈM CHO BƯỚC NÀY

- `/docs/module-nghe-bat-tu.md` ← chính tài liệu này
- `/docs/bo-cuc-module-nghe.html` ← mockup bố cục
- `/config/career_mapping.json`, `/config/domain_mapping.json`, `/config/bat_tu_nganh_ngu_hanh.json`
- `/knowledge/luan-giai-bat-tu/`, `/knowledge/luan-giai-bat-tu-manh-phai/`
- `/scripts/validate_mapping.py`

## 8. VIỆC CÔNG CẦN DUYỆT TRƯỚC KHI CHẠY THẬT
1. Bảng `bat_tu_nganh_ngu_hanh.json` — rà từng hành → ngành theo kinh nghiệm.
2. Trọng số career_vector + domain (bản nháp).
3. Cách chọn cơ chế Manh Phái khi lá số có nhiều cấu trúc (lấy cấu trúc chính hay cộng?).
