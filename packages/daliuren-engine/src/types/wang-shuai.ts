/**
 * WangShuai (旺相休囚死 Vượng suy, 5 cấp) — Algorithm Spec §11. CONFIDENCE A cho công thức
 * TÍNH (lý thuyết Ngũ Hành phổ quát, không tranh cãi). Ý NGHĨA luận đoán riêng của Lục Nhâm
 * (quan/tài/tang/hình/bệnh theo phát dụng — Phase 2, CONFIDENCE A) là việc của Tầng 2, KHÔNG
 * khai báo ở đây. TUYỆT ĐỐI không có field định lượng hoá lực sinh/khắc (%, hệ số) — công thức
 * đó đã bị loại vĩnh viễn (gốc từ repo E, xem docs/daliuren/DA_LIU_REN_VALIDATION_REVIEW.md Lỗi 1).
 */
export type FiveElement = "wood" | "fire" | "earth" | "metal" | "water";
export type WangShuaiStage = "wang" | "xiang" | "xiu" | "qiu" | "si"; // 旺 相 休 囚 死

export type WangShuai = Readonly<Record<FiveElement, WangShuaiStage>>;
