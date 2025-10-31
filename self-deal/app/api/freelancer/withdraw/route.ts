import { getUser } from "@/lib/getUser";
import TransactionModel from "@/models/Transaction";
import Withdraw from "@/models/Withdraw";
import { NextRequest, NextResponse } from "next/server";

// Constants for withdrawal configuration
const MIN_WITHDRAWAL_AMOUNT = 500;
const FEE_PERCENTAGE = 5;

interface WithdrawalRequest {
  amount: number;
  method: string;
  number: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WithdrawalRequest = await request.json();
    const { amount, method, number } = body;

    // Authenticate user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.userType !== "freelancer") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only freelancers can withdraw" },
        { status: 403 }
      );
    }

    // Calculate fees
    const fees = calculateFee(amount);
    const totalDeduction = amount + fees;

    // Check minimum withdrawal
    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT} BDT`,
        },
        { status: 400 }
      );
    }

    // Check sufficient balance
    if (totalDeduction > user.balance) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient balance. Required: ${totalDeduction} BDT (Amount: ${amount} + Fee: ${fees}), Available: ${user.balance} BDT`,
        },
        { status: 400 }
      );
    }

    // Deduct balance
    user.balance -= totalDeduction;
    await user.save();

    // Create transaction record
    const transaction = await TransactionModel.create({
      user: user.id,
      type: "debit",
      amount: totalDeduction,
      description: `Withdrawal of ${amount} BDT via ${method} (Fee: ${fees} BDT)`,
      method: "withdrawal",
      status: "pending",
    });

    // Create withdrawal record
    const withdrawal = await Withdraw.create({
      user: user.id,
      transaction: transaction._id,
      amount: amount,
      method: method,
      number: number,
      currency: "BDT",
      fee: fees,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Withdrawal request submitted successfully",
        transaction,
        data: {
          withdrawalId: withdrawal._id,
          transactionId: transaction._id,
          amount: amount,
          fee: fees,
          total: totalDeduction,
          status: "pending",
          method: method,
          number: number,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Withdrawal error:", error);

    // TODO: Implement rollback logic to restore user balance if transaction/withdrawal creation fails
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

function calculateFee(amount: number): number {
  return Math.round(amount / FEE_PERCENTAGE);
}
