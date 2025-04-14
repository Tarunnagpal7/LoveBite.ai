import mongoose,{Schema,Document} from "mongoose";


export interface Credit extends Document{
   remaining : number;
   userId : string;
   currentPlan : string;
   createdAt : Date;
   updateAt : Date;
}


const creditSchema : Schema<Credit> = new mongoose.Schema({
    remaining : {type : Number},
    userId : {type : String},
    currentPlan : {type : String},
    createdAt : {type : Date , default : Date.now()},
    updateAt : {type : Date}
})


const creditModel = (mongoose.models.Credit as mongoose.Model<Credit>) || mongoose.model<Credit>("Credit",creditSchema);

export default creditModel;