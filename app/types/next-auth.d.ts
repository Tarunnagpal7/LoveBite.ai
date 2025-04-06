import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {

    interface Session{
        user: {
            name ?: string;
            email ?: string;
            image ?: string;
            googleId ?: string;
            profileCompleted ?: boolean;
            _id ?: string;
        } & DefaultSession["user"];
          
    }

}


declare module 'next-auth/jwt' {
    interface JWT {
        name ?: string;
        email ?: string;
        image ?: string;
        googleId ?: string;
        profileCompleted ?: boolean;
        _id ?: string;
    }
}