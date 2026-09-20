/** Lỗi tường minh cho 空亡 Core (旬空) — không silent fallback trên `cycleIndex` ngoài phạm vi hợp lệ. */
export type VoidBranchesErrorCode = "INVALID_CYCLE_INDEX";

export class VoidBranchesError extends Error {
  readonly code: VoidBranchesErrorCode;

  constructor(code: VoidBranchesErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "VoidBranchesError";
    this.code = code;
  }
}
