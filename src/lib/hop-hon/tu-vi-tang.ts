/**
 * HỢP HÔN — TẦNG 4: TỬ VI. Bắt buộc CÓ GIỜ SINH cả hai — thiếu là trả "khong_du_du_lieu",
 * TUYỆT ĐỐI không đoán giờ mặc định (khác Bát Tự: Tử Vi sai giờ là sai cả Cung Mệnh, sai toàn lá).
 *
 * BAO TRÙM: lá số từ `tinhTuVi` (engine Tử Vi Nam Phái đã lock Golden Master) — chỉ phần đối chiếu
 * chéo 2 lá là logic mới của module này.
 */
import { tinhTuVi, type TuViChart, type CungKetQua } from "../tu-vi/engine";
import type { TrucKetQua } from "./bat-tu-tang";

const SAT_TINH = new Set(["Kình Dương", "Đà La", "Linh Tinh", "Hỏa Tinh", "Địa Không", "Địa Kiếp"]);
const CHI_TEN = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

export interface HopHonTuViInput {
  day: number; month: number; year: number; hour: number; gender: "Nam" | "Nữ";
}

function cungTheoTen(chart: TuViChart, ten: string): CungKetQua {
  return chart.cungs.find((c) => c.cungName === ten)!;
}

/** Quan hệ 2 chi cung (đơn giản cho tầng này): trùng / tam hợp / lục hợp / xung / thường. */
function quanHeChiCung(a: number, b: number): "trung" | "tam_hop" | "luc_hop" | "xung" | "thuong" {
  if (a === b) return "trung";
  const d = (a - b + 12) % 12;
  if (d === 4 || d === 8) return "tam_hop";
  if (d === 6) return "xung";
  // Lục hợp theo chỉ số: Tý(0)-Sửu(1), Dần(2)-Hợi(11), Mão(3)-Tuất(10), Thìn(4)-Dậu(9), Tị(5)-Thân(8), Ngọ(6)-Mùi(7).
  const LH = new Set(["0-1", "2-11", "3-10", "4-9", "5-8", "6-7"]);
  return LH.has(`${Math.min(a, b)}-${Math.max(a, b)}`) ? "luc_hop" : "thuong";
}

/** Sao Tứ Hóa (Lộc/Kỵ) của người X rơi vào cung nào bên lá người Y. */
function timCungChuaSao(chart: TuViChart, tenSao: string): CungKetQua | null {
  return (
    chart.cungs.find(
      (c) => c.chinhTinh.some((s) => s.name === tenSao) || c.phuTinh.some((s) => s.name === tenSao),
    ) ?? null
  );
}

export function tinhTuViHopHon(
  inA: HopHonTuViInput | null,
  inB: HopHonTuViInput | null,
): TrucKetQua {
  if (!inA || !inB) {
    return {
      ma: "tu_vi", ten: "Tử Vi — Cung Phu Thê & Tứ Hóa", muc: "khong_du_du_lieu",
      tomTat: "Tầng Tử Vi cần giờ sinh của CẢ HAI người — thiếu giờ thì không định được Cung Mệnh nên không chạy, không đoán bừa.",
      canCu: ["Bổ sung giờ sinh (hỏi người thân, giấy khai sinh, sổ sinh của bệnh viện) rồi tra lại để mở tầng này."],
    };
  }

  const A = tinhTuVi(inA);
  const B = tinhTuVi(inB);
  const phuTheA = cungTheoTen(A, "Phu Thê");
  const phuTheB = cungTheoTen(B, "Phu Thê");
  const menhA = A.cungs[A.menhChiIndex]!;
  const menhB = B.cungs[B.menhChiIndex]!;

  const canCu: string[] = [];
  let diem = 0; // nội bộ để xếp mức, không hiển thị

  // 1) Chất lượng Cung Phu Thê từng người.
  for (const [nhan, cung] of [["A", phuTheA], ["B", phuTheB]] as const) {
    const tenSao = cung.chinhTinh.map((s) => s.name).join(", ") || "Vô Chính Diệu";
    const sat = cung.phuTinh.filter((s) => SAT_TINH.has(s.name)).map((s) => s.name);
    let dong = `Cung Phu Thê bạn ${nhan} (${cung.chiName}): ${tenSao}`;
    if (cung.tuan || cung.triet) {
      dong += ` — có ${[cung.tuan ? "Tuần" : "", cung.triet ? "Triệt" : ""].filter(Boolean).join(" và ")} án ngữ, đường tình duyên thường chậm mà chắc, không nên vội ép tiến độ`;
      diem -= 1;
    }
    if (sat.length >= 2) {
      dong += `; tụ ${sat.length} sát tinh (${sat.join(", ")}) — đời sống hôn nhân cần chủ động giữ nhịp bình ổn`;
      diem -= 1;
    }
    canCu.push(dong + ".");
  }

  // 2) Cộng hưởng chéo Mệnh ↔ Phu Thê: A có đúng là "mẫu người" mà lá B mô tả không (và ngược lại).
  for (const [nhanNguoi, menh, nhanKia, phuTheKia] of [["A", menhA, "B", phuTheB], ["B", menhB, "A", phuTheA]] as const) {
    const trung = menh.chinhTinh.filter((s) => phuTheKia.chinhTinh.some((t) => t.name === s.name)).map((s) => s.name);
    if (trung.length > 0) {
      canCu.push(`Chính tinh Cung Mệnh bạn ${nhanNguoi} trùng với Cung Phu Thê bạn ${nhanKia} (${trung.join(", ")}) — bạn ${nhanNguoi} đúng là mẫu người mà lá số bạn ${nhanKia} "được cài sẵn" chờ gặp.`);
      diem += 2;
    }
    const qh = quanHeChiCung(menh.chiIndex, phuTheKia.chiIndex);
    if (qh === "trung") { canCu.push(`Cung Mệnh bạn ${nhanNguoi} đóng đúng chi Cung Phu Thê bạn ${nhanKia} (${CHI_TEN[menh.chiIndex]}) — cộng hưởng mạnh nhất về vị trí.`); diem += 2; }
    else if (qh === "tam_hop" || qh === "luc_hop") { diem += 1; }
    else if (qh === "xung") { canCu.push(`Cung Mệnh bạn ${nhanNguoi} xung chi với Cung Phu Thê bạn ${nhanKia} — hai hình dung về đời sống chung ban đầu khác nhau, cần thời gian để khớp.`); diem -= 1; }
  }

  // 3) Tứ Hóa giao thoa — kỹ thuật mạnh nhất của tầng: Lộc/Kỵ theo Can năm sinh người này rơi vào lá người kia.
  for (const [nhanNguoi, chart, nhanKia, chartKia] of [["A", A, "B", B], ["B", B, "A", A]] as const) {
    const cungLoc = timCungChuaSao(chartKia, chart.tuHoa.loc);
    const cungKy = timCungChuaSao(chartKia, chart.tuHoa.ky);
    if (cungLoc && (cungLoc.isMenh || cungLoc.cungName === "Phu Thê")) {
      canCu.push(`Hóa Lộc của bạn ${nhanNguoi} (${chart.tuHoa.loc}) rơi vào cung ${cungLoc.isMenh ? "Mệnh" : "Phu Thê"} bạn ${nhanKia} — bạn ${nhanNguoi} tự nhiên mang thuận lợi đến cho người kia.`);
      diem += 2;
    }
    if (cungKy && (cungKy.isMenh || cungKy.cungName === "Phu Thê")) {
      canCu.push(`Hóa Kỵ của bạn ${nhanNguoi} (${chart.tuHoa.ky}) rơi vào cung ${cungKy.isMenh ? "Mệnh" : "Phu Thê"} bạn ${nhanKia} — mối ràng buộc sâu, dễ "dính chặt" cả lúc thuận lẫn lúc nghịch; cần luận hai mặt chứ không quy hẳn về xấu.`);
      diem -= 1;
    }
  }

  const kq: { muc: TrucKetQua["muc"]; tomTat: string; dieuChinh?: string } =
    diem >= 4 ? { muc: "rat_thuan", tomTat: "Hai lá Tử Vi cộng hưởng rõ: mẫu người và vị trí cung đều khớp, Tứ Hóa mang phúc qua lại." }
    : diem >= 1 ? { muc: "thuan", tomTat: "Tầng Tử Vi thuận — có điểm cộng hưởng, các điểm cần lưu ý ở mức quản được." }
    : diem >= -2 ? {
        muc: "can_dieu_chinh",
        tomTat: "Tầng Tử Vi có điểm cần để ý (sát tinh/Tuần Triệt/Hóa Kỵ) — không phải rào cản, là chỗ cần vun thêm.",
        dieuChinh: "Đi chậm ở giai đoạn tìm hiểu, ưu tiên hiểu nếp sống của nhau trước khi quyết mốc lớn.",
      }
    : {
        muc: "can_can_nhac",
        tomTat: "Tầng Tử Vi tụ nhiều dấu hiệu cần luận kỹ cùng lúc — nên trao đổi trực tiếp với chuyên gia kèm bối cảnh thật.",
        dieuChinh: "Mang cả hai lá số đến buổi tư vấn trực tiếp; công cụ chỉ nêu dấu hiệu, không đủ bối cảnh để kết luận.",
      };

  return { ma: "tu_vi", ten: "Tử Vi — Cung Phu Thê & Tứ Hóa", muc: kq.muc, tomTat: kq.tomTat, canCu, ...(kq.dieuChinh ? { dieuChinh: kq.dieuChinh } : {}) };
}
