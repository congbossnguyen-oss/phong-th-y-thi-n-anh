// Dữ liệu tạm thời để dựng giao diện trước khi kết nối Sanity CMS thật (Giai đoạn 0/3).
// Khi có SANITY_PROJECT_ID, thay các import này bằng truy vấn từ src/lib/cms/queries.ts.

export const stats = [
  { value: "1000+", label: "Khách hàng tin tưởng" },
  { value: "10", label: "Năm kinh nghiệm" },
];

export const services = [
  {
    slug: "phong-thuy-nha-o",
    name: "Phong thủy nhà ở",
    summary: "Tư vấn bố cục, hướng nhà, nội thất hợp mệnh gia chủ để đón vượng khí.",
    priceFrom: "3.000.000đ – 5.000.000đ",
    image: "/images/services/phong-thuy-nha-o.jpg",
    intro: [
      `"Nhà em hướng Tây Nam, mua rồi mới biết không hợp tuổi chồng — giờ có phải đập đi xây lại không?" — đó là câu hỏi khách hàng hỏi nhiều nhất. Câu trả lời gần như luôn là: không cần đập, chỉ cần điều chỉnh đúng chỗ.`,
      "Phong thủy nhà ở không phải việc đi tìm một ngôi nhà hoàn hảo tuyệt đối — vì gần như không tồn tại. Đó là việc tìm ra 2-3 điểm điều chỉnh có tác động lớn nhất: hướng cửa chính, vị trí bếp, vị trí phòng ngủ chủ — đối chiếu đúng mệnh quái và Đông/Tây Tứ Trạch của gia chủ, thay vì áp một công thức chung cho mọi nhà.",
    ],
    suitableFor: [
      "Gia đình chuẩn bị mua nhà, muốn kiểm tra trước khi đặt cọc",
      "Nhà đã ở nhưng cảm thấy công việc, sức khỏe, hòa khí gia đình không thuận",
      "Chuẩn bị sửa chữa, cải tạo và muốn tận dụng dịp này để điều chỉnh phong thủy",
    ],
    faq: [
      {
        q: "Nhà hướng xấu có bắt buộc phải đổi hướng không?",
        a: "Không. Phần lớn trường hợp có thể hóa giải bằng cách điều chỉnh nội thất, màu sắc, vị trí bếp — không cần đập phá kết cấu.",
      },
      {
        q: "Tư vấn qua hình ảnh có chính xác không?",
        a: "Có thể luận sơ bộ, nhưng để kết luận chính xác cần khảo sát trực tiếp hoặc bản vẽ đầy đủ kèm số đo la bàn thật.",
      },
    ],
  },
  {
    slug: "xem-ngay-cao-cap",
    name: "Xem ngày cao cấp",
    summary: "Chọn ngày giờ tốt cho khai trương, động thổ, cưới hỏi, nhập trạch.",
    priceFrom: "1.000.000đ",
    image: "/images/services/xem-ngay-cao-cap.jpg",
    intro: [
      `Ông bà xưa có câu "lấy vợ xem tuổi đàn bà, làm nhà xem tuổi đàn ông" — chọn đúng ngày giờ từ lâu đã là bước không thể bỏ qua trước những cột mốc quan trọng. Xem ngày không đơn thuần là tránh ngày xấu theo lịch vạn niên thông thường, mà là đối chiếu Can Chi ngày giờ dự kiến với mệnh cục gia chủ, tránh phạm Tam Tai, Không Vong, Nguyệt Kỵ.`,
      "Dịch vụ áp dụng cho khai trương, động thổ, cưới hỏi, nhập trạch, ký kết hợp đồng và các sự kiện quan trọng khác trong đời sống lẫn kinh doanh.",
    ],
    suitableFor: [
      "Gia đình chuẩn bị cưới hỏi, động thổ, nhập trạch",
      "Doanh nghiệp chuẩn bị khai trương, ký kết hợp đồng lớn",
      "Người muốn xác nhận lại ngày đã chọn trước khi tiến hành",
    ],
    faq: [
      {
        q: "Xem ngày qua lịch vạn niên có đủ chưa?",
        a: "Lịch vạn niên chỉ cho biết ngày tốt xấu chung theo Nhị Thập Bát Tú, chưa đối chiếu với mệnh cục riêng — cùng một ngày có thể hợp người này nhưng phạm với người khác.",
      },
      {
        q: "Cần chuẩn bị thông tin gì để xem ngày?",
        a: "Ngày giờ sinh của người chủ sự (và người liên quan nếu là cưới hỏi), việc cần làm, và địa điểm thực hiện.",
      },
    ],
  },
  {
    slug: "bat-tu",
    name: "Bát tự",
    summary: "Luận giải lá số bát tự: sự nghiệp, tài lộc, hôn nhân, sức khỏe.",
    priceFrom: "2.000.000đ – 3.000.000đ",
    image: "/images/services/bat-tu.jpg",
    intro: [
      'Bát Tự (hay Tứ Trụ) là 8 chữ Can Chi tạo từ năm, tháng, ngày, giờ sinh — được xem như "bản đồ" Ngũ Hành của một đời người. Qua việc luận vượng suy của Nhật Chủ, tìm Dụng Thần và xét các đại vận, chuyên gia có thể chỉ ra xu hướng sự nghiệp, tài lộc, hôn nhân, sức khỏe trong từng giai đoạn.',
      "Khác với các hình thức xem cảm tính, luận Bát Tự là một hệ thống có quy tắc rõ ràng, dựa trên quan hệ sinh khắc giữa các Can Chi — mỗi kết luận đều có căn cứ có thể giải thích được.",
    ],
    suitableFor: [
      "Người muốn hiểu điểm mạnh/yếu bản thân trước quyết định lớn (đổi việc, khởi nghiệp, kết hôn)",
      "Cha mẹ muốn hiểu tính cách, định hướng phù hợp cho con",
      "Người đang gặp giai đoạn khó khăn, muốn biết thời điểm chuyển vận",
    ],
    faq: [
      {
        q: "Bát Tự có đoán trước tương lai chính xác 100% không?",
        a: "Không. Bát Tự cho biết xu hướng vượng suy theo từng giai đoạn (đại vận, lưu niên) — là cơ sở để chủ động chuẩn bị, không phải lời tiên tri tuyệt đối.",
      },
      {
        q: "Người sinh cùng giờ có số phận giống nhau?",
        a: "Không hoàn toàn — môi trường sống, gia đình và lựa chọn cá nhân cũng tác động lớn đến vận trình thực tế; Bát Tự chỉ là một trong nhiều yếu tố.",
      },
    ],
  },
  {
    slug: "phong-thuy-van-phong",
    name: "Phong thủy văn phòng",
    summary: "Bố trí không gian làm việc, kinh doanh thu hút tài lộc, hanh thông.",
    priceFrom: "5.000.000đ – 10.000.000đ",
    image: "/images/services/phong-thuy-van-phong.jpg",
    intro: [
      "Một văn phòng bố trí đúng phong thủy không chỉ đẹp mắt mà còn ảnh hưởng trực tiếp đến dòng tiền, mối quan hệ đối tác và tinh thần làm việc của cả đội ngũ. Dịch vụ tập trung vào 3 điểm trọng yếu: vị trí bàn làm việc của người đứng đầu, hướng cửa chính đón khách, và cách bố trí không gian chung để khí lưu thông thay vì tù đọng.",
      "Phù hợp cho văn phòng mới thuê, đang cải tạo lại không gian làm việc, hoặc khi công việc kinh doanh chững lại và muốn tìm nguyên nhân từ góc độ phong thủy.",
    ],
    suitableFor: [
      "Doanh nghiệp chuẩn bị thuê hoặc mở văn phòng mới",
      "Công ty cảm thấy công việc trì trệ, nhân sự biến động",
      "Cá nhân kinh doanh muốn tối ưu bàn làm việc, phòng riêng",
    ],
    faq: [
      {
        q: "Văn phòng đi thuê, không sửa được kết cấu thì tư vấn có ý nghĩa không?",
        a: "Có — phần lớn giải pháp là sắp xếp lại nội thất, hướng bàn, màu sắc, vật phẩm hóa giải, không nhất thiết phải đập phá kết cấu thuê.",
      },
      {
        q: "Có cần khảo sát trực tiếp không?",
        a: "Với văn phòng, nên khảo sát trực tiếp để đo hướng chính xác bằng la bàn và quan sát dòng người/khí thực tế, hạn chế tư vấn hoàn toàn qua ảnh.",
      },
    ],
  },
  {
    slug: "phong-thuy-nha-chuyen-sau",
    name: "Phong thủy nhà chuyên sâu",
    summary: "Luận giải toàn diện nhà ở theo nhiều trường phái, khảo sát thực địa và báo cáo chi tiết chuyên sâu.",
    priceFrom: "15.000.000đ – 20.000.000đ",
    image: "/images/services/phong-thuy-nha-chuyen-sau.jpg",
    intro: [
      "Đây là gói tư vấn chuyên sâu nhất, dành cho công trình quan trọng hoặc trường hợp đã áp dụng phong thủy cơ bản nhưng chưa thấy chuyển biến rõ rệt. Ngoài phân tích Bát Trạch thông thường, chuyên gia đối chiếu thêm theo Huyền Không Phi Tinh (vận khí theo từng giai đoạn 20 năm) và khảo sát thực địa toàn bộ công trình.",
      'Kết quả là một báo cáo luận giải chi tiết, không dừng ở kết luận "tốt/xấu" mà chỉ rõ nguyên nhân theo từng trường phái và phương án điều chỉnh theo thứ tự ưu tiên.',
    ],
    suitableFor: [
      "Biệt thự, nhà phố, công trình quy mô lớn",
      "Nhà đã tư vấn cơ bản nhưng chưa thấy cải thiện",
      "Người muốn đối chiếu nhiều trường phái trước khi quyết định",
    ],
    faq: [
      {
        q: "Khác gì so với gói Phong thủy nhà ở thông thường?",
        a: "Gói cơ bản tập trung Bát Trạch (hướng, cửa - bếp - phòng ngủ); gói chuyên sâu bổ sung Huyền Không Phi Tinh, khảo sát thực địa toàn diện và báo cáo chi tiết theo từng khu vực trong nhà.",
      },
      {
        q: "Thời gian thực hiện mất bao lâu?",
        a: "Tùy quy mô công trình, thường cần khảo sát trực tiếp và vài ngày để phân tích, tổng hợp báo cáo trước khi bàn giao.",
      },
    ],
  },
  {
    slug: "sim-so-phong-thuy",
    name: "Sim Số Phong Thủy Kích Vận Khí",
    summary: "Lựa chọn sim số hợp bản mệnh theo nguyên lý Âm Dương - Ngũ Hành, giúp hài hòa năng lượng và đồng hành trên hành trình phát triển.",
    priceFrom: "Liên hệ",
    image: "/images/services/sim-so-phong-thuy.jpg",
    intro: [
      'Một số điện thoại được sử dụng hàng ngày, xuất hiện trên danh thiếp, hợp đồng — về mặt năng lượng học, dãy số lặp lại liên tục cũng được xem là một dạng trường khí đồng hành cùng người sở hữu. Chọn sim phong thủy là chọn dãy số có tổng Ngũ Hành và tổ hợp số tương sinh với bản mệnh, thay vì chỉ chọn theo quan niệm "số đẹp" dân gian như tứ quý, lộc phát thông thường.',
      "Dịch vụ phù hợp cho cả sim cá nhân và sim đại diện thương hiệu, doanh nghiệp.",
    ],
    suitableFor: [
      "Người muốn đổi sim hợp mệnh",
      "Doanh nghiệp chọn hotline đại diện thương hiệu",
      "Người kinh doanh muốn số điện thoại hỗ trợ giao dịch thuận lợi",
    ],
    faq: [
      {
        q: "Số đẹp theo phong thủy có giống số đẹp dân gian (68, 79...) không?",
        a: "Không nhất thiết. Một dãy số dân gian gọi là đẹp nhưng Ngũ Hành lại khắc với bản mệnh vẫn có thể không phù hợp, hoặc ngược lại.",
      },
      {
        q: "Cần cung cấp thông tin gì để chọn sim?",
        a: "Ngày giờ sinh của người sẽ sử dụng chính, để xác định bản mệnh trước khi đối chiếu với các đầu số hiện có.",
      },
    ],
  },
  {
    slug: "cung-dong-tho-nhap-trach-lap-ban-than-tai",
    name: "Cúng động thổ, nhập trạch, lập bàn thần tài",
    summary: "Thực hiện nghi lễ cúng động thổ, nhập trạch và lập bàn thờ Thần Tài đúng nghi thức, chọn ngày giờ hợp mệnh gia chủ.",
    priceFrom: "5.000.000đ – 7.000.000đ",
    image: "/images/services/cung-dong-tho-nhap-trach-lap-ban-than-tai.jpg",
    intro: [
      'Động thổ, nhập trạch, lập bàn thờ Thần Tài là những nghi lễ mang tính khởi đầu — theo quan niệm truyền thống, làm đúng nghi thức và đúng thời điểm được xem là cách "báo cáo" với thổ địa, gia tiên trước khi bắt đầu một giai đoạn mới, giúp công việc hanh thông, tránh phạm phải những điều kiêng kỵ ban đầu.',
      "Chuyên gia hỗ trợ chọn ngày giờ hợp mệnh gia chủ, chuẩn bị lễ vật đúng nghi thức và trực tiếp thực hiện hoặc hướng dẫn gia chủ tự thực hiện nghi lễ.",
    ],
    suitableFor: [
      "Gia đình chuẩn bị động thổ, xây nhà mới",
      "Người chuyển về nhà mới (nhập trạch)",
      "Người kinh doanh mở bàn thờ Thần Tài lần đầu",
    ],
    faq: [
      {
        q: "Có bắt buộc phải mời thầy cúng trực tiếp không?",
        a: "Không bắt buộc — có thể chỉ cần tư vấn ngày giờ và hướng dẫn nghi thức để gia chủ tự thực hiện, hoặc chuyên gia trực tiếp thực hiện tùy nhu cầu.",
      },
      {
        q: "Nhập trạch nhưng chưa ở ngay có cần làm lễ không?",
        a: 'Vẫn nên làm lễ nhập trạch đúng ngày đã chọn dù chưa dọn vào ở ngay — theo quan niệm truyền thống, đây là bước "xác nhận" ngôi nhà đã có chủ.',
      },
    ],
  },
  {
    slug: "chon-ngay-gio-sinh",
    name: "Chọn ngày giờ sinh (sinh mổ)",
    summary: "Chọn ngày giờ sinh mổ tốt dựa trên thông tin bác sĩ đưa ra, giúp con hợp mệnh và khởi đầu vận trình thuận lợi.",
    priceFrom: "1.000.000đ",
    image: "/images/services/chon-ngay-gio-sinh.jpg",
    intro: [
      "Với các ca sinh mổ chủ động, gia đình có thể chọn được ngày giờ chào đời cho con — đây là quyết định chỉ có một lần, nên nhiều gia đình muốn cân nhắc kỹ theo cả yếu tố y khoa lẫn phong thủy. Dịch vụ dựa trên khung thời gian bác sĩ đưa ra để chọn ra ngày giờ có Bát Tự hài hòa nhất trong khung đó.",
      "Chuyên gia không chọn ngày giờ ngoài chỉ định y khoa, mà chỉ tối ưu trong phạm vi bác sĩ đã cho phép.",
    ],
    suitableFor: [
      "Gia đình đã có lịch sinh mổ dự kiến từ bác sĩ",
      "Cha mẹ muốn con có lá số hài hòa ngay từ đầu",
      "Gia đình muốn đối chiếu thêm phong thủy trước quyết định cuối",
    ],
    faq: [
      {
        q: "Có thể chọn ngày giờ sinh ngoài chỉ định của bác sĩ không?",
        a: "Không nên, và dịch vụ cũng không thực hiện việc này — an toàn của mẹ và bé luôn là ưu tiên số một, phong thủy chỉ tối ưu trong khung thời gian y khoa cho phép.",
      },
      {
        q: "Cần cung cấp thông tin gì?",
        a: "Khung ngày bác sĩ chỉ định và ngày giờ sinh của bố mẹ để đối chiếu mệnh cục gia đình.",
      },
    ],
  },
  {
    slug: "luan-que-kinh-dich-ky-mon",
    name: "Luận quẻ Kinh Dịch - Kỳ Môn",
    summary: "Luận giải sự vụ, tài vận, quan vận, nhân duyên, sức khỏe... qua quẻ Kinh Dịch và Kỳ Môn Độn Giáp.",
    priceFrom: "500.000đ – 1.000.000đ",
    image: "/images/services/luan-que-kinh-dich-ky-mon.jpg",
    intro: [
      "Kinh Dịch và Kỳ Môn Độn Giáp là hai hệ thống dự đoán cổ xưa dựa trên sự vận hành của quẻ và các sao theo thời gian thực. Khác với Bát Tự (luận cả đời người), Kinh Dịch và Kỳ Môn thường dùng để trả lời một câu hỏi cụ thể tại một thời điểm cụ thể — nên làm hay không nên làm, thời điểm nào thuận lợi, hướng đi nào nên chọn.",
      "Phù hợp khi cần ra quyết định nhanh cho một sự việc cụ thể, thay vì luận giải tổng quan dài hạn.",
    ],
    suitableFor: [
      "Người cần quyết định cho một sự việc cụ thể (đầu tư, đàm phán, kiện tụng)",
      "Người muốn biết thời điểm thuận lợi để hành động",
      "Người đã xem Bát Tự nhưng muốn đối chiếu thêm cho tình huống hiện tại",
    ],
    faq: [
      {
        q: "Nên chọn Bát Tự hay Kinh Dịch/Kỳ Môn?",
        a: "Bát Tự phù hợp để hiểu xu hướng dài hạn cả cuộc đời; Kinh Dịch/Kỳ Môn phù hợp hơn khi cần quyết định nhanh cho một việc cụ thể trong thời gian ngắn.",
      },
      {
        q: "Lập quẻ có cần ngày giờ sinh không?",
        a: "Kinh Dịch thường lập quẻ theo thời điểm hỏi việc, không nhất thiết cần ngày sinh; Kỳ Môn Độn Giáp có thể kết hợp thêm Tứ Trụ nếu cần luận sâu hơn.",
      },
    ],
  },
  {
    slug: "co-van-chien-luoc-toan-dien",
    name: "Cố vấn chiến lược toàn diện (dành cho doanh nghiệp)",
    summary: "Hỗ trợ tuyển dụng nhân sự, bố trí sắp xếp cán bộ cấp cao, hóa giải sự vụ, bố trí phong thủy công ty, xem ngày giờ ký kết... đồng hành cùng doanh nghiệp trong 1 năm.",
    priceFrom: "30.000.000đ – 50.000.000đ / năm",
    image: "/images/services/co-van-chien-luoc-toan-dien.jpg",
    intro: [
      "Đây là gói đồng hành dài hạn dành riêng cho doanh nghiệp — không dừng ở một buổi tư vấn mà là một năm hỗ trợ liên tục cho các quyết định quan trọng: sắp xếp nhân sự cấp cao, chọn ngày ký kết hợp đồng lớn, bố trí lại phong thủy văn phòng theo từng giai đoạn kinh doanh, và xử lý sự vụ phát sinh khi cần.",
      "Phù hợp với doanh nghiệp coi phong thủy và mệnh lý là một phần trong chiến lược quản trị rủi ro, bên cạnh các yếu tố tài chính, nhân sự thông thường.",
    ],
    suitableFor: [
      "Doanh nghiệp đang mở rộng quy mô, cần ra nhiều quyết định lớn trong năm",
      "Chủ doanh nghiệp muốn có kênh tham vấn thường xuyên thay vì tư vấn một lần",
      "Công ty đang tái cấu trúc nhân sự cấp cao",
    ],
    faq: [
      {
        q: "Khác gì so với việc đặt lịch tư vấn từng lần riêng lẻ?",
        a: "Gói đồng hành 1 năm giúp chuyên gia hiểu sâu bối cảnh doanh nghiệp theo thời gian, thay vì mỗi lần tư vấn phải bắt đầu lại từ đầu, đồng thời chủ động hỗ trợ khi có sự vụ phát sinh.",
      },
      {
        q: "Có thể chỉ dùng một phần dịch vụ trong gói không?",
        a: "Nội dung cụ thể trong gói được thống nhất theo nhu cầu thực tế của từng doanh nghiệp khi trao đổi trực tiếp.",
      },
    ],
  },
];

export const products = [
  {
    slug: "ty-huu-phong-thuy",
    name: "Tỳ Hưu Chiêu Tài",
    category: "Chiêu Tài - Kích Lộc",
    price: 1868000,
    image: "/images/products/ty-huu-phong-thuy.jpeg",
    description: "Tỳ Hưu là linh vật phong thủy giúp chiêu tài, giữ lộc và trấn trạch trừ tà khí cho gia chủ.",
    benefits: [
      {
        title: "Hút tiền tài",
        desc: "Giúp công việc kinh doanh buôn bán thuận lợi, hồng phát và thu hút nguồn vượng khí lớn cho gia chủ.",
      },
      {
        title: "Giữ của cải",
        desc: "Ngăn không cho tiền bạc thất thoát ra ngoài, phù hợp cho người làm ăn, buôn bán lớn.",
      },
      {
        title: "Xua đuổi tà ma",
        desc: "Đặt tượng tỳ hưu trong nhà giúp bảo vệ bình yên cho các thành viên, ngăn chặn năng lượng xấu.",
      },
      {
        title: "Hóa giải sát khí",
        desc: "Giảm bớt vận hạn và những hướng nhà xấu theo quan niệm phong thủy.",
      },
    ],
  },
  {
    slug: "thap-van-xuong",
    name: "Tháp Văn Xương",
    category: "Công Danh - Sự Nghiệp",
    price: 968000,
    image: "/images/products/thap-van-xuong.jpg",
    description: "Tháp Văn Xương hỗ trợ khai mở trí tuệ, thúc đẩy công danh và mang lại bình an, may mắn cho gia chủ.",
    benefits: [
      {
        title: "Khai mở trí tuệ",
        desc: "Giúp người học tăng cường sự tập trung, ghi nhớ tốt hơn và sáng suốt trong các kỳ thi cử.",
      },
      {
        title: "Thúc đẩy công danh",
        desc: "Hỗ trợ người đi làm phát triển sự nghiệp, dễ thăng quan tiến chức hoặc đạt thành tựu cao trong nghiên cứu, quản lý.",
      },
      {
        title: "Xua đuổi uế khí",
        desc: "Trừ tà ma, xui rủi và thanh lọc các nguồn năng lượng tiêu cực xung quanh chủ nhân.",
      },
      {
        title: "Thu hút may mắn",
        desc: "Mang lại vượng khí, tài lộc và sự hanh thông cho người làm ăn, kinh doanh.",
      },
      {
        title: "Biểu tượng bình an",
        desc: "Giúp tâm tính bình tĩnh, từ bi và hướng thiện hơn trong cuộc sống.",
      },
    ],
  },
  {
    slug: "guong-bat-quai",
    name: "Gương Bát Quái Ma Phương",
    category: "Hóa Sát - Trấn Trạch",
    price: 1000000,
    image: "/images/products/guong-bat-quai.jpg",
    description:
      "Vật phẩm được lựa chọn kỹ lưỡng, phù hợp cho mục đích hóa sát - trấn trạch. Hóa giải hướng xấu ngũ quỷ, tuyệt mạng, họa hại lục sát, không vong.",
  },
  {
    slug: "vong-tay-tram-huong",
    name: "Vòng Tay Trầm Hương",
    category: "Hoá Giải Vận Hạn",
    price: 2468000,
    image: "/images/products/vong-tay-tram-huong.jpg",
    description:
      "Vòng Tay Trầm Hương mang ý nghĩa phong thủy và tâm linh sâu sắc, giúp xua đuổi tà khí, thu hút tài lộc và cân bằng năng lượng cho người đeo.",
    benefits: [
      {
        title: "Xua đuổi tà khí",
        desc: "Vòng được xem là vật phẩm giúp loại bỏ uế khí, tạp khí và bảo vệ chủ nhân.",
      },
      {
        title: "Thu hút tài lộc",
        desc: "Mang lại may mắn, bình an và thuận lợi cho người làm ăn, kinh doanh.",
      },
      {
        title: "Cân bằng năng lượng",
        desc: "Tượng trưng cho linh khí đất trời, giúp tinh thần người đeo luôn lạc quan và an yên.",
      },
    ],
  },
];

export const testimonials = [
  {
    name: "Anh Minh Tuấn",
    role: "Chủ doanh nghiệp, Hà Nội",
    avatar: "/images/team/testimonials/minh-tuan.jpg",
    quote:
      "Sau khi được Thiên Anh tư vấn lại bố cục văn phòng, công việc kinh doanh của tôi thuận lợi hẳn, đối tác tự tìm đến nhiều hơn.",
    rating: 5,
  },
  {
    name: "Chị Hà Lê",
    role: "Khách hàng cá nhân, TP.HCM",
    avatar: "/images/team/testimonials/ha-le.jpg",
    quote:
      "Đội ngũ chuyên gia rất tận tâm, giải thích cặn kẽ từng luận điểm chứ không chung chung. Rất an tâm khi nhờ tư vấn nhà mới.",
    rating: 5,
  },
  {
    name: "Anh Quang Huy",
    role: "Chủ đầu tư dự án, Đà Nẵng",
    avatar: "/images/team/testimonials/quang-huy.jpg",
    quote:
      "Thiên Anh hỗ trợ chọn ngày động thổ và bố trí tổng thể dự án rất chuyên nghiệp, đúng tiến độ và cát lợi.",
    rating: 5,
  },
];

export const posts = [
  {
    slug: "phong-thuy-nam-2026",
    title: "Luận đoán phong thủy năm 2026: Những điều cần lưu ý",
    excerpt: "Tổng quan vận khí năm mới và những lưu ý quan trọng cho từng mệnh cung.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
    publishedAt: "2026-08-01",
    image: "/images/blog/phong-thuy-nam-2026.png",
    content: [
      "Năm 2026 là thời điểm vận khí có nhiều chuyển biến. Mỗi ngôi nhà, mỗi gia đình sẽ chịu tác động khác nhau tùy theo hướng nhà, bố cục và sự vận hành của Cửu Cung Phi Tinh.",
      "Một vài điều chỉnh đúng lúc có thể giúp:",
      {
        list: [
          "Kích hoạt tài lộc.",
          "Gia tăng may mắn.",
          "Hóa giải sát khí.",
          "Ổn định sức khỏe và gia đạo.",
        ],
      },
      "Phong thủy không thay đổi số mệnh, nhưng giúp con người đón cát - tránh hung, sống hài hòa với thiên thời và địa khí.",
      "Nếu cần luận đoán phong thủy riêng cho ngôi nhà của bạn, hãy liên hệ Phong Thủy Thiên Anh để được tư vấn.",
    ],
  },
  {
    slug: "cach-bai-tri-ban-tho",
    title: "Cách bài trí bàn thờ gia tiên hợp phong thủy",
    excerpt: "Hướng dẫn chi tiết vị trí, hướng đặt và các vật phẩm cần thiết trên bàn thờ.",
    category: "Nhà ở",
    categorySlug: "nha-o",
    publishedAt: "2026-08-02",
    image: "/images/blog/cach-bai-tri-ban-tho.png",
    content: [
      "Ban thờ đẹp không bằng ban thờ đúng.",
      "Ban thờ gia tiên là nơi kết nối giữa con cháu với cội nguồn, vì vậy việc bài trí cần đảm bảo sự trang nghiêm, sạch sẽ và đúng nguyên tắc.",
      "Một ban thờ hợp phong thủy nên:",
      {
        list: [
          "Sắp xếp cân đối, gọn gàng.",
          "Đặt tại vị trí thanh tịnh.",
          "Thường xuyên lau dọn và thay nước, hoa tươi.",
          "Hạn chế đặt gần khu vực ô uế hoặc nhiều tiếng ồn.",
        ],
      },
      "Điều quan trọng nhất vẫn là lòng thành kính. Khi tâm an, gia đạo sẽ thêm hòa thuận và phúc khí cũng theo đó mà bền vững.",
      "Cần tư vấn bố trí ban thờ theo đúng phong thủy và phù hợp với ngôi nhà, hãy liên hệ Phong Thủy Thiên Anh.",
    ],
  },
  {
    slug: "chon-huong-nha-hop-menh",
    title: "Bí quyết chọn hướng nhà hợp mệnh gia chủ",
    excerpt: "Phân tích Đông Tứ Trạch – Tây Tứ Trạch và cách áp dụng thực tế.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
    publishedAt: "2026-08-02",
    image: "/images/blog/chon-huong-nha-hop-menh.png",
    content: [
      "Nhiều người cho rằng chỉ cần chọn hướng nhà hợp tuổi là mọi việc sẽ hanh thông. Thực tế, hướng nhà chỉ là một trong nhiều yếu tố quyết định phong thủy của một ngôi nhà.",
      "Để lựa chọn hướng nhà phù hợp, cần xem xét đồng thời mệnh quái của gia chủ, thế đất, môi trường xung quanh, hướng nắng, hướng gió và vận khí của từng thời kỳ. Một ngôi nhà có hướng đẹp nhưng bố cục sai hoặc phạm các yếu tố bất lợi vẫn có thể ảnh hưởng đến tài lộc, sức khỏe và sự ổn định của gia đình.",
      "Khi chọn đúng hướng nhà, bạn sẽ có cơ hội:",
      {
        list: [
          "Đón nhận sinh khí, giúp tài lộc lưu thông tốt hơn.",
          "Gia tăng sự ổn định trong công việc và sự nghiệp.",
          "Cải thiện sức khỏe, tinh thần và chất lượng cuộc sống.",
          "Góp phần xây dựng gia đạo hòa thuận, bền vững.",
        ],
      },
      { heading: "Một vài lưu ý quan trọng" },
      {
        list: [
          "Không nên chỉ chọn hướng theo tuổi mà bỏ qua điều kiện thực tế của khu đất.",
          "Cần kết hợp hướng cửa chính, vị trí bếp, phòng ngủ và các không gian quan trọng để tạo nên một tổng thể hài hòa.",
          "Với nhà đã xây, nếu hướng chưa phù hợp vẫn có thể áp dụng các giải pháp phong thủy để điều hòa và giảm bớt ảnh hưởng bất lợi.",
        ],
      },
      "Phong thủy không phải là thay đổi vận mệnh bằng phép màu, mà là tạo dựng một môi trường sống hài hòa giữa con người và thiên nhiên, từ đó giúp mỗi thành viên trong gia đình có thêm điều kiện để phát triển và đón nhận những cơ hội tốt đẹp.",
      "Phong Thủy Thiên Anh luôn sẵn sàng đồng hành cùng bạn trong việc lựa chọn hướng nhà, phân tích phong thủy tổng thể và đưa ra giải pháp phù hợp với từng ngôi nhà và từng gia chủ.",
    ],
  },
  {
    slug: "bat-tu-la-gi",
    title: "Bát Tự là gì? Hướng dẫn tổng quan cho người mới bắt đầu",
    excerpt: "Giải thích Bát Tự (Tứ Trụ) là gì, xem thế nào, khác gì với Tử Vi và Kinh Dịch.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
    publishedAt: "2026-08-03",
    image: "/images/courses/categories/bat-tu.png",
    content: [
      `Nếu bạn từng nghe ai đó nói "lá số Bát Tự của tôi mệnh Kim, thân nhược", chắc hẳn bạn sẽ tò mò: Bát Tự thực chất là gì, và làm sao để "đọc" được một lá số như vậy?`,
      "Bát Tự — hay còn gọi là Tứ Trụ — là 8 chữ Can Chi được tạo thành từ 4 mốc thời gian: năm, tháng, ngày và giờ sinh. Mỗi mốc gồm một Thiên Can và một Địa Chi, ghép lại thành 4 trụ (Năm trụ, Tháng trụ, Ngày trụ, Giờ trụ) — tổng cộng 8 chữ, nên gọi là Bát Tự.",
      { heading: "Bát Tự cho biết điều gì?" },
      "Trong Bát Tự, Thiên Can của ngày sinh được gọi là Nhật Chủ — đại diện cho chính bản thân người xem. Chuyên gia luận vượng suy của Nhật Chủ so với 7 chữ còn lại, từ đó xác định Dụng Thần (yếu tố cần bổ sung để cân bằng) và luận giải các khía cạnh: sự nghiệp, tài lộc, hôn nhân, sức khỏe theo từng giai đoạn Đại Vận 10 năm.",
      { heading: "Bát Tự khác gì với Tử Vi, Kinh Dịch?" },
      "Ba hệ thống này thường bị nhầm lẫn nhưng phục vụ mục đích khác nhau: Bát Tự phân tích qua Can Chi Ngũ Hành, thiên về luận vượng suy và Dụng Thần; Tử Vi an sao lên 12 cung để luận theo vị trí và bộ sao; Kinh Dịch, Kỳ Môn lại thường dùng để trả lời một câu hỏi cụ thể tại một thời điểm, hơn là luận cả đời người.",
      { heading: "Bát Tự có chính xác 100% không?" },
      "Không nên hiểu Bát Tự như một lời tiên tri tuyệt đối. Đây là công cụ chỉ ra xu hướng — Thân vượng hay nhược, giai đoạn nào thuận, giai đoạn nào cần thận trọng — để người xem chủ động chuẩn bị, không phải một bản án định sẵn không thể thay đổi.",
      { heading: "Muốn tìm hiểu sâu hơn, bắt đầu từ đâu?" },
      "Nếu muốn tự học, có thể bắt đầu từ khóa Bát Tự nhập môn để nắm Can Chi, Ngũ Hành và cách lập lá số, sau đó lên trung cấp để luận vượng suy và cách cục Tài Quan, rồi chuyên sâu để luận Đại Vận, Lưu Niên. Nếu muốn được luận giải trực tiếp cho lá số của mình, dịch vụ Bát Tự tại Thiên Anh sẽ phù hợp hơn.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Bát tự", href: "/dich-vu/bat-tu" },
      { label: "Khóa Bát tự nhập môn", href: "/khoa-hoc/bat-tu-nhap-mon" },
      { label: "Khóa Bát tự chuyên sâu", href: "/khoa-hoc/bat-tu-chuyen-sau" },
    ],
  },
  {
    slug: "phong-thuy-nha-o-la-gi",
    title: "Phong thủy nhà ở là gì? Hướng dẫn đầy đủ cho người mới",
    excerpt: "Nguyên lý cốt lõi của phong thủy nhà ở, 3 vị trí quan trọng nhất và khi nào cần tìm chuyên gia.",
    category: "Nhà ở",
    categorySlug: "nha-o",
    publishedAt: "2026-08-03",
    image: "/images/services/phong-thuy-nha-o.jpg",
    content: [
      `Rất nhiều người nghĩ phong thủy nhà ở là việc "xem bói" cho ngôi nhà. Thực ra, đây là một hệ thống quan sát có logic: cách ánh sáng, gió và dòng người di chuyển trong nhà ảnh hưởng đến cảm giác sống, và qua đó ảnh hưởng đến sức khỏe, tinh thần, thậm chí cả hiệu suất công việc của gia chủ.`,
      "Cốt lõi của phong thủy nhà ở nằm ở việc đối chiếu hướng nhà, vị trí các không gian trọng yếu (cửa chính, bếp, phòng ngủ) với mệnh quái của gia chủ — dựa theo hai trường phái phổ biến nhất là Bát Trạch (Đông Tứ Trạch - Tây Tứ Trạch) và Huyền Không Phi Tinh (luận theo vận khí 20 năm).",
      { heading: "3 vị trí quan trọng nhất trong nhà" },
      {
        list: [
          "Cửa chính — nơi đón khí vào nhà, ảnh hưởng trực tiếp đến vượng khí tổng thể.",
          "Bếp — đại diện cho sức khỏe và tài lộc gia đình, cần tránh đối diện trực tiếp cửa chính hoặc nhà vệ sinh.",
          "Phòng ngủ chủ — ảnh hưởng đến sức khỏe, hôn nhân, cần tránh xà ngang, gương đối diện giường.",
        ],
      },
      { heading: "Nhà hướng xấu có phải xây lại không?" },
      "Đây là câu hỏi phổ biến nhất — và câu trả lời thường là không. Phần lớn các vấn đề phong thủy nhà ở có thể hóa giải bằng cách điều chỉnh nội thất, màu sắc, cách bố trí, mà không cần thay đổi kết cấu.",
      { heading: "Khi nào nên tìm chuyên gia tư vấn?" },
      "Nếu chỉ cần định hướng cơ bản, có thể tự tìm hiểu qua các khóa học Bát Trạch. Nhưng với nhà chuẩn bị mua, xây mới, hoặc đang gặp vấn đề chưa rõ nguyên nhân, nên có chuyên gia khảo sát trực tiếp để đưa ra kết luận chính xác.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy nhà ở", href: "/dich-vu/phong-thuy-nha-o" },
      { label: "Dịch vụ Phong thủy nhà chuyên sâu", href: "/dich-vu/phong-thuy-nha-chuyen-sau" },
      { label: "Khóa Bát trạch nhập môn", href: "/khoa-hoc/bat-trach-nhap-mon" },
    ],
  },
  {
    slug: "huyen-khong-phi-tinh-la-gi",
    title: "Huyền Không Phi Tinh là gì?",
    excerpt: "Nguyên lý Tam Nguyên Cửu Vận, Vượng Sơn Vượng Hướng và lộ trình học Huyền Không Phi Tinh.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
    publishedAt: "2026-08-03",
    image: "/images/courses/categories/huyen-khong-phi-tinh.png",
    content: [
      "Nếu Bát Trạch chỉ xét hướng nhà một cách cố định, Huyền Không Phi Tinh lại nhìn phong thủy như một dòng chảy thay đổi theo thời gian — đây là lý do vì sao có những ngôi nhà từng vượng phát nhưng sau một giai đoạn lại sa sút, dù không hề thay đổi kết cấu.",
      "Huyền Không Phi Tinh dựa trên hệ thống Tam Nguyên Cửu Vận — chia thời gian thành 9 vận, mỗi vận 20 năm. Bằng cách lập tinh bàn (bản đồ 9 cung) theo Sơn, Hướng và Vận xây dựng của ngôi nhà, chuyên gia xác định được sao nào đang vượng, sao nào đang suy tại từng vị trí trong nhà.",
      { heading: "Vượng Sơn Vượng Hướng là gì?" },
      "Đây là cách cục tốt nhất trong Huyền Không — khi sao vượng khí rơi đúng vào cả Sơn (sau nhà) và Hướng (trước nhà), giúp nhà vừa vượng nhân đinh vừa vượng tài lộc. Ngược lại là Thượng Sơn Hạ Thủy — cách cục cần lưu ý và thường phải hóa giải.",
      { heading: "Vì sao cùng một nhà, luận Bát Trạch và Huyền Không có thể khác nhau?" },
      "Vì hai hệ thống dựa trên nguyên lý khác nhau — Bát Trạch cố định theo hướng và mệnh quái, Huyền Không biến đổi theo thời gian xây dựng. Trong thực tế, chuyên gia có kinh nghiệm thường đối chiếu cả hai để đưa ra kết luận toàn diện hơn, thay vì chỉ dựa vào một trường phái.",
      { heading: "Lộ trình học Huyền Không Phi Tinh" },
      "Người mới nên bắt đầu từ khóa nhập môn để hiểu Tam Nguyên Cửu Vận và cách lập tinh bàn cơ bản, sau đó trung cấp để luận Vượng Sơn Vượng Hướng, và cao cấp để ứng dụng các kỹ thuật hóa giải nâng cao như Thất Tinh Đả Kiếp.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy nhà chuyên sâu", href: "/dich-vu/phong-thuy-nha-chuyen-sau" },
      { label: "Khóa Huyền không phi tinh nhập môn", href: "/khoa-hoc/huyen-khong-phi-tinh-nhap-mon" },
      { label: "Khóa Huyền không phi tinh cao cấp", href: "/khoa-hoc/huyen-khong-phi-tinh-cao-cap" },
    ],
  },
  {
    slug: "cach-xem-ngay-tot-xau",
    title: "Cách xem ngày tốt xấu chuẩn phong thủy",
    excerpt: "Quy trình trạch nhật theo Chính Ngũ Hành, vì sao cùng một ngày người này tốt người kia lại xấu.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
    publishedAt: "2026-08-03",
    image: "/images/courses/categories/trach-nhat.png",
    content: [
      `Không phải ngẫu nhiên mà ông bà ta luôn dặn "có thờ có thiêng, có kiêng có lành" trước mỗi việc lớn. Nhưng xem ngày đúng cách không đơn giản là mở lịch vạn niên và tìm dòng chữ "ngày tốt" — đó chỉ là bước đầu tiên trong một quy trình nhiều lớp hơn.`,
      "Xem ngày (trạch nhật) truyền thống dựa trên Chính Ngũ Hành — xét Can Chi của ngày, đối chiếu với 12 Trực Thần (Kiến, Trừ, Mãn, Bình...), lọc các ngày phạm Tam Tai, Không Vong, Nguyệt Kỵ. Đây là lớp lọc chung cho tất cả mọi người.",
      { heading: "Vì sao cùng một ngày, người này tốt người kia lại xấu?" },
      "Vì bước quan trọng nhất thường bị bỏ qua: đối chiếu ngày đã lọc với mệnh cục (Bát Tự) của người chủ sự. Một ngày được xem là hoàng đạo chung nhưng có thể xung khắc với Nhật Chủ của một người cụ thể — đây là lý do vì sao xem ngày qua lịch vạn niên thông thường chỉ mang tính tham khảo.",
      { heading: "Kỳ Môn Độn Giáp — một cách tiếp cận khác" },
      "Bên cạnh Chính Ngũ Hành, Kỳ Môn Độn Giáp là một hệ thống chọn ngày giờ và phương vị khác, dựa trên lá bàn Cửu Cung - Bát Môn - Cửu Tinh biến đổi theo từng giờ. Kỳ Môn thường được ưu tiên khi cần chọn thời điểm cho những việc đòi hỏi độ chính xác cao như ký kết hợp đồng, xuất hành quan trọng.",
      { heading: "Khi nào cần xem ngày cẩn thận?" },
      {
        list: [
          "Cưới hỏi, đính hôn",
          "Động thổ, nhập trạch, khai trương",
          "Ký kết hợp đồng lớn",
          "Xuất hành, khởi công dự án quan trọng",
        ],
      },
    ],
    relatedLinks: [
      { label: "Dịch vụ Xem ngày cao cấp", href: "/dich-vu/xem-ngay-cao-cap" },
      { label: "Khóa Trạch nhật cơ bản", href: "/khoa-hoc/trach-nhat-co-ban" },
      { label: "Khóa Kỳ môn nhập môn", href: "/khoa-hoc/ky-mon-nhap-mon" },
    ],
  },
  {
    slug: "phong-thuy-can-ho-chung-cu",
    title: "Phong thủy căn hộ chung cư: khác gì so với nhà đất?",
    excerpt: "Những giới hạn riêng của căn hộ chung cư và cách hóa giải khi không thể chọn hướng đất hay sửa kết cấu.",
    category: "Nhà ở",
    categorySlug: "nha-o",
    publishedAt: "2026-08-04",
    image: "/images/services/phong-thuy-nha-o.jpg",
    content: [
      `Với nhà đất, gia chủ có thể chọn miếng đất, chọn hướng ngay từ đầu. Căn hộ chung cư thì khác — bạn mua một khối không gian đã định hình sẵn trong một tòa nhà lớn, nên phần lớn câu hỏi phong thủy chung cư đều xoay quanh: "hướng nhà đã cố định rồi, giờ làm sao?"`,
      { heading: "Luận hướng theo cửa chính căn hộ, không phải hướng tòa nhà" },
      "Khác với nhà đất luận theo hướng cửa chính ngôi nhà, căn hộ chung cư luận theo hướng cửa ra vào của chính căn hộ đó — vì đây mới là nơi khí thực sự đi vào không gian sống của gia đình. Hai căn hộ trong cùng một tòa, cùng một mặt, vẫn có thể luận khác nhau nếu bố cục cửa và các phòng bên trong khác nhau.",
      { heading: "Tầng và số căn hộ có ảnh hưởng không?" },
      "Quan niệm phổ biến là đối chiếu số tầng, số căn hộ với Ngũ Hành của gia chủ (theo quy luật Hà Đồ: số 1-6 thuộc Thủy, 2-7 thuộc Hỏa, 3-8 thuộc Mộc, 4-9 thuộc Kim, 5-0 thuộc Thổ). Đây là một yếu tố tham khảo thêm, không phải yếu tố quyết định — bố cục nội thất và hướng cửa vẫn đóng vai trò chính.",
      { heading: "Không sửa được kết cấu bê tông thì hóa giải bằng gì?" },
      {
        list: [
          "Ánh sáng và cây xanh: bù đắp cho những căn hộ thiếu sáng tự nhiên hoặc bí khí.",
          "Sắp xếp nội thất, hướng kê giường/bàn làm việc trong giới hạn phòng có sẵn.",
          "Vật phẩm hóa giải khi bếp đối diện cửa chính hoặc gần nhà vệ sinh — tình huống rất phổ biến ở căn hộ diện tích nhỏ.",
          "Rèm, vách ngăn nhẹ để điều chỉnh luồng khí mà không cần đập phá kết cấu chịu lực.",
        ],
      },
      "Vì không gian căn hộ thường nhỏ và khó thay đổi kết cấu, nên việc khảo sát kỹ bản vẽ hoặc hiện trạng thực tế trước khi đưa ra giải pháp càng quan trọng hơn so với nhà đất.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy nhà ở", href: "/dich-vu/phong-thuy-nha-o" },
      { label: "Khóa Bát trạch nhập môn", href: "/khoa-hoc/bat-trach-nhap-mon" },
      { label: "Phong thủy nhà ở là gì?", href: "/kien-thuc/nha-o/phong-thuy-nha-o-la-gi" },
    ],
  },
  {
    slug: "phong-thuy-shop-kinh-doanh",
    title: "Phong thủy shop, cửa hàng kinh doanh: 4 vị trí quyết định dòng tiền",
    excerpt: "Quầy thu ngân, hướng cửa, lối đi và thời điểm khai trương — những yếu tố ảnh hưởng trực tiếp đến việc buôn bán.",
    category: "Kinh doanh",
    categorySlug: "kinh-doanh",
    publishedAt: "2026-08-04",
    image: "/images/services/phong-thuy-van-phong.jpg",
    content: [
      "Khác với nhà ở — nơi ưu tiên sự an tĩnh, một cửa hàng kinh doanh cần khí động, cần dòng người ra vào để tạo ra doanh thu. Vì vậy phong thủy shop kinh doanh không chỉ xét hướng theo mệnh chủ cửa hàng, mà còn đối chiếu với lưu lượng người qua lại thực tế của mặt bằng.",
      { heading: "Vị trí quầy thu ngân — nơi giữ tài vị" },
      "Quầy thu ngân được xem là nơi giữ tài vị của cửa hàng, nên thường được đặt ở vị trí \"tọa cát hướng cát\": tránh đặt đối diện trực xung với cửa ra vào (tiền vào rồi trôi thẳng ra), và tránh để người ngồi thu ngân quay lưng ra cửa chính.",
      { heading: "Hướng cửa và lối đi" },
      {
        list: [
          "Cửa chính nên thông thoáng, tránh vật cản lớn ngay trước cửa làm nghẽn khí và tầm nhìn của khách.",
          "Lối đi trong cửa hàng nên có luồng di chuyển rõ ràng, tránh kệ hàng che khuất hoặc chắn ngang lối vào chính.",
          "Khu vực trưng bày sản phẩm chủ lực nên đặt ở nơi khách nhìn thấy ngay khi bước vào, thay vì khuất trong góc.",
        ],
      },
      { heading: "Chọn ngày khai trương" },
      "Ngày khai trương ảnh hưởng đến tâm lý khởi đầu và thường được xem theo Can Chi ngày kết hợp với mệnh cục người chủ — tương tự nguyên tắc trạch nhật áp dụng cho các sự kiện quan trọng khác.",
      "Với mặt bằng đi thuê, phần lớn giải pháp vẫn nằm ở cách bố trí nội thất, quầy kệ và ánh sáng — không cần can thiệp vào kết cấu mặt bằng.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy văn phòng", href: "/dich-vu/phong-thuy-van-phong" },
      { label: "Dịch vụ Xem ngày cao cấp", href: "/dich-vu/xem-ngay-cao-cap" },
      { label: "Cách xem ngày tốt xấu chuẩn phong thủy", href: "/kien-thuc/kien-thuc-ung-dung/cach-xem-ngay-tot-xau" },
    ],
  },
  {
    slug: "phong-thuy-van-phong-nho",
    title: "Phong thủy văn phòng nhỏ, startup: ưu tiên gì khi diện tích hạn chế?",
    excerpt: "Nguyên tắc bố trí khi không có phòng riêng cho lãnh đạo và không gian làm việc theo kiểu mở.",
    category: "Văn phòng",
    categorySlug: "van-phong",
    publishedAt: "2026-08-04",
    image: "/images/services/phong-thuy-van-phong.jpg",
    content: [
      "Nguyên tắc phong thủy văn phòng truyền thống thường giả định có phòng riêng cho lãnh đạo, có phòng họp, có lễ tân. Nhưng với văn phòng nhỏ hoặc startup vài chục mét vuông, không gian mở là bắt buộc — vấn đề là ưu tiên điều gì trước khi không thể có đủ mọi thứ.",
      { heading: "Ưu tiên số một: vị trí ngồi của người đứng đầu" },
      "Dù không có phòng riêng, vị trí bàn làm việc của người đứng đầu vẫn nên được ưu tiên bố trí trước — lý tưởng là lưng tựa vào vách tường (không tựa cửa sổ hoặc lối đi), tầm nhìn bao quát được cửa ra vào, tránh ngồi ngay dưới xà ngang hoặc đối diện trực tiếp cửa nhà vệ sinh.",
      { heading: "Không gian mở: giải pháp mềm thay vì tường ngăn" },
      {
        list: [
          "Dùng kệ sách, cây xanh hoặc vách ngăn thấp để tạo ranh giới khu vực thay vì tường xây cố định.",
          "Khu vực tiếp khách/họp nhanh nên tách biệt tương đối khỏi khu làm việc chính để tránh nhiễu khí và tiếng ồn.",
          "Bàn làm việc nhân viên tránh xếp thẳng hàng đối mặt trực tiếp với cửa chính.",
        ],
      },
      { heading: "Ánh sáng và cây xanh — giải pháp chi phí thấp, hiệu quả cao" },
      "Với văn phòng nhỏ khó thay đổi kết cấu, ánh sáng tự nhiên và cây xanh là hai yếu tố dễ điều chỉnh nhất để cải thiện sinh khí tổng thể mà không cần thi công lớn.",
      "Điều quan trọng là không cố áp nguyên xi các nguyên tắc dành cho văn phòng lớn vào không gian nhỏ — cần chọn lọc 2-3 điểm có tác động lớn nhất thay vì cố gắng thỏa mãn mọi tiêu chí cùng lúc.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy văn phòng", href: "/dich-vu/phong-thuy-van-phong" },
      { label: "Khóa Bát trạch nhập môn", href: "/khoa-hoc/bat-trach-nhap-mon" },
    ],
  },
];

export const portfolio = [
  {
    slug: "biet-thu-vinhomes-riverside",
    title: "Biệt thự Vinhomes Riverside",
    location: "Hà Nội",
    image: "/images/portfolio/biet-thu-vinhomes-riverside.jpg",
  },
  {
    slug: "van-phong-lanh-dao-agribank",
    title: "Phòng làm việc lãnh đạo Agribank",
    location: "Hà Nội",
    image: "/images/portfolio/van-phong-agribank.jpg",
  },
  {
    slug: "showroom-oto-hai-phong",
    title: "Showroom ô tô",
    location: "Hải Phòng",
    image: "/images/portfolio/showroom-oto-hai-phong.jpg",
  },
];
