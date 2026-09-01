// TẦNG AI CƠ BẢN (149.000đ) — Bước 3-5 của quy trình 8 bước (quy-trinh-luan-chi-tiet.md):
// Luận Thiên Bàn, Luận các chủ đề chính, Luận đủ 12 cung (7 phần/cung).
//
// AI KHÔNG tự tính lá số, KHÔNG tự chấm điểm — mọi con số (điểm 1-5, sao gì, trạng thái gì) đã có
// sẵn trong dữ liệu đưa vào (xem adapter.ts). Việc của AI CHỈ LÀ diễn giải theo đúng khung phương
// pháp trong content/tu-vi-luan-giai/knowledge/, và bám few-shot mẫu (vi-du-mau-luan-giai-day-du.md)
// về văn phong/độ sâu.

import { goiAiToolUseVoiRetry } from "../../ai/goi-ai";
import { docNhieuKnowledge } from "./contentLoader";
import { serializeDuLieuChoPrompt, type DuLieuLaSoTuVi } from "./adapter";
import { coTruongRong } from "./kiemTraDayDu";

const TEN_CUNG_SNAKE = [
  "phu_mau", "phuc_duc", "dien_trach", "quan_loc", "no_boc", "thien_di",
  "tat_ach", "tai_bach", "tu_tuc", "phu_the", "huynh_de", "menh",
] as const;
export type KhoaCungSnake = (typeof TEN_CUNG_SNAKE)[number];

export const TEN_CUNG_HIEN_THI: Record<KhoaCungSnake, string> = {
  phu_mau: "Phụ Mẫu", phuc_duc: "Phúc Đức", dien_trach: "Điền Trạch", quan_loc: "Quan Lộc",
  no_boc: "Nô Bộc", thien_di: "Thiên Di", tat_ach: "Tật Ách", tai_bach: "Tài Bạch",
  tu_tuc: "Tử Tức", phu_the: "Phu Thê", huynh_de: "Huynh Đệ", menh: "Mệnh",
};

/** 7 phần bắt buộc mỗi cung — SPEC.md mục 2, đúng thứ tự. */
export type LuanCung = {
  ketLuanNhanh: string;
  phanTichCauTruc: string;
  diemManh: string;
  diemYeu: string;
  nguyenNhan: string;
  khaNangUngNghiem: string;
  khuyenNghi: string;
};

export type ChuDeChinh = {
  hocVan: string;
  ngheNghiep: string;
  taiChinh: string;
  honNhan: string;
  sucKhoe: string;
  khoKhan: string;
  dinhHuong: string;
};

export type KetQuaCoBan = {
  luanThienBan: string;
  chuDe: ChuDeChinh;
  cung: Record<KhoaCungSnake, LuanCung>;
};

const CUNG_SCHEMA_PROPS = {
  ket_luan_nhanh: { type: "string", description: "1-2 câu Cát/Hung/Bình cho cung này — kết luận trước, giải thích sau." },
  phan_tich_cau_truc: { type: "string", description: "Chính tinh gì, Đắc/Hãm, trung tinh nào hội ở Tam Phương Tứ Chính, dùng khung Bát Pháp/Tám Phương Pháp." },
  diem_manh: { type: "string", description: "Điểm mạnh cụ thể, có căn cứ từ sao/cách cục nào." },
  diem_yeu: { type: "string", description: "Điểm yếu cụ thể, có căn cứ." },
  nguyen_nhan: { type: "string", description: "TẠI SAO có điểm mạnh/yếu đó — cơ chế sinh khắc, Đắc/Hãm, Tuần Triệt... không chỉ liệt kê hiện tượng." },
  kha_nang_ung_nghiem: { type: "string", description: "Cung này thể hiện rõ nhất giai đoạn nào của cuộc đời — liên hệ Đại Hạn nếu trùng." },
  khuyen_nghi: { type: "string", description: "Hành động/thái độ nên có, cụ thể — không lời khuyên chung chung." },
} as const;
const CUNG_REQUIRED = Object.keys(CUNG_SCHEMA_PROPS);

function cungSchema(tenCung: string) {
  return {
    type: "object",
    description: `Luận cung ${tenCung} — đủ 7 phần, không cắt.`,
    properties: CUNG_SCHEMA_PROPS,
    required: CUNG_REQUIRED,
  };
}

const SCHEMA = {
  type: "object",
  properties: {
    luan_thien_ban: {
      type: "string",
      description:
        "Bước 3: Luận Thiên Bàn — Tam Phương Tứ Chính các cung trọng yếu, ưu/nhược/năng lực/rủi ro tổng thể toàn bàn. Khái quát thành nhận định về con người, không liệt kê lại nguyên văn ý nghĩa từng sao. Độ dài tương đương 1 đoạn văn đầy đủ (250-400 chữ).",
    },
    chu_de: {
      type: "object",
      description: "Bước 4: mỗi chủ đề 1 đoạn ngắn (60-120 chữ), như bản đồ tổng quan.",
      properties: {
        hoc_van: { type: "string", description: "Học vấn và tư duy — dựa vào Mệnh, Quan Lộc, Xương Khúc, Khoa nếu có." },
        nghe_nghiep: { type: "string", description: "Nghề nghiệp và công danh — dựa vào Quan Lộc, Mệnh, Thân (nếu Thân cư Quan)." },
        tai_chinh: { type: "string", description: "Tài chính — dựa vào Tài Bạch, Điền Trạch, Phúc Đức." },
        hon_nhan: { type: "string", description: "Hôn nhân — dựa vào Phu Thê." },
        suc_khoe: { type: "string", description: "Sức khỏe — dựa vào Tật Ách, Mệnh. Diễn đạt thận trọng, không doạ dẫm." },
        kho_khan: { type: "string", description: "Khó khăn và thử thách — cung nào hội tụ nhiều sát tinh/Tuần Triệt nhất trên toàn bàn." },
        dinh_huong: { type: "string", description: "Định hướng phát triển — tổng hợp Mệnh + Thân + Quan Lộc + Đại Hạn hiện tại." },
      },
      required: ["hoc_van", "nghe_nghiep", "tai_chinh", "hon_nhan", "suc_khoe", "kho_khan", "dinh_huong"],
    },
    cung: {
      type: "object",
      description:
        "Luận đủ 12 cung theo đúng thứ tự: Phụ Mẫu → Phúc Đức → Điền Trạch → Quan Lộc → Nô Bộc → Thiên Di → Tật Ách → Tài Bạch → Tử Tức → Phu Thê → Huynh Đệ → Mệnh (Mệnh luận sau cùng, như tổng kết sau khi đã hiểu toàn cục).",
      properties: Object.fromEntries(TEN_CUNG_SNAKE.map((k) => [k, cungSchema(TEN_CUNG_HIEN_THI[k])])),
      required: [...TEN_CUNG_SNAKE],
    },
  },
  required: ["luan_thien_ban", "chu_de", "cung"],
} as const;

const KIEN_THUC_CO_BAN = docNhieuKnowledge([
  "quy-trinh-luan-chi-tiet.md",
  "tong-luan.md",
  "an-sao-va-cau-truc-la-so.md",
  "suc-manh-cung-vi-va-cach-cuc.md",
  "phuong-phap-luan-cung-vi.md",
  "bat-phap-va-phoi-hop-tinh-ly.md",
  "chinh-tinh-tinh-ly.md",
  "trung-tinh-tieu-tinh.md",
  "vo-chinh-dieu.md",
  "tuan-triet.md",
  "vi-du-mau-luan-giai-day-du.md",
]);

const SYSTEM_CO_DINH = [
  "Bạn là Thầy Tử Vi của Phong Thủy Thiên Anh, luận giải lá số Tử Vi Đẩu Số theo phương pháp Nam",
  "Phái (Tống Nguyên Trung). Toàn bộ tri thức, phương pháp, và 1 bài mẫu đã luận hoàn chỉnh nằm ở",
  "phần TÀI LIỆU bên dưới — bám sát tài liệu này, không dùng kiến thức Tử Vi khác ngoài đây.",
  "",
  "RÀNG BUỘC CỨNG (vi phạm bất kỳ điều nào đều là lỗi nghiêm trọng):",
  "1. KHÔNG tự tính lá số, KHÔNG tự chấm điểm Cát/Hung. Điểm 1-5 mỗi cung ĐÃ được chấm sẵn bằng",
  "   công thức và đưa trong dữ liệu — dùng NGUYÊN VẸN, không tự đổi. Nếu bạn thấy văn luận và điểm",
  "   có vẻ lệch nhau, vẫn viết theo đúng chiều của điểm đã cho (điểm là sự thật, không phải gợi ý).",
  "2. KHÔNG dùng Bát Tự/Tứ Trụ, KHÔNG dùng Khâm Thiên Tứ Hóa. Thuần Tử Vi Đẩu Số.",
  "3. KHÔNG kết luận từ 1 sao đơn lẻ — luôn xét Tam Phương Tứ Chính + đối cung + toàn cục (dữ liệu",
  "   đã liệt kê đủ chính tinh/phụ tinh của cả 4 cung Tam Phương Tứ Chính cho mỗi cung).",
  "4. MỌI kết luận phải có căn cứ — nêu rõ sao/cách cục/cung nào dẫn tới kết luận, không phán đoán",
  "   suông.",
  "5. TUYỆT ĐỐI không đưa nội dung hạn tử biệt, ngày chết, hoặc dự đoán tính mạng. Cung/hạn hung",
  "   nặng → diễn đạt 'cần đặc biệt cẩn trọng' + khuyến nghị phòng ngừa cụ thể, không doạ dẫm.",
  "6. Không lộ khoảng trống dữ liệu ra khách — không viết 'chưa đủ tài liệu', 'chưa xác định'. Nếu",
  "   một khía cạnh nào đó ít căn cứ, viết ngắn gọn hơn thay vì nói ra sự thiếu hụt.",
  "7. Viết ĐỦ độ sâu, không cắt xén để tiết kiệm — khách đã trả tiền cho luận giải đầy đủ.",
  "",
  "GIỌNG VĂN: xưng 'Thầy', gọi khách bằng tên (nếu có) + anh/chị theo giới tính. Kết luận trước,",
  "giải thích sau. Tự nhiên, có chuyên môn nhưng dễ hiểu — không sáo rỗng, không thuật ngữ Hán Việt",
  "khó mà không giải thích ngay trong câu. Bám sát văn phong và độ sâu của bài mẫu trong tài liệu.",
  "",
  "=== TÀI LIỆU (phương pháp + tri thức + bài mẫu) ===",
  KIEN_THUC_CO_BAN,
].join("\n");

function dungUserPrompt(duLieu: DuLieuLaSoTuVi): string {
  return [
    serializeDuLieuChoPrompt(duLieu),
    "",
    "=== YÊU CẦU ===",
    "Chạy Bước 3 (Luận Thiên Bàn), Bước 4 (Luận các chủ đề chính), Bước 5 (Luận đủ 12 cung, mỗi",
    "cung đủ 7 phần) theo đúng khung ở quy-trinh-luan-chi-tiet.md, dùng NGUYÊN VẸN điểm số đã cho",
    "trong dữ liệu lá số ở trên. Không chạy Bước 6-8 (Đại Hạn/Tiểu Hạn/Tổng kết) — phần đó thuộc",
    "gói khác.",
  ].join("\n");
}

/** Số lần thử lại khi JSON hợp lệ (parse OK) nhưng nội dung còn trường rỗng — xem kiemTraDayDu.ts. */
const SO_LAN_THU_KHI_THIEU_NOI_DUNG = 2;

/** Gọi AI cho Tầng Cơ Bản. Trả null nếu lỗi (bên gọi tự quyết định fallback). */
export async function luanCoBan(duLieu: DuLieuLaSoTuVi): Promise<{ ketQua: KetQuaCoBan | null; usage?: unknown }> {
  let usageCuoi: unknown;

  for (let lan = 1; lan <= SO_LAN_THU_KHI_THIEU_NOI_DUNG; lan++) {
    const kq = await goiAiToolUseVoiRetry({
      tinhNang: "luan-giai-tu-vi-co-ban",
      systemCoDinh: SYSTEM_CO_DINH,
      systemThayDoi: undefined,
      userMessage: dungUserPrompt(duLieu),
      toolName: "tra_ve_luan_giai_co_ban",
      schema: SCHEMA,
      // ⚠️ 31/8/2026: chuyển DeepSeek, đo thật thấy JSON bị cắt cụt giữa chừng ("Unterminated string")
      // với 8000 — DeepSeek viết dài hơn Anthropic cho cùng schema. Tăng lên để có đủ chỗ viết hết.
      maxTokens: 16000,
      // ⚠️ 31/8/2026: cắt Anthropic, chuyển DeepSeek — deepseek-v4-flash mặc định là model "thinking",
      // từ chối tool_choice ép buộc mà goiAiToolUse luôn dùng, PHẢI ép deepseek-chat (non-thinking).
      modelOverride: { "openai-tuong-thich": "deepseek-chat" },
    });
    usageCuoi = kq.usage;

    if (!kq.input) continue;

    const raw = kq.input as {
      luan_thien_ban: string;
      chu_de: Record<string, string>;
      cung: Record<string, Record<string, string>>;
    };

    const chuyenCung = (o: Record<string, string>): LuanCung => ({
      ketLuanNhanh: o.ket_luan_nhanh ?? "",
      phanTichCauTruc: o.phan_tich_cau_truc ?? "",
      diemManh: o.diem_manh ?? "",
      diemYeu: o.diem_yeu ?? "",
      nguyenNhan: o.nguyen_nhan ?? "",
      khaNangUngNghiem: o.kha_nang_ung_nghiem ?? "",
      khuyenNghi: o.khuyen_nghi ?? "",
    });

    const ketQua: KetQuaCoBan = {
      luanThienBan: raw.luan_thien_ban ?? "",
      chuDe: {
        hocVan: raw.chu_de?.hoc_van ?? "",
        ngheNghiep: raw.chu_de?.nghe_nghiep ?? "",
        taiChinh: raw.chu_de?.tai_chinh ?? "",
        honNhan: raw.chu_de?.hon_nhan ?? "",
        sucKhoe: raw.chu_de?.suc_khoe ?? "",
        khoKhan: raw.chu_de?.kho_khan ?? "",
        dinhHuong: raw.chu_de?.dinh_huong ?? "",
      },
      cung: Object.fromEntries(
        TEN_CUNG_SNAKE.map((k) => [k, chuyenCung(raw.cung?.[k] ?? {})]),
      ) as Record<KhoaCungSnake, LuanCung>,
    };

    // ⚠️ 1/9/2026: bắt được thật — JSON hợp lệ (parse OK, đủ 92 trường theo schema) nhưng 11/12 cung
    // toàn chuỗi rỗng, chỉ cung đầu tiên theo thứ tự prompt (Phụ Mẫu) có nội dung thật. Khách đã trả
    // tiền, KHÔNG được để lọt báo cáo thiếu mục — coi như thất bại, thử lại thay vì trả về luôn.
    if (!coTruongRong(ketQua)) return { ketQua, usage: kq.usage };
    console.error(
      `[luan-giai-tu-vi] Cơ Bản: lần ${lan}/${SO_LAN_THU_KHI_THIEU_NOI_DUNG} JSON hợp lệ nhưng còn trường rỗng — thử lại.`,
    );
  }

  return { ketQua: null, usage: usageCuoi };
}

export { TEN_CUNG_SNAKE };
