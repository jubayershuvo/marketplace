import { getUser } from "@/lib/getUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      transactions: [
        {
          id: "txn_20240115001",
          type: "credit",
          amount: 2500.0,
          description: "Payment received for Logo Design Project",
          status: "completed",
          date: "2024-01-15T10:30:00Z",
          orderId: "ORD-2024-001",
          clientName: "John Smith",
          method: "order_payment",
          currency: "BDT",
          referenceId: "ref_123456789",
        },
        {
          id: "txn_20240114001",
          type: "debit",
          amount: 5000.0,
          description: "Withdrawal to Bank Account",
          status: "completed",
          date: "2024-01-14T14:22:00Z",
          method: "withdrawal",
          currency: "BDT",
          referenceId: "with_987654321",
          withdrawalMethod: "bank",
          accountLastFour: "1234",
        },
        {
          id: "txn_20240113001",
          type: "credit",
          amount: 1800.0,
          description: "Payment received for Website Development",
          status: "pending",
          date: "2024-01-13T09:15:00Z",
          orderId: "ORD-2024-002",
          clientName: "Sarah Johnson",
          method: "order_payment",
          currency: "BDT",
          referenceId: "ref_123456790",
        },
        {
          id: "txn_20240112001",
          type: "debit",
          amount: 150.0,
          description: "Service fee deduction",
          status: "completed",
          date: "2024-01-12T16:45:00Z",
          method: "fee",
          currency: "BDT",
          referenceId: "fee_123456789",
        },
        {
          id: "txn_20240110001",
          type: "credit",
          amount: 500.0,
          description: "New user bonus",
          status: "completed",
          date: "2024-01-10T12:00:00Z",
          method: "bonus",
          currency: "BDT",
          referenceId: "bonus_123456789",
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 5,
        pages: 1,
      },
      summary: {
        totalCredits: 4800.0,
        totalDebits: 5150.0,
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
