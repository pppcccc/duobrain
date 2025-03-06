import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

// i need to have this in pages when i already do app
// why? god knows.

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if ((res.socket as any).server.io) {
    console.log("Socket.io is already running");
  } else {
    console.log("Setting up Socket.io...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Store on both the res.socket.server and global so other API routes can access it
    (res.socket as any).server.io = io;
    (global as any).io = io;

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
    
  }
  res.end();
}
