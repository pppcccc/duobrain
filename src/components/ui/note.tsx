"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Helper map to convert selection to offset (in seconds)
const REMINDER_OFFSETS: Record<string, number> = {
  "1m": 60,
  "5m": 300,
  "10m": 600,
  "30m": 1800,
  "1h": 3600,
};

export default function Note() {
  const [note, setNote] = useState("");
  const [reminderOption, setReminderOption] = useState("1m"); // default to "1m"
  const [customMinutes, setCustomMinutes] = useState(""); // for "custom" option
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const numCols = 33;

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!note.trim()) {
      setMessage("Note cannot be empty!");
      return;
    }

    // Calculate due date
    let dueDate: Date;
    if (reminderOption === "custom") {
      // For custom, parse the user’s customMinutes input
      const minutes = parseFloat(customMinutes);
      if (isNaN(minutes) || minutes <= 0) {
        setMessage(
          "Please enter a valid number of minutes for the custom reminder."
        );
        return;
      }
      dueDate = new Date(Date.now() + minutes * 60 * 1000);
    } else {
      // Use predefined offsets
      const offsetSeconds = REMINDER_OFFSETS[reminderOption] || 60; // fallback to 1m
      dueDate = new Date(Date.now() + offsetSeconds * 1000);
    }

    setLoading(true);
    setMessage("");

    try {
      // Call your /api/reminders endpoint
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: note,
          dueDate, // pass the computed Date
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save reminder.");
      }

      setMessage("Reminder saved successfully! 🎉");
      setNote("");
      setCustomMinutes("");
      setReminderOption("1m"); // reset to default if you want
    } catch (error: any) {
      setMessage(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmission} className="flex flex-col gap-4">
      {/* Textarea for the note content */}
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

      {/* Select for reminder time */}
      <label className="text-sm font-semibold">Reminder Time</label>
      <select
        value={reminderOption}
        onChange={(e) => setReminderOption(e.target.value)}
        className="p-2 border rounded-md bg-gray-200 dark:bg-gray-800"
      >
        <option value="1m">In 1 minute</option>
        <option value="5m">In 5 minutes</option>
        <option value="10m">In 10 minutes</option>
        <option value="30m">In 30 minutes</option>
        <option value="1h">In 1 hour</option>
        <option value="custom">Custom</option>
      </select>

      {/* Show custom input only if "custom" is selected */}
      {reminderOption === "custom" && (
        <div>
          <label className="text-sm font-semibold">Enter custom minutes</label>
          <input
            type="number"
            min={1}
            placeholder="e.g. 15"
            className="p-2 border rounded-md bg-gray-200 dark:bg-gray-800"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
          />
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Submit"}
      </Button>

      {message && <p className="text-sm text-gray-500">{message}</p>}
    </form>
  );
}
