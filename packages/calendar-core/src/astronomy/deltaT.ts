/**
 * ΔT = TT − UT1 (giây): hiệu số giữa Terrestrial Time (thang thời gian đều, dùng trong
 * mọi công thức vị trí thiên thể) và Universal Time (thang thời gian dựa trên tự quay
 * của Trái Đất, vốn không đều do thủy triều làm chậm dần vòng quay).
 *
 * Các công thức lượng giác ở solar.ts/lunar.ts vốn được xây dựng để nhận đối số theo TT.
 * Nếu chỉ cần độ chính xác cấp ngày (đủ cho việc xác định tháng Can Chi, tháng nhuận) thì
 * bỏ qua ΔT không ảnh hưởng. Nhưng để xác định GIỜ chính xác của một tiết khí/thời điểm
 * Sóc (vốn có thể sai lệch vài phút do ΔT tích lũy qua nhiều thế kỷ), cần cộng ΔT vào JD(UT)
 * trước khi tính toán.
 *
 * Nguồn: Espenak & Meeus, "Five Millennium Canon of Solar Eclipses: -1999 to +3000"
 * (NASA/TP-2006-214141), các biểu thức đa thức xấp xỉ ΔT theo từng giai đoạn lịch sử.
 * Đây là công thức đã công bố chính thức, không phải suy đoán — sai số nằm trong khoảng
 * vài giây (giai đoạn hiện đại có quan trắc) đến vài phút (giai đoạn cổ, ngoại suy).
 */

/**
 * Tính ΔT (giây) tại một năm-tháng cho trước.
 * @param year Năm dương lịch (có thể âm cho năm trước Công Nguyên theo quy ước thiên văn).
 * @param month Tháng 1-12 (dùng để nội suy `y` ở giữa tháng cho chính xác hơn).
 */
export function deltaTSeconds(year: number, month: number): number {
  const y = year + (month - 0.5) / 12;

  if (y < -500) return deltaTLongTerm(y);
  if (y < 500) return deltaTAncient(y);
  if (y < 1600) return deltaTMedieval(y);
  if (y < 1700) return deltaT1600to1700(y);
  if (y < 1800) return deltaT1700to1800(y);
  if (y < 1860) return deltaT1800to1860(y);
  if (y < 1900) return deltaT1860to1900(y);
  if (y < 1920) return deltaT1900to1920(y);
  if (y < 1941) return deltaT1920to1941(y);
  if (y < 1961) return deltaT1941to1961(y);
  if (y < 1986) return deltaT1961to1986(y);
  if (y < 2005) return deltaT1986to2005(y);
  if (y < 2050) return deltaT2005to2050(y);
  if (y < 2150) return deltaT2050to2150(y);
  return deltaTLongTerm(y);
}

function deltaTLongTerm(y: number): number {
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}

function deltaTAncient(y: number): number {
  const u = y / 100;
  return (
    10583.6 -
    1014.41 * u +
    33.78311 * u ** 2 -
    5.952053 * u ** 3 -
    0.1798452 * u ** 4 +
    0.022174192 * u ** 5 +
    0.0090316521 * u ** 6
  );
}

function deltaTMedieval(y: number): number {
  const u = (y - 1000) / 100;
  return (
    1574.2 -
    556.01 * u +
    71.23472 * u ** 2 +
    0.319781 * u ** 3 -
    0.8503463 * u ** 4 -
    0.005050998 * u ** 5 +
    0.0083572073 * u ** 6
  );
}

function deltaT1600to1700(y: number): number {
  const t = y - 1600;
  return 120 - 0.9808 * t - 0.01532 * t ** 2 + t ** 3 / 7129;
}

function deltaT1700to1800(y: number): number {
  const t = y - 1700;
  return 8.83 + 0.1603 * t - 0.0059285 * t ** 2 + 0.00013336 * t ** 3 - t ** 4 / 1174000;
}

function deltaT1800to1860(y: number): number {
  const t = y - 1800;
  return (
    13.72 -
    0.332447 * t +
    0.0068612 * t ** 2 +
    0.0041116 * t ** 3 -
    0.00037436 * t ** 4 +
    0.0000121272 * t ** 5 -
    0.0000001699 * t ** 6 +
    0.000000000875 * t ** 7
  );
}

function deltaT1860to1900(y: number): number {
  const t = y - 1860;
  return (
    7.62 +
    0.5737 * t -
    0.251754 * t ** 2 +
    0.01680668 * t ** 3 -
    0.0004473624 * t ** 4 +
    t ** 5 / 233174
  );
}

function deltaT1900to1920(y: number): number {
  const t = y - 1900;
  return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 0.0061966 * t ** 3 - 0.000197 * t ** 4;
}

function deltaT1920to1941(y: number): number {
  const t = y - 1920;
  return 21.2 + 0.84493 * t - 0.0761 * t ** 2 + 0.0020936 * t ** 3;
}

function deltaT1941to1961(y: number): number {
  const t = y - 1950;
  return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547;
}

function deltaT1961to1986(y: number): number {
  const t = y - 1975;
  return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718;
}

function deltaT1986to2005(y: number): number {
  const t = y - 2000;
  return (
    63.86 +
    0.3345 * t -
    0.060374 * t ** 2 +
    0.0017275 * t ** 3 +
    0.000651814 * t ** 4 +
    0.00002373599 * t ** 5
  );
}

function deltaT2005to2050(y: number): number {
  const t = y - 2000;
  return 62.92 + 0.32217 * t + 0.005589 * t ** 2;
}

function deltaT2050to2150(y: number): number {
  return -20 + 32 * ((y - 1820) / 100) ** 2 - 0.5628 * (2150 - y);
}
