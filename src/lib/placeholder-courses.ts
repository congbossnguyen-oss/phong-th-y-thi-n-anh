// Khóa học — thay bằng dữ liệu Sanity `course`/`lesson` thật ở Giai đoạn 4.
export const courses = [
  {
    slug: "nhap-mon-phong-thuy",
    name: "Nhập môn Phong thủy ứng dụng",
    format: "online" as const,
    price: 1990000,
    lessonsCount: 12,
    summary: "Nền tảng lý thuyết Ngũ Hành, Bát Quái và cách ứng dụng vào không gian sống.",
  },
  {
    slug: "trach-nhat-thuc-chien",
    name: "Trạch Nhật thực chiến",
    format: "offline" as const,
    price: 4990000,
    lessonsCount: 8,
    summary: "Khóa học trực tiếp cùng chuyên gia, thực hành chọn ngày cho các sự kiện quan trọng.",
  },
  {
    slug: "bat-tu-chuyen-sau",
    name: "Bát Tự chuyên sâu",
    format: "online" as const,
    price: 3490000,
    lessonsCount: 20,
    summary: "Luận giải lá số bát tự từ cơ bản đến nâng cao, có bài tập thực hành.",
  },
];
