// app/api/profile/[usermail]/route.ts
import userModel from "@/models/User";
import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";
import relationshipModel from "@/models/Relationship";
import { IdCard } from "lucide-react";
import mongoose, { mongo } from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId : string }>}
) {
  try {
    await dbConnect();
    
    // Extract and decode the usermail parameter
    const { userId } = await params;
    const decodedEmail = decodeURIComponent(userId);
    const _id  = new mongoose.Types.ObjectId(decodedEmail)
    
    const profile = await userModel.findOne({ _id : _id });
    
    if (!profile) {
      return NextResponse.json({
        message: "User not found",
        success: false
      }, { status: 404 });
    }
    
    let relationship = null;
    
    if (profile.inRelation === 'in a relationship') {
      relationship = await relationshipModel.findOne({
        $or: [
          {
            user_sender_id: userId,
            status: "accepted"
          },
          {
            user_receiver_id: userId,
            status: "accepted"
          }
        ]
      }).populate('user_sender_id user_receiver_id', 'name email image');
      
      // Determine who is the partner (the other person)
      if (relationship) {
        const partnerId = relationship.user_sender_id.toString() === userId?.toString() 
          ? relationship.user_receiver_id 
          : relationship.user_sender_id;
          
        const partnerDetails = await userModel.findById(partnerId, 'name email image');
        relationship = {
          ...relationship.toObject(),
          partner_details: partnerDetails
        };
      }
    }
    
    return NextResponse.json({
      message: "Profile Fetched",
      success: true,
      profile,
      relationship
    });
    
  } catch (error) {
    console.error('Profile Error: ', error);
    return NextResponse.json({
      message: "Profile fetching error",
      success: false
    }, { status: 500 });
  }
}