import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  client: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  gig: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
  deliveries?: mongoose.Types.ObjectId[];
  totalAmount: number;
  status: "paid" | "completed" | "cancelled";
  transactionId?: string;
  notes?: string;
  lastMessage?: mongoose.Types.ObjectId; // Reference to Message model
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    deliveries: [{ type: Schema.Types.ObjectId, ref: "Delivery" }],
    freelancer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gig: { type: Schema.Types.ObjectId, ref: "Gig", required: true },
    totalAmount: { type: Number, required: true },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    status: {
      type: String,
      enum: ["paid", "completed", "cancelled"],
      default: "paid",
    },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
    notes: { type: String },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const OrderModel =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default OrderModel;
