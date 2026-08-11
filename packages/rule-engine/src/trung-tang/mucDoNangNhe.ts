/**
 * TRÙNG TANG — Bước 2: định mức độ nặng nhẹ + điều kiện tự hóa giải.
 *
 * ⚠️ Nguồn tự mâu thuẫn ở "điều kiện tự hóa giải": 1 câu nói chỉ cung TUỔI là Nhập Mộ mới cứu
 * được, câu ngay sau lại nói CUNG NÀO Nhập Mộ cũng cứu được (cách phổ biến trong dân gian, đối
 * chiếu huyenbi.net và các công cụ tra cứu phổ thông khác cũng dùng cách này). Hàm ở đây trả về
 * CẢ HAI kết quả riêng biệt (`tuHoaGiaiPhoBien`, `tuHoaGiaiChatChe`) — không tự chọn 1 bên,
 * tầng hiển thị phải nêu rõ cả hai cho người xem tự cân nhắc.
 *
 * Số người chết theo mỗi cấp KHÔNG được đưa vào đây theo chủ đích — sách có 2 hệ số liệu khác
 * nhau (1/2/3/7 người hay 3/5/7 người) và khuyến nghị nghề nói rõ: "đừng nói con số người chết
 * với gia chủ, chỉ nói mức nặng/vừa/nhẹ là đủ".
 */
import type { Data } from "@thien-anh/calendar-core";
import { phanLoaiCung, type BonCungTrungTang } from "./chuongPhap.js";

type Chi = Data.Chi;

export type MucDoTrungTang = "khong-pham" | "nhat-xa" | "nhi-xa" | "tam-xa" | "that-xa" | "khong-du-du-lieu";

export interface MucDoKetQua {
  /** Danh sách 3 hoặc 4 cung đã xét (Tuổi, Tháng, Ngày, [Giờ]). */
  cacCungDaXet: readonly { ten: string; chi: Chi; phanLoai: ReturnType<typeof phanLoaiCung> }[];
  soCungPham: number;
  soCungDaXet: number;
  mucDo: MucDoTrungTang;
  /** Có >=1 cung bất kỳ trong 4 cung là Nhập Mộ hay không — cách hiểu phổ biến trong dân gian. */
  tuHoaGiaiPhoBien: boolean;
  /** Riêng cung Tuổi có phải Nhập Mộ hay không — cách hiểu chặt chẽ hơn theo 1 đoạn khác trong sách. */
  tuHoaGiaiChatChe: boolean;
}

const TEN_CUNG = ["Tuổi", "Tháng", "Ngày", "Giờ"] as const;

export function tinhMucDoNangNhe(bonCung: BonCungTrungTang): MucDoKetQua {
  const danhSach: Chi[] = [bonCung.cungTuoi, bonCung.cungThang, bonCung.cungNgay];
  if (bonCung.cungGio) danhSach.push(bonCung.cungGio);

  const cacCungDaXet = danhSach.map((chi, i) => ({ ten: TEN_CUNG[i]!, chi, phanLoai: phanLoaiCung(chi) }));
  const soCungDaXet = danhSach.length;
  const soCungPham = cacCungDaXet.filter((c) => c.phanLoai === "trung-tang").length;

  let mucDo: MucDoTrungTang;
  if (soCungDaXet < 4) {
    mucDo = "khong-du-du-lieu";
  } else if (soCungPham === 0) {
    mucDo = "khong-pham";
  } else if (soCungPham === 1) {
    mucDo = "nhat-xa";
  } else if (soCungPham === 2) {
    mucDo = "nhi-xa";
  } else if (soCungPham === 3) {
    mucDo = "tam-xa";
  } else {
    mucDo = "that-xa";
  }

  const tuHoaGiaiPhoBien = cacCungDaXet.some((c) => c.phanLoai === "nhap-mo");
  const tuHoaGiaiChatChe = phanLoaiCung(bonCung.cungTuoi) === "nhap-mo";

  return { cacCungDaXet, soCungPham, soCungDaXet, mucDo, tuHoaGiaiPhoBien, tuHoaGiaiChatChe };
}

export const NHAN_MUC_DO: Record<MucDoTrungTang, string> = {
  "khong-pham": "Không phạm Trùng Tang",
  "nhat-xa": "Trùng Tang — Nhất xa",
  "nhi-xa": "Trùng Tang — Nhị xa",
  "tam-xa": "Trùng Tang — Tam xa",
  "that-xa": "Trùng Tang — Thất xa (nặng nhất)",
  "khong-du-du-lieu": "Chưa đủ dữ liệu (thiếu giờ mất) — chỉ luận được 3/4 cung",
};

/**
 * Kiểm tra bổ sung theo Chương 6 §7: ngoài chưởng pháp, mất vào NĂM/THÁNG/NGÀY/GIỜ mang CHI
 * thực (Can Chi lịch thật, không phải cung đếm tay) Dần/Thân/Tỵ/Hợi cũng tính là trùng tang.
 */
export interface KiemTraChiThucTe {
  chiNam: Chi;
  namPham: boolean;
  chiThang: Chi;
  thangPham: boolean;
  chiNgay: Chi;
  ngayPham: boolean;
  chiGio: Chi | null;
  gioPham: boolean | null;
}

export function kiemTraChiThucTeTrungTang(chiNam: Chi, chiThang: Chi, chiNgay: Chi, chiGio: Chi | null): KiemTraChiThucTe {
  const isPham = (c: Chi) => (["Dần", "Thân", "Tỵ", "Hợi"] as readonly Chi[]).includes(c);
  return {
    chiNam,
    namPham: isPham(chiNam),
    chiThang,
    thangPham: isPham(chiThang),
    chiNgay,
    ngayPham: isPham(chiNgay),
    chiGio,
    gioPham: chiGio ? isPham(chiGio) : null,
  };
}
