// LỤC HÀO — ỨNG KỲ (mốc thời gian ứng nghiệm).
//
// Trả lời câu hỏi khách hỏi nhiều nhất: "KHI NÀO?". Cài đặt đúng 8 quy luật trong
// `docs/quan-su-thien-anh/LUAN_QUE_LUC_HAO_SPEC.md` §6 (LỚP 6) + 4 ghi chú bổ sung ở cuối mục đó.
//
// ⚠️ NGUYÊN TẮC GIỐNG CẢ DỰ ÁN: file này THUẦN TÍNH TOÁN, KHÔNG gọi LLM, KHÔNG tự luận văn vẻ.
// Nó chỉ trả về DANH SÁCH CHI ỨNG KỲ + lý do deterministic; việc diễn thành lời là của lớp LLM.
// Mọi dữ liệu đầu vào (vượng suy, Tuần Không, Nguyệt Phá, Trường Sinh, Phục Thần) đều ĐỌC LẠI từ
// engine `luc-hao.ts` — không tự tính lại, không chép lại bảng.
//
// KHÁC BIỆT CÓ CHỦ Ý so với phần "cát hung": ứng kỳ chỉ cần biết "chi nào kích hoạt", nhẹ hơn hẳn
// việc phán tốt/xấu. Vì vậy chỗ nào engine còn nợ audit (Nhập Mộ — xem TODO ở luc-hao.ts) thì ở đây
// vẫn suy ra được mốc xung mộ, nhưng ĐƯỢC ĐÁNH DẤU `canAudit: true` để lớp trên biết mà thận trọng.

import {
  chiHopVoi,
  chiTaiGiaiDoanTruongSinh,
  chiXungVoi,
  type FullCastResult,
  type HaoInfo,
  type LucThan,
  type VuongSuy,
} from "./luc-hao";
import { CHI, type NguHanh } from "./menh-nap-am";
import { CHI_NGU_HANH } from "./bat-tu";
import { tienThoaiCuaHao } from "./luc-hao-tien-thoai-than";

// ---------------------------------------------------------------------------------------------

/** Cách 1 chi "kích hoạt" ứng kỳ. */
export type LoaiKichHoat =
  | "Trị" // trùng đúng chi Dụng Thần (值)
  | "Xung" // xung chi Dụng Thần (沖)
  | "Hợp" // hợp chi Dụng Thần (合)
  | "Điền Thực" // lấp đầy chỗ trống (Tuần Không / Nguyệt Phá) — trùng chi
  | "Xung Mộ" // xung mở kho Mộ đang nhốt Dụng Thần
  | "Xung Hợp" // xung cái đang hợp giữ chân Dụng Thần
  | "Trường Sinh" // tới cung Trường Sinh của Dụng Thần
  | "Sinh" // ngũ hành sinh Dụng Thần
  | "Khắc" // ngũ hành khắc Dụng Thần (dùng cho đại tượng hung)
  | "Xung Phi Thần" // đánh bật Phi Thần để Phục Thần lộ ra
  | "Qua Tháng"; // đơn giản là sang tháng kế, hết Nguyệt Phá

/** Trạng thái Dụng Thần lúc lập quẻ — quyết định áp quy luật nào. */
export type TrangThaiDungThan =
  | "dong"
  | "tinh"
  | "tuan-khong"
  | "nguyet-pha"
  | "nhap-mo"
  | "bi-hop"
  | "phuc-tang"
  | "qua-vuong"
  | "huu-tu-gap-truong-sinh"
  | "tien-than"
  | "thoai-than";

export const NHAN_TRANG_THAI: Record<TrangThaiDungThan, string> = {
  dong: "Phát động",
  tinh: "An tĩnh",
  "tuan-khong": "Tuần Không",
  "nguyet-pha": "Nguyệt Phá",
  "nhap-mo": "Nhập Mộ",
  "bi-hop": "Bị hợp giữ chân",
  "phuc-tang": "Phục tàng dưới Phi Thần",
  "qua-vuong": "Quá vượng",
  "huu-tu-gap-truong-sinh": "Hưu tù gặp Trường Sinh",
  "tien-than": "Tiến Thần",
  "thoai-than": "Thoái Thần",
};

export interface UngVienUngKy {
  chi: string;
  chiIndex: number;
  loai: LoaiKichHoat;
  /** Trạng thái Dụng Thần sinh ra ứng viên này (truy vết ngược về spec §6). */
  tuTrangThai: TrangThaiDungThan;
  lyDo: string;
  /** 1 = ưu tiên cao nhất. Trở ngại nặng xét trước (spec §6: Nguyệt Phá nặng hơn Tuần Không). */
  uuTien: number;
  /** true = dựa trên phần engine còn nợ audit (Nhập Mộ) — lớp trên nên nói giọng dè dặt hơn. */
  canAudit?: boolean;
}

export interface KetQuaUngKy {
  hopLe: boolean;
  loi?: string;
  dungThan: {
    viTriHao: number;
    laPhucThan: boolean;
    chi: string;
    nguHanh: NguHanh;
    lucThan: LucThan;
    vuongSuy: VuongSuy;
  };
  trangThai: TrangThaiDungThan[];
  /** Đã sắp xếp: ưu tiên tăng dần (1 trước), cùng ưu tiên thì giữ thứ tự phát sinh. */
  ungVien: UngVienUngKy[];
  /** Đơn vị thời gian gợi ý (spec §6 ghi chú bổ sung: việc lớn/xa → tháng/năm; nhỏ/gấp → ngày/giờ). */
  donViGoiY: "giờ" | "ngày" | "tháng" | "năm";
  /** Cảnh báo/điều kiện kèm theo — lớp trên PHẢI hiển thị, không được lược bỏ. */
  ghiChu: string[];
}

export interface UngKyInput {
  cast: FullCastResult;
  /** Vị trí hào Dụng Thần (1-6, từ dưới lên). */
  viTriHao: number;
  /** true = Dụng Thần là PHỤC THẦN nấp dưới hào đó, không phải hào đang hiện. */
  laPhucThan?: boolean;
  /** Việc gần (ứng ngày/giờ) hay việc lớn/xa (ứng tháng/năm). Mặc định "gan". */
  phamVi?: "gan" | "xa";
  /** Tính chất việc hỏi — bắt buộc để xử lý đúng nhánh "quá vượng" (cát và hung NGƯỢC chiều nhau). */
  tinhChatViec?: "cat" | "hung";
}

// ---------------------------------------------------------------------------------------------

const SINH: Record<NguHanh, NguHanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
const KHAC: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };

/** Các chi mang ngũ hành SINH cho hành cho trước (vd Mộc ← Thủy → trả Hợi, Tý). */
function chiSinhCho(hanh: NguHanh): number[] {
  const hanhSinh = (Object.keys(SINH) as NguHanh[]).find((h) => SINH[h] === hanh);
  return hanhSinh ? CHI_NGU_HANH.map((h, i) => (h === hanhSinh ? i : -1)).filter((i) => i >= 0) : [];
}

/** Các chi mang ngũ hành KHẮC hành cho trước. */
function chiKhacCho(hanh: NguHanh): number[] {
  const hanhKhac = (Object.keys(KHAC) as NguHanh[]).find((h) => KHAC[h] === hanh);
  return hanhKhac ? CHI_NGU_HANH.map((h, i) => (h === hanhKhac ? i : -1)).filter((i) => i >= 0) : [];
}

const laVuongTuong = (v: VuongSuy) => v === "Vượng" || v === "Tướng";
const laHuuTu = (v: VuongSuy) => v === "Hưu" || v === "Tù" || v === "Tử";

// ---------------------------------------------------------------------------------------------

/**
 * Tính Ứng Kỳ cho 1 Dụng Thần đã xác định. Thuần deterministic.
 *
 * Thứ tự áp quy luật theo spec §6 ghi chú bổ sung: "Khi Dụng thần rơi vào NHIỀU trạng thái cùng lúc
 * → xét thứ tự trở ngại lớn trước" (Nguyệt Phá cản cả tháng > Tuần Không cản 10 ngày).
 */
export function tinhUngKy(input: UngKyInput): KetQuaUngKy {
  const { cast, viTriHao, laPhucThan = false, phamVi = "gan", tinhChatViec } = input;

  if (!Number.isInteger(viTriHao) || viTriHao < 1 || viTriHao > 6) {
    return rong(`Vị trí hào Dụng Thần phải là số nguyên 1-6 (nhận được: ${viTriHao}).`);
  }
  const haoHien: HaoInfo | undefined = cast.chinh.hao[viTriHao - 1];
  if (!haoHien) return rong(`Không đọc được hào ${viTriHao} từ quẻ.`);

  if (laPhucThan && !haoHien.phucThan) {
    return rong(`Hào ${viTriHao} không có Phục Thần — không thể lấy Phục Thần làm Dụng Thần.`);
  }

  // Dụng Thần có thể là hào đang hiện, hoặc Phục Thần nấp dưới nó.
  const chiIndex = laPhucThan ? haoHien.phucThan!.chiIndex : haoHien.chiIndex;
  const nguHanh: NguHanh = laPhucThan ? CHI_NGU_HANH[chiIndex] : haoHien.nguHanh;
  const lucThan: LucThan = laPhucThan ? haoHien.phucThan!.lucThan : haoHien.lucThan;
  // Phục Thần không được engine chấm vượng suy riêng — mượn vượng suy của hào hiện làm xấp xỉ và
  // ghi chú rõ, KHÔNG im lặng coi như của chính nó.
  const vuongSuy = haoHien.vuongSuy;

  const ghiChu: string[] = [];
  if (laPhucThan) {
    ghiChu.push("Dụng Thần là Phục Thần — vượng suy đang mượn tạm của hào hiện phía trên, chỉ mang tính tham khảo.");
  }

  // --- Nhận diện trạng thái (đọc lại từ engine, không tự tính) ---
  const trangThai: TrangThaiDungThan[] = [];
  const rel = haoHien.relations;
  const coNguyetPha = rel.some((r) => r.type === "Nguyệt Phá");
  const coTuanKhong = laPhucThan ? false : haoHien.xunKong;
  const coBiHop = rel.some((r) => r.type === "Hợp");
  const dangDong = haoHien.isDong;
  // Nhập Mộ: engine CỐ Ý chưa surface thành relation (còn nợ audit 4 dạng nhập mộ — luc-hao.ts).
  // Ứng kỳ chỉ cần "mộ ở chi nào để xung", nhẹ hơn việc phán cát hung, nên vẫn suy ra nhưng gắn cờ.
  const nhapMoNgay = haoHien.growthDay === "Mộ";
  const nhapMoThang = haoHien.growthMonth === "Mộ";
  const coNhapMo = nhapMoNgay || nhapMoThang;
  const coPhucTang = laPhucThan;
  // "Quá vượng": vượng + còn được Nhật/Nguyệt tiếp sức. Ngưỡng MINH BẠCH để Thầy hiệu chỉnh.
  const duocTiepSuc = rel.some((r) => r.type === "Lâm Nhật" || r.type === "Lâm Nguyệt" || r.type === "Sinh");
  const coQuaVuong = vuongSuy === "Vượng" && duocTiepSuc;
  const coHuuTuGapTS = laHuuTu(vuongSuy) && (haoHien.growthDay === "Trường Sinh" || haoHien.growthMonth === "Trường Sinh");

  if (coNguyetPha) trangThai.push("nguyet-pha");
  if (coTuanKhong) trangThai.push("tuan-khong");
  if (coNhapMo) trangThai.push("nhap-mo");
  if (coBiHop) trangThai.push("bi-hop");
  if (coPhucTang) trangThai.push("phuc-tang");
  if (coQuaVuong) trangThai.push("qua-vuong");
  if (coHuuTuGapTS) trangThai.push("huu-tu-gap-truong-sinh");
  trangThai.push(dangDong ? "dong" : "tinh");

  const ungVien: UngVienUngKy[] = [];
  const them = (
    chiIdx: number,
    loai: LoaiKichHoat,
    tuTrangThai: TrangThaiDungThan,
    lyDo: string,
    uuTien: number,
    canAudit?: boolean,
  ) => {
    ungVien.push({ chi: CHI[chiIdx], chiIndex: chiIdx, loai, tuTrangThai, lyDo, uuTien, ...(canAudit ? { canAudit } : {}) });
  };

  const chiDT = CHI[chiIndex];
  const chiXung = chiXungVoi(chiIndex);
  const chiHop = chiHopVoi(chiIndex);

  // --- QUY LUẬT 7: Nguyệt Phá (trở ngại nặng nhất — cản cả tháng) ---
  if (coNguyetPha) {
    them(chiIndex, "Điền Thực", "nguyet-pha", `${chiDT} bị Nguyệt Phá — ứng khi Điền Thực (gặp lại đúng chi ${chiDT}).`, 1);
    if (chiHop !== null) {
      them(chiHop, "Hợp", "nguyet-pha", `Hoặc khi gặp ${CHI[chiHop]} hợp lại chỗ phá.`, 1);
    }
    them(chiIndex, "Qua Tháng", "nguyet-pha", `Hoặc đơn giản là sang tháng kế — qua tháng ${cast.monthChi} thì hết phá.`, 2);
    ghiChu.push("Nguyệt Phá cản suốt tháng — nặng hơn Tuần Không, phải qua được mốc này việc mới chuyển.");
  }

  // --- QUY LUẬT 8: Tuần Không ---
  if (coTuanKhong) {
    them(chiXung, "Xung", "tuan-khong", `${chiDT} rơi Tuần Không (${cast.tuanKhong}) — ứng khi ${CHI[chiXung]} xung không.`, coNguyetPha ? 2 : 1);
    them(chiIndex, "Điền Thực", "tuan-khong", `Hoặc khi Điền Thực — gặp đúng chi ${chiDT}, hết Không Vong.`, coNguyetPha ? 2 : 1);
    ghiChu.push(
      laVuongTuong(vuongSuy)
        ? "Tuần Không nhưng Dụng Thần vượng tướng — là 'vượng không', ra khỏi tuần là dùng được."
        : "Tuần Không mà Dụng Thần hưu tù — coi chừng 'chân không', ra khỏi tuần vẫn khó thành.",
    );
  }

  // --- QUY LUẬT 6a: Nhập Mộ ---
  if (coNhapMo) {
    const moChi = chiTaiGiaiDoanTruongSinh(nguHanh, "Mộ");
    const xungMo = chiXungVoi(moChi);
    const nguon = nhapMoNgay && nhapMoThang ? "Nhật lẫn Nguyệt" : nhapMoNgay ? "Nhật" : "Nguyệt";
    them(xungMo, "Xung Mộ", "nhap-mo", `${chiDT} nhập Mộ tại ${CHI[moChi]} (theo ${nguon}) — ứng khi ${CHI[xungMo]} xung mở kho mộ.`, 2, true);
    ghiChu.push("Phần Nhập Mộ dựa trên vòng Trường Sinh; engine chưa audit đủ 4 dạng nhập mộ — nên nói dè dặt.");
  }

  // --- QUY LUẬT 6b: Bị Hợp giữ chân ---
  if (coBiHop) {
    for (const r of rel.filter((x) => x.type === "Hợp")) {
      const nguonChi = r.source === "DAY" ? cast.dayChi : cast.monthChi;
      const nguonIdx = CHI.indexOf(nguonChi);
      if (nguonIdx < 0) continue;
      const xungKhai = chiXungVoi(nguonIdx);
      them(
        xungKhai,
        "Xung Hợp",
        "bi-hop",
        `${chiDT} bị ${nguonChi} (${r.source === "DAY" ? "Nhật Thần" : "Nguyệt Kiến"}) hợp giữ — ứng khi ${CHI[xungKhai]} xung khai chỗ hợp đó.`,
        2,
      );
    }
    ghiChu.push("Đang bị hợp giữ chân — việc dùng dằng chưa dứt, phải có cái xung mở ra mới chuyển động.");
  }

  // --- QUY LUẬT 9 (spec liệt kê cuối bảng): Phục Tàng ---
  if (coPhucTang) {
    const phiThanChi = haoHien.chiIndex;
    them(chiIndex, "Trị", "phuc-tang", `Phục Thần ${chiDT} — ứng vào ngày/tháng Trị (gặp đúng ${chiDT}).`, 2);
    them(chiXung, "Xung", "phuc-tang", `Hoặc khi ${CHI[chiXung]} xung Phục Thần khiến nó bật lên.`, 2);
    them(
      chiXungVoi(phiThanChi),
      "Xung Phi Thần",
      "phuc-tang",
      `Hoặc khi ${CHI[chiXungVoi(phiThanChi)]} xung Phi Thần ${CHI[phiThanChi]}, đánh bật lớp che để Phục Thần lộ ra.`,
      2,
    );
  }

  // --- QUY LUẬT 3 & 4: Quá vượng (cát và hung NGƯỢC chiều nhau) ---
  if (coQuaVuong) {
    if (tinhChatViec === "hung") {
      for (const c of chiSinhCho(nguHanh)) {
        them(c, "Sinh", "qua-vuong", `Việc hung mà Dụng Thần đã quá vượng — ứng vào lúc ${CHI[c]} sinh thêm (vượng cực sinh họa).`, 2);
      }
    } else if (tinhChatViec === "cat") {
      const moChi = chiTaiGiaiDoanTruongSinh(nguHanh, "Mộ");
      them(moChi, "Xung Mộ", "qua-vuong", `Việc cát mà Dụng Thần quá vượng — cần "hãm" mới ứng: gặp Mộ tại ${CHI[moChi]}.`, 2, true);
      them(chiXung, "Xung", "qua-vuong", `Hoặc gặp ${CHI[chiXung]} xung — như lúa chín phải gặt mới thành.`, 2);
    } else {
      ghiChu.push(
        "Dụng Thần quá vượng nhưng chưa biết việc hỏi là cát hay hung — hai hướng ứng kỳ NGƯỢC nhau (cát thì chờ Mộ/Xung, hung thì chờ được Sinh). Cần xác định tính chất việc trước khi chốt mốc.",
      );
    }
  }

  // --- QUY LUẬT 5: Hưu tù gặp Trường Sinh ---
  if (coHuuTuGapTS) {
    const tsChi = chiTaiGiaiDoanTruongSinh(nguHanh, "Trường Sinh");
    them(tsChi, "Trường Sinh", "huu-tu-gap-truong-sinh", `Dụng Thần hưu tù nhưng gặp Trường Sinh — ứng vào ${CHI[tsChi]}, lúc khí bắt đầu sinh lại.`, 2);
    ghiChu.push(
      "CẢNH BÁO (spec §6): nếu Dụng Thần suy kiệt cùng cực (vd hỏi bệnh nguy), 'gặp sinh' lại là điềm XẤU chứ không phải hồi phục — phải xét mức suy trước khi kết luận.",
    );
  }

  // --- QUY LUẬT 1 & 2: nền tảng động/tĩnh (luôn có, ưu tiên thấp nhất nếu đã có trở ngại) ---
  const uuTienNen = trangThai.length > 1 ? 3 : 1;
  if (dangDong) {
    them(chiIndex, "Trị", "dong", `Dụng Thần phát động — ứng vào ngày/tháng Trị của chính hào động (${chiDT}).`, uuTienNen);
    if (chiHop !== null) {
      them(chiHop, "Hợp", "dong", `Hoặc khi gặp ${CHI[chiHop]} hợp lại ("động thì chờ hợp").`, uuTienNen);
    }
  } else {
    them(chiIndex, "Trị", "tinh", `Dụng Thần an tĩnh — ứng vào ngày/tháng Trị (gặp đúng ${chiDT}).`, uuTienNen);
    them(chiXung, "Xung", "tinh", `Hoặc khi ${CHI[chiXung]} xung tới ("tĩnh thì chờ xung").`, uuTienNen);
  }

  // --- Tiến/Thoái Thần: án lệ trong kho kiến thức (kien-thuc/an-le/chunk-04.md, ca "Bệnh viện chữa
  // thành câm") nêu rõ "THOÁI THẦN LẤY HÀO BIẾN LÀM ỨNG KỲ" — Mão mộc hóa Dần mộc, ứng đúng tháng
  // Dần. Suy đối xứng cho Tiến Thần: hào biến cũng là mốc việc thành hình.
  if (!laPhucThan) {
    const tt = tienThoaiCuaHao(cast, viTriHao);
    if (tt) {
      const tThai: TrangThaiDungThan = tt.loai === "tien-than" ? "tien-than" : "thoai-than";
      if (!trangThai.includes(tThai)) trangThai.push(tThai);
      const chiBienIdx = CHI.indexOf(tt.chiBien);
      if (chiBienIdx >= 0) {
        them(
          chiBienIdx,
          "Trị",
          tThai,
          `${tt.nhan} (${tt.chiGoc} → ${tt.chiBien}) — lấy chính HÀO BIẾN ${tt.chiBien} làm mốc ứng kỳ.`,
          2,
        );
      }
      ghiChu.push(tt.moTa);
      if (tt.bienTuanKhong || tt.bienNguyetPha) {
        ghiChu.push(`Hào biến đang bị cản — mốc ${tt.chiBien} chỉ ứng sau khi thoát Tuần Không/Nguyệt Phá.`);
      }
    }
  }

  // --- Ghi chú bổ sung spec §6: đại tượng hung bị khắc ---
  if (tinhChatViec === "hung") {
    const dsKhac = chiKhacCho(nguHanh);
    if (dsKhac.length) {
      ghiChu.push(
        `Việc hung: nếu Dụng Thần đang bị khắc mà không ai cứu, họa thường đến đúng lúc Kỵ Thần vượng nhất — tức các mốc ${dsKhac.map((c) => CHI[c]).join(", ")}.`,
      );
    }
  }

  // Độc Phát / Độc Tĩnh — spec §6 nói hào lẻ loi quyết định tốc độ ứng nghiệm, ưu tiên xét trước.
  const soDong = cast.dongPositions.length;
  if (soDong === 1) {
    ghiChu.push(`Quẻ Độc Phát (chỉ hào ${cast.dongPositions[0]} động) — hào lẻ loi này thường quyết định tốc độ ứng nghiệm, xét trước tiên.`);
  } else if (soDong === 5) {
    const tinhDuyNhat = [1, 2, 3, 4, 5, 6].find((v) => !cast.dongPositions.includes(v));
    ghiChu.push(`Quẻ Độc Tĩnh (chỉ hào ${tinhDuyNhat} tĩnh) — hào tĩnh lẻ loi này là chìa khóa tốc độ ứng nghiệm.`);
  }

  // Gộp mốc trùng: cùng CHI + cùng CÁCH KÍCH HOẠT thì chỉ giữ 1 (vd Phục Thần và nền "an tĩnh" đều
  // sinh ra mốc "Trị Ngọ"). Giữ bản ưu tiên cao nhất, gộp lý do để không mất thông tin nguồn gốc.
  const gop = new Map<string, UngVienUngKy>();
  for (const u of ungVien) {
    const khoa = `${u.chiIndex}|${u.loai}`;
    const da = gop.get(khoa);
    if (!da) {
      gop.set(khoa, { ...u });
      continue;
    }
    if (u.uuTien < da.uuTien) {
      gop.set(khoa, { ...u, lyDo: `${u.lyDo} (cũng ứng với: ${NHAN_TRANG_THAI[da.tuTrangThai]})`, canAudit: da.canAudit || u.canAudit });
    } else {
      da.lyDo = `${da.lyDo} (cũng ứng với: ${NHAN_TRANG_THAI[u.tuTrangThai]})`;
      da.canAudit = da.canAudit || u.canAudit;
    }
  }
  const ungVienGop = [...gop.values()].sort((a, b) => a.uuTien - b.uuTien);

  // Đơn vị thời gian — spec §6: việc lớn/xa → tháng/năm; việc nhỏ/gấp → ngày/giờ.
  const donViGoiY: KetQuaUngKy["donViGoiY"] = phamVi === "xa" ? (laVuongTuong(vuongSuy) ? "tháng" : "năm") : laVuongTuong(vuongSuy) ? "ngày" : "tháng";
  ghiChu.push(
    phamVi === "xa"
      ? "Việc lớn/xa — đọc các mốc trên theo THÁNG hoặc NĂM, không phải ngày."
      : "Việc gần/gấp — đọc các mốc trên theo NGÀY (hoặc GIỜ nếu rất gấp).",
  );

  return {
    hopLe: true,
    dungThan: { viTriHao, laPhucThan, chi: chiDT, nguHanh, lucThan, vuongSuy },
    trangThai,
    ungVien: ungVienGop,
    donViGoiY,
    ghiChu,
  };
}

function rong(loi: string): KetQuaUngKy {
  return {
    hopLe: false,
    loi,
    dungThan: { viTriHao: 0, laPhucThan: false, chi: "", nguHanh: "Mộc", lucThan: "Huynh Đệ", vuongSuy: "Hưu" },
    trangThai: [],
    ungVien: [],
    donViGoiY: "ngày",
    ghiChu: [],
  };
}

/**
 * Tìm hào mang Lục Thân cho trước để làm Dụng Thần. Trả về danh sách vị trí (1-6) — CÓ THỂ NHIỀU
 * (trường hợp "lưỡng hiện"), lúc đó lớp trên phải chọn, engine không tự quyết.
 * Nếu quẻ không có Lục Thân đó thì trả về hào có PHỤC THẦN mang Lục Thân đó (kèm cờ laPhucThan).
 */
export function timHaoDungThan(cast: FullCastResult, lucThan: LucThan): { viTriHao: number; laPhucThan: boolean }[] {
  const hien = cast.chinh.hao.filter((h) => h.lucThan === lucThan).map((h) => ({ viTriHao: h.hao, laPhucThan: false }));
  if (hien.length > 0) return hien;
  return cast.chinh.hao
    .filter((h) => h.phucThan?.lucThan === lucThan)
    .map((h) => ({ viTriHao: h.hao, laPhucThan: true }));
}
