// Đọc giá trị từ bộ 3 select Ngày/Tháng/Năm được render bởi components/ui/DateSelect.astro.
export function readDateSelects(idPrefix: string): { year: number; month: number; day: number } | null {
  const ngayEl = document.getElementById(`${idPrefix}-ngay`) as HTMLSelectElement | null;
  const thangEl = document.getElementById(`${idPrefix}-thang`) as HTMLSelectElement | null;
  const namEl = document.getElementById(`${idPrefix}-nam`) as HTMLSelectElement | null;
  if (!ngayEl || !thangEl || !namEl || !ngayEl.value || !thangEl.value || !namEl.value) return null;
  return { day: Number(ngayEl.value), month: Number(thangEl.value), year: Number(namEl.value) };
}
