/**
 * NGƯỠNG THU NHẬN — chủ sở hữu duy nhất của các hằng số quyết định
 * "ảnh này có đo được không".
 *
 * Module này là một LÁ trong đồ thị phụ thuộc: nó KHÔNG import gì cả. Nhờ vậy mọi tầng
 * đều phụ thuộc xuống nó được mà không bao giờ tạo chu trình.
 *
 * ── Vì sao tách ra ──
 * Trước Phase này, các ngưỡng nằm ở `../session/steps.ts`. Feature Layer
 * (`../features/extract.ts`) phải import ngược lên miền PHIÊN chỉ để lấy mấy con số
 * vốn thuộc miền THU NHẬN. Sai về quyền sở hữu, và gây hiểu nhầm cho người sau khi
 * sửa phiên. Giá trị KHÔNG đổi một ly — chỉ đổi chỗ ở.
 *
 * ⚠️ MỌI ngưỡng ở đây CHỈ dùng để quyết định "ảnh này đo được hay chưa".
 * Không ngưỡng nào mang ý nghĩa nhân tướng. Quay mặt nhiều/ít, sáng/tối không phải
 * tướng tốt/xấu — chỉ là tư thế và điều kiện cần để thu đủ góc đo.
 */

/**
 * DẤU CỦA YAW ỨNG VỚI "QUAY SANG MỘT BÊN".
 *
 * Hiệu chuẩn bằng ảnh thật ở Phase 1C, không đoán:
 *   ảnh 4 có yaw = +27.84°. Đo hai nửa mặt theo trục ngang:
 *     nửa phía landmark 234 = 619.7 px   (rộng, hướng về camera)
 *     nửa phía landmark 454 =  32.6 px   (hẹp → BỊ QUAY RA XA camera, tỉ lệ 0.053)
 *   → yaw DƯƠNG nghĩa là nửa mặt phía landmark 454 quay ra xa camera.
 *
 * Theo quy ước index của MediaPipe, 454 nằm ở nửa mặt BÊN TRÁI của chủ thể, nên
 * yaw dương ứng với "quay sang trái". Phần suy luận trái/phải này dựa vào quy ước
 * index chứ không đo được trực tiếp, nên:
 *
 * → CẦN XÁC NHẬN TRÊN MÁY THẬT. Nếu khách quay trái mà máy không nhận, đổi hằng
 *   số này thành -1 là xong; toàn bộ phần còn lại không phải sửa.
 */
export const YAW_SIGN_FOR_USER_LEFT: 1 | -1 = 1;

/** Ngưỡng cho bước chính diện — giống cổng chất lượng ở Phase 1B. */
export const FRONT_LIMITS = { yaw: 8, pitch: 8, roll: 5 } as const;

/**
 * Góc tối thiểu để tính là "đã quay/đã cúi/đã ngẩng".
 *
 * 20° chọn vì: đủ lớn để chắc chắn người dùng CHỦ ĐỘNG quay (nhiễu pose đo được ở
 * Phase 1B-2 là ±1.5°, nên 20° là hơn 13 lần nhiễu), nhưng đủ nhỏ để ai cũng làm
 * được và MediaPipe vẫn bắt được mặt — ảnh bán diện (~80°) ở Phase 1B-2 làm detector
 * trả về KHÔNG GÌ CẢ, nên không được đòi góc lớn.
 */
export const TURN_MIN_DEG = 20;

/** Trên mức này thì bắt đầu rủi ro mất mặt hẳn. Vẫn tính ĐẠT, chỉ ghi cảnh báo. */
export const TURN_SAFE_MAX_DEG = 45;

/** Bước "sát mặt": bề ngang mặt phải chiếm ít nhất bao nhiêu phần khung hình. */
export const NEAR_MIN_COVERAGE = 0.62;

/** Các bước khác: khoảng coverage hợp lệ. */
export const COVERAGE_MIN = 0.25;
export const COVERAGE_MAX = 0.85;

/** Ngưỡng chất lượng ảnh, dùng chung mọi bước. */
export const BLUR_MIN = 0.0015;
export const BRIGHTNESS_MIN = 0.18;
export const BRIGHTNESS_MAX = 0.92;

/** Số frame LIÊN TIẾP phải đạt mới chốt một bước (~0.6s ở 5 fps). */
export const STEP_STABLE_FRAMES = 3;
