import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/[...nextauth]/options";
import compatibilityModel from "@/models/Compatibility";
import testresponseModel from "@/models/TestResponse";
import resultModel from "@/models/ResultInsights";
import axios from "axios";
import relationshipModel from "@/models/Relationship";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { compatibilityId, responses } = await req.json();

    // Save final responses
    for (const response of responses) {
      await testresponseModel.findOneAndUpdate(
        {
          compatibilityId,
          userId: session.user._id,
          testquestionId: response.questionId
        },
        {
          response_text: response.response_text,
          selected_option: response.selected_option
        },
        { upsert: true }
      );
    }

    // Update compatibility test status
    const compatibility = await compatibilityModel.findById(compatibilityId);
    if (!compatibility) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Determine which user completed the test
    const databaseRelationshipId = new mongoose.Types.ObjectId(compatibility.relationshipId);
    const relationship = await relationshipModel.findById({_id : databaseRelationshipId});
    if (!relationship) {
      return NextResponse.json({ error: "Relationship not found" }, { status: 404 });
    }

    // Determine which user completed the test based on relationship roles
    const isUser1 = relationship.user_sender_id === session.user._id;
    const updateField = isUser1 ? "user1_completed" : "user2_completed";
    
    await compatibilityModel.findByIdAndUpdate(compatibilityId, {
      [updateField]: true
    });

    // Check if both users have completed
    const updatedCompatibility = await compatibilityModel.findById(compatibilityId);
    if (updatedCompatibility?.user1_completed && updatedCompatibility?.user2_completed) {
      // Get all responses for analysis
      const allResponses = await testresponseModel.find({ compatibilityId });
      // console.log(allResponses)

      // Send to Python backend for analysis
      const analysisResponse = await axios.post(
        `${process.env.PYTHON_API_URL}/analyze`,
        { responses: allResponses }
      );

      const { score, strengths, weaknesses, suggestions } = analysisResponse.data;

      // Update compatibility score
      await compatibilityModel.findByIdAndUpdate(compatibilityId, {
        score,
        test_status: "Completed"
      });

      // Create result insight
      await resultModel.create({
        compatibilityId,
        score,
        strengths,
        weaknesses,
        suggestions
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({  completed: true });
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}