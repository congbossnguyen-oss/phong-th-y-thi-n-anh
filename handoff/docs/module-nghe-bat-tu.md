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

Engine chung chạy HYBRID: phần lập Tứ Trụ dùng **engine sẵn có**; phần luận (vượng suy, dụng thần, cách cục, tố công) **gọi LLM nạp /knowledge**. Trả về đúng schema sau — **BẢN CHỐT, khớp 100% tên trường thật đang chạy trong `src/lib/chart-profile/`** (đối chiếu trực tiếp với output thật của `getBatTuProfile()`, không phải bản nháp lúc thiết kế). Đây là "hợp đồng" mọi module bám vào:

```json
{
  "meta": { "gioi_tinh": "Nam", "duong_lich": "1996-03-14T09:20", "cache_key": "48347aa5147a2676" },
  "tu_tru": { "nam": "Bính Tý", "thang": "Tân Mão", "ngay": "Canh Tuất", "gio": "Tân Tỵ" },

  // "facts" — SỰ THẬT thuần code từ engine lập lá số sẵn có (bat-tu.ts), KHÔNG do LLM tạo ra.
  // Module Nghề không bắt buộc phải đọc khối này (đã có tóm tắt ở "bat_tu"/"dai_van" bên dưới),
  // nhưng nó LUÔN có mặt trong hồ sơ — ví dụ cần Tàng Can/Thần Sát chi tiết thì đọc ở đây.
  "facts": {
    "gioiTinh": "Nam",
    "duongLich": "1996-03-14T09:20",
    "tuTru": {
      "nam":   { "can":"Bính","chi":"Tý",  "napAm":"Giản Hạ Thủy", "napAmNguHanh":"thuy",
                 "tangCan":[{"can":"Quý","thapThan":"Thương Quan"}], "thapThan":"Thất Sát", "truongSinh":"Tử" },
      "thang": { "can":"Tân", "chi":"Mão", "napAm":"Tùng Bách Mộc", "napAmNguHanh":"moc",
                 "tangCan":[{"can":"Ất","thapThan":"Chính Tài"}], "thapThan":"Kiếp Tài", "truongSinh":"Thai" },
      "ngay":  { "can":"Canh","chi":"Tuất","napAm":"Thoa Xuyến Kim","napAmNguHanh":"kim",
                 "tangCan":[{"can":"Mậu","thapThan":"Thiên Ấn"},{"can":"Tân","thapThan":"Kiếp Tài"},{"can":"Đinh","thapThan":"Chính Quan"}],
                 "thapThan":"Nhật Chủ", "truongSinh":"Suy" },
      "gio":   { "can":"Tân", "chi":"Tỵ", "napAm":"Bạch Lạp Kim", "napAmNguHanh":"kim",
                 "tangCan":[{"can":"Bính","thapThan":"Thất Sát"},{"can":"Mậu","thapThan":"Thiên Ấn"},{"can":"Canh","thapThan":"Nhật Chủ"}],
                 "thapThan":"Kiếp Tài", "truongSinh":"Trường Sinh" }
    },
    "nhatChu": { "can":"Canh", "nguHanh":"kim", "amDuong":"Dương" },
    "daiVanThuanNghich": "thuận",
    "daiVan": [
      { "can":"Nhâm","chi":"Thìn","canNguHanh":"thuy","tuTuoi":8, "denTuoi":17 }
      // ... đủ 10 giai đoạn — cùng 4 trường can/chi/canNguHanh/tuTuoi/denTuoi, xem "dai_van" bên dưới
      // để có bản đã map sẵn can_chi/ngu_hanh dạng module Nghề dùng trực tiếp.
    ],
    "menhCung": { "can":"Đinh", "chi":"Dậu" },
    "thaiNguyen": { "can":"Nhâm", "chi":"Ngọ" },
    "nienKhong": "Thân - Dậu",
    "nhatKhong": "Dần - Mão",
    "thanSat": { "nam":["Tai Sát","Cách Góc"], "thang":["Thái Cực (năm)","Hồng Loan","Câu Sát","Đào Hoa"],
                 "ngay":["Hoa Cái","Kim Dư","Khôi Cương","Quả Tú","Điếu Khách","Huyết Nhẫn"], "gio":["Kiếp Sát (năm)","Vong Thần"] },
    "canhBaoKyThuat": []
  },

  // "bat_tu"/"manh_phai" — phần LUẬN do LLM điền (đọc /knowledge). Khi CHƯA cấu hình
  // ANTHROPIC_API_KEY, mọi trường dưới đây trả "insufficient_data" (không bịa) — ví dụ có giá trị
  // đây là MINH HOẠ hình dạng khi AI đã luận thành công, không phải giá trị thật đang chạy.
  "bat_tu": {
    "nhat_chu": "Canh", "ngu_hanh_nhat_chu": "kim",
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

  // "dai_van" — bản đã map sẵn cho module Nghề đọc trực tiếp: can_chi/ngu_hanh chép nguyên từ
  // facts.daiVan[i] (KHÔNG phải luận giải); dungHy/chuDe/mucThuan do LLM điền (insufficient_data
  // nếu chưa có AI). ⚠️ Tên trường ĐÚNG NHƯ CHẠY THẬT: tuTuoi/denTuoi/dungHy/chuDe/mucThuan là
  // camelCase (không phải tu_tuoi/den_tuoi/dung_hy/chu_de/muc_thuan như bản nháp trước đây) —
  // chỉ can_chi/ngu_hanh giữ snake_case.
  "dai_van": [
    { "tuTuoi":8,  "denTuoi":17, "can_chi":"Nhâm Thìn", "ngu_hanh":"thuy",
      "dungHy": "dung", "chuDe": "hoc_tap", "mucThuan":"cao" },
    { "tuTuoi":28, "denTuoi":37, "can_chi":"Giáp Ngọ",  "ngu_hanh":"moc",
      "dungHy": "trung", "chuDe": "tai_van", "mucThuan":"cao" }
  ],

  "warnings": [],                  // ví dụ: giờ sinh gần ranh giới tiết khí, hoặc chưa cấu hình AI
  "ai_luan_giai_thanh_cong": true, // false = mới có "facts" (thuần code); mọi trường luận giải = insufficient_data
  "model": "claude-sonnet-5",      // chỉ có khi ai_luan_giai_thanh_cong = true
  "generatedAt": "2026-08-19T12:54:14.863Z"
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

**Bước 4 — Career Path + Timeline.** Lấy thẳng `profile.dai_van` (1 timeline Bát Tự), gắn chủ đề mỗi vận (học/chuyên môn/tài vận/kinh doanh/tích sản) theo `chuDe` + `mucThuan`.

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
