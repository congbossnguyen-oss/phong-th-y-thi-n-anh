// TRẠCH CÁT KỲ MÔN — engine chính.
//
// Phương pháp: "Kỳ Môn Mệnh Trạch Nhật" (zhicong-11.md, thầy Đồng Khôn Nguyên), đối chiếu với
// ky-mon-don-giap-thuc-chien-truong-chan-xuan.md (Bài giảng thứ năm) cho phần an táng/toạ sơn.
//
// Ý tưởng lõi: lấy chính LÁ BÀN KỲ MÔN MỆNH của chủ sự (lập theo giờ sinh) làm "mẫu cục". Mỗi
// cung trên bàn mệnh gắn cố định với 1-2 địa chi, và địa chi đó chính là ĐỊA CHI NGÀY dùng được.
// Chọn ngày = tìm xem cung nào hợp việc, rồi lấy các ngày dương lịch có địa chi rơi vào cung đó.
//
// Quy trình 5 bước (zhicong-11.md Video 5), cài đặt đúng thứ tự:
//   1. Lọc bỏ chi phạm Kỳ Môn Tứ Hại (kích hình, nhập mộ, không vong, môn bách)
//   2. Xét quái tượng: cung phải mang dụng thần của việc dụng sự (mỗi việc một bộ riêng)
//   3. Ngày không hình/xung/khắc/hại với năm sinh chủ sự
//   4. 12 Kiến Tinh và 12 Trực Thần đều cát
//   5. Việc gắn với công trình (động thổ, nhập trạch, an táng) thì tránh xung toạ sơn
// Trọng số nguồn nêu rõ: "yếu tố kỳ môn 70% - thần sát 30%".

import { getCanChi, getGanzhiDay, getGanzhiYear } from "@thien-anh/calendar-core";
import { lapLaBan } from "../engine";
import { CHI_CUNG, CHI_LIST, HUONG_DON_GIAN } from "../constants";
import type { CungInfo, LapLaBanResult } from "../types";
import {
  an12KienTinh,
  an12TrucThan,
  phamTuoiChuSu,
  quanHeChi,
  xetKienTinh,
  xetTrucThan,
  type KienTinh,
  type TrucThan,
} from "./thanSat";
import { chiKhongVong, kiemTraTuHai, type ViPhamTuHai } from "./tuHai";
import { traViec, type DungThanViec, type ViecTrachCat } from "./danhMucViec";

const MUI_GIO = "Asia/Ho_Chi_Minh";

const CAN_LIST = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"] as const;

/** Ngũ thử độn: can ngày → can của giờ Tý (zhicong-11.md Video 7, khẩu quyết "Giáp Kỷ hoàn gia Giáp"). */
const NGU_THU_DON: Record<string, string> = {
  Giáp: "Giáp", Kỷ: "Giáp",
  Ất: "Bính", Canh: "Bính",
  Bính: "Mậu", Tân: "Mậu",
  Đinh: "Canh", Nhâm: "Canh",
  Mậu: "Nhâm", Quý: "Nhâm",
};

/** Các cặp hợp can — tượng "hoà hợp", là dụng thần của nhiều việc. */
const HOP_CAN: Record<string, string> = {
  Giáp: "Kỷ", Kỷ: "Giáp",
  Ất: "Canh", Canh: "Ất",
  Bính: "Tân", Tân: "Bính",
  Đinh: "Nhâm", Nhâm: "Đinh",
  Mậu: "Quý", Quý: "Mậu",
};

const TAM_KY = new Set(["Ất", "Bính", "Đinh"]);

/** Ngũ hành của Cửu Tinh — dùng cho quy tắc an táng (sao thiên bàn/địa bàn không tương khắc). */
const NGU_HANH_SAO: Record<string, string> = {
  "T.Bồng": "Thủy", "T.Nhuế": "Thổ", "T.Xung": "Mộc", "T.Phò": "Mộc",
  "T.Cầm": "Thổ", "T.Tâm": "Kim", "T.Trụ": "Kim", "T.Nhậm": "Thổ", "T.Anh": "Hỏa",
};
const KHAC: Record<string, string> = {
  Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc",
};
/** Ngũ hành cung theo Lạc Thư. */
const NGU_HANH_CUNG_LAC_THU: Record<number, string> = {
  1: "Thủy", 2: "Thổ", 3: "Mộc", 4: "Mộc", 5: "Thổ", 6: "Kim", 7: "Kim", 8: "Thổ", 9: "Hỏa",
};

export type XuHuongTrachCat = "rat_tot" | "tot" | "dung_duoc" | "khong_nen";

export type UngVienChi = {
  chi: string;
  soCung: number;
  huong: string;
  /** Bị loại thẳng ở bước lọc cứng — kèm lý do. */
  biLoai: boolean;
  lyDoLoai: string[];
  kienTinh?: KienTinh;
  trucThan?: TrucThan;
  diemKyMon: number;
  diemThanSat: number;
  diemTong: number;
  xuHuong: XuHuongTrachCat;
  /** Dụng thần khớp được — để giải thích cho khách. */
  diemCong: string[];
  diemTru: string[];
};

export type NgayUngVien = {
  /** Dạng "YYYY-MM-DD". */
  ngay: string;
  canNgay: string;
  chiNgay: string;
  soCung: number;
  huong: string;
  diemTong: number;
  xuHuong: XuHuongTrachCat;
  kienTinh?: string;
  trucThan?: string;
  diemCong: string[];
  diemTru: string[];
};

export type KetQuaTrachCat = {
  hopLe: boolean;
  loi?: string;
  viec?: ViecTrachCat;
  /** Lá bàn Kỳ Môn Mệnh của chủ sự — dùng làm mẫu cục, hiển thị được ra giao diện. */
  banMenh?: LapLaBanResult;
  chiThangSinh?: string;
  chiNamSinh?: string;
  /** Phân tích từng địa chi trên bàn mệnh (12 chi), kể cả chi bị loại. */
  phanTichChi?: UngVienChi[];
  /** Các ngày dương lịch trong khoảng đã chọn, đã xếp hạng. */
  danhSachNgay?: NgayUngVien[];
  canhBao?: string[];
};

// ============================================================================================
// CHẤM ĐIỂM QUÁI TƯỢNG (phần "kỳ môn 70%")
// ============================================================================================

function canTaiCung(cung: CungInfo, trucPhuCung: number): string[] {
  const ds = [cung.thienBanCan, cung.diaBanCan].filter(Boolean);
  // Trực Phù đại diện Giáp — nguồn dùng trực tiếp: "Cung Khảm có Trực Phù (giáp) + kỷ là hợp can".
  if (cung.soCung === trucPhuCung) ds.push("Giáp");
  return ds;
}

function chamDiemQuaiTuong(
  cung: CungInfo,
  dt: DungThanViec,
  trucPhuCung: number,
  coMaTinh: boolean,
): { diem: number; cong: string[]; tru: string[] } {
  const cong: string[] = [];
  const tru: string[] = [];
  // Điểm nền cho cung đã sạch Tứ Hại — bản thân việc qua được bộ lọc cứng đã có giá trị.
  let diem = 25;
  const cacCan = canTaiCung(cung, trucPhuCung);

  if (dt.monChinh?.includes(cung.mon)) {
    diem += 35;
    cong.push(`${cung.mon} Môn — môn hợp nhất với việc này`);
  } else if (dt.monPhu?.includes(cung.mon)) {
    diem += 20;
    cong.push(`${cung.mon} Môn — dùng được cho việc này`);
  }

  for (const t of dt.than ?? []) {
    if (cung.than === t) {
      diem += 15;
      cong.push(`Thần ${cung.than} — hợp tượng việc dụng sự`);
    }
  }
  for (const t of dt.thanKy ?? []) {
    if (cung.than === t) {
      diem -= 25;
      tru.push(`Thần ${cung.than} — kỵ với việc này`);
    }
  }

  for (const c of dt.canTrongYeu ?? []) {
    if (cacCan.includes(c)) {
      diem += 25;
      cong.push(`Có ${c} — yếu tố then chốt của việc này`);
    }
  }
  for (const c of dt.can ?? []) {
    if (cacCan.includes(c)) {
      diem += 12;
      cong.push(`Có ${c} — hợp tượng việc dụng sự`);
    }
  }
  for (const s of dt.sao ?? []) {
    if (cung.saoThienBan === s) {
      diem += 12;
      cong.push(`Sao ${cung.saoThienBan} — hợp tượng việc dụng sự`);
    }
  }

  if (dt.maTinh && coMaTinh) {
    diem += 15;
    cong.push("Có Mã Tinh — thuận cho việc di chuyển/khởi động");
  }
  if (dt.maTinhKy && coMaTinh) {
    diem -= 20;
    tru.push("Có Mã Tinh — chủ động, nghịch với việc cần sự ổn định");
  }

  if (dt.hopCan) {
    const doi = HOP_CAN[cung.thienBanCan];
    const coHopCan = (doi && cacCan.includes(doi)) || cacCan.includes(HOP_CAN[cung.diaBanCan] ?? "");
    if (coHopCan) {
      diem += 12;
      cong.push(`Cặp hợp can ${cung.thienBanCan}-${cung.diaBanCan} — tượng hoà hợp`);
    }
  }

  if (dt.tamKy && cacCan.some((c) => TAM_KY.has(c))) {
    diem += 8;
    cong.push("Có Tam Kỳ (Ất/Bính/Đinh) — phương án bổ trợ");
  }

  return { diem: Math.max(0, Math.min(100, diem)), cong, tru };
}

function chamDiemThanSat(k: KienTinh | undefined, t: TrucThan | undefined): number {
  const mucK = xetKienTinh(k);
  const mucT = xetTrucThan(t);
  const diemK = mucK === "cat" ? 50 : mucK === "trung_cat" ? 35 : 0;
  const diemT = mucT === "cat" ? 50 : 0;
  return diemK + diemT;
}

function xetXuHuong(diem: number): XuHuongTrachCat {
  if (diem >= 70) return "rat_tot";
  if (diem >= 55) return "tot";
  if (diem >= 40) return "dung_duoc";
  return "khong_nen";
}

// ============================================================================================
// ENGINE CHÍNH — CHỌN NGÀY
// ============================================================================================

export type TrachCatInput = {
  /** Ngày giờ sinh dương lịch của chủ sự — để lập bàn Kỳ Môn Mệnh (mẫu cục). */
  namSinh: number;
  thangSinh: number;
  ngaySinh: number;
  gioSinh: number;
  phutSinh: number;
  viecId: string;
  /** Khoảng ngày cần lọc, dạng "YYYY-MM-DD". */
  tuNgay: string;
  denNgay: string;
  /** Số cung toạ sơn của công trình/mộ (bắt buộc với việc canToaSon). */
  toaSonCung?: number;
};

/** Số ngày tối đa được quét trong một lần — chặn tải nặng, đủ cho nhu cầu thực tế. */
export const SO_NGAY_QUET_TOI_DA = 120;

function parseNgay(s: string): { nam: number; thang: number; ngay: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const nam = Number(m[1]);
  const thang = Number(m[2]);
  const ngay = Number(m[3]);
  if (thang < 1 || thang > 12 || ngay < 1 || ngay > 31) return null;
  return { nam, thang, ngay };
}

export async function trachCat(input: TrachCatInput): Promise<KetQuaTrachCat> {
  const viec = traViec(input.viecId);
  if (!viec) return { hopLe: false, loi: "Không tìm thấy việc dụng sự này." };

  if (viec.canToaSon && !input.toaSonCung) {
    return {
      hopLe: false,
      loi: `Việc "${viec.nhan}" bắt buộc phải có toạ sơn của công trình. ${viec.ghiChuToaSon ?? ""}`.trim(),
    };
  }

  const tu = parseNgay(input.tuNgay);
  const den = parseNgay(input.denNgay);
  if (!tu || !den) return { hopLe: false, loi: "Khoảng ngày không hợp lệ." };

  const mocTu = Date.UTC(tu.nam, tu.thang - 1, tu.ngay);
  const mocDen = Date.UTC(den.nam, den.thang - 1, den.ngay);
  if (mocDen < mocTu) return { hopLe: false, loi: "Ngày kết thúc phải sau ngày bắt đầu." };
  const soNgay = Math.round((mocDen - mocTu) / 86400000) + 1;
  if (soNgay > SO_NGAY_QUET_TOI_DA) {
    return { hopLe: false, loi: `Khoảng ngày tối đa là ${SO_NGAY_QUET_TOI_DA} ngày.` };
  }

  // Bàn Kỳ Môn Mệnh của chủ sự — đóng vai trò "mẫu cục" của toàn bộ phương pháp.
  const banMenh = await lapLaBan({
    cheDo: "menh",
    nam: input.namSinh,
    thang: input.thangSinh,
    ngay: input.ngaySinh,
    gio: input.gioSinh,
    phut: input.phutSinh,
  });

  const canChiSinh = getCanChi({
    year: input.namSinh,
    month: input.thangSinh,
    day: input.ngaySinh,
    hour: input.gioSinh,
    minute: input.phutSinh,
    timeZone: MUI_GIO,
  });
  const chiThangSinh = canChiSinh.month.chi;
  const chiNamSinh = canChiSinh.year.chi;

  const bangKien = an12KienTinh(chiThangSinh);
  const bangTruc = an12TrucThan(chiThangSinh);
  const kvSet = chiKhongVong(banMenh);
  const canhBao: string[] = [];

  // Thái Tuế của năm dụng sự (lấy theo năm của ngày bắt đầu khoảng quét).
  const chiThaiTue = getGanzhiYear({ year: tu.nam, month: tu.thang, day: tu.ngay, timeZone: MUI_GIO }).chi;
  const cungThaiTue = Number(
    Object.entries(CHI_CUNG).find(([, ds]) => ds.includes(chiThaiTue))?.[0] ?? 0,
  );
  const canhTheoThaiTue = viec.quyTacRieng?.includes("tranh_phuong_thai_tue") ?? false;
  if (canhTheoThaiTue && input.toaSonCung && input.toaSonCung === cungThaiTue) {
    canhBao.push(
      `Năm ${chiThaiTue}, Thái Tuế đóng tại ${HUONG_DON_GIAN[cungThaiTue]} — trùng đúng toạ sơn công trình. ` +
        "Nguồn dặn không được bổ nhát cuốc đầu tiên từ phương Thái Tuế; nên khởi công từ phương khác rồi mới làm tới.",
    );
  }

  // Chi của toạ sơn — dùng để loại ngày xung toạ.
  const chiToaSon = input.toaSonCung ? (CHI_CUNG[input.toaSonCung] ?? []) : [];

  const phanTichChi: UngVienChi[] = [];
  for (const cung of banMenh.cungList) {
    const dsChi = CHI_CUNG[cung.soCung] ?? [];
    if (dsChi.length === 0) continue; // trung cung không giữ địa chi

    const coMaTinh = cung.Ma;
    for (const chi of dsChi) {
      const lyDoLoai: string[] = [];

      // Bước 1 — Kỳ Môn Tứ Hại.
      const viPham: ViPhamTuHai[] = kiemTraTuHai(banMenh, cung, chi, kvSet);
      for (const v of viPham) lyDoLoai.push(v.moTa);

      // Bước 2 — môn kỵ của việc dụng sự.
      if (viec.dungThan.monKy?.includes(cung.mon)) {
        lyDoLoai.push(`${cung.mon} Môn kỵ với việc "${viec.nhan}"`);
      }

      // Bước 3 — hình/xung/hại/phá với tuổi chủ sự.
      const phamTuoi = phamTuoiChuSu(chi, chiNamSinh);
      if (phamTuoi.pham) lyDoLoai.push(...phamTuoi.lyDo);

      // Bước 5 — xung toạ sơn (việc gắn với công trình cố định).
      for (const cts of chiToaSon) {
        if (quanHeChi(chi, cts).xung) {
          lyDoLoai.push(`ngày ${chi} xung toạ sơn ${cts} của công trình`);
        }
      }

      // Thái Tuế: với động thổ/an táng là lọc cứng, việc khác chỉ cảnh báo.
      if (quanHeChi(chi, chiThaiTue).xung) {
        if (canhTheoThaiTue) {
          lyDoLoai.push(`ngày ${chi} xung Thái Tuế năm ${chiThaiTue}`);
        }
      }

      const kienTinh = bangKien[chi];
      const trucThan = bangTruc[chi];

      if (lyDoLoai.length > 0) {
        phanTichChi.push({
          chi,
          soCung: cung.soCung,
          huong: cung.huong,
          biLoai: true,
          lyDoLoai,
          kienTinh,
          trucThan,
          diemKyMon: 0,
          diemThanSat: 0,
          diemTong: 0,
          xuHuong: "khong_nen",
          diemCong: [],
          diemTru: [],
        });
        continue;
      }

      const qt = chamDiemQuaiTuong(cung, viec.dungThan, banMenh.trucPhuCung, coMaTinh);
      const diemThanSat = chamDiemThanSat(kienTinh, trucThan);
      const diemTong = Math.round(qt.diem * 0.7 + diemThanSat * 0.3);

      const cong = [...qt.cong];
      const tru = [...qt.tru];
      if (xetKienTinh(kienTinh) === "cat") cong.push(`12 Kiến Tinh: ${kienTinh} — hoàng đạo cát nhật`);
      else if (xetKienTinh(kienTinh) === "trung_cat") cong.push(`12 Kiến Tinh: ${kienTinh} — hoàng đạo (trung cát)`);
      else tru.push(`12 Kiến Tinh: ${kienTinh} — hắc đạo`);
      if (xetTrucThan(trucThan) === "cat") cong.push(`12 Trực Thần: ${trucThan} — cát thần`);
      else tru.push(`12 Trực Thần: ${trucThan} — hung thần`);

      const qhTuoi = quanHeChi(chi, chiNamSinh);
      if (qhTuoi.tamHop) cong.push(`Ngày ${chi} tam hợp với tuổi ${chiNamSinh} của chủ sự`);
      if (qhTuoi.lucHop) cong.push(`Ngày ${chi} lục hợp với tuổi ${chiNamSinh} của chủ sự`);

      phanTichChi.push({
        chi,
        soCung: cung.soCung,
        huong: cung.huong,
        biLoai: false,
        lyDoLoai: [],
        kienTinh,
        trucThan,
        diemKyMon: qt.diem,
        diemThanSat,
        diemTong,
        xuHuong: xetXuHuong(diemTong),
        diemCong: cong,
        diemTru: tru,
      });
    }
  }

  // Quét khoảng ngày dương lịch, gán điểm theo địa chi ngày.
  const theoChi = new Map(phanTichChi.map((p) => [p.chi, p]));
  const danhSachNgay: NgayUngVien[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(mocTu + i * 86400000);
    const nam = d.getUTCFullYear();
    const thang = d.getUTCMonth() + 1;
    const ngay = d.getUTCDate();
    const pillar = getGanzhiDay({ year: nam, month: thang, day: ngay, timeZone: MUI_GIO });
    const uv = theoChi.get(pillar.chi);
    if (!uv || uv.biLoai) continue;

    danhSachNgay.push({
      ngay: `${nam}-${String(thang).padStart(2, "0")}-${String(ngay).padStart(2, "0")}`,
      canNgay: pillar.can,
      chiNgay: pillar.chi,
      soCung: uv.soCung,
      huong: uv.huong,
      diemTong: uv.diemTong,
      xuHuong: uv.xuHuong,
      kienTinh: uv.kienTinh,
      trucThan: uv.trucThan,
      diemCong: uv.diemCong,
      diemTru: uv.diemTru,
    });
  }

  danhSachNgay.sort((a, b) => (b.diemTong - a.diemTong) || a.ngay.localeCompare(b.ngay));

  if (danhSachNgay.length === 0) {
    canhBao.push(
      "Không có ngày nào trong khoảng đã chọn qua được bộ lọc. Nên nới rộng khoảng ngày hoặc cân nhắc lại yêu cầu.",
    );
  }

  return {
    hopLe: true,
    viec,
    banMenh,
    chiThangSinh,
    chiNamSinh,
    phanTichChi,
    danhSachNgay,
    canhBao,
  };
}

// ============================================================================================
// CHỌN GIỜ TRONG NGÀY — theo MẪU TỬ CỤC (zhicong-11.md Video 7-8)
//
// Bàn mệnh của chủ sự là "mẫu cục". Để chọn giờ trong một ngày cụ thể:
//   1. Lấy CAN của năm dụng sự, coi như can ngày, dùng ngũ thử độn suy ra can chi ứng với ĐỊA
//      CHI NGÀY đã chọn (ngày lúc này đóng vai "thời trụ").
//   2. Lập bàn Kỳ Môn cho hoa giáp vừa suy ra, GIỮ NGUYÊN số cục và âm/dương của bàn mệnh → tử cục.
//   3. An 12 Kiến Tinh / 12 Trực Thần vào tử cục theo ĐỊA CHI NGÀY đã chọn.
//   4. Mỗi cung của tử cục ứng với một khung giờ — chấm điểm y như bước chọn ngày.
// ============================================================================================

export type GioUngVien = {
  chiGio: string;
  khungGio: string;
  soCung: number;
  huong: string;
  biLoai: boolean;
  lyDoLoai: string[];
  diemTong: number;
  xuHuong: XuHuongTrachCat;
  kienTinh?: string;
  trucThan?: string;
  diemCong: string[];
  diemTru: string[];
  /** Giờ rơi vào khung đêm khuya — hợp lá bàn nhưng thường bất tiện ngoài đời. */
  ngoaiGioThongThuong: boolean;
};

export type KetQuaChonGio = {
  hopLe: boolean;
  loi?: string;
  /** Hoa giáp suy ra bằng ngũ thử độn, dùng để lập tử cục. */
  hoaGiapTuCuc?: string;
  tuCuc?: LapLaBanResult;
  danhSachGio?: GioUngVien[];
  canhBao?: string[];
};

/** Khung giờ dân sự tương ứng mỗi địa chi. */
const KHUNG_GIO: Record<string, string> = {
  Tý: "23h - 01h", Sửu: "01h - 03h", Dần: "03h - 05h", Mão: "05h - 07h",
  Thìn: "07h - 09h", Tỵ: "09h - 11h", Ngọ: "11h - 13h", Mùi: "13h - 15h",
  Thân: "15h - 17h", Dậu: "17h - 19h", Tuất: "19h - 21h", Hợi: "21h - 23h",
};

/**
 * Khung giờ đêm khuya — lá bàn có thể chấm điểm cao nhưng thực tế hiếm ai làm việc vào giờ này.
 * Nguồn nêu đúng tình huống đó: "xét theo 12 kiến tinh và 12 trực thần thì giờ tý khá tốt
 * nhưng không ai khai trương vào giờ này cả". Chỉ đánh dấu để khách tự cân nhắc, KHÔNG loại bỏ.
 */
const GIO_DEM_KHUYA = new Set(["Hợi", "Tý", "Sửu", "Dần"]);

export type ChonGioInput = {
  namSinh: number;
  thangSinh: number;
  ngaySinh: number;
  gioSinh: number;
  phutSinh: number;
  viecId: string;
  /** Ngày đã chọn ở bước trước, dạng "YYYY-MM-DD". */
  ngayChon: string;
  toaSonCung?: number;
};

export async function chonGioTrongNgay(input: ChonGioInput): Promise<KetQuaChonGio> {
  const viec = traViec(input.viecId);
  if (!viec) return { hopLe: false, loi: "Không tìm thấy việc dụng sự này." };
  const nc = parseNgay(input.ngayChon);
  if (!nc) return { hopLe: false, loi: "Ngày đã chọn không hợp lệ." };

  const banMenh = await lapLaBan({
    cheDo: "menh",
    nam: input.namSinh,
    thang: input.thangSinh,
    ngay: input.ngaySinh,
    gio: input.gioSinh,
    phut: input.phutSinh,
  });
  const canChiSinh = getCanChi({
    year: input.namSinh, month: input.thangSinh, day: input.ngaySinh,
    hour: input.gioSinh, minute: input.phutSinh, timeZone: MUI_GIO,
  });
  const chiNamSinh = canChiSinh.year.chi;

  const ngayInput = { year: nc.nam, month: nc.thang, day: nc.ngay, timeZone: MUI_GIO };
  const chiNgayChon = getGanzhiDay(ngayInput).chi;
  const canNam = getGanzhiYear(ngayInput).can;

  // Ngũ thử độn: coi can NĂM dụng sự như can ngày để suy can ứng với địa chi ngày đã chọn.
  const canGioTy = NGU_THU_DON[canNam];
  if (!canGioTy) return { hopLe: false, loi: "Không suy được can theo ngũ thử độn." };
  const buoc = CHI_LIST.indexOf(chiNgayChon as (typeof CHI_LIST)[number]);
  const canTuCuc = CAN_LIST[(CAN_LIST.indexOf(canGioTy as (typeof CAN_LIST)[number]) + buoc) % 10];
  const hoaGiapTuCuc = `${canTuCuc} ${chiNgayChon}`;

  const tuCuc = await lapLaBan({
    cheDo: "1080",
    soCuc: banMenh.cuc,
    amDuong: banMenh.amDuong,
    hoaGiap: hoaGiapTuCuc,
  });

  // An thần sát vào tử cục theo địa chi NGÀY đã chọn (nguồn: "sử dụng địa chi Dần — dần này là
  // ngày dần để khai trương ở trên — để thêm 12 kiến tinh và 12 trực thần vào bàn này").
  const bangKien = an12KienTinh(chiNgayChon);
  const bangTruc = an12TrucThan(chiNgayChon);
  const kvSet = chiKhongVong(tuCuc);
  const canhBao: string[] = [];
  const chiToaSon = input.toaSonCung ? (CHI_CUNG[input.toaSonCung] ?? []) : [];

  // Quy tắc toạ sơn xét trên chính cục của ngày giờ đã chọn (Trương Chí Xuân, Nguyên tắc 3).
  if (input.toaSonCung) {
    const cungToa = tuCuc.cungList.find((c) => c.soCung === input.toaSonCung);
    if (cungToa) {
      const chiToaKV = (CHI_CUNG[input.toaSonCung] ?? []).filter((c) => kvSet.has(c));
      if (chiToaKV.length > 0) {
        canhBao.push(
          `Toạ sơn ${HUONG_DON_GIAN[input.toaSonCung]} có Không Vong tại ${chiToaKV.join(", ")} — nguồn yêu cầu toạ sơn không được Không Vong.`,
        );
      }
      if (["B.Hổ", "Đ.Xà", "H.Vũ"].includes(cungToa.than)) {
        canhBao.push(
          `Toạ sơn ${HUONG_DON_GIAN[input.toaSonCung]} có hung thần ${cungToa.than} bay tới — nguồn yêu cầu ba hung thần Bạch Hổ / Đằng Xà / Huyền Vũ không được đáo toạ sơn.`,
        );
      }
    }
  }

  // Quy tắc riêng cho an táng: tại cung Tử Môn, sao thiên bàn và địa bàn không được tương khắc.
  if (viec.quyTacRieng?.includes("tu_mon_khong_tuong_khac")) {
    const cungTuMon = tuCuc.cungList.find((c) => c.mon === "TỬ");
    if (cungTuMon) {
      // Nguồn nêu ví dụ theo dạng "sao thiên bàn rơi vào cung X thì khắc địa bàn" — nên so ngũ
      // hành sao thiên bàn với ngũ hành của chính cung nó đang đóng.
      const hanhSao = NGU_HANH_SAO[cungTuMon.saoThienBan];
      const hanhCung = NGU_HANH_CUNG_LAC_THU[cungTuMon.soCung];
      if (hanhSao && hanhCung && (KHAC[hanhSao] === hanhCung || KHAC[hanhCung] === hanhSao)) {
        canhBao.push(
          `Cung Tử Môn (${cungTuMon.huong}) có sao ${cungTuMon.saoThienBan} và cung tương khắc — nguồn dặn với việc an táng thì Tử Môn không nên để thiên bàn và địa bàn tương khắc.`,
        );
      }
    }
  }

  const danhSachGio: GioUngVien[] = [];
  for (const cung of tuCuc.cungList) {
    const dsChi = CHI_CUNG[cung.soCung] ?? [];
    if (dsChi.length === 0) continue;

    for (const chi of dsChi) {
      const lyDoLoai: string[] = [];
      for (const v of kiemTraTuHai(tuCuc, cung, chi, kvSet, "giờ")) lyDoLoai.push(v.moTa);
      if (viec.dungThan.monKy?.includes(cung.mon)) {
        lyDoLoai.push(`${cung.mon} Môn kỵ với việc "${viec.nhan}"`);
      }
      // Giờ không được xung ngày đã chọn, cũng không xung tuổi chủ sự (nguồn loại giờ Thân vì
      // "giờ thân xung với ngày Dần", và loại giờ Thìn vì "xung tuổi tuất của chủ sự").
      if (quanHeChi(chi, chiNgayChon).xung) lyDoLoai.push(`giờ ${chi} xung ngày ${chiNgayChon}`);
      const pt = phamTuoiChuSu(chi, chiNamSinh);
      if (pt.pham) lyDoLoai.push(...pt.lyDo.map((s) => s.replace("ngày", "giờ")));
      for (const cts of chiToaSon) {
        if (quanHeChi(chi, cts).xung) lyDoLoai.push(`giờ ${chi} xung toạ sơn ${cts}`);
      }

      const kienTinh = bangKien[chi];
      const trucThan = bangTruc[chi];

      if (lyDoLoai.length > 0) {
        danhSachGio.push({
          chiGio: chi, khungGio: KHUNG_GIO[chi] ?? "", soCung: cung.soCung, huong: cung.huong,
          biLoai: true, lyDoLoai, diemTong: 0, xuHuong: "khong_nen",
          kienTinh, trucThan, diemCong: [], diemTru: [],
          ngoaiGioThongThuong: GIO_DEM_KHUYA.has(chi),
        });
        continue;
      }

      const qt = chamDiemQuaiTuong(cung, viec.dungThan, tuCuc.trucPhuCung, cung.Ma);
      const diemThanSat = chamDiemThanSat(kienTinh, trucThan);
      const diemTong = Math.round(qt.diem * 0.7 + diemThanSat * 0.3);
      const cong = [...qt.cong];
      const tru = [...qt.tru];
      const mucK = xetKienTinh(kienTinh);
      if (mucK === "cat") cong.push(`12 Kiến Tinh: ${kienTinh} — hoàng đạo`);
      else if (mucK === "trung_cat") cong.push(`12 Kiến Tinh: ${kienTinh} — hoàng đạo (trung cát)`);
      else tru.push(`12 Kiến Tinh: ${kienTinh} — hắc đạo`);
      if (xetTrucThan(trucThan) === "cat") cong.push(`12 Trực Thần: ${trucThan} — cát thần`);
      else tru.push(`12 Trực Thần: ${trucThan} — hung thần`);

      const ngoaiGio = GIO_DEM_KHUYA.has(chi);
      if (ngoaiGio) tru.push("Rơi vào khung đêm khuya — hợp lá bàn nhưng thường bất tiện ngoài đời");

      danhSachGio.push({
        chiGio: chi, khungGio: KHUNG_GIO[chi] ?? "", soCung: cung.soCung, huong: cung.huong,
        biLoai: false, lyDoLoai: [], diemTong, xuHuong: xetXuHuong(diemTong),
        kienTinh, trucThan, diemCong: cong, diemTru: tru,
        ngoaiGioThongThuong: ngoaiGio,
      });
    }
  }

  danhSachGio.sort((a, b) => {
    if (a.biLoai !== b.biLoai) return a.biLoai ? 1 : -1;
    // Giờ đêm khuya xếp sau giờ ban ngày khi điểm ngang nhau — ưu tiên phương án dùng được thật.
    if (a.ngoaiGioThongThuong !== b.ngoaiGioThongThuong) return a.ngoaiGioThongThuong ? 1 : -1;
    return b.diemTong - a.diemTong;
  });

  return { hopLe: true, hoaGiapTuCuc, tuCuc, danhSachGio, canhBao };
}

export { DANH_MUC_VIEC_TRACH_CAT, DANH_SACH_TOA_SON, traViec } from "./danhMucViec";
export type { ViecTrachCat } from "./danhMucViec";
