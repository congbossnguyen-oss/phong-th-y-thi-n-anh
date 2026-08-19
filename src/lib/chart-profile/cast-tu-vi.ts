/**
 * Lớp "sự thật thuần code" của Tử Vi — gọi lại `tinhTuVi()` SẴN CÓ (`src/lib/tu-vi/engine.ts`,
 * dùng cho công cụ Lập Lá Số Tử Vi miễn phí), KHÔNG viết lại an sao/12 cung. File này chỉ đọc kết
 * quả an sao và định dạng thành `TuViFacts` (chính tinh + đắc/hãm ở 4 cung nghề, VCD, Tuần/Triệt,
 * khung tuổi Đại Hạn) — không tính thêm giá trị huyền học nào.
 *
 * ⚠️ Đầu vào là DƯƠNG LỊCH (đối chiếu `src/pages/lap-la-so-tu-vi.astro`: nếu khách nhập âm lịch thì
 * đã đổi sang dương trước khi gọi `tinhTuVi`).
 */
import { tinhTuVi, type TuViChart, type CungKetQua } from "../tu-vi/engine";
import type { TuViFacts, SaoTrongCung, DacHam, ChinhTinhKey } from "./types-tu-vi";
import type { Gender } from "./types";

const TEN_SAO_TO_KEY: Record<string, ChinhTinhKey> = {
  "Tử Vi": "tu_vi", "Thiên Cơ": "thien_co", "Thái Dương": "thai_duong", "Vũ Khúc": "vu_khuc",
  "Thiên Đồng": "thien_dong", "Liêm Trinh": "liem_trinh", "Thiên Phủ": "thien_phu", "Thái Âm": "thai_am",
  "Tham Lang": "tham_lang", "Cự Môn": "cu_mon", "Thiên Tướng": "thien_tuong", "Thiên Lương": "thien_luong",
  "Thất Sát": "that_sat", "Phá Quân": "pha_quan",
};

const TRANG_THAI_TO_DAC_HAM: Record<string, DacHam> = {
  "Miếu": "mieu", "Vượng": "vuong", "Đắc": "dac", "Bình": "binh", "Hãm": "ham",
};

function chinhTinhCuaCung(cung: CungKetQua | undefined): SaoTrongCung[] {
  if (!cung) return [];
  const ra: SaoTrongCung[] = [];
  for (const s of cung.chinhTinh) {
    const key = TEN_SAO_TO_KEY[s.name];
    if (!key) continue; // chỉ lấy 14 chính tinh có trong bảng tu_vi_sao_nganh; bỏ qua sao khác
    ra.push({ ten: key, ten_hien_thi: s.name, dac_ham: TRANG_THAI_TO_DAC_HAM[s.trangThai] ?? "insufficient_data" });
  }
  return ra;
}

function timCung(chart: TuViChart, cungName: string): CungKetQua | undefined {
  return chart.cungs.find((c) => c.cungName === cungName);
}

export interface CastTuViInput {
  day: number;
  month: number;
  year: number;
  hour: number;
  gender: Gender;
}

export function castTuViFacts(input: CastTuViInput): { chart: TuViChart; facts: TuViFacts } {
  const chart = tinhTuVi({ day: input.day, month: input.month, year: input.year, hour: input.hour, gender: input.gender });

  const menh = timCung(chart, "Mệnh");
  const quanLoc = timCung(chart, "Quan Lộc");
  const taiBach = timCung(chart, "Tài Bạch");
  const thienDi = timCung(chart, "Thiên Di");

  const saoMenh = chinhTinhCuaCung(menh);
  const saoQuanLoc = chinhTinhCuaCung(quanLoc);

  const tuanTrietCung = chart.cungs.filter((c) => c.tuan || c.triet).map((c) => c.chiName);

  // 10 Đại Hạn: mỗi cung có 1 khoảng daiVanTuoi; sắp theo tuổi bắt đầu.
  const daiHan = [...chart.cungs]
    .map((c) => ({ tuTuoi: c.daiVanTuoi[0], denTuoi: c.daiVanTuoi[1], cungChi: c.chiName, cungName: c.cungName }))
    .sort((a, b) => a.tuTuoi - b.tuTuoi);

  const pad = (n: number) => String(n).padStart(2, "0");
  const duongLich = `${input.year}-${pad(input.month)}-${pad(input.day)}T${pad(input.hour)}:00`;

  const facts: TuViFacts = {
    gioiTinh: input.gender,
    duongLich,
    amDuongMenh: chart.amDuongNam,
    menhChi: chart.cungs.find((c) => c.isMenh)?.chiName ?? "",
    thanChi: chart.cungs.find((c) => c.isThan)?.chiName ?? "",
    cuc: chart.cucName,
    banMenhNapAm: chart.banMenhNapAm,
    sao_theo_cung: {
      menh: saoMenh,
      quan_loc: saoQuanLoc,
      tai_bach: chinhTinhCuaCung(taiBach),
      thien_di: chinhTinhCuaCung(thienDi),
    },
    menhVoChinhDieu: saoMenh.length === 0,
    quanLocVoChinhDieu: saoQuanLoc.length === 0,
    tuanTrietCung,
    daiHan,
    canhBaoKyThuat: [],
  };

  return { chart, facts };
}
