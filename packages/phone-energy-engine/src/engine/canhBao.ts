/**
 * Bước 7 — tổng hợp cảnh báo đặc biệt.
 *
 * Nguồn: `luu-y-dac-biet.md`. Mọi ngưỡng lấy từ `data/luuYDacBiet.ts`, không cắm cứng ở đây.
 */
import {
  CAP_DIEN_NIEN,
  CAP_LUC_SAT_DUOI,
  DUOI_BAT_LOI_HON_NHAN_NU,
  NGUONG,
} from "../data/luuYDacBiet.js";
import type { CanhBao, GioiTinh, KetQuaCap } from "../types.js";

function dem(so: string, kyTu: string): number {
  return so.split("").filter((c) => c === kyTu).length;
}

export function tongHopCanhBao(
  soDaChuanHoa: string,
  capGoc: KetQuaCap[],
  gioiTinh?: GioiTinh,
): CanhBao[] {
  const ds: CanhBao[] = [];
  const so5 = dem(soDaChuanHoa, "5");
  const so0 = dem(soDaChuanHoa, "0");

  if (so5 > NGUONG.soLuong5) {
    ds.push({
      ma: "nhieu_so_5",
      tieuDe: `Có ${so5} số 5`,
      moTa: "Nhiều hơn ba số 5 cho thấy vất vả về tiền nong, hay phải kiếm những khoản lặt vặt, khổ vì tài.",
      mucDo: "nhẹ",
    });
  }

  if (so0 > NGUONG.soLuong0) {
    ds.push({
      ma: "so_gay",
      tieuDe: `Có ${so0} số 0 — số gãy`,
      moTa: "Nhiều hơn hai số 0 gọi là số gãy: mọi việc dễ lỡ dở, dang dở, khó đi đến cùng. Hao tổn nguyên khí, sức khỏe dễ mệt nhọc.",
      mucDo: "nặng",
    });
  }

  if (soDaChuanHoa.endsWith("0")) {
    ds.push({
      ma: "tu_dai_giai_khong",
      tieuDe: "Đuôi số là số 0 — tứ đại giai không",
      moTa: "Đây là cảnh báo nặng: dù bận rộn đến đâu thì cuối cùng vẫn dễ về con số không, hoặc không tài phú, hoặc không sự nghiệp, hoặc không tình cảm, hoặc không sức khỏe.",
      mucDo: "nặng",
    });
  }

  if (so5 > NGUONG.soLuong5 && so0 > NGUONG.soLuong0) {
    ds.push({
      ma: "nhieu_ca_0_lan_5",
      tieuDe: "Nhiều cả số 0 lẫn số 5",
      moTa: "Khi cả hai cùng xuất hiện nhiều, mức độ vất vả trong việc kiếm tiền cộng dồn chứ không chỉ riêng lẻ.",
      mucDo: "nặng",
    });
  }

  const soCapDienNien = capGoc.filter((c) => CAP_DIEN_NIEN.includes(c.capGoc.cap)).length;
  if (soCapDienNien >= NGUONG.dienNienDayDac) {
    ds.push({
      ma: "dien_nien_day_dac",
      tieuDe: `Diên Niên lặp ${soCapDienNien} lần`,
      moTa: "Diên Niên là cát tinh, nhưng lặp quá nhiều cũng dẫn đến vất vả vì tài — cùng bản chất quá cường sinh hại.",
      mucDo: "nhẹ",
    });

    if (gioiTinh === "nữ") {
      ds.push({
        ma: "dien_nien_day_dac_nu",
        tieuDe: "Diên Niên dày đặc với người dùng nữ",
        moTa: "Dùng lâu dài dễ biểu hiện tính cách cường thế, cố chấp, áp lực lớn mà kết quả không tương xứng; hôn nhân dễ không thuận. Đây là xu hướng cần lưu ý để chủ động điều chỉnh, không phải phán quyết chắc chắn.",
        mucDo: "nhẹ",
      });
    }
  }

  if (gioiTinh === "nữ") {
    const duoi3 = soDaChuanHoa.slice(-3);
    if (DUOI_BAT_LOI_HON_NHAN_NU.includes(duoi3)) {
      ds.push({
        ma: "duoi_bat_loi_hon_nhan_nu",
        tieuDe: `Đuôi số ${duoi3} bất lợi cho hôn nhân nữ giới`,
        moTa: "Tổ hợp này khiến sự nghiệp nữ giới quá vượng so với người bên cạnh, dễ gây mất cân bằng trong quan hệ.",
        mucDo: "nhẹ",
      });
    }
    const capCuoi = capGoc[capGoc.length - 1];
    if (capCuoi && CAP_LUC_SAT_DUOI.includes(capCuoi.capGoc.cap)) {
      ds.push({
        ma: "luc_sat_o_duoi_nu",
        tieuDe: "Lục Sát nằm ở đuôi số",
        moTa: "Dễ mẫn cảm, bất an, nhiều rắc rối tình cảm — mức độ càng rõ khi càng gần cuối số.",
        mucDo: "nhẹ",
      });
    }
  }

  return ds;
}
