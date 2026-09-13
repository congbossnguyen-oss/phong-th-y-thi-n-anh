// Thêm 13/9/2026 — anh Công báo phụ tinh (vd Địa Không, Địa Kiếp) đang không có nhãn Đắc/Hãm (Đ)/(H).
//
// NGUỒN: handoff/knowledge/luan-giai-tu-vi-nam-phai/references/trung-tinh-tieu-tinh.md (Bài 04 + Bài
// 06, Tống Nguyên Trung — đúng profile NAM_PHAI_NGUYEN_CAT). CHỈ 10/20 phụ tinh đang an trên lá số có
// nguồn Đắc/Hãm rõ ràng (xem chú thích PHU_TINH_DAC_HAM trong rules.ts) — cố tình KHÔNG suy đoán cho
// 10 sao còn lại (kể cả Hỏa Tinh/Linh Tinh, nguồn thiếu vế Đắc).
//
// Test KHÔNG viết lại công thức an sao (diaKhongIndex/diaKiepIndex...) — chỉ đối chiếu CHÉO giữa bảng
// PHU_TINH_DAC_HAM và kết quả tinhTuVi() thật, để khóa đúng phần NỐI DÂY (engine.ts gắn trangThai vào
// đúng sao/đúng cung), không phải khóa lại vị trí an sao (đã có test riêng ở các phase khác).
import { describe, expect, it } from "vitest";
import { tinhTuVi, type TuViInput } from "../src/lib/tu-vi/engine";
import { PHU_TINH_DAC_HAM, getPhuTinhDacHam } from "../src/lib/tu-vi/rules";

const CASES: TuViInput[] = [
  { day: 21, month: 12, year: 2002, hour: 0, gender: "Nam" },
  { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" },
  { day: 25, month: 8, year: 1990, hour: 11, gender: "Nam" },
  { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam" },
  { day: 15, month: 7, year: 1995, hour: 15, gender: "Nữ" },
];

describe("getPhuTinhDacHam — tra bảng nguồn Nam Phái", () => {
  it("Địa Không / Địa Kiếp: Đắc đúng 4 cung Dần Thân Tỵ Hợi, Hãm 8 cung còn lại", () => {
    const DAC = new Set(["Dần", "Thân", "Tỵ", "Hợi"]);
    const CHI_ORDER = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
    for (const sao of ["Địa Không", "Địa Kiếp"]) {
      CHI_ORDER.forEach((chi, idx) => {
        expect(getPhuTinhDacHam(sao, idx)).toBe(DAC.has(chi) ? "Đắc" : "Hãm");
      });
    }
  });

  it("Thiên Khôi / Thiên Việt / Tả Phù / Hữu Bật: luôn Đắc cả 12 cung (nguồn 'không hãm địa')", () => {
    for (const sao of ["Thiên Khôi", "Thiên Việt", "Tả Phù", "Hữu Bật"]) {
      for (let chi = 0; chi < 12; chi++) expect(getPhuTinhDacHam(sao, chi)).toBe("Đắc");
    }
  });

  it("sao KHÔNG có nguồn (Lộc Tồn, Hỏa Tinh, Linh Tinh...) trả về null, không bịa giá trị", () => {
    for (const sao of ["Lộc Tồn", "Thiên Mã", "Đào Hoa", "Hồng Loan", "Thiên Hỷ", "Thiên Hình", "Thiên Diêu", "Thiên Y", "Hỏa Tinh", "Linh Tinh"]) {
      expect(getPhuTinhDacHam(sao, 0)).toBeNull();
    }
  });

  it("ném lỗi rõ ràng nếu chiIndex ngoài phạm vi 0-11 (kể cả với sao có nguồn)", () => {
    expect(() => getPhuTinhDacHam("Địa Không", 12)).toThrow(/RULE_NOT_DEFINED/);
    expect(() => getPhuTinhDacHam("Địa Không", -1)).toThrow(/RULE_NOT_DEFINED/);
  });

  it("mỗi bảng trong PHU_TINH_DAC_HAM có đúng 12 phần tử, chỉ gồm giá trị Đắc/Hãm", () => {
    for (const [sao, row] of Object.entries(PHU_TINH_DAC_HAM)) {
      expect(row, sao).toHaveLength(12);
      for (const v of row) expect(["Đắc", "Hãm"], sao).toContain(v);
    }
  });
});

describe("tinhTuVi() — trangThai của phụ tinh khớp đúng PHU_TINH_DAC_HAM tại đúng cung nó an vào", () => {
  for (const input of CASES) {
    it(`ca ${input.day}/${input.month}/${input.year} giờ ${input.hour}`, () => {
      const chart = tinhTuVi(input);
      let daKiemTraItNhat1Sao = false;
      for (const cung of chart.cungs) {
        for (const p of cung.phuTinh) {
          const kyVong = getPhuTinhDacHam(p.name, cung.chiIndex);
          if (kyVong === null) {
            // Sao chưa có nguồn — engine phải để undefined, KHÔNG được tự gán bừa.
            expect(p.trangThai, `${p.name} tại cung chiIndex=${cung.chiIndex}`).toBeUndefined();
          } else {
            expect(p.trangThai, `${p.name} tại cung chiIndex=${cung.chiIndex}`).toBe(kyVong);
            daKiemTraItNhat1Sao = true;
          }
        }
      }
      // Với 5 ca test (đủ đa dạng giờ/năm sinh), phải có ít nhất 1 sao trong 10 sao có nguồn xuất hiện
      // — nếu không thì test này đang không kiểm tra được gì thật (an sao luôn có Tả Phù/Hữu Bật/Khôi/
      // Việt/Xương/Khúc/Kình/Đà/Không/Kiếp, không phụ thuộc ngày giờ nên chắc chắn xuất hiện đủ 10 sao).
      expect(daKiemTraItNhat1Sao).toBe(true);
    });
  }
});
