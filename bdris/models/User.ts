import { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  password: string;

  isEmailVerified: boolean;
  isBanned: boolean;
  isActive: boolean;

  loginAttempts: number;

  lastLogin?: Date;
  lastSeen?: Date;
  lastLoginIp?: string;
  location?: string;
  lockUntil?: Date;

  balance: number;

  createdAt: Date;
  updatedAt: Date;

  comparePassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },

    avatar: { type: String, default: "" },
    password: { type: String, required: true },

    isEmailVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    loginAttempts: { type: Number, default: 0 },

    lastLogin: { type: Date, default: null },
    lastSeen: { type: Date, default: null },
    lastLoginIp: { type: String, default: "" },
    location: { type: String, default: "" },
    lockUntil: { type: Date, default: null },

    balance: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

/**
 * 🔐 Hash password before saving
 */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

/**
 * 🔍 Method to compare passwords
 */
UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Fix for Next.js hot reload
const User = models.User || model<IUser>("User", UserSchema);

export default User;
