import mongoose,{Schema,Document} from "mongoose";


export interface Credit extends Document{
   remaining : number;
   userId : string;
   currentPlan : string;
   createdAt : Date;
}


const creditSchema : Schema<Credit> = new mongoose.Schema({
    remaining : {type : Number, required : true},
    userId : {type : String, required : true},
    currentPlan : {type : String, required : true},
    createdAt : {type : Date , default : Date.now()}
})


const creditModel = (mongoose.models.Credit as mongoose.Model<Credit>) || mongoose.model<Credit>("Credit",creditSchema);

export default creditModel;