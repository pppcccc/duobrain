import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
    }

    const newIdea = await prisma.idea.create({
      data: {
        title: content.substring(0, 50),
        content,
      },
    });

    // Get WebSocket instance and emit event
    if ((global as any).io) {
      (global as any).io.emit("new-idea", newIdea); // 🔥 Notify all clients
    }

    return NextResponse.json({ success: true, idea: newIdea }, { status: 201 });
  } catch (error) {
    console.error("Error saving idea:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ideas = await prisma.idea.findMany({
      orderBy: {
        createdAt: "desc", // Sort latest first
      },
    });

    return NextResponse.json({ ideas }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 });
  }
}