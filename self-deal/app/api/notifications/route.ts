import { getUser } from "@/lib/getUser";
import { NotificationModel } from "@/models/Notification";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications =
      (await NotificationModel.find({
        user: user._id,
      }).sort({ createdAt: -1 })) || [];

    const unreadCount = await NotificationModel.countDocuments({
      user: user._id,
      isRead: false,
    });

    return NextResponse.json({ notifications, unreadCount }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
