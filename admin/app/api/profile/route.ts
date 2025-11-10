import { getAdmin } from "@/lib/getAdmin";
import { connectDB } from "@/lib/mongodb";
import AdminModel from "@/models/Admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "You are not authorized" },
        { status: 401 }
      );
    }
    return NextResponse.json({ admin });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const admin = await getAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "You are not authorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, currentPassword, newPassword, confirmPassword } = body;

  // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required to set new password" },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { success: false, error: "New passwords do not match" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = admin.comparePassword(currentPassword);

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash new password
      admin.password = newPassword;
    }

    if(name) admin.name = name;
    if(email) admin.email = email;

    await admin.save();
    const updatedAdmin = await AdminModel.findById(admin._id);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      admin: updatedAdmin,
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}