/**
 * LUẬN VẬN KHÍ — Đại Vận & Lưu Niên. Cửa vào duy nhất của module (SPEC.md, đọc trước khi sửa).
 *
 * BAO TRÙM (SPEC nguyên tắc 1) — module này KHÔNG lập lá số, KHÔNG tự tính vượng suy/dụng thần lần
 * đầu: gọi lại `tinhBatTu`/`tinhLuuNien` (bat-tu.ts) cho lá số + Đại Vận/Lưu Niên, và `phanTichBatTu`
 * (bat-tu-engine/engine.ts) cho vượng suy + Dụng/Hỷ/Kỵ/Cừu Thần GỐC. Tầng động (tang-dong.ts) chỉ
 * tính PHẦN CHÊNH khi ghép thêm tuế vận — không dựng lại 2 engine trên.
 *
 * CHI PHÍ AI: mỗi Lưu Niên = 1 lượt gọi Claude (tối đa +1 nếu hậu kiểm chặn). Để tránh gọi AI cho cả
 * 10 Đại Vận × 10 năm (100 lượt/lần xem trang — quá tốn), CHỈ Đại Vận đang được xem chi tiết
 * (`chiTietDaiVanIndex`, mặc định = Đại Vận chứa tuổi hiện tại) mới tính đủ 10 Lưu Niên kèm AI; 9 Đại
 * Vận còn lại chỉ có `tongQuan` (thuần code, không AI) — đúng ý SPEC §6 "app hiển thị 1 thẻ tổng quan
 * ĐV + 10 thẻ năm" (không phải mọi ĐV cùng lúc).
 */
import { tinhBatTu, tinhLuuNien, type BatTuChart } from "../../bat-tu";
import { phanTichBatTu, type Hanh, type TuTruInput } from "../../bat-tu-engine/engine";
import { chamDiem4LinhVuc } from "./cham-diem";
import { tinhTrangThaiThoiDiem } from "./tang-dong";
import { DISCLAIMER_BAT_BUOC, hauKiemLoiLuan, mauCauAnToan } from "./an-toan-noi-dung";
import { goiLoiLuanVanKhi } from "./llm";
import { systemPromptQuyTac, systemPromptTriThuc, userPrompt } from "./prompt";
import { LINH_VUC_KEYS, type DaiVanKhi, type DiemLinhVuc, type LinhVucKey, type LuuNienKhi, type VanKhiOutput } from "./types";

export type {
  DaiVanKhi, DiemLinhVuc, LinhVucKey, LuuNienKhi, VanKhiOutput, TrangThaiThoiDiem,
} from "./types";
export { chamDiem4LinhVuc, chamDiemLinhVuc } from "./cham-diem";
export { tinhTrangThaiThoiDiem } from "./tang-dong";
export { DISCLAIMER_BAT_BUOC, hauKiemLoiLuan, mauCauAnToan, timTuCam, TU_KHOA_CAM_TUYET_DOI } from "./an-toan-noi-dung";

export interface VanKhiInput {
  day: number;
  month: number;
  year: number;
  gender: "Nam" | "Nữ";
  /** Giờ sinh (0-23) — không có thì dùng 12h mặc định + gắn cờ gioSinhKnown=false, ĐÚNG quy ước đã
   *  có của current-luck.ts (giữ nguyên trải nghiệm cho khách chưa khai giờ sinh, không chặn họ). */
  hour?: number;
  nowYear?: number;
  /** Index (0-9) Đại Vận muốn xem chi tiết 10 Lưu Niên + AI. Mặc định: Đại Vận chứa tuổi hiện tại. */
  chiTietDaiVanIndex?: number;
}

async function vietLoiLuanChoMoc(
  diem4: DiemLinhVuc[],
  boiCanh: { daiVanCanChi: string; namLuuNien: number; tuoi: number; gioiTinh: "Nam" | "Nữ" },
): Promise<{ loiLuan: Record<LinhVucKey, string>; tuAI: boolean }> {
  const diemTheoLinhVuc = new Map(diem4.map((d) => [d.linhVuc, d.diem]));
  const layDiem = (lv: LinhVucKey) => diemTheoLinhVuc.get(lv) ?? 5;

  const triThuc = systemPromptTriThuc();
  const quyTac = systemPromptQuyTac(boiCanh.gioiTinh);
  const nguoiDung = userPrompt({
    daiVanCanChi: boiCanh.daiVanCanChi, namLuuNien: boiCanh.namLuuNien, tuoi: boiCanh.tuoi,
    gioiTinh: boiCanh.gioiTinh, diem4LinhVuc: diem4,
  });

  const ket = await goiLoiLuanVanKhi(triThuc, quyTac, nguoiDung);
  if (!ket.ok) {
    // Không gọi được AI (thiếu API key / lỗi mạng) → toàn bộ dùng câu mẫu an toàn. Đây CHÍNH LÀ
    // đường chạy khi test (không có ANTHROPIC_API_KEY trong môi trường CI) — nên câu mẫu phải sạch
    // tuyệt đối, xem an-toan-noi-dung.ts.
    const mau = Object.fromEntries(LINH_VUC_KEYS.map((lv) => [lv, mauCauAnToan(lv, layDiem(lv))])) as Record<LinhVucKey, string>;
    return { loiLuan: mau, tuAI: false };
  }

  // Hậu kiểm tầng 2 (SPEC §4, BẮT BUỘC) — quét từng lĩnh vực AI vừa trả.
  const ketQua: Record<LinhVucKey, string> = { ...ket.loiLuan };
  const biChanLanDau = LINH_VUC_KEYS.filter((lv) => hauKiemLoiLuan(ketQua[lv], lv, layDiem(lv)).biChan);

  let tuAI = true;
  if (biChanLanDau.length > 0) {
    // Thử lại ĐÚNG 1 LẦN với cảnh báo mạnh hơn (SPEC §4: "yêu cầu AI viết lại hoặc thay bằng câu mẫu").
    const quyTacManhHon = [
      quyTac, "",
      `CẢNH BÁO: câu trả lời gần nhất của bạn VI PHẠM từ khóa cấm ở lĩnh vực: ${biChanLanDau.join(", ")}.`,
      "Viết lại TOÀN BỘ 4 lĩnh vực, đọc kỹ lại danh sách từ cấm ở trên và tuyệt đối không lặp lại.",
    ].join("\n");
    const ketLai = await goiLoiLuanVanKhi(triThuc, quyTacManhHon, nguoiDung);
    if (ketLai.ok) {
      for (const lv of biChanLanDau) {
        const hk = hauKiemLoiLuan(ketLai.loiLuan[lv], lv, layDiem(lv));
        ketQua[lv] = hk.vanBan; // hauKiemLoiLuan tự trả câu mẫu nếu VẪN dính từ cấm sau khi thử lại.
        if (hk.biChan) tuAI = false;
      }
    } else {
      for (const lv of biChanLanDau) { ketQua[lv] = mauCauAnToan(lv, layDiem(lv)); tuAI = false; }
    }
  }
  return { loiLuan: ketQua, tuAI };
}

/** Chuyển 1 Đại Vận (từ tinhBatTu) thành TrangThaiThoiDiem + 4 điểm — dùng cho cả tổng quan lẫn khi
 *  cần tái sử dụng trong test. Không gọi AI. */
function tinhTongQuanDaiVan(
  tt: TuTruInput, vsGoc: ReturnType<typeof phanTichBatTu>["vuongSuy"], dtGoc: ReturnType<typeof phanTichBatTu>["dungThan"],
  dv: BatTuChart["daiVan"][number], gender: "Nam" | "Nữ",
) {
  const trangThai = tinhTrangThaiThoiDiem({
    tt, vsGoc, dtGoc, loai: "DaiVan", canChi: { can: dv.can, chi: dv.chi }, namBatDau: dv.startDate.y,
  });
  const diem = chamDiem4LinhVuc({ tt, trangThai, capDoGoc: vsGoc.capDo, gioiTinh: gender });
  return { trangThai, diem };
}

/**
 * Tính vận khí đầy đủ cho 1 người — SPEC.md §1-§6. Async vì Lưu Niên của Đại Vận đang xem chi tiết
 * gọi AI viết lời luận (có hậu kiểm an toàn).
 */
export async function tinhVanKhi(input: VanKhiInput): Promise<VanKhiOutput> {
  const nowYear = input.nowYear ?? new Date().getFullYear();
  const gioSinhKnown = typeof input.hour === "number";
  const hour = input.hour ?? 12;
  const tuoiMu = nowYear - input.year + 1;

  // 1) Lá số (module có sẵn) — KHÔNG tự lập lại.
  const chart: BatTuChart = tinhBatTu({ day: input.day, month: input.month, year: input.year, hour, gender: input.gender });
  const tt: TuTruInput = {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    gioiTinh: input.gender,
  };

  // 2) Vượng suy + Dụng/Hỷ/Kỵ/Cừu Thần GỐC (bat-tu-engine có sẵn) — KHÔNG tự tính lại.
  const { vuongSuy: vsGoc, dungThan: dtGoc } = phanTichBatTu(tt);

  // 3) Đại Vận đang xem chi tiết.
  const idxTheoTuoi = chart.daiVan.findIndex((d) => tuoiMu >= d.startAge && tuoiMu <= d.endAge);
  const idxMacDinh = idxTheoTuoi >= 0 ? idxTheoTuoi : tuoiMu < chart.daiVan[0]!.startAge ? 0 : chart.daiVan.length - 1;
  const chiTietDaiVanIndex = input.chiTietDaiVanIndex ?? idxMacDinh;

  // 4) Với mỗi Đại Vận: tổng quan (luôn tính) + Lưu Niên chi tiết (chỉ Đại Vận đang chọn).
  const danhSachDaiVan: DaiVanKhi[] = [];
  for (let i = 0; i < chart.daiVan.length; i++) {
    const dv = chart.daiVan[i]!;
    const { diem: tongQuan } = tinhTongQuanDaiVan(tt, vsGoc, dtGoc, dv, input.gender);

    let luuNien: LuuNienKhi[] = [];
    if (i === chiTietDaiVanIndex) {
      const danhSachNam = tinhLuuNien(dv.startDate.y, input.year, 10);
      luuNien = await Promise.all(
        danhSachNam.map(async (ln): Promise<LuuNienKhi> => {
          const trangThaiLN = tinhTrangThaiThoiDiem({
            tt, vsGoc, dtGoc, loai: "LuuNien", canChi: { can: ln.can, chi: ln.chi }, nam: ln.year,
            canChiDaiVanChua: { can: dv.can, chi: dv.chi },
          });
          const diem4 = chamDiem4LinhVuc({ tt, trangThai: trangThaiLN, capDoGoc: vsGoc.capDo, gioiTinh: input.gender });
          const { loiLuan, tuAI } = await vietLoiLuanChoMoc(diem4, {
            daiVanCanChi: `${dv.can} ${dv.chi}`, namLuuNien: ln.year, tuoi: ln.tuoi, gioiTinh: input.gender,
          });
          return { nam: ln.year, tuoi: ln.tuoi, canChi: `${ln.can} ${ln.chi}`, diemCacLinhVuc: diem4, loiLuan, loiLuanTuAI: tuAI };
        }),
      );
    }

    danhSachDaiVan.push({
      canChi: `${dv.can} ${dv.chi}`, tuoiBatDau: dv.startAge, tuoiKetThuc: dv.endAge, namBatDau: dv.startDate.y,
      tongQuan, luuNien,
    });
  }

  return {
    laSo: {
      namCan: chart.year.can, namChi: chart.year.chi,
      thangCan: chart.month.can, thangChi: chart.month.chi,
      ngayCan: chart.day.can, ngayChi: chart.day.chi,
      gioCan: chart.hour.can, gioChi: chart.hour.chi,
      nhatChu: chart.nhatChu.can, nhatChuHanh: chart.nhatChu.nguHanh as Hanh,
      gioiTinh: input.gender, gioSinhKnown,
    },
    vuongSuyGoc: { capDo: vsGoc.capDo, nhom: vsGoc.nhom },
    dungThanGoc: { dungThan: dtGoc.dungThan, hyThan: dtGoc.hyThan, kyThan: dtGoc.kyThan, cuuThan: dtGoc.cuuThan, phuongPhap: dtGoc.phuongPhap },
    danhSachDaiVan,
    chiTietDaiVanIndex,
    disclaimer: DISCLAIMER_BAT_BUOC,
  };
}
