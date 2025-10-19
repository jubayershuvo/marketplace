// app/api/create-new-gig/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Gig from "@/models/Gig";
import { connectDB } from "@/lib/mongodb";
import { getUser } from "@/lib/getUser";
import { NotificationModel } from "@/models/Notification";

// Convert File to Base64
async function fileToBase64(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse multipart/form-data using native Request.formData()
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const price = Number(formData.get("price"));
    const originalPrice = formData.get("originalPrice")
      ? Number(formData.get("originalPrice"))
      : undefined;
    const description = formData.get("description") as string;
    const deliveryTime = formData.get("deliveryTime") as string;
    const revisions = formData.get("revisions") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const features = formData.get("features")
      ? JSON.parse(formData.get("features") as string)
      : [];
    const tags = formData.get("tags")
      ? JSON.parse(formData.get("tags") as string)
      : [];
    const faq = formData.get("faq")
      ? JSON.parse(formData.get("faq") as string)
      : [];

    // Handle images
    const images: string[] = [];
    const imageFiles = formData.getAll("images") as File[];
    for (const file of imageFiles) {
      if (file instanceof File) {
        const base64 = await fileToBase64(file);
        images.push(base64);
      }
    }

    // Handle optional video
    const video = formData.get("video");

    const freelancerId = new mongoose.Types.ObjectId(user._id);

    const gig = new Gig({
      title,
      price,
      originalPrice,
      description,
      deliveryTime,
      revisions,
      category,
      subcategory,
      features,
      tags,
      faq,
      images,
      video,
      freelancer: freelancerId,
      reviews: [],
    });

    await gig.save();

    await NotificationModel.create({
      user: freelancerId,
      message: `Your gig "${title}" has been created successfully.`,
      href: `/gig/${gig._id}`,
    });

    return NextResponse.json({
      success: true,
      message: "Gig created successfully",
      gig: {
        _id: gig._id,
        title: gig.title,
        price: gig.price,
        category: gig.category,
        subcategory: gig.subcategory,
        createdAt: gig.createdAt,
      },
    });
  } catch (err) {
    console.error("Error creating gig:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create gig" },
      { status: 500 }
    );
  }
}
