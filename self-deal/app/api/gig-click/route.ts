import { getUser } from "@/lib/getUser";
import Gig from "@/models/Gig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    const user = await getUser()

    if (user?.userType !== 'client') {
      return NextResponse.json({ error: "You are a freelancer" }, { status: 201 });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 200 }
      );
    }


    const gig = await Gig.findById(id);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    gig.clicks += 1;
    await gig.save();
    return NextResponse.json({ gig });
}