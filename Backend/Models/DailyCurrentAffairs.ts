import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyCurrentAffairs extends Document {
  Date: Date;
  Month: string;
  Title: string;

  PdfTitle?: string;
  PdfUrl?: string;

  VideoTitle?: string;
  VideoUrl?: string;

  TeacherId: mongoose.Types.ObjectId;
  Status: 'Active' | 'Inactive';
  CreatedBy: mongoose.Types.ObjectId;
}

const DailyCurrentAffairsSchema: Schema = new Schema<IDailyCurrentAffairs>(
  {
    Date: { type: Date, required: true },

    Month: { type: String, required: true, trim: true }, 
    // Example: "January 2026"

    Title: { 
      type: String, 
      required: true, 
      trim: true,
      default: 'Daily Current Affairs'
    },

    PdfTitle: { type: String, trim: true },
    PdfUrl: { type: String, trim: true },

    VideoTitle: { type: String, trim: true },
    VideoUrl: { type: String, trim: true },

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

    CreatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
  },
  { timestamps: true }
);

const DailyCurrentAffairsModel = mongoose.model<IDailyCurrentAffairs>(
  'DailyCurrentAffairs',
  DailyCurrentAffairsSchema
);

export default DailyCurrentAffairsModel;
