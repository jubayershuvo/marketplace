import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPortfolio extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  img: string;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema: Schema<IPortfolio> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    img: { type: String, required: true },
  },
  { timestamps: true }
);

const Portfolio: Model<IPortfolio> =
  mongoose.models.Portfolio || mongoose.model<IPortfolio>("Portfolio", portfolioSchema);
export default Portfolio;
