import mongoose, { mongo } from "mongoose";
import { Document, Schema } from "mongoose";

interface Feedback extends Document {
    userId : string;
    message : string;
    rating : number;
}


const feedbackSchema : Schema<Feedback> = new mongoose.Schema({
    userId : {type : String, required : true},
    message : {type : String, required : true},
    rating : {type : Number, required : true}
})

const feedbackModel = (mongoose.models.Feedback as mongoose.Model<Feedback>) || mongoose.model<Feedback>('Feedback',feedbackSchema)
export default feedbackModel;