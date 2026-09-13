// Khóa lại fix 13/9/2026 — anh Công báo trang "Lập lá số Tử Vi" ra cột Ngày và Giờ đều "Giáp Tý" cho
// ca sinh Dương lịch 21/12/2002 giờ Tý.
//
// GỐC RỄ: giờ Tý (23h-01h) kéo dài qua nửa đêm — nửa ĐẦU (23h-24h, "Tý sớm") thuộc ngày hôm TRƯỚC nên
// trụ Ngày phải lùi +1 ngày (hour>=23 trong tinhBatTu()); nửa SAU (00h-01h, "Tý muộn") đã đúng ngày
// dương lịch đã nhập, KHÔNG được lùi. Trang Tử Vi trước đây chỉ có 1 lựa chọn "Tý (23h-01h)" gán cứng
// hour=23 cho CẢ 2 nửa — mọi ca sinh 00h-01h bị hiểu nhầm thành 23h, lùi nhầm trụ Ngày +1 ngày.
//
// Bản thân công thức trong tinhBatTu() (bat-tu.ts) không sai — chỉ thiếu lối vào hour=0 ở giao diện
// trang Tử Vi (đã sửa ở lap-la-so-tu-vi.astro, tách "Tý (23h-01h)" thành "Tý muộn" hour=0 / "Tý sớm"
// hour=23). Test này khóa lại ĐÚNG hành vi của engine cho cả 2 giá trị, đối chiếu với công cụ
// hocvienlyso.org (Công gửi ảnh so sánh): cùng DL 21/12/2002, giờ ~0h30 (Tý muộn) → Ngày Quý Hợi, Giờ
// Nhâm Tý — khớp chính xác kết quả engine tính ra dưới đây khi dùng hour=0.
import { describe, expect, it } from "vitest";
import { tinhBatTu } from "../src/lib/bat-tu";

describe("tinhBatTu — phân biệt Tý sớm (hour=23) và Tý muộn (hour=0)", () => {
  const NGAY = { day: 21, month: 12, year: 2002, gender: "Nam" as const };

  it("Tý muộn (hour=0): trụ Ngày KHÔNG lùi ngày — khớp hocvienlyso.org (Quý Hợi / Nhâm Tý)", () => {
    const chart = tinhBatTu({ ...NGAY, hour: 0 });
    expect(chart.day.can).toBe("Quý");
    expect(chart.day.chi).toBe("Hợi");
    expect(chart.hour.can).toBe("Nhâm");
    expect(chart.hour.chi).toBe("Tý");
  });

  it("Tý sớm (hour=23): trụ Ngày lùi +1 ngày — ra Giáp Tý/Giáp Tý (đúng như ảnh Công báo lỗi, vì ca thật là Tý muộn nhưng UI cũ ép thành hour=23)", () => {
    const chart = tinhBatTu({ ...NGAY, hour: 23 });
    expect(chart.day.can).toBe("Giáp");
    expect(chart.day.chi).toBe("Tý");
    expect(chart.hour.can).toBe("Giáp");
    expect(chart.hour.chi).toBe("Tý");
  });

  it("Tý sớm và Tý muộn của CÙNG 1 ngày dương lịch luôn cho trụ Ngày liền kề nhau trong vòng Hoa Giáp 60 (Tý sớm = Tý muộn + 1 ngày)", () => {
    // Kiểm tra thêm vài ngày khác để chắc quan hệ này đúng CHUNG, không phải chỉ đúng tình cờ với
    // 21/12/2002 — không dùng chuỗi Can/Chi cụ thể (tránh phụ thuộc bảng tra thủ công), chỉ so sánh
    // 2 kết quả VỚI NHAU bằng đúng phép cộng 1 ngày của can/chi (can +1 mod 10, chi +1 mod 12).
    const CAN_ORDER = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
    const CHI_ORDER = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
    const cases = [
      { day: 21, month: 12, year: 2002 },
      { day: 1, month: 1, year: 2000 },
      { day: 29, month: 2, year: 2024 },
      { day: 15, month: 7, year: 1995 },
    ];
    for (const d of cases) {
      const tyMuon = tinhBatTu({ ...d, hour: 0, gender: "Nam" });
      const tySom = tinhBatTu({ ...d, hour: 23, gender: "Nam" });
      const expectCan = CAN_ORDER[(CAN_ORDER.indexOf(tyMuon.day.can) + 1) % 10];
      const expectChi = CHI_ORDER[(CHI_ORDER.indexOf(tyMuon.day.chi) + 1) % 12];
      expect(tySom.day.can).toBe(expectCan);
      expect(tySom.day.chi).toBe(expectChi);
    }
  });

  it("hourPillar.chi luôn là Tý cho cả hour=0 và hour=23 (cùng khung giờ Tý, chỉ Can khác nhau theo Ngũ Thử Độn)", () => {
    const tyMuon = tinhBatTu({ ...NGAY, hour: 0 });
    const tySom = tinhBatTu({ ...NGAY, hour: 23 });
    expect(tyMuon.hour.chi).toBe("Tý");
    expect(tySom.hour.chi).toBe("Tý");
  });
});
