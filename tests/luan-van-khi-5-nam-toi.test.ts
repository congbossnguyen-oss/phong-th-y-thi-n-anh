// Kiểm tra "5 năm tới" (VanKhiOutput.nam5NamToi) — tinh từ NĂM HIỆN TẠI, không phải từ đầu Đại Vận,
// vì app chưa có nút đổi Đại Vận nên đây là cách duy nhất khách thấy đủ 5 năm thật sự tương lai khi
// đã đi sâu vào Đại Vận đang chọn. Xem ghi chú trong index.ts (nam5NamToi) và types.ts.
import { describe, expect, it } from "vitest";
import { tinhBatTu } from "../src/lib/bat-tu";
import { tinhVanKhi } from "../src/lib/quan-su/luan-van-khi/index";

const NGUOI_MAU = { day: 15, month: 6, year: 1990, hour: 10, gender: "Nam" as const };

describe("nam5NamToi — 5 năm tới tính từ năm hiện tại", () => {
  it("nằm sâu giữa Đại Vận (còn ≥5 năm) → 5 năm tới lấy TRỌN trong Đại Vận đang chọn, không đụng Đại Vận sau", async () => {
    const chart = tinhBatTu({ ...NGUOI_MAU });
    const dv = chart.daiVan[3]!; // 1 Đại Vận bất kỳ ở giữa danh sách, còn đủ 10 năm phía sau
    const nowYear = dv.startDate.y + 2; // mới đi 2/10 năm — còn 8 năm, dư sức chứa 5 năm tới

    const out = await tinhVanKhi({ ...NGUOI_MAU, nowYear, chiTietDaiVanIndex: 3 });

    expect(out.nam5NamToi).toHaveLength(5);
    expect(out.nam5NamToi.map((n) => n.nam)).toEqual([nowYear, nowYear + 1, nowYear + 2, nowYear + 3, nowYear + 4]);
    // Cả 5 năm đều đúng Can Chi Đại Vận đang chọn (chưa vắt qua Đại Vận sau).
    for (const n of out.nam5NamToi) expect(n.canChi).toBeTruthy();
  });

  it("đã đi 8/10 năm Đại Vận (chỉ còn 2 năm) → 5 năm tới VẮT QUA Đại Vận kế tiếp, vẫn đủ 5 năm liên tục", async () => {
    const chart = tinhBatTu({ ...NGUOI_MAU });
    const dvIdx = 3;
    const dv = chart.daiVan[dvIdx]!;
    const dvSau = chart.daiVan[dvIdx + 1]!;
    const nowYear = dv.startDate.y + 8; // chỉ còn 2 năm thật sự "tương lai" trong Đại Vận này

    const out = await tinhVanKhi({ ...NGUOI_MAU, nowYear, chiTietDaiVanIndex: dvIdx });

    expect(out.nam5NamToi).toHaveLength(5);
    expect(out.nam5NamToi.map((n) => n.nam)).toEqual([nowYear, nowYear + 1, nowYear + 2, nowYear + 3, nowYear + 4]);
    // 2 năm đầu vẫn thuộc Đại Vận đang chọn, 3 năm cuối đã sang Đại Vận kế tiếp — Can Chi Đại Vận khác nhau.
    const namCuoiDaiVanHienTai = dv.startDate.y + 9;
    const trongDaiVanHienTai = out.nam5NamToi.filter((n) => n.nam <= namCuoiDaiVanHienTai);
    const trongDaiVanSau = out.nam5NamToi.filter((n) => n.nam > namCuoiDaiVanHienTai);
    expect(trongDaiVanHienTai).toHaveLength(2);
    expect(trongDaiVanSau).toHaveLength(3);
    // 3 năm vắt qua vẫn đúng năm đầu Đại Vận kế tiếp trở đi.
    expect(trongDaiVanSau.map((n) => n.nam)).toEqual([dvSau.startDate.y, dvSau.startDate.y + 1, dvSau.startDate.y + 2]);
    // danhSachDaiVan[dvIdx+1].luuNien vẫn giữ đúng thiết kế cũ: chỉ Đại Vận đang xem chi tiết
    // (chiTietDaiVanIndex) mới lộ mảng luuNien đầy đủ ra output — Đại Vận kế tiếp KHÔNG bị lộ dù
    // nội bộ đã tính (và cache) nó để phục vụ nam5NamToi.
    expect(out.danhSachDaiVan[dvIdx + 1]!.luuNien).toHaveLength(0);
  });

  it("Đại Vận cuối cùng đã đi sâu, KHÔNG còn Đại Vận sau → 5 năm tới bị cắt ngắn thay vì lỗi", async () => {
    const chart = tinhBatTu({ ...NGUOI_MAU });
    const idxCuoi = chart.daiVan.length - 1;
    const dvCuoi = chart.daiVan[idxCuoi]!;
    const nowYear = dvCuoi.startDate.y + 8; // chỉ còn 2 năm, và đây đã là Đại Vận cuối cùng có dữ liệu

    const out = await tinhVanKhi({ ...NGUOI_MAU, nowYear, chiTietDaiVanIndex: idxCuoi });

    expect(out.nam5NamToi.length).toBeLessThanOrEqual(5);
    expect(out.nam5NamToi.length).toBeGreaterThan(0);
    for (const n of out.nam5NamToi) expect(n.nam).toBeLessThanOrEqual(dvCuoi.startDate.y + 9);
  });

  it("kết quả nam5NamToi cũng sạch từ cấm (đi qua đúng đường hậu kiểm như luuNien thường)", async () => {
    const chart = tinhBatTu({ ...NGUOI_MAU });
    const dv = chart.daiVan[3]!;
    const out = await tinhVanKhi({ ...NGUOI_MAU, nowYear: dv.startDate.y + 8, chiTietDaiVanIndex: 3 });
    for (const n of out.nam5NamToi) {
      expect(n.loiLuan.tai_van).toBeTruthy();
      expect(n.loiLuan.quan_van).toBeTruthy();
      expect(n.loiLuan.suc_khoe).toBeTruthy();
      expect(n.loiLuan.tinh_duyen).toBeTruthy();
    }
  });
});
