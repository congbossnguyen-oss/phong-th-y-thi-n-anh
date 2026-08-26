// Luận Hỏi Đáp Kỳ Môn — chủ đề TÌNH CẢM (4 tình huống, xem danhMucCauHoi.ts).
// Nguồn phương pháp: skill "luan-ky-mon-don-giap", tài liệu a3-luan-doan-hon-nhan-ket-hon-ly-hon.md,
// mục 1-3 (dụng thần + quy tắc tường minh). File nguồn còn có nhiều ví dụ thực chiến ở cuối
// nhưng dạng tường thuật tự do, không phải quy tắc dạng công thức — KHÔNG dùng để suy luật, chỉ
// dùng đúng 3 mục quy tắc rõ ràng đầu file.
//
// Quy ước ngũ hành: giống hệt hoiDapTaiChinh.ts — so sánh NGŨ HÀNH CỦA CUNG mà mỗi dụng thần đang
// "lạc" vào (Lạc Thư), khớp đúng chữ "lạc cung" dùng xuyên suốt nguồn ("Ất, Canh lạc cung, tương
// sinh...").

import type { CungInfo, LapLaBanResult } from "./types";
import { chiTietDayDu } from "./moTaChiTiet";

type NguHanh = "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";

// Copy riêng các bảng nền (trùng hoiDapTaiChinh.ts/luanGiaiMenh.ts) — module độc lập.
const NGU_HANH_CUNG: Record<number, NguHanh> = {
  1: "Thủy", 2: "Thổ", 3: "Mộc", 4: "Mộc", 5: "Thổ", 6: "Kim", 7: "Kim", 8: "Thổ", 9: "Hỏa",
};
const SINH_NEXT: Record<NguHanh, NguHanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
const KHAC_NEXT: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };

type QuanHe = "sinh" | "duocSinh" | "khac" | "bịKhac" | "hoa";

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

function timCungTheoCan(laBan: LapLaBanResult, can: string): CungInfo | undefined {
  if (can === "Giáp") return laBan.cungList.find((c) => c.thienBanCan === laBan.phuDau);
  const khopTrucTiep = laBan.cungList.find((c) => c.thienBanCan === can);
  if (khopTrucTiep) return khopTrucTiep;
  const trungCung = laBan.cungList.find((c) => c.soCung === 5);
  return trungCung && trungCung.diaBanCan === can ? trungCung : undefined;
}
function laKV(c: CungInfo | undefined): boolean {
  return !!c?.KV;
}

// ---- Dụng thần (mục 1) ----
function atCung(laBan: LapLaBanResult) {
  return timCungTheoCan(laBan, "Ất"); // người Nữ
}
function canhCung(laBan: LapLaBanResult) {
  return timCungTheoCan(laBan, "Canh"); // người Nam
}
function lucHopCung(laBan: LapLaBanResult) {
  return laBan.cungList.find((c) => c.than === "L.Hợp");
}
function dinhCung(laBan: LapLaBanResult) {
  return timCungTheoCan(laBan, "Đinh"); // đối tượng Nữ thứ 3 (bồ của chồng)
}
function binhCung(laBan: LapLaBanResult) {
  return timCungTheoCan(laBan, "Bính"); // đối tượng Nam thứ 3 (bồ của vợ)
}

export interface KetQuaHoiDapTinhCam {
  hopLe: boolean;
  xuHuong: "thuan_loi" | "can_luu_y" | "khong_thuan";
  vanBan: string;
  chiTiet: string;
}

function ketQua(xuHuong: KetQuaHoiDapTinhCam["xuHuong"], vanBan: string, chiTiet: string): KetQuaHoiDapTinhCam {
  return { hopLe: true, xuHuong, vanBan, chiTiet };
}
function khongXacDinh(ly: string): KetQuaHoiDapTinhCam {
  return { hopLe: false, xuHuong: "can_luu_y", vanBan: "Chưa đủ dữ liệu trên lá bàn để luận rõ tình huống này.", chiTiet: ly };
}

/** Quan hệ cốt lõi Ất(Nữ)-Canh(Nam), dùng chung cho "Hợp/không hợp" và "Tình trạng hôn nhân"
 * (nguồn: mục 1 "Ất, Canh lạc cung, tương sinh hoặc tỉ hoà... viên mãn" / "tương khắc thì...
 * bất hoà", mục 2 "xét hai Can lạc cung, tương sinh hoặc tương khắc để luận đoán tình trạng"). */
function xetQuanHeAtCanh(laBan: LapLaBanResult): { at: CungInfo; canh: CungInfo; qh: QuanHe | undefined } | null {
  const at = atCung(laBan);
  const canh = canhCung(laBan);
  if (!at || !canh) return null;
  if (at.soCung === canh.soCung) return { at, canh, qh: undefined }; // đồng cung — xử lý riêng
  return { at, canh, qh: quanHeCung(at.soCung, canh.soCung) };
}

function ghiChuMaiMoi(laBan: LapLaBanResult, at: CungInfo, canh: CungInfo): string {
  const lh = lucHopCung(laBan);
  if (!lh || laKV(lh)) return "";
  const qhNu = quanHeCung(lh.soCung, at.soCung);
  const qhNam = quanHeCung(lh.soCung, canh.soCung);
  if (qhNu === "sinh" && qhNam !== "sinh") return " Nếu có người mai mối/giới thiệu, họ đang nói tốt, nghiêng về phía người nữ.";
  if (qhNam === "sinh" && qhNu !== "sinh") return " Nếu có người mai mối/giới thiệu, họ đang nói tốt, nghiêng về phía người nam.";
  return "";
}

// ============================================================================================
// 1. HỢP/KHÔNG HỢP — nguồn: mục 1. Ất = người Nữ, Canh = người Nam, Lục Hợp = người mai mối.
// ============================================================================================
function luanHopKhongHop(laBan: LapLaBanResult): KetQuaHoiDapTinhCam {
  const x = xetQuanHeAtCanh(laBan);
  if (!x) return khongXacDinh("Không xác định được cung của Ất (Nữ) hoặc Canh (Nam).");
  const { at, canh, qh } = x;
  const lh = lucHopCung(laBan);
  const dt = [
    { nhan: "Ất (người nữ)", cung: at },
    { nhan: "Canh (người nam)", cung: canh },
    { nhan: "Lục Hợp (mai mối)", cung: lh },
  ];
  const nguon = "a3-luan-doan-hon-nhan-ket-hon-ly-hon.md, mục 1";

  if (qh === undefined) {
    return ketQua(
      "thuan_loi",
      "Hai người đã khá gắn bó, mối quan hệ đang ở giai đoạn gần gũi, thân thiết như đã là một cặp thực sự.",
      chiTietDayDu(dt, "Ất và Canh đồng cung — đã ở với nhau rồi", nguon),
    );
  }
  if (qh === "khac" || qh === "bịKhac") {
    return ketQua(
      "khong_thuan",
      `Hai người chưa thực sự hợp nhau, dễ nảy sinh bất đồng, khó tiến xa nếu không có sự nhường nhịn từ cả hai phía.${ghiChuMaiMoi(laBan, at, canh)}`,
      chiTietDayDu(dt, "Ất và Canh tương khắc", nguon),
    );
  }
  return ketQua(
    "thuan_loi",
    `Hai người khá hợp nhau, có nền tảng để xây dựng mối quan hệ lâu dài, hòa hợp.${ghiChuMaiMoi(laBan, at, canh)}`,
    chiTietDayDu(dt, "Ất và Canh tương sinh hoặc tỉ hòa", nguon),
  );
}

// ============================================================================================
// 2. TÌNH TRẠNG HÔN NHÂN — nguồn: mục 2. Cùng dụng thần Ất/Canh, khác góc nhìn: hỏi HIỆN TRẠNG
// (đã kết hôn) thay vì triển vọng.
// ============================================================================================
function luanTinhTrangHonNhan(laBan: LapLaBanResult): KetQuaHoiDapTinhCam {
  const x = xetQuanHeAtCanh(laBan);
  if (!x) return khongXacDinh("Không xác định được cung của Ất (Nữ) hoặc Canh (Nam).");
  const { at, canh, qh } = x;
  const dt = [
    { nhan: "Ất (vợ)", cung: at },
    { nhan: "Canh (chồng)", cung: canh },
  ];
  const nguon = "a3-luan-doan-hon-nhan-ket-hon-ly-hon.md, mục 2";

  if (qh === undefined) {
    return ketQua(
      "thuan_loi",
      "Vợ chồng hiện đang khá gắn bó, gần gũi, ít khoảng cách với nhau ở giai đoạn này.",
      chiTietDayDu(dt, "Ất và Canh đồng cung", nguon),
    );
  }
  if (qh === "khac" || qh === "bịKhac") {
    return ketQua(
      "khong_thuan",
      "Vợ chồng dạo này có phần căng thẳng, dễ xảy ra bất đồng, cãi vã hơn bình thường — nên chủ động lắng nghe và nhường nhịn nhau hơn giai đoạn này.",
      chiTietDayDu(dt, "Ất và Canh tương khắc", nguon),
    );
  }
  return ketQua(
    "thuan_loi",
    "Vợ chồng dạo này khá hòa hợp, dễ tìm được tiếng nói chung, hỗ trợ nhau tốt trong cuộc sống.",
    chiTietDayDu(dt, "Ất và Canh tương sinh hoặc tỉ hòa", nguon),
  );
}

// ============================================================================================
// 3. NGHI NGOẠI TÌNH — nguồn: mục 3. Đinh kỳ = bồ của chồng, Bính kỳ = bồ của vợ. Kiểm tra ĐỘC
// LẬP cả 2 khả năng (không cần biết trước đang nghi ai) — mỗi khả năng đúng khi thỏa 1 trong 3
// điều kiện: sinh cho người đó / được người đó sinh / là Địa Bàn Can của người đó.
// ============================================================================================
function xetNguoiThuBa(nguoi: CungInfo, kyNhan: CungInfo | undefined): boolean {
  if (!kyNhan) return false;
  const qh = quanHeCung(kyNhan.soCung, nguoi.soCung); // kỳ nhân → người
  const laDiaBanCan = nguoi.diaBanCan === kyNhan.thienBanCan;
  return qh === "sinh" || qh === "duocSinh" || laDiaBanCan;
}

function luanNghiNgoaiTinh(laBan: LapLaBanResult): KetQuaHoiDapTinhCam {
  const at = atCung(laBan);
  const canh = canhCung(laBan);
  if (!at || !canh) return khongXacDinh("Không xác định được cung của Ất (Nữ) hoặc Canh (Nam).");

  const dinh = dinhCung(laBan);
  const binh = binhCung(laBan);
  const chongCoBo = xetNguoiThuBa(canh, dinh);
  const voCoBo = xetNguoiThuBa(at, binh);
  const dt = [
    { nhan: "Canh (chồng)", cung: canh },
    { nhan: "Đinh kỳ (bồ của chồng)", cung: dinh },
    { nhan: "Ất (vợ)", cung: at },
    { nhan: "Bính kỳ (bồ của vợ)", cung: binh },
  ];
  const nguon = "a3-luan-doan-hon-nhan-ket-hon-ly-hon.md, mục 3";

  if (chongCoBo && voCoBo) {
    return ketQua(
      "khong_thuan",
      "Lá bàn cho thấy dấu hiệu không rõ ràng ở cả hai phía — nên bình tĩnh xác minh kỹ thông tin thực tế trước khi kết luận, tránh nghi oan.",
      chiTietDayDu(dt, "Cả Đinh kỳ (liên quan Canh/chồng) và Bính kỳ (liên quan Ất/vợ) đều thỏa điều kiện", nguon),
    );
  }
  if (chongCoBo) {
    return ketQua(
      "khong_thuan",
      "Lá bàn có dấu hiệu người chồng đang có mối quan hệ ngoài luồng. Nên bình tĩnh quan sát thêm, xác minh kỹ trước khi có hành động lớn.",
      chiTietDayDu(dt, "Đinh kỳ sinh cho Canh, hoặc Canh sinh Đinh kỳ, hoặc Đinh là Địa Bàn Can của cung Canh", nguon),
    );
  }
  if (voCoBo) {
    return ketQua(
      "khong_thuan",
      "Lá bàn có dấu hiệu người vợ đang có mối quan hệ ngoài luồng. Nên bình tĩnh quan sát thêm, xác minh kỹ trước khi có hành động lớn.",
      chiTietDayDu(dt, "Bính kỳ sinh cho Ất, hoặc Ất sinh Bính kỳ, hoặc Bính là Địa Bàn Can của cung Ất", nguon),
    );
  }
  return ketQua(
    "thuan_loi",
    "Lá bàn không cho thấy dấu hiệu rõ ràng của việc ngoại tình ở cả hai phía — nghi ngờ hiện tại nhiều khả năng chỉ là hiểu lầm hoặc chưa có cơ sở chắc chắn.",
    chiTietDayDu(dt, "Không thỏa điều kiện Đinh kỳ/Bính kỳ ở cả hai phía", nguon),
  );
}

// ============================================================================================
// 4. NÊN CƯỚI KHÔNG — nguồn: tổng hợp mục 1 (Ất-Canh + Lục Hợp), theo đúng dụng thần đã liệt kê
// trong danh mục (Ất/Canh, Lục Hợp). Không có 1 đoạn văn riêng trong nguồn cho câu hỏi này — dùng
// nhất quán cùng công thức đã áp dụng ở tình huống "Hợp/không hợp", diễn giải theo hướng ra quyết
// định thay vì mô tả trạng thái.
// ============================================================================================
function luanNenCuoiKhong(laBan: LapLaBanResult): KetQuaHoiDapTinhCam {
  const x = xetQuanHeAtCanh(laBan);
  if (!x) return khongXacDinh("Không xác định được cung của Ất (Nữ) hoặc Canh (Nam).");
  const { at, canh, qh } = x;
  const lh = lucHopCung(laBan);
  const dt = [
    { nhan: "Ất (người nữ)", cung: at },
    { nhan: "Canh (người nam)", cung: canh },
    { nhan: "Lục Hợp (mai mối)", cung: lh },
  ];
  const nguon = "a3-luan-doan-hon-nhan-ket-hon-ly-hon.md, mục 1";

  const atCanhTot = qh === undefined || qh === "sinh" || qh === "duocSinh" || qh === "hoa";
  if (!atCanhTot) {
    return ketQua(
      "khong_thuan",
      "Thời điểm này chưa thật sự thuận để tiến tới hôn nhân — nền tảng giữa hai người còn chưa vững, nên dành thêm thời gian tìm hiểu và giải quyết bất đồng trước khi quyết định.",
      chiTietDayDu(dt, "Ất và Canh tương khắc", nguon),
    );
  }

  if (lh && !laKV(lh)) {
    const qhLh = quanHeCung(lh.soCung, at.soCung) === "sinh" || quanHeCung(lh.soCung, canh.soCung) === "sinh";
    if (qhLh) {
      return ketQua(
        "thuan_loi",
        "Đây là thời điểm khá thuận để tiến tới hôn nhân — nền tảng giữa hai người tốt, lại có thêm sự ủng hộ từ người thân/bạn bè xung quanh.",
        chiTietDayDu(dt, "Ất-Canh tương sinh/tỉ hòa/đồng cung, đồng thời Lục Hợp sinh cho một trong hai bên", nguon),
      );
    }
  }
  if (laKV(lh)) {
    return ketQua(
      "can_luu_y",
      "Nền tảng giữa hai người khá tốt, nhưng nên cẩn thận với các yếu tố bên ngoài (người mai mối, lời khuyên từ người khác) có thể không đáng tin cậy lúc này — tự mình quyết định là chính.",
      chiTietDayDu(dt, "Ất-Canh tương sinh/tỉ hòa/đồng cung, nhưng Lục Hợp Không Vong", nguon),
    );
  }
  return ketQua(
    "thuan_loi",
    "Nền tảng giữa hai người khá tốt, có thể cân nhắc tiến tới hôn nhân khi cả hai đã sẵn sàng.",
    chiTietDayDu(dt, "Ất và Canh tương sinh, tỉ hòa, hoặc đồng cung", nguon),
  );
}

const BANG_LUAN: Record<string, (laBan: LapLaBanResult) => KetQuaHoiDapTinhCam> = {
  hop_khong_hop: luanHopKhongHop,
  tinh_trang_hon_nhan: luanTinhTrangHonNhan,
  nghi_ngoai_tinh: luanNghiNgoaiTinh,
  nen_cuoi: luanNenCuoiKhong,
};

/** Luận 1 tình huống thuộc chủ đề Tình Cảm. Trả về null nếu tinhHuongId không thuộc chủ đề này. */
export function luanHoiDapTinhCam(laBan: LapLaBanResult, tinhHuongId: string): KetQuaHoiDapTinhCam | null {
  const ham = BANG_LUAN[tinhHuongId];
  if (!ham) return null;
  if (laBan.cheDo === "menh") return khongXacDinh("Chủ đề Hỏi Đáp không dùng chế độ Mệnh.");
  return ham(laBan);
}
