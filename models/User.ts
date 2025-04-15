import mongoose,{Schema,Document} from 'mongoose';


interface User extends Document {
    name : string;
    email : string;
    image : string;
    createdAt : Date;
    updateAt : Date;
    profileCompleted : boolean;
    googleId : string;
    streamToken : string;
    age : number;
    gender : string;
    inRelation : string;
    zodiacSign : string;
}

const userSchema : Schema<User> = new mongoose.Schema({
   name : {type : String , required : true},
   email : {type : String , required : true, unique : true},
   image : {type: String},
    createdAt : {type : Date , default : Date.now},
    updateAt : {type : Date},
    profileCompleted : {type : Boolean , default : false},
    googleId : {type : String , required : true},
    streamToken : {type : String},
    age : {type : Number},
    gender : {type : String, enum :['male','female']},
    inRelation : {type : String, enum : ['single','in a relationship'], default: "single"},
    zodiacSign : {type : String, enum : ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']}
})


const userModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User',userSchema);

export default userModel;