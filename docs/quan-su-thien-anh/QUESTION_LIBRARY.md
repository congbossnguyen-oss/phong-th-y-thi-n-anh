# QUESTION LIBRARY — Quân Sư Thiên Anh (Phase 2)

Tài liệu này mô tả Thư Viện Câu Hỏi đã được xây dựng bằng code (seed data thuần). Đây là sản phẩm chính của Phase 2. Không thay đổi kiến trúc đã nghiệm thu ở Phase 1.

## 1. Nguyên tắc

- Người dùng **không** bắt đầu bằng ô chat tự do. Màn hình đầu tiên hỏi **"Anh đang quan tâm điều gì?"** (`APP_OPENING_PROMPT`), hiển thị 15 nhóm vấn đề để chọn → chọn nhóm → chọn 1 câu hỏi cụ thể trong nhóm → vào luồng hỏi-đáp.
- Toàn bộ câu hỏi là **DỮ LIỆU**, không hard-code vào component. UI đọc qua các hàm truy vấn ở `src/lib/quan-su/index.ts`.
- Kinh Dịch (Lục Hào) là engine luận đoán chính, **luôn chạy** → không nằm trong `recommended_engines`. Bát Tự/Tử Vi chỉ đưa **sơ đồ vận trình** (thời vận tốt hay xấu). Nhóm "Chọn ngày giờ" dùng `trach-nhat` (không gieo quẻ).

## 2. Vị trí file

```
src/lib/quan-su/
├── types.ts        — định nghĩa kiểu (QuestionDefinition, CategoryDefinition, các enum)
├── categories.ts   — 14 nhóm vấn đề + APP_OPENING_PROMPT + hàm getCategory/getAllCategories
├── questions.ts    — 71 câu hỏi seed (builder giảm lặp)
└── index.ts        — CỬA VÀO DUY NHẤT cho UI: getAllQuestions, getQuestionsByCategory,
                       getQuestion, getCategoryWithQuestions, getCategoriesWithCounts, TOTAL_QUESTION_COUNT

tests/quan-su-question-library.test.ts — 18 test kiểm toàn vẹn seed (đã pass)
```

UI **chỉ import từ `src/lib/quan-su`** (index.ts), không đọc thẳng `questions.ts`/`categories.ts` — để sau này nếu chuyển nguồn dữ liệu (vd sang Sanity CMS) chỉ sửa 1 chỗ.

## 3. Cấu trúc mỗi câu hỏi (`QuestionDefinition`)

| Field | Kiểu | Ý nghĩa |
|---|---|---|
| `question_id` | string | slug duy nhất toàn hệ thống (vd `chuyen-viec`) |
| `category` | CategoryId | 1 trong 14 nhóm |
| `title` | string | câu hỏi hiển thị, giọng đời thường |
| `subtitle` | string | 1 câu mô tả ngắn, giọng "quân sư đồng hành", không thuật ngữ |
| `required_inputs` | InputField[] | bắt buộc mới chạy được |
| `optional_inputs` | InputField[] | có thì dùng, không có thì bỏ qua (không suy đoán) |
| `recommended_engines` | EngineRef[] | engine ngữ cảnh nên gọi (Kinh Dịch không liệt kê ở đây vì luôn chạy) |
| `divination_method` | `luc-hao` \| `trach-nhat` | phương pháp luận đoán chính |
| `output_type` | `luan-giai` \| `chon-thoi-diem` \| `so-sanh-phuong-an` | dạng kết quả |
| `pricing_tier` | `co-ban` \| `nang-cao` \| `cao-cap` | tầng giá |
| `safety_level` | `thuong` \| `nhay-cam` \| `cao` | mức nhạy cảm → tầng cảnh báo an toàn |

> **Đổi tên so với Phase 1:** field engine đổi từ `required_engines` (Phase 1) → `recommended_engines` (Phase 2) cho đúng bản chất "engine ngữ cảnh tùy chọn, chỉ dùng khi phù hợp". Logic routing không đổi. `output_schema`/`interpretation_rules`/`safety_rules` chi tiết (Phase 1) là dữ liệu tầng luận giải, sẽ gắn vào ở Phase 3 — Phase 2 chỉ lo metadata cấp thư viện (đủ để render trang chọn + routing).

## 4. 15 nhóm và số câu hỏi (tổng 76)

| # | Nhóm | Số câu | Ghi chú |
|---|---|---|---|
| 1 | Sự nghiệp | 7 | |
| 2 | Kinh doanh | 7 | |
| 3 | Tài chính | 5 | safety = nhạy cảm (vay/cho vay/đòi nợ/thu hồi vốn/mua bán tài sản) |
| 4 | Đầu tư | 5 | safety = nhạy cảm |
| 5 | Bất động sản | 5 | góc GIAO DỊCH + ĐẤT: mua/bán đất, giữ hay bán, giao dịch, ký hợp đồng |
| 6 | Nhà cửa / Phong thủy | 7 | luận NHÀ qua Kinh Dịch — góc "phong thủy/số phận căn nhà". **KHÔNG dùng Bát Trạch/Huyền Không** |
| 7 | Hợp tác | 4 | |
| 8 | Tình duyên / Hôn nhân | 5 | (gộp 2 nhóm Phase 1 làm 1, đúng danh sách Phase 2) |
| 9 | Thi cử | 5 | |
| 10 | Thi đấu / Cạnh tranh | 4 | |
| 11 | Kiện tụng / Tranh chấp | 4 | safety = cao, có cảnh báo pháp lý ở nhóm |
| 12 | Sức khỏe | 3 | safety = cao, **có cảnh báo không thay thế y khoa** ở nhóm |
| 13 | Xuất hành | 4 | |
| 14 | Chọn ngày giờ | 6 | dùng `trach-nhat`, không gieo quẻ |
| 15 | Quyết định | 5 | `output_type = so-sanh-phuong-an` |

> **Phân vai rõ giữa "Bất động sản" (mục 5) và "Nhà cửa" (mục 6):** Bất động sản = góc GIAO DỊCH + ĐẤT (mua/bán đất, giữ hay bán, giao dịch có suôn sẻ, ký hợp đồng). Nhà cửa = luận SỐ PHẬN / PHONG THỦY của một căn NHÀ cụ thể (ở tốt hay xấu, kinh doanh/cho thuê được không, bán có lời không, khi nào nên bán). Đã **bỏ 2 câu trùng** khỏi Bất động sản (`mua-nha`, `ban-nha`) — chuyện mua/bán 1 căn nhà cụ thể giờ do nhóm Nhà cửa lo (luận sâu hơn). Cả hai nhóm đều dùng chính engine Kinh Dịch; nhóm Nhà cửa **không** dùng Bát Trạch/Huyền Không, mà luận qua quẻ theo domain "Phong thủy nhà ở" trong `LUAN_QUE_LUC_HAO_SPEC.md` mục 8.

## 5. Danh sách đầy đủ 71 câu hỏi

**Sự nghiệp:** xin-viec · chuyen-viec · nghi-viec · thang-chuc · nhan-chuc-vu-moi · cong-viec-moi · phat-trien-su-nghiep

**Kinh doanh:** mo-cua-hang · mo-doanh-nghiep · mo-rong-kinh-doanh · chuyen-dia-diem · nhap-hang · ra-san-pham · hop-tac-kinh-doanh

**Tài chính:** vay-tien · cho-vay · doi-no · thu-hoi-von · mua-ban-tai-san

**Đầu tư:** dau-tu-du-an (cao-cấp) · gop-von · rut-von · tiep-tuc-hay-dung-dau-tu · chon-phuong-an-dau-tu (so sánh)

**Bất động sản:** mua-dat · ban-dat · giu-hay-ban-bds (so sánh) · giao-dich-bds · ky-hop-dong-bds

**Nhà cửa / Phong thủy:** nha-o-tot-hay-xau · nha-co-nen-mua · nha-kinh-doanh-tot-khong · nha-cho-thue-duoc-khong · nha-ban-co-loi-khong · nha-co-ban-duoc-khong · bao-lau-nen-ban-nha

**Hợp tác:** chon-doi-tac (so sánh) · co-nen-hop-tac · co-nen-ky-hop-dong · tiep-tuc-hay-dung-hop-tac (so sánh)

**Tình duyên / Hôn nhân:** co-nen-tien-toi · quan-he-hien-tai · hon-nhan · nguoi-dang-tim-hieu · quay-lai-nguoi-cu

**Thi cử:** thi-do · chon-truong (so sánh) · chon-nganh (so sánh) · thi-lai · ky-thi-quan-trong

**Thi đấu / Cạnh tranh:** co-nen-tham-gia-thi-dau · kha-nang-canh-tranh · doi-thu · chien-thuat

**Kiện tụng / Tranh chấp:** co-nen-kien (cao-cấp) · co-nen-hoa-giai · dam-phan · tranh-chap-hop-dong

**Sức khỏe:** xu-huong-suc-khoe · dieu-tri (cao-cấp) · quyet-dinh-cham-soc-suc-khoe

**Xuất hành:** chuyen-di · cong-tac · gap-doi-tac · xuat-hanh-quan-trong

**Chọn ngày giờ:** chon-ngay-khai-truong · chon-ngay-ky-hop-dong · chon-ngay-nhap-trach · chon-ngay-xuat-hanh · chon-ngay-cuoi-hoi · chon-ngay-cong-viec-quan-trong

**Quyết định:** a-hay-b · a-b-c · tien-hay-lui · lam-ngay-hay-cho · tiep-tuc-hay-dung

## 6. Ô nhập dùng chung

| Ô | Dùng cho | Bắt buộc |
|---|---|---|
| `mo_ta_tinh_huong` (text) | mọi câu Kinh Dịch | có |
| `gieo_que` (gieo-que) | mọi câu Kinh Dịch (Lục Hào) | có |
| `ngay_sinh` (date) | câu có dùng Bát Tự/Tử Vi (để vẽ sơ đồ vận trình) | có |
| `gio_sinh` (time) | như trên | không (có thì chính xác hơn) |
| `cac_phuong_an` (phuong-an-list) | nhóm Quyết định | có |
| `khoang_thoi_gian` (date-range) | nhóm Chọn ngày giờ | có |
| `ngay_sinh_chu_su` (date) | nhóm Chọn ngày giờ | có |

## 7. Quy tắc routing đã được test đảm bảo

18 test trong `tests/quan-su-question-library.test.ts` đã pass, khóa các bất biến sau (nếu ai sửa seed sai, test đỏ ngay):

- `question_id` không trùng; mọi câu trỏ về nhóm tồn tại; không nhóm rỗng.
- Kinh Dịch KHÔNG bao giờ nằm trong `recommended_engines`; KHÔNG có `ky-mon`/`phong-thuy` (ngoài phạm vi app).
- Câu Kinh Dịch phải có bước gieo quẻ; câu dùng Bát Tự/Tử Vi phải yêu cầu ngày sinh.
- Nhóm "Chọn ngày giờ" dùng `trach-nhat` + `chon-thoi-diem` + không gieo quẻ.
- Nhóm "Quyết định" dùng `so-sanh-phuong-an` + có ô nhập danh sách phương án.
- Sức khỏe/Kiện tụng = safety `cao`; Tài chính/Đầu tư ≥ `nhay-cam`.

## 8. Việc chưa làm (để dành phase sau, KHÔNG thuộc Phase 2)

- Giao diện cuối cùng (trang chọn nhóm, trang chọn câu hỏi, luồng hỏi-đáp) — Phase 2 chỉ cung cấp dữ liệu + hàm truy vấn để UI đọc, chưa dựng UI hoàn chỉnh (đúng yêu cầu "chưa cần hoàn thiện giao diện cuối cùng").
- Tầng luận giải thật (Interpretation Engine, nạp bộ quy tắc Kinh Dịch) — Phase 3.
- `pricing_tier` hiện gán theo độ phức tạp một cách hợp lý; Thầy có thể chỉnh giá thật sau — sửa trong `questions.ts`, test không phụ thuộc giá trị giá cụ thể.
