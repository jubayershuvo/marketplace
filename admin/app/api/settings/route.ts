import { NextRequest, NextResponse } from "next/server";
import { SettingsModel } from "@/models/Settings"; // adjust path as needed
import { connectDB } from "@/lib/mongodb";

// Ensure MongoDB connection


// GET - Fetch settings
export async function GET() {
  try {
    await connectDB();

    // Get the first (and should be only) settings document
    let settings = await SettingsModel.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await SettingsModel.create({
        bkash: "",
        nagad: "",
        withdraw_fee_percentage: 10,
        min_withdraw_amount: 500,
        min_fee: 10,
      });
    }

    return NextResponse.json(
      {
        success: true,
        settings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch settings",
        error: error,
      },
      { status: 500 }
    );
  }
}

// POST - Create or update settings
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      bkash,
      nagad,
      withdraw_fee_percentage,
      min_withdraw_amount,
      min_fee,
    } = body;

    // Validation
    if (withdraw_fee_percentage < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Withdrawal fee percentage cannot be negative",
        },
        { status: 400 }
      );
    }

    if (min_withdraw_amount < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum withdrawal amount cannot be negative",
        },
        { status: 400 }
      );
    }

    if (min_fee < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum fee cannot be negative",
        },
        { status: 400 }
      );
    }

    // Find existing settings or create new one
    let settings = await SettingsModel.findOne();

    if (settings) {
      // Update existing settings
      settings.bkash = bkash?.trim() || "";
      settings.nagad = nagad?.trim() || "";
      settings.withdraw_fee_percentage = withdraw_fee_percentage || 0;
      settings.min_withdraw_amount = min_withdraw_amount || 0;
      settings.min_fee = min_fee || 0;

      await settings.save();
    } else {
      // Create new settings
      settings = await SettingsModel.create({
        bkash: bkash?.trim() || "",
        nagad: nagad?.trim() || "",
        withdraw_fee_percentage: withdraw_fee_percentage || 0,
        min_withdraw_amount: min_withdraw_amount || 0,
        min_fee: min_fee || 0,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Settings updated successfully",
        settings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update settings",
        error: error,
      },
      { status: 500 }
    );
  }
}

// PUT - Alternative update method (optional)
export async function PUT(req: NextRequest) {
  return POST(req);
}

// DELETE - Delete settings (optional, use with caution)
export async function DELETE() {
  try {
    await connectDB();

    await SettingsModel.deleteMany({});

    return NextResponse.json(
      {
        success: true,
        message: "Settings deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/settings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete settings",
        error: error,
      },
      { status: 500 }
    );
  }
}