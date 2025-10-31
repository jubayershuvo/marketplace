import { getUser } from "@/lib/getUser";
import TransactionModel from "@/models/Transaction";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const transactions = await TransactionModel.find({
      user: user._id,
    })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });

    const totalCredits = transactions
      .filter((transaction) => transaction.type === "credit")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalDebits = transactions
      .filter((transaction) => transaction.type === "debit")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return NextResponse.json({
      transactions,
      pagination: {
        page: 1,
        limit: 10,
        total: 5,
        pages: 1,
      },
      summary: {
        totalCredits,
        totalDebits,
        period: "all",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get freelancer" },
      { status: 500 }
    );
  }
}
