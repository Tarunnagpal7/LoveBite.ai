import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/options";
import questionModel from "@/models/Questions";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ questionId: string; answerId: string; replyId: string }> }
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

    const { questionId, answerId, replyId } = await params;
    const databaseQuestionId = new mongoose.Types.ObjectId(questionId);
    const databaseAnswerId = new mongoose.Types.ObjectId(answerId);
    const databaseReplyId = new mongoose.Types.ObjectId(replyId);

    // First, find the question to verify it exists and check the reaction state
    const question = await questionModel.findOne({
      _id: databaseQuestionId,
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Find the answer in the question
    const answer = question.answers.find(
      (a: any) => a._id.toString() === databaseAnswerId.toString()
    );

    if (!answer) {
      return NextResponse.json(
        { error: "Answer not found" },
        { status: 404 }
      );
    }

    // Find the reply in the answer
    const reply = answer.replies.find(
      (r: any) => r._id.toString() === databaseReplyId.toString()
    );

    if (!reply) {
      return NextResponse.json(
        { error: "Reply not found" },
        { status: 404 }
      );
    }

    // Check if this reaction type already exists for this reply
    const existingReaction = reply.reactions?.find(
      (r: any) => r.type === reaction
    );

    if (existingReaction) {
      // Check if the user has already reacted
      const userHasReacted = existingReaction.users.includes(userId);

      if (userHasReacted) {
        // Remove the user's reaction
        await questionModel.updateOne(
          {
            _id: databaseQuestionId,
            "answers._id": databaseAnswerId,
            "answers.replies._id": databaseReplyId,
            "answers.replies.reactions.type": reaction
          },
          {
            $pull: {
              "answers.$[answerId].replies.$[replyId].reactions.$[reactionType].users": userId
            }
          },
          {
            arrayFilters: [
              { "answerId._id": databaseAnswerId },
              { "replyId._id": databaseReplyId },
              { "reactionType.type": reaction }
            ]
          }
        );
      } else {
        // Add the user's reaction
        await questionModel.updateOne(
          {
            _id: databaseQuestionId,
            "answers._id": databaseAnswerId,
            "answers.replies._id": databaseReplyId,
            "answers.replies.reactions.type": reaction
          },
          {
            $push: {
              "answers.$[answerId].replies.$[replyId].reactions.$[reactionType].users": userId
            }
          },
          {
            arrayFilters: [
              { "answerId._id": databaseAnswerId },
              { "replyId._id": databaseReplyId },
              { "reactionType.type": reaction }
            ]
          }
        );
      }
    } else {
      // Create a new reaction
      await questionModel.updateOne(
        {
          _id: databaseQuestionId,
          "answers._id": databaseAnswerId,
          "answers.replies._id": databaseReplyId
        },
        {
          $push: {
            "answers.$[answerId].replies.$[replyId].reactions": {
              type: reaction,
              users: [userId]
            }
          }
        },
        {
          arrayFilters: [
            { "answerId._id": databaseAnswerId },
            { "replyId._id": databaseReplyId }
          ]
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