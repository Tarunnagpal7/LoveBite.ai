import dbConnect from "@/lib/mongodb";
import creditModel from "@/models/Credits";
import authOptions from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import packageModle from "@/models/Packages";

export async function POST(req:Request,
    {params} : {params : Promise<{packageId:string}>}
) {
    try{
        await dbConnect();

        const session = await  getServerSession(authOptions);
        if(!session?.user){
            return NextResponse.json({
                message : "user is not authenticate",
                success : false
            })
        }
        const {packageId} = await params
        console.log(packageId)

        const packages = await packageModle.findById({_id : packageId});
        if(!packages){
            return NextResponse.json({
                message : "Package not found",
                success : false
            })
        }

        await creditModel.create({
            userId : session.user._id,
            remaining : packages.credit ,
            currentPlan : packages.name,
        })

        return NextResponse.json({
            message : "Credit created",
            success : true
        })

    }catch(error){
        console.log("Credit Error : ", error)
        return NextResponse.json({
            message : "credit error",
            success : false
        })
    }
    
}


export async function GET(){
    try{
        await dbConnect();
        const session = await getServerSession(authOptions);
        if(!session?.user){
            return NextResponse.json({
                message : "user is not authenticate",
                success : false
            })
        }

        const credit = await creditModel.find({userId : session.user._id});

        if(!credit){
            return NextResponse.json({
                message : "user credit fetching error",
                succes : false
            })
        }

        return NextResponse.json({ 
            message : "user credits fetched",
            sucess : true,
            credit
        })



    }catch(error){
        console.log("Credit Fetching error : ", error);
        return NextResponse.json({
            message : "credit fetching error",
            success : false
        })
    }
}