/**
 * Dựng hồ sơ PDF tang lễ từ DỮ LIỆU ĐẦU VÀO gốc.
 *
 * Tách riêng khỏi route API vì có hai đường cùng cần: nút "Tải hồ sơ PDF" trên trang kết quả, và
 * email gửi kèm sau khi thanh toán. Hai đường phải cho ra ĐÚNG MỘT bản — nếu mỗi nơi tự dựng thì
 * sớm muộn cũng lệch nhau, mà tang gia lại đối chiếu bản in với bản trên màn hình.
 */
import { apDungPhase2, calculateGioLiemHaHuyet, type GioLiemHaHuyetInput } from "@thien-anh/trachnhat-engine";
import { getLunarDate } from "@thien-anh/calendar-core";
import type { TrungTang } from "@thien-anh/rule-engine";
import { generateHoSoTangLePdf } from "./ho-so-tang-le-pdf";

/** Dữ liệu đầu vào lưu trong `toolInputSnapshot` của đơn hàng, kèm phần bổ sung của Phase 2. */
export interface DauVaoHoSo extends GioLiemHaHuyetInput {
  hoTenNguoiMat?: string;
  nguyenNhanMat?: TrungTang.NguyenNhanMat;
  /** Có tọa độ nghĩa là gia đình đã có huyệt mộ → chạy thêm Phase 2. */
  doSoToa?: number;
}

export type KetQuaTaoHoSo =
  | { taoDuoc: true; pdf: Uint8Array }
  /** Kết cục C: phạm sát cấp năm, không có hồ sơ để xuất — và cũng chưa thu phí. */
  | { taoDuoc: false; lyDo: string };

export async function taoHoSoTangLe(dauVao: DauVaoHoSo): Promise<KetQuaTaoHoSo> {
  const ketQua = calculateGioLiemHaHuyet(dauVao);

  let phase2;
  if (dauVao.doSoToa !== undefined && Number.isFinite(dauVao.doSoToa)) {
    phase2 = apDungPhase2({
      doSoToa: dauVao.doSoToa,
      // Lọc trên rổ rộng rồi mới cắt top — lọc trên top 3 thì Tam Sát/Bát Sát quét sạch.
      phuongAnPhase1: ketQua.tatCaNgayGioHaHuyet ?? [],
      namMat: dauVao.namMat,
      thangMat: dauVao.thangMat,
      ngayMat: dauVao.ngayMat,
      nguyenNhanMat: dauVao.nguyenNhanMat ?? "benh-tuoi-gia",
      ...(dauVao.soNgayDuKienToiChon ? { soNgayDuKienToiChon: dauVao.soNgayDuKienToiChon } : {}),
    });
    if (phase2.ketCuc === "C") return { taoDuoc: false, lyDo: phase2.thongDiep };
  }

  // Âm lịch từng phương án hạ huyệt — hồ sơ phải ghi cả dương lẫn âm lịch.
  const amLichHaHuyet: Record<string, string> = {};
  for (const h of ketQua.ngayGioHaHuyet ?? []) {
    const d = h.ngayDuongLich;
    const am = getLunarDate({ year: d.nam, month: d.thang, day: d.ngay, hour: 12 });
    const khoa = `${String(d.ngay).padStart(2, "0")}/${String(d.thang).padStart(2, "0")}/${d.nam}|${h.chiGio}`;
    amLichHaHuyet[khoa] = `${am.day}/${am.month}${am.isLeapMonth ? " nhuận" : ""}`;
  }

  const pdf = await generateHoSoTangLePdf({
    ...(dauVao.hoTenNguoiMat ? { hoTenNguoiMat: dauVao.hoTenNguoiMat } : {}),
    gioiTinh: dauVao.gioiTinh as "nam" | "nu",
    namSinhDuongLich: dauVao.namSinhDuongLich,
    ngayMat: { ngay: dauVao.ngayMat, thang: dauVao.thangMat, nam: dauVao.namMat },
    chiGioMat: dauVao.chiGioMat,
    ketQua,
    ...(phase2 ? { phase2 } : {}),
    amLichHaHuyet,
  });

  return { taoDuoc: true, pdf };
}
