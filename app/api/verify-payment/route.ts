import authOptions from "../auth/[...nextauth]/options";
import paymentModel from "@/models/Payment";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import crypto from "crypto"
import orderModel from "@/models/Order";
import creditModel from "@/models/Credits";
import packageModle, { Package } from "@/models/Packages";

export async function POST(req: Request){
  try {
    await dbConnect();
    // console.log("inside payment")

    const session = await getServerSession(authOptions);
    if(!session?.user) {
      return NextResponse.json({
        message: "User is not authenticated",
        success: false
      });
    }

    const { packageId, amount, razorOrderId, razorPaymentId, signature } = await req.json();

    if (!razorOrderId || !razorPaymentId || !signature) {
      return NextResponse.json({
        message: "Required fields are missing",
        success: false
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({
        message: "Payment secret key missing",
        success: false
      });
    }

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorOrderId + "|" + razorPaymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === signature) {
      // console.log("signature verified")
      // Store payment details in DB
      await paymentModel.create({
        userId: session.user._id,
        razorOrderId,
        razorPaymentId,
        amount,
      });

      await orderModel.updateOne(
        { razorOrderId: razorOrderId },
        { $set: { paymentStatus: true } }
      );

      const packages: Package | null = await packageModle.findById(packageId);

      if(!packages) {
        return NextResponse.json({
          message: "Package does not exist, credits cannot update",
          success: false
        });
      }

      // Find user credits and update using the document approach
      const userCredits = await creditModel.findOne({ userId: session.user._id });
      if (!userCredits) {
        // This part seems fine but let's make sure packages.credit is a number
        const creditsToAdd = Number(packages.credit) || 0;
        
        await creditModel.create({
          remaining: creditsToAdd,
          currentPlan: packages.name,
          userId: session.user._id
        });
      } else {
        // Make sure both values are numbers before adding
        const currentRemaining = Number(userCredits.remaining) || 0;
        const creditsToAdd = Number(packages.credit) || 0;
        
        // Update credits directly on the document
        userCredits.remaining = currentRemaining + creditsToAdd;
        userCredits.currentPlan = packages.name;
        userCredits.updateAt = new Date();
        
        // Debug
        console.log("Current remaining:", currentRemaining);
        console.log("Credits to add:", creditsToAdd);
        console.log("New remaining:", userCredits.remaining);
        
        await userCredits.save();
      }
      // Save the updated document (with all required fields intact)

      return NextResponse.json({
        message: "Payment successfully processed",
        success: true
      });
    } else {
      return NextResponse.json({
        message: "Payment signature verification failed",
        success: false
      });
    }
  } catch (error) {
    console.log("Payment Failed", error);
    return NextResponse.json({
      message: "Payment Failed",
      success: false
    });
  }
}