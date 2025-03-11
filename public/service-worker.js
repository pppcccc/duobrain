self.addEventListener("push", (event) => {
  console.log("📩 Push event received:", event);
  if (!event.data) return;

  const data = event.data.json();
  console.log("📩 Push Notification Data:", data);

  self.registration.showNotification(data.title, {
    body: data.message,
    icon: "/favicon.ico", // Make sure this file exists
  });
});
