import bcrypt from "bcryptjs";
import mongoose, { Schema, Model, model, ObjectId, Document } from "mongoose";

// Interface for Admin document
export interface IAdmin extends Document {

  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  role: "admin" | "moderator";
  createdAt?: Date;
  updatedAt?: Date;
  lockUntil?: Date;
  loginAttempts?: number;
  lastLogin?: Date;
  lastLoginIp?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema definition
const adminSchema = new Schema<IAdmin>(
  {
    name: { 
      type: String, 
      default: "Admin", 
      trim: true
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6
    },
    role: { 
      type: String, 
      required: true, 
      enum: ["admin", "moderator"],
      default: "admin"
    },
    lockUntil: { 
      type: Date, 
      default: null 
    },
    loginAttempts: { 
      type: Number, 
      default: 0,
      min: 0
    },
    lastLogin: { 
      type: Date, 
      default: null 
    },
    lastLoginIp: { 
      type: String, 
      default: null 
    },
  },
  { 
    timestamps: true,
  }
);

// ---------- Indexes ----------
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ lockUntil: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup

// ---------- Password Hashing ----------
adminSchema.pre<IAdmin>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error("Error hashing password"));
  }
});

// ---------- Password Comparison Method ----------
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ---------- Model ----------
const AdminModel: Model<IAdmin> =
  mongoose.models.Admin || model<IAdmin>("Admin", adminSchema);

export default AdminModel;