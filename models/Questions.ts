import mongoose,{Schema,Document} from "mongoose";
// import { Content } from "next/font/google";
export type Reaction = "❤️" | "👍" | "👎" | "😂" | "🤔";

export interface Reply extends Document {
    _id : string;
  content: string;
  author: {
    _id: string;
    name: string;
    image: string;
  };
  reactions: {
    type: Reaction;
    users: string[];
  }[];
  createdAt: Date;
}

export interface Answer extends Document {
 _id : string;
  content: string;
  author: {
    _id: string;
    name: string;
    image: string;
  };
  reactions: {
    type: Reaction;
    users: string[];
  }[];
  replies: Reply[];
  createdAt: Date;
}

export interface Question extends Document {
  content: string;
  author: {
    _id: string;
    name: string;
    image: string;
  };
  tags: string[];
  upvotes: string[];
  answers: Answer[];
  createdAt: Date;
}

const ReplySchema: Schema<Reply> = new mongoose.Schema({
    content: {type : String, required : true},
    author : {
        _id : {type : String, required: true},
        name : {type : String, required: true},
        image : {type : String}
    },
    reactions :[{
        type : {type : String, enum : ['❤️','👍','👎','😂','🤔']},
        users : [{type : String}]
    }],
    createdAt : {type : Date, default : Date.now}
    
})

const AnswerSchema: Schema<Answer> = new mongoose.Schema({ 
    content : {type : String, required: true},
    author : {
        _id : {type : String, required: true},
        name : {type : String, required: true},
        image : {type : String}
    },
    reactions :[{
        type : {type : String, enum : ['❤️','👍','👎','😂','🤔']},
        users : [{type : String}]
    }],
    replies : [ReplySchema],
    createdAt : {type : Date, default : Date.now}
})

const QuestionSchema: Schema<Question> = new mongoose.Schema({
    content : {type : String, required: true},
    author : {
        _id : {type : String, required: true},
        name : {type : String, required: true},
        image : {type : String}
    },
    tags : [{type : String, required : true}],
    upvotes : [{type : String}],
    answers : [AnswerSchema],
    createdAt : {type : Date, default : Date.now}
})



const questionModel = (mongoose.models.Question as mongoose.Model<Question>) || mongoose.model<Question>('Question',QuestionSchema);

export default questionModel;