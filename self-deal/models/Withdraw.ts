import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface IWithdraw extends Document {
  user: ObjectId;
  transaction: ObjectId;
  amount: number;
  fee: number;
  method: "bkash" | "nagad";
  number: string;
  currency: string;
  status: "pending" | "completed" | "rejected";
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawSchema = new Schema<IWithdraw>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      unique: true // Each transaction can only have one withdrawal
    },
    amount: {
      type: Number,
      required: true,
      min: [10, "Minimum withdrawal is 10 BDT"],
    },
    fee: { 
      type: Number, 
      required: true, 
      min: [0, "Fee cannot be negative"],
      default: 0 
    },
    method: { 
      type: String, 
      enum: ["bkash", "nagad"], 
      required: true 
    },
    number: {
      type: String,
      required: true,
      match: [/^(01[3-9]\d{8})$/, "Invalid Bangladesh phone number format"],
      trim: true
    },
    currency: { 
      type: String, 
      required: true, 
      uppercase: true, 
      enum: ["BDT"],
      default: "BDT" 
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
      index: true
    },
    note: { 
      type: String, 
      default: "",
      trim: true 
    },
  },
  { 
    timestamps: true, 
  }
);

// Compound indexes for common queries
withdrawSchema.index({ user: 1, status: 1 });
withdrawSchema.index({ createdAt: -1 });
withdrawSchema.index({ user: 1, createdAt: -1 });


const Withdraw =
  mongoose.models.Withdraw || 
  mongoose.model<IWithdraw>("Withdraw", withdrawSchema);

export default Withdraw;