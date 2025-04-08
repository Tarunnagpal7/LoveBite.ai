import mongoose,{Schema,Document} from "mongoose";

export  interface Package extends Document {
    name : string;
    price : number;
    description : string;
    features : string[],
    buttonText : string;
    popular : boolean;
    credit : number;
}

const packageSchema : Schema<Package> = new mongoose.Schema({
    name : { type : String, required : true},
    price : { type : Number , required : true},
    description : { type : String, required : true},
    features : [{ type : String, required : true}],
    buttonText : { type : String, required : true},
    popular : {type : Boolean , default : false},
    credit : {type : Number , required : true}
})


const packageModle = (mongoose.models.Package as mongoose.Model<Package>) || mongoose.model<Package>("Package",packageSchema);

export default packageModle