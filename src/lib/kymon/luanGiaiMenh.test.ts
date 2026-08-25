import { describe, expect, it } from "vitest";
import { lapLaBan } from "./engine";
import { luanGiaiMenh, luanGiaiMenhChiTiet } from "./luanGiaiMenh";
import type { CungInfo, LapLaBanResult } from "./types";

// Fixture dựng tay theo đúng đặc điểm lá bàn mẫu trong SPEC_luan_giai_menh.md mục 6 (tứ trụ
// Mậu Dần/Canh Thân/Ất Hợi/Giáp Tý — Can Ngày = Ất): Mệnh Cung tại Càn(6) và Nhập Mộ (NHAP_MO
// Ất = 6), sao Thiên Anh (tính khí nóng nảy), Đỗ Môn + Bạch Hổ (nghề nghiêng quân đội/kỷ luật),
// Sinh Môn tại Chấn(3, Mộc) bị Mệnh Cung(Càn, Kim) khắc → "tiền khó giữ". Không dò ngược ngày
// dương lịch thật vì SPEC chỉ cho tứ trụ, không cho ngày — dựng fixture để test đúng LOGIC ghép
// câu, không phụ thuộc việc tra lịch có khớp đúng ngày lịch sử hay không.
function cung(
  soCung: number,
  sao: string,
  mon: string,
  than: string,
  thienBanCan: string,
  diaChi: string[] = [],
): CungInfo {
  return {
    soCung,
    huong: `Cung ${soCung}`,
    saoThienBan: sao,
    mon,
    than,
    thienBanCan,
    diaBanCan: thienBanCan,
    diaChi,
    KV: false,
    Ma: false,
  };
}

const laBanMau: LapLaBanResult = {
  cheDo: "menh",
  tuTru: {
    gio: { can: "Giáp", chi: "Tý" },
    ngay: { can: "Ất", chi: "Hợi" },
    thang: { can: "Canh", chi: "Thân" },
    nam: { can: "Mậu", chi: "Dần" },
  },
  cuc: 1,
  amDuong: "-",
  phuDau: "Mậu",
  tuanKhongChi: ["Tuất", "Hợi"],
  trucPhu: "T.Anh",
  trucPhuCung: 6,
  trucSu: "ĐỖ",
  trucSuCung: 6,
  cungList: [
    cung(1, "T.Bồng", "HƯU", "T.Phù", "Mậu", ["Tý"]),
    cung(2, "T.Nhuế", "TỬ", "Đ.Xà", "Kỷ", ["Mùi", "Thân"]),
    cung(3, "T.Xung", "SINH", "T.Âm", "Bính", ["Mão"]),
    cung(4, "T.Phò", "THƯƠNG", "L.Hợp", "Đinh", ["Thìn", "Tỵ"]),
    cung(5, "T.Nhuế", "TỬ", "Đ.Xà", "Kỷ", []),
    cung(6, "T.Anh", "ĐỖ", "B.Hổ", "Ất", ["Tuất", "Hợi"]), // Mệnh Cung: canNgay=Ất
    cung(7, "T.Tâm", "CẢNH", "C.Địa", "Tân", ["Dậu"]),
    cung(8, "T.Nhậm", "KHAI", "C.Thiên", "Canh", ["Sửu", "Dần"]),
    cung(9, "T.Trụ", "KINH", "H.Vũ", "Mậu", ["Ngọ"]),
  ],
  ghiChu: [],
  debugTrucSu: {
    W62: "", X62: "", W63: 0, X63: 0, Y63: 0, traNguon: "bang_chinh_xac", tra: 0,
    X64: 0, cuc: 1, amDuong: "-", X65: 6, X66: 6,
  },
};

describe("luanGiaiMenh — fixture theo SPEC_luan_giai_menh.md mục 6", () => {
  it("Mệnh Cung xác định đúng, hợp lệ", () => {
    const kq = luanGiaiMenh(laBanMau);
    expect(kq.hopLe).toBe(true);
  });

  it("đoạn mở đầu nêu đúng tính khí (Thiên Anh) và trạng thái Nhập Mộ", () => {
    const kq = luanGiaiMenh(laBanMau);
    expect(kq.moDau).toMatch(/nóng nảy/); // tinh_cach Thiên Anh
    expect(kq.moDau).toMatch(/trầm lắng|mất phương hướng/); // DICH.nhap_mo
  });

  it("mục Tiền bạc đúng ý 'khó giữ' (Mệnh Cung Kim khắc Sinh Môn tại Chấn/Mộc)", () => {
    const kq = luanGiaiMenh(laBanMau);
    const taiBach = kq.theLinhVuc.find((t) => t.key === "tai_bach");
    expect(taiBach).toBeDefined();
    expect(taiBach!.noiDung).toMatch(/khó giữ/);
  });

  it("mục Công việc gợi ý nghề nghiêng quân đội/kỷ luật (Đỗ Môn + Bạch Hổ tại Mệnh Cung)", () => {
    const kq = luanGiaiMenh(laBanMau);
    const congViec = kq.theLinhVuc.find((t) => t.key === "quan_loc");
    expect(congViec).toBeDefined();
    expect(congViec!.noiDung).toMatch(/quân nhân|bộ đội/);
  });

  it("đủ 10 lĩnh vực + mục Hôn Nhân bổ sung, không có ô nào rỗng/undefined", () => {
    const kq = luanGiaiMenh(laBanMau);
    expect(kq.theLinhVuc.length).toBe(11); // 10 dụng thần + hôn nhân
    for (const the of kq.theLinhVuc) {
      expect(the.noiDung).toBeTruthy();
      expect(the.noiDung).not.toMatch(/undefined|NaN|null/);
      expect(the.chiTiet).toBeTruthy();
    }
  });
});

describe("luanGiaiMenh — chạy trên lá bàn thật từ engine (không crash, dữ liệu sạch)", () => {
  it("lá 17:43 19/08/2026 chế độ Mệnh: sinh văn bản hợp lệ, không lộ undefined/NaN", async () => {
    const laBan = await lapLaBan({ nam: 2026, thang: 8, ngay: 19, gio: 17, phut: 43, cheDo: "menh" });
    const kq = luanGiaiMenh(laBan);
    expect(kq.hopLe).toBe(true);
    expect(kq.moDau.length).toBeGreaterThan(0);
    expect(kq.moDau).not.toMatch(/undefined|NaN|null/);
    expect(kq.theLinhVuc.length).toBeGreaterThanOrEqual(10);
    for (const the of kq.theLinhVuc) {
      expect(the.noiDung).not.toMatch(/undefined|NaN|null/);
    }
  });

  it("chế độ 1080 (không có tứ trụ ngày) → hopLe=false, không throw", async () => {
    const laBan = await lapLaBan({ cheDo: "1080", soCuc: 7, amDuong: "+", hoaGiap: "Giáp Tý" });
    const kq = luanGiaiMenh(laBan);
    expect(kq.hopLe).toBe(false);
    expect(kq.theLinhVuc).toEqual([]);
  });

  it("canNgay = Giáp (Giáp luôn ẩn) → vẫn xác định được Mệnh Cung qua cung của Phù Đầu", async () => {
    // 29/02/2028 12:00 có canNgay = Giáp (đã xác nhận qua API khi rà QA).
    const laBan = await lapLaBan({ nam: 2028, thang: 2, ngay: 29, gio: 12, phut: 0, cheDo: "menh" });
    expect(laBan.tuTru.ngay?.can).toBe("Giáp");
    const kq = luanGiaiMenh(laBan);
    expect(kq.hopLe).toBe(true);
    expect(kq.moDau.length).toBeGreaterThan(0);
    expect(kq.theLinhVuc.length).toBeGreaterThanOrEqual(10);
  });

  it("canNgay = địa bàn can RIÊNG của Trung cung (không khớp bất kỳ thienBanCan nào) → Mệnh Cung = Trung cung", async () => {
    // 15/06/1965 08:30: canNgay="Canh" nhưng không cung nào có thienBanCan="Canh" — "Canh" chính
    // là diaBanCan riêng của Trung cung (phát hiện khi mở rộng năm sinh về 1930). Đã xác nhận qua
    // API: trungCung.diaBanCan === "Canh" đúng bằng canNgay.
    const laBan = await lapLaBan({ nam: 1965, thang: 6, ngay: 15, gio: 8, phut: 30, cheDo: "menh" });
    expect(laBan.tuTru.ngay?.can).toBe("Canh");
    expect(laBan.cungList.some((c) => c.thienBanCan === "Canh")).toBe(false); // xác nhận đúng ca "biến mất"
    const trungCung = laBan.cungList.find((c) => c.soCung === 5)!;
    expect(trungCung.diaBanCan).toBe("Canh");

    const kq = luanGiaiMenh(laBan);
    expect(kq.hopLe).toBe(true);
    expect(kq.moDau.length).toBeGreaterThan(0);
    expect(kq.moDau).not.toMatch(/undefined|NaN|null/);
    expect(kq.theLinhVuc.length).toBeGreaterThanOrEqual(10);
  });

  it("rà nhiều năm sinh 1930-2026 (bước 7 năm): luôn xác định được Mệnh Cung (hopLe=true)", async () => {
    const soLuot: { nam: number; hopLe: boolean; canNgay?: string }[] = [];
    for (let nam = 1930; nam <= 2026; nam += 7) {
      const laBan = await lapLaBan({ nam, thang: 6, ngay: 15, gio: 10, phut: 0, cheDo: "menh" });
      const kq = luanGiaiMenh(laBan);
      soLuot.push({ nam, hopLe: kq.hopLe, canNgay: laBan.tuTru.ngay?.can });
    }
    const thatBai = soLuot.filter((x) => !x.hopLe);
    expect(thatBai).toEqual([]);
  });
});

describe("luanGiaiMenhChiTiet — bản trả phí (Người thân / Giai đoạn cuộc đời / Cách cục nổi bật)", () => {
  it("lá 17:43 19/08/2026 chế độ Mệnh: đủ dữ liệu, không lộ undefined/NaN", async () => {
    const laBan = await lapLaBan({ nam: 2026, thang: 8, ngay: 19, gio: 17, phut: 43, cheDo: "menh" });
    const kq = luanGiaiMenhChiTiet(laBan);
    expect(kq.hopLe).toBe(true);
    expect(kq.nguoiThan.length).toBeGreaterThanOrEqual(5); // Cha/Anh chị em/Con cái/Vợ/Chồng/2 bạn
    expect(kq.giaiDoanCuocDoi.length).toBe(4);
    expect(kq.cachCucNoiBat.length).toBeGreaterThanOrEqual(1); // ít nhất Mệnh Cung luôn có

    const allText = JSON.stringify(kq);
    expect(allText).not.toMatch(/undefined|NaN|null/);
  });

  it("mỗi mục Cách Cục nổi bật có tên + ý nghĩa hợp lệ (tra đúng bảng 81 tổ hợp)", async () => {
    const laBan = await lapLaBan({ nam: 2026, thang: 8, ngay: 19, gio: 17, phut: 43, cheDo: "menh" });
    const kq = luanGiaiMenhChiTiet(laBan);
    for (const cc of kq.cachCucNoiBat) {
      expect(cc.ten.length).toBeGreaterThan(0);
      expect(cc.yNghia.length).toBeGreaterThan(0);
    }
  });

  it("canNgay = địa bàn can riêng của Trung cung (ca đặc biệt 15/06/1965) → vẫn hợp lệ", async () => {
    const laBan = await lapLaBan({ nam: 1965, thang: 6, ngay: 15, gio: 8, phut: 30, cheDo: "menh" });
    const kq = luanGiaiMenhChiTiet(laBan);
    expect(kq.hopLe).toBe(true);
    expect(kq.giaiDoanCuocDoi.length).toBe(4);
  });

  it("rà nhiều năm sinh 1930-2026 (bước 7 năm): luôn hopLe=true, không crash", async () => {
    const ketQua: boolean[] = [];
    for (let nam = 1930; nam <= 2026; nam += 7) {
      const laBan = await lapLaBan({ nam, thang: 9, ngay: 10, gio: 15, phut: 0, cheDo: "menh" });
      const kq = luanGiaiMenhChiTiet(laBan);
      ketQua.push(kq.hopLe);
    }
    expect(ketQua.every(Boolean)).toBe(true);
  });

  it("chế độ 1080 (không tứ trụ) → hopLe=false, không throw", async () => {
    const laBan = await lapLaBan({ cheDo: "1080", soCuc: 3, amDuong: "-", hoaGiap: "Ất Hợi" });
    const kq = luanGiaiMenhChiTiet(laBan);
    expect(kq.hopLe).toBe(false);
  });
});
