import { describe, expect, it } from "vitest";

import { fullWesternChart } from "../../chart/__tests__/fixtures.js";
import {
  angularSeparation,
  computeWesternAspects,
  WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY,
  type AspectOrbPolicy,
} from "../aspects.js";
import { independentAngularSeparation } from "./independentAngularSeparation.js";

describe("angularSeparation — khoảng cách góc nhỏ nhất, HÀM HÌNH HỌC THUẦN (không biết gì về aspect/orb)", () => {
  it("kết nối 0°/360°: 359° và 1° cách nhau 2°, KHÔNG phải 358°", () => {
    expect(angularSeparation(359, 1)).toBeCloseTo(2, 9);
  });

  it("kết hợp (conjunction) chính xác: cùng longitude -> 0°", () => {
    expect(angularSeparation(45, 45)).toBe(0);
  });

  it("đối lập (opposition) chính xác: cách nhau đúng 180°", () => {
    expect(angularSeparation(0, 180)).toBe(180);
    expect(angularSeparation(90, 270)).toBe(180);
  });

  it("luôn trong [0,180] cho mọi cặp longitude", () => {
    for (let a = 0; a < 360; a += 17) {
      for (let b = 0; b < 360; b += 29) {
        const result = angularSeparation(a, b);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(180);
      }
    }
  });

  it("tự chuẩn hoá longitude ngoài [0,360) trước khi tính (âm, > 360)", () => {
    expect(angularSeparation(-1, 1)).toBeCloseTo(2, 9); // -1 chuẩn hoá thành 359
    expect(angularSeparation(370, 10)).toBeCloseTo(0, 9); // 370 chuẩn hoá thành 10
  });

  it("gần 0° (near-conjunction) và gần 180° (near-opposition) tính đúng, không có gián đoạn bất thường", () => {
    expect(angularSeparation(0.001, 359.999)).toBeCloseTo(0.002, 6);
    expect(angularSeparation(0.001, 179.999)).toBeCloseTo(179.998, 6);
  });

  it("XÁC NHẬN ĐỘC LẬP: khớp một cài đặt lượng giác hoàn toàn khác thuật toán (khác cách xử lý wraparound), trên một mẫu ngẫu nhiên các cặp longitude — KHÔNG chỉ so với chính nó", () => {
    const samplePairs: [number, number][] = [
      [0, 0],
      [0, 180],
      [359, 1],
      [10.5, 200.7],
      [351.4222, 238.1087],
      [240.0111, 238.1087],
      [123.456, 321.987],
      [0, 90],
      [270, 271],
    ];
    for (const [a, b] of samplePairs) {
      expect(angularSeparation(a, b)).toBeCloseTo(independentAngularSeparation(a, b), 9);
    }
  });

  it("deterministic — gọi lại nhiều lần cho cùng kết quả", () => {
    expect(angularSeparation(37.5, 291.2)).toBe(angularSeparation(37.5, 291.2));
  });
});

describe("computeWesternAspects — 5 aspect chính đúng góc lý tưởng (exact)", () => {
  it("exact conjunction (0°)", () => {
    const result = computeWesternAspects([
      { body: "a", longitude: 100 },
      { body: "b", longitude: 100 },
    ]);
    expect(result).toEqual([{ planetA: "a", planetB: "b", type: "conjunction", exactAngle: 0, actualAngle: 0, orb: 0, withinOrb: true }]);
  });

  it("exact opposition (180°)", () => {
    const result = computeWesternAspects([
      { body: "a", longitude: 10 },
      { body: "b", longitude: 190 },
    ]);
    expect(result).toEqual([{ planetA: "a", planetB: "b", type: "opposition", exactAngle: 180, actualAngle: 180, orb: 0, withinOrb: true }]);
  });

  it("exact trine (120°)", () => {
    const result = computeWesternAspects([
      { body: "a", longitude: 0 },
      { body: "b", longitude: 120 },
    ]);
    expect(result).toEqual([{ planetA: "a", planetB: "b", type: "trine", exactAngle: 120, actualAngle: 120, orb: 0, withinOrb: true }]);
  });

  it("exact square (90°)", () => {
    const result = computeWesternAspects([
      { body: "a", longitude: 15 },
      { body: "b", longitude: 105 },
    ]);
    expect(result).toEqual([{ planetA: "a", planetB: "b", type: "square", exactAngle: 90, actualAngle: 90, orb: 0, withinOrb: true }]);
  });

  it("exact sextile (60°)", () => {
    const result = computeWesternAspects([
      { body: "a", longitude: 200 },
      { body: "b", longitude: 260 },
    ]);
    expect(result).toEqual([{ planetA: "a", planetB: "b", type: "sextile", exactAngle: 60, actualAngle: 60, orb: 0, withinOrb: true }]);
  });
});

describe("computeWesternAspects — biên orb (orb boundary): vừa trong, ĐÚNG TẠI biên, vừa ngoài", () => {
  it("square (orb 7°): 96.99° (vừa trong, orb=6.99°) VẪN được nhận diện", () => {
    const result = computeWesternAspects([
      { body: "a", longitude: 0 },
      { body: "b", longitude: 96.99 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe("square");
    expect(result[0]!.orb).toBeCloseTo(6.99, 9);
  });

  it("square (orb 7°): 97° (ĐÚNG TẠI biên orb=7°) VẪN được nhận diện — biên orb là biên ĐÓNG", () => {
    const result = computeWesternAspects([
      { body: "a", longitude: 0 },
      { body: "b", longitude: 97 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe("square");
    expect(result[0]!.orb).toBe(7);
  });

  it("square (orb 7°): 97.01° (vừa ngoài, orb=7.01°) KHÔNG được nhận diện là aspect nào", () => {
    const result = computeWesternAspects([
      { body: "a", longitude: 0 },
      { body: "b", longitude: 97.01 },
    ]);
    expect(result).toEqual([]);
  });

  it("sextile (orb 6°): vừa trong (65.99°), đúng biên (66°), vừa ngoài (66.01°)", () => {
    const inside = computeWesternAspects([{ body: "a", longitude: 0 }, { body: "b", longitude: 65.99 }]);
    const atBoundary = computeWesternAspects([{ body: "a", longitude: 0 }, { body: "b", longitude: 66 }]);
    const outside = computeWesternAspects([{ body: "a", longitude: 0 }, { body: "b", longitude: 66.01 }]);
    expect(inside[0]?.type).toBe("sextile");
    expect(atBoundary[0]?.type).toBe("sextile");
    expect(outside).toEqual([]);
  });

  it("conjunction (orb 8°): vừa trong (7.99°), đúng biên (8°), vừa ngoài (8.01°)", () => {
    const inside = computeWesternAspects([{ body: "a", longitude: 0 }, { body: "b", longitude: 7.99 }]);
    const atBoundary = computeWesternAspects([{ body: "a", longitude: 0 }, { body: "b", longitude: 8 }]);
    const outside = computeWesternAspects([{ body: "a", longitude: 0 }, { body: "b", longitude: 8.01 }]);
    expect(inside[0]?.type).toBe("conjunction");
    expect(atBoundary[0]?.type).toBe("conjunction");
    expect(outside).toEqual([]);
  });
});

describe("computeWesternAspects — trường hợp biên góc (angular edge cases)", () => {
  it("0° tuyệt đối (2 điểm cùng tại 0°) -> conjunction chính xác", () => {
    const result = computeWesternAspects([{ body: "a", longitude: 0 }, { body: "b", longitude: 0 }]);
    expect(result[0]?.type).toBe("conjunction");
    expect(result[0]?.actualAngle).toBe(0);
  });

  it("chuẩn hoá 360° -> tương đương 0°, không tạo lỗi hay aspect sai", () => {
    const result = computeWesternAspects([{ body: "a", longitude: 360 }, { body: "b", longitude: 0.5 }]);
    expect(result[0]?.type).toBe("conjunction");
    expect(result[0]?.actualAngle).toBeCloseTo(0.5, 9);
  });

  it("near-0° conjunction (0.1° và 359.95°, cách nhau 0.15°) được nhận diện đúng dù vòng qua điểm nối", () => {
    const result = computeWesternAspects([{ body: "a", longitude: 0.1 }, { body: "b", longitude: 359.95 }]);
    expect(result[0]?.type).toBe("conjunction");
    expect(result[0]?.actualAngle).toBeCloseTo(0.15, 9);
  });

  it("near-180° opposition (0.1° và 179.95°) được nhận diện đúng", () => {
    const result = computeWesternAspects([{ body: "a", longitude: 0.1 }, { body: "b", longitude: 179.95 }]);
    expect(result[0]?.type).toBe("opposition");
    expect(result[0]?.actualAngle).toBeCloseTo(179.85, 9);
  });

  it("cặp vòng qua điểm nối 359°/1° (cách nhau 2°) -> conjunction, KHÔNG bị tính nhầm 358°", () => {
    const result = computeWesternAspects([{ body: "a", longitude: 359 }, { body: "b", longitude: 1 }]);
    expect(result[0]?.type).toBe("conjunction");
    expect(result[0]?.actualAngle).toBeCloseTo(2, 9);
  });
});

describe("computeWesternAspects — quy tắc cặp (pair rules)", () => {
  it("KHÔNG có self-aspect: một điểm KHÔNG bao giờ ghép với chính nó", () => {
    const result = computeWesternAspects([{ body: "sun", longitude: 100 }]);
    expect(result).toEqual([]);
  });

  it("KHÔNG có cặp trùng lặp: mỗi cặp không có thứ tự chỉ xuất hiện ĐÚNG 1 LẦN (không có cả A-B lẫn B-A)", () => {
    const result = computeWesternAspects([
      { body: "sun", longitude: 0 },
      { body: "moon", longitude: 0 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]!.planetA).toBe("sun");
    expect(result[0]!.planetB).toBe("moon");
  });

  it("với N điểm, số cặp XÉT tối đa là C(N,2) — không nhiều hơn, không có cặp bị bỏ sót nếu tất cả đều có aspect", () => {
    // 4 điểm cách đều 90° -> mọi cặp đều là square hoặc opposition -> đủ C(4,2)=6 aspect.
    const result = computeWesternAspects([
      { body: "p0", longitude: 0 },
      { body: "p1", longitude: 90 },
      { body: "p2", longitude: 180 },
      { body: "p3", longitude: 270 },
    ]);
    expect(result).toHaveLength(6);
    const pairKeys = new Set(result.map((a) => [a.planetA, a.planetB].sort().join("|")));
    expect(pairKeys.size).toBe(6); // không cặp nào trùng
  });

  it("cặp KHÔNG có aspect (ngoài mọi orb) KHÔNG xuất hiện trong kết quả — không có placeholder 'no aspect'", () => {
    const result = computeWesternAspects([
      { body: "a", longitude: 0 },
      { body: "b", longitude: 40 }, // cách xa mọi aspect (gần nhất là sextile 60°, cách 20° > orb 6°)
    ]);
    expect(result).toEqual([]);
  });
});

describe("computeWesternAspects — thứ tự output xác định (deterministic ordering)", () => {
  it("thứ tự output = thứ tự sinh cặp (i,j), i<j, theo ĐÚNG thứ tự phần tử mảng đầu vào — tài liệu hoá tường minh quy tắc", () => {
    const points = [
      { body: "sun", longitude: 0 },
      { body: "moon", longitude: 60 }, // sextile với sun
      { body: "mars", longitude: 90 }, // square với sun, square với moon (30° - không phải aspect)
    ];
    const result = computeWesternAspects(points);
    // (sun,moon) sinh trước (sun,mars) vì i=0 cố định trước, j tăng dần; (moon,mars) sinh cuối.
    expect(result.map((a) => `${a.planetA}-${a.planetB}`)).toEqual(["sun-moon", "sun-mars"]);
  });

  it("đảo thứ tự mảng đầu vào -> đảo thứ tự output tương ứng (thứ tự PHỤ THUỘC thứ tự input, không tự sắp xếp lại theo alphabet)", () => {
    const forward = computeWesternAspects([
      { body: "sun", longitude: 0 },
      { body: "moon", longitude: 60 },
      { body: "mars", longitude: 120 },
    ]);
    const reversed = computeWesternAspects([
      { body: "mars", longitude: 120 },
      { body: "moon", longitude: 60 },
      { body: "sun", longitude: 0 },
    ]);
    expect(forward.map((a) => `${a.planetA}-${a.planetB}`)).toEqual(["sun-moon", "sun-mars", "moon-mars"]);
    expect(reversed.map((a) => `${a.planetA}-${a.planetB}`)).toEqual(["mars-moon", "mars-sun", "moon-sun"]);
  });

  it("deterministic — gọi lại nhiều lần cho cùng input (cùng thứ tự) luôn cho cùng output tuyệt đối (byte-identical qua JSON)", () => {
    const points = [
      { body: "sun", longitude: 351.4222 },
      { body: "moon", longitude: 240.0111 },
      { body: "saturn", longitude: 238.1087 },
    ];
    const first = computeWesternAspects(points);
    const second = computeWesternAspects([...points]);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

describe("computeWesternAspects — độc lập với orb policy cụ thể (engine không hardcode giá trị orb)", () => {
  it("truyền một policy KHÁC (orb rất hẹp, 0.5°) cho ra kết quả khác WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY trên CÙNG dữ liệu", () => {
    const narrowPolicy: AspectOrbPolicy = {
      id: "test.narrow_orb.v1",
      description: "Test-only: orb rất hẹp để xác nhận engine không hardcode WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY.",
      definitions: [{ type: "square", exactAngle: 90, orbDegrees: 0.5 }],
    };
    const points = [
      { body: "a", longitude: 0 },
      { body: "b", longitude: 96.99 }, // trong orb 7° mặc định nhưng NGOÀI orb 0.5° của policy hẹp
    ];
    const withDefault = computeWesternAspects(points, WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY);
    const withNarrow = computeWesternAspects(points, narrowPolicy);
    expect(withDefault).toHaveLength(1);
    expect(withNarrow).toEqual([]);
  });

  it("một policy CHỈ có 1 định nghĩa (vd. chỉ conjunction) không bao giờ trả về loại khác", () => {
    const onlyConjunction: AspectOrbPolicy = {
      id: "test.conjunction_only.v1",
      description: "Test-only.",
      definitions: [{ type: "conjunction", exactAngle: 0, orbDegrees: 10 }],
    };
    const result = computeWesternAspects(
      [
        { body: "a", longitude: 0 },
        { body: "b", longitude: 180 }, // exact opposition — nhưng policy này không định nghĩa opposition
      ],
      onlyConjunction,
    );
    expect(result).toEqual([]);
  });
});

describe("computeWesternAspects — khớp CHÍNH XÁC dữ liệu golden có sẵn từ Phase 2 (Hanoi 1985-03-12 08:30, fullWesternChart())", () => {
  it("Sun trine Saturn (113.3135°, orb 6.6865°) và Moon conjunction Saturn (1.9024°, orb 1.9024°) — tái tạo ĐÚNG 2 aspect đã có trong fixture, dùng CHÍNH longitude thật của fixture (KHÔNG dùng lại aspects[] của fixture làm input, chỉ dùng để so sánh kết quả)", () => {
    const fixture = fullWesternChart();
    const points = fixture.planets.map((p) => ({ body: p.body, longitude: p.longitude }));
    const result = computeWesternAspects(points);

    expect(result).toHaveLength(2); // đúng bằng số aspect đã có trong fixture (sun-moon không có aspect)

    // Dùng toBeCloseTo cho field số (không toEqual nguyên object) — longitude fixture có sẵn dư
    // sai số dấu phẩy động cực nhỏ (vd. 351.4222-238.1087 = 113.31349999999998, không phải đúng
    // 113.3135 tuyệt đối), đúng nguyên tắc "so bằng dung sai" đã dùng xuyên suốt package này.
    const sunSaturn = result.find((a) => a.planetA === "sun" && a.planetB === "saturn")!;
    expect(sunSaturn.type).toBe("trine");
    expect(sunSaturn.exactAngle).toBe(120);
    expect(sunSaturn.actualAngle).toBeCloseTo(113.3135, 9);
    expect(sunSaturn.orb).toBeCloseTo(6.6865, 9);
    expect(sunSaturn.withinOrb).toBe(true);

    const moonSaturn = result.find((a) => a.planetA === "moon" && a.planetB === "saturn")!;
    expect(moonSaturn.type).toBe("conjunction");
    expect(moonSaturn.exactAngle).toBe(0);
    expect(moonSaturn.actualAngle).toBeCloseTo(1.9024, 9);
    expect(moonSaturn.orb).toBeCloseTo(1.9024, 9);
    expect(moonSaturn.withinOrb).toBe(true);
  });

  it("Sun-Moon (111.4111°) KHÔNG có aspect nào — nằm ngoài orb trine (120±8 = [112,128]) đúng 0.5889°, khớp việc fixture KHÔNG liệt kê cặp này", () => {
    const fixture = fullWesternChart();
    const sun = fixture.planets.find((p) => p.body === "sun")!;
    const moon = fixture.planets.find((p) => p.body === "moon")!;
    const result = computeWesternAspects([
      { body: sun.body, longitude: sun.longitude },
      { body: moon.body, longitude: moon.longitude },
    ]);
    expect(result).toEqual([]);
  });
});
