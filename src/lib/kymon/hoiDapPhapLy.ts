// Luận Hỏi Đáp Kỳ Môn — chủ đề PHÁP LÝ (2 tình huống: kiện tụng, tranh chấp).
//
// Skill "luan-ky-mon-don-giap" KHÔNG có tài liệu chuyên đề riêng cho "kiện tụng/tranh chấp" (chỉ
// có các câu rải rác gắn với TỪNG cách cục cụ thể trong a2-cau-truc-tran-ky-mon.md, không phải 1
// bộ quy tắc tổng quát). Nội dung dưới đây SUY LUẬN NHẤT QUÁN từ dụng thần đã liệt kê sẵn (Can
// Ngày = mình, Can Giờ = đối phương — dùng cùng cách a5-cau-tai-hop-tac-kinh-doanh.md mục I/VI
// đã dùng cho giao dịch/hợp tác), có đối chiếu thêm với vài cách cục cụ thể a2 xác nhận là "hung"
// khi liên quan kiện tụng.

import type { CungInfo, LapLaBanResult } from "./types";
import { traCachCuc } from "./cachCuc";

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

// Cách cục a2 xác nhận rõ là hung khi liên quan kiện tụng (trích nguyên văn từng dòng).
const CACH_CUC_KIEN_TUNG_HUNG = new Set([
  "Hình Cách Phản Danh", // Kỷ/Canh: "Trong kiện tụng không nên chủ động; người ra tay trước sẽ bất lợi."
  "Quan Phủ Hình Cách", // Canh/Kỷ: "Hỏi kiện tụng sẽ bị tù tội."
  "Nhập Ngục Tử Hình", // Tân/Kỷ
  "Chu Tước Đầu Giang", // Đinh/Quý: "dễ vướng kiện tụng — thi cử dễ rớt"
]);

export interface KetQuaHoiDapPhapLy {
  hopLe: boolean;
  xuHuong: "thuan_loi" | "can_luu_y" | "khong_thuan";
  vanBan: string;
  chiTiet: string;
}
function ketQua(xuHuong: KetQuaHoiDapPhapLy["xuHuong"], vanBan: string, chiTiet: string): KetQuaHoiDapPhapLy {
  return { hopLe: true, xuHuong, vanBan, chiTiet };
}
function khongXacDinh(ly: string): KetQuaHoiDapPhapLy {
  return { hopLe: false, xuHuong: "can_luu_y", vanBan: "Chưa đủ dữ liệu trên lá bàn để luận rõ tình huống này.", chiTiet: ly };
}

function luanChung(laBan: LapLaBanResult, tenViec: string): KetQuaHoiDapPhapLy {
  const cn = laBan.tuTru.ngay?.can ? timCungTheoCan(laBan, laBan.tuTru.ngay.can) : undefined;
  const cg = laBan.tuTru.gio?.can ? timCungTheoCan(laBan, laBan.tuTru.gio.can) : undefined;
  if (!cn || !cg) return khongXacDinh("Không xác định được cung Can Ngày hoặc Can Giờ.");

  const cc = traCachCuc(cg.thienBanCan, cg.diaBanCan);
  const canhBaoHung = cc && CACH_CUC_KIEN_TUNG_HUNG.has(cc.ten) ? ` Lưu ý: cách cục tại vị trí đối phương (${cc.ten}) cho thấy cần đặc biệt thận trọng, không nên hành động vội vàng hoặc chủ động khiêu khích trước.` : "";

  const qh = quanHeCung(cn.soCung, cg.soCung); // Can Ngày (mình) → Can Giờ (đối phương)
  if (qh === "khac") {
    return ketQua("thuan_loi", `${tenViec} này, phần thắng thế/chủ động đang nghiêng về phía bạn.${canhBaoHung}`, "Can Ngày (mình) khắc Can Giờ (đối phương).");
  }
  if (qh === "bịKhac") {
    return ketQua("khong_thuan", `${tenViec} này, đối phương đang chiếm ưu thế hơn — nên cẩn trọng, chuẩn bị lý lẽ/bằng chứng thật chắc chắn trước khi tiến hành.${canhBaoHung}`, "Can Giờ (đối phương) khắc Can Ngày (mình).");
  }
  if (qh === "hoa") {
    return ketQua("can_luu_y", `${tenViec} này, hai bên đang khá cân bằng, chưa rõ ai chiếm ưu thế — kết quả phụ thuộc nhiều vào cách xử lý cụ thể.${canhBaoHung}`, "Can Ngày và Can Giờ tỉ hòa.");
  }
  return ketQua("can_luu_y", `${tenViec} này chưa có tín hiệu rõ ràng theo hướng thuận hay khó — nên thận trọng, không nên chủ quan.${canhBaoHung}`, "Can Ngày và Can Giờ chưa rơi vào nhóm quy tắc rõ ràng.");
}

const BANG_LUAN: Record<string, (laBan: LapLaBanResult) => KetQuaHoiDapPhapLy> = {
  kien_tung: (laBan) => luanChung(laBan, "Vụ kiện"),
  tranh_chap: (laBan) => luanChung(laBan, "Việc tranh chấp"),
};

export function luanHoiDapPhapLy(laBan: LapLaBanResult, tinhHuongId: string): KetQuaHoiDapPhapLy | null {
  const ham = BANG_LUAN[tinhHuongId];
  if (!ham) return null;
  if (laBan.cheDo === "menh") return khongXacDinh("Chủ đề Hỏi Đáp không dùng chế độ Mệnh.");
  return ham(laBan);
}
