import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import relationshipModel from "@/models/Relationship";
import { Relationship } from "@/models/Relationship";
import notificationModel from "@/models/Notification";

// Send relationship request
export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" , success : false}, { status: 401 });
    }

    const { receiverId } = await req.json();
 
    // Check if a relationship already exists
    const existingRelationship = await relationshipModel.findOne({
      $or: [
        { 
          user_sender_id: session.user._id,
          user_receiver_id: receiverId,
          status : 'accepted'
        },
        {
          user_sender_id: receiverId,
          user_receiver_id: session.user._id,
          status :'accepted'
        },{
            user_sender_id : session.user._id,
            status : 'accepted'
        },{
            user_receiver_id : session.user._id,
            status : 'accepted'
        },{
            user_sender_id : receiverId,
            status : 'accepted'
        },{
            user_receiver_id : receiverId,
            status : 'accepted'
        }
      ]
    });

    if (existingRelationship) {
      // console.log("existed")
      return NextResponse.json(
        { message : "User is in relationship with someone! request cannot be sended",
            success : false
         },
        { status: 400 }
      );
    }

    const pendingRelationship = await relationshipModel.findOne({
      $or: [
        { 
          user_sender_id: session.user._id,
          user_receiver_id: receiverId,
          status : 'pending'
        },
        {
          user_sender_id: receiverId,
          user_receiver_id: session.user._id,
          status :'pending'
        },
      ]
    })

    if(pendingRelationship){
      // console.log('pending')
      return NextResponse.json({
        message : "Request is pending",
        success : false,
        status : 'pending'
      })
    }

    const relationship =  await relationshipModel.create({
        user_sender_id: session.user._id,
        user_receiver_id: receiverId,
        status: "pending"
    });

    // Create notification for receiver
    const notification = {
      userId: receiverId,
      message: `${session.user.name} sent you a relationship request`,
      type: "relationship_request",
      relationshipId: relationship._id,
      read: false
    };

    await notificationModel.create(notification);

    return NextResponse.json({ 
      message : "request send",
      success: true,
      relationship 
    });
  } catch (error) {
    console.error("Error creating relationship:", error);
    return NextResponse.json(
      { message : "Failed to send request",success : false },
      { status: 500 }
    );
  }
}

// Get user's relationships
export async function GET(req: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized",success: false }, { status: 401 });
    }

    const relationships = await relationshipModel
      .find({
        $or: [
          { user_sender_id: session.user._id },
          { user_receiver_id: session.user._id }
        ]
      })
      .exec();

    return NextResponse.json({success : true , relationships });
  } catch (error) {
    console.error("Error fetching relationships:", error);
    return NextResponse.json(
      { message : "Failed to fetch relationships",success : false },
      { status: 500 }
    );
  }
}