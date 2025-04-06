import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { replySchema } from "@/schemas/questionsForm";
import authOptions from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";
import questionModel from "@/models/Questions";

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

    const body = await req.json();
    const validatedData = replySchema.parse(body);
    const { questionId, answerId } = await params;

    const databaseQuestionId = new mongoose.Types.ObjectId(questionId);
    const databaseAnswerId = new mongoose.Types.ObjectId(answerId);

    const reply = {
      content: validatedData.content,
      author: {
        _id: session.user._id,
        name: session.user.name,
        image: session.user.image,
      },
      reactions: []
    };

    await questionModel.updateOne(
      { 
        _id: databaseQuestionId,
        "answers._id": databaseAnswerId
      },
      { $push: { "answers.$.replies": reply } }
    );

    return NextResponse.json({ 
      message: "Reply added successfully",
      success : true
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    return NextResponse.json(
      { error: "Failed to add reply" },
      { status: 500 }
    );
  }
}