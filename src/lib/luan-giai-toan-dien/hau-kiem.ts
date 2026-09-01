// TẦNG 3 — HẬU KIỂM (code, bắt buộc). Điều phối: Tầng 2 viết → (F/I: kiểm duyệt viên) → quét an
// toàn → viết lại nếu cần → chặn nếu vẫn không qua (buoc_1 = từ cấm tuyệt đối, không thương lượng).
import { quetHauKiem } from "./content-safety";
import { quetSaiSinhKhac, chiDanSuaSinhKhac } from "./kiem-sinh-khac";
import { viecGiaiDoan, kiemDuyetDoanVan, type GiaiDoanConfig } from "./ai-narrative";
import type { GiaiDoanFindings, GiaiDoanNoiDung } from "./types";

const THAY_KHI_CHAN = "Phần này cần xem thêm cùng chuyên gia.";

/**
 * Tạo nội dung 1 giai đoạn ĐÃ QUA đủ 3 tầng, sẵn sàng hiển thị.
 * Trả về `null` nếu findings rỗng hoàn toàn hoặc AI không tạo được nội dung (giao diện tự ẩn).
 */
export async function taoNoiDungGiaiDoanAnToan(
  cfg: GiaiDoanConfig,
  laSo: unknown,
  findings: GiaiDoanFindings,
  findingsPhu?: GiaiDoanFindings[],
): Promise<GiaiDoanNoiDung | null> {
  let doanVan = await viecGiaiDoan(cfg, laSo, findings, findingsPhu);
  if (!doanVan) return null;

  // Kiểm chiều Ngũ Hành TRƯỚC kiểm duyệt F/I: nếu sai chiều, viết lại NGAY (kèm chỉ dẫn sửa cụ thể)
  // để bản đưa vào kiểm duyệt/quét sau đã đúng nền tảng. Xem kiem-sinh-khac.ts.
  doanVan = await suaSaiSinhKhac(cfg, laSo, findings, findingsPhu, doanVan);

  if (cfg.canKiemDuyet) doanVan = await kiemDuyetDoanVan(doanVan);

  doanVan = await quetVaTuSua(cfg, laSo, findings, findingsPhu, doanVan);
  if (!doanVan) return { ma: cfg.ma, tieuDe: cfg.ten, noiDung: THAY_KHI_CHAN };

  return { ma: cfg.ma, tieuDe: cfg.ten, noiDung: doanVan };
}

/**
 * Bước kiểm chiều Ngũ Hành sinh-khắc: quét → nếu sai, VIẾT LẠI 1 lần kèm chỉ dẫn sửa cụ thể. Nếu
 * viết lại vẫn còn sai → GIỮ bản viết lại + log to (KHÔNG chặn cả giai đoạn: 1 câu sai chiều còn hơn
 * khách trả tiền mà mất hẳn báo cáo — hiếm khi tới bước này vì prompt đã có quy tắc sinh-khắc + lượt
 * viết lại có chỉ dẫn trực tiếp). Đây là chốt an toàn cho lỗi kiến thức nền, không phải lỗi dữ liệu.
 */
async function suaSaiSinhKhac(
  cfg: GiaiDoanConfig,
  laSo: unknown,
  findings: GiaiDoanFindings,
  findingsPhu: GiaiDoanFindings[] | undefined,
  doanVanGoc: string,
): Promise<string> {
  const loi = quetSaiSinhKhac(doanVanGoc);
  if (loi.length === 0) return doanVanGoc;

  console.error(`[hau-kiem] Giai đoạn ${cfg.ma} SAI CHIỀU Ngũ Hành: ${loi.map((l) => l.cum).join(" || ")} — viết lại kèm chỉ dẫn.`);
  const vietLai = await viecGiaiDoan(cfg, laSo, findings, findingsPhu, chiDanSuaSinhKhac(loi));
  if (!vietLai) return doanVanGoc; // AI lỗi lượt viết lại → giữ bản gốc còn hơn mất nội dung.

  const loiConLai = quetSaiSinhKhac(vietLai);
  if (loiConLai.length > 0) {
    console.error(`[hau-kiem] Giai đoạn ${cfg.ma} VẪN sai chiều Ngũ Hành sau khi viết lại: ${loiConLai.map((l) => l.cum).join(" || ")} — GIỮ bản viết lại (không chặn), cần rà tay.`);
  }
  return vietLai;
}

/**
 * Bước 1 (bắt buộc, chặn nếu vẫn lỗi sau 1 lần viết lại) + Bước 2 (mềm hơn, cố sửa qua kiểm duyệt
 * viên rồi cho qua dù còn cảnh báo — tránh chặn nhầm vì false positive của regex).
 */
async function quetVaTuSua(
  cfg: GiaiDoanConfig,
  laSo: unknown,
  findings: GiaiDoanFindings,
  findingsPhu: GiaiDoanFindings[] | undefined,
  doanVanGoc: string,
): Promise<string | null> {
  let doanVan = doanVanGoc;
  let canhBao = quetHauKiem(doanVan);
  const coTuCam = () => canhBao.some((c) => c.loai === "tu_khoa_cam");

  if (coTuCam()) {
    console.error(`[hau-kiem] Giai đoạn ${cfg.ma} dính từ cấm: ${canhBao.filter((c) => c.loai === "tu_khoa_cam").map((c) => c.tuKhoaOrMau).join(", ")} — viết lại lần 2.`);
    const vietLai = await viecGiaiDoan(cfg, laSo, findings, findingsPhu);
    if (!vietLai) return null;
    doanVan = cfg.canKiemDuyet ? await kiemDuyetDoanVan(vietLai) : vietLai;
    canhBao = quetHauKiem(doanVan);
    if (coTuCam()) {
      console.error(`[hau-kiem] Giai đoạn ${cfg.ma} vẫn dính từ cấm sau khi viết lại — CHẶN hiển thị.`);
      return null;
    }
  }

  const conCanhBaoNhe = canhBao.filter((c) => c.loai === "khang_dinh_tuyet_doi");
  if (conCanhBaoNhe.length > 0) {
    console.log(`[hau-kiem] Giai đoạn ${cfg.ma} có ${conCanhBaoNhe.length} câu khẳng định tuyệt đối — gửi kiểm duyệt viên chỉnh từ ngữ.`);
    doanVan = await kiemDuyetDoanVan(doanVan);
    const canhBaoSau = quetHauKiem(doanVan);
    if (canhBaoSau.some((c) => c.loai === "tu_khoa_cam")) return null; // kiểm duyệt lỡ đưa từ cấm vào — chặn an toàn.
    if (canhBaoSau.some((c) => c.loai === "khang_dinh_tuyet_doi")) {
      console.log(`[hau-kiem] Giai đoạn ${cfg.ma} vẫn còn cảnh báo nhẹ sau kiểm duyệt — vẫn cho hiển thị (không phải từ cấm tuyệt đối).`);
    }
  }

  return doanVan;
}
