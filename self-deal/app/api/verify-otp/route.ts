import { NextResponse } from "next/server";
import User from "@/models/User";
import { verifyOtp } from "@/lib/otp";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  await connectDB();
  console.log("Email:", email, "OTP:", otp);

  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const isValid = verifyOtp(otp, email);
  if (!isValid)
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 400 }
    );
  user.isEmailVerified = true;
  await user.save();
  const newData = await User.findOne({ email });
  return NextResponse.json({ user: newData }, { status: 200 });
}
