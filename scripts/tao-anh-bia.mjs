// Tự tạo ẢNH BÌA on-brand (SVG) cho bài blog khi kho không có ảnh phù hợp.
// On-brand: nền oxblood, chữ kem, viền + họa tiết la bàn/bát quái vàng, tiêu đề bài.
// Không cần dependency ngoài. Thầy Zhi Gong sẽ thay ảnh thật sau nếu muốn.

const CATEGORY_LABELS = {
  "kien-thuc-ung-dung": "Kiến thức ứng dụng",
  "nha-o": "Nhà ở",
  "van-phong-kinh-doanh": "Văn phòng · Kinh doanh",
  "vat-pham": "Vật phẩm phong thủy",
};

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapTitle(title, maxChars) {
  const words = String(title).trim().split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= maxChars) cur += " " + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function taoAnhBiaSVG(title, category) {
  const W = 1200,
    H = 630;
  const eyebrow = (CATEGORY_LABELS[category] || "Phong thủy").toUpperCase();

  // Cỡ chữ theo độ dài tiêu đề.
  const len = String(title).length;
  let fontSize, maxChars;
  if (len <= 42) {
    fontSize = 66;
    maxChars = 20;
  } else if (len <= 64) {
    fontSize = 56;
    maxChars = 24;
  } else {
    fontSize = 48;
    maxChars = 28;
  }
  let lines = wrapTitle(title, maxChars);
  if (lines.length > 4) {
    fontSize = 42;
    maxChars = 32;
    lines = wrapTitle(title, maxChars);
  }
  lines = lines.slice(0, 5);

  const lineHeight = Math.round(fontSize * 1.2);
  const centerY = 340; // căn giữa vùng thân [180..500]
  const blockH = lines.length * lineHeight;
  const firstBaseline = Math.round(centerY - blockH / 2 + fontSize * 0.8);
  const titleTspans = lines
    .map((ln, i) => `<tspan x="90" y="${firstBaseline + i * lineHeight}">${escapeXml(ln)}</tspan>`)
    .join("");

  const spokes = Array.from({ length: 8 })
    .map((_, i) => {
      const a = (i * Math.PI) / 4;
      return `<line x1="${(Math.cos(a) * 150).toFixed(1)}" y1="${(Math.sin(a) * 150).toFixed(1)}" x2="${(Math.cos(a) * 250).toFixed(1)}" y2="${(Math.sin(a) * 250).toFixed(1)}"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Georgia, 'Times New Roman', 'Be Vietnam Pro', serif">
  <defs>
    <radialGradient id="bg" cx="28%" cy="34%" r="95%">
      <stop offset="0%" stop-color="#25121a"/>
      <stop offset="58%" stop-color="#150A0C"/>
      <stop offset="100%" stop-color="#0c0507"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g transform="translate(985,320)" fill="none" stroke="#C9A24B" stroke-opacity="0.13" stroke-width="2">
    <circle r="250"/><circle r="200"/><circle r="150"/>
    ${spokes}
  </g>
  <rect x="34" y="34" width="${W - 68}" height="${H - 68}" rx="14" fill="none" stroke="#C9A24B" stroke-opacity="0.5" stroke-width="2"/>
  <text x="90" y="118" fill="#C9A24B" font-size="26" letter-spacing="5">${escapeXml(eyebrow)}</text>
  <rect x="92" y="132" width="60" height="3" fill="#C9A24B"/>
  <text fill="#EAD9BD" font-size="${fontSize}" font-weight="600">${titleTspans}</text>
  <text x="90" y="${H - 66}" fill="#C9A24B" font-size="27" letter-spacing="3" font-weight="700">PHONG THỦY THIÊN ANH</text>
  <text x="90" y="${H - 38}" fill="#EAD9BD" fill-opacity="0.6" font-size="20">phongthuythienanh.com</text>
</svg>`;
}

// Chạy trực tiếp để xem thử: node scripts/tao-anh-bia.mjs "Tiêu đề" nha-o [duong-dan-luu.svg]
const invoked = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("tao-anh-bia.mjs");
if (invoked) {
  const [, , title = "Tiêu đề bài viết phong thủy mẫu", category = "nha-o", out] = process.argv;
  const svg = taoAnhBiaSVG(title, category);
  if (out) {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(out, svg, "utf8");
    console.log("Đã lưu:", out);
  } else {
    process.stdout.write(svg);
  }
}
