/**
 * XEM NGÀY CAO CẤP — Bước 4: quy Tứ Trụ (Năm/Tháng/Ngày/Giờ) + Tọa nhà + năm sinh Mệnh Chủ về
 * cặp số HKNH/Quái Vận. Nguồn: bang-60-giap-ty-64-que.md + bang64QueDoSo.ts.
 *
 * Tọa/Hướng nhà quy về quẻ theo ĐỘ SỐ LA BÀN (vòng 64 quẻ, 5.625°/quẻ) — không quy theo tên sơn,
 * vì mỗi sơn 15° chứa 2-3 quẻ khác nhau (xem chú thích hàm `quyDoSoVeQueToa` bên dưới).
 */
import { traCanChi, traTheoTenQue, type QueHknhQuaiVan } from "./data/bang60GiapTy.js";
import { queTuDoSo } from "./data/bang64QueDoSo.js";
import type { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

/** Quy 1 trụ Can Chi về (các) cặp HKNH/Quái Vận khả dĩ. Đa số Can Chi chỉ có 1 kết quả; riêng
 * Giáp Tý/Giáp Ngọ/Canh Dần/Canh Thân có 2 — tầng gọi (Bước 5) phải thử cả 2 và chọn quẻ tạo
 * cách cục hợp lệ, ghi rõ đã chọn quẻ nào (theo đúng hướng dẫn nguồn, không tự ý chọn 1 bên). */
export function quyTruVeQue(can: Can, chi: Chi): readonly QueHknhQuaiVan[] {
  return traCanChi(can, chi);
}

export interface QueToaTheoDoSo extends QueHknhQuaiVan {
  /** Tên ngắn như đọc trên la kinh, VD "Tổn". */
  tenNgan: string;
  thuTu: number;
  doBatDau: number;
  doKetThuc: number;
}

/**
 * Quy Tọa (hoặc Hướng) nhà về quẻ + cặp HKNH/Quái Vận TỪ ĐỘ SỐ LA BÀN THỰC ĐO.
 *
 * ⚠️ BẮT BUỘC dùng độ số, KHÔNG dùng tên sơn: trong Huyền Không Đại Quái mỗi sơn (15°) chứa tới
 * 2-3 quẻ khác nhau (vòng 64 quẻ, mỗi quẻ 5.625°), nên tên sơn không đủ phân giải. Chứng cứ ngay
 * trong nguồn (`vi-du-thuc-hanh.md`): cùng "tọa Ất" nhưng Bài 1 ra quẻ Tổn 6/9 (97.5-101.25°)
 * còn Bài 3 ra quẻ Tiết 7/8 (101.25-106.875°).
 *
 * Trước 2026-08-15 module bắt người dùng tự nhập cặp HKNH/Quái Vận vì bảng 64 quẻ phối độ số chưa
 * được số hóa; nay đã có (`data/bang64QueDoSo.ts`, do Công cung cấp + đã kiểm chứng chéo với cả 5
 * bài thực hành) nên suy trực tiếp được, bỏ hẳn khâu nhập tay.
 */
export function quyDoSoVeQueToa(doSo: number): QueToaTheoDoSo {
  const que = queTuDoSo(doSo);
  const soLieu = traTheoTenQue(que.tenDayDu);
  return {
    ...soLieu,
    tenNgan: que.tenNgan,
    thuTu: que.thuTu,
    doBatDau: que.doBatDau,
    doKetThuc: que.doKetThuc,
  };
}
