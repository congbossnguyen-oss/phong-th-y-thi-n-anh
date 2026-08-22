# DATABASE SCHEMA — Quân Sư Thiên Anh (Phase 1)

## 1. Ràng buộc quan trọng trước khi đọc tiếp

⚠️ Theo `docs\00-tong-quan.md` và `docs\01-kien-truc-du-lieu.md`, app hiện tại **đã có** Neon Postgres + Drizzle ORM với một schema 8 bảng, và đã có auth session-cookie + thanh toán SePay đang chạy thật. Audit lần này (Explore agent) xác nhận sự tồn tại của các mảnh đó qua `package.json`/tài liệu, nhưng **chưa đọc chi tiết từng cột của 8 bảng hiện có**. Vì vậy:

- Các bảng `users`, `payments`, `subscriptions` bên dưới **PHẢI được đối chiếu với bảng hiện có trước khi tạo** — nhiều khả năng `users` và `payments` đã tồn tại dưới tên khác trong schema Drizzle hiện tại, và Quân Sư nên **mở rộng** (thêm cột/bảng liên kết) chứ không tạo bảng trùng.
- Việc đọc file schema Drizzle thật (`src/lib/db/schema.ts` hoặc tương đương) là bước đầu tiên bắt buộc của Phase 2, KHÔNG nằm trong phạm vi audit Phase 1 này.
- Thiết kế dưới đây dùng để mô tả **hình dạng dữ liệu Quân Sư cần**, không phải file migration sẵn sàng chạy.

## 2. Danh sách bảng và vai trò

| Bảng | Vai trò | Có khả năng đã tồn tại? |
|---|---|---|
| `users` | Tài khoản | Rất có thể đã có — audit trước |
| `user_profiles` | Hồ sơ mệnh lý cá nhân (ngày giờ sinh, giới tính...) dùng lại cho nhiều câu hỏi | Mới |
| `family_profiles` | Hồ sơ người thân (dùng khi câu hỏi liên quan người khác, vd chọn ngày cưới cần cả 2 bên) | Mới |
| `question_categories` | 18 nhóm vấn đề | Mới (dữ liệu tĩnh, có thể chỉ cần seed, không cần bảng nếu quản lý bằng code — xem mục 5) |
| `questions` | Các `question_definition` cụ thể | Mới |
| `question_flows` | Trạng thái 1 lượt hỏi-đáp đang thu thập input (trước khi gieo quẻ) | Mới |
| `divination_sessions` | 1 phiên hỏi đầy đủ: câu hỏi + input + engine nào được gọi | Mới |
| `iching_readings` | Kết quả gieo quẻ Kinh Dịch của 1 session | Mới |
| `bazi_context` | Lát cắt Bát Tự đã trích (context budget) dùng cho 1 session, KHÔNG phải lá số đầy đủ | Mới |
| `tuvi_context` | Lát cắt Tử Vi đã trích cho 1 session | Mới |
| `advisory_reports` | Bài luận cuối cùng của 1 session — mở bài/thân bài/kết luận (xem QUESTION_SCHEMA.md mục 3) | Mới |
| `recommendations` | Danh sách lưu ý/cảnh báo an toàn của 1 report (ket_luan.luu_y[]) | Mới |
| `user_history` | Lịch sử các session của 1 user, phục vụ hiển thị "các câu hỏi đã hỏi" | Mới |
| `payments` | Thanh toán | Rất có thể đã có — audit trước, chỉ thêm liên kết tới `divination_sessions` |
| `subscriptions` | Gói thuê bao (nếu có) | Rất có thể đã có — audit trước |
| `premium_reports` | Bản mở rộng của `advisory_reports` cho `pricing_tier = cao-cap` (nội dung dài hơn, PDF...) | Mới |

## 3. Định nghĩa chi tiết (Drizzle-style, mô tả cột — không phải file .ts chạy được)

```
user_profiles
  id                uuid PK
  user_id           uuid FK → users.id
  full_name         text
  gender            enum('nam','nu')
  birth_date        date
  birth_time        time nullable
  birth_time_known  boolean            -- vì nhiều engine (bat-tu-engine, tu-vi) cần biết có giờ sinh hay không
  timezone          text               -- IANA, bắt buộc theo yêu cầu calendar-core
  is_self           boolean            -- true nếu là hồ sơ của chính user, false nếu là family_profile độc lập
  created_at        timestamptz
  updated_at        timestamptz

family_profiles
  id                uuid PK
  owner_user_id     uuid FK → users.id
  relationship      text               -- vd "vợ/chồng", "đối tác kinh doanh"
  full_name         text
  gender            enum('nam','nu')
  birth_date        date
  birth_time        time nullable
  birth_time_known  boolean
  timezone          text
  created_at        timestamptz

questions
  id                uuid PK
  question_id       text unique        -- slug, khớp QuestionDefinition.question_id
  category_slug     text               -- khớp question_categories, xem mục 5 về việc có cần bảng riêng
  title             text
  description       text
  definition_json   jsonb              -- toàn bộ QuestionDefinition (required_inputs, required_engines, interpretation_rules, output_schema, safety_rules)
  pricing_tier      enum('co-ban','nang-cao','cao-cap')
  is_active         boolean default true
  version           int default 1      -- đổi version khi sửa interpretation_rules, để advisory_reports cũ vẫn tra được version đã dùng
  created_at        timestamptz
  updated_at        timestamptz

question_flows
  id                uuid PK
  user_id           uuid FK → users.id
  question_id       uuid FK → questions.id
  status            enum('dang_thu_thap','san_sang_gieo_que','huy')
  collected_inputs  jsonb              -- input người dùng đã nhập, theo required_inputs/optional_inputs
  primary_profile_id    uuid FK → user_profiles.id nullable
  secondary_profile_id  uuid FK → family_profiles.id nullable   -- vd câu hỏi hôn nhân cần 2 hồ sơ
  created_at        timestamptz
  updated_at        timestamptz

divination_sessions
  id                    uuid PK
  question_flow_id      uuid FK → question_flows.id
  user_id               uuid FK → users.id
  question_id           uuid FK → questions.id
  question_version      int             -- snapshot version của questions.version lúc chạy
  engines_called         jsonb          -- danh sách EngineRef thực sự đã gọi (để audit sau này, vd nếu context-budget đổi)
  status                enum('dang_xu_ly','hoan_tat','loi')
  error_message         text nullable
  created_at             timestamptz
  completed_at           timestamptz nullable

iching_readings
  id                uuid PK
  session_id        uuid FK → divination_sessions.id
  method            text default 'luc-hao'
  raw_hexagram_data jsonb              -- output thô từ luc-hao.ts, không diễn giải
  created_at        timestamptz

bazi_context
  id                uuid PK
  session_id        uuid FK → divination_sessions.id
  profile_id        uuid                -- FK tới user_profiles hoặc family_profiles (polymorphic, ghi rõ profile_type)
  profile_type      enum('user_profile','family_profile')
  context_fields    jsonb              -- CHỈ các trường đã lọc theo interpretation_rules.contextFields, không phải lá số đầy đủ
  engine_version    text               -- versioning của bat-tu-engine lúc tính, để biết dữ liệu cũ tính bằng bản engine nào
  created_at        timestamptz

tuvi_context
  id                uuid PK
  session_id        uuid FK → divination_sessions.id
  profile_id        uuid
  profile_type      enum('user_profile','family_profile')
  context_fields    jsonb
  engine_version    text
  created_at        timestamptz

advisory_reports
  -- Cột khớp đúng OutputSchema (mo_bai/than_bai/ket_luan) trong QUESTION_SCHEMA.md mục 3 — cập nhật 2026-08-23
  -- theo quyết định output là bài luận Mở bài/Thân bài/Kết luận, không phải bảng liệt kê kỹ thuật.
  id                    uuid PK
  session_id            uuid FK → divination_sessions.id  unique
  mo_bai                 text
  than_bai                text
  cau_tra_loi             text           -- ket_luan.cau_tra_loi
  khuyen_nghi_hanh_dong   text           -- ket_luan.khuyen_nghi_hanh_dong
  thoi_diem_de_xuat       text nullable  -- ket_luan.thoi_diem_de_xuat
  output_schema_version  int
  interpretation_model   text           -- tên/version LLM đã dùng, để so sánh chất lượng qua thời gian
  llm_cost_usd           numeric nullable   -- tái dùng khái niệm ghi-log-chi-phi.ts đã có ở chart-profile
  created_at             timestamptz

recommendations
  -- Lưu ket_luan.luu_y[] (danh sách lưu ý/cảnh báo an toàn) — tách bảng riêng vì 1 report có thể nhiều lưu ý
  id                uuid PK
  report_id         uuid FK → advisory_reports.id
  order_index       int
  luu_y_text        text

user_history
  id                uuid PK
  user_id           uuid FK → users.id
  session_id        uuid FK → divination_sessions.id
  question_title_snapshot text          -- lưu lại tiêu đề lúc hỏi, phòng khi questions.title đổi sau này
  created_at         timestamptz

premium_reports
  id                    uuid PK
  report_id             uuid FK → advisory_reports.id unique
  extended_content       text
  pdf_url                text nullable
  payment_id              uuid FK → payments.id   -- LIÊN KẾT tới bảng payments hiện có, không tạo bảng payments mới
  created_at              timestamptz
```

## 4. Sơ đồ quan hệ (rút gọn)

```
users ──< user_profiles
users ──< family_profiles (owner)
users ──< question_flows ──> questions
question_flows ──< divination_sessions ──> questions (snapshot version)
divination_sessions ──1:1── iching_readings
divination_sessions ──< bazi_context (0..n, tùy required_engines)
divination_sessions ──< tuvi_context (0..n)
divination_sessions ──1:1── advisory_reports ──< recommendations
advisory_reports ──0:1── premium_reports ──> payments (bảng đã có)
users ──< user_history ──> divination_sessions
```

## 5. `question_categories` — cân nhắc không cần bảng riêng

18 nhóm vấn đề gần như tĩnh (ít khi đổi). Có thể quản lý bằng 1 file dữ liệu TypeScript/JSON trong code (giống `dai-cat-loi-tools.ts`) thay vì 1 bảng DB riêng — bảng DB chỉ cần thiết nếu Thầy muốn tự thêm/sửa nhóm qua CMS (Sanity) mà không cần deploy code. Đề xuất: Phase 2 quyết định — nếu quản lý qua Sanity thì đây là 1 document type mới trong Sanity, không phải bảng Postgres.

## 6. Việc còn thiếu cần làm ở đầu Phase 2 (không phải Phase 1)

1. Đọc file schema Drizzle thật hiện có, đối chiếu từng bảng trên với bảng đã tồn tại (đặc biệt `users`, `payments`, `subscriptions`).
2. Xác nhận cơ chế polymorphic (`profile_type`) có phù hợp với quy ước hiện có của dự án hay không — dự án hiện dùng "string refs only, không SQL FK chéo giữa Sanity/Postgres" (theo `00-tong-quan.md`), cần xem quy ước tương tự có áp dụng cho polymorphic FK nội bộ Postgres hay không.
3. Viết migration Drizzle thật sau khi Thầy duyệt thiết kế này.
