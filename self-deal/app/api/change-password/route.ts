// app/api/change-password/route.ts
import { getUser } from "@/lib/getUser";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    // Parse body
    const { currentPassword, newPassword } = await req.json();

    // Basic validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current and new passwords are required." },
        { status: 400 }
      );
    }

    // Ensure DB connection
    await connectDB();

    // Get the currently logged-in user
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: user not found." },
        { status: 401 }
      );
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid current password." },
        { status: 400 }
      );
    }

    // Prevent same password reuse
    const isSame = newPassword === currentPassword;
    if (isSame) {
      return NextResponse.json(
        { error: "New password cannot be the same as the current password." },
        { status: 400 }
      );
    }


    // Update and save user
    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
