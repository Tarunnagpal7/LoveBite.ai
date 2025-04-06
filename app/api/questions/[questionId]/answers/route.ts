import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { answerSchema } from "@/schemas/questionsForm";
import authOptions from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";
import questionModel from "@/models/Questions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = answerSchema.parse(body);
    const { questionId } = await params;
    const databaseQuestionId = new mongoose.Types.ObjectId(questionId);

    const answer  = ({
      content: validatedData.content,
      author: {
        _id: session.user._id || '',
        name: session.user.name || "" ,
        image: session.user.image || "" ,
      },
      reactions: [],
      replies: []
    });

    await questionModel.updateOne(
        {_id : databaseQuestionId},
        {$push : {answers : answer}}
    )

    return NextResponse.json({ 
      message: "Answer added successfully",
      success : true,
    });
  } catch (error) {
    console.error("Error adding answer:", error);
    return NextResponse.json(
      { error: "Failed to add answer" },
      { status: 500 }
    );
  }
}