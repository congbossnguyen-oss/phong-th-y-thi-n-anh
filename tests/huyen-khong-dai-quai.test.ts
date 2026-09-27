// Test engine Huyền Không Đại Quái (HKĐQ) — đối chiếu trực tiếp với nguồn skill
// "huyen-khong-dai-quai" (anthropic-skills), không dùng lại số liệu tự diễn giải:
//   - references/ly-thuyet-nen-tang.md (Vận, Chính/Linh Thần, Không Vong, Sai Thác)
//   - references/vi-du-tham-khao.md (VD1, VD3, VD4, Case Chương I)
//
// Bảng 64 quẻ KHÔNG test lại ở đây — timQueTheoDoSo chỉ bọc mỏng quanh
// XemNgayCaoCap.queTuDoSo (@thien-anh/rule-engine), đã có test toàn vẹn riêng ở
// tests/hkdq-luan-nha-engine.test.ts ("Tái sử dụng bảng 64 quẻ từ rule-engine").
//
// Lưu ý quan trọng khi đọc file test này: VD1/VD3/VD4/Case Chương I trong nguồn KHÔNG
// cho đủ cả cặp (độ số hướng chính xác + năm nhập trạch) cùng lúc cho bất kỳ ca nào —
// nên không thể test tinhToanHKDQ() (hàm cần cả 2 input) như một "ca thực tế đã khớp
// nguồn 100%". Thay vào đó: các hàm thành phần (timQueTheoDoSo, vanHienHanhTheoNam,
// kiemTraKhongVong, kiemTraAmDuongSaiThac...) được test riêng, khớp chính xác số liệu
// nguồn trích dẫn trong từng test. Phần tinhToanHKDQ() chỉ test bằng input tự chọn, rõ
// ràng ghi chú là "test nối dây" (wiring), không phải ca đối chiếu nguồn.

import { describe, expect, it } from "vitest";
import {
  VAN_THOI_GIAN,
  chinhLinhThanTheoVan,
  hopThap,
  kiemTraAmDuongSaiThac,
  kiemTraKhongVong,
  timQueTheoDoSo,
  tinhToanHKDQ,
  vanHienHanhTheoNam,
  vungKhiCuaQuaiKhi,
} from "../src/lib/huyen-khong-dai-quai/engine";

describe("timQueTheoDoSo — đối chiếu điểm trong nguồn (VD1, VD3, VD4, Case Chương I)", () => {
  it("VD1: 137° (giữa Thái 135.000-140.625) → Thái, Quái khí 1, Quái vận 9", () => {
    const q = timQueTheoDoSo(137);
    expect(q.tenQue).toBe("Thái");
    expect(q.quaiKhi).toBe(1);
    expect(q.quaiVan).toBe(9);
  });

  it("VD1: 143° (giữa Đại Súc 140.625-146.250) → Đại Súc, Quái vận 4", () => {
    const q = timQueTheoDoSo(143);
    expect(q.tenQue).toBe("Đại Súc");
    expect(q.quaiVan).toBe(4);
  });

  it("VD3: 177° (giữa Càn 174.375-180.000) → Càn, Quái vận 1 (nguồn: 'cửu vận' OCR ≠ Quái vận, không so trực tiếp)", () => {
    const q = timQueTheoDoSo(177);
    expect(q.tenQue).toBe("Càn");
    expect(q.quaiVan).toBe(1);
  });

  it("VD3: 183° (giữa Cấu 180.000-185.625) → Cấu, Quái vận 8", () => {
    const q = timQueTheoDoSo(183);
    expect(q.tenQue).toBe("Cấu");
    expect(q.quaiVan).toBe(8);
  });

  it("VD4: 250° (giữa Hoán 247.500-253.125) → Hoán, Quái vận 6, Quái khí ngũ hành Hỏa=2", () => {
    const q = timQueTheoDoSo(250);
    expect(q.tenQue).toBe("Hoán");
    expect(q.quaiVan).toBe(6);
    expect(q.quaiKhi).toBe(2);
  });

  it("VD4: 256° (giữa Khảm 253.125-258.750) → Khảm, Quái vận 1", () => {
    const q = timQueTheoDoSo(256);
    expect(q.tenQue).toBe("Khảm");
    expect(q.quaiVan).toBe(1);
  });

  it("VD4: thủy tại Mông (258.750-264.375, Quái vận 2)", () => {
    const q = timQueTheoDoSo(261);
    expect(q.tenQue).toBe("Mông");
    expect(q.quaiVan).toBe(2);
  });

  it("Case Chương I: cửa chính trúng Cổ (213.750-219.375, Quái vận 7)", () => {
    const q = timQueTheoDoSo(216);
    expect(q.tenQue).toBe("Cổ");
    expect(q.quaiVan).toBe(7);
  });

  it("Case Chương I: cửa phụ thêm Thăng (219.375-225.000, Quái vận 2)", () => {
    const q = timQueTheoDoSo(222);
    expect(q.tenQue).toBe("Thăng");
    expect(q.quaiVan).toBe(2);
  });

  it("0° → Phục (biên đóng dưới)", () => {
    expect(timQueTheoDoSo(0).tenQue).toBe("Phục");
  });

  it("359° (gần 360°) → Khôn, vòng qua 360°/0° vẫn ra Khôn", () => {
    expect(timQueTheoDoSo(359).tenQue).toBe("Khôn");
    expect(timQueTheoDoSo(720 + 2).tenQue).toBe(timQueTheoDoSo(2).tenQue);
  });
});

describe("vanHienHanhTheoNam — bảng Nhị Nguyên Bát Vận (mục 3a)", () => {
  it("2026 (năm hiện tại theo hệ thống) → Vận 9, Càn, 2017-2043", () => {
    const v = vanHienHanhTheoNam(2026);
    expect(v).toMatchObject({ van: 9, quaiChuVan: "Càn", namBatDau: 2017, namKetThuc: 2043 });
  });

  it("2003 (năm nhập trạch Case Chương I) → Vận 8, Chấn, 1996-2016", () => {
    const v = vanHienHanhTheoNam(2003);
    expect(v).toMatchObject({ van: 8, quaiChuVan: "Chấn", namBatDau: 1996, namKetThuc: 2016 });
  });

  it("1970 → Vận 6, Cấn", () => {
    expect(vanHienHanhTheoNam(1970)).toMatchObject({ van: 6, quaiChuVan: "Cấn" });
  });

  it("1910 (trong khoảng Vận 3) → quaiChuVan = null vì nguồn đánh dấu [CẦN XÁC NHẬN], không tự suy đoán", () => {
    const v = vanHienHanhTheoNam(1910);
    expect(v.van).toBe(3);
    expect(v.quaiChuVan).toBeNull();
  });

  it("năm ngoài phạm vi bảng (trước 1864) → ném lỗi, không đoán mò", () => {
    expect(() => vanHienHanhTheoNam(1800)).toThrow(/RULE_NOT_DEFINED/);
  });

  it("năm ngoài phạm vi bảng (sau 2043) → ném lỗi", () => {
    expect(() => vanHienHanhTheoNam(2044)).toThrow(/RULE_NOT_DEFINED/);
  });

  it("VAN_THOI_GIAN không có Vận 5 (Nhị Nguyên Bát Vận)", () => {
    expect(VAN_THOI_GIAN.find((v) => v.van === 5)).toBeUndefined();
  });
});

describe("chinhLinhThanTheoVan / vungKhiCuaQuaiKhi — mục 6 (đã Công xác nhận)", () => {
  it("Vận 9 (ví dụ chính thức trong nguồn): Nhóm B {6,7,8,9} là Chính Thần, Nhóm A {1,2,3,4} là Linh Thần", () => {
    const { chinhThan, linhThan } = chinhLinhThanTheoVan(9);
    expect(chinhThan.sort()).toEqual([6, 7, 8, 9]);
    expect(linhThan.sort()).toEqual([1, 2, 3, 4]);
  });

  it("Vận 1 (Nhóm A): Nhóm A là Chính Thần, Nhóm B là Linh Thần — đảo ngược so với Vận 9", () => {
    const { chinhThan, linhThan } = chinhLinhThanTheoVan(1);
    expect(chinhThan.sort()).toEqual([1, 2, 3, 4]);
    expect(linhThan.sort()).toEqual([6, 7, 8, 9]);
  });

  it("Vận không hợp lệ (5, hoặc số ngoài 1-9) → ném lỗi", () => {
    expect(() => chinhLinhThanTheoVan(5)).toThrow(/RULE_NOT_DEFINED/);
    expect(() => chinhLinhThanTheoVan(10)).toThrow(/RULE_NOT_DEFINED/);
  });

  it("quẻ Quái Khí=7 (Khảm) ở Vận 9 → vùng Chính Thần (7 ∈ Nhóm B)", () => {
    expect(vungKhiCuaQuaiKhi(7, 9)).toBe("chinh_than");
  });

  it("quẻ Quái Khí=2 (vd Hoán) ở Vận 9 → vùng Linh Thần (2 ∈ Nhóm A)", () => {
    expect(vungKhiCuaQuaiKhi(2, 9)).toBe("linh_than");
  });
});

describe("hopThap — mục 8 (2 Quái Khí cộng = 10)", () => {
  it.each([
    [1, 9],
    [2, 8],
    [3, 7],
    [4, 6],
  ])("%i + %i = 10 → hợp thập", (a, b) => {
    expect(hopThap(a, b)).toBe(true);
  });

  it("1 + 2 ≠ 10 → không hợp thập", () => {
    expect(hopThap(1, 2)).toBe(false);
  });
});

describe("kiemTraKhongVong — mục 10 (±5° quanh mỗi mốc 5.625°, đại không vong tại 0/90/180/270)", () => {
  it("VD1: cửa tại 135° (đúng mốc chia Lý/Thái) → phạm Không Vong, cách mốc 0°", () => {
    const r = kiemTraKhongVong(135);
    expect(r.phamKhongVong).toBe(true);
    expect(r.khoangCachToiMocGanNhat).toBe(0);
  });

  it("VD3: hướng 180° (đúng mốc Càn/Cấu, cũng là 1 trong 4 mốc bát quái) → ĐẠI Không Vong — 'không dùng được kể cả thủy pháp'", () => {
    const r = kiemTraKhongVong(180);
    expect(r.phamKhongVong).toBe(true);
    expect(r.laDaiKhongVong).toBe(true);
  });

  it("VD4: hướng 253° (sát mốc Hoán/Khảm 253.125°, không phải 1 trong 4 mốc bát quái) → phạm Không Vong nhưng KHÔNG phải đại không vong", () => {
    const r = kiemTraKhongVong(253);
    expect(r.phamKhongVong).toBe(true);
    expect(r.laDaiKhongVong).toBe(false);
  });

  it("điểm giữa quẻ Thái (~137.8°, xa mốc chia nhất trong quẻ 5.625°) vẫn còn cách >5° không mốc nào → an toàn", () => {
    // Thái span 135.000-140.625 → điểm giữa 137.8125, cách mỗi đầu ~2.8° (< 5°) —
    // nhắc lại: với quẻ chỉ rộng 5.625°, không có điểm nào cách mốc ≥5° cả 2 phía,
    // nên bản thân khái niệm "an toàn tuyệt đối" gần như không tồn tại ở độ phân giải
    // 64 quẻ — đây CHÍNH LÀ điều mục 1 cảnh báo (đơn vị chia quá nhỏ, đòi hỏi đo đạc
    // rất chính xác). Test này xác nhận hành vi đó thay vì giả định 1 "vùng an toàn".
    const r = kiemTraKhongVong(137.8125);
    expect(r.phamKhongVong).toBe(true);
  });

  it("điểm cách xa mọi mốc ≥5° (ví dụ 4°, giữa khoảng Phục 0-5.625, cách mốc 0° đúng 4° và mốc 5.625° đúng 1.625°) → vẫn phạm vì gần mốc 5.625°", () => {
    const r = kiemTraKhongVong(4);
    expect(r.khoangCachToiMocGanNhat).toBeCloseTo(1.625, 6);
    expect(r.phamKhongVong).toBe(true);
  });
});

describe("kiemTraAmDuongSaiThac — mục 10 (mốc 45°: 0/45/90/135/180/225/270/315)", () => {
  it("VD1: cửa tại 135° → phạm Âm Dương Sai Thác (khớp mô tả nguồn 'phạm âm dương sai thác')", () => {
    const r = kiemTraAmDuongSaiThac(135);
    expect(r.phamSaiThac).toBe(true);
    expect(r.mocGanNhat).toBe(135);
  });

  it("90° và 225° (2 ví dụ khác nêu trong nguồn) → phạm sai thác", () => {
    expect(kiemTraAmDuongSaiThac(90).phamSaiThac).toBe(true);
    expect(kiemTraAmDuongSaiThac(225).phamSaiThac).toBe(true);
  });

  it("điểm giữa 2 mốc 45° (vd 22.5°, giữa 0° và 45°) → không phạm sai thác", () => {
    expect(kiemTraAmDuongSaiThac(22.5).phamSaiThac).toBe(false);
  });
});

describe("tinhToanHKDQ — test nối dây (input tự chọn, KHÔNG phải ca đối chiếu nguồn)", () => {
  it("Tọa luôn đối xung Hướng đúng 180°", () => {
    const kq = tinhToanHKDQ(45, 2026);
    expect(kq.toa.doSo).toBeCloseTo(225, 6);
  });

  it("hướng 180°, năm 2026 (Vận 9) → cảnh báo Đại Không Vong VÀ Âm Dương Sai Thác đồng thời", () => {
    const kq = tinhToanHKDQ(180, 2026);
    expect(kq.huong.khongVong.laDaiKhongVong).toBe(true);
    expect(kq.huong.amDuongSaiThac.phamSaiThac).toBe(true);
    expect(kq.canhBao.some((c) => c.includes("ĐẠI Không Vong"))).toBe(true);
    expect(kq.canhBao.some((c) => c.includes("Âm Dương Sai Thác"))).toBe(true);
  });

  it("năm truyền vào ngoài phạm vi bảng Vận → ném lỗi, không âm thầm mặc định", () => {
    expect(() => tinhToanHKDQ(180, 1800)).toThrow(/RULE_NOT_DEFINED/);
  });

  it("chinhThanNhom/linhThanNhom trong kết quả khớp đúng chinhLinhThanTheoVan cho cùng năm", () => {
    const kq = tinhToanHKDQ(30, 2026);
    const rieng = chinhLinhThanTheoVan(9);
    expect(kq.chinhThanNhom.sort()).toEqual(rieng.chinhThan.sort());
    expect(kq.linhThanNhom.sort()).toEqual(rieng.linhThan.sort());
  });
});
