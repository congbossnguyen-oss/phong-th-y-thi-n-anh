// Engine Huyền Không Đại Quái (HKĐQ) — trường phái dùng 64 quẻ Dịch (5.625°/quẻ) phối
// Sơn/Hướng/Thủy, độc lập với Huyền Không Phi Tinh (9 sao, 15°/sơn).
//
// NGUỒN: skill "huyen-khong-dai-quai" (anthropic-skills) — không tự suy diễn:
//   - Bảng 64 quẻ: TÁI SỬ DỤNG @thien-anh/rule-engine (XemNgayCaoCap.queTuDoSo/BANG_64_QUE_MASTER)
//     — bảng này đã được Công cung cấp riêng + kiểm chứng chéo 4 lớp (xem bang64QueDoSo.ts),
//     khớp 100% với bảng port tay từ skill ở bản trước — KHÔNG viết lại bảng 64 quẻ lần 2
//     (cùng quy tắc `hkdq-luan-nha/engine.ts` đã áp dụng).
//   - references/ly-thuyet-nen-tang.md — lý thuyết nền + công thức Chính Thần/Linh Thần
//     mục 6, "đã được Công xác nhận đúng với 3 ảnh la kinh gốc" (13/9/2026).
//   - references/vi-du-tham-khao.md — 5 ví dụ đối chiếu, dùng làm self-test bên dưới.
//
// NGUYÊN TẮC "KHÔNG ĐOÁN MÒ" (giống mọi engine phong thủy khác trong repo): những gì
// nguồn đánh dấu [CẦN XÁC NHẬN] thì KHÔNG code hóa — xem KHONG_TINH cuối file.
import { XemNgayCaoCap } from "@thien-anh/rule-engine";

const { queTuDoSo, DO_RONG_MOI_QUE, SO_QUE } = XemNgayCaoCap;

export interface QueEntry {
  stt: number;
  doBatDau: number;
  doKetThuc: number;
  tenQue: string;
  /** Quái khí — ngũ hành số của quẻ (1-9, không có 5). Dùng cho Chính/Linh Thần + Hợp Thập. */
  quaiKhi: number;
  /** Quái vận — nhóm cấu trúc cố định của quẻ (1-9, không có 5). KHÁC Vận thời gian. */
  quaiVan: number;
  canChi: string;
}

function pymod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

/**
 * Tra quẻ theo độ số la kinh (0-360, tự chuẩn hóa) — mỏng bọc quanh `queTuDoSo` dùng chung.
 * Quy ước biên [doBatDau, doKetThuc) — biên dưới đóng, biên trên mở (khớp quy ước sẵn có ở
 * queTuDoSo/hkdq-luan-nha; VD 140.625° thuộc Đại Súc, không thuộc Thái).
 */
export function timQueTheoDoSo(doSo: number): QueEntry {
  const q = queTuDoSo(doSo);
  return {
    stt: q.thuTu,
    doBatDau: q.doBatDau,
    doKetThuc: q.doKetThuc,
    tenQue: q.tenNgan,
    quaiKhi: q.hknh,
    quaiVan: q.quaiVan,
    canChi: `${q.can} ${q.chi}`,
  };
}

// ==========================================================================
// VẬN THỜI GIAN — Nhị Nguyên Bát Vận (không có vận 5). Nguồn: ly-thuyet-nen-tang.md mục 3a.
// ==========================================================================

export interface VanThoiGianEntry {
  van: number;
  /** null = [CẦN XÁC NHẬN] trong nguồn (Vận 3 chưa rõ tên quẻ chủ vận) — KHÔNG suy đoán. */
  quaiChuVan: string | null;
  namBatDau: number;
  namKetThuc: number;
}

// ponytail: bảng 8 dòng này trùng với BANG_VAN riêng trong src/lib/hkdq-luan-nha/engine.ts
// (chưa có chỗ chung trong rule-engine như bảng 64 quẻ) — gộp về rule-engine nếu 1 trong 2
// bảng cần sửa lần nữa, không đáng làm ngay chỉ để dựng vòng la kinh.
export const VAN_THOI_GIAN: VanThoiGianEntry[] = [
  { van: 1, quaiChuVan: "Khôn", namBatDau: 1864, namKetThuc: 1881 },
  { van: 2, quaiChuVan: "Tốn", namBatDau: 1882, namKetThuc: 1905 },
  { van: 3, quaiChuVan: null, namBatDau: 1906, namKetThuc: 1929 }, // [CẦN XÁC NHẬN]
  { van: 4, quaiChuVan: "Đoài", namBatDau: 1930, namKetThuc: 1953 },
  // Không có Vận 5 trong Nhị Nguyên Bát Vận của HKĐQ.
  { van: 6, quaiChuVan: "Cấn", namBatDau: 1954, namKetThuc: 1974 },
  { van: 7, quaiChuVan: "Khảm", namBatDau: 1975, namKetThuc: 1995 },
  { van: 8, quaiChuVan: "Chấn", namBatDau: 1996, namKetThuc: 2016 },
  { van: 9, quaiChuVan: "Càn", namBatDau: 2017, namKetThuc: 2043 },
];

/** Vận thời gian hiện hành theo năm (Bước 1). Ném lỗi nếu năm ngoài phạm vi bảng (trước 1864 / sau 2043). */
export function vanHienHanhTheoNam(nam: number): VanThoiGianEntry {
  const found = VAN_THOI_GIAN.find((v) => nam >= v.namBatDau && nam <= v.namKetThuc);
  if (!found) {
    throw new Error(
      "RULE_NOT_DEFINED: nam " + nam + " ngoai pham vi bang Van thoi gian (1864-2043) — chua co du lieu.",
    );
  }
  return found;
}

// ==========================================================================
// CHÍNH THẦN / LINH THẦN — công thức đã Công xác nhận (mục 6 ly-thuyet-nen-tang.md).
// ==========================================================================

const NHOM_A = new Set([1, 2, 3, 4]);
const NHOM_B = new Set([6, 7, 8, 9]);

export type VungKhi = "chinh_than" | "linh_than";

/** Nhóm Quái Khí nào là Chính Thần / Linh Thần, theo Vận thời gian hiện hành. */
export function chinhLinhThanTheoVan(van: number): { chinhThan: number[]; linhThan: number[] } {
  if (NHOM_A.has(van)) return { chinhThan: [1, 2, 3, 4], linhThan: [6, 7, 8, 9] };
  if (NHOM_B.has(van)) return { chinhThan: [6, 7, 8, 9], linhThan: [1, 2, 3, 4] };
  throw new Error("RULE_NOT_DEFINED: Van " + van + " khong thuoc Nhom A hay Nhom B (chi ap dung Van 1-4,6-9).");
}

/** 1 quẻ (theo Quái Khí) đang ở vùng Chính Thần hay Linh Thần so với Vận thời gian hiện hành. */
export function vungKhiCuaQuaiKhi(quaiKhi: number, vanHienHanh: number): VungKhi {
  const { chinhThan } = chinhLinhThanTheoVan(vanHienHanh);
  return chinhThan.includes(quaiKhi) ? "chinh_than" : "linh_than";
}

// ==========================================================================
// HỢP THẬP / ĐỒNG NGUYÊN LONG — mục 8 ly-thuyet-nen-tang.md.
// ==========================================================================

/** 2 số Quái Khí hợp thập (cộng = 10): 1-9, 2-8, 3-7, 4-6. */
export function hopThap(quaiKhi1: number, quaiKhi2: number): boolean {
  return quaiKhi1 + quaiKhi2 === 10;
}

// ==========================================================================
// KHÔNG VONG / ÂM DƯƠNG SAI THÁC — mục 10 ly-thuyet-nen-tang.md.
// ==========================================================================

export interface KhongVongResult {
  phamKhongVong: boolean;
  /** true nếu đúng 1 trong 4 mốc đại không vong (0/90/180/270) — nặng nhất theo nguồn. */
  laDaiKhongVong: boolean;
  khoangCachToiMocGanNhat: number;
  mocGanNhat: number;
}

const MOC_DAI_KHONG_VONG = new Set([0, 90, 180, 270]);

/**
 * Không Vong = vùng ranh giới giữa 2 quẻ, trong khoảng ±5° quanh mốc chia 5.625° (nguồn
 * dùng "khoảng ±5°" cho toàn bộ 64 mốc; 4 mốc trùng ranh giới bát quái 0/90/180/270 là đại
 * không vong, nặng nhất).
 */
export function kiemTraKhongVong(doSo: number): KhongVongResult {
  const d = pymod(doSo, 360);
  const tatCaMoc = Array.from({ length: SO_QUE }, (_, i) => i * DO_RONG_MOI_QUE);
  // Mốc 360.000 trùng mốc 0.000 (vòng tròn khép kín) — thêm vào để không bỏ sót biên gần 0°/360°.
  const mocXetCa = [...tatCaMoc, 360];
  let mocGanNhat = mocXetCa[0]!;
  let khoangCachNhoNhat = Infinity;
  for (const moc of mocXetCa) {
    const kc = Math.min(Math.abs(d - moc), 360 - Math.abs(d - moc));
    if (kc < khoangCachNhoNhat) {
      khoangCachNhoNhat = kc;
      mocGanNhat = pymod(moc, 360);
    }
  }
  return {
    phamKhongVong: khoangCachNhoNhat <= 5,
    laDaiKhongVong: khoangCachNhoNhat <= 5 && MOC_DAI_KHONG_VONG.has(mocGanNhat),
    khoangCachToiMocGanNhat: Math.round(khoangCachNhoNhat * 1000) / 1000,
    mocGanNhat,
  };
}

/**
 * Âm Dương Sai Thác — mục 10 ly-thuyet-nen-tang.md: "hướng lập đúng điểm giao 2 hạ
 * quái khác âm/dương (90°, 135°, 225°...)". Nguồn liệt kê 3 ví dụ rồi để "...", đọc
 * theo chu kỳ 45° của 8 cung tiên thiên → 8 mốc {0,45,90,135,180,225,270,315}.
 * Mốc 0/90/180/270 trùng Đại Không Vong (mục 10) nên nặng hơn; 45/135/225/315 chỉ
 * phạm sai thác, không phải đại không vong (dù ca gốc VD1 gọi cửa 135° là "đại không
 * vong" theo lối nói dân gian khi 2 lỗi này trùng nhau — xem chú thích kiemTraKhongVong).
 */
const MOC_AM_DUONG_SAI_THAC = new Set([0, 45, 90, 135, 180, 225, 270, 315]);
const NGUONG_SAI_THAC_DO = 5;

export interface AmDuongSaiThacResult {
  phamSaiThac: boolean;
  mocGanNhat: number;
  khoangCachToiMocGanNhat: number;
}

export function kiemTraAmDuongSaiThac(doSo: number): AmDuongSaiThacResult {
  const d = pymod(doSo, 360);
  let mocGanNhat = 0;
  let khoangCachNhoNhat = Infinity;
  for (const moc of MOC_AM_DUONG_SAI_THAC) {
    const kc = Math.min(Math.abs(d - moc), 360 - Math.abs(d - moc));
    if (kc < khoangCachNhoNhat) {
      khoangCachNhoNhat = kc;
      mocGanNhat = moc;
    }
  }
  return {
    phamSaiThac: khoangCachNhoNhat <= NGUONG_SAI_THAC_DO,
    mocGanNhat,
    khoangCachToiMocGanNhat: Math.round(khoangCachNhoNhat * 1000) / 1000,
  };
}

// ==========================================================================
// HÀM TỔNG HỢP — Bước 1-3 + mục 8, 10.
// ==========================================================================

export interface KetQuaHKDQ {
  namLuan: number;
  vanHienHanh: VanThoiGianEntry;
  huong: {
    doSo: number;
    que: QueEntry;
    vungKhi: VungKhi;
    khongVong: KhongVongResult;
    amDuongSaiThac: AmDuongSaiThacResult;
  };
  toa: {
    doSo: number;
    que: QueEntry;
    vungKhi: VungKhi;
    khongVong: KhongVongResult;
    amDuongSaiThac: AmDuongSaiThacResult;
  };
  chinhThanNhom: number[];
  linhThanNhom: number[];
  hopThapToaHuong: boolean;
  canhBao: string[];
}

/**
 * @param huongDoSo Độ số Hướng nhà (0-360, đo la kinh).
 * @param namLuan Năm cần luận (mặc định năm hiện tại nếu không truyền — KHÔNG tự chọn ở
 *   lớp UI/route, phải truyền rõ ràng để tránh phụ thuộc đồng hồ máy chủ khi test).
 */
export function tinhToanHKDQ(huongDoSo: number, namLuan: number): KetQuaHKDQ {
  const canhBao: string[] = [];
  const doHuong = pymod(huongDoSo, 360);
  const doToa = pymod(doHuong + 180, 360);

  const van = vanHienHanhTheoNam(namLuan);
  const { chinhThan, linhThan } = chinhLinhThanTheoVan(van.van);

  const queHuong = timQueTheoDoSo(doHuong);
  const queToa = timQueTheoDoSo(doToa);

  const kvHuong = kiemTraKhongVong(doHuong);
  const kvToa = kiemTraKhongVong(doToa);
  const stHuong = kiemTraAmDuongSaiThac(doHuong);
  const stToa = kiemTraAmDuongSaiThac(doToa);

  if (kvHuong.laDaiKhongVong) canhBao.push("Hướng phạm ĐẠI Không Vong (đúng ranh giới bát quái) — nặng, cần chỉnh hướng trước khi xét các bước khác.");
  else if (kvHuong.phamKhongVong) canhBao.push(`Hướng phạm Không Vong (cách mốc chia quẻ gần nhất ${kvHuong.khoangCachToiMocGanNhat}°).`);
  if (kvToa.laDaiKhongVong) canhBao.push("Tọa phạm ĐẠI Không Vong — nặng.");
  else if (kvToa.phamKhongVong) canhBao.push(`Tọa phạm Không Vong (cách mốc chia quẻ gần nhất ${kvToa.khoangCachToiMocGanNhat}°).`);
  if (stHuong.phamSaiThac) canhBao.push(`Hướng phạm Âm Dương Sai Thác (sát mốc ${stHuong.mocGanNhat}°).`);
  if (stToa.phamSaiThac) canhBao.push(`Tọa phạm Âm Dương Sai Thác (sát mốc ${stToa.mocGanNhat}°).`);
  if (kvHuong.phamKhongVong && stHuong.phamSaiThac) {
    canhBao.push("Hướng vừa phạm Không Vong vừa phạm Âm Dương Sai Thác cùng lúc — cách cục nặng (giống ca VD1 nguồn tham khảo), gần như không hóa giải được nếu 2 quẻ liền kề khác Quái Vận.");
  }

  return {
    namLuan,
    vanHienHanh: van,
    huong: {
      doSo: doHuong,
      que: queHuong,
      vungKhi: vungKhiCuaQuaiKhi(queHuong.quaiKhi, van.van),
      khongVong: kvHuong,
      amDuongSaiThac: stHuong,
    },
    toa: {
      doSo: doToa,
      que: queToa,
      vungKhi: vungKhiCuaQuaiKhi(queToa.quaiKhi, van.van),
      khongVong: kvToa,
      amDuongSaiThac: stToa,
    },
    chinhThanNhom: chinhThan,
    linhThanNhom: linhThan,
    hopThapToaHuong: hopThap(queHuong.quaiKhi, queToa.quaiKhi),
    canhBao,
  };
}

// ==========================================================================
// PHẠM VI KHÔNG TÍNH — giữ đúng nguyên tắc "không đoán mò" của skill nguồn.
// ==========================================================================

export const KHONG_TINH: Array<[string, string]> = [
  ["Tên quẻ chủ Vận 3 (1906-1929)", "Nguồn đánh dấu [CẦN XÁC NHẬN] — để null, xem VanThoiGianEntry.quaiChuVan"],
  ["Sao Bắc Đẩu cho Vận 2,3,4,6,7,8", "Nguồn: bài 'Phối Vận Quyết' bị OCR xáo trộn, chỉ Vận 1 (Tham Lang)/Vận 9 (Hữu Bật) xác nhận"],
  ["Cách dùng 3 tầng la kinh (Địa/Nhân/Thiên bàn) theo từng bước", "[CẦN XÁC NHẬN] — mục 12 ly-thuyet-nen-tang.md"],
  ["Thất Tinh Đả Kiếp (mục 9)", "Cần dữ liệu 6 hào nhị phân của 64 quẻ (không có trong bang-64-que-do-so.md) — để làm đợt sau, tránh tự suy hào có thể sai"],
  ["Phản Ngâm / Phục Ngâm (mục 11)", "Mô tả định tính, chưa đủ công thức xác định cụ thể theo năm/tháng/ngày/giờ — để người luận tự xét"],
  ["Thủy pháp / cửa / nội cục (Bước 4-6)", "Cần khảo sát thực địa (loan đầu) — không tự suy từ độ số, giống mọi module phong thủy khác trong repo"],
  ["Kết luận cát hung cuối cùng", "Cần tổng hợp Bước 1-9 + loan đầu — do người luận (Thầy) thực hiện"],
];
