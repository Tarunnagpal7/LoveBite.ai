import mongoose,{Schema,Document} from "mongoose";


export interface TestQuestion extends Document {
    question_text: string;
    question_type: "MCQ" | "brief";
    options?: string[];
    createdAt: Date;
    updatedAt: Date;
  }


  const TestQuestionSchema: Schema<TestQuestion> = new mongoose.Schema({
    question_text: { 
      type: String, 
      required: true 
    },
    question_type: { 
      type: String, 
      enum: ['MCQ', 'brief'], 
      required: true 
    },
    options: [{ 
      type: String 
    }],
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    }
  }, {
    timestamps: true
  });


  const testquestionModel = mongoose.models.TestQuestion as mongoose.Model<TestQuestion> || mongoose.model<TestQuestion>('TestQuestion', TestQuestionSchema);

  export default testquestionModel;