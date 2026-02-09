import mongoose, { Schema, Document } from 'mongoose';

export interface IMonthlyCurrentAffairs extends Document {
  Month: string;

  PdfTitle?: string;
  PdfUrl?: string;

   Language: 'Hindi' | 'English';

  TeacherId: mongoose.Types.ObjectId;
  Status: 'Active' | 'Inactive';
  CreatedBy: mongoose.Types.ObjectId;
}




const MonthlyCurrentAffairsSchema: Schema = new Schema<IMonthlyCurrentAffairs>(
  {
    Month: { 
      type: String, 
      required: true, 
      trim: true 
    }, 
  

    PdfTitle: { type: String, trim: true },
    PdfUrl: { type: String, trim: true },


    TeacherId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Teacher', 
      required: true 
    },

    Status: { 
      type: String, 
      enum: ['Active', 'Inactive'], 
      default: 'Active' 
    },

    
    Language: { 
      type: String, 
      enum: ['Hindi', 'English']

    },

    CreatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
  },
  { timestamps: true }
);

const MonthlyCurrentAffairsModel = mongoose.model<IMonthlyCurrentAffairs>(
  'MonthlyCurrentAffairs',
  MonthlyCurrentAffairsSchema
);

export default MonthlyCurrentAffairsModel;
