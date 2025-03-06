"use client"; // ✅ Ensure it's a Client Component

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Note() {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const numCols = 33;

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload

    if (!note.trim()) {
      setMessage("Note cannot be empty!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: note }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save idea.");
      }

      setMessage("Idea saved successfully! 🎉");
      setNote(""); // Clear input field after saving
    } catch (error: any) {
      setMessage(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmission} className="flex flex-col gap-4">
      <textarea
        autoFocus
        minLength={1}
        name="noteContent"
        placeholder="What are you thinking?"
        className="p-2 border rounded-md bg-gray-200 dark:bg-gray-800 resize-none"
        cols={numCols}
        rows={numCols / 4}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button type="submit" name="submitNote" disabled={loading}>
        {loading ? "Saving..." : "Submit"}
      </Button>
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </form>
  );
}
