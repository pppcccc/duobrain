"use client";
import { useEffect } from "react";
import Note from "@/components/ui/note";
import AllNotes from "@/components/ui/allnotes";
import PushNotifications from "@/components/notifications/pushnotification";

export default function Home() {
  useEffect(() => {
    fetch("/api/socket"); // This will initialize the Socket.io server if it hasn't already been
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <PushNotifications />

      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-3xl font-bold self-center">Duobrain 🧠</h1>

        <div className="flex flex-row gap-12 justify-center">
          <AllNotes />
          <Note />
        </div>
      </main>
    </div>
  );
}
