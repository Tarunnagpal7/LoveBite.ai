import mongoose, {Schema , Document} from "mongoose";

export interface Notification extends Document{
  userId: string;
  message: string;
  createdAt: Date;
  read: boolean;
  type ?: string;
  relationshipId ?: string;
}

const notificationSchema : Schema<Notification> = new mongoose.Schema({
    userId : {type : String,required : true},
    message : {type : String, required : true},
    createdAt : {type : Date, default : Date.now()},
    read : {type : Boolean , default : false},
    type : {type : String},
    relationshipId : {type : String}

})

const notificationModel = (mongoose.models.Notification as mongoose.Model<Notification>) || mongoose.model<Notification>("Notification",notificationSchema );

export default notificationModel