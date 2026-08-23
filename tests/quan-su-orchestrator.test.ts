// Kiểm tra Orchestrator — chạy 1 lượt hỏi Kinh Dịch từ đầu đến cuối (khung hoàn chỉnh).

import { describe, expect, it } from "vitest";
import { runQuanSu } from "../src/lib/quan-su/orchestrator";
import type { CoinLineValue } from "../src/lib/luc-hao";

const NGAY_SINH = { day: 20, month: 5, year: 1990, gender: "Nam" as const, hour: 10 };
const TOSSES: CoinLineValue[] = [9, 7, 8, 6, 7, 8];
const VERDICTS = ["NEN", "KHONG_NEN", "NEN_CHO", "CO_DIEU_KIEN", "CHUA_DU_DU_LIEU"];

describe("Orchestrator — chạy đầu-cuối", () => {
  it("câu Kinh Dịch: trả BÁO CÁO CỐ VẤN + chi tiết quẻ + vận trình", async () => {
    const r = await runQuanSu({ question_id: "dau-tu-du-an", tosses: TOSSES, ngaySinh: NGAY_SINH, boQuaAI: true });
    expect(r.question.id).toBe("dau-tu-du-an");
    expect(VERDICTS).toContain(r.report.ketLuan);
    expect(r.report.mucDoThuan).toBeGreaterThanOrEqual(0);
    expect(r.report.mucDoThuan).toBeLessThanOrEqual(100);
    expect(r.report.diemThuan).toHaveLength(3);
    expect(r.report.diemLuuY).toHaveLength(3);
    expect(r.report.quanSuKhuyen).toHaveLength(3);
    expect(r.que.chinh.name.length).toBeGreaterThan(0);
    expect(r.que.dongPositions).toEqual([1, 4]);
    expect(r.vanTrinh).not.toBeNull();
    expect(r.report.vanTrinh).not.toBeNull();
    expect(r.isDemo).toBe(true);
  });

  it("gieo giúp (không truyền tosses) vẫn chạy, tái lập được với cùng RNG", async () => {
    let seed = 7;
    const rng = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const a = await runQuanSu({ question_id: "chuyen-viec", ngaySinh: NGAY_SINH, rng, boQuaAI: true });
    seed = 7;
    const b = await runQuanSu({ question_id: "chuyen-viec", ngaySinh: NGAY_SINH, rng, boQuaAI: true });
    expect(a.que.chinh.name).toBe(b.que.chinh.name);
    expect(a.report.mucDoThuan).toBe(b.report.mucDoThuan);
  });

  it("không có ngày sinh → vẫn luận được bằng quẻ, vận trình = null", async () => {
    const r = await runQuanSu({ question_id: "chuyen-viec", tosses: TOSSES, boQuaAI: true });
    expect(r.vanTrinh).toBeNull();
    expect(r.report.vanTrinh).toBeNull();
    expect(r.report.xuHuong.length).toBeGreaterThan(0);
  });

  it("nhóm nhạy cảm (kiện tụng) → khuyên CÓ nhắc luật sư", async () => {
    const r = await runQuanSu({ question_id: "co-nen-kien", tosses: TOSSES, ngaySinh: NGAY_SINH, boQuaAI: true });
    expect(r.report.quanSuKhuyen.some((s) => s.includes("luật sư"))).toBe(true);
  });

  it("nhóm sức khỏe → khuyên nhắc bác sĩ", async () => {
    const r = await runQuanSu({ question_id: "dieu-tri", tosses: TOSSES, ngaySinh: NGAY_SINH, boQuaAI: true });
    expect(r.report.quanSuKhuyen.some((s) => s.includes("bác sĩ"))).toBe(true);
  });

  it("câu chọn-ngày-giờ → TỪ CHỐI (phải đi trach-nhat)", async () => {
    await expect(runQuanSu({ question_id: "chon-ngay-khai-truong", tosses: TOSSES, boQuaAI: true })).rejects.toThrow();
  });

  it("câu không tồn tại → báo lỗi", async () => {
    await expect(runQuanSu({ question_id: "khong-co-that", tosses: TOSSES, boQuaAI: true })).rejects.toThrow();
  });
});
