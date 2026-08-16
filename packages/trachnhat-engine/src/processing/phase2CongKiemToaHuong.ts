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
