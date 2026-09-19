/**
 * VoidBranches (空亡 Không Vong) — Algorithm Spec §10b (MỚI, lấp gap Validation Review vòng 2).
 * CONFIDENCE B cho định nghĩa/cách tính; CONFIDENCE A cho ý nghĩa theo vị trí Tam Truyền (Tầng 2).
 * XÁC NHẬN: KHÔNG ảnh hưởng đến việc chọn pháp trong Cửu Tông Môn (đã tìm trực tiếp, không thấy
 * quy tắc này) — field ở đây CHỈ mô tả FACT (2 chi Không Vong + có trúng vị trí nào trong Tam
 * Truyền hay không), Interpretation Engine (Tầng 2) mới là nơi gán Ý NGHĨA.
 */
import type { Chi } from "./ganzhi.js";

export interface VoidBranches {
  /** 2 chi Không Vong của tuần Giáp chứa Can Chi Ngày. */
  pair: readonly [Chi, Chi];
  /** Cờ đánh dấu vị trí nào trong Tam Truyền rơi vào Không Vong — Tầng 1 chỉ tính, không luận. */
  affects: {
    initial: boolean;
    middle: boolean;
    final: boolean;
  };
}
