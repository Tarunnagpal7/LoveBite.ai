import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import questionModel from "@/models/Questions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await dbConnect();
    const {questionId} = await params
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

    return NextResponse.json({ question , success: true, message: "Question fetched successfully" });

  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}