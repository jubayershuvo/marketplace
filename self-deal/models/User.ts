// models/User.ts
import mongoose, { Schema, Document, Model, ObjectId } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  // Common fields
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username: string;
  password: string;
  userType: "freelancer" | "client";
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isBanned: boolean;
  isActive: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  lastLoginIp?: string;
  createdAt: Date;
  updatedAt: Date;
  location?: string;
  responseTime?: string;
  lastSeen?: Date;

  // Freelancer fields
  withdrawableBalance?: number;
  balance: number;
  pendingBalance?: number;

  pendingOrders?: number;
  displayName?: string;
  description?: string;
  skills?: string[];
  languages?: string[];
  education?: string[];
  certifications?: string[];
  rating?: number;
  completedOrders: number;
  earnings?: number;
  lastDelivery?: string;
  reviews?: ObjectId[];
  reviewsCount?: number;

  // Client fields
  companyName?: string;
  companyDescription?: string;
  spent?: number;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    // ---------- Common ----------
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    location: { type: String },
    phone: { type: String },
    password: { type: String, required: true, select: false },
    userType: {
      type: String,
      enum: ["freelancer", "client"],
      required: true,
    },
    avatar: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLogin: { type: Date },
    lastLoginIp: { type: String },
    responseTime: { type: String, default: "1 hour" },
    lastDelivery: { type: String, default: "No deliveries" },
    lastSeen: { type: Date, default: Date.now },

    // ---------- Freelancer ----------
    withdrawableBalance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    displayName: { type: String, trim: true },
    description: { type: String, maxlength: 2000 },
    skills: [{ type: String }],
    languages: [{ type: String }],
    education: [{ type: String }],
    certifications: [{ type: String }],
    rating: { type: Number, default: 2, min: 2, max: 5 },
    completedOrders: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    reviewsCount: { type: Number, default: 0 },
    pendingOrders: { type: Number, default: 0 },

    // ---------- Client ----------
    companyName: { type: String, trim: true },
    companyDescription: { type: String, maxlength: 1000 },
    spent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ---------- Password Handling ----------
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ---------- Model ----------
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
