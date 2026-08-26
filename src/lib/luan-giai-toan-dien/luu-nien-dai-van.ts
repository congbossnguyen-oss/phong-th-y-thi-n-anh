// TẦNG 2 (biến thể có cấu trúc) — chấm điểm 4 khía cạnh (sức khỏe/công việc/tài lộc/lục thân) cho
// TỪNG giai đoạn Đại Vận và TỪNG năm Lưu Niên (10 năm tới), dùng vẽ đồ hình thay vì buộc khách đọc
// văn xuôi dài. Khác với các giai đoạn A-L (luôn trả 1 đoạn văn xuôi), ở đây gọi AI 1 LẦN DUY NHẤT
// cho cả danh sách (không phải N lệnh riêng — giữ chi phí/thời gian trong tầm kiểm soát).
import type { BatTuChart } from "../bat-tu";
import { tinhLuuNien } from "../bat-tu";
import { hanhCan, hanhChi, type BatTuAnalysis } from "../bat-tu-engine/engine";
import { hyKyCuaHanh } from "./findings-co-ban";
import { goiClaudeToolUse } from "./ai-narrative";
import { docNhieuKnowledge } from "./content-loader";
import { tuKhoaCamTuyetDoiDangText, tuDienThayTheDangText, quyTacDienDatChungDangText, quetHauKiem, xoaTheLaConSot } from "./content-safety";
import { ghiLogChiPhi } from "../chart-profile/ghi-log-chi-phi";
import type { DiemGiaiDoanVan } from "./types";

const KNOWLEDGE_FILES = ["ung-ky.md", "benh-tat.md", "tai-van.md", "quan-van.md", "cong-danh.md", "luc-than.md"];
const TOM_TAT_KHONG_QUA = "Giai đoạn này cần tham khảo thêm cùng chuyên gia.";

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
          tom_tat: { type: "string", description: "1 câu ngắn (tối đa ~25 chữ) nêu điểm nổi bật nhất của giai đoạn/năm này." },
        },
        required: ["chi_so", "suc_khoe", "cong_viec", "tai_loc", "luc_than", "tom_tat"],
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
}

function buildSystemPrompt(laSoJSON: string, dsJSON: string, tenLoai: string): string {
  return [
    "Bạn là trợ lý chấm điểm nhanh cho báo cáo luận giải Bát Tự trên phongthuythienanh.com. Nhiệm vụ: với MỖI mục trong danh sách giai đoạn/năm dưới đây, chấm điểm 4 khía cạnh (sức khỏe, công việc, tài lộc, lục thân) trên thang -2 đến 2, và viết 1 câu tóm tắt ngắn.",
    "",
    "## Lá số đang luận",
    laSoJSON,
    "",
    `## Danh sách ${tenLoai} cần chấm điểm (đã tính sẵn Can/Chi + quan hệ Dụng/Hỷ/Kỵ/Cừu Thần)`,
    dsJSON,
    "hyKyCan/hyKyChi: \"dung_than\"/\"hy_than\" = thuận lợi; \"ky_than\"/\"cuu_than\" = bất lợi; \"trung_tinh\" = trung tính.",
    "",
    "## Nguyên tắc chấm điểm",
    "- Dựa CHÍNH vào hyKyCan/hyKyChi đã cho — dung_than/hy_than cả Can lẫn Chi thì điểm cao (1-2), ky_than/cuu_than cả 2 thì điểm thấp (-2 đến -1), pha trộn thì điểm quanh 0.",
    "- 4 khía cạnh KHÔNG bắt buộc điểm giống nhau trong 1 giai đoạn — dùng tài liệu tham khảo bên dưới để tinh chỉnh riêng từng khía cạnh khi có căn cứ (vd Kỵ Thần thuộc hành khắc Tài thì tai_loc thấp hơn các mục khác).",
    "- KHÔNG bịa thêm sự kiện cụ thể (bệnh gì, mất tiền vì việc gì...) — chỉ nêu XU HƯỚNG chung, đúng tinh thần tham khảo.",
    "",
    "## Tài liệu tham khảo",
    docNhieuKnowledge(KNOWLEDGE_FILES),
    "",
    "## NGUYÊN TẮC AN TOÀN NỘI DUNG (BẮT BUỘC)",
    `Tuyệt đối KHÔNG dùng các từ sau: ${tuKhoaCamTuyetDoiDangText()}`,
    tuDienThayTheDangText(),
    quyTacDienDatChungDangText(),
    "",
    "Trả về ĐÚNG ĐỦ 1 phần tử cho MỖI mục trong danh sách đầu vào (không bỏ sót, không thêm mục lạ), giữ đúng chi_so tương ứng.",
    "",
    "## Yêu cầu văn phong cho tom_tat",
    "- TUYỆT ĐỐI KHÔNG dùng dấu gạch ngang \"-\" hay chấm phẩy \";\" để nối câu (lỗi văn phong lộ rõ là AI viết) — dùng dấu phẩy hoặc tách thành câu ngắn.",
    "- TUYỆT ĐỐI KHÔNG chèn thẻ/ký hiệu giống code hoặc XML (vd </noi_dung>, <invoke>, **, ##) vào tom_tat — chỉ viết văn xuôi thuần tuý.",
    "- KHÔNG viết câu sáo rỗng kiểu AI tự nhận xét thiếu dữ liệu (vd \"chưa đủ căn cứ để xác định rõ\") — nêu thẳng xu hướng, không rào đón.",
  ].join("\n");
}

async function chamDiemDanhSach(laSo: unknown, muc: MucCanCham[], tenLoai: string): Promise<DiemGiaiDoanVan[]> {
  const laSoJSON = JSON.stringify(laSo, null, 2);
  const dsJSON = JSON.stringify(
    muc.map((m) => ({ chi_so: m.chiSo, nhan: m.nhan, tuoi: m.tuoi, canChi: m.canChi, hyKyCan: m.hyKyCan, hyKyChi: m.hyKyChi })),
    null,
    2,
  );
  const system = buildSystemPrompt(laSoJSON, dsJSON, tenLoai);
  const userMessage = `Hãy chấm điểm đúng đủ ${muc.length} mục trong danh sách ${tenLoai} theo đúng dữ liệu và nguyên tắc đã nêu.`;

  const { input, usage } = await goiClaudeToolUse(system, userMessage, "tra_ve_diem_so", SCHEMA_DIEM, 3000);
  const model = (typeof process !== "undefined" ? process.env?.ANTHROPIC_MODEL : undefined) || "claude-sonnet-5";
  ghiLogChiPhi(`Luận giải Bát Tự — Chấm điểm ${tenLoai}`, model, usage);

  const danhSach = Array.isArray(input?.danh_sach) ? (input!.danh_sach as Record<string, unknown>[]) : [];
  const theoChiSo = new Map(danhSach.map((d) => [Number(d.chi_so), d]));

  return muc.map((m) => {
    const d = theoChiSo.get(m.chiSo);
    const layDiem = (v: unknown): number => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.max(-2, Math.min(2, Math.round(n))) : 0;
    };
    let tomTat = typeof d?.tom_tat === "string" ? xoaTheLaConSot(d.tom_tat.trim()) : "";
    if (tomTat && quetHauKiem(tomTat).length > 0) tomTat = TOM_TAT_KHONG_QUA;
    if (!tomTat) tomTat = TOM_TAT_KHONG_QUA;

    return {
      nhan: m.nhan,
      canChi: m.canChi,
      tuoi: m.tuoi,
      sucKhoe: layDiem(d?.suc_khoe),
      congViec: layDiem(d?.cong_viec),
      taiLoc: layDiem(d?.tai_loc),
      lucThan: layDiem(d?.luc_than),
      tomTat,
    };
  });
}

export async function taoBieuDoDaiVan(chart: BatTuChart, analysis: BatTuAnalysis, laSo: unknown): Promise<DiemGiaiDoanVan[]> {
  const dt = analysis.dungThan;
  const muc: MucCanCham[] = chart.daiVan.map((dv, i) => ({
    chiSo: i,
    nhan: `${dv.startAge}-${dv.endAge} tuổi`,
    tuoi: `${dv.startAge}-${dv.endAge}`,
    canChi: `${dv.can} ${dv.chi}`,
    hyKyCan: hyKyCuaHanh(hanhCan(dv.can), dt),
    hyKyChi: hyKyCuaHanh(hanhChi(dv.chi), dt),
  }));
  if (muc.length === 0) return [];
  return chamDiemDanhSach(laSo, muc, "Đại Vận");
}

export async function taoBieuDoLuuNien(chart: BatTuChart, analysis: BatTuAnalysis, laSo: unknown, namSinh: number): Promise<DiemGiaiDoanVan[]> {
  const namNay = new Date().getFullYear();
  const danhSachNam = tinhLuuNien(namNay, namSinh, 10);
  const dt = analysis.dungThan;
  const muc: MucCanCham[] = danhSachNam.map((n, i) => ({
    chiSo: i,
    nhan: String(n.year),
    tuoi: String(n.tuoi),
    canChi: `${n.can} ${n.chi}`,
    hyKyCan: hyKyCuaHanh(hanhCan(n.can), dt),
    hyKyChi: hyKyCuaHanh(hanhChi(n.chi), dt),
  }));
  return chamDiemDanhSach(laSo, muc, "Lưu Niên");
}
