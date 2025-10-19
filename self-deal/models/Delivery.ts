import mongoose, { Schema, Document } from "mongoose";

export interface IDelivery extends Document {
  order: Schema.Types.ObjectId;
  filePath: string;
  status: "pending" | "delivered";
  decision?: "accepted" | "rejected" | null;
}

const deliverySchema = new Schema<IDelivery>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    filePath: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "delivered"],
      default: "pending",
    },
    decision: {
      type: String,
      enum: ["accepted", "rejected", null],
      default: null,
    },
  },
  { timestamps: true }
);

export const DeliveryModel =
  mongoose.models.Delivery ||
  mongoose.model<IDelivery>("Delivery", deliverySchema);
