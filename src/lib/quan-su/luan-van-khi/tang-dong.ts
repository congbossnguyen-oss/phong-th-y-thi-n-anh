// TẦNG ĐỘNG — SPEC.md §2: ghép Can-Chi của Đại Vận/Lưu Niên vào nguyên cục "như trụ thứ 5/6 tạm
// thời", áp Tầng Thứ (Lưu Niên > Đại Vận > Mệnh cục), tính lại vượng suy + Dụng/Hỷ/Kỵ Thần TẠI mốc.
//
// ⚠️ VÌ SAO FILE NÀY TỒN TẠI (không gọi thẳng bat-tu-engine): `tinhVuongSuy`/`chonDungThan` trong
// bat-tu-engine/engine.ts chỉ nhận ĐÚNG 4 trụ cố định (TuTruInput.nam/thang/ngay/gio) — không có chỗ
// nhét thêm trụ Đại Vận/Lưu Niên. README bàn giao module này đã lường trước, cho phép "Design your
// own logic ... reuse the exported helpers rather than re-deriving tables" — nghĩa là: KHÔNG chép lại
// TAM_HOP/TAM_HOI/HOP_HOA/TANG (dùng thẳng từ engine.ts), nhưng cách "cộng lực" cho tuế vận thì tự
// viết, vì engine gốc không có API cho việc đó.
//
// ĐƠN GIẢN HÓA CÓ CHỦ ĐÍCH: engine.ts dùng 2 sơ đồ đếm lực khác nhau nội bộ — (a) SO LỰC có trọng số
// nguyệt lệnh ×4 để ra `capDo` (tinhVuongSuy §2.3), và (b) đếm phẳng thấu=2/tàng=1 (`demPhe`, không
// export) để so sánh phe trong chonDungThan. Tầng động ở đây dùng LẠI đúng 1 sơ đồ ĐẾM PHẲNG (thấu=2,
// tàng=1, không nhân nguyệt lệnh) cho CẢ HAI việc — vừa suy capDo tại thời điểm, vừa chọn dụng thần
// tại thời điểm. Lý do: (1) tránh nhân đôi 2 công thức riêng biệt càng dễ lệch nhau khi 1 bên sửa mà
// quên bên kia; (2) tầng động chỉ cần đúng CHIỀU biến thiên qua các mốc (vượng lên/suy xuống), không
// cần khớp tuyệt đối con số `capDo` gốc của tinhVuongSuy — điều đó đã có vsGoc rồi. Nếu sau này cần
// độ chính xác cao hơn, đây là chỗ để nâng cấp (thêm trọng số nguyệt lệnh), không phải viết lại từ đầu.
import {
  chiChuan, coLucXung, hanhCan, hanhChi, hanhKhacX, hanhSinhCho, pheCua,
  TAM_HOI, TAM_HOP, TANG, HOP_HOA, MO_KHO, SINH_MAP, KHAC_MAP, thangVuongChoHanh,
  type CapDo, type DungThanResult, type Hanh, type Phe, type TuTruInput, type VuongSuyResult,
} from "../../bat-tu-engine/engine";
import { CAN, CHI } from "../../menh-nap-am";
import { thapThanOf } from "../../bat-tu";
import type { TrangThaiThoiDiem } from "./types";

// ---------------------------------------------------------------------------------------------
// Bảng CHUẨN không tranh cãi mà base-data.json (bat-tu-engine) chưa có: âm dương Thiên Can (đã có
// trong base-data.json qua nguHanh_thienCan.amDuong, nhưng engine.ts không export ra ngoài) và Lục
// Hợp Địa Chi (dùng để xét "hợp vào cung Phu/Thê" — hon-nhan.md, config-linh-vuc.json tinh_duyen).
// Đây LÀ bảng cố định giống hệt mọi trường phái Tử Bình (khác vượng-suy/dụng-thần vốn là lựa chọn
// phương pháp), nên thêm ở đây không phải "bịa quy tắc ngoài nguồn" — chỉ là dữ liệu nền chưa export.
const CAN_AM_DUONG: Record<string, "Dương" | "Âm"> = {
  Giáp: "Dương", Ất: "Âm", Bính: "Dương", Đinh: "Âm", Mậu: "Dương",
  Kỷ: "Âm", Canh: "Dương", Tân: "Âm", Nhâm: "Dương", Quý: "Âm",
};
/** Lục Hợp Địa Chi. Ngọ-Mùi truyền thống không thống nhất hóa ra hành gì nên để `null` — module này
 *  chỉ cần biết "có hợp" (cung Phu/Thê được hợp tới) chứ không cần hóa hành cho quan hệ này. */
const LUC_HOP: { cap: [string, string]; hoaHanh: Hanh | null }[] = [
  { cap: ["Tý", "Sửu"], hoaHanh: "Thổ" },
  { cap: ["Dần", "Hợi"], hoaHanh: "Mộc" },
  { cap: ["Mão", "Tuất"], hoaHanh: "Hỏa" },
  { cap: ["Thìn", "Dậu"], hoaHanh: "Kim" },
  { cap: ["Tị", "Thân"], hoaHanh: "Thủy" },
  { cap: ["Ngọ", "Mùi"], hoaHanh: null },
];
function chiLucHop(a: string, b: string): { hop: boolean; hoaHanh: Hanh | null } {
  const ca = chiChuan(a), cb = chiChuan(b);
  const found = LUC_HOP.find(({ cap }) => (cap[0] === ca && cap[1] === cb) || (cap[1] === ca && cap[0] === cb));
  return found ? { hop: true, hoaHanh: found.hoaHanh } : { hop: false, hoaHanh: null };
}

/** Thập Thần của 1 Can bất kỳ so Nhật Chủ — tái dùng đúng `thapThanOf` của module lập lá số
 *  (bat-tu.ts), không tự viết lại bảng "cùng hành cùng âm dương → Tỷ Kiên..." lần thứ 3 trong repo. */
function thapThanCuaCan(can: string, nhatChuCan: string): string {
  const idx = CAN.indexOf(can);
  const idxNC = CAN.indexOf(nhatChuCan);
  if (idx < 0 || idxNC < 0) return "?";
  return thapThanOf(idx, idxNC);
}

// ---------------------------------------------------------------------------------------------
// ĐẾM LỰC PHẲNG (thấu can = 2, tàng can = 1) — xem giải thích "ĐƠN GIẢN HÓA CÓ CHỦ ĐÍCH" ở đầu file.
type PheCount = Record<Phe, number>;
const PHE_RONG = (): PheCount => ({ ty_kiep: 0, an: 0, thuc_thuong: 0, tai: 0, quan_sat: 0 });

function pheNguyenCuc(tt: TuTruInput): PheCount {
  const hanhNC = hanhCan(tt.ngay.can);
  const d = PHE_RONG();
  for (const c of [tt.nam.can, tt.thang.can, tt.gio.can]) d[pheCua(hanhCan(c), hanhNC)] += 2;
  for (const chi of [tt.nam.chi, tt.thang.chi, tt.ngay.chi, tt.gio.chi]) {
    for (const c of TANG[chiChuan(chi)] ?? []) d[pheCua(hanhCan(c), hanhNC)] += 1;
  }
  return d;
}

/** Cộng thêm lực của 1 trụ tuế vận (Can thấu + Chi tàng) vào PheCount có sẵn, theo trọng số `w`
 *  (Lưu Niên nặng hơn Đại Vận một chút theo đúng thứ tự Tầng Thứ — SPEC §2 bước 2: "Lưu Niên > Đại
 *  Vận > Mệnh cục"; hệ số 1.2 là lựa chọn thiết kế của module này khi nguồn không cho số cụ thể). */
function themLucTueVan(d: PheCount, canChi: { can: string; chi: string }, hanhNC: Hanh, w: number): void {
  d[pheCua(hanhCan(canChi.can), hanhNC)] += 2 * w;
  for (const c of TANG[chiChuan(canChi.chi)] ?? []) d[pheCua(hanhCan(c), hanhNC)] += 1 * w;
}

function capDoTuPhe(d: PheCount): CapDo {
  const lucDong = d.ty_kiep + d.an;
  const lucDi = d.thuc_thuong + d.tai + d.quan_sat;
  const tyLe = lucDong / (lucDong + lucDi || 1);
  // Ngưỡng PHẢI giữ giống hệt bat-tu-engine/engine.ts `tinhVuongSuy()` (dòng ~328-330) — đổi 1 bên
  // nhớ đổi bên kia, nếu không "tại thời điểm" và "nguyên cục" sẽ lệch thang đo.
  return tyLe >= 0.72 ? "Cực cường" : tyLe >= 0.60 ? "Cường vượng" : tyLe >= 0.52 ? "Vượng"
    : tyLe >= 0.45 ? "Trung hòa" : tyLe >= 0.35 ? "Suy" : tyLe >= 0.22 ? "Nhược" : "Cực nhược";
}
function nhomTuCapDo(capDo: CapDo): 1 | 2 | 3 {
  return capDo === "Cực cường" || capDo === "Cực nhược" ? 3
    : capDo === "Cường vượng" || capDo === "Nhược" ? 2 : 1;
}
const THU_TU_CAP_DO: CapDo[] = ["Cực nhược", "Nhược", "Suy", "Trung hòa", "Vượng", "Cường vượng", "Cực cường"];

function hanhCuaPhe(phe: Phe, nhatChu: Hanh): Hanh {
  switch (phe) {
    case "ty_kiep": return nhatChu;
    case "an": return hanhSinhCho(nhatChu);
    case "thuc_thuong": return SINH_MAP[nhatChu];
    case "tai": return KHAC_MAP[nhatChu];
    case "quan_sat": return hanhKhacX(nhatChu);
  }
}
function suyHyKyCuu(dung: Hanh): { hyThan: Hanh; kyThan: Hanh; cuuThan: Hanh } {
  const hyThan = hanhSinhCho(dung);
  const kyThan = hanhKhacX(dung);
  const cuuThan = hanhSinhCho(kyThan);
  return { hyThan, kyThan, cuuThan };
}

/** Bản rút gọn của `chonDungThan()` (engine.ts) — cùng NHÁNH quyết định (Tòng cách cực đoan → Thông
 *  Quan → Phù Ức), chỉ khác input là PheCount đã tính sẵn thay vì tự đếm từ TuTruInput 4 trụ, vì tầng
 *  động cần đếm thêm phần đóng góp của tuế vận (xem `themLucTueVan` ở trên). */
function chonDungThanDonGian(capDo: CapDo, phe: PheCount, nhatChu: Hanh): { dungThan: Hanh; hyThan: Hanh; kyThan: Hanh } {
  const dongDang = phe.ty_kiep + phe.an;
  const vuong = ["Vượng", "Cường vượng", "Cực cường"].includes(capDo);
  const nhuoc = ["Nhược", "Suy", "Cực nhược"].includes(capDo);

  if (capDo === "Cực nhược" && dongDang <= 1) {
    const manhNhat = (["quan_sat", "tai", "thuc_thuong"] as Phe[]).sort((a, b) => phe[b] - phe[a])[0];
    const dung = hanhCuaPhe(manhNhat, nhatChu);
    return { dungThan: dung, hyThan: hanhSinhCho(dung), kyThan: nhatChu };
  }
  const diDang = phe.thuc_thuong + phe.tai + phe.quan_sat;
  if (capDo === "Cực cường" && diDang <= 1) {
    return { dungThan: SINH_MAP[nhatChu], hyThan: nhatChu, kyThan: hanhKhacX(nhatChu) };
  }
  if (!vuong && !nhuoc && Math.abs(phe.quan_sat - phe.an) <= 1 && phe.quan_sat >= 3 && phe.an >= 3) {
    const dung = hanhSinhCho(nhatChu);
    return { dungThan: dung, ...suyHyKyCuu(dung) };
  }
  if (nhuoc) {
    const chonAn = phe.quan_sat >= phe.tai;
    const dung = chonAn ? hanhSinhCho(nhatChu) : nhatChu;
    return { dungThan: dung, ...suyHyKyCuu(dung) };
  }
  if (vuong) {
    const quanSatVuong = phe.quan_sat >= 4;
    const chon: Phe = quanSatVuong ? "thuc_thuong" : (["thuc_thuong", "quan_sat", "tai"] as Phe[]).sort((a, b) => phe[a] - phe[b])[0]!;
    const dung = hanhCuaPhe(chon, nhatChu);
    const hkc = suyHyKyCuu(dung);
    return { dungThan: dung, hyThan: hkc.hyThan, kyThan: hanhSinhCho(nhatChu) }; // thân vượng → Ấn là Kỵ
  }
  const dung = SINH_MAP[nhatChu];
  return { dungThan: dung, ...suyHyKyCuu(dung) };
}

// ---------------------------------------------------------------------------------------------
export interface ThamSoTangDong {
  tt: TuTruInput;
  vsGoc: VuongSuyResult;
  dtGoc: DungThanResult;
  loai: "DaiVan" | "LuuNien";
  canChi: { can: string; chi: string };
  namBatDau?: number;
  nam?: number;
  /** Chỉ truyền khi loai === "LuuNien" — Can Chi Đại Vận đang chứa Lưu Niên này, để xét "tuế vận
   *  cùng gặp" + xung/hợp giữa Lưu Niên và Đại Vận (Tầng Thứ). */
  canChiDaiVanChua?: { can: string; chi: string };
}

/**
 * Tính TrangThaiThoiDiem tại 1 mốc Đại Vận hoặc Lưu Niên — SPEC.md §2.
 */
export function tinhTrangThaiThoiDiem(p: ThamSoTangDong): TrangThaiThoiDiem {
  const dg: string[] = [];
  const quanHeKichHoat: string[] = [];
  const nhatChu = hanhCan(p.tt.ngay.can);
  const nhatChuCan = p.tt.ngay.can;

  // --- Bước 1+2: xét xung/hợp/hội của tuế vận với nguyên cục (đã qua Tầng Thứ đơn giản: chỉ cộng
  // dồn quan hệ có hiệu lực, không có cơ chế "giải xung" phức tạp vì nguồn (quan-he-can-chi.md mục 4)
  // không cho công thức định lượng — SPEC nguyên tắc 4: thiếu căn cứ thì không bịa thêm cơ chế). ---
  const chiGoc: Record<string, string> = { "Năm": p.tt.nam.chi, "Tháng": p.tt.thang.chi, "Ngày": p.tt.ngay.chi, "Giờ": p.tt.gio.chi };
  for (const [ten, chi] of Object.entries(chiGoc)) {
    if (coLucXung(p.canChi.chi, [chi])) {
      const tag = ten === "Tháng" ? "xung_nguyet_chi" : ten === "Ngày" ? "xung_nhat_chi" : ten === "Năm" ? "xung_nam_chi" : "xung_gio_chi";
      quanHeKichHoat.push(tag);
      dg.push(`Chi tuế vận ${p.canChi.chi} XUNG Chi ${ten} ${chi}.`);
    }
  }
  // Hợp cung Phu/Thê (Chi Ngày) — Lục Hợp.
  const hopNhatChi = chiLucHop(p.canChi.chi, p.tt.ngay.chi);
  if (hopNhatChi.hop) {
    quanHeKichHoat.push("hop_nhat_chi");
    dg.push(`Chi tuế vận ${p.canChi.chi} HỢP cung Phu/Thê (Chi Ngày ${p.tt.ngay.chi})${hopNhatChi.hoaHanh ? ` → hóa khí ${hopNhatChi.hoaHanh}` : ""}.`);
  }
  // Ngũ hợp Thiên Can — tuế vận Can hợp với 1 Can gốc (kể cả Nhật Can).
  for (const [capKey, hoaHanhRaw] of Object.entries(HOP_HOA)) {
    const [a, b] = capKey.split("-");
    const canGocKhop = [p.tt.nam.can, p.tt.thang.can, p.tt.ngay.can, p.tt.gio.can].find(
      (c) => (c === a && p.canChi.can === b) || (c === b && p.canChi.can === a),
    );
    if (!canGocKhop) continue;
    const hoaHanh = hoaHanhRaw as Hanh;
    if (canGocKhop === p.tt.ngay.can) {
      quanHeKichHoat.push("hop_can_voi_nhat_chu");
      dg.push(`Can tuế vận ${p.canChi.can} hợp Nhật Can ${p.tt.ngay.can} → chỉ luận hợp (Nhật Chủ tham gia hợp thì không tự hóa).`);
    } else {
      const vuongThang = thangVuongChoHanh(p.tt.thang.chi, hoaHanh);
      const pheHoa = pheCua(hoaHanh, nhatChu);
      quanHeKichHoat.push("hop_can_voi_goc");
      dg.push(`Can tuế vận ${p.canChi.can} hợp ${canGocKhop} → khả năng hóa ${hoaHanh}${vuongThang ? " (tháng vượng cho hóa thần)" : ""}.`);
      if (vuongThang) {
        // Tag mang theo hành hóa ra (thay vì chỉ đồng/dị đảng) để tầng chấm điểm tự so với
        // Dụng/Hỷ/Kỵ hoặc Tài/Quan Sát theo giới tính — tránh phải thêm tag riêng cho từng lĩnh vực.
        quanHeKichHoat.push(`hoa_can:${hoaHanh}`);
        dg.push(`→ ${pheHoa === "quan_sat" || pheHoa === "thuc_thuong" || pheHoa === "tai" ? "dị đảng (khắc/tiết/hao Nhật Chủ)" : "đồng đảng"}.`);
      }
    }
  }
  // Tam hợp / Tam hội — tuế vận chi hoàn thiện cục cùng ≥2 chi gốc (đã có sẵn trong nguyên cục).
  for (const [bo, hoaHanhRaw] of [...Object.entries(TAM_HOP), ...Object.entries(TAM_HOI)]) {
    const chisBo = bo.split("-").map(chiChuan);
    if (!chisBo.includes(chiChuan(p.canChi.chi))) continue;
    const coMatGoc = chisBo.filter((c) => Object.values(chiGoc).map(chiChuan).includes(c)).length;
    if (coMatGoc >= 2) {
      const loaiCuc = TAM_HOP[bo] !== undefined ? "tam_hop_du_cuc" : "tam_hoi_du_cuc";
      quanHeKichHoat.push(`${loaiCuc}:${hoaHanhRaw}`);
      dg.push(`Tuế vận ${p.canChi.chi} hoàn thiện cục ${bo} (${hoaHanhRaw}) cùng ${coMatGoc} chi gốc.`);
    }
  }
  // Thiên Khắc Địa Xung với Nhật Can/Chi.
  const canKhacNhat = KHAC_MAP[hanhCan(p.canChi.can)] === nhatChu;
  const chiXungNhat = coLucXung(p.canChi.chi, [p.tt.ngay.chi]);
  if (canKhacNhat && chiXungNhat) {
    quanHeKichHoat.push("thien_khac_dia_xung_nhat_can");
    dg.push(`Can tuế vận ${p.canChi.can} khắc Nhật Can ${nhatChuCan} ĐỒNG THỜI Chi tuế vận ${p.canChi.chi} xung Nhật Chi ${p.tt.ngay.chi} → Thiên Khắc Địa Xung.`);
  }
  // Nhập Mộ / Mộ bị xung khai — xét cho Nhật Chủ VÀ cho hành Tài/Quan Sát (dùng ở tinh_duyen: "Phu/Thê
  // tinh nhập Mộ"), vì Mộ Khố chỉ có 4 giá trị cố định theo hành (base-data.json > moKho), tra được
  // cho bất kỳ hành nào, không riêng Nhật Chủ.
  const hanhTaiCuaNhatChu = KHAC_MAP[nhatChu];
  const hanhQuanSatCuaNhatChu = hanhKhacX(nhatChu);
  for (const hanhXet of new Set([nhatChu, hanhTaiCuaNhatChu, hanhQuanSatCuaNhatChu])) {
    if (MO_KHO[hanhXet] === chiChuan(p.canChi.chi)) {
      quanHeKichHoat.push(`nhap_mo:${hanhXet}`);
      dg.push(`Chi tuế vận ${p.canChi.chi} là Mộ Khố của hành ${hanhXet} → nhập Mộ.`);
    }
  }
  for (const [ten, chi] of Object.entries(chiGoc)) {
    if (MO_KHO[nhatChu] === chiChuan(chi) && coLucXung(p.canChi.chi, [chi])) {
      quanHeKichHoat.push(`mo_bi_xung_khai`);
      dg.push(`Chi ${ten} ${chi} vốn là Mộ Khố của Nhật Chủ, nay bị Chi tuế vận ${p.canChi.chi} xung mở.`);
    }
  }
  // Tầng Thứ — quan hệ giữa Lưu Niên và Đại Vận đang chứa nó (chỉ áp dụng khi loai = LuuNien).
  if (p.loai === "LuuNien" && p.canChiDaiVanChua) {
    if (p.canChi.can === p.canChiDaiVanChua.can && chiChuan(p.canChi.chi) === chiChuan(p.canChiDaiVanChua.chi)) {
      quanHeKichHoat.push("tue_van_cung_gap");
      dg.push(`Can Chi Lưu Niên ${p.canChi.can} ${p.canChi.chi} TRÙNG HỆT Đại Vận đang đi → Tuế Vận cùng gặp.`);
    } else if (coLucXung(p.canChi.chi, [p.canChiDaiVanChua.chi])) {
      quanHeKichHoat.push("xung_daivan_chi");
      dg.push(`Chi Lưu Niên ${p.canChi.chi} xung Chi Đại Vận ${p.canChiDaiVanChua.chi}.`);
    }
  }

  // --- Bước 3: tính lại vượng suy tại thời điểm (đếm phẳng — xem giải thích đầu file). ---
  const pheBase = pheNguyenCuc(p.tt);
  const pheTaiThoiDiem = { ...pheBase };
  themLucTueVan(pheTaiThoiDiem, p.canChiDaiVanChua ?? p.canChi, nhatChu, 1.0); // nền Đại Vận (luôn có mặt)
  if (p.loai === "LuuNien") themLucTueVan(pheTaiThoiDiem, p.canChi, nhatChu, 1.2); // + Lưu Niên (Tầng Thứ cao hơn)

  const capDoTaiThoiDiem = capDoTuPhe(pheTaiThoiDiem);
  dg.push(`Vượng suy tại thời điểm (đếm cả tuế vận): "${capDoTaiThoiDiem}" (nguyên cục: "${p.vsGoc.capDo}").`);

  // --- Bước 3 (tiếp): Dụng Thần tại thời điểm — SPEC §2.2. ---
  let dungThanTaiThoiDiem: Hanh = p.dtGoc.dungThan;
  let hyThan: Hanh = p.dtGoc.hyThan;
  let kyThan: Hanh = p.dtGoc.kyThan;
  let dungThanDaDoi = false;

  if (p.vsGoc.nhom === 1 || p.vsGoc.nhom === 2) {
    const ketQua = chonDungThanDonGian(capDoTaiThoiDiem, pheTaiThoiDiem, nhatChu);
    dungThanTaiThoiDiem = ketQua.dungThan;
    hyThan = ketQua.hyThan;
    kyThan = ketQua.kyThan;
    dungThanDaDoi = dungThanTaiThoiDiem !== p.dtGoc.dungThan;
    dg.push(`Nguyên cục Nhóm ${p.vsGoc.nhom} → Dụng Thần CÓ THỂ đổi theo tuế vận. Tại mốc này: ${dungThanTaiThoiDiem}${dungThanDaDoi ? " (ĐÃ ĐỔI so với gốc " + p.dtGoc.dungThan + ")" : " (giữ nguyên)"}.`);
  } else {
    // Nhóm 3 (cực vượng/cực nhược) — chỉ đổi khi cấu trúc bị phá vỡ HOÀN TOÀN: cấp độ tại thời điểm
    // vọt qua khỏi phía đối lập của Trung hòa (vd Cực cường tụt hẳn xuống Suy/Nhược/Cực nhược).
    const idxGoc = THU_TU_CAP_DO.indexOf(p.vsGoc.capDo);
    const idxTai = THU_TU_CAP_DO.indexOf(capDoTaiThoiDiem);
    const idxTrungHoa = THU_TU_CAP_DO.indexOf("Trung hòa");
    const phaVoHoanToan = idxGoc > idxTrungHoa ? idxTai <= idxTrungHoa - 2 : idxGoc < idxTrungHoa ? idxTai >= idxTrungHoa + 2 : false;
    if (phaVoHoanToan) {
      const ketQua = chonDungThanDonGian(capDoTaiThoiDiem, pheTaiThoiDiem, nhatChu);
      dungThanTaiThoiDiem = ketQua.dungThan;
      hyThan = ketQua.hyThan;
      kyThan = ketQua.kyThan;
      dungThanDaDoi = dungThanTaiThoiDiem !== p.dtGoc.dungThan;
      dg.push(`Nguyên cục Nhóm 3 nhưng tuế vận làm cấu trúc lệch hẳn sang phía đối lập (${p.vsGoc.capDo} → ${capDoTaiThoiDiem}) → hiếm gặp, phải tính lại Dụng Thần.`);
    } else {
      dg.push(`Nguyên cục Nhóm 3 (${p.vsGoc.capDo}) → giữ nguyên Dụng Thần gốc ${p.dtGoc.dungThan} xuyên suốt (chưa đủ mức phá vỡ cấu trúc).`);
    }
  }

  return {
    loai: p.loai,
    canChi: p.canChi,
    namBatDau: p.namBatDau,
    nam: p.nam,
    vuongSuyTaiThoiDiem: capDoTaiThoiDiem,
    dungThanTaiThoiDiem,
    hyThan,
    kyThan,
    dungThanDaDoi,
    quanHeKichHoat,
    dienGiai: dg,
  };
}

export { thapThanCuaCan };
