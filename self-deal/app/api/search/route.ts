import { getUser } from "@/lib/getUser";
import Gig from "@/models/Gig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get the query param "q" directly
    const query = req.nextUrl.searchParams.get("q");
    const user = await getUser();

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter" },
        { status: 400 }
      );
    }

    const gigs = await Gig.find({
      $text: { $search: query },
    }).populate("freelancer");

    if (user && user.userType === "client") {
      await Promise.all(
        gigs.map((gig) =>
          Gig.findByIdAndUpdate(
            gig._id,
            { impressions: gig.impressions + 1 },
            { new: true }
          )
        )
      );
    }
    return NextResponse.json({ gigs });
  } catch (error) {
    console.error("Error fetching gigs:", error);
    return NextResponse.json(
      { error: "Failed to get gig profiles by search query" },
      { status: 500 }
    );
  }
}
