import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/[...nextauth]/options";
import compatibilityModel from "@/models/Compatibility";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { relationshipId } = await req.json();
    console.log(relationshipId)

    // Check for existing compatibility test
    let compatibility = await compatibilityModel.findOne({ relationshipId: relationshipId });

    if (!compatibility) {
      // Create new compatibility test
      compatibility = await compatibilityModel.create({
        relationshipId: relationshipId,
        test_status: "In Progress",
        user1_completed: false,
        user2_completed: false
      });
    }

    return NextResponse.json({ 
      success: true,
      compatibilityId: compatibility._id 
    });

  } catch (error) {
    console.error("Error starting compatibility test:", error);
    return NextResponse.json(
      { error: "Failed to start compatibility test" },
      { status: 500 }
    );
  }
}