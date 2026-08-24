// Tab LỊCH (tháng Kỳ Môn) — SPEC mục 6D.

import { getGanzhiMonth } from "@thien-anh/calendar-core";
import { CHI_LIST } from "./constants";
import { _layLaBanTheoLichNoiBo } from "./engine";
import { ensureKmDataLoaded, kmDataByDate } from "./tables";
import { quetTamThang } from "./tamThang";

/** 12 Kiến Trừ, thứ tự cố định — ngày có chi trùng chi tháng = "Kiến", đi thuận theo 12 chi. */
const KIEN_TRU_LIST = [
  "Kiến",
  "Trừ",
  "Mãn",
  "Bình",
  "Định",
  "Chấp",
  "Phá",
  "Nguy",
  "Thành",
  "Thu",
  "Khai",
  "Bế",
] as const;

/** 28 Tú, thứ tự cố định (chu kỳ 28 ngày). */
const TU_LIST = [
  "Giác",
  "Cang",
  "Đê",
  "Phòng",
  "Tâm",
  "Vĩ",
  "Cơ",
  "Đẩu",
  "Ngưu",
  "Nữ",
  "Hư",
  "Nguy",
  "Thất",
  "Bích",
  "Khuê",
  "Lâu",
  "Vị",
  "Mão",
  "Tất",
  "Chủy",
  "Sâm",
  "Tỉnh",
  "Quỷ",
  "Liễu",
  "Tinh",
  "Trương",
  "Dực",
  "Chẩn",
] as const;

/**
 * ⚠️ MỐC NEO 28 TÚ — CHƯA XÁC NHẬN, chỉ là placeholder có chú thích rõ theo đúng yêu cầu của
 * Công (KHÔNG đoán bừa rồi giấu). Tạm gán: ngày đầu tiên trong km_data.json (1901-01-01, stt=1)
 * = tú "Giác" (index 0). Đây là lựa chọn TÙY Ý (28 Tú xoay vòng độc lập với hệ can-chi/cục nên
 * không có cách suy ra mốc đúng từ km_data.json) — CẦN Công đối chiếu app rồi cho mốc đúng
 * (vd "ngày X tháng Y năm Z = tú W") để chỉnh lại 2 hằng số dưới đây.
 */
const TU_ANCHOR_STT = 1;
const TU_ANCHOR_INDEX = 0; // "Giác"

function tinhKienTru(chiNgay: string, chiThang: string): string {
  const iNgay = CHI_LIST.indexOf(chiNgay as (typeof CHI_LIST)[number]);
  const iThang = CHI_LIST.indexOf(chiThang as (typeof CHI_LIST)[number]);
  const idx = ((iNgay - iThang) % 12 + 12) % 12;
  return KIEN_TRU_LIST[idx];
}

function tinhTu(stt: number): string {
  const idx = ((stt - TU_ANCHOR_STT + TU_ANCHOR_INDEX) % 28 + 28) % 28;
  return TU_LIST[idx];
}

export type NgayLichKyMon = {
  ngayDuong: number;
  date: string;
  can: string;
  chi: string;
  /** Trụ tháng (theo tiết khí) của riêng ngày này — có thể đổi giữa các ngày trong cùng 1
   * tháng dương lịch nếu tiết rơi giữa tháng. */
  thangCan: string;
  thangChi: string;
  kienTru: string;
  tu: string;
  /** "V1"/"V2"/"V3"/"V1V2".../undefined nếu ngày đó không có thắng cách nào.
   * ⚠️ CHƯA XÁC NHẬN — tính từ chế độ Ngày, mà công thức lập cục Nhật gia Kỳ Môn hiện CHƯA có đủ
   * dữ liệu mẫu (xem README.md mục Prompt 2). Giữ lại vì hữu ích hơn để trống, nhưng đừng coi là
   * kết quả chốt — có thể sai cùng lý do Trực Phù/Trực Sử chế độ Ngày đang sai lệch. */
  nhanThangCach?: string;
};

const cacheThang = new Map<string, NgayLichKyMon[]>();

/** Lấy lịch 1 tháng dương lịch (Kỳ Môn) — có cache theo "nam-thang" vì phải chạy engine tới
 * ~30 lần cho cột nhãn thắng cách (v1v2/v3).
 *
 * `async` CHỈ vì phải đảm bảo km_data.json đã nạp xong (xem tables.ts) trước khi tra
 * `kmDataByDate` trong vòng lặp bên dưới — vòng lặp và toàn bộ logic tính lịch giữ nguyên 100%
 * đồng bộ, không đổi thuật toán. */
export async function layLichThang(nam: number, thang: number): Promise<NgayLichKyMon[]> {
  const cacheKey = `${nam}-${thang}`;
  const cached = cacheThang.get(cacheKey);
  if (cached) return cached;
  await ensureKmDataLoaded();

  const soNgayTrongThang = new Date(nam, thang, 0).getDate();
  const ketQua: NgayLichKyMon[] = [];

  for (let ngay = 1; ngay <= soNgayTrongThang; ngay++) {
    const dateKey = `${nam}-${String(thang).padStart(2, "0")}-${String(ngay).padStart(2, "0")}`;
    const row = kmDataByDate.get(dateKey);
    if (!row) continue; // ngoài phạm vi km_data.json (1901-01-01 .. 2051-02-07)

    const thangPillar = getGanzhiMonth({
      year: nam,
      month: thang,
      day: ngay,
      hour: 12,
      timeZone: "Asia/Ho_Chi_Minh",
    });

    let nhanThangCach: string | undefined;
    try {
      const laBanNgay = _layLaBanTheoLichNoiBo({ nam, thang, ngay, gio: 12, phut: 0 }, "ngay");
      const tam = quetTamThang(laBanNgay);
      // V1/V2/V3 riêng lẻ LUÔN tồn tại trên mọi lá bàn hợp lệ (không có gì đáng chú ý) — chỉ
      // đáng gắn nhãn khi ≥2 thắng cách TRÙNG cung (loai dài hơn "V1"/"V2"/"V3", vd "V1V2").
      const hangGop = tam.filter((h) => h.loai.length > 2);
      if (hangGop.length > 0) nhanThangCach = hangGop.map((h) => h.loai.toLowerCase()).join(",");
    } catch {
      // bỏ qua — không chặn cả lịch tháng nếu 1 ngày lỗi tra cứu.
    }

    ketQua.push({
      ngayDuong: ngay,
      date: dateKey,
      can: row.can,
      chi: row.chi,
      thangCan: thangPillar.can,
      thangChi: thangPillar.chi,
      kienTru: tinhKienTru(row.chi, thangPillar.chi),
      tu: tinhTu(row.stt),
      nhanThangCach,
    });
  }

  cacheThang.set(cacheKey, ketQua);
  return ketQua;
}
