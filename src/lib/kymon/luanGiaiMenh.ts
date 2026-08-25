// Module Luận Giải Kỳ Môn Mệnh — sinh văn bản đời thường từ lá bàn đã lập (chế độ Mệnh).
// Theo SPEC_luan_giai_menh.md (Công cung cấp, đúc kết từ skill Luận Kỳ Môn NHÁNH PHỤ 2).
// KHÔNG tính lại lá bàn — chỉ tra cứu dữ liệu 9 cung đã có sẵn từ lapLaBan().
// KHÔNG lộ thuật ngữ Kỳ Môn (tên Sao/Môn/Thần/Cung) ra văn bản chính — chỉ hiện trong
// phần "chi tiết kỹ thuật" (client tự quyết định ẩn/hiện, ở đây trả kèm sẵn để tùy dùng).

import type { CungInfo, LapLaBanResult } from "./types";
import menhYNghiaRaw from "./data/km_menh_ynghia.json";
import { traCachCuc } from "./cachCuc";

type MucYNghia = {
  loai?: string;
  nguhanh?: string;
  nghe_nghiep?: string[];
  y_nghia_doi_thuong: string;
  tinh_cach?: string;
};
type MenhYNghia = {
  cuu_tinh: Record<string, MucYNghia>;
  bat_mon: Record<string, MucYNghia>;
  bat_than: Record<string, MucYNghia>;
};
const menhYNghia = menhYNghiaRaw as MenhYNghia;

// ---- Bảng tên đầy đủ (trùng với bảng dùng trong lap-ky-mon.astro — copy riêng vì module này
// chạy độc lập, không phụ thuộc script client-side của trang). ----
const TEN_SAO: Record<string, string> = {
  "T.Bồng": "Thiên Bồng", "T.Nhuế": "Thiên Nhuế", "T.Xung": "Thiên Xung", "T.Phò": "Thiên Phụ",
  "T.Tâm": "Thiên Tâm", "T.Trụ": "Thiên Trụ", "T.Nhậm": "Thiên Nhậm", "T.Anh": "Thiên Anh",
};
const TEN_MON: Record<string, string> = {
  HƯU: "Hưu", TỬ: "Tử", THƯƠNG: "Thương", ĐỖ: "Đỗ", CẢNH: "Cảnh", SINH: "Sinh", KINH: "Kinh", KHAI: "Khai",
};
const TEN_THAN: Record<string, string> = {
  "T.Phù": "Trực Phù", "Đ.Xà": "Đằng Xà", "T.Âm": "Thái Âm", "L.Hợp": "Lục Hợp",
  "B.Hổ": "Bạch Hổ", "H.Vũ": "Huyền Vũ", "C.Địa": "Cửu Địa", "C.Thiên": "Cửu Thiên",
};

// Ngũ hành 9 cung (Lạc Thư) + bảng sinh/khắc — dùng để so cung dụng thần với Mệnh Cung.
const NGU_HANH_CUNG: Record<number, string> = {
  1: "Thủy", 2: "Thổ", 3: "Mộc", 4: "Mộc", 5: "Thổ", 6: "Kim", 7: "Kim", 8: "Thổ", 9: "Hỏa",
};
const SINH_NEXT: Record<string, string> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
const KHAC_NEXT: Record<string, string> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };

// NHẬP MỘ (Kỳ Môn — không phải tứ mộ khố Bát Tự). Nguồn: bảng gốc Công cung cấp, đã dùng ở
// lap-ky-mon.astro. Copy riêng vì module này độc lập với script trang.
const NHAP_MO: Record<string, number> = {
  Giáp: 2, Quý: 2, Ất: 6, Bính: 6, Mậu: 6, Đinh: 8, Kỷ: 8, Canh: 8, Tân: 4, Nhâm: 4,
};

// Bộ phận cơ thể theo cung (SPEC mục 3, phần Bệnh — nguyên từ skill km-menh.md).
const BO_PHAN_THEO_SOCUNG: Record<number, string> = {
  9: "tim, mắt", 2: "bao tử", 4: "hông", 7: "cổ họng, miệng",
  3: "gan, túi mật", 6: "phổi", 1: "thận, bàng quang", 8: "xương, lưng",
};

// ---- Bảng dụng thần 12 lĩnh vực (SPEC mục 2) — key theo mã Môn/Sao THÔ của engine để tra
// trực tiếp trên cungList, không qua bước đổi tên. ----
type LinhVucKey =
  | "tai_bach" | "quan_loc" | "gia_dinh" | "hoc_hanh" | "rui_ro"
  | "dien_trach" | "dia_vi" | "kien_thuc" | "tat_ach" | "suc_khoe";

const DUNG_THAN_LINH_VUC: Record<LinhVucKey, { ten: string; mon?: string; sao?: string }> = {
  tai_bach: { ten: "Tiền bạc", mon: "SINH" },
  quan_loc: { ten: "Công việc, sự nghiệp", mon: "KHAI" },
  gia_dinh: { ten: "Gia đình, người thân", mon: "HƯU" },
  hoc_hanh: { ten: "Học hành", sao: "T.Phò" },
  rui_ro: { ten: "Rủi ro cần đề phòng", mon: "THƯƠNG" },
  dien_trach: { ten: "Nhà cửa, tài sản", mon: "TỬ" },
  dia_vi: { ten: "Danh tiếng, vị thế", mon: "CẢNH" },
  kien_thuc: { ten: "Vốn hiểu biết", mon: "ĐỖ" },
  tat_ach: { ten: "Sức khỏe cần chú ý", sao: "T.Nhuế" },
  suc_khoe: { ten: "Thể trạng", mon: "KINH" },
};
const THU_TU_LINH_VUC: LinhVucKey[] = [
  "tai_bach", "quan_loc", "gia_dinh", "hoc_hanh", "rui_ro",
  "dien_trach", "dia_vi", "kien_thuc", "tat_ach", "suc_khoe",
];

// ---- Bảng dịch sinh khắc/trạng thái → câu (SPEC mục 4). ----
const DICH = {
  menh_khac_dung_than: "kiếm được/có được nhưng khó giữ, hay hao tổn",
  dung_than_sinh_menh: "được nâng đỡ, thuận lợi, dễ tìm được lối ra khi khó khăn",
  menh_sinh_dung_than: "bản thân chủ động vun đắp/cho đi nhiều ở việc này",
  nhap_mo: "đang/sắp trải qua giai đoạn trầm lắng, cần thời gian vượt qua, dễ thấy mất phương hướng",
  khong_vong: "cảm giác mông lung, chưa rõ mục tiêu, cần thời gian định hình",
} as const;

export type TheLinhVuc = {
  key: LinhVucKey | "hon_nhan";
  tieuDe: string;
  noiDung: string;
  /** Ẩn mặc định ở UI — chỉ hiện khi khách bấm "Xem chi tiết kỹ thuật". */
  chiTiet: string;
};

export type KetQuaLuanGiaiMenh = {
  /** Có lập được Mệnh Cung hay không — false nếu lá bàn không có tứ trụ (vd nhập sai). */
  hopLe: boolean;
  moDau: string;
  theLinhVuc: TheLinhVuc[];
};

function capCauDau(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Quan hệ ngũ hành giữa cung A (chủ động) và cung B: "sinh" (A sinh B), "duocSinh" (B sinh A),
 * "khac" (A khắc B), "bịKhac" (B khắc A), hoặc "hoa" (cùng hành/không sinh khắc trực tiếp). */
function quanHeCung(soCungA: number, soCungB: number): "sinh" | "duocSinh" | "khac" | "bịKhac" | "hoa" {
  const a = NGU_HANH_CUNG[soCungA];
  const b = NGU_HANH_CUNG[soCungB];
  if (!a || !b || a === b) return "hoa";
  if (SINH_NEXT[a] === b) return "sinh";
  if (SINH_NEXT[b] === a) return "duocSinh";
  if (KHAC_NEXT[a] === b) return "khac";
  if (KHAC_NEXT[b] === a) return "bịKhac";
  return "hoa";
}

/**
 * Tìm cung mà 1 CAN (bất kỳ trong 10 can) đang "đóng" trên thiên bàn — dùng để định vị Mệnh
 * Cung, Cha/Mẹ/Vợ/Chồng/Con Cái... Xử lý đủ 2 trường hợp đặc biệt khiến can không khớp trực
 * tiếp bất kỳ thienBanCan nào trong cungList (suy trực tiếp từ cơ chế engine, không đoán):
 *  1. Can = Giáp — không bao giờ xuất hiện làm thienBanCan (luôn ẩn dưới Phù Đầu, xem engine.ts
 *     mục X65) → Giáp "mượn" vị trí của chính Phù Đầu.
 *  2. Can = địa bàn can RIÊNG của Trung cung — vì 8 sao "bay" chỉ tới 8 cung ngoài (home của mỗi
 *     sao chỉ trỏ vào 1 trong 8 cung ngoài, không bao giờ trỏ vào cung 5), nên chính can gốc của
 *     Trung cung không bao giờ được chọn làm thienBanCan cho bất kỳ cung nào khác → can đó coi
 *     như "đóng" tại chính Trung cung.
 * 2 nhánh này phủ đủ cả 10 can (9 can qua khớp trực tiếp/nhánh 2, riêng Giáp qua nhánh 1) — luôn
 * tìm được đúng 1 cung, không còn trường hợp "không xác định".
 */
function timCungTheoCan(laBan: LapLaBanResult, can: string): CungInfo | undefined {
  if (can === "Giáp") return laBan.cungList.find((c) => c.thienBanCan === laBan.phuDau);
  const khopTrucTiep = laBan.cungList.find((c) => c.thienBanCan === can);
  if (khopTrucTiep) return khopTrucTiep;
  const trungCung = laBan.cungList.find((c) => c.soCung === 5);
  return trungCung && trungCung.diaBanCan === can ? trungCung : undefined;
}

function timCungTheoDungThan(cungList: CungInfo[], dt: { mon?: string; sao?: string }): CungInfo | undefined {
  if (dt.mon) return cungList.find((c) => c.mon === dt.mon);
  if (dt.sao) return cungList.find((c) => c.saoThienBan === dt.sao);
  return undefined;
}

function ngheNghiepCuaCung(c: CungInfo): string[] {
  const ds: string[] = [];
  const s = menhYNghia.cuu_tinh[TEN_SAO[c.saoThienBan] ?? c.saoThienBan];
  const m = menhYNghia.bat_mon[TEN_MON[c.mon] ?? c.mon];
  const t = menhYNghia.bat_than[TEN_THAN[c.than] ?? c.than];
  if (s?.nghe_nghiep) ds.push(...s.nghe_nghiep);
  if (m?.nghe_nghiep) ds.push(...m.nghe_nghiep);
  if (t?.nghe_nghiep) ds.push(...t.nghe_nghiep);
  return ds.filter((n) => n !== "-");
}

/** M2 — đoạn mở đầu tổng quát: ghép ý nghĩa Sao + Môn + Thần tại Mệnh Cung thành 1 đoạn văn dài
 * đủ ý (tính cách, cách hành xử, quan hệ xung quanh, sở trường/nghề nghiệp gợi ý), không nêu tên
 * kỹ thuật (chỉ dùng y_nghia_doi_thuong/tinh_cach/nghe_nghiep đã viết sẵn bằng lời thường). */
function moDauTongQuat(menhCung: CungInfo): string {
  const s = menhYNghia.cuu_tinh[TEN_SAO[menhCung.saoThienBan] ?? menhCung.saoThienBan];
  const m = menhYNghia.bat_mon[TEN_MON[menhCung.mon] ?? menhCung.mon];
  const t = menhYNghia.bat_than[TEN_THAN[menhCung.than] ?? menhCung.than];
  const cau: string[] = [];
  if (s?.tinh_cach) cau.push(`Nhìn chung, bạn là người ${s.tinh_cach}`);
  if (m?.y_nghia_doi_thuong) cau.push(capCauDau(m.y_nghia_doi_thuong));
  if (t?.y_nghia_doi_thuong) cau.push(capCauDau(t.y_nghia_doi_thuong));
  let doan = cau.length ? cau.join(". ") + "." : "";

  // Sở trường/nghề nghiệp nổi bật — gộp nghề nghiệp từ cả 3 yếu tố, ưu tiên nghề xuất hiện
  // ở nhiều yếu tố nhất (đúng cách làm thủ công đã dùng cho mục Công Việc).
  const nghe = ngheNghiepCuaCung(menhCung);
  if (nghe.length) {
    const dem = new Map<string, number>();
    for (const n of nghe) dem.set(n, (dem.get(n) ?? 0) + 1);
    const goiY = [...dem.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n).slice(0, 4);
    doan += ` Tài năng/sở trường đặc biệt của bạn có thể bộc lộ rõ qua các hướng như: ${goiY.join(", ")}.`;
  }

  // M3 — Can Ngày / Can Giờ (Mộ, Không Vong, hậu vận).
  const canNgayMo = NHAP_MO[menhCung.thienBanCan] === menhCung.soCung;
  if (menhCung.KV) {
    doan += ` Về nền tảng bản thân ở thời điểm hiện tại: ${DICH.khong_vong}. Đây là giai đoạn nên dành thời gian nhìn lại bản thân, xác định rõ mục tiêu trước khi hành động lớn.`;
  } else if (canNgayMo) {
    doan += ` Về nền tảng bản thân ở thời điểm hiện tại: ${DICH.nhap_mo}. Không nên nóng vội, nên tích lũy dần và chờ thời điểm thuận lợi hơn để bứt phá.`;
  } else {
    doan += " Nhìn chung nền tảng bản thân ở giai đoạn hiện tại khá vững, có thể chủ động theo đuổi những mục tiêu đã đặt ra.";
  }
  return doan;
}

function auHauVan(cungGio: CungInfo | undefined): string | null {
  if (!cungGio) return null;
  const saoXau = menhYNghia.cuu_tinh[TEN_SAO[cungGio.saoThienBan] ?? cungGio.saoThienBan]?.loai === "Đại hung";
  const thanXau = (menhYNghia.bat_than[TEN_THAN[cungGio.than] ?? cungGio.than]?.loai ?? "").includes("Hung");
  const mo = NHAP_MO[cungGio.thienBanCan] === cungGio.soCung;
  const xau = saoXau || thanXau || mo || cungGio.KV;
  return xau
    ? "Về hậu vận (giai đoạn lớn tuổi): cần đề phòng trở ngại, dễ gặp thử thách hoặc cảm giác cô độc nếu không chuẩn bị tốt từ sớm."
    : "Về hậu vận (giai đoạn lớn tuổi): nhìn chung ổn định, có nền tảng để an hưởng khi về già.";
}

/** M4a — Tiền Tài (luật riêng, SPEC mục 3). */
function luanTienTai(cungSinhMon: CungInfo, menhCung: CungInfo): string {
  const qh = quanHeCung(menhCung.soCung, cungSinhMon.soCung); // Mệnh Cung là chủ động
  const cau: string[] = [];
  if (qh === "khac") cau.push(DICH.menh_khac_dung_than);
  else if (qh === "duocSinh") cau.push(DICH.dung_than_sinh_menh);
  else if (qh === "sinh" && cungSinhMon.thienBanCan === "Canh") cau.push("có thể lập nghiệp/kiếm tiền tốt ở xa quê");
  else if (qh === "sinh") cau.push(DICH.menh_sinh_dung_than);
  else cau.push("tài vận ở mức bình thường, không có biến động lớn");

  if (cungSinhMon.than === "H.Vũ" || cungSinhMon.than === "T.Âm" || cungSinhMon.thienBanCan === "Canh") {
    cau.push("cẩn trọng tiền bạc không rõ ràng, dễ mất qua giao dịch/cho vay");
  }
  if (cungSinhMon.KV) cau.push("tài chính không ổn định, đầu tư khó hiệu quả");
  let doan = capCauDau(cau.join("; ")) + ".";

  // Bổ sung ý nghĩa Sao/Thần tại cung Sinh Môn (như cách M4e làm cho các mục khác) để đoạn văn
  // đủ chiều sâu, không chỉ có phần sinh-khắc.
  const s = menhYNghia.cuu_tinh[TEN_SAO[cungSinhMon.saoThienBan] ?? cungSinhMon.saoThienBan];
  const t = menhYNghia.bat_than[TEN_THAN[cungSinhMon.than] ?? cungSinhMon.than];
  const boSung = [s?.y_nghia_doi_thuong, t?.y_nghia_doi_thuong].filter(Boolean);
  if (boSung.length) doan += ` ${capCauDau(boSung.join("; "))}.`;

  const nghe = ngheNghiepCuaCung(cungSinhMon).slice(0, 3);
  if (nghe.length) doan += ` Hướng kiếm tiền dễ thuận lợi hơn nếu liên quan tới: ${nghe.join(", ")}.`;
  return doan;
}

/** M4b — Công Việc (luật riêng, SPEC mục 3). */
function luanCongViec(menhCung: CungInfo, cungTaiBach: CungInfo | undefined): string {
  const nghe = ngheNghiepCuaCung(menhCung);
  const dem = new Map<string, number>();
  for (const n of nghe) dem.set(n, (dem.get(n) ?? 0) + 1);
  const goiY = [...dem.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n).slice(0, 4);

  const cau: string[] = [];
  if (goiY.length) cau.push(`Có thể hợp với các hướng như ${goiY.join(", ")}`);
  if (["KHAI", "HƯU", "CẢNH", "ĐỖ"].includes(menhCung.mon)) {
    cau.push("thiên hướng làm việc trong tổ chức, có vị trí ổn định hơn là tự thân lập nghiệp");
  }
  if (cungTaiBach && !cungTaiBach.KV && NHAP_MO[cungTaiBach.thienBanCan] !== cungTaiBach.soCung) {
    cau.push("có tiềm năng tự kinh doanh nếu muốn thử sức");
  }
  let doan = cau.length ? capCauDau(cau.join("; ")) + "." : "Chưa thấy thiên hướng nghề nghiệp rõ rệt qua lá bàn này.";

  // Phong cách làm việc — dựa tính cách của yếu tố tại Mệnh Cung, giúp đoạn văn đủ ý hơn thay vì
  // chỉ liệt kê nghề.
  const s = menhYNghia.cuu_tinh[TEN_SAO[menhCung.saoThienBan] ?? menhCung.saoThienBan];
  if (s?.tinh_cach) doan += ` Phong cách làm việc thường thể hiện rõ nét ${s.tinh_cach} — nên phát huy đúng thế mạnh này thay vì gò ép bản thân theo khuôn mẫu người khác.`;
  return doan;
}

/** M4d — Bệnh: vị trí sao dụng thần Tật Ách → bộ phận cơ thể cần lưu ý. */
function luanBenh(cungTatAch: CungInfo): string {
  const boPhan = BO_PHAN_THEO_SOCUNG[cungTatAch.soCung];
  if (!boPhan) return "Chưa xác định được vùng cơ thể cụ thể cần lưu ý từ lá bàn này.";
  let doan = `Vùng cơ thể nên chú ý chăm sóc: ${boPhan}.`;
  if (cungTatAch.KV) doan += ` Ngoài ra: ${DICH.khong_vong} — nên khám sức khỏe định kỳ để nắm rõ tình trạng bản thân thay vì để tình cờ phát hiện.`;
  else if (NHAP_MO[cungTatAch.thienBanCan] === cungTatAch.soCung) doan += ` Ngoài ra: ${DICH.nhap_mo} — nên chú ý nghỉ ngơi, tránh làm việc quá sức trong giai đoạn này.`;
  return doan;
}

/** Hôn Nhân — mục bổ sung (không nằm trong 10 lĩnh vực chính, dùng chung cung Hưu Môn với
 * "Gia đình"). LƯU Ý: chưa xét được nhánh "Ất/Canh tùy nam/nữ" vì form hiện chưa thu thập giới
 * tính khách hàng — bỏ qua nhánh đó, không đoán, chỉ luận phần không phụ thuộc giới tính. */
function luanHonNhan(cungHuuMon: CungInfo, menhCung: CungInfo, cungList: CungInfo[]): string {
  const cungLucHop = cungList.find((c) => c.than === "L.Hợp");
  const qhHuu = quanHeCung(menhCung.soCung, cungHuuMon.soCung);
  const qhLucHop = cungLucHop ? quanHeCung(menhCung.soCung, cungLucHop.soCung) : "hoa";
  const tot = qhHuu === "duocSinh" || qhLucHop === "duocSinh";
  const xau = cungHuuMon.KV || (cungLucHop?.KV ?? false);

  let doan: string;
  if (xau) {
    doan = "Đường tình duyên/hôn nhân có giai đoạn mông lung, dễ trục trặc — cần kiên nhẫn và thẳng thắn trao đổi với đối phương, tránh để hiểu lầm tích tụ lâu ngày.";
  } else if (tot) {
    doan = "Đường tình duyên/hôn nhân khá thuận lợi, dễ tìm được sự hòa hợp và hỗ trợ từ người bạn đời, đôi bên dễ bổ trợ cho nhau trong cuộc sống.";
  } else {
    doan = "Đường tình duyên/hôn nhân ở mức bình thường, không có dấu hiệu đặc biệt tốt hay xấu qua lá bàn này — mức độ hạnh phúc phụ thuộc nhiều vào sự vun đắp của cả hai phía.";
  }

  const lucHopYNghia = cungLucHop ? menhYNghia.bat_than[TEN_THAN[cungLucHop.than] ?? cungLucHop.than] : undefined;
  if (lucHopYNghia?.y_nghia_doi_thuong) {
    doan += ` Về khía cạnh hòa hợp/gắn kết nói chung: ${lucHopYNghia.y_nghia_doi_thuong}.`;
  }
  return doan;
}

/** M4e — lĩnh vực không có luật riêng: ghép ý nghĩa Sao+Môn+Thần tại cung dụng thần + 1 câu
 * sinh khắc so với Mệnh Cung, diễn đạt mức tin cậy thấp hơn ("có xu hướng", "có thể"). */
function luanTongQuatLinhVuc(ten: string, cung: CungInfo, menhCung: CungInfo): string {
  const s = menhYNghia.cuu_tinh[TEN_SAO[cung.saoThienBan] ?? cung.saoThienBan];
  const m = menhYNghia.bat_mon[TEN_MON[cung.mon] ?? cung.mon];
  const t = menhYNghia.bat_than[TEN_THAN[cung.than] ?? cung.than];
  const cau: string[] = [];
  if (m?.y_nghia_doi_thuong) cau.push(m.y_nghia_doi_thuong);
  if (s?.y_nghia_doi_thuong) cau.push(s.y_nghia_doi_thuong);
  if (t?.y_nghia_doi_thuong) cau.push(t.y_nghia_doi_thuong);
  const doanChinh = cau.length ? capCauDau(cau.join("; ")) + "." : "Chưa có nhiều dữ liệu nổi bật cho mục này.";

  const qh = quanHeCung(menhCung.soCung, cung.soCung);
  let cauSinhKhac = "";
  if (qh === "sinh") cauSinhKhac = ` So với bản thân, mặt này có xu hướng ${DICH.menh_sinh_dung_than} — nghĩa là bạn thường phải chủ động vun đắp mới có kết quả, ít khi tự đến.`;
  else if (qh === "duocSinh") cauSinhKhac = ` So với bản thân, mặt này có xu hướng ${DICH.dung_than_sinh_menh} — thuận theo tự nhiên hơn, ít phải gồng mình.`;
  else if (qh === "khac") cauSinhKhac = ` So với bản thân, mặt này có xu hướng ${DICH.menh_khac_dung_than} — cần kiên trì và có kế hoạch rõ ràng mới giữ được thành quả.`;

  // Thêm gợi ý nghề/việc phù hợp và cảnh báo Mộ/Không Vong nếu có (dùng chung DICH đã có sẵn ở
  // mục 4, tăng chiều sâu thay vì chỉ 1-2 câu ngắn).
  const nghe = ngheNghiepCuaCung(cung).slice(0, 3);
  const cauNghe = nghe.length ? ` Việc/hướng dễ liên quan tới mặt này: ${nghe.join(", ")}.` : "";
  let cauCanhBao = "";
  if (cung.KV) cauCanhBao = ` Lưu ý: ${DICH.khong_vong}.`;
  else if (NHAP_MO[cung.thienBanCan] === cung.soCung) cauCanhBao = ` Lưu ý: ${DICH.nhap_mo}.`;

  return `Có xu hướng: ${doanChinh}${cauSinhKhac}${cauNghe}${cauCanhBao}`;
}

function chiTietKyThuat(cung: CungInfo): string {
  return `${cung.huong} — Sao ${TEN_SAO[cung.saoThienBan] ?? cung.saoThienBan}, ${TEN_MON[cung.mon] ?? cung.mon} Môn, Thần ${TEN_THAN[cung.than] ?? cung.than} (thiên bàn ${cung.thienBanCan}, địa bàn ${cung.diaBanCan}${cung.KV ? ", Không Vong" : ""}${NHAP_MO[cung.thienBanCan] === cung.soCung ? ", Nhập Mộ" : ""}).`;
}

/**
 * Sinh đoạn luận giải Kỳ Môn Mệnh bằng ngôn ngữ đời thường từ 1 lá bàn đã lập (chế độ "menh").
 * KHÔNG tính lại lá bàn — chỉ đọc dữ liệu 9 cung có sẵn trong `laBan`.
 */
export function luanGiaiMenh(laBan: LapLaBanResult): KetQuaLuanGiaiMenh {
  const canNgay = laBan.tuTru.ngay?.can;
  const menhCung = canNgay ? timCungTheoCan(laBan, canNgay) : undefined;
  if (!menhCung) {
    return { hopLe: false, moDau: "", theLinhVuc: [] };
  }

  const cungGio = laBan.tuTru.gio?.can ? timCungTheoCan(laBan, laBan.tuTru.gio.can) : undefined;

  const cauHauVan = auHauVan(cungGio);
  const moDau = moDauTongQuat(menhCung) + (cauHauVan ? ` ${cauHauVan}` : "");

  const theLinhVuc: TheLinhVuc[] = [];
  const cungTaiBach = timCungTheoDungThan(laBan.cungList, DUNG_THAN_LINH_VUC.tai_bach);

  for (const key of THU_TU_LINH_VUC) {
    const dt = DUNG_THAN_LINH_VUC[key];
    const cung = timCungTheoDungThan(laBan.cungList, dt);
    if (!cung) continue;

    let noiDung: string;
    if (key === "tai_bach") noiDung = luanTienTai(cung, menhCung);
    else if (key === "quan_loc") noiDung = luanCongViec(menhCung, cungTaiBach);
    else if (key === "tat_ach") noiDung = `${luanTongQuatLinhVuc(dt.ten, cung, menhCung)} ${luanBenh(cung)}`;
    else noiDung = luanTongQuatLinhVuc(dt.ten, cung, menhCung);

    theLinhVuc.push({ key, tieuDe: dt.ten, noiDung, chiTiet: chiTietKyThuat(cung) });
  }

  // Hôn Nhân — mục bổ sung, dùng chung cung Hưu Môn với "Gia đình" (xem ghi chú luanHonNhan).
  const cungHuuMon = timCungTheoDungThan(laBan.cungList, DUNG_THAN_LINH_VUC.gia_dinh);
  if (cungHuuMon) {
    theLinhVuc.push({
      key: "hon_nhan",
      tieuDe: "Tình duyên, hôn nhân",
      noiDung: luanHonNhan(cungHuuMon, menhCung, laBan.cungList),
      chiTiet: chiTietKyThuat(cungHuuMon),
    });
  }

  return { hopLe: true, moDau, theLinhVuc };
}

// =====================================================================================
// BẢN CHI TIẾT (trả phí) — sâu hơn bản miễn phí ở trên: thêm Người Thân xung quanh, 4 Giai
// Đoạn Cuộc Đời (theo Can Năm/Tháng/Ngày/Giờ) và Cách Cục nổi bật tại các vị trí quan trọng.
// Nguồn: bảng "người thân theo vị trí trên bàn" trong km-menh.md (skill Luận Kỳ Môn, nhánh phụ
// 2) + bảng 81 Cách Cục (a2-cau-truc-tran-ky-mon.md, qua module cachCuc.ts). Phần Cách Cục được
// PHÉP nêu tên kỹ thuật (khác bản miễn phí) vì đây là nội dung "chuyên sâu" trả phí, đúng tinh
// thần SPEC mục 5 ("Xem chi tiết kỹ thuật" — ở bản trả phí thì hiện thẳng, không cần ẩn).
//
// LƯU Ý PHẠM VI: bảng gốc còn 2 vị trí "Cha" và "Mẹ" với công thức có 2 phương án ("Thiên Can
// Năm Địa Bàn, HOẶC Cung Càn" / "Cung hợp với Can Năm Địa Bàn, HOẶC Cung Khôn") — không rõ ưu
// tiên phương án nào. Đã CHỌN nhánh dùng Thiên Can Năm Địa Bàn cho "Cha" (nhất quán với cách làm
// Vợ/Chồng/Con Cái/Anh Chị Em — đều tra theo can, không phải cung cố định). "Mẹ" cần công thức
// "hợp can" chưa xác nhận rõ ràng — TẠM BỎ QUA, không đoán.
// =====================================================================================

export type MucNguoiThan = { vaiTro: string; noiDung: string };
export type MucGiaiDoan = { giaiDoan: string; noiDung: string };
export type MucCachCuc = { viTri: string; ten: string; yNghia: string };

export type KetQuaLuanGiaiChiTiet = {
  hopLe: boolean;
  nguoiThan: MucNguoiThan[];
  giaiDoanCuocDoi: MucGiaiDoan[];
  cachCucNoiBat: MucCachCuc[];
};

/** Tìm cung mà 1 can đang "đóng" trên ĐỊA BÀN (không phải thiên bàn — dùng riêng cho vị trí
 * "Cha" theo bảng gốc). Địa bàn can là 1 phép gán cố định, đủ cả 9 cung không thiếu như thiên
 * bàn — chỉ cần xử lý riêng trường hợp Giáp (luôn ẩn dưới Phù Đầu, xem engine.ts). */
function timCungTheoCanDiaBan(laBan: LapLaBanResult, can: string): CungInfo | undefined {
  const target = can === "Giáp" ? laBan.phuDau : can;
  return laBan.cungList.find((c) => c.diaBanCan === target);
}

function moTaNgan(cung: CungInfo): string {
  const s = menhYNghia.cuu_tinh[TEN_SAO[cung.saoThienBan] ?? cung.saoThienBan];
  const t = menhYNghia.bat_than[TEN_THAN[cung.than] ?? cung.than];
  const cau = [s?.y_nghia_doi_thuong, t?.y_nghia_doi_thuong].filter(Boolean);
  return cau.length ? capCauDau(cau.join("; ")) + "." : "Chưa có nhiều dữ liệu nổi bật cho vị trí này.";
}

function luanNguoiThan(laBan: LapLaBanResult): MucNguoiThan[] {
  const ds: MucNguoiThan[] = [];
  const push = (vaiTro: string, cung: CungInfo | undefined) => {
    if (cung) ds.push({ vaiTro, noiDung: moTaNgan(cung) });
  };
  if (laBan.tuTru.nam?.can) push("Cha", timCungTheoCanDiaBan(laBan, laBan.tuTru.nam.can));
  if (laBan.tuTru.thang?.can) push("Anh chị em", timCungTheoCan(laBan, laBan.tuTru.thang.can));
  if (laBan.tuTru.gio?.can) push("Con cái", timCungTheoCan(laBan, laBan.tuTru.gio.can));
  push("Vợ", timCungTheoCan(laBan, "Ất"));
  push("Chồng", timCungTheoCan(laBan, "Canh"));
  push("Bạn gái/người yêu (nữ)", timCungTheoCan(laBan, "Đinh"));
  push("Bạn trai/người yêu (nam)", timCungTheoCan(laBan, "Bính"));
  return ds;
}

function luanGiaiDoanCuocDoi(laBan: LapLaBanResult, menhCung: CungInfo): MucGiaiDoan[] {
  const ds: MucGiaiDoan[] = [];
  const cungNam = laBan.tuTru.nam?.can ? timCungTheoCan(laBan, laBan.tuTru.nam.can) : undefined;
  const cungThang = laBan.tuTru.thang?.can ? timCungTheoCan(laBan, laBan.tuTru.thang.can) : undefined;
  const cungGio = laBan.tuTru.gio?.can ? timCungTheoCan(laBan, laBan.tuTru.gio.can) : undefined;

  if (cungNam) ds.push({ giaiDoan: "Thời thơ ấu, nền tảng gia đình gốc", noiDung: moTaNgan(cungNam) });
  if (cungThang) ds.push({ giaiDoan: "Giai đoạn trưởng thành, sự nghiệp/bạn bè đầu đời", noiDung: moTaNgan(cungThang) });
  ds.push({ giaiDoan: "Giai đoạn hiện tại (bản thân)", noiDung: moTaNgan(menhCung) });
  if (cungGio) {
    const hauVan = auHauVan(cungGio);
    ds.push({ giaiDoan: "Hậu vận (giai đoạn lớn tuổi)", noiDung: `${moTaNgan(cungGio)}${hauVan ? ` ${hauVan}` : ""}` });
  }
  return ds;
}

function luanCachCucNoiBat(laBan: LapLaBanResult, menhCung: CungInfo): MucCachCuc[] {
  const ds: MucCachCuc[] = [];
  const themNeuCo = (viTri: string, cung: CungInfo | undefined) => {
    if (!cung) return;
    const cc = traCachCuc(cung.thienBanCan, cung.diaBanCan);
    if (cc) ds.push({ viTri, ten: cc.ten, yNghia: cc.yNghia });
  };
  themNeuCo("Mệnh Cung (bản thân)", menhCung);
  const cungTrucPhu = laBan.cungList.find((c) => c.soCung === laBan.trucPhuCung);
  const cungTrucSu = laBan.cungList.find((c) => c.soCung === laBan.trucSuCung);
  if (cungTrucPhu && cungTrucPhu.soCung !== menhCung.soCung) themNeuCo("Cung Trực Phù (quý nhân/vận may tổng thể)", cungTrucPhu);
  if (cungTrucSu && cungTrucSu.soCung !== menhCung.soCung && cungTrucSu.soCung !== cungTrucPhu?.soCung) {
    themNeuCo("Cung Trực Sử (cách hành động/ứng xử)", cungTrucSu);
  }
  return ds;
}

/**
 * Sinh nội dung LUẬN GIẢI CHI TIẾT (trả phí) — bổ sung cho `luanGiaiMenh()` ở trên, không thay
 * thế. Gọi cùng lúc với bản miễn phí trên cùng 1 `laBan` đã lập.
 */
export function luanGiaiMenhChiTiet(laBan: LapLaBanResult): KetQuaLuanGiaiChiTiet {
  const canNgay = laBan.tuTru.ngay?.can;
  const menhCung = canNgay ? timCungTheoCan(laBan, canNgay) : undefined;
  if (!menhCung) {
    return { hopLe: false, nguoiThan: [], giaiDoanCuocDoi: [], cachCucNoiBat: [] };
  }
  return {
    hopLe: true,
    nguoiThan: luanNguoiThan(laBan),
    giaiDoanCuocDoi: luanGiaiDoanCuocDoi(laBan, menhCung),
    cachCucNoiBat: luanCachCucNoiBat(laBan, menhCung),
  };
}
