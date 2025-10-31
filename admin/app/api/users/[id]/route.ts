import { connectDB } from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function DELETE(
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
    const user = await db
      .collection("users")
      .findOneAndDelete({ _id: new ObjectId(id) });

    if (!user) {
      return new NextResponse("User Not Found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
