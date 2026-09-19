/**
 * FourLessons (四課 Tứ Khóa) — Algorithm Spec §6. CONFIDENCE A cho công thức lập; CONFIDENCE A
 * riêng cho việc Tứ Khóa CÓ vai trò luận đoán độc lập (Phase 2, xem
 * docs/daliuren/DA_LIU_REN_PROVENANCE.md Nút 1) — Interpretation Engine (chưa xây ở Checkpoint 1)
 * phải đọc quan hệ nội tại của `lesson1`/`lesson3` với Can/Chi Ngày TRƯỚC khi xét Khóa Thể.
 *
 * SỬA LẠI so với bản nháp Markdown (DA_LIU_REN_DATA_SCHEMA.md): bản đó ghi nhầm
 * `lesson2.lower`/`lesson3.upper` có thể là `TianGan` — trên thực tế "chữ Thiên Bàn" luôn là
 * Địa Chi (Thiên Bàn được dựng từ 12 Chi xoay), CHỈ `lesson1.lower` là Thiên Can thật (chính
 * Can Ngày). Ghi rõ ở đây để không lặp lại sai lệch khi implement Calendar Layer.
 */
import type { Can, Chi } from "./ganzhi.js";

/** Khóa 1: chữ Thiên Bàn tại cung ký thác của Can Ngày, ghép với Can Ngày. */
export interface LessonFromStem {
  upper: Chi;
  lower: Can;
}

/** Khóa 2/3/4: chữ Thiên Bàn tại 1 vị trí Địa Bàn, ghép với chính chữ Địa Chi đó. */
export interface LessonFromBranch {
  upper: Chi;
  lower: Chi;
}

export interface FourLessons {
  /** 一課 — trên Can Ngày, chủ bản thân/việc bên ngoài (Phase 2, report-1 mục 1a). */
  lesson1: LessonFromStem;
  /** 二課 — thượng thần của Khóa 1. */
  lesson2: LessonFromBranch;
  /** 三課 — trên Chi Ngày, chủ người khác/nhà cửa/việc bên trong. */
  lesson3: LessonFromBranch;
  /** 四課 — thượng thần của Khóa 3. */
  lesson4: LessonFromBranch;
}
