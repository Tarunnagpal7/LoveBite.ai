import dbConnect from "@/lib/mongodb";
import authOptions from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import userModel from "@/models/User";
import {  NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req : Request){
   try{
    await dbConnect();
    // const session = await getServerSession(authOptions);
    // if(!session?.user){
    //     return NextResponse.json({
    //         error : "unaithorized",success : false
    //     },{status : 404})
    // }
    // const {partnerId} = await params
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId");

    if (!partnerId) {
      return NextResponse.json(
        { error: "partnerId is required", success: false },
        { status: 400 }
      );
    }
    const databasepartnerId = new mongoose.Types.ObjectId(partnerId);

    const user = await userModel.findById(databasepartnerId);
    console.log(user)

    if(!user){
        return NextResponse.json({
            error : "user not exist",success : false
        },{status : 404})
    }

    return NextResponse.json({
        user,
        success : true
    },{status : 200})

   }catch(error){
    console.log("partner user failed fetched : ", error );
    return NextResponse.json({
        error : "partner user failed fetched",success : false
    })
   }
} 

