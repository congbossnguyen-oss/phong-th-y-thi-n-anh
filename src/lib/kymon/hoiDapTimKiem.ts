// Luận Hỏi Đáp Kỳ Môn — chủ đề TÌM KIẾM (2 tình huống). Nguồn: a4-luan-tim-do-that-lac.md (mục 3)
// và a4-luan-doan-tim-nguoi-that-lac.md (mục 1 + 4).

import type { CungInfo, LapLaBanResult } from "./types";
import type { QuanHeCauHoi } from "./danhMucCauHoi";
import { chiTietDayDu } from "./moTaChiTiet";

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
const NHAP_MO: Record<string, number> = {
  Giáp: 2, Quý: 2, Ất: 6, Bính: 6, Mậu: 6, Đinh: 8, Kỷ: 8, Canh: 8, Tân: 4, Nhâm: 4,
};
function laNhapMo(c: CungInfo | undefined): boolean {
  return !!c && NHAP_MO[c.thienBanCan] === c.soCung;
}
function timCungTheoCan(laBan: LapLaBanResult, can: string): CungInfo | undefined {
  if (can === "Giáp") return laBan.cungList.find((c) => c.thienBanCan === laBan.phuDau);
  const kt = laBan.cungList.find((c) => c.thienBanCan === can);
  if (kt) return kt;
  const tc = laBan.cungList.find((c) => c.soCung === 5);
  return tc && tc.diaBanCan === can ? tc : undefined;
}

export interface KetQuaHoiDapTimKiem {
  hopLe: boolean;
  xuHuong: "thuan_loi" | "can_luu_y" | "khong_thuan";
  vanBan: string;
  chiTiet: string;
}
function ketQua(xuHuong: KetQuaHoiDapTimKiem["xuHuong"], vanBan: string, chiTiet: string): KetQuaHoiDapTimKiem {
  return { hopLe: true, xuHuong, vanBan, chiTiet };
}
function khongXacDinh(ly: string): KetQuaHoiDapTimKiem {
  return { hopLe: false, xuHuong: "can_luu_y", vanBan: "Chưa đủ dữ liệu trên lá bàn để luận rõ tình huống này.", chiTiet: ly };
}

// ============================================================================================
// 1. TÌM ĐỒ VẬT — nguồn a4-luan-tim-do-that-lac.md, mục 3. Can Ngày = người mất đồ, Can Giờ = đồ vật.
// ============================================================================================
function luanTimDoVat(laBan: LapLaBanResult): KetQuaHoiDapTimKiem {
  const cn = laBan.tuTru.ngay?.can ? timCungTheoCan(laBan, laBan.tuTru.ngay.can) : undefined;
  const cg = laBan.tuTru.gio?.can ? timCungTheoCan(laBan, laBan.tuTru.gio.can) : undefined;
  if (!cn || !cg) return khongXacDinh("Không xác định được cung Can Ngày hoặc Can Giờ.");
  const dt = [
    { nhan: "Can Ngày (người mất đồ)", cung: cn },
    { nhan: "Can Giờ (đồ vật)", cung: cg },
  ];
  const nguon = "a4-luan-tim-do-that-lac.md, mục 3";

  if (cn.soCung === cg.soCung) {
    return ketQua("thuan_loi", "Đồ vật này không thực sự mất — nhiều khả năng vẫn ở gần đâu đó, tìm lại được.", chiTietDayDu(dt, "Can Ngày và Can Giờ đồng cung — không bị mất, sẽ tìm lại được", nguon));
  }
  if (cg.KV || laNhapMo(cg)) {
    return ketQua("khong_thuan", "Khả năng tìm lại được đồ vật này khá thấp trong giai đoạn hiện tại.", chiTietDayDu(dt, "Can Giờ (đồ vật) Không Vong hoặc Nhập Mộ — tìm không ra", nguon));
  }
  const qh = quanHeCung(cg.soCung, cn.soCung); // Can Giờ (đồ vật) → Can Ngày (người mất)
  if (qh === "sinh") {
    return ketQua("thuan_loi", "Có khả năng tìm lại được đồ vật này.", chiTietDayDu(dt, "Can Giờ (đồ vật) sinh cho Can Ngày — tìm lại được", nguon));
  }
  if (qh === "khac" || qh === "bịKhac") {
    return ketQua("khong_thuan", "Khả năng tìm lại được đồ vật này khá thấp.", chiTietDayDu(dt, "Can Ngày và Can Giờ tương khắc — tìm không ra", nguon));
  }
  return ketQua(
    "can_luu_y",
    "Chưa có tín hiệu rõ ràng — có thể thử tìm thêm ở những nơi gần với sinh hoạt thường ngày.",
    chiTietDayDu(dt, "Can Ngày và Can Giờ chưa rơi vào nhóm quy tắc rõ ràng", nguon),
  );
}

// ============================================================================================
// 2. TÌM NGƯỜI — nguồn a4-luan-doan-tim-nguoi-that-lac.md, mục 1 (dụng thần theo quan hệ) + mục 4
// (kết quả tìm được hay không).
// ============================================================================================
function dungThanTheoQuanHe(laBan: LapLaBanResult, quanHe: QuanHeCauHoi): CungInfo | undefined {
  // Mục 1: cha mẹ hỏi cho con → Can Giờ; anh chị em hỏi → Can Tháng; hỏi cho người lớn tuổi/bề
  // trên → Can Năm; còn lại (bản thân/không rõ) → Can Ngày.
  if (quanHe === "con_cai_nguoi_khac") return laBan.tuTru.gio?.can ? timCungTheoCan(laBan, laBan.tuTru.gio.can) : undefined;
  if (quanHe === "anh_chi_em_ban_be") return laBan.tuTru.thang?.can ? timCungTheoCan(laBan, laBan.tuTru.thang.can) : undefined;
  if (quanHe === "cha_me_be_tren") return laBan.tuTru.nam?.can ? timCungTheoCan(laBan, laBan.tuTru.nam.can) : undefined;
  return laBan.tuTru.ngay?.can ? timCungTheoCan(laBan, laBan.tuTru.ngay.can) : undefined;
}

function luanTimNguoi(laBan: LapLaBanResult, quanHe: QuanHeCauHoi): KetQuaHoiDapTimKiem {
  const dungThan = dungThanTheoQuanHe(laBan, quanHe);
  const cn = laBan.tuTru.ngay?.can ? timCungTheoCan(laBan, laBan.tuTru.ngay.can) : undefined;
  const cg = laBan.tuTru.gio?.can ? timCungTheoCan(laBan, laBan.tuTru.gio.can) : undefined;
  if (!dungThan || !cn || !cg) return khongXacDinh("Không xác định được cung dụng thần theo quan hệ, Can Ngày hoặc Can Giờ.");
  const dt = [
    { nhan: "Can Ngày", cung: cn },
    { nhan: "Can Giờ", cung: cg },
    { nhan: "Dụng thần theo quan hệ (người mất tích)", cung: dungThan },
  ];
  const nguon = "a4-luan-doan-tim-nguoi-that-lac.md, mục 1, 3, 4";

  // An nguy (mục 3, rút gọn — chỉ dùng KV/Nhập Mộ vì chưa có bảng vượng suy theo tháng).
  const anNguyXau = dungThan.KV || laNhapMo(dungThan);

  // Mục 4: "Can ngày hoặc Can giờ đồng Cung hoặc Can giờ sinh cho Can ngày thì sẽ tìm được hoặc
  // tự quay về." / "Can ngày sinh cho Can giờ hoặc Can ngày và Can giờ khắc nhau thì khó tìm
  // được hoặc là không về."
  const dongCung = cn.soCung === cg.soCung;
  const qh = quanHeCung(cg.soCung, cn.soCung); // Can Giờ → Can Ngày
  const timDuoc = dongCung || qh === "sinh";
  const khoTim = qh === "duocSinh" || qh === "khac" || qh === "bịKhac";

  if (timDuoc && !anNguyXau) {
    return ketQua(
      "thuan_loi",
      "Nhiều khả năng sẽ tìm được hoặc người này tự quay về trong thời gian tới — tình hình chung không đáng lo ngại.",
      chiTietDayDu(dt, "Can Ngày/Can Giờ đồng cung hoặc Can Giờ sinh Can Ngày; dụng thần không phạm Không Vong/Nhập Mộ", nguon),
    );
  }
  if (timDuoc && anNguyXau) {
    return ketQua(
      "can_luu_y",
      "Có khả năng tìm được hoặc tự về, nhưng nên lưu tâm về sự an toàn của người này trong giai đoạn hiện tại — không nên chủ quan.",
      chiTietDayDu(dt, "Can Ngày/Can Giờ cho tín hiệu tìm được, nhưng dụng thần phạm Không Vong/Nhập Mộ", nguon),
    );
  }
  if (khoTim && anNguyXau) {
    return ketQua(
      "khong_thuan",
      "Tình hình đáng lo ngại — vừa khó tìm được trong thời gian ngắn, vừa có dấu hiệu bất an. Nên trình báo cơ quan chức năng và tìm kiếm khẩn trương nếu chưa làm.",
      chiTietDayDu(dt, "Can Ngày sinh Can Giờ, hoặc Can Ngày/Can Giờ khắc nhau; đồng thời dụng thần phạm Không Vong/Nhập Mộ", nguon),
    );
  }
  if (khoTim) {
    return ketQua(
      "can_luu_y",
      "Giai đoạn này khó tìm được ngay hoặc người này chưa tự về — cần kiên trì tìm kiếm thêm.",
      chiTietDayDu(dt, "Can Ngày sinh Can Giờ, hoặc Can Ngày/Can Giờ khắc nhau", "a4-luan-doan-tim-nguoi-that-lac.md, mục 4"),
    );
  }
  return ketQua(
    "can_luu_y",
    "Chưa có tín hiệu rõ ràng theo hướng thuận hay khó — nên tiếp tục tìm kiếm và theo dõi thêm.",
    chiTietDayDu(dt, "Tổ hợp Can Ngày/Can Giờ/dụng thần chưa rơi vào nhóm quy tắc rõ ràng", "a4-luan-doan-tim-nguoi-that-lac.md"),
  );
}

const BANG_LUAN: Record<string, (laBan: LapLaBanResult, quanHe: QuanHeCauHoi) => KetQuaHoiDapTimKiem> = {
  tim_do_vat: (laBan) => luanTimDoVat(laBan),
  tim_nguoi: luanTimNguoi,
};

export function luanHoiDapTimKiem(laBan: LapLaBanResult, tinhHuongId: string, quanHe: QuanHeCauHoi = "ban_than"): KetQuaHoiDapTimKiem | null {
  const ham = BANG_LUAN[tinhHuongId];
  if (!ham) return null;
  if (laBan.cheDo === "menh") return khongXacDinh("Chủ đề Hỏi Đáp không dùng chế độ Mệnh.");
  return ham(laBan, quanHe);
}
