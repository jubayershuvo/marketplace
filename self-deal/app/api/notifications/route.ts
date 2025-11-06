// app/api/notifications/route.ts
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
// app/api/notifications/route.ts - Add PATCH method
export async function PATCH(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, markAll } = await req.json();

    if (markAll) {
      // Mark all notifications as read
      await NotificationModel.updateMany(
        { user: user._id, isRead: false },
        { $set: { isRead: true } }
      );
    } else if (notificationId) {
      // Mark single notification as read
      await NotificationModel.findByIdAndUpdate(notificationId, {
        $set: { isRead: true },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}