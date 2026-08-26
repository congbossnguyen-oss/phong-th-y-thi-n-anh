// Luận Hỏi Đáp Kỳ Môn — chủ đề ĐI LẠI. Nguồn: a3-luan-doan-xuat-hanh-xuat-ngoai-du-lich.md.
//
// Chỉ làm 2/4 tình huống có quy tắc đủ rõ để code hóa mà KHÔNG cần thêm input có cấu trúc
// (hướng đến cụ thể dạng tọa độ/8 hướng): "nen_di_khong" (mục I, câu về Can Ngày/Can Giờ) và
// "phuong_tien" (mục II, đủ dữ liệu qua traCachCuc đã có). "an_toan_doc_duong" (cần biết CHÍNH
// XÁC cung của phương tiện theo từng loại, đã gộp 1 phần vào phuong_tien) và "khi_nao_ve" (công
// thức Canh Cách cần tính lịch dương hiện tại — quá phức tạp, dễ sai) CHƯA làm — trả null để
// result.ts tự rơi về "đang cập nhật", không đoán.

import type { CungInfo, LapLaBanResult } from "./types";
import { traCachCuc } from "./cachCuc";
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
function timCungTheoCan(laBan: LapLaBanResult, can: string): CungInfo | undefined {
  if (can === "Giáp") return laBan.cungList.find((c) => c.thienBanCan === laBan.phuDau);
  const kt = laBan.cungList.find((c) => c.thienBanCan === can);
  if (kt) return kt;
  const tc = laBan.cungList.find((c) => c.soCung === 5);
  return tc && tc.diaBanCan === can ? tc : undefined;
}
function timMonCung(laBan: LapLaBanResult, mon: string) {
  return laBan.cungList.find((c) => c.mon === mon);
}

export interface KetQuaHoiDapDiLai {
  hopLe: boolean;
  xuHuong: "thuan_loi" | "can_luu_y" | "khong_thuan";
  vanBan: string;
  chiTiet: string;
}
function ketQua(xuHuong: KetQuaHoiDapDiLai["xuHuong"], vanBan: string, chiTiet: string): KetQuaHoiDapDiLai {
  return { hopLe: true, xuHuong, vanBan, chiTiet };
}
function khongXacDinh(ly: string): KetQuaHoiDapDiLai {
  return { hopLe: false, xuHuong: "can_luu_y", vanBan: "Chưa đủ dữ liệu trên lá bàn để luận rõ tình huống này.", chiTiet: ly };
}

// ============================================================================================
// 1. NÊN ĐI KHÔNG — nguồn mục I: "Có thể xét thêm mối quan hệ giữa Can ngày và Can giờ để xem
// xét nên đi hay không nên đi, nếu khắc nhau thì không nên đi."
// ============================================================================================
function luanNenDiKhong(laBan: LapLaBanResult): KetQuaHoiDapDiLai {
  const cn = laBan.tuTru.ngay?.can ? timCungTheoCan(laBan, laBan.tuTru.ngay.can) : undefined;
  const cg = laBan.tuTru.gio?.can ? timCungTheoCan(laBan, laBan.tuTru.gio.can) : undefined;
  if (!cn || !cg) return khongXacDinh("Không xác định được cung Can Ngày hoặc Can Giờ.");
  const dt = [
    { nhan: "Can Ngày (người đi)", cung: cn },
    { nhan: "Can Giờ (sự thể chuyến đi)", cung: cg },
  ];
  const nguon = "a3-luan-doan-xuat-hanh-xuat-ngoai-du-lich.md, mục I";

  if (cn.KV) {
    return ketQua(
      "khong_thuan",
      "Chuyến đi này chưa thuận — có dấu hiệu chưa rõ ràng, chưa sẵn sàng. Nên cân nhắc dời lại nếu không thực sự cấp thiết.",
      chiTietDayDu(dt, "Can Ngày (người đi) Không Vong", nguon),
    );
  }
  const qh = quanHeCung(cn.soCung, cg.soCung);
  if (qh === "khac" || qh === "bịKhac") {
    return ketQua(
      "khong_thuan",
      "Chuyến đi này không thuận lợi — nên cân nhắc dời lại nếu không thực sự cấp thiết.",
      chiTietDayDu(dt, "Can Ngày và Can Giờ tương khắc", nguon),
    );
  }
  return ketQua(
    "thuan_loi",
    "Chuyến đi này khá thuận lợi, có thể tiến hành theo kế hoạch.",
    chiTietDayDu(dt, "Can Ngày và Can Giờ không tương khắc", nguon),
  );
}

// ============================================================================================
// 2. PHƯƠNG TIỆN — nguồn mục II. Nhận diện phương tiện từ ô "thông tin bổ sung" (từ khóa), mặc
// định XE nếu không rõ (loại phổ biến nhất). Xe: Cảnh Môn (đường đi) + Thương Môn (phương tiện).
// Thuyền: Hưu Môn (đường thủy) + Thương Môn (thuyền). Máy bay: Khai Môn (máy bay) — Cửu Thiên
// (đường không) không tra được trực tiếp vì đây là 1 trong 8 THẦN chứ không phải vị trí cố định
// theo Môn/Sao trong cấu trúc dữ liệu hiện có, nên chỉ dùng Khai Môn.
// ============================================================================================
function nhanDienPhuongTien(text: string): "xe" | "thuyen" | "may_bay" {
  const t = text.toLowerCase();
  if (/thuyền|tàu|ghe|phà|thủy/.test(t)) return "thuyen";
  if (/bay|phi cơ|máy bay/.test(t)) return "may_bay";
  return "xe";
}

function luanPhuongTien(laBan: LapLaBanResult, thongTinBoSung: string): KetQuaHoiDapDiLai {
  const loai = nhanDienPhuongTien(thongTinBoSung);

  if (loai === "may_bay") {
    const km = timMonCung(laBan, "KHAI");
    if (!km) return khongXacDinh("Không xác định được cung Khai Môn.");
    const cc = traCachCuc(km.thienBanCan, km.diaBanCan);
    return ketQua(
      "can_luu_y",
      `Đi máy bay lần này ${km.KV ? "có dấu hiệu chưa thuận, cần cẩn thận thêm" : "nhìn chung ổn"}.${cc ? ` Cách cục tại vị trí máy bay: ${cc.ten} — ${cc.yNghia}` : ""}`,
      chiTietDayDu([{ nhan: "Khai Môn (máy bay)", cung: km }], `Cách cục ${cc?.ten ?? "chưa tra được"}`, "a3-luan-doan-xuat-hanh-xuat-ngoai-du-lich.md, mục II.3"),
    );
  }

  if (loai === "thuyen") {
    const tm = timMonCung(laBan, "THƯƠNG");
    if (!tm) return khongXacDinh("Không xác định được cung Thương Môn.");
    const cc = traCachCuc(tm.thienBanCan, tm.diaBanCan);
    const canhBao = cc && (cc.ten === "Thanh Long Đào Tẩu" || cc.ten === "Bạch Hổ Xương Cuồng") ? " Lưu ý: có dấu hiệu thời tiết xấu, cẩn thận sóng gió." : cc && (cc.ten === "Chu Tước Đầu Giang" || cc.ten === "Đằng Xà Yêu Kiêu") ? " Lưu ý: cẩn thận nguy cơ chòng chành, mất an toàn." : "";
    return ketQua(
      "can_luu_y",
      `Đi đường thủy lần này${canhBao || " nhìn chung không có dấu hiệu bất thường rõ rệt"}.`,
      chiTietDayDu([{ nhan: "Thương Môn (thuyền)", cung: tm }], `Cách cục ${cc?.ten ?? "chưa tra được"}`, "a3-luan-doan-xuat-hanh-xuat-ngoai-du-lich.md, mục II.2"),
    );
  }

  // Mặc định: xe.
  const tm = timMonCung(laBan, "THƯƠNG");
  if (!tm) return khongXacDinh("Không xác định được cung Thương Môn.");
  const cc = traCachCuc(tm.thienBanCan, tm.diaBanCan);
  const canhBaoTrom = tm.saoThienBan === "T.Bồng" || tm.than === "H.Vũ" ? " Lưu ý thêm: cẩn thận mất cắp, thất lạc giấy tờ khi đi." : "";
  const dtXe = [{ nhan: "Thương Môn (phương tiện)", cung: tm }];
  if (cc?.ten === "Tặc Tất Lai") {
    return ketQua("can_luu_y", `Đi xe lần này dễ gặp trộm cắp — cần chú ý phương án đề phòng.${canhBaoTrom}`, chiTietDayDu(dtXe, "Cách cục Tặc Tất Lai", "a3-luan-doan-xuat-hanh-xuat-ngoai-du-lich.md, mục II.1"));
  }
  if (cc?.ten === "Tặc Tất Khứ") {
    return ketQua("can_luu_y", `Đi xe lần này cần đề phòng cháy nổ, trục trặc kỹ thuật.${canhBaoTrom}`, chiTietDayDu(dtXe, "Cách cục Tặc Tất Khứ", "a3-luan-doan-xuat-hanh-xuat-ngoai-du-lich.md, mục II.1"));
  }
  return ketQua(
    "thuan_loi",
    `Đi xe lần này không có dấu hiệu bất thường rõ rệt.${canhBaoTrom}`,
    chiTietDayDu(dtXe, `Cách cục ${cc?.ten ?? "chưa tra được"}`, "a3-luan-doan-xuat-hanh-xuat-ngoai-du-lich.md, mục II.1"),
  );
}

const BANG_LUAN: Record<string, (laBan: LapLaBanResult, thongTinBoSung: string) => KetQuaHoiDapDiLai> = {
  nen_di_khong: (laBan) => luanNenDiKhong(laBan),
  phuong_tien: luanPhuongTien,
};

export function luanHoiDapDiLai(laBan: LapLaBanResult, tinhHuongId: string, _quanHe?: unknown, thongTinBoSung = ""): KetQuaHoiDapDiLai | null {
  const ham = BANG_LUAN[tinhHuongId];
  if (!ham) return null;
  if (laBan.cheDo === "menh") return khongXacDinh("Chủ đề Hỏi Đáp không dùng chế độ Mệnh.");
  return ham(laBan, thongTinBoSung);
}
