import express from "express";
import cors from "cors";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Chat API is running" });
});

app.use("/api/messages", messageRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
