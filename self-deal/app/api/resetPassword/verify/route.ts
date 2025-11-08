import { NextResponse } from "next/server";
import User from "@/models/User";
import { verifyOtp } from "@/lib/otp";
import { connectDB } from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const isValid = verifyOtp(otp, email);
  if (!isValid)
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 400 }
    );
  const token = jwt.sign(
    { email: user.email, _id: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  return NextResponse.json({token}, { status: 200 });
}
