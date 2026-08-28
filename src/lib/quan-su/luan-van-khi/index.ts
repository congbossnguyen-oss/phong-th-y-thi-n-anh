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
import { goiLoiLuanVanKhi, type LoiLuan4LinhVuc } from "./llm";
import { systemPromptQuyTac, systemPromptTriThuc, userPromptBatch, type DiemLinhVucChoAI } from "./prompt";
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
  /**
   * CACHE LƯU NIÊN (tuỳ chọn) — module này KHÔNG tự biết DB, tầng gọi (trang xem-thoi-van.astro)
   * tự quyết định lưu ở đâu (vd bảng van_khi_cache theo user+daiVanIndex) rồi truyền vào đây. Kết
   * quả cho 1 (ngày sinh, Đại Vận) là CỐ ĐỊNH mãi mãi (Can/Chi từng năm không đổi theo "hôm nay"),
   * nên cache không cần hết hạn. Không truyền thì luôn tính mới — giữ nguyên hành vi cũ (test hiện
   * có gọi `tinhVanKhi()` trực tiếp không qua DB vẫn chạy đúng).
   */
  layLuuNienCache?: (chiTietDaiVanIndex: number) => LuuNienKhi[] | null | Promise<LuuNienKhi[] | null>;
  luuLuuNienCache?: (chiTietDaiVanIndex: number, luuNien: LuuNienKhi[]) => void | Promise<void>;
}

interface MocNam {
  chiSo: number;
  diem4: DiemLinhVuc[];
  daiVanCanChi: string;
  namLuuNien: number;
  tuoi: number;
}

/**
 * Số năm tối đa cho MỘT lệnh AI.
 *
 * Đo thật 26/8/2026 (ghi chú gốc ở luu-nien-dai-van.ts, module chị em cùng cơ chế): 10 mục kèm văn
 * xuôi chi tiết sinh ~14.000 token đầu ra qua `deepseek-v4-flash`, mất 97-125 giây — chạm đúng trần
 * ~100 giây của Cloudflare đứng trước tom.qnt.world, nên lúc được lúc hỏng (HTTP 524). Cắt còn 5
 * năm/lệnh thì mỗi lệnh chỉ còn ~50 giây, an toàn cho cả DeepSeek lẫn Anthropic.
 */
const SO_NAM_TOI_DA_MOI_LENH = 5;

/**
 * Viết lời luận cho CẢ danh sách năm — CHIA LÔ tối đa `SO_NAM_TOI_DA_MOI_LENH` năm/lệnh AI (không
 * phải 1 lệnh/năm như bản cũ trước 26/8/2026) — trang Xem Thời Vận luôn hiển thị đủ 10 năm 1 lúc nên
 * gộp lại vừa rẻ hơn vừa nhanh hơn nhiều lần so với 10 lệnh tuần tự, trong khi vẫn tránh trần thời
 * gian của nhà cung cấp. Các lô gọi NỐI TIẾP (không song song) để lô sau đọc lại được cache tiền tố
 * của lô trước. Việc GỌI LẠI mỗi lần khách xem trang (chưa cache theo tài khoản) là việc khác, xử lý
 * ở tầng gọi (index.ts ngoài hàm này / trang xem-thoi-van.astro).
 */
async function vietLoiLuanChoDanhSachNam(
  danhSachMoc: MocNam[],
  gioiTinh: "Nam" | "Nữ",
): Promise<Map<number, { loiLuan: Record<LinhVucKey, string>; tuAI: boolean }>> {
  if (danhSachMoc.length <= SO_NAM_TOI_DA_MOI_LENH) return vietLoiLuanMotLo(danhSachMoc, gioiTinh);

  const ketQua = new Map<number, { loiLuan: Record<LinhVucKey, string>; tuAI: boolean }>();
  for (let i = 0; i < danhSachMoc.length; i += SO_NAM_TOI_DA_MOI_LENH) {
    const lo = danhSachMoc.slice(i, i + SO_NAM_TOI_DA_MOI_LENH);
    const ketLo = await vietLoiLuanMotLo(lo, gioiTinh);
    for (const [k, v] of ketLo) ketQua.set(k, v);
  }
  return ketQua;
}

async function vietLoiLuanMotLo(
  danhSachMoc: MocNam[],
  gioiTinh: "Nam" | "Nữ",
): Promise<Map<number, { loiLuan: Record<LinhVucKey, string>; tuAI: boolean }>> {
  const layDiem = (diem4: DiemLinhVuc[], lv: LinhVucKey) => diem4.find((d) => d.linhVuc === lv)?.diem ?? 5;
  const mauCaBang = (): Map<number, { loiLuan: Record<LinhVucKey, string>; tuAI: boolean }> =>
    new Map(
      danhSachMoc.map((m) => [
        m.chiSo,
        {
          loiLuan: Object.fromEntries(LINH_VUC_KEYS.map((lv) => [lv, mauCauAnToan(lv, layDiem(m.diem4, lv))])) as Record<
            LinhVucKey,
            string
          >,
          tuAI: false,
        },
      ]),
    );

  const triThuc = systemPromptTriThuc();
  const quyTac = systemPromptQuyTac(gioiTinh);
  const dauVao: DiemLinhVucChoAI[] = danhSachMoc.map((m) => ({
    chiSo: m.chiSo, daiVanCanChi: m.daiVanCanChi, namLuuNien: m.namLuuNien, tuoi: m.tuoi, diem4LinhVuc: m.diem4,
  }));
  const nguoiDung = userPromptBatch(gioiTinh, dauVao);

  const ket = await goiLoiLuanVanKhi(triThuc, quyTac, nguoiDung);
  if (!ket.ok) {
    // Không gọi được AI (thiếu API key / lỗi mạng) → toàn bộ dùng câu mẫu an toàn cho MỌI năm. Đây
    // CHÍNH LÀ đường chạy khi test (không có ANTHROPIC_API_KEY trong môi trường CI) — câu mẫu phải
    // sạch tuyệt đối, xem an-toan-noi-dung.ts.
    return mauCaBang();
  }

  // Hậu kiểm tầng 2 (SPEC §4, BẮT BUỘC) — quét từng lĩnh vực của TỪNG năm AI vừa trả.
  const ketQua = mauCaBang();
  const bienDaChan: { chiSo: number; lv: LinhVucKey }[] = [];
  for (const m of danhSachMoc) {
    const doAI = ket.loiLuan.get(m.chiSo);
    if (!doAI) continue; // model bỏ sót năm này — giữ câu mẫu đã có sẵn trong mauCaBang().
    const hienTai: Record<LinhVucKey, string> = { ...ketQua.get(m.chiSo)!.loiLuan };
    let coTuAI = true;
    for (const lv of LINH_VUC_KEYS) {
      const hk = hauKiemLoiLuan(doAI[lv], lv, layDiem(m.diem4, lv));
      hienTai[lv] = hk.vanBan;
      if (hk.biChan) { bienDaChan.push({ chiSo: m.chiSo, lv }); coTuAI = false; }
    }
    ketQua.set(m.chiSo, { loiLuan: hienTai, tuAI: coTuAI });
  }

  if (bienDaChan.length > 0) {
    // Thử lại ĐÚNG 1 LẦN cho CẢ DANH SÁCH với cảnh báo mạnh hơn (SPEC §4: "yêu cầu AI viết lại hoặc
    // thay bằng câu mẫu") — không thử lại riêng từng năm để tránh nổ số lệnh gọi trở lại như bản cũ.
    const theoNam = new Map<number, LinhVucKey[]>();
    for (const b of bienDaChan) theoNam.set(b.chiSo, [...(theoNam.get(b.chiSo) ?? []), b.lv]);
    const moTaViPham = [...theoNam.entries()].map(([cs, lvs]) => `năm chi_so=${cs} (${lvs.join(", ")})`).join("; ");
    const quyTacManhHon = [
      quyTac, "",
      `CẢNH BÁO: câu trả lời gần nhất của bạn VI PHẠM từ khóa cấm ở: ${moTaViPham}.`,
      "Viết lại TOÀN BỘ danh sách, đọc kỹ lại danh sách từ cấm ở trên và tuyệt đối không lặp lại.",
    ].join("\n");
    const ketLai = await goiLoiLuanVanKhi(triThuc, quyTacManhHon, nguoiDung);
    if (ketLai.ok) {
      for (const [chiSo, cacLv] of theoNam) {
        const doAI = ketLai.loiLuan.get(chiSo);
        const m = danhSachMoc.find((x) => x.chiSo === chiSo)!;
        const hienTai: Record<LinhVucKey, string> = { ...ketQua.get(chiSo)!.loiLuan };
        let tuAI = ketQua.get(chiSo)!.tuAI;
        for (const lv of cacLv) {
          // hauKiemLoiLuan tự trả câu mẫu nếu VẪN dính từ cấm sau khi thử lại; không có doAI thì cũng vậy.
          const hk = hauKiemLoiLuan(doAI?.[lv] ?? "", lv, layDiem(m.diem4, lv));
          hienTai[lv] = hk.vanBan;
          if (!hk.biChan) tuAI = true;
        }
        ketQua.set(chiSo, { loiLuan: hienTai, tuAI });
      }
    }
    // ketLai.ok === false: giữ nguyên câu mẫu đã gán ở vòng hậu kiểm lần đầu, không cần làm gì thêm.
  }

  return ketQua;
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

/** Tính (hoặc lấy từ cache) đủ 10 Lưu Niên kèm lời luận AI cho 1 Đại Vận. Tách riêng để dùng lại
 *  được cho cả Đại Vận đang xem VÀ Đại Vận kế tiếp (khi khối "5 năm tới" vắt qua ranh giới). */
async function layHoacTinhLuuNien(
  index: number, dv: BatTuChart["daiVan"][number], tt: TuTruInput,
  vsGoc: ReturnType<typeof phanTichBatTu>["vuongSuy"], dtGoc: ReturnType<typeof phanTichBatTu>["dungThan"],
  input: VanKhiInput,
): Promise<LuuNienKhi[]> {
  const daCache = await input.layLuuNienCache?.(index);
  if (daCache && daCache.length === 10) {
    // Trúng cache — Can/Chi từng năm Lưu Niên không đổi theo thời gian nên khỏi tính/gọi AI lại.
    return daCache;
  }
  const danhSachNam = tinhLuuNien(dv.startDate.y, input.year, 10);
  // Tính điểm 4 lĩnh vực cho CẢ 10 năm bằng code (không AI, không tốn gì) TRƯỚC, rồi mới gọi AI
  // đúng 1 lần cho cả danh sách — thay vì 10 lệnh AI riêng biệt như bản cũ.
  const mocTheoNam = danhSachNam.map((ln, chiSo) => {
    const trangThaiLN = tinhTrangThaiThoiDiem({
      tt, vsGoc, dtGoc, loai: "LuuNien", canChi: { can: ln.can, chi: ln.chi }, nam: ln.year,
      canChiDaiVanChua: { can: dv.can, chi: dv.chi },
    });
    const diem4 = chamDiem4LinhVuc({ tt, trangThai: trangThaiLN, capDoGoc: vsGoc.capDo, gioiTinh: input.gender });
    return { chiSo, diem4, daiVanCanChi: `${dv.can} ${dv.chi}`, namLuuNien: ln.year, tuoi: ln.tuoi, ln };
  });
  const loiLuanTheoNam = await vietLoiLuanChoDanhSachNam(mocTheoNam, input.gender);
  const luuNien = mocTheoNam.map((m) => {
    const kq = loiLuanTheoNam.get(m.chiSo)!;
    return {
      nam: m.ln.year, tuoi: m.ln.tuoi, canChi: `${m.ln.can} ${m.ln.chi}`,
      diemCacLinhVuc: m.diem4, loiLuan: kq.loiLuan, loiLuanTuAI: kq.tuAI,
    };
  });
  // Chỉ lưu cache khi lời luận thật sự đến từ AI — kết quả toàn câu mẫu (thiếu key/lỗi mạng)
  // không đáng lưu, để lần sau có cơ hội thử gọi AI lại.
  if (luuNien.some((ln) => ln.loiLuanTuAI)) await input.luuLuuNienCache?.(index, luuNien);
  return luuNien;
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

    const luuNien: LuuNienKhi[] = i === chiTietDaiVanIndex ? await layHoacTinhLuuNien(i, dv, tt, vsGoc, dtGoc, input) : [];

    danhSachDaiVan.push({
      canChi: `${dv.can} ${dv.chi}`, tuoiBatDau: dv.startAge, tuoiKetThuc: dv.endAge, namBatDau: dv.startDate.y,
      tongQuan, luuNien,
    });
  }

  // 5) "5 năm tới" TÍNH TỪ NĂM HIỆN TẠI — app chưa có nút đổi Đại Vận nên ai đã đi sâu vào Đại Vận
  // đang chọn (vd 8/10 năm) chỉ còn 2 năm thật sự tương lai trong luuNien ở trên. Vắt qua Đại Vận kế
  // tiếp nếu cần, tái dùng ĐÚNG cơ chế cache theo Đại Vận (không tính 2 lần, không tốn AI ngoài dự kiến).
  const dvHienTai = chart.daiVan[chiTietDaiVanIndex];
  let nam5NamToi: LuuNienKhi[] = [];
  if (dvHienTai) {
    const luuNienHienTai = danhSachDaiVan[chiTietDaiVanIndex]!.luuNien;
    nam5NamToi = luuNienHienTai.filter((ln) => ln.nam >= nowYear && ln.nam < nowYear + 5);

    const namCuoiDaiVanHienTai = dvHienTai.startDate.y + 9;
    if (nowYear + 4 > namCuoiDaiVanHienTai && chiTietDaiVanIndex + 1 < chart.daiVan.length) {
      const dvKeTiep = chart.daiVan[chiTietDaiVanIndex + 1]!;
      const luuNienKeTiep = await layHoacTinhLuuNien(chiTietDaiVanIndex + 1, dvKeTiep, tt, vsGoc, dtGoc, input);
      nam5NamToi = [...nam5NamToi, ...luuNienKeTiep.filter((ln) => ln.nam >= nowYear && ln.nam < nowYear + 5)];
    }
    nam5NamToi.sort((a, b) => a.nam - b.nam);
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
    nam5NamToi,
    disclaimer: DISCLAIMER_BAT_BUOC,
  };
}
