// lib/getUser.ts
import { cookies, headers } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "@/models/User";

interface TokenPayload extends JwtPayload {
  userId: string;
}

export async function getUser() {
  try {
    const authHeader =(await headers()).get("authorization"); // ✅ no await
    const cookieStore = cookies(); // ✅ no await


    let token: string | null = null;

    // 1. From Bearer
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. From Cookie
    if (!token) {
      token =  (await cookieStore).get("token")?.value || null;
    }

  

    if (!token) {
      console.warn("⚠️ No token found in header or cookie");
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    console.log("🔎 Decoded JWT:", decoded);

    if (!decoded.userId) {
      return null;
    }

    const user = await User.findById(decoded.userId).lean();

    if (!user) {

      return null;
    }

    console.log("✅ User fetched:", user);
    return user;
  } catch (err) {
    console.error("❌ getUser error:");
    return null;
  }
}
