/**
 * Service Worker — Phong Thủy Thiên Anh.
 *
 * Nhiệm vụ DUY NHẤT lúc này: nhận thông báo đẩy nhắc mùng Một / ngày Rằm và mở trang khi khách
 * bấm vào. CỐ TÌNH KHÔNG cache gì cả — site chạy server-side rendering (Astro + Node adapter),
 * cache nhầm sẽ khiến khách thấy trang cũ, giá cũ, trạng thái gói cũ. Nếu sau này muốn chạy
 * ngoại tuyến thì phải thiết kế riêng, không thêm tùy tiện vào đây.
 */

// Bản mới cài xong là dùng luôn, không chờ đóng hết tab cũ.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

/**
 * Máy chủ gửi tín hiệu KHÔNG kèm nội dung (xem src/lib/thong-bao/web-push.ts giải thích vì sao),
 * nên ở đây tự gọi API lấy lời nhắc mới nhất. Cách này còn có cái lợi: nội dung luôn đúng ngày,
 * không sợ hiện lại lời nhắc cũ nếu tín hiệu bị dịch vụ đẩy giữ trong hàng đợi.
 *
 * Trình duyệt BẮT BUỘC mỗi lần nhận push phải hiện một thông báo, nếu không nó tự hiện dòng
 * "trang web đã được cập nhật ngầm" rất khó coi — nên mọi nhánh lỗi đều phải hiện thông báo dự phòng.
 */
self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let data = null;

      // Nếu vì lý do nào đó máy chủ có gửi kèm nội dung thì ưu tiên dùng luôn, khỏi phải gọi mạng.
      if (event.data) {
        try {
          data = event.data.json();
        } catch (e) {
          data = null;
        }
      }

      if (!data) {
        try {
          const res = await fetch("/api/thong-bao/loi-nhac-hom-nay", { cache: "no-store" });
          if (res.ok) data = await res.json();
        } catch (e) {
          data = null;
        }
      }

      const tieuDe = (data && data.tieuDe) || "Phong Thủy Thiên Anh";
      await self.registration.showNotification(tieuDe, {
        body: (data && data.noiDung) || "Quý bằng hữu nhớ lưu tâm chuyện thờ cúng.",
        icon: "/images/brand/zhi-gong-logo.png",
        badge: "/images/brand/zhi-gong-logo.png",
        lang: "vi",
        // Cùng một ngày lễ chỉ hiện một thông báo, gửi lại thì thay thế chứ không chồng đống.
        tag: (data && data.tag) || "nhac-ngay-le",
        renotify: true,
        data: { url: (data && data.url) || "/" },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const dich = (event.notification.data && event.notification.data.url) || "/";

  // Đang mở sẵn tab của site thì chuyển tab đó sang trang đích, thay vì mở thêm tab mới.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((danhSach) => {
      for (const client of danhSach) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(dich);
          return client.focus();
        }
      }
      return self.clients.openWindow(dich);
    }),
  );
});
