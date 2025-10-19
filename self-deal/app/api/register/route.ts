// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User"; // already typed with IUser
import { generateTokens } from "../login/route";
import sendOTPEmail from "@/lib/emailOtp";

// Email regex validator
const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateUsername = (username: string): boolean =>
  !/^\d|[^a-zA-Z0-9]/.test(username) && username.length >= 3;

interface RegisterRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  userType: "freelancer" | "client";
  location: ILocation;
}
interface ILocation {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterRequestBody;
    const {
      firstName,
      lastName,
      email,
      password,
      userType,
      username,
      location,
    } = body;

    // ✅ Input validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !userType ||
      !username
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        { message: "Invalid username format" },
        { status: 400 }
      );
    }

    await connectDB();

    const emailLower = email.toLowerCase().trim();
    const usernameLower = username.toLowerCase().trim();

    // ✅ Check existing user
    const existingUserByEmail = await User.findOne({
      email: emailLower,
    }).lean();
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }
    // ✅ Check existing user
    const existingUserByUsername = await User.findOne({
      username: usernameLower,
    }).lean();
    if (existingUserByUsername) {
      return NextResponse.json(
        { message: "Username already registered" },
        { status: 409 }
      );
    }

    // ✅ Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email: emailLower,
      username: usernameLower,
      password,
      userType,
      isEmailVerified: false,
      isActive: true,
      location: location.country,
      lastLoginIp: location.ip,
      lastLogin: new Date(),
    });
    const { accessToken, refreshToken } = generateTokens(
      newUser._id.toString(),
      newUser.email
    );
    const user = await User.findById(newUser._id).select("-password");
   
    await sendOTPEmail({
      to: emailLower,
      userName: user?.username,
      expiryMinutes: 10,
    });
    const responseBody = {
      message: "Login successful",
      token: accessToken,
      refreshToken,
      user,
    };

    const res = NextResponse.json(responseBody, { status: 200 });
    res.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    res.cookies.set({
      name: "token",
      value: accessToken,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
