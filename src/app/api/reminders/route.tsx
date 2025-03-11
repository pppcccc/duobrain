import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Parse JSON body from the request
    const { message, dueDate } = await req.json();

    if (!message || !dueDate) {
      return NextResponse.json(
        { error: "Missing reminder data" },
        { status: 400 }
      );
    }

    // Step 1: Create a new idea (note)
    const newIdea = await prisma.idea.create({
      data: {
        title: message.substring(0, 50), // First 50 chars as title
        content: message,
      },
    });

    // Step 2: Create a reminder linked to the new idea
    const reminder = await prisma.reminder.create({
      data: {
        message,
        dueDate: new Date(dueDate),
        ideaId: newIdea.id, // ✅ Link the reminder to the idea
      },
    });

    // Emit WebSocket event (if available)
    if ((global as any).io) {
      (global as any).io.emit("new-idea", newIdea);
      (global as any).io.emit("new-reminder", reminder);
    }

    return NextResponse.json(
      { success: true, idea: newIdea, reminder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving idea and reminder:", error);
    return NextResponse.json(
      { error: "Error saving idea and reminder" },
      { status: 500 }
    );
  }
}
