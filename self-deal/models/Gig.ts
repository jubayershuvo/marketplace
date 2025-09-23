import mongoose, { Schema, Document, Model, Types } from "mongoose";

// -------- Subdocument Interfaces --------
export interface IReview {
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string; // e.g., "1 week ago"
  helpful: number;
}

export interface IFAQ {
  question: string;
  answer: string;
}

// -------- Main Gig Interface --------
export interface IGig extends Document {
  _id: Types.ObjectId;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  video?: string;
  badge?: string;
  description: string;
  features: string[];
  deliveryTime: string;
  revisions: string;
  category: string;
  subcategory: string;
  tags: string[];
  freelancer: Types.ObjectId; // references User schema
  reviews: Types.DocumentArray<IReview>;
  faq: Types.DocumentArray<IFAQ>;
  createdAt: Date;
  updatedAt: Date;
  
}

// -------- Sub Schemas --------
const reviewSchema = new Schema<IReview>({
  user: { type: String, required: true, trim: true },
  avatar: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1000 },
  date: { type: String, required: true }, // e.g., "1 week ago"
  helpful: { type: Number, default: 0, min: 0 },
});

const faqSchema = new Schema<IFAQ>({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true },
});

// -------- Gig Schema --------
const gigSchema = new Schema<IGig>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    price: { type: Number, required: true, min: 5 },
    originalPrice: { type: Number },
    images: [{ type: String, required: true }],
    video: { type: String },
    badge: { type: String },
    description: { type: String, required: true, maxlength: 5000 },
    features: [{ type: String, required: true }],
    deliveryTime: { type: String, required: true },
    revisions: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, required: true, index: true },
    tags: [{ type: String, required: true }],

    // ✅ Reference to User schema
    freelancer: { type: Schema.Types.ObjectId, ref: "User", required: true },

    reviews: [reviewSchema],
    faq: [faqSchema],
  },
  { timestamps: true }
);

// -------- Indexes --------
gigSchema.index({ category: 1, subcategory: 1, price: 1 });
gigSchema.index({ tags: "text", title: "text", description: "text" });
gigSchema.index({ freelancer: 1 });

const Gig: Model<IGig> =
  mongoose.models.Gig || mongoose.model<IGig>("Gig", gigSchema);

export default Gig;
