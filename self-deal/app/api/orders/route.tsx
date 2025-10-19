import { getUser } from "@/lib/getUser";
import OrderModel from "@/models/Order";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const orders = await OrderModel.find({ [user.userType]: user._id });
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get orders" },
      { status: 500 }
    );
  }
}
