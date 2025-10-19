// app/api/deliveries/reject/route.ts
import { getUser } from "@/lib/getUser";
import { DeliveryModel } from "@/models/Delivery";
import OrderModel from "@/models/Order";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export async function PATCH(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const deliveryId = searchParams.get("id");

    if (!deliveryId) {
      return new Response(
        JSON.stringify({ message: "Delivery ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await getUser();
    if (!user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (user.userType !== "client") {
      return new Response(
        JSON.stringify({ message: "Forbidden: Only clients can reject deliveries" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const delivery = await DeliveryModel.findById(deliveryId);
    if (!delivery) {
      return new Response(JSON.stringify({ message: "Delivery not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if delivery already has a decision
    if (delivery.decision) {
      return new Response(
        JSON.stringify({ message: "Delivery already has a decision" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const order = await OrderModel.findById(delivery.order);
    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify the client owns this order
    if (order.client.toString() !== user._id.toString()) {
      return new Response(
        JSON.stringify({ message: "Forbidden: You can only reject your own order deliveries" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const freelancer = await User.findById(order.freelancer);
    if (!freelancer) {
      return new Response(JSON.stringify({ message: "Freelancer not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mark delivery as rejected
    delivery.decision = "rejected";
    // Keep status as "pending" so the order remains open for re-delivery/revision
    delivery.status = "pending";

    // Keep order status as "paid" (money in escrow) to allow for revision
    // You can implement dispute/refund logic here if needed
    // order.status remains unchanged (typically "paid")

    await Promise.all([delivery.save(), order.save()]);

    // Optional: Notify freelancer about rejection
    // await notifyUser(freelancer._id, "Your delivery was rejected");

    // Return the updated delivery
    return new Response(JSON.stringify(delivery.toObject()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Reject delivery error:", error);
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}