/**
 * PHIẾU PDF — Luận Giải Kỳ Môn Mệnh (chi tiết, trả phí 299.000đ). Dựng từ kết quả
 * `luanGiaiMenh()` + `luanGiaiMenhChiTiet()` (đã tính sẵn từ lá bàn), dùng khung PDF chung
 * `pdf-khung.ts`. Bản khách nhận qua email sau khi thanh toán.
 *
 * Bản chi tiết ĐƯỢC PHÉP nêu tên cách cục kỹ thuật (khác bản miễn phí trên web luôn giấu thuật
 * ngữ Kỳ Môn) — đây là nội dung chuyên sâu khách đã trả phí để xem.
 */
import { taoTaiLieuPdf, veDauTrang, veLuuYVaLienHe, veChanTrang, MAU, LE, type Fonts, type But } from "./pdf-khung";
import type { KetQuaLuanGiaiMenh, KetQuaLuanGiaiChiTiet } from "../kymon";

function veTheLinhVuc(b: But, f: Fonts, tieuDe: string, noiDung: string): void {
  b.dong(`• ${tieuDe}`, { size: 10, font: f.vua, dan: 3 });
  b.doan(noiDung, { size: 9, x: 60 });
  b.xuong(4);
}

export async function generateKyMonMenhPdf(
  free: KetQuaLuanGiaiMenh,
  chiTiet: KetQuaLuanGiaiChiTiet,
  customerName: string,
): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  await veDauTrang(doc, b, f, {
    tieuDe: "Luận Giải Kỳ Môn Mệnh",
    phuDe: "Bản chi tiết — Kỳ Môn Độn Giáp ứng dụng luận mệnh 1 người",
  });

  b.dongGiua(`Kính gửi: ${customerName}`, { size: 12, font: f.dam });
  b.xuong(6);

  b.muc("Tổng quan");
  b.doan(free.moDau, { size: 9.5 });
  b.xuong(4);

  b.muc("Từng lĩnh vực");
  for (const the of free.theLinhVuc) veTheLinhVuc(b, f, the.tieuDe, the.noiDung);

  if (chiTiet.nguoiThan.length > 0) {
    b.muc("Người thân xung quanh");
    for (const nt of chiTiet.nguoiThan) veTheLinhVuc(b, f, nt.vaiTro, nt.noiDung);
  }

  if (chiTiet.giaiDoanCuocDoi.length > 0) {
    b.muc("4 giai đoạn cuộc đời");
    chiTiet.giaiDoanCuocDoi.forEach((gd, i) => {
      b.chua(16);
      const w = b.nhan(`${i + 1}`, LE, b.y - 3, { mau: MAU.vang, size: 9 });
      b.dong(gd.giaiDoan, { size: 10, font: f.vua, x: LE + w + 8, dan: 3 });
      b.doan(gd.noiDung, { size: 9, x: LE + w + 8 });
      b.xuong(4);
    });
  }

  if (chiTiet.cachCucNoiBat.length > 0) {
    b.muc("Cách cục nổi bật (chuyên sâu)");
    const moc = b.danhDau();
    for (const cc of chiTiet.cachCucNoiBat) {
      b.chua(15);
      const w = b.nhan(cc.viTri, LE, b.y - 2.5, { mau: MAU.son, size: 8 });
      b.dong(cc.ten, { size: 10, font: f.dam, mau: MAU.son, x: LE + w + 8, dan: 3 });
      b.doan(cc.yNghia, { size: 9, x: LE + w + 8 });
      b.xuong(4);
    }
    b.thanhNhan(moc, MAU.son);
  }

  veLuuYVaLienHe(
    b,
    f,
    "Kỳ Môn Độn Giáp là công cụ tham khảo theo phương pháp truyền thống, không thay thế tư vấn trực tiếp hoặc quyết định y tế/pháp lý/tài chính quan trọng. Một số vị trí (tuổi đại vận, cung Vợ/Chồng theo giới tính, vượng suy sao...) hiện chưa đủ dữ liệu xác nhận nên chưa đưa vào bản này.",
  );
  veChanTrang(doc, f);
  return doc.save();
}
