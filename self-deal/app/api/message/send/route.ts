// app/api/message/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import MessageModel from "@/models/Message";
import OrderModel from "@/models/Order";
import { connectDB } from "@/lib/mongodb";
import { getUser } from "@/lib/getUser";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - User not found" },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let conversation: string;
    let content: string = "";
    let attachments: Array<{ url: string; type: string; name: string }> = [];
    let type: "text" | "image" | "file" = "text";
    let chatId: string;

    // Handle multipart form data (file/image uploads)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      
      conversation = formData.get("conversation") as string;
      chatId = formData.get("chatId") as string;
      type = (formData.get("type") as "text" | "image" | "file") || "file";
      
      const file = formData.get("file") as File || formData.get("image") as File;
      
      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "File size exceeds 10MB limit" },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = join(process.cwd(), "public", "uploads", type === "image" ? "images" : "files");
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error("Error creating upload directory:", error);
      }

      // Generate unique filename
      const fileExtension = file.name.split(".").pop();
      const uniqueFilename = `${uuidv4()}.${fileExtension}`;
      const filePath = join(uploadDir, uniqueFilename);

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Create file URL
      const fileUrl = `/uploads/${type === "image" ? "images" : "files"}/${uniqueFilename}`;

      attachments = [{
        url: fileUrl,
        type: file.type,
        name: file.name,
      }];

      content = file.name;
    } 
    // Handle JSON data (text messages)
    else {
      const body = await req.json();
      conversation = body.conversation;
      chatId = body.chatId;
      content = body.content;
      type = body.type || "text";
      attachments = body.attachments || [];
    }

    // Validation
    if (!conversation && !chatId) {
      return NextResponse.json(
        { error: "conversation or chatId is required" },
        { status: 400 }
      );
    }

    if (!content && attachments.length === 0) {
      return NextResponse.json(
        { error: "content or attachments are required" },
        { status: 400 }
      );
    }

    // Get the chat/order to find receiver
    const chat = await OrderModel.findById(chatId || conversation);
    
    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    // Verify user is part of the chat
    const isParticipant = chat.users.some(
      (userId: string) => userId.toString() === user._id.toString()
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You are not a participant in this chat" },
        { status: 403 }
      );
    }

    // Determine receiver (the other user in the chat)
    const sender = user._id.toString();
    const receiver = chat.users.find(
      (userId: string) => userId.toString() !== sender
    );

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 400 }
      );
    }

    // Create message
    const newMessage = await MessageModel.create({
      conversation: chatId || conversation,
      sender,
      receiver: receiver.toString(),
      content,
      attachments,
      type,
      status: "sent",
    });

    // Update the chat's lastMessage field with the message ID (ObjectId reference)
    await OrderModel.findByIdAndUpdate(
      chatId || conversation,
      {
        lastMessage: newMessage._id, 
      }
    );

    // Populate sender information for response
  const messages = await MessageModel.find({ 
      conversation: chatId || conversation 
    })
      .sort({ createdAt: 1 }) // Sort by oldest first
      .lean(); // Convert to plain JavaScript objects for better performance
    return NextResponse.json(
      {
        success: true,
        messages: messages,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to send message: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve messages
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - User not found" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("id");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Verify user is part of the conversation
    const chat = await OrderModel.findById(conversationId);
    
    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const isParticipant = chat.users.some(
      (userId: string) => userId.toString() === user._id.toString()
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You are not a participant in this chat" },
        { status: 403 }
      );
    }

    // Fetch messages
    const messages = await MessageModel.find({
      conversation: conversationId,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName avatar")
      .populate("receiver", "firstName lastName avatar");

    // Mark messages as read
    await MessageModel.updateMany(
      {
        conversation: conversationId,
        receiver: user._id,
        status: { $ne: "read" },
      },
      {
        status: "read",
      }
    );

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}