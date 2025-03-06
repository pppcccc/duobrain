"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const formatDate = (dateString: string) => {
  return new Date(dateString).toISOString().split("T")[0];
};

export default function AllNotes() {
  const [notesByDate, setNotesByDate] = useState<{ [date: string]: { id: string; content: string }[] }>({});

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("/api/ideas");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch notes");
        }

        // 🛠 Group notes by date & sort them (most recent first)
        const groupedNotes: { [date: string]: { id: string; content: string }[] } = {};
        data.ideas.forEach((note: { id: string; content: string; createdAt: string }) => {
          const date = formatDate(note.createdAt);
          if (!groupedNotes[date]) {
            groupedNotes[date] = [];
          }
          groupedNotes[date].push({ id: note.id, content: note.content });
        });

        // 🛠 Sort dates in descending order (newest dates first)
        const sortedNotes = Object.keys(groupedNotes)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Newest first
          .reduce((acc, key) => ({ ...acc, [key]: groupedNotes[key] }), {});

        setNotesByDate(sortedNotes);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    fetchNotes();

    // WebSockets for real-time updates
    const socket = io("http://localhost:3000", { path: "/api/socket" });

    // 🔥 Add new notes in real-time & keep most recent at the top
    socket.on("new-idea", (newIdea) => {
      setNotesByDate((prev) => {
        const date = formatDate(newIdea.createdAt);
        const updatedNotes = {
          ...prev,
          [date]: prev[date] ? [newIdea, ...prev[date]] : [newIdea], // 🔥 Newest first
        };

        // 🛠 Resort the notes after adding the new one
        return Object.keys(updatedNotes)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Newest first
          .reduce((acc, key) => ({ ...acc, [key]: updatedNotes[key] }), {});
      });
    });

    // 🔥 Remove deleted notes in real-time & keep most recent at the top
    socket.on("delete-idea", ({ id }) => {
      setNotesByDate((prev) => {
        const updated = { ...prev };
        for (const date in updated) {
          updated[date] = updated[date].filter((note) => note.id !== id);
          if (updated[date].length === 0) {
            delete updated[date];
          }
        }
        // 🛠 Resort the remaining notes
        return Object.keys(updated)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Newest first
          .reduce((acc, key) => ({ ...acc, [key]: updated[key] }), {});
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(notesByDate).map(([date, notes]) => (
        <AccordionItem key={date} value={date}>
          <AccordionTrigger>{date}</AccordionTrigger>
          <AccordionContent>
            {notes.map((note) => (
              <Link key={note.id} href={`/note/${note.id}`} className="block p-2 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                {note.content.length > 25 ? note.content.substring(0, 25) + "..." : note.content}
              </Link>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
