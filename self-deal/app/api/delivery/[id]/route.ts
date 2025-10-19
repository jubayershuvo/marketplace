import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { DeliveryModel } from "@/models/Delivery";
import { connectDB } from "@/lib/mongodb";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
// 🧩 Connect to MongoDB
async function dbConnect() {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
}

// 🟢 GET /api/delivery/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const delivery = await DeliveryModel.findById(params.id).populate("order");
    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("GET delivery error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 🟠 PUT /api/delivery/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { status } = await request.json();
    if (!["delivered", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const delivery = await DeliveryModel.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("PUT delivery error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

