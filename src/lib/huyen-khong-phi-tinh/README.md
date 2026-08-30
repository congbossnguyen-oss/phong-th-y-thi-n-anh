# Module Huyền Không Phi Tinh

Trạng thái (30/8/2026, chốt cuối ngày): **phần Free CÔNG KHAI** (đăng ký ở `site-config.ts` mục
Công cụ). **Phần AI (luận chi tiết) vẫn chỉ admin gọi được** — chưa chốt giá, chưa mở khách. URL:
`/dai-cat-loi/huyen-khong-phi-tinh`.

Lịch sử đổi trạng thái trong ngày (chỉ để tham khảo, đừng suy ra pattern — đây là quyết định thủ
công của anh Công từng lúc, không phải quy tắc tự động, và có lúc đổi qua lại trong lúc đang debug
lỗi session/IP): mở công khai → khoá admin-only → mở công khai lại → khoá admin-only lần 2 (lúc
này vẫn còn gặp lỗi session/IP khiến chính anh Công không vào được, dù đã tưởng vá xong) → phát
hiện + vá nốt nguyên nhân thật (`getClientIp()` ưu tiên sai header trên hạ tầng Cloudflare — xem
`fix(auth)` "ưu tiên clientAddress thay vì X-Forwarded-For") → **anh Công yêu cầu undo về trạng
thái công khai** (chốt hiện tại, không phải do lỗi kỹ thuật lần này). Nếu cần khoá lại, xem mục
"Nếu sau này muốn khoá lại" bên dưới.

## Cấu trúc

- [`engine.ts`](./engine.ts) — port TypeScript 1:1 từ `scripts/engine.py` gốc (giữ nguyên 100%
  logic), cộng thêm `vanTuNam()` (năm nhập trạch → Vận, không có trong bản Python — xem chú thích
  tại chỗ khai báo).
- [`../../../tests/huyen-khong-phi-tinh-engine.test.ts`](../../../tests/huyen-khong-phi-tinh-engine.test.ts) —
  port vitest của `self_test()`, chạy `npx vitest run tests/huyen-khong-phi-tinh-engine.test.ts`.
- [`../../components/tools/HuyenKhongPhiTinh.astro`](../../components/tools/HuyenKhongPhiTinh.astro) —
  form (Nhóm A bắt buộc + Nhóm B loan đầu tùy chọn) + kết quả Free, chạy hoàn toàn server-side
  (Astro SSR, `prerender = false`), đọc tham số qua GET query string.
- [`../../pages/dai-cat-loi/huyen-khong-phi-tinh.astro`](../../pages/dai-cat-loi/huyen-khong-phi-tinh.astro) —
  khung trang (PageHero/breadcrumbs).
- [`tri-thuc-ai.ts`](./tri-thuc-ai.ts) — nhúng CỨNG nội dung 4 file nguồn (`quy-trinh-luan-khi-co-tinh-ban.md`,
  `c-hoa-giai-sat-khi.md`, `h-81-cap-sao-va-hoa-giai.md`, `i-thu-son-xuat-sat-cua-chinh-duong-khi.md`)
  làm system prompt AI. Nhúng cứng chứ không đọc file lúc chạy vì **production là Cloudflare
  Worker, không có filesystem**.
- [`luan-ai.ts`](./luan-ai.ts) — build prompt + gọi `goiAiToolUse` (tính năng
  `huyen-khong-luan-chi-tiet`, đang route sang DeepSeek qua lớp trung gian `openai-tuong-thich`).
- [`../../pages/api/dai-cat-loi/huyen-khong-phi-tinh/luan-ai.ts`](../../pages/api/dai-cat-loi/huyen-khong-phi-tinh/luan-ai.ts) —
  route POST, tính lại tinh bàn ở server (không tin dữ liệu client gửi), gate `isAdmin` (403 cho
  khách thường).
- `docs/huyen-khong-phi-tinh/` (thư mục riêng, ngoài `src/`) — SKILL.md, TRANG-THAI-MODULE.md gốc
  và 12 file `references/` (a-i) — giữ để tra cứu / đối chiếu khi cập nhật `tri-thuc-ai.ts`, KHÔNG
  được code đọc trực tiếp lúc chạy. Cập nhật lần 2 (30/8/2026): thêm h-81-cap-sao-va-hoa-giai.md +
  i-thu-son-xuat-sat-cua-chinh-duong-khi.md, engine.py gốc cũng cập nhật theo (xem mục dưới).

## Kiểm chứng đã pass (4 mốc bắt buộc từ TRANG-THAI-MODULE.md gốc mục 3, + phần mở rộng)

| Hạng mục | Kết quả |
|---|---|
| Tinh bàn (24 sơn hướng × 9 cung × 2) | 432/432 |
| Thành Môn | 3/3 |
| Niên tinh nhập trung | 5/5 |
| Phân loại Không Vong | 8/8 |
| `vanTuNam` (năm nhập trạch → Vận) | tự viết, không có trong bản Python |
| Chính Thần/Linh Thần hợp thập cả 9 vận + Chiếu Thần | đối chiếu bảng nguồn mục 4.2/4.5 |
| Thu Sơn Xuất Sát + Chân/Giả Thành Môn | port đúng logic mã nguồn, CHƯA có ví dụ sách riêng cho điều kiện 3 (nguồn cũng chưa có) |

Chạy lại: `npx vitest run tests/huyen-khong-phi-tinh-engine.test.ts` (70 test).

## Chỗ nào tính, chỗ nào KHÔNG tính (và vì sao)

Toàn bộ engine chạy **client của Astro SSR, thuần TypeScript, 0đ, không gọi AI**. Xem
`NGUON_GOC`/`KHONG_TINH` xuất ra từ `engine.ts` để có bảng đầy đủ; tóm tắt phần quan trọng nhất:

- **KHÔNG tự nhận diện đắc/thất cách hay kết luận cát hung cuối cùng.** Nhóm B (loan đầu) do khách
  khai chỉ được **hiển thị lại** cạnh tinh bàn (badge 🏔️💧🚪...), không dùng để suy ra bất kỳ phán
  đoán nào. Việc đối chiếu là của người luận (hoặc bản Trả Phí có AI sau này).
- **KHÔNG tự nhận diện Phụ Mẫu Tam Ban / Đả Kiếp** — mô tả nguồn đúng với 54/54 tổ hợp tinh bàn nên
  không phải điều kiện phân biệt được (`canhBaoDaKiep()` trả về ghi chú "CẦN NGƯỜI LUẬN TỰ XÉT").
- **Thế Quái mặc định TẮT** (`dungTheQuai = false`) — là quyết định Tá Khố của người luận, không
  phải phép tính tự động.
- **Ý nghĩa 9 cặp cách cục (`Y_NGHIA_CAP_VAN9`) chỉ hiện ở Vận 9** — bảng nguồn chưa có dữ liệu tra
  cứu tĩnh cho vận khác. (Đã có dữ liệu 81 cặp mọi vận ở `h-81-cap-sao-va-hoa-giai.md`, nhưng dành
  cho lớp AI luận — không mã hoá thành tra cứu tĩnh vì cần đọc kèm Thời/Hình/Khí, không phải tra
  bảng máy móc.)
- Danh sách đầy đủ (Đào Hoa theo nhà, Bát Sát/Hoàng Tuyền theo sơn hướng, v.v.) nằm trong hằng số
  `KHONG_TINH` ở đầu `engine.ts`.

**Cập nhật 30/8/2026 — đã tính thêm** (trước đây nằm trong "còn thiếu" của TRANG-THAI-MODULE.md):
Chính Thần / Linh Thần / Chiếu Thần theo vận (`chinhLinhThan()`), Thu Sơn Xuất Sát từng cung
(`thuSonXuatSat()`), và điều kiện Chân/Giả Thành Môn (3 điều kiện, cập nhật `timThanhMon()`) — cả 3
đều là engine tính thuần, Free tier, 0đ, dựa trên `i-thu-son-xuat-sat-cua-chinh-duong-khi.md`.

Phần AI (Trả Phí) THÌ ĐƯỢC PHÉP tự luận đắc/thất cách và đề xuất hóa giải/kích hoạt theo từng sao —
đó là việc của AI luận (giống người luận thật), không phải engine tự suy. Ràng buộc: AI chỉ được
dùng đúng 4 nguồn nhúng ở `tri-thuc-ai.ts` (quy trình 10 bước, hóa giải sát khí theo mức đồng
thuận, hóa giải/kích hoạt theo 81 cặp sao, Thu Sơn Xuất Sát/Chính-Linh Thần/đường khí), phải nói rõ
"chưa đủ dữ liệu loan đầu" ở cung nào khách không khai Nhóm B, và không được hóa giải các tổ hợp
"cực hung không hóa giải được" — prompt trong `luan-ai.ts` đã ép các ràng buộc này.

## Kiến trúc chi phí

| Lớp | Chạy bằng | Chi phí |
|---|---|---|
| Engine tính (`engine.ts`) | TypeScript thuần, SSR | 0đ |
| Form + kết quả Free | Astro SSR đọc engine trực tiếp, CÔNG KHAI | 0đ |
| Luận AI chi tiết (`luan-ai.ts`) | DeepSeek qua `goi-ai.ts`, chỉ admin gọi | có phí AI, nhưng gate `isAdmin` ở cả UI lẫn route nên khách không gọi được → không phát sinh chi phí ngoài ý muốn |

Trạng thái (30/8/2026, chốt cuối ngày): trang Free công khai đăng ký ở `site-config.ts`, nút "Xem
luận AI" chỉ hiện khi đăng nhập admin (`HuyenKhongPhiTinh.astro`) và route `luan-ai.ts` tự kiểm
`isAdmin` lần nữa (403 nếu không). Chưa có giá trong `gia-cong-cu.ts`, chưa có checkout/order cho
phần AI.

## Nếu sau này muốn khoá lại chỉ admin xem (đã từng làm 2 lần trong ngày 30/8/2026)

1. Bọc lại toàn bộ nội dung trong `<Container>...</Container>` của `HuyenKhongPhiTinh.astro` bằng
   `{!laQuanTri ? (<div>...khoá...</div>) : (<>...nội dung hiện tại...</>)}`.
2. Gỡ dòng "Xem phong thủy nhà (Huyền Không Phi Tinh)" khỏi `site-config.ts` mục Công cụ.

## Nếu sau này muốn mở AI cho khách (chưa có kế hoạch, chỉ ghi lại các bước)

1. Bỏ gate `isAdmin` ở nút "Xem luận AI" (`HuyenKhongPhiTinh.astro`) và ở route `luan-ai.ts`.
2. Thêm giá vào `GIA_CONG_CU`, quyết định có cần checkout/order (theo mẫu `taoDonCongCu`) hay giữ
   nguyên kiểu gọi trực tiếp — tùy mô hình bán (theo lượt hay theo gói thuê bao Quân Sư).
3. Cân nhắc thêm `MODULE_KHOA_THU_NGHIEM` nếu muốn có giai đoạn thử nghiệm giới hạn trước khi mở
   hẳn, theo đúng tiền lệ `luan-giai-tu-vi`/`luan-giai-bat-tu-toan-dien`.
4. Đăng ký tool trong `src/lib/dai-cat-loi-tools.ts` (`paidTools`) nếu muốn hiện thêm ở
   `/dai-cat-loi/dich-vu-thu-phi` (không bắt buộc — trang đã có link công khai ở `site-config.ts`).
