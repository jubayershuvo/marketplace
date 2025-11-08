// app/api/deliveries/accept/route.ts
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
        JSON.stringify({ message: "Forbidden: Only clients can accept deliveries" }),
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
    if(order.status === "completed") {
      return new Response(
        JSON.stringify({ message: "Cannot accept delivery for a completed order" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify the client owns this order
    if (order.client.toString() !== user._id.toString()) {
      return new Response(
        JSON.stringify({ message: "Forbidden: You can only accept your own order deliveries" }),
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

    // Find all other pending deliveries for this order that aren't the accepted one
    const otherDeliveries = await DeliveryModel.find({
      order: delivery.order,
      _id: { $ne: deliveryId },
      decision: { $exists: false } // Only target deliveries without decisions
    });

    // Update all other deliveries to rejected
    const rejectPromises = otherDeliveries.map(async (otherDelivery) => {
      otherDelivery.decision = "rejected";
      otherDelivery.status = "rejected";
      return otherDelivery.save();
    });

    // Update the accepted delivery and order
    order.status = "completed";
    delivery.decision = "accepted";
    delivery.status = "delivered";
    freelancer.earnings += order.totalAmount;
    freelancer.balance += order.totalAmount;
    freelancer.completedOrders += 1;
    freelancer.lastDelivery = new Date().toISOString();
      if (freelancer.pendingOrders) {
      freelancer.pendingOrders -= 1;
  
    }

    // Execute all updates in parallel
    await Promise.all([
      order.save(),
      delivery.save(),
      freelancer.save(),
      ...rejectPromises
    ]);

  

    // Return the updated delivery
    return new Response(JSON.stringify(delivery.toObject()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Accept delivery error:", error);
    return new Response(
      JSON.stringify({ 
        message: "Internal Server Error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}