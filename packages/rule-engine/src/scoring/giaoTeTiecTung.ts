/**
 * NGÀY GIAO TẾ – TIỆC TÙNG — chấm điểm mức độ phù hợp của 1 ngày cho mục đích ăn uống, tiệc
 * tùng, gặp gỡ, giao lưu, tiếp khách, mở rộng quan hệ (mã nội bộ `GIAO_TIEP_TIEC_TUNG`), dựa
 * hoàn toàn trên các dữ liệu ngày ĐÃ CÓ trong hệ thống (Trực, Hoàng Đạo/Hắc Đạo, Nhị Thập Bát
 * Tú, Thần Sát, Ngày kỵ, Ngày Bách Kỵ, Thiên Đức Hợp/Thiên Xá) — không yêu cầu người dùng tự
 * chọn sao hay tự chấm điểm, không hard-code kết quả cho ngày cụ thể nào.
 *
 * Toàn bộ trọng số nằm trong `GIAO_TIEP_TIEC_TUNG_SCORING_RULES` — tách riêng khỏi hàm tính
 * điểm để có thể điều chỉnh sau này mà không phải sửa thuật toán hay giao diện.
 *
 * ⚠️ Trọng số cho nhóm Trực (`trucTot`/`trucXau`) và mức cộng điểm ưu tiên "hỷ khánh" (Thiên
 * Hỷ/Tam Hợp/Thiên Thành) là QUY ƯỚC PHỔ BIẾN do chủ dự án + hệ thống tự đặt ra cho đúng mục
 * đích "giao tế/tiệc tùng" này — KHÔNG trích dẫn từ 1 trang sách cụ thể nào (khác với các
 * module `trach-nhat/*` vốn trích nguyên văn 1 nguồn xác định). Nếu sau này có nguồn chính xác
 * hơn cho đúng mục đích này, chỉ cần sửa các con số trong `GIAO_TIEP_TIEC_TUNG_SCORING_RULES`.
 */
import type { CatHung } from "../trach-nhat/catHung.js";

export const GIAO_TIEP_TIEC_TUNG_SCORING_RULES = {
  /** Điểm khởi điểm trung tính trên thang 0-10, các yếu tố cộng/trừ dựa trên mức này. */
  diemNenTang: 5,

  hoangDaoHacDao: {
    "hoàng đạo": 2,
    "hắc đạo": -2,
    "không xác định": 0,
  } as Record<"hoàng đạo" | "hắc đạo" | "không xác định", number>,

  nhiThapBatTu: {
    cat: 1,
    hung: -1,
  },

  /**
   * Nhóm Trực theo quy ước phổ biến cho việc vui/hội họp — Mãn (viên mãn), Thành (thành tựu,
   * hỷ sự), Khai (khai mở) thường được xem thuận lợi cho tụ họp/ăn uống; Phá, Nguy, Bế thường
   * bị kiêng cho việc vui. 6 Trực còn lại (Kiến, Trừ, Bình, Định, Chấp, Thu) trung tính cho
   * mục đích này.
   */
  trucTot: ["Mãn", "Thành", "Khai"] as readonly string[],
  trucXau: ["Phá", "Nguy", "Bế"] as readonly string[],
  diemTrucTot: 1,
  diemTrucXau: -1,

  thanSat: {
    diemMoiCat: 0.5,
    diemMoiHung: -0.5,
    /** Ưu tiên đặc biệt cho các sao mang tính hỷ khánh/hòa hợp/giao tế. */
    tenUuTien: {
      "Thiên Hỷ": 1.5,
      "Tam Hợp": 0.5,
      "Thiên Thành": 0.5,
    } as Record<string, number>,
  },

  /** Các ngày đại kỵ đã có sẵn trong hệ thống — mỗi loại phạm phải trừ điểm mạnh. */
  ngayDaiKy: {
    nguyetKy: -1.5,
    tamNuong: -1.5,
    duongCongKyNhat: -2.5,
    satChu: -1.5,
    /**
     * Nếu phạm BẤT KỲ đại kỵ nào ở trên, điểm cuối cùng bị ép trần ở mức này (không được vượt
     * quá) dù các yếu tố khác cộng điểm bao nhiêu — tránh 1 ngày đại kỵ vẫn lọt vào hạng cao
     * nhờ nhiều sao phụ khác cộng dồn.
     */
    diemTranNeuPham: 3,
  },

  /** "Dậu không đãi khách" (Ngày Bách Kỵ) — kỵ trực tiếp việc tiếp khách/giao tế. */
  bachKyDaiKhach: {
    tuKhoaViec: "đãi khách",
    diem: -1.5,
  },

  /** Thiên Đức Hợp / Thiên Xá — ngày tốt chung, cộng nhẹ (không đặc thù giao tế). */
  ngayCatKhac: {
    diemMoiNgayCat: 0.5,
  },
} as const;

export interface GiaoTeTiecTungInput {
  trucName: string;
  hoangDaoHacDao: "hoàng đạo" | "hắc đạo" | "không xác định";
  nhiThapBatTuCatHung: CatHung;
  thanSat: readonly { name: string; catHung: CatHung }[];
  nguyetKy: boolean;
  tamNuong: boolean;
  duongCongKyNhat: boolean;
  satChu: boolean;
  bachKyNgay: readonly { nhan: string; viec: string }[];
  thienDucHop: boolean;
  thienXa: boolean;
}

export type GiaoTeTiecTungHang = "rat-tot" | "tot" | "co-the-dung" | "khong-nen";

export interface GiaoTeTiecTungYeuTo {
  ten: string;
  diem: number;
}

export interface GiaoTeTiecTungResult {
  /** Điểm 0-10, đã làm tròn 1 chữ số thập phân. */
  diem: number;
  hang: GiaoTeTiecTungHang;
  /** Nhãn hiển thị kèm icon, vd "⭐ Rất tốt". */
  nhan: string;
  /** Gợi ý ngắn cho hạng này (rỗng nếu hạng thấp không có gợi ý riêng). */
  goiY: string;
  /** Chi tiết từng yếu tố đã cộng/trừ điểm — dùng khi người dùng bấm vào ngày để xem giải thích. */
  yeuTo: readonly GiaoTeTiecTungYeuTo[];
  phamDaiKy: boolean;
}

const NHAN_THEO_HANG: Record<GiaoTeTiecTungHang, string> = {
  "rat-tot": "⭐ Rất tốt",
  "tot": "🟢 Tốt",
  "co-the-dung": "🟡 Có thể dùng",
  "khong-nen": "🔴 Không nên chọn",
};

const GOI_Y_THEO_HANG: Record<GiaoTeTiecTungHang, string> = {
  "rat-tot": "Tiệc tùng, giao tế, tiếp khách",
  "tot": "Gặp gỡ, ăn uống",
  "co-the-dung": "",
  "khong-nen": "",
};

function xepHang(diem: number): GiaoTeTiecTungHang {
  if (diem >= 8) return "rat-tot";
  if (diem >= 6) return "tot";
  if (diem >= 4) return "co-the-dung";
  return "khong-nen";
}

export function tinhDiemGiaoTeTiecTung(input: GiaoTeTiecTungInput): GiaoTeTiecTungResult {
  const R = GIAO_TIEP_TIEC_TUNG_SCORING_RULES;
  const yeuTo: GiaoTeTiecTungYeuTo[] = [];
  let diem: number = R.diemNenTang;

  const hoangDaoDiem = R.hoangDaoHacDao[input.hoangDaoHacDao];
  if (hoangDaoDiem !== 0) {
    diem += hoangDaoDiem;
    yeuTo.push({ ten: `Ngày ${input.hoangDaoHacDao}`, diem: hoangDaoDiem });
  }

  const tuDiem = input.nhiThapBatTuCatHung === "cát" ? R.nhiThapBatTu.cat : R.nhiThapBatTu.hung;
  diem += tuDiem;
  yeuTo.push({ ten: `Nhị Thập Bát Tú (${input.nhiThapBatTuCatHung})`, diem: tuDiem });

  if (R.trucTot.includes(input.trucName)) {
    diem += R.diemTrucTot;
    yeuTo.push({ ten: `Trực ${input.trucName} (thuận lợi hội họp)`, diem: R.diemTrucTot });
  } else if (R.trucXau.includes(input.trucName)) {
    diem += R.diemTrucXau;
    yeuTo.push({ ten: `Trực ${input.trucName} (không thuận lợi hội họp)`, diem: R.diemTrucXau });
  }

  for (const t of input.thanSat) {
    const uuTien = R.thanSat.tenUuTien[t.name];
    if (uuTien !== undefined) {
      diem += uuTien;
      yeuTo.push({ ten: `${t.name} (ưu tiên hỷ khánh)`, diem: uuTien });
    } else {
      const d = t.catHung === "cát" ? R.thanSat.diemMoiCat : R.thanSat.diemMoiHung;
      diem += d;
      yeuTo.push({ ten: `${t.name} (${t.catHung})`, diem: d });
    }
  }

  let phamDaiKy = false;
  if (input.nguyetKy) {
    diem += R.ngayDaiKy.nguyetKy;
    yeuTo.push({ ten: "Nguyệt Kỵ (Ngũ Quỷ)", diem: R.ngayDaiKy.nguyetKy });
    phamDaiKy = true;
  }
  if (input.tamNuong) {
    diem += R.ngayDaiKy.tamNuong;
    yeuTo.push({ ten: "Tam Nương Sát", diem: R.ngayDaiKy.tamNuong });
    phamDaiKy = true;
  }
  if (input.duongCongKyNhat) {
    diem += R.ngayDaiKy.duongCongKyNhat;
    yeuTo.push({ ten: "Dương Công Kỵ Nhật", diem: R.ngayDaiKy.duongCongKyNhat });
    phamDaiKy = true;
  }
  if (input.satChu) {
    diem += R.ngayDaiKy.satChu;
    yeuTo.push({ ten: "Sát Chủ", diem: R.ngayDaiKy.satChu });
    phamDaiKy = true;
  }

  const daiKhach = input.bachKyNgay.find((b) => b.viec.includes(R.bachKyDaiKhach.tuKhoaViec));
  if (daiKhach) {
    diem += R.bachKyDaiKhach.diem;
    yeuTo.push({ ten: `Ngày Bách Kỵ: ${daiKhach.nhan} ${daiKhach.viec}`, diem: R.bachKyDaiKhach.diem });
  }

  if (input.thienDucHop) {
    diem += R.ngayCatKhac.diemMoiNgayCat;
    yeuTo.push({ ten: "Thiên Đức Hợp", diem: R.ngayCatKhac.diemMoiNgayCat });
  }
  if (input.thienXa) {
    diem += R.ngayCatKhac.diemMoiNgayCat;
    yeuTo.push({ ten: "Thiên Xá", diem: R.ngayCatKhac.diemMoiNgayCat });
  }

  if (phamDaiKy) {
    diem = Math.min(diem, R.ngayDaiKy.diemTranNeuPham);
  }

  diem = Math.max(0, Math.min(10, diem));
  diem = Math.round(diem * 10) / 10;

  const hang = xepHang(diem);
  return {
    diem,
    hang,
    nhan: NHAN_THEO_HANG[hang],
    goiY: GOI_Y_THEO_HANG[hang],
    yeuTo,
    phamDaiKy,
  };
}
