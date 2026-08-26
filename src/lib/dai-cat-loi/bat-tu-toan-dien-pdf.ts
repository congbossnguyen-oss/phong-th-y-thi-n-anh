/**
 * PHIẾU PDF — Luận Giải Bát Tự Toàn Diện (Cơ Bản 299.000đ / Nâng Cao 499.000đ). Dựng từ
 * `BaoCaoCoBan`/`BaoCaoNangCao` (đã tính sẵn từ `orchestrator.ts`), dùng khung PDF chung
 * `pdf-khung.ts`. Bản khách nhận qua email sau khi thanh toán.
 */
import { taoTaiLieuPdf, veDauTrang, veLuuYVaLienHe, veChanTrang, MAU, type Fonts, type But } from "./pdf-khung";
import type { BaoCaoCoBan, BaoCaoNangCao, LaSoHienThi } from "../luan-giai-toan-dien/types";

function veLaSo(b: But, f: Fonts, laSo: LaSoHienThi): void {
  b.muc("Lá số");
  const dongTuTru = laSo.tuTru.map((t) => `${t.tru}: ${t.can} ${t.chi}`).join("   ·   ");
  b.doan(dongTuTru, { size: 9.5, font: f.vua });
  b.doan(`Nhật Chủ: ${laSo.nhatChu}  ·  Vượng Suy: ${laSo.capDoVuongSuy}`, { size: 9.5 });
  b.doan(`Dụng Thần: ${laSo.dungThan}  ·  Hỷ Thần: ${laSo.hyThan}  ·  Kỵ Thần: ${laSo.kyThan}`, { size: 9.5 });
  b.xuong(4);
}

function veGiaiDoan(b: But, f: Fonts, tieuDe: string, noiDung: string): void {
  b.dong(tieuDe, { size: 11, font: f.dam, mau: MAU.son, dan: 4 });
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
  for (const gd of baoCao.giaiDoan) veGiaiDoan(b, f, gd.tieuDe, gd.noiDung);

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
  for (const gd of baoCao.giaiDoan) veGiaiDoan(b, f, gd.tieuDe, gd.noiDung);

  veLuuYVaLienHe(b, f, baoCao.disclaimerCuoiBai);
  veChanTrang(doc, f);
  return doc.save();
}
