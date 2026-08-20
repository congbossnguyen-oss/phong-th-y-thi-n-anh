import type { APIRoute } from "astro";
import { taoHoSoNghe } from "../../lib/nghe-nghiep/tao-ho-so-nghe";

export const prerender = false;

// ⚠️ TẠM THỜI — verify toàn bộ bản vá hôm nay chạy đúng với AI thật trên production. Xóa sau khi OK.
export const GET: APIRoute = async ({ url }) => {
  if (url.searchParams.get("run") !== "1") return new Response('{"hint":"?run=1"}', { headers: { "Content-Type": "application/json" } });
  try {
    const kq = await taoHoSoNghe({ day: 14, month: 3, year: 1996, hour: 9, minute: 20, gender: "Nam" });
    const jargonPattern = /insufficient_data|archetype|Career Vector|Nudge|cosine|Jaccard|domain_score|mechanisms\[|nguu_hanh\[|\.md\b|\.json\b|_[a-z]+_[a-z]+/i;

    const allText = JSON.stringify({ bt: kq.batTuVM, tv: kq.tuViVM, kh: kq.ketHop });
    const found = allText.match(jargonPattern);

    const btTimelineTrong = kq.batTuVM.timeline.filter((t) => t.chuDe === "Chưa xác định" || t.chuDe === "đang cập nhật" || !t.chuDe);
    const tvTimelineTrong = kq.tuViVM.timeline.filter((t) => t.chuDe === "Chưa xác định" || t.chuDe === "đang cập nhật" || !t.chuDe);

    const out = {
      batTuAiOk: kq.batTuVM ? true : false,
      jargonLeakFound: found ? found[0] : null,
      btTimelineCount: kq.batTuVM.timeline.length,
      btTimelineTrongCount: btTimelineTrong.length,
      tvTimelineCount: kq.tuViVM.timeline.length,
      tvTimelineTrongCount: tvTimelineTrong.length,
      tuTruOk: !!kq.batTuVM.tuTru && kq.batTuVM.tuTru.length === 4,
      nguHanhPhanBoOk: !!kq.batTuVM.nguHanhPhanBo && kq.batTuVM.nguHanhPhanBo.reduce((s, p) => s + p.phanTram, 0) === 100,
      ngaySinh: kq.batTuVM.ngaySinhDuongLich,
      ketHopAgreement: kq.ketHop.insufficient ? null : kq.ketHop.agreement,
      sampleWhy: kq.batTuVM.why.slice(0, 2),
      sampleTuViWhy: kq.tuViVM.why.slice(0, 2),
    };
    return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? `${e.message}\n${e.stack}` : String(e) }, null, 2), { headers: { "Content-Type": "application/json" } });
  }
};
