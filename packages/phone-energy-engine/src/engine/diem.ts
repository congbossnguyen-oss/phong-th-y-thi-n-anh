/**
 * Card điểm tổng quan.
 *
 * ⚠️ NGUỒN GỐC KHÁC VỚI PHẦN CÒN LẠI CỦA ENGINE: hệ điểm này KHÔNG có trong tài liệu Bát Cực Linh
 * Số. Đây là thiết kế riêng theo SPEC mục 4 do chủ dự án đưa, để hiển thị một con số tóm tắt cho
 * khách. Trọng số vì thế để ở `TRONG_SO_MAC_DINH` dạng config, chỉnh được mà không phải sửa logic.
 *
 * Ngưỡng nhãn 80/65/50/35 đã được chủ dự án chốt 2026-08-17.
 */
import { chuoiHungDaiNhat } from "./bo3So.js";
import type { CanhBao, CapDo, KetQuaCap, ScoreCard } from "../types.js";

export interface TrongSoDiem {
  diemNen: number;
  tamCatHoiTu: number;
  tyLeCatHung: number;
  nangLuongDuoi: number;
  chuoiHungKhongHoaGiai: number;
  hoTroCccd: number;
  moiCanhBao: number;
  toiDaTruCanhBao: number;
}

export const TRONG_SO_MAC_DINH: TrongSoDiem = {
  diemNen: 50,
  tamCatHoiTu: 25,
  tyLeCatHung: 25,
  nangLuongDuoi: 25,
  chuoiHungKhongHoaGiai: -15,
  hoTroCccd: 10,
  moiCanhBao: -10,
  toiDaTruCanhBao: -20,
};

/** Trọng số của từng cấp độ khi quy năng lượng ra điểm — cấp 1 mạnh nhất. */
const HE_SO_CAP: Readonly<Record<CapDo, number>> = { 1: 1, 2: 0.75, 3: 0.5, 4: 0.35 };

export const NGUONG_NHAN: readonly { tuDiem: number; nhan: string }[] = [
  { tuDiem: 80, nhan: "Năng lượng rất tốt" },
  { tuDiem: 65, nhan: "Năng lượng tốt" },
  { tuDiem: 50, nhan: "Ở mức trung bình" },
  { tuDiem: 35, nhan: "Cần lưu ý" },
  { tuDiem: 0, nhan: "Nên cân nhắc đổi số" },
];

export function nhanTheoDiem(diem: number): string {
  return NGUONG_NHAN.find((n) => diem >= n.tuDiem)?.nhan ?? "Nên cân nhắc đổi số";
}

const lamTron = (n: number) => Math.round(n * 10) / 10;

export function tinhDiemTongQuan(params: {
  capGoc: KetQuaCap[];
  capTrongDuoi: KetQuaCap[];
  canhBao: CanhBao[];
  coHoTroCccd: boolean;
  trongSo?: TrongSoDiem;
}): ScoreCard {
  const w = params.trongSo ?? TRONG_SO_MAC_DINH;
  const { capGoc, capTrongDuoi, canhBao } = params;
  const thanhPhan: ScoreCard["thanhPhan"] = [];
  let diem = w.diemNen;
  thanhPhan.push({ ten: "Điểm nền", diem: w.diemNen, ghiChu: "Mốc trung tính trước khi cộng trừ." });

  // 1. Tam cát tinh hội tụ.
  const coMat = new Set(capGoc.map((c) => c.ten));
  const hoiTu = ["Sinh Khí", "Thiên Y", "Diên Niên"].every((t) => coMat.has(t as never));
  if (hoiTu) {
    diem += w.tamCatHoiTu;
    thanhPhan.push({
      ten: "Tam cát tinh hội tụ",
      diem: w.tamCatHoiTu,
      ghiChu: "Có đủ cả Sinh Khí, Thiên Y và Diên Niên — cách cục hiếm.",
    });
  }

  // 2. Tỷ lệ cát/hung sau khi áp Cơ chế A. Hung đã được hoá giải tính như cát.
  if (capGoc.length > 0) {
    const soCat = capGoc.filter((c) => c.catHung === "cát" || c.daHoaGiai).length;
    const tyLe = soCat / capGoc.length;
    const d = lamTron((tyLe - 0.5) * 2 * w.tyLeCatHung);
    diem += d;
    thanhPhan.push({
      ten: "Tỷ lệ cát / hung toàn dãy",
      diem: d,
      ghiChu: `${soCat} trên ${capGoc.length} cặp là cát (đã tính phần được hoá giải).`,
    });
  }

  // 3. Năng lượng ở 3 số đuôi — chỗ quyết định kết cục.
  if (capTrongDuoi.length > 0) {
    let tong = 0;
    for (const c of capTrongDuoi) {
      const heSo = HE_SO_CAP[c.capDo];
      // Phục Vị là cát nhưng trung tính, không kéo điểm lên như ba cát tinh kia.
      const huong = c.ten === "Phục Vị" ? 0.2 : c.catHung === "cát" ? 1 : -1;
      tong += huong * heSo;
    }
    const trungBinh = tong / capTrongDuoi.length;
    const d = lamTron(trungBinh * w.nangLuongDuoi);
    diem += d;
    thanhPhan.push({
      ten: "Năng lượng ba số đuôi",
      diem: d,
      ghiChu: capTrongDuoi.map((c) => `${c.capGoc.cap} ${c.ten}`).join(", "),
    });
  }

  // 4. Chuỗi hung tinh liên tiếp chưa hoá giải được.
  const chuoi = chuoiHungDaiNhat(capGoc);
  if (chuoi >= 2) {
    diem += w.chuoiHungKhongHoaGiai;
    thanhPhan.push({
      ten: "Chuỗi hung tinh liên tiếp",
      diem: w.chuoiHungKhongHoaGiai,
      ghiChu: `Có ${chuoi} cặp hung tinh liền nhau mà không có cát tinh đủ mạnh hoá giải.`,
    });
  }

  // 5. Mức hỗ trợ từ CCCD (Cơ chế B) — chỉ tính khi khách có nhập căn cước.
  if (params.coHoTroCccd) {
    diem += w.hoTroCccd;
    thanhPhan.push({
      ten: "Số điện thoại hỗ trợ được căn cước",
      diem: w.hoTroCccd,
      ghiChu: "Số điện thoại có sẵn cát tinh hoá giải được hung tinh trong căn cước.",
    });
  }

  // 6. Cảnh báo đặc biệt.
  if (canhBao.length > 0) {
    const d = Math.max(w.toiDaTruCanhBao, canhBao.length * w.moiCanhBao);
    diem += d;
    thanhPhan.push({
      ten: "Cảnh báo đặc biệt",
      diem: d,
      ghiChu: canhBao.map((c) => c.tieuDe).join("; "),
    });
  }

  const cuoi = Math.max(0, Math.min(100, Math.round(diem)));
  return { diem: cuoi, nhan: nhanTheoDiem(cuoi), thanhPhan };
}
