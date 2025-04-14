import mongoose, { Schema, Document, Types } from "mongoose";

export interface ResultInsight extends Document {
  compatibilityId: Types.ObjectId;
  score: number;
  strengths: Array<{
    area: string;
    details: string;
  }>;
  weaknesses: Array<{
    area: string;
    details: string;
  }>;
  suggestions: Array<{
    title: string;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const resultInsightSchema: Schema<ResultInsight> = new mongoose.Schema({
  compatibilityId: { 
    type: Schema.Types.ObjectId,
    ref: 'Compatibility',
    required: true 
  },
  score: { 
    type: Number, 
    default : 0,
    required: true 
  },
  strengths: [{ 
    area: { type: String, required: true },
    details: { type: String, required: true }
  }],
  weaknesses: [{ 
    area: { type: String, required: true },
    details: { type: String, required: true }
  }],
  suggestions: [{ 
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],
}, {
  timestamps: true
});

const resultModel = mongoose.models.ResultInsight as mongoose.Model<ResultInsight> || mongoose.model<ResultInsight>('ResultInsight', resultInsightSchema);
export default resultModel;