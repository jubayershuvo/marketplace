import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } =await params;
    const db = await connectDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!user) {
      return new Response("User Not Found", { status: 404 });
    }

    const updatedUser = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { isBanned: !user.isBanned } }
      );
      const userAfterUpdate = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });
    return new NextResponse(JSON.stringify(userAfterUpdate), { status: 200 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
