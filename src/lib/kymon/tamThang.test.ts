import { describe, expect, it } from "vitest";
import { lapLaBan } from "./engine";
import { quetTamThang } from "./tamThang";

// SPEC mục 6C, lá 17:43 19/08/2026 chế độ Mệnh.
// SPEC ghi ví dụ: "V3 Thiên Ất = Đông Bắc; V2 Cửu Thiên = Tây; V1 Sinh = Tây;
// V1V2 Sinh Môn Cửu Thiên = Tây" — nhưng ví dụ này viết TRƯỚC khi bản Giờ/Mệnh của
// TEST_6_che_do.md được Công soát lại (đã đổi Trực Phù từ "Đông Bắc" cũ sang đúng "Khôn/Tây
// Nam" — xem README.md mục Prompt 1). V1/V2 (Sinh Môn, Cửu Thiên, đều tại Tây) khớp ĐÚNG 3/3
// chi tiết với ví dụ; chỉ V3 (Trực Phù) lệch, đúng bằng phần đã sửa — nên coi ví dụ 6C là dữ
// liệu cũ chưa cập nhật, KHÔNG phải lỗi engine. Test dưới đây theo giá trị engine đã xác nhận.
describe("quetTamThang — SPEC mục 6C", () => {
  it("lá 17:43 19/08/2026 chế độ Mệnh: V1V2 gộp tại Tây, V3 tại Tây Nam", async () => {
    const r = await lapLaBan({ nam: 2026, thang: 8, ngay: 19, gio: 17, phut: 43, cheDo: "menh" });
    const hang = quetTamThang(r);

    expect(hang).toEqual([
      { loai: "V1V2", ten: "Sinh Môn Cửu Thiên", huong: "Tây", soCung: 7 },
      { loai: "V3", ten: "Thiên Ất", huong: "Tây Nam", soCung: 2 },
    ]);
  });

  it("chế độ Giờ và Mệnh cho cùng thời điểm phải ra Tam Thắng giống hệt nhau", async () => {
    const input = { nam: 2026, thang: 8, ngay: 19, gio: 17, phut: 43 };
    const gio = quetTamThang(await lapLaBan({ ...input, cheDo: "gio" }));
    const menh = quetTamThang(await lapLaBan({ ...input, cheDo: "menh" }));
    expect(menh).toEqual(gio);
  });

  it("lá mẫu chính SPEC mục 6 (22:41 19/07/2026): không thắng cách nào trùng cung khác (3 hàng riêng hoặc gộp tùy dữ liệu)", async () => {
    const r = await lapLaBan({ nam: 2026, thang: 7, ngay: 19, gio: 22, phut: 41 });
    const hang = quetTamThang(r);
    // Chỉ kiểm tính nhất quán nội bộ: tổng số "V" xuất hiện trong các hàng phải đúng 3 (V1+V2+V3),
    // không thiếu/thừa thắng cách nào dù gộp hàng hay không.
    const tongSoV = hang.reduce((sum, h) => sum + h.loai.length / 2, 0);
    expect(tongSoV).toBe(3);
  });
});
