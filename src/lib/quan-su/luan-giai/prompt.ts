/**
 * Dựng system prompt + user prompt cho Interpretation Engine.
 *
 * RANH GIỚI CỨNG (mục 22 tài liệu PHASE): model CHỈ được diễn giải dữ liệu quẻ do Casting Engine
 * đưa sang. Không được tự tính Can Chi, Lục Thân, Không Vong, hồi đầu sinh khắc, hay bất cứ số
 * liệu huyền học nào. Thiếu dữ liệu thì im lặng ở phần đó, không được suy đoán bù.
 */
import type { QuanSuInterpretationPayload } from "../divination";
import type { FourGods } from "../advisory-engine";
import { getPhiPhucRelations, resolveDungThan, resolveFourGods } from "../advisory-engine";
import { canLucHao } from "../can-luc-hao";
import { synthesizeKyNguyenDung } from "../ky-nguyen-dung";
import { phanLoaiSauTamHop } from "../../luc-hao-tam-hop-cuc";
import { quyTacGiongVan } from "../giong-van";
import { TRI_THUC_LOI } from "./kien-thuc";

/**
 * Phần tri thức — GIỐNG NHAU ở mọi lượt gọi nên tách riêng để bật prompt caching (xem llm.ts).
 * Đặt tri thức trước, quy tắc sau, để quy tắc là thứ model đọc gần chỗ làm việc nhất.
 */
export function systemPromptTriThuc(): string {
  return [
    "Bạn là bộ máy luận giải Kinh Dịch (Lục Hào) của Quân Sư Thiên Anh.",
    "Dưới đây là toàn bộ phương pháp luận bắt buộc phải theo. Luận đúng quy trình, không tự chế phương pháp khác.",
    "",
    TRI_THUC_LOI,
  ].join("\n");
}

/** Phần quy tắc riêng theo từng lượt (giọng văn đổi theo giới tính người hỏi). */
export function systemPromptQuyTac(gioiTinh?: "Nam" | "Nữ", mucNhayCam?: "thuong" | "nhay-cam" | "cao"): string {
  const canhBao: string[] = [];
  if (mucNhayCam === "cao") {
    canhBao.push(
      "- Câu hỏi này thuộc nhóm NHẠY CẢM CAO (sức khỏe hoặc pháp lý). Bắt buộc nói rõ đây là góc nhìn tham khảo theo phương pháp huyền học, không thay thế bác sĩ hoặc luật sư.",
      "- Tuyệt đối KHÔNG chẩn đoán bệnh, KHÔNG phán về sinh tử, KHÔNG khuyên bỏ điều trị, KHÔNG khẳng định chắc chắn kết quả pháp lý.",
    );
  } else if (mucNhayCam === "nhay-cam") {
    canhBao.push("- Câu hỏi liên quan tiền bạc. Không cam kết lợi nhuận, không thay thế tư vấn tài chính chuyên môn.");
  }

  return [
    "RANH GIỚI TUYỆT ĐỐI VỀ DỮ LIỆU:",
    "- Chỉ dùng đúng số liệu quẻ trong phần DỮ LIỆU QUẺ được cung cấp. Không tự tính, không tự suy đoán bất kỳ Can Chi, Lục Thân, Lục Thần, Không Vong, Nguyệt Phá, Phục Thần, hay quan hệ sinh khắc nào không có sẵn ở đó.",
    "- Nếu một thông tin không có trong dữ liệu, im lặng bỏ qua phần đó. Không được bịa ra cho đủ bài.",
    "- Không nhắc tới tên trường dữ liệu hay thuật ngữ kỹ thuật của hệ thống trong câu trả lời cho người hỏi.",
    "",
    "CÁCH DÙNG AN-LỆ (WORKED CASES) trong phần tri thức:",
    "- Luận từ DỮ LIỆU QUẺ + kết quả engine/rule của quẻ này TRƯỚC. Án lệ chỉ là ví dụ tham khảo cách lập luận, KHÔNG phải bằng chứng cho quẻ đang xem.",
    "- KHÔNG coi một án lệ 'giống giống' là bằng chứng trực tiếp; KHÔNG copy kết luận / vật phẩm / con số của án lệ sang quẻ này.",
    "- Chỉ được nhắc tới án lệ thực sự có mặt trong phần tri thức; KHÔNG bịa án lệ, KHÔNG bịa nguồn.",
    "",
    quyTacGiongVan(gioiTinh),
    ...(canhBao.length > 0 ? ["", "AN TOÀN:", ...canhBao] : []),
    "",
    "CÁCH VIẾT TỪNG PHẦN:",
    "- phan_tich: 3 ý, mỗi ý một câu gọn, bám đúng Bước 2 của quy trình (vượng suy, Không Vong, hào động, Thế/Ứng...). Nói bằng lời thường, người không biết Kinh Dịch vẫn hiểu.",
    "- nguyen_nhan_cot_loi: một câu, rút ra từ Bước 3 (thủ tượng) — chỉ ra việc đời thực đang vướng ở đâu, không nói chung chung.",
    "- ket_luan: chọn đúng một trong bốn giá trị cho phép.",
    "- diem_can_luu_y: 3 ý, mỗi ý một việc cụ thể cần để tâm.",
    "- quan_su_khuyen: 2 đến 4 hành động làm được ngay, không phải lời khuyên đạo lý chung.",
    "- phuong_phap_hoa_giai: CHỈ điền khi quẻ thật sự báo hung. Quẻ tốt thì để mảng rỗng, tuyệt đối không bịa vấn đề ra để hóa giải.",
    "- thoi_diem_khuyen_nghi: nếu quẻ có chỉ dấu thời điểm thì nói rõ, không có thì để chuỗi rỗng.",
  ].join("\n");
}

/** Gói dữ liệu quẻ thành phần người dùng. Giữ nguyên JSON để model không hiểu sai. */
export function userPrompt(payload: QuanSuInterpretationPayload, moTa?: string, fourGods?: FourGods): string {
  const q = payload.question;
  const phan: string[] = [
    `CÂU HỎI CỦA NGƯỜI HỎI: ${q.title}`,
    `Nhóm việc: ${q.category}`,
    `Gợi ý Dụng Thần theo nhóm việc (do hệ thống tra sẵn, vẫn phải tự kiểm lại theo Bước 1): ${JSON.stringify(q.dung_than_hint)}`,
  ];

  if (moTa && moTa.trim()) {
    phan.push("", `HOÀN CẢNH NGƯỜI HỎI TỰ KỂ:\n${moTa.trim()}`);
  }

  phan.push(
    "",
    "DỮ LIỆU QUẺ (do engine lập quẻ tính, là nguồn sự thật duy nhất):",
    JSON.stringify(payload.cast, null, 1),
  );

  if (fourGods && fourGods.dungThanNguHanh) {
    phan.push(
      "",
      "TỨ THẦN (engine/rule ĐÃ tính sẵn từ Dụng Thần — KHÔNG tự dẫn xuất lại, KHÔNG tự thêm hào):",
      JSON.stringify(
        {
          dung_than_ngu_hanh: fourGods.dungThanNguHanh,
          nguyen_than: fourGods.nguyenThan, // hào SINH Dụng Thần (phò trợ)
          ky_than: fourGods.kyThan, // hào KHẮC Dụng Thần (cản phá)
          cuu_than: "chưa dùng (hoãn — sẽ bổ sung ở phase sau)",
        },
        null,
        1,
      ),
      "- Đây là kết quả deterministic của engine/rule: chỉ dùng ĐÚNG các hào trong nguyen_than/ky_than trên, KHÔNG tự xác định thêm hào nào là Nguyên/Kỵ/Cừu Thần.",
      "- Mỗi hào kèm `state` (vượng suy, Trường Sinh, Không Vong, Nguyệt/Nhật Phá) và `interactions` (quan hệ Nhật/Nguyệt, tiến/thoái, và `hoa` = hồi đầu sinh/khắc khi có biến) — đây là DỮ KIỆN engine tính sẵn; luận mạnh/yếu, phò/phá dựa trên các dữ kiện này.",
      "- KHÔNG tự tạo điểm số 'strength' (0–100) hay xếp hạng mới cho Nguyên/Kỵ Thần — chỉ luận định tính từ các state/interactions đã cho.",
      "- Có dữ kiện thì luận; KHÔNG có (mảng rỗng / trường vắng) thì nói đúng là 'không có', KHÔNG bịa. Kết quả engine/rule ưu tiên hơn mọi án lệ tham khảo.",
    );
  }

  // CÂN LỰC HÀO (HaoStrength) — trạng thái LỰC deterministic của Dụng/Nguyên/Kỵ Thần (module dùng chung).
  // Giúp AI luận mạnh/yếu theo state engine tính sẵn, KHÔNG tự chấm Vượng/Suy. Mô hình chuỗi Kỵ→Nguyên→Dụng.
  if (fourGods && fourGods.dungThanNguHanh) {
    const dtR = resolveDungThan(payload.cast.chinh, q.dung_than_hint);
    const canLuc: Array<{ vaiTro: string } & ReturnType<typeof canLucHao>> = [];
    if (dtR.trangThai === "hien" && dtR.hao) canLuc.push({ vaiTro: "Dụng Thần", ...canLucHao(payload.cast, dtR.hao.hao) });
    for (const n of fourGods.nguyenThan) canLuc.push({ vaiTro: "Nguyên Thần", ...canLucHao(payload.cast, n.hao) });
    for (const k of fourGods.kyThan) canLuc.push({ vaiTro: "Kỵ Thần", ...canLucHao(payload.cast, k.hao) });
    if (canLuc.length > 0) {
      phan.push(
        "",
        "CÂN LỰC HÀO (engine/rule tính sẵn — trạng thái LỰC của từng hào, deterministic, KHÔNG phải điểm số):",
        JSON.stringify(canLuc, null, 1),
        "- Ưu tiên trạng thái deterministic đã tính ở đây; KHÔNG tự thay đổi kết luận Vượng/Suy của hào.",
        "- `baseForce` = lực nền theo Nhật/Nguyệt (7 trường hợp đã khóa). `currentState.effective` đã tính nâng/hạ theo hóa biến; `reduced`=bị Phá/Hồi Đầu Khắc/Hóa Xung-Mộ-Tuyệt làm giảm nhưng GIỮ nền (không về 0); `restrained`=Hóa Hợp níu chân; `hidden`=Nhập Mộ ẩn tàng; `temporalExistence=EMPTY`=Không Vong (chưa hiện hữu, chờ Xuất Không/Ứng Kỳ) — KHÔNG coi là mất lực.",
        "- Chuỗi Kỵ → Nguyên → Dụng: xét lực Kỵ Thần trước, rồi Kỵ tác động Nguyên, Nguyên tác động Dụng — KHÔNG mặc định 'Nguyên mạnh thì Dụng tốt'.",
      );
    }

    // KỴ → NGUYÊN → DỤNG SYNTHESIS (Phase 11) — kết quả deterministic của chuỗi, để AI KHÔNG tự phát minh
    // lại quan hệ sinh/khắc hay Vượng/Suy.
    const dtR2 = resolveDungThan(payload.cast.chinh, q.dung_than_hint);
    const knd = synthesizeKyNguyenDung(payload.cast, dtR2, resolveFourGods(payload.cast, dtR2));
    if (knd.currentState !== "NO_DIRECT_CHAIN") {
      phan.push(
        "",
        "KỴ → NGUYÊN → DỤNG (engine/rule tổng hợp sẵn — chuỗi tác động, deterministic, KHÔNG điểm số):",
        JSON.stringify(
          {
            ky_pressure: knd.kyPressure, // áp lực Kỵ Thần lên Dụng (STRONG..NONE)
            nguyen_support: knd.nguyenSupport, // hỗ trợ của Nguyên Thần cho Dụng
            dung_protection: knd.dungProtection, // Dụng được bảo vệ / chịu áp lực / trì hoãn...
            current_state: knd.currentState, // trạng thái chuỗi (tham sinh, Kỵ áp đảo, cân bằng...)
            chains: knd.chains, // từng cặp quan hệ + effective (khả năng phát huy)
            reasons: knd.reasons,
          },
          null,
          1,
        ),
        "- Ưu tiên Kỵ → Nguyên → Dụng deterministic synthesis ở đây. KHÔNG tự phát minh lại quan hệ sinh/khắc hoặc Vượng/Suy.",
        "- `effective` = khả năng thực thi (STRONG/AVAILABLE/LIMITED/HIDDEN/EMPTY): EMPTY = Không Vong (chưa hiện hữu, KHÔNG phải mất lực); HIDDEN = Nhập Mộ; LIMITED = bị Phá/Hồi Đầu Khắc/Hóa Hợp hạn chế nhưng GIỮ nền.",
        "- Đọc theo CHUỖI: lực Kỵ → Kỵ tác động Nguyên → Nguyên tác động Dụng. Nếu Kỵ 'tham sinh' Nguyên (Kỵ sinh Nguyên còn lực) thì Dụng được thông quan bảo vệ; nếu không có Nguyên, Kỵ khắc thẳng Dụng.",
      );
    }
  }

  // TAM HỢP — PHÂN LOẠI 6 THỂ (đủ / khuyết) + Ứng Kỳ. Bổ sung cho block TAM HỢP CỤC ở trên (chỉ cục đã thành).
  const sauTamHop = phanLoaiSauTamHop(payload.cast);
  if (sauTamHop.co) {
    phan.push(
      "",
      "TAM HỢP — PHÂN LOẠI (engine/rule tính sẵn 6 thể: đủ / khuyết; kèm Ứng Kỳ khi suy được):",
      JSON.stringify(sauTamHop.danhSach, null, 1),
      "- `full=false` = cục KHUYẾT (còn thiếu 1 hào — an tĩnh/Phục Thần), CHƯA thành ngay: ứng khi gặp Chi ở `ungKyChi` (hoặc khi hào giữ chỗ được kích).",
      "- TH6 nếu `phucLine.quaSuy=true`: Phục Thần quá suy, khó thoát ra → cục khó/không đủ lực thành, nói dè dặt.",
      "- Chỉ dùng đúng các cục liệt kê ở đây; cục TỐT/XẤU tùy hành cục sinh/khắc Dụng Thần — tự luận, KHÔNG mặc định là điềm lành.",
    );
  }

  if (payload.van_trinh) {
    phan.push(
      "",
      "VẬN TRÌNH HIỆN TẠI (Bát Tự, chỉ để tham khảo bối cảnh — KHÔNG dùng thay quẻ để kết luận):",
      JSON.stringify(
        {
          dai_van: payload.van_trinh.daiVanHienTai,
          luu_nien: payload.van_trinh.luuNienHienTai,
          tom_tat: payload.van_trinh.tomTat,
        },
        null,
        1,
      ),
    );
  }

  if (payload.tien_thoai_than.co) {
    phan.push(
      "",
      "TIẾN THẦN / THOÁI THẦN (engine tính sẵn — đà của việc là lên hay xuống):",
      JSON.stringify(payload.tien_thoai_than, null, 1),
    );
  }

  if (payload.tam_hop_cuc.co) {
    phan.push(
      "",
      "TAM HỢP CỤC (engine tính sẵn — các hào tham gia ĐỔI HẲN sang ngũ hành của cục):",
      JSON.stringify(payload.tam_hop_cuc, null, 1),
      "Cục hình thành là tốt hay xấu tùy hành của cục sinh/khắc gì với Dụng Thần — tự luận, KHÔNG mặc định cục là điềm lành.",
    );
  }

  // PHI THẦN ↔ PHỤC THẦN — surface FACT quan hệ ngũ hành (Phục ẩn dưới hào chủ Phi). Ý nghĩa từng
  // quan hệ đã có trong phần tri thức (§ Phục Thần) — ở đây chỉ nêu dữ kiện, không kèm verdict/điểm.
  const phiPhuc = getPhiPhucRelations(payload.cast);
  if (phiPhuc.length > 0) {
    phan.push(
      "",
      "PHI THẦN ↔ PHỤC THẦN (engine tính sẵn — lục thân ẩn 'phục' dưới hào chủ 'phi'; FACT quan hệ ngũ hành):",
      JSON.stringify(phiPhuc, null, 1),
      "- Ý nghĩa từng quan hệ (Phục sinh Phi / Phi sinh Phục / Phi khắc Phục / Phục khắc Phi) theo ĐÚNG mục 'Phục Thần' trong phần tri thức — KHÔNG tự đặt điểm số, KHÔNG tự đổi ai là Phi/ai là Phục.",
      "- Chỉ dùng đúng các cặp Phi/Phục liệt kê ở đây; nếu vắng thì quẻ không có phục thần đáng xét. Dữ liệu engine/rule ưu tiên hơn án lệ tham khảo.",
    );
  }

  // PHẢN NGÂM / PHỤC NGÂM — engine tính sẵn ở `cast.fanYin`/`cast.fuYin`; surface thành block riêng
  // để AI không bỏ sót (chúng vốn nằm lẫn trong cast JSON). CHỈ FACT: truyền đúng label/type engine
  // cung cấp, KHÔNG tự đặt điểm/mức mạnh-yếu. Chỉ render khi ít nhất một cái enabled.
  if (payload.cast.fanYin?.enabled || payload.cast.fuYin?.enabled) {
    const phanNgam = payload.cast.fanYin?.enabled ? payload.cast.fanYin : null;
    const phucNgam = payload.cast.fuYin?.enabled ? payload.cast.fuYin : null;
    phan.push(
      "",
      "PHẢN NGÂM / PHỤC NGÂM (engine tính sẵn giữa Quẻ Chính và Quẻ Biến — FACT, KHÔNG tự suy diễn thêm):",
      JSON.stringify({ phan_ngam: phanNgam, phuc_ngam: phucNgam }, null, 1),
      "- Chỉ khi tín hiệu có mặt ở đây thì quẻ MỚI có Phản Ngâm/Phục Ngâm — nếu vắng, KHÔNG được tự gán.",
      "- Phản Ngâm chỉ điềm việc lặp lại/đảo ngược, trắc trở; Phục Ngâm chỉ điềm trì trệ, đau đáu kéo dài — đưa vào luận, nhưng KHÔNG tự đặt điểm số hay mức mạnh/yếu.",
      "- Dùng ĐÚNG `label`/`type` engine cung cấp (kể cả mức nặng nếu label đã ghi); KHÔNG tự chế mức độ. Dữ liệu engine/rule ưu tiên hơn án lệ tham khảo.",
    );
  }

  if (payload.ung_ky) {
    phan.push(
      "",
      "ỨNG KỲ — MỐC THỜI GIAN (engine tính sẵn theo 8 quy luật, ĐÃ xếp theo độ ưu tiên):",
      JSON.stringify(payload.ung_ky, null, 1),
      "Cách dùng phần này khi viết `thoi_diem_khuyen_nghi`:",
      `- Ưu tiên các mốc uuTien nhỏ nhất. Đọc theo đơn vị "${payload.ung_ky.donViGoiY}" như trường donViGoiY đã ghi.`,
      "- Nói theo lời thường: 'vào những ngày Tý', 'khoảng tháng Thân' — KHÔNG đọc tên trường dữ liệu, không nói 'ưu tiên 1'.",
      "- Mốc nào có canAudit=true thì nói dè dặt hơn ('có thể', 'thường rơi vào'), không khẳng định chắc.",
      "- Mọi câu trong `ghiChu` là ràng buộc bắt buộc — nhất là các dòng CẢNH BÁO, phải phản ánh vào bài, không được lược bỏ.",
      "- TUYỆT ĐỐI không tự nghĩ ra mốc thời gian nào khác ngoài danh sách trên.",
    );
  } else {
    phan.push(
      "",
      "ỨNG KỲ: hệ thống KHÔNG tính được mốc sẵn cho nhóm việc này (Dụng Thần không đơn nhất).",
      "→ Nếu quẻ có chỉ dấu thời điểm thì tự luận theo tài liệu; nếu không rõ thì để `thoi_diem_khuyen_nghi` rỗng. Không được bịa mốc.",
    );
  }

  phan.push("", `Thời điểm lập quẻ: ${payload.meta.castAtISO}. Cách lập quẻ: ${payload.meta.method}.`);
  phan.push("", "Hãy luận theo đúng quy trình và trả kết quả qua công cụ đã cho.");
  return phan.join("\n");
}
