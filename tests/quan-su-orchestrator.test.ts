// Kiểm tra Orchestrator — chạy 1 lượt hỏi Kinh Dịch từ đầu đến cuối (khung hoàn chỉnh).

import { describe, expect, it } from "vitest";
import { runQuanSu } from "../src/lib/quan-su/orchestrator";
import type { CoinLineValue } from "../src/lib/luc-hao";

const NGAY_SINH = { day: 20, month: 5, year: 1990, gender: "Nam" as const, hour: 10 };
const TOSSES: CoinLineValue[] = [9, 7, 8, 6, 7, 8];

describe("Orchestrator — chạy đầu-cuối", () => {
  it("câu Kinh Dịch: trả KẾT QUẢ QUÂN SƯ (mở/thân/kết) + chi tiết quẻ + vận trình", () => {
    const r = runQuanSu({ question_id: "dau-tu-du-an", tosses: TOSSES, ngaySinh: NGAY_SINH });
    expect(r.question.id).toBe("dau-tu-du-an");
    expect(r.ketQuaQuanSu.mo_bai.length).toBeGreaterThan(0);
    expect(r.ketQuaQuanSu.than_bai.length).toBeGreaterThan(0);
    expect(r.ketQuaQuanSu.ket_luan.cau_tra_loi.length).toBeGreaterThan(0);
    expect(r.chiTiet.que.chinh.length).toBeGreaterThan(0);
    expect(r.chiTiet.que.dongPositions).toEqual([1, 4]);
    expect(r.chiTiet.vanTrinh).not.toBeNull(); // có ngày sinh → có vận trình
    expect(r.chiTiet.vanTrinh?.dimensions).toHaveLength(4);
    expect(r.isDemo).toBe(true); // luận giải hiện là bản demo
  });

  it("gieo giúp (không truyền tosses) vẫn chạy, tái lập được với cùng RNG", () => {
    let seed = 7;
    const rng = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const a = runQuanSu({ question_id: "chuyen-viec", ngaySinh: NGAY_SINH, rng });
    seed = 7;
    const b = runQuanSu({ question_id: "chuyen-viec", ngaySinh: NGAY_SINH, rng });
    expect(a.chiTiet.que.chinh).toBe(b.chiTiet.que.chinh);
  });

  it("không có ngày sinh → vẫn luận được bằng quẻ, vận trình = null", () => {
    const r = runQuanSu({ question_id: "chuyen-viec", tosses: TOSSES });
    expect(r.chiTiet.vanTrinh).toBeNull();
    expect(r.ketQuaQuanSu.mo_bai.length).toBeGreaterThan(0);
  });

  it("nhóm nhạy cảm (kiện tụng) → kết luận CÓ cảnh báo pháp lý trong luu_y", () => {
    const r = runQuanSu({ question_id: "co-nen-kien", tosses: TOSSES, ngaySinh: NGAY_SINH });
    expect(r.ketQuaQuanSu.ket_luan.luu_y.some((s) => s.includes("luật sư"))).toBe(true);
  });

  it("nhóm sức khỏe → cảnh báo gặp bác sĩ", () => {
    const r = runQuanSu({ question_id: "dieu-tri", tosses: TOSSES, ngaySinh: NGAY_SINH });
    expect(r.ketQuaQuanSu.ket_luan.luu_y.some((s) => s.includes("bác sĩ"))).toBe(true);
  });

  it("câu chọn-ngày-giờ → TỪ CHỐI (phải đi trach-nhat, không qua orchestrator Kinh Dịch)", () => {
    expect(() => runQuanSu({ question_id: "chon-ngay-khai-truong", tosses: TOSSES })).toThrow();
  });

  it("câu không tồn tại → báo lỗi", () => {
    expect(() => runQuanSu({ question_id: "khong-co-that", tosses: TOSSES })).toThrow();
  });
});
