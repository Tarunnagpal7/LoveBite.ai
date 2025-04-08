
import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";
import orderModel, { Order } from "@/models/Order";
import mongoose from "mongoose";
import packageModle from "@/models/Packages";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/options";
import { CreateRazorpayInstance } from "@/lib/razorpay";

export async function POST(req : Request,
  {params} : {params : Promise<{packageId : string}>}
){
    try{

        await dbConnect();
        const session = await getServerSession(authOptions);
        if(!session?.user){
          return NextResponse.json({
            message : "user is not authenticate",
            success : false
          })
        }
        const {packageId} = await params;
        console.log(packageId)
        const databasePackageId = new mongoose.Types.ObjectId(packageId);

        const packages = await packageModle.findById({_id : databasePackageId});

        if(!packages){
          return NextResponse.json({
            message : "No package found out",
            success : false
          })
        }

        const amount = packages.price * 100;

        const razorpayInstance =  CreateRazorpayInstance();
        const razorpayOrder = await razorpayInstance.orders.create({
          amount,
          currency: "INR",
          receipt: `order_${Date.now()}`,
        });

        console.log(razorpayOrder)

        if(!razorpayOrder){
          return NextResponse.json({
            message :  "Razorpay Error",
            success : false 
          })
        }

        const creditOrder : Order = await orderModel.create({
          userId : session.user._id,
          currentPlan : packages.name,
          razorOrderId : razorpayOrder.id,
          amount : amount / 100,
        })

        console.log(creditOrder)


        await creditOrder.save();

        return NextResponse.json({
          message : "Credits Order created",
          success : true,
          packageName: creditOrder.currentPlan,
          razorpayOrder
        })


    }
    catch(error){
      console.error("Error occuring while making order", error);
      return NextResponse.json({
        message : "Error occuring while making order",
        success : false
      })
    }
}