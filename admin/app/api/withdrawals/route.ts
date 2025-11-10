import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAdmin } from "@/lib/getAdmin";

interface WithdrawalUpdateData {
  status: "pending" | "completed" | "rejected";
  note?: string;
}

interface UpdateRequestBody {
  ids: string[];
  status: "pending" | "completed" | "rejected";
  note?: string;
}

export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "You are not authorized" },
        { status: 401 }
      );
    }
    const withdrawals = await db
      .collection("withdraws")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { ids, status, note }: UpdateRequestBody = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid withdrawal IDs" },
        { status: 400 }
      );
    }

    if (!["pending", "completed", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "You are not authorized" },
        { status: 401 }
      );
    }
    const id = ids[0];

    const withdrawal = await db
      .collection("withdraws")
      .findOne({ _id: new ObjectId(id) });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, message: "Withdrawal not found" },
        { status: 404 }
      );
    }
    const transaction = await db
      .collection("transactions")
      .findOne({ _id: withdrawal.transaction });
    const user = await db.collection("users").findOne({ _id: withdrawal.user });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    if (status === "completed") {
      transaction.status = "completed";
      withdrawal.status = "completed";
      withdrawal.note = note || withdrawal.note;
    } else if (status === "rejected") {
      transaction.status = "failed";
      withdrawal.status = "rejected";
      withdrawal.note = note || withdrawal.note;
      user.balance += withdrawal.amount + withdrawal.fee;
    }

    await db
      .collection("transactions")
      .updateOne({ _id: new ObjectId(transaction._id) }, { $set: transaction });
    await db
      .collection("withdraws")
      .updateOne({ _id: new ObjectId(withdrawal._id) }, { $set: withdrawal });
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(user._id) }, { $set: user });

    return NextResponse.json(
      { success: true, message: "Withdrawal updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error bulk updating withdrawals:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update withdrawals" },
      { status: 500 }
    );
  }
}
