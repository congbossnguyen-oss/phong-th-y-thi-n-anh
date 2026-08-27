// Đọc giá trị từ bộ 3 select Ngày/Tháng/Năm được render bởi components/ui/DateSelect.astro.
export function readDateSelects(idPrefix: string): { year: number; month: number; day: number } | null {
  const ngayEl = document.getElementById(`${idPrefix}-ngay`) as HTMLSelectElement | null;
  const thangEl = document.getElementById(`${idPrefix}-thang`) as HTMLSelectElement | null;
  const namEl = document.getElementById(`${idPrefix}-nam`) as HTMLSelectElement | null;
  if (!ngayEl || !thangEl || !namEl || !ngayEl.value || !thangEl.value || !namEl.value) return null;
  return { day: Number(ngayEl.value), month: Number(thangEl.value), year: Number(namEl.value) };
}

/**
 * Điền sẵn bộ 3 select Ngày/Tháng/Năm — dùng khi khôi phục lá số khách đã lập ở trang miễn phí,
 * để họ không phải nhập lại sau khi đăng nhập (xem `src/lib/la-so-tam.ts`).
 * Trả về true nếu điền được cả 3 (năm ngoài phạm vi select thì coi như thất bại, giữ form trống
 * còn hơn điền sai).
 */
export function ghiDateSelects(idPrefix: string, d: { year: number; month: number; day: number }): boolean {
  const ngayEl = document.getElementById(`${idPrefix}-ngay`) as HTMLSelectElement | null;
  const thangEl = document.getElementById(`${idPrefix}-thang`) as HTMLSelectElement | null;
  const namEl = document.getElementById(`${idPrefix}-nam`) as HTMLSelectElement | null;
  if (!ngayEl || !thangEl || !namEl) return false;
  namEl.value = String(d.year);
  thangEl.value = String(d.month);
  ngayEl.value = String(d.day);
  // Một số select lọc số ngày theo tháng/năm — báo cho chúng biết giá trị đã đổi.
  namEl.dispatchEvent(new Event("change", { bubbles: true }));
  thangEl.dispatchEvent(new Event("change", { bubbles: true }));
  ngayEl.value = String(d.day); // đặt lại phòng khi danh sách ngày vừa được dựng lại
  return namEl.value === String(d.year) && thangEl.value === String(d.month) && ngayEl.value === String(d.day);
}
