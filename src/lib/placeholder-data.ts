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
    priceFrom: "Liên hệ",
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
    priceFrom: "Liên hệ",
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
    priceFrom: "Liên hệ",
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
    priceFrom: "Liên hệ",
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
    priceFrom: "Liên hệ",
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
    priceFrom: "Liên hệ",
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
    priceFrom: "Liên hệ",
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
    priceFrom: "Liên hệ",
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
    priceFrom: "Liên hệ",
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
    noiDungChiTiet: [
      {
        doanVan: [
          "Với mong muốn đem lại sự cát lành tốt nhất cho nhiều người, và nhận thấy sự chưa đầy đủ của các loại bát quái trên thị trường,",
          "sau một thời gian dài nghiên cứu tâm huyết và kế thừa, tôi xin giới thiệu đến mọi người đứa con tinh thần — sản phẩm “Bát Quái Ma Phương”.",
        ],
      },
      {
        tieuDe: "Nếu bạn đang sống trong căn nhà “lệch mệnh”?",
        doanVan: [
          "Hướng nhà xấu – Sát khí mạnh – Mệnh trạch không hòa hợp… chính là nguyên nhân khiến tài vận đình trệ, sức khỏe sa sút, gia đạo bất an.",
        ],
        gachDau: [
          "Nhà ở hướng Tuyệt Mệnh, Ngũ Quỷ, Họa Hại, Lục Sát… nhưng không đổi được vì là nhà mua hoặc nhà tổ tiên để lại.",
          "Là người Đông Tứ Mệnh nhưng lại ở trong nhà Tây Tứ Trạch (hoặc ngược lại) — dẫn đến mệnh trạch tương khắc, ảnh hưởng sức khỏe và tài lộc.",
          "Nhà rơi vào các thế sát như Bát Sát, Hoàng Tuyền, Không Vong.",
        ],
        luuY: "Bạn có thể không để ý, nhưng những yếu tố này đang bào mòn dần vận khí của bạn mỗi ngày.",
      },
      {
        tieuDe: "Vì sao bát quái ngoài thị trường thường không hiệu quả?",
        gachDau: [
          "Bạn đã từng đặt bát quái ngoài thị trường, gương cầu lồi, gương lõm… nhưng tình hình không mấy cải thiện.",
          "Phần lớn sản phẩm ngoài thị trường là bát quái hóa sát “đại trà”, không được cá nhân hóa theo mệnh và trạch của gia chủ.",
          "Sai vật – Sai cách – Sai thời điểm = Không hiệu quả.",
          "Dùng sai loại bát quái còn dễ phản tác dụng, khiến sát khí bị kích hoạt ngược.",
        ],
      },
      {
        tieuDe: "“Bát Quái Ma Phương” — hóa sát phong thủy cá nhân hóa chuyên sâu cho từng gia chủ",
        gachDau: [
          "Cá nhân hóa hoàn toàn theo năm sinh, mệnh quái và hướng nhà cụ thể.",
          "Khai quang – gia trì đầy đủ để kích hoạt năng lượng phong thủy thực sự (năng lượng lên xấp xỉ 200.000 Bovis).",
          "Chọn ngày giờ an vị tốt nhất để hòa hợp Thiên – Địa – Nhân.",
          "Kết hợp nhiều yếu tố năng lượng mạnh, tạo thành trường khí bảo hộ – hóa sát – hút tài đắc khí.",
        ],
        luuY: "Đây không chỉ là “vật trấn” mà là lá chắn phong thủy sống động, giúp gia chủ chuyển hung thành cát – nghênh tài đón phúc – bảo hộ gia đạo vững bền.",
      },
      {
        cta: "Số lượng giới hạn — chỉ chế tác theo đơn đặt trước.",
      },
    ],
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
  // ─── Danh mục "Tư vấn thực địa" ────────────────────────────────────────────────────────────────
  // Nhật ký khảo sát/hành nghề thật, chuyển từ trang Facebook cá nhân của Zhi Gong sang website theo
  // yêu cầu Công. Giữ NGUYÊN VĂN nội dung gốc (kể cả giọng hài hước và các đoạn Công tự giới hạn như
  // "xin phép không công bố danh tính", "phần hoá giải chi tiết không luận bàn trên không gian mạng"),
  // chỉ tách đoạn/đặt tiêu đề mục cho hợp định dạng bài web. Đặt lên đầu mảng để hiện trước ở trang
  // /kien-thuc và khối "Bài viết mới nhất" ngoài trang chủ.
  {
    slug: "quay-lai-lam-le-nhap-trach-cho-can-biet-thu-tung-khao-sat",
    title: "Quay lại làm lễ nhập trạch cho căn biệt thự từng khảo sát",
    excerpt:
      "Lần đầu đến, căn biệt thự còn cũ kỹ, khí bị ngưng trệ, vài vị trí phạm sát nặng. Vài tháng sau tôi quay lại — không còn là người khảo sát, mà là người làm lễ nhập trạch.",
    category: "Tư vấn thực địa",
    categorySlug: "tu-van-thuc-dia",
    publishedAt: "2026-06-27",
    image: "/images/blog/thuc-dia-nhap-trach-villa.jpg",
    content: [
      "Có những lần quay trở lại một ngôi nhà, cảm xúc hoàn toàn khác so với lần đầu tiên đặt chân đến…",
      "Ngày đầu gặp anh, căn nhà vẫn còn là một căn biệt thự cũ kỹ, từ trường hỗn loạn. Đi một vòng khảo sát, tôi thấy khá nhiều điểm phong thuỷ chưa ổn: khí bị ngưng trệ, một số vị trí phạm sát nặng, dòng năng lượng trong nhà chưa thể lưu thông.",
      "Khi đó, điều tôi làm không phải là “đặt vật phẩm”, mà là cùng gia chủ tìm ra cách để ngôi nhà thật sự trở thành nơi nuôi dưỡng tài lộc và hạnh phúc.",
      { heading: "Hôm nay, tôi quay lại…" },
      "Nhưng không còn với vai trò người khảo sát phong thuỷ nữa, mà là người thực hiện nghi lễ nhập trạch cho gia đình anh.",
      "Bước qua cánh cửa, tôi mỉm cười. Vẫn là căn nhà ấy, nhưng dường như đã mang một linh hồn khác. Ánh sáng chan hòa hơn. Không gian thông thoáng hơn. Khí trường lưu chuyển nhẹ nhàng, dễ chịu. Mọi thứ đều toát lên cảm giác của một tổ ấm đúng nghĩa.",
      "Gia chủ có phần gầy đi sau nhiều tháng tất bật sửa chữa. Gương mặt còn vương chút mệt mỏi, nhưng đôi mắt lại sáng lên niềm vui, sự tự hào và hạnh phúc của một người vừa hoàn thành một cột mốc lớn trong cuộc đời. Đó là ánh mắt mà tiền bạc cũng không dễ gì mua được.",
      "Sau lúc làm lễ, tôi cũng tranh thủ điều chỉnh và hoá giải thêm một vài điểm phong thuỷ mà sau khi hoàn thiện ngôi nhà mới có thể nhìn rõ hơn. Với tôi, phong thuỷ không phải là làm một lần rồi thôi, mà là đồng hành cùng gia chủ trong từng giai đoạn của ngôi nhà.",
      { heading: "“Phong thuỷ có thật sự làm giàu được không?”" },
      "Nhiều người hỏi tôi câu đó. Tôi luôn trả lời: Phong thuỷ không thay bạn làm việc. Nhưng phong thuỷ giúp con người sống trong một không gian có sinh khí, thuận dòng năng lượng, để sức khỏe tốt hơn, tinh thần vững hơn, quyết định sáng suốt hơn và cơ hội cũng dễ đến hơn.",
      "Một ngôi nhà đẹp chưa chắc đã là một ngôi nhà có khí. Một ngôi nhà đắt tiền chưa chắc đã là một ngôi nhà giữ được phúc. Nhưng một ngôi nhà có sinh khí, có sự chăm chút và có những người luôn hướng về gia đình… thì sớm muộn cũng sẽ trở thành nơi giữ được tài, giữ được lộc và giữ được hạnh phúc.",
      "Chúc anh và gia đình khởi đầu một chặng đường mới thật bình an. Mong rằng từ hôm nay, ngôi nhà này sẽ không chỉ là nơi để trở về, mà còn là nơi tài lộc sinh sôi, con cháu hưng vượng và tiếng cười luôn đầy ắp trong từng gian phòng.",
      "Nhà có thể xây bằng tiền. Nhưng tổ ấm chỉ được dựng nên bằng tâm, bằng phúc và bằng khí.",
    ],
  },
  {
    slug: "phong-thuy-quan-lo-phong-lam-viec-lanh-dao",
    title: "Phong thuỷ quan lộ: khảo sát phòng làm việc của một lãnh đạo trẻ",
    excerpt:
      "Khí trường khá ổn, tài khí có, quyền khí cũng có — chỉ thiếu chút “vượng quan” để đường thăng tiến bớt gập ghềnh. Ghi chép một buổi khảo sát phong thuỷ công sở.",
    category: "Tư vấn thực địa",
    categorySlug: "tu-van-thuc-dia",
    publishedAt: "2026-06-01",
    image: "/images/blog/thuc-dia-phong-lam-viec-lanh-dao.jpg",
    content: [
      "Lại một buổi xem phong thuỷ quan lộ cho lãnh đạo trẻ của một ngân hàng lớn.",
      "Hôm nay có dịp khảo sát một phòng làm việc của lãnh đạo cấp trung tại một ngân hàng lớn. Bước vào phòng, cảm giác đầu tiên là: khí trường khá ổn, tài khí có, quyền khí cũng có, chỉ thiếu chút “vượng quan” để đường thăng tiến bớt gập ghềnh.",
      { heading: "Nhìn tổng thể" },
      {
        list: [
          "Phòng rộng, sáng, minh đường phía trước tương đối thoáng.",
          "Bàn làm việc đặt ở vị trí có khả năng quan sát toàn bộ không gian.",
          "Hai bên có cây xanh nâng khí, tạo thế “tả thanh long – hữu bạch hổ” tương đối cân bằng.",
          "Ghế lãnh đạo có điểm tựa phía sau khá chắc chắn, tượng cho quý nhân và hậu thuẫn.",
        ],
      },
      { heading: "Tuy nhiên… đừng nhìn hoa nở mà ngỡ xuân về" },
      "Phong thuỷ quan lộ không chỉ nhìn bàn ghế đẹp là đủ. Người ngồi vị trí này còn khá trẻ, năng lực có, trách nhiệm có, KPI cũng có, nhưng lại dễ gặp tình huống:",
      {
        list: [
          "Làm nhiều hơn người khác.",
          "Báo cáo nhiều hơn người khác.",
          "Họp nhiều hơn người khác.",
          "Và… bị hỏi “cái này em xử lý giúp anh nhé” nhiều hơn người khác.",
          "Thị phi.",
        ],
      },
      "Nói theo phong thuỷ gọi là: “Tài khí đến nhanh nhưng quan khí chưa tụ đủ.”",
      "Đặc biệt khi xem tướng khí của chủ nhân căn phòng (xin phép không công bố danh tính), tuy phần mái tóc có dấu hiệu “tái cơ cấu nhân sự” nhẹ ở khu vực đỉnh đầu, nhưng thần sắc vẫn tốt, giọng nói có lực, ánh mắt còn nhiệt huyết. Nói vui là: tóc có thể giảm, nhưng phong độ và hạn mức tín dụng với cấp dưới vẫn giữ nguyên.",
      { heading: "Một số điểm nên hoá giải để tăng quan lộ" },
      {
        list: [
          "Sau lưng ghế nên có thêm biểu tượng núi hoặc sơn thuỷ hữu tình mang tính nâng đỡ.",
          "Tránh để hồ sơ tồn đọng chất thành núi phía trước bàn.",
          "Khu vực bên phải bàn làm việc nên duy trì gọn gàng để hạn chế thị phi nội bộ.",
          "Cây xanh nên chăm tốt, tránh cây héo. Trong phong thuỷ công sở, cây héo thường tượng trưng cho các dự án “đang xin ý kiến thêm”.",
        ],
      },
      "Phần hoá giải chi tiết tôi không luận bàn trên không gian mạng.",
      { heading: "Kết luận" },
      "Phòng làm việc này đạt điểm khá về phong thuỷ công sở theo mắt nhìn. Nếu chủ nhân tiếp tục giữ được:",
      {
        list: [
          "Tâm thái ổn định,",
          "Quan hệ đồng nghiệp hài hoà,",
          "Bớt thức khuya duyệt báo cáo,",
          "Và đặc biệt là không tự tạo thị phi không đáng có,",
        ],
      },
      "thì đường quan lộ vẫn có cơ hội mở rộng.",
      "Còn chuyện mái tóc… Phong thuỷ giúp tăng quý nhân, tăng tài vận, tăng chức vụ. Riêng tóc tai thì hiện tại vẫn chưa có sao nào trong Huyền Không Phi Tinh phụ trách.",
    ],
  },
  {
    slug: "toi-uu-va-kich-hoat-thay-vi-thay-doi",
    title: "Tối ưu và kích hoạt, thay vì thay đổi",
    excerpt:
      "Với người đã có nền tảng phong thuỷ tốt sẵn, công việc của tôi không phải là thay đổi, mà là tinh chỉnh những yếu tố vô hình để phục vụ những mục tiêu hữu hình.",
    category: "Tư vấn thực địa",
    categorySlug: "tu-van-thuc-dia",
    publishedAt: "2026-03-31",
    image: "/images/blog/thuc-dia-van-phong-cap-cao.jpg",
    content: [
      "Một cuộc gặp gỡ không dành cho số đông.",
      "Hôm nay, tôi có dịp đồng hành cùng một lãnh đạo cấp cao trong lĩnh vực ngân hàng – một người không chỉ thành công trong sự nghiệp mà còn có sự am hiểu nhất định về huyền học.",
      "Với những người ở vị trí như vậy, phong thuỷ không còn là câu chuyện “bày trí”, mà là bài toán về tối ưu năng lượng cá nhân và định vị lại vận trình ở tầm cao hơn.",
      { heading: "Buổi làm việc không đơn thuần là tư vấn" },
      "Đó là một cuộc trao đổi sâu sắc:",
      {
        list: [
          "Nhìn lại cấu trúc bản mệnh dưới góc nhìn thực tế và ứng dụng.",
          "Xác định những điểm đang tạo lợi thế nhưng chưa được khai thác hết.",
          "Và tinh chỉnh những yếu tố nhỏ – nhưng có khả năng tạo ra khác biệt lớn trong dài hạn.",
        ],
      },
      "Điều đáng giá nhất là: anh đã sở hữu một nền tảng phong thuỷ tương đối tốt. Một vài chi tiết tưởng như ngẫu nhiên, nhưng thực chất lại “đặt đúng chỗ” theo tự nhiên.",
      "Công việc của tôi khi đó không phải là thay đổi, mà là tối ưu và kích hoạt – để những gì vốn đã đúng, trở nên hiệu quả hơn, rõ ràng hơn và bền vững hơn.",
      { heading: "Phong thuỷ cho tầng lớp tinh hoa" },
      "Với tôi, phong thuỷ dành cho tầng lớp tinh hoa không phải là sự phô bày vật phẩm, mà là khả năng tinh chỉnh những yếu tố vô hình để phục vụ những mục tiêu hữu hình.",
      "Và khi mọi thứ được đặt đúng vị trí, thành công không còn là may mắn – mà là một trạng thái có thể chủ động kiến tạo.",
    ],
  },
  {
    slug: "phong-thuy-nam-2026",
    title: "Luận đoán phong thủy năm 2026: Những điều cần lưu ý",
    excerpt: "Tổng quan vận khí năm mới và những lưu ý quan trọng cho từng mệnh cung.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
    publishedAt: "2026-08-01",
    image: "/images/blog/phong-thuy-nam-2026.svg",
    content: [
      "Mỗi dịp đầu năm, câu hỏi được hỏi nhiều nhất không phải là \"nhà tôi có phong thủy tốt không\" mà là \"năm nay nhà tôi cần lưu ý gì\". Đây là câu hỏi đúng trọng tâm — vì phong thủy không phải một bản đánh giá cố định một lần rồi thôi, mà có những lớp thông tin thay đổi theo từng năm, cần được rà soát lại định kỳ.",
      { heading: "Vì sao phải xem lại phong thủy theo từng năm?" },
      "Trong phong thủy, có những yếu tố cố định gắn liền với kết cấu ngôi nhà — như hướng nhà, vị trí cửa chính, mệnh quái của gia chủ — gần như không đổi theo thời gian. Nhưng bên cạnh đó còn một lớp thông tin luôn vận động: vận khí theo năm, hay còn gọi là Lưu Niên. Đây là lý do một ngôi nhà từng thuận lợi có thể bước vào giai đoạn cần điều chỉnh, dù không hề thay đổi kết cấu.",
      { heading: "3 lớp thông tin cần đối chiếu khi luận vận khí năm mới" },
      {
        list: [
          "Bát Trạch — hướng nhà và mệnh quái gia chủ, cố định, không đổi theo năm.",
          "Huyền Không Phi Tinh — vận khí theo Tam Nguyên Cửu Vận (chu kỳ 20 năm), biến động thêm theo Lưu Niên từng năm.",
          "Bát Tự cá nhân — Đại Vận 10 năm và Lưu Niên riêng của từng thành viên trong gia đình, không giống nhau dù sống chung một nhà.",
        ],
      },
      { heading: "Vì sao cùng một ngôi nhà, mỗi năm lại cần nhìn nhận khác nhau?" },
      "Nhiều người thắc mắc: nhà không sửa gì, sao phong thủy lại có lúc thuận lúc cần lưu ý? Câu trả lời nằm ở việc vận khí Lưu Niên thay đổi theo từng năm, có thể làm một khu vực trong nhà từ vượng chuyển sang suy, hoặc ngược lại. Đây cũng là lý do các gia đình thường được khuyên rà soát lại bố cục vào mỗi dịp đầu năm, thay vì chỉ xem một lần duy nhất khi mới chuyển vào.",
      { heading: "Những khu vực nên rà soát vào đầu năm" },
      {
        list: [
          "Cửa chính — nơi tiếp nhận khí vào nhà, nên kiểm tra vật cản hoặc thay đổi xung quanh nhà trong năm qua.",
          "Khu vực bếp — ảnh hưởng sức khỏe và tài lộc, dễ bị tác động bởi Lưu Niên.",
          "Phòng ngủ của từng thành viên — nên đối chiếu riêng theo Bát Tự từng người, đặc biệt nếu năm tới có biến động lớn (đổi việc, sức khỏe, thi cử).",
          "Vị trí tài vị trong phòng khách — nên giữ gọn gàng, đủ sáng, tránh để trống hoặc bừa bộn.",
        ],
      },
      { heading: "Điều chỉnh đầu năm không cần đại tu" },
      "Phần lớn các điều chỉnh theo vận khí năm mới không đòi hỏi sửa chữa lớn. Thông thường chỉ cần thay đổi cách bài trí nội thất, dọn dẹp và làm thông thoáng các khu vực bị vướng, hoặc bổ sung một vài vật phẩm hóa giải/kích hoạt phù hợp. Việc đại tu toàn bộ nhà mỗi năm không chỉ tốn kém mà thường cũng không cần thiết.",
      { heading: "Phong thủy năm mới có thay đổi được vận mệnh không?" },
      "Cần nhìn nhận đúng vai trò của phong thủy: đây không phải công cụ thay đổi số mệnh, mà là cách tạo ra một môi trường sống hài hòa hơn với vận khí của thời điểm hiện tại, giúp con người đón nhận thuận lợi tốt hơn và giảm bớt những trở ngại không cần thiết. Kết hợp cùng nỗ lực thực tế trong công việc và cuộc sống, đây là một lớp hỗ trợ có giá trị chứ không phải phép màu.",
      "Nếu cần luận giải cụ thể cho ngôi nhà và từng thành viên trong gia đình, Phong Thủy Thiên Anh có thể hỗ trợ khảo sát và đưa ra phương án điều chỉnh phù hợp với thực tế ngôi nhà của bạn.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy nhà ở", href: "/dich-vu/phong-thuy-nha-o" },
      { label: "Huyền Không Phi Tinh là gì?", href: "/kien-thuc/kien-thuc-ung-dung/huyen-khong-phi-tinh-la-gi" },
      { label: "Tra cứu thuật ngữ phong thủy", href: "/kien-thuc/thuat-ngu-phong-thuy" },
    ],
  },
  {
    slug: "cach-bai-tri-ban-tho",
    title: "Cách bài trí bàn thờ gia tiên hợp phong thủy",
    excerpt: "Hướng dẫn chi tiết vị trí, hướng đặt và các vật phẩm cần thiết trên bàn thờ.",
    category: "Nhà ở",
    categorySlug: "nha-o",
    publishedAt: "2026-08-02",
    image: "/images/blog/cach-bai-tri-ban-tho.svg",
    content: [
      "Ban thờ đẹp không bằng ban thờ đúng. Ban thờ gia tiên là nơi kết nối giữa con cháu với cội nguồn, vì vậy việc bài trí cần đảm bảo sự trang nghiêm, sạch sẽ và đúng nguyên tắc — không chỉ là chuyện thẩm mỹ.",
      { heading: "Vị trí đặt bàn thờ hợp phong thủy" },
      {
        list: [
          "Đặt tại vị trí trang trọng, yên tĩnh — thường là phòng khách hoặc phòng thờ riêng, tránh gần lối đi lại ồn ào.",
          "Lưng bàn thờ nên tựa vào tường vững chắc, tránh tựa vào cửa sổ, khoảng trống hoặc mặt sau là nhà vệ sinh.",
          "Không đặt dưới xà ngang, dưới cầu thang hoặc sát cạnh phòng ngủ, nhà vệ sinh.",
          "Hướng bàn thờ nên đối chiếu với mệnh gia chủ hoặc hướng nhà để chọn phương vị phù hợp nhất.",
        ],
      },
      { heading: "Thứ tự bài trí trên bàn thờ" },
      {
        list: [
          "Bát hương đặt ở vị trí trung tâm, giữ cố định, hạn chế xê dịch tùy tiện.",
          "Đèn hoặc nến đặt hai bên, tượng trưng cho nhật nguyệt — thường thắp sáng vào các dịp cúng lễ.",
          "Bình hoa và đĩa quả đặt hai bên theo nguyên tắc \"Đông bình Tây quả\" (bình hoa bên trái, đĩa quả bên phải khi nhìn từ ngoài vào), tùy theo tập quán từng vùng miền có thể linh hoạt.",
          "Chén nước sạch hoặc kỷ nước đặt phía trước, thường xuyên được thay mới.",
        ],
      },
      { heading: "Những điều kiêng kỵ thường gặp" },
      {
        list: [
          "Không đặt bàn thờ đối diện trực tiếp cửa chính hoặc cửa nhà vệ sinh.",
          "Tránh đặt gương soi chiếu thẳng vào bàn thờ.",
          "Không dùng hoa quả giả hoặc để hoa, quả héo úa lâu ngày trên bàn thờ.",
          "Hạn chế đặt các vật dụng không liên quan (điều khiển, đồ điện tử, đồ trang trí cá nhân) lên hoặc gần khu vực bàn thờ.",
        ],
      },
      { heading: "Cách chăm sóc bàn thờ đúng cách" },
      "Bàn thờ cần được lau dọn thường xuyên nhưng theo đúng trình tự: thường lau bát hương và các vật phẩm chính trước, sau đó mới đến các vật dụng khác. Khi lau dọn thông thường, nên hạn chế xê dịch bát hương; việc rút chân nhang, bao sái bát hương thường chỉ thực hiện vào dịp cuối năm theo phong tục.",
      { heading: "Bàn thờ Thần Tài - Thổ Địa có khác bàn thờ gia tiên không?" },
      "Nhiều gia đình kinh doanh có thêm bàn thờ Thần Tài - Thổ Địa, thường đặt ở vị trí thấp, sát mặt đất, gần cửa ra vào để \"đón\" tài lộc từ ngoài vào — khác hẳn nguyên tắc của bàn thờ gia tiên vốn cần đặt ở vị trí cao, trang trọng. Hai loại bàn thờ này nên tách biệt về vị trí và cách bài trí, không nên đặt gần sát nhau hoặc dùng chung một khu vực thờ cúng.",
      { heading: "Chọn kích thước và chất liệu bàn thờ" },
      "Kích thước bàn thờ thường được đo theo thước Lỗ Ban để rơi vào các cung số đẹp, phù hợp với diện tích phòng thờ hoặc khoảng không gian đặt bàn thờ trong phòng khách. Về chất liệu, gỗ tự nhiên (gỗ mít, gỗ hương, gỗ gụ...) vẫn được ưa chuộng hơn cả vì độ bền và ý nghĩa trang nghiêm truyền thống, phù hợp hơn vật liệu công nghiệp cho không gian thờ cúng.",
      "Điều quan trọng nhất vẫn là lòng thành kính. Khi tâm an, gia đạo sẽ thêm hòa thuận và phúc khí cũng theo đó mà bền vững — bố trí đúng phong thủy chỉ là điều kiện hỗ trợ, không thay thế được sự chăm sóc và lòng thành của con cháu.",
      "Cần tư vấn bố trí bàn thờ theo đúng phong thủy và phù hợp với ngôi nhà cụ thể, hãy liên hệ Phong Thủy Thiên Anh.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy nhà ở", href: "/dich-vu/phong-thuy-nha-o" },
      { label: "Dịch vụ Cúng động thổ, nhập trạch, lập bàn thần tài", href: "/dich-vu/cung-dong-tho-nhap-trach-lap-ban-than-tai" },
      { label: "Tra cứu thuật ngữ phong thủy", href: "/kien-thuc/thuat-ngu-phong-thuy" },
    ],
  },
  {
    slug: "chon-huong-nha-hop-menh",
    title: "Bí quyết chọn hướng nhà hợp mệnh gia chủ",
    excerpt: "Phân tích Đông Tứ Trạch – Tây Tứ Trạch và cách áp dụng thực tế.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
    publishedAt: "2026-08-02",
    image: "/images/blog/chon-huong-nha-hop-menh.svg",
    content: [
      "Nhiều người cho rằng chỉ cần chọn hướng nhà hợp tuổi là mọi việc sẽ hanh thông. Thực tế, hướng nhà chỉ là một trong nhiều yếu tố quyết định phong thủy của một ngôi nhà, và bản thân việc \"hợp tuổi\" cũng cần được hiểu đúng cách thay vì tra cứu qua loa.",
      { heading: "Mệnh quái — điểm khởi đầu để xác định hướng hợp" },
      "Trước khi nói đến hướng nhà, cần xác định mệnh quái (quái số) của gia chủ — một con số từ 1 đến 9 tính theo năm sinh và giới tính, chia thành hai nhóm: Đông Tứ Mệnh (quái số 1, 3, 4, 9) và Tây Tứ Mệnh (quái số 2, 6, 7, 8). Người thuộc nhóm nào thì các hướng tốt cũng nằm trong nhóm phương vị tương ứng của nhóm đó.",
      "Đây là bước tính toán có công thức rõ ràng nhưng dễ nhầm lẫn nếu tự tra cứu thủ công, đặc biệt với người sinh trước và sau năm 2000 (công thức tính có sự khác biệt). Bạn có thể dùng công cụ tra cứu mệnh theo năm sinh của Thiên Anh để có điểm khởi đầu, sau đó đối chiếu thêm với hướng nhà thực tế.",
      { heading: "Vì sao chỉ chọn hướng theo tuổi là chưa đủ?" },
      "Để lựa chọn hướng nhà phù hợp, cần xem xét đồng thời mệnh quái của gia chủ, thế đất, môi trường xung quanh, hướng nắng, hướng gió và vận khí của từng thời kỳ (theo Huyền Không Phi Tinh). Một ngôi nhà có hướng đẹp nhưng bố cục sai hoặc phạm các yếu tố bất lợi vẫn có thể ảnh hưởng đến tài lộc, sức khỏe và sự ổn định của gia đình.",
      "Khi chọn đúng hướng nhà, bạn sẽ có cơ hội:",
      {
        list: [
          "Đón nhận sinh khí, giúp tài lộc lưu thông tốt hơn.",
          "Gia tăng sự ổn định trong công việc và sự nghiệp.",
          "Cải thiện sức khỏe, tinh thần và chất lượng cuộc sống.",
          "Góp phần xây dựng gia đạo hòa thuận, bền vững.",
        ],
      },
      { heading: "Nhà có nhiều thành viên, mệnh khác nhau thì tính theo ai?" },
      "Đây là tình huống rất phổ biến — vợ chồng thường không cùng nhóm Đông/Tây tứ mệnh. Trong thực tế, hướng nhà và hướng cửa chính thường ưu tiên theo mệnh của trụ cột chính (người đứng tên nhà hoặc người có ảnh hưởng lớn nhất đến kinh tế gia đình), sau đó điều chỉnh hướng giường, hướng bàn làm việc riêng cho từng thành viên còn lại theo mệnh của họ.",
      { heading: "Một vài lưu ý quan trọng" },
      {
        list: [
          "Không nên chỉ chọn hướng theo tuổi mà bỏ qua điều kiện thực tế của khu đất (thế đất, đường sá, công trình xung quanh).",
          "Cần kết hợp hướng cửa chính, vị trí bếp, phòng ngủ và các không gian quan trọng để tạo nên một tổng thể hài hòa, không chỉ xét một yếu tố đơn lẻ.",
          "Với nhà đã xây, nếu hướng chưa phù hợp vẫn có thể áp dụng các giải pháp phong thủy để điều hòa và giảm bớt ảnh hưởng bất lợi, không nhất thiết phải đập đi xây lại.",
        ],
      },
      "Phong thủy không phải là thay đổi vận mệnh bằng phép màu, mà là tạo dựng một môi trường sống hài hòa giữa con người và thiên nhiên, từ đó giúp mỗi thành viên trong gia đình có thêm điều kiện để phát triển và đón nhận những cơ hội tốt đẹp.",
      "Phong Thủy Thiên Anh luôn sẵn sàng đồng hành cùng bạn trong việc lựa chọn hướng nhà, phân tích phong thủy tổng thể và đưa ra giải pháp phù hợp với từng ngôi nhà và từng gia chủ.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy nhà ở", href: "/dich-vu/phong-thuy-nha-o" },
      { label: "Công cụ: Tra cứu mệnh theo năm sinh", href: "/tra-cuu-menh" },
      { label: "Tra cứu thuật ngữ: Mệnh quái, Bát Trạch...", href: "/kien-thuc/thuat-ngu-phong-thuy" },
    ],
  },
  {
    slug: "bat-tu-la-gi",
    title: "Bát Tự là gì? Hướng dẫn tổng quan cho người mới bắt đầu",
    excerpt: "Giải thích Bát Tự (Tứ Trụ) là gì, xem thế nào, khác gì với Tử Vi và Kinh Dịch.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
    publishedAt: "2026-08-03",
    image: "/images/blog/bat-tu-la-gi.svg",
    content: [
      `Nếu bạn từng nghe ai đó nói "lá số Bát Tự của tôi mệnh Kim, thân nhược", chắc hẳn bạn sẽ tò mò: Bát Tự thực chất là gì, và làm sao để "đọc" được một lá số như vậy?`,
      "Bát Tự — hay còn gọi là Tứ Trụ — là 8 chữ Can Chi được tạo thành từ 4 mốc thời gian: năm, tháng, ngày và giờ sinh. Mỗi mốc gồm một Thiên Can và một Địa Chi, ghép lại thành 4 trụ (Năm trụ, Tháng trụ, Ngày trụ, Giờ trụ) — tổng cộng 8 chữ, nên gọi là Bát Tự.",
      { heading: "Bát Tự cho biết điều gì?" },
      "Trong Bát Tự, Thiên Can của ngày sinh được gọi là Nhật Chủ — đại diện cho chính bản thân người xem. Chuyên gia luận vượng suy của Nhật Chủ so với 7 chữ còn lại, từ đó xác định Dụng Thần (yếu tố cần bổ sung để cân bằng) và luận giải các khía cạnh: sự nghiệp, tài lộc, hôn nhân, sức khỏe theo từng giai đoạn Đại Vận 10 năm.",
      { heading: "Đại Vận và Lưu Niên khác nhau thế nào?" },
      "Đại Vận là các chu kỳ 10 năm nối tiếp nhau trong đời người, được tính từ tháng sinh theo chiều thuận hoặc nghịch tùy vào giới tính và năm sinh Dương/Âm. Lưu Niên là vận riêng của từng năm cụ thể, luôn chồng lên Đại Vận đang chạy tại thời điểm đó. Khi luận một giai đoạn cụ thể trong đời, chuyên gia phải đối chiếu đồng thời cả ba lớp: lá số gốc, Đại Vận hiện tại và Lưu Niên của năm đó — chỉ nhìn một lớp riêng lẻ dễ dẫn đến kết luận sai lệch.",
      { heading: "Bát Tự khác gì với Tử Vi, Kinh Dịch?" },
      "Ba hệ thống này thường bị nhầm lẫn nhưng phục vụ mục đích khác nhau: Bát Tự phân tích qua Can Chi Ngũ Hành, thiên về luận vượng suy và Dụng Thần; Tử Vi an sao lên 12 cung để luận theo vị trí và bộ sao; Kinh Dịch, Kỳ Môn lại thường dùng để trả lời một câu hỏi cụ thể tại một thời điểm, hơn là luận cả đời người.",
      { heading: "Bát Tự có chính xác 100% không?" },
      "Không nên hiểu Bát Tự như một lời tiên tri tuyệt đối. Đây là công cụ chỉ ra xu hướng — Thân vượng hay nhược, giai đoạn nào thuận, giai đoạn nào cần thận trọng — để người xem chủ động chuẩn bị, không phải một bản án định sẵn không thể thay đổi.",
      { heading: "Bát Tự ứng dụng vào đâu trong đời sống thực tế?" },
      {
        list: [
          "Chọn thời điểm phù hợp cho các quyết định lớn: đổi việc, khởi nghiệp, kết hôn.",
          "Hiểu điểm mạnh, điểm yếu bản thân để định hướng nghề nghiệp phù hợp với Ngũ Hành Dụng Thần.",
          "Kết hợp với trạch nhật để chọn ngày giờ hợp với mệnh cục cá nhân, thay vì chỉ dựa vào ngày tốt chung cho mọi người.",
          "Hiểu tính cách, xu hướng phát triển của con cái để có định hướng giáo dục phù hợp hơn.",
        ],
      },
      { heading: "Muốn tìm hiểu sâu hơn, bắt đầu từ đâu?" },
      "Nếu muốn tự học, có thể bắt đầu từ khóa Bát Tự nhập môn để nắm Can Chi, Ngũ Hành và cách lập lá số, sau đó lên trung cấp để luận vượng suy và cách cục Tài Quan, rồi chuyên sâu để luận Đại Vận, Lưu Niên. Nếu muốn được luận giải trực tiếp cho lá số của mình, dịch vụ Bát Tự tại Thiên Anh sẽ phù hợp hơn.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Bát tự", href: "/dich-vu/bat-tu" },
      { label: "Khóa Bát tự nhập môn", href: "/khoa-hoc/bat-tu-nhap-mon" },
      { label: "Khóa Bát tự chuyên sâu", href: "/khoa-hoc/bat-tu-chuyen-sau" },
      { label: "Tra cứu thuật ngữ: Nhật Chủ, Dụng Thần, Đại Vận...", href: "/kien-thuc/thuat-ngu-phong-thuy" },
      { label: "Công cụ: Tra cứu mệnh theo năm sinh", href: "/tra-cuu-menh" },
    ],
  },
  {
    slug: "phong-thuy-nha-o-la-gi",
    title: "Phong thủy nhà ở là gì? Hướng dẫn đầy đủ cho người mới",
    excerpt: "Nguyên lý cốt lõi của phong thủy nhà ở, 3 vị trí quan trọng nhất và khi nào cần tìm chuyên gia.",
    category: "Nhà ở",
    categorySlug: "nha-o",
    publishedAt: "2026-08-03",
    image: "/images/blog/phong-thuy-nha-o-la-gi.svg",
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
      { heading: "Bát Trạch và Huyền Không: nên xem theo trường phái nào?" },
      "Đây không phải câu hỏi \"chọn một trong hai\" — hai trường phái bổ sung cho nhau. Bát Trạch cố định theo hướng nhà và mệnh quái gia chủ, phù hợp để xác định nhanh các phương vị tốt/xấu cho từng người. Huyền Không Phi Tinh biến đổi theo thời gian xây dựng và vận khí từng giai đoạn 20 năm, giúp giải thích vì sao một ngôi nhà từng vượng phát có thể bước vào giai đoạn cần điều chỉnh. Chuyên gia có kinh nghiệm thường đối chiếu cả hai để đưa ra kết luận toàn diện hơn.",
      { heading: "Những sai lầm phổ biến khi tự xem phong thủy nhà ở" },
      {
        list: [
          "Chỉ tra cứu hướng theo tuổi trên mạng mà bỏ qua bố cục thực tế bên trong nhà.",
          "Áp dụng nguyên tắc của người khác (đọc trên mạng, nghe truyền miệng) mà không đối chiếu với mệnh quái và hoàn cảnh cụ thể của gia đình mình.",
          "Chỉ nhìn vào một yếu tố đơn lẻ (ví dụ chỉ xét hướng cửa) mà bỏ qua tổng thể bếp, phòng ngủ, cầu thang.",
          "Cho rằng phong thủy tốt là phải sửa chữa lớn, trong khi phần lớn trường hợp chỉ cần điều chỉnh nội thất.",
        ],
      },
      { heading: "Nhà hướng xấu có phải xây lại không?" },
      "Đây là câu hỏi phổ biến nhất — và câu trả lời thường là không. Phần lớn các vấn đề phong thủy nhà ở có thể hóa giải bằng cách điều chỉnh nội thất, màu sắc, cách bố trí, mà không cần thay đổi kết cấu.",
      { heading: "Nguyên tắc có áp dụng như nhau cho mọi loại nhà không?" },
      "Nguyên lý cốt lõi thì giống nhau, nhưng cách áp dụng có khác biệt theo loại hình nhà ở. Căn hộ chung cư có những giới hạn riêng (không tự chọn được hướng đất, khó sửa kết cấu bê tông); nhà phố mặt tiền hẹp lại có vấn đề đặc thù về ánh sáng và luồng khí theo chiều dọc. Vì vậy một bản tư vấn phong thủy nhà ở tốt luôn cần khảo sát đúng loại hình nhà cụ thể, không áp dụng máy móc một công thức chung.",
      { heading: "Khi nào nên tìm chuyên gia tư vấn?" },
      "Nếu chỉ cần định hướng cơ bản, có thể tự tìm hiểu qua các khóa học Bát Trạch. Nhưng với nhà chuẩn bị mua, xây mới, hoặc đang gặp vấn đề chưa rõ nguyên nhân, nên có chuyên gia khảo sát trực tiếp để đưa ra kết luận chính xác.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy nhà ở", href: "/dich-vu/phong-thuy-nha-o" },
      { label: "Dịch vụ Phong thủy nhà chuyên sâu", href: "/dich-vu/phong-thuy-nha-chuyen-sau" },
      { label: "Khóa Bát trạch nhập môn", href: "/khoa-hoc/bat-trach-nhap-mon" },
      { label: "Tra cứu thuật ngữ: Mệnh quái, Bát Trạch, Huyền Không...", href: "/kien-thuc/thuat-ngu-phong-thuy" },
    ],
  },
  {
    slug: "huyen-khong-phi-tinh-la-gi",
    title: "Huyền Không Phi Tinh là gì?",
    excerpt: "Nguyên lý Tam Nguyên Cửu Vận, Vượng Sơn Vượng Hướng và lộ trình học Huyền Không Phi Tinh.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
    publishedAt: "2026-08-03",
    image: "/images/blog/huyen-khong-phi-tinh-la-gi.svg",
    content: [
      "Nếu Bát Trạch chỉ xét hướng nhà một cách cố định, Huyền Không Phi Tinh lại nhìn phong thủy như một dòng chảy thay đổi theo thời gian — đây là lý do vì sao có những ngôi nhà từng vượng phát nhưng sau một giai đoạn lại sa sút, dù không hề thay đổi kết cấu.",
      "Huyền Không Phi Tinh dựa trên hệ thống Tam Nguyên Cửu Vận — chia thời gian thành 9 vận, mỗi vận 20 năm. Bằng cách lập tinh bàn (bản đồ 9 cung) theo Sơn, Hướng và Vận xây dựng của ngôi nhà, chuyên gia xác định được sao nào đang vượng, sao nào đang suy tại từng vị trí trong nhà.",
      { heading: "Cửu Tinh trong Huyền Không Phi Tinh là gì?" },
      "Tinh bàn Huyền Không được lập từ 9 sao (Cửu Tinh), mỗi sao mang một tính chất Ngũ Hành và ý nghĩa riêng — có sao chủ về tài lộc, có sao chủ về văn xương khoa bảng, cũng có sao mang tính chất cần lưu ý (dễ liên quan đến sức khỏe, khẩu thiệt) khi rơi vào vị trí không thuận. Việc luận đoán chính xác đòi hỏi xét vị trí từng sao trong bối cảnh tổng thể tinh bàn, không thể tách rời để kết luận một sao là \"tốt\" hay \"xấu\" tuyệt đối.",
      { heading: "Vượng Sơn Vượng Hướng là gì?" },
      "Đây là cách cục tốt nhất trong Huyền Không — khi sao vượng khí rơi đúng vào cả Sơn (sau nhà) và Hướng (trước nhà), giúp nhà vừa vượng nhân đinh vừa vượng tài lộc. Ngược lại là Thượng Sơn Hạ Thủy — cách cục cần lưu ý và thường phải hóa giải.",
      { heading: "Vì sao cùng một nhà, luận Bát Trạch và Huyền Không có thể khác nhau?" },
      "Vì hai hệ thống dựa trên nguyên lý khác nhau — Bát Trạch cố định theo hướng và mệnh quái, Huyền Không biến đổi theo thời gian xây dựng. Trong thực tế, chuyên gia có kinh nghiệm thường đối chiếu cả hai để đưa ra kết luận toàn diện hơn, thay vì chỉ dựa vào một trường phái.",
      { heading: "Vì sao Huyền Không đòi hỏi đo đạc chính xác?" },
      "Tinh bàn Huyền Không được lập dựa trên độ số Sơn - Hướng chính xác đo bằng la bàn chuyên dụng, không phải ước lượng bằng mắt thường. Chỉ cần lệch vài độ, ngôi nhà có thể rơi vào một sơn hướng khác trong hệ 24 sơn, dẫn đến tinh bàn — và do đó toàn bộ kết luận cát hung — hoàn toàn khác nhau. Đây là lý do luận Huyền Không thường cần khảo sát trực tiếp thay vì chỉ dựa vào ảnh chụp hoặc mô tả qua lời.",
      { heading: "Thời điểm nào nên xem lại tinh bàn nhà?" },
      "Vì Tam Nguyên Cửu Vận chia thời gian thành các giai đoạn 20 năm, một ngôi nhà xây dựng ở đầu vận và một ngôi nhà xây ở cuối vận có thể mang tinh bàn khác nhau dù cùng hướng. Ngoài ra, khi bước sang vận mới (cứ 20 năm một lần) hoặc khi nhà có sửa chữa lớn làm thay đổi cửa chính, nhiều gia đình chọn xem lại tinh bàn để đối chiếu xem cách cục hiện tại còn phù hợp hay cần điều chỉnh thêm.",
      { heading: "Lộ trình học Huyền Không Phi Tinh" },
      "Người mới nên bắt đầu từ khóa nhập môn để hiểu Tam Nguyên Cửu Vận và cách lập tinh bàn cơ bản, sau đó trung cấp để luận Vượng Sơn Vượng Hướng, và cao cấp để ứng dụng các kỹ thuật hóa giải nâng cao như Thất Tinh Đả Kiếp.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy nhà chuyên sâu", href: "/dich-vu/phong-thuy-nha-chuyen-sau" },
      { label: "Khóa Huyền không phi tinh nhập môn", href: "/khoa-hoc/huyen-khong-phi-tinh-nhap-mon" },
      { label: "Khóa Huyền không phi tinh cao cấp", href: "/khoa-hoc/huyen-khong-phi-tinh-cao-cap" },
      { label: "Tra cứu thuật ngữ: Tam Nguyên Cửu Vận, Vượng Sơn Vượng Hướng...", href: "/kien-thuc/thuat-ngu-phong-thuy" },
    ],
  },
  {
    slug: "cach-xem-ngay-tot-xau",
    title: "Cách xem ngày tốt xấu chuẩn phong thủy",
    excerpt: "Quy trình trạch nhật theo Chính Ngũ Hành, vì sao cùng một ngày người này tốt người kia lại xấu.",
    category: "Kiến thức",
    categorySlug: "kien-thuc-ung-dung",
    publishedAt: "2026-08-03",
    image: "/images/blog/cach-xem-ngay-tot-xau.svg",
    content: [
      `Không phải ngẫu nhiên mà ông bà ta luôn dặn "có thờ có thiêng, có kiêng có lành" trước mỗi việc lớn. Nhưng xem ngày đúng cách không đơn giản là mở lịch vạn niên và tìm dòng chữ "ngày tốt" — đó chỉ là bước đầu tiên trong một quy trình nhiều lớp hơn.`,
      "Xem ngày (trạch nhật) truyền thống dựa trên Chính Ngũ Hành — xét Can Chi của ngày, đối chiếu với 12 Trực Thần (Kiến, Trừ, Mãn, Bình...), lọc các ngày phạm Tam Tai, Không Vong, Nguyệt Kỵ. Đây là lớp lọc chung cho tất cả mọi người.",
      { heading: "12 Trực Thần là gì?" },
      "Mỗi ngày trong lịch vạn niên được gán một trong 12 Trực Thần theo chu kỳ lặp lại: Kiến, Trừ, Mãn, Bình, Định, Chấp, Phá, Nguy, Thành, Thu, Khai, Bế. Mỗi Trực mang một tính chất riêng — có Trực thiên về khởi sự thuận lợi (như Thành, Khai, Định), có Trực cần tránh cho việc lớn (như Phá, Nguy, Bế). Đây là lớp lọc đầu tiên, mang tính tổng quát cho tất cả mọi người trong cùng một ngày.",
      { heading: "Vì sao cùng một ngày, người này tốt người kia lại xấu?" },
      "Vì bước quan trọng nhất thường bị bỏ qua: đối chiếu ngày đã lọc với mệnh cục (Bát Tự) của người chủ sự. Một ngày được xem là hoàng đạo chung nhưng có thể xung khắc với Nhật Chủ của một người cụ thể — đây là lý do vì sao xem ngày qua lịch vạn niên thông thường chỉ mang tính tham khảo.",
      { heading: "Quy trình trạch nhật đầy đủ gồm những bước nào?" },
      {
        list: [
          "Xác định việc cần làm (cưới hỏi, động thổ, khai trương...) để biết tiêu chí lọc phù hợp.",
          "Lọc sơ bộ theo Trực Thần và các ngày phạm Tam Tai, Không Vong, Nguyệt Kỵ chung.",
          "Đối chiếu các ngày còn lại với Bát Tự của người chủ sự (và người liên quan nếu là việc chung như cưới hỏi).",
          "Chọn giờ tốt trong ngày đã chọn, đôi khi cần đối chiếu thêm với Kỳ Môn Độn Giáp cho việc đòi hỏi độ chính xác cao.",
        ],
      },
      { heading: "Ngày Hoàng Đạo có phải luôn là lựa chọn tốt nhất?" },
      "Nhiều người mặc định \"ngày Hoàng Đạo\" là ngày tốt tuyệt đối và \"ngày Hắc Đạo\" là ngày xấu tuyệt đối. Thực tế, đây chỉ là một lớp phân loại dựa trên vị trí của 12 vị Thần sát di chuyển theo ngày (Thanh Long, Bạch Hổ, Chu Tước...), là lớp lọc chung chứ chưa đối chiếu với mệnh cục cá nhân. Một ngày Hoàng Đạo vẫn có thể xung khắc với Nhật Chủ của một người cụ thể, và ngược lại một ngày Hắc Đạo đôi khi vẫn có thể dùng được nếu biết cách chọn giờ hóa giải phù hợp — đây là lý do vì sao không nên chỉ dựa vào mỗi nhãn \"Hoàng Đạo/Hắc Đạo\" để quyết định.",
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
      { label: "Tra cứu thuật ngữ: Tam Tai, Không Vong, Kỳ Môn Độn Giáp...", href: "/kien-thuc/thuat-ngu-phong-thuy" },
    ],
  },
  {
    slug: "phong-thuy-can-ho-chung-cu",
    title: "Phong thủy căn hộ chung cư: khác gì so với nhà đất?",
    excerpt: "Những giới hạn riêng của căn hộ chung cư và cách hóa giải khi không thể chọn hướng đất hay sửa kết cấu.",
    category: "Nhà ở",
    categorySlug: "nha-o",
    publishedAt: "2026-08-04",
    image: "/images/blog/phong-thuy-can-ho-chung-cu.svg",
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
      { heading: "Cách xác định hướng cửa chính căn hộ cho đúng" },
      "Khác với nhà đất (có thể đo hướng từ nhiều điểm của khu đất), căn hộ chung cư nên đo hướng bằng la bàn đứng ngay tại cửa ra vào căn hộ, mặt la bàn hướng ra ngoài hành lang — đây được xem là điểm đo chuẩn nhất vì phản ánh đúng hướng khí thực tế đi vào không gian sống, thay vì đo theo hướng tổng thể của cả tòa nhà (vốn có thể lệch khá nhiều so với hướng căn hộ cụ thể).",
      { heading: "Ban công có ý nghĩa gì trong phong thủy chung cư?" },
      "Với nhà đất, sân trước hoặc khoảng sân giữ vai trò \"Minh Đường\" — nơi tụ khí trước khi vào nhà. Với căn hộ chung cư, ban công thường được xem như đóng vai trò tương tự: nên giữ thông thoáng, tránh chất đồ đạc kín mít hoặc biến thành kho chứa, vì điều này có thể cản trở luồng khí lưu thông vào không gian sống bên trong.",
      { heading: "Căn hộ tầng thấp và tầng cao có khác biệt gì?" },
      "Đây là câu hỏi được hỏi khá nhiều khi chọn mua căn hộ. Quan niệm phổ biến cho rằng tầng thấp (gần mặt đất) thường ồn và bụi hơn do gần đường, trong khi tầng quá cao có thể khiến một số người cảm thấy thiếu cảm giác \"vững chãi\", gắn kết với mặt đất. Đây là các yếu tố mang tính tham khảo, cảm nhận thực tế của từng người khi ở cũng quan trọng không kém — không có tầng nào là \"tuyệt đối tốt\" cho tất cả mọi người.",
      "Vì không gian căn hộ thường nhỏ và khó thay đổi kết cấu, nên việc khảo sát kỹ bản vẽ hoặc hiện trạng thực tế trước khi đưa ra giải pháp càng quan trọng hơn so với nhà đất.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy nhà ở", href: "/dich-vu/phong-thuy-nha-o" },
      { label: "Khóa Bát trạch nhập môn", href: "/khoa-hoc/bat-trach-nhap-mon" },
      { label: "Phong thủy nhà ở là gì?", href: "/kien-thuc/nha-o/phong-thuy-nha-o-la-gi" },
      { label: "Tra cứu thuật ngữ phong thủy", href: "/kien-thuc/thuat-ngu-phong-thuy" },
    ],
  },
  {
    slug: "phong-thuy-shop-kinh-doanh",
    title: "Phong thủy shop, cửa hàng kinh doanh: 4 vị trí quyết định dòng tiền",
    excerpt: "Quầy thu ngân, hướng cửa, lối đi và thời điểm khai trương — những yếu tố ảnh hưởng trực tiếp đến việc buôn bán.",
    category: "Kinh doanh",
    categorySlug: "kinh-doanh",
    publishedAt: "2026-08-04",
    image: "/images/blog/phong-thuy-shop-kinh-doanh.svg",
    content: [
      "Khác với nhà ở — nơi ưu tiên sự an tĩnh, một cửa hàng kinh doanh cần khí động, cần dòng người ra vào để tạo ra doanh thu. Vì vậy phong thủy shop kinh doanh không chỉ xét hướng theo mệnh chủ cửa hàng, mà còn đối chiếu với lưu lượng người qua lại thực tế của mặt bằng.",
      { heading: "Vị trí quầy thu ngân — nơi giữ tài vị" },
      "Quầy thu ngân được xem là nơi giữ tài vị của cửa hàng, nên thường được đặt ở vị trí \"tọa cát hướng cát\": tránh đặt đối diện trực xung với cửa ra vào (tiền vào rồi trôi thẳng ra), và tránh để người ngồi thu ngân quay lưng ra cửa chính.",
      { heading: "Biển hiệu cửa hàng cần lưu ý gì?" },
      "Biển hiệu được xem như \"gương mặt\" của cửa hàng, ảnh hưởng đến ấn tượng đầu tiên và khả năng thu hút khách từ xa. Biển hiệu nên đặt cân đối, chữ rõ ràng dễ đọc, tránh bị cây cối hoặc công trình khác che khuất một phần. Kích thước và tỷ lệ biển hiệu nên hài hòa với mặt tiền cửa hàng, không quá nhỏ khiến khó nhận diện, cũng không quá lớn gây mất cân đối tổng thể.",
      { heading: "Màu sắc theo ngành hàng kinh doanh" },
      "Màu sắc chủ đạo của cửa hàng có thể cân nhắc theo Ngũ Hành phù hợp với ngành nghề: ngành liên quan đến ẩm thực, năng lượng thường hợp tông màu ấm (đỏ, cam thuộc Hỏa); ngành liên quan đến tài chính, kim khí hợp tông màu trắng, ghi bạc (Kim); ngành liên quan đến giáo dục, sách vở, thời trang hợp tông xanh lá (Mộc). Đây là yếu tố tham khảo để tạo thiện cảm tổng thể, nên kết hợp hài hòa với nhận diện thương hiệu thay vì áp dụng cứng nhắc.",
      { heading: "Hướng cửa và lối đi" },
      {
        list: [
          "Cửa chính nên thông thoáng, tránh vật cản lớn ngay trước cửa làm nghẽn khí và tầm nhìn của khách.",
          "Lối đi trong cửa hàng nên có luồng di chuyển rõ ràng, tránh kệ hàng che khuất hoặc chắn ngang lối vào chính.",
          "Khu vực trưng bày sản phẩm chủ lực nên đặt ở nơi khách nhìn thấy ngay khi bước vào, thay vì khuất trong góc.",
        ],
      },
      { heading: "Cửa hàng nhiều tầng nên bố trí thế nào?" },
      "Với cửa hàng có từ 2 tầng trở lên, tầng trệt nên ưu tiên trưng bày sản phẩm chủ lực và đặt quầy thu ngân, vì đây là nơi tiếp xúc trực tiếp với dòng khách vào ra. Cầu thang lên tầng trên không nên đặt đối diện thẳng cửa chính, tránh tạo cảm giác khí \"đi thẳng lên rồi thoát ra\" thay vì lưu lại tầng trệt trước.",
      { heading: "Gương trong cửa hàng: nên và không nên đặt ở đâu?" },
      "Gương có thể dùng để tạo cảm giác không gian rộng hơn và phản chiếu ánh sáng, nhưng cần tránh đặt gương đối diện trực tiếp cửa chính (được cho là đẩy tài khí quay ngược ra ngoài) hoặc đối diện quầy thu ngân. Vị trí đặt gương phù hợp hơn là ở hai bên hoặc góc khuất, giúp mở rộng thị giác mà không ảnh hưởng đến luồng khí chính của cửa hàng.",
      { heading: "Chọn ngày khai trương" },
      "Ngày khai trương ảnh hưởng đến tâm lý khởi đầu và thường được xem theo Can Chi ngày kết hợp với mệnh cục người chủ — tương tự nguyên tắc trạch nhật áp dụng cho các sự kiện quan trọng khác.",
      "Với mặt bằng đi thuê, phần lớn giải pháp vẫn nằm ở cách bố trí nội thất, quầy kệ và ánh sáng — không cần can thiệp vào kết cấu mặt bằng.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy văn phòng", href: "/dich-vu/phong-thuy-van-phong" },
      { label: "Dịch vụ Xem ngày cao cấp", href: "/dich-vu/xem-ngay-cao-cap" },
      { label: "Cách xem ngày tốt xấu chuẩn phong thủy", href: "/kien-thuc/kien-thuc-ung-dung/cach-xem-ngay-tot-xau" },
      { label: "Tra cứu thuật ngữ phong thủy", href: "/kien-thuc/thuat-ngu-phong-thuy" },
    ],
  },
  {
    slug: "phong-thuy-van-phong-nho",
    title: "Phong thủy văn phòng nhỏ, startup: ưu tiên gì khi diện tích hạn chế?",
    excerpt: "Nguyên tắc bố trí khi không có phòng riêng cho lãnh đạo và không gian làm việc theo kiểu mở.",
    category: "Văn phòng",
    categorySlug: "van-phong",
    publishedAt: "2026-08-04",
    image: "/images/blog/phong-thuy-van-phong-nho.svg",
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
      { heading: "Tài liệu, máy in nên đặt ở đâu?" },
      "Máy in, tủ tài liệu và các thiết bị dùng chung nên đặt ở khu vực rìa hoặc góc văn phòng, tránh chắn ngay lối đi chính hoặc đặt sau lưng vị trí ngồi của người đứng đầu. Khu vực này thường có tiếng ồn và người ra vào liên tục, nên tách biệt khỏi góc làm việc cần sự tập trung cao.",
      { heading: "Góc làm việc chung: ai ngồi gần cửa, ai ngồi trong?" },
      "Với văn phòng phải bố trí nhiều người trong một không gian mở, nguyên tắc chung là những vị trí cần tập trung cao (kế toán, thiết kế, lập trình) nên ngồi sâu bên trong, tránh luồng người qua lại; còn vị trí cần giao tiếp nhiều (kinh doanh, chăm sóc khách hàng) có thể ngồi gần lối vào hơn. Dù ngồi ở đâu, vẫn nên tránh để bất kỳ ai ngồi quay lưng thẳng ra cửa chính trong thời gian dài.",
      { heading: "Ánh sáng tự nhiên và ánh sáng nhân tạo" },
      "Ánh sáng tự nhiên từ cửa sổ được ưu tiên hơn vì mang lại sinh khí thật, nên bố trí bàn làm việc gần nguồn sáng tự nhiên nếu có thể, thay vì để khu vực đó thành lối đi hoặc kho chứa đồ. Với phần diện tích không có ánh sáng tự nhiên, nên dùng đèn ánh sáng vàng ấm hoặc trắng dịu, tránh ánh sáng quá lạnh hoặc quá yếu khiến không gian thiếu sức sống.",
      "Điều quan trọng là không cố áp nguyên xi các nguyên tắc dành cho văn phòng lớn vào không gian nhỏ — cần chọn lọc 2-3 điểm có tác động lớn nhất thay vì cố gắng thỏa mãn mọi tiêu chí cùng lúc.",
      { heading: "Vật phẩm phong thủy nhỏ gọn, phù hợp không gian hẹp" },
      "Với văn phòng nhỏ, nên ưu tiên các vật phẩm kích thước nhỏ gọn, đặt được ngay trên bàn làm việc thay vì các vật phẩm lớn chiếm nhiều diện tích sàn. Một chậu cây nhỏ, một vật phẩm chiêu tài đặt đúng góc bàn làm việc thường mang lại hiệu quả bố cục tốt hơn nhiều vật phẩm chen chúc trong không gian hạn chế.",
    ],
    relatedLinks: [
      { label: "Dịch vụ Phong thủy văn phòng", href: "/dich-vu/phong-thuy-van-phong" },
      { label: "Khóa Bát trạch nhập môn", href: "/khoa-hoc/bat-trach-nhap-mon" },
      { label: "Tra cứu thuật ngữ phong thủy", href: "/kien-thuc/thuat-ngu-phong-thuy" },
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
  {
    slug: "trung-tam-viet-care-thai-binh",
    title: "Trung tâm Việt Care",
    location: "TP. Thái Bình",
    image: "/images/portfolio/trung-tam-viet-care-thai-binh.jpg",
  },
  {
    slug: "biet-thu-ba-ria",
    title: "Biệt thự",
    location: "Bà Rịa",
    image: "/images/portfolio/biet-thu-ba-ria.jpg",
  },
  {
    slug: "biet-thu-tay-ho",
    title: "Biệt thự",
    location: "Tây Hồ, Hà Nội",
    image: "/images/portfolio/biet-thu-tay-ho.jpg",
  },
  {
    slug: "cong-ty-cong-trinh-do-thi-ubnd-dat-do",
    title: "Công ty Công trình đô thị UBND huyện Đất Đỏ",
    location: "Huyện Đất Đỏ",
    image: "/images/portfolio/cong-ty-cong-trinh-do-thi-ubnd-dat-do.jpg",
  },
  {
    slug: "khu-biet-thu-villa-xanh",
    title: "Khu biệt thự Villa Xanh",
    location: "",
    image: "/images/portfolio/khu-biet-thu-villa-xanh.jpg",
  },
  {
    slug: "khu-biet-thu-don-lap-me-linh",
    title: "Khu biệt thự đơn lập",
    location: "Mê Linh, Hà Nội",
    image: "/images/portfolio/khu-biet-thu-don-lap-me-linh.jpg",
  },
  {
    slug: "nha-hang-chay-dinh-cong",
    title: "Nhà hàng chay",
    location: "Định Công, Hà Nội",
    image: "/images/portfolio/nha-hang-chay-dinh-cong.jpg",
  },
  {
    slug: "khu-biet-thu-ba-vi",
    title: "Khu biệt thự",
    location: "Ba Vì, Hà Nội",
    image: "/images/portfolio/khu-biet-thu-ba-vi.jpg",
  },
  {
    slug: "khao-sat-cong-ty-ha-dong",
    title: "Khảo sát công ty",
    location: "Hà Đông, Hà Nội",
    image: "/images/portfolio/khao-sat-cong-ty-ha-dong.jpg",
  },
  {
    slug: "cong-ty-thiet-bi-pccc-hoa-binh",
    title: "Cúng và làm phong thủy - Công ty thiết bị PCCC",
    location: "TP. Hòa Bình",
    image: "/images/portfolio/cong-ty-thiet-bi-pccc-hoa-binh.jpg",
  },
  {
    slug: "bo-tri-phong-thuy-lanh-dao-vp-quoc-hoi",
    title: "Bố trí phong thủy cho lãnh đạo Văn phòng Quốc Hội",
    location: "Hà Nội",
    image: "/images/portfolio/bo-tri-phong-thuy-lanh-dao-vp-quoc-hoi.jpg",
  },
  {
    slug: "phong-thuy-am-trach-dai-gia-dinh-son-tay",
    title: "Phong thủy âm trạch cho đại gia đình",
    location: "Sơn Tây, Hà Nội",
    image: "/images/portfolio/phong-thuy-am-trach-dai-gia-dinh-son-tay.jpg",
  },
];
