/**
 * PHIẾU PDF — Định Hướng Nghề Nghiệp (Bát Tự × Tử Vi). Dựng từ `NgheKetQua` (đã tính sẵn), dùng
 * khung PDF chung `pdf-khung.ts`. Bản khách nhận qua email sau khi thanh toán — TRẢ ĐỦ TẤT CẢ MỤC.
 */
import { taoTaiLieuPdf, veDauTrang, veLuuYVaLienHe, veChanTrang, MAU, LE, type But, type Fonts } from "./pdf-khung";
import type { NgheKetQua } from "../nghe-nghiep/tao-ho-so-nghe";
import type { DashboardVM } from "../nghe-nghiep/view-model";

const TRUC_LABEL: Record<string, string> = {
  specialist: "Chuyên môn sâu",
  authority: "Quyền uy / quản lý nhà nước",
  management: "Quản trị / điều hành",
  business: "Kinh doanh / thương mại",
  investment: "Đầu tư / tài chính",
};
const DOMAIN_LABEL: Record<string, string> = {
  economics_finance: "Kinh tế – Tài chính", management_business: "Quản trị – Kinh doanh",
  technology_engineering: "Công nghệ – Kỹ thuật", science_research: "Khoa học – Nghiên cứu",
  health_medicine: "Y – Dược – Sức khỏe", law_policy_social: "Luật – Chính sách – Xã hội",
  media_language: "Truyền thông – Ngôn ngữ", education_consulting: "Giáo dục – Tư vấn",
  arts_design: "Nghệ thuật – Thiết kế", real_estate_assets: "Bất động sản – Tài sản",
};

function veChips(b: But, f: Fonts, vm: DashboardVM): void {
  for (const c of vm.chips) b.dong(`• ${c.label}: ${c.value}`, { size: 9.5, x: LE + 12 });
}

function veVector(b: But, f: Fonts, vm: DashboardVM): void {
  if (!vm.vector) {
    b.doan(vm.vectorDetail || "Chưa đủ dữ liệu để dựng 5 trục năng lực.", { size: 9, font: f.nghieng, mau: MAU.mucNhat, x: LE + 12 });
    return;
  }
  const rows = Object.entries(vm.vector).sort((a, z) => z[1] - a[1]);
  for (const [k, v] of rows) {
    b.dong(`• ${TRUC_LABEL[k] ?? k}: ${Math.round(v * 10) / 10}`, { size: 9.5, x: LE + 12 });
  }
}

function veNhomNganh(b: But, f: Fonts, vm: DashboardVM): void {
  if (vm.domainInsufficient) {
    b.doan(vm.domainDetail || "Chưa đủ dữ liệu để chấm điểm ngành.", { size: 9, font: f.nghieng, mau: MAU.mucNhat, x: LE + 12 });
    return;
  }
  const nhom = (nhan: string, ds: { label: string; majors: { name: string }[] }[]) => {
    if (ds.length === 0) return;
    b.dong(nhan, { size: 9.5, font: f.vua, x: LE + 12 });
    for (const d of ds) {
      const majors = d.majors.slice(0, 3).map((m) => m.name).join(", ");
      b.doan(`• ${d.label}${majors ? ` — ${majors}` : ""}`, { size: 9, x: LE + 24 });
    }
  };
  nhom("Nên ưu tiên:", vm.priority);
  nhom("Phù hợp:", vm.suitable);
  nhom("Có thể cân nhắc:", vm.possible);
}

function veTimeline(b: But, f: Fonts, vm: DashboardVM): void {
  if (vm.timeline.length === 0) return;
  b.dong(vm.timelineTitle, { size: 9.5, font: f.vua, x: LE + 12 });
  for (const seg of vm.timeline) {
    b.doan(`• ${seg.tuTuoi}–${seg.denTuoi} tuổi (${seg.top}): ${seg.chuDe}${seg.badge?.label ? ` [${seg.badge.label}]` : ""}`, { size: 9, x: LE + 24 });
  }
}

export async function generateNghePdf(kq: NgheKetQua): Promise<Uint8Array> {
  const { doc, f, b } = await taoTaiLieuPdf();
  await veDauTrang(doc, b, f, {
    tieuDe: "Định hướng nghề nghiệp",
    phuDe: "Kết hợp hai hệ Bát Tự × Tử Vi",
  });

  // --- Hồ sơ lá số ---
  b.muc("Hồ sơ lá số Bát Tự");
  veChips(b, f, kq.batTuVM);
  b.muc("Hồ sơ lá số Tử Vi");
  veChips(b, f, kq.tuViVM);

  // --- Bát Tự ---
  b.muc("Bát Tự — 5 trục năng lực nghề");
  veVector(b, f, kq.batTuVM);
  b.xuong(2);
  b.dong(`Xu hướng: ${kq.batTuVM.axisKetLuan}`, { size: 9.5, font: f.vua, x: LE + 12 });
  b.muc("Bát Tự — nhóm ngành nên theo");
  veNhomNganh(b, f, kq.batTuVM);
  b.muc("Bát Tự — các giai đoạn vận");
  veTimeline(b, f, kq.batTuVM);

  // --- Tử Vi ---
  b.muc("Tử Vi — 5 trục năng lực nghề");
  veVector(b, f, kq.tuViVM);
  b.xuong(2);
  b.dong(`Xu hướng: ${kq.tuViVM.axisKetLuan}`, { size: 9.5, font: f.vua, x: LE + 12 });
  b.muc("Tử Vi — nhóm ngành nên theo");
  veNhomNganh(b, f, kq.tuViVM);
  b.muc("Tử Vi — các giai đoạn vận");
  veTimeline(b, f, kq.tuViVM);

  // --- Kết hợp ---
  const kh = kq.ketHop;
  b.muc("Mức đồng thuận Bát Tự × Tử Vi");
  if (kh.insufficient) {
    b.doan(kh.ketLuanNgan, { size: 9.5 });
  } else {
    b.dong(`Đồng thuận: ${kh.agreement}% — ${kh.bac === "cao" ? "CAO (hai hệ hội tụ)" : kh.bac === "trung" ? "TRUNG BÌNH (đồng thuận một phần)" : "THẤP (hai hệ phân kỳ)"}`, { size: 11, font: f.dam, mau: MAU.son });
    b.doan(kh.ketLuanNgan, { size: 9.5 });
    b.dong(`Trùng 5 trục: ${kh.thanhPhan.trung5Truc}%  ·  Trùng hướng: ${kh.thanhPhan.trungHuongQK}%  ·  Trùng ngành: ${kh.thanhPhan.trungNganh}%`, { size: 9, mau: MAU.mucNhat, x: LE + 12 });
    if (kh.nganhHopNhat.length > 0) {
      b.doan(`Ngành cả hai hệ cùng đề xuất: ${kh.nganhHopNhat.map((d) => DOMAIN_LABEL[d] ?? d).join(", ")}`, { size: 9.5, font: f.vua, x: LE + 12 });
    }
    if (kh.docTheoTang) {
      b.xuong(4);
      b.dong("Đọc theo tầng (khi hai hệ khác hướng):", { size: 9.5, font: f.vua, x: LE + 12 });
      b.doan(`Bát Tự — ${kh.docTheoTang.batTu}`, { size: 9, x: LE + 24 });
      b.doan(`Tử Vi — ${kh.docTheoTang.tuVi}`, { size: 9, x: LE + 24 });
      b.doan(`Lộ trình bắc cầu: ${kh.docTheoTang.loTrinh}`, { size: 9.5, font: f.vua, x: LE + 24 });
    }
  }

  veLuuYVaLienHe(
    b,
    f,
    "Đây là định hướng theo mô hình phân tích cấu trúc lá số (Bát Tự & Tử Vi) — không phải lời tiên đoán " +
      "hay sự sắp đặt chắc chắn của số mệnh. Kết quả mang tính tham khảo, nên kết hợp với năng lực, sở thích " +
      "và điều kiện thực tế của bản thân.",
  );
  veChanTrang(doc, f);
  return doc.save();
}
