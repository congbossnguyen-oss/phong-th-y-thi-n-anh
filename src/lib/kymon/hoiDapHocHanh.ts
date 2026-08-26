// Luận Hỏi Đáp Kỳ Môn — chủ đề HỌC HÀNH (2 tình huống). Nguồn: a4-thi-cu-cau-thay-hoc-dao.md,
// mục I (Thi cử) và mục II (Cầu thầy học đạo). Quy ước ngũ hành/quanHeCung giống hoiDapTaiChinh.ts.

import type { CungInfo, LapLaBanResult } from "./types";
import type { QuanHeCauHoi } from "./danhMucCauHoi";

type NguHanh = "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
const NGU_HANH_CUNG: Record<number, NguHanh> = {
  1: "Thủy", 2: "Thổ", 3: "Mộc", 4: "Mộc", 5: "Thổ", 6: "Kim", 7: "Kim", 8: "Thổ", 9: "Hỏa",
};
const SINH_NEXT: Record<NguHanh, NguHanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
const KHAC_NEXT: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };
type QuanHe = "sinh" | "duocSinh" | "khac" | "bịKhac" | "hoa";
function quanHeCung(a: number | undefined, b: number | undefined): QuanHe | undefined {
  if (a === undefined || b === undefined) return undefined;
  const ha = NGU_HANH_CUNG[a];
  const hb = NGU_HANH_CUNG[b];
  if (!ha || !hb) return undefined;
  if (ha === hb) return "hoa";
  if (SINH_NEXT[ha] === hb) return "sinh";
  if (SINH_NEXT[hb] === ha) return "duocSinh";
  if (KHAC_NEXT[ha] === hb) return "khac";
  if (KHAC_NEXT[hb] === ha) return "bịKhac";
  return "hoa";
}
function timCungTheoCan(laBan: LapLaBanResult, can: string): CungInfo | undefined {
  if (can === "Giáp") return laBan.cungList.find((c) => c.thienBanCan === laBan.phuDau);
  const kt = laBan.cungList.find((c) => c.thienBanCan === can);
  if (kt) return kt;
  const tc = laBan.cungList.find((c) => c.soCung === 5);
  return tc && tc.diaBanCan === can ? tc : undefined;
}
function timSaoCung(laBan: LapLaBanResult, sao: string) {
  return laBan.cungList.find((c) => c.saoThienBan === sao);
}

export interface KetQuaHoiDapHocHanh {
  hopLe: boolean;
  xuHuong: "thuan_loi" | "can_luu_y" | "khong_thuan";
  vanBan: string;
  chiTiet: string;
}
function ketQua(xuHuong: KetQuaHoiDapHocHanh["xuHuong"], vanBan: string, chiTiet: string): KetQuaHoiDapHocHanh {
  return { hopLe: true, xuHuong, vanBan, chiTiet };
}
function khongXacDinh(ly: string): KetQuaHoiDapHocHanh {
  return { hopLe: false, xuHuong: "can_luu_y", vanBan: "Chưa đủ dữ liệu trên lá bàn để luận rõ tình huống này.", chiTiet: ly };
}

// ============================================================================================
// 1. THI CỬ — nguồn mục I. Thí sinh = Can Ngày (bản thân) hoặc Can Giờ (nếu hỏi cho con — theo
// quanHe "con_cai_nguoi_khac"). Can Năm = trường thi vào. Trực Phù = hội đồng thi.
// ============================================================================================
function luanThiCu(laBan: LapLaBanResult, quanHe: QuanHeCauHoi): KetQuaHoiDapHocHanh {
  const thiSinh = quanHe === "con_cai_nguoi_khac"
    ? (laBan.tuTru.gio?.can ? timCungTheoCan(laBan, laBan.tuTru.gio.can) : undefined)
    : (laBan.tuTru.ngay?.can ? timCungTheoCan(laBan, laBan.tuTru.ngay.can) : undefined);
  const canNam = laBan.tuTru.nam?.can ? timCungTheoCan(laBan, laBan.tuTru.nam.can) : undefined;
  const trucPhu = laBan.cungList.find((c) => c.soCung === laBan.trucPhuCung);
  if (!thiSinh || !canNam || !trucPhu) return khongXacDinh("Không xác định được cung Thí Sinh, Can Năm (trường) hoặc Trực Phù.");

  // "Thí sinh lạc cung... khắc Can năm sinh thì được bài thi tốt (vào trường tốt)."
  const qhCanNam = quanHeCung(thiSinh.soCung, canNam.soCung);
  if (qhCanNam === "khac") {
    return ketQua(
      "thuan_loi",
      "Kỳ thi này có triển vọng tốt, khả năng đạt kết quả cao và vào được nơi mong muốn.",
      "Thí sinh khắc cho Can Năm (trường thi vào) (a4-thi-cu-cau-thay-hoc-dao.md, mục I).",
    );
  }

  // "được Thiên phụ tinh, Trực phù, Can năm sinh cho thì kết quả thi không cao nhưng vẫn được nhận."
  const tp = timSaoCung(laBan, "T.Phò");
  const duocSinhTuTp = tp ? quanHeCung(tp.soCung, thiSinh.soCung) === "sinh" : false;
  const duocSinhTuTrucPhu = quanHeCung(trucPhu.soCung, thiSinh.soCung) === "sinh";
  const duocSinhTuCanNam = qhCanNam === "duocSinh";
  if (duocSinhTuTp || duocSinhTuTrucPhu || duocSinhTuCanNam) {
    return ketQua(
      "can_luu_y",
      "Kỳ thi này nhiều khả năng vẫn đạt (được nhận/qua), nhưng kết quả không cao như kỳ vọng — nên cố gắng thêm để có điểm số tốt hơn.",
      "Thiên Phụ Tinh, Trực Phù, hoặc Can Năm sinh cho Thí Sinh (a4-thi-cu-cau-thay-hoc-dao.md, mục I).",
    );
  }

  // "bị Trực phù, Can năm khắc thì thi không đậu."
  const biTrucPhuKhac = quanHeCung(trucPhu.soCung, thiSinh.soCung) === "khac";
  const biCanNamKhac = qhCanNam === "bịKhac";
  if (biTrucPhuKhac || biCanNamKhac) {
    return ketQua(
      "khong_thuan",
      "Kỳ thi này có nguy cơ không đạt kết quả như mong muốn — nên chuẩn bị thêm phương án dự phòng, đừng đặt hết kỳ vọng vào lần thi này.",
      "Trực Phù hoặc Can Năm khắc Thí Sinh (a4-thi-cu-cau-thay-hoc-dao.md, mục I).",
    );
  }

  return ketQua(
    "can_luu_y",
    "Chưa có tín hiệu rõ ràng theo hướng thuận hay khó cho kỳ thi này — nên chuẩn bị kỹ càng như bình thường, không chủ quan cũng không quá lo lắng.",
    "Tổ hợp Thí Sinh/Can Năm/Trực Phù chưa rơi vào nhóm quy tắc rõ ràng (a4-thi-cu-cau-thay-hoc-dao.md, mục I).",
  );
}

// ============================================================================================
// 2. TÌM THẦY HỌC ĐẠO — nguồn mục II. Thiên Nhuế = học trò, Thiên Phụ = thầy.
// ============================================================================================
function luanTimThayHocDao(laBan: LapLaBanResult): KetQuaHoiDapHocHanh {
  const troTinh = timSaoCung(laBan, "T.Nhuế");
  const thayTinh = timSaoCung(laBan, "T.Phò");
  if (!troTinh || !thayTinh) return khongXacDinh("Không xác định được cung Thiên Nhuế (học trò) hoặc Thiên Phụ (thầy).");

  const qh = quanHeCung(thayTinh.soCung, troTinh.soCung); // Thầy → Trò
  if (qh === "sinh") {
    return ketQua("thuan_loi", "Có duyên gặp được thầy giỏi và được nhận dạy — nên chủ động tìm hiểu, ngỏ lời trong giai đoạn này.", "Thiên Phụ (thầy) sinh cho Thiên Nhuế (học trò) (a4-thi-cu-cau-thay-hoc-dao.md, mục II).");
  }
  if (qh === "hoa") {
    return ketQua("can_luu_y", "Có thể gặp được người thầy phù hợp, nhưng chưa chắc được nhận làm học trò chính thức ngay — cần kiên trì thêm.", "Thiên Phụ và Thiên Nhuế tỉ hòa (a4-thi-cu-cau-thay-hoc-dao.md, mục II).");
  }
  return ketQua(
    "khong_thuan",
    "Giai đoạn này khó gặp được thầy phù hợp, hoặc có gặp cũng khó được nhận dạy — nên tạm gác lại, chờ thời điểm khác.",
    "Thiên Phụ và Thiên Nhuế tương khắc (a4-thi-cu-cau-thay-hoc-dao.md, mục II).",
  );
}

const BANG_LUAN: Record<string, (laBan: LapLaBanResult, quanHe: QuanHeCauHoi) => KetQuaHoiDapHocHanh> = {
  thi_cu: luanThiCu,
  tim_thay_hoc_dao: (laBan) => luanTimThayHocDao(laBan),
};

export function luanHoiDapHocHanh(laBan: LapLaBanResult, tinhHuongId: string, quanHe: QuanHeCauHoi = "ban_than"): KetQuaHoiDapHocHanh | null {
  const ham = BANG_LUAN[tinhHuongId];
  if (!ham) return null;
  if (laBan.cheDo === "menh") return khongXacDinh("Chủ đề Hỏi Đáp không dùng chế độ Mệnh.");
  return ham(laBan, quanHe);
}
