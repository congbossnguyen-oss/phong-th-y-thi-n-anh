// TẦNG 2 (biến thể có cấu trúc) — chấm điểm 4 khía cạnh (sức khỏe/công việc/tài lộc/lục thân) cho
// TỪNG giai đoạn Đại Vận và TỪNG năm Lưu Niên (10 năm tới), dùng vẽ đồ hình thay vì buộc khách đọc
// văn xuôi dài. Khác với các giai đoạn A-L (luôn trả 1 đoạn văn xuôi), ở đây gọi AI 1 LẦN DUY NHẤT
// cho cả danh sách (không phải N lệnh riêng — giữ chi phí/thời gian trong tầm kiểm soát).
//
// ⚠️ ĐIỂM CỐT LÕI: Dụng Thần được TÍNH LẠI RIÊNG cho từng Đại Vận (Đại Vận nhập cục như "trụ thứ 5",
// xem `phanTichBatTuTaiDaiVan` trong bat-tu-engine/engine.ts + căn cứ vuong-suy.md mục 5/6.1).
// Mỗi năm Lưu Niên được chấm theo Dụng Thần của ĐÚNG Đại Vận mà năm đó rơi vào, chứ không phải Dụng
// Thần nguyên cục — đúng thứ tự tầng thứ Lưu Niên > Đại Vận > mệnh cục (quan-he-can-chi.md mục 4).
import type { BatTuChart } from "../bat-tu";
import { tinhLuuNien } from "../bat-tu";
import { hanhCan, hanhChi, phanTichBatTuTaiDaiVan, type BatTuAnalysis, type TuTruInput, type DungThanResult } from "../bat-tu-engine/engine";
import { hyKyCuaHanh } from "./findings-co-ban";
import { goiClaudeToolUse } from "./ai-narrative";
import { docNhieuKnowledge } from "./content-loader";
import { tuKhoaCamTuyetDoiDangText, tuDienThayTheDangText, quyTacDienDatChungDangText, quetHauKiem, xoaTheLaConSot } from "./content-safety";
import { ghiLogChiPhi } from "../chart-profile/ghi-log-chi-phi";
import type { DiemGiaiDoanVan } from "./types";

const KNOWLEDGE_FILES = ["ung-ky.md", "benh-tat.md", "tai-van.md", "quan-van.md", "cong-danh.md", "luc-than.md"];
const TOM_TAT_KHONG_QUA = "Giai đoạn này cần tham khảo thêm cùng chuyên gia.";

// ⚠️ Schema GIỐNG HỆT NHAU cho cả Đại Vận lẫn Lưu Niên — cố ý. `tools` được render TRƯỚC `system`
// khi Anthropic khớp cache theo tiền tố, nên chỉ cần schema khác nhau là toàn bộ khối tri thức phía
// sau mất cache. `chi_tiet` luôn có mặt; lệnh Đại Vận được dặn trả chuỗi rỗng (gần như không tốn
// token đầu ra), lệnh Lưu Niên mới viết thật.
const SCHEMA_DIEM = {
  type: "object",
  properties: {
    danh_sach: {
      type: "array",
      description: "Đúng 1 phần tử cho MỖI mục trong danh sách đầu vào, theo đúng thứ tự chi_so.",
      items: {
        type: "object",
        properties: {
          chi_so: { type: "integer", description: "Số thứ tự trong danh sách đầu vào, bắt đầu từ 0." },
          suc_khoe: { type: "integer", description: "-2 (rất bất lợi) đến 2 (rất thuận lợi)." },
          cong_viec: { type: "integer", description: "-2 đến 2, ảnh hưởng tới công việc/sự nghiệp." },
          tai_loc: { type: "integer", description: "-2 đến 2, ảnh hưởng tới tài chính/tiền bạc." },
          luc_than: { type: "integer", description: "-2 đến 2, ảnh hưởng tới quan hệ gia đình/người thân." },
          tom_tat: { type: "string", description: "1 câu ngắn (tối đa ~25 chữ) nêu điểm nổi bật nhất." },
          chi_tiet: {
            type: "string",
            description:
              "Đoạn luận CHI TIẾT cho mục này, 90-140 chữ, văn xuôi liền mạch: sức khỏe, công việc, tài lộc, quan hệ gia đình — mặt nào nổi bật thì nói kỹ hơn, nêu rõ nên làm gì / nên thận trọng điều gì. CHỈ viết khi phần hướng dẫn yêu cầu; nếu được dặn bỏ qua thì trả về chuỗi rỗng.",
          },
        },
        required: ["chi_so", "suc_khoe", "cong_viec", "tai_loc", "luc_than", "tom_tat", "chi_tiet"],
      },
    },
  },
  required: ["danh_sach"],
} as const;

interface MucCanCham {
  chiSo: number;
  nhan: string;
  tuoi: string;
  canChi: string;
  hyKyCan: string;
  hyKyChi: string;
  dungThanVan: string;
  hyThanVan: string;
  kyThanVan: string;
  dungThanDoi: boolean;
  /** Chỉ Lưu Niên: nhãn Đại Vận mà năm này rơi vào, để AI hiểu bối cảnh tầng trên. */
  thuocDaiVan?: string;
}

/**
 * Trả về `[phầnCốĐịnh, phầnThayĐổi]`.
 *
 * Phần CỐ ĐỊNH (khối tri thức ~35k token + quy tắc an toàn + văn phong) GIỐNG HỆT nhau giữa lệnh
 * Đại Vận và lệnh Lưu Niên, và được đặt LÊN TRƯỚC để lệnh thứ hai đọc lại được cache (0,1x) thay vì
 * ghi cache mới (1,25x). Trước đây khối này nằm ở CUỐI, sau dữ liệu riêng từng lệnh, nên cache không
 * bao giờ dùng chung được — cả 2 lệnh đều phải ghi cache mới, tốn gấp hơn 10 lần phần lẽ ra chỉ phải
 * trả 1 lần.
 */
function buildSystemPrompt(laSoJSON: string, dsJSON: string, tenLoai: string, coChiTiet: boolean): [string, string] {
  const coDinh = [
    "Bạn là trợ lý phân tích vận trình Bát Tự cho website phongthuythienanh.com. Nhiệm vụ: với MỖI mục trong danh sách được giao, chấm điểm 4 khía cạnh (sức khỏe, công việc, tài lộc, lục thân) trên thang -2 đến 2 và viết tóm tắt.",
    "",
    "## Nguyên tắc chấm điểm",
    "- Dựa CHÍNH vào hyKyCan/hyKyChi đã cho. Cả Can lẫn Chi đều dung_than/hy_than thì điểm cao (1 đến 2), cả 2 đều ky_than/cuu_than thì điểm thấp (-2 đến -1), pha trộn thì điểm quanh 0.",
    "- 4 khía cạnh KHÔNG bắt buộc điểm giống nhau. Dùng tài liệu tham khảo bên dưới để tinh chỉnh riêng từng khía cạnh khi có căn cứ.",
    "- KHÔNG bịa sự kiện cụ thể (bệnh gì, mất tiền vì việc gì). Chỉ nêu XU HƯỚNG chung, đúng tinh thần tham khảo.",
    "",
    "### Cách đọc dữ liệu đã tính sẵn",
    "- dungThanVan/hyThanVan/kyThanVan: Dụng/Hỷ/Kỵ Thần đã được TÍNH LẠI RIÊNG cho vận đó (Đại Vận nhập cục như trụ thứ 5), CÓ THỂ khác Dụng Thần nguyên cục. Luôn dùng bộ này làm chuẩn cho vận đó.",
    "- dungThanDoi = true: Dụng Thần vận này ĐÃ ĐỔI so với nguyên cục — đây là điểm chuyển đáng lưu ý, nên nhắc tới khi luận (cách sống/ưu tiên cần điều chỉnh so với giai đoạn trước).",
    "- hyKyCan/hyKyChi: quan hệ của Can/Chi vận đó với Dụng Thần CỦA CHÍNH VẬN ĐÓ. \"dung_than\"/\"hy_than\" là thuận lợi, \"ky_than\"/\"cuu_than\" là bất lợi, \"trung_tinh\" là trung tính.",
    "- thuocDaiVan (nếu có): Đại Vận mà năm đó nằm trong. Lưu Niên ở tầng cao hơn Đại Vận, nhưng bối cảnh 10 năm của Đại Vận vẫn là nền — có thể nhắc khi thấy năm đó thuận/nghịch rõ so với nền chung.",
    "",
    "## Tài liệu tham khảo",
    docNhieuKnowledge(KNOWLEDGE_FILES),
    "",
    "## NGUYÊN TẮC AN TOÀN NỘI DUNG (BẮT BUỘC)",
    `Tuyệt đối KHÔNG dùng các từ sau: ${tuKhoaCamTuyetDoiDangText()}`,
    tuDienThayTheDangText(),
    quyTacDienDatChungDangText(),
    "",
    "## Yêu cầu văn phong",
    "- TUYỆT ĐỐI KHÔNG dùng dấu gạch ngang \"-\" hay chấm phẩy \";\" để nối câu (lỗi văn phong lộ rõ là AI viết). Dùng dấu phẩy hoặc tách thành câu ngắn.",
    "- TUYỆT ĐỐI KHÔNG chèn thẻ hoặc ký hiệu giống code/XML (vd </noi_dung>, <invoke>, **, ##) vào nội dung. Chỉ viết văn xuôi thuần tuý tiếng Việt.",
    "- KHÔNG viết câu sáo rỗng kiểu AI tự nhận xét thiếu dữ liệu (vd \"chưa đủ căn cứ để xác định rõ\"). Nêu thẳng xu hướng, không rào đón.",
    "",
    "Luôn trả ĐÚNG ĐỦ 1 phần tử cho MỖI mục trong danh sách đầu vào (không bỏ sót, không thêm mục lạ), giữ đúng chi_so tương ứng.",
  ].join("\n");

  const thayDoi = [
    `## Loại đang phân tích: ${tenLoai}`,
    coChiTiet
      ? "Với loại này, BẮT BUỘC viết `chi_tiet` đầy đủ 90-140 chữ cho TỪNG mục (đây là phần khách đọc kỹ nhất)."
      : "Với loại này, phần chi tiết đã có đồ hình riêng thể hiện, nên trả `chi_tiet` là CHUỖI RỖNG \"\" cho mọi mục. Chỉ cần điểm số và `tom_tat` 1 câu.",
    "",
    "## Lá số đang luận (nguyên cục tĩnh)",
    laSoJSON,
    "",
    `## Danh sách ${tenLoai} cần phân tích`,
    dsJSON,
  ].join("\n");

  return [coDinh, thayDoi];
}

/**
 * Số mục tối đa cho MỘT lệnh khi có `chi_tiet`.
 *
 * Đo thật 26/8/2026 với `deepseek-v4-flash`: 10 mục kèm chi_tiet sinh ~14.000 token đầu ra, mất
 * 97-125 giây — chạm đúng trần ~100 giây của Cloudflare đứng trước nhà cung cấp, nên lúc được lúc
 * hỏng (HTTP 524). Cắt còn 5 mục/lệnh thì mỗi lệnh chỉ còn ~50 giây, an toàn. Bản không có chi_tiet
 * (đầu ra ngắn) chạy 20-50 giây nên để nguyên 1 lệnh.
 */
const TOI_DA_MOI_LENH_CO_CHI_TIET = 5;

async function chamDiemDanhSach(laSo: unknown, muc: MucCanCham[], tenLoai: string, coChiTiet: boolean): Promise<DiemGiaiDoanVan[]> {
  // Chia lô khi đầu ra dài để không chạm trần thời gian của nhà cung cấp.
  if (coChiTiet && muc.length > TOI_DA_MOI_LENH_CO_CHI_TIET) {
    const lo: MucCanCham[][] = [];
    for (let i = 0; i < muc.length; i += TOI_DA_MOI_LENH_CO_CHI_TIET) {
      lo.push(muc.slice(i, i + TOI_DA_MOI_LENH_CO_CHI_TIET));
    }
    // Nối tiếp (không song song) để lô sau còn đọc lại được cache tiền tố của lô trước.
    const ketQua: DiemGiaiDoanVan[] = [];
    for (let i = 0; i < lo.length; i++) {
      ketQua.push(...(await chamDiemMotLo(laSo, lo[i], `${tenLoai} (lô ${i + 1}/${lo.length})`, coChiTiet)));
    }
    return ketQua;
  }
  return chamDiemMotLo(laSo, muc, tenLoai, coChiTiet);
}

async function chamDiemMotLo(laSo: unknown, muc: MucCanCham[], tenLoai: string, coChiTiet: boolean): Promise<DiemGiaiDoanVan[]> {
  const laSoJSON = JSON.stringify(laSo, null, 2);
  const dsJSON = JSON.stringify(
    muc.map((m) => ({
      chi_so: m.chiSo, nhan: m.nhan, tuoi: m.tuoi, canChi: m.canChi,
      dungThanVan: m.dungThanVan, hyThanVan: m.hyThanVan, kyThanVan: m.kyThanVan, dungThanDoi: m.dungThanDoi,
      hyKyCan: m.hyKyCan, hyKyChi: m.hyKyChi,
      ...(m.thuocDaiVan ? { thuocDaiVan: m.thuocDaiVan } : {}),
    })),
    null,
    2,
  );
  const system = buildSystemPrompt(laSoJSON, dsJSON, tenLoai, coChiTiet);
  const userMessage = `Hãy phân tích đúng đủ ${muc.length} mục trong danh sách ${tenLoai} theo đúng dữ liệu và nguyên tắc đã nêu.`;

  const { input, usage, model } = await goiClaudeToolUse(system, userMessage, "tra_ve_diem_so", SCHEMA_DIEM, coChiTiet ? 8000 : 3000, "bat-tu-cham-diem");
  ghiLogChiPhi(`Luận giải Bát Tự — ${tenLoai}`, model ?? "claude-sonnet-5", usage);

  const danhSach = Array.isArray(input?.danh_sach) ? (input!.danh_sach as Record<string, unknown>[]) : [];
  const theoChiSo = new Map(danhSach.map((d) => [Number(d.chi_so), d]));

  return muc.map((m) => {
    const d = theoChiSo.get(m.chiSo);
    const layDiem = (v: unknown): number => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.max(-2, Math.min(2, Math.round(n))) : 0;
    };
    const lamSach = (v: unknown): string => (typeof v === "string" ? xoaTheLaConSot(v.trim()) : "");

    let tomTat = lamSach(d?.tom_tat);
    if (tomTat && quetHauKiem(tomTat).length > 0) tomTat = TOM_TAT_KHONG_QUA;
    if (!tomTat) tomTat = TOM_TAT_KHONG_QUA;

    let chiTiet = coChiTiet ? lamSach(d?.chi_tiet) : "";
    if (chiTiet && quetHauKiem(chiTiet).length > 0) chiTiet = "";

    return {
      nhan: m.nhan,
      canChi: m.canChi,
      tuoi: m.tuoi,
      sucKhoe: layDiem(d?.suc_khoe),
      congViec: layDiem(d?.cong_viec),
      taiLoc: layDiem(d?.tai_loc),
      lucThan: layDiem(d?.luc_than),
      tomTat,
      dungThanVan: m.dungThanVan,
      dungThanDoi: m.dungThanDoi,
      ...(chiTiet ? { chiTiet } : {}),
    };
  });
}

/** Dụng Thần riêng của từng Đại Vận (tính lại theo engine, có chốt chặn Nhóm 3). */
function dungThanTungDaiVan(chart: BatTuChart, tt: TuTruInput): { can: string; chi: string; dt: DungThanResult; doi: boolean }[] {
  return chart.daiVan.map((dv) => {
    const r = phanTichBatTuTaiDaiVan(tt, { can: dv.can, chi: dv.chi });
    return { can: dv.can, chi: dv.chi, dt: r.dungThan, doi: r.dungThanDoi };
  });
}

export async function taoBieuDoDaiVan(chart: BatTuChart, tt: TuTruInput, laSo: unknown): Promise<DiemGiaiDoanVan[]> {
  const dtVan = dungThanTungDaiVan(chart, tt);
  const muc: MucCanCham[] = chart.daiVan.map((dv, i) => {
    const { dt, doi } = dtVan[i];
    return {
      chiSo: i,
      nhan: `${dv.startAge}-${dv.endAge} tuổi`,
      tuoi: `${dv.startAge}-${dv.endAge}`,
      canChi: `${dv.can} ${dv.chi}`,
      hyKyCan: hyKyCuaHanh(hanhCan(dv.can), dt),
      hyKyChi: hyKyCuaHanh(hanhChi(dv.chi), dt),
      dungThanVan: dt.dungThan,
      hyThanVan: dt.hyThan,
      kyThanVan: dt.kyThan,
      dungThanDoi: doi,
    };
  });
  if (muc.length === 0) return [];
  return chamDiemDanhSach(laSo, muc, "Đại Vận", false);
}

export async function taoBieuDoLuuNien(
  chart: BatTuChart,
  tt: TuTruInput,
  laSo: unknown,
  namSinh: number,
): Promise<DiemGiaiDoanVan[]> {
  const namNay = new Date().getFullYear();
  const danhSachNam = tinhLuuNien(namNay, namSinh, 10);
  const dtVan = dungThanTungDaiVan(chart, tt);

  // Mỗi năm dùng Dụng Thần của ĐÚNG Đại Vận năm đó rơi vào (tầng thứ: Lưu Niên > Đại Vận > mệnh cục).
  // Ngoài phạm vi bảng Đại Vận thì lùi về vận cuối cùng có sẵn.
  const timVanCuaTuoi = (tuoi: number) => {
    const idx = chart.daiVan.findIndex((dv) => tuoi >= dv.startAge && tuoi <= dv.endAge);
    if (idx >= 0) return idx;
    return tuoi < (chart.daiVan[0]?.startAge ?? 0) ? 0 : chart.daiVan.length - 1;
  };

  const muc: MucCanCham[] = danhSachNam.map((n, i) => {
    const idx = timVanCuaTuoi(n.tuoi);
    const van = dtVan[idx];
    const dt = van?.dt;
    return {
      chiSo: i,
      nhan: String(n.year),
      tuoi: String(n.tuoi),
      canChi: `${n.can} ${n.chi}`,
      hyKyCan: dt ? hyKyCuaHanh(hanhCan(n.can), dt) : "trung_tinh",
      hyKyChi: dt ? hyKyCuaHanh(hanhChi(n.chi), dt) : "trung_tinh",
      dungThanVan: dt?.dungThan ?? "",
      hyThanVan: dt?.hyThan ?? "",
      kyThanVan: dt?.kyThan ?? "",
      dungThanDoi: van?.doi ?? false,
      thuocDaiVan: van ? `${van.can} ${van.chi} (${chart.daiVan[idx].startAge}-${chart.daiVan[idx].endAge} tuổi)` : undefined,
    };
  });
  return chamDiemDanhSach(laSo, muc, "Lưu Niên", true);
}
