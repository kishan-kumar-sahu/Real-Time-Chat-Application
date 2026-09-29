import Message from "../models/Message.js";

const onlineUsers = new Map();

const emitUsers = (io) => {
  io.emit("users:update", [...onlineUsers.values()]);
};

export const registerChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("user:join", (username) => {
      const clean = String(username || "").trim().slice(0, 30);

      if (!clean) {
        socket.emit("chat:error", { message: "A username is required." });
        return;
      }

      socket.data.username = clean;
      onlineUsers.set(socket.id, { username: clean, socketId: socket.id });

      socket.broadcast.emit("user:joined", { username: clean });
      emitUsers(io);
    });

    socket.on("message:send", async ({ message } = {}) => {
      try {
        const username = String(socket.data.username || "").trim();
        const cleanMessage = String(message || "").trim();

        if (!username || !cleanMessage) {
          socket.emit("chat:error", { message: "Message cannot be empty." });
          return;
        }

        const saved = await Message.create({
          username,
          message: cleanMessage.slice(0, 1000)
        });

        io.emit("message:new", saved);
      } catch (error) {
        console.error(error);
        socket.emit("chat:error", { message: "Message could not be sent." });
      }
    });

    socket.on("typing:start", () => {
      if (socket.data.username) {
        socket.broadcast.emit("typing:update", {
          username: socket.data.username,
          isTyping: true
        });
      }
    });

    socket.on("typing:stop", () => {
      if (socket.data.username) {
        socket.broadcast.emit("typing:update", {
          username: socket.data.username,
          isTyping: false
        });
      }
    });

    socket.on("disconnect", () => {
      const username = socket.data.username;
      onlineUsers.delete(socket.id);

      if (username) {
        socket.broadcast.emit("user:left", { username });
      }

      emitUsers(io);
      console.log("Socket disconnected:", socket.id);
    });
  });
};
