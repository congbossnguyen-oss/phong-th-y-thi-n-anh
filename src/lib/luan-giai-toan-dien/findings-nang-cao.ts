// TẦNG 1 — FINDINGS ENGINE cho 5 giai đoạn Luận Nâng Cao: D, E, F, I, K.
//
// Nguyên tắc riêng cho tầng này (SPEC mục 7 "Ranh giới phạm vi"): KHÔNG code hóa 100% mọi dòng
// trong luc-than.md/benh-tat.md — ưu tiên mẫu computable rõ ràng, phần định tính để Tầng 2 AI tự
// đọc knowledge/ trực tiếp (đã có sẵn trong system prompt qua ai-narrative.ts).
import type { BatTuChart, PillarInfo } from "../bat-tu";
import { CAN_NGU_HANH } from "../bat-tu";
import type { BatTuAnalysis, Hanh } from "../bat-tu-engine/engine";
import { MO_KHO, hanhCan, chiChuan } from "../bat-tu-engine/engine";
import type { GiaiDoanFindings } from "./types";

const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];

function hyKyCuaHanh(h: Hanh, dt: BatTuAnalysis["dungThan"]): "dung_than" | "hy_than" | "ky_than" | "cuu_than" | "trung_tinh" {
  if (h === dt.dungThan) return "dung_than";
  if (h === dt.hyThan) return "hy_than";
  if (h === dt.kyThan) return "ky_than";
  if (h === dt.cuuThan) return "cuu_than";
  return "trung_tinh";
}

// --- D. Thần Sát — tái dùng NGUYÊN kết quả đã tính sẵn trong bat-tu.ts (36 sao, đã đối chiếu tài
// liệu gốc nhiều lần — xem header bat-tu.ts). KHÔNG viết lại 49 công thức trong than-sat.json từ
// đầu: rủi ro sai cao (mỗi sao 1 cách tra khác nhau), trong khi phần lớn đã có sẵn, đúng nguyên tắc
// "Bao trùm — tái dùng hạ tầng đã có" (SPEC mục 0.1). 3 sao than-sat.json có nhưng bat-tu.ts CHỦ
// ĐỘNG bỏ (Học Đường/Từ Quán, Phúc Tinh Quý Nhân, Kim Thần — nguồn OCR gốc rách/mâu thuẫn, xem
// header bat-tu.ts) — giữ nguyên quyết định đó, không tự thêm lại khi chưa có bảng tra đáng tin.
export function findingsD(chart: BatTuChart): GiaiDoanFindings {
  const saoCoMat = Object.entries(chart.thanSat)
    .flatMap(([tru, danhSach]) => danhSach.map((ten) => ({ tru, ten })))
    .reduce<Record<string, string[]>>((acc, { tru, ten }) => {
      (acc[ten] ??= []).push(tru);
      return acc;
    }, {});

  return {
    maGiaiDoan: "D",
    tenGiaiDoan: "Thần Sát",
    ketQua: {
      saoCoMat: Object.entries(saoCoMat).map(([ten, truList]) => ({ ten, viTri: truList })),
      tongSoSao: Object.keys(saoCoMat).length,
      luuY: "Danh sách đã loại các sao bị 'mất tác dụng' theo nguyên tắc Không Vong/Hình/Xung/Khắc/Hại trực tiếp (tính sẵn trong bat-tu.ts).",
    },
    canCu: ["bat-tu.ts (thanSat nguyên cục, 36 sao)", "knowledge/than-sat.md"],
  };
}

// --- E. Mộ Khố ---
export function findingsE(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings {
  const nhatChu = chart.day.can;
  const hanhNC = hanhCan(nhatChu);
  const chiXet: { tru: string; chi: string }[] = [
    { tru: "year", chi: chart.year.chi }, { tru: "month", chi: chart.month.chi },
    { tru: "day", chi: chart.day.chi }, { tru: "hour", chi: chart.hour.chi },
  ];

  const moKhoTimThay: { tru: string; chi: string; hanh: Hanh; laCuaAi: "menh_chu" | "luc_than"; vuongHaySuy: "vuong_khoi" | "suy_mo" }[] = [];
  for (const hanh of Object.keys(MO_KHO) as Hanh[]) {
    const moChi = MO_KHO[hanh];
    for (const { tru, chi } of chiXet) {
      if (chiChuan(chi) !== moChi) continue;
      // Nguyên tắc "Khố của ai": Chi Ngày/Giờ = của chính mệnh chủ; Chi Năm/Tháng = của lục thân.
      const laCuaAi = tru === "day" || tru === "hour" ? "menh_chu" : "luc_than";
      // Nguyên tắc "vượng là Khố, suy là Mộ": hành đó đang mạnh (đồng đảng với Nhật Chủ hoặc chính
      // Nhật Chủ) hay yếu (dị đảng) — dùng cấp độ vượng suy đã tính sẵn làm ước lượng nhanh, không
      // tính lại vượng suy riêng cho từng hành (đó là việc phức tạp hơn, ngoài phạm vi mẫu computable).
      const dongDang = hanh === hanhNC || hanh === analysis.dungThan.hyThan;
      moKhoTimThay.push({ tru, chi, hanh, laCuaAi, vuongHaySuy: dongDang ? "vuong_khoi" : "suy_mo" });
    }
  }

  return {
    maGiaiDoan: "E",
    tenGiaiDoan: "Mộ Khố",
    ketQua: {
      coMoKho: moKhoTimThay.length > 0,
      moKhoTimThay,
    },
    canCu: ["bat-tu-engine (MO_KHO)", "knowledge/mo-kho.md"],
  };
}

// --- F. Lục Thân (mẫu computable: vị trí Thập Thần đại diện từng vai vế + quan hệ với trụ tương ứng) ---
export function findingsF(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings {
  const dt = analysis.dungThan;
  const layThapThanOTru = (thapThanCanXet: string[]) => {
    const ketQua: { tru: string; can: string; thapThan: string; hyKy: string; laTangCan: boolean }[] = [];
    for (const key of ["year", "month", "day", "hour"] as const) {
      const p: PillarInfo = chart[key];
      if (key !== "day" && thapThanCanXet.includes(p.thapThan)) {
        ketQua.push({ tru: key, can: p.can, thapThan: p.thapThan, hyKy: hyKyCuaHanh(CAN_NGU_HANH[CAN_NAMES.indexOf(p.can)], dt), laTangCan: false });
      }
      for (const tc of p.tangCan) {
        if (thapThanCanXet.includes(tc.thapThan)) {
          ketQua.push({ tru: key, can: tc.can, thapThan: tc.thapThan, hyKy: hyKyCuaHanh(CAN_NGU_HANH[CAN_NAMES.indexOf(tc.can)], dt), laTangCan: true });
        }
      }
    }
    return ketQua;
  };

  // Quy ước phổ biến Tử Bình (nam mệnh xem theo Nhật Chủ; nữ mệnh 1 số phần đảo Tài/Ấn cho cha mẹ —
  // KHÔNG áp dụng đảo ở đây, để nguyên quy ước chung, đúng tinh thần "mẫu computable rõ ràng, phần
  // định tính/khác biệt trường phái để AI tự đọc luc-than.md" (SPEC mục 7).
  return {
    maGiaiDoan: "F",
    tenGiaiDoan: "Lục Thân",
    ketQua: {
      chaMe: { chinhAn: layThapThanOTru(["Chính Ấn"]), thienAn: layThapThanOTru(["Thiên Ấn"]), taiTinh_choCha: layThapThanOTru(["Chính Tài", "Thiên Tài"]) },
      anhChiEm: layThapThanOTru(["Tỷ Kiên", "Kiếp Tài"]),
      voChong: chart.gender === "Nam" ? layThapThanOTru(["Chính Tài", "Thiên Tài"]) : layThapThanOTru(["Chính Quan", "Thất Sát"]),
      conCai: chart.gender === "Nam" ? layThapThanOTru(["Chính Quan", "Thất Sát"]) : layThapThanOTru(["Thực Thần", "Thương Quan"]),
      luuY: "Bảng trên là vị trí + Hỷ/Kỵ theo Thập Thần đại diện mỗi vai vế (quy ước Tử Bình phổ thông). Phần diễn giải chi tiết theo knowledge/luc-than.md.",
    },
    canCu: ["knowledge/luc-than.md"],
  };
}

// --- I. Sức khỏe (tối giản: tỷ trọng Ngũ Hành + hành nào dư/thiếu/bị khắc mạnh — AI tự đọc benh-tat.md) ---
export function findingsI(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings {
  const cans = [chart.year.can, chart.month.can, chart.day.can, chart.hour.can];
  // Chỉ đếm trên Thiên Can (4 can) cho mục đích "dư/thiếu ngũ hành" gợi mở nhanh — không cần chính
  // xác tuyệt đối như vượng suy (đã tính đủ tàng can); luận chi tiết đọc knowledge/benh-tat.md.
  const dem: Record<Hanh, number> = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
  for (const c of cans) dem[hanhCan(c)]++;
  const hanhThieu = (Object.entries(dem) as [Hanh, number][]).filter(([, n]) => n === 0).map(([h]) => h);
  const hanhNhieu = (Object.entries(dem) as [Hanh, number][]).filter(([, n]) => n >= 3).map(([h]) => h);

  return {
    maGiaiDoan: "I",
    tenGiaiDoan: "Sức khỏe",
    ketQua: {
      capDoVuongSuy: analysis.vuongSuy.capDo,
      dungKyThan: { dungThan: analysis.dungThan.dungThan, kyThan: analysis.dungThan.kyThan },
      phanBoNguHanhTrenThienCan: dem,
      hanhThieuHoanToanTrenThienCan: hanhThieu,
      hanhVuongTrenThienCan: hanhNhieu,
      luuY: "Chỉ đếm trên Thiên Can (4 can) để gợi mở nhanh — luận chi tiết theo knowledge/benh-tat.md, đối chiếu đủ tàng can + vượng suy.",
    },
    canCu: ["knowledge/benh-tat.md"],
  };
}

// --- K. Đại Vận trọn đời ---
export function findingsK(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings {
  const dt = analysis.dungThan;
  const daiVan = chart.daiVan.map((dv) => {
    const hanhCanDv = CAN_NGU_HANH[CAN_NAMES.indexOf(dv.can)];
    return {
      can: dv.can, chi: dv.chi, tuoiBatDau: dv.startAge, tuoiKetThuc: dv.endAge,
      hanhCan: hanhCanDv,
      hyKyCan: hyKyCuaHanh(hanhCanDv, dt),
    };
  });

  return {
    maGiaiDoan: "K",
    tenGiaiDoan: "Đại Vận trọn đời",
    ketQua: {
      dungThanGoc: dt.dungThan,
      nhomVuongSuy: analysis.vuongSuy.nhom,
      daiVan,
      luuY:
        analysis.vuongSuy.nhom === 3
          ? "Lá số Nhóm 3 (Tòng cách) — Dụng Thần GIỮ NGUYÊN suốt đời, không đổi theo Đại Vận (SPEC mục 7)."
          : "Lá số Nhóm 1/2 — Dụng Thần gốc dùng làm mốc chính để đối chiếu Hỷ/Kỵ mỗi Đại Vận trong bảng trên (chưa tính lại vượng suy riêng cho từng vận — đó là bài toán phức tạp hơn, để Tầng 2 AI diễn giải xu hướng dựa trên dữ liệu đã có).",
    },
    canCu: ["bat-tu.ts (daiVan)", "knowledge/ung-ky.md", "data/quan-he-can-chi.json"],
  };
}

export function taoFindingsNangCao(chart: BatTuChart, analysis: BatTuAnalysis): GiaiDoanFindings[] {
  return [findingsD(chart), findingsE(chart, analysis), findingsF(chart, analysis), findingsI(chart, analysis), findingsK(chart, analysis)];
}
