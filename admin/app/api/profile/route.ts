import { getAdmin } from "@/lib/getAdmin";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const admin = await getAdmin();
        return NextResponse.json({ admin });
    } catch (error) {
        console.error(error);
        return NextResponse.json("Internal Server Error", { status: 500 }); 
    }
}