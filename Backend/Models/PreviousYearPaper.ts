import mongoose, { Schema, Document } from 'mongoose';

export interface IPreviousYearPaper extends Document {
  PYPCategoryId: mongoose.Types.ObjectId;
  PaperTitle: string;
  PaperCode: string;
  Year: number;
  Stage: string;
  Shift: string;
  Language: string;
  TotalQuestions: number;
  TotalMarks: number;
  TimeDuration: number; // in minutes
  PaperFileUrl: string;
  Status: 'Active' | 'Inactive';
  CreatedBy: mongoose.Types.ObjectId;
}

const PreviousYearPaperSchema: Schema =
  new Schema<IPreviousYearPaper>(
    {
      PYPCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'PreviousYearPaperCategory',
        required: true,
      },

      PaperTitle: {
        type: String,
        required: true,
        trim: true,
      },

      PaperCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      Year: {
        type: Number,
        required: true,
      },

      Stage: {
        type: String,
        required: true,
        trim: true,
      },

      Shift: {
        type: String,
        required: true,
        trim: true,
      },

      Language: {
        type: String,
        required: true,
        trim: true,
      },

      TotalQuestions: {
        type: Number,
        required: true,
      },

      TotalMarks: {
        type: Number,
        required: true,
      },

      TimeDuration: {
        type: Number, // minutes
        required: true,
      },

      PaperFileUrl: {
        type: String,
        required: true,
      },

      Status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
      },

      CreatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    },
    { timestamps: true }
  );

const PreviousYearPaperModel =
  mongoose.model<IPreviousYearPaper>(
    'PreviousYearPaper',
    PreviousYearPaperSchema
  );

export default PreviousYearPaperModel;
