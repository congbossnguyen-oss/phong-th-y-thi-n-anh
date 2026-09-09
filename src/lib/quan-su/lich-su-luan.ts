/**
 * LỊCH SỬ LUẬN GIẢI Kinh Dịch — chủ dự án yêu cầu 10/9/2026: khách phản hồi "hỏi quẻ rồi quên mất
 * kết quả, không biết tra lại ở đâu" vì trước đây kết quả chỉ trả về màn hình, KHÔNG lưu gì cả (bảng
 * `quan_su_cau_hoi_luot` chỉ ghi question_id để thống kê xu hướng, không lưu quẻ/lời luận).
 *
 * Lưu NGUYÊN đầu vào (`RunQuanSuInput`) và đầu ra (`QuanSuResult`) làm 2 cột jsonb — xem chú thích
 * đầy đủ ở `db/schema.ts` (bảng `quanSuLichSuLuan`). CHỈ khách tự xem lại của mình, giữ 6 THÁNG rồi
 * tự dọn (xem `xoaLichSuLuanQuaHan`, gọi từ cron `worker-entry.ts`).
 */
import { and, desc, eq, lt } from "drizzle-orm";
import { db } from "../db/client";
import { quanSuLichSuLuan } from "../../../db/schema";
import type { CastingMethod, RunQuanSuInput, QuanSuResult } from "./orchestrator";

/** Giữ 6 tháng (chủ dự án chốt 10/9/2026) — xem lý do chọn mốc này ở chú thích db/schema.ts. */
const SO_NGAY_GIU = 180;

/** Ghi 1 lượt luận giải THÀNH CÔNG vào lịch sử — gọi ngay sau khi `runQuanSu` trả kết quả. */
export async function luuLichSuLuan(
  userId: string,
  input: RunQuanSuInput,
  ketQua: QuanSuResult,
): Promise<void> {
  const { rng: _rng, boQuaAI: _boQuaAI, ...dauVao } = input; // bỏ 2 trường kỹ thuật, không cần lưu
  await db.insert(quanSuLichSuLuan).values({
    userId,
    questionId: input.question_id,
    castingMethod: input.castingMethod ?? "gieo-tay",
    dauVao,
    ketQua,
  });
}

export interface MucLichSuLuan {
  id: string;
  questionId: string;
  castingMethod: CastingMethod;
  dauVao: Omit<RunQuanSuInput, "rng" | "boQuaAI">;
  ketQua: QuanSuResult;
  createdAt: Date;
}

/** Trang danh sách lịch sử của 1 khách — mới nhất lên đầu. */
export async function layLichSuLuan(userId: string, limit = 20, offset = 0): Promise<MucLichSuLuan[]> {
  const rows = await db
    .select()
    .from(quanSuLichSuLuan)
    .where(eq(quanSuLichSuLuan.userId, userId))
    .orderBy(desc(quanSuLichSuLuan.createdAt))
    .limit(limit)
    .offset(offset);
  return rows.map((r) => ({
    id: r.id,
    questionId: r.questionId,
    castingMethod: r.castingMethod as CastingMethod,
    dauVao: r.dauVao as Omit<RunQuanSuInput, "rng" | "boQuaAI">,
    ketQua: r.ketQua as QuanSuResult,
    createdAt: r.createdAt,
  }));
}

/** 1 lượt cụ thể — dùng cho trang xem chi tiết, phải KHỚP đúng userId (không cho xem của người khác). */
export async function layMotLuotLichSu(userId: string, id: string): Promise<MucLichSuLuan | null> {
  const [r] = await db
    .select()
    .from(quanSuLichSuLuan)
    .where(and(eq(quanSuLichSuLuan.id, id), eq(quanSuLichSuLuan.userId, userId)))
    .limit(1);
  if (!r) return null;
  return {
    id: r.id,
    questionId: r.questionId,
    castingMethod: r.castingMethod as CastingMethod,
    dauVao: r.dauVao as Omit<RunQuanSuInput, "rng" | "boQuaAI">,
    ketQua: r.ketQua as QuanSuResult,
    createdAt: r.createdAt,
  };
}

/** Dọn bản ghi quá 6 tháng — gọi từ cron hằng ngày (worker-entry.ts). Trả về số dòng đã xoá. */
export async function xoaLichSuLuanQuaHan(): Promise<number> {
  const moc = new Date(Date.now() - SO_NGAY_GIU * 24 * 60 * 60 * 1000);
  const xoa = await db
    .delete(quanSuLichSuLuan)
    .where(lt(quanSuLichSuLuan.createdAt, moc))
    .returning({ id: quanSuLichSuLuan.id });
  return xoa.length;
}
