import { PrismaClient } from "@prisma/client";
import webPush from "web-push";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// Ensure VAPID keys are loaded
if (
  !process.env.VAPID_PRIVATE_KEY ||
  !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  !process.env.EMAIL_VAPID
) {
  throw new Error("Missing VAPID keys in environment variables.");
}

webPush.setVapidDetails(
  process.env.EMAIL_VAPID!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Function to check due reminders and send notifications
export async function checkDueReminders() {
  console.log("🔍 Checking due reminders...");

  const now = new Date();
  const dueReminders = await prisma.reminder.findMany({
    where: { dueDate: { lte: now } }, // Find reminders due now or earlier
    include: { idea: true },
  });

  for (const reminder of dueReminders) {
    console.log(`📢 Sending notification for reminder: ${reminder.message}`);

    // ✅ Retrieve push subscriptions from the correct model
    const subscriptions = await prisma.subscription.findMany();

    if (subscriptions.length === 0) {
      console.warn("⚠️ No subscriptions found, skipping notifications.");
      continue;
    }

    // ✅ Send push notification to each subscriber
    for (const sub of subscriptions) {
      if (!sub.endpoint || !sub.p256dh || !sub.auth) {
        console.warn(`⚠️ Invalid subscription: ${JSON.stringify(sub)}`);
        continue;
      }

      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            title: "Reminder",
            message: reminder.message,
          })
        );
        console.log(`✅ Notification sent to ${sub.endpoint}`);
      } catch (error) {
        console.error("❌ Error sending push notification:", error);
      }
    }

    // ✅ Delete or mark reminders as "sent" to avoid duplicates
    await prisma.reminder.delete({ where: { id: reminder.id } });
  }
}
