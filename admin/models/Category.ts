import mongoose, { Schema, Document } from "mongoose";

export interface ISubCategory {
  value: string;
  label: string;
}

export interface ICategory extends Document {
  value: string;
  label: string;
  subcategories: ISubCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const subCategorySchema = new Schema<ISubCategory>(
  {
    value: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
  },
  { _id: false } // prevents automatic _id creation for each subcategory
);

const categorySchema = new Schema<ICategory>(
  {
    value: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    subcategories: { type: [subCategorySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);
