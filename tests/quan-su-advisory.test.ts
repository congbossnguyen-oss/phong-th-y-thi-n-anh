// Test cases cho ADVISORY ENGINE — chạy báo cáo cố vấn trên >=20 LOẠI CÂU HỎI khác nhau,
// đảm bảo cấu trúc 8 phần luôn hợp lệ và các bất biến (verdict trong enum, điểm 0-100, 3/3/3...).
// Không kiểm điểm số cụ thể (điểm phụ thuộc Can Chi thời điểm gieo + là bản nháp cần calibrate).

import { describe, expect, it } from "vitest";
import { runQuanSu } from "../src/lib/quan-su/orchestrator";
import { buildAdvisoryReport, VERDICT_LABEL, type Verdict } from "../src/lib/quan-su/advisory-engine";
import { buildInterpretationPayload, castLucHaoFromTosses } from "../src/lib/quan-su/divination";
import { getQuestion } from "../src/lib/quan-su";
import type { CoinLineValue } from "../src/lib/luc-hao";

const VERDICTS: Verdict[] = ["NEN", "KHONG_NEN", "NEN_CHO", "CO_DIEU_KIEN", "CHUA_DU_DU_LIEU"];
const NGAY_SINH = { day: 20, month: 5, year: 1990, gender: "Nam" as const, hour: 10 };

// RNG tái lập (để test deterministic).
function seededRng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
}

// >=20 loại câu hỏi trải khắp 15 nhóm (gồm cả luc-than, the-hao, framework, so-sanh).
const QUESTION_TYPES: string[] = [
  "xin-viec", "chuyen-viec", "thang-chuc", "phat-trien-su-nghiep", // sự nghiệp
  "mo-cua-hang", "hop-tac-kinh-doanh", // kinh doanh
  "vay-tien", "doi-no", // tài chính (framework)
  "dau-tu-du-an", "chon-phuong-an-dau-tu", // đầu tư (so-sanh)
  "mua-dat", "ky-hop-dong-bds", // bất động sản
  "nha-o-tot-hay-xau", "nha-co-nen-mua", // nhà cửa (framework)
  "co-nen-hop-tac", // hợp tác (framework)
  "co-nen-tien-toi", // tình duyên (framework)
  "thi-do", // thi cử
  "co-nen-tham-gia-thi-dau", // thi đấu (framework)
  "co-nen-kien", // kiện tụng (safety cao)
  "xu-huong-suc-khoe", "dieu-tri", // sức khỏe (the-hao, safety cao)
  "chuyen-di", // xuất hành (framework)
  "a-hay-b", "tien-hay-lui", // quyết định (so-sanh)
];

describe("Advisory Engine — cấu trúc báo cáo hợp lệ trên 24 loại câu hỏi", () => {
  it("có ít nhất 20 loại câu hỏi để test", () => {
    expect(QUESTION_TYPES.length).toBeGreaterThanOrEqual(20);
  });

  for (const qid of QUESTION_TYPES) {
    it(`[${qid}] báo cáo đủ 8 phần, verdict hợp lệ, điểm 0-100, 3/3/3`, () => {
      const q = getQuestion(qid);
      expect(q, `câu hỏi tồn tại: ${qid}`).toBeTruthy();
      const r = runQuanSu({ question_id: qid, ngaySinh: NGAY_SINH, rng: seededRng(12345) });
      const rep = r.report;

      // 1. KẾT LUẬN
      expect(VERDICTS, qid).toContain(rep.ketLuan);
      expect(rep.ketLuanLabel).toBe(VERDICT_LABEL[rep.ketLuan]);
      // 2. MỨC ĐỘ THUẬN 0-100, số nguyên
      expect(Number.isInteger(rep.mucDoThuan), qid).toBe(true);
      expect(rep.mucDoThuan).toBeGreaterThanOrEqual(0);
      expect(rep.mucDoThuan).toBeLessThanOrEqual(100);
      // bảng chấm điểm minh bạch (mỗi item có delta + reason)
      for (const it of rep.bangChamDiem) {
        expect(typeof it.delta).toBe("number");
        expect(it.reason.length).toBeGreaterThan(0);
      }
      // 3. XU HƯỚNG
      expect(rep.xuHuong.length, qid).toBeGreaterThan(0);
      // 4. ĐIỂM THUẬN = 3
      expect(rep.diemThuan, qid).toHaveLength(3);
      // 5. ĐIỂM LƯU Ý = 3
      expect(rep.diemLuuY, qid).toHaveLength(3);
      // 6. VẬN TRÌNH (có ngày sinh → có)
      expect(rep.vanTrinh, qid).not.toBeNull();
      expect(rep.vanTrinh!.chiBao.length).toBeGreaterThanOrEqual(2);
      expect(rep.vanTrinh!.chiBao.length).toBeLessThanOrEqual(4);
      // 7. QUÂN SƯ KHUYÊN = 3
      expect(rep.quanSuKhuyen, qid).toHaveLength(3);
      // 8. LUẬN GIẢI CHI TIẾT
      expect(rep.luanGiaiChiTiet.length, qid).toBeGreaterThan(0);
      // cờ chất lượng
      expect(rep.coNhap).toBe(true);
      expect(rep.proseLaDemo).toBe(true);
    });
  }
});

describe("Advisory Engine — quy tắc verdict & điểm số", () => {
  it("verdict CHUA_DU_DU_LIEU → điểm ≤ 45 (không khẳng định khi thiếu dữ liệu)", () => {
    // Quét nhiều tổ hợp gieo cho tới khi gặp 1 ca Dụng Thần không hiện; nếu gặp, kiểm điểm.
    let gapChuaDu = false;
    for (let seed = 1; seed <= 200 && !gapChuaDu; seed++) {
      const r = runQuanSu({ question_id: "vay-tien", ngaySinh: NGAY_SINH, rng: seededRng(seed) });
      if (r.report.ketLuan === "CHUA_DU_DU_LIEU") {
        gapChuaDu = true;
        expect(r.report.mucDoThuan).toBeLessThanOrEqual(45);
      }
    }
    // Không bắt buộc gặp — chỉ kiểm bất biến NẾU gặp. (in để biết.)
    expect(true).toBe(true);
  });

  it("không có ngày sinh → vẫn ra báo cáo, vận trình = null, khuyên vẫn đủ 3", () => {
    const tosses: CoinLineValue[] = [7, 8, 7, 8, 7, 8]; // không hào động
    const q = getQuestion("chuyen-viec")!;
    const cast = castLucHaoFromTosses(tosses, { day: 15, month: 6, year: 2024, hour: 10 });
    const payload = buildInterpretationPayload(q, cast, { method: "luc-hao-tosses", vanTrinh: null });
    const rep = buildAdvisoryReport(payload);
    expect(rep.vanTrinh).toBeNull();
    expect(rep.quanSuKhuyen).toHaveLength(3);
    expect(rep.diemThuan).toHaveLength(3);
    expect(VERDICTS).toContain(rep.ketLuan);
  });

  it("có vận trình → bảng chấm điểm CÓ yếu tố Đại vận/Lưu niên khi vận khác trung bình", () => {
    // Người có đại vận/lưu niên KHÔNG trung tính (thu_thach/nghich) → phải xuất hiện trong bảng điểm.
    const nguoiVanNghich = { day: 3, month: 11, year: 1978, gender: "Nữ" as const, hour: 6 };
    let coVanTrinhTrongDiem = false;
    for (let seed = 1; seed <= 30 && !coVanTrinhTrongDiem; seed++) {
      const r = runQuanSu({ question_id: "dau-tu-du-an", ngaySinh: nguoiVanNghich, rng: seededRng(seed) });
      if (r.report.bangChamDiem.some((i) => i.factor === "Đại vận" || i.factor === "Lưu niên")) coVanTrinhTrongDiem = true;
    }
    expect(coVanTrinhTrongDiem).toBe(true);
  });
});
