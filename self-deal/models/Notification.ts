import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  message: string;
  isRead: boolean;
  href: string;
}

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    href: { type: String },
  },
  { timestamps: true }
);

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);
