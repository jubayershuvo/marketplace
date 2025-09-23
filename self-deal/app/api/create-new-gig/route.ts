import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Gig from "@/models/Gig"; // Adjust path to your Gig model
import { connectDB } from "@/lib/mongodb";
import { getUser } from "@/lib/getUser";

// Define interfaces for our data structures
interface FAQItem {
  question: string;
  answer: string;
}

interface GigInput {
  title: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  video?: string;
  badge?: string;
  description: string;
  features: string[];
  deliveryTime: string;
  revisions: string;
  category: string;
  subcategory: string;
  tags?: string[];
  faq?: FAQItem[];
}

interface SanitizedGigData extends Omit<GigInput, "faq" | "originalPrice"> {
  originalPrice?: number;
  faq: FAQItem[];
  freelancer: mongoose.Types.ObjectId;
  reviews: never[]; // Empty array for new gigs
}

// Input validation function with detailed logging
function validateGigInput(data: unknown): string[] {
  console.log(
    "🔍 Starting validation for data:",
    JSON.stringify(data, null, 2)
  );
  const errors: string[] = [];

  // Check if data is an object
  if (!data || typeof data !== "object") {
    errors.push("Invalid data format: expected an object");
    return errors;
  }

  const gigData = data as Record<string, unknown>;

  // Required field validations
  console.log(
    "📝 Validating title:",
    gigData.title,
    "Type:",
    typeof gigData.title
  );
  if (
    !gigData.title ||
    typeof gigData.title !== "string" ||
    gigData.title.trim().length === 0
  ) {
    errors.push("Title is required and must be a non-empty string");
  } else if (gigData.title.length > 120) {
    errors.push("Title must be 120 characters or less");
  }

  console.log(
    "💰 Validating price:",
    gigData.price,
    "Type:",
    typeof gigData.price
  );
  if (!gigData.price) {
    errors.push("Price is required and must be at least $5");
  }

  console.log(
    "📂 Validating category:",
    gigData.category,
    "Type:",
    typeof gigData.category
  );
  if (
    !gigData.category ||
    typeof gigData.category !== "string" ||
    gigData.category.trim().length === 0
  ) {
    errors.push("Category is required");
  }

  console.log(
    "📂 Validating subcategory:",
    gigData.subcategory,
    "Type:",
    typeof gigData.subcategory
  );
  if (
    !gigData.subcategory ||
    typeof gigData.subcategory !== "string" ||
    gigData.subcategory.trim().length === 0
  ) {
    errors.push("Subcategory is required");
  }

  console.log(
    "📄 Validating description length:",
    typeof gigData.description === "string"
      ? gigData.description.length
      : "N/A",
    "Type:",
    typeof gigData.description
  );
  if (
    !gigData.description ||
    typeof gigData.description !== "string" ||
    gigData.description.trim().length === 0
  ) {
    errors.push("Description is required");
  } else if (gigData.description.length > 5000) {
    errors.push("Description must be 5000 characters or less");
  }

  console.log(
    "⏱️ Validating deliveryTime:",
    gigData.deliveryTime,
    "Type:",
    typeof gigData.deliveryTime
  );
  if (
    !gigData.deliveryTime ||
    typeof gigData.deliveryTime !== "string" ||
    gigData.deliveryTime.trim().length === 0
  ) {
    errors.push("Delivery time is required");
  }

  console.log(
    "🔄 Validating revisions:",
    gigData.revisions,
    "Type:",
    typeof gigData.revisions
  );
  if (
    !gigData.revisions ||
    typeof gigData.revisions !== "string" ||
    gigData.revisions.trim().length === 0
  ) {
    errors.push("Revisions information is required");
  }

  // Array validations
  console.log(
    "✨ Validating features:",
    gigData.features,
    "IsArray:",
    Array.isArray(gigData.features)
  );
  if (!gigData.features || !Array.isArray(gigData.features)) {
    errors.push("Features must be an array");
  } else {
    const validFeatures = gigData.features.filter(
      (f: unknown) => typeof f === "string" && f.trim().length > 0
    );
    console.log(
      "✨ Valid features count:",
      validFeatures.length,
      "Total features:",
      gigData.features.length
    );
    if (validFeatures.length === 0) {
      errors.push("At least one feature is required");
    }
  }

  // Optional field validations
  if (gigData.originalPrice !== undefined) {
    console.log(
      "💲 Validating originalPrice:",
      gigData.originalPrice,
      "vs price:",
      gigData.price
    );
    if (Number(gigData.originalPrice) <= Number(gigData.price)) {
      errors.push(
        "Original price must be a number greater than the current price"
      );
    }
  }

  if (
    gigData.video &&
    typeof gigData.video === "string" &&
    gigData.video.trim().length > 0
  ) {
    console.log("🎥 Validating video URL:", gigData.video);
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(gigData.video.trim())) {
      errors.push("Video must be a valid URL");
    }
  }

  if (gigData.tags && Array.isArray(gigData.tags)) {
    console.log(
      "🏷️ Validating tags:",
      gigData.tags,
      "Count:",
      gigData.tags.length
    );
    if (gigData.tags.length > 10) {
      errors.push("Maximum 10 tags allowed");
    }
    const invalidTags = gigData.tags.filter(
      (tag: unknown) => typeof tag !== "string"
    );
    if (invalidTags.length > 0) {
      console.log("🏷️ Invalid tags found:", invalidTags);
      errors.push("All tags must be strings");
    }
  }

  if (gigData.images && Array.isArray(gigData.images)) {
    console.log(
      "🖼️ Validating images:",
      gigData.images,
      "Count:",
      gigData.images.length
    );
    if (gigData.images.length > 5) {
      errors.push("Maximum 5 images allowed");
    }
    const invalidImages = gigData.images.filter(
      (img: unknown) => typeof img !== "string"
    );
    if (invalidImages.length > 0) {
      console.log("🖼️ Invalid images found:", invalidImages);
      errors.push("All image URLs must be strings");
    }
  }

  if (gigData.faq && Array.isArray(gigData.faq)) {
    console.log(
      "❓ Validating FAQ:",
      gigData.faq,
      "Count:",
      gigData.faq.length
    );
    gigData.faq.forEach((item: unknown, index: number) => {
      console.log(`❓ FAQ ${index + 1}:`, item);
      if (
        typeof item !== "object" ||
        item === null ||
        !("question" in item) ||
        !("answer" in item)
      ) {
        errors.push(`FAQ item ${index + 1} must have both question and answer`);
      } else {
        const faqItem = item as FAQItem;
        if (
          typeof faqItem.question !== "string" ||
          typeof faqItem.answer !== "string"
        ) {
          errors.push(
            `FAQ item ${index + 1} question and answer must be strings`
          );
        }
      }
    });
  }

  console.log("❌ Validation errors found:", errors);
  return errors;
}

// Sanitize and prepare data for MongoDB
function sanitizeGigData(
  data: GigInput,
  freelancerId: string
): SanitizedGigData {
  console.log("🧹 Starting data sanitization...");

  // Clean and filter features
  const features = Array.isArray(data.features)
    ? data.features
        .filter((f: string) => typeof f === "string" && f.trim().length > 0)
        .map((f: string) => f.trim())
    : [];
  console.log("✨ Sanitized features:", features);

  // Clean and filter FAQ
  const faq = Array.isArray(data.faq)
    ? data.faq
        .filter(
          (item: FAQItem) =>
            item &&
            typeof item.question === "string" &&
            typeof item.answer === "string" &&
            item.question.trim().length > 0 &&
            item.answer.trim().length > 0
        )
        .map((item: FAQItem) => ({
          question: item.question.trim(),
          answer: item.answer.trim(),
        }))
    : [];
  console.log("❓ Sanitized FAQ:", faq);

  // Clean tags
  const tags = Array.isArray(data.tags)
    ? data.tags
        .filter(
          (tag: string) => typeof tag === "string" && tag.trim().length > 0
        )
        .map((tag: string) => tag.trim())
        .slice(0, 10) // Ensure max 10 tags
    : [];
  console.log("🏷️ Sanitized tags:", tags);

  // Clean images
  const images = Array.isArray(data.images)
    ? data.images
        .filter(
          (img: string) => typeof img === "string" && img.trim().length > 0
        )
        .slice(0, 5) // Ensure max 5 images
    : [];
  console.log("🖼️ Sanitized images:", images);

  const sanitizedData: SanitizedGigData = {
    title: data.title.trim(),
    price: Number(data.price),
    originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
    images,
    video:
      data.video && typeof data.video === "string"
        ? data.video.trim()
        : undefined,
    badge:
      data.badge && typeof data.badge === "string"
        ? data.badge.trim()
        : undefined,
    description: data.description.trim(),
    features,
    deliveryTime: data.deliveryTime.trim(),
    revisions: data.revisions.trim(),
    category: data.category.trim(),
    subcategory: data.subcategory.trim(),
    tags,
    freelancer: new mongoose.Types.ObjectId(freelancerId),
    reviews: [],
    faq,
  };

  console.log(
    "🧹 Final sanitized data:",
    JSON.stringify(sanitizedData, null, 2)
  );
  return sanitizedData;
}

// Response interfaces
interface SuccessResponse {
  success: boolean;
  message: string;
  gig: {
    _id: string;
    title: string;
    price: number;
    category: string;
    subcategory: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface ErrorResponse {
  error: string;
  details?: string[];
  message?: string;
}


export async function POST(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  console.log("🚀 POST request received at /api/create-gig");

  try {
    // Connect to database
    console.log("🔌 Attempting database connection...");
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error("❌ Database connection failed");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }
    console.log("✅ Database connected successfully");

    // Parse request body with error handling
    console.log("📥 Parsing request body...");
    let body: unknown;
    try {
      body = await request.json();
      console.log("📥 Raw request body:", JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const user = await getUser();
    if (!user) {
      console.error("❌ User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }



    // For demo purposes - replace with actual user ID from session
    const freelancerId = user._id; // Demo ObjectId
    console.log("👤 Using freelancer ID:", freelancerId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
      console.error("❌ Invalid ObjectId format:", freelancerId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Validate input data
    console.log("🔍 Starting input validation...");
    const validationErrors = validateGigInput(body);
    if (validationErrors.length > 0) {
      console.error("❌ Validation failed:", validationErrors);
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }
    console.log("✅ Input validation passed");

    // Sanitize and prepare data
    console.log("🧹 Sanitizing data...");
    const gigData = sanitizeGigData(body as GigInput, freelancerId);

    // Create and save new gig
    console.log("💾 Creating new gig...");
    const newGig = new Gig(gigData);

    // Save with validation
    console.log("💾 Saving gig to database...");
    const savedGig = await newGig.save();
    console.log("✅ Gig saved successfully:", savedGig._id);

    // Return success response with essential data
    const response: SuccessResponse = {
      success: true,
      message: "Gig created successfully",
      gig: {
        _id: savedGig._id.toString(),
        title: savedGig.title,
        price: savedGig.price,
        category: savedGig.category,
        subcategory: savedGig.subcategory,
        createdAt: savedGig.createdAt,
        updatedAt: savedGig.updatedAt,
      },
    };

    console.log("✅ Returning success response:", response);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("❌ Create gig error:", error);

    if (error instanceof Error) {
      console.error("❌ Error stack:", error.stack);
    }

    // Handle specific MongoDB errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      console.error("❌ MongoDB validation errors:", validationErrors);
      return NextResponse.json(
        {
          error: "Database validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    if (error instanceof mongoose.Error.CastError) {
      console.error("❌ MongoDB cast error:", error.message);
      return NextResponse.json(
        { error: "Invalid data format provided" },
        { status: 400 }
      );
    }

    // Handle duplicate key errors (e.g., unique constraints)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "A gig with similar details already exists" },
        { status: 409 }
      );
    }

    // Handle MongoDB connection errors
    if (error instanceof mongoose.Error.MongooseServerSelectionError) {
      console.error("❌ MongoDB server selection error");
      return NextResponse.json(
        { error: "Database server unavailable" },
        { status: 503 }
      );
    }

    // Generic server error
    console.error(
      "❌ Generic server error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}


