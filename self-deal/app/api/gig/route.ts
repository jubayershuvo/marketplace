import { connectDB } from "@/lib/mongodb";
import Gig from "@/models/Gig";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing id parameter" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const gig = await Gig.findById(id)
      .populate("freelancer")
      .populate("reviews");

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    return NextResponse.json({ gig });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get gig data" },
      { status: 500 }
    );
  }
}
