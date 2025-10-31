import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const db = await connectDB();
        const usersCollection = db.collection("users");
        const users = await usersCollection.find({}).toArray();
        return NextResponse.json({ users });
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}