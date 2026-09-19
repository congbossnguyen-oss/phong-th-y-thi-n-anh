/**
 * Provenance cho Địa Bàn cố định + thuật toán dựng Thiên Bàn (Algorithm Spec §5). Theo
 * docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md dòng "天地盤" (READY, confidence A, "Định
 * nghĩa toán học, đồng thuận tuyệt đối A+B+C+F").
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";

export const HEAVEN_EARTH_PLATE_PROVENANCE: ProvenanceEntry = {
  id: "PROV-HEAVEN-EARTH-PLATE",
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle: "六壬大全 (欽定四庫全書本)",
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §5 (tổng hợp cross-check, chưa trích trực tiếp nguyên văn 六壬大全 cho riêng mục Thiên/Địa Bàn)",
  sourceType: "classical-fact",
  confidence: "A",
  notes:
    "Định nghĩa toán học thuần túy, ĐỒNG THUẬN TUYỆT ĐỐI giữa 4 nguồn độc lập đã audit (xem " +
    "docs/daliuren/research/report-A-daliuren-web-engine.md mục 6 `TianPan.__init__`/`__getitem__`, " +
    "report-B-kinliuren.md mục 1 `sky_pan_list`/`sky_n_earth_list`, report-C-zhouyilab.md, " +
    "report-F-legacy-python.md) — không có bất kỳ tranh cãi nào về cách đặt Nguyệt Tướng vào " +
    "vị trí Địa Bàn của Chi giờ chiêm rồi xoay 11 vị trí còn lại theo thứ tự tự nhiên. " +
    "XÁC MINH ĐỘC LẬP THÊM (Phase 9A, golden case): đã dò tay qua source code thật của repo B " +
    "(`kentang2017/kinliuren`, commit 3ba45a9, hàm `sky_n_earth_list` dòng 189-192) với input " +
    "monthGeneral=丑(Sửu), hourChi=子(Tý) — kết quả khớp CHÍNH XÁC 12/12 vị trí với công thức " +
    "implement ở compute.ts, KHÔNG lệch 1 vị trí nào.",
};
