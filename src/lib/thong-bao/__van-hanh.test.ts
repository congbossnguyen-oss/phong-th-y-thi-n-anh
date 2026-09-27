// Kiểm chứng thông báo vận hành (CMS Notification V1 — email). Trọng tâm: best-effort (không bao giờ
// throw ra caller) + chống gửi trùng cho thanh toán.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { sendMock, consultMock } = vi.hoisted(() => ({ sendMock: vi.fn(), consultMock: vi.fn() }));

vi.mock("../email/client", () => ({
  getResendClient: () => ({ emails: { send: sendMock } }),
  getFromAddress: () => "noreply@test.local",
}));
vi.mock("../email/send", () => ({
  sendConsultationRequestEmail: consultMock,
}));

import { notifyOperatorConsultation, notifyOperatorPayment, nenGuiThongBaoThanhToan } from "./van-hanh";

const CONSULT = { name: "Nguyễn Văn A", phone: "0900000000", email: null, topic: null, message: "test" };
const PAYMENT = { orderCode: "DH123", customerName: "Nguyễn Văn A", totalAmount: 1500000, orderType: "product" };

beforeEach(() => {
  sendMock.mockReset();
  consultMock.mockReset();
  sendMock.mockResolvedValue({}); // Resend trả { data, error } — mặc định không lỗi
  consultMock.mockResolvedValue(undefined);
});

describe("chống gửi trùng thanh toán", () => {
  it("chỉ đơn pending_payment (lần đầu) mới được thông báo", () => {
    expect(nenGuiThongBaoThanhToan("pending_payment")).toBe(true);
  });
  it("đơn đã confirmed (retry) KHÔNG thông báo lại", () => {
    expect(nenGuiThongBaoThanhToan("confirmed")).toBe(false);
  });
  it("status không xác định KHÔNG thông báo", () => {
    expect(nenGuiThongBaoThanhToan(undefined)).toBe(false);
    expect(nenGuiThongBaoThanhToan("cancelled")).toBe(false);
  });
});

describe("notifyOperatorConsultation", () => {
  it("gửi đúng 1 email tư vấn với dữ liệu khách", async () => {
    await notifyOperatorConsultation(CONSULT);
    expect(consultMock).toHaveBeenCalledTimes(1);
    expect(consultMock).toHaveBeenCalledWith(CONSULT);
  });
  it("email lỗi KHÔNG làm hàm throw (nghiệp vụ form vẫn tiếp tục)", async () => {
    consultMock.mockRejectedValueOnce(new Error("resend down"));
    await expect(notifyOperatorConsultation(CONSULT)).resolves.toBeUndefined();
  });
});

describe("notifyOperatorPayment", () => {
  it("gửi đúng 1 email với mã đơn + số tiền + tên khách", async () => {
    await notifyOperatorPayment(PAYMENT);
    expect(sendMock).toHaveBeenCalledTimes(1);
    const arg = sendMock.mock.calls[0][0];
    expect(arg.subject).toContain("DH123");
    expect(arg.subject).toContain("1.500.000");
    expect(arg.html).toContain("Nguyễn Văn A");
    expect(typeof arg.to).toBe("string");
    expect(arg.to.length).toBeGreaterThan(0);
  });
  it("Resend trả error KHÔNG làm hàm throw", async () => {
    sendMock.mockResolvedValueOnce({ error: { name: "rate_limit", message: "too many" } });
    await expect(notifyOperatorPayment(PAYMENT)).resolves.toBeUndefined();
  });
  it("Resend ném lỗi KHÔNG làm hàm throw (thanh toán vẫn thành công)", async () => {
    sendMock.mockRejectedValueOnce(new Error("network"));
    await expect(notifyOperatorPayment(PAYMENT)).resolves.toBeUndefined();
  });
});
