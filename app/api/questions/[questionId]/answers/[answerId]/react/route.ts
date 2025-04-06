import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/options";
import questionModel from "@/models/Questions";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ questionId: string; answerId: string }>}
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user._id as string;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const { reaction } = await req.json();
    if (!reaction) {
      return NextResponse.json({ error: "Reaction type is required" }, { status: 400 });
    }

    const { questionId, answerId } = await params;
    const databaseQuestionId = new mongoose.Types.ObjectId(questionId);
    const databaseAnswerId = new mongoose.Types.ObjectId(answerId);
   
    const question = await questionModel.findOne({
      _id: databaseQuestionId,
      "answers._id": databaseAnswerId,
    });

    if (!question) {
      return NextResponse.json(
        { error: "Answer not found" },
        { status: 404 }
      );
    }

    const answer = question.answers.find(
      (a: any) => a._id.toString() === databaseAnswerId.toString()
    );

    if (!answer) {
      return NextResponse.json(
        { error: "Answer not found" },
        { status: 404 }
      );
    }

    // Find the index of the answer in the answers array
    const answerIndex = question.answers.findIndex(
      (a: any) => a._id.toString() === databaseAnswerId.toString()
    );

    const existingReaction = answer.reactions.find(
      (r: any) => r.type === reaction
    );

    if (existingReaction) {
      if (existingReaction.users.includes(userId)) {
        // Remove user's reaction
        await questionModel.updateOne(
          { _id: databaseQuestionId },
          { 
            $pull: { 
              [`answers.${answerIndex}.reactions.${existingReaction.type === reaction ? 
                answer.reactions.findIndex((r: any) => r.type === reaction) : 0}.users`]: userId
            } 
          }
        );
      } else {
        // Add user's reaction
        await questionModel.updateOne(
          { _id: databaseQuestionId },
          { 
            $push: { 
              [`answers.${answerIndex}.reactions.${existingReaction.type === reaction ? 
                answer.reactions.findIndex((r: any) => r.type === reaction) : 0}.users`]: userId
            } 
          }
        );
      }
    } else {
      // Create new reaction
      await questionModel.updateOne(
        { _id: databaseQuestionId },
        {
          $push: {
            [`answers.${answerIndex}.reactions`]: {
              type: reaction,
              users: [userId],
            },
          },
        }
      );
    }

    return NextResponse.json({ message: "Reaction updated successfully", success: true });
  } catch (error) {
    console.error("Error updating reaction:", error);
    return NextResponse.json(
      { error: "Failed to update reaction" },
      { status: 500 }
    );
  }
}