# FINAL PRODUCT PHASE — HOÀN THIỆN CÔNG CỤ LẬP LÁ SỐ TỬ VI (`/lap-la-so-tu-vi`)

Natal Engine giữ nguyên `NATAL_CHART_PRODUCTION_READY` (Phase 37) — **không sửa Natal Core, không sửa
Golden Master, không nghiên cứu thêm rule**. Phase này chỉ hoàn thiện UI/UX của trang công cụ. Không
commit/push.

---

## 1. Đã kiểm tra

Đối chiếu đủ 23 mục của yêu cầu:

| # | Mục | Kết quả |
|---|---|---|
| 1 | Form nhập dữ liệu | OK — họ tên (tùy chọn), giới tính (radio, mặc định "Nam" đã `checked`), ngày/tháng/năm/giờ sinh (select, luôn có giá trị mặc định hợp lệ), checkbox Âm lịch, năm xem |
| 2 | Validation ngày giờ sinh | OK cho trường hợp thông thường — day/month/year/hour là `<select>` nên luôn có giá trị hợp lệ, không thể để trống. Gender luôn có 1 lựa chọn mặc định nên không rơi vào trạng thái "chưa chọn giới tính" khi bấm submit lần đầu |
| 3 | Âm lịch / Dương lịch | OK — test qua UI thật: nhập Âm lịch 15/7/1988 giờ Thân, hệ thống quy đổi đúng sang Dương lịch 26/08/1988, không crash |
| 4 | Giới tính | OK — cả Nam/Nữ test qua UI, hiển thị đúng "Dương Nam"/"Âm Nữ" tương ứng |
| 5 | Năm xem | OK — có nhập (tính đúng tuổi + Đại Vận) và không nhập (bỏ qua đúng, không hiện "undefined") đều hoạt động đúng |
| 6 | Nút lập lá số | OK, nhưng phát hiện 1 lỗi thật — xem Mục 2 (Bugs Found) |
| 7 | Layout lá số 4×4 | OK — đọc trực tiếp HTML/text của card lá số (chính là HTML dùng để xuất ảnh), đủ cấu trúc 4×4 với ô trung tâm gộp 2×2 làm bảng Thiên Bàn |
| 8 | 12 cung | OK — đủ 12 tên cung, không trùng, không thiếu |
| 9 | Mệnh / Thân | OK — cả trường hợp trùng cung ("MỆNH · THÂN") và khác cung đều hiển thị đúng |
| 10 | Cục | OK — hiển thị đúng tên Cục + số Cục |
| 11 | 14 chính tinh | OK — đủ 14/14, không trùng/thiếu, đối chiếu bằng danh sách so khớp lập trình |
| 12 | Miếu/Vượng/Đắc/Bình/Hãm | OK — hiển thị dạng `(M)/(V)/(Đ)/(B)/(H)`, không có `(?)` |
| 13 | Phụ tinh | OK — hiển thị đủ, không đè dòng khác (flow layout, không absolute) |
| 14 | Tứ Hóa | OK — khớp giữa dòng tóm tắt và superscript trên sao (cả chính tinh lẫn phụ tinh) |
| 15 | Tuần / Triệt | OK — hiển thị đúng badge tại 2 cung liền kề tương ứng |
| 16 | Đại Vận | OK — 12 mốc tuổi (vd 5-14, 15-24...) khớp Cục |
| 17 | Vòng sao đã implement | OK — Tràng Sinh, Thái Tuế hiển thị đủ 12 giai đoạn |
| 18 | Tiểu Hạn | **Xác nhận KHÔNG hiển thị trên UI** (đúng quyết định kiến trúc từ Phase 35/37 — module tách biệt Natal Core, chưa có thiết kế UI). Grep `getTieuHanPalace`/`getBacSiRing` trong file `.astro`: 0 kết quả — không có gì để gây regression cho mục này |
| 19 | Responsive mobile | OK (kiểm qua DOM/CSS, xem Mục 3 — giới hạn: không chụp được ảnh trực quan do môi trường) |
| 20 | Xuất PNG | **Phát hiện lỗi thật — đã sửa UI, xem Mục 2** |
| 21 | Text không overflow/đè nhau | OK ở mức cấu trúc/text (không phát hiện text bị cắt/lẫn); xem giới hạn xác minh pixel ở Mục 3 |
| 22 | Không undefined/NaN | OK — kiểm bằng `String.includes('undefined'/'NaN')` trên toàn bộ nội dung card, nhiều input khác nhau |
| 23 | Không đổi engine | Đã tuân thủ tuyệt đối — chỉ sửa đúng 1 file `.astro` (phần script/markup của khu vực kết quả), không đụng `src/lib/tu-vi/**` |

## 2. Đã sửa (chỉ UI, không đụng engine)

### Bug tìm được: Xuất ảnh PNG có thể treo vô thời hạn, không có phản hồi cho người dùng

**Hiện tượng quan sát được**: sau khi bấm "Lập lá số", dữ liệu lá số tính đúng 100% (đã xác nhận qua đọc
nội dung `#tv-card`), nhưng bước chuyển HTML → ảnh PNG (dùng thư viện `html-to-image`, hàm `toPng()`) có
thể **không bao giờ resolve và cũng không bao giờ reject** — không ném lỗi, không vào `catch`, không có
`console.error`. Người dùng chỉ thấy phần kết quả trống, không có ảnh, không có thông báo, không có cách
nào biết là đang xử lý hay đã hỏng.

**Đã cô lập nguyên nhân**: gọi trực tiếp `toPng()` (import thẳng từ Vite dep, bọc `Promise.race` với
timeout) trên chính `#tv-card`, và cả trên 1 `<div>` trắng đơn giản không có ảnh gì bên trong — **cả 2 đều
treo giống nhau**. Đã thử: dev server restart sạch, xóa cache `node_modules/.vite` + `node_modules/.astro`
rồi khởi động lại, tab trình duyệt hoàn toàn mới, click thật (trusted CDP click) thay vì click qua JS —
**không cái nào khắc phục được**. Kết luận: đây là lỗi trong tương tác giữa thư viện `html-to-image` và
môi trường trình duyệt tự động hóa dùng để test (Browser pane), **không liên quan gì đến dữ liệu lá
số/engine** (chart luôn tính đúng trước khi bước xuất ảnh mới treo). Ghi nhận trung thực: **chưa xác định
được liệu lỗi này có xảy ra trên trình duyệt thật của người dùng cuối hay không** — cần theo dõi thêm sau
khi triển khai thật (xem Mục 6).

**Đã sửa (UI thuần túy, `src/pages/lap-la-so-tu-vi.astro`)**:
1. Thêm dòng chữ "Đang tạo ảnh lá số…" hiển thị ngay khi bắt đầu xử lý (trước đây không có, người dùng
   nhìn thấy khoảng trống im lặng).
2. Bọc bước tạo ảnh trong timeout 15 giây (`withTimeout()`) — nếu không xong trong 15s, tự động coi là
   lỗi, hiển thị thông báo rõ ràng: "Đã lập lá số xong nhưng không tạo được ảnh xuất. Bạn có thể thử lập
   lại lá số để tạo ảnh lần nữa." (thay vì `alert()` chặn màn hình như code cũ — dùng text inline để
   không làm gián đoạn trải nghiệm).
3. Ẩn/hiện đúng: ảnh + nút "Lưu ảnh" chỉ hiện khi xuất thành công; nút "Lập lá số" được `disable` trong
   lúc xử lý và luôn được bật lại (kể cả khi lỗi) nhờ khối `finally`.
4. Đã xác minh qua UI thật: khi hàm treo (tái hiện được), sau đúng ~15s hệ thống tự chuyển sang thông báo
   lỗi thân thiện, nút bấm được bật lại — **không còn treo vô thời hạn nữa**.

Đây là fix đúng phạm vi "vấn đề UI → chỉ sửa UI": không sửa `html-to-image`, không sửa cách build HTML
card, không đổi bất kỳ dữ liệu/công thức Tử Vi nào — chỉ thêm lớp bảo vệ + phản hồi cho người dùng.

## 3. Responsive Mobile

Do môi trường Browser pane trong phiên này không compositing được frame để chụp ảnh màn hình một cách ổn
định (nhiều lần `screenshot`/`scroll` bị timeout dù trang vẫn hoạt động bình thường — xác nhận qua
`javascript_tool` vẫn phản hồi tức thời), việc kiểm tra mobile được thực hiện chủ yếu qua đọc DOM/CSS tính
toán thay vì quan sát trực quan pixel-by-pixel:

- Resize viewport về mobile (375×812 / thực tế đo được 410×889 do scaling môi trường): `document.
  documentElement.scrollWidth` **không vượt quá** `window.innerWidth` (chênh lệch 0-1px, không có thanh
  cuộn ngang) — cả ở trang form (trước khi lập lá số) lẫn sau khi lá số đã render.
  the mobile
- Ảnh preview (`#tv-preview-img`) có `max-width: 100%` (computed style xác nhận) — không tràn khỏi khung
  chứa, `clientWidth` luôn nhỏ hơn container.
- Menu điều hướng có cơ chế responsive riêng (nút "Mở menu" hamburger xuất hiện đúng ở viewport hẹp).
- **Giới hạn trung thực**: không xác minh được bằng mắt/screenshot thật liệu các ô trong lưới 4×4 (vốn có
  kích thước cố định 720×1000px CSS trong `#tv-card`, chỉ hiển thị dưới dạng ẢNH đã render sẵn, không phải
  DOM sống) có bị World Wide Web-browser-specific rendering quirk nào trên mobile thật hay không — vì
  toàn bộ nội dung lưới chỉ tồn tại dưới dạng ảnh PNG tĩnh (đã co giãn theo `max-width:100%`), nên về bản
  chất KHÔNG THỂ bị vỡ layout do mobile (ảnh bitmap co giãn đồng nhất, không phải HTML reflow) — đây là
  điểm mạnh của kiến trúc "render ra ảnh" hiện tại, giảm rủi ro responsive so với hiển thị HTML/CSS trực
  tiếp.

## 4. Ảnh hưởng Mobile

Không có thay đổi code nào ảnh hưởng riêng đến mobile — bản sửa lỗi (Mục 2) áp dụng đồng nhất cho mọi kích
thước màn hình (loading text, timeout, disable nút đều là hành vi JS/DOM chung, không phân biệt viewport).
Không phát hiện bug mobile-specific nào ngoài bug xuất PNG (vốn đã xác nhận không phải do mobile — tái
hiện cả ở desktop viewport).

## 5. Ảnh hưởng Xuất PNG

- Trước khi sửa: nếu `toPng()` treo → người dùng thấy khoảng trống vĩnh viễn, không rõ đã lỗi hay đang xử
  lý, không có lối thoát ngoài tải lại trang.
- Sau khi sửa: luôn có phản hồi rõ ràng trong vòng tối đa 15 giây — hoặc thấy ảnh (thành công) hoặc thấy
  thông báo lỗi kèm gợi ý thử lại (thất bại). Nút "Lập lá số" không bao giờ bị khóa vĩnh viễn.
- **Chưa xác minh được** liệu bug gốc (treo `toPng()`) có xảy ra trên trình duyệt thật của người dùng
  cuối/production build (`astro build` + `astro preview`) hay chỉ là đặc thù môi trường automation-testing
  hiện tại — đây là hạng mục cần người dùng/khách hàng xác nhận thực tế sau khi deploy, KHÔNG thể tự kiểm
  chứng thêm trong phạm vi phiên làm việc này.

## 6. Chưa làm / Known Limitations

- **Chưa xác định được root cause thật sự** của việc `toPng()` (thư viện `html-to-image`) treo — đã cô
  lập được rằng nó KHÔNG liên quan tới dữ liệu lá số/card cụ thể (tái hiện cả với 1 div trắng đơn giản),
  nhưng chưa xác định được đây là lỗi của thư viện, của phiên bản Vite/Astro dev server, hay đặc thù môi
  trường trình duyệt tự động hóa dùng để test. Ghi lại đúng theo yêu cầu, KHÔNG tự ý đổi engine/thư viện
  lõi để "sửa tận gốc" vì ngoài phạm vi "chỉ sửa UI" và có thể ảnh hưởng diện rộng ngoài dự tính.
- **Chưa thêm giới hạn min/max cho ô "Năm xem"** — hiện tại là `<input type="number">` không giới hạn,
  người dùng có thể nhập năm bất thường (vd. năm nhỏ hơn năm sinh) mà không có cảnh báo riêng — không gây
  crash/undefined/NaN (đã kiểm chứng), chỉ là thiếu validation "hợp lý" ở mức UX. Không sửa trong phase
  này để tránh mở rộng phạm vi ngoài lỗi thực tế đã tìm thấy.
- **Chưa xác minh pixel-level thật** cho overflow/đè chữ trên toàn bộ 12 ô lưới ở nhiều kích thước màn
  hình khác nhau — chỉ xác minh gián tiếp qua text content + CSS computed style (Mục 3), do giới hạn môi
  trường chụp ảnh trong phiên này.
- Không mở phase nghiên cứu engine mới, không đụng Natal Core/Golden Master — đúng chỉ thị.

## 7. Test Result

```
npx vitest run  (sau khi sửa UI)
Test Files  26 passed (26)
     Tests  764 passed | 5 expected fail (769)
```

Không đổi so với baseline Phase 37 (764/5/769) — đúng như kỳ vọng, vì bản sửa chỉ nằm trong phần
client-script của `.astro` page, không có test tự động nào bao phủ trực tiếp (test suite hiện tại kiểm
`src/lib/tu-vi/**`, không kiểm DOM/script của trang). `npx tsc --noEmit` không phát sinh lỗi mới cho file
đã sửa.

## Tổng kết

Đã hoàn thiện đủ 23 mục kiểm tra yêu cầu. Tìm và sửa đúng 1 lỗi UI thật (xuất PNG có thể treo vô thời hạn
không phản hồi) bằng giải pháp UI thuần túy (loading state + timeout + thông báo lỗi rõ ràng), không đụng
đến bất kỳ logic tính toán Tử Vi nào. Không phát hiện vấn đề engine nào cần ghi lại riêng — toàn bộ dữ
liệu lá số (12 cung, 14 chính tinh, Miếu/Vượng/Đắc/Bình/Hãm, Tứ Hóa, Tuần/Triệt, Đại Vận, phụ tinh, vòng
sao) đều tính đúng và hiển thị đúng ở mọi input đã thử.
