import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import userModel from "@/models/User";
// import userModel from "@/models/User";

const authOptions : NextAuthOptions = {
    providers:[
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    session: {
      strategy: "jwt",
    },
    callbacks:{
        async signIn({ user, account, profile }) {
            try {
             await dbConnect();
              
              // Check if user exists
              const existingUser = await userModel.findOne({ email: user.email });
              
              if (!existingUser) {
                // Create new user
                await userModel.create({
                  email: user.email,
                  name: user.name,
                  image: user.image,
                  googleId : profile?.sub,
                  profileCompleted : false
                });
              }
              
              return true;
              
            } catch (error) {
              console.error("Error during sign in:", error);
              return false;
            }
          },

          async jwt({token,profile}){
            try{
              await dbConnect();
              const user = await userModel.findOne({email: token.email});
              if(user && profile){
                token.profileCompleted = user.profileCompleted;
                token._id = user._id?.toString();
                token.name = profile.name;
                token.email = profile.email; 
                token.image = profile.image;
                token.googleId = profile.sub;
              }

            }catch(err){
              console.error("Error during JWT callback:", err);
            }
              return token;
          },
          async session({session, token}){
            if(token){
              session.user.name = token.name; 
              session.user.email = token.email;
              session.user.image = token.image;
              session.user.googleId = token.googleId
              session.user._id = token._id;
              session.user.profileCompleted = token.profileCompleted;
            }
            return session;
          }
          
    }
}

export default authOptions;