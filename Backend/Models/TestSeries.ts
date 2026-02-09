import mongoose, { Schema, Document, Types } from 'mongoose';

// 🔹 Interface
export interface ITestSeries extends Document {
  Title: string;
  Description: string;
  CategoryId?: Types.ObjectId;// Agr need  hogi to add krugi data bhi nhi 
  CourseId?: Types.ObjectId;// Agr need  hogi to add krugi data bhi nhi 
  Image: string;
  IsPaid: boolean;
  Price?: number;
  DiscountPrice?: number;
  ValidityDays?: number;
  TotalTests: number; // Can be auto calculated later
  TeacherId: Types.ObjectId;
  CreatedBy: Types.ObjectId;
  Status: 'Active' | 'Inactive';
  createdDate: Date;
  updatedDate: Date;
}

// 🔹 Schema
const TestSeriesSchema: Schema = new Schema<ITestSeries>(
  {
    Title: { type: String, required: true },
    Description: { type: String, required: true },

    CategoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },// Agr need  hogi to add krugi data bhi nhi 
    CourseId: { type: Schema.Types.ObjectId, ref: 'Course', default: null },// Agr need  hogi to add krugi data bhi nhi 

    Image: { type: String, default: '' },

    IsPaid: { type: Boolean, default: false },
    Price: { type: Number, default: 0 },
    DiscountPrice: { type: Number, default: 0 },
    ValidityDays: { type: Number, default: 0 },

    TotalTests: { type: Number, default: 0 }, // will update based on test papers

    TeacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    CreatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    Status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: {
      createdAt: 'createdDate',
      updatedAt: 'updatedDate',
    },
  }
);

// 🔹 Model
const TestSeriesModel = mongoose.model<ITestSeries>('TestSeries', TestSeriesSchema);
export default TestSeriesModel;
