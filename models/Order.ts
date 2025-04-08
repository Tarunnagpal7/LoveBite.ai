import mongoose,{Schema,Document} from "mongoose";


export interface Order extends Document{
   userId : string;
   amount : number;
   razorOrderId : string;
   currentPlan : string;
   createdAt : Date;
   paymentStatus : boolean;
}


const orderSchema : Schema<Order> = new mongoose.Schema({
    amount : {type : Number, required : true},
    userId : {type : String, required : true},
    razorOrderId : {type : String, required : true},
    currentPlan : {type : String, required : true},
    createdAt : {type : Date , default : Date.now()},
    paymentStatus : {type : Boolean , default : false}
})


const orderModel = (mongoose.models.Order as mongoose.Model<Order>) || mongoose.model<Order>("Order",orderSchema);

export default orderModel;