// app/api/messages/route.ts
import { connectDB } from "@/lib/mongodb";
import MessageModel from "@/models/Message";
import OrderModel from "@/models/Order";
import { getUser } from "@/lib/getUser";
import { NextRequest, NextResponse } from "next/server";

// GET /api/messages?id=conversationId
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - User not found" },
        { status: 401 }
      );
    }

    // Get conversation/order ID from query params
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("id");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Verify the chat/order exists and user is a participant
    const chat = await OrderModel.findById(conversationId);
    
    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    // Check if user is part of this conversation
    const isParticipant = chat.users.some(
      (userId: string) => userId.toString() === user._id.toString()
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You are not authorized to view this conversation" },
        { status: 403 }
      );
    }

    // Fetch messages for this conversation
    // Changed from orderId to conversation to match your Message schema
    const messages = await MessageModel.find({ 
      conversation: conversationId 
    })
      .sort({ createdAt: 1 }) // Sort by oldest first
      .lean(); // Convert to plain JavaScript objects for better performance

    // Mark messages as read if the current user is the receiver
    await MessageModel.updateMany(
      {
        conversation: conversationId,
        receiver: user._id,
        status: { $ne: "read" }, // Only update if not already read
      },
      {
        $set: { 
          status: "read",
          readAt: new Date()
        }
      }
    );

    // Return messages array directly (client expects array, not nested object)
    return NextResponse.json(messages, { status: 200 });

  } catch (error) {
    console.error("Error fetching messages:", error);
    
    // More detailed error response
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch messages: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}