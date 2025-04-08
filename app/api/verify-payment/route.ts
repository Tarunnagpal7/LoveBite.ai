import authOptions from "../auth/[...nextauth]/options";
import paymentModel from "@/models/Payment";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import crypto from "crypto"
import orderModel from "@/models/Order";
import creditModel from "@/models/Credits";
import packageModle, { Package } from "@/models/Packages";

export async function POST(req : Request){
 
   try{
     await dbConnect();

     const session = await getServerSession(authOptions);
     if(!session?.user){
        return NextResponse.json({
           message : "user in not authenticate",
           success : false
        })
     }

     const {packageId ,amount , razorOrderId , razorPaymentId , signature} = await req.json();

     if (!razorOrderId||!razorPaymentId || !signature) {
        return NextResponse.json({
            message : "Required Fields is missing",
            success : false
        })
       }

     const secret = process.env.RAZORPAY_KEY_SECRET;
       if (!secret) {
           return NextResponse.json({
             message : "Payment secret key missing",
             success : false
           }) 
       }

       const hmac = crypto.createHmac("sha256", secret);
       hmac.update(razorOrderId + "|" + razorPaymentId);
       const generatedSignature = hmac.digest("hex");

       if (generatedSignature === signature) {
        // Store payment details in DB
        await paymentModel.create({
            userId : session.user._id,
            razorOrderId,
            razorPaymentId,
            amount,
        });

        await orderModel.updateOne(
          { razorOrderId: razorOrderId }, // filter
          { $set: { paymentStatus: true } } // update
        );

        const packages : Package | null = await packageModle.findById(packageId);

        if(!packages){
          return NextResponse.json({
            message : "package does not esit credits cannot update",
            success : false
          })
        }

        const userCredits = await creditModel.findOne({ userId: session.user._id });
        if (!userCredits) {
          return NextResponse.json({
            message: "User credits not found",
            success: false
          });
        }

        await creditModel.updateOne(
          { userId: session.user._id }, // filter
          { $set: { remaining: userCredits.remaining + packages.credit } } // update
        );

        return NextResponse.json({
            message : "Payment Succesfully done",
            success : true
        })

      }
    }
   catch(error){
    console.log("Payment Failed", error)
    return NextResponse.json({
        message : "Payment Failed",
        success : true
    })

   }
}
