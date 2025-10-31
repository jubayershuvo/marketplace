// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

// GET - Fetch all categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { label, subcategories } = body;
console.log(subcategories)
    if (!label?.trim()) {
      return NextResponse.json(
        { success: false, error: "Label is required" },
        { status: 400 }
      );
    }

    // Generate slug-like value for main category
    const value = label
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");

    // Optional subcategories
    const subcategoryObjects =
      Array.isArray(subcategories) && subcategories.length > 0
        ? subcategories.map((sub: string | { label: string }) => {
            const subLabel = typeof sub === "string" ? sub : sub.label;
            const subValue = subLabel
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/--+/g, "-")
              .replace(/^-+/, "")
              .replace(/-+$/, "");
            return { label: subLabel, value: subValue };
          })
        : [];
console.log(value,label,subcategoryObjects)
    // Create new category
    const category = await Category.create({
      value,
      label,
      subcategories: subcategoryObjects,
    });

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: error|| "Failed to create category" },
      { status: 500 }
    );
  }
}
