import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import compatibilityModel from "@/models/Compatibility";

export async function GET() {
  try {
    await dbConnect();

    const topCouples = await compatibilityModel
      .aggregate([
        {
          $match: { test_status: "Completed" }
        },
        {
          $sort: { score: -1 }
        },
        {
          $limit: 10
        },
        {
          $lookup: {
            from: "relationships",
            localField: "relationshipId",
            foreignField: "_id",
            as: "relationsUser"
          }
        },
        {
          $unwind: "$relationsUser"
        },
        {
          $addFields: {
            senderObjId: { $toObjectId: "$relationsUser.user_sender_id" },
            receiverObjId: { $toObjectId: "$relationsUser.user_receiver_id" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "senderObjId",
            foreignField: "_id",
            as: "user1"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "receiverObjId",
            foreignField: "_id",
            as: "user2"
          }
        },
        {
          $project: {
            score: 1,
            relationshipId: 1,
            createdAt: 1,
            "user1": { $arrayElemAt: ["$user1", 0] },
            "user2": { $arrayElemAt: ["$user2", 0] }
          }
        },
        {
          $project: {
            score: 1,
            relationshipId: 1,
            createdAt: 1,
            "user1._id": 1,
            "user1.name": 1,
            "user1.image": 1,
            "user2._id": 1,
            "user2.name": 1,
            "user2.image": 1
          }
        }
      ]
      )
      .exec();

      // console.log(topCouples);

    return NextResponse.json({ couples: topCouples });

  } catch (error) {
    console.error("Error fetching top couples:", error);
    return NextResponse.json(
      { error: "Failed to fetch top couples" },
      { status: 500 }
    );
  }
}
