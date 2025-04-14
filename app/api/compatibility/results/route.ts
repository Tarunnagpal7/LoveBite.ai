import dbConnect from "@/lib/mongodb";
import authOptions from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import resultModel from "@/models/ResultInsights";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req : Request){
  try{
    await dbConnect();
    const session = await getServerSession(authOptions);
    if(!session?.user){
        return NextResponse.json({
            error : "unauthorized user",
            success : false
        },{status : 404})
    }
        const { searchParams } = new URL(req.url);
        const compatibilityId = searchParams.get("compatibilityId");
    
        if (!compatibilityId) {
          return NextResponse.json(
            { error: "compatibilityId is required", success: false },
            { status: 404 }
          );
        }

        const databasecompatibilityId = new mongoose.Types.ObjectId(compatibilityId);

        const results = await resultModel.findOne({compatibilityId : databasecompatibilityId});

        if(!results){
            return NextResponse.json(
                { error: "result not found", success: false },
                { status: 404 }
              );
        }

        return NextResponse.json(
            { results , message: "Result fetched", success: true },
            { status: 200 }
          );

  }catch(error){
    console.log('Result fetching error : ',error)
    return NextResponse.json({
        error : "Result fetching error",
        success : false
    })
  }
}