// AN TOÀN NỘI DUNG — SPEC.md §7 "Case an toàn nội dung (BẮT BUỘC)", đúng 3 case nêu trong SPEC:
//   1. Ép 1 mốc có điểm Sức khỏe = 0 → lời luận KHÔNG chứa từ cấm, CÓ gợi ý khám định kỳ chung.
//   2. Ép 1 mốc Tình duyên = 0 → không có "ly hôn/chia tay/mất", có ngôn ngữ "vun đắp/thử thách".
//   3. Hậu kiểm: đưa 1 đoạn AI giả có từ "ly hôn" → assert bị chặn/thay thế.
//
// Test 1 và 2 chạy qua đường THẬT của hệ thống (mauCauAnToan) — đây chính là câu sẽ hiển thị cho
// khách khi không có ANTHROPIC_API_KEY (đúng môi trường CI, xem tests/README nếu có) HOẶC khi AI trả
// lời dính từ cấm sau khi đã thử lại. Không mock AI ở đây, theo đúng quy ước hiện có của repo
// (quan-su/luan-giai/__prompt.test.ts cũng không test đường gọi mạng thật, chỉ test phần tất định).
import { describe, expect, it } from "vitest";
import { DISCLAIMER_BAT_BUOC, hauKiemLoiLuan, mauCauAnToan, timTuCam, TU_KHOA_CAM_TUYET_DOI } from "../src/lib/quan-su/luan-van-khi/an-toan-noi-dung";
import type { LinhVucKey } from "../src/lib/quan-su/luan-van-khi/types";

const LINH_VUC: LinhVucKey[] = ["tai_van", "quan_van", "suc_khoe", "tinh_duyen"];

describe("SPEC §7 case 1 — điểm Sức khỏe = 0: không từ cấm, có gợi ý khám định kỳ chung", () => {
  it("câu mẫu an toàn cho suc_khoe điểm 0 sạch từ cấm", () => {
    const cau = mauCauAnToan("suc_khoe", 0);
    for (const tu of TU_KHOA_CAM_TUYET_DOI) expect(cau).not.toContain(tu);
    expect(cau).not.toContain("bệnh"); // không nêu bệnh danh cụ thể — kể cả chữ "bệnh" chung chung cũng tránh
    expect(cau).toContain("khám định kỳ");
  });
});

describe("SPEC §7 case 2 — điểm Tình duyên = 0: không ly hôn/chia tay/mất, có vun đắp/thử thách", () => {
  it("câu mẫu an toàn cho tinh_duyen điểm 0 sạch từ cấm + đúng giọng văn xu hướng", () => {
    const cau = mauCauAnToan("tinh_duyen", 0);
    for (const tu of TU_KHOA_CAM_TUYET_DOI) expect(cau).not.toContain(tu);
    expect(cau).not.toContain("chia tay");
    expect(cau).not.toContain("mất người");
    expect(cau).toMatch(/vun đắp|thử thách/);
  });
});

describe("SPEC §7 case 3 — hậu kiểm: đoạn AI giả có từ cấm phải bị chặn/thay thế", () => {
  it("chuỗi AI giả chứa 'ly hôn' bị chặn, thay bằng câu mẫu sạch", () => {
    const vanBanGiaCuaAI = "Giai đoạn này khả năng cao dẫn tới ly hôn, anh nên chuẩn bị tâm lý.";
    const ketQua = hauKiemLoiLuan(vanBanGiaCuaAI, "tinh_duyen", 2);
    expect(ketQua.biChan).toBe(true);
    expect(ketQua.tuBiChan).toContain("ly hôn");
    expect(ketQua.vanBan).not.toContain("ly hôn");
    for (const tu of TU_KHOA_CAM_TUYET_DOI) expect(ketQua.vanBan).not.toContain(tu);
  });

  it("chuỗi AI giả chứa từ cấm khác ('ung thư') cũng bị chặn ở lĩnh vực sức khỏe", () => {
    const vanBanGiaCuaAI = "Có dấu hiệu cần lưu ý liên quan ung thư trong giai đoạn này.";
    const ketQua = hauKiemLoiLuan(vanBanGiaCuaAI, "suc_khoe", 1);
    expect(ketQua.biChan).toBe(true);
    expect(ketQua.tuBiChan).toContain("ung thư");
    expect(ketQua.vanBan).not.toContain("ung thư");
  });

  it("chuỗi AI SẠCH thì đi qua nguyên vẹn, không bị thay", () => {
    const vanBanSach = "Giai đoạn này khá thuận lợi, phù hợp để chủ động hơn trong công việc.";
    const ketQua = hauKiemLoiLuan(vanBanSach, "quan_van", 7);
    expect(ketQua.biChan).toBe(false);
    expect(ketQua.vanBan).toBe(vanBanSach);
  });
});

describe("Toàn bộ câu mẫu an toàn (mọi lĩnh vực × mọi mức điểm 0-10) đều sạch từ cấm — quét vét cạn", () => {
  it("không có tổ hợp (lĩnh vực, điểm) nào sinh ra câu chứa từ cấm", () => {
    for (const lv of LINH_VUC) {
      for (let diem = 0; diem <= 10; diem++) {
        const cau = mauCauAnToan(lv, diem);
        const timThay = timTuCam(cau);
        expect(timThay, `lĩnh vực=${lv} điểm=${diem} câu="${cau}"`).toEqual([]);
      }
    }
  });

  it("disclaimer bắt buộc có nội dung, không rỗng", () => {
    expect(DISCLAIMER_BAT_BUOC.length).toBeGreaterThan(20);
  });
});
