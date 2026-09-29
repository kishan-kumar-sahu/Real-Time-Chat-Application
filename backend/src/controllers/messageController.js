import Message from "../models/Message.js";

export const getMessages = async (req, res, next) => {
  try {
    const rawLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;

    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, count: messages.length, messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (req, res, next) => {
  try {
    const username = String(req.body.username || "").trim();
    const message = String(req.body.message || "").trim();

    if (!username || !message) {
      return res.status(400).json({ success: false, message: "Username and message are required." });
    }

    const saved = await Message.create({ username, message });
    res.status(201).json({ success: true, message: saved });
  } catch (error) {
    next(error);
  }
};
