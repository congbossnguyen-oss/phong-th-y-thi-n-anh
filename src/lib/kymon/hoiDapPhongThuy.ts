// Luận Hỏi Đáp Kỳ Môn — chủ đề PHONG THỦY (1/2 tình huống: "xem nhà/đất").
//
// Nguồn: ky-mon-phong-thuy-chanminhmetaphysics.md — file DẠNG BẢNG (không phải văn xuôi OCR lỗi
// như các sách khác), đọc rõ ràng, không mơ hồ:
//
// "CÁCH CỤC TÍCH CỰC": Sinh Môn / Khai Môn / Hưu Môn ĐỒNG CUNG với Can Ngày → tốt.
// "CÁCH CỤC TIÊU CỰC": Tử Môn / Thương Môn / Cảnh Môn / Kinh Môn ĐỒNG CUNG với Can Giờ VÀ khắc
// Can Ngày → xấu ("các cửa này đều Đắc Khí" — chiếm ưu thế nên gây hại khi khắc).
// "DỰ ĐOÁN KHI KHÔNG ĐỦ THÔNG TIN" (khớp đúng tình huống Nhóm 1 — khách chỉ hỏi nhanh, không có
// bản vẽ nhà chi tiết): Hưu Môn = năng lượng bên trong nhà, Sinh Môn = nguồn khí — dùng làm tiêu
// chí phụ khi không rơi vào cách cục tích cực/tiêu cực rõ ràng ở trên.
//
// Tình huống "chọn hướng đặt vật" (bếp/bàn thờ) CHƯA làm — nguồn có gợi ý Bính = nhà bếp (bảng
// Thập Thiên Can) nhưng không có công thức cát/hung rõ ràng cho việc CHỌN hướng đặt, chỉ có vị
// trí biểu tượng — không đủ để trả lời "nên đặt hướng nào", không đoán thêm.

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

export interface KetQuaHoiDapPhongThuy {
  hopLe: boolean;
  xuHuong: "thuan_loi" | "can_luu_y" | "khong_thuan";
  vanBan: string;
  chiTiet: string;
}
function ketQua(xuHuong: KetQuaHoiDapPhongThuy["xuHuong"], vanBan: string, chiTiet: string): KetQuaHoiDapPhongThuy {
  return { hopLe: true, xuHuong, vanBan, chiTiet };
}
function khongXacDinh(ly: string): KetQuaHoiDapPhongThuy {
  return { hopLe: false, xuHuong: "can_luu_y", vanBan: "Chưa đủ dữ liệu trên lá bàn để luận rõ tình huống này.", chiTiet: ly };
}

function luanXemNhaDat(laBan: LapLaBanResult): KetQuaHoiDapPhongThuy {
  const cn = laBan.tuTru.ngay?.can ? timCungTheoCan(laBan, laBan.tuTru.ngay.can) : undefined;
  const cg = laBan.tuTru.gio?.can ? timCungTheoCan(laBan, laBan.tuTru.gio.can) : undefined;
  if (!cn || !cg) return khongXacDinh("Không xác định được cung Can Ngày hoặc Can Giờ.");
  const dtGoc = [
    { nhan: "Can Ngày (người ở/mua)", cung: cn },
    { nhan: "Can Giờ", cung: cg },
  ];

  const monTichCuc = ["SINH", "KHAI", "HƯU"]
    .map((m) => timMonCung(laBan, m))
    .filter((c): c is CungInfo => !!c && c.soCung === cn.soCung);
  const monTieuCuc = ["TỬ", "THƯƠNG", "CẢNH", "KINH"]
    .map((m) => timMonCung(laBan, m))
    .filter((c): c is CungInfo => !!c && c.soCung === cg.soCung && quanHeCung(c.soCung, cn.soCung) === "khac");

  if (monTichCuc.length > 0 && monTieuCuc.length === 0) {
    const dt = [...dtGoc, ...monTichCuc.map((c) => ({ nhan: `${c.mon} Môn (cách cục tích cực)`, cung: c }))];
    return ketQua(
      "thuan_loi",
      "Căn nhà/mảnh đất này có dấu hiệu khá hợp — nguồn khí và năng lượng tổng thể thuận với người ở/mua.",
      chiTietDayDu(dt, `${monTichCuc.map((c) => c.mon).join("/")} Môn đồng cung với Can Ngày — cách cục tích cực`, "ky-mon-phong-thuy-chanminhmetaphysics.md"),
    );
  }
  if (monTieuCuc.length > 0 && monTichCuc.length === 0) {
    const dt = [...dtGoc, ...monTieuCuc.map((c) => ({ nhan: `${c.mon} Môn (cách cục tiêu cực)`, cung: c }))];
    return ketQua(
      "khong_thuan",
      "Căn nhà/mảnh đất này có dấu hiệu chưa thực sự hợp — nên cân nhắc kỹ hoặc xem thêm phương án khác trước khi quyết định.",
      chiTietDayDu(dt, `${monTieuCuc.map((c) => c.mon).join("/")} Môn đồng cung với Can Giờ và khắc Can Ngày — cách cục tiêu cực`, "ky-mon-phong-thuy-chanminhmetaphysics.md"),
    );
  }
  if (monTichCuc.length > 0 && monTieuCuc.length > 0) {
    const dt = [
      ...dtGoc,
      ...monTichCuc.map((c) => ({ nhan: `${c.mon} Môn (cách cục tích cực)`, cung: c })),
      ...monTieuCuc.map((c) => ({ nhan: `${c.mon} Môn (cách cục tiêu cực)`, cung: c })),
    ];
    return ketQua(
      "can_luu_y",
      "Căn nhà/mảnh đất này có cả tín hiệu tốt lẫn tín hiệu cần lưu ý — không xấu hẳn nhưng cũng chưa thuận trọn vẹn, nên cân nhắc thêm các yếu tố thực tế khác (giá cả, vị trí, nhu cầu sử dụng).",
      chiTietDayDu(dt, "Vừa có Môn thuộc nhóm tích cực đồng cung Can Ngày, vừa có Môn thuộc nhóm tiêu cực đồng cung Can Giờ và khắc Can Ngày", "ky-mon-phong-thuy-chanminhmetaphysics.md"),
    );
  }

  // Không rơi vào cách cục rõ ràng — dùng dụng thần "khi không đủ thông tin": Hưu Môn (năng
  // lượng bên trong) và Sinh Môn (nguồn khí) so với Can Ngày.
  const huuMon = timMonCung(laBan, "HƯU");
  const sinhMon = timMonCung(laBan, "SINH");
  const dt = [...dtGoc, { nhan: "Hưu Môn (năng lượng bên trong nhà)", cung: huuMon }, { nhan: "Sinh Môn (nguồn khí)", cung: sinhMon }];
  const nguonKhongDu = "ky-mon-phong-thuy-chanminhmetaphysics.md, mục 'Dự đoán khi không đủ thông tin'";
  const qhHuu = huuMon ? quanHeCung(huuMon.soCung, cn.soCung) : undefined;
  const qhSinh = sinhMon ? quanHeCung(sinhMon.soCung, cn.soCung) : undefined;
  const tot = qhHuu === "sinh" || qhSinh === "sinh";
  const xau = qhHuu === "khac" || qhSinh === "khac";

  if (tot && !xau) {
    return ketQua("thuan_loi", "Căn nhà/mảnh đất này nhìn chung ổn, năng lượng bên trong và nguồn khí đều có dấu hiệu thuận.", chiTietDayDu(dt, "Hưu Môn hoặc Sinh Môn sinh cho Can Ngày", nguonKhongDu));
  }
  if (xau && !tot) {
    return ketQua("khong_thuan", "Căn nhà/mảnh đất này có vài điểm cần cân nhắc về năng lượng/nguồn khí — nên xem thêm thực địa trước khi quyết định.", chiTietDayDu(dt, "Hưu Môn hoặc Sinh Môn khắc Can Ngày", nguonKhongDu));
  }
  return ketQua(
    "can_luu_y",
    "Chưa có tín hiệu rõ ràng theo hướng thuận hay không thuận — nên xem thêm thực địa và các yếu tố thực tế khác trước khi quyết định.",
    chiTietDayDu(dt, "Hưu Môn và Sinh Môn chưa rơi vào nhóm quy tắc rõ ràng so với Can Ngày", nguonKhongDu),
  );
}

const BANG_LUAN: Record<string, (laBan: LapLaBanResult) => KetQuaHoiDapPhongThuy> = {
  xem_nha_dat: luanXemNhaDat,
};

export function luanHoiDapPhongThuy(laBan: LapLaBanResult, tinhHuongId: string): KetQuaHoiDapPhongThuy | null {
  const ham = BANG_LUAN[tinhHuongId];
  if (!ham) return null;
  if (laBan.cheDo === "menh") return khongXacDinh("Chủ đề Hỏi Đáp không dùng chế độ Mệnh.");
  return ham(laBan);
}
