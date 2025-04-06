import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/options";
import questionModel from "@/models/Questions";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ questionId: string }>}
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;
    const databaseQuestionId = new mongoose.Types.ObjectId(questionId);

    
    const question = await questionModel.findOne({
      _id: databaseQuestionId,
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const hasUpvoted = question.upvotes.filter((upvote)=> upvote.toString() === session.user._id).length > 0;

    if (hasUpvoted) {
      await questionModel.updateOne(
        { _id: databaseQuestionId },
        { $pull: { upvotes: session.user._id } }
      );
    } else {
      await questionModel.updateOne(
        { _id: databaseQuestionId },
        { $push: { upvotes: session.user._id } }
      );
    }

    return NextResponse.json({ message: "Upvote updated successfully", success: true });
  } catch (error) {
    console.error("Error updating upvote:", error);
    return NextResponse.json(
      { error: "Failed to update upvote" },
      { status: 500 }
    );
  }
}