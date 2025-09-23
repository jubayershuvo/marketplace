import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  freelancer: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  clientName: string;
  clientImg?: string;
  rating: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema: Schema<IReview> = new Schema(
  {
    freelancer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clientName: { type: String, required: true },
    clientImg: { type: String },
    rating: { type: Number, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
export default Review;
