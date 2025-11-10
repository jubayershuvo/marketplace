import { getAdmin } from "@/lib/getAdmin";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const db = await connectDB();

    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "You are not authorized" },
        { status: 401 }
      );
    }
    const totalUsers = await db.collection("users").countDocuments();
    const totalOrders = await db.collection("orders").countDocuments();
    const totalGigs = await db.collection("gigs").countDocuments();
    const last24HoursNewUsers = await db
      .collection("users")
      .find({
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      })
      .toArray();
    const last24HoursNewOrders = await db
      .collection("orders")
      .find({
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      })
      .toArray();

    const last7DaysActiveUsers = await db
      .collection("users")
      .find({
        updatedAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      })
      .toArray();
    const clientUser = await db
      .collection("users")
      .countDocuments({ userType: "client" });
    const freelancerUser = await db
      .collection("users")
      .countDocuments({ userType: "client" });

    const payments = await db.collection("payments").find().toArray();

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalGigs,
      last24HoursNewUsers,
      last24HoursNewOrders,
      last7DaysActiveUsers,
      clientUser,
      freelancerUser,
      payments,
    });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
