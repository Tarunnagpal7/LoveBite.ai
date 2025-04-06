
import mongoose from "mongoose";

type ConnectedObject = {
    isConnected ?: number;
};


const connection : ConnectedObject = {};

async function dbConnect()  : Promise<void> {
    // Check if we have a connection to the database
    if(connection.isConnected){
        console.log('Already connected to the database');
        return;
    }
 
    try{
    const db = await mongoose.connect(process.env.MONGODB_URI || '' , {});

    connection.isConnected = db.connections[0].readyState;

    console.log('Connected to database');

    }catch(err){
        throw new Error('Server Error! We are Trying to fix it')
        console.log(err);
        process.exit(1);
    }
  
}

export default dbConnect;