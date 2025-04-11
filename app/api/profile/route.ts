import userModel from "@/models/User";
import dbConnect from "@/lib/mongodb";
import authOptions from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import relationshipModel from "@/models/Relationship";
import questionModel from "@/models/Questions";

export async function GET() {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({
                message: "user is not authorized",
                success: false
            });
        }

        const profile = await userModel.findOne({ email: session.user.email });

        if (!profile) {
            return NextResponse.json({
                message: "user not found",
                success: false
            });
        }

        let relationship = null;
        if (profile.inRelation === 'in a relationship') {
            relationship = await relationshipModel.findOne({
                $or: [
                    {
                        user_sender_id: profile._id,
                        status: "accepted"
                    },
                    {
                        user_receiver_id: profile._id,
                        status: "accepted"
                    }
                ]
            }).populate('user_sender_id user_receiver_id', 'name email image');
    
            // Determine who is the partner (the other person)
            if (relationship) {
                const partnerId = relationship.user_sender_id.toString() === profile._id?.toString() 
                    ? relationship.user_receiver_id 
                    : relationship.user_sender_id;
                    
                const partnerDetails = await userModel.findById(partnerId, 'name email image');
                relationship = {
                    ...relationship.toObject(),
                    partner_details: partnerDetails
                };
            }
        }
        
        // Get relationship history with "ended" status
        const relationshipHistory = await relationshipModel.find({
            $or: [
                {
                    user_sender_id: profile._id,
                    status: "ended"
                },
                {
                    user_receiver_id: profile._id,
                    status: "ended"
                }
            ]
        }).populate('user_sender_id user_receiver_id', 'name email image')
          .sort({ updatedAt: -1 }); // Sort by most recent ended relationship first
        
        // Add partner details to each historical relationship
        const enhancedRelationshipHistory = await Promise.all(relationshipHistory.map(async (rel) => {
            const partnerId = rel.user_sender_id.toString() === profile._id?.toString()
                ? rel.user_receiver_id
                : rel.user_sender_id;
                
            const partnerDetails = await userModel.findById(partnerId, 'name email image');
            return {
                ...rel.toObject(),
                partner_details: partnerDetails
            };
        }));

        const questions = await questionModel.find({ "author._id": session.user._id });
        
        return NextResponse.json({
            message: "Profile Fetched",
            success: true,
            profile,
            relationship,
            relationshipHistory: enhancedRelationshipHistory,
            questions
        });

    } catch (error) {
        console.log('Profile Error : ', error);
        return NextResponse.json({
            message: "profile fetching error",
            success: false
        });
    }
}