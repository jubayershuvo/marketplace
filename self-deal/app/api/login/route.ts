// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import { generateOtp } from "@/lib/otp";

// Rate limiting store (for demo; use Redis in production)
const rateLimitStore = new Map<string, number[]>();

const rateLimit = (
  identifier: string,
  limit = 5,
  windowMs = 15 * 60 * 1000
): boolean => {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitStore.has(identifier)) rateLimitStore.set(identifier, []);

  const attempts = rateLimitStore
    .get(identifier)!
    .filter((t) => t > windowStart);
  if (attempts.length >= limit) return false;

  attempts.push(now);
  rateLimitStore.set(identifier, attempts);
  return true;
};

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const generateTokens = (
  userId: string,
  email: string,
  rememberMe = false
) => {
  const payload = { userId, email, type: "access" } as const;

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    {
      expiresIn: rememberMe ? "30d" : "1d",
    }
  );

  const refreshToken = jwt.sign(
    { ...payload, type: "refresh" },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
};

interface LoginRequestBody {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: LoginRequestBody = await req.json();
    const { email, password, rememberMe = false } = body;

    if (!email || !password)
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    if (!validateEmail(email))
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });

    const clientIpHeader = req.headers.get("x-forwarded-for");
    const ip = clientIpHeader ? clientIpHeader.split(",")[0].trim() : "unknown";

    console.log(`Login attempt from ${ip} (${email})`);

    const emailLower = email.toLowerCase().trim();

    if (!rateLimit(ip) || !rateLimit(emailLower)) {
      return NextResponse.json(
        { message: "Too many attempts, try later." },
        { status: 429 }
      );
    }

    await connectDB();

    const user = (await User.findOne({ email: emailLower }).select(
      "+password +isEmailVerified +isActive +loginAttempts +lockUntil"
    )) as IUser | null;

    if (!user)
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );

    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      const lockMinutes = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { message: `Account locked. Try again in ${lockMinutes} minutes.` },
        { status: 423 }
      );
    }

    if (user.isBanned)
      return NextResponse.json(
        { message: "Account banned", isBanned: true },
        { status: 403 }
      );

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const maxAttempts = 5;
      const lockTimeMs = 30 * 60 * 1000;

      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= maxAttempts) {
        user.lockUntil = new Date(Date.now() + lockTimeMs);
        user.loginAttempts = 0;
        await user.save();
        return NextResponse.json(
          { message: "Account locked due to failed attempts" },
          { status: 423 }
        );
      }

      await user.save();
      return NextResponse.json(
        {
          message: `Invalid credentials. ${
            maxAttempts - user.loginAttempts
          } attempts left`,
        },
        { status: 401 }
      );
    }

    // Reset failed attempts
    if (user.loginAttempts || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    user.lastLogin = new Date();
    user.lastLoginIp = ip;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      user.email,
      rememberMe
    );

    const userWithoutPassword = await User.findById(user._id).select(
      "-password"
    );

    if (!userWithoutPassword?.isEmailVerified) {
      const otp = generateOtp(user.email);
      console.log(otp);
    }

    const responseBody = {
      message: "Login successful",
      token: accessToken,
      refreshToken,
      user: userWithoutPassword,
      expiresIn: rememberMe ? "30d" : "1d",
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
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// JWT verification for protected routes
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch {
    return null;
  }
};
