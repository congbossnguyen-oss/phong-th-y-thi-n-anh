---
name: huyen-khong-phi-tinh
description: |
  Dùng skill này khi Công cần LUẬN PHONG THỦY NHÀ/TRẠCH theo trường phái HUYỀN KHÔNG PHI TINH (Tam Nguyên Cửu Vận, lập tinh bàn Sơn-Vận-Hướng bằng Lượng Thiên Xích) — kích hoạt khi Công gõ "luận phi tinh", "lập tinh bàn", "xem nhà theo huyền không", "nhà tọa... hướng... vận mấy", "vượng sơn vượng hướng hay thượng sơn hạ thủy", "hóa giải sát khí huyền không", "kích đào hoa", đưa tọa độ/hướng nhà cụ thể muốn luận cát hung, HOẶC đưa thẳng 1 tinh bàn đã lập sẵn (bảng 9 cung có số Sơn-Vận-Hướng) muốn luận giải. KHÁC với các skill trạch nhật (`chinh-ngu-hanh-trach-nhat`, `xem-ngay-cao-cap`, `luan-ky-mon-don-giap` — dùng để CHỌN NGÀY) và khác Huyền Không Đại Quái (dùng Tiên Thiên Bát Quái, trong `xem-ngay-cao-cap`) — Phi Tinh dùng Hậu Thiên Bát Quái/Lạc Thư, LUẬN NHÀ chứ không chọn ngày. Nếu Công chưa rõ ý muốn luận nhà hay chọn ngày, hỏi trước khi chạy.
---

# Huyền Không Phi Tinh

Skill đóng gói phương pháp luận phong thủy dương trạch theo Huyền Không Phi Tinh, rút từ nhiều tài liệu Công cung cấp. **Đang xây dựng theo 6 giai đoạn (A→F), làm cuốn chiếu:**

| Giai đoạn | Nội dung | Trạng thái |
|---|---|---|
| **A** | Nền tảng (Lạc Thư/Hà Đồ, Tam Nguyên Long, Tam Nguyên Cửu Vận, Lượng Thiên Xích) + phương pháp lập Tinh Bàn (Vận/Sơn/Hướng, Thế Quái, các cách cục lớn) + xác định tọa-hướng thực tế + ngũ hành/âm dương 24 sơn theo Can-Chi | ✅ Xong — `references/a-nen-tang-lap-tinh-ban.md` |
| **B** | Tính chất Cửu Tinh trong Vận 9 (vận hiện tại) + luận đoán theo 24 sơn hướng | ✅ Xong (một phần dữ liệu OCR bị mất, đã flag rõ) — `references/b-tinh-chat-van-9-va-24-son-huong.md` |
| **C** | Hóa giải sát khí (Thái Tuế, Ngũ Hoàng, Nhị Hắc, Tam Sát...) theo Huyền Không Phi Tinh — ưu tiên trình bày theo mức đồng thuận nhiều thầy | ✅ Xong — `references/c-hoa-giai-sat-khi.md` |
| **D** | Đào Hoa vị — cách xác định và kích hoạt theo tinh bàn | 🟡 Một phần — theo Người (Chi năm/ngày sinh, đã verify khớp công thức cổ điển) xong đầy đủ; theo Nhà (Phi Tinh) chưa đủ dữ liệu tin cậy — `references/d-dao-hoa-vi.md` |
| **E** | Nhị trạch thực nghiệm — case study thực tế | 🟡 Một phần (7/~30 case) — `references/e-case-study-thuc-nghiem.md` |
| **F** | Loan Đầu (hình thế Sơn-Thủy) / thẩm định phong cảnh kiến trúc hiện đại | 🟡 Một phần (lý thuyết Loan Đầu cơ bản xong, phần kiến trúc hiện đại chưa làm) — `references/f-loan-dau-son-thuy.md` |
| **G** | Bảng tinh bàn đầy đủ 24 sơn hướng — Vận 9 (đã kiểm chứng tay 100% khớp) | ✅ Xong — `references/g-tinh-ban-24-son-huong-van9.md` |
| **Quy trình luận** | Quy trình 10-bước luận khi Công đưa sẵn 1 tinh bàn đã lập (do Công cung cấp, không phải trích từ nguồn OCR gốc) | ✅ Xong — `references/quy-trinh-luan-khi-co-tinh-ban.md` |
| **Song Tinh Danh Cục** | 5 tổ hợp 2 sao cổ điển có tên riêng (Tứ Nhất, Cửu Thất, Nhị Ngũ, Tam Thất, Hồi Cung Phục Vị) dùng khi luận tổ hợp sao (Bước 5.6) | ✅ Một phần — `references/song-tinh-danh-cuc.md` (nguồn 291 trang, còn nhiều chương chưa xử lý) |
| **Thành Môn** | Cửa ngõ dẫn khí quyết định thịnh suy — Chính/Phụ/Ngầm, Tự Khố/Tá Khố, cách tìm, cách mở cửa phụ để cứu hướng | ✅ Xong — `references/thanh-mon.md` |

Nguồn từng phần ghi rõ đầu mỗi file `references/`. Sẽ tiếp tục bổ sung C→F trong các lượt sau — khi dùng skill trước khi hoàn tất, luôn nói rõ với Công phần nào đã có, phần nào chưa.

## Nguyên tắc bất di bất dịch

1. **Luôn xác định Vận hiện tại trước khi lập tinh bàn.** Hiện đang ở **Vận 9 (2024-2044)** — trừ khi nhà nhập trạch/xây trong vận cũ (8 hoặc trước) thì dùng vận tương ứng lúc nhập trạch cho Vận Bàn/Sơn Bàn/Hướng Bàn (Sơn-Hướng tinh KHÔNG đổi theo vận mới, chỉ Niên/Nguyệt tinh mới đổi theo từng năm/tháng).
2. **Không lẫn hệ Phi Tinh (Hậu Thiên Bát Quái/Lạc Thư) với hệ Huyền Không Đại Quái (Tiên Thiên Bát Quái)** ở skill `xem-ngay-cao-cap`. Hai hệ số hoàn toàn khác nhau, không hoán đổi.
3. **Xét đắc cách/thất cách (loan đầu) trước, ngũ hành sinh khắc sau.** Đây là tầng lọc bắt buộc theo đúng thứ tự ở file A mục 11 — không nhảy thẳng vào sinh khắc ngũ hành khi chưa biết Sơn/Hướng tinh có đắc cách hay không.
4. **Thiếu dữ liệu thì nói thiếu**, không bịa số liệu hay kết luận tinh bàn khi chưa đủ tọa độ/độ số nhà. Xem mục "Giới hạn dữ liệu" cuối mỗi file reference.
5. **Không dùng kết luận vận 8 (đã qua) áp cho nhà vận 9** — nếu tài liệu gốc chỉ có ví dụ vận 8, dùng làm mẫu phương pháp, tính lại số liệu cho vận 9 bằng quy trình ở file A.

---

## Bước 0 — Thu thập đầu vào

Đọc lại hội thoại trước, chỉ hỏi phần còn thiếu (dùng `ask_user_input_v0` khi cần Công chọn nhanh).

| # | Thông tin | Bắt buộc | Dùng ở |
|---|---|---|---|
| 1 | Tọa độ la bàn của nhà (độ số càng chính xác càng tốt, tối thiểu biết 24 sơn) | ✅ | Bước 1-2 |
| 2 | Năm nhập trạch / xây nhà (để xác định Vận Bàn) — nếu không có, mặc định dùng Vận 9 hiện tại | ✅ | Bước 1 |
| 3 | Mặt bằng nhà (vị trí cửa chính, bếp, phòng ngủ...) nếu muốn luận chi tiết từng khu vực | Có điều kiện | Bước 4 |
| 4 | Loan đầu xung quanh: hướng nào có núi/nhà cao, hướng nào có nước/khoảng trống/đường | Có điều kiện (nên có để luận đắc/thất cách) | Bước 3 |
| 5 | Năm sinh gia chủ (nếu cần tính quái số/cung mệnh liên quan) | Có điều kiện | Bước 3 |

## Engine tính toán — CHẠY TRƯỚC MỌI VIỆC LUẬN

`scripts/engine.py` tính toàn bộ phần khách quan. **Luôn chạy engine trước khi luận bằng tay** — nhanh hơn, không sai số, và tự động bắt các cách cục dễ bỏ sót.

```bash
python3 scripts/engine.py --toa-do 165 --van 9              # 165 = độ HƯỚNG
python3 scripts/engine.py --toa-do 270 --la-toa --van 9     # 270 = độ TỌA
python3 scripts/engine.py --toa-do 165 --van 9 --nam 2026 --thang 3   # kèm lưu niên/nguyệt
python3 scripts/engine.py --toa-do 165 --van 9 --json       # xuất JSON cho web app
python3 scripts/engine.py --toa-do 165 --van 9 --the-quai    # BẬT Thế Quái (mặc định TẮT)
python3 scripts/engine.py --self-test                        # kiểm chứng engine
python3 scripts/engine.py --nguon                            # engine tính gì, dựa nguồn nào
```

**Engine tính được** (100% từ công thức, không cần phán đoán): Vận/Sơn/Hướng Bàn đầy đủ 9 cung · phân loại độ lệch 4 mức **Chính hướng / Kiêm hướng / Tiểu Không Vong / Đại Không Vong** · nhận diện cách cục (VSVH, TSHT, Song Tinh Đáo Hướng/Tọa, Phản/Phục Ngâm, Hợp Thập, Phụ Mẫu Tam Ban, Liên Châu, Nhập Tù) · Thành Môn Chính/Phụ/Ngầm · quét 24 sơn tìm chỗ mở cửa phụ đắc vượng khí · vượng/sinh/tiến/suy/tử từng sao · Song Tinh Danh Cục · Niên tinh/Nguyệt tinh + cảnh báo Ngũ Hoàng-Nhị Hắc lưu niên.

**Engine KHÔNG tính** (phần Claude/người luận phải làm): đắc cách/thất cách (cần loan đầu thực tế: hướng nào có núi/nước/đường/cửa/bếp/giường) · kết luận cát hung cuối cùng từng cung · đề xuất hóa giải cụ thể (tra `c-hoa-giai-sat-khi.md` sau khi có kết quả engine).

**Về Thế Quái — MẶC ĐỊNH TẮT (quyết định của Công).** Engine luôn dùng **Hạ Quái bàn**. Lý do: (a) ngưỡng độ áp dụng Thế Quái còn mâu thuẫn giữa các nguồn (MV_HKPT1 nói 3°/6°, Văn Hoài nói 4°/7° — xem file A mục 15), tự động áp dụng sẽ cho ra tinh bàn khác hẳn mà người dùng không kiểm chứng được; (b) Thế Quái vốn là quyết định của người luận khi muốn "cứu" hướng suy (chính là Tá Khố ở `thanh-mon.md` mục 5), không phải phép tính máy móc. Khi kiêm hướng, engine chỉ **cảnh báo mức độ pha tạp khí** rồi vẫn lập Hạ Quái bàn. Muốn dùng Thế Quái thì bật thủ công bằng `--the-quai`.

**Phân biệt Tiểu vs Đại Không Vong** (điểm engine tự tính, quan trọng khi thẩm định nhà): cùng nằm sát lằn ranh 2 sơn, nhưng nếu lằn ranh đó **nằm trong cùng 1 cung** → Tiểu Không Vong; nếu là **ranh giới giữa 2 quái/cung** (22.5°, 67.5°, 112.5°, 157.5°, 202.5°, 247.5°, 292.5°, 337.5°) → **Đại Không Vong**, nặng hơn nhiều (cô quả, tuyệt tự, lao tù, phá sản). Engine kiểm cả Tọa lẫn Hướng.

**Nguyên tắc "không đoán mò".** Engine chỉ tính cái truy được về nguồn; chỗ nguồn không nói rõ thì **để trống chứ không tự suy**. Ví dụ: nguồn định nghĩa rõ 4 mức khí (Vượng/Sinh/Suy/Tử) và có nhắc "tiến khí" trong thứ tự xếp hạng nhưng không gán nó ứng số nào — engine không tự gán, trả `TỬ/XA` cho phần ngoài 4 mức. Chạy `--nguon` để xem bảng đầy đủ: mỗi mục kèm nguồn, mức tin cậy (CHẮC / NGUỒN / MÂU THUẪN), và danh sách những gì engine **cố tình không tính**.

**Engine tự cảnh báo khi ra ngoài vùng đã kiểm chứng**: chạy vận ≠ 9 → báo rõ chưa có dữ liệu đối chiếu độc lập cho vận đó và tự tắt bảng ý nghĩa cặp sao (bảng đó chỉ đúng Vận 9); nhà phạm Không Vong → nhắc việc cần làm trước là chỉnh hướng, không phải hóa giải từng cung.

**Độ tin cậy đã kiểm chứng** (`--self-test`): tinh bàn khớp **432/432 điểm** trên toàn bộ 24 sơn hướng Vận 9 đối chiếu `g-tinh-ban-24-son-huong-van9.md`; Thành Môn khớp 3/3 ví dụ gốc trong sách Văn Hoài; Niên tinh khớp 5/5 mốc (gồm 3 mốc lịch sử 1870/1930/1992 trong Tứ Bạch Quyết); phân loại Không Vong khớp 8/8 ca biên.

## QUY TRÌNH LUẬN — 4 giai đoạn

Kiến trúc: **Engine tính cái chắc chắn → Người cung cấp loan đầu → Claude luận → Đề xuất xử lý.**
Không đảo thứ tự. Không luận cát hung khi chưa có loan đầu (Giai đoạn 2).

---

### GIAI ĐOẠN 0 — Thu thập đầu vào

**Nhóm A — bắt buộc để chạy engine** (thiếu là không lập được tinh bàn):

| # | Thông tin | Ghi chú |
|---|---|---|
| 1 | **Độ la bàn** của Tọa hoặc Hướng | Càng chính xác càng tốt. Nếu chỉ biết "hướng Nam" thì phải hỏi độ cụ thể — vì 1 cung có 3 sơn cho 3 tinh bàn khác nhau |
| 2 | **Năm nhập trạch / xây xong** | Quyết định Vận Bàn. Nhà cũ vẫn dùng vận lúc nhập trạch, KHÔNG đổi sang vận 9 |

**Nhóm B — loan đầu, cần để luận cát hung** (engine không tự biết, phải hỏi):

| # | Thông tin | Dùng để |
|---|---|---|
| 3 | Hướng nào có **núi / nhà cao / cây lớn / vật cao** | Xét Sơn tinh đắc cách hay thất cách |
| 4 | Hướng nào có **nước / đường / khoảng trống / ngã ba** | Xét Hướng tinh đắc cách hay thất cách |
| 5 | **Cửa chính** nằm ở phương nào (theo tâm nhà) | Điểm khí vào — trọng số cao nhất |
| 6 | **Bếp, giường ngủ, bàn làm việc, cầu thang, WC** ở phương nào | Điểm kích hoạt cụ thể |
| 7 | Nhà **mấy tầng, có giếng trời không** | Xét Nhập Tù thật hay tù giả |

**Nhóm C — tùy nhu cầu**: năm sinh gia chủ (tính Đào Hoa/Thiên Hỷ theo `d-dao-hoa-vi.md`); năm/tháng cần xem (lưu niên); vấn đề đang gặp (bệnh, tài, hôn nhân — để soi đúng cung).

> Nếu thiếu Nhóm B: **vẫn chạy engine được**, nhưng phải nói rõ với Công đây mới là *khung lý khí*, chưa phải kết luận — vì cùng 1 tinh bàn, loan đầu khác nhau cho kết quả ngược nhau.

---

### GIAI ĐOẠN 1 — Engine tính (máy làm, không cần phán đoán)

```bash
python3 scripts/engine.py --toa-do <độ> --van <vận> [--la-toa] [--nam 2026 --thang 3]
```

Engine trả về: tinh bàn 9 cung · phân loại Chính hướng/Kiêm/Tiểu-Đại Không Vong · cách cục toàn bàn · Thành Môn + chỗ mở cửa phụ · vượng/suy từng sao · Song Tinh Danh Cục · lưu niên/nguyệt.

**Chốt chặn ngay tại đây**: nếu engine báo **Đại Không Vong** → dừng, báo Công/khách rằng việc cần làm trước là **chỉnh hướng**, không phải hóa giải từng cung. Luận tiếp chỉ là tham khảo.

---

### GIAI ĐOẠN 2 — Đối chiếu loan đầu (bước quyết định, engine KHÔNG làm được)

Đây là bước **quan trọng nhất** và cũng là chỗ engine cố tình im lặng. Với từng cung, đối chiếu số engine trả về với thực địa ở Nhóm B, theo `a-nen-tang-lap-tinh-ban.md` mục 11:

| Tình huống | Kết luận |
|---|---|
| Sơn tinh **vượng/sinh** + có núi/nhà cao | **Đắc cách** — phát nhân đinh, sức khỏe |
| Hướng tinh **vượng/sinh** + có thủy/đường/thoáng | **Đắc cách** — phát tài lộc |
| Sơn tinh vượng nhưng chỗ đó **trống/có nước** | **Thất cách** — mất tác dụng |
| Hướng tinh vượng nhưng chỗ đó **bị nhà cao chắn** | **Thất cách** — mất tác dụng |
| Sao **suy/tử** mà lại **đắc cách** (có núi/nước đúng chỗ) | **NGUY HIỂM NHẤT** — kích hoạt đúng cái xấu |

**Nguyên tắc thứ tự**: xét đắc/thất cách **trước**, ngũ hành sinh khắc **sau**. Chỉ khi cả Sơn và Hướng tinh đều không đắc cách rõ rệt mới xét tiếp sinh khắc giữa 2 sao trong cung.

---

### GIAI ĐOẠN 3 — Luận chi tiết

Chạy quy trình 10 bước ở `references/quy-trinh-luan-khi-co-tinh-ban.md`, **bỏ qua Bước 1-3** (engine đã làm), tập trung:

- **Bước 4** — Trung Cung (khí toàn cục)
- **Bước 5** — luận từng cung theo thứ tự cố định Trung→Càn→Khảm→Cấn→Chấn→Tốn→Ly→Khôn→Đoài, mỗi cung đủ 10 bước con. Engine đã cấp sẵn dữ liệu cho bước con 1-7; người luận làm bước 8-10 (hình pháp → ứng sự → kết luận cát hung).
- **Bước 7** — trục Sơn-Hướng (trọng tâm nhất)
- **Bước 8-9** — liên kết cung + điểm kích hoạt thực tế
- **Bước 10** — kết luận toàn bàn theo chủ đề (tài/đinh/sức khỏe/công danh/hôn nhân)

Khi Công chỉ hỏi nhanh 1 điểm (không luận toàn bàn) → dùng **mô hình rút gọn 8 lớp** ở cuối file đó.

---

### GIAI ĐOẠN 4 — Hóa giải & thứ tự ưu tiên

1. Tra `references/c-hoa-giai-sat-khi.md` — **ưu tiên giải pháp có nhiều thầy đồng thuận nhất** (file đã xếp hạng sẵn theo số nguồn). Nguyên tắc gốc: *tránh > không kích hoạt > mới đến hóa giải bằng vật phẩm*.
2. Nếu hướng chính yếu → xét mở cửa phụ theo Thành Môn (engine đã quét sẵn 24 sơn).
3. Nếu cần kích Đào Hoa/nhân duyên → `references/d-dao-hoa-vi.md` (dùng bảng theo Chi năm/ngày sinh — phần đã verify).
4. Sắp thứ tự xử lý: **trục Sơn-Hướng và cửa/bếp/giường trước**, các cung phụ sau.

---

### Tài liệu tra cứu theo nhu cầu

| Cần gì | Đọc file nào |
|---|---|
| Lập tinh bàn tay, nền tảng lý thuyết | `a-nen-tang-lap-tinh-ban.md` |
| Tính chất 9 sao Vận 9, quái số, niên/nguyệt tinh | `b-tinh-chat-van-9-va-24-son-huong.md` |
| Hóa giải sát khí (xếp theo đồng thuận nhiều thầy) | `c-hoa-giai-sat-khi.md` |
| Đào Hoa / Thiên Hỷ / Hồng Loan | `d-dao-hoa-vi.md` |
| Case thực tế để đối chiếu cách luận | `e-case-study-thuc-nghiem.md` |
| Hình thế núi/nước, phối loan đầu với sao | `f-loan-dau-son-thuy.md` |
| Tra nhanh tinh bàn dựng sẵn 24 sơn hướng Vận 9 | `g-tinh-ban-24-son-huong-van9.md` |
| Thành Môn, mở cửa phụ cứu hướng | `thanh-mon.md` |
| Tổ hợp 2 sao cổ điển có tên riêng | `song-tinh-danh-cuc.md` |
| Quy trình 10 bước đầy đủ | `quy-trinh-luan-khi-co-tinh-ban.md` |
| **Ý nghĩa 81 cặp sao** + kích hoạt/hóa giải từng sao | `h-81-cap-sao-va-hoa-giai.md` |
| **Thu Sơn Xuất Sát, luận cửa chính, đường khí, Chính-Linh-Chiếu Thần** | `i-thu-son-xuat-sat-cua-chinh-duong-khi.md` |
| **Xếp hạng cách cục tốt nhất + Thất Tinh Đả Kiếp đầy đủ** | `k-cac-cach-cuc-tot-nhat.md` |

## Giới hạn dữ liệu chung

- Xem chi tiết gap ở cuối mỗi file `references/`.
- Không tự suy diễn nội dung còn thiếu của giai đoạn C-D (và phần chưa xong của E-F) từ kiến thức nền chung — tài liệu gốc Công cung cấp có phương pháp riêng, cần xử lý đúng nguồn khi tới lượt.
- File A mục 15 có ghi nhận 1 điểm chưa thống nhất giữa 2 nguồn về ngưỡng độ số Kiêm hướng (3° vs 4°) — dùng ngưỡng thận trọng hơn cho đến khi Công xác nhận rõ theo nguồn nào.
