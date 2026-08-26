import type { APIRoute } from "astro";
import { getOrderByCode } from "../../../../lib/db/orders";
import { jsonResponse, TOOL_SLUG, type KyMonHoiDapInput } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { traTinhHuong, QUAN_HE_LABELS, type QuanHeCauHoi } from "../../../../lib/kymon/danhMucCauHoi";
import { lapLaBan } from "../../../../lib/kymon";
import type { LapLaBanResult } from "../../../../lib/kymon";
import { luanHoiDapTaiChinh } from "../../../../lib/kymon/hoiDapTaiChinh";
import { luanHoiDapTinhCam } from "../../../../lib/kymon/hoiDapTinhCam";
import { luanHoiDapCongViec } from "../../../../lib/kymon/hoiDapCongViec";
import { luanHoiDapHocHanh } from "../../../../lib/kymon/hoiDapHocHanh";
import { luanHoiDapDiLai } from "../../../../lib/kymon/hoiDapDiLai";
import { luanHoiDapTimKiem } from "../../../../lib/kymon/hoiDapTimKiem";
import { luanHoiDapThoiTiet } from "../../../../lib/kymon/hoiDapThoiTiet";
import { luanHoiDapPhapLy } from "../../../../lib/kymon/hoiDapPhapLy";
import { luanHoiDapSucKhoe } from "../../../../lib/kymon/hoiDapSucKhoe";
import { luanHoiDapPhongThuy } from "../../../../lib/kymon/hoiDapPhongThuy";

export const prerender = false;

/** Kết quả luận chung cho mọi chủ đề Hỏi Đáp đã có luật — mỗi module chủ đề tự định nghĩa kiểu
 * riêng nhưng luôn cùng 1 shape {hopLe, xuHuong, vanBan, chiTiet} nên gộp được vào đây. */
type KetQuaChung = { hopLe: boolean; xuHuong: string; vanBan: string; chiTiet: string };

/** Đăng ký hàm luận theo chủ đề — thêm 1 dòng khi có luật mới cho chủ đề khác. Chữ ký chung nhận
 * cả quanHe (dùng cho Học Hành/Tìm Kiếm — "hỏi cho ai") và thongTinBoSung (dùng cho Đi Lại —
 * nhận diện phương tiện) dù không phải hàm nào cũng dùng hết — JS bỏ qua tham số thừa. Tất cả
 * 10/10 chủ đề đã có ít nhất 1 tình huống có luật (Phong Thủy chỉ 1/2 — "chọn hướng đặt vật" vẫn
 * chưa đủ nguồn rõ ràng, hàm trả null cho tình huống đó, tự rơi về "đang cập nhật").*/
const LUAN_THEO_CHU_DE: Record<
  string,
  (laBan: LapLaBanResult, tinhHuongId: string, quanHe: QuanHeCauHoi, thongTinBoSung: string) => KetQuaChung | null
> = {
  tai_chinh: luanHoiDapTaiChinh,
  tinh_cam: luanHoiDapTinhCam,
  cong_viec: luanHoiDapCongViec,
  hoc_hanh: luanHoiDapHocHanh,
  di_lai: luanHoiDapDiLai,
  tim_kiem: luanHoiDapTimKiem,
  thoi_tiet: luanHoiDapThoiTiet,
  phap_ly: luanHoiDapPhapLy,
  suc_khoe: luanHoiDapSucKhoe,
  phong_thuy: luanHoiDapPhongThuy,
};

/**
 * Endpoint POLL trạng thái đơn cho luồng thanh toán INLINE ngay trên /lap-ky-mon (không có trang
 * kết quả riêng như ky-mon-menh-chi-tiet — câu trả lời hiện thẳng bên dưới mục hỏi đáp).
 *
 * Nội dung luận giải tự động MỚI CÓ cho các chủ đề trong LUAN_THEO_CHU_DE ở trên. Các chủ đề còn
 * lại CHƯA có luật (xem ghi chú trong checkout.ts) — khi đơn đã xác nhận mà chủ đề chưa có luật,
 * trả về "dangCapNhat: true" kèm echo lại câu hỏi để trang hiện thông báo phù hợp.
 */
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-ky-mon-hoi-dap", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }

  if (order.status === "cancelled") return jsonResponse({ ok: true, status: "cancelled" }, 200);
  if (order.status !== "confirmed") return jsonResponse({ ok: true, status: "pending" }, 200);

  let echo: { chuDe: string; tinhHuong: string; quanHe: string; cauHoi: string } | null = null;
  let ketQuaLuan: { xuHuong: string; vanBan: string; chiTiet: string } | null = null;
  if (order.toolInputSnapshot) {
    try {
      const input = JSON.parse(order.toolInputSnapshot) as KyMonHoiDapInput;
      const tra = traTinhHuong(input.chuDeId, input.tinhHuongId);
      if (tra) {
        echo = {
          chuDe: tra.chuDe.nhan,
          tinhHuong: tra.tinhHuong.nhan,
          quanHe: QUAN_HE_LABELS[input.quanHe],
          cauHoi: input.cauHoi,
        };
      }
      const luanChuDe = LUAN_THEO_CHU_DE[input.chuDeId];
      if (luanChuDe) {
        const laBan = await lapLaBan(input.laBan);
        const kq = luanChuDe(laBan, input.tinhHuongId, input.quanHe, input.thongTinBoSung ?? "");
        if (kq?.hopLe) ketQuaLuan = { xuHuong: kq.xuHuong, vanBan: kq.vanBan, chiTiet: kq.chiTiet };
      }
    } catch (err) {
      console.error(`[ky-mon-hoi-dap] Lỗi dựng kết quả cho đơn ${orderCode}:`, err);
    }
  }

  if (ketQuaLuan) {
    return jsonResponse({ ok: true, status: "confirmed", dangCapNhat: false, echo, ketQuaLuan }, 200);
  }
  return jsonResponse({ ok: true, status: "confirmed", dangCapNhat: true, echo }, 200);
};
