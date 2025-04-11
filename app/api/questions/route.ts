import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import questionModel from "@/models/Questions";

export async function POST(req: Request) {
    try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    console.log(session)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    console.log(body)

    const { content, tags } = body.data

    const question = {
      content: content,
      tags: tags,
      author: {
        _id: session.user._id,
        name: session.user.name,
        image: session.user?.image || "",
      },
      upvotes: [], // Changed from array to number to match your schema
      answers: [],
      createdAt: new Date(),
    };

   const questionDoc =  await questionModel.create(question);

    return NextResponse.json({ 
      message: "Question Posted successfully",
      success: true,
      questionId : questionDoc._id,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5"); // Default to 5 questions per page
    const search = searchParams.get("search") || "";

    const query = search
      ? {
          content: { $regex: search, $options: "i" }
        }
      : {};

    const skip = (page - 1) * limit;
    
    // Using Mongoose methods instead of MongoDB driver methods
    const [questions, total] = await Promise.all([
      questionModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name image')
        .lean(),
      questionModel.countDocuments(query),
    ]);

    return NextResponse.json({
      questions,
      total,
      currentPage: page,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}