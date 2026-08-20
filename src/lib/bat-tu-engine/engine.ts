/**
 * bat-tu-engine — Tính VƯỢNG SUY Nhật Chủ + chọn DỤNG/HỶ/KỴ/CỪU THẦN, dứt khoát + minh bạch.
 *
 * Nguồn logic: SPEC.md (code hóa của skill luan-giai-bat-tu: vuong-suy.md + dung-than.md).
 * Nhận Tứ Trụ đã lập sẵn (KHÔNG tự lập lá số). base-data.json chỉ để tra bảng nền.
 *
 * ⚠️ Theo yêu cầu chủ sở hữu: engine LUÔN chốt 1 Dụng Thần (không có "cần thầy xem lại") — đây chỉ
 * là 1 lớp đầu vào, đối chiếu chéo Manh Phái/Tử Vi sau. Mọi kết luận kèm dienGiai[] để truy logic.
 */
import base from "./base-data.json";

export type Hanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
export interface CanChi { can: string; chi: string }
export interface TuTruInput {
  nam: CanChi; thang: CanChi; ngay: CanChi; gio: CanChi;
  gioiTinh: "Nam" | "Nữ";
}

const CHI_ORDER = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
// Chuẩn hóa vài cách viết khác nhau về đúng khóa base-data.
const CHI_ALIAS: Record<string, string> = { "Tỵ": "Tị", "Ty": "Tý", "Sưu": "Sửu" };
const chiChuan = (c: string): string => CHI_ALIAS[c.trim()] ?? c.trim();

const TC = base.nguHanh_thienCan as Record<string, { hanh: Hanh; amDuong: "Dương" | "Âm" }>;
const DC = base.nguHanh_diaChi as Record<string, { hanh: Hanh; amDuong: "Dương" | "Âm" }>;
const TANG = base.tangCan as Record<string, string[]>;
const SINH = base.sinh_khac.sinh as Record<Hanh, Hanh>;
const KHAC = base.sinh_khac.khac as Record<Hanh, Hanh>;
const TS_KHOI = base.truongSinh_khoi as Record<string, string>;
const TS_STATES = base.truongSinh_12trangThai as string[];
const TS_DAC_LENH = base.truongSinh_dacLenh_states as string[];
const MO_KHO = base.moKho as Record<Hanh, string>;
const HOP_HOA = base.thienCan_hopHoa as Record<string, string>;
const TAM_HOP = base.diaChi_tamHop as Record<string, string>;
const TAM_HOI = base.diaChi_tamHoi as Record<string, string>;
const LUC_XUNG = base.diaChi_lucXung.cap as string[][];

const hanhCan = (can: string): Hanh => TC[can]?.hanh;
const amCan = (can: string): "Dương" | "Âm" => TC[can]?.amDuong;
const hanhChi = (chi: string): Hanh => DC[chiChuan(chi)]?.hanh;
/** Hành A SINH cho hành nào (SINH[A]); hành nào SINH cho X (đảo). */
const hanhSinhCho = (x: Hanh): Hanh => (Object.keys(SINH) as Hanh[]).find((h) => SINH[h] === x)!;
const hanhKhacX = (x: Hanh): Hanh => (Object.keys(KHAC) as Hanh[]).find((h) => KHAC[h] === x)!;

/** Quan hệ 1 hành khác so với Nhật Chủ → "phe" phục vụ vượng suy. */
type Phe = "ty_kiep" | "an" | "thuc_thuong" | "tai" | "quan_sat";
function pheCua(hanhKhac: Hanh, nhatChu: Hanh): Phe {
  if (hanhKhac === nhatChu) return "ty_kiep";
  if (SINH[hanhKhac] === nhatChu) return "an"; // hành khác sinh nhật chủ
  if (SINH[nhatChu] === hanhKhac) return "thuc_thuong"; // nhật chủ sinh ra
  if (KHAC[nhatChu] === hanhKhac) return "tai"; // nhật chủ khắc
  return "quan_sat"; // hành khác khắc nhật chủ
}

/** Trạng thái vòng Trường Sinh của Nhật Chủ tại 1 Chi. Can Dương đi thuận, Can Âm đi nghịch. */
function trangThaiTruongSinh(nhatChuCan: string, chi: string): string {
  const khoi = TS_KHOI[nhatChuCan];
  const khoiIdx = CHI_ORDER.indexOf(chiChuan(khoi));
  const idx = CHI_ORDER.indexOf(chiChuan(chi));
  if (khoiIdx < 0 || idx < 0) return "—";
  const steps = amCan(nhatChuCan) === "Dương" ? (idx - khoiIdx + 12) % 12 : (khoiIdx - idx + 12) % 12;
  return TS_STATES[steps];
}

function coLucXung(chi: string, cacChi: string[]): boolean {
  const c = chiChuan(chi);
  return cacChi.some((o) => {
    const oc = chiChuan(o);
    return LUC_XUNG.some(([a, b]) => (a === c && b === oc) || (b === c && a === oc));
  });
}

// ---------------------------------------------------------------------------------------------
export type CapDo = "Cực cường" | "Cường vượng" | "Vượng" | "Trung hòa" | "Suy" | "Nhược" | "Cực nhược";

export interface VuongSuyResult {
  capDo: CapDo;
  nhom: 1 | 2 | 3;
  canhBaoHopHoa: boolean;
  diem: number;
  dacLenh: { dat: boolean; trangThai: string; yeu: boolean };
  dienGiai: string[];
}

const AN_STRONG = new Set(TS_DAC_LENH);

export function tinhVuongSuy(tt: TuTruInput): VuongSuyResult {
  const dg: string[] = [];
  const nhatChu = tt.ngay.can;
  const hanhNC = hanhCan(nhatChu);
  const cacChi = [tt.nam.chi, tt.thang.chi, tt.ngay.chi, tt.gio.chi];
  const canKhac = [tt.nam.can, tt.thang.can, tt.gio.can]; // 3 thiên can (trừ Nhật Chủ)

  // A. Đắc lệnh — trạng thái Trường Sinh tại Chi tháng.
  const ttThang = trangThaiTruongSinh(nhatChu, tt.thang.chi);
  let dacLenh = AN_STRONG.has(ttThang);
  let dacLenhYeu = false;
  const chiThangKho = ["Thìn", "Tuất", "Sửu", "Mùi"].includes(chiChuan(tt.thang.chi));
  if (chiThangKho) {
    // Tháng tạp khí (Tứ Mộ): xét bản khí tàng can so với Nhật Chủ.
    const banKhi = TANG[chiChuan(tt.thang.chi)]?.[0];
    const phe = banKhi ? pheCua(hanhCan(banKhi), hanhNC) : "quan_sat";
    if (phe === "ty_kiep" || phe === "an") { dacLenh = true; dacLenhYeu = true; dg.push(`Tháng ${tt.thang.chi} tạp khí — bản khí ${banKhi} (${phe === "an" ? "Ấn" : "Tỷ Kiếp"}) trợ/sinh Nhật Chủ → được lệnh (yếu).`); }
    else { dacLenh = false; dg.push(`Tháng ${tt.thang.chi} tạp khí — bản khí ${banKhi} không trợ Nhật Chủ → không được lệnh.`); }
  } else {
    dg.push(`Nhật Chủ ${nhatChu} tại nguyệt lệnh ${tt.thang.chi}: vòng Trường Sinh = "${ttThang}" → ${dacLenh ? "ĐƯỢC lệnh" : "KHÔNG được lệnh"}.`);
  }

  // B. Đắc địa — Nhật Chủ có gốc ở 3 chi (nam/ngày/giờ): tàng can cùng hành, có xét Mộ khố + xung.
  const chiXet: { ten: string; chi: string }[] = [
    { ten: "năm", chi: tt.nam.chi }, { ten: "ngày", chi: tt.ngay.chi }, { ten: "giờ", chi: tt.gio.chi },
  ];
  let soCanGoc = 0; let gocManh = false;
  for (const { ten, chi } of chiXet) {
    const tang = TANG[chiChuan(chi)] ?? [];
    const coCungHanh = tang.some((c) => hanhCan(c) === hanhNC);
    if (!coCungHanh) continue;
    const laMoKho = MO_KHO[hanhNC] === chiChuan(chi);
    if (laMoKho && amCan(nhatChu) === "Âm") { dg.push(`Chi ${ten} ${chi} là Mộ khố của ${hanhNC} nhưng Nhật Chủ Âm → vô khí, không tính gốc.`); continue; }
    const biXung = coLucXung(chi, cacChi.filter((_, i) => cacChi[i] !== chi));
    soCanGoc++;
    if (!biXung && !laMoKho) gocManh = true;
    dg.push(`Chi ${ten} ${chi} có tàng can cùng hành ${hanhNC} → có gốc${laMoKho ? " (Mộ khố)" : ""}${biXung ? " nhưng BỊ xung, hạ lực" : ""}.`);
  }
  const dacDia = soCanGoc > 0;

  // C. Được sinh (Ấn) + D. Được trợ (Tỷ Kiếp) — quét thiên can khác + tàng can (trừ chi tháng).
  const nguonKhi: { can: string; thau: boolean }[] = [];
  for (const c of canKhac) nguonKhi.push({ can: c, thau: true });
  for (const { chi } of chiXet) for (const c of TANG[chiChuan(chi)] ?? []) nguonKhi.push({ can: c, thau: false });
  let anCount = 0, anManh = false, tyCount = 0, tyManh = false;
  for (const { can, thau } of nguonKhi) {
    const phe = pheCua(hanhCan(can), hanhNC);
    if (phe === "an") { anCount++; if (thau) anManh = true; }
    if (phe === "ty_kiep") { tyCount++; if (thau) tyManh = true; }
  }
  const duocSinh = anCount > 0;
  const duocTro = tyCount > 0;
  if (duocSinh) dg.push(`Được sinh: có ${anCount} Ấn (hành sinh Nhật Chủ)${anManh ? ", thấu can — mạnh" : ""}.`);
  if (duocTro) dg.push(`Được trợ: có ${tyCount} Tỷ/Kiếp (cùng hành)${tyManh ? ", thấu can — mạnh" : ""}.`);

  // 2.2 Hợp hóa — quét ngũ hợp Thiên Can + tam hợp/hội tạo hành khắc/tiết/hao Nhật Chủ.
  let canhBaoHopHoa = false;
  const allCans = [tt.nam.can, tt.thang.can, tt.ngay.can, tt.gio.can];
  for (const [cap, hoaHanh] of Object.entries(HOP_HOA)) {
    const [a, b] = cap.split("-");
    if (allCans.includes(a) && allCans.includes(b)) {
      const phe = pheCua(hoaHanh as Hanh, hanhNC);
      if (phe === "quan_sat" || phe === "thuc_thuong" || phe === "tai") {
        canhBaoHopHoa = true;
        dg.push(`Có cặp hợp ${cap} (khả năng hóa ${hoaHanh}) — nếu hóa thành sẽ ${phe === "quan_sat" ? "khắc" : phe === "thuc_thuong" ? "tiết" : "hao"} Nhật Chủ → cảnh báo hạ bậc.`);
      }
    }
  }
  for (const [bo, hoaHanh] of [...Object.entries(TAM_HOP), ...Object.entries(TAM_HOI)]) {
    const chis = bo.split("-").map(chiChuan);
    const coMat = chis.filter((c) => cacChi.map(chiChuan).includes(c)).length;
    if (coMat >= 2) {
      const phe = pheCua(hoaHanh as Hanh, hanhNC);
      if ((phe === "quan_sat" || phe === "thuc_thuong" || phe === "tai") && coMat >= 2) {
        if (coMat >= 3) canhBaoHopHoa = true;
        dg.push(`Có ${coMat}/3 chi cục ${bo} (${hoaHanh}) — ${phe === "quan_sat" ? "khắc" : phe === "thuc_thuong" ? "tiết" : "hao"} Nhật Chủ${coMat >= 3 ? " (đủ cục → hạ bậc)" : " (bán hợp, lưu ý)"}.`);
      }
    }
  }

  // 2.3 SO LỰC đồng đảng (Ấn + Tỷ Kiếp) vs dị đảng (Thực Thương + Tài + Quan Sát).
  // Trọng số: NGUYỆT LỆNH áp đảo (bản khí ×4). Thiên can thấu ×2. Tàng chi khác: bản 2 / trung 1 / dư 0.5.
  const KHI_W_THANG = [4, 2, 1];
  const KHI_W_KHAC = [2, 1, 0.5];
  let lucDong = 0, lucDi = 0;
  const themLuc = (can: string, w: number) => {
    const p = pheCua(hanhCan(can), hanhNC);
    if (p === "ty_kiep" || p === "an") lucDong += w; else lucDi += w;
  };
  for (const c of canKhac) themLuc(c, 2); // 3 thiên can thấu (trừ Nhật Chủ)
  (TANG[chiChuan(tt.thang.chi)] ?? []).forEach((c, i) => themLuc(c, KHI_W_THANG[i] ?? 0.5));
  for (const { chi } of chiXet) (TANG[chiChuan(chi)] ?? []).forEach((c, i) => themLuc(c, KHI_W_KHAC[i] ?? 0.3));

  let tyLe = lucDong / (lucDong + lucDi || 1); // 0..1, phần đồng đảng
  if (canhBaoHopHoa) tyLe -= 0.08; // hợp hóa làm suy ngầm → hạ tỷ lệ
  dg.push(`So lực: đồng đảng (Ấn+Tỷ Kiếp) = ${Math.round(lucDong * 10) / 10} vs dị đảng (Thực Thương+Tài+Quan Sát) = ${Math.round(lucDi * 10) / 10} → tỷ lệ thân = ${Math.round(tyLe * 100)}%${canhBaoHopHoa ? " (đã trừ do hợp hóa)" : ""}.`);

  const capDo: CapDo =
    tyLe >= 0.72 ? "Cực cường" : tyLe >= 0.60 ? "Cường vượng" : tyLe >= 0.52 ? "Vượng"
    : tyLe >= 0.45 ? "Trung hòa" : tyLe >= 0.35 ? "Suy" : tyLe >= 0.22 ? "Nhược" : "Cực nhược";
  const diem = Math.round(tyLe * 100);
  dg.push(`Kết luận cấp độ: "${capDo}".`);

  const nhom: 1 | 2 | 3 =
    capDo === "Cực cường" || capDo === "Cực nhược" ? 3
    : capDo === "Cường vượng" || capDo === "Nhược" ? 2 : 1;

  return { capDo, nhom, canhBaoHopHoa, diem: Math.round(diem * 10) / 10, dacLenh: { dat: dacLenh, trangThai: ttThang, yeu: dacLenhYeu }, dienGiai: dg };
}

// ---------------------------------------------------------------------------------------------
export type PhuongPhap = "Phù Ức" | "Thông Quan" | "Thuận Thế" | "Điều Hậu (bổ sung)";
export interface DungThanResult {
  phuongPhap: PhuongPhap;
  dungThan: Hanh; hyThan: Hanh; kyThan: Hanh; cuuThan: Hanh;
  dieuHauNote?: string;
  dienGiai: string[];
}

const MUA_DONG = ["Hợi", "Tý", "Sửu"];
const MUA_HE = ["Tị", "Ngọ", "Mùi"];

/** Đếm "lực" mỗi phe trong toàn cục (thấu can =2, tàng =1). */
function demPhe(tt: TuTruInput): Record<Phe, number> {
  const hanhNC = hanhCan(tt.ngay.can);
  const d: Record<Phe, number> = { ty_kiep: 0, an: 0, thuc_thuong: 0, tai: 0, quan_sat: 0 };
  for (const c of [tt.nam.can, tt.thang.can, tt.gio.can]) d[pheCua(hanhCan(c), hanhNC)] += 2;
  for (const chi of [tt.nam.chi, tt.thang.chi, tt.ngay.chi, tt.gio.chi]) for (const c of TANG[chiChuan(chi)] ?? []) d[pheCua(hanhCan(c), hanhNC)] += 1;
  return d;
}

/** Hành ứng với 1 phe (theo Nhật Chủ). */
function hanhCuaPhe(phe: Phe, nhatChu: Hanh): Hanh {
  switch (phe) {
    case "ty_kiep": return nhatChu;
    case "an": return hanhSinhCho(nhatChu);
    case "thuc_thuong": return SINH[nhatChu];
    case "tai": return KHAC[nhatChu];
    case "quan_sat": return hanhKhacX(nhatChu);
  }
}

/** Suy Hỷ/Kỵ/Cừu từ Dụng Thần theo sinh-khắc (quy ước chuẩn Tử Bình, SPEC 3.2). */
function suyHyKyCuu(dung: Hanh): { hyThan: Hanh; kyThan: Hanh; cuuThan: Hanh } {
  const hyThan = hanhSinhCho(dung); // hành sinh cho dụng
  const kyThan = hanhKhacX(dung); // hành khắc dụng
  const cuuThan = hanhSinhCho(kyThan); // hành sinh cho kỵ
  return { hyThan, kyThan, cuuThan };
}

export function chonDungThan(tt: TuTruInput, vs: VuongSuyResult): DungThanResult {
  const dg: string[] = [];
  const nhatChu = hanhCan(tt.ngay.can);
  const phe = demPhe(tt);
  const luucDongDang = phe.ty_kiep + phe.an; // phe Nhật Chủ
  const luucDiDang = phe.thuc_thuong + phe.tai + phe.quan_sat;

  // Điều Hậu (bổ sung) — hàn/nhiệt theo mùa (chi tháng).
  let dieuHauNote: string | undefined;
  const thangChi = chiChuan(tt.thang.chi);
  if (MUA_DONG.includes(thangChi)) dieuHauNote = "Sinh mùa Đông (hàn) — cân nhắc thêm Hỏa để điều hậu.";
  else if (MUA_HE.includes(thangChi)) dieuHauNote = "Sinh mùa Hè (nhiệt) — cân nhắc thêm Thủy để điều hậu.";

  const vuong = ["Vượng", "Cường vượng", "Cực cường"].includes(vs.capDo);
  const nhuoc = ["Nhược", "Suy", "Cực nhược"].includes(vs.capDo);

  // Tòng cách (Thuận Thế) — chỉ khi CỰC đoan + gần như không có phe cứu.
  if (vs.capDo === "Cực nhược" && luucDongDang <= 1) {
    // Tòng theo hành áp đảo (phe dị đảng mạnh nhất).
    const manhNhat = (["quan_sat", "tai", "thuc_thuong"] as Phe[]).sort((a, b) => phe[b] - phe[a])[0];
    const dung = hanhCuaPhe(manhNhat, nhatChu);
    dg.push(`Cực nhược, gần như không có Ấn/Tỷ cứu (đồng đảng=${luucDongDang}) → TÒNG theo thế ${manhNhat} áp đảo. Thuận Thế.`);
    dg.push(`Dụng Thần = ${dung} (hành đang áp đảo); Kỵ = Ấn/Tỷ Kiếp (cứu không nổi càng loạn).`);
    const kyThan = nhatChu; // Tỷ Kiếp
    return { phuongPhap: "Thuận Thế", dungThan: dung, hyThan: SINH[dung] === nhatChu ? hanhSinhCho(dung) : hanhSinhCho(dung), kyThan, cuuThan: hanhSinhCho(kyThan), dieuHauNote, dienGiai: dg };
  }
  if (vs.capDo === "Cực cường" && luucDiDang <= 1) {
    const dung = SINH[nhatChu]; // Thực Thương tiết
    dg.push(`Cực cường, gần như không có tiết/khắc/hao (dị đảng=${luucDiDang}) → TÒNG Vượng. Thuận Thế: Dụng = Thực Thương (${dung}) tiết êm; Kỵ = hành khắc lại Nhật Chủ.`);
    return { phuongPhap: "Thuận Thế", dungThan: dung, hyThan: nhatChu, kyThan: hanhKhacX(nhatChu), cuuThan: hanhSinhCho(hanhKhacX(nhatChu)), dieuHauNote, dienGiai: dg };
  }

  // Thông Quan — 2 phe đối đầu ngang sức mạnh (vd Quan Sát vs Ấn, hoặc Tài vs Tỷ Kiếp).
  // (Kiểm nhẹ: nếu Quan Sát và Ấn cùng mạnh & xấp xỉ → Ấn thông quan hóa Sát.)
  if (!vuong && !nhuoc && Math.abs(phe.quan_sat - phe.an) <= 1 && phe.quan_sat >= 3 && phe.an >= 3) {
    const dung = hanhSinhCho(nhatChu); // Ấn thông quan (Quan Sát sinh Ấn, Ấn sinh Nhật Chủ)
    dg.push(`Quan Sát (${phe.quan_sat}) và Ấn (${phe.an}) ngang sức → Thông Quan: Dụng = Ấn (${dung}) hóa Sát sinh Thân.`);
    return { phuongPhap: "Thông Quan", dungThan: dung, ...suyHyKyCuu(dung), dieuHauNote, dienGiai: dg };
  }

  // Phù Ức (mặc định).
  if (nhuoc) {
    // Phù: ưu tiên Ấn (vừa sinh vừa hóa Quan Sát) nếu có Quan Sát; nếu không thì Tỷ Kiếp.
    const dungAn = hanhSinhCho(nhatChu);
    const dungTy = nhatChu;
    const chonAn = phe.quan_sat >= phe.tai; // có Quan Sát đáng kể → Ấn hóa sát
    const dung = chonAn ? dungAn : dungTy;
    dg.push(`Thân ${vs.capDo} → Phù Ức (PHÙ): dụng ${chonAn ? "Ấn " + dungAn + " (vừa sinh Thân vừa hóa Quan Sát)" : "Tỷ Kiếp " + dungTy + " (trợ thân trực tiếp)"}.`);
    const hkc = suyHyKyCuu(dung);
    if (dieuHauNote) dg.push(dieuHauNote);
    return { phuongPhap: "Phù Ức", dungThan: dung, ...hkc, dieuHauNote, dienGiai: dg };
  }
  if (vuong) {
    // Ức: chọn hành YẾU NHẤT trong {Thực Thương, Quan Sát, Tài} để cân bằng.
    const nhom: Phe[] = ["thuc_thuong", "quan_sat", "tai"];
    const yeuNhat = nhom.sort((a, b) => phe[a] - phe[b])[0];
    const dung = hanhCuaPhe(yeuNhat, nhatChu);
    const ten = yeuNhat === "thuc_thuong" ? "Thực Thương (tiết)" : yeuNhat === "quan_sat" ? "Quan Sát (khắc)" : "Tài (hao)";
    dg.push(`Thân ${vs.capDo} → Phù Ức (ỨC): dụng hành yếu nhất trong nhóm tiết-khắc-hao = ${ten} = ${dung}.`);
    const hkc = suyHyKyCuu(dung);
    if (dieuHauNote) dg.push(dieuHauNote);
    return { phuongPhap: "Phù Ức", dungThan: dung, ...hkc, dieuHauNote, dienGiai: dg };
  }

  // Trung hòa — linh hoạt, chọn hành cân bằng nhất (tiết tú Thực Thương) + ghi phụ thuộc Đại Vận.
  const dung = SINH[nhatChu];
  dg.push(`Thân Trung hòa → Dụng Thần linh hoạt, phụ thuộc Đại Vận. Mặc định lấy Thực Thương (${dung}) làm hành cân bằng tĩnh.`);
  if (dieuHauNote) dg.push(dieuHauNote);
  return { phuongPhap: "Phù Ức", dungThan: dung, ...suyHyKyCuu(dung), dieuHauNote, dienGiai: dg };
}

// ---------------------------------------------------------------------------------------------
export interface BatTuAnalysis {
  vuongSuy: VuongSuyResult;
  dungThan: DungThanResult;
}

export function phanTichBatTu(tt: TuTruInput): BatTuAnalysis {
  const vuongSuy = tinhVuongSuy(tt);
  const dungThan = chonDungThan(tt, vuongSuy);
  return { vuongSuy, dungThan };
}
