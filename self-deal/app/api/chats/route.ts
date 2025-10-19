// app/api/chats/route.ts
import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";
import { getUser } from "@/lib/getUser";
import { NextResponse } from "next/server";
import "@/models/User";
import "@/models/Gig";
import "@/models/Message";

// GET /api/chats
export async function GET() {
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

    // Find all chats/orders where the user is a participant
    const chats = await OrderModel.find({
      users: { $in: [user._id] },
    })
      .populate("users", "firstName lastName avatar email username lastSeen")
      .populate({
        path: "lastMessage",
        select: "content type createdAt sender",
      })
      .sort({ updatedAt: -1 }) // Most recent first
      .lean();

    // Transform the chats to include a readable lastMessage
    const transformedChats = chats.map((chat) => {
      let lastMessageText = "No messages yet";

      if (chat.lastMessage) {
        if (chat.lastMessage.type === "text") {
          lastMessageText = chat.lastMessage.content;
        } else if (chat.lastMessage.type === "image") {
          lastMessageText = "📷 Image";
        } else if (chat.lastMessage.type === "file") {
          lastMessageText = "📎 File";
        }
      }

      return {
        ...chat,
        lastMessage: lastMessageText,
      };
    });

    return NextResponse.json(
      {
        success: true,
        chats: transformedChats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chats:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch chats: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
