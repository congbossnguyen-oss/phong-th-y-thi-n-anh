/**
 * Astrology Phase 10B (D-C, HUMAN RATIFIED) — professional reading history.
 *
 * Internal/professional audit resource, NOT a customer feature (see PHASE10B_SPEC.md §15). Mirrors
 * the write/read shape of `src/lib/quan-su/lich-su-luan.ts` (same dauVao/ketQua jsonb pattern), but
 * deliberately does NOT scope reads to "only the author may view their own rows" — D-C's purpose is
 * shared professional tra cứu/đối chiếu/audit among admins, not a personal customer history.
 *
 * Stores the FULL `WesternAstrologyMvpViewModel` (chart metadata, chartData — planets/angles/
 * houseCusps/aspects/factors — and interpretations with ruleIds/evidenceIds/supportingFactorIds) so a
 * past reading's entire provenance chain (calculation → factors → rules → evidence → interpretation →
 * narrative) can be audited later without recomputation. No astrology-core change needed — this reuses
 * the already-validated ViewModel shape as-is.
 */
import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { chiemTinhLichSu } from "../../../db/schema";
import type { WesternAstrologyMvpInput, WesternAstrologyMvpViewModel } from "./view-model";

/** Ghi 1 lượt lập lá số vào lịch sử chuyên môn. Gọi sau khi `runWesternAstrologyMvp` trả kết quả
 * xác định (status "success" hoặc "empty_interpretation" — có chart thật để đối chiếu); bỏ qua
 * "missing_input"/"calculation_error" (không có gì để truy nguyên). */
export async function luuLichSuChiemTinh(
  userId: string,
  input: WesternAstrologyMvpInput,
  ketQua: WesternAstrologyMvpViewModel,
): Promise<void> {
  const calculationId = ketQua.chart?.calculationId;
  if (calculationId === undefined) return; // không có chart (missing_input/calculation_error) — không lưu
  await db.insert(chiemTinhLichSu).values({ userId, calculationId, dauVao: input, ketQua });
}

export interface MucLichSuChiemTinh {
  id: string;
  userId: string;
  calculationId: string;
  dauVao: WesternAstrologyMvpInput;
  ketQua: WesternAstrologyMvpViewModel;
  createdAt: Date;
}

/** Danh sách lịch sử DÙNG CHUNG cho mọi admin/chuyên gia (không lọc theo userId) — mới nhất lên đầu. */
export async function layLichSuChiemTinh(limit = 50, offset = 0): Promise<MucLichSuChiemTinh[]> {
  const rows = await db.select().from(chiemTinhLichSu).orderBy(desc(chiemTinhLichSu.createdAt)).limit(limit).offset(offset);
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    calculationId: r.calculationId,
    dauVao: r.dauVao as WesternAstrologyMvpInput,
    ketQua: r.ketQua as WesternAstrologyMvpViewModel,
    createdAt: r.createdAt,
  }));
}

/** 1 lượt cụ thể theo calculationId — dùng để đối chiếu/audit một lá số đã lập trước đó. */
export async function layMotLuotTheoCalculationId(calculationId: string): Promise<MucLichSuChiemTinh | null> {
  const [r] = await db.select().from(chiemTinhLichSu).where(eq(chiemTinhLichSu.calculationId, calculationId)).limit(1);
  if (!r) return null;
  return {
    id: r.id,
    userId: r.userId,
    calculationId: r.calculationId,
    dauVao: r.dauVao as WesternAstrologyMvpInput,
    ketQua: r.ketQua as WesternAstrologyMvpViewModel,
    createdAt: r.createdAt,
  };
}
