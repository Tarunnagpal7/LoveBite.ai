import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";

const authOptions : NextAuthOptions = {
    providers:[
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    callbacks:{
        async signIn({ user, account, profile }) {
            try {
              const { db } = await connectToDatabase();
              
              // Check if user exists
              const existingUser = await db.collection("users").findOne({ email: user.email });
              
              if (!existingUser) {
                // Create new user
                await db.collection("users").insertOne({
                  email: user.email,
                  name: user.name,
                  image: user.image,
                  createdAt: new Date(),
                  profileCompleted: false,
                });
              }
              
              return true;
              
            } catch (error) {
              console.error("Error during sign in:", error);
              return false;
            }
          },
          
    }
}

export default authOptions;