import { getAdmin } from "@/lib/getAdmin";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const db = await connectDB();
            const admin = await getAdmin();
            if (!admin) {
              return NextResponse.json(
                { success: false, error: "You are not authorized" },
                { status: 401 }
              );
            }
        const usersCollection = db.collection("users");
        const users = await usersCollection.find({}).toArray();
        return NextResponse.json({ users });
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}