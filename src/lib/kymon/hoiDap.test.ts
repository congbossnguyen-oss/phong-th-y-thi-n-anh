import { describe, expect, it } from "vitest";
import { lapLaBan } from "./engine";
import { luanHoiDap } from "./hoiDap";
import { DANH_MUC_CAU_HOI } from "./danhMucCauHoi";

// Từ khi Hỏi Đáp mở bán cho khách (26/8/2026), checkout tính thử câu trả lời TRƯỚC khi tạo đơn và
// từ chối nếu không có. Bộ test này khoá lại đúng cái hợp đồng đó: luanHoiDap phải trả null cho
// tình huống chưa có luật (để checkout chặn được) và trả nội dung thật cho tình huống đã có luật.

const LA_BAN = lapLaBan({ cheDo: "gio", nam: 2026, thang: 8, ngay: 26, gio: 10, phut: 15 });

/** Các tình huống CỐ TÌNH để trống vì nguồn không đủ rõ — xem ghi chú trong từng module chủ đề. */
const CHUA_CO_LUAT: [string, string][] = [
  ["di_lai", "an_toan_doc_duong"],
  ["di_lai", "khi_nao_ve"],
  ["phong_thuy", "chon_huong_dat_vat"],
];

describe("luanHoiDap — chốt chặn không thu tiền khi chưa trả lời được", () => {
  it("trả null cho tình huống chưa có luật", () => {
    for (const [chuDe, tinhHuong] of CHUA_CO_LUAT) {
      expect(luanHoiDap(LA_BAN, chuDe, tinhHuong, "ban_than", ""), `${chuDe}/${tinhHuong}`).toBeNull();
    }
  });

  it("trả null cho chủ đề không tồn tại", () => {
    expect(luanHoiDap(LA_BAN, "khong_co_that", "abc", "ban_than", "")).toBeNull();
  });

  it("mọi tình huống CÒN LẠI trong danh mục đều trả nội dung thật", () => {
    const chuaCoLuat = new Set(CHUA_CO_LUAT.map(([c, t]) => `${c}/${t}`));
    const loi: string[] = [];
    for (const chuDe of DANH_MUC_CAU_HOI) {
      for (const th of chuDe.tinhHuong) {
        if (chuaCoLuat.has(`${chuDe.id}/${th.id}`)) continue;
        const kq = luanHoiDap(LA_BAN, chuDe.id, th.id, "ban_than", "xe máy");
        if (!kq || !kq.vanBan.trim() || !kq.chiTiet.trim()) {
          loi.push(`${chuDe.id}/${th.id}`);
        }
      }
    }
    expect(loi, `Các tình huống này không trả được nội dung: ${loi.join(", ")}`).toEqual([]);
  });
});
