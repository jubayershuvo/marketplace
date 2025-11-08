import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import sendOTPEmail from "@/lib/emailOtp";

export async function POST(req: Request) {
  const { email } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user || user?.isEmailVerified)
    return NextResponse.json({ error: "Wrong request" }, { status: 404 });

  sendOTPEmail({ to: email, userName: user.username, expiryMinutes: 10 });

  return NextResponse.json({ success: true }, { status: 200 });
}
