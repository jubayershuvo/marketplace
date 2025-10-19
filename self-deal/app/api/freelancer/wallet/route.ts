import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import OrderModel from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const orders = await OrderModel.find({
      freelancer: user._id,
    });

    const totalEarned = orders.reduce(
      (acc, curr) => acc + (curr.status === "completed" ? curr.amount : 0),
      0
    );
    const pendingBalance = orders.reduce(
      (acc, curr) => acc + (curr.status === "paid" ? curr.amount : 0),
      0
    );
    const availableForWithdrawal = user.balance + totalEarned - pendingBalance;

    return NextResponse.json({
      balance: 15750.5,
      pendingBalance: 2340.0,
      totalEarned: 45200.75,
      totalWithdrawn: 32000.0,
      availableForWithdrawal: 13410.5,
      currency: "BDT",
      lastUpdated: "2024-01-15T10:30:00Z",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get freelancer wallet" },
      { status: 500 }
    );
  }
}
