import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import notificationModel from "@/models/Notification";

// Get notifications
export async function GET() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" , success : false}, { status: 401 });
    }


    const userNotifications = await notificationModel
      .find({ userId: session.user._id })
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({
        message : "notification fetched",
        success : true,
        notifications: userNotifications 
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { message : "Failed to fetch notifications", succes : false },
      { status: 500 }
    );
  }
}

// Create notification
export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized", success : false }, { status: 401 });
    }

    const { message } = await req.json();

    const notification = {
      userId: session.user._id,
      message,
    };

    await notificationModel.create(notification)

    return NextResponse.json({ 
      message : "notification created",
      success: true,
      notification 
    });

  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { message: "Failed to create notification", success : false },
      { status: 500 }
    );
  }
}