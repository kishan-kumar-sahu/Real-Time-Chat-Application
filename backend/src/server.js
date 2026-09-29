import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import { registerChatSocket } from "./sockets/chatSocket.js";

const PORT = process.env.PORT || 5000;

await connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

registerChatSocket(io);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
