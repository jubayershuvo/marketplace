import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IMessage extends Document {
  _id: string;
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
    size?: number;
  }>;
  type: "text" | "image" | "file" | "system";
  status: "sent" | "delivered" | "read" | "error";
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    sender: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    receiver: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    attachments: [{
      url: { type: String, required: true },
      type: { type: String, required: true },
      name: { type: String, required: true },
      size: { type: Number }
    }],
    type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "error"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });

const MessageModel = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default MessageModel;