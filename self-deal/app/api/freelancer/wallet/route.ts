import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import OrderModel from "@/models/Order";
import Withdraw from "@/models/Withdraw";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    console.log(user.userType)
    if (user.userType !== "freelancer") {
      return NextResponse.json(
        { error: "Forbidden: Only freelancers can access wallet" },
        { status: 403 }
      );
    }

    const orders = await OrderModel.find({
      freelancer: user._id,
    });

    const withdraws = await Withdraw.find({
      user: user._id,
    });

    const pendingWithdrawals = withdraws
      .filter((withdraw) => withdraw.status === "pending")
      .reduce((sum, withdraw) => sum + withdraw.amount, 0);

    const totalWithdrawn = withdraws
      .filter((withdraw) => withdraw.status === "completed")
      .reduce((sum, withdraw) => sum + withdraw.amount, 0);

    const pendingBalance = orders
      .filter((order) => order.status === "paid")
      .reduce((sum, order) => sum + order.amount, 0);

    const totalEarned = orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return NextResponse.json({
      balance: user.balance,
      pendingBalance,
      totalEarned,
      pendingWithdrawals,
      totalWithdrawn,
      currency: "BDT",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get freelancer wallet" },
      { status: 500 }
    );
  }
}
