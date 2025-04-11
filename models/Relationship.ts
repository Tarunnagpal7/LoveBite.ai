
import mongoose,{Schema,Document} from "mongoose";

export interface Relationship extends Document {
    user_sender_id: string;
    user_receiver_id: string;
    status: "pending" | "accepted" | "declined" | 'ended';
    createdAt: Date;
    updatedAt: Date;
  }


  
  const relationshipSchema : Schema<Relationship> = new mongoose.Schema({
    user_sender_id : {type : String,required : true},
    user_receiver_id : {type : String, required : true},
    status : {type : String, enum : ['pending','accepted','declined','ended'], default : 'pending'},
    createdAt : {type : Date , default : Date.now()},
    updatedAt : {type : Date }
  })


  const relationshipModel = (mongoose.models.Relationship as mongoose.Model<Relationship>) || mongoose.model<Relationship>('Relationship',relationshipSchema);

  export default relationshipModel;


