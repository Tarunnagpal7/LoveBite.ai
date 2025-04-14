import mongoose,{Schema,Document, Types} from "mongoose";

export interface TestResponse extends Document {
    compatibilityId:  Types.ObjectId;
    userId: Types.ObjectId;
    testquestionId:  Types.ObjectId;
    response_text?: string;
    selected_option?: string;
    createdAt: Date;
    updatedAt: Date;
  }

const testresponseSchema: Schema<TestResponse> = new mongoose.Schema({
    compatibilityId: { 
      type: Schema.Types.ObjectId,
      ref : "Compatibility",
      required: true 
    },
    userId: { 
      type: Schema.Types.ObjectId,
      ref : "User", 
      required: true 
    },
    testquestionId: { 
      type: Schema.Types.ObjectId,
      ref : "TestQuestion",
      required: true 
    },
    response_text: { 
      type: String 
    },
    selected_option: { 
      type: String 
    },
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
  

const testresponseModel = mongoose.models.Testresponse as mongoose.Model<TestResponse> || mongoose.model<TestResponse>("Testresponse", testresponseSchema);

export default testresponseModel;