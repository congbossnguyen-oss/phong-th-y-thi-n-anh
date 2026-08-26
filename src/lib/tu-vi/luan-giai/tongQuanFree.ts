// TẦNG FREE — luận giải sơ bộ hiện ngay dưới lá số, THUẦN CODE (không gọi AI).
//
// Nguồn: SPEC.md mục "Chi tiết Tầng Free" (Bước 1-2 của quy trình 8 bước) + data/tong-luan.md.
// Chủ ý: viết vừa đủ để khách thấy lá số mình "có chuyện để nói", rồi dẫn sang gói Cơ Bản —
// KHÔNG luận sâu 12 cung ở đây (đó là nội dung thu phí).
//
// Vì sao không dùng AI ở tầng này: free thì mỗi lượt lập lá số đều chạy, gọi AI sẽ tốn chi phí
// không kiểm soát; hơn nữa nội dung Bước 1-2 vốn là tra bảng thuần nên code làm được trọn vẹn.

import type { TuViChart } from "../engine";
import { chamDiemLaSo, nhanDiem, type KetQuaChamDiem } from "./chamDiem";

type NguHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

const SINH: Record<NguHanh, NguHanh> = {
  Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc",
};
const KHAC: Record<NguHanh, NguHanh> = {
  Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc",
};

export type QuanHeMenhCuc = "Sinh Nhập" | "Sinh Xuất" | "Khắc Nhập" | "Khắc Xuất" | "Bình Hòa";

/** Quan hệ Mệnh - Cục theo data/tong-luan.md Bước 1. "Nhập" = hướng về Mệnh (được), "Xuất" = Mệnh cho đi. */
export function quanHeMenhCuc(hanhMenh: NguHanh, hanhCuc: NguHanh): QuanHeMenhCuc {
  if (hanhMenh === hanhCuc) return "Bình Hòa";
  if (SINH[hanhMenh] === hanhCuc) return "Sinh Xuất";
  if (SINH[hanhCuc] === hanhMenh) return "Sinh Nhập";
  if (KHAC[hanhMenh] === hanhCuc) return "Khắc Xuất";
  if (KHAC[hanhCuc] === hanhMenh) return "Khắc Nhập";
  return "Bình Hòa";
}

const DIEN_GIAI_MENH_CUC: Record<QuanHeMenhCuc, string> = {
  "Sinh Nhập": "Cục sinh cho Mệnh — nền tảng và hoàn cảnh nâng đỡ bản thân, việc gì cũng có chỗ dựa, đỡ phải gắng sức một mình.",
  "Sinh Xuất": "Mệnh sinh cho Cục — bản thân là người cho đi, hay phải gánh vác và vun vén cho người khác, thành quả thường đến muộn hơn công sức bỏ ra.",
  "Khắc Nhập": "Cục khắc Mệnh — hoàn cảnh thường tạo sức ép lên bản thân, đường đời nhiều thử thách nhưng cũng vì thế mà bản lĩnh được tôi luyện.",
  "Khắc Xuất": "Mệnh khắc Cục — bản thân chủ động chế ngự hoàn cảnh, có chí hướng và thích tự quyết, song dễ hao tâm tổn sức vì ôm đồm.",
  "Bình Hòa": "Mệnh và Cục cùng hành, bình hòa — cuộc đời ít sóng gió cực đoan, phát triển đều, không quá thuận cũng không quá nghịch.",
};

/** Lấy ngũ hành của Cục từ tên cục ("Thủy Nhị Cục" → "Thủy"). */
function hanhCuaCuc(cucName: string): NguHanh | null {
  for (const h of ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"] as NguHanh[]) {
    if (cucName.startsWith(h)) return h;
  }
  return null;
}

function hanhCuaMenh(banMenhElement: string): NguHanh | null {
  for (const h of ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"] as NguHanh[]) {
    if (banMenhElement.includes(h)) return h;
  }
  return null;
}

export type MucCuongNhuoc = "Cường" | "Trung bình" | "Nhược";

function cuongNhuoc(diem: number): MucCuongNhuoc {
  if (diem >= 4) return "Cường";
  if (diem <= 2) return "Nhược";
  return "Trung bình";
}

/** Bảng tương quan Mệnh - Thân (data/tong-luan.md Bước 2.1). */
function luanMenhThan(menh: MucCuongNhuoc, than: MucCuongNhuoc): string {
  if (menh === "Cường" && than === "Cường") return "Mệnh và Thân đều vững — xứng ý toại lòng, đường đời nhìn chung cát lợi.";
  if (menh === "Cường" && than === "Nhược") return "Mệnh vững nhưng Thân yếu — có thành công, song khó tạo được đột phá lớn.";
  if (menh === "Nhược" && than === "Cường") return "Mệnh yếu nhưng Thân vững — có ý chí vươn lên mạnh mẽ, tuy nhiên thành quả đến chậm và phải trả giá.";
  if (menh === "Nhược" && than === "Nhược") return "Cả Mệnh lẫn Thân đều chưa vững — đường đời nhiều trắc trở, cần đặc biệt chú trọng tu dưỡng và chọn đúng thời điểm.";
  return "Mệnh và Thân ở mức trung bình — cuộc đời có thăng có trầm, phần lớn kết quả tùy vào lựa chọn và nỗ lực của chính mình.";
}

export type MucFree = { tieuDe: string; noiDung: string };

export type KetQuaTongQuanFree = {
  /** Tên cung Mệnh đóng (theo địa chi) và chính tinh tại đó. */
  menhTaiChi: string;
  thanTaiCung: string;
  diemMenh: number;
  diemThan: number;
  cuongNhuocMenh: MucCuongNhuoc;
  cuongNhuocThan: MucCuongNhuoc;
  quanHeMenhCuc: QuanHeMenhCuc;
  amDuongThuanLy: boolean;
  muc: MucFree[];
  /** Câu chốt cuối, dẫn sang gói trả phí. */
  cauChot: string;
  chamDiem: KetQuaChamDiem;
};

function moTaChinhTinh(ds: { name: string; trangThai: string }[]): string {
  if (ds.length === 0) return "Vô Chính Diệu (không có chính tinh)";
  return ds.map((s) => `${s.name} (${s.trangThai})`).join(", ");
}

/**
 * Dựng phần luận giải sơ bộ miễn phí. Ngắn gọn có chủ đích — đây là phần "mồi", nội dung sâu
 * (đủ 12 cung, vận hạn) nằm ở gói Cơ Bản / Nâng Cao.
 */
export function tongQuanFree(chart: TuViChart): KetQuaTongQuanFree {
  const cham = chamDiemLaSo(chart);
  const cungMenh = chart.cungs.find((c) => c.isMenh);
  const cungThan = chart.cungs.find((c) => c.isThan);

  const diemMenh = cham.chiTiet.find((c) => c.chiIndex === chart.menhChiIndex)?.diem ?? 3;
  const diemThan = cham.chiTiet.find((c) => c.chiIndex === chart.thanChiIndex)?.diem ?? 3;
  const cnMenh = cuongNhuoc(diemMenh);
  const cnThan = cuongNhuoc(diemThan);

  const hMenh = hanhCuaMenh(chart.banMenhElement);
  const hCuc = hanhCuaCuc(chart.cucName);
  const qhMC = hMenh && hCuc ? quanHeMenhCuc(hMenh, hCuc) : "Bình Hòa";

  // Âm Dương thuận lý: tuổi Dương cư Dương vị (chi chẵn), tuổi Âm cư Âm vị (chi lẻ).
  const tuoiDuong = chart.amDuongNam.startsWith("Dương");
  const viDuong = chart.menhChiIndex % 2 === 0;
  const thuanLy = tuoiDuong === viDuong;

  const dongCung = chart.menhChiIndex === chart.thanChiIndex;

  const muc: MucFree[] = [
    {
      tieuDe: "Bản Mệnh và Cục",
      noiDung:
        `Bản mệnh ${chart.banMenhNapAm} (hành ${chart.banMenhElement}), ${chart.cucName}. ` +
        `Xét quan hệ Mệnh – Cục thì đây là ${qhMC}: ${DIEN_GIAI_MENH_CUC[qhMC]}`,
    },
    {
      tieuDe: "Cung Mệnh",
      noiDung:
        `Mệnh an tại ${cungMenh?.chiName ?? "—"}, có ${moTaChinhTinh(cungMenh?.chinhTinh ?? [])}. ` +
        `Chấm theo Tam Phương Tứ Chính được ${diemMenh}/5 — ${nhanDiem(diemMenh)}. ` +
        `Cung Mệnh là phần "cuộc đời lý thuyết", chi phối rõ nhất giai đoạn trước 30 tuổi.`,
    },
    {
      tieuDe: "Cung Thân",
      noiDung: dongCung
        ? `Thân đồng cung với Mệnh — thuộc mẫu người tin vào số phận, tính cách nhất quán trước sau, ít bị hoàn cảnh làm lệch hướng. Điểm cung ${diemThan}/5 — ${nhanDiem(diemThan)}.`
        : `Thân cư cung ${cungThan?.cungName ?? "—"} (tại ${cungThan?.chiName ?? "—"}), có ${moTaChinhTinh(cungThan?.chinhTinh ?? [])}. ` +
          `Điểm cung ${diemThan}/5 — ${nhanDiem(diemThan)}. Thân là "cuộc đời thực tế", ảnh hưởng mạnh sau 30 tuổi, ` +
          `và cho biết lĩnh vực nào sẽ là sân chơi chính của đời người này.`,
    },
    {
      tieuDe: "Tương quan Mệnh – Thân",
      noiDung: `${luanMenhThan(cnMenh, cnThan)} ${
        thuanLy
          ? "Ngoài ra tuổi và vị trí cung Mệnh thuận lý Âm Dương — một dấu hiệu thuận lợi nền tảng."
          : "Lưu ý thêm: tuổi và vị trí cung Mệnh nghịch lý Âm Dương — làm việc gì cũng nên tính kỹ hơn người khác một bước."
      }`,
    },
  ];

  const soCungTot = Object.values(cham.diem12Cung).filter((d) => d >= 4).length;
  const cungManhNhat = [...cham.chiTiet].sort((a, b) => b.diem - a.diem)[0];
  const cungCanLuuY = [...cham.chiTiet].sort((a, b) => a.diem - b.diem)[0];
  const cauChot =
    `Trên toàn lá số có ${soCungTot}/12 cung đạt mức tốt trở lên, trong đó nổi bật nhất là cung ` +
    `${cungManhNhat?.cungName ?? "—"}; cung cần lưu tâm hơn cả là ${cungCanLuuY?.cungName ?? "—"}. ` +
    `Đây mới là phần nền của lá số — mỗi cung còn nói rất nhiều về học vấn, sự nghiệp, tiền bạc, ` +
    `hôn nhân và sức khỏe mà chỉ đọc riêng Mệnh với Thân thì chưa thấy được.`;

  return {
    menhTaiChi: cungMenh?.chiName ?? "—",
    thanTaiCung: dongCung ? "Đồng cung với Mệnh" : (cungThan?.cungName ?? "—"),
    diemMenh,
    diemThan,
    cuongNhuocMenh: cnMenh,
    cuongNhuocThan: cnThan,
    quanHeMenhCuc: qhMC,
    amDuongThuanLy: thuanLy,
    muc,
    cauChot,
    chamDiem: cham,
  };
}
