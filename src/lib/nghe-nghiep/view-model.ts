/**
 * Chuẩn hoá kết quả module Bát Tự / Tử Vi về MỘT khuôn hiển thị chung (`DashboardVM`) để 1 component
 * giao diện dùng cho cả 2 hệ — đúng chủ trương "cùng layout, chỉ đổi nguồn dữ liệu" của
 * `handoff/docs/module-nghe-tu-vi.md` mục 4.
 *
 * File này CHỈ định dạng để hiển thị; mọi con số đã do module tính. Không tính lại gì.
 */
import type { BatTuProfile } from "../chart-profile";
import type { TuViProfile } from "../chart-profile/types-tu-vi";
import { tinhModuleNgheBatTu, type ModuleNgheBatTuResult } from "./module-bat-tu";
import { tinhModuleNgheTuVi, type ModuleNgheTuViResult } from "./module-tu-vi";
import { loadCareerConfig } from "./config";
import { loadTuViConfig } from "./config-tu-vi";

export const NH: Record<string, { mau: string; label: string }> = {
  kim: { mau: "#B8860B", label: "Kim" },
  moc: { mau: "#1E8A45", label: "Mộc" },
  thuy: { mau: "#1D5FB0", label: "Thủy" },
  hoa: { mau: "#CF2A22", label: "Hỏa" },
  tho: { mau: "#96591A", label: "Thổ" },
  insufficient_data: { mau: "#6B7280", label: "—" },
};

const NGU_HANH_LABEL: Record<string, string> = { kim: "Kim", moc: "Mộc", thuy: "Thủy", hoa: "Hỏa", tho: "Thổ", insufficient_data: "—" };

/** Không bao giờ để lọt token kỹ thuật ("insufficient_data", tên field/file, mã snake_case) ra giao
 *  diện khách — chặn cả trường hợp AI lỡ trích dẫn tên tài liệu nguồn trong lời luận tự do. */
const sach = (s: string): string =>
  s
    .replace(/insufficient_data/g, "đang cập nhật")
    .replace(/\((?:bat_tu|manh_phai|career_mapping|domain_mapping|bat_tu_nganh_ngu_hanh)[^)]*\)/g, "")
    .replace(/[\w-]+\.(md|json|py|ts)\b/gi, "") // tên file tài liệu/mã nguồn AI lỡ trích dẫn
    .replace(/\(\s*[a-z][a-z0-9]*(?:_[a-z0-9]+)+(?:\s*,\s*[a-z][a-z0-9]*(?:_[a-z0-9]+)+)*\s*\)/g, "") // (snake_case, snake_case...)
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
const VUONG_SUY_LABEL: Record<string, string> = {
  cuc_cuong: "Cực cường", cuong_vuong: "Cường vượng", vuong: "Vượng", trung_hoa: "Trung hòa",
  suy: "Suy", nhuoc: "Nhược", cuc_nhuoc: "Cực nhược", insufficient_data: "Chưa xác định",
};
const CHINH_PHAN_LABEL: Record<string, string> = { chinh_cuc: "Chính Cục", phan_cuc: "Phản Cục", insufficient_data: "Chưa xác định" };

// Chi → Ngũ Hành (để tô timeline Đại Hạn Tử Vi theo hành của Chi cung).
const CHI_NGU_HANH: Record<string, string> = {
  "Tý": "thuy", "Sửu": "tho", "Dần": "moc", "Mão": "moc", "Thìn": "tho", "Tỵ": "hoa",
  "Ngọ": "hoa", "Mùi": "tho", "Thân": "kim", "Dậu": "kim", "Tuất": "tho", "Hợi": "thuy",
};
// Can → Ngũ Hành (để tô bảng Tứ Trụ + tính % phân bố Ngũ Hành).
const CAN_NGU_HANH: Record<string, string> = {
  "Giáp": "moc", "Ất": "moc", "Bính": "hoa", "Đinh": "hoa", "Mậu": "tho",
  "Kỷ": "tho", "Canh": "kim", "Tân": "kim", "Nhâm": "thuy", "Quý": "thuy",
};

export interface TruPillarVM { nhan: string; can: string; chi: string; canMau: string; chiMau: string }
export interface NguHanhPhanBoVM { hanh: string; label: string; mau: string; phanTram: number }

const DUNG_HY_PILL: Record<string, { bg: string; label: string }> = {
  dung: { bg: "#166534", label: "Dụng" }, hy: { bg: "#22A75A", label: "Hỷ" },
  trung: { bg: "#6B7280", label: "Trung" }, ky: { bg: "#CF2A22", label: "Kỵ" },
  insufficient_data: { bg: "#9CA3AF", label: "—" },
};
const MUC_THUAN_PILL: Record<string, { bg: string; label: string }> = {
  cao: { bg: "#166534", label: "Thuận cao" }, trung_binh: { bg: "#B8860B", label: "Trung bình" },
  thap: { bg: "#CF2A22", label: "Thấp" }, insufficient_data: { bg: "#9CA3AF", label: "—" },
};

export interface ChipVM { label: string; value: string; mau?: string; solid?: boolean }
export interface TimelineSegVM { tuTuoi: number; denTuoi: number; top: string; chuDe: string; mau: string; badge: { label: string; bg: string } }
export interface DomainItemVM { label: string; score: number; majors: { name: string }[] }
export interface DashboardVM {
  he: "bat_tu" | "tu_vi";
  chips: ChipVM[];
  vector: Record<string, number> | null;
  vectorInsufficient: boolean;
  vectorDetail: string;
  axis: number | null;
  axisInsufficient: boolean;
  axisKetLuan: string;
  axisDetail: string;
  domainInsufficient: boolean;
  domainDetail: string;
  priority: DomainItemVM[]; suitable: DomainItemVM[]; possible: DomainItemVM[];
  timeline: TimelineSegVM[];
  timelineTitle: string;
  timelineNote: string;
  timelineLegend: "ngu_hanh_can" | "ngu_hanh_chi";
  path: { label: string; tuTuoi: number; denTuoi: number }[];
  why: { label: string; value: string }[];
  /** Chỉ có ở hệ Bát Tự — bảng Tứ Trụ (Năm/Tháng/Ngày/Giờ) + % phân bố Ngũ Hành trên 8 chữ Can Chi. */
  ngaySinhDuongLich?: string;
  tuTru?: TruPillarVM[];
  nguHanhPhanBo?: NguHanhPhanBoVM[];
}

/** "1996-03-14T09:20" → "14/03/1996 09:20". */
function formatNgaySinh(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return iso;
  const [, y, mo, d, h, mi] = m;
  return `${d}/${mo}/${y} ${h}:${mi}`;
}

/** % phân bố Ngũ Hành trên 8 chữ Can Chi của Tứ Trụ — đếm đơn giản, mỗi chữ 1 phiếu. */
function tinhNguHanhPhanBo(tuTru: BatTuProfile["facts"]["tuTru"]): NguHanhPhanBoVM[] {
  const dem: Record<string, number> = { kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0 };
  for (const tru of [tuTru.nam, tuTru.thang, tuTru.ngay, tuTru.gio]) {
    const hCan = CAN_NGU_HANH[tru.can];
    const hChi = CHI_NGU_HANH[tru.chi];
    if (hCan) dem[hCan]!++;
    if (hChi) dem[hChi]!++;
  }
  const tong = Object.values(dem).reduce((s, n) => s + n, 0) || 1;
  const hanhs: (keyof typeof dem)[] = ["kim", "moc", "thuy", "hoa", "tho"];
  const raw = hanhs.map((h) => ({ h, pct: Math.round((dem[h]! / tong) * 100) }));
  // Bù lệch làm tròn để tổng luôn = 100 — cộng/trừ phần chênh vào hành có số lượng lớn nhất.
  const lech = 100 - raw.reduce((s, r) => s + r.pct, 0);
  if (lech !== 0) {
    const idxMax = raw.reduce((best, r, i) => (dem[r.h]! > dem[raw[best]!.h]! ? i : best), 0);
    raw[idxMax]!.pct += lech;
  }
  return raw.map((r) => ({ hanh: r.h, label: NGU_HANH_LABEL[r.h], mau: NH[r.h].mau, phanTram: r.pct }));
}

function tinhTuTruVM(tuTru: BatTuProfile["facts"]["tuTru"]): TruPillarVM[] {
  const nhan = [
    { nhan: "Năm", p: tuTru.nam }, { nhan: "Tháng", p: tuTru.thang },
    { nhan: "Ngày", p: tuTru.ngay }, { nhan: "Giờ", p: tuTru.gio },
  ];
  return nhan.map(({ nhan, p }) => ({
    nhan, can: p.can, chi: p.chi,
    canMau: NH[CAN_NGU_HANH[p.can] ?? "insufficient_data"]?.mau ?? NH.insufficient_data.mau,
    chiMau: NH[CHI_NGU_HANH[p.chi] ?? "insufficient_data"]?.mau ?? NH.insufficient_data.mau,
  }));
}

function axisKetLuan(axis: number | null): string {
  if (axis === null) return "Chưa đủ dữ liệu để gợi ý.";
  if (axis >= 15) return "Có xu hướng nghiêng về tự chủ, kinh doanh, thương mại.";
  if (axis <= -15) return "Có xu hướng nghiêng về làm việc trong tổ chức, theo hệ thống.";
  return "Cân bằng giữa hai hướng, không nghiêng rõ rệt.";
}
const toItems = (arr: { label: string; score: number; majors: { name: string }[] }[]): DomainItemVM[] =>
  arr.map((x) => ({ label: x.label, score: x.score, majors: x.majors.map((m) => ({ name: m.name })) }));

/**
 * Anh Công chốt 22/8/2026: "chưa đủ căn cứ thì cho vào làm gì em, không có thông tin thì nên bỏ
 * qua" — thẻ nào không có dữ liệu thật thì BỎ HẲN khỏi giao diện, không in "Chưa xác định" cho
 * khách đọc. Chỉ áp cho phần TRÌNH BÀY; bên trong engine vẫn giữ nguyên "insufficient_data" để
 * không đánh mất thông tin khi tính toán và ghi log.
 */
const GIA_TRI_RONG = new Set(["Chưa xác định", "insufficient_data", "?", "—", "-", ""]);
const boThePhieuRong = <T extends { value: string }>(cs: T[]): T[] =>
  cs.filter((c) => !GIA_TRI_RONG.has((c.value ?? "").trim()));

export function buildBatTuVM(profile: BatTuProfile): { vm: DashboardVM; result: ModuleNgheBatTuResult } {
  const result = tinhModuleNgheBatTu(profile);
  const { career } = loadCareerConfig();
  const coChe = profile.manh_phai.cau_truc;
  const coCheLabel = coChe === "insufficient_data" ? "Chưa xác định" : (career.manh_phai_mechanism[coChe]?.label ?? coChe);

  const vm: DashboardVM = {
    he: "bat_tu",
    chips: boThePhieuRong([
      { label: "Nhật Chủ", value: `${profile.bat_tu.nhat_chu} (${NGU_HANH_LABEL[profile.bat_tu.ngu_hanh_nhat_chu]})`, mau: NH[profile.bat_tu.ngu_hanh_nhat_chu]?.mau },
      { label: "Vượng suy", value: VUONG_SUY_LABEL[profile.bat_tu.vuong_suy] ?? "?" },
      { label: "Dụng Thần", value: NGU_HANH_LABEL[profile.bat_tu.dung_than] ?? "?", mau: NH[profile.bat_tu.dung_than]?.mau, solid: true },
      { label: "Hỷ Thần", value: NGU_HANH_LABEL[profile.bat_tu.hy_than] ?? "?", mau: NH[profile.bat_tu.hy_than]?.mau, solid: true },
      { label: "Cơ chế", value: coCheLabel },
      { label: "Cục", value: CHINH_PHAN_LABEL[profile.manh_phai.chinh_phan_cuc] ?? "?" },
    ]),
    vector: result.careerVector.vector as Record<string, number> | null,
    vectorInsufficient: result.careerVector.insufficient,
    vectorDetail: sach(result.careerVector.detail),
    axis: result.axis.axis,
    axisInsufficient: result.axis.insufficient,
    axisKetLuan: axisKetLuan(result.axis.axis),
    axisDetail: sach(result.axis.detail),
    domainInsufficient: result.domainScore.insufficient,
    domainDetail: sach(result.domainScore.detail),
    priority: toItems(result.domainScore.priority),
    suitable: toItems(result.domainScore.suitable),
    possible: toItems(result.domainScore.possible),
    timeline: result.careerPath.map((dv) => ({
      tuTuoi: dv.tuTuoi, denTuoi: dv.denTuoi, top: dv.canChi, chuDe: dv.chuDeNhan,
      mau: NH[dv.nguHanh]?.mau ?? NH.insufficient_data.mau,
      badge: DUNG_HY_PILL[dv.dungHy] ?? DUNG_HY_PILL.insufficient_data,
    })),
    timelineTitle: "Đại Vận Bát Tự",
    timelineNote: "Chỉ 1 timeline Bát Tự (v1 chưa ghép Đại Hạn Tử Vi). Nền = Ngũ Hành của Can vận; nhãn góc = mức vận.",
    timelineLegend: "ngu_hanh_can",
    path: result.careerPath.map((dv) => ({ label: dv.chuDeNhan, tuTuoi: dv.tuTuoi, denTuoi: dv.denTuoi })),
    why: [
      { label: "Tố công (Manh Phái)", value: sach(profile.manh_phai.to_cong) },
      // Không có cơ chế Manh Phái thì bỏ hẳn dòng này, không in "Chưa xác định — dự phòng…".
      { label: "Cơ chế Manh Phái", value: coChe === "insufficient_data" ? "" : sach(`${coCheLabel} — ${result.careerVector.detail}`) },
      { label: "Công thức điểm ngành", value: sach(result.domainScore.detail) },
    ].filter((w) => w.value && w.value !== "đang cập nhật"),
    ngaySinhDuongLich: formatNgaySinh(profile.meta.duong_lich),
    tuTru: tinhTuTruVM(profile.facts.tuTru),
    nguHanhPhanBo: tinhNguHanhPhanBo(profile.facts.tuTru),
  };
  return { vm, result };
}

export function buildTuViVM(profile: TuViProfile): { vm: DashboardVM; result: ModuleNgheTuViResult } {
  const result = tinhModuleNgheTuVi(profile);
  const { careerTV } = loadTuViConfig();
  const archeKey = profile.menh_cach.chinh;
  const archeLabel = archeKey === "insufficient_data" ? "Chưa xác định" : (careerTV.tam_hop_archetype[archeKey]?.label ?? archeKey);
  const catCung = Object.entries(profile.danh_gia_cung)
    .filter(([, v]) => v === "cat")
    .map(([k]) => ({ quan_loc: "Quan Lộc", tai_bach: "Tài Bạch", thien_di: "Thiên Di", phuc_duc: "Phúc Đức" }[k] ?? k))
    .join(", ") || "—";

  const vm: DashboardVM = {
    he: "tu_vi",
    chips: boThePhieuRong([
      { label: "Mệnh", value: profile.menh_than_cuc.menh_cung, mau: NH[CHI_NGU_HANH[profile.menh_than_cuc.menh_cung] ?? "insufficient_data"]?.mau },
      { label: "Thân", value: profile.menh_than_cuc.than_cung },
      { label: "Cục", value: profile.menh_than_cuc.cuc },
      { label: "Mệnh cách", value: archeLabel },
      { label: "Cát cung", value: catCung },
    ]),
    vector: result.careerVector.vector,
    vectorInsufficient: result.careerVector.insufficient,
    vectorDetail: sach(result.careerVector.detail),
    axis: result.axis.axis,
    axisInsufficient: result.axis.insufficient,
    axisKetLuan: axisKetLuan(result.axis.axis),
    axisDetail: sach(result.axis.detail),
    domainInsufficient: result.domainScore.insufficient,
    domainDetail: "Điểm ngành từ mệnh cách + chính tinh cung Quan Lộc/Mệnh.",
    priority: toItems(result.domainScore.priority),
    suitable: toItems(result.domainScore.suitable),
    possible: toItems(result.domainScore.possible),
    timeline: result.careerPath.map((dh) => ({
      tuTuoi: dh.tuTuoi, denTuoi: dh.denTuoi, top: dh.cungName, chuDe: dh.chuDeNhan,
      mau: NH[CHI_NGU_HANH[dh.cungChi] ?? "insufficient_data"]?.mau ?? NH.insufficient_data.mau,
      badge: MUC_THUAN_PILL[dh.mucThuan] ?? MUC_THUAN_PILL.insufficient_data,
    })),
    timelineTitle: "Đại Hạn Tử Vi",
    timelineNote: "Timeline Đại Hạn Tử Vi (riêng, không ghép Đại Vận Bát Tự). Nền = Ngũ Hành của Chi cung; nhãn góc = mức thuận.",
    timelineLegend: "ngu_hanh_chi",
    path: result.careerPath.map((dh) => ({ label: dh.chuDeNhan, tuTuoi: dh.tuTuoi, denTuoi: dh.denTuoi })),
    why: [
      { label: "Mệnh cách", value: sach(`${archeLabel}${profile.menh_cach.phu.length ? " + phụ cách" : ""} — ${result.careerVector.detail}`) },
      { label: "Chính tinh cung nghề", value: `Quan Lộc: ${profile.facts.sao_theo_cung.quan_loc.map((s) => s.ten_hien_thi).join(", ") || "Vô Chính Diệu"} · Mệnh: ${profile.facts.sao_theo_cung.menh.map((s) => s.ten_hien_thi).join(", ") || "Vô Chính Diệu"}` },
      { label: "Công thức điểm ngành", value: sach(result.domainScore.detail) },
    ].filter((w) => w.value && w.value !== "đang cập nhật"),
  };
  return { vm, result };
}
