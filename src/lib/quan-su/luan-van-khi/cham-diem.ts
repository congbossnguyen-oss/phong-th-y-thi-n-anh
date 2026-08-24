// TẦNG CHẤM ĐIỂM — SPEC.md §3: 4 lĩnh vực × 0-10, khởi điểm 5, cộng/trừ theo dấu hiệu trong
// config-linh-vuc.json. Mỗi dấu hiệu ĐÃ khớp được ghi lại nguyên văn vào `canCu[]` — AI (tầng sau)
// chỉ được diễn giải từ đây, không tự thêm.
//
// ⚠️ PHẠM VI: không phải mọi dấu hiệu liệt kê trong config-linh-vuc.json đều tính được từ dữ liệu
// hiện có trong repo. Các dấu hiệu cần bảng KHÔNG có sẵn (Đào Hoa/Hồng Loan/Hồng Diễm/Kình Dương cho
// MỘT NĂM TUẾ VẬN cụ thể — bat-tu.ts chỉ tính các thần sát này cho 4 trụ nguyên cục, không export
// công thức để áp cho Lưu Niên) bị bỏ qua có chủ đích, đúng SPEC nguyên tắc 4 ("thiếu căn cứ → không
// bịa"). Các dấu hiệu còn lại được implement bám sát logic_tom_tat của từng lĩnh vực trong config.
import { hanhCan, hanhKhacX, KHAC_MAP } from "../../bat-tu-engine/engine";
import type { Hanh, TuTruInput } from "../../bat-tu-engine/engine";
import { thapThanCuaCan } from "./tang-dong";
import type { DiemLinhVuc, LinhVucKey, TrangThaiThoiDiem } from "./types";
import configRaw from "./config-linh-vuc.json";

interface ConfigLinhVucItem {
  ten_hien_thi: string;
  thap_than_lien_quan?: string[];
  thap_than_lien_quan_nam?: string[];
  thap_than_lien_quan_nu?: string[];
  cong_diem_khi: string[];
  tru_diem_khi: string[];
}
const CONFIG = configRaw as unknown as {
  linh_vuc: Record<LinhVucKey, ConfigLinhVucItem>;
  thang_nhan: Record<string, { nhan: string; mau: string }>;
};

const VUONG_ISH = new Set(["Vượng", "Cường vượng", "Cực cường"]);
const NHUOC_ISH = new Set(["Nhược", "Suy", "Cực nhược"]);

export interface NguCanhChamDiem {
  tt: TuTruInput;
  trangThai: TrangThaiThoiDiem;
  /** capDo NGUYÊN CỤC (không phải tại thời điểm) — vài dấu hiệu so sánh trước/sau. */
  capDoGoc: string;
  gioiTinh: "Nam" | "Nữ";
}

function nhanTuDiem(diem: number): { nhan: string; mauSac: string } {
  const key = diem >= 8 ? "8-10" : diem >= 6 ? "6-7" : diem === 5 ? "5" : diem >= 3 ? "3-4" : "0-2";
  const g = CONFIG.thang_nhan[key];
  return { nhan: g.nhan, mauSac: g.mau };
}

/** true nếu 1 Thập Thần cụ thể có mặt (thấu can) trong 3 trụ Năm/Tháng/Giờ của nguyên cục — dùng để
 *  xét "hỗn tạp"/"phá Quan" (cần biết nguyên cục có sẵn Thập Thần đó không, không chỉ riêng tuế vận). */
function coThapThanThauTrongNguyenCuc(tt: TuTruInput, ten: string): boolean {
  const nhatChuCan = tt.ngay.can;
  return [tt.nam.can, tt.thang.can, tt.gio.can].some((c) => thapThanCuaCan(c, nhatChuCan) === ten);
}
function hoQuanSatHonTap(tt: TuTruInput): boolean {
  return coThapThanThauTrongNguyenCuc(tt, "Chính Quan") && coThapThanThauTrongNguyenCuc(tt, "Thất Sát");
}

type LuatDiem = { text: string; trongSo: number; kiemTra: (ctx: NguCanhChamDiem, thapThanTueVan: string, nhatChu: Hanh) => boolean };

function xayLuat(linhVuc: LinhVucKey): { cong: LuatDiem[]; tru: LuatDiem[] } {
  const cfg = CONFIG.linh_vuc[linhVuc];
  const hopChar = (text: string, trongSo: number, kiemTra: LuatDiem["kiemTra"]): LuatDiem => ({ text, trongSo, kiemTra });

  if (linhVuc === "tai_van") {
    return {
      cong: [
        hopChar(cfg.cong_diem_khi[0]!, 2, (ctx, tt) => (tt === "Chính Tài" || tt === "Thiên Tài") && VUONG_ISH.has(ctx.trangThai.vuongSuyTaiThoiDiem)),
        hopChar(cfg.cong_diem_khi[1]!, 1, (ctx, tt, nc) => (tt === "Thực Thần" || tt === "Thương Quan") && ctx.trangThai.dungThanTaiThoiDiem === KHAC_MAP[nc]),
        hopChar(cfg.cong_diem_khi[2]!, 1, (ctx, tt) => (tt === "Chính Tài" || tt === "Thiên Tài") && (ctx.trangThai.dungThanTaiThoiDiem === hanhCan(ctx.trangThai.canChi.can) || ctx.trangThai.hyThan === hanhCan(ctx.trangThai.canChi.can))),
        hopChar(cfg.cong_diem_khi[3]!, 1, (ctx) => ctx.trangThai.quanHeKichHoat.includes("mo_bi_xung_khai") && VUONG_ISH.has(ctx.trangThai.vuongSuyTaiThoiDiem)),
      ],
      tru: [
        hopChar(cfg.tru_diem_khi[0]!, 1, (ctx, tt) => (tt === "Tỷ Kiên" || tt === "Kiếp Tài") && VUONG_ISH.has(ctx.trangThai.vuongSuyTaiThoiDiem)),
        hopChar(cfg.tru_diem_khi[1]!, 2, (ctx, tt) => (tt === "Chính Tài" || tt === "Thiên Tài") && NHUOC_ISH.has(ctx.trangThai.vuongSuyTaiThoiDiem)),
        hopChar(cfg.tru_diem_khi[2]!, 1, (ctx, tt) => tt === "Thiên Ấn"),
      ],
    };
  }
  if (linhVuc === "quan_van") {
    return {
      cong: [
        hopChar(cfg.cong_diem_khi[0]!, 1, (ctx, tt, nc) => (tt === "Chính Quan" || tt === "Thất Sát") && (ctx.trangThai.dungThanTaiThoiDiem === hanhSinhChoAn(nc) || ctx.trangThai.hyThan === hanhSinhChoAn(nc))),
        hopChar(cfg.cong_diem_khi[1]!, 1, (ctx, tt) => tt === "Chính Quan" && VUONG_ISH.has(ctx.trangThai.vuongSuyTaiThoiDiem)),
        hopChar(cfg.cong_diem_khi[2]!, 1, (ctx, tt) => tt === "Thất Sát" && VUONG_ISH.has(ctx.trangThai.vuongSuyTaiThoiDiem)),
      ],
      tru: [
        hopChar(cfg.tru_diem_khi[0]!, 2, (ctx, tt) => tt === "Chính Quan" && coThapThanThauTrongNguyenCuc(ctx.tt, "Thương Quan")),
        hopChar(cfg.tru_diem_khi[1]!, 1, (ctx, tt, nc) => (tt === "Chính Quan" || tt === "Thất Sát") && ctx.trangThai.kyThan === hanhSinhChoAn(nc)),
        hopChar(cfg.tru_diem_khi[2]!, 1, (ctx, tt, nc) => (tt === "Chính Tài" || tt === "Thiên Tài") && ctx.trangThai.dungThanTaiThoiDiem === hanhSinhChoAn(nc)),
        hopChar(cfg.tru_diem_khi[3]!, 1, (ctx, tt) => hoQuanSatHonTap(ctx.tt) && (tt === "Chính Quan" || tt === "Thất Sát")),
      ],
    };
  }
  if (linhVuc === "suc_khoe") {
    return {
      cong: [
        hopChar(cfg.cong_diem_khi[0]!, 1, (ctx, tt, nc) => tt === "Chính Ấn" || tt === "Thiên Ấn" || ctx.trangThai.dungThanTaiThoiDiem === hanhCan(ctx.trangThai.canChi.can)),
        hopChar(cfg.cong_diem_khi[1]!, 1, (ctx) => khoangCachTrungHoa(ctx.trangThai.vuongSuyTaiThoiDiem) < khoangCachTrungHoa(ctx.capDoGoc)),
      ],
      tru: [
        // LƯU Ý: KHÔNG ràng buộc thêm "capDo tại thời điểm phải vượng-ish" — Kỵ Thần có thể là phe
        // ĐỒNG hay DỊ đảng với Nhật Chủ tùy chart (vd Phù Ức "Phù" chọn Ấn làm dụng thì Kỵ = Tài, vốn
        // là phe dị đảng, "Tài vượng" thực ra kéo capDo NHƯỢC hơn chứ không vượng hơn) — ràng buộc đó
        // từng làm tín hiệu này im lặng sai ở đúng ca "Phù". Kỵ Thần thấu Can tuế vận là đủ mạnh để
        // tính là dấu hiệu, không cần thêm điều kiện capDo (đã thử và sai với chart tham chiếu 15/6/1990).
        hopChar(cfg.tru_diem_khi[0]!, 2, (ctx) => hanhCan(ctx.trangThai.canChi.can) === ctx.trangThai.kyThan),
        hopChar(cfg.tru_diem_khi[1]!, 1, (ctx) => ctx.trangThai.quanHeKichHoat.includes("tue_van_cung_gap")),
        hopChar(cfg.tru_diem_khi[2]!, 2, (ctx) => ctx.trangThai.quanHeKichHoat.includes("thien_khac_dia_xung_nhat_can")),
        hopChar(cfg.tru_diem_khi[3]!, 1, (ctx, tt, nc) => ctx.trangThai.quanHeKichHoat.includes(`nhap_mo:${nc}`) || ctx.trangThai.quanHeKichHoat.includes("mo_bi_xung_khai")),
      ],
    };
  }
  // tinh_duyen — gender chi phối (SPEC §3).
  return {
    cong: [
      hopChar(cfg.cong_diem_khi[0]!, 2, (ctx, _tt, nc) => {
        const hanhTaiQuan = ctx.gioiTinh === "Nam" ? KHAC_MAP[nc] : hanhKhacX(nc);
        return ctx.trangThai.quanHeKichHoat.includes(`hoa_can:${hanhTaiQuan}`) && (ctx.trangThai.dungThanTaiThoiDiem === hanhTaiQuan || ctx.trangThai.hyThan === hanhTaiQuan);
      }),
      hopChar(cfg.cong_diem_khi[1]!, 1, (ctx) => ctx.trangThai.quanHeKichHoat.includes("hop_nhat_chi")),
      hopChar(cfg.cong_diem_khi[3]!, 1, (ctx, tt) => {
        const lienQuan = ctx.gioiTinh === "Nam" ? ["Chính Tài", "Thiên Tài"] : ["Chính Quan", "Thất Sát"];
        return VUONG_ISH.has(ctx.trangThai.vuongSuyTaiThoiDiem) && lienQuan.includes(tt);
      }),
    ],
    tru: [
      hopChar(cfg.tru_diem_khi[0]!, 2, (ctx) => ctx.trangThai.quanHeKichHoat.includes("xung_nhat_chi")),
      hopChar(cfg.tru_diem_khi[1]!, 1, (ctx, _tt, nc) => {
        const hanhTaiQuan = ctx.gioiTinh === "Nam" ? KHAC_MAP[nc] : hanhKhacX(nc);
        return ctx.trangThai.quanHeKichHoat.includes(`nhap_mo:${hanhTaiQuan}`);
      }),
      hopChar(cfg.tru_diem_khi[3]!, 1, (ctx, _tt, nc) => {
        const hanhTaiQuan = ctx.gioiTinh === "Nam" ? KHAC_MAP[nc] : hanhKhacX(nc);
        return ctx.trangThai.quanHeKichHoat.includes(`hoa_can:${hanhTaiQuan}`) && ctx.trangThai.kyThan === hanhTaiQuan;
      }),
    ],
  };
}
// Ấn của Nhật Chủ (hành sinh ra Nhật Chủ) — dùng lại đúng chiều "SINH_MAP" nhưng tra ngược, viết hàm
// nhỏ tại đây cho gọn thay vì import thêm (đã có hanhSinhCho tương đương trong engine.ts nhưng không
// export — dùng KHAC_MAP/hanhKhacX đã export thì đủ cho Tài/Quan Sát; Ấn suy ngược qua SINH_MAP thủ
// công 5 dòng, không phải bảng mới).
const SINH: Record<Hanh, Hanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
function hanhSinhChoAn(nhatChu: Hanh): Hanh {
  return (Object.keys(SINH) as Hanh[]).find((h) => SINH[h] === nhatChu)!;
}
function khoangCachTrungHoa(capDo: string): number {
  const THU_TU = ["Cực nhược", "Nhược", "Suy", "Trung hòa", "Vượng", "Cường vượng", "Cực cường"];
  return Math.abs(THU_TU.indexOf(capDo) - THU_TU.indexOf("Trung hòa"));
}

/**
 * Chấm điểm 1 lĩnh vực tại 1 mốc — SPEC.md §3 thuật toán.
 */
export function chamDiemLinhVuc(linhVuc: LinhVucKey, ctx: NguCanhChamDiem): DiemLinhVuc {
  const nhatChu = hanhCan(ctx.tt.ngay.can);
  const thapThanTueVan = thapThanCuaCan(ctx.trangThai.canChi.can, ctx.tt.ngay.can);
  const { cong, tru } = xayLuat(linhVuc);

  let diem = 5;
  const canCu: string[] = [];
  for (const luat of cong) {
    if (luat.kiemTra(ctx, thapThanTueVan, nhatChu)) { diem += luat.trongSo; canCu.push(luat.text); }
  }
  for (const luat of tru) {
    if (luat.kiemTra(ctx, thapThanTueVan, nhatChu)) { diem -= luat.trongSo; canCu.push(luat.text); }
  }
  diem = Math.max(0, Math.min(10, Math.round(diem)));

  if (canCu.length === 0) canCu.push("Không đủ dấu hiệu rõ theo nguồn — giữ mức trung tính.");

  const { nhan, mauSac } = nhanTuDiem(diem);
  return { linhVuc, diem, nhan, mauSac, canCu };
}

export function chamDiem4LinhVuc(ctx: NguCanhChamDiem): DiemLinhVuc[] {
  return (["tai_van", "quan_van", "suc_khoe", "tinh_duyen"] as LinhVucKey[]).map((lv) => chamDiemLinhVuc(lv, ctx));
}
