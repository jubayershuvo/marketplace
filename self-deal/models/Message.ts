import mongoose, { Schema, ObjectId } from "mongoose";

interface Message {
  _id: string;
  conversation?: string;
  sender: ObjectId;
  receiver: ObjectId;
  content: string; // Changed from 'text'
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  type: "text" | "image" | "file";
  status: "sent" | "delivered" | "read" | "error";
  createdAt: string;
  updatedAt: string;
  sending?: boolean;
}

const messageSchema = new Schema<Message>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "delivered",
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const MessageModel =
  mongoose.models.Message || mongoose.model<Message>("Message", messageSchema);

export default MessageModel;
