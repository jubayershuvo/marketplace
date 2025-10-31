import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await connectDB();
    const categories = await db.collection("categories").find({}).toArray();

    return NextResponse.json(categories);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
