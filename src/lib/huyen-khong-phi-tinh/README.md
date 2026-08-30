# Module Huyền Không Phi Tinh

Trạng thái (30/8/2026, chốt cuối ngày): **CÔNG KHAI, KHÔNG DÙNG AI** — chỉ có lớp TÍNH TOÁN engine
(Free, 0đ). Luận chi tiết theo hoàn cảnh cụ thể do **CTV/chuyên gia người thật** làm; cuối trang có
CTA mời liên hệ chuyên gia (`/lien-he`). URL: `/dai-cat-loi/huyen-khong-phi-tinh`.

⚠️ **AI đã GỠ HẲN** (anh Công 30/8/2026: *"huyền không phi tinh không sử dụng AI được không? luận
như bình thường được rồi, xong CTV với chuyên gia"*). Lý do kỹ thuật kèm theo: model DeepSeek mặc
định của site là model "thinking" — từ chối tool_choice ép buộc + đốt hết token vào reasoning (>120s,
quá giới hạn Cloudflare), gây lỗi 502. Thay vì chữa cháy bằng model khác, anh Công quyết chuyển luận
chi tiết sang chuyên gia người thật. Đã xoá: route `luan-ai.ts`, lib `luan-ai.ts`, `tri-thuc-ai.ts`.
`goi-ai.ts` để nguyên (entry `huyen-khong-luan-chi-tiet` thành cấu hình thừa vô hại, không gọi tới).

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
- `docs/huyen-khong-phi-tinh/` (thư mục riêng, ngoài `src/`) — SKILL.md, TRANG-THAI-MODULE.md gốc
  và 12 file `references/` (a-i) — giữ để tra cứu. Cập nhật lần 2 (30/8/2026): thêm
  h-81-cap-sao-va-hoa-giai.md + i-thu-son-xuat-sat-cua-chinh-duong-khi.md.
  (Các file AI `luan-ai.ts` / `tri-thuc-ai.ts` / route `luan-ai.ts` ĐÃ XOÁ — xem đầu README.)

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

Chạy lại: `npx vitest run tests/huyen-khong-phi-tinh-engine.test.ts` (78 test).

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

**⚠️ Tách VẬN NHÀ vs VẬN ĐƯƠNG LỆNH (30/8/2026, anh Công báo lỗi)** — điểm dễ sai nhất, đọc kỹ:
Nhà nhập trạch năm nào thì thuộc vận đó (vd 2003 = Vận 7). Nhưng **vượng/suy của sao phải xét theo
vận ĐANG CAI QUẢN (đương lệnh, hiện tại Vận 9)**, KHÔNG phải vận lúc lập trạch. Nhà Vận 7 xem trong
Vận 9 là nhà "thoái vận" — Hướng tinh 7 lúc lập trạch vượng, nay đã thành tử khí.
- `tinhToanHuyenKhong(doHuong, vanNha, { vanHienTai })` — `vanHienTai` mặc định = `vanNha` (nhà đúng
  vận thì 2 vận trùng). Kết quả có `van_nha`, `van_hien_tai`, `da_thoai_van`.
- **Theo VẬN NHÀ (kết cấu cố định của lá số):** tinh bàn (`lapTinhBan`), nhãn cách cục
  (`nhanDienCachCuc` — VSVH, TSHT, Song Tinh…).
- **Theo VẬN ĐƯƠNG LỆNH:** vượng/suy 9 sao (`trangThaiSao`), `phanTichCung` (tt_son/tt_huong, ý nghĩa
  cặp Vận 9 gate theo vanHienTai, cảnh báo Ngũ Hoàng/Nhị Hắc thất vận), `chinhLinhThan`,
  `thuSonXuatSat`, `phanTichLuuNien` (hợp thập lưu niên), **và Thành Môn + mở cửa phụ**
  (`timThanhMon`/`xetMoCuaPhu`) — sửa 30/8/2026 (anh Công: "bây giờ đang là vận 9 nhé"): VỊ TRÍ 2 sơn
  Thành Môn cố định theo tọa-hướng (hình học), nhưng KHẢ DỤNG (chân/giả) xét theo vận đương lệnh —
  dùng vận bàn `bayTinh(vanHienTai)` + so vượng tinh vận hiện tại. Căn cứ: `thanh-mon.md` có ví dụ
  "cùng sơn Tý, Vận 8 không dùng được nhưng Vận 9 lại dùng được". (Trước đó từng hiểu nhầm "Thành Môn
  cố định" = giữ theo vận nhà; nay đã sửa cho đúng: chỉ VỊ TRÍ cố định, khả dụng đổi theo vận.)
- UI + AI đều hiện cảnh báo "THOÁI VẬN" khi `da_thoai_van`, và nói rõ cách cục Vận cũ nay đã mất thời.
- `vanHienTai` luôn tính lại ở SERVER từ năm hiện tại (component + route AI), không tin client.

Đắc/thất cách + kết luận cát hung cuối cùng: **do CTV/chuyên gia người thật luận** (không AI). Cuối
trang kết quả có CTA mời liên hệ chuyên gia (`/lien-he`) + link `/dich-vu`. Các file tri thức nhúng
(4 nguồn từng dùng cho AI) đã xoá cùng code AI — tri thức gốc vẫn còn ở `docs/.../references/`.

## Kiến trúc chi phí

| Lớp | Chạy bằng | Chi phí |
|---|---|---|
| Engine tính (`engine.ts`) | TypeScript thuần, SSR | 0đ |
| Form + kết quả Free | Astro SSR đọc engine trực tiếp, CÔNG KHAI | 0đ |
| Luận chi tiết | **CTV/chuyên gia người thật** (qua CTA `/lien-he`) | không phát sinh chi phí AI |

Toàn bộ trang 0đ, không gọi AI → công khai không rủi ro chi phí.

## Nếu sau này muốn khoá lại chỉ admin xem

1. Bọc lại toàn bộ nội dung trong `<Container>...</Container>` của `HuyenKhongPhiTinh.astro` bằng
   `{!laQuanTri ? (<div>...khoá...</div>) : (<>...nội dung hiện tại...</>)}` và khai lại
   `const laQuanTri = Astro.locals.user?.isAdmin === true;` (đã gỡ khi bỏ AI).
2. Gỡ dòng "Xem phong thủy nhà (Huyền Không Phi Tinh)" khỏi `site-config.ts` mục Công cụ.

## Nếu sau này muốn dựng lại luận AI

Khôi phục từ git history (commit trước khi gỡ AI 30/8/2026): route + lib `luan-ai.ts` + `tri-thuc-ai.ts`
+ khối UI gọi AI. LƯU Ý model: KHÔNG dùng model DeepSeek "thinking" (deepseek-v4-flash) — dùng
`deepseek-chat` (non-thinking) qua `modelOverride` trong `goi-ai.ts` + max_tokens ~12000 (đã kiểm
chứng chạy được, xem commit lịch sử).
