/**
 * MODULE THU PHÍ — Đẩu Thủ Chọn Ngày. Đặc tả chủ dự án cung cấp 31/8/2026 (gói zip
 * `dau-thu-chon-ngay`, nguồn "Trạch Nhật Cao Cấp" - Ánh Dương, Phần III).
 *
 * Phương pháp ĐỘC LẬP với Huyền Không Đại Quái (`xemNgayCaoCap.ts`) để đánh giá Tứ Trụ của
 * ngày so với Sơn Đầu (tọa nhà/mộ, hoặc phương vị nơi tác động nếu là sửa chữa cục bộ). Có thể
 * dùng thay thế hoặc đối chiếu chéo với HKĐQ — 2 hệ không trộn điểm với nhau.
 *
 * ⚠️ Ngũ hành Đẩu Thủ của Sơn Đầu KHÁC Chính Ngũ Hành thường (Giáp sơn = Thủy, không phải Mộc).
 * Khi xếp Lục Thân CHỈ dùng hóa khí Thiên Can, không dùng Chính Ngũ Hành của Can hay của Chi —
 * xem `@thien-anh/rule-engine`'s `DauThu` namespace.
 *
 * THANG ĐIỂM: SPEC nguồn chỉ cho checklist ĐỊNH TÍNH (Bước 4), không cho số liệu cụ thể — trọng
 * số dưới đây là cách quy đổi tự chọn để sắp thứ tự (giống nguyên tắc đã dùng ở
 * `xemNgayCaoCapTimNgay.ts`), KHÔNG phải số liệu chép từ sách. Mỗi kết quả kèm `breakdown` để
 * người dùng tự kiểm chứng, không phải công thức giấu kín.
 *
 * GIỚI HẠN CHỦ ĐỘNG (theo SPEC): KHÔNG code tầng "Phiên Hóa Đẩu Thủ Ngũ Hành" bậc 2 — nguồn
 * chưa tổng quát hóa được thành quy trình đáng tin, báo `thieuDuLieu` nếu người dùng cần.
 */
import { Calendar, Data, getCanChi, getGanzhiHour, getLunarDate } from "@thien-anh/calendar-core";
import { DauThu, TrachNhat, XemNgayCaoCap } from "@thien-anh/rule-engine";

type Can = Data.Can;
type Chi = Data.Chi;
type TenSon = XemNgayCaoCap.TenSon;
type PhuongChinh = XemNgayCaoCap.PhuongChinh;
type NguHanh = DauThu.NguHanh;
type VaiLucThan = DauThu.VaiLucThan;
type TruongSinhStage = DauThu.TruongSinhStage;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const CHI_12: readonly Chi[] = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const CHI_TU_MO: Readonly<Record<string, number>> = { Thìn: 2, Mùi: 5, Tuất: 8, Sửu: 11 };

export type LoaiViecDauThu = "nhap_trach" | "dong_tho" | "sua_nha" | "an_tang" | "cai_tang" | "khac";

export interface DauThuChonNgayInput {
  /** Sơn Đầu — bắt buộc. Nhập trạch/động thổ toàn nhà thì dùng thẳng tọa nhà; sửa chữa cục bộ
   * (đặt bếp/mở cửa) thì dùng phương vị nơi tác động, đo từ tâm nhà (Bước 0 nguồn). */
  toaNha: TenSon;
  /** Độ số la bàn (0-359.99) — bắt buộc riêng với 4 sơn duy (Cấn/Tốn/Khôn/Càn), không thì không
   * xác định được phương chính. Không nhập → vẫn tính được điểm Đẩu Thủ (không phụ thuộc phương),
   * nhưng thiếu phương để hiển thị. */
  toaDoSo?: number;
  loaiViec?: LoaiViecDauThu;
  ngayGiamDinh: { nam: number; thang: number; ngay: number };
  /** Chi giờ cụ thể muốn giám định (vd đã chọn giờ Sửu để động thổ) — nếu bỏ trống, hệ thống tự
   * chọn giờ tốt nhất trong 12 giờ (theo `gioDeXuat[0]`) làm trụ Giờ cho cách cục tổng thể; toàn
   * bộ 12 giờ vẫn được trả về đầy đủ trong `gioDeXuat` để so sánh. */
  chiGio?: Chi;
  timeZone?: string;
}

export interface TruDauThuKetQua {
  tru: "Năm" | "Tháng" | "Ngày" | "Giờ";
  can: Can;
  chi: Chi;
  napAm: string;
  hoaKhi: NguHanh;
  vaiTro: VaiLucThan;
  truongSinh: TruongSinhStage;
  dacVi: boolean;
  thatVi: boolean;
}

export interface GioDauThu {
  chiGio: Chi;
  khungGio: string;
  can: Can;
  hoaKhi: NguHanh;
  vaiTro: VaiLucThan;
  laHoangDao: boolean;
  tenSao: string;
  diem: number;
}

export interface DauThuChonNgayResult {
  ngayDuongLich: { nam: number; thang: number; ngay: number };
  amLich: { ngay: number; thang: number; nam: number; nhuan: boolean };
  sonDau: { ten: TenSon; hanh: NguHanh; phuong: PhuongChinh | null };
  /** Giờ dùng làm trụ Giờ headline cho cách cục tổng thể — `tuChon: false` nghĩa là hệ thống tự
   * lấy giờ điểm cao nhất trong `gioDeXuat` (chưa có giờ cụ thể do người dùng chỉ định). */
  gioHeadline: { chiGio: Chi; tuChon: boolean };
  tuTru: TruDauThuKetQua[];
  cachCuc: string[];
  soLuongVai: Record<VaiLucThan, number>;
  tamHoi: boolean;
  sonDauDuocLenhThang: boolean;
  tuMo: { laTuMo: boolean; nuaDau: boolean | null };
  loaiSomTrungNgay: boolean;
  diem: number;
  breakdown: { nhan: string; diem: number }[];
  canhBao: string[];
  thieuDuLieu: string[];
  gioDeXuat: GioDauThu[];
}

function khungGioCuaChi(chiIndex: number): string {
  const batDau = (chiIndex * 2 + 23) % 24;
  const ketThuc = (batDau + 1) % 24;
  const hai = (n: number) => String(n).padStart(2, "0");
  return `${hai(batDau)}:00-${hai(ketThuc)}:59`;
}

/** Xác định tháng Tứ Mộ đang ở nửa đầu (còn khí mùa trước) hay nửa sau (đã chuyển khí Thổ),
 * bằng trung điểm thời gian giữa 2 mốc tiết khí đóng khung tháng đó (SPEC không cho công thức
 * cứng, đây là cách quy đổi tự chọn — xem README-CLAUDE-CODE.md mục "chỗ mơ hồ"). */
function xacDinhNuaThangTuMo(jdUT: number, chiThang: Chi): { laTuMo: boolean; nuaDau: boolean | null } {
  const orderIdx = CHI_TU_MO[chiThang];
  if (orderIdx === undefined) return { laTuMo: false, nuaDau: null };
  const startTerm = Data.MONTH_BOUNDARY_TERMS[orderIdx]!;
  const endTerm = Data.MONTH_BOUNDARY_TERMS[(orderIdx + 1) % 12]!;
  const startJd = Calendar.findSolarTermJd(startTerm.longitude, jdUT);
  const endJd = Calendar.findSolarTermJd(endTerm.longitude, jdUT);
  const midJd = (startJd + endJd) / 2;
  return { laTuMo: true, nuaDau: jdUT < midJd };
}

function xayTru(tenTru: TruDauThuKetQua["tru"], can: Can, chi: Chi, napAm: string, hanhSonDau: NguHanh): TruDauThuKetQua {
  const hoaKhi = DauThu.hoaKhiCuaCan(can);
  const vaiTro = DauThu.xepLucThan(hanhSonDau, hoaKhi);
  const truongSinh = DauThu.traTruongSinh(chi, hoaKhi);
  return {
    tru: tenTru,
    can,
    chi,
    napAm,
    hoaKhi,
    vaiTro,
    truongSinh,
    dacVi: DauThu.dacVi(truongSinh),
    thatVi: DauThu.thatVi(truongSinh),
  };
}

export function tinhDauThuChonNgay(input: DauThuChonNgayInput): DauThuChonNgayResult {
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;
  const { nam, thang, ngay } = input.ngayGiamDinh;

  const breakdown: { nhan: string; diem: number }[] = [];
  const canhBao: string[] = [];
  const thieuDuLieu: string[] = [];
  const them = (nhan: string, diem: number) => breakdown.push({ nhan, diem });

  const hanhSonDau = DauThu.nguHanhDauThuCuaSon(input.toaNha);
  const phuongRaw = XemNgayCaoCap.phuongTuSon(input.toaNha);
  const phuong = phuongRaw.phuong ?? (input.toaDoSo !== undefined ? XemNgayCaoCap.phuongTuDoSo(input.toaDoSo) : null);
  if (phuong === null) {
    thieuDuLieu.push(
      `Tọa "${input.toaNha}" là sơn duy (nằm đúng ranh giới 2 phương) — cần độ số la bàn thực tế mới xác định được phương. Không ảnh hưởng điểm Đẩu Thủ (không phụ thuộc phương), chỉ thiếu hiển thị.`,
    );
  }

  const canChi = getCanChi({ year: nam, month: thang, day: ngay, hour: 12, timeZone });
  const lunar = getLunarDate({ year: nam, month: thang, day: ngay, timeZone });

  const truNam = xayTru("Năm", canChi.year.can, canChi.year.chi, canChi.year.napAm.name, hanhSonDau);
  const truThang = xayTru("Tháng", canChi.month.can, canChi.month.chi, canChi.month.napAm.name, hanhSonDau);
  const truNgay = xayTru("Ngày", canChi.day.can, canChi.day.chi, canChi.day.napAm.name, hanhSonDau);

  // ----- Bước 5 — 12 giờ ứng viên: vai Lục Thân của trụ Giờ + giờ Hoàng Đạo theo Chi ngày.
  // Tính TRƯỚC trụ Giờ headline vì cần chọn (hoặc tự đề xuất) 1 trong 12 giờ này làm trụ Giờ. -----
  const chiNgayIndex = CHI_12.indexOf(truNgay.chi);
  const truGioTheoChi = new Map<Chi, { can: Can; napAm: string }>();
  const gioDeXuatChuaSap: GioDauThu[] = CHI_12.map((chiGio, idx) => {
    const gioRep = getGanzhiHour({ year: nam, month: thang, day: ngay, hour: (idx * 2 + 23) % 24, minute: 30, timeZone });
    truGioTheoChi.set(chiGio, { can: gioRep.can, napAm: gioRep.napAm.name });
    const hoaKhi = DauThu.hoaKhiCuaCan(gioRep.can);
    const vaiTro = DauThu.xepLucThan(hanhSonDau, hoaKhi);
    const hd = TrachNhat.getHoangDaoHacDaoGio(chiNgayIndex, idx);
    let d = 0;
    if (hd.catHung === "cát") d += 40;
    if (vaiTro === "Nguyên Thần") d += 30;
    else if (vaiTro === "Võ Tài") d += 20;
    else if (vaiTro === "Liêm Trinh") d += 5;
    else if (vaiTro === "Tham Quan") d -= 10;
    else if (vaiTro === "Phá Quân") d -= 50;
    return {
      chiGio,
      khungGio: khungGioCuaChi(idx),
      can: gioRep.can,
      hoaKhi,
      vaiTro,
      laHoangDao: hd.catHung === "cát",
      tenSao: hd.name,
      diem: d,
    };
  });
  const gioDeXuat = [...gioDeXuatChuaSap].sort((a, b) => b.diem - a.diem);

  const chiGioHeadline = input.chiGio ?? gioDeXuat[0]!.chiGio;
  const truGioRaw = truGioTheoChi.get(chiGioHeadline);
  if (!truGioRaw) throw new Error(`chiGio không hợp lệ: ${input.chiGio}`);
  if (!input.chiGio) {
    thieuDuLieu.push(
      `Chưa chỉ định giờ cụ thể — hệ thống tự lấy giờ ${chiGioHeadline} (điểm cao nhất trong 12 giờ, xem "gioDeXuat") làm trụ Giờ để tính cách cục tổng thể. Chọn 1 giờ cụ thể ("chiGio") nếu đã biết trước giờ định làm việc.`,
    );
  }
  const truGio = xayTru("Giờ", truGioRaw.can, chiGioHeadline, truGioRaw.napAm, hanhSonDau);
  const tuTru = [truNam, truThang, truNgay, truGio];

  // ----- Đếm vai trò -----
  const soLuongVai: Record<VaiLucThan, number> = { "Nguyên Thần": 0, "Tham Quan": 0, "Liêm Trinh": 0, "Võ Tài": 0, "Phá Quân": 0 };
  for (const t of tuTru) soLuongVai[t.vaiTro]++;

  // ----- Bước 4a — Cách cục (chọn cao nhất, không cộng dồn) -----
  const cachCuc: string[] = [];
  if (soLuongVai["Nguyên Thần"] === 4) {
    cachCuc.push("Nguyên Thần Nhất Gia");
    them("Nguyên Thần Nhất Gia (4/4 trụ đồng hành Sơn Đầu)", 100);
  } else if (soLuongVai["Nguyên Thần"] >= 3) {
    cachCuc.push("Tam Nguyên Thần Cách");
    them("Tam Nguyên Thần Cách (≥3 trụ Nguyên Thần)", 80);
  } else if (soLuongVai["Võ Tài"] >= 3) {
    cachCuc.push("Tam Võ Tài Cách");
    them("Tam Võ Tài Cách (≥3 trụ Võ Tài)", 70);
  } else if (soLuongVai["Võ Tài"] === 1 && soLuongVai["Liêm Trinh"] === 1) {
    cachCuc.push("1 Võ Tài + 1 Liêm Trinh");
    them("Đủ chuẩn tối thiểu: đúng 1 Võ Tài + đúng 1 Liêm Trinh", 30);
  } else {
    them("Không đạt cách cục ưu tiên nào (Bước 4 mục 1-3)", 0);
  }

  // ----- Ưu tiên riêng trụ Ngày -----
  if (truNgay.vaiTro === "Nguyên Thần") them("Trụ Ngày là Nguyên Thần (ưu tiên riêng)", 15);

  // ----- Tham Quan -----
  if (soLuongVai["Tham Quan"] >= 2) {
    them(`${soLuongVai["Tham Quan"]} Tham Quan (≥2 — phạm nguyên tắc "không được có 2 trở lên")`, -25);
    canhBao.push(`Có ${soLuongVai["Tham Quan"]} Tham Quan trong Tứ Trụ — vượt mức cho phép.`);
  } else if (soLuongVai["Tham Quan"] === 1) {
    them("1 Tham Quan (mức cho phép)", 5);
  }

  // ----- Liêm Trinh dư -----
  if (soLuongVai["Liêm Trinh"] >= 2 && !cachCuc.includes("1 Võ Tài + 1 Liêm Trinh")) {
    them(`${soLuongVai["Liêm Trinh"]} Liêm Trinh (nguồn: "nên có đúng 1")`, -10);
  }

  // ----- Võ Tài rời (khi chưa đạt Tam Võ Tài Cách) -----
  if (!cachCuc.includes("Tam Võ Tài Cách") && soLuongVai["Võ Tài"] >= 1 && !cachCuc.includes("1 Võ Tài + 1 Liêm Trinh")) {
    them(`${soLuongVai["Võ Tài"]} Võ Tài`, Math.min(soLuongVai["Võ Tài"], 2) * 8);
  }

  // ----- Phá Quân — trừ nặng hơn với an táng/cải táng -----
  const heSoPhaQuan = input.loaiViec === "an_tang" || input.loaiViec === "cai_tang" ? 1.5 : 1;
  if (soLuongVai["Phá Quân"] > 0) {
    const diemTru = Math.round(-40 * heSoPhaQuan * soLuongVai["Phá Quân"]);
    them(`${soLuongVai["Phá Quân"]} Phá Quân trong Tứ Trụ${heSoPhaQuan > 1 ? " (nặng hơn vì liên quan an táng/cải táng)" : ""}`, diemTru);
    for (const t of tuTru) {
      if (t.vaiTro === "Phá Quân") canhBao.push(`Trụ ${t.tru} (${t.can} ${t.chi}) là Phá Quân — khắc Sơn Đầu, hạn chế tối đa.`);
    }
  }

  // ----- Hướng sinh khắc: Ngày-Giờ (nội) nên khắc Năm-Tháng (ngoại) -----
  const KHAC: Readonly<Record<NguHanh, NguHanh>> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };
  let lechHuong = 0;
  for (const noi of [truNgay, truGio]) {
    for (const ngoai of [truNam, truThang]) {
      if (KHAC[noi.hoaKhi] === ngoai.hoaKhi) lechHuong += 1; // nội khắc ngoại — tốt
      else if (KHAC[ngoai.hoaKhi] === noi.hoaKhi) lechHuong -= 1; // ngoại khắc nội — xấu
    }
  }
  if (lechHuong !== 0) {
    them(
      lechHuong > 0 ? "Ngày-Giờ (nội) khắc Năm-Tháng (ngoại) — đúng chiều mong muốn" : "Năm-Tháng (ngoại) khắc Ngày-Giờ (nội) — ngược chiều mong muốn",
      lechHuong * 5,
    );
  }

  // ----- Vượng suy bắt buộc (Bước 4) -----
  const truongSinhSonDauThang = DauThu.traTruongSinh(truThang.chi, hanhSonDau);
  const sonDauDuocLenhThang = DauThu.dacVi(truongSinhSonDauThang);
  if (sonDauDuocLenhThang) {
    them(`Sơn Đầu (${hanhSonDau}) được lệnh Tháng hỗ trợ (${truongSinhSonDauThang})`, 15);
  } else if (DauThu.thatVi(truongSinhSonDauThang)) {
    them(`Sơn Đầu (${hanhSonDau}) KHÔNG được lệnh Tháng (${truongSinhSonDauThang} — vô khí)`, -25);
    canhBao.push(`Sơn Đầu không được lệnh Tháng hỗ trợ (${truongSinhSonDauThang}) — nguồn yêu cầu tránh.`);
  }

  for (const t of [truNam, truThang, truNgay]) {
    if (t.vaiTro === "Nguyên Thần") {
      if (t.dacVi) them(`Nguyên Thần trụ ${t.tru} đắc vị (${t.truongSinh})`, 10);
      else if (t.thatVi) them(`Nguyên Thần trụ ${t.tru} thất vị (${t.truongSinh})`, -8);
    }
    if (t.vaiTro === "Phá Quân") {
      if (t.thatVi) them(`Phá Quân trụ ${t.tru} thất vị (${t.truongSinh}) — đã suy yếu, đỡ hơn`, 12);
      else if (t.dacVi) {
        them(`Phá Quân trụ ${t.tru} đang ĐẮC VỊ (${t.truongSinh}) — rất kỵ`, -20);
        canhBao.push(`Phá Quân trụ ${t.tru} đang vượng (${t.truongSinh}) — mức hung nặng nhất.`);
      }
    }
  }
  // Trụ Giờ: SPEC ghi rõ nới lỏng, không tính điểm vượng suy — chỉ note nếu Phá Quân giờ đang vượng.
  if (truGio.vaiTro === "Phá Quân" && truGio.dacVi) {
    canhBao.push(`Phá Quân trụ Giờ (${truGio.truongSinh}) đang vượng — trụ Giờ được nới lỏng nhưng vẫn nên tránh nếu còn lựa chọn khác.`);
  }

  // ----- Tam Hội -----
  const tamHoi = DauThu.coTamHoi(tuTru.map((t) => t.chi));
  if (tamHoi) them("Địa Chi Tứ Trụ đủ 1 nhóm Tam Hội (3 Chi cùng mùa)", 20);

  // ----- Tứ Mộ theo tháng -----
  const tuMo = xacDinhNuaThangTuMo(canChi.julianDay, truThang.chi);
  if (tuMo.laTuMo) {
    thieuDuLieu.push(
      `Tháng ${truThang.chi} là tháng Tứ Mộ — hệ thống xác định đang ở ${tuMo.nuaDau ? "NỬA ĐẦU (còn khí mùa trước)" : "NỬA SAU (đã chuyển khí Thổ)"} theo trung điểm tiết khí. Cần biết mục đích cần khí mùa hay khí Thổ mới đối chiếu được nửa tháng này có phù hợp không — trường "loaiViec" hiện chưa đủ để tự suy.`,
    );
  }

  // ----- Lọc sớm: trụ Ngày Phá Quân + Sơn Đầu không được lệnh tháng -----
  const loaiSomTrungNgay = truNgay.vaiTro === "Phá Quân" && !sonDauDuocLenhThang;
  if (loaiSomTrungNgay) {
    them("Trụ Ngày Phá Quân + Sơn Đầu không được lệnh Tháng — hạ hạng mạnh", -100);
    canhBao.push("Trụ Ngày ra Phá Quân trong khi Sơn Đầu không được lệnh Tháng hỗ trợ — nguồn khuyến cáo loại hoặc hạ hạng mạnh, không dùng nếu còn lựa chọn khác.");
  }

  const diem = breakdown.reduce((s, x) => s + x.diem, 0);

  return {
    ngayDuongLich: { nam, thang, ngay },
    amLich: { ngay: lunar.day, thang: lunar.month, nam: lunar.year, nhuan: lunar.isLeapMonth },
    sonDau: { ten: input.toaNha, hanh: hanhSonDau, phuong },
    gioHeadline: { chiGio: chiGioHeadline, tuChon: input.chiGio !== undefined },
    tuTru,
    cachCuc,
    soLuongVai,
    tamHoi,
    sonDauDuocLenhThang,
    tuMo,
    loaiSomTrungNgay,
    diem,
    breakdown,
    canhBao,
    thieuDuLieu,
    gioDeXuat,
  };
}
