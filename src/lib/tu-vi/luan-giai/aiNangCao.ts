// TẦNG AI NÂNG CAO (299.000đ) — Bước 6-8: Luận Đại Hạn, Luận Lưu Niên (Tiểu Hạn năm nay + năm sau),
// Tổng kết. Kế thừa toàn bộ Cơ Bản — nhận kèm kết quả Cơ Bản làm ngữ cảnh để Bước 8 (tổng kết) chắt
// lọc lại đúng những gì đã nói ở Bước 2-7, không mâu thuẫn/lặp nguyên văn.

import { goiAiToolUseVoiRetry } from "../../ai/goi-ai";
import { docNhieuKnowledge } from "./contentLoader";
import { serializeDuLieuChoPrompt, type DuLieuLaSoTuVi } from "./adapter";
import { TEN_CUNG_HIEN_THI, TEN_CUNG_SNAKE, type KetQuaCoBan } from "./aiCoBan";
import { coTruongRong } from "./kiemTraDayDu";

/** Khuôn Đại Hạn/Tiểu Hạn đầy đủ (mục c chỉ có ở Đại Hạn) — SPEC.md mục 3. */
export type LuanHan = {
  doanMoDau: string;
  quanTamNhieuNhat: string;
  suKienQuanTrong: { congViec: string; taiBach: string; tinhCam: string; conCai: string; sucKhoe: string };
  toXauSoVoiHanKhac?: string;
  loiKhuyenNen: string[];
  loiKhuyenKhongNen: string[];
  chotLai: string;
};

export type TongKet = {
  diemManh: string[];
  diemYeu: string[];
  giaiDoanPhatTrienNhat: string;
  giaiDoanCanCanTrong: string;
  nganhNghePhuHop: string;
  dieuNenTranh: string;
  chienLuocDaiHan: string;
};

export type KetQuaNangCao = {
  daiHan: LuanHan;
  tieuHanNamNay: LuanHan;
  tieuHanNamSau: LuanHan;
  tongKet: TongKet;
};

function suKienSchema() {
  return {
    type: "object",
    description: "Sự kiện quan trọng có thể xảy ra, chia theo nhóm (bỏ trống nhóm nào không có căn cứ).",
    properties: {
      cong_viec: { type: "string" },
      tai_bach: { type: "string" },
      tinh_cam: { type: "string" },
      con_cai: { type: "string" },
      suc_khoe: { type: "string" },
    },
    required: ["cong_viec", "tai_bach", "tinh_cam", "con_cai", "suc_khoe"],
  };
}

function luanHanSchema(coMucC: boolean) {
  const properties: Record<string, unknown> = {
    doan_mo_dau: { type: "string", description: "Đoạn mở đầu về trục hạn, 150-200 chữ." },
    quan_tam_nhieu_nhat: { type: "string", description: "a) Hạn này quan tâm nhiều nhất điều gì?" },
    su_kien_quan_trong: suKienSchema(),
    loi_khuyen_nen: { type: "array", items: { type: "string" }, description: "✅ Nên làm gì — 2-4 ý cụ thể." },
    loi_khuyen_khong_nen: { type: "array", items: { type: "string" }, description: "⛔ Không nên làm gì — 2-4 ý cụ thể." },
    chot_lai: { type: "string", description: "Chốt lại của Thầy — 2-3 câu tổng kết riêng cho hạn này." },
  };
  const required = ["doan_mo_dau", "quan_tam_nhieu_nhat", "su_kien_quan_trong", "loi_khuyen_nen", "loi_khuyen_khong_nen", "chot_lai"];
  if (coMucC) {
    properties.to_xau_so_voi_han_khac = { type: "string", description: "c) Hạn này tốt/xấu ra sao so với hạn trước/hạn sau?" };
    required.push("to_xau_so_voi_han_khac");
  }
  return { type: "object", properties, required };
}

const SCHEMA = {
  type: "object",
  properties: {
    dai_han: luanHanSchema(true),
    tieu_han_nam_nay: luanHanSchema(false),
    tieu_han_nam_sau: luanHanSchema(false),
    tong_ket: {
      type: "object",
      properties: {
        diem_manh: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5, description: "Đúng 5 điểm mạnh nổi bật, chắt lọc từ Bước 2-7, không lặp nguyên văn." },
        diem_yeu: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5, description: "Đúng 5 điểm cần lưu ý." },
        giai_doan_phat_trien_nhat: { type: "string", description: "Đại Hạn nào thuận nhất và vì sao." },
        giai_doan_can_can_trong: { type: "string", description: "Đại Hạn nào cần đề phòng nhất và vì sao — diễn đạt phòng ngừa, không đoán hạn nặng nề." },
        nganh_nghe_phu_hop: { type: "string", description: "Dựa trên tính lý Mệnh/Thân/Quan Lộc." },
        dieu_nen_tranh: { type: "string" },
        chien_luoc_dai_han: { type: "string", description: "Chiến lược sống dài hạn, 3-5 câu." },
      },
      required: ["diem_manh", "diem_yeu", "giai_doan_phat_trien_nhat", "giai_doan_can_can_trong", "nganh_nghe_phu_hop", "dieu_nen_tranh", "chien_luoc_dai_han"],
    },
  },
  required: ["dai_han", "tieu_han_nam_nay", "tieu_han_nam_sau", "tong_ket"],
} as const;

const KIEN_THUC_NANG_CAO = docNhieuKnowledge([
  "quy-trinh-luan-chi-tiet.md",
  "luan-han.md",
  "bat-phap-va-phoi-hop-tinh-ly.md",
  "vi-du-mau-luan-giai-day-du.md",
]);

const SYSTEM_CO_DINH = [
  "Bạn là Thầy Tử Vi của Phong Thủy Thiên Anh. Khách đã mua gói Nâng Cao — bạn viết TIẾP phần Đại",
  "Hạn/Tiểu Hạn/Tổng kết cho một lá số đã được luận đủ 12 cung ở gói Cơ Bản (nội dung Cơ Bản đưa",
  "kèm dưới đây làm ngữ cảnh, KHÔNG viết lại phần đó).",
  "",
  "RÀNG BUỘC CỨNG (giống hệt gói Cơ Bản):",
  "1. KHÔNG tự tính lá số, KHÔNG tự chấm điểm — điểm 1-5 của Đại Hạn/Tiểu Hạn ĐÃ được chấm sẵn,",
  "   dùng nguyên vẹn.",
  "2. Thuần Tử Vi, không Bát Tự/Tứ Trụ/Khâm Thiên Tứ Hóa.",
  "3. TUYỆT ĐỐI không đưa nội dung hạn tử biệt, ngày chết, dự đoán tính mạng. Hạn hung nặng →",
  "   'cần đặc biệt cẩn trọng' + khuyến nghị phòng ngừa cụ thể.",
  "4. Bước Tổng Kết PHẢI nhất quán với nội dung Cơ Bản đưa kèm — không mâu thuẫn, không bịa thêm",
  "   sao/cách cục mới ngoài những gì đã xuất hiện trong dữ liệu và bài Cơ Bản.",
  "5. Không lộ khoảng trống dữ liệu, không viết 'chưa xác định'.",
  "6. TOÀN BỘ nội dung PHẢI viết bằng tiếng Việt thuần tuý — tuyệt đối không chen tiếng Anh hay bất",
  "   kỳ ngôn ngữ nào khác vào câu văn, kể cả 1 từ. Thuật ngữ chuyên môn dùng đúng Hán Việt đã có",
  "   trong tài liệu, không dịch/mượn tiếng Anh.",
  "",
  "GIỌNG VĂN: xưng 'Thầy', kết luận trước giải thích sau, bám văn phong bài mẫu.",
  "",
  "=== TÀI LIỆU (phương pháp Luận Hạn + bài mẫu) ===",
  KIEN_THUC_NANG_CAO,
].join("\n");

function tomTatCoBan(kq: KetQuaCoBan): string {
  const phan: string[] = [`Luận Thiên Bàn: ${kq.luanThienBan}`];
  for (const k of TEN_CUNG_SNAKE) {
    const c = kq.cung[k];
    phan.push(`- ${TEN_CUNG_HIEN_THI[k]}: ${c.ketLuanNhanh} | Mạnh: ${c.diemManh} | Yếu: ${c.diemYeu}`);
  }
  return phan.join("\n");
}

function dungUserPrompt(duLieu: DuLieuLaSoTuVi, coBan: KetQuaCoBan): string {
  return [
    serializeDuLieuChoPrompt(duLieu),
    "",
    "=== TÓM TẮT BÀI CƠ BẢN ĐÃ VIẾT (dùng làm ngữ cảnh, không viết lại) ===",
    tomTatCoBan(coBan),
    "",
    "=== YÊU CẦU ===",
    "Chạy Bước 6 (Luận Đại Hạn hiện tại), Bước 7 (Luận Lưu Niên — Tiểu Hạn năm nay VÀ năm sau,",
    "khuôn rút gọn bỏ mục c), Bước 8 (Tổng kết toàn bài) theo đúng khung luan-han.md và",
    "quy-trinh-luan-chi-tiet.md. Dùng nguyên vẹn điểm số Đại Hạn/Tiểu Hạn đã cho.",
  ].join("\n");
}

/** Số lần thử lại khi JSON hợp lệ (parse OK) nhưng nội dung còn trường rỗng — xem kiemTraDayDu.ts. */
const SO_LAN_THU_KHI_THIEU_NOI_DUNG = 2;

export async function luanNangCao(
  duLieu: DuLieuLaSoTuVi,
  coBan: KetQuaCoBan,
): Promise<{ ketQua: KetQuaNangCao | null; usage?: unknown }> {
  let usageCuoi: unknown;

  for (let lan = 1; lan <= SO_LAN_THU_KHI_THIEU_NOI_DUNG; lan++) {
    const kq = await goiAiToolUseVoiRetry({
      tinhNang: "luan-giai-tu-vi-nang-cao",
      systemCoDinh: SYSTEM_CO_DINH,
      systemThayDoi: undefined,
      userMessage: dungUserPrompt(duLieu, coBan),
      toolName: "tra_ve_luan_giai_nang_cao",
      schema: SCHEMA,
      // ⚠️ 31/8/2026: chuyển DeepSeek, đo thật thấy JSON bị cắt cụt giữa chừng với 6000 — cùng lý do
      // như aiCoBan.ts, xem ghi chú ở đó. Tăng lên để có đủ chỗ viết hết.
      maxTokens: 12000,
      // ⚠️ 31/8/2026: cắt Anthropic, chuyển DeepSeek — deepseek-v4-flash mặc định là model "thinking",
      // từ chối tool_choice ép buộc mà goiAiToolUse luôn dùng, PHẢI ép deepseek-chat (non-thinking).
      modelOverride: { "openai-tuong-thich": "deepseek-chat" },
    });
    usageCuoi = kq.usage;

    if (!kq.input) continue;

    const raw = kq.input as {
      dai_han: Record<string, unknown>;
      tieu_han_nam_nay: Record<string, unknown>;
      tieu_han_nam_sau: Record<string, unknown>;
      tong_ket: Record<string, unknown>;
    };

    const chuyenHan = (o: Record<string, unknown>): LuanHan => ({
      doanMoDau: (o.doan_mo_dau as string) ?? "",
      quanTamNhieuNhat: (o.quan_tam_nhieu_nhat as string) ?? "",
      suKienQuanTrong: {
        congViec: ((o.su_kien_quan_trong as Record<string, string>)?.cong_viec) ?? "",
        taiBach: ((o.su_kien_quan_trong as Record<string, string>)?.tai_bach) ?? "",
        tinhCam: ((o.su_kien_quan_trong as Record<string, string>)?.tinh_cam) ?? "",
        conCai: ((o.su_kien_quan_trong as Record<string, string>)?.con_cai) ?? "",
        sucKhoe: ((o.su_kien_quan_trong as Record<string, string>)?.suc_khoe) ?? "",
      },
      toXauSoVoiHanKhac: o.to_xau_so_voi_han_khac as string | undefined,
      loiKhuyenNen: Array.isArray(o.loi_khuyen_nen) ? (o.loi_khuyen_nen as string[]) : [],
      loiKhuyenKhongNen: Array.isArray(o.loi_khuyen_khong_nen) ? (o.loi_khuyen_khong_nen as string[]) : [],
      chotLai: (o.chot_lai as string) ?? "",
    });

    const tk = raw.tong_ket ?? {};
    const ketQua: KetQuaNangCao = {
      daiHan: chuyenHan(raw.dai_han ?? {}),
      tieuHanNamNay: chuyenHan(raw.tieu_han_nam_nay ?? {}),
      tieuHanNamSau: chuyenHan(raw.tieu_han_nam_sau ?? {}),
      tongKet: {
        diemManh: Array.isArray(tk.diem_manh) ? (tk.diem_manh as string[]) : [],
        diemYeu: Array.isArray(tk.diem_yeu) ? (tk.diem_yeu as string[]) : [],
        giaiDoanPhatTrienNhat: (tk.giai_doan_phat_trien_nhat as string) ?? "",
        giaiDoanCanCanTrong: (tk.giai_doan_can_can_trong as string) ?? "",
        nganhNghePhuHop: (tk.nganh_nghe_phu_hop as string) ?? "",
        dieuNenTranh: (tk.dieu_nen_tranh as string) ?? "",
        chienLuocDaiHan: (tk.chien_luoc_dai_han as string) ?? "",
      },
    };

    if (!coTruongRong(ketQua)) return { ketQua, usage: kq.usage };
    console.error(
      `[luan-giai-tu-vi] Nâng Cao: lần ${lan}/${SO_LAN_THU_KHI_THIEU_NOI_DUNG} JSON hợp lệ nhưng còn trường rỗng — thử lại.`,
    );
  }

  return { ketQua: null, usage: usageCuoi };
}
