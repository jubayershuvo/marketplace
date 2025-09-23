import { getUser } from "@/lib/getUser";
import { connectDB } from "@/lib/mongodb";
import Gig from "@/models/Gig";
import { NextRequest, NextResponse } from "next/server";

interface GigListResponse {
  success: boolean;
  gigs: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ErrorResponse {
  error: string;
  details?: string[];
  message?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GigListResponse | ErrorResponse>> {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error("❌ Database connection failed for GET");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const user = await getUser();
    if (!user) {
      console.error("❌ User not found for GET");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Demo user ID
    const freelancerId = user._id;
    console.log("👤 Fetching gigs for freelancer ID:", freelancerId);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );
    const skip = (page - 1) * limit;

    console.log(
      "📄 Pagination params - Page:",
      page,
      "Limit:",
      limit,
      "Skip:",
      skip
    );

    // Fetch gigs with pagination
    const [gigs, total] = await Promise.all([
      Gig.find({ freelancer: freelancerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Gig.countDocuments({ freelancer: freelancerId }),
    ]);

    console.log("📖 Found gigs:", gigs.length, "Total count:", total);

    const response: GigListResponse = {
      success: true,
      gigs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Fetch gigs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gigs" },
      { status: 500 }
    );
  }
}
