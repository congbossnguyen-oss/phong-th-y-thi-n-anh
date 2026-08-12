/**
 * KIM LÂU — xét theo Tuổi Mụ mod 9. Công thức được cấp trực tiếp trong đặc tả module (không
 * phải suy luận), giữ nguyên trong `KIM_LAU_RULES` để có thể chỉnh sau này mà không sửa thuật
 * toán `calculateKimLau`.
 */

export type LoaiKimLau = "khong-pham" | "kim-lau-than" | "kim-lau-the" | "kim-lau-tu" | "kim-lau-suc";

export const KIM_LAU_RULES: Record<number, { loai: LoaiKimLau; ten: string }> = {
  0: { loai: "khong-pham", ten: "Không phạm" },
  1: { loai: "kim-lau-than", ten: "Kim Lâu Thân" },
  2: { loai: "khong-pham", ten: "Không phạm" },
  3: { loai: "kim-lau-the", ten: "Kim Lâu Thê" },
  4: { loai: "khong-pham", ten: "Không phạm" },
  5: { loai: "khong-pham", ten: "Không phạm" },
  6: { loai: "kim-lau-tu", ten: "Kim Lâu Tử" },
  7: { loai: "khong-pham", ten: "Không phạm" },
  8: { loai: "kim-lau-suc", ten: "Kim Lâu Súc" },
} as const;

export interface KimLauResult {
  loai: LoaiKimLau;
  ten: string;
  pham: boolean;
}

export function calculateKimLau(tuoiMu: number): KimLauResult {
  if (!Number.isInteger(tuoiMu) || tuoiMu < 1) {
    throw new Error(`Tuổi mụ không hợp lệ: ${tuoiMu} (phải là số nguyên >= 1).`);
  }
  const du = tuoiMu % 9;
  const { loai, ten } = KIM_LAU_RULES[du]!;
  return { loai, ten, pham: loai !== "khong-pham" };
}
