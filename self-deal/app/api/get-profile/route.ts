// app/api/user/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUser } from "@/lib/getUser";
import User from "@/models/User";
import MessageModel from "@/models/Message";
import OrderModel from "@/models/Order";
import { calculateAverageReplyDelay } from "@/lib/calculateReplyDelay";


// GET /api/user?id=USER_ID
export async function GET(req: Request) {
  try {
    await connectDB();

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      const unreadedMessagesCount = await MessageModel.countDocuments({
        receiver: user._id,
        status: "sent",
      });
      const ordersCount = await OrderModel.countDocuments({
        $or: [{ user: user._id }, { freelancer: user._id }],
        status: "paid",
      });

      const { overallAverageReadable } = await calculateAverageReplyDelay(user._id);
      if (overallAverageReadable !== '0 seconds') {
        user.responseTime = overallAverageReadable;
      }
      return NextResponse.json({ user, unreadedMessagesCount, ordersCount });
    }

    const profile = await User.findOne({
      $or: [{ _id: id }, { username: id }],
    }).select("-password");
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ user: profile });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get profile data" },
      { status: 500 }
    );
  }
}
