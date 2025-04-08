import userModel from "@/models/User";
import dbConnect from "@/lib/mongodb";
import authOptions from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try{

        await dbConnect();

        const session = await getServerSession(authOptions);
        if(!session?.user){
            return NextResponse.json({
                message : "user is not authorized",
                success : false
            })
        }

        const profile = await userModel.findOne({email : session.user.email});

        if(!profile){
            return NextResponse.json({
                message : "user not found",
                success : false
            })
        }


        return NextResponse.json({
            message : "Profile Fetch",
            success : true,
            profile
        })

    }catch(error){
        console.log('Profile Error : ', error);
        return NextResponse.json({
            message : "profile fetching error",
            success : false
        })
    }
    
}