# QUESTION SCHEMA — Quân Sư Thiên Anh (Phase 1)

## 1. 18 nhóm vấn đề khởi điểm

```
sự-nghiệp, công-việc, kinh-doanh, tài-chính, đầu-tư, bất-động-sản,
hợp-tác, vay-cho-vay, đòi-nợ, tình-duyên, hôn-nhân, thi-cử,
thi-đấu-cạnh-tranh, kiện-tụng-tranh-chấp, sức-khỏe, xuất-hành,
chọn-ngày-giờ, quyết-định-a-b-c
```

Đây là `question_categories` khởi điểm, đúng 18 nhóm liệt kê trong đề bài Phase 1. Danh sách phải là **dữ liệu**, không phải enum cứng trong code, để thêm nhóm mới không cần sửa code (đúng mẫu `dai-cat-loi-tools.ts` đã chứng minh hiệu quả).

## 2. Cấu trúc `question_definition`

```typescript
interface QuestionDefinition {
  question_id: string;              // slug duy nhất, vd "chuyen-viec-hay-khong"
  category: string;                 // 1 trong question_categories
  title: string;                    // câu hỏi hiển thị cho người dùng
  description: string;              // mô tả ngắn, giọng đời thường (không thuật ngữ)

  required_inputs: InputField[];    // bắt buộc phải có mới chạy được
  optional_inputs: InputField[];    // có thì dùng, không có thì bỏ qua (không suy đoán)

  divination_method: "luc-hao";     // Phase 1: chỉ 1 phương pháp Kinh Dịch (Lục Hào, engine đã có)
  required_engines: EngineRef[];    // danh sách engine ngữ cảnh cần gọi, xem mục 4

  interpretation_rules: {
    contextFields: Record<EngineRef, string[]>; // mỗi engine trả về TRƯỜNG NÀO — context budget
    tone: "trang-trọng" | "gần-gũi"; // cả 2 đều là biến thể của giọng gốc "quân sư đồng hành" (không phải thầy bói phán xa) —
                                       // "gần-gũi" cho câu hỏi đời thường, "trang-trọng" cho nhóm nhạy cảm (sức khỏe/kiện tụng)
                                       // nhưng vẫn giữ tinh thần đồng hành, không lạnh lùng. Xem KINH_DICH_INTERPRETATION_TEMPLATE.md Phần D.
    mustInclude: string[];          // các ý bắt buộc phải có trong kết luận
    mustAvoid: string[];            // các điều cấm nói (vd cam kết chắc chắn 100%, tư vấn y tế/pháp lý thay chuyên gia)
  };

  output_schema: OutputSchema;      // xem mục 3

  pricing_tier: "co-ban" | "nang-cao" | "cao-cap"; // theo số engine cần gọi + độ phức tạp
  safety_rules: SafetyRule[];       // xem mục 8
}

interface InputField {
  key: string;
  label: string;
  type: "date" | "datetime" | "text" | "select" | "number";
  required: boolean;
  helpText?: string;
}

type EngineRef = "kinh-dich" | "bat-tu" | "tu-vi" | "trach-nhat";
// KHÔNG có "ky-mon" / "phong-thuy" — quyết định phạm vi của Thầy ZHI GONG (2026-08-22):
// app này giữ đơn giản, không dùng Kỳ Môn Độn Giáp và không dùng Phong Thủy nhà ở
// (Bát Trạch/Huyền Không). Xem PRODUCT_ARCHITECTURE.md §2 mục 3.
```

## 3. `OutputSchema` — cấu trúc Mở bài / Thân bài / Kết luận

⚠️ Cập nhật 2026-08-23: Thầy chốt output phải là **bài luận chi tiết nhưng viết theo văn phong đời thường, không thuật ngữ chuyên môn**, cấu trúc như 1 bài viết bình thường — Mở bài / Thân bài / Kết luận — KHÔNG phải bảng liệt kê kỹ thuật kiểu "Dụng Thần → Phân tích → Ứng Kỳ → Hóa Giải" (đó là cấu trúc phân tích NỘI BỘ theo `LUAN_QUE_LUC_HAO_SPEC.md` mục 9, giúp AI luận đủ bước — không phải thứ hiển thị thẳng cho khách). Chi tiết cách gộp 6 bước nội bộ thành 3 đoạn văn xem `KINH_DICH_INTERPRETATION_TEMPLATE.md` Phần D.

```typescript
interface OutputSchema {
  mo_bai: string;    // tóm tắt ngắn: câu hỏi là gì, nhìn chung thuận hay không thuận
  than_bai: string;  // phân tích chi tiết bằng lời thường (không thuật ngữ), có thể dài vài đoạn
  ket_luan: {
    cau_tra_loi: string;              // chốt thẳng câu hỏi
    khuyen_nghi_hanh_dong: string;    // nên làm gì
    thoi_diem_de_xuat: string | null; // nếu câu hỏi có yếu tố thời điểm (vd có dùng trach-nhat)
    luu_y: string[];                  // các lưu ý/cảnh báo an toàn, xem safety_rules mục 8
  };
}
```

## 4. Nguyên tắc chọn `required_engines` theo câu hỏi

Đúng như ví dụ trong đề bài, KHÔNG phải mọi câu hỏi đều gọi cả 4 engine ngữ cảnh. Quy tắc mặc định:

- **Kinh Dịch:** luôn có, không nằm trong `required_engines` (là `divination_method`, chạy mặc định).
- **Bát Tự / Tử Vi:** thêm vào khi câu hỏi liên quan vận trình cá nhân dài hạn (sự nghiệp, hôn nhân, sức khỏe...). Không thêm cho câu hỏi thuần thời điểm (vd "hôm nay xuất hành giờ nào tốt" — chỉ cần Trạch Nhật).
- **Trạch Nhật:** thêm khi câu hỏi thuộc nhóm "chọn ngày giờ" — dùng `trachnhat-engine` đã có sẵn, map trực tiếp `question_id` → 1 trong ~30 hàm có sẵn (xem `ENGINE_INTEGRATION.md` §6).
- **Kỳ Môn / Phong Thủy nhà ở (Bát Trạch/Huyền Không): KHÔNG dùng trong app này.** Quyết định phạm vi của Thầy (2026-08-22) — Quân Sư Thiên Anh giữ đơn giản, dễ hiểu cho người bình thường, không đi sâu 2 môn này. Không có `question_definition` nào được liệt kê `"ky-mon"`/`"phong-thuy"` trong `required_engines` (2 giá trị này thậm chí không còn nằm trong `EngineRef`).

## 5. Ví dụ đầy đủ #1 — đúng ví dụ trong đề bài

```json
{
  "question_id": "chuyen-viec-hay-khong",
  "category": "sự-nghiệp",
  "title": "Có nên chuyển việc không?",
  "description": "Đang cân nhắc chuyển sang công việc/công ty mới, muốn biết thời điểm này có nên đi hay ở.",
  "required_inputs": [
    { "key": "ngay_sinh", "label": "Ngày sinh (dương lịch)", "type": "date", "required": true },
    { "key": "cau_hoi_cu_the", "label": "Mô tả ngắn tình huống", "type": "text", "required": true }
  ],
  "optional_inputs": [
    { "key": "gio_sinh", "label": "Giờ sinh", "type": "text", "required": false,
      "helpText": "Không có cũng luận được, chỉ chính xác hơn nếu có" }
  ],
  "divination_method": "luc-hao",
  "required_engines": ["bat-tu", "tu-vi"],
  "interpretation_rules": {
    "contextFields": {
      "bat-tu": ["dai_van_hien_tai", "luu_nien"],
      "tu-vi": ["van_trinh_cung_menh", "cung_quan_loc_luu_nien"]
    },
    "tone": "gần-gũi",
    "mustInclude": ["kết luận nên đi hay ở", "thời điểm nên hành động nếu quyết định đi"],
    "mustAvoid": ["cam kết chắc chắn kết quả công việc mới", "chê bai công ty hiện tại/công ty mới cụ thể"]
  },
  "output_schema": {
    "mo_bai": "string — tóm tắt: câu hỏi về việc gì, nhìn chung quẻ thuận hay không",
    "than_bai": "string — phân tích chi tiết bằng lời thường, dựa quẻ + sơ đồ vận trình (nếu quẻ và vận lệch nhau, đọc theo tầng — xem KINH_DICH_INTERPRETATION_TEMPLATE.md Phần C)",
    "ket_luan": {
      "cau_tra_loi": "string — nên đi hay ở, chốt thẳng",
      "khuyen_nghi_hanh_dong": "string",
      "thoi_diem_de_xuat": "string | null",
      "luu_y": ["string"]
    }
  },
  "pricing_tier": "nang-cao",
  "safety_rules": [
    "không thay thế tư vấn pháp lý hợp đồng lao động",
    "không đưa cam kết tài chính cụ thể (mức lương, thưởng)"
  ]
}
```

Không có engine thời điểm nào trong `required_engines` ở đây — câu hỏi này hỏi "nên hay không nên", chưa hỏi "ngày giờ nào". Nếu người dùng chọn tiếp câu hỏi con "vậy nên bắt đầu ngày nào", đó là 1 `question_definition` khác thuộc category "chọn-ngày-giờ" (xem ví dụ #2), dùng `"trach-nhat"`.

## 6. Ví dụ #2 — nhóm "Chọn ngày giờ" (dùng engine đã có sẵn nhiều nhất)

```json
{
  "question_id": "chon-ngay-khai-truong",
  "category": "chọn-ngày-giờ",
  "title": "Chọn ngày giờ khai trương",
  "description": "Sắp mở cửa hàng/công ty, muốn chọn ngày giờ tốt.",
  "required_inputs": [
    { "key": "khoang_thoi_gian_du_kien", "label": "Khoảng thời gian dự kiến", "type": "text", "required": true },
    { "key": "ngay_sinh_chu_toa", "label": "Ngày sinh người đứng đầu", "type": "date", "required": true }
  ],
  "optional_inputs": [],
  "divination_method": "luc-hao",
  "required_engines": ["trach-nhat"],
  "interpretation_rules": {
    "contextFields": { "trach-nhat": ["cac_ngay_gio_tot_trong_khoang"] },
    "tone": "trang-trọng",
    "mustInclude": ["2-3 lựa chọn ngày giờ cụ thể, xếp hạng"],
    "mustAvoid": ["chỉ đưa đúng 1 lựa chọn duy nhất không có phương án dự phòng"]
  },
  "output_schema": {
    "mo_bai": "string",
    "than_bai": "string — nêu 2-3 lựa chọn ngày giờ và vì sao mỗi lựa chọn được xếp hạng vậy",
    "ket_luan": {
      "cau_tra_loi": "string — ngày giờ được đề xuất chính",
      "khuyen_nghi_hanh_dong": "string",
      "thoi_diem_de_xuat": "string",
      "luu_y": ["string"]
    }
  },
  "pricing_tier": "co-ban",
  "safety_rules": ["không cam kết kết quả kinh doanh sau khai trương"]
}
```

Câu hỏi này **tái dùng trực tiếp** `calculateNgayKhaiTruongRange`/`calculateNgayKhaiTruongCaoCap` đã có sẵn trong `trachnhat-engine` (xem audit mục 4) làm nguồn cho `contextFields["trach-nhat"]`. Đây gần như là map 1-1 giữa `question_id` và 1 trong ~30 hàm có sẵn — không cần logic phức tạp.

## 7. Ví dụ #3 — nhóm nhạy cảm (Kiện tụng/tranh chấp) để kiểm chứng `safety_rules`

```json
{
  "question_id": "co-nen-khoi-kien-khong",
  "category": "kiện-tụng-tranh-chấp",
  "title": "Có nên khởi kiện không?",
  "description": "Đang có tranh chấp, cân nhắc có nên đưa ra tòa/khởi kiện hay hòa giải.",
  "required_inputs": [
    { "key": "ngay_sinh", "label": "Ngày sinh", "type": "date", "required": true },
    { "key": "mo_ta_tranh_chap", "label": "Mô tả ngắn vụ việc", "type": "text", "required": true }
  ],
  "optional_inputs": [],
  "divination_method": "luc-hao",
  "required_engines": ["bat-tu"],
  "interpretation_rules": {
    "contextFields": { "bat-tu": ["luu_nien"] },
    "tone": "trang-trọng",
    "mustInclude": ["nhắc rõ đây là góc nhìn tham khảo, không thay thế luật sư"],
    "mustAvoid": ["đưa dự đoán thắng/thua cụ thể", "khuyên hành động vi phạm pháp luật"]
  },
  "output_schema": {
    "mo_bai": "string",
    "than_bai": "string",
    "ket_luan": {
      "cau_tra_loi": "string",
      "khuyen_nghi_hanh_dong": "string",
      "thoi_diem_de_xuat": "string | null",
      "luu_y": ["string, bắt buộc có khuyến nghị gặp luật sư"]
    }
  },
  "pricing_tier": "nang-cao",
  "safety_rules": [
    "luôn kèm khuyến nghị tham vấn luật sư/chuyên gia pháp lý",
    "không dự đoán kết quả thắng/thua vụ kiện",
    "không tư vấn né tránh nghĩa vụ pháp lý"
  ]
}
```

## 8. `safety_rules` — nguyên tắc chung áp dụng mọi câu hỏi

Bất kể `question_definition` cụ thể ghi gì, Interpretation Engine phải luôn tuân theo tầng an toàn chung sau (định nghĩa 1 lần, áp dụng toàn hệ thống, không lặp lại trong từng câu hỏi):

1. Nhóm **Sức khỏe**: không thay thế chẩn đoán/điều trị y tế, luôn khuyến nghị gặp bác sĩ với vấn đề nghiêm trọng.
2. Nhóm **Kiện tụng/tranh chấp**: không dự đoán thắng/thua, luôn khuyến nghị tư vấn pháp lý.
3. Nhóm **Tài chính/Đầu tư/Vay-cho vay**: không đưa lời khuyên đầu tư tài chính mang tính cam kết lợi nhuận, không thay thế tư vấn tài chính có chứng chỉ.
4. Mọi nhóm: không tuyệt đối hóa kết quả ("chắc chắn", "100%") — luôn giữ giọng "góc nhìn tham khảo".

## 9. Về việc dịch thuật ngữ khi hiển thị cho người dùng

`question_definition` là dữ liệu kỹ thuật nội bộ — có thể dùng thuật ngữ chính xác (`dai_van_hien_tai`, `cung_quan_loc`...). Nhưng `title`/`description`/nội dung `output_schema` khi HIỂN THỊ cho khách hàng phải qua lớp diễn giải giọng đời thường, không thuật ngữ khó (theo nguyên tắc giao tiếp đã thống nhất với Thầy) — đây chính là nội dung Phần D của `KINH_DICH_INTERPRETATION_TEMPLATE.md` (mở bài/thân bài/kết luận, không thuật ngữ), là trách nhiệm của Interpretation Engine, không phải của schema này.
