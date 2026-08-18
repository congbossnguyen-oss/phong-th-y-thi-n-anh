# 12 Trực --- Phân loại tốt xấu theo mục đích công việc

## Nguyên tắc sử dụng

12 Trực nên được dùng như một **lớp đánh giá theo mục đích công việc**,
không nên dùng độc lập để kết luận ngày tốt hoặc ngày xấu tuyệt đối.

Khi đánh giá một ngày, cần kết hợp Trực với: - Thần sát - Hoàng đạo /
Hắc đạo - Tuổi người dùng - Mục đích công việc - Các điều kiện đặc biệt
của từng module - Các quy tắc hóa giải hoặc loại trừ đã được thiết lập
trong engine

> Không nên code theo kiểu `Trực Thành = ngày tốt` hoặc
> `Trực Phá = ngày xấu`.

Ví dụ: Trực Phá không thuận cho cưới hỏi, khai trương, ký hợp đồng nhưng
lại có tính chất phù hợp với phá dỡ, loại bỏ và xử lý cái cũ.

------------------------------------------------------------------------

## Bảng 12 Trực

  -----------------------------------------------------------------------
  Trực              Tính chất chính   Nên dùng cho      Không nên dùng
                                                        cho
  ----------------- ----------------- ----------------- -----------------
  **Kiến**          Khởi đầu, dựng    Khai trương, bắt  Chôn cất, mai
                    lập               đầu công việc,    táng; việc cần
                                      xuất hành, nhận   kết thúc
                                      chức, động thổ,   
                                      dựng nhà          

  **Trừ**           Loại bỏ, giải trừ Chữa bệnh, trừ    Cưới hỏi, khai
                                      tà, giải hạn, dọn trương, ký kết
                                      dẹp, phá bỏ, xử   việc cần lâu dài
                                      lý việc xấu       

  **Mãn**           Đầy đủ, sung túc  Cầu tài, thu      Việc cần khiêm
                                      tiền, giao dịch,  tốn, giảm bớt;
                                      tiệc tùng, kết    mai táng tùy hệ
                                      hôn, nhập kho     phái

  **Bình**          Bình ổn, cân bằng Sửa chữa nhỏ,     Việc đại sự cần
                                      giao dịch thông   khí thế mạnh như
                                      thường, đi lại,   khai trương, cưới
                                      xử lý việc thường hỏi lớn
                                      nhật              

  **Định**          Ổn định, quyết    Ký hợp đồng, cưới Di chuyển xa,
                    định              hỏi, lập cam kết, thay đổi lớn, phá
                                      nhận chức, giao   dỡ
                                      dịch, đặt nền     
                                      móng              

  **Chấp**          Nắm giữ, chấp     Thu tiền, nhập    Khai trương, xuất
                    hành              kho, bắt giữ, sửa hành, cưới hỏi và
                                      chữa, xây dựng    các việc cần sự
                                      một số việc       lưu thông

  **Phá**           Phá bỏ, kết thúc  Phá dỡ, giải      Cưới hỏi, khai
                                      quyết việc tồn    trương, ký hợp
                                      đọng, xử lý tranh đồng, nhập trạch,
                                      chấp, phá cái cũ  động thổ

  **Nguy**          Nguy hiểm, bất ổn Một số việc nhỏ,  Xuất hành xa,
                                      nghiên cứu, học   động thổ, cưới
                                      tập tùy hệ thống  hỏi, khai trương,
                                                        việc trọng đại

  **Thành**         Thành tựu, hoàn   Khai trương, ký   Phá dỡ, kiện
                    thành             kết, cưới hỏi,    tụng, chữa bệnh,
                                      nhập trạch, nhận  việc cần tiêu trừ
                                      chức, cầu tài,    
                                      giao dịch         

  **Thu**           Thu vào, thu      Thu tiền, nhập    Khai trương, xuất
                    hoạch             kho, nhận tài     hành, bắt đầu dự
                                      sản, kết toán,    án lớn
                                      cầu tài           

  **Khai**          Mở ra, thông đạt  Khai trương, mở   An táng, đóng
                                      cửa hàng, bắt đầu cửa, chấm dứt
                                      dự án, xuất hành, công việc
                                      cầu tài, giao     
                                      dịch              

  **Bế**            Đóng lại, kết     Đóng cửa, chôn    Khai trương, cưới
                    thúc              cất/an táng theo  hỏi, ký hợp đồng,
                                      một số hệ, xây    xuất hành, bắt
                                      tường, phong tỏa, đầu việc mới
                                      bảo mật           
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Phân nhóm nhanh

### Rất hợp khởi đầu / mở việc

-   **Kiến**
-   **Khai**
-   **Thành**

### Hợp ổn định / ký kết / xác lập

-   **Định**
-   **Thành**
-   **Mãn**

### Hợp thu vào / tài lộc

-   **Mãn**
-   **Thu**
-   **Thành**

### Hợp loại bỏ / phá cái xấu

-   **Trừ**
-   **Phá**
-   **Bế**

### Cần thận trọng

-   **Nguy**
-   **Phá**
-   **Bế**

------------------------------------------------------------------------

## Nguyên tắc lập trình cho Engine

Không nên chỉ lưu một trường `good: true/false`.

Nên lưu theo **mục đích công việc**, để cùng một Trực có thể tốt cho
việc này nhưng không tốt cho việc khác.

Cấu trúc đề xuất:

``` text
Trực
├── tính_chất
├── mức_độ_tổng_quát
├── nên_dùng
├── không_nên_dùng
├── việc_đại_cát
├── việc_khá_hợp
├── việc_bình_thường
├── việc_kỵ
└── ghi_chú_theo_mục_đích
```

### Ví dụ

Cùng một **Trực Thành**:

  Mục đích      Đánh giá
  ------------- ----------------------------
  Khai trương   Rất hợp
  Ký hợp đồng   Hợp
  Cưới hỏi      Hợp
  Nhận chức     Hợp
  Động thổ      Hợp nhưng phải xét thêm
  An táng       Không tự động kết luận tốt
  Phá dỡ        Không phải sở trường

### Cách hiển thị cho người dùng

Khi người dùng chọn **Ký hợp đồng**, hệ thống có thể trả về:

> **Trực Định -- Rất phù hợp với việc ký kết, xác lập cam kết và ổn định
> quan hệ lâu dài.**

Như vậy 12 Trực trở thành một lớp phân tích có ngữ cảnh thay vì chỉ là
nhãn **tốt / xấu**.
