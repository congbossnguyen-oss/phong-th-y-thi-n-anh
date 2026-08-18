# PHẦN C2 — Audit Tam Hợp Lục Hào (tài liệu tham chiếu, KHÔNG implementation)

> Trạng thái: audit-only, dừng tại đây. Chưa sửa `luc-hao.ts`, chưa thêm schema Tam Hợp, chưa thêm test C2, chưa commit.
> Ngày audit: 2026-08-10. Tiếp theo từ commit `97b8174` (Phần C1 — quan hệ hào ↔ Nhật/Nguyệt).

## Nguồn đã rà
- 2 bản OCR "kinh dịch lục hào sơ cấp minh việt" (Gốc + New) — Chương VII §IV "TAM HỢP HÓA CỤC CỦA HÀO" (Gốc dòng 1999-2021, New dòng 2256-2279), đối chiếu khớp gần như từng chữ giữa 2 bản.
- 2 ví dụ thực hành đầy đủ 6 hào có Tam Hợp: VD1 "Xem lên chức" (New dòng 2281-2296, Bát Thuần Cấn→Thủy Lôi Truân) và VD3 "Xem tài vận" (New dòng 3664-3685, Thủy Địa Tỷ→Bát Thuần Khảm).
- `luc-hao-engine-spec.md` §14 chỉ liệt tên "Tam Hợp" như yêu cầu kiến trúc, không có công thức.
- Code hiện tại: 0% đã có — `luc-hao.ts` chưa có bất kỳ hàm/bảng Tam Hợp nào.

## 1. Bốn Tam Hợp Cục — VERIFIED
"Thân, Tý, Thìn hợp hóa Thủy cục. Tị, Dậu, Sửu hợp hóa Kim cục. Dần, Ngọ, Tuất hóa Hỏa cục. Hợi, Mão, Mùi hóa Mộc cục." (Gốc dòng 2001, New dòng 2258-2260). Không có Tam Hợp Thổ.

## 2. Thành phần tạo Tam Hợp
| Tổ hợp | Trạng thái | Bằng chứng |
|---|---|---|
| Hào + Hào + Hào | VERIFIED | VD1: Thân-Tý-Thìn = hào 3(Ứng,Thân) + hào 5(Tý) + hào 1(Thìn) |
| Hào + Nguyệt Kiến + Hào | VERIFIED | VD3: Hợi(Nguyệt) + Mão(hào 3, Thế) + Mùi(hào 1) — Hợi không trùng Chi hào nào trong quẻ |
| Hào + Nhật Thần + Hào | KHÔNG có ví dụ sạch | Cả 2 ví dụ, Chi Nhật Thần đều trùng Chi 1 hào có sẵn |
| Nhật + Nguyệt + 1 Hào thật | UNVERIFIED — không tìm thấy | — |
| Nhật + Nguyệt + 1 Hào động | UNVERIFIED — không tìm thấy | — |

Lý thuyết (mục 5) xác nhận cả Nhật lẫn Nguyệt đều có thể lấp chân thiếu (Hư Cục), nhưng chỉ tìm được ví dụ thực hành cho trường hợp Nguyệt.

## 3. Vai trò hào động
- 4 "dạng" chính thức (Gốc dòng 2003-2006 / New dòng 2262-2265) đều đòi hỏi ≥1 hào động:
  1. 1 hào động + 2 hào tĩnh hợp cục cùng nó.
  2. 2 hào động (kể cả ám động) + 1 hào tĩnh.
  3. Hào sơ + hào tam nội quái cùng động, biến thành 2 chân của cục.
  4. Hào tứ + hào thượng cùng động, biến thành cục.
- "3 Chi đều tĩnh" — KHÔNG nằm trong 4 dạng này → UNVERIFIED (im lặng, không phải phủ định).
- Ghi chú: VD1 thực tế có cả 3 chân của cục Thân-Tý-Thìn (hào 1,3,5) đều đang động cùng lúc — không khớp chính xác với bất kỳ dạng nào trong 4 dạng liệt kê. Ghi nhận, không tự diễn giải thêm.
- Thiếu 1 Chi → gọi là "Hư Cục" (Gốc dòng 2010, New dòng 2269, khớp nguyên văn).
- Chỉ 2 Chi, không đủ 3 → nguồn KHÔNG đặt tên riêng (đã grep "bán hợp"/"nhị hợp cục" toàn bộ 2 bản, 0 kết quả).
- Hào biến tham gia Tam Hợp: CÓ, nhưng chỉ khi chính hào đó động và hóa ra đúng Chi cần (dạng 3, 4).

## 4. Phân biệt 3 khái niệm
- **Tam Hợp**: khái niệm chung (3 Chi thuộc 1 trong 4 nhóm).
- **Tam Hợp Cục**: khi 3 Chi hội đủ và "hóa" thành công, tạo ra 1 Ngũ Hành mới có sức mạnh riêng (Quan cục/Tài cục/Tử Tôn cục...).
- **Hợp riêng từng cặp** (Lục Hợp 2 Chi, đã có sẵn `chiRelation`/`LUC_HOP_PAIRS`): khái niệm khác hẳn, không cần đủ 3 Chi.
- Phát hiện thêm: **"Tam Quẩn"** — 3 Chi tụ đủ nhưng KHÔNG đạt điều kiện "hóa" (Gốc dòng 2020) → là trạng thái thứ 3, không phải nhị phân "có/không".

## 5. Điều kiện thành cục
| Điều kiện | Nguồn |
|---|---|
| Đủ đúng 3, không thiếu/thừa | VERIFIED |
| Thiếu 1 → Hư Cục, chờ hào động biến ra hoặc Nhật/Nguyệt lâm vào | VERIFIED |
| Thừa 1 → cần hào động hoặc Nhật/Nguyệt hợp/loại bớt hào thừa | VERIFIED |
| Tuần Không: 1 chân đang Tuần Không phải đợi "điền thực" mới thành cục thật | VERIFIED (khớp thực tế VD1: hào Thìn tuần không, đợi tháng Thìn xuất không mới ứng nghiệm) |
| Vượng/suy: "trung thần" (Chi giữa nhóm — Tý/Ngọ/Mão/Dậu) phải vượng, lâm nguyệt lệnh thì mới "hóa" thật, không thì chỉ là Tam Quẩn | VERIFIED |
| Nhật Thần / Nguyệt Kiến: vai trò lấp chân thiếu + loại chân thừa | VERIFIED |
| Nhật Phá / Nguyệt Phá ảnh hưởng lên cục | UNVERIFIED — không tìm thấy |

## 6. Cấu trúc dữ liệu ghi lại được (Tam Hợp + Nhật/Nguyệt)
| Ví dụ | source | branch | yao |
|---|---|---|---|
| VD1 | YAO | Thìn | 1 |
| VD1 | YAO | Thân | 3 |
| VD1 | YAO | Tý | 5 |
| VD3 | MONTH | Hợi | — |
| VD3 | YAO | Mão | 3 |
| VD3 | YAO | Mùi | 1 |

Không tìm được ví dụ dạng thuần "DAY + MONTH + YAO" (chỉ 1 hào thật).

## 7. Golden Test tìm được (đủ 2/2 theo yêu cầu)
1. Tam Hợp thuần hào-hào-hào: VD1 (Bát Thuần Cấn, ngày Bính Thân, tháng Dần, cục Thân-Tý-Thìn từ hào 3+5+1).
2. Tam Hợp có Nguyệt tham gia: VD3 (Thủy Địa Tỷ, ngày Tân Mùi, tháng Quý Hợi, cục Hợi-Mão-Mùi từ Nguyệt(Hợi)+hào3(Mão)+hào1(Mùi)).

## Data Model đề xuất (chưa code)
```ts
type TamHopStatus = "CUC_HOA" | "HU_CUC" | "TAM_QUAN"; // hóa thành công / Hư Cục (đang chờ đủ) / Tam Quẩn (đủ 3 nhưng không hóa)

interface TamHopMember {
  branch: Chi;
  source: "YAO" | "DAY" | "MONTH";
  yao?: number;      // chỉ khi source = "YAO"
  moving?: boolean;  // vai trò động rất quan trọng theo mục 3, không nên bỏ qua field này
}

interface TamHopFormation {
  element: WuXing;          // Thủy/Kim/Hỏa/Mộc — không có Thổ
  members: TamHopMember[];
  status: TamHopStatus;
  voidBranch?: Chi;         // nếu 1 chân đang Tuần Không
}
```
Lý do thêm `status`: nguồn phân biệt rõ 3 trạng thái (mục 4); nếu chỉ có `source` như đề xuất gốc thì không biểu diễn được khác biệt "đủ 3 nhưng chưa hóa" (Tam Quẩn) vs "hóa thành công".

## Trạng thái cuối audit
| Mục | Trạng thái |
|---|---|
| 4 Tam Hợp Cục (không Thổ) | VERIFIED |
| Hào+Hào+Hào | VERIFIED |
| Hào+Hào+Nguyệt | VERIFIED |
| Hào+Hào+Nhật (không trùng hào có sẵn) | DERIVED (lý thuyết cho phép, chưa có ví dụ sạch) |
| Nhật+Nguyệt+1 Hào | UNVERIFIED |
| Nhật+Nguyệt+1 Hào động | UNVERIFIED |
| Bắt buộc ≥1 hào động (4 dạng chính thức) | VERIFIED |
| "3 Chi tĩnh thuần túy" tự thành cục | UNVERIFIED (nguồn im lặng) |
| Hư Cục | VERIFIED |
| Chỉ 2 Chi có tên riêng? | VERIFIED — không có |
| Hào biến tham gia cục | VERIFIED (chỉ khi chính nó động và hóa đúng Chi) |
| Phân biệt Tam Hợp / Tam Hợp Cục / Hợp cặp | VERIFIED (+ phát hiện "Tam Quẩn") |
| Điều kiện Tuần Không | VERIFIED |
| Điều kiện vượng/suy (cho "hóa") | VERIFIED |
| Điều kiện Nhật Phá/Nguyệt Phá lên cục | UNVERIFIED |
| Mâu thuẫn nguồn Gốc vs New | Không phát hiện ở phần này |
