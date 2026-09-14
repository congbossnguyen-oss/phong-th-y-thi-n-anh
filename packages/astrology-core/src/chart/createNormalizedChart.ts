/**
 * Helper dựng `NormalizedChart` với default an toàn (mảng rỗng cho các phần chưa có nội dung ở
 * Phase 2, `calculationId`/`calculatedAt` tự sinh NẾU không truyền vào). KHÔNG tính toán gì —
 * chỉ lắp ráp/áp default, đúng vai trò "normalization layer" (chuẩn hoá SHAPE, không chuẩn hoá
 * GIÁ TRỊ thiên văn).
 *
 * `calculationId`/`calculatedAt` CÓ THỂ truyền vào tường minh để test/golden fixture xác định
 * (đúng nguyên tắc "Engine phải là HÀM THUẦN" đã thấy ở `duongtrach-engine` — không depend
 * `Date.now()` ẩn nếu caller cần tái lập chính xác). Khi không truyền, dùng
 * `crypto.randomUUID()`/`new Date()` như `trachnhat-engine`'s `buildMeta()` đã làm cho
 * `EngineMeta.calculatedAt` — đây là metadata NGUỒN GỐC của lần tính, không phải giá trị chiêm
 * tinh, nên KHÔNG ảnh hưởng reproducibility của phần dữ liệu chiêm tinh thực sự (xem test
 * reproducibility: so sánh loại trừ 2 field này).
 */
import { randomUUID } from "node:crypto";
import type {
  CalculationMetadata,
  NormalizedAngle,
  NormalizedAspectInstance,
  NormalizedChart,
  NormalizedDignityResult,
  NormalizedHouse,
  NormalizedHouseCusp,
  NormalizedNakshatraPosition,
  NormalizedNodePosition,
  NormalizedPlanetPosition,
  NormalizedPointPosition,
  SchoolId,
  ZodiacType,
} from "./types.js";
import type { AyanamsaId, HouseSystemId } from "../astronomical/AstronomicalProvider.js";

export interface CreateNormalizedChartInput {
  metadata: Omit<CalculationMetadata, "calculationId" | "calculatedAt"> &
    Partial<Pick<CalculationMetadata, "calculationId" | "calculatedAt">>;
  birthDataRef: string;
  school: SchoolId;
  zodiacType: ZodiacType;
  ayanamsa: AyanamsaId | null;
  houseSystem: HouseSystemId;
  planets?: NormalizedPlanetPosition[];
  points?: NormalizedPointPosition[];
  houses?: NormalizedHouse[];
  houseCusps?: NormalizedHouseCusp[];
  angles?: NormalizedAngle[];
  aspects?: NormalizedAspectInstance[];
  dignities?: NormalizedDignityResult[];
  nodes?: NormalizedNodePosition[];
  /** Phase 4 Step 4 — mặc định `[]` nếu bỏ trống, CÙNG quy ước với mọi mảng khác ở trên (kể cả Western — xem `NormalizedChart.nakshatraPositions`'s doc comment). */
  nakshatraPositions?: NormalizedNakshatraPosition[];
}

export function createNormalizedChart(input: CreateNormalizedChartInput): NormalizedChart {
  return {
    metadata: {
      ...input.metadata,
      calculationId: input.metadata.calculationId ?? randomUUID(),
      calculatedAt: input.metadata.calculatedAt ?? new Date(),
    },
    birthDataRef: input.birthDataRef,
    school: input.school,
    zodiacType: input.zodiacType,
    ayanamsa: input.ayanamsa,
    houseSystem: input.houseSystem,
    planets: input.planets ?? [],
    points: input.points ?? [],
    houses: input.houses ?? [],
    houseCusps: input.houseCusps ?? [],
    angles: input.angles ?? [],
    aspects: input.aspects ?? [],
    dignities: input.dignities ?? [],
    nodes: input.nodes ?? [],
    nakshatraPositions: input.nakshatraPositions ?? [],
  };
}
