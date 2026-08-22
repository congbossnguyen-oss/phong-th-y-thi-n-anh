// QUÂN SƯ THIÊN ANH — 15 nhóm vấn đề (Question Categories).
//
// Màn hình đầu tiên hỏi "Anh đang quan tâm điều gì?" và hiển thị các nhóm này để người dùng chọn.
// Là DỮ LIỆU thuần — trang chọn nhóm đọc từ đây, không hard-code.

import type { CategoryDefinition } from "./types";

export const APP_OPENING_PROMPT = "Anh đang quan tâm điều gì?";

export const categories: CategoryDefinition[] = [
  {
    id: "su-nghiep",
    title: "Sự nghiệp",
    icon: "💼",
    subtitle: "Xin việc, chuyển việc, thăng chức, hướng đi lâu dài.",
    order: 1,
  },
  {
    id: "kinh-doanh",
    title: "Kinh doanh",
    icon: "🏪",
    subtitle: "Mở cửa hàng, mở công ty, mở rộng, ra sản phẩm.",
    order: 2,
  },
  {
    id: "tai-chinh",
    title: "Tài chính",
    icon: "💰",
    subtitle: "Vay, cho vay, đòi nợ, thu hồi vốn, mua bán tài sản.",
    order: 3,
  },
  {
    id: "dau-tu",
    title: "Đầu tư",
    icon: "📈",
    subtitle: "Góp vốn, rút vốn, nên tiếp tục hay dừng.",
    order: 4,
  },
  {
    id: "bat-dong-san",
    title: "Bất động sản",
    icon: "🏠",
    subtitle: "Mua bán nhà đất, giữ hay bán, ký hợp đồng.",
    order: 5,
  },
  {
    id: "nha-cua",
    title: "Nhà cửa / Phong thủy",
    icon: "🏡",
    subtitle: "Nhà này ở tốt hay xấu, có nên mua, cho thuê hay bán được không.",
    order: 6,
  },
  {
    id: "hop-tac",
    title: "Hợp tác",
    icon: "🤝",
    subtitle: "Chọn đối tác, có nên hợp tác, tiếp tục hay dừng.",
    order: 7,
  },
  {
    id: "tinh-duyen-hon-nhan",
    title: "Tình duyên / Hôn nhân",
    icon: "💗",
    subtitle: "Có nên tiến tới, quan hệ hiện tại, người cũ.",
    order: 8,
  },
  {
    id: "thi-cu",
    title: "Thi cử",
    icon: "🎓",
    subtitle: "Thi đỗ, chọn trường, chọn ngành, kỳ thi lớn.",
    order: 9,
  },
  {
    id: "thi-dau-canh-tranh",
    title: "Thi đấu / Cạnh tranh",
    icon: "🏆",
    subtitle: "Có nên tham gia, khả năng thắng, đối thủ, chiến thuật.",
    order: 10,
  },
  {
    id: "kien-tung-tranh-chap",
    title: "Kiện tụng / Tranh chấp",
    icon: "⚖️",
    subtitle: "Có nên kiện, nên hòa giải, đàm phán, tranh chấp hợp đồng.",
    order: 11,
    notice:
      "Nội dung mang tính tham khảo, không thay thế tư vấn của luật sư hay chuyên gia pháp lý.",
  },
  {
    id: "suc-khoe",
    title: "Sức khỏe",
    icon: "🌿",
    subtitle: "Xu hướng sức khỏe, hướng điều trị, quyết định chăm sóc.",
    order: 12,
    notice:
      "Nội dung mang tính tham khảo, KHÔNG thay thế chẩn đoán và điều trị y khoa. Vấn đề nghiêm trọng xin gặp bác sĩ.",
  },
  {
    id: "xuat-hanh",
    title: "Xuất hành",
    icon: "🧭",
    subtitle: "Chuyến đi, công tác, gặp đối tác, đi xa quan trọng.",
    order: 13,
  },
  {
    id: "chon-ngay-gio",
    title: "Chọn ngày giờ",
    icon: "📅",
    subtitle: "Khai trương, ký hợp đồng, nhập trạch, cưới hỏi, việc lớn.",
    order: 14,
  },
  {
    id: "quyet-dinh",
    title: "Quyết định",
    icon: "🔀",
    subtitle: "A hay B, tiến hay lui, làm ngay hay chờ, tiếp tục hay dừng.",
    order: 15,
  },
];

const categoryById = new Map(categories.map((c) => [c.id, c]));

export function getCategory(id: string): CategoryDefinition | undefined {
  return categoryById.get(id as CategoryDefinition["id"]);
}

export function getAllCategories(): CategoryDefinition[] {
  return [...categories].sort((a, b) => a.order - b.order);
}
