/**
 * Luận dãy số theo trục thời gian ĐỜI NGƯỜI: Khởi – Diễn – Kết.
 *
 * Nguồn: sách "Sim Nói Gì Về Bạn" (Chương 3), chủ dự án chốt 2026-08-18.
 *   - Khởi (3 số đầu): nguyên nhân, gốc rễ.
 *   - Diễn (mấy số giữa): diễn biến, quá trình.
 *   - Kết (4 số cuối): kết quả, đoạn kết — đây cũng là ĐIỂM CỰC ĐẠI của cả dãy.
 *
 * Sách nhấn: "có sim mở đầu khí tốt nhưng kết cấu sau trượt dần xuống, tạo ra điểm gãy ở giữa";
 * ngược lại có sim khởi hung mà kết cát thì "đời khởi đầu chông chênh nhưng càng về sau càng ổn".
 * Vì thế module này KHÔNG chỉ đếm cát/hung mà đọc theo CHIỀU đi lên hay đi xuống của cả dãy.
 *
 * Đây là phần DIỄN GIẢI, không tự trừ điểm — thang điểm đã có khoản phạt số 0 và hung tinh riêng,
 * đưa "điểm gãy" vào chấm điểm nữa sẽ phạt trùng.
 */
import type { KetQuaCap } from "../types.js";

const HE_SO_CAP: Readonly<Record<number, number>> = { 1: 1, 2: 0.75, 3: 0.5, 4: 0.35 };

export type MucGiaiDoan = "tốt" | "trung bình" | "cần lưu ý";

export interface GiaiDoanDoi {
  ten: "Khởi" | "Diễn" | "Kết";
  yNghia: string;
  /** Các chữ số của khung, vd "096". */
  chuSo: string;
  /** Tên các tinh có cặp nằm trong khung. */
  tinh: string[];
  /** Thang -100..100, chỉ dùng để so chiều và vẽ; không đọc thành lời. */
  nangLuong: number;
  mucDo: MucGiaiDoan;
}

export type XuHuong = "đi lên" | "đi xuống" | "giữ đều" | "trồi sụt";

export interface KhoiDienKet {
  giaiDoan: GiaiDoanDoi[];
  xuHuong: XuHuong;
  /** true khi khởi đầu tốt mà kết cục tuột dốc — "điểm gãy giữa dãy" mà sách cảnh báo. */
  diemGay: boolean;
  nhanDinh: string;
}

function mucTheoNangLuong(nl: number): MucGiaiDoan {
  if (nl >= 20) return "tốt";
  if (nl >= -20) return "trung bình";
  return "cần lưu ý";
}

/**
 * Chia dãy đã chuẩn hoá thành 3 khung. Dãy chuẩn hoá thường 9 chữ số (đã bỏ số 0 nhà mạng), nên
 * lấy Khởi = 3 đầu, Kết = 4 cuối, Diễn = phần còn lại ở giữa. Với dãy ngắn/dài hơn thì co giãn
 * khung giữa, luôn giữ Khởi 3 và Kết 4 nếu đủ chỗ.
 */
function chiaKhung(n: number): { khoiHet: number; ketDau: number } {
  const khoiHet = Math.min(3, Math.max(1, Math.floor(n / 3)));
  const ketDau = Math.max(khoiHet, n - 4);
  return { khoiHet, ketDau };
}

/** Năng lượng một cặp: cát +, hung −, Phục Vị trung tính (0), nhân hệ số cấp độ. */
function nangLuongCap(c: KetQuaCap): number {
  if (c.ten === "Phục Vị") return 0;
  const huong = c.catHung === "cát" || c.daHoaGiai ? 1 : -1;
  return huong * (HE_SO_CAP[c.capDo] ?? 0.5);
}

export function luanKhoiDienKet(soDaChuanHoa: string, capGoc: KetQuaCap[]): KhoiDienKet {
  const n = soDaChuanHoa.length;
  const { khoiHet, ketDau } = chiaKhung(n);

  // Một cặp thuộc khung nào tính theo TÂM của nó (trung điểm hai chữ số), để cặp vắt ranh giới
  // không bị đếm cho cả hai khung.
  const khungCua = (c: KetQuaCap): "Khởi" | "Diễn" | "Kết" => {
    const tam = (c.capGoc.viTriTrai + c.capGoc.viTriPhai) / 2;
    if (tam < khoiHet) return "Khởi";
    if (tam >= ketDau) return "Kết";
    return "Diễn";
  };

  const dinhNghia: { ten: GiaiDoanDoi["ten"]; yNghia: string; lo: number; hi: number }[] = [
    { ten: "Khởi", yNghia: "Nguyên nhân, gốc rễ — những năm đầu đời và bản chất khởi điểm.", lo: 0, hi: khoiHet },
    { ten: "Diễn", yNghia: "Diễn biến, quá trình — chặng giữa, cách mọi việc vận hành.", lo: khoiHet, hi: ketDau },
    { ten: "Kết", yNghia: "Kết quả, đoạn kết — chỗ quyết định cả dãy về sau.", lo: ketDau, hi: n },
  ];

  const giaiDoan: GiaiDoanDoi[] = dinhNghia.map((d) => {
    const capTrong = capGoc.filter((c) => khungCua(c) === d.ten);
    const tong = capTrong.reduce((s, c) => s + nangLuongCap(c), 0);
    const soCo = capTrong.filter((c) => c.ten !== "Phục Vị").length;
    const nangLuong = soCo === 0 ? 0 : Math.round((tong / soCo) * 100);
    return {
      ten: d.ten,
      yNghia: d.yNghia,
      chuSo: soDaChuanHoa.slice(d.lo, d.hi),
      tinh: [...new Set(capTrong.map((c) => c.ten))],
      nangLuong,
      mucDo: mucTheoNangLuong(nangLuong),
    };
  });

  const khoi = giaiDoan[0]!.nangLuong;
  const ket = giaiDoan[2]!.nangLuong;
  const dien = giaiDoan[1]!.nangLuong;

  let xuHuong: XuHuong;
  if (ket - khoi >= 20) xuHuong = "đi lên";
  else if (khoi - ket >= 20) xuHuong = "đi xuống";
  else if (Math.max(khoi, dien, ket) - Math.min(khoi, dien, ket) >= 40) xuHuong = "trồi sụt";
  else xuHuong = "giữ đều";

  // Điểm gãy: khởi đầu có hướng tốt nhưng kết cục tuột xuống mức cần lưu ý. Đây đúng câu sách:
  // "mở đầu khí tốt, kết cấu sau trượt dần xuống, tạo điểm gãy ở giữa".
  const diemGay = khoi > 0 && ket < 0 && khoi - ket >= 20;

  const cau: string[] = [];
  if (diemGay) {
    cau.push(
      "Dãy số mở đầu bằng năng lượng tốt nhưng càng về cuối càng tuột dốc — đây là điểm gãy giữa dãy: khởi sự thuận lợi mà kết cục dễ dang dở, gần đến nơi lại hỏng.",
    );
  } else if (xuHuong === "đi lên" && ket >= 0) {
    cau.push(
      "Dãy số đi theo chiều lên: khởi đầu có thể chông chênh nhưng càng về sau càng ổn — hậu vận tốt hơn tiền vận.",
    );
  } else if (xuHuong === "đi lên") {
    // Kết có nhích lên so với khởi nhưng vẫn còn ở mức yếu — không được nói "hậu vận tốt".
    cau.push(
      "Ba chặng có nhích dần lên nhưng chặng Kết vẫn ở mức cần lưu ý — cả dãy thiên yếu, đỡ hơn về cuối nhưng chưa thành hậu vận đẹp.",
    );
  } else if (xuHuong === "đi xuống") {
    cau.push("Dãy số nghiêng chiều đi xuống — cần giữ gìn thành quả về cuối, đừng để tuột.");
  } else if (xuHuong === "trồi sụt") {
    cau.push("Dãy số trồi sụt qua ba chặng — cuộc vận nhiều thăng trầm, thiếu một mạch ổn định.");
  } else if (khoi < 0 && ket < 0) {
    cau.push("Cả ba chặng đều thiên yếu và khá đều nhau — dãy số kém từ đầu đến cuối, không có chặng nào bật lên.");
  } else {
    cau.push("Ba chặng Khởi – Diễn – Kết khá đều nhau, không có biến động lớn giữa các giai đoạn.");
  }
  cau.push(
    `Đọc theo đời người: ${giaiDoan
      .map((g) => `${g.ten} (${g.chuSo || "—"}) ${g.mucDo}`)
      .join(" → ")}. Chặng Kết là chỗ quyết định nhất.`,
  );

  return { giaiDoan, xuHuong, diemGay, nhanDinh: cau.join(" ") };
}
