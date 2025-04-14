  import mongoose, { Schema, Document,Types } from "mongoose";


  export interface Compatibility extends Document {
      relationshipId: Types.ObjectId ;
      test_status: "Completed" | "In Progress";
      score : number;
      user1_completed: boolean;
      user2_completed: boolean;
      createdAt: Date;
      updatedAt: Date;
    }

    

    const compatibilitySchema: Schema<Compatibility> = new mongoose.Schema({
      relationshipId: {
          type : Schema.Types.ObjectId,
          ref :'Relationship',
          required : true
      },
      score :{type : Number , default : 0},
      test_status: { 
        type: String, 
        enum: ['Completed', 'In Progress'], 
        default: 'In Progress' 
      },
      user1_completed: { 
        type: Boolean, 
        default: false 
      },
      user2_completed: { 
        type: Boolean, 
        default: false 
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


    const compatibilityModel = mongoose.models.Compatibility as mongoose.Model<Compatibility> || mongoose.model<Compatibility>('Compatibility', compatibilitySchema);

    export default compatibilityModel