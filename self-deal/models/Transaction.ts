import mongoose, { ObjectId, Schema, Document } from "mongoose";

interface Transaction extends Document {
  user: ObjectId;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  date: Date;
  order?: ObjectId;
  payment?: ObjectId;
  client?: ObjectId;
  method: "order_payment" | "withdrawal" | "refund" | "bonus" | "fee";
}

const transactionSchema = new Schema<Transaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "pending",
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    method: {
      type: String,
      enum: [
        "order_payment",
        "withdrawal",
        "refund",
        "bonus",
        "fee",
        "admin_payment",
      ],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
transactionSchema.index({ user: 1, status: 1, date: -1 });
transactionSchema.index({ user: 1, method: 1, date: -1 });

const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model<Transaction>("Transaction", transactionSchema);

export default TransactionModel;
