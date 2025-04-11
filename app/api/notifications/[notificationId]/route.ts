import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/[...nextauth]/options";
import { ObjectId } from "mongodb";
import notificationModel from "@/models/Notification";
import mongoose from "mongoose";
// Mark as read
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ notificationId: string }>}
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {notificationId} = await params
    const databaseNotificationId = new mongoose.Types.ObjectId(notificationId);

    await notificationModel.updateOne(
      { 
        _id: databaseNotificationId,
        userId: session.user._id 
      },
      { $set: { read: true } }
    );

    return NextResponse.json({ 
        message : "notification status updated",
        success : true
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { message :  "Failed to update notification" ,
        success : false
      },
      { status: 500 }
    );
  }
}

// Delete notification
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const {notificationId} = await params
    const databaseNotificationId = new mongoose.Types.ObjectId(notificationId);

    await notificationModel.deleteOne({
      _id: databaseNotificationId,
      userId: session.user._id
    });

    return NextResponse.json({ 
        message : "Notification Deleted",
        success : true
     });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { message : "Failed to delete notification", success : false },
      { status: 500 }
    );
  }
}