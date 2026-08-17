# Chương 2 "Sim Nói Gì Về Bạn" — tiến độ số hoá & các chỗ OCR khuyết

Nguồn gốc: chủ dự án cung cấp bản OCR `sim-noi-gi-ve-ban.ocr.md` ngày 2026-08-17, để lấp đúng lỗ
hổng mà `luan-so-dien-thoai-SKILL.md` tự ghi là *"chưa được số hoá do dung lượng quá lớn"*.

Đích đến: `phone-energy-engine/src/data/yNghiaTungCap.ts` — 64 cặp × 8 mặt (Tính cách, Tài vận,
Sự nghiệp, Nhân duyên, Sức khoẻ, Học tập, Cảm xúc, Hôn nhân).

Script bóc tách: `boc-chuong2.mjs` (chỉ tách, không sửa chữ).

```bash
node docs/luan-so-dien-thoai-data/boc-chuong2.mjs docs/luan-so-dien-thoai-data/sim-noi-gi-ve-ban.ocr.md /tmp/chuong2.json
```

## Độ phủ nguồn

Script bóc được **64 khối** — tức sách có đủ 64 cặp, không thiếu cặp nào.

| Từ trường | Số cặp bóc được |
|---|---|
| Thiên Y | 8/8 |
| Diên Niên | 8/8 |
| Sinh Khí | 8/8 (xem ghi chú 67) |
| Phục Vị | 8/8 |
| Tuyệt Mệnh | 8/8 |
| Ngũ Quỷ | 8/8 |
| Lục Sát | 8/8 (xem ghi chú 61) |
| Họa Hại | 8/8 |

## Hai cặp bị OCR làm mất dòng tiêu đề số

OCR nuốt mất dòng chứa số cặp, nên khối nội dung vẫn còn nguyên mà không biết thuộc cặp nào.
Đã xác định lại bằng **ba căn cứ độc lập**, không đoán:

| Khối | Nằm giữa | Suy ra | Căn cứ |
|---|---|---|---|
| dòng 1836 | sau `76`, trước `39` | **67** | (a) 67 là cặp đôi của 76 trong Sinh Khí cấp 2; (b) chính sách liệt kê thứ tự "Sinh khí 14, 41, 76, **67**, 39, 93, 28, 82" ở cuối phần Diên Niên; (c) nội dung mang đúng sắc thái Sinh Khí — "quan hệ xã hội phong phú, nhân duyên thuận lợi như cá gặp nước" |
| dòng 3439 | sau `16`, trước `47` | **61** | (a) 61 là cặp đôi của 16 trong Lục Sát cấp 1; (b) đúng vị trí trong dãy; (c) nội dung mang sắc thái Lục Sát — "nhiều nhân duyên khác giới, sức hút tự nhiên cao" |

## Các mục bị OCR gộp vào mục liền trước

OCR nuốt dòng tiêu đề mục, làm nội dung dính vào mục phía trên. Nội dung **vẫn còn đủ**, chỉ cần
tách tay khi số hoá:

| Cặp | Mục bị nuốt tiêu đề | Nội dung dính vào |
|---|---|---|
| 31 | Tài vận | Tính cách |
| 78 | Nhân duyên | Sự nghiệp |
| 14 | Nhân duyên, Sức khoẻ | *(cần soát khi làm tới)* |
| 39 | Sự nghiệp, Hôn nhân | *(cần soát khi làm tới)* |

## Các mục bị OCR cắt cụt hẳn

Những chỗ này nguồn chỉ còn lại mảnh vụn, **không khôi phục đầy đủ được**. Đã ghi phần đọc được và
KHÔNG bịa thêm cho đầy. Nếu chủ dự án có bản gốc rõ hơn thì bổ sung sau.

| Cặp | Mục | Nguyên văn OCR còn lại | Đã ghi vào engine |
|---|---|---|---|
| 68 | Sức khoẻ | "Dễ gặp vấn đề về: Cần chăm sóc tinh thần và tuần hoàn, tránh làm việc quá sức dẫn đến suy kiệt" — mất hẳn phần liệt kê bệnh | Chỉ giữ vế còn đọc được |
| 86 | Sức khoẻ | "quan (mắt, tai, mũi, miệng lưỡi)" | Khôi phục tối thiểu thành "các bệnh liên quan đến ngũ quan (mắt, tai, mũi, miệng, lưỡi)" — chỉ nối lại chữ "ngũ quan" bị cắt |
| 86 | Học tập | "linh, vẳn hóa chiều sâu:" | Khôi phục tối thiểu thành "Thiên hướng học về tâm linh và văn hoá chiều sâu" |

## Nguyên tắc làm sạch OCR

Bản OCR bị **xáo trộn thứ tự từ** rất nặng — chữ bị đẩy xuống cuối đoạn. Ví dụ nguyên văn:

> "Có thiên tư lãnh đạo, đặc biệt là người đặt giá trị đạo đức và nhân **hàng** … **văn** lên đầu."

Câu thật là *"…đặt giá trị đạo đức và nhân **văn** lên **hàng** đầu."*

Khi số hoá **chỉ được ghép lại đúng trật tự từ** và bỏ ký tự rác OCR (`\_`, `Iượng` → `lượng`,
`agoàa` …). **Không thêm ý mới, không diễn giải rộng ra, không gộp ý từ cặp khác sang.**

## Tiến độ

- [x] Thiên Y — 13, 31, 68, 86, 49, 94, 27, 72
- [x] Diên Niên — 19, 91, 78, 87, 34, 43, 26, 62
- [ ] Sinh Khí — 14, 41, 67, 76, 93, 39, 82, 28
- [ ] Phục Vị — 11, 22, 99, 88, 77, 66, 44, 33
- [ ] Tuyệt Mệnh — 12, 21, 69, 96, 84, 48, 73, 37
- [ ] Ngũ Quỷ — 18, 81, 97, 79, 36, 63, 42, 24
- [ ] Lục Sát — 16, 61, 74, 47, 38, 83, 92, 29
- [ ] Họa Hại — 17, 71, 89, 98, 64, 46, 32, 23

Sau khi đủ 64 cặp mới nối vào giao diện — nối lúc mới có một phần thì phần lớn số khách tra sẽ
hiện trống, phản tác dụng.
