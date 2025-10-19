import mongoose, { ObjectId, Schema, Document } from "mongoose";

interface Transaction extends Document {
  user: ObjectId;
  amount: number;
  trxId: string;
  type: "deposit" | "order";
  method: string;
}

const transactionSchema = new Schema<Transaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["deposit", "order"], required: true },
    trxId: { type: String, required: true },
    method: { type: String },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const PaymentModel =
  mongoose.models.Payment ||
  mongoose.model<Transaction>("Payment", transactionSchema);

export default PaymentModel;
