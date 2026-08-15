/**
 * XEM NGÀY CAO CẤP — Bước 4: quy Tứ Trụ (Năm/Tháng/Ngày/Giờ) + Tọa nhà + năm sinh Mệnh Chủ về
 * cặp số HKNH/Quái Vận. Nguồn: bang-60-giap-ty-64-que.md.
 *
 * Tọa nhà quy về quẻ Bát Thuần theo CUNG (8 cung → 8 quẻ Bát Thuần) — đây là mức chi tiết mà
 * SKILL.md mô tả cho Bước 4 (không đi sâu tới hệ 384 hào/0.9375° từng phân kim, thuộc phạm vi
 * skill `huyen-khong-dai-quai` riêng, không phải skill `xem-ngay-cao-cap` này).
 */
import { traCanChi, type QueHknhQuaiVan } from "./data/bang60GiapTy.js";
import type { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

/** Quy 1 trụ Can Chi về (các) cặp HKNH/Quái Vận khả dĩ. Đa số Can Chi chỉ có 1 kết quả; riêng
 * Giáp Tý/Giáp Ngọ/Canh Dần/Canh Thân có 2 — tầng gọi (Bước 5) phải thử cả 2 và chọn quẻ tạo
 * cách cục hợp lệ, ghi rõ đã chọn quẻ nào (theo đúng hướng dẫn nguồn, không tự ý chọn 1 bên). */
export function quyTruVeQue(can: Can, chi: Chi): readonly QueHknhQuaiVan[] {
  return traCanChi(can, chi);
}

/**
 * ⚠️ KHÔNG CÓ hàm quy Tọa sơn → quẻ trong module này, và đây là quyết định có chủ đích:
 *
 * Trong Huyền Không Đại Quái, mỗi sơn (15°) còn chia nhỏ thành nhiều quẻ theo hệ 384 hào
 * (~0.9375°/hào), nên TÊN SƠN KHÔNG ĐỦ để xác định quẻ tọa — phải có ĐỘ SỐ la bàn chính xác rồi
 * tra bảng 384 hào. Chứng cứ ngay trong nguồn (`vi-du-thuc-hanh.md`): cùng là tọa **Ất** nhưng
 * Bài 1 ghi quẻ 6/9 còn Bài 3 ghi 7/8 — hai quẻ khác nhau cho cùng một tên sơn.
 *
 * Bảng tra 384 hào hiện CHƯA ĐƯỢC SỐ HÓA (skill `huyen-khong-dai-quai` chỉ có ảnh la kinh
 * `assets/la-kinh-384-hao-tam-nguyen.jpg`, chưa trích thành dữ liệu). Vì vậy tầng trên PHẢI nhận
 * cặp HKNH/Quái Vận của quẻ tọa TRỰC TIẾP TỪ NGƯỜI DÙNG (người đo la kinh 64 quẻ sẽ đọc được),
 * tuyệt đối không suy đoán từ tên sơn — suy đoán ở đây sẽ làm sai lệch toàn bộ Bước 5.
 */
export const GHI_CHU_TOA_QUE =
  "Quẻ tọa phải lấy từ la kinh 64 quẻ (hệ 384 hào) theo độ số thực đo — không suy ra được từ tên sơn.";
