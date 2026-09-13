/**
 * Cài đặt ĐỘC LẬP của "khoảng cách góc nhỏ nhất" — CHỈ dùng để kiểm tra `angularSeparation()`
 * trong test, KHÔNG BAO GIỜ import vào code production. Dùng phương pháp LƯỢNG GIÁC (dựa trên
 * đồng nhất thức cos(a-b)), khác thuật toán với bản production (trừ tuyệt đối + xử lý wraparound
 * bằng điều kiện rẽ nhánh) — hai cách tiếp cận khác nhau về thuật toán, cùng một định nghĩa toán
 * học, nên khớp nhau là bằng chứng độc lập thực sự, không phải trùng hợp tính lại cùng công thức.
 *
 * Cơ sở: cos(θ) = cos(a - b) với θ là góc giữa 2 hướng trên đường tròn — acos() LUÔN trả về giá
 * trị trong [0, π] (tức [0°, 180°] sau khi đổi đơn vị), tự động cho đúng "khoảng cách nhỏ nhất"
 * mà KHÔNG cần bất kỳ xử lý wraparound thủ công nào (khác hẳn cách tiếp cận trừ tuyệt đối).
 */

export function independentAngularSeparation(longitudeA: number, longitudeB: number): number {
  const diffRadians = ((longitudeA - longitudeB) * Math.PI) / 180;
  const cosTheta = Math.cos(diffRadians);
  // Kẹp trong [-1,1] để tránh NaN do sai số dấu phẩy động đẩy cosTheta ra ngoài biên (vd. 1.0000000000000002).
  const clamped = Math.max(-1, Math.min(1, cosTheta));
  return (Math.acos(clamped) * 180) / Math.PI;
}
