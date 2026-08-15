/**
 * MODULE THU PHÍ — Xem Ngày Cao Cấp (Động Thổ / Nhập Trạch) theo Huyền Không Đại Quái.
 * Đặc tả chủ dự án cung cấp 2026-08-14. Phạm vi ĐÃ THU HẸP theo quyết định của Công: chỉ chạy
 * Bước 2 → 5 của skill `xem-ngay-cao-cap` (BỎ Bước 1 thần sát dân gian — khi đã luận Đại Quái thì
 * không cần lớp lọc dân gian song song). Bước 6 (chọn giờ) tạm chưa làm: nguồn ghi rõ phần "phép
 * tính giờ Hoàng Đạo" bằng thơ quyết bị lỗi OCR, chưa đủ tin cậy để code (đặc tả mục 5).
 *
 * Chế độ hiện có: `giam_dinh` — giám định 1 ngày cụ thể. Chế độ `tim_ngay` (quét khoảng, xếp
 * hạng) chưa làm ở phiên bản này.
 */
import { Data, getCanChi, getLunarDate } from "@thien-anh/calendar-core";
import { Scoring, XemNgayCaoCap } from "@thien-anh/rule-engine";

type Can = Data.Can;
type Chi = Data.Chi;
type TenSon = XemNgayCaoCap.TenSon;
type PhuongChinh = XemNgayCaoCap.PhuongChinh;
type CungBatQuai = XemNgayCaoCap.CungBatQuai;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

export type LoaiViec = "dong_tho" | "nhap_trach";

export interface XemNgayCaoCapInput {
  loaiViec: LoaiViec;
  /** 1 trong 24 sơn — dùng cho Bước 2 (khung tháng) và Bước 3 (phương vị sát). */
  toaNha: TenSon;
  /** Độ số la bàn thực tế (0-359.99) — BẮT BUỘC nếu toaNha là 1 trong 4 sơn duy (Cấn/Tốn/Khôn/Càn). */
  toaDoSo?: number;
  /**
   * Cặp HKNH/Quái Vận của QUẺ TỌA, đọc từ la kinh 64 quẻ (hệ 384 hào) theo độ số thực đo.
   * BẮT BUỘC cho Bước 5 — không suy ra được từ tên sơn (xem GHI_CHU_TOA_QUE ở rule-engine).
   * Bỏ trống → Bước 5 trả `thieu_du_lieu` thay vì luận sai.
   */
  toaQue?: { hknh: number; quaiVan: number };
  /** Hướng nhà — nên có để lọc Ngũ Hoàng/Tam Sát đáo Hướng. */
  huongNha?: TenSon;
  namSinhGiaChuChinh: number;
  namSinhVoChong?: number;
  /** Ngày dương lịch cần giám định. */
  ngayGiamDinh: { nam: number; thang: number; ngay: number };
  timeZone?: string;
}

export interface TruQue {
  can: Can;
  chi: Chi;
  que: string;
  hknh: number;
  quaiVan: number;
}

export interface MenhChuQue {
  canChiNamSinh: string;
  que: string;
  hknh: number;
  quaiVan: number;
}

export type TrangThaiBuoc = "dat" | "khong_dat" | "thieu_du_lieu";

export interface BuocKetQua {
  buoc: 2 | 3 | 4 | 5 | 6;
  ten: string;
  trangThai: TrangThaiBuoc;
  lyDo: string;
}

export interface GioDeXuat {
  chiGio: string;
  khungGio: string;
  laHoangDao: boolean;
  tenSao: string;
  hopCucVoiToa: "tam-hop" | "luc-hop" | null;
  xungChiNgay: boolean;
  phamTamSatGio: boolean;
  diem: number;
}

export interface XemNgayCaoCapResult {
  ngayDuongLich: { nam: number; thang: number; ngay: number };
  amLich: { ngay: number; thang: number; nam: number; nhuan: boolean };
  tuTru: { nam: TruQue; thang: TruQue; ngay: TruQue };
  toaNha: { ten: TenSon; cung: CungBatQuai; phuong: PhuongChinh | null; hknh: number | null; quaiVan: number | null };
  huongNha?: { ten: TenSon; cung: CungBatQuai };
  menhChuChinh: MenhChuQue;
  menhChuPhu?: MenhChuQue;
  ketLuan: "dung_duoc" | "khong_dung" | "dung_duoc_co_dieu_kien";
  chieuTungBuoc: BuocKetQua[];
  diemManh: string[];
  diemLuuY: string[];
  /** Bước 6 — 12 giờ đã xếp hạng (tốt nhất trước). */
  gioDeXuat: GioDeXuat[];
}

/**
 * Với Can Chi mang 2 quẻ (Giáp Tý/Giáp Ngọ/Canh Dần/Canh Thân), nguồn yêu cầu "lấy quẻ nào tạo
 * cách cục hợp lý và PHẢI GHI RÕ đã chọn quẻ nào". Ở đây chọn quẻ đầu tiên và ghi chú vào
 * `diemLuuY` để người luận biết mà đối chiếu lại — không im lặng chọn ngầm.
 */
function chonQue(can: Can, chi: Chi): { que: XemNgayCaoCap.QueHknhQuaiVan; coNhieuLuaChon: boolean } {
  const ds = XemNgayCaoCap.traCanChi(can, chi);
  return { que: ds[0]!, coNhieuLuaChon: ds.length > 1 };
}

function toTruQue(can: Can, chi: Chi): { tru: TruQue; coNhieuLuaChon: boolean } {
  const { que, coNhieuLuaChon } = chonQue(can, chi);
  return { tru: { can, chi, que: que.que, hknh: que.hknh, quaiVan: que.quaiVan }, coNhieuLuaChon };
}

function moTaQuanHe(qh: XemNgayCaoCap.QuanHeHknh | XemNgayCaoCap.SinhKhac): string {
  const bang: Record<string, string> = {
    nhat_quai_thuan_thanh: "Nhất Quái Thuần Thanh (đồng số HKNH — đẹp nhất)",
    ha_do: "Hà Đồ / Sinh Thành",
    hop_thap: "Hợp Thập",
    hop_thap_7_3: "Hợp Thập cặp 7-3 (miễn cưỡng — Khảm/Ly không hợp)",
    khong_giao: "không giao",
    sinh_nhap: "sinh nhập (tốt)",
    khac_nhap: "khắc nhập (tốt)",
    sinh_xuat: "sinh xuất (xấu)",
    khac_xuat: "khắc xuất (xấu)",
    binh_hoa: "bình hòa (không sinh không khắc)",
  };
  return bang[qh] ?? qh;
}

export function calculateXemNgayCaoCap(input: XemNgayCaoCapInput): XemNgayCaoCapResult {
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;
  const { nam, thang, ngay } = input.ngayGiamDinh;

  const chieuTungBuoc: BuocKetQua[] = [];
  const diemManh: string[] = [];
  const diemLuuY: string[] = [];

  // ----- Nền: Tứ Trụ thật + âm lịch -----
  const canChi = getCanChi({ year: nam, month: thang, day: ngay, hour: 12, timeZone });
  const lunar = getLunarDate({ year: nam, month: thang, day: ngay, timeZone });

  const truNamRaw = toTruQue(canChi.year.can, canChi.year.chi);
  const truThangRaw = toTruQue(canChi.month.can, canChi.month.chi);
  const truNgayRaw = toTruQue(canChi.day.can, canChi.day.chi);
  for (const [ten, r] of [
    ["Năm", truNamRaw],
    ["Tháng", truThangRaw],
    ["Ngày", truNgayRaw],
  ] as const) {
    if (r.coNhieuLuaChon) {
      diemLuuY.push(
        `Trụ ${ten} (${r.tru.can} ${r.tru.chi}) có 2 quẻ hợp lệ trong bảng 60 Giáp Tý — hệ thống đang dùng quẻ "${r.tru.que}" (${r.tru.hknh}/${r.tru.quaiVan}). Cần đối chiếu lại nếu muốn dùng quẻ còn lại.`,
      );
    }
  }
  const truNam = truNamRaw.tru;
  const truThang = truThangRaw.tru;
  const truNgay = truNgayRaw.tru;

  // ----- Tọa / Hướng -----
  const cungToa = XemNgayCaoCap.cungCuaSon(input.toaNha);
  const queToa = input.toaQue ?? null;
  if (!queToa) {
    diemLuuY.push(
      "Chưa nhập quẻ Tọa (HKNH/Quái Vận đọc từ la kinh 64 quẻ) — Bước 5 không luận được cách cục. Trong Huyền Không Đại Quái mỗi sơn 15° còn chia nhỏ theo hệ 384 hào, nên TÊN SƠN KHÔNG ĐỦ để suy ra quẻ tọa (ngay trong tài liệu gốc, cùng tọa Ất có bài ghi quẻ 6/9, bài khác ghi 7/8). Hệ thống không suy đoán để tránh luận sai toàn bộ.",
    );
  }
  const phuongToaRaw = XemNgayCaoCap.phuongTuSon(input.toaNha);
  const phuongToa: PhuongChinh | null =
    phuongToaRaw.phuong ?? (input.toaDoSo !== undefined ? XemNgayCaoCap.phuongTuDoSo(input.toaDoSo) : null);
  const cungHuong = input.huongNha ? XemNgayCaoCap.cungCuaSon(input.huongNha) : null;

  // ----- Mệnh Chủ (quy năm sinh dương lịch → Can Chi → quẻ) -----
  function menhChuTuNamSinh(namSinh: number): MenhChuQue {
    const can = Scoring.getCan(namSinh);
    const chi = Scoring.getChi(namSinh);
    const { que, coNhieuLuaChon } = chonQue(can, chi);
    if (coNhieuLuaChon) {
      diemLuuY.push(
        `Mệnh Chủ sinh ${namSinh} (${can} ${chi}) có 2 quẻ hợp lệ — đang dùng "${que.que}" (${que.hknh}/${que.quaiVan}).`,
      );
    }
    return { canChiNamSinh: `${can} ${chi}`, que: que.que, hknh: que.hknh, quaiVan: que.quaiVan };
  }
  const menhChuChinh = menhChuTuNamSinh(input.namSinhGiaChuChinh);
  const menhChuPhu = input.namSinhVoChong !== undefined ? menhChuTuNamSinh(input.namSinhVoChong) : undefined;

  // =============================================================================================
  // BƯỚC 3 — phương vị sát (bộ lọc phủ quyết, chạy TRƯỚC Bước 5 theo đúng bài học Bài 4 của nguồn)
  // =============================================================================================
  const phamSat: string[] = [];
  let thieuDuLieuSat = false;

  // Ngũ Hoàng — chỉ xét Năm và Tháng.
  const nhNam = XemNgayCaoCap.traNguHoangNam(nam);
  if (!nhNam.tinhDuocKhong) {
    thieuDuLieuSat = true;
    diemLuuY.push(`Ngũ Hoàng năm: ${nhNam.lyDo}`);
  } else if (nhNam.cungNguHoang === cungToa) {
    phamSat.push(`Ngũ Hoàng năm đáo Tọa (cung ${cungToa}) — không có phép hóa giải`);
  } else if (cungHuong && nhNam.cungNguHoang === cungHuong) {
    phamSat.push(`Ngũ Hoàng năm đáo Hướng (cung ${cungHuong}) — không có phép hóa giải`);
  }

  const nhThang = XemNgayCaoCap.traNguHoangThang(nam, truThang.can, truThang.chi);
  if (!nhThang.tinhDuocKhong) {
    thieuDuLieuSat = true;
    diemLuuY.push(`Ngũ Hoàng tháng: ${nhThang.lyDo}`);
  } else if (nhThang.cungNguHoang === cungToa) {
    phamSat.push(`Ngũ Hoàng tháng đáo Tọa (cung ${cungToa}) — không có phép hóa giải`);
  } else if (cungHuong && nhThang.cungNguHoang === cungHuong) {
    phamSat.push(`Ngũ Hoàng tháng đáo Hướng (cung ${cungHuong}) — không có phép hóa giải`);
  }

  // Tam Sát — xét cả 3 trụ Năm/Tháng/Ngày (Giờ chưa có ở chế độ giám định ngày).
  if (phuongToa === null) {
    thieuDuLieuSat = true;
    diemLuuY.push(
      `Tọa "${input.toaNha}" là sơn duy (nằm đúng ranh giới 2 phương) — cần nhập ĐỘ SỐ la bàn thực tế mới xét được Tam Sát và Bước 2. Hệ thống không tự suy đoán.`,
    );
  } else {
    for (const [tenTru, tru] of [
      ["Năm", truNam],
      ["Tháng", truThang],
      ["Ngày", truNgay],
    ] as const) {
      if (XemNgayCaoCap.phamTamSat(phuongToa, tru.chi)) {
        phamSat.push(`Tam Sát: Chi ${tru.chi} của trụ ${tenTru} phạm Tam Sát của tọa phương ${phuongToa}`);
      }
    }
  }

  // Bát Sát — xét cả 3 trụ, theo cung Tọa (và cung Hướng nếu có).
  for (const [tenTru, tru] of [
    ["Năm", truNam],
    ["Tháng", truThang],
    ["Ngày", truNgay],
  ] as const) {
    if (XemNgayCaoCap.phamBatSat(cungToa, tru.can, tru.chi)) {
      phamSat.push(`Bát Sát Hoàng Tuyền: trụ ${tenTru} (${tru.can} ${tru.chi}) phạm Bát Sát của cung Tọa ${cungToa}`);
    }
    if (cungHuong && XemNgayCaoCap.phamBatSat(cungHuong, tru.can, tru.chi)) {
      phamSat.push(`Bát Sát Hoàng Tuyền: trụ ${tenTru} (${tru.can} ${tru.chi}) phạm Bát Sát của cung Hướng ${cungHuong}`);
    }
  }

  // Thái Tuế / Tuế Phá — chỉ xét Năm.
  if (XemNgayCaoCap.phamThaiTue(input.toaNha, truNam.chi)) phamSat.push(`Thái Tuế đáo Tọa (${input.toaNha} trùng Chi năm ${truNam.chi})`);
  if (XemNgayCaoCap.phamTuePha(input.toaNha, truNam.chi)) phamSat.push(`Tuế Phá đáo Tọa (${input.toaNha} xung Chi năm ${truNam.chi})`);
  if (input.huongNha) {
    if (XemNgayCaoCap.phamThaiTue(input.huongNha, truNam.chi)) phamSat.push(`Thái Tuế đáo Hướng (${input.huongNha})`);
    if (XemNgayCaoCap.phamTuePha(input.huongNha, truNam.chi)) phamSat.push(`Tuế Phá đáo Hướng (${input.huongNha})`);
  }

  // Mậu Kỷ Đô Thiên + Âm Phủ Thái Tuế — theo Can năm, xét Tọa (và Hướng).
  const mkToa = XemNgayCaoCap.kiemMauKyDoThien(truNam.can, input.toaNha);
  if (mkToa.phamMau) phamSat.push(`Mậu Đô Thiên Sát đáo Tọa (${input.toaNha})`);
  if (mkToa.phamKy) phamSat.push(`Kỷ Đô Thiên Sát đáo Tọa (${input.toaNha})`);
  if (mkToa.phamBang) diemLuuY.push(`Tọa ${input.toaNha} phạm Bàng Mậu Kỷ Đô Thiên (mức nhẹ hơn Chính) — nên lưu ý.`);
  const apToa = XemNgayCaoCap.kiemAmPhuThaiTue(truNam.can, input.toaNha);
  if (apToa.phamChinh) phamSat.push(`Chính Âm Phủ Thái Tuế đáo Tọa (${input.toaNha}) — tối kỵ khai sơn lập hướng`);
  if (apToa.phamBang) diemLuuY.push(`Tọa ${input.toaNha} phạm Bàng Âm Phủ Thái Tuế (mức nhẹ hơn) — nên lưu ý.`);

  const buoc3Dat = phamSat.length === 0;
  chieuTungBuoc.push({
    buoc: 3,
    ten: "Kiểm phương vị sát (Ngũ Hoàng / Tam Sát / Bát Sát / Thái Tuế / Tuế Phá / Mậu Kỷ Đô Thiên / Âm Phủ Thái Tuế)",
    trangThai: buoc3Dat ? (thieuDuLieuSat ? "thieu_du_lieu" : "dat") : "khong_dat",
    lyDo: buoc3Dat
      ? thieuDuLieuSat
        ? "Không phát hiện sát ở các mục tra được, NHƯNG còn mục thiếu dữ liệu (xem Điểm cần lưu ý) — chưa thể kết luận an toàn tuyệt đối."
        : "Không phạm sát nào ở Tọa và Hướng."
      : phamSat.join(" · "),
  });

  // =============================================================================================
  // BƯỚC 2 — khung tháng theo Tọa (không loại cứng, chỉ xếp hạng)
  // =============================================================================================
  if (phuongToa === null) {
    chieuTungBuoc.push({
      buoc: 2,
      ten: "Khung tháng theo Tọa",
      trangThai: "thieu_du_lieu",
      lyDo: `Chưa xác định được phương của tọa "${input.toaNha}" (sơn duy, cần độ số la bàn).`,
    });
  } else {
    const nhan = XemNgayCaoCap.nhanThangTheoToa(phuongToa, truThang.chi);
    const tenNhom: Record<string, string> = {
      tu_hop: "Tự hợp theo mùa (ưu tiên cao nhất — nhất khí thuần thanh)",
      sinh_hop: "Sinh hợp theo mùa",
      tam_hop: "Tam hợp theo mùa",
    };
    if (nhan.nhom) diemManh.push(`Tháng ${truThang.chi} thuộc nhóm ${tenNhom[nhan.nhom]} của tọa phương ${phuongToa}.`);
    if (nhan.laTuMo) {
      diemLuuY.push(
        `Tháng ${truThang.chi} là tháng Tứ Mộ — nửa đầu tháng còn khí mùa trước, nửa sau mới chuyển sang khí Thổ. Cần xác định rõ đang dùng nửa nào (ranh giới theo tiết khí) trước khi chốt ngày.`,
      );
    }
    chieuTungBuoc.push({
      buoc: 2,
      ten: "Khung tháng theo Tọa",
      trangThai: nhan.nhom ? "dat" : "khong_dat",
      lyDo: nhan.nhom
        ? `Tháng ${truThang.chi} thuộc nhóm ${tenNhom[nhan.nhom]}.`
        : `Tháng ${truThang.chi} không thuộc nhóm tháng ưu tiên nào của tọa phương ${phuongToa} (không loại ngày, chỉ xếp hạng thấp hơn).`,
    });
  }

  // =============================================================================================
  // BƯỚC 4 — đã quy xong Tứ Trụ + Tọa + Mệnh Chủ về HKNH/Quái Vận ở trên
  // =============================================================================================
  chieuTungBuoc.push({
    buoc: 4,
    ten: "Quy Tứ Trụ / Tọa / Mệnh Chủ về HKNH — Quái Vận",
    trangThai: queToa ? "dat" : "thieu_du_lieu",
    lyDo: `Năm ${truNam.can} ${truNam.chi} (${truNam.hknh}/${truNam.quaiVan}) · Tháng ${truThang.can} ${truThang.chi} (${truThang.hknh}/${truThang.quaiVan}) · Ngày ${truNgay.can} ${truNgay.chi} (${truNgay.hknh}/${truNgay.quaiVan}) · Tọa ${queToa ? `${queToa.hknh}/${queToa.quaiVan}` : "CHƯA CÓ (cần đọc từ la kinh 64 quẻ)"} · Mệnh Chủ ${menhChuChinh.hknh}/${menhChuChinh.quaiVan}`,
  });

  // =============================================================================================
  // BƯỚC 5 — luận cách cục HKĐQ
  // =============================================================================================
  const lyDo5: string[] = [];
  let buoc5Dat = true;

  // 5a — địa chi Tứ Trụ không xung nhau, không xung năm sinh mệnh chủ (chiều 1 chiều: Năm→Tháng/Ngày, Tháng→Ngày).
  const LUC_XUNG: Record<Chi, Chi> = {
    Tý: "Ngọ", Sửu: "Mùi", Dần: "Thân", Mão: "Dậu", Thìn: "Tuất", Tỵ: "Hợi",
    Ngọ: "Tý", Mùi: "Sửu", Thân: "Dần", Dậu: "Mão", Tuất: "Thìn", Hợi: "Tỵ",
  };
  const capXung: string[] = [];
  if (LUC_XUNG[truNam.chi] === truThang.chi) capXung.push("Năm xung Tháng");
  if (LUC_XUNG[truNam.chi] === truNgay.chi) capXung.push("Năm xung Ngày");
  if (LUC_XUNG[truThang.chi] === truNgay.chi) capXung.push("Tháng xung Ngày");
  const chiMenhChinh = Scoring.getChi(input.namSinhGiaChuChinh);
  for (const [tenTru, tru] of [
    ["Năm", truNam],
    ["Tháng", truThang],
    ["Ngày", truNgay],
  ] as const) {
    if (LUC_XUNG[tru.chi] === chiMenhChinh) capXung.push(`Trụ ${tenTru} (${tru.chi}) xung năm sinh gia chủ (${chiMenhChinh})`);
  }
  if (capXung.length > 0) {
    buoc5Dat = false;
    lyDo5.push(`5a — Địa chi xung: ${capXung.join(", ")}.`);
  } else {
    lyDo5.push("5a — Địa chi Tứ Trụ không xung nhau và không xung năm sinh gia chủ.");
  }

  // 5e — Tam Tài: Nhật Khóa PHẢI giao Sơn Gia VÀ giao Mệnh Chủ chính (điều kiện bắt buộc).
  // Khi so Ngày ↔ Tọa: Tọa là "chủ". Khi so Ngày ↔ Mệnh Chủ: theo nguồn ưu tiên "Ngày sinh Chủ" → Mệnh Chủ là "chủ".
  const giaoNgayMenh = XemNgayCaoCap.xetGiao(truNgay.hknh, menhChuChinh.hknh, menhChuChinh.hknh);
  if (queToa) {
    const giaoNgayToa = XemNgayCaoCap.xetGiao(truNgay.hknh, queToa.hknh, queToa.hknh);
    if (giaoNgayToa.giaoDuoc) {
      diemManh.push(`Nhật Khóa giao được Sơn Gia (Tọa): ${moTaQuanHe(giaoNgayToa.mucDat)}.`);
    } else {
      buoc5Dat = false;
      lyDo5.push(`5e — Nhật Khóa KHÔNG giao được Sơn Gia (Ngày ${truNgay.hknh} ↔ Tọa ${queToa.hknh}).`);
    }
  } else {
    lyDo5.push("5e — Chưa xét được Nhật Khóa ↔ Sơn Gia vì thiếu quẻ Tọa.");
  }
  if (giaoNgayMenh.giaoDuoc) {
    diemManh.push(`Nhật Khóa giao được Mệnh Chủ chính: ${moTaQuanHe(giaoNgayMenh.mucDat)}.`);
  } else {
    buoc5Dat = false;
    lyDo5.push(`5e — Nhật Khóa KHÔNG giao được Mệnh Chủ chính (Ngày ${truNgay.hknh} ↔ Mệnh Chủ ${menhChuChinh.hknh}). Theo nguồn: giao Sơn Gia mà không giao Mệnh Chủ thì KHÔNG chọn — hoặc đổi người đứng chủ trì sang thành viên khác hợp hơn.`);
  }

  // Quan hệ Tọa (Địa) ↔ Mệnh Chủ (Nhân): Địa sinh Nhân, hoặc Nhân khắc Địa thì tốt (Công đã chốt).
  if (queToa) {
    const skToaMenh = XemNgayCaoCap.xetSinhKhac(menhChuChinh.hknh, queToa.hknh);
    const qhToaMenh = XemNgayCaoCap.xetQuanHe(queToa.hknh, menhChuChinh.hknh);
    if (qhToaMenh !== "khong_giao") {
      diemManh.push(`Tọa giao Mệnh Chủ: ${moTaQuanHe(qhToaMenh)}.`);
    } else if (skToaMenh === "sinh_nhap" || skToaMenh === "khac_xuat") {
      // Mệnh Chủ là chủ: sinh_nhap = Địa sinh Nhân; khac_xuat = Nhân khắc Địa.
      diemManh.push(`Tọa ↔ Mệnh Chủ: ${skToaMenh === "sinh_nhap" ? "Địa sinh Nhân" : "Nhân khắc Địa"} — đạt yêu cầu của nguồn.`);
    } else {
      diemLuuY.push(`Quan hệ Tọa ↔ Mệnh Chủ chưa đạt (${moTaQuanHe(skToaMenh)}); nguồn yêu cầu Địa sinh Nhân hoặc Nhân khắc Địa.`);
    }
  }

  // Mệnh Chủ phụ — chỉ tăng điểm ưu tiên, không loại ngày.
  if (menhChuPhu) {
    const giaoPhu = XemNgayCaoCap.xetGiao(truNgay.hknh, menhChuPhu.hknh, menhChuPhu.hknh);
    if (giaoPhu.giaoDuoc) diemManh.push(`Nhật Khóa giao thêm được Mệnh Chủ phụ: ${moTaQuanHe(giaoPhu.mucDat)}.`);
    else diemLuuY.push("Nhật Khóa không giao được Mệnh Chủ phụ (không loại ngày, chỉ giảm mức ưu tiên).");
  }

  // 5b bổ sung — 2 cặp Hà Đồ khắc nhau trong Tứ Trụ.
  const hknhTuTru = [truNam.hknh, truThang.hknh, truNgay.hknh];
  if (XemNgayCaoCap.coHaiCapHaDoKhacNhau(hknhTuTru)) {
    diemLuuY.push("Tứ Trụ có 2 nhóm Hà Đồ khắc nhau cùng xuất hiện (Thủy-Hỏa hoặc Mộc-Kim) — nguồn khuyến cáo không nên.");
  }

  // 5f — âm dương.
  if (XemNgayCaoCap.laThuanAmHoacThuanDuong(hknhTuTru)) {
    diemLuuY.push(
      `Tứ Trụ thuần ${hknhTuTru[0]! % 2 === 1 ? "dương" : "âm"} — tốc phát nhưng ngắn hạn, nguồn khuyến cáo KHÔNG dùng cho ${input.loaiViec === "nhap_trach" ? "nhập trạch" : "động thổ"} (việc cần độ bền).`,
    );
  } else {
    diemManh.push("Âm dương Tứ Trụ hài hòa (không thuần âm, không thuần dương).");
  }

  // Quan hệ nội bộ: Ngày với Năm/Tháng (trụ Ngày làm chuẩn).
  for (const [tenTru, tru] of [
    ["Năm", truNam],
    ["Tháng", truThang],
  ] as const) {
    const qh = XemNgayCaoCap.xetQuanHe(truNgay.hknh, tru.hknh);
    if (qh !== "khong_giao") {
      diemManh.push(`Trụ Ngày ↔ trụ ${tenTru}: ${moTaQuanHe(qh)}.`);
    } else {
      const sk = XemNgayCaoCap.xetSinhKhac(truNgay.hknh, tru.hknh);
      if (XemNgayCaoCap.laSinhKhacTot(sk)) diemManh.push(`Trụ Ngày được trụ ${tenTru} ${moTaQuanHe(sk)}.`);
    }
  }

  chieuTungBuoc.push({
    buoc: 5,
    ten: "Luận cách cục Huyền Không Đại Quái (Tam Tài Thiên - Địa - Nhân giao)",
    trangThai: !queToa ? "thieu_du_lieu" : buoc5Dat ? "dat" : "khong_dat",
    lyDo: lyDo5.join(" "),
  });

  // =============================================================================================
  // BƯỚC 6 — chọn giờ (chạy sau khi đã có ngày; "không hy sinh chất lượng Ngày để lấy Giờ đẹp")
  // =============================================================================================
  const CHI_12: readonly Chi[] = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const chiToa = (CHI_12 as readonly string[]).includes(input.toaNha) ? (input.toaNha as Chi) : undefined;
  const gioDeXuat = XemNgayCaoCap.xepHangGio({
    chiNgay: truNgay.chi,
    ...(chiToa ? { chiToa } : {}),
    ...(phuongToa ? { phuongToa } : {}),
  });
  const soGioHoangDao = gioDeXuat.filter((g) => g.laHoangDao && !g.phamTamSatGio && !g.xungChiNgay).length;
  chieuTungBuoc.push({
    buoc: 6,
    ten: "Chọn giờ (Hoàng Đạo theo Chi ngày + hợp cục với tọa)",
    trangThai: soGioHoangDao > 0 ? "dat" : "khong_dat",
    lyDo:
      soGioHoangDao > 0
        ? `Có ${soGioHoangDao} giờ Hoàng Đạo không xung Chi ngày và không phạm Tam Sát. Giờ tốt nhất: ${gioDeXuat[0]!.chiGio} (${gioDeXuat[0]!.khungGio}, sao ${gioDeXuat[0]!.tenSao}).`
        : "Không còn giờ Hoàng Đạo nào sạch trong ngày này (đều xung Chi ngày hoặc phạm Tam Sát) — nên cân nhắc đổi ngày.",
  });

  // ----- Kết luận -----
  let ketLuan: XemNgayCaoCapResult["ketLuan"];
  if (!buoc3Dat || (queToa && !buoc5Dat)) ketLuan = "khong_dung";
  else if (!queToa || thieuDuLieuSat || diemLuuY.length > 0) ketLuan = "dung_duoc_co_dieu_kien";
  else ketLuan = "dung_duoc";

  diemLuuY.push(
    "Module này luận theo Huyền Không Đại Quái (Bước 2-6), KHÔNG bao gồm lớp thần sát dân gian ở Bước 1 (Tam Nương, Nguyệt Kỵ, Sát Chủ, 28 sao...) theo đúng phạm vi đã chốt.",
  );

  return {
    ngayDuongLich: { nam, thang, ngay },
    amLich: { ngay: lunar.day, thang: lunar.month, nam: lunar.year, nhuan: lunar.isLeapMonth },
    tuTru: { nam: truNam, thang: truThang, ngay: truNgay },
    toaNha: {
      ten: input.toaNha,
      cung: cungToa,
      phuong: phuongToa,
      hknh: queToa?.hknh ?? null,
      quaiVan: queToa?.quaiVan ?? null,
    },
    ...(input.huongNha && cungHuong ? { huongNha: { ten: input.huongNha, cung: cungHuong } } : {}),
    menhChuChinh,
    ...(menhChuPhu ? { menhChuPhu } : {}),
    ketLuan,
    chieuTungBuoc: chieuTungBuoc.sort((a, b) => a.buoc - b.buoc),
    diemManh,
    diemLuuY,
    gioDeXuat,
  };
}
