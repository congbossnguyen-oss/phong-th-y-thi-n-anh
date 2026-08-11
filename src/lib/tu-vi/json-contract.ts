// Phase 21 (docs/TUVI_PHASE21_JSON_CONTRACT.md) — ADAPTER thuần túy: map TuViChart (shape hiện tại,
// KHÔNG đổi) sang shape JSON chuẩn theo TuVi_Engine_V2.md §34/§35/§36.
//
// NGUYÊN TẮC: file này KHÔNG tính toán bất kỳ rule Tử Vi nào — chỉ đọc field có sẵn trong TuViChart
// (đã tính xong bởi tinhTuVi()) và reshape/rename/enum-transform thuần túy. Không import rules.ts, không
// gọi lại bat-tu.ts, không có công thức thứ hai cho bất kỳ giá trị nào.
//
// tinhTuVi()/TuViChart KHÔNG bị đổi — renderer (lap-la-so-tu-vi.astro) tiếp tục dùng TuViChart y hệt
// trước Phase 21, không có rủi ro phá UI. toJsonContract() là 1 lớp CHUYỂN ĐỔI TÙY CHỌN, gọi thêm nếu cần
// JSON đúng schema spec, không bắt buộc dùng ở renderer.

import type { CungKetQua, TuViChart } from "./engine";
import type { TrangThaiSao } from "./rules";

type TuHoaLabel = "Lộc" | "Quyền" | "Khoa" | "Kỵ";

// --- Enum mapping tables (thuần transform chuỗi, không suy luận) ---

const GENDER_MAP: Record<TuViChart["input"]["gender"], "NAM" | "NU"> = { "Nam": "NAM", "Nữ": "NU" };

const AM_DUONG_MAP: Record<TuViChart["amDuongNam"], "DUONG_NAM" | "AM_NAM" | "DUONG_NU" | "AM_NU"> = {
  "Dương Nam": "DUONG_NAM",
  "Âm Nam": "AM_NAM",
  "Dương Nữ": "DUONG_NU",
  "Âm Nữ": "AM_NU",
};

// "Chưa xác định" không còn xuất hiện trong MAIN_STAR_STATUS từ Phase 16 (168/168 đã khóa giá trị thật),
// nhưng type TrangThaiSao vẫn giữ giá trị này — nhánh dưới đây là phòng thủ, SCHEMA_UNDEFINED (spec §35
// enum status không có giá trị tương ứng cho "chưa xác định").
const STATUS_MAP: Record<TrangThaiSao, "MIEU" | "VUONG" | "DAC" | "BINH" | "HAM" | undefined> = {
  "Miếu": "MIEU",
  "Vượng": "VUONG",
  "Đắc": "DAC",
  "Bình": "BINH",
  "Hãm": "HAM",
  "Chưa xác định": undefined,
};

const TU_HOA_MAP: Record<TuHoaLabel, "LOC" | "QUYEN" | "KHOA" | "KY"> = {
  "Lộc": "LOC", "Quyền": "QUYEN", "Khoa": "KHOA", "Kỵ": "KY",
};

// Spec §34 liệt kê palaceName dạng UPPERCASE_UNDERSCORE (giữ dấu tiếng Việt) — map trực tiếp từ
// CUNG_NAMES_TU_MENH_NGHICH (rules.ts), KHÔNG suy luận bằng công thức chuỗi (tránh sai lệch nếu tên cung
// có khoảng trắng bất thường).
const PALACE_NAME_MAP: Record<string, string> = {
  "Mệnh": "MỆNH",
  "Phụ Mẫu": "PHỤ_MẪU",
  "Phúc Đức": "PHÚC_ĐỨC",
  "Điền Trạch": "ĐIỀN_TRẠCH",
  "Quan Lộc": "QUAN_LỘC",
  "Nô Bộc": "NÔ_BỘC",
  "Thiên Di": "THIÊN_DI",
  "Tật Ách": "TẬT_ÁCH",
  "Tài Bạch": "TÀI_BẠCH",
  "Tử Tức": "TỬ_TỨC",
  "Phu Thê": "PHU_THÊ",
  "Huynh Đệ": "HUYNH_ĐỆ",
};

// --- §35: StarInstance ---
export interface TuViJsonStar {
  id: string; // NEEDS_REVIEW — spec không định nghĩa format id, dùng name (duy nhất trong phạm vi 1 cung)
  name: string;
  category: "CHINH_TINH" | "PHU_TINH"; // MISSING_FIELD một phần: spec còn có CAT_TINH/SAT_TINH/LUU_TINH/
  // VONG (§33) nhưng engine hiện KHÔNG phân loại phụ tinh theo Cát/Sát/Tạp/Vòng — không tự thêm rule
  // phân loại mới trong phase này, chỉ dùng 2 giá trị đã có cơ sở dữ liệu thật (chính tinh/phụ tinh).
  status?: "MIEU" | "VUONG" | "DAC" | "BINH" | "HAM";
  transformation?: "LOC" | "QUYEN" | "KHOA" | "KY";
  isAnnual: boolean; // luôn false — Lưu Niên chưa implement (Phase 19 NOT_IMPLEMENTED), không có sao lưu nào tồn tại để true
  isNatal: boolean; // luôn true, cùng lý do trên
  sourceRule: string; // NEEDS_REVIEW — chỉ ở mức BUCKET (chính tinh/phụ tinh), KHÔNG phải id rule per-star
  // chính xác (engine hiện không lưu vết rule ở mức từng sao) — xem docs/TUVI_PHASE21_JSON_CONTRACT.md.
}

// --- §34: Palace ---
export interface TuViJsonPalace {
  index: number;
  branch: string;
  stem: string;
  palaceName: string;
  isMenh: boolean;
  isThan: boolean;
  stars: TuViJsonStar[];
  daiVan?: { startAge: number; endAge: number; label: string };
  tieuHan?: number; // MISSING_FIELD — Tiểu Hạn chưa implement (Phase 19), luôn undefined
  luuNien?: number; // MISSING_FIELD — Lưu Niên chưa implement (Phase 19), luôn undefined
  trangSinh?: string;
  markers: { tuan: boolean; triet: boolean };
}

// --- §36: JSON output chuẩn ---
export interface TuViJsonContract {
  meta: { engineVersion: string; profile: string; timezone: string };
  input: { gender: "NAM" | "NU"; solarDate: string; time: string; viewingYear: number | null };
  calendar: {
    lunarDate: string;
    yearCanChi: string;
    monthCanChi: string;
    dayCanChi: string;
    hourCanChi: string;
    // EXTRA_FIELD so với §36 (chỉ yêu cầu string) — giữ thêm object pillar (can/chi/canIndex/chiIndex,
    // từ Phase 20) vì hữu ích cho truy vấn theo index, không xóa dữ liệu thật để ép khớp schema tối giản.
    yearPillar: TuViChart["yearPillar"];
    monthPillar: TuViChart["monthPillar"];
    dayPillar: TuViChart["dayPillar"];
    hourPillar: TuViChart["hourPillar"];
  };
  thienBan: {
    amDuong: "DUONG_NAM" | "AM_NAM" | "DUONG_NU" | "AM_NU";
    banMenh: string;
    banMenhElement: string; // EXTRA_FIELD so với §36 (spec không liệt kê), giữ vì là dữ liệu thật đã có
    cuc: string;
    cucNumber: number;
    menhQuai: string;
    chuMenh: string;
    chuThan: string;
    menhIndex: number;
    thanIndex: number;
  };
  palaces: TuViJsonPalace[];
  // EXTRA_FIELD so với §36 minimal example (spec chủ trương Tứ Hóa là property của sao — §17 cuối trang
  // — không phải 1 field cấp cao riêng) — giữ lại vì là tóm tắt tiện tra cứu nhanh 4 sao được Hóa mà
  // không cần quét toàn bộ palaces[].stars[]. KHÔNG thay thế cơ chế transformation trên StarInstance.
  tuHoa: TuViChart["tuHoa"];
}

function toStarInstance(name: string, category: "CHINH_TINH" | "PHU_TINH", status: TrangThaiSao | undefined, tuHoa: TuHoaLabel | undefined): TuViJsonStar {
  return {
    id: name,
    name,
    category,
    status: status ? STATUS_MAP[status] : undefined,
    transformation: tuHoa ? TU_HOA_MAP[tuHoa] : undefined,
    isAnnual: false,
    isNatal: true,
    sourceRule: category === "CHINH_TINH" ? "MAIN_STAR_STATUS (rules.ts)" : "PHU_TINH (engine.ts/rules.ts)",
  };
}

function toPalace(c: CungKetQua): TuViJsonPalace {
  const stars: TuViJsonStar[] = [
    ...c.chinhTinh.map((s) => toStarInstance(s.name, "CHINH_TINH", s.trangThai, s.tuHoa)),
    ...c.phuTinh.map((s) => toStarInstance(s.name, "PHU_TINH", undefined, s.tuHoa)),
  ];
  return {
    index: c.chiIndex,
    branch: c.chiName,
    stem: c.canName,
    palaceName: PALACE_NAME_MAP[c.cungName] ?? c.cungName,
    isMenh: c.isMenh,
    isThan: c.isThan,
    stars,
    daiVan: { startAge: c.daiVanTuoi[0], endAge: c.daiVanTuoi[1], label: `${c.canName} ${c.chiName}` },
    tieuHan: undefined,
    luuNien: undefined,
    trangSinh: c.trangSinh,
    markers: { tuan: c.tuan, triet: c.triet },
  };
}

// Adapter chính — pure function, KHÔNG tính toán lại bất kỳ rule nào, chỉ đọc TuViChart đã tính sẵn.
export function toJsonContract(chart: TuViChart): TuViJsonContract {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    meta: { engineVersion: "2.0.0", profile: "NAM_PHAI_NGUYEN_CAT", timezone: "Asia/Ho_Chi_Minh" },
    input: {
      gender: GENDER_MAP[chart.input.gender],
      solarDate: `${chart.input.year}-${pad(chart.input.month)}-${pad(chart.input.day)}`,
      // MISSING_FIELD (một phần): TuViInput hiện không có field phút — luôn ":00". Không tự thêm field
      // phút vào TuViInput trong phase này (đó là thay đổi input schema/độ chính xác tính toán, ngoài
      // phạm vi "chỉ xử lý JSON contract").
      time: `${pad(chart.input.hour)}:00`,
      viewingYear: chart.input.viewingYear ?? null,
    },
    calendar: {
      lunarDate: `${chart.lunarDay}/${chart.lunarMonth}${chart.lunarIsLeap ? " (nhuận)" : ""}/${chart.lunarYear}`,
      yearCanChi: `${chart.yearPillar.can} ${chart.yearPillar.chi}`,
      monthCanChi: `${chart.monthPillar.can} ${chart.monthPillar.chi}`,
      dayCanChi: `${chart.dayPillar.can} ${chart.dayPillar.chi}`,
      hourCanChi: `${chart.hourPillar.can} ${chart.hourPillar.chi}`,
      yearPillar: chart.yearPillar,
      monthPillar: chart.monthPillar,
      dayPillar: chart.dayPillar,
      hourPillar: chart.hourPillar,
    },
    thienBan: {
      amDuong: AM_DUONG_MAP[chart.amDuongNam],
      banMenh: chart.banMenhNapAm,
      banMenhElement: chart.banMenhElement,
      cuc: chart.cucName,
      cucNumber: chart.cucSo,
      menhQuai: chart.menhQuai,
      chuMenh: chart.chuMenh,
      chuThan: chart.chuThan,
      menhIndex: chart.menhChiIndex,
      thanIndex: chart.thanChiIndex,
    },
    palaces: chart.cungs.map(toPalace),
    tuHoa: chart.tuHoa,
  };
}
