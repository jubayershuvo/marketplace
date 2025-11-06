import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { getUser } from "@/lib/getUser";
import { User } from "@/types/Profile";

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      firstName,
      lastName,
      displayName,
      companyName,
      avatar,
      location,
      skills,
      languages,
      education,
      certifications,
    } = body;

    // Find user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update basic fields (common to all users)
    const updateData: Partial<User> = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      avatar: avatar || user.avatar,
      location: location || user.location,
    };

    // Update user type specific fields
    if (user.userType === "freelancer") {
      updateData.displayName = displayName || user.displayName;
      updateData.skills = skills || user.skills;
      updateData.languages = languages || user.languages;
      updateData.education = education || user.education;
      updateData.certifications = certifications || user.certifications;
    } else if (user.userType === "client") {
      updateData.companyName = companyName || user.companyName;
    }

    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select(
      "-password -refreshToken -resetPasswordToken -resetPasswordExpire"
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
