/**
 * Cửu Cung Năm/Tháng thật — nguồn "Vạn Niên Lịch Tam Nguyên Huyền Không Đại Quái" (bản cập nhật
 * chủ dự án cung cấp 2026-08-15, ĐÃ BỔ SUNG ĐỦ NĂM 2030 — phủ liền mạch 1968-2068). Dùng để tra
 * Ngũ Hoàng chính xác cho Bước 3 — KHÔNG tính lại bằng công thức phi tinh. Convert thẳng từ CSV.
 *
 * Mỗi phần tử = 1 khối Năm (laKhoiNam=true) hoặc 1 khối Tháng (laKhoiNam=false, theo tiết khí).
 * grid.* = 9 số Lạc Thư — ô nào = 5 là cung mang Ngũ Hoàng.
 *
 * hknh/quaiVan: chỉ dùng để ĐỐI CHIẾU tìm đúng khối tháng (khớp với HKNH/Quái Vận tính độc lập từ
 * Can Chi tháng thật) — KHÔNG dùng suy ra Can Chi (cột can/chi gốc không đáng tin, đã bỏ khi convert).
 */
export interface CuuCungGridRow {
  nam: number;
  laKhoiNam: boolean;
  thuTuKhoi: number;
  khoangNgayDL: string | null;
  hknh: number | null;
  quaiVan: number | null;
  tamSatPhuong: string | null;
  grid: { DN: number; N: number; TN: number; D: number; TT: number; T: number; DB: number; B: number; TB: number };
}

export const CUU_CUNG_NAM_THANG: readonly CuuCungGridRow[] = [
  {
    "nam": 1968,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1968,
    "laKhoiNam": false,
    "thuTuKhoi": 14,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 9,
      "TN": 1,
      "D": 2,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1971,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1972,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1973,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 7,
      "DB": 9,
      "B": 2,
      "TB": 8
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1974,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1975,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1976,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1977,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 4,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 3,
      "TB": 9
    }
  },
  {
    "nam": 1978,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 3,
      "TN": 1,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1979,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1980,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 3,
      "TN": 5,
      "D": 5,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1981,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1982,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1983,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1984,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1985,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1986,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1987,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1988,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1989,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1990,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1991,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1992,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 5,
      "TN": 7,
      "D": 7,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1993,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 0,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 5,
      "TN": 7,
      "D": 7,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1994,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": null,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1995,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1996,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1997,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1998,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1999,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 0,
      "N": 9,
      "TN": 2,
      "D": 4,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2000,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 14,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1969,
    "laKhoiNam": false,
    "thuTuKhoi": 15,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 1970,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2001,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2002,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2003,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2004,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2005,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2006,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2007,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2008,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2009,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2010,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2011,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2012,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2013,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2014,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2015,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2016,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2017,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2018,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2019,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2020,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2021,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2022,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2023,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2024,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2025,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2026,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2027,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2028,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2029,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": "6/1-3/2 DL",
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "4/2-5/3 DL",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "6/3-4/4 DL",
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "5/4-5/5 DL",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "5/5-5/6 DL",
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "6/6-6/7 DL",
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "7/7-6/8 DL",
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "7/8-7/9 DL",
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "8/9-7/10 DL",
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "8/10-6/11 DL",
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "7/11-6/12 DL",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2030,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "7/12-5/1 DL",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": null,
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2031,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2032,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2033,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2034,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2035,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2036,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2037,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2038,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2039,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2040,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2041,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2042,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2043,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": null,
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2044,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2045,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2046,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2047,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2048,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2049,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2050,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2051,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2052,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2053,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2054,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2055,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2056,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2057,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2058,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2059,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2060,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2061,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 0,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2062,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2063,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 3,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 9,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 7,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 2,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2064,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 3,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 4,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 7,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 4,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2065,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 9,
    "quaiVan": 2,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 3,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 6,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 1,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 9,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 6,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2066,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 9,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 8,
    "quaiVan": 8,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 1,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 7,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 2,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 3,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 6,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 9,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 7,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2067,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": true,
    "thuTuKhoi": 1,
    "khoangNgayDL": null,
    "hknh": 7,
    "quaiVan": 4,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 2,
    "khoangNgayDL": null,
    "hknh": 6,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 3,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 9,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 4,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 4,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 5,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 5,
      "N": 1,
      "TN": 3,
      "D": 4,
      "TT": 6,
      "T": 8,
      "DB": 9,
      "B": 2,
      "TB": 7
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 6,
    "khoangNgayDL": "Tam Sát",
    "hknh": 2,
    "quaiVan": 8,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 4,
      "N": 9,
      "TN": 2,
      "D": 3,
      "TT": 5,
      "T": 7,
      "DB": 8,
      "B": 1,
      "TB": 6
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 7,
    "khoangNgayDL": "Tam Sát",
    "hknh": 3,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 3,
      "N": 8,
      "TN": 1,
      "D": 2,
      "TT": 4,
      "T": 6,
      "DB": 7,
      "B": 9,
      "TB": 5
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 8,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 2,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 2,
      "N": 7,
      "TN": 9,
      "D": 1,
      "TT": 3,
      "T": 5,
      "DB": 6,
      "B": 8,
      "TB": 4
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 9,
    "khoangNgayDL": "Tam Sát",
    "hknh": 7,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 1,
      "N": 6,
      "TN": 8,
      "D": 9,
      "TT": 2,
      "T": 4,
      "DB": 5,
      "B": 7,
      "TB": 3
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 10,
    "khoangNgayDL": "Tam Sát",
    "hknh": 8,
    "quaiVan": 3,
    "tamSatPhuong": "Đông",
    "grid": {
      "DN": 9,
      "N": 5,
      "TN": 7,
      "D": 8,
      "TT": 1,
      "T": 3,
      "DB": 4,
      "B": 6,
      "TB": 2
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 11,
    "khoangNgayDL": "Tam Sát",
    "hknh": 4,
    "quaiVan": 4,
    "tamSatPhuong": "Bắc",
    "grid": {
      "DN": 8,
      "N": 4,
      "TN": 6,
      "D": 7,
      "TT": 9,
      "T": 2,
      "DB": 3,
      "B": 5,
      "TB": 1
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 12,
    "khoangNgayDL": "Tam Sát",
    "hknh": 6,
    "quaiVan": 6,
    "tamSatPhuong": "Tây",
    "grid": {
      "DN": 7,
      "N": 3,
      "TN": 5,
      "D": 6,
      "TT": 8,
      "T": 1,
      "DB": 2,
      "B": 4,
      "TB": 9
    }
  },
  {
    "nam": 2068,
    "laKhoiNam": false,
    "thuTuKhoi": 13,
    "khoangNgayDL": "Tam Sát",
    "hknh": 1,
    "quaiVan": 1,
    "tamSatPhuong": "Nam",
    "grid": {
      "DN": 6,
      "N": 2,
      "TN": 4,
      "D": 5,
      "TT": 7,
      "T": 9,
      "DB": 1,
      "B": 3,
      "TB": 8
    }
  }
];
