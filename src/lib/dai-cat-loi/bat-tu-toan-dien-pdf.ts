/**
 * PHIẾU PDF — Luận Giải Bát Tự Toàn Diện (Cơ Bản 299.000đ / Nâng Cao 499.000đ). Dựng từ
 * `BaoCaoCoBan`/`BaoCaoNangCao` (đã tính sẵn từ `orchestrator.ts`), dùng khung PDF chung
 * `pdf-khung.ts`. Bản khách nhận qua email sau khi thanh toán.
 */
import { rgb } from "pdf-lib";
import { taoTaiLieuPdf, veDauTrang, veLuuYVaLienHe, veChanTrang, catVua, LE, A4, MAU, type Fonts, type But } from "./pdf-khung";
import type { BaoCaoCoBan, BaoCaoNangCao, LaSoHienThi, DiemGiaiDoanVan } from "../luan-giai-toan-dien/types";

function veLaSo(b: But, f: Fonts, laSo: LaSoHienThi): void {
  b.muc("Lá số");
  const dongTuTru = laSo.tuTru.map((t) => `${t.tru}: ${t.can} ${t.chi}`).join("   ·   ");
  b.doan(dongTuTru, { size: 9.5, font: f.vua });
  b.doan(`Nhật Chủ: ${laSo.nhatChu}  ·  Vượng Suy: ${laSo.capDoVuongSuy}`, { size: 9.5 });

  b.chua(16);
  let x = LE;
  const nhanThan = (nhan: string, mau: import("pdf-lib").RGB) => {
    x += b.nhan(nhan, x, b.y - 2.5, { mau, size: 8 }) + 6;
  };
  nhanThan(`Dụng Thần ${laSo.dungThan}`, MAU.luc);
  nhanThan(`Hỷ Thần ${laSo.hyThan}`, MAU.lam);
  nhanThan(`Kỵ Thần ${laSo.kyThan}`, MAU.son);
  b.xuong(16);

  if (laSo.dieuHauNote) b.doan(`Điều Hậu: ${laSo.dieuHauNote}`, { size: 9.5, mau: MAU.vang });
  b.xuong(4);
}

const MAU_DIEM = [
  rgb(0xb9 / 255, 0x1c / 255, 0x1c / 255), // -2
  rgb(0xf0 / 255, 0xa8 / 255, 0x98 / 255), // -1
  rgb(0xd8 / 255, 0xcd / 255, 0xb4 / 255), // 0
  rgb(0xa8 / 255, 0xd5 / 255, 0xb0 / 255), // 1
  rgb(0x16 / 255, 0x80 / 255, 0x3d / 255), // 2
];
const mauTheoDiem = (diem: number) => MAU_DIEM[Math.max(-2, Math.min(2, Math.round(diem))) + 2];

const KHIA_CANH: { khoa: keyof Pick<DiemGiaiDoanVan, "sucKhoe" | "congViec" | "taiLoc" | "lucThan">; nhan: string }[] = [
  { khoa: "sucKhoe", nhan: "Sức khỏe" },
  { khoa: "congViec", nhan: "Công việc" },
  { khoa: "taiLoc", nhan: "Tài lộc" },
  { khoa: "lucThan", nhan: "Lục thân" },
];

/** Đồ hình bảng nhiệt (heatmap) 4 khía cạnh x N giai đoạn/năm — bản PDF của BieuDoGiaiDoanVan.astro. */
function veBieuDoGiaiDoan(b: But, f: Fonts, tieuDe: string, moTa: string, danhSach: DiemGiaiDoanVan[]): void {
  if (danhSach.length === 0) return;
  const NHAN_RONG = 62;
  const caoO = 13;
  const rongCot = (A4.w - LE * 2 - NHAN_RONG) / danhSach.length;

  // Giữ tiêu đề + mô tả + lưới điểm cùng 1 trang — tránh tiêu đề bị mồ côi ở cuối trang trước còn
  // lưới điểm rơi sang trang sau (chừa chỗ cho cả cụm trước khi vẽ bất kỳ phần nào).
  b.chua(34 + 14 + 4 + caoO * (KHIA_CANH.length + 1) + 10);
  b.muc(tieuDe);
  b.doan(moTa, { size: 8, mau: MAU.mucNhat });
  b.xuong(4);

  let x = LE + NHAN_RONG;
  for (const d of danhSach) {
    b.page.drawText(catVua(d.nhan, f.dam, 6, rongCot - 2), { x, y: b.y, size: 6, font: f.dam, color: MAU.mucNhat });
    x += rongCot;
  }
  b.y -= caoO;

  for (const kc of KHIA_CANH) {
    b.page.drawText(kc.nhan, { x: LE, y: b.y + 2, size: 7.5, font: f.vua, color: MAU.muc });
    let x2 = LE + NHAN_RONG;
    for (const d of danhSach) {
      b.page.drawRectangle({ x: x2, y: b.y - 2, width: rongCot - 2, height: caoO - 3, color: mauTheoDiem(d[kc.khoa]) });
      x2 += rongCot;
    }
    b.y -= caoO;
  }
  b.xuong(8);

  for (const d of danhSach) {
    const nhanDungThan = d.dungThanVan
      ? `  ·  Dụng Thần ${d.dungThanVan}${d.dungThanDoi ? " (đổi so với nguyên cục)" : ""}`
      : "";
    b.dong(`${d.nhan} (${d.canChi})${nhanDungThan}`, { size: 8, font: f.vua, dan: 2 });
    b.doan(d.tomTat, { size: 7.5, x: LE + 8, mau: MAU.mucNhat });
    if (d.chiTiet) b.doan(d.chiTiet, { size: 8, x: LE + 8 });
    b.xuong(d.chiTiet ? 5 : 2);
  }
  b.xuong(4);
}

function veGiaiDoan(b: But, f: Fonts, ma: string, tieuDe: string, noiDung: string): void {
  b.chua(15);
  const w = b.nhan(ma, LE, b.y - 3, { mau: MAU.son, size: 9 });
  b.dong(tieuDe, { size: 11, font: f.dam, mau: MAU.son, x: LE + w + 8, dan: 4 });
  b.doan(noiDung, { size: 9.5 });
  b.xuong(6);
}

export async function generateBatTuCoBanPdf(baoCao: BaoCaoCoBan, customerName: string): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  await veDauTrang(doc, b, f, {
    tieuDe: "Luận Giải Bát Tự Toàn Diện",
    phuDe: "Bản Cơ Bản — 7 giai đoạn luận giải",
  });

  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(6);

  veLaSo(b, f, baoCao.laSo);
  b.doan(baoCao.disclaimerDauBai, { size: 8.5, font: f.nghieng, mau: MAU.mucNhat });
  b.xuong(6);

  b.muc("Luận giải chi tiết");
  for (const gd of baoCao.giaiDoan) veGiaiDoan(b, f, gd.ma, gd.tieuDe, gd.noiDung);

  veLuuYVaLienHe(b, f, baoCao.disclaimerCuoiBai);
  veChanTrang(doc, f);
  return doc.save();
}

export async function generateBatTuNangCaoPdf(baoCao: BaoCaoNangCao, customerName: string): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  await veDauTrang(doc, b, f, {
    tieuDe: "Luận Giải Bát Tự Toàn Diện",
    phuDe: "Bản Nâng Cao — Thần Sát, lục thân, sức khỏe, Đại Vận",
  });

  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(6);

  veLaSo(b, f, baoCao.laSo);
  b.xuong(6);

  b.muc("Luận giải chi tiết");
  for (const gd of baoCao.giaiDoan) {
    veGiaiDoan(b, f, gd.ma, gd.tieuDe, gd.noiDung);
    if (gd.ma === "K") {
      veBieuDoGiaiDoan(
        b, f, "Đồ hình Đại Vận trọn đời",
        `So với Dụng Thần ${baoCao.laSo.dungThan} · Hỷ Thần ${baoCao.laSo.hyThan} · Kỵ Thần ${baoCao.laSo.kyThan}`,
        baoCao.daiVanBieuDo,
      );
      veBieuDoGiaiDoan(
        b, f, "Đồ hình Lưu Niên — 10 năm tới",
        `Từ năm ${baoCao.luuNienBieuDo[0]?.nhan ?? ""} đến ${baoCao.luuNienBieuDo.at(-1)?.nhan ?? ""}`,
        baoCao.luuNienBieuDo,
      );
    }
  }

  veLuuYVaLienHe(b, f, baoCao.disclaimerCuoiBai);
  veChanTrang(doc, f);
  return doc.save();
}
