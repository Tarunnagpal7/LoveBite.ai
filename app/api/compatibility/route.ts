import dbConnect from "@/lib/mongodb";
import compatibilityModel from "@/models/Compatibility";
import { NextResponse } from "next/server";
import authOptions from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import relationshipModel from "@/models/Relationship";
export const dynamic = 'force-dynamic';
export async function GET(req : Request){
    try{
        await dbConnect();
        const session = await getServerSession(authOptions);
        if(!session?.user){
            return NextResponse.json({
                error : "unauthorized",success : false
            },{status : 400})
        }

        const { searchParams } = new URL(req.url);
        const compatibilityId = searchParams.get("compatibilityId");
        
            if (!compatibilityId) {
              return NextResponse.json(
                { error: "compatibilityId is required", success: false },
                { status: 400 }
              );
            }
        const databasecompatibilityId = new mongoose.Types.ObjectId(compatibilityId);
        const compatibility = await compatibilityModel.findById(databasecompatibilityId)
        if(!compatibility){
            return NextResponse.json({
                error : "compatibility not found",success : false
            },{status : 404})
        }
        const relationship = await relationshipModel.findById(compatibility.relationshipId);
        if(!relationship){
            return NextResponse.json({
                error : "No relationship exits",
                success : false
            },{status : 404})
        }

        return NextResponse.json({
            relationshipId : compatibility.relationshipId,
            relationship
            ,success : true
        },{status : 200})
        
    }catch(error){
        console.log(error)
        return NextResponse.json({
            error : "compatibility fetching error",success : false
        },{status : 400})
    }
}