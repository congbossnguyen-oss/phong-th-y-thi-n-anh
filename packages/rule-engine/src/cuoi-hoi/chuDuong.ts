/**
 * CƯỚI HỎI — CHU ĐƯỜNG (周堂), chỉ áp cho THÀNH HÔN / giá thú.
 *
 * Công thức do chủ dự án cung cấp 2026-08-17. Vòng 8 trực, tra theo NGÀY ÂM LỊCH, và khác nhau
 * giữa tháng ĐỦ (30 ngày) với tháng THIẾU (29 ngày):
 *
 *   tháng đủ    : Phu · Cô · Đường · Ông · Đệ · Táo · Phụ · Trù
 *   tháng thiếu : Phu · Táo · Đệ · Ông · Đường · Cô · Phụ · Trù
 *   index = (ngày âm lịch − 1) % 8
 *
 * ⚠️ ĐIỂM NHẬP NHẰNG ĐÃ XỬ LÝ — bản JavaScript gốc ghi cả vị trí 0 lẫn vị trí 6 là chuỗi "PHU",
 * nhưng đó là HAI trực khác nhau:
 *     vị trí 0 = 夫 "Phu"  → người chồng
 *     vị trí 6 = 婦 "Phụ"  → người vợ
 * Không dấu nên hai chữ trùng mặt chữ. Nếu cài theo CHUỖI thì mất đúng cái phân biệt cốt lõi mà
 * nguồn nêu ("trực Phu bất lợi cho chồng, trực Phụ bất lợi cho vợ"). Vì vậy ở đây phân biệt bằng
 * VỊ TRÍ trong vòng, không bao giờ so sánh bằng tên.
 *
 * Cách đọc này còn được chính dữ liệu xác nhận: bỏ hai đầu ra, phần giữa của hai mảng là ĐẢO
 * NGƯỢC của nhau (Cô-Đường-Ông-Đệ-Táo ↔ Táo-Đệ-Ông-Đường-Cô), tức tháng thiếu đi ngược chiều
 * tháng đủ — còn hai vị trí 0 và 6 giữ nguyên vai trò ở cả hai. Khớp với thứ tự cổ 夫姑堂翁第灶婦廚.
 */

/** 8 trực của vòng Chu Đường, phân biệt bằng mã chứ không bằng chữ hiển thị. */
export type TrucChuDuong = "phu-chong" | "co" | "duong" | "ong" | "de" | "tao" | "phu-vo" | "tru";

export const TEN_TRUC_CHU_DUONG: Readonly<Record<TrucChuDuong, string>> = {
  "phu-chong": "Phu (chồng)",
  co: "Cô",
  duong: "Đường",
  ong: "Ông",
  de: "Đệ",
  tao: "Táo",
  "phu-vo": "Phụ (vợ)",
  tru: "Trù",
};

/** Tháng ĐỦ — 30 ngày. Thứ tự đúng bản gốc chủ dự án cấp. */
const VONG_THANG_DU: readonly TrucChuDuong[] = [
  "phu-chong", "co", "duong", "ong", "de", "tao", "phu-vo", "tru",
];

/** Tháng THIẾU — 29 ngày. Phần giữa đi ngược so với tháng đủ. */
const VONG_THANG_THIEU: readonly TrucChuDuong[] = [
  "phu-chong", "tao", "de", "ong", "duong", "co", "phu-vo", "tru",
];

/**
 * Tra trực Chu Đường của một ngày.
 *
 * @param ngayAmLich  Ngày âm lịch (1-30).
 * @param thangDu     true = tháng đủ (30 ngày), false = tháng thiếu (29 ngày).
 */
export function getChuDuong(ngayAmLich: number, thangDu: boolean): TrucChuDuong {
  if (!Number.isInteger(ngayAmLich) || ngayAmLich < 1 || ngayAmLich > 30) {
    throw new Error(`Ngày âm lịch không hợp lệ: ${ngayAmLich}`);
  }
  const vong = thangDu ? VONG_THANG_DU : VONG_THANG_THIEU;
  return vong[(ngayAmLich - 1) % 8]!;
}

export interface KetQuaChuDuong {
  truc: TrucChuDuong;
  tenTruc: string;
  /** Trực Phu → bất lợi cho người chồng (chú rể). */
  batLoiChuRe: boolean;
  /** Trực Phụ → bất lợi cho người vợ (cô dâu). */
  batLoiCoDau: boolean;
  /** Có bất lợi cho ít nhất một trong hai người hay không. */
  batLoi: boolean;
  moTa: string;
}

/**
 * Luận Chu Đường cho việc THÀNH HÔN.
 *
 * ⚠️ PHẠM VI ĐANG CÀI — nguồn mới chỉ nói rõ hai trực:
 *     "trực Phu bất lợi cho chồng, trực Phụ bất lợi cho vợ".
 * Sáu trực còn lại (Cô, Đường, Ông, Đệ, Táo, Trù) nguồn CHƯA nói tốt hay xấu, và trong sách cổ
 * mỗi trực ứng một người trong nhà (Cô = mẹ chồng, Ông = bố chồng...). Ở đây CỐ Ý coi chúng là
 * không bất lợi cho cô dâu chú rể, và KHÔNG tự suy diễn thêm — chờ chủ dự án bổ sung.
 */
export function luanChuDuong(ngayAmLich: number, thangDu: boolean): KetQuaChuDuong {
  const truc = getChuDuong(ngayAmLich, thangDu);
  const batLoiChuRe = truc === "phu-chong";
  const batLoiCoDau = truc === "phu-vo";
  const tenTruc = TEN_TRUC_CHU_DUONG[truc];

  const moTa = batLoiChuRe
    ? "Ngày trực Phu — theo Chu Đường thì bất lợi cho chú rể."
    : batLoiCoDau
      ? "Ngày trực Phụ — theo Chu Đường thì bất lợi cho cô dâu."
      : `Ngày trực ${tenTruc} — không bất lợi cho cô dâu hay chú rể.`;

  return { truc, tenTruc, batLoiChuRe, batLoiCoDau, batLoi: batLoiChuRe || batLoiCoDau, moTa };
}

/**
 * Các trực mà nguồn CHƯA cho biết luận thế nào — nêu ra để không ai tưởng đã xét đủ 8 trực.
 */
export const TRUC_CHU_DUONG_CHUA_CO_LUAN: readonly TrucChuDuong[] = ["co", "duong", "ong", "de", "tao", "tru"];
