/**
 * HỢP HÔN BÁT TỰ × TỬ VI — cửa vào duy nhất của module.
 *
 * Kiến trúc 6 tầng (đặc tả 27/8/2026): tầng 0 sơ loại năm sinh (tái dùng nguyên module Chọn Tuổi
 * Kết Hôn), tầng 1-3+5 Bát Tự, tầng 4 Tử Vi. KHÔNG ra điểm số tổng — ra nhãn chữ 4 mức quyết bằng
 * luật, cùng bản đồ 5 trục + mức đồng thuận 2 hệ. Thuần công thức, không AI.
 */
import { calculateChonTuoiKetHon, type ChonTuoiKetHonResult } from "@thien-anh/trachnhat-engine";
import {
  lapHoSoBatTu, tinhBoKhuyet, tinhPhuThe, tinhTinhCach, tinhDongBoDaiVan,
  type HoSoBatTu, type TrucKetQua, type MucTruc,
} from "./bat-tu-tang";
import { tinhTuViHopHon } from "./tu-vi-tang";
import {
  CAU_TONG_QUAN, TEN_NHAN_TONG_QUAN, DISCLAIMER_HON_NHAN, timTuCamHonNhan, type NhanTongQuan,
} from "./bang-luat";

export type { TrucKetQua, MucTruc } from "./bat-tu-tang";
export type { NhanTongQuan } from "./bang-luat";

export interface NguoiHopHon {
  ten?: string; // tên gọi hiển thị (tuỳ chọn) — không tham gia tính toán
  day: number;
  month: number;
  year: number;
  hour?: number; // 0-23; thiếu → Bát Tự chạy chế độ tương đối, Tử Vi bỏ hẳn
  gender: "Nam" | "Nữ";
}

export interface HopHonInput {
  nguoiA: NguoiHopHon;
  nguoiB: NguoiHopHon;
  namHienTai?: number;
}

export interface TomTatLaSo {
  tuTru: string; // "Canh Ngọ · Tân Tị · Giáp Tý · Kỷ Tị"
  nhatChu: string;
  dungThan: string;
  hyThan: string;
  kyThan: string;
  gioSinhBiet: boolean;
}

export interface HopHonKetQua {
  soLoaiNamSinh: ChonTuoiKetHonResult; // tầng 0 nguyên trạng, hiển thị kèm chú thích "chỉ đọc năm sinh"
  laSoA: TomTatLaSo;
  laSoB: TomTatLaSo;
  cacTruc: TrucKetQua[]; // thứ tự cố định: bổ khuyết → phu thê → tính cách → tử vi → đại vận
  dongThuanHaiHe: { muc: "cao" | "trung" | "thap" | "chua_du_du_lieu"; moTa: string };
  nhanTongQuan: NhanTongQuan;
  tenNhanTongQuan: string;
  cauTongQuan: string;
  diemManh: string[];
  canDieuChinh: string[];
  disclaimer: string;
}

function tomTat(hs: HoSoBatTu): TomTatLaSo {
  const p = hs.chart;
  return {
    tuTru: [p.year, p.month, p.day, p.hour].map((t) => `${t.can} ${t.chi}`).join(" · "),
    nhatChu: `${p.nhatChu.can} (${p.nhatChu.nguHanh})`,
    dungThan: hs.dungThan.dungThan,
    hyThan: hs.dungThan.hyThan,
    kyThan: hs.dungThan.kyThan,
    gioSinhBiet: hs.gioSinhBiet,
  };
}

/** Gom mức 2 nhóm để so đồng thuận: thuận (rất thuận/thuận) vs cần (điều chỉnh/cân nhắc). */
function nhomMuc(m: MucTruc): "thuan" | "can" | "na" {
  if (m === "rat_thuan" || m === "thuan") return "thuan";
  if (m === "khong_du_du_lieu") return "na";
  return "can";
}

export function tinhHopHon(input: HopHonInput): HopHonKetQua {
  const namHienTai = input.namHienTai ?? new Date().getFullYear();

  // Tầng 0 — sơ loại năm sinh (module sẵn có, engine dùng "nam"/"nu").
  const soLoai = calculateChonTuoiKetHon({
    nguoi1: { namSinh: input.nguoiA.year, gioiTinh: input.nguoiA.gender === "Nam" ? "nam" : "nu" },
    nguoi2: { namSinh: input.nguoiB.year, gioiTinh: input.nguoiB.gender === "Nam" ? "nam" : "nu" },
  });

  // Hồ sơ Bát Tự 2 người.
  const A = lapHoSoBatTu(input.nguoiA);
  const B = lapHoSoBatTu(input.nguoiB);

  // Tầng 1-3, 5.
  const boKhuyet = tinhBoKhuyet(A, B).truc;
  const phuThe = tinhPhuThe(A, B);
  const tinhCach = tinhTinhCach(A, B);
  const daiVan = tinhDongBoDaiVan(A, B, namHienTai);

  // Tầng 4 — chỉ khi CẢ HAI có giờ sinh thật.
  const tuVi = tinhTuViHopHon(
    typeof input.nguoiA.hour === "number" ? { day: input.nguoiA.day, month: input.nguoiA.month, year: input.nguoiA.year, hour: input.nguoiA.hour, gender: input.nguoiA.gender } : null,
    typeof input.nguoiB.hour === "number" ? { day: input.nguoiB.day, month: input.nguoiB.month, year: input.nguoiB.year, hour: input.nguoiB.hour, gender: input.nguoiB.gender } : null,
  );

  // Nếu thiếu giờ, ghi rõ vào trục Bát Tự liên quan (dụng thần tương đối).
  if (!A.gioSinhBiet || !B.gioSinhBiet) {
    boKhuyet.canCu.push(
      "Lưu ý: có người chưa rõ giờ sinh — lá Bát Tự thiếu trụ Giờ nên Dụng Thần ở mức tương đối; bổ sung giờ sinh sẽ tăng độ chắc của tầng này.",
    );
  }

  const cacTruc = [boKhuyet, phuThe, tinhCach, tuVi, daiVan];

  // Mức đồng thuận 2 hệ: phía Bát Tự lấy 2 trục trọng tâm hôn nhân (bổ khuyết + phu thê), phía Tử Vi là trục 4.
  let dongThuanHaiHe: HopHonKetQua["dongThuanHaiHe"];
  if (tuVi.muc === "khong_du_du_lieu") {
    dongThuanHaiHe = { muc: "chua_du_du_lieu", moTa: "Chưa so được hai hệ vì tầng Tử Vi thiếu giờ sinh." };
  } else {
    const batTu = nhomMuc(boKhuyet.muc) === nhomMuc(phuThe.muc) ? nhomMuc(boKhuyet.muc) : "can";
    const tv = nhomMuc(tuVi.muc);
    dongThuanHaiHe =
      batTu === tv
        ? { muc: "cao", moTa: `Hai hệ Bát Tự và Tử Vi cùng kết luận ${batTu === "thuan" ? "thuận" : "cần chủ động điều chỉnh"} — độ tin cậy của bản đồ cao.` }
        : { muc: "trung", moTa: "Hai hệ nhìn cặp đôi này từ hai góc khác nhau và không hoàn toàn trùng kết luận — đọc từng trục thay vì tìm một câu trả lời duy nhất." };
  }

  // Nhãn tổng quan — quyết bằng LUẬT, không cộng điểm.
  const mucs = cacTruc.map((t) => t.muc).filter((m) => m !== "khong_du_du_lieu");
  const dem = (m: MucTruc) => mucs.filter((x) => x === m).length;
  let nhan: NhanTongQuan;
  if (dem("can_can_nhac") >= 2) nhan = "nen_gap_chuyen_gia";
  else if (dem("can_can_nhac") === 1 || dem("can_dieu_chinh") >= 2) nhan = "can_chu_dong_dieu_chinh";
  else if (dem("rat_thuan") >= 2 && dem("can_dieu_chinh") === 0) nhan = "rat_thuan";
  else nhan = "thuan";

  // Điểm mạnh CHỈ lấy trục thật sự nổi trội. Không có thì nói thẳng là chưa nổi bật — tuyệt đối
  // không "vơ" trục trung tính vào cho đủ mục (bản in ra từng mâu thuẫn: câu "không phải điểm mạnh"
  // lại nằm trong mục Điểm mạnh).
  const diemManh = cacTruc.filter((t) => t.muc === "rat_thuan").map((t) => t.tomTat);
  if (diemManh.length === 0) {
    const thuan = cacTruc.filter((t) => t.muc === "thuan");
    if (thuan.length >= 2)
      diemManh.push(`Không có tầng nào nổi trội hẳn, nhưng ${thuan.length} tầng ở mức thuận và không tầng nào cản trở — nền chung ổn định.`);
    else diemManh.push("Bản đồ lần này chưa có tầng nào nổi trội hẳn — điểm mạnh của cặp sẽ đến từ cách hai bạn vun đắp nhiều hơn là từ lá số.");
  }
  const canDieuChinh = cacTruc.filter((t) => t.dieuChinh).map((t) => t.dieuChinh!);

  const kq: HopHonKetQua = {
    soLoaiNamSinh: soLoai,
    laSoA: tomTat(A),
    laSoB: tomTat(B),
    cacTruc,
    dongThuanHaiHe,
    nhanTongQuan: nhan,
    tenNhanTongQuan: TEN_NHAN_TONG_QUAN[nhan],
    cauTongQuan: CAU_TONG_QUAN[nhan],
    diemManh,
    canDieuChinh,
    disclaimer: DISCLAIMER_HON_NHAN,
  };

  // Lưới an toàn cuối: quét từ cấm trên MỌI chuỗi sẽ hiển thị. Câu mẫu là của mình nhưng bảng có
  // thể bị sửa sau này — vi phạm thì thay bằng câu trung tính, không bao giờ để lọt ra ngoài.
  const lamSach = (s: string): string =>
    timTuCamHonNhan(s).length > 0 ? "Nội dung mục này cần chuyên gia trao đổi trực tiếp." : s;
  for (const t of kq.cacTruc) {
    t.tomTat = lamSach(t.tomTat);
    t.canCu = t.canCu.map(lamSach);
    if (t.dieuChinh) t.dieuChinh = lamSach(t.dieuChinh);
  }
  kq.diemManh = kq.diemManh.map(lamSach);
  kq.canDieuChinh = kq.canDieuChinh.map(lamSach);

  return kq;
}
