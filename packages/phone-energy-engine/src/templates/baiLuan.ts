/**
 * Ghép bài luận văn xuôi 8 bước bằng TEMPLATE — không gọi AI lúc chạy.
 *
 * Tách khỏi logic tính toán để sau này sửa câu chữ không phải đụng vào engine nghiệp vụ.
 *
 * Hai quy tắc trình bày bắt buộc lấy từ SKILL mục "Định dạng đầu ra":
 *   • Không lộ mã nội bộ — không viết "mục 4b", "cấp 1/2/3", tên file dữ liệu.
 *   • Diễn đạt cẩn trọng với các tổ số nặng, tránh gây hoang mang.
 */
import { MO_TA_8_TINH } from "../data/moTa8Tinh.js";
import { HIEU_LAM_PHO_BIEN } from "../data/nhomTuTruong.js";
import { LUU_Y_KHI_GOI_Y } from "../data/hoaGiai.js";
import {
  BAN_CHAT_SO_0,
  BAN_CHAT_SO_5,
  CAP_CAN_THAN_TRONG,
  HUNG_TINH_CO_MAT_LOI,
  LOI_THAN_TRONG,
} from "../data/luuYDacBiet.js";
import type {
  Bo3So,
  CanhBao,
  GiaiDoanVanThe,
  GoiYHoaGiai,
  KetQuaCap,
  NhomTuTruongResult,
  TenTinh,
  ThieuDuLieu,
} from "../types.js";

export interface DoanBaiLuan {
  tieuDe: string;
  noiDung: string[];
}

/** Nói mức độ bằng lời thay vì số cấp, đúng yêu cầu không lộ mã nội bộ. */
function mucDoBangLoi(capDo: number): string {
  if (capDo === 1) return "ở mức mạnh nhất";
  if (capDo === 2) return "khá mạnh";
  if (capDo === 3) return "ở mức vừa";
  return "ở mức nhẹ";
}

function loiDongTinh(dongTinh: string): string {
  return dongTinh === "động"
    ? "đây là việc đã thành hiện thực chứ không còn ở mức ý tưởng"
    : "đây mới dừng ở mức tiềm năng, ý tưởng, chưa thành hành động";
}

export function dungBaiLuan(params: {
  soDaChuanHoa: string;
  capGoc: KetQuaCap[];
  bo3So: Bo3So[];
  ketCuc: { baSoDuoi: string; dienGiai: string };
  tinhChuDao: { ten: TenTinh; soLan: number } | null;
  nhomTuTruong: NhomTuTruongResult[];
  canhBao: CanhBao[];
  vanThe: GiaiDoanVanThe[] | null;
  hoaGiai: GoiYHoaGiai[];
  thieuDuLieu: ThieuDuLieu[];
  coCccd: boolean;
}): DoanBaiLuan[] {
  const {
    soDaChuanHoa,
    capGoc,
    bo3So,
    ketCuc,
    tinhChuDao,
    nhomTuTruong,
    canhBao,
    vanThe,
    hoaGiai,
    thieuDuLieu,
    coCccd,
  } = params;

  const doan: DoanBaiLuan[] = [];

  // --- Bước 1-2: các cặp năng lượng trong dãy ---
  const cauCap = capGoc.map((c) => {
    const phan = [
      `Cặp ${c.capGoc.cap} mang năng lượng ${c.ten} ${mucDoBangLoi(c.capDo)} — ${loiDongTinh(c.dongTinh)}.`,
    ];
    for (const h of c.hieuUng) {
      phan.push(`Có số ${h.so} ${h.viTriTuongDoi} cặp này: ${h.moTa}.`);
      if (h.yNghiaLinhVuc) {
        phan.push(`Cụ thể ở mặt ${h.yNghiaLinhVuc}.`);
      }
      if (h.lamManhHungTinh) {
        phan.push("Đây là điểm cần lưu ý vì nó làm năng lượng xấu mạnh thêm chứ không giảm đi.");
      } else if (c.catHung === "cát" && h.so === 5 && h.hieuUng === "khuếch đại") {
        // Số 5 làm mạnh lên bất kể gốc cát hay hung — gặp cát tinh thì đây là điểm cộng, phải nói
        // rõ chứ không chỉ cảnh báo một chiều khi gặp hung tinh.
        phan.push("Với một năng lượng tốt thì đây là điểm cộng — mặt lợi được nhân lên và bền hơn.");
      }
    }
    if (c.daHoaGiai) {
      phan.push("Cặp này đã được cát tinh đứng ngay bên phải hoá giải.");
    }
    return phan.join(" ");
  });

  doan.push({
    tieuDe: "Các cặp năng lượng trong dãy số",
    noiDung: [
      `Số ${soDaChuanHoa} tách được ${capGoc.length} cặp năng lượng. Những chữ số 0 và số 5 không nằm trong tám quẻ nên không tự tạo cặp riêng, mà chỉ tác động lên cặp đứng cạnh nó.`,
      ...cauCap,
    ],
  });

  // --- Bước 2 (tiếp): câu chuyện của cả dãy theo từng bộ 3 số ---
  doan.push({
    tieuDe: "Câu chuyện của cả dãy số",
    noiDung: [
      "Đọc theo từng bộ ba chữ số liên tiếp từ đầu đến cuối, dãy số kể một mạch như sau:",
      ...bo3So.map((b) => `${b.bo} — ${b.dienGiai}`),
    ],
  });

  // --- Tinh chủ đạo ---
  if (tinhChuDao) {
    const mt = MO_TA_8_TINH[tinhChuDao.ten];
    doan.push({
      tieuDe: `Năng lượng chủ đạo: ${tinhChuDao.ten}`,
      noiDung: [
        `${tinhChuDao.ten} xuất hiện ${tinhChuDao.soLan} lần, nhiều nhất trong dãy, nên đây là màu sắc chính của số này.`,
        `Mặt mạnh: ${mt.uuDiem}.`,
        `Mặt cần lưu ý: ${mt.khuyetDiem}.`,
        `Về tiền tài: ${mt.taiVan}.`,
        `Về công việc: ${mt.suNghiep}.`,
        `Về tình cảm: ${mt.tinhCam}.`,
        `Về sức khỏe: ${mt.sucKhoe}.`,
        `Về quý nhân: ${mt.quyNhan}.`,
        ...(mt.dacThu ? [`Lưu ý riêng: ${mt.dacThu}.`] : []),
      ],
    });
  }

  // --- Bước 3: kết cục ---
  doan.push({
    tieuDe: "Ba số cuối — phần quyết định kết cục",
    noiDung: [
      `Ba số cuối là ${ketCuc.baSoDuoi}. Đây là chỗ đại diện cho kết quả cuối cùng của mọi việc nên cần nhìn kỹ hơn các cặp ở giữa dãy.`,
      ketCuc.dienGiai,
    ],
  });

  // --- Bước 5: vận thế ---
  if (vanThe && vanThe.length > 0) {
    doan.push({
      tieuDe: "Vận thế theo từng giai đoạn tuổi",
      noiDung: [
        "Dựa trên căn cước, các giai đoạn vận thế lần lượt là:",
        ...vanThe.map(
          (g) =>
            `${g.tuoiTu}–${g.tuoiDen} tuổi: cặp ${g.cap}${g.ten ? `, năng lượng ${g.ten}` : ""}.${g.ghiChu ? ` ${g.ghiChu}` : ""}`,
        ),
      ],
    });
  } else if (!coCccd) {
    doan.push({
      tieuDe: "Vận thế theo từng giai đoạn tuổi",
      noiDung: [
        "Phần này cần số căn cước công dân mới tính được, vì vận thế lấy từ căn cước chứ không lấy từ số điện thoại. Nếu anh/chị cung cấp thêm, chúng tôi sẽ luận được từng giai đoạn tuổi cụ thể.",
      ],
    });
  }

  // --- Bước 6: 10 nhóm từ trường ---
  if (nhomTuTruong.length > 0) {
    doan.push({
      tieuDe: "Các mặt cụ thể của cuộc sống",
      noiDung: nhomTuTruong.map((n) => `${n.nhom}: ${n.dienGiai}`),
    });
  }

  // --- Bước 7: tổng hợp & cảnh báo ---
  const cauTongHop: string[] = [];
  if (canhBao.length > 0) {
    for (const c of canhBao) cauTongHop.push(`${c.tieuDe}: ${c.moTa}`);
  } else {
    cauTongHop.push("Dãy số không rơi vào các trường hợp cảnh báo đặc biệt.");
  }

  if (soDaChuanHoa.includes("0")) cauTongHop.push(BAN_CHAT_SO_0);
  if (soDaChuanHoa.includes("5")) cauTongHop.push(BAN_CHAT_SO_5);

  const capNang = capGoc.filter((c) => CAP_CAN_THAN_TRONG.includes(c.capGoc.cap));
  if (capNang.length > 0) {
    cauTongHop.push(LOI_THAN_TRONG);
  }

  const hungCoMat = [...new Set(capGoc.filter((c) => c.catHung === "hung").map((c) => c.ten))];
  for (const h of hungCoMat) {
    const matLoi = HUNG_TINH_CO_MAT_LOI[h];
    if (matLoi) cauTongHop.push(`Về ${h}: ${matLoi} — nên đặt trong bối cảnh nghề nghiệp của mình trước khi kết luận tốt xấu.`);
  }

  cauTongHop.push(...HIEU_LAM_PHO_BIEN);

  doan.push({ tieuDe: "Tổng hợp và những điểm cần lưu ý", noiDung: cauTongHop });

  // --- Bước 8: gợi ý hoá giải ---
  const cauHoaGiai: string[] = [];
  if (hoaGiai.length > 0) {
    for (const g of hoaGiai) {
      cauHoaGiai.push(
        `Với năng lượng ${g.hungTinh} trong ${g.nguon}: ${g.cachHoaGiai}${g.toHopGoiY.length > 0 ? ` Có thể tham khảo các cặp: ${g.toHopGoiY.join(", ")}.` : ""}`,
      );
    }
  } else if (!coCccd) {
    cauHoaGiai.push(
      "Chúng tôi chưa đưa gợi ý hoá giải cụ thể vì chưa có số căn cước. Khi có căn cước, có thể xác định chính xác năng lượng xấu nào cần hoá giải và nên bổ sung cặp số nào.",
    );
  } else {
    cauHoaGiai.push("Không phát hiện năng lượng xấu nào trong căn cước cần hoá giải bằng số điện thoại.");
  }

  const daHoaGiaiNoiBo = bo3So.filter((b) => b.hoaGiaiNoiBo);
  if (daHoaGiaiNoiBo.length > 0) {
    cauHoaGiai.push(
      `Bản thân dãy số đã tự hoá giải được một phần: ${daHoaGiaiNoiBo.map((b) => b.bo).join(", ")} — ở những chỗ này cát tinh đứng ngay bên phải và đủ mạnh để hoá cái hung đứng trước nó.`,
    );
  }

  cauHoaGiai.push(...LUU_Y_KHI_GOI_Y);
  doan.push({ tieuDe: "Hướng hoá giải và lưu ý khi chọn số", noiDung: cauHoaGiai });

  // --- Minh bạch phần chưa luận được ---
  if (thieuDuLieu.length > 0) {
    doan.push({
      tieuDe: "Phần chưa luận được",
      noiDung: thieuDuLieu.map((t) => t.moTa),
    });
  }

  return doan;
}
