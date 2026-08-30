/**
 * Lớp AI luận chi tiết Huyền Không Phi Tinh — bản Trả Phí, ĐANG TEST NỘI BỘ (admin-only, xem
 * checkRateLimit + isAdmin ở route gọi hàm này). Dùng DeepSeek qua goi-ai.ts (tinhNang
 * "huyen-khong-luan-chi-tiet") theo yêu cầu anh Công 30/8/2026.
 *
 * Nguyên tắc: AI chỉ được luận dựa trên (1) tinh bàn đã tính sẵn bởi engine.ts, (2) Nhóm B do
 * khách khai, (3) 2 nguồn nhúng cứng trong tri-thuc-ai.ts (quy trình 10 bước + hóa giải theo mức
 * đồng thuận). KHÔNG được tự sáng tác cách cục/hóa giải ngoài 2 nguồn đó — prompt nhắc rõ điều
 * này và tự nêu "chưa đủ dữ liệu" khi thiếu loan đầu, khác hẳn nguyên tắc "không lộ khoảng trống"
 * đang dùng cho Tử Vi (module này CỐ Ý để lộ, vì đó là yêu cầu gốc của nhiệm vụ).
 */
import { goiAiToolUse } from "../ai/goi-ai";
import { CUNG_INFO, TEN_SAO, THU_TU_BAY, type KetQuaHuyenKhong } from "./engine";
import { HOA_GIAI_SAT_KHI, QUY_TRINH_LUAN, THU_SON_XUAT_SAT_VA_CHINH_THAN, Y_NGHIA_81_CAP_SAO } from "./tri-thuc-ai";

export interface NhomBLoanDau {
  nui: number[];
  nuoc: number[];
  cuaChinh: number | null;
  bep: number | null;
  giuongNgu: number | null;
  banLamViec: number | null;
  cauThang: number | null;
  wc: number[];
  gieng: number | null;
  soTang: number | null;
}

const MUC_CAT_HUNG = ["đại cát", "cát", "bình", "hung", "đại hung"] as const;

const SCHEMA = {
  type: "object",
  properties: {
    tom_tat_truc_son_huong: { type: "string", description: "Bước 7: đắc/thất vị của Sơn tinh tại Tọa, Hướng tinh tại Hướng, có phạm Thượng Sơn Hạ Thủy không." },
    bo_tri_thuy: { type: "string", description: "Luận Chính Thần/Linh Thần cho nhà này: phương nào đang có/nên tránh nước (Chính Thần), phương nào nên mở cửa/đường có nước (Linh Thần) — đối chiếu với loan đầu Nhóm B thực tế." },
    tung_cung: {
      type: "array",
      items: {
        type: "object",
        properties: {
          cung: { type: "string" },
          muc_cat_hung: { type: "string", enum: [...MUC_CAT_HUNG] },
          dac_that_cach: { type: "string", description: "Đắc/thất cách theo loan đầu, hoặc ghi rõ 'chưa đủ dữ liệu loan đầu' nếu thiếu." },
          luan_chi_tiet: { type: "string" },
          hoa_giai: { type: "string", description: "Để chuỗi rỗng nếu cung này không cần hóa giải." },
        },
        required: ["cung", "muc_cat_hung", "dac_that_cach", "luan_chi_tiet", "hoa_giai"],
      },
    },
    ket_luan_tong_the: {
      type: "object",
      properties: {
        tai_loc: { type: "string" },
        nhan_dinh: { type: "string" },
        suc_khoe: { type: "string" },
        cong_danh: { type: "string" },
        hon_nhan: { type: "string" },
      },
      required: ["tai_loc", "nhan_dinh", "suc_khoe", "cong_danh", "hon_nhan"],
    },
    cung_nen_kich_hoat: { type: "array", items: { type: "string" } },
    cung_can_giu_tinh: { type: "array", items: { type: "string" } },
    thu_tu_uu_tien: { type: "array", items: { type: "string" } },
    luu_nien: { type: "string", description: "Luận vận khí năm/tháng cụ thể nếu có dữ liệu Niên tinh/Nguyệt tinh; để chuỗi rỗng nếu không có." },
    gioi_han_luu_y: { type: "array", items: { type: "string" }, description: "Những chỗ AI thấy dữ liệu chưa đủ (thiếu loan đầu, vận ngoài Vận 9 chưa kiểm chứng...)." },
  },
  required: ["tom_tat_truc_son_huong", "bo_tri_thuy", "tung_cung", "ket_luan_tong_the", "cung_nen_kich_hoat", "cung_can_giu_tinh", "thu_tu_uu_tien", "luu_nien", "gioi_han_luu_y"],
} as const;

export interface KetQuaLuanAi {
  tomTatTrucSonHuong: string;
  boTriThuy: string;
  tungCung: Array<{ cung: string; mucCatHung: string; dacThatCach: string; luanChiTiet: string; hoaGiai: string }>;
  ketLuanTongThe: { taiLoc: string; nhanDinh: string; sucKhoe: string; congDanh: string; honNhan: string };
  cungNenKichHoat: string[];
  cungCanGiuTinh: string[];
  thuTuUuTien: string[];
  luuNien: string;
  gioiHanLuuY: string[];
}

const SYSTEM_CO_DINH = [
  "Bạn là chuyên gia luận Huyền Không Phi Tinh, làm việc theo ĐÚNG quy trình dưới đây — không bỏ",
  "bước, không tự sáng tác cách cục hay phương pháp hóa giải/kích hoạt ngoài các nguồn được cung cấp.",
  "",
  "NGUYÊN TẮC BẮT BUỘC:",
  "1. Tinh bàn (Sơn/Vận/Hướng tinh từng cung), cách cục, Thành Môn, Chính-Linh-Chiếu Thần, Thu Sơn",
  "   Xuất Sát đã được TÍNH SẴN bằng công thức — dùng NGUYÊN VẸN, không tự tính lại, không sửa.",
  "1b. PHÂN BIỆT 2 VẬN: 'Vận nhà' (lập tinh bàn, cố định) và 'Vận đương lệnh' (xét vượng/suy hiện",
  "   tại). Nếu nhà ĐÃ THOÁI VẬN (2 vận khác nhau, xem dòng cảnh báo đầu dữ liệu): trạng thái",
  "   vượng/suy từng cung đã tính theo vận đương lệnh — luận đúng theo đó. Cách cục (Vượng Sơn Vượng",
  "   Hướng…) theo vận nhà PHẢI nói rõ là ĐÃ MẤT THỜI, chỉ còn nền tảng; TUYỆT ĐỐI không kết luận",
  "   nhà đang vượng dựa trên cách cục của vận nhà đã qua.",
  "2. Đắc/thất cách CHỈ được kết luận khi có dữ liệu loan đầu (Nhóm B) cho đúng cung đó. Cung nào",
  "   khách không khai loan đầu thì PHẢI ghi rõ 'chưa đủ dữ liệu loan đầu để xét đắc/thất cách tại",
  "   cung này' trong trường dac_that_cach — TUYỆT ĐỐI không tự đoán loan đầu không có.",
  "3. Hóa giải/kích hoạt CHỈ lấy từ 2 tài liệu HÓA GIẢI bên dưới (theo sát khí tổng quát VÀ theo",
  "   từng sao/cặp sao) — khi đề xuất, nếu nguồn ghi '1 nguồn duy nhất' hoặc 'chưa có nguồn thứ 2",
  "   đối chiếu' PHẢI nói rõ điều đó trong câu trả lời. Không hóa giải cho các trường hợp 'CỰC HUNG",
  "   không hóa giải được' hoặc thiếu dữ liệu do OCR — chỉ cảnh báo tránh phạm phải hoặc nói rõ",
  "   'nguồn không đủ dữ liệu'.",
  "4. Nếu VẬN ĐƯƠNG LỆNH khác 9: mục 'ý nghĩa cặp (chỉ Vận 9)' trong dữ liệu sẽ trống — dùng bảng 81",
  "   cặp sao (Y_NGHIA_81_CAP_SAO) thay thế, LUÔN đối chiếu với Thời/Hình/Khí theo đúng cảnh báo",
  "   ở đầu tài liệu đó — không trích thẳng 'điềm báo' làm kết luận cuối.",
  "5. Chính Thần kỵ thấy nước, Linh Thần có nước là cát — quy tắc NGƯỢC TRỰC GIÁC, đối chiếu đúng",
  "   dữ liệu chinh_linh_than khi luận bố trí thủy, không tự suy theo trực giác thông thường.",
  "6. Thu Sơn Xuất Sát: đối chiếu khuyến nghị cao/thấp đã tính với loan đầu Nhóm B thực tế tại đúng",
  "   cung đó để biết đã đúng Thu Sơn Xuất Sát hay chưa — sao xấu đúng vị trí Xuất Sát vẫn có thể",
  "   vô hại, không mặc định kết luận hung chỉ từ con số sao.",
  "7. Ghi nhận thẳng những chỗ dữ liệu chưa đủ vào gioi_han_luu_y, không che giấu.",
  "8. VIẾT SÚC TÍCH để vừa khuôn dữ liệu: mỗi luan_chi_tiet 2-3 câu, mỗi mục ket_luan_tong_the 1-2",
  "   câu, mỗi phần tử mảng 1 câu ngắn. KHÔNG lặp lại nguyên văn dữ liệu đã cho, KHÔNG viết lan man —",
  "   đi thẳng vào kết luận có căn cứ. (Báo cáo quá dài sẽ bị cắt giữa chừng, hỏng cả kết quả.)",
  "",
  "=== QUY TRÌNH LUẬN (bám sát, đủ 10 bước cho mỗi cung) ===",
  QUY_TRINH_LUAN,
  "",
  "=== THU SƠN XUẤT SÁT · LUẬN CỬA CHÍNH · ĐƯỜNG KHÍ · CHÍNH-LINH-CHIẾU THẦN ===",
  THU_SON_XUAT_SAT_VA_CHINH_THAN,
  "",
  "=== HÓA GIẢI SÁT KHÍ TỔNG QUÁT (ưu tiên đồng thuận nhiều thầy) ===",
  HOA_GIAI_SAT_KHI,
  "",
  "=== Ý NGHĨA 81 CẶP SAO + KÍCH HOẠT/HÓA GIẢI THEO TỪNG SAO ===",
  Y_NGHIA_81_CAP_SAO,
].join("\n");

function tenCung(c: number): string {
  return CUNG_INFO[c].ten;
}

function serializeTinhBan(kq: KetQuaHuyenKhong): string {
  const tb = kq.tinh_ban;
  const dong = THU_TU_BAY.map((c) => {
    const p = kq.cac_cung.find((x) => tenCung(c) === x.cung)!;
    return `- ${p.cung}${c === tb.cung_toa ? " [TỌA]" : ""}${c === tb.cung_huong ? " [HƯỚNG]" : ""}: ` +
      `Sơn tinh ${p.son_tinh} (${TEN_SAO[p.son_tinh]}, ${p.tt_son}) — Vận tinh ${p.van_tinh} — ` +
      `Hướng tinh ${p.huong_tinh} (${TEN_SAO[p.huong_tinh]}, ${p.tt_huong})` +
      (p.danh_cuc ? ` — danh cục: ${p.danh_cuc[0]} [${p.danh_cuc[1]}]: ${p.danh_cuc[2]}` : "") +
      (p.y_nghia_cap ? ` — ý nghĩa cặp (chỉ Vận 9): ${p.y_nghia_cap}` : "") +
      (p.canh_bao.length ? ` — cảnh báo: ${p.canh_bao.join("; ")}` : "");
  }).join("\n");

  const cachCuc = kq.cach_cuc.map(([ten, tc, mt]) => `- ${ten} [${tc}]: ${mt}`).join("\n");
  const thanhMon = kq.thanh_mon
    .map((tm) =>
      `- ${tm.son} (${tm.cung}) — Thành Môn ${tm.loai} — ${tm.kha_dung ? "CHÂN Thành Môn (dùng được)" : "GIẢ Thành Môn (không dùng)"} ` +
      `[Hướng tinh ${tm.sao_ve_cung} · Sơn tinh ${tm.son_tinh_tai_do} (${tm.trang_thai_son_tinh})]` +
      `${tm.thanh_mon_ngam ? " — có Thành Môn Ngầm" : ""}${tm.canh_bao ? ` — ⚠️ ${tm.canh_bao}` : ""}`
    )
    .join("\n");

  const clt = kq.chinh_linh_than;
  const chinhLinhThan = [
    `Chính Thần: sao ${clt.chinh_than_so} tại ${clt.chinh_than_cung} — ${clt.quy_tac_chinh_than}`,
    `Linh Thần: sao ${clt.linh_than_so ?? "—"} tại ${clt.linh_than_cung} — ${clt.quy_tac_linh_than}`,
    `Chiếu Thần: sao ${clt.chieu_than_so ?? "—"} tại ${clt.chieu_than_cung}`,
  ].join("\n");

  const thuSonXuatSat = kq.thu_son_xuat_sat
    .map((t) => `- ${t.cung}: ${t.khuyen_nghi.join(" | ")}`)
    .join("\n");

  const dongThoaiVan = kq.da_thoai_van
    ? `⚠️ NHÀ ĐÃ THOÁI VẬN: tinh bàn lập theo Vận ${kq.van_nha} (năm nhập trạch) nhưng nay đang ở Vận ` +
      `${kq.van_hien_tai} (đương lệnh). Vượng/suy của các sao (cột trạng thái từng cung, Thu Sơn Xuất Sát, ` +
      `Chính-Linh Thần) ĐÃ xét theo Vận ${kq.van_hien_tai} hiện tại — các sao vượng của Vận ${kq.van_nha} nay ` +
      `đã thoái khí. Cách cục (Vượng Sơn Vượng Hướng…) giữ theo Vận ${kq.van_nha} là kết cấu gốc, PHẢI luận rõ ` +
      `rằng cách cục đó nay đã mất thời, chỉ còn là nền tảng — không được nói nhà đang vượng theo cách cục Vận ` +
      `${kq.van_nha}. Thành Môn cố định theo lá số (Vận ${kq.van_nha}).`
    : `Nhà đúng vận hiện tại (Vận ${kq.van_hien_tai}) — vận nhà và vận đương lệnh trùng nhau.`;

  return [
    `Tọa ${tb.son_toa} (${tb.do_toa}°) — Hướng ${tb.son_huong} (${tb.do_huong}°)`,
    `Vận NHÀ (lập tinh bàn): ${kq.van_nha} · Vận ĐƯƠNG LỆNH (xét vượng/suy): ${kq.van_hien_tai}`,
    dongThoaiVan,
    `Phân loại Hướng: ${tb.phan_loai_huong.loai} (lệch ${tb.phan_loai_huong.lech}°) — ${tb.phan_loai_huong.mo_ta}`,
    `Phân loại Tọa: ${tb.phan_loai_toa.loai} (lệch ${tb.phan_loai_toa.lech}°) — ${tb.phan_loai_toa.mo_ta}`,
    "",
    "=== TỪNG CUNG (Sơn tinh — Vận tinh — Hướng tinh; trạng thái vượng/suy theo Vận đương lệnh) ===",
    dong,
    "",
    `=== CÁCH CỤC TOÀN BÀN (theo Vận ${kq.van_nha} — kết cấu gốc, xét mất thời nếu đã thoái vận) ===`,
    cachCuc || "(không có cách cục lớn đặc biệt)",
    "",
    "=== THÀNH MÔN (cố định theo lá số, điều kiện Chân/Giả Thành Môn) ===",
    thanhMon,
    "",
    "=== CHÍNH THẦN — LINH THẦN — CHIẾU THẦN (Vận đương lệnh " + kq.van_hien_tai + ") ===",
    chinhLinhThan,
    "",
    "=== THU SƠN XUẤT SÁT TỪNG CUNG (xét theo Vận đương lệnh) ===",
    thuSonXuatSat,
  ].join("\n");
}

function serializeLoanDau(nhomB: NhomBLoanDau): string {
  const theoCung = (danhSach: number[], nhan: string) =>
    danhSach.length ? danhSach.map((c) => `${nhan} tại ${tenCung(c)}`).join("; ") : null;
  const donLe = (c: number | null, nhan: string) => (c !== null ? `${nhan} tại ${tenCung(c)}` : null);

  const dong = [
    theoCung(nhomB.nui, "Núi/nhà cao/cây lớn"),
    theoCung(nhomB.nuoc, "Sông hồ/đường lớn/đất trống"),
    donLe(nhomB.cuaChinh, "Cửa chính"),
    donLe(nhomB.bep, "Bếp"),
    donLe(nhomB.giuongNgu, "Giường ngủ chính"),
    donLe(nhomB.banLamViec, "Bàn làm việc"),
    donLe(nhomB.cauThang, "Cầu thang"),
    theoCung(nhomB.wc, "WC"),
    donLe(nhomB.gieng, "Giếng trời"),
  ].filter((x): x is string => x !== null);

  if (dong.length === 0) {
    return "Khách KHÔNG khai loan đầu (Nhóm B để trống) — mọi cung đều 'chưa đủ dữ liệu loan đầu để xét đắc/thất cách'.";
  }
  return dong.map((d) => `- ${d}`).join("\n") + (nhomB.soTang ? `\n- Nhà ${nhomB.soTang} tầng.` : "");
}

/** Gọi AI luận chi tiết. Trả null nếu AI lỗi (bên gọi tự hiển thị thông báo lỗi). */
export async function luanHuyenKhongBangAi(
  kq: KetQuaHuyenKhong,
  nhomB: NhomBLoanDau,
  luuNienData?: { nam: number; thang: number | null; nienTinh: number; nguyetTinh: number | null; canhBao: string[] } | null
): Promise<KetQuaLuanAi | null> {
  const phanLuuNien = luuNienData
    ? [
        "",
        "=== LƯU NIÊN (đã tính sẵn, dùng nguyên vẹn) ===",
        `Năm ${luuNienData.nam}${luuNienData.thang ? ` — tháng ${luuNienData.thang} âm lịch` : ""}: Niên tinh nhập trung ${luuNienData.nienTinh}` +
          (luuNienData.nguyetTinh ? `, Nguyệt tinh nhập trung ${luuNienData.nguyetTinh}` : ""),
        luuNienData.canhBao.length ? luuNienData.canhBao.map((c) => `- ${c}`).join("\n") : "(không có cảnh báo Ngũ Hoàng/Nhị Hắc lưu niên đặc biệt)",
      ].join("\n")
    : "";

  const userMessage = [
    "=== TINH BÀN ===",
    serializeTinhBan(kq),
    "",
    "=== LOAN ĐẦU (Nhóm B, khách tự khai) ===",
    serializeLoanDau(nhomB),
    phanLuuNien,
    "",
    "=== YÊU CẦU ===",
    "Chạy Bước 3-10 của quy trình luận cho tinh bàn trên (Bước 1-2 đã có sẵn ở phần TINH BÀN/CÁCH",
    "CỤC). Luận đủ 8 cung (bỏ Trung Cung riêng nếu Trung Cung không có Sơn/Hướng tinh — vẫn nhắc sơ",
    "qua bộ số tại Trung Cung nếu có ý nghĩa). Dùng dữ liệu CHÍNH THẦN/LINH THẦN/CHIẾU THẦN để điền",
    "trường bo_tri_thuy, đối chiếu với phương đã khai có núi/nước ở Nhóm B. Dùng dữ liệu THU SƠN",
    "XUẤT SÁT khi luận đắc/thất cách ở Bước 7 và khi chọn cung_nen_kich_hoat/cung_can_giu_tinh —",
    "1 cung có sao vượng nhưng loan đầu SAI hướng Thu Sơn Xuất Sát thì KHÔNG coi là đắc cách dù sao",
    "đang vượng. Trả về đúng schema đã khai báo.",
    luuNienData ? "Có yêu cầu xem lưu niên — điền trường luu_nien theo đúng dữ liệu Niên/Nguyệt tinh đã cho." : "Không yêu cầu xem lưu niên — để chuỗi rỗng ở trường luu_nien.",
  ].join("\n");

  const res = await goiAiToolUse({
    tinhNang: "huyen-khong-luan-chi-tiet",
    systemCoDinh: SYSTEM_CO_DINH,
    userMessage,
    toolName: "tra_ve_luan_giai_huyen_khong",
    schema: SCHEMA,
    // Báo cáo dài (8 cung + kết luận + hóa giải) — cần đủ token để JSON không bị cắt giữa chừng
    // (deepseek-chat non-thinking dồn hết token vào output thật). Kèm câu lệnh súc tích ở prompt
    // để output không phình quá, vừa fit token vừa dưới ~100s giới hạn Cloudflare Worker.
    maxTokens: 12000,
    // ⚠️ Model mặc định của DeepSeek trên site (deepseek-v4-flash) là model "thinking": từ chối
    // tool_choice ép buộc + đốt hết token vào reasoning ẩn (>120s, quá giới hạn Cloudflare) → KHÔNG
    // dùng được cho báo cáo có schema lớn này. deepseek-chat (non-thinking) trên cùng endpoint chạy
    // tốt: gọi tool đúng, ~50-70s. Khóa RIÊNG CHO NHÀ CUNG CẤP DeepSeek (không phải toàn bộ) — nếu
    // ép cứng 1 chuỗi không phân biệt, đổi AI_EP_NHA_CUNG_CAP sang Gemini để so sánh sẽ gửi nhầm
    // tên model DeepSeek cho Gemini (lỗi thật đã gặp 30/8/2026: Gemini trả 404 "models/deepseek-chat
    // is not found"). Gemini dùng đúng model của nó qua AI_GEMINI_MODEL, không cần override ở đây.
    modelOverride: { "openai-tuong-thich": "deepseek-chat" },
  });

  if (!res.input) return null;
  const raw = res.input as Record<string, unknown>;

  try {
    return {
      tomTatTrucSonHuong: String(raw.tom_tat_truc_son_huong ?? ""),
      boTriThuy: String(raw.bo_tri_thuy ?? ""),
      tungCung: (raw.tung_cung as Array<Record<string, unknown>>).map((c) => ({
        cung: String(c.cung ?? ""),
        mucCatHung: String(c.muc_cat_hung ?? ""),
        dacThatCach: String(c.dac_that_cach ?? ""),
        luanChiTiet: String(c.luan_chi_tiet ?? ""),
        hoaGiai: String(c.hoa_giai ?? ""),
      })),
      ketLuanTongThe: {
        taiLoc: String((raw.ket_luan_tong_the as Record<string, unknown>)?.tai_loc ?? ""),
        nhanDinh: String((raw.ket_luan_tong_the as Record<string, unknown>)?.nhan_dinh ?? ""),
        sucKhoe: String((raw.ket_luan_tong_the as Record<string, unknown>)?.suc_khoe ?? ""),
        congDanh: String((raw.ket_luan_tong_the as Record<string, unknown>)?.cong_danh ?? ""),
        honNhan: String((raw.ket_luan_tong_the as Record<string, unknown>)?.hon_nhan ?? ""),
      },
      cungNenKichHoat: (raw.cung_nen_kich_hoat as string[]) ?? [],
      cungCanGiuTinh: (raw.cung_can_giu_tinh as string[]) ?? [],
      thuTuUuTien: (raw.thu_tu_uu_tien as string[]) ?? [],
      luuNien: String(raw.luu_nien ?? ""),
      gioiHanLuuY: (raw.gioi_han_luu_y as string[]) ?? [],
    };
  } catch {
    return null;
  }
}
