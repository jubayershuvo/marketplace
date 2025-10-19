import { connectDB } from "@/lib/mongodb";
import { DeliveryModel } from "@/models/Delivery";
import { NotificationModel } from "@/models/Notification";
import OrderModel from "@/models/Order";
import { mkdir, writeFile } from "fs/promises";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();
    const order = formData.get("order") as string;
    const file = formData.get("file") as File;

    if (!order || !file) {
      return NextResponse.json(
        { error: "Missing order ID or file" },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Save uploaded file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Public URL for access/download
    const publicFilePath = `/uploads/${fileName}`;

    // Create Delivery record
    const delivery = await DeliveryModel.create({
      order: new mongoose.Types.ObjectId(order),
      filePath: publicFilePath,
      status: "pending",
    });

    const orderDoc = await OrderModel.findById(order);

    await NotificationModel.create({
      message: `New delivery created for order ${order}`,
      user: orderDoc.freelancer,
      href: `/orders/deliveries/${order}`,
    });
    await NotificationModel.create({
      message: `New delivery received for order ${order}`,
      user: orderDoc.client,
      href: `/orders/deliveries/${order}`,
    });

    return NextResponse.json(
      { message: "Delivery created successfully", delivery },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/delivery error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
