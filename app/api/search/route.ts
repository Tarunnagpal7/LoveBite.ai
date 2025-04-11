import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import userModel from "@/models/User";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({message : "Unauthorized",success : false }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    
    const users = await userModel
      .find({
        _id: { $ne: session.user._id }, // Exclude current user
        name: { $regex: query, $options: "i" }
      })
      .select({
        _id: 1,
        name: 1,
        image: 1
      })
      .limit(10)
      .exec();

    return NextResponse.json({message : "users fetched" , success : true , users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { message : "Failed to search users", success : false },
      { status: 500 }
    );
  }
}