import mongoose from "mongoose";

const RawSchema = new mongoose.Schema(
  {
    raw:{type: String, required: true}
  },
  { timestamps: true }
);

export default mongoose.models.Raw ||
  mongoose.model("Raw", RawSchema);
