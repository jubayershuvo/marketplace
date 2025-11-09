import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;
    const db = await connectDB();
    const updates = await request.json();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!user) {
      return new Response("User Not Found", { status: 404 });
    }

    if (user.balance !== updates.balance) {
      db.collection("payments").insertOne({
        user: new ObjectId(id),
        amount:
          updates.balance - user.balance < 0
            ? -(updates.balance - user.balance)
            : updates.balance - user.balance,
        type: user.balance < updates.balance ? "credit" : "debit",
        status: "completed",
        date: new Date(),
        description: "Balance Updated by Admin",
        method: "admin_payment",
      });
    }

    const updatedUser = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updates });
    return new NextResponse(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
