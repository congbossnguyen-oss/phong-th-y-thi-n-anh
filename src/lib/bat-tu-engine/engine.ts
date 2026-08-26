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

export const CHI_ORDER = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
// Chuẩn hóa vài cách viết khác nhau về đúng khóa base-data.
const CHI_ALIAS: Record<string, string> = { "Tỵ": "Tị", "Ty": "Tý", "Sưu": "Sửu" };
export const chiChuan = (c: string): string => CHI_ALIAS[c.trim()] ?? c.trim();

const TC = base.nguHanh_thienCan as Record<string, { hanh: Hanh; amDuong: "Dương" | "Âm" }>;
const DC = base.nguHanh_diaChi as Record<string, { hanh: Hanh; amDuong: "Dương" | "Âm" }>;
export const TANG = base.tangCan as Record<string, string[]>;
const SINH = base.sinh_khac.sinh as Record<Hanh, Hanh>;
const KHAC = base.sinh_khac.khac as Record<Hanh, Hanh>;
const TS_KHOI = base.truongSinh_khoi as Record<string, string>;
const TS_STATES = base.truongSinh_12trangThai as string[];
const TS_DAC_LENH = base.truongSinh_dacLenh_states as string[];
export const MO_KHO = base.moKho as Record<Hanh, string>;
export const HOP_HOA = base.thienCan_hopHoa as Record<string, string>;
export const TAM_HOP = base.diaChi_tamHop as Record<string, string>;
export const TAM_HOI = base.diaChi_tamHoi as Record<string, string>;
const LUC_XUNG = base.diaChi_lucXung.cap as string[][];

export const hanhCan = (can: string): Hanh => TC[can]?.hanh;
const amCan = (can: string): "Dương" | "Âm" => TC[can]?.amDuong;
export const hanhChi = (chi: string): Hanh => DC[chiChuan(chi)]?.hanh;
/** Hành A SINH cho hành nào (SINH[A]); hành nào SINH cho X (đảo). */
export const hanhSinhCho = (x: Hanh): Hanh => (Object.keys(SINH) as Hanh[]).find((h) => SINH[h] === x)!;
export const hanhKhacX = (x: Hanh): Hanh => (Object.keys(KHAC) as Hanh[]).find((h) => KHAC[h] === x)!;
export const SINH_MAP: Record<Hanh, Hanh> = SINH;
export const KHAC_MAP: Record<Hanh, Hanh> = KHAC;

/** Quan hệ 1 hành khác so với Nhật Chủ → "phe" phục vụ vượng suy. */
export type Phe = "ty_kiep" | "an" | "thuc_thuong" | "tai" | "quan_sat";
export function pheCua(hanhKhac: Hanh, nhatChu: Hanh): Phe {
  if (hanhKhac === nhatChu) return "ty_kiep";
  if (SINH[hanhKhac] === nhatChu) return "an"; // hành khác sinh nhật chủ
  if (SINH[nhatChu] === hanhKhac) return "thuc_thuong"; // nhật chủ sinh ra
  if (KHAC[nhatChu] === hanhKhac) return "tai"; // nhật chủ khắc
  return "quan_sat"; // hành khác khắc nhật chủ
}

/** Trạng thái vòng Trường Sinh của Nhật Chủ tại 1 Chi. Can Dương đi thuận, Can Âm đi nghịch. */
export function trangThaiTruongSinh(nhatChuCan: string, chi: string): string {
  const khoi = TS_KHOI[nhatChuCan];
  const khoiIdx = CHI_ORDER.indexOf(chiChuan(khoi));
  const idx = CHI_ORDER.indexOf(chiChuan(chi));
  if (khoiIdx < 0 || idx < 0) return "—";
  const steps = amCan(nhatChuCan) === "Dương" ? (idx - khoiIdx + 12) % 12 : (khoiIdx - idx + 12) % 12;
  return TS_STATES[steps];
}

export function coLucXung(chi: string, cacChi: string[]): boolean {
  const c = chiChuan(chi);
  return cacChi.some((o) => {
    const oc = chiChuan(o);
    return LUC_XUNG.some(([a, b]) => (a === c && b === oc) || (b === c && a === oc));
  });
}

// ---------------------------------------------------------------------------------------------
// NGŨ HỢP THIÊN CAN — CỬA DUY NHẤT cho toàn dự án.
//
// Trước 22/8/2026 mỗi nơi tự kiểm tra một kiểu: engine.ts có cổng tháng + tranh hợp, còn
// structural-bat-tu.ts chỉ kiểm tra "hai Can cùng có mặt trong tứ trụ" rồi trừ hạng luôn — anh Công
// phát hiện lá 25/8/2026 bị báo "Bính-Tân khả năng hóa Thủy" trong khi lá đó có 2 Bính (tranh hợp,
// không hợp được) và sinh tháng Thân (Kim, không vượng cho Thủy). Nay mọi nơi phải gọi hàm này.
//
// Quy tắc lấy nguyên từ tài liệu sẵn có, KHÔNG tự suy diễn:
//   - `luan-giai-bat-tu/references/quan-he-can-chi.md` mục 3
//   - `luan-giai-bat-tu-manh-phai/references/hop-hoa-mo-rong.md` mục 2 & 3 (Manh Phái Buổi 30)
//
// ĐIỀU KIỆN "CÓ THỂ HỢP":
//   1. Hai Can phải LIỀN KỀ TRỤ. Cách trụ (có Can khác chen giữa) thì không hợp.
//      (Ngoại lệ "Can ở giữa làm cầu nối" — vd Giáp–Bính–Kỷ — tài liệu chỉ nêu đúng 1 ví dụ, chưa
//      cho quy tắc tổng quát, nên CHƯA cài: thà bỏ sót còn hơn bắt nhầm.)
//   2. Không Tranh Hợp (2 Can Dương giành 1 Can Âm) và không Đố Hợp (2 Can Âm giành 1 Can Dương).
//      Cả hai đều quy về: một trong hai Can của cặp xuất hiện ≥2 lần trong tứ trụ → KHÔNG hợp.
// ĐIỀU KIỆN "HÓA" (sau khi đã hợp được):
//   3. NHẬT CHỦ tham gia hợp → CHỈ LUẬN HỢP, KHÔNG LUẬN HÓA (hop-hoa-mo-rong.md mục 3, in đậm).
//   4. Tháng sinh phải vượng cho hóa thần.
// CHƯA CÀI (chờ anh Công chốt ngưỡng định lượng): "lực sinh/trợ hóa thần đủ mạnh nhưng không thái
// quá", và hóa thần thứ 2 của mỗi cặp (phu tòng thê hóa / thê tòng phu hóa).

/** Tháng lệnh có vượng cho hành hóa khí không. Thổ có thêm Tị theo `hop-hoa-mo-rong.md` mục 3. */
export function thangVuongChoHanh(chiThangRaw: string, h: Hanh): boolean {
  const chiThang = chiChuan(chiThangRaw);
  const MUA: Record<Hanh, string[]> = {
    Mộc: ["Dần", "Mão", "Thìn"], Hỏa: ["Tị", "Ngọ", "Mùi"],
    Kim: ["Thân", "Dậu", "Tuất"], Thủy: ["Hợi", "Tý", "Sửu"],
    Thổ: ["Thìn", "Tuất", "Sửu", "Mùi", "Tị"],
  };
  return (MUA[h] ?? []).includes(chiThang);
}

export interface KetQuaHopHoa {
  cap: string; // "Bính-Tân"
  canA: string;
  canB: string;
  /** Chỉ số trụ 0=Năm, 1=Tháng, 2=Ngày, 3=Giờ. */
  viTriA: number;
  viTriB: number;
  hoaHanh: Hanh;
  /** Hợp được không (liền kề + không tranh/đố hợp). */
  hop: boolean;
  /** Hóa thật không (đã hợp + Nhật Chủ không tham gia + tháng vượng cho hóa thần). */
  hoa: boolean;
  /** Tranh Hợp hoặc Đố Hợp — dùng để giảm lực phe đang bận tranh nhau. */
  tranhHop: boolean;
  lyDo: string;
}

/** Quét toàn bộ ngũ hợp Thiên Can của một tứ trụ. Trả về CẢ cặp không hợp/không hóa kèm lý do. */
export function xetHopHoaThienCan(tt: Pick<TuTruInput, "nam" | "thang" | "ngay" | "gio">): KetQuaHopHoa[] {
  const cans = [tt.nam.can, tt.thang.can, tt.ngay.can, tt.gio.can];
  const TEN_TRU = ["Năm", "Tháng", "Ngày", "Giờ"];
  const ketQua: KetQuaHopHoa[] = [];

  for (const [cap, hoaHanhRaw] of Object.entries(HOP_HOA)) {
    const [a, b] = cap.split("-");
    const hoaHanh = hoaHanhRaw as Hanh;
    const soA = cans.filter((c) => c === a).length;
    const soB = cans.filter((c) => c === b).length;
    if (soA === 0 || soB === 0) continue;

    // Điều kiện 2 — Tranh Hợp / Đố Hợp: một Can của cặp xuất hiện ≥2 lần → hợp không trọn, vô hiệu.
    if (soA >= 2 || soB >= 2) {
      const canNhieu = soA >= 2 ? a! : b!;
      ketQua.push({
        cap, canA: a!, canB: b!, viTriA: cans.indexOf(a!), viTriB: cans.indexOf(b!), hoaHanh,
        hop: false, hoa: false, tranhHop: true,
        lyDo: `Có ${Math.max(soA, soB)} can ${canNhieu} cùng giành hợp ${cap} → ${amCan(canNhieu) === "Dương" ? "Tranh Hợp" : "Đố Hợp"}: hợp không trọn, KHÔNG hợp.`,
      });
      continue;
    }

    // Điều kiện 1 — phải liền kề trụ.
    const iA = cans.indexOf(a!);
    const iB = cans.indexOf(b!);
    if (Math.abs(iA - iB) !== 1) {
      ketQua.push({
        cap, canA: a!, canB: b!, viTriA: iA, viTriB: iB, hoaHanh,
        hop: false, hoa: false, tranhHop: false,
        lyDo: `${a} ở trụ ${TEN_TRU[iA]} và ${b} ở trụ ${TEN_TRU[iB]} KHÔNG liền kề (có can khác chen giữa) → không hợp.`,
      });
      continue;
    }

    // Điều kiện 3 — Nhật Chủ tham gia thì chỉ hợp, không hóa.
    if (iA === 2 || iB === 2) {
      ketQua.push({
        cap, canA: a!, canB: b!, viTriA: iA, viTriB: iB, hoaHanh,
        hop: true, hoa: false, tranhHop: false,
        lyDo: `Nhật Chủ ${tt.ngay.can} tham gia hợp ${cap} → chỉ luận HỢP, KHÔNG luận HÓA (Nhật Chủ là chủ thể, không tự biến thành hành khác).`,
      });
      continue;
    }

    // Điều kiện 4 — tháng phải vượng cho hóa thần.
    if (!thangVuongChoHanh(tt.thang.chi, hoaHanh)) {
      ketQua.push({
        cap, canA: a!, canB: b!, viTriA: iA, viTriB: iB, hoaHanh,
        hop: true, hoa: false, tranhHop: false,
        lyDo: `Hợp ${cap} thành nhưng tháng ${tt.thang.chi} không vượng cho ${hoaHanh} → hợp mà KHÔNG hóa.`,
      });
      continue;
    }

    ketQua.push({
      cap, canA: a!, canB: b!, viTriA: iA, viTriB: iB, hoaHanh,
      hop: true, hoa: true, tranhHop: false,
      lyDo: `Hợp ${cap} liền kề (trụ ${TEN_TRU[iA]}–${TEN_TRU[iB]}), không tranh hợp, tháng ${tt.thang.chi} vượng cho ${hoaHanh} → HÓA ${hoaHanh}.`,
    });
  }
  return ketQua;
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

/**
 * Tính vượng suy Nhật Chủ.
 *
 * `truThem` (tùy chọn) = Can Chi của ĐẠI VẬN đang xét, coi như "trụ thứ 5" tạm thời nhập cục
 * (vuong-suy.md mục 6.1: "xác định vượng suy trên nguyên mệnh cục tĩnh TRƯỚC, sau đó xét lại khi
 * tiến nhập Đại Vận/Lưu Niên cụ thể").
 *
 * ⚠️ CÓ CHỦ Ý: Đại Vận KHÔNG thay thế nguyệt lệnh khi xét ĐẮC LỆNH — `vuong-suy.md` mục A định nghĩa
 * đắc lệnh theo Chi THÁNG, và `quan-he-can-chi.md` mục 4 nêu rõ Nguyệt Chi giữ nguyên bản chất ngũ
 * hành kể cả khi tầng trên (Đại Vận/Lưu Niên) tác động. Đại Vận chỉ tham gia: đắc địa, được sinh,
 * được trợ, và cán cân so lực — với TRỌNG SỐ NGANG 1 trụ nguyên cục (can thấu ×2, tàng chi 2/1/0.5).
 * Trọng số này là GIẢ ĐỊNH MÔ HÌNH: tài liệu nêu Đại Vận ở "tầng" cao hơn mệnh cục khi tranh
 * xung/hợp/khắc, nhưng KHÔNG cho con số trọng số vượng suy cụ thể — nên chọn mức ngang bằng (không
 * thổi phồng) thay vì đoán liều (vuong-suy.md mục 6.3).
 *
 * Hợp hóa Thiên Can vẫn chỉ xét trong nguyên cục — hợp hóa cần tính "liền kề", không áp dụng gọn cho
 * 1 trụ ảo nằm ngoài tứ trụ.
 */
export function tinhVuongSuy(tt: TuTruInput, truThem?: CanChi): VuongSuyResult {
  const dg: string[] = [];
  const nhatChu = tt.ngay.can;
  const hanhNC = hanhCan(nhatChu);
  const cacChi = [tt.nam.chi, tt.thang.chi, tt.ngay.chi, tt.gio.chi, ...(truThem ? [truThem.chi] : [])];
  const canKhac = [tt.nam.can, tt.thang.can, tt.gio.can, ...(truThem ? [truThem.can] : [])]; // thiên can (trừ Nhật Chủ)

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
    ...(truThem ? [{ ten: "đại vận", chi: truThem.chi }] : []),
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
  //
  // ⚠️ HAI ĐIỀU KIỆN TIÊN QUYẾT ĐỂ "HÓA" (quan-he-can-chi.md mục 3, anh Công chốt 22/8/2026) —
  // trước đây engine bỏ qua cả hai, cứ thấy đủ cặp là hạ bậc:
  //   (1) THÁNG SINH phải vượng cho hành hóa khí (vd hóa Thủy cần tháng Hợi/Tý/Sửu).
  //   (2) KHÔNG bị TRANH HỢP — 2 Can giống nhau cùng giành hợp 1 Can thì "hợp không trọn, lực chia
  //       đôi hoặc vô hiệu" → KHÔNG hóa. Ngược lại, chính phe đi tranh hợp cũng bị GIẢM lực (bận
  //       tranh nhau thay vì dồn sức khắc Nhật Chủ).
  let canhBaoHopHoa = false;
  let tranhHopGiamLucDiDang = false;
  for (const kq of xetHopHoaThienCan(tt)) {
    const phe = pheCua(kq.hoaHanh, hanhNC);
    const laDiDang = phe === "quan_sat" || phe === "thuc_thuong" || phe === "tai";

    if (kq.tranhHop) {
      dg.push(kq.lyDo);
      // Phe đi tranh hợp bận giành nhau nên áp lực lên Nhật Chủ giảm so với nhìn bề mặt.
      const canNhieu = [tt.nam.can, tt.thang.can, tt.ngay.can, tt.gio.can].filter((c) => c === kq.canA).length >= 2 ? kq.canA : kq.canB;
      const pheCanNhieu = pheCua(hanhCan(canNhieu), hanhNC);
      if (pheCanNhieu === "quan_sat" || pheCanNhieu === "thuc_thuong" || pheCanNhieu === "tai") {
        tranhHopGiamLucDiDang = true;
        dg.push(`Đồng thời ${canNhieu} bận tranh hợp nên áp lực lên Nhật Chủ giảm so với nhìn bề mặt.`);
      }
      continue;
    }
    // Chỉ hạ bậc khi hóa THẬT và hóa thần thuộc dị đảng (khắc/tiết/hao Nhật Chủ).
    if (!laDiDang) continue;
    if (kq.hoa) {
      canhBaoHopHoa = true;
      dg.push(`${kq.lyDo} Hóa thần ${phe === "quan_sat" ? "khắc" : phe === "thuc_thuong" ? "tiết" : "hao"} Nhật Chủ → hạ bậc.`);
    } else {
      dg.push(`${kq.lyDo} (không hạ bậc)`);
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

  // Tranh hợp: phe dị đảng đang "bận tranh nhau" nên lực khắc/tiết thực tế giảm ~15% (anh Công chốt
  // 22/8/2026: "cả 2 Bính đều bận tranh giành hợp với Tân thay vì dồn toàn lực khắc chế Nhật Chủ").
  if (tranhHopGiamLucDiDang) lucDi *= 0.85;

  let tyLe = lucDong / (lucDong + lucDi || 1); // 0..1, phần đồng đảng
  if (canhBaoHopHoa) tyLe -= 0.08; // hợp hóa THẬT SỰ thành (đã qua 2 điều kiện) → hạ tỷ lệ
  dg.push(`So lực: đồng đảng (Ấn+Tỷ Kiếp) = ${Math.round(lucDong * 10) / 10} vs dị đảng (Thực Thương+Tài+Quan Sát) = ${Math.round(lucDi * 10) / 10}${tranhHopGiamLucDiDang ? " (đã giảm 15% do tranh hợp)" : ""} → tỷ lệ thân = ${Math.round(tyLe * 100)}%${canhBaoHopHoa ? " (đã trừ do hợp hóa)" : ""}.`);

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

/** Đếm "lực" mỗi phe trong toàn cục (thấu can =2, tàng =1). `truThem` = Đại Vận nhập cục (xem tinhVuongSuy). */
function demPhe(tt: TuTruInput, truThem?: CanChi): Record<Phe, number> {
  const hanhNC = hanhCan(tt.ngay.can);
  const d: Record<Phe, number> = { ty_kiep: 0, an: 0, thuc_thuong: 0, tai: 0, quan_sat: 0 };
  for (const c of [tt.nam.can, tt.thang.can, tt.gio.can, ...(truThem ? [truThem.can] : [])]) d[pheCua(hanhCan(c), hanhNC)] += 2;
  for (const chi of [tt.nam.chi, tt.thang.chi, tt.ngay.chi, tt.gio.chi, ...(truThem ? [truThem.chi] : [])]) for (const c of TANG[chiChuan(chi)] ?? []) d[pheCua(hanhCan(c), hanhNC)] += 1;
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

export function chonDungThan(tt: TuTruInput, vs: VuongSuyResult, truThem?: CanChi): DungThanResult {
  const dg: string[] = [];
  const nhatChu = hanhCan(tt.ngay.can);
  const phe = demPhe(tt, truThem);
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

  // Thông Quan (Ấn hóa Sát) — CHỈ áp dụng khi Nhật Chủ KHÔNG vượng.
  // ⚠️ Anh Công chốt 22/8/2026: cơ chế "Ấn hóa Sát" được thiết kế cho Nhật Chủ YẾU cần được nuôi
  // (dung-than.md mục 3a: "Nhật can yếu, Quan Sát cường vượng → dùng Ấn tinh"). Nếu thân đã vượng
  // mà vẫn dùng Ấn thì càng đẩy cục lệch xa cân bằng — Ấn chuyển từ Dụng sang KỴ. Điều kiện `!vuong`
  // dưới đây là chốt chặn đó (trước đây lá thân Vượng vẫn lọt vào nhánh này khi bị chấm nhầm Trung hòa).
  if (!vuong && !nhuoc && Math.abs(phe.quan_sat - phe.an) <= 1 && phe.quan_sat >= 3 && phe.an >= 3) {
    const dung = hanhSinhCho(nhatChu); // Ấn thông quan (Quan Sát sinh Ấn, Ấn sinh Nhật Chủ)
    dg.push(`Thân ${vs.capDo} (không vượng), Quan Sát (${phe.quan_sat}) và Ấn (${phe.an}) ngang sức → Thông Quan: Dụng = Ấn (${dung}) hóa Sát sinh Thân.`);
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
    // ỨC — thân vượng cần tiết/khắc/hao bớt.
    //
    // ƯU TIÊN THỰC THƯƠNG khi Quan Sát cũng đang vượng (anh Công chốt 22/8/2026): Thực Thương làm
    // ĐƯỢC 2 VIỆC cùng lúc mà Quan Sát/Tài không làm được — (1) tiết bớt Nhật Chủ đang dư,
    // (2) khắc chế luôn Quan Sát, giảm áp lực mà KHÔNG phải dựa vào Ấn (Ấn lúc này là Kỵ).
    // Đây chính là cách cục "Thực Thương chế Sát". Chỉ khi Quan Sát không đáng kể mới quay lại quy
    // tắc chung "chọn hành yếu nhất trong nhóm tiết-khắc-hao".
    const nhom: Phe[] = ["thuc_thuong", "quan_sat", "tai"];
    const quanSatVuong = phe.quan_sat >= 4;
    const chon: Phe = quanSatVuong ? "thuc_thuong" : nhom.slice().sort((a, b) => phe[a] - phe[b])[0]!;
    const dung = hanhCuaPhe(chon, nhatChu);
    const ten = chon === "thuc_thuong" ? "Thực Thương (tiết)" : chon === "quan_sat" ? "Quan Sát (khắc)" : "Tài (hao)";
    if (quanSatVuong) {
      dg.push(`Thân ${vs.capDo} + Quan Sát cũng vượng (${phe.quan_sat}) → ỨC bằng Thực Thương (${dung}): vừa tiết bớt Nhật Chủ dư lực, vừa khắc chế Quan Sát — không dùng Ấn vì Ấn lúc này thành Kỵ.`);
    } else {
      dg.push(`Thân ${vs.capDo} → Phù Ức (ỨC): dụng hành yếu nhất trong nhóm tiết-khắc-hao = ${ten} = ${dung}.`);
    }
    const hkc = suyHyKyCuu(dung);
    // Thân vượng → Ấn (hành sinh Nhật Chủ) là KỴ, bất kể suy theo công thức sinh-khắc ra hành nào.
    const anHanh = hanhSinhCho(nhatChu);
    dg.push(`Lưu ý: thân đã vượng nên Ấn (${anHanh}) là KỴ — thêm Ấn chỉ đẩy cục lệch xa cân bằng hơn.`);
    if (dieuHauNote) dg.push(dieuHauNote);
    return { phuongPhap: "Phù Ức", dungThan: dung, ...hkc, kyThan: anHanh, dieuHauNote, dienGiai: dg };
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

export interface PhanTichTaiDaiVan extends BatTuAnalysis {
  /** Dụng Thần tại vận này có KHÁC Dụng Thần nguyên cục không. */
  dungThanDoi: boolean;
  /** Cấp độ vượng suy tại vận này có khác nguyên cục không. */
  vuongSuyDoi: boolean;
  /** true = giữ nguyên nguyên cục vì Nhóm 3 (Tòng cách), không tính lại theo vận. */
  giuNguyenVietNhom3: boolean;
  goc: BatTuAnalysis;
}

/**
 * Tính lại vượng suy + Dụng Thần khi Nhật Chủ tiến nhập 1 ĐẠI VẬN cụ thể (coi Đại Vận là trụ thứ 5).
 *
 * Căn cứ `vuong-suy.md` mục 5 — 3 nhóm quyết định mức "linh hoạt" của Dụng Thần theo Đại Vận:
 *   Nhóm 1 (Thiên nhược/Trung hòa/Thiên vượng): Dụng Thần RẤT DỄ đổi theo vận.
 *   Nhóm 2 (Nhược/Vượng): CÓ THỂ đổi, nhất là khi Đại Vận "song thể" (Can Chi 2 hành khác nhau).
 *   Nhóm 3 (Cực nhược/Cực vượng): "rất khó đổi — về cơ bản phải GIỮ NGUYÊN hướng Thuận thế/Tòng cách
 *   xuyên suốt đời, trừ khi cấu trúc mệnh cục bị phá vỡ hoàn toàn (hiếm)".
 *
 * → Nhóm 3 CHẶN CỨNG: trả nguyên kết quả gốc, KHÔNG tính lại. Đây là chốt an toàn quan trọng nhất —
 * lá số Tòng cách mà bị lật Dụng Thần giữa chừng sẽ cho kết luận sai ngược hoàn toàn.
 */
export function phanTichBatTuTaiDaiVan(tt: TuTruInput, daiVan: CanChi): PhanTichTaiDaiVan {
  const goc = phanTichBatTu(tt);

  if (goc.vuongSuy.nhom === 3) {
    return { ...goc, goc, dungThanDoi: false, vuongSuyDoi: false, giuNguyenVietNhom3: true };
  }

  const vuongSuy = tinhVuongSuy(tt, daiVan);
  const dungThan = chonDungThan(tt, vuongSuy, daiVan);
  return {
    vuongSuy,
    dungThan,
    goc,
    dungThanDoi: dungThan.dungThan !== goc.dungThan.dungThan,
    vuongSuyDoi: vuongSuy.capDo !== goc.vuongSuy.capDo,
    giuNguyenVietNhom3: false,
  };
}
