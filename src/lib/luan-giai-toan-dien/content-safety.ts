// Đọc + tiện ích cho content/bat-tu/data/content-safety-full.json — cấu hình an toàn nội dung dùng
// CHUNG cho Tầng 2 (ghép vào system prompt) và Tầng 3 (hậu kiểm quét từ khóa cấm).
//
// Nguyên tắc trên hết (nguyên văn _meta.nguyen_tac_tren_het): NỘI DUNG/KẾT LUẬN luôn nói thẳng theo
// đúng findings — chỉ CÁCH DÙNG TỪ mới cần nhẹ nhàng. Không dùng file này để cắt giảm/làm mờ kết luận.
import { docData } from "./content-loader";

export interface ContentSafetyFull {
  _meta: { purpose: string; nguyen_tac_tren_het: string };
  tu_khoa_cam_tuyet_doi: { _note: string; list: string[] };
  tu_dien_thay_the_ngon_tu: Record<string, unknown>;
  cach_dung_tu_dien: string[];
  quy_tac_theo_giai_doan: {
    _note: string;
    giai_doan_D_than_sat: string;
    giai_doan_E_mo_kho: string;
    giai_doan_F_luc_than: { cha_me: string; anh_chi_em: string; vo_chong: string; con_cai: string };
  };
  quy_tac_dien_dat_chung: string[];
  hau_kiem_bat_buoc: { _note: string; buoc_1: string; buoc_2: string; buoc_3: string };
  disclaimer_bat_buoc: string;
  disclaimer_vi_tri: string;
}

let cache: ContentSafetyFull | null = null;
export function layContentSafety(): ContentSafetyFull {
  if (!cache) cache = docData<ContentSafetyFull>("content-safety-full.json");
  return cache;
}

/** Chuỗi từ điển thay thế ngôn từ, định dạng sẵn để dán vào prompt (SPEC yêu cầu đưa NGUYÊN VĂN). */
export function tuDienThayTheDangText(): string {
  return JSON.stringify(layContentSafety().tu_dien_thay_the_ngon_tu, null, 2);
}

export function quyTacDienDatChungDangText(): string {
  return layContentSafety().quy_tac_dien_dat_chung.map((q, i) => `${i + 1}. ${q}`).join("\n");
}

export function tuKhoaCamTuyetDoiDangText(): string {
  return layContentSafety().tu_khoa_cam_tuyet_doi.list.join(", ");
}

/** quyTacRiengGiaiDoan cho từng giai đoạn — chỉ D/E/F có, còn lại trả rỗng (theo khung-chung.md). */
export function quyTacRiengGiaiDoan(ma: "D" | "E" | "F"): string {
  const q = layContentSafety().quy_tac_theo_giai_doan;
  if (ma === "D") return q.giai_doan_D_than_sat;
  if (ma === "E") return q.giai_doan_E_mo_kho;
  const f = q.giai_doan_F_luc_than;
  return [
    `Cha mẹ: ${f.cha_me}`,
    `Anh chị em: ${f.anh_chi_em}`,
    `Vợ chồng: ${f.vo_chong}`,
    `Con cái: ${f.con_cai}`,
  ].join("\n");
}

/** Tầng 3, Bước 1 (bắt buộc, code): quét toàn văn tìm từ khóa cấm tuyệt đối. */
export function timTuKhoaCam(vanBan: string): string[] {
  const list = layContentSafety().tu_khoa_cam_tuyet_doi.list;
  const found: string[] = [];
  for (const tu of list) if (vanBan.includes(tu)) found.push(tu);
  return found;
}

// Tầng 3, Bước 2 (code): mẫu ngôn ngữ "khẳng định tuyệt đối" không phù hợp mức độ xác suất của
// phương pháp mệnh lý — quét bằng regex, không dùng AI (Tầng 3 là code theo đúng kiến trúc 3 tầng).
// Danh sách này KHÔNG nằm trong content-safety-full.json (file đó chỉ có từ khóa cấm tuyệt đối) —
// đây là lớp bổ sung riêng của Tầng 3, dựa trên nguyên tắc buoc_2 (không khẳng định tuyệt đối 1 sự
// kiện chắc chắn xảy ra). Thà quét rộng một chút (false positive hiếm khi sai) còn hơn bỏ sót.
const MAU_KHANG_DINH_TUYET_DOI = [
  /chắc chắn (sẽ|là|có)/gi,
  /nhất định (sẽ|là|có)/gi,
  /100%/g,
  /tuyệt đối (sẽ|là)/g,
  /không thể tránh khỏi/g,
  /bắt buộc phải (xảy ra|gặp)/g,
];

export interface CanhBaoHauKiem {
  loai: "tu_khoa_cam" | "khang_dinh_tuyet_doi";
  tuKhoaOrMau: string;
  viTri: number;
}

// Model đôi khi lẫn cú pháp giống thẻ function-calling (vd "</noi_dung>", "</invoke>") vào NỘI DUNG
// văn xuôi/tóm tắt — phát hiện thật trên production (Công báo cáo 26/8/2026). Dọn sạch bằng regex
// trước khi hiển thị, phòng khi lỡ lọt qua dù đã ép tool_choice + schema.
const RE_THE_LA = /<\/?[a-zA-Z_][\w-]*(?:\s+[^<>]*)?\/?>/g;

/** Xoá thẻ kiểu XML/HTML còn sót lại trong văn bản AI viết (an toàn hiển thị, không phải kiểm duyệt nội dung). */
export function xoaTheLaConSot(vanBan: string): string {
  return vanBan.replace(RE_THE_LA, "").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** Quét đầy đủ Bước 1 + Bước 2 của Tầng 3. Trả về danh sách cảnh báo (rỗng = qua được). */
export function quetHauKiem(vanBan: string): CanhBaoHauKiem[] {
  const canhBao: CanhBaoHauKiem[] = [];
  for (const tu of timTuKhoaCam(vanBan)) {
    canhBao.push({ loai: "tu_khoa_cam", tuKhoaOrMau: tu, viTri: vanBan.indexOf(tu) });
  }
  for (const mau of MAU_KHANG_DINH_TUYET_DOI) {
    mau.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = mau.exec(vanBan)) !== null) {
      canhBao.push({ loai: "khang_dinh_tuyet_doi", tuKhoaOrMau: m[0], viTri: m.index });
    }
  }
  return canhBao;
}
