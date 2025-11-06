import { NextRequest, NextResponse } from "next/server";
import MessageModel from "@/models/Message";
import OrderModel from "@/models/Order";
import { connectDB } from "@/lib/mongodb";
import { getUser } from "@/lib/getUser";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { Types } from "mongoose";

// Configuration
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total for multiple files

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'image/gif', 
  'image/webp',
  'image/svg+xml',
  'image/bmp'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/rtf'
];

const ALLOWED_ARCHIVE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-tar',
  'application/gzip'
];

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
  'audio/webm'
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/ogg',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo'
];

// Combine all allowed types
const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
  ...ALLOWED_ARCHIVE_TYPES,
  ...ALLOWED_AUDIO_TYPES,
  ...ALLOWED_VIDEO_TYPES
];

// Helper function to check if file type is allowed
const isFileTypeAllowed = (mimeType: string, fileName: string): boolean => {
  // Check against our allowed types
  if (ALLOWED_FILE_TYPES.includes(mimeType)) {
    return true;
  }

  // Additional safety check for common file extensions
  const fileExtension = fileName.toLowerCase().split('.').pop();
  const allowedExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf',
    'zip', 'rar', 'tar', 'gz',
    'mp3', 'wav', 'ogg', 'aac', 'flac',
    'mp4', 'mpeg', 'ogv', 'webm', 'mov', 'avi'
  ];

  return allowedExtensions.includes(fileExtension || '');
};

// Helper function to get file category
const getFileCategory = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'videos';
  return 'files';
};

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
    let attachments: Array<{ url: string; type: string; name: string; size?: number }> = [];
    let type: "text" | "image" | "file" = "text";
    let chatId: string;

    // Handle multipart form data (file/image uploads)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      
      conversation = formData.get("conversation") as string;
      chatId = formData.get("chatId") as string;
      const messageType = formData.get("type") as string;
      type = (messageType === "image" || messageType === "file") ? messageType as "image" | "file" : "file";
      
      // Handle multiple files
      const files = formData.getAll("files") as File[];
      const images = formData.getAll("images") as File[];
      
      const allFiles = [...files, ...images];
      
      if (allFiles.length === 0) {
        const singleFile = formData.get("file") as File || formData.get("image") as File;
        if (singleFile) {
          allFiles.push(singleFile);
        }
      }

      if (allFiles.length === 0) {
        return NextResponse.json(
          { error: "No files provided" },
          { status: 400 }
        );
      }

      // Validate total size
      const totalSize = allFiles.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > MAX_TOTAL_SIZE) {
        return NextResponse.json(
          { error: `Total file size exceeds ${MAX_TOTAL_SIZE / 1024 / 1024}MB limit` },
          { status: 400 }
        );
      }

      // Process each file
      for (const file of allFiles) {
        // Validate individual file size
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File "${file.name}" exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
            { status: 400 }
          );
        }

        // Validate file type
        if (!isFileTypeAllowed(file.type, file.name)) {
          return NextResponse.json(
            { error: `File type "${file.type}" for "${file.name}" is not supported. Please use common document, image, audio, or video formats.` },
            { status: 400 }
          );
        }

        // Determine file category for storage
        const fileCategory = getFileCategory(file.type);
        const isImage = fileCategory === 'images';

        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), "public", "uploads", fileCategory);
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (error) {
          console.error("Error creating upload directory:", error);
          return NextResponse.json(
            { error: "Server error: Could not create upload directory" },
            { status: 500 }
          );
        }

        // Generate unique filename
        const fileExtension = file.name.split('.').pop() || 'file';
        const uniqueFilename = `${uuidv4()}.${fileExtension}`;
        const filePath = join(uploadDir, uniqueFilename);

        try {
          // Save file
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filePath, buffer);
        } catch (error) {
          console.error("Error saving file:", error);
          return NextResponse.json(
            { error: "Server error: Could not save file" },
            { status: 500 }
          );
        }

        // Create file URL
        const fileUrl = `/uploads/${fileCategory}/${uniqueFilename}`;

        attachments.push({
          url: fileUrl,
          type: file.type,
          name: file.name,
          size: file.size,
        });
      }

      // Set content and type based on attachments
      if (attachments.length > 0) {
        const hasImages = attachments.some(att => att.type.startsWith('image/'));
        const hasVideos = attachments.some(att => att.type.startsWith('video/'));
        const hasAudio = attachments.some(att => att.type.startsWith('audio/'));

        if (attachments.length === 1) {
          content = attachments[0].name;
          if (hasImages) type = 'image';
          else if (hasVideos) type = 'file'; // You might want to add 'video' type
          else if (hasAudio) type = 'file'; // You might want to add 'audio' type
          else type = 'file';
        } else {
          const imageCount = attachments.filter(att => att.type.startsWith('image/')).length;
          const fileCount = attachments.length - imageCount;
          
          if (imageCount === attachments.length) {
            content = `Sent ${imageCount} images`;
            type = 'image';
          } else if (fileCount === attachments.length) {
            content = `Sent ${fileCount} files`;
            type = 'file';
          } else {
            content = `Sent ${imageCount} images and ${fileCount} files`;
            type = 'file';
          }
        }
      }
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

    if (!content.trim() && attachments.length === 0) {
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
      (userId: Types.ObjectId) => userId.toString() === user._id.toString()
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
      (userId: Types.ObjectId) => userId.toString() !== sender
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
      content: content.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
      type,
      status: "sent",
    });

    // Update the chat's lastMessage field
    await OrderModel.findByIdAndUpdate(
      chatId || conversation,
      {
        lastMessage: newMessage._id,
        updatedAt: new Date(),
      }
    );

    // Populate and return all messages in the conversation
    const messages = await MessageModel.find({ 
      conversation: chatId || conversation 
    })
      .populate("sender", "firstName lastName avatar")
      .populate("receiver", "firstName lastName avatar")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: newMessage,
        messages: messages,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    
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
      (userId: Types.ObjectId) => userId.toString() === user._id.toString()
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
      .populate("sender", "firstName lastName avatar")
      .populate("receiver", "firstName lastName avatar")
      .sort({ createdAt: 1 })
      .lean();

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