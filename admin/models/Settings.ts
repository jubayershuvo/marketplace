import mongoose from "mongoose";

export interface ISettings extends mongoose.Document {
    bkash: string;
    nagad: string;
    withdraw_fee_percentage: number;
    min_withdraw_amount: number;
    min_fee: number;

}

const settingsSchema = new mongoose.Schema<ISettings>(
  {
    bkash: { type: String, trim: true, default: "" },
    nagad: { type: String, trim: true, default: "" },
    withdraw_fee_percentage: { type: Number, default: 0, min: 0 },
    min_withdraw_amount: { type: Number, default: 0, min: 0 },
    min_fee: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const SettingsModel =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", settingsSchema);
