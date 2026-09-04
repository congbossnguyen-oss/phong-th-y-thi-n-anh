import { describe, expect, it } from "vitest";
import { tinhNguQuyVanTai, kiemChungCachCuc } from "../src/lib/ngu-quy-van-tai/engine";
import { BANG_TRA_HUONG_CUA } from "../src/lib/ngu-quy-van-tai/data";
import { SON_24 } from "../src/lib/huyen-khong-phi-tinh/engine";

describe("Ngũ Quỷ Vận Tài — bảng tra gốc", () => {
  it("có đủ 24 sơn, mỗi sơn có Giáng Thủy và Giáng Long không rỗng", () => {
    expect(Object.keys(BANG_TRA_HUONG_CUA)).toHaveLength(24);
    for (const [son, tra] of Object.entries(BANG_TRA_HUONG_CUA)) {
      expect(tra.giangThuy.length, `${son} thiếu Giáng Thủy`).toBeGreaterThan(0);
      expect(tra.giangLong.length, `${son} thiếu Giáng Long`).toBeGreaterThan(0);
      expect(SON_24, `${son} không tồn tại trong SON_24`).toHaveProperty(son);
      for (const s of [...tra.giangThuy, ...tra.giangLong]) {
        expect(SON_24, `${s} (tra từ ${son}) không tồn tại trong SON_24`).toHaveProperty(s);
      }
    }
  });
});

describe("Ngũ Quỷ Vận Tài — case mẫu bắt buộc (mục 5 spec)", () => {
  it("Hướng Cửa = Ngọ (180°, Ly số 9), cấp nhà — đúng 3 cặp phối, cách cục trọn vẹn", () => {
    // Ngọ: SON_24["Ngọ"][0] = 180
    const kq = tinhNguQuyVanTai({ capDo: "nha", chieuTra: "thuan", doHuongCua: 180 });
    expect(kq.sonHuongCuaXacDinh).toBe("Ngọ");

    const sonGiangThuy = kq.phuongAnGiangThuy!.map((p) => p.son);
    expect(sonGiangThuy.sort()).toEqual(["Quý", "Thân", "Thìn", "Tý"].sort());

    const sonGiangLong = kq.phuongAnGiangLong!.map((p) => p.son);
    expect(sonGiangLong.sort()).toEqual(["Bính", "Cấn"].sort());

    // Kiểm chứng đúng 3 cặp phối theo chuỗi Hỏa->Thổ->Kim (chọn 1 phương án cụ thể mỗi bên).
    const kiemChung = kiemChungCachCuc("Ngọ", "Cấn", "Thân");
    expect(kiemChung.cuaThuy).toMatchObject({ ket: "Phúc Đức", hanh: "Kim", dung: true });
    expect(kiemChung.cuaLong).toMatchObject({ ket: "Họa Hại", hanh: "Thổ", dung: true });
    expect(kiemChung.longThuy).toMatchObject({ ket: "Ngũ Quỷ", hanh: "Hỏa", dung: true });
    expect(kiemChung.tronVen).toBe(true);
  });

  it("cấp phòng: Hướng nằm ngủ = Ngọ (180°, thay vai Hướng Cửa), Cửa phòng hướng Tý (0°) khớp Giáng Thủy", () => {
    // Tý (Cửa phòng, đóng vai Giáng Thủy) phải nằm trong danh sách Giáng Thủy tra từ Ngọ.
    const kq = tinhNguQuyVanTai({ capDo: "phong", chieuTra: "thuan", doHuongCua: 180 });
    expect(kq.capDo).toBe("phong");
    const sonGiangThuy = kq.phuongAnGiangThuy!.map((p) => p.son);
    expect(sonGiangThuy).toContain("Tý");

    const kiemChung = kiemChungCachCuc("Ngọ", "Cấn", "Tý");
    expect(kiemChung.cuaThuy.dung).toBe(true);
    expect(kiemChung.tronVen).toBe(true);
  });

  it("cách cục KHÔNG trọn vẹn nếu chọn sai cặp Long/Thủy", () => {
    const kiemChung = kiemChungCachCuc("Ngọ", "Cấn", "Sửu"); // Sửu không phải Giáng Thủy của Ngọ
    expect(kiemChung.cuaThuy.dung).toBe(false);
    expect(kiemChung.tronVen).toBe(false);
  });
});

describe("Ngũ Quỷ Vận Tài — chiều nghịch", () => {
  it("nhập độ Long có sẵn (Cấn, 45°) -> suy ngược Hướng Cửa phù hợp gồm Ngọ", () => {
    const kq = tinhNguQuyVanTai({ capDo: "nha", chieuTra: "nghich", doDiemNghich: 45, loaiDiemNghich: "long" });
    expect(kq.sonDiemNghichXacDinh).toBe("Cấn");
    const sonHuongCua = kq.phuongAnHuongCua!.map((p) => p.son);
    expect(sonHuongCua).toContain("Ngọ");
    expect(sonHuongCua).toContain("Dần");
  });
});

describe("Ngũ Quỷ Vận Tài — đối chiếu Huyền Không Phi Tinh", () => {
  it("thiếu Vận Nhà -> không đối chiếu được, có cảnh báo rõ ràng", () => {
    const kq = tinhNguQuyVanTai({ capDo: "nha", chieuTra: "thuan", doHuongCua: 180 });
    expect(kq.daDoiChieuPhiTinh).toBe(false);
    expect(kq.canhBao.length).toBeGreaterThan(0);
    for (const p of kq.phuongAnGiangLong!) expect(p.trangThaiPhiTinh).toBe("chua_doi_chieu");
  });

  it("đủ Hướng Nhà + Vận Nhà -> đối chiếu được, mỗi phương án có trạng thái rõ ràng", () => {
    const kq = tinhNguQuyVanTai({ capDo: "nha", chieuTra: "thuan", doHuongCua: 180, doHuongNha: 180, vanNha: 9 });
    expect(kq.daDoiChieuPhiTinh).toBe(true);
    expect(kq.vanNhaDaDung).toBe(9);
    for (const p of [...kq.phuongAnGiangLong!, ...kq.phuongAnGiangThuy!]) {
      expect(["kich_duoc", "khong_nen_kich", "trung_tinh"]).toContain(p.trangThaiPhiTinh);
    }
  });

  it("luôn có ghi chú bắt buộc đủ cả 2 bên + ghi chú kết hợp trường phái khác", () => {
    const kq = tinhNguQuyVanTai({ capDo: "nha", chieuTra: "thuan", doHuongCua: 180 });
    expect(kq.ghiChuBatBuocDuCaHaiBen).toMatch(/ĐỦ CẢ/);
    expect(kq.ghiChuKetHopTruongPhaiKhac).toMatch(/Đại Quái|Liên Thành/);
  });
});
