/**
 * Năm mặt đời sống của một dãy số: Tài vận — Quan vận — Nhân duyên — Sức khoẻ — May mắn.
 *
 * Chủ dự án yêu cầu 2026-08-17: phần kết luận cần chốt rõ theo mấy mặt này thay vì để khách tự
 * suy ra từ tên tinh.
 *
 * ⚠️ NGUYÊN TẮC: mỗi tinh được xếp vào cột "đẩy lên" hay "kéo xuống" của một mặt đều phải trích
 * được từ `mo-ta-8-tinh.md` hoặc cột chủ đề của bảng tra trong `bang-tra-bat-tinh.md`. Trường
 * `canCu` giữ nguyên văn để rà ngược. Không tự xếp theo cảm tính "cát thì tốt mọi mặt" — bằng
 * chứng là Diên Niên tốt cho quan vận và sức khoẻ nhưng lại XẤU cho quý nhân, vì tài liệu ghi rõ
 * "tự thân đi làm, ít vận quý nhân".
 *
 * Trọng số bám đúng nguyên tắc đã chốt: cặp nằm ở ba số cuối nặng gấp `TRONG_SO_DUOI` lần cặp nằm
 * giữa dãy, và cặp cấp 1 nặng hơn cặp cấp 4.
 */
import type { CapDo, KetQuaCap, TenTinh } from "../types.js";

/** Cặp ở ba số cuối nặng bằng bấy nhiêu cặp giữa dãy. */
const TRONG_SO_DUOI = 3;

/** Cấp 1 mạnh nhất → cấp 4 yếu nhất. Dùng lại đúng hệ số của thang điểm tổng. */
const HE_SO_CAP: Readonly<Record<CapDo, number>> = { 1: 1, 2: 0.75, 3: 0.5, 4: 0.35 };

export type MucDoMat = "rất tốt" | "tốt" | "trung bình" | "cần lưu ý";

interface DinhNghiaMat {
  ma: string;
  ten: string;
  /** Tinh đẩy mặt này lên, kèm hệ số ảnh hưởng (1 = trụ cột, 0.5 = phụ trợ). */
  dayLen: Readonly<Partial<Record<TenTinh, number>>>;
  daoXuong: Readonly<Partial<Record<TenTinh, number>>>;
  canCu: string;
}

const CAC_MAT: readonly DinhNghiaMat[] = [
  {
    ma: "tai_van",
    ten: "Tài vận",
    dayLen: { "Thiên Y": 1, "Diên Niên": 0.5 },
    daoXuong: { "Tuyệt Mệnh": 1, "Ngũ Quỷ": 0.5, "Họa Hại": 0.5 },
    canCu:
      "Thiên Y — chủ đề bảng tra “Tài phú”, Tài vận “tiền tài đến từ tám phương”. Diên Niên — Tài vận “vất vả kiếm tiền nhưng giữ được tiền”. Tuyệt Mệnh — chủ đề “Phá tài, kiện tụng, bệnh tật”, Tài vận “không giữ được tiền, dễ phá tài”. Ngũ Quỷ — “tiền đến nhanh đi cũng nhanh, không ổn định”. Họa Hại — “dễ vì cãi vã mà phá tài”.",
  },
  {
    ma: "quan_van",
    ten: "Quan vận",
    dayLen: { "Diên Niên": 1, "Thiên Y": 0.5 },
    daoXuong: { "Ngũ Quỷ": 1, "Họa Hại": 0.5, "Phục Vị": 0.5 },
    canCu:
      "Diên Niên — chủ đề “Quyền lực, sự nghiệp, sức khỏe”, Sự nghiệp “có thể gánh vác một phương”. Thiên Y — “dễ thành ông chủ hoặc cánh tay đắc lực của ông chủ”. Ngũ Quỷ — “thường xuyên biến động, không an phận”. Họa Hại — “dễ cãi vã thị phi”. Phục Vị — “dễ bỏ lỡ cơ hội tốt vì quá bảo thủ”.",
  },
  {
    ma: "nhan_duyen",
    ten: "Nhân duyên",
    dayLen: { "Thiên Y": 1, "Sinh Khí": 1 },
    daoXuong: { "Lục Sát": 1, "Ngũ Quỷ": 0.5, "Họa Hại": 0.5, "Tuyệt Mệnh": 0.5 },
    canCu:
      "Thiên Y — “Chính Đào Hoa, dễ gặp đối tượng lý tưởng, tình cảm ngọt ngào”. Sinh Khí — “quan hệ hài hòa, hôn nhân ngọt ngào”. Lục Sát — chủ đề “Đào hoa, thương tổn tình cảm”, “khốn khổ vì tình, hôn nhân không trôi chảy”. Ngũ Quỷ — “hay thay đổi, dễ tay ba/ngoại tình/ly hôn”. Họa Hại — “ban đầu ngon ngọt, sau dễ cãi vã, dễ ly hôn”. Tuyệt Mệnh — “bất lợi hôn nhân”.",
  },
  {
    ma: "suc_khoe",
    ten: "Sức khoẻ",
    dayLen: { "Diên Niên": 1, "Sinh Khí": 0.5 },
    daoXuong: { "Tuyệt Mệnh": 1, "Ngũ Quỷ": 1, "Họa Hại": 0.5, "Lục Sát": 0.5 },
    canCu:
      "Diên Niên — “ý chí kiên định, sức chịu đựng siêu cường, tương đối trường thọ”. Sinh Khí — “bệnh dạ dày, tai mắt mũi, thường không nghiêm trọng”. Tuyệt Mệnh — “gan, thận, tiểu đường, thậm chí tai nạn xe cộ, ung thư — hung tinh mạnh nhất”. Ngũ Quỷ — “bệnh tim, tuần hoàn máu, tai ương ngoài ý muốn”. Họa Hại — “hao tổn nguyên khí, dễ mệt mỏi”. Lục Sát — “da, dạ dày, dễ u buồng trứng”.",
  },
  {
    ma: "may_man",
    ten: "May mắn, quý nhân",
    dayLen: { "Sinh Khí": 1, "Thiên Y": 1 },
    daoXuong: { "Ngũ Quỷ": 1, "Họa Hại": 1, "Lục Sát": 0.5, "Tuyệt Mệnh": 0.5, "Diên Niên": 0.5 },
    canCu:
      "Sinh Khí — chủ đề “Quý nhân”, “cứu mạng chi tinh, luôn có người trợ giúp khi nguy khốn”. Thiên Y — “nền tảng nhân mạch hùng hậu”. Ngũ Quỷ — “hay nghi ngờ, không tin người, thiếu quý nhân”. Họa Hại — “không có quý nhân tương trợ, nhiều thị phi”. Lục Sát — “vì đa nghi dễ tổn thương bằng hữu nên không có vận quý nhân”. Tuyệt Mệnh — “không có, mọi thứ dựa vào chính mình”. Diên Niên — “tự thân đi làm, ít vận quý nhân”.",
  },
];

export interface MatDoiSong {
  ma: string;
  ten: string;
  mucDo: MucDoMat;
  /** Thang -100..100, chỉ dùng nội bộ để chọn mức và để vẽ thanh — không đọc ra thành lời. */
  diem: number;
  /** Vd "Thiên Y ở đuôi số". */
  dangDayLen: string[];
  dangKeoXuong: string[];
  dienGiai: string;
  canCu: string;
}

const CHOT: Readonly<Record<string, Readonly<Record<MucDoMat, string>>>> = {
  tai_van: {
    "rất tốt": "Đây là mặt mạnh nhất của dãy số — năng lượng tiền bạc rất rõ, làm gì cũng dễ ra tiền và giữ được.",
    "tốt": "Tiền bạc thuận, có nền để tích luỹ chứ không chỉ kiếm được rồi tiêu hết.",
    "trung bình": "Tiền bạc ở mức đủ dùng, không bật lên mà cũng không hao hụt bất thường.",
    "cần lưu ý": "Đây là mặt yếu của dãy số — dễ kiếm được mà không giữ được, cần cẩn trọng khi xuống tiền lớn.",
  },
  quan_van: {
    "rất tốt": "Đường công danh rất thuận — có chủ trương, gánh được việc lớn, dễ được giao trọng trách.",
    "tốt": "Công việc thuận, đủ sức tiến lên vị trí cao hơn nếu chịu khó.",
    "trung bình": "Công việc ổn, không có lực đẩy mạnh nhưng cũng không bị cản.",
    "cần lưu ý": "Đường công danh nhiều biến động — hay đổi việc, dễ vướng thị phi hoặc chững lại giữa chừng.",
  },
  nhan_duyen: {
    "rất tốt": "Tình cảm rất thuận — nhân duyên đẹp, dễ gặp người hợp và giữ được lâu dài.",
    "tốt": "Tình cảm thuận, quan hệ hài hoà.",
    "trung bình": "Tình cảm bình thường, tốt xấu tuỳ vào cách sống chứ dãy số không nghiêng hẳn về bên nào.",
    "cần lưu ý": "Tình cảm là chỗ dễ trục trặc nhất của dãy số này — nhiều sóng gió, cần chủ động giữ.",
  },
  suc_khoe: {
    "rất tốt": "Thể trạng bền, sức chịu đựng tốt, ít bệnh vặt.",
    "tốt": "Sức khoẻ ổn, không có năng lượng nào gây hại rõ rệt.",
    "trung bình": "Sức khoẻ trung bình — nên đi khám định kỳ như bình thường.",
    "cần lưu ý": "Đây là mặt cần chú ý nhất — nên xem kỹ phần Sức khoẻ ở trên và khám định kỳ đều đặn.",
  },
  may_man: {
    "rất tốt": "Vận quý nhân rất mạnh — gặp khó là có người đỡ, nhiều cơ hội tự tìm đến.",
    "tốt": "Có quý nhân, việc khó thường có người mở đường giúp.",
    "trung bình": "Quý nhân ở mức bình thường, có việc được giúp có việc không.",
    "cần lưu ý": "Ít vận quý nhân — việc gì cũng phải tự thân là chính, đừng trông vào người khác.",
  },
};

function mucTheoDiem(diem: number): MucDoMat {
  if (diem >= 50) return "rất tốt";
  if (diem >= 15) return "tốt";
  if (diem >= -15) return "trung bình";
  return "cần lưu ý";
}

export function luanNamMat(capGoc: KetQuaCap[], capTrongDuoi: KetQuaCap[]): MatDoiSong[] {
  const oDuoi = new Set(capTrongDuoi.map((c) => c.capGoc.cap));

  return CAC_MAT.map((mat) => {
    let tong = 0;
    let tongTrongSo = 0;
    const dayLen = new Map<string, boolean>();
    const keoXuong = new Map<string, boolean>();

    for (const c of capGoc) {
      const trongDuoi = oDuoi.has(c.capGoc.cap);
      const trongSo = HE_SO_CAP[c.capDo] * (trongDuoi ? TRONG_SO_DUOI : 1);
      const len = mat.dayLen[c.ten];
      const xuong = mat.daoXuong[c.ten];

      if (len !== undefined) {
        tong += len * trongSo;
        tongTrongSo += trongSo;
        dayLen.set(`${c.ten} ${trongDuoi ? "ở đuôi số" : "ở giữa dãy"}`, true);
      } else if (xuong !== undefined) {
        tong -= xuong * trongSo;
        tongTrongSo += trongSo;
        keoXuong.set(`${c.ten} ${trongDuoi ? "ở đuôi số" : "ở giữa dãy"}`, true);
      }
      // Tinh không nằm ở cả hai cột thì KHÔNG tính vào mẫu số — nó trung lập với mặt này, kéo nó
      // vào chỉ làm loãng kết quả.
    }

    const diem = tongTrongSo === 0 ? 0 : Math.round((tong / tongTrongSo) * 100);
    const mucDo = mucTheoDiem(diem);

    const cau: string[] = [];
    if (tongTrongSo === 0) {
      cau.push("Dãy số không có năng lượng nào liên quan trực tiếp tới mặt này.");
    }
    cau.push(CHOT[mat.ma]![mucDo]);

    return {
      ma: mat.ma,
      ten: mat.ten,
      mucDo,
      diem,
      dangDayLen: [...dayLen.keys()],
      dangKeoXuong: [...keoXuong.keys()],
      dienGiai: cau.join(" "),
      canCu: mat.canCu,
    };
  });
}
