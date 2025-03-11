// src/app/api/ideas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { content, dueDate } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      );
    }

    // Save the idea
    const newIdea = await prisma.idea.create({
      data: {
        title: content.substring(0, 50), // First 50 chars as title
        content,
      },
    });

    // Create a reminder linked to this idea
    const reminder = await prisma.reminder.create({
      data: {
        message: `Reminder for: ${content.substring(0, 50)}`, // Optional formatting
        dueDate: new Date(dueDate),
        ideaId: newIdea.id, // Assuming you have an ideaId field in Reminder
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
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const ideas = await prisma.idea.findMany({
      orderBy: { createdAt: "desc" }, // Sort newest first
    });

    return NextResponse.json({ ideas }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    );
  }
}
