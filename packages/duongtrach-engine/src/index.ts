/**
 * @thien-anh/duongtrach-engine — điểm vào duy nhất.
 *
 * Lớp `Shared` (do-so/cuu-cung/ngu-hanh): vòng 60 phân kim, cửu cung, ngũ hành — dùng chung cho
 * mọi module Dương Trạch (Khai Môn Điểm Thần Sát là module đầu tiên).
 */
import * as Shared_doSo from "./shared/do-so.js";
import * as Shared_cuuCung from "./shared/cuu-cung.js";
import * as Shared_nguHanh from "./shared/ngu-hanh.js";
export const Shared = { ...Shared_doSo, ...Shared_cuuCung, ...Shared_nguHanh };

export * as KhaiMon from "./khai-mon/index.js";
