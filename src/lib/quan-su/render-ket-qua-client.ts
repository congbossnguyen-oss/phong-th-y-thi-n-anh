// HIỂN THỊ KẾT QUẢ QUÂN SƯ (client-side) — trích từ `src/pages/quan-su/hoi/[id].astro` (10/9/2026)
// để dùng lại ở trang Lịch sử luận giải (`/quan-su/lich-su/[id].astro`) mà KHÔNG chép lại ~250
// dòng — sửa cách hiển thị kết quả ở 1 chỗ thì cả 2 nơi (lượt hỏi mới + xem lại lịch sử cũ) đều
// ăn theo, khỏi lệch nhau dần theo thời gian.
//
// CHỈ nhận dữ liệu (`data`, `zaloHref`) qua tham số, KHÔNG đọc DOM trực tiếp — trang gọi tự lo phần
// gắn vào `innerHTML` + cuộn tới, xem cách dùng ở `hoi/[id].astro` và `lich-su/[id].astro`.
import { CAN, CHI } from "../menh-nap-am";
import { CHI_NGU_HANH } from "../bat-tu";

export function esc(s: unknown): string {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}

function points(cls: string, arr: string[]): string {
  return `<ul class="qs-points ${cls}">${arr.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`;
}

function bar(dim: { label: string; score: number; higherIsBetter: boolean }): string {
  const pct = Math.round((dim.score / 10) * 100);
  const warn = dim.higherIsBetter ? "" : " warn";
  const note = dim.higherIsBetter ? "" : ' <span style="color:var(--qs-muted);font-size:0.72rem;">(càng cao càng thận trọng)</span>';
  return `<div class="qs-dim${warn}"><div class="lab"><span>${dim.label}${note}</span><span>${dim.score}/10</span></div><div class="track"><div class="fill" style="width:${pct}%"></div></div></div>`;
}

// Bảng quẻ đầy đủ (Nạp Giáp, Lục Thân, Thế/Ứng, Tuần Không, Lục Thú) — dark theme khớp trang, KHÁC
// bản "thẻ giấy" xuất PNG ở /gieo-que-kinh-dich. Thầy, 2026-08-23: "phải cho anh hiện ra ảnh quẻ
// dịch... anh đối chiếu mới biết đúng hay sai về cách luận giải" — khách và Thầy cần tự soát số
// liệu gốc, không chỉ tin lời luận của AI.
const LUC_THAN_TAT: Record<string, string> = { "Huynh Đệ": "Huynh", "Tử Tôn": "Tử", "Thê Tài": "Thê", "Quan Quỷ": "Quan", "Phụ Mẫu": "Phụ" };

function lineBarHtml(value: number, isDong: boolean): string {
  const color = isDong ? "var(--qs-gold)" : "var(--qs-ivory)";
  const barHtml = value === 1
    ? `<div style="height:6px;border-radius:2px;background:${color};"></div>`
    : `<div style="height:6px;display:flex;justify-content:space-between;"><div style="width:42%;height:100%;border-radius:2px;background:${color};"></div><div style="width:42%;height:100%;border-radius:2px;background:${color};"></div></div>`;
  return `<div style="width:16px;">${barHtml}</div>`;
}

// Bảng thu gọn tối đa để 2 cột (Chính/Biến) vừa khung điện thoại hẹp nhất mà KHÔNG tràn trang.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function queTableHtml(q: any, isBien: boolean, dongPositions: number[]): string {
  const rows = [...q.hao].reverse();
  const rowsHtml = rows
    .map((h: any) => {
      const isRowDong = h.isDong || (isBien && dongPositions.includes(h.hao));
      const rc = isRowDong ? "var(--qs-gold)" : "var(--qs-ivory)";
      const fw = isRowDong ? "700" : "400";
      return `
        <tr style="border-bottom:1px solid rgba(241,200,90,0.1);">
          <td style="padding:4px 2px;">${lineBarHtml(h.value, isRowDong)}</td>
          <td style="padding:4px 3px;color:${rc};font-weight:${fw};font-size:0.66rem;white-space:nowrap;">${h.theUng ?? ""}</td>
          <td style="padding:4px 3px;color:${rc};font-weight:${fw};font-size:0.66rem;white-space:nowrap;">${esc(LUC_THAN_TAT[h.lucThan] ?? h.lucThan)}</td>
          <td style="padding:4px 3px;color:${rc};font-weight:${fw};font-size:0.66rem;white-space:nowrap;">${CAN[h.canIndex]}${CHI[h.chiIndex]}<br/><span style="font-size:0.56rem;color:var(--qs-muted);font-weight:400;">${CHI_NGU_HANH[h.chiIndex]}</span></td>
          <td style="padding:4px 2px;text-align:center;">${h.xunKong ? `<span style="display:inline-block;width:6px;height:6px;border-radius:999px;background:${rc};" title="Tuần Không"></span>` : ""}</td>
        </tr>`;
    })
    .join("");
  return `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;min-width:150px;">
        <thead>
          <tr style="color:var(--qs-gold);font-size:0.56rem;text-transform:uppercase;letter-spacing:0.01em;">
            <th style="padding:2px;"></th><th style="padding:2px;text-align:left;">T/Ư</th><th style="padding:2px;text-align:left;">L.Thân</th><th style="padding:2px;text-align:left;">Can Chi</th><th style="padding:2px;text-align:center;">T.K</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

// Quẻ chính + quẻ biến CÙNG HÀNG, sát nhau (Thầy: "cho sát lại gần nhau chút", 2026-08-23).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderQueDayDu(que: any): string {
  const dongPositions = que.dongPositions || [];
  const coBien = !!que.bien;
  const chinhBlock = `<div><h4 style="margin:0 0 0.4rem;color:var(--qs-gold);font-size:0.82rem;">Quẻ chính<br/><span style="color:var(--qs-ivory);font-size:0.95rem;">${esc(que.chinh.name)}</span></h4>${queTableHtml(que.chinh, false, dongPositions)}</div>`;
  const bienBlock = coBien
    ? `<div><h4 style="margin:0 0 0.4rem;color:var(--qs-gold);font-size:0.82rem;">Quẻ biến<br/><span style="color:var(--qs-ivory);font-size:0.95rem;">${esc(que.bien.name)}</span></h4>${queTableHtml(que.bien, true, dongPositions)}</div>`
    : "";
  const phucThanHao = que.chinh.hao.filter((h: any) => h.phucThan);
  const phucThanNote = phucThanHao.length
    ? `<p style="margin:0.5rem 0 0;color:var(--qs-muted);font-size:0.74rem;">Phục Thần: ${phucThanHao.map((h: any) => `hào ${h.hao} ẩn ${LUC_THAN_TAT[h.phucThan.lucThan]}-${CHI[h.phucThan.chiIndex]}`).join(", ")}</p>`
    : "";
  const ngamNote = (que.fanYin && que.fanYin.enabled) || (que.fuYin && que.fuYin.enabled)
    ? `<p style="margin:0.3rem 0 0;color:var(--qs-gold);font-size:0.78rem;">${[que.fanYin?.enabled ? que.fanYin.label : null, que.fuYin?.enabled ? que.fuYin.label : null].filter(Boolean).join(" · ")}</p>`
    : "";
  return `
    <p style="margin:0 0 0.6rem;color:var(--qs-muted);font-size:0.8rem;">
      ${esc(que.canChiText)} · Tuần Không: <strong style="color:var(--qs-ivory);">${esc(que.tuanKhong)}</strong> · Nhật thần: <strong style="color:var(--qs-ivory);">${esc(que.nhatThan)}</strong> · Nguyệt lệnh: <strong style="color:var(--qs-ivory);">${esc(que.nguyetLenh)}</strong>
    </p>
    <div style="display:grid;grid-template-columns:${coBien ? "minmax(0,1fr) minmax(0,1fr)" : "minmax(0,1fr)"};gap:0.6rem;min-width:0;">
      ${chinhBlock}${bienBlock}
    </div>
    ${phucThanNote}
    ${ngamNote}`;
}

/**
 * HTML đầy đủ của khối "KẾT QUẢ QUÂN SƯ" cho 1 lượt hỏi — dùng cho cả lượt MỚI (hoi/[id].astro) và
 * lượt XEM LẠI trong lịch sử (lich-su/[id].astro). `data` là `QuanSuResult` (+ `hoaGiaiBiKhoa`) —
 * xem `orchestrator.ts`. `zaloHref` để trống thì bỏ nút liên hệ Zalo ở phần hóa giải.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderKetQuaHtml(data: any, zaloHref: string): string {
  const rep = data.report;
  const que = data.que;
  let luckHtml = "";
  if (rep.vanTrinh) {
    const bars = rep.vanTrinh.chiBao.map(bar).join("");
    luckHtml = `<div class="qs-luck"><h3>Vận trình hiện tại</h3>
      <div style="color:var(--qs-muted);font-size:0.82rem;margin-bottom:0.6rem;">Đại vận ${esc(rep.vanTrinh.daiVan)} · Năm ${esc(rep.vanTrinh.namHienTai)}</div>
      ${bars}</div>`;
  }
  const ai = data.luanAI;
  const li = (arr: string[]) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join("");
  const khoiAI = ai
    ? `
      <div class="qs-sect"><h4>Quân Sư luận</h4>
        <ul style="margin:0;padding-left:1.1rem;line-height:1.75;">${li(ai.phan_tich)}</ul>
      </div>
      ${ai.nguyen_nhan_cot_loi ? `<div class="qs-sect"><h4>Gốc rễ vấn đề</h4><p style="margin:0;line-height:1.75;">${esc(ai.nguyen_nhan_cot_loi)}</p></div>` : ""}
      <div class="qs-sect"><h4>Điểm cần lưu tâm</h4>
        <ul style="margin:0;padding-left:1.1rem;line-height:1.75;">${li(ai.diem_can_luu_y)}</ul>
      </div>
      <div class="qs-sect"><h4>Quân Sư khuyên</h4>
        <ul style="margin:0;padding-left:1.1rem;line-height:1.75;">${li(ai.quan_su_khuyen)}</ul>
      </div>
      ${ai.phuong_phap_hoa_giai && ai.phuong_phap_hoa_giai.length
        ? `<div class="qs-sect"><h4>Cách hóa giải</h4>
            <ul style="margin:0;padding-left:1.1rem;line-height:1.75;">${li(ai.phuong_phap_hoa_giai)}</ul>
            <p style="margin:0.7rem 0 0;color:var(--qs-muted);font-size:0.8rem;line-height:1.6;">Cách hóa giải trên chỉ mang tính tham khảo, không đảm bảo hiệu quả 100% — hóa giải cần có sự linh ứng, kết hợp đúng thiên thời - địa lợi - nhân hòa, an vị vật phẩm hoặc khai quang đúng cách. Để được tư vấn chuyên sâu và thực hiện đúng, anh/chị nên liên hệ trực tiếp.</p>
            ${zaloHref ? `<a href="${zaloHref}" target="_blank" rel="noopener" class="qs-btn" style="text-decoration:none;display:inline-flex;margin-top:0.6rem;">Liên hệ trợ lý Thầy Zhi Gong (Zalo)</a>` : ""}
          </div>`
        : data.hoaGiaiBiKhoa
        ? `<div class="qs-sect"><h4>🔒 Cách hóa giải</h4>
            <p style="margin:0 0 0.6rem;color:var(--qs-muted);line-height:1.7;">Quẻ này có chỉ dấu cần hóa giải — phương pháp cụ thể chỉ mở cho gói Cao cấp.</p>
            <a href="/quan-su/goi-thue-bao" class="qs-btn" style="text-decoration:none;display:inline-flex;">Nâng cấp gói Cao cấp</a>
          </div>`
        : ""}
      ${ai.thoi_diem_khuyen_nghi ? `<div class="qs-sect"><h4>Thời điểm</h4><p style="margin:0;line-height:1.75;">${esc(ai.thoi_diem_khuyen_nghi)}</p></div>` : ""}`
    : `
      <div class="qs-sect"><h4>Điểm thuận</h4>${points("thuan", rep.diemThuan)}</div>
      <div class="qs-sect"><h4>Điểm cần lưu ý</h4>${points("luuy", rep.diemLuuY)}</div>
      <div class="qs-sect"><h4>Quân Sư khuyên</h4>${points("khuyen", rep.quanSuKhuyen)}</div>`;

  return `
    <div class="qs-verdict">
      <h2>KẾT QUẢ QUÂN SƯ</h2>
      <div class="qs-badge ${rep.ketLuan}">${esc(rep.ketLuanLabel)}</div>
      <div class="qs-score">
        <div class="lab"><span>Mức độ thuận</span><span>${rep.mucDoThuan}/100</span></div>
        <div class="track"><div class="fill" style="width:${rep.mucDoThuan}%"></div></div>
      </div>
      <p>${esc(rep.xuHuong)}</p>
      ${khoiAI}
      ${data.isDemo ? '<div class="qs-demo">⚙ Bản luận này dựa trên quy tắc Lục Hào từ số liệu quẻ (Dụng Thần, vượng suy, hào động, hóa biến…). Xem chi tiết ở mục "Xem luận giải chi tiết" bên dưới.</div>' : ""}
    </div>
    ${luckHtml}
    <div class="qs-luck" style="margin-top:1rem;">
      <h3>Quẻ đã gieo — đối chiếu số liệu gốc</h3>
      ${renderQueDayDu(que)}
    </div>
    <details class="qs-detail">
      <summary>Xem luận giải chi tiết (chấm điểm theo luật)</summary>
      <div class="body">
        ${esc(rep.luanGiaiChiTiet).replace(/\n/g, "<br>")}<br><br>
        Bảng chấm điểm:
        <ul style="margin:0.4rem 0 0;padding-left:1.1rem;">
          ${rep.bangChamDiem.map((i: any) => `<li>${i.delta > 0 ? "+" : ""}${i.delta} · ${esc(i.factor)} — ${esc(i.reason)}</li>`).join("") || "<li>(không có điều chỉnh)</li>"}
        </ul>
      </div>
    </details>`;
}
