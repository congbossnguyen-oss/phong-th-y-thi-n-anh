/**
 * Bước 1 — lập Tứ Trụ theo TIẾT KHÍ (dùng `getCanChi` của calendar-core, KHÔNG theo mùng 1 âm lịch).
 * Bước 2 — xác lập Hành Khuyết: thấu can = 1 điểm, tàng can = 0.5 điểm.
 *
 * Nguồn nghiệp vụ: skill `tinh-danh-hoc` mục 2 (`viet-danh-hoc-quy-trinh.md`).
 */
import { getCanChi } from "@thien-anh/calendar-core";
import type { DiemNguHanh, HanhKhuyet, NguHanh, TuTru } from "../types.js";

const TZ = "Asia/Ho_Chi_Minh";

/** Ngũ hành của 10 Thiên Can, index 0 = Giáp (đồng bộ calendar-core). */
const CAN_NGU_HANH: readonly NguHanh[] = [
  "Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy",
];

/** Tàng Can trong mỗi Địa Chi (giá trị là index Thiên Can), index chi 0 = Tý. */
const TANG_CAN: readonly number[][] = [
  [9], [5, 9, 7], [0, 2, 4], [1], [4, 1, 9], [2, 4, 6],
  [3, 5], [5, 3, 1], [6, 8, 4], [7], [4, 7, 3], [8, 0],
];

const TAT_CA_HANH: readonly NguHanh[] = ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"];

/** Vòng tương sinh: hành → hành nó SINH RA. */
const SINH_RA: Readonly<Record<NguHanh, NguHanh>> = {
  Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc",
};
/** Vòng tương khắc: hành → hành nó KHẮC. */
const KHAC: Readonly<Record<NguHanh, NguHanh>> = {
  Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc",
};

export interface LapTuTruKetQua {
  tuTru: TuTru;
  coGio: boolean;
}

/** Lập Tứ Trụ. Nếu không có giờ sinh thì bỏ trụ giờ (3 trụ) và đánh dấu để tầng trên cảnh báo. */
export function lapTuTru(input: {
  nam: number;
  thang: number;
  ngay: number;
  gio?: number;
  phut?: number;
}): LapTuTruKetQua {
  const coGio = typeof input.gio === "number";
  const r = getCanChi({
    year: input.nam,
    month: input.thang,
    day: input.ngay,
    hour: input.gio ?? 12,
    minute: input.phut ?? 0,
    timeZone: TZ,
  });

  const tru = (p: { can: string; chi: string; canIndex: number }) => ({
    can: p.can,
    chi: p.chi,
    nguHanhCan: CAN_NGU_HANH[p.canIndex]!,
  });

  return {
    coGio,
    tuTru: {
      nam: tru(r.year),
      thang: tru(r.month),
      ngay: tru(r.day),
      gio: coGio ? tru(r.hour) : null,
    },
  };
}

/** Đọc lại từ FullCanChiResult các chỉ số cần để cộng điểm tàng can. */
function chiIndexCua(chi: string): number {
  const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  return CHI.indexOf(chi);
}

/** Bước 2 — điểm ngũ hành: thấu can 1, tàng can 0.5. */
export function tinhDiemNguHanh(tuTru: TuTru): DiemNguHanh {
  const diem: DiemNguHanh = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
  const truList = [tuTru.nam, tuTru.thang, tuTru.ngay, tuTru.gio].filter((t) => t !== null);
  for (const t of truList) {
    diem[t!.nguHanhCan] += 1;
    const ci = chiIndexCua(t!.chi);
    if (ci >= 0) {
      for (const canIdx of TANG_CAN[ci]!) {
        diem[CAN_NGU_HANH[canIdx]!] += 0.5;
      }
    }
  }
  return diem;
}

/**
 * Bước 2 (tiếp) — chọn Hành Khuyết (Dụng Thần cần bổ).
 *
 * Theo skill: hành có điểm < 1 là "quá yếu, loại khỏi cân nhắc" — không lấy làm dụng thần vì
 * gần như không có nền để bồi. Trong các hành CÒN đủ mạnh (≥1), lấy hành YẾU nhất làm khuyết,
 * NHƯNG tránh chọn hành mà khi bổ sẽ tạo ra cặp hai hành mạnh đè bẹp một hành yếu theo tương khắc
 * ("Thừa Vũ"). Khi có ≥2 phương án gần bằng nhau, trả cả hai, không ép một đáp án.
 */
export function chonHanhKhuyet(diem: DiemNguHanh): HanhKhuyet[] {
  const viable = TAT_CA_HANH.filter((h) => diem[h] >= 1);

  // Trường hợp hiếm: không hành nào đạt 1 điểm (Tứ Trụ quá tản). Lấy hành yếu nhất tuyệt đối làm
  // khuyết và để tầng trên cảnh báo dữ liệu mỏng.
  const nen = viable.length > 0 ? viable : [...TAT_CA_HANH];

  const minDiem = Math.min(...nen.map((h) => diem[h]));
  // Ứng viên khuyết: các hành YẾU NHẤT (bằng đúng min) trong nhóm đủ mạnh. Bằng nhau thì trả cả
  // hai (SPEC: không ép một đáp án khi ≥2 khả năng gần bằng); còn lệch rõ thì chỉ một.
  const ungVien = nen.filter((h) => Math.abs(diem[h] - minDiem) < 0.01);

  // Loại hành mà khi bổ sẽ khiến một hành mạnh sinh cho nó thành quá vượng rồi khắc ngược một hành
  // khác — ưu tiên hành giữ được thế cân bằng.
  const bienDoManh = (h: NguHanh) => diem[h] >= 2;
  const anToan = ungVien.filter((h) => {
    // hành X đang mạnh mà X sinh ra h → bổ h khiến h vượng → h khắc (hành bị h khắc). Nếu hành bị
    // khắc đó cũng đang là trụ cột (mạnh) thì đây là lựa chọn gây mất cân bằng.
    const nguon = TAT_CA_HANH.find((x) => SINH_RA[x] === h && bienDoManh(x));
    if (!nguon) return true;
    const biKhac = KHAC[h];
    return !bienDoManh(biKhac);
  });

  const chon = anToan.length > 0 ? anToan : ungVien;

  return chon.map((h) => ({
    hanh: h,
    giaiThich:
      `Hành ${h} đang ở mức ${diem[h]} điểm trong Tứ Trụ — thuộc nhóm cần bồi để giữ thế cân bằng. ` +
      `Đặt tên bổ hành ${h} (hoặc hành sinh ra ${h}) sẽ lấp đầy chỗ khuyết mà không làm hành khác quá vượng.`,
  }));
}

/** Tỷ lệ % từng hành để vẽ đồ hình tròn. Tổng điểm 0 thì chia đều (không xảy ra thực tế). */
export function tyLeNguHanh(diem: DiemNguHanh): Record<NguHanh, number> {
  const tong = TAT_CA_HANH.reduce((s, h) => s + diem[h], 0);
  const r = {} as Record<NguHanh, number>;
  for (const h of TAT_CA_HANH) {
    r[h] = tong === 0 ? 20 : Math.round((diem[h] / tong) * 1000) / 10;
  }
  return r;
}
