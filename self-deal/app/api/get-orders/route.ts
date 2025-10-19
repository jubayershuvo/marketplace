import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import OrderModel from "@/models/Order";
import { connectDB } from "@/lib/mongodb";
import "@/models/Gig";   // 👈 force schema registration
import "@/models/User"; 
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (!["client", "freelancer"].includes(user.userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    const orders = await OrderModel.find({
      [user.userType]: user._id,
    }).populate("gig", "title")
      .populate("client", "name email avatar level rating userType username location firstName lastName")
      .populate("freelancer", "name email avatar level rating userType username location firstName lastName" );

    return NextResponse.json({ orders });
  } catch (error: unknown) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to get orders", details: (error as Error).message },
      { status: 500 }
    );
  }
}
