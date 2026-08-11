// Tử Vi Calculation Engine — profile NAM_PHAI_NGUYEN_CAT, theo kiến trúc TuVi_Engine_V2.md.
// Engine thuần tính toán (Calendar -> Basic Chart -> Main Star -> Auxiliary Star -> Cycle -> JSON),
// KHÔNG chứa logic hiển thị/luận giải (mục 42, 50 của spec). Xem rules.ts để biết nguồn/độ tin cậy
// (VERIFIED so với Golden Master #001 / DERIVED theo kiến thức phổ biến) của từng bảng tra cứu.

import { CAN, CHI, NAP_AM } from "../menh-nap-am";
import { khongVongIndicesOf, tinhBatTu, type PillarInfo } from "../bat-tu";
import { solarToLunar } from "../lunar-calendar";
import {
  CAN_DUONG, CUC_INFO, CUNG_NAMES_TU_MENH_NGHICH,
  DAN, DAO_HOA_START, HOA_TINH_START, LINH_TINH_START, LOC_TON_TABLE,
  MAIN_STAR_STATUS, NGU_HO_DON, TU_HOA_TABLE, TU_VI_RING, THIEN_MA_START, THIEN_PHU_RING,
  THAI_TUE_STAGES, TRANG_SINH_START, TRANG_SINH_STAGES, TRIET_TABLE,
  STAR_TA_PHU, STAR_HUU_BAT, STAR_VAN_XUONG, STAR_VAN_KHUC,
  diaKhongIndex, diaKiepIndex, getChuMenh, getChuThan, getThienKhoi, getThienViet, hongLoanIndex,
  huuBatIndex, mod10, mod12, taPhuIndex, tamHopGroup, thienDieuIndex, thienHinhIndex, thienHyIndex,
  thienYIndex, tinhMenhQuai, vanKhucIndex, vanXuongIndex,
} from "./rules";
import type { TrangThaiSao, TuHoaResult } from "./rules";

export interface TuViInput {
  day: number;
  month: number;
  year: number;
  hour: number; // 0-23, giờ dương lịch tại nơi sinh
  gender: "Nam" | "Nữ";
  viewingYear?: number;
}

export interface ChinhTinhO {
  name: string;
  trangThai: TrangThaiSao;
  tuHoa?: "Lộc" | "Quyền" | "Khoa" | "Kỵ";
}

export interface PhuTinhO {
  name: string;
  tuHoa?: "Lộc" | "Quyền" | "Khoa" | "Kỵ";
}

export interface CungKetQua {
  chiIndex: number;
  chiName: string;
  canIndex: number;
  canName: string;
  cungName: string;
  isMenh: boolean;
  isThan: boolean;
  chinhTinh: ChinhTinhO[];
  phuTinh: PhuTinhO[];
  trangSinh: string;
  thaiTue: string | null;
  daiVanTuoi: [number, number];
  tuan: boolean;
  triet: boolean;
}

// PHASE 20 (docs/TUVI_PHASE20_FOUR_PILLARS_INTEGRATION.md): 1 trụ Can Chi tối giản — chỉ lấy 4 field
// can/chi/canIndex/chiIndex từ `PillarInfo` (bat-tu.ts), KHÔNG mang theo tàng can/thập thần/trường sinh
// (các khái niệm riêng của Bát Tự, không thuộc phạm vi output Tử Vi).
export type CanChiPillar = Pick<PillarInfo, "can" | "chi" | "canIndex" | "chiIndex">;

export interface TuViChart {
  input: TuViInput;
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  lunarIsLeap: boolean;
  yearCanName: string;
  yearChiName: string;
  amDuongNam: "Dương Nam" | "Âm Nam" | "Dương Nữ" | "Âm Nữ";
  gioChiName: string;
  tuoiNamXem: number | null;
  cucName: string;
  cucSo: number;
  banMenhNapAm: string;
  banMenhElement: string;
  menhQuai: string;
  chuMenh: string;
  chuThan: string;
  tuHoa: TuHoaResult;
  cungs: CungKetQua[]; // 12 phần tử, thứ tự theo chiIndex 0(Tý)..11(Hợi)
  menhChiIndex: number;
  thanChiIndex: number;
  // PHASE 20: đủ 4 trụ Can Chi (spec §4.2), tái sử dụng NGUYÊN VẸN kết quả `tinhBatTu()` (bat-tu.ts) —
  // KHÔNG tự tính lại bằng công thức thứ hai. yearPillar/hourPillar (phần Chi) đã đối chiếu khớp 100%
  // với yearCanName/yearChiName/gioChiName hiện có của chính tinhTuVi() trên cả 6 Golden Master + các mốc
  // 1800/1900/2000/2001/2021/2026 — xem báo cáo Phase 20 mục "Day boundary".
  yearPillar: CanChiPillar;
  monthPillar: CanChiPillar; // Chi tháng theo TIẾT KHÍ (bat-tu.ts) — KHÁC lunarMonth (số tháng âm lịch,
  // vẫn dùng riêng cho an sao, KHÔNG đổi). Đây là 2 khái niệm khác nhau tồn tại song song, không phải lỗi.
  dayPillar: CanChiPillar; // Ngày liên tục qua Julian Day Number, đổi ngày lúc 23h (ZI_HOUR).
  hourPillar: CanChiPillar; // Can giờ suy từ Can ngày (Ngũ Thử Độn), Chi giờ khớp gioChiName hiện có.
}

const NAP_AM_NAMES = NAP_AM.map((n) => n.name);
const NAP_AM_ELEMENTS = NAP_AM.map((n) => n.element);

function canOfChiIndex(canAtDan: number, chiIndex: number): number {
  return mod10(canAtDan + mod12(chiIndex - DAN));
}

// Phase 2 (audit): export tường minh theo đúng tên spec §7 yêu cầu ("getPalaceStem(yearStem,
// palaceBranch)"), để có thể viết test riêng cho Can 12 cung thay vì chỉ kiểm gián tiếp qua Cục.
// PHASE 29 (docs/TUVI_PHASE29_CAN_CUNG_TRIET_THIEN_MA.md mục II): LOCKED — đối chiếu trực tiếp với 2 lá
// số thực tế Nam Phái ĐỘC LẬP (tuvinamphai.vn, GM-SOURCE-A và GM-SOURCE-B, đã đọc ảnh trực tiếp ở Phase
// 15) — khớp CHÍNH XÁC 24/24 (12 cung × 2 lá số), dùng công thức Ngũ Hổ Độn tại Dần rồi mở rộng liên tục
// thuận theo 12 Chi (`canOfChiIndex`). Không phụ thuộc giới tính/Mệnh/Thân — chỉ phụ thuộc Can năm sinh.
export function getPalaceStem(yearCanName: string, palaceChiIndex: number): string {
  const canAtDan = NGU_HO_DON[CAN.indexOf(yearCanName)];
  if (canAtDan === undefined) throw new Error("RULE_NOT_DEFINED: getPalaceStem — Can năm không hợp lệ: " + yearCanName);
  return CAN[canOfChiIndex(canAtDan, palaceChiIndex)];
}

function napAmOfCanChi(canIndex: number, chiIndex: number): { name: string; element: string } {
  for (let cycleIndex = 0; cycleIndex < 60; cycleIndex++) {
    if (cycleIndex % 10 === canIndex && cycleIndex % 12 === chiIndex) {
      const pairIndex = Math.floor(cycleIndex / 2);
      return { name: NAP_AM_NAMES[pairIndex], element: NAP_AM_ELEMENTS[pairIndex] };
    }
  }
  throw new Error("RULE_NOT_DEFINED: napAmOfCanChi — không tìm được Nạp Âm cho Can Chi này");
}

// Mục 5: An Mệnh / An Thân
function tinhCungMenh(thangAm: number, gioChiIndex: number): number {
  const monthPalace = mod12(DAN + (thangAm - 1));
  return mod12(monthPalace - gioChiIndex);
}
function tinhCungThan(thangAm: number, gioChiIndex: number): number {
  const monthPalace = mod12(DAN + (thangAm - 1));
  return mod12(monthPalace + gioChiIndex);
}

// Mục 12: An Tử Vi
function tinhViTriTuVi(ngayAm: number, cucSo: number): number {
  const thuong = Math.floor(ngayAm / cucSo);
  const du = ngayAm % cucSo;
  let offset: number;
  if (du === 0) {
    offset = thuong - 1;
  } else {
    const bu = cucSo - du;
    offset = bu % 2 === 0 ? thuong + bu : thuong - bu;
  }
  return mod12(DAN + offset);
}

function pillarOf(p: PillarInfo): CanChiPillar {
  return { can: p.can, chi: p.chi, canIndex: p.canIndex, chiIndex: p.chiIndex };
}

export function tinhTuVi(input: TuViInput): TuViChart {
  // --- STEP 1-2: Calendar + Can Chi ---
  const lunar = solarToLunar(input.day, input.month, input.year);
  const gioChiIndex = Math.floor((((input.hour + 1) % 24) + 24) % 24 / 2);

  // PHASE 20: đủ 4 trụ Can Chi — gọi thẳng tinhBatTu() (bat-tu.ts), KHÔNG viết lại thuật toán Can Chi
  // thứ hai. Input map 1:1 từ TuViInput (day/month/year/hour/gender), không có field nào của TuViInput
  // (viewingYear) ảnh hưởng tới BatTuInput.
  const batTu = tinhBatTu({ day: input.day, month: input.month, year: input.year, hour: input.hour, gender: input.gender });
  const yearPillar = pillarOf(batTu.year);
  const monthPillar = pillarOf(batTu.month);
  const dayPillar = pillarOf(batTu.day);
  const hourPillar = pillarOf(batTu.hour);

  const yearCycleIndex = ((lunar.year - 4) % 60 + 60) % 60;
  const yearCanIndex = yearCycleIndex % 10;
  const yearChiIndex = yearCycleIndex % 12;
  const yearCanName = CAN[yearCanIndex];
  const yearChiName = CHI[yearChiIndex];
  const isDuongCan = CAN_DUONG.has(yearCanName);
  const amDuongNam = `${isDuongCan ? "Dương" : "Âm"} ${input.gender === "Nam" ? "Nam" : "Nữ"}` as TuViChart["amDuongNam"];
  // Dương Nam/Âm Nữ = thuận, Âm Nam/Dương Nữ = nghịch (spec §28.1, Đại Vận) — chuyển lên đầu hàm để
  // PHASE 23 (docs/TUVI_PHASE23_KINH_DA_HOA_LINH_RULE_LOCK.md) tái sử dụng cho Kình Dương/Đà La, KHÔNG
  // tạo logic thuận/nghịch thứ hai. Tràng Sinh/Đại Vận (STEP 18/21) dùng lại đúng biến này, không khai
  // báo trùng.
  const isThuanChung = (isDuongCan && input.gender === "Nam") || (!isDuongCan && input.gender === "Nữ");

  // --- STEP 3: Mệnh / Thân ---
  const menhChiIndex = tinhCungMenh(lunar.month, gioChiIndex);
  const thanChiIndex = tinhCungThan(lunar.month, gioChiIndex);

  // --- STEP 5: Bản Mệnh / Cục / Mệnh Quái / Chủ Mệnh / Chủ Thân ---
  const canAtDan = NGU_HO_DON[yearCanIndex];
  const menhCanIndex = canOfChiIndex(canAtDan, menhChiIndex);
  const menhNapAm = napAmOfCanChi(menhCanIndex, menhChiIndex);
  const cuc = CUC_INFO[menhNapAm.element];
  if (!cuc) throw new Error("RULE_NOT_DEFINED: CUC_INFO — không xác định được Ngũ Hành Cục");

  const banMenhNapAm = napAmOfCanChi(yearCanIndex, yearChiIndex);
  const menhQuai = tinhMenhQuai(lunar.year, input.gender);
  const chuMenh = getChuMenh(yearChiIndex);
  const chuThan = getChuThan(yearChiIndex);

  const tuHoa = TU_HOA_TABLE[yearCanName];
  if (!tuHoa) throw new Error("RULE_NOT_DEFINED: TU_HOA_TABLE — thiếu Can năm sinh " + yearCanName);

  // --- STEP 6-7: Tử Vi / Thiên Phủ / 14 chính tinh ---
  const tuViChiIndex = tinhViTriTuVi(lunar.day, cuc.so);
  const thienPhuChiIndex = mod12(4 - tuViChiIndex);

  const chinhTinhTaiChi: ChinhTinhO[][] = Array.from({ length: 12 }, () => []);
  for (const sao of TU_VI_RING) {
    const chiIdx = mod12(tuViChiIndex + sao.offset);
    const statusRow = MAIN_STAR_STATUS[sao.name];
    chinhTinhTaiChi[chiIdx].push({ name: sao.name, trangThai: statusRow[chiIdx] });
  }
  for (const sao of THIEN_PHU_RING) {
    const chiIdx = mod12(thienPhuChiIndex + sao.offset);
    const statusRow = MAIN_STAR_STATUS[sao.name];
    chinhTinhTaiChi[chiIdx].push({ name: sao.name, trangThai: statusRow[chiIdx] });
  }

  // --- STEP 10-17: phụ tinh ---
  const phuTinhTaiChi: PhuTinhO[][] = Array.from({ length: 12 }, () => []);
  const addPhuTinh = (chiIdx: number, name: string) => phuTinhTaiChi[mod12(chiIdx)].push({ name });

  addPhuTinh(taPhuIndex(lunar.month), STAR_TA_PHU);
  addPhuTinh(huuBatIndex(lunar.month), STAR_HUU_BAT);
  addPhuTinh(vanXuongIndex(gioChiIndex), STAR_VAN_XUONG);
  addPhuTinh(vanKhucIndex(gioChiIndex), STAR_VAN_KHUC);

  addPhuTinh(getThienKhoi(yearCanName), "Thiên Khôi");
  addPhuTinh(getThienViet(yearCanName), "Thiên Việt");

  const locTonIdx = LOC_TON_TABLE[yearCanName];
  addPhuTinh(locTonIdx, "Lộc Tồn");
  // PHASE 23 (docs/TUVI_PHASE23_KINH_DA_HOA_LINH_RULE_LOCK.md mục I): khóa orientation theo nguồn tìm
  // được ở Phase 22 (hoc.kabala.vn, bài "Sai lầm về an sao lập số" — cùng tiêu đề nguồn đã dùng cho
  // Thiên Việt ở Phase 8, TuVi_Profile_NguyenCat_V1.md §7): "Kình dương – Đà la... phải theo chiều thuận
  // hay nghịch của Dương Nam Âm Nữ (thuận) và Âm Nam Dương Nữ (nghịch) mà thay đổi vị trí" — xác nhận
  // bằng ví dụ số liệu cụ thể (tuổi Giáp Ngọ: Dương Nam → Lộc Dần, Kình Mão(+1), Đà Sửu(-1); Dương Nữ →
  // Kình Sửu(-1), Đà Mão(+1), đảo ngược). Đây CHÍNH LÀ quy tắc thuận/nghịch đã có sẵn ở `isThuanChung`
  // (Dương Nam/Âm Nữ thuận, Âm Nam/Dương Nữ nghịch, spec §28.1) — tái sử dụng, KHÔNG tạo logic thứ hai.
  // Trước Phase 23: code luôn +1/-1 cố định, chỉ đúng cho đúng 1 nửa số trường hợp (Dương Nam/Âm Nữ) —
  // đã CONFLICTED với nguồn cho nửa còn lại (Âm Nam/Dương Nữ), nay khóa đúng theo nguồn cho cả 4 tổ hợp.
  const kinhDuongOffset = isThuanChung ? 1 : -1;
  addPhuTinh(locTonIdx + kinhDuongOffset, "Kình Dương");
  addPhuTinh(locTonIdx - kinhDuongOffset, "Đà La");

  addPhuTinh(diaKiepIndex(gioChiIndex), "Địa Kiếp");
  addPhuTinh(diaKhongIndex(gioChiIndex), "Địa Không");

  const group = tamHopGroup(yearChiIndex);
  addPhuTinh(THIEN_MA_START[group], "Thiên Mã");
  addPhuTinh(DAO_HOA_START[group], "Đào Hoa");
  // PHASE 23 (docs/TUVI_PHASE23_KINH_DA_HOA_LINH_RULE_LOCK.md mục III): KHÔNG đổi orientation cho Hỏa/
  // Linh Tinh dù Phase 22 tìm được 1 nguồn nói chiều cũng đảo theo Dương Nam/Âm Nữ giống Kình/Đà — khác
  // với Kình/Đà (nguồn trùng tiêu đề bài đã dùng cho Thiên Việt từ Phase 8), nguồn Hỏa/Linh chỉ ở mức
  // Level 3/4 (hoctuvi.blogspot.com/lyso.vn, không xác nhận cùng họ Học Viện Lý Số), và chính nguồn đó tự
  // thừa nhận có SCHOOL_CONFLICT giữa các phái cho nhóm Tỵ Dậu Sửu. GIỮ NGUYÊN START_POSITION (đã khớp
  // nguồn) và GIỮ NGUYÊN orientation cũ (luôn cộng gioChiIndex, không đảo theo giới tính) — CONFLICTED,
  // không đủ căn cứ Nam Phái để implement, không tự chọn bên.
  addPhuTinh(HOA_TINH_START[group] + gioChiIndex, "Hỏa Tinh");
  addPhuTinh(LINH_TINH_START[group] + gioChiIndex, "Linh Tinh");

  addPhuTinh(hongLoanIndex(yearChiIndex), "Hồng Loan");
  addPhuTinh(thienHyIndex(yearChiIndex), "Thiên Hỷ");
  addPhuTinh(thienHinhIndex(lunar.month), "Thiên Hình");
  // PHASE 25 (docs/TUVI_PHASE25_THIEN_DIEU_THIEN_Y.md): implement theo nguồn Level 1 hocvienlyso.org —
  // Thiên Diêu khởi Sửu đếm thuận theo tháng sinh; Thiên Y LUÔN đồng cung với Thiên Diêu (không đếm độc
  // lập, đúng theo nguồn, không suy diễn).
  addPhuTinh(thienDieuIndex(lunar.month), "Thiên Diêu");
  addPhuTinh(thienYIndex(lunar.month), "Thiên Y");

  // --- STEP 9: Tứ Hóa — gắn vào BẤT KỲ StarInstance nào (chính tinh lẫn phụ tinh) có mặt trong lá số
  // (FIX audit mục E1.1: trước đây chỉ duyệt chinhTinhTaiChi, khiến Hóa Khoa/Hóa Kỵ trỏ tới phụ tinh
  // như Văn Xương/Văn Khúc/Hữu Bật/Tả Phù bị rơi mất với 5/10 Can: Bính, Mậu, Kỷ, Tân, Nhâm). ---
  const tuHoaGan: [string, "Lộc" | "Quyền" | "Khoa" | "Kỵ"][] = [
    [tuHoa.loc, "Lộc"], [tuHoa.quyen, "Quyền"], [tuHoa.khoa, "Khoa"], [tuHoa.ky, "Kỵ"],
  ];
  for (const chi of chinhTinhTaiChi) {
    for (const sao of chi) {
      const found = tuHoaGan.find(([name]) => name === sao.name);
      if (found) sao.tuHoa = found[1];
    }
  }
  for (const chi of phuTinhTaiChi) {
    for (const sao of chi) {
      const found = tuHoaGan.find(([name]) => name === sao.name);
      if (found) sao.tuHoa = found[1];
    }
  }

  // --- STEP 18: Tràng Sinh (isThuanChung đã khai báo ở đầu hàm, dùng chung với Kình Dương/Đà La) ---
  const trangSinhStart = TRANG_SINH_START[menhNapAm.element];
  const trangSinhTaiChi: string[] = new Array(12);
  for (let step = 0; step < 12; step++) {
    const chiIdx = mod12(trangSinhStart + (isThuanChung ? step : -step));
    trangSinhTaiChi[chiIdx] = TRANG_SINH_STAGES[step];
  }

  // --- STEP 19: Thái Tuế (vòng luôn đi thuận từ Chi năm sinh) ---
  const thaiTueTaiChi: (string | null)[] = new Array(12).fill(null);
  for (let step = 0; step < 12; step++) {
    thaiTueTaiChi[mod12(yearChiIndex + step)] = THAI_TUE_STAGES[step];
  }

  // --- STEP 20: Tuần / Triệt ---
  const [tuan1, tuan2] = khongVongIndicesOf(yearCanIndex, yearChiIndex);
  const trietPair = TRIET_TABLE[yearCanName];

  // --- STEP 21: Đại Vận ---
  const daiVanTuoiTaiChi: [number, number][] = new Array(12);
  for (let step = 0; step < 12; step++) {
    const chiIdx = mod12(menhChiIndex + (isThuanChung ? step : -step));
    const tuoiBatDau = cuc.so + 10 * step;
    daiVanTuoiTaiChi[chiIdx] = [tuoiBatDau, tuoiBatDau + 9];
  }

  const tuoiNamXem = input.viewingYear ? input.viewingYear - input.year + 1 : null;

  // --- Gộp 12 cung ---
  const cungs: CungKetQua[] = [];
  for (let chiIndex = 0; chiIndex < 12; chiIndex++) {
    const nghichStep = mod12(menhChiIndex - chiIndex);
    const cungName = CUNG_NAMES_TU_MENH_NGHICH[nghichStep];
    const canIndex = canOfChiIndex(canAtDan, chiIndex);
    cungs.push({
      chiIndex,
      chiName: CHI[chiIndex],
      canIndex,
      canName: CAN[canIndex],
      cungName,
      isMenh: chiIndex === menhChiIndex,
      isThan: chiIndex === thanChiIndex,
      chinhTinh: chinhTinhTaiChi[chiIndex],
      phuTinh: phuTinhTaiChi[chiIndex],
      trangSinh: trangSinhTaiChi[chiIndex],
      thaiTue: thaiTueTaiChi[chiIndex],
      daiVanTuoi: daiVanTuoiTaiChi[chiIndex],
      tuan: chiIndex === tuan1 || chiIndex === tuan2,
      triet: !!trietPair && (chiIndex === trietPair[0] || chiIndex === trietPair[1]),
    });
  }

  return {
    input,
    lunarDay: lunar.day,
    lunarMonth: lunar.month,
    lunarYear: lunar.year,
    lunarIsLeap: lunar.isLeapMonth,
    yearCanName,
    yearChiName,
    amDuongNam,
    gioChiName: CHI[gioChiIndex],
    tuoiNamXem,
    cucName: cuc.name,
    cucSo: cuc.so,
    banMenhNapAm: banMenhNapAm.name,
    banMenhElement: banMenhNapAm.element,
    menhQuai,
    chuMenh,
    chuThan,
    tuHoa,
    cungs,
    menhChiIndex,
    thanChiIndex,
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
  };
}

export function getPalace(chart: TuViChart, chiName: string): CungKetQua {
  const p = chart.cungs.find((c) => c.chiName === chiName);
  if (!p) throw new Error("RULE_NOT_DEFINED: getPalace — không tìm thấy cung " + chiName);
  return p;
}

export function getStar(chart: TuViChart, chiName: string, starName: string): ChinhTinhO {
  const p = getPalace(chart, chiName);
  const s = p.chinhTinh.find((s) => s.name === starName);
  if (!s) throw new Error("RULE_NOT_DEFINED: getStar — không tìm thấy sao " + starName + " tại " + chiName);
  return s;
}
