// Luận Hỏi Đáp Kỳ Môn — chủ đề THỜI TIẾT (4 tình huống). Nguồn: a3-luan-doan-khi-hau-thoi-tiet.md.
// Đây là chủ đề duy nhất KHÔNG cần so sánh sinh/khắc — chỉ tra điều kiện Can + Cung trực tiếp.
// Luôn dùng lá bàn tại THỜI ĐIỂM hỏi (không hỗ trợ tra trước 1 ngày khác trong tương lai).

import type { CungInfo, LapLaBanResult } from "./types";

function timSaoCung(laBan: LapLaBanResult, sao: string): CungInfo | undefined {
  return laBan.cungList.find((c) => c.saoThienBan === sao);
}
/** Can Nhâm hoặc Quý (thiên bàn) đang đóng tại cung của sao này? */
function coNhamQuy(c: CungInfo | undefined): "Nhâm" | "Quý" | null {
  if (!c) return null;
  if (c.thienBanCan === "Nhâm") return "Nhâm";
  if (c.thienBanCan === "Quý") return "Quý";
  return null;
}

export interface KetQuaHoiDapThoiTiet {
  hopLe: boolean;
  xuHuong: "thuan_loi" | "can_luu_y" | "khong_thuan";
  vanBan: string;
  chiTiet: string;
}
function ketQua(xuHuong: KetQuaHoiDapThoiTiet["xuHuong"], vanBan: string, chiTiet: string): KetQuaHoiDapThoiTiet {
  return { hopLe: true, xuHuong, vanBan, chiTiet };
}
function khongXacDinh(ly: string): KetQuaHoiDapThoiTiet {
  return { hopLe: false, xuHuong: "can_luu_y", vanBan: "Chưa đủ dữ liệu trên lá bàn để luận rõ tình huống này.", chiTiet: ly };
}

// ============================================================================================
// 1. MƯA — nguồn mục 1. Thiên Trụ = thần mưa, Thiên Bồng = thần nước. Gặp Nhâm/Quý tại cung
// 1,3,6,7 thì có mưa (Nhâm=to, Quý=nhỏ).
// ============================================================================================
function luanMua(laBan: LapLaBanResult): KetQuaHoiDapThoiTiet {
  const truTinh = timSaoCung(laBan, "T.Trụ");
  const bongTinh = timSaoCung(laBan, "T.Bồng");
  if (!truTinh || !bongTinh) return khongXacDinh("Không xác định được cung Thiên Trụ hoặc Thiên Bồng.");

  const CUNG_MUA = new Set([1, 3, 6, 7]);
  for (const [ten, c] of [["Thiên Trụ", truTinh] as const, ["Thiên Bồng", bongTinh] as const]) {
    const can = coNhamQuy(c);
    if (can && CUNG_MUA.has(c.soCung)) {
      const doTo = can === "Nhâm" ? "mưa to" : "mưa nhỏ, mưa rào";
      return ketQua(
        "can_luu_y",
        `Thời điểm này có khả năng ${doTo}.`,
        `${ten} có Can ${can} tại cung thuộc nhóm 1/3/6/7 (a3-luan-doan-khi-hau-thoi-tiet.md, mục 1).`,
      );
    }
  }
  return ketQua(
    "thuan_loi",
    "Thời điểm này nhiều khả năng không mưa.",
    "Thiên Trụ và Thiên Bồng không có Nhâm/Quý tại cung 1/3/6/7 (a3-luan-doan-khi-hau-thoi-tiet.md, mục 1).",
  );
}

// ============================================================================================
// 2. SẤM CHỚP — nguồn mục 1. Thiên Trụ/Thiên Bồng gặp Nhâm/Quý tại cung Chấn (Đông, số 3).
// ============================================================================================
function luanSamChop(laBan: LapLaBanResult): KetQuaHoiDapThoiTiet {
  const truTinh = timSaoCung(laBan, "T.Trụ");
  const bongTinh = timSaoCung(laBan, "T.Bồng");
  if (!truTinh || !bongTinh) return khongXacDinh("Không xác định được cung Thiên Trụ hoặc Thiên Bồng.");

  for (const [ten, c] of [["Thiên Trụ", truTinh] as const, ["Thiên Bồng", bongTinh] as const]) {
    const can = coNhamQuy(c);
    if (can && c.soCung === 3) {
      return ketQua(
        "can_luu_y",
        "Thời điểm này có khả năng có sấm chớp.",
        `${ten} có Can ${can} tại cung Chấn (Đông) (a3-luan-doan-khi-hau-thoi-tiet.md, mục 1).`,
      );
    }
  }
  return ketQua(
    "thuan_loi",
    "Thời điểm này nhiều khả năng không có sấm chớp.",
    "Thiên Trụ và Thiên Bồng không có Nhâm/Quý tại cung Chấn (a3-luan-doan-khi-hau-thoi-tiet.md, mục 1).",
  );
}

// ============================================================================================
// 3. TUYẾT — nguồn mục 2. Thiên Tâm/Thiên Trụ gặp Nhâm/Quý tại cung Càn (Tây Bắc, 6) hoặc Đoài
// (Tây, 7).
// ============================================================================================
function luanTuyet(laBan: LapLaBanResult): KetQuaHoiDapThoiTiet {
  const tamTinh = timSaoCung(laBan, "T.Tâm");
  const truTinh = timSaoCung(laBan, "T.Trụ");
  if (!tamTinh || !truTinh) return khongXacDinh("Không xác định được cung Thiên Tâm hoặc Thiên Trụ.");

  for (const [ten, c] of [["Thiên Tâm", tamTinh] as const, ["Thiên Trụ", truTinh] as const]) {
    const can = coNhamQuy(c);
    if (can && (c.soCung === 6 || c.soCung === 7)) {
      return ketQua(
        "can_luu_y",
        "Thời điểm này có khả năng có tuyết rơi.",
        `${ten} có Can ${can} tại cung Càn/Đoài (a3-luan-doan-khi-hau-thoi-tiet.md, mục 2).`,
      );
    }
  }
  return ketQua(
    "thuan_loi",
    "Thời điểm này nhiều khả năng không có tuyết.",
    "Thiên Tâm và Thiên Trụ không có Nhâm/Quý tại cung Càn/Đoài (a3-luan-doan-khi-hau-thoi-tiet.md, mục 2).",
  );
}

// ============================================================================================
// 4. GIÓ — nguồn mục 3. Thiên Phụ Tinh rơi vào cung nào thì gió thổi hướng đó.
// ============================================================================================
function luanGio(laBan: LapLaBanResult): KetQuaHoiDapThoiTiet {
  const phuTinh = timSaoCung(laBan, "T.Phò");
  if (!phuTinh) return khongXacDinh("Không xác định được cung Thiên Phụ.");
  return ketQua(
    "can_luu_y",
    `Gió thời điểm này có xu hướng thổi theo hướng ${phuTinh.huong}. Độ mạnh/nhẹ chưa đủ dữ liệu để xác định chắc chắn.`,
    `Thiên Phụ Tinh tại ${phuTinh.huong} (a3-luan-doan-khi-hau-thoi-tiet.md, mục 3).`,
  );
}

const BANG_LUAN: Record<string, (laBan: LapLaBanResult) => KetQuaHoiDapThoiTiet> = {
  mua: luanMua,
  sam_chop: luanSamChop,
  tuyet: luanTuyet,
  gio: luanGio,
};

export function luanHoiDapThoiTiet(laBan: LapLaBanResult, tinhHuongId: string): KetQuaHoiDapThoiTiet | null {
  const ham = BANG_LUAN[tinhHuongId];
  if (!ham) return null;
  if (laBan.cheDo === "menh") return khongXacDinh("Chủ đề Hỏi Đáp không dùng chế độ Mệnh.");
  return ham(laBan);
}
