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

    const updatedUser = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updates });
    return new NextResponse(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}