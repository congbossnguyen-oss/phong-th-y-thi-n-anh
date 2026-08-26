// Luận Hỏi Đáp Kỳ Môn — chủ đề CÔNG VIỆC (4 tình huống).
//
// Nguồn cho "xin việc"/"thăng chức": sach-cong-cu-ky-mon-don-giap-truc-doan-do-tan-hoi-vu-phac.md,
// mục "17. Nghề nghiệp và thăng chức" (Đỗ Tân Hội, Vũ Phác dịch — file OCR khá nhiễu, đọc kỹ và
// chỉ dùng những câu rõ nghĩa, không suy diễn phần còn mơ hồ):
// "Khai môn là đơn vị, nhật can là người cầu dự đoán. Người cầu dự đoán bị Khai môn khắc, đơn vị
// không hoan nghênh... Khai môn sinh đơn vị hoan nghênh, có thể đề bạt... bị Thái Tuế khắc, lãnh
// đạo cấp cao nhất không [hài lòng]... Thái Tuế sinh... là cát nhất." Thái Tuế (năm hiện hành) =
// Can Năm của lá bàn khi lập theo thời điểm hỏi. KHÔNG dùng phần "Trực Phù khắc/sinh" trong cùng
// đoạn vì câu chữ tự mâu thuẫn (khả năng lỗi OCR), tránh đoán sai chiều.
//
// "Hợp tác/cạnh tranh" KHÔNG có tài liệu chuyên đề riêng — suy luận nhất quán từ Can Ngày/Can Giờ
// (mình/đối phương), dùng y hệt cách a5-cau-tai-hop-tac-kinh-doanh.md mục VI (Hợp tác làm ăn).
// "Nhảy việc" SPEC chỉ liệt kê 1 dụng thần (Can Ngày) — dùng trạng thái Không Vong/Nhập Mộ của
// chính Can Ngày, nhất quán với quy ước đã dùng xuyên suốt các chủ đề khác.

import type { CungInfo, LapLaBanResult } from "./types";

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
function timMonCung(laBan: LapLaBanResult, mon: string) {
  return laBan.cungList.find((c) => c.mon === mon);
}

export interface KetQuaHoiDapCongViec {
  hopLe: boolean;
  xuHuong: "thuan_loi" | "can_luu_y" | "khong_thuan";
  vanBan: string;
  chiTiet: string;
}
function ketQua(xuHuong: KetQuaHoiDapCongViec["xuHuong"], vanBan: string, chiTiet: string): KetQuaHoiDapCongViec {
  return { hopLe: true, xuHuong, vanBan, chiTiet };
}
function khongXacDinh(ly: string): KetQuaHoiDapCongViec {
  return { hopLe: false, xuHuong: "can_luu_y", vanBan: "Chưa đủ dữ liệu trên lá bàn để luận rõ tình huống này.", chiTiet: ly };
}

function luanKhaiMonVsCanNgay(laBan: LapLaBanResult, tenViec: string): KetQuaHoiDapCongViec {
  const km = timMonCung(laBan, "KHAI");
  const cn = laBan.tuTru.ngay?.can ? timCungTheoCan(laBan, laBan.tuTru.ngay.can) : undefined;
  const canNam = laBan.tuTru.nam?.can ? timCungTheoCan(laBan, laBan.tuTru.nam.can) : undefined; // Thái Tuế
  if (!km || !cn) return khongXacDinh("Không xác định được cung Khai Môn hoặc Can Ngày.");

  if (km.KV || laNhapMo(km)) {
    return ketQua("khong_thuan", `${tenViec} lúc này chưa thuận — có dấu hiệu chưa rõ ràng, chưa chín muồi. Nên chờ thêm hoặc chuẩn bị kỹ hơn.`, "Khai Môn Không Vong hoặc Nhập Mộ.");
  }

  const qhKhaiMon = quanHeCung(km.soCung, cn.soCung); // Khai Môn (đơn vị) → Can Ngày (mình)
  const qhThaiTue = canNam ? quanHeCung(canNam.soCung, cn.soCung) : undefined; // Thái Tuế → Can Ngày

  if (qhKhaiMon === "sinh" && qhThaiTue === "sinh") {
    return ketQua("thuan_loi", `${tenViec} lúc này rất thuận lợi — cả đơn vị lẫn cấp trên cao nhất đều có dấu hiệu ủng hộ.`, "Khai Môn sinh Can Ngày, đồng thời Thái Tuế (Can Năm) cũng sinh Can Ngày — cát nhất (sach-cong-cu-ky-mon-don-giap-truc-doan-do-tan-hoi-vu-phac.md, mục 17).");
  }
  if (qhThaiTue === "khac") {
    return ketQua("khong_thuan", `${tenViec} lúc này có dấu hiệu chưa thuận từ phía lãnh đạo cấp cao nhất — cần thận trọng, chuẩn bị kỹ hơn.`, "Thái Tuế (Can Năm) khắc Can Ngày (sach-cong-cu-ky-mon-don-giap-truc-doan-do-tan-hoi-vu-phac.md, mục 17).");
  }
  if (qhKhaiMon === "sinh" || qhKhaiMon === "hoa") {
    return ketQua("thuan_loi", `${tenViec} lúc này khá thuận lợi.`, "Khai Môn sinh cho Can Ngày, hoặc tỉ hòa (sach-cong-cu-ky-mon-don-giap-truc-doan-do-tan-hoi-vu-phac.md, mục 17).");
  }
  return ketQua("khong_thuan", `${tenViec} lúc này chưa thuận, cần chuẩn bị kỹ hơn hoặc chờ thời điểm tốt hơn.`, "Khai Môn khắc Can Ngày (sach-cong-cu-ky-mon-don-giap-truc-doan-do-tan-hoi-vu-phac.md, mục 17: 'bị Khai môn khắc, đơn vị không hoan nghênh').");
}

// 1. XIN VIỆC — suy từ Khai Môn ("công ty") vs Can Ngày (người xin việc).
function luanXinViec(laBan: LapLaBanResult): KetQuaHoiDapCongViec {
  return luanKhaiMonVsCanNgay(laBan, "Việc xin vào công ty/tổ chức");
}

// 2. THĂNG CHỨC — cùng dụng thần Khai Môn (Quan Lộc Cung) vs Can Ngày, khác góc diễn giải.
function luanThangChuc(laBan: LapLaBanResult): KetQuaHoiDapCongViec {
  return luanKhaiMonVsCanNgay(laBan, "Cơ hội thăng chức");
}

// 3. NHẢY VIỆC — SPEC chỉ liệt kê 1 dụng thần (Can Ngày), không có dụng thần thứ 2 để so sánh —
// dùng trạng thái riêng của Can Ngày (Không Vong/Nhập Mộ) làm tín hiệu, nhất quán với quy ước
// "KV/Nhập Mộ = bất lợi, chưa rõ ràng" đã dùng xuyên suốt các chủ đề khác.
function luanNhayViec(laBan: LapLaBanResult): KetQuaHoiDapCongViec {
  const cn = laBan.tuTru.ngay?.can ? timCungTheoCan(laBan, laBan.tuTru.ngay.can) : undefined;
  if (!cn) return khongXacDinh("Không xác định được cung Can Ngày.");
  if (cn.KV || laNhapMo(cn)) {
    return ketQua(
      "khong_thuan",
      "Đây chưa phải thời điểm tốt để nhảy việc — bản thân đang ở trạng thái chưa rõ ràng, dễ đưa ra quyết định vội vàng. Nên cân nhắc kỹ hơn hoặc chờ thêm.",
      "Can Ngày Không Vong hoặc Nhập Mộ.",
    );
  }
  return ketQua(
    "thuan_loi",
    "Không có dấu hiệu bất lợi rõ rệt — nếu đã có phương án tốt, đây là thời điểm có thể cân nhắc nhảy việc.",
    "Can Ngày không phạm Không Vong/Nhập Mộ.",
  );
}

// 4. HỢP TÁC/CẠNH TRANH — Can Ngày (mình) vs Can Giờ (đối phương), y hệt cách dùng ở a5 mục VI
// (Hợp tác làm ăn), chỉ đổi ngữ cảnh sang công việc.
function luanHopTacCanhTranh(laBan: LapLaBanResult): KetQuaHoiDapCongViec {
  const cn = laBan.tuTru.ngay?.can ? timCungTheoCan(laBan, laBan.tuTru.ngay.can) : undefined;
  const cg = laBan.tuTru.gio?.can ? timCungTheoCan(laBan, laBan.tuTru.gio.can) : undefined;
  if (!cn || !cg) return khongXacDinh("Không xác định được cung Can Ngày hoặc Can Giờ.");

  const qh = quanHeCung(cg.soCung, cn.soCung); // Can Giờ (đối phương) → Can Ngày (mình)
  if (qh === "sinh") return ketQua("thuan_loi", "Trong mối quan hệ hợp tác/cạnh tranh này, phần thuận lợi đang nghiêng về phía bạn.", "Can Giờ (đối phương) sinh cho Can Ngày (mình).");
  if (qh === "duocSinh") return ketQua("can_luu_y", "Trong mối quan hệ này, phần thuận lợi đang nghiêng về phía đối phương — nên cẩn thận hơn khi đưa ra quyết định.", "Can Ngày (mình) sinh cho Can Giờ (đối phương).");
  if (qh === "hoa") return ketQua("thuan_loi", "Hai bên khá cân bằng, không ai chiếm ưu thế rõ rệt.", "Can Ngày và Can Giờ tỉ hòa.");
  if (qh === "khac") return ketQua("khong_thuan", "Đối phương đang gây bất lợi cho bạn trong mối quan hệ này — nên cẩn trọng, chuẩn bị phương án ứng phó.", "Can Giờ (đối phương) khắc Can Ngày (mình).");
  return ketQua("can_luu_y", "Bạn đang ở thế chủ động gây ảnh hưởng tới đối phương — nên cân nhắc mức độ, tránh đẩy đối phương vào thế quá bất lợi nếu muốn giữ quan hệ lâu dài.", "Can Ngày (mình) khắc Can Giờ (đối phương).");
}

const BANG_LUAN: Record<string, (laBan: LapLaBanResult) => KetQuaHoiDapCongViec> = {
  xin_viec: luanXinViec,
  thang_chuc: luanThangChuc,
  nhay_viec: luanNhayViec,
  hop_tac_canh_tranh: luanHopTacCanhTranh,
};

export function luanHoiDapCongViec(laBan: LapLaBanResult, tinhHuongId: string): KetQuaHoiDapCongViec | null {
  const ham = BANG_LUAN[tinhHuongId];
  if (!ham) return null;
  if (laBan.cheDo === "menh") return khongXacDinh("Chủ đề Hỏi Đáp không dùng chế độ Mệnh.");
  return ham(laBan);
}
