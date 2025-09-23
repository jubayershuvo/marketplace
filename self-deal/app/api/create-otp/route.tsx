import { NextResponse } from "next/server";
import User from "@/models/User";
import { generateOtp } from "@/lib/otp";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  const { email } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user || user?.isEmailVerified) return NextResponse.json({ error: "Wrong request" }, { status: 404 });

  const otp = generateOtp(email);
  console.log("Generated OTP:", otp);

  return NextResponse.json({ success: true }, { status: 200 });
}
