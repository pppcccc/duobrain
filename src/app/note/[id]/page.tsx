"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotePage() {
  const [note, setNote] = useState<{ id: string; content: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;

      try {
        console.log("Fetching note from API:", `/api/ideas/${id}`);
        const response = await fetch(`/api/ideas/${id}`);
        const data = await response.json();

        if (!response.ok) {
          console.error("❌ Error fetching note:", data.error);
        } else {
          console.log("✅ Note fetched:", data.note);
          setNote(data.note);
        }

        setLoading(false);
      } catch (error) {
        console.error("❌ Failed to fetch note:", error);
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      console.log("Deleting note:", id);
      const response = await fetch(`/api/ideas/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      console.log("✅ Note deleted");
      router.push("/"); // Redirect to home page
    } catch (error) {
      console.error("❌ Error deleting note:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!note) return <p>Note not found.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* 🔙 Back Button */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/">
          <Button variant="outline">← Back</Button>
        </Link>
      </div>

      {/* 📝 Note Content */}
      <h1 className="text-2xl font-bold mb-4">Note</h1>
      <p className="border p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
        {note.content}
      </p>

      {/* 🗑️ Delete Button */}
      <Button
        className="mt-4 bg-red-600 hover:bg-red-700"
        onClick={() => setConfirmDelete(true)}
      >
        Delete Note
      </Button>

      {/* ⚠️ Delete Confirmation Popup */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
            <p className="mb-4">Are you sure you want to delete this note?</p>
            <div className="flex gap-4">
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                Yes, Delete
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
