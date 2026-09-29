import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 1, maxlength: 30 },
    message: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
