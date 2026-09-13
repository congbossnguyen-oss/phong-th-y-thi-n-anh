/**
 * Đường dẫn tới thư mục ephemeris data (`.se1`) — PROJECT-RELATIVE, KHÔNG hardcode đường dẫn
 * máy cụ thể. Tách file riêng để (1) dễ test độc lập, (2) `SwissEphemerisProvider.ts` — file
 * DUY NHẤT được phép import `sweph` — không cần tự làm phép tính đường dẫn.
 *
 * Layout: `<package root>/ephe/` (sibling của `src/` và `dist/`), chứa ĐÚNG 3 file tối thiểu
 * cho Phase 3A (xem docs/astrology-module/ARCHITECTURE/PHASE3A_ASTRONOMICAL_CORE.md
 * "Ephemeris data" để biết nguồn gốc/lý do chọn):
 *   - sepl_18.se1  (hành tinh Sun..Pluto + mean/true node + Chiron dùng chung file này)
 *   - semo_18.se1  (Mặt Trăng)
 *   - seas_18.se1  (tiểu hành tinh chính, bao gồm Chiron)
 * Phạm vi ngày hỗ trợ chính xác file-based: năm 1800-2400 (theo tên file, quy ước Swiss
 * Ephemeris: hậu tố "_18" = thế kỷ bắt đầu 1800, mỗi file phủ 600 năm).
 */

import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Tính đường dẫn `<package root>/ephe` dựa trên vị trí file NÀY lúc chạy (hoạt động đúng cả khi
 * chạy trực tiếp từ `src/` qua ts-node/vitest lẫn khi đã build ra `dist/`, vì cùng độ sâu thư
 * mục tương đối: `src/astronomical/providers/` và `dist/astronomical/providers/` đều cách
 * package root đúng 3 cấp).
 */
export function resolveDefaultEphemerisPath(): string {
  const here = fileURLToPath(import.meta.url);
  const packageRoot = path.resolve(path.dirname(here), "..", "..", "..");
  return path.join(packageRoot, "ephe");
}
