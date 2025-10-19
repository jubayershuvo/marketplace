import mongoose, { ObjectId, Schema, Document } from "mongoose";

interface Transaction extends Document {
  user: ObjectId;
  type: "credit" | "debit";
  amount: number;
  description?: string;
  status: "completed" | "pending" | "failed";
  date: Date;
  order?: ObjectId;
  payment?: ObjectId ;
  client?: ObjectId;
  method: "order_payment" | "withdrawal" | "refund" | "bonus" | "fee";
}

const transactionSchema = new Schema<Transaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    status: { type: String, enum: ["completed", "pending", "failed"], default: "pending" },
    date: { type: Date, default: Date.now },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    client: { type: Schema.Types.ObjectId, ref: "User" },
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },
    method: {
      type: String,
      enum: ["order_payment", "withdrawal", "refund", "bonus", "fee"],
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model<Transaction>("Transaction", transactionSchema);

export default TransactionModel;
