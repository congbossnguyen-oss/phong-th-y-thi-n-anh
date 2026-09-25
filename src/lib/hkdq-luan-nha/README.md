# Module Luận Nhà theo Huyền Không Đại Quái (HKĐQ) — TEST NỘI BỘ, THẦY-ONLY

Dựng từ gói `hkdq-web-module` (SPEC.md + data/) anh Công cung cấp. Luận **một căn nhà đã có sẵn
tọa/hướng** theo HKĐQ (vòng 64 quẻ) — khác `trachnhat-engine`/`xem-ngay-cao-cap` (chọn NGÀY).

> ⚠️ **KHÔNG phải sản phẩm khách hàng.** Độ tin cậy skill nguồn ~45–55% (Đồng Nguyên Long, Phản/Phục
> Ngâm, cấu trúc hào… chưa đủ dữ liệu). Mục đích: để anh Công tự chạy thử, kiểm engine tính đúng/sai.
> Vì vậy hiện đầy đủ dữ liệu thô (kể cả phần thiếu), UI tối giản, không phân tầng free/phí.

## Các file

| File | Vai trò |
|---|---|
| `src/lib/hkdq-luan-nha/engine.ts` | Engine Bước 0–8, tính THUẦN TÚY (deterministic), `nguon:"engine"`. Không AI, không mạng. |
| `src/lib/hkdq-luan-nha/ai-hoa-giai.ts` | Bước 9 — đề xuất hóa giải (lớp AI, `nguon:"ai"`). Chạy qua nút bấm riêng, không tự động gọi. |
| `tests/hkdq-luan-nha-engine.test.ts` | 22 test: 4 ca tham khảo (VD1/VD3/VD4/case Chương I) + bảng Vận + Chính/Linh Thần + không vong + hợp thập + các chỗ null. |
| `src/components/tools/HkdqLuanNha.astro` | Gate `isAdmin` + form GET + kết quả engine + nút AI. Engine chỉ import server-side (không ở `<script>` client). |
| `src/pages/dai-cat-loi/hkdq-luan-nha.astro` | Khung trang. URL `/dai-cat-loi/hkdq-luan-nha`. |
| (đăng ký) `src/pages/dai-cat-loi/phong-thuy-chinh-phai.astro` | Card trong mục "Phong Thủy Chính Phái" (khách bấm vào thấy "đang hoàn thiện"). |

## Nguyên tắc (bám SPEC + README gói gốc)

- **BAO-TRÙM / không trùng engine**: TÁI SỬ DỤNG bảng 64 quẻ + `queTuDoSo` của
  `@thien-anh/rule-engine` (`XemNgayCaoCap`) — **không viết lại bảng 64 quẻ lần 2**.
- **Engine tính, AI viết lời**: Bước 1–8 deterministic; Bước 9 (AI) chỉ diễn giải JSON engine, không
  tự tính/suy đoán, chạy qua nút bấm riêng để kiểm soát phí API.
- **Không đoán khi thiếu dữ liệu**: chỗ nào nguồn thiếu → `null` + ghi vào `thieuDuLieu[]`.
- **Thầy-only**: engine chỉ chạy server-side (frontmatter), không có API route → không gọi được qua
  network tab. Khách chỉ thấy màn "đang hoàn thiện".

## Pipeline (mỗi Bước = 1 hàm)

| Bước | Hàm | Ghi chú |
|---|---|---|
| 0 | `validateInput` | toaDo/huongDo bắt buộc; thiếu optional → bỏ qua bước tương ứng, không chặn. |
| 1 | `xacDinhVan(namLuan)` | Nhị Nguyên Bát Vận. Vận 3: `quaiChuVan=null` (không bịa). Năm luận là tham số → loop lưu niên sau này. |
| 2 | `lapQuaiToaHuong` | dùng `queTuDoSo` (rule-engine); gắn cờ `satRanhGioi`. |
| 3 | `chinhLinhThan(van, quaiKhi)` | 2 nhóm A{1,2,3,4}/B{6,7,8,9} — đã xác nhận qua 3 ảnh la kinh. |
| 4 | `xetThuyPhap` | optional; hợp thập với Hướng + vùng Chính/Linh Thần. Đồng Nguyên Long: chưa xét (thiếu data). |
| 5 | `xetCua` | optional; thuần/tạp khí theo `soCanhMo` (heuristic sát-ranh-giới, có ghi chú). |
| 6 | `xetNoiCuc` | optional; chỉ chạy khi `mucDichLuan` khác `tong_quat`. "Phát cho ai": null. |
| 7 | `kiemTraCachCucDacBiet` | không vong, hợp thập (tính được); Phản/Phục Ngâm, Đồng Nguyên Long, Thất Tinh Đả Kiếp = null. |
| 8 | `tongHopCatHung` | mỗi nhận định có `mucDo` + `canCu`. Kết luận cát/hung cuối do anh Công. |
| 9 | `taoDeXuatHoaGiai` | **AI**, `nguon:"ai"`, nút riêng. |

## Chỗ để `null` (chưa đủ dữ liệu — chờ bổ sung, KHÔNG đoán)

`haoCauTruc` (cấu trúc 6 hào), `phanNgam`, `phucNgam`, `dongNguyenLong`, `thatTinhDaKiep`,
`soanTaiQuanNiem` (Sơn quản Đinh/Hướng quản Tài), "phát cho ai". Schema đã chừa sẵn field → khi có
dữ liệu chỉ cắm module tính riêng, không sửa Bước 1–8.

## Chạy / kiểm thử

```bash
npx vitest run tests/hkdq-luan-nha-engine.test.ts
```

Kiểm tay: mở `/dai-cat-loi/hkdq-luan-nha` khi CHƯA đăng nhập admin → chỉ thấy "đang hoàn thiện"
(Network tab không có JSON engine). Đăng nhập admin → nhập ca thật (vd Tọa 253°, Hướng 73°) → đối
chiếu tên quẻ/Quái Vận với `data/vi-du-tham-khao.md`.

## Điểm cần anh Công duyệt (ghi trong `ghiChuTinCay` của output)

1. Ngưỡng không vong mặc định `0.3°` (SPEC chỉ có "±5°" cho 24 sơn, chưa có số cho 64 quẻ).
2. Công năng Chính Thần (mở cửa/Sơn) / Linh Thần (có Thủy) — suy từ nguyên tắc chung lý khí, chưa
   trích nguyên văn tài liệu gốc.
3. Thuần/tạp khí cửa nhiều cánh — heuristic theo sát-ranh-giới (độ rộng vật lý cửa chưa có trong data).
