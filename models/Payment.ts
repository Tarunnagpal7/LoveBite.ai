import { truncate } from "fs/promises";
import mongoose,{Schema,Document} from "mongoose";
import { string } from "zod";

export interface Payment extends Document{
    userId : string;
    amount : number;
    razorOrderId : string;
    razorPaymentId : string;
    createdAt : Date;
}


const paymentSchema:Schema<Payment> = new mongoose.Schema({
    userId : {type : String, required : true},
    amount : {type : Number , required : true},
    razorOrderId : {type : String, required : true, index : true},
    razorPaymentId : { type : String, requried : true },
    createdAt : {type : Date , default : Date.now()},
})



const paymentModel = (mongoose.models.Credit as mongoose.Model<Payment>) || mongoose.model<Payment>("Payment",paymentSchema);

export default paymentModel;