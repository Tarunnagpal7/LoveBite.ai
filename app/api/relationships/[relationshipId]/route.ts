import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import relationshipModel from "@/models/Relationship";
import notificationModel from "@/models/Notification";
import userModel from "@/models/User";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ relationshipId: string }> }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
    }

    const { status } = await req.json();
    const { relationshipId } = await params;
    const databaseRelationshipId = new mongoose.Types.ObjectId(relationshipId);

    const relationship = await relationshipModel.findById({
      _id: databaseRelationshipId,
    });

    if (!relationship) {
      return NextResponse.json(
        { message: "Relationship not found" },
        { status: 404 }
      );
    }

    // Handle 'accepted' status
    if (status === 'accepted') {
      const sendedUserId = relationship.user_sender_id === session.user._id 
        ? relationship.user_receiver_id 
        : relationship.user_sender_id;
        
      const checkSenderIsInRelation = await relationshipModel.findOne({
        "$or": [{
          user_sender_id: sendedUserId,
          status: "accepted",
        }, {
          user_receiver_id: sendedUserId,
          status: "accepted"
        }]
      });
        
      if (checkSenderIsInRelation) {
        return NextResponse.json(
          { message: "User is in relationship with other", success: false },
          { status: 404 }
        );
      }
    

    const checkUserIsInRelation = await relationshipModel.findOne({
      "$or": [{
        user_sender_id: session.user._id,
        status: "accepted",
      }, {
        user_receiver_id: session.user._id,
        status: "accepted"
      }]
    });
      
    if (checkUserIsInRelation) {
      return NextResponse.json(
        { message: "You are in relationship with someone ", success: false },
        { status: 404 }
      );
    }


    // Update relationship status
    await relationshipModel.updateOne(
      { _id: databaseRelationshipId },
      {
        $set: {
          status: status,
          updatedAt: new Date()
        }
      }
    );

  }

    // Determine user status based on relationship status
    let userStatus = 'single';
    if (status === 'accepted') {
      userStatus = "in a relationship";
    } else if (status === 'ended') {
      userStatus = 'single';
    }

    // Get the other user ID
    const otherUserId = relationship.user_sender_id.toString() === session.user._id
      ? relationship.user_receiver_id
      : relationship.user_sender_id;

    // Update current user's status
    await userModel.updateOne(
      { _id: session.user._id },
      {
        $set: {
          inRelation: userStatus
        }
      }
    );

    // Update other user's status
    await userModel.updateOne(
      { _id: otherUserId },
      {
        $set: {
          inRelation: userStatus
        }
      }
    );

    // Create appropriate notification
    let notificationMessage = '';
    let notificationRecipient = null;

    if (status === 'accepted') {
      notificationMessage = `${session.user.name} has accepted your relationship request`;
      notificationRecipient = relationship.user_sender_id;
    } else if (status === 'ended') {
      notificationMessage = `${session.user.name} has ended the relationship`;
      notificationRecipient = otherUserId;
    }

    if (notificationMessage && notificationRecipient) {
      const notification = {
        userId: notificationRecipient,
        message: notificationMessage,
        createdAt: new Date(),
        read: false
      };
      
      await notificationModel.create(notification);
    }

    const responseMessage = status === 'accepted' 
      ? "request accepted" 
      : status === 'ended' 
        ? "relationship ended" 
        : "status updated";

    return NextResponse.json({ message: responseMessage, success: true });
  } catch (error) {
    console.error("Error updating relationship:", error);
    return NextResponse.json(
      { message: "Failed to update relationship", success: false },
      { status: 500 }
    );
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ relationshipId: string }>}
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized", success : false }, { status: 401 });
    }

    const {relationshipId } = await params
    const databaseRelationshipId = new mongoose.Types.ObjectId(relationshipId)

    const relationship = await relationshipModel.findById({_id : relationshipId});

    if(!relationship){
        return NextResponse.json({
            message : "relationship not existed",
            success : false
        })
    }
    

    
    await relationshipModel.deleteOne(
        { _id: databaseRelationshipId },
    );
    
    const notification = {
      userId: relationship.user_sender_id,
      message: `${session.user.name} has decline your relationship request`,
      createdAt: new Date(),
      read: false
    };

    await notificationModel.create(notification);

    return NextResponse.json({ messgae : "request declined",success: true });
  } catch (error) {
    console.error("Error updating relationship:", error);
    return NextResponse.json(
      { message : "Failed to update relationship" ,success : false},
      { status: 500 }
    );
  }
}