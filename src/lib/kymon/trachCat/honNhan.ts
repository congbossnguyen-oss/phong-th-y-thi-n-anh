// TRẠCH CÁT KỲ MÔN — thuật toán riêng cho việc KẾT HÔN (zhicong-11.md, Video 19).
//
// Đây là việc DUY NHẤT phải lập HAI lá bàn (nam và nữ), rồi tìm các cung TƯƠNG GIAO — cung vừa
// mang vai trò trên bàn người nam, vừa mang vai trò trên bàn người nữ. Nguồn nêu rõ nguyên tắc
// "dựa vào bên nữ là chủ - bên nam là phụ", nên 12 Kiến Tinh / 12 Trực Thần an theo chi tháng
// sinh của NGƯỜI NỮ.
//
// Các vai trò cung mà nguồn dùng:
//   - Mệnh cung      = vị trí can NGÀY SINH của chính người đó trên bàn của họ
//   - Hôn nhân cung  = vị trí Lục Hợp
//   - Phu cung/Thê cung = vị trí thiên can TƯƠNG HỢP với can ngày sinh của chính người đó
//     (nguồn: "người nam sinh ngày Ất thì thê cung của anh ấy sẽ là Canh thiên bàn")
//   - Cung hợp can   = cung có cặp thiên bàn/địa bàn hợp nhau (Giáp Kỷ, Ất Canh, Bính Tân,
//     Đinh Nhâm, Mậu Quý)
//   - Cung Hưu / Sinh / Khai
//
// Bước cuối theo nguồn: ngày chọn ra không được xung với NĂM SINH và NGÀY SINH của cả hai người.

import { getCanChi, getGanzhiDay } from "@thien-anh/calendar-core";
import { lapLaBan } from "../engine";
import { CHI_CUNG } from "../constants";
import type { CungInfo, LapLaBanResult } from "../types";
import { an12KienTinh, an12TrucThan, quanHeChi, xetKienTinh, xetTrucThan, type KienTinh, type TrucThan } from "./thanSat";
import { chiKhongVong, kiemTraTuHai } from "./tuHai";

const MUI_GIO = "Asia/Ho_Chi_Minh";

const HOP_CAN: Record<string, string> = {
  Giáp: "Kỷ", Kỷ: "Giáp",
  Ất: "Canh", Canh: "Ất",
  Bính: "Tân", Tân: "Bính",
  Đinh: "Nhâm", Nhâm: "Đinh",
  Mậu: "Quý", Quý: "Mậu",
};

function timCungTheoCan(laBan: LapLaBanResult, can: string): CungInfo | undefined {
  // Giáp không bao giờ hiện trực tiếp trên thiên bàn — luôn ẩn dưới Phù Đầu.
  if (can === "Giáp") return laBan.cungList.find((c) => c.thienBanCan === laBan.phuDau);
  const kt = laBan.cungList.find((c) => c.thienBanCan === can);
  if (kt) return kt;
  const tc = laBan.cungList.find((c) => c.soCung === 5);
  return tc && tc.diaBanCan === can ? tc : undefined;
}

export type NgaySinhNguoi = {
  nam: number;
  thang: number;
  ngay: number;
  gio: number;
  phut: number;
};

type VaiTroCung = { soCung: number; vaiTro: string };

/** Đánh dấu mọi cung có vai trò trên một lá bàn. `laNam` đổi nhãn phu cung / thê cung. */
function danhDauVaiTro(laBan: LapLaBanResult, canNgaySinh: string, laNam: boolean): VaiTroCung[] {
  const ds: VaiTroCung[] = [];

  const menhCung = timCungTheoCan(laBan, canNgaySinh);
  if (menhCung) ds.push({ soCung: menhCung.soCung, vaiTro: `Mệnh cung (can ngày ${canNgaySinh})` });

  const honNhanCung = laBan.cungList.find((c) => c.than === "L.Hợp");
  if (honNhanCung) ds.push({ soCung: honNhanCung.soCung, vaiTro: "Hôn nhân cung (Lục Hợp)" });

  const canBanDoi = HOP_CAN[canNgaySinh];
  if (canBanDoi) {
    const cungBanDoi = timCungTheoCan(laBan, canBanDoi);
    if (cungBanDoi) {
      ds.push({
        soCung: cungBanDoi.soCung,
        vaiTro: `${laNam ? "Thê cung" : "Phu cung"} (can ${canBanDoi} hợp với can ngày ${canNgaySinh})`,
      });
    }
  }

  for (const c of laBan.cungList) {
    if (c.soCung === 5) continue;
    if (HOP_CAN[c.thienBanCan] === c.diaBanCan) {
      ds.push({ soCung: c.soCung, vaiTro: `Cung hợp can ${c.thienBanCan}-${c.diaBanCan}` });
    }
    if (["HƯU", "SINH", "KHAI"].includes(c.mon)) {
      ds.push({ soCung: c.soCung, vaiTro: `${c.mon} Môn` });
    }
  }

  return ds;
}

export type ChiKetHon = {
  chi: string;
  soCung: number;
  huong: string;
  biLoai: boolean;
  lyDoLoai: string[];
  kienTinh?: KienTinh;
  trucThan?: TrucThan;
  diemTong: number;
  xuHuong: "rat_tot" | "tot" | "dung_duoc" | "khong_nen";
  diemCong: string[];
  diemTru: string[];
};

export type KetQuaHonNhan = {
  banNu: LapLaBanResult;
  banNam: LapLaBanResult;
  chiThangSinhNu: string;
  phanTichChi: ChiKetHon[];
  canhBao: string[];
};

export async function trachCatKetHon(nam: NgaySinhNguoi, nu: NgaySinhNguoi): Promise<KetQuaHonNhan> {
  const banNam = await lapLaBan({ cheDo: "menh", ...nam });
  const banNu = await lapLaBan({ cheDo: "menh", ...nu });

  const ccNam = getCanChi({
    year: nam.nam, month: nam.thang, day: nam.ngay, hour: nam.gio, minute: nam.phut, timeZone: MUI_GIO,
  });
  const ccNu = getCanChi({
    year: nu.nam, month: nu.thang, day: nu.ngay, hour: nu.gio, minute: nu.phut, timeZone: MUI_GIO,
  });

  const vaiTroNam = danhDauVaiTro(banNam, ccNam.day.can, true);
  const vaiTroNu = danhDauVaiTro(banNu, ccNu.day.can, false);

  const theoCungNam = new Map<number, string[]>();
  for (const v of vaiTroNam) {
    theoCungNam.set(v.soCung, [...(theoCungNam.get(v.soCung) ?? []), v.vaiTro]);
  }
  const theoCungNu = new Map<number, string[]>();
  for (const v of vaiTroNu) {
    theoCungNu.set(v.soCung, [...(theoCungNu.get(v.soCung) ?? []), v.vaiTro]);
  }

  // Bên nữ là chủ → an thần sát theo chi tháng sinh của nữ.
  const chiThangSinhNu = ccNu.month.chi;
  const bangKien = an12KienTinh(chiThangSinhNu);
  const bangTruc = an12TrucThan(chiThangSinhNu);
  const kvNam = chiKhongVong(banNam);
  const kvNu = chiKhongVong(banNu);

  // 4 mốc phải tránh xung: năm sinh và ngày sinh của cả hai người.
  const mocTranhXung: { chi: string; nhan: string }[] = [
    { chi: ccNam.year.chi, nhan: "năm sinh người nam" },
    { chi: ccNam.day.chi, nhan: "ngày sinh người nam" },
    { chi: ccNu.year.chi, nhan: "năm sinh người nữ" },
    { chi: ccNu.day.chi, nhan: "ngày sinh người nữ" },
  ];

  const phanTichChi: ChiKetHon[] = [];
  for (const cungNu of banNu.cungList) {
    const dsChi = CHI_CUNG[cungNu.soCung] ?? [];
    if (dsChi.length === 0) continue;

    const vtNam = theoCungNam.get(cungNu.soCung) ?? [];
    const vtNu = theoCungNu.get(cungNu.soCung) ?? [];
    const cungNam = banNam.cungList.find((c) => c.soCung === cungNu.soCung);

    for (const chi of dsChi) {
      const lyDoLoai: string[] = [];

      // Phải TƯƠNG GIAO — có vai trò trên cả hai bàn thì cung mới dùng được cho hôn sự.
      if (vtNam.length === 0 || vtNu.length === 0) {
        lyDoLoai.push(
          vtNam.length === 0 && vtNu.length === 0
            ? "cung này không mang vai trò nào trên cả hai lá bàn"
            : `cung chỉ có vai trò ở một bên (${vtNam.length > 0 ? "bàn nam" : "bàn nữ"}), không tương giao`,
        );
      }

      // Tứ hại xét trên CẢ HAI bàn — nguồn loại ngày Thân vì "cung khôn của nam có không vong ở Thân".
      for (const v of kiemTraTuHai(banNu, cungNu, chi, kvNu)) lyDoLoai.push(`bàn nữ: ${v.moTa}`);
      if (cungNam) {
        for (const v of kiemTraTuHai(banNam, cungNam, chi, kvNam)) lyDoLoai.push(`bàn nam: ${v.moTa}`);
      }

      for (const m of mocTranhXung) {
        if (quanHeChi(chi, m.chi).xung) lyDoLoai.push(`ngày ${chi} xung ${m.nhan} (${m.chi})`);
      }

      const kienTinh = bangKien[chi];
      const trucThan = bangTruc[chi];

      if (lyDoLoai.length > 0) {
        phanTichChi.push({
          chi, soCung: cungNu.soCung, huong: cungNu.huong, biLoai: true, lyDoLoai,
          kienTinh, trucThan, diemTong: 0, xuHuong: "khong_nen", diemCong: [], diemTru: [],
        });
        continue;
      }

      const cong: string[] = [
        ...vtNu.map((v) => `Bàn nữ — ${v}`),
        ...vtNam.map((v) => `Bàn nam — ${v}`),
      ];
      const tru: string[] = [];

      // Càng nhiều vai trò chồng lên nhau thì cung càng "đậm" ý nghĩa hôn sự.
      let diemQuaiTuong = 25 + Math.min(60, (vtNam.length + vtNu.length) * 12);
      const coLucHop =
        vtNu.some((v) => v.includes("Lục Hợp")) || vtNam.some((v) => v.includes("Lục Hợp"));
      if (coLucHop) {
        diemQuaiTuong += 10;
        cong.push("Có Lục Hợp — dụng thần chính của hôn sự");
      }
      diemQuaiTuong = Math.max(0, Math.min(100, diemQuaiTuong));

      const mucK = xetKienTinh(kienTinh);
      const mucT = xetTrucThan(trucThan);
      const diemThanSat = (mucK === "cat" ? 50 : mucK === "trung_cat" ? 35 : 0) + (mucT === "cat" ? 50 : 0);
      if (mucK === "cat") cong.push(`12 Kiến Tinh: ${kienTinh} — hoàng đạo cát nhật`);
      else if (mucK === "trung_cat") cong.push(`12 Kiến Tinh: ${kienTinh} — hoàng đạo (trung cát)`);
      else tru.push(`12 Kiến Tinh: ${kienTinh} — hắc đạo`);
      if (mucT === "cat") cong.push(`12 Trực Thần: ${trucThan} — cát thần`);
      else tru.push(`12 Trực Thần: ${trucThan} — hung thần`);

      for (const m of mocTranhXung) {
        const qh = quanHeChi(chi, m.chi);
        if (qh.tamHop) cong.push(`Ngày ${chi} tam hợp ${m.nhan} (${m.chi})`);
        if (qh.lucHop) cong.push(`Ngày ${chi} lục hợp ${m.nhan} (${m.chi})`);
      }

      const diemTong = Math.round(diemQuaiTuong * 0.7 + diemThanSat * 0.3);
      phanTichChi.push({
        chi, soCung: cungNu.soCung, huong: cungNu.huong, biLoai: false, lyDoLoai: [],
        kienTinh, trucThan, diemTong,
        xuHuong: diemTong >= 70 ? "rat_tot" : diemTong >= 55 ? "tot" : diemTong >= 40 ? "dung_duoc" : "khong_nen",
        diemCong: cong, diemTru: tru,
      });
    }
  }

  const canhBao: string[] = [];
  // Nguồn đặt điều kiện tiên quyết trước khi xét ngày: hai tuổi và hai ngày sinh không được xung nhau.
  if (quanHeChi(ccNam.year.chi, ccNu.year.chi).xung) {
    canhBao.push(
      `Năm sinh hai người xung nhau (${ccNam.year.chi} - ${ccNu.year.chi}). Nguồn đặt đây là điều kiện tiên quyết của hôn sự, nên cân nhắc kỹ ngoài việc chọn ngày.`,
    );
  }
  if (quanHeChi(ccNam.day.chi, ccNu.day.chi).xung) {
    canhBao.push(
      `Ngày sinh hai người xung nhau (${ccNam.day.chi} - ${ccNu.day.chi}) — địa chi ngày ứng cung phu thê trong Bát Tự.`,
    );
  }

  return { banNu, banNam, chiThangSinhNu, phanTichChi, canhBao };
}

/** Quét khoảng ngày dương lịch, giữ lại ngày có địa chi rơi vào nhóm đã chấm điểm. */
export function quetNgayKetHon(
  phanTichChi: ChiKetHon[],
  mocTu: number,
  soNgay: number,
): { ngay: string; canNgay: string; chiNgay: string; uv: ChiKetHon }[] {
  const theoChi = new Map(phanTichChi.map((p) => [p.chi, p]));
  const out: { ngay: string; canNgay: string; chiNgay: string; uv: ChiKetHon }[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(mocTu + i * 86400000);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const dd = d.getUTCDate();
    const pillar = getGanzhiDay({ year: y, month: m, day: dd, timeZone: MUI_GIO });
    const uv = theoChi.get(pillar.chi);
    if (!uv || uv.biLoai) continue;
    out.push({
      ngay: `${y}-${String(m).padStart(2, "0")}-${String(dd).padStart(2, "0")}`,
      canNgay: pillar.can,
      chiNgay: pillar.chi,
      uv,
    });
  }
  return out;
}
