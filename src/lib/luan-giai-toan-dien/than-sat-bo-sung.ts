// 12 sao Thần Sát trong content/bat-tu/data/than-sat.json CHƯA có trong bat-tu.ts (đối chiếu đầy đủ
// 49 sao SPEC với 36 sao bat-tu.ts đã tính — 1 sao trùng tên khác (quanPhuNguQuy = Quan Phù đã có),
// 3 sao bat-tu.ts CHỦ ĐỘNG bỏ (Học Đường/Từ Quán, Phúc Tinh Quý Nhân, Kim Thần — nguồn OCR gốc rách,
// xem header bat-tu.ts), 1 sao (khongVong) đã tính riêng ở chart.nienKhong/nhatKhong. Còn lại đúng
// 12 sao bổ sung ở file này, cộng thêm cungLoc CHỦ ĐỘNG bỏ vì thuật toán "kẹp Lộc + phá cách" phức
// tạp, dễ cài sai hơn là code hóa được — theo đúng nguyên tắc "thà bỏ sót còn hơn bắt nhầm" đã áp
// dụng nhất quán cho Cách Cục và 3 sao kia.
import type { BatTuChart } from "../bat-tu";
import { docData } from "./content-loader";

interface BangEntry { loaiTra: string; bang?: Record<string, string | string[]>; danhSachNgay?: string[] }
interface ThanSatData {
  phanA_catThan: Record<string, BangEntry>;
  phanB_hungThan: Record<string, BangEntry>;
}

const TEN_HIEN_THI: Record<string, string> = {
  thienDucHop: "Thiên Đức Hợp", nguyetDucHop: "Nguyệt Đức Hợp", kimQuy: "Kim Quỹ", lucTu: "Lục Tú",
  thapLinh: "Thập Linh", tienThan: "Tiên Thần", thienTru: "Thiên Trù", giapSat: "Giáp Sát",
  coLoanSat: "Cô Loan Sát", tuPhe: "Tứ Phế", phiNhan: "Phi Nhẫn", luuHa: "Lưu Hà",
};

type PillarKey = "year" | "month" | "day" | "hour";
const TRU_LIST: PillarKey[] = ["year", "month", "day", "hour"];

function timNhomTamHop(bang: Record<string, string | string[]>, chi: string): string | string[] | undefined {
  for (const [nhom, gia] of Object.entries(bang)) {
    if (nhom.split(",").includes(chi)) return gia;
  }
  return undefined;
}

/** Quét 12 sao bổ sung, trả về CÙNG khuôn dạng chart.thanSat (Record<trụ, tên sao[]>) để dễ gộp. */
export function timThanSatBoSung(chart: BatTuChart): Record<PillarKey, string[]> {
  const data = docData<ThanSatData>("than-sat.json");
  const tra = (key: string): BangEntry => data.phanA_catThan[key] ?? data.phanB_hungThan[key];

  const ket: Record<PillarKey, string[]> = { year: [], month: [], day: [], hour: [] };
  const them = (tru: PillarKey, key: string) => ket[tru].push(TEN_HIEN_THI[key]);

  const chiTru: Record<PillarKey, string> = { year: chart.year.chi, month: chart.month.chi, day: chart.day.chi, hour: chart.hour.chi };
  const canTru: Record<PillarKey, string> = { year: chart.year.can, month: chart.month.can, day: chart.day.can, hour: chart.hour.can };
  const canNgayChiNgay = `${chart.day.can} ${chart.day.chi}`;

  // 1. Thiên Đức Hợp — theo Chi Tháng (chỉ 8/12 tháng có công thức), tìm Can khớp ở 4 trụ.
  {
    const { bang } = tra("thienDucHop");
    const canCanTim = bang?.[chart.month.chi] as string | undefined;
    if (canCanTim) for (const tru of TRU_LIST) if (canTru[tru] === canCanTim) them(tru, "thienDucHop");
  }

  // 2. Nguyệt Đức Hợp — theo Chi Tháng, nhóm Tam Hợp → Can.
  {
    const { bang } = tra("nguyetDucHop");
    const canCanTim = timNhomTamHop(bang!, chart.month.chi) as string | undefined;
    if (canCanTim) for (const tru of TRU_LIST) if (canTru[tru] === canCanTim) them(tru, "nguyetDucHop");
  }

  // 3. Kim Quỹ — theo Chi Năm, nhóm Tam Hợp → Chi.
  {
    const { bang } = tra("kimQuy");
    const chiCanTim = timNhomTamHop(bang!, chart.year.chi) as string | undefined;
    if (chiCanTim) for (const tru of TRU_LIST) if (chiTru[tru] === chiCanTim) them(tru, "kimQuy");
  }

  // 4. Lục Tú — Trụ Ngày Can-Chi khớp 1 trong 6 tổ hợp cho sẵn.
  {
    const { danhSachNgay } = tra("lucTu");
    if (danhSachNgay?.includes(canNgayChiNgay)) them("day", "lucTu");
  }

  // 5. Thập Linh — CHỈ xét Nhật Trụ (đề bài nói rõ "không tính nếu trùng ở trụ khác" — tức chỉ soi
  // đúng Can-Chi trụ Ngày, không lan sang các trụ khác dù trùng).
  {
    const { danhSachNgay } = tra("thapLinh");
    if (danhSachNgay?.includes(canNgayChiNgay)) them("day", "thapLinh");
  }

  // 6. Tiên Thần — Trụ Ngày là 1 trong 4 ngày.
  {
    const { danhSachNgay } = tra("tienThan");
    if (danhSachNgay?.includes(canNgayChiNgay)) them("day", "tienThan");
  }

  // 7. Thiên Trù — Can Ngày tra 1 Địa Chi, rà cả 4 trụ xem trụ nào trùng.
  {
    const { bang } = tra("thienTru");
    const chiCanTim = bang?.[chart.day.can] as string | undefined;
    if (chiCanTim) for (const tru of TRU_LIST) if (chiTru[tru] === chiCanTim) them(tru, "thienTru");
  }

  // 8. Giáp Sát — so Chi Ngày với Chi Giờ, Chi Giờ phải đúng "tiến 2 vị" so với Chi Ngày.
  {
    const { bang } = tra("giapSat");
    if (bang?.[chart.day.chi] === chart.hour.chi) them("hour", "giapSat");
  }

  // 9. Cô Loan Sát — CHỈ tra Trụ Ngày (Can-Chi) khớp 1 trong danh sách.
  {
    const { danhSachNgay } = tra("coLoanSat");
    if (danhSachNgay?.includes(canNgayChiNgay)) them("day", "coLoanSat");
  }

  // 10. Tứ Phế — theo mùa sinh (Chi Tháng, nhóm Tam Hợp mùa), tra Can-Chi — xét cả 4 trụ (đề bài
  // cho phép "có thể xét cả Năm/Tháng/Giờ", không giới hạn riêng trụ Ngày như đa số sao khác).
  {
    const { bang } = tra("tuPhe");
    const dsCanChi = timNhomTamHop(bang!, chart.month.chi) as string[] | undefined;
    if (dsCanChi) for (const tru of TRU_LIST) if (dsCanChi.includes(`${canTru[tru]} ${chiTru[tru]}`)) them(tru, "tuPhe");
  }

  // 11. Phi Nhẫn — theo Can Ngày, ra 1 Chi — rà cả 4 trụ.
  {
    const { bang } = tra("phiNhan");
    const chiCanTim = bang?.[chart.day.can] as string | undefined;
    if (chiCanTim) for (const tru of TRU_LIST) if (chiTru[tru] === chiCanTim) them(tru, "phiNhan");
  }

  // 12. Lưu Hà — theo Can Ngày, ra 1 Chi — rà cả 4 trụ.
  {
    const { bang } = tra("luuHa");
    const chiCanTim = bang?.[chart.day.can] as string | undefined;
    if (chiCanTim) for (const tru of TRU_LIST) if (chiTru[tru] === chiCanTim) them(tru, "luuHa");
  }

  return ket;
}
