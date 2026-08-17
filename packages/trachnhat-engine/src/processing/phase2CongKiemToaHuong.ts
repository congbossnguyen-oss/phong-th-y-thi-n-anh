/**
 * PHASE 2 — CỔNG KIỂM TỌA HƯỚNG CHẠY TRƯỚC TRANG THANH TOÁN.
 *
 * Đặc tả `spec-module-phase2-toa-huong-mo.md` mục 2.1b nói rất rõ: phép kiểm kết cục C phải chạy
 * TRƯỚC khi thu tiền, không phải sau. Lý do nghiệp vụ: nếu tọa huyệt phạm sát ở cấp NĂM thì không
 * ngày giờ nào cứu được — thu 999k rồi mới báo "không làm được" là hành xử không chấp nhận được
 * với tang gia.
 *
 * File này là lớp facade mỏng: tự quy đổi Can Chi năm thật (kể cả trường hợp cửa sổ tang lễ vắt
 * qua Lập Xuân, lúc đó Can Chi năm đổi giữa chừng) rồi gọi hàm thuần `TrungTang.kiemSatCapNam`.
 */
import { getCanChi } from "@thien-anh/calendar-core";
import { TrungTang } from "@thien-anh/rule-engine";
import { calculateGioLiemHaHuyet, type GioLiemHaHuyetInput } from "./gioLiemHaHuyet.js";
import { apDungPhase2 } from "./phase2ApDung.js";

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
/** Cửa sổ quét của Phase 1 là 20 ngày — cổng kiểm phải phủ đúng bấy nhiêu. */
const SO_NGAY_CUA_SO = 20;

export interface CongKiemToaHuongInput {
  /** Độ số tọa huyệt đo bằng la kinh (0-360). Hướng tự suy = tọa + 180. */
  doSoToa: number;
  namMat: number;
  thangMat: number;
  ngayMat: number;
  timeZone?: string;
}

/** Một năm Can Chi có mặt trong cửa sổ tang lễ, kèm kết quả kiểm sát cấp năm. */
export interface NamTrongCuaSo {
  can: string;
  chi: string;
  namDuongLich: number;
  phamCapNam: boolean;
  tenSat: string[];
}

export type KetQuaCongKiem =
  /** Tọa độ không dùng được (sát ranh giới sơn, hoặc không phải số) — mời đo lại, chưa thu phí. */
  | { ketCuc: "can-do-lai"; thongDiep: string }
  /**
   * Kết cục C — phạm sát cấp năm ở MỌI năm Can Chi trong cửa sổ. Dừng toàn bộ, KHÔNG THU PHÍ.
   */
  | {
      ketCuc: "C";
      thongDiep: string;
      chiTiet: NamTrongCuaSo[];
      /** Luôn false — đặt tường minh để tầng UI/API không thể vô tình bật thu tiền. */
      duocPhepThuPhi: false;
    }
  /**
   * Qua cổng. `canhBao` khác rỗng nghĩa là cửa sổ vắt qua Lập Xuân và một phần năm có phạm —
   * vẫn cho đi tiếp vì phần còn lại của cửa sổ dùng được (kết cục B, chỉ loại bớt phương án).
   */
  | {
      ketCuc: "qua-cong";
      toaHuong: TrungTang.ToaHuongMo;
      canhBao: string[];
      thieuDuLieu: string[];
      duocPhepThuPhi: true;
    };

/** Gom lý do bị loại thành nhóm để nói cho gia đình biết vì sao không còn phương án nào. */
export function gomLyDoBiLoai(biLoai: readonly { lyDo: string[] }[]): { nhom: string; soLan: number }[] {
  const dem = new Map<string, number>();
  for (const b of biLoai) {
    // Lấy lý do ĐẦU TIÊN làm đại diện: đó là lý do khiến phương án bị loại sớm nhất.
    const goc = (b.lyDo[0] ?? "").split("—")[0]!.trim().split(" theo ")[0]!.trim();
    if (goc) dem.set(goc, (dem.get(goc) ?? 0) + 1);
  }
  return [...dem.entries()]
    .map(([nhom, soLan]) => ({ nhom, soLan }))
    .sort((a, b) => b.soLan - a.soLan);
}

function tenSonVaHuong(t: TrungTang.ToaHuongMo): string {
  return `tọa ${t.sonToa} ${t.doSoToa.toFixed(1)}° – hướng ${t.sonHuong} ${t.doSoHuong.toFixed(1)}°`;
}

/**
 * Chạy cổng kiểm. Trả về đúng một trong ba trạng thái, và trạng thái nào cũng nói rõ có được thu
 * phí hay không — không để tầng gọi phải tự suy luận.
 */
export function kiemToaHuongTruocThanhToan(input: CongKiemToaHuongInput): KetQuaCongKiem {
  const quy = TrungTang.quyToaDoVeToaHuong(input.doSoToa);
  if (!quy.hopLe) {
    return { ketCuc: "can-do-lai", thongDiep: quy.lyDo };
  }
  const toaHuong = quy.toaHuong;
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;

  // Can Chi NĂM đổi ở Lập Xuân chứ không ở mùng 1 Tết dương lịch, nên một cửa sổ tang lễ 20 ngày
  // đầu tháng 2 hoàn toàn có thể nằm vắt qua hai năm Can Chi khác nhau. Quét cả cửa sổ rồi gom
  // các năm phân biệt, thay vì lấy mỗi năm của ngày mất.
  const cacNam = new Map<string, NamTrongCuaSo>();
  const thieuDuLieu = new Set<string>();

  const mocMat = Date.UTC(input.namMat, input.thangMat - 1, input.ngayMat);
  for (let offset = 0; offset <= SO_NGAY_CUA_SO; offset++) {
    const d = new Date(mocMat + offset * 86_400_000);
    const canChi = getCanChi({
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
      hour: 12,
      timeZone,
    });
    const khoa = `${canChi.year.can} ${canChi.year.chi}`;
    if (cacNam.has(khoa)) continue;

    const kq = TrungTang.kiemSatCapNam(toaHuong, d.getUTCFullYear(), canChi.year.can, canChi.year.chi);
    for (const t of kq.thieuDuLieu) thieuDuLieu.add(t);
    cacNam.set(khoa, {
      can: canChi.year.can,
      chi: canChi.year.chi,
      namDuongLich: d.getUTCFullYear(),
      phamCapNam: kq.phamCapNam,
      tenSat: kq.danhSach.map((s) => `${s.ten} đáo ${s.dao === "toa" ? "tọa" : "hướng"}`),
    });
  }

  const chiTiet = [...cacNam.values()];
  const soPham = chiTiet.filter((n) => n.phamCapNam).length;

  if (soPham === chiTiet.length && soPham > 0) {
    const sat = [...new Set(chiTiet.flatMap((n) => n.tenSat))].join(", ");
    return {
      ketCuc: "C",
      duocPhepThuPhi: false,
      chiTiet,
      thongDiep:
        `Huyệt ${tenSonVaHuong(toaHuong)} phạm ${sat} ở cấp NĂM. Sát cấp năm thì không ngày giờ nào ` +
        `hoá giải được, nên chúng tôi không nhận phí cho trường hợp này. Xin mời gia đình đặt lịch ` +
        `khảo sát trực tiếp để tính lại phương án huyệt.`,
    };
  }

  const canhBao: string[] = [];
  if (soPham > 0) {
    for (const n of chiTiet.filter((x) => x.phamCapNam)) {
      canhBao.push(`Năm ${n.can} ${n.chi} phạm ${n.tenSat.join(", ")} — các ngày thuộc năm này sẽ bị loại.`);
    }
  }

  return { ketCuc: "qua-cong", toaHuong, canhBao, thieuDuLieu: [...thieuDuLieu], duocPhepThuPhi: true };
}

// -------------------------------------------------------------------------------------------
// CỔNG KIỂM ĐẦY ĐỦ — chạy TRỌN Phase 2 trước khi thu tiền
// -------------------------------------------------------------------------------------------

export interface CongKiemDayDuInput extends CongKiemToaHuongInput {
  gioiTinh: GioLiemHaHuyetInput["gioiTinh"];
  namSinhDuongLich: number;
  chiGioMat: GioLiemHaHuyetInput["chiGioMat"];
  soNgayDuKienToiChon?: number;
  thanQuyen?: GioLiemHaHuyetInput["thanQuyen"];
  nguyenNhanMat?: TrungTang.NguyenNhanMat;
}

export type KetQuaCongKiemDayDu =
  | { ketCuc: "can-do-lai"; thongDiep: string }
  | { ketCuc: "C"; thongDiep: string; duocPhepThuPhi: false }
  /**
   * Qua được cổng cấp năm nhưng LỌC HẾT SẠCH phương án — với gia đình thì cũng tệ ngang kết cục
   * C, nên cũng không thu phí. `conGoiCoBan` cho biết Phase 1 vẫn có kết quả để mời gói cơ bản.
   */
  | {
      ketCuc: "rong";
      thongDiep: string;
      lyDoChinh: { nhom: string; soLan: number }[];
      conGoiCoBan: boolean;
      duocPhepThuPhi: false;
    }
  | { ketCuc: "qua-cong"; toaHuong: TrungTang.ToaHuongMo; soPhuongAn: number; duocPhepThuPhi: true };

/**
 * Kiểm ĐẦY ĐỦ trước thanh toán: chạy trọn Phase 1 + Phase 2 rồi mới quyết có thu phí hay không.
 *
 * Vì sao không dừng ở kiểm kết cục C như trước: đo thực tế 2026-08-17 cho thấy sau khi nối đủ
 * Đại Hao / Mộ Long / Tam Tài, có tọa hướng bị lọc sạch 96/96 phương án dù KHÔNG phạm sát cấp
 * năm. Thu 1.000.000đ rồi trả về "không có phương án nào" thì với tang gia còn tệ hơn kết cục C —
 * ít ra kết cục C đã chặn từ đầu và không lấy tiền.
 *
 * Chạy trọn ①→⑤ ở đây không tốn kém: toàn bộ là hàm thuần tra bảng, không gọi mạng, không AI.
 */
export function kiemDayDuTruocThanhToan(input: CongKiemDayDuInput): KetQuaCongKiemDayDu {
  const cong = kiemToaHuongTruocThanhToan(input);
  if (cong.ketCuc === "can-do-lai") return cong;
  if (cong.ketCuc === "C") return { ketCuc: "C", thongDiep: cong.thongDiep, duocPhepThuPhi: false };

  const phase1 = calculateGioLiemHaHuyet({
    gioiTinh: input.gioiTinh,
    namSinhDuongLich: input.namSinhDuongLich,
    namMat: input.namMat,
    thangMat: input.thangMat,
    ngayMat: input.ngayMat,
    chiGioMat: input.chiGioMat,
    ...(input.soNgayDuKienToiChon ? { soNgayDuKienToiChon: input.soNgayDuKienToiChon } : {}),
    ...(input.thanQuyen ? { thanQuyen: input.thanQuyen } : {}),
    ...(input.timeZone ? { timeZone: input.timeZone } : {}),
  });

  const phase2 = apDungPhase2({
    doSoToa: input.doSoToa,
    phuongAnPhase1: phase1.tatCaNgayGioHaHuyet ?? [],
    namMat: input.namMat,
    thangMat: input.thangMat,
    ngayMat: input.ngayMat,
    nguyenNhanMat: input.nguyenNhanMat ?? "benh-tuoi-gia",
    namSinhDuongLich: input.namSinhDuongLich,
    ...(input.soNgayDuKienToiChon ? { soNgayDuKienToiChon: input.soNgayDuKienToiChon } : {}),
    ...(input.timeZone ? { timeZone: input.timeZone } : {}),
  });

  // Miễn trừ Thừa hung: giữ nguyên đề xuất Phase 1, không lọc theo tọa → luôn có kết quả.
  if (phase2.ketCuc === "mien-tru") {
    return { ketCuc: "qua-cong", toaHuong: cong.toaHuong, soPhuongAn: phase2.phuongAn.length, duocPhepThuPhi: true };
  }
  if (phase2.ketCuc === "C") return { ketCuc: "C", thongDiep: phase2.thongDiep, duocPhepThuPhi: false };
  if (phase2.ketCuc === "can-do-lai") return { ketCuc: "can-do-lai", thongDiep: phase2.thongDiep };

  if (phase2.soPhuongAnQuaLoc > 0) {
    return { ketCuc: "qua-cong", toaHuong: cong.toaHuong, soPhuongAn: phase2.soPhuongAnQuaLoc, duocPhepThuPhi: true };
  }

  const lyDoChinh = gomLyDoBiLoai(phase2.biLoai).slice(0, 3);
  const conGoiCoBan = (phase1.ngayGioHaHuyet?.length ?? 0) > 0;
  const keTen = lyDoChinh.map((l) => `${l.nhom} (${l.soLan} phương án)`).join("; ");
  return {
    ketCuc: "rong",
    lyDoChinh,
    conGoiCoBan,
    duocPhepThuPhi: false,
    thongDiep:
      `Với huyệt ${tenSonVaHuong(cong.toaHuong)}, toàn bộ ngày giờ trong khung 20 ngày đều vướng sát phương vị nên ` +
      `không còn phương án nào đạt. Nguyên nhân chính: ${keTen || "nhiều tầng sát chồng nhau"}. ` +
      `Chúng tôi không nhận phí cho trường hợp này — xin mời gia đình đặt lịch khảo sát để bàn phương án huyệt, ` +
      `hoặc trao đổi trực tiếp với thầy.`,
  };
}
