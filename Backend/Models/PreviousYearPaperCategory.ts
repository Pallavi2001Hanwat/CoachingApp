import mongoose, { Schema, Document } from 'mongoose';

export interface IPreviousYearPaperCategory extends Document {
  Title: string;
  Image: string;
  Status: 'Active' | 'Inactive';
  CreatedBy: mongoose.Types.ObjectId;
}

const PreviousYearPaperCategorySchema: Schema =
  new Schema<IPreviousYearPaperCategory>(
    {
      Title: {
        type: String,
        required: true,
        trim: true,
      },

      Image: {
        type: String, // Cloudinary / S3 URL
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

const PreviousYearPaperCategoryModel =
  mongoose.model<IPreviousYearPaperCategory>(
    'PreviousYearPaperCategory',
    PreviousYearPaperCategorySchema
  );

export default PreviousYearPaperCategoryModel;
