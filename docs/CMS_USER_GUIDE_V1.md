# HƯỚNG DẪN SỬ DỤNG QUÂN SƯ CMS V1

> Tài liệu dành cho **nhân viên vận hành**: người phụ trách tư vấn, quản lý đơn hàng, quản lý học viên.
> Viết theo kiểu quy trình thực tế (SOP). Không cần biết kỹ thuật vẫn làm được.
> Bản này mô tả đúng những gì hệ thống **hiện có** (CMS V1). Nếu thấy khác thực tế, báo quản trị — đừng tự đoán.

---

## A. Tổng quan

**CMS là gì:** là trang quản trị nội bộ (Directus) để nhân viên xem và xử lý dữ liệu khách hàng, đơn hàng, yêu cầu tư vấn và học viên. Khách hàng KHÔNG thấy trang này.

**Nhân viên dùng CMS để:**
- Xem hồ sơ khách hàng và mọi hoạt động liên quan (Customer 360).
- Theo dõi và xử lý yêu cầu tư vấn (đổi trạng thái Mới → Đã liên hệ → Đã chốt/Hủy).
- Xem đơn hàng và biết đơn nào cần xử lý.
- Đăng ký học viên học offline; xem tiến độ/chứng chỉ.
- Xem và tạo/sửa mã khuyến mãi.

**Chỉ được XEM (không sửa):**
- Thông tin tài khoản khách hàng (users).
- Đơn hàng (orders) và chi tiết đơn.
- Subscription (gói Quân Sư), chứng chỉ, tiến độ học, lịch sử dùng Quân Sư.

**Được THAY ĐỔI:**
- Yêu cầu tư vấn (tạo, sửa, đổi trạng thái).
- Đăng ký học viên offline (tạo/sửa một số trường).
- Mã khuyến mãi (tạo/sửa).

---

## B. Đăng nhập

1. Mở trình duyệt, vào: **https://directus-admin-v1.onrender.com**
2. Nhập **email và mật khẩu tài khoản nhân viên** đã được cấp. (Không dùng chung, không đưa mật khẩu cho người khác.)
3. Bấm **Sign In**.

**Lưu ý:**
- Lần đầu mở trong ngày có thể chờ **~1 phút** (hệ thống “thức dậy”). Đợi, đừng bấm lại liên tục.
- Đăng xuất khi rời máy chung.
- Không lưu mật khẩu trên máy lạ.
- Nếu quên mật khẩu: liên hệ quản trị (không tự đặt lại).

[SCREENSHOT: Màn hình đăng nhập Directus]

---

## C. Dashboard — “Tổng quan hằng ngày”

Sau khi đăng nhập, mở mục **Insights → Tổng quan hằng ngày**. Đây là màn hình mở lên là biết ngay hôm nay có gì cần làm. Có **7 ô (panel)**:

[SCREENSHOT: Dashboard — Tổng quan hằng ngày (đủ 7 panel)]

**Hàng 1 — Cần xử lý**

1. **Đơn cần xử lý** — số đơn đang **chờ thanh toán**.
   - Quan tâm khi: số > 0.
   - Tiếp theo: mở mục Đơn hàng, lọc đơn chờ thanh toán để theo dõi.

2. **Tư vấn mới — chưa xử lý** — số yêu cầu tư vấn đang ở trạng thái **Mới**.
   - Quan tâm khi: số > 0 (có khách chờ được liên hệ).
   - Tiếp theo: xem panel số 7 để lấy danh sách và gọi khách.

**Hàng 2 — Mới trong ngày**

3. **Khách hàng mới (24h)** — số tài khoản khách đăng ký trong 24 giờ qua.
   - Quan tâm khi: muốn biết có khách mới.
   - Tiếp theo: tra hồ sơ khách khi cần (mục Khách hàng).

4. **Đơn hàng mới (24h)** — số đơn tạo trong 24 giờ qua.
   - Quan tâm khi: theo dõi doanh số/đơn trong ngày.
   - Tiếp theo: mở mục Đơn hàng để xem chi tiết.

**Hàng 3**

5. **Tư vấn đang xử lý** — số yêu cầu tư vấn đang ở trạng thái **Đã liên hệ** (đã gọi, chưa chốt/hủy).
   - Quan tâm khi: cần theo dõi các ca đang chăm sóc.
   - Tiếp theo: mở từng yêu cầu, cập nhật trạng thái khi có kết quả.

6. **Enrollment mới (7 ngày)** — số lượt đăng ký học trong 7 ngày qua.
   - Quan tâm khi: theo dõi học viên mới.
   - Tiếp theo: mở mục Học viên để xem/đăng ký.

**Hàng 4 — Danh sách để hành động**

7. **Cần liên hệ — Danh sách tư vấn mới** — danh sách chi tiết các yêu cầu tư vấn còn **Mới**, mới nhất lên đầu, hiển thị **tên · số điện thoại · thời gian gửi**.
   - Quan tâm khi: bắt đầu ca làm việc.
   - Tiếp theo: gọi từng khách, sau đó đổi trạng thái sang **Đã liên hệ** (xem mục E).

---

## 🔔 Thông báo vận hành — Email

Hệ thống **tự gửi email** tới hộp thư vận hành khi có sự kiện quan trọng, để nhân viên biết ngay mà không phải liên tục mở CMS.

| Sự kiện | Có email? | Nội dung email |
|---|---|---|
| **Yêu cầu tư vấn mới** (khách gửi form `/lien-he`) | ✅ | Tên khách, SĐT, chủ đề, lời nhắn |
| **Thanh toán thành công** (đơn được xác nhận đã trả tiền) | ✅ | Mã đơn, tên khách, số tiền, loại đơn |

**Cách nhận:**
1. Email gửi vào hộp thư vận hành đã cấu hình (do quản trị đặt). Nhân viên phụ trách theo dõi hộp thư này.
2. Nhận được email → mở CMS để xử lý (tư vấn: đổi trạng thái; đơn: kiểm tra).

**Lưu ý:**
- Email là kênh **nền tảng, đáng tin cậy nhất** cho thông báo vận hành.
- Nếu email tạm thời lỗi, **nghiệp vụ chính vẫn chạy bình thường** (khách vẫn gửi được form, thanh toán vẫn được ghi nhận) — chỉ là thiếu email báo; luôn có thể kiểm tra lại trên **Dashboard** và danh sách trong CMS.
- **Thanh toán được thông báo đúng 1 lần** cho mỗi đơn (không gửi trùng khi cổng thanh toán gọi lại).
- **Chưa có** thông báo email cho: khách hàng mới, enrollment, đơn chưa thanh toán → theo dõi các mục này qua **Dashboard**.

> **Web Push (thông báo đẩy trên trình duyệt/điện thoại)**: *đang phát triển, chưa bật ở phiên bản này*. Hiện chỉ có email. Khi có, tài liệu sẽ hướng dẫn cách bật.

[SCREENSHOT: Email thông báo "Thanh toán thành công"]

Dù có email hay không, **Directus Dashboard vẫn là nơi kiểm tra chi tiết** đầy đủ.

---

## D. Khách hàng — Customer 360

“Customer 360” = mở một khách hàng ra là thấy **toàn bộ hoạt động** của họ trong một chỗ.

**Tìm và mở hồ sơ khách:**
1. Menu trái → **Khách hàng (Users)**.
2. Dùng ô tìm kiếm theo **tên / email / số điện thoại**.
3. Bấm vào dòng khách để mở hồ sơ.

[SCREENSHOT: Danh sách Khách hàng + ô tìm kiếm]

**Thông tin cơ bản xem được:** tên, email, số điện thoại, ngày sinh, giới tính, ngày tạo tài khoản.

**Các nhóm dữ liệu liên quan (8 nhóm) — cuộn xuống trong hồ sơ khách:**

| Nhóm | Ý nghĩa |
|---|---|
| **Đơn hàng** | Các đơn khách đã đặt |
| **Subscription** | Gói Quân Sư khách đang/đã dùng |
| **Course enrollment** | Các khóa học khách đã ghi danh |
| **Course certificate** | Chứng chỉ khóa học của khách |
| **Lesson progress** | Tiến độ học từng bài |
| **Quân Sư usage** | Lượt sử dụng Quân Sư theo tháng |
| **Quân Sư câu hỏi** | Thống kê câu hỏi Quân Sư |
| **Yêu cầu tư vấn** | Các yêu cầu tư vấn khách đã gửi |

[SCREENSHOT: Hồ sơ khách — các nhóm dữ liệu liên quan]

**Lưu ý:** các nhóm này để **xem**. Nhân viên **không sửa** thông tin tài khoản khách trong CMS V1.

---

## E. Yêu cầu tư vấn

Đây là công việc chính hằng ngày. Mỗi yêu cầu tư vấn có một **trạng thái**:

| Trạng thái | Khi nào dùng |
|---|---|
| **Mới** | Khách vừa gửi, **chưa ai liên hệ**. (Mặc định khi khách gửi form.) |
| **Đã liên hệ** | Đã gọi/nhắn được cho khách, đang trao đổi. |
| **Đã chốt** | Khách đồng ý/hoàn tất (đặt dịch vụ, chốt lịch…). |
| **Hủy** | Khách không có nhu cầu, sai số, spam, hoặc không liên hệ được sau khi đã cố. |

**Luồng chuẩn:** Mới → Đã liên hệ → Đã chốt *(hoặc)* Mới → Đã liên hệ → Hủy.

**Cách xử lý một yêu cầu:**
1. Vào Dashboard → panel **Cần liên hệ — Danh sách tư vấn mới** (hoặc menu → **Yêu cầu tư vấn**).
2. Bấm vào một dòng để mở, xem tên/SĐT/nội dung.
3. Gọi/nhắn cho khách.
4. Sau khi liên hệ: đổi ô **Trạng thái** sang **Đã liên hệ**, bấm **Save (✓)**.
5. Khi có kết quả cuối: đổi sang **Đã chốt** hoặc **Hủy**, rồi **Save**.

[SCREENSHOT: Yêu cầu tư vấn — ô chọn Trạng thái]

**Lưu ý:** không xóa yêu cầu tư vấn để “dọn danh sách”. Dùng **Hủy** thay vì xóa (xem mục I).

---

## F. Đơn hàng

**Xem đơn:**
1. Menu trái → **Đơn hàng (Orders)**.
2. Bấm vào một đơn để xem chi tiết.

**Xem được:** trạng thái đơn, phương thức thanh toán, tên/SĐT/email khách, tổng tiền, mã đơn, thời điểm thanh toán, mã khuyến mãi áp dụng, và danh sách sản phẩm trong đơn.

**Trạng thái đơn:** Chờ thanh toán / Đã xác nhận / Đã giao / Đã hủy.
- Đơn **Chờ thanh toán** là đơn cần theo dõi (khớp với panel “Đơn cần xử lý”).

[SCREENSHOT: Chi tiết một đơn hàng]

**Nhân viên KHÔNG được làm với đơn hàng:**
- **Không đổi trạng thái đơn** (xác nhận/giao/hủy) trong CMS V1 — nhân viên chỉ **xem**.
- Trạng thái đơn do hệ thống/quản trị xử lý. Nếu cần thay đổi, báo quản trị.

> Ghi chú: CMS V1 chưa mở quyền cho nhân viên chuyển trạng thái đơn. Đừng tự tạo quy trình xác nhận đơn ngoài những gì hệ thống cho phép.

---

## G. Học viên / Enrollment

**Xem enrollment:**
1. Menu trái → **Course enrollment (Ghi danh khóa học)**.
2. Bấm một dòng để xem chi tiết.

**Ý nghĩa nguồn ghi danh:**
- **online_purchase**: khách tự mua khóa học online (hệ thống tạo). **Không sửa** các ghi danh loại này.
- **offline_registration**: nhân viên đăng ký giúp khách học offline.

**Đăng ký học viên offline (nếu được cấp quyền):**
1. Vào **Course enrollment** → **Create Item (+)**.
2. Điền: khóa học, tên liên hệ, số điện thoại, ngày ghi danh; nguồn để là **offline_registration**.
3. Bấm **Save**.

[SCREENSHOT: Tạo ghi danh offline]

**Chứng chỉ (Course certificate) và Tiến độ học (Lesson progress):** chỉ **xem**, không sửa.

**Lưu ý:** một số ô sẽ bị khóa (không nhập được) — đó là do thiết kế. Không cố sửa các ô bị khóa.

---

## H. Mã khuyến mãi

**Xem mã:** Menu trái → **Promo codes** → bấm để xem chi tiết.

**Tạo mã (nếu được cấp quyền):**
1. **Promo codes → Create Item (+)**.
2. Điền: mã, loại giảm, giá trị giảm, giới hạn lượt dùng, hạn dùng, bật/tắt (is_active).
3. **Save**.

**Sửa mã:** mở mã → chỉnh các ô cho phép → **Save**. Muốn ngừng một mã: đặt **is_active = tắt** (không xóa).

**Lưu ý quan trọng:**
- **Không chỉnh ô “số lượt đã dùng” (used_count)** — đây là số hệ thống tự đếm; sửa tay sẽ làm sai số liệu. Nếu ô này bị khóa thì càng không đụng tới.
- Lượt dùng (promo redemptions) chỉ để **xem**.

[SCREENSHOT: Chi tiết mã khuyến mãi]

---

## I. Quyền hạn & an toàn — NHỮNG VIỆC KHÔNG ĐƯỢC LÀM

Tài khoản nhân viên được cấp quyền **tối thiểu cần thiết**. Tuyệt đối:

- **KHÔNG** tìm cách xem/sửa mật khẩu tài khoản khách (trường mật khẩu bị ẩn hoàn toàn).
- **KHÔNG** chỉnh quyền quản trị của bất kỳ ai (không có ô “is_admin” cho nhân viên).
- **KHÔNG** đụng tới phiên đăng nhập (sessions) hay mã đặt lại mật khẩu (password reset).
- **KHÔNG** vào/sửa các mục hệ thống & nhạy cảm (cấu hình Directus, người dùng hệ thống, vai trò/quyền, luồng tự động, lịch sử luận giải Quân Sư…). Nếu không thấy chúng trong menu — đó là **đúng**, không phải lỗi.
- **KHÔNG** sửa thông tin tài khoản khách hàng (chỉ xem).
- **KHÔNG** đổi trạng thái đơn hàng.
- **KHÔNG tự ý xóa dữ liệu.** Với yêu cầu tư vấn: dùng **Hủy** thay vì xóa. Việc xóa bất kỳ dữ liệu nào phải theo quy trình được quản trị phê duyệt.

Nếu một thao tác bị hệ thống chặn (báo không đủ quyền) → **đó là bình thường**, không phải lỗi. Báo quản trị nếu thật sự cần.

---

## J. Quy trình làm việc hằng ngày (checklist)

```
[ ] Đăng nhập CMS (directus-admin-v1.onrender.com)
[ ] Mở Insights → Tổng quan hằng ngày
[ ] Xem "Đơn cần xử lý" — nếu > 0, kiểm tra mục Đơn hàng
[ ] Xem "Tư vấn mới — chưa xử lý"
[ ] Mở panel "Cần liên hệ — Danh sách tư vấn mới" → gọi khách
[ ] Sau khi gọi: đổi trạng thái tư vấn (Đã liên hệ / Đã chốt / Hủy) → Save
[ ] Kiểm tra "Tư vấn đang xử lý" — theo dõi ca đang chăm sóc
[ ] Tra hồ sơ khách hàng khi cần (Customer 360)
[ ] Kiểm tra "Enrollment mới (7 ngày)" nếu phụ trách học viên
[ ] Kiểm tra Promo nếu có nhiệm vụ
[ ] Đăng xuất khi kết thúc ca (nếu dùng máy chung)
```

---

## K. FAQ

**1. Tôi thấy một khách hàng nhưng không thấy đơn hàng của họ?**
Bình thường — khách đó chưa đặt đơn nào, hoặc đơn được đặt bằng thông tin (SĐT/email) khác chưa gắn với tài khoản. Không tự gán đơn cho khách.

**2. Tại sao một yêu cầu tư vấn không có khách hàng liên kết?**
Vì khách **gửi form khi chưa đăng nhập** (khách vãng lai). Hệ thống chỉ gắn tài khoản khi khách đã đăng nhập lúc gửi. Không tự đoán/tự gán khách bằng SĐT hay email.

**3. Tôi có thể sửa thông tin khách hàng không?**
Không. CMS V1 cho nhân viên **chỉ xem** thông tin khách. Cần sửa thì báo quản trị.

**4. Tôi có thể xóa yêu cầu tư vấn không?**
Không nên. Dùng trạng thái **Hủy** thay vì xóa. Xóa dữ liệu chỉ khi có quy trình được phê duyệt.

**5. Tại sao số trên Dashboard khác với số dòng tôi đếm trong danh sách?**
Vì mỗi panel đếm theo **bộ lọc và khoảng thời gian riêng** (ví dụ “24 giờ qua”, “trạng thái = Mới”). Danh sách đầy đủ có thể nhiều hơn con số đã lọc.

**6. Tôi không thấy một mục/collection nào đó, có phải lỗi không?**
Không. Nhân viên chỉ thấy những mục thuộc phạm vi công việc. Các mục hệ thống/nhạy cảm được ẩn có chủ đích. Nếu thật sự cần một mục → **cần kiểm tra quyền hoặc quy trình quản trị**.

**7. Đăng nhập lâu / trang trắng lúc đầu?**
Lần đầu trong ngày hệ thống cần ~1 phút để khởi động. Đợi rồi tải lại một lần. Nếu vẫn lỗi → báo quản trị.
