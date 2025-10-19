import { NextResponse } from "next/server";
import { DeliveryModel } from "@/models/Delivery";
import { connectDB } from "@/lib/mongodb";



// ✅ POST: Create new delivery
export async function POST(req: Request) {
  try {
    await connectDB();
    const { order, filePath } = await req.json();

    if (!order || !filePath) {
      return NextResponse.json(
        { success: false, message: "Missing order or filePath" },
        { status: 400 }
      );
    }

    const delivery = await DeliveryModel.create({
      order,
      filePath,
      status: "pending",
    });

    return NextResponse.json({ success: true, delivery }, { status: 201 });
  } catch (error) {
    console.error("Error creating delivery:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ✅ PATCH: Update delivery status (mark as delivered)
// ✅ PATCH: Update delivery status or decision
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, status, decision } = await req.json();

    const update:{ status?: string; decision?: string} = {};
    if (status) update.status = status;
    if (decision) update.decision = decision;

    const updated = await DeliveryModel.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!updated)
      return NextResponse.json(
        { success: false, message: "Delivery not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, delivery: updated });
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

