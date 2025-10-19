import { getUser } from "@/lib/getUser";
import { connectDB } from "@/lib/mongodb";
import Gig from "@/models/Gig";
import OrderModel from "@/models/Order";
import PaymentModel from "@/models/Payment";
import TransactionModel from "@/models/Transaction";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (user.userType !== "client") {
      return NextResponse.json(
        { error: "You are not a client" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const { paymentMethod, transactionId, amount, paymentNumber, gigId } = body;

    if (
      !paymentMethod ||
      !transactionId ||
      !amount ||
      !paymentNumber ||
      !gigId
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    //chect if payment already exist
    const exPayment = await PaymentModel.findOne({
      trxId: transactionId,
      method: paymentMethod,
    });
    if (exPayment) {
      return NextResponse.json(
        { error: "Payment already exist" },
        { status: 400 }
      );
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 400 });
    }
    if (gig.price !== amount) {
      return NextResponse.json(
        { error: "Amount does not match" },
        { status: 400 }
      );
    }
    const payment = await PaymentModel.create({
      user: user._id,
      amount,
      type: "order",
      trxId: transactionId,
      method: paymentMethod,
    });

    const order = await OrderModel.create({
      freelancer: gig.freelancer,
      client: user._id,
      users: [user._id, gig.freelancer],
      gig: gig._id,
      payment: payment._id,
      amount,
      status: "paid",
      totalAmount: gig.price,
    });

    const transaction = await TransactionModel.create({
      user: gig.freelancer,
      amount,
      type: "credit",
      method: "order_payment",
      status: "pending",
      order: order._id,
      client: user._id,
      payment: payment._id,
    });

    return NextResponse.json({ order, payment, transaction });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
