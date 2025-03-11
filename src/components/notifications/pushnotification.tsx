import { useEffect } from "react";

export default function PushNotification() {
  useEffect(() => {
    async function subscribeUser() {
      if (!("serviceWorker" in navigator)) {
        console.warn("⚠️ Service workers are not supported.");
        return;
      }

      // ✅ Register the service worker
      const registration =
        await navigator.serviceWorker.register("/service-worker.js");
      console.log("✅ Service Worker Registered:", registration);

      // ✅ Request Notification Permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("❌ Notifications permission denied.");
        return;
      }

      console.log("🛠 VAPID Key:", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

      // ✅ Subscribe the user to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      console.log("✅ Push Subscription Created:", subscription);

      // ✅ Send subscription to backend
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
    }

    subscribeUser();
  }, []);

  return null;
}

// Helper function to convert VAPID public key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}
