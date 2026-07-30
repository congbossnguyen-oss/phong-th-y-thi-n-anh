// Khóa học — thay bằng dữ liệu Sanity `course`/`lesson` thật ở Giai đoạn 4.
export interface Lesson {
  slug: string;
  title: string;
  durationLabel: string;
}

export interface Course {
  slug: string;
  name: string;
  format: "online" | "offline";
  price: number;
  lessonsCount: number;
  summary: string;
  lessons?: Lesson[];
}

export const courses: Course[] = [
  {
    slug: "nhap-mon-phong-thuy",
    name: "Nhập môn Phong thủy ứng dụng",
    format: "online",
    price: 1990000,
    lessonsCount: 6,
    summary: "Nền tảng lý thuyết Ngũ Hành, Bát Quái và cách ứng dụng vào không gian sống.",
    lessons: [
      { slug: "gioi-thieu-khoa-hoc", title: "Giới thiệu khóa học", durationLabel: "5:20" },
      { slug: "nguyen-ly-ngu-hanh", title: "Nguyên lý Ngũ Hành", durationLabel: "18:40" },
      { slug: "bat-quai-co-ban", title: "Bát Quái cơ bản", durationLabel: "22:10" },
      { slug: "dong-tay-tu-trach", title: "Đông Tứ Trạch — Tây Tứ Trạch", durationLabel: "25:00" },
      { slug: "ung-dung-nha-o", title: "Ứng dụng vào nhà ở thực tế", durationLabel: "30:15" },
      { slug: "tong-ket-bai-tap", title: "Tổng kết & bài tập thực hành", durationLabel: "15:45" },
    ],
  },
  {
    slug: "trach-nhat-thuc-chien",
    name: "Trạch Nhật thực chiến",
    format: "offline",
    price: 4990000,
    lessonsCount: 8,
    summary: "Khóa học trực tiếp cùng chuyên gia, thực hành chọn ngày cho các sự kiện quan trọng.",
  },
  {
    slug: "bat-tu-chuyen-sau",
    name: "Bát Tự chuyên sâu",
    format: "online",
    price: 3490000,
    lessonsCount: 6,
    summary: "Luận giải lá số bát tự từ cơ bản đến nâng cao, có bài tập thực hành.",
    lessons: [
      { slug: "nhap-mon-bat-tu", title: "Nhập môn Bát Tự — Can Chi cơ bản", durationLabel: "20:00" },
      { slug: "lap-la-so", title: "Cách lập lá số Tứ Trụ", durationLabel: "24:30" },
      { slug: "vuong-suy-than", title: "Xác định vượng suy của Thân", durationLabel: "28:10" },
      { slug: "dung-than-hy-than", title: "Dụng Thần — Hỷ Thần", durationLabel: "26:45" },
      { slug: "luan-tai-quan", title: "Luận Tài — Quan trong lá số", durationLabel: "22:20" },
      { slug: "bai-tap-thuc-hanh", title: "Bài tập thực hành luận giải", durationLabel: "19:00" },
    ],
  },
];
