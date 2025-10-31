import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

interface WithdrawalUpdateData {
  status: 'pending' | 'completed' | 'rejected';
  updatedAt: string;
  note?: string;
}

interface UpdateRequestBody {
  ids: string[];
  status: 'pending' | 'completed' | 'rejected';
  note?: string;
}

export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const withdrawals = await db
      .collection("withdraws")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray();
    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { ids, status, note }: UpdateRequestBody = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid withdrawal IDs' },
        { status: 400 }
      );
    }

    if (!['pending', 'completed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    
    const objectIds = ids.map(id => new ObjectId(id));
    console.log(objectIds)
    const updateData: WithdrawalUpdateData = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (note) {
      updateData.note = note;
    }

    const result = await db.collection('withdraws').updateMany(
      { _id: { $in: objectIds } },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'No withdrawals found to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} withdrawal(s)`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating withdrawals:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update withdrawals' },
      { status: 500 }
    );
  }
}