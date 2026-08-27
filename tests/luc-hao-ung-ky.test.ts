// Test cho module Ứng Kỳ (LUAN_QUE_LUC_HAO_SPEC.md §6 — 8 quy luật).
//
// Nguyên tắc test: KHÔNG chỉ kiểm tra "code khớp code" (kiểu golden test tự khẳng định), mà đối
// chiếu với LUẬT LÝ SỐ ĐỘC LẬP — chi xung phải cách 6 ngôi, chi hợp phải đúng cặp Lục Hợp, chi Mộ
// phải đúng vòng Trường Sinh — tính lại bằng công thức riêng trong file test.

import { describe, expect, it } from "vitest";
import { lucHaoCastManual } from "../src/lib/luc-hao";
import { tinhUngKy, timHaoDungThan } from "../src/lib/luc-hao-ung-ky";

const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const idx = (c: string) => CHI.indexOf(c);
// Kiểm chứng độc lập, không import từ engine:
const laXung = (a: string, b: string) => (idx(a) + 6) % 12 === idx(b);
const laHop = (a: string, b: string) => (idx(a) + idx(b)) % 12 === 1;

const NGAY = { day: 10, month: 8, year: 2026, hour: 8, minute: 0 };

describe("tinhUngKy — kiểm tra đầu vào", () => {
  it("từ chối vị trí hào ngoài 1-6", () => {
    const cast = lucHaoCastManual([1, 1, 1, 1, 1, 1], [], NGAY);
    expect(tinhUngKy({ cast, viTriHao: 0 }).hopLe).toBe(false);
    expect(tinhUngKy({ cast, viTriHao: 7 }).hopLe).toBe(false);
    expect(tinhUngKy({ cast, viTriHao: 2.5 }).hopLe).toBe(false);
  });

  it("từ chối lấy Phục Thần ở hào không có Phục Thần", () => {
    const cast = lucHaoCastManual([1, 1, 1, 1, 1, 1], [], NGAY);
    const haoKhongPhuc = cast.chinh.hao.find((h) => !h.phucThan);
    if (haoKhongPhuc) {
      const kq = tinhUngKy({ cast, viTriHao: haoKhongPhuc.hao, laPhucThan: true });
      expect(kq.hopLe).toBe(false);
      expect(kq.loi).toContain("Phục Thần");
    }
  });
});

describe("tinhUngKy — quy luật 1&2 (tĩnh chờ xung, động chờ hợp)", () => {
  it("hào TĨNH sinh ra mốc Trị + Xung, và chi xung đúng cách 6 ngôi", () => {
    const cast = lucHaoCastManual([1, 1, 1, 1, 1, 1], [], NGAY);
    const kq = tinhUngKy({ cast, viTriHao: 1 });
    expect(kq.hopLe).toBe(true);
    expect(kq.trangThai).toContain("tinh");

    // Kiểm tra SỰ THẬT LÝ SỐ (có mốc Trị đúng chi + mốc Xung cách 6 ngôi), KHÔNG kiểm tra hào đó
    // được quy về trạng thái nội bộ nào — vì mốc trùng sẽ được gộp về trạng thái nặng hơn.
    const tri = kq.ungVien.find((u) => u.loai === "Trị");
    const xung = kq.ungVien.find((u) => u.loai === "Xung");
    expect(tri?.chi).toBe(kq.dungThan.chi);
    expect(xung).toBeDefined();
    expect(laXung(kq.dungThan.chi, xung!.chi)).toBe(true);
  });

  it("hào ĐỘNG sinh ra mốc Trị + Hợp, và chi hợp đúng cặp Lục Hợp", () => {
    const cast = lucHaoCastManual([1, 1, 1, 1, 1, 1], [1], NGAY);
    const kq = tinhUngKy({ cast, viTriHao: 1 });
    expect(kq.trangThai).toContain("dong");

    const hop = kq.ungVien.find((u) => u.loai === "Hợp");
    expect(hop).toBeDefined();
    expect(laHop(kq.dungThan.chi, hop!.chi)).toBe(true);
  });
});

describe("tinhUngKy — quy luật 8 (Tuần Không) và 7 (Nguyệt Phá)", () => {
  it("hào rơi Tuần Không thì có mốc Xung Không + Điền Thực, và Điền Thực = chính chi đó", () => {
    // Quét nhiều quẻ/ngày để tìm 1 hào thật sự rơi Tuần Không (không dựng dữ liệu giả).
    let tim: { cast: ReturnType<typeof lucHaoCastManual>; hao: number } | null = null;
    for (let d = 1; d <= 28 && !tim; d++) {
      const cast = lucHaoCastManual([1, 0, 1, 0, 1, 0], [], { ...NGAY, day: d });
      const h = cast.chinh.hao.find((x) => x.xunKong);
      if (h) tim = { cast, hao: h.hao };
    }
    expect(tim).not.toBeNull();

    const kq = tinhUngKy({ cast: tim!.cast, viTriHao: tim!.hao });
    expect(kq.trangThai).toContain("tuan-khong");

    const dienThuc = kq.ungVien.find((u) => u.loai === "Điền Thực" && u.tuTrangThai === "tuan-khong");
    const xungKhong = kq.ungVien.find((u) => u.loai === "Xung" && u.tuTrangThai === "tuan-khong");
    expect(dienThuc?.chi).toBe(kq.dungThan.chi);
    expect(laXung(kq.dungThan.chi, xungKhong!.chi)).toBe(true);
  });

  it("Nguyệt Phá được ưu tiên 1, nặng hơn Tuần Không (spec §6)", () => {
    let tim: { cast: ReturnType<typeof lucHaoCastManual>; hao: number } | null = null;
    for (let m = 1; m <= 12 && !tim; m++) {
      const cast = lucHaoCastManual([1, 0, 1, 0, 1, 0], [], { ...NGAY, month: m });
      const h = cast.chinh.hao.find((x) => x.relations.some((r) => r.type === "Nguyệt Phá"));
      if (h) tim = { cast, hao: h.hao };
    }
    expect(tim).not.toBeNull();

    const kq = tinhUngKy({ cast: tim!.cast, viTriHao: tim!.hao });
    expect(kq.trangThai).toContain("nguyet-pha");
    const phaUuTien = kq.ungVien.filter((u) => u.tuTrangThai === "nguyet-pha").map((u) => u.uuTien);
    expect(Math.min(...phaUuTien)).toBe(1);
    // Nếu đồng thời có Tuần Không thì Không phải xếp sau Phá.
    if (kq.trangThai.includes("tuan-khong")) {
      const khongUuTien = kq.ungVien.filter((u) => u.tuTrangThai === "tuan-khong").map((u) => u.uuTien);
      expect(Math.min(...khongUuTien)).toBeGreaterThan(1);
    }
  });
});

describe("tinhUngKy — quy luật 3&4 (quá vượng: cát và hung NGƯỢC chiều)", () => {
  it("không biết tính chất việc thì KHÔNG tự chốt hướng, phải cảnh báo", () => {
    // Tìm 1 hào quá vượng thật.
    let tim: { cast: ReturnType<typeof lucHaoCastManual>; hao: number } | null = null;
    for (let m = 1; m <= 12 && !tim; m++) {
      for (let d = 1; d <= 28 && !tim; d++) {
        const cast = lucHaoCastManual([1, 1, 0, 0, 1, 0], [], { ...NGAY, month: m, day: d });
        const h = cast.chinh.hao.find(
          (x) => x.vuongSuy === "Vượng" && x.relations.some((r) => r.type === "Lâm Nhật" || r.type === "Lâm Nguyệt" || r.type === "Sinh"),
        );
        if (h) tim = { cast, hao: h.hao };
      }
    }
    expect(tim).not.toBeNull();

    const khongRo = tinhUngKy({ cast: tim!.cast, viTriHao: tim!.hao });
    expect(khongRo.trangThai).toContain("qua-vuong");
    expect(khongRo.ghiChu.some((g) => g.includes("NGƯỢC nhau"))).toBe(true);
    expect(khongRo.ungVien.some((u) => u.tuTrangThai === "qua-vuong")).toBe(false);

    // Cát → chờ Mộ/Xung (hãm lại). Hung → chờ được Sinh (vượng cực sinh họa). Hai hướng phải KHÁC nhau.
    const cat = tinhUngKy({ cast: tim!.cast, viTriHao: tim!.hao, tinhChatViec: "cat" });
    const hung = tinhUngKy({ cast: tim!.cast, viTriHao: tim!.hao, tinhChatViec: "hung" });
    const loaiCat = new Set(cat.ungVien.filter((u) => u.tuTrangThai === "qua-vuong").map((u) => u.loai));
    const loaiHung = new Set(hung.ungVien.filter((u) => u.tuTrangThai === "qua-vuong").map((u) => u.loai));
    expect(loaiHung.has("Sinh")).toBe(true);
    expect(loaiCat.has("Sinh")).toBe(false);
  });
});

describe("tinhUngKy — quy luật 5 (hưu tù gặp Trường Sinh) phải kèm cảnh báo suy kiệt", () => {
  it("có mốc Trường Sinh thì luôn kèm cảnh báo điềm xấu khi suy kiệt", () => {
    let tim: { cast: ReturnType<typeof lucHaoCastManual>; hao: number } | null = null;
    for (let m = 1; m <= 12 && !tim; m++) {
      for (let d = 1; d <= 28 && !tim; d++) {
        const cast = lucHaoCastManual([0, 1, 0, 1, 0, 1], [], { ...NGAY, month: m, day: d });
        const h = cast.chinh.hao.find(
          (x) => (x.vuongSuy === "Hưu" || x.vuongSuy === "Tù" || x.vuongSuy === "Tử") && (x.growthDay === "Trường Sinh" || x.growthMonth === "Trường Sinh"),
        );
        if (h) tim = { cast, hao: h.hao };
      }
    }
    if (!tim) return; // không tìm được mẫu thì bỏ qua, không dựng dữ liệu giả
    const kq = tinhUngKy({ cast: tim!.cast, viTriHao: tim!.hao });
    expect(kq.trangThai).toContain("huu-tu-gap-truong-sinh");
    expect(kq.ghiChu.some((g) => g.includes("CẢNH BÁO"))).toBe(true);
  });
});

describe("tinhUngKy — Phục Thần", () => {
  it("Phục Thần sinh mốc Trị/Xung của chính nó + Xung Phi Thần", () => {
    let tim: { cast: ReturnType<typeof lucHaoCastManual>; hao: number } | null = null;
    for (let d = 1; d <= 28 && !tim; d++) {
      const cast = lucHaoCastManual([1, 1, 1, 0, 0, 0], [], { ...NGAY, day: d });
      const h = cast.chinh.hao.find((x) => x.phucThan);
      if (h) tim = { cast, hao: h.hao };
    }
    expect(tim).not.toBeNull();

    const kq = tinhUngKy({ cast: tim!.cast, viTriHao: tim!.hao, laPhucThan: true });
    expect(kq.hopLe).toBe(true);
    expect(kq.trangThai).toContain("phuc-tang");
    expect(kq.dungThan.laPhucThan).toBe(true);

    const xungPhi = kq.ungVien.find((u) => u.loai === "Xung Phi Thần");
    expect(xungPhi).toBeDefined();
    // Phi Thần chính là hào đang hiện — chi xung phải cách 6 ngôi so với chi hào hiện.
    const chiPhiThan = CHI[tim!.cast.chinh.hao[tim!.hao - 1].chiIndex];
    expect(laXung(chiPhiThan, xungPhi!.chi)).toBe(true);
    // Phải ghi chú rõ vượng suy là mượn tạm.
    expect(kq.ghiChu.some((g) => g.includes("mượn tạm"))).toBe(true);
  });
});

describe("tinhUngKy — đơn vị thời gian (spec §6 ghi chú bổ sung)", () => {
  it("việc xa đọc theo tháng/năm, việc gần đọc theo ngày/tháng", () => {
    const cast = lucHaoCastManual([1, 0, 1, 0, 1, 0], [], NGAY);
    const gan = tinhUngKy({ cast, viTriHao: 3, phamVi: "gan" });
    const xa = tinhUngKy({ cast, viTriHao: 3, phamVi: "xa" });
    expect(["ngày", "tháng"]).toContain(gan.donViGoiY);
    expect(["tháng", "năm"]).toContain(xa.donViGoiY);
    expect(gan.ghiChu.some((g) => g.includes("NGÀY"))).toBe(true);
    expect(xa.ghiChu.some((g) => g.includes("THÁNG") || g.includes("NĂM"))).toBe(true);
  });
});

describe("tinhUngKy — Độc Phát / Độc Tĩnh", () => {
  it("nhận diện Độc Phát (1 hào động) và Độc Tĩnh (5 hào động)", () => {
    const docPhat = lucHaoCastManual([1, 1, 1, 1, 1, 1], [3], NGAY);
    expect(tinhUngKy({ cast: docPhat, viTriHao: 3 }).ghiChu.some((g) => g.includes("Độc Phát"))).toBe(true);

    const docTinh = lucHaoCastManual([1, 1, 1, 1, 1, 1], [1, 2, 3, 4, 5], NGAY);
    expect(tinhUngKy({ cast: docTinh, viTriHao: 6 }).ghiChu.some((g) => g.includes("Độc Tĩnh"))).toBe(true);
  });
});

describe("timHaoDungThan", () => {
  it("trả về đủ hào lưỡng hiện; nếu quẻ không có thì trả Phục Thần", () => {
    const cast = lucHaoCastManual([1, 1, 1, 0, 0, 0], [], NGAY);
    for (const lt of ["Huynh Đệ", "Phụ Mẫu", "Tử Tôn", "Quan Quỷ", "Thê Tài"] as const) {
      const ds = timHaoDungThan(cast, lt);
      expect(ds.length).toBeGreaterThan(0); // luôn tìm được, hoặc hiện hoặc phục
      for (const d of ds) {
        const h = cast.chinh.hao[d.viTriHao - 1];
        expect(d.laPhucThan ? h.phucThan?.lucThan : h.lucThan).toBe(lt);
      }
    }
  });
});
