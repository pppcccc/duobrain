import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔥 Fetch a single idea by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log("Incoming request for note ID:", params.id); // ✅ Debugging log

  if (!params.id) {
    return NextResponse.json({ error: "No ID provided" }, { status: 400 });
  }

  try {
    const note = await prisma.idea.findUnique({
      where: { id: params.id },
    });

    if (!note) {
      console.log("❌ Note not found for ID:", params.id); // ✅ Debugging log
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    console.log("✅ Found note:", note);
    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching note:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 🔥 Delete an idea by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  console.log("Incoming delete request for ID:", params.id); // ✅ Debugging log

  if (!params.id) {
    return NextResponse.json({ error: "No ID provided" }, { status: 400 });
  }

  try {
    await prisma.idea.delete({
      where: { id: params.id },
    });

    console.log("✅ Note deleted:", params.id);

    // Notify all clients via WebSockets
    if ((global as any).io) {
      (global as any).io.emit("delete-idea", { id: params.id });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}

