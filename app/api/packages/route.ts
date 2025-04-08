import dbConnect from "@/lib/mongodb";
import packageModle from "@/models/Packages";
import { NextResponse } from "next/server";

export async function GET(){
    try{

        await dbConnect();

        const packages = await packageModle.find();

        if(!packages){
            return NextResponse.json({
                message : "package fetching error",
                success : false
              })
        }

        return NextResponse.json({
            message : "Package Fetched succesfully",
            success : true,
            packages
          })

    }catch(error){
        console.log("Package Fetching Error : ", error);
        return NextResponse.json({
          message : "package fetching error",
          success : false
        })
    }
}