/**
 * GHI LOG CHI PHÍ MỖI LƯỢT GỌI AI.
 *
 * Anh Công hỏi 22/8/2026 "tiền sử dụng AI đã cắn chưa?" — lúc đó hệ thống KHÔNG ghi lại lượt gọi
 * nào, phải mở console.anthropic.com mới biết. Nay mỗi lượt gọi in một dòng vào log máy chủ
 * (Render → Logs), có đủ số token và tiền ước tính quy ra VNĐ.
 *
 * Đơn giá đọc từ handoff/config/gia-ai.json — KHÔNG hard-code, để đổi giá không phải sửa code.
 *
 * ⚠️ MIGRATION Cloudflare Workers (24/8/2026, nhánh cloudflare-migration): xác nhận `gia-ai.json`
 * là config TĨNH, không có chỗ nào trong code GHI vào file này (đã grep toàn repo xác nhận) — cơ
 * chế cập nhật vốn dĩ đã là "sửa file trong git + deploy lại" (đúng ghi chú `_ghi_chu` trong chính
 * file JSON: "Sửa file này khi Anthropic đổi giá — KHÔNG sửa trong code"), không phải dữ liệu
 * runtime cần ghi/đổi khi server đang chạy. Vì vậy đổi từ readFileSync sang import JSON tĩnh là
 * ĐÚNG bản chất (không phải biến bộ nhớ tự chế — `gia-ai.json` vẫn là nguồn duy nhất, chỉ đổi thời
 * điểm đọc từ lúc chạy sang lúc build), KHÔNG cần D1/KV để lưu trạng thái ghi được.
 */
import giaAiJson from "../../../handoff/config/gia-ai.json";

interface GiaModel {
  input_usd_1m: number;
  output_usd_1m: number;
  /** Ghi cache đắt hơn đọc thường (thường 1.25x), đọc cache rẻ hơn (thường 0.1x). */
  he_so_ghi_cache: number;
  he_so_doc_cache: number;
}
interface CauHinhGia {
  ty_gia_vnd_tren_usd: number;
  mac_dinh: string;
  models: Record<string, GiaModel>;
}

function loadGia(): CauHinhGia {
  return giaAiJson as CauHinhGia;
}

export interface UsageAnthropic {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export interface ChiPhiLuot {
  model: string;
  tokenVao: number;
  tokenRa: number;
  tokenGhiCache: number;
  tokenDocCache: number;
  usd: number;
  vnd: number;
  /** true khi khối tri thức được đọc lại từ cache (rẻ ~10 lần). */
  trungCache: boolean;
}

export function tinhChiPhiLuot(model: string, u: UsageAnthropic | undefined): ChiPhiLuot | null {
  if (!u) return null;
  const gia = loadGia();
  const g = gia.models[model] ?? gia.models[gia.mac_dinh];
  if (!g) return null;

  const tokenVao = u.input_tokens ?? 0;
  const tokenRa = u.output_tokens ?? 0;
  const tokenGhiCache = u.cache_creation_input_tokens ?? 0;
  const tokenDocCache = u.cache_read_input_tokens ?? 0;

  const usd =
    (tokenVao * g.input_usd_1m +
      tokenGhiCache * g.input_usd_1m * g.he_so_ghi_cache +
      tokenDocCache * g.input_usd_1m * g.he_so_doc_cache +
      tokenRa * g.output_usd_1m) /
    1_000_000;

  return {
    model, tokenVao, tokenRa, tokenGhiCache, tokenDocCache,
    usd: Math.round(usd * 10000) / 10000,
    vnd: Math.round(usd * gia.ty_gia_vnd_tren_usd),
    trungCache: tokenDocCache > 0,
  };
}

/** In một dòng gọn vào log máy chủ. Xem trên Render → service → Logs, lọc chữ "AI-COST". */
export function ghiLogChiPhi(nhan: string, model: string, u: UsageAnthropic | undefined): ChiPhiLuot | null {
  const cp = tinhChiPhiLuot(model, u);
  if (!cp) {
    console.log(`[AI-COST] ${nhan} | model=${model} | không đọc được usage từ phản hồi`);
    return null;
  }
  console.log(
    `[AI-COST] ${nhan} | model=${cp.model} | vào=${cp.tokenVao} ra=${cp.tokenRa} ` +
      `ghiCache=${cp.tokenGhiCache} đọcCache=${cp.tokenDocCache} | ` +
      `${cp.trungCache ? "TRÚNG CACHE" : "cache mới"} | ~${cp.vnd.toLocaleString("vi-VN")}đ (${cp.usd} USD)`,
  );
  return cp;
}
