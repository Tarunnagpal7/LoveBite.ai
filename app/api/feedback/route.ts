import authOptions from "../auth/[...nextauth]/options";
import feedbackModel from "@/models/Feedback";
import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { feedbackFormSchema } from "@/schemas/feedbackForm";
import { getServerSession } from "next-auth";

export  async function POST(req: Request) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "user is not authorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const validatedData = feedbackFormSchema.parse(body);
        console.log("validatedData", validatedData);
        const { message, rating } = validatedData;

        // const existingFeedback = await feedbackModel.findOne({ userId: session.user._id });
        // if (existingFeedback) {
        //     await existingFeedback.updateOne({
        //         message : message,
        //         rating: rating,
        //     })
        // }
        // else {

            const feedback = {
                userId: session.user._id as string,
                message: message,
                rating: rating,
            }

            await feedbackModel.create(feedback);
        // }

        return NextResponse.json({
            message: "Feedback added successfully",
            success: true,
        });

    } catch (error) {
        console.error("Error adding feedback:", error);
        return NextResponse.json(
            { error: "Failed to add feedback" },
            { status: 500 }
        );
    }
}


export async function GET() {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "user is not authorized" },
                { status: 401 }
            );
        }

        const feedbacks = await feedbackModel.findOne({ userId: session.user._id });
        return NextResponse.json({
            message: "Feedback fetched successfully",
            success: true,
            feedbacks: feedbacks
        });

    } catch (error) {
        console.error("Error adding feedback:", error);
        return NextResponse.json(
            { error: "Failed to add feedback" },
            { status: 500 }
        );
    }
}