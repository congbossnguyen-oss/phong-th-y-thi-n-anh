// Luận Hỏi Đáp Kỳ Môn — chủ đề SỨC KHỎE (2 tình huống).
//
// Nguồn: sach-cong-cu-ky-mon-don-giap-truc-doan-do-tan-hoi-vu-phac.md, mục "14 đoán bệnh tật 1" +
// "15... đoán bệnh tật 2" (Đỗ Tân Hội, Vũ Phác dịch). File OCR khá nhiễu (thiếu dấu câu rõ ràng)
// nhưng câu cốt lõi dùng ở đây đọc được rõ ràng, không mơ hồ:
// "Thiên Nhuế tinh đại diện cho bệnh, Thiên Tâm tinh, Ất kỳ đại diện cho bác sỹ... Thiên Tâm, Ất
// kỳ khắc Thiên Nhuế tinh là bệnh có thể chữa" — cùng vài dấu hiệu phụ rõ ràng: "Cửu Địa chủ dài
// lâu" (mãn tính), "[Đằng] Xà chủ di căn và truyền nhiễm", "Huyền Vũ chủ hôn mê", "gặp Bính là có
// chứng viêm".
//
// ⚠️ CHỦ ĐỀ NHẠY CẢM — luôn diễn đạt thận trọng, không khẳng định tuyệt đối, luôn nhắc đây là công
// cụ tham khảo truyền thống, quyết định y tế phải theo chỉ định bác sĩ/cơ sở y tế thật.

import type { CungInfo, LapLaBanResult } from "./types";
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
function timSaoCung(laBan: LapLaBanResult, sao: string) {
  return laBan.cungList.find((c) => c.saoThienBan === sao);
}

export interface KetQuaHoiDapSucKhoe {
  hopLe: boolean;
  xuHuong: "thuan_loi" | "can_luu_y" | "khong_thuan";
  vanBan: string;
  chiTiet: string;
}
function ketQua(xuHuong: KetQuaHoiDapSucKhoe["xuHuong"], vanBan: string, chiTiet: string): KetQuaHoiDapSucKhoe {
  return { hopLe: true, xuHuong, vanBan, chiTiet };
}
function khongXacDinh(ly: string): KetQuaHoiDapSucKhoe {
  return { hopLe: false, xuHuong: "can_luu_y", vanBan: "Chưa đủ dữ liệu trên lá bàn để luận rõ tình huống này.", chiTiet: ly };
}

const LOI_NHAC = " Đây là công cụ tham khảo theo phương pháp truyền thống, không thay thế chẩn đoán y tế — mọi quyết định về sức khỏe cần theo đúng chỉ định của bác sĩ/cơ sở y tế.";

function danhSachDauHieuPhu(nhue: CungInfo): string[] {
  const ds: string[] = [];
  if (nhue.than === "C.Địa") ds.push("có dấu hiệu bệnh kéo dài, cần kiên trì điều trị");
  if (nhue.than === "Đ.Xà") ds.push("nên khám kỹ khả năng lây lan hoặc diễn tiến phức tạp");
  if (nhue.than === "H.Vũ") ds.push("cần đặc biệt lưu tâm, nên thăm khám sớm và kỹ càng");
  if (nhue.thienBanCan === "Bính" || nhue.diaBanCan === "Bính") ds.push("có dấu hiệu viêm nhiễm, nên chú ý theo dõi");
  return ds;
}

// ============================================================================================
// 1. BỆNH TÌNH CHUNG — nguồn mục 14. Thiên Nhuế = bệnh, Thiên Tâm + Ất kỳ = bác sĩ/y dược.
// ============================================================================================
function luanBenhTinhChung(laBan: LapLaBanResult): KetQuaHoiDapSucKhoe {
  const nhue = timSaoCung(laBan, "T.Nhuế");
  const tam = timSaoCung(laBan, "T.Tâm");
  const at = timCungTheoCan(laBan, "Ất");
  if (!nhue || !tam || !at) return khongXacDinh("Không xác định được cung Thiên Nhuế, Thiên Tâm hoặc Ất.");
  const dt = [
    { nhan: "Thiên Nhuế Tinh (bệnh)", cung: nhue },
    { nhan: "Thiên Tâm Tinh (bác sĩ)", cung: tam },
    { nhan: "Ất kỳ (y dược)", cung: at },
  ];
  const nguon = "sach-cong-cu-ky-mon-don-giap-truc-doan-do-tan-hoi-vu-phac.md, mục 14";

  const chuaDuoc = quanHeCung(tam.soCung, nhue.soCung) === "khac" || quanHeCung(at.soCung, nhue.soCung) === "khac";
  const dauHieuPhu = danhSachDauHieuPhu(nhue);
  const canhBao = dauHieuPhu.length ? ` Lưu ý thêm: ${dauHieuPhu.join("; ")}.` : "";

  if (chuaDuoc) {
    return ketQua(
      "thuan_loi",
      `Sức khỏe giai đoạn này có dấu hiệu tích cực — nếu đang điều trị hoặc thăm khám, khả năng đáp ứng tốt khá cao.${canhBao}${LOI_NHAC}`,
      chiTietDayDu(dt, "Thiên Tâm hoặc Ất (bác sĩ/y dược) khắc chế Thiên Nhuế (bệnh) — bệnh có thể chữa", nguon),
    );
  }
  return ketQua(
    "can_luu_y",
    `Sức khỏe giai đoạn này cần được quan tâm đúng mức — nên chủ động thăm khám sớm thay vì chủ quan chờ đợi.${canhBao}${LOI_NHAC}`,
    chiTietDayDu(dt, "Thiên Tâm và Ất chưa khắc chế được Thiên Nhuế", nguon),
  );
}

// ============================================================================================
// 2. CẤP CỨU — nguồn không có mục riêng cho "đang cấp cứu". Mở rộng THẬN TRỌNG, nhất quán từ
// cùng dụng thần Thiên Nhuế (bệnh) ở mục 14, kèm dụng thần theo quan hệ (SPEC yêu cầu) để xác
// định vị trí người bệnh, chỉ dùng Không Vong/Nhập Mộ làm tín hiệu — KHÔNG suy diễn thêm gì về
// khả năng sống/chết, chỉ đưa mức độ "cần theo dõi sát" ở giọng văn rất thận trọng.
// ============================================================================================
function luanCapCuu(laBan: LapLaBanResult): KetQuaHoiDapSucKhoe {
  const nhue = timSaoCung(laBan, "T.Nhuế");
  if (!nhue) return khongXacDinh("Không xác định được cung Thiên Nhuế.");
  const dt = [{ nhan: "Thiên Nhuế Tinh (bệnh/người bệnh)", cung: nhue }];

  const dauHieuXau = nhue.KV || laNhapMo(nhue);
  const dauHieuPhu = danhSachDauHieuPhu(nhue);
  const canhBao = dauHieuPhu.length ? ` ${dauHieuPhu.join("; ")}.` : "";

  if (dauHieuXau) {
    return ketQua(
      "khong_thuan",
      `Đây là tình huống cần đặc biệt theo dõi sát và tuân thủ hoàn toàn theo hướng dẫn của đội ngũ y tế đang trực tiếp điều trị — không nên chủ quan.${canhBao}${LOI_NHAC}`,
      chiTietDayDu(dt, "Thiên Nhuế (bệnh/người bệnh) phạm Không Vong hoặc Nhập Mộ", "mở rộng thận trọng, nhất quán từ dụng thần Thiên Nhuế ở mục 14"),
    );
  }
  return ketQua(
    "can_luu_y",
    `Không có dấu hiệu đặc biệt xấu theo lá bàn, nhưng đây vẫn là tình huống cần theo dõi sát và làm đúng theo hướng dẫn y tế.${canhBao}${LOI_NHAC}`,
    chiTietDayDu(dt, "Thiên Nhuế (bệnh/người bệnh) không phạm Không Vong/Nhập Mộ", "mở rộng thận trọng, nhất quán từ dụng thần Thiên Nhuế ở mục 14"),
  );
}

const BANG_LUAN: Record<string, (laBan: LapLaBanResult) => KetQuaHoiDapSucKhoe> = {
  benh_tinh_chung: luanBenhTinhChung,
  cap_cuu: luanCapCuu,
};

export function luanHoiDapSucKhoe(laBan: LapLaBanResult, tinhHuongId: string): KetQuaHoiDapSucKhoe | null {
  const ham = BANG_LUAN[tinhHuongId];
  if (!ham) return null;
  if (laBan.cheDo === "menh") return khongXacDinh("Chủ đề Hỏi Đáp không dùng chế độ Mệnh.");
  return ham(laBan);
}
