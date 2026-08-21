/**
 * Kiểm tra đầu vào dùng chung cho các route của module Trạch Nhật Sinh Nở.
 * Đặt tên bắt đầu bằng "_" để Astro KHÔNG coi là route.
 */
import type { BirthSelectionInput } from "../../../../lib/trach-nhat-sinh-no";

export const TOOL_SLUG = "trach-nhat-sinh-no";
export const TIMEZONE = "Asia/Ho_Chi_Minh";

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export interface KetQuaDoc {
  ok: true;
  input: BirthSelectionInput;
}
export interface LoiDoc {
  ok: false;
  error: string;
}

function docNgay(v: unknown): { year: number; month: number; day: number } | null {
  const o = v as Record<string, unknown> | undefined;
  const d = { year: Number(o?.year), month: Number(o?.month), day: Number(o?.day) };
  if (!Number.isInteger(d.year) || !Number.isInteger(d.month) || !Number.isInteger(d.day)) return null;
  if (d.month < 1 || d.month > 12 || d.day < 1 || d.day > 31) return null;
  return d;
}

const KHOANG_NGAY_TOI_DA = 31; // 31 ngày × 12 giờ = tối đa 372 ứng viên — đủ rộng, tránh treo máy chủ.

export function docInput(body: unknown): KetQuaDoc | LoiDoc {
  if (!body || typeof body !== "object") return { ok: false, error: "Dữ liệu gửi lên không hợp lệ." };
  const b = body as Record<string, unknown>;

  const startDate = docNgay(b.startDate);
  const endDate = docNgay(b.endDate);
  if (!startDate || !endDate) return { ok: false, error: "Vui lòng chọn đầy đủ khung ngày dự sinh (từ ngày – đến ngày)." };

  const startUtc = Date.UTC(startDate.year, startDate.month - 1, startDate.day);
  const endUtc = Date.UTC(endDate.year, endDate.month - 1, endDate.day);
  if (endUtc < startUtc) return { ok: false, error: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu." };
  const soNgay = Math.round((endUtc - startUtc) / 86_400_000) + 1;
  if (soNgay > KHOANG_NGAY_TOI_DA) return { ok: false, error: `Khung dự sinh tối đa ${KHOANG_NGAY_TOI_DA} ngày.` };

  const babyGender = b.babyGender;
  if (babyGender !== "Nam" && babyGender !== "Nữ") {
    return { ok: false, error: "Vui lòng chọn giới tính của bé — bắt buộc để tính đúng chiều Đại Vận/Đại Hạn." };
  }

  const deliveryMode = b.deliveryMode;
  if (deliveryMode !== "scheduled_c_section" && deliveryMode !== "labor" && deliveryMode !== "unknown") {
    return { ok: false, error: "Vui lòng chọn hình thức sinh." };
  }

  let hospitalTimeWindows: BirthSelectionInput["hospitalTimeWindows"];
  if (Array.isArray(b.hospitalTimeWindows) && b.hospitalTimeWindows.length > 0) {
    hospitalTimeWindows = (b.hospitalTimeWindows as Record<string, unknown>[])
      .map((w) => {
        const startHour = Number(w.startHour);
        const endHour = Number(w.endHour);
        if (!Number.isFinite(startHour) || !Number.isFinite(endHour) || startHour < 0 || startHour > 23 || endHour < 0 || endHour > 24) return null;
        return { startHour, endHour };
      })
      .filter((w): w is { startHour: number; endHour: number } => w !== null);
  }

  const familyPriority = b.familyPriority;
  const hopLe: BirthSelectionInput["familyPriority"][] = ["health", "wealth", "career", "academic", "balanced"];
  const familyPriorityChuan: BirthSelectionInput["familyPriority"] = hopLe.includes(familyPriority as never) ? (familyPriority as BirthSelectionInput["familyPriority"]) : "balanced";

  return {
    ok: true,
    input: {
      startDate, endDate, babyGender, deliveryMode,
      ...(hospitalTimeWindows && hospitalTimeWindows.length > 0 ? { hospitalTimeWindows } : {}),
      timeZone: TIMEZONE,
      familyPriority: familyPriorityChuan,
    },
  };
}
