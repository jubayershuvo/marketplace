// lib/getUser.ts
import { cookies, headers } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import AdminModel from "@/models/Admin";

interface TokenPayload extends JwtPayload {
  userId: string;
}

export async function getAdmin() {
  try {
    const headerList = headers();
    const cookieStore = cookies();

    // 1️⃣ Try from Bearer token (Authorization header)
    const authHeader = (await headerList).get("authorization");
    let token: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2️⃣ Fallback to cookie token
    if (!token) {
      token = (await cookieStore).get("adminToken")?.value || null;
    }

    // 3️⃣ If no token found → unauthenticated
    if (!token) return null;

    // 4️⃣ Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    if (!decoded?.userId) return null;

    // 5️⃣ Fetch user
    const user = await AdminModel.findById(decoded.userId).select('+password');

    if (!user) return null;

    // 6️⃣ Update lastSeen (non-blocking)
    AdminModel.findByIdAndUpdate(decoded.userId, { lastSeen: new Date() }).catch(() =>
      console.warn("⚠️ Failed to update user lastSeen")
    );

    return user;
  } catch (err) {
    console.error("❌ getUser error:", err);
    return null;
  }
}
