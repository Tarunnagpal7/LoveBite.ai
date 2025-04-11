import dbConnect from "@/lib/mongodb";
import authOptions from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import creditModel, { Credit } from "@/models/Credits";
import { NextResponse } from "next/server";

export async function GET() {

    try{
        await dbConnect();
        const session = await getServerSession(authOptions);
        if(!session?.user){
            return NextResponse.json({
                message  : "unauthorized",
                success : false
            })
        }
        const credits : Credit | null = await creditModel.findOne({
            userId : session.user._id
        });

        if(!credits){
            return NextResponse.json({
                message : "User has not any active plans",
                success : true
            })
        }

        return NextResponse.json({
            messgae : "User credits fetched",
            success : true,
            credit : credits.remaining
        })
    }catch(error){
        console.log("user credits fetching error : ", error)
        return NextResponse.json({
            message : "user credits fetching error",
            success : false
        })
    }
    
}


export async function POST(req : Request) {

    try{
        await dbConnect();
        const session = await getServerSession(authOptions);
        if(!session?.user){
            return NextResponse.json({
                message  : "unauthorized",
                success : false
            })
        }

        const {credit} = await req.json();
        console.log(credit)

        const updatedCredit = await creditModel.findOneAndUpdate(
            { userId: session.user._id },
            {
              $set: {
                remaining: credit,
              },
            },
            { new: true } // <- returns the updated document
          );
          

        if(!updatedCredit){
            return NextResponse.json({
                message : "Failed to update",
                success : true
            })
        }

        return NextResponse.json({
            messgae : "User credits Updated",
            success : true,
        })
    }catch(error){
        console.log("user credits update error : ", error)
        return NextResponse.json({
            message : "user credits update error",
            success : false
        })
    }
    
}



