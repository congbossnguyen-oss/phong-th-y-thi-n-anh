/**
 * Can Chi dùng xuyên suốt Đại Lục Nhâm — TÁI DÙNG `Can`/`Chi` của `@thien-anh/calendar-core`
 * (tên tiếng Việt: "Giáp".."Quý" / "Tý".."Hợi"), KHÔNG định nghĩa lại bằng chữ Hán.
 *
 * Lý do (audit trước khi thêm type mới — xem docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md
 * mục "1. ĐỌC SPEC TRƯỚC"): các bản đặc tả Markdown (DA_LIU_REN_DATA_SCHEMA.md...) từng ký hiệu
 * Can/Chi bằng chữ Hán ('甲'|'乙'|...) chỉ để DIỄN GIẢI cho người đọc — `calendar-core`, nguồn
 * Can Chi thật sự duy nhất của toàn dự án, trả về tên tiếng Việt. Định nghĩa lại một enum chữ Hán
 * song song sẽ tạo 2 nguồn sự thật cho cùng 1 khái niệm và buộc phải viết code chuyển đổi không
 * cần thiết ở mọi ranh giới — vi phạm "no magic constants" / "single source of truth".
 */
import type { Data, GanzhiPillar } from "@thien-anh/calendar-core";

/** 10 Thiên Can, tên tiếng Việt ("Giáp".."Quý") — alias trực tiếp từ calendar-core, không định nghĩa lại. */
export type Can = Data.Can;
/** 12 Địa Chi, tên tiếng Việt ("Tý".."Hợi") — alias trực tiếp từ calendar-core, không định nghĩa lại. */
export type Chi = Data.Chi;
export type { GanzhiPillar };

/** Bí danh ngữ nghĩa — dùng khi ngữ cảnh Lục Nhâm muốn nói rõ "1 trụ Can Chi" thay vì tên chung chung của calendar-core. */
export type CanChiPillar = GanzhiPillar;
