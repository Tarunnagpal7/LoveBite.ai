import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { profileSchema } from "@/schemas/profileSchema";
import authOptions from "../../auth/[...nextauth]/options";
import userModel from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = profileSchema.parse(body);


    await userModel.updateOne(
      { email: session.user.email },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ 
      success: true,
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}