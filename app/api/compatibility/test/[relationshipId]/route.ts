import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/options";
import compatibilityModel from "@/models/Compatibility";
import testresponseModel from "@/models/TestResponse";
import mongoose from "mongoose";
export const dynamic = 'force-dynamic';
export async function GET(
  req: Request,
  { params }: { params: Promise<{ relationshipId: string }>}
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { relationshipId } = await  params;
    
    if (!relationshipId || !mongoose.Types.ObjectId.isValid(relationshipId)) {
      return NextResponse.json({ error: "Invalid relationship ID" }, { status: 400 });
    }

    // Convert string ID to ObjectId if needed
    const objectId = new mongoose.Types.ObjectId(relationshipId);
    
    // Find compatibility test for this relationship
    const compatibility = await compatibilityModel.findOne({
      relationshipId: objectId
    });

    if (!compatibility) {
      return NextResponse.json({ compatibility: null, userResponses: [] });
    }

    // Get user's responses if test exists
    const userResponses = await testresponseModel.find({
      compatibilityId: compatibility._id,
      userId: session.user._id
    });

    return NextResponse.json({ 
      compatibility,
      userResponses
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}