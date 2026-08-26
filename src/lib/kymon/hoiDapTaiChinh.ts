// Luận Hỏi Đáp Kỳ Môn — chủ đề TÀI CHÍNH (10 tình huống, xem danhMucCauHoi.ts).
// Nguồn phương pháp: skill "luan-ky-mon-don-giap" (nhánh chính, 8 bước) — 2 tài liệu chuyên đề
// dùng trực tiếp: a4-vay-va-cho-muon-tien.md (Vay/Cho vay/Đòi nợ), a5-cau-tai-hop-tac-kinh-doanh.md
// (Giao dịch mua bán/Đầu tư/Mua hàng/Bán hàng/Mở cửa hàng/Hợp tác làm ăn). Ghi rõ trích dẫn ở mỗi
// hàm — KHÔNG tự bịa quy tắc ngoài 2 nguồn này.
//
// Quy ước ngũ hành dùng CHUNG cho toàn bộ engine (khớp Bước 4-5 SOP: "quan hệ ngũ hành TRONG
// CUNG", và khớp cách quanHeCung() đã dùng — chạy đúng — trong luanGiaiMenh.ts): so sánh NGŨ HÀNH
// CỦA CUNG mà mỗi dụng thần đang "lạc" vào (Lạc Thư), KHÔNG dùng ngũ hành cố định của bản thân
// Can/Sao/Môn. Đây là lựa chọn nhất quán duy nhất không tạo mâu thuẫn nội tại (vd Sinh Môn và Mậu
// đều mang trạch ngũ hành Thổ cố định nếu so ngũ hành nội tại — sẽ không bao giờ sinh được nhau,
// trái với ví dụ "Sinh Môn sinh cho Giáp Tý (Mậu)" có thật trong nguồn) — bám đúng chữ "lạc cung"
// trong nguồn gốc.
//
// CHƯA làm (ghi nhận rõ, không đoán): Vượng/Tướng/Hưu/Tù theo tháng (nguồn có nhắc ở vài chỗ,
// project chưa có bảng vượng suy theo tháng — xem ghi chú trong memory dự án), và chưa dùng
// "cấu trúc trận tốt/xấu" (bảng 81 tổ hợp Can/Can) làm ĐIỀU KIỆN CỨNG — chỉ nêu tên cách cục ở
// phần "chi tiết kỹ thuật" (qua chiTietDayDu — tự tra cách cục cho mỗi cung) để tham khảo thêm,
// không chặn/đổi kết luận chính.

import type { CungInfo, LapLaBanResult } from "./types";
import { chiTietDayDu } from "./moTaChiTiet";

type NguHanh = "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";

// Ngũ hành 9 cung (Lạc Thư) — trùng bảng dùng trong luanGiaiMenh.ts. Copy riêng vì module này
// độc lập (không phụ thuộc module khác trong lib/kymon, giống quy ước đã có của dự án).
const NGU_HANH_CUNG: Record<number, NguHanh> = {
  1: "Thủy", 2: "Thổ", 3: "Mộc", 4: "Mộc", 5: "Thổ", 6: "Kim", 7: "Kim", 8: "Thổ", 9: "Hỏa",
};
const SINH_NEXT: Record<NguHanh, NguHanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
const KHAC_NEXT: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };

// NHẬP MỘ (Kỳ Môn) — trùng bảng trong luanGiaiMenh.ts.
const NHAP_MO: Record<string, number> = {
  Giáp: 2, Quý: 2, Ất: 6, Bính: 6, Mậu: 6, Đinh: 8, Kỷ: 8, Canh: 8, Tân: 4, Nhâm: 4,
};

type QuanHe = "sinh" | "duocSinh" | "khac" | "bịKhac" | "hoa";

/** Quan hệ ngũ hành cung A (chủ động) → cung B: "sinh" (A sinh B, có lợi cho B), "duocSinh" (B
 * sinh A, có lợi cho A), "khac" (A khắc B), "bịKhac" (B khắc A), "hoa" (cùng hành/tỉ hòa). */
function quanHeCung(soCungA: number | undefined, soCungB: number | undefined): QuanHe | undefined {
  if (soCungA === undefined || soCungB === undefined) return undefined;
  const a = NGU_HANH_CUNG[soCungA];
  const b = NGU_HANH_CUNG[soCungB];
  if (!a || !b) return undefined;
  if (a === b) return "hoa";
  if (SINH_NEXT[a] === b) return "sinh";
  if (SINH_NEXT[b] === a) return "duocSinh";
  if (KHAC_NEXT[a] === b) return "khac";
  if (KHAC_NEXT[b] === a) return "bịKhac";
  return "hoa";
}

function laKV(c: CungInfo | undefined): boolean {
  return !!c?.KV;
}
function laNhapMo(c: CungInfo | undefined): boolean {
  return !!c && NHAP_MO[c.thienBanCan] === c.soCung;
}

/** Tìm cung mà 1 CAN đang "đóng" trên thiên bàn — copy y hệt luanGiaiMenh.ts (module độc lập). */
function timCungTheoCan(laBan: LapLaBanResult, can: string): CungInfo | undefined {
  if (can === "Giáp") return laBan.cungList.find((c) => c.thienBanCan === laBan.phuDau);
  const khopTrucTiep = laBan.cungList.find((c) => c.thienBanCan === can);
  if (khopTrucTiep) return khopTrucTiep;
  const trungCung = laBan.cungList.find((c) => c.soCung === 5);
  return trungCung && trungCung.diaBanCan === can ? trungCung : undefined;
}

function timMonCung(laBan: LapLaBanResult, mon: string): CungInfo | undefined {
  return laBan.cungList.find((c) => c.mon === mon);
}
function timThanCung(laBan: LapLaBanResult, than: string): CungInfo | undefined {
  return laBan.cungList.find((c) => c.than === than);
}

// ---- Dụng thần dùng chung cho chủ đề Tài Chính ----
function canNgayCung(laBan: LapLaBanResult) {
  return laBan.tuTru.ngay?.can ? timCungTheoCan(laBan, laBan.tuTru.ngay.can) : undefined;
}
function canGioCung(laBan: LapLaBanResult) {
  return laBan.tuTru.gio?.can ? timCungTheoCan(laBan, laBan.tuTru.gio.can) : undefined;
}
function trucPhuCungInfo(laBan: LapLaBanResult) {
  return laBan.cungList.find((c) => c.soCung === laBan.trucPhuCung);
}
function trucSuCungInfo(laBan: LapLaBanResult) {
  return laBan.cungList.find((c) => c.soCung === laBan.trucSuCung);
}
function sinhMonCung(laBan: LapLaBanResult) {
  return timMonCung(laBan, "SINH");
}
/** Giáp Tý mang cờ Mậu (Giáp luôn ẩn dưới Phù Đầu) — "vị trí Giáp Tý/vốn" = vị trí Can Mậu. */
function giapTyCung(laBan: LapLaBanResult) {
  return timCungTheoCan(laBan, "Mậu");
}
/** "Thiên Ất chính là Tinh đi cùng Can giờ" (a4-vay-va-cho-muon-tien.md, mục Cho vay/Đòi nợ). */
function thienAtCung(laBan: LapLaBanResult) {
  return canGioCung(laBan);
}
function lucHopCung(laBan: LapLaBanResult) {
  return timThanCung(laBan, "L.Hợp");
}

export interface KetQuaHoiDapTaiChinh {
  hopLe: boolean;
  /** Tóm tắt xu hướng: "thuan_loi" | "can_luu_y" | "khong_thuan" — dùng cho UI tô màu badge. */
  xuHuong: "thuan_loi" | "can_luu_y" | "khong_thuan";
  vanBan: string;
  chiTiet: string;
}

function ketQua(xuHuong: KetQuaHoiDapTaiChinh["xuHuong"], vanBan: string, chiTiet: string): KetQuaHoiDapTaiChinh {
  return { hopLe: true, xuHuong, vanBan, chiTiet };
}
function khongXacDinh(ly: string): KetQuaHoiDapTaiChinh {
  return { hopLe: false, xuHuong: "can_luu_y", vanBan: "Chưa đủ dữ liệu trên lá bàn để luận rõ tình huống này.", chiTiet: ly };
}

// ============================================================================================
// 1. TÀI VẬN CHUNG — không có mục riêng trong nguồn; suy nhất quán từ CHÍNH dụng thần Sinh Môn
// (= tài lộc, dùng xuyên suốt cả chủ đề) so với Can Ngày (= bản thân người hỏi) — cùng cách đọc
// đã dùng ở mục II (Đầu tư)/IV (Bán hàng) của a5-cau-tai-hop-tac-kinh-doanh.md, không phải trích
// nguyên văn 1 câu có sẵn.
// ============================================================================================
function luanTaiVanChung(laBan: LapLaBanResult): KetQuaHoiDapTaiChinh {
  const canNgay = canNgayCung(laBan);
  const sinhMon = sinhMonCung(laBan);
  if (!canNgay || !sinhMon) return khongXacDinh("Không xác định được cung Can Ngày hoặc Sinh Môn.");
  const dt = [
    { nhan: "Sinh Môn (tài lộc)", cung: sinhMon },
    { nhan: "Can Ngày (bản thân)", cung: canNgay },
  ];
  const nguon = "suy luận nhất quán từ a5-cau-tai-hop-tac-kinh-doanh.md, mục II/IV";

  if (laKV(sinhMon)) {
    return ketQua(
      "khong_thuan",
      "Tài vận giai đoạn này không ổn định — tiền vào rồi lại ra, khó tích lũy. Không nên đầu tư/chi tiêu lớn lúc này, ưu tiên giữ tiền mặt và chờ thời điểm rõ ràng hơn.",
      chiTietDayDu(dt, "Sinh Môn (dụng thần Tài) Không Vong", nguon),
    );
  }

  const qh = quanHeCung(sinhMon.soCung, canNgay.soCung);
  if (qh === "sinh") {
    return ketQua(
      "thuan_loi",
      "Tài vận đang thuận, tiền bạc có xu hướng tự tìm đến, dễ có thêm nguồn thu hoặc cơ hội kiếm tiền mới trong thời gian tới.",
      chiTietDayDu(dt, "Sinh Môn sinh cho cung Can Ngày", nguon),
    );
  }
  if (qh === "khac") {
    return ketQua(
      "can_luu_y",
      "Tài vận kiếm được nhưng khó giữ, dễ có khoản chi phát sinh ngoài dự tính. Nên lập kế hoạch chi tiêu rõ ràng, tránh mua sắm/đầu tư theo cảm tính giai đoạn này.",
      chiTietDayDu(dt, "Sinh Môn khắc cung Can Ngày", nguon),
    );
  }
  if (qh === "duocSinh") {
    return ketQua(
      "can_luu_y",
      "Bản thân đang phải chủ động bỏ công sức/vốn liếng ra trước mới có tiền vào — tài vận không tự đến mà cần tạo ra bằng hành động cụ thể.",
      chiTietDayDu(dt, "Cung Can Ngày sinh cho Sinh Môn", nguon),
    );
  }
  if (qh === "bịKhac") {
    return ketQua(
      "khong_thuan",
      "Giai đoạn này tài vận gặp cản trở, dễ hao hụt tiền bạc ngoài ý muốn. Không nên mạo hiểm, ưu tiên phòng thủ, giữ những gì đang có.",
      chiTietDayDu(dt, "Cung Can Ngày bị Sinh Môn khắc chế ngược", nguon),
    );
  }
  return ketQua(
    "can_luu_y",
    "Tài vận ở mức bình thường, không có dấu hiệu đột biến rõ rệt — cứ theo kế hoạch đã định, không cần vội vàng.",
    chiTietDayDu(dt, "Sinh Môn và cung Can Ngày cùng hành/tỉ hòa", nguon),
  );
}

// ============================================================================================
// 2. VAY TIỀN — nguồn: a4-vay-va-cho-muon-tien.md, mục I "Cách 1" (Trực Phù = ngân hàng/người
// cho vay, Trực Sử = người đi vay). Không dùng "Cách 2" (đổi hướng theo Thiên/Địa bàn tinh —
// phương pháp khác, không cần thiết khi đã có Cách 1 rõ ràng hơn để code hoá).
// ============================================================================================
function luanVayTien(laBan: LapLaBanResult): KetQuaHoiDapTaiChinh {
  const tp = trucPhuCungInfo(laBan);
  const ts = trucSuCungInfo(laBan);
  if (!tp || !ts) return khongXacDinh("Không xác định được cung Trực Phù hoặc Trực Sử.");
  const dt = [
    { nhan: "Trực Phù (bên cho vay)", cung: tp },
    { nhan: "Trực Sử (người đi vay)", cung: ts },
  ];
  const nguon = "a4-vay-va-cho-muon-tien.md, mục I";

  if (laKV(tp) || laKV(ts)) {
    return ketQua(
      "khong_thuan",
      "Việc vay mượn lúc này khó thành — bên cho vay (ngân hàng/người quen) không sẵn sàng, hoặc thủ tục kéo dài không đi đến đâu. Nên hoãn lại, tìm hướng khác.",
      chiTietDayDu(dt, "Trực Phù hoặc Trực Sử Không Vong", nguon),
    );
  }

  const qh = quanHeCung(tp.soCung, ts.soCung);
  if (qh === "sinh" || qh === "bịKhac" /* Trực Sử khắc Trực Phù */) {
    return ketQua(
      "thuan_loi",
      "Khả năng vay được tiền khá tốt — bên cho vay có thiện chí, hồ sơ/đề nghị của bạn có cơ sở để được duyệt.",
      chiTietDayDu(dt, "Trực Phù sinh Trực Sử, hoặc Trực Sử khắc Trực Phù — đều là dấu hiệu vay được", nguon),
    );
  }
  if (qh === "khac" || qh === "duocSinh" /* Trực Sử sinh Trực Phù */) {
    return ketQua(
      "khong_thuan",
      "Khả năng vay được tiền lúc này khá thấp — bên cho vay dè dặt hoặc không đủ điều kiện đáp ứng. Nên chuẩn bị phương án dự phòng thay vì trông chờ hoàn toàn vào khoản vay này.",
      chiTietDayDu(dt, "Trực Phù khắc Trực Sử, hoặc Trực Sử sinh Trực Phù — đều là dấu hiệu không vay được", nguon),
    );
  }
  // "hoa" (tỉ hòa) — nguồn không nói rõ trường hợp này, không suy diễn theo hướng nào cả.
  return ketQua(
    "can_luu_y",
    "Khả năng vay được tiền chưa rõ ràng theo hướng nào — nên chủ động trao đổi kỹ thêm với bên cho vay để nắm chắc hơn trước khi quyết định.",
    chiTietDayDu(dt, "Trực Phù và Trực Sử tỉ hòa — nguồn không có quy tắc trực tiếp cho trường hợp này", nguon),
  );
}

// ============================================================================================
// 3. CHO VAY — nguồn: a4-vay-va-cho-muon-tien.md, mục II. Trực Phù = mình (người cho vay), Thiên
// Ất = người vay, Sinh Môn = lợi tức. Quy ước quanHeCung(A,B): "sinh"=A sinh B, "khac"=A khắc B.
// ============================================================================================
function luanChoVay(laBan: LapLaBanResult): KetQuaHoiDapTaiChinh {
  const tp = trucPhuCungInfo(laBan);
  const ta = thienAtCung(laBan);
  const sm = sinhMonCung(laBan);
  if (!tp || !ta || !sm) return khongXacDinh("Không xác định được cung Trực Phù, Thiên Ất hoặc Sinh Môn.");
  const dt = [
    { nhan: "Trực Phù (mình)", cung: tp },
    { nhan: "Thiên Ất (người vay)", cung: ta },
    { nhan: "Sinh Môn (lợi tức)", cung: sm },
  ];
  const nguon = "a4-vay-va-cho-muon-tien.md, mục II";

  const qhTa = quanHeCung(ta.soCung, tp.soCung); // Thiên Ất → Trực Phù
  const qhSm = quanHeCung(sm.soCung, tp.soCung); // Sinh Môn → Trực Phù

  // "Sinh môn và Thiên ất mà sinh cho Trực phù thì thu về cả vốn lẫn lãi."
  if (qhTa === "sinh" && qhSm === "sinh") {
    return ketQua(
      "thuan_loi",
      "Cho vay khoản này khá an toàn — nhiều khả năng thu hồi được đầy đủ cả vốn lẫn lãi đúng hẹn.",
      chiTietDayDu(dt, "Sinh Môn và Thiên Ất đều sinh cho Trực Phù", nguon),
    );
  }
  // "Nếu Sinh môn và Thiên ất đều khắc Trực phù thì xấu, cho vay sẽ mất hết."
  if (qhTa === "khac" && qhSm === "khac") {
    return ketQua(
      "khong_thuan",
      "Cho vay khoản này rủi ro rất cao — khả năng mất trắng, khó đòi lại được. Nên cân nhắc kỹ, hoặc yêu cầu thêm tài sản đảm bảo trước khi quyết định.",
      chiTietDayDu(dt, "Sinh Môn và Thiên Ất đều khắc Trực Phù", nguon),
    );
  }
  // "1 khắc, 1 sinh cho Trực phù thì tiền cho vay không thu về hết hoặc chậm trễ."
  const motSinhMotKhac = (qhTa === "sinh" && qhSm === "khac") || (qhTa === "khac" && qhSm === "sinh");
  if (motSinhMotKhac) {
    return ketQua(
      "can_luu_y",
      "Cho vay khoản này có khả năng không thu hồi đủ hoặc bị chậm trễ. Nên có thỏa thuận rõ ràng về thời hạn và cách xử lý nếu chậm trả.",
      chiTietDayDu(dt, "Sinh Môn và Thiên Ất, một sinh một khắc Trực Phù", nguon),
    );
  }
  // "Trực phù mà khắc được Thiên ất thì tốt" (Trực Phù khắc Thiên Ất = B khắc A = qhTa "bịKhac").
  if (qhTa === "bịKhac") {
    return ketQua(
      "thuan_loi",
      "Bên vay chịu sức ép/ràng buộc từ phía mình khá tốt — nhìn chung vẫn kiểm soát được, có thể đòi lại khi cần.",
      chiTietDayDu(dt, "Trực Phù khắc được Thiên Ất — mình khắc chế được con nợ", nguon),
    );
  }
  // "Trực phù mà sinh Thiên ất thì xấu" (Trực Phù sinh Thiên Ất = B sinh A = qhTa "duocSinh").
  if (qhTa === "duocSinh") {
    return ketQua(
      "khong_thuan",
      "Cho vay khoản này không có lợi cho mình — dễ bị động, phần thiệt nghiêng về phía người cho vay.",
      chiTietDayDu(dt, "Trực Phù sinh Thiên Ất", nguon),
    );
  }
  return ketQua(
    "can_luu_y",
    "Chưa có tín hiệu rõ ràng theo hướng thuận hay khó cho khoản cho vay này — nên theo dõi thêm và không nên cho vay số tiền lớn ngay từ đầu.",
    chiTietDayDu(dt, "Tổ hợp Sinh Môn/Thiên Ất/Trực Phù chưa rơi vào nhóm quy tắc rõ ràng", nguon),
  );
}

// ============================================================================================
// 4. ĐÒI NỢ — nguồn: a4-vay-va-cho-muon-tien.md, mục III. Trực Phù = mình (chủ nợ), Thiên Ất =
// con nợ, Thương Môn = người đi đòi (có thể là chính mình hoặc người được nhờ đòi hộ).
// CHƯA áp dụng nhánh Vượng/Tướng/Hưu/Tù của Thiên Ất (dự án chưa có bảng vượng suy theo tháng).
// ============================================================================================
function luanDoiNo(laBan: LapLaBanResult): KetQuaHoiDapTaiChinh {
  const tp = trucPhuCungInfo(laBan);
  const ta = thienAtCung(laBan);
  const tm = timMonCung(laBan, "THƯƠNG");
  if (!tp || !ta || !tm) return khongXacDinh("Không xác định được cung Trực Phù, Thiên Ất hoặc Thương Môn.");
  const dt = [
    { nhan: "Trực Phù (chủ nợ)", cung: tp },
    { nhan: "Thiên Ất (con nợ)", cung: ta },
    { nhan: "Thương Môn (người đòi)", cung: tm },
  ];
  const nguon = "a4-vay-va-cho-muon-tien.md, mục III";

  const qhTmTa = quanHeCung(tm.soCung, ta.soCung); // Thương Môn → Thiên Ất
  const qhTmTp = quanHeCung(tm.soCung, tp.soCung); // Thương Môn → Trực Phù
  const qhTaTp = quanHeCung(ta.soCung, tp.soCung); // Thiên Ất → Trực Phù

  // "Thiên ất mà khắc Thương môn thì không đòi được nợ" (Thiên Ất khắc Thương Môn = B khắc A = qhTmTa "bịKhac").
  if (qhTmTa === "bịKhac") {
    return ketQua(
      "khong_thuan",
      "Khả năng đòi được nợ khá thấp — người đứng ra đòi không giải quyết được vấn đề, bên nợ có phần chiếm thế trên.",
      chiTietDayDu(dt, "Thiên Ất khắc Thương Môn — người đi đòi không giải quyết được", nguon),
    );
  }

  // "Thương môn mà khắc Thiên ất thì người đòi nợ thực tâm đi đòi" (A khắc B = qhTmTa "khac").
  if (qhTmTa === "khac") {
    if (qhTmTp === "sinh" && qhTaTp === "sinh") {
      return ketQua(
        "thuan_loi",
        "Đòi nợ khoản này có cơ sở tốt — người đứng ra đòi thực tâm và tình hình chung khá thuận, khả năng đòi được cả gốc lẫn lãi.",
        chiTietDayDu(dt, "Thương Môn khắc Thiên Ất (người đòi thực tâm), đồng thời Thương Môn và Thiên Ất đều sinh Trực Phù", nguon),
      );
    }
    return ketQua(
      "can_luu_y",
      "Người đứng ra đòi có thực tâm đòi, nhưng kết quả cuối cùng chưa chắc trọn vẹn — có thể chỉ đòi được một phần hoặc phải mất thời gian hơn dự kiến.",
      chiTietDayDu(dt, "Thương Môn khắc Thiên Ất (đòi thực tâm) nhưng quan hệ với Trực Phù chưa đồng thuận hoàn toàn", nguon),
    );
  }

  // "Thương môn và Thiên ất cùng khắc Trực phù thì không đòi được."
  if (qhTmTp === "khac" && qhTaTp === "khac") {
    return ketQua(
      "khong_thuan",
      "Khoản nợ này rất khó đòi trong giai đoạn hiện tại — nên cân nhắc phương án khác (thương lượng, nhờ bên thứ ba, hoặc chấp nhận khoanh nợ) thay vì tiếp tục đòi trực tiếp.",
      chiTietDayDu(dt, "Thương Môn và Thiên Ất đều khắc Trực Phù", nguon),
    );
  }
  // "Thương môn và Thiên ất cùng sinh cho Trực phù thì đòi được cả vốn lẫn lãi."
  if (qhTmTp === "sinh" && qhTaTp === "sinh") {
    return ketQua(
      "thuan_loi",
      "Đòi nợ khoản này có triển vọng tốt, khả năng đòi được cả gốc lẫn lãi.",
      chiTietDayDu(dt, "Thương Môn và Thiên Ất đều sinh cho Trực Phù", nguon),
    );
  }
  return ketQua(
    "can_luu_y",
    "Việc đòi nợ có khả năng kéo dài hoặc chỉ thu hồi được một phần — chưa có dấu hiệu rõ ràng theo hướng thuận hay khó, nên kiên trì nhưng đừng kỳ vọng đòi dứt điểm ngay.",
    chiTietDayDu(dt, "Tổ hợp Thương Môn/Thiên Ất/Trực Phù chưa rơi vào nhóm rõ ràng cát/hung", nguon),
  );
}

// ============================================================================================
// 5. GIAO DỊCH MUA BÁN (có đối tác) — nguồn: a5-cau-tai-hop-tac-kinh-doanh.md, mục I. Can Ngày =
// người mua, Can Giờ = người bán, Lục Hợp = trung gian/môi giới (nếu có).
// ============================================================================================
function luanGiaoDichMuaBan(laBan: LapLaBanResult): KetQuaHoiDapTaiChinh {
  const cn = canNgayCung(laBan);
  const cg = canGioCung(laBan);
  if (!cn || !cg) return khongXacDinh("Không xác định được cung Can Ngày hoặc Can Giờ.");
  const lh = lucHopCung(laBan);
  const dt = [
    { nhan: "Can Ngày (người mua)", cung: cn },
    { nhan: "Can Giờ (người bán)", cung: cg },
    { nhan: "Lục Hợp (môi giới)", cung: lh },
  ];
  const nguon = "a5-cau-tai-hop-tac-kinh-doanh.md, mục I";

  if (laKV(cn) || laKV(cg)) {
    return ketQua(
      "khong_thuan",
      "Giao dịch này khó đi đến kết quả — một trong hai bên (mua/bán) chưa thực sự sẵn sàng hoặc còn nhiều điều chưa rõ ràng. Không nên vội chốt.",
      chiTietDayDu(dt, "Can Ngày hoặc Can Giờ Không Vong", nguon),
    );
  }

  const qh = quanHeCung(cn.soCung, cg.soCung); // Can Ngày (mua) → Can Giờ (bán)
  let ketLuan: KetQuaHoiDapTaiChinh;
  if (qh === "sinh") {
    ketLuan = ketQua("can_luu_y", "Giao dịch có lợi hơn cho bên bán — nếu bạn là người mua, cân nhắc thương lượng thêm về giá.", chiTietDayDu(dt, "Can Ngày (người mua) sinh Can Giờ (người bán)", nguon));
  } else if (qh === "duocSinh") {
    ketLuan = ketQua("thuan_loi", "Giao dịch có lợi hơn cho bên mua — nếu bạn là người mua, đây là thời điểm khá tốt để chốt giao dịch.", chiTietDayDu(dt, "Can Giờ (người bán) sinh Can Ngày (người mua)", nguon));
  } else if (qh === "khac") {
    ketLuan = ketQua("khong_thuan", "Nếu bạn là người mua, tình huống này cho thấy không thực sự cần mua lúc này — cân nhắc lại có nên tiếp tục hay không.", chiTietDayDu(dt, "Can Ngày (người mua) khắc Can Giờ (người bán)", nguon));
  } else if (qh === "bịKhac") {
    ketLuan = ketQua("khong_thuan", "Nếu bạn là người bán, tình huống này cho thấy không thực sự cần bán lúc này — cân nhắc lại có nên tiếp tục hay không.", chiTietDayDu(dt, "Can Giờ (người bán) khắc Can Ngày (người mua)", nguon));
  } else {
    ketLuan = ketQua("thuan_loi", "Giao dịch diễn ra công bằng, hai bên ngang sức ngang tài, không ai chịu thiệt rõ rệt.", chiTietDayDu(dt, "Can Ngày và Can Giờ tỉ hòa", nguon));
  }

  if (lh && !laKV(lh)) {
    const qhLh = quanHeCung(lh.soCung, cn.soCung);
    const qhLh2 = quanHeCung(lh.soCung, cg.soCung);
    if (qhLh === "sinh") ketLuan.vanBan += " Nếu có người trung gian/môi giới, họ đang nghiêng về phía bên mua.";
    else if (qhLh2 === "sinh") ketLuan.vanBan += " Nếu có người trung gian/môi giới, họ đang nghiêng về phía bên bán.";
  } else if (laKV(lh)) {
    ketLuan.vanBan += " Lưu ý: có dấu hiệu người trung gian/môi giới không đáng tin, cần cẩn thận lừa dối, gian trá.";
  }
  return ketLuan;
}

// ============================================================================================
// 6. ĐẦU TƯ — nguồn: a5-cau-tai-hop-tac-kinh-doanh.md, mục II. Giáp Tý (Mậu) = vốn, Sinh Môn =
// lợi nhuận. CHƯA dùng điều kiện "có Tam Kỳ, cấu trúc trận tốt/xấu" làm điều kiện cứng (xem ghi
// chú đầu file) — chỉ dùng quan hệ sinh khắc Sinh Môn ↔ Vốn làm cốt lõi.
// ============================================================================================
function luanDauTu(laBan: LapLaBanResult): KetQuaHoiDapTaiChinh {
  const sm = sinhMonCung(laBan);
  const von = giapTyCung(laBan);
  if (!sm || !von) return khongXacDinh("Không xác định được cung Sinh Môn hoặc Giáp Tý (vốn).");
  const dt = [
    { nhan: "Sinh Môn (lợi nhuận)", cung: sm },
    { nhan: "Giáp Tý/Mậu (vốn)", cung: von },
  ];
  const nguon = "a5-cau-tai-hop-tac-kinh-doanh.md, mục II";

  if (laNhapMo(sm)) {
    return ketQua(
      "khong_thuan",
      "Khoản đầu tư này có rủi ro hao hụt vốn khá rõ — nên cân nhắc kỹ hoặc giảm quy mô trước khi rót tiền.",
      chiTietDayDu(dt, "Sinh Môn Nhập Mộ", nguon),
    );
  }

  // Quy ước quanHeCung(A,B): "sinh"=A sinh B, "khac"=A khắc B, "bịKhac"=B khắc A.
  const qh = quanHeCung(sm.soCung, von.soCung); // Sinh Môn → Vốn
  if (qh === "sinh") {
    return ketQua("thuan_loi", "Đầu tư khoản này có triển vọng sinh lời tốt, khả năng thu về lợi nhuận đáng kể (có thể gấp đôi vốn bỏ ra).", chiTietDayDu(dt, "Sinh Môn sinh cho Giáp Tý (vốn)", nguon));
  }
  if (qh === "hoa") {
    return ketQua("can_luu_y", "Đầu tư khoản này có lời nhưng ở mức vừa phải, không đột biến — nên giữ kỳ vọng thực tế.", chiTietDayDu(dt, "Sinh Môn và Giáp Tý (vốn) tỉ hòa", nguon));
  }
  // "Giáp Tý (M) mà khắc cho Sinh môn thì phải tăng vốn mới có lời" (Vốn khắc Sinh Môn = B khắc A = qh "bịKhac").
  if (qh === "bịKhac") {
    return ketQua("can_luu_y", "Với số vốn hiện tại khó có lời — nếu muốn tiếp tục, cần tăng thêm vốn mới có khả năng sinh lời.", chiTietDayDu(dt, "Giáp Tý (vốn) khắc Sinh Môn — phải tăng vốn mới có lời", nguon));
  }
  // "Sinh môn... khắc cho Giáp Tý (M)... thì sẽ hao hết tiền vốn" (Sinh Môn khắc Vốn = A khắc B = qh "khac").
  return ketQua(
    "khong_thuan",
    "Đầu tư khoản này có nguy cơ lỗ vốn — nên cân nhắc rất kỹ, tốt nhất là giảm số tiền đầu tư hoặc tạm hoãn.",
    chiTietDayDu(dt, "Sinh Môn khắc cho Giáp Tý (vốn)", nguon),
  );
}

// ============================================================================================
// 7. MUA HÀNG — nguồn: a5-cau-tai-hop-tac-kinh-doanh.md, mục III. Can Ngày = người mua, Can Giờ
// = hàng hóa.
// ============================================================================================
function luanMuaHang(laBan: LapLaBanResult): KetQuaHoiDapTaiChinh {
  const cn = canNgayCung(laBan);
  const cg = canGioCung(laBan);
  if (!cn || !cg) return khongXacDinh("Không xác định được cung Can Ngày hoặc Can Giờ.");
  const dt = [
    { nhan: "Can Ngày (người mua)", cung: cn },
    { nhan: "Can Giờ (hàng hóa)", cung: cg },
  ];
  const nguon = "a5-cau-tai-hop-tac-kinh-doanh.md, mục III";

  const chatLuongCanh: string[] = [];
  if (cg.saoThienBan === "T.Nhuế") chatLuongCanh.push("có dấu hiệu chất lượng hàng kém, nên kiểm tra kỹ trước khi nhận");
  if (cg.thienBanCan === "Tân" || cg.diaBanCan === "Tân") chatLuongCanh.push("hàng có khả năng bị lỗi, cần kiểm tra kỹ càng");
  if (cg.than === "H.Vũ" || cg.than === "Đ.Xà") chatLuongCanh.push("cẩn thận nguy cơ hàng giả/hàng không đúng như mô tả");

  if (laKV(cg) || laNhapMo(cg)) {
    return ketQua(
      "khong_thuan",
      `Mua hàng lần này không có lời, thậm chí có thể lỗ vốn.${chatLuongCanh.length ? " Ngoài ra: " + chatLuongCanh.join("; ") + "." : ""}`,
      chiTietDayDu(dt, "Can Giờ (hàng hóa) Không Vong hoặc Nhập Mộ", nguon),
    );
  }

  // Quy ước quanHeCung(A,B): "sinh"=A sinh B, "khac"=A khắc B, "bịKhac"=B khắc A.
  const qh = quanHeCung(cg.soCung, cn.soCung); // Can Giờ (hàng) → Can Ngày (người mua)
  const canhBao = chatLuongCanh.length ? ` Lưu ý thêm: ${chatLuongCanh.join("; ")}.` : "";
  // "Can giờ sinh Can ngày thì bất luận hàng hoá tốt hay xấu vẫn có lời."
  if (qh === "sinh") {
    return ketQua("thuan_loi", `Mua hàng lần này có lời, bất luận chất lượng hàng tốt hay chưa thật hoàn hảo.${canhBao}`, chiTietDayDu(dt, "Can Giờ (hàng hóa) sinh Can Ngày (người mua) — bất luận hàng tốt xấu vẫn có lời", nguon));
  }
  // "Can ngày khắc Can giờ thì mua có lời" (Can Ngày khắc Can Giờ = B khắc A = qh "bịKhac").
  if (qh === "bịKhac") {
    return ketQua("thuan_loi", `Mua hàng lần này có lời.${canhBao}`, chiTietDayDu(dt, "Can Ngày khắc Can Giờ — mua có lời", nguon));
  }
  // "Can ngày sinh Can giờ thì chủ động mua nhưng không có lời" (Can Ngày sinh Can Giờ = B sinh A = qh "duocSinh").
  if (qh === "duocSinh") {
    return ketQua("can_luu_y", `Bạn khá ưng/thích món hàng này nên chủ động mua, nhưng khó có lời — mua vì thích chứ không phải để kinh doanh có lãi.${canhBao}`, chiTietDayDu(dt, "Can Ngày sinh Can Giờ — chủ động mua nhưng không có lời", nguon));
  }
  // "Can giờ mà khắc Can ngày... thì không có lời mà còn lỗ vốn" (Can Giờ khắc Can Ngày = A khắc B = qh "khac").
  return ketQua("khong_thuan", `Mua hàng lần này không có lời, cần cẩn trọng nguy cơ lỗ vốn.${canhBao}`, chiTietDayDu(dt, "Can Giờ khắc Can Ngày — không có lời mà còn lỗ vốn", nguon));
}

// ============================================================================================
// 8. BÁN HÀNG — nguồn: a5-cau-tai-hop-tac-kinh-doanh.md, mục IV, "Cách 2" (Can Ngày = người bán,
// Can Giờ = hàng hóa, Giáp Tý/Mậu = vốn, Sinh Môn = lợi nhuận). Không dùng "Cách 1" (Trực Phù/
// Trực Sử) vì Cách 2 đã cho đủ cả góc độ "bán nhanh hay chậm" lẫn "có lời hay không" trong 1
// phương pháp, tránh mâu thuẫn khi trộn 2 cách.
// ============================================================================================
function luanBanHang(laBan: LapLaBanResult): KetQuaHoiDapTaiChinh {
  const cn = canNgayCung(laBan);
  const cg = canGioCung(laBan);
  const von = giapTyCung(laBan);
  const sm = sinhMonCung(laBan);
  if (!cn || !cg || !von || !sm) return khongXacDinh("Không xác định được cung Can Ngày, Can Giờ, Giáp Tý (vốn) hoặc Sinh Môn.");
  const dt = [
    { nhan: "Can Ngày (người bán)", cung: cn },
    { nhan: "Can Giờ (hàng hóa)", cung: cg },
    { nhan: "Giáp Tý/Mậu (vốn)", cung: von },
    { nhan: "Sinh Môn (lợi nhuận)", cung: sm },
  ];
  const nguon = "a5-cau-tai-hop-tac-kinh-doanh.md, mục IV";

  const qhTocDo = quanHeCung(cn.soCung, cg.soCung); // Can Ngày → Can Giờ: tốc độ giao dịch
  let dongToc: string;
  if (qhTocDo === "sinh") dongToc = "Bạn đang lưu luyến/tiếc món hàng nên chưa thật sự muốn bán.";
  else if (qhTocDo === "khac") dongToc = "Bạn muốn bán nhanh nhưng giao dịch có thể diễn ra chậm hơn mong đợi.";
  else if (qhTocDo === "bịKhac") dongToc = "Giao dịch bán hàng có thể diễn ra khá nhanh.";
  else dongToc = "Tốc độ giao dịch ở mức bình thường.";

  const coLoiTuCg = quanHeCung(cg.soCung, von.soCung) === "sinh" || quanHeCung(cg.soCung, sm.soCung) === "sinh";
  if (coLoiTuCg) {
    return ketQua("thuan_loi", `Bán hàng lần này có lời. ${dongToc}`, chiTietDayDu(dt, "Can Giờ (hàng hóa) sinh cho Giáp Tý (vốn) hoặc Sinh Môn", nguon));
  }
  return ketQua(
    "can_luu_y",
    `Bán hàng lần này khó có lời, nhưng vẫn giữ được vốn — không xem đây là thất bại. ${dongToc}`,
    chiTietDayDu(dt, "Can Giờ (hàng hóa) không sinh cho Giáp Tý (vốn) hay Sinh Môn, hoặc khắc nhau — không lời nhưng bảo toàn vốn là tốt", nguon),
  );
}

// ============================================================================================
// 9. MỞ CỬA HÀNG/CÔNG TY — nguồn: a5-cau-tai-hop-tac-kinh-doanh.md, mục V. Khai Môn = cửa hàng/
// cửa hiệu/công ty, Can Ngày = người hỏi.
// ============================================================================================
function luanMoCuaHang(laBan: LapLaBanResult): KetQuaHoiDapTaiChinh {
  const km = timMonCung(laBan, "KHAI");
  const cn = canNgayCung(laBan);
  if (!km || !cn) return khongXacDinh("Không xác định được cung Khai Môn hoặc Can Ngày.");
  const dt = [
    { nhan: "Khai Môn (cửa hàng/công ty)", cung: km },
    { nhan: "Can Ngày (người hỏi)", cung: cn },
  ];
  const nguon = "a5-cau-tai-hop-tac-kinh-doanh.md, mục V";

  if (laKV(km) || laNhapMo(km)) {
    return ketQua(
      "khong_thuan",
      "Thời điểm này không thuận để mở cửa hàng/công ty mới — dễ phải đóng cửa hoặc ngừng kinh doanh giữa chừng nếu cố mở lúc này. Nên cân nhắc dời lại.",
      chiTietDayDu(dt, "Khai Môn Không Vong hoặc Nhập Mộ", nguon),
    );
  }

  const qh = quanHeCung(km.soCung, cn.soCung); // Khai Môn → Can Ngày
  if (qh === "sinh") {
    return ketQua("thuan_loi", "Mở cửa hàng/công ty vào lúc này khá thuận lợi, có tiềm năng kinh doanh phát đạt.", chiTietDayDu(dt, "Khai Môn sinh cho cung Can Ngày", nguon));
  }
  if (qh === "hoa") {
    return ketQua("thuan_loi", "Mở cửa hàng/công ty vào lúc này có lợi, hai bên (bạn và việc kinh doanh) cùng thuận.", chiTietDayDu(dt, "Khai Môn và cung Can Ngày tỉ hòa", nguon));
  }
  return ketQua(
    "khong_thuan",
    "Mở cửa hàng/công ty vào lúc này có rủi ro hao hụt vốn, thậm chí thua lỗ. Nên cân nhắc kỹ về thời điểm hoặc quy mô trước khi khai trương.",
    chiTietDayDu(dt, "Khai Môn khắc cung Can Ngày, hoặc quan hệ không thuận", nguon),
  );
}

// ============================================================================================
// 10. HỢP TÁC LÀM ĂN — nguồn: a5-cau-tai-hop-tac-kinh-doanh.md, mục VI. Can Ngày = mình, Can Giờ
// = đối tác.
// ============================================================================================
function luanHopTacLamAn(laBan: LapLaBanResult): KetQuaHoiDapTaiChinh {
  const cn = canNgayCung(laBan);
  const cg = canGioCung(laBan);
  const sm = sinhMonCung(laBan);
  if (!cn || !cg) return khongXacDinh("Không xác định được cung Can Ngày hoặc Can Giờ.");
  const dt = [
    { nhan: "Can Ngày (mình)", cung: cn },
    { nhan: "Can Giờ (đối tác)", cung: cg },
    { nhan: "Sinh Môn (tiền bạc)", cung: sm },
  ];
  const nguon = "a5-cau-tai-hop-tac-kinh-doanh.md, mục VI";

  const qh = quanHeCung(cg.soCung, cn.soCung); // Can Giờ (đối tác) → Can Ngày (mình)
  let ketLuan: KetQuaHoiDapTaiChinh;
  if (qh === "sinh") {
    ketLuan = ketQua("thuan_loi", "Hợp tác lần này có lợi cho bạn nhiều hơn.", chiTietDayDu(dt, "Can Giờ (đối tác) sinh cho Can Ngày (mình)", nguon));
  } else if (qh === "duocSinh" /* Can Ngày sinh Can Giờ */) {
    ketLuan = ketQua("can_luu_y", "Hợp tác lần này có lợi cho đối tác nhiều hơn bạn.", chiTietDayDu(dt, "Can Ngày sinh cho Can Giờ (đối tác)", nguon));
  } else if (qh === "hoa") {
    ketLuan = ketQua("thuan_loi", "Hợp tác lần này công bằng, hai bên đều có lợi ngang nhau.", chiTietDayDu(dt, "Can Ngày và Can Giờ tỉ hòa", nguon));
  } else if (qh === "khac" /* Can Giờ khắc Can Ngày */) {
    ketLuan = ketQua("khong_thuan", "Hợp tác lần này bất lợi cho bạn — nên cân nhắc kỹ điều khoản trước khi ký kết, tránh phần thiệt nghiêng về phía mình.", chiTietDayDu(dt, "Can Giờ (đối tác) khắc Can Ngày (mình)", nguon));
  } else {
    ketLuan = ketQua("can_luu_y", "Hợp tác lần này bất lợi cho đối tác — nên chia sẻ công bằng hơn nếu muốn hợp tác lâu dài, tránh để đối tác chịu thiệt quá nhiều.", chiTietDayDu(dt, "Can Ngày (mình) khắc Can Giờ (đối tác)", nguon));
  }

  if (sm) {
    const qhSm = quanHeCung(sm.soCung, cn.soCung);
    if (qhSm === "sinh") ketLuan.vanBan += " Về tiền bạc trong hợp tác này, dấu hiệu khá tốt cho bạn.";
    else if (qhSm === "khac" || qhSm === "bịKhac") ketLuan.vanBan += " Về tiền bạc trong hợp tác này, cần cẩn thận vì có dấu hiệu bất lợi cho bạn.";
  }
  return ketLuan;
}

const BANG_LUAN: Record<string, (laBan: LapLaBanResult) => KetQuaHoiDapTaiChinh> = {
  tai_van_chung: luanTaiVanChung,
  vay_tien: luanVayTien,
  cho_vay: luanChoVay,
  doi_no: luanDoiNo,
  giao_dich: luanGiaoDichMuaBan,
  dau_tu: luanDauTu,
  mua_hang: luanMuaHang,
  ban_hang: luanBanHang,
  mo_cua_hang: luanMoCuaHang,
  hop_tac_lam_an: luanHopTacLamAn,
};

/** Luận 1 tình huống thuộc chủ đề Tài Chính. Trả về null nếu tinhHuongId không thuộc chủ đề này
 * (chủ đề khác chưa có luật — xem result.ts, vẫn trả thông báo "đang cập nhật"). */
export function luanHoiDapTaiChinh(laBan: LapLaBanResult, tinhHuongId: string): KetQuaHoiDapTaiChinh | null {
  const ham = BANG_LUAN[tinhHuongId];
  if (!ham) return null;
  if (laBan.cheDo === "menh") return khongXacDinh("Chủ đề Hỏi Đáp không dùng chế độ Mệnh.");
  return ham(laBan);
}
